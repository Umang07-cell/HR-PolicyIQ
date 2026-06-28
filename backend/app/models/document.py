from sqlalchemy import Column, Integer, String, Text, Boolean, JSON, ForeignKey, Enum as SAEnum
from app.db.base import Base
from app.models.base import TimestampMixin
import enum


class DocumentStatus(str, enum.Enum):
    draft = "draft"
    processing = "processing"
    published = "published"
    archived = "archived"


class Document(Base, TimestampMixin):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    filename = Column(String(500), nullable=False)
    file_path = Column(String(1000), nullable=False)
    file_size = Column(Integer, nullable=True)
    content_type = Column(String(100), nullable=True)
    module = Column(String(50), nullable=True, default="policy", index=True)
    description = Column(Text, nullable=True)
    version = Column(Integer, default=1, nullable=False)
    status = Column(SAEnum(DocumentStatus), default=DocumentStatus.draft, index=True)
    is_indexed = Column(Boolean, default=False, nullable=False, index=True)
    chunk_count = Column(Integer, default=0)
    qdrant_ids = Column(JSON, default=list)
    access_roles = Column(JSON, default=list)
    access_departments = Column(JSON, default=list)
    access_locations = Column(JSON, default=list)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
