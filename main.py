"""
Backend ULTRA SIMPLE que funciona 100% en Render
Sin dependencias complejas - Solo FastAPI puro
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
    title="Sistema LPDP - Ultra Simple",
    description="Backend ultra simple que funciona en Render",
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
        "message": "Backend Ultra Simple funcionando",
        "status": "online",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health():
    """Health check"""
    return {
        "status": "healthy",
        "message": "Backend Ultra Simple OK",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/v1/test")
async def test():
    """Test de conectividad"""
    return {
        "message": "Conectividad OK",
        "backend": "funcionando",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/v1/auth/login")
async def login(credentials: LoginRequest):
    """Login ultra simple"""
    try:
        logger.info(f"Login attempt: {credentials.username}")
        
        # Verificar usuario y contraseña
        if credentials.username not in USERS:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no encontrado"
            )
        
        user = USERS[credentials.username]
        if user["password"] != credentials.password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Contraseña incorrecta"
            )
        
        # Login exitoso
        logger.info(f"Login successful: {credentials.username}")
        return {
            "access_token": f"token_{credentials.username}_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "token_type": "bearer",
            "user": {
                "username": credentials.username,
                "name": user["name"],
                "email": f"{credentials.username}@empresa.cl"
            },
            "message": "Login exitoso"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
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
        "email": "admin@empresa.cl"
    }

@app.get("/api/v1/modules")
async def get_modules():
    """Módulos disponibles"""
    return {
        "modules": [
            {"id": "mod-001", "name": "Introducción a la LPDP", "status": "available"},
            {"id": "mod-002", "name": "Derechos ARCOPOL", "status": "available"},
            {"id": "mod-003", "name": "Inventario de Datos", "status": "available"}
        ]
    }

# Manejo de errores
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Error interno", "error": str(exc)}
    )

# Evento de inicio
@app.on_event("startup")
async def startup():
    logger.info("🚀 Backend Ultra Simple iniciado")
    logger.info("✅ CORS configurado")
    logger.info("👥 Usuarios: admin, demo, dpo")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run(app, host=host, port=port)