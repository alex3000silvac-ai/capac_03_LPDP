"""
GLOSARIO DE TÉRMINOS - LEY 21.719
Módulo complementario con definiciones, explicaciones y ejemplos prácticos
Basado en Manual de Procedimientos Parte 3
"""
from typing import List, Dict, Any, Optional
from fastapi import APIRouter

router = APIRouter()

# GLOSARIO COMPLETO DE TÉRMINOS EXTRAÍDOS DEL MANUAL
GLOSARIO_LPDP = {
    "actividad_de_tratamiento": {
        "definicion": "Conjunto de operaciones o procesos realizados sobre datos personales que comparten una misma finalidad específica",
        "definicion_manual": "Proceso que involucra información de personas con una finalidad determinada",
        "ejemplos_practicos": [
            "Proceso de Reclutamiento y Selección",
            "Gestión de Nómina y Beneficios",
            "Evaluación Crediticia de Clientes",
            "Monitoreo IoT de Centros de Cultivo"
        ],
        "que_NO_es": [
            "Una base de datos (es solo el contenedor)",
            "Un sistema informático (es solo la herramienta)",
            "Un departamento (es el proceso que ejecuta)"
        ],
        "tip_identificacion": "Pregúntese: ¿QUÉ hacemos con los datos? ¿PARA QUÉ los usamos?",
        "relacion_ley": "Base para el RAT según Art. 31 Ley 21.719"
    },
    
    "rat_registro_actividades": {
        "definicion": "Registro de Actividades de Tratamiento - Inventario exhaustivo de todos los tratamientos de datos personales",
        "definicion_manual": "La piedra angular de todo el sistema de cumplimiento",
        "importancia_critica": "Sin un conocimiento claro de qué datos se tienen, dónde están, por qué se tienen, cómo fluyen y cuándo deben ser eliminados, es imposible cumplir con los demás principios y obligaciones de la Ley N° 21.719",
        "elementos_obligatorios": [
            "Nombre de la actividad de tratamiento",
            "Finalidad(es) del tratamiento", 
            "Base de licitud",
            "Categorías de titulares de datos",
            "Categorías de datos personales tratados",
            "Categorías de destinatarios (internos y externos)",
            "Transferencias internacionales (si aplica)",
            "Plazos de conservación y supresión",
            "Descripción de las medidas de seguridad técnicas y organizativas"
        ],
        "ejemplo_practico": "Actividad: 'Proceso de Reclutamiento' incluye desde recepción de CV hasta comunicación de decisión",
        "relacion_ley": "Obligatorio según Art. 31 Ley 21.719"
    },
    
    "datos_personales_comunes": {
        "definicion": "Información de identificación, contacto, datos laborales que no revelen aspectos sensibles",
        "definicion_manual": "Información básica que identifica o hace identificable a una persona sin revelar aspectos íntimos",
        "ejemplos_detallados": [
            "Nombre completo y apellidos",
            "RUT/Cédula de identidad", 
            "Dirección postal y email",
            "Teléfono de contacto",
            "Fecha de nacimiento",
            "Estado civil",
            "Nacionalidad",
            "Historial académico",
            "Experiencia laboral no sensible"
        ],
        "medidas_proteccion": "Medidas de seguridad apropiadas según nivel de riesgo",
        "diferencia_datos_sensibles": "No requieren consentimiento explícito si hay otra base legal válida",
        "relacion_ley": "Definidos en Art. 2 letra e) Ley 21.719"
    },
    
    "datos_sensibles": {
        "definicion": "Datos que requieren protección especial por revelar aspectos íntimos de la personalidad",
        "definicion_legal": "Art. 2 lit. g: datos que revelen origen étnico, afiliación sindical, convicciones religiosas o filosóficas, datos de salud, datos biométricos, vida u orientación sexual, y situación socioeconómica",
        "novedad_chile": "La inclusión de 'situación socioeconómica' es una novedad crucial de la ley chilena",
        "ejemplos_situacion_socioeconomica": [
            "Nivel de ingresos familiares",
            "Historial crediticio",
            "Score crediticio",
            "Evaluación de capacidad de pago",
            "Elegibilidad para beneficios sociales",
            "Subsidios habitacionales",
            "Evaluación patrimonial",
            "Información de pensiones y jubilaciones"
        ],
        "otros_tipos_sensibles": {
            "salud": ["Licencias médicas", "Exámenes preocupacionales", "Discapacidades"],
            "biometricos": ["Huellas dactilares", "Reconocimiento facial", "Iris scanning"],
            "afiliacion_sindical": ["Membresía sindical", "Cuotas sindicales", "Actividad gremial"],
            "origen_etnico": ["Pueblo originario", "Características raciales"],
            "religion": ["Creencias religiosas", "Permisos religiosos"],
            "vida_sexual": ["Orientación sexual", "Identidad de género"]
        },
        "medidas_especiales": "Requieren consentimiento explícito salvo excepciones legales específicas",
        "contextos_empresariales": "Comúnmente manejados por RRHH y áreas financieras sin consciencia de su sensibilidad",
        "tip_critico": "En Chile, situación socioeconómica ES dato sensible, a diferencia de Europa",
        "relacion_ley": "Art. 2 lit. g) y Art. 8 Ley 21.719"
    },
    
    "datos_nna": {
        "definicion": "Datos de Niños, Niñas y Adolescentes - menores de 18 años",
        "definicion_manual": "Cualquier dato perteneciente a menores de edad que requiere consentimiento de padres/tutores",
        "requisitos_especiales": [
            "Consentimiento de padres o tutores",
            "Consideración del interés superior del niño",
            "Prohibición de perfilado comercial",
            "Limitaciones en transferencias internacionales",
            "Derecho de rectificación facilitado"
        ],
        "contextos_laborales": [
            "Datos de hijos en cargas familiares",
            "Estudiantes en práctica menores de 18",
            "Beneficiarios de seguros familiares",
            "Participantes en actividades recreativas"
        ],
        "ejemplos_practicos": [
            "Nombre y RUT de hijos para asignación familiar",
            "Edad para cálculo de beneficios",
            "Información médica para seguros",
            "Datos académicos de hijos becados"
        ],
        "tip_implementacion": "Validar edad automáticamente en formularios - si menor de 18, activar protocolo especial",
        "relacion_ley": "Protección especial según Art. 4 y 5 Ley 21.719"
    },
    
    "situacion_socioeconomica": {
        "definicion": "DATO SENSIBLE que revela capacidad económica, nivel de ingresos, patrimonio o situación financiera",
        "importancia_chile": "Novedad crucial de la ley chilena - Esto significa que datos como el nivel de ingresos, historial crediticio o la elegibilidad para beneficios sociales, comúnmente manejados por RRHH o áreas financieras, deben ser tratados con el máximo nivel de protección",
        "ejemplos_especificos": [
            "Evaluación socioeconómica para definir renta de ingreso",
            "Análisis de capacidad de pago para créditos",
            "Elegibilidad para beneficios sociales",
            "Historial crediticio y score",
            "Nivel de ingresos declarados",
            "Patrimonio y propiedades",
            "Deudas y morosidades",
            "Subsidios y ayudas sociales"
        ],
        "contextos_rrhh": [
            "Evaluación socioeconómica para definir sueldo",
            "Beneficios según situación familiar",
            "Préstamos y adelantos a empleados",
            "Becas para hijos por situación económica"
        ],
        "contextos_finanzas": [
            "Evaluación crediticia de clientes",
            "Análisis de riesgo para ventas a crédito",
            "Segmentación por capacidad de pago",
            "Reportes a centrales de riesgo"
        ],
        "medidas_proteccion": "Mismo nivel que datos de salud - consentimiento explícito o interés legítimo muy justificado",
        "error_comun": "Tratar estos datos como 'normales' sin aplicar protecciones especiales",
        "relacion_ley": "Art. 2 lit. g) Ley 21.719 - Inclusión específica como dato sensible"
    },
    
    "data_discovery": {
        "definicion": "Proceso estructurado de identificación y mapeo de todos los datos personales en la organización",
        "definicion_manual": "Procedimiento de Mapeo Inicial de Datos",
        "enfoque_correcto": "Preguntar '¿qué actividades o procesos realizan que involucren información de personas?' NO '¿qué bases de datos tienen?'",
        "metodologia": [
            "Conformación de equipo multidisciplinario",
            "Entrevistas estructuradas por área",
            "Mapeo de procesos de negocio",
            "Identificación de flujos de datos",
            "Documentación de actividades de tratamiento"
        ],
        "equipo_requerido": ["DPO", "RRHH", "Finanzas", "Marketing", "Operaciones", "TI", "Legal"],
        "resultado_esperado": "Inventario completo de actividades de tratamiento documentadas",
        "tip_metodologico": "Enfócarse en PROCESOS, no en sistemas - los sistemas son solo herramientas",
        "relacion_ley": "Base para cumplir obligación RAT del Art. 31"
    },
    
    "flujos_internos": {
        "definicion": "Movimiento de datos personales entre sistemas internos de la organización",
        "definicion_manual": "Trazar el recorrido de los datos entre los sistemas internos",
        "ejemplo_manual": "Cuando un nuevo cliente se registra en la web, sus datos viajan desde el servidor web al CRM, luego al ERP para la facturación, y quizás a un sistema de business intelligence para análisis",
        "elementos_documentar": [
            "Sistema origen",
            "Sistema destino", 
            "Tipo de datos transferidos",
            "Frecuencia de transferencia",
            "Método de transferencia",
            "Medidas de seguridad aplicadas"
        ],
        "ejemplo_detallado": [
            "1. Cliente completa formulario web",
            "2. Datos van a base de datos del sitio",
            "3. API sincroniza con CRM",
            "4. CRM envía datos comerciales a ERP",
            "5. ERP genera datos agregados para BI",
            "6. BI alimenta dashboard gerencial"
        ],
        "controles_necesarios": [
            "Validación en cada transferencia",
            "Logs de auditoría",
            "Cifrado en tránsito",
            "Control de integridad"
        ],
        "relacion_ley": "Documentación obligatoria para RAT según Art. 31"
    },
    
    "flujos_externos": {
        "definicion": "Transferencias de datos personales a terceros fuera de la organización",
        "definicion_manual": "Documentar todas las transferencias de datos a terceros, ya sean encargados del tratamiento o cesionarios",
        "tipos_terceros": {
            "encargados": {
                "definicion": "Procesan datos en nombre y por cuenta del responsable",
                "ejemplos": ["Proveedor cloud", "Agencia marketing", "Empresa nómina", "Call center"],
                "requisitos": "Contrato de encargo específico según Art. 23"
            },
            "cesionarios": {
                "definicion": "Reciben datos para sus propios fines",
                "ejemplos": ["DICOM", "SII", "Previred", "SERNAPESCA", "Seguros"],
                "requisitos": "Base legal específica e información al titular"
            }
        },
        "documentacion_requerida": [
            "Identificación del tercero",
            "Propósito de la transferencia",
            "Base legal que la ampara",
            "Datos específicos transferidos",
            "Frecuencia y método",
            "Medidas de protección"
        ],
        "tip_diferenciacion": "Encargado = trabaja PARA usted. Cesionario = trabaja para SUS propios fines",
        "relacion_ley": "Arts. 23 (encargados) y 24-27 (cesionarios) Ley 21.719"
    },
    
    "transferencias_internacionales": {
        "definicion": "Movimiento de datos personales fuera del territorio nacional",
        "ejemplos_comunes_chile": [
            "Google LLC (Estados Unidos) - Analytics",
            "Microsoft Corporation (Estados Unidos) - Office 365", 
            "Amazon Web Services (Estados Unidos) - Cloud",
            "Salesforce (Estados Unidos) - CRM",
            "Meta Platforms (Estados Unidos) - Facebook Ads"
        ],
        "garantias_requeridas": [
            "Cláusulas contractuales estándar",
            "Certificaciones de privacidad",
            "Códigos de conducta aprobados",
            "Decisión de adecuación (cuando exista)"
        ],
        "evaluacion_necesaria": "Cada servicio cloud constituye transferencia internacional - requiere evaluación según Arts. 25-27",
        "casos_no_evidentes": [
            "Software con servidores en el extranjero",
            "Servicios de email corporativo",
            "Plataformas de videoconferencia",
            "Herramientas de analytics web"
        ],
        "documentacion_obligatoria": "País de destino y garantías implementadas",
        "relacion_ley": "Arts. 25-27 Ley 21.719"
    },
    
    "base_licitud": {
        "definicion": "Fundamento legal que justifica el tratamiento de datos personales",
        "opciones_art7": {
            "consentimiento": {
                "descripcion": "Consentimiento del titular",
                "cuando_usar": "Datos sensibles, marketing directo, cookies no técnicas",
                "requisitos": "Libre, específico, informado e inequívoco",
                "ejemplos": ["Newsletter comercial", "Cookies publicitarias", "Programas fidelización"]
            },
            "contrato": {
                "descripcion": "Ejecución de contrato",
                "cuando_usar": "Datos necesarios para cumplir obligaciones contractuales",
                "requisitos": "Necesidad objetiva para el contrato",
                "ejemplos": ["Datos facturación", "Información entrega", "Contacto postventa"]
            },
            "obligacion_legal": {
                "descripcion": "Cumplimiento de obligación legal",
                "cuando_usar": "Normativas tributarias, laborales, sectoriales",
                "requisitos": "Obligación establecida en ley/reglamento",
                "ejemplos": ["Documentos SII (6 años)", "Cotizaciones Previred", "Reportes SERNAPESCA"]
            },
            "interes_legitimo": {
                "descripcion": "Interés legítimo del responsable",
                "cuando_usar": "Intereses que no vulneren derechos del titular",
                "requisitos": "Test de balanceamiento",
                "ejemplos": ["Seguridad informática", "Prevención fraude", "Mejora productos"]
            },
            "interes_vital": {
                "descripcion": "Protección de intereses vitales",
                "cuando_usar": "Situaciones de emergencia",
                "ejemplos": ["Datos médicos en emergencia", "Localización en rescate"]
            },
            "interes_publico": {
                "descripcion": "Misión de interés público",
                "cuando_usar": "Organismos públicos principalmente",
                "ejemplos": ["Registro civil", "Censos", "Investigación sanitaria"]
            }
        },
        "error_comun": "Elegir base genérica sin análisis específico de la actividad",
        "tip_seleccion": "Analizar caso por caso - una actividad puede tener múltiples bases según finalidad",
        "relacion_ley": "Art. 7 Ley 21.719 - Obligatorio para todo tratamiento"
    },
    
    "principio_proporcionalidad": {
        "definicion": "Limitación del plazo de conservación según finalidad del tratamiento",
        "definicion_manual": "Basándose en el principio de proporcionalidad, se debe definir políticas de retención para cada categoría de datos",
        "criterios_definicion": [
            "Finalidad original del tratamiento",
            "Obligaciones legales de conservación",
            "Necesidades operativas del negocio",
            "Derechos del titular",
            "Riesgos de conservación vs eliminación"
        ],
        "plazos_legales_chile": {
            "tributarios": "6 años (Art. 17 Código Tributario)",
            "laborales": "2 años post-término (Art. 416 Código del Trabajo)",
            "previsionales": "30 años (DL 3.500)",
            "sanitarios": "5 años (Reglamento Sanitario Acuicultura)"
        },
        "ejemplo_aplicacion": "Las facturas de clientes se conservan por 6 años para cumplir con obligaciones tributarias",
        "automatizacion_requerida": "Sistema debe ejecutar eliminación automática al vencer plazos",
        "relacion_ley": "Art. 5 letra e) Ley 21.719"
    },
    
    "eliminacion_segura": {
        "definicion": "Procedimiento para borrado irreversible de datos al vencer período de retención",
        "definicion_manual": "Se debe definir un procedimiento para la eliminación segura o la anonimización de los datos una vez que expira su período de retención",
        "tipos_eliminacion": {
            "fisica": {
                "definicion": "Borrado irreversible de los datos",
                "metodos": ["DELETE con VACUUM", "Sobrescritura múltiple", "Destrucción física", "Formateo seguro"]
            },
            "anonimizacion": {
                "definicion": "Transformación irreversible que impide identificación",
                "tecnicas": ["Generalización", "Supresión", "Perturbación", "Pseudonimización irreversible"]
            }
        },
        "automatizacion": "Motor que identifica datos vencidos y ejecuta eliminación periódicamente",
        "registro_obligatorio": "Logs inmutables de qué se eliminó, cuándo y bajo qué política",
        "verificacion": "Auditoría de que datos no son recuperables",
        "relacion_ley": "Obligación de eliminación según Art. 5 letra e)"
    },
    
    "iot_datos_personales": {
        "definicion": "Datos de Internet of Things que pueden vincularse a personas específicas",
        "definicion_manual": "Los datos generados en tiempo real por sensores de IoT en los centros de cultivo que, aunque pueden no parecer personales a primera vista, si pueden vincularse a un centro de cultivo específico o a un operario, quedan bajo el ámbito de la ley",
        "ejemplo_sectorial": {
            "datos_sensores": ["Temperatura agua", "Niveles oxígeno", "Alimentación automática", "Mortalidad"],
            "vinculacion_personal": ["Centro asignado a operario", "Turnos específicos", "Alertas nominadas", "Evaluaciones de desempeño"]
        },
        "criterio_clave": "Si pueden vincularse a persona específica = dato personal bajo la ley",
        "flujos_tipicos": "Sensores → Cloud (¿internacional?) → Analytics → Reportes por responsable",
        "medidas_especiales": [
            "Separar datos operativos de personales",
            "Cifrado reforzado en IoT",
            "Control acceso por necesidad",
            "Logs detallados de consultas"
        ],
        "tip_evaluacion": "Pregúntese: ¿Este dato puede identificar o evaluarse desempeño de una persona específica?",
        "relacion_ley": "Definición de dato personal Art. 2 letra e)"
    },
    
    "geolocalizacion_laboral": {
        "definicion": "Datos de ubicación de personal durante actividades laborales",
        "definicion_manual": "Datos de geolocalización del personal en terreno",
        "fuentes_comunes": [
            "GPS en vehículos corporativos",
            "Apps móviles de trabajo",
            "Sistemas control de acceso",
            "Dispositivos emergencia/seguridad",
            "Cámaras con reconocimiento"
        ],
        "datos_generados": [
            "Coordenadas GPS tiempo real",
            "Rutas y velocidades",
            "Tiempo permanencia por ubicación",
            "Patrones movimiento habituales",
            "Desviaciones de rutas asignadas"
        ],
        "finalidades_legitimas": [
            "Seguridad personal en terreno riesgoso",
            "Optimización rutas y combustible",
            "Respuesta rápida emergencias",
            "Control jornada laboral efectiva"
        ],
        "limitaciones_estrictas": [
            "Solo durante horario laboral",
            "No monitoreo en descansos personales",
            "Notificación previa explícita",
            "Acceso solo supervisores directos",
            "Modo 'privado' para emergencias"
        ],
        "implementacion_recomendada": "Alertas automáticas si detecta monitoreo fuera de horario",
        "relacion_ley": "Balance entre interés legítimo y privacidad del trabajador"
    },
    
    "plataforma_gobernanza": {
        "definicion": "Sistema centralizado para gestión integral del cumplimiento de protección de datos",
        "definicion_manual": "El sistema de cumplimiento debe actuar como una plataforma centralizada de gobernanza de datos",
        "componentes_principales": [
            "Módulo RAT (actividades de tratamiento)",
            "Mapeo y visualización de flujos",
            "Motor de políticas de retención",
            "Herramientas de descubrimiento automático",
            "Sistema de alertas y reportes"
        ],
        "interfaz_requerida": "Web intuitiva para personal no técnico con formularios guiados",
        "base_datos": "Relacional con tablas interrelacionadas para consultas complejas",
        "automatizacion": "Cron jobs para eliminación automática y descubrimiento de nuevos tratamientos",
        "visualizacion": "Diagramas automáticos de flujos de datos",
        "auditoria": "Logs inmutables de todas las operaciones",
        "relacion_ley": "Herramienta para cumplir múltiples obligaciones de la Ley 21.719"
    },
    
    "motor_politicas_retencion": {
        "definicion": "Sistema automatizado para aplicar políticas de conservación y eliminación de datos",
        "definicion_manual": "El sistema debe incluir un motor de automatización que se ejecute periódicamente para identificar registros vencidos y ejecutar acciones definidas",
        "lenguaje_reglas": "Declarativo: SI [condición] ENTONCES [acción] DESPUÉS DE [tiempo]",
        "ejemplo_regla": "SI categoria_datos = 'Currículums No Seleccionados' ENTONCES eliminar DESPUÉS DE 180 días",
        "tipos_accion": ["Eliminar", "Anonimizar", "Archivar", "Alertar", "Transferir"],
        "ejecucion_automatica": "Cron job o worker que procesa por lotes",
        "validaciones_previas": [
            "Sin procesos legales pendientes",
            "Cumplimiento plazo mínimo",
            "Verificación obligaciones adicionales"
        ],
        "registro_auditoria": "Log inmutable de cada eliminación con detalles completos",
        "relacion_ley": "Automatización del principio de proporcionalidad Art. 5 letra e)"
    }
}

@router.get("/")
def get_glosario_completo():
    """Obtener glosario completo de términos LPDP"""
    return {
        "success": True,
        "titulo": "Glosario de Términos - Ley 21.719",
        "descripcion": "Definiciones, explicaciones y ejemplos prácticos basados en Manual de Procedimientos Parte 3",
        "total_terminos": len(GLOSARIO_LPDP),
        "glosario": GLOSARIO_LPDP,
        "uso_recomendado": "Consultar durante implementación para clarificar conceptos y aplicaciones prácticas"
    }

@router.get("/termino/{termino_id}")
def get_termino_especifico(termino_id: str):
    """Obtener definición específica de un término"""
    if termino_id not in GLOSARIO_LPDP:
        return {
            "success": False,
            "error": "Término no encontrado",
            "terminos_disponibles": list(GLOSARIO_LPDP.keys())
        }
    
    return {
        "success": True,
        "termino": termino_id,
        "contenido": GLOSARIO_LPDP[termino_id],
        "basado_en_manual": True
    }

@router.get("/buscar/{palabra_clave}")
def buscar_terminos(palabra_clave: str):
    """Buscar términos que contengan la palabra clave"""
    resultados = {}
    palabra_lower = palabra_clave.lower()
    
    for termino_id, contenido in GLOSARIO_LPDP.items():
        if (palabra_lower in termino_id.lower() or 
            palabra_lower in contenido.get("definicion", "").lower() or
            palabra_lower in str(contenido.get("ejemplos_practicos", [])).lower()):
            resultados[termino_id] = contenido
    
    return {
        "success": True,
        "palabra_buscada": palabra_clave,
        "resultados_encontrados": len(resultados),
        "terminos": resultados
    }

@router.get("/categorias")
def get_categorias_terminos():
    """Obtener términos organizados por categorías"""
    categorias = {
        "conceptos_basicos": [
            "actividad_de_tratamiento",
            "rat_registro_actividades", 
            "datos_personales_comunes",
            "datos_sensibles",
            "datos_nna"
        ],
        "datos_sensibles_especificos": [
            "situacion_socioeconomica",
            "iot_datos_personales",
            "geolocalizacion_laboral"
        ],
        "procesos_mapeo": [
            "data_discovery",
            "flujos_internos",
            "flujos_externos",
            "transferencias_internacionales"
        ],
        "aspectos_legales": [
            "base_licitud",
            "principio_proporcionalidad",
            "eliminacion_segura"
        ],
        "aspectos_tecnicos": [
            "plataforma_gobernanza",
            "motor_politicas_retencion"
        ]
    }
    
    return {
        "success": True,
        "categorias": categorias,
        "uso": "Navegación temática del glosario para estudio estructurado"
    }