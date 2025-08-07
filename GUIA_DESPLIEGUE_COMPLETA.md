# Guía Completa de Despliegue: GitHub + Supabase + Render

Esta guía te ayudará a desplegar el Sistema de Capacitación en Ley de Protección de Datos Personales (SCLDP) usando GitHub para el código, Supabase para la base de datos y Render para el hosting.

## Requisitos Previos

- Cuenta en [GitHub](https://github.com)
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Render](https://render.com)
- Git instalado localmente

## Paso 1: Configurar GitHub

### 1.1 Subir el código a GitHub

```bash
# Si aún no has inicializado git
git init

# Agregar todos los archivos
git add .

# Crear primer commit
git commit -m "Initial commit: SCLDP - Sistema de Capacitación LPDP"

# Agregar el repositorio remoto (si no está configurado)
git remote add origin https://github.com/alex3000silvac-ai/capac_03_LPDP.git

# Subir a GitHub
git push -u origin main
```

### 1.2 Verificar archivos importantes

Asegúrate de que estos archivos estén en tu repositorio:
- `render.yaml` - Configuración de Render
- `.gitignore` - Para ignorar archivos sensibles
- `backend/requirements.txt` - Dependencias de Python
- `frontend/package.json` - Dependencias de Node.js
- `database/supabase_init.sql` - Script de inicialización de BD

## Paso 2: Configurar Supabase

### 2.1 Crear un nuevo proyecto en Supabase

1. Inicia sesión en [Supabase](https://app.supabase.com)
2. Click en "New project"
3. Configura:
   - **Project name**: `scldp-db`
   - **Database Password**: Genera una contraseña segura (guárdala!)
   - **Region**: Selecciona la más cercana
   - **Pricing Plan**: Free tier está bien para empezar

### 2.2 Configurar la base de datos

1. Una vez creado el proyecto, ve a **SQL Editor**
2. Crea una nueva query
3. Copia y pega el contenido de `database/supabase_init.sql`
4. Ejecuta el script (Run)

### 2.3 Obtener las credenciales de conexión

1. Ve a **Settings** → **Database**
2. En la sección **Connection string**, copia el URI (Connection pooling)
3. Debería verse así:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```
4. Guarda esta URL, la necesitarás para Render

### 2.4 Configurar Row Level Security (Opcional pero recomendado)

1. Ve a **Authentication** → **Policies**
2. Las políticas básicas ya están en el script SQL
3. Ajusta según tus necesidades de seguridad

## Paso 3: Configurar Render

### 3.1 Conectar GitHub con Render

1. Inicia sesión en [Render](https://render.com)
2. Click en **New +** → **Blueprint**
3. Conecta tu cuenta de GitHub si no lo has hecho
4. Selecciona el repositorio `capac_03_LPDP`
5. Render detectará automáticamente el archivo `render.yaml`

### 3.2 Configurar variables de entorno

Antes de desplegar, configura las variables de entorno:

1. En el dashboard de Render, verás dos servicios:
   - `scldp-backend` (Web Service)
   - `scldp-frontend` (Web Service)

2. Para el **Backend** (`scldp-backend`):
   - Click en el servicio
   - Ve a **Environment** → **Add Environment Variable**
   - Agrega:
     ```
     DATABASE_URL = [La URL de Supabase que copiaste]
     ```
   - Las demás variables se configuran automáticamente según `render.yaml`

### 3.3 Desplegar

1. Click en **Apply** para iniciar el despliegue
2. Render construirá y desplegará ambos servicios automáticamente
3. El proceso tomará unos 5-10 minutos

### 3.4 Verificar URLs

Una vez desplegados, tendrás:
- Backend: `https://scldp-backend.onrender.com`
- Frontend: `https://scldp-frontend.onrender.com`

## Paso 4: Verificación Post-Despliegue

### 4.1 Verificar el Backend

```bash
# Verificar que el API está funcionando
curl https://scldp-backend.onrender.com/api/v1/health

# Debería retornar algo como:
# {"status": "healthy", "database": "connected"}
```

### 4.2 Verificar el Frontend

1. Abre `https://scldp-frontend.onrender.com` en tu navegador
2. Deberías ver la página de inicio del sistema
3. Intenta navegar por las diferentes secciones

### 4.3 Verificar la conexión con la base de datos

1. En Supabase, ve a **Table Editor**
2. Deberías ver las tablas creadas por el script
3. Verifica que los módulos de capacitación se hayan insertado

## Paso 5: Configuración Adicional (Opcional)

### 5.1 Configurar un dominio personalizado

En Render:
1. Ve a cada servicio → **Settings** → **Custom Domains**
2. Agrega tu dominio personalizado
3. Configura los DNS según las instrucciones

### 5.2 Configurar SSL

- Render proporciona SSL automáticamente para dominios `.onrender.com`
- Para dominios personalizados, Render también gestiona SSL automáticamente

### 5.3 Configurar backups en Supabase

1. Ve a **Settings** → **Database** → **Backups**
2. Los backups están habilitados por defecto en el plan gratuito
3. Para backups más frecuentes, considera actualizar el plan

## Troubleshooting

### Problema: El frontend no se conecta al backend

**Solución:**
1. Verifica que la variable `REACT_APP_API_URL` esté correcta en el frontend
2. Verifica CORS en el backend (`FRONTEND_URL` debe coincidir)

### Problema: Error de conexión a la base de datos

**Solución:**
1. Verifica que la `DATABASE_URL` esté correcta en Render
2. Verifica que el password no contenga caracteres especiales problemáticos
3. En Supabase, verifica que la base de datos esté activa

### Problema: Build falla en Render

**Solución:**
1. Revisa los logs de build en Render
2. Verifica las versiones de Python/Node en los archivos de configuración
3. Asegúrate de que todos los archivos necesarios estén en el repositorio

## Mantenimiento

### Actualizar el código

```bash
# Hacer cambios localmente
git add .
git commit -m "Descripción de los cambios"
git push origin main

# Render detectará los cambios y re-desplegará automáticamente
```

### Monitorear el sistema

1. **Render Dashboard**: Métricas de CPU, memoria y logs
2. **Supabase Dashboard**: Métricas de base de datos y queries
3. **GitHub Actions** (opcional): Configurar CI/CD para pruebas automáticas

## Scripts Útiles

### Backup manual de la base de datos

```bash
# Desde tu máquina local con pg_dump instalado
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" > backup_$(date +%Y%m%d).sql
```

### Verificar salud del sistema

```bash
# Script simple de monitoreo
#!/bin/bash
BACKEND_URL="https://scldp-backend.onrender.com/api/v1/health"
FRONTEND_URL="https://scldp-frontend.onrender.com"

echo "Verificando Backend..."
curl -s $BACKEND_URL || echo "Backend no responde"

echo "Verificando Frontend..."
curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL || echo "Frontend no responde"
```

## Costos Estimados

### Plan Gratuito
- **GitHub**: Gratis para repositorios públicos/privados
- **Supabase**: 500MB de base de datos, 2GB de transferencia
- **Render**: 750 horas mensuales (suficiente para 1 servicio 24/7)

### Recomendaciones para Producción
- **Supabase Pro**: $25/mes (8GB base de datos, backups diarios)
- **Render**: ~$14/mes por servicio (para servicios 24/7)
- **Total estimado**: ~$50-60/mes para una aplicación en producción

## Próximos Pasos

1. **Configurar monitoreo**: Considera usar servicios como UptimeRobot
2. **Implementar CI/CD**: GitHub Actions para pruebas automáticas
3. **Configurar alertas**: Para errores y caídas del servicio
4. **Documentar API**: Considera agregar Swagger/OpenAPI
5. **Optimizar performance**: CDN para assets estáticos

## Soporte

Si encuentras problemas:
1. Revisa los logs en Render Dashboard
2. Verifica la consola de Supabase
3. Revisa los issues en GitHub
4. Contacta soporte de cada plataforma si es necesario

¡Tu aplicación ahora está lista para producción! 🚀