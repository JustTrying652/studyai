from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.supabase_service import get_result_by_id
from config import settings
from groq import Groq

router = APIRouter()
client = Groq(api_key=settings.groq_api_key)

class ChatMessage(BaseModel):
    role: str   # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    user_id: str
    result_id: str
    message: str
    history: list[ChatMessage] = []

@router.post("/")
async def chat(request: ChatRequest):
    # 1. Fetch the result to get extracted_text and the AI result
    result = get_result_by_id(request.result_id, request.user_id)
    if not result:
        raise HTTPException(status_code=404, detail="Result not found.")

    extracted_text = result.get("extracted_text", "")
    ai_result = result.get("result", "")

    if not extracted_text:
        raise HTTPException(
            status_code=422,
            detail="This session has no extracted text — it was created before chat was supported. Please re-upload the document."
        )

    # 2. Build system prompt with document context
    system_prompt = f"""You are a helpful academic tutor assistant. A student has uploaded a document and received AI-generated study content from it. You are now helping them understand the material better through conversation.

ORIGINAL DOCUMENT TEXT:
{extracted_text[:60000]}

AI-GENERATED STUDY CONTENT (answers/notes already generated):
{ai_result[:10000]}

Your job:
- Answer the student's questions clearly and concisely
- Reference specific parts of the document when relevant
- If asked to explain something, use simple language and examples
- If asked for more detail on a topic, expand on what's in the document
- Stay focused on the document content
- Be encouraging and supportive"""

    # 3. Build message history for Groq
    messages = [{"role": "system", "content": system_prompt}]
    for msg in request.history[-10:]:  # last 10 messages for context
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": request.message})

    # 4. Call Groq
    try:
        response = client.chat.completions.create(
            model=settings.groq_model,
            messages=messages,
            max_tokens=1024,
        )
        reply = response.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI error: {str(e)}")

    return {"reply": reply}