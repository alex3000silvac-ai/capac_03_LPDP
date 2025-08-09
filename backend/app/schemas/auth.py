"""
Schemas de autenticación
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    """Token de acceso"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenRefresh(BaseModel):
    """Solicitud de refresh token"""
    refresh_token: str


class TokenData(BaseModel):
    """Datos del token decodificado"""
    sub: str
    tenant_id: Optional[str] = None
    exp: Optional[int] = None


class LoginRequest(BaseModel):
    """Solicitud de login"""
    username: str
    password: str
    tenant_id: Optional[str] = None


class RoleInfo(BaseModel):
    """Información de rol"""
    code: str
    name: str


class UserInfo(BaseModel):
    """Información del usuario autenticado"""
    id: str
    email: EmailStr
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: bool
    is_superuser: bool
    is_dpo: bool
    roles: List[RoleInfo]
    tenant_id: str
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class PasswordChange(BaseModel):
    """Cambio de contraseña"""
    current_password: str
    new_password: str
    
    class Config:
        str_min_length = 8


class PasswordReset(BaseModel):
    """Reset de contraseña"""
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Confirmación de reset de contraseña"""
    token: str
    new_password: str
    
    class Config:
        str_min_length = 8