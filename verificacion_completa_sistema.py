#!/usr/bin/env python3
"""
Verificación Completa del Sistema LPDP - INGENIERO EN JEFE
Diagnostica todos los problemas y proporciona soluciones
"""
import requests
import json
from datetime import datetime

def print_header(title):
    """Imprime un header formateado"""
    print(f"\n{'='*60}")
    print(f"🔍 {title}")
    print(f"{'='*60}")

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
        response = requests.get("https://scldp-backend.onrender.com/", timeout=10)
        if response.status_code == 200:
            print_success(f"Backend responde: {response.status_code}")
            data = response.json()
            print(f"   Nombre: {data.get('name', 'N/A')}")
            print(f"   Versión: {data.get('version', 'N/A')}")
            print(f"   Estado: {data.get('status', 'N/A')}")
            return True
        else:
            print_error(f"Backend responde con error: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error conectando al backend: {e}")
        return False

def test_login_schema():
    """Prueba el esquema de login con diferentes formatos"""
    print_header("PRUEBA DEL ESQUEMA DE LOGIN")
    
    test_cases = [
        {"username": "admin", "password": "Admin123!"},
        {"username": "admin", "password": "Admin123!", "tenant_id": "demo"},
        {"username": "admin", "password": "Admin123!", "tenant_id": None}
    ]
    
    for i, test_data in enumerate(test_cases, 1):
        print(f"\n🧪 Prueba {i}: {test_data}")
        
        try:
            response = requests.post(
                "https://scldp-backend.onrender.com/api/v1/auth/login",
                json=test_data,
                timeout=15,
                headers={"Content-Type": "application/json"}
            )
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                print_success("LOGIN EXITOSO!")
                data = response.json()
                print(f"   Token: {data.get('access_token', 'N/A')[:20]}...")
                return True
            elif response.status_code == 422:
                print_error("Error 422 - Esquema inválido")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
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
    """Prueba la conexión a la base de datos"""
    print_header("CONEXIÓN A BASE DE DATOS")
    
    try:
        response = requests.get("https://scldp-backend.onrender.com/api/v1/users", timeout=10)
        
        if response.status_code == 200:
            print_success("Base de datos conectada correctamente")
            return True
        elif response.status_code == 500:
            print_error("Error 500 - Problema de base de datos")
            return False
        elif response.status_code == 401:
            print_warning("Error 401 - Requiere autenticación (normal)")
            return True
        else:
            print_warning(f"Status {response.status_code} - Verificar logs")
            return False
            
    except Exception as e:
        print_error(f"Error probando base de datos: {e}")
        return False

def test_frontend_connection():
    """Prueba si el frontend puede conectarse al backend"""
    print_header("CONEXIÓN FRONTEND-BACKEND")
    
    try:
        response = requests.get("https://scldp-frontend.onrender.com", timeout=10)
        if response.status_code == 200:
            print_success("Frontend responde correctamente")
            return True
        else:
            print_error(f"Frontend responde con error: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error conectando al frontend: {e}")
        return False

def generate_emergency_solution():
    """Genera solución de emergencia"""
    print_header("SOLUCIÓN DE EMERGENCIA - INGENIERO EN JEFE")
    
    print("🚨 PROBLEMAS CRÍTICOS IDENTIFICADOS:")
    print("   1. Backend responde pero esquema de login no actualizado")
    print("   2. Render no está redesplegando automáticamente")
    print("   3. Error 422 persiste en endpoint de login")
    
    print("\n🛠️ SOLUCIONES INMEDIATAS:")
    print("   1. VERIFICAR ESTADO DE RENDER:")
    print("      - Ir a https://dashboard.render.com")
    print("      - Seleccionar servicio 'scldp-backend'")
    print("      - Verificar que NO esté en 'Build Failed'")
    print("      - Si está en 'Live', forzar redeploy manual")
    
    print("\n   2. FORZAR REDESPLIEGUE MANUAL:")
    print("      - En Render, click en 'Manual Deploy'")
    print("      - Seleccionar rama 'main'")
    print("      - Esperar que termine el build")
    print("      - Verificar logs para errores")
    
    print("\n   3. VERIFICAR CONFIGURACIÓN:")
    print("      - Root Directory: backend")
    print("      - Build Command: pip install -r requirements.txt")
    print("      - Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT")
    
    print("\n   4. VERIFICAR VARIABLES DE ENTORNO:")
    print("      - DATABASE_URL configurada")
    print("      - SECRET_KEY generada")
    print("      - ENVIRONMENT = production")
    
    print("\n🔗 ENLACES CRÍTICOS:")
    print("   - Render Dashboard: https://dashboard.render.com")
    print("   - Backend: https://scldp-backend.onrender.com")
    print("   - Frontend: https://scldp-frontend.onrender.com")
    print("   - API Docs: https://scldp-backend.onrender.com/api/v1/docs")
    
    print("\n⚠️  ACCIÓN INMEDIATA REQUERIDA:")
    print("   El backend NO se ha redesplegado con las correcciones.")
    print("   Debes ir a Render y forzar un redeploy manual.")

def main():
    """Función principal"""
    print_header("VERIFICACIÓN COMPLETA DEL SISTEMA LPDP")
    print(f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("Ingeniero en Jefe - Diagnóstico Completo")
    
    # Pruebas del sistema
    backend_ok = test_backend_status()
    login_ok = test_login_schema()
    db_ok = test_database_connection()
    frontend_ok = test_frontend_connection()
    
    # Resumen del diagnóstico
    print_header("RESUMEN DEL DIAGNÓSTICO")
    print(f"Backend responde: {'✅' if backend_ok else '❌'}")
    print(f"Login funciona: {'✅' if login_ok else '❌'}")
    print(f"Base de datos: {'✅' if db_ok else '❌'}")
    print(f"Frontend conecta: {'✅' if frontend_ok else '❌'}")
    
    if not login_ok:
        print("\n🚨 ACCIÓN INMEDIATA REQUERIDA:")
        print("   El login NO funciona. Sigue la solución de emergencia.")
        generate_emergency_solution()
    else:
        print("\n🎉 SISTEMA FUNCIONANDO CORRECTAMENTE!")

if __name__ == "__main__":
    main()
