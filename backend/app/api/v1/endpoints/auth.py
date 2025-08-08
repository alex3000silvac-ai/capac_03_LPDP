"""
Endpoints de autenticación
"""
from datetime import timedelta
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.auth import AuthService
from app.core.tenant import get_master_db, get_tenant_from_request, validate_tenant
from app.core.config import settings
from app.schemas.auth import Token, TokenRefresh, LoginRequest, UserInfo
from app.core.security import decode_token, create_access_token, decrypt_field
from app.core.auth import get_current_user

router = APIRouter()


@router.post("/login", response_model=Token)
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_master_db)
) -> Any:
    """
    OAuth2 compatible token login
    """
    # Obtener tenant_id
    tenant_id = get_tenant_from_request(request)
    if not tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tenant ID required"
        )
    
    # Validar tenant
    tenant = validate_tenant(tenant_id, db)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid tenant"
        )
    
    # Autenticar usuario
    user = AuthService.authenticate_user(
        tenant_id=tenant_id,
        username=form_data.username,
        password=form_data.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Crear tokens
    tokens = AuthService.create_tokens(user, tenant_id)
    
    return {
        "access_token": tokens["access_token"],
        "refresh_token": tokens["refresh_token"],
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }


@router.post("/refresh", response_model=Token)
async def refresh_token(
    token_data: TokenRefresh,
    db: Session = Depends(get_master_db)
) -> Any:
    """
    Refresh access token using refresh token
    """
    # Decodificar refresh token
    payload = decode_token(token_data.refresh_token)
    
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Crear nuevo access token
    user_data = {
        "sub": payload["sub"],
        "tenant_id": payload["tenant_id"],
        "email": payload["email"],
        "roles": payload.get("roles", []),
        "is_superuser": payload.get("is_superuser", False),
        "is_dpo": payload.get("is_dpo", False)
    }
    
    new_access_token = create_access_token(user_data)
    
    return {
        "access_token": new_access_token,
        "refresh_token": token_data.refresh_token,  # Mismo refresh token
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }


@router.post("/logout")
async def logout() -> Any:
    """
    Logout (invalidar token en cliente)
    """
    # En una implementación real, aquí se podría:
    # 1. Agregar el token a una blacklist
    # 2. Eliminar sesiones del servidor
    # 3. Limpiar cache
    
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserInfo)
async def get_current_user_info(
    current_user: Any = Depends(get_current_user)
) -> Any:
    """
    Get current user information
    """
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "first_name": decrypt_field(current_user.first_name),
        "last_name": decrypt_field(current_user.last_name),
        "is_active": current_user.is_active,
        "is_superuser": current_user.is_superuser,
        "is_dpo": current_user.is_dpo,
        "roles": [{"code": role.code, "name": role.name} for role in current_user.roles],
        "tenant_id": current_user.tenant_id,
        "last_login": current_user.last_login
    }