import time
import asyncio
from fastapi import HTTPException
from app.db.redis_client import get_redis
from app.core.logging import logger


async def check_rate_limit(key: str, limit: int = 30, window: int = 60):
    try:
        redis = get_redis()
        now = time.time()
        window_start = now - window
        full_key = f"rate:{key}"

        # Run blocking Redis calls in threadpool
        loop = asyncio.get_event_loop()

        def _rate_limit_check():
            pipe = redis.pipeline()
            pipe.zremrangebyscore(full_key, 0, window_start)
            pipe.zadd(full_key, {str(now): now})
            pipe.zcard(full_key)
            results = pipe.execute()
            count = results[2]

            if count == 1:
                redis.expire(full_key, window)

            return count

        count = await loop.run_in_executor(None, _rate_limit_check)

        if count > limit:
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Max {limit} requests per {window}s.",
                headers={"Retry-After": str(window)},
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.warning("rate_limit_check_failed", key=key, error=str(e))
        # Fail open: allow the request but log the failure
        pass
