import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.core.audit import log_action
from app.core.config import settings, ALLOWED_MODULES
from app.models.user import User
from app.models.document import Document, DocumentStatus
from app.schemas.document import DocumentOut

router = APIRouter(prefix="/documents", tags=["Documents"])

ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
}

MAGIC_BYTES = {
    b"%PDF": "application/pdf",
    b"PK\x03\x04": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


def _safe_filename(original: str) -> str:
    basename = os.path.basename(original).strip()
    if not basename:
        basename = "upload"
    safe = "".join(c for c in basename if c.isalnum() or c in "._- ")
    safe = safe.strip(". ")[:200] or "upload"
    return f"{uuid.uuid4().hex[:8]}_{safe}"


def _validate_magic_bytes(file_path: str, declared_content_type: str) -> bool:
    try:
        with open(file_path, "rb") as f:
            header = f.read(8)
        for magic, mime in MAGIC_BYTES.items():
            if header.startswith(magic):
                return True
        if declared_content_type == "text/plain":
            return True
        return False
    except Exception:
        return False


@router.post("/upload", response_model=DocumentOut, status_code=202, summary="Upload a document (HR Admin only)")
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    module: str = Form("policy"),
    description: Optional[str] = Form(None),
    access_roles: str = Form("employee,manager,hr_admin"),
    access_departments: str = Form(""),
    access_locations: str = Form(""),
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("hr_admin", "executive")),
):
    if module not in ALLOWED_MODULES:
        raise HTTPException(status_code=400, detail=f"Invalid module. Allowed: {sorted(ALLOWED_MODULES)}")

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=415, detail=f"Unsupported file type: {file.content_type}")

    # Check size first before reading
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if hasattr(file, 'size') and file.size and file.size > max_bytes:
        raise HTTPException(status_code=413, detail=f"File too large. Max {settings.MAX_FILE_SIZE_MB}MB.")

    # Read in chunks to avoid memory exhaustion
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    safe_name = _safe_filename(file.filename or "upload")
    file_path = os.path.join(settings.UPLOAD_DIR, safe_name)

    bytes_read = 0
    with open(file_path, "wb") as f:
        while chunk := await file.read(8192):
            bytes_read += len(chunk)
            if bytes_read > max_bytes:
                f.close()
                os.remove(file_path)
                raise HTTPException(status_code=413, detail=f"File too large. Max {settings.MAX_FILE_SIZE_MB}MB.")
            f.write(chunk)

    if not _validate_magic_bytes(file_path, file.content_type):
        os.remove(file_path)
        raise HTTPException(status_code=415, detail="File content does not match declared type.")

    # Duplicate guard: same title + identical byte size among non-archived documents is
    # almost certainly a re-upload of the same file. Reject to avoid duplicate vectors.
    existing = (
        db.query(Document)
        .filter(
            Document.status != DocumentStatus.archived,
            Document.title == title,
            Document.file_size == bytes_read,
        )
        .first()
    )
    if existing:
        os.remove(file_path)
        raise HTTPException(
            status_code=409,
            detail=f"A document with the same title and size already exists (id={existing.id}). "
                   f"Delete or archive it first to re-upload.",
        )

    roles = [r.strip() for r in access_roles.split(",") if r.strip()]
    depts = [d.strip() for d in access_departments.split(",") if d.strip()]
    locs = [l.strip() for l in access_locations.split(",") if l.strip()]

    doc = Document(
        title=title,
        filename=safe_name,
        file_path=file_path,
        file_size=bytes_read,
        content_type=file.content_type,
        module=module,
        description=description,
        access_roles=roles,
        access_departments=depts,
        access_locations=locs,
        uploaded_by=current_user.id,
        status=DocumentStatus.processing,
        is_indexed=False,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Hand off to the in-process ingestion worker (parses + indexes in the background).
    from app.ingestion.queue_worker import enqueue
    enqueue(doc.id)

    log_action(db, current_user.id, "DOCUMENT_UPLOAD", "document", str(doc.id), {"title": title})
    return doc


@router.get("/", response_model=List[DocumentOut], summary="List documents")
def list_documents(
    module: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if module and module not in ALLOWED_MODULES:
        raise HTTPException(status_code=400, detail=f"Invalid module. Allowed: {sorted(ALLOWED_MODULES)}")
    limit = min(limit, 100)
    q = db.query(Document).filter(Document.status != DocumentStatus.archived)
    if module:
        q = q.filter(Document.module == module)
    if current_user.role not in ("hr_admin", "executive"):
        q = q.filter(Document.status == DocumentStatus.published)
    return q.order_by(Document.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{doc_id}/status", summary="Check document indexing status")
def get_document_status(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"id": doc.id, "status": doc.status, "is_indexed": doc.is_indexed, "chunk_count": doc.chunk_count}


@router.get("/{doc_id}", response_model=DocumentOut, summary="Get document metadata")
def get_document(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.delete("/{doc_id}", summary="Archive a document (HR Admin only)")
def archive_document(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("hr_admin")),
):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    doc.status = DocumentStatus.archived
    db.commit()
    log_action(db, current_user.id, "DOCUMENT_ARCHIVE", "document", str(doc_id))
    return {"message": "Document archived"}


@router.delete("/{doc_id}/hard", summary="Permanently delete a document (HR Admin only)")
def delete_document_hard(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("hr_admin")),
):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if doc.is_indexed:
        try:
            from app.db.qdrant_client import get_qdrant
            from qdrant_client.models import Filter, FieldCondition, MatchValue
            client = get_qdrant()
            client.delete(
                collection_name=settings.QDRANT_COLLECTION,
                points_selector=Filter(
                    must=[
                        FieldCondition(
                            key="document_id",
                            match=MatchValue(value=doc_id),
                        )
                    ]
                )
            )
        except Exception:
            pass

    if doc.file_path and os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    db.delete(doc)
    db.commit()
    log_action(db, current_user.id, "DOCUMENT_DELETE_HARD", "document", str(doc_id))
    return {"message": "Document permanently deleted"}
