from typing import List, Dict
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import ProgresoCapacitacion, Usuario

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


@router.get("/progreso/{usuario_id}")
def obtener_progreso_usuario(
    usuario_id: UUID,
    db: Session = Depends(get_db),
):
    """Obtener el progreso de capacitación de un usuario"""
    # Verificar que el usuario existe
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Obtener progreso existente
    progreso_actual = db.query(ProgresoCapacitacion).filter(
        ProgresoCapacitacion.usuario_id == usuario_id
    ).all()
    
    # Crear diccionario de progreso
    progreso_dict = {p.modulo: p for p in progreso_actual}
    
    # Construir respuesta completa con todos los módulos
    respuesta = {
        "usuario_id": usuario_id,
        "usuario_nombre": usuario.nombre,
        "modulos": []
    }
    
    progreso_total = 0
    modulos_completados = 0
    
    for modulo_id, modulo_info in MODULOS_CAPACITACION.items():
        if modulo_id in progreso_dict:
            progreso = progreso_dict[modulo_id]
            modulo_data = {
                "id": modulo_id,
                "nombre": modulo_info["nombre"],
                "descripcion": modulo_info["descripcion"],
                "duracion_estimada": modulo_info["duracion_estimada"],
                "estado": progreso.estado,
                "porcentaje_completado": progreso.porcentaje_completado,
                "fecha_inicio": progreso.fecha_inicio,
                "fecha_completado": progreso.fecha_completado
            }
            progreso_total += progreso.porcentaje_completado
            if progreso.estado == "completado":
                modulos_completados += 1
        else:
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
        "porcentaje_total": progreso_total // len(MODULOS_CAPACITACION),
        "modulos_completados": modulos_completados,
        "modulos_totales": len(MODULOS_CAPACITACION)
    }
    
    return respuesta


@router.post("/progreso/{usuario_id}/{modulo_id}/iniciar")
def iniciar_modulo(
    usuario_id: UUID,
    modulo_id: str,
    db: Session = Depends(get_db),
):
    """Iniciar un módulo de capacitación"""
    if modulo_id not in MODULOS_CAPACITACION:
        raise HTTPException(status_code=404, detail="Módulo no encontrado")
    
    # Verificar si ya existe progreso
    progreso = db.query(ProgresoCapacitacion).filter(
        ProgresoCapacitacion.usuario_id == usuario_id,
        ProgresoCapacitacion.modulo == modulo_id
    ).first()
    
    if progreso and progreso.estado != "no_iniciado":
        raise HTTPException(status_code=400, detail="El módulo ya fue iniciado")
    
    if not progreso:
        progreso = ProgresoCapacitacion(
            usuario_id=usuario_id,
            modulo=modulo_id,
            estado="en_progreso",
            porcentaje_completado=0,
            fecha_inicio=datetime.utcnow()
        )
        db.add(progreso)
    else:
        progreso.estado = "en_progreso"
        progreso.fecha_inicio = datetime.utcnow()
    
    db.commit()
    
    return {
        "mensaje": "Módulo iniciado exitosamente",
        "modulo": modulo_id,
        "estado": "en_progreso"
    }


@router.post("/progreso/{usuario_id}/{modulo_id}/actualizar")
def actualizar_progreso_modulo(
    usuario_id: UUID,
    modulo_id: str,
    porcentaje: int,
    db: Session = Depends(get_db),
):
    """Actualizar el progreso de un módulo"""
    if modulo_id not in MODULOS_CAPACITACION:
        raise HTTPException(status_code=404, detail="Módulo no encontrado")
    
    if not 0 <= porcentaje <= 100:
        raise HTTPException(status_code=400, detail="El porcentaje debe estar entre 0 y 100")
    
    progreso = db.query(ProgresoCapacitacion).filter(
        ProgresoCapacitacion.usuario_id == usuario_id,
        ProgresoCapacitacion.modulo == modulo_id
    ).first()
    
    if not progreso:
        raise HTTPException(status_code=404, detail="Progreso no encontrado. Inicie el módulo primero")
    
    progreso.porcentaje_completado = porcentaje
    
    # Si llega al 100%, marcar como completado
    if porcentaje == 100:
        progreso.estado = "completado"
        progreso.fecha_completado = datetime.utcnow()
    
    db.commit()
    
    return {
        "mensaje": "Progreso actualizado",
        "modulo": modulo_id,
        "porcentaje": porcentaje,
        "estado": progreso.estado
    }


@router.get("/estadisticas")
def obtener_estadisticas_capacitacion(
    db: Session = Depends(get_db),
):
    """Obtener estadísticas generales de capacitación"""
    # Total de usuarios
    total_usuarios = db.query(Usuario).count()
    
    # Usuarios que han iniciado algún módulo
    usuarios_activos = db.query(ProgresoCapacitacion.usuario_id).distinct().count()
    
    # Estadísticas por módulo
    estadisticas_modulos = {}
    
    for modulo_id in MODULOS_CAPACITACION:
        iniciados = db.query(ProgresoCapacitacion).filter(
            ProgresoCapacitacion.modulo == modulo_id,
            ProgresoCapacitacion.estado != "no_iniciado"
        ).count()
        
        completados = db.query(ProgresoCapacitacion).filter(
            ProgresoCapacitacion.modulo == modulo_id,
            ProgresoCapacitacion.estado == "completado"
        ).count()
        
        estadisticas_modulos[modulo_id] = {
            "nombre": MODULOS_CAPACITACION[modulo_id]["nombre"],
            "iniciados": iniciados,
            "completados": completados,
            "tasa_completacion": (completados / iniciados * 100) if iniciados > 0 else 0
        }
    
    return {
        "usuarios_totales": total_usuarios,
        "usuarios_activos": usuarios_activos,
        "tasa_participacion": (usuarios_activos / total_usuarios * 100) if total_usuarios > 0 else 0,
        "estadisticas_por_modulo": estadisticas_modulos
    }