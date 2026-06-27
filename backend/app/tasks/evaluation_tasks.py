from app.tasks.celery_app import celery_app

@celery_app.task
def run_rag_evaluation(query: str, expected_answer: str, role: str = "employee"):
    """Async RAG quality evaluation task."""
    import asyncio
    from app.rag.pipeline import run_rag_pipeline
    from app.services.evaluation_service import compute_faithfulness, compute_answer_relevance
    result = asyncio.run(run_rag_pipeline(query, role))
    faithfulness = compute_faithfulness(result["answer"], result["citations"])
    relevance = compute_answer_relevance(query, result["answer"])
    return {"query": query, "answer": result["answer"], "faithfulness": faithfulness, "relevance": relevance, "confidence": result["confidence"]}
