"""
Query transformation — HyDE (Hypothetical Document Embedding) and query expansion.
For prototype: simple keyword expansion. Production: LLM-based HyDE.
"""
import re

HR_SYNONYMS = {
    "leave": ["vacation", "absence", "time off", "holiday"],
    "salary": ["compensation", "pay", "ctc", "package"],
    "grievance": ["complaint", "issue", "concern"],
    "appraisal": ["performance review", "rating", "evaluation"],
}

def expand_query(query: str) -> str:
    """Add synonyms to query for better retrieval coverage."""
    expanded = query
    lower = query.lower()
    for term, synonyms in HR_SYNONYMS.items():
        if term in lower:
            expanded += " " + " ".join(synonyms[:2])
    return expanded

def clean_query(query: str) -> str:
    """Remove special chars, normalize whitespace."""
    query = re.sub(r"[^\w\s?]", " ", query)
    return " ".join(query.split()).strip()

def transform_query(query: str) -> str:
    return expand_query(clean_query(query))
