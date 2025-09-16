#!/usr/bin/env python3
"""
Validar que las tablas de Supabase estén funcionando correctamente
"""
import requests
from pathlib import Path

def load_credentials():
    """Cargar credenciales desde archivo seguro"""
    secrets_file = Path('.env.secrets')
    if secrets_file.exists():
        with open(secrets_file) as f:
            credentials = {}
            for line in f:
                if '=' in line and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    credentials[key] = value
            return credentials
    return {}

def validate_tables():
    """Validar conectividad con las tablas"""
    print("🔍 Validando tablas de Supabase...")
    
    # Cargar credenciales
    creds = load_credentials()
    if not creds:
        print("❌ No se encontraron credenciales")
        return False
    
    base_url = creds.get('SUPABASE_URL', '').replace('https://', '').replace('http://', '')
    anon_key = creds.get('SUPABASE_ANON_KEY', '')
    
    if not base_url or not anon_key:
        print("❌ Credenciales incompletas")
        return False
    
    headers = {
        'Authorization': f'Bearer {anon_key}',
        'apikey': anon_key,
        'Content-Type': 'application/json'
    }
    
    # Tablas a validar
    tables = ['organizaciones', 'usuarios', 'rats', 'eipds', 'proveedores', 'notificaciones']
    
    results = {}
    
    for table in tables:
        try:
            url = f"https://{base_url}/rest/v1/{table}?select=count"
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                print(f"  ✅ Tabla '{table}' - OK")
                results[table] = 'OK'
            else:
                print(f"  ❌ Tabla '{table}' - Error {response.status_code}: {response.text[:100]}")
                results[table] = f'Error {response.status_code}'
                
        except Exception as e:
            print(f"  ❌ Tabla '{table}' - Excepción: {str(e)[:50]}...")
            results[table] = f'Excepción: {str(e)[:50]}'
    
    # Resumen
    successful = sum(1 for status in results.values() if status == 'OK')
    total = len(tables)
    
    print(f"\n📊 Resumen: {successful}/{total} tablas funcionando")
    
    if successful == total:
        print("🎉 ¡Todas las tablas están funcionando correctamente!")
        return True
    else:
        print("⚠️  Algunas tablas tienen problemas")
        return False

if __name__ == "__main__":
    validate_tables()