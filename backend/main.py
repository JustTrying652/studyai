from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import upload, process, history
from routers import upload, process, history, chat

import os
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app = FastAPI(title="StudyAI API", version="1.0.0")

origins = [
    "http://localhost:3000",
    "https://studyai-liard-eight.vercel.app",
]

# Also pick up any extra origin from env
extra = os.getenv("CORS_ORIGINS", "")
if extra:
    origins.append(extra.strip())

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

@app.get("/")
def root():
    return {"status": "StudyAI API is running"}