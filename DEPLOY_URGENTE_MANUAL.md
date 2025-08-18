# 🚨 DEPLOY URGENTE MANUAL - RENDER

## ⚠️ SITUACIÓN ACTUAL
- Backend profesional v2.0.0 está listo en el repositorio
- Render NO ha detectado cambios automáticamente  
- Sigue ejecutando versión antigua 1.0.0 con errores de Supabase

## 🎯 SOLUCIÓN: DEPLOY MANUAL FORZADO

### OPCIÓN A: Manual Deploy en Render Dashboard (RECOMENDADO)

1. **Ir a Render Dashboard**
   - https://dashboard.render.com
   - Buscar tu servicio "scldp-backend"

2. **Forzar Deploy Manual**
   - Click en tu servicio backend
   - En la página del servicio, click **"Manual Deploy"**
   - Seleccionar branch: **"main"**
   - Click **"Deploy latest commit"**

3. **Monitorear Logs**
   - Ver los logs en tiempo real
   - Debe mostrar: "Backend Profesional LPDP v2.0.0"
   - Deploy toma 2-3 minutos

### OPCIÓN B: Git Push Force (SI OPCIÓN A FALLA)

```bash
# Si tienes acceso a git
git push --force-with-lease origin main
```

---

## ✅ VERIFICAR DEPLOY EXITOSO

### 1. Verificar Versión:
```bash
curl https://scldp-backend.onrender.com/ | grep version
```

**Debe retornar**: `"version":"2.0.0"`

### 2. Verificar Health:
```bash
curl https://scldp-backend.onrender.com/health
```

**Debe retornar**: Status "healthy" + version "2.0.0"

### 3. Probar Login:
```bash
curl -X POST https://scldp-backend.onrender.com/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"secret123"}'
```

**Debe retornar**: Token JWT válido (NO error de base de datos)

---

## 🎯 RESULTADO ESPERADO

### ✅ DESPUÉS DEL DEPLOY MANUAL:
- Version: "2.0.0" (NO más 1.0.0)
- Status: "healthy" (NO más "database_error")
- Login funcionando con:
  - admin / secret123
  - demo / hello  
  - dpo / mypass
- Sin errores de Supabase

### ❌ SI PERSISTE VERSIÓN 1.0.0:
1. Verificar que el push se realizó correctamente
2. Revisar logs de deployment en Render
3. Contactar soporte de Render si el problema persiste

---

## 📋 CREDENCIALES FINALES

| Usuario | Password   | Rol                       |
|---------|------------|---------------------------|
| admin   | secret123  | Administrador Completo    |
| demo    | hello      | Usuario Demo (Solo Lectura)|
| dpo     | mypass     | DPO (Lectura + Escritura) |

---

## ⏰ TIEMPO ESTIMADO
- Manual Deploy: 2-3 minutos
- Verificación: 1 minuto
- **TOTAL: 5 minutos máximo**

---

## 🔧 SCRIPT DE VERIFICACIÓN

Ejecutar después del deploy:
```bash
./backend/verificar_despliegue.sh
```

Debe mostrar ✅ para todos los tests y version "2.0.0".