"""
Modelo de Organización
"""
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.models.base import Base

class Organizacion(Base):
    """
    Modelo de Organización
    """
    __tablename__ = "organizaciones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=True)
    tipo = Column(String(100), nullable=True)
    direccion = Column(String(500), nullable=True)
    telefono = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    website = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Organizacion(id={self.id}, nombre='{self.nombre}')>"