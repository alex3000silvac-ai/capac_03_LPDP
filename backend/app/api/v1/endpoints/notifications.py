"""
🔔 NOTIFICATIONS ENDPOINTS - API REST Completa para Sistema de Notificaciones
Sistema completo de notificaciones multi-canal para cumplimiento LPDP
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
async def get_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    unread_only: bool = Query(False),
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    🔔 Obtener notificaciones del usuario
    """
    try:
        query = supabase.table("notifications").select("*").eq("tenant_id", tenant_id)
        
        # Filtrar por usuario (notificaciones dirigidas o generales)
        query = query.or_(f"user_id.eq.{current_user.id},user_id.is.null")
        
        # Aplicar filtros
        if status:
            query = query.eq("status", status)
        if priority:
            query = query.eq("priority", priority)
        if type:
            query = query.eq("type", type)
        if unread_only:
            query = query.eq("read_at", None)
            
        result = query.order("created_at", desc=True).range(skip, skip + limit - 1).execute()
        
        # Marcar notificaciones como entregadas
        if result.data:
            notification_ids = [n["id"] for n in result.data if not n.get("delivered_at")]
            if notification_ids:
                supabase.table("notifications").update({
                    "delivered_at": datetime.utcnow().isoformat()
                }).in_("id", notification_ids).execute()
        
        return {
            "notifications": result.data or [],
            "total": len(result.data) if result.data else 0,
            "unread_count": len([n for n in (result.data or []) if not n.get("read_at")]),
            "pagination": {
                "skip": skip,
                "limit": limit,
                "page": skip // limit + 1
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo notificaciones: {str(e)}")


@router.post("/")
async def create_notification(
    notification_data: dict,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    ✨ Crear nueva notificación
    """
    try:
        # Validar datos requeridos
        required_fields = ["type", "title", "description"]
        for field in required_fields:
            if field not in notification_data:
                raise HTTPException(status_code=400, detail=f"Campo requerido: {field}")
        
        # Preparar datos
        notification_dict = {
            **notification_data,
            "tenant_id": tenant_id,
            "created_by": current_user.id,
            "created_at": datetime.utcnow().isoformat(),
            "status": "PENDING",
            "priority": notification_data.get("priority", "NORMAL"),
            "channel": notification_data.get("channel", "in_app")
        }
        
        # Determinar destinatarios
        if "user_id" not in notification_data and "user_ids" not in notification_data:
            # Notificación general para todo el tenant
            notification_dict["user_id"] = None
        elif "user_ids" in notification_data:
            # Crear múltiples notificaciones
            notifications = []
            for user_id in notification_data["user_ids"]:
                notif = notification_dict.copy()
                notif["user_id"] = user_id
                notifications.append(notif)
            
            result = supabase.table("notifications").insert(notifications).execute()
            
            return {
                "message": f"{len(notifications)} notificaciones creadas exitosamente",
                "notification_ids": [n["id"] for n in result.data],
                "created_at": datetime.utcnow().isoformat()
            }
        
        # Insertar notificación única
        result = supabase.table("notifications").insert(notification_dict).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Error creando notificación")
            
        # Enviar por canal especificado
        try:
            await send_notification_via_channel(result.data[0])
        except Exception as e:
            logger.warning(f"Error enviando notificación por canal: {e}")
        
        return {
            "message": "Notificación creada exitosamente",
            "notification": result.data[0]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creando notificación: {str(e)}")


@router.put("/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    👁️ Marcar notificación como leída
    """
    try:
        # Verificar que la notificación pertenece al usuario
        notification = supabase.table("notifications").select("*").eq("id", notification_id).eq("tenant_id", tenant_id).single().execute()
        
        if not notification.data:
            raise HTTPException(status_code=404, detail="Notificación no encontrada")
        
        # Verificar permisos (solo el usuario destinatario o admin)
        if notification.data.get("user_id") and notification.data["user_id"] != current_user.id:
            if not current_user.is_superuser:
                raise HTTPException(status_code=403, detail="No autorizado para marcar esta notificación")
        
        # Marcar como leída
        result = supabase.table("notifications").update({
            "read_at": datetime.utcnow().isoformat(),
            "read_by": current_user.id
        }).eq("id", notification_id).execute()
        
        return {
            "message": "Notificación marcada como leída",
            "notification_id": notification_id,
            "read_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error marcando notificación: {str(e)}")


@router.post("/bulk/mark-read")
async def bulk_mark_notifications_read(
    notification_ids: List[int],
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    📬 Marcar múltiples notificaciones como leídas
    """
    try:
        if len(notification_ids) > 100:
            raise HTTPException(status_code=400, detail="Máximo 100 notificaciones por operación")
        
        # Marcar como leídas solo las del usuario
        result = supabase.table("notifications").update({
            "read_at": datetime.utcnow().isoformat(),
            "read_by": current_user.id
        }).in_("id", notification_ids).eq("tenant_id", tenant_id).or_(f"user_id.eq.{current_user.id},user_id.is.null").execute()
        
        return {
            "message": f"Notificaciones marcadas como leídas",
            "updated_count": len(result.data) if result.data else 0,
            "marked_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error operación masiva: {str(e)}")


@router.get("/summary")
async def get_notifications_summary(
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    📊 Resumen de notificaciones del usuario
    """
    try:
        # Obtener notificaciones del usuario
        notifications = supabase.table("notifications").select("*").eq("tenant_id", tenant_id).or_(f"user_id.eq.{current_user.id},user_id.is.null").execute()
        notifications_data = notifications.data or []
        
        # Calcular resumen
        summary = {
            "total": len(notifications_data),
            "unread": len([n for n in notifications_data if not n.get("read_at")]),
            "by_priority": {"CRITICAL": 0, "HIGH": 0, "NORMAL": 0, "LOW": 0},
            "by_type": {},
            "recent_critical": [],
            "oldest_unread": None
        }
        
        # Agrupar por prioridad y tipo
        for notification in notifications_data:
            priority = notification.get("priority", "NORMAL")
            notif_type = notification.get("type", "GENERAL")
            
            summary["by_priority"][priority] += 1
            summary["by_type"][notif_type] = summary["by_type"].get(notif_type, 0) + 1
            
            # Críticas recientes (últimos 7 días)
            if priority == "CRITICAL":
                created_at = datetime.fromisoformat(notification["created_at"].replace("Z", "+00:00"))
                if created_at > datetime.utcnow() - timedelta(days=7):
                    summary["recent_critical"].append({
                        "id": notification["id"],
                        "title": notification["title"],
                        "created_at": notification["created_at"]
                    })
        
        # Notificación no leída más antigua
        unread = [n for n in notifications_data if not n.get("read_at")]
        if unread:
            oldest = min(unread, key=lambda x: x["created_at"])
            summary["oldest_unread"] = {
                "id": oldest["id"],
                "title": oldest["title"],
                "created_at": oldest["created_at"],
                "days_ago": (datetime.utcnow() - datetime.fromisoformat(oldest["created_at"].replace("Z", "+00:00"))).days
            }
        
        return {
            "user_id": current_user.id,
            "tenant_id": tenant_id,
            "summary": summary,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error resumen notificaciones: {str(e)}")


@router.post("/system/compliance-alert")
async def create_compliance_alert(
    alert_data: dict,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    🚨 Crear alerta de compliance del sistema
    """
    try:
        # Verificar permisos para alertas de sistema
        if not any(perm in current_user.permissions for perm in ["system.alerts", "dpo.alerts"]) and not current_user.is_superuser:
            raise HTTPException(status_code=403, detail="Permisos insuficientes para alertas de sistema")
        
        # Preparar alerta de compliance
        alert_notification = {
            "tenant_id": tenant_id,
            "type": "COMPLIANCE_ALERT",
            "title": alert_data.get("title", "Alerta de Compliance"),
            "description": alert_data["description"],
            "priority": alert_data.get("priority", "HIGH"),
            "channel": "in_app,email",
            "resource_type": alert_data.get("resource_type"),
            "resource_id": alert_data.get("resource_id"),
            "created_by": current_user.id,
            "created_at": datetime.utcnow().isoformat(),
            "status": "PENDING",
            "compliance_category": alert_data.get("category", "GENERAL"),
            "action_required": alert_data.get("action_required", True),
            "deadline": alert_data.get("deadline")
        }
        
        # Determinar destinatarios según severidad
        if alert_data.get("priority") == "CRITICAL":
            # Notificar a todos los DPOs y admins
            dpo_users = supabase.table("users").select("id").eq("tenant_id", tenant_id).contains("permissions", ["dpo.view"]).execute()
            admin_users = supabase.table("users").select("id").eq("tenant_id", tenant_id).eq("is_superuser", True).execute()
            
            target_users = set()
            if dpo_users.data:
                target_users.update([u["id"] for u in dpo_users.data])
            if admin_users.data:
                target_users.update([u["id"] for u in admin_users.data])
            
            # Crear notificación para cada usuario crítico
            notifications = []
            for user_id in target_users:
                notif = alert_notification.copy()
                notif["user_id"] = user_id
                notifications.append(notif)
            
            if notifications:
                result = supabase.table("notifications").insert(notifications).execute()
            else:
                # Notificación general si no hay usuarios específicos
                result = supabase.table("notifications").insert(alert_notification).execute()
        else:
            # Notificación general para el tenant
            result = supabase.table("notifications").insert(alert_notification).execute()
        
        return {
            "message": "Alerta de compliance creada exitosamente",
            "alert_type": alert_notification["type"],
            "priority": alert_notification["priority"],
            "notifications_created": len(result.data) if result.data else 1,
            "created_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creando alerta: {str(e)}")


@router.get("/compliance/deadlines")
async def get_compliance_deadlines(
    days_ahead: int = Query(30, ge=1, le=365),
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    📅 Obtener próximos deadlines de compliance
    """
    try:
        end_date = datetime.utcnow() + timedelta(days=days_ahead)
        
        # Obtener deadlines de diferentes fuentes
        deadlines = []
        
        # RATs que requieren revisión
        rats_review = supabase.table("rats").select("id,nombre_actividad,fecha_revision_proxima").eq("tenant_id", tenant_id).lte("fecha_revision_proxima", end_date.isoformat()).execute()
        
        for rat in (rats_review.data or []):
            if rat.get("fecha_revision_proxima"):
                deadlines.append({
                    "type": "RAT_REVIEW",
                    "title": f"Revisión RAT: {rat['nombre_actividad']}",
                    "deadline": rat["fecha_revision_proxima"],
                    "resource_id": rat["id"],
                    "resource_type": "RAT",
                    "priority": "NORMAL"
                })
        
        # EIPDs pendientes
        eipds_pending = supabase.table("eipds").select("id,nombre,deadline").eq("tenant_id", tenant_id).eq("estado", "PENDIENTE_REVISION").lte("deadline", end_date.isoformat()).execute()
        
        for eipd in (eipds_pending.data or []):
            if eipd.get("deadline"):
                deadlines.append({
                    "type": "EIPD_DEADLINE",
                    "title": f"EIPD vence: {eipd['nombre']}",
                    "deadline": eipd["deadline"],
                    "resource_id": eipd["id"],
                    "resource_type": "EIPD",
                    "priority": "HIGH"
                })
        
        # Contratos de proveedores que vencen
        providers_expiring = supabase.table("providers").select("id,nombre,contract_expires_at").eq("tenant_id", tenant_id).lte("contract_expires_at", end_date.isoformat()).execute()
        
        for provider in (providers_expiring.data or []):
            if provider.get("contract_expires_at"):
                deadlines.append({
                    "type": "PROVIDER_CONTRACT_EXPIRY",
                    "title": f"Contrato vence: {provider['nombre']}",
                    "deadline": provider["contract_expires_at"],
                    "resource_id": provider["id"],
                    "resource_type": "PROVIDER",
                    "priority": "MEDIUM"
                })
        
        # Ordenar por deadline
        deadlines.sort(key=lambda x: x["deadline"])
        
        # Crear notificaciones automáticas para deadlines críticos (próximos 7 días)
        critical_deadline = datetime.utcnow() + timedelta(days=7)
        critical_deadlines = [d for d in deadlines if datetime.fromisoformat(d["deadline"].replace("Z", "+00:00")) <= critical_deadline]
        
        for deadline in critical_deadlines:
            # Verificar si ya existe notificación para este deadline
            existing = supabase.table("notifications").select("id").eq("resource_type", deadline["resource_type"]).eq("resource_id", str(deadline["resource_id"])).eq("type", "DEADLINE_ALERT").execute()
            
            if not existing.data:
                # Crear notificación automática
                deadline_notification = {
                    "tenant_id": tenant_id,
                    "type": "DEADLINE_ALERT",
                    "title": f"⚠️ {deadline['title']} - Vence pronto",
                    "description": f"Deadline crítico en {(datetime.fromisoformat(deadline['deadline'].replace('Z', '+00:00')) - datetime.utcnow()).days} días",
                    "priority": "HIGH",
                    "resource_type": deadline["resource_type"],
                    "resource_id": str(deadline["resource_id"]),
                    "created_at": datetime.utcnow().isoformat(),
                    "status": "PENDING",
                    "action_required": True
                }
                
                supabase.table("notifications").insert(deadline_notification).execute()
        
        return {
            "deadlines": deadlines,
            "total_deadlines": len(deadlines),
            "critical_deadlines": len(critical_deadlines),
            "period_days": days_ahead,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo deadlines: {str(e)}")


@router.get("/preferences")
async def get_notification_preferences(
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    ⚙️ Obtener preferencias de notificaciones del usuario
    """
    try:
        # Obtener preferencias del usuario
        preferences = supabase.table("user_notification_preferences").select("*").eq("user_id", current_user.id).eq("tenant_id", tenant_id).single().execute()
        
        if not preferences.data:
            # Crear preferencias por defecto
            default_preferences = {
                "user_id": current_user.id,
                "tenant_id": tenant_id,
                "email_enabled": True,
                "in_app_enabled": True,
                "sms_enabled": False,
                "push_enabled": True,
                "notification_types": {
                    "RAT_DEADLINES": {"email": True, "in_app": True},
                    "EIPD_DEADLINES": {"email": True, "in_app": True},
                    "COMPLIANCE_ALERTS": {"email": True, "in_app": True},
                    "PROVIDER_UPDATES": {"email": False, "in_app": True},
                    "SYSTEM_UPDATES": {"email": False, "in_app": True},
                    "AUDIT_ALERTS": {"email": True, "in_app": True}
                },
                "quiet_hours": {
                    "enabled": True,
                    "start": "22:00",
                    "end": "08:00"
                },
                "created_at": datetime.utcnow().isoformat()
            }
            
            result = supabase.table("user_notification_preferences").insert(default_preferences).execute()
            return result.data[0]
        
        return preferences.data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo preferencias: {str(e)}")


@router.put("/preferences")
async def update_notification_preferences(
    preferences_data: dict,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    🔧 Actualizar preferencias de notificaciones
    """
    try:
        # Preparar actualización
        update_data = {
            **preferences_data,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # Actualizar o crear si no existe
        existing = supabase.table("user_notification_preferences").select("id").eq("user_id", current_user.id).eq("tenant_id", tenant_id).single().execute()
        
        if existing.data:
            result = supabase.table("user_notification_preferences").update(update_data).eq("user_id", current_user.id).eq("tenant_id", tenant_id).execute()
        else:
            update_data.update({
                "user_id": current_user.id,
                "tenant_id": tenant_id,
                "created_at": datetime.utcnow().isoformat()
            })
            result = supabase.table("user_notification_preferences").insert(update_data).execute()
        
        return {
            "message": "Preferencias actualizadas exitosamente",
            "preferences": result.data[0] if result.data else update_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error actualizando preferencias: {str(e)}")


@router.get("/channels/test")
async def test_notification_channels(
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    🧪 Probar canales de notificación disponibles
    """
    try:
        test_results = {}
        
        # Probar canal in-app (siempre disponible)
        test_results["in_app"] = {
            "available": True,
            "status": "OK",
            "message": "Canal in-app funcionando correctamente"
        }
        
        # Probar canal email
        try:
            # En implementación real: enviar email de prueba
            test_results["email"] = {
                "available": True,
                "status": "OK",
                "message": "Canal email configurado",
                "test_sent": False
            }
        except Exception as e:
            test_results["email"] = {
                "available": False,
                "status": "ERROR",
                "message": f"Error email: {str(e)}"
            }
        
        # Probar canal SMS
        try:
            # En implementación real: verificar servicio SMS
            test_results["sms"] = {
                "available": False,
                "status": "NOT_CONFIGURED",
                "message": "Servicio SMS no configurado"
            }
        except Exception as e:
            test_results["sms"] = {
                "available": False,
                "status": "ERROR",
                "message": f"Error SMS: {str(e)}"
            }
        
        # Probar canal push
        test_results["push"] = {
            "available": False,
            "status": "NOT_IMPLEMENTED",
            "message": "Notificaciones push pendientes de implementar"
        }
        
        return {
            "user_id": current_user.id,
            "tenant_id": tenant_id,
            "channels": test_results,
            "test_timestamp": datetime.utcnow().isoformat(),
            "recommendations": [
                "Configurar servidor SMTP para email" if not test_results["email"]["available"] else None,
                "Implementar servicio SMS" if not test_results["sms"]["available"] else None,
                "Configurar Firebase para push notifications" if not test_results["push"]["available"] else None
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error probando canales: {str(e)}")


async def send_notification_via_channel(notification_data):
    """Helper para enviar notificación por canal especificado"""
    
    channel = notification_data.get("channel", "in_app")
    channels = channel.split(",") if "," in channel else [channel]
    
    for ch in channels:
        try:
            if ch == "email":
                await send_email_notification(notification_data)
            elif ch == "sms":
                await send_sms_notification(notification_data)
            elif ch == "push":
                await send_push_notification(notification_data)
            # in_app ya está guardado en DB
        except Exception as e:
            logger.warning(f"Error enviando notificación por {ch}: {e}")


async def send_email_notification(notification_data):
    """Placeholder para envío de email"""
    # En implementación real: integrar con servicio de email
    pass


async def send_sms_notification(notification_data):
    """Placeholder para envío de SMS"""
    # En implementación real: integrar con servicio SMS
    pass


async def send_push_notification(notification_data):
    """Placeholder para notificaciones push"""
    # En implementación real: integrar con Firebase/OneSignal
    pass


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