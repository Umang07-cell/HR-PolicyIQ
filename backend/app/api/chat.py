from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.core.audit import log_action
from app.core.rate_limiter import check_rate_limit
from app.models.user import User
from app.rag.pipeline import run_rag_pipeline

router = APIRouter(prefix="/chat", tags=["HR AI Chat"])


class ChatRequest(BaseModel):
    query: str
    module: Optional[str] = None


@router.post("/", summary="Send a query to the HR AI assistant")
async def chat(
    req: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    if len(req.query) > 2000:
        raise HTTPException(status_code=400, detail="Query too long (max 2000 characters)")

    # Per-user rate limit (PRD Section 11.5: 30 queries/min)
    await check_rate_limit(f"chat:{current_user.id}", limit=30, window=60)

    result = await run_rag_pipeline(
        query=req.query,
        role=current_user.role,
        department=current_user.department,
        location=current_user.location,
        module=req.module,
        user_id=current_user.id,
    )

    log_action(db, current_user.id, "CHAT_QUERY", "chat", None, {
        "query": req.query[:200],
        "confidence": result.get("confidence"),
        "llm_called": result.get("llm_called", False),
        "module": req.module,
    })

    return result
