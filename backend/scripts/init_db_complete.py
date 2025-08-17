#!/usr/bin/env python3
"""
Script completo de inicialización de base de datos para el Sistema LPDP
Crea todas las tablas, roles, permisos y datos iniciales
"""
import sys
import os
import asyncio
from datetime import datetime, timedelta
import logging

# Agregar el directorio raíz al path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import init_database, get_master_db_context
from app.core.security import get_password_hash, generate_license_key
from app.core.config import settings
from app.models import Base
from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission
from app.models.tenant import Tenant
from app.models.empresa import Empresa, ModuloAcceso, Licencia

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def create_permissions():
    """Crea todos los permisos del sistema"""
    logger.info("🔐 Creando permisos del sistema...")
    
    permissions_data = [
        # Usuarios
        {"code": "users.view", "name": "Ver usuarios", "description": "Permite ver la lista de usuarios"},
        {"code": "users.create", "name": "Crear usuarios", "description": "Permite crear nuevos usuarios"},
        {"code": "users.edit", "name": "Editar usuarios", "description": "Permite editar usuarios existentes"},
        {"code": "users.delete", "name": "Eliminar usuarios", "description": "Permite eliminar usuarios"},
        {"code": "users.manage", "name": "Gestionar usuarios", "description": "Permite gestionar usuarios del sistema"},
        {"code": "users.reset_password", "name": "Resetear contraseñas", "description": "Permite resetear contraseñas de usuarios"},
        
        # Tenants
        {"code": "tenants.view", "name": "Ver tenants", "description": "Permite ver información de tenants"},
        {"code": "tenants.create", "name": "Crear tenants", "description": "Permite crear nuevos tenants"},
        {"code": "tenants.edit", "name": "Editar tenants", "description": "Permite editar tenants existentes"},
        {"code": "tenants.delete", "name": "Eliminar tenants", "description": "Permite eliminar tenants"},
        {"code": "tenants.manage", "name": "Gestionar tenants", "description": "Permite gestionar tenants del sistema"},
        
        # Módulos
        {"code": "consentimientos.view", "name": "Ver consentimientos", "description": "Acceso al módulo de consentimientos"},
        {"code": "consentimientos.create", "name": "Crear consentimientos", "description": "Permite crear consentimientos"},
        {"code": "consentimientos.edit", "name": "Editar consentimientos", "description": "Permite editar consentimientos"},
        {"code": "consentimientos.delete", "name": "Eliminar consentimientos", "description": "Permite eliminar consentimientos"},
        {"code": "consentimientos.manage", "name": "Gestionar consentimientos", "description": "Gestión completa de consentimientos"},
        
        {"code": "arcopol.view", "name": "Ver ARCOPOL", "description": "Acceso al módulo ARCOPOL"},
        {"code": "arcopol.create", "name": "Crear solicitudes ARCOPOL", "description": "Permite crear solicitudes ARCOPOL"},
        {"code": "arcopol.edit", "name": "Editar ARCOPOL", "description": "Permite editar solicitudes ARCOPOL"},
        {"code": "arcopol.delete", "name": "Eliminar ARCOPOL", "description": "Permite eliminar solicitudes ARCOPOL"},
        {"code": "arcopol.manage", "name": "Gestionar ARCOPOL", "description": "Gestión completa de ARCOPOL"},
        
        {"code": "inventario.view", "name": "Ver inventario", "description": "Acceso al módulo de inventario"},
        {"code": "inventario.create", "name": "Crear inventario", "description": "Permite crear registros de inventario"},
        {"code": "inventario.edit", "name": "Editar inventario", "description": "Permite editar inventario"},
        {"code": "inventario.delete", "name": "Eliminar inventario", "description": "Permite eliminar inventario"},
        {"code": "inventario.manage", "name": "Gestionar inventario", "description": "Gestión completa de inventario"},
        
        {"code": "brechas.view", "name": "Ver brechas", "description": "Acceso al módulo de brechas"},
        {"code": "brechas.create", "name": "Crear brechas", "description": "Permite crear registros de brechas"},
        {"code": "brechas.edit", "name": "Editar brechas", "description": "Permite editar brechas"},
        {"code": "brechas.delete", "name": "Eliminar brechas", "description": "Permite eliminar brechas"},
        {"code": "brechas.manage", "name": "Gestionar brechas", "description": "Gestión completa de brechas"},
        
        {"code": "dpia.view", "name": "Ver DPIA", "description": "Acceso al módulo DPIA"},
        {"code": "dpia.create", "name": "Crear DPIA", "description": "Permite crear evaluaciones DPIA"},
        {"code": "dpia.edit", "name": "Editar DPIA", "description": "Permite editar DPIA"},
        {"code": "dpia.delete", "name": "Eliminar DPIA", "description": "Permite eliminar DPIA"},
        {"code": "dpia.manage", "name": "Gestionar DPIA", "description": "Gestión completa de DPIA"},
        
        {"code": "transferencias.view", "name": "Ver transferencias", "description": "Acceso al módulo de transferencias"},
        {"code": "transferencias.create", "name": "Crear transferencias", "description": "Permite crear transferencias"},
        {"code": "transferencias.edit", "name": "Editar transferencias", "description": "Permite editar transferencias"},
        {"code": "transferencias.delete", "name": "Eliminar transferencias", "description": "Permite eliminar transferencias"},
        {"code": "transferencias.manage", "name": "Gestionar transferencias", "description": "Gestión completa de transferencias"},
        
        {"code": "auditoria.view", "name": "Ver auditoría", "description": "Acceso al módulo de auditoría"},
        {"code": "auditoria.create", "name": "Crear auditorías", "description": "Permite crear auditorías"},
        {"code": "auditoria.edit", "name": "Editar auditorías", "description": "Permite editar auditorías"},
        {"code": "auditoria.delete", "name": "Eliminar auditorías", "description": "Permite eliminar auditorías"},
        {"code": "auditoria.manage", "name": "Gestionar auditoría", "description": "Gestión completa de auditoría"},
        
        # Administración
        {"code": "admin.view", "name": "Ver administración", "description": "Acceso al panel de administración"},
        {"code": "admin.manage", "name": "Gestionar administración", "description": "Gestión completa del sistema"},
        {"code": "admin.comercial", "name": "Administración comercial", "description": "Acceso a funciones comerciales"},
        {"code": "admin.system", "name": "Administración del sistema", "description": "Acceso a configuración del sistema"},
        
        # Reportes
        {"code": "reportes.view", "name": "Ver reportes", "description": "Acceso a reportes del sistema"},
        {"code": "reportes.create", "name": "Crear reportes", "description": "Permite crear reportes personalizados"},
        {"code": "reportes.export", "name": "Exportar reportes", "description": "Permite exportar reportes"},
        
        # Configuración
        {"code": "config.view", "name": "Ver configuración", "description": "Acceso a configuración del sistema"},
        {"code": "config.edit", "name": "Editar configuración", "description": "Permite editar configuración del sistema"},
    ]
    
    with get_master_db_context() as db:
        for perm_data in permissions_data:
            existing = db.query(Permission).filter(Permission.code == perm_data["code"]).first()
            if not existing:
                permission = Permission(**perm_data)
                db.add(permission)
                logger.info(f"✅ Permiso creado: {perm_data['code']}")
        
        db.commit()
        logger.info(f"✅ {len(permissions_data)} permisos creados")

async def create_roles():
    """Crea todos los roles del sistema"""
    logger.info("👥 Creando roles del sistema...")
    
    with get_master_db_context() as db:
        # Obtener todos los permisos
        all_permissions = db.query(Permission).all()
        permissions_dict = {p.code: p for p in all_permissions}
        
        # Rol Superadministrador
        superadmin_role = db.query(Role).filter(Role.code == "superadmin").first()
        if not superadmin_role:
            superadmin_role = Role(
                code="superadmin",
                name="Superadministrador",
                description="Acceso completo al sistema",
                is_active=True
            )
            db.add(superadmin_role)
            # Todos los permisos
            superadmin_role.permissions = list(permissions_dict.values())
            logger.info("✅ Rol Superadministrador creado")
        
        # Rol Administrador
        admin_role = db.query(Role).filter(Role.code == "admin").first()
        if not admin_role:
            admin_role = Role(
                code="admin",
                name="Administrador",
                description="Administrador de empresa",
                is_active=True
            )
            db.add(admin_role)
            # Permisos administrativos
            admin_permissions = [
                "users.view", "users.create", "users.edit", "users.manage",
                "tenants.view", "tenants.edit",
                "consentimientos.manage", "arcopol.manage", "inventario.manage",
                "brechas.manage", "dpia.manage", "transferencias.manage", "auditoria.manage",
                "reportes.view", "reportes.export", "config.view", "config.edit"
            ]
            admin_role.permissions = [permissions_dict[p] for p in admin_permissions if p in permissions_dict]
            logger.info("✅ Rol Administrador creado")
        
        # Rol Usuario
        user_role = db.query(Role).filter(Role.code == "user").first()
        if not user_role:
            user_role = Role(
                code="user",
                name="Usuario",
                description="Usuario estándar del sistema",
                is_active=True
            )
            db.add(user_role)
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
            user_role.permissions = [permissions_dict[p] for p in user_permissions if p in permissions_dict]
            logger.info("✅ Rol Usuario creado")
        
        # Rol DPO (Data Protection Officer)
        dpo_role = db.query(Role).filter(Role.code == "dpo").first()
        if not dpo_role:
            dpo_role = Role(
                code="dpo",
                name="DPO",
                description="Data Protection Officer",
                is_active=True
            )
            db.add(dpo_role)
            # Permisos de DPO
            dpo_permissions = [
                "consentimientos.manage", "arcopol.manage", "inventario.manage",
                "brechas.manage", "dpia.manage", "transferencias.manage", "auditoria.manage",
                "reportes.view", "reportes.create", "reportes.export",
                "config.view", "config.edit"
            ]
            dpo_role.permissions = [permissions_dict[p] for p in dpo_permissions if p in permissions_dict]
            logger.info("✅ Rol DPO creado")
        
        db.commit()
        logger.info("✅ Roles del sistema creados")

async def create_demo_tenant():
    """Crea el tenant de demostración"""
    logger.info("🏢 Creando tenant de demostración...")
    
    with get_master_db_context() as db:
        # Verificar si ya existe
        existing_tenant = db.query(Tenant).filter(Tenant.id == "demo").first()
        if existing_tenant:
            logger.info("✅ Tenant demo ya existe")
            return existing_tenant
        
        # Crear tenant
        demo_tenant = Tenant(
            id="demo",
            company_name="Empresa Demo LPDP",
            schema_name="tenant_demo",
            is_active=True,
            is_trial=True,
            max_users=10,
            trial_expires_at=datetime.utcnow() + timedelta(days=30),
            database_created=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(demo_tenant)
        db.commit()
        
        logger.info("✅ Tenant demo creado")
        return demo_tenant

async def create_superuser():
    """Crea el usuario superadministrador"""
    logger.info("👑 Creando superusuario...")
    
    with get_master_db_context() as db:
        # Verificar si ya existe
        existing_superuser = db.query(User).filter(User.username == "admin").first()
        if existing_superuser:
            logger.info("✅ Superusuario ya existe")
            return existing_superuser
        
        # Obtener rol superadmin
        superadmin_role = db.query(Role).filter(Role.code == "superadmin").first()
        if not superadmin_role:
            logger.error("❌ Rol superadmin no encontrado")
            return None
        
        # Crear superusuario
        superuser = User(
            username="admin",
            email="admin@lpdp.cl",
            password_hash=get_password_hash("Admin123!"),
            first_name="Super",
            last_name="Administrador",
            is_active=True,
            is_superuser=True,
            is_verified=True,
            tenant_id="demo",  # Asignar al tenant demo
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Asignar rol
        superuser.roles = [superadmin_role]
        
        db.add(superuser)
        db.commit()
        
        logger.info("✅ Superusuario creado: admin / Admin123!")
        return superuser

async def create_demo_users():
    """Crea usuarios de demostración"""
    logger.info("👤 Creando usuarios de demostración...")
    
    with get_master_db_context() as db:
        # Obtener roles
        admin_role = db.query(Role).filter(Role.code == "admin").first()
        user_role = db.query(Role).filter(Role.code == "user").first()
        dpo_role = db.query(Role).filter(Role.code == "dpo").first()
        
        demo_users = [
            {
                "username": "gerente",
                "email": "gerente@demo.cl",
                "password": "Gerente123!",
                "first_name": "Juan",
                "last_name": "Pérez",
                "role": admin_role,
                "description": "Gerente de la empresa"
            },
            {
                "username": "dpo",
                "email": "dpo@demo.cl",
                "password": "DPO123!",
                "first_name": "María",
                "last_name": "González",
                "role": dpo_role,
                "description": "Data Protection Officer"
            },
            {
                "username": "usuario1",
                "email": "usuario1@demo.cl",
                "password": "Usuario123!",
                "first_name": "Carlos",
                "last_name": "Rodríguez",
                "role": user_role,
                "description": "Usuario estándar"
            },
            {
                "username": "usuario2",
                "email": "usuario2@demo.cl",
                "password": "Usuario123!",
                "first_name": "Ana",
                "last_name": "Silva",
                "role": user_role,
                "description": "Usuario estándar"
            }
        ]
        
        for user_data in demo_users:
            existing = db.query(User).filter(User.username == user_data["username"]).first()
            if not existing:
                user = User(
                    username=user_data["username"],
                    email=user_data["email"],
                    password_hash=get_password_hash(user_data["password"]),
                    first_name=user_data["first_name"],
                    last_name=user_data["last_name"],
                    is_active=True,
                    is_verified=True,
                    tenant_id="demo",
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                
                # Asignar rol
                user.roles = [user_data["role"]]
                
                db.add(user)
                logger.info(f"✅ Usuario creado: {user_data['username']} / {user_data['password']}")
        
        db.commit()
        logger.info("✅ Usuarios de demostración creados")

async def create_demo_empresa():
    """Crea empresa de demostración"""
    logger.info("🏭 Creando empresa de demostración...")
    
    with get_master_db_context() as db:
        # Verificar si ya existe
        existing_empresa = db.query(Empresa).filter(Empresa.rut == "12345678-9").first()
        if existing_empresa:
            logger.info("✅ Empresa demo ya existe")
            return existing_empresa
        
        # Crear empresa
        empresa = Empresa(
            rut="12345678-9",
            nombre="Empresa Demo LPDP",
            razon_social="Empresa Demo LPDP SpA",
            giro="Servicios de Tecnología",
            direccion="Av. Providencia 1234, Providencia, Santiago",
            comuna="Providencia",
            region="Metropolitana",
            pais="Chile",
            telefono="+56 2 2345 6789",
            email="contacto@demo.cl",
            sitio_web="https://demo.lpdp.cl",
            is_active=True,
            tenant_id="demo",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(empresa)
        db.commit()
        
        # Crear acceso a módulos
        modulos = ["consentimientos", "arcopol", "inventario", "brechas", "dpia", "transferencias", "auditoria"]
        for modulo in modulos:
            modulo_acceso = ModuloAcceso(
                empresa_id=empresa.id,
                codigo_modulo=modulo,
                nombre_modulo=modulo.title(),
                is_active=True,
                fecha_activacion=datetime.utcnow(),
                fecha_expiracion=datetime.utcnow() + timedelta(days=365),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(modulo_acceso)
            
            # Crear licencia
            licencia = Licencia(
                empresa_id=empresa.id,
                modulo_id=modulo_acceso.id,
                codigo_licencia=generate_license_key(empresa.nombre, modulo, "2024-12-31"),
                modulos=[modulo],
                fecha_activacion=datetime.utcnow(),
                fecha_expiracion=datetime.utcnow() + timedelta(days=365),
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(licencia)
        
        db.commit()
        logger.info("✅ Empresa demo y módulos creados")

async def main():
    """Función principal de inicialización"""
    logger.info("🚀 Iniciando inicialización completa de la base de datos...")
    
    try:
        # 1. Inicializar base de datos
        logger.info("📊 Inicializando base de datos...")
        if not init_database():
            logger.error("❌ Error inicializando base de datos")
            return
        
        # 2. Crear permisos
        await create_permissions()
        
        # 3. Crear roles
        await create_roles()
        
        # 4. Crear tenant demo
        await create_demo_tenant()
        
        # 5. Crear superusuario
        await create_superuser()
        
        # 6. Crear usuarios demo
        await create_demo_users()
        
        # 7. Crear empresa demo
        await create_demo_empresa()
        
        logger.info("🎉 ¡Inicialización completada exitosamente!")
        logger.info("")
        logger.info("📋 CREDENCIALES DE ACCESO:")
        logger.info("   Superusuario: admin / Admin123!")
        logger.info("   Gerente: gerente / Gerente123!")
        logger.info("   DPO: dpo / DPO123!")
        logger.info("   Usuario 1: usuario1 / Usuario123!")
        logger.info("   Usuario 2: usuario2 / Usuario123!")
        logger.info("")
        logger.info("🌐 URL del sistema: http://localhost:8000")
        logger.info("📚 Documentación API: http://localhost:8000/api/docs")
        
    except Exception as e:
        logger.error(f"❌ Error durante la inicialización: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(main())
