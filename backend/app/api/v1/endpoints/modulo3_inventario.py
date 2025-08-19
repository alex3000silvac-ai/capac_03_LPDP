"""
MÓDULO 3: INVENTARIO Y MAPEO DE DATOS - LEY 21.719
Sistema Profesional para Construcción de RAT (Registro de Actividades de Tratamiento)
Herramienta de Trabajo para Abogados e Ingenieros
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, date
from fastapi import APIRouter, HTTPException
import json

router = APIRouter()

# MÓDULO 3 COMPLETO - BASADO EN MANUAL DE PROCEDIMIENTOS PARTE 3
MODULO3_CONTENT = {
    "introduccion": {
        "titulo": "Capítulo 3: Módulo de Inventario y Mapeo de Datos",
        "subtitulo": "Construcción del Registro de Actividades de Tratamiento (RAT) según Ley 21.719",
        "descripcion": "Este capítulo detalla el procedimiento para crear y mantener un inventario exhaustivo de todos los activos de datos personales que la organización trata. Este inventario, también conocido como Registro de Actividades de Tratamiento (RAT), es la piedra angular de todo el sistema de cumplimiento. Sin un conocimiento claro de qué datos se tienen, dónde están, por qué se tienen, cómo fluyen y cuándo deben ser eliminados, es imposible cumplir con los demás principios y obligaciones de la Ley N° 21.719.",
        "importancia_critica": "El RAT no es solo un documento de cumplimiento, sino la herramienta fundamental para la gobernanza de datos. Permite identificar riesgos, establecer controles, y demostrar accountability ante la Agencia de Protección de Datos.",
        "objetivos_profesionales": [
            "Liderar equipos multidisciplinarios para el levantamiento inicial del inventario",
            "Implementar metodologías profesionales de mapeo basadas en procesos de negocio",
            "Crear documentación técnica y legal completa de actividades de tratamiento",
            "Establecer clasificaciones avanzadas de datos por sensibilidad y riesgo",
            "Diseñar y documentar flujos de datos internos y externos complejos",
            "Implementar políticas de retención automatizadas y procedimientos de eliminación segura",
            "Desarrollar capacidades de evaluación de impacto y gestión de riesgos",
            "Crear sistemas de monitoreo y auditoría continua del RAT"
        ],
        "duracion_estimada": "12-16 horas académicas",
        "dirigido_a": "DPOs, Abogados especializados en Privacy, Ingenieros de Datos, Arquitectos de Sistemas, Gerentes de Cumplimiento, Auditores TI",
        "instructor": {
            "perfil": "Abogado Especialista en Protección de Datos",
            "experiencia": "Experto en implementación de Ley 21.719 y normativas internacionales de privacidad",
            "certificaciones": [
                "Certified Information Privacy Professional (CIPP/E)",
                "Data Protection Officer certificado",
                "Especialista en Ley 21.719 Chile"
            ],
            "areas_especializacion": [
                "Implementación práctica de RAT en organizaciones",
                "Evaluaciones de impacto en protección de datos",
                "Transferencias internacionales de datos", 
                "Cumplimiento normativo sectorial",
                "Gestión de incidentes de seguridad"
            ],
            "metodologia_ensenanza": "Enfoque práctico con casos reales y herramientas aplicables inmediatamente en el trabajo"
        },
        "alcance_curso": {
            "cobertura": "Capítulo 3 únicamente - Inventario y Mapeo de Datos",
            "aclaracion": "Este curso se enfoca exclusivamente en el Capítulo 3 del programa completo de LPDP",
            "otros_capitulos": {
                "capitulo_1": "Fundamentos Legales de la Ley 21.719 (curso separado)",
                "capitulo_2": "Conceptos Básicos y Definiciones (curso separado)",
                "capitulo_4": "Derechos de los Titulares (curso separado)",
                "capitulo_5": "Medidas de Seguridad (curso separado)"
            },
            "duracion_total_programa": "60-80 horas académicas (5 capítulos)"
        },
        "prerequisitos": [
            "Conocimiento sólido de la Ley 21.719 y sus reglamentos",
            "Experiencia en gestión de procesos de negocio",
            "Comprensión de arquitecturas de sistemas y flujos de datos",
            "Conocimientos básicos de evaluación de riesgos"
        ]
    },
    
    "seccion_1": {
        "titulo": "3.1 Procedimientos para el Personal - Creación y Mantenimiento del Inventario",
        "contenido": {
            "subseccion_1_1": {
                "titulo": "Procedimiento de Mapeo Inicial de Datos (Data Discovery)",
                "importancia": "El DPO debe liderar un equipo multidisciplinario para el levantamiento inicial del inventario. Este equipo debe incluir representantes de todas las áreas clave que tratan datos personales: RRHH, Finanzas, Marketing, Ventas, Operaciones, TI y Legal.",
                "pasos_criticos": [
                    {
                        "paso": 1,
                        "titulo": "Conformación del Equipo de Trabajo",
                        "descripcion": "El DPO debe liderar un equipo multidisciplinario para el levantamiento inicial del inventario.",
                        "integrantes_requeridos": {
                            "DPO": {
                                "rol": "Líder del proyecto y coordinador técnico-legal",
                                "responsabilidades": [
                                    "Coordinar el equipo multidisciplinario y establecer metodologías",
                                    "Validar la documentación técnica y legal de cada actividad",
                                    "Asegurar cumplimiento estricto de la Ley 21.719 y sus reglamentos",
                                    "Revisar y aprobar el RAT final antes de su implementación",
                                    "Establecer controles de calidad y procedimientos de auditoría"
                                ],
                                "competencias_requeridas": ["Conocimiento profundo Ley 21.719", "Gestión de proyectos", "Análisis de riesgos"]
                            },
                            "RRHH": {
                                "rol": "Experto en datos de personal y procesos laborales",
                                "responsabilidades": [
                                    "Mapear procesos completos de reclutamiento, selección e inducción",
                                    "Documentar datos de empleados, candidatos y ex-empleados",
                                    "Identificar datos sensibles: salud, situación socioeconómica, afiliación sindical",
                                    "Definir políticas de retención diferenciadas para currículums vs. empleados",
                                    "Mapear terceros: empresas de reclutamiento, exámenes médicos, Previred"
                                ],
                                "areas_especializacion": ["Datos biométricos", "Evaluaciones psicológicas", "Datos sindicales"]
                            },
                "Finanzas": {
                    "rol": "Experto en datos financieros",
                    "responsabilidades": [
                        "Mapear procesos de facturación y cobranza",
                        "Documentar datos de clientes y proveedores",
                        "Identificar datos de situación socioeconómica (CRÍTICO en Ley 21.719)",
                        "Mapear transferencias internacionales de datos"
                    ]
                },
                "Marketing/Ventas": {
                    "rol": "Experto en datos comerciales",
                    "responsabilidades": [
                        "Mapear procesos de prospección y CRM",
                        "Documentar bases de datos de clientes",
                        "Identificar cookies y tracking digital",
                        "Revisar contratos con agencias externas"
                    ]
                },
                "TI/Sistemas": {
                    "rol": "Experto técnico",
                    "responsabilidades": [
                        "Mapear arquitectura de sistemas y bases de datos",
                        "Documentar flujos técnicos de datos",
                        "Identificar integraciones y APIs",
                        "Implementar medidas de seguridad técnicas"
                    ]
                },
                "Legal": {
                    "rol": "Experto en bases de licitud",
                    "responsabilidades": [
                        "Validar bases legales para cada tratamiento",
                        "Revisar contratos con terceros (encargados)",
                        "Documentar obligaciones legales de retención",
                        "Validar transferencias internacionales"
                    ]
                },
                "Operaciones": {
                    "rol": "Experto en procesos de negocio",
                    "responsabilidades": [
                        "Mapear procesos operativos con datos personales",
                        "Documentar interacciones con clientes/usuarios",
                        "Identificar datos de IoT y sensores (si aplica)",
                        "Revisar procesos de tercerización"
                    ]
                }
            }
        }
    },
    
    "seccion_2": {
        "titulo": "3.2 Metodología de Levantamiento",
        "contenido": {
            "principio_fundamental": "El proceso NO debe centrarse en preguntar '¿qué bases de datos tienen?', sino en '¿qué actividades o procesos realizan que involucren información de personas?'",
            "metodologia": {
                "fase_1": {
                    "nombre": "Preparación",
                    "actividades": [
                        "Cronograma de entrevistas por área",
                        "Preparación de formularios de levantamiento",
                        "Identificación de stakeholders clave",
                        "Comunicación previa a las áreas"
                    ]
                },
                "fase_2": {
                    "nombre": "Entrevistas Estructuradas",
                    "actividades": [
                        "Entrevistas individuales con dueños de proceso",
                        "Talleres grupales por área de negocio",
                        "Revisión de documentación existente",
                        "Validación de información con usuarios finales"
                    ]
                },
                "fase_3": {
                    "nombre": "Documentación",
                    "actividades": [
                        "Registro de actividades de tratamiento",
                        "Mapeo de flujos de datos",
                        "Clasificación por sensibilidad",
                        "Validación con áreas involucradas"
                    ]
                },
                "fase_4": {
                    "nombre": "Validación y Aprobación",
                    "actividades": [
                        "Revisión legal de bases de licitud",
                        "Validación técnica de medidas de seguridad",
                        "Aprobación por parte del DPO",
                        "Comunicación del RAT final"
                    ]
                }
            }
        }
    }
}

# PREGUNTAS PROFESIONALES POR ÁREA
PREGUNTAS_PROFESIONALES = {
    "RRHH": {
        "categoria": "Gestión de Recursos Humanos",
        "preguntas_especializadas": [
            {
                "id": "rrhh_001",
                "tipo": "proceso_completo",
                "pregunta": "Describa el proceso completo desde que reciben un currículum hasta que se contrata a una persona",
                "objetivo": "Mapear ciclo completo de reclutamiento",
                "seguimiento": [
                    "¿Qué información específica solicitan en la postulación?",
                    "¿Dónde almacenan los currículums recibidos?",
                    "¿Con quién comparten esta información? (ej. empresa de exámenes preocupacionales)",
                    "¿Por cuánto tiempo conservan la información si la persona no es contratada?",
                    "¿Qué datos de referencias laborales solicitan y cómo los verifican?"
                ],
                "datos_identificados": [
                    "Datos de identificación personal",
                    "Historial académico y profesional", 
                    "Datos de contacto (personal y de emergencia)",
                    "Referencias laborales",
                    "Datos de salud (exámenes preocupacionales)",
                    "Datos biométricos (fotos, huellas)",
                    "Situación socioeconómica (CRÍTICO - Nuevo en Ley 21.719)"
                ]
            },
            {
                "id": "rrhh_002", 
                "tipo": "datos_sensibles",
                "pregunta": "¿Qué información sobre salud, situación socioeconómica o datos sensibles manejan de los empleados?",
                "objetivo": "Identificar datos especialmente protegidos",
                "seguimiento": [
                    "¿Solicitan información sobre licencias médicas?",
                    "¿Manejan datos de seguros de salud privados?",
                    "¿Registran información sobre cargas familiares y beneficios sociales?",
                    "¿Tienen acceso a información sobre sueldos de empleados anteriores?",
                    "¿Manejan datos sobre sindicatos o afiliaciones políticas?"
                ],
                "base_legal_requerida": "Consentimiento explícito o interés legítimo muy específico"
            },
            {
                "id": "rrhh_003",
                "tipo": "terceros_encargados", 
                "pregunta": "¿Qué empresas externas procesan datos de empleados por cuenta de la organización?",
                "objetivo": "Identificar relaciones de encargo de tratamiento",
                "seguimiento": [
                    "¿Usan empresas de reclutamiento o headhunters?",
                    "¿Contratan servicios de verificación de antecedentes?",
                    "¿Tienen outsourcing de nómina o beneficios?",
                    "¿Usan plataformas de capacitación online?",
                    "¿Contratan empresas de exámenes médicos ocupacionales?"
                ],
                "documentos_requeridos": [
                    "Contratos de encargo de tratamiento",
                    "Cláusulas de protección de datos",
                    "Procedimientos de seguridad del tercero"
                ]
            }
        ]
    },
    
    "FINANZAS": {
        "categoria": "Gestión Financiera y Contable",
        "preguntas_especializadas": [
            {
                "id": "fin_001",
                "tipo": "proceso_completo",
                "pregunta": "Describa el proceso completo de facturación desde la generación hasta el cobro",
                "objetivo": "Mapear ciclo de revenue y datos de clientes",
                "seguimiento": [
                    "¿Qué datos del cliente registran para facturar?",
                    "¿Cómo verifican la identidad y datos tributarios de clientes?", 
                    "¿Registran información crediticia o de capacidad de pago?",
                    "¿Comparten información con bureaus de crédito?",
                    "¿Por cuánto tiempo conservan la información de clientes que no vuelven a comprar?"
                ],
                "datos_identificados": [
                    "Datos de identificación y contacto",
                    "Información tributaria (RUT, domicilio comercial)",
                    "Datos bancarios y de pago",
                    "Historial crediticio y scoring",
                    "Situación socioeconómica (CRÍTICO - Art. 2 lit. g)",
                    "Patrones de consumo y comportamiento de pago"
                ]
            },
            {
                "id": "fin_002",
                "tipo": "datos_socioeconomicos",
                "pregunta": "¿Qué información sobre la situación socioeconómica de clientes, proveedores o empleados manejan?",
                "objetivo": "Identificar datos especialmente sensibles según Ley 21.719",
                "seguimiento": [
                    "¿Evalúan capacidad crediticia o scoring financiero?",
                    "¿Registran información sobre ingresos o patrimonio?",
                    "¿Manejan datos sobre beneficios sociales o subsidios?",
                    "¿Tienen acceso a información sobre deudas o morosidades?",
                    "¿Procesan información para evaluación de riesgos financieros?"
                ],
                "atencion_especial": "La situación socioeconómica es DATO SENSIBLE en Chile (único en la región)",
                "medidas_reforzadas": [
                    "Consentimiento explícito requerido",
                    "Cifrado de extremo a extremo",
                    "Logs de acceso auditables",
                    "Minimización de datos estricta"
                ]
            },
            {
                "id": "fin_003",
                "tipo": "transferencias_internacionales",
                "pregunta": "¿Envían datos financieros a empresas o sistemas ubicados en otros países?",
                "objetivo": "Mapear transferencias internacionales", 
                "seguimiento": [
                    "¿Usan servicios de pago internacionales (PayPal, Stripe)?",
                    "¿Tienen casa matriz o filiales en otros países?",
                    "¿Usan software financiero con servidores en el extranjero?",
                    "¿Comparten información con bancos corresponsales?",
                    "¿Reportan a agencias calificadoras internacionales?"
                ],
                "documentos_requeridos": [
                    "Cláusulas contractuales estándar",
                    "Evaluación de adecuación del país destino",
                    "Garantías adicionales de protección"
                ]
            }
        ]
    },
    
    "VENTAS_MARKETING": {
        "categoria": "Gestión Comercial y Marketing",
        "preguntas_especializadas": [
            {
                "id": "ven_001",
                "tipo": "proceso_completo",
                "pregunta": "Describa el proceso completo de gestión de leads desde la captación hasta la conversión",
                "objetivo": "Mapear funnel comercial y touchpoints",
                "seguimiento": [
                    "¿Cómo captan información de prospectos (web, eventos, redes sociales)?",
                    "¿Qué datos registran en el CRM de cada interacción?",
                    "¿Realizan perfilamiento o scoring de prospectos?",
                    "¿Comparten leads con canales de venta o partners?",
                    "¿Por cuánto tiempo conservan información de prospectos que no compran?"
                ],
                "datos_identificados": [
                    "Datos de contacto y preferencias",
                    "Comportamiento digital (cookies, navegación)",
                    "Interacciones comerciales (emails, llamadas)",
                    "Perfiles e intereses comerciales",
                    "Geolocalización y patrones de movilidad",
                    "Datos inferidos por IA/algoritmos"
                ]
            },
            {
                "id": "ven_002",
                "tipo": "marketing_digital",
                "pregunta": "¿Qué herramientas de marketing digital utilizan que procesen datos personales?",
                "objetivo": "Mapear ecosistema de marketing tecnológico",
                "seguimiento": [
                    "¿Usan Google Analytics, Facebook Pixel, LinkedIn Insight?",
                    "¿Implementan marketing automation (HubSpot, Marketo)?",
                    "¿Realizan email marketing masivo?",
                    "¿Utilizan chatbots o asistentes virtuales?",
                    "¿Hacen retargeting o remarketing online?"
                ],
                "consideraciones_tecnicas": [
                    "Cookies de terceros y tracking cross-site",
                    "Integración con redes sociales",
                    "Transferencias automáticas a plataformas globales",
                    "Consentimiento granular para marketing"
                ]
            }
        ]
    }
}

# FORMULARIOS DESCARGABLES
FORMULARIOS_DESCARGABLES = {
    "formulario_levantamiento_general": {
        "nombre": "Formulario General de Levantamiento de Actividades",
        "descripcion": "Plantilla estructurada para documentar actividades de tratamiento según Ley 21.719",
        "campos": {
            "identificacion_actividad": {
                "nombre_actividad": "string",
                "area_responsable": "string", 
                "responsable_proceso": "string",
                "fecha_levantamiento": "date"
            },
            "finalidad_tratamiento": {
                "finalidad_principal": "text",
                "finalidades_secundarias": "text",
                "justificacion_necesidad": "text"
            },
            "base_licitud": {
                "base_principal": "select",
                "opciones": [
                    "Consentimiento del titular",
                    "Ejecución de contrato", 
                    "Cumplimiento obligación legal",
                    "Interés vital del titular",
                    "Interés público",
                    "Interés legítimo"
                ],
                "justificacion_base": "text"
            },
            "categorias_datos": {
                "datos_identificacion": "boolean",
                "datos_contacto": "boolean", 
                "datos_laborales": "boolean",
                "datos_financieros": "boolean",
                "datos_salud": "boolean",
                "datos_biometricos": "boolean",
                "situacion_socioeconomica": "boolean",
                "otros_datos": "text"
            },
            "categorias_titulares": {
                "empleados": "boolean",
                "candidatos": "boolean",
                "clientes": "boolean",
                "proveedores": "boolean",
                "menores_edad": "boolean",
                "otros_titulares": "text"
            },
            "sistemas_almacenamiento": {
                "sistemas_locales": "text",
                "sistemas_cloud": "text",
                "bases_datos": "text",
                "aplicaciones": "text"
            },
            "destinatarios": {
                "areas_internas": "text",
                "terceros_encargados": "text",
                "terceros_cesionarios": "text",
                "organismos_publicos": "text"
            },
            "transferencias_internacionales": {
                "existe_transferencia": "boolean",
                "paises_destino": "text",
                "garantias_adecuacion": "text",
                "clausulas_contractuales": "text"
            },
            "retencion_eliminacion": {
                "plazo_conservacion": "text",
                "criterios_eliminacion": "text",
                "procedimiento_borrado": "text"
            },
            "medidas_seguridad": {
                "medidas_tecnicas": "text",
                "medidas_organizativas": "text",
                "controles_acceso": "text",
                "cifrado": "text"
            }
        }
    },
    
    "guia_entrevista_rrhh": {
        "nombre": "Guía de Entrevista Especializada - RRHH",
        "descripcion": "Preguntas específicas para mapear actividades de recursos humanos",
        "secciones": [
            {
                "seccion": "Reclutamiento y Selección",
                "preguntas": [
                    "¿Cómo publican las vacantes y en qué plataformas?",
                    "¿Qué información solicitan en el formulario de postulación?",
                    "¿Realizan verificación de antecedentes? ¿Con qué empresas?",
                    "¿Solicitan exámenes médicos? ¿Qué tipo de información obtienen?",
                    "¿Por cuánto tiempo conservan currículums de personas no seleccionadas?"
                ]
            },
            {
                "seccion": "Gestión de Personal",
                "preguntas": [
                    "¿Qué datos del empleado registran en el sistema de RRHH?",
                    "¿Manejan información sobre cargas familiares y beneficios?",
                    "¿Registran datos sobre capacitación y evaluaciones de desempeño?",
                    "¿Procesan información de licencias médicas?",
                    "¿Tienen acceso a información sobre situación socioeconómica del empleado?"
                ]
            },
            {
                "seccion": "Relaciones Laborales",
                "preguntas": [
                    "¿Registran información sobre afiliación sindical?",
                    "¿Manejan datos sobre procedimientos disciplinarios?", 
                    "¿Procesan información sobre accidentes laborales?",
                    "¿Registran datos sobre términos de contrato (despidos, renuncias)?",
                    "¿Comparten información con organismos laborales (DT, ISL)?"
                ]
            }
        ]
    },
    
    "matriz_clasificacion_datos": {
        "nombre": "Matriz de Clasificación de Datos por Sensibilidad",
        "descripcion": "Herramienta para clasificar datos según nivel de protección requerido",
        "niveles": {
            "publico": {
                "definicion": "Información que puede ser divulgada sin restricciones",
                "ejemplos": ["Nombre y cargo en sitio web", "Información corporativa general"],
                "medidas_minimas": ["Control de acceso básico"]
            },
            "interno": {
                "definicion": "Información para uso interno de la organización",
                "ejemplos": ["Directorios internos", "Organigrama detallado"],
                "medidas_minimas": ["Control de acceso por roles", "Confidencialidad contractual"]
            },
            "confidencial": {
                "definicion": "Datos personales comunes con acceso restringido",
                "ejemplos": ["Datos de contacto de clientes", "Información laboral básica"],
                "medidas_minimas": ["Cifrado en tránsito", "Logs de acceso", "Políticas de retención"]
            },
            "restringido": {
                "definicion": "Datos especialmente protegidos por ley",
                "ejemplos": ["Datos de salud", "Situación socioeconómica", "Datos biométricos"],
                "medidas_minimas": [
                    "Cifrado de extremo a extremo",
                    "Segregación de redes",
                    "Autenticación multifactor",
                    "Auditoría continua",
                    "Consentimiento explícito"
                ]
            }
        }
    }
}

# CASOS PRÁCTICOS REALES
CASOS_PRACTICOS = {
    "caso_salmonera": {
        "titulo": "Caso Práctico: Empresa Salmonera - Monitoreo IoT y Datos de Personal",
        "contexto": "Empresa salmonera que utiliza tecnología IoT para monitoreo de centros de cultivo y gestión de personal en terreno",
        "desafio": "Determinar cuándo los datos de sensores IoT se convierten en datos personales y cómo manejar la geolocalización del personal",
        "datos_involucrados": [
            "Sensores de temperatura y oxígeno en agua",
            "Cámaras de video para monitoreo de peces",
            "GPS de vehículos y personal en terreno",
            "Sistemas de alimentación automatizada",
            "Reportes de mortalidad y salud de biomasa"
        ],
        "punto_critico": "Si los datos pueden vincularse a un centro de cultivo específico o a un operario, quedan bajo el ámbito de la ley",
        "solucion_recomendada": {
            "clasificacion": "Los datos de sensores son datos personales cuando permiten identificar al responsable del centro o turno",
            "medidas": [
                "Anonimización de datos agregados para reportes",
                "Separación entre datos operacionales y datos de personal",
                "Cifrado de datos de geolocalización personal",
                "Políticas de retención diferenciadas por tipo de dato"
            ],
            "base_licitud": "Interés legítimo para eficiencia productiva + cumplimiento de normativas sanitarias"
        }
    },
    
    "caso_retail_online": {
        "titulo": "Caso Práctico: Retail Online - Marketing Digital y Situación Socioeconómica",
        "contexto": "Empresa de retail online que utiliza IA para scoring crediticio y marketing personalizado",
        "desafio": "Manejar datos de situación socioeconómica para análisis crediticio y evitar discriminación algorítmica",
        "datos_involucrados": [
            "Historial de compras y patrones de consumo",
            "Datos de geolocalización y movilidad",
            "Información crediticia y scoring",
            "Datos inferidos por algoritmos de ML",
            "Información de redes sociales y digital footprint"
        ],
        "punto_critico": "La situación socioeconómica es dato sensible en Chile - requiere protección especial",
        "solucion_recomendada": {
            "clasificacion": "Todos los datos que permitan inferir capacidad económica son sensibles",
            "medidas": [
                "Consentimiento explícito para scoring crediticio",
                "Auditoría de algoritmos para evitar sesgos",
                "Minimización de datos - solo lo necesario",
                "Derecho a explicación de decisiones automatizadas"
            ],
            "base_licitud": "Consentimiento explícito + interés legítimo para prevención de fraude"
        }
    }
}

# PLANTILLAS RAT PROFESIONALES
PLANTILLAS_RAT = {
    "plantilla_completa": {
        "nombre": "Plantilla RAT Completa - Ley 21.719",
        "descripcion": "Registro exhaustivo de actividades de tratamiento según estándares legales chilenos",
        "campos_obligatorios": {
            "id_actividad": {
                "tipo": "string",
                "descripcion": "Identificador único de la actividad (ej. RRHH-001)",
                "ejemplo": "PROD-001"
            },
            "nombre_actividad": {
                "tipo": "string", 
                "descripcion": "Denominación clara de la actividad de tratamiento",
                "ejemplo": "Monitoreo de salud y alimentación de biomasa mediante IA"
            },
            "responsable_proceso": {
                "tipo": "string",
                "descripcion": "Cargo del responsable del proceso de negocio",
                "ejemplo": "Gerente de Producción"
            },
            "finalidades": {
                "tipo": "array",
                "descripcion": "Lista detallada de todas las finalidades del tratamiento",
                "ejemplo": [
                    "Optimizar la alimentación",
                    "Detectar tempranamente enfermedades", 
                    "Asegurar el bienestar animal",
                    "Cumplir con normativas sanitarias"
                ]
            },
            "base_licitud": {
                "tipo": "array",
                "descripcion": "Base legal específica para cada finalidad",
                "ejemplo": [
                    "Interés legítimo (eficiencia productiva y bienestar animal)",
                    "Cumplimiento de obligación legal (normativa sanitaria)"
                ]
            },
            "categorias_titulares": {
                "tipo": "array",
                "descripcion": "Tipos de personas cuyos datos se procesan",
                "ejemplo": ["Operarios de centro de cultivo", "Personal técnico"]
            },
            "categorias_datos": {
                "tipo": "object",
                "descripcion": "Clasificación detallada de los datos procesados",
                "estructura": {
                    "datos_comunes": ["Identificación", "Contacto", "Laborales"],
                    "datos_sensibles": ["Salud", "Situación socioeconómica", "Biométricos"],
                    "datos_especiales": ["Menores", "Representantes legales"]
                }
            },
            "sistemas_implicados": {
                "tipo": "array",
                "descripcion": "Sistemas tecnológicos que procesan los datos",
                "ejemplo": ["Sensores IoT", "Software de Acuicultura", "Plataforma de IA", "ERP SAP"]
            },
            "destinatarios": {
                "tipo": "object",
                "descripcion": "Quién tiene acceso a los datos",
                "estructura": {
                    "internos": ["Equipo de Producción", "Veterinarios"],
                    "externos": ["SERNAPESCA (reportes agregados)"],
                    "encargados": ["Proveedor plataforma IA", "Empresa de mantención"]
                }
            },
            "transferencias_internacionales": {
                "tipo": "object",
                "descripcion": "Detalles de envíos de datos al extranjero",
                "estructura": {
                    "existe": "boolean",
                    "destinos": ["País de destino"],
                    "garantias": ["Tipo de protección legal"],
                    "mecanismos": ["Cláusulas contractuales", "Decisión de adecuación"]
                }
            },
            "plazo_conservacion": {
                "tipo": "object", 
                "descripcion": "Políticas de retención específicas",
                "estructura": {
                    "datos_brutos": "2 años",
                    "informes_agregados": "10 años", 
                    "criterio_eliminacion": "Finalización de período de retención legal"
                }
            },
            "medidas_seguridad": {
                "tipo": "object",
                "descripcion": "Medidas técnicas y organizativas implementadas",
                "estructura": {
                    "tecnicas": [
                        "Cifrado de datos en tránsito y en reposo",
                        "Control de acceso basado en roles (RBAC)",
                        "Logs de auditoría inmutables"
                    ],
                    "organizativas": [
                        "Capacitación del personal",
                        "Políticas de acceso y uso",
                        "Procedimientos de respuesta a incidentes"
                    ]
                }
            }
        }
    }
}

@router.get("/introduccion")
def get_introduccion_modulo3():
    """Obtener introducción completa del Módulo 3"""
    return {
        "modulo": "Módulo 3: Inventario y Mapeo de Datos",
        "ley_base": "Ley N° 21.719 - Protección de Datos Personales Chile",
        "vigencia": "1 de diciembre de 2026",
        "instructor": {
            "perfil": "Abogado Especialista en Protección de Datos",
            "experiencia": "Experto en implementación de Ley 21.719 y normativas internacionales de privacidad",
            "certificaciones": [
                "Certified Information Privacy Professional (CIPP/E)",
                "Data Protection Officer certificado",
                "Especialista en Ley 21.719 Chile"
            ]
        },
        "alcance_curso": {
            "cobertura": "Capítulo 3 únicamente - Inventario y Mapeo de Datos",
            "aclaracion": "Este curso se enfoca exclusivamente en el Capítulo 3 del programa completo de LPDP"
        },
        "metodologia_aprendizaje": {
            "modalidad": "Teórico-Práctica",
            "incluye": [
                "Fundamentos legales de la Ley 21.719",
                "Metodologías profesionales de mapeo",
                "Herramientas de trabajo descargables",
                "Casos prácticos reales",
                "Plantillas RAT completas",
                "Formularios de entrevistas"
            ]
        }
    }

@router.get("/seccion/{seccion_id}")
def get_seccion_modulo3(seccion_id: str):
    """Obtener contenido de sección específica"""
    if seccion_id not in MODULO3_CONTENT:
        raise HTTPException(status_code=404, detail=f"Sección {seccion_id} no encontrada")
    
    return {
        "seccion_id": seccion_id,
        "contenido": MODULO3_CONTENT[seccion_id],
        "navegacion": {
            "anterior": _get_seccion_anterior(seccion_id),
            "siguiente": _get_seccion_siguiente(seccion_id)
        }
    }

@router.get("/preguntas/{area}")
def get_preguntas_profesionales(area: str):
    """Obtener preguntas profesionales por área"""
    area_upper = area.upper()
    if area_upper not in PREGUNTAS_PROFESIONALES:
        raise HTTPException(status_code=404, detail=f"Área {area} no encontrada")
    
    return {
        "area": area_upper,
        "preguntas": PREGUNTAS_PROFESIONALES[area_upper],
        "instrucciones": {
            "objetivo": "Estas preguntas están diseñadas para profesionales (DPOs, abogados, ingenieros)",
            "metodologia": "Realizar entrevistas estructuradas con dueños de proceso",
            "documentacion": "Cada respuesta debe documentarse en el formato RAT",
            "validacion": "Las respuestas deben ser validadas por el área legal y técnica"
        }
    }

@router.get("/formularios")
def get_formularios_descargables():
    """Obtener todos los formularios descargables"""
    return {
        "formularios_disponibles": FORMULARIOS_DESCARGABLES,
        "instrucciones_uso": {
            "descarga": "Los formularios están en formato JSON estructurado",
            "implementacion": "Pueden ser implementados en sistemas internos",
            "personalizacion": "Adaptables según necesidades específicas de cada organización",
            "validacion": "Incluyen validaciones según requerimientos de Ley 21.719"
        },
        "formatos_adicionales": [
            "Excel con macros de validación",
            "Word con campos protegidos", 
            "PDF rellenable",
            "Formularios web responsivos"
        ]
    }

@router.get("/casos-practicos")
def get_casos_practicos():
    """Obtener casos prácticos reales"""
    return {
        "casos_disponibles": CASOS_PRACTICOS,
        "metodologia_casos": {
            "estructura": "Contexto → Desafío → Análisis → Solución",
            "aplicacion": "Cada caso incluye plantillas y documentos aplicables",
            "sectores": ["Acuicultura", "Retail", "Servicios Financieros", "Salud"],
            "actualizacion": "Casos actualizados según jurisprudencia y criterios de la Agencia"
        },
        "ejercicios_practicos": [
            "Completar RAT para caso similar a su organización",
            "Identificar datos sensibles en cada caso",
            "Proponer medidas de seguridad específicas",
            "Evaluar bases de licitud aplicables"
        ]
    }

@router.get("/plantillas-rat")
def get_plantillas_rat():
    """Obtener plantillas completas de RAT"""
    return {
        "plantillas": PLANTILLAS_RAT,
        "implementacion": {
            "sistemas_compatibles": ["Excel", "Google Sheets", "Sistemas ERP", "Plataformas de GRC"],
            "exportacion": ["JSON", "XML", "CSV", "PDF"],
            "integraciones": ["APIs REST", "Webhooks", "LDAP", "Active Directory"]
        },
        "validacion_legal": {
            "cumplimiento": "100% conforme con Ley 21.719",
            "actualizacion": "Plantillas actualizadas según reglamentos de la Agencia",
            "auditoria": "Preparadas para auditorías de cumplimiento"
        }
    }

@router.post("/generar-rat")
def generar_rat_personalizado(
    datos_organizacion: Dict[str, Any]
):
    """Generar RAT personalizado para la organización"""
    
    # Simular generación de RAT personalizado
    rat_generado = {
        "id_rat": f"RAT_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        "organizacion": datos_organizacion.get("nombre_organizacion", "Organización"),
        "fecha_generacion": datetime.now().isoformat(),
        "responsable": "usuario_sistema",
        "actividades_identificadas": [],
        "estado": "borrador",
        "proximos_pasos": [
            "Revisar actividades identificadas",
            "Validar bases de licitud",
            "Completar medidas de seguridad",
            "Obtener aprobación del DPO"
        ]
    }
    
    return {
        "mensaje": "RAT generado exitosamente",
        "rat": rat_generado,
        "instrucciones": {
            "siguiente_paso": "Completar entrevistas con áreas identificadas",
            "documentos_requeridos": ["Contratos con terceros", "Políticas internas", "Diagramas de arquitectura"],
            "plazo_recomendado": "4-6 semanas para RAT completo"
        }
    }

@router.get("/simulator")
async def get_simulator():
    """Obtener simulador interactivo de mapeo de datos"""
    return {
        "simulator_type": "data_mapping_professional",
        "description": "Simuladores profesionales para practicar el mapeo de datos según Ley 21.719",
        "scenarios": [
            {
                "id": "rrhh_recruitment_complete",
                "name": "Proceso Completo de Reclutamiento RRHH",
                "difficulty": "intermediate",
                "description": "Mapeo profesional del ciclo completo desde recepción de CV hasta contratación",
                "estimated_time": "25 minutos",
                "learning_objectives": [
                    "Identificar todos los puntos de recolección de datos personales",
                    "Clasificar datos según sensibilidad (incluye situación socioeconómica)",
                    "Mapear flujos internos y externos de datos",
                    "Definir políticas de retención específicas"
                ]
            },
            {
                "id": "iot_salmon_farming",
                "name": "Monitoreo IoT en Acuicultura",
                "difficulty": "advanced",
                "description": "Identificación de datos personales en sistemas de monitoreo IoT para centros de cultivo",
                "estimated_time": "30 minutos",
                "learning_objectives": [
                    "Identificar datos personales 'ocultos' en sistemas IoT",
                    "Mapear flujos de datos en tiempo real",
                    "Evaluar transferencias internacionales de datos",
                    "Aplicar principios de minimización en IoT"
                ]
            },
            {
                "id": "financial_socioeconomic",
                "name": "Gestión Financiera y Datos Socioeconómicos",
                "difficulty": "advanced",
                "description": "Manejo de situación socioeconómica como dato sensible según Ley 21.719",
                "estimated_time": "20 minutos",
                "learning_objectives": [
                    "Identificar situación socioeconómica como dato sensible",
                    "Mapear evaluaciones crediticias y scoring",
                    "Documentar transferencias a centrales de riesgo",
                    "Establecer bases de licitud apropiadas"
                ]
            }
        ],
        "simulation_features": {
            "interactive_mapping": True,
            "real_time_feedback": True,
            "compliance_validation": True,
            "downloadable_results": True,
            "team_collaboration": True
        }
    }

@router.get("/simulator/{scenario_id}")
async def get_simulator_scenario(scenario_id: str):
    """Obtener escenario específico del simulador"""
    
    scenarios_detail = {
        "rrhh_recruitment_complete": {
            "scenario": {
                "id": "rrhh_recruitment_complete",
                "title": "Simulador: Mapeo Completo de Reclutamiento RRHH",
                "context": "Eres el DPO de SalmonTech SpA, empresa con 500+ empleados. Debes mapear completamente el proceso de reclutamiento que maneja 200+ postulaciones mensuales.",
                "current_situation": "La empresa no tiene documentado su RAT para reclutamiento y requiere cumplimiento inmediato con Ley 21.719.",
                "your_role": "DPO responsable de crear el RAT completo y políticas de retención",
                "time_limit": "25 minutos",
                "success_criteria": [
                    "RAT completo con todos los campos obligatorios",
                    "Identificación correcta de datos sensibles", 
                    "Mapeo de flujos internos y externos",
                    "Políticas de retención definidas",
                    "Medidas de seguridad especificadas"
                ]
            },
            "steps": [
                {
                    "step": 1,
                    "title": "Identificación de la Actividad",
                    "instruction": "Define el nombre y alcance de la actividad de tratamiento",
                    "questions": [
                        {
                            "id": "activity_name",
                            "type": "text",
                            "question": "¿Cómo denominarías esta actividad de tratamiento?",
                            "hint": "Debe ser específico y claro. Ej: 'Proceso de Reclutamiento y Selección de Personal'",
                            "validation": "required",
                            "best_practice": "El nombre debe reflejar el proceso completo, no solo una parte"
                        },
                        {
                            "id": "process_scope",
                            "type": "multiple_choice",
                            "question": "¿Cuál es el alcance temporal del proceso?",
                            "options": [
                                "Solo hasta la entrevista",
                                "Hasta la decisión de contratación",
                                "Incluye seguimiento post-contratación",
                                "Desde recepción CV hasta inducción completa"
                            ],
                            "correct": "Desde recepción CV hasta inducción completa",
                            "explanation": "Para efectos del RAT, debe incluir todo el ciclo que involucre datos personales"
                        }
                    ]
                },
                {
                    "step": 2,
                    "title": "Identificación de Finalidades",
                    "instruction": "Define todas las finalidades del tratamiento de datos",
                    "questions": [
                        {
                            "id": "primary_purposes",
                            "type": "checkbox_multiple",
                            "question": "¿Cuáles son las finalidades del tratamiento? (Selecciona todas las aplicables)",
                            "options": [
                                "Evaluar idoneidad para el cargo",
                                "Verificar antecedentes laborales",
                                "Cumplir obligaciones precontractuales",
                                "Realizar exámenes preocupacionales",
                                "Verificar referencias profesionales",
                                "Análisis estadístico del proceso",
                                "Creación de base de talentos futura"
                            ],
                            "min_required": 3,
                            "explanation": "Cada finalidad debe estar claramente justificada y ser necesaria"
                        }
                    ]
                },
                {
                    "step": 3,
                    "title": "Clasificación de Datos",
                    "instruction": "Identifica y clasifica todos los datos personales tratados",
                    "questions": [
                        {
                            "id": "data_classification",
                            "type": "classification_exercise",
                            "question": "Clasifica los siguientes datos según su sensibilidad:",
                            "data_items": [
                                "Nombre completo",
                                "RUT",
                                "Dirección personal",
                                "Sueldo pretensiones",
                                "Antecedentes penales",
                                "Estado civil",
                                "Cargas familiares",
                                "Exámenes médicos preocupacionales",
                                "Afiliación sindical anterior",
                                "Historial crediticio",
                                "Nivel socioeconómico familiar"
                            ],
                            "categories": [
                                "Datos comunes",
                                "Datos sensibles",
                                "Requiere análisis específico"
                            ],
                            "correct_classification": {
                                "Datos comunes": ["Nombre completo", "RUT", "Dirección personal", "Estado civil"],
                                "Datos sensibles": ["Exámenes médicos preocupacionales", "Afiliación sindical anterior", "Sueldo pretensiones", "Historial crediticio", "Nivel socioeconómico familiar"],
                                "Requiere análisis específico": ["Antecedentes penales", "Cargas familiares"]
                            },
                            "key_learning": "Sueldo pretensiones e historial crediticio son datos sensibles por 'situación socioeconómica' según Ley 21.719"
                        }
                    ]
                }
            ]
        },
        "iot_salmon_farming": {
            "scenario": {
                "id": "iot_salmon_farming",
                "title": "Simulador: Datos Personales en IoT Acuícola",
                "context": "Centro de cultivo de salmón con sistema IoT 24/7. Los sensores monitorean temperatura, oxígeno, alimentación y movimiento del personal.",
                "current_situation": "La empresa debe determinar cuándo los datos de sensores se convierten en datos personales",
                "your_role": "DPO especializado en IoT industrial",
                "time_limit": "30 minutos",
                "key_challenge": "Identificar datos personales 'ocultos' en sistemas aparentemente no personales"
            },
            "learning_points": [
                "Datos de geolocalización de personal son siempre personales",
                "Datos operacionales pueden ser personales si identifican al responsable",
                "IoT requiere evaluación de impacto específica",
                "Transferencias a cloud extranjero necesitan garantías"
            ]
        }
    }
    
    if scenario_id not in scenarios_detail:
        raise HTTPException(status_code=404, detail="Escenario no encontrado")
    
    return scenarios_detail[scenario_id]

@router.get("/downloadables/dpo-program")
async def get_dpo_program_structure():
    """Obtener estructura descargable completa para programa DPO"""
    return {
        "program_structure": {
            "title": "Programa Integral de Cumplimiento LPDP para DPOs",
            "description": "Estructura completa descargable para implementar programa de protección de datos según Ley 21.719",
            "modules": [
                {
                    "module_id": "modulo_1_fundamentos",
                    "name": "Fundamentos Legales",
                    "downloadables": [
                        "Resumen ejecutivo Ley 21.719",
                        "Matriz de obligaciones por rol",
                        "Cronograma de implementación",
                        "Checklist de cumplimiento"
                    ]
                },
                {
                    "module_id": "modulo_2_conceptos",
                    "name": "Conceptos y Definiciones",
                    "downloadables": [
                        "Glosario técnico-legal",
                        "Diagrama de flujo de decisiones",
                        "Casos de uso por industria",
                        "FAQ jurisprudencial"
                    ]
                },
                {
                    "module_id": "modulo_3_inventario",
                    "name": "Inventario y Mapeo (ESTE MÓDULO)",
                    "downloadables": [
                        "Plantillas RAT profesionales",
                        "Formularios de entrevista por área",
                        "Matriz de clasificación de datos",
                        "Simuladores de mapeo",
                        "Casos prácticos IoT y acuicultura",
                        "Templates de políticas de retención"
                    ]
                }
            ]
        },
        "implementation_tools": {
            "templates": [
                {
                    "name": "Manual DPO Completo",
                    "format": "PDF + Word editable",
                    "pages": "150+ páginas",
                    "includes": ["Procedimientos paso a paso", "Formularios listos", "Casos reales"]
                },
                {
                    "name": "Kit de Formularios",
                    "format": "Excel + JSON + PDF",
                    "quantity": "25+ formularios",
                    "includes": ["RAT templates", "Entrevistas estructuradas", "Matrices de riesgo"]
                },
                {
                    "name": "Simuladores Interactivos",
                    "format": "Web + Standalone",
                    "scenarios": "10+ escenarios",
                    "includes": ["RRHH", "Finanzas", "IoT", "Marketing", "Salud"]
                }
            ],
            "training_materials": [
                {
                    "type": "Presentaciones ejecutivas",
                    "format": "PowerPoint + PDF",
                    "duration": "2-4 horas por módulo",
                    "audience": "Directorio, gerencias, equipos técnicos"
                },
                {
                    "type": "Videos explicativos",
                    "format": "MP4 + transcripciones",
                    "duration": "5-15 minutos por tema",
                    "topics": "Conceptos clave, casos prácticos, procedimientos"
                }
            ]
        },
        "download_packages": {
            "basic_package": {
                "name": "Paquete Básico DPO",
                "price": "Incluido en curso",
                "includes": ["Templates RAT", "Formularios básicos", "Checklist cumplimiento"],
                "format": "ZIP con PDF + Excel"
            },
            "professional_package": {
                "name": "Paquete Profesional DPO",
                "price": "Consultar",
                "includes": ["Manual completo", "Simuladores", "Videos", "Soporte 90 días"],
                "format": "Plataforma online + descargas"
            },
            "enterprise_package": {
                "name": "Paquete Empresarial DPO",
                "price": "Consultar",
                "includes": ["Todo lo anterior", "Personalización", "Capacitación presencial", "Auditoría inicial"],
                "format": "Implementación completa"
            }
        }
    }

@router.get("/evaluacion")
def get_evaluacion_modulo3():
    """Obtener evaluación profesional del módulo"""
    return {
        "evaluacion": {
            "tipo": "Evaluación Práctica Profesional",
            "modalidad": "Entregable RAT + Examen teórico + Simulador",
            "puntaje_minimo": "80% para certificación",
            "tiempo_estimado": "4-5 horas"
        },
        "componentes": {
            "teorico": {
                "peso": "30%",
                "temas": [
                    "Artículos específicos de Ley 21.719",
                    "Bases de licitud y su aplicación",
                    "Datos sensibles y medidas especiales",
                    "Transferencias internacionales",
                    "Derechos de los titulares"
                ]
            },
            "practico": {
                "peso": "50%",
                "entregables": [
                    "RAT completo de al menos 5 actividades",
                    "Clasificación de datos por sensibilidad",
                    "Mapeo de flujos de datos",
                    "Propuesta de medidas de seguridad",
                    "Cronograma de implementación"
                ]
            },
            "simulador": {
                "peso": "20%",
                "requisitos": [
                    "Completar al menos 2 escenarios del simulador",
                    "Obtener 85%+ en cada escenario",
                    "Documentar lecciones aprendidas",
                    "Proponer mejoras al proceso"
                ]
            }
        },
        "criterios_evaluacion": [
            "Completitud técnica del RAT",
            "Precisión legal de bases de licitud",
            "Identificación correcta de datos sensibles",
            "Viabilidad de medidas propuestas",
            "Comprensión de obligaciones legales",
            "Aplicación práctica en simuladores"
        ]
    }

def _get_seccion_anterior(seccion_id: str) -> Optional[str]:
    """Obtener sección anterior en el flujo de navegación"""
    flujo = ["introduccion", "seccion_1", "seccion_2"]
    try:
        indice = flujo.index(seccion_id)
        return flujo[indice - 1] if indice > 0 else None
    except ValueError:
        return None

def _get_seccion_siguiente(seccion_id: str) -> Optional[str]:
    """Obtener sección siguiente en el flujo de navegación"""
    flujo = ["introduccion", "seccion_1", "seccion_2"]
    try:
        indice = flujo.index(seccion_id)
        return flujo[indice + 1] if indice < len(flujo) - 1 else None
    except ValueError:
        return None