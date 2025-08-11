"""
Router principal de la API v1
"""
from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    tenants,
    users,
    empresas,
    consentimientos,
    arcopol,
    inventario,
    brechas,
    dpia,
    transferencias,
    auditoria,
    categorias,
    reportes
)

api_router = APIRouter()

# Autenticación (sin autenticación requerida)
api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["autenticación"]
)

# Administración Comercial (solo superadmin)
from app.api.v1.endpoints import admin_comercial
api_router.include_router(
    admin_comercial.router,
    prefix="/admin-comercial", 
    tags=["Administración Comercial"]
)

# Gestión de Tenants (solo superadmin)
api_router.include_router(
    tenants.router,
    prefix="/tenants",
    tags=["tenants"]
)

# Usuarios
api_router.include_router(
    users.router,
    prefix="/users",
    tags=["usuarios"]
)

# Empresas y Licencias
api_router.include_router(
    empresas.router,
    prefix="/empresas",
    tags=["empresas"]
)

# Módulo 1: Consentimientos
api_router.include_router(
    consentimientos.router,
    prefix="/consentimientos",
    tags=["MOD-1: Consentimientos"]
)

# Módulo 2: ARCOPOL
api_router.include_router(
    arcopol.router,
    prefix="/arcopol",
    tags=["MOD-2: Derechos ARCOPOL"]
)

# Módulo 3: Inventario
api_router.include_router(
    inventario.router,
    prefix="/inventario",
    tags=["MOD-3: Inventario de Datos"]
)

# Módulo 4: Brechas
api_router.include_router(
    brechas.router,
    prefix="/brechas",
    tags=["MOD-4: Notificación de Brechas"]
)

# Módulo 5: DPIA
api_router.include_router(
    dpia.router,
    prefix="/dpia",
    tags=["MOD-5: Evaluaciones de Impacto"]
)

# Módulo 6: Transferencias
api_router.include_router(
    transferencias.router,
    prefix="/transferencias",
    tags=["MOD-6: Transferencias Internacionales"]
)

# Módulo 7: Auditoría
api_router.include_router(
    auditoria.router,
    prefix="/auditoria",
    tags=["MOD-7: Auditoría y Cumplimiento"]
)

api_router.include_router(
    categorias.router,
    prefix="/categorias",
    tags=["categorias"]
)

api_router.include_router(
    reportes.router,
    prefix="/reportes",
    tags=["reportes"]
)

# NOTA: Organizaciones no está incluido en el router principal
