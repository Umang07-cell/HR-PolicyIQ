"""
Core ingestion routine shared by the in-process queue worker and the (optional) Celery task.

index_document() is the single source of truth for turning an uploaded file into searchable
vectors. It is idempotent: existing vectors for the document are cleared before re-indexing,
so processing the same document twice never produces duplicate chunks.
"""
from app.db.session import SessionLocal
from app.models.document import Document, DocumentStatus
from app.core.logging import logger


def index_document(document_id: int) -> dict:
    db = SessionLocal()
    try:
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            logger.error("index_document_not_found", document_id=document_id)
            return {"error": "Document not found"}

        if doc.status == DocumentStatus.archived:
            logger.info("index_document_skip_archived", document_id=document_id)
            return {"skipped": "archived"}

        doc.status = DocumentStatus.processing
        db.commit()

        from app.ingestion.parser import parse_document
        from app.ingestion.chunker import chunk_pages
        from app.ingestion.indexer import index_chunks, delete_document_vectors

        # Idempotent: drop any prior vectors for this document first.
        try:
            delete_document_vectors(doc.id)
        except Exception as e:
            logger.warning("index_document_cleanup_failed", document_id=document_id, error=str(e))

        pages = parse_document(doc.file_path, doc.content_type)
        chunks = chunk_pages(pages)
        ids = index_chunks(
            chunks, doc.id, doc.title, doc.module,
            doc.access_roles, doc.access_departments, doc.access_locations,
        )

        doc.qdrant_ids = ids
        doc.chunk_count = len(ids)
        doc.is_indexed = bool(ids)
        # No extractable text (e.g. scanned PDF) -> leave as draft so it surfaces as
        # "not indexed" rather than silently published with zero content.
        doc.status = DocumentStatus.published if ids else DocumentStatus.draft
        db.commit()

        if ids:
            logger.info("index_document_complete", document_id=document_id, chunks=len(ids))
        else:
            logger.warning("index_document_no_chunks", document_id=document_id)
        return {"document_id": document_id, "chunks": len(ids)}

    except Exception as exc:
        logger.error("index_document_failed", document_id=document_id, error=str(exc))
        db.rollback()
        try:
            doc = db.query(Document).filter(Document.id == document_id).first()
            if doc and doc.status != DocumentStatus.archived:
                doc.status = DocumentStatus.draft
                doc.is_indexed = False
                db.commit()
        except Exception:
            pass
        raise
    finally:
        db.close()
