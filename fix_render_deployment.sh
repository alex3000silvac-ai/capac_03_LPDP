#!/bin/bash

echo "🚀 ARREGLO URGENTE - BACKEND ULTRA SIMPLE"
echo "================================================"

# 1. Backup del main.py actual
echo "📋 1. Backup del main.py actual..."
cp main.py main_backup_$(date +%Y%m%d_%H%M%S).py

# 2. Copiar la versión ultra simple
echo "📦 2. Actualizando con versión ultra simple..."
cp backend/main_ultra_simple.py main.py

# 3. Verificar requirements mínimos
echo "📋 3. Creando requirements.txt mínimo..."
cat > requirements.txt << EOF
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
python-multipart==0.0.6
EOF

echo "✅ Archivos actualizados para Render:"
echo "   - main.py (versión ultra simple)"
echo "   - requirements.txt (dependencias mínimas)"
echo ""
echo "🔄 Ejecutando git commands..."

# 4. Git commands
git add main.py requirements.txt
git commit -m "fix: actualizar backend a versión ultra simple sin dependencias complejas"
git push

echo ""
echo "✅ ¡Deployment iniciado!"
echo "🕐 Espera 2-3 minutos y prueba el login en:"
echo "   https://scldp-frontend.onrender.com/login"
echo ""
echo "👤 Credenciales de prueba:"
echo "   admin / Admin123!"
echo "   demo / Demo123!"
echo "   dpo / Dpo123!"