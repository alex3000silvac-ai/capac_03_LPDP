#!/bin/bash

# 🚀 SCRIPT SETUP BACKEND COMPLETO - JURÍDICA DIGITAL LPDP
# Automatiza toda la instalación y configuración del backend

set -e

echo "🚀 =============================================="
echo "🌐 SETUP BACKEND JURÍDICA DIGITAL LPDP"
echo "🚀 =============================================="
echo ""

# Verificar requisitos
echo "🔍 Verificando requisitos..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Instalar Node.js >= 18.0.0"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d 'v' -f 2)
echo "✅ Node.js versión: $NODE_VERSION"

# Crear directorio backend si no existe
mkdir -p backend/routes
mkdir -p backend/services
mkdir -p backend/logs
mkdir -p backend/uploads

echo "📁 Estructura de directorios creada"

# Ir al directorio backend
cd backend

# Verificar si existe package.json
if [ ! -f package.json ]; then
    echo "❌ package.json no encontrado en backend/"
    echo "📋 Ejecutar este script desde la raíz del proyecto"
    exit 1
fi

# Instalar dependencias
echo "📦 Instalando dependencias del backend..."
npm install

# Verificar si el archivo .env existe
if [ ! -f .env ]; then
    echo "⚙️ Creando archivo .env..."
    cat > .env << EOF
# 🌐 CONFIGURACIÓN BACKEND JURÍDICA DIGITAL LPDP
PORT=3001
NODE_ENV=production

# 🗄️ SUPABASE
SUPABASE_URL=https://symkjkbejxexgrydmvqs.supabase.co
SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY_AQUI

# 🔐 SEGURIDAD
WEBHOOK_SECRET=juridica-digital-webhook-secret-$(openssl rand -hex 16)
JWT_SECRET=$(openssl rand -hex 32)

# 📊 LOGS
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# 🌐 CORS
ALLOWED_ORIGINS=http://localhost:3000,https://scldp-frontend.onrender.com,https://juridica-digital.cl

# 📧 EMAIL (Opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# 🔔 WEBHOOKS
WEBHOOK_TIMEOUT=30000
MAX_WEBHOOK_RETRIES=3
EOF
    echo "✅ Archivo .env creado. IMPORTANTE: Configurar SUPABASE_SERVICE_ROLE_KEY"
else
    echo "✅ Archivo .env ya existe"
fi

# Verificar estructura de archivos
echo "📋 Verificando estructura de archivos..."

REQUIRED_FILES=(
    "server.js"
    "services/partnerAPIService.js"
    "services/exportService.js"
    "routes/partnerRoutes.js"
    "README.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - FALTA"
        echo "📋 Copiar archivos del repositorio"
    fi
done

# Crear script de desarrollo
echo "📝 Creando scripts de desarrollo..."

cat > dev.sh << 'EOF'
#!/bin/bash
echo "🔥 Iniciando servidor en modo desarrollo..."
echo "🌐 URL: http://localhost:3001"
echo "📊 Health: http://localhost:3001/health"
echo "🔗 Partners: http://localhost:3001/api/v1/partners/health"
echo ""
npm run dev
EOF

chmod +x dev.sh

# Crear script de testing
cat > test.sh << 'EOF'
#!/bin/bash
echo "🧪 Ejecutando tests del backend..."
npm run lint
npm test
echo "✅ Tests completados"
EOF

chmod +x test.sh

# Crear script de deploy
cat > deploy.sh << 'EOF'
#!/bin/bash
echo "🚀 Preparando deploy..."
npm run lint
npm test
echo "✅ Backend listo para deploy"
EOF

chmod +x deploy.sh

# Verificar conexión a Supabase (si está configurado)
echo "🔍 Verificando configuración..."

if grep -q "TU_SERVICE_ROLE_KEY_AQUI" .env; then
    echo "⚠️  PENDIENTE: Configurar SUPABASE_SERVICE_ROLE_KEY en .env"
    echo "   1. Ir a: https://supabase.com/dashboard/project/symkjkbejxexgrydmvqs/settings/api"
    echo "   2. Copiar 'service_role' key"
    echo "   3. Reemplazar en .env"
else
    echo "✅ Variables de entorno configuradas"
fi

echo ""
echo "🗄️ Verificando estructura de base de datos..."
if [ -f "../CREATE_PARTNER_INTEGRATIONS_TABLE.sql" ]; then
    echo "✅ SQL de partner_integrations disponible"
else
    echo "❌ Archivo SQL de creación de tablas no encontrado"
fi

if [ -f "../CREATE_ADDITIONAL_BACKEND_TABLES.sql" ]; then
    echo "✅ SQL de tablas adicionales disponible"
else
    echo "❌ Archivo SQL de tablas adicionales no encontrado"
fi

# Test rápido del servidor
echo ""
echo "🧪 Test rápido del servidor..."
if node -e "
const app = require('./server.js');
console.log('✅ Servidor carga correctamente');
process.exit(0);
" 2>/dev/null; then
    echo "✅ Servidor se inicia correctamente"
else
    echo "❌ Error al iniciar servidor - verificar dependencias"
fi

# Resumen final
echo ""
echo "🎉 =============================================="
echo "✅ SETUP BACKEND COMPLETADO"
echo "🎉 =============================================="
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo ""
echo "1. 🔧 Configurar SUPABASE_SERVICE_ROLE_KEY en .env"
echo ""
echo "2. 🗄️ Ejecutar SQLs en Supabase:"
echo "   - CREATE_PARTNER_INTEGRATIONS_TABLE.sql"
echo "   - CREATE_ADDITIONAL_BACKEND_TABLES.sql"
echo ""
echo "3. 🚀 Iniciar servidor:"
echo "   ./dev.sh              # Desarrollo"
echo "   npm start             # Producción"
echo ""
echo "4. ✅ Verificar endpoints:"
echo "   http://localhost:3001/health"
echo "   http://localhost:3001/api/v1/partners/health"
echo ""
echo "5. 🧪 Ejecutar tests:"
echo "   ./test.sh"
echo ""
echo "📖 Documentación completa: backend/README.md"
echo ""
echo "🎯 ¡Backend listo para integraciones de producción!"
echo "🚀 =============================================="