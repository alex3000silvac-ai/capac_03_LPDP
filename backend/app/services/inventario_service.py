"""
Servicio para gestión de inventario de datos (Módulo 3)
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
import json

from app.models import (
    ActividadTratamiento,
    BaseLegal,
    CategoriaDatos,
    DestinatarioDatos,
    TransferenciaDatos,
    MedidaSeguridad
)


class InventarioService:
    
    def create_actividad_tratamiento(
        self,
        db: Session,
        tenant_id: str,
        nombre: str,
        descripcion: str,
        finalidad: str,
        departamento: str,
        responsable_id: str,
        base_legal_ids: List[str],
        categoria_datos_ids: List[str],
        origen_datos: str,
        plazo_conservacion: str,
        medidas_seguridad_ids: Optional[List[str]] = None,
        transferencias_internacionales: bool = False,
        metadata: Optional[Dict[str, Any]] = None
    ) -> ActividadTratamiento:
        """Crea una nueva actividad de tratamiento"""
        
        # Verificar bases legales
        bases_legales = db.query(BaseLegal).filter(
            and_(
                BaseLegal.id.in_(base_legal_ids),
                BaseLegal.tenant_id == tenant_id
            )
        ).all()
        
        if len(bases_legales) != len(base_legal_ids):
            raise ValueError("Una o más bases legales no existen")
        
        # Verificar categorías de datos
        categorias = db.query(CategoriaDatos).filter(
            and_(
                CategoriaDatos.id.in_(categoria_datos_ids),
                CategoriaDatos.tenant_id == tenant_id
            )
        ).all()
        
        if len(categorias) != len(categoria_datos_ids):
            raise ValueError("Una o más categorías de datos no existen")
        
        # Crear actividad
        actividad = ActividadTratamiento(
            tenant_id=tenant_id,
            nombre=nombre,
            descripcion=descripcion,
            finalidad=finalidad,
            departamento=departamento,
            responsable_id=responsable_id,
            origen_datos=origen_datos,
            plazo_conservacion=plazo_conservacion,
            transferencias_internacionales=transferencias_internacionales,
            estado="activa",
            fecha_inicio=datetime.utcnow(),
            metadata=metadata or {}
        )
        
        # Asociar bases legales
        actividad.bases_legales.extend(bases_legales)
        
        # Asociar categorías de datos
        actividad.categorias_datos.extend(categorias)
        
        # Asociar medidas de seguridad si se especifican
        if medidas_seguridad_ids:
            medidas = db.query(MedidaSeguridad).filter(
                and_(
                    MedidaSeguridad.id.in_(medidas_seguridad_ids),
                    MedidaSeguridad.tenant_id == tenant_id
                )
            ).all()
            actividad.medidas_seguridad.extend(medidas)
        
        db.add(actividad)
        db.commit()
        db.refresh(actividad)
        
        return actividad
    
    def create_base_legal(
        self,
        db: Session,
        tenant_id: str,
        tipo: str,
        descripcion: str,
        articulo_ley: Optional[str] = None,
        requiere_consentimiento: bool = False,
        documentacion_requerida: Optional[List[str]] = None
    ) -> BaseLegal:
        """Crea una nueva base legal"""
        
        base_legal = BaseLegal(
            tenant_id=tenant_id,
            tipo=tipo,
            descripcion=descripcion,
            articulo_ley=articulo_ley,
            requiere_consentimiento=requiere_consentimiento,
            activa=True,
            documentacion_requerida=documentacion_requerida or []
        )
        
        db.add(base_legal)
        db.commit()
        db.refresh(base_legal)
        
        return base_legal
    
    def create_categoria_datos(
        self,
        db: Session,
        tenant_id: str,
        nombre: str,
        descripcion: str,
        tipo_datos: str,
        nivel_sensibilidad: str,
        ejemplos: Optional[List[str]] = None,
        requiere_proteccion_especial: bool = False
    ) -> CategoriaDatos:
        """Crea una nueva categoría de datos"""
        
        categoria = CategoriaDatos(
            tenant_id=tenant_id,
            nombre=nombre,
            descripcion=descripcion,
            tipo_datos=tipo_datos,
            nivel_sensibilidad=nivel_sensibilidad,
            datos_sensibles=(nivel_sensibilidad in ["alto", "critico"]),
            requiere_proteccion_especial=requiere_proteccion_especial,
            ejemplos=ejemplos or []
        )
        
        db.add(categoria)
        db.commit()
        db.refresh(categoria)
        
        return categoria
    
    def add_destinatario(
        self,
        db: Session,
        tenant_id: str,
        actividad_id: str,
        nombre: str,
        tipo: str,
        finalidad: str,
        pais: str = "Chile",
        base_legitimacion: Optional[str] = None,
        garantias: Optional[str] = None
    ) -> DestinatarioDatos:
        """Agrega un destinatario de datos a una actividad"""
        
        # Verificar actividad
        actividad = db.query(ActividadTratamiento).filter(
            and_(
                ActividadTratamiento.id == actividad_id,
                ActividadTratamiento.tenant_id == tenant_id
            )
        ).first()
        
        if not actividad:
            raise ValueError("Actividad no encontrada")
        
        destinatario = DestinatarioDatos(
            tenant_id=tenant_id,
            actividad_id=actividad_id,
            nombre=nombre,
            tipo=tipo,
            finalidad=finalidad,
            pais=pais,
            base_legitimacion=base_legitimacion,
            garantias_aplicadas=garantias,
            activo=True
        )
        
        db.add(destinatario)
        db.commit()
        db.refresh(destinatario)
        
        return destinatario
    
    def add_transferencia_internacional(
        self,
        db: Session,
        tenant_id: str,
        actividad_id: str,
        pais_destino: str,
        organizacion_destino: str,
        finalidad: str,
        tipo_garantia: str,
        detalles_garantia: str,
        volumen_datos: Optional[str] = None,
        frecuencia: Optional[str] = None
    ) -> TransferenciaDatos:
        """Registra una transferencia internacional de datos"""
        
        # Verificar actividad
        actividad = db.query(ActividadTratamiento).filter(
            and_(
                ActividadTratamiento.id == actividad_id,
                ActividadTratamiento.tenant_id == tenant_id
            )
        ).first()
        
        if not actividad:
            raise ValueError("Actividad no encontrada")
        
        # Actualizar flag de transferencias internacionales
        actividad.transferencias_internacionales = True
        
        transferencia = TransferenciaDatos(
            tenant_id=tenant_id,
            actividad_id=actividad_id,
            pais_destino=pais_destino,
            organizacion_destino=organizacion_destino,
            finalidad=finalidad,
            tipo_garantia=tipo_garantia,
            detalles_garantia=detalles_garantia,
            volumen_datos=volumen_datos,
            frecuencia=frecuencia,
            activa=True,
            fecha_inicio=datetime.utcnow()
        )
        
        db.add(transferencia)
        db.commit()
        db.refresh(transferencia)
        
        return transferencia
    
    def create_medida_seguridad(
        self,
        db: Session,
        tenant_id: str,
        tipo: str,
        nombre: str,
        descripcion: str,
        nivel_proteccion: str,
        implementada: bool = False,
        fecha_implementacion: Optional[datetime] = None,
        responsable: Optional[str] = None,
        controles_tecnicos: Optional[List[str]] = None,
        controles_organizativos: Optional[List[str]] = None
    ) -> MedidaSeguridad:
        """Crea una nueva medida de seguridad"""
        
        medida = MedidaSeguridad(
            tenant_id=tenant_id,
            tipo=tipo,
            nombre=nombre,
            descripcion=descripcion,
            nivel_proteccion=nivel_proteccion,
            implementada=implementada,
            fecha_implementacion=fecha_implementacion if implementada else None,
            responsable=responsable,
            controles_tecnicos=controles_tecnicos or [],
            controles_organizativos=controles_organizativos or []
        )
        
        db.add(medida)
        db.commit()
        db.refresh(medida)
        
        return medida
    
    def get_actividades_tratamiento(
        self,
        db: Session,
        tenant_id: str,
        departamento: Optional[str] = None,
        estado: Optional[str] = None,
        con_transferencias: Optional[bool] = None
    ) -> List[Dict[str, Any]]:
        """Obtiene las actividades de tratamiento con filtros"""
        
        query = db.query(ActividadTratamiento).filter(
            ActividadTratamiento.tenant_id == tenant_id
        )
        
        if departamento:
            query = query.filter(ActividadTratamiento.departamento == departamento)
        
        if estado:
            query = query.filter(ActividadTratamiento.estado == estado)
        
        if con_transferencias is not None:
            query = query.filter(
                ActividadTratamiento.transferencias_internacionales == con_transferencias
            )
        
        actividades = query.all()
        
        result = []
        for act in actividades:
            # Contar elementos relacionados
            num_categorias = len(act.categorias_datos)
            num_destinatarios = db.query(DestinatarioDatos).filter(
                DestinatarioDatos.actividad_id == act.id
            ).count()
            num_transferencias = db.query(TransferenciaDatos).filter(
                TransferenciaDatos.actividad_id == act.id
            ).count()
            
            result.append({
                "id": act.id,
                "nombre": act.nombre,
                "descripcion": act.descripcion,
                "finalidad": act.finalidad,
                "departamento": act.departamento,
                "estado": act.estado,
                "origen_datos": act.origen_datos,
                "plazo_conservacion": act.plazo_conservacion,
                "transferencias_internacionales": act.transferencias_internacionales,
                "fecha_inicio": act.fecha_inicio.isoformat(),
                "estadisticas": {
                    "categorias_datos": num_categorias,
                    "destinatarios": num_destinatarios,
                    "transferencias": num_transferencias,
                    "medidas_seguridad": len(act.medidas_seguridad)
                }
            })
        
        return result
    
    def generar_registro_actividades(
        self,
        db: Session,
        tenant_id: str,
        formato: str = "json"
    ) -> bytes:
        """Genera el registro completo de actividades de tratamiento"""
        
        actividades = db.query(ActividadTratamiento).filter(
            and_(
                ActividadTratamiento.tenant_id == tenant_id,
                ActividadTratamiento.estado == "activa"
            )
        ).all()
        
        registro = []
        
        for act in actividades:
            # Recopilar toda la información
            bases_legales = [
                {
                    "tipo": bl.tipo,
                    "descripcion": bl.descripcion,
                    "articulo": bl.articulo_ley
                }
                for bl in act.bases_legales
            ]
            
            categorias_datos = [
                {
                    "nombre": cd.nombre,
                    "tipo": cd.tipo_datos,
                    "sensibilidad": cd.nivel_sensibilidad,
                    "sensible": cd.datos_sensibles
                }
                for cd in act.categorias_datos
            ]
            
            destinatarios = db.query(DestinatarioDatos).filter(
                DestinatarioDatos.actividad_id == act.id
            ).all()
            
            transferencias = db.query(TransferenciaDatos).filter(
                TransferenciaDatos.actividad_id == act.id
            ).all()
            
            medidas_seguridad = [
                {
                    "tipo": ms.tipo,
                    "nombre": ms.nombre,
                    "nivel": ms.nivel_proteccion,
                    "implementada": ms.implementada
                }
                for ms in act.medidas_seguridad
            ]
            
            registro.append({
                "actividad": {
                    "nombre": act.nombre,
                    "descripcion": act.descripcion,
                    "finalidad": act.finalidad,
                    "departamento": act.departamento,
                    "responsable": act.responsable_id,
                    "fecha_inicio": act.fecha_inicio.isoformat()
                },
                "datos": {
                    "origen": act.origen_datos,
                    "categorias": categorias_datos,
                    "plazo_conservacion": act.plazo_conservacion
                },
                "legitimacion": {
                    "bases_legales": bases_legales
                },
                "destinatarios": [
                    {
                        "nombre": d.nombre,
                        "tipo": d.tipo,
                        "finalidad": d.finalidad,
                        "pais": d.pais
                    }
                    for d in destinatarios
                ],
                "transferencias_internacionales": [
                    {
                        "pais": t.pais_destino,
                        "organizacion": t.organizacion_destino,
                        "finalidad": t.finalidad,
                        "garantias": t.tipo_garantia
                    }
                    for t in transferencias
                ],
                "seguridad": {
                    "medidas": medidas_seguridad
                }
            })
        
        if formato == "json":
            return json.dumps(registro, indent=2, ensure_ascii=False).encode()
        
        # Aquí se podrían agregar otros formatos
        return json.dumps(registro).encode()
    
    def evaluar_riesgos_actividad(
        self,
        db: Session,
        tenant_id: str,
        actividad_id: str
    ) -> Dict[str, Any]:
        """Evalúa los riesgos de una actividad de tratamiento"""
        
        actividad = db.query(ActividadTratamiento).filter(
            and_(
                ActividadTratamiento.id == actividad_id,
                ActividadTratamiento.tenant_id == tenant_id
            )
        ).first()
        
        if not actividad:
            raise ValueError("Actividad no encontrada")
        
        riesgos = []
        nivel_riesgo_total = "bajo"
        
        # Evaluar datos sensibles
        categorias_sensibles = [
            c for c in actividad.categorias_datos 
            if c.datos_sensibles
        ]
        
        if categorias_sensibles:
            riesgos.append({
                "tipo": "datos_sensibles",
                "descripcion": f"La actividad trata {len(categorias_sensibles)} categorías de datos sensibles",
                "nivel": "alto",
                "mitigacion": "Implementar medidas de seguridad adicionales"
            })
            nivel_riesgo_total = "alto"
        
        # Evaluar transferencias internacionales
        transferencias = db.query(TransferenciaDatos).filter(
            TransferenciaDatos.actividad_id == actividad_id
        ).all()
        
        if transferencias:
            paises_riesgo = [t for t in transferencias if t.pais_destino not in ["UE", "UK", "Suiza"]]
            if paises_riesgo:
                riesgos.append({
                    "tipo": "transferencia_internacional",
                    "descripcion": f"Transferencias a {len(paises_riesgo)} países sin nivel adecuado de protección",
                    "nivel": "medio",
                    "mitigacion": "Verificar garantías adecuadas implementadas"
                })
                if nivel_riesgo_total == "bajo":
                    nivel_riesgo_total = "medio"
        
        # Evaluar medidas de seguridad
        medidas_no_implementadas = [
            m for m in actividad.medidas_seguridad 
            if not m.implementada
        ]
        
        if medidas_no_implementadas:
            riesgos.append({
                "tipo": "seguridad",
                "descripcion": f"{len(medidas_no_implementadas)} medidas de seguridad pendientes de implementar",
                "nivel": "medio",
                "mitigacion": "Implementar medidas de seguridad pendientes"
            })
            if nivel_riesgo_total == "bajo":
                nivel_riesgo_total = "medio"
        
        return {
            "actividad_id": actividad_id,
            "nombre_actividad": actividad.nombre,
            "nivel_riesgo_total": nivel_riesgo_total,
            "riesgos_identificados": riesgos,
            "requiere_dpia": nivel_riesgo_total == "alto" or len(categorias_sensibles) > 0,
            "fecha_evaluacion": datetime.utcnow().isoformat()
        }