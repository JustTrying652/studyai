from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.supabase_service import upload_file_to_storage
from models.schemas import UploadResponse
import uuid

router = APIRouter()

ALLOWED_TYPES = ["application/pdf", "text/plain"]
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

@router.post("/", response_model=UploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    user_id: str = Form(...),
):
    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only PDF and TXT files are supported.")

    file_bytes = await file.read()

    # Validate file size
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max size is 10MB.")

    # Store under user's folder with a unique name
    unique_name = f"{uuid.uuid4()}_{file.filename}"
    file_path = f"{user_id}/{unique_name}"

    upload_file_to_storage(file_bytes, file_path)

    return UploadResponse(
        file_path=file_path,
        file_name=file.filename,
        message="File uploaded successfully."
    )
