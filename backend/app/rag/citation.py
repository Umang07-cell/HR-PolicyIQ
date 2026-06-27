"""
Citation formatting for RAG responses.

BUG-D FIX: uses rerank_score when available (set by reranker.py), falls back to
            normalised RRF score. Old code returned raw RRF (~0.016) as the score,
            making the UI show "2% match" even for perfectly matched chunks.

BUG-I FIX: dedup key is now (doc_id, page, chunk_index) — not just (doc_id, chunk_index).
            The chunker resets chunk_index to 0 per page, so two different chunks from
            the same document on different pages both had chunk_index=0 and were
            incorrectly deduplicated into one citation.
"""
from typing import List, Dict
import math


def _normalise_rerank_score(raw: float) -> float:
    """
    Cross-encoder scores are unbounded logits (can be negative or > 1).
    Apply sigmoid to map cleanly to [0, 1] for UI display.
    """
    try:
        return round(1.0 / (1.0 + math.exp(-raw)), 3)
    except (OverflowError, ValueError):
        return 0.5


def format_citations(chunks: List[Dict]) -> List[Dict]:
    """
    Build deduplicated citation list from reranked chunks.
    Each citation includes:
      - document_title
      - page (if available from PDF parsing)
      - chunk_index (position within the page)
      - score: normalised [0, 1] — prefers cross-encoder rerank_score over RRF score
      - chunk_text: first 400 chars of the retrieved chunk
    """
    seen_ids = set()
    citations = []

    for c in chunks:
        doc_id = c.get("document_id")
        page = c.get("page")
        chunk_index = c.get("chunk_index", 0)

        # BUG-I FIX: include page in dedup key — chunk_index resets to 0 per page
        chunk_key = f"{doc_id}_{page}_{chunk_index}"

        if chunk_key in seen_ids:
            continue
        seen_ids.add(chunk_key)

        # BUG-D FIX: prefer rerank_score (cross-encoder, logit space) → sigmoid normalise.
        # Fall back to RRF score normalised against theoretical max (1/61 ≈ 0.0164).
        if "rerank_score" in c:
            score = _normalise_rerank_score(c["rerank_score"])
        else:
            MAX_RRF = 1.0 / 61.0
            score = round(min(c.get("score", 0.0) / MAX_RRF, 1.0), 3)

        citations.append({
            "document_id": doc_id,
            "document_title": c.get("document_title", "HR Document"),
            "page": page,
            "chunk_index": chunk_index,
            "chunk_text": c.get("text", "")[:400],
            "score": score,
        })

    return citations
