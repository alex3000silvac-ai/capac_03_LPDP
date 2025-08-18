#!/usr/bin/env python3
"""
Script de prueba de conectividad con Supabase
"""
import psycopg2
import os
from datetime import datetime

def test_supabase_connection():
    """Prueba la conexión con Supabase"""
    
    # Credenciales de Supabase desde variables de entorno
    SUPABASE_URI = os.getenv("DATABASE_URL")
    if not SUPABASE_URI:
        print("❌ ERROR: DATABASE_URL no está configurado")
        return False
    
    try:
        print("🔍 PROBANDO CONECTIVIDAD CON SUPABASE...")
        print(f"⏰ Hora: {datetime.now().strftime('%H:%M:%S')}")
        print(f"🌐 URI: {SUPABASE_URI[:50]}...")
        
        # Intentar conexión
        conn = psycopg2.connect(SUPABASE_URI)
        cursor = conn.cursor()
        
        # Probar query simple
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        
        print("✅ CONEXIÓN EXITOSA CON SUPABASE!")
        print(f"📊 Versión PostgreSQL: {version[0]}")
        
        # Verificar tablas existentes
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        
        tables = cursor.fetchall()
        print(f"📋 Tablas disponibles: {len(tables)}")
        for table in tables[:10]:  # Mostrar primeras 10
            print(f"   - {table[0]}")
        
        # Verificar usuarios
        cursor.execute("SELECT username, email FROM users LIMIT 5;")
        users = cursor.fetchall()
        print(f"👥 Usuarios encontrados: {len(users)}")
        for user in users:
            print(f"   - {user[0]} ({user[1]})")
        
        cursor.close()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"❌ ERROR DE CONEXIÓN CON SUPABASE: {e}")
        return False

if __name__ == "__main__":
    test_supabase_connection()
