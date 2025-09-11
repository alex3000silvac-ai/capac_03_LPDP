# 🚀 MIGRACIÓN COMPLETA DE SQL SERVER A SUPABASE

**Sistema LPDP (Ley de Protección de Datos Personales)**

## 📋 ESTADO ACTUAL DE LA MIGRACIÓN

### ✅ **Completado:**
1. **Detener todos los procesos actuales** - Procesos backend detenidos
2. **Script de exportación SQL Server** - `migration/export_sqlserver_data.py`
3. **Instalación Supabase CLI** - NPX Supabase configurado
4. **Esquema de migración** - SQL completo en `supabase/migrations/`
5. **Cliente Supabase** - Nueva configuración en `frontend/src/config/`

### 🔄 **Próximos Pasos:**

## 1. 🌐 CREAR PROYECTO EN SUPABASE

### Paso 1: Crear cuenta y proyecto
```bash
# 1. Ir a https://app.supabase.com
# 2. Crear nueva cuenta o iniciar sesión
# 3. Crear nuevo proyecto
# 4. Guardar URL y API Key
```

### Paso 2: Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
cp frontend/.env.supabase frontend/.env.local

# Editar con credenciales reales:
REACT_APP_SUPABASE_URL=https://TU_PROJECT_ID.supabase.co
REACT_APP_SUPABASE_ANON_KEY=TU_ANON_KEY
```

## 2. 🗄️ EJECUTAR MIGRACIONES

### Paso 1: Aplicar esquema inicial
```bash
cd /mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP

# Aplicar migración
npx supabase db push
```

### Paso 2: Verificar tablas creadas
```sql
-- En Supabase SQL Editor, verificar:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

## 3. 📦 MIGRAR DATOS EXISTENTES

### Paso 1: Exportar desde SQL Server
```bash
# Activar entorno Python
source venv/bin/activate

# Instalar dependencia si falta
pip install pyodbc

# Ejecutar exportación
python migration/export_sqlserver_data.py
```

### Paso 2: Importar a Supabase
```python
# Script automático de importación (crear si es necesario)
import json
from supabase import create_client

# Cargar datos exportados
with open('migration/data/organizaciones.json') as f:
    organizaciones = json.load(f)

# Insertar en Supabase
supabase = create_client(URL, KEY)
result = supabase.table('organizaciones').insert(organizaciones).execute()
```

## 4. 🔐 CONFIGURAR AUTENTICACIÓN

### Row Level Security (RLS) ya configurado en migración:
- ✅ Multi-tenant por `tenant_id`
- ✅ Roles de usuario (admin, dpo, usuario, auditor)
- ✅ Políticas de seguridad por tabla

### Crear usuarios de prueba:
```sql
-- En Supabase SQL Editor
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@lpdp.cl',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    NOW(),
    NOW()
);
```

## 5. 🎨 ACTUALIZAR FRONTEND

### Paso 1: Cambiar imports en componentes
```javascript
// Cambiar de:
import { supabase } from './config/sqlServerClient';

// A:
import { supabase } from './config/supabaseConfig';
```

### Paso 2: Actualizar AuthContext
```bash
# Editar archivo:
frontend/src/contexts/AuthContext.js

# Cambiar imports y métodos de autenticación
```

### Paso 3: Actualizar persistencia de datos
```bash
# Editar archivos de utilidades:
frontend/src/utils/supabaseEmpresaPersistence.js
# Ya no necesitará transformaciones, Supabase maneja JSON nativo
```

## 6. 🗂️ ESTRUCTURA DE ARCHIVOS MIGRADOS

```
Intro_LPDP/
├── supabase/
│   ├── config.toml
│   └── migrations/
│       └── 20240101000000_initial_schema.sql
├── migration/
│   ├── export_sqlserver_data.py
│   └── data/
│       ├── organizaciones.json
│       ├── usuarios.json
│       └── rats.json
├── frontend/
│   ├── .env.local (nuevo)
│   └── src/config/
│       ├── supabaseConfig.js (nuevo cliente)
│       └── supabaseClient.js (compatibilidad)
└── backend/ (ya no necesario)
```

## 7. 🚀 DESPLEGAR SISTEMA

### Opción A: Frontend en Supabase Hosting
```bash
cd frontend
npm run build
npx supabase hosting init
npx supabase hosting deploy
```

### Opción B: Frontend en Vercel/Netlify
```bash
# Configurar en plataforma:
# - REACT_APP_SUPABASE_URL
# - REACT_APP_SUPABASE_ANON_KEY
```

## 8. 🧪 TESTING Y VALIDACIÓN

### Checklist de funcionalidades:
- [ ] Login de usuarios
- [ ] Creación de organizaciones
- [ ] Gestión de RATs
- [ ] Creación de EIPDs
- [ ] Gestión de proveedores
- [ ] Notificaciones
- [ ] Multi-tenant isolation
- [ ] Subida de documentos

### Script de testing:
```javascript
// test-supabase.js
import { supabase } from './src/config/supabaseConfig';

async function testConnection() {
  console.log('🧪 Testing Supabase connection...');
  
  const { data, error } = await supabase
    .from('organizaciones')
    .select('count');
    
  console.log(error ? '❌ Error' : '✅ Connected');
}
```

## 9. 📊 BENEFICIOS DE LA MIGRACIÓN

### ✅ **Eliminados:**
- ❌ Backend FastAPI complejo
- ❌ Configuración SQL Server
- ❌ Problemas de conexión CORS
- ❌ Manejo manual de autenticación
- ❌ Configuración de drivers y sqlcmd

### ✅ **Obtenidos:**
- ✅ API REST automática
- ✅ Autenticación integrada
- ✅ RLS nativo para multi-tenant
- ✅ Storage de archivos incluido
- ✅ Realtime subscriptions
- ✅ Dashboard de administración
- ✅ Backups automáticos
- ✅ Escalabilidad automática

## 10. 🛡️ CONFIGURACIÓN DE SEGURIDAD

### Variables de entorno de producción:
```bash
# .env.production
REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=tu-clave-anonima
REACT_APP_ENVIRONMENT=production
REACT_APP_DEBUG=false
```

### Configurar RLS policies adicionales si es necesario:
```sql
-- Política personalizada ejemplo
CREATE POLICY "DPO puede ver todas las organizaciones" 
ON public.organizaciones FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() 
    AND rol = 'dpo'
    AND tenant_id = organizaciones.tenant_id
  )
);
```

## 11. 📝 COMANDO RÁPIDO DE MIGRACIÓN

```bash
# Ejecutar todos los pasos automatizados:
cd /mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP

# 1. Configurar Supabase
npx supabase login
npx supabase link --project-ref TU_PROJECT_ID
npx supabase db push

# 2. Exportar datos
python migration/export_sqlserver_data.py

# 3. Configurar frontend
cp frontend/.env.supabase frontend/.env.local
# (Editar .env.local con credenciales reales)

# 4. Instalar y probar
cd frontend
npm install
npm start
```

## 12. 📞 SOPORTE POST-MIGRACIÓN

### Logs y debugging:
- **Supabase Dashboard**: Logs de API y base de datos
- **Browser DevTools**: Errores de cliente
- **Supabase Studio**: Query analyzer

### Comandos útiles:
```bash
# Ver logs de Supabase
npx supabase functions logs

# Reset completo (cuidado!)
npx supabase db reset

# Backup
npx supabase db dump > backup.sql
```

---

## 🎯 **PRÓXIMO PASO INMEDIATO:**

**1. Crear proyecto en Supabase:**
- Ir a https://app.supabase.com
- Crear nuevo proyecto
- Copiar URL y API Key
- Configurar `.env.local`

**2. Ejecutar migración de esquema:**
```bash
npx supabase db push
```

**¿Listo para continuar? 🚀**