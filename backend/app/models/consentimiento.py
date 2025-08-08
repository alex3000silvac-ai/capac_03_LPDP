"""
Modelos para gestión de consentimientos (Módulo 1)
"""
from sqlalchemy import Column, String, Boolean, DateTime, JSON, Text, ForeignKey, Table, Enum
from sqlalchemy.orm import relationship
from .base import TenantBaseModel, EncryptedMixin
import enum


# Tabla de asociación para consentimientos y propósitos
consentimiento_propositos = Table(
    'consentimiento_propositos',
    TenantBaseModel.metadata,
    Column('consentimiento_id', String(36), ForeignKey('consentimientos.id')),
    Column('proposito_id', String(36), ForeignKey('propositos.id')),
    schema=None
)


class EstadoConsentimiento(enum.Enum):
    ACTIVO = "activo"
    RETIRADO = "retirado"
    EXPIRADO = "expirado"
    PENDIENTE = "pendiente"


class MetodoRecoleccion(enum.Enum):
    WEB = "web"
    APP_MOVIL = "app_movil"
    PRESENCIAL = "presencial"
    TELEFONO = "telefono"
    EMAIL = "email"
    IMPORTACION = "importacion"
    API = "api"


class TitularDatos(TenantBaseModel, EncryptedMixin):
    """
    Persona natural cuyos datos son tratados
    """
    __tablename__ = "titulares_datos"
    
    # Identificación (encriptado)
    tipo_identificacion = Column(String(20), nullable=False)  # rut, pasaporte, otro
    identificacion = Column(String(100), nullable=False)  # Encriptado
    
    # Datos personales (todo encriptado)
    nombres = Column(String(255))
    apellido_paterno = Column(String(255))
    apellido_materno = Column(String(255))
    email = Column(String(255))
    telefono = Column(String(50))
    
    # Dirección (encriptado)
    direccion = Column(Text)
    comuna = Column(String(100))
    ciudad = Column(String(100))
    region = Column(String(100))
    pais = Column(String(100), default="Chile")
    
    # Datos demográficos opcionales (encriptado)
    fecha_nacimiento = Column(DateTime)
    genero = Column(String(20))
    nacionalidad = Column(String(100))
    
    # Estado
    is_active = Column(Boolean, default=True)
    fecha_registro = Column(DateTime(timezone=True))
    
    # Preferencias de comunicación
    preferencias_contacto = Column(JSON, default={
        "email": True,
        "sms": False,
        "llamada": False,
        "correo_postal": False
    })
    
    # RGPD/LGPD compliance
    es_menor = Column(Boolean, default=False)
    representante_legal = Column(String(255))  # Si es menor
    
    # Relaciones
    consentimientos = relationship("Consentimiento", back_populates="titular")
    
    def __repr__(self):
        return f"<TitularDatos(id={self.id})>"


class Proposito(TenantBaseModel):
    """
    Propósitos para el tratamiento de datos
    """
    __tablename__ = "propositos"
    
    codigo = Column(String(50), nullable=False)
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=False)
    
    # Categorización
    categoria = Column(String(100))  # marketing, operacional, legal, etc.
    es_esencial = Column(Boolean, default=False)  # No puede ser retirado
    
    # Base legal
    base_legal = Column(String(100))  # consentimiento, contrato, obligacion_legal, etc.
    
    # Retención
    periodo_retencion_dias = Column(Integer)
    descripcion_retencion = Column(Text)
    
    # Estado
    is_active = Column(Boolean, default=True)
    fecha_vigencia_desde = Column(DateTime(timezone=True))
    fecha_vigencia_hasta = Column(DateTime(timezone=True))
    
    # Texto legal
    texto_consentimiento = Column(Text)
    texto_informativo = Column(Text)
    
    # Relaciones
    consentimientos = relationship(
        "Consentimiento",
        secondary=consentimiento_propositos,
        back_populates="propositos"
    )
    
    def __repr__(self):
        return f"<Proposito(codigo={self.codigo}, nombre={self.nombre})>"


class Consentimiento(TenantBaseModel):
    """
    Registro de consentimientos otorgados
    """
    __tablename__ = "consentimientos"
    
    titular_id = Column(String(36), ForeignKey('titulares_datos.id'), nullable=False)
    
    # Estado
    estado = Column(Enum(EstadoConsentimiento), nullable=False, default=EstadoConsentimiento.ACTIVO)
    
    # Fechas
    fecha_otorgamiento = Column(DateTime(timezone=True), nullable=False)
    fecha_expiracion = Column(DateTime(timezone=True))
    fecha_retiro = Column(DateTime(timezone=True))
    
    # Método de recolección
    metodo_recoleccion = Column(Enum(MetodoRecoleccion), nullable=False)
    punto_recoleccion = Column(String(255))  # URL, ubicación física, etc.
    
    # Evidencia
    ip_address = Column(String(45))
    user_agent = Column(Text)
    evidencia_adicional = Column(JSON)  # Screenshots, grabaciones, etc.
    
    # Versión y texto
    version_terminos = Column(String(50))
    texto_aceptado = Column(Text)  # Snapshot del texto aceptado
    hash_texto = Column(String(64))  # SHA-256 del texto para integridad
    
    # Retiro
    motivo_retiro = Column(Text)
    canal_retiro = Column(String(50))
    
    # Renovación
    es_renovacion = Column(Boolean, default=False)
    consentimiento_anterior_id = Column(String(36))
    
    # Relaciones
    titular = relationship("TitularDatos", back_populates="consentimientos")
    propositos = relationship(
        "Proposito",
        secondary=consentimiento_propositos,
        back_populates="consentimientos"
    )
    propositos_detalles = relationship("ConsentimientoProprosito", back_populates="consentimiento")
    historial = relationship("HistorialConsentimiento", back_populates="consentimiento")
    
    def __repr__(self):
        return f"<Consentimiento(id={self.id}, titular_id={self.titular_id}, estado={self.estado})>"


class ConsentimientoProprosito(TenantBaseModel):
    """
    Detalle de consentimiento por propósito (para retiros parciales)
    """
    __tablename__ = "consentimiento_proposito_detalle"
    
    consentimiento_id = Column(String(36), ForeignKey('consentimientos.id'), nullable=False)
    proposito_id = Column(String(36), ForeignKey('propositos.id'), nullable=False)
    
    # Estado específico del propósito
    is_active = Column(Boolean, default=True)
    fecha_aceptacion = Column(DateTime(timezone=True))
    fecha_retiro = Column(DateTime(timezone=True))
    
    # Opciones granulares
    opciones_adicionales = Column(JSON)  # {"email_marketing": true, "sms_marketing": false}
    
    # Relaciones
    consentimiento = relationship("Consentimiento", back_populates="propositos_detalles")
    proposito = relationship("Proposito")
    
    def __repr__(self):
        return f"<ConsentimientoProprosito(consentimiento_id={self.consentimiento_id}, proposito_id={self.proposito_id})>"


class HistorialConsentimiento(TenantBaseModel):
    """
    Historial de cambios en consentimientos
    """
    __tablename__ = "historial_consentimientos"
    
    consentimiento_id = Column(String(36), ForeignKey('consentimientos.id'), nullable=False)
    
    # Acción
    accion = Column(String(50), nullable=False)  # otorgado, retirado, modificado, expirado
    descripcion = Column(Text)
    
    # Estado anterior y nuevo
    estado_anterior = Column(JSON)
    estado_nuevo = Column(JSON)
    
    # Metadata
    ip_address = Column(String(45))
    user_agent = Column(Text)
    canal = Column(String(50))
    
    # Usuario que realizó la acción
    usuario_id = Column(String(36))
    es_accion_sistema = Column(Boolean, default=False)
    
    # Relaciones
    consentimiento = relationship("Consentimiento", back_populates="historial")
    
    def __repr__(self):
        return f"<HistorialConsentimiento(consentimiento_id={self.consentimiento_id}, accion={self.accion})>"