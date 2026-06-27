import math
from collections import Counter
from typing import List, Dict, Any, Optional

CONFIDENCE_GATE_THRESHOLD = 0.20
MAX_RRF_HYBRID = 2.0 / 61.0
ABSTAIN_PHRASE = "do not contain"


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


def compute_confidence_from_rerank(
    chunks: List[Dict[str, Any]],
    llm_answer: str = "",
) -> float:
    if not chunks:
        return 0.0

    rerank_scores = [c["rerank_score"] for c in chunks if "rerank_score" in c]

    if not rerank_scores:
        return compute_confidence_from_rrf(chunks)

    llm_answered = ABSTAIN_PHRASE not in llm_answer.lower()

    if not llm_answered:
        return round(min(_sigmoid(rerank_scores[0]) * 0.55, 0.42), 3)

    top = rerank_scores[0]
    bottom = rerank_scores[-1]
    spread_factor = min((top - bottom) / 2.0, 1.0)

    pages = [c.get("page") for c in chunks]
    top_page_count = Counter(p for p in pages if p is not None).most_common(1)
    convergence = (top_page_count[0][1] / len(chunks)) if top_page_count else 0.0

    confidence = 0.62 + 0.25 * convergence + 0.10 * spread_factor
    return round(min(confidence, 0.97), 3)


def should_abstain(chunks: List[Dict[str, Any]]) -> bool:
    if not chunks:
        return True
    return compute_confidence_from_rrf(chunks) < CONFIDENCE_GATE_THRESHOLD


def confidence_label(score: float) -> str:
    if score >= 0.75:
        return "high"
    elif score >= 0.50:
        return "medium"
    return "low"