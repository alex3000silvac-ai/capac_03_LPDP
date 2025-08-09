#!/usr/bin/env python3
"""
Script seguro para inicializar la base de datos
Ejecuta el SQL línea por línea para mejor control de errores
"""
import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def execute_sql_file(cursor, filename):
    """Ejecuta un archivo SQL línea por línea"""
    print(f"📄 Ejecutando {filename}...")
    
    with open(filename, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    # Dividir por sentencias SQL (usando ; como delimitador)
    statements = []
    current = []
    
    for line in sql_content.split('\n'):
        # Ignorar comentarios y líneas vacías
        if line.strip().startswith('--') or not line.strip():
            continue
            
        current.append(line)
        
        # Si la línea termina con ; es el fin de una sentencia
        if line.strip().endswith(';'):
            statements.append('\n'.join(current))
            current = []
    
    # Ejecutar cada sentencia
    success_count = 0
    error_count = 0
    
    for i, statement in enumerate(statements, 1):
        try:
            if statement.strip():
                cursor.execute(statement)
                success_count += 1
                print(f"✓ Sentencia {i} ejecutada")
        except Exception as e:
            error_count += 1
            print(f"✗ Error en sentencia {i}: {str(e)[:100]}")
            # Continuar con las demás sentencias
    
    print(f"\n📊 Resumen: {success_count} éxitos, {error_count} errores")
    return error_count == 0

def init_database():
    """Inicializa la base de datos de manera segura"""
    # Obtener URL de la base de datos
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        print("❌ DATABASE_URL no configurada")
        print("💡 Configura la variable de entorno DATABASE_URL")
        return False
    
    try:
        print("🔌 Conectando a la base de datos...")
        conn = psycopg2.connect(database_url)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        
        print("✅ Conexión establecida")
        
        # Verificar si ya existen tablas
        cur.execute("""
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
        """)
        
        table_count = cur.fetchone()[0]
        if table_count > 0:
            print(f"⚠️  Ya existen {table_count} tablas en la base de datos")
            response = input("¿Deseas continuar? (s/n): ")
            if response.lower() != 's':
                print("❌ Operación cancelada")
                return False
        
        # Ejecutar script de inicialización
        script_path = 'database/init_simple.sql'
        if not os.path.exists(script_path):
            print(f"❌ No se encuentra el archivo {script_path}")
            return False
        
        success = execute_sql_file(cur, script_path)
        
        if success:
            print("\n✅ Base de datos inicializada correctamente")
        else:
            print("\n⚠️  Base de datos inicializada con algunos errores")
        
        # Verificar tablas creadas
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        """)
        
        tables = cur.fetchall()
        print(f"\n📋 Tablas en la base de datos ({len(tables)}):")
        for table in tables:
            print(f"   - {table[0]}")
        
        # Verificar esquemas de tenant
        cur.execute("""
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name LIKE 'tenant_%'
            ORDER BY schema_name
        """)
        
        schemas = cur.fetchall()
        if schemas:
            print(f"\n🏢 Esquemas de tenant ({len(schemas)}):")
            for schema in schemas:
                print(f"   - {schema[0]}")
        
        cur.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Inicializador de Base de Datos - Sistema LPDP")
    print("=" * 50)
    
    if init_database():
        print("\n✅ Proceso completado exitosamente")
    else:
        print("\n❌ Proceso completado con errores")
        sys.exit(1)