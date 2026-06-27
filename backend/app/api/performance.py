from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.core.audit import log_action
from app.models.user import User
from app.models.performance import PerformanceReview, ReviewStatus
from app.schemas.performance import ReviewCreate, ReviewOut

router = APIRouter(prefix="/performance", tags=["Performance Management"])


@router.get("/my", response_model=List[ReviewOut], summary="My performance reviews")
def my_reviews(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(PerformanceReview).filter(PerformanceReview.employee_id == current_user.id).order_by(PerformanceReview.id.desc()).all()


@router.get("/team", response_model=List[ReviewOut], summary="Team reviews (Manager)")
def team_reviews(db: Session = Depends(get_db), current_user: User = Depends(require_role("manager", "hr_admin"))):
    return db.query(PerformanceReview).filter(PerformanceReview.reviewer_id == current_user.id).order_by(PerformanceReview.id.desc()).all()


@router.post("/review", response_model=ReviewOut, summary="Create a performance review")
def create_review(req: ReviewCreate, db: Session = Depends(get_db), current_user: User = Depends(require_role("manager", "hr_admin"))):
    employee = db.query(User).filter(User.id == req.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    existing = db.query(PerformanceReview).filter(
        PerformanceReview.employee_id == req.employee_id,
        PerformanceReview.reviewer_id == current_user.id,
        PerformanceReview.review_period == req.review_period,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Review already exists for this period")
    review = PerformanceReview(
        employee_id=req.employee_id,
        reviewer_id=current_user.id,
        review_period=req.review_period,
        rating=req.rating,
        goals=req.goals,
        achievements=req.achievements,
        feedback=req.feedback,
        status=ReviewStatus.draft,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    log_action(db, current_user.id, "REVIEW_CREATE", "performance", str(review.id))
    return review


@router.post("/{review_id}/submit", response_model=ReviewOut, summary="Submit a draft review")
def submit_review(review_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_role("manager", "hr_admin"))):
    review = db.query(PerformanceReview).filter(PerformanceReview.id == review_id, PerformanceReview.reviewer_id == current_user.id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    review.status = ReviewStatus.submitted
    db.commit()
    db.refresh(review)
    log_action(db, current_user.id, "REVIEW_SUBMIT", "performance", str(review_id))
    return review
