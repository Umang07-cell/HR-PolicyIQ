# RAG Evaluation Suite

Tests RAG quality using RAGAS framework.

## Run
```bash
pip install ragas datasets
python eval/run_ragas.py
```

## Files
- `golden_qa_*.json` — ground truth Q&A per role
- `abac_test_cases.json` — ABAC access control test cases
- `pii_test_cases.json` — PII redaction test cases
