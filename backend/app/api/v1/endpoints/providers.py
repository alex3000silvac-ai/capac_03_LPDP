"""
🏢 PROVIDERS ENDPOINTS - API REST Completa para Gestión de Proveedores
Sistema completo de gestión de proveedores con DPAs según Art. 28-30 Ley 21.719
"""

from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, File
from typing import List, Optional
from datetime import datetime, timedelta
import json
import uuid

from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.tenant import get_tenant_id

router = APIRouter()

@router.get("/")
async def get_providers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=500),
    tipo: Optional[str] = Query(None),
    estado_dpa: Optional[str] = Query(None),
    nivel_riesgo: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    🏢 Obtener lista de proveedores con filtros
    """
    try:
        query = supabase.table("providers").select("*").eq("tenant_id", tenant_id)
        
        if tipo:
            query = query.eq("tipo", tipo)
        if estado_dpa:
            query = query.eq("estado_dpa", estado_dpa)
        if nivel_riesgo:
            query = query.eq("nivel_riesgo", nivel_riesgo)
        if search:
            query = query.or_(f"nombre.ilike.%{search}%,descripcion.ilike.%{search}%,rut.ilike.%{search}%")
            
        result = query.order("created_at", desc=True).range(skip, skip + limit - 1).execute()
        
        return {
            "providers": result.data or [],
            "total": len(result.data) if result.data else 0,
            "pagination": {
                "skip": skip,
                "limit": limit,
                "page": skip // limit + 1
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo proveedores: {str(e)}")


@router.post("/")
async def create_provider(
    provider_data: dict,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    ✨ Crear nuevo proveedor
    """
    try:
        # Validar datos requeridos
        required_fields = ["nombre", "rut", "tipo", "pais"]
        for field in required_fields:
            if field not in provider_data:
                raise HTTPException(status_code=400, detail=f"Campo requerido: {field}")
        
        # Preparar datos
        provider_dict = {
            **provider_data,
            "tenant_id": tenant_id,
            "created_by": current_user.id,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "estado": "ACTIVO",
            "estado_dpa": "PENDIENTE",
            "codigo_proveedor": f"PROV-{uuid.uuid4().hex[:8].upper()}"
        }
        
        # Determinar nivel de riesgo inicial
        if provider_data.get("pais") != "Chile":
            provider_dict["nivel_riesgo"] = "ALTO"
            provider_dict["requiere_transferencia_internacional"] = True
        elif provider_data.get("tipo") in ["cloud", "procesamiento_datos", "almacenamiento"]:
            provider_dict["nivel_riesgo"] = "MEDIO"
        else:
            provider_dict["nivel_riesgo"] = "BAJO"
        
        # Insertar
        result = supabase.table("providers").insert(provider_dict).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Error creando proveedor")
            
        return {
            "message": "Proveedor creado exitosamente",
            "provider": result.data[0]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creando proveedor: {str(e)}")


@router.get("/{provider_id}")
async def get_provider(
    provider_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    📄 Obtener proveedor específico
    """
    try:
        result = supabase.table("providers").select("*").eq("id", provider_id).eq("tenant_id", tenant_id).single().execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Proveedor no encontrado")
            
        return result.data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo proveedor: {str(e)}")


@router.put("/{provider_id}")
async def update_provider(
    provider_id: int,
    provider_data: dict,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    📝 Actualizar proveedor existente
    """
    try:
        # Verificar existencia
        existing = supabase.table("providers").select("*").eq("id", provider_id).eq("tenant_id", tenant_id).single().execute()
        
        if not existing.data:
            raise HTTPException(status_code=404, detail="Proveedor no encontrado")
        
        # Preparar actualización
        update_dict = {
            **provider_data,
            "updated_at": datetime.utcnow().isoformat(),
            "updated_by": current_user.id
        }
        
        # Actualizar nivel de riesgo si cambió país o tipo
        if "pais" in provider_data or "tipo" in provider_data:
            pais = provider_data.get("pais", existing.data.get("pais"))
            tipo = provider_data.get("tipo", existing.data.get("tipo"))
            
            if pais != "Chile":
                update_dict["nivel_riesgo"] = "ALTO"
                update_dict["requiere_transferencia_internacional"] = True
            elif tipo in ["cloud", "procesamiento_datos", "almacenamiento"]:
                update_dict["nivel_riesgo"] = "MEDIO"
            else:
                update_dict["nivel_riesgo"] = "BAJO"
        
        result = supabase.table("providers").update(update_dict).eq("id", provider_id).eq("tenant_id", tenant_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Error actualizando proveedor")
            
        return {
            "message": "Proveedor actualizado exitosamente",
            "provider": result.data[0]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error actualizando proveedor: {str(e)}")


@router.post("/{provider_id}/generate-dpa")
async def generate_dpa(
    provider_id: int,
    dpa_config: dict,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    📝 Generar DPA automático para proveedor
    """
    try:
        # Obtener proveedor
        provider = supabase.table("providers").select("*").eq("id", provider_id).eq("tenant_id", tenant_id).single().execute()
        
        if not provider.data:
            raise HTTPException(status_code=404, detail="Proveedor no encontrado")
        
        # Obtener información tenant para contrato
        tenant = supabase.table("tenants").select("*").eq("id", tenant_id).single().execute()
        
        # Generar DPA según tipo de proveedor y riesgo
        dpa_template = generate_dpa_template(provider.data, tenant.data, dpa_config)
        
        # Guardar DPA generado
        dpa_data = {
            "tenant_id": tenant_id,
            "provider_id": provider_id,
            "tipo_dpa": dpa_template["tipo"],
            "clausulas": dpa_template["clausulas"],
            "medidas_seguridad": dpa_template["medidas_seguridad"],
            "duracion_contrato": dpa_config.get("duracion_meses", 12),
            "generated_at": datetime.utcnow().isoformat(),
            "generated_by": current_user.id,
            "estado": "BORRADOR",
            "version": 1
        }
        
        result = supabase.table("dpas").insert(dpa_data).execute()
        
        # Actualizar proveedor con DPA
        supabase.table("providers").update({
            "estado_dpa": "DPA_GENERADO",
            "dpa_id": result.data[0]["id"],
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", provider_id).execute()
        
        return {
            "message": "DPA generado exitosamente",
            "dpa": result.data[0],
            "template_used": dpa_template["tipo"],
            "next_steps": [
                "Revisar cláusulas generadas",
                "Personalizar medidas de seguridad",
                "Enviar para revisión legal",
                "Negociar con proveedor"
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando DPA: {str(e)}")


def generate_dpa_template(provider_data, tenant_data, config):
    """Helper para generar plantilla DPA según tipo de proveedor"""
    
    # Determinar tipo de DPA según proveedor
    if provider_data.get("pais") != "Chile":
        dpa_type = "TRANSFERENCIA_INTERNACIONAL"
    elif provider_data.get("tipo") == "cloud":
        dpa_type = "SERVICIOS_CLOUD"
    elif provider_data.get("tipo") == "procesamiento_datos":
        dpa_type = "PROCESAMIENTO_TERCEROS"
    else:
        dpa_type = "SERVICIOS_GENERALES"
    
    # Clausulas base según tipo
    clausulas_base = {
        "TRANSFERENCIA_INTERNACIONAL": [
            "Adecuación del país de destino (Art. 29 Ley 21.719)",
            "Garantías apropiadas para la transferencia",
            "Derechos de titulares en país extranjero",
            "Supervisión y auditorías periódicas",
            "Certificaciones de seguridad internacionales"
        ],
        "SERVICIOS_CLOUD": [
            "Localización de datos en centros certificados",
            "Cifrado en tránsito y en reposo",
            "Acceso controlado con autenticación multifactor",
            "Respaldo y recuperación de datos",
            "Notificación de incidentes de seguridad"
        ],
        "PROCESAMIENTO_TERCEROS": [
            "Procesamiento únicamente según instrucciones",
            "Confidencialidad del personal autorizado",
            "Medidas técnicas y organizativas apropiadas",
            "Asistencia en respuesta a derechos de titulares",
            "Eliminación/devolución al finalizar contrato"
        ],
        "SERVICIOS_GENERALES": [
            "Propósito específico del tratamiento",
            "Minimización de datos tratados",
            "Plazo determinado de retención",
            "Medidas de seguridad básicas",
            "Notificación de cambios en el servicio"
        ]
    }
    
    # Medidas de seguridad según nivel de riesgo
    medidas_seguridad = {
        "ALTO": [
            "Cifrado AES-256 mínimo",
            "Auditorías de seguridad trimestrales", 
            "Certificación ISO 27001 vigente",
            "Logs de acceso inmutables",
            "Plan de continuidad de negocio",
            "Seguro de ciberseguridad"
        ],
        "MEDIO": [
            "Cifrado en tránsito TLS 1.3",
            "Auditorías de seguridad semestrales",
            "Certificaciones de seguridad reconocidas",
            "Logs de acceso centralizados",
            "Procedimientos de respuesta a incidentes"
        ],
        "BAJO": [
            "Cifrado en tránsito TLS 1.2+",
            "Auditorías de seguridad anuales",
            "Políticas de seguridad documentadas",
            "Logs básicos de acceso",
            "Contacto para incidentes de seguridad"
        ]
    }
    
    return {
        "tipo": dpa_type,
        "clausulas": clausulas_base[dpa_type],
        "medidas_seguridad": medidas_seguridad.get(provider_data.get("nivel_riesgo", "BAJO"), medidas_seguridad["BAJO"]),
        "template_version": "1.0",
        "generated_for": {
            "tenant": tenant_data.get("company_name"),
            "provider": provider_data.get("nombre"),
            "risk_level": provider_data.get("nivel_riesgo")
        }
    }


@router.get("/{provider_id}/dpa")
async def get_provider_dpa(
    provider_id: int,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    📋 Obtener DPA del proveedor
    """
    try:
        # Obtener DPA asociado al proveedor
        result = supabase.table("dpas").select("*").eq("provider_id", provider_id).eq("tenant_id", tenant_id).order("version", desc=True).limit(1).execute()
        
        if not result.data:
            return {
                "provider_id": provider_id,
                "dpa_exists": False,
                "message": "No hay DPA generado para este proveedor",
                "action_required": "Generar DPA automático"
            }
            
        return {
            "provider_id": provider_id,
            "dpa_exists": True,
            "dpa": result.data[0],
            "actions_available": [
                "Descargar DPA en PDF",
                "Editar cláusulas",
                "Enviar para firma",
                "Crear nueva versión"
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo DPA: {str(e)}")


@router.post("/{provider_id}/dpa/approve")
async def approve_provider_dpa(
    provider_id: int,
    approval_data: dict,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    ✅ Aprobar DPA de proveedor (solo DPO/Legal)
    """
    try:
        # Verificar permisos
        if not any(perm in current_user.permissions for perm in ["dpo.approve", "legal.approve"]) and not current_user.is_superuser:
            raise HTTPException(status_code=403, detail="Solo DPO o Legal pueden aprobar DPAs")
        
        # Obtener DPA actual
        dpa = supabase.table("dpas").select("*").eq("provider_id", provider_id).eq("tenant_id", tenant_id).order("version", desc=True).limit(1).execute()
        
        if not dpa.data:
            raise HTTPException(status_code=404, detail="DPA no encontrado")
            
        if dpa.data[0]["estado"] not in ["BORRADOR", "EN_REVISION"]:
            raise HTTPException(status_code=400, detail="DPA debe estar en borrador o revisión")
        
        # Aprobar DPA
        update_data = {
            "estado": "APROBADO",
            "approved_at": datetime.utcnow().isoformat(),
            "approved_by": current_user.id,
            "approval_notes": approval_data.get("notes", ""),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        supabase.table("dpas").update(update_data).eq("id", dpa.data[0]["id"]).execute()
        
        # Actualizar proveedor
        supabase.table("providers").update({
            "estado_dpa": "APROBADO",
            "dpa_approved_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", provider_id).execute()
        
        return {
            "message": "DPA aprobado exitosamente",
            "provider_id": provider_id,
            "dpa_id": dpa.data[0]["id"],
            "approved_at": datetime.utcnow().isoformat(),
            "next_steps": [
                "Enviar DPA firmado al proveedor",
                "Programar revisión anual",
                "Activar monitoreo de compliance"
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error aprobando DPA: {str(e)}")


@router.get("/analytics/risk-assessment")
async def get_providers_risk_analytics(
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    📊 Analytics de riesgo de proveedores
    """
    try:
        # Obtener todos los proveedores
        providers = supabase.table("providers").select("*").eq("tenant_id", tenant_id).execute()
        providers_data = providers.data or []
        
        # Calcular analytics
        analytics = {
            "total_providers": len(providers_data),
            "by_risk_level": {"ALTO": 0, "MEDIO": 0, "BAJO": 0},
            "by_dpa_status": {},
            "by_country": {},
            "by_type": {},
            "international_transfers": 0,
            "pending_dpas": 0,
            "expired_contracts": 0,
            "compliance_score": 0
        }
        
        # Agrupar estadísticas
        for provider in providers_data:
            # Nivel de riesgo
            risk = provider.get("nivel_riesgo", "BAJO")
            analytics["by_risk_level"][risk] += 1
            
            # Estado DPA
            dpa_status = provider.get("estado_dpa", "PENDIENTE")
            analytics["by_dpa_status"][dpa_status] = analytics["by_dpa_status"].get(dpa_status, 0) + 1
            
            # País
            country = provider.get("pais", "Chile")
            analytics["by_country"][country] = analytics["by_country"].get(country, 0) + 1
            
            # Tipo
            tipo = provider.get("tipo", "general")
            analytics["by_type"][tipo] = analytics["by_type"].get(tipo, 0) + 1
            
            # Contadores específicos
            if provider.get("requiere_transferencia_internacional"):
                analytics["international_transfers"] += 1
            if dpa_status == "PENDIENTE":
                analytics["pending_dpas"] += 1
            
            # Contratos expirados
            if provider.get("contract_expires_at"):
                try:
                    expires_at = datetime.fromisoformat(provider["contract_expires_at"].replace("Z", "+00:00"))
                    if expires_at < datetime.utcnow():
                        analytics["expired_contracts"] += 1
                except:
                    pass
        
        # Calcular compliance score
        if analytics["total_providers"] > 0:
            approved_dpas = analytics["by_dpa_status"].get("APROBADO", 0)
            analytics["compliance_score"] = round((approved_dpas / analytics["total_providers"]) * 100, 2)
        
        # Generar recomendaciones
        recommendations = []
        
        if analytics["pending_dpas"] > 0:
            recommendations.append({
                "priority": "HIGH",
                "issue": f"{analytics['pending_dpas']} proveedores sin DPA",
                "action": "Generar y negociar DPAs pendientes"
            })
        
        if analytics["international_transfers"] > 0:
            recommendations.append({
                "priority": "CRITICAL",
                "issue": f"{analytics['international_transfers']} transferencias internacionales",
                "action": "Verificar adecuación de países destino"
            })
        
        if analytics["expired_contracts"] > 0:
            recommendations.append({
                "priority": "MEDIUM",
                "issue": f"{analytics['expired_contracts']} contratos expirados",
                "action": "Renovar contratos y DPAs vencidos"
            })
        
        return {
            "tenant_id": tenant_id,
            "analytics": analytics,
            "recommendations": recommendations,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analytics proveedores: {str(e)}")


@router.post("/{provider_id}/upload-contract")
async def upload_provider_contract(
    provider_id: int,
    file: UploadFile = File(...),
    contract_type: str = Query(..., regex="^(dpa|servicio|confidencialidad)$"),
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    📎 Subir contrato de proveedor
    """
    try:
        # Validar archivo
        if file.size > 10 * 1024 * 1024:  # 10MB max
            raise HTTPException(status_code=400, detail="Archivo muy grande (máx 10MB)")
        
        if not file.filename.lower().endswith(('.pdf', '.doc', '.docx')):
            raise HTTPException(status_code=400, detail="Solo archivos PDF, DOC, DOCX permitidos")
        
        # Verificar proveedor existe
        provider = supabase.table("providers").select("id").eq("id", provider_id).eq("tenant_id", tenant_id).single().execute()
        
        if not provider.data:
            raise HTTPException(status_code=404, detail="Proveedor no encontrado")
        
        # En implementación real: subir archivo a storage
        file_content = await file.read()
        file_path = f"contracts/{tenant_id}/{provider_id}/{file.filename}"
        
        # Guardar metadata del contrato
        contract_data = {
            "tenant_id": tenant_id,
            "provider_id": provider_id,
            "contract_type": contract_type,
            "filename": file.filename,
            "file_path": file_path,
            "file_size": len(file_content),
            "uploaded_by": current_user.id,
            "uploaded_at": datetime.utcnow().isoformat(),
            "status": "UPLOADED"
        }
        
        result = supabase.table("provider_contracts").insert(contract_data).execute()
        
        # Actualizar estado DPA del proveedor si es DPA
        if contract_type == "dpa":
            supabase.table("providers").update({
                "estado_dpa": "CONTRATO_SUBIDO",
                "contract_uploaded_at": datetime.utcnow().isoformat()
            }).eq("id", provider_id).execute()
        
        return {
            "message": "Contrato subido exitosamente",
            "contract_id": result.data[0]["id"],
            "file_info": {
                "filename": file.filename,
                "size": len(file_content),
                "type": contract_type
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error subiendo contrato: {str(e)}")


@router.get("/compliance/dashboard")
async def get_providers_compliance_dashboard(
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    📊 Dashboard de compliance de proveedores
    """
    try:
        # Obtener proveedores con sus DPAs
        providers = supabase.table("providers").select("*").eq("tenant_id", tenant_id).execute()
        providers_data = providers.data or []
        
        # Obtener DPAs
        dpas = supabase.table("dpas").select("*").eq("tenant_id", tenant_id).execute()
        dpas_data = dpas.data or []
        
        # Dashboard metrics
        dashboard = {
            "overview": {
                "total_providers": len(providers_data),
                "compliance_rate": 0,
                "high_risk_providers": len([p for p in providers_data if p.get("nivel_riesgo") == "ALTO"]),
                "international_providers": len([p for p in providers_data if p.get("pais") != "Chile"])
            },
            "dpa_status": {
                "approved": len([p for p in providers_data if p.get("estado_dpa") == "APROBADO"]),
                "pending": len([p for p in providers_data if p.get("estado_dpa") == "PENDIENTE"]),
                "in_negotiation": len([p for p in providers_data if p.get("estado_dpa") == "EN_NEGOCIACION"]),
                "expired": 0
            },
            "upcoming_deadlines": [],
            "critical_issues": [],
            "recommendations": []
        }
        
        # Calcular compliance rate
        if dashboard["overview"]["total_providers"] > 0:
            approved = dashboard["dpa_status"]["approved"]
            dashboard["overview"]["compliance_rate"] = round((approved / dashboard["overview"]["total_providers"]) * 100, 2)
        
        # Identificar issues críticos
        for provider in providers_data:
            if provider.get("nivel_riesgo") == "ALTO" and provider.get("estado_dpa") != "APROBADO":
                dashboard["critical_issues"].append({
                    "provider_id": provider["id"],
                    "provider_name": provider["nombre"],
                    "issue": "Proveedor alto riesgo sin DPA aprobado",
                    "priority": "CRITICAL"
                })
        
        # Generar recomendaciones
        if dashboard["dpa_status"]["pending"] > 0:
            dashboard["recommendations"].append({
                "category": "DPA_MANAGEMENT",
                "title": "DPAs Pendientes",
                "description": f"{dashboard['dpa_status']['pending']} proveedores requieren DPA",
                "action": "Priorizar generación y negociación de DPAs"
            })
        
        if dashboard["overview"]["international_providers"] > 0:
            dashboard["recommendations"].append({
                "category": "INTERNATIONAL_TRANSFERS",
                "title": "Transferencias Internacionales",
                "description": f"{dashboard['overview']['international_providers']} proveedores internacionales",
                "action": "Verificar adecuación de países y garantías"
            })
        
        return {
            "tenant_id": tenant_id,
            "dashboard": dashboard,
            "generated_at": datetime.utcnow().isoformat(),
            "period": "current"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error dashboard compliance: {str(e)}")


@router.post("/bulk/risk-assessment")
async def bulk_provider_risk_assessment(
    provider_ids: List[int],
    db=Depends(get_db),
    current_user=Depends(get_current_user),
    tenant_id=Depends(get_tenant_id)
):
    """
    🔍 Evaluación masiva de riesgo de proveedores
    """
    try:
        if len(provider_ids) > 50:
            raise HTTPException(status_code=400, detail="Máximo 50 proveedores por evaluación masiva")
        
        assessments = []
        
        for provider_id in provider_ids:
            try:
                # Obtener proveedor
                provider = supabase.table("providers").select("*").eq("id", provider_id).eq("tenant_id", tenant_id).single().execute()
                
                if not provider.data:
                    assessments.append({
                        "provider_id": provider_id,
                        "status": "ERROR",
                        "message": "Proveedor no encontrado"
                    })
                    continue
                
                # Evaluar riesgo
                risk_assessment = evaluate_provider_risk(provider.data)
                
                # Actualizar proveedor con evaluación
                supabase.table("providers").update({
                    "nivel_riesgo": risk_assessment["nivel_riesgo"],
                    "risk_factors": risk_assessment["risk_factors"],
                    "mitigation_required": risk_assessment["mitigation_required"],
                    "last_risk_assessment": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat()
                }).eq("id", provider_id).execute()
                
                assessments.append({
                    "provider_id": provider_id,
                    "provider_name": provider.data["nombre"],
                    "status": "SUCCESS",
                    "assessment": risk_assessment
                })
                
            except Exception as e:
                assessments.append({
                    "provider_id": provider_id,
                    "status": "ERROR",
                    "message": str(e)
                })
        
        return {
            "total_assessed": len(provider_ids),
            "successful": len([a for a in assessments if a["status"] == "SUCCESS"]),
            "errors": len([a for a in assessments if a["status"] == "ERROR"]),
            "assessments": assessments,
            "assessment_timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error evaluación masiva: {str(e)}")


def evaluate_provider_risk(provider_data):
    """Helper para evaluar riesgo de proveedor"""
    
    risk_factors = []
    score = 0
    
    # Factor país
    if provider_data.get("pais") != "Chile":
        risk_factors.append("Transferencia internacional")
        score += 30
    
    # Factor tipo de servicio
    high_risk_types = ["cloud", "procesamiento_datos", "almacenamiento", "analytics"]
    if provider_data.get("tipo") in high_risk_types:
        risk_factors.append("Servicio alto riesgo para datos")
        score += 25
    
    # Factor certificaciones
    if not provider_data.get("certificaciones_seguridad"):
        risk_factors.append("Sin certificaciones de seguridad")
        score += 20
    
    # Factor tamaño empresa
    if provider_data.get("tamaño_empresa") == "startup":
        risk_factors.append("Empresa nueva sin track record")
        score += 15
    
    # Factor datos sensibles
    if provider_data.get("acceso_datos_sensibles"):
        risk_factors.append("Acceso a datos especialmente sensibles")
        score += 25
    
    # Determinar nivel
    if score >= 70:
        nivel_riesgo = "CRÍTICO"
    elif score >= 50:
        nivel_riesgo = "ALTO"
    elif score >= 30:
        nivel_riesgo = "MEDIO"
    else:
        nivel_riesgo = "BAJO"
    
    # Medidas de mitigación requeridas
    mitigation_required = []
    if score >= 50:
        mitigation_required.extend([
            "DPA con cláusulas reforzadas",
            "Auditorías de seguridad frecuentes",
            "Monitoreo continuo de acceso"
        ])
    if provider_data.get("pais") != "Chile":
        mitigation_required.append("Verificación adecuación país destino")
    if not provider_data.get("certificaciones_seguridad"):
        mitigation_required.append("Exigir certificaciones ISO 27001 o similares")
    
    return {
        "nivel_riesgo": nivel_riesgo,
        "risk_score": score,
        "risk_factors": risk_factors,
        "mitigation_required": mitigation_required,
        "assessment_date": datetime.utcnow().isoformat()
    }


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