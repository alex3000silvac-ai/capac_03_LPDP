from typing import List, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import verify_token

router = APIRouter()
security = HTTPBearer()

class SimpleUser:
    def __init__(self, username: str, first_name: str = "", last_name: str = ""):
        self.id = username
        self.username = username
        self.first_name = first_name
        self.last_name = last_name

def get_simple_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Obtiene el usuario actual desde el token JWT (versión simplificada)"""
    try:
        payload = verify_token(credentials.credentials)
        if not payload:
            raise HTTPException(status_code=401, detail="Token inválido")
        
        return SimpleUser(
            username=payload.get("username", "usuario"),
            first_name=payload.get("first_name", ""),
            last_name=payload.get("last_name", "")
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail="Error de autenticación")

# Guías de entrevista predefinidas por área
GUIAS_ENTREVISTA = {
    "RRHH": [
        {
            "clave": "identificar_actividad",
            "fase": "1",
            "pregunta": "Describe una de las principales funciones de tu área. Por ejemplo, ¿cómo se gestiona una postulación a un trabajo?",
            "objetivo": "Nombre de la Actividad",
            "ejemplos": ["Reclutamiento y Selección", "Gestión de Nómina", "Evaluación de Desempeño"],
            "tipo_respuesta": "texto"
        },
        {
            "clave": "entender_proposito",
            "fase": "2", 
            "pregunta": "¿Por qué realizan esta actividad? ¿Qué objetivo de negocio cumple? ¿Están obligados por alguna ley?",
            "objetivo": "Finalidad y Base de Licitud",
            "ejemplos": ["Evaluar idoneidad de candidatos", "Cumplir obligaciones laborales"],
            "tipo_respuesta": "texto"
        },
        {
            "clave": "listar_datos",
            "fase": "3",
            "pregunta": "Para este proceso, ¿qué información específica necesitan de la persona? (nombre, RUT, teléfono, historial, etc.)",
            "objetivo": "Categorías de Datos",
            "ejemplos": ["Datos personales", "Historial laboral", "Datos de salud"],
            "tipo_respuesta": "multiple"
        }
    ],
    "FINANZAS": [
        {
            "clave": "identificar_actividad",
            "fase": "1",
            "pregunta": "Describe el proceso financiero principal de tu área. Por ejemplo, ¿cómo procesan los pagos a proveedores?",
            "objetivo": "Nombre de la Actividad",
            "ejemplos": ["Cuentas por Pagar", "Facturación", "Control de Crédito"],
            "tipo_respuesta": "texto"
        },
        {
            "clave": "entender_proposito", 
            "fase": "2",
            "pregunta": "¿Por qué realizan esta actividad? ¿Qué objetivo financiero cumple?",
            "objetivo": "Finalidad y Base de Licitud",
            "ejemplos": ["Pagar obligaciones", "Generar ingresos", "Controlar riesgos"],
            "tipo_respuesta": "texto"
        }
    ],
    "VENTAS": [
        {
            "clave": "identificar_actividad",
            "fase": "1", 
            "pregunta": "Describe el proceso de ventas principal. Por ejemplo, ¿cómo gestionan a un cliente potencial?",
            "objetivo": "Nombre de la Actividad",
            "ejemplos": ["Prospección", "Cotización", "Venta y Facturación"],
            "tipo_respuesta": "texto"
        },
        {
            "clave": "entender_proposito",
            "fase": "2",
            "pregunta": "¿Por qué realizan esta actividad? ¿Qué objetivo comercial cumple?",
            "objetivo": "Finalidad y Base de Licitud", 
            "ejemplos": ["Generar ventas", "Fidelizar clientes", "Expandir mercado"],
            "tipo_respuesta": "texto"
        }
    ]
}

@router.get("/guias")
def listar_guias_entrevista():
    """Obtener guías de entrevista por área (público)"""
    return {
        "areas": list(GUIAS_ENTREVISTA.keys()),
        "guias": GUIAS_ENTREVISTA
    }

@router.get("/guias/{area}")
def obtener_guia_por_area(area: str):
    """Obtener guía específica por área"""
    area_upper = area.upper()
    if area_upper not in GUIAS_ENTREVISTA:
        raise HTTPException(status_code=404, detail="Área no encontrada")
    
    return {
        "area": area_upper,
        "preguntas": GUIAS_ENTREVISTA[area_upper]
    }

@router.post("/sesiones")
def crear_sesion_entrevista(
    area: str,
    entrevistado: str,
    current_user: SimpleUser = Depends(get_simple_current_user)
):
    """Crear nueva sesión de entrevista"""
    area_upper = area.upper()
    if area_upper not in GUIAS_ENTREVISTA:
        raise HTTPException(status_code=404, detail="Área no encontrada")
    
    # Simular creación de sesión
    sesion_id = f"sesion_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    return {
        "sesion_id": sesion_id,
        "area": area_upper,
        "entrevistado": entrevistado,
        "entrevistador": current_user.username,
        "fecha_creacion": datetime.now().isoformat(),
        "estado": "iniciada",
        "preguntas": GUIAS_ENTREVISTA[area_upper]
    }

@router.post("/sesiones/{sesion_id}/respuestas")
def guardar_respuesta(
    sesion_id: str,
    pregunta_clave: str,
    respuesta: str,
    current_user: SimpleUser = Depends(get_simple_current_user)
):
    """Guardar respuesta a una pregunta de entrevista"""
    
    return {
        "mensaje": "Respuesta guardada exitosamente",
        "sesion_id": sesion_id,
        "pregunta_clave": pregunta_clave,
        "respuesta": respuesta,
        "usuario": current_user.username,
        "timestamp": datetime.now().isoformat()
    }

@router.get("/sesiones/{sesion_id}")
def obtener_sesion(
    sesion_id: str,
    current_user: SimpleUser = Depends(get_simple_current_user)
):
    """Obtener detalles de una sesión de entrevista"""
    
    return {
        "sesion_id": sesion_id,
        "estado": "en_progreso", 
        "respuestas_completadas": 0,
        "total_preguntas": 3,
        "ultima_actualizacion": datetime.now().isoformat()
    }

@router.get("/plantillas")
def obtener_plantillas_entrevista():
    """Obtener plantillas y formatos de entrevista (público)"""
    return {
        "plantillas": [
            {
                "nombre": "Entrevista Básica LPDP",
                "descripcion": "Plantilla estándar para levantamiento de actividades",
                "areas_aplicables": ["RRHH", "FINANZAS", "VENTAS", "OPERACIONES"],
                "duracion_estimada": "45-60 minutos"
            },
            {
                "nombre": "Entrevista Técnica",
                "descripcion": "Para áreas con procesamiento técnico de datos",
                "areas_aplicables": ["IT", "SISTEMAS", "DESARROLLO"],
                "duracion_estimada": "60-90 minutos"
            },
            {
                "nombre": "Entrevista Comercial",
                "descripcion": "Enfocada en actividades de ventas y marketing",
                "areas_aplicables": ["VENTAS", "MARKETING", "ATENCION_CLIENTE"],
                "duracion_estimada": "30-45 minutos"
            }
        ]
    }

@router.get("/formatos")
def obtener_formatos_documentos():
    """Obtener formatos y ejemplos prácticos (público)"""
    return {
        "formatos": [
            {
                "tipo": "actividad_tratamiento",
                "nombre": "Formato Actividad de Tratamiento",
                "descripcion": "Plantilla para documentar actividades según LPDP",
                "campos": [
                    "nombre_actividad",
                    "finalidad",
                    "base_licitud", 
                    "categorias_datos",
                    "categorias_titulares",
                    "destinatarios",
                    "transferencias"
                ]
            },
            {
                "tipo": "registro_tratamiento",
                "nombre": "Registro de Actividades de Tratamiento",
                "descripcion": "Formato completo según Art. 29 LPDP",
                "campos": [
                    "responsable_tratamiento",
                    "contacto_dpo",
                    "finalidades",
                    "descripcion_categorias",
                    "destinatarios_comunicacion",
                    "transferencias_internacionales",
                    "plazos_supresion",
                    "medidas_seguridad"
                ]
            }
        ],
        "ejemplos": [
            {
                "actividad": "Gestión de Nómina",
                "area": "RRHH",
                "datos_ejemplo": ["Nombre", "RUT", "Datos bancarios", "Sueldo"],
                "finalidad": "Calcular y pagar remuneraciones",
                "base_licitud": "Ejecución de contrato laboral"
            },
            {
                "actividad": "Facturación a Clientes", 
                "area": "FINANZAS",
                "datos_ejemplo": ["Razón social", "RUT", "Dirección", "Contacto"],
                "finalidad": "Emisión de facturas por ventas",
                "base_licitud": "Ejecución de contrato comercial"
            }
        ]
    }