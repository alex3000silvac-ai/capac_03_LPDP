from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class Organizacion(BaseModel):
    __tablename__ = "organizaciones"
    
    nombre = Column(String(255), nullable=False)
    rut = Column(String(20), unique=True, nullable=False)
    sector = Column(String(100))
    tamano = Column(String(50))  # pequeña, mediana, grande
    activo = Column(Boolean, default=True)
    
    # Relaciones
    usuarios = relationship("Usuario", back_populates="organizacion")
    actividades_tratamiento = relationship("ActividadTratamiento", back_populates="organizacion")
    categorias_datos = relationship("CategoriaDato", back_populates="organizacion")
    categorias_titulares = relationship("CategoriaTitular", back_populates="organizacion")
    sistemas_activos = relationship("SistemaActivo", back_populates="organizacion")
    destinatarios = relationship("Destinatario", back_populates="organizacion")