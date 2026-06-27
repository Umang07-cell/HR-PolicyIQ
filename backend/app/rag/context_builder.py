from typing import List, Dict

def build_context(chunks: List[Dict]) -> str:
    return "\n\n---\n\n".join([
        f"[{c['document_title']}]\n{c['text']}"
        for c in chunks
    ])
