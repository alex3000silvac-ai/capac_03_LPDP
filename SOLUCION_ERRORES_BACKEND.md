# 🔧 Solución de Errores - Backend en Render

## 🔴 Errores Comunes y Soluciones

### 1. Error: "ModuleNotFoundError" o "No module named..."
**Causa**: Falta alguna dependencia en requirements.txt
**Solución**: 
- Verifica que todas las dependencias estén en `backend/requirements.txt`
- El archivo debe estar en la carpeta `backend/`, no en la raíz

### 2. Error: "python: can't open file 'app/main.py'"
**Causa**: Problema con el root directory o estructura de archivos
**Solución**:
- Verifica que Root Directory sea exactamente `backend`
- El archivo debe existir en `backend/app/main.py`

### 3. Error: "error connecting to database"
**Causa**: DATABASE_URL no configurada o incorrecta
**Solución**:
1. Ve a Environment en el servicio backend
2. Verifica que DATABASE_URL esté configurada
3. El formato debe ser:
   ```
   postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```

### 4. Error: "gunicorn: command not found"
**Causa**: Gunicorn no se instaló correctamente
**Solución**:
- Verifica que `gunicorn==21.2.0` esté en requirements.txt
- El build command debe ser: `pip install -r requirements.txt`

### 5. Error: "PORT environment variable not set"
**Causa**: Render proporciona PORT automáticamente
**Solución**:
- El start command debe usar `$PORT`:
  ```
  gunicorn app.main:app --workers 2 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
  ```

## 🔍 Pasos para Diagnosticar:

1. **Revisa los logs completos**:
   - En Render, ve a tu servicio backend
   - Click en "Logs"
   - Copia el error exacto

2. **Verifica la configuración del servicio**:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app.main:app --workers 2 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`

3. **Verifica las variables de entorno**:
   - DATABASE_URL (obligatoria)
   - SECRET_KEY (obligatoria)
   - FRONTEND_URL (opcional pero recomendada)

## 🚀 Configuración Correcta Completa:

### Service Settings:
- **Name**: scldp-backend
- **Region**: Oregon (US West)
- **Branch**: main
- **Root Directory**: backend
- **Runtime**: Python 3

### Build & Start Commands:
- **Build Command**: 
  ```
  pip install -r requirements.txt
  ```
- **Start Command**: 
  ```
  gunicorn app.main:app --workers 2 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
  ```

### Environment Variables:
```
DATABASE_URL = postgresql://postgres.xxxxx:[TU-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
SECRET_KEY = [genera una clave segura]
FRONTEND_URL = https://scldp-frontend.onrender.com
ENVIRONMENT = production
```

## 💡 Si el Error Persiste:

1. **Intenta un redeploy manual**:
   - En el servicio, click en "Manual Deploy"
   - Selecciona "Clear build cache & deploy"

2. **Verifica la estructura de archivos**:
   ```
   backend/
   ├── app/
   │   ├── main.py
   │   ├── core/
   │   ├── api/
   │   └── models/
   ├── requirements.txt
   └── alembic/
   ```

3. **Prueba localmente**:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

## 📋 Checklist de Verificación:

- [ ] requirements.txt está en `backend/`
- [ ] main.py está en `backend/app/`
- [ ] DATABASE_URL está configurada correctamente
- [ ] SECRET_KEY está configurada
- [ ] Root Directory es `backend` (sin /)
- [ ] Python version es compatible (3.9+)

## 🆘 Necesitas Más Ayuda:

Si el error persiste, copia:
1. El error exacto de los logs
2. Screenshot de la configuración del servicio
3. Screenshot de las variables de entorno (sin mostrar valores sensibles)

Esto ayudará a identificar el problema específico.