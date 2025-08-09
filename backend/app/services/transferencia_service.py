"""
Servicio para gestión de transferencias internacionales (Módulo 6)
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
import json

from app.models import (
    TransferenciaInternacional,
    GarantiaAdecuada,
    ClausulaContractual,
    EvaluacionPais,
    ActividadTratamiento
)


class TransferenciaService:
    
    PAISES_ADECUADOS = [
        # Países con decisión de adecuación (ejemplo, ajustar según legislación chilena)
        {"codigo": "AR", "nombre": "Argentina", "fecha_decision": "2003-06-30"},
        {"codigo": "CA", "nombre": "Canadá", "fecha_decision": "2001-12-20"},
        {"codigo": "CH", "nombre": "Suiza", "fecha_decision": "2000-07-26"},
        {"codigo": "IL", "nombre": "Israel", "fecha_decision": "2011-01-31"},
        {"codigo": "JP", "nombre": "Japón", "fecha_decision": "2019-01-23"},
        {"codigo": "NZ", "nombre": "Nueva Zelanda", "fecha_decision": "2012-12-19"},
        {"codigo": "KR", "nombre": "Corea del Sur", "fecha_decision": "2021-12-17"},
        {"codigo": "UK", "nombre": "Reino Unido", "fecha_decision": "2021-06-28"},
        {"codigo": "UY", "nombre": "Uruguay", "fecha_decision": "2012-08-21"},
        # Países del EEE
        {"codigo": "EU", "nombre": "Unión Europea", "fecha_decision": "2000-01-01"}
    ]
    
    TIPOS_GARANTIA = {
        "clausulas_tipo": {
            "nombre": "Cláusulas contractuales tipo",
            "descripcion": "Cláusulas modelo aprobadas por la autoridad",
            "nivel_proteccion": "alto"
        },
        "bcr": {
            "nombre": "Normas corporativas vinculantes",
            "descripcion": "Políticas internas para transferencias intragrupo",
            "nivel_proteccion": "alto"
        },
        "certificacion": {
            "nombre": "Certificación",
            "descripcion": "Certificación con compromisos vinculantes",
            "nivel_proteccion": "medio"
        },
        "codigo_conducta": {
            "nombre": "Código de conducta",
            "descripcion": "Código aprobado con compromisos vinculantes",
            "nivel_proteccion": "medio"
        },
        "consentimiento": {
            "nombre": "Consentimiento explícito",
            "descripcion": "Consentimiento informado del titular",
            "nivel_proteccion": "bajo"
        },
        "interes_vital": {
            "nombre": "Interés vital",
            "descripcion": "Necesario para proteger intereses vitales",
            "nivel_proteccion": "excepcional"
        }
    }
    
    def registrar_transferencia(
        self,
        db: Session,
        tenant_id: str,
        actividad_id: str,
        pais_destino: str,
        nombre_importador: str,
        tipo_importador: str,
        finalidad: str,
        categorias_datos: List[str],
        volumen_estimado: str,
        frecuencia: str,
        fecha_inicio: datetime,
        fecha_fin: Optional[datetime] = None,
        tipo_garantia: Optional[str] = None,
        contacto_importador: Optional[Dict[str, str]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> TransferenciaInternacional:
        """Registra una nueva transferencia internacional"""
        
        # Verificar actividad
        actividad = db.query(ActividadTratamiento).filter(
            and_(
                ActividadTratamiento.id == actividad_id,
                ActividadTratamiento.tenant_id == tenant_id
            )
        ).first()
        
        if not actividad:
            raise ValueError("Actividad no encontrada")
        
        # Verificar si el país tiene nivel adecuado
        pais_adecuado = any(p["codigo"] == pais_destino for p in self.PAISES_ADECUADOS)
        
        # Si no tiene nivel adecuado, debe tener garantías
        if not pais_adecuado and not tipo_garantia:
            raise ValueError("País sin nivel adecuado requiere garantías adicionales")
        
        # Generar código
        codigo = self._generar_codigo_transferencia(db, tenant_id)
        
        transferencia = TransferenciaInternacional(
            tenant_id=tenant_id,
            codigo_transferencia=codigo,
            actividad_id=actividad_id,
            pais_destino=pais_destino,
            nombre_importador=nombre_importador,
            tipo_importador=tipo_importador,
            finalidad=finalidad,
            categorias_datos=categorias_datos,
            volumen_estimado=volumen_estimado,
            frecuencia=frecuencia,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            activa=True,
            pais_con_nivel_adecuado=pais_adecuado,
            tipo_garantia=tipo_garantia if not pais_adecuado else "nivel_adecuado",
            contacto_importador=contacto_importador,
            estado="activa",
            metadata=metadata or {}
        )
        
        db.add(transferencia)
        db.commit()
        db.refresh(transferencia)
        
        return transferencia
    
    def _generar_codigo_transferencia(self, db: Session, tenant_id: str) -> str:
        """Genera un código único para la transferencia"""
        year = datetime.utcnow().year
        
        last_trans = db.query(TransferenciaInternacional).filter(
            and_(
                TransferenciaInternacional.tenant_id == tenant_id,
                func.extract('year', TransferenciaInternacional.fecha_inicio) == year
            )
        ).order_by(TransferenciaInternacional.created_at.desc()).first()
        
        if last_trans and last_trans.codigo_transferencia:
            parts = last_trans.codigo_transferencia.split('-')
            if len(parts) >= 3:
                seq = int(parts[2]) + 1
            else:
                seq = 1
        else:
            seq = 1
        
        return f"TI-{year}-{seq:04d}"
    
    def crear_garantia(
        self,
        db: Session,
        tenant_id: str,
        transferencia_id: str,
        tipo_garantia: str,
        descripcion: str,
        fecha_firma: datetime,
        fecha_vigencia_inicio: datetime,
        fecha_vigencia_fin: Optional[datetime] = None,
        partes_firmantes: Optional[List[Dict[str, str]]] = None,
        clausulas_principales: Optional[List[str]] = None,
        documento_referencia: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> GarantiaAdecuada:
        """Crea una garantía adecuada para una transferencia"""
        
        transferencia = db.query(TransferenciaInternacional).filter(
            and_(
                TransferenciaInternacional.id == transferencia_id,
                TransferenciaInternacional.tenant_id == tenant_id
            )
        ).first()
        
        if not transferencia:
            raise ValueError("Transferencia no encontrada")
        
        # Validar tipo de garantía
        if tipo_garantia not in self.TIPOS_GARANTIA:
            raise ValueError(f"Tipo de garantía inválido: {tipo_garantia}")
        
        garantia = GarantiaAdecuada(
            tenant_id=tenant_id,
            transferencia_id=transferencia_id,
            tipo_garantia=tipo_garantia,
            descripcion=descripcion,
            fecha_firma=fecha_firma,
            fecha_vigencia_inicio=fecha_vigencia_inicio,
            fecha_vigencia_fin=fecha_vigencia_fin,
            vigente=True,
            partes_firmantes=partes_firmantes or [],
            clausulas_principales=clausulas_principales or [],
            nivel_proteccion=self.TIPOS_GARANTIA[tipo_garantia]["nivel_proteccion"],
            documento_referencia=documento_referencia,
            metadata=metadata or {}
        )
        
        db.add(garantia)
        
        # Actualizar transferencia
        transferencia.tipo_garantia = tipo_garantia
        transferencia.garantia_id = garantia.id
        
        db.commit()
        db.refresh(garantia)
        
        return garantia
    
    def agregar_clausula_contractual(
        self,
        db: Session,
        tenant_id: str,
        garantia_id: str,
        tipo_clausula: str,
        contenido: str,
        obligatoria: bool = True,
        referencia_legal: Optional[str] = None
    ) -> ClausulaContractual:
        """Agrega una cláusula contractual a una garantía"""
        
        garantia = db.query(GarantiaAdecuada).filter(
            and_(
                GarantiaAdecuada.id == garantia_id,
                GarantiaAdecuada.tenant_id == tenant_id
            )
        ).first()
        
        if not garantia:
            raise ValueError("Garantía no encontrada")
        
        # Generar número de cláusula
        num_clausulas = db.query(ClausulaContractual).filter(
            ClausulaContractual.garantia_id == garantia_id
        ).count()
        
        numero_clausula = f"{num_clausulas + 1}"
        
        clausula = ClausulaContractual(
            tenant_id=tenant_id,
            garantia_id=garantia_id,
            numero_clausula=numero_clausula,
            tipo_clausula=tipo_clausula,
            contenido=contenido,
            obligatoria=obligatoria,
            cumplida=False,
            referencia_legal=referencia_legal
        )
        
        db.add(clausula)
        db.commit()
        db.refresh(clausula)
        
        return clausula
    
    def evaluar_pais(
        self,
        db: Session,
        tenant_id: str,
        codigo_pais: str,
        evaluador_id: str,
        marco_legal: str,
        autoridad_proteccion: Optional[str] = None,
        nivel_proteccion_evaluado: str = "medio",
        derechos_garantizados: Optional[List[str]] = None,
        recursos_disponibles: Optional[List[str]] = None,
        riesgos_identificados: Optional[List[str]] = None,
        recomendaciones: Optional[List[str]] = None
    ) -> EvaluacionPais:
        """Realiza una evaluación del nivel de protección de un país"""
        
        # Verificar si ya existe evaluación vigente
        eval_existente = db.query(EvaluacionPais).filter(
            and_(
                EvaluacionPais.tenant_id == tenant_id,
                EvaluacionPais.codigo_pais == codigo_pais,
                EvaluacionPais.vigente == True
            )
        ).first()
        
        if eval_existente:
            # Marcar como no vigente
            eval_existente.vigente = False
        
        # Verificar si es país con nivel adecuado
        pais_adecuado = any(p["codigo"] == codigo_pais for p in self.PAISES_ADECUADOS)
        
        evaluacion = EvaluacionPais(
            tenant_id=tenant_id,
            codigo_pais=codigo_pais,
            nombre_pais=self._obtener_nombre_pais(codigo_pais),
            fecha_evaluacion=datetime.utcnow(),
            evaluador_id=evaluador_id,
            nivel_adecuacion_oficial=pais_adecuado,
            nivel_proteccion_evaluado=nivel_proteccion_evaluado,
            marco_legal=marco_legal,
            autoridad_proteccion=autoridad_proteccion,
            derechos_garantizados=derechos_garantizados or [],
            recursos_disponibles=recursos_disponibles or [],
            riesgos_identificados=riesgos_identificados or [],
            recomendaciones=recomendaciones or [],
            vigente=True,
            proxima_revision=datetime.utcnow() + timedelta(days=365)  # Revisión anual
        )
        
        db.add(evaluacion)
        db.commit()
        db.refresh(evaluacion)
        
        return evaluacion
    
    def _obtener_nombre_pais(self, codigo_pais: str) -> str:
        """Obtiene el nombre del país por su código"""
        # Buscar en países adecuados
        for pais in self.PAISES_ADECUADOS:
            if pais["codigo"] == codigo_pais:
                return pais["nombre"]
        
        # Diccionario básico de países (expandir según necesidad)
        paises = {
            "US": "Estados Unidos",
            "CN": "China",
            "IN": "India",
            "BR": "Brasil",
            "MX": "México",
            "CO": "Colombia",
            "PE": "Perú",
            "VE": "Venezuela",
            "EC": "Ecuador",
            "BO": "Bolivia",
            "PY": "Paraguay"
        }
        
        return paises.get(codigo_pais, codigo_pais)
    
    def verificar_cumplimiento_transferencia(
        self,
        db: Session,
        tenant_id: str,
        transferencia_id: str
    ) -> Dict[str, Any]:
        """Verifica el cumplimiento de una transferencia"""
        
        transferencia = db.query(TransferenciaInternacional).filter(
            and_(
                TransferenciaInternacional.id == transferencia_id,
                TransferenciaInternacional.tenant_id == tenant_id
            )
        ).first()
        
        if not transferencia:
            raise ValueError("Transferencia no encontrada")
        
        cumplimiento = {
            "transferencia_id": transferencia_id,
            "codigo": transferencia.codigo_transferencia,
            "pais_destino": transferencia.pais_destino,
            "estado_cumplimiento": "conforme",
            "issues": []
        }
        
        # Verificar país
        if transferencia.pais_con_nivel_adecuado:
            cumplimiento["nivel_adecuacion"] = "País con nivel adecuado"
        else:
            cumplimiento["nivel_adecuacion"] = "País sin nivel adecuado"
            
            # Debe tener garantías
            garantia = db.query(GarantiaAdecuada).filter(
                GarantiaAdecuada.transferencia_id == transferencia_id
            ).first()
            
            if not garantia:
                cumplimiento["estado_cumplimiento"] = "no_conforme"
                cumplimiento["issues"].append("Falta garantía adecuada para país sin nivel adecuado")
            else:
                # Verificar vigencia
                if not garantia.vigente:
                    cumplimiento["estado_cumplimiento"] = "no_conforme"
                    cumplimiento["issues"].append("Garantía no vigente")
                
                if garantia.fecha_vigencia_fin and garantia.fecha_vigencia_fin < datetime.utcnow():
                    cumplimiento["estado_cumplimiento"] = "no_conforme"
                    cumplimiento["issues"].append("Garantía expirada")
                
                # Verificar cláusulas obligatorias
                clausulas_no_cumplidas = db.query(ClausulaContractual).filter(
                    and_(
                        ClausulaContractual.garantia_id == garantia.id,
                        ClausulaContractual.obligatoria == True,
                        ClausulaContractual.cumplida == False
                    )
                ).count()
                
                if clausulas_no_cumplidas > 0:
                    cumplimiento["estado_cumplimiento"] = "parcial"
                    cumplimiento["issues"].append(f"{clausulas_no_cumplidas} cláusulas obligatorias no cumplidas")
        
        # Verificar evaluación del país
        evaluacion = db.query(EvaluacionPais).filter(
            and_(
                EvaluacionPais.tenant_id == tenant_id,
                EvaluacionPais.codigo_pais == transferencia.pais_destino,
                EvaluacionPais.vigente == True
            )
        ).first()
        
        if evaluacion:
            cumplimiento["evaluacion_pais"] = {
                "nivel_proteccion": evaluacion.nivel_proteccion_evaluado,
                "fecha_evaluacion": evaluacion.fecha_evaluacion.isoformat(),
                "proxima_revision": evaluacion.proxima_revision.isoformat()
            }
            
            # Si necesita revisión
            if evaluacion.proxima_revision < datetime.utcnow():
                cumplimiento["issues"].append("Evaluación del país necesita actualización")
        
        return cumplimiento
    
    def suspender_transferencia(
        self,
        db: Session,
        tenant_id: str,
        transferencia_id: str,
        motivo: str,
        suspendida_por: str
    ) -> TransferenciaInternacional:
        """Suspende una transferencia internacional"""
        
        transferencia = db.query(TransferenciaInternacional).filter(
            and_(
                TransferenciaInternacional.id == transferencia_id,
                TransferenciaInternacional.tenant_id == tenant_id
            )
        ).first()
        
        if not transferencia:
            raise ValueError("Transferencia no encontrada")
        
        transferencia.activa = False
        transferencia.estado = "suspendida"
        transferencia.fecha_suspension = datetime.utcnow()
        
        if not transferencia.metadata:
            transferencia.metadata = {}
        
        transferencia.metadata["suspension"] = {
            "fecha": datetime.utcnow().isoformat(),
            "motivo": motivo,
            "suspendida_por": suspendida_por
        }
        
        db.commit()
        db.refresh(transferencia)
        
        return transferencia
    
    def get_transferencias_activas(
        self,
        db: Session,
        tenant_id: str,
        pais_destino: Optional[str] = None,
        incluir_evaluaciones: bool = True
    ) -> List[Dict[str, Any]]:
        """Obtiene las transferencias activas"""
        
        query = db.query(TransferenciaInternacional).filter(
            and_(
                TransferenciaInternacional.tenant_id == tenant_id,
                TransferenciaInternacional.activa == True
            )
        )
        
        if pais_destino:
            query = query.filter(TransferenciaInternacional.pais_destino == pais_destino)
        
        transferencias = query.all()
        
        result = []
        for trans in transferencias:
            trans_data = {
                "id": trans.id,
                "codigo": trans.codigo_transferencia,
                "pais_destino": trans.pais_destino,
                "importador": trans.nombre_importador,
                "finalidad": trans.finalidad,
                "categorias_datos": trans.categorias_datos,
                "volumen": trans.volumen_estimado,
                "frecuencia": trans.frecuencia,
                "fecha_inicio": trans.fecha_inicio.isoformat(),
                "pais_adecuado": trans.pais_con_nivel_adecuado,
                "tipo_garantia": trans.tipo_garantia
            }
            
            # Agregar información de garantía si existe
            if trans.garantia_id:
                garantia = db.query(GarantiaAdecuada).filter(
                    GarantiaAdecuada.id == trans.garantia_id
                ).first()
                
                if garantia:
                    trans_data["garantia"] = {
                        "tipo": garantia.tipo_garantia,
                        "vigente": garantia.vigente,
                        "fecha_vigencia_fin": garantia.fecha_vigencia_fin.isoformat() if garantia.fecha_vigencia_fin else None,
                        "nivel_proteccion": garantia.nivel_proteccion
                    }
            
            # Agregar evaluación del país si se solicita
            if incluir_evaluaciones:
                evaluacion = db.query(EvaluacionPais).filter(
                    and_(
                        EvaluacionPais.tenant_id == tenant_id,
                        EvaluacionPais.codigo_pais == trans.pais_destino,
                        EvaluacionPais.vigente == True
                    )
                ).first()
                
                if evaluacion:
                    trans_data["evaluacion_pais"] = {
                        "nivel_proteccion": evaluacion.nivel_proteccion_evaluado,
                        "fecha": evaluacion.fecha_evaluacion.isoformat(),
                        "riesgos": len(evaluacion.riesgos_identificados)
                    }
            
            result.append(trans_data)
        
        return result
    
    def generar_registro_transferencias(
        self,
        db: Session,
        tenant_id: str,
        formato: str = "json"
    ) -> bytes:
        """Genera el registro de transferencias internacionales"""
        
        transferencias = db.query(TransferenciaInternacional).filter(
            TransferenciaInternacional.tenant_id == tenant_id
        ).all()
        
        registro = []
        
        for trans in transferencias:
            # Obtener actividad
            actividad = trans.actividad
            
            # Obtener garantía si existe
            garantia_data = None
            if trans.garantia_id:
                garantia = db.query(GarantiaAdecuada).filter(
                    GarantiaAdecuada.id == trans.garantia_id
                ).first()
                
                if garantia:
                    garantia_data = {
                        "tipo": garantia.tipo_garantia,
                        "descripcion": garantia.descripcion,
                        "fecha_firma": garantia.fecha_firma.isoformat(),
                        "vigente": garantia.vigente,
                        "nivel_proteccion": garantia.nivel_proteccion
                    }
            
            registro.append({
                "codigo": trans.codigo_transferencia,
                "actividad_tratamiento": actividad.nombre,
                "pais_destino": trans.pais_destino,
                "importador": {
                    "nombre": trans.nombre_importador,
                    "tipo": trans.tipo_importador,
                    "contacto": trans.contacto_importador
                },
                "datos_transferidos": {
                    "categorias": trans.categorias_datos,
                    "volumen": trans.volumen_estimado,
                    "frecuencia": trans.frecuencia
                },
                "legitimacion": {
                    "pais_adecuado": trans.pais_con_nivel_adecuado,
                    "tipo_garantia": trans.tipo_garantia,
                    "garantia": garantia_data
                },
                "periodo": {
                    "inicio": trans.fecha_inicio.isoformat(),
                    "fin": trans.fecha_fin.isoformat() if trans.fecha_fin else "Indefinido"
                },
                "estado": trans.estado
            })
        
        if formato == "json":
            return json.dumps(registro, indent=2, ensure_ascii=False).encode()
        
        return json.dumps(registro).encode()