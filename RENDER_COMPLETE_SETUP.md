# 🚀 CONFIGURACIÓN COMPLETA DE RENDER - SISTEMA LPDP

## **ESTADO ACTUAL:**
- ✅ Frontend: Funcionando en https://scldp-frontend.onrender.com/
- ❌ Backend: Error 500 (variables de entorno faltantes)
- ❌ Conectividad: Rota

## **SOLUCIÓN PASO A PASO:**

### **1️⃣ ACCEDER A RENDER DASHBOARD:**
- URL: https://dashboard.render.com/
- Iniciar sesión con tu cuenta

### **2️⃣ SELECCIONAR EL SERVICIO BACKEND:**
- Buscar: `scldp-backend`
- Hacer clic en el servicio

### **3️⃣ CONFIGURAR VARIABLES DE ENTORNO:**
En la sección "Environment Variables" agregar:

```
DATABASE_URL = postgresql://postgres.[TU_PROJECT_REF]:[TU_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

SECRET_KEY = [GENERAR_CLAVE_SECRETA_FUERTE_32_CARACTERES]

ENVIRONMENT = production
DEBUG = false
ALLOWED_ORIGINS = https://scldp-frontend.onrender.com
ALGORITHM = HS256
ACCESS_TOKEN_EXPIRE_MINUTES = 30
DB_POOL_SIZE = 10
DB_MAX_OVERFLOW = 20
DB_POOL_TIMEOUT = 30
LOG_LEVEL = INFO
ENABLE_ACCESS_LOG = true
BCRYPT_ROUNDS = 12
SESSION_TIMEOUT = 3600
```

### **4️⃣ OBTENER URL DE SUPABASE:**
- Ir a https://supabase.com/dashboard
- Seleccionar tu proyecto
- Settings → Database
- Copiar "Connection string" (Pooler)

### **5️⃣ GENERAR CLAVE SECRETA:**
Usar: https://generate-secret.vercel.app/32

### **6️⃣ GUARDAR Y REDEPLOY:**
- Hacer clic en "Save Changes"
- El backend se redeployará automáticamente

### **7️⃣ VERIFICAR FUNCIONAMIENTO:**
- Esperar 2-3 minutos
- Probar: https://scldp-backend.onrender.com/
- Debería mostrar: `{"name":"Jurídica Digital SPA...","status":"active"}`

## **CREDENCIALES DE PRUEBA:**
Una vez funcionando:
- **Usuario**: `admin`
- **Contraseña**: `Admin123!`
- **URL Login**: https://scldp-frontend.onrender.com/login

## **PRIORIDAD: CRÍTICA**
Sin esta configuración, el sistema NO puede funcionar.
