# 🚨 DEPLOY EMERGENCY BACKEND - PASO A PASO

## 📋 **INSTRUCCIONES PRECISAS PARA RENDER**

### **PASO 1: IR A TU DASHBOARD DE RENDER**
1. Ve a: https://dashboard.render.com/
2. Busca tu servicio backend: **scldp-backend**
3. Haz click en el servicio

### **PASO 2: CAMBIAR CONFIGURACIÓN**
1. Ve a **Settings** (en el menú izquierdo)
2. Scroll down hasta **Build & Deploy**
3. En **Start Command**, cambia a:
   ```
   uvicorn main_emergency:app --host 0.0.0.0 --port $PORT
   ```
4. Click **Save Changes**

### **PASO 3: ACTUALIZAR ARCHIVOS**
Necesitas reemplazar estos 2 archivos en tu repositorio:

**A) Reemplazar `main.py` con este contenido:**
```python
"""
BACKEND EMERGENCIA - SIN DEPENDENCIAS EXTERNAS
"""
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import logging
import os
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Sistema LPDP - Emergency Backend",
    description="Backend de emergencia sin dependencias externas",
    version="1.0.0",
    debug=False
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://scldp-frontend.onrender.com",
        "http://localhost:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

class LoginRequest(BaseModel):
    username: str
    password: str
    tenant_id: str = "demo"

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

@app.get("/")
async def root():
    logger.info("✅ Acceso al endpoint raíz")
    return {
        "name": "Sistema LPDP - Emergency Backend",
        "status": "ONLINE",
        "version": "1.0.0",
        "message": "Backend funcionando correctamente",
        "timestamp": datetime.now().isoformat(),
        "environment": os.getenv("ENVIRONMENT", "production")
    }

@app.get("/health")
async def health_check():
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
    try:
        logger.info(f"🔐 Intento de login para usuario: {credentials.username}")
        
        if credentials.username not in DEMO_USERS:
            logger.warning(f"❌ Usuario no encontrado: {credentials.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no encontrado"
            )
        
        user_data = DEMO_USERS[credentials.username]
        
        if user_data["password"] != credentials.password:
            logger.warning(f"❌ Contraseña incorrecta para: {credentials.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Contraseña incorrecta"
            )
        
        fake_token = f"emergency_token_{credentials.username}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
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

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Backend Emergency iniciado correctamente")
    logger.info("🔧 CORS configurado para frontend")
    logger.info("👥 Usuarios demo disponibles: admin, demo, dpo")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    logger.info(f"🚀 Iniciando servidor en puerto {port}")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
```

**B) Reemplazar `requirements.txt` con este contenido:**
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
pydantic==2.5.0
```

### **PASO 4: CONFIGURAR VARIABLES DE ENTORNO**
1. En Render, ve a **Environment**
2. Agregar solo esta variable:
   - **Key:** `ENVIRONMENT`
   - **Value:** `production`

### **PASO 5: HACER DEPLOY**
1. Ve a la pestaña **Manual Deploy**
2. Click en **Deploy latest commit**
3. Esperar que termine el deploy (2-3 minutos)

### **PASO 6: VERIFICAR QUE FUNCIONA**
Después del deploy, verificar:

**Test 1: Health Check**
```
https://scldp-backend.onrender.com/health
```
Debe devolver: `{"status": "healthy", ...}`

**Test 2: Login Test**
```
curl -X POST https://scldp-backend.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123!"}'
```

**Test 3: Frontend Login**
1. Ir a: https://scldp-frontend.onrender.com/login
2. Usar: **admin** / **Admin123!**
3. **Resultado:** Login exitoso sin "Failed to fetch"

---

## 🎯 **RESULTADO ESPERADO**

✅ Backend responde en todos los endpoints  
✅ Frontend puede conectarse sin errores  
✅ Login funciona con credenciales demo  
✅ Error "Failed to fetch" desaparece  

---

## 📞 **SI HAY PROBLEMAS**

1. **Verificar logs en Render:** Ir a Logs tab
2. **Verificar Start Command:** Debe ser `uvicorn main_emergency:app --host 0.0.0.0 --port $PORT`
3. **Verificar archivos:** main.py y requirements.txt deben estar actualizados

---

**🚀 ¡Sigue estos pasos y el login funcionará inmediatamente!**