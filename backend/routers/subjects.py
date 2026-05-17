from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client
from config import settings
from services.supabase_service import supabase

router = APIRouter()

class CreateSubjectRequest(BaseModel):
    user_id: str
    name: str
    color: str = "#4f8ef7"

class AssignSubjectRequest(BaseModel):
    user_id: str
    subject_id: str | None  # None to unassign

@router.get("/{user_id}")
async def get_subjects(user_id: str):
    try:
        response = (
            supabase.table("subjects")
            .select("id, name, color, created_at")
            .eq("user_id", user_id)
            .order("created_at")
            .execute()
        )
        return {"subjects": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def create_subject(request: CreateSubjectRequest):
    try:
        response = (
            supabase.table("subjects")
            .insert({"user_id": request.user_id, "name": request.name, "color": request.color})
            .execute()
        )
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{user_id}/{subject_id}")
async def delete_subject(user_id: str, subject_id: str):
    try:
        supabase.table("subjects").delete().eq("id", subject_id).eq("user_id", user_id).execute()
        return {"message": "Deleted successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{user_id}/{result_id}")
async def assign_subject(user_id: str, result_id: str, request: AssignSubjectRequest):
    try:
        supabase.table("study_results") \
            .update({"subject_id": request.subject_id}) \
            .eq("id", result_id) \
            .eq("user_id", user_id) \
            .execute()
        return {"message": "Subject assigned."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))