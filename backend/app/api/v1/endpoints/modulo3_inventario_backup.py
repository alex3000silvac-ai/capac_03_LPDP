"""
MÓDULO 3: INVENTARIO Y MAPEO DE DATOS - LEY 21.719
CURSO COMPLETO BASADO EN MANUAL DE PROCEDIMIENTOS PARTE 3
Sistema Profesional para DPOs, Abogados e Ingenieros
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, date
from fastapi import APIRouter, HTTPException
import json

router = APIRouter()

# MÓDULO 3 COMPLETO - SIGUIENDO EXACTAMENTE EL ORDEN DEL MANUAL
MODULO3_CONTENT = {
    "introduccion": {
        "titulo": "Capítulo 3: Módulo de Inventario y Mapeo de Datos",
        "descripcion_manual": "Este capítulo detalla el procedimiento para crear y mantener un inventario exhaustivo de todos los activos de datos personales que la organización trata. Este inventario, también conocido como Registro de Actividades de Tratamiento (RAT), es la piedra angular de todo el sistema de cumplimiento.",
        "importancia_critica": "Sin un conocimiento claro de qué datos se tienen, dónde están, por qué se tienen, cómo fluyen y cuándo deben ser eliminados, es imposible cumplir con los demás principios y obligaciones de la Ley N° 21.719.",
        "objetivo_final": "Crear un inventario real y funcional que el usuario pueda implementar en su trabajo diario",
        "estructura_curso": {
            "seccion_3_1": "Procedimientos para el Personal (Creación y Mantenimiento del Inventario)",
            "seccion_3_2": "Especificaciones Técnicas del Sistema (Plataforma de Gobernanza de Datos)"
        }
    },
    
    "seccion_3_1": {
        "titulo": "3.1. Procedimientos para el Personal (Creación y Mantenimiento del Inventario)",
        "contenido": {
            "procedimiento_mapeo_inicial": {
                "titulo": "Procedimiento de Mapeo Inicial de Datos (Data Discovery)",
                "descripcion": "Proceso estructurado para identificar y documentar todas las actividades de tratamiento de datos personales",
                
                "paso_1_equipo_trabajo": {
                    "titulo": "1. Conformación del Equipo de Trabajo",
                    "descripcion_manual": "El DPO debe liderar un equipo multidisciplinario para el levantamiento inicial del inventario. Este equipo debe incluir representantes de todas las áreas clave que tratan datos personales: RRHH, Finanzas, Marketing, Ventas, Operaciones, TI y Legal.",
                    "tip_legal_practico": "💡 TIP LEGAL: El Art. 38 de la Ley 21.719 establece que el DPO debe supervisar el cumplimiento. Formar este equipo multidisciplinario es OBLIGATORIO para cumplir con esta supervisión efectiva.",
                    
                    "equipo_detallado": {
                        "DPO_lider": {
                            "rol": "Líder del proyecto y coordinador técnico-legal",
                            "responsabilidades_especificas": [
                                "Coordinar reuniones semanales con cada área durante el levantamiento",
                                "Validar que cada actividad documentada cumpla con los requisitos del Art. 31 (RAT)",
                                "Asegurar que las bases de licitud identificadas sean conformes al Art. 7",
                                "Supervisar que los datos sensibles sean clasificados según Art. 2 lit. g",
                                "Aprobar el RAT final antes de su implementación"
                            ],
                            "competencias_requeridas": [
                                "Conocimiento profundo de Ley 21.719 y reglamentos",
                                "Experiencia en gestión de proyectos de compliance",
                                "Capacidad de traducir requisitos legales a procesos operativos"
                            ]
                        },
                        
                        "RRHH_representante": {
                            "rol": "Experto en datos de personal y procesos laborales",
                            "responsabilidades_criticas": [
                                "Mapear TODO el ciclo de vida del empleado: desde postulación hasta post-empleo",
                                "Identificar datos sensibles especialmente 'situación socioeconómica' (novedad Ley 21.719)",
                                "Documentar transferencias a terceros: Previred, mutuales, empresas de examenes",
                                "Definir políticas de retención diferenciadas para empleados vs. candidatos",
                                "Mapear datos de familiares (cargas) que son datos de NNA"
                            ],
                            "casos_practicos_rrhh": {
                                "caso_reclutamiento": {
                                    "proceso": "Reclutamiento y Selección de Personal",
                                    "datos_involucrados": [
                                        "CV y datos de postulación",
                                        "Resultados de evaluaciones psicotécnicas",
                                        "Exámenes preocupacionales (DATO SENSIBLE - salud)",
                                        "Verificación de referencias laborales",
                                        "Evaluación socioeconómica para definir renta (DATO SENSIBLE - situación socioeconómica)"
                                    ],
                                    "terceros_involucrados": [
                                        "Empresa de exámenes médicos",
                                        "Consultoría de evaluaciones psicológicas",
                                        "Empresas de verificación de antecedentes"
                                    ],
                                    "tip_legal": "⚖️ La evaluación socioeconómica para definir renta es DATO SENSIBLE según Art. 2 lit. g de la Ley 21.719. Requiere medidas especiales de protección."
                                },
                                "caso_nomina": {
                                    "proceso": "Gestión de Nómina y Beneficios",
                                    "datos_criticos": [
                                        "Datos bancarios para pago de remuneraciones",
                                        "Información de cargas familiares (datos de NNA)",
                                        "Licencias médicas (datos de salud)",
                                        "Descuentos por obligaciones alimentarias",
                                        "Beneficios sociales basados en situación socioeconómica"
                                    ],
                                    "transferencias_obligatorias": [
                                        "Previred (cotizaciones previsionales)",
                                        "SII (información tributaria)",
                                        "Mutual de Seguridad (licencias médicas)",
                                        "Cajas de Compensación (asignaciones familiares)"
                                    ],
                                    "tip_practico": "🔧 CONSEJO PRÁCTICO: Documente CADA transferencia a Previred detallando qué datos específicos se envían y con qué frecuencia."
                                }
                            }
                        },
                        
                        "Finanzas_representante": {
                            "rol": "Experto en datos financieros y tributarios",
                            "responsabilidades_criticas": [
                                "Mapear procesos de facturación, cobranza y contabilidad",
                                "Identificar TODOS los datos de situación socioeconómica (crítico en Ley 21.719)",
                                "Documentar evaluaciones crediticias y de riesgo",
                                "Mapear transferencias a bancos, factoring, centrales de riesgo",
                                "Documentar retención de documentos tributarios (6 años por Código Tributario)"
                            ],
                            "casos_practicos_finanzas": {
                                "caso_evaluacion_crediticia": {
                                    "proceso": "Evaluación Crediticia de Clientes",
                                    "datos_sensibles_involucrados": [
                                        "Ingresos declarados y verificados",
                                        "Historial crediticio en centrales de riesgo",
                                        "Patrimonio declarado",
                                        "Capacidad de pago evaluada",
                                        "Score crediticio calculado"
                                    ],
                                    "base_legal": "Interés legítimo para evaluación de riesgo crediticio",
                                    "tip_legal": "⚖️ TODOS estos datos son 'situación socioeconómica' = DATOS SENSIBLES. Requieren consentimiento explícito o interés legítimo muy bien fundamentado.",
                                    "terceros_involucrados": [
                                        "DICOM (consulta historial crediticio)",
                                        "Equifax (verificación de ingresos)",
                                        "Banco partner (validación de cuenta corriente)"
                                    ]
                                },
                                "caso_factoring": {
                                    "proceso": "Cesión de Facturas a Empresa de Factoring",
                                    "datos_transferidos": [
                                        "Datos identificación del deudor",
                                        "Monto de la deuda",
                                        "Historial de pagos",
                                        "Evaluación de riesgo del cliente"
                                    ],
                                    "base_legal": "Ejecución de contrato de factoring",
                                    "tip_practico": "🔧 El contrato de factoring DEBE incluir cláusulas específicas de protección de datos según Art. 23 de la Ley."
                                }
                            }
                        },
                        
                        "Marketing_Ventas_representante": {
                            "rol": "Experto en datos comerciales y marketing digital",
                            "areas_criticas": [
                                "Prospección y generación de leads",
                                "Gestión de bases de datos comerciales",
                                "Marketing digital y cookies",
                                "CRM y seguimiento de clientes",
                                "Programas de fidelización"
                            ],
                            "casos_practicos_marketing": {
                                "caso_cookies_web": {
                                    "proceso": "Implementación de Cookies y Tracking en Sitio Web",
                                    "tipos_cookies": [
                                        "Cookies técnicas (funcionamiento del sitio)",
                                        "Cookies analíticas (Google Analytics)",
                                        "Cookies publicitarias (Facebook Pixel, Google Ads)",
                                        "Cookies de personalización (contenido customizado)"
                                    ],
                                    "base_legal": "Consentimiento para cookies no técnicas",
                                    "tip_legal": "⚖️ Las cookies publicitarias y de tracking requieren consentimiento EXPLÍCITO según Art. 7. No basta con un banner informativo.",
                                    "transferencias_internacionales": [
                                        "Google LLC (Estados Unidos) - Analytics y Ads",
                                        "Meta Platforms (Estados Unidos) - Facebook Pixel",
                                        "Adobe Systems (Estados Unidos) - Analytics avanzado"
                                    ]
                                },
                                "caso_lead_generation": {
                                    "proceso": "Generación y Nurturing de Leads Comerciales",
                                    "fuentes_datos": [
                                        "Formularios web de contacto",
                                        "Descargas de whitepapers/ebooks",
                                        "Participación en webinars",
                                        "Asistencia a ferias comerciales",
                                        "Compra de bases de datos comerciales"
                                    ],
                                    "actividades_procesamiento": [
                                        "Scoring y calificación de leads",
                                        "Segmentación por industria/tamaño",
                                        "Email marketing automatizado",
                                        "Retargeting publicitario"
                                    ],
                                    "tip_practico": "🔧 Documente la fuente de CADA contacto. Si compró la base de datos, verifique que el proveedor tenía consentimiento válido."
                                }
                            }
                        },
                        
                        "Operaciones_representante": {
                            "rol": "Experto en procesos operativos y tecnologías IoT",
                            "foco_sectorial": "Especial atención a industria salmonera y tecnologías avanzadas",
                            "casos_practicos_operaciones": {
                                "caso_iot_sensores": {
                                    "proceso": "Monitoreo IoT en Centros de Cultivo",
                                    "descripcion_manual": "Los datos generados en tiempo real por sensores de IoT en los centros de cultivo (temperatura del agua, niveles de oxígeno, alimentación automática) o los datos de geolocalización del personal en terreno. Aunque estos datos pueden no parecer personales a primera vista, si pueden vincularse a un centro de cultivo específico o a un operario, quedan bajo el ámbito de la ley.",
                                    "datos_sensores": [
                                        "Temperatura del agua por centro",
                                        "Niveles de oxígeno disuelto",
                                        "Cantidad de alimento suministrado",
                                        "Registros de mortalidad de peces",
                                        "Timestamps de alimentación automática"
                                    ],
                                    "vinculacion_personal": [
                                        "Centro asignado a operario específico",
                                        "Turnos y horarios de personal",
                                        "Alertas asignadas a responsables",
                                        "Acciones correctivas tomadas por operarios"
                                    ],
                                    "tip_legal": "⚖️ Si los datos del sensor pueden vincularse a una persona específica (ej: 'centro A operado por Juan Pérez'), se convierten en datos personales bajo la Ley 21.719.",
                                    "medidas_seguridad": [
                                        "Cifrado de datos en tránsito desde sensores",
                                        "Autenticación de dispositivos IoT",
                                        "Logs de acceso a plataforma de monitoreo",
                                        "Separación de datos operativos vs. personales"
                                    ]
                                },
                                "caso_geolocalizacion": {
                                    "proceso": "Geolocalización de Personal en Terreno",
                                    "fuentes_ubicacion": [
                                        "GPS en vehículos corporativos",
                                        "Aplicaciones móviles de trabajo",
                                        "Sistemas de control de acceso",
                                        "Dispositivos de emergencia/seguridad"
                                    ],
                                    "finalidades_legitimas": [
                                        "Seguridad del personal en terreno",
                                        "Optimización de rutas y combustible",
                                        "Respuesta a emergencias",
                                        "Control de jornada laboral"
                                    ],
                                    "limitaciones_legales": [
                                        "Solo durante horario laboral",
                                        "No monitoreo fuera del trabajo",
                                        "Notificación previa al personal",
                                        "Acceso restringido a datos de ubicación"
                                    ],
                                    "tip_practico": "🔧 Implemente 'modo privado' que los trabajadores puedan activar durante descansos o emergencias personales."
                                }
                            }
                        },
                        
                        "TI_representante": {
                            "rol": "Arquitecto de sistemas y especialista en seguridad",
                            "responsabilidades_tecnicas": [
                                "Mapear arquitectura completa de sistemas",
                                "Documentar flujos de datos entre aplicaciones",
                                "Identificar integraciones con servicios cloud",
                                "Evaluar medidas de seguridad implementadas",
                                "Documentar APIs y conectores externos"
                            ],
                            "casos_practicos_ti": {
                                "caso_arquitectura_cloud": {
                                    "proceso": "Migración a Cloud Computing",
                                    "servicios_cloud_tipicos": [
                                        "AWS RDS (base de datos)",
                                        "Microsoft Azure (aplicaciones)",
                                        "Google Workspace (email y documentos)",
                                        "Salesforce (CRM)",
                                        "Dropbox Business (almacenamiento)"
                                    ],
                                    "transferencias_internacionales": "Todos estos servicios implican transferencia a Estados Unidos",
                                    "medidas_proteccion": [
                                        "Cifrado end-to-end",
                                        "Cláusulas contractuales estándar",
                                        "Auditoria de proveedores cloud",
                                        "Data residency cuando sea posible"
                                    ],
                                    "tip_legal": "⚖️ Cada servicio cloud constituye una transferencia internacional. Requiere evaluación según Art. 25-27 de la Ley."
                                }
                            }
                        },
                        
                        "Legal_representante": {
                            "rol": "Especialista en bases legales y compliance normativo",
                            "responsabilidades_juridicas": [
                                "Validar bases de licitud para cada actividad",
                                "Revisar contratos con terceros",
                                "Asegurar cumplimiento normativo sectorial",
                                "Documentar justificaciones para datos sensibles",
                                "Evaluar transferencias internacionales"
                            ],
                            "bases_licitud_detalladas": {
                                "consentimiento": {
                                    "cuando_usar": "Para datos sensibles, marketing directo, cookies no técnicas",
                                    "requisitos": "Libre, específico, informado e inequívoco (Art. 7)",
                                    "ejemplo_practico": "Newsletter comercial, cookies publicitarias"
                                },
                                "contrato": {
                                    "cuando_usar": "Datos necesarios para ejecutar contrato con el titular",
                                    "requisitos": "Necesidad objetiva para cumplir obligaciones contractuales",
                                    "ejemplo_practico": "Datos de facturación, entrega de productos"
                                },
                                "obligacion_legal": {
                                    "cuando_usar": "Cumplimiento de normativas (tributarias, laborales, etc.)",
                                    "requisitos": "Obligación establecida en ley o reglamento",
                                    "ejemplo_practico": "Retención documentos SII, cotizaciones Previred"
                                },
                                "interes_legitimo": {
                                    "cuando_usar": "Intereses legítimos del responsable que no vulneren derechos del titular",
                                    "requisitos": "Test de balanceamiento: interés legítimo vs. derechos del titular",
                                    "ejemplo_practico": "Seguridad informática, prevención fraude"
                                }
                            }
                        }
                    }
                },
                
                "paso_2_metodologia": {
                    "titulo": "2. Metodología de Levantamiento",
                    "descripcion_manual": "El proceso no debe centrarse en preguntar '¿qué bases de datos tienen?', sino en '¿qué actividades o procesos realizan que involucren información de personas?'. Se deben realizar entrevistas estructuradas y talleres con los dueños de los procesos en cada departamento para identificar y documentar cada actividad de tratamiento.",
                    
                    "enfoque_correcto": {
                        "preguntar": "¿Qué actividades o procesos realizan que involucren información de personas?",
                        "no_preguntar": "¿Qué bases de datos tienen?",
                        "razon": "Las actividades determinan el propósito y contexto legal. Los sistemas son solo el medio."
                    },
                    
                    "ejemplo_preguntas_rrhh": {
                        "descripcion_manual": "¿Cuál es el proceso completo desde que reciben un currículum hasta que se contrata a una persona? ¿Qué información solicitan? ¿Dónde la guardan? ¿Con quién la comparten (ej. empresa de exámenes preocupacionales)? ¿Por cuánto tiempo la conservan si la persona no es contratada?",
                        
                        "preguntas_estructuradas_detalladas": {
                            "proceso_reclutamiento": [
                                "¿Cómo reciben las postulaciones? (web, email, presencial)",
                                "¿Qué información solicitan en el formulario inicial?",
                                "¿Realizan evaluaciones psicotécnicas? ¿Con empresa externa?",
                                "¿Verifican referencias laborales? ¿Qué consultan exactamente?",
                                "¿Solicitan exámenes médicos? ¿Qué tipo de información de salud obtienen?",
                                "¿Evalúan la situación socioeconómica para definir renta?",
                                "¿Cómo comunican las decisiones de selección?",
                                "¿Qué pasa con los datos de candidatos no seleccionados?"
                            ],
                            "proceso_evaluacion": [
                                "¿Realizan evaluaciones de desempeño?",
                                "¿Los datos de evaluación se comparten con otras áreas?",
                                "¿Usan las evaluaciones para promociones o aumentos?",
                                "¿Las evaluaciones incluyen aspectos de salud o bienestar?"
                            ],
                            "proceso_capacitacion": [
                                "¿Registran participación en capacitaciones?",
                                "¿Evalúan competencias y habilidades?",
                                "¿Mantienen certificaciones y acreditaciones?",
                                "¿Comparten información con organismos de capacitación?"
                            ]
                        }
                    },
                    
                    "metodologias_levantamiento": {
                        "entrevistas_individuales": {
                            "duracion": "1-2 horas por área",
                            "participantes": "Dueño del proceso + operadores clave",
                            "estructura": [
                                "Explicación del objetivo (15 min)",
                                "Mapeo de procesos principales (60 min)",
                                "Identificación de datos y sistemas (30 min)",
                                "Revisión de terceros y transferencias (15 min)"
                            ]
                        },
                        "talleres_grupales": {
                            "duracion": "Half-day workshop",
                            "participantes": "Equipo completo del área",
                            "ventajas": "Visión integral y validación cruzada",
                            "desventajas": "Posible omisión de procesos sensibles"
                        },
                        "revision_documental": {
                            "documentos_clave": [
                                "Manuales de procedimientos",
                                "Contratos con terceros",
                                "Políticas internas",
                                "Diagramas de sistemas",
                                "Reportes de auditoría"
                            ]
                        }
                    }
                },
                
                "paso_3_documentacion": {
                    "titulo": "3. Documentación de Actividades de Tratamiento",
                    "descripcion_manual": "Para cada actividad identificada, el equipo debe documentar en el sistema de cumplimiento la siguiente información, que corresponde a los elementos de un RAT:",
                    
                    "campos_rat_obligatorios": {
                        "nombre_actividad": {
                            "descripcion_manual": "Nombre de la actividad de tratamiento: (ej. 'Proceso de Reclutamiento y Selección')",
                            "ejemplos_correctos": [
                                "Proceso de Reclutamiento y Selección",
                                "Gestión de Nómina y Beneficios",
                                "Evaluación Crediticia de Clientes",
                                "Monitoreo IoT de Centros de Cultivo"
                            ],
                            "ejemplos_incorrectos": [
                                "Base de datos RRHH",
                                "Sistema de facturación",
                                "Excel de clientes"
                            ],
                            "tip_practico": "🔧 Use VERBOS de acción: 'Procesar', 'Evaluar', 'Monitorear', 'Gestionar'"
                        },
                        
                        "finalidades_tratamiento": {
                            "descripcion_manual": "Finalidad(es) del tratamiento: (ej. 'Evaluar la idoneidad de los candidatos para vacantes laborales')",
                            "requisitos_legales": "Deben ser específicas, explícitas y legítimas (Art. 5 letra a)",
                            "ejemplos_detallados": {
                                "rrhh_reclutamiento": "Evaluar la idoneidad profesional de candidatos para cubrir vacantes laborales específicas",
                                "finanzas_credito": "Evaluar el riesgo crediticio para determinar condiciones de venta a crédito",
                                "marketing_lead": "Identificar clientes potenciales interesados en productos específicos",
                                "operaciones_iot": "Monitorear parámetros ambientales para asegurar bienestar animal y cumplir normativas sanitarias"
                            },
                            "tip_legal": "⚖️ Evite finalidades genéricas como 'mejorar el servicio'. Sea específico sobre QUÉ mejora y CÓMO."
                        },
                        
                        "base_licitud": {
                            "descripcion_manual": "Base de licitud: (ej. 'Consentimiento del candidato', 'Medidas precontractuales')",
                            "opciones_art7": [
                                "a) Consentimiento del titular",
                                "b) Ejecución de contrato",
                                "c) Cumplimiento de obligación legal",
                                "d) Protección de intereses vitales",
                                "e) Misión de interés público",
                                "f) Interés legítimo del responsable"
                            ],
                            "casos_practicos_por_base": {
                                "consentimiento_casos": [
                                    "Newsletter comercial",
                                    "Cookies publicitarias",
                                    "Datos sensibles (salud, situación socioeconómica)",
                                    "Programas de fidelización"
                                ],
                                "contrato_casos": [
                                    "Datos de facturación y entrega",
                                    "Información de contacto para ejecutar servicio",
                                    "Datos bancarios para pagos"
                                ],
                                "obligacion_legal_casos": [
                                    "Retención documentos tributarios (6 años)",
                                    "Reportes a SERNAPESCA",
                                    "Cotizaciones previsionales Previred",
                                    "Registros laborales (2 años post-término)"
                                ],
                                "interes_legitimo_casos": [
                                    "Seguridad informática y prevención fraude",
                                    "Mejora de productos basada en uso real",
                                    "Comunicaciones internas corporativas"
                                ]
                            }
                        },
                        
                        "categorias_titulares": {
                            "descripcion_manual": "Categorías de titulares de datos: (ej. 'Postulantes a empleos')",
                            "ejemplos_especificos": [
                                "Empleados activos",
                                "Ex-empleados",
                                "Postulantes a empleos",
                                "Clientes actuales",
                                "Clientes potenciales (leads)",
                                "Proveedores",
                                "Familiares de empleados (cargas)",
                                "Visitantes del sitio web"
                            ]
                        },
                        
                        "categorias_datos": {
                            "descripcion_manual": "Categorías de datos personales tratados: (ej. 'Datos de identificación, historial académico, experiencia laboral, datos de contacto')",
                            "clasificacion_detallada": "Ver siguiente sección de Clasificación por Sensibilidad"
                        },
                        
                        "destinatarios_internos_externos": {
                            "descripcion_manual": "Categorías de destinatarios (internos y externos): (ej. 'Gerentes de área, empresa externa de verificación de antecedentes')",
                            "diferenciacion_critica": {
                                "internos": "Personas dentro de la organización que acceden a los datos",
                                "externos_encargados": "Terceros que procesan datos en nombre del responsable",
                                "externos_cesionarios": "Terceros que reciben datos para sus propios fines"
                            },
                            "ejemplos_por_categoria": {
                                "internos": ["Gerente RRHH", "Equipo de finanzas", "Ejecutivos comerciales"],
                                "encargados": ["Empresa de nómina", "Proveedor cloud", "Call center"],
                                "cesionarios": ["DICOM", "SII", "Previred", "SERNAPESCA"]
                            }
                        },
                        
                        "transferencias_internacionales": {
                            "descripcion_manual": "Transferencias internacionales (si aplica): (País de destino y garantías)",
                            "casos_comunes_chile": [
                                "Google LLC (Estados Unidos) - Analytics",
                                "Microsoft Corporation (Estados Unidos) - Office 365",
                                "Amazon Web Services (Estados Unidos) - Cloud storage",
                                "Salesforce (Estados Unidos) - CRM"
                            ],
                            "garantias_requeridas": [
                                "Cláusulas contractuales estándar",
                                "Certificaciones de privacidad",
                                "Códigos de conducta aprobados",
                                "Decisión de adecuación (cuando exista)"
                            ]
                        },
                        
                        "plazos_conservacion": {
                            "descripcion_manual": "Plazos de conservación y supresión: (ej. 'Currículums de candidatos no seleccionados se eliminan después de 6 meses')",
                            "ejemplos_por_contexto": {
                                "documentos_tributarios": "6 años (Art. 17 Código Tributario)",
                                "registros_laborales": "2 años post-término relación laboral",
                                "curriculos_no_seleccionados": "6 meses desde proceso",
                                "datos_marketing": "Hasta revocación consentimiento",
                                "logs_seguridad": "1 año para auditoría"
                            },
                            "criterios_eliminacion": [
                                "Automática por vencimiento de plazo",
                                "Manual tras revisión legal",
                                "Por solicitud del titular (derecho supresión)",
                                "Por cambio de finalidad"
                            ]
                        },
                        
                        "medidas_seguridad": {
                            "descripcion_manual": "Descripción de las medidas de seguridad técnicas y organizativas",
                            "categorias_medidas": {
                                "tecnicas": [
                                    "Cifrado de datos en reposo y tránsito",
                                    "Control de acceso basado en roles (RBAC)",
                                    "Autenticación multifactor",
                                    "Logs de auditoría inmutables",
                                    "Backup y recuperación",
                                    "Detección de intrusiones"
                                ],
                                "organizativas": [
                                    "Políticas de acceso y uso",
                                    "Capacitación en protección de datos",
                                    "Acuerdos de confidencialidad",
                                    "Procedimientos de incidentes",
                                    "Auditorías regulares",
                                    "Segregación de funciones"
                                ]
                            }
                        }
                    }
                }
            },
            
            "clasificacion_sensibilidad": {
                "titulo": "Clasificación de Datos por Sensibilidad",
                "descripcion_manual": "Una vez identificados los datos, es crucial clasificarlos correctamente, ya que la ley impone requisitos más estrictos para ciertas categorías.",
                
                "datos_personales_comunes": {
                    "descripcion_manual": "Datos Personales Comunes: Información de identificación, contacto, datos laborales, etc.",
                    "ejemplos_detallados": [
                        "Nombre completo y apellidos",
                        "RUT/Cédula de identidad",
                        "Dirección postal",
                        "Teléfono y email",
                        "Fecha de nacimiento",
                        "Estado civil",
                        "Nacionalidad",
                        "Historial académico",
                        "Experiencia laboral"
                    ],
                    "medidas_proteccion": "Medidas de seguridad apropiadas según nivel de riesgo"
                },
                
                "datos_sensibles_art2": {
                    "titulo": "Datos Sensibles (Art. 2, lit. g)",
                    "descripcion_manual": "El personal debe ser capacitado para identificar y etiquetar datos que revelen origen étnico, afiliación sindical, convicciones religiosas o filosóficas, datos de salud, datos biométricos, vida u orientación sexual. Una novedad crucial de la ley chilena es la inclusión de la 'situación socioeconómica' como dato sensible. Esto significa que datos como el nivel de ingresos, historial crediticio o la elegibilidad para beneficios sociales, comúnmente manejados por RRHH o áreas financieras, deben ser tratados con el máximo nivel de protección.",
                    
                    "novedad_critica_chile": {
                        "titulo": "SITUACIÓN SOCIOECONÓMICA - Novedad crucial de la ley chilena",
                        "definicion": "Datos que revelan la capacidad económica, nivel de ingresos, patrimonio, o situación financiera de una persona",
                        "ejemplos_practicos": [
                            "Nivel de ingresos familiares declarados",
                            "Historial crediticio en centrales de riesgo",
                            "Score crediticio calculado",
                            "Evaluación de capacidad de pago",
                            "Elegibilidad para beneficios sociales",
                            "Subsidios habitacionales",
                            "Becas por situación socioeconómica",
                            "Evaluación patrimonial",
                            "Datos de pensiones y jubilaciones",
                            "Información de deudas y morosidades"
                        ],
                        "contextos_comunes": {
                            "rrhh": [
                                "Evaluación socioeconómica para definir renta de ingreso",
                                "Beneficios sociales según situación familiar",
                                "Préstamos y adelantos a empleados",
                                "Subsidios de movilización según zona"
                            ],
                            "finanzas": [
                                "Evaluación crediticia de clientes",
                                "Análisis de riesgo para créditos",
                                "Segmentación por capacidad de pago",
                                "Reportes a centrales de riesgo"
                            ],
                            "comercial": [
                                "Segmentación de clientes por poder adquisitivo",
                                "Ofertas diferenciadas por nivel socioeconómico",
                                "Programas de fidelización premium"
                            ]
                        },
                        "tip_legal_critico": "⚖️ CRÍTICO: En Chile, a diferencia de Europa, la situación socioeconómica ES dato sensible. Requiere las mismas protecciones que datos de salud."
                    },
                    
                    "otros_datos_sensibles": {
                        "origen_etnico": {
                            "ejemplos": ["Pueblo originario de pertenencia", "Características físicas raciales"],
                            "contextos": "Programas de diversidad, becas indígenas"
                        },
                        "afiliacion_sindical": {
                            "ejemplos": ["Membresía sindical", "Cuotas sindicales", "Actividad sindical"],
                            "contextos": "Descuentos por planilla, negociaciones colectivas"
                        },
                        "convicciones_religiosas": {
                            "ejemplos": ["Religión declarada", "Solicitudes de permisos religiosos"],
                            "contextos": "Feriados religiosos, alimentación especial"
                        },
                        "datos_salud": {
                            "ejemplos": ["Licencias médicas", "Exámenes preocupacionales", "Discapacidades"],
                            "contextos": "Gestión de licencias, adaptaciones laborales"
                        },
                        "datos_biometricos": {
                            "ejemplos": ["Huellas dactilares", "Reconocimiento facial", "Iris scanning"],
                            "contextos": "Control de acceso, sistemas de autenticación"
                        },
                        "vida_sexual": {
                            "ejemplos": ["Orientación sexual", "Identidad de género"],
                            "contextos": "Políticas de diversidad, beneficios de pareja"
                        }
                    },
                    
                    "medidas_especiales_requeridas": [
                        "Consentimiento explícito del titular (salvo excepciones legales)",
                        "Cifrado reforzado en almacenamiento y transmisión",
                        "Control de acceso estricto (need-to-know basis)",
                        "Logs de auditoría detallados de todos los accesos",
                        "Procedimientos específicos para transferencias",
                        "Capacitación especializada para personal que los maneja",
                        "Evaluaciones de impacto obligatorias para nuevos tratamientos"
                    ]
                },
                
                "datos_nna": {
                    "titulo": "Datos de Niños, Niñas y Adolescentes (NNA)",
                    "descripcion_manual": "Cualquier dato perteneciente a menores de edad debe ser clasificado como tal, ya que su tratamiento requiere el consentimiento de los padres o tutores y la consideración del interés superior del niño.",
                    
                    "definicion_legal": "Menores de 18 años según legislación chilena",
                    "requisitos_especiales": [
                        "Consentimiento de padres o tutores",
                        "Consideración del interés superior del niño",
                        "Prohibición de perfilado comercial",
                        "Limitaciones en transferencias internacionales",
                        "Derecho de rectificación facilitado"
                    ],
                    
                    "contextos_empresariales": {
                        "rrhh_cargas_familiares": {
                            "datos_involucrados": [
                                "Nombres y RUT de hijos",
                                "Fechas de nacimiento",
                                "Nivel educacional",
                                "Condiciones de salud (discapacidades)",
                                "Información de jardines/colegios"
                            ],
                            "finalidades": [
                                "Cálculo de asignaciones familiares",
                                "Beneficios de salud familiar",
                                "Emergencias laborales",
                                "Actividades recreativas empresa"
                            ]
                        },
                        "estudiantes_practica": {
                            "datos_involucrados": [
                                "Información académica",
                                "Datos de contacto de apoderados",
                                "Evaluaciones de desempeño",
                                "Registros de asistencia"
                            ],
                            "consideraciones_especiales": [
                                "Consentimiento institución educativa",
                                "Supervisión apropiada",
                                "Limitación de responsabilidades",
                                "Datos no comercializables"
                            ]
                        }
                    },
                    
                    "tip_practico": "🔧 Implemente validación automática de edad en todos los formularios. Si detecta menor de 18 años, active protocolo especial NNA."
                }
            },
            
            "documentacion_flujos": {
                "titulo": "Documentación de Flujos de Datos (Data Flows)",
                "descripcion_manual": "El inventario no es solo una lista estática, sino un mapa dinámico. El personal debe documentar cómo se mueven los datos:",
                
                "flujos_internos": {
                    "titulo": "Flujos Internos",
                    "descripcion_manual": "Trazar el recorrido de los datos entre los sistemas internos. Por ejemplo, cuando un nuevo cliente se registra en la web, sus datos viajan desde el servidor web al CRM, luego al ERP para la facturación, y quizás a un sistema de business intelligence para análisis.",
                    
                    "ejemplo_detallado_manual": {
                        "proceso": "Registro de nuevo cliente",
                        "flujo_paso_a_paso": [
                            "1. Cliente completa formulario en sitio web",
                            "2. Datos se almacenan en base de datos del sitio web",
                            "3. Sistema web envía datos al CRM vía API",
                            "4. CRM valida y enriquece información del cliente",
                            "5. CRM sincroniza con ERP para crear perfil de facturación",
                            "6. ERP genera códigos de cliente y condiciones comerciales",
                            "7. Datos agregados van a sistema de business intelligence",
                            "8. BI genera reportes para dashboard gerencial"
                        ],
                        "puntos_control_necesarios": [
                            "Validación de datos en cada transferencia",
                            "Logs de auditoría de todos los movimientos",
                            "Cifrado en tránsito entre sistemas",
                            "Verificación de integridad de datos",
                            "Control de errores y rollback"
                        ]
                    },
                    
                    "casos_adicionales": {
                        "flujo_nomina": [
                            "Sistema RRHH → Sistema Nómina → Banco → Previred → SII"
                        ],
                        "flujo_iot_cultivo": [
                            "Sensores → Gateway local → Cloud → Analytics → Reportes SERNAPESCA"
                        ]
                    }
                },
                
                "flujos_externos": {
                    "titulo": "Flujos Externos", 
                    "descripcion_manual": "Documentar todas las transferencias de datos a terceros, ya sean encargados del tratamiento (ej. un proveedor de cloud, una agencia de marketing) o cesionarios. Esto incluye identificar al tercero, el propósito de la transferencia y la base legal que la ampara.",
                    
                    "diferenciacion_critica": {
                        "encargados_tratamiento": {
                            "definicion": "Procesan datos personales en nombre y por cuenta del responsable",
                            "ejemplos": [
                                "Proveedor de cloud computing (AWS, Azure)",
                                "Agencia de marketing digital",
                                "Empresa de nómina externa",
                                "Call center tercerizado",
                                "Empresa de mantención de software"
                            ],
                            "requisitos_legales": [
                                "Contrato de encargo específico (Art. 23)",
                                "Instrucciones claras y limitadas",
                                "Obligación de confidencialidad",
                                "Medidas de seguridad equivalentes",
                                "Prohibición de subcontratación sin autorización"
                            ],
                            "tip_legal": "⚖️ El contrato de encargo DEBE ser previo al inicio del procesamiento. Art. 23 establece contenidos mínimos obligatorios."
                        },
                        
                        "cesionarios": {
                            "definicion": "Reciben datos personales para sus propios fines",
                            "ejemplos": [
                                "Centrales de riesgo (DICOM, Equifax)",
                                "Organismos públicos (SII, Previred, SERNAPESCA)",
                                "Empresas de factoring",
                                "Compañías de seguros",
                                "Mutualidades de empleadores"
                            ],
                            "requisitos_legales": [
                                "Base legal específica para la cesión",
                                "Información previa al titular",
                                "Limitación de finalidades",
                                "Plazo determinado de cesión",
                                "Posibilidad de oposición del titular"
                            ]
                        }
                    }
                },
                
                "riesgos_sector_salmonero": {
                    "titulo": "Riesgos Específicos del Sector",
                    "descripcion_manual": "En la industria salmonera, se debe prestar especial atención a los flujos de datos provenientes de tecnologías avanzadas. Por ejemplo, los datos generados en tiempo real por sensores de IoT en los centros de cultivo (temperatura del agua, niveles de oxígeno, alimentación automática) o los datos de geolocalización del personal en terreno. Aunque estos datos pueden no parecer personales a primera vista, si pueden vincularse a un centro de cultivo específico o a un operario, quedan bajo el ámbito de la ley y sus flujos deben ser mapeados.",
                    
                    "caso_sensores_iot": {
                        "datos_aparentemente_no_personales": [
                            "Temperatura del agua por centro",
                            "Niveles de oxígeno disuelto",
                            "Cantidad de alimento suministrado",
                            "Registros de mortalidad",
                            "Timestamps de alimentación automática"
                        ],
                        "vinculacion_que_los_convierte_personales": [
                            "Centro asignado a operario específico",
                            "Turnos de responsabilidad por centro",
                            "Alertas enviadas a responsables nominados",
                            "Acciones correctivas registradas con responsable",
                            "Evaluaciones de desempeño basadas en métricas del centro"
                        ],
                        "flujo_datos_completo": [
                            "Sensores en centro → Gateway local → Plataforma cloud (¿país?) → Sistema analytics → Reportes por responsable → Evaluación de desempeño"
                        ],
                        "riesgos_identificados": [
                            "Transferencia internacional no identificada",
                            "Perfilado de trabajadores sin consentimiento",
                            "Datos de desempeño basados en sensores",
                            "Acceso no controlado a datos por centro"
                        ]
                    },
                    
                    "caso_geolocalizacion_personal": {
                        "descripcion_manual_ampliada": "Los datos de geolocalización del personal en terreno",
                        "fuentes_ubicacion": [
                            "GPS en vehículos corporativos",
                            "Aplicaciones móviles de trabajo",
                            "Sistemas de control de acceso",
                            "Dispositivos de emergencia/seguridad",
                            "Cámaras con reconocimiento en instalaciones"
                        ],
                        "datos_generados": [
                            "Coordenadas GPS en tiempo real",
                            "Rutas y velocidades de desplazamiento",
                            "Tiempo de permanencia por ubicación",
                            "Patrones de movimiento habituales",
                            "Desviaciones de rutas asignadas"
                        ],
                        "finalidades_legitimas": [
                            "Seguridad del personal en terreno riesgoso",
                            "Optimización de rutas y combustible",
                            "Respuesta rápida a emergencias",
                            "Control de jornada laboral efectiva",
                            "Cumplimiento de protocolos de bioseguridad"
                        ],
                        "limitaciones_legales_estrictas": [
                            "Solo durante horario laboral contratado",
                            "No monitoreo durante descansos personales",
                            "Notificación previa y explícita al personal",
                            "Acceso restringido solo a supervisores directos",
                            "Eliminación automática de datos históricos",
                            "Modo 'privado' para emergencias personales"
                        ],
                        "tip_implementacion": "🔧 Configure alertas automáticas si el sistema detecta monitoreo fuera de horario laboral. Esto protege tanto al empleado como a la empresa."
                    }
                }
            },
            
            "gestion_retencion": {
                "titulo": "Gestión de Retención y Eliminación",
                "descripcion_manual": "Basándose en el principio de proporcionalidad (limitación del plazo de conservación), el DPO, junto con el área legal y los dueños de los procesos, debe definir políticas de retención para cada categoría de datos.",
                
                "definicion_politicas": {
                    "titulo": "Definición de Políticas",
                    "descripcion_manual": "La política debe establecer por cuánto tiempo se conservará un dato y cuál es la justificación (ej. 'Las facturas de clientes se conservan por 6 años para cumplir con obligaciones tributarias').",
                    
                    "criterios_definicion": [
                        "Finalidad original del tratamiento",
                        "Obligaciones legales de conservación",
                        "Necesidades operativas del negocio",
                        "Derechos del titular",
                        "Riesgos de conservación vs. eliminación"
                    ],
                    
                    "plazos_legales_chile": {
                        "tributarios": {
                            "plazo": "6 años",
                            "base_legal": "Art. 17 Código Tributario",
                            "aplicacion": "Facturas, boletas, documentos tributarios",
                            "desde_cuando": "Desde el 31 de diciembre del año en que debió presentarse la declaración"
                        },
                        "laborales": {
                            "plazo": "2 años post-término",
                            "base_legal": "Art. 416 Código del Trabajo",
                            "aplicacion": "Registros de horarios, remuneraciones, contratos",
                            "desde_cuando": "Desde el término de la relación laboral"
                        },
                        "previsionales": {
                            "plazo": "30 años",
                            "base_legal": "DL 3.500 (Sistema AFP)",
                            "aplicacion": "Cotizaciones previsionales, historia laboral",
                            "desde_cuando": "Durante vida laboral activa"
                        },
                        "sanitarios": {
                            "plazo": "5 años",
                            "base_legal": "Reglamento Sanitario Acuicultura",
                            "aplicacion": "Registros sanitarios, tratamientos, mortalidad",
                            "desde_cuando": "Desde la generación del registro"
                        }
                    },
                    
                    "politicas_por_categoria": {
                        "candidatos_no_seleccionados": {
                            "plazo": "6 meses",
                            "justificacion": "Posibles reconsideraciones futuras",
                            "accion_vencimiento": "Eliminación automática"
                        },
                        "empleados_activos": {
                            "plazo": "Durante relación + 2 años",
                            "justificacion": "Obligación legal laboral",
                            "accion_vencimiento": "Archivo histórico anonimizado"
                        },
                        "datos_marketing": {
                            "plazo": "Hasta revocación consentimiento",
                            "justificacion": "Consentimiento vigente",
                            "accion_vencimiento": "Eliminación inmediata"
                        },
                        "logs_seguridad": {
                            "plazo": "1 año",
                            "justificacion": "Investigación incidentes",
                            "accion_vencimiento": "Eliminación automática"
                        }
                    }
                },
                
                "procedimiento_eliminacion": {
                    "titulo": "Procedimiento de Eliminación",
                    "descripcion_manual": "Se debe definir un procedimiento para la eliminación segura o la anonimización de los datos una vez que expira su período de retención. Este procedimiento debe ser ejecutado periódicamente por el personal de TI, y su ejecución debe ser verificada y registrada.",
                    
                    "tipos_eliminacion": {
                        "eliminacion_fisica": {
                            "definicion": "Borrado irreversible de los datos",
                            "metodos": [
                                "DELETE con VACUUM en bases de datos",
                                "Sobrescritura múltiple en discos",
                                "Destrucción física de medios",
                                "Formateo seguro con herramientas especializadas"
                            ],
                            "verificacion": "Auditoría de que los datos no son recuperables"
                        },
                        "anonimizacion": {
                            "definicion": "Transformación irreversible que impide identificación",
                            "tecnicas": [
                                "Generalización (edad específica → rango etario)",
                                "Supresión (eliminar campos identificadores)",
                                "Perturbación (añadir ruido estadístico)",
                                "Pseudonimización irreversible"
                            ],
                            "verificacion": "Test de re-identificación debe fallar"
                        }
                    },
                    
                    "automatizacion_requerida": {
                        "frecuencia_ejecucion": "Mensual o según criticidad",
                        "componentes_sistema": [
                            "Motor de políticas que identifica datos vencidos",
                            "Workflow de aprobación para eliminaciones masivas",
                            "Herramientas de eliminación segura",
                            "Sistema de logs inmutables",
                            "Reportes de ejecución para auditoría"
                        ],
                        "validaciones_previas": [
                            "Verificar que no hay procesos legales pendientes",
                            "Confirmar que no hay obligaciones de conservación adicionales",
                            "Validar que se ha cumplido el plazo mínimo",
                            "Asegurar que existen backups de seguridad si es necesario"
                        ]
                    },
                    
                    "registro_auditoria": {
                        "elementos_obligatorios": [
                            "Qué datos se eliminaron (categoría, cantidad)",
                            "Cuándo se ejecutó la eliminación",
                            "Quién autorizó y ejecutó",
                            "En base a qué política",
                            "Método de eliminación utilizado",
                            "Verificación de éxito de la operación"
                        ],
                        "conservacion_logs": "Los logs de eliminación se conservan 3 años adicionales",
                        "tip_legal": "⚖️ Los logs de eliminación son evidencia de cumplimiento. Son críticos para auditorías de la Agencia de Protección de Datos."
                    }
                }
            }
        }
    },
    
    "seccion_3_2": {
        "titulo": "3.2. Especificaciones Técnicas del Sistema (Plataforma de Gobernanza de Datos)",
        "descripcion_manual": "El sistema de cumplimiento debe actuar como una plataforma centralizada de gobernanza de datos.",
        
        "contenido": {
            "modulo_rat": {
                "titulo": "Módulo de Registro de Actividades de Tratamiento (RAT)",
                "descripcion_manual": "Sistema técnico para documentar y gestionar el inventario de datos",
                
                "interfaz_usuario": {
                    "titulo": "Interfaz de Usuario",
                    "descripcion_manual": "El sistema debe ofrecer una interfaz web intuitiva que permita al personal no técnico (dueños de procesos) documentar fácilmente las actividades de tratamiento, guiándolos a través de los campos requeridos (finalidad, categorías de datos, base legal, etc.).",
                    
                    "caracteristicas_requeridas": [
                        "Formularios guiados paso a paso",
                        "Validación en tiempo real de campos obligatorios",
                        "Ayuda contextual con ejemplos",
                        "Autocompletado basado en datos existentes",
                        "Previsualización del RAT antes de guardar",
                        "Versionado de cambios con trazabilidad"
                    ],
                    
                    "flujo_usuario_tipico": [
                        "1. Login con credenciales corporativas",
                        "2. Dashboard con resumen de actividades del área",
                        "3. 'Crear nueva actividad' → wizard guiado",
                        "4. Selección de plantilla según tipo de proceso",
                        "5. Completar campos con validación en vivo",
                        "6. Revisar y confirmar antes de guardar",
                        "7. Envío a DPO para revisión final"
                    ]
                },
                
                "base_datos_inventario": {
                    "titulo": "Base de Datos del Inventario",
                    "descripcion_manual": "Se requiere una base de datos relacional para almacenar el inventario. Las tablas principales podrían incluir: processing_activities, data_assets, data_categories, data_flows. Estas tablas deben estar interrelacionadas para permitir consultas complejas.",
                    
                    "tablas_principales_detalladas": {
                        "processing_activities": {
                            "descripcion": "Almacena la descripción de cada actividad",
                            "campos_principales": [
                                "id_actividad (PK)",
                                "nombre_actividad",
                                "area_responsable",
                                "responsable_proceso",
                                "finalidades (JSON)",
                                "base_licitud",
                                "categorias_titulares (JSON)",
                                "plazo_conservacion",
                                "fecha_creacion",
                                "estado_revision"
                            ]
                        },
                        "data_assets": {
                            "descripcion": "Cataloga los sistemas y bases de datos donde residen los datos",
                            "campos_principales": [
                                "id_asset (PK)",
                                "nombre_sistema",
                                "tipo_sistema",
                                "ubicacion_fisica",
                                "responsable_tecnico",
                                "medidas_seguridad (JSON)",
                                "proveedor_cloud"
                            ]
                        },
                        "data_categories": {
                            "descripcion": "Define las diferentes categorías de datos personales",
                            "campos_principales": [
                                "id_categoria (PK)",
                                "nombre_categoria",
                                "nivel_sensibilidad",
                                "ejemplos_datos",
                                "medidas_especiales_requeridas"
                            ]
                        },
                        "data_flows": {
                            "descripcion": "Mapea las transferencias de datos entre data_assets y con terceros",
                            "campos_principales": [
                                "id_flujo (PK)",
                                "id_actividad (FK)",
                                "origen_asset (FK)",
                                "destino_asset_o_tercero",
                                "tipo_transferencia",
                                "frecuencia",
                                "metodo_transferencia",
                                "cifrado_usado"
                            ]
                        }
                    },
                    
                    "consultas_complejas_ejemplos": {
                        "ejemplo_manual": "¿Qué actividades tratan datos de salud y en qué sistemas se almacenan?",
                        "sql_ejemplo": """
                        SELECT pa.nombre_actividad, da.nombre_sistema, da.ubicacion_fisica
                        FROM processing_activities pa
                        JOIN activity_data_categories adc ON pa.id_actividad = adc.id_actividad
                        JOIN data_categories dc ON adc.id_categoria = dc.id_categoria
                        JOIN activity_assets aa ON pa.id_actividad = aa.id_actividad
                        JOIN data_assets da ON aa.id_asset = da.id_asset
                        WHERE dc.nivel_sensibilidad = 'SALUD'
                        """,
                        "otras_consultas_utiles": [
                            "Actividades con transferencias internacionales",
                            "Datos próximos a vencer según política de retención",
                            "Sistemas sin medidas de cifrado para datos sensibles",
                            "Terceros que procesan múltiples categorías de datos"
                        ]
                    }
                }
            },
            
            "mapeo_visualizacion": {
                "titulo": "Funcionalidad de Mapeo y Visualización de Flujos",
                
                "herramientas_visualizacion": {
                    "titulo": "Herramientas de Visualización",
                    "descripcion_manual": "El sistema debería integrar herramientas de visualización que generen diagramas de flujo de datos automáticamente a partir de la información registrada en el inventario. Esto permite al DPO y a los auditores comprender rápidamente cómo se mueven los datos a través de la organización y hacia el exterior, identificando posibles riesgos o cuellos de botella.",
                    
                    "tipos_diagramas": {
                        "diagrama_flujo_actividad": {
                            "descripcion": "Muestra el flujo completo de una actividad específica",
                            "elementos": ["Sistemas origen", "Puntos de procesamiento", "Destinos internos/externos", "Medidas de seguridad en cada paso"]
                        },
                        "mapa_global_datos": {
                            "descripcion": "Vista panorámica de todos los flujos de la organización",
                            "elementos": ["Todos los sistemas", "Conexiones entre sistemas", "Terceros externos", "Transferencias internacionales"]
                        },
                        "diagrama_riesgo": {
                            "descripcion": "Visualización con códigos de color según nivel de riesgo",
                            "codigos_color": ["Verde: Bajo riesgo", "Amarillo: Riesgo medio", "Rojo: Alto riesgo", "Violeta: Datos sensibles"]
                        }
                    },
                    
                    "beneficios_auditoria": [
                        "Identificación rápida de puntos débiles",
                        "Detección de transferencias no documentadas",
                        "Visualización de concentración de riesgos",
                        "Validación de cumplimiento de políticas",
                        "Comunicación efectiva con stakeholders no técnicos"
                    ]
                },
                
                "integracion_descubrimiento": {
                    "titulo": "Integración y Descubrimiento Automatizado",
                    "descripcion_manual": "Para mantener el inventario actualizado, el sistema podría integrarse con herramientas de descubrimiento de datos (data discovery) que escaneen periódicamente las redes y bases de datos de la organización para identificar nuevos almacenamientos de datos personales que necesiten ser inventariados.",
                    
                    "herramientas_descubrimiento": {
                        "escaneo_bases_datos": {
                            "objetivo": "Identificar nuevas tablas/campos con datos personales",
                            "metodos": ["Análisis de nombres de campos", "Detección de patrones (RUT, email)", "Machine learning para clasificación"],
                            "frecuencia": "Semanal en horarios de bajo uso"
                        },
                        "analisis_logs": {
                            "objetivo": "Detectar nuevos flujos de datos no documentados",
                            "fuentes": ["Logs de aplicaciones", "Firewall logs", "API access logs"],
                            "alertas": "Notificación automática de transferencias no registradas"
                        },
                        "monitoreo_apis": {
                            "objetivo": "Supervisar integraciones con servicios externos",
                            "metodos": ["Análisis de payload de APIs", "Detección de nuevos endpoints", "Monitoreo de volúmenes de datos"],
                            "validacion": "Comparación con transferencias autorizadas"
                        }
                    },
                    
                    "proceso_validacion": [
                        "1. Sistema detecta posible nuevo tratamiento",
                        "2. Genera alerta para el DPO",
                        "3. DPO valida si es realmente nuevo tratamiento",
                        "4. Si es nuevo, inicia proceso de documentación",
                        "5. Si es falso positivo, ajusta algoritmos de detección"
                    ]
                }
            },
            
            "motor_politicas_retencion": {
                "titulo": "Motor de Políticas de Retención",
                
                "definicion_reglas": {
                    "titulo": "Definición de Reglas",
                    "descripcion_manual": "El sistema debe permitir al DPO o al administrador definir políticas de retención de forma declarativa (ej. 'Para todos los datos en la categoría Currículums No Seleccionados, aplicar un período de retención de 180 días desde la fecha de creación').",
                    
                    "lenguaje_reglas": {
                        "estructura_basica": "SI [condición] ENTONCES [acción] DESPUÉS DE [tiempo]",
                        "ejemplos_reglas": [
                            "SI categoria_datos = 'Currículums No Seleccionados' ENTONCES eliminar DESPUÉS DE 180 días",
                            "SI area_responsable = 'Marketing' Y consentimiento = 'revocado' ENTONCES eliminar INMEDIATAMENTE",
                            "SI tipo_documento = 'Factura' ENTONCES archivar DESPUÉS DE 6 años",
                            "SI datos_sensibles = true Y finalidad_terminada = true ENTONCES anonimizar DESPUÉS DE 30 días"
                        ]
                    },
                    
                    "parametros_configurables": {
                        "criterios_aplicacion": [
                            "Categoría de datos",
                            "Área responsable",
                            "Tipo de titular",
                            "Base de licitud",
                            "Estado del consentimiento",
                            "Cumplimiento de finalidad"
                        ],
                        "tipos_accion": [
                            "Eliminar (borrado físico)",
                            "Anonimizar (irreversible)",
                            "Archivar (solo lectura)",
                            "Alertar (notificar para revisión manual)",
                            "Transferir (mover a sistema archivo)"
                        ],
                        "tipos_tiempo": [
                            "Días/meses/años desde creación",
                            "Días desde última modificación",
                            "Días desde fin de relación contractual",
                            "Fecha específica (vencimiento contrato)",
                            "Evento trigger (revocación consentimiento)"
                        ]
                    }
                },
                
                "automatizacion_ejecucion": {
                    "titulo": "Automatización de la Ejecución",
                    "descripcion_manual": "El sistema debe incluir un motor de automatización (ej. un cron job o un worker de Celery) que se ejecute periódicamente para: 1. Identificar todos los registros de datos que han excedido su período de retención definido. 2. Ejecutar la acción definida. 3. Registro de Auditoría.",
                    
                    "motor_automatizacion": {
                        "arquitectura_tecnica": {
                            "componente_principal": "Scheduler (ej. Celery Beat + Redis)",
                            "frecuencia_ejecucion": "Diaria para verificación, semanal para ejecución",
                            "paralelizacion": "Procesamiento por lotes para grandes volúmenes",
                            "failover": "Recuperación automática en caso de fallos"
                        },
                        
                        "proceso_paso_1": {
                            "titulo": "1. Identificar registros vencidos",
                            "algoritmo": [
                                "Consultar todas las políticas activas",
                                "Para cada política, ejecutar query de identificación",
                                "Generar lista de registros candidatos a eliminación",
                                "Aplicar filtros de exclusión (procesos legales pendientes)",
                                "Agrupar por tipo de acción requerida"
                            ],
                            "optimizaciones": [
                                "Indexación de campos de fecha",
                                "Caché de consultas frecuentes",
                                "Procesamiento incremental"
                            ]
                        },
                        
                        "proceso_paso_2": {
                            "titulo": "2. Ejecutar acciones definidas",
                            "tipos_ejecucion": {
                                "eliminacion_segura": {
                                    "descripcion_manual": "Eliminación Segura: Invocar una API en el sistema de origen para realizar un borrado físico de los datos.",
                                    "implementacion": [
                                        "Llamada a API de sistema origen",
                                        "Verificación de respuesta exitosa",
                                        "Confirmación de borrado con query de verificación",
                                        "Manejo de errores y retry automático"
                                    ],
                                    "consideraciones_tecnicas": [
                                        "Transacciones atómicas para consistencia",
                                        "Backup temporal antes de eliminación",
                                        "Verificación de integridad referencial"
                                    ]
                                },
                                "anonimizacion": {
                                    "descripcion_manual": "Anonimización: Aplicar un script de anonimización que reemplace los campos de identificación personal con valores no identificables.",
                                    "tecnicas_implementadas": [
                                        "Reemplazo con valores genéricos (RUT → ANONIMO_001)",
                                        "Generalización (edad 34 → rango 30-40)",
                                        "Supresión selectiva de campos identificadores",
                                        "Adición de ruido estadístico"
                                    ],
                                    "validacion_efectividad": [
                                        "Test de re-identificación automático",
                                        "Verificación de utilidad estadística",
                                        "Confirmación de irreversibilidad"
                                    ]
                                }
                            }
                        },
                        
                        "proceso_paso_3": {
                            "titulo": "3. Registro de Auditoría",
                            "descripcion_manual": "Cada acción de eliminación o anonimización debe ser registrada de forma detallada en los logs inmutables del sistema de cumplimiento, incluyendo qué dato se eliminó, cuándo y en base a qué política.",
                            
                            "estructura_log": {
                                "campos_obligatorios": [
                                    "timestamp_ejecucion",
                                    "id_politica_aplicada",
                                    "tipo_accion_ejecutada",
                                    "cantidad_registros_afectados",
                                    "sistemas_origen_impactados",
                                    "usuario_responsable_politica",
                                    "resultado_ejecucion",
                                    "errores_o_excepciones"
                                ],
                                "ejemplo_entrada_log": {
                                    "timestamp": "2024-08-19T10:30:00Z",
                                    "id_politica": "POL_RRHH_CV_180D",
                                    "accion": "ELIMINACION_SEGURA",
                                    "registros_afectados": 247,
                                    "sistemas": ["RRHH_DB", "BACKUP_STORAGE"],
                                    "responsable": "dpo@empresa.cl",
                                    "resultado": "EXITOSO",
                                    "detalles": "247 currículums no seleccionados eliminados según política"
                                }
                            },
                            
                            "inmutabilidad_logs": {
                                "tecnologia": "Blockchain interno o sistema append-only",
                                "hash_verificacion": "SHA-256 de cada entrada",
                                "distribucion": "Copia en múltiples ubicaciones",
                                "acceso_auditores": "Solo lectura para auditores externos"
                            },
                            
                            "reportes_automaticos": [
                                "Reporte semanal de ejecuciones al DPO",
                                "Dashboard en tiempo real de estado de políticas",
                                "Alertas de fallos en ejecución",
                                "Resumen mensual para dirección"
                            ]
                        }
                    }
                }
            }
        }
    },
    
    "tabla_ejemplo_rat": {
        "titulo": "Tabla 3.1: Plantilla de Registro de Actividad de Tratamiento (RAT)",
        "descripcion": "Ejemplo completo basado en el manual: Actividad de Monitoreo de Salud de Biomasa",
        
        "ejemplo_completo_manual": {
            "id_actividad": "PROD-001",
            "nombre_actividad": "Monitoreo de salud y alimentación de biomasa mediante IA",
            "responsable_proceso": "Gerente de Producción",
            "finalidades": "Optimizar la alimentación, detectar tempranamente enfermedades, asegurar el bienestar animal, cumplir con normativas sanitarias.",
            "base_licitud": "Interés legítimo (eficiencia productiva y bienestar animal), Cumplimiento de obligación legal (normativa sanitaria).",
            "categorias_titulares": "No aplica directamente a personas naturales.",
            "categorias_datos": "Datos de sensores (O2, temp.), imágenes de video de los peces, datos de alimentación, registros de mortalidad. Nota: Si los datos pueden vincularse a un operario específico, se convierte en dato personal.",
            "sistemas_implicados": "Sensores IoT, Software de Acuicultura (ej. Mercatus AS), Plataforma de IA, ERP (SAP).",
            "destinatarios_internos_externos": "Equipo de Producción, Veterinarios, SERNAPESCA (reportes agregados).",
            "transferencias_internacionales": "Sí, a proveedor de plataforma de IA en EE.UU. (Ver Módulo 6).",
            "plazo_conservacion": "Datos brutos: 2 años. Informes agregados: 10 años.",
            "medidas_seguridad": "Cifrado de datos en tránsito y en reposo, control de acceso basado en roles (RBAC) a la plataforma de IA."
        },
        
        "analisis_caso": {
            "aspectos_criticos": [
                "Datos aparentemente no personales que pueden convertirse en personales",
                "Transferencia internacional a EE.UU. para procesamiento IA",
                "Diferenciación de plazos: datos brutos vs. agregados",
                "Cumplimiento de normativa sectorial (SERNAPESCA)"
            ],
            "lecciones_aprendidas": [
                "Siempre evaluar si datos 'técnicos' pueden vincularse a personas",
                "Documentar transferencias internacionales aunque sean técnicas",
                "Diferenciar plazos según tipo de dato y finalidad",
                "Considerar normativas sectoriales además de LPDP"
            ]
        }
    }
}

# SIMULADORES INTERACTIVOS COMPLETOS
SIMULADORES_PRACTICOS = {
    "simulador_entrevista_rrhh_completo": {
        "titulo": "Simulador Completo: Entrevista RRHH - Proceso de Reclutamiento",
        "descripcion": "Simulación paso a paso de entrevista real para mapeo de actividades de tratamiento",
        "duracion_estimada": "45 minutos",
        "nivel": "Profesional",
        
        "personaje": {
            "nombre": "María González Pérez",
            "cargo": "Jefa de Recursos Humanos",
            "empresa": "AquaTech Salmon SpA",
            "experiencia": "8 años en RRHH, 3 años en el cargo actual",
            "personalidad": "Práctica, directa, conoce bien los procesos pero no la terminología legal de protección de datos",
            "contexto": "La empresa tiene 180 empleados en 3 centros de cultivo y oficina central en Puerto Montt"
        },
        
        "escenarios_progresivos": [
            {
                "etapa": 1,
                "titulo": "Apertura e Introducción del Proceso",
                "situacion": "Inicio de la entrevista. María sabe que viene por 'protección de datos' pero no está clara de qué específicamente necesita entregar.",
                "dialogo_maria": "Hola, me dijeron que vienes por el tema de protección de datos. La verdad es que manejamos mucha información acá en RRHH... currículums, datos de empleados, planillas... ¿Qué necesitas saber exactamente?",
                
                "opciones_respuesta": [
                    {
                        "opcion": "A",
                        "texto": "Necesito que me entregues una lista de todas las bases de datos que manejas en RRHH",
                        "es_correcta": false,
                        "feedback": "❌ INCORRECTO: Esta pregunta se enfoca en sistemas, no en procesos. No te ayudará a entender las actividades de tratamiento."
                    },
                    {
                        "opcion": "B", 
                        "texto": "Me interesa conocer los procesos que realizan en RRHH que involucren información de personas, desde que llega un currículum hasta después que termina la relación laboral",
                        "es_correcta": true,
                        "feedback": "✅ CORRECTO: Te enfocas en procesos y ciclo completo. Esto te permitirá identificar todas las actividades de tratamiento."
                    },
                    {
                        "opcion": "C",
                        "texto": "¿Tienes consentimiento de todos los empleados para manejar sus datos?",
                        "es_correcta": false,
                        "feedback": "❌ INCORRECTO: Saltas directo a bases legales sin entender primero qué datos y para qué se usan."
                    }
                ],
                
                "respuesta_maria_si_correcto": "Ah, perfecto. Sí, nosotros manejamos todo el ciclo... desde que recibimos los currículums, el proceso de selección, luego toda la gestión durante el trabajo, y sí, también cuando la gente se va. ¿Por dónde empezamos?",
                
                "seguimiento_si_correcto": [
                    "Excelente enfoque. Ahora profundizaremos en cada proceso específico.",
                    "Recuerda: el objetivo es mapear ACTIVIDADES, no sistemas.",
                    "Cada actividad debe tener una finalidad clara y específica."
                ]
            },
            
            {
                "etapa": 2,
                "titulo": "Proceso de Reclutamiento - Descubrimiento Inicial",
                "situacion": "María está dispuesta a colaborar. Ahora necesitas obtener detalles específicos del proceso de reclutamiento.",
                "dialogo_maria": "Bueno, el reclutamiento... Nosotros publicamos las ofertas en ChileTrabajos y en nuestro sitio web. Ahí nos llegan los currículums. Después hacemos entrevistas, exámenes... Es todo un proceso.",
                
                "preguntas_modelo": [
                    {
                        "pregunta": "¿Cómo reciben exactamente las postulaciones?",
                        "objetivo": "Identificar puntos de entrada de datos",
                        "respuesta_maria": "Por ChileTrabajos nos llegan por email, del sitio web van directo a una casilla de RRHH, y a veces la gente viene presencial y deja el CV en papel.",
                        "datos_identificados": ["Email", "Formulario web", "CV físico"]
                    },
                    {
                        "pregunta": "¿Qué información solicitan específicamente en las postulaciones?",
                        "objetivo": "Mapear categorías de datos recopilados",
                        "respuesta_maria": "Lo básico: nombre, RUT, teléfono, email, dirección. Después el CV con estudios y experiencia. Para algunos cargos pedimos licencia de conducir. Y para supervisores a veces preguntamos por la situación familiar porque implica viajes.",
                        "datos_identificados": ["Identificación", "Contacto", "Académicos", "Laborales", "Familiares"],
                        "datos_sensibles_detectados": ["Situación familiar (NNA potencial)"]
                    },
                    {
                        "pregunta": "¿Realizan verificaciones con empresas anteriores o referencias?",
                        "objetivo": "Identificar tratamiento de datos de terceros",
                        "respuesta_maria": "Sí, siempre llamamos a las empresas anteriores para confirmar fechas y desempeño. También pedimos una carta de recomendación. Para cargos de confianza hacemos verificación de antecedentes con una empresa externa.",
                        "terceros_identificados": ["Ex-empleadores", "Referencias", "Empresa verificación antecedentes"],
                        "tip_legal": "⚖️ Las verificaciones de referencias involucran datos de terceros. Necesitas base legal y transparencia."
                    }
                ],
                
                "tarea_usuario": "Basándote en esta información, identifica la primera actividad de tratamiento:",
                "respuesta_esperada": {
                    "nombre_actividad": "Proceso de Reclutamiento y Selección de Personal",
                    "finalidad_principal": "Evaluar la idoneidad de candidatos para cubrir vacantes laborales específicas",
                    "categorias_datos": ["Identificación", "Contacto", "Académicos", "Laborales", "Referencias"],
                    "datos_sensibles": ["Información familiar (datos de NNA)"],
                    "terceros": ["ChileTrabajos", "Ex-empleadores", "Empresa verificación antecedentes"]
                }
            },
            
            {
                "etapa": 3,
                "titulo": "Profundización - Exámenes y Evaluaciones",
                "situacion": "María menciona que hacen 'exámenes'. Necesitas profundizar para identificar datos sensibles.",
                "dialogo_maria": "Ah, se me olvidaba. Para todos los cargos operativos hacemos exámenes médicos con la mutual. Y para supervisores hacemos evaluaciones psicológicas con una consultora externa.",
                
                "pregunta_critica": "¿Qué información específica obtienen de esos exámenes?",
                "respuesta_maria_detallada": "Del examen médico nos llega un certificado que dice 'apto' o 'no apto' para el cargo. A veces incluye restricciones como 'no puede levantar más de 20 kilos' o 'no puede trabajar en altura'. De las evaluaciones psicológicas nos dan un informe con el perfil de personalidad y si es compatible con el cargo.",
                
                "analisis_usuario": {
                    "datos_sensibles_identificados": ["Datos de salud física", "Restricciones médicas", "Perfil psicológico"],
                    "base_legal_requerida": "Medidas precontractuales + interés legítimo para seguridad laboral",
                    "terceros_encargados": ["Mutual de Empleadores", "Consultora psicológica"],
                    "medidas_especiales": "Datos sensibles requieren mayor protección y justificación específica"
                },
                
                "pregunta_seguimiento": "¿Cómo manejan esta información cuando el candidato NO es seleccionado?",
                "respuesta_maria": "Uy, buena pregunta. Los exámenes de los que no quedan... creo que los guardamos un tiempo por si acaso, pero no sé exactamente cuánto. Los CVs sí que los botamos después de unos meses.",
                
                "problema_identificado": "Falta política clara de retención para datos sensibles de candidatos no seleccionados",
                "solucion_requerida": "Definir plazo específico (máximo 6 meses) y procedimiento de eliminación segura"
            },
            
            {
                "etapa": 4,
                "titulo": "Datos Socioeconómicos - Caso Crítico Ley 21.719",
                "situacion": "María menciona que 'a veces preguntamos por situación familiar'. Esto puede involucrar datos socioeconómicos.",
                "dialogo_maria": "Para algunos cargos, especialmente supervisores, preguntamos si tienen familia, cuántos hijos, si la señora trabaja... Es para saber si pueden viajar a los centros o si necesitan un sueldo más alto porque mantienen familia.",
                
                "alerta_critica": "🚨 DATO SENSIBLE DETECTADO: Situación socioeconómica",
                "explicacion_legal": "Según Art. 2 lit. g de la Ley 21.719, la 'situación socioeconómica' es dato sensible. Esto incluye evaluaciones de capacidad económica para definir remuneraciones.",
                
                "pregunta_tecnica": "¿Cómo deciden el sueldo de entrada para una persona?",
                "respuesta_maria": "Bueno, tenemos bandas por cargo, pero dentro de la banda dependemos de la experiencia y también de la situación de la persona. Si sabemos que necesita más porque mantiene familia o viene de un sueldo alto, tratamos de ajustarnos.",
                
                "problema_legal_grave": {
                    "descripcion": "Uso de situación socioeconómica para determinar remuneración sin consentimiento explícito",
                    "riesgo": "Violación Art. 8 Ley 21.719 - Tratamiento de datos sensibles sin base legal apropiada",
                    "solucion_inmediata": [
                        "Definir banda salarial objetiva por cargo",
                        "Si requieren evaluación socioeconómica, obtener consentimiento explícito",
                        "Documentar justificación para cada caso",
                        "Implementar procedimiento de eliminación post-contratación"
                    ]
                },
                
                "tarea_usuario": "Redacta la justificación legal para esta actividad:",
                "respuesta_esperada": "Para evaluación socioeconómica en determinación de remuneraciones, se requiere consentimiento explícito del candidato, explicando que la información se usa exclusivamente para ajustar la oferta salarial dentro de banda predefinida, y que será eliminada inmediatamente después de la contratación o rechazo."
            },
            
            {
                "etapa": 5,
                "titulo": "Finalización y Documentación Completa",
                "situacion": "Has recopilado información suficiente para documentar completamente la actividad de reclutamiento.",
                
                "resumen_actividad_completa": {
                    "nombre_actividad": "Proceso de Reclutamiento y Selección de Personal",
                    "responsable_proceso": "Jefa de RRHH - María González",
                    "finalidades_especificas": [
                        "Evaluar idoneidad profesional de candidatos",
                        "Verificar antecedentes laborales y referencias",
                        "Determinar aptitud médica para el cargo",
                        "Evaluar compatibilidad psicológica con responsabilidades",
                        "Definir condiciones de contratación apropiadas"
                    ],
                    "base_licitud_por_finalidad": {
                        "evaluacion_profesional": "Medidas precontractuales (Art. 7 letra b)",
                        "verificacion_antecedentes": "Interés legítimo - seguridad laboral (Art. 7 letra f)",
                        "examenes_medicos": "Cumplimiento obligación legal - Ley 16.744 (Art. 7 letra c)",
                        "evaluacion_socioeconomica": "Consentimiento explícito (Art. 7 letra a)"
                    },
                    "categorias_datos_detalladas": {
                        "identificacion": ["Nombre", "RUT", "Dirección", "Fecha nacimiento"],
                        "contacto": ["Teléfono", "Email", "Dirección"],
                        "academicos": ["Títulos", "Certificaciones", "Cursos"],
                        "laborales": ["Experiencia", "Cargos anteriores", "Referencias"],
                        "sensibles_salud": ["Aptitud médica", "Restricciones físicas"],
                        "sensibles_psicologicos": ["Perfil personalidad", "Competencias"],
                        "sensibles_socioeconomicos": ["Situación familiar", "Expectativas salariales"]
                    },
                    "terceros_involucrados": {
                        "encargados": [
                            "Mutual de Empleadores (exámenes médicos)",
                            "Consultora Psicológica (evaluaciones)",
                            "Empresa Verificación Antecedentes"
                        ],
                        "cesionarios": [
                            "Ex-empleadores (verificación referencias)",
                            "Referencias personales"
                        ]
                    },
                    "transferencias_internacionales": "No identificadas en este proceso",
                    "retencion_diferenciada": {
                        "candidatos_seleccionados": "Durante relación laboral + 2 años",
                        "candidatos_no_seleccionados": "6 meses máximo",
                        "datos_sensibles_rechazados": "Eliminación inmediata"
                    },
                    "medidas_seguridad": [
                        "Acceso restringido al equipo RRHH",
                        "Cifrado de archivos con datos sensibles",
                        "Logs de acceso y modificación",
                        "Contratos de confidencialidad con terceros"
                    ]
                },
                
                "evaluacion_final": {
                    "aspectos_bien_documentados": [
                        "Proceso completo mapeado",
                        "Datos sensibles identificados correctamente",
                        "Terceros y sus roles clarificados",
                        "Bases legales apropiadas asignadas"
                    ],
                    "aspectos_a_mejorar": [
                        "Definir política de retención más específica",
                        "Implementar consentimiento explícito para datos socioeconómicos",
                        "Establecer procedimiento de eliminación automática",
                        "Capacitar a equipo RRHH en manejo de datos sensibles"
                    ],
                    "proximos_pasos": [
                        "Documentar proceso de gestión de nómina",
                        "Mapear proceso de evaluación de desempeño",
                        "Revisar proceso de término de relación laboral"
                    ]
                }
            }
        ],
        
        "evaluacion_competencias": {
            "criterios_evaluacion": [
                "Capacidad de hacer preguntas orientadas a procesos",
                "Identificación correcta de datos sensibles",
                "Reconocimiento de terceros y su clasificación",
                "Asignación apropiada de bases legales",
                "Detección de problemas de cumplimiento",
                "Propuesta de soluciones prácticas"
            ],
            "puntaje_minimo_aprobacion": 75,
            "certificacion": "Competente en Mapeo de Actividades RRHH según Ley 21.719"
        }
    }
}

# FORMULARIOS DESCARGABLES REALES
FORMULARIOS_DESCARGABLES = {
    "entrevista_rrhh": {
        "nombre_archivo": "Formulario_Entrevista_RRHH_Ley21719.xlsx",
        "descripcion": "Formulario estructurado para entrevista completa con área de RRHH",
        "contenido_detallado": {
            "seccion_1_procesos_principales": [
                "1.1. ¿Cómo reciben las postulaciones? (Canales: web, email, presencial)",
                "1.2. ¿Qué información solicitan en formulario inicial?",
                "1.3. ¿Realizan evaluaciones psicotécnicas? ¿Con empresa externa?",
                "1.4. ¿Verifican referencias laborales? ¿Qué consultan exactamente?",
                "1.5. ¿Solicitan exámenes médicos? ¿Qué información de salud obtienen?",
                "1.6. ¿Evalúan situación socioeconómica para definir renta? ¿Cómo?",
                "1.7. ¿Cómo comunican decisiones de selección?",
                "1.8. ¿Qué pasa con datos de candidatos no seleccionados?"
            ],
            "seccion_2_datos_sensibles": [
                "2.1. ¿Recopilan datos de salud de empleados? ¿Para qué?",
                "2.2. ¿Manejan información de situación socioeconómica?",
                "2.3. ¿Registran afiliación sindical o actividades gremiales?",
                "2.4. ¿Tienen datos de familiares (cargas)? ¿De menores de edad?",
                "2.5. ¿Usan datos biométricos (huella, facial)?",
                "2.6. ¿Solicitan información sobre religión o creencias?"
            ],
            "seccion_3_terceros": [
                "3.1. ¿Con qué terceros comparten información de empleados?",
                "3.2. ¿Usan empresas externas para nómina, capacitación, beneficios?",
                "3.3. ¿Reportan información a organismos? (Previred, SII, etc.)",
                "3.4. ¿Tienen contratos específicos de protección de datos?"
            ],
            "seccion_4_retencion": [
                "4.1. ¿Por cuánto tiempo conservan CVs de no seleccionados?",
                "4.2. ¿Qué pasa con datos de empleados que renuncian?",
                "4.3. ¿Tienen procedimiento de eliminación de datos?",
                "4.4. ¿Conservan información para referencias futuras?"
            ]
        }
    },
    
    "plantilla_rat_completa": {
        "nombre_archivo": "Plantilla_RAT_Completa_Ley21719.xlsx",
        "descripcion": "Plantilla oficial con todos los campos requeridos por la Ley 21.719",
        "tabs_incluidas": {
            "actividades_tratamiento": "Registro principal de cada actividad",
            "clasificacion_datos": "Matriz de clasificación por sensibilidad",
            "flujos_datos": "Mapeo de transferencias internas y externas",
            "terceros": "Catálogo de encargados y cesionarios",
            "politicas_retencion": "Definición de plazos por categoría",
            "medidas_seguridad": "Inventario de controles implementados"
        }
    },
    
    "matriz_clasificacion": {
        "nombre_archivo": "Matriz_Clasificacion_Datos_Sensibles.xlsx",
        "descripcion": "Herramienta para clasificar datos por nivel de sensibilidad según Ley 21.719",
        "incluye_ejemplos": [
            "Ejemplos específicos de situación socioeconómica",
            "Casos de datos de NNA en contexto laboral",
            "Clasificación de datos biométricos",
            "Criterios para datos de salud laboral"
        ]
    }
}

@router.get("/introduccion")
def get_introduccion_modulo3():
    """Obtener introducción completa del Módulo 3 basada en manual"""
    return {
        "success": True,
        "modulo": "modulo3_inventario",
        "contenido": MODULO3_CONTENT["introduccion"],
        "estructura_completa": {
            "seccion_3_1": "Procedimientos para el Personal",
            "seccion_3_2": "Especificaciones Técnicas del Sistema"
        },
        "recursos_disponibles": {
            "formularios_descargables": len(FORMULARIOS_DESCARGABLES),
            "simuladores_interactivos": len(SIMULADORES_PRACTICOS),
            "casos_practicos_incluidos": "Basados en sector salmonero y casos reales chilenos"
        }
    }

@router.get("/seccion/{seccion_id}")
def get_seccion_completa(seccion_id: str):
    """Obtener sección específica del Módulo 3 con contenido completo"""
    if seccion_id not in MODULO3_CONTENT:
        return {
            "success": False,
            "error": "Sección no encontrada",
            "secciones_disponibles": list(MODULO3_CONTENT.keys())
        }
    
    return {
        "success": True,
        "modulo": "modulo3_inventario",
        "seccion": seccion_id,
        "contenido": MODULO3_CONTENT[seccion_id],
        "basado_en_manual": True,
        "casos_practicos_incluidos": True
    }

@router.get("/simulador/{simulador_id}")
def get_simulador_completo(simulador_id: str):
    """Obtener simulador interactivo específico"""
    if simulador_id not in SIMULADORES_PRACTICOS:
        return {
            "success": False,
            "error": "Simulador no encontrado",
            "simuladores_disponibles": list(SIMULADORES_PRACTICOS.keys())
        }
    
    return {
        "success": True,
        "simulador": SIMULADORES_PRACTICOS[simulador_id],
        "interactivo": True,
        "evaluacion_incluida": True
    }

@router.get("/formularios")
def get_formularios_completos():
    """Obtener formularios descargables completos"""
    return {
        "success": True,
        "formularios": FORMULARIOS_DESCARGABLES,
        "total_formularios": len(FORMULARIOS_DESCARGABLES),
        "listos_para_descarga": True
    }

@router.get("/tabla-ejemplo-rat")
def get_tabla_ejemplo_manual():
    """Obtener tabla de ejemplo RAT del manual"""
    return {
        "success": True,
        "tabla_ejemplo": MODULO3_CONTENT["tabla_ejemplo_rat"],
        "basado_en_manual": True,
        "sector": "Acuicultura - Monitoreo IoT"
    }

def _get_seccion_anterior(seccion_id: str) -> Optional[str]:
    flujo = ["introduccion", "seccion_3_1", "seccion_3_2", "tabla_ejemplo_rat"]
    try:
        indice = flujo.index(seccion_id)
        return flujo[indice - 1] if indice > 0 else None
    except ValueError:
        return None

def _get_seccion_siguiente(seccion_id: str) -> Optional[str]:
    flujo = ["introduccion", "seccion_3_1", "seccion_3_2", "tabla_ejemplo_rat"]
    try:
        indice = flujo.index(seccion_id)
        return flujo[indice + 1] if indice < len(flujo) - 1 else None
    except ValueError:
        return None