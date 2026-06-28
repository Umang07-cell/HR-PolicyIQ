"""
Embedding model wrapper.

Dense embeddings: SentenceTransformer (BAAI/bge-small-en-v1.5 on CPU, or bge-m3 on GPU).
Sparse embeddings: token-frequency fallback (BM25-style).

BUG-K FIX: removed dead FlagEmbedding branch that imported BGEM3FlagModel but then
called .encode() on a SentenceTransformer object — always threw, always fell to fallback.
The fallback is the correct implementation for this stack and is now the primary path,
clearly documented. When bge-m3 + FlagEmbedding is available, replace embed_sparse body.
"""
from typing import List, Tuple
from app.core.config import settings
from app.core.logging import logger

_model = None


def get_embedder():
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            logger.info("loading_embedding_model", model=settings.EMBEDDING_MODEL)
            _model = SentenceTransformer(settings.EMBEDDING_MODEL)
        except Exception as e:
            logger.error("embedding_model_load_failed", error=str(e))
            raise
    return _model


def embed_texts(texts: List[str]) -> List[List[float]]:
    model = get_embedder()
    embeddings = model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
    return embeddings.tolist()


def embed_query(query: str) -> List[float]:
    return embed_texts([query])[0]


def embed_sparse(text: str) -> Tuple[List[int], List[float]]:
    """
    Generate sparse token-frequency vector for BM25-style keyword search in Qdrant.
    Returns (indices, values) for Qdrant SparseVector.

    This is a deterministic TF-based fallback. Duplicate tokens accumulate weight.
    Index space is 30 000 buckets (hashlib.sha256 mod) — collision rate is low for short HR queries.

    Production upgrade path: when running bge-m3 via FlagEmbedding, replace this body with:
        from FlagEmbedding import BGEM3FlagModel
        flag_model = BGEM3FlagModel("BAAI/bge-m3", use_fp16=True)
        out = flag_model.encode([text], return_sparse=True, return_dense=False)
        lw = out["lexical_weights"][0]
        return [int(k) for k in lw.keys()], [float(v) for v in lw.values()]
    """
    import hashlib
    tokens = text.lower().split()
    index_map: dict = {}
    for token in tokens:
        idx = int(hashlib.sha256(token.encode('utf-8')).hexdigest(), 16) % 30000
        index_map[idx] = index_map.get(idx, 0.0) + 1.0
    return list(index_map.keys()), list(index_map.values())
