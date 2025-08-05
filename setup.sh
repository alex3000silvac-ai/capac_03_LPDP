#!/bin/bash

echo "🚀 Configuración inicial del proyecto SCLDP"
echo "=========================================="

# Verificar si existe .env
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env desde .env.example..."
    cp .env.example .env
    echo "⚠️  Por favor, edita el archivo .env con tus credenciales"
    echo ""
fi

# Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
cd backend
python -m venv venv
source venv/bin/activate || . venv/Scripts/activate
pip install -r requirements.txt
cd ..

# Instalar dependencias del frontend
echo "📦 Instalando dependencias del frontend..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Edita el archivo .env con tus credenciales de Supabase"
echo "2. Ejecuta el script SQL en Supabase: database/supabase_init.sql"
echo "3. Para desarrollo local: docker-compose up"
echo "4. Para producción: sigue las instrucciones en README_DEPLOY.md"
echo ""
echo "🔗 Enlaces útiles:"
echo "- Supabase: https://supabase.com"
echo "- Railway: https://railway.app"
echo "- Documentación: README_DEPLOY.md"