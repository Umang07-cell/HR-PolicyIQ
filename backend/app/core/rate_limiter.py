import time
from fastapi import HTTPException
from app.db.redis_client import get_redis


async def check_rate_limit(key: str, limit: int = 30, window: int = 60):
    try:
        redis = get_redis()
        now = time.time()
        window_start = now - window
        full_key = f"rate:{key}"

        pipe = redis.pipeline()
        pipe.zremrangebyscore(full_key, 0, window_start)
        pipe.zadd(full_key, {str(now): now})
        pipe.zcard(full_key)
        results = pipe.execute()

        count = results[2]

        # Only set TTL if the key was just created (count == 1)
        if count == 1:
            redis.expire(full_key, window)

        if count > limit:
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Max {limit} requests per {window}s.",
                headers={"Retry-After": str(window)},
            )
    except HTTPException:
        raise
    except Exception:
        pass
