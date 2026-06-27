from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from app.models.leave import LeaveRequest, LeaveStatus
from app.models.grievance import Grievance, GrievanceStatus
from app.models.document import Document
from app.models.user import User

def get_hr_metrics(db: Session) -> dict:
    return {
        "total_employees": db.query(User).count(),
        "active_employees": db.query(User).filter(User.is_active == True).count(),
        "total_documents": db.query(Document).count(),
        "total_chat_queries": db.query(AuditLog).filter(AuditLog.action == "CHAT_QUERY").count(),
        "pending_leaves": db.query(LeaveRequest).filter(LeaveRequest.status == LeaveStatus.pending).count(),
        "open_grievances": db.query(Grievance).filter(Grievance.status == GrievanceStatus.submitted).count(),
    }
