"""
RAGAS evaluation on golden Q&A sets.

Usage:
    python eval/run_ragas.py                    # full eval, all roles
    python eval/run_ragas.py --role employee    # single role
    python eval/run_ragas.py --dry-run          # skip LLM, test pipeline wiring only
"""
import json
import asyncio
import argparse
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))


def _compute_faithfulness(answer: str, citations: list) -> float:
    """
    Heuristic faithfulness: fraction of [SOURCE N] references in the answer
    that are present in the returned citations list.
    A proper RAGAS implementation would use an LLM as judge.
    """
    if not citations:
        return 0.0
    import re
    cited = set(re.findall(r"\[SOURCE (\d+)\]", answer))
    if not cited:
        return 0.5
    valid = sum(1 for n in cited if int(n) <= len(citations))
    return round(valid / len(cited), 3)


def _compute_answer_relevance(question: str, answer: str) -> float:
    """
    Heuristic relevance: keyword overlap between question and answer.
    Replace with LLM-as-judge for production RAGAS evaluation.
    """
    if not answer or "do not contain" in answer.lower():
        return 0.1
    q_words = set(question.lower().split())
    a_words = set(answer.lower().split())
    overlap = q_words & a_words
    return round(min(len(overlap) / max(len(q_words), 1), 1.0), 3)


async def evaluate_role(role: str, qa_file: str, dry_run: bool = False) -> list:
    from app.rag.pipeline import run_rag_pipeline

    with open(qa_file) as f:
        cases = json.load(f)

    results = []
    for case in cases:
        question = case["question"]
        expected = case.get("expected_answer", "")
        module = case.get("module")

        if dry_run:
            result = {
                "answer": "[DRY RUN — LLM skipped]",
                "citations": [],
                "confidence": 0.0,
                "llm_called": False,
                "query": question,
                "confidence_label": "low",
            }
        else:
            result = await run_rag_pipeline(
                query=question,
                role=role,
                department=None,
                location=None,
                module=module,
                user_id=0,
            )

        faithfulness = _compute_faithfulness(result["answer"], result["citations"])
        relevance = _compute_answer_relevance(question, result["answer"])

        results.append({
            "question": question,
            "expected": expected,
            "answer": result["answer"],
            "confidence": result["confidence"],
            "faithfulness": faithfulness,
            "relevance": relevance,
            "citations_count": len(result["citations"]),
        })

    if results:
        avg_conf = sum(r["confidence"] for r in results) / len(results)
        avg_faith = sum(r["faithfulness"] for r in results) / len(results)
        avg_rel = sum(r["relevance"] for r in results) / len(results)
        print(f"\n=== {role.upper()} ({len(results)} questions) ===")
        print(f"Avg Confidence : {avg_conf:.3f}")
        print(f"Avg Faithfulness: {avg_faith:.3f}")
        print(f"Avg Relevance  : {avg_rel:.3f}")

        for r in results:
            status = "PASS" if r["confidence"] > 0.5 and r["faithfulness"] > 0.5 else "FAIL"
            print(f"  [{status}] {r['question'][:60]} | conf={r['confidence']:.2f} faith={r['faithfulness']:.2f}")

    return results


async def run_pii_eval(pii_file: str):
    from app.rag.pii_filter import redact_india_pii
    with open(pii_file) as f:
        cases = json.load(f)

    passed = 0
    for case in cases:
        result = redact_india_pii(case["input"])
        ok = True
        if "should_contain" in case and case["should_contain"] not in result:
            print(f"  FAIL (missing): {case['should_contain']} not in: {result}")
            ok = False
        if "should_not_contain" in case and case["should_not_contain"] in result:
            print(f"  FAIL (present): {case['should_not_contain']} still in: {result}")
            ok = False
        if ok:
            passed += 1

    print(f"\n=== PII EVAL: {passed}/{len(cases)} passed ===")


async def run_abac_eval(abac_file: str):
    with open(abac_file) as f:
        cases = json.load(f)

    passed = 0
    for case in cases:
        user_role = case["user_role"]
        doc_roles = case["document_access_roles"]
        expected = case["expected_accessible"]
        actual = user_role in doc_roles or "all" in doc_roles
        ok = actual == expected
        if ok:
            passed += 1
        else:
            print(f"  FAIL: role={user_role} doc_roles={doc_roles} expected={expected} got={actual}")

    print(f"\n=== ABAC EVAL: {passed}/{len(cases)} passed ===")


async def main():
    parser = argparse.ArgumentParser(description="HR PolicyIQ RAGAS evaluation")
    parser.add_argument("--role", choices=["employee", "manager", "hr_admin", "all"], default="all")
    parser.add_argument("--dry-run", action="store_true", help="Skip LLM calls — test pipeline wiring only")
    parser.add_argument("--pii", action="store_true", help="Run PII redaction evaluation only")
    parser.add_argument("--abac", action="store_true", help="Run ABAC logic evaluation only")
    args = parser.parse_args()

    base = Path(__file__).parent

    if args.pii:
        await run_pii_eval(str(base / "pii_test_cases.json"))
        return

    if args.abac:
        await run_abac_eval(str(base / "abac_test_cases.json"))
        return

    role_files = {
        "employee": base / "golden_qa_employee.json",
        "manager": base / "golden_qa_manager.json",
        "hr_admin": base / "golden_qa_hr_admin.json",
    }

    roles = [args.role] if args.role != "all" else list(role_files.keys())

    all_results = []
    for role in roles:
        qa_file = role_files[role]
        if not qa_file.exists():
            print(f"WARNING: {qa_file} not found, skipping {role}")
            continue
        results = await evaluate_role(role, str(qa_file), dry_run=args.dry_run)
        all_results.extend(results)

    if all_results:
        total_conf = sum(r["confidence"] for r in all_results) / len(all_results)
        total_faith = sum(r["faithfulness"] for r in all_results) / len(all_results)
        passed = sum(1 for r in all_results if r["confidence"] > 0.5 and r["faithfulness"] > 0.5)
        print(f"\n=== OVERALL: {passed}/{len(all_results)} passed ===")
        print(f"Avg Confidence: {total_conf:.3f} | Avg Faithfulness: {total_faith:.3f}")


if __name__ == "__main__":
    asyncio.run(main())
