"""
Servicio de autenticación y autorización
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.core.config import settings
from app.models import User, Role, Tenant
from app.schemas.auth import TokenData
import secrets
import string


class AuthService:
    def __init__(self):
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.SECRET_KEY = settings.SECRET_KEY
        self.ALGORITHM = settings.ALGORITHM
        self.ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
        self.REFRESH_TOKEN_EXPIRE_DAYS = settings.REFRESH_TOKEN_EXPIRE_DAYS
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verifica una contraseña contra su hash"""
        return self.pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """Genera el hash de una contraseña"""
        return self.pwd_context.hash(password)
    
    def authenticate_user(
        self, 
        db: Session, 
        username: str, 
        password: str,
        tenant_id: Optional[str] = None
    ) -> Optional[User]:
        """Autentica un usuario"""
        query = db.query(User).filter(User.username == username)
        
        if tenant_id:
            query = query.filter(User.tenant_id == tenant_id)
        
        user = query.first()
        
        if not user:
            return None
        
        if not self.verify_password(password, user.password_hash):
            return None
        
        if not user.is_active:
            return None
        
        # Actualizar último login
        user.last_login = datetime.utcnow()
        user.failed_login_attempts = 0
        db.commit()
        
        return user
    
    def create_access_token(
        self, 
        data: dict, 
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """Crea un token de acceso"""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                minutes=self.ACCESS_TOKEN_EXPIRE_MINUTES
            )
        
        to_encode.update({"exp": expire, "type": "access"})
        encoded_jwt = jwt.encode(to_encode, self.SECRET_KEY, algorithm=self.ALGORITHM)
        
        return encoded_jwt
    
    def create_refresh_token(self, data: dict) -> str:
        """Crea un token de actualización"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=self.REFRESH_TOKEN_EXPIRE_DAYS)
        
        to_encode.update({"exp": expire, "type": "refresh"})
        encoded_jwt = jwt.encode(to_encode, self.SECRET_KEY, algorithm=self.ALGORITHM)
        
        return encoded_jwt
    
    def verify_token(self, token: str, token_type: str = "access") -> Optional[TokenData]:
        """Verifica y decodifica un token"""
        try:
            payload = jwt.decode(token, self.SECRET_KEY, algorithms=[self.ALGORITHM])
            
            if payload.get("type") != token_type:
                return None
            
            username: str = payload.get("sub")
            tenant_id: str = payload.get("tenant_id")
            
            if username is None:
                return None
            
            token_data = TokenData(username=username, tenant_id=tenant_id)
            return token_data
            
        except JWTError:
            return None
    
    def get_current_user(
        self, 
        db: Session, 
        token: str
    ) -> Optional[User]:
        """Obtiene el usuario actual desde el token"""
        token_data = self.verify_token(token)
        
        if not token_data:
            return None
        
        user = db.query(User).filter(
            and_(
                User.username == token_data.username,
                User.tenant_id == token_data.tenant_id
            )
        ).first()
        
        return user
    
    def check_permissions(
        self, 
        user: User, 
        permission: str,
        resource: Optional[str] = None
    ) -> bool:
        """Verifica si un usuario tiene un permiso específico"""
        for role in user.roles:
            if permission in role.permissions:
                return True
        
        return False
    
    def generate_password_reset_token(self, user: User, db: Session) -> str:
        """Genera un token para resetear contraseña"""
        token = secrets.token_urlsafe(32)
        user.password_reset_token = token
        user.password_reset_expires = datetime.utcnow() + timedelta(hours=24)
        db.commit()
        
        return token
    
    def verify_password_reset_token(
        self, 
        db: Session, 
        token: str
    ) -> Optional[User]:
        """Verifica un token de reseteo de contraseña"""
        user = db.query(User).filter(
            User.password_reset_token == token
        ).first()
        
        if not user:
            return None
        
        if user.password_reset_expires < datetime.utcnow():
            return None
        
        return user
    
    def reset_password(
        self, 
        user: User, 
        new_password: str, 
        db: Session
    ) -> bool:
        """Resetea la contraseña de un usuario"""
        user.password_hash = self.get_password_hash(new_password)
        user.password_reset_token = None
        user.password_reset_expires = None
        db.commit()
        
        return True
    
    def generate_secure_password(self, length: int = 12) -> str:
        """Genera una contraseña segura aleatoria"""
        alphabet = string.ascii_letters + string.digits + string.punctuation
        password = ''.join(secrets.choice(alphabet) for i in range(length))
        return password
    
    def validate_password_strength(self, password: str) -> Dict[str, Any]:
        """Valida la fortaleza de una contraseña"""
        errors = []
        
        if len(password) < 8:
            errors.append("La contraseña debe tener al menos 8 caracteres")
        
        if not any(c.isupper() for c in password):
            errors.append("La contraseña debe contener al menos una mayúscula")
        
        if not any(c.islower() for c in password):
            errors.append("La contraseña debe contener al menos una minúscula")
        
        if not any(c.isdigit() for c in password):
            errors.append("La contraseña debe contener al menos un número")
        
        if not any(c in string.punctuation for c in password):
            errors.append("La contraseña debe contener al menos un carácter especial")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors
        }