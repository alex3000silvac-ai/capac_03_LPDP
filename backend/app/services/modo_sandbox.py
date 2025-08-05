"""
Servicio para gestionar el modo sandbox de práctica
Permite a los usuarios practicar sin afectar datos reales
"""
from typing import Dict, List, Any
from uuid import UUID, uuid4
from datetime import datetime
import json

# Datos de ejemplo para el modo sandbox
DATOS_SANDBOX = {
    "organizaciones": [
        {
            "id": "11111111-1111-1111-1111-111111111111",
            "nombre": "Salmones del Pacífico S.A. (Empresa de Práctica)",
            "rut": "99.999.999-9",
            "sector": "Salmonicultura",
            "descripcion": "Esta es una empresa ficticia para practicar el levantamiento de datos"
        }
    ],
    "areas_negocio": {
        "RRHH": {
            "descripcion": "Gestiona 450 empleados en 3 centros de cultivo",
            "jefe_area": "María González (Personaje de práctica)",
            "datos_prellenados": {
                "sistemas": ["Excel de nómina", "Portal de postulación", "Carpeta compartida"],
                "procesos": ["Reclutamiento", "Gestión de nómina", "Capacitación", "Evaluación de desempeño"],
                "proveedores": ["Previred", "Mutual de Seguridad", "Empresa de selección externa"]
            }
        },
        "PRODUCCION": {
            "descripcion": "Monitorea la biomasa y condiciones de cultivo",
            "jefe_area": "Pedro Martínez (Personaje de práctica)",
            "datos_prellenados": {
                "sistemas": ["Software AquaManager", "Sensores IoT", "Planillas de alimentación"],
                "procesos": ["Monitoreo de biomasa", "Control de alimentación", "Registro sanitario"],
                "proveedores": ["Proveedor software noruego", "Laboratorio de análisis"]
            }
        },
        "FINANZAS": {
            "descripcion": "Maneja facturación nacional e internacional",
            "jefe_area": "Ana Rodríguez (Personaje de práctica)",
            "datos_prellenados": {
                "sistemas": ["SAP", "Sistema de facturación electrónica", "Excel de cobranza"],
                "procesos": ["Facturación", "Cobranza", "Pago a proveedores"],
                "proveedores": ["Banco", "Factoring", "SII"]
            }
        }
    },
    "actividades_ejemplo": [
        {
            "codigo": "SAND-RRH-001",
            "nombre": "Proceso de Selección de Buzos Profesionales",
            "area": "RRHH",
            "descripcion": "Actividad compleja que requiere datos sensibles",
            "pistas": {
                "datos_requeridos": ["Certificación de buceo", "Exámenes médicos", "Antecedentes penales"],
                "complejidad": "Alta - involucra datos sensibles de salud",
                "destinatarios": ["DIRECTEMAR", "Mutual", "Empresa certificadora"]
            }
        },
        {
            "codigo": "SAND-PRO-001",
            "nombre": "Monitoreo Sanitario con Geolocalización",
            "area": "PRODUCCION",
            "descripcion": "Sistema IoT que puede vincular datos con operarios",
            "pistas": {
                "datos_requeridos": ["ID del operario en turno", "Ubicación GPS", "Registros de acceso"],
                "complejidad": "Media - datos indirectamente personales",
                "consideracion_especial": "Los datos IoT pueden convertirse en personales"
            }
        }
    ],
    "escenarios_practica": [
        {
            "id": "ESC-001",
            "nombre": "Tu Primera Semana como Asesor",
            "nivel": "Principiante",
            "descripcion": "La empresa te contrató para hacer el levantamiento inicial",
            "objetivos": [
                "Entrevistar al menos 2 áreas",
                "Documentar 5 actividades de tratamiento",
                "Identificar 3 riesgos de cumplimiento"
            ],
            "tiempo_estimado": "2 horas",
            "recompensa": "Certificado: Explorador de Datos Nivel 1"
        },
        {
            "id": "ESC-002",
            "nombre": "Crisis: Fuga de Datos en RRHH",
            "nivel": "Intermedio",
            "descripcion": "Se filtró una planilla con sueldos. Debes hacer el análisis",
            "objetivos": [
                "Identificar qué datos se filtraron",
                "Mapear quién tenía acceso",
                "Proponer medidas correctivas"
            ],
            "elementos_gamificacion": {
                "tiempo_limite": "1 hora para el informe inicial",
                "decisiones_criticas": 3,
                "multiples_finales": true
            }
        }
    ]
}


class SandboxManager:
    """Gestiona las sesiones de práctica en modo sandbox"""
    
    def __init__(self):
        self.sesiones_activas = {}
    
    def crear_sesion_sandbox(self, usuario_id: str, escenario_id: str) -> Dict[str, Any]:
        """Crea una nueva sesión de práctica sandbox"""
        sesion_id = str(uuid4())
        
        escenario = next(
            (e for e in DATOS_SANDBOX["escenarios_practica"] if e["id"] == escenario_id),
            None
        )
        
        if not escenario:
            raise ValueError(f"Escenario {escenario_id} no encontrado")
        
        sesion = {
            "id": sesion_id,
            "usuario_id": usuario_id,
            "escenario": escenario,
            "inicio": datetime.now().isoformat(),
            "estado": "activa",
            "progreso": {
                "objetivos_completados": [],
                "decisiones_tomadas": [],
                "datos_recopilados": {
                    "actividades": [],
                    "sistemas": [],
                    "flujos": []
                }
            },
            "modo": "SANDBOX",
            "mensaje_bienvenida": f"🎮 Modo Práctica: {escenario['nombre']}. Todo lo que hagas aquí es para aprender, no afectará datos reales."
        }
        
        self.sesiones_activas[sesion_id] = sesion
        return sesion
    
    def validar_accion_sandbox(self, sesion_id: str, accion: Dict[str, Any]) -> Dict[str, Any]:
        """Valida una acción en el sandbox y proporciona retroalimentación educativa"""
        sesion = self.sesiones_activas.get(sesion_id)
        if not sesion:
            raise ValueError("Sesión no encontrada")
        
        tipo_accion = accion.get("tipo")
        retroalimentacion = {
            "valida": False,
            "mensaje": "",
            "aprendizaje": "",
            "siguiente_paso": ""
        }
        
        if tipo_accion == "crear_actividad":
            # Validar que la actividad tenga los campos mínimos
            actividad = accion.get("datos", {})
            
            if not actividad.get("nombre_actividad"):
                retroalimentacion["mensaje"] = "⚠️ Toda actividad necesita un nombre descriptivo"
                retroalimentacion["aprendizaje"] = "El nombre debe reflejar QUÉ se hace, no CÓMO"
                retroalimentacion["ejemplo"] = "✅ 'Proceso de Selección' ❌ 'Usar Excel'"
            
            elif not actividad.get("finalidad_principal"):
                retroalimentacion["mensaje"] = "⚠️ Falta la finalidad (el 'para qué')"
                retroalimentacion["aprendizaje"] = "Sin finalidad legítima, el tratamiento sería ilegal"
                retroalimentacion["pregunta_guia"] = "¿Por qué la empresa necesita estos datos?"
            
            elif not actividad.get("base_licitud"):
                retroalimentacion["mensaje"] = "⚠️ Necesitas definir la base legal"
                retroalimentacion["aprendizaje"] = "Toda actividad debe tener una base de licitud"
                retroalimentacion["opciones_comunes"] = [
                    "Consentimiento - El titular autoriza expresamente",
                    "Contrato - Necesario para ejecutar un contrato",
                    "Obligación legal - La ley lo exige"
                ]
            
            else:
                retroalimentacion["valida"] = True
                retroalimentacion["mensaje"] = "✅ ¡Bien hecho! Actividad documentada correctamente"
                retroalimentacion["aprendizaje"] = "Has cubierto los elementos esenciales del RAT"
                retroalimentacion["siguiente_paso"] = "Ahora identifica qué categorías de datos se usan"
                
                # Guardar en progreso
                sesion["progreso"]["datos_recopilados"]["actividades"].append(actividad)
                
                # Verificar si completó objetivo
                if len(sesion["progreso"]["datos_recopilados"]["actividades"]) >= 5:
                    sesion["progreso"]["objetivos_completados"].append("documentar_5_actividades")
                    retroalimentacion["logro"] = "🏆 ¡Objetivo completado: 5 actividades documentadas!"
        
        elif tipo_accion == "responder_entrevista":
            pregunta = accion.get("pregunta")
            respuesta = accion.get("respuesta")
            
            # Análisis pedagógico de la respuesta
            if "base de datos" in respuesta.lower() and pregunta == "actividades_principales":
                retroalimentacion["mensaje"] = "🤔 Recuerda: pregunta por actividades, no por sistemas"
                retroalimentacion["aprendizaje"] = "Las personas entienden mejor sus procesos que sus sistemas"
                retroalimentacion["mejor_pregunta"] = "¿Qué hacen en su día a día con información de personas?"
            else:
                retroalimentacion["valida"] = True
                retroalimentacion["mensaje"] = "👍 Buena pregunta, estás en el camino correcto"
        
        return retroalimentacion
    
    def generar_reporte_aprendizaje(self, sesion_id: str) -> Dict[str, Any]:
        """Genera un reporte de lo aprendido en la sesión sandbox"""
        sesion = self.sesiones_activas.get(sesion_id)
        if not sesion:
            raise ValueError("Sesión no encontrada")
        
        progreso = sesion["progreso"]
        duracion = (datetime.now() - datetime.fromisoformat(sesion["inicio"])).seconds // 60
        
        # Calcular métricas de aprendizaje
        actividades_completas = len([
            a for a in progreso["datos_recopilados"]["actividades"]
            if all(a.get(campo) for campo in ["nombre_actividad", "finalidad_principal", "base_licitud"])
        ])
        
        reporte = {
            "duracion_minutos": duracion,
            "escenario_completado": sesion["escenario"]["nombre"],
            "metricas": {
                "actividades_documentadas": len(progreso["datos_recopilados"]["actividades"]),
                "actividades_completas": actividades_completas,
                "objetivos_logrados": len(progreso["objetivos_completados"]),
                "decisiones_tomadas": len(progreso["decisiones_tomadas"])
            },
            "competencias_practicadas": [
                {
                    "competencia": "Identificación de actividades de tratamiento",
                    "nivel": "Básico" if actividades_completas < 3 else "Intermedio",
                    "evidencia": f"Documentaste {actividades_completas} actividades correctamente"
                },
                {
                    "competencia": "Aplicación de bases de licitud",
                    "nivel": self._evaluar_nivel_licitud(progreso),
                    "evidencia": "Identificaste bases legales apropiadas para cada actividad"
                }
            ],
            "areas_mejorar": self._identificar_areas_mejora(progreso),
            "siguiente_desafio_recomendado": self._recomendar_siguiente(progreso)
        }
        
        return reporte
    
    def _evaluar_nivel_licitud(self, progreso: Dict) -> str:
        """Evalúa el nivel de comprensión de bases de licitud"""
        bases_usadas = set()
        for act in progreso["datos_recopilados"]["actividades"]:
            if act.get("base_licitud"):
                bases_usadas.add(act["base_licitud"])
        
        if len(bases_usadas) >= 3:
            return "Avanzado"
        elif len(bases_usadas) >= 2:
            return "Intermedio"
        else:
            return "Básico"
    
    def _identificar_areas_mejora(self, progreso: Dict) -> List[str]:
        """Identifica áreas donde el usuario necesita más práctica"""
        areas = []
        
        # Verificar si identifica datos sensibles
        datos_sensibles_identificados = any(
            "sensible" in str(act.get("categorias_datos", [])).lower()
            for act in progreso["datos_recopilados"]["actividades"]
        )
        
        if not datos_sensibles_identificados:
            areas.append("Identificación de datos sensibles (ej: salud, situación socioeconómica)")
        
        # Verificar si documenta flujos
        if not progreso["datos_recopilados"]["flujos"]:
            areas.append("Mapeo de flujos de datos entre sistemas y terceros")
        
        return areas
    
    def _recomendar_siguiente(self, progreso: Dict) -> str:
        """Recomienda el siguiente escenario basado en el desempeño"""
        if len(progreso["objetivos_completados"]) == len(progreso.get("objetivos_totales", [3])):
            return "Escenario Intermedio: Crisis de Fuga de Datos"
        else:
            return "Repetir el escenario actual para consolidar conocimientos"


# Instancia global del gestor sandbox
sandbox_manager = SandboxManager()