#!/bin/bash
# Script para verificar el estado del sistema desplegado

echo "🔍 Verificando Sistema de Capacitación LPDP"
echo "=========================================="

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# URL base (cambiar según tu dominio en Render)
BASE_URL="${1:-https://tu-app.onrender.com}"

echo -e "\n📡 Verificando endpoints..."

# Health check
echo -n "- Health Check: "
if curl -s "${BASE_URL}/health" | grep -q "ok"; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ Error${NC}"
fi

# API Docs
echo -n "- API Docs: "
if curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/docs" | grep -q "200"; then
    echo -e "${GREEN}✓ Disponible${NC}"
else
    echo -e "${RED}✗ No disponible${NC}"
fi

# Auth endpoint
echo -n "- Auth Endpoint: "
if curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/v1/auth/login" | grep -q "405\|422"; then
    echo -e "${GREEN}✓ Activo${NC}"
else
    echo -e "${RED}✗ Error${NC}"
fi

echo -e "\n📊 Información del Sistema:"
echo "- Empresa Demo: demo.juridicadigital.cl"
echo "- Usuario: admin@demo.cl"
echo "- Password: Admin123!@#"
echo "- Módulos activos: MOD-1 a MOD-7"

echo -e "\n🚀 Próximos pasos:"
echo "1. Acceder a ${BASE_URL}/docs"
echo "2. Probar login con credenciales demo"
echo "3. Verificar módulos de capacitación"

echo -e "\n✅ Verificación completada"