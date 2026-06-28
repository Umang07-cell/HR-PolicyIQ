from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.core.dependencies import require_role
from app.models.user import User
from app.models.document import Document
from app.models.leave import LeaveRequest, LeaveStatus
from app.models.grievance import Grievance, GrievanceStatus
from app.models.audit_log import AuditLog

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def get_platform_stats(db: Session) -> dict:
    return {
        "total_users": db.query(User).count(),
        "total_documents": db.query(Document).count(),
        "indexed_documents": db.query(Document).filter(Document.is_indexed == True).count(),
        "pending_leaves": db.query(LeaveRequest).filter(LeaveRequest.status == LeaveStatus.pending).count(),
        "open_grievances": db.query(Grievance).filter(
            Grievance.status.in_([GrievanceStatus.submitted, GrievanceStatus.in_progress])
        ).count(),
        "total_queries": db.query(AuditLog).filter(AuditLog.action == "CHAT_QUERY").count(),
    }


@router.get("/overview", summary="High-level platform analytics")
def overview(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("hr_admin", "executive")),
):
    return get_platform_stats(db)


@router.get("/leave-trends", summary="Leave requests grouped by type")
def leave_trends(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("hr_admin", "executive")),
):
    rows = (
        db.query(LeaveRequest.leave_type, func.count(LeaveRequest.id), func.sum(LeaveRequest.days))
        .group_by(LeaveRequest.leave_type)
        .all()
    )
    return [{"leave_type": r[0], "count": r[1], "total_days": int(r[2] or 0)} for r in rows]


@router.get("/chat-usage", summary="Chat usage statistics")
def chat_usage(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("hr_admin", "executive")),
):
    total = db.query(AuditLog).filter(AuditLog.action == "CHAT_QUERY").count()
    top_users_raw = (
        db.query(AuditLog.user_id, func.count(AuditLog.id).label("queries"))
        .filter(AuditLog.action == "CHAT_QUERY")
        .group_by(AuditLog.user_id)
        .order_by(func.count(AuditLog.id).desc())
        .limit(10)
        .all()
    )
    return {
        "total_queries": total,
        "top_users": [{"user_id": r.user_id, "queries": r.queries} for r in top_users_raw],
    }
