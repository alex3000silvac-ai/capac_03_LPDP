from typing import List
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import SesionEntrevista, RespuestaEntrevista, Usuario
from app.schemas.entrevista import (
    SesionEntrevistaCreate,
    SesionEntrevistaUpdate,
    SesionEntrevistaResponse,
    RespuestaEntrevistaCreate,
    RespuestaEntrevistaResponse,
    GuiaEntrevista,
    PreguntaGuia
)

router = APIRouter()

# Guías de entrevista predefinidas por área
GUIAS_ENTREVISTA = {
    "RRHH": [
        {
            "clave": "identificar_actividad",
            "fase": "1",
            "pregunta": "Describe una de las principales funciones de tu área. Por ejemplo, ¿cómo se gestiona una postulación a un trabajo?",
            "objetivo": "Nombre de la Actividad",
            "ejemplos": ["Reclutamiento y Selección", "Gestión de Nómina", "Evaluación de Desempeño"],
            "tipo_respuesta": "texto"
        },
        {
            "clave": "entender_proposito",
            "fase": "2",
            "pregunta": "¿Por qué realizan esta actividad? ¿Qué objetivo de negocio cumple? ¿Están obligados por alguna ley?",
            "objetivo": "Finalidad y Base de Licitud",
            "ejemplos": ["Evaluar idoneidad de candidatos", "Cumplir obligaciones laborales"],
            "tipo_respuesta": "texto"
        },
        {
            "clave": "listar_datos",
            "fase": "3",
            "pregunta": "Para este proceso, ¿qué información específica necesitan de la persona? (nombre, RUT, teléfono, historial, etc.)",
            "objetivo": "Categorías de Datos",
            "ejemplos": ["Datos personales", "Historial laboral", "Datos de salud"],
            "tipo_respuesta": "multiple"
        },
        {
            "clave": "identificar_personas",
            "fase": "4",
            "pregunta": "¿De quién es esta información? ¿Son empleados, postulantes, ex-trabajadores?",
            "objetivo": "Categorías de Titulares",
            "ejemplos": ["Empleados activos", "Postulantes", "Ex-empleados"],
            "tipo_respuesta": "seleccion"
        },
        {
            "clave": "mapear_flujo",
            "fase": "5",
            "pregunta": "¿Dónde guardan esta información? ¿Quién tiene acceso? ¿La comparten con alguien externo?",
            "objetivo": "Sistemas, Destinatarios y Flujos",
            "ejemplos": ["Excel en carpeta compartida", "Sistema de RRHH", "Previred"],
            "tipo_respuesta": "texto"
        },
        {
            "clave": "definir_ciclo_vida",
            "fase": "6",
            "pregunta": "¿Por cuánto tiempo guardan esta información? ¿Qué hacen cuando ya no la necesitan?",
            "objetivo": "Plazos de Conservación",
            "ejemplos": ["6 meses para CVs no seleccionados", "5 años para contratos"],
            "tipo_respuesta": "texto"
        },
        {
            "clave": "evaluar_seguridad",
            "fase": "7",
            "pregunta": "¿Cómo protegen esta información? ¿Hay contraseñas, acceso restringido, respaldos?",
            "objetivo": "Medidas de Seguridad",
            "ejemplos": ["Carpeta con acceso restringido", "Sistema con autenticación", "Respaldos cifrados"],
            "tipo_respuesta": "texto"
        }
    ],
    "FINANZAS": [
        # Similar estructura para el área de Finanzas
    ],
    "MARKETING": [
        # Similar estructura para el área de Marketing
    ]
}


@router.post("/sesiones", response_model=SesionEntrevistaResponse)
def crear_sesion_entrevista(
    sesion: SesionEntrevistaCreate,
    db: Session = Depends(get_db),
):
    """Crear una nueva sesión de entrevista"""
    # Verificar que el entrevistado existe
    entrevistado = db.query(Usuario).filter(Usuario.id == sesion.entrevistado_id).first()
    if not entrevistado:
        raise HTTPException(status_code=404, detail="Usuario entrevistado no encontrado")
    
    db_sesion = SesionEntrevista(
        **sesion.model_dump(),
        organizacion_id=UUID("11111111-1111-1111-1111-111111111111"),  # TODO: Obtener de current_user
        entrevistador_id=UUID("22222222-2222-2222-2222-222222222222"),  # TODO: Obtener de current_user
        estado="programada"
    )
    
    db.add(db_sesion)
    db.commit()
    db.refresh(db_sesion)
    
    # Agregar nombres para la respuesta
    response = SesionEntrevistaResponse.model_validate(db_sesion)
    response.entrevistador_nombre = "Usuario Demo"  # TODO: Obtener del usuario actual
    response.entrevistado_nombre = entrevistado.nombre
    
    return response


@router.get("/sesiones", response_model=List[SesionEntrevistaResponse])
def listar_sesiones(
    area_negocio: str = None,
    estado: str = None,
    db: Session = Depends(get_db),
):
    """Listar sesiones de entrevista con filtros opcionales"""
    query = db.query(SesionEntrevista)
    
    if area_negocio:
        query = query.filter(SesionEntrevista.area_negocio == area_negocio)
    
    if estado:
        query = query.filter(SesionEntrevista.estado == estado)
    
    sesiones = query.all()
    
    # Enriquecer respuestas con nombres
    responses = []
    for sesion in sesiones:
        response = SesionEntrevistaResponse.model_validate(sesion)
        response.entrevistador_nombre = sesion.entrevistador.nombre if sesion.entrevistador else None
        response.entrevistado_nombre = sesion.entrevistado.nombre if sesion.entrevistado else None
        responses.append(response)
    
    return responses


@router.get("/guias/{area_negocio}", response_model=GuiaEntrevista)
def obtener_guia_entrevista(area_negocio: str):
    """Obtener la guía de entrevista para un área de negocio específica"""
    area_upper = area_negocio.upper()
    
    if area_upper not in GUIAS_ENTREVISTA:
        # Devolver guía genérica si no existe una específica
        area_upper = "RRHH"  # Usar RRHH como plantilla genérica
    
    preguntas = [
        PreguntaGuia(**pregunta) for pregunta in GUIAS_ENTREVISTA[area_upper]
    ]
    
    return GuiaEntrevista(
        area_negocio=area_negocio,
        preguntas=preguntas
    )


@router.patch("/sesiones/{sesion_id}", response_model=SesionEntrevistaResponse)
def actualizar_sesion(
    sesion_id: UUID,
    sesion_update: SesionEntrevistaUpdate,
    db: Session = Depends(get_db),
):
    """Actualizar el estado de una sesión de entrevista"""
    sesion = db.query(SesionEntrevista).filter(
        SesionEntrevista.id == sesion_id
    ).first()
    
    if not sesion:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    
    # Si se está completando la sesión, calcular duración
    if sesion_update.estado == "completada" and sesion.estado != "completada":
        if sesion.fecha_creacion:
            duracion = (datetime.now() - sesion.fecha_creacion).seconds // 60
            sesion_update.duracion_minutos = duracion
    
    # Actualizar campos
    update_data = sesion_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(sesion, field, value)
    
    db.commit()
    db.refresh(sesion)
    
    # Preparar respuesta
    response = SesionEntrevistaResponse.model_validate(sesion)
    response.entrevistador_nombre = sesion.entrevistador.nombre if sesion.entrevistador else None
    response.entrevistado_nombre = sesion.entrevistado.nombre if sesion.entrevistado else None
    
    return response


@router.post("/sesiones/{sesion_id}/respuestas", response_model=RespuestaEntrevistaResponse)
def agregar_respuesta(
    sesion_id: UUID,
    respuesta: RespuestaEntrevistaCreate,
    db: Session = Depends(get_db),
):
    """Agregar una respuesta a una sesión de entrevista"""
    # Verificar que la sesión existe
    sesion = db.query(SesionEntrevista).filter(
        SesionEntrevista.id == sesion_id
    ).first()
    
    if not sesion:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    
    # Actualizar estado de la sesión si está programada
    if sesion.estado == "programada":
        sesion.estado = "en_progreso"
    
    db_respuesta = RespuestaEntrevista(
        sesion_id=sesion_id,
        **respuesta.model_dump()
    )
    
    db.add(db_respuesta)
    db.commit()
    db.refresh(db_respuesta)
    
    return db_respuesta


@router.get("/sesiones/{sesion_id}/respuestas", response_model=List[RespuestaEntrevistaResponse])
def listar_respuestas_sesion(
    sesion_id: UUID,
    db: Session = Depends(get_db),
):
    """Obtener todas las respuestas de una sesión de entrevista"""
    respuestas = db.query(RespuestaEntrevista).filter(
        RespuestaEntrevista.sesion_id == sesion_id
    ).order_by(RespuestaEntrevista.orden).all()
    
    return respuestas