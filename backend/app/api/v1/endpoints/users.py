"""
Endpoints para gestión de usuarios
"""
from typing import Any, List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.auth import (
    get_current_active_user,
    get_current_superuser,
    require_permission
)
from app.core.tenant import get_tenant_db
from app.core.security import (
    get_password_hash,
    verify_password,
    encrypt_field,
    decrypt_field
)
from app.models.user import User
from app.schemas.user import (
    UserCreate,
    UserUpdate,
    UserInfo,
    UserList
)
import logging
import secrets
import string

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/", response_model=List[UserList])
async def list_users(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    role_code: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    _: bool = Depends(require_permission(["users.read", "users.manage"]))
) -> Any:
    """
    Listar usuarios del tenant
    """
    db = get_tenant_db(request.state.tenant_id)
    
    query = db.query(User)
    
    # Filtros
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                User.username.ilike(search_term),
                User.email.ilike(search_term)
            )
        )
    
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    # if role_code:  # COMENTADO: Roles no disponibles
    #     query = query.join(User.roles).filter(Role.code == role_code)
    
    users = query.offset(skip).limit(limit).all()
    
    # Desencriptar datos para respuesta
    result = []
    for user in users:
        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,  # SIMPLIFICADO: Sin encriptación
            "last_name": user.last_name,    # SIMPLIFICADO: Sin encriptación
            "is_active": user.is_active,
            "is_superuser": user.is_superuser,
            "is_dpo": False,  # SIMPLIFICADO: Campo no disponible
            "roles": [],      # SIMPLIFICADO: Roles no disponibles
            "last_login": user.last_login,
            "created_at": user.created_at
        }
        result.append(user_data)
    
    return result


@router.post("/", response_model=UserInfo)
async def create_user(
    request: Request,
    user_data: UserCreate,
    current_user: User = Depends(get_current_active_user),
    _: bool = Depends(require_permission(["users.create", "users.manage"]))
) -> Any:
    """
    Crear nuevo usuario
    """
    db = get_tenant_db(request.state.tenant_id)
    
    # Verificar si ya existe
    existing = db.query(User).filter(
        or_(
            User.username == user_data.username,
            User.email == user_data.email
        )
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username o email ya existe"
        )
    
    # Crear clave de encriptación única para este usuario
    encryption_key_id = f"user_{request.state.tenant_id}_{user_data.username}"
    
    # Crear usuario
    user = User(
        tenant_id=request.state.tenant_id,
        username=user_data.username,
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        first_name=encrypt_field(user_data.first_name, encryption_key_id) if user_data.first_name else None,
        last_name=encrypt_field(user_data.last_name, encryption_key_id) if user_data.last_name else None,
        rut=encrypt_field(user_data.rut, encryption_key_id) if user_data.rut else None,
        phone=encrypt_field(user_data.phone, encryption_key_id) if user_data.phone else None,
        is_active=user_data.is_active,
        is_dpo=user_data.is_dpo,
        department=user_data.department,
        position=user_data.position,
        language=user_data.language or "es",
        timezone=user_data.timezone or "America/Santiago",
        # Campos de encriptación
        has_encrypted_data=True,
        encryption_key_id=encryption_key_id,
        search_hash=hash_for_search(user_data.email),
        # Auditoría
        created_by=current_user.id
    )
    
    db.add(user)
    db.commit()
    
    # Asignar roles
    if user_data.role_codes:
        roles = db.query(Role).filter(
            Role.code.in_(user_data.role_codes)
        ).all()
        user.roles = roles
        db.commit()
    
    db.refresh(user)
    
    return user


@router.get("/{user_id}", response_model=UserInfo)
async def get_user(
    request: Request,
    user_id: str,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Obtener información de un usuario
    """
    # Permitir ver su propia información o requerir permiso
    if user_id != current_user.id:
        require_permission(["users.read", "users.manage"])(request, current_user)
    
    db = get_tenant_db(request.state.tenant_id)
    
    user = db.query(User).filter(
        User.id == user_id,
        User.tenant_id == request.state.tenant_id
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.patch("/{user_id}", response_model=UserInfo)
async def update_user(
    request: Request,
    user_id: str,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Actualizar usuario
    """
    # Permitir actualizar su propia información básica o requerir permiso
    if user_id != current_user.id:
        require_permission(["users.update", "users.manage"])(request, current_user)
    elif user_update.is_active is not None or user_update.is_dpo is not None or user_update.role_codes is not None:
        # Si intenta cambiar permisos, requiere autorización
        require_permission(["users.manage"])(request, current_user)
    
    db = get_tenant_db(request.state.tenant_id)
    
    user = db.query(User).filter(
        User.id == user_id,
        User.tenant_id == request.state.tenant_id
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Actualizar campos
    update_data = user_update.dict(exclude_unset=True)
    
    # Campos encriptados
    encrypted_fields = ["first_name", "last_name", "rut", "phone"]
    for field in encrypted_fields:
        if field in update_data and update_data[field] is not None:
            update_data[field] = encrypt_field(
                update_data[field],
                user.encryption_key_id
            )
    
    # Actualizar contraseña si se proporciona
    if "password" in update_data:
        update_data["password_hash"] = get_password_hash(update_data.pop("password"))
    
    # Actualizar roles si se proporcionan
    if "role_codes" in update_data:
        role_codes = update_data.pop("role_codes")
        roles = db.query(Role).filter(
            Role.code.in_(role_codes)
        ).all()
        user.roles = roles
    
    # Actualizar otros campos
    for field, value in update_data.items():
        setattr(user, field, value)
    
    user.updated_by = current_user.id
    
    db.commit()
    db.refresh(user)
    
    return user


@router.delete("/{user_id}")
async def delete_user(
    request: Request,
    user_id: str,
    current_user: User = Depends(get_current_active_user),
    _: bool = Depends(require_permission(["users.delete", "users.manage"]))
) -> Any:
    """
    Eliminar usuario (soft delete)
    """
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    db = get_tenant_db(request.state.tenant_id)
    
    user = db.query(User).filter(
        User.id == user_id,
        User.tenant_id == request.state.tenant_id
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Soft delete
    user.is_active = False
    user.is_deleted = True
    user.deleted_at = datetime.utcnow()
    user.deleted_by = current_user.id
    
    db.commit()
    
    return {"message": "User deleted successfully"}


# Endpoints de Roles - COMENTADOS: No disponibles en configuración mínima

# @router.get("/roles/", response_model=List[RoleInfo])
# async def list_roles(
#     request: Request,
#     current_user: User = Depends(get_current_active_user),
#     _: bool = Depends(require_permission(["roles.read", "users.manage"]))
# ) -> Any:
#     """
#     Listar roles disponibles
#     """
#     db = get_tenant_db(request.state.tenant_id)
#     
#     roles = db.query(Role).filter(
#         Role.tenant_id == request.state.tenant_id,
#         Role.is_active == True
#     ).all()
#     
#     return roles


# @router.post("/roles/", response_model=RoleInfo)
# async def create_role(
#     request: Request,
#     role_data: RoleCreate,
#     current_user: User = Depends(get_current_active_user),
#     _: bool = Depends(require_permission(["roles.create", "users.manage"]))
# ) -> Any:
#     """
#     Crear nuevo rol
#     """
#     db = get_tenant_db(request.state.tenant_id)
#     
#     # Verificar si ya existe
#     existing = db.query(Role).filter(
#         Role.tenant_id == request.state.tenant_id,
#         Role.code == role_data.code
#     ).first()
#     
#     if existing:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Role code already exists"
#         )
#     
#     # Crear rol
#     role = Role(
#         tenant_id=request.state.tenant_id,
#         Role.tenant_id,
#         name=role_data.name,
#         code=role_data.code,
#         description=role_data.description,
#         permissions=role_data.permissions,
#         is_system=False,
#         created_by=current_user.id
#     )
#     
#     db.add(role)
#     db.commit()
#     db.refresh(role)
#     
#     return role


@router.post("/{user_id}/reset-password")
async def reset_user_password(
    request: Request,
    user_id: str,
    current_user: User = Depends(get_current_active_user),
    _: bool = Depends(require_permission(["users.manage", "users.reset_password"]))
) -> Any:
    """
    Resetear la contraseña de un usuario y enviarla por email
    """
    db = get_tenant_db(request.state.tenant_id)
    
    # Obtener el usuario
    user = db.query(User).filter(
        User.id == user_id,
        User.tenant_id == request.state.tenant_id
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Generar nueva contraseña segura
    def generate_secure_password(length: int = 12) -> str:
        """Genera una contraseña segura"""
        alphabet = string.ascii_letters + string.digits + "!@#$%"
        password = ''.join(secrets.choice(alphabet) for _ in range(length))
        return password
    
    new_password = generate_secure_password()
    
    # Actualizar la contraseña del usuario
    user.password_hash = get_password_hash(new_password)
    user.password_reset_token = None
    user.password_reset_expires = None
    
    # Registrar el cambio
    user.updated_at = datetime.utcnow()
    user.updated_by = current_user.id
    
    db.commit()
    
    # Desencriptar datos del usuario para el email
    user_name = user.username  # Por defecto usar username
    if user.first_name and user.last_name:
        try:
            first_name = decrypt_field(user.first_name, user.encryption_key_id)
            last_name = decrypt_field(user.last_name, user.encryption_key_id)
            user_name = f"{first_name} {last_name}"
        except:
            pass
    
    # Obtener información de la empresa/tenant
    from app.models.tenant import Tenant
    tenant = db.query(Tenant).filter(Tenant.id == request.state.tenant_id).first()
    company_name = tenant.company_name if tenant else "Sistema LPDP"
    
    # Enviar email con la nueva contraseña
    from app.services.email_service import email_service
    
    email_sent = email_service.send_password_reset_email(
        to_email=user.email,
        user_name=user_name,
        new_password=new_password,
        company_name=company_name
    )
    
    # Log de auditoría
    logger.info(f"Contraseña reseteada para usuario {user.username} por {current_user.username}")
    
    return {
        "success": True,
        "message": "Contraseña reseteada exitosamente",
        "email_sent": email_sent,
        "user_id": user_id,
        "username": user.username,
        "email": user.email
    }