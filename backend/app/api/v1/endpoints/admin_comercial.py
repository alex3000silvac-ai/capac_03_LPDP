"""
API endpoints para administración comercial
"""
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.dependencies import get_current_superuser
from app.models import User
from app.services.admin_comercial_service import AdminComercialService
from app.schemas.admin import (
    EmpresaCreateRequest,
    EmpresaResponse,
    GestionModulosRequest,
    DashboardComercialResponse,
    PlanComercial
)

router = APIRouter()
admin_service = AdminComercialService()

@router.get("/dashboard", response_model=DashboardComercialResponse)
async def get_dashboard_comercial(
    fecha_desde: Optional[datetime] = Query(None),
    fecha_hasta: Optional[datetime] = Query(None),
    current_user: User = Depends(get_current_superuser),
    db: Session = Depends(get_db)
):
    """
    Dashboard comercial con métricas principales
    Solo para superadministradores
    """
    try:
        dashboard = admin_service.get_dashboard_comercial(
            db=db,
            admin_id=current_user.id,
            fecha_desde=fecha_desde,
            fecha_hasta=fecha_hasta
        )
        return dashboard
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/planes", response_model=List[PlanComercial])
async def get_planes_comerciales(
    current_user: User = Depends(get_current_superuser)
):
    """Obtiene los planes comerciales disponibles"""
    
    planes = []
    for codigo, plan in admin_service.PLANES_COMERCIALES.items():
        planes.append(PlanComercial(
            codigo=codigo,
            nombre=plan["nombre"],
            descripcion=plan["descripcion"],
            modulos=plan["modulos"],
            max_usuarios=plan["usuarios"],
            duracion_dias=plan["duracion_dias"],
            precio_clp=plan["precio_clp"]
        ))
    
    return planes

@router.get("/precios-modulos")
async def get_precios_modulos(
    current_user: User = Depends(get_current_superuser)
):
    """Obtiene precios individuales de módulos"""
    return admin_service.PRECIOS_MODULOS

@router.post("/empresas", response_model=EmpresaResponse)
async def crear_empresa_cliente(
    empresa_data: EmpresaCreateRequest,
    current_user: User = Depends(get_current_superuser),
    db: Session = Depends(get_db)
):
    """
    Crea una nueva empresa cliente con tenant y licencias
    """
    try:
        resultado = admin_service.crear_empresa_cliente(
            db=db,
            admin_id=current_user.id,
            **empresa_data.dict()
        )
        return resultado
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.put("/empresas/{empresa_id}/modulos")
async def gestionar_modulos_empresa(
    empresa_id: str,
    gestion_data: GestionModulosRequest,
    current_user: User = Depends(get_current_superuser),
    db: Session = Depends(get_db)
):
    """
    Gestiona módulos de una empresa (agregar, quitar, extender)
    """
    try:
        resultado = admin_service.gestionar_modulos_empresa(
            db=db,
            admin_id=current_user.id,
            empresa_id=empresa_id,
            **gestion_data.dict()
        )
        return resultado
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/empresas")
async def listar_empresas(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    filtro_comuna: Optional[str] = Query(None),
    filtro_plan: Optional[str] = Query(None),
    solo_activas: bool = Query(True),
    current_user: User = Depends(get_current_superuser),
    db: Session = Depends(get_db)
):
    """Lista empresas con filtros"""
    
    # TODO: Implementar listado con filtros
    return {
        "empresas": [],
        "total": 0,
        "skip": skip,
        "limit": limit
    }

@router.get("/empresas/{empresa_id}")
async def get_empresa_detalle(
    empresa_id: str,
    current_user: User = Depends(get_current_superuser),
    db: Session = Depends(get_db)
):
    """Obtiene detalle completo de una empresa"""
    
    # TODO: Implementar detalle empresa
    return {
        "empresa_id": empresa_id,
        "info": "TODO"
    }

@router.get("/reportes/export")
async def exportar_reporte(
    tipo_reporte: str = Query(..., description="Tipo de reporte"),
    formato: str = Query("excel", regex="^(excel|csv|pdf)$"),
    current_user: User = Depends(get_current_superuser),
    db: Session = Depends(get_db)
):
    """
    Exporta reportes comerciales
    Tipos: empresas_activas, ventas_periodo, uso_modulos, renovaciones
    """
    try:
        contenido = admin_service.exportar_reporte_comercial(
            db=db,
            admin_id=current_user.id,
            tipo_reporte=tipo_reporte,
            formato=formato
        )
        
        # Determinar content-type y filename
        if formato == "excel":
            media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            filename = f"{tipo_reporte}.xlsx"
        elif formato == "csv":
            media_type = "text/csv"
            filename = f"{tipo_reporte}.csv"
        elif formato == "pdf":
            media_type = "application/pdf"
            filename = f"{tipo_reporte}.pdf"
        else:
            media_type = "application/octet-stream"
            filename = f"{tipo_reporte}.{formato}"
        
        from fastapi.responses import Response
        
        return Response(
            content=contenido,
            media_type=media_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.post("/empresas/{empresa_id}/suspender")
async def suspender_empresa(
    empresa_id: str,
    motivo: str = Body(..., embed=True),
    current_user: User = Depends(get_current_superuser),
    db: Session = Depends(get_db)
):
    """Suspende una empresa y sus accesos"""
    
    # TODO: Implementar suspensión
    return {
        "empresa_id": empresa_id,
        "estado": "suspendida",
        "motivo": motivo,
        "fecha_suspension": datetime.utcnow().isoformat()
    }

@router.post("/empresas/{empresa_id}/reactivar")
async def reactivar_empresa(
    empresa_id: str,
    current_user: User = Depends(get_current_superuser),
    db: Session = Depends(get_db)
):
    """Reactiva una empresa suspendida"""
    
    # TODO: Implementar reactivación
    return {
        "empresa_id": empresa_id,
        "estado": "activa",
        "fecha_reactivacion": datetime.utcnow().isoformat()
    }

@router.get("/metricas/uso-tiempo-real")
async def get_metricas_tiempo_real(
    current_user: User = Depends(get_current_superuser),
    db: Session = Depends(get_db)
):
    """Obtiene métricas de uso en tiempo real"""
    
    # TODO: Implementar métricas tiempo real
    return {
        "usuarios_activos_ahora": 0,
        "sesiones_activas": 0,
        "modulos_en_uso": {},
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/alertas")
async def get_alertas_comerciales(
    current_user: User = Depends(get_current_superuser),
    db: Session = Depends(get_db)
):
    """Obtiene alertas comerciales importantes"""
    
    # TODO: Implementar sistema de alertas
    alertas = [
        {
            "tipo": "renovacion",
            "prioridad": "alta",
            "mensaje": "5 empresas con licencias por vencer en 7 días",
            "empresas_afectadas": 5,
            "fecha_limite": (datetime.utcnow() + timedelta(days=7)).isoformat()
        },
        {
            "tipo": "uso_bajo",
            "prioridad": "media", 
            "mensaje": "3 empresas sin actividad en 30 días",
            "empresas_afectadas": 3
        }
    ]
    
    return {"alertas": alertas}

@router.post("/notificaciones/renovaciones")
async def enviar_notificaciones_renovacion(
    dias_anticipacion: int = Body(30, embed=True),
    current_user: User = Depends(get_current_superuser),
    db: Session = Depends(get_db)
):
    """Envía notificaciones de renovación a empresas próximas a vencer"""
    
    # TODO: Implementar envío de notificaciones
    return {
        "enviadas": 0,
        "fallidas": 0,
        "mensaje": "Sistema de notificaciones no implementado"
    }