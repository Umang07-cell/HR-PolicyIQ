from fastapi import Request
from fastapi.responses import JSONResponse
from app.core.logging import logger


class HRPlatformException(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail


async def hr_exception_handler(request: Request, exc: HRPlatformException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


async def generic_exception_handler(request: Request, exc: Exception):
    logger.error("unhandled_exception", path=request.url.path, error=str(exc), exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})
