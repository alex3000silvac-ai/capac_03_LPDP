"""
Configuración mínima del sistema - SIN PROBLEMAS DE VARIABLES DE ENTORNO
"""
from typing import List

class Settings:
    # Configuración de Base de Datos
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/lpdp_master"
    
    # Configuración de Seguridad
    SECRET_KEY: str = "KL4um-775jA5N*P_EMERGENCY_2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Configuración Multi-Tenant
    TENANT_SCHEMA_PREFIX: str = "tenant_"
    TENANT_DEFAULT_SCHEMA: str = "public"
    
    # Configuración del Sistema
    ENVIRONMENT: str = "production"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Configuración de API
    API_V1_STR: str = "/api/v1"
    
    # Configuración de CORS
    ALLOWED_ORIGINS: List[str] = [
        "https://scldp-frontend.onrender.com",
        "http://localhost:3000",
        "http://localhost:8000"
    ]

settings = Settings()
