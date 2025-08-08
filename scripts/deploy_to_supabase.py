"""
Script automatizado para desplegar en Supabase
"""
import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import subprocess
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

def create_tables_in_supabase():
    """Ejecuta el script SQL en Supabase"""
    
    # Obtener URL de conexión
    database_url = input("Pega aquí tu DATABASE_URL de Supabase (la encuentras en Settings > Database): ").strip()
    
    if not database_url:
        print("❌ URL de base de datos requerida")
        return False
    
    try:
        # Conectar a Supabase
        print("🔄 Conectando a Supabase...")
        conn = psycopg2.connect(database_url)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        
        # Leer script SQL
        sql_file = os.path.join(os.path.dirname(__file__), '..', 'database', 'init_multitenant.sql')
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_script = f.read()
        
        # Ejecutar script
        print("📝 Creando tablas multi-tenant...")
        cur.execute(sql_script)
        
        print("✅ Tablas creadas exitosamente!")
        
        # Crear archivo .env con la URL
        env_file = os.path.join(os.path.dirname(__file__), '..', 'backend', '.env')
        with open(env_file, 'w') as f:
            f.write(f"DATABASE_URL={database_url}\n")
            f.write("SECRET_KEY=" + os.urandom(32).hex() + "\n")
            f.write("LICENSE_ENCRYPTION_KEY=" + os.urandom(32).hex() + "\n")
            f.write("ADMIN_EMAIL=admin@juridicadigital.cl\n")
            f.write("ADMIN_PASSWORD=Admin123!\n")
        
        print("📄 Archivo .env creado con configuración")
        
        # Cerrar conexión
        cur.close()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def push_to_github():
    """Sube el código a GitHub"""
    
    print("\n📤 Preparando para subir a GitHub...")
    
    # Verificar si hay repositorio git
    if not os.path.exists('.git'):
        print("🔄 Inicializando repositorio git...")
        subprocess.run(['git', 'init'])
    
    # Crear .gitignore si no existe
    gitignore_content = """
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
.env
.venv

# IDEs
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Database
*.db
*.sqlite3

# Uploads
uploads/
media/

# Node (frontend)
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
build/
dist/
.cache/

# Misc
*.bak
.coverage
htmlcov/
"""
    
    with open('.gitignore', 'w') as f:
        f.write(gitignore_content)
    
    # Agregar archivos
    print("📁 Agregando archivos...")
    subprocess.run(['git', 'add', '.'])
    
    # Commit
    print("💾 Creando commit...")
    subprocess.run(['git', 'commit', '-m', 'Sistema Multi-tenant LPDP - 7 módulos funcionales completos'])
    
    # Solicitar URL del repositorio
    repo_url = input("\n🔗 Ingresa la URL de tu repositorio GitHub (https://github.com/usuario/repo.git): ").strip()
    
    if repo_url:
        # Agregar remote
        subprocess.run(['git', 'remote', 'remove', 'origin'], capture_output=True)  # Por si ya existe
        subprocess.run(['git', 'remote', 'add', 'origin', repo_url])
        
        # Push
        print("🚀 Subiendo a GitHub...")
        result = subprocess.run(['git', 'push', '-u', 'origin', 'main'], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Código subido exitosamente a GitHub!")
        else:
            # Intentar con master si main falla
            result = subprocess.run(['git', 'push', '-u', 'origin', 'master'], capture_output=True, text=True)
            if result.returncode == 0:
                print("✅ Código subido exitosamente a GitHub!")
            else:
                print(f"⚠️ Error al subir: {result.stderr}")
                print("Intenta ejecutar manualmente: git push -u origin main")

def main():
    """Proceso principal de deployment"""
    
    print("""
    🏢 Sistema Multi-tenant LPDP - Deployment Automático
    ====================================================
    
    Este script te ayudará a:
    1. Crear las tablas en Supabase
    2. Configurar el archivo .env
    3. Subir el código a GitHub
    
    """)
    
    # Paso 1: Supabase
    if create_tables_in_supabase():
        print("\n✅ Paso 1 completado: Base de datos configurada")
        
        # Paso 2: GitHub
        continuar = input("\n¿Deseas subir el código a GitHub? (s/n): ").lower()
        if continuar == 's':
            push_to_github()
        
        print("""
        
    🎉 ¡Deployment preparado!
    =========================
    
    Próximos pasos:
    
    1. Ve a Render.com y crea un nuevo Web Service
    2. Conecta tu repositorio de GitHub
    3. Configura:
       - Root Directory: backend
       - Build Command: pip install -r requirements.txt
       - Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    
    4. Copia estas variables de entorno a Render:
    """)
        
        # Mostrar variables de entorno
        env_file = os.path.join(os.path.dirname(__file__), '..', 'backend', '.env')
        if os.path.exists(env_file):
            with open(env_file, 'r') as f:
                print(f.read())
        
        print("""
    5. Deploy! 🚀
    
    Una vez desplegado, ejecuta desde la consola de Render:
    python scripts/init_db.py
    
    Esto creará el tenant demo y usuarios iniciales.
    """)
    else:
        print("\n❌ No se pudo completar la configuración de Supabase")

if __name__ == "__main__":
    # Cambiar al directorio raíz del proyecto
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    os.chdir(project_root)
    
    main()