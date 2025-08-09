"""
Servicio para gestión de evaluaciones de impacto (DPIA) - Módulo 5
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
import uuid

from app.models import (
    EvaluacionImpacto,
    RiesgoDPIA,
    MedidaMitigacionDPIA,
    AprobacionDPIA,
    ActividadTratamiento
)


class DPIAService:
    
    CRITERIOS_DPIA_OBLIGATORIA = [
        {
            "codigo": "EVAL_SISTEMATICA",
            "descripcion": "Evaluación sistemática y exhaustiva de aspectos personales",
            "ejemplos": ["Perfilado", "Scoring crediticio", "Evaluación de rendimiento"]
        },
        {
            "codigo": "DATOS_SENSIBLES_GRAN_ESCALA",
            "descripcion": "Tratamiento a gran escala de datos sensibles",
            "ejemplos": ["Datos de salud", "Datos biométricos", "Datos genéticos"]
        },
        {
            "codigo": "VIGILANCIA_SISTEMATICA",
            "descripcion": "Observación sistemática de zonas de acceso público",
            "ejemplos": ["Videovigilancia", "Geolocalización", "Monitoreo de empleados"]
        },
        {
            "codigo": "NUEVAS_TECNOLOGIAS",
            "descripcion": "Uso de nuevas tecnologías o tecnologías innovadoras",
            "ejemplos": ["IA/Machine Learning", "IoT", "Blockchain"]
        },
        {
            "codigo": "VULNERABLES",
            "descripcion": "Tratamiento de datos de colectivos vulnerables",
            "ejemplos": ["Menores", "Empleados", "Pacientes"]
        }
    ]
    
    MATRIZ_RIESGO = {
        "muy_baja": {"muy_baja": "muy_bajo", "baja": "bajo", "media": "bajo", "alta": "medio", "muy_alta": "medio"},
        "baja": {"muy_baja": "bajo", "baja": "bajo", "media": "medio", "alta": "medio", "muy_alta": "alto"},
        "media": {"muy_baja": "bajo", "baja": "medio", "media": "medio", "alta": "alto", "muy_alta": "alto"},
        "alta": {"muy_baja": "medio", "baja": "medio", "media": "alto", "alta": "alto", "muy_alta": "muy_alto"},
        "muy_alta": {"muy_baja": "medio", "baja": "alto", "media": "alto", "alta": "muy_alto", "muy_alta": "muy_alto"}
    }
    
    def evaluar_necesidad_dpia(
        self,
        db: Session,
        tenant_id: str,
        actividad_id: str
    ) -> Dict[str, Any]:
        """Evalúa si una actividad requiere DPIA"""
        
        actividad = db.query(ActividadTratamiento).filter(
            and_(
                ActividadTratamiento.id == actividad_id,
                ActividadTratamiento.tenant_id == tenant_id
            )
        ).first()
        
        if not actividad:
            raise ValueError("Actividad no encontrada")
        
        criterios_cumplidos = []
        puntuacion = 0
        
        # Evaluar cada criterio
        for criterio in self.CRITERIOS_DPIA_OBLIGATORIA:
            cumple = self._evaluar_criterio(actividad, criterio["codigo"])
            if cumple:
                criterios_cumplidos.append({
                    "codigo": criterio["codigo"],
                    "descripcion": criterio["descripcion"],
                    "cumple": True
                })
                puntuacion += 1
        
        # Determinar si es obligatoria
        requiere_dpia = puntuacion >= 2  # Al menos 2 criterios
        
        # Si tiene datos sensibles, siempre requiere
        if any(cat.datos_sensibles for cat in actividad.categorias_datos):
            requiere_dpia = True
            criterios_cumplidos.append({
                "codigo": "DATOS_SENSIBLES",
                "descripcion": "La actividad trata datos sensibles",
                "cumple": True
            })
        
        return {
            "actividad_id": actividad_id,
            "nombre_actividad": actividad.nombre,
            "requiere_dpia": requiere_dpia,
            "criterios_cumplidos": criterios_cumplidos,
            "puntuacion": puntuacion,
            "recomendacion": "Obligatorio realizar DPIA" if requiere_dpia else "DPIA recomendada pero no obligatoria",
            "fecha_evaluacion": datetime.utcnow().isoformat()
        }
    
    def _evaluar_criterio(self, actividad: ActividadTratamiento, codigo_criterio: str) -> bool:
        """Evalúa si una actividad cumple un criterio específico"""
        
        # Aquí iría la lógica específica para cada criterio
        # Por ahora, evaluación simplificada basada en metadata
        
        if codigo_criterio == "DATOS_SENSIBLES_GRAN_ESCALA":
            return any(cat.datos_sensibles for cat in actividad.categorias_datos)
        
        if codigo_criterio == "NUEVAS_TECNOLOGIAS":
            tech_keywords = ["ia", "ml", "machine learning", "iot", "blockchain"]
            descripcion_lower = actividad.descripcion.lower()
            return any(tech in descripcion_lower for tech in tech_keywords)
        
        # Por defecto, evaluar desde metadata
        if actividad.metadata:
            return actividad.metadata.get(f"criterio_{codigo_criterio}", False)
        
        return False
    
    def crear_dpia(
        self,
        db: Session,
        tenant_id: str,
        actividad_id: str,
        responsable_id: str,
        descripcion_proyecto: str,
        objetivos: List[str],
        necesidad_proporcionalidad: str,
        partes_interesadas: Optional[List[Dict[str, str]]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> EvaluacionImpacto:
        """Crea una nueva evaluación de impacto"""
        
        # Verificar actividad
        actividad = db.query(ActividadTratamiento).filter(
            and_(
                ActividadTratamiento.id == actividad_id,
                ActividadTratamiento.tenant_id == tenant_id
            )
        ).first()
        
        if not actividad:
            raise ValueError("Actividad no encontrada")
        
        # Generar código único
        codigo_dpia = self._generar_codigo_dpia(db, tenant_id)
        
        # Crear DPIA
        dpia = EvaluacionImpacto(
            tenant_id=tenant_id,
            codigo_dpia=codigo_dpia,
            actividad_id=actividad_id,
            responsable_id=responsable_id,
            estado="borrador",
            version=1,
            fecha_inicio=datetime.utcnow(),
            descripcion_proyecto=descripcion_proyecto,
            objetivos=objetivos,
            necesidad_proporcionalidad=necesidad_proporcionalidad,
            partes_interesadas=partes_interesadas or [],
            metadata=metadata or {}
        )
        
        db.add(dpia)
        db.commit()
        db.refresh(dpia)
        
        return dpia
    
    def _generar_codigo_dpia(self, db: Session, tenant_id: str) -> str:
        """Genera un código único para la DPIA"""
        year = datetime.utcnow().year
        
        last_dpia = db.query(EvaluacionImpacto).filter(
            and_(
                EvaluacionImpacto.tenant_id == tenant_id,
                func.extract('year', EvaluacionImpacto.fecha_inicio) == year
            )
        ).order_by(EvaluacionImpacto.fecha_inicio.desc()).first()
        
        if last_dpia and last_dpia.codigo_dpia:
            parts = last_dpia.codigo_dpia.split('-')
            if len(parts) >= 3:
                seq = int(parts[2]) + 1
            else:
                seq = 1
        else:
            seq = 1
        
        return f"DPIA-{year}-{seq:04d}"
    
    def identificar_riesgo(
        self,
        db: Session,
        tenant_id: str,
        dpia_id: str,
        categoria: str,
        descripcion: str,
        origen: str,
        activos_afectados: List[str],
        amenazas: List[str],
        probabilidad_inicial: str,
        impacto_inicial: str,
        detalles_evaluacion: Optional[str] = None
    ) -> RiesgoDPIA:
        """Identifica y registra un riesgo en la DPIA"""
        
        dpia = db.query(EvaluacionImpacto).filter(
            and_(
                EvaluacionImpacto.id == dpia_id,
                EvaluacionImpacto.tenant_id == tenant_id
            )
        ).first()
        
        if not dpia:
            raise ValueError("DPIA no encontrada")
        
        # Calcular nivel de riesgo usando matriz
        nivel_riesgo_inicial = self.MATRIZ_RIESGO[probabilidad_inicial][impacto_inicial]
        
        riesgo = RiesgoDPIA(
            tenant_id=tenant_id,
            dpia_id=dpia_id,
            categoria=categoria,
            descripcion=descripcion,
            origen=origen,
            activos_afectados=activos_afectados,
            amenazas=amenazas,
            probabilidad_inicial=probabilidad_inicial,
            impacto_inicial=impacto_inicial,
            nivel_riesgo_inicial=nivel_riesgo_inicial,
            estado="identificado",
            fecha_identificacion=datetime.utcnow(),
            evaluacion_detalle=detalles_evaluacion
        )
        
        db.add(riesgo)
        
        # Actualizar estado DPIA si está en borrador
        if dpia.estado == "borrador":
            dpia.estado = "en_evaluacion"
        
        db.commit()
        db.refresh(riesgo)
        
        return riesgo
    
    def proponer_medida_mitigacion(
        self,
        db: Session,
        tenant_id: str,
        riesgo_id: str,
        tipo_medida: str,
        descripcion: str,
        reduccion_probabilidad: str,
        reduccion_impacto: str,
        costo_implementacion: Optional[str] = None,
        tiempo_implementacion: Optional[str] = None,
        responsable_propuesto: Optional[str] = None,
        recursos_necesarios: Optional[List[str]] = None
    ) -> MedidaMitigacionDPIA:
        """Propone una medida de mitigación para un riesgo"""
        
        riesgo = db.query(RiesgoDPIA).filter(
            and_(
                RiesgoDPIA.id == riesgo_id,
                RiesgoDPIA.tenant_id == tenant_id
            )
        ).first()
        
        if not riesgo:
            raise ValueError("Riesgo no encontrado")
        
        # Calcular probabilidad e impacto residual
        prob_residual = self._calcular_valor_residual(
            riesgo.probabilidad_inicial,
            reduccion_probabilidad
        )
        
        imp_residual = self._calcular_valor_residual(
            riesgo.impacto_inicial,
            reduccion_impacto
        )
        
        # Calcular nivel de riesgo residual
        nivel_riesgo_residual = self.MATRIZ_RIESGO[prob_residual][imp_residual]
        
        medida = MedidaMitigacionDPIA(
            tenant_id=tenant_id,
            riesgo_id=riesgo_id,
            tipo_medida=tipo_medida,
            descripcion=descripcion,
            estado="propuesta",
            reduccion_probabilidad=reduccion_probabilidad,
            reduccion_impacto=reduccion_impacto,
            probabilidad_residual=prob_residual,
            impacto_residual=imp_residual,
            nivel_riesgo_residual=nivel_riesgo_residual,
            costo_implementacion=costo_implementacion,
            tiempo_implementacion=tiempo_implementacion,
            responsable_propuesto=responsable_propuesto,
            recursos_necesarios=recursos_necesarios or []
        )
        
        db.add(medida)
        db.commit()
        db.refresh(medida)
        
        return medida
    
    def _calcular_valor_residual(self, valor_inicial: str, reduccion: str) -> str:
        """Calcula el valor residual después de aplicar una reducción"""
        
        escala = ["muy_baja", "baja", "media", "alta", "muy_alta"]
        reducciones = {
            "ninguna": 0,
            "baja": 1,
            "media": 2,
            "alta": 3,
            "muy_alta": 4
        }
        
        idx_inicial = escala.index(valor_inicial)
        reduccion_nivel = reducciones.get(reduccion, 0)
        
        idx_residual = max(0, idx_inicial - reduccion_nivel)
        
        return escala[idx_residual]
    
    def aprobar_medidas(
        self,
        db: Session,
        tenant_id: str,
        dpia_id: str,
        medida_ids: List[str],
        aprobador_id: str,
        comentarios: Optional[str] = None
    ) -> List[MedidaMitigacionDPIA]:
        """Aprueba medidas de mitigación"""
        
        medidas = db.query(MedidaMitigacionDPIA).join(
            RiesgoDPIA
        ).filter(
            and_(
                MedidaMitigacionDPIA.id.in_(medida_ids),
                RiesgoDPIA.dpia_id == dpia_id,
                RiesgoDPIA.tenant_id == tenant_id
            )
        ).all()
        
        for medida in medidas:
            medida.estado = "aprobada"
            medida.fecha_aprobacion = datetime.utcnow()
            medida.aprobado_por = aprobador_id
            
            # Actualizar riesgo con valores residuales
            riesgo = medida.riesgo
            riesgo.probabilidad_residual = medida.probabilidad_residual
            riesgo.impacto_residual = medida.impacto_residual
            riesgo.nivel_riesgo_residual = medida.nivel_riesgo_residual
            riesgo.estado = "mitigado"
        
        db.commit()
        
        return medidas
    
    def finalizar_dpia(
        self,
        db: Session,
        tenant_id: str,
        dpia_id: str,
        conclusiones: str,
        recomendaciones: List[str],
        aprobador_id: str,
        nivel_riesgo_final: str,
        dictamen: str = "favorable",  # favorable, favorable_con_condiciones, desfavorable
        condiciones: Optional[List[str]] = None
    ) -> AprobacionDPIA:
        """Finaliza y aprueba una DPIA"""
        
        dpia = db.query(EvaluacionImpacto).filter(
            and_(
                EvaluacionImpacto.id == dpia_id,
                EvaluacionImpacto.tenant_id == tenant_id
            )
        ).first()
        
        if not dpia:
            raise ValueError("DPIA no encontrada")
        
        # Verificar que todos los riesgos han sido evaluados
        riesgos_sin_evaluar = db.query(RiesgoDPIA).filter(
            and_(
                RiesgoDPIA.dpia_id == dpia_id,
                RiesgoDPIA.estado == "identificado"
            )
        ).count()
        
        if riesgos_sin_evaluar > 0:
            raise ValueError(f"Hay {riesgos_sin_evaluar} riesgos sin evaluar")
        
        # Crear aprobación
        aprobacion = AprobacionDPIA(
            tenant_id=tenant_id,
            dpia_id=dpia_id,
            aprobador_id=aprobador_id,
            fecha_aprobacion=datetime.utcnow(),
            dictamen=dictamen,
            nivel_riesgo_final=nivel_riesgo_final,
            condiciones=condiciones or [],
            observaciones=f"Conclusiones: {conclusiones}"
        )
        
        db.add(aprobacion)
        
        # Actualizar DPIA
        dpia.estado = "completada"
        dpia.fecha_finalizacion = datetime.utcnow()
        dpia.conclusiones = conclusiones
        dpia.recomendaciones = recomendaciones
        dpia.nivel_riesgo_global = nivel_riesgo_final
        
        # Si es desfavorable, marcar actividad
        if dictamen == "desfavorable":
            actividad = dpia.actividad
            actividad.estado = "suspendida"
            
            if not actividad.metadata:
                actividad.metadata = {}
            actividad.metadata["dpia_desfavorable"] = {
                "fecha": datetime.utcnow().isoformat(),
                "dpia_id": dpia_id,
                "motivo": conclusiones
            }
        
        db.commit()
        db.refresh(aprobacion)
        
        return aprobacion
    
    def get_dpias_pendientes(
        self,
        db: Session,
        tenant_id: str,
        responsable_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Obtiene DPIAs pendientes de completar"""
        
        query = db.query(EvaluacionImpacto).filter(
            and_(
                EvaluacionImpacto.tenant_id == tenant_id,
                EvaluacionImpacto.estado.in_(["borrador", "en_evaluacion", "en_revision"])
            )
        )
        
        if responsable_id:
            query = query.filter(EvaluacionImpacto.responsable_id == responsable_id)
        
        dpias = query.all()
        
        result = []
        for dpia in dpias:
            # Contar riesgos
            total_riesgos = db.query(RiesgoDPIA).filter(
                RiesgoDPIA.dpia_id == dpia.id
            ).count()
            
            riesgos_mitigados = db.query(RiesgoDPIA).filter(
                and_(
                    RiesgoDPIA.dpia_id == dpia.id,
                    RiesgoDPIA.estado == "mitigado"
                )
            ).count()
            
            # Calcular días transcurridos
            dias_transcurridos = (datetime.utcnow() - dpia.fecha_inicio).days
            
            result.append({
                "id": dpia.id,
                "codigo": dpia.codigo_dpia,
                "actividad": dpia.actividad.nombre,
                "estado": dpia.estado,
                "version": dpia.version,
                "fecha_inicio": dpia.fecha_inicio.isoformat(),
                "dias_transcurridos": dias_transcurridos,
                "responsable": dpia.responsable_id,
                "progreso": {
                    "riesgos_identificados": total_riesgos,
                    "riesgos_mitigados": riesgos_mitigados,
                    "porcentaje": (riesgos_mitigados / total_riesgos * 100) if total_riesgos > 0 else 0
                }
            })
        
        return result
    
    def generar_informe_dpia(
        self,
        db: Session,
        tenant_id: str,
        dpia_id: str
    ) -> Dict[str, Any]:
        """Genera un informe completo de la DPIA"""
        
        dpia = db.query(EvaluacionImpacto).filter(
            and_(
                EvaluacionImpacto.id == dpia_id,
                EvaluacionImpacto.tenant_id == tenant_id
            )
        ).first()
        
        if not dpia:
            raise ValueError("DPIA no encontrada")
        
        # Obtener información relacionada
        riesgos = db.query(RiesgoDPIA).filter(
            RiesgoDPIA.dpia_id == dpia_id
        ).all()
        
        aprobacion = db.query(AprobacionDPIA).filter(
            AprobacionDPIA.dpia_id == dpia_id
        ).first()
        
        # Estadísticas de riesgos
        riesgos_por_nivel = {}
        for riesgo in riesgos:
            nivel = riesgo.nivel_riesgo_residual or riesgo.nivel_riesgo_inicial
            if nivel not in riesgos_por_nivel:
                riesgos_por_nivel[nivel] = 0
            riesgos_por_nivel[nivel] += 1
        
        # Medidas de mitigación
        todas_medidas = []
        for riesgo in riesgos:
            medidas = db.query(MedidaMitigacionDPIA).filter(
                MedidaMitigacionDPIA.riesgo_id == riesgo.id
            ).all()
            todas_medidas.extend(medidas)
        
        return {
            "dpia": {
                "codigo": dpia.codigo_dpia,
                "version": dpia.version,
                "estado": dpia.estado,
                "actividad": dpia.actividad.nombre,
                "responsable": dpia.responsable_id,
                "fecha_inicio": dpia.fecha_inicio.isoformat(),
                "fecha_finalizacion": dpia.fecha_finalizacion.isoformat() if dpia.fecha_finalizacion else None,
                "duracion_dias": (dpia.fecha_finalizacion - dpia.fecha_inicio).days if dpia.fecha_finalizacion else None
            },
            "proyecto": {
                "descripcion": dpia.descripcion_proyecto,
                "objetivos": dpia.objetivos,
                "necesidad_proporcionalidad": dpia.necesidad_proporcionalidad,
                "partes_interesadas": dpia.partes_interesadas
            },
            "riesgos": {
                "total": len(riesgos),
                "por_nivel": riesgos_por_nivel,
                "detalle": [
                    {
                        "categoria": r.categoria,
                        "descripcion": r.descripcion,
                        "nivel_inicial": r.nivel_riesgo_inicial,
                        "nivel_residual": r.nivel_riesgo_residual,
                        "estado": r.estado
                    }
                    for r in riesgos
                ]
            },
            "medidas": {
                "total": len(todas_medidas),
                "aprobadas": len([m for m in todas_medidas if m.estado == "aprobada"]),
                "implementadas": len([m for m in todas_medidas if m.estado == "implementada"])
            },
            "resultado": {
                "nivel_riesgo_global": dpia.nivel_riesgo_global,
                "conclusiones": dpia.conclusiones,
                "recomendaciones": dpia.recomendaciones,
                "aprobacion": {
                    "dictamen": aprobacion.dictamen if aprobacion else None,
                    "fecha": aprobacion.fecha_aprobacion.isoformat() if aprobacion else None,
                    "aprobador": aprobacion.aprobador_id if aprobacion else None,
                    "condiciones": aprobacion.condiciones if aprobacion else []
                } if aprobacion else None
            }
        }