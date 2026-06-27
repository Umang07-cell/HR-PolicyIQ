from pydantic_settings import BaseSettings
from pydantic import validator
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "HR Automation Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql://hruser:hrpass@localhost:5432/hrplatform"

    # JWT — BUG-18: validator rejects weak default in production
    SECRET_KEY: str = "change-me-in-production-use-openssl-rand-hex-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    @validator("SECRET_KEY")
    def secret_key_must_be_set(cls, v, values):
        weak_defaults = {
            "change-me-in-production-use-openssl-rand-hex-32",
            "dev-secret-change-in-prod",
        }
        if not values.get("DEBUG", False) and v in weak_defaults:
            import os
            if os.environ.get("ENVIRONMENT", "development") == "production":
                raise ValueError(
                    "SECRET_KEY must be changed from default in production. "
                    "Run: openssl rand -hex 32"
                )
        return v

    # Qdrant
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_COLLECTION: str = "hr_documents"

    # Embedding model
    # BUG-A FIX: defaults now match .env (bge-small-en-v1.5 / 384).
    # bge-m3 (1024-dim) requires GPU and FlagEmbedding; bge-small runs on CPU.
    # If you switch to bge-m3, update BOTH values together and delete/recreate
    # the Qdrant collection — mismatched dims cause silent search failures.
    EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"
    EMBEDDING_DIM: int = 384

    # LLM — Groq (fast inference, free tier)
    GROQ_API_KEY: str = ""
    LLM_MODEL: str = "llama-3.1-8b-instant"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # File storage
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE_MB: int = 50

    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "http://localhost"]

    class Config:
        env_file = ".env"


settings = Settings()
