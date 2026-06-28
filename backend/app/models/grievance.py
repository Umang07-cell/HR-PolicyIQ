from sqlalchemy import Column, Integer, String, Text, ForeignKey, Enum as SAEnum
from app.db.base import Base
from app.models.base import TimestampMixin
import enum


class GrievanceStatus(str, enum.Enum):
    submitted = "submitted"
    in_progress = "in_progress"
    resolved = "resolved"
    closed = "closed"


class GrievancePriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class Grievance(Base, TimestampMixin):
    __tablename__ = "grievances"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=True)
    status = Column(SAEnum(GrievanceStatus), default=GrievanceStatus.submitted, nullable=False)
    priority = Column(SAEnum(GrievancePriority), default=GrievancePriority.medium, nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    resolution_note = Column(Text, nullable=True)
