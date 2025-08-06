# Procedimiento Estándar para Desplegar React en Railway

## Problema Común
Railway detecta incorrectamente proyectos React como Python cuando hay archivos Python en el repositorio, causando el error "gunicorn not found".

## Solución Paso a Paso

### 1. Estructura del Proyecto
```
proyecto/
├── backend/         # API Python/FastAPI
│   ├── requirements.txt
│   └── ...
├── frontend/        # React App
│   ├── package.json
│   ├── public/
│   ├── src/
│   └── ...
└── README.md
```

### 2. Configuración en Railway

#### Paso 1: Crear Servicios Separados
1. En Railway, crear DOS servicios separados del mismo repositorio:
   - `mi-app-backend`
   - `mi-app-frontend`

#### Paso 2: Configurar el Backend
1. En Settings del servicio backend:
   - Root Directory: `/backend`
   - Watch Paths: `/backend/**`
2. Variables de entorno necesarias

#### Paso 3: Configurar el Frontend
1. En Settings del servicio frontend:
   - Root Directory: `/frontend`
   - Watch Paths: `/frontend/**`
   - Builder: Nixpacks (seleccionar explícitamente)

### 3. Archivos de Configuración Necesarios

#### frontend/railway.toml
```toml
[build]
builder = "nixpacks"
nixpacksPlan = { providers = ["node"] }
buildCommand = "npm install && CI=false npm run build"

[deploy]
startCommand = "npx serve -s build -l $PORT"
restartPolicyType = "on_failure"
```

#### frontend/nixpacks.toml
```toml
[phases.setup]
nixPkgs = ["nodejs-18_x", "npm"]

[phases.install]
cmds = ["npm install"]

[phases.build]
cmds = ["CI=false npm run build"]

[start]
cmd = "npx serve -s build -l $PORT"
```

#### frontend/.python-version
```
IGNORE
```

#### frontend/requirements.txt
```
# Este archivo está vacío intencionalmente
# Esto es un proyecto Node.js, no Python
```

### 4. package.json Necesario
```json
{
  "scripts": {
    "start": "serve -s build -l $PORT",
    "dev": "react-scripts start",
    "build": "react-scripts build"
  },
  "dependencies": {
    "serve": "^14.2.0"
  }
}
```

### 5. Comandos Git
```bash
git add -A
git commit -m "fix: configurar frontend como proyecto Node.js"
git push
```

## Verificación
1. El despliegue debe mostrar "Using Node provider"
2. No debe mencionar Python o gunicorn
3. Los logs deben mostrar `npm install` ejecutándose

## Tips Importantes
- NUNCA uses el mismo servicio para backend y frontend
- SIEMPRE especifica el root directory
- Los archivos `.python-version` y `requirements.txt` vacíos previenen la detección de Python
- El `nixpacksPlan = { providers = ["node"] }` fuerza el uso de Node.js

## Solución de Problemas
Si aún detecta Python:
1. Verificar que Root Directory esté configurado como `/frontend`
2. Confirmar que los archivos de configuración estén EN la carpeta frontend
3. En Railway Settings, verificar que el Builder sea "Nixpacks"
4. Revisar que no haya archivos Python sueltos en /frontend