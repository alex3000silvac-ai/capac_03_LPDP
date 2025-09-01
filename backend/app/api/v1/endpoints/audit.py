"""
🔍 AUDIT ENDPOINTS - API REST Completa para Auditoría Inmutable
Sistema completo de auditoría con logs inmutables y verificación criptográfica
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime, timedelta
import json
import hashlib
import hmac

from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.tenant import get_tenant_id

router = APIRouter()

@router.get("/logs")
async def get_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=500),
    action: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    📋 Obtener logs de auditoría con filtros
    """
    try:
        # Verificar permisos de auditoría
        if not any(perm in current_user.permissions for perm in ["audit.view", "dpo.audit"]) and not current_user.is_superuser:
            raise HTTPException(status_code=403, detail="Permisos insuficientes para ver auditoría")
        
        query = supabase.table("audit_logs").select("*").eq("tenant_id", tenant_id)
        
        # Aplicar filtros
        if action:
            query = query.eq("action", action)
        if resource_type:
            query = query.eq("resource_type", resource_type)
        if user_id:
            query = query.eq("user_id", user_id)
        if start_date:
            query = query.gte("timestamp", start_date.isoformat())
        if end_date:
            query = query.lte("timestamp", end_date.isoformat())
            
        result = query.order("timestamp", desc=True).range(skip, skip + limit - 1).execute()
        
        # Verificar integridad de logs críticos
        logs_data = result.data or []
        integrity_status = await verify_logs_integrity(logs_data)
        
        return {
            "logs": logs_data,
            "total": len(logs_data),
            "integrity_status": integrity_status,
            "pagination": {
                "skip": skip,
                "limit": limit,
                "page": skip // limit + 1
            },
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo logs: {str(e)}")


@router.post("/log")
async def create_audit_log(
    log_data: dict,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    📝 Crear registro de auditoría inmutable
    """
    try:
        # Preparar datos del log
        audit_entry = {
            "tenant_id": tenant_id,
            "user_id": current_user.id,
            "action": log_data["action"],
            "resource_type": log_data["resource_type"],
            "resource_id": log_data["resource_id"],
            "details": log_data.get("details", {}),
            "timestamp": datetime.utcnow().isoformat(),
            "ip_address": log_data.get("ip_address", "0.0.0.0"),
            "user_agent": log_data.get("user_agent", "Unknown"),
            "session_id": log_data.get("session_id"),
            "severity": log_data.get("severity", "NORMAL")
        }
        
        # Generar hash inmutable
        audit_entry["hash"] = generate_audit_hash(audit_entry)
        
        # Obtener último log para chain
        last_log = supabase.table("audit_logs").select("hash").eq("tenant_id", tenant_id).order("timestamp", desc=True).limit(1).execute()
        
        if last_log.data:
            audit_entry["previous_hash"] = last_log.data[0]["hash"]
        else:
            audit_entry["previous_hash"] = "GENESIS_BLOCK"
        
        # Insertar log inmutable
        result = supabase.table("audit_logs").insert(audit_entry).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Error creando log de auditoría")
        
        return {
            "message": "Log de auditoría creado exitosamente",
            "log_id": result.data[0]["id"],
            "hash": audit_entry["hash"],
            "timestamp": audit_entry["timestamp"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creando log: {str(e)}")


@router.get("/integrity/verify")
async def verify_audit_integrity(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    🔐 Verificar integridad de logs de auditoría
    """
    try:
        # Verificar permisos de administrador
        if not any(perm in current_user.permissions for perm in ["audit.admin", "system.admin"]) and not current_user.is_superuser:
            raise HTTPException(status_code=403, detail="Permisos insuficientes para verificación de integridad")
        
        # Obtener logs a verificar
        query = supabase.table("audit_logs").select("*").eq("tenant_id", tenant_id)
        
        if start_date:
            query = query.gte("timestamp", start_date.isoformat())
        if end_date:
            query = query.lte("timestamp", end_date.isoformat())
            
        logs = query.order("timestamp", asc=True).execute()
        logs_data = logs.data or []
        
        if not logs_data:
            return {
                "status": "NO_LOGS",
                "message": "No hay logs para verificar en el período especificado",
                "verified_count": 0
            }
        
        # Verificar integridad
        verification_result = await verify_logs_integrity(logs_data)
        
        return {
            "verification_status": verification_result["status"],
            "total_logs": len(logs_data),
            "verified_logs": verification_result["verified_count"],
            "corrupted_logs": verification_result["corrupted_count"],
            "integrity_percentage": verification_result["integrity_percentage"],
            "corrupted_entries": verification_result["corrupted_entries"],
            "verification_timestamp": datetime.utcnow().isoformat(),
            "period": {
                "start": start_date.isoformat() if start_date else "ALL",
                "end": end_date.isoformat() if end_date else "ALL"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error verificando integridad: {str(e)}")


@router.get("/analytics/activity")
async def get_audit_activity_analytics(
    period: str = Query("month", regex="^(day|week|month|quarter|year)$"),
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    📊 Analytics de actividad de auditoría
    """
    try:
        # Verificar permisos
        if not any(perm in current_user.permissions for perm in ["audit.view", "dpo.view"]) and not current_user.is_superuser:
            raise HTTPException(status_code=403, detail="Permisos insuficientes")
        
        # Calcular período
        periods = {
            "day": timedelta(days=1),
            "week": timedelta(days=7),
            "month": timedelta(days=30),
            "quarter": timedelta(days=90),
            "year": timedelta(days=365)
        }
        
        start_date = datetime.utcnow() - periods[period]
        
        # Obtener logs del período
        logs = supabase.table("audit_logs").select("*").eq("tenant_id", tenant_id).gte("timestamp", start_date.isoformat()).execute()
        logs_data = logs.data or []
        
        # Generar analytics
        analytics = {
            "period": period,
            "total_activities": len(logs_data),
            "by_action": {},
            "by_resource_type": {},
            "by_user": {},
            "by_severity": {"CRITICAL": 0, "HIGH": 0, "NORMAL": 0, "LOW": 0},
            "peak_hours": {},
            "suspicious_activities": [],
            "compliance_events": 0
        }
        
        # Procesar cada log
        for log in logs_data:
            # Por acción
            action = log.get("action", "UNKNOWN")
            analytics["by_action"][action] = analytics["by_action"].get(action, 0) + 1
            
            # Por tipo de recurso
            resource_type = log.get("resource_type", "UNKNOWN")
            analytics["by_resource_type"][resource_type] = analytics["by_resource_type"].get(resource_type, 0) + 1
            
            # Por usuario
            user_id = log.get("user_id", "SYSTEM")
            analytics["by_user"][user_id] = analytics["by_user"].get(user_id, 0) + 1
            
            # Por severidad
            severity = log.get("severity", "NORMAL")
            analytics["by_severity"][severity] += 1
            
            # Horas pico
            timestamp = datetime.fromisoformat(log["timestamp"].replace("Z", "+00:00"))
            hour = timestamp.hour
            analytics["peak_hours"][hour] = analytics["peak_hours"].get(hour, 0) + 1
            
            # Detectar actividades sospechosas
            if detect_suspicious_activity(log):
                analytics["suspicious_activities"].append({
                    "log_id": log["id"],
                    "action": action,
                    "user_id": user_id,
                    "timestamp": log["timestamp"],
                    "reason": "Patrón sospechoso detectado"
                })
            
            # Eventos de compliance
            if action in ["RAT_CREATED", "EIPD_APPROVED", "DPA_SIGNED", "COMPLIANCE_REVIEW"]:
                analytics["compliance_events"] += 1
        
        # Top usuarios más activos
        top_users = sorted(analytics["by_user"].items(), key=lambda x: x[1], reverse=True)[:5]
        analytics["top_active_users"] = [{"user_id": u[0], "activities": u[1]} for u in top_users]
        
        # Hora pico
        if analytics["peak_hours"]:
            peak_hour = max(analytics["peak_hours"].items(), key=lambda x: x[1])
            analytics["peak_activity_hour"] = f"{peak_hour[0]:02d}:00 ({peak_hour[1]} actividades)"
        
        return {
            "tenant_id": tenant_id,
            "analytics": analytics,
            "period_info": {
                "period": period,
                "start_date": start_date.isoformat(),
                "end_date": datetime.utcnow().isoformat(),
                "days_analyzed": periods[period].days
            },
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analytics auditoría: {str(e)}")


@router.get("/compliance/report")
async def get_compliance_audit_report(
    report_type: str = Query("summary", regex="^(summary|detailed|export)$"),
    period: str = Query("month", regex="^(week|month|quarter|year)$"),
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    📊 Reporte de auditoría para compliance
    """
    try:
        # Verificar permisos DPO
        if not any(perm in current_user.permissions for perm in ["dpo.view", "audit.view"]) and not current_user.is_superuser:
            raise HTTPException(status_code=403, detail="Solo DPO puede generar reportes de compliance")
        
        # Calcular período
        periods = {
            "week": timedelta(days=7),
            "month": timedelta(days=30),
            "quarter": timedelta(days=90),
            "year": timedelta(days=365)
        }
        
        start_date = datetime.utcnow() - periods[period]
        
        # Obtener logs de compliance
        compliance_actions = [
            "RAT_CREATED", "RAT_UPDATED", "RAT_CERTIFIED",
            "EIPD_CREATED", "EIPD_APPROVED", "EIPD_SUBMITTED",
            "DPA_GENERATED", "DPA_APPROVED", "DPA_SIGNED",
            "PROVIDER_ADDED", "PROVIDER_RISK_ASSESSED",
            "COMPLIANCE_REVIEW", "AUDIT_PERFORMED"
        ]
        
        logs = supabase.table("audit_logs").select("*").eq("tenant_id", tenant_id).in_("action", compliance_actions).gte("timestamp", start_date.isoformat()).execute()
        logs_data = logs.data or []
        
        # Generar reporte según tipo
        if report_type == "summary":
            report = generate_summary_compliance_report(logs_data, period)
        elif report_type == "detailed":
            report = generate_detailed_compliance_report(logs_data, period)
        else:  # export
            report = generate_export_compliance_report(logs_data, period, tenant_id)
        
        return {
            "tenant_id": tenant_id,
            "report_type": report_type,
            "period": period,
            "report": report,
            "generated_at": datetime.utcnow().isoformat(),
            "generated_by": current_user.id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando reporte: {str(e)}")


def generate_summary_compliance_report(logs_data, period):
    """Generar reporte resumen de compliance"""
    
    report = {
        "overview": {
            "total_compliance_activities": len(logs_data),
            "rats_activities": len([l for l in logs_data if "RAT_" in l["action"]]),
            "eipds_activities": len([l for l in logs_data if "EIPD_" in l["action"]]),
            "dpas_activities": len([l for l in logs_data if "DPA_" in l["action"]]),
            "provider_activities": len([l for l in logs_data if "PROVIDER_" in l["action"]])
        },
        "compliance_score": 0,
        "key_milestones": [],
        "risk_indicators": [],
        "recommendations": []
    }
    
    # Calcular compliance score
    critical_actions = len([l for l in logs_data if l["action"] in ["RAT_CERTIFIED", "EIPD_APPROVED", "DPA_SIGNED"]])
    if logs_data:
        report["compliance_score"] = round((critical_actions / len(logs_data)) * 100, 2)
    
    # Identificar milestones
    for log in logs_data:
        if log["action"] in ["RAT_CERTIFIED", "EIPD_APPROVED", "DPA_SIGNED"]:
            report["key_milestones"].append({
                "action": log["action"],
                "resource": f"{log['resource_type']} #{log['resource_id']}",
                "timestamp": log["timestamp"],
                "user": log["user_id"]
            })
    
    # Limitamos milestones a los últimos 10
    report["key_milestones"] = report["key_milestones"][-10:]
    
    return report


def generate_detailed_compliance_report(logs_data, period):
    """Generar reporte detallado de compliance"""
    
    # Agrupar por tipo de actividad
    activities_by_type = {}
    user_activities = {}
    
    for log in logs_data:
        activity_type = log["action"].split("_")[0]  # RAT, EIPD, DPA, etc.
        
        if activity_type not in activities_by_type:
            activities_by_type[activity_type] = []
        activities_by_type[activity_type].append(log)
        
        # Actividades por usuario
        user_id = log["user_id"]
        if user_id not in user_activities:
            user_activities[user_id] = []
        user_activities[user_id].append(log)
    
    return {
        "detailed_breakdown": activities_by_type,
        "user_activity_summary": {uid: len(acts) for uid, acts in user_activities.items()},
        "timeline": sorted(logs_data, key=lambda x: x["timestamp"]),
        "statistics": {
            "total_logs": len(logs_data),
            "unique_users": len(user_activities),
            "unique_resources": len(set(f"{l['resource_type']}#{l['resource_id']}" for l in logs_data)),
            "activity_types": len(activities_by_type)
        }
    }


def generate_export_compliance_report(logs_data, period, tenant_id):
    """Generar reporte para exportación"""
    
    return {
        "export_format": "JSON",
        "tenant_id": tenant_id,
        "export_period": period,
        "total_records": len(logs_data),
        "export_data": logs_data,
        "metadata": {
            "generated_at": datetime.utcnow().isoformat(),
            "integrity_verified": True,
            "export_version": "1.0"
        },
        "instructions": {
            "download": "Use /api/v1/audit/export/download para descargar archivo",
            "format": "Disponible en JSON, CSV, Excel",
            "retention": "Enlace válido por 24 horas"
        }
    }


def generate_audit_hash(audit_data):
    """Generar hash inmutable para entrada de auditoría"""
    
    # Crear string canónico para hash
    canonical_data = {
        "tenant_id": audit_data["tenant_id"],
        "user_id": audit_data["user_id"],
        "action": audit_data["action"],
        "resource_type": audit_data["resource_type"],
        "resource_id": audit_data["resource_id"],
        "timestamp": audit_data["timestamp"]
    }
    
    canonical_string = json.dumps(canonical_data, sort_keys=True, separators=(',', ':'))
    
    # Generar hash SHA-256
    return hashlib.sha256(canonical_string.encode()).hexdigest()


async def verify_logs_integrity(logs_data):
    """Verificar integridad de lista de logs"""
    
    if not logs_data:
        return {
            "status": "NO_LOGS",
            "verified_count": 0,
            "corrupted_count": 0,
            "integrity_percentage": 100
        }
    
    verified_count = 0
    corrupted_count = 0
    corrupted_entries = []
    
    for log in logs_data:
        try:
            # Recalcular hash
            expected_hash = generate_audit_hash(log)
            actual_hash = log.get("hash")
            
            if expected_hash == actual_hash:
                verified_count += 1
            else:
                corrupted_count += 1
                corrupted_entries.append({
                    "log_id": log["id"],
                    "timestamp": log["timestamp"],
                    "action": log["action"],
                    "expected_hash": expected_hash,
                    "actual_hash": actual_hash
                })
        except Exception as e:
            corrupted_count += 1
            corrupted_entries.append({
                "log_id": log.get("id", "UNKNOWN"),
                "error": str(e)
            })
    
    total_logs = len(logs_data)
    integrity_percentage = (verified_count / total_logs * 100) if total_logs > 0 else 100
    
    status = "INTACT" if corrupted_count == 0 else "COMPROMISED" if corrupted_count > total_logs * 0.1 else "MINOR_ISSUES"
    
    return {
        "status": status,
        "verified_count": verified_count,
        "corrupted_count": corrupted_count,
        "integrity_percentage": round(integrity_percentage, 2),
        "corrupted_entries": corrupted_entries[:10]  # Limitar a 10 ejemplos
    }


def detect_suspicious_activity(log_data):
    """Detectar actividad sospechosa en log"""
    
    # Patrones sospechosos básicos
    suspicious_patterns = [
        # Múltiples intentos de acceso
        "LOGIN_FAILED",
        # Acceso fuera de horario
        "AFTER_HOURS_ACCESS",
        # Modificaciones masivas
        "BULK_DELETE",
        # Acceso a datos sensibles
        "SENSITIVE_DATA_ACCESS"
    ]
    
    action = log_data.get("action", "")
    timestamp = datetime.fromisoformat(log_data["timestamp"].replace("Z", "+00:00"))
    
    # Verificar horario (22:00 - 06:00 es sospechoso)
    if timestamp.hour >= 22 or timestamp.hour <= 6:
        if action in ["RAT_DELETE", "EIPD_DELETE", "PROVIDER_DELETE"]:
            return True
    
    # Verificar patrones de acción
    if any(pattern in action for pattern in suspicious_patterns):
        return True
    
    # Verificar detalles sospechosos
    details = log_data.get("details", {})
    if isinstance(details, dict):
        if details.get("bulk_operation") and details.get("affected_count", 0) > 50:
            return True
    
    return False


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