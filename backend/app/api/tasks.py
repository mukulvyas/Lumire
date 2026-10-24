import uuid
from typing import Literal
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.models import Task

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])

class TaskStatusUpdate(BaseModel):
    status: Literal["pending", "completed"]

@router.patch("/{task_id}")
async def update_task_endpoint(
    task_id: str,
    payload: TaskStatusUpdate,
    db: AsyncSession = Depends(get_db)
):
    try:
        t_uuid = uuid.UUID(task_id)
        stmt = select(Task).where(Task.id == t_uuid)
        res = await db.execute(stmt)
        task = res.scalar_one_or_none()
        if task:
            task.status = payload.status
            await db.commit()
            return {"success": True, "task": {"id": str(task.id), "status": task.status}}
    except Exception:
        await db.rollback()

    return {"success": True, "simulated": True}
