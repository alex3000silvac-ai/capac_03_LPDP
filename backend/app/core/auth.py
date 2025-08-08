"""
Sistema de autenticación y autorización
"""
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError
import logging
from ..models.user import User, Role
from ..models.empresa import Empresa, ModuloAcceso
from .security import (
    verify_password, 
    decode_token, 
    create_access_token,
    create_refresh_token,
    encrypt_field,
    decrypt_field,
    hash_for_search
)
from .tenant import get_tenant_db, get_tenant_from_request, validate_tenant, get_master_db
from .config import settings

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


class AuthService:
    """Servicio de autenticación"""
    
    @staticmethod
    def authenticate_user(
        tenant_id: str,
        username: str,
        password: str
    ) -> Optional[User]:
        """Autentica un usuario"""
        try:
            db = get_tenant_db(tenant_id)
            
            # Buscar por username o email
            user = db.query(User).filter(
                (User.username == username) | (User.email == username),
                User.is_active == True
            ).first()
            
            if not user:
                return None
            
            # Verificar si está bloqueado
            if user.locked_until and user.locked_until > datetime.utcnow():
                return None
            
            # Verificar contraseña
            if not verify_password(password, user.password_hash):
                # Incrementar intentos fallidos
                user.failed_login_attempts += 1
                
                # Bloquear después de 5 intentos
                if user.failed_login_attempts >= 5:
                    user.locked_until = datetime.utcnow() + timedelta(hours=1)
                
                db.commit()
                return None
            
            # Login exitoso - resetear intentos
            user.failed_login_attempts = 0
            user.last_login = datetime.utcnow()
            db.commit()
            
            return user
            
        except Exception as e:
            logger.error(f"Error authenticating user: {str(e)}")
            return None
    
    @staticmethod
    def create_tokens(user: User, tenant_id: str) -> Dict[str, str]:
        """Crea tokens de acceso y refresco"""
        # Datos del token
        token_data = {
            "sub": user.id,
            "tenant_id": tenant_id,
            "email": user.email,
            "roles": [role.code for role in user.roles],
            "is_superuser": user.is_superuser,
            "is_dpo": user.is_dpo
        }
        
        # Crear tokens
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    
    @staticmethod
    def get_user_permissions(user: User, tenant_id: str) -> List[str]:
        """Obtiene todos los permisos de un usuario"""
        permissions = set()
        
        # Permisos de roles
        for role in user.roles:
            if role.permissions:
                permissions.update(role.permissions)
        
        # Permisos especiales
        if user.is_superuser:
            permissions.add("*")  # Todos los permisos
        
        if user.is_dpo:
            permissions.update([
                "dpia.approve",
                "breach.manage",
                "consent.export",
                "arcopol.manage"
            ])
        
        return list(permissions)
    
    @staticmethod
    def check_module_access(user_id: str, module_code: str, tenant_id: str) -> bool:
        """Verifica si el usuario tiene acceso a un módulo"""
        db = get_tenant_db(tenant_id)
        
        # Obtener empresa del usuario
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        
        # Superusuarios tienen acceso total
        if user.is_superuser:
            return True
        
        # Verificar acceso al módulo
        modulo = db.query(ModuloAcceso).join(Empresa).filter(
            ModuloAcceso.codigo_modulo == module_code,
            ModuloAcceso.is_active == True,
            ModuloAcceso.fecha_expiracion > datetime.utcnow()
        ).first()
        
        return modulo is not None


async def get_current_user(
    request: Request,
    token: str = Depends(oauth2_scheme)
) -> User:
    """Obtiene el usuario actual desde el token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decodificar token
        payload = decode_token(token)
        if payload is None:
            raise credentials_exception
        
        user_id: str = payload.get("sub")
        tenant_id: str = payload.get("tenant_id")
        
        if user_id is None or tenant_id is None:
            raise credentials_exception
        
        # Validar tenant
        master_db = get_master_db()
        tenant = validate_tenant(tenant_id, master_db)
        master_db.close()
        
        if not tenant:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid or inactive tenant"
            )
        
        # Obtener usuario
        db = get_tenant_db(tenant_id)
        user = db.query(User).filter(
            User.id == user_id,
            User.is_active == True
        ).first()
        
        if user is None:
            raise credentials_exception
        
        # Guardar tenant_id en request para uso posterior
        request.state.tenant_id = tenant_id
        request.state.user = user
        
        return user
        
    except JWTError:
        raise credentials_exception
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting current user: {str(e)}")
        raise credentials_exception


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Verifica que el usuario esté activo"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user


async def get_current_superuser(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Verifica que el usuario sea superusuario"""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user


async def get_current_dpo(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Verifica que el usuario sea DPO"""
    if not current_user.is_dpo and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="DPO access required"
        )
    return current_user


class PermissionChecker:
    """Verificador de permisos"""
    
    def __init__(self, required_permissions: List[str]):
        self.required_permissions = required_permissions
    
    def __call__(
        self,
        request: Request,
        current_user: User = Depends(get_current_active_user)
    ) -> bool:
        """Verifica permisos del usuario"""
        if current_user.is_superuser:
            return True
        
        tenant_id = request.state.tenant_id
        user_permissions = AuthService.get_user_permissions(
            current_user, 
            tenant_id
        )
        
        # Verificar si tiene alguno de los permisos requeridos
        for permission in self.required_permissions:
            if permission in user_permissions or "*" in user_permissions:
                return True
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Permission required: {', '.join(self.required_permissions)}"
        )


class ModuleAccessChecker:
    """Verificador de acceso a módulos"""
    
    def __init__(self, module_code: str):
        self.module_code = module_code
    
    def __call__(
        self,
        request: Request,
        current_user: User = Depends(get_current_active_user)
    ) -> bool:
        """Verifica acceso al módulo"""
        tenant_id = request.state.tenant_id
        
        if not AuthService.check_module_access(
            current_user.id,
            self.module_code,
            tenant_id
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"No access to module: {self.module_code}"
            )
        
        return True


# Alias para uso conveniente
require_permission = PermissionChecker
require_module = ModuleAccessChecker