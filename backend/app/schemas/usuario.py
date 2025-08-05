from typing import Optional
from uuid import UUID
from pydantic import Field, EmailStr, validator

from app.schemas.base import BaseSchema, BaseResponseSchema


class UsuarioBase(BaseSchema):
    email: EmailStr
    nombre: str = Field(..., min_length=2, max_length=255)
    rol: str = Field(..., pattern="^(dpo|admin|usuario)$")
    area_negocio: Optional[str] = Field(None, max_length=100)
    activo: bool = True


class UsuarioCreate(UsuarioBase):
    password: str = Field(..., min_length=8)
    organizacion_id: UUID
    
    @validator('password')
    def validar_password(cls, v):
        if len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres')
        if not any(char.isdigit() for char in v):
            raise ValueError('La contraseña debe contener al menos un número')
        if not any(char.isupper() for char in v):
            raise ValueError('La contraseña debe contener al menos una mayúscula')
        return v


class UsuarioUpdate(BaseSchema):
    nombre: Optional[str] = Field(None, min_length=2, max_length=255)
    rol: Optional[str] = Field(None, pattern="^(dpo|admin|usuario)$")
    area_negocio: Optional[str] = Field(None, max_length=100)
    activo: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=8)


class UsuarioResponse(UsuarioBase, BaseResponseSchema):
    organizacion_id: UUID


class UsuarioInDB(UsuarioResponse):
    password_hash: str


# Schemas para autenticación
class Token(BaseSchema):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseSchema):
    email: Optional[str] = None
    user_id: Optional[str] = None
    organizacion_id: Optional[str] = None