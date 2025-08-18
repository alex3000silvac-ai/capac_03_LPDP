# 🚨 CONFIGURACIÓN URGENTE PARA RENDER - VARIABLES DE ENTORNO

## **PROBLEMA CRÍTICO DETECTADO:**
El backend está fallando porque no tiene configurada la variable `DATABASE_URL` en Render.

## **SOLUCIÓN INMEDIATA:**

### **1️⃣ Ir a Render Dashboard:**
- URL: https://dashboard.render.com/
- Seleccionar el servicio: `scldp-backend`

### **2️⃣ Configurar Variables de Entorno:**
En la sección "Environment Variables" agregar:

```
DATABASE_URL = [TU_URL_DE_SUPABASE]
SECRET_KEY = [GENERAR_UNA_CLAVE_SECRETA_FUERTE]
```

### **3️⃣ URL de Supabase:**
Formato: `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`

### **4️⃣ Clave Secreta:**
Generar una clave fuerte de al menos 32 caracteres.

## **ESTADO ACTUAL:**
- ✅ Frontend: Funcionando
- ❌ Backend: Error 500 (DATABASE_URL faltante)
- ❌ Conectividad: Rota

## **PRIORIDAD: ALTA**
Sin esta configuración, el sistema NO puede funcionar.
