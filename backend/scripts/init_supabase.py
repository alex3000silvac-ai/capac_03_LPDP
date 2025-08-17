#!/usr/bin/env python3
"""
Script de inicialización de Supabase para el Sistema LPDP
Crea todas las tablas, roles, permisos y datos iniciales en Supabase
"""
import sys
import os
import asyncio
import logging
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor

# Agregar el directorio raíz al path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.core.security import get_password_hash

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_supabase_connection():
    """Obtiene conexión a Supabase"""
    try:
        # Usar la URL de Supabase desde config
        conn = psycopg2.connect(
            settings.database_url,
            cursor_factory=RealDictCursor
        )
        logger.info("✅ Conexión a Supabase exitosa")
        return conn
    except Exception as e:
        logger.error(f"❌ Error conectando a Supabase: {e}")
        raise

def create_tables(conn):
    """Crea todas las tablas del sistema"""
    logger.info("🏗️ Creando tablas del sistema...")
    
    # SQL para crear tablas
    tables_sql = [
        # Tabla de permisos
        """
        CREATE TABLE IF NOT EXISTS permissions (
            id SERIAL PRIMARY KEY,
            code VARCHAR(100) UNIQUE NOT NULL,
            name VARCHAR(200) NOT NULL,
            description TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        
        # Tabla de roles
        """
        CREATE TABLE IF NOT EXISTS roles (
            id SERIAL PRIMARY KEY,
            code VARCHAR(100) UNIQUE NOT NULL,
            name VARCHAR(200) NOT NULL,
            description TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        
        # Tabla de relación roles-permisos
        """
        CREATE TABLE IF NOT EXISTS role_permissions (
            id SERIAL PRIMARY KEY,
            role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
            permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(role_id, permission_id)
        );
        """,
        
        # Tabla de tenants
        """
        CREATE TABLE IF NOT EXISTS tenants (
            id VARCHAR(100) PRIMARY KEY,
            company_name VARCHAR(200) NOT NULL,
            schema_name VARCHAR(100),
            is_active BOOLEAN DEFAULT TRUE,
            is_trial BOOLEAN DEFAULT FALSE,
            max_users INTEGER DEFAULT 10,
            trial_expires_at TIMESTAMP,
            database_created BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        
        # Tabla de usuarios
        """
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(100) UNIQUE NOT NULL,
            email VARCHAR(200) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            is_active BOOLEAN DEFAULT TRUE,
            is_superuser BOOLEAN DEFAULT FALSE,
            is_verified BOOLEAN DEFAULT FALSE,
            tenant_id VARCHAR(100) REFERENCES tenants(id),
            encryption_key_id VARCHAR(100),
            password_reset_token VARCHAR(255),
            password_reset_expires TIMESTAMP,
            failed_login_attempts INTEGER DEFAULT 0,
            locked_until TIMESTAMP,
            last_login TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        
        # Tabla de relación usuarios-roles
        """
        CREATE TABLE IF NOT EXISTS user_roles (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, role_id)
        );
        """,
        
        # Tabla de empresas
        """
        CREATE TABLE IF NOT EXISTS empresas (
            id SERIAL PRIMARY KEY,
            rut VARCHAR(20) UNIQUE NOT NULL,
            nombre VARCHAR(200) NOT NULL,
            razon_social VARCHAR(200),
            giro VARCHAR(200),
            direccion TEXT,
            comuna VARCHAR(100),
            region VARCHAR(100),
            pais VARCHAR(100) DEFAULT 'Chile',
            telefono VARCHAR(50),
            email VARCHAR(200),
            sitio_web VARCHAR(200),
            is_active BOOLEAN DEFAULT TRUE,
            tenant_id VARCHAR(100) REFERENCES tenants(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        
        # Tabla de módulos de acceso
        """
        CREATE TABLE IF NOT EXISTS modulo_acceso (
            id SERIAL PRIMARY KEY,
            empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
            codigo_modulo VARCHAR(100) NOT NULL,
            nombre_modulo VARCHAR(200) NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            fecha_activacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            fecha_expiracion TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        
        # Tabla de licencias
        """
        CREATE TABLE IF NOT EXISTS licencias (
            id SERIAL PRIMARY KEY,
            empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
            modulo_id INTEGER REFERENCES modulo_acceso(id) ON DELETE CASCADE,
            codigo_licencia VARCHAR(100) UNIQUE NOT NULL,
            modulos TEXT[], -- Array de módulos
            fecha_activacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            fecha_expiracion TIMESTAMP,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        
        # Tabla de consentimientos
        """
        CREATE TABLE IF NOT EXISTS consentimientos (
            id SERIAL PRIMARY KEY,
            empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
            tipo_consentimiento VARCHAR(100) NOT NULL,
            descripcion TEXT,
            base_legal VARCHAR(200),
            fecha_obtencion TIMESTAMP,
            fecha_expiracion TIMESTAMP,
            estado VARCHAR(50) DEFAULT 'activo',
            tenant_id VARCHAR(100) REFERENCES tenants(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        
        # Tabla de ARCOPOL
        """
        CREATE TABLE IF NOT EXISTS arcopol (
            id SERIAL PRIMARY KEY,
            empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
            tipo_solicitud VARCHAR(100) NOT NULL,
            estado VARCHAR(50) DEFAULT 'pendiente',
            fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            fecha_respuesta TIMESTAMP,
            respuesta TEXT,
            tenant_id VARCHAR(100) REFERENCES tenants(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        
        # Tabla de inventario (RAT)
        """
        CREATE TABLE IF NOT EXISTS inventario (
            id SERIAL PRIMARY KEY,
            empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
            nombre_actividad VARCHAR(200) NOT NULL,
            descripcion TEXT,
            finalidad TEXT,
            base_legal VARCHAR(200),
            categoria_datos VARCHAR(100),
            origen_datos VARCHAR(100),
            destino_datos VARCHAR(100),
            tiempo_retencion VARCHAR(100),
            medidas_seguridad TEXT[],
            tenant_id VARCHAR(100) REFERENCES tenants(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        
        # Tabla de brechas
        """
        CREATE TABLE IF NOT EXISTS brechas (
            id SERIAL PRIMARY KEY,
            empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
            tipo_brecha VARCHAR(100) NOT NULL,
            descripcion TEXT,
            fecha_deteccion TIMESTAMP,
            fecha_notificacion TIMESTAMP,
            estado VARCHAR(50) DEFAULT 'investigando',
            impacto VARCHAR(100),
            medidas_mitigacion TEXT,
            tenant_id VARCHAR(100) REFERENCES tenants(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        
        # Tabla de DPIA
        """
        CREATE TABLE IF NOT EXISTS dpia (
            id SERIAL PRIMARY KEY,
            empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
            nombre_evaluacion VARCHAR(200) NOT NULL,
            descripcion TEXT,
            nivel_riesgo VARCHAR(50),
            fecha_evaluacion TIMESTAMP,
            estado VARCHAR(50) DEFAULT 'en_proceso',
            aprobado_por VARCHAR(100),
            fecha_aprobacion TIMESTAMP,
            tenant_id VARCHAR(100) REFERENCES tenants(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        
        # Tabla de transferencias
        """
        CREATE TABLE IF NOT EXISTS transferencias (
            id SERIAL PRIMARY KEY,
            empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
            tipo_transferencia VARCHAR(100) NOT NULL,
            pais_destino VARCHAR(100),
            entidad_receptora VARCHAR(200),
            base_legal VARCHAR(200),
            garantias TEXT,
            fecha_transferencia TIMESTAMP,
            estado VARCHAR(50) DEFAULT 'activa',
            tenant_id VARCHAR(100) REFERENCES tenants(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        
        # Tabla de auditoría
        """
        CREATE TABLE IF NOT EXISTS auditoria (
            id SERIAL PRIMARY KEY,
            empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
            tipo_evento VARCHAR(100) NOT NULL,
            descripcion TEXT,
            usuario_id INTEGER REFERENCES users(id),
            fecha_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ip_address VARCHAR(45),
            user_agent TEXT,
            datos_anteriores JSONB,
            datos_nuevos JSONB,
            tenant_id VARCHAR(100) REFERENCES tenants(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
    ]
    
    cursor = conn.cursor()
    try:
        for sql in tables_sql:
            cursor.execute(sql)
            logger.info("✅ Tabla creada/verificada")
        
        conn.commit()
        logger.info("✅ Todas las tablas creadas exitosamente")
        
    except Exception as e:
        conn.rollback()
        logger.error(f"❌ Error creando tablas: {e}")
        raise
    finally:
        cursor.close()

def create_permissions(conn):
    """Crea todos los permisos del sistema"""
    logger.info("🔐 Creando permisos del sistema...")
    
    permissions_data = [
        # Usuarios
        ("users.view", "Ver usuarios", "Permite ver la lista de usuarios"),
        ("users.create", "Crear usuarios", "Permite crear nuevos usuarios"),
        ("users.edit", "Editar usuarios", "Permite editar usuarios existentes"),
        ("users.delete", "Eliminar usuarios", "Permite eliminar usuarios"),
        ("users.manage", "Gestionar usuarios", "Permite gestionar usuarios del sistema"),
        ("users.reset_password", "Resetear contraseñas", "Permite resetear contraseñas de usuarios"),
        
        # Tenants
        ("tenants.view", "Ver tenants", "Permite ver información de tenants"),
        ("tenants.create", "Crear tenants", "Permite crear nuevos tenants"),
        ("tenants.edit", "Editar tenants", "Permite editar tenants existentes"),
        ("tenants.delete", "Eliminar tenants", "Permite eliminar tenants"),
        ("tenants.manage", "Gestionar tenants", "Permite gestionar tenants del sistema"),
        
        # Módulos
        ("consentimientos.view", "Ver consentimientos", "Acceso al módulo de consentimientos"),
        ("consentimientos.create", "Crear consentimientos", "Permite crear consentimientos"),
        ("consentimientos.edit", "Editar consentimientos", "Permite editar consentimientos"),
        ("consentimientos.delete", "Eliminar consentimientos", "Permite eliminar consentimientos"),
        ("consentimientos.manage", "Gestionar consentimientos", "Gestión completa de consentimientos"),
        
        ("arcopol.view", "Ver ARCOPOL", "Acceso al módulo ARCOPOL"),
        ("arcopol.create", "Crear solicitudes ARCOPOL", "Permite crear solicitudes ARCOPOL"),
        ("arcopol.edit", "Editar ARCOPOL", "Permite editar solicitudes ARCOPOL"),
        ("arcopol.delete", "Eliminar ARCOPOL", "Permite eliminar solicitudes ARCOPOL"),
        ("arcopol.manage", "Gestionar ARCOPOL", "Gestión completa de ARCOPOL"),
        
        ("inventario.view", "Ver inventario", "Acceso al módulo de inventario"),
        ("inventario.create", "Crear inventario", "Permite crear registros de inventario"),
        ("inventario.edit", "Editar inventario", "Permite editar inventario"),
        ("inventario.delete", "Eliminar inventario", "Permite eliminar inventario"),
        ("inventario.manage", "Gestionar inventario", "Gestión completa de inventario"),
        
        ("brechas.view", "Ver brechas", "Acceso al módulo de brechas"),
        ("brechas.create", "Crear brechas", "Permite crear registros de brechas"),
        ("brechas.edit", "Editar brechas", "Permite editar brechas"),
        ("brechas.delete", "Eliminar brechas", "Permite eliminar brechas"),
        ("brechas.manage", "Gestionar brechas", "Gestión completa de brechas"),
        
        ("dpia.view", "Ver DPIA", "Acceso al módulo DPIA"),
        ("dpia.create", "Crear DPIA", "Permite crear evaluaciones DPIA"),
        ("dpia.edit", "Editar DPIA", "Permite editar DPIA"),
        ("dpia.delete", "Eliminar DPIA", "Permite eliminar DPIA"),
        ("dpia.manage", "Gestionar DPIA", "Gestión completa de DPIA"),
        
        ("transferencias.view", "Ver transferencias", "Acceso al módulo de transferencias"),
        ("transferencias.create", "Crear transferencias", "Permite crear transferencias"),
        ("transferencias.edit", "Editar transferencias", "Permite editar transferencias"),
        ("transferencias.delete", "Eliminar transferencias", "Permite eliminar transferencias"),
        ("transferencias.manage", "Gestionar transferencias", "Gestión completa de transferencias"),
        
        ("auditoria.view", "Ver auditoría", "Acceso al módulo de auditoría"),
        ("auditoria.create", "Crear auditorías", "Permite crear auditorías"),
        ("auditoria.edit", "Editar auditorías", "Permite editar auditorías"),
        ("auditoria.delete", "Eliminar auditorías", "Permite eliminar auditorías"),
        ("auditoria.manage", "Gestionar auditoría", "Gestión completa de auditoría"),
        
        # Administración
        ("admin.view", "Ver administración", "Acceso al panel de administración"),
        ("admin.manage", "Gestionar administración", "Gestión completa del sistema"),
        ("admin.comercial", "Administración comercial", "Acceso a funciones comerciales"),
        ("admin.system", "Administración del sistema", "Acceso a configuración del sistema"),
        
        # Reportes
        ("reportes.view", "Ver reportes", "Acceso a reportes del sistema"),
        ("reportes.create", "Crear reportes", "Permite crear reportes personalizados"),
        ("reportes.export", "Exportar reportes", "Permite exportar reportes"),
        
        # Configuración
        ("config.view", "Ver configuración", "Acceso a configuración del sistema"),
        ("config.edit", "Editar configuración", "Permite editar configuración del sistema"),
    ]
    
    cursor = conn.cursor()
    try:
        for code, name, description in permissions_data:
            cursor.execute("""
                INSERT INTO permissions (code, name, description)
                VALUES (%s, %s, %s)
                ON CONFLICT (code) DO NOTHING
            """, (code, name, description))
        
        conn.commit()
        logger.info(f"✅ {len(permissions_data)} permisos creados/verificados")
        
    except Exception as e:
        conn.rollback()
        logger.error(f"❌ Error creando permisos: {e}")
        raise
    finally:
        cursor.close()

def create_roles(conn):
    """Crea todos los roles del sistema"""
    logger.info("👥 Creando roles del sistema...")
    
    cursor = conn.cursor()
    try:
        # Obtener todos los permisos
        cursor.execute("SELECT id, code FROM permissions")
        permissions = {row['code']: row['id'] for row in cursor.fetchall()}
        
        # Crear roles
        roles_data = [
            ("superadmin", "Superadministrador", "Acceso completo al sistema"),
            ("admin", "Administrador", "Administrador de empresa"),
            ("user", "Usuario", "Usuario estándar del sistema"),
            ("dpo", "DPO", "Data Protection Officer"),
        ]
        
        for code, name, description in roles_data:
            cursor.execute("""
                INSERT INTO roles (code, name, description)
                VALUES (%s, %s, %s)
                ON CONFLICT (code) DO NOTHING
                RETURNING id
            """, (code, name, description))
            
            result = cursor.fetchone()
            if result:
                role_id = result['id']
                
                # Asignar permisos según el rol
                if code == "superadmin":
                    # Todos los permisos
                    for perm_id in permissions.values():
                        cursor.execute("""
                            INSERT INTO role_permissions (role_id, permission_id)
                            VALUES (%s, %s)
                            ON CONFLICT DO NOTHING
                        """, (role_id, perm_id))
                
                elif code == "admin":
                    # Permisos administrativos
                    admin_permissions = [
                        "users.view", "users.create", "users.edit", "users.manage",
                        "tenants.view", "tenants.edit",
                        "consentimientos.manage", "arcopol.manage", "inventario.manage",
                        "brechas.manage", "dpia.manage", "transferencias.manage", "auditoria.manage",
                        "reportes.view", "reportes.export", "config.view", "config.edit"
                    ]
                    for perm_code in admin_permissions:
                        if perm_code in permissions:
                            cursor.execute("""
                                INSERT INTO role_permissions (role_id, permission_id)
                                VALUES (%s, %s)
                                ON CONFLICT DO NOTHING
                            """, (role_id, permissions[perm_code]))
                
                elif code == "user":
                    # Permisos básicos
                    user_permissions = [
                        "consentimientos.view", "consentimientos.create", "consentimientos.edit",
                        "arcopol.view", "arcopol.create", "arcopol.edit",
                        "inventario.view", "inventario.create", "inventario.edit",
                        "brechas.view", "brechas.create", "brechas.edit",
                        "dpia.view", "dpia.create", "dpia.edit",
                        "transferencias.view", "transferencias.create", "transferencias.edit",
                        "auditoria.view", "auditoria.create", "auditoria.edit",
                        "reportes.view"
                    ]
                    for perm_code in user_permissions:
                        if perm_code in permissions:
                            cursor.execute("""
                                INSERT INTO role_permissions (role_id, permission_id)
                                VALUES (%s, %s)
                                ON CONFLICT DO NOTHING
                            """, (role_id, permissions[perm_code]))
                
                elif code == "dpo":
                    # Permisos de DPO
                    dpo_permissions = [
                        "consentimientos.manage", "arcopol.manage", "inventario.manage",
                        "brechas.manage", "dpia.manage", "transferencias.manage", "auditoria.manage",
                        "reportes.view", "reportes.create", "reportes.export",
                        "config.view", "config.edit"
                    ]
                    for perm_code in dpo_permissions:
                        if perm_code in permissions:
                            cursor.execute("""
                                INSERT INTO role_permissions (role_id, permission_id)
                                VALUES (%s, %s)
                                ON CONFLICT DO NOTHING
                            """, (role_id, permissions[perm_code]))
        
        conn.commit()
        logger.info("✅ Roles del sistema creados exitosamente")
        
    except Exception as e:
        conn.rollback()
        logger.error(f"❌ Error creando roles: {e}")
        raise
    finally:
        cursor.close()

def create_demo_tenant(conn):
    """Crea el tenant de demostración"""
    logger.info("🏢 Creando tenant de demostración...")
    
    cursor = conn.cursor()
    try:
        # Verificar si ya existe
        cursor.execute("SELECT id FROM tenants WHERE id = 'demo'")
        if cursor.fetchone():
            logger.info("✅ Tenant demo ya existe")
            return
        
        # Crear tenant
        cursor.execute("""
            INSERT INTO tenants (id, company_name, schema_name, is_active, is_trial, max_users, trial_expires_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            "demo",
            "Empresa Demo LPDP",
            "tenant_demo",
            True,
            True,
            10,
            datetime.utcnow() + timedelta(days=30)
        ))
        
        conn.commit()
        logger.info("✅ Tenant demo creado exitosamente")
        
    except Exception as e:
        conn.rollback()
        logger.error(f"❌ Error creando tenant demo: {e}")
        raise
    finally:
        cursor.close()

def create_superuser(conn):
    """Crea el usuario superadministrador"""
    logger.info("👑 Creando superusuario...")
    
    cursor = conn.cursor()
    try:
        # Verificar si ya existe
        cursor.execute("SELECT id FROM users WHERE username = 'admin'")
        if cursor.fetchone():
            logger.info("✅ Superusuario ya existe")
            return
        
        # Obtener rol superadmin
        cursor.execute("SELECT id FROM roles WHERE code = 'superadmin'")
        superadmin_role = cursor.fetchone()
        if not superadmin_role:
            logger.error("❌ Rol superadmin no encontrado")
            return
        
        # Crear superusuario
        cursor.execute("""
            INSERT INTO users (username, email, password_hash, first_name, last_name, is_active, is_superuser, is_verified, tenant_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            "admin",
            "admin@lpdp.cl",
            get_password_hash("Admin123!"),
            "Super",
            "Administrador",
            True,
            True,
            True,
            "demo"
        ))
        
        user_id = cursor.fetchone()['id']
        
        # Asignar rol
        cursor.execute("""
            INSERT INTO user_roles (user_id, role_id)
            VALUES (%s, %s)
        """, (user_id, superadmin_role['id']))
        
        conn.commit()
        logger.info("✅ Superusuario creado: admin / Admin123!")
        
    except Exception as e:
        conn.rollback()
        logger.error(f"❌ Error creando superusuario: {e}")
        raise
    finally:
        cursor.close()

def create_demo_users(conn):
    """Crea usuarios de demostración"""
    logger.info("👤 Creando usuarios de demostración...")
    
    cursor = conn.cursor()
    try:
        # Obtener roles
        cursor.execute("SELECT id, code FROM roles WHERE code IN ('admin', 'user', 'dpo')")
        roles = {row['code']: row['id'] for row in cursor.fetchall()}
        
        demo_users = [
            ("gerente", "gerente@demo.cl", "Gerente123!", "Juan", "Pérez", "admin"),
            ("dpo", "dpo@demo.cl", "DPO123!", "María", "González", "dpo"),
            ("usuario1", "usuario1@demo.cl", "Usuario123!", "Carlos", "Rodríguez", "user"),
            ("usuario2", "usuario2@demo.cl", "Usuario123!", "Ana", "Silva", "user")
        ]
        
        for username, email, password, first_name, last_name, role_code in demo_users:
            # Verificar si ya existe
            cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
            if cursor.fetchone():
                logger.info(f"✅ Usuario {username} ya existe")
                continue
            
            # Crear usuario
            cursor.execute("""
                INSERT INTO users (username, email, password_hash, first_name, last_name, is_active, is_verified, tenant_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                username, email, get_password_hash(password), first_name, last_name, True, True, "demo"
            ))
            
            user_id = cursor.fetchone()['id']
            
            # Asignar rol
            if role_code in roles:
                cursor.execute("""
                    INSERT INTO user_roles (user_id, role_id)
                    VALUES (%s, %s)
                """, (user_id, roles[role_code]))
            
            logger.info(f"✅ Usuario creado: {username} / {password}")
        
        conn.commit()
        logger.info("✅ Usuarios de demostración creados exitosamente")
        
    except Exception as e:
        conn.rollback()
        logger.error(f"❌ Error creando usuarios demo: {e}")
        raise
    finally:
        cursor.close()

def create_demo_empresa(conn):
    """Crea empresa de demostración"""
    logger.info("🏭 Creando empresa de demostración...")
    
    cursor = conn.cursor()
    try:
        # Verificar si ya existe
        cursor.execute("SELECT id FROM empresas WHERE rut = '12345678-9'")
        if cursor.fetchone():
            logger.info("✅ Empresa demo ya existe")
            return
        
        # Crear empresa
        cursor.execute("""
            INSERT INTO empresas (rut, nombre, razon_social, giro, direccion, comuna, region, pais, telefono, email, sitio_web, tenant_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            "12345678-9",
            "Empresa Demo LPDP",
            "Empresa Demo LPDP SpA",
            "Servicios de Tecnología",
            "Av. Providencia 1234, Providencia, Santiago",
            "Providencia",
            "Metropolitana",
            "Chile",
            "+56 2 2345 6789",
            "contacto@demo.cl",
            "https://demo.lpdp.cl",
            "demo"
        ))
        
        empresa_id = cursor.fetchone()['id']
        
        # Crear acceso a módulos
        modulos = ["consentimientos", "arcopol", "inventario", "brechas", "dpia", "transferencias", "auditoria"]
        for modulo in modulos:
            cursor.execute("""
                INSERT INTO modulo_acceso (empresa_id, codigo_modulo, nombre_modulo, is_active, fecha_expiracion)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            """, (
                empresa_id, modulo, modulo.title(), True, datetime.utcnow() + timedelta(days=365)
            ))
            
            modulo_id = cursor.fetchone()['id']
            
            # Crear licencia
            cursor.execute("""
                INSERT INTO licencias (empresa_id, modulo_id, codigo_licencia, modulos, fecha_expiracion, is_active)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                empresa_id, modulo_id, f"LIC-{modulo.upper()}-2024", [modulo], 
                datetime.utcnow() + timedelta(days=365), True
            ))
        
        conn.commit()
        logger.info("✅ Empresa demo y módulos creados exitosamente")
        
    except Exception as e:
        conn.rollback()
        logger.error(f"❌ Error creando empresa demo: {e}")
        raise
    finally:
        cursor.close()

def main():
    """Función principal de inicialización"""
    logger.info("🚀 Iniciando inicialización de Supabase...")
    
    try:
        # 1. Conectar a Supabase
        conn = get_supabase_connection()
        
        # 2. Crear tablas
        create_tables(conn)
        
        # 3. Crear permisos
        create_permissions(conn)
        
        # 4. Crear roles
        create_roles(conn)
        
        # 5. Crear tenant demo
        create_demo_tenant(conn)
        
        # 6. Crear superusuario
        create_superuser(conn)
        
        # 7. Crear usuarios demo
        create_demo_users(conn)
        
        # 8. Crear empresa demo
        create_demo_empresa(conn)
        
        conn.close()
        
        logger.info("🎉 ¡Inicialización de Supabase completada exitosamente!")
        logger.info("")
        logger.info("📋 CREDENCIALES DE ACCESO:")
        logger.info("   Superusuario: admin / Admin123!")
        logger.info("   Gerente: gerente / Gerente123!")
        logger.info("   DPO: dpo / DPO123!")
        logger.info("   Usuario 1: usuario1 / Usuario123!")
        logger.info("   Usuario 2: usuario2 / Usuario123!")
        logger.info("")
        logger.info("🌐 Sistema listo para usar en Render!")
        
    except Exception as e:
        logger.error(f"❌ Error durante la inicialización: {e}")
        raise

if __name__ == "__main__":
    main()
