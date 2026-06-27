from pydantic import BaseModel
from typing import List, Optional
from app.models.document import DocumentStatus

class DocumentUploadMeta(BaseModel):
    title: str
    module: str = "policy"
    description: Optional[str] = None
    access_roles: List[str] = ["employee", "manager", "hr_admin"]
    access_departments: List[str] = []
    access_locations: List[str] = []

class DocumentOut(BaseModel):
    id: int
    title: str
    filename: str
    module: str | None
    version: int
    status: DocumentStatus
    chunk_count: int
    is_indexed: bool
    access_roles: list
    uploaded_by: int
    model_config = {"from_attributes": True}
