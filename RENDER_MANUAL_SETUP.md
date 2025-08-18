# 🔧 CONFIGURACIÓN MANUAL RENDER - PASO A PASO

## 🎯 PASO 1: CONFIGURAR VARIABLES DE ENTORNO

### Ir a Render Dashboard → Tu Servicio Backend → Environment

**Agregar estas variables EXACTAMENTE:**

### 🔒 SEGURIDAD (CRÍTICO)
```
SECRET_KEY=lpdp-ultra-secure-jwt-secret-key-for-production-change-this-value
PASSWORD_SALT=lpdp-secure-salt-for-password-hashing-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 📱 APLICACIÓN
```
PROJECT_NAME=Sistema LPDP Profesional
VERSION=2.0.0
ENVIRONMENT=production
DEBUG=false
```

### 🌐 CORS
```
ALLOWED_ORIGINS=https://scldp-frontend.onrender.com,http://localhost:3000
```

### 👥 USUARIOS (JSON - UNA SOLA LÍNEA)
```
USERS_CONFIG={"admin":{"password_hash":"ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f","email":"admin@empresa.cl","name":"Administrador del Sistema","is_superuser":true,"is_active":true,"tenant_id":"default","permissions":["read","write","admin","superuser"]},"demo":{"password_hash":"a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3","email":"demo@empresa.cl","name":"Usuario Demo","is_superuser":false,"is_active":true,"tenant_id":"demo","permissions":["read"]},"dpo":{"password_hash":"8d23cf6c86e834a7aa6eded54c26ce2bb2e74903538c61bdd5d2197997ab2f72","email":"dpo@empresa.cl","name":"Data Protection Officer","is_superuser":false,"is_active":true,"tenant_id":"dpo","permissions":["read","write"]}}
```

### 📚 MÓDULOS (JSON - UNA SOLA LÍNEA)
```
MODULES_CONFIG=[{"id":"mod-001","name":"Introducción a la LPDP","description":"Conceptos fundamentales de la Ley 21.719","status":"available","required_permission":"read"},{"id":"mod-002","name":"Derechos ARCOPOL","description":"Acceso, Rectificación, Cancelación, Oposición, Portabilidad, Limitación","status":"available","required_permission":"read"},{"id":"mod-003","name":"Inventario de Datos","description":"Registro de Actividades de Tratamiento (RAT)","status":"available","required_permission":"write"}]
```

---

## 🎯 PASO 2: FORZAR REDEPLOY MANUAL

### Opción A: Manual Deploy en Render
1. Ir a Render Dashboard → Tu Servicio Backend
2. Click en "Manual Deploy"
3. Seleccionar branch "main"
4. Click "Deploy latest commit"

### Opción B: Cambio Menor + Git Push
```bash
git push origin main
```

---

## 🎯 PASO 3: VERIFICAR DEPLOYMENT

### 1. Esperar 2-3 minutos que termine el deploy

### 2. Verificar endpoint raíz:
```bash
curl https://scldp-backend.onrender.com/
```

**Debe retornar:**
```json
{
  "name": "Sistema LPDP Profesional",
  "version": "2.0.0",
  "status": "online",
  "environment": "production",
  "database_connected": false,
  "timestamp": "2025-08-18T...",
  "docs_url": null
}
```

### 3. Verificar health endpoint:
```bash
curl https://scldp-backend.onrender.com/health
```

**Debe retornar:**
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "timestamp": "2025-08-18T...",
  "environment": "production",
  "database_connected": false
}
```

---

## 🎯 PASO 4: PROBAR LOGIN

### Test con Admin:
```bash
curl -X POST https://scldp-backend.onrender.com/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"secret123"}'
```

### Test con Demo:
```bash
curl -X POST https://scldp-backend.onrender.com/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"demo","password":"hello"}'
```

**Debe retornar token JWT:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": "admin",
    "username": "admin",
    "email": "admin@empresa.cl",
    "name": "Administrador del Sistema",
    "tenant_id": "default",
    "is_superuser": true,
    "is_active": true
  }
}
```

---

## 🔑 CREDENCIALES DE ACCESO

| Usuario | Password   | Rol                        | Permisos           |
|---------|------------|---------------------------|-------------------|
| admin   | secret123  | Administrador del Sistema  | Todos los permisos |
| demo    | hello      | Usuario Demo              | Solo lectura       |
| dpo     | mypass     | Data Protection Officer   | Lectura + Escritura |

---

## ⚠️ TROUBLESHOOTING

### Si el backend sigue retornando version "1.0.0":
1. Verificar que el push se realizó correctamente
2. Forzar manual deploy en Render Dashboard
3. Verificar logs de deployment en Render

### Si hay errores de configuración:
1. Verificar que todas las variables estén configuradas
2. Verificar que USERS_CONFIG y MODULES_CONFIG sean JSON válido (una sola línea)
3. Restart del servicio en Render Dashboard

### Si login falla:
1. Verificar que SECRET_KEY esté configurado
2. Verificar que PASSWORD_SALT coincida con los hashes
3. Verificar formato de USERS_CONFIG

---

## ✅ RESULTADO ESPERADO

Después de estos pasos:
- ✅ Backend profesional v2.0.0 funcionando
- ✅ Login con nuevas credenciales funcionando
- ✅ Sin errores de Supabase
- ✅ Configuración completamente profesional
- ✅ Sistema listo para producción