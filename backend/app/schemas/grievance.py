from pydantic import BaseModel
from typing import Optional
from app.models.grievance import GrievancePriority, GrievanceStatus

class GrievanceCreate(BaseModel):
    title: str
    description: str
    category: Optional[str] = None
    priority: GrievancePriority = GrievancePriority.medium

class GrievanceUpdate(BaseModel):
    status: Optional[GrievanceStatus] = None
    resolution_note: Optional[str] = None
    assigned_to: Optional[int] = None

class GrievanceOut(BaseModel):
    id: int
    title: str
    category: str | None
    status: GrievanceStatus
    priority: GrievancePriority
    employee_id: int
    model_config = {"from_attributes": True}
