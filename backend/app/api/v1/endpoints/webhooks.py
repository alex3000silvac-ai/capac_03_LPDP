"""
🔗 WEBHOOKS ENDPOINTS - API REST Completa para Integraciones
Sistema completo de webhooks para integraciones enterprise y notificaciones tiempo real
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Request
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
import hmac
import hashlib
import uuid
import asyncio
import aiohttp

from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.tenant import get_tenant_id

router = APIRouter()

@router.get("/")
async def get_webhooks(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    active_only: bool = Query(True),
    event_type: Optional[str] = Query(None),
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    🔗 Obtener webhooks configurados
    """
    try:
        query = supabase.table("webhooks").select("*").eq("tenant_id", tenant_id)
        
        if active_only:
            query = query.eq("active", True)
        if event_type:
            query = query.contains("event_types", [event_type])
            
        result = query.order("created_at", desc=True).range(skip, skip + limit - 1).execute()
        
        return {
            "webhooks": result.data or [],
            "total": len(result.data) if result.data else 0,
            "pagination": {
                "skip": skip,
                "limit": limit,
                "page": skip // limit + 1
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo webhooks: {str(e)}")


@router.post("/")
async def create_webhook(
    webhook_data: dict,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    ✨ Crear nuevo webhook
    """
    try:
        # Verificar permisos
        if not any(perm in current_user.permissions for perm in ["webhook.manage", "admin.full"]) and not current_user.is_superuser:
            raise HTTPException(status_code=403, detail="Permisos insuficientes para gestionar webhooks")
        
        # Validar datos requeridos
        required_fields = ["name", "url", "event_types"]
        for field in required_fields:
            if field not in webhook_data:
                raise HTTPException(status_code=400, detail=f"Campo requerido: {field}")
        
        # Validar URL
        if not webhook_data["url"].startswith(("http://", "https://")):
            raise HTTPException(status_code=400, detail="URL debe comenzar con http:// o https://")
        
        # Validar tipos de eventos
        valid_events = [
            "rat.created", "rat.updated", "rat.certified", "rat.deleted",
            "eipd.created", "eipd.approved", "eipd.submitted",
            "provider.added", "provider.updated", "dpa.generated", "dpa.signed",
            "compliance.alert", "deadline.approaching", "audit.critical",
            "user.created", "user.updated", "tenant.updated"
        ]
        
        for event in webhook_data["event_types"]:
            if event not in valid_events:
                raise HTTPException(status_code=400, detail=f"Tipo de evento inválido: {event}")
        
        # Generar secret para verificación
        webhook_secret = f"whsec_{uuid.uuid4().hex}"
        
        # Preparar datos
        webhook_dict = {
            **webhook_data,
            "tenant_id": tenant_id,
            "created_by": current_user.id,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "active": True,
            "secret": webhook_secret,
            "delivery_attempts": 0,
            "last_delivery": None,
            "last_status": None
        }
        
        # Insertar webhook
        result = supabase.table("webhooks").insert(webhook_dict).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Error creando webhook")
        
        # Probar webhook inmediatamente
        test_result = await test_webhook_delivery(result.data[0])
        
        return {
            "message": "Webhook creado exitosamente",
            "webhook": {
                **result.data[0],
                "secret": "whsec_***"  # Ocultar secret en respuesta
            },
            "test_delivery": test_result,
            "next_steps": [
                "Configurar manejo de eventos en endpoint",
                "Validar secret en headers",
                "Implementar retry logic",
                "Monitorear delivery rate"
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creando webhook: {str(e)}")


@router.put("/{webhook_id}")
async def update_webhook(
    webhook_id: int,
    webhook_data: dict,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    📝 Actualizar webhook existente
    """
    try:
        # Verificar permisos
        if not any(perm in current_user.permissions for perm in ["webhook.manage", "admin.full"]) and not current_user.is_superuser:
            raise HTTPException(status_code=403, detail="Permisos insuficientes")
        
        # Verificar webhook existe
        existing = supabase.table("webhooks").select("*").eq("id", webhook_id).eq("tenant_id", tenant_id).single().execute()
        
        if not existing.data:
            raise HTTPException(status_code=404, detail="Webhook no encontrado")
        
        # Preparar actualización
        update_dict = {
            **webhook_data,
            "updated_at": datetime.utcnow().isoformat(),
            "updated_by": current_user.id
        }
        
        # Si se cambia la URL, regenerar secret
        if "url" in webhook_data and webhook_data["url"] != existing.data["url"]:
            update_dict["secret"] = f"whsec_{uuid.uuid4().hex}"
            update_dict["last_delivery"] = None
            update_dict["delivery_attempts"] = 0
        
        result = supabase.table("webhooks").update(update_dict).eq("id", webhook_id).eq("tenant_id", tenant_id).execute()
        
        return {
            "message": "Webhook actualizado exitosamente",
            "webhook": result.data[0] if result.data else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error actualizando webhook: {str(e)}")


@router.post("/{webhook_id}/test")
async def test_webhook(
    webhook_id: int,
    test_event: Optional[dict] = None,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    🧪 Probar entrega de webhook
    """
    try:
        # Obtener webhook
        webhook = supabase.table("webhooks").select("*").eq("id", webhook_id).eq("tenant_id", tenant_id).single().execute()
        
        if not webhook.data:
            raise HTTPException(status_code=404, detail="Webhook no encontrado")
        
        # Crear evento de prueba
        if not test_event:
            test_event = {
                "event_type": "webhook.test",
                "timestamp": datetime.utcnow().isoformat(),
                "tenant_id": tenant_id,
                "data": {
                    "message": "Test webhook delivery",
                    "webhook_id": webhook_id,
                    "test_by": current_user.email
                }
            }
        
        # Enviar webhook
        delivery_result = await send_webhook_event(webhook.data, test_event, is_test=True)
        
        # Actualizar estadísticas del webhook
        supabase.table("webhooks").update({
            "last_test": datetime.utcnow().isoformat(),
            "last_test_status": delivery_result["status"],
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", webhook_id).execute()
        
        return {
            "webhook_id": webhook_id,
            "test_result": delivery_result,
            "test_timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error probando webhook: {str(e)}")


@router.get("/{webhook_id}/deliveries")
async def get_webhook_deliveries(
    webhook_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    status: Optional[str] = Query(None),
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    📦 Obtener historial de entregas del webhook
    """
    try:
        # Verificar webhook pertenece al tenant
        webhook = supabase.table("webhooks").select("id").eq("id", webhook_id).eq("tenant_id", tenant_id).single().execute()
        
        if not webhook.data:
            raise HTTPException(status_code=404, detail="Webhook no encontrado")
        
        query = supabase.table("webhook_deliveries").select("*").eq("webhook_id", webhook_id)
        
        if status:
            query = query.eq("status", status)
            
        result = query.order("attempted_at", desc=True).range(skip, skip + limit - 1).execute()
        
        # Calcular estadísticas de entrega
        all_deliveries = supabase.table("webhook_deliveries").select("status").eq("webhook_id", webhook_id).execute()
        deliveries_data = all_deliveries.data or []
        
        stats = {
            "total_deliveries": len(deliveries_data),
            "successful": len([d for d in deliveries_data if d["status"] == "SUCCESS"]),
            "failed": len([d for d in deliveries_data if d["status"] == "FAILED"]),
            "pending": len([d for d in deliveries_data if d["status"] == "PENDING"])
        }
        
        if stats["total_deliveries"] > 0:
            stats["success_rate"] = round((stats["successful"] / stats["total_deliveries"]) * 100, 2)
        else:
            stats["success_rate"] = 0
        
        return {
            "webhook_id": webhook_id,
            "deliveries": result.data or [],
            "statistics": stats,
            "pagination": {
                "skip": skip,
                "limit": limit,
                "page": skip // limit + 1
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo entregas: {str(e)}")


@router.post("/trigger")
async def trigger_webhook_event(
    event_data: dict,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    🚀 Trigger manual de evento webhook
    """
    try:
        # Verificar permisos
        if not any(perm in current_user.permissions for perm in ["webhook.trigger", "admin.full"]) and not current_user.is_superuser:
            raise HTTPException(status_code=403, detail="Permisos insuficientes para trigger webhooks")
        
        # Validar evento
        required_fields = ["event_type", "data"]
        for field in required_fields:
            if field not in event_data:
                raise HTTPException(status_code=400, detail=f"Campo requerido: {field}")
        
        # Preparar evento
        webhook_event = {
            "event_type": event_data["event_type"],
            "timestamp": datetime.utcnow().isoformat(),
            "tenant_id": tenant_id,
            "triggered_by": current_user.id,
            "data": event_data["data"],
            "manual_trigger": True
        }
        
        # Obtener webhooks que escuchan este evento
        webhooks = supabase.table("webhooks").select("*").eq("tenant_id", tenant_id).eq("active", True).contains("event_types", [event_data["event_type"]]).execute()
        
        if not webhooks.data:
            return {
                "message": "Evento trigger exitoso",
                "event_type": event_data["event_type"],
                "webhooks_notified": 0,
                "note": "No hay webhooks configurados para este tipo de evento"
            }
        
        # Enviar a todos los webhooks relevantes
        delivery_results = []
        for webhook in webhooks.data:
            try:
                result = await send_webhook_event(webhook, webhook_event)
                delivery_results.append({
                    "webhook_id": webhook["id"],
                    "webhook_name": webhook["name"],
                    "status": result["status"],
                    "response_time": result.get("response_time", 0)
                })
            except Exception as e:
                delivery_results.append({
                    "webhook_id": webhook["id"],
                    "webhook_name": webhook["name"],
                    "status": "ERROR",
                    "error": str(e)
                })
        
        return {
            "message": "Evento webhook enviado",
            "event_type": event_data["event_type"],
            "webhooks_notified": len(webhooks.data),
            "delivery_results": delivery_results,
            "triggered_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error trigger webhook: {str(e)}")


@router.get("/events/types")
async def get_available_event_types(
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    📋 Obtener tipos de eventos disponibles
    """
    try:
        event_types = {
            "RAT Events": [
                {
                    "type": "rat.created",
                    "description": "RAT creado exitosamente",
                    "payload_example": {
                        "rat_id": 123,
                        "nombre_actividad": "Gestión Clientes",
                        "created_by": "user@company.cl",
                        "timestamp": "2024-01-15T10:30:00Z"
                    }
                },
                {
                    "type": "rat.updated", 
                    "description": "RAT actualizado",
                    "payload_example": {
                        "rat_id": 123,
                        "changes": ["finalidad", "tipos_datos"],
                        "updated_by": "user@company.cl",
                        "version": 2
                    }
                },
                {
                    "type": "rat.certified",
                    "description": "RAT certificado por DPO",
                    "payload_example": {
                        "rat_id": 123,
                        "certified_by": "dpo@company.cl",
                        "certification_date": "2024-01-15T15:45:00Z"
                    }
                }
            ],
            "EIPD Events": [
                {
                    "type": "eipd.created",
                    "description": "EIPD/DPIA creada",
                    "payload_example": {
                        "eipd_id": 456,
                        "rat_id": 123,
                        "nivel_riesgo": "ALTO",
                        "created_by": "analyst@company.cl"
                    }
                },
                {
                    "type": "eipd.approved",
                    "description": "EIPD aprobada por DPO",
                    "payload_example": {
                        "eipd_id": 456,
                        "approved_by": "dpo@company.cl",
                        "requiere_consulta_previa": true
                    }
                }
            ],
            "Provider Events": [
                {
                    "type": "provider.added",
                    "description": "Nuevo proveedor registrado",
                    "payload_example": {
                        "provider_id": 789,
                        "nombre": "Cloud Provider SA",
                        "nivel_riesgo": "ALTO",
                        "pais": "Estados Unidos"
                    }
                },
                {
                    "type": "dpa.generated",
                    "description": "DPA generado automáticamente",
                    "payload_example": {
                        "dpa_id": 101,
                        "provider_id": 789,
                        "tipo_dpa": "TRANSFERENCIA_INTERNACIONAL",
                        "generated_by": "legal@company.cl"
                    }
                }
            ],
            "Compliance Events": [
                {
                    "type": "compliance.alert",
                    "description": "Alerta de compliance crítica",
                    "payload_example": {
                        "alert_type": "DEADLINE_APPROACHING",
                        "resource_type": "RAT",
                        "resource_id": 123,
                        "severity": "HIGH",
                        "days_remaining": 7
                    }
                },
                {
                    "type": "deadline.approaching",
                    "description": "Deadline próximo a vencer",
                    "payload_example": {
                        "deadline_type": "RAT_REVIEW",
                        "resource_id": 123,
                        "deadline_date": "2024-01-22T00:00:00Z",
                        "days_remaining": 3
                    }
                }
            ],
            "System Events": [
                {
                    "type": "audit.critical",
                    "description": "Evento crítico de auditoría",
                    "payload_example": {
                        "audit_type": "UNAUTHORIZED_ACCESS",
                        "user_id": "suspect@company.cl",
                        "resource_accessed": "SENSITIVE_RAT",
                        "timestamp": "2024-01-15T02:30:00Z"
                    }
                }
            ]
        }
        
        return {
            "available_events": event_types,
            "total_event_types": sum(len(events) for events in event_types.values()),
            "webhook_documentation": "https://docs.lpdp-system.cl/webhooks",
            "security_note": "Todos los webhooks incluyen signature HMAC-SHA256 para verificación"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo tipos de eventos: {str(e)}")


@router.get("/analytics/performance")
async def get_webhook_performance_analytics(
    period: str = Query("week", regex="^(day|week|month)$"),
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    📊 Analytics de rendimiento webhooks
    """
    try:
        # Calcular período
        periods = {
            "day": timedelta(days=1),
            "week": timedelta(days=7),
            "month": timedelta(days=30)
        }
        
        start_date = datetime.utcnow() - periods[period]
        
        # Obtener entregas del período
        deliveries = supabase.table("webhook_deliveries").select("*").eq("tenant_id", tenant_id).gte("attempted_at", start_date.isoformat()).execute()
        deliveries_data = deliveries.data or []
        
        # Calcular analytics
        analytics = {
            "overview": {
                "total_deliveries": len(deliveries_data),
                "successful_deliveries": len([d for d in deliveries_data if d["status"] == "SUCCESS"]),
                "failed_deliveries": len([d for d in deliveries_data if d["status"] == "FAILED"]),
                "success_rate": 0,
                "average_response_time": 0
            },
            "by_webhook": {},
            "by_event_type": {},
            "failure_analysis": {
                "timeout_failures": 0,
                "http_errors": 0,
                "network_errors": 0,
                "other_errors": 0
            },
            "performance_trends": {
                "fastest_webhook": None,
                "slowest_webhook": None,
                "most_reliable": None,
                "least_reliable": None
            }
        }
        
        # Calcular métricas
        if deliveries_data:
            successful = analytics["overview"]["successful_deliveries"]
            total = analytics["overview"]["total_deliveries"]
            analytics["overview"]["success_rate"] = round((successful / total) * 100, 2)
            
            # Tiempo promedio respuesta
            response_times = [d.get("response_time", 0) for d in deliveries_data if d.get("response_time")]
            if response_times:
                analytics["overview"]["average_response_time"] = round(sum(response_times) / len(response_times), 2)
        
        # Agrupar por webhook
        for delivery in deliveries_data:
            webhook_id = delivery["webhook_id"]
            event_type = delivery["event_type"]
            
            # Por webhook
            if webhook_id not in analytics["by_webhook"]:
                analytics["by_webhook"][webhook_id] = {"total": 0, "successful": 0, "failed": 0}
            
            analytics["by_webhook"][webhook_id]["total"] += 1
            if delivery["status"] == "SUCCESS":
                analytics["by_webhook"][webhook_id]["successful"] += 1
            else:
                analytics["by_webhook"][webhook_id]["failed"] += 1
            
            # Por tipo de evento
            if event_type not in analytics["by_event_type"]:
                analytics["by_event_type"][event_type] = {"total": 0, "successful": 0}
            
            analytics["by_event_type"][event_type]["total"] += 1
            if delivery["status"] == "SUCCESS":
                analytics["by_event_type"][event_type]["successful"] += 1
            
            # Análisis de fallos
            if delivery["status"] == "FAILED":
                error_detail = delivery.get("error_detail", "")
                if "timeout" in error_detail.lower():
                    analytics["failure_analysis"]["timeout_failures"] += 1
                elif "http" in error_detail.lower():
                    analytics["failure_analysis"]["http_errors"] += 1
                elif "network" in error_detail.lower():
                    analytics["failure_analysis"]["network_errors"] += 1
                else:
                    analytics["failure_analysis"]["other_errors"] += 1
        
        return {
            "tenant_id": tenant_id,
            "period": period,
            "analytics": analytics,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analytics webhooks: {str(e)}")


async def send_webhook_event(webhook_config, event_data, is_test=False):
    """Helper para enviar evento webhook"""
    
    try:
        # Preparar payload
        payload = {
            "id": str(uuid.uuid4()),
            "event": event_data["event_type"],
            "timestamp": event_data["timestamp"],
            "tenant_id": event_data["tenant_id"],
            "data": event_data["data"],
            "test": is_test
        }
        
        # Generar signature HMAC
        payload_json = json.dumps(payload, sort_keys=True, separators=(',', ':'))
        signature = hmac.new(
            webhook_config["secret"].encode(),
            payload_json.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Headers
        headers = {
            "Content-Type": "application/json",
            "X-Webhook-Signature": f"sha256={signature}",
            "X-Webhook-ID": payload["id"],
            "X-Webhook-Timestamp": str(int(datetime.utcnow().timestamp())),
            "User-Agent": "LPDP-Webhooks/1.0"
        }
        
        # Registrar intento de entrega
        delivery_record = {
            "webhook_id": webhook_config["id"],
            "tenant_id": webhook_config["tenant_id"],
            "event_type": event_data["event_type"],
            "payload": payload,
            "attempted_at": datetime.utcnow().isoformat(),
            "status": "PENDING"
        }
        
        delivery_result = supabase.table("webhook_deliveries").insert(delivery_record).execute()
        delivery_id = delivery_result.data[0]["id"] if delivery_result.data else None
        
        # Enviar webhook
        start_time = datetime.utcnow()
        
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=30)) as session:
            async with session.post(
                webhook_config["url"],
                json=payload,
                headers=headers
            ) as response:
                end_time = datetime.utcnow()
                response_time = (end_time - start_time).total_seconds() * 1000  # ms
                
                response_text = await response.text()
                
                # Actualizar registro de entrega
                if delivery_id:
                    update_data = {
                        "response_status": response.status,
                        "response_body": response_text[:1000],  # Limitar tamaño
                        "response_time": response_time,
                        "completed_at": datetime.utcnow().isoformat(),
                        "status": "SUCCESS" if 200 <= response.status < 300 else "FAILED"
                    }
                    
                    if response.status >= 400:
                        update_data["error_detail"] = f"HTTP {response.status}: {response_text[:500]}"
                    
                    supabase.table("webhook_deliveries").update(update_data).eq("id", delivery_id).execute()
                
                # Actualizar webhook stats
                supabase.table("webhooks").update({
                    "last_delivery": datetime.utcnow().isoformat(),
                    "last_status": "SUCCESS" if 200 <= response.status < 300 else "FAILED",
                    "delivery_attempts": webhook_config.get("delivery_attempts", 0) + 1
                }).eq("id", webhook_config["id"]).execute()
                
                return {
                    "status": "SUCCESS" if 200 <= response.status < 300 else "FAILED",
                    "http_status": response.status,
                    "response_time": response_time,
                    "delivery_id": delivery_id
                }
        
    except asyncio.TimeoutError:
        # Timeout
        if delivery_id:
            supabase.table("webhook_deliveries").update({
                "status": "FAILED",
                "error_detail": "Timeout after 30 seconds",
                "completed_at": datetime.utcnow().isoformat()
            }).eq("id", delivery_id).execute()
        
        return {
            "status": "FAILED",
            "error": "Timeout",
            "delivery_id": delivery_id
        }
        
    except Exception as e:
        # Error general
        if delivery_id:
            supabase.table("webhook_deliveries").update({
                "status": "FAILED",
                "error_detail": str(e),
                "completed_at": datetime.utcnow().isoformat()
            }).eq("id", delivery_id).execute()
        
        return {
            "status": "FAILED",
            "error": str(e),
            "delivery_id": delivery_id
        }


async def test_webhook_delivery(webhook_config):
    """Helper para probar entrega de webhook"""
    
    test_event = {
        "event_type": "webhook.test",
        "timestamp": datetime.utcnow().isoformat(),
        "tenant_id": webhook_config["tenant_id"],
        "data": {
            "test": True,
            "webhook_id": webhook_config["id"],
            "message": "Test delivery from LPDP system"
        }
    }
    
    return await send_webhook_event(webhook_config, test_event, is_test=True)


# Función para trigger automático de eventos del sistema
async def trigger_system_webhook(tenant_id: str, event_type: str, data: dict):
    """Trigger automático de webhooks desde el sistema"""
    
    try:
        # Obtener webhooks activos para este evento
        webhooks = supabase.table("webhooks").select("*").eq("tenant_id", tenant_id).eq("active", True).contains("event_types", [event_type]).execute()
        
        if not webhooks.data:
            return
        
        # Preparar evento
        event_data = {
            "event_type": event_type,
            "timestamp": datetime.utcnow().isoformat(),
            "tenant_id": tenant_id,
            "data": data,
            "system_triggered": True
        }
        
        # Enviar a webhooks en background
        for webhook in webhooks.data:
            try:
                await send_webhook_event(webhook, event_data)
            except Exception as e:
                # Log error pero no fallar el proceso principal
                logger.warning(f"Error enviando webhook {webhook['id']}: {e}")
                
    except Exception as e:
        logger.error(f"Error trigger system webhook: {e}")


@router.delete("/{webhook_id}")
async def delete_webhook(
    webhook_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    🗑️ Eliminar webhook
    """
    try:
        # Verificar permisos
        if not any(perm in current_user.permissions for perm in ["webhook.manage", "admin.full"]) and not current_user.is_superuser:
            raise HTTPException(status_code=403, detail="Permisos insuficientes")
        
        # Verificar webhook existe
        existing = supabase.table("webhooks").select("*").eq("id", webhook_id).eq("tenant_id", tenant_id).single().execute()
        
        if not existing.data:
            raise HTTPException(status_code=404, detail="Webhook no encontrado")
        
        # Soft delete
        result = supabase.table("webhooks").update({
            "active": False,
            "deleted_at": datetime.utcnow().isoformat(),
            "deleted_by": current_user.id
        }).eq("id", webhook_id).execute()
        
        return {
            "message": "Webhook eliminado exitosamente",
            "webhook_id": webhook_id,
            "deleted_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error eliminando webhook: {str(e)}")


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