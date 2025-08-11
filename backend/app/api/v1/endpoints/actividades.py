from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import ActividadTratamiento
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
    if db.query(ActividadTratamiento).filter_by(codigo=actividad.codigo).first():
        raise HTTPException(status_code=400, detail="El código de actividad ya existe")
    
    # Crear la actividad principal
    db_actividad = ActividadTratamiento(
        **actividad.model_dump(exclude={"datos", "titulares", "sistemas", "flujos"}),
        tenant_id=UUID("11111111-1111-1111-1111-111111111111"),  # TODO: Obtener de current_user
    )
    db.add(db_actividad)
    db.flush()
    
    # Crear relaciones con datos - DISABLED (ActividadDato model doesn't exist)
    # Crear relaciones con titulares - DISABLED (ActividadTitular model doesn't exist)  
    # Crear relaciones con sistemas - DISABLED (ActividadSistema model doesn't exist)
    # Crear relaciones con flujos - DISABLED (ActividadFlujo model doesn't exist)
    
    db.commit()
    db.refresh(db_actividad)
    
    # registrar_auditoria(...)
    
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
        query = query.filter(ActividadTratamiento.area_responsable == area_negocio)
    
    if estado:
        query = query.filter(ActividadTratamiento.is_active == (estado == "activo"))
    
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
    
    response = ActividadTratamientoDetalle.model_validate(actividad)
    
    response.datos = []  # ActividadDato model doesn't exist
    response.titulares = []  # ActividadTitular model doesn't exist
    response.sistemas = []  # ActividadSistema model doesn't exist  
    response.flujos = []  # ActividadFlujo model doesn't exist
    
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
        "nombre": actividad.nombre,
        "is_active": actividad.is_active,
    }
    
    # Actualizar campos
    update_data = actividad_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(actividad, field, value)
    
    
    db.commit()
    db.refresh(actividad)
    
    # registrar_auditoria(...)
    
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
    
    # registrar_auditoria(...)
    
    db.delete(actividad)
    db.commit()
    
    return {"message": "Actividad eliminada exitosamente"}
