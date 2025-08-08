"""
Schemas para gestión de empresas y licencias
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, EmailStr, validator


class EmpresaBase(BaseModel):
    """Base para empresas"""
    nombre: str
    rut: str
    razon_social: Optional[str] = None
    giro: Optional[str] = None
    contacto_nombre: Optional[str] = None
    contacto_email: EmailStr
    contacto_telefono: Optional[str] = None
    direccion: Optional[str] = None
    comuna: Optional[str] = None
    ciudad: Optional[str] = None
    region: Optional[str] = None
    
    @validator('rut')
    def validate_rut(cls, v):
        # Validación básica de formato RUT chileno
        v = v.replace(".", "").replace("-", "")
        if len(v) < 8 or len(v) > 9:
            raise ValueError('RUT inválido')
        return v


class EmpresaCreate(EmpresaBase):
    """Crear empresa"""
    max_usuarios: int = 5
    dpo_nombre: Optional[str] = None
    dpo_email: Optional[EmailStr] = None
    dpo_telefono: Optional[str] = None
    industria: Optional[str] = None
    empleados: Optional[int] = None
    sitio_web: Optional[str] = None


class EmpresaUpdate(BaseModel):
    """Actualizar empresa"""
    nombre: Optional[str] = None
    razon_social: Optional[str] = None
    giro: Optional[str] = None
    contacto_nombre: Optional[str] = None
    contacto_email: Optional[EmailStr] = None
    contacto_telefono: Optional[str] = None
    direccion: Optional[str] = None
    comuna: Optional[str] = None
    ciudad: Optional[str] = None
    region: Optional[str] = None
    max_usuarios: Optional[int] = None
    dpo_nombre: Optional[str] = None
    dpo_email: Optional[EmailStr] = None
    dpo_telefono: Optional[str] = None
    industria: Optional[str] = None
    empleados: Optional[int] = None
    sitio_web: Optional[str] = None
    is_active: Optional[bool] = None


class EmpresaInfo(EmpresaBase):
    """Información de empresa"""
    id: str
    is_active: bool
    fecha_alta: Optional[datetime] = None
    fecha_baja: Optional[datetime] = None
    max_usuarios: int
    usuarios_activos: int
    dpo_nombre: Optional[str] = None
    dpo_email: Optional[str] = None
    industria: Optional[str] = None
    empleados: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class ModuloAccesoInfo(BaseModel):
    """Información de acceso a módulo"""
    id: str
    empresa_id: str
    codigo_modulo: str
    nombre_modulo: str
    is_active: bool
    fecha_activacion: Optional[datetime] = None
    fecha_expiracion: Optional[datetime] = None
    usuarios_permitidos: Optional[int] = None
    usuarios_actuales: int
    registros_permitidos: Optional[int] = None
    registros_actuales: int
    storage_mb_permitido: Optional[int] = None
    storage_mb_actual: int
    licencia_id: Optional[str] = None
    
    class Config:
        from_attributes = True


class LicenciaBase(BaseModel):
    """Base para licencias"""
    tipo_licencia: str
    modulos: List[str]
    
    @validator('modulos')
    def validate_modulos(cls, v):
        valid_modules = ["MOD-1", "MOD-2", "MOD-3", "MOD-4", "MOD-5", "MOD-6", "MOD-7"]
        for mod in v:
            if mod not in valid_modules:
                raise ValueError(f'Módulo inválido: {mod}')
        return v


class LicenciaCreate(LicenciaBase):
    """Crear licencia"""
    empresa_id: str
    duracion_meses: int
    precio: Optional[Decimal] = None
    descuento: Optional[Decimal] = None
    numero_orden_compra: Optional[str] = None
    vendedor: Optional[str] = None
    canal_venta: Optional[str] = None
    notas: Optional[str] = None


class LicenciaInfo(LicenciaBase):
    """Información de licencia"""
    id: str
    empresa_id: str
    codigo_licencia: str  # Será desenmascarado parcialmente
    fecha_emision: datetime
    fecha_activacion: Optional[datetime] = None
    fecha_expiracion: datetime
    is_active: bool
    is_revoked: bool
    fecha_revocacion: Optional[datetime] = None
    motivo_revocacion: Optional[str] = None
    precio: Optional[Decimal] = None
    descuento: Optional[Decimal] = None
    precio_final: Optional[Decimal] = None
    numero_factura: Optional[str] = None
    fecha_pago: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class LicenciaActivate(BaseModel):
    """Activar licencia"""
    codigo_licencia: str


class LicenciaExtend(BaseModel):
    """Extender licencia"""
    meses_adicionales: int
    
    @validator('meses_adicionales')
    def validate_meses(cls, v):
        if v < 1 or v > 36:
            raise ValueError('Los meses adicionales deben estar entre 1 y 36')
        return v


class EmpresaDetalle(EmpresaInfo):
    """Detalle completo de empresa"""
    modulos_acceso: List[ModuloAccesoInfo]
    licencias: List[LicenciaInfo]