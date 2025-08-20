"""
Endpoints de autenticación - CORREGIDO Y UNIFICADO
"""
from datetime import timedelta, datetime
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_master_db
from app.schemas.auth import Token, LoginRequest
from app.models.user import User
from passlib.context import CryptContext
from jose import JWTError, jwt
import logging
import hashlib

logger = logging.getLogger(__name__)
router = APIRouter()

# Configuración de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica una contraseña contra su hash - Compatible con SHA256"""
    # Intentar primero con SHA256 (para usuarios de configuración)
    sha256_hash = hashlib.sha256(plain_password.encode()).hexdigest()
    if sha256_hash == hashed_password:
        return True
    
    # Fallback a bcrypt para usuarios de base de datos
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Crea un token JWT de acceso"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

@router.get("/test-credentials")
async def test_credentials():
    """Test endpoint para verificar credenciales"""
    try:
        import hashlib
        
        # Generar hashes para verificar
        admin_hash = hashlib.sha256("Padmin123!".encode()).hexdigest()
        demo_hash = hashlib.sha256("Demo123!".encode()).hexdigest()
        
        # Obtener configuración actual
        users_config = settings.get_users_config()
        
        return {
            "status": "ok",
            "admin_hash_calculated": admin_hash,
            "admin_hash_stored": users_config.get("admin", {}).get("password_hash", "NOT_FOUND"),
            "admin_match": admin_hash == users_config.get("admin", {}).get("password_hash", ""),
            "demo_hash_calculated": demo_hash,
            "demo_hash_stored": users_config.get("demo", {}).get("password_hash", "NOT_FOUND"),
            "demo_match": demo_hash == users_config.get("demo", {}).get("password_hash", ""),
            "users_found": list(users_config.keys()),
            "debug_enabled": settings.DEBUG,
            "environment": settings.ENVIRONMENT
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "debug_enabled": settings.DEBUG,
            "environment": settings.ENVIRONMENT
        }

@router.post("/login", response_model=Token)
async def login(
    request: Request,
    login_data: LoginRequest,
    db: Session = Depends(get_master_db)
) -> Any:
    """
    Login unificado - USANDO USUARIOS DE CONFIGURACIÓN
    """
    try:
        logger.info(f"Intento de login para usuario: {login_data.username}")
        
        # Obtener tenant_id del header o del body
        requested_tenant_id = request.headers.get("X-Tenant-ID") or login_data.tenant_id or "demo"
        logger.info(f"Requested Tenant ID: {requested_tenant_id}")
        
        # Obtener usuarios de configuración
        users_config = settings.get_users_config()
        
        # Buscar usuario en la configuración
        if login_data.username not in users_config:
            logger.warning(f"Usuario no encontrado en configuración: {login_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario o contraseña incorrectos"
            )
        
        user_config = users_config[login_data.username]
        
        # Verificar contraseña usando hash
        if "password_hash" in user_config:
            stored_hash = user_config["password_hash"]
            input_password = login_data.password
            
            # Debug logging
            logger.info(f"Verificando credenciales para: {login_data.username}")
            logger.info(f"Password input: '{input_password}'")
            logger.info(f"Stored hash: {stored_hash}")
            
            # Generar hash SHA256 de la contraseña ingresada
            import hashlib
            calculated_hash = hashlib.sha256(input_password.encode()).hexdigest()
            logger.info(f"Calculated hash: {calculated_hash}")
            logger.info(f"Hash match: {calculated_hash == stored_hash}")
            
            password_valid = verify_password(input_password, stored_hash)
            logger.info(f"Password verification result: {password_valid}")
        else:
            password_valid = False
            logger.warning(f"No password_hash found for user: {login_data.username}")
        
        if not password_valid:
            logger.warning(f"Contraseña incorrecta para usuario: {login_data.username}")
            logger.warning(f"Input: '{login_data.password}' vs stored hash: {user_config.get('password_hash', 'NO_HASH')}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario o contraseña incorrectos"
            )
        
        # Verificar que el usuario esté activo
        if not user_config.get("is_active", True):
            logger.warning(f"Usuario inactivo: {login_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario inactivo"
            )
        
        # Determinar tenant_id final
        # Si es superuser, puede acceder a cualquier tenant
        if user_config.get("is_superuser", False):
            final_tenant_id = requested_tenant_id  # Admin puede usar cualquier tenant
        else:
            final_tenant_id = user_config.get("tenant_id", "demo")  # Usuario normal usa su tenant
        
        logger.info(f"Final tenant ID for {login_data.username}: {final_tenant_id}")
        
        # Crear token de acceso
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={
                "sub": login_data.username,  # Usar username como ID
                "username": login_data.username,
                "email": user_config.get("email", ""),
                "tenant_id": final_tenant_id,
                "is_superuser": user_config.get("is_superuser", False),
                "first_name": user_config.get("name", "").split(" ")[0] if user_config.get("name") else "",
                "last_name": " ".join(user_config.get("name", "").split(" ")[1:]) if user_config.get("name") else "",
                "permissions": user_config.get("permissions", ["read"]),
                "restricted_to": user_config.get("restricted_to", None)
            },
            expires_delta=access_token_expires
        )
        
        # Crear refresh token con mayor duración
        refresh_token_expires = timedelta(days=7)  # 7 días
        refresh_token = create_access_token(
            data={
                "sub": login_data.username,
                "type": "refresh",
                "tenant_id": tenant_id
            },
            expires_delta=refresh_token_expires
        )
        
        logger.info(f"Login exitoso para usuario: {login_data.username}")
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@router.post("/refresh", response_model=Token)
async def refresh_token(
    request: Request,
    db: Session = Depends(get_master_db)
) -> Any:
    """
    Refrescar token - CORREGIDO
    """
    try:
        # Obtener token del header Authorization
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token requerido"
            )
        
        token = auth_header.split(" ")[1]
        
        # Decodificar token
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            username = payload.get("username")
            if not username:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token inválido"
                )
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido o expirado"
            )
        
        # Buscar usuario
        user = db.query(User).filter(
            User.username == username,
            User.is_active == True
        ).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no encontrado"
            )
        
        # Crear nuevo token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={
                "sub": str(user.id),
                "username": user.username,
                "email": user.email,
                "tenant_id": payload.get("tenant_id", "demo"),
                "is_superuser": user.is_superuser or False,
                "first_name": user.first_name,
                "last_name": user.last_name
            },
            expires_delta=access_token_expires
        )
        
        # Crear nuevo refresh token
        refresh_token_expires = timedelta(days=7)
        refresh_token = create_access_token(
            data={
                "sub": username,
                "type": "refresh",
                "tenant_id": payload.get("tenant_id", "demo")
            },
            expires_delta=refresh_token_expires
        )
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error refrescando token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@router.post("/logout")
async def logout() -> Any:
    """
    Logout - CORREGIDO
    """
    # En JWT, el logout se maneja en el cliente eliminando el token
    return {"message": "Logout exitoso"}

@router.get("/me")
async def get_current_user_info(
    request: Request,
    db: Session = Depends(get_master_db)
) -> Any:
    """
    Obtener información del usuario actual - CORREGIDO
    """
    try:
        # Obtener token del header Authorization
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token requerido"
            )
        
        token = auth_header.split(" ")[1]
        
        # Decodificar token
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            username = payload.get("username")
            if not username:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token inválido"
                )
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido o expirado"
            )
        
        # Buscar usuario
        user = db.query(User).filter(
            User.username == username,
            User.is_active == True
        ).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no encontrado"
            )
        
        return {
            "id": str(user.id),
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_superuser": user.is_superuser or False,
            "is_active": user.is_active,
            "tenant_id": payload.get("tenant_id", "demo")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo usuario actual: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )