#!/bin/bash

# 🚨 SCRIPT DE EMERGENCIA - DESPLEGAR BACKEND INMEDIATAMENTE
# Ingeniero en Jefe - Corrección Automática

echo "🚨 ALERTA CRÍTICA: Backend no está desplegado en Render"
echo "🛠️ INICIANDO DESPLIEGUE DE EMERGENCIA..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

log "🚀 Iniciando despliegue de emergencia del backend..."

# 1. VERIFICAR GIT STATUS
log "📋 Verificando estado de Git..."
if [ -n "$(git status --porcelain)" ]; then
    warning "⚠️  Hay cambios sin commitear. Haciendo commit automático..."
    git add .
    git commit -m "🚨 Despliegue de emergencia - Backend no responde - $(date)"
    success "✅ Cambios commiteados"
else
    success "✅ No hay cambios pendientes"
fi

# 2. VERIFICAR CONFIGURACIÓN DEL BACKEND
log "🔧 Verificando configuración del backend..."
cd backend

# Verificar requirements.txt
if [ ! -f "requirements.txt" ]; then
    error "❌ No se encontró requirements.txt"
    exit 1
fi

# Verificar render.yaml
if [ ! -f "render.yaml" ]; then
    error "❌ No se encontró render.yaml"
    exit 1
fi

success "✅ Archivos de configuración verificados"

# 3. CREAR ARCHIVO .env DE EMERGENCIA
log "📝 Creando archivo .env de emergencia..."
cat > .env << 'EOF'
# CONFIGURACIÓN DE EMERGENCIA - INGENIERO EN JEFE
DATABASE_URL=postgresql://postgres.symkjkbejxexgrydmvqs:[TU_PASSWORD_SUPABASE]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
SECRET_KEY=KL4um-775jA5N*P_EMERGENCY_2024
ENVIRONMENT=production
DEBUG=false
ALLOWED_ORIGINS=https://scldp-frontend.onrender.com
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
DB_POOL_TIMEOUT=30
LOG_LEVEL=INFO
ENABLE_ACCESS_LOG=true
BCRYPT_ROUNDS=12
SESSION_TIMEOUT=3600
EOF

success "✅ Archivo .env de emergencia creado"

# 4. VERIFICAR QUE EL BACKEND COMPILE
log "🏗️ Verificando que el backend compile..."
cd ..

# Intentar importar el módulo principal
cd backend
python -c "import app.main; print('✅ Backend compila correctamente')" 2>/dev/null
if [ $? -eq 0 ]; then
    success "✅ Backend compila correctamente"
else
    error "❌ Error compilando backend"
    error "💡 Ejecuta: cd backend && python -c 'import app.main'"
    exit 1
fi
cd ..

# 5. INSTRUCCIONES DE DESPLIEGUE
echo ""
echo "🚨 INSTRUCCIONES DE DESPLIEGUE DE EMERGENCIA:"
echo "=============================================="
echo ""
echo "1️⃣ VE A RENDER.COM Y CREA UN NUEVO SERVICIO:"
echo "   - Tipo: Web Service"
echo "   - Nombre: scldp-backend"
echo "   - Repositorio: Tu repo de GitHub"
echo "   - Rama: main"
echo "   - Root Directory: backend"
echo ""
echo "2️⃣ CONFIGURA EL SERVICIO:"
echo "   - Runtime: Python 3"
echo "   - Build Command: pip install -r requirements.txt"
echo "   - Start Command: uvicorn app.main:app --host 0.0.0.0 --port \$PORT"
echo "   - Plan: Free (para pruebas)"
echo ""
echo "3️⃣ CONFIGURA VARIABLES DE ENTORNO:"
echo "   - DATABASE_URL: [Tu URL de Supabase]"
echo "   - SECRET_KEY: KL4um-775jA5N*P_EMERGENCY_2024"
echo "   - ENVIRONMENT: production"
echo "   - DEBUG: false"
echo ""
echo "4️⃣ HAZ CLICK EN 'CREATE WEB SERVICE'"
echo ""
echo "5️⃣ ESPERA A QUE SE DESPLEGUE (3-5 minutos)"
echo ""
echo "6️⃣ VERIFICA QUE ESTÉ FUNCIONANDO:"
echo "   - Status: Live"
echo "   - Health Check: Healthy"
echo ""
echo "7️⃣ PRUEBA EL LOGIN:"
echo "   - Usuario: admin"
echo "   - Contraseña: Admin123!"
echo ""

# 6. VERIFICAR URL DEL BACKEND
echo "🔗 URL ESPERADA DEL BACKEND:"
echo "   https://scldp-backend.onrender.com"
echo ""
echo "🔗 URL DEL FRONTEND:"
echo "   https://scldp-frontend.onrender.com"
echo ""

# 7. COMANDO DE VERIFICACIÓN
echo "🧪 COMANDO PARA VERIFICAR BACKEND:"
echo "   curl -X GET https://scldp-backend.onrender.com/"
echo ""

success "🎯 SCRIPT DE EMERGENCIA COMPLETADO"
success "🚨 AHORA DESPLIEGA EL BACKEND EN RENDER MANUALMENTE"
success "💡 SIGUE LAS INSTRUCCIONES DE ARRIBA"

echo ""
echo "⚠️  IMPORTANTE: El backend NO se desplegará automáticamente"
echo "   Debes ir a Render.com y crear el servicio manualmente"
echo "   siguiendo las instrucciones de arriba."
echo ""
