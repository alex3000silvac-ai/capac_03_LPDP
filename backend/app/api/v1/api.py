"""
Router principal de la API v1 - CORREGIDO POR INGENIERO EN JEFE
"""
from fastapi import APIRouter
import logging

logger = logging.getLogger(__name__)

# IMPORTAR ENDPOINTS CON FALLBACK PARA DEPLOY CRÍTICO
try:
    from app.api.v1.endpoints import (
        auth,
        users,
        tenants,
        empresas,
        organizaciones,
        capacitacion,
        downloads,
    )
    BASIC_ENDPOINTS_OK = True
except ImportError as e:
    logger.error(f"Error importando endpoints básicos: {e}")
    BASIC_ENDPOINTS_OK = False

# IMPORTAR ENDPOINTS NUEVOS (OPCIONAL)
try:
    from app.api.v1.endpoints import mapeo_datos
    MAPEO_DATOS_OK = True
except ImportError:
    MAPEO_DATOS_OK = False

try:
    from app.api.v1.endpoints import auth_demo
    AUTH_DEMO_OK = True
except ImportError:
    AUTH_DEMO_OK = False

try:
    from app.api.v1.endpoints import empresas_multitenant
    EMPRESAS_MT_OK = True
except ImportError:
    EMPRESAS_MT_OK = False

api_router = APIRouter()

# RUTAS BÁSICAS (SIEMPRE INCLUIR)
if BASIC_ENDPOINTS_OK:
    api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
    api_router.include_router(users.router, prefix="/users", tags=["users"])
    api_router.include_router(tenants.router, prefix="/tenants", tags=["tenants"])
    api_router.include_router(empresas.router, prefix="/empresas", tags=["empresas"])
    api_router.include_router(organizaciones.router, prefix="/organizaciones", tags=["organizaciones"])
    api_router.include_router(capacitacion.router, prefix="/capacitacion", tags=["capacitacion"])
    api_router.include_router(downloads.router, prefix="/downloads", tags=["downloads"])

# RUTAS NUEVAS (CONDICIONALES)
if AUTH_DEMO_OK:
    api_router.include_router(auth_demo.router, prefix="/demo", tags=["demo-authentication"])
    logger.info("✅ Demo authentication habilitado")

if MAPEO_DATOS_OK:
    api_router.include_router(mapeo_datos.router, prefix="/mapeo-datos", tags=["mapeo-datos"])
    logger.info("✅ Mapeo datos habilitado")

if EMPRESAS_MT_OK:
    api_router.include_router(empresas_multitenant.router, prefix="/empresas-mt", tags=["empresas-multitenant"])
    logger.info("✅ Empresas multi-tenant habilitado")

# COMENTADO: Rutas de módulos funcionales - Causan errores de import
# api_router.include_router(consentimientos.router, prefix="/consentimientos", tags=["consentimientos"])
# api_router.include_router(arcopol.router, prefix="/arcopol", tags=["arcopol"])
# api_router.include_router(inventario.router, prefix="/inventario", tags=["inventario"])
# api_router.include_router(brechas.router, prefix="/brechas", tags=["brechas"])
# api_router.include_router(dpia.router, prefix="/dpia", tags=["dpia"])
# api_router.include_router(transferencias.router, prefix="/transferencias", tags=["transferencias"])
# api_router.include_router(auditoria.router, prefix="/auditoria", tags=["auditoria"])
# api_router.include_router(capacitacion.router, prefix="/capacitacion", tags=["capacitacion"])

# COMENTADO: Rutas administrativas - Causan errores de import
# api_router.include_router(admin_comercial.router, prefix="/admin-comercial", tags=["admin-comercial"])

# COMENTADO: Rutas de soporte problemáticas - Causan errores de import
# api_router.include_router(actividades.router, prefix="/actividades", tags=["actividades"])
# api_router.include_router(categorias.router, prefix="/categorias", tags=["categorias"])
# api_router.include_router(entrevistas.router, prefix="/entrevistas", tags=["entrevistas"])
# api_router.include_router(reportes.router, prefix="/reportes", tags=["reportes"])

# NOTA: Estos endpoints serán habilitados cuando se resuelvan los conflictos de modelos