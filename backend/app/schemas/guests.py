from typing import Optional
from pydantic import BaseModel

class GuestCreateRequest(BaseModel):
    event_id: str
    name: str
    party_size: Optional[int] = 1
    relation: Optional[str] = None
    dietary: Optional[str] = None
    rsvp: Optional[str] = "pending"
    table_id: Optional[str] = None

class GuestUpdateRequest(BaseModel):
    name: Optional[str] = None
    party_size: Optional[int] = None
    relation: Optional[str] = None
    dietary: Optional[str] = None
    rsvp: Optional[str] = None
    table_id: Optional[str] = None
