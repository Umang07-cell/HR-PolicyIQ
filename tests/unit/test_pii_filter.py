from app.rag.pii_filter import redact_india_pii

def test_aadhaar_redacted():
    text = "My Aadhaar is 2345 6789 0123"
    assert "AADHAAR-REDACTED" in redact_india_pii(text)

def test_pan_redacted():
    text = "PAN: ABCDE1234F"
    assert "PAN-REDACTED" in redact_india_pii(text)

def test_clean_text_unchanged():
    text = "The leave policy allows 12 days of casual leave."
    assert redact_india_pii(text) == text
