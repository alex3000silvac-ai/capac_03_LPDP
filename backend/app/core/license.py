"""
Sistema de gestión de licencias
"""
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_
import logging
import json
from ..models.empresa import Empresa, ModuloAcceso, Licencia
from ..models.tenant import Tenant
from .security import (
    generate_license_key,
    validate_license_key,
    encrypt_field,
    decrypt_field
)
from .tenant import get_tenant_db, create_tenant_schema, get_master_db
from .config import settings

logger = logging.getLogger(__name__)


class LicenseService:
    """Servicio de gestión de licencias"""
    
    @staticmethod
    def create_license(
        empresa_id: str,
        modules: List[str],
        duration_months: int,
        db: Session,
        precio_base: Optional[float] = None,
        descuento: Optional[float] = None
    ) -> Optional[Licencia]:
        """
        Crea una nueva licencia para una empresa
        """
        try:
            # Obtener empresa
            empresa = db.query(Empresa).filter(Empresa.id == empresa_id).first()
            if not empresa:
                logger.error(f"Empresa not found: {empresa_id}")
                return None
            
            # Calcular fechas
            fecha_emision = datetime.utcnow()
            fecha_expiracion = fecha_emision + timedelta(days=30 * duration_months)
            
            # Generar código de licencia
            codigo_licencia = generate_license_key(
                empresa.tenant_id,
                modules,
                fecha_expiracion
            )
            
            # Calcular precio si se proporciona
            if precio_base is None:
                # Calcular desde precios de módulos
                precio_base = sum(
                    settings.MODULE_PRICES.get(mod, 0) for mod in modules
                )
            
            precio_final = precio_base
            if descuento:
                precio_final = precio_base * (1 - descuento / 100)
            
            # Crear licencia
            licencia = Licencia(
                tenant_id=empresa.tenant_id,
                empresa_id=empresa_id,
                codigo_licencia=encrypt_field(codigo_licencia),
                tipo_licencia="modulo" if len(modules) == 1 else "paquete",
                modulos=modules,
                fecha_emision=fecha_emision,
                fecha_expiracion=fecha_expiracion,
                is_active=False,  # Se activa al activar
                precio=precio_base,
                descuento=descuento,
                precio_final=precio_final,
                # Campos de encriptación
                has_encrypted_data=True,
                encryption_key_id=f"lic_{empresa_id}_{fecha_emision.timestamp()}"
            )
            
            db.add(licencia)
            db.commit()
            db.refresh(licencia)
            
            logger.info(f"License created: {licencia.id} for empresa: {empresa_id}")
            return licencia
            
        except Exception as e:
            logger.error(f"Error creating license: {str(e)}")
            db.rollback()
            return None
    
    @staticmethod
    def activate_license(
        license_code: str,
        tenant_id: str,
        db: Session
    ) -> Dict[str, Any]:
        """
        Activa una licencia y crea accesos a módulos
        """
        try:
            # Validar formato de licencia
            license_data = validate_license_key(license_code)
            if not license_data:
                return {
                    "success": False,
                    "error": "Código de licencia inválido"
                }
            
            # Verificar que el tenant coincida
            if license_data["tenant_id"] != tenant_id:
                return {
                    "success": False,
                    "error": "Licencia no válida para esta empresa"
                }
            
            # Buscar licencia en BD (encriptada)
            licencias = db.query(Licencia).filter(
                Licencia.tenant_id == tenant_id,
                Licencia.is_active == False,
                Licencia.is_revoked == False
            ).all()
            
            licencia = None
            for lic in licencias:
                # Desencriptar y comparar
                codigo_dec = decrypt_field(
                    lic.codigo_licencia,
                    lic.encryption_key_id
                )
                if codigo_dec == license_code:
                    licencia = lic
                    break
            
            if not licencia:
                return {
                    "success": False,
                    "error": "Licencia no encontrada o ya activada"
                }
            
            # Verificar expiración
            if licencia.fecha_expiracion < datetime.utcnow():
                return {
                    "success": False,
                    "error": "Licencia expirada"
                }
            
            # Activar licencia
            licencia.is_active = True
            licencia.fecha_activacion = datetime.utcnow()
            
            # Crear accesos a módulos
            for modulo_codigo in licencia.modulos:
                # Verificar si ya existe acceso
                acceso_existente = db.query(ModuloAcceso).filter(
                    ModuloAcceso.empresa_id == licencia.empresa_id,
                    ModuloAcceso.codigo_modulo == modulo_codigo
                ).first()
                
                if acceso_existente:
                    # Extender fecha de expiración
                    if (acceso_existente.fecha_expiracion is None or 
                        acceso_existente.fecha_expiracion < licencia.fecha_expiracion):
                        acceso_existente.fecha_expiracion = licencia.fecha_expiracion
                        acceso_existente.is_active = True
                        acceso_existente.licencia_id = licencia.id
                else:
                    # Crear nuevo acceso
                    modulo_acceso = ModuloAcceso(
                        tenant_id=tenant_id,
                        empresa_id=licencia.empresa_id,
                        codigo_modulo=modulo_codigo,
                        nombre_modulo=LicenseService._get_module_name(modulo_codigo),
                        is_active=True,
                        fecha_activacion=datetime.utcnow(),
                        fecha_expiracion=licencia.fecha_expiracion,
                        licencia_id=licencia.id,
                        # Límites por defecto
                        usuarios_permitidos=10,
                        registros_permitidos=10000,
                        storage_mb_permitido=1024
                    )
                    db.add(modulo_acceso)
            
            db.commit()
            
            return {
                "success": True,
                "message": "Licencia activada exitosamente",
                "modules": licencia.modulos,
                "expiration": licencia.fecha_expiracion.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error activating license: {str(e)}")
            db.rollback()
            return {
                "success": False,
                "error": "Error al activar licencia"
            }
    
    @staticmethod
    def check_license_status(tenant_id: str, db: Session) -> Dict[str, Any]:
        """
        Verifica el estado de las licencias de un tenant
        """
        try:
            # Obtener todas las licencias activas
            licencias = db.query(Licencia).join(Empresa).filter(
                Empresa.tenant_id == tenant_id,
                Licencia.is_active == True,
                Licencia.is_revoked == False
            ).all()
            
            # Obtener módulos activos
            modulos_activos = db.query(ModuloAcceso).join(Empresa).filter(
                Empresa.tenant_id == tenant_id,
                ModuloAcceso.is_active == True,
                ModuloAcceso.fecha_expiracion > datetime.utcnow()
            ).all()
            
            # Calcular estadísticas
            licencias_por_expirar = []
            modulos_disponibles = set()
            
            for licencia in licencias:
                dias_restantes = (licencia.fecha_expiracion - datetime.utcnow()).days
                
                if dias_restantes <= 30:
                    licencias_por_expirar.append({
                        "id": licencia.id,
                        "modulos": licencia.modulos,
                        "dias_restantes": dias_restantes,
                        "fecha_expiracion": licencia.fecha_expiracion.isoformat()
                    })
                
                modulos_disponibles.update(licencia.modulos)
            
            # Verificar límites de uso
            limites_excedidos = []
            for modulo in modulos_activos:
                if modulo.usuarios_actuales > modulo.usuarios_permitidos:
                    limites_excedidos.append({
                        "modulo": modulo.codigo_modulo,
                        "tipo": "usuarios",
                        "actual": modulo.usuarios_actuales,
                        "permitido": modulo.usuarios_permitidos
                    })
                
                if modulo.registros_actuales > modulo.registros_permitidos:
                    limites_excedidos.append({
                        "modulo": modulo.codigo_modulo,
                        "tipo": "registros",
                        "actual": modulo.registros_actuales,
                        "permitido": modulo.registros_permitidos
                    })
            
            return {
                "active_licenses": len(licencias),
                "active_modules": list(modulos_disponibles),
                "expiring_soon": licencias_por_expirar,
                "limits_exceeded": limites_excedidos,
                "status": "ok" if not limites_excedidos and licencias else "warning"
            }
            
        except Exception as e:
            logger.error(f"Error checking license status: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    @staticmethod
    def revoke_license(
        license_id: str,
        reason: str,
        db: Session
    ) -> bool:
        """
        Revoca una licencia
        """
        try:
            licencia = db.query(Licencia).filter(
                Licencia.id == license_id
            ).first()
            
            if not licencia:
                return False
            
            # Revocar licencia
            licencia.is_revoked = True
            licencia.fecha_revocacion = datetime.utcnow()
            licencia.motivo_revocacion = reason
            
            # Desactivar módulos asociados
            db.query(ModuloAcceso).filter(
                ModuloAcceso.licencia_id == license_id
            ).update({
                "is_active": False
            })
            
            db.commit()
            
            logger.info(f"License revoked: {license_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error revoking license: {str(e)}")
            db.rollback()
            return False
    
    @staticmethod
    def extend_license(
        license_id: str,
        additional_months: int,
        db: Session
    ) -> bool:
        """
        Extiende la duración de una licencia
        """
        try:
            licencia = db.query(Licencia).filter(
                Licencia.id == license_id,
                Licencia.is_active == True,
                Licencia.is_revoked == False
            ).first()
            
            if not licencia:
                return False
            
            # Calcular nueva fecha de expiración
            if licencia.fecha_expiracion > datetime.utcnow():
                # Extender desde fecha actual
                nueva_expiracion = licencia.fecha_expiracion + timedelta(
                    days=30 * additional_months
                )
            else:
                # Si ya expiró, extender desde hoy
                nueva_expiracion = datetime.utcnow() + timedelta(
                    days=30 * additional_months
                )
            
            licencia.fecha_expiracion = nueva_expiracion
            
            # Actualizar módulos asociados
            db.query(ModuloAcceso).filter(
                ModuloAcceso.licencia_id == license_id
            ).update({
                "fecha_expiracion": nueva_expiracion,
                "is_active": True
            })
            
            db.commit()
            
            logger.info(f"License extended: {license_id} until {nueva_expiracion}")
            return True
            
        except Exception as e:
            logger.error(f"Error extending license: {str(e)}")
            db.rollback()
            return False
    
    @staticmethod
    def _get_module_name(module_code: str) -> str:
        """Obtiene el nombre del módulo desde su código"""
        module_names = {
            "MOD-1": "Gestión de Consentimientos",
            "MOD-2": "Derechos ARCOPOL",
            "MOD-3": "Inventario de Datos",
            "MOD-4": "Notificación de Brechas",
            "MOD-5": "Evaluaciones de Impacto (DPIA)",
            "MOD-6": "Transferencias Internacionales",
            "MOD-7": "Auditoría y Cumplimiento"
        }
        return module_names.get(module_code, module_code)