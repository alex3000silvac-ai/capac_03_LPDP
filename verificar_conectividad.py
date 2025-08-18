#!/usr/bin/env python3
"""
Script de verificación de conectividad - Sistema LPDP
Verifica que el backend esté funcionando correctamente
"""
import requests
import time
import sys
from datetime import datetime

def verificar_backend():
    """Verifica el estado del backend"""
    url = "https://scldp-backend.onrender.com/"
    
    try:
        print(f"🔍 Verificando backend: {url}")
        print(f"⏰ Hora: {datetime.now().strftime('%H:%M:%S')}")
        
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            print("✅ Backend funcionando correctamente!")
            print(f"📊 Status: {response.status_code}")
            print(f"📝 Contenido: {response.text[:100]}...")
            return True
        else:
            print(f"❌ Backend respondiendo pero con error: {response.status_code}")
            print(f"📝 Contenido: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error de conectividad: {e}")
        return False

def verificar_frontend():
    """Verifica el estado del frontend"""
    url = "https://scldp-frontend.onrender.com/"
    
    try:
        print(f"\n🔍 Verificando frontend: {url}")
        
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            print("✅ Frontend funcionando correctamente!")
            print(f"📊 Status: {response.status_code}")
            return True
        else:
            print(f"❌ Frontend con error: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error de conectividad frontend: {e}")
        return False

def verificar_login():
    """Verifica que el login esté accesible"""
    url = "https://scldp-frontend.onrender.com/login"
    
    try:
        print(f"\n🔍 Verificando página de login: {url}")
        
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            print("✅ Página de login accesible!")
            print(f"📊 Status: {response.status_code}")
            return True
        else:
            print(f"❌ Página de login con error: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error accediendo al login: {e}")
        return False

def main():
    """Función principal"""
    print("🚀 VERIFICACIÓN DE CONECTIVIDAD - SISTEMA LPDP")
    print("=" * 50)
    
    # Verificar backend
    backend_ok = verificar_backend()
    
    # Verificar frontend
    frontend_ok = verificar_frontend()
    
    # Verificar login
    login_ok = verificar_login()
    
    # Resumen
    print("\n" + "=" * 50)
    print("📊 RESUMEN DE VERIFICACIÓN:")
    print(f"🔧 Backend: {'✅ OK' if backend_ok else '❌ ERROR'}")
    print(f"🎨 Frontend: {'✅ OK' if frontend_ok else '❌ ERROR'}")
    print(f"🔐 Login: {'✅ OK' if login_ok else '❌ ERROR'}")
    
    if backend_ok and frontend_ok and login_ok:
        print("\n🎉 ¡SISTEMA COMPLETAMENTE FUNCIONAL!")
        print("🌐 Puedes acceder a: https://scldp-frontend.onrender.com/login")
        print("👤 Usuario: admin")
        print("🔑 Contraseña: Admin123!")
    else:
        print("\n🚨 PROBLEMAS DETECTADOS:")
        if not backend_ok:
            print("❌ Backend no responde - Configurar variables de entorno en Render")
        if not frontend_ok:
            print("❌ Frontend no responde - Verificar despliegue")
        if not login_ok:
            print("❌ Login no accesible - Verificar rutas")
        
        print("\n📋 SIGUE LA GUÍA: RENDER_COMPLETE_SETUP.md")

if __name__ == "__main__":
    main()
