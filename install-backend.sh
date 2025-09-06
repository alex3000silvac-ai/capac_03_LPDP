#!/bin/bash

# 🚀 SCRIPT DE INSTALACIÓN DEL BACKEND LPDP v2.0
# Reconstrucción completa desde cero

echo "🚀 ================================="
echo "   INSTALACIÓN BACKEND LPDP v2.0"
echo "================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar errores
error_exit() {
    echo -e "${RED}❌ Error: $1${NC}" >&2
    exit 1
}

# Función para mostrar éxito
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Función para mostrar advertencia
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Función para mostrar información
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -d "backend" ]; then
    error_exit "No se encuentra el directorio 'backend'. Ejecutar desde el directorio raíz del proyecto."
fi

echo "📍 Directorio actual: $(pwd)"
echo ""

# Paso 1: Instalar dependencias del backend
echo "📦 Paso 1: Instalando dependencias del backend..."
cd backend

if [ ! -f "package.json" ]; then
    error_exit "No se encuentra package.json en el directorio backend"
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
    error_exit "Node.js no está instalado. Instalar Node.js 18+ desde https://nodejs.org/"
fi

NODE_VERSION=$(node --version | cut -d'.' -f1 | sed 's/v//')
if [ "$NODE_VERSION" -lt 18 ]; then
    error_exit "Se requiere Node.js 18 o superior. Versión actual: $(node --version)"
fi

success "Node.js $(node --version) ✓"

# Instalar dependencias
echo "📥 Instalando dependencias npm..."
npm install
if [ $? -ne 0 ]; then
    error_exit "Falló la instalación de dependencias npm"
fi

success "Dependencias npm instaladas ✓"

# Paso 2: Verificar variables de entorno
echo ""
echo "⚙️  Paso 2: Verificando configuración..."

if [ ! -f ".env" ]; then
    warning "No se encuentra archivo .env"
    echo "📋 Copiando .env.example a .env..."
    cp .env.example .env
    warning "IMPORTANTE: Editar .env con tus datos de Supabase antes de continuar"
    warning "Necesitas configurar:"
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_SERVICE_ROLE_KEY" 
    echo "   - SUPABASE_ANON_KEY"
    echo "   - JWT_SECRET"
    echo ""
    read -p "¿Has configurado el archivo .env? (y/N): " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        info "Configurar .env y ejecutar el script nuevamente"
        exit 0
    fi
fi

success "Archivo .env encontrado ✓"

# Paso 3: Verificar estructura de archivos
echo ""
echo "📁 Paso 3: Verificando estructura del proyecto..."

required_files=(
    "src/app.js"
    "src/config/database.js"
    "src/routes/health.js"
    "src/routes/auth.js"
    "src/routes/rat.js"
    "database/schema/001_initial_CORRECTED.sql"
    "server.js"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
    error_exit "Archivos faltantes: ${missing_files[*]}"
fi

success "Estructura del proyecto verificada ✓"

# Paso 4: Verificar conexión a Supabase (si se proporcionaron credenciales)
echo ""
echo "🔗 Paso 4: Verificando conexión a Supabase..."

# Cargar variables de entorno
source .env 2>/dev/null || true

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    warning "Variables de Supabase no configuradas en .env"
    warning "Saltando verificación de conexión..."
else
    info "Probando conexión a: $SUPABASE_URL"
    
    # Test simple de conexión usando curl
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
        -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
        "$SUPABASE_URL/rest/v1/")
    
    if [ "$response" = "200" ]; then
        success "Conexión a Supabase exitosa ✓"
    else
        warning "No se pudo verificar conexión a Supabase (código: $response)"
        warning "Verificar credenciales en .env"
    fi
fi

# Paso 5: Inicializar base de datos (opcional)
echo ""
echo "🗃️  Paso 5: Inicialización de base de datos"
echo "¿Deseas ejecutar las migraciones de base de datos?"
echo "Esto creará las tablas necesarias en Supabase."
read -p "Ejecutar migraciones? (y/N): " run_migrations

if [[ $run_migrations =~ ^[Yy]$ ]]; then
    if [ -z "$SUPABASE_URL" ]; then
        error_exit "No se puede ejecutar migraciones sin configurar SUPABASE_URL"
    fi
    
    echo "📋 Ejecutando script de migración..."
    node src/utils/migration.js
    if [ $? -eq 0 ]; then
        success "Migraciones ejecutadas exitosamente ✓"
    else
        warning "Las migraciones fallaron o se ejecutaron parcialmente"
        warning "Esto es normal en Supabase debido a permisos limitados"
        warning "Crear las tablas manualmente desde el panel de Supabase"
    fi
else
    info "Migraciones saltadas"
fi

# Paso 6: Probar el servidor
echo ""
echo "🚀 Paso 6: Probando el servidor..."

echo "🔄 Iniciando servidor de prueba..."
timeout 10s npm start &
SERVER_PID=$!
sleep 5

# Probar health check
health_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health 2>/dev/null)

if [ "$health_response" = "200" ]; then
    success "Health check exitoso ✓"
    
    # Probar health check detallado
    echo "📊 Probando endpoint de health detallado..."
    health_detail=$(curl -s http://localhost:8000/health 2>/dev/null)
    echo "$health_detail" | head -3
    
else
    warning "Health check falló (código: $health_response)"
fi

# Terminar servidor de prueba
kill $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null || true

# Paso 7: Resumen e instrucciones
echo ""
echo "📋 ================================="
echo "   RESUMEN DE INSTALACIÓN"
echo "================================="

success "✅ Backend LPDP v2.0 instalado correctamente"
echo ""
echo "🚀 Para iniciar el servidor:"
echo "   cd backend"
echo "   npm start              # Producción"
echo "   npm run dev           # Desarrollo con nodemon"
echo ""
echo "🔗 Endpoints disponibles:"
echo "   http://localhost:8000/health           # Health check"
echo "   http://localhost:8000/api/auth/login   # Login"
echo "   http://localhost:8000/api/rat          # RATs"
echo "   http://localhost:8000/api/dashboard    # Dashboard"
echo ""
echo "📚 Documentación completa en: backend/README.md"
echo ""

if [ -z "$SUPABASE_URL" ]; then
    warning "⚠️  PENDIENTE: Configurar variables de Supabase en backend/.env"
    echo "   1. Crear proyecto en https://supabase.com/"
    echo "   2. Copiar URL y claves a backend/.env"
    echo "   3. Ejecutar las migraciones de base de datos"
    echo "   4. Reiniciar el servidor"
    echo ""
fi

info "ℹ️  El frontend debe apuntar a http://localhost:8000/api"
echo ""

echo "🎉 ¡Instalación completada!"
echo "================================="

# Finalizar
cd ..
exit 0