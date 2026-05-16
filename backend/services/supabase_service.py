from supabase import create_client, Client
from config import settings

supabase: Client = create_client(settings.supabase_url, settings.supabase_service_key)

BUCKET_NAME = "study-files"

def upload_file_to_storage(file_bytes: bytes, file_path: str) -> str:
    """Upload a file to Supabase Storage. Returns the storage path."""
    supabase.storage.from_(BUCKET_NAME).upload(
        path=file_path,
        file=file_bytes,
        file_options={"content-type": "application/pdf"}
    )
    return file_path

def download_file_from_storage(file_path: str) -> bytes:
    """Download a file from Supabase Storage. Returns raw bytes."""
    response = supabase.storage.from_(BUCKET_NAME).download(file_path)
    return response

def save_result(user_id: str, file_name: str, file_path: str, mode: str, result: str, extracted_text: str) -> dict:
    """Save AI-generated result to the study_results table."""
    data = {
        "user_id": user_id,
        "file_name": file_name,
        "file_path": file_path,
        "mode": mode,
        "result": result,
        "extracted_text": extracted_text
    }
    response = supabase.table("study_results").insert(data).execute()
    return response.data[0]

def get_user_history(user_id: str) -> list:
    """Fetch all past results for a user."""
    response = (
        supabase.table("study_results")
        .select("id, file_name, mode, created_at, result")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return response.data

def get_result_by_id(result_id: str, user_id: str) -> dict | None:
    """Fetch a single result by ID, scoped to the user."""
    response = (
        supabase.table("study_results")
        .select("id, file_name, mode, created_at, result, extracted_text")
        .eq("id", result_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    return response.data

def delete_result(result_id: str, user_id: str) -> bool:
    """Delete a result. Returns True if successful."""
    supabase.table("study_results") \
        .delete() \
        .eq("id", result_id) \
        .eq("user_id", user_id) \
        .execute()
    return True