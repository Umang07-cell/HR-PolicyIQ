from pydantic import BaseModel, EmailStr
from typing import Optional


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
    candidate_email: EmailStr
    notes: Optional[str] = None


class ApplicationOut(BaseModel):
    id: int
    job_id: int
    candidate_name: str
    candidate_email: str
    status: str
    notes: Optional[str]
    model_config = {"from_attributes": True}
