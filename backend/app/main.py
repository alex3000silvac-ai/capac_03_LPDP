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

from app.core.config import settings
from app.api.v1.api import api_router
from app.core.tenant import cleanup_tenant_connections, get_tenant_db, tenant_middleware

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestión del ciclo de vida de la aplicación"""
    # Startup
    print("🚀 Iniciando Sistema LPDP en Render...")
    print(f"🌐 Entorno: {os.getenv('ENVIRONMENT', 'development')}")
    print(f"🗄️ Base de datos: {os.getenv('DATABASE_URL', 'No configurada')[:50]}...")
    yield
    # Shutdown
    print("🛑 Cerrando Sistema LPDP...")
    cleanup_tenant_connections()


# Crear aplicación
app = FastAPI(
    title="Sistema LPDP - Ley 21.719",
    description="Sistema integral de cumplimiento de la Ley de Protección de Datos Personales de Chile",
    version="1.0.0",
    openapi_url="/api/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# Middleware personalizado para multi-tenant (DEBE IR ANTES QUE CORS)
@app.middleware("http")
async def tenant_middleware_wrapper(request: Request, call_next):
    return await tenant_middleware(request, call_next)

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

# Ruta de compatibilidad para el frontend (sin /api/v1)
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

# Ruta de salud para Render
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Sistema LPDP Backend",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development")
    }

# Ruta raíz
@app.get("/")
async def root():
    return {
        "message": "Sistema LPDP - Ley 21.719",
        "version": "1.0.0",
        "docs": "/api/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    # Forzar 0.0.0.0 para Render
    host = "0.0.0.0"
    uvicorn.run(app, host=host, port=port, access_log=True)