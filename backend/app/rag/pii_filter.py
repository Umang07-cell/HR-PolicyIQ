import re
from typing import Optional

AADHAAR_PATTERN = re.compile(r'\b[2-9]{1}[0-9]{3}\s[0-9]{4}\s[0-9]{4}\b')
PAN_PATTERN = re.compile(r'\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b')
UAN_PATTERN = re.compile(r'(?i)(?:UAN|Universal Account Number|EPF Account)[:\s#]*([0-9]{12})\b')


def redact_india_pii(text: str) -> str:
    text = AADHAAR_PATTERN.sub("[AADHAAR-REDACTED]", text)
    text = PAN_PATTERN.sub("[PAN-REDACTED]", text)
    text = UAN_PATTERN.sub(lambda m: m.group(0).replace(m.group(1), "[UAN-REDACTED]"), text)
    return text


def redact_with_presidio(text: str) -> str:
    try:
        from app.presidio.engine import get_analyzer, get_anonymizer
        analyzer = get_analyzer()
        anonymizer = get_anonymizer()
        results = analyzer.analyze(text=text, language="en")
        anonymized = anonymizer.anonymize(text=text, analyzer_results=results)
        clean = anonymized.text
    except Exception:
        clean = text
    return redact_india_pii(clean)


def filter_pii(text: str, use_presidio: bool = True) -> str:
    if use_presidio:
        return redact_with_presidio(text)
    return redact_india_pii(text)
