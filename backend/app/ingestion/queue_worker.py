"""
In-process ingestion queue.

Uploads enqueue a document id and return immediately; a single background daemon thread
drains the queue one document at a time. This keeps the API responsive and processes many
large documents under load without spiking memory/CPU (work is serialised, not run
concurrently per request).

Durability: the database is the source of truth. On startup requeue_unfinished() re-enqueues
any document left in draft/processing (e.g. interrupted by a restart), so no upload is lost.
"""
import queue
import threading
from app.core.logging import logger

_job_queue: "queue.Queue[int]" = queue.Queue()
_worker_started = False
_lock = threading.Lock()


def enqueue(document_id: int) -> None:
    _job_queue.put(document_id)
    logger.info("ingestion_enqueued", document_id=document_id, queue_size=_job_queue.qsize())


def _worker_loop() -> None:
    from app.ingestion.service import index_document
    while True:
        document_id = _job_queue.get()
        try:
            index_document(document_id)
        except Exception as e:
            logger.error("ingestion_worker_error", document_id=document_id, error=str(e))
        finally:
            _job_queue.task_done()


def start_worker() -> None:
    """Start the background ingestion worker exactly once."""
    global _worker_started
    with _lock:
        if _worker_started:
            return
        thread = threading.Thread(target=_worker_loop, name="ingestion-worker", daemon=True)
        thread.start()
        _worker_started = True
        logger.info("ingestion_worker_started")


def requeue_unfinished() -> int:
    """Re-enqueue documents that never finished indexing (crash/restart recovery)."""
    from app.db.session import SessionLocal
    from app.models.document import Document, DocumentStatus

    db = SessionLocal()
    try:
        docs = (
            db.query(Document)
            .filter(Document.status.in_([DocumentStatus.draft, DocumentStatus.processing]))
            .all()
        )
        for d in docs:
            enqueue(d.id)
        if docs:
            logger.info("ingestion_requeued_unfinished", count=len(docs))
        return len(docs)
    finally:
        db.close()
