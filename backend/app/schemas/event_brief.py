from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

class Preferences(BaseModel):
    style: Optional[str] = None
    culture: Optional[str] = None
    theme: Optional[str] = None
    dietary_notes: Optional[str] = None

class EventBrief(BaseModel):
    title: str = Field(default="Celebration Plan")
    type: Literal["wedding", "birthday", "community"] = Field(default="wedding")
    event_date: str = Field(default="2027-02-14", pattern=r"^\d{4}-\d{2}-\d{2}$")
    city: str = Field(default="Destination City")
    region_code: str = Field(default="IN-RJ")
    guest_target: int = Field(default=150, gt=0)
    total_budget: float = Field(default=1500000.0, gt=0)
    currency: str = Field(default="INR")
    locale: str = Field(default="en-IN")
    preferences: Preferences = Field(default_factory=Preferences)
    missing_fields: List[str] = Field(default_factory=list)
    clarifying_questions: List[str] = Field(default_factory=list)
