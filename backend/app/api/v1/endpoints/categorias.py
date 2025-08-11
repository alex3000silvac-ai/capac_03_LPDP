from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import CategoriaDatos, DestinatarioDatos
from app.schemas.actividad import (
    CategoriaDatoCreate,
    CategoriaDatoResponse,
    CategoriaTitularCreate,
    CategoriaTitularResponse,
    SistemaActivoCreate,
    SistemaActivoResponse,
    DestinatarioCreate,
    DestinatarioResponse
)

router = APIRouter()


# Endpoints para Categorías de Datos
@router.post("/datos", response_model=CategoriaDatoResponse)
def crear_categoria_dato(
    categoria: CategoriaDatoCreate,
    db: Session = Depends(get_db),
):
    """Crear una nueva categoría de datos"""
    db_categoria = CategoriaDatos(
        **categoria.model_dump(),
        tenant_id=UUID("11111111-1111-1111-1111-111111111111")  # TODO: Obtener de current_user
    )
    db.add(db_categoria)
    db.commit()
    db.refresh(db_categoria)
    return db_categoria


@router.get("/datos", response_model=List[CategoriaDatoResponse])
def listar_categorias_datos(
    clasificacion: Optional[str] = None,
    activo: bool = True,
    db: Session = Depends(get_db),
):
    """Listar categorías de datos"""
    query = db.query(CategoriaDatos).filter(CategoriaDatos.is_active == activo)
    
    if clasificacion:
        query = query.filter(CategoriaDatos.es_sensible == True if clasificacion == "sensible" else CategoriaDatos.es_sensible == False)
    
    return query.all()


# Endpoints para Categorías de Titulares - DISABLED (models don't exist)

# Endpoints para Sistemas Activos - DISABLED (models don't exist)  


# Endpoints para Destinatarios
@router.post("/destinatarios", response_model=DestinatarioResponse)
def crear_destinatario(
    destinatario: DestinatarioCreate,
    db: Session = Depends(get_db),
):
    """Crear un nuevo destinatario"""
    db_destinatario = DestinatarioDatos(
        **destinatario.model_dump(),
        tenant_id=UUID("11111111-1111-1111-1111-111111111111")  # TODO: Obtener de current_user
    )
    db.add(db_destinatario)
    db.commit()
    db.refresh(db_destinatario)
    return db_destinatario


@router.get("/destinatarios", response_model=List[DestinatarioResponse])
def listar_destinatarios(
    tipo: Optional[str] = None,
    es_internacional: Optional[bool] = None,
    activo: bool = True,
    db: Session = Depends(get_db),
):
    """Listar destinatarios"""
    query = db.query(DestinatarioDatos).filter(DestinatarioDatos.is_active == activo)
    
    if tipo:
        query = query.filter(DestinatarioDatos.tipo_destinatario == tipo)
    
    if es_internacional is not None:
        query = query.filter(DestinatarioDatos.es_internacional == es_internacional)
    
    return query.all()
