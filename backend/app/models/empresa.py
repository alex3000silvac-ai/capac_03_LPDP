"""
Modelos para gestión de empresas clientes y licencias
"""
from sqlalchemy import Column, String, Boolean, DateTime, JSON, Text, Integer, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship
from .base import TenantBaseModel, EncryptedMixin


class Empresa(TenantBaseModel):
    """
    Empresa cliente que usa el sistema
    """
    __tablename__ = "empresas"
    
    # Identificación
    nombre = Column(String(255), nullable=False)
    rut = Column(String(20), unique=True, nullable=False)
    razon_social = Column(String(255))
    giro = Column(String(255))
    
    # Contacto principal
    contacto_nombre = Column(String(255))
    contacto_email = Column(String(255), nullable=False)
    contacto_telefono = Column(String(50))
    
    # Dirección
    direccion = Column(Text)
    comuna = Column(String(100))
    ciudad = Column(String(100))
    region = Column(String(100))
    
    # Estado
    is_active = Column(Boolean, default=True)
    fecha_alta = Column(DateTime(timezone=True))
    fecha_baja = Column(DateTime(timezone=True))
    
    # Configuración
    max_usuarios = Column(Integer, default=5)
    usuarios_activos = Column(Integer, default=0)
    
    # DPO (Data Protection Officer)
    dpo_nombre = Column(String(255))
    dpo_email = Column(String(255))
    dpo_telefono = Column(String(50))
    
    # Metadata
    industria = Column(String(100))
    empleados = Column(Integer)
    sitio_web = Column(String(255))
    
    # Relaciones
    modulos_acceso = relationship("ModuloAcceso", back_populates="empresa")
    licencias = relationship("Licencia", back_populates="empresa")
    
    def __repr__(self):
        return f"<Empresa(rut={self.rut}, nombre={self.nombre})>"


class ModuloAcceso(TenantBaseModel):
    """
    Control de acceso a módulos por empresa
    """
    __tablename__ = "modulos_acceso"
    
    empresa_id = Column(String(36), ForeignKey('empresas.id'), nullable=False)
    
    # Módulo
    codigo_modulo = Column(String(20), nullable=False)  # MOD-1, MOD-2, etc.
    nombre_modulo = Column(String(100), nullable=False)
    
    # Acceso
    is_active = Column(Boolean, default=True)
    fecha_activacion = Column(DateTime(timezone=True))
    fecha_expiracion = Column(DateTime(timezone=True))
    
    # Límites
    usuarios_permitidos = Column(Integer)
    registros_permitidos = Column(Integer)
    storage_mb_permitido = Column(Integer)
    
    # Uso actual
    usuarios_actuales = Column(Integer, default=0)
    registros_actuales = Column(Integer, default=0)
    storage_mb_actual = Column(Integer, default=0)
    
    # Licencia
    licencia_id = Column(String(36), ForeignKey('licencias.id'))
    
    # Configuración específica del módulo
    configuracion = Column(JSON)
    
    # Relaciones
    empresa = relationship("Empresa", back_populates="modulos_acceso")
    licencia = relationship("Licencia")
    
    def __repr__(self):
        return f"<ModuloAcceso(empresa_id={self.empresa_id}, modulo={self.codigo_modulo})>"


class Licencia(TenantBaseModel, EncryptedMixin):
    """
    Licencias del sistema
    """
    __tablename__ = "licencias"
    
    empresa_id = Column(String(36), ForeignKey('empresas.id'), nullable=False)
    
    # Identificación
    codigo_licencia = Column(String(100), unique=True, nullable=False)  # Encriptado
    tipo_licencia = Column(String(50), nullable=False)  # 'modulo', 'paquete', 'enterprise'
    
    # Módulos incluidos
    modulos = Column(JSON, nullable=False)  # ["MOD-1", "MOD-2", etc.]
    
    # Vigencia
    fecha_emision = Column(DateTime(timezone=True), nullable=False)
    fecha_activacion = Column(DateTime(timezone=True))
    fecha_expiracion = Column(DateTime(timezone=True), nullable=False)
    
    # Estado
    is_active = Column(Boolean, default=False)
    is_revoked = Column(Boolean, default=False)
    fecha_revocacion = Column(DateTime(timezone=True))
    motivo_revocacion = Column(Text)
    
    # Límites globales
    max_usuarios_total = Column(Integer)
    max_registros_total = Column(Integer)
    max_storage_gb = Column(Integer)
    
    # Comercial
    precio = Column(DECIMAL(10, 2))
    descuento = Column(DECIMAL(5, 2))
    precio_final = Column(DECIMAL(10, 2))
    
    # Facturación
    numero_orden_compra = Column(String(100))
    numero_factura = Column(String(100))
    fecha_pago = Column(DateTime(timezone=True))
    
    # Metadata
    vendedor = Column(String(255))
    canal_venta = Column(String(50))
    notas = Column(Text)
    
    # Relaciones
    empresa = relationship("Empresa", back_populates="licencias")
    
    def __repr__(self):
        return f"<Licencia(codigo={self.codigo_licencia}, empresa_id={self.empresa_id})>"