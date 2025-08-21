"""
Configuración de autenticación y autorización
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError, jwt
import logging

from app.core.config import settings
from app.core.database import get_master_db
from app.core.security import verify_password, create_access_token
from app.core.security_enhanced import (
    password_manager, jwt_manager, demo_manager, 
    input_validator, audit_logger, rate_limiter,
    SecurityConfig
)
from app.models.user import User

logger = logging.getLogger(__name__)

# Esquema de autenticación
security = HTTPBearer()

class AuthService:
    """
    Servicio de autenticación y autorización SEGURO
    Integra todas las mejoras de seguridad del sistema
    """
    
    @staticmethod
    def authenticate_user(
        username: str, 
        password: str, 
        db: Session,
        ip_address: str = "unknown",
        user_agent: str = "unknown"
    ) -> Optional[User]:
        """
        Autentica un usuario con username y contraseña (VERSIÓN SEGURA)
        """
        try:
            # Validar entrada para prevenir inyección
            if not input_validator.validate_email(username) and not username.isalnum():
                audit_logger.log_authentication_attempt(
                    username, "unknown", False, ip_address, user_agent
                )
                return None
            
            # Rate limiting por IP
            allowed, remaining = rate_limiter.check_rate_limit(
                f"auth_attempts_{ip_address}", max_attempts=5, window_seconds=300
            )
            if not allowed:
                audit_logger.log_security_event(
                    "rate_limit_exceeded", "unknown", username,
                    {"ip_address": ip_address, "user_agent": user_agent},
                    "WARNING"
                )
                return None
            
            # Buscar usuario por username o email (SQL seguro)
            user = db.query(User).filter(
                (User.username == username) | (User.email == username)
            ).first()
            
            if not user:
                # Log intento fallido
                audit_logger.log_authentication_attempt(
                    username, "unknown", False, ip_address, user_agent
                )
                return None
            
            # Verificar contraseña con sistema mejorado
            if not password_manager.verify_password(password, user.password_hash):
                audit_logger.log_authentication_attempt(
                    username, user.tenant_id or "unknown", False, ip_address, user_agent
                )
                return None
            
            if not user.is_active:
                audit_logger.log_authentication_attempt(
                    username, user.tenant_id or "unknown", False, ip_address, user_agent
                )
                return None
            
            # Log autenticación exitosa
            audit_logger.log_authentication_attempt(
                username, user.tenant_id or "unknown", True, ip_address, user_agent
            )
            
            return user
            
        except Exception as e:
            logger.error(f"Error autenticando usuario {username}: {e}")
            audit_logger.log_security_event(
                "authentication_error", "unknown", username,
                {"error": str(e), "ip_address": ip_address},
                "ERROR"
            )
            return None
    
    @staticmethod
    def create_user_token(user: User, expires_delta: Optional[timedelta] = None) -> str:
        """
        Crea un token JWT SEGURO para un usuario con tenant isolation
        """
        # Validar tenant_id para prevenir vulnerabilidades
        tenant_id = user.tenant_id or "unknown"
        if not input_validator.validate_tenant_id(tenant_id):
            raise ValueError(f"Tenant ID inválido: {tenant_id}")
        
        # Permisos simplificados (sin roles)
        permissions = ["basic_access"]
        if user.is_superuser:
            permissions.append("admin_access")
        
        # Crear payload del token
        payload = {
            "sub": str(user.id),
            "username": user.username,
            "email": user.email,
            "is_superuser": user.is_superuser,
            "permissions": permissions,
            "is_demo": getattr(user, 'is_demo', False)
        }
        
        # Usar JWT manager seguro con tenant isolation
        return jwt_manager.create_access_token(
            data=payload,
            tenant_id=tenant_id,
            expires_delta=expires_delta
        )
    
    @staticmethod
    def verify_user_token(token: str) -> Optional[Dict[str, Any]]:
        """
        Verifica y decodifica un token JWT de usuario (VERSIÓN SEGURA)
        """
        try:
            # Usar JWT manager seguro que valida tenant_id
            payload = jwt_manager.decode_token(token)
            
            # Verificar tipo de token
            if payload.get("type") != "access":
                return None
            
            # Validar tenant_id en el token
            tenant_id = payload.get("tenant_id")
            if tenant_id and not input_validator.validate_tenant_id(tenant_id):
                logger.warning(f"Token con tenant_id inválido: {tenant_id}")
                return None
            
            return payload
            
        except ValueError as e:
            logger.error(f"Error decodificando token: {e}")
            return None
        except Exception as e:
            logger.error(f"Error inesperado decodificando token: {e}")
            return None
    
    @staticmethod
    def authenticate_demo_user(
        email: str, 
        password: str,
        ip_address: str = "unknown",
        user_agent: str = "unknown"
    ) -> Optional[Dict[str, Any]]:
        """
        Autentica al usuario DEMO de forma segura
        """
        try:
            if not SecurityConfig.DEMO_MODE_ENABLED:
                logger.warning("Intento de acceso demo con modo deshabilitado")
                return None
            
            # Rate limiting específico para demo
            allowed, remaining = rate_limiter.check_rate_limit(
                f"demo_auth_{ip_address}", max_attempts=3, window_seconds=300
            )
            if not allowed:
                audit_logger.log_security_event(
                    "demo_rate_limit_exceeded", SecurityConfig.DEMO_TENANT_ID, email,
                    {"ip_address": ip_address, "user_agent": user_agent},
                    "WARNING"
                )
                return None
            
            # Usar el sistema demo seguro
            result = demo_manager.authenticate_demo_user(email, password)
            
            # Log del intento
            audit_logger.log_authentication_attempt(
                email, SecurityConfig.DEMO_TENANT_ID, 
                result is not None, ip_address, user_agent
            )
            
            if result:
                audit_logger.log_security_event(
                    "demo_user_authenticated", SecurityConfig.DEMO_TENANT_ID, email,
                    {"ip_address": ip_address, "limitations": result["user"]["limitations"]},
                    "INFO"
                )
            
            return result
            
        except Exception as e:
            logger.error(f"Error autenticando usuario demo: {e}")
            audit_logger.log_security_event(
                "demo_authentication_error", SecurityConfig.DEMO_TENANT_ID, email,
                {"error": str(e), "ip_address": ip_address},
                "ERROR"
            )
            return None
    
    @staticmethod
    def get_user_permissions(user: User) -> list:
        """
        Obtiene todos los permisos de un usuario
        """
        permissions = ["basic_access"]
        
        if user.is_superuser:
            permissions.append("admin_access")
        
        return permissions
    
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
    Obtiene el usuario actual desde el token JWT (VERSIÓN SEGURA)
    """
    try:
        # Verificar token con sistema seguro
        payload = auth_service.verify_user_token(credentials.credentials)
        if not payload:
            audit_logger.log_security_event(
                "invalid_token_attempt", "unknown", "unknown",
                {"token_prefix": credentials.credentials[:20] + "..."},
                "WARNING"
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido o expirado",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        # Validar tenant_id del token
        tenant_id = payload.get("tenant_id", "unknown")
        user_id = payload.get("sub")
        
        # Si es usuario demo, crear usuario virtual
        if payload.get("is_demo", False):
            # Para usuarios demo, retornamos un objeto User virtual
            demo_user = type('DemoUser', (), {})()
            demo_user.id = f"demo_{SecurityConfig.DEMO_TENANT_ID}"
            demo_user.username = "demo_user"
            demo_user.email = SecurityConfig.DEMO_ADMIN_EMAIL
            demo_user.tenant_id = SecurityConfig.DEMO_TENANT_ID
            demo_user.is_active = True
            demo_user.is_superuser = False
            demo_user.is_demo = True
            demo_user.password_hash = ""  # No exponer hash real
            
            return demo_user
        
        # Obtener usuario regular con validación de tenant
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            audit_logger.log_security_event(
                "user_not_found", tenant_id, user_id,
                {"attempted_user_id": user_id},
                "WARNING"
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no encontrado",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        # Validar que el tenant_id del token coincida con el del usuario
        if user.tenant_id != tenant_id:
            audit_logger.log_security_event(
                "tenant_mismatch", tenant_id, user_id,
                {"user_tenant": user.tenant_id, "token_tenant": tenant_id},
                "CRITICAL"
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Acceso no autorizado",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        if not user.is_active:
            audit_logger.log_security_event(
                "inactive_user_attempt", tenant_id, user_id,
                {"user_email": user.email},
                "WARNING"
            )
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
        audit_logger.log_security_event(
            "authentication_system_error", "unknown", "unknown",
            {"error": str(e)},
            "ERROR"
        )
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

class ModuleAccessChecker:
    """
    Verificador de acceso a módulos del sistema
    """
    
    @staticmethod
    def check_module_access(user: User, module_code: str) -> bool:
        """
        Verifica si el usuario tiene acceso a un módulo específico
        """
        if not user or not user.is_active:
            return False
        
        if user.is_superuser:
            return True
        
        # Verificación simplificada - en producción se verificaría contra licencias
        basic_modules = ["users", "profile", "dashboard"]
        if module_code in basic_modules:
            return True
        
        return False
    
    @staticmethod
    def get_user_modules(user: User) -> List[str]:
        """
        Obtiene la lista de módulos a los que tiene acceso el usuario
        """
        if not user or not user.is_active:
            return []
        
        if user.is_superuser:
            return ["all_modules"]
        
        # Módulos básicos para todos los usuarios
        return ["users", "profile", "dashboard"]