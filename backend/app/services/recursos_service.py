"""
Servicio de recursos prácticos y plantillas descargables
"""
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
import json
import os
from pathlib import Path

from app.models import User, Empresa, ModuloAcceso
from app.core.config import settings


class RecursosService:
    """
    Servicio que proporciona recursos prácticos, plantillas y casos de implementación
    """
    
    RECURSOS_POR_MODULO = {
        "MOD-1": {
            "nombre": "Kit de Consentimientos",
            "plantillas": [
                {
                    "id": "consent-form-web",
                    "nombre": "Formulario de Consentimiento Web",
                    "descripcion": "Plantilla HTML/CSS lista para implementar en tu sitio web",
                    "archivo": "consentimiento_web.html",
                    "tipo": "html",
                    "tags": ["web", "formulario", "consentimiento"]
                },
                {
                    "id": "consent-form-paper",
                    "nombre": "Formulario de Consentimiento Impreso",
                    "descripcion": "Documento Word/PDF para consentimiento en papel",
                    "archivo": "consentimiento_papel.docx",
                    "tipo": "docx",
                    "tags": ["papel", "formulario", "consentimiento"]
                },
                {
                    "id": "consent-email-template",
                    "nombre": "Plantilla Email de Consentimiento",
                    "descripcion": "Email para solicitar consentimiento a bases existentes",
                    "archivo": "email_consentimiento.html",
                    "tipo": "html",
                    "tags": ["email", "consentimiento", "marketing"]
                },
                {
                    "id": "consent-registry",
                    "nombre": "Registro de Consentimientos Excel",
                    "descripcion": "Planilla Excel para llevar registro manual de consentimientos",
                    "archivo": "registro_consentimientos.xlsx",
                    "tipo": "xlsx",
                    "tags": ["registro", "excel", "control"]
                },
                {
                    "id": "consent-api-spec",
                    "nombre": "API de Consentimientos",
                    "descripcion": "Especificación OpenAPI para implementar sistema de consentimientos",
                    "archivo": "api_consentimientos.yaml",
                    "tipo": "yaml",
                    "tags": ["api", "desarrollo", "integracion"]
                }
            ],
            "guias": [
                {
                    "id": "guide-consent-basics",
                    "nombre": "Guía: Consentimiento según Ley 21.719",
                    "descripcion": "Todo lo que necesitas saber sobre consentimiento válido",
                    "archivo": "guia_consentimiento.pdf",
                    "paginas": 15
                },
                {
                    "id": "guide-consent-implementation",
                    "nombre": "Manual de Implementación",
                    "descripcion": "Paso a paso para implementar gestión de consentimientos",
                    "archivo": "manual_implementacion_consentimientos.pdf",
                    "paginas": 25
                }
            ],
            "caso_practico": {
                "nombre": "E-commerce ChileCompra",
                "descripcion": "Implementa un sistema completo de consentimientos para una tienda online",
                "archivos": [
                    "caso_ecommerce_instrucciones.pdf",
                    "caso_ecommerce_datos.sql",
                    "caso_ecommerce_mockups.zip"
                ],
                "duracion_estimada": 180,
                "nivel": "intermedio"
            }
        },
        "MOD-2": {
            "nombre": "Kit Derechos ARCOPOL",
            "plantillas": [
                {
                    "id": "arcopol-request-form",
                    "nombre": "Formulario Solicitud ARCOPOL",
                    "descripcion": "Formulario web para recibir solicitudes de derechos",
                    "archivo": "formulario_arcopol.html",
                    "tipo": "html",
                    "tags": ["formulario", "derechos", "arcopol"]
                },
                {
                    "id": "arcopol-response-templates",
                    "nombre": "Plantillas de Respuesta ARCOPOL",
                    "descripcion": "Pack de 6 plantillas para responder cada tipo de derecho",
                    "archivo": "respuestas_arcopol.zip",
                    "tipo": "zip",
                    "tags": ["respuestas", "plantillas", "comunicacion"]
                },
                {
                    "id": "arcopol-tracking",
                    "nombre": "Planilla Seguimiento ARCOPOL",
                    "descripcion": "Excel para tracking de solicitudes y plazos",
                    "archivo": "seguimiento_arcopol.xlsx",
                    "tipo": "xlsx",
                    "tags": ["seguimiento", "plazos", "control"]
                },
                {
                    "id": "arcopol-procedure",
                    "nombre": "Procedimiento Interno ARCOPOL",
                    "descripcion": "Documento de procedimiento para tu equipo",
                    "archivo": "procedimiento_arcopol.docx",
                    "tipo": "docx",
                    "tags": ["procedimiento", "interno", "equipo"]
                }
            ],
            "guias": [
                {
                    "id": "guide-arcopol-rights",
                    "nombre": "Guía Completa Derechos ARCOPOL",
                    "descripcion": "Explicación detallada de cada derecho y obligaciones",
                    "archivo": "guia_derechos_arcopol.pdf",
                    "paginas": 20
                },
                {
                    "id": "guide-arcopol-workflow",
                    "nombre": "Flujos de Trabajo ARCOPOL",
                    "descripcion": "Diagramas y procesos para cada tipo de solicitud",
                    "archivo": "flujos_arcopol.pdf",
                    "paginas": 12
                }
            ],
            "caso_practico": {
                "nombre": "Clínica Salud Digital",
                "descripcion": "Gestiona solicitudes ARCOPOL en ambiente de salud con datos sensibles",
                "archivos": [
                    "caso_clinica_contexto.pdf",
                    "caso_clinica_solicitudes.json",
                    "caso_clinica_sistema.zip"
                ],
                "duracion_estimada": 240,
                "nivel": "avanzado"
            }
        },
        "MOD-3": {
            "nombre": "Kit Inventario de Datos",
            "plantillas": [
                {
                    "id": "data-inventory-template",
                    "nombre": "Plantilla Inventario de Datos",
                    "descripcion": "Excel completo para documentar todas tus actividades de tratamiento",
                    "archivo": "inventario_datos.xlsx",
                    "tipo": "xlsx",
                    "tags": ["inventario", "registro", "actividades"]
                },
                {
                    "id": "data-mapping-tool",
                    "nombre": "Herramienta Mapeo de Datos",
                    "descripcion": "Plantilla visual para mapear flujos de datos",
                    "archivo": "mapeo_datos.vsdx",
                    "tipo": "vsdx",
                    "tags": ["mapeo", "flujos", "visual"]
                },
                {
                    "id": "data-classification",
                    "nombre": "Matriz Clasificación de Datos",
                    "descripcion": "Clasifica tus datos por sensibilidad y criticidad",
                    "archivo": "clasificacion_datos.xlsx",
                    "tipo": "xlsx",
                    "tags": ["clasificacion", "sensibilidad", "riesgos"]
                },
                {
                    "id": "third-party-registry",
                    "nombre": "Registro de Terceros",
                    "descripcion": "Documenta todos los terceros que acceden a datos",
                    "archivo": "registro_terceros.xlsx",
                    "tipo": "xlsx",
                    "tags": ["terceros", "proveedores", "acceso"]
                }
            ],
            "guias": [
                {
                    "id": "guide-data-inventory",
                    "nombre": "Guía Creación Inventario de Datos",
                    "descripcion": "Metodología paso a paso para crear tu inventario",
                    "archivo": "guia_inventario.pdf",
                    "paginas": 30
                },
                {
                    "id": "guide-data-lifecycle",
                    "nombre": "Ciclo de Vida del Dato",
                    "descripcion": "Comprende y documenta el ciclo completo",
                    "archivo": "ciclo_vida_dato.pdf",
                    "paginas": 18
                }
            ],
            "caso_practico": {
                "nombre": "Universidad TechChile",
                "descripcion": "Crea el inventario completo de una universidad con múltiples sistemas",
                "archivos": [
                    "caso_universidad_escenario.pdf",
                    "caso_universidad_sistemas.xlsx",
                    "caso_universidad_organigrama.pdf"
                ],
                "duracion_estimada": 300,
                "nivel": "avanzado"
            }
        },
        "MOD-4": {
            "nombre": "Kit Gestión de Brechas",
            "plantillas": [
                {
                    "id": "breach-response-plan",
                    "nombre": "Plan de Respuesta a Brechas",
                    "descripcion": "Protocolo completo de acción ante brechas",
                    "archivo": "plan_respuesta_brechas.docx",
                    "tipo": "docx",
                    "tags": ["plan", "respuesta", "protocolo"]
                },
                {
                    "id": "breach-notification-auth",
                    "nombre": "Plantilla Notificación Autoridad",
                    "descripcion": "Formato oficial para notificar a la APDN",
                    "archivo": "notificacion_autoridad.docx",
                    "tipo": "docx",
                    "tags": ["notificacion", "autoridad", "oficial"]
                },
                {
                    "id": "breach-notification-users",
                    "nombre": "Plantillas Notificación Afectados",
                    "descripcion": "Emails y cartas para notificar a titulares",
                    "archivo": "notificacion_afectados.zip",
                    "tipo": "zip",
                    "tags": ["notificacion", "afectados", "comunicacion"]
                },
                {
                    "id": "breach-assessment",
                    "nombre": "Matriz Evaluación de Brechas",
                    "descripcion": "Evalúa gravedad e impacto de una brecha",
                    "archivo": "evaluacion_brechas.xlsx",
                    "tipo": "xlsx",
                    "tags": ["evaluacion", "gravedad", "impacto"]
                },
                {
                    "id": "breach-registry",
                    "nombre": "Registro de Brechas",
                    "descripcion": "Lleva control de todas las brechas",
                    "archivo": "registro_brechas.xlsx",
                    "tipo": "xlsx",
                    "tags": ["registro", "control", "historico"]
                }
            ],
            "guias": [
                {
                    "id": "guide-breach-management",
                    "nombre": "Guía Gestión de Brechas",
                    "descripcion": "Todo sobre prevención, detección y respuesta",
                    "archivo": "guia_gestion_brechas.pdf",
                    "paginas": 25
                },
                {
                    "id": "guide-breach-prevention",
                    "nombre": "Manual Prevención de Brechas",
                    "descripcion": "Mejores prácticas de seguridad",
                    "archivo": "prevencion_brechas.pdf",
                    "paginas": 20
                }
            ],
            "caso_practico": {
                "nombre": "Banco Digital Chile",
                "descripcion": "Simula y gestiona una brecha en sistema bancario",
                "archivos": [
                    "caso_banco_escenario.pdf",
                    "caso_banco_evidencias.zip",
                    "caso_banco_timeline.xlsx"
                ],
                "duracion_estimada": 180,
                "nivel": "avanzado"
            }
        },
        "MOD-5": {
            "nombre": "Kit Evaluaciones DPIA",
            "plantillas": [
                {
                    "id": "dpia-template",
                    "nombre": "Plantilla DPIA Completa",
                    "descripcion": "Documento Word con todas las secciones necesarias",
                    "archivo": "plantilla_dpia.docx",
                    "tipo": "docx",
                    "tags": ["dpia", "evaluacion", "plantilla"]
                },
                {
                    "id": "dpia-checklist",
                    "nombre": "Checklist DPIA Obligatoria",
                    "descripcion": "Verifica si necesitas hacer DPIA",
                    "archivo": "checklist_dpia.xlsx",
                    "tipo": "xlsx",
                    "tags": ["checklist", "obligatoria", "criterios"]
                },
                {
                    "id": "risk-matrix",
                    "nombre": "Matriz de Riesgos",
                    "descripcion": "Evalúa y prioriza riesgos de privacidad",
                    "archivo": "matriz_riesgos.xlsx",
                    "tipo": "xlsx",
                    "tags": ["riesgos", "matriz", "evaluacion"]
                },
                {
                    "id": "dpia-questionnaire",
                    "nombre": "Cuestionario DPIA",
                    "descripcion": "Preguntas para stakeholders",
                    "archivo": "cuestionario_dpia.docx",
                    "tipo": "docx",
                    "tags": ["cuestionario", "stakeholders", "preguntas"]
                }
            ],
            "guias": [
                {
                    "id": "guide-dpia-methodology",
                    "nombre": "Metodología DPIA",
                    "descripcion": "Proceso completo paso a paso",
                    "archivo": "metodologia_dpia.pdf",
                    "paginas": 35
                },
                {
                    "id": "guide-risk-assessment",
                    "nombre": "Evaluación de Riesgos",
                    "descripcion": "Técnicas de identificación y análisis",
                    "archivo": "evaluacion_riesgos.pdf",
                    "paginas": 22
                }
            ],
            "caso_practico": {
                "nombre": "SmartCity Santiago",
                "descripcion": "Evalúa proyecto de ciudad inteligente con IoT y videovigilancia",
                "archivos": [
                    "caso_smartcity_proyecto.pdf",
                    "caso_smartcity_arquitectura.pdf",
                    "caso_smartcity_datos.xlsx"
                ],
                "duracion_estimada": 360,
                "nivel": "experto"
            }
        },
        "MOD-6": {
            "nombre": "Kit Transferencias Internacionales",
            "plantillas": [
                {
                    "id": "transfer-agreement",
                    "nombre": "Acuerdo Transferencia Internacional",
                    "descripcion": "Contrato modelo con cláusulas tipo",
                    "archivo": "acuerdo_transferencia.docx",
                    "tipo": "docx",
                    "tags": ["contrato", "clausulas", "internacional"]
                },
                {
                    "id": "transfer-registry",
                    "nombre": "Registro Transferencias",
                    "descripcion": "Control de todas las transferencias internacionales",
                    "archivo": "registro_transferencias.xlsx",
                    "tipo": "xlsx",
                    "tags": ["registro", "control", "transferencias"]
                },
                {
                    "id": "country-assessment",
                    "nombre": "Evaluación Países",
                    "descripcion": "Plantilla para evaluar nivel de protección",
                    "archivo": "evaluacion_paises.xlsx",
                    "tipo": "xlsx",
                    "tags": ["paises", "evaluacion", "adecuacion"]
                },
                {
                    "id": "bcr-template",
                    "nombre": "Plantilla BCR",
                    "descripcion": "Normas Corporativas Vinculantes modelo",
                    "archivo": "plantilla_bcr.docx",
                    "tipo": "docx",
                    "tags": ["bcr", "corporativo", "grupo"]
                }
            ],
            "guias": [
                {
                    "id": "guide-international-transfers",
                    "nombre": "Guía Transferencias Internacionales",
                    "descripcion": "Marco legal y requisitos",
                    "archivo": "guia_transferencias.pdf",
                    "paginas": 28
                },
                {
                    "id": "guide-safeguards",
                    "nombre": "Garantías Adecuadas",
                    "descripcion": "Tipos y cuándo usar cada una",
                    "archivo": "garantias_adecuadas.pdf",
                    "paginas": 15
                }
            ],
            "caso_practico": {
                "nombre": "Exportadora AgroChile",
                "descripcion": "Configura transferencias con clientes en USA, UE y Asia",
                "archivos": [
                    "caso_exportadora_contexto.pdf",
                    "caso_exportadora_clientes.xlsx",
                    "caso_exportadora_contratos.zip"
                ],
                "duracion_estimada": 240,
                "nivel": "intermedio"
            }
        },
        "MOD-7": {
            "nombre": "Kit Auditoría y Cumplimiento",
            "plantillas": [
                {
                    "id": "audit-plan",
                    "nombre": "Plan Auditoría Anual",
                    "descripcion": "Planifica auditorías de protección de datos",
                    "archivo": "plan_auditoria.xlsx",
                    "tipo": "xlsx",
                    "tags": ["plan", "auditoria", "anual"]
                },
                {
                    "id": "audit-checklist",
                    "nombre": "Checklist Auditoría",
                    "descripcion": "Lista completa de verificación",
                    "archivo": "checklist_auditoria.xlsx",
                    "tipo": "xlsx",
                    "tags": ["checklist", "verificacion", "control"]
                },
                {
                    "id": "compliance-dashboard",
                    "nombre": "Dashboard Cumplimiento",
                    "descripcion": "Excel con KPIs y métricas",
                    "archivo": "dashboard_cumplimiento.xlsx",
                    "tipo": "xlsx",
                    "tags": ["dashboard", "kpi", "metricas"]
                },
                {
                    "id": "audit-report",
                    "nombre": "Plantilla Informe Auditoría",
                    "descripcion": "Formato profesional de informe",
                    "archivo": "informe_auditoria.docx",
                    "tipo": "docx",
                    "tags": ["informe", "reporte", "auditoria"]
                },
                {
                    "id": "improvement-plan",
                    "nombre": "Plan de Mejora",
                    "descripcion": "Documenta acciones correctivas",
                    "archivo": "plan_mejora.xlsx",
                    "tipo": "xlsx",
                    "tags": ["mejora", "correctivo", "acciones"]
                }
            ],
            "guias": [
                {
                    "id": "guide-audit-methodology",
                    "nombre": "Metodología de Auditoría",
                    "descripcion": "Cómo realizar auditorías efectivas",
                    "archivo": "metodologia_auditoria.pdf",
                    "paginas": 40
                },
                {
                    "id": "guide-compliance-program",
                    "nombre": "Programa de Cumplimiento",
                    "descripcion": "Diseña tu programa integral",
                    "archivo": "programa_cumplimiento.pdf",
                    "paginas": 32
                }
            ],
            "caso_practico": {
                "nombre": "Grupo Retail Chile",
                "descripcion": "Audita cumplimiento en empresa con 50 tiendas y e-commerce",
                "archivos": [
                    "caso_retail_organizacion.pdf",
                    "caso_retail_sistemas.xlsx",
                    "caso_retail_incidentes.json"
                ],
                "duracion_estimada": 420,
                "nivel": "experto"
            }
        }
    }
    
    def get_recursos_modulo(
        self,
        db: Session,
        empresa_id: str,
        modulo_codigo: str
    ) -> Dict[str, Any]:
        """Obtiene todos los recursos disponibles para un módulo"""
        
        # Verificar acceso al módulo
        tiene_acceso = db.query(ModuloAcceso).filter(
            and_(
                ModuloAcceso.empresa_id == empresa_id,
                ModuloAcceso.modulo_codigo == modulo_codigo,
                ModuloAcceso.activo == True
            )
        ).first()
        
        if not tiene_acceso:
            raise ValueError("No tiene acceso a este módulo")
        
        if modulo_codigo not in self.RECURSOS_POR_MODULO:
            raise ValueError("Módulo no válido")
        
        recursos = self.RECURSOS_POR_MODULO[modulo_codigo].copy()
        
        # Agregar información de descarga
        base_url = f"/api/v1/recursos/{modulo_codigo}"
        
        for plantilla in recursos["plantillas"]:
            plantilla["url_descarga"] = f"{base_url}/plantillas/{plantilla['id']}"
            plantilla["vista_previa"] = f"{base_url}/preview/{plantilla['id']}"
        
        for guia in recursos["guias"]:
            guia["url_descarga"] = f"{base_url}/guias/{guia['id']}"
        
        # Información del caso práctico
        caso = recursos["caso_practico"]
        caso["url_inicio"] = f"{base_url}/caso-practico/iniciar"
        caso["archivos_urls"] = [
            f"{base_url}/caso-practico/archivo/{i}"
            for i, _ in enumerate(caso["archivos"])
        ]
        
        return recursos
    
    def buscar_recursos(
        self,
        db: Session,
        empresa_id: str,
        termino: str,
        tipo: Optional[str] = None,
        tags: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """Busca recursos en todos los módulos disponibles"""
        
        # Obtener módulos con acceso
        modulos_acceso = db.query(ModuloAcceso).filter(
            and_(
                ModuloAcceso.empresa_id == empresa_id,
                ModuloAcceso.activo == True
            )
        ).all()
        
        resultados = []
        termino_lower = termino.lower()
        
        for acceso in modulos_acceso:
            if acceso.modulo_codigo not in self.RECURSOS_POR_MODULO:
                continue
            
            recursos = self.RECURSOS_POR_MODULO[acceso.modulo_codigo]
            
            # Buscar en plantillas
            for plantilla in recursos["plantillas"]:
                coincide = False
                
                # Buscar por término
                if (termino_lower in plantilla["nombre"].lower() or 
                    termino_lower in plantilla["descripcion"].lower()):
                    coincide = True
                
                # Filtrar por tipo
                if tipo and plantilla["tipo"] != tipo:
                    coincide = False
                
                # Filtrar por tags
                if tags:
                    if not any(tag in plantilla["tags"] for tag in tags):
                        coincide = False
                
                if coincide:
                    resultados.append({
                        "modulo": acceso.modulo_codigo,
                        "tipo": "plantilla",
                        "recurso": plantilla,
                        "url_descarga": f"/api/v1/recursos/{acceso.modulo_codigo}/plantillas/{plantilla['id']}"
                    })
            
            # Buscar en guías
            for guia in recursos["guias"]:
                if (termino_lower in guia["nombre"].lower() or 
                    termino_lower in guia["descripcion"].lower()):
                    resultados.append({
                        "modulo": acceso.modulo_codigo,
                        "tipo": "guia",
                        "recurso": guia,
                        "url_descarga": f"/api/v1/recursos/{acceso.modulo_codigo}/guias/{guia['id']}"
                    })
        
        return resultados
    
    def get_caso_practico(
        self,
        db: Session,
        usuario_id: str,
        modulo_codigo: str
    ) -> Dict[str, Any]:
        """Obtiene información del caso práctico de un módulo"""
        
        usuario = db.query(User).filter(User.id == usuario_id).first()
        if not usuario:
            raise ValueError("Usuario no encontrado")
        
        # Verificar acceso
        tiene_acceso = db.query(ModuloAcceso).filter(
            and_(
                ModuloAcceso.empresa_id == usuario.tenant_id,
                ModuloAcceso.modulo_codigo == modulo_codigo,
                ModuloAcceso.activo == True
            )
        ).first()
        
        if not tiene_acceso:
            raise ValueError("No tiene acceso a este módulo")
        
        if modulo_codigo not in self.RECURSOS_POR_MODULO:
            raise ValueError("Módulo no válido")
        
        caso = self.RECURSOS_POR_MODULO[modulo_codigo]["caso_practico"].copy()
        
        # Agregar contexto específico según el módulo
        if modulo_codigo == "MOD-1":
            caso["contexto"] = self._generar_contexto_consentimientos()
        elif modulo_codigo == "MOD-2":
            caso["contexto"] = self._generar_contexto_arcopol()
        elif modulo_codigo == "MOD-3":
            caso["contexto"] = self._generar_contexto_inventario()
        elif modulo_codigo == "MOD-4":
            caso["contexto"] = self._generar_contexto_brechas()
        elif modulo_codigo == "MOD-5":
            caso["contexto"] = self._generar_contexto_dpia()
        elif modulo_codigo == "MOD-6":
            caso["contexto"] = self._generar_contexto_transferencias()
        elif modulo_codigo == "MOD-7":
            caso["contexto"] = self._generar_contexto_auditoria()
        
        # Agregar tareas específicas
        caso["tareas"] = self._generar_tareas_caso(modulo_codigo)
        
        # Agregar criterios de evaluación
        caso["evaluacion"] = {
            "criterios": self._generar_criterios_evaluacion(modulo_codigo),
            "entregables": self._generar_entregables(modulo_codigo)
        }
        
        return caso
    
    def _generar_contexto_consentimientos(self) -> Dict[str, Any]:
        """Genera contexto para caso práctico de consentimientos"""
        return {
            "empresa": "ChileCompra E-commerce S.A.",
            "descripcion": "Tienda online con 50,000 clientes activos",
            "situacion": "La empresa nunca ha solicitado consentimiento formal y necesita regularizar su base de datos",
            "datos_actuales": {
                "clientes_registrados": 50000,
                "clientes_con_email": 45000,
                "clientes_newsletter": 25000,
                "datos_recopilados": ["nombre", "email", "rut", "direccion", "telefono", "historial_compras"]
            },
            "desafios": [
                "Obtener consentimiento retroactivo",
                "Implementar sistema para nuevos clientes",
                "Gestionar preferencias de comunicación",
                "Permitir revocación fácil"
            ],
            "recursos_disponibles": {
                "equipo": ["1 desarrollador", "1 abogado", "2 marketing"],
                "presupuesto": "USD 10,000",
                "plazo": "3 meses"
            }
        }
    
    def _generar_contexto_arcopol(self) -> Dict[str, Any]:
        """Genera contexto para caso práctico ARCOPOL"""
        return {
            "empresa": "Clínica Salud Digital",
            "descripcion": "Red de clínicas con historia clínica electrónica",
            "situacion": "Reciben 50+ solicitudes mensuales de pacientes ejerciendo sus derechos",
            "datos_sensibles": {
                "pacientes_activos": 100000,
                "historias_clinicas": 500000,
                "examenes_almacenados": 2000000,
                "años_de_datos": 10
            },
            "tipos_solicitudes": {
                "acceso": "70%",
                "rectificacion": "15%",
                "portabilidad": "10%",
                "otros": "5%"
            },
            "desafios": [
                "Verificar identidad del solicitante",
                "Extraer datos de múltiples sistemas",
                "Cumplir plazos legales",
                "Proteger datos de terceros"
            ]
        }
    
    def _generar_contexto_inventario(self) -> Dict[str, Any]:
        """Genera contexto para caso práctico de inventario"""
        return {
            "empresa": "Universidad TechChile",
            "descripcion": "Universidad con 30,000 estudiantes y 2,000 empleados",
            "sistemas": [
                {"nombre": "Sistema Académico", "datos": ["notas", "asistencia", "datos_personales"]},
                {"nombre": "Biblioteca Digital", "datos": ["prestamos", "multas", "preferencias"]},
                {"nombre": "Portal Empleados", "datos": ["nomina", "evaluaciones", "capacitaciones"]},
                {"nombre": "Plataforma E-learning", "datos": ["cursos", "examenes", "participacion"]},
                {"nombre": "Control Acceso", "datos": ["biometricos", "horarios", "ubicaciones"]}
            ],
            "departamentos": 15,
            "terceros": ["Google Workspace", "Microsoft Azure", "Zoom", "Canvas LMS"],
            "desafios": [
                "Mapear todos los tratamientos",
                "Identificar flujos entre sistemas",
                "Documentar bases legales",
                "Mantener actualizado"
            ]
        }
    
    def _generar_contexto_brechas(self) -> Dict[str, Any]:
        """Genera contexto para caso práctico de brechas"""
        return {
            "empresa": "Banco Digital Chile",
            "descripcion": "Banco 100% digital con 500,000 clientes",
            "incidente": {
                "tipo": "Acceso no autorizado a base de datos",
                "fecha_ocurrencia": "Hace 5 días (viernes noche)",
                "fecha_deteccion": "Hoy lunes 09:00",
                "descripcion": "Un empleado descontento accedió y descargó datos antes de renunciar"
            },
            "datos_comprometidos": {
                "clientes_afectados": 50000,
                "tipos_datos": ["nombres", "rut", "emails", "saldos", "movimientos_6_meses"],
                "datos_sensibles": ["informacion_crediticia", "scoring_interno"]
            },
            "evidencias": {
                "logs_acceso": "Disponibles",
                "queries_ejecutadas": "Identificadas",
                "archivos_descargados": "Lista parcial"
            },
            "contexto_adicional": {
                "empleado_ubicacion": "Desconocida",
                "motivacion": "Posible venta a competencia",
                "medidas_existentes": "2FA activo pero credenciales no revocadas a tiempo"
            }
        }
    
    def _generar_contexto_dpia(self) -> Dict[str, Any]:
        """Genera contexto para caso práctico DPIA"""
        return {
            "empresa": "SmartCity Santiago",
            "descripcion": "Proyecto ciudad inteligente del gobierno",
            "proyecto": {
                "nombre": "Sistema Integrado de Movilidad Urbana",
                "objetivo": "Optimizar tráfico y transporte público con IA",
                "tecnologias": ["Cámaras con reconocimiento facial", "Sensores IoT", "Big Data", "Machine Learning"]
            },
            "datos_procesados": {
                "camaras": 500,
                "personas_dia": 1000000,
                "vehiculos_monitoreados": 500000,
                "datos_biometricos": True,
                "geolocalizacion": True
            },
            "actores": {
                "responsable": "Municipalidad de Santiago",
                "encargados": ["Empresa TechIA", "CloudProvider Internacional"],
                "beneficiarios": ["Ciudadanos", "Carabineros", "Bomberos", "Ambulancias"]
            },
            "preocupaciones": [
                "Vigilancia masiva",
                "Perfilado de ciudadanos",
                "Retención indefinida",
                "Acceso de seguridad"
            ]
        }
    
    def _generar_contexto_transferencias(self) -> Dict[str, Any]:
        """Genera contexto para caso práctico transferencias"""
        return {
            "empresa": "Exportadora AgroChile",
            "descripcion": "Exportador de frutas con clientes globales",
            "operaciones": {
                "paises_destino": ["USA", "China", "Japón", "Alemania", "UK", "Brasil"],
                "clientes_internacionales": 200,
                "volumen_anual": "USD 50M"
            },
            "datos_transferidos": {
                "clientes": ["contactos", "preferencias", "historial_pedidos"],
                "proveedores": ["certificaciones", "auditorias", "contratos"],
                "empleados": ["capacitaciones_internacionales", "visas", "viajes"],
                "logistica": ["tracking", "documentos_aduaneros", "facturas"]
            },
            "sistemas": {
                "erp": "SAP en Alemania",
                "crm": "Salesforce en USA",
                "logistica": "Sistema propio en Chile",
                "email": "Google Workspace"
            },
            "desafios": [
                "China sin nivel de adecuación",
                "GDPR para clientes EU",
                "Diferentes requisitos por país",
                "Proveedores que exigen acceso"
            ]
        }
    
    def _generar_contexto_auditoria(self) -> Dict[str, Any]:
        """Genera contexto para caso práctico auditoría"""
        return {
            "empresa": "Grupo Retail Chile",
            "descripcion": "50 tiendas físicas + e-commerce",
            "estructura": {
                "empleados": 5000,
                "clientes_club": 2000000,
                "transacciones_dia": 100000,
                "sistemas": 25
            },
            "historial": {
                "incidentes_ultimo_año": 3,
                "solicitudes_arcopol": 450,
                "reclamos_clientes": 50,
                "multas": 0
            },
            "areas_criticas": [
                "Marketing usa datos sin validar consentimientos",
                "No hay inventario actualizado",
                "Múltiples sistemas sin integración",
                "Capacitación deficiente del personal"
            ],
            "recursos_auditoria": {
                "equipo_interno": 2,
                "presupuesto": "USD 50,000",
                "plazo": "6 meses",
                "apoyo_externo": "Permitido"
            }
        }
    
    def _generar_tareas_caso(self, modulo_codigo: str) -> List[Dict[str, str]]:
        """Genera lista de tareas para el caso práctico"""
        tareas_por_modulo = {
            "MOD-1": [
                {"id": "1", "tarea": "Analizar base de datos actual y categorizar clientes", "peso": 15},
                {"id": "2", "tarea": "Diseñar estrategia de obtención de consentimiento retroactivo", "peso": 20},
                {"id": "3", "tarea": "Crear formularios de consentimiento para web y email", "peso": 20},
                {"id": "4", "tarea": "Implementar sistema de gestión de preferencias", "peso": 25},
                {"id": "5", "tarea": "Diseñar proceso de revocación y prueba del sistema", "peso": 20}
            ],
            "MOD-2": [
                {"id": "1", "tarea": "Diseñar proceso de verificación de identidad", "peso": 20},
                {"id": "2", "tarea": "Crear formularios para cada tipo de derecho ARCOPOL", "peso": 15},
                {"id": "3", "tarea": "Establecer flujo de trabajo interno con plazos", "peso": 25},
                {"id": "4", "tarea": "Implementar sistema de extracción de datos", "peso": 25},
                {"id": "5", "tarea": "Crear plantillas de respuesta y comunicación", "peso": 15}
            ],
            "MOD-3": [
                {"id": "1", "tarea": "Identificar todos los sistemas que procesan datos", "peso": 20},
                {"id": "2", "tarea": "Mapear flujos de datos entre sistemas", "peso": 25},
                {"id": "3", "tarea": "Documentar bases legales para cada tratamiento", "peso": 20},
                {"id": "4", "tarea": "Clasificar datos por sensibilidad y criticidad", "peso": 20},
                {"id": "5", "tarea": "Crear registro consolidado y plan de actualización", "peso": 15}
            ],
            "MOD-4": [
                {"id": "1", "tarea": "Evaluar alcance e impacto de la brecha", "peso": 25},
                {"id": "2", "tarea": "Implementar medidas de contención inmediatas", "peso": 20},
                {"id": "3", "tarea": "Preparar notificación a la autoridad (APDN)", "peso": 20},
                {"id": "4", "tarea": "Diseñar comunicación a afectados", "peso": 20},
                {"id": "5", "tarea": "Crear plan de remediación y prevención", "peso": 15}
            ],
            "MOD-5": [
                {"id": "1", "tarea": "Describir el proyecto y justificar necesidad de DPIA", "peso": 15},
                {"id": "2", "tarea": "Identificar y evaluar riesgos para los derechos", "peso": 30},
                {"id": "3", "tarea": "Consultar con partes interesadas", "peso": 15},
                {"id": "4", "tarea": "Diseñar medidas de mitigación", "peso": 25},
                {"id": "5", "tarea": "Elaborar informe final con recomendaciones", "peso": 15}
            ],
            "MOD-6": [
                {"id": "1", "tarea": "Evaluar nivel de protección de cada país", "peso": 20},
                {"id": "2", "tarea": "Identificar garantías necesarias por país", "peso": 25},
                {"id": "3", "tarea": "Redactar cláusulas contractuales tipo", "peso": 25},
                {"id": "4", "tarea": "Crear registro de transferencias", "peso": 15},
                {"id": "5", "tarea": "Diseñar proceso de monitoreo continuo", "peso": 15}
            ],
            "MOD-7": [
                {"id": "1", "tarea": "Realizar diagnóstico inicial de cumplimiento", "peso": 25},
                {"id": "2", "tarea": "Diseñar programa de cumplimiento integral", "peso": 20},
                {"id": "3", "tarea": "Crear plan de auditoría anual", "peso": 20},
                {"id": "4", "tarea": "Definir KPIs y sistema de monitoreo", "peso": 20},
                {"id": "5", "tarea": "Elaborar plan de capacitación para personal", "peso": 15}
            ]
        }
        
        return tareas_por_modulo.get(modulo_codigo, [])
    
    def _generar_criterios_evaluacion(self, modulo_codigo: str) -> List[str]:
        """Genera criterios de evaluación para el caso práctico"""
        criterios_base = [
            "Comprensión correcta de requisitos legales",
            "Solución técnicamente viable",
            "Consideración de recursos disponibles",
            "Documentación clara y completa",
            "Cumplimiento de plazos legales"
        ]
        
        criterios_especificos = {
            "MOD-1": ["Facilidad de uso para titulares", "Trazabilidad de consentimientos"],
            "MOD-2": ["Respuesta en plazos legales", "Protección de datos de terceros"],
            "MOD-3": ["Completitud del inventario", "Identificación de riesgos"],
            "MOD-4": ["Rapidez de respuesta", "Minimización de impacto"],
            "MOD-5": ["Profundidad del análisis", "Proporcionalidad de medidas"],
            "MOD-6": ["Validez legal de garantías", "Cobertura de todos los flujos"],
            "MOD-7": ["Medición objetiva", "Plan de mejora continua"]
        }
        
        return criterios_base + criterios_especificos.get(modulo_codigo, [])
    
    def _generar_entregables(self, modulo_codigo: str) -> List[Dict[str, str]]:
        """Define entregables esperados del caso práctico"""
        entregables_por_modulo = {
            "MOD-1": [
                {"nombre": "Formulario de consentimiento", "formato": "HTML/Word"},
                {"nombre": "Diagrama de flujo del proceso", "formato": "PDF/Visio"},
                {"nombre": "Base de datos de consentimientos", "formato": "SQL/Excel"},
                {"nombre": "Manual de procedimientos", "formato": "Word/PDF"}
            ],
            "MOD-2": [
                {"nombre": "Formularios ARCOPOL", "formato": "Word/HTML"},
                {"nombre": "Procedimiento interno", "formato": "Word/PDF"},
                {"nombre": "Sistema de tracking", "formato": "Excel/App"},
                {"nombre": "Plantillas de respuesta", "formato": "Word"}
            ],
            "MOD-3": [
                {"nombre": "Inventario completo", "formato": "Excel"},
                {"nombre": "Mapa de flujos de datos", "formato": "Visio/PDF"},
                {"nombre": "Análisis de riesgos", "formato": "Excel/Word"},
                {"nombre": "Plan de actualización", "formato": "Word"}
            ],
            "MOD-4": [
                {"nombre": "Informe de evaluación", "formato": "Word"},
                {"nombre": "Notificación autoridad", "formato": "Word"},
                {"nombre": "Comunicación afectados", "formato": "Word/Email"},
                {"nombre": "Plan de acción", "formato": "Project/Excel"}
            ],
            "MOD-5": [
                {"nombre": "Informe DPIA completo", "formato": "Word/PDF"},
                {"nombre": "Matriz de riesgos", "formato": "Excel"},
                {"nombre": "Plan de mitigación", "formato": "Word"},
                {"nombre": "Resumen ejecutivo", "formato": "PowerPoint"}
            ],
            "MOD-6": [
                {"nombre": "Evaluación de países", "formato": "Excel"},
                {"nombre": "Contratos con cláusulas", "formato": "Word"},
                {"nombre": "Registro de transferencias", "formato": "Excel"},
                {"nombre": "Procedimiento de control", "formato": "Word"}
            ],
            "MOD-7": [
                {"nombre": "Informe de diagnóstico", "formato": "Word/PDF"},
                {"nombre": "Programa de cumplimiento", "formato": "Word"},
                {"nombre": "Dashboard de KPIs", "formato": "Excel/PowerBI"},
                {"nombre": "Plan de auditoría", "formato": "Excel/Project"}
            ]
        }
        
        return entregables_por_modulo.get(modulo_codigo, [])