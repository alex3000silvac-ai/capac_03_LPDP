"""
Router principal de la API v1
"""
from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    users,
    tenants,
    empresas,
    organizaciones,
    actividades,
    categorias,
    entrevistas,
    reportes,
    consentimientos,
    arcopol,
    inventario,
    brechas,
    dpia,
    transferencias,
    auditoria,
    capacitacion,
    admin_comercial
)

api_router = APIRouter()

# Rutas principales
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(tenants.router, prefix="/tenants", tags=["tenants"])
api_router.include_router(empresas.router, prefix="/empresas", tags=["empresas"])
api_router.include_router(organizaciones.router, prefix="/organizaciones", tags=["organizaciones"])

# Rutas de módulos funcionales
api_router.include_router(consentimientos.router, prefix="/consentimientos", tags=["consentimientos"])
api_router.include_router(arcopol.router, prefix="/arcopol", tags=["arcopol"])
api_router.include_router(inventario.router, prefix="/inventario", tags=["inventario"])
api_router.include_router(brechas.router, prefix="/brechas", tags=["brechas"])
api_router.include_router(dpia.router, prefix="/dpia", tags=["dpia"])
api_router.include_router(transferencias.router, prefix="/transferencias", tags=["transferencias"])
api_router.include_router(auditoria.router, prefix="/auditoria", tags=["auditoria"])
api_router.include_router(capacitacion.router, prefix="/capacitacion", tags=["capacitacion"])

# Rutas administrativas
api_router.include_router(admin_comercial.router, prefix="/admin-comercial", tags=["admin-comercial"])

# Rutas de soporte
api_router.include_router(actividades.router, prefix="/actividades", tags=["actividades"])
api_router.include_router(categorias.router, prefix="/categorias", tags=["categorias"])
api_router.include_router(entrevistas.router, prefix="/entrevistas", tags=["entrevistas"])
api_router.include_router(reportes.router, prefix="/reportes", tags=["reportes"])