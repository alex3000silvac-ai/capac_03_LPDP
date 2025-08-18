"""
BACKEND EMERGENCIA - SIN DEPENDENCIAS EXTERNAS
Funcional inmediatamente para resolver "Failed to fetch"
"""
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import logging
import os
from datetime import datetime

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Crear aplicación FastAPI
app = FastAPI(
    title="Sistema LPDP - Emergency Backend",
    description="Backend de emergencia sin dependencias externas",
    version="1.0.0",
    debug=False
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "https://scldp-frontend.onrender.com,http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Modelos de datos
class LoginRequest(BaseModel):
    username: str
    password: str
    tenant_id: str = "demo"

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

# Usuario de prueba hardcodeado
DEMO_USERS = {
    "admin": {
        "id": "1",
        "username": "admin",
        "password": "Admin123!",
        "email": "admin@juridicadigital.cl",
        "first_name": "Administrador",
        "last_name": "Sistema",
        "tenant_id": "demo",
        "is_superuser": True,
        "is_active": True
    },
    "demo": {
        "id": "2", 
        "username": "demo",
        "password": "Demo123!",
        "email": "demo@empresa.cl",
        "first_name": "Usuario",
        "last_name": "Demo",
        "tenant_id": "demo",
        "is_superuser": False,
        "is_active": True
    },
    "dpo": {
        "id": "3",
        "username": "dpo", 
        "password": "Dpo123!",
        "email": "dpo@empresa.cl",
        "first_name": "Data Protection",
        "last_name": "Officer",
        "tenant_id": "demo",
        "is_superuser": False,
        "is_active": True
    }
}

# ============ ENDPOINTS ============

@app.get("/")
async def root():
    """Endpoint raíz"""
    logger.info("✅ Acceso al endpoint raíz")
    return {
        "name": "Sistema LPDP - Emergency Backend",
        "status": "ONLINE",
        "version": "1.0.0",
        "message": "Backend funcionando correctamente",
        "timestamp": datetime.now().isoformat(),
        "environment": os.getenv("ENVIRONMENT", "production"),
        "endpoints": {
            "health": "/health",
            "login": "/api/v1/auth/login",
            "test": "/api/v1/test"
        }
    }

@app.get("/health")
async def health_check():
    """Health check para monitoreo"""
    logger.info("✅ Health check ejecutado")
    return {
        "status": "healthy",
        "service": "LPDP Emergency Backend",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "uptime": "OK",
        "database": "simulado",
        "cors": "configurado"
    }

@app.get("/api/v1/test")
async def test_connection():
    """Test de conectividad"""
    logger.info("✅ Test de conectividad ejecutado")
    return {
        "message": "Conexión exitosa",
        "backend": "funcionando",
        "cors": "OK",
        "timestamp": datetime.now().isoformat(),
        "status": "connected"
    }

@app.post("/api/v1/auth/login")
async def login(credentials: LoginRequest):
    """Login simplificado sin JWT ni base de datos"""
    try:
        logger.info(f"🔐 Intento de login para usuario: {credentials.username}")
        
        # Validar usuario existe
        if credentials.username not in DEMO_USERS:
            logger.warning(f"❌ Usuario no encontrado: {credentials.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no encontrado"
            )
        
        user_data = DEMO_USERS[credentials.username]
        
        # Validar contraseña
        if user_data["password"] != credentials.password:
            logger.warning(f"❌ Contraseña incorrecta para: {credentials.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Contraseña incorrecta"
            )
        
        # Token simulado (sin JWT real para evitar dependencias)
        fake_token = f"emergency_token_{credentials.username}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Preparar respuesta
        user_response = {
            "id": user_data["id"],
            "username": user_data["username"],
            "email": user_data["email"],
            "first_name": user_data["first_name"],
            "last_name": user_data["last_name"],
            "tenant_id": credentials.tenant_id,
            "is_superuser": user_data["is_superuser"],
            "is_active": user_data["is_active"]
        }
        
        logger.info(f"✅ Login exitoso para: {credentials.username}")
        
        return {
            "access_token": fake_token,
            "token_type": "bearer",
            "user": user_response,
            "message": "Login exitoso",
            "expires_in": 3600
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"💥 Error inesperado en login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno: {str(e)}"
        )

@app.get("/api/v1/modules")
async def get_modules():
    """Módulos de capacitación disponibles"""
    logger.info("📚 Solicitando módulos disponibles")
    return {
        "modules": [
            {
                "id": "mod-001",
                "name": "Introducción a la LPDP",
                "description": "Fundamentos de la Ley 21.719",
                "duration": "2 horas",
                "status": "available",
                "progress": 0
            },
            {
                "id": "mod-002",
                "name": "Derechos ARCOPOL",
                "description": "Derechos de los titulares de datos",
                "duration": "3 horas", 
                "status": "available",
                "progress": 0
            },
            {
                "id": "mod-003",
                "name": "Inventario de Datos (RAT)",
                "description": "Registro de Actividades de Tratamiento",
                "duration": "4 horas",
                "status": "available",
                "progress": 0
            }
        ],
        "total": 3,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/v1/users/me")
async def get_current_user():
    """Usuario actual (simulado)"""
    logger.info("👤 Solicitando datos del usuario actual")
    return {
        "id": "1",
        "username": "admin",
        "email": "admin@juridicadigital.cl",
        "first_name": "Usuario",
        "last_name": "Demo",
        "tenant_id": "demo",
        "is_active": True,
        "timestamp": datetime.now().isoformat()
    }

# Manejo global de errores
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"💥 Error global: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Error interno del servidor",
            "error": str(exc),
            "timestamp": datetime.now().isoformat()
        }
    )

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Backend Emergency iniciado correctamente")
    logger.info("🔧 CORS configurado para frontend")
    logger.info("👥 Usuarios demo disponibles: admin, demo, dpo")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    logger.info(f"🚀 Iniciando servidor en puerto {port}")
    uvicorn.run(app, host=host, port=port, log_level="info")