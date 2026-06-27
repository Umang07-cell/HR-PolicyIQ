"""Reusable workflow nodes."""
from sqlalchemy.orm import Session

def check_leave_overlap(db: Session, employee_id: int, start, end) -> bool:
    from app.services.leave_service import check_overlap
    return check_overlap(db, employee_id, start, end)

def check_leave_balance(db: Session, employee_id: int, leave_type: str, days: int) -> bool:
    from app.services.leave_service import get_leave_balance
    from datetime import datetime
    balance = get_leave_balance(db, employee_id, datetime.now().year)
    remaining = balance.get(leave_type, {}).get("remaining", 0)
    return remaining >= days

def notify_approver(db: Session, approver_id: int, message: str):
    from app.services.notification_service import send_notification
    send_notification(db, approver_id, "Action Required", message, "approval")
