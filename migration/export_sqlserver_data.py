#!/usr/bin/env python3
"""
Script de exportación de datos de SQL Server a JSON para migración a Supabase
"""

import json
import os
from datetime import datetime
import pyodbc
from decimal import Decimal

# Configuración de conexión SQL Server
SERVER = 'PASC\\LPDP_Test'
DATABASE = 'LPDP_Database'
CONNECTION_STRING = f'DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={SERVER};DATABASE={DATABASE};Trusted_Connection=yes'

def decimal_default(obj):
    """Manejador para tipos Decimal en JSON"""
    if isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError

def export_table_to_json(cursor, table_name, output_dir):
    """Exporta una tabla completa a JSON"""
    try:
        # Obtener todos los registros
        cursor.execute(f"SELECT * FROM {table_name}")
        columns = [column[0] for column in cursor.description]
        rows = []
        
        for row in cursor.fetchall():
            row_dict = {}
            for i, value in enumerate(row):
                if isinstance(value, bytes):
                    # Convertir bytes a string si es necesario
                    row_dict[columns[i]] = value.decode('utf-8', errors='ignore')
                elif isinstance(value, datetime):
                    row_dict[columns[i]] = value.isoformat()
                elif value is None:
                    row_dict[columns[i]] = None
                else:
                    row_dict[columns[i]] = value
            rows.append(row_dict)
        
        # Guardar a archivo JSON
        output_file = os.path.join(output_dir, f"{table_name}.json")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(rows, f, ensure_ascii=False, indent=2, default=decimal_default)
        
        print(f"✅ Tabla {table_name} exportada: {len(rows)} registros")
        return len(rows)
    
    except Exception as e:
        print(f"❌ Error exportando {table_name}: {str(e)}")
        return 0

def get_table_schema(cursor, table_name):
    """Obtiene el esquema de una tabla"""
    query = """
    SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE,
        COLUMN_DEFAULT
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = ?
    ORDER BY ORDINAL_POSITION
    """
    
    cursor.execute(query, table_name)
    schema = []
    
    for row in cursor.fetchall():
        schema.append({
            'column_name': row[0],
            'data_type': row[1],
            'max_length': row[2],
            'is_nullable': row[3],
            'default': row[4]
        })
    
    return schema

def main():
    """Función principal de exportación"""
    print("🚀 Iniciando exportación de datos SQL Server para migración a Supabase")
    
    # Crear directorio de salida
    output_dir = "/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/migration/data"
    os.makedirs(output_dir, exist_ok=True)
    
    # Tablas a exportar (orden importante por foreign keys)
    tables = [
        'usuarios',
        'organizaciones', 
        'rats',
        'eipds',
        'proveedores',
        'notificaciones',
        'mapeo_datos_rat',
        'documentos_eipd',
        'contratos_dpa'
    ]
    
    try:
        # Conectar a SQL Server
        print(f"📡 Conectando a SQL Server: {SERVER}")
        conn = pyodbc.connect(CONNECTION_STRING)
        cursor = conn.cursor()
        
        # Exportar esquemas
        schemas = {}
        print("\n📋 Exportando esquemas de tablas...")
        for table in tables:
            try:
                schema = get_table_schema(cursor, table)
                if schema:
                    schemas[table] = schema
                    print(f"  ✓ Esquema de {table} obtenido")
            except:
                print(f"  ✗ Tabla {table} no encontrada")
        
        # Guardar esquemas
        with open(os.path.join(output_dir, '_schemas.json'), 'w') as f:
            json.dump(schemas, f, indent=2)
        
        # Exportar datos de cada tabla
        print("\n📦 Exportando datos de tablas...")
        total_records = 0
        for table in tables:
            if table in schemas:
                count = export_table_to_json(cursor, table, output_dir)
                total_records += count
        
        print(f"\n✅ Exportación completada: {total_records} registros totales")
        
        # Cerrar conexión
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"\n❌ Error en la exportación: {str(e)}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())