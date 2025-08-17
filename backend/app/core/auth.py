"""
Configuración de autenticación y autorización
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError, jwt
import logging

from app.core.config import settings
from app.core.database import get_master_db
from app.core.security import verify_password, create_access_token
from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission

logger = logging.getLogger(__name__)

# Esquema de autenticación
security = HTTPBearer()

class AuthService:
    """
    Servicio de autenticación y autorización
    """
    
    @staticmethod
    def authenticate_user(username: str, password: str, db: Session) -> Optional[User]:
        """
        Autentica un usuario con username y contraseña
        """
        try:
            # Buscar usuario por username o email
            user = db.query(User).filter(
                (User.username == username) | (User.email == username)
            ).first()
            
            if not user:
                return None
            
            if not verify_password(password, user.password_hash):
                return None
            
            if not user.is_active:
                return None
            
            return user
            
        except Exception as e:
            logger.error(f"Error autenticando usuario {username}: {e}")
            return None
    
    @staticmethod
    def create_user_token(user: User, expires_delta: Optional[timedelta] = None) -> str:
        """
        Crea un token JWT para un usuario
        """
        # Obtener permisos del usuario
        permissions = []
        for role in user.roles:
            for permission in role.permissions:
                permissions.append(permission.code)
        
        # Crear payload del token
        payload = {
            "sub": str(user.id),
            "username": user.username,
            "email": user.email,
            "tenant_id": user.tenant_id,
            "is_superuser": user.is_superuser,
            "permissions": permissions,
            "type": "access"
        }
        
        return create_access_token(payload, expires_delta)
    
    @staticmethod
    def verify_user_token(token: str) -> Optional[Dict[str, Any]]:
        """
        Verifica y decodifica un token JWT de usuario
        """
        try:
            payload = jwt.decode(
                token, 
                settings.SECRET_KEY, 
                algorithms=[settings.ALGORITHM]
            )
            
            # Verificar tipo de token
            if payload.get("type") != "access":
                return None
            
            return payload
            
        except JWTError as e:
            logger.error(f"Error decodificando token: {e}")
            return None
    
    @staticmethod
    def get_user_permissions(user: User) -> list:
        """
        Obtiene todos los permisos de un usuario
        """
        permissions = set()
        
        for role in user.roles:
            for permission in role.permissions:
                permissions.add(permission.code)
        
        return list(permissions)
    
    @staticmethod
    def has_permission(user: User, required_permission: str) -> bool:
        """
        Verifica si un usuario tiene un permiso específico
        """
        # Superusuarios tienen todos los permisos
        if user.is_superuser:
            return True
        
        user_permissions = AuthService.get_user_permissions(user)
        return required_permission in user_permissions
    
    @staticmethod
    def has_any_permission(user: User, required_permissions: list) -> bool:
        """
        Verifica si un usuario tiene al menos uno de los permisos requeridos
        """
        # Superusuarios tienen todos los permisos
        if user.is_superuser:
            return True
        
        user_permissions = AuthService.get_user_permissions(user)
        return any(perm in user_permissions for perm in required_permissions)
    
    @staticmethod
    def has_all_permissions(user: User, required_permissions: list) -> bool:
        """
        Verifica si un usuario tiene todos los permisos requeridos
        """
        # Superusuarios tienen todos los permisos
        if user.is_superuser:
            return True
        
        user_permissions = AuthService.get_user_permissions(user)
        return all(perm in user_permissions for perm in required_permissions)

# Instancia del servicio
auth_service = AuthService()

# Dependencias de FastAPI
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_master_db)
) -> User:
    """
    Obtiene el usuario actual desde el token JWT
    """
    try:
        # Verificar token
        payload = auth_service.verify_user_token(credentials.credentials)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido o expirado",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        # Obtener usuario
        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no encontrado",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario inactivo",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo usuario actual: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Error de autenticación",
            headers={"WWW-Authenticate": "Bearer"}
        )

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Verifica que el usuario actual esté activo
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo"
        )
    return current_user

def get_current_superuser(current_user: User = Depends(get_current_active_user)) -> User:
    """
    Verifica que el usuario actual sea superadministrador
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado: Se requieren privilegios de superadministrador"
        )
    return current_user

def require_permission(required_permission: str):
    """
    Decorador para verificar un permiso específico
    """
    def permission_checker(current_user: User = Depends(get_current_active_user)) -> bool:
        if not auth_service.has_permission(current_user, required_permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado: Se requiere el permiso '{required_permission}'"
            )
        return True
    
    return permission_checker

def require_any_permission(required_permissions: list):
    """
    Decorador para verificar al menos uno de los permisos requeridos
    """
    def permission_checker(current_user: User = Depends(get_current_active_user)) -> bool:
        if not auth_service.has_any_permission(current_user, required_permissions):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado: Se requiere al menos uno de los permisos: {', '.join(required_permissions)}"
            )
        return True
    
    return permission_checker

def require_all_permissions(required_permissions: list):
    """
    Decorador para verificar todos los permisos requeridos
    """
    def permission_checker(current_user: User = Depends(get_current_active_user)) -> bool:
        if not auth_service.has_all_permissions(current_user, required_permissions):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado: Se requieren todos los permisos: {', '.join(required_permissions)}"
            )
        return True
    
    return permission_checker

def get_tenant_user(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    Obtiene el usuario en el contexto del tenant actual
    """
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario no pertenece a ningún tenant"
        )
    
    return current_user

# Funciones de compatibilidad
def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Función de compatibilidad - decodifica un token JWT
    """
    return auth_service.verify_user_token(token)