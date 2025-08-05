from typing import Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models import (
    ActividadTratamiento,
    ActividadDato,
    CategoriaDato,
    ActividadFlujo,
    Destinatario
)

router = APIRouter()


@router.get("/resumen-general")
def obtener_resumen_general(
    organizacion_id: UUID = None,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Obtener resumen general del inventario de datos"""
    # Base query
    query_base = db.query(ActividadTratamiento)
    if organizacion_id:
        query_base = query_base.filter(ActividadTratamiento.organizacion_id == organizacion_id)
    
    # Total de actividades por estado
    actividades_por_estado = dict(
        query_base.with_entities(
            ActividadTratamiento.estado,
            func.count(ActividadTratamiento.id)
        ).group_by(ActividadTratamiento.estado).all()
    )
    
    # Total de actividades por área
    actividades_por_area = dict(
        query_base.with_entities(
            ActividadTratamiento.area_negocio,
            func.count(ActividadTratamiento.id)
        ).group_by(ActividadTratamiento.area_negocio).all()
    )
    
    # Datos sensibles
    datos_sensibles = db.query(func.count(ActividadDato.id)).join(
        CategoriaDato
    ).filter(
        CategoriaDato.clasificacion_sensibilidad == "sensible"
    ).scalar()
    
    # Transferencias internacionales
    transferencias_internacionales = db.query(
        func.count(func.distinct(ActividadFlujo.actividad_id))
    ).join(
        Destinatario
    ).filter(
        Destinatario.es_transferencia_internacional == True
    ).scalar()
    
    return {
        "resumen": {
            "total_actividades": sum(actividades_por_estado.values()),
            "actividades_por_estado": actividades_por_estado,
            "actividades_por_area": actividades_por_area,
            "actividades_con_datos_sensibles": datos_sensibles,
            "actividades_con_transferencias_internacionales": transferencias_internacionales
        }
    }


@router.get("/actividades-riesgo")
def obtener_actividades_riesgo(
    db: Session = Depends(get_db),
):
    """Identificar actividades de alto riesgo que requieren atención"""
    riesgos = []
    
    # 1. Actividades con datos sensibles sin medidas de seguridad documentadas
    actividades_sensibles_sin_seguridad = db.query(ActividadTratamiento).join(
        ActividadDato
    ).join(
        CategoriaDato
    ).filter(
        CategoriaDato.clasificacion_sensibilidad == "sensible",
        (ActividadTratamiento.medidas_seguridad_desc == None) | 
        (ActividadTratamiento.medidas_seguridad_desc == "")
    ).distinct().all()
    
    for actividad in actividades_sensibles_sin_seguridad:
        riesgos.append({
            "actividad_id": actividad.id,
            "codigo": actividad.codigo_actividad,
            "nombre": actividad.nombre_actividad,
            "tipo_riesgo": "datos_sensibles_sin_seguridad",
            "descripcion": "Actividad que trata datos sensibles sin medidas de seguridad documentadas",
            "nivel_riesgo": "alto"
        })
    
    # 2. Actividades con transferencias internacionales sin garantías
    actividades_internacional_sin_garantias = db.query(ActividadTratamiento).join(
        ActividadFlujo
    ).join(
        Destinatario
    ).filter(
        Destinatario.es_transferencia_internacional == True,
        (Destinatario.garantias_transferencia == None) |
        (Destinatario.garantias_transferencia == "")
    ).distinct().all()
    
    for actividad in actividades_internacional_sin_garantias:
        riesgos.append({
            "actividad_id": actividad.id,
            "codigo": actividad.codigo_actividad,
            "nombre": actividad.nombre_actividad,
            "tipo_riesgo": "transferencia_internacional_sin_garantias",
            "descripcion": "Transferencia internacional de datos sin garantías documentadas",
            "nivel_riesgo": "alto"
        })
    
    # 3. Actividades sin política de retención definida
    actividades_sin_retencion = db.query(ActividadTratamiento).filter(
        (ActividadTratamiento.plazo_conservacion_general == None) |
        (ActividadTratamiento.plazo_conservacion_general == "")
    ).all()
    
    for actividad in actividades_sin_retencion:
        riesgos.append({
            "actividad_id": actividad.id,
            "codigo": actividad.codigo_actividad,
            "nombre": actividad.nombre_actividad,
            "tipo_riesgo": "sin_politica_retencion",
            "descripcion": "Actividad sin política de retención de datos definida",
            "nivel_riesgo": "medio"
        })
    
    return {
        "total_riesgos": len(riesgos),
        "riesgos_por_nivel": {
            "alto": len([r for r in riesgos if r["nivel_riesgo"] == "alto"]),
            "medio": len([r for r in riesgos if r["nivel_riesgo"] == "medio"]),
            "bajo": len([r for r in riesgos if r["nivel_riesgo"] == "bajo"])
        },
        "riesgos": riesgos
    }


@router.get("/mapa-datos-sensibles")
def obtener_mapa_datos_sensibles(
    db: Session = Depends(get_db),
):
    """Obtener mapa de dónde se encuentran los datos sensibles"""
    # Query para obtener actividades con datos sensibles y sus sistemas
    resultado = db.query(
        ActividadTratamiento.codigo_actividad,
        ActividadTratamiento.nombre_actividad,
        ActividadTratamiento.area_negocio,
        CategoriaDato.nombre.label("categoria_dato"),
        func.array_agg(func.distinct(Destinatario.nombre)).label("destinatarios")
    ).join(
        ActividadDato
    ).join(
        CategoriaDato
    ).outerjoin(
        ActividadFlujo
    ).outerjoin(
        Destinatario
    ).filter(
        CategoriaDato.clasificacion_sensibilidad == "sensible"
    ).group_by(
        ActividadTratamiento.codigo_actividad,
        ActividadTratamiento.nombre_actividad,
        ActividadTratamiento.area_negocio,
        CategoriaDato.nombre
    ).all()
    
    mapa_sensibles = []
    for row in resultado:
        mapa_sensibles.append({
            "codigo_actividad": row.codigo_actividad,
            "nombre_actividad": row.nombre_actividad,
            "area_negocio": row.area_negocio,
            "categoria_dato_sensible": row.categoria_dato,
            "compartido_con": [d for d in row.destinatarios if d] if row.destinatarios else []
        })
    
    return {
        "total_actividades_con_datos_sensibles": len(set(r["codigo_actividad"] for r in mapa_sensibles)),
        "detalle": mapa_sensibles
    }


@router.get("/cumplimiento-principios")
def evaluar_cumplimiento_principios(
    db: Session = Depends(get_db),
):
    """Evaluar el nivel de cumplimiento con los principios de la LPDP"""
    total_actividades = db.query(func.count(ActividadTratamiento.id)).scalar()
    
    if total_actividades == 0:
        return {"mensaje": "No hay actividades registradas para evaluar"}
    
    # Principio de Licitud - Actividades con base legal definida
    con_base_legal = db.query(func.count(ActividadTratamiento.id)).filter(
        ActividadTratamiento.base_licitud != None,
        ActividadTratamiento.base_licitud != ""
    ).scalar()
    
    # Principio de Finalidad - Actividades con finalidad clara
    con_finalidad = db.query(func.count(ActividadTratamiento.id)).filter(
        ActividadTratamiento.finalidad_principal != None,
        ActividadTratamiento.finalidad_principal != ""
    ).scalar()
    
    # Principio de Proporcionalidad - Actividades con retención definida
    con_retencion = db.query(func.count(ActividadTratamiento.id)).filter(
        ActividadTratamiento.plazo_conservacion_general != None,
        ActividadTratamiento.plazo_conservacion_general != ""
    ).scalar()
    
    # Principio de Seguridad - Actividades con medidas documentadas
    con_seguridad = db.query(func.count(ActividadTratamiento.id)).filter(
        ActividadTratamiento.medidas_seguridad_desc != None,
        ActividadTratamiento.medidas_seguridad_desc != ""
    ).scalar()
    
    return {
        "cumplimiento_global": {
            "porcentaje": ((con_base_legal + con_finalidad + con_retencion + con_seguridad) / 
                          (total_actividades * 4) * 100),
            "total_actividades": total_actividades
        },
        "cumplimiento_por_principio": {
            "licitud": {
                "cumple": con_base_legal,
                "porcentaje": (con_base_legal / total_actividades * 100)
            },
            "finalidad": {
                "cumple": con_finalidad,
                "porcentaje": (con_finalidad / total_actividades * 100)
            },
            "proporcionalidad": {
                "cumple": con_retencion,
                "porcentaje": (con_retencion / total_actividades * 100)
            },
            "seguridad": {
                "cumple": con_seguridad,
                "porcentaje": (con_seguridad / total_actividades * 100)
            }
        }
    }