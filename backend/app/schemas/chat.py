from pydantic import BaseModel
from typing import List, Optional


class Citation(BaseModel):
    # BUG-H FIX: document_id is Optional[int] — Qdrant payload may not have it
    # (e.g. chunks indexed before the DB record was committed, or manual test data).
    # Keeping it Optional prevents a serialization crash on valid retrieved chunks.
    document_id: Optional[int] = None
    document_title: str
    chunk_text: str
    score: float
    page: Optional[int] = None
    chunk_index: Optional[int] = None   # section position within the page


class ChatRequest(BaseModel):
    query: str
    module: Optional[str] = None          # filter by HR module
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    citations: List[Citation]
    confidence: float
    confidence_label: str                 # "high" | "medium" | "low"
    query: str
    llm_called: bool
