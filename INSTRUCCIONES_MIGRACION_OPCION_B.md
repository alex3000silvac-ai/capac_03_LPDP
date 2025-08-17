# 🚀 MIGRACIÓN RENDER → SUPABASE (Opción B)
## Backend en Render + Base de Datos en Supabase

---

## 📋 Resumen
- ✅ Mantener backend FastAPI en Render ($7/mes)
- ✅ Migrar solo la base de datos a Supabase (GRATIS hasta 500MB)
- ✅ Sin cambios de código necesarios
- ✅ Migración de bajo riesgo

---

## 🎯 PASO A PASO

### **PASO 1: Crear Proyecto en Supabase**
1. Ve a [supabase.com](https://supabase.com)
2. Clic en **"New Project"**
3. Configura:
   - Name: `lpdp-capacitacion`
   - Database Password: **Guarda bien esta contraseña**
   - Region: `US West (Oregon)` (mismo que Render)
4. Espera 2-3 minutos a que se cree

### **PASO 2: Obtener URL de Conexión**
1. En tu proyecto Supabase, ve a **Settings** → **Database**
2. En la sección **Connection string**, selecciona **URI**
3. Copia la URL que se ve así:
   ```
   postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
4. Reemplaza `[PASSWORD]` con tu contraseña real

### **PASO 3: Ejecutar Migración Automática**
1. Abre terminal en el directorio del proyecto
2. Instala dependencias si no las tienes:
   ```bash
   pip install psycopg2-binary
   ```
3. Ejecuta el script de migración:
   ```bash
   python scripts/migrate_render_to_supabase.py
   ```
4. Sigue las instrucciones:
   - Pega tu DATABASE_URL actual de Render
   - Pega tu nueva DATABASE_URL de Supabase
   - Escribe `MIGRAR` para confirmar

### **PASO 4: Actualizar Variables en Render**
1. Ve a tu dashboard de [Render](https://dashboard.render.com)
2. Selecciona tu Web Service del backend
3. Ve a **Environment**
4. Encuentra la variable `DATABASE_URL`
5. Clic en **Edit** y pega la nueva URL de Supabase
6. Clic en **Save Changes**
7. Espera el redeploy automático (~2 minutos)

### **PASO 5: Verificar Funcionamiento**
1. Ve a tu URL del backend: `https://tu-backend.onrender.com/health`
2. Debería responder: `{"status": "healthy"}`
3. Prueba el endpoint: `https://tu-backend.onrender.com/api/v1/docs`
4. Verifica que puedes hacer login en el frontend

---

## 🛠️ **CONFIGURACIÓN ADICIONAL (Opcional)**

### **Habilitar Row Level Security (RLS)**
En Supabase SQL Editor, ejecuta:
```sql
-- Habilitar RLS en tablas principales
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades_tratamiento ENABLE ROW LEVEL SECURITY;

-- Política básica (ajustar según necesidades)
CREATE POLICY "usuarios_policy" ON usuarios
    FOR ALL USING (tenant_id = current_setting('app.current_tenant'));
```

### **Configurar Conexión Pooling**
Supabase incluye pooling automático, pero puedes ajustar en **Settings** → **Database** → **Connection pooling**

---

## 📊 **BENEFICIOS POST-MIGRACIÓN**

### **Costos**
- ✅ Base de datos GRATIS (hasta 500MB)
- ✅ Backups automáticos incluidos
- ✅ Solo pagas Render backend ($7/mes)

### **Performance**
- ⚡ Conexión pooling automática
- ⚡ SSD storage optimizado
- ⚡ Replicación automática

### **Herramientas**
- 📊 Dashboard visual de Supabase
- 📝 SQL Editor integrado
- 📈 Métricas en tiempo real
- 🔍 Logs detallados

---

## 🆘 **SOLUCIÓN DE PROBLEMAS**

### **Error de Conexión**
```bash
# Verificar conectividad
psql "postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres" -c "SELECT version();"
```

### **Error de Esquemas**
Si faltan esquemas, ejecuta en Supabase SQL Editor:
```sql
-- Crear esquemas si no existen
CREATE SCHEMA IF NOT EXISTS lpdp;
CREATE SCHEMA IF NOT EXISTS tenant_demo;
```

### **Error de Autenticación**
Verifica que la contraseña en la URL no tenga caracteres especiales sin encodear.

### **Render No Redespliega**
1. Ve a **Deployments** en Render
2. Clic en **Manual Deploy** → **Clear build cache & deploy**

---

## 🔄 **ROLLBACK (Si algo falla)**

Si tienes problemas, puedes volver rápidamente:

1. En Render, cambia DATABASE_URL de vuelta a la original
2. El backup está guardado en `migration_backup_[timestamp]/`
3. Render rethumb automáticamente a la DB original

---

## ✅ **CHECKLIST FINAL**

- [ ] Proyecto Supabase creado
- [ ] URL de conexión obtenida
- [ ] Script de migración ejecutado
- [ ] Variables actualizadas en Render
- [ ] Backend redesplegado exitosamente
- [ ] Health check funcionando
- [ ] API docs accesibles
- [ ] Login desde frontend funcional
- [ ] Backup guardado localmente

---

## 📞 **SOPORTE**

**Si tienes problemas:**

1. **Logs de Render**: Dashboard → tu service → Logs
2. **Logs de Supabase**: Dashboard → Logs & Reports
3. **Verificar backup**: Archivo en `migration_backup_[timestamp]/`

**Comandos útiles:**
```bash
# Verificar conexión a Supabase
python -c "import psycopg2; print('OK') if psycopg2.connect('TU_SUPABASE_URL') else print('Error')"

# Ver tablas migradas
psql "TU_SUPABASE_URL" -c "\dt"
```

---

🎉 **¡Con esto tendrás tu backend funcionando en Render con base de datos gratuita en Supabase!**