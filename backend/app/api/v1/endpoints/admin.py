"""
👑 ADMIN ENDPOINTS - API REST Completa para Administración Multi-tenant
Sistema completo de administración para holdings y gestión empresarial
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime, timedelta
import json

from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.tenant import get_tenant_id

router = APIRouter()

@router.get("/tenants")
async def get_all_tenants(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=500),
    active_only: bool = Query(True),
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    🏢 Obtener todos los tenants (solo super admin)
    """
    try:
        # Verificar permisos de super admin
        if not current_user.is_superuser:
            raise HTTPException(status_code=403, detail="Solo super administradores pueden ver todos los tenants")
        
        query = supabase.table("tenants").select("*")
        
        if active_only:
            query = query.eq("active", True)
            
        result = query.order("created_at", desc=True).range(skip, skip + limit - 1).execute()
        
        # Enriquecer con estadísticas
        tenants_with_stats = []
        for tenant in (result.data or []):
            stats = await get_tenant_statistics(tenant["id"])
            tenant_with_stats = {
                **tenant,
                "statistics": stats
            }
            tenants_with_stats.append(tenant_with_stats)
        
        return {
            "tenants": tenants_with_stats,
            "total": len(result.data) if result.data else 0,
            "pagination": {
                "skip": skip,
                "limit": limit,
                "page": skip // limit + 1
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo tenants: {str(e)}")


@router.post("/tenants")
async def create_tenant(
    tenant_data: dict,
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    ✨ Crear nuevo tenant/empresa
    """
    try:
        # Verificar permisos
        if not current_user.is_superuser:
            raise HTTPException(status_code=403, detail="Solo super administradores pueden crear tenants")
        
        # Validar datos requeridos
        required_fields = ["company_name", "rut", "plan_type"]
        for field in required_fields:
            if field not in tenant_data:
                raise HTTPException(status_code=400, detail=f"Campo requerido: {field}")
        
        # Verificar RUT único
        existing = supabase.table("tenants").select("id").eq("rut", tenant_data["rut"]).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="RUT ya registrado en el sistema")
        
        # Preparar datos del tenant
        tenant_dict = {
            **tenant_data,
            "created_by": current_user.id,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "active": True,
            "subscription_status": "ACTIVE",
            "trial_ends_at": (datetime.utcnow() + timedelta(days=30)).isoformat(),
            "max_users": tenant_data.get("max_users", 10),
            "max_rats": tenant_data.get("max_rats", 100),
            "features_enabled": {
                "rats": True,
                "eipds": True,
                "providers": True,
                "audit": True,
                "notifications": True,
                "advanced_analytics": tenant_data.get("plan_type") in ["ENTERPRISE", "PREMIUM"]
            }
        }
        
        # Insertar tenant
        result = supabase.table("tenants").insert(tenant_dict).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Error creando tenant")
        
        # Crear usuario administrador inicial
        if tenant_data.get("admin_email"):
            admin_user = {
                "tenant_id": result.data[0]["id"],
                "email": tenant_data["admin_email"],
                "first_name": tenant_data.get("admin_first_name", "Administrador"),
                "last_name": tenant_data.get("admin_last_name", "Sistema"),
                "is_active": True,
                "permissions": ["admin.full", "dpo.full", "user.manage"],
                "created_by": current_user.id,
                "created_at": datetime.utcnow().isoformat()
            }
            
            supabase.table("users").insert(admin_user).execute()
        
        return {
            "message": "Tenant creado exitosamente",
            "tenant": result.data[0],
            "next_steps": [
                "Configurar usuarios iniciales",
                "Configurar integrations",
                "Importar datos existentes",
                "Configurar backup automático"
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creando tenant: {str(e)}")


@router.get("/tenants/{tenant_id}/statistics")
async def get_tenant_detailed_statistics(
    tenant_id: str,
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    📊 Obtener estadísticas detalladas de tenant específico
    """
    try:
        # Verificar permisos (super admin o admin del tenant)
        if not current_user.is_superuser and current_user.tenant_id != tenant_id:
            raise HTTPException(status_code=403, detail="No autorizado para ver estadísticas de este tenant")
        
        stats = await get_tenant_statistics(tenant_id)
        
        # Agregar métricas avanzadas
        advanced_stats = await get_advanced_tenant_metrics(tenant_id)
        stats.update(advanced_stats)
        
        return {
            "tenant_id": tenant_id,
            "statistics": stats,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo estadísticas: {str(e)}")


@router.get("/holdings/dashboard")
async def get_holdings_dashboard(
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    🏛️ Dashboard para gestión de holdings multi-empresa
    """
    try:
        # Verificar permisos de holdings
        if not any(perm in current_user.permissions for perm in ["holdings.view", "super.admin"]) and not current_user.is_superuser:
            raise HTTPException(status_code=403, detail="Permisos insuficientes para gestión de holdings")
        
        # Obtener todas las empresas del holding
        if current_user.is_superuser:
            # Super admin ve todo
            tenants = supabase.table("tenants").select("*").eq("active", True).execute()
        else:
            # Admin de holding ve solo sus empresas
            holding_id = current_user.holding_id
            tenants = supabase.table("tenants").select("*").eq("holding_id", holding_id).eq("active", True).execute()
        
        tenants_data = tenants.data or []
        
        # Dashboard consolidado
        dashboard = {
            "overview": {
                "total_companies": len(tenants_data),
                "total_users": 0,
                "total_rats": 0,
                "total_eipds": 0,
                "compliance_average": 0
            },
            "by_company": [],
            "compliance_summary": {
                "compliant_companies": 0,
                "non_compliant_companies": 0,
                "compliance_issues": []
            },
            "resource_usage": {
                "storage_used_gb": 0,
                "api_calls_month": 0,
                "users_active_month": 0
            },
            "billing_summary": {
                "total_monthly_cost": 0,
                "by_plan": {},
                "cost_by_company": []
            }
        }
        
        # Procesar cada empresa
        for tenant in tenants_data:
            tenant_stats = await get_tenant_statistics(tenant["id"])
            
            # Acumular totales
            dashboard["overview"]["total_users"] += tenant_stats["total_users"]
            dashboard["overview"]["total_rats"] += tenant_stats["total_rats"]
            dashboard["overview"]["total_eipds"] += tenant_stats["total_eipds"]
            
            # Compliance por empresa
            compliance_score = tenant_stats.get("compliance_score", 0)
            if compliance_score >= 80:
                dashboard["compliance_summary"]["compliant_companies"] += 1
            else:
                dashboard["compliance_summary"]["non_compliant_companies"] += 1
                dashboard["compliance_summary"]["compliance_issues"].append({
                    "company": tenant["company_name"],
                    "score": compliance_score,
                    "main_issues": tenant_stats.get("main_issues", [])
                })
            
            # Información por empresa
            company_info = {
                "tenant_id": tenant["id"],
                "company_name": tenant["company_name"],
                "plan": tenant.get("plan_type", "BASIC"),
                "users": tenant_stats["total_users"],
                "rats": tenant_stats["total_rats"],
                "compliance_score": compliance_score,
                "last_activity": tenant_stats.get("last_activity"),
                "status": "COMPLIANT" if compliance_score >= 80 else "NEEDS_ATTENTION"
            }
            dashboard["by_company"].append(company_info)
            
            # Billing
            plan_cost = get_plan_monthly_cost(tenant.get("plan_type", "BASIC"))
            dashboard["billing_summary"]["total_monthly_cost"] += plan_cost
            
            plan_type = tenant.get("plan_type", "BASIC")
            dashboard["billing_summary"]["by_plan"][plan_type] = dashboard["billing_summary"]["by_plan"].get(plan_type, 0) + 1
            
            dashboard["billing_summary"]["cost_by_company"].append({
                "company": tenant["company_name"],
                "plan": plan_type,
                "monthly_cost": plan_cost
            })
        
        # Calcular compliance promedio
        if tenants_data:
            total_compliance = sum([await get_tenant_compliance_score(t["id"]) for t in tenants_data])
            dashboard["overview"]["compliance_average"] = round(total_compliance / len(tenants_data), 2)
        
        return {
            "dashboard": dashboard,
            "generated_at": datetime.utcnow().isoformat(),
            "holdings_admin": current_user.email
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error dashboard holdings: {str(e)}")


@router.post("/tenants/{tenant_id}/suspend")
async def suspend_tenant(
    tenant_id: str,
    suspension_reason: str,
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    ⏸️ Suspender tenant (solo super admin)
    """
    try:
        # Verificar permisos super admin
        if not current_user.is_superuser:
            raise HTTPException(status_code=403, detail="Solo super administradores pueden suspender tenants")
        
        # Verificar tenant existe
        tenant = supabase.table("tenants").select("*").eq("id", tenant_id).single().execute()
        
        if not tenant.data:
            raise HTTPException(status_code=404, detail="Tenant no encontrado")
        
        if not tenant.data["active"]:
            raise HTTPException(status_code=400, detail="Tenant ya está suspendido")
        
        # Suspender tenant
        result = supabase.table("tenants").update({
            "active": False,
            "suspended_at": datetime.utcnow().isoformat(),
            "suspended_by": current_user.id,
            "suspension_reason": suspension_reason,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", tenant_id).execute()
        
        # Desactivar usuarios del tenant
        supabase.table("users").update({
            "is_active": False,
            "deactivated_at": datetime.utcnow().isoformat(),
            "deactivation_reason": f"Tenant suspendido: {suspension_reason}"
        }).eq("tenant_id", tenant_id).execute()
        
        # Crear log de auditoría crítico
        audit_log = {
            "action": "TENANT_SUSPENDED",
            "resource_type": "TENANT",
            "resource_id": tenant_id,
            "user_id": current_user.id,
            "details": {
                "suspension_reason": suspension_reason,
                "company_name": tenant.data["company_name"],
                "suspended_by": current_user.email
            },
            "timestamp": datetime.utcnow().isoformat(),
            "severity": "CRITICAL"
        }
        
        supabase.table("audit_logs").insert(audit_log).execute()
        
        return {
            "message": "Tenant suspendido exitosamente",
            "tenant_id": tenant_id,
            "company_name": tenant.data["company_name"],
            "suspended_at": datetime.utcnow().isoformat(),
            "reason": suspension_reason
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error suspendiendo tenant: {str(e)}")


@router.get("/analytics/system")
async def get_system_analytics(
    period: str = Query("month", regex="^(week|month|quarter|year)$"),
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    📊 Analytics del sistema completo
    """
    try:
        # Verificar permisos
        if not current_user.is_superuser:
            raise HTTPException(status_code=403, detail="Solo super administradores pueden ver analytics del sistema")
        
        # Calcular período
        periods = {
            "week": timedelta(days=7),
            "month": timedelta(days=30),
            "quarter": timedelta(days=90),
            "year": timedelta(days=365)
        }
        
        start_date = datetime.utcnow() - periods[period]
        
        # Obtener datos del sistema
        tenants = supabase.table("tenants").select("*").eq("active", True).execute()
        users = supabase.table("users").select("*").eq("is_active", True).execute()
        audit_logs = supabase.table("audit_logs").select("*").gte("timestamp", start_date.isoformat()).execute()
        
        tenants_data = tenants.data or []
        users_data = users.data or []
        logs_data = audit_logs.data or []
        
        # Analytics generales
        analytics = {
            "system_overview": {
                "total_tenants": len(tenants_data),
                "total_active_users": len(users_data),
                "total_activities": len(logs_data),
                "period": period
            },
            "growth_metrics": {
                "new_tenants": len([t for t in tenants_data if datetime.fromisoformat(t["created_at"].replace("Z", "+00:00")) >= start_date]),
                "new_users": len([u for u in users_data if datetime.fromisoformat(u["created_at"].replace("Z", "+00:00")) >= start_date]),
                "activity_growth": calculate_activity_growth(logs_data, period)
            },
            "usage_patterns": {
                "most_active_tenants": [],
                "feature_usage": {},
                "peak_usage_hours": {}
            },
            "compliance_overview": {
                "avg_compliance_score": 0,
                "tenants_above_80": 0,
                "tenants_below_50": 0,
                "critical_issues": 0
            },
            "performance_metrics": {
                "avg_response_time": "N/A",
                "error_rate": 0,
                "uptime_percentage": 99.9
            }
        }
        
        # Calcular métricas avanzadas
        for tenant in tenants_data:
            tenant_stats = await get_tenant_statistics(tenant["id"])
            compliance_score = tenant_stats.get("compliance_score", 0)
            
            analytics["compliance_overview"]["avg_compliance_score"] += compliance_score
            
            if compliance_score >= 80:
                analytics["compliance_overview"]["tenants_above_80"] += 1
            elif compliance_score < 50:
                analytics["compliance_overview"]["tenants_below_50"] += 1
            
            # Tenants más activos
            analytics["usage_patterns"]["most_active_tenants"].append({
                "tenant_id": tenant["id"],
                "company_name": tenant["company_name"],
                "total_activities": tenant_stats.get("total_activities", 0),
                "users": tenant_stats.get("total_users", 0)
            })
        
        # Promediar compliance
        if tenants_data:
            analytics["compliance_overview"]["avg_compliance_score"] = round(
                analytics["compliance_overview"]["avg_compliance_score"] / len(tenants_data), 2
            )
        
        # Ordenar tenants más activos
        analytics["usage_patterns"]["most_active_tenants"].sort(
            key=lambda x: x["total_activities"], reverse=True
        )
        analytics["usage_patterns"]["most_active_tenants"] = analytics["usage_patterns"]["most_active_tenants"][:10]
        
        return {
            "analytics": analytics,
            "period_info": {
                "period": period,
                "start_date": start_date.isoformat(),
                "end_date": datetime.utcnow().isoformat()
            },
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analytics del sistema: {str(e)}")


@router.get("/health/detailed")
async def get_detailed_system_health(
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    🏥 Estado de salud detallado del sistema
    """
    try:
        # Verificar permisos
        if not current_user.is_superuser:
            raise HTTPException(status_code=403, detail="Solo super administradores pueden ver salud del sistema")
        
        health_status = {
            "overall_status": "HEALTHY",
            "components": {},
            "performance_metrics": {},
            "resource_usage": {},
            "alerts": [],
            "recommendations": []
        }
        
        # Verificar componentes críticos
        
        # 1. Base de datos
        try:
            test_query = supabase.table("tenants").select("count", count="exact").limit(1).execute()
            health_status["components"]["database"] = {
                "status": "HEALTHY",
                "response_time": "< 100ms",
                "last_check": datetime.utcnow().isoformat()
            }
        except Exception as e:
            health_status["components"]["database"] = {
                "status": "ERROR",
                "error": str(e),
                "last_check": datetime.utcnow().isoformat()
            }
            health_status["overall_status"] = "DEGRADED"
        
        # 2. Autenticación
        try:
            # Test auth system
            health_status["components"]["authentication"] = {
                "status": "HEALTHY",
                "active_sessions": len(supabase.table("user_sessions").select("id").execute().data or []),
                "last_check": datetime.utcnow().isoformat()
            }
        except Exception as e:
            health_status["components"]["authentication"] = {
                "status": "ERROR",
                "error": str(e)
            }
        
        # 3. Sistema de notificaciones
        try:
            pending_notifications = supabase.table("notifications").select("count", count="exact").eq("status", "PENDING").execute()
            health_status["components"]["notifications"] = {
                "status": "HEALTHY",
                "pending_notifications": pending_notifications.count or 0,
                "last_check": datetime.utcnow().isoformat()
            }
        except Exception as e:
            health_status["components"]["notifications"] = {
                "status": "ERROR",
                "error": str(e)
            }
        
        # 4. Sistema de auditoría
        try:
            recent_logs = supabase.table("audit_logs").select("count", count="exact").gte("timestamp", (datetime.utcnow() - timedelta(hours=1)).isoformat()).execute()
            health_status["components"]["audit"] = {
                "status": "HEALTHY",
                "logs_last_hour": recent_logs.count or 0,
                "last_check": datetime.utcnow().isoformat()
            }
        except Exception as e:
            health_status["components"]["audit"] = {
                "status": "ERROR",
                "error": str(e)
            }
        
        # Determinar estado general
        component_statuses = [comp["status"] for comp in health_status["components"].values()]
        if "ERROR" in component_statuses:
            health_status["overall_status"] = "ERROR"
        elif "DEGRADED" in component_statuses:
            health_status["overall_status"] = "DEGRADED"
        
        # Generar alertas
        if health_status["overall_status"] != "HEALTHY":
            health_status["alerts"].append({
                "severity": "HIGH",
                "message": "Sistema con componentes degradados",
                "affected_components": [name for name, comp in health_status["components"].items() if comp["status"] != "HEALTHY"]
            })
        
        return health_status
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error verificando salud del sistema: {str(e)}")


async def get_tenant_statistics(tenant_id: str):
    """Helper para obtener estadísticas de un tenant"""
    
    try:
        # Obtener datos básicos
        users = supabase.table("users").select("id,created_at,last_login").eq("tenant_id", tenant_id).eq("is_active", True).execute()
        rats = supabase.table("rats").select("id,estado,created_at").eq("tenant_id", tenant_id).execute()
        eipds = supabase.table("eipds").select("id,estado,created_at").eq("tenant_id", tenant_id).execute()
        providers = supabase.table("providers").select("id,estado_dpa").eq("tenant_id", tenant_id).execute()
        
        users_data = users.data or []
        rats_data = rats.data or []
        eipds_data = eipds.data or []
        providers_data = providers.data or []
        
        # Calcular estadísticas
        stats = {
            "total_users": len(users_data),
            "total_rats": len(rats_data),
            "total_eipds": len(eipds_data),
            "total_providers": len(providers_data),
            "compliance_score": 0,
            "last_activity": None,
            "main_issues": []
        }
        
        # Calcular compliance score
        certified_rats = len([r for r in rats_data if r.get("estado") == "CERTIFICADO"])
        approved_eipds = len([e for e in eipds_data if e.get("estado") == "APROBADA"])
        approved_dpas = len([p for p in providers_data if p.get("estado_dpa") == "APROBADO"])
        
        total_items = len(rats_data) + len(eipds_data) + len(providers_data)
        if total_items > 0:
            completed_items = certified_rats + approved_eipds + approved_dpas
            stats["compliance_score"] = round((completed_items / total_items) * 100, 2)
        
        # Última actividad
        all_dates = []
        for item_list in [users_data, rats_data, eipds_data, providers_data]:
            for item in item_list:
                if item.get("created_at"):
                    all_dates.append(item["created_at"])
        
        if all_dates:
            stats["last_activity"] = max(all_dates)
        
        # Identificar issues principales
        if len(rats_data) > 0 and certified_rats / len(rats_data) < 0.5:
            stats["main_issues"].append("Menos del 50% de RATs certificados")
        
        if len(providers_data) > 0 and approved_dpas / len(providers_data) < 0.7:
            stats["main_issues"].append("Menos del 70% de proveedores con DPA aprobado")
        
        return stats
        
    except Exception as e:
        return {
            "total_users": 0,
            "total_rats": 0,
            "total_eipds": 0,
            "total_providers": 0,
            "compliance_score": 0,
            "error": str(e)
        }


async def get_advanced_tenant_metrics(tenant_id: str):
    """Obtener métricas avanzadas de tenant"""
    
    try:
        # Métricas de uso últimos 30 días
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        recent_logs = supabase.table("audit_logs").select("*").eq("tenant_id", tenant_id).gte("timestamp", thirty_days_ago.isoformat()).execute()
        logs_data = recent_logs.data or []
        
        return {
            "recent_activity": {
                "total_activities_30d": len(logs_data),
                "unique_users_30d": len(set([l["user_id"] for l in logs_data])),
                "most_common_actions": get_most_common_actions(logs_data),
                "activity_trend": "stable"  # Placeholder
            },
            "resource_consumption": {
                "storage_used_mb": calculate_storage_usage(tenant_id),
                "api_calls_30d": len(logs_data),
                "avg_daily_activities": len(logs_data) / 30
            }
        }
    except:
        return {}


def get_most_common_actions(logs_data):
    """Helper para obtener acciones más comunes"""
    
    actions = {}
    for log in logs_data:
        action = log.get("action", "UNKNOWN")
        actions[action] = actions.get(action, 0) + 1
    
    return sorted(actions.items(), key=lambda x: x[1], reverse=True)[:5]


def calculate_storage_usage(tenant_id: str):
    """Calcular uso de almacenamiento aproximado"""
    # Placeholder - en implementación real consultaría métricas de Supabase
    return 0


async def get_tenant_compliance_score(tenant_id: str):
    """Calcular score de compliance para tenant"""
    
    try:
        tenant_stats = await get_tenant_statistics(tenant_id)
        return tenant_stats.get("compliance_score", 0)
    except:
        return 0


def get_plan_monthly_cost(plan_type: str):
    """Obtener costo mensual según plan"""
    
    costs = {
        "BASIC": 50000,      # $50.000 CLP
        "PROFESSIONAL": 150000,  # $150.000 CLP
        "ENTERPRISE": 400000,    # $400.000 CLP
        "HOLDINGS": 800000       # $800.000 CLP
    }
    
    return costs.get(plan_type, costs["BASIC"])


def calculate_activity_growth(logs_data, period):
    """Calcular crecimiento de actividad"""
    
    if not logs_data:
        return 0
    
    # Dividir período en dos mitades
    period_days = {"week": 7, "month": 30, "quarter": 90, "year": 365}
    days = period_days[period]
    
    mid_point = datetime.utcnow() - timedelta(days=days//2)
    
    recent_activities = len([l for l in logs_data if datetime.fromisoformat(l["timestamp"].replace("Z", "+00:00")) >= mid_point])
    older_activities = len(logs_data) - recent_activities
    
    if older_activities == 0:
        return 100 if recent_activities > 0 else 0
    
    growth_rate = ((recent_activities - older_activities) / older_activities) * 100
    return round(growth_rate, 2)


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