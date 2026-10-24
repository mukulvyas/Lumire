from fastapi import APIRouter, Depends, HTTPException
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
    userInput: str

class GenerateRequest(BaseModel):
    brief: EventBrief
    ownerId: Optional[str] = "00000000-0000-0000-0000-000000000001"

class ReviseRequest(BaseModel):
    currentPlanSnapshot: Dict[str, Any]
    userInstruction: str

class VendorQuestionsRequest(BaseModel):
    vendorName: str
    category: str
    budgetEstimate: float
    city: Optional[str] = "Destination City"

@router.post("/intake", response_model=EventBrief)
async def intake_endpoint(payload: IntakeRequest):
    if not payload.userInput.strip():
        raise HTTPException(status_code=400, detail="userInput is required")
    return await run_intake_pipeline(payload.userInput)

@router.post("/generate")
async def generate_endpoint(
    payload: GenerateRequest,
    db: AsyncSession = Depends(get_db)
):
    return await run_generate_plan_pipeline(payload.brief, payload.ownerId, db=db)

@router.post("/revise", response_model=RevisePlanResult)
async def revise_endpoint(payload: ReviseRequest):
    return await run_revise_plan_pipeline(payload.currentPlanSnapshot, payload.userInstruction)

@router.post("/vendor-questions", response_model=VendorQuestionsResponse)
async def vendor_questions_endpoint(payload: VendorQuestionsRequest):
    return await run_vendor_questions_pipeline(
        payload.vendorName,
        payload.category,
        payload.budgetEstimate,
        payload.city or "Destination City"
    )
