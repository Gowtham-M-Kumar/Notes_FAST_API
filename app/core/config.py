from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Notes API"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "django-insecure-kz2c)gv_i)od=3db2utuc!9c38pnf^!fyi#n9tpuvwx(oj8h9f" # Fallback from Django
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # Database
    DATABASE_URL: str | None = None
    DB_ENGINE: str = "django.db.backends.postgresql" # Ignore, used for reading existing .env quirks
    DB_NAME: str = "railway"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "igsBJlgUlIUDwcbZLxGbphiOkwEUlHhx"
    DB_HOST: str = "postgres.railway.internal"
    DB_PORT: str = "5432"
    
    # Constructed Database URL
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        if self.DATABASE_URL:
            # Handle standard postgres:// scheme if provided by Railway
            url = self.DATABASE_URL
            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql+psycopg://", 1)
            elif url.startswith("postgresql://"):
                 url = url.replace("postgresql://", "postgresql+psycopg://", 1)
            return url
        return f"postgresql+psycopg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000", 
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
