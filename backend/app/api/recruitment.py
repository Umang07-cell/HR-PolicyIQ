from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
from app.db.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.core.audit import log_action
from app.models.user import User
from app.models.recruitment import JobPosting, Application, JobStatus, ApplicationStatus
from app.schemas.recruitment import JobCreate, JobOut, ApplicationCreate, ApplicationOut

router = APIRouter(prefix="/recruitment", tags=["Recruitment"])


@router.get("/jobs", response_model=List[JobOut], summary="List open job postings")
def list_jobs(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    limit = min(limit, 100)
    return (
        db.query(JobPosting)
        .filter(JobPosting.status == JobStatus.open)
        .order_by(JobPosting.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.post("/jobs", response_model=JobOut, summary="Create a job posting (HR Admin)")
def create_job(
    req: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("hr_admin")),
):
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
def close_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("hr_admin")),
):
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job.status = JobStatus.closed
    db.commit()
    db.refresh(job)
    return job


@router.post("/applications", response_model=ApplicationOut, summary="Submit a job application")
def apply(
    req: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = db.query(JobPosting).filter(
        JobPosting.id == req.job_id,
        JobPosting.status == JobStatus.open,
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found or closed")

    application = Application(
        job_id=req.job_id,
        candidate_name=req.candidate_name,
        candidate_email=req.candidate_email.lower().strip(),
        notes=req.notes,
        status=ApplicationStatus.applied,
    )
    db.add(application)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Application already submitted for this job.")
    db.refresh(application)
    log_action(db, current_user.id, "JOB_APPLICATION", "recruitment", str(application.id))
    return application


@router.get("/applications", response_model=List[ApplicationOut], summary="All applications (HR Admin)")
def list_applications(
    job_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("hr_admin")),
):
    limit = min(limit, 200)
    q = db.query(Application)
    if job_id:
        q = q.filter(Application.job_id == job_id)
    return q.order_by(Application.id.desc()).offset(skip).limit(limit).all()
