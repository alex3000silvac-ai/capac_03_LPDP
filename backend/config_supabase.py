# Configuración para Supabase
# Copia este archivo a .env y configura tus credenciales

import os

# Configuración de Supabase
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:[TU_PASSWORD_SUPABASE]@db.[TU_PROJECT_ID].supabase.co:5432/postgres"
)

# Configuración de JWT
SECRET_KEY = os.getenv(
    "SECRET_KEY", 
    "tu_clave_secreta_muy_larga_y_segura_aqui_cambiala_en_produccion"
)
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Configuración del sistema
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DEBUG = os.getenv("DEBUG", "true").lower() == "true"

# Configuración de CORS
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", 
    "https://scldp-frontend.onrender.com,http://localhost:3000"
).split(",")

# Configuración de Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://[TU_PROJECT_ID].supabase.co")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "[TU_ANON_KEY]")

print("🔧 Configuración cargada:")
print(f"   DATABASE_URL: {DATABASE_URL}")
print(f"   ENVIRONMENT: {ENVIRONMENT}")
print(f"   ALLOWED_ORIGINS: {ALLOWED_ORIGINS}")
print(f"   SUPABASE_URL: {SUPABASE_URL}")
