# ANÁLISIS DE INTERCONEXIONES - SISTEMA LPDP LEY 21.719
**Flujos de Datos y Dependencias entre 11 Módulos**

---

## 🔄 MAPA DE FLUJOS PRINCIPALES

### FLUJO 1: CONSTRUCCIÓN → GESTIÓN RAT
```
RATSystemProfessional → mapeo_datos_rat → RATListPage
                     ↓
            generated_documents → ReportGenerator
                     ↓
            dpo_notifications → NotificationCenter
```

**Interconexión:**
- `RATSystemProfessional.guardarEnSupabase()` → `mapeo_datos_rat.insert()`
- `RATListPage.cargarRATs()` ← `mapeo_datos_rat.select()`
- Trigger automático: RAT creado → Notificación DPO cola revisión

### FLUJO 2: RAT → MÉTRICAS COMPLIANCE
```
mapeo_datos_rat → ComplianceMetrics.calcularMetricasCompliance()
                            ↓
            Dashboard ejecutivo + Alertas automáticas
```

**Campos Compartidos:**
- `estado`, `completitud_porcentaje`, `datos_sensibles`
- `transferencias_internacionales`, `nivel_riesgo`
- Auto-cálculo tendencias y KPIs tiempo real

### FLUJO 3: WORKFLOW APROBACIÓN DPO
```
RATListPage → DPOApprovalQueue ← DashboardDPO
      ↓              ↓              ↓
mapeo_datos_rat.estado_revision_dpo ← actividades_dpo
      ↓
NotificationCenter (alertas workflow)
```

**Estados Workflow:**
- `BORRADOR` → `REVISION` → `APROBADO` → `ACTIVO`
- Cada cambio estado genera notificación automática
- `DPOApprovalQueue` maneja transiciones con auditoría

---

## 🏢 FLUJO GESTIÓN PROVEEDORES

### FLUJO 4: PROVEEDORES → DPA → RAT
```
GestionProveedores → proveedores.insert()
        ↓
DPAGenerator.seleccionarProveedor() → documentos_dpa
        ↓
rat_proveedores.asociarProveedorRAT() → mapeo_datos_rat
        ↓
ComplianceMetrics (métricas DPA vencimientos)
```

**Servicios Interconectados:**
- `proveedoresService.createProveedor()` → `proveedoresService.createDPA()`
- `DPAGenerator.cargarProveedores()` ← Multi-tenant filtering
- `NotificationCenter` ← Alertas vencimientos DPA automáticas

### FLUJO 5: EVALUACIÓN RIESGOS PROVEEDORES
```
GestionProveedores.evaluacionSeguridad()
        ↓
evaluaciones_seguridad.insert()
        ↓
ComplianceMetrics.proveedoresAltoRiesgo()
        ↓
NotificationCenter.PROVEEDOR_RIESGO
```

---

## 🔐 FLUJO EVALUACIONES IMPACTO (EIPD/DPIA)

### FLUJO 6: RAT → EIPD REQUERIDA
```
RATSystemProfessional.calcularPuntajeCompliance()
        ↓
SI (datos_sensibles + algoritmos_decisiones) → requiere_eipd = true
        ↓
NotificationCenter.EIPD_REQUERIDA
        ↓
EIPDCreator.construirEIPD()
        ↓
evaluaciones_impacto_privacidad.insert()
        ↓
EIPDListPage.mostrarEvaluaciones()
```

**Trigger Automático EIPD:**
- Datos biométricos/genéticos → EIPD obligatoria
- Decisiones automatizadas → `DPIAAlgoritmos` evaluación
- Alto volumen datos → Evaluación impacto requerida

### FLUJO 7: ALGORITMOS IA → DPIA
```
DPIAAlgoritmos.evaluarRiesgoAlgoritmo()
        ↓
ratIntelligenceEngine.analisisInteligente()
        ↓
evaluaciones_impacto_privacidad (tipo: ALGORITMOS)
        ↓
ComplianceMetrics.cumplimientoIA()
```

---

## 📊 FLUJO REPORTES Y MONITOREO

### FLUJO 8: DATOS → REPORTES CONSOLIDADOS
```
Múltiples Fuentes:
├── mapeo_datos_rat (RATs principales)
├── proveedores + dpas (relaciones DPA)  
├── generated_documents (documentos generados)
├── evaluaciones_seguridad (assessments)
├── audit_log (trazabilidad)
└── actividades_dpo (workflow)
        ↓
ReportGenerator.generarReporteRATConsolidado()
        ↓
generated_documents.insert() (historial reportes)
        ↓
AdminPanel.monitorearSistema() (métricas uso)
```

### FLUJO 9: NOTIFICACIONES AUTOMÁTICAS
```
Triggers Sistema:
├── RAT próximo vencer → RAT_VENCIMIENTO
├── DPA vigencia < 30 días → DPA_RENOVACION  
├── EIPD pendiente → EIPD_REQUERIDA
├── Workflow asignado → WORKFLOW_ASIGNACION
├── Proveedor alto riesgo → PROVEEDOR_RIESGO
└── Auditoría programada → AUDITORIA_PROGRAMADA
        ↓
NotificationCenter.cargarNotificaciones()
        ↓
Canales: EMAIL, SMS, IN_APP, WEBHOOK
```

---

## ⚙️ FLUJO ADMINISTRACIÓN SISTEMA

### FLUJO 10: MULTI-TENANCY Y USUARIOS
```
AdminPanel.gestionarUsuarios()
        ↓
usuarios.insert() + organizaciones.insert()
        ↓
TenantContext.currentTenant → Aislación RLS
        ↓
TODOS LOS MÓDULOS filtran por tenant_id
        ↓
proveedoresService.getCurrentTenant() (auto-detección)
```

**Aislación Multi-Tenant:**
- Cada operación CRUD incluye `tenant_id` automático
- RLS Supabase enforce aislación nivel base datos
- `useTenant()` context propagado todos componentes

### FLUJO 11: AUDITORÍA Y TRAZABILIDAD
```
CUALQUIER OPERACIÓN CRUD:
├── mapeo_datos_rat.insert/update/delete
├── proveedores.insert/update/delete
├── evaluaciones_*.insert/update/delete
└── generated_documents.insert/update/delete
        ↓
audit_log.insert() automático
        ↓
AdminPanel.auditarOperaciones()
        ↓
ReportGenerator.incluirAuditoria = true
```

---

## 🔗 DEPENDENCIAS CRÍTICAS ENTRE MÓDULOS

### DEPENDENCIAS DIRECTAS:
1. **RATSystemProfessional** → **RATListPage** (tabla `mapeo_datos_rat`)
2. **RATListPage** → **ComplianceMetrics** (datos compliance)
3. **GestionProveedores** → **DPAGenerator** (selección proveedores)
4. **DashboardDPO** ← **DPOApprovalQueue** (métricas workflow)
5. **NotificationCenter** ← **TODOS** (alertas automáticas)
6. **ReportGenerator** ← **TODOS** (consolidación datos)
7. **AdminPanel** → **TODOS** (gestión usuarios/tenants)

### DEPENDENCIAS DE SERVICIOS:
1. **proveedoresService.js** ← **GestionProveedores** + **DPAGenerator**
2. **ratIntelligenceEngine.js** ← **RATSystemProfessional** + **ComplianceMetrics**
3. **TenantContext** → **TODOS** (multi-tenancy)
4. **AuthContext** → **TODOS** (autenticación)

### DEPENDENCIAS DE DATOS:
```
organizaciones (tenant) 
    ↓
usuarios (multi-tenant)
    ↓  
mapeo_datos_rat (RATs principales)
    ↓
├── rat_proveedores (relaciones)
├── evaluaciones_impacto_privacidad (EIPDs)  
├── generated_documents (documentos)
├── actividades_dpo (workflow)
└── dpo_notifications (alertas)
```

---

## 📋 FLUJOS DE NAVEGACIÓN USUARIO

### FLUJO USUARIO TÍPICO:
1. **Login** → `AdminPanel` (si admin) o `DashboardDPO` (si DPO)
2. **Crear RAT** → `RATSystemProfessional` → paso-a-paso construcción
3. **Revisar RATs** → `RATListPage` → filtros y búsquedas
4. **Aprobar RAT** → `DPOApprovalQueue` → workflow aprobación
5. **Gestionar Proveedores** → `GestionProveedores` → CRUD proveedores
6. **Generar DPA** → `DPAGenerator` → documentos legales
7. **Ver Métricas** → `ComplianceMetrics` → dashboard ejecutivo
8. **Crear EIPD** → `EIPDCreator` si requerida por RAT
9. **Revisar Notificaciones** → `NotificationCenter` → alertas pendientes
10. **Exportar Reportes** → `ReportGenerator` → documentos finales

### FLUJO NOTIFICACIONES:
```
Sistema detecta evento → Trigger automático → dpo_notifications.insert()
                    ↓
NotificationCenter.cargarNotificaciones() → Badge contador
                    ↓
Usuario hace click → navigateToResource() → Módulo específico
```

---

## 🔄 INTEGRACIONES AUTOMÁTICAS

### AUTO-TRIGGERS IMPLEMENTADOS:
1. **RAT creado** → Notificación DPO + Cálculo compliance
2. **Proveedor alto riesgo** → Alerta automática + Evaluación requerida
3. **DPA próximo vencer** → Notificación multi-canal
4. **EIPD requerida** → Trigger basado en tipos datos RAT
5. **Workflow completado** → Update estados + Auditoría log
6. **Métricas outdated** → Recálculo automático compliance

### PROPAGACIÓN CAMBIOS:
- **RAT actualizado** → Recálculo métricas → Alertas si aplicable
- **Proveedor modificado** → Verificación DPA → Update scoring riesgo  
- **Usuario creado** → Setup tenant → Permisos propagados
- **Estado cambiado** → Audit log → Notificaciones stakeholders

---

## 🚨 PUNTOS CRÍTICOS INTERCONEXIÓN

### DEPENDENCIAS BLOQUEANTES:
1. **TenantContext** falla → Sistema completo inaccesible
2. **Supabase RLS** error → Violación aislación multi-tenant
3. **proveedoresService** down → Módulos 7, 9 inoperativos
4. **ratIntelligenceEngine** falla → Scoring compliance incorrecto

### INTEGRIDAD REFERENCIAL:
1. `mapeo_datos_rat.tenant_id` → `organizaciones.id` (FK)
2. `proveedores.tenant_id` → `organizaciones.id` (FK)
3. `rat_proveedores.rat_id` → `mapeo_datos_rat.id` (FK)
4. `documentos_dpa.proveedor_id` → `proveedores.id` (FK)

### VALIDACIONES CRUZADAS:
1. **RAT con datos sensibles** DEBE triggerar EIPD evaluación
2. **Proveedor con acceso datos** DEBE tener DPA vigente
3. **Transferencia internacional** DEBE tener salvaguardas definidas
4. **Decisión automatizada** DEBE pasar por DPIAAlgoritmos

---

## 📊 MATRIZ DE DEPENDENCIAS

| MÓDULO | CONSUME DE | ALIMENTA A | TABLA PRINCIPAL |
|--------|------------|------------|-----------------|
| RATSystemProfessional | TenantContext, ratIntelligenceEngine | mapeo_datos_rat | mapeo_datos_rat |
| RATListPage | mapeo_datos_rat | ComplianceMetrics, ReportGenerator | mapeo_datos_rat |
| ComplianceMetrics | mapeo_datos_rat, proveedores, dpas | DashboardDPO, NotificationCenter | - |
| DashboardDPO | actividades_dpo, dpo_notifications | DPOApprovalQueue | actividades_dpo |
| DPOApprovalQueue | mapeo_datos_rat, usuarios | actividades_dpo, audit_log | actividades_dpo |
| DPIAAlgoritmos | mapeo_datos_rat | evaluaciones_impacto_privacidad | evaluaciones_impacto_privacidad |
| EIPDListPage | evaluaciones_impacto_privacidad | ReportGenerator | evaluaciones_impacto_privacidad |
| EIPDCreator | mapeo_datos_rat | evaluaciones_impacto_privacidad | evaluaciones_impacto_privacidad |
| GestionProveedores | proveedoresService | proveedores, DPAGenerator | proveedores |
| AdminPanel | usuarios, organizaciones, audit_log | TenantContext | usuarios, organizaciones |
| DPAGenerator | proveedores, TenantContext | documentos_dpa | documentos_dpa |
| NotificationCenter | dpo_notifications, TODOS | - | dpo_notifications |
| ReportGenerator | TODAS las tablas | generated_documents | generated_documents |

**Sistema altamente interconectado con flujos bidireccionales y triggers automáticos garantizando integridad datos y compliance Ley 21.719.**