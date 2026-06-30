from dataclasses import dataclass, field
from typing import Optional, List, Dict
from datetime import datetime

@dataclass
class OnboardingWorkflowState:
    employee_id: int
    completed_steps: List[str] = field(default_factory=list)
    pending_steps: List[str] = field(default_factory=list)
    documents_attested: List[int] = field(default_factory=list)
    is_complete: bool = False
