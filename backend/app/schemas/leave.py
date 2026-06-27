from pydantic import BaseModel
from datetime import date
from typing import Optional
from app.models.leave import LeaveType, LeaveStatus

class LeaveRequestCreate(BaseModel):
    leave_type: LeaveType
    start_date: date
    end_date: date
    reason: Optional[str] = None

class LeaveApprovalAction(BaseModel):
    action: str  # "approve" | "reject"
    comment: Optional[str] = None

class LeaveOut(BaseModel):
    id: int
    employee_id: int
    leave_type: LeaveType
    start_date: date
    end_date: date
    days: int
    status: LeaveStatus
    reason: str | None
    approver_comment: str | None
    model_config = {"from_attributes": True}
