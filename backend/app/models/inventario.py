"""
Modelos para el Inventario de Actividades de Tratamiento (Módulo 3)
"""
from sqlalchemy import Column, String, Boolean, DateTime, JSON, Text, ForeignKey, Integer, Enum, Table
from sqlalchemy.orm import relationship
from .base import TenantBaseModel
import enum


# Tablas de asociación
actividad_categorias = Table(
    'actividad_categorias_datos',
    TenantBaseModel.metadata,
    Column('actividad_id', String(36), ForeignKey('actividades_tratamiento.id')),
    Column('categoria_id', String(36), ForeignKey('categorias_datos.id')),
    schema=None
)

actividad_destinatarios = Table(
    'actividad_destinatarios',
    TenantBaseModel.metadata,
    Column('actividad_id', String(36), ForeignKey('actividades_tratamiento.id')),
    Column('destinatario_id', String(36), ForeignKey('destinatarios_datos.id')),
    schema=None
)

actividad_medidas = Table(
    'actividad_medidas_seguridad',
    TenantBaseModel.metadata,
    Column('actividad_id', String(36), ForeignKey('actividades_tratamiento.id')),
    Column('medida_id', String(36), ForeignKey('medidas_seguridad.id')),
    schema=None
)


class NivelRiesgo(enum.Enum):
    BAJO = "bajo"
    MEDIO = "medio"
    ALTO = "alto"
    MUY_ALTO = "muy_alto"


class TipoBaseLegal(enum.Enum):
    CONSENTIMIENTO = "consentimiento"
    CONTRATO = "contrato"
    OBLIGACION_LEGAL = "obligacion_legal"
    INTERES_VITAL = "interes_vital"
    INTERES_PUBLICO = "interes_publico"
    INTERES_LEGITIMO = "interes_legitimo"


class ActividadTratamiento(TenantBaseModel):
    """
    Inventario de actividades de tratamiento de datos
    """
    __tablename__ = "actividades_tratamiento"
    
    # Identificación
    codigo = Column(String(50), unique=True, nullable=False)
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=False)
    
    # Responsable
    area_responsable = Column(String(255), nullable=False)
    responsable_nombre = Column(String(255))
    responsable_email = Column(String(255))
    
    # Propósito
    proposito_principal = Column(Text, nullable=False)
    propositos_secundarios = Column(JSON)
    
    # Base legal
    base_legal_id = Column(String(36), ForeignKey('bases_legales.id'))
    justificacion_base_legal = Column(Text)
    
    # Datos tratados
    volumen_datos = Column(String(100))  # aprox registros
    frecuencia_tratamiento = Column(String(100))  # diario, semanal, etc.
    
    # Origen y destino
    origen_datos = Column(JSON)  # ["titular", "terceros", "publico", etc.]
    
    # Retención
    periodo_retencion = Column(String(100))
    criterio_retencion = Column(Text)
    proceso_eliminacion = Column(Text)
    
    # Seguridad y riesgo
    nivel_riesgo = Column(Enum(NivelRiesgo), default=NivelRiesgo.MEDIO)
    evaluacion_riesgo = Column(JSON)
    requiere_dpia = Column(Boolean, default=False)
    dpia_realizada = Column(Boolean, default=False)
    dpia_fecha = Column(DateTime(timezone=True))
    
    # Estado
    is_active = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime(timezone=True))
    fecha_revision = Column(DateTime(timezone=True))
    proxima_revision = Column(DateTime(timezone=True))
    
    # Sistemas involucrados
    sistemas = Column(JSON)  # ["CRM", "ERP", "Web", etc.]
    
    # Transferencias
    tiene_transferencia_internacional = Column(Boolean, default=False)
    
    # Relaciones
    base_legal = relationship("BaseLegal", back_populates="actividades")
    categorias_datos = relationship(
        "CategoriaDatos",
        secondary=actividad_categorias,
        back_populates="actividades"
    )
    destinatarios = relationship(
        "DestinatarioDatos",
        secondary=actividad_destinatarios,
        back_populates="actividades"
    )
    transferencias = relationship("TransferenciaDatos", back_populates="actividad")
    medidas_seguridad = relationship(
        "MedidaSeguridad",
        secondary=actividad_medidas,
        back_populates="actividades"
    )
    
    def __repr__(self):
        return f"<ActividadTratamiento(codigo={self.codigo}, nombre={self.nombre})>"


class BaseLegal(TenantBaseModel):
    """
    Bases legales para el tratamiento
    """
    __tablename__ = "bases_legales"
    
    tipo = Column(Enum(TipoBaseLegal), nullable=False)
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text)
    
    # Referencia legal
    articulo_ley = Column(String(100))
    texto_legal = Column(Text)
    
    # Validez
    is_active = Column(Boolean, default=True)
    requiere_documentacion = Column(Boolean, default=False)
    
    # Relaciones
    actividades = relationship("ActividadTratamiento", back_populates="base_legal")
    
    def __repr__(self):
        return f"<BaseLegal(tipo={self.tipo}, nombre={self.nombre})>"


class CategoriaDatos(TenantBaseModel):
    """
    Categorías de datos personales
    """
    __tablename__ = "categorias_datos"
    
    codigo = Column(String(50), unique=True, nullable=False)
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text)
    
    # Clasificación
    es_sensible = Column(Boolean, default=False)
    es_especial = Column(Boolean, default=False)  # Datos de categorías especiales
    
    # Ejemplos
    ejemplos = Column(JSON)  # ["nombre", "email", "dirección", etc.]
    
    # Nivel de protección
    nivel_proteccion_requerido = Column(Enum(NivelRiesgo), default=NivelRiesgo.MEDIO)
    
    # Estado
    is_active = Column(Boolean, default=True)
    
    # Relaciones
    actividades = relationship(
        "ActividadTratamiento",
        secondary=actividad_categorias,
        back_populates="categorias_datos"
    )
    
    def __repr__(self):
        return f"<CategoriaDatos(codigo={self.codigo}, nombre={self.nombre})>"


class DestinatarioDatos(TenantBaseModel):
    """
    Destinatarios de datos personales
    """
    __tablename__ = "destinatarios_datos"
    
    # Identificación
    tipo_destinatario = Column(String(50), nullable=False)  # interno, proveedor, autoridad, etc.
    nombre = Column(String(255), nullable=False)
    rut = Column(String(20))
    
    # Contacto
    contacto_nombre = Column(String(255))
    contacto_email = Column(String(255))
    contacto_telefono = Column(String(50))
    
    # Ubicación
    pais = Column(String(100), default="Chile")
    es_internacional = Column(Boolean, default=False)
    
    # Relación contractual
    tiene_contrato = Column(Boolean, default=True)
    numero_contrato = Column(String(100))
    fecha_contrato = Column(DateTime)
    incluye_clausulas_proteccion = Column(Boolean, default=True)
    
    # Propósito
    proposito_compartir = Column(Text)
    categorias_compartidas = Column(JSON)
    
    # Estado
    is_active = Column(Boolean, default=True)
    fecha_inicio = Column(DateTime(timezone=True))
    fecha_fin = Column(DateTime(timezone=True))
    
    # Relaciones
    actividades = relationship(
        "ActividadTratamiento",
        secondary=actividad_destinatarios,
        back_populates="destinatarios"
    )
    
    def __repr__(self):
        return f"<DestinatarioDatos(nombre={self.nombre}, tipo={self.tipo_destinatario})>"


class TransferenciaDatos(TenantBaseModel):
    """
    Transferencias de datos (nacionales e internacionales)
    """
    __tablename__ = "transferencias_datos"
    
    actividad_id = Column(String(36), ForeignKey('actividades_tratamiento.id'), nullable=False)
    destinatario_id = Column(String(36), ForeignKey('destinatarios_datos.id'), nullable=False)
    
    # Tipo de transferencia
    es_internacional = Column(Boolean, default=False)
    pais_destino = Column(String(100))
    
    # Garantías
    mecanismo_garantia = Column(String(100))  # clausulas_tipo, bcr, certificacion, etc.
    descripcion_garantia = Column(Text)
    documento_garantia = Column(String(500))  # Ruta al documento
    
    # Datos transferidos
    categorias_datos = Column(JSON)
    volumen_aproximado = Column(String(100))
    frecuencia = Column(String(100))
    
    # Canal
    metodo_transferencia = Column(String(100))  # api, sftp, email, etc.
    es_encriptada = Column(Boolean, default=True)
    
    # Estado
    is_active = Column(Boolean, default=True)
    fecha_inicio = Column(DateTime(timezone=True))
    fecha_fin = Column(DateTime(timezone=True))
    
    # Evaluación
    riesgo_evaluado = Column(Enum(NivelRiesgo))
    fecha_evaluacion = Column(DateTime(timezone=True))
    
    # Relaciones
    actividad = relationship("ActividadTratamiento", back_populates="transferencias")
    destinatario = relationship("DestinatarioDatos")
    
    def __repr__(self):
        return f"<TransferenciaDatos(actividad_id={self.actividad_id}, pais={self.pais_destino})>"


class MedidaSeguridad(TenantBaseModel):
    """
    Medidas de seguridad implementadas
    """
    __tablename__ = "medidas_seguridad"
    
    # Identificación
    codigo = Column(String(50), unique=True, nullable=False)
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text)
    
    # Tipo
    tipo_medida = Column(String(50), nullable=False)  # tecnica, organizativa, fisica
    categoria = Column(String(100))  # acceso, encriptacion, backup, etc.
    
    # Implementación
    es_obligatoria = Column(Boolean, default=False)
    fecha_implementacion = Column(DateTime(timezone=True))
    responsable_implementacion = Column(String(255))
    
    # Efectividad
    efectividad = Column(String(50))  # alta, media, baja
    ultima_revision = Column(DateTime(timezone=True))
    proxima_revision = Column(DateTime(timezone=True))
    
    # Costo
    tiene_costo = Column(Boolean, default=False)
    costo_estimado = Column(Integer)
    
    # Estado
    is_active = Column(Boolean, default=True)
    
    # Relaciones
    actividades = relationship(
        "ActividadTratamiento",
        secondary=actividad_medidas,
        back_populates="medidas_seguridad"
    )
    
    def __repr__(self):
        return f"<MedidaSeguridad(codigo={self.codigo}, tipo={self.tipo_medida})>"