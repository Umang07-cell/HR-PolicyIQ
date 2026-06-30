from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey, Index
from app.db.base import Base
from datetime import datetime, timezone


def _now():
    return datetime.now(timezone.utc)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    action = Column(String(200), nullable=False, index=True)
    resource = Column(String(200), nullable=False)
    resource_id = Column(String(200), nullable=True)
    detail = Column(JSON, default=dict)
    timestamp = Column(DateTime(timezone=True), default=_now, nullable=False, index=True)

    __table_args__ = (
        Index("ix_audit_action_timestamp", "action", "timestamp"),
        Index("ix_audit_user_timestamp", "user_id", "timestamp"),
    )
