from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey
from app.db.base import Base
from datetime import datetime

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(200), nullable=False)
    resource = Column(String(200), nullable=False)
    resource_id = Column(String(200), nullable=True)
    detail = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    # append-only: no UPDATE/DELETE allowed on this table
