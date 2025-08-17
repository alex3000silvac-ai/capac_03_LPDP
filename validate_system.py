#!/usr/bin/env python3
"""
Script de Validación Automática del Sistema LPDP
Ingeniero en Jefe - Prevención de Errores
"""
import os
import sys
import importlib
import subprocess
from pathlib import Path

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

def validate_python_imports():
    """Valida que todos los imports de Python funcionen"""
    print_header("VALIDACIÓN DE IMPORTS PYTHON")
    
    backend_dir = Path("backend")
    if not backend_dir.exists():
        print_error("Directorio backend no encontrado")
        return False
    
    # Archivos críticos a validar
    critical_files = [
        "app/main.py",
        "app/api/v1/api.py",
        "app/core/config.py",
        "app/core/database.py",
        "app/models/user.py",
        "app/api/v1/endpoints/auth.py"
    ]
    
    all_valid = True
    
    for file_path in critical_files:
        full_path = backend_dir / file_path
        if not full_path.exists():
            print_error(f"Archivo crítico no encontrado: {file_path}")
            all_valid = False
            continue
            
        try:
            # Intentar importar el módulo
            module_name = str(file_path).replace('/', '.').replace('.py', '')
            if module_name.startswith('app.'):
                # Cambiar al directorio backend para importar
                os.chdir(backend_dir)
                importlib.import_module(module_name)
                print_success(f"Import exitoso: {file_path}")
                os.chdir('..')
        except Exception as e:
            print_error(f"Error importando {file_path}: {e}")
            all_valid = False
    
    return all_valid

def validate_frontend_dependencies():
    """Valida las dependencias del frontend"""
    print_header("VALIDACIÓN DE DEPENDENCIAS FRONTEND")
    
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print_error("Directorio frontend no encontrado")
        return False
    
    # Verificar package.json
    package_json = frontend_dir / "package.json"
    if not package_json.exists():
        print_error("package.json no encontrado")
        return False
    
    # Verificar dependencias críticas
    critical_deps = [
        "react", "react-dom", "@mui/material", 
        "@mui/icons-material", "jwt-decode"
    ]
    
    try:
        import json
        with open(package_json, 'r') as f:
            data = json.load(f)
            dependencies = data.get('dependencies', {})
            
            for dep in critical_deps:
                if dep in dependencies:
                    print_success(f"Dependencia encontrada: {dep}")
                else:
                    print_error(f"Dependencia faltante: {dep}")
                    return False
    except Exception as e:
        print_error(f"Error leyendo package.json: {e}")
        return False
    
    return True

def validate_database_scripts():
    """Valida que existan los scripts de base de datos"""
    print_header("VALIDACIÓN DE SCRIPTS DE BASE DE DATOS")
    
    required_scripts = [
        "SUPABASE_PERFECT_INTEGRATION_FIXED.sql",
        "INSTRUCCIONES_SUPABASE.md"
    ]
    
    all_exist = True
    for script in required_scripts:
        if Path(script).exists():
            print_success(f"Script encontrado: {script}")
        else:
            print_error(f"Script faltante: {script}")
            all_exist = False
    
    return all_exist

def validate_render_config():
    """Valida la configuración de Render"""
    print_header("VALIDACIÓN DE CONFIGURACIÓN RENDER")
    
    render_files = [
        "render.yaml",
        "deploy_render_supabase.sh"
    ]
    
    all_exist = True
    for file in render_files:
        if Path(file).exists():
            print_success(f"Archivo de configuración encontrado: {file}")
        else:
            print_error(f"Archivo de configuración faltante: {file}")
            all_exist = False
    
    return all_exist

def validate_git_status():
    """Valida el estado de Git"""
    print_header("VALIDACIÓN DE ESTADO GIT")
    
    try:
        # Verificar si hay cambios sin commitear
        result = subprocess.run(
            ["git", "status", "--porcelain"], 
            capture_output=True, text=True, check=True
        )
        
        if result.stdout.strip():
            print_warning("Hay cambios sin commitear:")
            print(result.stdout)
            return False
        else:
            print_success("No hay cambios pendientes")
            return True
            
    except subprocess.CalledProcessError as e:
        print_error(f"Error ejecutando git status: {e}")
        return False
    except FileNotFoundError:
        print_error("Git no está instalado o no está en PATH")
        return False

def main():
    """Función principal de validación"""
    print_header("SISTEMA DE VALIDACIÓN AUTOMÁTICA LPDP")
    print("Ingeniero en Jefe - Prevención de Errores")
    
    validations = [
        ("Imports Python", validate_python_imports),
        ("Dependencias Frontend", validate_frontend_dependencies),
        ("Scripts Base de Datos", validate_database_scripts),
        ("Configuración Render", validate_render_config),
        ("Estado Git", validate_git_status)
    ]
    
    results = []
    for name, validator in validations:
        try:
            result = validator()
            results.append((name, result))
        except Exception as e:
            print_error(f"Error en validación {name}: {e}")
            results.append((name, False))
    
    # Resumen final
    print_header("RESUMEN DE VALIDACIÓN")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASÓ" if result else "❌ FALLÓ"
        print(f"{name}: {status}")
    
    print(f"\n📊 RESULTADO: {passed}/{total} validaciones pasaron")
    
    if passed == total:
        print_success("🎉 SISTEMA VALIDADO COMPLETAMENTE - LISTO PARA DESPLIEGUE")
        return True
    else:
        print_error("🚨 SISTEMA CON PROBLEMAS - REQUIERE CORRECCIÓN ANTES DEL DESPLIEGUE")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
