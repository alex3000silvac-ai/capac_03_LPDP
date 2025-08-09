"""
Endpoints placeholder para módulo de brechas
"""
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def list_brechas():
    return {"message": "Módulo de brechas - En desarrollo"}