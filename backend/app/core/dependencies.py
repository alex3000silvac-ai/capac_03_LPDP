"""
Dependencias para autenticación y autorización
"""
from typing import Optional, List
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from datetime import datetime

from app.core.config import settings
from app.core.database import get_master_db
from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission

# Esquema de autenticación
security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_master_db)
) -> User:
    """
    Obtiene el usuario actual basado en el token JWT
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            credentials.credentials, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Buscar usuario en DB master primero
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    
    return user

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

def require_permission(required_permissions: List[str]):
    """
    Decorador para verificar permisos específicos
    """
    def permission_checker(
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_master_db)
    ) -> bool:
        # Superusuarios tienen todos los permisos
        if current_user.is_superuser:
            return True
        
        # Verificar permisos del usuario
        user_permissions = set()
        for role in current_user.roles:
            for permission in role.permissions:
                user_permissions.add(permission.code)
        
        # Verificar si tiene todos los permisos requeridos
        for required_perm in required_permissions:
            if required_perm not in user_permissions:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Acceso denegado: Se requiere el permiso '{required_perm}'"
                )
        
        return True
    
    return permission_checker

def get_tenant_user(
    request: Request,
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    Obtiene el usuario en el contexto del tenant actual
    """
    tenant_id = getattr(request.state, 'tenant_id', None)
    if not tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tenant ID no especificado"
        )
    
    # Verificar que el usuario pertenezca al tenant
    if current_user.tenant_id != tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario no pertenece al tenant especificado"
        )
    
    return current_user

def get_optional_tenant_user(
    request: Request,
    current_user: User = Depends(get_current_active_user)
) -> Optional[User]:
    """
    Obtiene el usuario en el contexto del tenant (opcional)
    """
    tenant_id = getattr(request.state, 'tenant_id', None)
    if not tenant_id:
        return None
    
    # Verificar que el usuario pertenezca al tenant
    if current_user.tenant_id != tenant_id:
        return None
    
    return current_user