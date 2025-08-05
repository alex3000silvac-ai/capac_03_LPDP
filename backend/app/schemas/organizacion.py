from typing import Optional
from pydantic import Field, validator
import re

from app.schemas.base import BaseSchema, BaseResponseSchema


class OrganizacionBase(BaseSchema):
    nombre: str = Field(..., min_length=3, max_length=255)
    rut: str = Field(..., max_length=20)
    sector: Optional[str] = Field(None, max_length=100)
    tamano: Optional[str] = Field(None, pattern="^(pequeña|mediana|grande)$")
    
    @validator('rut')
    def validar_rut(cls, v):
        # Validación básica del formato RUT chileno
        if not v:
            raise ValueError('RUT es requerido')
        
        # Limpiar RUT
        rut_limpio = v.replace('.', '').replace('-', '').upper()
        
        # Verificar formato
        if not re.match(r'^\d{7,8}[0-9K]$', rut_limpio):
            raise ValueError('Formato de RUT inválido')
        
        return v


class OrganizacionCreate(OrganizacionBase):
    pass


class OrganizacionUpdate(BaseSchema):
    nombre: Optional[str] = Field(None, min_length=3, max_length=255)
    sector: Optional[str] = Field(None, max_length=100)
    tamano: Optional[str] = Field(None, pattern="^(pequeña|mediana|grande)$")
    activo: Optional[bool] = None


class OrganizacionResponse(OrganizacionBase, BaseResponseSchema):
    activo: bool = True


class OrganizacionInDB(OrganizacionResponse):
    pass