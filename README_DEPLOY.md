# Guía de Despliegue - SCLDP

## 🚀 Despliegue en Railway con Supabase

### Prerrequisitos
- Cuenta en [GitHub](https://github.com)
- Cuenta en [Railway](https://railway.app)
- Cuenta en [Supabase](https://supabase.com)

### 1. Configurar Supabase

1. Crear un nuevo proyecto en Supabase
2. Ir a Settings → Database
3. Copiar la Connection String (URI)
4. En el SQL Editor, ejecutar el script `database/supabase_init.sql`

### 2. Preparar el Repositorio

1. Hacer fork o clonar este repositorio
2. Crear un archivo `.env` basado en `.env.example`:

```bash
# Backend
SECRET_KEY=genera-una-clave-segura-aqui
ENVIRONMENT=production
DATABASE_URL=tu-url-de-supabase
FRONTEND_URL=https://tu-app.railway.app

# Frontend
REACT_APP_API_URL=https://tu-backend.railway.app
```

### 3. Desplegar Backend en Railway

1. Crear nuevo proyecto en Railway
2. Conectar con GitHub y seleccionar el repositorio
3. Railway detectará el Dockerfile automáticamente
4. Configurar las variables de entorno:
   - `SECRET_KEY`: Generar con `openssl rand -hex 32`
   - `DATABASE_URL`: URL de Supabase
   - `ENVIRONMENT`: production
   - `FRONTEND_URL`: URL del frontend (se obtiene después)

5. Railway asignará automáticamente:
   - `PORT`: Puerto dinámico
   - URL pública del servicio

### 4. Desplegar Frontend

#### Opción A: En Railway (mismo proyecto)

1. En el mismo proyecto, crear nuevo servicio
2. Configurar:
   - Build Command: `cd frontend && npm install && npm run build`
   - Start Command: `cd frontend && npm start`
   - Variables:
     - `REACT_APP_API_URL`: URL del backend

#### Opción B: En Vercel (recomendado para frontend)

1. Importar proyecto en [Vercel](https://vercel.com)
2. Configurar:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Variables de entorno:
     - `REACT_APP_API_URL`: URL del backend en Railway

### 5. Actualizar CORS

Una vez tengas las URLs finales:

1. En Railway, actualizar `FRONTEND_URL` con la URL real del frontend
2. Reiniciar el servicio backend

## 📝 Variables de Entorno Necesarias

### Backend (Railway)
```
SECRET_KEY=<clave-segura-generada>
DATABASE_URL=<postgresql://...@db.supabase.co:5432/postgres>
ENVIRONMENT=production
FRONTEND_URL=<https://tu-frontend.vercel.app>
```

### Frontend (Vercel/Railway)
```
REACT_APP_API_URL=<https://tu-backend.railway.app>
```

## 🔧 Comandos Útiles

### Generar SECRET_KEY
```bash
# Linux/Mac
openssl rand -hex 32

# Python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Verificar la conexión a Supabase
```bash
# Usar psql
psql <DATABASE_URL>
```

## 🐛 Solución de Problemas

### Error de CORS
- Verificar que `FRONTEND_URL` esté correctamente configurada
- Asegurarse de incluir el protocolo (https://)

### Error de conexión a base de datos
- Verificar que la IP de Railway esté permitida en Supabase
- Confirmar que el esquema `lpdp` se creó correctamente

### El frontend no conecta con el backend
- Verificar que `REACT_APP_API_URL` no tenga slash final
- Confirmar que el backend esté corriendo en el puerto correcto

## 🔒 Seguridad en Producción

1. **Cambiar todas las contraseñas por defecto**
2. **Generar un SECRET_KEY único y seguro**
3. **Habilitar SSL en Supabase**
4. **Configurar backup automático en Supabase**
5. **Implementar rate limiting en Railway**

## 📊 Monitoreo

### Railway
- Usar el dashboard para ver logs en tiempo real
- Configurar alertas de uso de recursos

### Supabase
- Monitor de queries en el dashboard
- Configurar alertas de uso de base de datos

## 🚦 Checklist de Despliegue

- [ ] Base de datos creada en Supabase
- [ ] Script SQL ejecutado exitosamente
- [ ] Variables de entorno configuradas
- [ ] Backend desplegado y accesible
- [ ] Frontend desplegado y accesible
- [ ] CORS configurado correctamente
- [ ] SSL habilitado
- [ ] Prueba de funcionalidad básica

## 📞 Soporte

Si encuentras problemas:
1. Revisar logs en Railway/Supabase
2. Verificar configuración de variables de entorno
3. Consultar la documentación de cada servicio