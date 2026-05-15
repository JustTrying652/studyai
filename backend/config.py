from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    groq_api_key: str
    supabase_url: str
    supabase_service_key: str
    groq_model: str = "llama-3.3-70b-versatile"
    max_tokens: int = 4096

    class Config:
        env_file = ".env"

settings = Settings()
