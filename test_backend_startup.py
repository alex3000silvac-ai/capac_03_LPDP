#!/usr/bin/env python3
"""
🚀 TEST BACKEND STARTUP - Verificación de arranque
Verifica que el backend puede inicializarse sin errores críticos
"""

import sys
import os
import traceback

def test_backend_startup():
    """Test arranque básico del backend"""
    
    print("🚀 TESTING ARRANQUE BACKEND LPDP")
    print("=" * 50)
    
    try:
        # Agregar path del backend
        backend_path = os.path.join(os.getcwd(), "backend")
        if backend_path not in sys.path:
            sys.path.insert(0, backend_path)
        
        print("📁 Path agregado:", backend_path)
        
        # Test 1: Importar configuración principal
        print("\n🔧 Test 1: Configuración principal...")
        try:
            # Simular variables de entorno mínimas
            os.environ.setdefault("DATABASE_URL", "postgresql://test:test@localhost/test")
            os.environ.setdefault("SECRET_KEY", "test-secret-key")
            os.environ.setdefault("ENVIRONMENT", "test")
            
            print("✅ Variables entorno configuradas")
        except Exception as e:
            print(f"❌ Error configuración: {e}")
            return False
        
        # Test 2: Importar main app
        print("\n🏗️ Test 2: Importación main app...")
        try:
            from app.main import app
            print("✅ FastAPI app importada correctamente")
        except Exception as e:
            print(f"❌ Error importando app: {e}")
            print("🔍 Traceback:")
            traceback.print_exc()
            return False
        
        # Test 3: Verificar rutas principales
        print("\n🛣️ Test 3: Verificación rutas...")
        try:
            routes = app.routes
            print(f"✅ Total rutas: {len(routes)}")
            
            # Contar rutas por prefijo
            api_routes = [r for r in routes if hasattr(r, 'path') and r.path.startswith('/api/v1')]
            print(f"✅ Rutas API v1: {len(api_routes)}")
            
        except Exception as e:
            print(f"❌ Error verificando rutas: {e}")
            return False
        
        # Test 4: Verificar endpoints críticos
        print("\n🎯 Test 4: Endpoints críticos...")
        try:
            critical_endpoints = [
                "/health",
                "/api/health", 
                "/",
                "/api/v1"
            ]
            
            for endpoint in critical_endpoints:
                found = any(hasattr(r, 'path') and r.path == endpoint for r in routes)
                if found:
                    print(f"✅ {endpoint}: OK")
                else:
                    print(f"⚠️ {endpoint}: No encontrado")
            
        except Exception as e:
            print(f"❌ Error verificando endpoints: {e}")
            return False
        
        # Test 5: Test OpenAPI schema
        print("\n📋 Test 5: OpenAPI schema...")
        try:
            openapi_schema = app.openapi()
            paths_count = len(openapi_schema.get("paths", {}))
            print(f"✅ OpenAPI schema generado: {paths_count} paths")
        except Exception as e:
            print(f"❌ Error OpenAPI: {e}")
            return False
        
        print("\n" + "=" * 50)
        print("🎯 RESULTADO: BACKEND STARTUP EXITOSO")
        print("✅ FastAPI app funcional")
        print(f"✅ {len(routes)} rutas total")
        print(f"✅ {len(api_routes)} endpoints API")
        print("✅ Ready para deployment")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR CRÍTICO: {e}")
        print("🔍 Traceback completo:")
        traceback.print_exc()
        return False


def test_api_endpoints_count():
    """Contar endpoints por módulo"""
    
    print("\n📊 CONTEO ENDPOINTS POR MÓDULO:")
    print("-" * 40)
    
    try:
        from app.api.v1.api import api_router
        
        # Intentar obtener información de rutas
        if hasattr(api_router, 'routes'):
            routes = api_router.routes
            print(f"📡 Total rutas API v1: {len(routes)}")
            
            # Agrupar por tags
            by_tags = {}
            for route in routes:
                if hasattr(route, 'tags') and route.tags:
                    for tag in route.tags:
                        by_tags[tag] = by_tags.get(tag, 0) + 1
            
            for tag, count in sorted(by_tags.items()):
                print(f"   📋 {tag}: {count} endpoints")
        
    except Exception as e:
        print(f"❌ Error contando endpoints: {e}")


if __name__ == "__main__":
    success = test_backend_startup()
    
    if success:
        test_api_endpoints_count()
    
    sys.exit(0 if success else 1)