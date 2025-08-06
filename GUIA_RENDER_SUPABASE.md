# Guía Rápida: Render + Supabase

## 1️⃣ Base de Datos Supabase ✅
Ya está lista y funcionando. Tu DATABASE_URL es:
```
postgresql://postgres.symkjkbejxexgrydmvqs:[TU-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

## 2️⃣ Desplegar en Render

### Opción A: Usar render.yaml (Automático)
1. En Render, click **"New +"** → **"Blueprint"**
2. Conecta tu repo `capac_03_LPDP`
3. Render detectará el `render.yaml` automáticamente
4. Configurará backend y frontend de una vez

### Opción B: Crear servicios manualmente

#### Backend:
1. **New +** → **Web Service**
2. Conecta GitHub repo
3. Configuración:
   - Name: `scldp-backend`
   - Root Directory: `backend`
   - Runtime: Python 3
   - Build: `pip install -r requirements.txt`
   - Start: `gunicorn app.main:app --workers 2 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`
   - Plan: Starter ($7/mes)

4. **Variables de entorno**:
   - `DATABASE_URL`: [Tu URL de Supabase completa]
   - `SECRET_KEY`: KL4um-775jA5N*P
   - `FRONTEND_URL`: https://scldp-frontend.onrender.com

#### Frontend:
1. **New +** → **Static Site**
2. Mismo repo
3. Configuración:
   - Name: `scldp-frontend`
   - Root Directory: `frontend`
   - Build: `npm install && npm run build`
   - Publish: `build`

## 3️⃣ URLs Finales
- Frontend: https://scldp-frontend.onrender.com
- Backend API: https://scldp-backend.onrender.com
- API Docs: https://scldp-backend.onrender.com/docs

## 📌 Notas
- El plan Starter no duerme los servicios
- Supabase tiene conexión pooler incluida
- Deploy automático con cada push a GitHub