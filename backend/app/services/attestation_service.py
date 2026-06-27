from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from app.models.user import User

def get_attestation_compliance(db: Session, doc_id: int) -> dict:
    total_employees = db.query(User).filter(User.is_active == True).count()
    attested = db.query(AuditLog).filter(
        AuditLog.action == "POLICY_ATTESTATION",
        AuditLog.resource_id == str(doc_id)
    ).count()
    return {
        "document_id": doc_id,
        "total_employees": total_employees,
        "attested": attested,
        "pending": total_employees - attested,
        "compliance_pct": round((attested / total_employees * 100) if total_employees else 0, 1)
    }
