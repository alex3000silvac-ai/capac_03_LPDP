"""
Servicio para gestionar el contenido pedagógico del sistema de capacitación
"""
from typing import Dict, List, Any

# Estructura del contenido de capacitación
CONTENIDO_CAPACITACION = {
    "modulos": [
        {
            "codigo": "MOD-001",
            "nombre": "Introducción a la Protección de Datos Personales",
            "descripcion": "Fundamentos legales y conceptos básicos de la Ley N° 21.719",
            "duracion_estimada": 45,
            "lecciones": [
                {
                    "codigo": "LEC-001-01",
                    "titulo": "¿Por qué es importante proteger los datos personales?",
                    "tipo": "teoria",
                    "contenido": {
                        "introduccion": "En la era digital, los datos personales son el nuevo petróleo...",
                        "secciones": [
                            {
                                "titulo": "El valor de los datos personales",
                                "contenido": "Los datos personales tienen un valor económico y social...",
                                "ejemplos": [
                                    "Caso Cambridge Analytica",
                                    "Filtraciones de datos en Chile"
                                ]
                            }
                        ],
                        "conceptos_clave": [
                            "Dato personal",
                            "Privacidad",
                            "Autodeterminación informativa"
                        ]
                    }
                },
                {
                    "codigo": "LEC-001-02",
                    "titulo": "La Ley N° 21.719: Un nuevo paradigma",
                    "tipo": "video",
                    "contenido": {
                        "video_url": "/videos/intro-ley-21719.mp4",
                        "transcripcion": "...",
                        "puntos_clave": [
                            "Cambio del modelo de opt-out a opt-in",
                            "Nuevos derechos de los titulares",
                            "Sanciones significativas"
                        ]
                    }
                },
                {
                    "codigo": "LEC-001-03",
                    "titulo": "Quiz: Conceptos Fundamentales",
                    "tipo": "quiz",
                    "contenido": {
                        "preguntas": [
                            {
                                "pregunta": "¿Qué es un dato personal según la Ley 21.719?",
                                "opciones": [
                                    "Solo el RUT y el nombre",
                                    "Cualquier información que identifique o haga identificable a una persona",
                                    "Solo información sensible como datos de salud",
                                    "Información pública disponible en internet"
                                ],
                                "respuesta_correcta": 1,
                                "explicacion": "La ley define dato personal de forma amplia..."
                            }
                        ]
                    }
                }
            ]
        },
        {
            "codigo": "MOD-002",
            "nombre": "El Arte de Descubrir Datos: Técnicas de Levantamiento",
            "descripcion": "Aprende a identificar y documentar todos los datos personales en tu organización",
            "duracion_estimada": 90,
            "lecciones": [
                {
                    "codigo": "LEC-002-01",
                    "titulo": "La regla de oro: Pensar en procesos, no en sistemas",
                    "tipo": "teoria",
                    "contenido": {
                        "introduccion": "El error más común es preguntar '¿qué bases de datos tienen?'...",
                        "tecnica_correcta": {
                            "nombre": "Mapeo por Actividades de Negocio",
                            "pasos": [
                                "Identificar las actividades principales del área",
                                "Para cada actividad, preguntar qué información de personas se necesita",
                                "Trazar el flujo de esa información"
                            ]
                        },
                        "ejercicio_reflexion": "Piensa en tu área de trabajo: ¿Cuáles son las 3 actividades principales que realizas con información de personas?"
                    }
                },
                {
                    "codigo": "LEC-002-02", 
                    "titulo": "Simulación: Tu primera entrevista de levantamiento",
                    "tipo": "ejercicio_guiado",
                    "contenido": {
                        "contexto": "Vas a entrevistar al Gerente de RRHH de una empresa salmonera",
                        "personaje": {
                            "nombre": "María González",
                            "cargo": "Gerente de RRHH",
                            "empresa": "Salmones del Sur S.A.",
                            "personalidad": "Muy ocupada, necesitas ser concreto"
                        },
                        "dialogo_interactivo": [
                            {
                                "maria": "Hola, tengo solo 30 minutos. ¿En qué te puedo ayudar?",
                                "opciones_respuesta": [
                                    {
                                        "opcion": "Necesito que me des una lista de todas las bases de datos de RRHH",
                                        "feedback": "María frunce el ceño. 'No sé exactamente qué bases de datos usamos, eso lo ve TI'",
                                        "es_correcta": false
                                    },
                                    {
                                        "opcion": "Cuéntame, ¿cuáles son las principales funciones de tu área?",
                                        "feedback": "María sonríe. 'Ah, eso sí te puedo contar. Principalmente hacemos reclutamiento, gestión de nómina y capacitación'",
                                        "es_correcta": true
                                    }
                                ]
                            }
                        ]
                    }
                }
            ]
        },
        {
            "codigo": "MOD-003",
            "nombre": "Taller Práctico: Construyendo tu primer RAT",
            "descripcion": "Aprende haciendo: documenta una actividad real de tratamiento",
            "duracion_estimada": 120,
            "lecciones": [
                {
                    "codigo": "LEC-003-01",
                    "titulo": "Caso Práctico: Proceso de Selección en Salmonicultura",
                    "tipo": "caso_practico",
                    "contenido": {
                        "empresa_ficticia": {
                            "nombre": "AquaChile S.A.",
                            "descripcion": "Empresa mediana de salmonicultura con 500 empleados",
                            "contexto": "Necesitan contratar 20 operarios para nueva planta"
                        },
                        "tu_rol": "Eres el asesor que debe documentar el proceso de selección",
                        "informacion_recopilada": {
                            "entrevista_rrhh": "Recibimos CVs por email y portal de empleo...",
                            "sistemas_mencionados": ["Email corporativo", "Portal trabajando.com", "Excel de seguimiento"],
                            "datos_que_piden": ["Nombre", "RUT", "Experiencia", "Certificado de buceo"]
                        },
                        "ejercicio": {
                            "instruccion": "Completa el RAT para esta actividad",
                            "plantilla_interactiva": {
                                "nombre_actividad": {
                                    "campo": "input",
                                    "pista": "Piensa: ¿Cuál es la actividad principal?"
                                },
                                "finalidad": {
                                    "campo": "textarea",
                                    "pista": "¿Para qué necesitan esta información?"
                                }
                            }
                        }
                    }
                }
            ]
        }
    ],
    "casos_estudio": [
        {
            "codigo": "CASO-001",
            "nombre": "Salmonera Mediana: Desafíos del Sector Acuícola",
            "industria": "Salmonicultura",
            "descripcion_empresa": "Salmones del Pacífico S.A. - 3 centros de cultivo, 400 empleados",
            "particularidades": [
                "Trabajadores en zonas remotas con conectividad limitada",
                "Uso intensivo de tecnología IoT para monitoreo",
                "Contratistas externos para buceo y mantención",
                "Certificaciones internacionales que requieren trazabilidad"
            ],
            "areas_tipicas": {
                "RRHH": {
                    "actividades": ["Reclutamiento buzos", "Control turnos rotativos"],
                    "desafios": ["Alta rotación", "Capacitaciones de seguridad obligatorias"]
                },
                "Produccion": {
                    "actividades": ["Monitoreo biomasa", "Trazabilidad sanitaria"],
                    "desafios": ["Vincular datos IoT con operarios", "Reportes a SERNAPESCA"]
                }
            }
        }
    ],
    "plantillas_descargables": [
        {
            "nombre": "Guía de Entrevista para RRHH",
            "descripcion": "Preguntas específicas para el área de Recursos Humanos",
            "formato": "PDF",
            "contenido_ejemplo": [
                "1. ¿Cómo es el proceso cuando necesitan contratar a alguien?",
                "2. ¿Qué información piden a los postulantes?",
                "3. ¿Dónde guardan los CVs?"
            ]
        },
        {
            "nombre": "Plantilla Excel RAT Simplificada",
            "descripcion": "Para comenzar a documentar mientras aprendes el sistema",
            "formato": "XLSX",
            "hojas": ["Actividades", "Datos", "Sistemas", "Destinatarios"]
        }
    ]
}


def obtener_ruta_aprendizaje_personalizada(perfil_usuario: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Genera una ruta de aprendizaje personalizada según el perfil del usuario
    """
    ruta = []
    
    # Todos empiezan con fundamentos
    ruta.append({
        "modulo": "MOD-001",
        "obligatorio": True,
        "razon": "Fundamentos esenciales para todos"
    })
    
    # Personalización según rol
    if perfil_usuario.get("rol") == "dpo":
        ruta.extend([
            {"modulo": "MOD-002", "obligatorio": True, "razon": "Técnicas avanzadas de mapeo"},
            {"modulo": "MOD-003", "obligatorio": True, "razon": "Práctica intensiva"}
        ])
    elif perfil_usuario.get("area_negocio") == "RRHH":
        ruta.append({
            "modulo": "MOD-002", 
            "obligatorio": True, 
            "razon": "RRHH maneja datos sensibles críticos",
            "enfoque_especial": ["datos_sensibles", "consentimiento_laboral"]
        })
    
    # Casos de estudio según industria
    if perfil_usuario.get("industria") == "salmonicultura":
        ruta.append({
            "caso_estudio": "CASO-001",
            "obligatorio": False,
            "razon": "Ejemplos específicos de tu industria"
        })
    
    return ruta


def generar_certificado_completacion(usuario_id: str, modulos_completados: List[str]) -> Dict[str, Any]:
    """
    Genera información para el certificado de completación
    """
    return {
        "tipo_certificado": "Fundamentos de Protección de Datos - Ley 21.719",
        "competencias_adquiridas": [
            "Identificar y clasificar datos personales",
            "Realizar entrevistas de levantamiento efectivas", 
            "Documentar actividades de tratamiento en formato RAT",
            "Comprender los principios y obligaciones de la LPDP"
        ],
        "horas_capacitacion": 8,
        "nivel": "Fundamentos",
        "siguiente_nivel_recomendado": "Implementación Práctica LPDP"
    }