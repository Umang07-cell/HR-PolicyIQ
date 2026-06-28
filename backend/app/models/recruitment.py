from sqlalchemy import Column, Integer, String, Text, ForeignKey, Enum as SAEnum, UniqueConstraint
from app.db.base import Base
from app.models.base import TimestampMixin
import enum


class JobStatus(str, enum.Enum):
    open = "open"
    closed = "closed"
    on_hold = "on_hold"


class ApplicationStatus(str, enum.Enum):
    applied = "applied"
    screening = "screening"
    interview = "interview"
    offer = "offer"
    hired = "hired"
    rejected = "rejected"


class JobPosting(Base, TimestampMixin):
    __tablename__ = "job_postings"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    department = Column(String(100), nullable=True)
    location = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    requirements = Column(Text, nullable=True)
    status = Column(SAEnum(JobStatus), default=JobStatus.open)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)


class Application(Base, TimestampMixin):
    __tablename__ = "applications"
    __table_args__ = (
        UniqueConstraint("job_id", "candidate_email", name="uq_application_job_candidate"),
    )

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("job_postings.id"), nullable=False, index=True)
    candidate_name = Column(String(255), nullable=False)
    candidate_email = Column(String(255), nullable=False)
    resume_path = Column(String(1000), nullable=True)
    status = Column(SAEnum(ApplicationStatus), default=ApplicationStatus.applied)
    notes = Column(Text, nullable=True)
