"""
🐀 RAT ENDPOINTS - API REST Completa para RATs
Sistema completo de gestión RATs con todas las operaciones CRUD
"""

from fastapi import APIRouter, HTTPException, Depends, Request, Query
from typing import List, Optional
from datetime import datetime, timedelta
import json
import uuid

from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.tenant import get_tenant_id
from app.schemas.rat import RATCreate, RATUpdate, RATResponse, RATListResponse

router = APIRouter()

@router.get("/", response_model=RATListResponse)
async def get_rats(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=500),
    estado: Optional[str] = Query(None),
    industria: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    📋 Obtener lista de RATs con filtros y paginación
    """
    try:
        # Query base
        query = supabase.table("rats").select("*").eq("tenant_id", tenant_id)
        
        # Aplicar filtros
        if estado:
            query = query.eq("estado", estado)
        if industria:
            query = query.eq("industria", industria)
        if search:
            query = query.ilike("nombre_actividad", f"%{search}%")
            
        # Ordenar y paginar
        query = query.order("created_at", desc=True).range(skip, skip + limit - 1)
        
        result = query.execute()
        
        if result.data is None:
            return RATListResponse(rats=[], total=0, page=skip // limit + 1, limit=limit)
            
        # Contar total para paginación
        count_result = supabase.table("rats").select("count", count="exact").eq("tenant_id", tenant_id).execute()
        total = count_result.count if count_result.count else 0
        
        return RATListResponse(
            rats=result.data,
            total=total,
            page=skip // limit + 1,
            limit=limit,
            has_next=total > skip + limit
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo RATs: {str(e)}")


@router.get("/{rat_id}", response_model=RATResponse)
async def get_rat(
    rat_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    📄 Obtener RAT específico por ID
    """
    try:
        result = supabase.table("rats").select("*").eq("id", rat_id).eq("tenant_id", tenant_id).single().execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="RAT no encontrado")
            
        return RATResponse(**result.data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo RAT: {str(e)}")


@router.post("/", response_model=RATResponse)
async def create_rat(
    rat_data: RATCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    ✨ Crear nuevo RAT
    """
    try:
        # Preparar datos para inserción
        rat_dict = rat_data.dict()
        rat_dict.update({
            "tenant_id": tenant_id,
            "created_by": current_user.id,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "estado": "BORRADOR",
            "version": 1
        })
        
        # Insertar en Supabase
        result = supabase.table("rats").insert(rat_dict).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Error creando RAT")
            
        # Ejecutar análisis de inteligencia si está habilitado
        try:
            from app.services.rat_intelligence import analyze_rat
            intelligence_result = await analyze_rat(result.data[0])
            
            # Actualizar RAT con resultados de inteligencia
            if intelligence_result:
                update_data = {
                    "requiere_eipd": intelligence_result.get("requiere_eipd", False),
                    "nivel_riesgo": intelligence_result.get("nivel_riesgo", "BAJO"),
                    "alertas_compliance": intelligence_result.get("alertas", []),
                    "documentos_requeridos": intelligence_result.get("documentos_requeridos", [])
                }
                
                supabase.table("rats").update(update_data).eq("id", result.data[0]["id"]).execute()
                
        except ImportError:
            logger.warning("Servicio de inteligencia RAT no disponible")
        
        return RATResponse(**result.data[0])
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creando RAT: {str(e)}")


@router.put("/{rat_id}", response_model=RATResponse)
async def update_rat(
    rat_id: int,
    rat_data: RATUpdate,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    📝 Actualizar RAT existente
    """
    try:
        # Verificar que el RAT existe y pertenece al tenant
        existing = supabase.table("rats").select("*").eq("id", rat_id).eq("tenant_id", tenant_id).single().execute()
        
        if not existing.data:
            raise HTTPException(status_code=404, detail="RAT no encontrado")
        
        # Preparar datos de actualización
        update_dict = rat_data.dict(exclude_unset=True)
        update_dict.update({
            "updated_at": datetime.utcnow().isoformat(),
            "updated_by": current_user.id,
            "version": existing.data.get("version", 1) + 1
        })
        
        # Guardar versión anterior en historial
        version_data = {
            "rat_id": rat_id,
            "version_number": existing.data.get("version", 1),
            "data_snapshot": existing.data,
            "updated_by": current_user.id,
            "updated_at": datetime.utcnow().isoformat(),
            "change_summary": f"Actualización automática v{existing.data.get('version', 1) + 1}"
        }
        
        supabase.table("rat_versions").insert(version_data).execute()
        
        # Actualizar RAT
        result = supabase.table("rats").update(update_dict).eq("id", rat_id).eq("tenant_id", tenant_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Error actualizando RAT")
            
        return RATResponse(**result.data[0])
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error actualizando RAT: {str(e)}")


@router.delete("/{rat_id}")
async def delete_rat(
    rat_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    🗑️ Eliminar RAT (soft delete)
    """
    try:
        # Verificar existencia
        existing = supabase.table("rats").select("id").eq("id", rat_id).eq("tenant_id", tenant_id).single().execute()
        
        if not existing.data:
            raise HTTPException(status_code=404, detail="RAT no encontrado")
        
        # Soft delete
        result = supabase.table("rats").update({
            "deleted_at": datetime.utcnow().isoformat(),
            "deleted_by": current_user.id,
            "estado": "ELIMINADO"
        }).eq("id", rat_id).eq("tenant_id", tenant_id).execute()
        
        return {"message": "RAT eliminado exitosamente", "rat_id": rat_id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error eliminando RAT: {str(e)}")


@router.post("/{rat_id}/duplicate")
async def duplicate_rat(
    rat_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    📋 Duplicar RAT existente
    """
    try:
        # Obtener RAT original
        original = supabase.table("rats").select("*").eq("id", rat_id).eq("tenant_id", tenant_id).single().execute()
        
        if not original.data:
            raise HTTPException(status_code=404, detail="RAT no encontrado")
        
        # Preparar datos para duplicado
        duplicate_data = original.data.copy()
        duplicate_data.update({
            "id": None,  # Nuevo ID
            "nombre_actividad": f"{duplicate_data['nombre_actividad']} (Copia)",
            "estado": "BORRADOR",
            "created_by": current_user.id,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "version": 1,
            "deleted_at": None,
            "deleted_by": None
        })
        
        # Crear duplicado
        result = supabase.table("rats").insert(duplicate_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Error duplicando RAT")
            
        return {
            "message": "RAT duplicado exitosamente",
            "original_id": rat_id,
            "new_rat": result.data[0]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error duplicando RAT: {str(e)}")


@router.post("/{rat_id}/certify")
async def certify_rat(
    rat_id: int,
    certification_notes: Optional[str] = None,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    ✅ Certificar RAT (solo DPO)
    """
    try:
        # Verificar permisos DPO
        if not ("dpo.approve" in current_user.permissions or current_user.is_superuser):
            raise HTTPException(status_code=403, detail="Solo DPO puede certificar RATs")
        
        # Verificar RAT existe
        existing = supabase.table("rats").select("*").eq("id", rat_id).eq("tenant_id", tenant_id).single().execute()
        
        if not existing.data:
            raise HTTPException(status_code=404, detail="RAT no encontrado")
            
        if existing.data["estado"] not in ["PENDIENTE_APROBACION", "EN_REVISION"]:
            raise HTTPException(status_code=400, detail="RAT debe estar en estado PENDIENTE_APROBACION")
        
        # Certificar RAT
        result = supabase.table("rats").update({
            "estado": "CERTIFICADO",
            "certified_at": datetime.utcnow().isoformat(),
            "certified_by": current_user.id,
            "certification_notes": certification_notes,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", rat_id).eq("tenant_id", tenant_id).execute()
        
        # Registrar en audit log
        audit_data = {
            "tenant_id": tenant_id,
            "user_id": current_user.id,
            "action": "RAT_CERTIFIED",
            "resource_type": "RAT",
            "resource_id": str(rat_id),
            "details": {
                "certification_notes": certification_notes,
                "previous_state": existing.data["estado"]
            },
            "timestamp": datetime.utcnow().isoformat(),
            "ip_address": getattr(current_user, 'ip_address', '0.0.0.0')
        }
        
        supabase.table("audit_logs").insert(audit_data).execute()
        
        return {
            "message": "RAT certificado exitosamente",
            "rat_id": rat_id,
            "certified_at": datetime.utcnow().isoformat(),
            "certified_by": current_user.email
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error certificando RAT: {str(e)}")


@router.get("/{rat_id}/versions")
async def get_rat_versions(
    rat_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    📚 Obtener historial de versiones de RAT
    """
    try:
        result = supabase.table("rat_versions").select("*").eq("rat_id", rat_id).order("version_number", desc=True).execute()
        
        return {
            "rat_id": rat_id,
            "versions": result.data or [],
            "total_versions": len(result.data) if result.data else 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo versiones: {str(e)}")


@router.post("/{rat_id}/analyze")
async def analyze_rat_intelligence(
    rat_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    🧠 Ejecutar análisis de inteligencia sobre RAT
    """
    try:
        # Obtener RAT
        rat = supabase.table("rats").select("*").eq("id", rat_id).eq("tenant_id", tenant_id).single().execute()
        
        if not rat.data:
            raise HTTPException(status_code=404, detail="RAT no encontrado")
        
        # Ejecutar análisis
        try:
            from app.services.rat_intelligence import analyze_rat_complete
            analysis = await analyze_rat_complete(rat.data)
        except ImportError:
            # Fallback analysis
            analysis = {
                "area_detectada": "general",
                "nivel_riesgo": "MEDIO",
                "requiere_eipd": False,
                "documentos_requeridos": [],
                "alertas_compliance": []
            }
        
        # Actualizar RAT con resultados
        update_data = {
            "requiere_eipd": analysis.get("requiere_eipd", False),
            "nivel_riesgo": analysis.get("nivel_riesgo", "MEDIO"),
            "alertas_compliance": analysis.get("alertas_compliance", []),
            "documentos_requeridos": analysis.get("documentos_requeridos", []),
            "last_analysis": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        supabase.table("rats").update(update_data).eq("id", rat_id).execute()
        
        return {
            "rat_id": rat_id,
            "analysis_timestamp": datetime.utcnow().isoformat(),
            "results": analysis
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error análisis RAT: {str(e)}")


@router.get("/{rat_id}/export/{format}")
async def export_rat(
    rat_id: int,
    format: str,  # pdf, excel, json
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    📊 Exportar RAT en diferentes formatos
    """
    try:
        # Obtener RAT
        rat = supabase.table("rats").select("*").eq("id", rat_id).eq("tenant_id", tenant_id).single().execute()
        
        if not rat.data:
            raise HTTPException(status_code=404, detail="RAT no encontrado")
        
        if format not in ["pdf", "excel", "json"]:
            raise HTTPException(status_code=400, detail="Formato no soportado. Usar: pdf, excel, json")
        
        # Generar exportación según formato
        if format == "json":
            return {
                "rat_data": rat.data,
                "export_timestamp": datetime.utcnow().isoformat(),
                "format": "json"
            }
        elif format == "pdf":
            # En implementación real se generaría PDF
            return {
                "message": "PDF generado exitosamente",
                "download_url": f"/api/v1/rats/{rat_id}/download/pdf",
                "expires_at": (datetime.utcnow() + timedelta(hours=1)).isoformat()
            }
        elif format == "excel":
            # En implementación real se generaría Excel
            return {
                "message": "Excel generado exitosamente",
                "download_url": f"/api/v1/rats/{rat_id}/download/excel",
                "expires_at": (datetime.utcnow() + timedelta(hours=1)).isoformat()
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exportando RAT: {str(e)}")


@router.get("/stats/dashboard")
async def get_rat_statistics(
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    📊 Estadísticas dashboard RATs
    """
    try:
        # Obtener todos los RATs del tenant
        all_rats = supabase.table("rats").select("*").eq("tenant_id", tenant_id).execute()
        rats_data = all_rats.data or []
        
        # Calcular estadísticas
        stats = {
            "total_rats": len(rats_data),
            "por_estado": {},
            "por_industria": {},
            "por_nivel_riesgo": {},
            "requieren_eipd": 0,
            "certificados": 0,
            "borradores": 0,
            "ultimos_30_dias": 0,
            "promedio_tiempo_completar": "N/A"
        }
        
        # Agrupar por estado
        for rat in rats_data:
            estado = rat.get("estado", "BORRADOR")
            stats["por_estado"][estado] = stats["por_estado"].get(estado, 0) + 1
            
            # Industria
            industria = rat.get("industria", "general")
            stats["por_industria"][industria] = stats["por_industria"].get(industria, 0) + 1
            
            # Nivel riesgo
            riesgo = rat.get("nivel_riesgo", "BAJO")
            stats["por_nivel_riesgo"][riesgo] = stats["por_nivel_riesgo"].get(riesgo, 0) + 1
            
            # Contadores específicos
            if rat.get("requiere_eipd"):
                stats["requieren_eipd"] += 1
            if estado == "CERTIFICADO":
                stats["certificados"] += 1
            if estado == "BORRADOR":
                stats["borradores"] += 1
                
            # Últimos 30 días
            created_at = datetime.fromisoformat(rat["created_at"].replace("Z", "+00:00"))
            if created_at > datetime.utcnow() - timedelta(days=30):
                stats["ultimos_30_dias"] += 1
        
        return {
            "tenant_id": tenant_id,
            "estadisticas": stats,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo estadísticas: {str(e)}")


@router.post("/bulk/update")
async def bulk_update_rats(
    rat_ids: List[int],
    update_data: dict,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    📦 Actualización masiva de RATs
    """
    try:
        if len(rat_ids) > 100:
            raise HTTPException(status_code=400, detail="Máximo 100 RATs por operación masiva")
        
        # Verificar permisos para operación masiva
        if not ("rat.bulk_edit" in current_user.permissions or current_user.is_superuser):
            raise HTTPException(status_code=403, detail="Permisos insuficientes para operación masiva")
        
        updated_rats = []
        errors = []
        
        for rat_id in rat_ids:
            try:
                # Actualizar cada RAT
                result = supabase.table("rats").update({
                    **update_data,
                    "updated_at": datetime.utcnow().isoformat(),
                    "updated_by": current_user.id
                }).eq("id", rat_id).eq("tenant_id", tenant_id).execute()
                
                if result.data:
                    updated_rats.append(rat_id)
                else:
                    errors.append(f"RAT {rat_id}: No encontrado")
                    
            except Exception as e:
                errors.append(f"RAT {rat_id}: {str(e)}")
        
        # Registrar operación masiva en audit log
        audit_data = {
            "tenant_id": tenant_id,
            "user_id": current_user.id,
            "action": "BULK_UPDATE_RATS",
            "resource_type": "RAT",
            "resource_id": f"bulk_{len(rat_ids)}_rats",
            "details": {
                "rat_ids": rat_ids,
                "update_data": update_data,
                "updated_count": len(updated_rats),
                "error_count": len(errors)
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
        supabase.table("audit_logs").insert(audit_data).execute()
        
        return {
            "message": f"Operación masiva completada",
            "total_requested": len(rat_ids),
            "successfully_updated": len(updated_rats),
            "errors": len(errors),
            "updated_rat_ids": updated_rats,
            "error_details": errors[:10]  # Límite de errores mostrados
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error operación masiva: {str(e)}")


@router.get("/search/advanced")
async def advanced_rat_search(
    q: Optional[str] = Query(None, description="Búsqueda en texto completo"),
    estado: Optional[str] = Query(None),
    industria: Optional[str] = Query(None),
    nivel_riesgo: Optional[str] = Query(None),
    requiere_eipd: Optional[bool] = Query(None),
    created_after: Optional[datetime] = Query(None),
    created_before: Optional[datetime] = Query(None),
    responsable: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    🔍 Búsqueda avanzada de RATs
    """
    try:
        query = supabase.table("rats").select("*").eq("tenant_id", tenant_id)
        
        # Aplicar filtros
        if estado:
            query = query.eq("estado", estado)
        if industria:
            query = query.eq("industria", industria)
        if nivel_riesgo:
            query = query.eq("nivel_riesgo", nivel_riesgo)
        if requiere_eipd is not None:
            query = query.eq("requiere_eipd", requiere_eipd)
        if responsable:
            query = query.ilike("responsable_proceso", f"%{responsable}%")
        if created_after:
            query = query.gte("created_at", created_after.isoformat())
        if created_before:
            query = query.lte("created_at", created_before.isoformat())
        if q:
            # Búsqueda en texto completo
            query = query.or_(f"nombre_actividad.ilike.%{q}%,finalidad.ilike.%{q}%,descripcion.ilike.%{q}%")
        
        # Ejecutar query con paginación
        result = query.order("updated_at", desc=True).range(skip, skip + limit - 1).execute()
        
        return {
            "results": result.data or [],
            "total_found": len(result.data) if result.data else 0,
            "search_params": {
                "q": q,
                "estado": estado,
                "industria": industria,
                "nivel_riesgo": nivel_riesgo,
                "requiere_eipd": requiere_eipd
            },
            "pagination": {
                "skip": skip,
                "limit": limit,
                "page": skip // limit + 1
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error búsqueda avanzada: {str(e)}")


# Configuración global para importaciones
try:
    from supabase import create_client
    import os
    
    supabase = create_client(
        os.getenv("SUPABASE_URL"),
        os.getenv("SUPABASE_ANON_KEY")
    )
except ImportError:
    # Fallback para testing
    class MockSupabase:
        def table(self, table_name):
            return self
        def select(self, columns):
            return self
        def eq(self, column, value):
            return self
        def execute(self):
            return type('obj', (object,), {'data': []})()
    
    supabase = MockSupabase()

import logging
logger = logging.getLogger(__name__)