#!/bin/bash

echo "🔍 VERIFICACIÓN BACKEND PROFESIONAL v2.0.0"
echo "=============================================="

# URLs
BACKEND_URL="https://scldp-backend.onrender.com"

# Función para probar endpoint con colores
test_endpoint() {
    local endpoint=$1
    local expected_version=$2
    
    echo ""
    echo "=== Probando $endpoint ==="
    
    response=$(curl -s "$BACKEND_URL$endpoint" 2>&1)
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL$endpoint" 2>/dev/null)
    
    echo "HTTP Code: $http_code"
    echo "Response: $response"
    
    # Verificar si contiene la versión esperada
    if [[ "$response" == *"$expected_version"* ]]; then
        echo "✅ CORRECTO: Versión $expected_version detectada"
    else
        echo "❌ ERROR: No se detectó versión $expected_version"
        if [[ "$response" == *"1.0.0"* ]]; then
            echo "⚠️  ADVERTENCIA: Todavía usa versión antigua 1.0.0"
        fi
    fi
    
    echo "---"
}

# Función para probar login
test_login() {
    local username=$1
    local password=$2
    
    echo ""
    echo "=== Probando Login: $username ==="
    
    response=$(curl -X POST "$BACKEND_URL/api/v1/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$username\",\"password\":\"$password\"}" \
        -s -w "\nHTTP_CODE:%{http_code}" 2>&1)
    
    echo "$response"
    
    if [[ "$response" == *"access_token"* ]]; then
        echo "✅ LOGIN EXITOSO para $username"
    elif [[ "$response" == *"401"* ]]; then
        echo "❌ LOGIN FALLIDO para $username (401 Unauthorized)"
    elif [[ "$response" == *"500"* ]]; then
        echo "❌ ERROR DEL SERVIDOR para $username (500 Internal Error)"
    else
        echo "⚠️  RESPUESTA INESPERADA para $username"
    fi
    
    echo "---"
}

# VERIFICACIONES PRINCIPALES
echo "🚀 Iniciando verificación completa..."

# 1. Endpoint raíz
test_endpoint "/" "2.0.0"

# 2. Health check
test_endpoint "/health" "2.0.0"

# 3. Test endpoint
test_endpoint "/api/v1/test" "2.0.0"

# 4. Probar logins
test_login "admin" "secret123"
test_login "demo" "hello"
test_login "dpo" "mypass"

# 5. Resumen final
echo ""
echo "📊 RESUMEN DE VERIFICACIÓN"
echo "========================="

# Verificar versión una vez más
version_check=$(curl -s "$BACKEND_URL/" | grep -o '"version":"[^"]*"' | cut -d'"' -f4)

if [[ "$version_check" == "2.0.0" ]]; then
    echo "✅ ÉXITO: Backend profesional v2.0.0 desplegado correctamente"
    echo "✅ Sistema listo para producción"
elif [[ "$version_check" == "1.0.0" ]]; then
    echo "❌ PROBLEMA: Todavía usa versión antigua v1.0.0"
    echo "📋 SOLUCIÓN:"
    echo "   1. Verificar que git push se realizó correctamente"
    echo "   2. Configurar variables de entorno en Render Dashboard"
    echo "   3. Hacer manual deploy en Render"
else
    echo "⚠️  ADVERTENCIA: No se pudo determinar la versión"
    echo "📋 VERIFICAR: Conectividad y configuración de Render"
fi

echo ""
echo "📋 CREDENCIALES DE ACCESO:"
echo "   admin   / secret123  (Administrador)"
echo "   demo    / hello      (Usuario Demo)"
echo "   dpo     / mypass     (Data Protection Officer)"
echo ""
echo "🔗 URLs IMPORTANTES:"
echo "   Backend: $BACKEND_URL"
echo "   Frontend: https://scldp-frontend.onrender.com"
echo "   Docs: $BACKEND_URL/docs (si DEBUG=true)"