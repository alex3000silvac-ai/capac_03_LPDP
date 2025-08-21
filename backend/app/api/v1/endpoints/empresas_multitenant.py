"""
Sistema de Gestión Multi-Tenant de Empresas LPDP
Administración completa de empresas con aislamiento total de datos
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import text, and_
from pydantic import BaseModel, Field, validator
import uuid
import logging

from app.core.database import get_master_db
from app.core.auth import get_current_user, get_current_superuser
from app.models.user import User
from app.core.security_enhanced import (
    aes_cipher, input_validator, audit_logger, SecurityConfig,
    password_manager, jwt_manager
)

logger = logging.getLogger(__name__)
router = APIRouter()

# ============================================================================
# MODELOS PARA GESTIÓN DE EMPRESAS
# ============================================================================

class ModuloAcceso(BaseModel):
    """Configuración de acceso a módulos"""
    modulo_codigo: str = Field(..., max_length=50)
    modulo_nombre: str = Field(..., max_length=200)
    activo: bool = Field(default=True)
    fecha_activacion: Optional[datetime] = None
    fecha_vencimiento: Optional[datetime] = None
    limite_usuarios: Optional[int] = None
    configuracion_especial: Dict[str, Any] = Field(default_factory=dict)

class EmpresaCreate(BaseModel):
    """Modelo para crear una nueva empresa"""
    nombre: str = Field(..., min_length=2, max_length=200)
    rut: str = Field(..., min_length=8, max_length=15)
    razon_social: str = Field(..., min_length=2, max_length=300)
    
    # Datos de contacto
    email_principal: str = Field(..., max_length=200)
    telefono: Optional[str] = Field(None, max_length=20)
    direccion: Optional[str] = Field(None, max_length=500)
    ciudad: Optional[str] = Field(None, max_length=100)
    region: Optional[str] = Field(None, max_length=100)
    codigo_postal: Optional[str] = Field(None, max_length=10)
    
    # Clasificación empresarial
    sector_economico: str = Field(..., max_length=100)
    tamano_empresa: str = Field(default="mediana")  # micro, pequeña, mediana, grande
    numero_empleados: Optional[int] = Field(None, ge=1)
    
    # Representante legal
    representante_nombre: str = Field(..., max_length=200)
    representante_rut: str = Field(..., max_length=15)
    representante_email: str = Field(..., max_length=200)
    representante_cargo: str = Field(..., max_length=100)
    
    # DPO (Delegado de Protección de Datos)
    dpo_requerido: bool = Field(default=False)
    dpo_nombre: Optional[str] = Field(None, max_length=200)
    dpo_email: Optional[str] = Field(None, max_length=200)
    dpo_certificaciones: Optional[List[str]] = Field(default_factory=list)
    
    # Configuración de módulos
    modulos_solicitados: List[str] = Field(default_factory=list)
    
    # Plan de suscripción
    tipo_plan: str = Field(default="basico")  # demo, basico, profesional, empresarial
    periodo_prueba_dias: int = Field(default=30)
    
    @validator('rut', 'representante_rut')
    def validate_rut(cls, v):
        """Validar formato básico del RUT"""
        if not v or len(v) < 8:
            raise ValueError('RUT debe tener al menos 8 caracteres')
        # Aquí puedes agregar validación específica del RUT chileno
        return v.upper().replace('.', '').replace('-', '')
    
    @validator('email_principal', 'representante_email', 'dpo_email')
    def validate_emails(cls, v):
        """Validar formato de emails"""
        if v and not input_validator.validate_email(v):
            raise ValueError('Email inválido')
        return v

class EmpresaUpdate(BaseModel):
    """Modelo para actualizar empresa existente"""
    nombre: Optional[str] = Field(None, min_length=2, max_length=200)
    razon_social: Optional[str] = Field(None, min_length=2, max_length=300)
    
    # Datos de contacto
    email_principal: Optional[str] = Field(None, max_length=200)
    telefono: Optional[str] = Field(None, max_length=20)
    direccion: Optional[str] = Field(None, max_length=500)
    ciudad: Optional[str] = Field(None, max_length=100)
    region: Optional[str] = Field(None, max_length=100)
    codigo_postal: Optional[str] = Field(None, max_length=10)
    
    # Clasificación empresarial
    sector_economico: Optional[str] = Field(None, max_length=100)
    tamano_empresa: Optional[str] = None
    numero_empleados: Optional[int] = Field(None, ge=1)
    
    # Representante legal
    representante_nombre: Optional[str] = Field(None, max_length=200)
    representante_rut: Optional[str] = Field(None, max_length=15)
    representante_email: Optional[str] = Field(None, max_length=200)
    representante_cargo: Optional[str] = Field(None, max_length=100)
    
    # DPO
    dpo_requerido: Optional[bool] = None
    dpo_nombre: Optional[str] = Field(None, max_length=200)
    dpo_email: Optional[str] = Field(None, max_length=200)
    dpo_certificaciones: Optional[List[str]] = None
    
    # Estado
    activa: Optional[bool] = None

class EmpresaResponse(BaseModel):
    """Respuesta con datos de empresa"""
    id: str
    tenant_id: str
    nombre: str
    rut: str
    razon_social: str
    email_principal: str
    sector_economico: str
    tamano_empresa: str
    representante_nombre: str
    tipo_plan: str
    activa: bool
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    
    # Estadísticas
    total_usuarios: int
    modulos_activos: List[str]
    ultimo_acceso: Optional[datetime]

class ConfiguracionModulos(BaseModel):
    """Configuración de módulos para una empresa"""
    modulos: List[ModuloAcceso]

# ============================================================================
# FUNCIONES AUXILIARES
# ============================================================================

def generate_tenant_id(empresa_nombre: str, rut: str) -> str:
    """Genera un tenant_id único y válido"""
    # Limpiar y normalizar nombre
    nombre_limpio = input_validator.sanitize_sql_identifier(empresa_nombre)
    rut_limpio = rut.replace('.', '').replace('-', '')[:8]
    
    # Crear base del tenant_id
    base = f"empresa_{nombre_limpio}_{rut_limpio}".lower()
    
    # Asegurar que cumple con validaciones
    tenant_id = input_validator.sanitize_sql_identifier(base)
    
    # Agregar timestamp si es necesario para unicidad
    if len(tenant_id) > 45:  # Dejar espacio para timestamp
        tenant_id = tenant_id[:40]
    
    return f"{tenant_id}_{datetime.utcnow().strftime('%Y%m')}"

def get_modulos_disponibles() -> List[Dict[str, Any]]:
    """Retorna lista de todos los módulos disponibles en el sistema"""
    return [
        {
            "codigo": "modulo_0_introduccion",
            "nombre": "Módulo 0: Introducción LPDP",
            "descripcion": "Conceptos básicos y RAT Builder",
            "categoria": "basico",
            "precio_clp": 0,
            "incluido_en": ["demo", "basico", "profesional", "empresarial"]
        },
        {
            "codigo": "modulo_1_consentimientos",
            "nombre": "Módulo 1: Gestión de Consentimientos",
            "descripcion": "Administración de consentimientos de usuarios",
            "categoria": "derechos",
            "precio_clp": 50000,
            "incluido_en": ["profesional", "empresarial"]
        },
        {
            "codigo": "modulo_2_arcopol", 
            "nombre": "Módulo 2: ARCO y Políticas",
            "descripcion": "Derechos ARCO y políticas de privacidad",
            "categoria": "derechos",
            "precio_clp": 45000,
            "incluido_en": ["basico", "profesional", "empresarial"]
        },
        {
            "codigo": "modulo_3_inventario",
            "nombre": "Módulo 3: Inventario de Datos",
            "descripcion": "Mapeo y clasificación de activos de información",
            "categoria": "gestion",
            "precio_clp": 60000,
            "incluido_en": ["profesional", "empresarial"]
        },
        {
            "codigo": "modulo_4_brechas",
            "nombre": "Módulo 4: Gestión de Brechas",
            "descripcion": "Reporte y gestión de incidentes de seguridad",
            "categoria": "seguridad",
            "precio_clp": 40000,
            "incluido_en": ["profesional", "empresarial"]
        },
        {
            "codigo": "modulo_5_dpia",
            "nombre": "Módulo 5: Evaluaciones DPIA",
            "descripcion": "Evaluaciones de Impacto en Protección de Datos",
            "categoria": "evaluacion",
            "precio_clp": 80000,
            "incluido_en": ["empresarial"]
        },
        {
            "codigo": "modulo_6_transferencias",
            "nombre": "Módulo 6: Transferencias Internacionales",
            "descripcion": "Gestión de transferencias transfronterizas",
            "categoria": "cumplimiento",
            "precio_clp": 35000,
            "incluido_en": ["profesional", "empresarial"]
        },
        {
            "codigo": "modulo_7_auditoria",
            "nombre": "Módulo 7: Auditoría y Reportes",
            "descripcion": "Auditorías internas y reportes ejecutivos",
            "categoria": "auditoria",
            "precio_clp": 70000,
            "incluido_en": ["empresarial"]
        }
    ]

def encrypt_sensitive_empresa_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Encripta campos sensibles de la empresa"""
    sensitive_fields = [
        'representante_rut', 'direccion', 'dpo_email',
        'telefono', 'codigo_postal'
    ]
    
    encrypted_data = data.copy()
    
    for field in sensitive_fields:
        if field in encrypted_data and encrypted_data[field]:
            try:
                encrypted_data[field] = aes_cipher.encrypt(str(encrypted_data[field]))
            except Exception as e:
                logger.error(f"Error encriptando campo {field}: {e}")
    
    return encrypted_data

def decrypt_sensitive_empresa_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Desencripta campos sensibles de la empresa"""
    sensitive_fields = [
        'representante_rut', 'direccion', 'dpo_email',
        'telefono', 'codigo_postal'
    ]
    
    decrypted_data = data.copy()
    
    for field in sensitive_fields:
        if field in decrypted_data and decrypted_data[field]:
            try:
                if isinstance(decrypted_data[field], str) and len(decrypted_data[field]) > 30:
                    decrypted_data[field] = aes_cipher.decrypt(decrypted_data[field])
            except Exception as e:
                logger.warning(f"No se pudo desencriptar {field}: {e}")
    
    return decrypted_data

# ============================================================================
# ENDPOINTS DE GESTIÓN DE EMPRESAS
# ============================================================================

@router.post("/", response_model=EmpresaResponse, status_code=status.HTTP_201_CREATED)
async def create_empresa(
    empresa_data: EmpresaCreate,
    request: Request,
    current_user: User = Depends(get_current_superuser),
    db: Session = Depends(get_master_db)
):
    """
    Crea una nueva empresa con tenant isolation completo
    Solo superusuarios pueden crear empresas
    """
    try:
        client_ip = request.client.host if request.client else "unknown"
        
        # Generar tenant_id único
        tenant_id = generate_tenant_id(empresa_data.nombre, empresa_data.rut)
        
        # Validar unicidad del RUT
        existing_rut = db.execute(
            text("SELECT id FROM empresas WHERE rut = :rut"),
            {"rut": empresa_data.rut}
        ).fetchone()
        
        if existing_rut:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe una empresa con este RUT"
            )
        
        # Validar unicidad del email principal
        existing_email = db.execute(
            text("SELECT id FROM empresas WHERE email_principal = :email"),
            {"email": empresa_data.email_principal}
        ).fetchone()
        
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe una empresa con este email principal"
            )
        
        # Preparar datos para inserción
        now = datetime.utcnow()
        empresa_id = str(uuid.uuid4())
        
        # Encriptar campos sensibles
        data_dict = empresa_data.dict()
        encrypted_data = encrypt_sensitive_empresa_data(data_dict)
        
        # Configurar módulos según el plan
        modulos_disponibles = get_modulos_disponibles()
        modulos_plan = [
            modulo for modulo in modulos_disponibles 
            if empresa_data.tipo_plan in modulo["incluido_en"]
        ]
        
        # Insertar empresa
        insert_query = text("""
            INSERT INTO empresas (
                id, tenant_id, nombre, rut, razon_social, email_principal,
                telefono, direccion, ciudad, region, codigo_postal,
                sector_economico, tamano_empresa, numero_empleados,
                representante_nombre, representante_rut, representante_email, representante_cargo,
                dpo_requerido, dpo_nombre, dpo_email, dpo_certificaciones,
                tipo_plan, periodo_prueba_dias, activa, created_by,
                created_at, updated_at, datos_completos_json
            ) VALUES (
                :id, :tenant_id, :nombre, :rut, :razon_social, :email_principal,
                :telefono, :direccion, :ciudad, :region, :codigo_postal,
                :sector_economico, :tamano_empresa, :numero_empleados,
                :representante_nombre, :representante_rut, :representante_email, :representante_cargo,
                :dpo_requerido, :dpo_nombre, :dpo_email, :dpo_certificaciones,
                :tipo_plan, :periodo_prueba_dias, :activa, :created_by,
                :created_at, :updated_at, :datos_completos_json
            )
        """)
        
        db.execute(insert_query, {
            'id': empresa_id,
            'tenant_id': tenant_id,
            'nombre': encrypted_data['nombre'],
            'rut': empresa_data.rut,
            'razon_social': encrypted_data['razon_social'],
            'email_principal': empresa_data.email_principal,
            'telefono': encrypted_data.get('telefono'),
            'direccion': encrypted_data.get('direccion'),
            'ciudad': encrypted_data.get('ciudad'),
            'region': encrypted_data.get('region'),
            'codigo_postal': encrypted_data.get('codigo_postal'),
            'sector_economico': empresa_data.sector_economico,
            'tamano_empresa': empresa_data.tamano_empresa,
            'numero_empleados': empresa_data.numero_empleados,
            'representante_nombre': encrypted_data['representante_nombre'],
            'representante_rut': encrypted_data['representante_rut'],
            'representante_email': empresa_data.representante_email,
            'representante_cargo': empresa_data.representante_cargo,
            'dpo_requerido': empresa_data.dpo_requerido,
            'dpo_nombre': encrypted_data.get('dpo_nombre'),
            'dpo_email': encrypted_data.get('dpo_email'),
            'dpo_certificaciones': str(empresa_data.dpo_certificaciones) if empresa_data.dpo_certificaciones else None,
            'tipo_plan': empresa_data.tipo_plan,
            'periodo_prueba_dias': empresa_data.periodo_prueba_dias,
            'activa': True,
            'created_by': str(current_user.id),
            'created_at': now,
            'updated_at': now,
            'datos_completos_json': aes_cipher.encrypt_dict(data_dict)
        })
        
        # Crear acceso a módulos
        for modulo in modulos_plan:
            modulo_id = str(uuid.uuid4())
            fecha_vencimiento = now.replace(year=now.year + 1) if empresa_data.tipo_plan != 'demo' else None
            
            db.execute(text("""
                INSERT INTO modulo_acceso (
                    id, empresa_id, tenant_id, modulo_codigo, modulo_nombre,
                    activo, fecha_activacion, fecha_vencimiento, limite_usuarios,
                    configuracion_json, created_at, updated_at
                ) VALUES (
                    :id, :empresa_id, :tenant_id, :modulo_codigo, :modulo_nombre,
                    :activo, :fecha_activacion, :fecha_vencimiento, :limite_usuarios,
                    :configuracion_json, :created_at, :updated_at
                )
            """), {
                'id': modulo_id,
                'empresa_id': empresa_id,
                'tenant_id': tenant_id,
                'modulo_codigo': modulo['codigo'],
                'modulo_nombre': modulo['nombre'],
                'activo': True,
                'fecha_activacion': now,
                'fecha_vencimiento': fecha_vencimiento,
                'limite_usuarios': 10 if empresa_data.tipo_plan == 'demo' else None,
                'configuracion_json': aes_cipher.encrypt_dict(modulo),
                'created_at': now,
                'updated_at': now
            })
        
        # Crear esquema de base de datos para el tenant
        try:
            from app.core.database import create_tenant_schema
            create_tenant_schema(tenant_id)
        except Exception as e:
            logger.error(f"Error creando esquema para tenant {tenant_id}: {e}")
            # No fallar la creación de empresa por error de esquema
        
        db.commit()
        
        # Log de auditoría
        audit_logger.log_security_event(
            "empresa_created", tenant_id, str(current_user.id),
            {
                "empresa_id": empresa_id,
                "nombre": empresa_data.nombre,
                "rut": empresa_data.rut,
                "tipo_plan": empresa_data.tipo_plan,
                "modulos_asignados": len(modulos_plan),
                "ip_address": client_ip
            },
            "INFO"
        )
        
        # Retornar respuesta
        return EmpresaResponse(
            id=empresa_id,
            tenant_id=tenant_id,
            nombre=empresa_data.nombre,
            rut=empresa_data.rut,
            razon_social=empresa_data.razon_social,
            email_principal=empresa_data.email_principal,
            sector_economico=empresa_data.sector_economico,
            tamano_empresa=empresa_data.tamano_empresa,
            representante_nombre=empresa_data.representante_nombre,
            tipo_plan=empresa_data.tipo_plan,
            activa=True,
            fecha_creacion=now,
            fecha_actualizacion=now,
            total_usuarios=0,
            modulos_activos=[m['codigo'] for m in modulos_plan],
            ultimo_acceso=None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creando empresa: {e}")
        audit_logger.log_security_event(
            "empresa_creation_error", "unknown", str(current_user.id),
            {"error": str(e), "ip_address": client_ip},
            "ERROR"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno creando empresa: {str(e)}"
        )

@router.get("/", response_model=List[EmpresaResponse])
async def get_empresas(
    skip: int = 0,
    limit: int = 50,
    activas_solo: bool = True,
    current_user: User = Depends(get_current_superuser),
    db: Session = Depends(get_master_db)
):
    """
    Lista todas las empresas (solo superusuarios)
    """
    try:
        # Construir query con filtros
        where_clause = "WHERE 1=1"
        params = {"skip": skip, "limit": limit}
        
        if activas_solo:
            where_clause += " AND activa = :activa"
            params["activa"] = True
        
        query = text(f"""
            SELECT 
                e.*, 
                COUNT(DISTINCT u.id) as total_usuarios,
                MAX(u.last_login_at) as ultimo_acceso
            FROM empresas e
            LEFT JOIN users u ON u.tenant_id = e.tenant_id AND u.is_active = true
            {where_clause}
            GROUP BY e.id
            ORDER BY e.created_at DESC
            OFFSET :skip LIMIT :limit
        """)
        
        result = db.execute(query, params)
        rows = result.fetchall()
        
        empresas = []
        for row in rows:
            row_dict = dict(row)
            
            # Desencriptar datos sensibles
            decrypted_data = decrypt_sensitive_empresa_data(row_dict)
            
            # Obtener módulos activos
            modulos_query = text("""
                SELECT modulo_codigo FROM modulo_acceso 
                WHERE empresa_id = :empresa_id AND activo = true
            """)
            modulos_result = db.execute(modulos_query, {"empresa_id": row_dict['id']})
            modulos_activos = [m[0] for m in modulos_result.fetchall()]
            
            empresa = EmpresaResponse(
                id=row_dict['id'],
                tenant_id=row_dict['tenant_id'],
                nombre=decrypted_data.get('nombre', row_dict['nombre']),
                rut=row_dict['rut'],
                razon_social=decrypted_data.get('razon_social', row_dict['razon_social']),
                email_principal=row_dict['email_principal'],
                sector_economico=row_dict['sector_economico'],
                tamano_empresa=row_dict['tamano_empresa'],
                representante_nombre=decrypted_data.get('representante_nombre', row_dict['representante_nombre']),
                tipo_plan=row_dict['tipo_plan'],
                activa=row_dict['activa'],
                fecha_creacion=row_dict['created_at'],
                fecha_actualizacion=row_dict['updated_at'],
                total_usuarios=row_dict['total_usuarios'] or 0,
                modulos_activos=modulos_activos,
                ultimo_acceso=row_dict['ultimo_acceso']
            )
            empresas.append(empresa)
        
        return empresas
        
    except Exception as e:
        logger.error(f"Error obteniendo empresas: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error obteniendo lista de empresas"
        )

@router.get("/modulos-disponibles")
async def get_modulos_disponibles_endpoint(
    current_user: User = Depends(get_current_user)
):
    """
    Obtiene lista de módulos disponibles en el sistema
    """
    return {
        "modulos": get_modulos_disponibles(),
        "planes": {
            "demo": {
                "nombre": "Demo",
                "descripcion": "Acceso limitado para pruebas",
                "precio_mensual_clp": 0,
                "limite_usuarios": 3,
                "duracion_dias": 30
            },
            "basico": {
                "nombre": "Básico",
                "descripcion": "Módulos esenciales para PYME",
                "precio_mensual_clp": 49990,
                "limite_usuarios": 10,
                "duracion_dias": None
            },
            "profesional": {
                "nombre": "Profesional", 
                "descripcion": "Suite completa para empresas medianas",
                "precio_mensual_clp": 99990,
                "limite_usuarios": 50,
                "duracion_dias": None
            },
            "empresarial": {
                "nombre": "Empresarial",
                "descripcion": "Solución completa para grandes empresas",
                "precio_mensual_clp": 199990,
                "limite_usuarios": None,
                "duracion_dias": None
            }
        }
    }

@router.get("/{empresa_id}/modulos", response_model=List[ModuloAcceso])
async def get_empresa_modulos(
    empresa_id: str,
    current_user: User = Depends(get_current_superuser),
    db: Session = Depends(get_master_db)
):
    """
    Obtiene los módulos asignados a una empresa específica
    """
    try:
        # Validar que la empresa existe
        empresa = db.execute(
            text("SELECT tenant_id FROM empresas WHERE id = :empresa_id"),
            {"empresa_id": empresa_id}
        ).fetchone()
        
        if not empresa:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Empresa no encontrada"
            )
        
        # Obtener módulos
        query = text("""
            SELECT * FROM modulo_acceso 
            WHERE empresa_id = :empresa_id
            ORDER BY fecha_activacion DESC
        """)
        
        result = db.execute(query, {"empresa_id": empresa_id})
        rows = result.fetchall()
        
        modulos = []
        for row in rows:
            row_dict = dict(row)
            
            # Desencriptar configuración
            configuracion = {}
            if row_dict.get('configuracion_json'):
                try:
                    configuracion = aes_cipher.decrypt_dict(row_dict['configuracion_json'])
                except Exception as e:
                    logger.error(f"Error desencriptando configuración del módulo: {e}")
            
            modulo = ModuloAcceso(
                modulo_codigo=row_dict['modulo_codigo'],
                modulo_nombre=row_dict['modulo_nombre'],
                activo=row_dict['activo'],
                fecha_activacion=row_dict['fecha_activacion'],
                fecha_vencimiento=row_dict['fecha_vencimiento'],
                limite_usuarios=row_dict['limite_usuarios'],
                configuracion_especial=configuracion
            )
            modulos.append(modulo)
        
        return modulos
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo módulos de empresa {empresa_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error obteniendo módulos de la empresa"
        )

# ============================================================================
# ENDPOINT DEMO ESPECÍFICO
# ============================================================================

@router.post("/demo/setup", response_model=Dict[str, Any])
async def setup_demo_empresa(
    request: Request,
    db: Session = Depends(get_master_db)
):
    """
    Configura empresa demo para pruebas de clientes
    """
    try:
        if not SecurityConfig.DEMO_MODE_ENABLED:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Modo demo no habilitado"
            )
        
        client_ip = request.client.host if request.client else "unknown"
        
        # Verificar si ya existe empresa demo
        existing_demo = db.execute(
            text("SELECT * FROM empresas WHERE tenant_id = :tenant_id"),
            {"tenant_id": SecurityConfig.DEMO_TENANT_ID}
        ).fetchone()
        
        if existing_demo:
            return {
                "message": "Empresa demo ya existe",
                "tenant_id": SecurityConfig.DEMO_TENANT_ID,
                "empresa_id": existing_demo.id,
                "acceso": {
                    "email": SecurityConfig.DEMO_ADMIN_EMAIL,
                    "password": "demo123",  # Password simplificado para demo
                    "limitaciones": {
                        "max_usuarios": 3,
                        "max_rats": 5,
                        "solo_lectura_avanzada": True,
                        "sin_exportacion_masiva": True,
                        "watermark_reportes": True
                    }
                }
            }
        
        # Crear empresa demo
        now = datetime.utcnow()
        empresa_id = str(uuid.uuid4())
        
        # Datos de la empresa demo
        demo_data = {
            'id': empresa_id,
            'tenant_id': SecurityConfig.DEMO_TENANT_ID,
            'nombre': 'Empresa Demo LPDP',
            'rut': '99999999-9',
            'razon_social': 'Empresa Demostrativa de Protección de Datos Ltda.',
            'email_principal': SecurityConfig.DEMO_ADMIN_EMAIL,
            'telefono': '+56 2 2XXX XXXX',
            'direccion': 'Av. Demo 123, Piso 4',
            'ciudad': 'Santiago',
            'region': 'Región Metropolitana',
            'codigo_postal': '7500000',
            'sector_economico': 'Tecnología',
            'tamano_empresa': 'mediana',
            'numero_empleados': 50,
            'representante_nombre': 'Usuario Demo Admin',
            'representante_rut': '11111111-1',
            'representante_email': SecurityConfig.DEMO_ADMIN_EMAIL,
            'representante_cargo': 'Gerente General Demo',
            'dpo_requerido': True,
            'dpo_nombre': 'DPO Demo',
            'dpo_email': 'dpo@demo-lpdp.cl',
            'dpo_certificaciones': '["IAPP CIPP/E", "Demo Certification"]',
            'tipo_plan': 'demo',
            'periodo_prueba_dias': 30,
            'activa': True,
            'created_by': 'sistema_demo',
            'created_at': now,
            'updated_at': now,
            'datos_completos_json': aes_cipher.encrypt_dict({
                "demo": True,
                "limitaciones": {
                    "max_usuarios": 3,
                    "max_rats": 5,
                    "watermark": True
                }
            })
        }
        
        # Encriptar datos sensibles
        encrypted_data = encrypt_sensitive_empresa_data(demo_data)
        
        # Insertar empresa demo
        insert_query = text("""
            INSERT INTO empresas (
                id, tenant_id, nombre, rut, razon_social, email_principal,
                telefono, direccion, ciudad, region, codigo_postal,
                sector_economico, tamano_empresa, numero_empleados,
                representante_nombre, representante_rut, representante_email, representante_cargo,
                dpo_requerido, dpo_nombre, dpo_email, dpo_certificaciones,
                tipo_plan, periodo_prueba_dias, activa, created_by,
                created_at, updated_at, datos_completos_json
            ) VALUES (
                :id, :tenant_id, :nombre, :rut, :razon_social, :email_principal,
                :telefono, :direccion, :ciudad, :region, :codigo_postal,
                :sector_economico, :tamano_empresa, :numero_empleados,
                :representante_nombre, :representante_rut, :representante_email, :representante_cargo,
                :dpo_requerido, :dpo_nombre, :dpo_email, :dpo_certificaciones,
                :tipo_plan, :periodo_prueba_dias, :activa, :created_by,
                :created_at, :updated_at, :datos_completos_json
            )
        """)
        
        db.execute(insert_query, encrypted_data)
        
        # Asignar módulos demo (solo Módulo 0)
        modulos_demo = [m for m in get_modulos_disponibles() if 'demo' in m['incluido_en']]
        
        for modulo in modulos_demo:
            db.execute(text("""
                INSERT INTO modulo_acceso (
                    id, empresa_id, tenant_id, modulo_codigo, modulo_nombre,
                    activo, fecha_activacion, fecha_vencimiento, limite_usuarios,
                    configuracion_json, created_at, updated_at
                ) VALUES (
                    :id, :empresa_id, :tenant_id, :modulo_codigo, :modulo_nombre,
                    :activo, :fecha_activacion, :fecha_vencimiento, :limite_usuarios,
                    :configuracion_json, :created_at, :updated_at
                )
            """), {
                'id': str(uuid.uuid4()),
                'empresa_id': empresa_id,
                'tenant_id': SecurityConfig.DEMO_TENANT_ID,
                'modulo_codigo': modulo['codigo'],
                'modulo_nombre': modulo['nombre'],
                'activo': True,
                'fecha_activacion': now,
                'fecha_vencimiento': now.replace(month=now.month+1) if now.month < 12 else now.replace(year=now.year+1, month=1),
                'limite_usuarios': 3,
                'configuracion_json': aes_cipher.encrypt_dict({**modulo, "demo": True}),
                'created_at': now,
                'updated_at': now
            })
        
        db.commit()
        
        # Log de auditoría
        audit_logger.log_security_event(
            "demo_empresa_setup", SecurityConfig.DEMO_TENANT_ID, "sistema_demo",
            {"empresa_id": empresa_id, "ip_address": client_ip},
            "INFO"
        )
        
        return {
            "message": "Empresa demo configurada exitosamente",
            "tenant_id": SecurityConfig.DEMO_TENANT_ID,
            "empresa_id": empresa_id,
            "acceso": {
                "email": SecurityConfig.DEMO_ADMIN_EMAIL,
                "password": "demo123",
                "limitaciones": {
                    "max_usuarios": 3,
                    "max_rats": 5,
                    "solo_lectura_avanzada": True,
                    "sin_exportacion_masiva": True,
                    "watermark_reportes": True,
                    "duracion_dias": 30
                }
            },
            "modulos_disponibles": [m['codigo'] for m in modulos_demo]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error configurando empresa demo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error configurando empresa demo: {str(e)}"
        )