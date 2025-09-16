#!/usr/bin/env python3
"""
Script para aplicar migraciones de Supabase directamente via PostgreSQL
"""
import psycopg2
import os

# Configuración de conexión (leer desde archivo seguro)
import os
from pathlib import Path

# Leer credenciales desde archivo .env.secrets
secrets_file = Path('.env.secrets')
if secrets_file.exists():
    with open(secrets_file) as f:
        for line in f:
            if line.startswith('SUPABASE_DB_PASSWORD='):
                password = line.split('=')[1].strip()
                break
    DB_URL = f"postgresql://postgres:{password}@db.vkyhsnlivgwgrhdbvynm.supabase.co:5432/postgres"
else:
    DB_URL = "postgresql://postgres:[PASSWORD]@db.vkyhsnlivgwgrhdbvynm.supabase.co:5432/postgres"

def apply_migrations():
    print("🚀 Aplicando migraciones a Supabase...")
    
    try:
        # Conectar a PostgreSQL
        conn = psycopg2.connect(DB_URL)
        cursor = conn.cursor()
        
        print("✅ Conectado a Supabase PostgreSQL")
        
        # Leer archivo de migración
        migration_file = "supabase/migrations/20240101000000_initial_schema.sql"
        
        if os.path.exists(migration_file):
            with open(migration_file, 'r', encoding='utf-8') as f:
                sql_content = f.read()
            
            print(f"📋 Ejecutando migración: {migration_file}")
            
            # Ejecutar SQL
            cursor.execute(sql_content)
            conn.commit()
            
            print("✅ Migración aplicada exitosamente")
            
        else:
            print(f"❌ Archivo no encontrado: {migration_file}")
            
        # Cerrar conexión
        cursor.close()
        conn.close()
        
        print("🎉 ¡Migraciones completadas!")
        
    except Exception as e:
        print(f"❌ Error aplicando migraciones: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    apply_migrations()