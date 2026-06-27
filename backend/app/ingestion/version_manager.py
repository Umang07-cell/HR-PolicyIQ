"""Document versioning — tracks version history."""
from sqlalchemy.orm import Session
from app.models.document import Document

def get_next_version(db: Session, title: str) -> int:
    existing = db.query(Document).filter(Document.title == title).order_by(Document.version.desc()).first()
    return (existing.version + 1) if existing else 1

def get_version_history(db: Session, title: str):
    return db.query(Document).filter(Document.title == title).order_by(Document.version.desc()).all()
