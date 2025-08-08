"""
Script de inicialización de base de datos multi-tenant
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
import logging
from datetime import datetime, timedelta
from app.core.config import settings
from app.models.base import Base
from app.models.tenant import Tenant, TenantConfig
from app.models.user import User, Role
from app.models.empresa import Empresa
from app.core.security import get_password_hash
from app.core.tenant import create_tenant_schema

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_database():
    """Inicializa la base de datos master y crea el tenant demo"""
    
    # Conectar a la base de datos
    engine = create_engine(settings.DATABASE_URL)
    
    # Crear esquema público si no existe
    with engine.connect() as conn:
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS public"))
        conn.commit()
    
    # Crear tablas del esquema master (public)
    logger.info("Creating master schema tables...")
    
    # Solo crear tablas que pertenecen al esquema public
    tables_to_create = []
    for table in Base.metadata.tables.values():
        if hasattr(table, 'schema') and table.schema == 'public':
            tables_to_create.append(table)
    
    Base.metadata.create_all(bind=engine, tables=tables_to_create)
    
    # Crear sesión
    db = Session(engine)
    
    try:
        # Verificar si ya existe el tenant demo
        demo_tenant = db.query(Tenant).filter(Tenant.tenant_id == "demo").first()
        
        if not demo_tenant:
            logger.info("Creating demo tenant...")
            
            # Crear tenant demo
            demo_tenant = Tenant(
                tenant_id="demo",
                schema_name="tenant_demo",
                company_name="Empresa Demo",
                rut="76.123.456-7",
                razon_social="Empresa Demo SpA",
                giro="Servicios de Tecnología",
                email="admin@demo.cl",
                phone="+56912345678",
                address="Av. Providencia 1234",
                city="Santiago",
                region="Región Metropolitana",
                country="Chile",
                is_active=True,
                is_trial=True,
                trial_ends_at=datetime.utcnow() + timedelta(days=30),
                max_users=10,
                max_data_subjects=1000,
                storage_quota_mb=512,
                billing_plan="trial",
                industry="Tecnología",
                employee_count="1-10"
            )
            
            db.add(demo_tenant)
            db.commit()
            
            # Crear esquema del tenant
            if create_tenant_schema("demo", db):
                demo_tenant.database_created = True
                demo_tenant.schema_version = "1.0.0"
                db.commit()
                
                logger.info("Demo tenant schema created successfully")
                
                # Crear roles predeterminados en el tenant
                from app.core.tenant import get_tenant_db
                tenant_db = get_tenant_db("demo")
                
                # Roles del sistema
                roles = [
                    {
                        "name": "Administrador",
                        "code": "admin",
                        "description": "Administrador del sistema con acceso total",
                        "permissions": ["*"],
                        "is_system": True
                    },
                    {
                        "name": "DPO (Data Protection Officer)",
                        "code": "dpo",
                        "description": "Oficial de Protección de Datos",
                        "permissions": [
                            "consentimientos.*",
                            "arcopol.*",
                            "inventario.*",
                            "brechas.*",
                            "dpia.*",
                            "transferencias.*",
                            "auditoria.read",
                            "reportes.*"
                        ],
                        "is_system": True
                    },
                    {
                        "name": "Auditor",
                        "code": "auditor",
                        "description": "Auditor con acceso de solo lectura",
                        "permissions": [
                            "*.read",
                            "auditoria.*",
                            "reportes.*"
                        ],
                        "is_system": True
                    },
                    {
                        "name": "Usuario",
                        "code": "user",
                        "description": "Usuario estándar del sistema",
                        "permissions": [
                            "consentimientos.read",
                            "consentimientos.create",
                            "arcopol.create",
                            "inventario.read",
                            "capacitacion.*"
                        ],
                        "is_system": True
                    }
                ]
                
                for role_data in roles:
                    role = Role(
                        tenant_id="demo",
                        name=role_data["name"],
                        code=role_data["code"],
                        description=role_data["description"],
                        permissions=role_data["permissions"],
                        is_system=role_data["is_system"],
                        is_active=True
                    )
                    tenant_db.add(role)
                
                # Crear usuario administrador
                admin_role = tenant_db.query(Role).filter(Role.code == "admin").first()
                
                admin_user = User(
                    tenant_id="demo",
                    username="admin",
                    email="admin@demo.cl",
                    password_hash=get_password_hash("Admin123!"),
                    first_name="Administrador",
                    last_name="Demo",
                    is_active=True,
                    is_superuser=False,
                    email_verified=True,
                    created_by="system"
                )
                tenant_db.add(admin_user)
                tenant_db.commit()
                
                # Asignar rol
                admin_user.roles.append(admin_role)
                tenant_db.commit()
                
                # Crear empresa demo
                empresa_demo = Empresa(
                    tenant_id="demo",
                    nombre="Empresa Demo",
                    rut="76.123.456-7",
                    razon_social="Empresa Demo SpA",
                    giro="Servicios de Tecnología",
                    contacto_nombre="Juan Pérez",
                    contacto_email="contacto@demo.cl",
                    contacto_telefono="+56912345678",
                    direccion="Av. Providencia 1234",
                    comuna="Providencia",
                    ciudad="Santiago",
                    region="Región Metropolitana",
                    max_usuarios=10,
                    usuarios_activos=1,
                    dpo_nombre="María González",
                    dpo_email="dpo@demo.cl",
                    industria="Tecnología",
                    empleados=10,
                    fecha_alta=datetime.utcnow(),
                    created_by="system"
                )
                tenant_db.add(empresa_demo)
                tenant_db.commit()
                
                logger.info("Demo user and company created successfully")
                logger.info("Username: admin")
                logger.info("Password: Admin123!")
                
        # Crear superusuario del sistema si no existe
        master_admin = db.query(Tenant).filter(Tenant.tenant_id == "master").first()
        
        if not master_admin:
            logger.info("Creating system superuser...")
            
            # Crear tenant master para el superadmin
            master_tenant = Tenant(
                tenant_id="master",
                schema_name="tenant_master",
                company_name="Jurídica Digital SPA",
                rut="76.000.000-0",
                email="sistema@juridicadigital.cl",
                is_active=True,
                max_users=100,
                max_data_subjects=1000000,
                storage_quota_mb=10240,
                billing_plan="enterprise"
            )
            
            db.add(master_tenant)
            db.commit()
            
            # Crear esquema
            if create_tenant_schema("master", db):
                master_tenant.database_created = True
                db.commit()
                
                # Crear superusuario
                from app.core.tenant import get_tenant_db
                master_db = get_tenant_db("master")
                
                # Crear rol superadmin
                superadmin_role = Role(
                    tenant_id="master",
                    name="Super Administrador",
                    code="superadmin",
                    description="Administrador del sistema completo",
                    permissions=["*"],
                    is_system=True
                )
                master_db.add(superadmin_role)
                
                superuser = User(
                    tenant_id="master",
                    username="superadmin",
                    email=settings.ADMIN_EMAIL,
                    password_hash=get_password_hash(settings.ADMIN_PASSWORD),
                    first_name="Super",
                    last_name="Admin",
                    is_active=True,
                    is_superuser=True,
                    email_verified=True,
                    created_by="system"
                )
                master_db.add(superuser)
                master_db.commit()
                
                # Asignar rol
                superuser.roles.append(superadmin_role)
                master_db.commit()
                
                logger.info("Superuser created successfully")
                logger.info(f"Username: superadmin")
                logger.info(f"Email: {settings.ADMIN_EMAIL}")
        
        logger.info("Database initialization completed successfully!")
        
    except Exception as e:
        logger.error(f"Error during initialization: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    init_database()