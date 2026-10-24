from typing import List, Optional
from pydantic import BaseModel, Field

class BudgetCategoryItem(BaseModel):
    name: str
    planned: float = Field(ge=0)
    sort_order: Optional[int] = 0

class BudgetPlan(BaseModel):
    categories: List[BudgetCategoryItem] = Field(min_length=1)
