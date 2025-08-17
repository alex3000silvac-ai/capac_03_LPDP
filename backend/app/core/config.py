"""
Configuración central del sistema multi-tenant
"""
from typing import List, Optional, Dict, ClassVar
from pydantic_settings import BaseSettings
from pydantic import validator
import secrets
import os

class Settings(BaseSettings):
    # Configuración de Base de Datos
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/lpdp_master"
    DATABASE_URL_MASTER: Optional[str] = None
    
    # Configuración de Supabase
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    
    # Configuración de Seguridad
    SECRET_KEY: str = "tu_clave_secreta_muy_larga_y_compleja_aqui_2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Configuración de Encriptación
    LICENSE_ENCRYPTION_KEY: str = "tu_clave_de_encriptacion_32_caracteres_aqui_2024"
    
    # Configuración Multi-Tenant
    TENANT_SCHEMA_PREFIX: str = "tenant_"
    TENANT_DEFAULT_SCHEMA: str = "public"
    
    # Configuración de Email (SMTP)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: str = "noreply@lpdp.cl"
    EMAILS_FROM_NAME: str = "Sistema LPDP"
    
    # Configuración del Sistema
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Configuración de API
    API_V1_STR: str = "/api/v1"
    
    # Configuración de Admin
    ADMIN_EMAIL: str = "admin@lpdp.cl"
    ADMIN_PASSWORD: str = "Admin123!"
    
    # Precios de Módulos (CLP)
    MODULE_PRICES: dict = {
        "consentimientos": 50000,
        "arcopol": 30000,
        "inventario": 40000,
        "brechas": 35000,
        "dpia": 60000,
        "transferencias": 25000,
        "auditoria": 45000
    }
    
    # Configuración de Testing
    TESTING: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def is_supabase(self) -> bool:
        """Verifica si estamos usando Supabase"""
        return bool(self.SUPABASE_URL and self.SUPABASE_KEY)
    
    @property
    def database_url(self) -> str:
        """Retorna la URL de base de datos apropiada"""
        if self.is_supabase:
            return self.SUPABASE_URL
        return self.DATABASE_URL
    
    @property
    def master_database_url(self) -> str:
        """Retorna la URL de la base de datos master"""
        if self.DATABASE_URL_MASTER:
            return self.DATABASE_URL_MASTER
        return self.database_url

settings = Settings()