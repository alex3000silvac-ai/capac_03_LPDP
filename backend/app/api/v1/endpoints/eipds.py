"""
🛡️ EIPD ENDPOINTS - API REST Completa para Evaluaciones de Impacto
Sistema completo de gestión EIPDs/DPIAs según Art. 25 Ley 21.719
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime, timedelta
import json

from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.tenant import get_tenant_id

router = APIRouter()

@router.get("/")
async def get_eipds(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=500),
    estado: Optional[str] = Query(None),
    nivel_riesgo: Optional[str] = Query(None),
    rat_id: Optional[int] = Query(None),
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    📋 Obtener lista de EIPDs con filtros
    """
    try:
        query = supabase.table("eipds").select("*").eq("tenant_id", tenant_id)
        
        if estado:
            query = query.eq("estado", estado)
        if nivel_riesgo:
            query = query.eq("nivel_riesgo", nivel_riesgo)
        if rat_id:
            query = query.eq("rat_id", rat_id)
            
        result = query.order("created_at", desc=True).range(skip, skip + limit - 1).execute()
        
        return {
            "eipds": result.data or [],
            "total": len(result.data) if result.data else 0,
            "pagination": {
                "skip": skip,
                "limit": limit,
                "page": skip // limit + 1
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo EIPDs: {str(e)}")


@router.post("/")
async def create_eipd(
    eipd_data: dict,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    ✨ Crear nueva EIPD/DPIA
    """
    try:
        # Preparar datos
        eipd_dict = {
            **eipd_data,
            "tenant_id": tenant_id,
            "created_by": current_user.id,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "estado": "BORRADOR",
            "version": 1
        }
        
        # Insertar
        result = supabase.table("eipds").insert(eipd_dict).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Error creando EIPD")
            
        return {
            "message": "EIPD creada exitosamente",
            "eipd": result.data[0]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creando EIPD: {str(e)}")


@router.get("/{eipd_id}")
async def get_eipd(
    eipd_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    📄 Obtener EIPD específica
    """
    try:
        result = supabase.table("eipds").select("*").eq("id", eipd_id).eq("tenant_id", tenant_id).single().execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="EIPD no encontrada")
            
        return result.data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo EIPD: {str(e)}")


@router.post("/{eipd_id}/evaluate")
async def evaluate_eipd_risk(
    eipd_id: int,
    evaluation_data: dict,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    🧮 Evaluar riesgo de EIPD
    """
    try:
        # Obtener EIPD
        eipd = supabase.table("eipds").select("*").eq("id", eipd_id).eq("tenant_id", tenant_id).single().execute()
        
        if not eipd.data:
            raise HTTPException(status_code=404, detail="EIPD no encontrada")
        
        # Evaluar riesgo según criterios Art. 25
        risk_factors = evaluation_data.get("risk_factors", [])
        mitigation_measures = evaluation_data.get("mitigation_measures", [])
        
        # Calcular nivel de riesgo
        risk_score = len(risk_factors) * 10
        mitigation_score = len(mitigation_measures) * 5
        final_risk_score = max(0, risk_score - mitigation_score)
        
        if final_risk_score >= 70:
            nivel_riesgo = "CRÍTICO"
            requiere_consulta_previa = True
        elif final_risk_score >= 50:
            nivel_riesgo = "ALTO"
            requiere_consulta_previa = True
        elif final_risk_score >= 30:
            nivel_riesgo = "MEDIO"
            requiere_consulta_previa = False
        else:
            nivel_riesgo = "BAJO"
            requiere_consulta_previa = False
        
        # Actualizar EIPD con evaluación
        update_data = {
            "risk_factors": risk_factors,
            "mitigation_measures": mitigation_measures,
            "risk_score": final_risk_score,
            "nivel_riesgo": nivel_riesgo,
            "requiere_consulta_previa": requiere_consulta_previa,
            "evaluated_at": datetime.utcnow().isoformat(),
            "evaluated_by": current_user.id,
            "estado": "EVALUADA"
        }
        
        result = supabase.table("eipds").update(update_data).eq("id", eipd_id).execute()
        
        return {
            "eipd_id": eipd_id,
            "evaluation_result": {
                "nivel_riesgo": nivel_riesgo,
                "risk_score": final_risk_score,
                "requiere_consulta_previa": requiere_consulta_previa,
                "evaluated_at": update_data["evaluated_at"]
            },
            "next_steps": [
                "Revisar medidas de mitigación" if final_risk_score > 30 else "EIPD completa",
                "Consulta previa APDP requerida" if requiere_consulta_previa else "No requiere consulta previa"
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error evaluando EIPD: {str(e)}")


@router.get("/templates/industry/{industry}")
async def get_eipd_templates_by_industry(
    industry: str,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    📚 Obtener templates EIPD por industria
    """
    try:
        # Templates predefinidos por industria
        templates = {
            "financiero": [
                {
                    "id": "financial-customer-data",
                    "nombre": "Datos Clientes Sector Financiero",
                    "descripcion": "EIPD para tratamiento datos clientes en instituciones financieras",
                    "nivel_riesgo": "ALTO",
                    "criterios_aplicacion": [
                        "Datos financieros sensibles",
                        "Decisiones automatizadas (scoring)",
                        "Observación sistemática comportamiento",
                        "Transferencias internacionales"
                    ],
                    "tiempo_estimado": 120
                }
            ],
            "salud": [
                {
                    "id": "healthcare-patient-records",
                    "nombre": "Registros Médicos Electrónicos",
                    "descripcion": "EIPD para sistemas de historia clínica y datos de salud",
                    "nivel_riesgo": "ALTO",
                    "criterios_aplicacion": [
                        "Datos especialmente sensibles (salud)",
                        "Datos biométricos",
                        "Decisiones automáticas diagnóstico",
                        "Interconexión sistemas salud"
                    ],
                    "tiempo_estimado": 180
                }
            ],
            "educacion": [
                {
                    "id": "education-student-data",
                    "nombre": "Datos Estudiantes y Menores",
                    "descripcion": "EIPD para instituciones educativas con datos de menores",
                    "nivel_riesgo": "ALTO",
                    "criterios_aplicacion": [
                        "Datos de menores de edad",
                        "Datos biométricos (acceso)",
                        "Monitoreo comportamiento online",
                        "Evaluaciones académicas"
                    ],
                    "tiempo_estimado": 90
                }
            ],
            "retail": [
                {
                    "id": "retail-customer-marketing",
                    "nombre": "Marketing y Perfilado Clientes",
                    "descripcion": "EIPD para campañas marketing y análisis comportamental",
                    "nivel_riesgo": "MEDIO",
                    "criterios_aplicacion": [
                        "Perfilado automatizado",
                        "Decisiones marketing automáticas",
                        "Tracking comportamiento online",
                        "Datos de navegación"
                    ],
                    "tiempo_estimado": 45
                }
            ],
            "tecnologia": [
                {
                    "id": "tech-employee-monitoring",
                    "nombre": "Monitoreo Empleados Tecnología",
                    "descripcion": "EIPD para sistemas monitoreo actividad laboral",
                    "nivel_riesgo": "MEDIO",
                    "criterios_aplicacion": [
                        "Monitoreo sistemático empleados",
                        "Datos biométricos acceso",
                        "Análisis productividad",
                        "Geolocalización dispositivos"
                    ],
                    "tiempo_estimado": 75
                }
            ]
        }
        
        industry_templates = templates.get(industry, [])
        
        return {
            "industry": industry,
            "templates": industry_templates,
            "total_templates": len(industry_templates),
            "default_template": industry_templates[0] if industry_templates else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo templates: {str(e)}")


@router.get("/compliance/status")
async def get_eipd_compliance_status(
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    📊 Estado de compliance EIPDs por tenant
    """
    try:
        # Obtener todas las EIPDs
        eipds = supabase.table("eipds").select("*").eq("tenant_id", tenant_id).execute()
        eipds_data = eipds.data or []
        
        # Obtener RATs que requieren EIPD
        rats_requieren_eipd = supabase.table("rats").select("*").eq("tenant_id", tenant_id).eq("requiere_eipd", True).execute()
        rats_data = rats_requieren_eipd.data or []
        
        # Calcular compliance
        total_requieren_eipd = len(rats_data)
        total_eipds_completadas = len([e for e in eipds_data if e.get("estado") == "COMPLETADA"])
        
        compliance_percentage = (total_eipds_completadas / total_requieren_eipd * 100) if total_requieren_eipd > 0 else 100
        
        # Estadísticas detalladas
        stats = {
            "compliance_percentage": round(compliance_percentage, 2),
            "total_rats_requieren_eipd": total_requieren_eipd,
            "total_eipds_completadas": total_eipds_completadas,
            "pendientes": total_requieren_eipd - total_eipds_completadas,
            "por_nivel_riesgo": {},
            "por_estado": {},
            "consultas_previas_requeridas": 0,
            "tiempo_promedio_completar": "N/A"
        }
        
        # Agrupar por nivel de riesgo y estado
        for eipd in eipds_data:
            riesgo = eipd.get("nivel_riesgo", "BAJO")
            estado = eipd.get("estado", "BORRADOR")
            
            stats["por_nivel_riesgo"][riesgo] = stats["por_nivel_riesgo"].get(riesgo, 0) + 1
            stats["por_estado"][estado] = stats["por_estado"].get(estado, 0) + 1
            
            if eipd.get("requiere_consulta_previa"):
                stats["consultas_previas_requeridas"] += 1
        
        return {
            "tenant_id": tenant_id,
            "compliance_status": stats,
            "timestamp": datetime.utcnow().isoformat(),
            "next_deadlines": await get_upcoming_eipd_deadlines(tenant_id)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo estado compliance: {str(e)}")


async def get_upcoming_eipd_deadlines(tenant_id: str):
    """Helper para obtener próximos deadlines EIPD"""
    try:
        # Obtener EIPDs con deadline próximo
        thirty_days_from_now = (datetime.utcnow() + timedelta(days=30)).isoformat()
        
        upcoming = supabase.table("eipds").select("*").eq("tenant_id", tenant_id).lte("deadline", thirty_days_from_now).order("deadline").execute()
        
        return upcoming.data[:5] if upcoming.data else []
    except:
        return []


@router.post("/{eipd_id}/submit-for-review")
async def submit_eipd_for_review(
    eipd_id: int,
    review_notes: Optional[str] = None,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    📝 Enviar EIPD para revisión DPO
    """
    try:
        # Verificar EIPD existe
        eipd = supabase.table("eipds").select("*").eq("id", eipd_id).eq("tenant_id", tenant_id).single().execute()
        
        if not eipd.data:
            raise HTTPException(status_code=404, detail="EIPD no encontrada")
            
        if eipd.data["estado"] not in ["BORRADOR", "EN_REVISION"]:
            raise HTTPException(status_code=400, detail="EIPD debe estar en borrador para enviar a revisión")
        
        # Actualizar estado
        result = supabase.table("eipds").update({
            "estado": "PENDIENTE_REVISION",
            "submitted_for_review_at": datetime.utcnow().isoformat(),
            "submitted_by": current_user.id,
            "review_notes": review_notes,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", eipd_id).execute()
        
        # Crear notificación para DPO
        notification_data = {
            "tenant_id": tenant_id,
            "type": "EIPD_REVIEW_REQUIRED",
            "title": f"EIPD #{eipd_id} requiere revisión",
            "description": f"EIPD '{eipd.data.get('nombre', 'Sin nombre')}' enviada para revisión DPO",
            "resource_type": "EIPD",
            "resource_id": str(eipd_id),
            "priority": "ALTA" if eipd.data.get("nivel_riesgo") == "ALTO" else "NORMAL",
            "created_at": datetime.utcnow().isoformat(),
            "status": "PENDING"
        }
        
        supabase.table("notifications").insert(notification_data).execute()
        
        return {
            "message": "EIPD enviada para revisión exitosamente",
            "eipd_id": eipd_id,
            "submitted_at": datetime.utcnow().isoformat(),
            "next_step": "Esperando revisión DPO"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error enviando EIPD a revisión: {str(e)}")


@router.post("/{eipd_id}/approve")
async def approve_eipd(
    eipd_id: int,
    approval_notes: Optional[str] = None,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    ✅ Aprobar EIPD (solo DPO)
    """
    try:
        # Verificar permisos DPO
        if not ("dpo.approve" in current_user.permissions or current_user.is_superuser):
            raise HTTPException(status_code=403, detail="Solo DPO puede aprobar EIPDs")
        
        # Obtener EIPD
        eipd = supabase.table("eipds").select("*").eq("id", eipd_id).eq("tenant_id", tenant_id).single().execute()
        
        if not eipd.data:
            raise HTTPException(status_code=404, detail="EIPD no encontrada")
            
        if eipd.data["estado"] != "PENDIENTE_REVISION":
            raise HTTPException(status_code=400, detail="EIPD debe estar en PENDIENTE_REVISION")
        
        # Aprobar
        result = supabase.table("eipds").update({
            "estado": "APROBADA",
            "approved_at": datetime.utcnow().isoformat(),
            "approved_by": current_user.id,
            "approval_notes": approval_notes,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", eipd_id).execute()
        
        # Si la EIPD está asociada a un RAT, actualizar el RAT
        if eipd.data.get("rat_id"):
            supabase.table("rats").update({
                "eipd_completada": True,
                "eipd_approved_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", eipd.data["rat_id"]).execute()
        
        return {
            "message": "EIPD aprobada exitosamente",
            "eipd_id": eipd_id,
            "approved_at": datetime.utcnow().isoformat(),
            "approved_by": current_user.email
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error aprobando EIPD: {str(e)}")


@router.get("/reports/compliance")
async def get_eipd_compliance_report(
    period: str = Query("month", regex="^(week|month|quarter|year)$"),
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    📊 Reporte de compliance EIPDs
    """
    try:
        # Calcular período
        periods = {
            "week": timedelta(days=7),
            "month": timedelta(days=30),
            "quarter": timedelta(days=90),
            "year": timedelta(days=365)
        }
        
        start_date = datetime.utcnow() - periods[period]
        
        # Obtener EIPDs del período
        eipds = supabase.table("eipds").select("*").eq("tenant_id", tenant_id).gte("created_at", start_date.isoformat()).execute()
        eipds_data = eipds.data or []
        
        # Generar reporte
        report = {
            "period": period,
            "start_date": start_date.isoformat(),
            "end_date": datetime.utcnow().isoformat(),
            "total_eipds": len(eipds_data),
            "by_status": {},
            "by_risk_level": {},
            "average_completion_time": 0,
            "compliance_score": 0,
            "recommendations": []
        }
        
        # Agrupar por estado y riesgo
        for eipd in eipds_data:
            estado = eipd.get("estado", "BORRADOR")
            riesgo = eipd.get("nivel_riesgo", "BAJO")
            
            report["by_status"][estado] = report["by_status"].get(estado, 0) + 1
            report["by_risk_level"][riesgo] = report["by_risk_level"].get(riesgo, 0) + 1
        
        # Calcular compliance score
        completed = report["by_status"].get("APROBADA", 0)
        report["compliance_score"] = (completed / len(eipds_data) * 100) if eipds_data else 100
        
        # Generar recomendaciones
        if report["compliance_score"] < 80:
            report["recommendations"].append({
                "priority": "HIGH",
                "issue": "Compliance EIPDs bajo",
                "action": "Acelerar completado de EIPDs pendientes"
            })
        
        if report["by_risk_level"].get("ALTO", 0) > 0:
            report["recommendations"].append({
                "priority": "CRITICAL",
                "issue": f"{report['by_risk_level']['ALTO']} EIPDs de alto riesgo",
                "action": "Priorizar revisión de EIPDs de alto riesgo"
            })
        
        return report
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando reporte: {str(e)}")


# Configuración Supabase
try:
    from supabase import create_client
    import os
    
    supabase = create_client(
        os.getenv("SUPABASE_URL"),
        os.getenv("SUPABASE_ANON_KEY")
    )
except ImportError:
    # Mock para testing
    class MockSupabase:
        def table(self, name):
            return self
        def select(self, cols):
            return self
        def eq(self, col, val):
            return self
        def execute(self):
            return type('obj', (object,), {'data': []})()
    
    supabase = MockSupabase()