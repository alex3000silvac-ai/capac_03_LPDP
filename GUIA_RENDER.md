# Guía de Despliegue en Render.com

## Paso 1: Crear cuenta en Render
1. Ve a https://render.com
2. Regístrate con GitHub (usa la misma cuenta alex3000silvac-ai)
3. Autoriza Render para acceder a tus repositorios

## Paso 2: Crear Base de Datos PostgreSQL
1. Click en "New +" → "PostgreSQL"
2. Configuración:
   - Name: `scldp-db`
   - Database: `scldp`
   - User: (se genera automáticamente)
   - Region: Oregon (US West)
   - Instance Type: Free
3. Click "Create Database"
4. Espera que se cree (~2 minutos)
5. Copia el "External Database URL" (empieza con `postgresql://`)

## Paso 3: Ejecutar script de base de datos
```bash
# Reemplaza DATABASE_URL con la URL que copiaste
psql "DATABASE_URL" -f database/supabase_init.sql
```

## Paso 4: Desplegar Backend
1. Click en "New +" → "Web Service"
2. Conecta el repositorio `capac_03_LPDP`
3. Configuración:
   - Name: `scldp-backend`
   - Root Directory: `backend`
   - Runtime: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Instance Type: Free
4. Variables de entorno (Environment):
   - `DATABASE_URL`: (pega la URL de PostgreSQL)
   - `SECRET_KEY`: `KL4um-775jA5N*P`
   - `FRONTEND_URL`: `https://scldp-frontend.onrender.com`
5. Click "Create Web Service"

## Paso 5: Desplegar Frontend
1. Click en "New +" → "Static Site"
2. Conecta el mismo repositorio
3. Configuración:
   - Name: `scldp-frontend`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`
4. Click "Create Static Site"

## Paso 6: Actualizar URL del Backend en Frontend
1. Una vez desplegado el backend, copia su URL (ej: https://scldp-backend.onrender.com)
2. En el código, actualiza `frontend/src/services/api.js`:
```javascript
const API_BASE_URL = 'https://scldp-backend.onrender.com';
```
3. Commit y push el cambio
4. Render redesplega automáticamente

## URLs Finales
- Frontend: https://scldp-frontend.onrender.com
- Backend: https://scldp-backend.onrender.com
- API Docs: https://scldp-backend.onrender.com/docs

## Ventajas sobre Railway
✅ No requiere cuenta antigua de GitHub
✅ Frontend gratis sin límites
✅ PostgreSQL gratis por 90 días
✅ Despliegue automático con cada push
✅ SSL/HTTPS automático
✅ Logs en tiempo real
✅ Métricas incluidas

## Notas
- El backend puede tardar 1-2 minutos en arrancar la primera vez
- Los servicios gratuitos se duermen después de 15 min de inactividad
- El primer request después de dormir tarda ~30 segundos