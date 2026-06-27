from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.grievance import Grievance, GrievanceStatus, GrievancePriority

def auto_assign_grievance(db: Session, grievance: Grievance) -> Optional[int]:
    """Auto-assign to first available HR admin."""
    from app.models.user import User, UserRole
    hr = db.query(User).filter(User.role == UserRole.hr_admin, User.is_active == True).first()
    if hr:
        grievance.assigned_to = hr.id
        db.commit()
        return hr.id
    return None

def escalate_if_needed(db: Session, grievance_id: int) -> bool:
    g = db.query(Grievance).filter(Grievance.id == grievance_id).first()
    if g and g.priority == GrievancePriority.critical and g.status == GrievanceStatus.submitted:
        g.status = GrievanceStatus.escalated
        db.commit()
        return True
    return False
