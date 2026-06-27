from sqlalchemy.orm import Session
from app.models.recruitment import Application, ApplicationStatus

def get_pipeline_stats(db: Session, job_id: int) -> dict:
    apps = db.query(Application).filter(Application.job_id == job_id).all()
    stats = {}
    for s in ApplicationStatus:
        stats[s.value] = sum(1 for a in apps if a.status == s)
    stats["total"] = len(apps)
    return stats
