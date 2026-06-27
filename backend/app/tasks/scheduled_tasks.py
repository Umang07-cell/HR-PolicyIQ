from app.tasks.celery_app import celery_app
from celery.schedules import crontab

celery_app.conf.beat_schedule = {
    "daily-leave-summary": {
        "task": "app.tasks.scheduled_tasks.daily_leave_summary",
        "schedule": crontab(hour=8, minute=0),
    },
}

@celery_app.task
def daily_leave_summary():
    from app.db.session import SessionLocal
    from app.models.leave import LeaveRequest, LeaveStatus
    db = SessionLocal()
    count = db.query(LeaveRequest).filter(LeaveRequest.status == LeaveStatus.pending).count()
    db.close()
    return {"pending_leaves": count}
