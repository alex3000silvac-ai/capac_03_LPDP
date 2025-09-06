# 🚀 DESPLIEGUE EN RENDER.COM - LPDP BACKEND v2.0

## ❌ Problema Actual

Render.com está detectando el proyecto como Python porque encuentra archivos Python antiguos eliminados, pero está buscando `requirements.txt` que ya no existe.

## ✅ Solución - Configuración Correcta

### 1. **Configurar Render.com Manual**

1. Ir a [Render.com Dashboard](https://dashboard.render.com/)
2. **New → Web Service**
3. Conectar repositorio: `alex3000silvac-ai/capac_03_LPDP`
4. **Configuración:**

```yaml
Name: lpdp-backend-v2
Environment: Node
Region: Oregon (US West)
Branch: main
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

### 2. **Variables de Entorno (CRÍTICO)**

```bash
NODE_ENV=production
PORT=10000
JWT_SECRET=tu-jwt-secret-muy-seguro-render-2024
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_ANON_KEY=eyJ...
FRONTEND_URLS=http://localhost:3000,https://tu-frontend.onrender.com
```

### 3. **Health Check**
- **Health Check Path:** `/health`
- **Auto-Deploy:** Sí

## 🔧 Alternativa: Archivo render.yaml

He creado `render.yaml` en la raíz que Render detectará automáticamente:

```yaml
services:
  - type: web
    name: lpdp-backend-v2
    env: node
    rootDir: backend
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /health
```

## 🚨 Pasos Inmediatos

### Opción A: Reconfigurar Servicio Existente
1. Ir a tu servicio en Render
2. **Settings → Environment:** Cambiar a **Node**
3. **Settings → Build & Deploy:**
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Agregar variables de entorno
5. **Manual Deploy**

### Opción B: Crear Nuevo Servicio
1. **New Web Service** en Render
2. Usar configuración arriba
3. Configurar variables de entorno
4. Deploy

## 📋 Variables de Entorno Requeridas

```bash
# OBLIGATORIAS - Sin estas el backend no funciona
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# SEGURIDAD
JWT_SECRET=crea-un-secret-muy-seguro-aqui-2024
NODE_ENV=production
PORT=10000

# CORS - Actualizar con tu frontend real
FRONTEND_URLS=http://localhost:3000,https://tu-frontend-real.onrender.com
```

## ✅ Verificación Post-Deploy

```bash
# Health check
curl https://tu-backend.onrender.com/health

# Debe devolver:
{
  "status": "healthy",
  "version": "2.0.0",
  "database": {"status": "connected"}
}
```

## 🔄 Actualizar Frontend

Una vez que el backend esté funcionando en Render:

```javascript
// frontend/src/config.js
export const API_BASE_URL = 'https://tu-backend.onrender.com/api';
```

## 📞 URLs Finales

- **Backend:** https://lpdp-backend-v2.onrender.com
- **API:** https://lpdp-backend-v2.onrender.com/api
- **Health:** https://lpdp-backend-v2.onrender.com/health
- **Login:** POST https://lpdp-backend-v2.onrender.com/api/auth/login

## 🚨 Notas Importantes

1. **Render detecta Python** por archivos antiguos en git history
2. **Forzar Node.js** especificando `env: node` y `rootDir: backend`
3. **Variables de entorno son críticas** - sin Supabase no funciona
4. **Health check en `/health`** no `/api/health` para Render
5. **Puerto 10000** es el estándar de Render

## 🛠️ Troubleshooting

### Si sigue fallando:
1. **Eliminar servicio actual** en Render
2. **Crear nuevo servicio** con configuración Node.js
3. **Verificar render.yaml** está en la raíz
4. **Commit y push** para trigger nuevo deploy

### Logs útiles:
```bash
# En Render.com → Tu servicio → Logs
# Buscar errores de:
- npm install
- Variables de entorno faltantes
- Conexión a Supabase
```

---

**¡El backend está listo para Render! Solo necesita la configuración correcta de Node.js y las variables de entorno de Supabase.**