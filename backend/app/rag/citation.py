from typing import List, Dict
import math

DROP_THRESHOLD = 0.25


def _absolute_score(rerank_score: float) -> float:
    # CrossEncoder already outputs probabilities (0-1), no sigmoid needed
    return round(float(rerank_score), 3)


def _normalise_rrf(score: float) -> float:
    MAX_RRF_HYBRID = 2.0 / 61.0
    return round(min(score / MAX_RRF_HYBRID, 1.0), 3)


def format_citations(chunks: List[Dict]) -> List[Dict]:
    seen_ids = set()
    citations = []

    for i, c in enumerate(chunks):
        doc_id = c.get("document_id")
        page = c.get("page")
        chunk_index = c.get("chunk_index", 0)
        chunk_key = f"{doc_id}_{page}_{chunk_index}"

        if chunk_key in seen_ids:
            continue
        seen_ids.add(chunk_key)

        if "rerank_score" in c:
            score = _absolute_score(c["rerank_score"])
        else:
            score = _normalise_rrf(c.get("score", 0.0))

        citations.append({
            "document_id": doc_id,
            "document_title": c.get("document_title", "HR Document"),
            "page": page,
            "chunk_index": chunk_index,
            "chunk_text": c.get("text", "")[:400],
            "score": score,
        })

    if not citations:
        return citations

    top_score = max(c["score"] for c in citations)
    cutoff = top_score - DROP_THRESHOLD
    filtered = [c for c in citations if c["score"] >= cutoff]

    return filtered if filtered else citations[:1]