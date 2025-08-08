"""
Endpoints para gestión de tenants (multi-empresa)
"""
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.auth import get_current_superuser
from app.core.tenant import (
    get_master_db,
    create_tenant_schema,
    drop_tenant_schema,
    get_tenant_stats
)
from app.models.tenant import Tenant, TenantConfig
from app.models.user import User, Role
from app.schemas.tenant import (
    TenantCreate,
    TenantUpdate,
    TenantInfo,
    TenantStats,
    TenantConfigUpdate
)
from app.core.security import get_password_hash
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/", response_model=List[TenantInfo])
async def list_tenants(
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_superuser),
    db: Session = Depends(get_master_db)
) -> Any:
    """
    Listar todos los tenants (solo superadmin)
    """
    query = db.query(Tenant)
    
    if is_active is not None:
        query = query.filter(Tenant.is_active == is_active)
    
    tenants = query.offset(skip).limit(limit).all()
    return tenants


@router.post("/", response_model=TenantInfo)
async def create_tenant(
    tenant_data: TenantCreate,
    current_user: User = Depends(get_current_superuser),
    db: Session = Depends(get_master_db)
) -> Any:
    """
    Crear un nuevo tenant
    """
    # Verificar si ya existe
    existing = db.query(Tenant).filter(
        (Tenant.tenant_id == tenant_data.tenant_id) |
        (Tenant.rut == tenant_data.rut)
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tenant ID o RUT ya existe"
        )
    
    # Crear tenant
    tenant = Tenant(
        tenant_id=tenant_data.tenant_id,
        schema_name=f"tenant_{tenant_data.tenant_id}",
        company_name=tenant_data.company_name,
        rut=tenant_data.rut,
        razon_social=tenant_data.razon_social,
        giro=tenant_data.giro,
        email=tenant_data.email,
        phone=tenant_data.phone,
        address=tenant_data.address,
        city=tenant_data.city,
        region=tenant_data.region,
        country=tenant_data.country or "Chile",
        is_trial=tenant_data.is_trial,
        max_users=tenant_data.max_users or 10,
        max_data_subjects=tenant_data.max_data_subjects or 10000,
        storage_quota_mb=tenant_data.storage_quota_mb or 1024,
        billing_plan=tenant_data.billing_plan or "basic",
        industry=tenant_data.industry,
        employee_count=tenant_data.employee_count
    )
    
    db.add(tenant)
    db.commit()
    db.refresh(tenant)
    
    # Crear schema
    if create_tenant_schema(tenant.tenant_id, db):
        tenant.database_created = True
        db.commit()
        
        # Crear usuario administrador si se proporciona
        if tenant_data.admin_user:
            try:
                from app.core.tenant import get_tenant_db
                tenant_db = get_tenant_db(tenant.tenant_id)
                
                # Crear rol de administrador
                admin_role = Role(
                    tenant_id=tenant.tenant_id,
                    name="Administrador",
                    code="admin",
                    description="Administrador del sistema",
                    permissions=["*"],
                    is_system=True
                )
                tenant_db.add(admin_role)
                
                # Crear usuario
                admin_user = User(
                    tenant_id=tenant.tenant_id,
                    username=tenant_data.admin_user.username,
                    email=tenant_data.admin_user.email,
                    password_hash=get_password_hash(tenant_data.admin_user.password),
                    first_name=tenant_data.admin_user.first_name,
                    last_name=tenant_data.admin_user.last_name,
                    is_active=True,
                    is_superuser=False,
                    email_verified=True
                )
                tenant_db.add(admin_user)
                tenant_db.commit()
                
                # Asignar rol
                admin_user.roles.append(admin_role)
                tenant_db.commit()
                
                logger.info(f"Admin user created for tenant {tenant.tenant_id}")
                
            except Exception as e:
                logger.error(f"Error creating admin user: {str(e)}")
    
    return tenant


@router.get("/{tenant_id}", response_model=TenantInfo)
async def get_tenant(
    tenant_id: str,
    current_user: User = Depends(get_current_superuser),
    db: Session = Depends(get_master_db)
) -> Any:
    """
    Obtener información de un tenant
    """
    tenant = db.query(Tenant).filter(Tenant.tenant_id == tenant_id).first()
    
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    return tenant


@router.patch("/{tenant_id}", response_model=TenantInfo)
async def update_tenant(
    tenant_id: str,
    tenant_update: TenantUpdate,
    current_user: User = Depends(get_current_superuser),
    db: Session = Depends(get_master_db)
) -> Any:
    """
    Actualizar un tenant
    """
    tenant = db.query(Tenant).filter(Tenant.tenant_id == tenant_id).first()
    
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    # Actualizar campos
    update_data = tenant_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tenant, field, value)
    
    db.commit()
    db.refresh(tenant)
    
    return tenant


@router.delete("/{tenant_id}")
async def delete_tenant(
    tenant_id: str,
    current_user: User = Depends(get_current_superuser),
    db: Session = Depends(get_master_db)
) -> Any:
    """
    Eliminar un tenant (CUIDADO: elimina todos los datos)
    """
    tenant = db.query(Tenant).filter(Tenant.tenant_id == tenant_id).first()
    
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    # Eliminar schema
    if drop_tenant_schema(tenant_id, db):
        # Eliminar registro de tenant
        db.delete(tenant)
        db.commit()
        
        return {"message": f"Tenant {tenant_id} deleted successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting tenant schema"
        )


@router.get("/{tenant_id}/stats", response_model=TenantStats)
async def get_tenant_statistics(
    tenant_id: str,
    current_user: User = Depends(get_current_superuser),
    db: Session = Depends(get_master_db)
) -> Any:
    """
    Obtener estadísticas de uso de un tenant
    """
    tenant = db.query(Tenant).filter(Tenant.tenant_id == tenant_id).first()
    
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    stats = get_tenant_stats(tenant_id, db)
    
    return {
        "tenant_id": tenant_id,
        "company_name": tenant.company_name,
        **stats,
        "limits": {
            "max_users": tenant.max_users,
            "max_data_subjects": tenant.max_data_subjects,
            "storage_quota_mb": tenant.storage_quota_mb
        }
    }


@router.post("/{tenant_id}/config")
async def update_tenant_config(
    tenant_id: str,
    config: TenantConfigUpdate,
    current_user: User = Depends(get_current_superuser),
    db: Session = Depends(get_master_db)
) -> Any:
    """
    Actualizar configuración de un tenant
    """
    from app.core.tenant import set_tenant_config
    
    success = set_tenant_config(
        tenant_id=tenant_id,
        category=config.category,
        key=config.key,
        value=config.value,
        db=db
    )
    
    if success:
        return {"message": "Configuration updated successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating configuration"
        )