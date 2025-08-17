"""
Modelos de base de datos para el sistema multi-tenant
"""
from .base import Base, TenantMixin
from .tenant import Tenant, TenantConfig
from .user import User
from .empresa import Empresa, ModuloAcceso, Licencia
from .consentimiento import (
    TitularDatos,
    Proposito,
    Consentimiento,
    ConsentimientoProprosito,
    HistorialConsentimiento
)
from .arcopol import (
    SolicitudARCOPOL,
    DocumentoSolicitud,
    RespuestaSolicitud,
    HistorialSolicitud
)
from .inventario import (
    ActividadTratamiento,
    BaseLegal,
    CategoriaDatos,
    DestinatarioDatos,
    TransferenciaDatos,
    MedidaSeguridad
)
from .brecha import (
    NotificacionBrecha,
    AfectadoBrecha,
    MedidaMitigacion,
    DocumentoBrecha
)
from .dpia import (
    EvaluacionImpacto,
    RiesgoDPIA,
    MedidaMitigacionDPIA,
    AprobacionDPIA
)
from .transferencia import (
    TransferenciaInternacional,
    GarantiaAdecuada,
    ClausulaContractual,
    EvaluacionPais
)
from .auditoria import (
    LogAuditoria,
    EventoSistema,
    MetricaCumplimiento,
    ReporteCumplimiento
)

# Modelos básicos del sistema
try:
    from .organizacion import Organizacion
    from .role import Role
    from .permission import Permission
except ImportError:
    pass
#     # COMENTADO: Conflicto con ActividadTratamiento del módulo inventario
#     # from .actividad import (
#     #     ActividadTratamiento as ActividadTratamientoOld,
#     #     CategoriaDato,
#     #     ActividadDato,
#     #     CategoriaTitular,
#     #     ActividadTitular,
#     #     SistemaActivo,
#     #     ActividadSistema,
#     #     Destinatario,
#     #     ActividadFlujo
#     # )
#     from .capacitacion import ProgresoCapacitacion, SesionEntrevista, RespuestaEntrevista
#     
#     # Agregar a __all__ si existen
#     modelos_antiguos = [
#         "Organizacion",
#         "Usuario",
#         "ProgresoCapacitacion",
#         "SesionEntrevista",
#         "RespuestaEntrevista"
#     ]
# except ImportError:
#     # Si no existen los modelos antiguos, continuar sin ellos
#     modelos_antiguos = []
modelos_antiguos = []

__all__ = [
    # Base
    "Base",
    "TenantMixin",
    
    # Tenant
    "Tenant",
    "TenantConfig",
    
    # Usuario
    "User",
    
    # Empresa
    "Empresa",
    "ModuloAcceso",
    "Licencia",
    
    # Consentimiento
    "TitularDatos",
    "Proposito",
    "Consentimiento",
    "ConsentimientoProprosito",
    "HistorialConsentimiento",
    
    # ARCOPOL
    "SolicitudARCOPOL",
    "DocumentoSolicitud",
    "RespuestaSolicitud",
    "HistorialSolicitud",
    
    # Inventario
    "ActividadTratamiento",
    "BaseLegal",
    "CategoriaDatos",
    "DestinatarioDatos",
    "TransferenciaDatos",
    "MedidaSeguridad",
    
    # Brecha
    "NotificacionBrecha",
    "AfectadoBrecha",
    "MedidaMitigacion",
    "DocumentoBrecha",
    
    # DPIA
    "EvaluacionImpacto",
    "RiesgoDPIA",
    "MedidaMitigacionDPIA",
    "AprobacionDPIA",
    
    # Transferencia
    "TransferenciaInternacional",
    "GarantiaAdecuada",
    "ClausulaContractual",
    "EvaluacionPais",
    
    # Auditoría
    "LogAuditoria",
    "EventoSistema",
    "MetricaCumplimiento",
    "ReporteCumplimiento"
] + modelos_antiguos