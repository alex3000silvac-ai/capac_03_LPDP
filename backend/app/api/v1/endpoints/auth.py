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

@router.post("/initialize-users")
async def initialize_users(db: Session = Depends(get_master_db)):
    """Inicializa usuarios por defecto en la base de datos"""
    try:
        # Verificar si ya existen usuarios
        existing_users = db.query(User).count()
        if existing_users > 0:
            return {
                "message": "Usuarios ya existen en la base de datos",
                "users_count": existing_users
            }
        
        # Crear usuario admin
        admin_user = User(
            username="admin",
            email="admin@empresa.cl",
            first_name="Administrador",
            last_name="del Sistema",
            is_superuser=True,
            is_active=True,
            tenant_id=None  # Admin sin tenant específico
        )
        admin_user.set_password("Padmin123!")
        
        # Crear usuario demo
        demo_user = User(
            username="demo",
            email="demo@empresa.cl",
            first_name="Usuario",
            last_name="Demo",
            is_superuser=False,
            is_active=True,
            tenant_id=None  # Demo sin tenant específico por ahora
        )
        demo_user.set_password("Demo123!")
        
        db.add(admin_user)
        db.add(demo_user)
        db.commit()
        
        return {
            "message": "Usuarios inicializados correctamente",
            "users_created": [
                {"username": "admin", "email": "admin@empresa.cl"},
                {"username": "demo", "email": "demo@empresa.cl"}
            ]
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error inicializando usuarios: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inicializando usuarios: {str(e)}"
        )

@router.post("/create-tables")
async def create_tables():
    """Crea las tablas necesarias en la base de datos"""
    try:
        from app.core.database import master_engine
        from app.models.user import Base
        
        # Crear todas las tablas
        Base.metadata.create_all(bind=master_engine)
        
        return {
            "message": "Tablas creadas correctamente",
            "status": "success"
        }
    except Exception as e:
        logger.error(f"Error creando tablas: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creando tablas: {str(e)}"
        )

@router.get("/check-users")
async def check_users(db: Session = Depends(get_master_db)):
    """Verifica qué usuarios existen en la base de datos"""
    try:
        users = db.query(User).all()
        return {
            "users_count": len(users),
            "users": [
                {
                    "username": user.username,
                    "email": user.email,
                    "is_active": user.is_active,
                    "is_superuser": user.is_superuser
                } for user in users
            ]
        }
    except Exception as e:
        logger.error(f"Error checking users: {e}")
        return {
            "error": str(e),
            "users_count": 0
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
        
        # SOLUCIÓN TEMPORAL: Usuarios directos hasta configurar Supabase
        temp_users = {
            "admin": {
                "password": "Padmin123!",
                "email": "admin@empresa.cl",
                "first_name": "Administrador",
                "last_name": "del Sistema",
                "is_superuser": True,
                "is_active": True
            },
            "demo": {
                "password": "Demo123!",
                "email": "demo@empresa.cl",
                "first_name": "Usuario",
                "last_name": "Demo",
                "is_superuser": False,
                "is_active": True
            }
        }
        
        if login_data.username not in temp_users:
            logger.warning(f"Usuario no encontrado: {login_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario o contraseña incorrectos"
            )
        
        temp_user = temp_users[login_data.username]
        if login_data.password != temp_user["password"]:
            logger.warning(f"Contraseña incorrecta para usuario: {login_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario o contraseña incorrectos"
            )
        
        # Determinar tenant_id final
        final_tenant_id = requested_tenant_id if temp_user["is_superuser"] else "demo"
        
        # Crear token de acceso
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={
                "sub": login_data.username,
                "username": login_data.username,
                "email": temp_user["email"],
                "tenant_id": final_tenant_id,
                "is_superuser": temp_user["is_superuser"],
                "first_name": temp_user["first_name"],
                "last_name": temp_user["last_name"],
                "permissions": ["read", "write", "admin", "superuser"] if temp_user["is_superuser"] else ["read"],
                "restricted_to": "intro_only" if login_data.username == "demo" else None
            },
            expires_delta=access_token_expires
        )
        
        logger.info(f"Final tenant ID for {login_data.username}: {final_tenant_id}")
        
        # Crear refresh token con mayor duración
        refresh_token_expires = timedelta(days=7)  # 7 días
        refresh_token = create_access_token(
            data={
                "sub": login_data.username,
                "type": "refresh",
                "tenant_id": final_tenant_id
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