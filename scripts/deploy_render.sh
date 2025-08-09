#!/bin/bash
# Script de deployment para Render.com

echo "🚀 Iniciando deployment del Sistema de Capacitación LPDP..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar que estamos en el directorio correcto
if [ ! -f "requirements.txt" ]; then
    echo -e "${RED}❌ Error: No se encuentra requirements.txt${NC}"
    echo "Asegúrate de ejecutar este script desde la raíz del proyecto"
    exit 1
fi

# 1. Actualizar dependencias
echo -e "${YELLOW}📦 Actualizando requirements.txt...${NC}"
cat > requirements.txt << EOF
# Core
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-dotenv==1.0.0

# Database
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
alembic==1.12.1

# Validation
pydantic==2.5.0
pydantic-settings==2.1.0
email-validator==2.1.0

# Security
cryptography==41.0.7

# Utilities
httpx==0.25.2
python-dateutil==2.8.2

# Development
pytest==7.4.3
pytest-asyncio==0.21.1
black==23.11.0
flake8==6.1.0
EOF

echo -e "${GREEN}✅ requirements.txt actualizado${NC}"

# 2. Crear archivo de configuración para Render
echo -e "${YELLOW}📝 Creando render.yaml...${NC}"
cat > render.yaml << EOF
services:
  - type: web
    name: lpdp-capacitacion-api
    runtime: python
    buildCommand: "pip install -r requirements.txt"
    startCommand: "uvicorn app.main:app --host 0.0.0.0 --port \$PORT"
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: lpdp-db
          property: connectionString
      - key: SECRET_KEY
        generateValue: true
      - key: LICENSE_ENCRYPTION_KEY
        generateValue: true
      - key: ENVIRONMENT
        value: production
      - key: DEBUG
        value: false
      - key: PYTHONPATH
        value: /opt/render/project/src/backend

databases:
  - name: lpdp-db
    databaseName: lpdp_capacitacion
    user: lpdp_admin
    region: oregon
    plan: starter
    postgresMajorVersion: 15
EOF

echo -e "${GREEN}✅ render.yaml creado${NC}"

# 3. Actualizar estructura de directorios para Render
echo -e "${YELLOW}📁 Preparando estructura de directorios...${NC}"

# Asegurar que backend esté en la raíz para Render
if [ -d "backend" ] && [ ! -d "app" ]; then
    echo "Creando enlaces simbólicos para Render..."
    ln -sf backend/app app
fi

# 4. Crear script de inicialización de BD
echo -e "${YELLOW}🗄️ Creando script de inicialización de BD...${NC}"
cat > init_db.py << EOF
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
EOF

echo -e "${GREEN}✅ Script de inicialización creado${NC}"

# 5. Crear archivo .env.example
echo -e "${YELLOW}🔐 Creando .env.example...${NC}"
cat > .env.example << EOF
# Database
DATABASE_URL=postgresql://user:password@localhost/lpdp_capacitacion

# Security
SECRET_KEY=your-secret-key-here-change-in-production
LICENSE_ENCRYPTION_KEY=your-license-key-here-change-in-production

# Environment
ENVIRONMENT=development
DEBUG=true

# Admin
ADMIN_EMAIL=admin@juridicadigital.cl
ADMIN_PASSWORD=Admin123!@#

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EOF

echo -e "${GREEN}✅ .env.example creado${NC}"

# 6. Actualizar README con instrucciones
echo -e "${YELLOW}📚 Actualizando README...${NC}"
cat > README_DEPLOYMENT.md << EOF
# 🚀 Deployment en Render

## Sistema de Capacitación LPDP - Ley 21.719

### 1. Configuración Inicial en Render

1. **Crear cuenta en Render.com**
2. **Conectar con GitHub**
3. **Crear nuevo Web Service**:
   - Seleccionar este repositorio
   - Runtime: Python 3.11
   - Build Command: \`pip install -r requirements.txt\`
   - Start Command: \`uvicorn app.main:app --host 0.0.0.0 --port \$PORT\`

### 2. Variables de Entorno Requeridas

En Render Dashboard > Environment:

\`\`\`
DATABASE_URL=<auto-generada-por-render>
SECRET_KEY=<generar-con-openssl-rand-hex-32>
LICENSE_ENCRYPTION_KEY=<generar-con-openssl-rand-hex-32>
ENVIRONMENT=production
DEBUG=false
PYTHONPATH=/opt/render/project/src/backend
\`\`\`

### 3. Base de Datos

1. Crear PostgreSQL en Render (Plan Starter)
2. Conectar con el Web Service
3. Ejecutar script de inicialización:

\`\`\`bash
python init_db.py
\`\`\`

### 4. Verificación

- API Docs: https://tu-app.onrender.com/docs
- Health Check: https://tu-app.onrender.com/health

### 5. Administración

**Usuario Admin por defecto:**
- Email: admin@juridicadigital.cl
- Password: Admin123!@#

**Empresa Demo:**
- Dominio: demo.juridicadigital.cl
- Todos los módulos activos
- 50 usuarios disponibles

### 📋 Módulos del Sistema

1. **MOD-1**: Gestión de Consentimientos
2. **MOD-2**: Derechos ARCOPOL
3. **MOD-3**: Inventario de Datos
4. **MOD-4**: Gestión de Brechas
5. **MOD-5**: Evaluaciones DPIA
6. **MOD-6**: Transferencias Internacionales
7. **MOD-7**: Auditoría y Cumplimiento

### 🛠️ Comandos Útiles

\`\`\`bash
# Ver logs
render logs

# Ejecutar migraciones
python -m alembic upgrade head

# Crear superusuario
python scripts/create_superuser.py

# Inicializar empresa
python scripts/init_empresa.py --rut "76.xxx.xxx-x" --nombre "Mi Empresa"
\`\`\`
EOF

echo -e "${GREEN}✅ README_DEPLOYMENT.md creado${NC}"

# 7. Git add y status
echo -e "${YELLOW}📦 Preparando cambios para Git...${NC}"
git add -A
git status

echo -e "${GREEN}✅ Archivos listos para commit${NC}"
echo ""
echo -e "${YELLOW}📌 Próximos pasos:${NC}"
echo "1. Revisar los cambios con: git status"
echo "2. Hacer commit: git commit -m 'feat: sistema completo de capacitación LPDP multi-tenant'"
echo "3. Push a GitHub: git push origin main"
echo "4. En Render.com:"
echo "   - New > Web Service > Seleccionar este repo"
echo "   - Configurar variables de entorno"
echo "   - Deploy!"
echo ""
echo -e "${GREEN}✨ ¡Sistema listo para deployment!${NC}"