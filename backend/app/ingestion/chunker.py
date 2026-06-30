"""
Structure-aware chunker.

The parser emits page text where each line is a meaningful unit (a serialised table row
or a prose line). This chunker packs those lines into chunks of ~target_words, but never
splits a single line (so a table row keeps all its columns together). A small overlap of
trailing lines is carried into the next chunk to preserve retrieval continuity.
"""
from typing import List, Dict


def chunk_pages(pages: List[Dict], target_words: int = 280, overlap_words: int = 40) -> List[Dict]:
    chunks: List[Dict] = []

    for page_data in pages:
        page_num = page_data["page"]
        segments = [s.strip() for s in page_data["text"].split("\n") if s.strip()]
        if not segments:
            continue

        buf: List[str] = []
        buf_words = 0
        chunk_idx = 0

        def emit():
            nonlocal buf, buf_words, chunk_idx
            text = "\n".join(buf).strip()
            if text:
                chunks.append({"text": text, "page": page_num, "chunk_index": chunk_idx})
                chunk_idx += 1

        for seg in segments:
            words = seg.split()
            w = len(words)

            # A single segment larger than the target is split on word boundaries.
            if w > target_words:
                emit()
                buf, buf_words = [], 0
                start = 0
                step = max(1, target_words - overlap_words)
                while start < len(words):
                    piece = " ".join(words[start:start + target_words])
                    chunks.append({"text": piece, "page": page_num, "chunk_index": chunk_idx})
                    chunk_idx += 1
                    start += step
                continue

            if buf_words + w > target_words and buf:
                emit()
                # Carry trailing segments as overlap into the next chunk.
                overlap_buf: List[str] = []
                overlap_count = 0
                for prev in reversed(buf):
                    pc = len(prev.split())
                    if overlap_count + pc > overlap_words:
                        break
                    overlap_buf.insert(0, prev)
                    overlap_count += pc
                buf = overlap_buf
                buf_words = overlap_count

            buf.append(seg)
            buf_words += w

        emit()

    return chunks
