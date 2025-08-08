"""
Modelos para Notificación de Brechas de Seguridad (Módulo 4)
"""
from sqlalchemy import Column, String, Boolean, DateTime, JSON, Text, ForeignKey, Integer, Enum
from sqlalchemy.orm import relationship
from .base import TenantBaseModel, EncryptedMixin
import enum


class TipoBrecha(enum.Enum):
    CONFIDENCIALIDAD = "confidencialidad"  # Divulgación no autorizada
    INTEGRIDAD = "integridad"  # Alteración no autorizada
    DISPONIBILIDAD = "disponibilidad"  # Pérdida de acceso
    MIXTA = "mixta"  # Combinación de las anteriores


class GravedadBrecha(enum.Enum):
    BAJA = "baja"
    MEDIA = "media"
    ALTA = "alta"
    CRITICA = "critica"


class EstadoBrecha(enum.Enum):
    DETECTADA = "detectada"
    EN_INVESTIGACION = "en_investigacion"
    CONTENIDA = "contenida"
    EN_REMEDIACION = "en_remediacion"
    RESUELTA = "resuelta"
    CERRADA = "cerrada"


class OrigenBrecha(enum.Enum):
    INTERNO_ACCIDENTAL = "interno_accidental"
    INTERNO_MALICIOSO = "interno_malicioso"
    EXTERNO_MALICIOSO = "externo_malicioso"
    PROVEEDOR = "proveedor"
    DESCONOCIDO = "desconocido"


class NotificacionBrecha(TenantBaseModel):
    """
    Registro de brechas de seguridad de datos personales
    """
    __tablename__ = "notificaciones_brecha"
    
    # Identificación
    codigo_incidente = Column(String(50), unique=True, nullable=False)
    nombre = Column(String(255), nullable=False)
    
    # Descripción
    descripcion = Column(Text, nullable=False)
    tipo_brecha = Column(Enum(TipoBrecha), nullable=False)
    gravedad = Column(Enum(GravedadBrecha), nullable=False)
    origen = Column(Enum(OrigenBrecha))
    
    # Fechas críticas
    fecha_ocurrencia = Column(DateTime(timezone=True), nullable=False)
    fecha_deteccion = Column(DateTime(timezone=True), nullable=False)
    fecha_contencion = Column(DateTime(timezone=True))
    fecha_resolucion = Column(DateTime(timezone=True))
    
    # Plazo legal (72 horas desde detección)
    fecha_limite_notificacion = Column(DateTime(timezone=True), nullable=False)
    notificacion_enviada = Column(Boolean, default=False)
    fecha_notificacion_autoridad = Column(DateTime(timezone=True))
    
    # Estado
    estado = Column(Enum(EstadoBrecha), nullable=False, default=EstadoBrecha.DETECTADA)
    
    # Alcance
    sistemas_afectados = Column(JSON)  # Lista de sistemas
    datos_comprometidos = Column(JSON)  # Tipos de datos afectados
    numero_afectados = Column(Integer)
    numero_afectados_estimado = Column(Boolean, default=False)
    
    # Evaluación de riesgo
    probabilidad_dano = Column(String(50))  # baja, media, alta
    gravedad_dano = Column(String(50))  # leve, moderado, severo
    riesgo_derechos = Column(Text)  # Descripción del riesgo para los titulares
    
    # Causa
    causa_raiz = Column(Text)
    vector_ataque = Column(String(255))  # phishing, malware, error humano, etc.
    vulnerabilidad_explotada = Column(Text)
    
    # Respuesta
    acciones_inmediatas = Column(JSON)
    plan_remediacion = Column(Text)
    
    # Notificaciones
    requiere_notificar_titulares = Column(Boolean, default=False)
    titulares_notificados = Column(Boolean, default=False)
    fecha_notificacion_titulares = Column(DateTime(timezone=True))
    metodo_notificacion_titulares = Column(String(100))
    
    # Equipo de respuesta
    lider_respuesta = Column(String(255))
    equipo_respuesta = Column(JSON)  # Lista de personas involucradas
    
    # Costos
    costo_estimado = Column(Integer)
    costo_real = Column(Integer)
    
    # Lecciones aprendidas
    lecciones_aprendidas = Column(Text)
    mejoras_implementadas = Column(JSON)
    
    # Relaciones
    afectados = relationship("AfectadoBrecha", back_populates="brecha")
    medidas_mitigacion = relationship("MedidaMitigacion", back_populates="brecha")
    documentos = relationship("DocumentoBrecha", back_populates="brecha")
    
    def __repr__(self):
        return f"<NotificacionBrecha(codigo={self.codigo_incidente}, gravedad={self.gravedad})>"


class AfectadoBrecha(TenantBaseModel, EncryptedMixin):
    """
    Titulares afectados por una brecha
    """
    __tablename__ = "afectados_brecha"
    
    brecha_id = Column(String(36), ForeignKey('notificaciones_brecha.id'), nullable=False)
    titular_id = Column(String(36), ForeignKey('titulares_datos.id'))
    
    # Si no está en la base de titulares
    identificacion = Column(String(100))  # Encriptado
    nombre = Column(String(255))  # Encriptado
    email = Column(String(255))  # Encriptado
    
    # Datos comprometidos
    categorias_datos_afectados = Column(JSON)
    nivel_exposicion = Column(String(50))  # total, parcial, metadatos
    
    # Riesgo individual
    riesgo_individual = Column(String(50))  # bajo, medio, alto
    medidas_recomendadas = Column(Text)
    
    # Notificación
    notificado = Column(Boolean, default=False)
    fecha_notificacion = Column(DateTime(timezone=True))
    metodo_notificacion = Column(String(100))
    notificacion_exitosa = Column(Boolean)
    
    # Acciones tomadas por el titular
    solicito_informacion = Column(Boolean, default=False)
    ejercio_derechos = Column(Boolean, default=False)
    presento_reclamo = Column(Boolean, default=False)
    
    # Relaciones
    brecha = relationship("NotificacionBrecha", back_populates="afectados")
    titular = relationship("TitularDatos")
    
    def __repr__(self):
        return f"<AfectadoBrecha(brecha_id={self.brecha_id}, titular_id={self.titular_id})>"


class MedidaMitigacion(TenantBaseModel):
    """
    Medidas de mitigación implementadas
    """
    __tablename__ = "medidas_mitigacion"
    
    brecha_id = Column(String(36), ForeignKey('notificaciones_brecha.id'), nullable=False)
    
    # Descripción
    tipo_medida = Column(String(100), nullable=False)  # tecnica, organizativa, comunicacion
    descripcion = Column(Text, nullable=False)
    
    # Implementación
    fecha_planificada = Column(DateTime(timezone=True))
    fecha_implementacion = Column(DateTime(timezone=True))
    responsable = Column(String(255))
    
    # Estado
    estado = Column(String(50))  # planificada, en_progreso, completada, cancelada
    efectividad = Column(String(50))  # evaluación post-implementación
    
    # Costo
    costo_estimado = Column(Integer)
    costo_real = Column(Integer)
    
    # Evidencia
    evidencia = Column(JSON)  # Referencias a documentos, logs, etc.
    
    # Relaciones
    brecha = relationship("NotificacionBrecha", back_populates="medidas_mitigacion")
    
    def __repr__(self):
        return f"<MedidaMitigacion(brecha_id={self.brecha_id}, tipo={self.tipo_medida})>"


class DocumentoBrecha(TenantBaseModel):
    """
    Documentos relacionados con la brecha
    """
    __tablename__ = "documentos_brecha"
    
    brecha_id = Column(String(36), ForeignKey('notificaciones_brecha.id'), nullable=False)
    
    # Tipo de documento
    tipo_documento = Column(String(100), nullable=False)
    # Tipos: informe_inicial, informe_final, notificacion_autoridad, 
    # notificacion_titulares, evidencia_forense, plan_remediacion, etc.
    
    nombre_archivo = Column(String(255), nullable=False)
    descripcion = Column(Text)
    
    # Almacenamiento
    ruta_archivo = Column(String(500))  # Encriptado
    tamano_bytes = Column(Integer)
    mime_type = Column(String(100))
    hash_archivo = Column(String(64))  # SHA-256
    
    # Clasificación
    es_confidencial = Column(Boolean, default=True)
    es_evidencia_legal = Column(Boolean, default=False)
    
    # Estado
    fecha_carga = Column(DateTime(timezone=True))
    cargado_por = Column(String(255))
    
    # Para notificaciones
    es_plantilla = Column(Boolean, default=False)
    variables_plantilla = Column(JSON)  # Variables para generar documentos
    
    # Relaciones
    brecha = relationship("NotificacionBrecha", back_populates="documentos")
    
    def __repr__(self):
        return f"<DocumentoBrecha(brecha_id={self.brecha_id}, tipo={self.tipo_documento})>"