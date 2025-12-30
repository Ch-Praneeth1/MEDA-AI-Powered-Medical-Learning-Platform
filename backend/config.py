from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    GROQ_API_KEY: str
    TAVILY_API_KEY: str
    
    class Config:
        env_file = "../.env"
        case_sensitive = True
        extra = "ignore"  # Allow extra fields from .env file

settings = Settings()
