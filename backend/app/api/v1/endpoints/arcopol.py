"""
Endpoints placeholder para módulo ARCOPOL
"""
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def list_solicitudes():
    return {"message": "Módulo ARCOPOL - En desarrollo"}