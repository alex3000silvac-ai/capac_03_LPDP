#!/bin/bash

echo "🔍 VERIFICACIÓN DE DESPLIEGUE"
echo "=================================="

# Función para probar endpoint
test_endpoint() {
    echo ""
    echo "=== Probando $1 ==="
    response=$(curl -L -s -w "\n---\nHTTP_CODE:%{http_code}\nCONTENT_TYPE:%{content_type}" https://scldp-backend.onrender.com$1 2>&1)
    echo "$response"
    echo -e "\n"
}

# Probar cada endpoint
test_endpoint "/"
test_endpoint "/health"
test_endpoint "/api/v1/test"

# Probar login específicamente
echo "=== Probando Login ==="
curl -X POST https://scldp-backend.onrender.com/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"Admin123!"}' \
     -s -w "\nHTTP_CODE:%{http_code}\n"

echo -e "\n"
echo "✅ Verificación completada"
echo "👤 Credenciales: admin/Admin123!, demo/Demo123!, dpo/Dpo123!"