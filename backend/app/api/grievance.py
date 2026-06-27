from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.core.audit import log_action
from app.models.user import User
from app.models.grievance import Grievance, GrievanceStatus, GrievancePriority
from app.schemas.grievance import GrievanceCreate, GrievanceUpdate, GrievanceOut

router = APIRouter(prefix="/grievance", tags=["Grievance"])


@router.post("/", response_model=GrievanceOut, summary="File a grievance")
def file_grievance(req: GrievanceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    g = Grievance(
        title=req.title,
        description=req.description,
        category=req.category,
        priority=req.priority,
        employee_id=current_user.id,
        status=GrievanceStatus.submitted,
    )
    db.add(g)
    db.commit()
    db.refresh(g)
    log_action(db, current_user.id, "GRIEVANCE_FILED", "grievance", str(g.id), {"title": req.title})
    return g


@router.get("/my", response_model=List[GrievanceOut], summary="My grievances")
def my_grievances(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Grievance).filter(Grievance.employee_id == current_user.id).order_by(Grievance.id.desc()).all()


@router.get("/all", response_model=List[GrievanceOut], summary="All grievances (HR Admin)")
def all_grievances(db: Session = Depends(get_db), _: User = Depends(require_role("hr_admin", "manager", "executive"))):
    return db.query(Grievance).order_by(Grievance.id.desc()).all()


@router.patch("/{grievance_id}", response_model=GrievanceOut, summary="Update grievance status")
def update_grievance(grievance_id: int, req: GrievanceUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_role("hr_admin", "manager"))):
    g = db.query(Grievance).filter(Grievance.id == grievance_id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Grievance not found")
    if req.status:
        g.status = req.status
    if req.resolution_note:
        g.resolution_note = req.resolution_note
    if req.assigned_to:
        g.assigned_to = req.assigned_to
    db.commit()
    db.refresh(g)
    log_action(db, current_user.id, "GRIEVANCE_UPDATE", "grievance", str(grievance_id), {"status": str(req.status)})
    return g
