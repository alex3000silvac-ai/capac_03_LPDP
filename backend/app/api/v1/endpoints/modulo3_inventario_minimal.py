"""
MÓDULO 3 - VERSIÓN MÍNIMA PARA DEBUGGING
"""
from fastapi import APIRouter

router = APIRouter()

@router.get("/test")
def test_modulo3_minimal():
    """Test básico"""
    return {"status": "ok", "message": "Módulo 3 mínimo funcionando"}

@router.get("/introduccion")
def get_introduccion_minimal():
    """Introducción mínima"""
    return {
        "success": True,
        "modulo": "modulo3_inventario",
        "titulo": "Módulo 3: Inventario y Mapeo de Datos",
        "descripcion": "Sistema profesional para construcción de RAT según Ley 21.719"
    }