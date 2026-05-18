from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import upload, process, history, chat, quiz, subjects, studyplan
import os

app = FastAPI(title="StudyAI API", version="1.0.0")

origins = [
    "http://localhost:3000",
    "https://studyai-liard-eight.vercel.app",
]

extra = os.getenv("CORS_ORIGINS", "")
if extra:
    for origin in extra.split(","):
        origins.append(origin.strip())

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/upload", tags=["Upload"])
app.include_router(process.router, prefix="/process", tags=["Process"])
app.include_router(history.router, prefix="/history", tags=["History"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(quiz.router, prefix="/quiz", tags=["Quiz"])
app.include_router(subjects.router, prefix="/subjects", tags=["Subjects"])  
app.include_router(studyplan.router, prefix="/studyplan", tags=["Study Plan"])
@app.get("/")
def root():
    return {"status": "StudyAI API is running"}