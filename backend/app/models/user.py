"""
Modelo de Usuario - CORREGIDO Y UNIFICADO
"""
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.models.base import Base

class User(Base):
    """
    Modelo de Usuario - CORREGIDO
    """
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)  # CORREGIDO: usar hashed_password
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    is_superuser = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=True)
    empresa_id = Column(UUID(as_uuid=True), ForeignKey("empresas.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    failed_login_attempts = Column(String(10), default="0")

    # Relaciones
    tenant = relationship("Tenant", back_populates="users")
    empresa = relationship("Empresa", back_populates="users")

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"

    @property
    def full_name(self):
        """Nombre completo del usuario"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        elif self.last_name:
            return self.last_name
        return self.username

    @property
    def is_authenticated(self):
        """Verifica si el usuario está autenticado"""
        return self.is_active

    def check_password(self, password: str) -> bool:
        """Verifica si la contraseña es correcta"""
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return pwd_context.verify(password, self.hashed_password)

    def set_password(self, password: str):
        """Establece una nueva contraseña hasheada"""
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.hashed_password = pwd_context.hash(password)

    def increment_failed_login(self):
        """Incrementa el contador de intentos fallidos de login"""
        try:
            current = int(self.failed_login_attempts or "0")
            self.failed_login_attempts = str(current + 1)
        except ValueError:
            self.failed_login_attempts = "1"

    def reset_failed_login(self):
        """Resetea el contador de intentos fallidos de login"""
        self.failed_login_attempts = "0"
        self.last_login = datetime.utcnow()

    def to_dict(self):
        """Convierte el usuario a diccionario"""
        return {
            "id": str(self.id),
            "username": self.username,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "is_superuser": self.is_superuser,
            "is_active": self.is_active,
            "tenant_id": str(self.tenant_id) if self.tenant_id else None,
            "empresa_id": str(self.empresa_id) if self.empresa_id else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "full_name": self.full_name
        }