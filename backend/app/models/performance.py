from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, Enum as SAEnum, Date
from app.db.base import Base
from app.models.base import TimestampMixin
import enum

class ReviewStatus(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    approved = "approved"

class PerformanceReview(Base, TimestampMixin):
    __tablename__ = "performance_reviews"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    review_period = Column(String(50), nullable=False)  # "2024-H1"
    rating = Column(Float, nullable=True)               # 1.0 - 5.0
    goals = Column(Text, nullable=True)
    achievements = Column(Text, nullable=True)
    feedback = Column(Text, nullable=True)
    status = Column(SAEnum(ReviewStatus), default=ReviewStatus.draft, nullable=False)
