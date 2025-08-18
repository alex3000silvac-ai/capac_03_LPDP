"""
Backend Profesional LPDP v2.0.0 - MODO SIN BASE DE DATOS
Compatible con Render, sin dependencias complejas
"""
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, EmailStr, validator
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import logging
import jwt
import hashlib
import secrets
import re
import os
import json

# Configurar logging profesional
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# =============================================================================
# CONFIGURACIÓN PROFESIONAL SIMPLIFICADA
# =============================================================================

class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Sistema LPDP Profesional")
    VERSION: str = os.getenv("VERSION", "2.0.0")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # Seguridad
    SECRET_KEY: str = os.getenv("SECRET_KEY", "lpdp-default-secret-change-in-production")
    ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    PASSWORD_SALT: str = os.getenv("PASSWORD_SALT", "lpdp-default-salt-change-in-production")
    
    # CORS
    ALLOWED_ORIGINS_STR: str = os.getenv("ALLOWED_ORIGINS", "https://scldp-frontend.onrender.com,http://localhost:3000")
    ALLOWED_ORIGINS: List[str] = [origin.strip() for origin in ALLOWED_ORIGINS_STR.split(",")]
    
    def get_users_config(self) -> Dict[str, Any]:
        """Obtener configuración de usuarios"""
        try:
            users_json = os.getenv("USERS_CONFIG")
            if users_json:
                return json.loads(users_json)
            
            # Configuración por defecto
            return {
                "admin": {
                    "password_hash": "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f",
                    "email": "admin@empresa.cl",
                    "name": "Administrador del Sistema",
                    "is_superuser": True,
                    "is_active": True,
                    "tenant_id": "default",
                    "permissions": ["read", "write", "admin", "superuser"]
                },
                "demo": {
                    "password_hash": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
                    "email": "demo@empresa.cl",
                    "name": "Usuario Demo",
                    "is_superuser": False,
                    "is_active": True,
                    "tenant_id": "demo",
                    "permissions": ["read"]
                },
                "dpo": {
                    "password_hash": "8d23cf6c86e834a7aa6eded54c26ce2bb2e74903538c61bdd5d2197997ab2f72",
                    "email": "dpo@empresa.cl",
                    "name": "Data Protection Officer",
                    "is_superuser": False,
                    "is_active": True,
                    "tenant_id": "dpo",
                    "permissions": ["read", "write"]
                }
            }
        except:
            return {}
    
    def get_modules_config(self) -> List[Dict[str, Any]]:
        """Obtener configuración de módulos"""
        try:
            modules_json = os.getenv("MODULES_CONFIG")
            if modules_json:
                return json.loads(modules_json)
            
            return [
                {"id": "mod-001", "name": "Introducción a la LPDP", "status": "available", "required_permission": "read"},
                {"id": "mod-002", "name": "Derechos ARCOPOL", "status": "available", "required_permission": "read"},
                {"id": "mod-003", "name": "Inventario de Datos", "status": "available", "required_permission": "write"}
            ]
        except:
            return []

settings = Settings()

# =============================================================================
# APLICACIÓN FASTAPI
# =============================================================================

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Sistema Profesional de Cumplimiento LPDP Ley 21.719",
    version=settings.VERSION,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    expose_headers=["*"]
)

security = HTTPBearer()

# =============================================================================
# SCHEMAS PYDANTIC
# =============================================================================

class LoginRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50, regex=r'^[a-zA-Z0-9_.-]+$')
    password: str = Field(min_length=1, max_length=128)
    tenant_id: Optional[str] = Field(default="default", max_length=50, regex=r'^[a-zA-Z0-9_-]+$')

    @validator('username')
    def validate_username(cls, v):
        return v.lower()

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    name: str
    tenant_id: str
    is_superuser: bool
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime]

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: UserResponse

class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: datetime
    environment: str
    database_connected: bool

# =============================================================================
# FUNCIONES AUXILIARES
# =============================================================================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar contraseña usando SHA-256 + salt"""
    try:
        expected_hash = hashlib.sha256((plain_password + settings.PASSWORD_SALT).encode()).hexdigest()
        return expected_hash == hashed_password
    except:
        return False

def create_access_token(data: dict) -> str:
    """Crear token JWT"""
    try:
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "iss": "lpdp-system",
            "aud": "lpdp-users"
        })
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    except Exception as e:
        logger.error(f"Error creating token: {e}")
        raise HTTPException(status_code=500, detail="Error interno en autenticación")

def verify_token(token: str) -> dict:
    """Verificar token JWT"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

def authenticate_user(username: str, password: str) -> Optional[dict]:
    """Autenticar usuario"""
    try:
        users_config = settings.get_users_config()
        
        if username not in users_config:
            return None
        
        user_data = users_config[username]
        
        if not verify_password(password, user_data["password_hash"]):
            return None
        
        return {
            "id": username,
            "username": username,
            "email": user_data.get("email"),
            "name": user_data.get("name"),
            "is_superuser": user_data.get("is_superuser", False),
            "is_active": user_data.get("is_active", True),
            "tenant_id": user_data.get("tenant_id", "default"),
            "permissions": user_data.get("permissions", [])
        }
    except Exception as e:
        logger.error(f"Error in authenticate_user: {e}")
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Obtener usuario actual desde token"""
    try:
        payload = verify_token(credentials.credentials)
        username = payload.get("sub")
        
        if not username:
            raise HTTPException(status_code=401, detail="Token inválido")
        
        users_config = settings.get_users_config()
        if username not in users_config:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")
        
        user_data = users_config[username]
        return {
            "username": username,
            "email": user_data.get("email"),
            "name": user_data.get("name"),
            "tenant_id": payload.get("tenant_id", "default"),
            "is_superuser": user_data.get("is_superuser", False),
            "permissions": user_data.get("permissions", [])
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_current_user: {e}")
        raise HTTPException(status_code=401, detail="Error de autenticación")

# =============================================================================
# ENDPOINTS
# =============================================================================

@app.get("/", response_model=Dict[str, Any])
async def root():
    """Endpoint raíz"""
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "environment": settings.ENVIRONMENT,
        "database_connected": False,  # Sin BD por ahora
        "timestamp": datetime.now().isoformat(),
        "docs_url": "/docs" if settings.DEBUG else None
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check"""
    return HealthResponse(
        status="healthy",
        version=settings.VERSION,
        timestamp=datetime.now(),
        environment=settings.ENVIRONMENT,
        database_connected=False
    )

@app.get("/api/v1/test")
async def test():
    """Test de conectividad"""
    return {
        "message": "API Test OK",
        "version": settings.VERSION,
        "timestamp": datetime.now().isoformat(),
        "environment": settings.ENVIRONMENT
    }

@app.post("/api/v1/auth/login", response_model=TokenResponse)
async def login(credentials: LoginRequest):
    """Login profesional"""
    try:
        logger.info(f"Login attempt: {credentials.username} for tenant: {credentials.tenant_id}")
        
        user = authenticate_user(credentials.username, credentials.password)
        
        if not user:
            logger.warning(f"Failed login attempt: {credentials.username}")
            raise HTTPException(status_code=401, detail="Credenciales inválidas")
        
        token_data = {
            "sub": user["username"],
            "tenant_id": credentials.tenant_id,
            "permissions": user.get("permissions", [])
        }
        
        access_token = create_access_token(token_data)
        
        logger.info(f"Login successful: {credentials.username}")
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse(
                id=user["id"],
                username=user["username"],
                email=user["email"],
                name=user["name"],
                tenant_id=credentials.tenant_id,
                is_superuser=user["is_superuser"],
                is_active=user["is_active"],
                created_at=datetime.now(),
                last_login=datetime.now()
            )
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in login: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/api/v1/users/me", response_model=UserResponse)
async def get_current_user_endpoint(current_user: dict = Depends(get_current_user)):
    """Obtener información del usuario actual"""
    return UserResponse(
        id=current_user["username"],
        username=current_user["username"],
        email=current_user["email"],
        name=current_user["name"],
        tenant_id=current_user["tenant_id"],
        is_superuser=current_user["is_superuser"],
        is_active=True,
        created_at=datetime.now(),
        last_login=datetime.now()
    )

@app.get("/api/v1/modules")
async def get_modules(current_user: dict = Depends(get_current_user)):
    """Obtener módulos disponibles"""
    modules_config = settings.get_modules_config()
    user_permissions = current_user.get("permissions", [])
    available_modules = []
    
    for module in modules_config:
        if module.get("required_permission") in user_permissions or current_user.get("is_superuser"):
            available_modules.append(module)
    
    return {
        "modules": available_modules,
        "user_permissions": user_permissions,
        "total_available": len(available_modules)
    }

# =============================================================================
# MANEJO DE ERRORES
# =============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    """Manejo de errores HTTP"""
    logger.warning(f"HTTP {exc.status_code}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "error_code": f"HTTP_{exc.status_code}", "timestamp": datetime.now().isoformat()}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc: Exception):
    """Manejo de errores generales"""
    logger.error(f"Unexpected error: {exc}", exc_info=True)
    detail = "Error interno del servidor"
    if settings.DEBUG:
        detail = f"Debug: {str(exc)}"
    
    return JSONResponse(
        status_code=500,
        content={"detail": detail, "error_code": "INTERNAL_ERROR", "timestamp": datetime.now().isoformat()}
    )

# =============================================================================
# EVENTOS
# =============================================================================

@app.on_event("startup")
async def startup_event():
    """Eventos de inicio"""
    logger.info(f"🚀 {settings.PROJECT_NAME} v{settings.VERSION} iniciado")
    logger.info(f"✅ Entorno: {settings.ENVIRONMENT}")
    logger.info(f"🔒 Modo debug: {settings.DEBUG}")
    
    users_config = settings.get_users_config()
    if users_config:
        logger.info(f"✅ {len(users_config)} usuarios configurados")
    else:
        logger.warning("⚠️ No hay usuarios configurados")
    
    logger.info("🎯 Sistema listo - SIN base de datos")

@app.on_event("shutdown")
async def shutdown_event():
    """Eventos de cierre"""
    logger.info("🛑 Sistema apagándose correctamente")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run(app, host=host, port=port, log_level="info")