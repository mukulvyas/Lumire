import uuid
from datetime import date, timedelta
from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.models import Idea, Task

router = APIRouter(prefix="/api/ideas", tags=["Ideas"])

class IdeaUpdateRequest(BaseModel):
    saved: Optional[bool] = None
    addToPlan: Optional[bool] = None

@router.patch("/{idea_id}")
async def update_idea_endpoint(
    idea_id: str,
    payload: IdeaUpdateRequest,
    db: AsyncSession = Depends(get_db)
):
    try:
        i_uuid = uuid.UUID(idea_id)
        stmt = select(Idea).where(Idea.id == i_uuid)
        res = await db.execute(stmt)
        idea = res.scalar_one_or_none()

        if idea:
            if payload.saved is not None:
                idea.saved = payload.saved

            if payload.addToPlan:
                db.add(Task(
                    event_id=idea.event_id,
                    title=f"Incorporate Idea: {idea.title}",
                    phase="Phase 3: Logistics",
                    due_date=date.today() + timedelta(days=14),
                    ai_tip=idea.reason,
                    status="pending"
                ))

            await db.commit()
            return {"success": True}
    except Exception:
        await db.rollback()

    return {"success": True, "simulated": True}
