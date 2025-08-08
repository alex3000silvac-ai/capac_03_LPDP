# 📚 Instrucciones de Despliegue - Sistema Multi-tenant LPDP

## 🎯 Resumen del Sistema

Este es un **sistema funcional completo** para capacitación y cumplimiento de la Ley 21.719 con:

- ✅ **Multi-tenant**: Cada empresa tiene su propio esquema aislado
- ✅ **Control de licencias**: Sistema de licencias encriptadas por módulo
- ✅ **7 módulos funcionales**: No es una maqueta, genera documentos reales
- ✅ **Plataforma de administración**: Gestión completa de empresas y accesos

## 🚀 Pasos para Desplegar

### 1. Preparar Supabase

1. Ve a tu proyecto en [Supabase](https://app.supabase.com)
2. Ve a **SQL Editor**
3. Ejecuta el script `database/init_multitenant.sql`
4. Guarda la URL de conexión de tu base de datos

### 2. Subir a GitHub

```bash
# En la carpeta del proyecto
cd /mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP

# Inicializar git si no está iniciado
git init

# Agregar todos los archivos
git add .

# Commit inicial
git commit -m "Sistema completo multi-tenant LPDP - 7 módulos funcionales"

# Agregar tu repositorio remoto
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git

# Push al repositorio
git push -u origin main
```

### 3. Configurar en Render

#### Backend (API)

1. En Render, crea un nuevo **Web Service**
2. Conecta tu repositorio de GitHub
3. Configura:
   - **Name**: `juridica-digital-api`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **Variables de Entorno** (Environment Variables):
   ```
   DATABASE_URL=postgresql://[TU_USUARIO]:[TU_PASSWORD]@[HOST]/postgres
   SECRET_KEY=genera-una-clave-segura-de-32-caracteres
   LICENSE_ENCRYPTION_KEY=otra-clave-segura-de-32-caracteres
   ADMIN_EMAIL=admin@tudominio.cl
   ADMIN_PASSWORD=PasswordSeguro123!
   ENVIRONMENT=production
   ```

5. Deploy!

#### Frontend

1. Crea otro **Static Site** en Render
2. Configura:
   - **Name**: `juridica-digital-app`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

3. **Variables de Entorno**:
   ```
   REACT_APP_API_URL=https://juridica-digital-api.onrender.com
   ```

### 4. Inicializar la Base de Datos

Una vez desplegado el backend:

```bash
# Conecta por SSH o usa la consola de Render
# Ejecuta el script de inicialización
python scripts/init_db.py
```

Esto creará:
- Tenant demo con 30 días de prueba
- Usuario admin (admin/Admin123!)
- Superusuario del sistema
- Roles predefinidos

## 🔐 Sistema de Licencias

El sistema controla el acceso a módulos mediante licencias encriptadas:

1. **Crear licencia** (desde admin):
   ```json
   POST /api/v1/empresas/licencias/
   {
     "empresa_id": "uuid-empresa",
     "modulos": ["MOD-1", "MOD-2", "MOD-3"],
     "duracion_meses": 12
   }
   ```

2. **Activar licencia** (desde la empresa):
   ```json
   POST /api/v1/empresas/licencias/activate
   {
     "codigo_licencia": "JD-XXXX-XXXX-XXXX-XXXX"
   }
   ```

## 📦 Módulos Disponibles

- **MOD-1**: Gestión de Consentimientos
- **MOD-2**: Derechos ARCOPOL
- **MOD-3**: Inventario de Actividades
- **MOD-4**: Notificación de Brechas
- **MOD-5**: Evaluaciones de Impacto (DPIA)
- **MOD-6**: Transferencias Internacionales
- **MOD-7**: Auditoría y Cumplimiento

## 🏢 Flujo Multi-tenant

1. **Crear Tenant** (superadmin):
   ```json
   POST /api/v1/tenants/
   {
     "tenant_id": "empresa1",
     "company_name": "Empresa 1 SpA",
     "rut": "76.xxx.xxx-x",
     "email": "contacto@empresa1.cl"
   }
   ```

2. **Acceso por Tenant**:
   - Header: `X-Tenant-ID: empresa1`
   - O subdominio: `empresa1.app.juridicadigital.cl`

## 🛠️ Administración del Sistema

### Panel de Superadmin

Accede con el superusuario para:
- Crear nuevos tenants
- Gestionar licencias maestras
- Ver estadísticas globales
- Configurar precios de módulos

### Panel de Admin por Tenant

Cada tenant tiene su admin para:
- Gestionar usuarios
- Activar licencias
- Ver uso de módulos
- Configurar la empresa

## 📊 Monitoreo

- Logs en Render Dashboard
- Métricas de uso por tenant
- Alertas de expiración de licencias
- Auditoría completa de acciones

## 🆘 Troubleshooting

### Error de conexión a BD
- Verifica que la URL de Supabase sea correcta
- Incluye `?sslmode=require` al final

### Error de permisos
- Asegúrate de ejecutar `init_multitenant.sql`
- Verifica que el usuario tenga permisos CREATE SCHEMA

### Módulos no accesibles
- Verifica que la licencia esté activa
- Revisa la fecha de expiración
- Confirma que el módulo esté en la licencia

## 📞 Soporte

Para soporte adicional:
- Email: soporte@juridicadigital.cl
- Documentación: `/api/v1/docs`

---

**IMPORTANTE**: Este es un sistema completamente funcional, no una maqueta. Cada módulo permite el aprendizaje práctico de la Ley 21.719 generando documentos y registros reales.