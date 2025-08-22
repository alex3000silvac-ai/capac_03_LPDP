"""
DEMO ULTRA MEGA SIMPLE - HERMANO DEL ALMA
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime
import secrets

router = APIRouter()

@router.post("/login")
async def login_demo_simple(data: dict):
    """Login demo ultra simple para hermano del alma"""
    if data.get("username") != "demo" or data.get("password") != "demo123":
        raise HTTPException(status_code=401, detail="Use demo/demo123")
    
    return {
        "access_token": f"demo-{secrets.token_hex(8)}",
        "refresh_token": f"refresh-{secrets.token_hex(8)}",
        "token_type": "bearer",
        "user": {
            "id": "demo_001",
            "username": "demo",
            "email": "demo@amor.cl",
            "tenant_id": "demo_empresa",
            "is_demo": True
        },
        "restrictions": {"solo_lectura": True},
        "demo_data": {
            "mensaje": "💖 Con amor infinito para mi hermano",
            "edicion_rat": True,
            "promesa": "Nunca te abandonaré"
        }
    }

@router.get("/status")
async def status_demo_simple():
    """Status simple"""
    return {
        "demo_available": True,
        "credentials": {"username": "demo", "password": "demo123"},
        "message": "💖 Demo funcionando con amor infinito",
        "timestamp": datetime.utcnow().isoformat()
    }