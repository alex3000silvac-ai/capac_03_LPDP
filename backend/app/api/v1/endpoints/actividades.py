from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import ActividadTratamiento, ActividadDato, ActividadTitular, ActividadSistema, ActividadFlujo
from app.schemas.actividad import (
    ActividadTratamientoCreate,
    ActividadTratamientoUpdate,
    ActividadTratamientoResponse,
    ActividadTratamientoDetalle
)
from app.services.auditoria import registrar_auditoria

router = APIRouter()


@router.post("/", response_model=ActividadTratamientoResponse)
def crear_actividad(
    actividad: ActividadTratamientoCreate,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)  # TODO: Implementar autenticación
):
    """Crear una nueva actividad de tratamiento"""
    # Verificar que el código no exista
    if db.query(ActividadTratamiento).filter_by(codigo_actividad=actividad.codigo_actividad).first():
        raise HTTPException(status_code=400, detail="El código de actividad ya existe")
    
    # Crear la actividad principal
    db_actividad = ActividadTratamiento(
        **actividad.model_dump(exclude={"datos", "titulares", "sistemas", "flujos"}),
        organizacion_id=UUID("11111111-1111-1111-1111-111111111111"),  # TODO: Obtener de current_user
        creado_por=UUID("22222222-2222-2222-2222-222222222222"),  # TODO: Obtener de current_user
    )
    db.add(db_actividad)
    db.flush()
    
    # Crear relaciones con datos
    for dato in actividad.datos:
        db_dato = ActividadDato(
            actividad_id=db_actividad.id,
            **dato.model_dump()
        )
        db.add(db_dato)
    
    # Crear relaciones con titulares
    for titular in actividad.titulares:
        db_titular = ActividadTitular(
            actividad_id=db_actividad.id,
            **titular.model_dump()
        )
        db.add(db_titular)
    
    # Crear relaciones con sistemas
    for sistema in actividad.sistemas:
        db_sistema = ActividadSistema(
            actividad_id=db_actividad.id,
            **sistema.model_dump()
        )
        db.add(db_sistema)
    
    # Crear relaciones con flujos
    for flujo in actividad.flujos:
        db_flujo = ActividadFlujo(
            actividad_id=db_actividad.id,
            **flujo.model_dump()
        )
        db.add(db_flujo)
    
    db.commit()
    db.refresh(db_actividad)
    
    # Registrar en auditoría
    registrar_auditoria(
        db=db,
        usuario_id=UUID("22222222-2222-2222-2222-222222222222"),  # TODO: Obtener de current_user
        accion="crear",
        entidad="actividad_tratamiento",
        entidad_id=db_actividad.id,
        datos_nuevos=actividad.model_dump()
    )
    
    return db_actividad


@router.get("/", response_model=List[ActividadTratamientoResponse])
def listar_actividades(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    area_negocio: Optional[str] = None,
    estado: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Listar actividades de tratamiento con filtros opcionales"""
    query = db.query(ActividadTratamiento)
    
    if area_negocio:
        query = query.filter(ActividadTratamiento.area_negocio == area_negocio)
    
    if estado:
        query = query.filter(ActividadTratamiento.estado == estado)
    
    actividades = query.offset(skip).limit(limit).all()
    return actividades


@router.get("/{actividad_id}", response_model=ActividadTratamientoDetalle)
def obtener_actividad(
    actividad_id: UUID,
    db: Session = Depends(get_db),
):
    """Obtener detalle completo de una actividad de tratamiento"""
    actividad = db.query(ActividadTratamiento).filter(
        ActividadTratamiento.id == actividad_id
    ).first()
    
    if not actividad:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")
    
    # Construir respuesta con relaciones
    response = ActividadTratamientoDetalle.model_validate(actividad)
    
    # Agregar datos relacionados
    response.datos = [
        {
            "id": ad.id,
            "categoria_dato": {
                "id": ad.categoria_dato.id,
                "nombre": ad.categoria_dato.nombre,
                "clasificacion_sensibilidad": ad.categoria_dato.clasificacion_sensibilidad
            },
            "detalle_datos": ad.detalle_datos,
            "es_obligatorio": ad.es_obligatorio
        }
        for ad in actividad.datos
    ]
    
    response.titulares = [
        {
            "id": at.id,
            "categoria_titular": {
                "id": at.categoria_titular.id,
                "nombre": at.categoria_titular.nombre,
                "es_nna": at.categoria_titular.es_nna
            },
            "cantidad_aproximada": at.cantidad_aproximada
        }
        for at in actividad.titulares
    ]
    
    response.sistemas = [
        {
            "id": as_.id,
            "sistema": {
                "id": as_.sistema.id,
                "nombre": as_.sistema.nombre,
                "tipo": as_.sistema.tipo
            },
            "tipo_uso": as_.tipo_uso
        }
        for as_ in actividad.sistemas
    ]
    
    response.flujos = [
        {
            "id": af.id,
            "destinatario": {
                "id": af.destinatario.id,
                "nombre": af.destinatario.nombre,
                "tipo": af.destinatario.tipo,
                "es_transferencia_internacional": af.destinatario.es_transferencia_internacional
            },
            "proposito_transferencia": af.proposito_transferencia,
            "frecuencia": af.frecuencia,
            "medio_transferencia": af.medio_transferencia
        }
        for af in actividad.flujos
    ]
    
    return response


@router.patch("/{actividad_id}", response_model=ActividadTratamientoResponse)
def actualizar_actividad(
    actividad_id: UUID,
    actividad_update: ActividadTratamientoUpdate,
    db: Session = Depends(get_db),
):
    """Actualizar una actividad de tratamiento"""
    actividad = db.query(ActividadTratamiento).filter(
        ActividadTratamiento.id == actividad_id
    ).first()
    
    if not actividad:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")
    
    # Guardar datos anteriores para auditoría
    datos_anteriores = {
        "nombre_actividad": actividad.nombre_actividad,
        "estado": actividad.estado,
        # ... otros campos relevantes
    }
    
    # Actualizar campos
    update_data = actividad_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(actividad, field, value)
    
    actividad.actualizado_por = UUID("22222222-2222-2222-2222-222222222222")  # TODO: Obtener de current_user
    
    db.commit()
    db.refresh(actividad)
    
    # Registrar en auditoría
    registrar_auditoria(
        db=db,
        usuario_id=UUID("22222222-2222-2222-2222-222222222222"),  # TODO: Obtener de current_user
        accion="actualizar",
        entidad="actividad_tratamiento",
        entidad_id=actividad.id,
        datos_anteriores=datos_anteriores,
        datos_nuevos=update_data
    )
    
    return actividad


@router.delete("/{actividad_id}")
def eliminar_actividad(
    actividad_id: UUID,
    db: Session = Depends(get_db),
):
    """Eliminar una actividad de tratamiento"""
    actividad = db.query(ActividadTratamiento).filter(
        ActividadTratamiento.id == actividad_id
    ).first()
    
    if not actividad:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")
    
    # Registrar en auditoría antes de eliminar
    registrar_auditoria(
        db=db,
        usuario_id=UUID("22222222-2222-2222-2222-222222222222"),  # TODO: Obtener de current_user
        accion="eliminar",
        entidad="actividad_tratamiento",
        entidad_id=actividad.id,
        datos_anteriores={"codigo_actividad": actividad.codigo_actividad}
    )
    
    db.delete(actividad)
    db.commit()
    
    return {"message": "Actividad eliminada exitosamente"}