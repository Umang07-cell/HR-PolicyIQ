
import math
from typing import List, Dict, Any

# Hybrid system: two lists, so max RRF = 1/(k+1) + 1/(k+1) = 2/61
MAX_RRF_HYBRID = 2.0 / 61.0   # BUG-1 FIX: was 1/61

# Early-exit gate threshold (applied to normalised RRF before reranking)
CONFIDENCE_GATE_THRESHOLD = 0.20   # below this → abstain without calling reranker


def _sigmoid(x: float) -> float:
    """Map cross-encoder logit to [0, 1]."""
    try:
        return 1.0 / (1.0 + math.exp(-x))
    except OverflowError:
        return 0.0 if x < 0 else 1.0


def compute_confidence_from_rrf(chunks: List[Dict[str, Any]]) -> float:
    """
    Fast pre-rerank confidence from RRF scores.
    Used only for the early-exit gate — not shown to users.
    BUG-1 FIX: normalises against MAX_RRF_HYBRID (2/61), not 1/61.
    """
    if not chunks:
        return 0.0
    top_score = chunks[0].get("score", 0.0)
    return round(min(top_score / MAX_RRF_HYBRID, 1.0), 3)


def compute_confidence_from_rerank(chunks: List[Dict[str, Any]]) -> float:
    """
    Final confidence from the BGE cross-encoder rerank score.
    BUG-2 + BUG-3 FIX: uses sigmoid(rerank_score) of the top reranked
    chunk. Falls back to corrected RRF normalisation if reranker unavailable.
    """
    if not chunks:
        return 0.0
    top = chunks[0]
    if "rerank_score" in top:
        # Cross-encoder logit → sigmoid → [0, 1]
        return round(_sigmoid(top["rerank_score"]), 3)
    # Fallback: corrected RRF normalisation
    return compute_confidence_from_rrf(chunks)


def should_abstain(chunks: List[Dict[str, Any]]) -> bool:
    """
    Early-exit gate using RRF score (before reranking).
    Returns True if retrieval is so weak that calling the reranker
    and LLM would be wasteful — abstain and route to HR.
    """
    if not chunks:
        return True
    return compute_confidence_from_rrf(chunks) < CONFIDENCE_GATE_THRESHOLD


def confidence_label(score: float) -> str:
    """Human-readable label for UI badge."""
    if score >= 0.75:
        return "high"
    elif score >= 0.45:
        return "medium"
    return "low"
