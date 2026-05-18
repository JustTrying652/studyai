from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from config import settings
from groq import Groq
import json

router = APIRouter()
client = Groq(api_key=settings.groq_api_key)

class StudyPlanRequest(BaseModel):
    user_id: str
    sessions: list[dict]  # [{ file_name, mode, subject_name }]

@router.post("/")
async def generate_study_plan(request: StudyPlanRequest):
    if len(request.sessions) < 2:
        raise HTTPException(status_code=400, detail="You need at least 2 sessions to generate a study plan.")

    # Build session summary for the prompt
    session_list = "\n".join([
        f"- {s['file_name'].replace('.pdf','').replace('.txt','')} ({s.get('subject_name', 'General')} · {s['mode']})"
        for s in request.sessions
    ])

    prompt = f"""You are an academic study planner. A student has the following study materials:

{session_list}

Create a realistic day-by-day revision study plan for this student.
- Decide the appropriate number of days based on the number of topics (1-2 topics per day max)
- Each day should have a clear focus, specific tasks, and time estimates
- Include review days for topics that need reinforcement
- Keep it practical and motivating

Return ONLY a valid JSON array, no markdown, no backticks, no explanation. Use exactly this structure:
[
  {{
    "day": 1,
    "title": "Short title for the day",
    "date_label": "Day 1",
    "focus": "What this day is about",
    "tasks": [
      {{ "task": "Task description", "duration": "30 mins", "type": "review" }},
      {{ "task": "Task description", "duration": "45 mins", "type": "practice" }}
    ],
    "tip": "A short motivational or study tip for the day"
  }}
]

Task types: "review", "practice", "quiz", "notes", "rest"
"""

    try:
        response = client.chat.completions.create(
            model=settings.groq_model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2000,
        )
        raw = response.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()
        plan = json.loads(raw)
        if not isinstance(plan, list):
            raise ValueError("Invalid plan format")
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="AI returned invalid format. Please try again.")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Study plan generation failed: {str(e)}")

    return {"plan": plan}