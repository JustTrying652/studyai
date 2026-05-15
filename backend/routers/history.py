from fastapi import APIRouter, HTTPException
from services.supabase_service import get_user_history, get_result_by_id, delete_result

router = APIRouter()

@router.get("/{user_id}")
async def get_history(user_id: str):
    try:
        history = get_user_history(user_id)
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}/{result_id}")
async def get_single_result(user_id: str, result_id: str):
    try:
        result = get_result_by_id(result_id, user_id)
        if not result:
            raise HTTPException(status_code=404, detail="Result not found.")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{user_id}/{result_id}")
async def delete_session(user_id: str, result_id: str):
    try:
        delete_result(result_id, user_id)
        return {"message": "Deleted successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))