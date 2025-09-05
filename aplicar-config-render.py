#!/usr/bin/env python3

"""
🔧 APLICAR CONFIGURACIÓN RENDER - AUTOMÁTICO
Actualizar variables de entorno en Render para solucionar HTTP 500
"""

import requests
import os
import json
import time
from typing import Dict, List

class RenderConfigManager:
    def __init__(self):
        # Service ID del backend (extraído del dashboard)
        self.service_id = "srv-d2b6krjuibrs73fauhr0"
        self.base_url = "https://api.render.com/v1"
        
        # Variables de entorno requeridas (desde .env del backend)
        self.required_env_vars = {
            "DATABASE_URL": "postgresql://postgres.symkjkbejxexgrydmvqs:tjdLFmHpEIeyShEK@aws-0-us-east-1.pooler.supabase.com:5432/postgres",
            "SECRET_KEY": "tu_clave_secreta_muy_larga_y_segura_aqui_cambiala_en_produccion_v3_2024",
            "ENVIRONMENT": "production",
            "DEBUG": "false",
            "ALLOWED_ORIGINS": "https://scldp-frontend.onrender.com,http://localhost:3000,https://scldp-backend.onrender.com",
            "ALGORITHM": "HS256",
            "ACCESS_TOKEN_EXPIRE_MINUTES": "30",
            "PROJECT_NAME": "Sistema LPDP",
            "VERSION": "3.0.0",
            "LOG_LEVEL": "INFO"
        }

    def update_env_vars_via_file(self):
        """
        Actualizar variables de entorno usando archivo de configuración
        """
        print("🔧 Creando archivo de configuración de variables de entorno...")
        
        # Crear archivo .env para el deploy
        env_content = []
        for key, value in self.required_env_vars.items():
            env_content.append(f"{key}={value}")
        
        # Escribir al backend/.env
        backend_env_path = "./backend/.env"
        with open(backend_env_path, 'w') as f:
            f.write('\n'.join(env_content))
            f.write('\n')
        
        print(f"✅ Archivo {backend_env_path} actualizado")
        
        # También crear archivo .env.production
        prod_env_path = "./backend/.env.production"
        with open(prod_env_path, 'w') as f:
            f.write('\n'.join(env_content))
            f.write('\n')
        
        print(f"✅ Archivo {prod_env_path} creado")
        
        return True

    def check_backend_health(self) -> bool:
        """
        Verificar el health del backend
        """
        try:
            print("🔍 Verificando estado del backend...")
            
            response = requests.get("https://scldp-backend.onrender.com/health", timeout=10)
            
            if response.status_code == 200:
                print("✅ Backend responde correctamente")
                return True
            else:
                print(f"❌ Backend error HTTP {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Error conectando al backend: {e}")
            return False

    def test_api_endpoints(self) -> Dict[str, int]:
        """
        Probar endpoints críticos del API
        """
        endpoints = {
            "/health": "https://scldp-backend.onrender.com/health",
            "/api/auth/login": "https://scldp-backend.onrender.com/api/auth/login",
            "/api/organizaciones": "https://scldp-backend.onrender.com/api/organizaciones"
        }
        
        results = {}
        
        print("🧪 Probando endpoints críticos...")
        
        for endpoint, url in endpoints.items():
            try:
                if endpoint == "/api/auth/login":
                    # POST request para login
                    data = {
                        "email": "admin@empresa.cl",
                        "password": "Padmin123!"
                    }
                    response = requests.post(url, json=data, timeout=10)
                else:
                    # GET request para otros endpoints
                    response = requests.get(url, timeout=10)
                
                results[endpoint] = response.status_code
                
                if response.status_code < 400:
                    print(f"  ✅ {endpoint}: HTTP {response.status_code}")
                else:
                    print(f"  ❌ {endpoint}: HTTP {response.status_code}")
                    
            except Exception as e:
                results[endpoint] = 0
                print(f"  💥 {endpoint}: Error - {e}")
        
        return results

    def run_configuration_update(self):
        """
        Ejecutar actualización completa de configuración
        """
        print("🎯 INICIANDO ACTUALIZACIÓN CONFIGURACIÓN RENDER")
        print("=" * 50)
        
        # 1. Actualizar archivos .env
        self.update_env_vars_via_file()
        
        # 2. Probar estado actual
        print("\n🔍 ESTADO ACTUAL DEL SISTEMA:")
        test_results_before = self.test_api_endpoints()
        
        # 3. Mensaje de instrucciones manuales
        print("\n⚠️  PASOS MANUALES REQUERIDOS:")
        print("1. Hacer git commit y push de los archivos .env actualizados")
        print("2. En Render Dashboard, hacer redeploy manual del backend")
        print("3. Esperar 2-3 minutos para que se apliquen los cambios")
        
        return test_results_before

    def monitor_deployment(self, max_wait_minutes=10):
        """
        Monitorear el deployment hasta que funcione
        """
        print(f"\n⏱️  MONITOREANDO DEPLOYMENT (max {max_wait_minutes} minutos)...")
        
        start_time = time.time()
        max_wait_seconds = max_wait_minutes * 60
        
        while time.time() - start_time < max_wait_seconds:
            try:
                # Probar health endpoint
                response = requests.get("https://scldp-backend.onrender.com/health", timeout=5)
                
                if response.status_code == 200:
                    print("✅ DEPLOYMENT EXITOSO - Backend funcionando")
                    
                    # Probar login endpoint
                    login_data = {
                        "email": "admin@empresa.cl", 
                        "password": "Padmin123!"
                    }
                    
                    login_response = requests.post(
                        "https://scldp-backend.onrender.com/api/auth/login",
                        json=login_data,
                        timeout=5
                    )
                    
                    if login_response.status_code in [200, 201]:
                        print("✅ LOGIN FUNCIONAL - Sistema completamente operativo")
                        return True
                    else:
                        print(f"⚠️ Health OK pero login falla: HTTP {login_response.status_code}")
                
                else:
                    elapsed = int(time.time() - start_time)
                    print(f"⏳ Esperando... ({elapsed}s) - HTTP {response.status_code}")
                    
            except Exception as e:
                elapsed = int(time.time() - start_time)
                print(f"⏳ Esperando... ({elapsed}s) - {str(e)[:50]}")
            
            time.sleep(30)  # Esperar 30 segundos entre checks
        
        print("❌ TIMEOUT - Deployment no completado en tiempo esperado")
        return False

def main():
    """
    Función principal
    """
    config_manager = RenderConfigManager()
    
    # Actualizar configuración
    results_before = config_manager.run_configuration_update()
    
    print("\n" + "=" * 50)
    print("🎯 RESUMEN DE CONFIGURACIÓN")
    print("=" * 50)
    print("✅ Archivos .env actualizados")
    print("⚠️  Redeploy manual requerido en Render Dashboard")
    print("🔍 Estado actual APIs:")
    
    for endpoint, status in results_before.items():
        if status == 200:
            print(f"   ✅ {endpoint}: HTTP {status}")
        elif status == 0:
            print(f"   💥 {endpoint}: Error conexión")
        else:
            print(f"   ❌ {endpoint}: HTTP {status}")
    
    print("\n📋 PRÓXIMOS PASOS:")
    print("1. git add . && git commit -m 'Config env vars for Render'")
    print("2. git push origin main")
    print("3. Redeploy backend en Render Dashboard")
    print("4. Ejecutar: python3 aplicar-config-render.py monitor")
    
    return len([s for s in results_before.values() if s >= 200 and s < 400]) == len(results_before)

def monitor_only():
    """
    Solo monitorear el deployment
    """
    config_manager = RenderConfigManager()
    success = config_manager.monitor_deployment(max_wait_minutes=15)
    
    if success:
        print("\n🎉 CONFIGURACIÓN COMPLETADA EXITOSAMENTE")
        print("🚀 Sistema listo para ejecutar agentes de prueba")
        return True
    else:
        print("\n❌ CONFIGURACIÓN FALLÓ")
        print("🔧 Revisar logs de Render Dashboard")
        return False

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "monitor":
        success = monitor_only()
    else:
        success = main()
    
    sys.exit(0 if success else 1)