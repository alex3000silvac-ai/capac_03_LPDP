from sqlalchemy import Column, String, ForeignKey, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID, INET, JSONB
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class Auditoria(BaseModel):
    __tablename__ = "auditoria"
    
    organizacion_id = Column(UUID(as_uuid=True), ForeignKey("lpdp.organizaciones.id"))
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("lpdp.usuarios.id"))
    fecha_hora = Column(DateTime(timezone=True), nullable=False)
    accion = Column(String(100))  # crear, actualizar, eliminar, aprobar, etc
    entidad = Column(String(100))  # actividad_tratamiento, categoria_dato, etc
    entidad_id = Column(UUID(as_uuid=True))
    datos_anteriores = Column(JSONB)
    datos_nuevos = Column(JSONB)
    ip_address = Column(INET)
    user_agent = Column(Text)
    hash_anterior = Column(String(64))
    hash_actual = Column(String(64))