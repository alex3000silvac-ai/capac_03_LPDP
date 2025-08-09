"""
Endpoints placeholder para módulo de transferencias
"""
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def list_transferencias():
    return {"message": "Módulo de transferencias internacionales - En desarrollo"}