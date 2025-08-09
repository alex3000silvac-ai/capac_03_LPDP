# 🚀 Deployment en Render

## Sistema de Capacitación LPDP - Ley 21.719

### 1. Configuración Inicial en Render

1. **Crear cuenta en Render.com**
2. **Conectar con GitHub**
3. **Crear nuevo Web Service**:
   - Seleccionar este repositorio
   - Runtime: Python 3.11
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 2. Variables de Entorno Requeridas

En Render Dashboard > Environment:

```
DATABASE_URL=<auto-generada-por-render>
SECRET_KEY=<generar-con-openssl-rand-hex-32>
LICENSE_ENCRYPTION_KEY=<generar-con-openssl-rand-hex-32>
ENVIRONMENT=production
DEBUG=false
PYTHONPATH=/opt/render/project/src/backend
```

### 3. Base de Datos

1. Crear PostgreSQL en Render (Plan Starter)
2. Conectar con el Web Service
3. Ejecutar script de inicialización:

```bash
python init_db.py
```

### 4. Verificación

- API Docs: https://tu-app.onrender.com/docs
- Health Check: https://tu-app.onrender.com/health

### 5. Administración

**Usuario Admin por defecto:**
- Email: admin@juridicadigital.cl
- Password: Admin123!@#

**Empresa Demo:**
- Dominio: demo.juridicadigital.cl
- Todos los módulos activos
- 50 usuarios disponibles

### 📋 Módulos del Sistema

1. **MOD-1**: Gestión de Consentimientos
2. **MOD-2**: Derechos ARCOPOL
3. **MOD-3**: Inventario de Datos
4. **MOD-4**: Gestión de Brechas
5. **MOD-5**: Evaluaciones DPIA
6. **MOD-6**: Transferencias Internacionales
7. **MOD-7**: Auditoría y Cumplimiento

### 🛠️ Comandos Útiles

```bash
# Ver logs
render logs

# Ejecutar migraciones
python -m alembic upgrade head

# Crear superusuario
python scripts/create_superuser.py

# Inicializar empresa
python scripts/init_empresa.py --rut "76.xxx.xxx-x" --nombre "Mi Empresa"
```
