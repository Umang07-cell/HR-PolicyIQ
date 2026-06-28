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
    
    # CrossEncoder already applies sigmoid and outputs probabilities (0 to 1).
    top_prob = rerank_scores[0]

    if not llm_answered:
        return round(min(top_prob * 0.55, 0.42), 3)

    return round(float(top_prob), 3)


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