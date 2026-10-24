import uuid
from datetime import datetime, date, timedelta
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, desc, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.db.models import Event, BudgetCategory, Task, RunSheetItem, Vendor, Guest, Idea, PlanRevision

router = APIRouter(prefix="/api/events", tags=["Events"])

class PatchRequest(BaseModel):
    action: Optional[str] = "apply"  # "apply" | "undo"
    patch: Optional[Dict[str, Any]] = None
    currentSnapshot: Optional[Dict[str, Any]] = None

def compute_mock_event_details(event_id: str) -> Dict[str, Any]:
    """Generates realistic fallback data when event ID is not yet in DB."""
    event_date = (date.today() + timedelta(days=117)).strftime("%Y-%m-%d")
    total_budget = 1500000.0

    categories = [
        {"id": "cat-1", "event_id": event_id, "name": "Venue & Stay", "planned": 675000.0, "committed": 650000.0, "sort_order": 1, "status": "optimal"},
        {"id": "cat-2", "event_id": event_id, "name": "Catering & Bar", "planned": 380000.0, "committed": 360000.0, "sort_order": 2, "status": "optimal"},
        {"id": "cat-3", "event_id": event_id, "name": "Décor & Florals", "planned": 210000.0, "committed": 210000.0, "sort_order": 3, "status": "near_limit"},
        {"id": "cat-4", "event_id": event_id, "name": "Photography & Film", "planned": 115000.0, "committed": 100000.0, "sort_order": 4, "status": "optimal"},
        {"id": "cat-5", "event_id": event_id, "name": "Music & Experience", "planned": 40000.0, "committed": 40000.0, "sort_order": 5, "status": "optimal"},
        {"id": "cat-6", "event_id": event_id, "name": "Buffer / Contingency", "planned": 80000.0, "committed": 0.0, "sort_order": 6, "status": "unused"},
    ]

    tasks = [
        {
            "id": "task-1",
            "event_id": event_id,
            "title": "Finalize Entertainment & Musical Ensemble",
            "phase": "Phase 2: Experience",
            "due_date": (date.today() + timedelta(days=4)).strftime("%Y-%m-%d"),
            "status": "pending",
            "ai_tip": "Booking 3 months in advance ensures peak performance availability.",
            "category_id": "cat-5",
            "sort_order": 1,
        },
        {
            "id": "task-2",
            "event_id": event_id,
            "title": "Confirm Tasting Menu & Dietary Customizations",
            "phase": "Phase 2: Experience",
            "due_date": (date.today() + timedelta(days=10)).strftime("%Y-%m-%d"),
            "status": "pending",
            "ai_tip": "28 guests have noted dietary preferences in their RSVPs.",
            "category_id": "cat-2",
            "sort_order": 2,
        },
        {
            "id": "task-3",
            "event_id": event_id,
            "title": "Send Digital Invitations & Collect Travel Details",
            "phase": "Phase 3: Logistics",
            "due_date": (date.today() + timedelta(days=18)).strftime("%Y-%m-%d"),
            "status": "pending",
            "ai_tip": "Sending invitations at this milestone increases RSVP completion by 24%.",
            "category_id": None,
            "sort_order": 3,
        },
        {
            "id": "task-4",
            "event_id": event_id,
            "title": "Approve Floral Installations & Table Centerpieces",
            "phase": "Phase 3: Logistics",
            "due_date": (date.today() + timedelta(days=25)).strftime("%Y-%m-%d"),
            "status": "completed",
            "ai_tip": "Local seasonal blooms reduce transport emissions and cost by 15%.",
            "category_id": "cat-3",
            "sort_order": 4,
        },
        {
            "id": "task-5",
            "event_id": event_id,
            "title": "Sign Venue Contract and Lodge Deposit",
            "phase": "Phase 1: Foundation",
            "due_date": (date.today() - timedelta(days=10)).strftime("%Y-%m-%d"),
            "status": "completed",
            "ai_tip": "Foundation locked with Taj Jai Mahal Palace.",
            "category_id": "cat-1",
            "sort_order": 5,
        },
    ]

    vendors = [
        {"id": "v-1", "event_id": event_id, "category": "Venue & Stay", "name": "Taj Jai Mahal Palace Grounds", "status": "confirmed", "quote_amount": 650000.0, "note": "Courtyard & Banquet confirmed"},
        {"id": "v-2", "event_id": event_id, "category": "Catering & Bar", "name": "Royal Feast Caterers", "status": "quoted", "quote_amount": 360000.0, "note": "3 live artisan counters included"},
        {"id": "v-3", "event_id": event_id, "category": "Décor & Florals", "name": "Gulabi Marigold Studios", "status": "contacted", "quote_amount": 210000.0, "note": "Awaiting final CAD layout"},
        {"id": "v-4", "event_id": event_id, "category": "Photography & Film", "name": "Lumière Heritage Wedding Films", "status": "contacted", "quote_amount": 100000.0, "note": "Drone authorization verified"},
        {"id": "v-5", "event_id": event_id, "category": "Music & Experience", "name": "Jaipur Folk Ensemble & DJ", "status": "contacted", "quote_amount": 40000.0, "note": "Sunset shehnai + sound tech"},
    ]

    guests = [
        {"id": "g-1", "event_id": event_id, "name": "Aarav & Priya Sharma", "party_size": 2, "relation": "Close Friends", "dietary": "Vegetarian", "rsvp": "attending"},
        {"id": "g-2", "event_id": event_id, "name": "Vikramaditya Singhania", "party_size": 1, "relation": "Family", "dietary": "Jain", "rsvp": "attending"},
        {"id": "g-3", "event_id": event_id, "name": "Ananya & Rohan Mehta", "party_size": 2, "relation": "College Friends", "dietary": "None", "rsvp": "pending"},
        {"id": "g-4", "event_id": event_id, "name": "Devendra & Gayatri Rathore", "party_size": 4, "relation": "Family Elders", "dietary": "Traditional Rajasthani", "rsvp": "attending"},
        {"id": "g-5", "event_id": event_id, "name": "Siddharth Kapoor", "party_size": 1, "relation": "Colleague", "dietary": "Vegan", "rsvp": "declined"},
    ]

    ideas = [
        {"id": "i-1", "event_id": event_id, "kind": "decor", "title": "Sunset Diya Canopy", "reason": "Handcrafted earthen oil lamps create celestial ambiance without heavy plastic fabrication.", "est_cost": 25000.0, "saved": False},
        {"id": "i-2", "event_id": event_id, "kind": "gifts", "title": "Block-Printed Shawls for Guests", "reason": "Sourced directly from local Sanganer artisans; doubles as an unforgettable keepsake.", "est_cost": 35000.0, "saved": False},
        {"id": "i-3", "event_id": event_id, "kind": "menu", "title": "Artisanal Chai & Kachori Bar", "reason": "High-engagement arrival counter showcasing regional spices and local confectioners.", "est_cost": 15000.0, "saved": True},
    ]

    run_sheet = [
        {"id": "rs-1", "event_id": event_id, "start_time": "15:00", "end_time": "16:30", "title": "Baraat & Royal Welcome", "details": "Traditional dhol procession with rose petal shower."},
        {"id": "rs-2", "event_id": event_id, "start_time": "16:30", "end_time": "18:00", "title": "Varmala & Sunset Pheras", "details": "Courtyard mandap ceremony at golden hour."},
        {"id": "rs-3", "event_id": event_id, "start_time": "19:00", "end_time": "23:00", "title": "Royal Banquet & Sangeet Gala", "details": "Under candlelight arches with live fusion sitar performance."},
    ]

    committed = sum(c["committed"] for c in categories)
    completed_tasks = sum(1 for t in tasks if t["status"] == "completed")
    confirmed_guests = sum(g["party_size"] for g in guests if g["rsvp"] == "attending")

    return {
        "event": {
            "id": event_id,
            "owner_id": "00000000-0000-0000-0000-000000000001",
            "type": "wedding",
            "title": "Royal Palace Heritage Wedding",
            "event_date": event_date,
            "city": "Jaipur",
            "region_code": "IN-RJ",
            "guest_target": 150,
            "total_budget": total_budget,
            "currency": "INR",
            "locale": "en-IN",
            "preferences": {"style": "Regal Heritage & Intimate Luxury", "culture": "Rajasthani Royal Elegance"},
            "status": "planning",
        },
        "budgetCategories": categories,
        "tasks": tasks,
        "runSheetItems": run_sheet,
        "vendors": vendors,
        "guests": guests,
        "ideas": ideas,
        "computed": {
            "daysToGo": 117,
            "committedBudget": committed,
            "plannedBudget": total_budget,
            "totalBudget": total_budget,
            "confirmedGuests": confirmed_guests,
            "totalGuestsTarget": 150,
            "completedTasksCount": completed_tasks,
            "totalTasksCount": len(tasks),
            "taskCompletionRate": round((completed_tasks / len(tasks)) * 100),
            "budgetCommittedRate": round((committed / total_budget) * 100),
        }
    }

@router.get("/{event_id}")
async def get_event_endpoint(
    event_id: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        parsed_uuid = uuid.UUID(event_id)
        stmt = (
            select(Event)
            .where(Event.id == parsed_uuid)
            .options(
                selectinload(Event.budget_categories),
                selectinload(Event.tasks),
                selectinload(Event.run_sheet_items),
                selectinload(Event.vendors),
                selectinload(Event.guests),
                selectinload(Event.ideas)
            )
        )
        res = await db.execute(stmt)
        event = res.scalar_one_or_none()

        if event:
            categories = [
                {
                    "id": str(c.id),
                    "event_id": str(c.event_id),
                    "name": c.name,
                    "planned": float(c.planned),
                    "committed": float(c.committed),
                    "sort_order": c.sort_order,
                    "status": c.status
                }
                for c in event.budget_categories
            ]
            tasks_list = [
                {
                    "id": str(t.id),
                    "event_id": str(t.event_id),
                    "title": t.title,
                    "phase": t.phase,
                    "due_date": t.due_date.strftime("%Y-%m-%d"),
                    "status": t.status,
                    "ai_tip": t.ai_tip,
                    "category_id": str(t.category_id) if t.category_id else None,
                    "sort_order": t.sort_order
                }
                for t in event.tasks
            ]
            run_sheet = [
                {
                    "id": str(r.id),
                    "event_id": str(r.event_id),
                    "start_time": r.start_time.strftime("%H:%M"),
                    "end_time": r.end_time.strftime("%H:%M"),
                    "title": r.title,
                    "details": r.details
                }
                for r in event.run_sheet_items
            ]
            vendors_list = [
                {
                    "id": str(v.id),
                    "event_id": str(v.event_id),
                    "category": v.category,
                    "name": v.name,
                    "status": v.status,
                    "quote_amount": float(v.quote_amount),
                    "note": v.note,
                    "contact": v.contact
                }
                for v in event.vendors
            ]
            guests_list = [
                {
                    "id": str(g.id),
                    "event_id": str(g.event_id),
                    "name": g.name,
                    "party_size": g.party_size,
                    "relation": g.relation,
                    "dietary": g.dietary,
                    "rsvp": g.rsvp
                }
                for g in event.guests
            ]
            ideas_list = [
                {
                    "id": str(i.id),
                    "event_id": str(i.event_id),
                    "kind": i.kind,
                    "title": i.title,
                    "reason": i.reason,
                    "est_cost": float(i.est_cost),
                    "image_url": i.image_url,
                    "saved": i.saved
                }
                for i in event.ideas
            ]

            total_b = float(event.total_budget)
            committed_b = sum(c["committed"] for c in categories)
            confirmed_g = sum(g["party_size"] for g in guests_list if g["rsvp"] == "attending")
            completed_t = sum(1 for t in tasks_list if t["status"] == "completed")
            days_to_go = max(0, (event.event_date - date.today()).days)

            return {
                "event": {
                    "id": str(event.id),
                    "owner_id": str(event.owner_id),
                    "type": event.type,
                    "title": event.title,
                    "event_date": event.event_date.strftime("%Y-%m-%d"),
                    "city": event.city,
                    "region_code": event.region_code,
                    "guest_target": event.guest_target,
                    "total_budget": total_b,
                    "currency": event.currency,
                    "locale": event.locale,
                    "preferences": event.preferences,
                    "status": event.status
                },
                "budgetCategories": categories,
                "tasks": tasks_list,
                "runSheetItems": run_sheet,
                "vendors": vendors_list,
                "guests": guests_list,
                "ideas": ideas_list,
                "computed": {
                    "daysToGo": days_to_go,
                    "committedBudget": committed_b,
                    "plannedBudget": total_b,
                    "totalBudget": total_b,
                    "confirmedGuests": confirmed_g,
                    "totalGuestsTarget": event.guest_target,
                    "completedTasksCount": completed_t,
                    "totalTasksCount": len(tasks_list),
                    "taskCompletionRate": round((completed_t / max(1, len(tasks_list))) * 100),
                    "budgetCommittedRate": round((committed_b / max(1.0, total_b)) * 100)
                }
            }
    except Exception as e:
        pass

    return compute_mock_event_details(event_id)

@router.post("/{event_id}/patch")
async def patch_event_endpoint(
    event_id: str,
    payload: PatchRequest,
    db: AsyncSession = Depends(get_db)
):
    try:
        event_uuid = uuid.UUID(event_id)
        if payload.action == "undo":
            stmt = (
                select(PlanRevision)
                .where(PlanRevision.event_id == event_uuid)
                .order_by(desc(PlanRevision.created_at))
                .limit(1)
            )
            res = await db.execute(stmt)
            rev = res.scalar_one_or_none()
            if not rev:
                return {"success": True, "message": "No earlier revision to restore"}

            snapshot = rev.snapshot
            if "total_budget" in snapshot:
                ev_res = await db.execute(select(Event).where(Event.id == event_uuid))
                ev = ev_res.scalar_one_or_none()
                if ev:
                    ev.total_budget = snapshot["total_budget"]

            if "categories" in snapshot:
                for cat in snapshot["categories"]:
                    cat_res = await db.execute(
                        select(BudgetCategory).where(
                            and_(
                                BudgetCategory.event_id == event_uuid,
                                BudgetCategory.name == cat.get("name")
                            )
                        )
                    )
                    bc = cat_res.scalar_one_or_none()
                    if bc:
                        bc.planned = cat.get("planned", bc.planned)

            await db.delete(rev)
            await db.commit()
            return {"success": True, "restored": True}

        # Action: apply
        if payload.currentSnapshot:
            db.add(PlanRevision(
                event_id=event_uuid,
                snapshot=payload.currentSnapshot
            ))

        if payload.patch and "operations" in payload.patch:
            for op in payload.patch["operations"]:
                op_type = op.get("type")
                if op_type == "setBudgetTotal":
                    ev_res = await db.execute(select(Event).where(Event.id == event_uuid))
                    ev = ev_res.scalar_one_or_none()
                    if ev:
                        ev.total_budget = op.get("total_budget", ev.total_budget)
                elif op_type == "rebalanceCategory":
                    cat_res = await db.execute(
                        select(BudgetCategory).where(
                            and_(
                                BudgetCategory.event_id == event_uuid,
                                BudgetCategory.name == op.get("category_name")
                            )
                        )
                    )
                    bc = cat_res.scalar_one_or_none()
                    if bc:
                        bc.planned = op.get("amount", bc.planned)
                elif op_type == "addTask":
                    due_d = date.today() + timedelta(days=14)
                    try:
                        due_d = datetime.strptime(op.get("due_date", ""), "%Y-%m-%d").date()
                    except Exception:
                        pass
                    db.add(Task(
                        event_id=event_uuid,
                        title=op.get("title", "New Milestone"),
                        phase=op.get("phase", "Phase 2: Experience"),
                        due_date=due_d,
                        status="pending"
                    ))

            await db.commit()
            return {"success": True, "applied": True}
    except Exception as e:
        await db.rollback()

    return {"success": True, "simulated": True}
