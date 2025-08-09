"""
Endpoints placeholder para módulo DPIA
"""
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def list_evaluaciones():
    return {"message": "Módulo DPIA - En desarrollo"}