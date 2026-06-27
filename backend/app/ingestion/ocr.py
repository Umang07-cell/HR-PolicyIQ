"""
OCR stub — for scanned PDFs.
Production: use Tesseract or Azure Document Intelligence.
Prototype: returns empty string with a note.
"""
def ocr_image_to_text(image_path: str) -> str:
    try:
        import pytesseract
        from PIL import Image
        return pytesseract.image_to_string(Image.open(image_path))
    except ImportError:
        return ""

def is_scanned_pdf(pages: list) -> bool:
    """Heuristic: if avg text per page < 50 chars, likely scanned."""
    if not pages:
        return False
    avg = sum(len(p.get("text", "")) for p in pages) / len(pages)
    return avg < 50
