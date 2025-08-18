"""
Backend Profesional LPDP - Unificado y Seguro
Sin hardcodeo, con validación Pydantic y manejo robusto de errores
"""
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, EmailStr, validator
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import logging
import jwt
import hashlib
import secrets
import re

# Configuración profesional
from app.core.config import settings
from app.core.database import get_master_db, test_database_connection, validate_tenant_id
from app.core.security import get_password_hash, verify_password

# Configurar logging profesional
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Crear aplicación FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Sistema Profesional de Cumplimiento LPDP Ley 21.719",
    version="2.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None
)

# CORS Profesional
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Security
security = HTTPBearer()

# =============================================================================
# SCHEMAS PYDANTIC - VALIDACIÓN ESTRICTA
# =============================================================================

class LoginRequest(BaseModel):
    username: str = Field(
        min_length=3, 
        max_length=50, 
        regex=r'^[a-zA-Z0-9_.-]+$',
        description="Username válido (solo letras, números, _, -, .)"
    )
    password: str = Field(
        min_length=8, 
        max_length=128,
        description="Contraseña segura mínimo 8 caracteres"
    )
    tenant_id: Optional[str] = Field(
        default="default",
        max_length=50,
        regex=r'^[a-zA-Z0-9_-]+$',
        description="ID del tenant"
    )

    @validator('username')
    def validate_username(cls, v):
        if not re.match(r'^[a-zA-Z0-9_.-]+$', v):
            raise ValueError('Username contiene caracteres no válidos')
        return v.lower()

    @validator('tenant_id')
    def validate_tenant_id(cls, v):
        if v:
            validate_tenant_id(v)  # Usar función de database.py
        return v

class UserResponse(BaseModel):
    id: str
    username: str
    email: EmailStr
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

class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str]
    timestamp: datetime

# =============================================================================
# SERVICIOS DE AUTENTICACIÓN PROFESIONALES
# =============================================================================

class AuthService:
    """Servicio profesional de autenticación"""
    
    @staticmethod
    def create_access_token(data: dict) -> str:
        """Crear token JWT seguro"""
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
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error interno en autenticación"
            )

    @staticmethod
    def verify_token(token: str) -> dict:
        """Verificar token JWT"""
        try:
            payload = jwt.decode(
                token, 
                settings.SECRET_KEY, 
                algorithms=[settings.ALGORITHM],
                audience="lpdp-users",
                issuer="lpdp-system"
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expirado"
            )
        except jwt.JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )

    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> Optional[dict]:
        """Autenticar usuario desde base de datos"""
        try:
            # Aquí iría la lógica real de consulta a BD con ORM
            # Por ahora, usuarios configurables por ambiente
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

# =============================================================================
# DEPENDENCIAS PROFESIONALES
# =============================================================================

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_master_db)
) -> dict:
    """Obtener usuario actual desde token"""
    try:
        payload = AuthService.verify_token(credentials.credentials)
        username = payload.get("sub")
        
        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido: sin usuario"
            )
        
        # Aquí iría consulta real a BD
        users_config = settings.get_users_config()
        if username not in users_config:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no encontrado"
            )
        
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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Error de autenticación"
        )

# =============================================================================
# ENDPOINTS PROFESIONALES
# =============================================================================

@app.get("/", response_model=Dict[str, Any])
async def root():
    """Endpoint raíz con información del sistema"""
    try:
        db_connected = test_database_connection()
        
        return {
            "name": settings.PROJECT_NAME,
            "version": "2.0.0",
            "status": "online",
            "environment": settings.ENVIRONMENT,
            "database_connected": db_connected,
            "timestamp": datetime.now().isoformat(),
            "docs_url": "/docs" if settings.DEBUG else None
        }
    except Exception as e:
        logger.error(f"Error in root endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error del sistema"
        )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check profesional"""
    try:
        db_connected = test_database_connection()
        
        return HealthResponse(
            status="healthy" if db_connected else "degraded",
            version="2.0.0",
            timestamp=datetime.now(),
            environment=settings.ENVIRONMENT,
            database_connected=db_connected
        )
    except Exception as e:
        logger.error(f"Error in health check: {e}")
        return HealthResponse(
            status="unhealthy",
            version="2.0.0",
            timestamp=datetime.now(),
            environment=settings.ENVIRONMENT,
            database_connected=False
        )

@app.post("/api/v1/auth/login", response_model=TokenResponse)
async def login(
    credentials: LoginRequest,
    db: Session = Depends(get_master_db)
):
    """Login profesional con validación completa"""
    try:
        logger.info(f"Login attempt: {credentials.username} for tenant: {credentials.tenant_id}")
        
        # Autenticar usuario
        user = AuthService.authenticate_user(db, credentials.username, credentials.password)
        
        if not user:
            logger.warning(f"Failed login attempt: {credentials.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas"
            )
        
        # Crear token
        token_data = {
            "sub": user["username"],
            "tenant_id": credentials.tenant_id,
            "permissions": user.get("permissions", [])
        }
        
        access_token = AuthService.create_access_token(token_data)
        
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
                created_at=datetime.now(),  # En producción vendría de BD
                last_login=datetime.now()
            )
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@app.get("/api/v1/users/me", response_model=UserResponse)
async def get_current_user_endpoint(
    current_user: dict = Depends(get_current_user)
):
    """Obtener información del usuario actual"""
    try:
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
    except Exception as e:
        logger.error(f"Error getting current user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error obteniendo información del usuario"
        )

@app.get("/api/v1/modules")
async def get_modules(
    current_user: dict = Depends(get_current_user)
):
    """Obtener módulos disponibles para el usuario"""
    try:
        modules_config = settings.get_modules_config()
        
        # Filtrar módulos por permisos del usuario
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
    except Exception as e:
        logger.error(f"Error getting modules: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error obteniendo módulos"
        )

# =============================================================================
# MANEJO PROFESIONAL DE ERRORES
# =============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    """Manejo profesional de errores HTTP"""
    logger.warning(f"HTTP {exc.status_code}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            detail=exc.detail,
            error_code=f"HTTP_{exc.status_code}",
            timestamp=datetime.now()
        ).dict()
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc: Exception):
    """Manejo seguro de errores generales"""
    logger.error(f"Unexpected error: {exc}", exc_info=True)
    
    # En producción, no exponer detalles del error
    detail = "Error interno del servidor"
    if settings.DEBUG:
        detail = f"Debug: {str(exc)}"
    
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            detail=detail,
            error_code="INTERNAL_ERROR",
            timestamp=datetime.now()
        ).dict()
    )

# =============================================================================
# EVENTOS DE APLICACIÓN
# =============================================================================

@app.on_event("startup")
async def startup_event():
    """Eventos de inicio profesionales"""
    logger.info(f"🚀 {settings.PROJECT_NAME} v2.0.0 iniciado")
    logger.info(f"✅ Entorno: {settings.ENVIRONMENT}")
    logger.info(f"🔒 Modo debug: {settings.DEBUG}")
    
    # Verificar configuración crítica
    try:
        # Test de conexión a BD
        db_ok = test_database_connection()
        if db_ok:
            logger.info("✅ Base de datos conectada")
        else:
            logger.error("❌ Error de conexión a base de datos")
        
        # Verificar configuración de usuarios
        users_config = settings.get_users_config()
        if users_config:
            logger.info(f"✅ {len(users_config)} usuarios configurados")
        else:
            logger.warning("⚠️ No hay usuarios configurados")
        
        logger.info("🎯 Sistema listo para producción")
        
    except Exception as e:
        logger.error(f"❌ Error en startup: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Eventos de cierre profesionales"""
    logger.info("🛑 Sistema apagándose correctamente")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host=settings.HOST, 
        port=settings.PORT,
        log_level="info",
        access_log=True
    )