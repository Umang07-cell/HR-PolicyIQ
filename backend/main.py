import os
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.logging import setup_logging
from app.core.middleware import logging_middleware
from app.core.exceptions import HRPlatformException, hr_exception_handler, generic_exception_handler
from app.db.base import Base
from app.db.session import engine
from app.db.qdrant_client import ensure_collection

# Import all models so create_all sees them
from app.models import *  # noqa

from app.api import (
    documents, chat, admin, websocket
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    Base.metadata.create_all(bind=engine)

    loop = asyncio.get_event_loop()

    # 1. Pre-warm embedding model — so first upload/query isn't slow
    try:
        from app.rag.embedder import get_embedder
        await loop.run_in_executor(None, get_embedder)
        print("Embedding model warmed up.")
    except Exception as e:
        print(f"Warning: Embedding model warmup failed: {e}")

    # 2. Pre-warm reranker — SPEED FIX: was previously loaded fresh on every request
    #    (~1-3s overhead per chat call). Now loaded once here at startup.
    try:
        from app.rag.reranker import warm_reranker
        await loop.run_in_executor(None, warm_reranker)
    except Exception as e:
        print(f"Warning: Reranker warmup failed (will use RRF fallback): {e}")

    # 3. Ensure Qdrant collection exists with correct dimensions
    try:
        ensure_collection()
    except Exception as e:
        print(f"Warning: Qdrant not available: {e}")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    yield


app = FastAPI(
    title="HR Automation Platform API",
    description="""
## Enterprise HR Platform

**6 HR Modules:** Policy Search, Leave, Payroll, Recruitment, Performance, Grievance

**Security:** ABAC filter runs *inside* Qdrant — restricted chunks never reach the LLM.
JWT tokens carry role + department + location claims.
""",
    version=settings.APP_VERSION,
    lifespan=lifespan
)

app.middleware("http")(logging_middleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(HRPlatformException, hr_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Routers
app.include_router(documents.router)
app.include_router(chat.router)
app.include_router(admin.router)
app.include_router(websocket.router)


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "version": settings.APP_VERSION}
