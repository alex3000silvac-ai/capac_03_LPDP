# INSTRUCCIONES PARA CREAR SERVICIOS EN RENDER MANUALMENTE

## 🎯 OBJETIVO
Crear 2 servicios nuevos en Render para backend y frontend del sistema LPDP

## 📋 PASO A PASO

### 1. CREAR SERVICIO BACKEND (lpdp-backend-v2)

1. **Ir a Render Dashboard** → Clic en "New" → "Web Service"

2. **Conectar Repositorio**:
   - Repository: `capac_03_LPDP` (el repositorio de GitHub)
   - Branch: `main`

3. **Configuración del Servicio**:
   ```
   Name: lpdp-backend-v2
   Environment: Node
   Region: Oregon (US West)
   Branch: main
   Root Directory: backend
   Build Command: npm install
   Start Command: npm start
   ```

4. **Variables de Entorno**:
   ```
   NODE_ENV=production
   PORT=10000
   SUPABASE_URL=https://vkyhsnlivgwgrhdbvynm.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZreWhzbmxpdmd3Z3JoZGJ2eW5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MzE5NjQsImV4cCI6MjA3MzIwNzk2NH0.ksKfolcFrxPvxte9A2UrV5-oDWSRKtw044UGbJvrW8s
   ```

5. **Plan**: Free
6. **Clic en "Create Web Service"**

---

### 2. CREAR SERVICIO FRONTEND (lpdp-frontend-v2)

1. **Ir a Render Dashboard** → Clic en "New" → "Static Site"

2. **Conectar Repositorio**:
   - Repository: `capac_03_LPDP` (el mismo repositorio)
   - Branch: `main`

3. **Configuración del Sitio**:
   ```
   Name: lpdp-frontend-v2
   Branch: main
   Build Command: cd frontend && npm ci && npm run build
   Publish Directory: frontend/build
   ```

4. **Variables de Entorno**:
   ```
   REACT_APP_SUPABASE_URL=https://vkyhsnlivgwgrhdbvynm.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZreWhzbmxpdmd3Z3JoZGJ2eW5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MzE5NjQsImV4cCI6MjA3MzIwNzk2NH0.ksKfolcFrxPvxte9A2UrV5-oDWSRKtw044UGbJvrW8s
   REACT_APP_BACKEND_URL=https://lpdp-backend-v2.onrender.com
   ```

5. **Configurar Redirects** (en la sección Advanced):
   ```
   /*    /index.html   200
   ```

6. **Clic en "Create Static Site"**

---

## ✅ RESULTADO ESPERADO

Deberías tener 3 servicios en tu dashboard:

1. **lpdp-sistema-supabase** (existente) - puede quedarse o eliminarse
2. **lpdp-backend-v2** (nuevo) - Web Service Node.js
3. **lpdp-frontend-v2** (nuevo) - Static Site

## 🌐 URLs FINALES

- **Frontend**: https://lpdp-frontend-v2.onrender.com
- **Backend API**: https://lpdp-backend-v2.onrender.com

## 🔑 CREDENCIALES DE PRUEBA

- **Email**: test@lpdp.cl
- **Contraseña**: Test123!

---

## ⚠️ NOTAS IMPORTANTES

1. **Tiempo de deployment**: El primer deployment puede tomar 5-10 minutos
2. **Orden de creación**: Crear primero el backend, luego el frontend
3. **Auto-deploy**: Ambos servicios se actualizarán automáticamente en cada push a main
4. **Plan Free**: Ambos servicios usan el plan gratuito de Render

## 🆘 EN CASO DE PROBLEMAS

Si algún servicio falla:
1. Verificar que las carpetas `backend/` y `frontend/` existen en el repositorio
2. Revisar los logs de deployment en Render
3. Verificar que las variables de entorno están correctamente configuradas