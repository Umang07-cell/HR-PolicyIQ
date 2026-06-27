from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import json
from app.db.session import get_db, SessionLocal
from app.core.dependencies import get_current_user
from app.core.audit import log_action
from app.core.rate_limiter import check_rate_limit
from app.models.user import User
from app.rag.pipeline import run_rag_pipeline, run_rag_pipeline_stream

router = APIRouter(prefix="/chat", tags=["HR AI Chat"])


class ChatRequest(BaseModel):
    query: str
    module: Optional[str] = None


def _log_in_background(user_id: int, query: str, confidence: float, llm_called: bool, module: Optional[str]):
    db = SessionLocal()
    try:
        log_action(db, user_id, "CHAT_QUERY", "chat", None, {
            "query": query[:200],
            "confidence": confidence,
            "llm_called": llm_called,
            "module": module,
        })
    finally:
        db.close()


@router.post("/", summary="Send a query to the HR AI assistant")
async def chat(
    req: ChatRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    if len(req.query) > 2000:
        raise HTTPException(status_code=400, detail="Query too long (max 2000 characters)")

    await check_rate_limit(f"chat:{current_user.id}", limit=30, window=60)

    result = await run_rag_pipeline(
        query=req.query,
        role=current_user.role,
        department=current_user.department,
        location=current_user.location,
        module=req.module,
        user_id=current_user.id,
    )

    background_tasks.add_task(
        _log_in_background,
        current_user.id,
        req.query,
        result.get("confidence", 0.0),
        result.get("llm_called", False),
        req.module,
    )

    return result


@router.post("/stream", summary="Stream HR AI response token by token")
async def chat_stream(
    req: ChatRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    if len(req.query) > 2000:
        raise HTTPException(status_code=400, detail="Query too long (max 2000 characters)")

    await check_rate_limit(f"chat:{current_user.id}", limit=30, window=60)

    user_id = current_user.id
    user_role = current_user.role
    user_dept = current_user.department
    user_loc = current_user.location

    async def event_stream():
        full_answer = ""
        confidence = 0.0
        confidence_label = "low"
        llm_called = False

        async for chunk in run_rag_pipeline_stream(
            query=req.query,
            role=user_role,
            department=user_dept,
            location=user_loc,
            module=req.module,
            user_id=user_id,
        ):
            if chunk["type"] == "token":
                full_answer += chunk["text"]
                llm_called = True
                yield f"data: {json.dumps({'type': 'token', 'text': chunk['text']})}\n\n"

            elif chunk["type"] == "done":
                confidence = chunk.get("confidence", 0.0)
                confidence_label = chunk.get("confidence_label", "low")
                payload = {
                    "type": "done",
                    "citations": chunk.get("citations", []),
                    "confidence": confidence,
                    "confidence_label": confidence_label,
                }
                yield f"data: {json.dumps(payload)}\n\n"

            elif chunk["type"] == "abstain":
                yield f"data: {json.dumps({'type': 'abstain', 'text': chunk['text']})}\n\n"

        _log_in_background(user_id, req.query, confidence, llm_called, req.module)

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )