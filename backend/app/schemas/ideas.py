from typing import List, Optional, Literal
from pydantic import BaseModel, Field

class IdeaItem(BaseModel):
    kind: Literal["theme", "menu", "decor", "entertainment", "invitations", "gifts"]
    title: str
    reason: str
    est_cost: Optional[float] = 0.0
    image_url: Optional[str] = None
    saved: Optional[bool] = False

class IdeaSet(BaseModel):
    ideas: List[IdeaItem] = Field(min_length=1)
