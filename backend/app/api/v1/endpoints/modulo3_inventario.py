"""
MÓDULO 3: INVENTARIO Y MAPEO DE DATOS - LEY 21.719
Sistema Profesional para Construcción de RAT (Registro de Actividades de Tratamiento)
Herramienta de Trabajo para Abogados e Ingenieros
"""
from typing import Optional
from fastapi import APIRouter

router = APIRouter()

# MÓDULO 3 COMPLETO - VERSIÓN FUNCIONAL
MODULO3_CONTENT = {
    "introduccion": {
        "titulo": "Capítulo 3: Módulo de Inventario y Mapeo de Datos",
        "subtitulo": "Construcción del Registro de Actividades de Tratamiento (RAT) según Ley 21.719",
        "descripcion": "Este capítulo detalla el procedimiento para crear y mantener un inventario exhaustivo de todos los activos de datos personales que la organización trata.",
        "prerequisitos": [
            "Conocimiento sólido de la Ley 21.719 y sus reglamentos",
            "Experiencia en gestión de procesos de negocio",
            "Comprensión de arquitecturas de sistemas y flujos de datos",
            "Conocimientos básicos de evaluación de riesgos"
        ]
    },
    
    "seccion_1": {
        "titulo": "3.1 Procedimientos para el Personal - Creación y Mantenimiento del Inventario",
        "contenido": {
            "procedimiento_mapeo": {
                "titulo": "Procedimiento de Mapeo Inicial de Datos",
                "pasos_criticos": [
                    {
                        "paso": 1,
                        "titulo": "Conformación del Equipo de Trabajo",
                        "descripcion": "El DPO debe liderar un equipo multidisciplinario para el levantamiento inicial del inventario.",
                        "integrantes_requeridos": {
                            "DPO": {
                                "rol": "Líder del proyecto y coordinador técnico-legal",
                                "responsabilidades": [
                                    "Coordinar el equipo multidisciplinario y establecer metodologías",
                                    "Validar la documentación técnica y legal de cada actividad",
                                    "Asegurar cumplimiento estricto de la Ley 21.719 y sus reglamentos"
                                ]
                            }
                        }
                    }
                ]
            }
        }
    },
    
    "seccion_2": {
        "titulo": "3.2 Metodología de Levantamiento",
        "contenido": {
            "metodologia": {
                "fase_1": {
                    "nombre": "Preparación",
                    "actividades": [
                        "Cronograma de entrevistas por área",
                        "Preparación de formularios de levantamiento",
                        "Identificación de stakeholders clave"
                    ]
                }
            }
        }
    }
}

@router.get("/introduccion")
def get_introduccion_modulo3():
    """Obtener introducción del Módulo 3"""
    return {
        "success": True,
        "modulo": "modulo3_inventario",
        "seccion": "introduccion",
        "contenido": MODULO3_CONTENT["introduccion"],
        "navegacion": {
            "anterior": None,
            "siguiente": "seccion_1"
        }
    }

@router.get("/seccion/{seccion_id}")
def get_seccion_modulo3(seccion_id: str):
    """Obtener sección específica del Módulo 3"""
    if seccion_id not in MODULO3_CONTENT:
        return {"error": "Sección no encontrada"}
    
    return {
        "success": True,
        "modulo": "modulo3_inventario",
        "seccion": seccion_id,
        "contenido": MODULO3_CONTENT[seccion_id],
        "navegacion": {
            "anterior": _get_seccion_anterior(seccion_id),
            "siguiente": _get_seccion_siguiente(seccion_id)
        }
    }

def _get_seccion_anterior(seccion_id: str) -> Optional[str]:
    """Obtener sección anterior en el flujo de navegación"""
    flujo = ["introduccion", "seccion_1", "seccion_2"]
    try:
        indice = flujo.index(seccion_id)
        return flujo[indice - 1] if indice > 0 else None
    except ValueError:
        return None

def _get_seccion_siguiente(seccion_id: str) -> Optional[str]:
    """Obtener sección siguiente en el flujo de navegación"""
    flujo = ["introduccion", "seccion_1", "seccion_2"]
    try:
        indice = flujo.index(seccion_id)
        return flujo[indice + 1] if indice < len(flujo) - 1 else None
    except ValueError:
        return None