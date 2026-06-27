from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.core.audit import log_action
from app.models.user import User
from app.models.recruitment import JobPosting, Application, JobStatus, ApplicationStatus
from pydantic import BaseModel

router = APIRouter(prefix="/recruitment", tags=["Recruitment"])


class JobCreate(BaseModel):
    title: str
    department: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None


class JobOut(BaseModel):
    id: int
    title: str
    department: Optional[str]
    location: Optional[str]
    description: Optional[str]
    status: str
    model_config = {"from_attributes": True}


class ApplicationCreate(BaseModel):
    job_id: int
    candidate_name: str
    candidate_email: str
    notes: Optional[str] = None


class ApplicationOut(BaseModel):
    id: int
    job_id: int
    candidate_name: str
    candidate_email: str
    status: str
    notes: Optional[str]
    model_config = {"from_attributes": True}


@router.get("/jobs", response_model=List[JobOut], summary="List open job postings")
def list_jobs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(JobPosting).filter(JobPosting.status == JobStatus.open).order_by(JobPosting.id.desc()).all()


@router.post("/jobs", response_model=JobOut, summary="Create a job posting (HR Admin)")
def create_job(req: JobCreate, db: Session = Depends(get_db), current_user: User = Depends(require_role("hr_admin"))):
    job = JobPosting(
        title=req.title,
        department=req.department,
        location=req.location,
        description=req.description,
        requirements=req.requirements,
        created_by=current_user.id,
        status=JobStatus.open,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    log_action(db, current_user.id, "JOB_CREATE", "recruitment", str(job.id))
    return job


@router.patch("/jobs/{job_id}/close", response_model=JobOut, summary="Close a job posting")
def close_job(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_role("hr_admin"))):
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job.status = JobStatus.closed
    db.commit()
    db.refresh(job)
    return job


@router.post("/applications", response_model=ApplicationOut, summary="Submit a job application")
def apply(req: ApplicationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    job = db.query(JobPosting).filter(JobPosting.id == req.job_id, JobPosting.status == JobStatus.open).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found or closed")
    app = Application(
        job_id=req.job_id,
        candidate_name=req.candidate_name,
        candidate_email=req.candidate_email,
        notes=req.notes,
        status=ApplicationStatus.applied,
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    log_action(db, current_user.id, "JOB_APPLICATION", "recruitment", str(app.id))
    return app


@router.get("/applications", response_model=List[ApplicationOut], summary="All applications (HR Admin)")
def list_applications(job_id: Optional[int] = None, db: Session = Depends(get_db), _: User = Depends(require_role("hr_admin"))):
    q = db.query(Application)
    if job_id:
        q = q.filter(Application.job_id == job_id)
    return q.order_by(Application.id.desc()).all()
