"""
Backend ULTRA SIMPLE con Supabase SSL correcto
"""
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import datetime
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Sistema LPDP - Backend con Supabase SSL",
    description="Backend con conexión SSL a Supabase",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginRequest(BaseModel):
    username: str
    password: str

USERS = {
    "admin": {"password": "Admin123!", "name": "Administrador"},
    "demo": {"password": "Demo123!", "name": "Usuario Demo"},
    "dpo": {"password": "Dpo123!", "name": "Data Protection Officer"}
}

def test_database_connection():
    try:
        import psycopg2
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            return False, "DATABASE_URL no configurada"
        
        # Agregar SSL automáticamente si no está presente
        if "?sslmode=" not in database_url:
            database_url += "?sslmode=require"
        
        logger.info(f"Conectando a: {database_url[:50]}...")
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        logger.info("✅ Conexión SSL exitosa a Supabase")
        return True, version[:100]
    except ImportError:
        logger.warning("psycopg2 no disponible")
        return False, "psycopg2 no instalado"
    except Exception as e:
        logger.error(f"Error de conexión: {e}")
        return False, str(e)

@app.get("/")
async def root():
    db_ok, db_info = test_database_connection()
    return {
        "message": "Backend con Supabase SSL funcionando",
        "status": "online",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "database": {
            "connected": db_ok,
            "info": db_info,
            "ssl": "required"
        }
    }

@app.get("/health")
async def health():
    db_ok, db_info = test_database_connection()
    return {
        "status": "healthy" if db_ok else "degraded",
        "message": "Backend con SSL OK",
        "timestamp": datetime.now().isoformat(),
        "database": {
            "connected": db_ok,
            "ssl_mode": "require",
            "info": db_info
        }
    }

@app.get("/api/v1/test")
async def test():
    db_ok, db_info = test_database_connection()
    return {
        "message": "Test de conectividad SSL",
        "backend": "funcionando",
        "timestamp": datetime.now().isoformat(),
        "database": {
            "status": "connected" if db_ok else "error",
            "ssl_required": True,
            "info": db_info
        },
        "ssl_fix": "aplicado"
    }

@app.post("/api/v1/auth/login")
async def login(credentials: LoginRequest):
    try:
        logger.info(f"🔐 Login attempt: {credentials.username}")
        
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
        
        logger.info(f"✅ Login EXITOSO: {credentials.username}")
        
        # Verificar conexión DB
        db_ok, db_info = test_database_connection()
        
        return {
            "access_token": f"ssl_token_{credentials.username}_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "token_type": "bearer",
            "user": {
                "username": credentials.username,
                "name": user["name"],
                "email": f"{credentials.username}@empresa.cl"
            },
            "message": "Login exitoso con SSL",
            "database_ssl": "connected" if db_ok else "error"
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
    return {
        "username": "admin",
        "name": "Administrador",
        "email": "admin@empresa.cl",
        "ssl": "enabled"
    }

@app.get("/api/v1/modules")
async def get_modules():
    return {
        "modules": [
            {"id": "mod-001", "name": "Introducción a la LPDP", "status": "available"},
            {"id": "mod-002", "name": "Derechos ARCOPOL", "status": "available"},
            {"id": "mod-003", "name": "Inventario de Datos", "status": "available"}
        ],
        "ssl": "enabled"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"💥 Global error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Error interno", "error": str(exc)}
    )

@app.on_event("startup")
async def startup():
    logger.info("🚀 Backend SSL iniciado correctamente")
    logger.info("✅ CORS configurado")
    logger.info("🔒 SSL mode: require")
    logger.info("👥 Usuarios: admin, demo, dpo")
    
    # Test inicial de conexión
    db_ok, db_info = test_database_connection()
    if db_ok:
        logger.info(f"🟢 Supabase SSL conectado: {db_info[:50]}...")
    else:
        logger.error(f"🔴 Error Supabase SSL: {db_info}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    logger.info(f"🚀 Iniciando servidor SSL en puerto {port}")
    uvicorn.run(app, host=host, port=port)