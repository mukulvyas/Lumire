from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

class VendorItem(BaseModel):
    name: str
    category: str
    quote_amount: Optional[float] = 0.0
    status: Optional[str] = "contacted"
    note: Optional[str] = None
    contact: Optional[Dict[str, Any]] = Field(default_factory=dict)

class VendorChecklist(BaseModel):
    vendors: List[VendorItem] = Field(min_length=1)

class VendorQuestionItem(BaseModel):
    question: str
    priority: Literal["critical", "high", "standard"] = "standard"

class VendorQuestionsResponse(BaseModel):
    questions: List[VendorQuestionItem] = Field(min_length=2)
