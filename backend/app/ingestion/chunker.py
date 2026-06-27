"""
Fixed-size chunker with overlap.
Production upgrade: hierarchical chunking via LlamaIndex.
"""
from typing import List, Dict

def chunk_pages(pages: List[Dict], chunk_size: int = 512, overlap: int = 64) -> List[Dict]:
    chunks = []
    for page_data in pages:
        text = page_data["text"]
        page_num = page_data["page"]
        words = text.split()
        start = 0
        chunk_idx = 0
        while start < len(words):
            end = min(start + chunk_size, len(words))
            chunk_text = " ".join(words[start:end])
            if chunk_text.strip():
                chunks.append({
                    "text": chunk_text,
                    "page": page_num,
                    "chunk_index": chunk_idx
                })
                chunk_idx += 1
            start += chunk_size - overlap
    return chunks
