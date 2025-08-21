"""
Sistema de Autenticación DEMO - Ultra Restringido
Usuario: demo
Password: demo123
Solo visualización, sin navegación, sin modificaciones
"""
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
import logging

from app.core.database import get_master_db
from app.core.security_enhanced import (
    SecurityConfig, jwt_manager, audit_logger, rate_limiter
)

logger = logging.getLogger(__name__)
router = APIRouter()

# ============================================================================
# MODELOS PARA DEMO
# ============================================================================

class DemoLoginRequest(BaseModel):
    """Solicitud de login demo"""
    username: str
    password: str

class DemoLoginResponse(BaseModel):
    """Respuesta de login demo"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]
    restrictions: Dict[str, Any]
    demo_data: Dict[str, Any]

# ============================================================================
# DATOS DEMO PRECARGADOS
# ============================================================================

def get_demo_rat_data() -> Dict[str, Any]:
    """Retorna datos de RAT de demostración"""
    return {
        "id": "demo-rat-001",
        "nombre_actividad": "Gestión de Clientes (DEMO)",
        "area_responsable": "Departamento Comercial",
        "responsable_tratamiento": "Gerente Comercial Demo",
        "dpo_contacto": "dpo@empresa-demo.cl",
        
        "base_licitud": "Consentimiento",
        "base_licitud_detalle": "Consentimiento explícito para gestión de relación comercial y envío de información promocional",
        
        "categorias_datos": {
            "identificacion": ["Nombre completo", "RUT", "Fecha de nacimiento"],
            "contacto": ["Email corporativo", "Teléfono móvil", "Dirección postal"],
            "demograficos": ["Edad", "Género", "Profesión"],
            "economicos": ["Información crediticia", "Historial de pagos"],
            "educacion": [],
            "salud": [],
            "sensibles": []
        },
        
        "finalidad": "Gestión integral de la relación comercial con clientes",
        "finalidad_detallada": "Administración de cuentas, facturación, soporte técnico, análisis de satisfacción y envío de comunicaciones comerciales relevantes",
        
        "origen_datos": ["Formulario de registro web", "Contratos comerciales", "Interacciones de soporte"],
        "destinatarios": ["Equipo comercial interno", "Departamento de facturación"],
        "destinatarios_internos": ["Comercial", "Facturación", "Soporte", "Marketing"],
        "destinatarios_externos": ["Proveedor de servicios de pago", "Empresa de logística"],
        
        "transferencias_internacionales": {
            "existe": True,
            "paises": ["Estados Unidos", "Colombia"],
            "garantias": "Cláusulas Contractuales Tipo aprobadas por la Comisión Europea",
            "empresa_receptora": "AWS (Amazon Web Services) para hosting de datos"
        },
        
        "tiempo_conservacion": "5 años desde finalización de relación comercial",
        "criterios_supresion": "Eliminación automática tras 5 años de inactividad o solicitud expresa del titular",
        
        "medidas_seguridad": {
            "tecnicas": [
                "Encriptación AES-256",
                "Autenticación multifactor",
                "Firewall de aplicaciones web",
                "Respaldos automatizados",
                "Monitoreo 24/7"
            ],
            "organizativas": [
                "Política de privacidad actualizada",
                "Capacitación anual en protección de datos",
                "Procedimientos de respuesta a incidentes",
                "Auditorías internas trimestrales",
                "Control de acceso por roles"
            ]
        },
        
        "nivel_riesgo": "medio",
        "evaluacion_riesgos": "Riesgo moderado debido a transferencias internacionales y datos económicos. Medidas de seguridad implementadas mitigan los riesgos identificados.",
        "medidas_mitigacion": [
            "Implementación de CCT para transferencias",
            "Monitoreo continuo de accesos",
            "Encriptación end-to-end",
            "Capacitación específica al personal"
        ],
        
        "derechos_ejercidos": ["Acceso", "Rectificación", "Portabilidad"],
        "procedimiento_derechos": "Solicitudes mediante formulario web o email a dpo@empresa-demo.cl con respuesta en máximo 20 días hábiles",
        
        "version": "2.1",
        "estado": "aprobado",
        "observaciones": "RAT de demostración del sistema LPDP. Datos ficticios para propósitos de demo únicamente.",
        
        "fecha_creacion": "2024-01-15T10:30:00Z",
        "fecha_actualizacion": "2024-08-21T14:45:00Z",
        "created_by": "demo_user"
    }

def get_demo_empresa_data() -> Dict[str, Any]:
    """Retorna datos de empresa de demostración"""
    return {
        "nombre": "Innovación Digital SpA",
        "rut": "76.123.456-7",
        "razon_social": "Innovación Digital Soluciones Tecnológicas SpA",
        "email_principal": "contacto@innovacion-digital.cl",
        "telefono": "+56 2 2XXX XXXX",
        "direccion": "Av. Providencia 123, Piso 8, Oficina 802",
        "ciudad": "Santiago",
        "region": "Región Metropolitana",
        "codigo_postal": "7500000",
        
        "sector_economico": "Tecnologías de la Información",
        "tamano_empresa": "mediana",
        "numero_empleados": 85,
        
        "representante_nombre": "María José Silva Demo",
        "representante_cargo": "Gerente General",
        "representante_email": "gerencia@innovacion-digital.cl",
        
        "dpo_nombre": "Carlos Hernández Demo",
        "dpo_email": "dpo@innovacion-digital.cl",
        "dpo_certificaciones": ["IAPP CIPP/E", "ISO 27001 Lead Implementer"],
        
        "tipo_plan": "demo",
        "modulos_activos": ["modulo_0_introduccion"],
        "limitaciones_demo": {
            "solo_lectura": True,
            "sin_navegacion": True,
            "sin_edicion": True,
            "sin_creacion": True,
            "sin_exportacion": True,
            "tiempo_sesion_minutos": 15,
            "watermark_siempre": True
        }
    }

# ============================================================================
# ENDPOINTS DEMO
# ============================================================================

@router.post("/login", response_model=DemoLoginResponse)
async def demo_login(
    login_data: DemoLoginRequest,
    request: Request,
    db: Session = Depends(get_master_db)
):
    """
    Login específico para usuario demo ultra restringido
    Usuario: demo
    Password: demo123
    """
    try:
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        
        # Rate limiting específico para demo
        allowed, remaining = rate_limiter.check_rate_limit(
            f"demo_login_{client_ip}", max_attempts=5, window_seconds=300
        )
        if not allowed:
            audit_logger.log_security_event(
                "demo_login_rate_limit", "demo", "demo",
                {"ip_address": client_ip, "user_agent": user_agent},
                "WARNING"
            )
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Demasiados intentos de acceso demo. Intente nuevamente en 5 minutos."
            )
        
        # Validar credenciales demo exactas
        if login_data.username != "demo" or login_data.password != "demo123":
            audit_logger.log_security_event(
                "demo_login_failed", "demo", login_data.username,
                {"ip_address": client_ip, "reason": "invalid_credentials"},
                "WARNING"
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales de demo incorrectas. Use: demo / demo123"
            )
        
        # Crear usuario demo virtual con restricciones MÁXIMAS
        now = datetime.utcnow()
        demo_user = {
            "id": "demo_user_001",
            "username": "demo",
            "email": "demo@lpdp-sistema.cl", 
            "tenant_id": "demo_empresa_lpdp_2024",
            "organizacion_nombre": "Empresa Demo LPDP",
            "is_demo": True,
            "is_active": True,
            "is_superuser": False,
            "created_at": now.isoformat(),
            "last_login_at": now.isoformat(),
            
            # RESTRICCIONES ULTRA MÁXIMAS
            "permissions": ["demo_read_only"],
            "restrictions": {
                "solo_lectura_total": True,
                "sin_navegacion_libre": True,
                "sin_edicion": True,
                "sin_creacion": True,  
                "sin_eliminacion": True,
                "sin_exportacion": True,
                "sin_configuracion": True,
                "sin_usuarios": True,
                "sin_reportes": True,
                "tiempo_sesion_minutos": 15,
                "paginas_permitidas": ["/demo", "/demo/rat", "/demo/empresa"],
                "watermark_permanente": True,
                "alert_demo_permanente": True,
                "botones_deshabilitados": [
                    "guardar", "editar", "eliminar", "crear", "exportar",
                    "configurar", "usuarios", "reportes", "navegacion"
                ]
            }
        }
        
        # Crear tokens JWT con duración muy corta
        access_token = jwt_manager.create_access_token(
            data={
                "sub": demo_user["id"],
                "username": demo_user["username"],
                "email": demo_user["email"],
                "is_demo": True,
                "permissions": demo_user["permissions"],
                "restrictions": demo_user["restrictions"]
            },
            tenant_id="demo_empresa_lpdp_2024",
            expires_delta=timedelta(minutes=15)  # Sesión muy corta
        )
        
        refresh_token = jwt_manager.create_refresh_token(
            data={
                "sub": demo_user["id"],
                "username": demo_user["username"],
                "is_demo": True
            },
            tenant_id="demo_empresa_lpdp_2024",
            expires_delta=timedelta(minutes=30)  # Refresh corto también
        )
        
        # Log exitoso
        audit_logger.log_security_event(
            "demo_login_success", "demo_empresa_lpdp_2024", "demo",
            {
                "ip_address": client_ip,
                "user_agent": user_agent,
                "session_duration_minutes": 15,
                "restrictions_applied": len(demo_user["restrictions"])
            },
            "INFO"
        )
        
        # Respuesta con datos demo precargados
        return DemoLoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user=demo_user,
            restrictions=demo_user["restrictions"],
            demo_data={
                "empresa": get_demo_empresa_data(),
                "rat_ejemplo": get_demo_rat_data(),
                "mensaje_bienvenida": "¡Bienvenido al Sistema LPDP! Esta es una demostración de solo lectura.",
                "contacto_ventas": "ventas@lpdp-sistema.cl",
                "telefono_ventas": "+56 2 2XXX XXXX",
                "funcionalidades_completas": "Para acceso completo, solicite su cuenta empresarial.",
                "tiempo_sesion": "15 minutos",
                "limitaciones": [
                    "Solo visualización",
                    "No se pueden realizar cambios",
                    "No se pueden crear nuevos registros", 
                    "No se pueden exportar datos",
                    "Sesión limitada a 15 minutos"
                ]
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en login demo: {e}")
        audit_logger.log_security_event(
            "demo_login_error", "demo", "system",
            {"error": str(e), "ip_address": client_ip},
            "ERROR"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno en sistema demo"
        )

@router.get("/status")
async def demo_status(request: Request):
    """
    Estado del sistema demo
    """
    client_ip = request.client.host if request.client else "unknown"
    
    return {
        "demo_available": True,
        "credentials": {
            "username": "demo",
            "password": "demo123"
        },
        "restrictions": {
            "mode": "read_only",
            "session_duration_minutes": 15,
            "features_disabled": [
                "Edición de datos",
                "Creación de registros", 
                "Exportación de reportes",
                "Configuración del sistema",
                "Gestión de usuarios"
            ],
            "features_enabled": [
                "Visualización de RATs",
                "Navegación por módulos demo",
                "Vista de datos de empresa demo"
            ]
        },
        "demo_data_available": {
            "empresa": "Innovación Digital SpA (Demo)",
            "rats_ejemplo": 1,
            "modulos_disponibles": ["Módulo 0: Introducción LPDP"]
        },
        "contact": {
            "sales": "ventas@lpdp-sistema.cl",
            "support": "soporte@lpdp-sistema.cl",
            "message": "Para funcionalidades completas, solicite su cuenta empresarial"
        },
        "client_ip": client_ip,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/data/rat")
async def get_demo_rat_data_endpoint():
    """
    Retorna datos de RAT demo para visualización
    """
    return {
        "rat": get_demo_rat_data(),
        "metadata": {
            "demo": True,
            "read_only": True,
            "watermark": "DEMO - Solo visualización",
            "restrictions": "No se pueden realizar modificaciones"
        }
    }

@router.get("/data/empresa") 
async def get_demo_empresa_data_endpoint():
    """
    Retorna datos de empresa demo para visualización
    """
    return {
        "empresa": get_demo_empresa_data(),
        "metadata": {
            "demo": True,
            "read_only": True,
            "watermark": "DEMO - Datos ficticios",
            "restrictions": "Información de demostración únicamente"
        }
    }

@router.post("/extend-session")
async def extend_demo_session(
    request: Request,
    db: Session = Depends(get_master_db)
):
    """
    Intenta extender sesión demo (siempre deniega para forzar reconexión)
    """
    client_ip = request.client.host if request.client else "unknown"
    
    audit_logger.log_security_event(
        "demo_session_extend_denied", "demo", "demo",
        {"ip_address": client_ip, "reason": "max_demo_time_reached"},
        "INFO"
    )
    
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail={
            "message": "La sesión demo ha expirado",
            "action": "Por favor, inicie sesión nuevamente",
            "contact": "Para sesiones sin límite, solicite su cuenta empresarial",
            "sales": "ventas@lpdp-sistema.cl"
        }
    )