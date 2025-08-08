"""
Schemas para gestión de usuarios
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, validator


class RoleBase(BaseModel):
    """Base para roles"""
    name: str
    code: str
    description: Optional[str] = None


class RoleCreate(RoleBase):
    """Crear rol"""
    permissions: List[str] = []


class RoleUpdate(BaseModel):
    """Actualizar rol"""
    name: Optional[str] = None
    description: Optional[str] = None
    permissions: Optional[List[str]] = None
    is_active: Optional[bool] = None


class RoleInfo(RoleBase):
    """Información del rol"""
    id: str
    permissions: List[str]
    is_system: bool
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserBase(BaseModel):
    """Base para usuarios"""
    username: str
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    rut: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    language: str = "es"
    timezone: str = "America/Santiago"


class UserCreate(UserBase):
    """Crear usuario"""
    password: str
    is_active: bool = True
    is_dpo: bool = False
    role_codes: List[str] = []
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


class UserUpdate(BaseModel):
    """Actualizar usuario"""
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    rut: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    is_dpo: Optional[bool] = None
    department: Optional[str] = None
    position: Optional[str] = None
    language: Optional[str] = None
    timezone: Optional[str] = None
    role_codes: Optional[List[str]] = None
    notification_preferences: Optional[Dict[str, Any]] = None
    ui_preferences: Optional[Dict[str, Any]] = None
    
    @validator('password')
    def validate_password(cls, v):
        if v and len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


class UserList(BaseModel):
    """Usuario en listado"""
    id: str
    username: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: bool
    is_superuser: bool
    is_dpo: bool
    roles: List[Dict[str, str]]
    last_login: Optional[datetime] = None
    created_at: datetime


class UserInfo(UserBase):
    """Información completa del usuario"""
    id: str
    is_active: bool
    is_superuser: bool
    is_dpo: bool
    email_verified: bool
    mfa_enabled: bool
    roles: List[RoleInfo]
    last_login: Optional[datetime] = None
    failed_login_attempts: int
    locked_until: Optional[datetime] = None
    notification_preferences: Dict[str, Any]
    ui_preferences: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class PasswordChange(BaseModel):
    """Cambio de contraseña"""
    current_password: str
    new_password: str
    
    @validator('new_password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


class UserInvite(BaseModel):
    """Invitación de usuario"""
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role_codes: List[str] = []
    send_email: bool = True