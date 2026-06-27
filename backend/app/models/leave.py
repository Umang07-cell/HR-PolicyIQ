from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey, Enum as SAEnum
from app.db.base import Base
from app.models.base import TimestampMixin
import enum


class LeaveType(str, enum.Enum):
    casual = "casual"
    sick = "sick"
    earned = "earned"
    maternity = "maternity"
    paternity = "paternity"
    unpaid = "unpaid"


class LeaveStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    cancelled = "cancelled"


class LeaveRequest(Base, TimestampMixin):
    __tablename__ = "leave_requests"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    leave_type = Column(SAEnum(LeaveType), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    days = Column(Integer, nullable=False)
    reason = Column(Text, nullable=True)
    status = Column(SAEnum(LeaveStatus), default=LeaveStatus.pending, nullable=False)
    approver_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    approver_comment = Column(Text, nullable=True)
