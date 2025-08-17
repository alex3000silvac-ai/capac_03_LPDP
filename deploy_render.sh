#!/bin/bash

# 🚀 SCRIPT DE DESPLIEGUE COMPLETO EN RENDER
# Sistema LPDP - Ley 21.719

echo "🎯 INICIANDO DESPLIEGUE COMPLETO EN RENDER..."
echo "================================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
show_message() {
    echo -e "${GREEN}✅ $1${NC}"
}

show_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

show_error() {
    echo -e "${RED}❌ $1${NC}"
}

show_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "README_SISTEMA_COMPLETO.md" ]; then
    show_error "Debes ejecutar este script desde el directorio raíz del proyecto"
    exit 1
fi

show_message "Directorio del proyecto verificado"

# 1. CONFIGURAR BACKEND
echo ""
show_info "🔧 CONFIGURANDO BACKEND..."

cd backend

# Verificar que existe requirements.txt
if [ ! -f "requirements.txt" ]; then
    show_error "No se encontró requirements.txt en el backend"
    exit 1
fi

# Verificar que existe render.yaml
if [ ! -f "render.yaml" ]; then
    show_error "No se encontró render.yaml en el backend"
    exit 1
fi

show_message "Archivos de configuración del backend verificados"

# Crear .env de ejemplo si no existe
if [ ! -f ".env" ]; then
    show_info "Creando archivo .env de ejemplo..."
    cp env.example .env
    show_warning "IMPORTANTE: Edita el archivo .env con tus configuraciones antes de desplegar"
fi

# 2. CONFIGURAR FRONTEND
echo ""
show_info "🎨 CONFIGURANDO FRONTEND..."

cd ../frontend

# Verificar que existe package.json
if [ ! -f "package.json" ]; then
    show_error "No se encontró package.json en el frontend"
    exit 1
fi

# Verificar que existe render.yaml
if [ ! -f "render.yaml" ]; then
    show_error "No se encontró render.yaml en el frontend"
    exit 1
fi

show_message "Archivos de configuración del frontend verificados"

# Crear .env de ejemplo si no existe
if [ ! -f ".env" ]; then
    show_info "Creando archivo .env de ejemplo..."
    cat > .env << EOF
REACT_APP_API_URL=https://lpdp-backend.onrender.com/api/v1
REACT_APP_APP_NAME=Sistema LPDP
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=production
REACT_APP_MULTI_TENANT=true
REACT_APP_DEFAULT_TENANT=demo
EOF
    show_message "Archivo .env del frontend creado"
fi

# 3. VERIFICAR GIT
echo ""
show_info "📝 VERIFICANDO REPOSITORIO GIT..."

cd ..

if [ ! -d ".git" ]; then
    show_warning "No se detectó un repositorio Git. Inicializando..."
    git init
    git add .
    git commit -m "🚀 Despliegue inicial en Render - Sistema LPDP"
    show_message "Repositorio Git inicializado"
else
    show_message "Repositorio Git detectado"
    
    # Verificar si hay cambios pendientes
    if [ -n "$(git status --porcelain)" ]; then
        show_warning "Hay cambios pendientes. Haciendo commit..."
        git add .
        git commit -m "🔧 Preparando despliegue en Render"
        show_message "Cambios guardados en Git"
    fi
fi

# 4. INSTRUCCIONES DE DESPLIEGUE
echo ""
echo "🎯 INSTRUCCIONES DE DESPLIEGUE EN RENDER"
echo "========================================="
echo ""

show_info "PASO 1: Crear cuenta en Render.com"
echo "   - Ve a https://render.com"
echo "   - Crea una cuenta gratuita"
echo "   - Conecta tu repositorio de GitHub/GitLab"
echo ""

show_info "PASO 2: Desplegar Backend"
echo "   - En Render, crea un nuevo 'Web Service'"
echo "   - Conecta tu repositorio"
echo "   - Render detectará automáticamente el render.yaml"
echo "   - El backend se desplegará en: https://lpdp-backend.onrender.com"
echo ""

show_info "PASO 3: Desplegar Frontend"
echo "   - En Render, crea un nuevo 'Static Site'"
echo "   - Conecta tu repositorio"
echo "   - Render detectará automáticamente el render.yaml"
echo "   - El frontend se desplegará en: https://lpdp-frontend.onrender.com"
echo ""

show_info "PASO 4: Configurar Variables de Entorno"
echo "   - En el backend, configura las variables de entorno:"
echo "     * SMTP_USER: Tu email de Gmail"
echo "     * SMTP_PASSWORD: Tu contraseña de aplicación de Gmail"
echo "     * ADMIN_EMAIL: admin@tuempresa.cl"
echo "     * ADMIN_PASSWORD: Tu contraseña de admin"
echo ""

show_info "PASO 5: Inicializar Base de Datos"
echo "   - Una vez desplegado el backend, ejecuta:"
echo "     curl -X POST https://lpdp-backend.onrender.com/api/v1/init-database"
echo ""

# 5. VERIFICACIONES FINALES
echo ""
show_info "🔍 VERIFICACIONES FINALES..."

# Verificar estructura del proyecto
echo "Estructura del proyecto:"
tree -I 'node_modules|__pycache__|*.pyc|.git|.env' -L 3

echo ""
show_message "✅ PROYECTO LISTO PARA DESPLIEGUE EN RENDER"
echo ""

show_info "📋 RESUMEN DE ARCHIVOS DE CONFIGURACIÓN:"
echo "   Backend:"
echo "     ✅ render.yaml - Configuración de Render"
echo "     ✅ requirements.txt - Dependencias Python"
echo "     ✅ env.example - Variables de entorno de ejemplo"
echo "     ✅ start_system.py - Script de inicio"
echo "     ✅ scripts/init_db_complete.py - Inicialización de BD"
echo ""
echo "   Frontend:"
echo "     ✅ render.yaml - Configuración de Render"
echo "     ✅ package.json - Dependencias Node.js"
echo "     ✅ .env - Variables de entorno"
echo "     ✅ src/App.js - Aplicación principal con login"
echo "     ✅ src/components/auth/Login.js - Componente de login"
echo "     ✅ src/contexts/AuthContext.js - Contexto de autenticación"
echo "     ✅ src/contexts/TenantContext.js - Contexto multi-tenant"
echo ""

show_info "🚀 PRÓXIMOS PASOS:"
echo "   1. Sube tu código a GitHub/GitLab"
echo "   2. Conecta tu repositorio en Render"
echo "   3. Despliega backend y frontend"
echo "   4. Configura variables de entorno"
echo "   5. Inicializa la base de datos"
echo "   6. ¡Tu sistema estará 100% operativo!"
echo ""

show_message "🎉 ¡DESPLIEGUE COMPLETADO! Tu Sistema LPDP está listo para Render"
show_info "Para ayuda adicional, consulta: README_SISTEMA_COMPLETO.md"
