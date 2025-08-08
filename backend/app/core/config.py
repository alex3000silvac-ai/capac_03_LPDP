from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import PostgresDsn, validator
import os
import secrets


class Settings(BaseSettings):
    # Configuración básica
    PROJECT_NAME: str = "Jurídica Digital SPA - Sistema de Capacitación LPDP"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Seguridad
    SECRET_KEY: str = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 días
    
    # Base de datos - Compatible con Supabase
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    
    # Redis (opcional para Railway)
    REDIS_URL: Optional[str] = os.getenv("REDIS_URL", None)
    
    # CORS - Actualizar con dominio de Railway
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost",
        os.getenv("FRONTEND_URL", ""),
    ]
    
    # Configuración de archivos
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: set[str] = {".xlsx", ".xls", ".csv"}
    
    # Configuración de retención
    RETENTION_CHECK_INTERVAL_DAYS: int = 1
    
    # Modo desarrollo
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Railway/Producción
    PORT: int = int(os.getenv("PORT", 8000))
    
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: list[str]) -> list[str]:
        # Filtrar strings vacíos
        return [origin for origin in v if origin]
    
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)


settings = Settings()