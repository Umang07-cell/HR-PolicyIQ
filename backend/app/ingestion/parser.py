import os
from typing import List, Dict

DOCX_WORDS_PER_PAGE = 400


def parse_document(file_path: str, content_type: str) -> List[Dict]:
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf" or content_type == "application/pdf":
        return _parse_pdf(file_path)
    elif ext in (".docx", ".doc"):
        return _parse_docx(file_path)
    elif ext == ".txt":
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return [{"page": 1, "text": f.read()}]
    else:
        raise ValueError(f"Unsupported file type: {ext}")


def _parse_pdf(path: str) -> List[Dict]:
    from pypdf import PdfReader
    reader = PdfReader(path)
    pages = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        if text.strip():
            pages.append({"page": i + 1, "text": text})
    return pages


def _parse_docx(path: str) -> List[Dict]:
    from docx import Document
    doc = Document(path)
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    all_words = " ".join(paragraphs).split()

    pages = []
    page_num = 1
    for start in range(0, len(all_words), DOCX_WORDS_PER_PAGE):
        chunk_text = " ".join(all_words[start: start + DOCX_WORDS_PER_PAGE])
        if chunk_text.strip():
            pages.append({"page": page_num, "text": chunk_text})
            page_num += 1

    return pages if pages else [{"page": 1, "text": " ".join(all_words)}]
