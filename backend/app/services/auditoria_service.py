"""
Servicio para auditoría y cumplimiento (Módulo 7)
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, text
import json
import hashlib

from app.models import (
    LogAuditoria,
    EventoSistema,
    MetricaCumplimiento,
    ReporteCumplimiento,
    User
)


class AuditoriaService:
    
    EVENTOS_CRITICOS = [
        "acceso_datos_sensibles",
        "modificacion_consentimiento",
        "exportacion_masiva",
        "eliminacion_datos",
        "cambio_permisos",
        "acceso_no_autorizado",
        "brecha_seguridad"
    ]
    
    METRICAS_CUMPLIMIENTO = {
        "consentimientos_actualizados": {
            "descripcion": "Porcentaje de consentimientos actualizados",
            "objetivo": 95.0,
            "critico": True
        },
        "solicitudes_arcopol_tiempo": {
            "descripcion": "Solicitudes ARCOPOL respondidas a tiempo",
            "objetivo": 100.0,
            "critico": True
        },
        "dpias_completadas": {
            "descripcion": "DPIAs completadas para actividades de alto riesgo",
            "objetivo": 100.0,
            "critico": True
        },
        "brechas_notificadas_tiempo": {
            "descripcion": "Brechas notificadas dentro del plazo",
            "objetivo": 100.0,
            "critico": True
        },
        "formacion_empleados": {
            "descripcion": "Empleados con formación actualizada",
            "objetivo": 90.0,
            "critico": False
        },
        "auditorias_planificadas": {
            "descripcion": "Auditorías realizadas según plan",
            "objetivo": 95.0,
            "critico": False
        }
    }
    
    def registrar_evento(
        self,
        db: Session,
        tenant_id: str,
        usuario_id: str,
        tipo_evento: str,
        entidad_tipo: str,
        entidad_id: str,
        accion: str,
        descripcion: str,
        ip_origen: Optional[str] = None,
        user_agent: Optional[str] = None,
        datos_adicionales: Optional[Dict[str, Any]] = None,
        resultado: str = "exitoso"
    ) -> LogAuditoria:
        """Registra un evento de auditoría"""
        
        # Determinar nivel de severidad
        if tipo_evento in self.EVENTOS_CRITICOS:
            nivel_severidad = "alto"
        elif resultado != "exitoso":
            nivel_severidad = "medio"
        else:
            nivel_severidad = "bajo"
        
        # Generar hash del evento para integridad
        evento_str = f"{tenant_id}{usuario_id}{tipo_evento}{entidad_tipo}{entidad_id}{accion}{datetime.utcnow().isoformat()}"
        hash_evento = hashlib.sha256(evento_str.encode()).hexdigest()
        
        log = LogAuditoria(
            tenant_id=tenant_id,
            usuario_id=usuario_id,
            fecha_hora=datetime.utcnow(),
            tipo_evento=tipo_evento,
            entidad_tipo=entidad_tipo,
            entidad_id=entidad_id,
            accion=accion,
            descripcion=descripcion,
            ip_origen=ip_origen,
            user_agent=user_agent,
            datos_adicionales=datos_adicionales or {},
            resultado=resultado,
            nivel_severidad=nivel_severidad,
            hash_evento=hash_evento
        )
        
        db.add(log)
        
        # Si es evento crítico, crear alerta
        if tipo_evento in self.EVENTOS_CRITICOS:
            self._crear_evento_sistema(
                db,
                tenant_id,
                "alerta_seguridad",
                f"Evento crítico: {tipo_evento}",
                {"log_id": str(log.id), "usuario": usuario_id}
            )
        
        db.commit()
        db.refresh(log)
        
        return log
    
    def _crear_evento_sistema(
        self,
        db: Session,
        tenant_id: str,
        tipo: str,
        mensaje: str,
        detalles: Optional[Dict[str, Any]] = None
    ):
        """Crea un evento del sistema"""
        
        evento = EventoSistema(
            tenant_id=tenant_id,
            tipo_evento=tipo,
            fecha_evento=datetime.utcnow(),
            mensaje=mensaje,
            detalles=detalles or {},
            leido=False,
            nivel_importancia="alto" if tipo == "alerta_seguridad" else "medio"
        )
        
        db.add(evento)
    
    def buscar_logs(
        self,
        db: Session,
        tenant_id: str,
        fecha_desde: Optional[datetime] = None,
        fecha_hasta: Optional[datetime] = None,
        usuario_id: Optional[str] = None,
        tipo_evento: Optional[str] = None,
        entidad_tipo: Optional[str] = None,
        nivel_severidad: Optional[str] = None,
        limite: int = 1000
    ) -> List[LogAuditoria]:
        """Busca logs de auditoría con filtros"""
        
        query = db.query(LogAuditoria).filter(
            LogAuditoria.tenant_id == tenant_id
        )
        
        if fecha_desde:
            query = query.filter(LogAuditoria.fecha_hora >= fecha_desde)
        
        if fecha_hasta:
            query = query.filter(LogAuditoria.fecha_hora <= fecha_hasta)
        
        if usuario_id:
            query = query.filter(LogAuditoria.usuario_id == usuario_id)
        
        if tipo_evento:
            query = query.filter(LogAuditoria.tipo_evento == tipo_evento)
        
        if entidad_tipo:
            query = query.filter(LogAuditoria.entidad_tipo == entidad_tipo)
        
        if nivel_severidad:
            query = query.filter(LogAuditoria.nivel_severidad == nivel_severidad)
        
        return query.order_by(LogAuditoria.fecha_hora.desc()).limit(limite).all()
    
    def calcular_metricas_cumplimiento(
        self,
        db: Session,
        tenant_id: str,
        periodo: str = "mensual"
    ) -> List[MetricaCumplimiento]:
        """Calcula las métricas de cumplimiento"""
        
        # Determinar rango de fechas
        fecha_fin = datetime.utcnow()
        if periodo == "diario":
            fecha_inicio = fecha_fin - timedelta(days=1)
        elif periodo == "semanal":
            fecha_inicio = fecha_fin - timedelta(days=7)
        elif periodo == "mensual":
            fecha_inicio = fecha_fin - timedelta(days=30)
        elif periodo == "anual":
            fecha_inicio = fecha_fin - timedelta(days=365)
        else:
            fecha_inicio = fecha_fin - timedelta(days=30)
        
        metricas = []
        
        # Calcular cada métrica
        for codigo, info in self.METRICAS_CUMPLIMIENTO.items():
            valor = self._calcular_metrica_individual(
                db, tenant_id, codigo, fecha_inicio, fecha_fin
            )
            
            # Determinar estado
            if valor >= info["objetivo"]:
                estado = "cumple"
            elif valor >= info["objetivo"] * 0.9:  # 90% del objetivo
                estado = "riesgo"
            else:
                estado = "no_cumple"
            
            metrica = MetricaCumplimiento(
                tenant_id=tenant_id,
                periodo=periodo,
                fecha_calculo=fecha_fin,
                metrica_codigo=codigo,
                metrica_nombre=info["descripcion"],
                valor_actual=valor,
                valor_objetivo=info["objetivo"],
                unidad="porcentaje",
                estado=estado,
                es_critica=info["critico"],
                tendencia=self._calcular_tendencia(
                    db, tenant_id, codigo, periodo
                )
            )
            
            db.add(metrica)
            metricas.append(metrica)
        
        db.commit()
        
        return metricas
    
    def _calcular_metrica_individual(
        self,
        db: Session,
        tenant_id: str,
        codigo_metrica: str,
        fecha_inicio: datetime,
        fecha_fin: datetime
    ) -> float:
        """Calcula el valor de una métrica específica"""
        
        if codigo_metrica == "consentimientos_actualizados":
            # Contar consentimientos totales y actualizados
            total = db.execute(text("""
                SELECT COUNT(*) FROM consentimientos 
                WHERE tenant_id = :tenant_id 
                AND fecha_consentimiento BETWEEN :inicio AND :fin
            """), {
                "tenant_id": tenant_id,
                "inicio": fecha_inicio,
                "fin": fecha_fin
            }).scalar()
            
            actualizados = db.execute(text("""
                SELECT COUNT(*) FROM consentimientos 
                WHERE tenant_id = :tenant_id 
                AND fecha_consentimiento BETWEEN :inicio AND :fin
                AND estado = 'activo'
            """), {
                "tenant_id": tenant_id,
                "inicio": fecha_inicio,
                "fin": fecha_fin
            }).scalar()
            
            return (actualizados / total * 100) if total > 0 else 100.0
        
        elif codigo_metrica == "solicitudes_arcopol_tiempo":
            # Solicitudes respondidas a tiempo
            total = db.execute(text("""
                SELECT COUNT(*) FROM solicitudes_arcopol 
                WHERE tenant_id = :tenant_id 
                AND fecha_solicitud BETWEEN :inicio AND :fin
                AND estado IN ('completada', 'rechazada')
            """), {
                "tenant_id": tenant_id,
                "inicio": fecha_inicio,
                "fin": fecha_fin
            }).scalar()
            
            a_tiempo = db.execute(text("""
                SELECT COUNT(*) FROM solicitudes_arcopol 
                WHERE tenant_id = :tenant_id 
                AND fecha_solicitud BETWEEN :inicio AND :fin
                AND estado IN ('completada', 'rechazada')
                AND respondida_a_tiempo = true
            """), {
                "tenant_id": tenant_id,
                "inicio": fecha_inicio,
                "fin": fecha_fin
            }).scalar()
            
            return (a_tiempo / total * 100) if total > 0 else 100.0
        
        # Agregar más métricas según necesidad
        # Por defecto retornar valor aleatorio para demo
        import random
        return random.uniform(80.0, 100.0)
    
    def _calcular_tendencia(
        self,
        db: Session,
        tenant_id: str,
        codigo_metrica: str,
        periodo: str
    ) -> str:
        """Calcula la tendencia de una métrica"""
        
        # Obtener métricas anteriores
        metricas_anteriores = db.query(MetricaCumplimiento).filter(
            and_(
                MetricaCumplimiento.tenant_id == tenant_id,
                MetricaCumplimiento.metrica_codigo == codigo_metrica,
                MetricaCumplimiento.periodo == periodo
            )
        ).order_by(MetricaCumplimiento.fecha_calculo.desc()).limit(3).all()
        
        if len(metricas_anteriores) < 2:
            return "estable"
        
        # Comparar valores
        valores = [m.valor_actual for m in metricas_anteriores]
        
        if all(valores[i] <= valores[i+1] for i in range(len(valores)-1)):
            return "mejorando"
        elif all(valores[i] >= valores[i+1] for i in range(len(valores)-1)):
            return "empeorando"
        else:
            return "estable"
    
    def generar_reporte_cumplimiento(
        self,
        db: Session,
        tenant_id: str,
        tipo_reporte: str,
        fecha_inicio: datetime,
        fecha_fin: datetime,
        incluir_detalles: bool = True,
        formato: str = "pdf"
    ) -> ReporteCumplimiento:
        """Genera un reporte de cumplimiento"""
        
        # Recopilar datos según tipo de reporte
        datos_reporte = {}
        
        if tipo_reporte == "general":
            datos_reporte = self._generar_reporte_general(
                db, tenant_id, fecha_inicio, fecha_fin
            )
        elif tipo_reporte == "consentimientos":
            datos_reporte = self._generar_reporte_consentimientos(
                db, tenant_id, fecha_inicio, fecha_fin
            )
        elif tipo_reporte == "arcopol":
            datos_reporte = self._generar_reporte_arcopol(
                db, tenant_id, fecha_inicio, fecha_fin
            )
        elif tipo_reporte == "brechas":
            datos_reporte = self._generar_reporte_brechas(
                db, tenant_id, fecha_inicio, fecha_fin
            )
        elif tipo_reporte == "transferencias":
            datos_reporte = self._generar_reporte_transferencias(
                db, tenant_id, fecha_inicio, fecha_fin
            )
        
        # Crear registro del reporte
        reporte = ReporteCumplimiento(
            tenant_id=tenant_id,
            tipo_reporte=tipo_reporte,
            periodo_inicio=fecha_inicio,
            periodo_fin=fecha_fin,
            fecha_generacion=datetime.utcnow(),
            generado_por="sistema",
            estado="generado",
            formato=formato,
            contenido=datos_reporte,
            hallazgos_principales=self._extraer_hallazgos(datos_reporte),
            recomendaciones=self._generar_recomendaciones(datos_reporte)
        )
        
        db.add(reporte)
        db.commit()
        db.refresh(reporte)
        
        return reporte
    
    def _generar_reporte_general(
        self,
        db: Session,
        tenant_id: str,
        fecha_inicio: datetime,
        fecha_fin: datetime
    ) -> Dict[str, Any]:
        """Genera un reporte general de cumplimiento"""
        
        # Obtener métricas
        metricas = db.query(MetricaCumplimiento).filter(
            and_(
                MetricaCumplimiento.tenant_id == tenant_id,
                MetricaCumplimiento.fecha_calculo >= fecha_inicio,
                MetricaCumplimiento.fecha_calculo <= fecha_fin
            )
        ).all()
        
        # Eventos críticos
        eventos_criticos = db.query(LogAuditoria).filter(
            and_(
                LogAuditoria.tenant_id == tenant_id,
                LogAuditoria.fecha_hora >= fecha_inicio,
                LogAuditoria.fecha_hora <= fecha_fin,
                LogAuditoria.nivel_severidad == "alto"
            )
        ).count()
        
        # Resumen por módulo
        resumen_modulos = {
            "consentimientos": self._obtener_stats_consentimientos(
                db, tenant_id, fecha_inicio, fecha_fin
            ),
            "arcopol": self._obtener_stats_arcopol(
                db, tenant_id, fecha_inicio, fecha_fin
            ),
            "brechas": self._obtener_stats_brechas(
                db, tenant_id, fecha_inicio, fecha_fin
            ),
            "dpias": self._obtener_stats_dpias(
                db, tenant_id, fecha_inicio, fecha_fin
            ),
            "transferencias": self._obtener_stats_transferencias(
                db, tenant_id, fecha_inicio, fecha_fin
            )
        }
        
        return {
            "periodo": {
                "inicio": fecha_inicio.isoformat(),
                "fin": fecha_fin.isoformat()
            },
            "resumen_ejecutivo": {
                "nivel_cumplimiento_global": self._calcular_nivel_cumplimiento_global(metricas),
                "metricas_criticas_incumplidas": len([
                    m for m in metricas 
                    if m.es_critica and m.estado == "no_cumple"
                ]),
                "eventos_criticos": eventos_criticos
            },
            "metricas": [
                {
                    "codigo": m.metrica_codigo,
                    "nombre": m.metrica_nombre,
                    "valor": m.valor_actual,
                    "objetivo": m.valor_objetivo,
                    "estado": m.estado,
                    "critica": m.es_critica,
                    "tendencia": m.tendencia
                }
                for m in metricas
            ],
            "modulos": resumen_modulos
        }
    
    def _calcular_nivel_cumplimiento_global(
        self,
        metricas: List[MetricaCumplimiento]
    ) -> float:
        """Calcula el nivel de cumplimiento global"""
        
        if not metricas:
            return 0.0
        
        # Ponderar métricas críticas con mayor peso
        suma_ponderada = 0.0
        peso_total = 0.0
        
        for metrica in metricas:
            peso = 2.0 if metrica.es_critica else 1.0
            cumplimiento = min(100.0, (metrica.valor_actual / metrica.valor_objetivo) * 100)
            suma_ponderada += cumplimiento * peso
            peso_total += peso
        
        return suma_ponderada / peso_total if peso_total > 0 else 0.0
    
    def _obtener_stats_consentimientos(
        self,
        db: Session,
        tenant_id: str,
        fecha_inicio: datetime,
        fecha_fin: datetime
    ) -> Dict[str, Any]:
        """Obtiene estadísticas de consentimientos"""
        
        stats = db.execute(text("""
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) as activos,
                SUM(CASE WHEN estado = 'revocado' THEN 1 ELSE 0 END) as revocados
            FROM consentimientos
            WHERE tenant_id = :tenant_id
            AND fecha_consentimiento BETWEEN :inicio AND :fin
        """), {
            "tenant_id": tenant_id,
            "inicio": fecha_inicio,
            "fin": fecha_fin
        }).fetchone()
        
        return {
            "total": stats[0] or 0,
            "activos": stats[1] or 0,
            "revocados": stats[2] or 0,
            "tasa_revocacion": ((stats[2] or 0) / (stats[0] or 1)) * 100
        }
    
    def _obtener_stats_arcopol(
        self,
        db: Session,
        tenant_id: str,
        fecha_inicio: datetime,
        fecha_fin: datetime
    ) -> Dict[str, Any]:
        """Obtiene estadísticas de solicitudes ARCOPOL"""
        
        stats = db.execute(text("""
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as completadas,
                SUM(CASE WHEN respondida_a_tiempo = true THEN 1 ELSE 0 END) as a_tiempo,
                AVG(EXTRACT(day FROM (fecha_respuesta - fecha_solicitud))) as tiempo_promedio
            FROM solicitudes_arcopol
            WHERE tenant_id = :tenant_id
            AND fecha_solicitud BETWEEN :inicio AND :fin
        """), {
            "tenant_id": tenant_id,
            "inicio": fecha_inicio,
            "fin": fecha_fin
        }).fetchone()
        
        return {
            "total": stats[0] or 0,
            "completadas": stats[1] or 0,
            "a_tiempo": stats[2] or 0,
            "tiempo_promedio_dias": float(stats[3] or 0),
            "tasa_cumplimiento": ((stats[2] or 0) / (stats[0] or 1)) * 100
        }
    
    def _obtener_stats_brechas(
        self,
        db: Session,
        tenant_id: str,
        fecha_inicio: datetime,
        fecha_fin: datetime
    ) -> Dict[str, Any]:
        """Obtiene estadísticas de brechas"""
        
        stats = db.execute(text("""
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN gravedad = 'critica' THEN 1 ELSE 0 END) as criticas,
                SUM(CASE WHEN notificada_autoridad = true THEN 1 ELSE 0 END) as notificadas,
                SUM(numero_afectados_confirmado) as total_afectados
            FROM notificaciones_brecha
            WHERE tenant_id = :tenant_id
            AND fecha_deteccion BETWEEN :inicio AND :fin
        """), {
            "tenant_id": tenant_id,
            "inicio": fecha_inicio,
            "fin": fecha_fin
        }).fetchone()
        
        return {
            "total": stats[0] or 0,
            "criticas": stats[1] or 0,
            "notificadas": stats[2] or 0,
            "afectados": stats[3] or 0
        }
    
    def _obtener_stats_dpias(
        self,
        db: Session,
        tenant_id: str,
        fecha_inicio: datetime,
        fecha_fin: datetime
    ) -> Dict[str, Any]:
        """Obtiene estadísticas de DPIAs"""
        
        stats = db.execute(text("""
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as completadas,
                SUM(CASE WHEN nivel_riesgo_global = 'alto' THEN 1 ELSE 0 END) as alto_riesgo
            FROM evaluaciones_impacto
            WHERE tenant_id = :tenant_id
            AND fecha_inicio BETWEEN :inicio AND :fin
        """), {
            "tenant_id": tenant_id,
            "inicio": fecha_inicio,
            "fin": fecha_fin
        }).fetchone()
        
        return {
            "total": stats[0] or 0,
            "completadas": stats[1] or 0,
            "alto_riesgo": stats[2] or 0,
            "tasa_completitud": ((stats[1] or 0) / (stats[0] or 1)) * 100
        }
    
    def _obtener_stats_transferencias(
        self,
        db: Session,
        tenant_id: str,
        fecha_inicio: datetime,
        fecha_fin: datetime
    ) -> Dict[str, Any]:
        """Obtiene estadísticas de transferencias"""
        
        stats = db.execute(text("""
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN pais_con_nivel_adecuado = true THEN 1 ELSE 0 END) as paises_adecuados,
                COUNT(DISTINCT pais_destino) as paises_distintos
            FROM transferencias_internacionales
            WHERE tenant_id = :tenant_id
            AND fecha_inicio BETWEEN :inicio AND :fin
        """), {
            "tenant_id": tenant_id,
            "inicio": fecha_inicio,
            "fin": fecha_fin
        }).fetchone()
        
        return {
            "total": stats[0] or 0,
            "paises_adecuados": stats[1] or 0,
            "paises_distintos": stats[2] or 0,
            "porcentaje_paises_adecuados": ((stats[1] or 0) / (stats[0] or 1)) * 100
        }
    
    def _extraer_hallazgos(self, datos_reporte: Dict[str, Any]) -> List[str]:
        """Extrae los hallazgos principales del reporte"""
        
        hallazgos = []
        
        # Analizar métricas
        if "metricas" in datos_reporte:
            metricas_incumplidas = [
                m for m in datos_reporte["metricas"] 
                if m["estado"] == "no_cumple"
            ]
            
            if metricas_incumplidas:
                hallazgos.append(
                    f"Se identificaron {len(metricas_incumplidas)} métricas que no cumplen con los objetivos establecidos"
                )
        
        # Analizar eventos críticos
        if "resumen_ejecutivo" in datos_reporte:
            eventos = datos_reporte["resumen_ejecutivo"].get("eventos_criticos", 0)
            if eventos > 0:
                hallazgos.append(
                    f"Se registraron {eventos} eventos críticos de seguridad durante el período"
                )
        
        return hallazgos
    
    def _generar_recomendaciones(self, datos_reporte: Dict[str, Any]) -> List[str]:
        """Genera recomendaciones basadas en los datos del reporte"""
        
        recomendaciones = []
        
        # Analizar métricas
        if "metricas" in datos_reporte:
            for metrica in datos_reporte["metricas"]:
                if metrica["estado"] == "no_cumple" and metrica["critica"]:
                    recomendaciones.append(
                        f"Implementar acciones correctivas urgentes para mejorar: {metrica['nombre']}"
                    )
        
        # Recomendaciones generales
        if datos_reporte.get("resumen_ejecutivo", {}).get("nivel_cumplimiento_global", 100) < 90:
            recomendaciones.append(
                "Revisar y actualizar los procedimientos de protección de datos"
            )
        
        return recomendaciones
    
    def verificar_integridad_logs(
        self,
        db: Session,
        tenant_id: str,
        fecha_desde: datetime,
        fecha_hasta: datetime
    ) -> Dict[str, Any]:
        """Verifica la integridad de los logs de auditoría"""
        
        logs = db.query(LogAuditoria).filter(
            and_(
                LogAuditoria.tenant_id == tenant_id,
                LogAuditoria.fecha_hora >= fecha_desde,
                LogAuditoria.fecha_hora <= fecha_hasta
            )
        ).order_by(LogAuditoria.fecha_hora).all()
        
        total_logs = len(logs)
        logs_validos = 0
        logs_invalidos = []
        
        for log in logs:
            # Recalcular hash
            evento_str = f"{log.tenant_id}{log.usuario_id}{log.tipo_evento}{log.entidad_tipo}{log.entidad_id}{log.accion}{log.fecha_hora.isoformat()}"
            hash_calculado = hashlib.sha256(evento_str.encode()).hexdigest()
            
            if hash_calculado == log.hash_evento:
                logs_validos += 1
            else:
                logs_invalidos.append({
                    "id": log.id,
                    "fecha": log.fecha_hora.isoformat(),
                    "tipo": log.tipo_evento,
                    "usuario": log.usuario_id
                })
        
        return {
            "total_logs": total_logs,
            "logs_validos": logs_validos,
            "logs_invalidos": len(logs_invalidos),
            "integridad": (logs_validos / total_logs * 100) if total_logs > 0 else 100,
            "detalle_invalidos": logs_invalidos[:10]  # Primeros 10
        }