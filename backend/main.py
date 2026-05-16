from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import upload, process, history

app = FastAPI(title="StudyAI API", version="1.0.0")

# Allow requests from Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"
                   "studyai-liard-eight.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(upload.router, prefix="/upload", tags=["Upload"])
app.include_router(process.router, prefix="/process", tags=["Process"])
app.include_router(history.router, prefix="/history", tags=["History"])

@app.get("/")
def root():
    return {"status": "StudyAI API is running"}
