import fitz  # PyMuPDF
from pathlib import Path

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract all text from a PDF given its raw bytes."""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()

    if not text.strip():
        raise ValueError(
            "SCANNED_PDF: No text could be extracted from this PDF. "
            "It appears to be a scanned or image-based document. "
            "Please use a PDF with selectable text."
        )
    return text.strip()

def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    """Route to correct extractor based on file type."""
    ext = Path(filename).suffix.lower()
    if ext == ".pdf":
        return extract_text_from_pdf(file_bytes)
    elif ext in [".txt", ".md"]:
        return file_bytes.decode("utf-8", errors="ignore")
    else:
        raise ValueError(f"Unsupported file type: {ext}")

def chunk_text(text: str, max_chars: int = 90000) -> list[str]:
    """
    Split long text into chunks to stay within Groq context limits.
    90000 chars ≈ ~22k tokens — well within the 128k window.
    For MVP, most papers will fit in one chunk.
    """
    if len(text) <= max_chars:
        return [text]
    chunks = []
    while text:
        chunks.append(text[:max_chars])
        text = text[max_chars:]
    return chunks
