"""
Script para arreglar imports de Integer en todos los modelos
"""
import os
import re

models_dir = "/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/Intro_LPDP/backend/app/models"

# Archivos que necesitan Integer
files_to_fix = [
    "arcopol.py",
    "auditoria.py",
    "base.py",
    "brecha.py",
    "consentimiento.py",
    "dpia.py",
    "empresa.py",
    "inventario.py",
    "tenant.py",
    "transferencia.py"
]

for filename in files_to_fix:
    filepath = os.path.join(models_dir, filename)
    
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Buscar la línea de imports de sqlalchemy
        import_pattern = r'from sqlalchemy import ([^)\n]+)'
        match = re.search(import_pattern, content)
        
        if match:
            imports = match.group(1)
            # Si Integer no está en los imports, agregarlo
            if 'Integer' not in imports:
                # Agregar Integer al final de los imports
                new_imports = imports.rstrip() + ', Integer'
                new_content = content.replace(
                    f'from sqlalchemy import {imports}',
                    f'from sqlalchemy import {new_imports}'
                )
                
                # Escribir el archivo actualizado
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                
                print(f"✓ Fixed {filename}")
            else:
                print(f"✓ {filename} already has Integer import")
        else:
            print(f"✗ Could not find sqlalchemy imports in {filename}")
    else:
        print(f"✗ File not found: {filename}")

print("\nDone!")