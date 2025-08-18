"""
Backend sin hardcodeo - Todo configurado por variables de entorno
"""
from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from datetime import datetime, timedelta
import logging
import os
import jwt
import hashlib
import json
from typing import Optional, Dict, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=os.getenv("APP_TITLE", "Sistema LPDP"),
    description=os.getenv("APP_DESCRIPTION", "Sistema de Cumplimiento"),
    version=os.getenv("APP_VERSION", "1.0.0")
)

# CORS configurado por variables de entorno
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

class LoginRequest(BaseModel):
    username: str
    password: str
    tenant_id: Optional[str] = "default"

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    name: str
    tenant_id: str
    is_superuser: bool

def get_users_config() -> Dict[str, Any]:
    """Cargar configuración de usuarios desde variables de entorno"""
    users_json = os.getenv("USERS_CONFIG")
    if users_json:
        try:
            return json.loads(users_json)
        except json.JSONDecodeError:
            logger.error("Error parsing USERS_CONFIG JSON")
    
    # Si no hay configuración, crear estructura vacía
    return {}

def hash_password(password: str) -> str:
    """Hash de contraseña usando SHA-256"""
    salt = os.getenv("PASSWORD_SALT", "default_salt")
    return hashlib.sha256((password + salt).encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar contraseña"""
    return hash_password(plain_password) == hashed_password

def create_access_token(data: dict) -> str:
    """Crear token JWT"""
    secret_key = os.getenv("JWT_SECRET_KEY")
    if not secret_key:
        raise HTTPException(
            status_code=500, 
            detail="JWT_SECRET_KEY no configurado"
        )
    
    expiry_minutes = int(os.getenv("TOKEN_EXPIRY_MINUTES", "30"))
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expiry_minutes)
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    
    return jwt.encode(to_encode, secret_key, algorithm="HS256")

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verificar token JWT"""
    secret_key = os.getenv("JWT_SECRET_KEY")
    if not secret_key:
        raise HTTPException(
            status_code=500,
            detail="JWT_SECRET_KEY no configurado"
        )
    
    try:
        payload = jwt.decode(credentials.credentials, secret_key, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

@app.get("/")
async def root():
    """Endpoint raíz"""
    return {
        "message": os.getenv("APP_MESSAGE", "API funcionando"),
        "status": "online",
        "version": os.getenv("APP_VERSION", "1.0.0"),
        "timestamp": datetime.now().isoformat(),
        "environment": os.getenv("ENVIRONMENT", "production")
    }

@app.get("/health")
async def health():
    """Health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": os.getenv("APP_VERSION", "1.0.0"),
        "environment": os.getenv("ENVIRONMENT", "production")
    }

@app.get("/api/v1/test")
async def test():
    """Test de conectividad"""
    return {
        "message": "API Test OK",
        "timestamp": datetime.now().isoformat(),
        "environment": os.getenv("ENVIRONMENT", "production")
    }

@app.post("/api/v1/auth/login")
async def login(credentials: LoginRequest):
    """Login completamente configurable"""
    try:
        logger.info(f"Login attempt: {credentials.username}")
        
        # Cargar usuarios desde configuración
        users_config = get_users_config()
        
        if not users_config:
            raise HTTPException(
                status_code=500,
                detail="Sistema no configurado. USERS_CONFIG requerido."
            )
        
        # Verificar usuario existe
        if credentials.username not in users_config:
            raise HTTPException(
                status_code=401,
                detail="Credenciales inválidas"
            )
        
        user_data = users_config[credentials.username]
        
        # Verificar contraseña
        if not verify_password(credentials.password, user_data["password_hash"]):
            raise HTTPException(
                status_code=401,
                detail="Credenciales inválidas"
            )
        
        # Crear payload del token
        token_payload = {
            "sub": credentials.username,
            "username": credentials.username,
            "email": user_data.get("email"),
            "tenant_id": credentials.tenant_id,
            "is_superuser": user_data.get("is_superuser", False),
            "permissions": user_data.get("permissions", [])
        }
        
        # Generar token
        access_token = create_access_token(token_payload)
        
        logger.info(f"Login successful: {credentials.username}")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": credentials.username,
                "username": credentials.username,
                "email": user_data.get("email"),
                "name": user_data.get("name"),
                "tenant_id": credentials.tenant_id,
                "is_superuser": user_data.get("is_superuser", False)
            },
            "expires_in": int(os.getenv("TOKEN_EXPIRY_MINUTES", "30")) * 60
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )

@app.get("/api/v1/users/me")
async def get_current_user(current_user: dict = Depends(verify_token)):
    """Obtener usuario actual"""
    users_config = get_users_config()
    user_data = users_config.get(current_user["username"], {})
    
    return {
        "username": current_user["username"],
        "email": current_user["email"],
        "name": user_data.get("name"),
        "tenant_id": current_user["tenant_id"],
        "is_superuser": current_user["is_superuser"],
        "permissions": current_user.get("permissions", [])
    }

@app.get("/api/v1/modules")
async def get_modules(current_user: dict = Depends(verify_token)):
    """Módulos disponibles"""
    modules_config = os.getenv("MODULES_CONFIG")
    if modules_config:
        try:
            return {"modules": json.loads(modules_config)}
        except json.JSONDecodeError:
            logger.error("Error parsing MODULES_CONFIG")
    
    # Respuesta por defecto si no hay configuración
    return {
        "modules": [],
        "message": "No hay módulos configurados"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Error interno del servidor"}
    )

@app.on_event("startup")
async def startup():
    logger.info(f"🚀 {os.getenv('APP_TITLE', 'API')} iniciada")
    logger.info(f"✅ Entorno: {os.getenv('ENVIRONMENT', 'production')}")
    
    # Verificar configuración requerida
    required_vars = ["JWT_SECRET_KEY", "USERS_CONFIG"]
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        logger.error(f"❌ Variables requeridas faltantes: {missing_vars}")
    else:
        logger.info("✅ Configuración completa")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run(app, host=host, port=port)