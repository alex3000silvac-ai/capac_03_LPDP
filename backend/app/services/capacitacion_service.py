"""
Servicio principal de capacitación sobre Ley 21.719
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
import json
import uuid

from app.models import (
    User,
    Empresa,
    ModuloAcceso,
    ProgresoCapacitacion,
    SesionEntrevista,
    RespuestaEntrevista
)


class CapacitacionService:
    """
    Servicio central para la capacitación sobre la Ley 21.719
    Este es el corazón del sistema educativo
    """
    
    # Departamentos objetivo para cada módulo
    DEPARTAMENTOS_TARGET = {
        "RRHH": "Recursos Humanos",
        "MKT": "Marketing",
        "BIEN": "Bienestar",
        "TI": "Tecnología",
        "LEGAL": "Legal",
        "VTA": "Ventas",
        "SERV": "Servicio al Cliente",
        "FIN": "Finanzas",
        "OPS": "Operaciones",
        "ADM": "Administración"
    }

    MODULOS_CAPACITACION = {
        "MOD-1": {
            "nombre": "Gestión de Consentimientos",
            "descripcion": "Aprende a implementar un sistema de consentimientos según el Art. 12 de la Ley 21.719",
            "duracion_estimada": 180,  # minutos
            "departamentos_objetivo": ["RRHH", "MKT", "VTA", "SERV", "LEGAL"],
            "capitulos": [
                {
                    "id": "CAP-1.1",
                    "titulo": "Fundamentos del Consentimiento",
                    "duracion": 30,
                    "departamentos": ["ALL"],
                    "lecciones": [
                        {
                            "id": "1.1.1",
                            "titulo": "¿Qué es el consentimiento según Ley 21.719?",
                            "contenido": "Definición legal y características del consentimiento válido",
                            "duracion": 15,
                            "tipo": "teoria"
                        },
                        {
                            "id": "1.1.2", 
                            "titulo": "Cuándo es obligatorio el consentimiento",
                            "contenido": "Casos en que se requiere consentimiento vs otras bases legales",
                            "duracion": 15,
                            "tipo": "casos"
                        }
                    ]
                },
                {
                    "id": "CAP-1.2",
                    "titulo": "Consentimiento en Marketing",
                    "duracion": 45,
                    "departamentos": ["MKT", "VTA"],
                    "lecciones": [
                        {
                            "id": "1.2.1",
                            "titulo": "Bases de datos de marketing",
                            "contenido": "Cómo obtener y gestionar consentimiento para campañas",
                            "duracion": 20,
                            "tipo": "practica",
                            "acciones_concretas": [
                                "Revisar formularios de suscripción actuales",
                                "Implementar doble opt-in en newsletters",
                                "Crear preferencias granulares de comunicación",
                                "Documentar origen de cada contacto"
                            ]
                        },
                        {
                            "id": "1.2.2",
                            "titulo": "Revocación y preferencias",
                            "contenido": "Permitir que clientes cambien sus preferencias fácilmente",
                            "duracion": 25,
                            "tipo": "implementacion",
                            "herramientas": ["Centro de preferencias web", "Link unsubscribe", "Portal cliente"]
                        }
                    ]
                },
                {
                    "id": "CAP-1.3", 
                    "titulo": "Consentimiento Laboral (RRHH)",
                    "duracion": 45,
                    "departamentos": ["RRHH"],
                    "lecciones": [
                        {
                            "id": "1.3.1",
                            "titulo": "Datos de empleados y postulantes",
                            "contenido": "Consentimiento vs interés legítimo en relaciones laborales",
                            "duracion": 25,
                            "tipo": "casos",
                            "acciones_concretas": [
                                "Revisar formularios de postulación",
                                "Actualizar contratos laborales con cláusulas de datos",
                                "Implementar consentimiento para fotos corporativas",
                                "Gestionar datos biométricos (huella, facial)"
                            ]
                        },
                        {
                            "id": "1.3.2",
                            "titulo": "Comunicaciones internas y beneficios",
                            "contenido": "Consentimiento para comunicaciones no esenciales",
                            "duracion": 20,
                            "tipo": "practica",
                            "herramientas": ["Formulario beneficios", "Opt-in comunicaciones"]
                        }
                    ]
                },
                {
                    "id": "CAP-1.4",
                    "titulo": "Consentimiento en Ventas y Atención",
                    "duracion": 35,
                    "departamentos": ["VTA", "SERV"],
                    "lecciones": [
                        {
                            "id": "1.4.1",
                            "titulo": "Prospección comercial",
                            "contenido": "Consentimiento para contacto comercial",
                            "duracion": 20,
                            "tipo": "practica",
                            "acciones_concretas": [
                                "Scripts de llamadas con consentimiento",
                                "Formularios web con finalidad clara",
                                "Registro de fuente de contactos",
                                "Timeouts para recontacto"
                            ]
                        },
                        {
                            "id": "1.4.2",
                            "titulo": "Grabación de llamadas y chats",
                            "contenido": "Aviso y consentimiento para grabaciones",
                            "duracion": 15,
                            "tipo": "implementacion"
                        }
                    ]
                },
                {
                    "id": "CAP-1.5",
                    "titulo": "Caso Práctico Integrado",
                    "duracion": 25,
                    "departamentos": ["ALL"],
                    "lecciones": [
                        {
                            "id": "1.5.1",
                            "titulo": "Implementación empresa multi-departamental",
                            "contenido": "Cada departamento implementa su parte del sistema de consentimientos",
                            "duracion": 25,
                            "tipo": "proyecto",
                            "entregables": [
                                "RRHH: Formularios laborales actualizados",
                                "MKT: Sistema opt-in/opt-out",
                                "VTA: Scripts y formularios comerciales",
                                "SERV: Proceso grabación llamadas",
                                "LEGAL: Política de privacidad actualizada"
                            ]
                        }
                    ]
                }
            ],
            "evaluacion": {
                "preguntas": 20,
                "tiempo_limite": 30,
                "aprobacion": 70  # porcentaje
            }
        },
        "MOD-2": {
            "nombre": "Derechos ARCOPOL",
            "descripcion": "Comprende y gestiona los derechos de los titulares de datos",
            "duracion_estimada": 150,
            "lecciones": [
                {
                    "id": "2.1",
                    "titulo": "¿Qué son los derechos ARCOPOL?",
                    "contenido": "Acceso, Rectificación, Cancelación, Oposición, Portabilidad y Limitación",
                    "duracion": 20
                },
                {
                    "id": "2.2",
                    "titulo": "Marco legal y plazos",
                    "contenido": "Obligaciones y plazos según la Ley 21.719",
                    "duracion": 25
                },
                {
                    "id": "2.3",
                    "titulo": "Procedimientos de atención",
                    "contenido": "Cómo recibir y procesar solicitudes",
                    "duracion": 30
                },
                {
                    "id": "2.4",
                    "titulo": "Herramientas y plantillas",
                    "contenido": "Formularios y respuestas tipo",
                    "duracion": 25
                },
                {
                    "id": "2.5",
                    "titulo": "Taller práctico",
                    "contenido": "Resuelve casos reales de solicitudes ARCOPOL",
                    "duracion": 50
                }
            ],
            "evaluacion": {
                "preguntas": 25,
                "tiempo_limite": 40,
                "aprobacion": 75
            }
        },
        "MOD-3": {
            "nombre": "Inventario de Datos",
            "descripcion": "Crea y mantén un registro completo de actividades de tratamiento",
            "duracion_estimada": 180,
            "lecciones": [
                {
                    "id": "3.1",
                    "titulo": "¿Por qué un inventario?",
                    "contenido": "Importancia y obligatoriedad del registro",
                    "duracion": 15
                },
                {
                    "id": "3.2",
                    "titulo": "Elementos del inventario",
                    "contenido": "Qué información debe contener",
                    "duracion": 30
                },
                {
                    "id": "3.3",
                    "titulo": "Mapeo de datos",
                    "contenido": "Técnicas para identificar todos los tratamientos",
                    "duracion": 40
                },
                {
                    "id": "3.4",
                    "titulo": "Documentación y actualización",
                    "contenido": "Mantener el inventario al día",
                    "duracion": 35
                },
                {
                    "id": "3.5",
                    "titulo": "Proyecto: Tu primer inventario",
                    "contenido": "Crea un inventario completo paso a paso",
                    "duracion": 60
                }
            ],
            "evaluacion": {
                "preguntas": 30,
                "tiempo_limite": 45,
                "aprobacion": 70
            }
        },
        "MOD-4": {
            "nombre": "Gestión de Brechas",
            "descripcion": "Aprende a prevenir, detectar y gestionar brechas de seguridad",
            "duracion_estimada": 120,
            "lecciones": [
                {
                    "id": "4.1",
                    "titulo": "¿Qué es una brecha?",
                    "contenido": "Tipos de brechas y su impacto",
                    "duracion": 20
                },
                {
                    "id": "4.2",
                    "titulo": "Detección y evaluación",
                    "contenido": "Cómo identificar y evaluar la gravedad",
                    "duracion": 25
                },
                {
                    "id": "4.3",
                    "titulo": "Notificación obligatoria",
                    "contenido": "Cuándo y cómo notificar a la autoridad",
                    "duracion": 30
                },
                {
                    "id": "4.4",
                    "titulo": "Plan de respuesta",
                    "contenido": "Protocolo de acción ante brechas",
                    "duracion": 25
                },
                {
                    "id": "4.5",
                    "titulo": "Simulacro de brecha",
                    "contenido": "Practica con un caso real",
                    "duracion": 20
                }
            ],
            "evaluacion": {
                "preguntas": 20,
                "tiempo_limite": 30,
                "aprobacion": 80
            }
        },
        "MOD-5": {
            "nombre": "Evaluaciones de Impacto (DPIA)",
            "descripcion": "Realiza evaluaciones de impacto en la privacidad",
            "duracion_estimada": 150,
            "lecciones": [
                {
                    "id": "5.1",
                    "titulo": "Fundamentos de DPIA",
                    "contenido": "Qué es y cuándo es obligatoria",
                    "duracion": 20
                },
                {
                    "id": "5.2",
                    "titulo": "Metodología paso a paso",
                    "contenido": "Cómo realizar una DPIA completa",
                    "duracion": 40
                },
                {
                    "id": "5.3",
                    "titulo": "Identificación de riesgos",
                    "contenido": "Técnicas de análisis de riesgos",
                    "duracion": 30
                },
                {
                    "id": "5.4",
                    "titulo": "Medidas de mitigación",
                    "contenido": "Diseñar controles efectivos",
                    "duracion": 30
                },
                {
                    "id": "5.5",
                    "titulo": "Caso completo de DPIA",
                    "contenido": "Desarrolla una DPIA de principio a fin",
                    "duracion": 30
                }
            ],
            "evaluacion": {
                "preguntas": 25,
                "tiempo_limite": 40,
                "aprobacion": 75
            }
        },
        "MOD-6": {
            "nombre": "Transferencias Internacionales",
            "descripcion": "Gestiona transferencias de datos fuera de Chile",
            "duracion_estimada": 90,
            "lecciones": [
                {
                    "id": "6.1",
                    "titulo": "Marco legal internacional",
                    "contenido": "Regulaciones y países con nivel adecuado",
                    "duracion": 20
                },
                {
                    "id": "6.2",
                    "titulo": "Garantías adecuadas",
                    "contenido": "Cláusulas tipo y BCR",
                    "duracion": 25
                },
                {
                    "id": "6.3",
                    "titulo": "Evaluación de terceros países",
                    "contenido": "Cómo evaluar el nivel de protección",
                    "duracion": 20
                },
                {
                    "id": "6.4",
                    "titulo": "Documentación requerida",
                    "contenido": "Contratos y registros necesarios",
                    "duracion": 25
                }
            ],
            "evaluacion": {
                "preguntas": 15,
                "tiempo_limite": 25,
                "aprobacion": 70
            }
        },
        "MOD-7": {
            "nombre": "Auditoría y Cumplimiento",
            "descripcion": "Implementa un sistema de auditoría y mejora continua",
            "duracion_estimada": 120,
            "lecciones": [
                {
                    "id": "7.1",
                    "titulo": "Programa de cumplimiento",
                    "contenido": "Elementos de un programa efectivo",
                    "duracion": 25
                },
                {
                    "id": "7.2",
                    "titulo": "Auditorías internas",
                    "contenido": "Planificación y ejecución",
                    "duracion": 30
                },
                {
                    "id": "7.3",
                    "titulo": "Métricas e indicadores",
                    "contenido": "KPIs de protección de datos",
                    "duracion": 25
                },
                {
                    "id": "7.4",
                    "titulo": "Mejora continua",
                    "contenido": "Ciclo PDCA aplicado a privacidad",
                    "duracion": 20
                },
                {
                    "id": "7.5",
                    "titulo": "Plan de auditoría anual",
                    "contenido": "Diseña tu plan de auditoría",
                    "duracion": 20
                }
            ],
            "evaluacion": {
                "preguntas": 20,
                "tiempo_limite": 30,
                "aprobacion": 75
            }
        }
    }
    
    def get_modulos_disponibles(
        self,
        db: Session,
        empresa_id: str
    ) -> List[Dict[str, Any]]:
        """Obtiene los módulos de capacitación disponibles para una empresa"""
        
        # Obtener módulos contratados
        modulos_acceso = db.query(ModuloAcceso).filter(
            and_(
                ModuloAcceso.empresa_id == empresa_id,
                ModuloAcceso.activo == True
            )
        ).all()
        
        modulos_disponibles = []
        
        for acceso in modulos_acceso:
            if acceso.modulo_codigo in self.MODULOS_CAPACITACION:
                modulo_info = self.MODULOS_CAPACITACION[acceso.modulo_codigo].copy()
                
                # Agregar información de progreso
                progreso = self._calcular_progreso_modulo(
                    db, empresa_id, acceso.modulo_codigo
                )
                
                modulo_info.update({
                    "codigo": acceso.modulo_codigo,
                    "acceso_desde": acceso.fecha_activacion.isoformat(),
                    "acceso_hasta": acceso.fecha_expiracion.isoformat() if acceso.fecha_expiracion else None,
                    "progreso": progreso
                })
                
                modulos_disponibles.append(modulo_info)
        
        return modulos_disponibles
    
    def _calcular_progreso_modulo(
        self,
        db: Session,
        empresa_id: str,
        modulo_codigo: str
    ) -> Dict[str, Any]:
        """Calcula el progreso de una empresa en un módulo"""
        
        # Obtener todos los usuarios de la empresa
        usuarios = db.query(User).filter(
            User.tenant_id == empresa_id
        ).all()
        
        if not usuarios:
            return {
                "usuarios_totales": 0,
                "usuarios_iniciados": 0,
                "usuarios_completados": 0,
                "porcentaje_completado": 0,
                "lecciones_completadas": 0,
                "evaluaciones_aprobadas": 0
            }
        
        usuarios_iniciados = 0
        usuarios_completados = 0
        lecciones_completadas = 0
        evaluaciones_aprobadas = 0
        
        for usuario in usuarios:
            progreso = db.query(ProgresoCapacitacion).filter(
                and_(
                    ProgresoCapacitacion.usuario_id == usuario.id,
                    ProgresoCapacitacion.modulo_codigo == modulo_codigo
                )
            ).first()
            
            if progreso:
                usuarios_iniciados += 1
                
                if progreso.completado:
                    usuarios_completados += 1
                
                lecciones_completadas += len(progreso.lecciones_completadas or [])
                
                if progreso.evaluacion_aprobada:
                    evaluaciones_aprobadas += 1
        
        total_lecciones = len(self.MODULOS_CAPACITACION[modulo_codigo]["lecciones"])
        
        return {
            "usuarios_totales": len(usuarios),
            "usuarios_iniciados": usuarios_iniciados,
            "usuarios_completados": usuarios_completados,
            "porcentaje_completado": (usuarios_completados / len(usuarios) * 100) if usuarios else 0,
            "lecciones_completadas": lecciones_completadas,
            "total_lecciones": total_lecciones * len(usuarios),
            "evaluaciones_aprobadas": evaluaciones_aprobadas
        }
    
    def iniciar_modulo(
        self,
        db: Session,
        usuario_id: str,
        modulo_codigo: str
    ) -> ProgresoCapacitacion:
        """Inicia o retoma el progreso de un usuario en un módulo"""
        
        # Verificar acceso
        usuario = db.query(User).filter(User.id == usuario_id).first()
        if not usuario:
            raise ValueError("Usuario no encontrado")
        
        # Verificar que la empresa tenga acceso al módulo
        tiene_acceso = db.query(ModuloAcceso).filter(
            and_(
                ModuloAcceso.empresa_id == usuario.tenant_id,
                ModuloAcceso.modulo_codigo == modulo_codigo,
                ModuloAcceso.activo == True
            )
        ).first()
        
        if not tiene_acceso:
            raise ValueError("No tiene acceso a este módulo")
        
        # Buscar progreso existente
        progreso = db.query(ProgresoCapacitacion).filter(
            and_(
                ProgresoCapacitacion.usuario_id == usuario_id,
                ProgresoCapacitacion.modulo_codigo == modulo_codigo
            )
        ).first()
        
        if not progreso:
            # Crear nuevo progreso
            progreso = ProgresoCapacitacion(
                usuario_id=usuario_id,
                modulo_codigo=modulo_codigo,
                fecha_inicio=datetime.utcnow(),
                porcentaje_completado=0,
                tiempo_total_minutos=0,
                lecciones_completadas=[],
                ultima_leccion="1.1",  # Primera lección
                completado=False,
                metadata={
                    "dispositivo": "web",
                    "version_contenido": "1.0"
                }
            )
            db.add(progreso)
        
        # Actualizar última actividad
        progreso.ultima_actividad = datetime.utcnow()
        
        db.commit()
        db.refresh(progreso)
        
        return progreso
    
    def completar_leccion(
        self,
        db: Session,
        usuario_id: str,
        modulo_codigo: str,
        leccion_id: str,
        tiempo_minutos: int,
        respuestas_ejercicios: Optional[Dict[str, Any]] = None
    ) -> ProgresoCapacitacion:
        """Marca una lección como completada"""
        
        progreso = db.query(ProgresoCapacitacion).filter(
            and_(
                ProgresoCapacitacion.usuario_id == usuario_id,
                ProgresoCapacitacion.modulo_codigo == modulo_codigo
            )
        ).first()
        
        if not progreso:
            raise ValueError("Debe iniciar el módulo primero")
        
        # Agregar lección completada si no está
        lecciones_completadas = progreso.lecciones_completadas or []
        if leccion_id not in lecciones_completadas:
            lecciones_completadas.append(leccion_id)
            progreso.lecciones_completadas = lecciones_completadas
        
        # Actualizar tiempo
        progreso.tiempo_total_minutos += tiempo_minutos
        
        # Actualizar última lección
        progreso.ultima_leccion = leccion_id
        progreso.ultima_actividad = datetime.utcnow()
        
        # Guardar respuestas de ejercicios si las hay
        if respuestas_ejercicios:
            if not progreso.respuestas_ejercicios:
                progreso.respuestas_ejercicios = {}
            progreso.respuestas_ejercicios[leccion_id] = respuestas_ejercicios
        
        # Calcular porcentaje
        total_lecciones = len(self.MODULOS_CAPACITACION[modulo_codigo]["lecciones"])
        progreso.porcentaje_completado = (len(lecciones_completadas) / total_lecciones) * 100
        
        # Verificar si completó todas las lecciones
        if len(lecciones_completadas) == total_lecciones and not progreso.evaluacion_iniciada:
            progreso.lecciones_terminadas = True
            progreso.fecha_lecciones_completadas = datetime.utcnow()
        
        db.commit()
        db.refresh(progreso)
        
        return progreso
    
    def iniciar_evaluacion(
        self,
        db: Session,
        usuario_id: str,
        modulo_codigo: str
    ) -> Dict[str, Any]:
        """Inicia la evaluación de un módulo"""
        
        progreso = db.query(ProgresoCapacitacion).filter(
            and_(
                ProgresoCapacitacion.usuario_id == usuario_id,
                ProgresoCapacitacion.modulo_codigo == modulo_codigo
            )
        ).first()
        
        if not progreso:
            raise ValueError("Debe completar el módulo primero")
        
        if not progreso.lecciones_terminadas:
            raise ValueError("Debe completar todas las lecciones primero")
        
        # Marcar evaluación iniciada
        progreso.evaluacion_iniciada = True
        progreso.evaluacion_fecha_inicio = datetime.utcnow()
        progreso.evaluacion_intentos = (progreso.evaluacion_intentos or 0) + 1
        
        db.commit()
        
        # Generar preguntas de evaluación
        evaluacion_config = self.MODULOS_CAPACITACION[modulo_codigo]["evaluacion"]
        
        return {
            "modulo": modulo_codigo,
            "intento": progreso.evaluacion_intentos,
            "tiempo_limite": evaluacion_config["tiempo_limite"],
            "numero_preguntas": evaluacion_config["preguntas"],
            "puntaje_aprobacion": evaluacion_config["aprobacion"],
            "inicio": datetime.utcnow().isoformat()
        }
    
    def entregar_evaluacion(
        self,
        db: Session,
        usuario_id: str,
        modulo_codigo: str,
        respuestas: Dict[str, Any],
        tiempo_empleado: int
    ) -> Dict[str, Any]:
        """Procesa las respuestas de una evaluación"""
        
        progreso = db.query(ProgresoCapacitacion).filter(
            and_(
                ProgresoCapacitacion.usuario_id == usuario_id,
                ProgresoCapacitacion.modulo_codigo == modulo_codigo
            )
        ).first()
        
        if not progreso or not progreso.evaluacion_iniciada:
            raise ValueError("No hay evaluación en curso")
        
        # Calcular puntaje (simulado para demo)
        # En producción, esto compararía con respuestas correctas
        import random
        puntaje = random.randint(65, 95)
        
        evaluacion_config = self.MODULOS_CAPACITACION[modulo_codigo]["evaluacion"]
        aprobado = puntaje >= evaluacion_config["aprobacion"]
        
        # Actualizar progreso
        progreso.evaluacion_puntaje = puntaje
        progreso.evaluacion_aprobada = aprobado
        progreso.evaluacion_fecha_completada = datetime.utcnow()
        progreso.evaluacion_tiempo_minutos = tiempo_empleado
        
        if aprobado:
            progreso.completado = True
            progreso.fecha_completado = datetime.utcnow()
            
            # Generar certificado
            progreso.certificado_id = str(uuid.uuid4())
            progreso.certificado_fecha = datetime.utcnow()
        
        db.commit()
        
        return {
            "aprobado": aprobado,
            "puntaje": puntaje,
            "puntaje_requerido": evaluacion_config["aprobacion"],
            "certificado_id": progreso.certificado_id if aprobado else None,
            "puede_reintentar": not aprobado and progreso.evaluacion_intentos < 3
        }
    
    def generar_certificado(
        self,
        db: Session,
        usuario_id: str,
        modulo_codigo: str
    ) -> Dict[str, Any]:
        """Genera información del certificado de completación"""
        
        progreso = db.query(ProgresoCapacitacion).filter(
            and_(
                ProgresoCapacitacion.usuario_id == usuario_id,
                ProgresoCapacitacion.modulo_codigo == modulo_codigo,
                ProgresoCapacitacion.completado == True
            )
        ).first()
        
        if not progreso or not progreso.certificado_id:
            raise ValueError("No hay certificado disponible")
        
        usuario = db.query(User).filter(User.id == usuario_id).first()
        modulo_info = self.MODULOS_CAPACITACION[modulo_codigo]
        
        return {
            "certificado_id": progreso.certificado_id,
            "usuario": {
                "nombre": f"{usuario.first_name} {usuario.last_name}",
                "email": usuario.email
            },
            "modulo": {
                "codigo": modulo_codigo,
                "nombre": modulo_info["nombre"],
                "duracion": modulo_info["duracion_estimada"]
            },
            "completado": {
                "fecha": progreso.fecha_completado.isoformat(),
                "puntaje": progreso.evaluacion_puntaje,
                "tiempo_total": progreso.tiempo_total_minutos
            },
            "validez": "Este certificado acredita la completación exitosa del módulo de capacitación"
        }
    
    def get_estadisticas_usuario(
        self,
        db: Session,
        usuario_id: str
    ) -> Dict[str, Any]:
        """Obtiene estadísticas de capacitación de un usuario"""
        
        progresos = db.query(ProgresoCapacitacion).filter(
            ProgresoCapacitacion.usuario_id == usuario_id
        ).all()
        
        modulos_completados = [p for p in progresos if p.completado]
        modulos_en_curso = [p for p in progresos if not p.completado]
        
        tiempo_total = sum(p.tiempo_total_minutos for p in progresos)
        
        # Calcular racha de días consecutivos
        fechas_actividad = sorted(set(
            p.ultima_actividad.date() 
            for p in progresos 
            if p.ultima_actividad
        ))
        
        racha_actual = 0
        if fechas_actividad:
            hoy = datetime.utcnow().date()
            fecha_actual = hoy
            
            for fecha in reversed(fechas_actividad):
                if fecha == fecha_actual:
                    racha_actual += 1
                    fecha_actual = fecha_actual - timedelta(days=1)
                else:
                    break
        
        return {
            "modulos_completados": len(modulos_completados),
            "modulos_en_curso": len(modulos_en_curso),
            "tiempo_total_horas": round(tiempo_total / 60, 1),
            "certificados_obtenidos": len([p for p in modulos_completados if p.certificado_id]),
            "puntaje_promedio": round(
                sum(p.evaluacion_puntaje for p in modulos_completados if p.evaluacion_puntaje) / 
                len(modulos_completados) if modulos_completados else 0,
                1
            ),
            "racha_dias": racha_actual,
            "ultima_actividad": max(
                (p.ultima_actividad for p in progresos if p.ultima_actividad),
                default=None
            )
        }
    
    def get_ranking_empresa(
        self,
        db: Session,
        empresa_id: str
    ) -> List[Dict[str, Any]]:
        """Obtiene el ranking de usuarios de una empresa"""
        
        usuarios = db.query(User).filter(
            User.tenant_id == empresa_id
        ).all()
        
        ranking = []
        
        for usuario in usuarios:
            stats = self.get_estadisticas_usuario(db, usuario.id)
            
            # Calcular puntuación
            puntuacion = (
                stats["modulos_completados"] * 100 +
                stats["puntaje_promedio"] +
                stats["racha_dias"] * 5
            )
            
            ranking.append({
                "usuario_id": usuario.id,
                "nombre": f"{usuario.first_name} {usuario.last_name}",
                "modulos_completados": stats["modulos_completados"],
                "tiempo_total": stats["tiempo_total_horas"],
                "puntaje_promedio": stats["puntaje_promedio"],
                "puntuacion_total": puntuacion
            })
        
        # Ordenar por puntuación
        ranking.sort(key=lambda x: x["puntuacion_total"], reverse=True)
        
        # Agregar posición
        for i, item in enumerate(ranking):
            item["posicion"] = i + 1
        
        return ranking