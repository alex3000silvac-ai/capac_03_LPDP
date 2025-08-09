"""
Endpoints placeholder para módulo de auditoría
"""
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def list_logs():
    return {"message": "Módulo de auditoría - En desarrollo"}