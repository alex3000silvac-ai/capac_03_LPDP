"""
Modelo de Role
"""
from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.models.base import Base

class Role(Base):
    """
    Modelo de Role
    """
    __tablename__ = "roles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    code = Column(String(50), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    permissions = Column(JSON, default=[])
    is_system = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Role(id={self.id}, name='{self.name}', code='{self.code}')>"
