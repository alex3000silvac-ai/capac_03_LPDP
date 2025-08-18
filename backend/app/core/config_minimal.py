"""
Configuración mínima del sistema - CORREGIDA CON VARIABLES DE ENTORNO
"""
import os
from typing import List

class Settings:
    # Configuración de Base de Datos
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL debe estar configurado")
    
    # Configuración de Seguridad
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY debe estar configurado")
    
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # Configuración Multi-Tenant
    TENANT_SCHEMA_PREFIX: str = "tenant_"
    TENANT_DEFAULT_SCHEMA: str = "public"
    
    # Configuración del Sistema
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # Configuración de API
    API_V1_STR: str = "/api/v1"
    
    # Configuración de CORS
    ALLOWED_ORIGINS: List[str] = os.getenv("ALLOWED_ORIGINS", "https://scldp-frontend.onrender.com,http://localhost:3000,http://localhost:8000").split(",")

settings = Settings()
