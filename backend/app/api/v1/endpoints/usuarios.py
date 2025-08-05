from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.core.database import get_db
from app.models import Usuario
from app.schemas.usuario import (
    UsuarioCreate,
    UsuarioUpdate,
    UsuarioResponse
)

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    """Hashear contraseña"""
    return pwd_context.hash(password)


@router.post("/", response_model=UsuarioResponse)
def crear_usuario(
    usuario: UsuarioCreate,
    db: Session = Depends(get_db),
):
    """Crear un nuevo usuario"""
    # Verificar que el email no exista
    if db.query(Usuario).filter_by(email=usuario.email).first():
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    # Crear usuario con contraseña hasheada
    db_usuario = Usuario(
        **usuario.model_dump(exclude={"password"}),
        password_hash=get_password_hash(usuario.password)
    )
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    
    return db_usuario


@router.get("/", response_model=List[UsuarioResponse])
def listar_usuarios(
    organizacion_id: UUID = None,
    rol: str = None,
    area_negocio: str = None,
    activo: bool = True,
    db: Session = Depends(get_db),
):
    """Listar usuarios con filtros opcionales"""
    query = db.query(Usuario).filter(Usuario.activo == activo)
    
    if organizacion_id:
        query = query.filter(Usuario.organizacion_id == organizacion_id)
    
    if rol:
        query = query.filter(Usuario.rol == rol)
    
    if area_negocio:
        query = query.filter(Usuario.area_negocio == area_negocio)
    
    return query.all()


@router.get("/{usuario_id}", response_model=UsuarioResponse)
def obtener_usuario(
    usuario_id: UUID,
    db: Session = Depends(get_db),
):
    """Obtener un usuario por ID"""
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    return usuario


@router.patch("/{usuario_id}", response_model=UsuarioResponse)
def actualizar_usuario(
    usuario_id: UUID,
    usuario_update: UsuarioUpdate,
    db: Session = Depends(get_db),
):
    """Actualizar un usuario"""
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    update_data = usuario_update.model_dump(exclude_unset=True)
    
    # Si se actualiza la contraseña, hashearla
    if "password" in update_data and update_data["password"]:
        update_data["password_hash"] = get_password_hash(update_data["password"])
        del update_data["password"]
    
    for field, value in update_data.items():
        setattr(usuario, field, value)
    
    db.commit()
    db.refresh(usuario)
    
    return usuario


@router.get("/areas-negocio/lista")
def listar_areas_negocio(db: Session = Depends(get_db)):
    """Obtener lista de áreas de negocio disponibles"""
    # Áreas predefinidas comunes
    areas_predefinidas = [
        "RRHH",
        "Finanzas",
        "Marketing",
        "Ventas",
        "Operaciones",
        "TI",
        "Legal",
        "Producción",
        "Calidad",
        "Logística"
    ]
    
    # Obtener áreas adicionales de la base de datos
    areas_db = db.query(Usuario.area_negocio).distinct().filter(
        Usuario.area_negocio.isnot(None)
    ).all()
    
    areas_adicionales = [area[0] for area in areas_db if area[0] not in areas_predefinidas]
    
    return {
        "areas": areas_predefinidas + areas_adicionales
    }