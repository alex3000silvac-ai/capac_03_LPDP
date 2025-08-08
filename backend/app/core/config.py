"""
Configuración central del sistema multi-tenant
"""
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import validator
import secrets
import os

class Settings(BaseSettings):
    # Configuración básica
    PROJECT_NAME: str = "Jurídica Digital SPA - Sistema de Capacitación LPDP"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Base de datos principal (master)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:password@localhost/juridica_digital_master"
    )
    
    # Seguridad
    SECRET_KEY: str = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 horas
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Encriptación de licencias
    LICENSE_ENCRYPTION_KEY: str = os.getenv(
        "LICENSE_ENCRYPTION_KEY", 
        secrets.token_urlsafe(32)
    )
    
    # Multi-tenant
    TENANT_SCHEMA_PREFIX: str = "tenant_"
    MASTER_SCHEMA: str = "public"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8080",
        "https://app.juridicadigital.cl",
    ]
    
    # Email
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = 587
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    EMAILS_FROM_EMAIL: str = "sistema@juridicadigital.cl"
    EMAILS_FROM_NAME: str = "Jurídica Digital SPA"
    
    # Storage para documentos
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "/app/uploads")
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024  # 50MB
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # Administrador del sistema
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@juridicadigital.cl")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "Admin123!@#")
    
    # Precios base de módulos (CLP)
    MODULE_PRICES = {
        "MOD-1": 150000,  # Consentimientos
        "MOD-2": 120000,  # ARCOPOL
        "MOD-3": 180000,  # Inventario
        "MOD-4": 100000,  # Brechas
        "MOD-5": 140000,  # DPIA
        "MOD-6": 90000,   # Transferencias
        "MOD-7": 160000,  # Auditoría
    }
    
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: List[str]) -> List[str]:
        return [origin for origin in v if origin]
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()