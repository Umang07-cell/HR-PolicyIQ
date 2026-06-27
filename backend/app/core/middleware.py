"""
Request logging middleware — BUG-07 fix: now attached in main.py via app.middleware("http").
"""
from fastapi import Request
import time
from app.core.logging import logger


async def logging_middleware(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration_ms = round((time.time() - start) * 1000, 2)
    logger.info(
        "request",
        method=request.method,
        path=request.url.path,
        status=response.status_code,
        ms=duration_ms,
        ip=request.client.host if request.client else "unknown",
    )
    return response
