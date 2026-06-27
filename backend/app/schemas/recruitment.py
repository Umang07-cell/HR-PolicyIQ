from pydantic import BaseModel
from typing import Optional
from app.models.recruitment import JobStatus, ApplicationStatus

class JobCreate(BaseModel):
    title: str
    department: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None

class ApplicationCreate(BaseModel):
    job_id: int
    candidate_name: str
    candidate_email: str
    notes: Optional[str] = None

class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus
    notes: Optional[str] = None

class JobOut(BaseModel):
    id: int
    title: str
    department: str | None
    location: str | None
    status: JobStatus
    model_config = {"from_attributes": True}
