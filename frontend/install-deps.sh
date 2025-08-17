#!/bin/bash

echo "🔧 Instalando dependencias del frontend..."

# Navegar al directorio del frontend
cd frontend

# Limpiar node_modules y package-lock.json si existen
echo "🧹 Limpiando instalaciones previas..."
rm -rf node_modules package-lock.json

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Verificar que jwt-decode esté instalado
echo "🔍 Verificando jwt-decode..."
if npm list jwt-decode > /dev/null 2>&1; then
    echo "✅ jwt-decode instalado correctamente"
else
    echo "❌ Error: jwt-decode no se instaló correctamente"
    exit 1
fi

# Verificar otras dependencias críticas
echo "🔍 Verificando dependencias críticas..."
npm list @mui/material @mui/icons-material react react-dom react-router-dom

echo "✅ Instalación completada exitosamente!"
echo "🚀 Puedes ejecutar 'npm run build' para construir la aplicación"
