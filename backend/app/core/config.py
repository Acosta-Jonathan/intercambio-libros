# app/core/config.py
from pydantic import BaseSettings
class Settings(BaseSettings):
    DATABASE_URL: str

    class Config:
        env_file = ".env"  # Cargar variables desde .env

settings = Settings()
