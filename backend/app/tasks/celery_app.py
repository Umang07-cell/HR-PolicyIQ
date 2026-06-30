from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "hr_platform",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks.ingestion_tasks"]
)
celery_app.conf.task_serializer = "json"
celery_app.conf.result_expires = 3600
