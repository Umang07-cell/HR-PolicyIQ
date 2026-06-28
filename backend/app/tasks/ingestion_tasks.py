from app.tasks.celery_app import celery_app
from app.core.logging import logger


@celery_app.task(bind=True, max_retries=3, default_retry_delay=30)
def async_index_document(self, document_id: int):
    from app.db.session import SessionLocal
    from app.models.document import Document, DocumentStatus
    from app.ingestion.parser import parse_document
    from app.ingestion.chunker import chunk_pages
    from app.ingestion.indexer import index_chunks

    db = SessionLocal()
    try:
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            logger.error("ingestion_task_doc_not_found", document_id=document_id)
            return {"error": "Document not found"}

        doc.status = DocumentStatus.processing
        db.commit()

        pages = parse_document(doc.file_path, doc.content_type)
        chunks = chunk_pages(pages)
        ids = index_chunks(
            chunks, doc.id, doc.title, doc.module,
            doc.access_roles, doc.access_departments, doc.access_locations,
        )

        doc.qdrant_ids = ids
        doc.chunk_count = len(ids)
        doc.is_indexed = True
        doc.status = DocumentStatus.published
        db.commit()

        logger.info("ingestion_task_complete", document_id=document_id, chunks=len(ids))
        return {"document_id": document_id, "chunks": len(ids)}

    except Exception as exc:
        logger.error("ingestion_task_failed", document_id=document_id, error=str(exc))
        try:
            doc = db.query(Document).filter(Document.id == document_id).first()
            if doc:
                doc.status = DocumentStatus.draft
                doc.is_indexed = False
                db.commit()
        except Exception:
            pass
        raise self.retry(exc=exc)
    finally:
        db.close()
