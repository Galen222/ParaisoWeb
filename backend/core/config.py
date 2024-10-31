# app/core/config.py
from pydantic import BaseSettings
from pathlib import Path
import os
from dotenv import load_dotenv

# Cargar las variables de entorno desde .env
load_dotenv()

# Determinar el entorno actual
ENVIRONMENT = os.getenv("ENVIRONMENT_BACKEND", "development")

class Settings(BaseSettings):
    SMTP_SERVER: str
    SMTP_PORT: int
    SMTP_USERNAME: str
    SMTP_PASSWORD: str
    DATABASE_URL: str

    class Config:
        env_file = str(Path(__file__).resolve().parent.parent / ".env")  # Sube un nivel

settings = Settings()
