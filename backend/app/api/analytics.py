from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.core.dependencies import require_role
from app.models.user import User
from app.models.document import Document
from app.models.audit_log import AuditLog
import json

router = APIRouter(prefix="/analytics", tags=["Analytics"])

CACHE_TTL = 60  # seconds


def _get_redis():
    try:
        from app.db.redis_client import get_redis
        return get_redis()
    except Exception:
        return None


def _cache_get(key: str):
    r = _get_redis()
    if not r:
        return None
    try:
        val = r.get(key)
        return json.loads(val) if val else None
    except Exception:
        return None


def _cache_set(key: str, value, ttl: int = CACHE_TTL):
    r = _get_redis()
    if not r:
        return
    try:
        r.setex(key, ttl, json.dumps(value, default=str))
    except Exception:
        pass


def _cache_delete(pattern: str):
    r = _get_redis()
    if not r:
        return
    try:
        keys = r.keys(pattern)
        if keys:
            r.delete(*keys)
    except Exception:
        pass


def get_platform_stats(db: Session) -> dict:
    return {
        "total_users": db.query(User).count(),
        "total_documents": db.query(Document).count(),
        "indexed_documents": db.query(Document).filter(Document.is_indexed == True).count(),
        "total_queries": db.query(AuditLog).filter(AuditLog.action == "CHAT_QUERY").count(),
    }


@router.get("/overview", summary="High-level platform analytics")
def overview(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("hr_admin", "executive")),
):
    cached = _cache_get("analytics:overview")
    if cached:
        return cached
    data = get_platform_stats(db)
    _cache_set("analytics:overview", data)
    return data


@router.get("/chat-usage", summary="Chat usage statistics")
def chat_usage(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("hr_admin", "executive")),
):
    cached = _cache_get("analytics:chat_usage")
    if cached:
        return cached
    total = db.query(AuditLog).filter(AuditLog.action == "CHAT_QUERY").count()
    top_users_raw = (
        db.query(AuditLog.user_id, func.count(AuditLog.id).label("queries"))
        .filter(AuditLog.action == "CHAT_QUERY")
        .group_by(AuditLog.user_id)
        .order_by(func.count(AuditLog.id).desc())
        .limit(10)
        .all()
    )
    data = {
        "total_queries": total,
        "top_users": [{"user_id": r.user_id, "queries": r.queries} for r in top_users_raw],
    }
    _cache_set("analytics:chat_usage", data)
    return data


@router.get("/chat-feedback", summary="Recent negative chat feedback")
def get_recent_chat_feedback(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("hr_admin", "executive")),
):
    logs = (
        db.query(AuditLog, User)
        .outerjoin(User, AuditLog.user_id == User.id)
        .filter(AuditLog.action == "CHAT_FEEDBACK")
        .order_by(AuditLog.timestamp.desc())
        .limit(100)
        .all()
    )
    
    result = []
    for log, user in logs:
        is_pos = log.detail.get("is_positive", True)
        if not is_pos:
            result.append({
                "id": log.id,
                "timestamp": log.timestamp,
                "user_name": user.full_name if user else "Unknown",
                "query": log.detail.get("query", ""),
                "suggestion": log.detail.get("suggestion", ""),
            })
            
    return result


@router.delete("/chat-feedback/{log_id}", summary="Delete a chat feedback record")
def delete_chat_feedback(
    log_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("hr_admin", "executive")),
):
    log_entry = db.query(AuditLog).filter(AuditLog.id == log_id, AuditLog.action == "CHAT_FEEDBACK").first()
    if log_entry:
        db.delete(log_entry)
        db.commit()
    return {"status": "success"}
