import asyncio
import json
import logging
from datetime import datetime, date, timedelta, time
from pathlib import Path
from typing import Dict, Any, List, Optional
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.schemas.event_brief import EventBrief
from app.schemas.budget import BudgetPlan
from app.schemas.timeline import Timeline
from app.schemas.vendors import VendorChecklist, VendorQuestionsResponse
from app.schemas.ideas import IdeaSet
from app.schemas.patch import PlanPatch, PlanDiffItem, RevisePlanResult
from app.services.gemini import gemini_service
from app.services.budget_math import rebalance_budget
from app.db.models import (
    Event, BudgetCategory, Task, RunSheetItem, Vendor, Idea, PriceBenchmark, EventTemplate
)

logger = logging.getLogger(__name__)

INTAKE_SYSTEM_PROMPT = """You are Lumière's Lead Event Architect.
Your task is to extract a structured EventBrief from the user's plain language description of a celebration.
You must return a valid JSON object matching the EventBrief schema.

Rules:
1. Identify the event type: 'wedding', 'birthday', or 'community'.
2. Extract or infer:
   - title: e.g. "Royal Heritage Celebration" or "50th Milestone Birthday Gala"
   - event_date: formatted as YYYY-MM-DD. Must NOT be in the past.
   - city: Target city or destination region.
   - guest_target: Number of guests (integer). Default to 150 if unspecified.
   - total_budget: Total budget amount in INR (numeric). Default to 1500000 if unspecified.
   - preferences: Extracted style, culture, theme notes.
3. If crucial fields (exact date, budget, guest count) are vague or missing:
   - List them in missing_fields array.
   - Generate up to 2 polite clarifying questions in clarifying_questions array.
4. Output strictly valid JSON."""

GENERATE_PLAN_SYSTEM_PROMPT = """You are Lumière's Elite Celebration Master Planner.
Your purpose is to architect high-craft, culturally grounded celebration masterplans.
Produce authentic, realistic, itemized event plans. Output strictly valid JSON."""

REVISE_PLAN_SYSTEM_PROMPT = """You are Lumière's Revision Architect.
Analyze the user's instruction and the current plan snapshot.
Produce a PlanPatch containing the exact operations to modify total budget, rebalance categories, change theme, or add tasks."""

VENDOR_QUESTIONS_SYSTEM_PROMPT = """You are a seasoned event negotiator and production director.
Provide critical, high-value discovery questions that an event host must ask this specific vendor category before signing contracts."""

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
if not DATA_DIR.exists():
    DATA_DIR = Path(__file__).resolve().parent.parent.parent.parent / "data"

async def run_intake_pipeline(user_input: str) -> EventBrief:
    today_str = datetime.now().strftime("%Y-%m-%d")
    user_prompt = f"Today's Date: {today_str}\n\nUser Input: \"{user_input}\"\n\nExtract the structured EventBrief JSON:"
    return await gemini_service.generate_structured(
        EventBrief,
        INTAKE_SYSTEM_PROMPT,
        user_prompt,
        temperature=0.1
    )

async def run_generate_plan_pipeline(
    brief: EventBrief,
    owner_id: str,
    db: Optional[AsyncSession] = None
) -> Dict[str, Any]:
    today_str = datetime.now().strftime("%Y-%m-%d")
    
    # Grounding fallback from data/benchmarks or DB
    benchmarks_data = []
    blueprint_data = None

    if db:
        try:
            stmt = select(PriceBenchmark).where(
                and_(
                    PriceBenchmark.region == brief.city,
                    PriceBenchmark.event_type == brief.type
                )
            )
            res = await db.execute(stmt)
            benchmarks_data = [row.__dict__ for row in res.scalars().all()]
        except Exception as e:
            logger.info("DB benchmark query fallback: %s", str(e))

    # Fallback to local files if empty
    if not benchmarks_data:
        benchmark_file = DATA_DIR / "benchmarks" / f"{brief.city.lower()}.json"
        if benchmark_file.exists():
            try:
                benchmarks_data = json.loads(benchmark_file.read_text(encoding="utf-8"))
            except Exception:
                pass

    budget_prompt = f"""Event Brief: {brief.model_dump_json()}
Regional Benchmarks: {json.dumps(benchmarks_data)}
Generate the full itemized budget split across all 5-7 core categories summing to {brief.total_budget}."""

    timeline_prompt = f"""Event Brief: {brief.model_dump_json()}
Today's Date: {today_str}
Generate backward-planned preparation tasks and a day-of run sheet schedule."""

    vendors_prompt = f"""Event Brief: {brief.model_dump_json()}
Generate curated vendor shortlist with realistic quote estimates and status."""

    ideas_prompt = f"""Event Brief: {brief.model_dump_json()}
Generate 3-6 creative sensory ideas across decor, entertainment, gifts, and menu."""

    # Parallel LLM synthesis
    raw_budget, raw_timeline, raw_vendors, raw_ideas = await asyncio.gather(
        gemini_service.generate_structured(BudgetPlan, GENERATE_PLAN_SYSTEM_PROMPT, budget_prompt),
        gemini_service.generate_structured(Timeline, GENERATE_PLAN_SYSTEM_PROMPT, timeline_prompt),
        gemini_service.generate_structured(VendorChecklist, GENERATE_PLAN_SYSTEM_PROMPT, vendors_prompt),
        gemini_service.generate_structured(IdeaSet, GENERATE_PLAN_SYSTEM_PROMPT, ideas_prompt),
    )

    # 1. Deterministic budget rebalancing
    categories_dict = [c.model_dump() for c in raw_budget.categories]
    rebalanced = rebalance_budget(brief.total_budget, categories_dict)
    validated_budget = {
        "categories": [
            {"name": c["name"], "planned": c["planned"], "sort_order": i + 1}
            for i, c in enumerate(rebalanced)
        ]
    }

    # 2. Validate timeline chronology
    try:
        event_date_obj = datetime.strptime(brief.event_date, "%Y-%m-%d").date()
    except Exception:
        event_date_obj = date.today() + timedelta(days=120)

    validated_tasks = []
    for i, t in enumerate(raw_timeline.tasks):
        try:
            task_date = datetime.strptime(t.due_date, "%Y-%m-%d").date()
            if task_date < date.today() or task_date > event_date_obj:
                task_date = event_date_obj - timedelta(days=14)
        except Exception:
            task_date = event_date_obj - timedelta(days=14)
        
        validated_tasks.append({
            "title": t.title,
            "phase": t.phase,
            "due_date": task_date.strftime("%Y-%m-%d"),
            "ai_tip": t.ai_tip,
            "sort_order": i + 1
        })

    event_id = str(uuid.uuid4())

    # 3. Save to database if session available
    if db:
        try:
            owner_uuid = uuid.UUID(owner_id) if owner_id else uuid.uuid4()
            event_uuid = uuid.UUID(event_id)

            new_event = Event(
                id=event_uuid,
                owner_id=owner_uuid,
                type=brief.type,
                title=brief.title,
                event_date=event_date_obj,
                city=brief.city,
                region_code=brief.region_code,
                guest_target=brief.guest_target,
                total_budget=brief.total_budget,
                currency=brief.currency,
                locale=brief.locale,
                preferences=brief.preferences.model_dump(),
                status="planning"
            )
            db.add(new_event)

            for c in validated_budget["categories"]:
                db.add(BudgetCategory(
                    event_id=event_uuid,
                    name=c["name"],
                    planned=c["planned"],
                    committed=0.0,
                    sort_order=c["sort_order"],
                    status="optimal"
                ))

            for t in validated_tasks:
                db.add(Task(
                    event_id=event_uuid,
                    title=t["title"],
                    phase=t["phase"],
                    due_date=datetime.strptime(t["due_date"], "%Y-%m-%d").date(),
                    ai_tip=t["ai_tip"],
                    status="pending",
                    sort_order=t["sort_order"]
                ))

            for r in raw_timeline.run_sheet:
                try:
                    st = datetime.strptime(r.start_time, "%H:%M").time()
                    et = datetime.strptime(r.end_time, "%H:%M").time()
                except Exception:
                    st, et = time(18, 0), time(22, 0)
                db.add(RunSheetItem(
                    event_id=event_uuid,
                    start_time=st,
                    end_time=et,
                    title=r.title,
                    details=r.details
                ))

            for v in raw_vendors.vendors:
                db.add(Vendor(
                    event_id=event_uuid,
                    category=v.category,
                    name=v.name,
                    status=v.status or "contacted",
                    quote_amount=v.quote_amount or 0.0,
                    note=v.note,
                    contact=v.contact or {}
                ))

            for idea in raw_ideas.ideas:
                db.add(Idea(
                    event_id=event_uuid,
                    kind=idea.kind,
                    title=idea.title,
                    reason=idea.reason,
                    est_cost=idea.est_cost or 0.0,
                    image_url=idea.image_url,
                    saved=idea.saved or False
                ))

            await db.commit()
        except Exception as e:
            logger.warning("DB insertion note: %s", str(e))
            await db.rollback()

    return {
        "eventId": event_id,
        "brief": brief.model_dump(),
        "budget": validated_budget,
        "timeline": {
            "tasks": validated_tasks,
            "run_sheet": [r.model_dump() for r in raw_timeline.run_sheet]
        },
        "vendors": [v.model_dump() for v in raw_vendors.vendors],
        "ideas": [i.model_dump() for i in raw_ideas.ideas]
    }

async def run_revise_plan_pipeline(
    current_plan_snapshot: Dict[str, Any],
    user_instruction: str
) -> RevisePlanResult:
    today_str = datetime.now().strftime("%Y-%m-%d")
    user_prompt = f"""Current Plan: {json.dumps(current_plan_snapshot)}
User Request: "{user_instruction}"
Today's Date: {today_str}

Provide the PlanPatch operations:"""

    patch = await gemini_service.generate_structured(
        PlanPatch,
        REVISE_PLAN_SYSTEM_PROMPT,
        user_prompt
    )

    diffs: List[PlanDiffItem] = []
    proposed = json.loads(json.dumps(current_plan_snapshot))

    for op in patch.operations:
        if op.type == "setBudgetTotal":
            diffs.append(PlanDiffItem(
                field="Total Budget",
                before=current_plan_snapshot.get("total_budget", 0),
                after=op.total_budget,
                changeType="modified"
            ))
            proposed["total_budget"] = op.total_budget
        elif op.type == "rebalanceCategory":
            categories = current_plan_snapshot.get("categories", [])
            existing = next((c for c in categories if c.get("name") == op.category_name), None)
            diffs.append(PlanDiffItem(
                field=op.category_name,
                before=existing.get("planned", 0) if existing else 0,
                after=op.amount,
                changeType="modified" if existing else "added"
            ))
            for cat in proposed.get("categories", []):
                if cat.get("name") == op.category_name:
                    cat["planned"] = op.amount
        elif op.type == "replaceTheme":
            diffs.append(PlanDiffItem(
                field="Theme",
                before=current_plan_snapshot.get("theme", "Standard"),
                after=op.new_theme,
                changeType="modified"
            ))
            proposed["theme"] = op.new_theme
        elif op.type == "addTask":
            diffs.append(PlanDiffItem(
                field=f"New Task: {op.title}",
                before="None",
                after=op.due_date,
                changeType="added"
            ))

    if not patch.summary:
        patch.summary = patch.reasoning

    return RevisePlanResult(
        success=True,
        patch=patch,
        diffs=diffs,
        proposedSnapshot=proposed
    )

async def run_vendor_questions_pipeline(
    vendor_name: str,
    category: str,
    budget_estimate: float,
    city: str = "Local Destination"
) -> VendorQuestionsResponse:
    prompt = f"Vendor: {vendor_name}\nCategory: {category}\nEstimated Quote: ₹{budget_estimate}\nCity: {city}"
    return await gemini_service.generate_structured(
        VendorQuestionsResponse,
        VENDOR_QUESTIONS_SYSTEM_PROMPT,
        prompt
    )
