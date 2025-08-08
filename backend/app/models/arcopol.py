"""
Modelos para gestión de derechos ARCOPOL (Módulo 2)
"""
from sqlalchemy import Column, String, Boolean, DateTime, JSON, Text, ForeignKey, Enum, Integer
from sqlalchemy.orm import relationship
from .base import TenantBaseModel, EncryptedMixin
import enum


class TipoSolicitud(enum.Enum):
    ACCESO = "acceso"
    RECTIFICACION = "rectificacion"
    CANCELACION = "cancelacion"
    OPOSICION = "oposicion"
    PORTABILIDAD = "portabilidad"
    OLVIDO = "olvido"
    LIMITACION = "limitacion"


class EstadoSolicitud(enum.Enum):
    RECIBIDA = "recibida"
    VERIFICANDO_IDENTIDAD = "verificando_identidad"
    EN_PROCESO = "en_proceso"
    REQUIERE_INFO = "requiere_info"
    COMPLETADA = "completada"
    RECHAZADA = "rechazada"
    CANCELADA = "cancelada"


class CanalRecepcion(enum.Enum):
    WEB = "web"
    EMAIL = "email"
    PRESENCIAL = "presencial"
    TELEFONO = "telefono"
    CORREO_POSTAL = "correo_postal"
    APP_MOVIL = "app_movil"


class MetodoVerificacion(enum.Enum):
    RUT = "rut"
    DOCUMENTO_IDENTIDAD = "documento_identidad"
    EMAIL_VERIFICADO = "email_verificado"
    PRESENCIAL = "presencial"
    VIDEO_LLAMADA = "video_llamada"
    FIRMA_ELECTRONICA = "firma_electronica"


class SolicitudARCOPOL(TenantBaseModel):
    """
    Solicitudes de ejercicio de derechos ARCOPOL
    """
    __tablename__ = "solicitudes_arcopol"
    
    # Identificación del solicitante
    titular_id = Column(String(36), ForeignKey('titulares_datos.id'))
    
    # Si no es titular registrado
    solicitante_rut = Column(String(20))  # Encriptado
    solicitante_nombre = Column(String(255))  # Encriptado
    solicitante_email = Column(String(255))  # Encriptado
    solicitante_telefono = Column(String(50))  # Encriptado
    
    # Tipo y estado
    tipo_solicitud = Column(Enum(TipoSolicitud), nullable=False)
    estado = Column(Enum(EstadoSolicitud), nullable=False, default=EstadoSolicitud.RECIBIDA)
    
    # Descripción
    descripcion = Column(Text, nullable=False)
    fundamento_legal = Column(Text)
    
    # Datos específicos según tipo de solicitud
    datos_solicitados = Column(JSON)  # Para acceso: qué datos quiere
    datos_a_rectificar = Column(JSON)  # Para rectificación: cambios solicitados
    motivo_oposicion = Column(Text)  # Para oposición
    formato_portabilidad = Column(String(50))  # Para portabilidad: CSV, JSON, etc.
    
    # Canal y recepción
    canal_recepcion = Column(Enum(CanalRecepcion), nullable=False)
    fecha_recepcion = Column(DateTime(timezone=True), nullable=False)
    numero_folio = Column(String(50), unique=True, nullable=False)
    
    # Verificación de identidad
    identidad_verificada = Column(Boolean, default=False)
    metodo_verificacion = Column(Enum(MetodoVerificacion))
    fecha_verificacion = Column(DateTime(timezone=True))
    evidencia_verificacion = Column(JSON)
    
    # Plazos legales
    fecha_limite_respuesta = Column(DateTime(timezone=True), nullable=False)  # 20 días hábiles
    dias_habiles_restantes = Column(Integer)
    es_prorroga = Column(Boolean, default=False)
    fecha_prorroga = Column(DateTime(timezone=True))  # 10 días adicionales
    
    # Respuesta
    fecha_respuesta = Column(DateTime(timezone=True))
    tipo_respuesta = Column(String(50))  # aceptada, rechazada, parcial
    motivo_rechazo = Column(Text)
    
    # Asignación
    usuario_asignado_id = Column(String(36), ForeignKey('users.id'))
    fecha_asignacion = Column(DateTime(timezone=True))
    
    # Costo (si aplica)
    tiene_costo = Column(Boolean, default=False)
    monto_costo = Column(Integer)
    costo_pagado = Column(Boolean, default=False)
    
    # Comunicaciones
    notificaciones_enviadas = Column(Integer, default=0)
    ultima_notificacion = Column(DateTime(timezone=True))
    
    # Relaciones
    titular = relationship("TitularDatos")
    usuario_asignado = relationship("User")
    documentos = relationship("DocumentoSolicitud", back_populates="solicitud")
    respuestas = relationship("RespuestaSolicitud", back_populates="solicitud")
    historial = relationship("HistorialSolicitud", back_populates="solicitud")
    
    def __repr__(self):
        return f"<SolicitudARCOPOL(folio={self.numero_folio}, tipo={self.tipo_solicitud}, estado={self.estado})>"


class DocumentoSolicitud(TenantBaseModel):
    """
    Documentos adjuntos a las solicitudes
    """
    __tablename__ = "documentos_solicitud"
    
    solicitud_id = Column(String(36), ForeignKey('solicitudes_arcopol.id'), nullable=False)
    
    # Tipo de documento
    tipo_documento = Column(String(50), nullable=False)  # identidad, poder, evidencia, etc.
    nombre_archivo = Column(String(255), nullable=False)
    
    # Almacenamiento
    ruta_archivo = Column(String(500))  # Encriptado
    tamano_bytes = Column(Integer)
    mime_type = Column(String(100))
    
    # Seguridad
    hash_archivo = Column(String(64))  # SHA-256
    es_encriptado = Column(Boolean, default=True)
    
    # Estado
    es_valido = Column(Boolean, default=True)
    fecha_carga = Column(DateTime(timezone=True))
    cargado_por = Column(String(36))
    
    # Relaciones
    solicitud = relationship("SolicitudARCOPOL", back_populates="documentos")
    
    def __repr__(self):
        return f"<DocumentoSolicitud(solicitud_id={self.solicitud_id}, tipo={self.tipo_documento})>"


class RespuestaSolicitud(TenantBaseModel):
    """
    Respuestas a las solicitudes ARCOPOL
    """
    __tablename__ = "respuestas_solicitud"
    
    solicitud_id = Column(String(36), ForeignKey('solicitudes_arcopol.id'), nullable=False)
    
    # Contenido
    tipo_respuesta = Column(String(50), nullable=False)  # informacion, accion_tomada, rechazo
    contenido = Column(Text, nullable=False)
    
    # Archivos generados
    archivos_respuesta = Column(JSON)  # Lista de archivos generados
    
    # Entrega
    metodo_entrega = Column(String(50))  # email, descarga_segura, presencial
    fecha_entrega = Column(DateTime(timezone=True))
    entregado_a = Column(String(255))  # Nombre de quien recibió
    
    # Confirmación
    confirmacion_recibida = Column(Boolean, default=False)
    fecha_confirmacion = Column(DateTime(timezone=True))
    
    # Para portabilidad
    formato_datos = Column(String(50))
    tamano_total_mb = Column(Integer)
    url_descarga = Column(String(500))  # Temporal y segura
    descarga_expira = Column(DateTime(timezone=True))
    
    # Relaciones
    solicitud = relationship("SolicitudARCOPOL", back_populates="respuestas")
    
    def __repr__(self):
        return f"<RespuestaSolicitud(solicitud_id={self.solicitud_id}, tipo={self.tipo_respuesta})>"


class HistorialSolicitud(TenantBaseModel):
    """
    Historial de cambios en las solicitudes
    """
    __tablename__ = "historial_solicitudes"
    
    solicitud_id = Column(String(36), ForeignKey('solicitudes_arcopol.id'), nullable=False)
    
    # Evento
    evento = Column(String(100), nullable=False)
    descripcion = Column(Text)
    
    # Estados
    estado_anterior = Column(String(50))
    estado_nuevo = Column(String(50))
    
    # Usuario que realizó la acción
    usuario_id = Column(String(36))
    es_accion_sistema = Column(Boolean, default=False)
    
    # Metadata
    datos_adicionales = Column(JSON)
    
    # Relaciones
    solicitud = relationship("SolicitudARCOPOL", back_populates="historial")
    
    def __repr__(self):
        return f"<HistorialSolicitud(solicitud_id={self.solicitud_id}, evento={self.evento})>"