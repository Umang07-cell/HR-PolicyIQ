from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, Index
from app.db.base import Base
from app.models.base import TimestampMixin


class Notification(Base, TimestampMixin):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=True)
    is_read = Column(Boolean, default=False, index=True)
    notification_type = Column(String(50), default="info", index=True)
