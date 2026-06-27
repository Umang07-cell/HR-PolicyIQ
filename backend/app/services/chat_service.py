from app.rag.pipeline import run_rag_pipeline
from typing import Optional

async def process_chat(query: str, role: str, department: Optional[str], location: Optional[str], module: Optional[str]) -> dict:
    from app.rag.query_transform import transform_query
    transformed = transform_query(query)
    result = await run_rag_pipeline(transformed, role, department, location, module)
    result["original_query"] = query
    return result
