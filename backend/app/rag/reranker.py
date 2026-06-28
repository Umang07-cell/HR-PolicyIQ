from typing import List, Dict, Any

_reranker = None


def get_reranker():
    global _reranker
    if _reranker is None:
        from sentence_transformers import CrossEncoder
        # bge-reranker-base is 3x faster than large on CPU, quality is similar
        _reranker = CrossEncoder("BAAI/bge-reranker-base")
    return _reranker


def warm_reranker():
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
        return sorted(chunks, key=lambda x: x["score"], reverse=True)[:top_k]