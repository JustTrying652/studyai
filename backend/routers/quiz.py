from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.supabase_service import get_result_by_id
from config import settings
from groq import Groq
import json

router = APIRouter()
client = Groq(api_key=settings.groq_api_key)

class QuizRequest(BaseModel):
    user_id: str
    result_id: str

@router.post("/")
async def generate_quiz(request: QuizRequest):
    # 1. Fetch result
    result = get_result_by_id(request.result_id, request.user_id)
    if not result:
        raise HTTPException(status_code=404, detail="Result not found.")

    extracted_text = result.get("extracted_text", "")
    ai_result = result.get("result", "")

    content = extracted_text or ai_result
    if not content:
        raise HTTPException(status_code=422, detail="No content available to generate a quiz from.")

    # 2. Prompt Groq to generate quiz as JSON
    prompt = f"""You are an academic quiz generator. Based on the study content below, generate exactly 5 quiz questions.

Use this mix:
- 3 multiple choice questions (4 options each, one correct)
- 2 short answer questions (one sentence answer expected)

Return ONLY a valid JSON array, no markdown, no explanation, no backticks. Exactly this structure:
[
  {{
    "type": "mcq",
    "question": "Question text here?",
    "options": ["A. option1", "B. option2", "C. option3", "D. option4"],
    "answer": "A. option1",
    "explanation": "Brief explanation of why this is correct."
  }},
  {{
    "type": "short",
    "question": "Question text here?",
    "answer": "Expected answer here.",
    "explanation": "Brief explanation."
  }}
]

STUDY CONTENT:
{content[:40000]}
"""

    try:
        response = client.chat.completions.create(
            model=settings.groq_model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2000,
        )
        raw = response.choices[0].message.content.strip()

        # Strip markdown fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        questions = json.loads(raw)

        if not isinstance(questions, list) or len(questions) == 0:
            raise ValueError("Invalid quiz format returned.")

    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="AI returned invalid quiz format. Please try again.")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Quiz generation failed: {str(e)}")

    return {"questions": questions}