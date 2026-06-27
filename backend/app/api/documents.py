import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.core.audit import log_action
from app.core.config import settings
from app.models.user import User
from app.models.document import Document, DocumentStatus
from app.schemas.document import DocumentOut
from app.ingestion.parser import parse_document
from app.ingestion.chunker import chunk_pages
from app.ingestion.indexer import index_chunks

router = APIRouter(prefix="/documents", tags=["Documents"])


def _safe_filename(original: str) -> str:
    """BUG-19 fix: prevent path traversal via uploaded filename."""
    # Strip any directory components, add UUID prefix for uniqueness
    basename = os.path.basename(original).strip()
    if not basename:
        basename = "upload"
    # Remove characters that could cause issues
    safe = "".join(c for c in basename if c.isalnum() or c in "._- ")
    safe = safe.strip(". ")[:200] or "upload"
    return f"{uuid.uuid4().hex[:8]}_{safe}"


@router.post("/upload", response_model=DocumentOut, summary="Upload and index a document (HR Admin only)")
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    module: str = Form("policy"),
    description: Optional[str] = Form(None),
    access_roles: str = Form("employee,manager,hr_admin"),
    access_departments: str = Form(""),
    access_locations: str = Form(""),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("hr_admin", "executive"))
):
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    safe_name = _safe_filename(file.filename or "upload")
    file_path = os.path.join(settings.UPLOAD_DIR, safe_name)

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    roles = [r.strip() for r in access_roles.split(",") if r.strip()]
    depts = [d.strip() for d in access_departments.split(",") if d.strip()]
    locs  = [l.strip() for l in access_locations.split(",") if l.strip()]

    doc = Document(
        title=title, filename=safe_name, file_path=file_path,
        file_size=os.path.getsize(file_path), content_type=file.content_type,
        module=module, description=description,
        access_roles=roles, access_departments=depts, access_locations=locs,
        uploaded_by=current_user.id, status=DocumentStatus.draft
    )
    db.add(doc); db.commit(); db.refresh(doc)

    try:
        pages = parse_document(file_path, file.content_type)
        chunks = chunk_pages(pages)
        ids = index_chunks(chunks, doc.id, title, module, roles, depts, locs)
        doc.qdrant_ids = ids
        doc.chunk_count = len(ids)
        doc.is_indexed = True
        doc.status = DocumentStatus.published
        db.commit(); db.refresh(doc)
    except Exception as e:
        doc.is_indexed = False
        db.commit()
        raise HTTPException(status_code=500, detail=f"Indexing failed: {str(e)}")

    log_action(db, current_user.id, "DOCUMENT_UPLOAD", "document", str(doc.id),
               {"title": title, "chunks": len(ids)})
    return doc


@router.get("/", response_model=List[DocumentOut], summary="List all documents")
def list_documents(
    module: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Document)
    if module:
        q = q.filter(Document.module == module)
    return q.order_by(Document.created_at.desc()).all()


@router.get("/{doc_id}", response_model=DocumentOut, summary="Get document metadata")
def get_document(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.delete("/{doc_id}", summary="Archive a document (HR Admin only)")
def archive_document(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("hr_admin"))
):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    doc.status = DocumentStatus.archived
    db.commit()
    log_action(db, current_user.id, "DOCUMENT_ARCHIVE", "document", str(doc_id))
    return {"message": "Document archived"}
