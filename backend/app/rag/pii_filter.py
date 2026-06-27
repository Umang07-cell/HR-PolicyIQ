"""
PII redaction using Microsoft Presidio + custom India-specific recognizers.
Runs BEFORE chunks reach LLM and AFTER LLM output.

Fixed: removed duplicate filter_pii definition (BUG-03).
Fixed: UAN_PATTERN scoped to context words to avoid over-redaction (BUG-23).
"""
import re
from typing import Optional

# Custom India PII patterns
AADHAAR_PATTERN = re.compile(r'\b[2-9]{1}[0-9]{3}\s[0-9]{4}\s[0-9]{4}\b')
PAN_PATTERN = re.compile(r'\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b')
# UAN: only redact when preceded by context words (BUG-23 fix — avoids redacting phone/bank nums)
UAN_PATTERN = re.compile(r'(?i)(?:UAN|Universal Account Number|EPF Account)[:\s#]*([0-9]{12})\b')


def redact_india_pii(text: str) -> str:
    text = AADHAAR_PATTERN.sub("[AADHAAR-REDACTED]", text)
    text = PAN_PATTERN.sub("[PAN-REDACTED]", text)
    text = UAN_PATTERN.sub(lambda m: m.group(0).replace(m.group(1), "[UAN-REDACTED]"), text)
    return text


def redact_with_presidio(text: str) -> str:
    """Full Presidio redaction — loads lazily."""
    try:
        from presidio_analyzer import AnalyzerEngine
        from presidio_anonymizer import AnonymizerEngine
        analyzer = AnalyzerEngine()
        anonymizer = AnonymizerEngine()
        results = analyzer.analyze(text=text, language="en")
        anonymized = anonymizer.anonymize(text=text, analyzer_results=results)
        clean = anonymized.text
    except Exception:
        clean = text
    # Always apply India-specific patterns on top
    return redact_india_pii(clean)


def filter_pii(text: str, use_presidio: bool = True) -> str:
    """Single authoritative filter_pii function."""
    if use_presidio:
        return redact_with_presidio(text)
    return redact_india_pii(text)
