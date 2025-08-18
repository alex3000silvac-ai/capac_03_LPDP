"""
Main application file - CORREGIDO PARA RENDER
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import os
from datetime import datetime, timedelta
import jwt

# Configuración básica
app = FastAPI(
    title="Jurídica Digital SPA - Sistema de Capacitación LPDP",
    version="1.0.0",
    description="Sistema de cumplimiento de la Ley 21.719"
)

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "https://scldp-frontend.onrender.com,http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.get("/")
async def root():
    """Endpoint raíz"""
    return {
        "name": "Jurídica Digital SPA - Sistema de Capacitación LPDP",
        "version": "1.0.0",
        "status": "active",
        "docs": "/api/v1/docs"
    }

@app.get("/health")
async def health_check():
    """Verificación de salud del sistema"""
    return {
        "status": "healthy",
        "timestamp": "2024-01-01T00:00:00Z",
        "version": "1.0.0"
    }

@app.get("/api/v1/")
async def api_root():
    """Endpoint raíz de la API"""
    return {
        "api_version": "v1",
        "status": "active",
        "endpoints": [
            "/auth/login",
            "/auth/refresh",
            "/users/",
            "/tenants/"
        ]
    }

@app.post("/api/v1/auth/login")
async def login(request: Request):
    """Endpoint de login simplificado"""
    try:
        body = await request.json()
        username = body.get("username")
        password = body.get("password")
        tenant_id = body.get("tenant_id", "demo")
        
        # Validación básica
        if not username or not password:
            return JSONResponse(
                status_code=400,
                content={"detail": "Username y password son requeridos"}
            )
        
        # Credenciales hardcodeadas para pruebas
        if username == "admin" and password == "Admin123!":
            # Generar token JWT dinámico
            secret_key = os.getenv("SECRET_KEY", "fallback-secret-key-for-demo")
            payload = {
                "sub": "admin",
                "username": "admin",
                "email": "admin@example.com",
                "tenant_id": tenant_id,
                "is_superuser": True,
                "iat": datetime.utcnow(),
                "exp": datetime.utcnow() + timedelta(minutes=30)
            }
            access_token = jwt.encode(payload, secret_key, algorithm="HS256")
            
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "id": "admin",
                    "username": "admin",
                    "email": "admin@example.com",
                    "tenant_id": tenant_id,
                    "is_superuser": True
                }
            }
        elif username == "demo" and password == "Demo123!":
            # Generar token JWT dinámico
            secret_key = os.getenv("SECRET_KEY", "fallback-secret-key-for-demo")
            payload = {
                "sub": "demo",
                "username": "demo",
                "email": "demo@example.com",
                "tenant_id": tenant_id,
                "is_superuser": False,
                "iat": datetime.utcnow(),
                "exp": datetime.utcnow() + timedelta(minutes=30)
            }
            access_token = jwt.encode(payload, secret_key, algorithm="HS256")
            
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "id": "demo",
                    "username": "demo",
                    "email": "demo@example.com",
                    "tenant_id": tenant_id,
                    "is_superuser": False
                }
            }
        else:
            return JSONResponse(
                status_code=401,
                content={"detail": "Credenciales inválidas"}
            )
            
    except Exception as e:
        logger.error(f"Error en login: {e}")
        return JSONResponse(
            status_code=500,
            content={"detail": "Error interno del servidor"}
        )

@app.get("/api/v1/docs")
async def docs():
    """Documentación de la API"""
    return {
        "message": "Documentación de la API LPDP",
        "endpoints": {
            "POST /auth/login": "Login de usuario",
            "GET /health": "Verificación de salud",
            "GET /": "Información del sistema"
        }
    }

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host=host, port=port)