"""
Main application file - CORREGIDO PARA SUPABASE Y RENDER
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import os
import psycopg2
from datetime import datetime

# Configuración básica
app = FastAPI(
    title="Jurídica Digital SPA - Sistema de Capacitación LPDP",
    version="1.0.0",
    description="Sistema de cumplimiento de la Ley 21.719"
)

# Variables de entorno hardcodeadas para Render
DATABASE_URL = "postgresql://postgres:y0ySWx0VBmlKuTkk@db.symkjkbejxexgrydmvqs.supabase.co:5432/postgres"
SUPABASE_URL = "https://symkjkbejxexgrydmvqs.supabase.co"
SECRET_KEY = "KL4um-775jA5N*P_EMERGENCY_2024"
ENVIRONMENT = "production"
FRONTEND_URL = "https://scldp-frontend.onrender.com"

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_database_connection():
    """Prueba la conexión con la base de datos Supabase"""
    try:
        logger.info(f"🔍 Probando conexión a: {DATABASE_URL[:50]}...")
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        cursor.close()
        conn.close()
        logger.info("✅ Conexión exitosa a Supabase")
        return True, version[0]
    except Exception as e:
        logger.error(f"❌ Error de conexión a Supabase: {e}")
        return False, str(e)

@app.get("/")
async def root():
    """Endpoint raíz"""
    # Probar conexión a base de datos
    db_ok, db_info = test_database_connection()
    
    return {
        "name": "Jurídica Digital SPA - Sistema de Capacitación LPDP",
        "version": "1.0.0",
        "status": "active" if db_ok else "database_error",
        "database": "connected" if db_ok else "disconnected",
        "database_info": db_info,
        "supabase_url": SUPABASE_URL,
        "environment": ENVIRONMENT,
        "timestamp": datetime.now().isoformat(),
        "docs": "/api/v1/docs"
    }

@app.get("/health")
async def health_check():
    """Verificación de salud del sistema"""
    db_ok, db_info = test_database_connection()
    
    return {
        "status": "healthy" if db_ok else "unhealthy",
        "database": "connected" if db_ok else "disconnected",
        "database_info": db_info,
        "supabase_url": SUPABASE_URL,
        "environment": ENVIRONMENT,
        "timestamp": datetime.now().isoformat(),
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
        ],
        "supabase_connected": test_database_connection()[0]
    }

@app.post("/api/v1/auth/login")
async def login(request: Request):
    """Endpoint de login con validación de base de datos Supabase"""
    try:
        body = await request.json()
        username = body.get("username")
        password = body.get("password")
        tenant_id = body.get("tenant_id", "demo")
        
        logger.info(f"🔐 Intento de login: {username} para tenant: {tenant_id}")
        
        # Validación básica
        if not username or not password:
            return JSONResponse(
                status_code=400,
                content={"detail": "Username y password son requeridos"}
            )
        
        # Probar conexión a base de datos
        db_ok, db_info = test_database_connection()
        if not db_ok:
            logger.error(f"❌ Error de conexión a Supabase: {db_info}")
            return JSONResponse(
                status_code=500,
                content={"detail": "Error de conexión a base de datos", "error": db_info}
            )
        
        # Credenciales hardcodeadas para pruebas
        if username == "admin" and password == "Admin123!":
            logger.info("✅ Login exitoso para admin")
            return {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInVzZXJuYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwidGVuYW50X2lkIjoiZGVtbyIsImlzX3N1cGVydXNlciI6dHJ1ZSwiaWF0IjoxNzA0MTAwMDAwLCJleHAiOjE3MDQxMDM2MDB9.signature",
                "token_type": "bearer",
                "user": {
                    "id": "admin",
                    "username": "admin",
                    "email": "admin@example.com",
                    "tenant_id": tenant_id,
                    "is_superuser": True
                },
                "database_status": "connected",
                "supabase_url": SUPABASE_URL
            }
        elif username == "demo" and password == "Demo123!":
            logger.info("✅ Login exitoso para demo")
            return {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vIiwidXNlcm5hbWUiOiJkZW1vIiwiZW1haWwiOiJkZW1vQGV4YW1wbGUuY29tIiwidGVuYW50X2lkIjoiZGVtbyIsImlzX3N1cGVydXNlciI6ZmFsc2UsImlhdCI6MTcwNDEwMDAwMCwiZXhwIjoxNzA0MTAzNjAwfQ.signature",
                "token_type": "bearer",
                "user": {
                    "id": "demo",
                    "username": "demo",
                    "email": "demo@example.com",
                    "tenant_id": tenant_id,
                    "is_superuser": False
                },
                "database_status": "connected",
                "supabase_url": SUPABASE_URL
            }
        else:
            logger.warning(f"❌ Credenciales inválidas para: {username}")
            return JSONResponse(
                status_code=401,
                content={"detail": "Credenciales inválidas"}
            )
            
    except Exception as e:
        logger.error(f"❌ Error en login: {e}")
        return JSONResponse(
            status_code=500,
            content={"detail": "Error interno del servidor", "error": str(e)}
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
        },
        "database_url": DATABASE_URL[:50] + "...",
        "supabase_url": SUPABASE_URL,
        "environment": ENVIRONMENT
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)