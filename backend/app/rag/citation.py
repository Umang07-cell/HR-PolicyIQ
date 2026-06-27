from typing import List, Dict
import math


def _relative_score(rerank_scores: List[float], idx: int) -> float:
    min_s = min(rerank_scores)
    max_s = max(rerank_scores)
    if max_s == min_s:
        return 1.0
    normalised = (rerank_scores[idx] - min_s) / (max_s - min_s)
    return round(0.60 + 0.40 * normalised, 3)


def _normalise_rrf(score: float) -> float:
    MAX_RRF_HYBRID = 2.0 / 61.0
    return round(min(score / MAX_RRF_HYBRID, 1.0), 3)


def format_citations(chunks: List[Dict]) -> List[Dict]:
    seen_ids = set()
    citations = []

    rerank_scores = [c["rerank_score"] for c in chunks if "rerank_score" in c]
    use_relative = len(rerank_scores) == len(chunks)

    for i, c in enumerate(chunks):
        doc_id = c.get("document_id")
        page = c.get("page")
        chunk_index = c.get("chunk_index", 0)
        chunk_key = f"{doc_id}_{page}_{chunk_index}"

        if chunk_key in seen_ids:
            continue
        seen_ids.add(chunk_key)

        if use_relative:
            score = _relative_score(rerank_scores, i)
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

    return citations