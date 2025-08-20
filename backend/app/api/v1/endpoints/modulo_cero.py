"""
Endpoints para el Módulo Cero - Mapeo rápido de datos LPDP
"""
from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_master_db
from app.core.dependencies import get_current_user

router = APIRouter()

# Schemas para el Módulo Cero
class MapeoSimplificado(BaseModel):
    proceso: str
    area: str
    finalidades: List[str]
    datos_comunes: List[str]
    datos_sensibles: List[str]
    retencion: Dict[str, str]
    destinatarios: Dict[str, List[str]]
    usuario_id: str = None
    tiempo_completado: int = 0  # en minutos

class ResultadoMapeo(BaseModel):
    mapeo_id: str
    proceso_nombre: str
    nivel_cumplimiento: int
    nivel_riesgo: str
    documentos_generados: List[str]
    siguiente_paso: str
    resumen: Dict[str, Any]

@router.get("/procesos-ejemplo")
async def get_procesos_ejemplo():
    """
    Obtiene los procesos de ejemplo para el Módulo Cero
    """
    procesos = [
        {
            "id": "rrhh_contratacion",
            "nombre": "Contratación de Personal",
            "area": "Recursos Humanos",
            "icono": "👥",
            "descripcion": "Proceso completo de reclutamiento y selección",
            "finalidades_sugeridas": [
                "Evaluar idoneidad del candidato",
                "Verificar antecedentes y referencias",
                "Cumplir obligaciones legales laborales",
                "Gestionar proceso de onboarding"
            ],
            "datos_tipicos": {
                "comunes": ["nombre", "rut", "email", "telefono", "cv"],
                "sensibles": ["antecedentes_penales", "examenes_medicos"]
            },
            "retencion_sugerida": {
                "durante": "contractual",
                "despues": "5_anos",
                "justificacion": "Código del Trabajo, Art. 160"
            }
        },
        {
            "id": "marketing_newsletter",
            "nombre": "Newsletter y Promociones",
            "area": "Marketing",
            "icono": "📧",
            "descripcion": "Envío de campañas promocionales por email",
            "finalidades_sugeridas": [
                "Enviar promociones y ofertas",
                "Informar sobre productos/servicios",
                "Fidelizar clientes existentes",
                "Segmentar audiencias"
            ],
            "datos_tipicos": {
                "comunes": ["nombre", "email", "preferencias"],
                "sensibles": []
            },
            "retencion_sugerida": {
                "durante": "activa",
                "despues": "2_anos",
                "justificacion": "Consentimiento del titular"
            }
        },
        {
            "id": "ventas_clientes",
            "nombre": "Gestión de Clientes",
            "area": "Ventas",
            "icono": "💼",
            "descripcion": "Administración de cartera de clientes",
            "finalidades_sugeridas": [
                "Gestionar relación comercial",
                "Procesar órdenes de compra",
                "Facturación y cobranza",
                "Análisis de comportamiento"
            ],
            "datos_tipicos": {
                "comunes": ["razon_social", "rut_empresa", "contacto", "direccion"],
                "sensibles": ["situacion_financiera"]
            },
            "retencion_sugerida": {
                "durante": "contractual",
                "despues": "10_anos",
                "justificacion": "Obligaciones tributarias"
            }
        },
        {
            "id": "operaciones_calidad",
            "nombre": "Control de Calidad",
            "area": "Operaciones",
            "icono": "🏭",
            "descripcion": "Monitoreo de procesos productivos",
            "finalidades_sugeridas": [
                "Monitorear procesos productivos",
                "Asegurar cumplimiento de normas",
                "Trazabilidad de productos",
                "Mejora continua"
            ],
            "datos_tipicos": {
                "comunes": ["operador", "turno", "parametros", "resultados"],
                "sensibles": []
            },
            "retencion_sugerida": {
                "durante": "activa",
                "despues": "5_anos",
                "justificacion": "Normas de calidad ISO"
            }
        }
    ]
    
    return {"procesos": procesos}

@router.get("/categorias-datos")
async def get_categorias_datos():
    """
    Obtiene las categorías de datos disponibles
    """
    return {
        "datos_comunes": [
            {"id": "nombre", "label": "Nombre completo", "categoria": "identificacion"},
            {"id": "rut", "label": "RUT", "categoria": "identificacion"},
            {"id": "email", "label": "Correo electrónico", "categoria": "contacto"},
            {"id": "telefono", "label": "Teléfono", "categoria": "contacto"},
            {"id": "direccion", "label": "Dirección", "categoria": "contacto"},
            {"id": "fecha_nacimiento", "label": "Fecha de nacimiento", "categoria": "personal"},
            {"id": "cv", "label": "Curriculum vitae", "categoria": "laboral"},
            {"id": "referencias", "label": "Referencias laborales", "categoria": "laboral"}
        ],
        "datos_sensibles": [
            {"id": "salud", "label": "Datos de salud", "categoria": "medico", "requiere_consentimiento": True},
            {"id": "antecedentes", "label": "Antecedentes penales", "categoria": "judicial", "requiere_consentimiento": True},
            {"id": "situacion_economica", "label": "Situación socioeconómica", "categoria": "financiero", "chile_especifico": True},
            {"id": "biometricos", "label": "Datos biométricos", "categoria": "biometrico", "requiere_consentimiento": True},
            {"id": "afiliacion_sindical", "label": "Afiliación sindical", "categoria": "laboral", "requiere_consentimiento": True}
        ]
    }

@router.post("/generar-mapeo", response_model=ResultadoMapeo)
async def generar_mapeo_simplificado(
    datos: MapeoSimplificado,
    db: Session = Depends(get_master_db),
    current_user = Depends(get_current_user)
):
    """
    Genera un mapeo simplificado a partir de los datos del formulario
    """
    try:
        # Calcular nivel de riesgo
        nivel_riesgo = calcular_nivel_riesgo(datos)
        
        # Calcular nivel de cumplimiento
        nivel_cumplimiento = calcular_cumplimiento(datos)
        
        # Generar ID único para el mapeo
        mapeo_id = f"mapeo_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Crear resumen del mapeo
        resumen = {
            "proceso": {
                "nombre": datos.proceso,
                "area": datos.area,
                "finalidades_count": len(datos.finalidades)
            },
            "datos": {
                "comunes_count": len(datos.datos_comunes),
                "sensibles_count": len(datos.datos_sensibles),
                "total": len(datos.datos_comunes) + len(datos.datos_sensibles)
            },
            "destinatarios": {
                "internos_count": len(datos.destinatarios.get("internos", [])),
                "externos_count": len(datos.destinatarios.get("externos", [])),
                "total": len(datos.destinatarios.get("internos", [])) + len(datos.destinatarios.get("externos", []))
            },
            "retencion": datos.retencion,
            "fecha_creacion": datetime.now().isoformat(),
            "creado_por": current_user.get("username", "demo")
        }
        
        # Generar documentos (simulado)
        documentos = [
            f"RAT_simplificado_{mapeo_id}.pdf",
            f"diagrama_flujo_{mapeo_id}.png",
            f"matriz_cumplimiento_{mapeo_id}.xlsx"
        ]
        
        # En producción aquí se guardarían los datos en la base de datos
        # mapeo_record = InventarioSimplificado(...)
        # db.add(mapeo_record)
        # db.commit()
        
        return ResultadoMapeo(
            mapeo_id=mapeo_id,
            proceso_nombre=datos.proceso,
            nivel_cumplimiento=nivel_cumplimiento,
            nivel_riesgo=nivel_riesgo,
            documentos_generados=documentos,
            siguiente_paso="/dashboard" if current_user.get("restricted_to") else "/modulo3",
            resumen=resumen
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generando mapeo: {str(e)}"
        )

@router.get("/validar-mapeo/{mapeo_id}")
async def validar_mapeo(mapeo_id: str):
    """
    Valida un mapeo generado y retorna sugerencias de mejora
    """
    # Simulación de validación
    validaciones = [
        {
            "aspecto": "Finalidad",
            "estado": "completo",
            "mensaje": "Las finalidades están bien definidas",
            "color": "success"
        },
        {
            "aspecto": "Datos sensibles",
            "estado": "atencion",
            "mensaje": "Se detectaron datos sensibles que requieren consentimiento expreso",
            "color": "warning"
        },
        {
            "aspecto": "Retención",
            "estado": "completo",
            "mensaje": "Los plazos de retención cumplen con la normativa",
            "color": "success"
        }
    ]
    
    return {
        "mapeo_id": mapeo_id,
        "validaciones": validaciones,
        "puntuacion_total": 85,
        "recomendaciones": [
            "Obtener consentimiento expreso para datos sensibles",
            "Implementar medidas de seguridad adicionales",
            "Revisar contratos con terceros"
        ]
    }

def calcular_nivel_riesgo(datos: MapeoSimplificado) -> str:
    """
    Calcula el nivel de riesgo basado en los datos del mapeo
    """
    puntuacion = 0
    
    # Datos sensibles aumentan el riesgo
    puntuacion += len(datos.datos_sensibles) * 3
    
    # Destinatarios externos aumentan el riesgo
    externos = datos.destinatarios.get("externos", [])
    puntuacion += len(externos) * 2
    
    # Retención larga aumenta el riesgo
    if "10_anos" in datos.retencion.get("despues", ""):
        puntuacion += 2
    
    if puntuacion >= 8:
        return "alto"
    elif puntuacion >= 4:
        return "medio"
    else:
        return "bajo"

def calcular_cumplimiento(datos: MapeoSimplificado) -> int:
    """
    Calcula el porcentaje de cumplimiento basado en los datos
    """
    puntuacion = 0
    total = 100
    
    # Tiene finalidades definidas
    if datos.finalidades:
        puntuacion += 25
    
    # Tiene justificación para retención
    if datos.retencion.get("justificacion"):
        puntuacion += 25
    
    # Manejo adecuado de datos sensibles
    if datos.datos_sensibles:
        # Si tiene datos sensibles pero pocos, mejor puntuación
        if len(datos.datos_sensibles) <= 2:
            puntuacion += 20
        else:
            puntuacion += 10
    else:
        puntuacion += 25
    
    # Destinatarios controlados
    total_destinatarios = len(datos.destinatarios.get("internos", [])) + len(datos.destinatarios.get("externos", []))
    if total_destinatarios <= 5:
        puntuación += 25
    else:
        puntuación += 15
    
    return min(puntuación, 100)

# Endpoints adicionales para la demo
@router.get("/stats")
async def get_modulo_cero_stats():
    """
    Estadísticas del Módulo Cero para el dashboard
    """
    return {
        "mapeos_creados": 1247,
        "tiempo_promedio": 8.5,  # minutos
        "tasa_completado": 94.2,  # porcentaje
        "procesos_mas_mapeados": [
            {"proceso": "Contratación", "count": 342},
            {"proceso": "Marketing", "count": 289},
            {"proceso": "Ventas", "count": 201}
        ]
    }