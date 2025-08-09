"""
Schemas para administración comercial
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, validator
from datetime import datetime


class PlanComercial(BaseModel):
    codigo: str
    nombre: str
    descripcion: str
    modulos: List[str]
    max_usuarios: int
    duracion_dias: int
    precio_clp: int

class EmpresaCreateRequest(BaseModel):
    # Datos empresa
    razon_social: str
    rut_empresa: str
    giro: str
    direccion: str
    comuna: str
    ciudad: str = "Santiago"
    
    # Contacto principal
    nombre_contacto: str
    email_contacto: EmailStr
    telefono_contacto: str
    cargo_contacto: str
    
    # Plan comercial
    tipo_plan: Optional[str] = None
    modulos_custom: Optional[List[str]] = None
    duracion_custom: Optional[int] = None
    max_usuarios: Optional[int] = None
    
    # Comercial
    descuento_porcentaje: float = 0
    observaciones_comerciales: Optional[str] = None
    
    @validator('descuento_porcentaje')
    def validar_descuento(cls, v):
        if v < 0 or v > 100:
            raise ValueError('Descuento debe estar entre 0 y 100')
        return v
    
    @validator('rut_empresa')
    def validar_rut(cls, v):
        # Validación básica de RUT chileno
        rut_clean = v.replace('.', '').replace('-', '')
        if not rut_clean:
            raise ValueError('RUT no puede estar vacío')
        return v

class EmpresaResponse(BaseModel):
    empresa_id: str
    tenant_id: str
    dominio: str
    licencia_id: str
    licencia_key: str
    modulos_activos: List[str]
    vigencia_hasta: str
    credenciales: Dict[str, str]

class GestionModulosRequest(BaseModel):
    accion: str  # agregar, quitar, extender
    modulos: List[str]
    duracion_dias: Optional[int] = None
    motivo: Optional[str] = None
    
    @validator('accion')
    def validar_accion(cls, v):
        if v not in ['agregar', 'quitar', 'extender']:
            raise ValueError('Acción debe ser: agregar, quitar o extender')
        return v

class MetricasGenerales(BaseModel):
    total_empresas_activas: int
    nuevas_empresas_periodo: int
    licencias_activas: int
    proximas_renovaciones_30d: int

class MetricasFinancieras(BaseModel):
    ingresos_periodo: float
    ticket_promedio: float

class Distribucion(BaseModel):
    empresas_por_plan: Dict[str, int]
    modulos_mas_vendidos: List[tuple]  # Lista de (modulo, cantidad)

class UsoPlataforma(BaseModel):
    modulos: Dict[str, Dict[str, Any]]

class Alertas(BaseModel):
    renovaciones_proximas: int
    empresas_sin_uso_30d: int

class DashboardComercialResponse(BaseModel):
    periodo: Dict[str, str]
    metricas_generales: MetricasGenerales
    metricas_financieras: MetricasFinancieras
    distribucion: Distribucion
    uso_plataforma: UsoPlataforma
    alertas: Alertas

class EmpresaListItem(BaseModel):
    id: str
    rut: str
    razon_social: str
    comuna: str
    email_contacto: str
    fecha_creacion: datetime
    plan_actual: Optional[str]
    estado: str
    modulos_activos: int
    usuarios_activos: int
    ultima_actividad: Optional[datetime]

class EmpresaDetalle(BaseModel):
    id: str
    tenant_id: str
    rut: str
    razon_social: str
    giro: str
    direccion: str
    comuna: str
    ciudad: str
    telefono: str
    email_contacto: str
    sitio_web: Optional[str]
    cantidad_empleados: int
    es_activa: bool
    fecha_creacion: datetime
    fecha_actualizacion: Optional[datetime]
    
    # Info comercial
    plan_actual: Optional[str]
    licencia_activa: bool
    fecha_vencimiento: Optional[datetime]
    precio_pagado: Optional[float]
    descuento_aplicado: Optional[float]
    
    # Módulos
    modulos_contratados: List[Dict[str, Any]]
    
    # Uso
    usuarios_registrados: int
    usuarios_activos_30d: int
    sesiones_ultimo_mes: int
    tiempo_uso_total_horas: float
    
    # Contacto
    contacto_principal: Dict[str, str]
    metadata: Optional[Dict[str, Any]]

class AlertaComercial(BaseModel):
    id: str
    tipo: str  # renovacion, uso_bajo, pago_pendiente, etc
    prioridad: str  # alta, media, baja
    mensaje: str
    empresa_id: Optional[str]
    empresa_nombre: Optional[str]
    fecha_creacion: datetime
    fecha_limite: Optional[datetime]
    resuelto: bool = False
    acciones_sugeridas: Optional[List[str]]

class NotificacionRenovacion(BaseModel):
    empresa_id: str
    empresa_nombre: str
    email_contacto: str
    dias_restantes: int
    modulos_por_vencer: List[str]
    valor_renovacion: float
    enviado: bool
    fecha_envio: Optional[datetime]
    respuesta_cliente: Optional[str]

class ConfiguracionComercial(BaseModel):
    """Configuración del sistema comercial"""
    
    # Precios
    descuento_maximo_permitido: float = 30.0
    precio_usuario_adicional: int = 5000  # CLP por mes
    
    # Notificaciones
    dias_aviso_renovacion: List[int] = [30, 15, 7, 1]
    dias_gracia_post_vencimiento: int = 7
    
    # Límites
    max_usuarios_por_empresa: int = 500
    max_modulos_simultaneos: int = 7
    
    # Integración
    webhook_pagos: Optional[str] = None
    api_facturacion: Optional[str] = None
    
    # Reportes automáticos
    frecuencia_reporte_uso: str = "semanal"  # diario, semanal, mensual
    emails_reporte: List[EmailStr] = []

class EstadisticasVenta(BaseModel):
    periodo: str
    ventas_totales: int
    ingresos_totales: float
    ticket_promedio: float
    conversion_leads: float
    tiempo_promedio_cierre_dias: float
    
    # Por canal
    ventas_por_canal: Dict[str, int]
    
    # Por plan
    ventas_por_plan: Dict[str, int]
    
    # Por módulo
    modulos_mas_vendidos: Dict[str, int]
    
    # Tendencias
    crecimiento_mes_anterior: float  # porcentaje
    proyeccion_mes_siguiente: float

class MetricaUso(BaseModel):
    modulo_codigo: str
    modulo_nombre: str
    empresas_con_acceso: int
    empresas_activas: int  # Con uso en último mes
    usuarios_unicos: int
    sesiones_totales: int
    tiempo_promedio_sesion_minutos: float
    tasa_adopcion: float  # porcentaje de empresas que lo usan
    tasa_satisfaccion: Optional[float]  # Si hay encuestas