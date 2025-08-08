"""
Clases base para todos los modelos
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import Column, DateTime, String, Boolean, Text, Integer
from sqlalchemy.ext.declarative import declarative_base, declared_attr
from sqlalchemy.sql import func
import uuid

Base = declarative_base()


class TenantMixin:
    """
    Mixin para agregar soporte multi-tenant a los modelos
    """
    @declared_attr
    def __table_args__(cls):
        return {'schema': None}  # Se establece dinámicamente
    
    tenant_id = Column(String(50), nullable=False, index=True)


class TimestampMixin:
    """
    Mixin para agregar timestamps de creación y actualización
    """
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class AuditMixin(TimestampMixin):
    """
    Mixin para agregar campos de auditoría completos
    """
    created_by = Column(String(255))
    updated_by = Column(String(255))
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime(timezone=True))
    deleted_by = Column(String(255))
    
    # Para cumplimiento normativo
    deletion_reason = Column(Text)
    retention_expires_at = Column(DateTime(timezone=True))


class EncryptedMixin:
    """
    Mixin para campos que requieren encriptación
    """
    # Indicador de que el registro contiene datos encriptados
    has_encrypted_data = Column(Boolean, default=True, nullable=False)
    encryption_key_id = Column(String(100))  # ID de la llave de encriptación usada
    
    # Hash para búsquedas sin desencriptar
    search_hash = Column(String(64), index=True)  # SHA-256 del dato original


def generate_uuid():
    """Genera un UUID único"""
    return str(uuid.uuid4())


class BaseModel(Base, TimestampMixin):
    """
    Modelo base con ID y timestamps
    """
    __abstract__ = True
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    
    def __repr__(self):
        return f"<{self.__class__.__name__}(id={self.id})>"
    
    def to_dict(self):
        """Convierte el modelo a diccionario"""
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class TenantBaseModel(BaseModel, TenantMixin, AuditMixin):
    """
    Modelo base para entidades que pertenecen a un tenant
    """
    __abstract__ = True
    
    # Control de versiones para concurrencia optimista
    version = Column(Integer, default=1, nullable=False)
    
    def __repr__(self):
        return f"<{self.__class__.__name__}(id={self.id}, tenant_id={self.tenant_id})>"