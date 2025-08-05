from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Organizacion
from app.schemas.organizacion import (
    OrganizacionCreate,
    OrganizacionUpdate,
    OrganizacionResponse
)

router = APIRouter()


@router.post("/", response_model=OrganizacionResponse)
def crear_organizacion(
    organizacion: OrganizacionCreate,
    db: Session = Depends(get_db),
):
    """Crear una nueva organización"""
    # Verificar que el RUT no exista
    if db.query(Organizacion).filter_by(rut=organizacion.rut).first():
        raise HTTPException(status_code=400, detail="El RUT ya está registrado")
    
    db_organizacion = Organizacion(**organizacion.model_dump())
    db.add(db_organizacion)
    db.commit()
    db.refresh(db_organizacion)
    
    return db_organizacion


@router.get("/", response_model=List[OrganizacionResponse])
def listar_organizaciones(
    skip: int = 0,
    limit: int = 100,
    activo: bool = True,
    db: Session = Depends(get_db),
):
    """Listar organizaciones"""
    organizaciones = db.query(Organizacion).filter(
        Organizacion.activo == activo
    ).offset(skip).limit(limit).all()
    
    return organizaciones


@router.get("/{organizacion_id}", response_model=OrganizacionResponse)
def obtener_organizacion(
    organizacion_id: UUID,
    db: Session = Depends(get_db),
):
    """Obtener una organización por ID"""
    organizacion = db.query(Organizacion).filter(
        Organizacion.id == organizacion_id
    ).first()
    
    if not organizacion:
        raise HTTPException(status_code=404, detail="Organización no encontrada")
    
    return organizacion


@router.patch("/{organizacion_id}", response_model=OrganizacionResponse)
def actualizar_organizacion(
    organizacion_id: UUID,
    organizacion_update: OrganizacionUpdate,
    db: Session = Depends(get_db),
):
    """Actualizar una organización"""
    organizacion = db.query(Organizacion).filter(
        Organizacion.id == organizacion_id
    ).first()
    
    if not organizacion:
        raise HTTPException(status_code=404, detail="Organización no encontrada")
    
    update_data = organizacion_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(organizacion, field, value)
    
    db.commit()
    db.refresh(organizacion)
    
    return organizacion