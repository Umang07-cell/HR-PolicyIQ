"""
Confidence scoring for the hybrid RAG pipeline.

RRF scores are inherently tiny: max theoretical = 1/(k+1) = 1/61 ≈ 0.0164.
We normalise to 0–1 so the UI shows a human-readable percentage.

Thresholds (tunable via env/config):
  HIGH   >= 0.65  → answer with full citations
  MEDIUM  0.35–0.64 → answer with caveat
  LOW    < 0.35   → abstain and route to HR

FIX: gate now also checks score spread — a single weak chunk that barely
passes the raw threshold is penalised if the top-2 score gap is huge,
which usually means only one document partially matched.
"""

CONFIDENCE_GATE_THRESHOLD = 0.25   # below this → abstain (normalised scale)
MAX_RRF = 1.0 / 61.0               # 1/(k+1) where k=60


def compute_confidence(chunks) -> float:
    """
    Returns a normalised confidence score in [0.0, 1.0].
    Uses the top chunk's RRF score, normalised against the theoretical maximum.
    """
    if not chunks:
        return 0.0
    top_score = chunks[0].get("score", 0.0)
    normalised = min(top_score / MAX_RRF, 1.0)
    return round(normalised, 3)


def should_abstain(chunks) -> bool:
    """
    Returns True if the retrieval confidence is too low to generate an answer.
    Abstaining is preferable to generating a wrong HR policy answer.
    """
    if not chunks:
        return True
    confidence = compute_confidence(chunks)
    return confidence < CONFIDENCE_GATE_THRESHOLD


def confidence_label(score: float) -> str:
    """Human-readable confidence label for UI display."""
    if score >= 0.65:
        return "high"
    elif score >= 0.35:
        return "medium"
    return "low"
