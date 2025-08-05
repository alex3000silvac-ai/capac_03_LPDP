#!/bin/bash

echo "====================================="
echo "🎓 Sistema de Capacitación LPDP"
echo "====================================="
echo ""
echo "Este es un sistema educativo para aprender sobre"
echo "la Ley de Protección de Datos Personales 21.719"
echo ""

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor, instala Docker primero."
    echo "   Visita: https://docs.docker.com/get-docker/"
    exit 1
fi

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose no está instalado."
    exit 1
fi

# Función para ejecutar docker-compose
run_docker_compose() {
    if command -v docker-compose &> /dev/null; then
        docker-compose "$@"
    else
        docker compose "$@"
    fi
}

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env desde plantilla..."
    cp .env.example .env
fi

echo ""
echo "🚀 Iniciando el sistema de capacitación..."
echo ""

# Construir las imágenes
echo "🔨 Construyendo contenedores (esto puede tomar unos minutos)..."
run_docker_compose build

echo ""
echo "🏃 Iniciando servicios..."
run_docker_compose up -d

echo ""
echo "⏳ Esperando a que los servicios estén listos..."
sleep 15

# Verificar estado
echo ""
echo "🔍 Verificando estado de los servicios..."
run_docker_compose ps

echo ""
echo "====================================="
echo "✅ ¡Sistema iniciado exitosamente!"
echo "====================================="
echo ""
echo "🌐 Accede al sistema en:"
echo ""
echo "   📚 Plataforma de Capacitación: http://localhost"
echo "   📖 API Docs: http://localhost/api/v1/docs"
echo ""
echo "👤 Usuario de prueba:"
echo "   Email: demo@scldp.cl"
echo "   Contraseña: Demo1234"
echo ""
echo "📋 Comandos útiles:"
echo "   Ver logs:         ./start-demo.sh logs"
echo "   Detener sistema:  ./start-demo.sh stop"
echo "   Reiniciar:        ./start-demo.sh restart"
echo ""
echo "💡 Tip: Todo en este sistema es educativo."
echo "   Los datos son ficticios y puedes experimentar libremente."
echo ""

# Manejar argumentos
if [ "$1" = "logs" ]; then
    run_docker_compose logs -f
elif [ "$1" = "stop" ]; then
    echo "Deteniendo el sistema..."
    run_docker_compose down
elif [ "$1" = "restart" ]; then
    echo "Reiniciando el sistema..."
    run_docker_compose restart
fi