from pydantic import BaseModel
from typing import Optional
from app.models.performance import ReviewStatus

class ReviewCreate(BaseModel):
    employee_id: int
    review_period: str
    rating: Optional[float] = None
    goals: Optional[str] = None
    achievements: Optional[str] = None
    feedback: Optional[str] = None

class ReviewOut(BaseModel):
    id: int
    employee_id: int
    reviewer_id: int
    review_period: str
    rating: float | None
    status: ReviewStatus
    model_config = {"from_attributes": True}
