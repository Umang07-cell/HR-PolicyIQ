"""Run RAGAS evaluation on golden Q&A sets."""
import json, asyncio, sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

async def evaluate_role(role: str, qa_file: str):
    from app.rag.pipeline import run_rag_pipeline
    from app.services.evaluation_service import compute_faithfulness, compute_answer_relevance
    with open(qa_file) as f:
        cases = json.load(f)
    results = []
    for case in cases:
        result = await run_rag_pipeline(case["question"], role, module=case.get("module"))
        results.append({
            "question": case["question"],
            "answer": result["answer"],
            "confidence": result["confidence"],
            "faithfulness": compute_faithfulness(result["answer"], result["citations"]),
            "relevance": compute_answer_relevance(case["question"], result["answer"]),
        })
    avg_conf = sum(r["confidence"] for r in results) / len(results)
    avg_faith = sum(r["faithfulness"] for r in results) / len(results)
    print(f"\n=== {role.upper()} ===")
    print(f"Avg Confidence: {avg_conf:.3f} | Avg Faithfulness: {avg_faith:.3f}")
    return results

if __name__ == "__main__":
    base = os.path.dirname(__file__)
    asyncio.run(evaluate_role("employee", f"{base}/golden_qa_employee.json"))
    asyncio.run(evaluate_role("manager", f"{base}/golden_qa_manager.json"))
    asyncio.run(evaluate_role("hr_admin", f"{base}/golden_qa_hr_admin.json"))
