from typing import List, Optional, Dict
from uuid import UUID
from datetime import datetime
from pydantic import Field

from app.schemas.base import BaseSchema, BaseResponseSchema


# Schemas para Respuesta de Entrevista
class RespuestaEntrevistaBase(BaseSchema):
    pregunta_clave: str = Field(..., max_length=100)
    respuesta: str
    actividad_id: Optional[UUID] = None
    orden: int = Field(..., ge=1)


class RespuestaEntrevistaCreate(RespuestaEntrevistaBase):
    pass


class RespuestaEntrevistaResponse(RespuestaEntrevistaBase, BaseResponseSchema):
    sesion_id: UUID


# Schemas para Sesión de Entrevista
class SesionEntrevistaBase(BaseSchema):
    entrevistado_id: UUID
    area_negocio: str = Field(..., max_length=100)
    notas: Optional[str] = None


class SesionEntrevistaCreate(SesionEntrevistaBase):
    pass


class SesionEntrevistaUpdate(BaseSchema):
    estado: Optional[str] = Field(None, pattern="^(programada|en_progreso|completada|cancelada)$")
    notas: Optional[str] = None
    duracion_minutos: Optional[int] = Field(None, ge=1)


class SesionEntrevistaResponse(SesionEntrevistaBase, BaseResponseSchema):
    organizacion_id: UUID
    entrevistador_id: UUID
    estado: str
    duracion_minutos: Optional[int] = None
    entrevistador_nombre: Optional[str] = None
    entrevistado_nombre: Optional[str] = None


# Schema para Guía de Entrevista
class PreguntaGuia(BaseSchema):
    clave: str
    fase: str
    pregunta: str
    objetivo: str
    ejemplos: List[str] = []
    tipo_respuesta: str = Field(..., pattern="^(texto|seleccion|multiple)$")
    opciones: Optional[List[str]] = None


class GuiaEntrevista(BaseSchema):
    area_negocio: str
    preguntas: List[PreguntaGuia]
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "area_negocio": "RRHH",
                "preguntas": [
                    {
                        "clave": "identificar_actividad",
                        "fase": "1",
                        "pregunta": "Describe una de las principales funciones de tu área",
                        "objetivo": "Nombre de la Actividad",
                        "ejemplos": ["Reclutamiento y Selección", "Gestión de Nómina"],
                        "tipo_respuesta": "texto"
                    },
                    {
                        "clave": "entender_proposito",
                        "fase": "2",
                        "pregunta": "¿Por qué realizan esta actividad?",
                        "objetivo": "Finalidad y Base de Licitud",
                        "ejemplos": ["Evaluar candidatos", "Cumplir obligación legal"],
                        "tipo_respuesta": "texto"
                    }
                ]
            }
        }
    }