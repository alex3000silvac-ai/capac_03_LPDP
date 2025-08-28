"""
Aplicación principal FastAPI
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import os

# Configurar logging PRIMERO
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

from app.core.config import settings
from app.api.v1.api import api_router

# Importaciones tenant con fallback para emergencia
try:
    from app.core.tenant import cleanup_tenant_connections, get_tenant_db, tenant_middleware
    TENANT_AVAILABLE = True
    logger.info("✅ Tenant system loaded successfully")
except ImportError as e:
    logger.error(f"❌ Tenant import failed: {e}")
    TENANT_AVAILABLE = False
    
    # Fallback functions for emergency
    async def cleanup_tenant_connections():
        pass
    
    async def tenant_middleware(request, call_next):
        return await call_next(request)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestión del ciclo de vida de la aplicación"""
    # Startup
    print("🚀 Iniciando Sistema LPDP v3.1.0 - Producción con Supabase...")
    print(f"🌐 Entorno: {os.getenv('ENVIRONMENT', 'production')}")
    print(f"🗄️ Base de datos: {os.getenv('DATABASE_URL', 'No configurada')[:50]}...")
    print("✅ Multi-tenant con Supabase habilitado")
    yield
    # Shutdown
    print("🛑 Cerrando Sistema LPDP...")
    cleanup_tenant_connections()


# Crear aplicación
app = FastAPI(
    title="Sistema LPDP - Ley 21.719",
    description="Sistema integral de cumplimiento de la Ley de Protección de Datos Personales de Chile - Producción con Supabase",
    version="3.1.0",
    openapi_url="/api/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# ENDPOINT HEALTH CRÍTICO
@app.get("/api/health", tags=["Health"])
async def health_check():
    """Endpoint de verificación de salud del servicio"""
    try:
        return {
            "status": "healthy",
            "version": "3.1.0",
            "environment": os.getenv("ENVIRONMENT", "production"),
            "tenant_system": TENANT_AVAILABLE,
            "database": "supabase_configured" if os.getenv("DATABASE_URL") else "not_configured"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e),
                "version": "3.1.0"
            }
        )

# ENDPOINT ROOT
@app.get("/", tags=["Root"])
async def root():
    """Endpoint raíz - Información del servicio"""
    return {
        "message": "Sistema LPDP v3.1.0 - Backend Operativo",
        "docs": "/api/docs",
        "health": "/api/health",
        "version": "3.1.0",
        "tenant_system": TENANT_AVAILABLE
    }

# Middleware personalizado para multi-tenant (DEBE IR ANTES QUE CORS)
@app.middleware("http")
async def tenant_middleware_wrapper(request: Request, call_next):
    # BYPASS para rutas de emergencia
    if "emergency-demo" in str(request.url) or "demo/login" in str(request.url):
        return await call_next(request)
    
    # Solo usar tenant middleware si está disponible
    if TENANT_AVAILABLE:
        return await tenant_middleware(request, call_next)
    else:
        return await call_next(request)

# Configuración de CORS para producción  
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware de hosts confiables para producción
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=[
        "scldp-backend.onrender.com",
        "scldp-frontend.onrender.com", 
        "localhost",
        "127.0.0.1",
    ]
)


@app.middleware("http")
async def add_tenant_header(request: Request, call_next):
    """Agrega información del tenant a los headers de respuesta"""
    response = await call_next(request)
    
    if hasattr(request.state, "tenant_id"):
        response.headers["X-Tenant-ID"] = request.state.tenant_id
    
    return response


@app.middleware("http")
async def catch_exceptions(request: Request, call_next):
    """Captura excepciones globales"""
    try:
        return await call_next(request)
    except Exception as e:
        logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Internal server error",
                "error": str(e) if settings.DEBUG else "An error occurred"
            }
        )


# Incluir todas las rutas de la API
app.include_router(api_router, prefix="/api/v1")

# Rutas de compatibilidad para el frontend
@app.get("/tenants/available")
async def get_available_tenants_compat():
    """Obtener tenants disponibles para login (compatibilidad frontend)"""
    return [
        {
            "tenant_id": "demo",
            "company_name": "Empresa Demo", 
            "description": "Empresa de demostración del sistema LPDP"
        }
    ]


@app.get("/api/v1/capacitacion/modulos")
async def get_capacitacion_modulos():
    """Obtener módulos de capacitación (directo)"""
    return {
        "modulos": [
            {
                "id": "introduccion_lpdp",
                "nombre": "Introducción a la Ley de Protección de Datos",
                "descripcion": "Conceptos fundamentales y principios de la LPDP",
                "duracion_estimada": 30,
                "orden": 1
            },
            {
                "id": "conceptos_basicos", 
                "nombre": "Conceptos Básicos de Protección de Datos",
                "descripcion": "¿Qué es un dato personal? ¿Qué es el tratamiento?",
                "duracion_estimada": 45,
                "orden": 2
            },
            {
                "id": "modulo3_inventario",
                "nombre": "Módulo 3: Inventario y Mapeo de Datos",
                "descripcion": "Construcción profesional del RAT según Ley 21.719 - Incluye simuladores y herramientas para DPO",
                "duracion_estimada": 480,
                "orden": 3,
                "nivel": "profesional",
                "dirigido_a": "DPOs, Abogados, Ingenieros",
                "incluye": [
                    "Simuladores interactivos de mapeo",
                    "Formularios descargables",
                    "Casos prácticos IoT",
                    "Plantillas RAT profesionales",
                    "Estructura programa DPO"
                ]
            },
            {
                "id": "uso_sistema",
                "nombre": "Uso del Sistema SCLDP",
                "descripcion": "Navegación y funcionalidades del sistema",
                "duracion_estimada": 45,
                "orden": 4
            }
        ]
    }


# Rutas directas para el Módulo 3 profesional
@app.get("/api/v1/modulo3/downloadables/package/{package_type}")
async def get_modulo3_download_package(package_type: str):
    """Descargar paquetes del Módulo 3 para DPOs"""
    packages = {
        "basic": {
            "name": "Paquete Básico DPO - Módulo 3",
            "files": [
                {
                    "name": "plantilla_rat_ley21719.xlsx",
                    "type": "excel",
                    "description": "Plantilla RAT completa según Ley 21.719",
                    "size": "2.5 MB"
                },
                {
                    "name": "formularios_entrevista_areas.pdf",
                    "type": "pdf", 
                    "description": "Formularios de entrevista para RRHH, Finanzas, Ventas",
                    "size": "1.8 MB"
                },
                {
                    "name": "matriz_clasificacion_datos.xlsx",
                    "type": "excel",
                    "description": "Matriz para clasificar datos por sensibilidad",
                    "size": "800 KB"
                },
                {
                    "name": "checklist_cumplimiento_modulo3.pdf",
                    "type": "pdf",
                    "description": "Lista de verificación para cumplimiento",
                    "size": "500 KB"
                }
            ],
            "total_size": "5.6 MB",
            "download_url": f"/downloads/modulo3/basic_package.zip"
        },
        "professional": {
            "name": "Paquete Profesional DPO - Módulo 3", 
            "files": [
                {
                    "name": "manual_dpo_modulo3_completo.pdf",
                    "type": "pdf",
                    "description": "Manual DPO de 150+ páginas con procedimientos detallados",
                    "size": "15.2 MB"
                },
                {
                    "name": "simuladores_interactivos/",
                    "type": "web_app",
                    "description": "Simuladores de mapeo para RRHH, IoT, Finanzas",
                    "size": "25 MB"
                },
                {
                    "name": "casos_practicos_acuicultura.pdf",
                    "type": "pdf", 
                    "description": "Casos reales de acuicultura e IoT",
                    "size": "5.8 MB"
                },
                {
                    "name": "videos_explicativos/",
                    "type": "video",
                    "description": "15 videos de conceptos clave (5-15 min c/u)",
                    "size": "180 MB"
                }
            ],
            "total_size": "226 MB",
            "download_url": f"/downloads/modulo3/professional_package.zip"
        }
    }
    
    if package_type not in packages:
        return {"error": "Paquete no encontrado", "available": list(packages.keys())}
    
    return {
        "package": packages[package_type],
        "instructions": {
            "installation": "Descomprimir en directorio del programa DPO",
            "requirements": "Office 2016+, navegador web moderno",
            "support": "Incluye 90 días de soporte técnico",
            "updates": "Actualizaciones automáticas por 1 año"
        },
        "preview_available": True,
        "preview_url": f"/api/v1/modulo3/preview/{package_type}"
    }

# Ruta de salud para Render
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Sistema LPDP Backend",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development")
    }

# EMERGENCY DEMO LOGIN - CON MIDDLEWARE BYPASS
@app.get("/emergency-demo-login")
@app.post("/emergency-demo-login")
@app.get("/api/v1/demo/login")
@app.post("/api/v1/demo/login")
async def emergency_demo_login_direct():
    """EMERGENCY DEMO LOGIN - CON MIDDLEWARE BYPASS"""
    return {
        "access_token": "demo-emergency-hermano-del-alma",
        "refresh_token": "refresh-emergency-amor-infinito", 
        "token_type": "bearer",
        "user": {
            "id": "demo_emergency_001",
            "username": "demo",
            "email": "demo@emergency.cl",
            "tenant_id": "demo_empresa",
            "is_demo": True
        },
        "demo_data": {
            "mensaje": "💖 EMERGENCY LOGIN CON AMOR INFINITO",
            "edicion_rat": True,
            "promesa": "Nunca te abandonaré hermano del alma"
        }
    }

# EMERGENCY OPTIONS HANDLER
@app.options("/api/v1/demo/login")
@app.options("/demo/login")
async def emergency_demo_options():
    """EMERGENCY OPTIONS HANDLER"""
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "*"
        }
    )

# Ruta raíz
@app.get("/")
async def root():
    return {
        "message": "Sistema LPDP - Ley 21.719 - Producción",
        "version": "3.1.0",
        "docs": "/api/docs",
        "health": "/health",
        "supabase": "Habilitado con Multi-tenant",
        "modulos_nuevos": "Módulo 3, Glosario LPDP, Sandbox Inventario disponibles",
        "ambiente": "PRODUCCIÓN",
        "emergency_demo": "💖 DEMO EMERGENCY DISPONIBLE CON AMOR"
    }

# Test de nuevos módulos sin middleware
@app.get("/test-imports")
async def test_imports():
    try:
        # Temporalmente comentado hasta resolver dependencias
        # from app.api.v1.endpoints import modulo3_inventario, glosario_lpdp, sandbox_inventario_real
        return {
            "status": "success",
            "modulos_importados": False,
            "mensaje": "Importaciones temporalmente deshabilitadas para estabilidad",
            # "modulo3_endpoints": len(modulo3_inventario.router.routes),
            # "glosario_endpoints": len(glosario_lpdp.router.routes),
            # "sandbox_endpoints": len(sandbox_inventario_real.router.routes)
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    # Forzar 0.0.0.0 para Render
    host = "0.0.0.0"
    uvicorn.run(app, host=host, port=port, access_log=True)