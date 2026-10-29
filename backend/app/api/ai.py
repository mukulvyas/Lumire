import asyncio
import json
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from typing import Dict, Any, Optional
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.event_brief import EventBrief
from app.schemas.vendors import VendorQuestionsResponse
from app.schemas.patch import RevisePlanResult
from app.services.pipelines import (
    run_intake_pipeline,
    run_generate_plan_pipeline,
    run_revise_plan_pipeline,
    run_vendor_questions_pipeline,
)

router = APIRouter(prefix="/api/ai", tags=["AI"])

class IntakeRequest(BaseModel):
    userInput: Optional[str] = None
    prompt: Optional[str] = None

    @property
    def query(self) -> str:
        return (self.userInput or self.prompt or "").strip()

class GenerateRequest(BaseModel):
    brief: EventBrief
    ownerId: Optional[str] = "00000000-0000-0000-0000-000000000001"

class ReviseRequest(BaseModel):
    currentPlanSnapshot: Dict[str, Any]
    userInstruction: Optional[str] = None
    instruction: Optional[str] = None
    eventId: Optional[str] = None

    @property
    def text(self) -> str:
        return (self.userInstruction or self.instruction or "").strip()

class VendorQuestionsRequest(BaseModel):
    vendorName: str
    category: str
    budgetEstimate: float
    city: Optional[str] = "Destination City"

@router.post("/intake")
async def intake_endpoint(payload: IntakeRequest):
    query = payload.query
    if not query:
        raise HTTPException(status_code=400, detail="userInput or prompt is required")
    brief = await run_intake_pipeline(query)
    brief_data = brief.model_dump()
    return {
        **brief_data,
        "brief": brief_data,
        "success": True
    }

@router.post("/generate")
async def generate_endpoint(
    payload: GenerateRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    accept_header = request.headers.get("accept", "")
    
    # Non-SSE JSON return if explicitly requested
    if "text/event-stream" not in accept_header and accept_header == "application/json":
        return await run_generate_plan_pipeline(payload.brief, payload.ownerId, db=db)

    async def event_generator():
        yield f"data: {json.dumps({'progress': 20, 'message': 'Grounding against regional market rates...'})}\n\n"
        await asyncio.sleep(0.2)
        yield f"data: {json.dumps({'progress': 45, 'message': 'Allocating category budgets & vendor contingencies...'})}\n\n"
        await asyncio.sleep(0.2)

        try:
            plan_res = await run_generate_plan_pipeline(payload.brief, payload.ownerId, db=db)
            event_id = plan_res["eventId"]
            yield f"data: {json.dumps({'progress': 80, 'message': 'Synthesizing preparation milestones & run sheet...'})}\n\n"
            await asyncio.sleep(0.2)
            yield f"data: {json.dumps({'progress': 100, 'done': True, 'eventId': event_id, 'message': 'Celebration plan finalized!'})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.post("/revise", response_model=RevisePlanResult)
async def revise_endpoint(payload: ReviseRequest):
    instruction = payload.text
    if not instruction:
        raise HTTPException(status_code=400, detail="userInstruction or instruction is required")
    return await run_revise_plan_pipeline(payload.currentPlanSnapshot, instruction)

@router.post("/vendor-questions")
async def vendor_questions_endpoint(payload: VendorQuestionsRequest):
    res = await run_vendor_questions_pipeline(
        payload.vendorName,
        payload.category,
        payload.budgetEstimate,
        payload.city or "Destination City"
    )
    return {
        "success": True,
        "questions": [q.model_dump() for q in res.questions]
    }
