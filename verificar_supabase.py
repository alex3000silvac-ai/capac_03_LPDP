#!/usr/bin/env python3
"""
Script para verificar la conectividad con Supabase
"""
import os
import sys
import asyncio
import logging
from datetime import datetime
import json

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def verificar_variables_entorno():
    """Verificar que las variables de entorno están configuradas"""
    logger.info("🔍 Verificando variables de entorno...")
    
    variables_requeridas = [
        "DATABASE_URL",
        "SUPABASE_URL", 
        "SUPABASE_ANON_KEY"
    ]
    
    variables_encontradas = {}
    variables_faltantes = []
    
    for var in variables_requeridas:
        valor = os.getenv(var)
        if valor:
            variables_encontradas[var] = valor[:50] + "..." if len(valor) > 50 else valor
        else:
            variables_faltantes.append(var)
    
    print("\n📋 VARIABLES DE ENTORNO:")
    for var, valor in variables_encontradas.items():
        print(f"   ✅ {var}: {valor}")
    
    if variables_faltantes:
        print("\n❌ VARIABLES FALTANTES:")
        for var in variables_faltantes:
            print(f"   ❌ {var}")
        return False
    
    return True

def probar_conexion_basica():
    """Probar conexión básica a Supabase usando requests"""
    logger.info("🌐 Probando conexión básica a Supabase...")
    
    try:
        import requests
        
        supabase_url = os.getenv("SUPABASE_URL")
        if not supabase_url:
            print("❌ SUPABASE_URL no configurada")
            return False
        
        # Test 1: Ping a la URL base
        print(f"\n🔗 Probando conectividad a: {supabase_url}")
        response = requests.get(f"{supabase_url}/rest/v1/", timeout=10)
        
        if response.status_code == 200:
            print("   ✅ Supabase responde correctamente")
        else:
            print(f"   ⚠️ Supabase responde con código: {response.status_code}")
        
        # Test 2: Health check
        health_url = f"{supabase_url}/rest/v1/health"
        try:
            health_response = requests.get(health_url, timeout=5)
            print(f"   ✅ Health check: {health_response.status_code}")
        except:
            print("   ⚠️ Health check no disponible")
        
        return True
        
    except ImportError:
        print("❌ Módulo 'requests' no disponible")
        return False
    except Exception as e:
        print(f"❌ Error de conectividad: {e}")
        return False

def probar_conexion_postgresql():
    """Probar conexión a PostgreSQL de Supabase"""
    logger.info("🐘 Probando conexión a PostgreSQL...")
    
    try:
        import psycopg2
        from urllib.parse import urlparse
        
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            print("❌ DATABASE_URL no configurada")
            return False
        
        print(f"\n🔗 Probando conexión a PostgreSQL...")
        
        # Parsear URL de conexión
        parsed = urlparse(database_url)
        print(f"   Host: {parsed.hostname}")
        print(f"   Puerto: {parsed.port}")
        print(f"   Base de datos: {parsed.path[1:]}")
        print(f"   Usuario: {parsed.username}")
        
        # Intentar conexión
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        # Test básico
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"   ✅ PostgreSQL conectado: {version[0][:50]}...")
        
        # Test de permisos
        cursor.execute("SELECT current_user, current_database();")
        user_db = cursor.fetchone()
        print(f"   ✅ Usuario: {user_db[0]}, DB: {user_db[1]}")
        
        # Test de esquemas disponibles
        cursor.execute("SELECT schema_name FROM information_schema.schemata ORDER BY schema_name;")
        schemas = cursor.fetchall()
        print(f"   ✅ Esquemas disponibles: {len(schemas)}")
        for schema in schemas[:5]:  # Mostrar solo los primeros 5
            print(f"      - {schema[0]}")
        
        cursor.close()
        conn.close()
        
        return True
        
    except ImportError:
        print("❌ Módulo 'psycopg2' no disponible")
        print("   Instalar con: pip install psycopg2-binary")
        return False
    except Exception as e:
        print(f"❌ Error de conexión PostgreSQL: {e}")
        return False

def probar_supabase_cliente():
    """Probar conexión usando cliente de Supabase"""
    logger.info("📦 Probando cliente de Supabase...")
    
    try:
        from supabase import create_client, Client
        
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_ANON_KEY")
        
        if not supabase_url or not supabase_key:
            print("❌ Credenciales de Supabase incompletas")
            return False
        
        print(f"\n📦 Creando cliente Supabase...")
        supabase: Client = create_client(supabase_url, supabase_key)
        
        # Test de autenticación
        print("   ✅ Cliente Supabase creado correctamente")
        
        # Test de lectura básica (auth)
        try:
            auth_response = supabase.auth.get_session()
            print("   ✅ Servicio de autenticación accesible")
        except Exception as e:
            print(f"   ⚠️ Auth service: {e}")
        
        return True
        
    except ImportError:
        print("❌ Módulo 'supabase' no disponible")
        print("   Instalar con: pip install supabase")
        return False
    except Exception as e:
        print(f"❌ Error cliente Supabase: {e}")
        return False

def verificar_tablas_sistema():
    """Verificar que existen las tablas del sistema"""
    logger.info("📋 Verificando estructura de tablas...")
    
    try:
        import psycopg2
        
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            return False
        
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        # Verificar tablas principales
        tablas_esperadas = [
            "users",
            "tenants", 
            "data_subjects",
            "consents",
            "data_subject_requests"
        ]
        
        print(f"\n📋 Verificando tablas del sistema...")
        
        for tabla in tablas_esperadas:
            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = %s
                );
            """, (tabla,))
            
            existe = cursor.fetchone()[0]
            if existe:
                print(f"   ✅ Tabla '{tabla}' existe")
                
                # Contar registros
                cursor.execute(f"SELECT COUNT(*) FROM {tabla};")
                count = cursor.fetchone()[0]
                print(f"      └─ {count} registros")
            else:
                print(f"   ❌ Tabla '{tabla}' NO existe")
        
        cursor.close()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"❌ Error verificando tablas: {e}")
        return False

def generar_reporte():
    """Generar reporte completo de verificación"""
    print("\n" + "="*60)
    print("🔍 REPORTE DE VERIFICACIÓN SUPABASE")
    print("="*60)
    print(f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    resultados = {
        "variables_entorno": verificar_variables_entorno(),
        "conexion_basica": probar_conexion_basica(),
        "postgresql": probar_conexion_postgresql(),
        "cliente_supabase": probar_supabase_cliente(),
        "tablas_sistema": verificar_tablas_sistema()
    }
    
    print("\n📊 RESUMEN DE RESULTADOS:")
    for test, resultado in resultados.items():
        estado = "✅ PASS" if resultado else "❌ FAIL"
        print(f"   {estado} {test.replace('_', ' ').title()}")
    
    # Determinar estado general
    total_tests = len(resultados)
    tests_pasados = sum(resultados.values())
    porcentaje = (tests_pasados / total_tests) * 100
    
    print(f"\n🎯 ESTADO GENERAL: {tests_pasados}/{total_tests} tests pasados ({porcentaje:.1f}%)")
    
    if porcentaje == 100:
        print("🎉 ¡Supabase está configurado correctamente!")
    elif porcentaje >= 60:
        print("⚠️  Supabase parcialmente configurado - requiere ajustes")
    else:
        print("❌ Supabase requiere configuración completa")
    
    print("\n💡 PRÓXIMOS PASOS:")
    if not resultados["variables_entorno"]:
        print("   1. Configurar variables de entorno de Supabase")
    if not resultados["postgresql"]:
        print("   2. Verificar DATABASE_URL y credenciales")
    if not resultados["tablas_sistema"]:
        print("   3. Ejecutar migraciones para crear tablas")
    if resultados["postgresql"] and not resultados["tablas_sistema"]:
        print("   4. Ejecutar: alembic upgrade head")
    
    return resultados

if __name__ == "__main__":
    print("🚀 VERIFICADOR DE CONECTIVIDAD SUPABASE")
    print("="*50)
    
    try:
        resultados = generar_reporte()
        
        # Guardar reporte
        with open("supabase_verification_report.json", "w") as f:
            json.dump({
                "timestamp": datetime.now().isoformat(),
                "results": resultados
            }, f, indent=2)
        
        print(f"\n📄 Reporte guardado en: supabase_verification_report.json")
        
    except KeyboardInterrupt:
        print("\n⚠️ Verificación cancelada por usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Error inesperado: {e}")
        sys.exit(1)