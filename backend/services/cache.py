import json
import os
import time
import logging
from typing import Optional, Any

logger = logging.getLogger("botanic_ai.cache")


class CacheService:
    def __init__(self, redis_url: Optional[str] = None):
        self.redis_url = redis_url or os.getenv("REDIS_URL", "redis://localhost:6379")
        self.redis_client = None
        self.in_memory_cache: dict[str, tuple[float, Any]] = {}
        self.default_ttl = 3600 * 24  # 24 hours cache

        try:
            import redis
            self.redis_client = redis.Redis.from_url(self.redis_url, decode_responses=True, socket_connect_timeout=1)
            self.redis_client.ping()
            logger.info("Connected to Redis cache at %s", self.redis_url)
        except Exception:
            # Clean in-memory TTL fallback without noisy trace
            self.redis_client = None

    def get(self, key: str) -> Optional[Any]:
        norm_key = key.strip().lower()
        if self.redis_client:
            try:
                val = self.redis_client.get(norm_key)
                if val:
                    return json.loads(val)
            except Exception as e:
                logger.warning("Redis get error: %s", e)

        # In-memory fallback check
        if norm_key in self.in_memory_cache:
            expiry, val = self.in_memory_cache[norm_key]
            if time.time() < expiry:
                return val
            else:
                del self.in_memory_cache[norm_key]
        return None

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        norm_key = key.strip().lower()
        ttl = ttl or self.default_ttl
        if self.redis_client:
            try:
                serialized = json.dumps(value, default=str)
                self.redis_client.setex(norm_key, ttl, serialized)
                return
            except Exception as e:
                logger.warning("Redis set error: %s", e)

        # In-memory fallback
        self.in_memory_cache[norm_key] = (time.time() + ttl, value)

    def clear(self) -> None:
        self.in_memory_cache.clear()
        if self.redis_client:
            try:
                self.redis_client.flushdb()
            except Exception:
                pass


# Global singletons
cache_service = CacheService()
search_cache = cache_service
