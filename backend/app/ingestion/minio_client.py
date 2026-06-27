"""
MinIO client stub — for production file storage.
Prototype uses local filesystem. Swap this in Phase 2.
"""
import os, shutil
from app.core.config import settings

def save_file_local(file_content: bytes, filename: str) -> str:
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    path = os.path.join(settings.UPLOAD_DIR, filename)
    with open(path, "wb") as f:
        f.write(file_content)
    return path

def get_file_local(filename: str) -> bytes:
    path = os.path.join(settings.UPLOAD_DIR, filename)
    with open(path, "rb") as f:
        return f.read()

# Production MinIO client (uncomment when MinIO is available):
# from minio import Minio
# client = Minio(settings.MINIO_ENDPOINT, access_key=settings.MINIO_ACCESS_KEY, secret_key=settings.MINIO_SECRET_KEY, secure=False)
