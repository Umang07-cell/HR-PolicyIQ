from sqlalchemy.orm import Session
from app.models.notification import Notification


def send_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: str = "info",
):
    n = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
    )
    db.add(n)
    db.commit()


def get_user_notifications(db: Session, user_id: int, unread_only: bool = False):
    q = db.query(Notification).filter(Notification.user_id == user_id)
    if unread_only:
        q = q.filter(Notification.is_read == False)
    return q.order_by(Notification.created_at.desc()).limit(50).all()


def mark_all_read(db: Session, user_id: int):
    db.query(Notification).filter(Notification.user_id == user_id).update(
        {"is_read": True}
    )
    db.commit()
