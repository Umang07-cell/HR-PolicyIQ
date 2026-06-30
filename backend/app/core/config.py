from pydantic_settings import BaseSettings
from pydantic import validator
from typing import List, Set


ALLOWED_MODULES: Set[str] = {"policy"}


class Settings(BaseSettings):
    APP_NAME: str = "HR Automation Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    DATABASE_URL: str = "postgresql://hruser:hrpass@localhost:5432/hrplatform"

    SECRET_KEY: str = "change-me-in-production-use-openssl-rand-hex-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    @validator("SECRET_KEY")
    def secret_key_must_be_set(cls, v, values):
        weak = {"change-me-in-production-use-openssl-rand-hex-32", "dev-secret-change-in-prod"}
        if values.get("ENVIRONMENT", "development") == "production" and v in weak:
            raise ValueError("SECRET_KEY must be changed from default in production. Run: openssl rand -hex 32")
        return v

    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_COLLECTION: str = "hr_documents"

    EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"
    EMBEDDING_DIM: int = 384

    GROQ_API_KEY: str = ""
    LLM_MODEL: str = "llama-3.3-70b-versatile"

    REDIS_URL: str = "redis://localhost:6379/0"

    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE_MB: int = 50

    ALLOWED_ORIGINS: List[str] = [
        "http://localhost", "http://localhost:5173", "http://localhost:5174",
        "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174",
    ]

class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
