#!/usr/bin/env python3
"""
🧪 TEST ESTRUCTURA APIS - Verificación sin ejecutar
Verifica que las APIs tengan estructura correcta sin instanciar FastAPI
"""

import sys
import os
import ast

def test_api_structure(file_path):
    """Test estructura de archivo API"""
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Parse AST para analizar estructura
        tree = ast.parse(content)
        
        # Contadores
        routers = 0
        endpoints = 0
        imports = 0
        functions = 0
        decorators = 0
        
        for node in ast.walk(tree):
            # Imports
            if isinstance(node, (ast.Import, ast.ImportFrom)):
                imports += 1
            
            # Function definitions
            if isinstance(node, ast.FunctionDef):
                functions += 1
                
                # Check for router decorators (@router.get, @router.post, etc.)
                for decorator in node.decorator_list:
                    if isinstance(decorator, ast.Attribute):
                        if hasattr(decorator.value, 'id') and decorator.value.id == 'router':
                            endpoints += 1
                            decorators += 1
                    elif isinstance(decorator, ast.Call):
                        if isinstance(decorator.func, ast.Attribute):
                            if hasattr(decorator.func.value, 'id') and decorator.func.value.id == 'router':
                                endpoints += 1
                                decorators += 1
            
            # Router assignments
            if isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name) and target.id == 'router':
                        routers += 1
        
        return {
            "status": "OK",
            "file": os.path.basename(file_path),
            "metrics": {
                "imports": imports,
                "routers": routers,
                "endpoints": endpoints,
                "functions": functions,
                "decorators": decorators
            }
        }
        
    except Exception as e:
        return {
            "status": "ERROR",
            "file": os.path.basename(file_path),
            "error": str(e)
        }

def main():
    """Función principal de testing"""
    
    print("🧪 TESTING ESTRUCTURA APIs BACKEND")
    print("=" * 50)
    
    # APIs a probar
    api_files = [
        "backend/app/api/v1/endpoints/rats.py",
        "backend/app/api/v1/endpoints/eipds.py", 
        "backend/app/api/v1/endpoints/providers.py",
        "backend/app/api/v1/endpoints/notifications.py",
        "backend/app/api/v1/endpoints/audit.py",
        "backend/app/api/v1/endpoints/admin.py"
    ]
    
    results = []
    total_endpoints = 0
    
    for api_file in api_files:
        if os.path.exists(api_file):
            result = test_api_structure(api_file)
            results.append(result)
            
            if result["status"] == "OK":
                endpoints = result["metrics"]["endpoints"]
                total_endpoints += endpoints
                print(f"✅ {result['file']}: {endpoints} endpoints, {result['metrics']['functions']} functions")
            else:
                print(f"❌ {result['file']}: {result['error']}")
        else:
            print(f"❌ {api_file}: Archivo no encontrado")
            results.append({
                "status": "NOT_FOUND",
                "file": os.path.basename(api_file)
            })
    
    print("\n" + "=" * 50)
    print("📊 RESUMEN TESTING:")
    print(f"📁 Archivos probados: {len(api_files)}")
    print(f"✅ APIs OK: {len([r for r in results if r['status'] == 'OK'])}")
    print(f"❌ APIs con errores: {len([r for r in results if r['status'] == 'ERROR'])}")
    print(f"🔍 Total endpoints detectados: {total_endpoints}")
    
    if len([r for r in results if r['status'] == 'OK']) == len(api_files):
        print("🎯 TODAS LAS APIs TIENEN ESTRUCTURA CORRECTA")
        return True
    else:
        print("⚠️ ALGUNAS APIs TIENEN PROBLEMAS")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)