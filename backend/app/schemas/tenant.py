"""
Schemas para gestión de tenants
"""
from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, EmailStr


class AdminUserCreate(BaseModel):
    """Datos para crear usuario administrador"""
    username: str
    email: EmailStr
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class TenantCreate(BaseModel):
    """Crear nuevo tenant"""
    tenant_id: str
    company_name: str
    rut: str
    razon_social: Optional[str] = None
    giro: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    country: str = "Chile"
    is_trial: bool = False
    trial_days: int = 30
    max_users: int = 10
    max_data_subjects: int = 10000
    storage_quota_mb: int = 1024
    billing_plan: str = "basic"
    industry: Optional[str] = None
    employee_count: Optional[str] = None
    admin_user: Optional[AdminUserCreate] = None


class TenantUpdate(BaseModel):
    """Actualizar tenant"""
    company_name: Optional[str] = None
    razon_social: Optional[str] = None
    giro: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    is_active: Optional[bool] = None
    max_users: Optional[int] = None
    max_data_subjects: Optional[int] = None
    storage_quota_mb: Optional[int] = None
    billing_plan: Optional[str] = None
    industry: Optional[str] = None
    employee_count: Optional[str] = None
    allowed_ip_ranges: Optional[List[str]] = None
    require_mfa: Optional[bool] = None


class TenantInfo(BaseModel):
    """Información del tenant"""
    id: str
    tenant_id: str
    schema_name: str
    company_name: str
    rut: str
    razon_social: Optional[str] = None
    giro: Optional[str] = None
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    country: str
    is_active: bool
    is_trial: bool
    trial_ends_at: Optional[datetime] = None
    max_users: int
    max_data_subjects: int
    storage_quota_mb: int
    billing_plan: str
    next_billing_date: Optional[datetime] = None
    database_created: bool
    onboarding_completed: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class TenantStats(BaseModel):
    """Estadísticas del tenant"""
    tenant_id: str
    company_name: str
    users: int
    data_subjects: int
    consents: int
    arcopol_requests: int
    storage_mb: float
    limits: Dict[str, int]


class TenantConfigUpdate(BaseModel):
    """Actualizar configuración del tenant"""
    category: str  # security, ui, features
    key: str
    value: Any