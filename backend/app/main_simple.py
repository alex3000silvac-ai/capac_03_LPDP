"""
Aplicación FastAPI simplificada para Render
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import logging

# Configurar logging básico
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Crear aplicación FastAPI
app = FastAPI(
    title="Sistema LPDP - Ley 21.719",
    version="1.0.0",
    description="Sistema de cumplimiento para la Ley de Protección de Datos Personales de Chile"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "https://scldp-frontend.onrender.com,http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Endpoint raíz"""
    return {
        "message": "Sistema LPDP Backend",
        "status": "online",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "production")
    }

@app.get("/health")
async def health_check():
    """Health check para Render"""
    try:
        # Test básico de funcionamiento
        return {
            "status": "healthy",
            "service": "LPDP Backend",
            "version": "1.0.0",
            "database": "not_connected"  # Simplificado por ahora
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail="Service unhealthy")

@app.get("/api/v1/test")
async def test_endpoint():
    """Endpoint de prueba para verificar conectividad"""
    return {
        "message": "Conexión exitosa",
        "backend": "funcionando",
        "timestamp": "2024-08-18"
    }

# Manejo de errores global
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Error global: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Error interno del servidor", "error": str(exc)}
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run(app, host=host, port=port)