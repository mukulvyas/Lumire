from typing import List, Optional, Union, Literal
from pydantic import BaseModel, Field

class SetBudgetTotalOp(BaseModel):
    type: Literal["setBudgetTotal"]
    total_budget: float

class RebalanceCategoryOp(BaseModel):
    type: Literal["rebalanceCategory"]
    category_name: str
    amount: float

class ReplaceThemeOp(BaseModel):
    type: Literal["replaceTheme"]
    new_theme: str

class AddTaskOp(BaseModel):
    type: Literal["addTask"]
    title: str
    phase: str
    due_date: str

PatchOperation = Union[SetBudgetTotalOp, RebalanceCategoryOp, ReplaceThemeOp, AddTaskOp]

class PlanPatch(BaseModel):
    reasoning: str
    summary: Optional[str] = None
    operations: List[PatchOperation]

class PlanDiffItem(BaseModel):
    field: str
    before: Union[str, float, int]
    after: Union[str, float, int]
    changeType: Literal["modified", "added", "removed"]

class RevisePlanResult(BaseModel):
    success: bool = True
    patch: PlanPatch
    diffs: List[PlanDiffItem]
    proposedSnapshot: dict
