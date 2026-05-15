from pydantic import BaseModel
from enum import Enum
from typing import Optional

class ProcessMode(str, Enum):
    answers = "answers"       # Answer questions in a past paper
    notes = "notes"           # Summarize notes/content
    both = "both"             # Do both

class ProcessRequest(BaseModel):
    file_path: str            # Path in Supabase Storage
    mode: ProcessMode
    user_id: str

class ProcessResponse(BaseModel):
    id: str
    mode: ProcessMode
    result: str
    file_name: str
    created_at: str

class UploadResponse(BaseModel):
    file_path: str
    file_name: str
    message: str
