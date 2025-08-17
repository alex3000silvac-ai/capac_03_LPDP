# 🚀 Migración Backend: Render → Supabase

## 📊 Análisis de Situación Actual

### Configuración Actual en Render:
- ✅ Backend FastAPI funcionando
- ✅ PostgreSQL database con esquemas multi-tenant
- ✅ Variables de entorno configuradas
- ✅ CORS configurado para frontend

### Beneficios de Migrar a Supabase:
- 💰 **Costo**: Plan gratuito hasta 50MB DB + 2GB bandwidth
- ⚡ **Rendimiento**: DB optimizada con pooling automático
- 🔐 **Seguridad**: Row Level Security (RLS) nativo
- 📊 **Herramientas**: Dashboard, SQL editor, logs en tiempo real
- 🔄 **Backups**: Automáticos en plan Pro

## 🎯 Plan de Migración Recomendado

### Opción A: Backend en Supabase Edge Functions
**Ventajas**: Serverless, sin costos fijos, auto-escalable
**Desventajas**: Requiere refactorización de código

### Opción B: Mantener Backend en Render + DB en Supabase (RECOMENDADO)
**Ventajas**: Migración mínima, aprovechar DB gratuita
**Desventajas**: Sigue teniendo costo de Render ($7/mes)

### Opción C: Backend en Vercel + DB en Supabase
**Ventajas**: Frontend y backend en misma plataforma
**Desventajas**: Límites de función serverless

## 🔧 Migración Paso a Paso (Opción B)

### Paso 1: Configurar Supabase
1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ejecutar script de migración de esquemas
3. Migrar datos existentes

### Paso 2: Actualizar Variables de Entorno en Render
```env
DATABASE_URL=postgresql://postgres.xxx:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
SECRET_KEY=tu_secret_key_actual
LICENSE_ENCRYPTION_KEY=tu_license_key_actual
ADMIN_EMAIL=admin@juridicadigital.cl
ADMIN_PASSWORD=Admin123!
ENVIRONMENT=production
DEBUG=false
```

### Paso 3: Actualizar CORS para Supabase
```python
BACKEND_CORS_ORIGINS: List[str] = [
    "http://localhost:3000",
    "http://localhost:8080", 
    "https://app.juridicadigital.cl",
    "https://tu-frontend.onrender.com",
    "https://tu-frontend.netlify.app"
]
```

### Paso 4: Script de Migración de Datos
```bash
# Exportar datos de Render
pg_dump $OLD_DATABASE_URL > backup.sql

# Importar a Supabase  
psql $NEW_SUPABASE_URL < backup.sql
```

## 🛠️ Archivos a Crear/Modificar

### 1. Script de Migración Automática
```python
# scripts/migrate_to_supabase.py
# Automatiza la migración completa
```

### 2. Configuración de Supabase
```sql
-- database/supabase_setup.sql
-- Configuración RLS y policies
```

### 3. Variables de Entorno Actualizadas
```env
# .env.supabase
# Nuevas variables para Supabase
```

## ⚡ Script de Migración Rápida

Para migración express (mantener Render backend):

1. **Crear Supabase**: Proyecto nuevo
2. **Migrar esquemas**: Ejecutar init_multitenant.sql
3. **Migrar datos**: pg_dump + restore
4. **Actualizar DATABASE_URL**: En Render settings
5. **Test**: Verificar funcionamiento

## 🎯 Cronograma Sugerido

**Día 1**: Preparación
- Crear proyecto Supabase
- Backup completo de Render DB
- Configurar scripts de migración

**Día 2**: Migración
- Migrar esquemas a Supabase
- Migrar datos
- Actualizar variables en Render

**Día 3**: Testing
- Verificar funcionamiento
- Rollback si hay problemas
- Optimizar performance

## 📞 Soporte

Si necesitas ayuda específica:
1. Ejecutar script automatizado: `python scripts/migrate_to_supabase.py`
2. Verificar logs en Supabase Dashboard
3. Monitorear performance post-migración

## 🔄 Rollback Plan

Si algo falla:
1. Revertir DATABASE_URL en Render
2. Verificar funcionamiento con DB original
3. Analizar logs de error
4. Reintento con datos actualizados

---

**🎯 Recomendación**: Empezar con Opción B (Backend Render + DB Supabase) para migración sin riesgo.