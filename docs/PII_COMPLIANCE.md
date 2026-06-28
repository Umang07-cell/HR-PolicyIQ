# PII Compliance — HR PolicyIQ

## Entities Detected and Redacted

| Entity | Detection Method | Example Input | Redacted Output |
|---|---|---|---|
| Aadhaar | Regex (12-digit with spaces) | `2345 6789 0123` | `[AADHAAR-REDACTED]` |
| PAN | Regex (`ABCDE1234F` format) | `ABCDE1234F` | `[PAN-REDACTED]` |
| UAN | Regex (12-digit EPFO) | `UAN: 100123456789` | `[UAN-REDACTED]` |
| Name | Microsoft Presidio (spaCy NER) | `Raj Sharma` | `<PERSON>` |
| Phone | Microsoft Presidio | `+91 9876543210` | `<PHONE_NUMBER>` |
| Email | Microsoft Presidio | `raj@company.com` | `<EMAIL_ADDRESS>` |

## Redaction Points in the Pipeline

```
Document Upload
    └── Chunks stored in Qdrant (raw text — PII may be present)

Query Time
    ├── Step 1: Chunks retrieved from Qdrant
    ├── Step 2: Presidio + India regex redact chunks  ← Pre-LLM
    ├── Step 3: Redacted chunks sent to Groq LLM
    ├── Step 4: LLM response received
    └── Step 5: Presidio + India regex redact response ← Post-LLM
```

## Custom India-Specific Recognisers

The default Presidio model does not detect Aadhaar, PAN, or UAN.
Custom recognisers are registered in `backend/app/presidio/engine.py` at startup.

## Compliance Standards

| Standard | Requirement | Status |
|---|---|---|
| IT Act 2000 (India) | No PII in logs, secure storage | PII stripped before LLM; audit logs exclude raw PII |
| DPDP Act 2023 | Data localisation, breach notification | On-premise deployment satisfies localisation |
| ISO 27001 | Access control, audit trails | ABAC in Qdrant; append-only audit log table |

## Known Limitations

- PII in document filenames or titles is **not** redacted
- Qdrant vector payloads store chunk text including potential PII before redaction at query time
- Redaction at upload time (before indexing) is a planned Sprint 3 enhancement

## Testing PII Redaction

```bash
python eval/run_pii_eval.py
```

Or via the evaluation suite:
```bash
pytest tests/unit/test_pii_filter.py -v
```
