"""
📋 ESQUEMAS RAT - Modelos Pydantic para RATs
Esquemas completos para validación de datos RAT según Ley 21.719
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class EstadoRAT(str, Enum):
    BORRADOR = "BORRADOR"
    EN_REVISION = "EN_REVISION"
    PENDIENTE_APROBACION = "PENDIENTE_APROBACION"
    CERTIFICADO = "CERTIFICADO"
    ELIMINADO = "ELIMINADO"


class NivelRiesgo(str, Enum):
    BAJO = "BAJO"
    MEDIO = "MEDIO"
    ALTO = "ALTO"
    CRITICO = "CRITICO"


class TipoTratamiento(str, Enum):
    RECOPILACION = "RECOPILACION"
    ALMACENAMIENTO = "ALMACENAMIENTO"
    UTILIZACION = "UTILIZACION"
    COMUNICACION = "COMUNICACION"
    DESTRUCCION = "DESTRUCCION"


class BaseRAT(BaseModel):
    """Esquema base para RAT"""
    nombre_actividad: str = Field(..., min_length=5, max_length=200, description="Nombre de la actividad de tratamiento")
    descripcion: Optional[str] = Field(None, max_length=1000, description="Descripción detallada de la actividad")
    finalidad: str = Field(..., min_length=10, max_length=500, description="Finalidad del tratamiento")
    responsable_proceso: str = Field(..., min_length=5, max_length=100, description="Responsable del proceso")
    area_responsable: str = Field(..., min_length=3, max_length=100, description="Área responsable")
    
    # Datos tratados
    tipos_datos: List[str] = Field(..., min_items=1, description="Tipos de datos personales tratados")
    categorias_titulares: List[str] = Field(..., min_items=1, description="Categorías de titulares")
    
    # Base legal
    base_legal: str = Field(..., description="Base legal para el tratamiento")
    base_legal_detalle: Optional[str] = Field(None, max_length=500, description="Detalle de la base legal")
    
    # Operaciones de tratamiento
    tipos_tratamiento: List[TipoTratamiento] = Field(..., min_items=1, description="Tipos de tratamiento realizados")
    
    # Destinatarios
    destinatarios_internos: Optional[List[str]] = Field(None, description="Destinatarios internos")
    destinatarios_externos: Optional[List[str]] = Field(None, description="Destinatarios externos")
    
    # Transferencias
    transferencias_internacionales: bool = Field(False, description="¿Se realizan transferencias internacionales?")
    paises_destino: Optional[List[str]] = Field(None, description="Países de destino de transferencias")
    garantias_transferencia: Optional[str] = Field(None, description="Garantías para transferencias internacionales")
    
    # Medidas de seguridad
    medidas_tecnicas: Optional[List[str]] = Field(None, description="Medidas técnicas de seguridad")
    medidas_organizativas: Optional[List[str]] = Field(None, description="Medidas organizativas de seguridad")
    
    # Plazos
    plazo_conservacion: str = Field(..., description="Plazo de conservación de datos")
    criterios_eliminacion: Optional[str] = Field(None, description="Criterios para eliminación de datos")
    
    # Metadatos
    industria: Optional[str] = Field(None, description="Industria o sector")
    nivel_riesgo: Optional[NivelRiesgo] = Field(NivelRiesgo.MEDIO, description="Nivel de riesgo evaluado")
    requiere_eipd: bool = Field(False, description="¿Requiere EIPD/DPIA?")
    
    @validator('tipos_datos')
    def validate_tipos_datos(cls, v):
        """Validar que los tipos de datos sean válidos"""
        tipos_validos = [
            "identificacion", "contacto", "financieros", "laborales", 
            "salud", "biometricos", "localizacion", "navegacion",
            "preferencias", "comportamiento", "sensibles_especiales"
        ]
        
        for tipo in v:
            if tipo not in tipos_validos:
                raise ValueError(f"Tipo de dato inválido: {tipo}. Tipos válidos: {tipos_validos}")
        
        return v
    
    @validator('base_legal')
    def validate_base_legal(cls, v):
        """Validar base legal según Ley 21.719"""
        bases_validas = [
            "consentimiento_titular",
            "ejecucion_contrato",
            "cumplimiento_obligacion_legal",
            "proteccion_intereses_vitales",
            "interes_publico",
            "interes_legitimo"
        ]
        
        if v not in bases_validas:
            raise ValueError(f"Base legal inválida: {v}. Bases válidas: {bases_validas}")
        
        return v


class RATCreate(BaseRAT):
    """Esquema para crear RAT"""
    pass


class RATUpdate(BaseModel):
    """Esquema para actualizar RAT"""
    nombre_actividad: Optional[str] = Field(None, min_length=5, max_length=200)
    descripcion: Optional[str] = Field(None, max_length=1000)
    finalidad: Optional[str] = Field(None, min_length=10, max_length=500)
    responsable_proceso: Optional[str] = Field(None, min_length=5, max_length=100)
    area_responsable: Optional[str] = Field(None, min_length=3, max_length=100)
    
    tipos_datos: Optional[List[str]] = Field(None, min_items=1)
    categorias_titulares: Optional[List[str]] = Field(None, min_items=1)
    
    base_legal: Optional[str] = Field(None)
    base_legal_detalle: Optional[str] = Field(None, max_length=500)
    
    tipos_tratamiento: Optional[List[TipoTratamiento]] = Field(None, min_items=1)
    
    destinatarios_internos: Optional[List[str]] = Field(None)
    destinatarios_externos: Optional[List[str]] = Field(None)
    
    transferencias_internacionales: Optional[bool] = Field(None)
    paises_destino: Optional[List[str]] = Field(None)
    garantias_transferencia: Optional[str] = Field(None)
    
    medidas_tecnicas: Optional[List[str]] = Field(None)
    medidas_organizativas: Optional[List[str]] = Field(None)
    
    plazo_conservacion: Optional[str] = Field(None)
    criterios_eliminacion: Optional[str] = Field(None)
    
    industria: Optional[str] = Field(None)
    nivel_riesgo: Optional[NivelRiesgo] = Field(None)
    requiere_eipd: Optional[bool] = Field(None)


class RATResponse(BaseRAT):
    """Esquema de respuesta para RAT"""
    id: int
    tenant_id: str
    estado: EstadoRAT
    version: int
    
    # Metadatos de creación
    created_by: str
    created_at: datetime
    updated_at: datetime
    
    # Metadatos de certificación
    certified_at: Optional[datetime] = None
    certified_by: Optional[str] = None
    certification_notes: Optional[str] = None
    
    # Análisis inteligente
    alertas_compliance: Optional[List[str]] = Field(None, description="Alertas de compliance detectadas")
    documentos_requeridos: Optional[List[str]] = Field(None, description="Documentos adicionales requeridos")
    last_analysis: Optional[datetime] = Field(None, description="Última vez que se ejecutó análisis IA")
    
    # EIPD asociada
    eipd_id: Optional[int] = Field(None, description="ID de EIPD asociada")
    eipd_completada: bool = Field(False, description="¿EIPD completada?")
    eipd_approved_at: Optional[datetime] = Field(None, description="Fecha aprobación EIPD")
    
    class Config:
        from_attributes = True


class RATListResponse(BaseModel):
    """Respuesta para lista de RATs con paginación"""
    rats: List[RATResponse]
    total: int
    page: int
    limit: int
    has_next: bool = False


class RATBulkUpdate(BaseModel):
    """Esquema para actualización masiva de RATs"""
    rat_ids: List[int] = Field(..., min_items=1, max_items=100)
    update_data: Dict[str, Any] = Field(..., description="Datos a actualizar")
    
    @validator('update_data')
    def validate_update_data(cls, v):
        """Validar que los datos de actualización sean seguros"""
        # Campos que no se pueden actualizar masivamente
        forbidden_fields = ["id", "tenant_id", "created_by", "created_at", "hash"]
        
        for field in forbidden_fields:
            if field in v:
                raise ValueError(f"Campo {field} no puede ser actualizado masivamente")
        
        return v


class RATAnalysisRequest(BaseModel):
    """Esquema para solicitar análisis de RAT"""
    include_compliance_check: bool = Field(True, description="Incluir verificación de compliance")
    include_risk_assessment: bool = Field(True, description="Incluir evaluación de riesgo")
    include_eipd_recommendation: bool = Field(True, description="Incluir recomendación EIPD")
    custom_criteria: Optional[Dict[str, Any]] = Field(None, description="Criterios personalizados de análisis")


class RATAnalysisResponse(BaseModel):
    """Respuesta de análisis de RAT"""
    rat_id: int
    analysis_timestamp: datetime
    
    # Resultados del análisis
    nivel_riesgo: NivelRiesgo
    requiere_eipd: bool
    compliance_score: float = Field(..., ge=0, le=100, description="Puntuación de compliance 0-100")
    
    # Alertas y recomendaciones
    alertas_compliance: List[str] = Field(default_factory=list)
    documentos_requeridos: List[str] = Field(default_factory=list)
    recomendaciones: List[str] = Field(default_factory=list)
    
    # Análisis detallado
    analisis_detallado: Dict[str, Any] = Field(default_factory=dict, description="Análisis detallado por módulo")
    
    # Próximos pasos
    next_steps: List[str] = Field(default_factory=list, description="Próximos pasos recomendados")


class RATExportRequest(BaseModel):
    """Esquema para exportar RAT"""
    format: str = Field(..., regex="^(pdf|excel|json|xml)$", description="Formato de exportación")
    include_versions: bool = Field(False, description="Incluir historial de versiones")
    include_audit_trail: bool = Field(False, description="Incluir trazabilidad de auditoría")
    template_style: str = Field("standard", regex="^(standard|legal|executive)$", description="Estilo de plantilla")


class RATCertificationRequest(BaseModel):
    """Esquema para certificación de RAT"""
    certification_notes: Optional[str] = Field(None, max_length=1000, description="Notas de certificación del DPO")
    compliance_checklist: Dict[str, bool] = Field(..., description="Checklist de compliance completado")
    additional_requirements: Optional[List[str]] = Field(None, description="Requisitos adicionales identificados")
    
    @validator('compliance_checklist')
    def validate_checklist(cls, v):
        """Validar que el checklist esté completo"""
        required_checks = [
            "datos_identificados_correctamente",
            "base_legal_apropiada", 
            "medidas_seguridad_adecuadas",
            "plazo_conservacion_definido",
            "transferencias_documentadas",
            "derechos_titulares_garantizados"
        ]
        
        for check in required_checks:
            if check not in v:
                raise ValueError(f"Falta verificación requerida: {check}")
            if not v[check]:
                raise ValueError(f"Verificación {check} debe estar marcada como completada")
        
        return v


class RATVersion(BaseModel):
    """Esquema para versión de RAT"""
    id: int
    rat_id: int
    version_number: int
    data_snapshot: Dict[str, Any]
    change_summary: str
    updated_by: str
    updated_at: datetime
    
    class Config:
        from_attributes = True


class RATVersionsResponse(BaseModel):
    """Respuesta de historial de versiones"""
    rat_id: int
    versions: List[RATVersion]
    total_versions: int
    current_version: int


class RATStatistics(BaseModel):
    """Estadísticas de RATs"""
    total_rats: int
    por_estado: Dict[str, int]
    por_industria: Dict[str, int]
    por_nivel_riesgo: Dict[str, int]
    requieren_eipd: int
    certificados: int
    borradores: int
    ultimos_30_dias: int
    promedio_tiempo_completar: str
    
    class Config:
        from_attributes = True


class RATSearchRequest(BaseModel):
    """Esquema para búsqueda avanzada de RATs"""
    q: Optional[str] = Field(None, description="Búsqueda en texto completo")
    estado: Optional[EstadoRAT] = Field(None)
    industria: Optional[str] = Field(None)
    nivel_riesgo: Optional[NivelRiesgo] = Field(None)
    requiere_eipd: Optional[bool] = Field(None)
    created_after: Optional[datetime] = Field(None)
    created_before: Optional[datetime] = Field(None)
    responsable: Optional[str] = Field(None)
    
    # Opciones de búsqueda
    exact_match: bool = Field(False, description="Búsqueda exacta")
    include_deleted: bool = Field(False, description="Incluir RATs eliminados")
    order_by: str = Field("updated_at", regex="^(created_at|updated_at|nombre_actividad|estado)$")
    order_direction: str = Field("desc", regex="^(asc|desc)$")


class RATSearchResponse(BaseModel):
    """Respuesta de búsqueda de RATs"""
    results: List[RATResponse]
    total_found: int
    search_params: RATSearchRequest
    pagination: Dict[str, int]
    suggestions: Optional[List[str]] = Field(None, description="Sugerencias de búsqueda")


class RATDuplicateRequest(BaseModel):
    """Esquema para duplicar RAT"""
    new_name: Optional[str] = Field(None, description="Nuevo nombre para la copia")
    copy_data_flows: bool = Field(True, description="Copiar flujos de datos")
    copy_security_measures: bool = Field(True, description="Copiar medidas de seguridad")
    reset_approval_status: bool = Field(True, description="Resetear estado de aprobación")


# Esquemas para validaciones específicas de Chile
class ChileanCompanyInfo(BaseModel):
    """Información específica de empresa chilena"""
    rut: str = Field(..., regex=r"^\d{7,8}-[\dkK]$", description="RUT formato chileno")
    razon_social: str = Field(..., min_length=5, max_length=200)
    giro_comercial: str = Field(..., min_length=5, max_length=200)
    direccion: str = Field(..., min_length=10, max_length=300)
    region: str = Field(..., description="Región de Chile")
    comuna: str = Field(..., description="Comuna")


class LegalBasisValidation(BaseModel):
    """Validación de base legal según Ley 21.719"""
    base_legal: str
    justification: str = Field(..., min_length=20, max_length=1000)
    article_reference: Optional[str] = Field(None, description="Referencia específica al artículo de ley")
    supporting_documents: Optional[List[str]] = Field(None, description="Documentos de soporte")
    
    @validator('base_legal')
    def validate_chilean_legal_basis(cls, v):
        """Validar que la base legal sea reconocida en Chile"""
        bases_chile = [
            "consentimiento_titular",
            "ejecucion_contrato", 
            "cumplimiento_obligacion_legal",
            "proteccion_intereses_vitales",
            "interes_publico",
            "interes_legitimo"
        ]
        
        if v not in bases_chile:
            raise ValueError(f"Base legal no reconocida en Chile: {v}")
        
        return v


# Esquemas de respuesta enriquecidos
class RATWithCompliance(RATResponse):
    """RAT con información de compliance adicional"""
    compliance_status: Dict[str, Any] = Field(default_factory=dict)
    pending_actions: List[str] = Field(default_factory=list)
    dpo_notes: Optional[str] = Field(None)
    last_compliance_review: Optional[datetime] = Field(None)
    next_review_due: Optional[datetime] = Field(None)


class RATExportResponse(BaseModel):
    """Respuesta de exportación de RAT"""
    rat_id: int
    export_format: str
    download_url: str
    expires_at: datetime
    file_size_bytes: Optional[int] = Field(None)
    export_includes: List[str] = Field(default_factory=list)
    generated_at: datetime