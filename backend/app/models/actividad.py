from sqlalchemy import Column, String, Text, Boolean, ForeignKey, ARRAY, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import TenantBaseModel


class ActividadTratamiento(TenantBaseModel):
    __tablename__ = "actividades_tratamiento"
    
    organizacion_id = Column(UUID(as_uuid=True), ForeignKey("lpdp.organizaciones.id"))
    codigo_actividad = Column(String(50), unique=True, nullable=False)
    nombre_actividad = Column(String(255), nullable=False)
    descripcion = Column(Text)
    responsable_proceso = Column(UUID(as_uuid=True), ForeignKey("lpdp.usuarios.id"))
    area_negocio = Column(String(100))
    finalidad_principal = Column(Text, nullable=False)
    finalidades_adicionales = Column(ARRAY(Text))
    base_licitud = Column(String(100), nullable=False)
    bases_licitud_adicionales = Column(ARRAY(String(100)))
    plazo_conservacion_general = Column(String(255))
    politica_eliminacion = Column(Text)
    medidas_seguridad_desc = Column(Text)
    estado = Column(String(50), default="borrador")
    creado_por = Column(UUID(as_uuid=True), ForeignKey("lpdp.usuarios.id"))
    actualizado_por = Column(UUID(as_uuid=True), ForeignKey("lpdp.usuarios.id"))
    
    # Relaciones
    organizacion = relationship("Organizacion", back_populates="actividades_tratamiento")
    responsable = relationship("Usuario", foreign_keys=[responsable_proceso], back_populates="actividades_responsable")
    datos = relationship("ActividadDato", back_populates="actividad", cascade="all, delete-orphan")
    titulares = relationship("ActividadTitular", back_populates="actividad", cascade="all, delete-orphan")
    sistemas = relationship("ActividadSistema", back_populates="actividad", cascade="all, delete-orphan")
    flujos = relationship("ActividadFlujo", back_populates="actividad", cascade="all, delete-orphan")


class CategoriaDato(TenantBaseModel):
    __tablename__ = "categorias_datos"
    
    organizacion_id = Column(UUID(as_uuid=True), ForeignKey("lpdp.organizaciones.id"))
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text)
    clasificacion_sensibilidad = Column(String(50), nullable=False)
    ejemplos = Column(ARRAY(Text))
    activo = Column(Boolean, default=True)
    
    # Relaciones
    organizacion = relationship("Organizacion", back_populates="categorias_datos")
    actividades = relationship("ActividadDato", back_populates="categoria_dato")


class ActividadDato(TenantBaseModel):
    __tablename__ = "actividad_datos"
    __table_args__ = (
        UniqueConstraint('actividad_id', 'categoria_dato_id'),
        {"schema": "lpdp"}
    )
    
    actividad_id = Column(UUID(as_uuid=True), ForeignKey("lpdp.actividades_tratamiento.id", ondelete="CASCADE"))
    categoria_dato_id = Column(UUID(as_uuid=True), ForeignKey("lpdp.categorias_datos.id"))
    clasificacion_sensibilidad = Column(String(50), nullable=False)
    detalle_datos = Column(Text)
    es_obligatorio = Column(Boolean, default=False)
    
    # Relaciones
    actividad = relationship("ActividadTratamiento", back_populates="datos")
    categoria_dato = relationship("CategoriaDato", back_populates="actividades")


class CategoriaTitular(TenantBaseModel):
    __tablename__ = "categorias_titulares"
    
    organizacion_id = Column(UUID(as_uuid=True), ForeignKey("lpdp.organizaciones.id"))
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text)
    es_nna = Column(Boolean, default=False)
    activo = Column(Boolean, default=True)
    
    # Relaciones
    organizacion = relationship("Organizacion", back_populates="categorias_titulares")
    actividades = relationship("ActividadTitular", back_populates="categoria_titular")


class ActividadTitular(TenantBaseModel):
    __tablename__ = "actividad_titulares"
    __table_args__ = (
        UniqueConstraint('actividad_id', 'categoria_titular_id'),
        {"schema": "lpdp"}
    )
    
    actividad_id = Column(UUID(as_uuid=True), ForeignKey("lpdp.actividades_tratamiento.id", ondelete="CASCADE"))
    categoria_titular_id = Column(UUID(as_uuid=True), ForeignKey("lpdp.categorias_titulares.id"))
    cantidad_aproximada = Column(String(50))
    
    # Relaciones
    actividad = relationship("ActividadTratamiento", back_populates="titulares")
    categoria_titular = relationship("CategoriaTitular", back_populates="actividades")


class SistemaActivo(TenantBaseModel):
    __tablename__ = "sistemas_activos"
    
    organizacion_id = Column(UUID(as_uuid=True), ForeignKey("lpdp.organizaciones.id"))
    nombre = Column(String(255), nullable=False)
    tipo = Column(String(50))
    descripcion = Column(Text)
    ubicacion = Column(String(255))
    responsable_tecnico = Column(UUID(as_uuid=True), ForeignKey("lpdp.usuarios.id"))
    nivel_seguridad = Column(String(50))
    activo = Column(Boolean, default=True)
    
    # Relaciones
    organizacion = relationship("Organizacion", back_populates="sistemas_activos")
    actividades = relationship("ActividadSistema", back_populates="sistema")


class ActividadSistema(TenantBaseModel):
    __tablename__ = "actividad_sistemas"
    __table_args__ = (
        UniqueConstraint('actividad_id', 'sistema_id'),
        {"schema": "lpdp"}
    )
    
    actividad_id = Column(UUID(as_uuid=True), ForeignKey("lpdp.actividades_tratamiento.id", ondelete="CASCADE"))
    sistema_id = Column(UUID(as_uuid=True), ForeignKey("lpdp.sistemas_activos.id"))
    tipo_uso = Column(String(50))
    
    # Relaciones
    actividad = relationship("ActividadTratamiento", back_populates="sistemas")
    sistema = relationship("SistemaActivo", back_populates="actividades")


class Destinatario(TenantBaseModel):
    __tablename__ = "destinatarios"
    
    organizacion_id = Column(UUID(as_uuid=True), ForeignKey("lpdp.organizaciones.id"))
    nombre = Column(String(255), nullable=False)
    tipo = Column(String(50), nullable=False)
    rut = Column(String(20))
    pais = Column(String(100), default="Chile")
    es_transferencia_internacional = Column(Boolean, default=False)
    garantias_transferencia = Column(Text)
    activo = Column(Boolean, default=True)
    
    # Relaciones
    organizacion = relationship("Organizacion", back_populates="destinatarios")
    flujos = relationship("ActividadFlujo", back_populates="destinatario")


class ActividadFlujo(TenantBaseModel):
    __tablename__ = "actividad_flujos"
    __table_args__ = (
        UniqueConstraint('actividad_id', 'destinatario_id'),
        {"schema": "lpdp"}
    )
    
    actividad_id = Column(UUID(as_uuid=True), ForeignKey("lpdp.actividades_tratamiento.id", ondelete="CASCADE"))
    destinatario_id = Column(UUID(as_uuid=True), ForeignKey("lpdp.destinatarios.id"))
    proposito_transferencia = Column(Text)
    frecuencia = Column(String(50))
    medio_transferencia = Column(String(100))
    
    # Relaciones
    actividad = relationship("ActividadTratamiento", back_populates="flujos")
    destinatario = relationship("Destinatario", back_populates="flujos")