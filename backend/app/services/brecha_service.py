"""
Servicio para gestión de brechas de seguridad (Módulo 4)
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
import uuid
import hashlib

from app.models import (
    NotificacionBrecha,
    AfectadoBrecha,
    MedidaMitigacion,
    DocumentoBrecha,
    TitularDatos
)
from app.core.security import encrypt_field, decrypt_field


class BrechaService:
    
    NIVELES_GRAVEDAD = {
        "baja": {
            "descripcion": "Impacto mínimo, datos no sensibles",
            "notificar_autoridad": False,
            "notificar_afectados": False,
            "plazo_horas": 168  # 7 días
        },
        "media": {
            "descripcion": "Impacto moderado, algunos datos personales",
            "notificar_autoridad": True,
            "notificar_afectados": False,
            "plazo_horas": 72  # 3 días
        },
        "alta": {
            "descripcion": "Impacto significativo, datos sensibles o gran volumen",
            "notificar_autoridad": True,
            "notificar_afectados": True,
            "plazo_horas": 72  # 3 días
        },
        "critica": {
            "descripcion": "Impacto severo, riesgo alto para los derechos",
            "notificar_autoridad": True,
            "notificar_afectados": True,
            "plazo_horas": 24  # 1 día
        }
    }
    
    def reportar_brecha(
        self,
        db: Session,
        tenant_id: str,
        tipo_brecha: str,
        descripcion: str,
        fecha_deteccion: datetime,
        fecha_ocurrencia: Optional[datetime] = None,
        categorias_datos_afectadas: Optional[List[str]] = None,
        numero_afectados_estimado: Optional[int] = None,
        sistemas_afectados: Optional[List[str]] = None,
        origen_brecha: Optional[str] = None,
        detectada_por: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> NotificacionBrecha:
        """Registra una nueva brecha de seguridad"""
        
        # Generar código único
        codigo_brecha = self._generar_codigo_brecha(db, tenant_id)
        
        # Si no se conoce fecha de ocurrencia, usar fecha de detección
        if not fecha_ocurrencia:
            fecha_ocurrencia = fecha_deteccion
        
        # Evaluar gravedad inicial
        gravedad = self._evaluar_gravedad_inicial(
            tipo_brecha,
            categorias_datos_afectadas,
            numero_afectados_estimado
        )
        
        # Calcular plazos
        info_gravedad = self.NIVELES_GRAVEDAD[gravedad]
        fecha_limite_notificacion = fecha_deteccion + timedelta(
            hours=info_gravedad["plazo_horas"]
        )
        
        # Crear notificación
        brecha = NotificacionBrecha(
            tenant_id=tenant_id,
            codigo_brecha=codigo_brecha,
            tipo_brecha=tipo_brecha,
            fecha_deteccion=fecha_deteccion,
            fecha_ocurrencia=fecha_ocurrencia,
            descripcion=descripcion,
            gravedad=gravedad,
            estado="detectada",
            categorias_datos_afectadas=categorias_datos_afectadas or [],
            numero_afectados_estimado=numero_afectados_estimado,
            numero_afectados_confirmado=0,
            sistemas_afectados=sistemas_afectados or [],
            origen_brecha=origen_brecha,
            detectada_por=detectada_por,
            requiere_notificacion_autoridad=info_gravedad["notificar_autoridad"],
            requiere_notificacion_afectados=info_gravedad["notificar_afectados"],
            fecha_limite_notificacion=fecha_limite_notificacion,
            metadata=metadata or {}
        )
        
        db.add(brecha)
        db.commit()
        db.refresh(brecha)
        
        return brecha
    
    def _generar_codigo_brecha(self, db: Session, tenant_id: str) -> str:
        """Genera un código único para la brecha"""
        year = datetime.utcnow().year
        month = datetime.utcnow().month
        
        # Obtener última brecha del mes
        last_brecha = db.query(NotificacionBrecha).filter(
            and_(
                NotificacionBrecha.tenant_id == tenant_id,
                func.extract('year', NotificacionBrecha.fecha_deteccion) == year,
                func.extract('month', NotificacionBrecha.fecha_deteccion) == month
            )
        ).order_by(NotificacionBrecha.fecha_deteccion.desc()).first()
        
        if last_brecha and last_brecha.codigo_brecha:
            parts = last_brecha.codigo_brecha.split('-')
            if len(parts) >= 3:
                seq = int(parts[2]) + 1
            else:
                seq = 1
        else:
            seq = 1
        
        return f"BR-{year}{month:02d}-{seq:03d}"
    
    def _evaluar_gravedad_inicial(
        self,
        tipo_brecha: str,
        categorias_datos: Optional[List[str]],
        numero_afectados: Optional[int]
    ) -> str:
        """Evalúa la gravedad inicial de una brecha"""
        
        # Criterios de evaluación
        puntos = 0
        
        # Tipo de brecha
        if tipo_brecha in ["perdida", "destruccion"]:
            puntos += 3
        elif tipo_brecha in ["alteracion", "acceso_no_autorizado"]:
            puntos += 2
        else:
            puntos += 1
        
        # Categorías de datos
        if categorias_datos:
            if any(cat in ["salud", "financieros", "biometricos"] for cat in categorias_datos):
                puntos += 3
            elif any(cat in ["identificacion", "contacto"] for cat in categorias_datos):
                puntos += 2
            else:
                puntos += 1
        
        # Número de afectados
        if numero_afectados:
            if numero_afectados > 1000:
                puntos += 3
            elif numero_afectados > 100:
                puntos += 2
            else:
                puntos += 1
        
        # Determinar gravedad
        if puntos >= 7:
            return "critica"
        elif puntos >= 5:
            return "alta"
        elif puntos >= 3:
            return "media"
        else:
            return "baja"
    
    def agregar_afectados(
        self,
        db: Session,
        tenant_id: str,
        brecha_id: str,
        titular_ids: List[str],
        categorias_datos_comprometidas: Optional[Dict[str, List[str]]] = None,
        nivel_riesgo_individual: Optional[str] = None
    ) -> List[AfectadoBrecha]:
        """Agrega titulares afectados a una brecha"""
        
        brecha = db.query(NotificacionBrecha).filter(
            and_(
                NotificacionBrecha.id == brecha_id,
                NotificacionBrecha.tenant_id == tenant_id
            )
        ).first()
        
        if not brecha:
            raise ValueError("Brecha no encontrada")
        
        afectados = []
        
        for titular_id in titular_ids:
            # Verificar que el titular existe
            titular = db.query(TitularDatos).filter(
                and_(
                    TitularDatos.id == titular_id,
                    TitularDatos.tenant_id == tenant_id
                )
            ).first()
            
            if not titular:
                continue
            
            # Verificar si ya está registrado
            existe = db.query(AfectadoBrecha).filter(
                and_(
                    AfectadoBrecha.brecha_id == brecha_id,
                    AfectadoBrecha.titular_id == titular_id
                )
            ).first()
            
            if existe:
                continue
            
            afectado = AfectadoBrecha(
                tenant_id=tenant_id,
                brecha_id=brecha_id,
                titular_id=titular_id,
                categorias_datos_comprometidas=categorias_datos_comprometidas.get(titular_id, []) if categorias_datos_comprometidas else [],
                nivel_riesgo=nivel_riesgo_individual or "medio",
                notificado=False
            )
            
            db.add(afectado)
            afectados.append(afectado)
        
        # Actualizar contador de afectados
        brecha.numero_afectados_confirmado = db.query(AfectadoBrecha).filter(
            AfectadoBrecha.brecha_id == brecha_id
        ).count()
        
        db.commit()
        
        return afectados
    
    def implementar_medida_mitigacion(
        self,
        db: Session,
        tenant_id: str,
        brecha_id: str,
        tipo_medida: str,
        descripcion: str,
        responsable: str,
        fecha_implementacion_prevista: datetime,
        prioridad: str = "alta",
        recursos_necesarios: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> MedidaMitigacion:
        """Registra una medida de mitigación para una brecha"""
        
        brecha = db.query(NotificacionBrecha).filter(
            and_(
                NotificacionBrecha.id == brecha_id,
                NotificacionBrecha.tenant_id == tenant_id
            )
        ).first()
        
        if not brecha:
            raise ValueError("Brecha no encontrada")
        
        medida = MedidaMitigacion(
            tenant_id=tenant_id,
            brecha_id=brecha_id,
            tipo_medida=tipo_medida,
            descripcion=descripcion,
            estado="planificada",
            responsable=responsable,
            fecha_implementacion_prevista=fecha_implementacion_prevista,
            prioridad=prioridad,
            recursos_necesarios=recursos_necesarios,
            metadata=metadata or {}
        )
        
        db.add(medida)
        
        # Actualizar estado de la brecha si es la primera medida
        if brecha.estado == "detectada":
            brecha.estado = "en_contencion"
        
        db.commit()
        db.refresh(medida)
        
        return medida
    
    def notificar_autoridad(
        self,
        db: Session,
        tenant_id: str,
        brecha_id: str,
        numero_notificacion: str,
        contenido_notificacion: str,
        adjuntos: Optional[List[Dict[str, Any]]] = None,
        canal_notificacion: str = "sistema_oficial"
    ) -> NotificacionBrecha:
        """Registra la notificación a la autoridad"""
        
        brecha = db.query(NotificacionBrecha).filter(
            and_(
                NotificacionBrecha.id == brecha_id,
                NotificacionBrecha.tenant_id == tenant_id
            )
        ).first()
        
        if not brecha:
            raise ValueError("Brecha no encontrada")
        
        # Actualizar información de notificación
        brecha.notificada_autoridad = True
        brecha.fecha_notificacion_autoridad = datetime.utcnow()
        brecha.numero_notificacion_autoridad = numero_notificacion
        
        # Guardar detalles en metadata
        if not brecha.metadata:
            brecha.metadata = {}
        
        brecha.metadata["notificacion_autoridad"] = {
            "fecha": datetime.utcnow().isoformat(),
            "numero": numero_notificacion,
            "canal": canal_notificacion,
            "contenido": contenido_notificacion
        }
        
        # Adjuntar documentos si los hay
        if adjuntos:
            for adj in adjuntos:
                self._adjuntar_documento_brecha(
                    db,
                    brecha_id,
                    adj.get("nombre"),
                    "notificacion_autoridad",
                    adj.get("contenido"),
                    adj.get("descripcion")
                )
        
        # Actualizar estado
        if brecha.estado in ["detectada", "en_contencion"]:
            brecha.estado = "notificada"
        
        db.commit()
        db.refresh(brecha)
        
        return brecha
    
    def notificar_afectados(
        self,
        db: Session,
        tenant_id: str,
        brecha_id: str,
        plantilla_notificacion: str,
        canal: str = "email",
        lote_size: int = 100
    ) -> Dict[str, Any]:
        """Notifica a los afectados de una brecha"""
        
        brecha = db.query(NotificacionBrecha).filter(
            and_(
                NotificacionBrecha.id == brecha_id,
                NotificacionBrecha.tenant_id == tenant_id
            )
        ).first()
        
        if not brecha:
            raise ValueError("Brecha no encontrada")
        
        # Obtener afectados no notificados
        afectados = db.query(AfectadoBrecha).filter(
            and_(
                AfectadoBrecha.brecha_id == brecha_id,
                AfectadoBrecha.notificado == False
            )
        ).limit(lote_size).all()
        
        notificados = 0
        errores = []
        
        for afectado in afectados:
            try:
                # Obtener datos del titular
                titular = afectado.titular
                
                # Personalizar plantilla
                mensaje = self._personalizar_plantilla(
                    plantilla_notificacion,
                    {
                        "nombre": decrypt_field(titular.nombre),
                        "codigo_brecha": brecha.codigo_brecha,
                        "fecha_brecha": brecha.fecha_ocurrencia.strftime("%d/%m/%Y"),
                        "tipo_brecha": brecha.tipo_brecha,
                        "categorias_datos": ", ".join(afectado.categorias_datos_comprometidas)
                    }
                )
                
                # Aquí iría la lógica real de envío (email, SMS, etc.)
                # Por ahora solo marcamos como notificado
                
                afectado.notificado = True
                afectado.fecha_notificacion = datetime.utcnow()
                afectado.canal_notificacion = canal
                
                notificados += 1
                
            except Exception as e:
                errores.append({
                    "titular_id": afectado.titular_id,
                    "error": str(e)
                })
        
        # Actualizar brecha si se notificaron todos
        total_afectados = db.query(AfectadoBrecha).filter(
            AfectadoBrecha.brecha_id == brecha_id
        ).count()
        
        total_notificados = db.query(AfectadoBrecha).filter(
            and_(
                AfectadoBrecha.brecha_id == brecha_id,
                AfectadoBrecha.notificado == True
            )
        ).count()
        
        if total_notificados == total_afectados and total_afectados > 0:
            brecha.notificados_afectados = True
            brecha.fecha_notificacion_afectados = datetime.utcnow()
        
        db.commit()
        
        return {
            "notificados": notificados,
            "pendientes": total_afectados - total_notificados,
            "errores": errores
        }
    
    def _personalizar_plantilla(self, plantilla: str, datos: Dict[str, str]) -> str:
        """Personaliza una plantilla de notificación"""
        mensaje = plantilla
        for key, value in datos.items():
            mensaje = mensaje.replace(f"{{{{{key}}}}}", str(value))
        return mensaje
    
    def _adjuntar_documento_brecha(
        self,
        db: Session,
        brecha_id: str,
        nombre: str,
        tipo: str,
        contenido: bytes,
        descripcion: Optional[str] = None
    ):
        """Adjunta un documento a una brecha"""
        
        documento = DocumentoBrecha(
            brecha_id=brecha_id,
            nombre_documento=nombre,
            tipo_documento=tipo,
            descripcion=descripcion,
            tamaño_bytes=len(contenido),
            hash_documento=hashlib.sha256(contenido).hexdigest()
        )
        
        # Aquí iría la lógica para guardar el archivo físicamente
        
        db.add(documento)
    
    def cerrar_brecha(
        self,
        db: Session,
        tenant_id: str,
        brecha_id: str,
        resolucion: str,
        lecciones_aprendidas: Optional[str] = None,
        mejoras_implementadas: Optional[List[str]] = None
    ) -> NotificacionBrecha:
        """Cierra una brecha de seguridad"""
        
        brecha = db.query(NotificacionBrecha).filter(
            and_(
                NotificacionBrecha.id == brecha_id,
                NotificacionBrecha.tenant_id == tenant_id
            )
        ).first()
        
        if not brecha:
            raise ValueError("Brecha no encontrada")
        
        # Verificar que todas las medidas estén implementadas
        medidas_pendientes = db.query(MedidaMitigacion).filter(
            and_(
                MedidaMitigacion.brecha_id == brecha_id,
                MedidaMitigacion.estado != "implementada"
            )
        ).count()
        
        if medidas_pendientes > 0:
            raise ValueError(f"Hay {medidas_pendientes} medidas pendientes de implementar")
        
        brecha.estado = "cerrada"
        brecha.fecha_cierre = datetime.utcnow()
        brecha.resolucion = resolucion
        
        if not brecha.metadata:
            brecha.metadata = {}
        
        brecha.metadata["cierre"] = {
            "fecha": datetime.utcnow().isoformat(),
            "resolucion": resolucion,
            "lecciones_aprendidas": lecciones_aprendidas,
            "mejoras_implementadas": mejoras_implementadas or []
        }
        
        db.commit()
        db.refresh(brecha)
        
        return brecha
    
    def get_brechas_activas(
        self,
        db: Session,
        tenant_id: str
    ) -> List[Dict[str, Any]]:
        """Obtiene las brechas activas"""
        
        brechas = db.query(NotificacionBrecha).filter(
            and_(
                NotificacionBrecha.tenant_id == tenant_id,
                NotificacionBrecha.estado.in_(["detectada", "en_contencion", "notificada"])
            )
        ).order_by(NotificacionBrecha.gravedad.desc(), NotificacionBrecha.fecha_deteccion).all()
        
        result = []
        for brecha in brechas:
            # Calcular tiempo transcurrido
            tiempo_transcurrido = datetime.utcnow() - brecha.fecha_deteccion
            
            # Verificar plazos
            plazo_vencido = datetime.utcnow() > brecha.fecha_limite_notificacion
            
            result.append({
                "id": brecha.id,
                "codigo": brecha.codigo_brecha,
                "tipo": brecha.tipo_brecha,
                "gravedad": brecha.gravedad,
                "estado": brecha.estado,
                "fecha_deteccion": brecha.fecha_deteccion.isoformat(),
                "dias_transcurridos": tiempo_transcurrido.days,
                "afectados": {
                    "estimados": brecha.numero_afectados_estimado,
                    "confirmados": brecha.numero_afectados_confirmado
                },
                "notificaciones": {
                    "autoridad_requerida": brecha.requiere_notificacion_autoridad,
                    "autoridad_completada": brecha.notificada_autoridad,
                    "afectados_requerida": brecha.requiere_notificacion_afectados,
                    "afectados_completada": brecha.notificados_afectados,
                    "plazo_vencido": plazo_vencido
                }
            })
        
        return result
    
    def generar_informe_brecha(
        self,
        db: Session,
        tenant_id: str,
        brecha_id: str
    ) -> Dict[str, Any]:
        """Genera un informe completo de una brecha"""
        
        brecha = db.query(NotificacionBrecha).filter(
            and_(
                NotificacionBrecha.id == brecha_id,
                NotificacionBrecha.tenant_id == tenant_id
            )
        ).first()
        
        if not brecha:
            raise ValueError("Brecha no encontrada")
        
        # Obtener información relacionada
        afectados = db.query(AfectadoBrecha).filter(
            AfectadoBrecha.brecha_id == brecha_id
        ).all()
        
        medidas = db.query(MedidaMitigacion).filter(
            MedidaMitigacion.brecha_id == brecha_id
        ).all()
        
        documentos = db.query(DocumentoBrecha).filter(
            DocumentoBrecha.brecha_id == brecha_id
        ).all()
        
        return {
            "brecha": {
                "codigo": brecha.codigo_brecha,
                "tipo": brecha.tipo_brecha,
                "gravedad": brecha.gravedad,
                "estado": brecha.estado,
                "descripcion": brecha.descripcion,
                "fecha_ocurrencia": brecha.fecha_ocurrencia.isoformat(),
                "fecha_deteccion": brecha.fecha_deteccion.isoformat(),
                "origen": brecha.origen_brecha,
                "sistemas_afectados": brecha.sistemas_afectados,
                "categorias_datos": brecha.categorias_datos_afectadas
            },
            "impacto": {
                "afectados_estimados": brecha.numero_afectados_estimado,
                "afectados_confirmados": brecha.numero_afectados_confirmado,
                "afectados_notificados": len([a for a in afectados if a.notificado])
            },
            "medidas": [
                {
                    "tipo": m.tipo_medida,
                    "descripcion": m.descripcion,
                    "estado": m.estado,
                    "responsable": m.responsable,
                    "fecha_prevista": m.fecha_implementacion_prevista.isoformat()
                }
                for m in medidas
            ],
            "notificaciones": {
                "autoridad": {
                    "requerida": brecha.requiere_notificacion_autoridad,
                    "completada": brecha.notificada_autoridad,
                    "fecha": brecha.fecha_notificacion_autoridad.isoformat() if brecha.fecha_notificacion_autoridad else None,
                    "numero": brecha.numero_notificacion_autoridad
                },
                "afectados": {
                    "requerida": brecha.requiere_notificacion_afectados,
                    "completada": brecha.notificados_afectados,
                    "fecha": brecha.fecha_notificacion_afectados.isoformat() if brecha.fecha_notificacion_afectados else None
                }
            },
            "documentos": len(documentos),
            "timeline": self._generar_timeline_brecha(brecha, medidas, afectados)
        }
    
    def _generar_timeline_brecha(
        self,
        brecha: NotificacionBrecha,
        medidas: List[MedidaMitigacion],
        afectados: List[AfectadoBrecha]
    ) -> List[Dict[str, Any]]:
        """Genera una línea de tiempo de eventos de la brecha"""
        
        eventos = []
        
        # Ocurrencia
        eventos.append({
            "fecha": brecha.fecha_ocurrencia.isoformat(),
            "tipo": "ocurrencia",
            "descripcion": "Ocurrencia de la brecha"
        })
        
        # Detección
        eventos.append({
            "fecha": brecha.fecha_deteccion.isoformat(),
            "tipo": "deteccion",
            "descripcion": f"Brecha detectada por {brecha.detectada_por or 'sistema'}"
        })
        
        # Notificaciones
        if brecha.fecha_notificacion_autoridad:
            eventos.append({
                "fecha": brecha.fecha_notificacion_autoridad.isoformat(),
                "tipo": "notificacion",
                "descripcion": "Notificación a la autoridad"
            })
        
        if brecha.fecha_notificacion_afectados:
            eventos.append({
                "fecha": brecha.fecha_notificacion_afectados.isoformat(),
                "tipo": "notificacion",
                "descripcion": "Notificación a afectados"
            })
        
        # Medidas
        for medida in medidas:
            if medida.fecha_implementacion_real:
                eventos.append({
                    "fecha": medida.fecha_implementacion_real.isoformat(),
                    "tipo": "medida",
                    "descripcion": f"Implementada: {medida.descripcion}"
                })
        
        # Cierre
        if brecha.fecha_cierre:
            eventos.append({
                "fecha": brecha.fecha_cierre.isoformat(),
                "tipo": "cierre",
                "descripcion": "Brecha cerrada"
            })
        
        # Ordenar por fecha
        eventos.sort(key=lambda x: x["fecha"])
        
        return eventos