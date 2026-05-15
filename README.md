# StudyAI — AI-Powered Study Assistant

Upload past papers or notes → get AI-generated answers and summaries instantly.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) |
| Backend | FastAPI (Python) |
| AI | Groq API (llama-3.3-70b-versatile) |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Auth | Supabase Auth |

## Project Structure

```
studyai/
├── frontend/         # Next.js app
├── backend/          # FastAPI app
└── README.md
```

## Getting Started

### 1. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # fill in your keys
uvicorn main:app --reload
```

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env.local      # fill in your keys
npm run dev
```

## Environment Variables

### Backend (`backend/.env`)
```
GROQ_API_KEY=your_groq_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```
