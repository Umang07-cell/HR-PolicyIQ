from app.tasks.celery_app import celery_app

@celery_app.task
def send_leave_notification(employee_id: int, status: str, approver_name: str):
    from app.db.session import SessionLocal
    from app.services.notification_service import send_notification
    db = SessionLocal()
    send_notification(db, employee_id, f"Leave {status.capitalize()}", f"Your leave request has been {status} by {approver_name}.", "leave")
    db.close()

@celery_app.task
def send_grievance_notification(employee_id: int, grievance_id: int):
    from app.db.session import SessionLocal
    from app.services.notification_service import send_notification
    db = SessionLocal()
    send_notification(db, employee_id, "Grievance Update", f"Your grievance #{grievance_id} has been updated.", "grievance")
    db.close()
