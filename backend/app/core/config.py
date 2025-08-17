"""
Configuración del sistema - CORREGIDA PARA RENDER
"""
import os
from typing import List

class Settings:
    # Configuración de Base de Datos - Usar variable de entorno en Render
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/lpdp_master")
    
    # Configuración de Seguridad - Usar variable de entorno en Render
    SECRET_KEY: str = os.getenv("SECRET_KEY", "KL4um-775jA5N*P_EMERGENCY_2024")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # Configuración Multi-Tenant
    TENANT_SCHEMA_PREFIX: str = "tenant_"
    TENANT_DEFAULT_SCHEMA: str = "public"
    
    # Configuración del Sistema - Usar variables de entorno en Render
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # Configuración de API
    API_V1_STR: str = "/api/v1"
    
    # Configuración de CORS - Usar variable de entorno en Render
    ALLOWED_ORIGINS: List[str] = os.getenv("ALLOWED_ORIGINS", "https://scldp-frontend.onrender.com").split(",")
    
    # Configuración de Base de Datos Pool
    DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "10"))
    DB_MAX_OVERFLOW: int = int(os.getenv("DB_MAX_OVERFLOW", "20"))
    DB_POOL_TIMEOUT: int = int(os.getenv("DB_POOL_TIMEOUT", "30"))

settings = Settings()