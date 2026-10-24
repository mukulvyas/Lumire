from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class ComputedStats(BaseModel):
    daysToGo: int
    committedBudget: float
    plannedBudget: float
    totalBudget: float
    confirmedGuests: int
    totalGuestsTarget: int
    completedTasksCount: int
    totalTasksCount: int
    taskCompletionRate: int
    budgetCommittedRate: int

class EventFullResponse(BaseModel):
    event: Dict[str, Any]
    budgetCategories: List[Dict[str, Any]]
    tasks: List[Dict[str, Any]]
    runSheetItems: List[Dict[str, Any]]
    vendors: List[Dict[str, Any]]
    guests: List[Dict[str, Any]]
    ideas: List[Dict[str, Any]]
    computed: ComputedStats
