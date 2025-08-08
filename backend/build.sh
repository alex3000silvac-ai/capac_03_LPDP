#!/usr/bin/env bash
# Script de build para Render
set -o errexit

# Actualizar pip
pip install --upgrade pip

# Instalar wheel para evitar problemas de compilación
pip install wheel

# Instalar numpy primero (dependencia de pandas)
pip install numpy==1.24.3

# Instalar el resto de dependencias
pip install -r requirements.txt