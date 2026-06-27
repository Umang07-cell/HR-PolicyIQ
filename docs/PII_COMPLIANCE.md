# PII Compliance

## What is detected and redacted
| Entity | Pattern | Example |
|---|---|---|
| Aadhaar | 12-digit with spaces | 2345 6789 0123 → [AADHAAR-REDACTED] |
| PAN | ABCDE1234F format | ABCDE1234F → [PAN-REDACTED] |
| UAN | 12-digit EPFO number | [UAN-REDACTED] |
| Salary | ₹/INR/LPA patterns | ₹50,000 → [IN_SALARY] |
| Name/Phone/Email | Via Presidio | Standard redaction |

## Where redaction runs
1. Document chunks — before embedding into Qdrant
2. LLM prompt — before sending to Ollama
3. LLM response — before returning to user

## Compliance standards
- IT Act 2000 (India)
- PDPB 2023 alignment
- ISO 27001 controls
