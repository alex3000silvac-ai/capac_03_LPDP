"""
Endpoints para gestión de empresas y licencias
"""
from typing import Any, List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from app.core.auth import (
    get_current_active_user,
    require_permission,
    ModuleAccessChecker
)
from app.core.tenant import get_tenant_db
from app.core.license import LicenseService
from app.models.empresa import Empresa, ModuloAcceso, Licencia
from app.models.user import User
from app.schemas.empresa import (
    EmpresaCreate,
    EmpresaUpdate,
    EmpresaInfo,
    EmpresaDetalle,
    ModuloAccesoInfo,
    LicenciaCreate,
    LicenciaInfo,
    LicenciaActivate,
    LicenciaExtend
)
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/", response_model=List[EmpresaInfo])
async def list_empresas(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_active_user),
    _: bool = Depends(require_permission(["empresas.read", "empresas.manage"]))
) -> Any:
    """
    Listar empresas del tenant
    """
    db = get_tenant_db(request.state.tenant_id)
    
    query = db.query(Empresa).filter(
        Empresa.tenant_id == request.state.tenant_id
    )
    
    # Filtros
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Empresa.nombre.ilike(search_term),
                Empresa.rut.ilike(search_term),
                Empresa.razon_social.ilike(search_term)
            )
        )
    
    if is_active is not None:
        query = query.filter(Empresa.is_active == is_active)
    
    empresas = query.offset(skip).limit(limit).all()
    
    return empresas


@router.post("/", response_model=EmpresaInfo)
async def create_empresa(
    request: Request,
    empresa_data: EmpresaCreate,
    current_user: User = Depends(get_current_active_user),
    _: bool = Depends(require_permission(["empresas.create", "empresas.manage"]))
) -> Any:
    """
    Crear nueva empresa
    """
    db = get_tenant_db(request.state.tenant_id)
    
    # Verificar si ya existe
    existing = db.query(Empresa).filter(
        Empresa.tenant_id == request.state.tenant_id,
        Empresa.rut == empresa_data.rut
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empresa con este RUT ya existe"
        )
    
    # Crear empresa
    empresa = Empresa(
        tenant_id=request.state.tenant_id,
        nombre=empresa_data.nombre,
        rut=empresa_data.rut,
        razon_social=empresa_data.razon_social,
        giro=empresa_data.giro,
        contacto_nombre=empresa_data.contacto_nombre,
        contacto_email=empresa_data.contacto_email,
        contacto_telefono=empresa_data.contacto_telefono,
        direccion=empresa_data.direccion,
        comuna=empresa_data.comuna,
        ciudad=empresa_data.ciudad,
        region=empresa_data.region,
        max_usuarios=empresa_data.max_usuarios,
        dpo_nombre=empresa_data.dpo_nombre,
        dpo_email=empresa_data.dpo_email,
        dpo_telefono=empresa_data.dpo_telefono,
        industria=empresa_data.industria,
        empleados=empresa_data.empleados,
        sitio_web=empresa_data.sitio_web,
        fecha_alta=datetime.utcnow(),
        created_by=current_user.id
    )
    
    db.add(empresa)
    db.commit()
    db.refresh(empresa)
    
    logger.info(f"Empresa created: {empresa.id} - {empresa.nombre}")
    
    return empresa


@router.get("/{empresa_id}", response_model=EmpresaDetalle)
async def get_empresa(
    request: Request,
    empresa_id: str,
    current_user: User = Depends(get_current_active_user),
    _: bool = Depends(require_permission(["empresas.read", "empresas.manage"]))
) -> Any:
    """
    Obtener detalle de empresa con módulos y licencias
    """
    db = get_tenant_db(request.state.tenant_id)
    
    empresa = db.query(Empresa).filter(
        Empresa.id == empresa_id,
        Empresa.tenant_id == request.state.tenant_id
    ).first()
    
    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa not found"
        )
    
    # Cargar relaciones
    empresa.modulos_acceso
    empresa.licencias
    
    return empresa


@router.patch("/{empresa_id}", response_model=EmpresaInfo)
async def update_empresa(
    request: Request,
    empresa_id: str,
    empresa_update: EmpresaUpdate,
    current_user: User = Depends(get_current_active_user),
    _: bool = Depends(require_permission(["empresas.update", "empresas.manage"]))
) -> Any:
    """
    Actualizar empresa
    """
    db = get_tenant_db(request.state.tenant_id)
    
    empresa = db.query(Empresa).filter(
        Empresa.id == empresa_id,
        Empresa.tenant_id == request.state.tenant_id
    ).first()
    
    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa not found"
        )
    
    # Actualizar campos
    update_data = empresa_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(empresa, field, value)
    
    empresa.updated_by = current_user.id
    
    db.commit()
    db.refresh(empresa)
    
    return empresa


@router.delete("/{empresa_id}")
async def delete_empresa(
    request: Request,
    empresa_id: str,
    current_user: User = Depends(get_current_active_user),
    _: bool = Depends(require_permission(["empresas.delete", "empresas.manage"]))
) -> Any:
    """
    Desactivar empresa (soft delete)
    """
    db = get_tenant_db(request.state.tenant_id)
    
    empresa = db.query(Empresa).filter(
        Empresa.id == empresa_id,
        Empresa.tenant_id == request.state.tenant_id
    ).first()
    
    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa not found"
        )
    
    # Soft delete
    empresa.is_active = False
    empresa.fecha_baja = datetime.utcnow()
    empresa.is_deleted = True
    empresa.deleted_at = datetime.utcnow()
    empresa.deleted_by = current_user.id
    
    # Desactivar módulos
    db.query(ModuloAcceso).filter(
        ModuloAcceso.empresa_id == empresa_id
    ).update({"is_active": False})
    
    db.commit()
    
    return {"message": "Empresa desactivada exitosamente"}


# Endpoints de Módulos de Acceso

@router.get("/{empresa_id}/modulos", response_model=List[ModuloAccesoInfo])
async def list_modulos_empresa(
    request: Request,
    empresa_id: str,
    current_user: User = Depends(get_current_active_user),
    _: bool = Depends(require_permission(["empresas.read", "empresas.manage"]))
) -> Any:
    """
    Listar módulos de acceso de una empresa
    """
    db = get_tenant_db(request.state.tenant_id)
    
    modulos = db.query(ModuloAcceso).filter(
        ModuloAcceso.empresa_id == empresa_id,
        ModuloAcceso.tenant_id == request.state.tenant_id
    ).all()
    
    return modulos


# Endpoints de Licencias

@router.get("/licencias/", response_model=List[LicenciaInfo])
async def list_licencias(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    empresa_id: Optional[str] = None,
    is_active: Optional[bool] = None,
    expiring_days: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
    _: bool = Depends(require_permission(["licencias.read", "licencias.manage"]))
) -> Any:
    """
    Listar licencias
    """
    db = get_tenant_db(request.state.tenant_id)
    
    query = db.query(Licencia).filter(
        Licencia.tenant_id == request.state.tenant_id
    )
    
    # Filtros
    if empresa_id:
        query = query.filter(Licencia.empresa_id == empresa_id)
    
    if is_active is not None:
        query = query.filter(Licencia.is_active == is_active)
    
    if expiring_days:
        expiry_date = datetime.utcnow() + timedelta(days=expiring_days)
        query = query.filter(
            and_(
                Licencia.fecha_expiracion <= expiry_date,
                Licencia.fecha_expiracion > datetime.utcnow()
            )
        )
    
    licencias = query.offset(skip).limit(limit).all()
    
    return licencias


@router.post("/licencias/", response_model=LicenciaInfo)
async def create_licencia(
    request: Request,
    licencia_data: LicenciaCreate,
    current_user: User = Depends(get_current_active_user),
    _: bool = Depends(require_permission(["licencias.create", "licencias.manage"]))
) -> Any:
    """
    Crear nueva licencia
    """
    db = get_tenant_db(request.state.tenant_id)
    
    # Verificar empresa
    empresa = db.query(Empresa).filter(
        Empresa.id == licencia_data.empresa_id,
        Empresa.tenant_id == request.state.tenant_id
    ).first()
    
    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa not found"
        )
    
    # Crear licencia
    licencia = LicenseService.create_license(
        empresa_id=licencia_data.empresa_id,
        modules=licencia_data.modulos,
        duration_months=licencia_data.duracion_meses,
        db=db,
        precio_base=licencia_data.precio,
        descuento=licencia_data.descuento
    )
    
    if not licencia:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating license"
        )
    
    return licencia


@router.post("/licencias/activate", response_model=dict)
async def activate_licencia(
    request: Request,
    activation_data: LicenciaActivate,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Activar una licencia con su código
    """
    db = get_tenant_db(request.state.tenant_id)
    
    result = LicenseService.activate_license(
        license_code=activation_data.codigo_licencia,
        tenant_id=request.state.tenant_id,
        db=db
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["error"]
        )
    
    return result


@router.post("/licencias/{licencia_id}/extend", response_model=dict)
async def extend_licencia(
    request: Request,
    licencia_id: str,
    extend_data: LicenciaExtend,
    current_user: User = Depends(get_current_active_user),
    _: bool = Depends(require_permission(["licencias.manage"]))
) -> Any:
    """
    Extender duración de una licencia
    """
    db = get_tenant_db(request.state.tenant_id)
    
    success = LicenseService.extend_license(
        license_id=licencia_id,
        additional_months=extend_data.meses_adicionales,
        db=db
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error extending license"
        )
    
    return {"message": f"Licencia extendida por {extend_data.meses_adicionales} meses"}


@router.post("/licencias/{licencia_id}/revoke", response_model=dict)
async def revoke_licencia(
    request: Request,
    licencia_id: str,
    reason: str = Query(..., description="Razón de revocación"),
    current_user: User = Depends(get_current_active_user),
    _: bool = Depends(require_permission(["licencias.manage"]))
) -> Any:
    """
    Revocar una licencia
    """
    db = get_tenant_db(request.state.tenant_id)
    
    success = LicenseService.revoke_license(
        license_id=licencia_id,
        reason=reason,
        db=db
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error revoking license"
        )
    
    return {"message": "Licencia revocada exitosamente"}


@router.get("/licencias/status", response_model=dict)
async def check_license_status(
    request: Request,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Verificar estado de licencias del tenant
    """
    db = get_tenant_db(request.state.tenant_id)
    
    status = LicenseService.check_license_status(
        tenant_id=request.state.tenant_id,
        db=db
    )
    
    return status