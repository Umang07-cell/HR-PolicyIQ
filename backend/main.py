import os
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.logging import logger
from app.core.middleware import logging_middleware
from app.core.exceptions import HRPlatformException, hr_exception_handler, generic_exception_handler
from app.db.base import Base
from app.db.session import engine
from app.db.qdrant_client import init_qdrant, ensure_collection
from app.db.redis_client import get_redis_pool

from app.models import user, document, audit_log, leave, grievance, payroll, performance, recruitment, notification  # noqa


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize per-worker clients after fork
    init_qdrant()
    get_redis_pool()

    Base.metadata.create_all(bind=engine)

    loop = asyncio.get_event_loop()

    try:
        from app.rag.embedder import get_embedder
        await loop.run_in_executor(None, get_embedder)
        logger.info("embedder_ready")
    except Exception as e:
        logger.warning("embedder_warmup_failed", error=str(e))

    try:
        from app.rag.reranker import warm_reranker
        await loop.run_in_executor(None, warm_reranker)
    except Exception as e:
        logger.warning("reranker_warmup_failed", error=str(e))

    try:
        ensure_collection()
        logger.info("qdrant_ready")
    except Exception as e:
        logger.warning("qdrant_unavailable", error=str(e))

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    yield


app = FastAPI(
    title="HR PolicyIQ API",
    description="Enterprise HR Policy Automation Platform — Hybrid RAG · ABAC · PII Redaction",
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG or settings.ENVIRONMENT != "production" else None,
    redoc_url=None,
)

app.middleware("http")(logging_middleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["*"],
)

app.add_exception_handler(HRPlatformException, hr_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

from app.api import auth, documents, chat, admin, websocket, leave, payroll, grievance, attestation, performance, recruitment, analytics  # noqa

app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(chat.router)
app.include_router(admin.router)
app.include_router(websocket.router)
app.include_router(leave.router)
app.include_router(payroll.router)
app.include_router(grievance.router)
app.include_router(attestation.router)
app.include_router(performance.router)
app.include_router(recruitment.router)
app.include_router(analytics.router)


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "version": settings.APP_VERSION}


@app.get("/health/ready", tags=["Health"])
def health_ready():
    from app.db.session import SessionLocal
    issues = []

    try:
        db = SessionLocal()
        db.execute(__import__("sqlalchemy").text("SELECT 1"))
        db.close()
    except Exception as e:
        issues.append(f"postgres: {e}")

    try:
        r = __import__("app.db.redis_client", fromlist=["get_redis"]).get_redis()
        r.ping()
    except Exception as e:
        issues.append(f"redis: {e}")

    try:
        from app.db.qdrant_client import get_qdrant
        get_qdrant().get_collections()
    except Exception as e:
        issues.append(f"qdrant: {e}")

    if issues:
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=503, content={"status": "degraded", "issues": issues})

    return {"status": "ready"}
