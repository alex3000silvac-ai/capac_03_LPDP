"""
Endpoints placeholder para módulo de consentimientos
"""
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def list_consentimientos():
    return {"message": "Módulo de consentimientos - En desarrollo"}