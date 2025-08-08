"""
Modelos de usuarios y autenticación
"""
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Table, Text, JSON
from sqlalchemy.orm import relationship
from .base import TenantBaseModel, Base


# Tabla de asociación para muchos a muchos
user_roles = Table(
    'user_roles',
    Base.metadata,
    Column('user_id', String(36), ForeignKey('users.id')),
    Column('role_id', String(36), ForeignKey('roles.id')),
    schema=None  # Se establece dinámicamente por tenant
)


class User(TenantBaseModel):
    """
    Usuario del sistema
    """
    __tablename__ = "users"
    
    # Autenticación
    username = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    
    # Información personal (encriptada)
    first_name = Column(String(255))  # Encriptado
    last_name = Column(String(255))   # Encriptado
    rut = Column(String(20))          # Encriptado
    phone = Column(String(50))        # Encriptado
    
    # Estado
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    is_dpo = Column(Boolean, default=False, nullable=False)  # Data Protection Officer
    
    # Seguridad
    mfa_enabled = Column(Boolean, default=False)
    mfa_secret = Column(String(255))  # Encriptado
    last_login = Column(DateTime(timezone=True))
    last_ip = Column(String(45))
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime(timezone=True))
    
    # Tokens
    email_verified = Column(Boolean, default=False)
    email_verification_token = Column(String(255))
    password_reset_token = Column(String(255))
    password_reset_expires = Column(DateTime(timezone=True))
    
    # Preferencias
    language = Column(String(5), default="es")
    timezone = Column(String(50), default="America/Santiago")
    ui_preferences = Column(JSON)
    
    # Notificaciones
    notification_preferences = Column(JSON, default={
        "email": {
            "consent_updates": True,
            "arcopol_requests": True,
            "breach_notifications": True,
            "system_alerts": True
        },
        "in_app": {
            "all": True
        }
    })
    
    # Relaciones
    roles = relationship("Role", secondary=user_roles, back_populates="users")
    
    # Departamento/Área
    department = Column(String(100))
    position = Column(String(100))
    
    def __repr__(self):
        return f"<User(email={self.email}, tenant_id={self.tenant_id})>"


class Role(TenantBaseModel):
    """
    Roles del sistema
    """
    __tablename__ = "roles"
    
    name = Column(String(100), nullable=False)
    code = Column(String(50), nullable=False)  # admin, dpo, user, auditor, etc.
    description = Column(Text)
    
    # Permisos como JSON
    permissions = Column(JSON, default=[])
    
    # Control
    is_system = Column(Boolean, default=False)  # Roles predefinidos del sistema
    is_active = Column(Boolean, default=True)
    
    # Relaciones
    users = relationship("User", secondary=user_roles, back_populates="roles")
    
    def __repr__(self):
        return f"<Role(name={self.name}, code={self.code})>"


class UserRole(TenantBaseModel):
    """
    Asignación de roles a usuarios con metadata adicional
    """
    __tablename__ = "user_role_assignments"
    
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    role_id = Column(String(36), ForeignKey('roles.id'), nullable=False)
    
    # Asignación temporal
    valid_from = Column(DateTime(timezone=True))
    valid_until = Column(DateTime(timezone=True))
    
    # Contexto de la asignación
    assigned_by = Column(String(36))
    assignment_reason = Column(Text)
    
    # Restricciones adicionales
    module_restrictions = Column(JSON)  # Limitar rol a ciertos módulos
    data_scope = Column(JSON)  # Limitar acceso a ciertos datos
    
    def __repr__(self):
        return f"<UserRole(user_id={self.user_id}, role_id={self.role_id})>"