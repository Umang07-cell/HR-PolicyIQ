from app.tasks.celery_app import celery_app

@celery_app.task(bind=True, max_retries=3)
def async_index_document(self, document_id: int):
    """Background task: parse, chunk, embed, index a document."""
    try:
        from app.db.session import SessionLocal
        from app.models.document import Document
        from app.ingestion.parser import parse_document
        from app.ingestion.chunker import chunk_pages
        from app.ingestion.indexer import index_chunks
        db = SessionLocal()
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            return {"error": "Document not found"}
        pages = parse_document(doc.file_path, doc.content_type)
        chunks = chunk_pages(pages)
        ids = index_chunks(chunks, doc.id, doc.title, doc.module, doc.access_roles, doc.access_departments, doc.access_locations)
        doc.qdrant_ids = ids
        doc.chunk_count = len(ids)
        doc.is_indexed = True
        db.commit()
        db.close()
        return {"document_id": document_id, "chunks": len(ids)}
    except Exception as exc:
        raise self.retry(exc=exc, countdown=30)
