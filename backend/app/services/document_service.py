from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.document import Document, DocumentStatus

def get_accessible_documents(db: Session, role: str, module: Optional[str] = None) -> List[Document]:
    q = db.query(Document).filter(Document.status == DocumentStatus.published)
    if module:
        q = q.filter(Document.module == module)
    docs = q.all()
    return [d for d in docs if not d.access_roles or role in d.access_roles or "all" in d.access_roles]

def get_document_by_id(db: Session, doc_id: int) -> Optional[Document]:
    return db.query(Document).filter(Document.id == doc_id).first()

def update_document_status(db: Session, doc_id: int, status: DocumentStatus) -> Optional[Document]:
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if doc:
        doc.status = status
        db.commit()
        db.refresh(doc)
    return doc
