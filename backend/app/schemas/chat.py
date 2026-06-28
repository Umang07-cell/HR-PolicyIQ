from pydantic import BaseModel
from typing import List, Optional


class Citation(BaseModel):
    document_id: Optional[int] = None
    document_title: str
    chunk_text: str
    score: float
    page: Optional[int] = None
    chunk_index: Optional[int] = None


class ChatRequest(BaseModel):
    query: str
    module: Optional[str] = None
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    citations: List[Citation]
    confidence: float
    confidence_label: str
    query: str
    llm_called: bool
