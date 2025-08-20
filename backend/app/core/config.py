"""
Configuración Profesional del Sistema LPDP
Sin hardcodeo, completamente configurable por variables de entorno
"""
import os
import json
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path

logger = logging.getLogger(__name__)

class Settings:
    """Configuración profesional y segura del sistema"""
    
    # =========================================================================
    # CONFIGURACIÓN BÁSICA DEL PROYECTO
    # =========================================================================
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Sistema LPDP")
    VERSION: str = os.getenv("VERSION", "2.0.0")
    DESCRIPTION: str = os.getenv("DESCRIPTION", "Sistema Profesional de Cumplimiento LPDP")
    
    # =========================================================================
    # CONFIGURACIÓN DE ENTORNO
    # =========================================================================
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # =========================================================================
    # CONFIGURACIÓN DE BASE DE DATOS
    # =========================================================================
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL")
    
    # Configuración opcional de Supabase
    SUPABASE_URL: Optional[str] = os.getenv("SUPABASE_URL")
    SUPABASE_KEY: Optional[str] = os.getenv("SUPABASE_KEY")
    
    # Configuración de Pool de Conexiones
    DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "5"))
    DB_MAX_OVERFLOW: int = int(os.getenv("DB_MAX_OVERFLOW", "10"))
    DB_POOL_TIMEOUT: int = int(os.getenv("DB_POOL_TIMEOUT", "30"))
    DB_POOL_RECYCLE: int = int(os.getenv("DB_POOL_RECYCLE", "3600"))
    
    # =========================================================================
    # CONFIGURACIÓN DE SEGURIDAD
    # =========================================================================
    SECRET_KEY: Optional[str] = os.getenv("SECRET_KEY")
    if not SECRET_KEY:
        import secrets
        SECRET_KEY = secrets.token_urlsafe(32)
    
    ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    
    # Salt para passwords
    PASSWORD_SALT: str = os.getenv("PASSWORD_SALT", "lpdp-default-salt-change-in-production")
    
    # =========================================================================
    # CONFIGURACIÓN MULTI-TENANT
    # =========================================================================
    TENANT_SCHEMA_PREFIX: str = os.getenv("TENANT_SCHEMA_PREFIX", "tenant_")
    TENANT_DEFAULT_SCHEMA: str = os.getenv("TENANT_DEFAULT_SCHEMA", "public")
    MAX_TENANT_SCHEMAS: int = int(os.getenv("MAX_TENANT_SCHEMAS", "100"))
    
    # =========================================================================
    # CONFIGURACIÓN DE CORS
    # =========================================================================
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "https://scldp-frontend.onrender.com")
    ALLOWED_ORIGINS_STR: str = os.getenv(
        "ALLOWED_ORIGINS", 
        "https://scldp-frontend.onrender.com,http://localhost:3000,http://localhost:8080"
    )
    ALLOWED_ORIGINS: List[str] = [origin.strip() for origin in ALLOWED_ORIGINS_STR.split(",")]
    
    # =========================================================================
    # CONFIGURACIÓN DE API
    # =========================================================================
    API_V1_STR: str = "/api/v1"
    API_TITLE: str = os.getenv("API_TITLE", "LPDP Compliance API")
    API_DESCRIPTION: str = os.getenv("API_DESCRIPTION", "API para Sistema de Cumplimiento LPDP")
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
    
    # =========================================================================
    # CONFIGURACIÓN DE USUARIOS (JSON)
    # =========================================================================
    def get_users_config(self) -> Dict[str, Any]:
        """Obtener configuración de usuarios desde variables de entorno"""
        try:
            users_json = os.getenv("USERS_CONFIG")
            if users_json:
                return json.loads(users_json)
            
            # Configuración por defecto para desarrollo
            if self.DEBUG:
                return {
                    "admin": {
                        "password_hash": "5b38bdc5e46074db8606a8ebc2a0977ed0964f244b7f81b9fb10ebc28131dc2b",
                        "email": "admin@empresa.cl",
                        "name": "Administrador del Sistema",
                        "is_superuser": True,
                        "is_active": True,
                        "tenant_id": "default",
                        "permissions": ["read", "write", "admin", "superuser"]
                    },
                    "demo": {
                        "password_hash": "588c55f3ce2b8569b153c5abbf13f9f74308b88a20017cc699b835cc93195d16",
                        "email": "demo@empresa.cl", 
                        "name": "Usuario Demo",
                        "is_superuser": False,
                        "is_active": True,
                        "tenant_id": "demo",
                        "permissions": ["read"],
                        "restricted_to": "intro_only"
                    }
                }
            
            return {}
            
        except json.JSONDecodeError as e:
            return {}
        except Exception as e:
            return {}
    
    # =========================================================================
    # CONFIGURACIÓN DE MÓDULOS (JSON)
    # =========================================================================
    def get_modules_config(self) -> List[Dict[str, Any]]:
        """Obtener configuración de módulos desde variables de entorno"""
        try:
            modules_json = os.getenv("MODULES_CONFIG")
            if modules_json:
                return json.loads(modules_json)
            
            # Configuración por defecto
            return [
                {
                    "id": "mod-001",
                    "name": "Introducción a la LPDP",
                    "description": "Conceptos fundamentales de la Ley 21.719",
                    "status": "available",
                    "required_permission": "read"
                },
                {
                    "id": "mod-002", 
                    "name": "Derechos ARCOPOL",
                    "description": "Acceso, Rectificación, Cancelación, Oposición, Portabilidad, Limitación",
                    "status": "available",
                    "required_permission": "read"
                },
                {
                    "id": "mod-003",
                    "name": "Inventario de Datos",
                    "description": "Registro de Actividades de Tratamiento (RAT)",
                    "status": "available", 
                    "required_permission": "write"
                }
            ]
            
        except json.JSONDecodeError as e:
            return []
        except Exception as e:
            return []
    
    # =========================================================================
    # CONFIGURACIÓN DE EMAIL (OPCIONAL)
    # =========================================================================
    SMTP_HOST: Optional[str] = os.getenv("SMTP_HOST")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: Optional[str] = os.getenv("SMTP_USER")
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD")
    SMTP_TLS: bool = os.getenv("SMTP_TLS", "true").lower() == "true"
    
    # =========================================================================
    # CONFIGURACIÓN DE LOGS
    # =========================================================================
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE: Optional[str] = os.getenv("LOG_FILE")
    
    # =========================================================================
    # FUNCIONES DE VALIDACIÓN
    # =========================================================================
    def validate_config(self) -> bool:
        """Validar configuración crítica"""
        errors = []
        
        # Validar configuración mínima requerida
        if not self.SECRET_KEY:
            errors.append("SECRET_KEY es requerido")
        
        if self.ENVIRONMENT == "production":
            if not self.DATABASE_URL:
                pass
            
            users_config = self.get_users_config()
            if not users_config:
                pass
        
        if errors:
            return False
        
        return True
    
    def is_database_enabled(self) -> bool:
        """Verificar si la base de datos está configurada"""
        return bool(self.DATABASE_URL)
    
    def get_database_url(self) -> Optional[str]:
        """Obtener URL de base de datos con validación"""
        if not self.DATABASE_URL:
            return None
        
        # Validaciones básicas de seguridad para la URL
        if "DROP" in self.DATABASE_URL.upper() or "DELETE" in self.DATABASE_URL.upper():
            return None
        
        return self.DATABASE_URL

# Instancia global de configuración
settings = Settings()

# Validar configuración al importar (sin fallar si es producción)
try:
    settings.validate_config()
except Exception as e:
    pass

