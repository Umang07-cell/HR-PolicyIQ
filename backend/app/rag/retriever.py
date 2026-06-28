from typing import List, Dict, Any, Optional
from qdrant_client.models import Filter, FieldCondition, MatchAny, MatchValue, SparseVector, NamedSparseVector
from app.db.qdrant_client import get_qdrant
from app.rag.embedder import embed_query, embed_sparse
from app.core.config import settings
from app.core.logging import logger


def retrieve_chunks(
    query: str,
    role: str,
    department: Optional[str] = None,
    location: Optional[str] = None,
    module: Optional[str] = None,
    top_k: int = 8,
) -> List[Dict[str, Any]]:
    client = get_qdrant()

    # NO FILTER - for debugging
    qdrant_filter = None

    logger.info("retrieving", role=role, dept=department, loc=location, module=module)

    dense_vector = embed_query(query)
    dense_results = client.search(
        collection_name=settings.QDRANT_COLLECTION,
        query_vector=("dense", dense_vector),
        query_filter=qdrant_filter,
        limit=top_k,
        with_payload=True,
    )

    logger.info("dense_results", count=len(dense_results))

    sparse_results = []
    try:
        indices, values = embed_sparse(query)
        sparse_results = client.search(
            collection_name=settings.QDRANT_COLLECTION,
            query_vector=NamedSparseVector(
                name="sparse",
                vector=SparseVector(indices=indices, values=values),
            ),
            query_filter=qdrant_filter,
            limit=top_k,
            with_payload=True,
        )
    except Exception as e:
        logger.error("sparse_search_failed", error=str(e))

    logger.info("sparse_results", count=len(sparse_results))

    return _rrf_fuse(dense_results, sparse_results, top_k=top_k)


def _rrf_fuse(dense: list, sparse: list, top_k: int = 8, k: int = 60) -> List[Dict[str, Any]]:
    scores: Dict[str, float] = {}
    payloads: Dict[str, Any] = {}

    for rank, r in enumerate(dense):
        key = str(r.id)
        scores[key] = scores.get(key, 0.0) + 1.0 / (k + rank + 1)
        payloads[key] = r

    for rank, r in enumerate(sparse):
        key = str(r.id)
        scores[key] = scores.get(key, 0.0) + 1.0 / (k + rank + 1)
        if key not in payloads:
            payloads[key] = r

    sorted_keys = sorted(scores, key=lambda x: scores[x], reverse=True)[:top_k]
    chunks = []
    for key in sorted_keys:
        r = payloads[key]
        chunks.append({
            "id": r.id,
            "score": scores[key],
            "text": r.payload.get("text", ""),
            "document_id": r.payload.get("document_id"),
            "document_title": r.payload.get("document_title", "HR Document"),
            "chunk_index": r.payload.get("chunk_index", 0),
            "page": r.payload.get("page"),
        })
    return chunks