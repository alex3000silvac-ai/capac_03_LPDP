#!/bin/bash

# Script para verificar que el despliegue fue exitoso

echo "🔍 Verificando despliegue de SCLDP..."
echo "=================================="

# URLs de los servicios
BACKEND_URL="https://scldp-backend.onrender.com"
FRONTEND_URL="https://scldp-frontend.onrender.com"

# Verificar Backend
echo -n "✓ Verificando Backend API... "
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/v1/health" 2>/dev/null)
if [ "$BACKEND_STATUS" = "200" ]; then
    echo "✅ Funcionando correctamente"
else
    echo "❌ Error (Status: $BACKEND_STATUS)"
fi

# Verificar Frontend
echo -n "✓ Verificando Frontend... "
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>/dev/null)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Funcionando correctamente"
else
    echo "❌ Error (Status: $FRONTEND_STATUS)"
fi

echo "=================================="
echo "📝 Resumen:"
echo "- Backend: $BACKEND_URL"
echo "- Frontend: $FRONTEND_URL"
echo ""
echo "Si ambos servicios muestran ✅, ¡tu aplicación está lista!"
echo "Abre $FRONTEND_URL en tu navegador para verla en acción."