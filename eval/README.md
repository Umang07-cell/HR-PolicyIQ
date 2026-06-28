# Evaluation Suite — HR PolicyIQ

Tests RAG quality, PII redaction, and ABAC access control.

## Quick Run

```bash
# Install dependencies
pip install ragas datasets

# Full evaluation (all roles)
python eval/run_ragas.py

# Single role
python eval/run_ragas.py --role employee

# Dry run — test pipeline wiring without LLM calls
python eval/run_ragas.py --dry-run

# PII redaction tests only
python eval/run_ragas.py --pii

# ABAC logic tests only
python eval/run_ragas.py --abac
```

## Files

| File | Description |
|---|---|
| `run_ragas.py` | Main evaluation script |
| `golden_qa_employee.json` | 10 employee-role Q&A pairs |
| `golden_qa_manager.json` | 5 manager-role Q&A pairs |
| `golden_qa_hr_admin.json` | 6 HR admin Q&A pairs |
| `pii_test_cases.json` | 8 PII redaction test cases |
| `abac_test_cases.json` | 8 ABAC access control test cases |

## Metrics

| Metric | Description | Target |
|---|---|---|
| **Confidence** | Pipeline confidence score (0–1) | > 0.70 |
| **Faithfulness** | Fraction of [SOURCE N] refs in valid citation range | > 0.80 |
| **Relevance** | Keyword overlap between question and answer | > 0.40 |

## Interpreting Results

- `[PASS]` = confidence > 0.5 AND faithfulness > 0.5
- `[FAIL]` = either metric below threshold — investigate the specific question

## Adding Questions

Add entries to `golden_qa_*.json`:

```json
{
  "question": "What is the maternity leave entitlement?",
  "expected_answer": "26 weeks of paid maternity leave",
  "module": "leave"
}
```

Target: 20+ questions per role for statistically meaningful evaluation.
