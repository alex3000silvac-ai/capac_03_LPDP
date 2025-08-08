"""
Modelos para Evaluaciones de Impacto en Protección de Datos (DPIA) - Módulo 5
"""
from sqlalchemy import Column, String, Boolean, DateTime, JSON, Text, ForeignKey, Integer, Enum, DECIMAL
from sqlalchemy.orm import relationship
from .base import TenantBaseModel
import enum


class EstadoDPIA(enum.Enum):
    BORRADOR = "borrador"
    EN_EVALUACION = "en_evaluacion"
    REVISION_DPO = "revision_dpo"
    APROBADA = "aprobada"
    RECHAZADA = "rechazada"
    EN_IMPLEMENTACION = "en_implementacion"
    COMPLETADA = "completada"


class TipoProyecto(enum.Enum):
    NUEVO_SISTEMA = "nuevo_sistema"
    MODIFICACION_SISTEMA = "modificacion_sistema"
    NUEVO_PROCESO = "nuevo_proceso"
    NUEVA_TECNOLOGIA = "nueva_tecnologia"
    COMPARTIR_DATOS = "compartir_datos"
    CAMBIO_PROPOSITO = "cambio_proposito"
    OTRO = "otro"


class NivelRiesgoResidual(enum.Enum):
    ACEPTABLE = "aceptable"
    TOLERABLE = "tolerable"
    INACEPTABLE = "inaceptable"
    REQUIERE_REVISION = "requiere_revision"


class EvaluacionImpacto(TenantBaseModel):
    """
    Evaluación de Impacto en la Protección de Datos (DPIA)
    """
    __tablename__ = "evaluaciones_impacto"
    
    # Identificación
    codigo = Column(String(50), unique=True, nullable=False)
    nombre_proyecto = Column(String(255), nullable=False)
    tipo_proyecto = Column(Enum(TipoProyecto), nullable=False)
    
    # Descripción del proyecto
    descripcion = Column(Text, nullable=False)
    objetivos = Column(Text, nullable=False)
    alcance = Column(Text, nullable=False)
    
    # Responsables
    responsable_proyecto = Column(String(255), nullable=False)
    email_responsable = Column(String(255))
    area_responsable = Column(String(255))
    
    # DPO
    requiere_consulta_dpo = Column(Boolean, default=True)
    dpo_consultado = Column(Boolean, default=False)
    fecha_consulta_dpo = Column(DateTime(timezone=True))
    
    # Estado
    estado = Column(Enum(EstadoDPIA), nullable=False, default=EstadoDPIA.BORRADOR)
    fecha_inicio = Column(DateTime(timezone=True), nullable=False)
    fecha_completado = Column(DateTime(timezone=True))
    
    # Necesidad de DPIA
    criterios_dpia = Column(JSON)  # Lista de criterios que aplican
    justificacion_dpia = Column(Text, nullable=False)
    
    # Datos y tratamiento
    categorias_datos = Column(JSON, nullable=False)
    volumen_titulares = Column(Integer)
    datos_sensibles = Column(Boolean, default=False)
    datos_menores = Column(Boolean, default=False)
    
    # Tecnología
    tecnologias_usadas = Column(JSON)
    es_tecnologia_nueva = Column(Boolean, default=False)
    usa_ia_ml = Column(Boolean, default=False)
    usa_decisiones_automatizadas = Column(Boolean, default=False)
    
    # Propósitos y bases legales
    propositos_tratamiento = Column(JSON, nullable=False)
    bases_legales = Column(JSON, nullable=False)
    
    # Compartir datos
    comparte_datos_terceros = Column(Boolean, default=False)
    terceros_receptores = Column(JSON)
    transferencia_internacional = Column(Boolean, default=False)
    
    # Evaluación de necesidad y proporcionalidad
    necesidad_evaluada = Column(Text)
    proporcionalidad_evaluada = Column(Text)
    alternativas_consideradas = Column(Text)
    
    # Consulta con interesados
    consulta_titulares = Column(Boolean, default=False)
    metodo_consulta = Column(String(255))
    resultados_consulta = Column(Text)
    
    # Riesgo general
    riesgo_inherente = Column(String(50))  # bajo, medio, alto, muy_alto
    riesgo_residual = Column(Enum(NivelRiesgoResidual))
    
    # Decisión final
    decision = Column(String(50))  # aprobar, aprobar_con_condiciones, rechazar
    condiciones_aprobacion = Column(Text)
    
    # Seguimiento
    requiere_revision = Column(Boolean, default=False)
    fecha_proxima_revision = Column(DateTime(timezone=True))
    revisiones_realizadas = Column(Integer, default=0)
    
    # Relaciones
    riesgos = relationship("RiesgoDPIA", back_populates="evaluacion")
    medidas_mitigacion = relationship("MedidaMitigacionDPIA", back_populates="evaluacion")
    aprobaciones = relationship("AprobacionDPIA", back_populates="evaluacion")
    
    def __repr__(self):
        return f"<EvaluacionImpacto(codigo={self.codigo}, proyecto={self.nombre_proyecto})>"


class RiesgoDPIA(TenantBaseModel):
    """
    Riesgos identificados en la DPIA
    """
    __tablename__ = "riesgos_dpia"
    
    evaluacion_id = Column(String(36), ForeignKey('evaluaciones_impacto.id'), nullable=False)
    
    # Identificación del riesgo
    categoria = Column(String(100), nullable=False)  # acceso_no_autorizado, perdida_datos, etc.
    descripcion = Column(Text, nullable=False)
    
    # Amenaza y vulnerabilidad
    amenaza = Column(Text, nullable=False)
    vulnerabilidad = Column(Text, nullable=False)
    
    # Evaluación inicial (sin controles)
    probabilidad_inicial = Column(Integer, nullable=False)  # 1-5
    impacto_inicial = Column(Integer, nullable=False)  # 1-5
    nivel_riesgo_inicial = Column(Integer)  # probabilidad * impacto
    
    # Controles existentes
    controles_existentes = Column(JSON)
    efectividad_controles = Column(String(50))  # baja, media, alta
    
    # Evaluación residual (con controles)
    probabilidad_residual = Column(Integer)  # 1-5
    impacto_residual = Column(Integer)  # 1-5
    nivel_riesgo_residual = Column(Integer)  # probabilidad * impacto
    
    # Impacto en derechos
    afecta_derechos = Column(Boolean, default=True)
    derechos_afectados = Column(JSON)  # [privacidad, no_discriminacion, etc.]
    
    # Estado
    estado = Column(String(50))  # identificado, evaluado, mitigado, aceptado
    requiere_accion = Column(Boolean, default=True)
    
    # Plan de tratamiento
    estrategia_tratamiento = Column(String(50))  # mitigar, transferir, evitar, aceptar
    responsable_tratamiento = Column(String(255))
    fecha_limite_tratamiento = Column(DateTime(timezone=True))
    
    # Relaciones
    evaluacion = relationship("EvaluacionImpacto", back_populates="riesgos")
    medidas_mitigacion = relationship("MedidaMitigacionDPIA", back_populates="riesgo")
    
    def __repr__(self):
        return f"<RiesgoDPIA(evaluacion_id={self.evaluacion_id}, categoria={self.categoria})>"


class MedidaMitigacionDPIA(TenantBaseModel):
    """
    Medidas de mitigación propuestas en la DPIA
    """
    __tablename__ = "medidas_mitigacion_dpia"
    
    evaluacion_id = Column(String(36), ForeignKey('evaluaciones_impacto.id'), nullable=False)
    riesgo_id = Column(String(36), ForeignKey('riesgos_dpia.id'))
    
    # Descripción
    tipo_medida = Column(String(100), nullable=False)  # tecnica, organizativa, legal
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=False)
    
    # Efectividad esperada
    reduccion_probabilidad = Column(Integer)  # Porcentaje esperado
    reduccion_impacto = Column(Integer)  # Porcentaje esperado
    
    # Implementación
    complejidad = Column(String(50))  # baja, media, alta
    tiempo_implementacion = Column(String(100))  # estimado en días/semanas
    costo_estimado = Column(DECIMAL(10, 2))
    
    # Responsable
    responsable_implementacion = Column(String(255))
    area_responsable = Column(String(255))
    
    # Estado
    estado = Column(String(50))  # propuesta, aprobada, en_implementacion, implementada
    fecha_aprobacion = Column(DateTime(timezone=True))
    fecha_implementacion_plan = Column(DateTime(timezone=True))
    fecha_implementacion_real = Column(DateTime(timezone=True))
    
    # Prioridad
    prioridad = Column(String(50))  # critica, alta, media, baja
    es_obligatoria = Column(Boolean, default=False)
    
    # Dependencias
    dependencias = Column(JSON)  # Otras medidas o requisitos
    
    # Seguimiento
    indicadores_exito = Column(JSON)
    efectividad_real = Column(String(50))  # Evaluación post-implementación
    
    # Relaciones
    evaluacion = relationship("EvaluacionImpacto", back_populates="medidas_mitigacion")
    riesgo = relationship("RiesgoDPIA", back_populates="medidas_mitigacion")
    
    def __repr__(self):
        return f"<MedidaMitigacionDPIA(nombre={self.nombre}, estado={self.estado})>"


class AprobacionDPIA(TenantBaseModel):
    """
    Aprobaciones y revisiones de la DPIA
    """
    __tablename__ = "aprobaciones_dpia"
    
    evaluacion_id = Column(String(36), ForeignKey('evaluaciones_impacto.id'), nullable=False)
    
    # Tipo de aprobación
    tipo_aprobacion = Column(String(50), nullable=False)  # inicial, dpo, gerencia, final
    nivel_requerido = Column(String(100))  # jefe_area, dpo, gerencia, directorio
    
    # Aprobador
    aprobador_id = Column(String(36), ForeignKey('users.id'))
    aprobador_nombre = Column(String(255))
    aprobador_cargo = Column(String(255))
    
    # Decisión
    decision = Column(String(50), nullable=False)  # aprobado, rechazado, aprobado_con_condiciones
    fecha_decision = Column(DateTime(timezone=True), nullable=False)
    
    # Comentarios y condiciones
    comentarios = Column(Text)
    condiciones = Column(JSON)  # Lista de condiciones si aplica
    
    # Validez
    valido_hasta = Column(DateTime(timezone=True))
    requiere_renovacion = Column(Boolean, default=False)
    
    # Documentación
    documento_firmado = Column(String(500))  # Ruta al documento
    hash_documento = Column(String(64))  # SHA-256 para integridad
    
    # Relaciones
    evaluacion = relationship("EvaluacionImpacto", back_populates="aprobaciones")
    aprobador = relationship("User")
    
    def __repr__(self):
        return f"<AprobacionDPIA(evaluacion_id={self.evaluacion_id}, tipo={self.tipo_aprobacion}, decision={self.decision})>"