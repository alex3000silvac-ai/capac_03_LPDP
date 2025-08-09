"""
Modelos para Transferencias Internacionales de Datos (Módulo 6)
"""
from sqlalchemy import Column, String, Boolean, DateTime, JSON, Text, ForeignKey, Integer, Enum, DECIMAL
from sqlalchemy.orm import relationship
from .base import TenantBaseModel
import enum


class TipoTransferencia(enum.Enum):
    OCASIONAL = "ocasional"
    RECURRENTE = "recurrente"
    MASIVA = "masiva"
    CONTINUA = "continua"


class MecanismoTransferencia(enum.Enum):
    DECISION_ADECUACION = "decision_adecuacion"
    CLAUSULAS_TIPO = "clausulas_tipo"
    BCR = "bcr"  # Binding Corporate Rules
    CERTIFICACION = "certificacion"
    CODIGO_CONDUCTA = "codigo_conducta"
    CONSENTIMIENTO = "consentimiento"
    CONTRATO = "contrato"
    INTERES_VITAL = "interes_vital"
    OTRO = "otro"


class EstadoTransferencia(enum.Enum):
    EN_EVALUACION = "en_evaluacion"
    APROBADA = "aprobada"
    ACTIVA = "activa"
    SUSPENDIDA = "suspendida"
    FINALIZADA = "finalizada"
    RECHAZADA = "rechazada"


class NivelProteccionPais(enum.Enum):
    ADECUADO = "adecuado"
    NO_ADECUADO = "no_adecuado"
    EN_EVALUACION = "en_evaluacion"
    PARCIALMENTE_ADECUADO = "parcialmente_adecuado"


class TransferenciaInternacional(TenantBaseModel):
    """
    Registro de transferencias internacionales de datos
    """
    __tablename__ = "transferencias_internacionales"
    
    # Identificación
    codigo = Column(String(50), unique=True, nullable=False)
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=False)
    
    # Tipo y naturaleza
    tipo_transferencia = Column(Enum(TipoTransferencia), nullable=False)
    es_intragrupo = Column(Boolean, default=False)
    
    # Exportador (desde Chile)
    exportador_nombre = Column(String(255), nullable=False)
    exportador_rut = Column(String(20))
    exportador_direccion = Column(Text)
    exportador_contacto = Column(String(255))
    exportador_email = Column(String(255))
    
    # Importador (receptor en el extranjero)
    importador_nombre = Column(String(255), nullable=False)
    importador_identificacion = Column(String(100))
    importador_pais = Column(String(100), nullable=False)
    importador_direccion = Column(Text)
    importador_contacto = Column(String(255))
    importador_email = Column(String(255))
    
    # Datos transferidos
    categorias_datos = Column(JSON, nullable=False)
    datos_sensibles = Column(Boolean, default=False)
    volumen_registros = Column(String(100))
    frecuencia_transferencia = Column(String(100))
    
    # Propósito
    proposito_transferencia = Column(Text, nullable=False)
    duracion_tratamiento = Column(String(100))
    
    # Mecanismo legal
    mecanismo = Column(Enum(MecanismoTransferencia), nullable=False)
    referencia_mecanismo = Column(String(255))  # Ej: número de decisión, versión cláusulas
    
    # Garantías adicionales
    garantias_adicionales = Column(JSON)
    medidas_tecnicas = Column(JSON)
    medidas_organizativas = Column(JSON)
    
    # Evaluación
    evaluacion_riesgo_realizada = Column(Boolean, default=False)
    fecha_evaluacion = Column(DateTime(timezone=True))
    nivel_riesgo = Column(String(50))
    
    # Sub-procesadores
    permite_subcontratacion = Column(Boolean, default=False)
    lista_subprocesadores = Column(JSON)
    requiere_autorizacion_sub = Column(Boolean, default=True)
    
    # Estado y vigencia
    estado = Column(Enum(EstadoTransferencia), nullable=False, default=EstadoTransferencia.EN_EVALUACION)
    fecha_inicio = Column(DateTime(timezone=True))
    fecha_fin = Column(DateTime(timezone=True))
    renovacion_automatica = Column(Boolean, default=False)
    
    # Documentación
    contrato_principal = Column(String(500))  # Ruta al documento
    anexo_transferencia = Column(String(500))
    evaluacion_impacto = Column(String(500))
    
    # Auditoría y cumplimiento
    auditoria_requerida = Column(Boolean, default=True)
    frecuencia_auditoria = Column(String(100))
    ultima_auditoria = Column(DateTime(timezone=True))
    proxima_auditoria = Column(DateTime(timezone=True))
    
    # Incidentes
    incidentes_reportados = Column(Integer, default=0)
    ultimo_incidente = Column(DateTime(timezone=True))
    
    # Relaciones
    garantias = relationship("GarantiaAdecuada", back_populates="transferencia")
    clausulas = relationship("ClausulaContractual", back_populates="transferencia")
    # COMENTADO: Relación sin foreign key causa error
    # evaluacion_pais = relationship("EvaluacionPais", back_populates="transferencias")
    
    def __repr__(self):
        return f"<TransferenciaInternacional(codigo={self.codigo}, pais={self.importador_pais})>"


class GarantiaAdecuada(TenantBaseModel):
    """
    Garantías adecuadas para las transferencias
    """
    __tablename__ = "garantias_adecuadas"
    
    transferencia_id = Column(String(36), ForeignKey('transferencias_internacionales.id'), nullable=False)
    
    # Tipo de garantía
    tipo_garantia = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=False)
    
    # Validación
    es_valida = Column(Boolean, default=True)
    fecha_validacion = Column(DateTime(timezone=True))
    validada_por = Column(String(255))
    
    # Documentación
    documento_soporte = Column(String(500))
    referencia_legal = Column(String(255))
    
    # Vigencia
    fecha_inicio = Column(DateTime(timezone=True))
    fecha_expiracion = Column(DateTime(timezone=True))
    
    # Cumplimiento
    cumple_requisitos = Column(Boolean, default=True)
    observaciones = Column(Text)
    
    # Relaciones
    transferencia = relationship("TransferenciaInternacional", back_populates="garantias")
    
    def __repr__(self):
        return f"<GarantiaAdecuada(tipo={self.tipo_garantia}, transferencia_id={self.transferencia_id})>"


class ClausulaContractual(TenantBaseModel):
    """
    Cláusulas contractuales tipo o ad-hoc
    """
    __tablename__ = "clausulas_contractuales"
    
    transferencia_id = Column(String(36), ForeignKey('transferencias_internacionales.id'))
    
    # Identificación
    codigo = Column(String(50), unique=True, nullable=False)
    nombre = Column(String(255), nullable=False)
    
    # Tipo
    es_clausula_tipo = Column(Boolean, default=True)
    version_clausulas = Column(String(50))  # Ej: "2021/914"
    
    # Contenido
    texto_clausula = Column(Text, nullable=False)
    idioma = Column(String(50), default="es")
    
    # Categorías que cubre
    categorias = Column(JSON)  # [seguridad, derechos, responsabilidad, etc.]
    
    # Validación
    aprobada_autoridad = Column(Boolean, default=False)
    fecha_aprobacion = Column(DateTime(timezone=True))
    numero_aprobacion = Column(String(100))
    
    # Personalización
    es_personalizada = Column(Boolean, default=False)
    modificaciones = Column(JSON)  # Si se modificó la cláusula tipo
    
    # Estado
    is_active = Column(Boolean, default=True)
    requiere_actualizacion = Column(Boolean, default=False)
    
    # Relaciones
    transferencia = relationship("TransferenciaInternacional", back_populates="clausulas")
    
    def __repr__(self):
        return f"<ClausulaContractual(codigo={self.codigo}, tipo={'tipo' if self.es_clausula_tipo else 'adhoc'})>"


class EvaluacionPais(TenantBaseModel):
    """
    Evaluación del nivel de protección de países
    """
    __tablename__ = "evaluaciones_pais"
    
    # País
    codigo_pais = Column(String(3), nullable=False)  # ISO 3166-1 alpha-3
    nombre_pais = Column(String(100), nullable=False)
    region = Column(String(100))
    
    # Nivel de protección
    nivel_proteccion = Column(Enum(NivelProteccionPais), nullable=False)
    tiene_decision_adecuacion = Column(Boolean, default=False)
    fecha_decision = Column(DateTime(timezone=True))
    referencia_decision = Column(String(255))
    
    # Legislación
    tiene_ley_proteccion_datos = Column(Boolean, default=False)
    nombre_ley = Column(String(255))
    año_promulgacion = Column(Integer)
    
    # Autoridad de protección
    tiene_autoridad_proteccion = Column(Boolean, default=False)
    nombre_autoridad = Column(String(255))
    sitio_web_autoridad = Column(String(255))
    
    # Evaluación detallada
    principios_cumplidos = Column(JSON)  # Lista de principios que cumple
    derechos_garantizados = Column(JSON)  # Lista de derechos ARCOPOL
    mecanismos_ejecucion = Column(JSON)
    
    # Riesgos identificados
    riesgos_identificados = Column(JSON)
    nivel_riesgo_general = Column(String(50))
    
    # Recomendaciones
    requiere_garantias_adicionales = Column(Boolean, default=True)
    garantias_recomendadas = Column(JSON)
    restricciones = Column(Text)
    
    # Vigencia de la evaluación
    fecha_evaluacion = Column(DateTime(timezone=True), nullable=False)
    proxima_revision = Column(DateTime(timezone=True))
    evaluado_por = Column(String(255))
    
    # Referencias
    fuentes_informacion = Column(JSON)
    documentos_soporte = Column(JSON)
    
    # Estado
    evaluacion_vigente = Column(Boolean, default=True)
    requiere_actualizacion = Column(Boolean, default=False)
    
    # Relaciones
    # COMENTADO: Relación sin foreign key causa error
    # transferencias = relationship("TransferenciaInternacional", back_populates="evaluacion_pais")
    
    def __repr__(self):
        return f"<EvaluacionPais(pais={self.nombre_pais}, nivel={self.nivel_proteccion})>"