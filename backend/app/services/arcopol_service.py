"""
Servicio para gestión de derechos ARCOPOL (Módulo 2)
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
import uuid
import os
import hashlib
from pathlib import Path

from app.models import (
    SolicitudARCOPOL,
    DocumentoSolicitud,
    RespuestaSolicitud,
    HistorialSolicitud,
    TitularDatos
)
from app.core.security import encrypt_field, decrypt_field
from app.core.config import settings


class ARCOPOLService:
    
    TIPOS_DERECHO = {
        "acceso": {
            "nombre": "Acceso",
            "descripcion": "Derecho a obtener información sobre sus datos personales",
            "plazo_dias": 20
        },
        "rectificacion": {
            "nombre": "Rectificación",
            "descripcion": "Derecho a corregir datos inexactos o incompletos",
            "plazo_dias": 5
        },
        "cancelacion": {
            "nombre": "Cancelación",
            "descripcion": "Derecho a eliminar sus datos personales",
            "plazo_dias": 20
        },
        "oposicion": {
            "nombre": "Oposición",
            "descripcion": "Derecho a oponerse al tratamiento de sus datos",
            "plazo_dias": 5
        },
        "portabilidad": {
            "nombre": "Portabilidad",
            "descripcion": "Derecho a recibir sus datos en formato estructurado",
            "plazo_dias": 20
        },
        "limitacion": {
            "nombre": "Limitación",
            "descripcion": "Derecho a limitar el tratamiento de sus datos",
            "plazo_dias": 5
        }
    }
    
    def create_solicitud(
        self,
        db: Session,
        tenant_id: str,
        titular_id: str,
        tipo_derecho: str,
        descripcion: str,
        canal_recepcion: str = "web",
        datos_contacto: Optional[Dict[str, str]] = None,
        archivos: Optional[List[Dict[str, Any]]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> SolicitudARCOPOL:
        """Crea una nueva solicitud ARCOPOL"""
        
        # Verificar tipo de derecho válido
        if tipo_derecho not in self.TIPOS_DERECHO:
            raise ValueError(f"Tipo de derecho inválido: {tipo_derecho}")
        
        # Verificar titular
        titular = db.query(TitularDatos).filter(
            and_(
                TitularDatos.id == titular_id,
                TitularDatos.tenant_id == tenant_id
            )
        ).first()
        
        if not titular:
            raise ValueError("Titular no encontrado")
        
        # Generar número de solicitud único
        numero_solicitud = self._generar_numero_solicitud(db, tenant_id)
        
        # Calcular fecha límite
        plazo_dias = self.TIPOS_DERECHO[tipo_derecho]["plazo_dias"]
        fecha_limite = datetime.utcnow() + timedelta(days=plazo_dias)
        
        # Crear solicitud
        solicitud = SolicitudARCOPOL(
            tenant_id=tenant_id,
            titular_id=titular_id,
            numero_solicitud=numero_solicitud,
            tipo_derecho=tipo_derecho,
            estado="recibida",
            fecha_solicitud=datetime.utcnow(),
            fecha_limite_respuesta=fecha_limite,
            descripcion=descripcion,
            canal_recepcion=canal_recepcion,
            datos_contacto=encrypt_field(datos_contacto) if datos_contacto else None,
            metadata=metadata or {}
        )
        
        db.add(solicitud)
        db.flush()
        
        # Adjuntar archivos si los hay
        if archivos:
            for archivo in archivos:
                self._adjuntar_documento(
                    db,
                    solicitud.id,
                    archivo.get("nombre"),
                    archivo.get("tipo"),
                    archivo.get("contenido"),
                    archivo.get("tamaño")
                )
        
        # Registrar en historial
        self._registrar_historial(
            db,
            tenant_id,
            solicitud.id,
            "creada",
            f"Solicitud de {self.TIPOS_DERECHO[tipo_derecho]['nombre']} creada",
            {"canal": canal_recepcion}
        )
        
        db.commit()
        db.refresh(solicitud)
        
        return solicitud
    
    def _generar_numero_solicitud(self, db: Session, tenant_id: str) -> str:
        """Genera un número único de solicitud"""
        year = datetime.utcnow().year
        
        # Obtener último número del año
        last_solicitud = db.query(SolicitudARCOPOL).filter(
            and_(
                SolicitudARCOPOL.tenant_id == tenant_id,
                func.extract('year', SolicitudARCOPOL.fecha_solicitud) == year
            )
        ).order_by(SolicitudARCOPOL.fecha_solicitud.desc()).first()
        
        if last_solicitud and last_solicitud.numero_solicitud:
            # Extraer número secuencial
            parts = last_solicitud.numero_solicitud.split('-')
            if len(parts) >= 3:
                seq = int(parts[2]) + 1
            else:
                seq = 1
        else:
            seq = 1
        
        return f"ARCOPOL-{year}-{seq:05d}"
    
    def _adjuntar_documento(
        self,
        db: Session,
        solicitud_id: str,
        nombre: str,
        tipo: str,
        contenido: bytes,
        tamaño: int
    ):
        """Adjunta un documento a una solicitud"""
        
        # Generar ruta única
        filename = f"{uuid.uuid4()}_{nombre}"
        filepath = Path(settings.UPLOAD_DIR) / "arcopol" / solicitud_id[:2] / solicitud_id[2:4]
        filepath.mkdir(parents=True, exist_ok=True)
        
        full_path = filepath / filename
        
        # Guardar archivo
        with open(full_path, 'wb') as f:
            f.write(contenido)
        
        # Crear registro
        documento = DocumentoSolicitud(
            solicitud_id=solicitud_id,
            nombre_archivo=nombre,
            tipo_archivo=tipo,
            tamaño_bytes=tamaño,
            ruta_archivo=str(full_path),
            hash_archivo=hashlib.sha256(contenido).hexdigest()
        )
        
        db.add(documento)
    
    def _registrar_historial(
        self,
        db: Session,
        tenant_id: str,
        solicitud_id: str,
        accion: str,
        descripcion: str,
        detalles: Optional[Dict[str, Any]] = None,
        usuario_id: Optional[str] = None
    ):
        """Registra una acción en el historial"""
        
        historial = HistorialSolicitud(
            tenant_id=tenant_id,
            solicitud_id=solicitud_id,
            fecha_accion=datetime.utcnow(),
            accion=accion,
            descripcion=descripcion,
            usuario_id=usuario_id,
            detalles=detalles or {}
        )
        
        db.add(historial)
    
    def procesar_solicitud(
        self,
        db: Session,
        tenant_id: str,
        solicitud_id: str,
        usuario_id: str,
        notas: Optional[str] = None
    ) -> SolicitudARCOPOL:
        """Marca una solicitud como en proceso"""
        
        solicitud = db.query(SolicitudARCOPOL).filter(
            and_(
                SolicitudARCOPOL.id == solicitud_id,
                SolicitudARCOPOL.tenant_id == tenant_id
            )
        ).first()
        
        if not solicitud:
            raise ValueError("Solicitud no encontrada")
        
        if solicitud.estado != "recibida":
            raise ValueError(f"No se puede procesar una solicitud en estado {solicitud.estado}")
        
        solicitud.estado = "en_proceso"
        solicitud.fecha_inicio_proceso = datetime.utcnow()
        solicitud.asignado_a = usuario_id
        
        if notas:
            if not solicitud.notas_internas:
                solicitud.notas_internas = []
            solicitud.notas_internas.append({
                "fecha": datetime.utcnow().isoformat(),
                "usuario": usuario_id,
                "nota": notas
            })
        
        self._registrar_historial(
            db,
            tenant_id,
            solicitud_id,
            "procesando",
            "Solicitud en proceso",
            {"asignado_a": usuario_id},
            usuario_id
        )
        
        db.commit()
        db.refresh(solicitud)
        
        return solicitud
    
    def responder_solicitud(
        self,
        db: Session,
        tenant_id: str,
        solicitud_id: str,
        usuario_id: str,
        tipo_respuesta: str,
        contenido_respuesta: str,
        adjuntos: Optional[List[Dict[str, Any]]] = None,
        requiere_accion_adicional: bool = False,
        detalles_accion: Optional[str] = None
    ) -> RespuestaSolicitud:
        """Crea una respuesta para una solicitud"""
        
        solicitud = db.query(SolicitudARCOPOL).filter(
            and_(
                SolicitudARCOPOL.id == solicitud_id,
                SolicitudARCOPOL.tenant_id == tenant_id
            )
        ).first()
        
        if not solicitud:
            raise ValueError("Solicitud no encontrada")
        
        # Crear respuesta
        respuesta = RespuestaSolicitud(
            tenant_id=tenant_id,
            solicitud_id=solicitud_id,
            tipo_respuesta=tipo_respuesta,
            fecha_respuesta=datetime.utcnow(),
            contenido_respuesta=contenido_respuesta,
            respondido_por=usuario_id,
            requiere_accion_adicional=requiere_accion_adicional,
            detalles_accion_adicional=detalles_accion if requiere_accion_adicional else None
        )
        
        db.add(respuesta)
        db.flush()
        
        # Adjuntar archivos de respuesta
        if adjuntos:
            for adjunto in adjuntos:
                self._adjuntar_documento(
                    db,
                    solicitud.id,
                    adjunto.get("nombre"),
                    adjunto.get("tipo"),
                    adjunto.get("contenido"),
                    adjunto.get("tamaño")
                )
        
        # Actualizar estado de solicitud
        if tipo_respuesta == "aceptada":
            solicitud.estado = "completada"
        elif tipo_respuesta == "rechazada":
            solicitud.estado = "rechazada"
        elif tipo_respuesta == "parcial":
            solicitud.estado = "completada_parcial"
        
        solicitud.fecha_respuesta = datetime.utcnow()
        
        # Calcular si fue a tiempo
        solicitud.respondida_a_tiempo = datetime.utcnow() <= solicitud.fecha_limite_respuesta
        
        self._registrar_historial(
            db,
            tenant_id,
            solicitud_id,
            "respondida",
            f"Respuesta {tipo_respuesta}",
            {"tipo_respuesta": tipo_respuesta},
            usuario_id
        )
        
        db.commit()
        db.refresh(respuesta)
        
        return respuesta
    
    def get_solicitudes_pendientes(
        self,
        db: Session,
        tenant_id: str,
        usuario_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Obtiene solicitudes pendientes de respuesta"""
        
        query = db.query(SolicitudARCOPOL).filter(
            and_(
                SolicitudARCOPOL.tenant_id == tenant_id,
                SolicitudARCOPOL.estado.in_(["recibida", "en_proceso"])
            )
        )
        
        if usuario_id:
            query = query.filter(SolicitudARCOPOL.asignado_a == usuario_id)
        
        solicitudes = query.order_by(SolicitudARCOPOL.fecha_limite_respuesta).all()
        
        result = []
        for sol in solicitudes:
            dias_restantes = (sol.fecha_limite_respuesta - datetime.utcnow()).days
            
            titular = sol.titular
            
            result.append({
                "id": sol.id,
                "numero_solicitud": sol.numero_solicitud,
                "tipo_derecho": sol.tipo_derecho,
                "estado": sol.estado,
                "fecha_solicitud": sol.fecha_solicitud.isoformat(),
                "fecha_limite": sol.fecha_limite_respuesta.isoformat(),
                "dias_restantes": dias_restantes,
                "urgente": dias_restantes <= 2,
                "titular": {
                    "nombre": decrypt_field(titular.nombre),
                    "email": decrypt_field(titular.email)
                },
                "asignado_a": sol.asignado_a
            })
        
        return result
    
    def get_estadisticas_arcopol(
        self,
        db: Session,
        tenant_id: str,
        fecha_desde: Optional[datetime] = None,
        fecha_hasta: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Obtiene estadísticas de solicitudes ARCOPOL"""
        
        query = db.query(SolicitudARCOPOL).filter(
            SolicitudARCOPOL.tenant_id == tenant_id
        )
        
        if fecha_desde:
            query = query.filter(SolicitudARCOPOL.fecha_solicitud >= fecha_desde)
        
        if fecha_hasta:
            query = query.filter(SolicitudARCOPOL.fecha_solicitud <= fecha_hasta)
        
        solicitudes = query.all()
        
        # Calcular estadísticas
        total = len(solicitudes)
        por_tipo = {}
        por_estado = {}
        a_tiempo = 0
        tiempo_promedio_respuesta = []
        
        for sol in solicitudes:
            # Por tipo
            if sol.tipo_derecho not in por_tipo:
                por_tipo[sol.tipo_derecho] = 0
            por_tipo[sol.tipo_derecho] += 1
            
            # Por estado
            if sol.estado not in por_estado:
                por_estado[sol.estado] = 0
            por_estado[sol.estado] += 1
            
            # A tiempo
            if sol.estado in ["completada", "rechazada", "completada_parcial"]:
                if sol.respondida_a_tiempo:
                    a_tiempo += 1
                
                # Tiempo de respuesta
                if sol.fecha_respuesta:
                    dias = (sol.fecha_respuesta - sol.fecha_solicitud).days
                    tiempo_promedio_respuesta.append(dias)
        
        return {
            "total_solicitudes": total,
            "por_tipo_derecho": por_tipo,
            "por_estado": por_estado,
            "tasa_respuesta_tiempo": (a_tiempo / total * 100) if total > 0 else 0,
            "tiempo_promedio_respuesta_dias": sum(tiempo_promedio_respuesta) / len(tiempo_promedio_respuesta) if tiempo_promedio_respuesta else 0,
            "solicitudes_pendientes": por_estado.get("recibida", 0) + por_estado.get("en_proceso", 0)
        }
    
    def generar_reporte_solicitud(
        self,
        db: Session,
        tenant_id: str,
        solicitud_id: str
    ) -> Dict[str, Any]:
        """Genera un reporte completo de una solicitud"""
        
        solicitud = db.query(SolicitudARCOPOL).filter(
            and_(
                SolicitudARCOPOL.id == solicitud_id,
                SolicitudARCOPOL.tenant_id == tenant_id
            )
        ).first()
        
        if not solicitud:
            raise ValueError("Solicitud no encontrada")
        
        # Datos del titular
        titular = solicitud.titular
        titular_data = {
            "nombre": decrypt_field(titular.nombre),
            "email": decrypt_field(titular.email),
            "identificacion": decrypt_field(titular.numero_identificacion)
        }
        
        # Documentos
        documentos = db.query(DocumentoSolicitud).filter(
            DocumentoSolicitud.solicitud_id == solicitud_id
        ).all()
        
        # Respuestas
        respuestas = db.query(RespuestaSolicitud).filter(
            RespuestaSolicitud.solicitud_id == solicitud_id
        ).all()
        
        # Historial
        historial = db.query(HistorialSolicitud).filter(
            HistorialSolicitud.solicitud_id == solicitud_id
        ).order_by(HistorialSolicitud.fecha_accion).all()
        
        return {
            "solicitud": {
                "id": solicitud.id,
                "numero": solicitud.numero_solicitud,
                "tipo_derecho": solicitud.tipo_derecho,
                "estado": solicitud.estado,
                "fecha_solicitud": solicitud.fecha_solicitud.isoformat(),
                "fecha_limite": solicitud.fecha_limite_respuesta.isoformat(),
                "descripcion": solicitud.descripcion,
                "canal_recepcion": solicitud.canal_recepcion
            },
            "titular": titular_data,
            "documentos": [
                {
                    "nombre": doc.nombre_archivo,
                    "tipo": doc.tipo_archivo,
                    "tamaño": doc.tamaño_bytes,
                    "fecha": doc.created_at.isoformat()
                }
                for doc in documentos
            ],
            "respuestas": [
                {
                    "tipo": resp.tipo_respuesta,
                    "fecha": resp.fecha_respuesta.isoformat(),
                    "contenido": resp.contenido_respuesta,
                    "respondido_por": resp.respondido_por
                }
                for resp in respuestas
            ],
            "historial": [
                {
                    "fecha": hist.fecha_accion.isoformat(),
                    "accion": hist.accion,
                    "descripcion": hist.descripcion,
                    "usuario": hist.usuario_id
                }
                for hist in historial
            ]
        }