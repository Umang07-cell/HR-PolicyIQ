import redis
from app.core.config import settings

_pool = None


def get_redis_pool() -> redis.ConnectionPool:
    global _pool
    if _pool is None:
        _pool = redis.ConnectionPool.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            max_connections=20,
        )
    return _pool


def get_redis() -> redis.Redis:
    return redis.Redis(connection_pool=get_redis_pool())
