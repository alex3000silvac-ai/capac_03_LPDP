from fastapi import APIRouter

from app.api.v1.endpoints import (
    actividades,
    categorias,
    entrevistas,
    organizaciones,
    usuarios,
    capacitacion,
    reportes
)

api_router = APIRouter()

# Incluir todos los routers de endpoints
api_router.include_router(
    organizaciones.router,
    prefix="/organizaciones",
    tags=["organizaciones"]
)

api_router.include_router(
    usuarios.router,
    prefix="/usuarios",
    tags=["usuarios"]
)

api_router.include_router(
    actividades.router,
    prefix="/actividades",
    tags=["actividades"]
)

api_router.include_router(
    categorias.router,
    prefix="/categorias",
    tags=["categorias"]
)

api_router.include_router(
    entrevistas.router,
    prefix="/entrevistas",
    tags=["entrevistas"]
)

api_router.include_router(
    capacitacion.router,
    prefix="/capacitacion",
    tags=["capacitacion"]
)

api_router.include_router(
    reportes.router,
    prefix="/reportes",
    tags=["reportes"]
)