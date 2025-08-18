from typing import List, Dict
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_master_db
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter()

# Módulos de capacitación disponibles
MODULOS_CAPACITACION = {
    "introduccion_lpdp": {
        "nombre": "Introducción a la Ley de Protección de Datos",
        "descripcion": "Conceptos fundamentales y principios de la LPDP",
        "duracion_estimada": 30,  # minutos
        "orden": 1
    },
    "conceptos_basicos": {
        "nombre": "Conceptos Básicos de Protección de Datos",
        "descripcion": "¿Qué es un dato personal? ¿Qué es el tratamiento?",
        "duracion_estimada": 45,
        "orden": 2
    },
    "proceso_levantamiento": {
        "nombre": "Proceso de Levantamiento de Información",
        "descripcion": "Cómo realizar entrevistas y documentar actividades",
        "duracion_estimada": 60,
        "orden": 3
    },
    "uso_sistema": {
        "nombre": "Uso del Sistema SCLDP",
        "descripcion": "Navegación y funcionalidades del sistema",
        "duracion_estimada": 45,
        "orden": 4
    },
    "casos_practicos": {
        "nombre": "Casos Prácticos y Simulación",
        "descripcion": "Ejercicios prácticos de levantamiento de datos",
        "duracion_estimada": 90,
        "orden": 5
    }
}


@router.get("/modulos")
def listar_modulos_capacitacion():
    """Obtener lista de módulos de capacitación disponibles"""
    return {
        "modulos": [
            {
                "id": key,
                **value
            }
            for key, value in MODULOS_CAPACITACION.items()
        ]
    }


@router.get("/progreso")
def obtener_progreso_usuario(
    current_user: User = Depends(get_current_user),
):
    """Obtener el progreso de capacitación del usuario actual"""
    # Por ahora devolver progreso simulado para el usuario actual
    respuesta = {
        "usuario_id": str(current_user.id),
        "usuario_nombre": f"{current_user.first_name} {current_user.last_name}".strip() or current_user.username,
        "modulos": []
    }
    
    # Simular progreso de módulos
    for modulo_id, modulo_info in MODULOS_CAPACITACION.items():
        modulo_data = {
            "id": modulo_id,
            "nombre": modulo_info["nombre"],
            "descripcion": modulo_info["descripcion"],
            "duracion_estimada": modulo_info["duracion_estimada"],
            "estado": "no_iniciado",
            "porcentaje_completado": 0,
            "fecha_inicio": None,
            "fecha_completado": None
        }
        respuesta["modulos"].append(modulo_data)
    
    # Ordenar módulos
    respuesta["modulos"].sort(key=lambda x: MODULOS_CAPACITACION[x["id"]]["orden"])
    
    # Calcular progreso general
    respuesta["progreso_general"] = {
        "porcentaje_total": 0,
        "modulos_completados": 0,
        "modulos_totales": len(MODULOS_CAPACITACION)
    }
    
    return respuesta


@router.post("/progreso/{modulo_id}/iniciar")
def iniciar_modulo(
    modulo_id: str,
    current_user: User = Depends(get_current_user),
):
    """Iniciar un módulo de capacitación"""
    if modulo_id not in MODULOS_CAPACITACION:
        raise HTTPException(status_code=404, detail="Módulo no encontrado")
    
    # Simular inicio de módulo
    return {
        "mensaje": "Módulo iniciado exitosamente",
        "modulo": modulo_id,
        "estado": "en_progreso",
        "usuario": current_user.username
    }


@router.post("/progreso/{modulo_id}/actualizar")
def actualizar_progreso_modulo(
    modulo_id: str,
    porcentaje: int,
    current_user: User = Depends(get_current_user),
):
    """Actualizar el progreso de un módulo"""
    if modulo_id not in MODULOS_CAPACITACION:
        raise HTTPException(status_code=404, detail="Módulo no encontrado")
    
    if not 0 <= porcentaje <= 100:
        raise HTTPException(status_code=400, detail="El porcentaje debe estar entre 0 y 100")
    
    estado = "completado" if porcentaje == 100 else "en_progreso"
    
    return {
        "mensaje": "Progreso actualizado",
        "modulo": modulo_id,
        "porcentaje": porcentaje,
        "estado": estado,
        "usuario": current_user.username
    }


@router.get("/estadisticas")
def obtener_estadisticas_capacitacion(
    current_user: User = Depends(get_current_user),
):
    """Obtener estadísticas generales de capacitación"""
    
    # Estadísticas simuladas
    estadisticas_modulos = {}
    
    for modulo_id, modulo_info in MODULOS_CAPACITACION.items():
        estadisticas_modulos[modulo_id] = {
            "nombre": modulo_info["nombre"],
            "iniciados": 0,
            "completados": 0,
            "tasa_completacion": 0
        }
    
    return {
        "usuarios_totales": 3,  # Simulado: admin, demo, dpo
        "usuarios_activos": 0,
        "tasa_participacion": 0,
        "estadisticas_por_modulo": estadisticas_modulos
    }