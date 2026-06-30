from app.tasks.celery_app import celery_app
from app.core.logging import logger


@celery_app.task(bind=True, max_retries=3, default_retry_delay=30)
def async_index_document(self, document_id: int):
    """Celery entry point. Delegates to the shared in-process ingestion routine so both
    the background worker and Celery use identical logic."""
    from app.ingestion.service import index_document
    try:
        return index_document(document_id)
    except Exception as exc:
        logger.error("ingestion_task_failed", document_id=document_id, error=str(exc))
        raise self.retry(exc=exc)
