"""
Cross-encoder reranker — BGE Reranker Large.

SPEED FIX: model is loaded once into a module-level singleton (_reranker).
Previously CrossEncoder("BAAI/bge-reranker-large") was called inside rerank()
on every single request — this re-initialises the model object each time,
adding 1–3s latency per call even when the weights are already on disk.
The singleton is pre-warmed at startup via warm_reranker() called from main.py.

Falls back to RRF score ordering if the model is unavailable.
"""
from typing import List, Dict, Any

_reranker = None


def get_reranker():
    """Return the cached CrossEncoder instance, loading it if necessary."""
    global _reranker
    if _reranker is None:
        from sentence_transformers import CrossEncoder
        _reranker = CrossEncoder("BAAI/bge-reranker-large")
    return _reranker


def warm_reranker():
    """
    Pre-load the reranker at startup so the first real request isn't slow.
    Called from main.py lifespan. Swallows exceptions — reranker is optional.
    """
    try:
        get_reranker()
        print("Reranker warmed up successfully.")
    except Exception as e:
        print(f"Warning: Reranker warmup failed (will use RRF fallback): {e}")


def rerank(query: str, chunks: List[Dict[str, Any]], top_k: int = 5) -> List[Dict[str, Any]]:
    try:
        model = get_reranker()
        pairs = [(query, c["text"]) for c in chunks]
        scores = model.predict(pairs)
        for i, c in enumerate(chunks):
            c["rerank_score"] = float(scores[i])
        reranked = sorted(chunks, key=lambda x: x["rerank_score"], reverse=True)
        return reranked[:top_k]
    except Exception:
        # Fallback: order by original RRF score
        return sorted(chunks, key=lambda x: x["score"], reverse=True)[:top_k]
