import math
from typing import List, Dict, Any

MAX_RRF_HYBRID = 2.0 / 61.0
CONFIDENCE_GATE_THRESHOLD = 0.20


def _sigmoid(x: float) -> float:
    try:
        return 1.0 / (1.0 + math.exp(-x))
    except OverflowError:
        return 0.0 if x < 0 else 1.0


def compute_confidence_from_rrf(chunks: List[Dict[str, Any]]) -> float:
    if not chunks:
        return 0.0
    top_score = chunks[0].get("score", 0.0)
    return round(min(top_score / MAX_RRF_HYBRID, 1.0), 3)


def compute_confidence_from_rerank(chunks: List[Dict[str, Any]]) -> float:
    if not chunks:
        return 0.0
    top = chunks[0]
    if "rerank_score" in top:
        return round(_sigmoid(top["rerank_score"]), 3)
    return compute_confidence_from_rrf(chunks)


def should_abstain(chunks: List[Dict[str, Any]]) -> bool:
    if not chunks:
        return True
    return compute_confidence_from_rrf(chunks) < CONFIDENCE_GATE_THRESHOLD


def confidence_label(score: float) -> str:
    if score >= 0.75:
        return "high"
    elif score >= 0.45:
        return "medium"
    return "low"