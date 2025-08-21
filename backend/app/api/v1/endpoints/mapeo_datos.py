"""
Endpoints para gestión de RAT (Registro de Actividades de Tratamiento)
Sistema LPDP - Ley 21.719
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel, Field
import json
import uuid
import logging

from app.core.database import get_master_db
from app.core.auth import get_current_user, get_tenant_user
from app.models.user import User
from app.core.security_enhanced import (
    aes_cipher, input_validator, audit_logger, SecurityConfig
)

logger = logging.getLogger(__name__)
router = APIRouter()

# ============================================================================
# MODELOS PYDANTIC
# ============================================================================

class CategoriasDatos(BaseModel):
    """Categorías de datos personales tratados"""
    identificacion: List[str] = Field(default_factory=list)
    contacto: List[str] = Field(default_factory=list)
    demograficos: List[str] = Field(default_factory=list)
    economicos: List[str] = Field(default_factory=list)
    educacion: List[str] = Field(default_factory=list)
    salud: List[str] = Field(default_factory=list)
    sensibles: List[str] = Field(default_factory=list)

class TransferenciaInternacional(BaseModel):
    """Transferencias internacionales"""
    existe: bool = Field(default=False)
    paises: List[str] = Field(default_factory=list)
    garantias: str = Field(default="")
    empresa_receptora: str = Field(default="")

class MedidasSeguridad(BaseModel):
    """Medidas de seguridad implementadas"""
    tecnicas: List[str] = Field(default_factory=list)
    organizativas: List[str] = Field(default_factory=list)

class MapeoRATCreate(BaseModel):
    """Modelo para crear un nuevo RAT"""
    # Identificación básica
    nombre_actividad: str = Field(..., max_length=500)
    area_responsable: str = Field(..., max_length=200)
    responsable_tratamiento: str = Field(default="", max_length=200)
    dpo_contacto: str = Field(default="", max_length=200)
    
    # Base de licitud
    base_licitud: str = Field(..., max_length=100)
    base_licitud_detalle: str = Field(default="", max_length=1000)
    
    # Categorías de datos
    categorias_datos: CategoriasDatos
    
    # Finalidad del tratamiento
    finalidad: str = Field(..., max_length=1000)
    finalidad_detallada: str = Field(default="", max_length=2000)
    
    # Origen de los datos
    origen_datos: List[str] = Field(default_factory=list)
    
    # Destinatarios
    destinatarios: List[str] = Field(default_factory=list)
    destinatarios_internos: List[str] = Field(default_factory=list)
    destinatarios_externos: List[str] = Field(default_factory=list)
    
    # Transferencias internacionales
    transferencias_internacionales: TransferenciaInternacional
    
    # Tiempo de conservación
    tiempo_conservacion: str = Field(default="", max_length=500)
    criterios_supresion: str = Field(default="", max_length=1000)
    
    # Medidas de seguridad
    medidas_seguridad: MedidasSeguridad
    
    # Evaluación de riesgos
    nivel_riesgo: str = Field(default="medio")  # bajo, medio, alto
    evaluacion_riesgos: str = Field(default="", max_length=2000)
    medidas_mitigacion: List[str] = Field(default_factory=list)
    
    # Derechos de los titulares
    derechos_ejercidos: List[str] = Field(default_factory=list)
    procedimiento_derechos: str = Field(default="", max_length=1000)
    
    # Metadatos
    version: str = Field(default="1.0")
    estado: str = Field(default="borrador")  # borrador, revisión, aprobado, archivado
    observaciones: str = Field(default="", max_length=2000)

class MapeoRATUpdate(BaseModel):
    """Modelo para actualizar un RAT existente"""
    nombre_actividad: Optional[str] = Field(None, max_length=500)
    area_responsable: Optional[str] = Field(None, max_length=200)
    responsable_tratamiento: Optional[str] = Field(None, max_length=200)
    dpo_contacto: Optional[str] = Field(None, max_length=200)
    base_licitud: Optional[str] = Field(None, max_length=100)
    base_licitud_detalle: Optional[str] = Field(None, max_length=1000)
    categorias_datos: Optional[CategoriasDatos] = None
    finalidad: Optional[str] = Field(None, max_length=1000)
    finalidad_detallada: Optional[str] = Field(None, max_length=2000)
    origen_datos: Optional[List[str]] = None
    destinatarios: Optional[List[str]] = None
    destinatarios_internos: Optional[List[str]] = None
    destinatarios_externos: Optional[List[str]] = None
    transferencias_internacionales: Optional[TransferenciaInternacional] = None
    tiempo_conservacion: Optional[str] = Field(None, max_length=500)
    criterios_supresion: Optional[str] = Field(None, max_length=1000)
    medidas_seguridad: Optional[MedidasSeguridad] = None
    nivel_riesgo: Optional[str] = None
    evaluacion_riesgos: Optional[str] = Field(None, max_length=2000)
    medidas_mitigacion: Optional[List[str]] = None
    derechos_ejercidos: Optional[List[str]] = None
    procedimiento_derechos: Optional[str] = Field(None, max_length=1000)
    version: Optional[str] = None
    estado: Optional[str] = None
    observaciones: Optional[str] = Field(None, max_length=2000)

class MapeoRATResponse(BaseModel):
    """Respuesta con datos del RAT"""
    id: str
    nombre_actividad: str
    area_responsable: str
    base_licitud: str
    estado: str
    version: str
    tenant_id: str
    created_by: str
    created_at: datetime
    updated_at: datetime
    # Los demás campos se incluyen en 'datos_completos'
    datos_completos: Dict[str, Any]

# ============================================================================
# FUNCIONES AUXILIARES
# ============================================================================

def validate_rat_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Valida y sanitiza los datos del RAT"""
    # Validar campos requeridos
    required_fields = ['nombre_actividad', 'area_responsable', 'base_licitud', 'finalidad']
    for field in required_fields:
        if not data.get(field):
            raise ValueError(f"Campo requerido faltante: {field}")
    
    # Sanitizar campos de texto
    text_fields = [
        'nombre_actividad', 'area_responsable', 'responsable_tratamiento',
        'dpo_contacto', 'base_licitud_detalle', 'finalidad', 'finalidad_detallada',
        'tiempo_conservacion', 'criterios_supresion', 'evaluacion_riesgos',
        'procedimiento_derechos', 'observaciones'
    ]
    
    for field in text_fields:
        if field in data and data[field]:
            data[field] = input_validator.sanitize_user_input(data[field], max_length=2000)
    
    # Validar nivel de riesgo
    if data.get('nivel_riesgo') not in ['bajo', 'medio', 'alto']:
        data['nivel_riesgo'] = 'medio'
    
    # Validar estado
    if data.get('estado') not in ['borrador', 'revisión', 'aprobado', 'archivado']:
        data['estado'] = 'borrador'
    
    return data

def encrypt_sensitive_fields(data: Dict[str, Any]) -> Dict[str, Any]:
    """Encripta campos sensibles del RAT"""
    # Campos que contienen información sensible
    sensitive_fields = [
        'responsable_tratamiento', 'dpo_contacto', 'finalidad_detallada',
        'evaluacion_riesgos', 'observaciones'
    ]
    
    encrypted_data = data.copy()
    
    for field in sensitive_fields:
        if field in encrypted_data and encrypted_data[field]:
            try:
                encrypted_data[field] = aes_cipher.encrypt(str(encrypted_data[field]))
            except Exception as e:
                logger.error(f"Error encriptando campo {field}: {e}")
                # Si falla la encriptación, usar el valor original
                pass
    
    return encrypted_data

def decrypt_sensitive_fields(data: Dict[str, Any]) -> Dict[str, Any]:
    """Desencripta campos sensibles del RAT"""
    sensitive_fields = [
        'responsable_tratamiento', 'dpo_contacto', 'finalidad_detallada',
        'evaluacion_riesgos', 'observaciones'
    ]
    
    decrypted_data = data.copy()
    
    for field in sensitive_fields:
        if field in decrypted_data and decrypted_data[field]:
            try:
                # Solo intentar desencriptar si parece estar encriptado
                if isinstance(decrypted_data[field], str) and len(decrypted_data[field]) > 50:
                    decrypted_data[field] = aes_cipher.decrypt(decrypted_data[field])
            except Exception as e:
                logger.warning(f"No se pudo desencriptar campo {field}: {e}")
                # Si falla la desencriptación, usar el valor original
                pass
    
    return decrypted_data

# ============================================================================
# ENDPOINTS
# ============================================================================

@router.post("/", response_model=MapeoRATResponse, status_code=status.HTTP_201_CREATED)
async def create_mapeo_rat(
    mapeo_data: MapeoRATCreate,
    request: Request,
    current_user: User = Depends(get_tenant_user),
    db: Session = Depends(get_master_db)
):
    """
    Crea un nuevo Registro de Actividades de Tratamiento (RAT)
    """
    try:
        # Obtener IP para auditoría
        client_ip = request.client.host if request.client else "unknown"
        
        # Validar datos
        data_dict = mapeo_data.dict()
        validated_data = validate_rat_data(data_dict)
        
        # Generar ID único
        rat_id = str(uuid.uuid4())
        
        # Preparar datos para inserción
        now = datetime.utcnow()
        
        # Encriptar campos sensibles
        encrypted_data = encrypt_sensitive_fields(validated_data)
        
        # Crear registro
        insert_data = {
            'id': rat_id,
            'tenant_id': current_user.tenant_id,
            'created_by': str(current_user.id),
            'nombre_actividad': validated_data['nombre_actividad'],
            'area_responsable': validated_data['area_responsable'],
            'base_licitud': validated_data['base_licitud'],
            'finalidad': validated_data['finalidad'],
            'categorias_datos': json.dumps(validated_data.get('categorias_datos', {})),
            'transferencias_internacionales': json.dumps(validated_data.get('transferencias_internacionales', {})),
            'medidas_seguridad': json.dumps(validated_data.get('medidas_seguridad', {})),
            'nivel_riesgo': validated_data.get('nivel_riesgo', 'medio'),
            'estado': validated_data.get('estado', 'borrador'),
            'version': validated_data.get('version', '1.0'),
            'datos_completos_json': json.dumps(encrypted_data),
            'created_at': now,
            'updated_at': now
        }
        
        # Insertar en base de datos con query parametrizada
        query = text("""
            INSERT INTO mapeos_datos (
                id, tenant_id, created_by, nombre_actividad, area_responsable,
                base_licitud, finalidad, categorias_datos, transferencias_internacionales,
                medidas_seguridad, nivel_riesgo, estado, version, datos_completos_json,
                created_at, updated_at
            ) VALUES (
                :id, :tenant_id, :created_by, :nombre_actividad, :area_responsable,
                :base_licitud, :finalidad, :categorias_datos, :transferencias_internacionales,
                :medidas_seguridad, :nivel_riesgo, :estado, :version, :datos_completos_json,
                :created_at, :updated_at
            )
        """)
        
        db.execute(query, insert_data)
        db.commit()
        
        # Log de auditoría
        audit_logger.log_data_access(
            current_user.tenant_id, str(current_user.id),
            f"mapeo_rat:{rat_id}", "CREATE", True
        )
        
        audit_logger.log_security_event(
            "rat_created", current_user.tenant_id, str(current_user.id),
            {
                "rat_id": rat_id,
                "nombre_actividad": validated_data['nombre_actividad'],
                "ip_address": client_ip
            },
            "INFO"
        )
        
        # Retornar respuesta
        response_data = decrypt_sensitive_fields(encrypted_data.copy())
        
        return MapeoRATResponse(
            id=rat_id,
            nombre_actividad=validated_data['nombre_actividad'],
            area_responsable=validated_data['area_responsable'],
            base_licitud=validated_data['base_licitud'],
            estado=validated_data.get('estado', 'borrador'),
            version=validated_data.get('version', '1.0'),
            tenant_id=current_user.tenant_id,
            created_by=str(current_user.id),
            created_at=now,
            updated_at=now,
            datos_completos=response_data
        )
        
    except Exception as e:
        logger.error(f"Error creando RAT: {e}")
        
        # Log error de auditoría
        audit_logger.log_security_event(
            "rat_creation_error", current_user.tenant_id, str(current_user.id),
            {"error": str(e), "ip_address": client_ip},
            "ERROR"
        )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )

@router.get("/", response_model=List[MapeoRATResponse])
async def get_mapeos_rat(
    current_user: User = Depends(get_tenant_user),
    db: Session = Depends(get_master_db)
):
    """
    Obtiene todos los RATs del tenant actual
    """
    try:
        query = text("""
            SELECT * FROM mapeos_datos 
            WHERE tenant_id = :tenant_id 
            ORDER BY updated_at DESC
        """)
        
        result = db.execute(query, {"tenant_id": current_user.tenant_id})
        rows = result.fetchall()
        
        # Procesar resultados
        mapeos = []
        for row in rows:
            row_dict = dict(row)
            
            # Desencriptar datos completos
            datos_completos = {}
            if row_dict.get('datos_completos_json'):
                try:
                    datos_completos = json.loads(row_dict['datos_completos_json'])
                    datos_completos = decrypt_sensitive_fields(datos_completos)
                except Exception as e:
                    logger.error(f"Error desencriptando datos completos: {e}")
                    datos_completos = {}
            
            mapeo = MapeoRATResponse(
                id=row_dict['id'],
                nombre_actividad=row_dict['nombre_actividad'],
                area_responsable=row_dict['area_responsable'],
                base_licitud=row_dict['base_licitud'],
                estado=row_dict['estado'],
                version=row_dict['version'],
                tenant_id=row_dict['tenant_id'],
                created_by=row_dict['created_by'],
                created_at=row_dict['created_at'],
                updated_at=row_dict['updated_at'],
                datos_completos=datos_completos
            )
            mapeos.append(mapeo)
        
        # Log de auditoría
        audit_logger.log_data_access(
            current_user.tenant_id, str(current_user.id),
            "mapeos_rat", "READ", True
        )
        
        return mapeos
        
    except Exception as e:
        logger.error(f"Error obteniendo RATs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error obteniendo registros RAT"
        )

@router.get("/{rat_id}", response_model=MapeoRATResponse)
async def get_mapeo_rat(
    rat_id: str,
    current_user: User = Depends(get_tenant_user),
    db: Session = Depends(get_master_db)
):
    """
    Obtiene un RAT específico por ID
    """
    try:
        # Validar format UUID
        try:
            uuid.UUID(rat_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ID de RAT inválido"
            )
        
        query = text("""
            SELECT * FROM mapeos_datos 
            WHERE id = :rat_id AND tenant_id = :tenant_id
        """)
        
        result = db.execute(query, {
            "rat_id": rat_id,
            "tenant_id": current_user.tenant_id
        })
        
        row = result.fetchone()
        
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="RAT no encontrado"
            )
        
        row_dict = dict(row)
        
        # Desencriptar datos completos
        datos_completos = {}
        if row_dict.get('datos_completos_json'):
            try:
                datos_completos = json.loads(row_dict['datos_completos_json'])
                datos_completos = decrypt_sensitive_fields(datos_completos)
            except Exception as e:
                logger.error(f"Error desencriptando datos: {e}")
                datos_completos = {}
        
        # Log de auditoría
        audit_logger.log_data_access(
            current_user.tenant_id, str(current_user.id),
            f"mapeo_rat:{rat_id}", "READ", True
        )
        
        return MapeoRATResponse(
            id=row_dict['id'],
            nombre_actividad=row_dict['nombre_actividad'],
            area_responsable=row_dict['area_responsable'],
            base_licitud=row_dict['base_licitud'],
            estado=row_dict['estado'],
            version=row_dict['version'],
            tenant_id=row_dict['tenant_id'],
            created_by=row_dict['created_by'],
            created_at=row_dict['created_at'],
            updated_at=row_dict['updated_at'],
            datos_completos=datos_completos
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo RAT {rat_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error obteniendo RAT"
        )

@router.put("/{rat_id}", response_model=MapeoRATResponse)
async def update_mapeo_rat(
    rat_id: str,
    mapeo_update: MapeoRATUpdate,
    request: Request,
    current_user: User = Depends(get_tenant_user),
    db: Session = Depends(get_master_db)
):
    """
    Actualiza un RAT existente
    """
    try:
        client_ip = request.client.host if request.client else "unknown"
        
        # Validar format UUID
        try:
            uuid.UUID(rat_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ID de RAT inválido"
            )
        
        # Verificar que existe y pertenece al tenant
        check_query = text("""
            SELECT datos_completos_json FROM mapeos_datos 
            WHERE id = :rat_id AND tenant_id = :tenant_id
        """)
        
        existing = db.execute(check_query, {
            "rat_id": rat_id,
            "tenant_id": current_user.tenant_id
        }).fetchone()
        
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="RAT no encontrado"
            )
        
        # Obtener datos actuales
        current_data = {}
        if existing[0]:
            try:
                current_data = json.loads(existing[0])
                current_data = decrypt_sensitive_fields(current_data)
            except Exception as e:
                logger.error(f"Error desencriptando datos actuales: {e}")
        
        # Mergear con datos nuevos (solo campos no nulos)
        update_dict = mapeo_update.dict(exclude_none=True)
        updated_data = {**current_data, **update_dict}
        
        # Validar datos actualizados
        validated_data = validate_rat_data(updated_data)
        
        # Encriptar campos sensibles
        encrypted_data = encrypt_sensitive_fields(validated_data)
        
        # Actualizar en base de datos
        now = datetime.utcnow()
        
        update_query = text("""
            UPDATE mapeos_datos SET
                nombre_actividad = :nombre_actividad,
                area_responsable = :area_responsable,
                base_licitud = :base_licitud,
                finalidad = :finalidad,
                categorias_datos = :categorias_datos,
                transferencias_internacionales = :transferencias_internacionales,
                medidas_seguridad = :medidas_seguridad,
                nivel_riesgo = :nivel_riesgo,
                estado = :estado,
                version = :version,
                datos_completos_json = :datos_completos_json,
                updated_at = :updated_at
            WHERE id = :rat_id AND tenant_id = :tenant_id
        """)
        
        db.execute(update_query, {
            'rat_id': rat_id,
            'tenant_id': current_user.tenant_id,
            'nombre_actividad': validated_data['nombre_actividad'],
            'area_responsable': validated_data['area_responsable'],
            'base_licitud': validated_data['base_licitud'],
            'finalidad': validated_data['finalidad'],
            'categorias_datos': json.dumps(validated_data.get('categorias_datos', {})),
            'transferencias_internacionales': json.dumps(validated_data.get('transferencias_internacionales', {})),
            'medidas_seguridad': json.dumps(validated_data.get('medidas_seguridad', {})),
            'nivel_riesgo': validated_data.get('nivel_riesgo', 'medio'),
            'estado': validated_data.get('estado', 'borrador'),
            'version': validated_data.get('version', '1.0'),
            'datos_completos_json': json.dumps(encrypted_data),
            'updated_at': now
        })
        
        db.commit()
        
        # Log de auditoría
        audit_logger.log_data_access(
            current_user.tenant_id, str(current_user.id),
            f"mapeo_rat:{rat_id}", "UPDATE", True
        )
        
        audit_logger.log_security_event(
            "rat_updated", current_user.tenant_id, str(current_user.id),
            {
                "rat_id": rat_id,
                "nombre_actividad": validated_data['nombre_actividad'],
                "ip_address": client_ip
            },
            "INFO"
        )
        
        # Retornar datos actualizados
        response_data = decrypt_sensitive_fields(encrypted_data.copy())
        
        return MapeoRATResponse(
            id=rat_id,
            nombre_actividad=validated_data['nombre_actividad'],
            area_responsable=validated_data['area_responsable'],
            base_licitud=validated_data['base_licitud'],
            estado=validated_data.get('estado', 'borrador'),
            version=validated_data.get('version', '1.0'),
            tenant_id=current_user.tenant_id,
            created_by=str(current_user.id),
            created_at=now,
            updated_at=now,
            datos_completos=response_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error actualizando RAT {rat_id}: {e}")
        
        audit_logger.log_security_event(
            "rat_update_error", current_user.tenant_id, str(current_user.id),
            {"error": str(e), "rat_id": rat_id},
            "ERROR"
        )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error actualizando RAT"
        )

@router.delete("/{rat_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_mapeo_rat(
    rat_id: str,
    request: Request,
    current_user: User = Depends(get_tenant_user),
    db: Session = Depends(get_master_db)
):
    """
    Elimina un RAT (solo marca como archivado para auditoría)
    """
    try:
        client_ip = request.client.host if request.client else "unknown"
        
        # Validar format UUID
        try:
            uuid.UUID(rat_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ID de RAT inválido"
            )
        
        # En lugar de eliminar, marcar como archivado
        query = text("""
            UPDATE mapeos_datos SET 
                estado = 'archivado',
                updated_at = :updated_at
            WHERE id = :rat_id AND tenant_id = :tenant_id
        """)
        
        result = db.execute(query, {
            "rat_id": rat_id,
            "tenant_id": current_user.tenant_id,
            "updated_at": datetime.utcnow()
        })
        
        if result.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="RAT no encontrado"
            )
        
        db.commit()
        
        # Log de auditoría CRÍTICO
        audit_logger.log_security_event(
            "rat_archived", current_user.tenant_id, str(current_user.id),
            {"rat_id": rat_id, "ip_address": client_ip},
            "CRITICAL"
        )
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error archivando RAT {rat_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error archivando RAT"
        )

@router.get("/{rat_id}/export/json")
async def export_rat_json(
    rat_id: str,
    current_user: User = Depends(get_tenant_user),
    db: Session = Depends(get_master_db)
):
    """
    Exporta un RAT en formato JSON
    """
    try:
        rat = await get_mapeo_rat(rat_id, current_user, db)
        
        # Log de auditoría
        audit_logger.log_data_access(
            current_user.tenant_id, str(current_user.id),
            f"mapeo_rat:{rat_id}", "EXPORT_JSON", True
        )
        
        export_data = {
            "metadata": {
                "exported_at": datetime.utcnow().isoformat(),
                "exported_by": current_user.email,
                "tenant_id": current_user.tenant_id,
                "system": "LPDP Sistema - Ley 21.719"
            },
            "rat": rat.datos_completos
        }
        
        return export_data
        
    except Exception as e:
        logger.error(f"Error exportando RAT {rat_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error exportando RAT"
        )

# ============================================================================
# ENDPOINT DEMO ESPECÍFICO
# ============================================================================

@router.get("/demo/sample", response_model=Dict[str, Any])
async def get_demo_sample():
    """
    Obtiene datos de ejemplo para el modo demo
    """
    if not SecurityConfig.DEMO_MODE_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Modo demo no habilitado"
        )
    
    sample_data = {
        "nombre_actividad": "Gestión de clientes (DEMO)",
        "area_responsable": "Departamento Comercial",
        "base_licitud": "Consentimiento",
        "finalidad": "Gestión de la relación comercial con clientes",
        "categorias_datos": {
            "identificacion": ["Nombre completo", "RUT", "Fecha nacimiento"],
            "contacto": ["Email", "Teléfono", "Dirección"]
        },
        "nivel_riesgo": "medio",
        "estado": "demo",
        "version": "1.0-demo",
        "observaciones": "Datos de ejemplo para demostración del sistema"
    }
    
    return sample_data