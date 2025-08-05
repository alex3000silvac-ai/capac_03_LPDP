from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class ProgresoCapacitacion(BaseModel):
    __tablename__ = "progreso_capacitacion"
    __table_args__ = (
        UniqueConstraint('usuario_id', 'modulo'),
        {"schema": "lpdp"}
    )
    
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("lpdp.usuarios.id"))
    modulo = Column(String(100))
    estado = Column(String(50))  # no_iniciado, en_progreso, completado
    porcentaje_completado = Column(Integer, default=0)
    fecha_inicio = Column(DateTime(timezone=True))
    fecha_completado = Column(DateTime(timezone=True))
    
    # Relaciones
    usuario = relationship("Usuario", back_populates="progreso_capacitacion")


class SesionEntrevista(BaseModel):
    __tablename__ = "sesiones_entrevista"
    
    organizacion_id = Column(UUID(as_uuid=True), ForeignKey("lpdp.organizaciones.id"))
    entrevistador_id = Column(UUID(as_uuid=True), ForeignKey("lpdp.usuarios.id"))
    entrevistado_id = Column(UUID(as_uuid=True), ForeignKey("lpdp.usuarios.id"))
    area_negocio = Column(String(100))
    estado = Column(String(50))  # programada, en_progreso, completada, cancelada
    notas = Column(Text)
    duracion_minutos = Column(Integer)
    
    # Relaciones
    entrevistador = relationship("Usuario", foreign_keys=[entrevistador_id], back_populates="sesiones_entrevistador")
    entrevistado = relationship("Usuario", foreign_keys=[entrevistado_id], back_populates="sesiones_entrevistado")
    respuestas = relationship("RespuestaEntrevista", back_populates="sesion", cascade="all, delete-orphan")


class RespuestaEntrevista(BaseModel):
    __tablename__ = "respuestas_entrevista"
    
    sesion_id = Column(UUID(as_uuid=True), ForeignKey("lpdp.sesiones_entrevista.id", ondelete="CASCADE"))
    pregunta_clave = Column(String(100))  # identificar_actividad, entender_proposito, etc
    respuesta = Column(Text)
    actividad_id = Column(UUID(as_uuid=True), ForeignKey("lpdp.actividades_tratamiento.id"))
    orden = Column(Integer)
    
    # Relaciones
    sesion = relationship("SesionEntrevista", back_populates="respuestas")