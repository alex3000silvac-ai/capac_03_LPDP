"""
SANDBOX REAL - SIMULACIÓN COMPLETA DE INVENTARIO DE DATOS
Sistema que permite crear un inventario real paso a paso, área por área
Con dependencias trazables y mapeo completo según Manual Parte 3
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, date
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json

router = APIRouter()

# MODELO DE DATOS PARA EL INVENTARIO REAL
class ActividadInventario(BaseModel):
    id_actividad: str
    nombre_actividad: str
    area_responsable: str
    responsable_proceso: str
    finalidades: List[str]
    base_licitud: str
    justificacion_base: str
    categorias_titulares: List[str]
    categorias_datos: Dict[str, Any]
    datos_sensibles: List[str]
    sistemas_almacenamiento: List[str]
    destinatarios_internos: List[str]
    terceros_encargados: List[Dict[str, str]]
    terceros_cesionarios: List[Dict[str, str]]
    transferencias_internacionales: Dict[str, Any]
    plazo_conservacion: str
    criterio_eliminacion: str
    medidas_seguridad: Dict[str, Any]
    dependencias_otros_datos: List[str]
    quien_mas_usa_dato: List[str]
    integraciones_sistemas: List[str]

# SIMULADOR PASO A PASO POR ÁREA
SIMULADOR_INVENTARIO = {
    "configuracion_empresa": {
        "titulo": "Configuración de Empresa para Simulación",
        "descripcion": "Configure los datos básicos de su empresa para personalizar el inventario",
        "campos_requeridos": {
            "nombre_empresa": {
                "tipo": "texto",
                "requerido": True,
                "ejemplo": "AquaTech Salmon SpA",
                "descripcion": "Nombre legal completo de la empresa"
            },
            "rut_empresa": {
                "tipo": "texto", 
                "patron": "XX.XXX.XXX-X",
                "requerido": True,
                "ejemplo": "76.123.456-7"
            },
            "sector_industria": {
                "tipo": "select",
                "opciones": [
                    "Acuicultura y Pesca",
                    "Agricultura y Ganadería", 
                    "Minería",
                    "Manufactura",
                    "Construcción",
                    "Comercio",
                    "Transporte",
                    "Servicios Financieros",
                    "Tecnología",
                    "Salud",
                    "Educación",
                    "Otros"
                ],
                "requerido": True
            },
            "numero_empleados": {
                "tipo": "select",
                "opciones": ["1-10", "11-50", "51-200", "201-500", "500+"],
                "requerido": True,
                "impacto": "Determina complejidad de procesos y obligaciones legales"
            },
            "ubicaciones": {
                "tipo": "multiple",
                "descripcion": "Oficinas, plantas, centros de operación",
                "ejemplo": ["Oficina Central Puerto Montt", "Centro Cultivo Chiloé", "Centro Cultivo Aysén"]
            },
            "dpo_designado": {
                "tipo": "boolean",
                "requerido": True,
                "descripcion": "¿Han designado un Delegado de Protección de Datos?"
            }
        }
    },
    
    "rrhh_inventario": {
        "titulo": "Área RRHH - Inventario de Datos Paso a Paso",
        "descripcion": "Complete el inventario de datos del área de Recursos Humanos siguiendo el proceso del manual",
        
        "proceso_1_reclutamiento": {
            "nombre_actividad": "Proceso de Reclutamiento y Selección",
            "wizard_paso_a_paso": {
                "paso_1_finalidades": {
                    "titulo": "¿Para qué usan los datos en reclutamiento?",
                    "instruccion": "Según el manual: debe ser específica, explícita y legítima",
                    "opciones_sugeridas": [
                        "Evaluar idoneidad profesional de candidatos",
                        "Verificar antecedentes laborales",
                        "Determinar aptitud médica para el cargo",
                        "Evaluar situación socioeconómica para oferta salarial",
                        "Comunicar decisiones de selección"
                    ],
                    "campo_personalizado": "Agregar finalidad específica de su empresa",
                    "validacion": "Cada finalidad debe ser específica y justificable legalmente"
                },
                
                "paso_2_datos_recopilados": {
                    "titulo": "¿Qué datos específicos recopilan?",
                    "instruccion_manual": "Categorías de datos personales tratados según manual",
                    "categorias_sistematicas": {
                        "identificacion": {
                            "titulo": "Datos de Identificación",
                            "campos_tipicos": [
                                "Nombre completo",
                                "RUT/Cédula",
                                "Fecha de nacimiento",
                                "Nacionalidad",
                                "Estado civil",
                                "Dirección domicilio"
                            ],
                            "obligatorio": True,
                            "razon": "Necesarios para identificar al candidato"
                        },
                        "contacto": {
                            "titulo": "Datos de Contacto",
                            "campos_tipicos": [
                                "Teléfono móvil",
                                "Email personal",
                                "Email alternativo",
                                "Contacto de emergencia",
                                "Redes sociales profesionales"
                            ],
                            "obligatorio": True,
                            "razon": "Comunicación durante proceso"
                        },
                        "academicos": {
                            "titulo": "Historial Académico",
                            "campos_tipicos": [
                                "Nivel educacional",
                                "Títulos obtenidos",
                                "Certificaciones",
                                "Cursos relevantes",
                                "Idiomas"
                            ],
                            "obligatorio": False,
                            "evaluacion_necesidad": "¿Es relevante para el cargo?"
                        },
                        "laborales": {
                            "titulo": "Experiencia Laboral",
                            "campos_tipicos": [
                                "Empresas anteriores",
                                "Cargos desempeñados",
                                "Período de trabajo",
                                "Motivo de salida",
                                "Sueldo anterior",
                                "Referencias laborales"
                            ],
                            "datos_sensibles_atencion": ["Sueldo anterior = situación socioeconómica"],
                            "base_legal_especial": "Situación socioeconómica requiere consentimiento explícito"
                        },
                        "salud": {
                            "titulo": "Datos de Salud (SENSIBLES)",
                            "campos_tipicos": [
                                "Examen médico preocupacional",
                                "Aptitud física para el cargo",
                                "Restricciones médicas",
                                "Discapacidades",
                                "Alergias relevantes"
                            ],
                            "es_sensible": True,
                            "base_legal_requerida": "Cumplimiento obligación legal (Ley 16.744) O consentimiento explícito",
                            "medidas_especiales": "Cifrado reforzado, acceso muy restringido"
                        },
                        "socioeconomicos": {
                            "titulo": "Situación Socioeconómica (SENSIBLE - CRÍTICO)",
                            "descripcion_manual": "Novedad crucial de la ley chilena - debe ser tratado con máximo nivel de protección",
                            "campos_tipicos": [
                                "Expectativas salariales",
                                "Situación familiar para definir sueldo",
                                "Necesidades económicas específicas",
                                "Evaluación de poder de negociación",
                                "Comparación con sueldo anterior"
                            ],
                            "es_sensible": True,
                            "obligatorio_consentimiento": True,
                            "justificacion_requerida": "¿Por qué necesitan evaluar situación socioeconómica?",
                            "alternativas_legales": [
                                "Banda salarial fija por cargo",
                                "Evaluación solo por experiencia objetiva",
                                "Consentimiento explícito con eliminación post-decisión"
                            ]
                        },
                        "familiares": {
                            "titulo": "Datos Familiares (Potencial NNA)",
                            "campos_tipicos": [
                                "Estado civil",
                                "Número de hijos",
                                "Edades de hijos",
                                "Situación de pareja",
                                "Cargas familiares"
                            ],
                            "atencion_nna": "Si incluye datos de menores de 18 años = datos NNA",
                            "evaluacion_necesidad": "¿Realmente necesario para el cargo?",
                            "alternativa": "Solicitar solo lo mínimo indispensable"
                        }
                    }
                },
                
                "paso_3_fuentes_datos": {
                    "titulo": "¿De dónde obtienen estos datos?",
                    "fuentes_comunes": {
                        "cv_directo": {
                            "descripcion": "CV entregado por candidato",
                            "consentimiento": "Implícito en la postulación",
                            "datos_incluidos": "Todos los declarados por candidato"
                        },
                        "formulario_web": {
                            "descripcion": "Formulario de postulación online",
                            "consentimiento": "Debe ser explícito",
                            "validacion_requerida": "Checkbox de aceptación específica"
                        },
                        "portales_empleo": {
                            "descripcion": "ChileTrabajos, Trabajando.com, etc.",
                            "tercero_involucrado": True,
                            "validacion_necesaria": "¿El portal tenía consentimiento válido?",
                            "datos_adicionales": "Métricas de visualización, interacciones"
                        },
                        "referencias_laborales": {
                            "descripcion": "Verificación con empleadores anteriores",
                            "tercero_involucrado": True,
                            "datos_de_terceros": True,
                            "base_legal": "Interés legítimo para verificación",
                            "limitaciones": "Solo información laboral objetiva"
                        },
                        "examenes_externos": {
                            "descripcion": "Exámenes médicos o psicológicos con terceros",
                            "tercero_encargado": True,
                            "datos_sensibles": True,
                            "contrato_requerido": "Acuerdo de encargo específico",
                            "ejemplo_terceros": ["Mutual de empleadores", "Consultora psicológica"]
                        }
                    }
                },
                
                "paso_4_quien_accede": {
                    "titulo": "¿Quién más accede a estos datos?",
                    "mapeo_accesos": {
                        "internos": {
                            "titulo": "Personal Interno con Acceso",
                            "roles_tipicos": [
                                {
                                    "rol": "Jefe RRHH",
                                    "acceso": "Completo",
                                    "justificacion": "Responsable del proceso",
                                    "datos_sensibles": "Sí, con justificación"
                                },
                                {
                                    "rol": "Analista RRHH",
                                    "acceso": "Operativo",
                                    "justificacion": "Ejecución del proceso",
                                    "datos_sensibles": "Limitado, según necesidad"
                                },
                                {
                                    "rol": "Gerente área solicitante",
                                    "acceso": "CV y evaluaciones",
                                    "justificacion": "Decisión de selección",
                                    "datos_sensibles": "No, solo datos laborales"
                                },
                                {
                                    "rol": "Gerencia General",
                                    "acceso": "Reportes agregados",
                                    "justificacion": "Supervisión del proceso",
                                    "datos_sensibles": "No, solo estadísticas"
                                }
                            ],
                            "principio_need_to_know": "Cada persona debe acceder solo a los datos necesarios para su función específica"
                        },
                        "externos_encargados": {
                            "titulo": "Terceros que Procesan en Nombre de la Empresa",
                            "ejemplos_tipicos": [
                                {
                                    "tercero": "Empresa de exámenes médicos",
                                    "datos_procesados": "Datos personales + salud",
                                    "finalidad": "Realizar exámenes preocupacionales",
                                    "contrato_requerido": "Acuerdo de encargo según Art. 23",
                                    "ubicacion": "Nacional/Internacional",
                                    "medidas_especiales": "Datos sensibles requieren protección reforzada"
                                },
                                {
                                    "tercero": "Consultora de evaluaciones psicológicas",
                                    "datos_procesados": "Datos personales + perfil psicológico",
                                    "finalidad": "Evaluación de competencias",
                                    "resultado_recibido": "Informe de compatibilidad con cargo",
                                    "sensibilidad": "Datos sensibles - perfil psicológico"
                                },
                                {
                                    "tercero": "Sistema de gestión de candidatos (ATS)",
                                    "datos_procesados": "Todos los datos del proceso",
                                    "ubicacion_servidores": "¿Nacional o internacional?",
                                    "atencion": "Si es internacional = transferencia internacional"
                                }
                            ]
                        },
                        "externos_cesionarios": {
                            "titulo": "Terceros que Reciben Datos para Sus Fines",
                            "ejemplos_tipicos": [
                                {
                                    "tercero": "Ex-empleadores (para referencias)",
                                    "datos_compartidos": "Período laboral, cargo, desempeño",
                                    "base_legal": "Interés legítimo para verificación",
                                    "limitaciones": "Solo información laboral objetiva"
                                },
                                {
                                    "tercero": "Organismos públicos (si aplica)",
                                    "datos_compartidos": "Datos según requerimiento legal",
                                    "base_legal": "Cumplimiento obligación legal",
                                    "ejemplos": "Inspección del Trabajo en caso de denuncias"
                                }
                            ]
                        }
                    }
                },
                
                "paso_5_dependencias_sistemas": {
                    "titulo": "¿Con qué otros sistemas se relaciona?",
                    "mapeo_integraciones": {
                        "sistemas_origen": [
                            "Portal web corporativo",
                            "Email RRHH",
                            "Portales de empleo externos"
                        ],
                        "sistemas_procesamiento": [
                            "Sistema RRHH interno",
                            "Base de datos candidatos",
                            "Sistema de evaluaciones"
                        ],
                        "sistemas_destino": [
                            {
                                "sistema": "Sistema de nómina",
                                "cuando": "Si candidato es seleccionado",
                                "datos_transferidos": "Datos personales + contractuales",
                                "automatico": True
                            },
                            {
                                "sistema": "Sistema de capacitación",
                                "cuando": "Inducción de nuevo empleado",
                                "datos_transferidos": "Datos básicos + perfil competencias",
                                "automatico": False
                            },
                            {
                                "sistema": "Archivo histórico",
                                "cuando": "Candidato no seleccionado",
                                "datos_transferidos": "CV + evaluación básica",
                                "retencion": "6 meses máximo"
                            }
                        ]
                    },
                    "flujo_datos_completo": [
                        "Portal empleo → Email RRHH → Sistema RRHH → Evaluación externa → Sistema RRHH → Decisión → (Si seleccionado: Nómina) O (Si rechazado: Archivo temporal)"
                    ]
                },
                
                "paso_6_dependencias_areas": {
                    "titulo": "¿Qué otras áreas usan estos datos?",
                    "mapeo_interdependencias": {
                        "finanzas": {
                            "datos_utilizados": ["Datos bancarios", "Expectativas salariales", "Evaluación socioeconómica"],
                            "finalidad": "Configuración de nómina y beneficios",
                            "momento": "Post-contratación",
                            "base_legal": "Ejecución de contrato laboral"
                        },
                        "legal": {
                            "datos_utilizados": ["Antecedentes", "Referencias", "Documentos legales"],
                            "finalidad": "Validación legal de contratación",
                            "momento": "Durante proceso de selección",
                            "base_legal": "Cumplimiento obligaciones laborales"
                        },
                        "seguridad": {
                            "datos_utilizados": ["Datos identificación", "Antecedentes"],
                            "finalidad": "Control de acceso y seguridad",
                            "momento": "Primer día de trabajo",
                            "base_legal": "Interés legítimo - seguridad"
                        },
                        "capacitacion": {
                            "datos_utilizados": ["Perfil competencias", "Historial académico"],
                            "finalidad": "Diseño plan de desarrollo",
                            "momento": "Proceso de inducción",
                            "base_legal": "Ejecución contrato + interés legítimo desarrollo"
                        }
                    }
                },
                
                "paso_7_retencion_eliminacion": {
                    "titulo": "¿Cuánto tiempo conservan los datos?",
                    "politicas_diferenciadas": {
                        "candidatos_seleccionados": {
                            "periodo": "Durante relación laboral + 2 años",
                            "base_legal": "Art. 416 Código del Trabajo",
                            "que_se_conserva": "Expediente completo de selección",
                            "donde": "Integrado al expediente laboral"
                        },
                        "candidatos_no_seleccionados": {
                            "periodo": "6 meses máximo",
                            "base_legal": "Principio proporcionalidad",
                            "que_se_conserva": "CV básico + evaluación general",
                            "eliminacion_especial": "Datos sensibles se eliminan inmediatamente"
                        },
                        "datos_terceros_referencias": {
                            "periodo": "Solo durante el proceso",
                            "eliminacion": "Inmediata tras verificación",
                            "justificacion": "No hay base legal para conservación prolongada"
                        }
                    },
                    "procedimiento_eliminacion": {
                        "automatico": "Sistema debe eliminar automáticamente al vencer plazo",
                        "validacion": "Verificar que no hay procesos legales pendientes",
                        "metodo": "Eliminación segura + log de auditoría",
                        "responsable": "Jefe RRHH con validación DPO"
                    }
                },
                
                "paso_8_medidas_seguridad": {
                    "titulo": "¿Qué medidas de seguridad implementan?",
                    "por_tipo_dato": {
                        "datos_comunes": [
                            "Control de acceso con usuario/password",
                            "Backup regular de información",
                            "Antivirus actualizado",
                            "Acceso solo desde equipos corporativos"
                        ],
                        "datos_sensibles": [
                            "Cifrado de archivos con datos sensibles",
                            "Acceso con doble autenticación",
                            "Logs detallados de todos los accesos",
                            "Segregación física/lógica",
                            "Acuerdos de confidencialidad específicos"
                        ],
                        "comunicaciones_terceros": [
                            "Email cifrado para envío de CVs",
                            "Contratos específicos de protección de datos",
                            "Validación de medidas de seguridad del tercero",
                            "Canales seguros para recepción de informes"
                        ]
                    }
                }
            },
            
            "resultado_actividad_completa": {
                "id_actividad": "RRHH-001",
                "nombre_actividad": "Proceso de Reclutamiento y Selección de Personal",
                "area_responsable": "Recursos Humanos",
                "responsable_proceso": "Jefe de RRHH",
                "finalidades": [
                    "Evaluar idoneidad profesional de candidatos para cubrir vacantes específicas",
                    "Verificar antecedentes laborales y referencias profesionales",
                    "Determinar aptitud médica y psicológica para el cargo",
                    "Establecer condiciones de contratación apropiadas"
                ],
                "base_licitud": "Múltiple: Medidas precontractuales (Art. 7b) + Cumplimiento obligación legal para exámenes (Art. 7c) + Consentimiento explícito para datos socioeconómicos (Art. 7a)",
                "categorias_titulares": ["Postulantes a empleos", "Referencias laborales"],
                "datos_tratados": {
                    "identificacion": ["Nombre", "RUT", "Fecha nacimiento", "Dirección"],
                    "contacto": ["Teléfono", "Email", "Contacto emergencia"],
                    "academicos": ["Títulos", "Certificaciones", "Idiomas"],
                    "laborales": ["Experiencia", "Cargos", "Referencias"],
                    "sensibles_salud": ["Examen médico", "Restricciones físicas"],
                    "sensibles_socioeconomicos": ["Expectativas salariales", "Situación familiar para definir oferta"],
                    "sensibles_psicologicos": ["Perfil personalidad", "Competencias evaluadas"]
                },
                "sistemas_involucrados": [
                    "Portal web corporativo",
                    "Sistema RRHH interno", 
                    "Base datos candidatos",
                    "Email corporativo"
                ],
                "terceros_encargados": [
                    {"nombre": "Mutual de Empleadores", "finalidad": "Exámenes médicos", "ubicacion": "Chile"},
                    {"nombre": "Consultora ABC", "finalidad": "Evaluaciones psicológicas", "ubicacion": "Chile"}
                ],
                "terceros_cesionarios": [
                    {"nombre": "Ex-empleadores", "finalidad": "Verificación referencias", "base_legal": "Interés legítimo"}
                ],
                "transferencias_internacionales": {"existe": False, "justificacion": "Todos los terceros son nacionales"},
                "retencion": "Seleccionados: vida laboral + 2 años. No seleccionados: 6 meses. Datos sensibles no seleccionados: eliminación inmediata",
                "medidas_seguridad": [
                    "Control acceso basado en roles",
                    "Cifrado datos sensibles",
                    "Logs auditoría detallados",
                    "Contratos confidencialidad terceros"
                ],
                "dependencias_identificadas": [
                    "→ Sistema Nómina (si seleccionado)",
                    "→ Área Legal (validación contratación)",
                    "→ Área Seguridad (control acceso)",
                    "→ Área Capacitación (inducción)"
                ],
                "matriz_who_uses_what": {
                    "datos_identificacion": ["RRHH", "Legal", "Seguridad", "Finanzas"],
                    "datos_academicos": ["RRHH", "Capacitación"],
                    "datos_sensibles_salud": ["RRHH exclusivamente"],
                    "datos_socioeconomicos": ["RRHH", "Finanzas (solo post-contratación)"]
                }
            }
        },
        
        "proceso_2_nomina": {
            "nombre_actividad": "Gestión de Nómina y Beneficios",
            "descripcion": "Complete el inventario para el proceso de nómina siguiendo la misma metodología",
            "datos_especificos_nomina": {
                "identificacion_empleado": ["RUT", "Nombre", "Dirección actualizada"],
                "contractuales": ["Fecha ingreso", "Cargo", "Tipo contrato", "Jornada"],
                "remuneracionales": ["Sueldo base", "Bonos", "Comisiones", "Descuentos"],
                "familiares_cargas": ["Cónyuge", "Hijos menores 18", "Hijos estudiantes hasta 24", "Otros dependientes"],
                "bancarios": ["Banco", "Tipo cuenta", "Número cuenta"],
                "previsionales": ["AFP", "Plan salud", "Seguro cesantía"],
                "sensibles_salud": ["Licencias médicas", "Subsidios", "Accidentes trabajo"],
                "sensibles_socioeconomicos": ["Evaluación para préstamos empresa", "Beneficios según situación económica"]
            },
            "terceros_obligatorios": [
                {"nombre": "Previred", "finalidad": "Cotizaciones previsionales", "base_legal": "Obligación legal"},
                {"nombre": "SII", "finalidad": "Información tributaria", "base_legal": "Obligación legal"},
                {"nombre": "AFP correspondiente", "finalidad": "Cotizaciones", "base_legal": "Obligación legal"},
                {"nombre": "Isapres/Fonasa", "finalidad": "Cotizaciones salud", "base_legal": "Obligación legal"}
            ]
        },
        
        "proceso_3_evaluacion": {
            "nombre_actividad": "Evaluación de Desempeño",
            "datos_performance": {
                "objetivos_metas": ["Metas asignadas", "Resultados alcanzados", "KPIs específicos"],
                "competencias": ["Evaluación habilidades", "Áreas de mejora", "Fortalezas"],
                "sensibles_potenciales": ["Problemas personales que afectan trabajo", "Situación familiar", "Temas de salud laboral"]
            }
        }
    },
    
    "finanzas_inventario": {
        "titulo": "Área Finanzas - Inventario de Datos",
        "foco_datos_sensibles": "Especial atención a situación socioeconómica como dato sensible",
        
        "proceso_1_evaluacion_crediticia": {
            "nombre_actividad": "Evaluación Crediticia de Clientes",
            "wizard_finanzas": {
                "paso_1_que_evaluan": {
                    "titulo": "¿Qué aspectos evalúan para otorgar crédito?",
                    "datos_socioeconomicos_criticos": [
                        "Ingresos declarados y comprobables",
                        "Patrimonio (propiedades, vehículos)",
                        "Historial crediticio en centrales de riesgo",
                        "Capacidad de pago calculada",
                        "Score crediticio interno",
                        "Relación deuda/ingreso",
                        "Estabilidad laboral",
                        "Avales y garantías"
                    ],
                    "todos_son_sensibles": "TODOS estos datos son 'situación socioeconómica' = DATOS SENSIBLES en Chile",
                    "base_legal_requerida": "Interés legítimo MUY bien justificado O consentimiento explícito"
                },
                
                "paso_2_fuentes_informacion": {
                    "titulo": "¿De dónde obtienen esta información?",
                    "fuentes_internas": [
                        "Formulario solicitud crédito",
                        "Documentos aportados por cliente",
                        "Historial de pagos previos"
                    ],
                    "fuentes_externas_terceros": [
                        {
                            "tercero": "DICOM",
                            "datos_obtenidos": "Historial crediticio, morosidades",
                            "tipo_tercero": "Cesionario",
                            "base_legal": "Interés legítimo para evaluación riesgo"
                        },
                        {
                            "tercero": "Equifax",
                            "datos_obtenidos": "Score crediticio, verificación ingresos",
                            "tipo_tercero": "Cesionario",
                            "transferencia_internacional": "Posible - verificar ubicación servidores"
                        },
                        {
                            "tercero": "Bancos (verificación cuenta)",
                            "datos_obtenidos": "Saldos promedio, movimientos",
                            "autorizacion_requerida": "Consentimiento específico del cliente"
                        }
                    ]
                },
                
                "paso_3_decisiones_automaticas": {
                    "titulo": "¿Usan algoritmos automáticos para decidir?",
                    "atencion_legal": "Decisiones automatizadas sobre datos sensibles requieren salvaguardias especiales",
                    "ejemplos_decisiones": [
                        "Aprobación/rechazo automático por score",
                        "Determinación de monto máximo",
                        "Definición de tasa de interés",
                        "Requerimiento de garantías adicionales"
                    ],
                    "derechos_titular": [
                        "Derecho a explicación de la decisión",
                        "Derecho a revisión humana",
                        "Derecho a impugnación"
                    ]
                }
            }
        },
        
        "proceso_2_cobranza": {
            "nombre_actividad": "Gestión de Cobranza",
            "datos_adicionales_cobranza": [
                "Evaluación actualizada capacidad de pago",
                "Situación económica sobreviniente",
                "Bienes embargables",
                "Terceros obligados al pago"
            ],
            "terceros_cobranza": [
                "Empresas de cobranza externa",
                "Estudios jurídicos",
                "Centrales de riesgo (para reportar)"
            ]
        }
    },
    
    "marketing_inventario": {
        "titulo": "Área Marketing - Inventario de Datos Digitales",
        
        "proceso_1_digital_tracking": {
            "nombre_actividad": "Marketing Digital y Tracking Online",
            "datos_automaticos": [
                "Cookies de navegación",
                "Direcciones IP", 
                "Comportamiento en sitio web",
                "Interacciones con publicidad",
                "Perfiles de interés inferidos"
            ],
            "transferencias_internacionales_automaticas": [
                "Google Analytics (Estados Unidos)",
                "Facebook Pixel (Estados Unidos)", 
                "Advertising platforms diversos"
            ],
            "base_legal_compleja": "Consentimiento para cookies no técnicas + Interés legítimo para mejora del sitio"
        }
    },
    
    "operaciones_inventario": {
        "titulo": "Área Operaciones - IoT y Monitoreo",
        "foco_sector": "Especial atención a datos IoT que pueden volverse personales",
        
        "proceso_iot_cultivo": {
            "nombre_actividad": "Monitoreo IoT Centros de Cultivo",
            "ejemplo_manual": "Basado en ejemplo del manual: Monitoreo de salud y alimentación de biomasa mediante IA",
            "datos_aparentemente_no_personales": [
                "Temperatura agua por centro",
                "Niveles oxígeno",
                "Datos alimentación automática",
                "Registros mortalidad"
            ],
            "conversion_a_personales": [
                "Si centro está asignado a operario específico",
                "Si alertas van dirigidas a persona nominada",
                "Si datos se usan para evaluación de desempeño",
                "Si responsabilidades están individualizadas"
            ],
            "transferencia_ia": "Sí, a proveedor de plataforma de IA en EE.UU. - Transferencia internacional"
        }
    }
}

# MATRIZ DE DEPENDENCIAS TRAZABLES
MATRIZ_DEPENDENCIAS = {
    "datos_identificacion_basicos": {
        "areas_que_usan": ["RRHH", "Finanzas", "Legal", "Seguridad", "Marketing"],
        "sistemas_que_almacenan": ["Sistema RRHH", "ERP Finanzas", "CRM", "Control Acceso"],
        "terceros_que_acceden": ["Previred", "SII", "Bancos"],
        "transferencias_entre_areas": [
            "RRHH → Finanzas (post-contratación)",
            "RRHH → Seguridad (control acceso)",
            "Marketing → Finanzas (leads calificados)"
        ]
    },
    "datos_socioeconomicos": {
        "definicion": "CRÍTICO: Dato sensible en Chile",
        "areas_que_usan": ["RRHH (evaluación sueldo)", "Finanzas (evaluación crédito)", "Marketing (segmentación)"],
        "base_legal_cada_uso": {
            "rrhh": "Consentimiento explícito para determinación salarial",
            "finanzas": "Interés legítimo para evaluación riesgo crediticio",
            "marketing": "Consentimiento explícito para segmentación"
        },
        "flujos_criticos": [
            "Cliente solicita crédito → Finanzas evalúa → Datos quedan en historial → Marketing NO puede usar sin nuevo consentimiento"
        ]
    }
}

# API ENDPOINTS PARA EL SANDBOX REAL

@router.post("/empresa/configurar")
def configurar_empresa_sandbox(configuracion: dict):
    """Configurar empresa para simulación de inventario"""
    # Validar configuración básica
    campos_requeridos = ["nombre_empresa", "rut_empresa", "sector_industria", "numero_empleados"]
    for campo in campos_requeridos:
        if campo not in configuracion:
            return {"success": False, "error": f"Campo requerido: {campo}"}
    
    # Simular guardado de configuración
    empresa_id = f"SIM_{configuracion['rut_empresa'].replace('.', '').replace('-', '')}"
    
    return {
        "success": True,
        "empresa_id": empresa_id,
        "configuracion_guardada": configuracion,
        "siguiente_paso": "Seleccionar área para comenzar inventario",
        "areas_disponibles": ["RRHH", "Finanzas", "Marketing", "Operaciones"]
    }

@router.get("/areas/{area}/procesos")
def get_procesos_por_area(area: str):
    """Obtener procesos disponibles para inventariar por área"""
    if area.upper() not in ["RRHH", "FINANZAS", "MARKETING", "OPERACIONES"]:
        return {"success": False, "error": "Área no válida"}
    
    area_data = SIMULADOR_INVENTARIO.get(f"{area.lower()}_inventario", {})
    if not area_data:
        return {"success": False, "error": "Área no implementada aún"}
    
    procesos = [key for key in area_data.keys() if key.startswith("proceso_")]
    
    return {
        "success": True,
        "area": area,
        "procesos_disponibles": procesos,
        "descripcion": area_data.get("descripcion", ""),
        "foco_especial": area_data.get("foco_datos_sensibles", area_data.get("foco_sector", ""))
    }

@router.get("/proceso/{area}/{proceso_id}/wizard")
def get_wizard_proceso(area: str, proceso_id: str):
    """Obtener wizard paso a paso para documentar un proceso específico"""
    area_key = f"{area.lower()}_inventario"
    if area_key not in SIMULADOR_INVENTARIO:
        return {"success": False, "error": "Área no encontrada"}
    
    area_data = SIMULADOR_INVENTARIO[area_key]
    if proceso_id not in area_data:
        return {"success": False, "error": "Proceso no encontrado"}
    
    proceso = area_data[proceso_id]
    
    return {
        "success": True,
        "area": area,
        "proceso": proceso_id,
        "wizard": proceso.get("wizard_paso_a_paso", {}),
        "nombre_actividad": proceso.get("nombre_actividad", ""),
        "resultado_esperado": proceso.get("resultado_actividad_completa", {})
    }

@router.post("/actividad/documentar")
def documentar_actividad_inventario(actividad: ActividadInventario):
    """Documentar una actividad completa en el inventario"""
    # Validaciones básicas
    if not actividad.nombre_actividad:
        return {"success": False, "error": "Nombre de actividad es requerido"}
    
    if not actividad.finalidades:
        return {"success": False, "error": "Debe especificar al menos una finalidad"}
    
    # Simular guardado en inventario
    actividad_guardada = {
        "id": actividad.id_actividad,
        "timestamp": datetime.now().isoformat(),
        "actividad": actividad.dict(),
        "validaciones": {
            "datos_sensibles_identificados": len(actividad.datos_sensibles) > 0,
            "terceros_documentados": len(actividad.terceros_encargados) + len(actividad.terceros_cesionarios) > 0,
            "base_legal_especificada": bool(actividad.base_licitud),
            "retención_definida": bool(actividad.plazo_conservacion)
        }
    }
    
    return {
        "success": True,
        "actividad_guardada": actividad_guardada,
        "siguiente_paso": "Revisar dependencias con otras áreas",
        "dependencias_sugeridas": MATRIZ_DEPENDENCIAS.get("datos_identificacion_basicos", {})
    }

@router.get("/inventario/matriz-dependencias")
def get_matriz_dependencias():
    """Obtener matriz completa de dependencias entre datos, áreas y sistemas"""
    return {
        "success": True,
        "matriz_dependencias": MATRIZ_DEPENDENCIAS,
        "uso": "Identificar qué áreas usan qué datos y cómo se relacionan",
        "visualizacion": "Recomendamos crear diagrama de flujo basado en esta matriz"
    }

@router.get("/inventario/resumen/{empresa_id}")
def get_resumen_inventario(empresa_id: str):
    """Obtener resumen del inventario creado"""
    # Simular datos del inventario
    resumen = {
        "empresa_id": empresa_id,
        "actividades_documentadas": 8,
        "areas_completadas": ["RRHH"],
        "areas_pendientes": ["Finanzas", "Marketing", "Operaciones"],
        "datos_sensibles_identificados": [
            "Situación socioeconómica en evaluación salarial",
            "Datos de salud en exámenes médicos",
            "Datos de NNA en cargas familiares"
        ],
        "transferencias_internacionales": 2,
        "terceros_involucrados": 8,
        "proximos_pasos": [
            "Completar inventario de área Finanzas",
            "Documentar políticas de retención específicas",
            "Implementar medidas de seguridad para datos sensibles",
            "Crear procedimientos de eliminación automática"
        ]
    }
    
    return {
        "success": True,
        "resumen": resumen,
        "completitud": "25%",
        "areas_criticas": ["Datos socioeconómicos requieren atención especial por ser sensibles en Chile"]
    }

@router.get("/plantilla/excel/{tipo}")
def get_plantilla_excel(tipo: str):
    """Generar plantilla Excel descargable con estructura del inventario"""
    tipos_disponibles = ["inventario_completo", "por_area", "matriz_dependencias"]
    
    if tipo not in tipos_disponibles:
        return {"success": False, "error": "Tipo de plantilla no válido"}
    
    plantilla_estructura = {
        "inventario_completo": {
            "tabs": [
                "Configuración Empresa",
                "Inventario RRHH", 
                "Inventario Finanzas",
                "Inventario Marketing",
                "Inventario Operaciones",
                "Matriz Dependencias",
                "Resumen Cumplimiento"
            ],
            "campos_por_actividad": [
                "ID Actividad", "Nombre Actividad", "Área Responsable",
                "Finalidades", "Base Licitud", "Categorías Titulares",
                "Datos Personales", "Datos Sensibles", "Sistemas",
                "Terceros Encargados", "Terceros Cesionarios",
                "Transferencias Internacionales", "Retención",
                "Medidas Seguridad", "Dependencias"
            ]
        }
    }
    
    return {
        "success": True,
        "tipo_plantilla": tipo,
        "estructura": plantilla_estructura.get(tipo, {}),
        "download_url": f"/sandbox/download/plantilla_{tipo}.xlsx",
        "instrucciones": "Esta plantilla le permite crear su inventario real siguiendo la estructura del manual"
    }