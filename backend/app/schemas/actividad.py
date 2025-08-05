from typing import List, Optional
from uuid import UUID
from pydantic import Field, validator

from app.schemas.base import BaseSchema, BaseResponseSchema


# Schemas para Categoría de Datos
class CategoriaDatoBase(BaseSchema):
    nombre: str = Field(..., max_length=255)
    descripcion: Optional[str] = None
    clasificacion_sensibilidad: str = Field(..., pattern="^(común|sensible|nna)$")
    ejemplos: Optional[List[str]] = []
    activo: bool = True


class CategoriaDatoCreate(CategoriaDatoBase):
    pass


class CategoriaDatoResponse(CategoriaDatoBase, BaseResponseSchema):
    organizacion_id: UUID


# Schemas para Categoría de Titulares
class CategoriaTitularBase(BaseSchema):
    nombre: str = Field(..., max_length=255)
    descripcion: Optional[str] = None
    es_nna: bool = False
    activo: bool = True


class CategoriaTitularCreate(CategoriaTitularBase):
    pass


class CategoriaTitularResponse(CategoriaTitularBase, BaseResponseSchema):
    organizacion_id: UUID


# Schemas para Sistema Activo
class SistemaActivoBase(BaseSchema):
    nombre: str = Field(..., max_length=255)
    tipo: str = Field(..., pattern="^(base_datos|aplicacion|archivo_fisico|servicio_cloud)$")
    descripcion: Optional[str] = None
    ubicacion: Optional[str] = None
    responsable_tecnico: Optional[UUID] = None
    nivel_seguridad: Optional[str] = Field(None, pattern="^(alto|medio|bajo)$")
    activo: bool = True


class SistemaActivoCreate(SistemaActivoBase):
    pass


class SistemaActivoResponse(SistemaActivoBase, BaseResponseSchema):
    organizacion_id: UUID


# Schemas para Destinatario
class DestinatarioBase(BaseSchema):
    nombre: str = Field(..., max_length=255)
    tipo: str = Field(..., pattern="^(interno|externo_encargado|externo_cesionario)$")
    rut: Optional[str] = Field(None, max_length=20)
    pais: str = Field(default="Chile", max_length=100)
    es_transferencia_internacional: bool = False
    garantias_transferencia: Optional[str] = None
    activo: bool = True


class DestinatarioCreate(DestinatarioBase):
    pass


class DestinatarioResponse(DestinatarioBase, BaseResponseSchema):
    organizacion_id: UUID


# Schemas para relaciones con Actividad
class ActividadDatoRelacion(BaseSchema):
    categoria_dato_id: UUID
    clasificacion_sensibilidad: str = Field(..., pattern="^(común|sensible|nna)$")
    detalle_datos: Optional[str] = None
    es_obligatorio: bool = False


class ActividadTitularRelacion(BaseSchema):
    categoria_titular_id: UUID
    cantidad_aproximada: Optional[str] = Field(None, pattern="^(1-100|100-1000|1000-10000|10000+)$")


class ActividadSistemaRelacion(BaseSchema):
    sistema_id: UUID
    tipo_uso: str = Field(..., pattern="^(almacenamiento|procesamiento|transmisión)$")


class ActividadFlujoRelacion(BaseSchema):
    destinatario_id: UUID
    proposito_transferencia: Optional[str] = None
    frecuencia: Optional[str] = Field(None, pattern="^(diaria|semanal|mensual|eventual)$")
    medio_transferencia: Optional[str] = Field(None, pattern="^(API|email|SFTP|manual)$")


# Schemas para Actividad de Tratamiento
class ActividadTratamientoBase(BaseSchema):
    codigo_actividad: str = Field(..., max_length=50, pattern="^[A-Z]{3}-\\d{3}$")
    nombre_actividad: str = Field(..., max_length=255)
    descripcion: Optional[str] = None
    responsable_proceso: UUID
    area_negocio: str = Field(..., max_length=100)
    finalidad_principal: str
    finalidades_adicionales: Optional[List[str]] = []
    base_licitud: str = Field(..., pattern="^(consentimiento|contrato|obligacion_legal|interes_vital|interes_publico|interes_legitimo)$")
    bases_licitud_adicionales: Optional[List[str]] = []
    plazo_conservacion_general: Optional[str] = None
    politica_eliminacion: Optional[str] = None
    medidas_seguridad_desc: Optional[str] = None
    
    @validator('codigo_actividad')
    def validar_codigo(cls, v):
        # Formato: XXX-001 (3 letras mayúsculas, guión, 3 dígitos)
        if not v or len(v) != 7:
            raise ValueError('El código debe tener formato XXX-001')
        return v.upper()


class ActividadTratamientoCreate(ActividadTratamientoBase):
    datos: List[ActividadDatoRelacion] = []
    titulares: List[ActividadTitularRelacion] = []
    sistemas: List[ActividadSistemaRelacion] = []
    flujos: List[ActividadFlujoRelacion] = []


class ActividadTratamientoUpdate(BaseSchema):
    nombre_actividad: Optional[str] = Field(None, max_length=255)
    descripcion: Optional[str] = None
    responsable_proceso: Optional[UUID] = None
    area_negocio: Optional[str] = Field(None, max_length=100)
    finalidad_principal: Optional[str] = None
    finalidades_adicionales: Optional[List[str]] = None
    base_licitud: Optional[str] = None
    bases_licitud_adicionales: Optional[List[str]] = None
    plazo_conservacion_general: Optional[str] = None
    politica_eliminacion: Optional[str] = None
    medidas_seguridad_desc: Optional[str] = None
    estado: Optional[str] = Field(None, pattern="^(borrador|revision|aprobado)$")


class ActividadTratamientoResponse(ActividadTratamientoBase, BaseResponseSchema):
    organizacion_id: UUID
    estado: str
    creado_por: Optional[UUID] = None
    actualizado_por: Optional[UUID] = None


class ActividadTratamientoDetalle(ActividadTratamientoResponse):
    datos: List[dict] = []
    titulares: List[dict] = []
    sistemas: List[dict] = []
    flujos: List[dict] = []