from app.workflows.base import BaseWorkflow
from sqlalchemy.orm import Session
from app.models.document import Document, DocumentStatus

class PolicyPublishWorkflow(BaseWorkflow):
    def __init__(self, db: Session):
        self.db = db

    def run(self, state) -> dict:
        return {"status": "initiated"}

    def publish(self, doc_id: int, publisher_id: int) -> bool:
        doc = self.db.query(Document).filter(Document.id == doc_id).first()
        if not doc or not doc.is_indexed:
            return False
        doc.status = DocumentStatus.published
        self.db.commit()
        from app.core.audit import log_action
        log_action(self.db, publisher_id, "POLICY_PUBLISHED", "document", str(doc_id))
        return True
