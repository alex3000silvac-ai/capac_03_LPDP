"""
Middleware y utilidades para manejo de tenants
"""
from typing import Optional
from fastapi import Request, HTTPException, status
from sqlalchemy.orm import Session
import logging

from app.core.database import get_master_db, get_tenant_db
from app.models.tenant import Tenant
from app.models.user import User

logger = logging.getLogger(__name__)

async def get_tenant_from_request(request: Request) -> Optional[str]:
    """
    Extrae el tenant ID de la request
    """
    # Opción 1: Desde header X-Tenant-ID
    tenant_id = request.headers.get("X-Tenant-ID")
    if tenant_id:
        return tenant_id
    
    # Opción 2: Desde query parameter
    tenant_id = request.query_params.get("tenant_id")
    if tenant_id:
        return tenant_id
    
    # Opción 3: Desde path parameter (ej: /api/v1/tenants/{tenant_id}/...)
    path_parts = request.url.path.split("/")
    for i, part in enumerate(path_parts):
        if part == "tenants" and i + 1 < len(path_parts):
            potential_tenant = path_parts[i + 1]
            if potential_tenant and potential_tenant != "me":
                return potential_tenant
    
    # Opción 4: Desde subdominio
    host = request.headers.get("host", "")
    if "." in host:
        subdomain = host.split(".")[0]
        if subdomain and subdomain not in ["www", "api", "localhost", "127"]:
            return subdomain
    
    return None

async def validate_tenant_access(request: Request, tenant_id: str) -> bool:
    """
    Valida que el usuario tenga acceso al tenant
    """
    try:
        # Obtener usuario del token
        user = getattr(request.state, 'user', None)
        if not user:
            return False
        
        # Superusuarios tienen acceso a todos los tenants
        if user.is_superuser:
            return True
        
        # Verificar que el usuario pertenezca al tenant
        if user.tenant_id != tenant_id:
            return False
        
        return True
        
    except Exception as e:
        logger.error(f"Error validando acceso al tenant {tenant_id}: {e}")
        return False

async def get_tenant_db(request: Request) -> Session:
    """
    Obtiene la sesión de base de datos para el tenant actual
    """
    tenant_id = getattr(request.state, 'tenant_id', None)
    if not tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tenant ID no especificado"
        )
    
    return get_tenant_db(tenant_id)

async def get_master_db() -> Session:
    """
    Obtiene la sesión de base de datos master
    """
    return get_master_db()

async def create_tenant_schema(tenant_id: str) -> bool:
    """
    Crea el esquema de base de datos para un nuevo tenant
    """
    try:
        from app.core.database import create_tenant_schema as _create_schema
        _create_schema(tenant_id)
        logger.info(f"Esquema creado exitosamente para tenant {tenant_id}")
        return True
    except Exception as e:
        logger.error(f"Error creando esquema para tenant {tenant_id}: {e}")
        return False

async def cleanup_tenant_connections():
    """
    Limpia las conexiones de base de datos de tenants
    """
    try:
        logger.info("Limpiando conexiones de tenants...")
        # Por ahora solo log, implementar lógica de limpieza si es necesario
        return True
    except Exception as e:
        logger.error(f"Error limpiando conexiones de tenants: {e}")
        return False

async def get_tenant_stats(tenant_id: str) -> dict:
    """
    Obtiene estadísticas del tenant
    """
    try:
        db = get_master_db()
        
        # Contar usuarios
        user_count = db.query(User).filter(User.tenant_id == tenant_id).count()
        
        # Contar empresas (si existe el modelo)
        empresa_count = 0
        try:
            from app.models.empresa import Empresa
            empresa_count = db.query(Empresa).filter(Empresa.tenant_id == tenant_id).count()
        except ImportError:
            pass
        
        return {
            "tenant_id": tenant_id,
            "user_count": user_count,
            "empresa_count": empresa_count,
            "status": "active"
        }
        
    except Exception as e:
        logger.error(f"Error obteniendo stats del tenant {tenant_id}: {e}")
        return {
            "tenant_id": tenant_id,
            "user_count": 0,
            "empresa_count": 0,
            "status": "error"
        }

async def drop_tenant_schema(tenant_id: str) -> bool:
    """
    Elimina el esquema de base de datos de un tenant
    """
    try:
        from app.core.database import drop_tenant_schema as _drop_schema
        _drop_schema(tenant_id)
        logger.info(f"Esquema eliminado exitosamente para tenant {tenant_id}")
        return True
    except Exception as e:
        logger.error(f"Error eliminando esquema para tenant {tenant_id}: {e}")
        return False

async def get_tenant_info(tenant_id: str) -> Optional[Tenant]:
    """
    Obtiene información del tenant
    """
    try:
        with get_master_db() as db:
            tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
            return tenant
    except Exception as e:
        logger.error(f"Error obteniendo información del tenant {tenant_id}: {e}")
        return None

async def list_active_tenants() -> list:
    """
    Lista todos los tenants activos
    """
    try:
        with get_master_db() as db:
            tenants = db.query(Tenant).filter(Tenant.is_active == True).all()
            return tenants
    except Exception as e:
        logger.error(f"Error listando tenants activos: {e}")
        return []

async def check_tenant_license(tenant_id: str, module_code: str) -> bool:
    """
    Verifica si un tenant tiene licencia para un módulo específico
    """
    try:
        tenant = await get_tenant_info(tenant_id)
        if not tenant:
            return False
        
        # Verificar si el tenant tiene acceso al módulo
        # Esto dependerá de tu modelo de licencias
        return True  # Por ahora retorna True
        
    except Exception as e:
        logger.error(f"Error verificando licencia del tenant {tenant_id} para módulo {module_code}: {e}")
        return False

async def get_tenant_user_count(tenant_id: str) -> int:
    """
    Obtiene el número de usuarios en un tenant
    """
    try:
        with get_tenant_db(tenant_id) as db:
            from app.models.user import User
            count = db.query(User).count()
            return count
    except Exception as e:
        logger.error(f"Error contando usuarios del tenant {tenant_id}: {e}")
        return 0

async def validate_tenant_limits(tenant_id: str) -> dict:
    """
    Valida los límites del tenant (usuarios, módulos, etc.)
    """
    try:
        tenant = await get_tenant_info(tenant_id)
        if not tenant:
            return {"valid": False, "error": "Tenant no encontrado"}
        
        user_count = await get_tenant_user_count(tenant_id)
        
        # Verificar límite de usuarios
        if tenant.max_users and user_count >= tenant.max_users:
            return {
                "valid": False,
                "error": "Límite de usuarios alcanzado",
                "current": user_count,
                "limit": tenant.max_users
            }
        
        # Verificar si es trial y ha expirado
        if tenant.is_trial and tenant.trial_expires_at:
            from datetime import datetime
            if datetime.utcnow() > tenant.trial_expires_at:
                return {
                    "valid": False,
                    "error": "Período de prueba expirado",
                    "expired_at": tenant.trial_expires_at.isoformat()
                }
        
        return {"valid": True}
        
    except Exception as e:
        logger.error(f"Error validando límites del tenant {tenant_id}: {e}")
        return {"valid": False, "error": str(e)}

# Middleware para inyectar tenant_id en request.state
async def tenant_middleware(request: Request, call_next):
    """
    Middleware que inyecta el tenant_id en request.state
    """
    try:
        # Si la petición es OPTIONS, la dejamos pasar para que el middleware de CORS la gestione
        if request.method == "OPTIONS":
            return await call_next(request)

        # Rutas públicas que no requieren validación de tenant
        public_paths = ["/", "/health", "/api/docs", "/api/redoc", "/api/openapi.json", "/api/v1/auth/login", "/api/v1/tenants/available"]
        
        if request.url.path in public_paths:
            return await call_next(request)
        
        # Obtener tenant_id de la request
        tenant_id = await get_tenant_from_request(request)
        
        if tenant_id:
            # Validar acceso al tenant
            has_access = await validate_tenant_access(request, tenant_id)
            if not has_access:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Acceso denegado al tenant"
                )
            
            # Inyectar tenant_id en request.state
            request.state.tenant_id = tenant_id
            
            # Obtener información del tenant
            tenant_info = await get_tenant_info(tenant_id)
            if tenant_info:
                request.state.tenant_info = tenant_info
        
        # Continuar con la request
        response = await call_next(request)
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en tenant middleware: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )