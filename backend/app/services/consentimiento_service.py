"""
Servicio para gestión de consentimientos (Módulo 1)
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
import uuid
import hashlib
import json

from app.models import (
    TitularDatos, 
    Proposito, 
    Consentimiento,
    ConsentimientoProprosito,
    HistorialConsentimiento
)
from app.core.security import encrypt_field, decrypt_field


class ConsentimientoService:
    
    def create_titular(
        self,
        db: Session,
        tenant_id: str,
        tipo_identificacion: str,
        numero_identificacion: str,
        nombre: str,
        email: str,
        telefono: Optional[str] = None,
        direccion: Optional[str] = None,
        fecha_nacimiento: Optional[datetime] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> TitularDatos:
        """Crea un nuevo titular de datos"""
        
        # Verificar si ya existe
        existing = db.query(TitularDatos).filter(
            and_(
                TitularDatos.tenant_id == tenant_id,
                TitularDatos.numero_identificacion == numero_identificacion
            )
        ).first()
        
        if existing:
            raise ValueError("El titular ya existe")
        
        # Generar hash único
        hash_input = f"{tipo_identificacion}:{numero_identificacion}:{tenant_id}"
        hash_unico = hashlib.sha256(hash_input.encode()).hexdigest()
        
        titular = TitularDatos(
            tenant_id=tenant_id,
            tipo_identificacion=tipo_identificacion,
            numero_identificacion=encrypt_field(numero_identificacion),
            nombre=encrypt_field(nombre),
            email=encrypt_field(email),
            telefono=encrypt_field(telefono) if telefono else None,
            direccion=encrypt_field(direccion) if direccion else None,
            fecha_nacimiento=fecha_nacimiento,
            hash_unico=hash_unico,
            activo=True,
            metadata=metadata or {}
        )
        
        db.add(titular)
        db.commit()
        db.refresh(titular)
        
        return titular
    
    def get_titular_by_identificacion(
        self,
        db: Session,
        tenant_id: str,
        numero_identificacion: str
    ) -> Optional[TitularDatos]:
        """Busca un titular por su número de identificación"""
        
        # Buscar por hash para optimizar
        hash_input = f"{numero_identificacion}:{tenant_id}"
        
        titulares = db.query(TitularDatos).filter(
            and_(
                TitularDatos.tenant_id == tenant_id,
                TitularDatos.activo == True
            )
        ).all()
        
        # Desencriptar y comparar
        for titular in titulares:
            if decrypt_field(titular.numero_identificacion) == numero_identificacion:
                return titular
        
        return None
    
    def create_proposito(
        self,
        db: Session,
        tenant_id: str,
        nombre: str,
        descripcion: str,
        base_legal: str,
        categoria: str,
        duracion_dias: Optional[int] = None,
        requiere_consentimiento: bool = True,
        es_sensible: bool = False,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Proposito:
        """Crea un nuevo propósito de tratamiento"""
        
        proposito = Proposito(
            tenant_id=tenant_id,
            nombre=nombre,
            descripcion=descripcion,
            base_legal=base_legal,
            categoria=categoria,
            duracion_dias=duracion_dias,
            requiere_consentimiento=requiere_consentimiento,
            es_sensible=es_sensible,
            activo=True,
            metadata=metadata or {}
        )
        
        db.add(proposito)
        db.commit()
        db.refresh(proposito)
        
        return proposito
    
    def register_consentimiento(
        self,
        db: Session,
        tenant_id: str,
        titular_id: str,
        proposito_ids: List[str],
        metodo_obtencion: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        ubicacion: Optional[str] = None,
        duracion_personalizada: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Consentimiento:
        """Registra un nuevo consentimiento"""
        
        # Verificar titular
        titular = db.query(TitularDatos).filter(
            and_(
                TitularDatos.id == titular_id,
                TitularDatos.tenant_id == tenant_id
            )
        ).first()
        
        if not titular:
            raise ValueError("Titular no encontrado")
        
        # Crear consentimiento
        consentimiento = Consentimiento(
            tenant_id=tenant_id,
            titular_id=titular_id,
            fecha_consentimiento=datetime.utcnow(),
            metodo_obtencion=metodo_obtencion,
            ip_origen=ip_address,
            user_agent=user_agent,
            ubicacion=ubicacion,
            estado="activo",
            version_terminos="1.0",  # Esto debería venir de configuración
            metadata=metadata or {}
        )
        
        db.add(consentimiento)
        db.flush()  # Para obtener el ID
        
        # Asociar propósitos
        for proposito_id in proposito_ids:
            proposito = db.query(Proposito).filter(
                and_(
                    Proposito.id == proposito_id,
                    Proposito.tenant_id == tenant_id,
                    Proposito.activo == True
                )
            ).first()
            
            if proposito:
                # Calcular fecha de expiración
                if duracion_personalizada:
                    fecha_expiracion = datetime.utcnow() + timedelta(days=duracion_personalizada)
                elif proposito.duracion_dias:
                    fecha_expiracion = datetime.utcnow() + timedelta(days=proposito.duracion_dias)
                else:
                    fecha_expiracion = None
                
                cons_prop = ConsentimientoProprosito(
                    consentimiento_id=consentimiento.id,
                    proposito_id=proposito_id,
                    aceptado=True,
                    fecha_expiracion=fecha_expiracion
                )
                db.add(cons_prop)
        
        # Registrar en historial
        historial = HistorialConsentimiento(
            tenant_id=tenant_id,
            consentimiento_id=consentimiento.id,
            accion="otorgado",
            fecha_accion=datetime.utcnow(),
            metodo=metodo_obtencion,
            ip_origen=ip_address,
            user_agent=user_agent,
            cambios={"propositos": proposito_ids}
        )
        db.add(historial)
        
        db.commit()
        db.refresh(consentimiento)
        
        return consentimiento
    
    def revoke_consentimiento(
        self,
        db: Session,
        tenant_id: str,
        consentimiento_id: str,
        proposito_ids: Optional[List[str]] = None,
        motivo: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Consentimiento:
        """Revoca un consentimiento total o parcialmente"""
        
        consentimiento = db.query(Consentimiento).filter(
            and_(
                Consentimiento.id == consentimiento_id,
                Consentimiento.tenant_id == tenant_id
            )
        ).first()
        
        if not consentimiento:
            raise ValueError("Consentimiento no encontrado")
        
        cambios = {"motivo": motivo}
        
        if proposito_ids:
            # Revocación parcial
            db.query(ConsentimientoProprosito).filter(
                and_(
                    ConsentimientoProprosito.consentimiento_id == consentimiento_id,
                    ConsentimientoProprosito.proposito_id.in_(proposito_ids)
                )
            ).update({"aceptado": False})
            
            cambios["propositos_revocados"] = proposito_ids
            
            # Verificar si quedan propósitos activos
            activos = db.query(ConsentimientoProprosito).filter(
                and_(
                    ConsentimientoProprosito.consentimiento_id == consentimiento_id,
                    ConsentimientoProprosito.aceptado == True
                )
            ).count()
            
            if activos == 0:
                consentimiento.estado = "revocado"
                consentimiento.fecha_revocacion = datetime.utcnow()
        else:
            # Revocación total
            consentimiento.estado = "revocado"
            consentimiento.fecha_revocacion = datetime.utcnow()
            
            db.query(ConsentimientoProprosito).filter(
                ConsentimientoProprosito.consentimiento_id == consentimiento_id
            ).update({"aceptado": False})
            
            cambios["revocacion_total"] = True
        
        # Registrar en historial
        historial = HistorialConsentimiento(
            tenant_id=tenant_id,
            consentimiento_id=consentimiento.id,
            accion="revocado",
            fecha_accion=datetime.utcnow(),
            metodo="manual",
            ip_origen=ip_address,
            user_agent=user_agent,
            cambios=cambios
        )
        db.add(historial)
        
        db.commit()
        db.refresh(consentimiento)
        
        return consentimiento
    
    def get_consentimientos_titular(
        self,
        db: Session,
        tenant_id: str,
        titular_id: str,
        solo_activos: bool = True
    ) -> List[Dict[str, Any]]:
        """Obtiene todos los consentimientos de un titular"""
        
        query = db.query(Consentimiento).filter(
            and_(
                Consentimiento.tenant_id == tenant_id,
                Consentimiento.titular_id == titular_id
            )
        )
        
        if solo_activos:
            query = query.filter(Consentimiento.estado == "activo")
        
        consentimientos = query.all()
        
        result = []
        for cons in consentimientos:
            # Obtener propósitos
            propositos = db.query(
                Proposito,
                ConsentimientoProprosito
            ).join(
                ConsentimientoProprosito,
                Proposito.id == ConsentimientoProprosito.proposito_id
            ).filter(
                ConsentimientoProprosito.consentimiento_id == cons.id
            ).all()
            
            propositos_data = []
            for prop, cons_prop in propositos:
                propositos_data.append({
                    "id": prop.id,
                    "nombre": prop.nombre,
                    "descripcion": prop.descripcion,
                    "aceptado": cons_prop.aceptado,
                    "fecha_expiracion": cons_prop.fecha_expiracion.isoformat() if cons_prop.fecha_expiracion else None
                })
            
            result.append({
                "id": cons.id,
                "fecha_consentimiento": cons.fecha_consentimiento.isoformat(),
                "estado": cons.estado,
                "metodo_obtencion": cons.metodo_obtencion,
                "propositos": propositos_data,
                "fecha_revocacion": cons.fecha_revocacion.isoformat() if cons.fecha_revocacion else None
            })
        
        return result
    
    def verificar_consentimiento(
        self,
        db: Session,
        tenant_id: str,
        titular_id: str,
        proposito_id: str
    ) -> bool:
        """Verifica si existe consentimiento activo para un propósito"""
        
        exists = db.query(ConsentimientoProprosito).join(
            Consentimiento
        ).filter(
            and_(
                Consentimiento.tenant_id == tenant_id,
                Consentimiento.titular_id == titular_id,
                Consentimiento.estado == "activo",
                ConsentimientoProprosito.proposito_id == proposito_id,
                ConsentimientoProprosito.aceptado == True,
                or_(
                    ConsentimientoProprosito.fecha_expiracion == None,
                    ConsentimientoProprosito.fecha_expiracion > datetime.utcnow()
                )
            )
        ).first()
        
        return exists is not None
    
    def export_consentimientos(
        self,
        db: Session,
        tenant_id: str,
        formato: str = "json",
        fecha_desde: Optional[datetime] = None,
        fecha_hasta: Optional[datetime] = None
    ) -> bytes:
        """Exporta consentimientos en diferentes formatos"""
        
        query = db.query(Consentimiento).filter(
            Consentimiento.tenant_id == tenant_id
        )
        
        if fecha_desde:
            query = query.filter(Consentimiento.fecha_consentimiento >= fecha_desde)
        
        if fecha_hasta:
            query = query.filter(Consentimiento.fecha_consentimiento <= fecha_hasta)
        
        consentimientos = query.all()
        
        data = []
        for cons in consentimientos:
            # Obtener titular (desencriptar datos)
            titular = cons.titular
            
            # Obtener propósitos
            propositos = db.query(
                Proposito,
                ConsentimientoProprosito
            ).join(
                ConsentimientoProprosito,
                Proposito.id == ConsentimientoProprosito.proposito_id
            ).filter(
                ConsentimientoProprosito.consentimiento_id == cons.id
            ).all()
            
            data.append({
                "consentimiento_id": cons.id,
                "fecha": cons.fecha_consentimiento.isoformat(),
                "titular": {
                    "nombre": decrypt_field(titular.nombre),
                    "email": decrypt_field(titular.email),
                    "identificacion": decrypt_field(titular.numero_identificacion)
                },
                "propositos": [
                    {
                        "nombre": p.nombre,
                        "aceptado": cp.aceptado,
                        "fecha_expiracion": cp.fecha_expiracion.isoformat() if cp.fecha_expiracion else None
                    }
                    for p, cp in propositos
                ],
                "estado": cons.estado,
                "metodo": cons.metodo_obtencion
            })
        
        if formato == "json":
            return json.dumps(data, indent=2, ensure_ascii=False).encode()
        
        # Aquí se podrían agregar otros formatos como CSV, Excel, etc.
        
        return json.dumps(data).encode()