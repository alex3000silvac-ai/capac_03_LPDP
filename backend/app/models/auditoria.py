"""
Modelos para Auditoría y Cumplimiento (Módulo 7)
"""
from sqlalchemy import Column, String, Boolean, DateTime, JSON, Text, ForeignKey, Integer, Enum, DECIMAL, BigInteger
from sqlalchemy.orm import relationship
from .base import TenantBaseModel
import enum


class TipoEvento(enum.Enum):
    # Acceso a datos
    ACCESO_DATOS = "acceso_datos"
    MODIFICACION_DATOS = "modificacion_datos"
    ELIMINACION_DATOS = "eliminacion_datos"
    EXPORTACION_DATOS = "exportacion_datos"
    
    # Consentimientos
    CONSENTIMIENTO_OTORGADO = "consentimiento_otorgado"
    CONSENTIMIENTO_RETIRADO = "consentimiento_retirado"
    
    # ARCOPOL
    SOLICITUD_ARCOPOL = "solicitud_arcopol"
    RESPUESTA_ARCOPOL = "respuesta_arcopol"
    
    # Seguridad
    INTENTO_ACCESO_FALLIDO = "intento_acceso_fallido"
    CAMBIO_PERMISOS = "cambio_permisos"
    CAMBIO_CONFIGURACION = "cambio_configuracion"
    
    # Sistema
    INICIO_SESION = "inicio_sesion"
    CIERRE_SESION = "cierre_sesion"
    ERROR_SISTEMA = "error_sistema"
    
    # Administrativo
    CREACION_USUARIO = "creacion_usuario"
    MODIFICACION_USUARIO = "modificacion_usuario"
    ASIGNACION_ROL = "asignacion_rol"


class SeveridadEvento(enum.Enum):
    INFO = "info"
    ADVERTENCIA = "advertencia"
    ERROR = "error"
    CRITICO = "critico"


class TipoReporte(enum.Enum):
    CUMPLIMIENTO_GENERAL = "cumplimiento_general"
    CONSENTIMIENTOS = "consentimientos"
    SOLICITUDES_ARCOPOL = "solicitudes_arcopol"
    BRECHAS_SEGURIDAD = "brechas_seguridad"
    ACCESOS_DATOS = "accesos_datos"
    TRANSFERENCIAS = "transferencias"
    DPIAS = "dpias"
    AUDITORIA_INTERNA = "auditoria_interna"


class LogAuditoria(TenantBaseModel):
    """
    Log inmutable de auditoría para todas las operaciones
    """
    __tablename__ = "logs_auditoria"
    __table_args__ = {'schema': None, 'extend_existing': True}
    
    # Identificación del evento
    evento_id = Column(String(100), unique=True, nullable=False)
    tipo_evento = Column(Enum(TipoEvento), nullable=False)
    severidad = Column(Enum(SeveridadEvento), nullable=False)
    
    # Timestamp con precisión
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    timestamp_utc = Column(DateTime(timezone=True), nullable=False)
    
    # Usuario y sesión
    usuario_id = Column(String(36), index=True)
    usuario_email = Column(String(255))
    sesion_id = Column(String(100))
    ip_address = Column(String(45))
    user_agent = Column(Text)
    
    # Entidad afectada
    entidad_tipo = Column(String(100))  # titular_datos, consentimiento, etc.
    entidad_id = Column(String(36))
    entidad_descripcion = Column(String(500))
    
    # Acción realizada
    accion = Column(String(255), nullable=False)
    descripcion = Column(Text)
    
    # Datos de la operación
    datos_antes = Column(JSON)  # Estado anterior (para modificaciones)
    datos_despues = Column(JSON)  # Estado posterior
    cambios_realizados = Column(JSON)  # Diff de cambios
    
    # Resultado
    exitoso = Column(Boolean, nullable=False)
    codigo_error = Column(String(50))
    mensaje_error = Column(Text)
    
    # Contexto adicional
    modulo = Column(String(50))  # MOD-1, MOD-2, etc.
    funcionalidad = Column(String(100))
    metodo_api = Column(String(10))  # GET, POST, PUT, DELETE
    endpoint_api = Column(String(255))
    
    # Trazabilidad
    origen_request = Column(String(50))  # web, api, sistema, script
    request_id = Column(String(100))  # Para correlacionar eventos
    
    # Integridad
    hash_registro = Column(String(64), nullable=False)  # SHA-256 del registro
    hash_anterior = Column(String(64))  # Hash del registro anterior (blockchain-like)
    
    # Cumplimiento
    es_dato_personal = Column(Boolean, default=False)
    titular_afectado_id = Column(String(36))
    requiere_notificacion = Column(Boolean, default=False)
    
    # No se puede modificar ni eliminar
    __mapper_args__ = {
        'confirm_deleted_rows': False
    }
    
    def __repr__(self):
        return f"<LogAuditoria(evento_id={self.evento_id}, tipo={self.tipo_evento}, timestamp={self.timestamp})>"


class EventoSistema(TenantBaseModel):
    """
    Eventos de sistema agregados para análisis
    """
    __tablename__ = "eventos_sistema"
    
    # Periodo
    fecha = Column(DateTime(timezone=True), nullable=False, index=True)
    hora = Column(Integer, nullable=False)  # 0-23
    
    # Tipo de evento
    tipo_evento = Column(Enum(TipoEvento), nullable=False)
    modulo = Column(String(50))
    
    # Métricas
    total_eventos = Column(Integer, default=0)
    eventos_exitosos = Column(Integer, default=0)
    eventos_fallidos = Column(Integer, default=0)
    
    # Usuarios únicos
    usuarios_unicos = Column(Integer, default=0)
    sesiones_unicas = Column(Integer, default=0)
    
    # Performance
    tiempo_respuesta_promedio = Column(Integer)  # milisegundos
    tiempo_respuesta_max = Column(Integer)
    tiempo_respuesta_min = Column(Integer)
    
    # Detalles adicionales
    desglose_por_accion = Column(JSON)
    top_usuarios = Column(JSON)  # Top 10 usuarios por actividad
    errores_frecuentes = Column(JSON)
    
    def __repr__(self):
        return f"<EventoSistema(fecha={self.fecha}, tipo={self.tipo_evento})>"


class MetricaCumplimiento(TenantBaseModel):
    """
    Métricas de cumplimiento calculadas
    """
    __tablename__ = "metricas_cumplimiento"
    
    # Periodo
    periodo_inicio = Column(DateTime(timezone=True), nullable=False)
    periodo_fin = Column(DateTime(timezone=True), nullable=False)
    tipo_periodo = Column(String(20))  # diario, semanal, mensual, anual
    
    # Consentimientos
    total_consentimientos = Column(Integer, default=0)
    consentimientos_activos = Column(Integer, default=0)
    consentimientos_retirados = Column(Integer, default=0)
    tasa_retiro = Column(DECIMAL(5, 2))  # Porcentaje
    
    # ARCOPOL
    solicitudes_recibidas = Column(Integer, default=0)
    solicitudes_completadas = Column(Integer, default=0)
    solicitudes_en_plazo = Column(Integer, default=0)
    tiempo_respuesta_promedio = Column(Integer)  # días
    tasa_cumplimiento_plazo = Column(DECIMAL(5, 2))
    
    # Por tipo de solicitud
    solicitudes_acceso = Column(Integer, default=0)
    solicitudes_rectificacion = Column(Integer, default=0)
    solicitudes_cancelacion = Column(Integer, default=0)
    solicitudes_oposicion = Column(Integer, default=0)
    solicitudes_portabilidad = Column(Integer, default=0)
    
    # Brechas
    brechas_detectadas = Column(Integer, default=0)
    brechas_notificadas = Column(Integer, default=0)
    brechas_en_plazo = Column(Integer, default=0)
    titulares_afectados_brechas = Column(Integer, default=0)
    
    # DPIAs
    dpias_realizadas = Column(Integer, default=0)
    dpias_aprobadas = Column(Integer, default=0)
    proyectos_sin_dpia = Column(Integer, default=0)
    riesgos_altos_identificados = Column(Integer, default=0)
    
    # Transferencias
    transferencias_activas = Column(Integer, default=0)
    transferencias_nuevas = Column(Integer, default=0)
    paises_destino = Column(Integer, default=0)
    
    # Formación y concienciación
    usuarios_formados = Column(Integer, default=0)
    sesiones_formacion = Column(Integer, default=0)
    
    # Score general
    score_cumplimiento = Column(DECIMAL(5, 2))  # 0-100
    areas_mejora = Column(JSON)
    
    # Estado
    calculado_en = Column(DateTime(timezone=True))
    es_definitivo = Column(Boolean, default=False)
    
    def __repr__(self):
        return f"<MetricaCumplimiento(periodo={self.tipo_periodo}, score={self.score_cumplimiento})>"


class ReporteCumplimiento(TenantBaseModel):
    """
    Reportes de cumplimiento generados
    """
    __tablename__ = "reportes_cumplimiento"
    
    # Identificación
    codigo = Column(String(50), unique=True, nullable=False)
    nombre = Column(String(255), nullable=False)
    tipo_reporte = Column(Enum(TipoReporte), nullable=False)
    
    # Periodo
    periodo_inicio = Column(DateTime(timezone=True), nullable=False)
    periodo_fin = Column(DateTime(timezone=True), nullable=False)
    
    # Generación
    generado_por = Column(String(36), ForeignKey('users.id'))
    fecha_generacion = Column(DateTime(timezone=True), nullable=False)
    
    # Contenido
    resumen_ejecutivo = Column(Text)
    hallazgos_principales = Column(JSON)
    recomendaciones = Column(JSON)
    
    # Métricas incluidas
    metricas = Column(JSON)  # Snapshot de las métricas al momento
    graficos = Column(JSON)  # Configuración de gráficos incluidos
    
    # Destinatarios
    destinatarios = Column(JSON)  # Lista de emails/roles
    es_publico = Column(Boolean, default=False)
    requiere_aprobacion = Column(Boolean, default=True)
    
    # Aprobación
    aprobado = Column(Boolean, default=False)
    aprobado_por = Column(String(36))
    fecha_aprobacion = Column(DateTime(timezone=True))
    comentarios_aprobacion = Column(Text)
    
    # Archivo generado
    formato = Column(String(20))  # pdf, excel, word
    ruta_archivo = Column(String(500))
    tamano_archivo = Column(Integer)
    hash_archivo = Column(String(64))
    
    # Distribución
    enviado = Column(Boolean, default=False)
    fecha_envio = Column(DateTime(timezone=True))
    confirmaciones_lectura = Column(JSON)
    
    # Seguimiento
    acciones_requeridas = Column(JSON)
    fecha_seguimiento = Column(DateTime(timezone=True))
    
    # Firma digital
    firmado_digitalmente = Column(Boolean, default=False)
    firma_digital = Column(Text)
    certificado_firma = Column(Text)
    
    # Relaciones
    generador = relationship("User")
    
    def __repr__(self):
        return f"<ReporteCumplimiento(codigo={self.codigo}, tipo={self.tipo_reporte})>"