"""
Servicio de gestión de licencias y módulos
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from cryptography.fernet import Fernet
import json
import base64
import secrets
import string

from app.core.config import settings
from app.models import Empresa, Licencia, ModuloAcceso
from app.schemas.empresa import LicenciaCreate, ModuloAccesoCreate


class LicenseService:
    def __init__(self):
        # Generar clave de encriptación desde settings
        key = base64.urlsafe_b64encode(
            settings.LICENSE_ENCRYPTION_KEY.encode()[:32].ljust(32, b'0')
        )
        self.cipher_suite = Fernet(key)
        
        self.module_info = {
            "MOD-1": {
                "name": "Gestión de Consentimientos",
                "description": "Registro y gestión de consentimientos según Art. 12",
                "base_price": settings.MODULE_PRICES["MOD-1"]
            },
            "MOD-2": {
                "name": "Derechos ARCOPOL",
                "description": "Gestión de solicitudes de derechos del titular",
                "base_price": settings.MODULE_PRICES["MOD-2"]
            },
            "MOD-3": {
                "name": "Inventario de Datos",
                "description": "Registro de actividades de tratamiento",
                "base_price": settings.MODULE_PRICES["MOD-3"]
            },
            "MOD-4": {
                "name": "Notificación de Brechas",
                "description": "Gestión y notificación de brechas de seguridad",
                "base_price": settings.MODULE_PRICES["MOD-4"]
            },
            "MOD-5": {
                "name": "Evaluaciones de Impacto",
                "description": "DPIA - Evaluaciones de impacto en privacidad",
                "base_price": settings.MODULE_PRICES["MOD-5"]
            },
            "MOD-6": {
                "name": "Transferencias Internacionales",
                "description": "Control de transferencias internacionales de datos",
                "base_price": settings.MODULE_PRICES["MOD-6"]
            },
            "MOD-7": {
                "name": "Auditoría y Cumplimiento",
                "description": "Herramientas de auditoría y reportes de cumplimiento",
                "base_price": settings.MODULE_PRICES["MOD-7"]
            }
        }
    
    def generate_license_key(self, length: int = 20) -> str:
        """Genera una clave de licencia única"""
        characters = string.ascii_uppercase + string.digits
        
        # Generar clave en formato XXXX-XXXX-XXXX-XXXX-XXXX
        key_parts = []
        for i in range(5):
            part = ''.join(secrets.choice(characters) for _ in range(4))
            key_parts.append(part)
        
        return '-'.join(key_parts)
    
    def create_license(
        self,
        db: Session,
        empresa_id: str,
        tipo_licencia: str,
        duracion_dias: int,
        modulos: List[str],
        max_usuarios: int = 5,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Licencia:
        """Crea una nueva licencia para una empresa"""
        
        # Generar clave de licencia
        license_key = self.generate_license_key()
        
        # Calcular fechas
        fecha_inicio = datetime.utcnow()
        fecha_expiracion = fecha_inicio + timedelta(days=duracion_dias)
        
        # Calcular precio total
        precio_total = sum(
            self.module_info[mod]["base_price"] 
            for mod in modulos 
            if mod in self.module_info
        )
        
        # Preparar datos de la licencia
        license_data = {
            "empresa_id": empresa_id,
            "license_key": license_key,
            "tipo": tipo_licencia,
            "modulos": modulos,
            "max_usuarios": max_usuarios,
            "fecha_inicio": fecha_inicio.isoformat(),
            "fecha_expiracion": fecha_expiracion.isoformat(),
            "metadata": metadata or {}
        }
        
        # Encriptar datos sensibles
        encrypted_data = self.cipher_suite.encrypt(
            json.dumps(license_data).encode()
        )
        
        # Crear registro de licencia
        licencia = Licencia(
            empresa_id=empresa_id,
            tipo_licencia=tipo_licencia,
            fecha_inicio=fecha_inicio,
            fecha_expiracion=fecha_expiracion,
            activa=True,
            clave_licencia=license_key,
            datos_encriptados=encrypted_data.decode(),
            max_usuarios=max_usuarios,
            usuarios_actuales=0,
            precio_total=precio_total,
            moneda="CLP",
            metadata=metadata
        )
        db.add(licencia)
        db.commit()
        
        # Crear accesos a módulos
        for modulo_codigo in modulos:
            if modulo_codigo in self.module_info:
                modulo_acceso = ModuloAcceso(
                    empresa_id=empresa_id,
                    modulo_codigo=modulo_codigo,
                    activo=True,
                    fecha_activacion=fecha_inicio,
                    fecha_expiracion=fecha_expiracion,
                    configuracion={
                        "nombre": self.module_info[modulo_codigo]["name"],
                        "descripcion": self.module_info[modulo_codigo]["description"]
                    }
                )
                db.add(modulo_acceso)
        
        db.commit()
        db.refresh(licencia)
        
        return licencia
    
    def validate_license(
        self,
        db: Session,
        license_key: str
    ) -> Optional[Dict[str, Any]]:
        """Valida una clave de licencia"""
        
        # Buscar licencia
        licencia = db.query(Licencia).filter(
            Licencia.clave_licencia == license_key
        ).first()
        
        if not licencia:
            return None
        
        # Verificar estado
        if not licencia.activa:
            return {"valid": False, "reason": "Licencia inactiva"}
        
        # Verificar expiración
        if licencia.fecha_expiracion < datetime.utcnow():
            licencia.activa = False
            db.commit()
            return {"valid": False, "reason": "Licencia expirada"}
        
        # Desencriptar datos
        try:
            decrypted_data = self.cipher_suite.decrypt(
                licencia.datos_encriptados.encode()
            )
            license_data = json.loads(decrypted_data.decode())
        except:
            return {"valid": False, "reason": "Error al validar licencia"}
        
        return {
            "valid": True,
            "empresa_id": licencia.empresa_id,
            "tipo": licencia.tipo_licencia,
            "modulos": license_data.get("modulos", []),
            "max_usuarios": licencia.max_usuarios,
            "usuarios_actuales": licencia.usuarios_actuales,
            "fecha_expiracion": licencia.fecha_expiracion.isoformat(),
            "dias_restantes": (licencia.fecha_expiracion - datetime.utcnow()).days
        }
    
    def check_module_access(
        self,
        db: Session,
        empresa_id: str,
        modulo_codigo: str
    ) -> bool:
        """Verifica si una empresa tiene acceso a un módulo"""
        
        acceso = db.query(ModuloAcceso).filter(
            ModuloAcceso.empresa_id == empresa_id,
            ModuloAcceso.modulo_codigo == modulo_codigo,
            ModuloAcceso.activo == True
        ).first()
        
        if not acceso:
            return False
        
        # Verificar expiración
        if acceso.fecha_expiracion and acceso.fecha_expiracion < datetime.utcnow():
            acceso.activo = False
            db.commit()
            return False
        
        return True
    
    def get_empresa_modules(
        self,
        db: Session,
        empresa_id: str
    ) -> List[Dict[str, Any]]:
        """Obtiene los módulos activos de una empresa"""
        
        modulos = db.query(ModuloAcceso).filter(
            ModuloAcceso.empresa_id == empresa_id,
            ModuloAcceso.activo == True
        ).all()
        
        result = []
        for modulo in modulos:
            # Verificar expiración
            if modulo.fecha_expiracion and modulo.fecha_expiracion < datetime.utcnow():
                modulo.activo = False
                db.commit()
                continue
            
            module_info = self.module_info.get(modulo.modulo_codigo, {})
            result.append({
                "codigo": modulo.modulo_codigo,
                "nombre": module_info.get("name", ""),
                "descripcion": module_info.get("description", ""),
                "activo": modulo.activo,
                "fecha_activacion": modulo.fecha_activacion.isoformat(),
                "fecha_expiracion": modulo.fecha_expiracion.isoformat() if modulo.fecha_expiracion else None,
                "dias_restantes": (modulo.fecha_expiracion - datetime.utcnow()).days if modulo.fecha_expiracion else None,
                "uso_actual": modulo.uso_actual,
                "limite_uso": modulo.limite_uso
            })
        
        return result
    
    def renew_license(
        self,
        db: Session,
        license_id: str,
        additional_days: int
    ) -> Optional[Licencia]:
        """Renueva una licencia existente"""
        
        licencia = db.query(Licencia).filter(
            Licencia.id == license_id
        ).first()
        
        if not licencia:
            return None
        
        # Calcular nueva fecha de expiración
        if licencia.fecha_expiracion > datetime.utcnow():
            # Si aún no expira, agregar días desde la fecha actual de expiración
            nueva_expiracion = licencia.fecha_expiracion + timedelta(days=additional_days)
        else:
            # Si ya expiró, agregar días desde hoy
            nueva_expiracion = datetime.utcnow() + timedelta(days=additional_days)
        
        licencia.fecha_expiracion = nueva_expiracion
        licencia.activa = True
        licencia.fecha_renovacion = datetime.utcnow()
        
        # Actualizar módulos
        modulos = db.query(ModuloAcceso).filter(
            ModuloAcceso.empresa_id == licencia.empresa_id
        ).all()
        
        for modulo in modulos:
            modulo.fecha_expiracion = nueva_expiracion
            modulo.activo = True
        
        db.commit()
        db.refresh(licencia)
        
        return licencia
    
    def suspend_license(
        self,
        db: Session,
        license_id: str,
        reason: str
    ) -> bool:
        """Suspende una licencia"""
        
        licencia = db.query(Licencia).filter(
            Licencia.id == license_id
        ).first()
        
        if not licencia:
            return False
        
        licencia.activa = False
        licencia.fecha_suspension = datetime.utcnow()
        
        # Agregar razón a metadata
        if not licencia.metadata:
            licencia.metadata = {}
        licencia.metadata["suspension_reason"] = reason
        licencia.metadata["suspended_at"] = datetime.utcnow().isoformat()
        
        # Desactivar módulos
        db.query(ModuloAcceso).filter(
            ModuloAcceso.empresa_id == licencia.empresa_id
        ).update({"activo": False})
        
        db.commit()
        
        return True
    
    def get_license_usage_stats(
        self,
        db: Session,
        empresa_id: str
    ) -> Dict[str, Any]:
        """Obtiene estadísticas de uso de licencia"""
        
        licencia = db.query(Licencia).filter(
            Licencia.empresa_id == empresa_id,
            Licencia.activa == True
        ).first()
        
        if not licencia:
            return {}
        
        modulos = self.get_empresa_modules(db, empresa_id)
        
        return {
            "licencia_id": licencia.id,
            "tipo": licencia.tipo_licencia,
            "activa": licencia.activa,
            "fecha_inicio": licencia.fecha_inicio.isoformat(),
            "fecha_expiracion": licencia.fecha_expiracion.isoformat(),
            "dias_restantes": (licencia.fecha_expiracion - datetime.utcnow()).days,
            "usuarios": {
                "actuales": licencia.usuarios_actuales,
                "maximo": licencia.max_usuarios,
                "porcentaje_uso": (licencia.usuarios_actuales / licencia.max_usuarios * 100) if licencia.max_usuarios > 0 else 0
            },
            "modulos": {
                "total": len(modulos),
                "activos": len([m for m in modulos if m["activo"]]),
                "detalle": modulos
            },
            "precio_total": licencia.precio_total,
            "moneda": licencia.moneda
        }