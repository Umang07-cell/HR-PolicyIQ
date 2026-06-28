from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, SparseVectorParams
from app.core.config import settings

_client: QdrantClient = None


def get_qdrant() -> QdrantClient:
    global _client
    if _client is None:
        _client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
    return _client


def init_qdrant():
    global _client
    _client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)


def ensure_collection():
    client = get_qdrant()
    try:
        client.get_collection(settings.QDRANT_COLLECTION)
    except Exception:
        client.create_collection(
            collection_name=settings.QDRANT_COLLECTION,
            vectors_config={
                "dense": VectorParams(size=settings.EMBEDDING_DIM, distance=Distance.COSINE)
            },
            sparse_vectors_config={
                "sparse": SparseVectorParams()
            },
        )
