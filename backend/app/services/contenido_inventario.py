"""
Servicio de contenido para el Módulo de Inventario y Mapeo de Datos
Basado en el Capítulo 3 de la Ley 21.719
"""
from typing import Dict, List, Any

CONTENIDO_INVENTARIO = {
    "modulo": {
        "id": "MOD-INV-001",
        "nombre": "Inventario y Mapeo de Datos",
        "descripcion": "Aprende a crear tu Registro de Actividades de Tratamiento (RAT) mientras cumples con la Ley 21.719",
        "duracion_total": 240,  # minutos
        "resultado_esperado": "Al finalizar tendrás tu inventario inicial documentado y las herramientas para completarlo"
    },
    
    "capitulos": [
        {
            "id": "CAP-1",
            "numero": 1,
            "titulo": "Fundamentos del Inventario de Datos",
            "duracion": 30,
            "lecciones": [
                {
                    "id": "LEC-1.1",
                    "titulo": "¿Por qué necesitas un inventario?",
                    "tipo": "video_interactivo",
                    "contenido": {
                        "video_url": "/videos/por-que-inventario.mp4",
                        "transcripcion": """
                        El inventario de datos es la piedra angular de todo sistema de cumplimiento.
                        Sin saber qué datos tienes, dónde están, por qué los tienes y cuándo eliminarlos,
                        es imposible cumplir con la Ley 21.719.
                        
                        Consecuencias de no tener inventario:
                        - Multas de hasta 5.000 UTM
                        - Imposibilidad de responder derechos ARCOPOL
                        - Riesgo de brechas no detectadas
                        - Pérdida de confianza de clientes
                        """,
                        "puntos_interactivos": [
                            {
                                "tiempo": 120,
                                "pregunta": "¿Cuál es la multa máxima por no tener inventario?",
                                "opciones": ["1.000 UTM", "5.000 UTM", "10.000 UTM"],
                                "respuesta_correcta": 1
                            }
                        ]
                    },
                    "ejercicio_practico": {
                        "titulo": "Identifica tus primeras actividades",
                        "instruccion": "Piensa en tu área de trabajo. Lista 3 procesos donde manejes información de personas:",
                        "formulario": {
                            "campos": [
                                {
                                    "id": "proceso_1",
                                    "label": "Proceso 1",
                                    "tipo": "text",
                                    "placeholder": "Ej: Recepción de currículums",
                                    "validacion": "requerido"
                                },
                                {
                                    "id": "proceso_2", 
                                    "label": "Proceso 2",
                                    "tipo": "text",
                                    "placeholder": "Ej: Registro de clientes",
                                    "validacion": "requerido"
                                },
                                {
                                    "id": "proceso_3",
                                    "label": "Proceso 3", 
                                    "tipo": "text",
                                    "placeholder": "Ej: Encuestas de satisfacción",
                                    "validacion": "requerido"
                                }
                            ]
                        },
                        "feedback": "¡Excelente! Estos procesos serán la base de tu inventario."
                    }
                },
                {
                    "id": "LEC-1.2",
                    "titulo": "El cambio de paradigma: Actividades, no sistemas",
                    "tipo": "teoria_practica",
                    "contenido": {
                        "teoria": """
                        ERROR COMÚN: "¿Qué bases de datos tienen?"
                        ENFOQUE CORRECTO: "¿Qué HACEN con datos de personas?"
                        
                        La metodología correcta se centra en ACTIVIDADES DE TRATAMIENTO:
                        - Proceso de reclutamiento
                        - Gestión de nómina
                        - Campañas de marketing
                        - Atención al cliente
                        
                        Cada actividad puede usar múltiples sistemas, pero lo importante
                        es el PROPÓSITO y el FLUJO de los datos.
                        """,
                        "ejemplo_interactivo": {
                            "titulo": "Analicemos: Proceso de Reclutamiento",
                            "pasos": [
                                {
                                    "pregunta": "¿Dónde empieza el proceso?",
                                    "opciones": [
                                        "Publicación de la vacante",
                                        "Recepción del CV", 
                                        "Entrevista inicial"
                                    ],
                                    "respuesta_correcta": 0,
                                    "explicacion": "El tratamiento empieza desde que publicas y defines qué datos pedirás"
                                },
                                {
                                    "pregunta": "¿Qué datos recolectas?",
                                    "campos_dinamicos": [
                                        {"tipo": "checkbox", "label": "Nombre completo"},
                                        {"tipo": "checkbox", "label": "RUT"},
                                        {"tipo": "checkbox", "label": "Experiencia laboral"},
                                        {"tipo": "checkbox", "label": "Datos de salud"},
                                        {"tipo": "checkbox", "label": "Pretensiones de renta"}
                                    ]
                                },
                                {
                                    "pregunta": "¿Con quién compartes estos datos?",
                                    "campo_multiple": {
                                        "tipo": "tags",
                                        "placeholder": "Agrega destinatarios...",
                                        "sugerencias": [
                                            "Gerentes de área",
                                            "Empresa de selección",
                                            "Verificación de antecedentes",
                                            "Exámenes preocupacionales"
                                        ]
                                    }
                                }
                            ]
                        }
                    },
                    "formulario_rat": {
                        "titulo": "Documenta tu primera actividad",
                        "instruccion": "Usando uno de los procesos que identificaste, completa este RAT simplificado:",
                        "campos": [
                            {
                                "id": "nombre_actividad",
                                "label": "Nombre de la actividad",
                                "tipo": "select_con_texto",
                                "opciones": ["Usar proceso identificado", "Ingresar nuevo"],
                                "validacion": "requerido"
                            },
                            {
                                "id": "finalidad",
                                "label": "¿Para qué usas estos datos? (Finalidad)",
                                "tipo": "textarea",
                                "placeholder": "Ej: Evaluar candidatos para vacantes laborales",
                                "ayuda": "Sé específico. Evita finalidades genéricas.",
                                "validacion": "min:20"
                            },
                            {
                                "id": "base_licitud",
                                "label": "Base de licitud",
                                "tipo": "select",
                                "opciones": [
                                    {"valor": "consentimiento", "texto": "Consentimiento del titular"},
                                    {"valor": "contrato", "texto": "Ejecución de contrato"},
                                    {"valor": "obligacion_legal", "texto": "Obligación legal"},
                                    {"valor": "interes_legitimo", "texto": "Interés legítimo"}
                                ],
                                "ayuda_contextual": true
                            },
                            {
                                "id": "categorias_datos",
                                "label": "Tipos de datos que recolectas",
                                "tipo": "checkbox_multiple",
                                "opciones": [
                                    "Identificación (nombre, RUT)",
                                    "Contacto (email, teléfono)",
                                    "Laborales (cargo, empresa)",
                                    "Académicos (títulos, cursos)",
                                    "Económicos (renta, deudas)",
                                    "Salud (licencias, discapacidad)",
                                    "Otros sensibles"
                                ]
                            }
                        ],
                        "guardar_como": "actividad_1"
                    }
                },
                {
                    "id": "LEC-1.3",
                    "titulo": "Los 10 elementos del RAT completo",
                    "tipo": "referencia_interactiva",
                    "contenido": {
                        "elementos_rat": [
                            {
                                "campo": "ID de Actividad",
                                "descripcion": "Código único para identificar",
                                "ejemplo": "RRHH-001",
                                "obligatorio": true
                            },
                            {
                                "campo": "Nombre de la Actividad",
                                "descripcion": "Descripción clara del proceso",
                                "ejemplo": "Proceso de Reclutamiento y Selección",
                                "obligatorio": true
                            },
                            {
                                "campo": "Responsable del Proceso",
                                "descripcion": "Quién responde por esta actividad",
                                "ejemplo": "Gerente de Recursos Humanos",
                                "obligatorio": true
                            },
                            {
                                "campo": "Finalidad(es)",
                                "descripcion": "Para qué se usan los datos",
                                "ejemplo": "Evaluar idoneidad de candidatos",
                                "obligatorio": true
                            },
                            {
                                "campo": "Base de Licitud",
                                "descripcion": "Justificación legal del tratamiento",
                                "ejemplo": "Consentimiento, Medidas precontractuales",
                                "obligatorio": true
                            },
                            {
                                "campo": "Categorías de Titulares",
                                "descripcion": "Tipos de personas cuyos datos tratas",
                                "ejemplo": "Postulantes a empleos",
                                "obligatorio": true
                            },
                            {
                                "campo": "Categorías de Datos",
                                "descripcion": "Tipos de información que recolectas",
                                "ejemplo": "Identificación, experiencia, estudios",
                                "obligatorio": true
                            },
                            {
                                "campo": "Destinatarios",
                                "descripcion": "Con quién compartes los datos",
                                "ejemplo": "Gerentes, empresa verificación",
                                "obligatorio": true
                            },
                            {
                                "campo": "Transferencias Internacionales",
                                "descripcion": "Si envías datos fuera de Chile",
                                "ejemplo": "No aplica / AWS Estados Unidos",
                                "obligatorio": true
                            },
                            {
                                "campo": "Plazo de Conservación",
                                "descripcion": "Cuánto tiempo guardas los datos",
                                "ejemplo": "6 meses para no seleccionados",
                                "obligatorio": true
                            }
                        ]
                    },
                    "plantilla_descargable": {
                        "titulo": "Descarga tu plantilla RAT",
                        "descripcion": "Plantilla Excel con los 10 campos y ejemplos",
                        "formato": ["xlsx", "csv"],
                        "personalizada": true
                    }
                }
            ]
        },
        {
            "id": "CAP-2",
            "numero": 2,
            "titulo": "Técnicas de Levantamiento",
            "duracion": 45,
            "lecciones": [
                {
                    "id": "LEC-2.1",
                    "titulo": "El arte de la entrevista de levantamiento",
                    "tipo": "simulacion_interactiva",
                    "contenido": {
                        "introduccion": """
                        La clave está en hacer las preguntas correctas.
                        No preguntes por tecnología, pregunta por ACTIVIDADES.
                        """,
                        "simulador_entrevista": {
                            "personaje": "Jefe de Marketing",
                            "contexto": "Estás entrevistando al Jefe de Marketing sobre sus procesos",
                            "conversacion_guiada": [
                                {
                                    "tu_pregunta_sugerida": "¿Qué actividades de marketing realizan que involucren datos de personas?",
                                    "respuesta_simulada": "Bueno, hacemos campañas de email, tenemos formularios en la web, organizamos eventos...",
                                    "preguntas_seguimiento": [
                                        "Hablemos de las campañas de email. ¿Cómo obtienen los correos?",
                                        "¿Qué información recopilan en los formularios web?",
                                        "Para los eventos, ¿qué datos solicitan a los asistentes?"
                                    ]
                                },
                                {
                                    "pregunta_elegida": "Hablemos de las campañas de email...",
                                    "respuesta_simulada": "Los correos vienen de varias fuentes: clientes actuales, leads de la web, listas que compramos...",
                                    "alerta_pedagogica": "¡Atención! 'Listas que compramos' requiere verificar consentimiento",
                                    "accion_requerida": {
                                        "tipo": "documentar",
                                        "campos": [
                                            {"id": "origen_datos", "valor": "Múltiples fuentes"},
                                            {"id": "riesgo_identificado", "valor": "Listas compradas sin verificar consentimiento"}
                                        ]
                                    }
                                }
                            ]
                        }
                    },
                    "practica_real": {
                        "titulo": "Realiza tu primera entrevista",
                        "instruccion": "Elige un área de tu empresa y usa esta guía",
                        "guia_entrevista": {
                            "preparacion": [
                                "Agenda 30 minutos con el responsable del área",
                                "Lleva el formulario de captura",
                                "No uses términos legales, usa lenguaje simple"
                            ],
                            "preguntas_clave": [
                                {
                                    "area": "General",
                                    "preguntas": [
                                        "¿Qué hacen en su área con información de personas?",
                                        "¿De dónde obtienen esa información?",
                                        "¿Para qué la usan específicamente?",
                                        "¿Con quién la comparten?"
                                    ]
                                },
                                {
                                    "area": "RRHH",
                                    "preguntas": [
                                        "Cuéntame el proceso desde que publican una vacante",
                                        "¿Qué pasa con los CV de no seleccionados?",
                                        "¿Qué datos de salud manejan?",
                                        "¿Cómo gestionan las evaluaciones de desempeño?"
                                    ]
                                },
                                {
                                    "area": "Marketing",
                                    "preguntas": [
                                        "¿Cómo construyen su base de datos de clientes?",
                                        "¿Qué herramientas de análisis usan?",
                                        "¿Hacen perfilamiento o segmentación?",
                                        "¿Comparten datos con agencias?"
                                    ]
                                }
                            ]
                        },
                        "formulario_captura": {
                            "titulo": "Documenta mientras entrevistas",
                            "campos_dinamicos": true,
                            "auto_guardado": true
                        }
                    }
                },
                {
                    "id": "LEC-2.2",
                    "titulo": "Documentación en tiempo real",
                    "tipo": "herramienta_practica",
                    "contenido": {
                        "introduccion": "Aprende a capturar información estructurada mientras conversas",
                        "tecnicas": [
                            {
                                "nombre": "Técnica del Embudo",
                                "descripcion": "De lo general a lo específico",
                                "ejemplo": "Proceso → Datos → Finalidad → Destinatarios → Plazos"
                            },
                            {
                                "nombre": "Validación en el momento",
                                "descripcion": "Confirma lo que entendiste",
                                "frase": "Entonces, si entiendo bien, ustedes..."
                            }
                        ]
                    },
                    "formulario_actividad_completo": {
                        "titulo": "Completa tu segunda actividad",
                        "precarga": "datos_entrevista",
                        "campos_completos": "todos_los_rat",
                        "validacion_inteligente": true,
                        "sugerencias_automaticas": true
                    }
                }
            ]
        },
        {
            "id": "CAP-3",
            "numero": 3,
            "titulo": "Clasificación de Datos",
            "duracion": 30,
            "lecciones": [
                {
                    "id": "LEC-3.1",
                    "titulo": "Datos comunes vs sensibles: La novedad chilena",
                    "tipo": "explicacion_interactiva",
                    "contenido": {
                        "concepto_clave": """
                        NOVEDAD CRUCIAL: En Chile, los datos socioeconómicos son SENSIBLES.
                        Esto incluye: ingresos, deudas, scoring crediticio, beneficios sociales.
                        """,
                        "clasificador_interactivo": {
                            "instruccion": "Arrastra cada dato a su categoría correcta",
                            "datos_para_clasificar": [
                                {"dato": "Nombre completo", "categoria_correcta": "comun"},
                                {"dato": "RUT", "categoria_correcta": "comun"},
                                {"dato": "Sueldo mensual", "categoria_correcta": "sensible"},
                                {"dato": "Email corporativo", "categoria_correcta": "comun"},
                                {"dato": "Afiliación sindical", "categoria_correcta": "sensible"},
                                {"dato": "Deudas bancarias", "categoria_correcta": "sensible"},
                                {"dato": "Huella digital", "categoria_correcta": "sensible"},
                                {"dato": "Dirección", "categoria_correcta": "comun"},
                                {"dato": "Religión", "categoria_correcta": "sensible"},
                                {"dato": "Historial crediticio", "categoria_correcta": "sensible"}
                            ],
                            "feedback_inmediato": true
                        },
                        "implicancias_practicas": {
                            "datos_sensibles_requieren": [
                                "Consentimiento explícito",
                                "Medidas de seguridad reforzadas",
                                "Justificación específica para su tratamiento",
                                "Mayor cuidado en transferencias"
                            ]
                        }
                    },
                    "ejercicio_aplicado": {
                        "titulo": "Clasifica los datos de tus actividades",
                        "instruccion": "Revisa las actividades que documentaste y clasifica cada dato",
                        "carga_actividades_previas": true,
                        "herramienta_clasificacion": "drag_and_drop"
                    }
                },
                {
                    "id": "LEC-3.2",
                    "titulo": "Datos de menores: Requisitos especiales",
                    "tipo": "casos_practicos",
                    "contenido": {
                        "principio_fundamental": "Interés superior del niño + Consentimiento parental",
                        "casos_comunes": [
                            {
                                "caso": "Colegio recopila datos de alumnos",
                                "consideraciones": [
                                    "Consentimiento de ambos padres",
                                    "Datos mínimos necesarios",
                                    "No publicar fotos sin autorización"
                                ]
                            },
                            {
                                "caso": "App educativa para niños",
                                "consideraciones": [
                                    "Verificación de edad",
                                    "Consentimiento verificable de padres",
                                    "No marketing dirigido a menores"
                                ]
                            }
                        ]
                    },
                    "checklist_nna": {
                        "titulo": "Verifica cumplimiento para datos de menores",
                        "items": [
                            "¿Tienes consentimiento de padre/madre/tutor?",
                            "¿El consentimiento es verificable?",
                            "¿Solicitas solo datos mínimos necesarios?",
                            "¿Tienes proceso para que padres ejerzan derechos?",
                            "¿Evitas perfilamiento de menores?"
                        ],
                        "genera_reporte": true
                    }
                }
            ]
        },
        {
            "id": "CAP-4",
            "numero": 4,
            "titulo": "Mapeo de Flujos de Datos",
            "duracion": 60,
            "lecciones": [
                {
                    "id": "LEC-4.1",
                    "titulo": "Flujos internos: El viaje de los datos",
                    "tipo": "constructor_visual",
                    "contenido": {
                        "concepto": "Los datos no están quietos. Viajan entre sistemas, áreas y personas.",
                        "ejemplo_guiado": {
                            "titulo": "Sigamos el flujo de un CV",
                            "pasos": [
                                {"origen": "Portal web", "destino": "Base de datos RRHH", "dato": "CV completo"},
                                {"origen": "BD RRHH", "destino": "Email jefe área", "dato": "CV filtrado"},
                                {"origen": "Jefe área", "destino": "Sistema evaluación", "dato": "Calificación"},
                                {"origen": "Sistema", "destino": "Reporte gerencia", "dato": "Estadísticas"}
                            ]
                        }
                    },
                    "constructor_flujos": {
                        "titulo": "Construye el flujo de tu proceso principal",
                        "herramienta": "drag_drop_visual",
                        "elementos": [
                            {"tipo": "sistema", "iconos": ["base_datos", "crm", "erp", "email"]},
                            {"tipo": "actor", "iconos": ["empleado", "cliente", "proveedor"]},
                            {"tipo": "proceso", "iconos": ["formulario", "api", "reporte"]}
                        ],
                        "validacion": "verifica_flujo_completo",
                        "exportar": ["imagen", "pdf"]
                    }
                },
                {
                    "id": "LEC-4.2",
                    "titulo": "Flujos externos: Terceros y transferencias",
                    "tipo": "analisis_riesgos",
                    "contenido": {
                        "tipos_terceros": [
                            {
                                "tipo": "Encargados de tratamiento",
                                "ejemplos": ["Nube (AWS)", "Email marketing", "Nómina externa"],
                                "requiere": "Contrato de encargo"
                            },
                            {
                                "tipo": "Cesionarios",
                                "ejemplos": ["Empresa de cobranza", "Aseguradora"],
                                "requiere": "Base legal para cesión"
                            }
                        ],
                        "alertas_transferencias": {
                            "internacional": {
                                "paises_adecuados": ["UE", "Canadá", "Japón"],
                                "paises_riesgo": ["Estados Unidos", "India", "China"],
                                "requiere": "Garantías adicionales"
                            }
                        }
                    },
                    "matriz_terceros": {
                        "titulo": "Documenta todos tus proveedores de datos",
                        "tabla_inteligente": {
                            "columnas": [
                                "Nombre tercero",
                                "Tipo relación",
                                "Datos compartidos",
                                "País ubicación",
                                "Garantías"
                            ],
                            "sugerencias_automaticas": true,
                            "alertas_riesgo": true
                        }
                    }
                }
            ]
        },
        {
            "id": "CAP-5",
            "numero": 5,
            "titulo": "Políticas de Retención y Eliminación",
            "duracion": 45,
            "lecciones": [
                {
                    "id": "LEC-5.1",
                    "titulo": "¿Cuánto tiempo es necesario?",
                    "tipo": "calculadora_interactiva",
                    "contenido": {
                        "principio": "Solo el tiempo necesario para la finalidad",
                        "excepciones_legales": [
                            {"tipo": "Laboral", "documentos": "Contratos", "plazo": "5 años"},
                            {"tipo": "Tributario", "documentos": "Facturas", "plazo": "6 años"},
                            {"tipo": "Salud", "documentos": "Fichas médicas", "plazo": "15 años"}
                        ]
                    },
                    "calculadora_retencion": {
                        "titulo": "Define plazos para cada tipo de dato",
                        "categorias_predefinidas": [
                            {
                                "categoria": "CVs no seleccionados",
                                "sugerencia": "6 meses",
                                "justificacion": "Posibles vacantes futuras"
                            },
                            {
                                "categoria": "Datos de clientes activos",
                                "sugerencia": "Mientras dure la relación",
                                "justificacion": "Necesario para el servicio"
                            },
                            {
                                "categoria": "Datos de marketing",
                                "sugerencia": "2 años desde último contacto",
                                "justificacion": "Interés comercial legítimo"
                            }
                        ],
                        "personalizable": true,
                        "genera_politica": true
                    }
                },
                {
                    "id": "LEC-5.2",
                    "titulo": "Procedimientos de eliminación segura",
                    "tipo": "guia_tecnica",
                    "contenido": {
                        "metodos_eliminacion": [
                            {
                                "metodo": "Borrado físico",
                                "cuando": "Dato no necesario para nada",
                                "como": "DELETE permanente + sobrescritura"
                            },
                            {
                                "metodo": "Anonimización",
                                "cuando": "Necesitas estadísticas",
                                "como": "Reemplazar identificadores con valores aleatorios"
                            },
                            {
                                "metodo": "Seudonimización",
                                "cuando": "Posible reidentificación futura",
                                "como": "Separar identificadores de datos"
                            }
                        ]
                    },
                    "template_procedimiento": {
                        "titulo": "Crea tu procedimiento de eliminación",
                        "secciones": [
                            "Identificación de datos a eliminar",
                            "Verificación de excepciones legales",
                            "Método de eliminación",
                            "Registro y auditoría",
                            "Notificación a terceros"
                        ],
                        "formato_salida": "docx"
                    }
                }
            ]
        },
        {
            "id": "CAP-6",
            "numero": 6,
            "titulo": "Consolidación y Entregables",
            "duracion": 30,
            "lecciones": [
                {
                    "id": "LEC-6.1",
                    "titulo": "Tu inventario inicial completo",
                    "tipo": "revision_final",
                    "contenido": {
                        "checklist_completitud": [
                            "Mínimo 3 actividades documentadas",
                            "Todos los campos RAT completos",
                            "Datos clasificados por sensibilidad",
                            "Flujos internos mapeados",
                            "Terceros identificados",
                            "Plazos de retención definidos"
                        ]
                    },
                    "generador_documentos": {
                        "titulo": "Genera tu RAT oficial",
                        "opciones": [
                            {
                                "formato": "Excel",
                                "contenido": "RAT completo con todas las actividades",
                                "personalizado": true
                            },
                            {
                                "formato": "Word",
                                "contenido": "Informe ejecutivo del inventario",
                                "incluye": ["resumen", "hallazgos", "riesgos"]
                            },
                            {
                                "formato": "PDF",
                                "contenido": "Diagrama de flujos de datos",
                                "visual": true
                            }
                        ]
                    }
                },
                {
                    "id": "LEC-6.2",
                    "titulo": "Plan de acción 90 días",
                    "tipo": "planificador",
                    "contenido": {
                        "objetivo": "Completar el 100% del inventario organizacional"
                    },
                    "generador_plan": {
                        "titulo": "Tu hoja de ruta personalizada",
                        "basado_en": "actividades_identificadas",
                        "incluye": [
                            "Áreas pendientes de entrevistar",
                            "Sistemas por mapear",
                            "Contratos con terceros por revisar",
                            "Políticas por formalizar"
                        ],
                        "formato": "gantt_interactivo"
                    }
                },
                {
                    "id": "LEC-6.3",
                    "titulo": "Kit de herramientas para continuar",
                    "tipo": "recursos_descargables",
                    "contenido": {
                        "descripcion": "Todo lo necesario para completar y mantener tu inventario"
                    },
                    "kit_completo": {
                        "incluye": [
                            {
                                "item": "Plantillas RAT",
                                "formatos": ["xlsx", "csv"],
                                "variantes": ["simple", "completo", "por_area"]
                            },
                            {
                                "item": "Guías de entrevista",
                                "formatos": ["pdf", "docx"],
                                "areas": ["RRHH", "Marketing", "IT", "Finanzas"]
                            },
                            {
                                "item": "Matriz de clasificación",
                                "formato": "xlsx",
                                "incluye": "ejemplos_por_industria"
                            },
                            {
                                "item": "Calculadora de retención",
                                "formato": "xlsx",
                                "macros": true
                            },
                            {
                                "item": "Checklist de auditoría",
                                "formato": "pdf",
                                "frecuencia": "trimestral"
                            }
                        ],
                        "descarga": "zip_personalizado"
                    }
                }
            ]
        }
    ],
    
    "ejercicios_transversales": {
        "caso_integrador": {
            "titulo": "Caso: Empresa de Retail Online",
            "descripcion": "Aplica todo lo aprendido en un caso real",
            "incluye": [
                "Proceso de compra online",
                "Programa de fidelización",
                "Gestión de reclamos",
                "Marketing personalizado"
            ],
            "entregable": "RAT completo del caso"
        }
    },
    
    "evaluacion_final": {
        "tipo": "practica",
        "criterios": [
            "Completitud del inventario (40%)",
            "Correcta clasificación de datos (20%)",
            "Identificación de riesgos (20%)",
            "Calidad de documentación (20%)"
        ],
        "certificado": {
            "emite": "Jurídica Digital SPA",
            "titulo": "Especialista en Inventario de Datos Personales",
            "incluye_resultados": true
        }
    }
}

# Funciones para gestionar el progreso del usuario
def obtener_contenido_leccion(capitulo_id: str, leccion_id: str) -> Dict[str, Any]:
    """Obtiene el contenido de una lección específica"""
    for capitulo in CONTENIDO_INVENTARIO["capitulos"]:
        if capitulo["id"] == capitulo_id:
            for leccion in capitulo["lecciones"]:
                if leccion["id"] == leccion_id:
                    return leccion
    return None

def guardar_respuesta_ejercicio(usuario_id: str, ejercicio_id: str, respuesta: Dict[str, Any]) -> Dict[str, Any]:
    """Guarda las respuestas del usuario y actualiza su inventario"""
    # Aquí se implementaría la lógica para:
    # 1. Guardar la respuesta en la BD
    # 2. Actualizar el inventario del usuario
    # 3. Calcular el progreso
    # 4. Generar feedback
    return {
        "guardado": True,
        "progreso_actualizado": True,
        "siguiente_paso": "siguiente_leccion_id"
    }

def generar_documentos_finales(usuario_id: str) -> Dict[str, str]:
    """Genera los documentos finales del inventario del usuario"""
    # Aquí se implementaría la lógica para:
    # 1. Recopilar todas las actividades documentadas
    # 2. Generar el RAT en Excel
    # 3. Crear el informe en Word
    # 4. Generar diagramas de flujo
    # 5. Crear plan de 90 días
    return {
        "rat_excel": "/downloads/rat_usuario_123.xlsx",
        "informe_word": "/downloads/informe_inventario_123.docx",
        "diagrama_flujos": "/downloads/flujos_datos_123.pdf",
        "plan_90_dias": "/downloads/plan_accion_123.pdf"
    }