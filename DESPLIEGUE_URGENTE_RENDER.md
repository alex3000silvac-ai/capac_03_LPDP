# 🚨 DESPLIEGUE URGENTE EN RENDER - SOLUCIÓN AL ERROR 500

## **PROBLEMA ACTUAL:**
- ❌ Backend devuelve Error 500 en todos los endpoints
- ❌ Login imposible
- ❌ Frontend no puede conectarse al backend

## **SOLUCIÓN INMEDIATA:**

### **1️⃣ ACTUALIZAR ARCHIVOS EN EL REPOSITORIO:**

**Reemplazar estos archivos:**
- `backend/main.py` → usar contenido de `backend/main_fix.py`
- `backend/requirements.txt` → usar contenido de `backend/requirements_fix.txt`

### **2️⃣ CONFIGURAR RENDER BACKEND:**

**En tu dashboard de Render, servicio `scldp-backend`:**

#### **Settings > Build & Deploy:**
- **Start Command**: `uvicorn main_fix:app --host 0.0.0.0 --port $PORT`

#### **Environment Variables:**
```
SECRET_KEY=KL4um-775jA5N*P_EMERGENCY_2024
ENVIRONMENT=production
DEBUG=false
```

### **3️⃣ HACER DEPLOY MANUAL:**
1. Ir a Render Dashboard
2. Servicio: `scldp-backend`
3. Hacer clic en "Manual Deploy"
4. Esperar que termine el build

### **4️⃣ VERIFICAR FUNCIONAMIENTO:**
- Backend: https://scldp-backend.onrender.com/
- Debe mostrar: `{"name":"Jurídica Digital SPA...","status":"active"}`

## **CREDENCIALES DE PRUEBA:**
Una vez funcionando:
- **Usuario**: `admin`
- **Contraseña**: `Admin123!`
- **Usuario**: `demo`
- **Contraseña**: `Demo123!`

## **PRIORIDAD: CRÍTICA**
Sin esta corrección, el sistema NO puede funcionar.
