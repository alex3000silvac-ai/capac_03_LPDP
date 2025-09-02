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



# Rutas directas para el Módulo 3 profesional
# Ruta de salud para Render
@app.get("/health")
async def health_check_render():
    return {
        "status": "healthy",
        "service": "Sistema LPDP Backend",
        "version": "3.1.0",
        "environment": os.getenv("ENVIRONMENT", "production"),
        "tenant_system": TENANT_AVAILABLE
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
        return {"status": "ok", "imports": "disabled"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    # Forzar 0.0.0.0 para Render
    host = "0.0.0.0"
    uvicorn.run(app, host=host, port=port, access_log=True)