"""
Endpoints placeholder para módulo de inventario
"""
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def list_actividades_tratamiento():
    return {"message": "Módulo de inventario - En desarrollo"}