from sqlalchemy.orm import Session
from typing import Optional, Any
from app.models.audit_log import AuditLog


def log_action(
    db: Session,
    user_id: Optional[int],
    action: str,
    resource: str,
    resource_id: Optional[str] = None,
    detail: Optional[dict] = None,
):
    """Append-only audit log entry. Never updates or deletes."""
    try:
        entry = AuditLog(
            user_id=user_id,
            action=action,
            resource=resource,
            resource_id=resource_id,
            detail=detail or {},
        )
        db.add(entry)
        db.commit()
    except Exception:
        db.rollback()  # Don't let audit failure break the main request
