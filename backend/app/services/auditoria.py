from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime
import hashlib
import json
from sqlalchemy.orm import Session

from app.models import Auditoria


def generar_hash(datos: str, hash_anterior: Optional[str] = None) -> str:
    """Generar hash SHA256 para cadena de auditoría inmutable"""
    contenido = datos + (hash_anterior or "")
    return hashlib.sha256(contenido.encode()).hexdigest()


def registrar_auditoria(
    db: Session,
    usuario_id: UUID,
    accion: str,
    entidad: str,
    entidad_id: UUID,
    datos_anteriores: Optional[Dict[str, Any]] = None,
    datos_nuevos: Optional[Dict[str, Any]] = None,
    organizacion_id: Optional[UUID] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None
) -> Auditoria:
    """Registrar una acción en el log de auditoría inmutable"""
    
    # Obtener el hash anterior
    ultima_auditoria = db.query(Auditoria).order_by(
        Auditoria.fecha_hora.desc()
    ).first()
    
    hash_anterior = ultima_auditoria.hash_actual if ultima_auditoria else None
    
    # Preparar datos para el hash
    datos_hash = {
        "fecha_hora": datetime.utcnow().isoformat(),
        "usuario_id": str(usuario_id),
        "accion": accion,
        "entidad": entidad,
        "entidad_id": str(entidad_id),
        "datos_anteriores": datos_anteriores,
        "datos_nuevos": datos_nuevos
    }
    
    # Generar nuevo hash
    hash_actual = generar_hash(json.dumps(datos_hash, sort_keys=True), hash_anterior)
    
    # Crear registro de auditoría
    auditoria = Auditoria(
        organizacion_id=organizacion_id or UUID("11111111-1111-1111-1111-111111111111"),  # TODO: Obtener del contexto
        usuario_id=usuario_id,
        fecha_hora=datetime.utcnow(),
        accion=accion,
        entidad=entidad,
        entidad_id=entidad_id,
        datos_anteriores=datos_anteriores,
        datos_nuevos=datos_nuevos,
        ip_address=ip_address,
        user_agent=user_agent,
        hash_anterior=hash_anterior,
        hash_actual=hash_actual
    )
    
    db.add(auditoria)
    db.commit()
    
    return auditoria


def verificar_integridad_auditoria(db: Session) -> Dict[str, Any]:
    """Verificar la integridad de la cadena de auditoría"""
    auditorias = db.query(Auditoria).order_by(Auditoria.fecha_hora).all()
    
    if not auditorias:
        return {"valido": True, "mensaje": "No hay registros de auditoría"}
    
    errores = []
    hash_anterior = None
    
    for i, auditoria in enumerate(auditorias):
        # Verificar que el hash_anterior coincida
        if auditoria.hash_anterior != hash_anterior:
            errores.append({
                "posicion": i,
                "id": str(auditoria.id),
                "error": "Hash anterior no coincide con el registro previo"
            })
        
        # Recalcular el hash y verificar
        datos_hash = {
            "fecha_hora": auditoria.fecha_hora.isoformat(),
            "usuario_id": str(auditoria.usuario_id),
            "accion": auditoria.accion,
            "entidad": auditoria.entidad,
            "entidad_id": str(auditoria.entidad_id),
            "datos_anteriores": auditoria.datos_anteriores,
            "datos_nuevos": auditoria.datos_nuevos
        }
        
        hash_calculado = generar_hash(
            json.dumps(datos_hash, sort_keys=True),
            auditoria.hash_anterior
        )
        
        if hash_calculado != auditoria.hash_actual:
            errores.append({
                "posicion": i,
                "id": str(auditoria.id),
                "error": "Hash calculado no coincide con el almacenado"
            })
        
        hash_anterior = auditoria.hash_actual
    
    return {
        "valido": len(errores) == 0,
        "total_registros": len(auditorias),
        "errores": errores
    }