"""
Configuración del sistema - ACTUALIZADA CON VARIABLES DE ENTORNO REALES
"""
import os
from typing import List

class Settings:
    # Configuración de Base de Datos - Variables de entorno reales
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:y0ySWx0VBmlKuTkk@db.symkjkbejxexgrydmvqs.supabase.co:5432/postgres")
    
    # Configuración de Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://symkjkbejxexgrydmvqs.supabase.co")
    
    # Configuración de Seguridad - Variables de entorno reales
    SECRET_KEY: str = os.getenv("SECRET_KEY", "KL4um-775jA5N*P_EMERGENCY_2024")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # Configuración Multi-Tenant
    TENANT_SCHEMA_PREFIX: str = "tenant_"
    TENANT_DEFAULT_SCHEMA: str = "public"
    
    # Configuración del Sistema - Variables de entorno reales
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # Configuración de API
    API_V1_STR: str = "/api/v1"
    
    # Configuración de CORS - Variables de entorno reales
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "https://scldp-frontend.onrender.com")
    ALLOWED_ORIGINS: List[str] = [FRONTEND_URL, "http://localhost:3000", "http://localhost:8000"]
    
    # Configuración de Base de Datos Pool
    DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "10"))
    DB_MAX_OVERFLOW: int = int(os.getenv("DB_MAX_OVERFLOW", "20"))
    DB_POOL_TIMEOUT: int = int(os.getenv("DB_POOL_TIMEOUT", "30"))

settings = Settings()