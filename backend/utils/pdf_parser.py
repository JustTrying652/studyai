import fitz  # PyMuPDF
import base64
import io
from pathlib import Path
from groq import Groq
from config import settings

client = Groq(api_key=settings.groq_api_key)

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF. Falls back to OCR if scanned."""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()

    # If text extracted successfully, return it
    if text.strip():
        doc.close()
        return text.strip()

    # No text found — likely scanned. Use OCR via Groq Vision
    print("No text extracted — attempting OCR via Groq Vision...")
    ocr_text = ocr_pdf_with_groq(doc)
    doc.close()

    if not ocr_text.strip():
        raise ValueError(
            "SCANNED_PDF: Could not extract text even with OCR. "
            "Please ensure the document is clear and legible."
        )

    return ocr_text.strip()


def ocr_pdf_with_groq(doc: fitz.Document) -> str:
    """Convert PDF pages to images and extract text using Groq Vision."""
    all_text = []

    # Limit to first 10 pages to stay within API limits
    total_pages = min(len(doc), 10)

    for page_num in range(total_pages):
        page = doc[page_num]

        # Render page to image at 150 DPI (good balance of quality vs size)
        mat = fitz.Matrix(150 / 72, 150 / 72)
        pix = page.get_pixmap(matrix=mat)

        # Convert to PNG bytes then base64
        img_bytes = pix.tobytes("png")
        img_b64 = base64.standard_b64encode(img_bytes).decode("utf-8")

        print(f"OCR processing page {page_num + 1}/{total_pages}...")

        try:
            response = client.chat.completions.create(
                model=settings.groq_vision_model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{img_b64}"
                                }
                            },
                            {
                                "type": "text",
                                "text": (
                                    "This is a scanned page from an academic document. "
                                    "Please extract ALL text from this image exactly as it appears. "
                                    "Preserve the structure including question numbers, headings, "
                                    "and formatting. Output only the extracted text, nothing else."
                                )
                            }
                        ]
                    }
                ],
                max_tokens=2048,
            )
            page_text = response.choices[0].message.content
            all_text.append(f"--- Page {page_num + 1} ---\n{page_text}")

        except Exception as e:
            print(f"OCR failed for page {page_num + 1}: {e}")
            all_text.append(f"--- Page {page_num + 1} ---\n[OCR failed for this page]")

    return "\n\n".join(all_text)


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
    """Split long text into chunks to stay within Groq context limits."""
    if len(text) <= max_chars:
        return [text]
    chunks = []
    while text:
        chunks.append(text[:max_chars])
        text = text[max_chars:]
    return chunks