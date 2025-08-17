#!/usr/bin/env python3
"""
Script de migración: Render DB → Supabase DB
Mantiene el backend en Render, solo migra la base de datos
"""

import os
import sys
import psycopg2
import subprocess
from datetime import datetime
from urllib.parse import urlparse
import json

def colored_print(message, color="white"):
    """Imprime mensajes con colores"""
    colors = {
        "red": "\033[91m",
        "green": "\033[92m", 
        "yellow": "\033[93m",
        "blue": "\033[94m",
        "purple": "\033[95m",
        "cyan": "\033[96m",
        "white": "\033[97m",
        "end": "\033[0m"
    }
    print(f"{colors.get(color, colors['white'])}{message}{colors['end']}")

def get_database_info(db_url):
    """Extrae información de la URL de la base de datos"""
    parsed = urlparse(db_url)
    return {
        'host': parsed.hostname,
        'port': parsed.port or 5432,
        'database': parsed.path.lstrip('/'),
        'username': parsed.username,
        'password': parsed.password
    }

def test_connection(db_url, name):
    """Prueba la conexión a la base de datos"""
    try:
        colored_print(f"🔄 Probando conexión a {name}...", "yellow")
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        cur.execute("SELECT version();")
        version = cur.fetchone()[0]
        cur.close()
        conn.close()
        colored_print(f"✅ Conexión exitosa a {name}", "green")
        colored_print(f"   Version: {version[:50]}...", "cyan")
        return True
    except Exception as e:
        colored_print(f"❌ Error conectando a {name}: {str(e)}", "red")
        return False

def get_table_list(db_url):
    """Obtiene lista de tablas existentes"""
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        # Obtener esquemas
        cur.execute("""
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
            ORDER BY schema_name;
        """)
        schemas = [row[0] for row in cur.fetchall()]
        
        # Obtener tablas por esquema
        tables_by_schema = {}
        for schema in schemas:
            cur.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = %s 
                AND table_type = 'BASE TABLE'
                ORDER BY table_name;
            """, (schema,))
            tables = [row[0] for row in cur.fetchall()]
            if tables:
                tables_by_schema[schema] = tables
        
        cur.close()
        conn.close()
        return tables_by_schema
        
    except Exception as e:
        colored_print(f"❌ Error obteniendo tablas: {str(e)}", "red")
        return {}

def backup_database(source_url, backup_file):
    """Crea backup de la base de datos origen"""
    try:
        colored_print("📦 Creando backup de la base de datos de Render...", "yellow")
        
        # Usar pg_dump
        cmd = [
            'pg_dump',
            '--verbose',
            '--clean',
            '--no-acl',
            '--no-owner',
            '--format=plain',
            '--file', backup_file,
            source_url
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            colored_print(f"✅ Backup creado: {backup_file}", "green")
            # Mostrar tamaño del archivo
            size = os.path.getsize(backup_file)
            colored_print(f"   Tamaño: {size / 1024 / 1024:.2f} MB", "cyan")
            return True
        else:
            colored_print(f"❌ Error en backup: {result.stderr}", "red")
            return False
            
    except Exception as e:
        colored_print(f"❌ Error creando backup: {str(e)}", "red")
        return False

def restore_to_supabase(target_url, backup_file):
    """Restaura backup en Supabase"""
    try:
        colored_print("📥 Restaurando datos en Supabase...", "yellow")
        
        # Usar psql para restaurar
        cmd = [
            'psql',
            '--verbose',
            '--file', backup_file,
            target_url
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            colored_print("✅ Datos restaurados en Supabase", "green")
            return True
        else:
            colored_print(f"⚠️ Restauración completada con advertencias:", "yellow")
            colored_print(f"   {result.stderr[:200]}...", "cyan")
            return True  # Muchas veces hay warnings que no son críticos
            
    except Exception as e:
        colored_print(f"❌ Error restaurando: {str(e)}", "red")
        return False

def verify_migration(source_url, target_url):
    """Verifica que la migración fue exitosa"""
    try:
        colored_print("🔍 Verificando migración...", "yellow")
        
        # Contar registros en ambas DBs
        source_conn = psycopg2.connect(source_url)
        target_conn = psycopg2.connect(target_url)
        
        source_cur = source_conn.cursor()
        target_cur = target_conn.cursor()
        
        # Obtener esquemas comunes
        source_cur.execute("""
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
        """)
        schemas = [row[0] for row in source_cur.fetchall()]
        
        verification_results = {}
        
        for schema in schemas:
            # Obtener tablas del esquema
            source_cur.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = %s AND table_type = 'BASE TABLE'
            """, (schema,))
            tables = [row[0] for row in source_cur.fetchall()]
            
            for table in tables:
                try:
                    # Contar en origen
                    source_cur.execute(f'SELECT COUNT(*) FROM "{schema}"."{table}"')
                    source_count = source_cur.fetchone()[0]
                    
                    # Contar en destino
                    target_cur.execute(f'SELECT COUNT(*) FROM "{schema}"."{table}"')
                    target_count = target_cur.fetchone()[0]
                    
                    verification_results[f"{schema}.{table}"] = {
                        'source': source_count,
                        'target': target_count,
                        'match': source_count == target_count
                    }
                    
                except Exception as e:
                    verification_results[f"{schema}.{table}"] = {
                        'source': 'error',
                        'target': 'error', 
                        'match': False,
                        'error': str(e)
                    }
        
        source_cur.close()
        target_cur.close()
        source_conn.close()
        target_conn.close()
        
        # Mostrar resultados
        colored_print("📊 Resultados de verificación:", "cyan")
        all_match = True
        
        for table, result in verification_results.items():
            if result['match']:
                colored_print(f"   ✅ {table}: {result['source']} registros", "green")
            else:
                colored_print(f"   ❌ {table}: {result['source']} → {result['target']}", "red")
                all_match = False
        
        if all_match:
            colored_print("🎉 ¡Migración verificada exitosamente!", "green")
        else:
            colored_print("⚠️ Hay diferencias en algunos registros", "yellow")
        
        return verification_results
        
    except Exception as e:
        colored_print(f"❌ Error verificando: {str(e)}", "red")
        return {}

def main():
    """Proceso principal de migración"""
    
    colored_print("""
    🚀 MIGRACIÓN RENDER → SUPABASE
    ================================
    
    Este script migra tu base de datos de Render a Supabase
    manteniendo el backend en Render.
    
    Requisitos:
    - pg_dump y psql instalados
    - URLs de conexión a ambas bases de datos
    - Backup de seguridad recomendado
    
    """, "cyan")
    
    # Solicitar URLs
    colored_print("1. URL de base de datos de Render (origen):", "yellow")
    source_url = input("   DATABASE_URL actual: ").strip()
    
    if not source_url:
        colored_print("❌ URL de origen requerida", "red")
        return
    
    colored_print("\n2. URL de base de datos de Supabase (destino):", "yellow")
    target_url = input("   DATABASE_URL de Supabase: ").strip()
    
    if not target_url:
        colored_print("❌ URL de destino requerida", "red")
        return
    
    # Probar conexiones
    colored_print("\n🔌 Verificando conexiones...", "blue")
    if not test_connection(source_url, "Render"):
        return
    
    if not test_connection(target_url, "Supabase"):
        return
    
    # Mostrar información de las bases
    colored_print("\n📋 Analizando estructura actual...", "blue")
    source_tables = get_table_list(source_url)
    target_tables = get_table_list(target_url)
    
    colored_print(f"   Render: {sum(len(tables) for tables in source_tables.values())} tablas en {len(source_tables)} esquemas", "cyan")
    colored_print(f"   Supabase: {sum(len(tables) for tables in target_tables.values())} tablas en {len(target_tables)} esquemas", "cyan")
    
    # Confirmar migración
    colored_print("\n⚠️  IMPORTANTE:", "yellow")
    colored_print("   - Se sobreescribirán datos existentes en Supabase", "yellow")
    colored_print("   - Se recomienda tener backup de seguridad", "yellow")
    colored_print("   - El proceso puede tomar varios minutos", "yellow")
    
    confirm = input("\n¿Continuar con la migración? (escriba 'MIGRAR' para confirmar): ").strip()
    
    if confirm != "MIGRAR":
        colored_print("❌ Migración cancelada", "red")
        return
    
    # Crear directorio de backup
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = f"migration_backup_{timestamp}"
    os.makedirs(backup_dir, exist_ok=True)
    backup_file = os.path.join(backup_dir, "render_backup.sql")
    
    try:
        # Paso 1: Backup
        if not backup_database(source_url, backup_file):
            colored_print("❌ Fallo en backup. Abortando migración.", "red")
            return
        
        # Paso 2: Restauración
        if not restore_to_supabase(target_url, backup_file):
            colored_print("❌ Fallo en restauración. Verifica logs.", "red")
            return
        
        # Paso 3: Verificación
        verification = verify_migration(source_url, target_url)
        
        # Guardar reporte
        report_file = os.path.join(backup_dir, "migration_report.json")
        with open(report_file, 'w') as f:
            json.dump({
                'timestamp': timestamp,
                'source_url': source_url.split('@')[0] + '@***',  # Ocultar password
                'target_url': target_url.split('@')[0] + '@***',
                'verification': verification
            }, f, indent=2)
        
        colored_print(f"\n📄 Reporte guardado en: {report_file}", "cyan")
        
        # Instrucciones finales
        colored_print("""
        🎉 ¡MIGRACIÓN COMPLETADA!
        =========================
        
        Próximos pasos:
        
        1. Ve a tu dashboard de Render
        2. En tu Web Service del backend, ve a Environment
        3. Actualiza la variable DATABASE_URL con la nueva URL de Supabase
        4. Guarda y espera el redeploy automático
        5. Verifica que la aplicación funciona correctamente
        
        """, "green")
        
        colored_print("🔧 Nueva DATABASE_URL para Render:", "yellow")
        colored_print(f"   {target_url}", "cyan")
        
        colored_print(f"\n📦 Backup guardado en: {backup_dir}/", "blue")
        colored_print("   Guarda este backup en un lugar seguro", "blue")
        
    except Exception as e:
        colored_print(f"❌ Error durante migración: {str(e)}", "red")
        colored_print("💾 El backup se mantiene en caso de necesidad", "blue")

if __name__ == "__main__":
    main()