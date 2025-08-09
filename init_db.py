"""
Script para inicializar la base de datos en Render
"""
import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def init_database():
    # Obtener URL de la base de datos
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        print("❌ DATABASE_URL no configurada")
        return False
    
    # Conectar a la base de datos
    try:
        conn = psycopg2.connect(database_url)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        
        print("📊 Ejecutando script de inicialización...")
        
        # Leer y ejecutar el script SQL
        with open('database/init_complete_system.sql', 'r') as f:
            sql_script = f.read()
            cur.execute(sql_script)
        
        print("✅ Base de datos inicializada correctamente")
        
        # Verificar tablas creadas
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
        """)
        
        tables = cur.fetchall()
        print(f"📋 Tablas creadas: {len(tables)}")
        for table in tables:
            print(f"   - {table[0]}")
        
        cur.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    init_database()
