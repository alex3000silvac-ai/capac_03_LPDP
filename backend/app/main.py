"""
Aplicación principal FastAPI
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
from app.core.config import settings
from app.api.v1.api import api_router
from app.core.tenant import cleanup_tenant_connections

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
    logger.info("Starting up Jurídica Digital LPDP System...")
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")
    cleanup_tenant_connections()


# Crear aplicación
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count", "X-Page", "X-Per-Page"]
)

# Middleware de hosts confiables
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*.juridicadigital.cl", "localhost", "127.0.0.1"]
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


# Incluir routers
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    """Endpoint raíz"""
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "active",
        "docs": f"{settings.API_V1_STR}/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }