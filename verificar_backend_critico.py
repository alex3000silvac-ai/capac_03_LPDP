#!/usr/bin/env python3
"""
Verificación Completa del Sistema LPDP - INGENIERO EN JEFE
Diagnóstico exhaustivo de frontend, backend y base de datos
"""
import requests
import json
from datetime import datetime
import os

def print_header(title):
    """Imprime un header formateado"""
    print(f"\n{'='*70}")
    print(f"🔍 {title}")
    print(f"{'='*70}")

def print_success(message):
    """Imprime mensaje de éxito"""
    print(f"✅ {message}")

def print_error(message):
    """Imprime mensaje de error"""
    print(f"❌ {message}")

def print_warning(message):
    """Imprime mensaje de advertencia"""
    print(f"⚠️  {message}")

def test_backend_status():
    """Prueba el estado básico del backend"""
    print_header("ESTADO DEL BACKEND")
    
    try:
        backend_url = os.getenv("BACKEND_URL", "https://scldp-backend.onrender.com")
        response = requests.get(f"{backend_url}/", timeout=10)
        if response.status_code == 200:
            print_success(f"Backend responde: {response.status_code}")
            data = response.json()
            print(f"   Nombre: {data.get('name', 'N/A')}")
            print(f"   Versión: {data.get('version', 'N/A')}")
            print(f"   Estado: {data.get('status', 'N/A')}")
            return True
        else:
            print_error(f"Backend error: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error de conexión: {e}")
        return False

def test_login_schema():
    """Prueba el esquema del endpoint de login"""
    print_header("PRUEBA DEL ESQUEMA DE LOGIN")
    
    backend_url = os.getenv("BACKEND_URL", "https://scldp-backend.onrender.com")
    
    # Diferentes esquemas para probar
    test_cases = [
        {"username": "admin", "password": "Admin123!"},
        {"username": "admin", "password": "Admin123!", "tenant_id": "demo"}
    ]
    
    for i, test_data in enumerate(test_cases, 1):
        print(f"\n🧪 Prueba {i}: {test_data}")
        
        try:
            response = requests.post(
                f"{backend_url}/api/v1/auth/login",
                json=test_data,
                timeout=15,
                headers={"Content-Type": "application/json"}
            )
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                print_success("ESQUEMA DE LOGIN CORRECTO!")
                data = response.json()
                print(f"   Token recibido: {data.get('access_token', 'N/A')[:20]}...")
                return True
            elif response.status_code == 422:
                print_error("Error 422 - Esquema inválido")
                try:
                    error_data = response.json()
                    print(f"   Error detallado: {error_data}")
                except:
                    print(f"   Error: {response.text}")
            elif response.status_code == 401:
                print_warning("Error 401 - Credenciales incorrectas")
            else:
                print_error(f"Error {response.status_code}")
                print(f"   Respuesta: {response.text}")
                
        except Exception as e:
            print_error(f"Error en la petición: {e}")
    
    return False

def test_database_connection():
    """Prueba si el backend puede conectarse a la base de datos"""
    print_header("PRUEBA DE CONEXIÓN A BASE DE DATOS")
    
    try:
        backend_url = os.
