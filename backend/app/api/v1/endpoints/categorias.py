from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import CategoriaDato, CategoriaTitular, SistemaActivo, Destinatario
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
    db_categoria = CategoriaDato(
        **categoria.model_dump(),
        organizacion_id=UUID("11111111-1111-1111-1111-111111111111")  # TODO: Obtener de current_user
    )
    db.add(db_categoria)
    db.commit()
    db.refresh(db_categoria)
    return db_categoria


@router.get("/datos", response_model=List[CategoriaDatoResponse])
def listar_categorias_datos(
    clasificacion: str = None,
    activo: bool = True,
    db: Session = Depends(get_db),
):
    """Listar categorías de datos"""
    query = db.query(CategoriaDato).filter(CategoriaDato.activo == activo)
    
    if clasificacion:
        query = query.filter(CategoriaDato.clasificacion_sensibilidad == clasificacion)
    
    return query.all()


# Endpoints para Categorías de Titulares
@router.post("/titulares", response_model=CategoriaTitularResponse)
def crear_categoria_titular(
    categoria: CategoriaTitularCreate,
    db: Session = Depends(get_db),
):
    """Crear una nueva categoría de titulares"""
    db_categoria = CategoriaTitular(
        **categoria.model_dump(),
        organizacion_id=UUID("11111111-1111-1111-1111-111111111111")  # TODO: Obtener de current_user
    )
    db.add(db_categoria)
    db.commit()
    db.refresh(db_categoria)
    return db_categoria


@router.get("/titulares", response_model=List[CategoriaTitularResponse])
def listar_categorias_titulares(
    es_nna: bool = None,
    activo: bool = True,
    db: Session = Depends(get_db),
):
    """Listar categorías de titulares"""
    query = db.query(CategoriaTitular).filter(CategoriaTitular.activo == activo)
    
    if es_nna is not None:
        query = query.filter(CategoriaTitular.es_nna == es_nna)
    
    return query.all()


# Endpoints para Sistemas Activos
@router.post("/sistemas", response_model=SistemaActivoResponse)
def crear_sistema_activo(
    sistema: SistemaActivoCreate,
    db: Session = Depends(get_db),
):
    """Crear un nuevo sistema o activo de datos"""
    db_sistema = SistemaActivo(
        **sistema.model_dump(),
        organizacion_id=UUID("11111111-1111-1111-1111-111111111111")  # TODO: Obtener de current_user
    )
    db.add(db_sistema)
    db.commit()
    db.refresh(db_sistema)
    return db_sistema


@router.get("/sistemas", response_model=List[SistemaActivoResponse])
def listar_sistemas_activos(
    tipo: str = None,
    activo: bool = True,
    db: Session = Depends(get_db),
):
    """Listar sistemas y activos de datos"""
    query = db.query(SistemaActivo).filter(SistemaActivo.activo == activo)
    
    if tipo:
        query = query.filter(SistemaActivo.tipo == tipo)
    
    return query.all()


# Endpoints para Destinatarios
@router.post("/destinatarios", response_model=DestinatarioResponse)
def crear_destinatario(
    destinatario: DestinatarioCreate,
    db: Session = Depends(get_db),
):
    """Crear un nuevo destinatario"""
    db_destinatario = Destinatario(
        **destinatario.model_dump(),
        organizacion_id=UUID("11111111-1111-1111-1111-111111111111")  # TODO: Obtener de current_user
    )
    db.add(db_destinatario)
    db.commit()
    db.refresh(db_destinatario)
    return db_destinatario


@router.get("/destinatarios", response_model=List[DestinatarioResponse])
def listar_destinatarios(
    tipo: str = None,
    es_internacional: bool = None,
    activo: bool = True,
    db: Session = Depends(get_db),
):
    """Listar destinatarios"""
    query = db.query(Destinatario).filter(Destinatario.activo == activo)
    
    if tipo:
        query = query.filter(Destinatario.tipo == tipo)
    
    if es_internacional is not None:
        query = query.filter(Destinatario.es_transferencia_internacional == es_internacional)
    
    return query.all()