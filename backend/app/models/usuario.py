from sqlalchemy import Column, String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import TenantBaseModel


class Usuario(TenantBaseModel):
    __tablename__ = "usuarios"
    
    organizacion_id = Column(UUID(as_uuid=True), ForeignKey("organizaciones.id"))
    email = Column(String(255), unique=True, nullable=False)
    nombre = Column(String(255), nullable=False)
    password_hash = Column(String(255))
    rol = Column(String(50), nullable=False)  # dpo, admin, usuario
    area_negocio = Column(String(100))
    activo = Column(Boolean, default=True)
    
    # Relaciones
    organizacion = relationship("Organizacion", back_populates="usuarios")
    actividades_responsable = relationship(
        "ActividadTratamiento", 
        foreign_keys="ActividadTratamiento.responsable_proceso",
        back_populates="responsable"
    )
    progreso_capacitacion = relationship("ProgresoCapacitacion", back_populates="usuario")
    sesiones_entrevistador = relationship(
        "SesionEntrevista",
        foreign_keys="SesionEntrevista.entrevistador_id",
        back_populates="entrevistador"
    )
    sesiones_entrevistado = relationship(
        "SesionEntrevista",
        foreign_keys="SesionEntrevista.entrevistado_id",
        back_populates="entrevistado"
    )