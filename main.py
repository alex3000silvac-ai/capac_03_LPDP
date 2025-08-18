"""
Backend ULTRA SIMPLE - EN LA RAÍZ PARA RENDER
"""
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import datetime
import logging
import os

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Crear aplicación FastAPI
app = FastAPI(
    title="Sistema LPDP - Backend Funcional",
    description="Backend en la raíz que funciona en Render",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todos los orígenes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelo para login
class LoginRequest(BaseModel):
    username: str
    password: str

# Usuarios demo hardcodeados
USERS = {
    "admin": {"password": "Admin123!", "name": "Administrador"},
    "demo": {"password": "Demo123!", "name": "Usuario Demo"},
    "dpo": {"password": "Dpo123!", "name": "Data Protection Officer"}
}

@app.get("/")
async def root():
    """Endpoint raíz"""
    return {
        "message": "Backend FUNCIONANDO en la raíz",
        "status": "online",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "location": "root directory"
    }

@app.get("/health")
async def health():
    """Health check"""
    return {
        "status": "healthy",
        "message": "Backend en raíz OK",
        "timestamp": datetime.now().isoformat(),
        "cors": "configured"
    }

@app.get("/api/v1/test")
async def test():
    """Test de conectividad"""
    return {
        "message": "Conectividad PERFECTA",
        "backend": "funcionando en raíz",
        "timestamp": datetime.now().isoformat(),
        "failed_to_fetch": "RESUELTO"
    }

@app.post("/api/v1/auth/login")
async def login(credentials: LoginRequest):
    """Login ultra simple"""
    try:
        logger.info(f"🔐 Login attempt: {credentials.username}")
        
        # Verificar usuario y contraseña
        if credentials.username not in USERS:
            logger.warning(f"❌ Usuario no encontrado: {credentials.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no encontrado"
            )
        
        user = USERS[credentials.username]
        if user["password"] != credentials.password:
            logger.warning(f"❌ Contraseña incorrecta: {credentials.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Contraseña incorrecta"
            )
        
        # Login exitoso
        logger.info(f"✅ Login EXITOSO: {credentials.username}")
        return {
            "access_token": f"root_token_{credentials.username}_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "token_type": "bearer",
            "user": {
                "username": credentials.username,
                "name": user["name"],
                "email": f"{credentials.username}@empresa.cl",
                "location": "root_backend"
            },
            "message": "Login exitoso desde raíz",
            "backend_location": "root directory"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"💥 Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno"
        )

@app.get("/api/v1/users/me")
async def get_user():
    """Usuario actual"""
    return {
        "username": "admin",
        "name": "Administrador",
        "email": "admin@empresa.cl",
        "backend": "root directory"
    }

@app.get("/api/v1/modules")
async def get_modules():
    """Módulos disponibles"""
    return {
        "modules": [
            {"id": "mod-001", "name": "Introducción a la LPDP", "status": "available"},
            {"id": "mod-002", "name": "Derechos ARCOPOL", "status": "available"},
            {"id": "mod-003", "name": "Inventario de Datos", "status": "available"}
        ],
        "backend": "root directory"
    }

# Manejo de errores
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"💥 Global error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Error interno", "error": str(exc)}
    )

# Evento de inicio
@app.on_event("startup")
async def startup():
    logger.info("🚀 Backend ROOT iniciado correctamente")
    logger.info("✅ CORS totalmente abierto")
    logger.info("👥 Usuarios: admin, demo, dpo")
    logger.info("📍 Ubicación: ROOT directory")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    logger.info(f"🚀 Iniciando servidor ROOT en puerto {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)