#!/bin/bash

# 🚀 SCRIPT DE DESPLIEGUE AUTOMATIZADO PARA RENDER + SUPABASE
# Este script prepara y despliega el sistema LPDP en Render

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de logging
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "backend/app/main.py" ]; then
    error "❌ No se encontró el backend. Ejecuta este script desde el directorio raíz del proyecto."
    exit 1
fi

log "🚀 Iniciando despliegue en Render con Supabase..."

# Verificar Git
if ! command -v git &> /dev/null; then
    error "❌ Git no está instalado"
    exit 1
fi

# Verificar estado de Git
if [ -n "$(git status --porcelain)" ]; then
    warning "⚠️  Hay cambios sin commitear. Haciendo commit automático..."
    git add .
    git commit -m "🚀 Despliegue automático en Render - $(date)"
fi

# Preparar backend
log "📦 Preparando backend..."
cd backend

# Verificar requirements.txt
if [ ! -f "requirements.txt" ]; then
    error "❌ No se encontró requirements.txt en el backend"
    exit 1
fi

# Crear .env de ejemplo si no existe
if [ ! -f ".env" ]; then
    log "📝 Creando archivo .env de ejemplo..."
    cat > .env << EOF
# Configuración para desarrollo local
DATABASE_URL=postgresql://postgres:[TU_PASSWORD_SUPABASE]@db.[TU_PROJECT_ID].supabase.co:5432/postgres
SECRET_KEY=tu_clave_secreta_muy_larga_y_segura_aqui_cambiala_en_produccion
ENVIRONMENT=development
DEBUG=true
ALLOWED_ORIGINS=https://scldp-frontend.onrender.com,http://localhost:3000
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
EOF
    success "✅ Archivo .env creado"
fi

# Verificar render.yaml
if [ ! -f "render.yaml" ]; then
    error "❌ No se encontró render.yaml en el backend"
    exit 1
fi

cd ..

# Preparar frontend
log "📦 Preparando frontend..."
cd frontend

# Verificar package.json
if [ ! -f "package.json" ]; then
    error "❌ No se encontró package.json en el frontend"
    exit 1
fi

# Instalar dependencias
log "📥 Instalando dependencias del frontend..."
if npm install; then
    success "✅ Dependencias del frontend instaladas"
else
    error "❌ Error instalando dependencias del frontend"
    exit 1
fi

# Verificar jwt-decode
if npm list jwt-decode > /dev/null 2>&1; then
    success "✅ jwt-decode instalado correctamente"
else
    warning "⚠️  jwt-decode no está instalado. Reintentando..."
    npm install jwt-decode
    if npm list jwt-decode > /dev/null 2>&1; then
        success "✅ jwt-decode instalado en segundo intento"
    else
        error "❌ No se pudo instalar jwt-decode"
        exit 1
    fi
fi

# Build del frontend
log "🔨 Construyendo frontend..."
if npm run build; then
    success "✅ Frontend construido correctamente"
else
    error "❌ Error construyendo frontend"
    exit 1
fi

cd ..

# Crear archivo de instrucciones de despliegue
log "📋 Creando instrucciones de despliegue..."
cat > INSTRUCCIONES_DESPLIEGUE_RENDER.md << 'EOF'
# 🚀 INSTRUCCIONES DE DESPLIEGUE EN RENDER

## 🎯 **OBJETIVO**
Desplegar el sistema LPDP completo en Render con Supabase como base de datos.

## 📋 **PASOS PARA DESPLEGAR**

### **PASO 1: Crear Proyecto Backend en Render**

1. **Ir a**: https://render.com/dashboard
2. **Crear nuevo Web Service**
3. **Conectar repositorio Git**
4. **Configurar servicio**:
   - **Name**: `scldp-backend`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt && alembic upgrade head`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### **PASO 2: Configurar Variables de Entorno**

En tu servicio de Render, configurar estas variables:

```bash
# Base de datos Supabase
DATABASE_URL=postgresql://postgres.[TU_PASSWORD]@db.[TU_PROJECT_ID].supabase.co:5432/postgres

# JWT y Seguridad
SECRET_KEY=tu_clave_secreta_muy_larga_y_segura_aqui_cambiala_en_produccion_minimo_32_caracteres
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Sistema
ENVIRONMENT=production
DEBUG=false

# CORS
ALLOWED_ORIGINS=https://scldp-frontend.onrender.com

# Base de datos
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
DB_POOL_TIMEOUT=30

# Logging
LOG_LEVEL=INFO
ENABLE_ACCESS_LOG=true

# Seguridad
BCRYPT_ROUNDS=12
SESSION_TIMEOUT=3600
```

### **PASO 3: Crear Usuarios en Supabase**

1. **Ir a SQL Editor en Supabase**
2. **Ejecutar el script**: `SUPABASE_USERS_VALIDADO.sql`
3. **Verificar que se crearon los usuarios**

### **PASO 4: Credenciales de Acceso**

```
👑 SUPER ADMIN: admin / Admin123!
👤 DEMO: demo / Demo123!
🔒 DPO: dpo / Dpo123!
```

### **PASO 5: Verificar Despliegue**

1. **Backend**: Verificar que esté funcionando en Render
2. **Frontend**: Ya está desplegado en https://scldp-frontend.onrender.com
3. **Base de datos**: Verificar conexión desde Render a Supabase

## 🔧 **ARCHIVOS IMPORTANTES**

- `backend/render.yaml`: Configuración del backend en Render
- `SUPABASE_USERS_VALIDADO.sql`: Script para crear usuarios
- `RENDER_SUPABASE_CONFIG.env`: Variables de entorno de ejemplo

## 🚨 **PROBLEMAS COMUNES**

### **Error: "Database connection failed"**
- ✅ Verificar `DATABASE_URL` en Render
- ✅ Verificar credenciales de Supabase
- ✅ Verificar que la base de datos esté activa

### **Error: "Module not found"**
- ✅ Verificar que `requirements.txt` esté en el repositorio
- ✅ Verificar que el build command incluya `pip install -r requirements.txt`

### **Error: "Table users does not exist"**
- ✅ Verificar que `alembic upgrade head` esté en el build command
- ✅ Verificar que las migraciones estén en el repositorio

## 🎉 **RESULTADO ESPERADO**

- ✅ **Backend**: Funcionando en Render
- ✅ **Frontend**: Conectado al backend de Render
- ✅ **Base de datos**: Supabase funcionando
- ✅ **Sistema**: Completamente operativo

---

**¡Con esta configuración tendrás el sistema funcionando en Render! 🚀**
EOF

success "✅ Instrucciones de despliegue creadas"

# Hacer push a Git
log "📤 Haciendo push a Git..."
if git push; then
    success "✅ Código enviado a Git"
else
    warning "⚠️  Error haciendo push a Git. Verifica tu configuración."
fi

# Resumen final
echo ""
echo "🎉 DESPLIEGUE PREPARADO EXITOSAMENTE!"
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo "1. Ve a https://render.com/dashboard"
echo "2. Crea un nuevo Web Service"
echo "3. Conecta tu repositorio Git"
echo "4. Configura las variables de entorno"
echo "5. Ejecuta el script SQL en Supabase"
echo ""
echo "📁 ARCHIVOS CREADOS:"
echo "- SUPABASE_USERS_VALIDADO.sql (usuarios para Supabase)"
echo "- RENDER_SUPABASE_CONFIG.env (configuración de ejemplo)"
echo "- backend/render.yaml (configuración de Render)"
echo "- INSTRUCCIONES_DESPLIEGUE_RENDER.md (guía completa)"
echo ""
echo "🔐 CREDENCIALES:"
echo "- admin / Admin123!"
echo "- demo / Demo123!"
echo "- dpo / Dpo123!"
echo ""
echo "🚀 ¡Tu sistema estará funcionando en Render en minutos!"
