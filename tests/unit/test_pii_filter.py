"""Unit tests for PII redaction."""
from app.rag.pii_filter import redact_india_pii


def test_aadhaar_redacted():
    assert "AADHAAR-REDACTED" in redact_india_pii("My Aadhaar is 2345 6789 0123")


def test_aadhaar_not_in_output():
    assert "2345 6789 0123" not in redact_india_pii("Aadhaar: 2345 6789 0123")


def test_pan_redacted():
    assert "PAN-REDACTED" in redact_india_pii("PAN: ABCDE1234F")


def test_pan_not_in_output():
    assert "ABCDE1234F" not in redact_india_pii("PAN number ABCDE1234F is required")


def test_clean_text_unchanged():
    text = "The leave policy allows 12 days of casual leave."
    assert redact_india_pii(text) == text


def test_multiple_entities_same_text():
    text = "Aadhaar: 2345 6789 0123 and PAN: ABCDE1234F"
    result = redact_india_pii(text)
    assert "AADHAAR-REDACTED" in result
    assert "PAN-REDACTED" in result
    assert "2345 6789 0123" not in result
    assert "ABCDE1234F" not in result


def test_uan_redacted():
    text = "UAN: 100123456789"
    result = redact_india_pii(text)
    assert "UAN-REDACTED" in result
    assert "100123456789" not in result


def test_empty_string():
    assert redact_india_pii("") == ""


def test_numeric_only_not_redacted():
    # 6-digit number should not be flagged as Aadhaar (needs 12 digits)
    text = "Page 123456 of the document"
    assert "REDACTED" not in redact_india_pii(text)
