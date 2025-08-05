#!/bin/bash

echo "====================================="
echo "Sistema de Capacitación y Levantamiento"
echo "de Datos Personales (SCLDP)"
echo "====================================="

# Verificar si existe .env, si no, copiar del ejemplo
if [ ! -f .env ]; then
    echo "Creando archivo .env desde .env.example..."
    cp .env.example .env
    echo "Por favor, edita el archivo .env con tus configuraciones antes de continuar."
    echo "Presiona Enter cuando hayas terminado..."
    read
fi

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "Docker no está instalado. Por favor, instala Docker primero."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose no está instalado. Por favor, instala Docker Compose primero."
    exit 1
fi

echo "Construyendo contenedores..."
docker-compose build

echo "Iniciando servicios..."
docker-compose up -d

echo "Esperando a que la base de datos esté lista..."
sleep 10

echo "====================================="
echo "Sistema iniciado exitosamente!"
echo ""
echo "Accede al sistema en:"
echo "- Frontend: http://localhost"
echo "- API Docs: http://localhost/api/v1/docs"
echo ""
echo "Para ver los logs:"
echo "docker-compose logs -f"
echo ""
echo "Para detener el sistema:"
echo "docker-compose down"
echo "====================================="