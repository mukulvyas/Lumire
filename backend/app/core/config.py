import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

# Project root directory (contains .env.local and .env)
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(BASE_DIR / ".env.local", BASE_DIR / ".env", ROOT_DIR / ".env.local", ROOT_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Supabase / Database
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/postgres",
        description="Postgres connection string"
    )
    NEXT_PUBLIC_SUPABASE_URL: str = ""
    NEXT_PUBLIC_SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # LLM Settings
    LLM_PROVIDER: str = Field(default="gemini", description="'gemini' | 'mock'")
    GEMINI_API_KEY: str = Field(default="", description="Google Gemini API Key")
    LLM_MODEL: str = Field(default="gemini-1.5-flash", description="Gemini Model")

    # App
    APP_URL: str = "http://localhost:3000"
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
    ]

    @property
    def async_database_url(self) -> str:
        """Ensures asyncpg driver prefix is present for SQLAlchemy asyncio."""
        url = self.DATABASE_URL
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql+asyncpg://", 1)
        return url

settings = Settings()
