"""
Servicio de administración comercial del sistema
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
import uuid
from decimal import Decimal

from app.models import (
    Tenant,
    Empresa, 
    Licencia,
    ModuloAcceso,
    User,
    Role
)
from app.services.tenant_service import TenantService
from app.services.license_service import LicenseService
from app.services.auth_service import AuthService


class AdminComercialService:
    """
    Servicio para la gestión comercial y administrativa del sistema
    Solo accesible para administradores de Jurídica Digital
    """
    
    def __init__(self):
        self.tenant_service = TenantService()
        self.license_service = LicenseService()
        self.auth_service = AuthService()
    
    # Planes comerciales predefinidos
    PLANES_COMERCIALES = {
        "basico": {
            "nombre": "Plan Básico",
            "modulos": ["MOD-1", "MOD-2"],  # Consentimientos y ARCOPOL
            "usuarios": 5,
            "duracion_dias": 365,
            "precio_clp": 1500000,
            "descripcion": "Ideal para pequeñas empresas comenzando con LPDP"
        },
        "profesional": {
            "nombre": "Plan Profesional", 
            "modulos": ["MOD-1", "MOD-2", "MOD-3", "MOD-4"],
            "usuarios": 20,
            "duracion_dias": 365,
            "precio_clp": 3500000,
            "descripcion": "Para empresas medianas con necesidades de cumplimiento"
        },
        "empresarial": {
            "nombre": "Plan Empresarial",
            "modulos": ["MOD-1", "MOD-2", "MOD-3", "MOD-4", "MOD-5", "MOD-6"],
            "usuarios": 50,
            "duracion_dias": 365,
            "precio_clp": 6000000,
            "descripcion": "Solución completa sin auditoría"
        },
        "corporativo": {
            "nombre": "Plan Corporativo",
            "modulos": ["MOD-1", "MOD-2", "MOD-3", "MOD-4", "MOD-5", "MOD-6", "MOD-7"],
            "usuarios": 100,
            "duracion_dias": 365,
            "precio_clp": 9000000,
            "descripcion": "Solución integral con todos los módulos"
        }
    }
    
    # Precios individuales por módulo
    PRECIOS_MODULOS = {
        "MOD-1": {"nombre": "Consentimientos", "precio_mes": 50000, "precio_anual": 500000},
        "MOD-2": {"nombre": "ARCOPOL", "precio_mes": 60000, "precio_anual": 600000},
        "MOD-3": {"nombre": "Inventario", "precio_mes": 80000, "precio_anual": 800000},
        "MOD-4": {"nombre": "Brechas", "precio_mes": 70000, "precio_anual": 700000},
        "MOD-5": {"nombre": "DPIA", "precio_mes": 90000, "precio_anual": 900000},
        "MOD-6": {"nombre": "Transferencias", "precio_mes": 50000, "precio_anual": 500000},
        "MOD-7": {"nombre": "Auditoría", "precio_mes": 100000, "precio_anual": 1000000}
    }
    
    def crear_empresa_cliente(
        self,
        db: Session,
        admin_id: str,
        # Datos de la empresa
        razon_social: str,
        rut_empresa: str,
        giro: str,
        direccion: str,
        comuna: str,
        ciudad: str,
        # Datos del contacto principal
        nombre_contacto: str,
        email_contacto: str,
        telefono_contacto: str,
        cargo_contacto: str,
        # Plan comercial
        tipo_plan: Optional[str] = None,
        modulos_custom: Optional[List[str]] = None,
        duracion_custom: Optional[int] = None,
        max_usuarios: Optional[int] = None,
        # Datos comerciales
        descuento_porcentaje: float = 0,
        observaciones_comerciales: Optional[str] = None
    ) -> Dict[str, Any]:
        """Crea una nueva empresa cliente con su tenant y configuración"""
        
        # Validar que es admin
        admin = db.query(User).filter(
            and_(
                User.id == admin_id,
                User.is_superuser == True
            )
        ).first()
        
        if not admin:
            raise ValueError("No tiene permisos de administrador")
        
        # Determinar configuración según plan o custom
        if tipo_plan and tipo_plan in self.PLANES_COMERCIALES:
            plan = self.PLANES_COMERCIALES[tipo_plan]
            modulos = plan["modulos"]
            duracion = plan["duracion_dias"]
            usuarios_max = plan["usuarios"]
            precio_base = plan["precio_clp"]
        else:
            # Plan personalizado
            if not modulos_custom or not duracion_custom:
                raise ValueError("Debe especificar módulos y duración para plan personalizado")
            
            modulos = modulos_custom
            duracion = duracion_custom
            usuarios_max = max_usuarios or 10
            
            # Calcular precio personalizado
            precio_base = self._calcular_precio_custom(modulos, duracion)
        
        # Aplicar descuento
        precio_final = precio_base * (1 - descuento_porcentaje / 100)
        
        # Crear tenant
        dominio = f"{rut_empresa.replace('-', '').lower()}.juridicadigital.cl"
        
        tenant = self.tenant_service.create_tenant(
            db=db,
            name=razon_social,
            domain=dominio,
            admin_email=email_contacto,
            admin_password=self._generar_password_inicial(),
            config={
                "max_users": usuarios_max,
                "features": {
                    "modulos_habilitados": modulos,
                    "api_enabled": tipo_plan in ["empresarial", "corporativo"]
                }
            }
        )
        
        # Crear empresa
        empresa = Empresa(
            id=tenant.id,  # Mismo ID que tenant
            tenant_id=tenant.id,
            rut=rut_empresa,
            razon_social=razon_social,
            giro=giro,
            direccion=direccion,
            comuna=comuna,
            ciudad=ciudad,
            pais="Chile",
            telefono=telefono_contacto,
            email_contacto=email_contacto,
            sitio_web=None,
            cantidad_empleados=0,  # Se actualizará después
            es_activa=True,
            metadata={
                "contacto_principal": {
                    "nombre": nombre_contacto,
                    "cargo": cargo_contacto,
                    "email": email_contacto,
                    "telefono": telefono_contacto
                },
                "comercial": {
                    "plan": tipo_plan or "custom",
                    "precio_base": precio_base,
                    "descuento": descuento_porcentaje,
                    "precio_final": precio_final,
                    "vendedor": admin_id,
                    "fecha_venta": datetime.utcnow().isoformat(),
                    "observaciones": observaciones_comerciales
                }
            }
        )
        
        db.add(empresa)
        db.flush()
        
        # Crear licencia
        licencia = self.license_service.create_license(
            db=db,
            empresa_id=empresa.id,
            tipo_licencia=tipo_plan or "custom",
            duracion_dias=duracion,
            modulos=modulos,
            max_usuarios=usuarios_max,
            metadata={
                "precio_pagado": precio_final,
                "descuento_aplicado": descuento_porcentaje,
                "creado_por": admin_id
            }
        )
        
        # Enviar email de bienvenida
        self._enviar_email_bienvenida(
            empresa,
            email_contacto,
            self._generar_password_inicial()
        )
        
        return {
            "empresa_id": empresa.id,
            "tenant_id": tenant.id,
            "dominio": dominio,
            "licencia_id": licencia.id,
            "licencia_key": licencia.clave_licencia,
            "modulos_activos": modulos,
            "vigencia_hasta": licencia.fecha_expiracion.isoformat(),
            "credenciales": {
                "url": f"https://{dominio}",
                "usuario": email_contacto,
                "password_temporal": "Enviado por email"
            }
        }
    
    def _calcular_precio_custom(
        self,
        modulos: List[str],
        duracion_dias: int
    ) -> int:
        """Calcula precio para configuración personalizada"""
        
        precio_total = 0
        
        for modulo in modulos:
            if modulo in self.PRECIOS_MODULOS:
                if duracion_dias >= 365:
                    # Precio anual con descuento
                    precio_total += self.PRECIOS_MODULOS[modulo]["precio_anual"]
                else:
                    # Precio mensual prorrateado
                    precio_mes = self.PRECIOS_MODULOS[modulo]["precio_mes"]
                    meses = duracion_dias / 30
                    precio_total += int(precio_mes * meses)
        
        return precio_total
    
    def _generar_password_inicial(self) -> str:
        """Genera password inicial seguro"""
        import secrets
        import string
        
        alphabet = string.ascii_letters + string.digits + "!@#$%"
        password = ''.join(secrets.choice(alphabet) for i in range(12))
        
        return password
    
    def _enviar_email_bienvenida(
        self,
        empresa: Empresa,
        email: str,
        password: str
    ):
        """Envía email de bienvenida con credenciales"""
        # TODO: Implementar envío real de email
        print(f"Email enviado a {email} con password: {password}")
    
    def gestionar_modulos_empresa(
        self,
        db: Session,
        admin_id: str,
        empresa_id: str,
        accion: str,  # "agregar", "quitar", "extender"
        modulos: List[str],
        duracion_dias: Optional[int] = None,
        motivo: Optional[str] = None
    ) -> Dict[str, Any]:
        """Gestiona los módulos de una empresa"""
        
        # Validar admin
        admin = db.query(User).filter(
            and_(
                User.id == admin_id,
                User.is_superuser == True
            )
        ).first()
        
        if not admin:
            raise ValueError("No tiene permisos de administrador")
        
        empresa = db.query(Empresa).filter(
            Empresa.id == empresa_id
        ).first()
        
        if not empresa:
            raise ValueError("Empresa no encontrada")
        
        resultado = {
            "empresa_id": empresa_id,
            "accion": accion,
            "modulos_afectados": modulos,
            "cambios": []
        }
        
        if accion == "agregar":
            # Agregar nuevos módulos
            for modulo_codigo in modulos:
                # Verificar si ya tiene el módulo
                acceso_existente = db.query(ModuloAcceso).filter(
                    and_(
                        ModuloAcceso.empresa_id == empresa_id,
                        ModuloAcceso.modulo_codigo == modulo_codigo
                    )
                ).first()
                
                if acceso_existente and acceso_existente.activo:
                    resultado["cambios"].append({
                        "modulo": modulo_codigo,
                        "estado": "ya_activo",
                        "mensaje": "El módulo ya está activo"
                    })
                    continue
                
                # Crear o reactivar acceso
                if acceso_existente:
                    acceso_existente.activo = True
                    acceso_existente.fecha_activacion = datetime.utcnow()
                    acceso_existente.fecha_expiracion = datetime.utcnow() + timedelta(
                        days=duracion_dias or 365
                    )
                else:
                    nuevo_acceso = ModuloAcceso(
                        empresa_id=empresa_id,
                        modulo_codigo=modulo_codigo,
                        activo=True,
                        fecha_activacion=datetime.utcnow(),
                        fecha_expiracion=datetime.utcnow() + timedelta(
                            days=duracion_dias or 365
                        ),
                        configuracion={
                            "agregado_por": admin_id,
                            "motivo": motivo,
                            "fecha": datetime.utcnow().isoformat()
                        }
                    )
                    db.add(nuevo_acceso)
                
                resultado["cambios"].append({
                    "modulo": modulo_codigo,
                    "estado": "agregado",
                    "vigencia_hasta": (datetime.utcnow() + timedelta(
                        days=duracion_dias or 365
                    )).isoformat()
                })
        
        elif accion == "quitar":
            # Desactivar módulos
            for modulo_codigo in modulos:
                acceso = db.query(ModuloAcceso).filter(
                    and_(
                        ModuloAcceso.empresa_id == empresa_id,
                        ModuloAcceso.modulo_codigo == modulo_codigo,
                        ModuloAcceso.activo == True
                    )
                ).first()
                
                if acceso:
                    acceso.activo = False
                    acceso.fecha_desactivacion = datetime.utcnow()
                    
                    if not acceso.configuracion:
                        acceso.configuracion = {}
                    
                    acceso.configuracion["desactivacion"] = {
                        "por": admin_id,
                        "motivo": motivo,
                        "fecha": datetime.utcnow().isoformat()
                    }
                    
                    resultado["cambios"].append({
                        "modulo": modulo_codigo,
                        "estado": "desactivado",
                        "fecha": datetime.utcnow().isoformat()
                    })
                else:
                    resultado["cambios"].append({
                        "modulo": modulo_codigo,
                        "estado": "no_encontrado",
                        "mensaje": "El módulo no estaba activo"
                    })
        
        elif accion == "extender":
            # Extender vigencia
            if not duracion_dias:
                raise ValueError("Debe especificar duración para extender")
            
            for modulo_codigo in modulos:
                acceso = db.query(ModuloAcceso).filter(
                    and_(
                        ModuloAcceso.empresa_id == empresa_id,
                        ModuloAcceso.modulo_codigo == modulo_codigo
                    )
                ).first()
                
                if acceso:
                    # Extender desde la fecha actual de expiración
                    if acceso.fecha_expiracion and acceso.fecha_expiracion > datetime.utcnow():
                        nueva_expiracion = acceso.fecha_expiracion + timedelta(days=duracion_dias)
                    else:
                        nueva_expiracion = datetime.utcnow() + timedelta(days=duracion_dias)
                    
                    acceso.fecha_expiracion = nueva_expiracion
                    acceso.activo = True
                    
                    resultado["cambios"].append({
                        "modulo": modulo_codigo,
                        "estado": "extendido",
                        "nueva_vigencia": nueva_expiracion.isoformat()
                    })
                else:
                    resultado["cambios"].append({
                        "modulo": modulo_codigo,
                        "estado": "no_encontrado",
                        "mensaje": "El módulo no existe para esta empresa"
                    })
        
        db.commit()
        
        # Registrar en log de auditoría
        self._registrar_cambio_comercial(
            db,
            admin_id,
            empresa_id,
            accion,
            resultado
        )
        
        return resultado
    
    def _registrar_cambio_comercial(
        self,
        db: Session,
        admin_id: str,
        empresa_id: str,
        accion: str,
        detalles: Dict[str, Any]
    ):
        """Registra cambios comerciales en log de auditoría"""
        # TODO: Implementar registro en tabla de auditoría
        pass
    
    def get_dashboard_comercial(
        self,
        db: Session,
        admin_id: str,
        fecha_desde: Optional[datetime] = None,
        fecha_hasta: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Obtiene métricas comerciales para dashboard administrativo"""
        
        # Validar admin
        admin = db.query(User).filter(
            and_(
                User.id == admin_id,
                User.is_superuser == True
            )
        ).first()
        
        if not admin:
            raise ValueError("No tiene permisos de administrador")
        
        # Fechas por defecto: último mes
        if not fecha_hasta:
            fecha_hasta = datetime.utcnow()
        if not fecha_desde:
            fecha_desde = fecha_hasta - timedelta(days=30)
        
        # Total de empresas
        total_empresas = db.query(Empresa).filter(
            Empresa.es_activa == True
        ).count()
        
        # Nuevas empresas en el período
        nuevas_empresas = db.query(Empresa).filter(
            and_(
                Empresa.created_at >= fecha_desde,
                Empresa.created_at <= fecha_hasta
            )
        ).count()
        
        # Licencias activas
        licencias_activas = db.query(Licencia).filter(
            and_(
                Licencia.activa == True,
                Licencia.fecha_expiracion > datetime.utcnow()
            )
        ).count()
        
        # Ingresos del período (simplificado)
        licencias_periodo = db.query(Licencia).filter(
            and_(
                Licencia.fecha_inicio >= fecha_desde,
                Licencia.fecha_inicio <= fecha_hasta
            )
        ).all()
        
        ingresos_periodo = sum(
            lic.metadata.get("precio_pagado", 0) 
            for lic in licencias_periodo 
            if lic.metadata
        )
        
        # Módulos más vendidos
        modulos_vendidos = {}
        for lic in licencias_periodo:
            if lic.metadata and "modulos" in lic.metadata:
                for mod in lic.metadata["modulos"]:
                    modulos_vendidos[mod] = modulos_vendidos.get(mod, 0) + 1
        
        # Empresas por plan
        empresas_por_plan = {}
        todas_licencias = db.query(Licencia).filter(
            Licencia.activa == True
        ).all()
        
        for lic in todas_licencias:
            plan = lic.tipo_licencia
            empresas_por_plan[plan] = empresas_por_plan.get(plan, 0) + 1
        
        # Renovaciones próximas (próximos 30 días)
        proximas_renovaciones = db.query(Licencia).filter(
            and_(
                Licencia.activa == True,
                Licencia.fecha_expiracion >= datetime.utcnow(),
                Licencia.fecha_expiracion <= datetime.utcnow() + timedelta(days=30)
            )
        ).count()
        
        # Tasa de uso por módulo
        uso_modulos = {}
        modulos_acceso = db.query(ModuloAcceso).filter(
            ModuloAcceso.activo == True
        ).all()
        
        for acceso in modulos_acceso:
            modulo = acceso.modulo_codigo
            if modulo not in uso_modulos:
                uso_modulos[modulo] = {
                    "empresas_con_acceso": 0,
                    "usuarios_activos": 0,
                    "uso_ultimo_mes": 0
                }
            uso_modulos[modulo]["empresas_con_acceso"] += 1
        
        return {
            "periodo": {
                "desde": fecha_desde.isoformat(),
                "hasta": fecha_hasta.isoformat()
            },
            "metricas_generales": {
                "total_empresas_activas": total_empresas,
                "nuevas_empresas_periodo": nuevas_empresas,
                "licencias_activas": licencias_activas,
                "proximas_renovaciones_30d": proximas_renovaciones
            },
            "metricas_financieras": {
                "ingresos_periodo": ingresos_periodo,
                "ticket_promedio": ingresos_periodo / nuevas_empresas if nuevas_empresas > 0 else 0
            },
            "distribucion": {
                "empresas_por_plan": empresas_por_plan,
                "modulos_mas_vendidos": sorted(
                    modulos_vendidos.items(),
                    key=lambda x: x[1],
                    reverse=True
                )
            },
            "uso_plataforma": {
                "modulos": uso_modulos
            },
            "alertas": {
                "renovaciones_proximas": proximas_renovaciones,
                "empresas_sin_uso_30d": 0  # TODO: Implementar
            }
        }
    
    def exportar_reporte_comercial(
        self,
        db: Session,
        admin_id: str,
        tipo_reporte: str,
        formato: str = "excel",
        filtros: Optional[Dict[str, Any]] = None
    ) -> bytes:
        """Genera reportes comerciales exportables"""
        
        # Validar admin
        admin = db.query(User).filter(
            and_(
                User.id == admin_id,
                User.is_superuser == True
            )
        ).first()
        
        if not admin:
            raise ValueError("No tiene permisos de administrador")
        
        if tipo_reporte == "empresas_activas":
            return self._reporte_empresas_activas(db, formato, filtros)
        elif tipo_reporte == "ventas_periodo":
            return self._reporte_ventas_periodo(db, formato, filtros)
        elif tipo_reporte == "uso_modulos":
            return self._reporte_uso_modulos(db, formato, filtros)
        elif tipo_reporte == "renovaciones":
            return self._reporte_renovaciones(db, formato, filtros)
        else:
            raise ValueError(f"Tipo de reporte no válido: {tipo_reporte}")
    
    def _reporte_empresas_activas(
        self,
        db: Session,
        formato: str,
        filtros: Optional[Dict[str, Any]]
    ) -> bytes:
        """Genera reporte de empresas activas"""
        
        query = db.query(Empresa).filter(
            Empresa.es_activa == True
        )
        
        # Aplicar filtros si existen
        if filtros:
            if "comuna" in filtros:
                query = query.filter(Empresa.comuna == filtros["comuna"])
            if "plan" in filtros:
                # JOIN con licencias para filtrar por plan
                query = query.join(Licencia).filter(
                    Licencia.tipo_licencia == filtros["plan"]
                )
        
        empresas = query.all()
        
        # Generar reporte según formato
        if formato == "excel":
            # TODO: Implementar generación Excel
            return b"Excel no implementado"
        elif formato == "csv":
            import csv
            import io
            
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Headers
            writer.writerow([
                "RUT", "Razón Social", "Comuna", "Email Contacto",
                "Fecha Creación", "Plan", "Módulos Activos"
            ])
            
            # Datos
            for empresa in empresas:
                # Obtener licencia activa
                licencia = db.query(Licencia).filter(
                    and_(
                        Licencia.empresa_id == empresa.id,
                        Licencia.activa == True
                    )
                ).first()
                
                writer.writerow([
                    empresa.rut,
                    empresa.razon_social,
                    empresa.comuna,
                    empresa.email_contacto,
                    empresa.created_at.strftime("%Y-%m-%d"),
                    licencia.tipo_licencia if licencia else "Sin plan",
                    "TODO"  # Implementar lista de módulos
                ])
            
            return output.getvalue().encode('utf-8')
        
        return b"Formato no soportado"
    
    def _reporte_ventas_periodo(
        self,
        db: Session,
        formato: str,
        filtros: Optional[Dict[str, Any]]
    ) -> bytes:
        """Genera reporte de ventas del período"""
        # TODO: Implementar
        return b"Reporte de ventas"
    
    def _reporte_uso_modulos(
        self,
        db: Session,
        formato: str,
        filtros: Optional[Dict[str, Any]]
    ) -> bytes:
        """Genera reporte de uso de módulos"""
        # TODO: Implementar
        return b"Reporte de uso"
    
    def _reporte_renovaciones(
        self,
        db: Session,
        formato: str,
        filtros: Optional[Dict[str, Any]]
    ) -> bytes:
        """Genera reporte de renovaciones pendientes"""
        # TODO: Implementar
        return b"Reporte de renovaciones"