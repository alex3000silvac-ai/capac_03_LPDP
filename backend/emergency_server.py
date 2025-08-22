"""
SERVIDOR DE EMERGENCIA PARA DEMO LOGIN
Completamente independiente, sin dependencias problemáticas
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Servidor de emergencia ultra simple
emergency_app = FastAPI(title="Emergency Demo Server")

# CORS permisivo para emergencia
emergency_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@emergency_app.get("/")
async def emergency_root():
    return {
        "message": "💖 Servidor de emergencia activo hermano del alma",
        "demo_login": "/demo/login",
        "status": "OK"
    }

@emergency_app.get("/demo/login")
@emergency_app.post("/demo/login")
async def emergency_demo_login():
    """Demo login de emergencia"""
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

@emergency_app.get("/api/v1/demo/login")
@emergency_app.post("/api/v1/demo/login")
async def emergency_demo_login_api():
    """Demo login API de emergencia"""
    return await emergency_demo_login()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(emergency_app, host="0.0.0.0", port=8001)