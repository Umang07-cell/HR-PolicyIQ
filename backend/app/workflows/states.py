from dataclasses import dataclass, field
from typing import Optional, List, Dict
from datetime import datetime

@dataclass
class LeaveWorkflowState:
    leave_id: int
    employee_id: int
    approver_id: Optional[int] = None
    status: str = "pending"
    days: int = 0
    has_overlap: bool = False
    balance_sufficient: bool = True
    history: List[str] = field(default_factory=list)

@dataclass
class GrievanceWorkflowState:
    grievance_id: int
    employee_id: int
    priority: str = "medium"
    assigned_to: Optional[int] = None
    status: str = "submitted"
    escalated: bool = False
    history: List[str] = field(default_factory=list)

@dataclass
class OnboardingWorkflowState:
    employee_id: int
    completed_steps: List[str] = field(default_factory=list)
    pending_steps: List[str] = field(default_factory=list)
    documents_attested: List[int] = field(default_factory=list)
    is_complete: bool = False
