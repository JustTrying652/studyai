from fastapi import APIRouter, HTTPException
from models.schemas import ProcessRequest, ProcessResponse
from services.supabase_service import download_file_from_storage, save_result
from services.groq_service import generate_response
from utils.pdf_parser import extract_text_from_file, chunk_text
from pathlib import Path

router = APIRouter()

@router.post("/", response_model=ProcessResponse)
async def process_file(request: ProcessRequest):
    # 1. Download file from Supabase Storage
    try:
        file_bytes = download_file_from_storage(request.file_path)
    except Exception:
        raise HTTPException(status_code=404, detail="File not found in storage.")

    # 2. Extract text
    raw_name = Path(request.file_path).name
    file_name = "_".join(raw_name.split("_")[1:]) if "_" in raw_name else raw_name
    try:
        text = extract_text_from_file(file_bytes, file_name)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not text:
        raise HTTPException(status_code=422, detail="Could not extract text from file. Is it a scanned image PDF?")

    # 3. Chunk if needed and process (for MVP, use first chunk only)
    chunks = chunk_text(text)
    content = chunks[0]  # Future: process all chunks and merge

    # 4. Send to Groq
    try:
        result = generate_response(content, request.mode.value)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI processing failed: {str(e)}")

    # 5. Save result to Supabase
    saved = save_result(
        user_id=request.user_id,
        file_name=file_name,
        file_path=request.file_path,
        mode=request.mode.value,
        result=result,
        extracted_text=content,
    )

    return ProcessResponse(
        id=saved["id"],
        mode=request.mode,
        result=result,
        file_name=file_name,
        created_at=saved["created_at"],
    )
