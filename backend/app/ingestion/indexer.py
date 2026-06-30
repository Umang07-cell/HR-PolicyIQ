from typing import List
import uuid
from qdrant_client.models import PointStruct, SparseVector, Filter, FieldCondition, MatchValue
from app.db.qdrant_client import get_qdrant
from app.rag.embedder import embed_texts, embed_sparse
from app.core.config import settings
from app.core.logging import logger

UPSERT_BATCH_SIZE = 50


def delete_document_vectors(document_id: int) -> None:
    """Remove all vectors belonging to a document. Makes re-indexing idempotent
    (no duplicate chunks accumulate when a document is processed more than once)."""
    client = get_qdrant()
    client.delete(
        collection_name=settings.QDRANT_COLLECTION,
        points_selector=Filter(
            must=[FieldCondition(key="document_id", match=MatchValue(value=document_id))]
        ),
    )
    logger.info("document_vectors_deleted", doc_id=document_id)


def index_chunks(chunks, document_id, document_title, module, access_roles, access_departments, access_locations):
    if not chunks:
        return []

    logger.info("indexing_start", doc_id=document_id, chunks=len(chunks))

    texts = [c["text"] for c in chunks]
    embeddings = embed_texts(texts)

    client = get_qdrant()
    ids = []
    points = []

    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        point_id = str(uuid.uuid4())
        ids.append(point_id)

        sparse_indices, sparse_values = embed_sparse(chunk["text"])

        points.append(PointStruct(
            id=point_id,
            vector={
                "dense": embedding,
                "sparse": SparseVector(indices=sparse_indices, values=sparse_values),
            },
            payload={
                "text": chunk["text"][:2000],
                "document_id": document_id,
                "document_title": document_title,
                "chunk_index": chunk.get("chunk_index", 0),
                "page": chunk.get("page"),
                "module": module,
                "access_roles": access_roles if access_roles else ["all"],
                "access_departments": access_departments if access_departments else ["all"],
                "access_locations": access_locations if access_locations else ["all"],
            },
        ))

    for batch_start in range(0, len(points), UPSERT_BATCH_SIZE):
        batch = points[batch_start: batch_start + UPSERT_BATCH_SIZE]
        client.upsert(collection_name=settings.QDRANT_COLLECTION, points=batch)
        logger.info("upsert_batch", doc_id=document_id, batch_end=batch_start + len(batch), total=len(points))

    logger.info("indexing_complete", doc_id=document_id, points=len(ids))
    return ids
