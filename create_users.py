#!/usr/bin/env python3
"""
Script para crear usuarios de prueba con contraseñas hasheadas correctamente
"""

import asyncio
import sys
import os
from pathlib import Path

# Agregar el directorio backend al path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

from passlib.context import CryptContext
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Configuración de la base de datos
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/lpdp_db")

# Configuración de hash de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Genera hash de contraseña usando bcrypt"""
    return pwd_context.hash(password)

def create_users():
    """Crea usuarios de prueba en la base de datos"""
    
    # Crear engine de base de datos
    try:
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        print("🔍 Conectando a la base de datos...")
        
        # Verificar conexión
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✅ Conexión exitosa a la base de datos")
            
    except Exception as e:
        print(f"❌ Error conectando a la base de datos: {e}")
        print("💡 Asegúrate de que:")
        print("   1. La base de datos esté ejecutándose")
        print("   2. Las credenciales sean correctas")
        print("   3. La variable DATABASE_URL esté configurada")
        return False
    
    # Crear sesión
    db = SessionLocal()
    
    try:
        # Verificar si la tabla users existe
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'users'
                );
            """))
            table_exists = result.scalar()
            
            if not table_exists:
                print("❌ La tabla 'users' no existe")
                print("💡 Ejecuta primero las migraciones de Alembic:")
                print("   cd backend && alembic upgrade head")
                return False
        
        # Crear usuarios de prueba
        users_to_create = [
            {
                "username": "admin",
                "email": "admin@lpdp.cl",
                "password": "Admin123!",
                "first_name": "Administrador",
                "last_name": "Sistema",
                "is_superuser": True,
                "is_active": True,
                "tenant_id": None
            },
            {
                "username": "demo",
                "email": "demo@lpdp.cl", 
                "password": "Demo123!",
                "first_name": "Usuario",
                "last_name": "Demo",
                "is_superuser": False,
                "is_active": True,
                "tenant_id": None
            },
            {
                "username": "dpo",
                "email": "dpo@lpdp.cl",
                "password": "Dpo123!",
                "first_name": "Data",
                "last_name": "Protection Officer",
                "is_superuser": False,
                "is_active": True,
                "tenant_id": None
            }
        ]
        
        print("\n🔐 Creando usuarios de prueba...")
        
        for user_data in users_to_create:
            # Verificar si el usuario ya existe
            result = db.execute(text("SELECT id FROM users WHERE username = :username"), 
                              {"username": user_data["username"]})
            existing_user = result.fetchone()
            
            if existing_user:
                print(f"⚠️  Usuario {user_data['username']} ya existe, actualizando contraseña...")
                
                # Actualizar contraseña
                hashed_password = hash_password(user_data["password"])
                db.execute(text("""
                    UPDATE users 
                    SET hashed_password = :password, 
                        email = :email,
                        first_name = :first_name,
                        last_name = :last_name,
                        is_active = :is_active
                    WHERE username = :username
                """), {
                    "password": hashed_password,
                    "email": user_data["email"],
                    "first_name": user_data["first_name"],
                    "last_name": user_data["last_name"],
                    "is_active": user_data["is_active"],
                    "username": user_data["username"]
                })
                
            else:
                print(f"➕ Creando usuario {user_data['username']}...")
                
                # Crear nuevo usuario
                hashed_password = hash_password(user_data["password"])
                db.execute(text("""
                    INSERT INTO users (
                        username, email, hashed_password, first_name, last_name,
                        is_superuser, is_active, tenant_id, created_at, updated_at
                    ) VALUES (
                        :username, :email, :password, :first_name, :last_name,
                        :is_superuser, :is_active, :tenant_id, NOW(), NOW()
                    )
                """), {
                    "username": user_data["username"],
                    "email": user_data["email"],
                    "password": hashed_password,
                    "first_name": user_data["first_name"],
                    "last_name": user_data["last_name"],
                    "is_superuser": user_data["is_superuser"],
                    "is_active": user_data["is_active"],
                    "tenant_id": user_data["tenant_id"]
                })
        
        # Commit de los cambios
        db.commit()
        print("✅ Usuarios creados/actualizados exitosamente!")
        
        # Mostrar credenciales
        print("\n🎉 CREDENCIALES DE ACCESO:")
        print("=" * 50)
        
        for user_data in users_to_create:
            role = "SUPER ADMIN" if user_data["is_superuser"] else "USUARIO"
            print(f"\n👤 {user_data['first_name']} {user_data['last_name']} ({role})")
            print(f"   Username: {user_data['username']}")
            print(f"   Password: {user_data['password']}")
            print(f"   Email: {user_data['email']}")
        
        print("\n" + "=" * 50)
        print("💡 Puedes usar cualquiera de estas credenciales para acceder al sistema")
        print("🚀 El backend debe estar ejecutándose en http://localhost:8000")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creando usuarios: {e}")
        db.rollback()
        return False
        
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 CREADOR DE USUARIOS DE PRUEBA - SISTEMA LPDP")
    print("=" * 60)
    
    success = create_users()
    
    if success:
        print("\n🎯 Próximos pasos:")
        print("1. Asegúrate de que el backend esté ejecutándose")
        print("2. Usa las credenciales mostradas para hacer login")
        print("3. Si tienes problemas, verifica la conexión a la BD")
    else:
        print("\n❌ No se pudieron crear los usuarios")
        print("Revisa los errores mostrados arriba")
    
    print("\n" + "=" * 60)
