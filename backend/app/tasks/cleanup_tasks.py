from app.tasks.celery_app import celery_app

@celery_app.task
def cleanup_old_audit_logs(days: int = 365):
    """Archive audit logs older than N days."""
    from app.db.session import SessionLocal
    from app.models.audit_log import AuditLog
    from datetime import datetime, timedelta
    db = SessionLocal()
    cutoff = datetime.utcnow() - timedelta(days=days)
    count = db.query(AuditLog).filter(AuditLog.timestamp < cutoff).count()
    db.close()
    return {"eligible_for_archive": count}

@celery_app.task
def cleanup_temp_files():
    import os, glob
    from app.core.config import settings
    tmp_files = glob.glob(os.path.join(settings.UPLOAD_DIR, "tmp_*"))
    for f in tmp_files:
        os.remove(f)
    return {"cleaned": len(tmp_files)}
