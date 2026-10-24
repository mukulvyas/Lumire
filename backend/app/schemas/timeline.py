from typing import List, Optional
from pydantic import BaseModel, Field

class TaskItem(BaseModel):
    title: str
    phase: str
    due_date: str
    ai_tip: Optional[str] = None
    sort_order: Optional[int] = 0

class RunSheetItemSchema(BaseModel):
    start_time: str
    end_time: str
    title: str
    details: Optional[str] = None

class Timeline(BaseModel):
    tasks: List[TaskItem] = Field(min_length=1)
    run_sheet: List[RunSheetItemSchema] = Field(default_factory=list)
