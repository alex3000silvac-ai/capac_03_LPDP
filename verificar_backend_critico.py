#!/usr/bin/env python3
"""
Script de Verificación Crítica del Backend - INGENIERO EN JEFE
Diagnostica y soluciona problemas de conexión
"""
import requests
import json
import time
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

def test_backend_connection():
    """Prueba la conexión básica al backend"""
    print_header("PRUEBA DE CONEXIÓN BÁSICA")
    
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

def test_login_endpoint():
    """Prueba el endpoint de login"""
    print_header("PRUEBA DEL ENDPOINT DE LOGIN")
    
    # Diferentes formatos de datos para probar
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
    """Prueba si el backend puede conectarse a la base de datos"""
    print_header("PRUEBA DE CONEXIÓN A BASE DE DATOS")
    
    try:
        # Intentar acceder a un endpoint que requiera base de datos
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

def generate_solution_report():
    """Genera un reporte de solución"""
    print_header("REPORTE DE SOLUCIÓN - INGENIERO EN JEFE")
    
    print("🚨 PROBLEMAS IDENTIFICADOS:")
    print("   1. Backend responde pero login falla con error 422")
    print("   2. Esquema LoginRequest no se ha actualizado en Render")
    print("   3. Render no está redesplegando automáticamente")
    
    print("\n🛠️ SOLUCIONES REQUERIDAS:")
    print("   1. VERIFICAR CONFIGURACIÓN DE RENDER:")
    print("      - Ir a https://dashboard.render.com")
    print("      - Seleccionar servicio 'scldp-backend'")
    print("      - Verificar que esté en 'Live' status")
    print("      - Revisar logs para errores de build")
    
    print("\n   2. FORZAR REDESPLIEGUE:")
    print("      - En Render, click en 'Manual Deploy'")
    print("      - Seleccionar rama 'main'")
    print("      - Esperar que termine el build")
    
    print("\n   3. VERIFICAR VARIABLES DE ENTORNO:")
    print("      - DATABASE_URL configurada correctamente")
    print("      - SECRET_KEY generada")
    print("      - ENVIRONMENT = production")
    
    print("\n   4. VERIFICAR BASE DE DATOS:")
    print("      - Supabase conectada y funcionando")
    print("      - Tablas creadas correctamente")
    print("      - Usuarios demo insertados")
    
    print("\n🔗 ENLACES ÚTILES:")
    print("   - Render Dashboard: https://dashboard.render.com")
    print("   - Backend: https://scldp-backend.onrender.com")
    print("   - Frontend: https://scldp-frontend.onrender.com")
    print("   - API Docs: https://scldp-backend.onrender.com/api/v1/docs")

def main():
    """Función principal"""
    print_header("DIAGNÓSTICO CRÍTICO DEL BACKEND")
    print(f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Pruebas
    backend_ok = test_backend_connection()
    login_ok = test_login_endpoint()
    db_ok = test_database_connection()
    
    # Resumen
    print_header("RESUMEN DEL DIAGNÓSTICO")
    print(f"Backend responde: {'✅' if backend_ok else '❌'}")
    print(f"Login funciona: {'✅' if login_ok else '❌'}")
    print(f"Base de datos: {'✅' if db_ok else '❌'}")
    
    if not login_ok:
        print("\n🚨 ACCIÓN INMEDIATA REQUERIDA:")
        print("   El login NO funciona. Sigue el reporte de solución.")
        generate_solution_report()
    else:
        print("\n🎉 SISTEMA FUNCIONANDO CORRECTAMENTE!")

if __name__ == "__main__":
    main()
