"""
Per-user sliding window rate limiter backed by Redis.
Falls back silently if Redis is unavailable (dev mode).
"""
import time
from fastapi import HTTPException
from app.db.redis_client import get_redis


async def check_rate_limit(key: str, limit: int = 30, window: int = 60):
    """Raise 429 if key has exceeded `limit` calls in `window` seconds."""
    try:
        redis = get_redis()
        pipe = redis.pipeline()
        now = time.time()
        window_start = now - window
        full_key = f"rate:{key}"
        pipe.zremrangebyscore(full_key, 0, window_start)
        pipe.zadd(full_key, {str(now): now})
        pipe.zcard(full_key)
        pipe.expire(full_key, window)
        results = pipe.execute()
        count = results[2]
        if count > limit:
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Max {limit} requests per {window}s.",
                headers={"Retry-After": str(window)},
            )
    except HTTPException:
        raise
    except Exception:
        # Redis unavailable — degrade gracefully in dev
        pass
