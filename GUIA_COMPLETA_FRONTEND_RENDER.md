# 📋 GUÍA COMPLETA: Desplegar Frontend en Render

## 🎯 Contexto
- **Backend**: Ya desplegado y funcionando en Render
- **Base de datos**: Supabase configurada y conectada
- **Frontend**: React app que necesita ser desplegada como Static Site

## 📝 Paso a Paso Detallado

### 1️⃣ Acceder a Render Dashboard
1. Ve a [https://dashboard.render.com](https://dashboard.render.com)
2. Deberías ver tu servicio backend ya funcionando

### 2️⃣ Crear Nuevo Static Site
1. Click en el botón **"New +"** (arriba a la derecha)
2. Selecciona **"Static Site"** del menú desplegable

### 3️⃣ Conectar Repositorio
1. Si ya conectaste tu GitHub, verás tus repositorios
2. Busca y selecciona: **`capac_03_LPDP`**
3. Click en **"Connect"**

### 4️⃣ Configuración del Static Site

**Completa estos campos EXACTAMENTE como se indica:**

#### Basic Settings:
- **Name**: `scldp-frontend`
- **Region**: Selecciona la misma región que tu backend
- **Branch**: `main`
- **Root Directory**: `frontend` ⚠️ IMPORTANTE: No pongas `/frontend`, solo `frontend`

#### Build Settings:
- **Build Command**: 
  ```
  npm install && npm run build
  ```
- **Publish Directory**: `build`

### 5️⃣ Variables de Entorno (MUY IMPORTANTE)

Antes de crear el sitio, configura estas variables:

1. Desplázate hasta la sección **"Environment Variables"**
2. Click en **"Add Environment Variable"**
3. Agrega estas variables EXACTAMENTE:

   **Variable 1:**
   - Key: `REACT_APP_API_URL`
   - Value: `https://scldp-backend.onrender.com` (o la URL de TU backend)
   
   **Variable 2:**
   - Key: `REACT_APP_ENVIRONMENT`
   - Value: `production`

   **Variable 3:**
   - Key: `NODE_VERSION`
   - Value: `18.0.0`

### 6️⃣ Crear el Static Site
1. Revisa que toda la configuración esté correcta
2. Click en **"Create Static Site"**

### 7️⃣ Monitorear el Despliegue
1. Render te llevará a la página del servicio
2. Verás los logs del build en tiempo real
3. El proceso toma entre 3-5 minutos
4. Estados del build:
   - 🟡 **Building**: Instalando dependencias y construyendo
   - 🟢 **Live**: ¡Desplegado exitosamente!
   - 🔴 **Failed**: Revisa los logs para ver el error

### 8️⃣ Verificar Funcionamiento

Una vez que el estado sea **"Live"**:

1. Tu URL será: `https://scldp-frontend.onrender.com`
2. Click en la URL para abrir tu aplicación
3. Deberías ver la página de login del sistema

### 9️⃣ Troubleshooting Común

**Si el build falla:**

1. **Error: "Cannot find module"**
   - Verifica que el Root Directory sea exactamente `frontend`
   - Asegúrate que `package.json` existe en `/frontend`

2. **Error: "npm ERR! Missing script: build"**
   - Verifica que en `frontend/package.json` exista el script build
   - Debería tener: `"build": "react-scripts build"`

3. **Página en blanco después del deploy:**
   - Verifica las variables de entorno
   - El API_URL debe incluir `https://` y NO tener `/` al final
   - Revisa la consola del navegador (F12)

4. **Error de CORS:**
   - El backend debe permitir peticiones desde el dominio del frontend
   - Verifica la configuración CORS en el backend

### 🔄 Actualizar CORS en Backend

Si tienes errores de CORS, actualiza tu backend:

1. Ve al servicio del backend en Render
2. Agrega esta variable de entorno:
   - Key: `FRONTEND_URL`
   - Value: `https://scldp-frontend.onrender.com`
3. El backend se reiniciará automáticamente

### ✅ Verificación Final

Usa este checklist:
- [ ] Frontend muestra estado "Live" en Render
- [ ] Puedes acceder a https://scldp-frontend.onrender.com
- [ ] La página de login se muestra correctamente
- [ ] No hay errores en la consola del navegador
- [ ] Puedes hacer login con las credenciales de prueba

### 📱 URLs Finales de tu Sistema

- **Frontend**: https://scldp-frontend.onrender.com
- **Backend API**: https://scldp-backend.onrender.com
- **Documentación API**: https://scldp-backend.onrender.com/docs
- **Base de datos**: Supabase (ya configurada)

### 💡 Tips Adicionales

1. **Auto-deploy**: Cada push a `main` desplegará automáticamente
2. **Logs**: Siempre revisa los logs si algo falla
3. **Variables**: Las variables con `REACT_APP_` son obligatorias para React
4. **Cache**: Si haces cambios, limpia caché del navegador (Ctrl+F5)

### 🆘 Si Necesitas Ayuda

Toma screenshots de:
1. La configuración del Static Site
2. Las variables de entorno
3. Los logs si hay errores
4. La consola del navegador si la página no carga

---

## 📌 Resumen Rápido

1. New+ → Static Site
2. Conectar repo `capac_03_LPDP`
3. Root Directory: `frontend`
4. Build: `npm install && npm run build`
5. Publish: `build`
6. Variables: REACT_APP_API_URL y REACT_APP_ENVIRONMENT
7. Create Static Site
8. Esperar 3-5 minutos
9. ¡Listo! 🎉