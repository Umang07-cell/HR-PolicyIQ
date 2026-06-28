from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.core.audit import log_action
from app.models.user import User
from app.models.document import Document
from app.models.audit_log import AuditLog

router = APIRouter(prefix="/attestation", tags=["Policy Attestation"])


@router.post("/{doc_id}/attest", summary="Attest that you have read a policy document")
def attest_policy(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    log_action(db, current_user.id, "POLICY_ATTESTATION", "document", str(doc_id), {"title": doc.title})
    return {
        "message": f"Attestation recorded for '{doc.title}'",
        "user_id": current_user.id,
        "document_id": doc_id,
    }


@router.get("/{doc_id}/status", summary="Check attestation status for a document (HR Admin only)")
def attestation_status(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("hr_admin", "executive")),
):
    attestations = db.query(AuditLog).filter(
        AuditLog.action == "POLICY_ATTESTATION",
        AuditLog.resource_id == str(doc_id),
    ).all()
    return {
        "document_id": doc_id,
        "attestation_count": len(attestations),
        "attested_by": [a.user_id for a in attestations],
    }
