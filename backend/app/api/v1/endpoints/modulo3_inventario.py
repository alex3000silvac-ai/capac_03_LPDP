"""
MÓDULO 3: INVENTARIO Y MAPEO DE DATOS - LEY 21.719
Sistema completo para construcción del RAT (Registro de Actividades de Tratamiento)
Basado en Manual de Procedimientos Parte 3
"""
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# MODELOS DE DATOS PARA RAT
class ActiviadTratamiento(BaseModel):
    id_actividad: str
    nombre_actividad: str
    responsable_proceso: str
    finalidades: List[str]
    base_licitud: str
    categorias_titulares: List[str]
    categorias_datos: List[str]
    sistemas_implicados: List[str]
    destinatarios_internos: List[str]
    destinatarios_externos: List[str]
    transferencias_internacionales: Optional[Dict[str, Any]] = None
    plazo_conservacion: str
    medidas_seguridad: List[str]
    area_responsable: str

# DATOS DE CONFIGURACIÓN DEL MÓDULO 3
MODULO3_CONFIG = {
    "titulo": "Módulo 3: Inventario y Mapeo de Datos",
    "descripcion": "La piedra angular de todo el sistema de cumplimiento. Sin un conocimiento claro de qué datos se tienen, dónde están, por qué se tienen, cómo fluyen y cuándo deben ser eliminados, es imposible cumplir con los demás principios y obligaciones de la Ley N° 21.719",
    "objetivo_principal": "Crear y mantener un inventario exhaustivo de todos los activos de datos personales que la organización trata",
    "componentes_principales": [
        "Registro de Actividades de Tratamiento (RAT)",
        "Clasificación de Datos por Sensibilidad", 
        "Documentación de Flujos de Datos",
        "Gestión de Retención y Eliminación"
    ]
}

# EJEMPLOS PRÁCTICOS POR ÁREA DE NEGOCIO
EJEMPLOS_AREAS_NEGOCIO = {
    "rrhh": {
        "area": "Recursos Humanos",
        "actividades_tipicas": [
            {
                "id": "RRHH-001",
                "nombre": "Proceso de Reclutamiento y Selección",
                "descripcion": "Desde recepción de currículum hasta comunicación de decisión",
                "finalidades": [
                    "Evaluar idoneidad de candidatos para vacantes laborales",
                    "Verificar antecedentes laborales y académicos",
                    "Cumplir procesos de due diligence"
                ],
                "base_licitud": "Medidas precontractuales y consentimiento del candidato",
                "datos_tratados": [
                    "Datos identificación (nombre, RUT, email, teléfono)",
                    "Historial académico y profesional",
                    "Referencias laborales",
                    "Resultados evaluaciones psicotécnicas",
                    "Exámenes preocupacionales (DATO SENSIBLE - salud)"
                ],
                "sistemas": ["Portal Web RRHH", "ATS (Applicant Tracking System)", "Base datos candidatos"],
                "terceros": [
                    "Empresa verificación antecedentes",
                    "Centro médico exámenes preocupacionales",
                    "Consultora psicotécnica"
                ],
                "plazo_retencion": "Candidatos NO seleccionados: 6 meses. Candidatos seleccionados: durante relación laboral + 2 años",
                "datos_sensibles_especificos": {
                    "salud": "Exámenes preocupacionales, certificados médicos",
                    "situacion_socioeconomica": "Evaluación socioeconómica para definir renta de ingreso, historial crediticio para cargos con manejo de dinero"
                }
            },
            {
                "id": "RRHH-002", 
                "nombre": "Gestión de Nómina y Beneficios",
                "descripcion": "Procesamiento mensual de remuneraciones y beneficios",
                "finalidades": [
                    "Cumplir obligaciones laborales de pago",
                    "Calcular impuestos y cotizaciones",
                    "Administrar beneficios adicionales"
                ],
                "base_licitud": "Cumplimiento obligación legal (Código del Trabajo)",
                "datos_tratados": [
                    "Datos personales empleados y cargas familiares",
                    "Información bancaria para depósitos",
                    "Datos tributarios y previsionales",
                    "Información hijos para asignación familiar (DATOS NNA)",
                    "Licencias médicas (DATO SENSIBLE - salud)",
                    "Nivel salarial (DATO SENSIBLE - situación socioeconómica)"
                ],
                "sistemas": ["Sistema Nómina", "ERP", "Portal Empleado", "Previred"],
                "terceros": ["AFP", "ISAPRE/FONASA", "SII", "Previred", "Bancos"],
                "plazo_retencion": "Durante relación laboral + 6 años tributarios",
                "transferencias_obligatorias": {
                    "previred": "Cotizaciones mensuales - Base legal obligatoria",
                    "sii": "Información tributaria - Base legal obligatoria",
                    "afp_isapre": "Cotizaciones - Base legal obligatoria"
                }
            }
        ],
        "datos_sensibles_frecuentes": [
            "Situación socioeconómica para definición salarial",
            "Exámenes médicos preocupacionales",
            "Licencias médicas",
            "Información sindical",
            "Datos de hijos menores para beneficios"
        ]
    },
    
    "finanzas": {
        "area": "Finanzas y Contabilidad",
        "actividades_tipicas": [
            {
                "id": "FIN-001",
                "nombre": "Evaluación Crediticia de Clientes",
                "descripcion": "Análisis de capacidad de pago para ventas a crédito",
                "finalidades": [
                    "Evaluar riesgo crediticio",
                    "Definir cupos y condiciones de venta",
                    "Cumplir políticas internas de riesgo"
                ],
                "base_licitud": "Interés legítimo (evaluación riesgo comercial)",
                "datos_tratados": [
                    "Datos identificación cliente",
                    "Historial de pagos",
                    "Score crediticio (DATO SENSIBLE - situación socioeconómica)",
                    "Información patrimonial (DATO SENSIBLE - situación socioeconómica)",
                    "Reportes DICOM/Equifax (DATO SENSIBLE - situación socioeconómica)"
                ],
                "sistemas": ["ERP", "Sistema Cobranza", "Portal DICOM", "CRM"],
                "terceros": ["DICOM", "Equifax", "Siisa", "Centrales de riesgo"],
                "plazo_retencion": "5 años desde última transacción comercial",
                "consideraciones_especiales": "Situación socioeconómica es DATO SENSIBLE en Chile - requiere protección especial"
            }
        ],
        "datos_sensibles_frecuentes": [
            "Score crediticio y capacidad de pago",
            "Información patrimonial",
            "Historial de deudas y morosidades",
            "Evaluaciones socioeconómicas"
        ]
    },
    
    "operaciones": {
        "area": "Operaciones y Producción",
        "actividades_tipicas": [
            {
                "id": "OPS-001",
                "nombre": "Monitoreo IoT de Centros de Cultivo",
                "descripcion": "Monitoreo en tiempo real via sensores IoT",
                "finalidades": [
                    "Optimizar condiciones de cultivo",
                    "Detectar tempranamente problemas sanitarios",
                    "Cumplir normativas de bienestar animal",
                    "Generar reportes para SERNAPESCA"
                ],
                "base_licitud": "Interés legítimo (eficiencia operativa) y cumplimiento obligación legal",
                "datos_tratados": [
                    "Datos sensores (temperatura, oxígeno, pH)",
                    "Registros alimentación automática",
                    "Imágenes/video de biomasa",
                    "Datos geolocalización de personal (POTENCIALMENTE PERSONAL)",
                    "Registros de operarios por turno (DATO PERSONAL si identificable)"
                ],
                "sistemas": ["Sensores IoT", "Plataforma IA", "ERP", "Sistema SERNAPESCA"],
                "terceros": ["Proveedor plataforma IA", "SERNAPESCA"],
                "transferencias_internacionales": "Plataforma IA en Estados Unidos",
                "plazo_retencion": "Datos brutos: 2 años. Informes agregados: 10 años",
                "consideracion_clave": "Si datos pueden vincularse a operario específico, se convierten en datos personales"
            }
        ]
    }
}

@router.get("/")
def get_modulo3_introduccion():
    """Introducción completa al Módulo 3"""
    return {
        "success": True,
        "modulo": "modulo3_inventario", 
        "configuracion": MODULO3_CONFIG,
        "importancia_critica": "Sin un inventario claro es imposible cumplir los demás principios de la Ley 21.719",
        "metodologia_recomendada": "Enfoque en procesos de negocio, no en sistemas tecnológicos"
    }

@router.get("/ejemplos-areas")
def get_ejemplos_por_area():
    """Ejemplos prácticos de actividades de tratamiento por área de negocio"""
    return {
        "success": True,
        "titulo": "Ejemplos Prácticos por Área de Negocio",
        "descripcion": "Actividades típicas de tratamiento de datos en cada área empresarial",
        "areas": EJEMPLOS_AREAS_NEGOCIO,
        "nota_importante": "Estos ejemplos deben adaptarse a la realidad específica de cada organización"
    }

@router.get("/test")
def test_modulo3():
    """Test de funcionamiento del módulo"""
    return {"status": "ok", "message": "Módulo 3 inventario funcionando correctamente", "version": "completa"}