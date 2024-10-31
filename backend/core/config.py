# app/core/config.py
from pydantic import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    SMTP_SERVER: str
    SMTP_PORT: int
    SMTP_USERNAME: str
    SMTP_PASSWORD: str
    DATABASE_URL: str  # Añade esta línea

    class Config:
        env_file = str(Path(__file__).resolve().parent.parent / ".env")  # Sube un nivel

settings = Settings()
