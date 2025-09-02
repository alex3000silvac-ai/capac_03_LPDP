# 🌐 DIAGRAMA FLUJO ECOSISTEMA COMPLETO LPDP
## 🎯 SISTEMA NERVIOSO CENTRAL - TODAS LAS CONEXIONES

### 📊 MAPA MÓDULOS PRINCIPALES (basado en App.js y análisis completo)

```
                    🌐 ECOSISTEMA LPDP COMPLETO
                    
        🛡️ IA PREVENTIVA (PreventiveAIController) - MONITOREA TODO
                            │
                            ▼
    ┌───────────────────────────────────────────────────────────────────┐
    │                    📊 NÚCLEO DE DATOS                              │
    │              (TODAS las tablas basedatos.csv)                     │
    │                                                                   │
    │  TABLAS CRÍTICAS:                                                │
    │  ├─ mapeo_datos_rat (RATs principales)                           │
    │  ├─ actividades_dpo (Tareas DPO)                                 │
    │  ├─ organizaciones (Empresas)                                    │
    │  ├─ usuarios (Users)                                             │
    │  ├─ proveedores (Providers)                                      │
    │  ├─ dpas (Acuerdos procesamiento)                               │
    │  ├─ dpo_notifications (Notificaciones)                          │
    │  ├─ audit_log, audit_logs (Auditoría)                          │
    │  ├─ generated_documents (EIPDs generadas)                       │
    │  ├─ rats (RATs simplificadas)                                   │
    │  ├─ tenant_usage, tenant_limits (Multi-tenant)                  │
    │  └─ evaluaciones_seguridad (Evaluaciones providers)             │
    └───────────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │  📋 INPUT   │ │ 🔄 PROCESO  │ │ 📊 OUTPUT   │
    │  MÓDULOS    │ │  MÓDULOS    │ │  MÓDULOS    │
    └─────────────┘ └─────────────┘ └─────────────┘
```

## 🔥 MÓDULOS INPUT - CADA UNO CON SU DIAGRAMA

### 📋 1. MÓDULO RAT SYSTEM PROFESSIONAL
**Ruta:** `/rat-system`
**Archivo:** `RATSystemProfessional.js`
**Tabla principal:** `mapeo_datos_rat`

```
DIAGRAMA FLUJO RAT CREATION:

👤 Usuario inicia → Selecciona empresa (organizaciones)
        │
        ▼
🔍 IA Preventiva intercepta → Validar duplicados → Verificar cuotas
        │
        ▼
📝 Formulario RAT → Validar campos obligatorios → Pre-evaluar riesgo
        │
        ▼
⚖️ Detecta nivel riesgo → BAJO/MEDIO/ALTO
        │
        ├─ BAJO/MEDIO ────────────────┐
        │                            │
        ├─ ALTO → Auto-crear EIPD ───┘
        │         (generated_documents)
        ▼                            ▼
💾 Guardar RAT → AUTO-EFECTOS CASCADA:
    (mapeo_datos_rat)  ├─ +1 en DashboardDPO.ratsActivos
                       ├─ +1 en RATListPage.total  
                       ├─ +1 en ComplianceMetrics.totalRATs
                       ├─ +1 en AdminDashboard.ratsTotal
                       ├─ Crear actividad_dpo si alto riesgo
                       ├─ Enviar dpo_notifications
                       ├─ Registrar en audit_log
                       └─ Si ALTO: crear entry en generated_documents (EIPD)
```

### 📄 2. MÓDULO EIPD CREATOR  
**Ruta:** `/eipd-creator` y `/eipd-creator/:ratId`
**Archivo:** `EIPDCreator.js`
**Tablas:** `generated_documents`, `mapeo_datos_rat`, `actividades_dpo`

```
DIAGRAMA FLUJO EIPD CREATION:

📋 RAT alto riesgo detectado → Auto-trigger EIPD
        │                      OR Manual trigger
        ▼
🔍 IA Preventiva → ¿RAT válido? → ¿Ya tiene EIPD?
        │
        ▼
📝 Formulario EIPD → Cargar datos RAT relacionado
        │             (mapeo_datos_rat WHERE id = ratId)
        ▼
🧠 Evaluación IA → Análisis automático riesgos
        │
        ▼
📊 Generar EIPD → Guardar generated_documents
        │
        ▼
🔔 AUTO-EFECTOS CASCADA:
    ├─ Crear actividad_dpo "Revisar EIPD"
    ├─ DashboardDPO.eipdsPendientes +1
    ├─ Notificar DPO (dpo_notifications)
    ├─ ComplianceMetrics.eipdsPendientes +1
    ├─ Actualizar RAT.status = "ESPERANDO_EIPD"
    └─ Registrar audit_log
```

### 🏢 3. MÓDULO PROVIDER MANAGER
**Ruta:** `/provider-manager`  
**Archivo:** `ProviderManager.js`
**Tablas:** `proveedores`, `dpas`, `evaluaciones_seguridad`, `rat_proveedores`

```
DIAGRAMA FLUJO PROVIDER CREATION:

👤 Usuario → Crear nuevo proveedor
        │
        ▼
🔍 IA Preventiva → ¿Proveedor duplicado? → ¿País requiere DPA?
        │
        ▼
📝 Formulario Proveedor → Datos básicos + ubicación
        │
        ▼
🌍 Evaluar transferencia → ¿Internacional? → ¿País adequado?
        │                    │
        │ NO ────────────────┘
        │                    │
        ▼ SÍ                 ▼
🔒 Requiere DPA → Auto-crear DPA template
        │         (dpas tabla)
        ▼
💾 Guardar proveedor → AUTO-EFECTOS CASCADA:
    (proveedores)      ├─ ProviderManager.totalProveedores +1
                       ├─ Crear evaluaciones_seguridad (pending)
                       ├─ AdminDashboard.proveedoresTotal +1
                       ├─ Si internacional: ComplianceMetrics.transferenciasInternacionales +1
                       ├─ Crear actividad_dpo "Evaluar proveedor"
                       ├─ Notificar DPO (dpo_notifications)
                       └─ Registrar audit_log

🔄 ASIGNACIÓN A RAT:
Usuario → Asignar proveedor a RAT
        │
        ▼
💾 Crear rat_proveedores → AUTO-EFECTOS:
                          ├─ RAT.estado = "CON_PROVEEDORES"
                          ├─ Actualizar mapeo_datos_rat.transferencias_internacionales
                          ├─ ComplianceMetrics.ratConProveedores +1
                          └─ Re-evaluar riesgo RAT (puede requerir EIPD)
```

### 🛡️ 4. MÓDULO DPO APPROVAL QUEUE
**Ruta:** `/dpo-approval-queue` (implícito en DPOApprovalQueue.js)
**Archivo:** `DPOApprovalQueue.js`  
**Tablas:** `actividades_dpo`, `mapeo_datos_rat`, `generated_documents`, `dpo_notifications`

```
DIAGRAMA FLUJO DPO APPROVAL:

📥 DPO ingresa → Ver cola aprobaciones
        │         (actividades_dpo WHERE estado = 'pendiente')
        ▼
📋 Lista tareas → RATs pendientes + EIPDs pendientes + Proveedores pendientes
        │
        ▼
👤 DPO selecciona tarea → Abrir formulario aprobación
        │
        ▼
🔍 IA Preventiva → ¿Datos completos? → ¿Cumple normativa?
        │
        ▼
✅ APROBAR → Tipo de aprobación:
    │
    ├─ RAT APROBADO ────────── AUTO-EFECTOS:
    │                         ├─ mapeo_datos_rat.estado = "APROBADO"
    │                         ├─ DashboardDPO.tareasPendientes -1
    │                         ├─ ComplianceMetrics.compliance +%
    │                         ├─ actividades_dpo.estado = "completada"
    │                         ├─ Si era ALTO riesgo: verificar EIPD existe
    │                         └─ Notificar usuario creador
    │
    ├─ EIPD APROBADA ────────── AUTO-EFECTOS:
    │                          ├─ generated_documents.status = "APROBADA"
    │                          ├─ DashboardDPO.eipdsPendientes -1
    │                          ├─ mapeo_datos_rat.estado = "LISTO_CERTIFICAR"
    │                          ├─ ComplianceMetrics.compliance +%
    │                          ├─ Crear actividad_dpo "Certificar RAT"
    │                          └─ Notificar responsable proceso
    │
    └─ PROVEEDOR APROBADO ───── AUTO-EFECTOS:
                              ├─ evaluaciones_seguridad.estado = "APROBADO"
                              ├─ proveedores.estado = "ACTIVO"
                              ├─ Actualizar RATs que usan este proveedor
                              ├─ ComplianceMetrics.proveedoresAprobados +1
                              └─ Habilitar para asignación a RATs
```

### 📊 5. MÓDULO COMPLIANCE METRICS
**Ruta:** `/compliance-metrics`
**Archivo:** `ComplianceMetrics.js`
**Todas las tablas:** (Dashboard consolidado)

```
DIAGRAMA FLUJO COMPLIANCE METRICS:

🔄 Auto-refresh cada 30 seg → Consultar TODAS las tablas
        │
        ▼
📊 CALCULAR MÉTRICAS EN TIEMPO REAL:
    │
    ├─ Total RATs ← COUNT(mapeo_datos_rat WHERE tenant_id = X)
    ├─ RATs Certificados ← COUNT(mapeo_datos_rat WHERE estado = 'CERTIFICADO')  
    ├─ EIPDs Pendientes ← COUNT(generated_documents WHERE status = 'PENDIENTE')
    ├─ Proveedores Activos ← COUNT(proveedores WHERE estado = 'ACTIVO')
    ├─ Transferencias Internacionales ← COUNT(rat_proveedores + proveedores WHERE pais != 'Chile')
    ├─ Tareas DPO ← COUNT(actividades_dpo WHERE estado = 'pendiente')
    ├─ % Cumplimiento ← FORMULA: (RATs_certificados / Total_RATs) * 100
    └─ Próximos Vencimientos ← dpas WHERE vigencia_fin < NOW() + 30 days

📈 MOSTRAR GRÁFICOS → Datos históricos de tenant_usage
        │
        ▼
🔔 ALERTAS AUTOMÁTICAS → Si % cumplimiento < 80%:
                        ├─ Crear system_alerts
                        ├─ Notificar DPO urgente
                        └─ Marcar en dashboard como crítico
```

### 🏢 6. MÓDULO ADMIN DASHBOARD  
**Ruta:** `/admin-dashboard`
**Archivo:** `AdminDashboard.js`
**Vista consolidada:** Multi-tenant

```
DIAGRAMA FLUJO ADMIN DASHBOARD:

🔑 Admin ingresa → Cargar vista multi-tenant
        │
        ▼
📊 CONSULTAS CONSOLIDADAS:
    │
    ├─ Todas las organizaciones ← organizaciones WHERE is_active = true
    ├─ Usuarios por empresa ← usuarios GROUP BY empresa_id  
    ├─ RATs por tenant ← mapeo_datos_rat GROUP BY tenant_id
    ├─ Uso de sistema ← tenant_usage, company_usage_metrics
    ├─ Sesiones activas ← user_sessions WHERE is_active = true
    └─ Alertas sistema ← system_alerts WHERE resolved = false

🔧 ACCIONES ADMIN:
    │
    ├─ Crear nueva empresa → AUTO-EFECTOS:
    │                       ├─ INSERT organizaciones
    │                       ├─ CREATE tenant en tenants
    │                       ├─ SET tenant_limits defaults
    │                       ├─ CREATE licencias básica
    │                       └─ Notificar nuevo tenant
    │
    ├─ Suspender tenant → AUTO-EFECTOS:
    │                   ├─ UPDATE tenants.suspended_at = NOW()
    │                   ├─ UPDATE users.is_active = false (todos del tenant)
    │                   ├─ Crear audit_log suspensión
    │                   └─ Notificar usuarios afectados
    │
    └─ Ver métricas uso → tenant_usage + company_usage_metrics
```

### 📋 7. MÓDULO RAT LIST PAGE
**Ruta:** `/rat-list`
**Archivo:** `RATListPage.js`  
**Tabla:** `mapeo_datos_rat`, `generated_documents`, `actividades_dpo`

```
DIAGRAMA FLUJO RAT LIST:

👤 Usuario ingresa → Cargar lista RATs
        │            (mapeo_datos_rat WHERE tenant_id = X)
        ▼
🔍 FILTROS DINÁMICOS:
    ├─ Por estado ← DISTINCT(estado) FROM mapeo_datos_rat  
    ├─ Por área ← DISTINCT(area_responsable) FROM mapeo_datos_rat
    ├─ Por riesgo ← WHERE requiere_eipd = true/false
    └─ Por fecha ← ORDER BY created_at

📊 CADA RAT MUESTRA:
    ├─ Datos básicos ← mapeo_datos_rat.*
    ├─ Estado EIPD ← generated_documents WHERE rat_id = X
    ├─ Tareas DPO ← actividades_dpo WHERE rat_id = X
    ├─ Proveedores ← rat_proveedores JOIN proveedores
    └─ % Completitud ← Cálculo campos obligatorios vs completados

🔧 ACCIONES DISPONIBLES:
    │
    ├─ EDITAR RAT → Navegar /rat-edit/:ratId
    │               ├─ Cargar datos existentes
    │               ├─ IA Preventiva valida cambios
    │               └─ Al guardar: efectos cascada (ver Módulo 8)
    │
    ├─ ELIMINAR RAT → AUTO-EFECTOS REVERSOS:
    │                ├─ DELETE generated_documents WHERE rat_id = X
    │                ├─ DELETE actividades_dpo WHERE rat_id = X  
    │                ├─ DELETE rat_proveedores WHERE rat_id = X
    │                ├─ UPDATE todos los contadores (-1)
    │                ├─ Registrar audit_log eliminación
    │                └─ Recalcular % cumplimiento
    │
    └─ DUPLICAR RAT → Crear copia con estado BORRADOR
                     ├─ INSERT mapeo_datos_rat (datos base)
                     ├─ NO copiar generated_documents
                     ├─ NO copiar actividades_dpo
                     └─ Estado inicial = 'BORRADOR'
```

### ✏️ 8. MÓDULO RAT EDIT PAGE  
**Ruta:** `/rat-edit/:ratId`
**Archivo:** `RATEditPage.js`
**Tabla:** `mapeo_datos_rat` + relaciones

```
DIAGRAMA FLUJO RAT EDIT:

📋 Cargar RAT existente → SELECT * FROM mapeo_datos_rat WHERE id = :ratId
        │
        ▼
🔍 IA Preventiva → Verificar permisos → ¿Puede modificar?
        │
        ▼
📝 Formulario pre-llenado → Mostrar datos actuales
        │
        ▼
👤 Usuario modifica → Detectar campos cambiados
        │
        ▼
🧠 IA Preventiva INTERCEPTA → ANTES DE GUARDAR:
    │
    ├─ ¿Cambió base legal? → Requiere nueva aprobación DPO
    ├─ ¿Cambió nivel riesgo? → Evaluar si requiere EIPD
    ├─ ¿Agregó categorías datos? → Re-evaluar transferencias
    ├─ ¿Modificó proveedores? → Verificar DPAs vigentes
    └─ ¿Cambió finalidad? → Validar compatibilidad base legal

💾 GUARDAR CAMBIOS → AUTO-EFECTOS CONDICIONALES:
    │
    ├─ SI cambió a ALTO riesgo → Crear EIPD automática
    │                          ├─ INSERT generated_documents
    │                          ├─ Crear actividad_dpo "Revisar EIPD"
    │                          └─ DashboardDPO.eipdsPendientes +1
    │
    ├─ SI cambió proveedores → Actualizar rat_proveedores
    │                        ├─ DELETE existentes
    │                        ├─ INSERT nuevos
    │                        └─ Verificar DPAs requeridas
    │
    ├─ SI cambió estado → Múltiples efectos:
    │   │                ├─ "APROBADO" → ComplianceMetrics.compliance +%
    │   │                ├─ "CERTIFICADO" → Todos los dashboards +1 certificado
    │   │                └─ "CERRADO" → Proceso completo terminado
    │   │
    └─ SIEMPRE → UPDATE mapeo_datos_rat
               ├─ Registrar audit_log (old_values vs new_values)
               ├─ Notificar cambios a stakeholders
               └─ Refresh todos los dashboards
```

### 🏢 9. MÓDULO GESTIÓN PROVEEDORES
**Ruta:** `/gestion-proveedores` (del LayoutSimple)
**Archivo:** `GestionProveedores.js`
**Tablas:** `proveedores`, `dpas`, `evaluaciones_seguridad`

```
DIAGRAMA FLUJO GESTIÓN PROVEEDORES:

👤 Usuario → Gestionar proveedores existentes
        │
        ▼
📊 CARGAR DASHBOARD → SELECT * FROM proveedores WHERE tenant_id = X
        │
        ▼
📋 LISTA PROVEEDORES → Para cada proveedor mostrar:
    ├─ Datos básicos (proveedores.*)
    ├─ Estado DPA (dpas WHERE proveedor_id = X)
    ├─ Última evaluación (evaluaciones_seguridad ORDER BY fecha_evaluacion DESC)
    ├─ RATs asociados (COUNT rat_proveedores WHERE proveedor_id = X)
    └─ Próximos vencimientos DPA

🔧 ACCIONES POR PROVEEDOR:
    │
    ├─ EDITAR PROVEEDOR → UPDATE proveedores
    │                    ├─ Si cambió país: re-evaluar DPA requirement
    │                    ├─ Si cambió tipo: re-evaluar nivel riesgo
    │                    └─ AUTO-EFECTOS: actualizar RATs asociados
    │
    ├─ CREAR/RENOVAR DPA → INSERT/UPDATE dpas
    │                     ├─ Establecer vigencia_inicio, vigencia_fin
    │                     ├─ Auto-crear actividad_dpo "Revisar DPA"
    │                     ├─ ComplianceMetrics.dpasVigentes +1
    │                     └─ Actualizar estado proveedor
    │
    ├─ EVALUACIÓN SEGURIDAD → INSERT evaluaciones_seguridad
    │                        ├─ Formulario técnico + organizativo
    │                        ├─ Calcular puntuación automática
    │                        ├─ Si puntuación < 70: crear alerta crítica
    │                        └─ Actualizar nivel_riesgo proveedor
    │
    └─ ELIMINAR PROVEEDOR → AUTO-EFECTOS REVERSOS:
                           ├─ Verificar RATs asociados (rat_proveedores)
                           ├─ Si tiene RATs: ERROR - no se puede eliminar
                           ├─ Si no tiene RATs: DELETE en cascada
                           ├─ UPDATE contadores (-1)
                           └─ Registrar audit_log
```

### 📊 10. MÓDULO DASHBOARD DPO
**Ruta:** `/dashboard-dpo`
**Archivo:** `DashboardDPO.js`
**Vista consolidada:** Todas las tablas

```
DIAGRAMA FLUJO DASHBOARD DPO:

🔑 DPO ingresa → Cargar vista ejecutiva
        │
        ▼
📊 CONSULTAS TIEMPO REAL:
    │
    ├─ RATs Activos ← COUNT(mapeo_datos_rat WHERE estado IN ('BORRADOR','APROBADO'))
    ├─ EIPDs Pendientes ← COUNT(generated_documents WHERE status = 'PENDIENTE')  
    ├─ Tareas Pendientes ← COUNT(actividades_dpo WHERE estado = 'pendiente')
    ├─ % Cumplimiento ← FORMULA compleja basada en estados
    ├─ Próximos vencimientos ← dpas WHERE vigencia_fin < NOW() + 30
    └─ Alertas críticas ← system_alerts WHERE severity = 'CRITICAL'

🔔 NOTIFICACIONES PANEL:
    ├─ Nuevas tareas ← dpo_notifications WHERE leido = false
    ├─ RATs requieren atención ← mapeo_datos_rat WHERE dias_sin_actividad > 15
    ├─ Proveedores vencen DPA ← dpas WHERE vigencia_fin < NOW() + 7
    └─ Evaluaciones pendientes ← evaluaciones_seguridad WHERE estado = 'PENDIENTE'

🎯 ACCIONES RÁPIDAS:
    ├─ Ir a cola aprobaciones → /dpo-approval-queue
    ├─ Ver métricas detalladas → /compliance-metrics  
    ├─ Revisar RATs → /rat-list
    └─ Gestionar proveedores → /provider-manager
```

### 🎯 11. MÓDULO DPIA ALGORITMOS
**Ruta:** `/dpia-algoritmos`
**Archivo:** `DPIAAlgoritmos.js`
**Tablas:** `dpia`, `mapeo_datos_rat`, `generated_documents`

```
DIAGRAMA FLUJO DPIA ALGORITMOS:

🤖 Detectar algoritmos → En RAT: ¿usa IA/ML/automatización?
        │                (campo mapeo_datos_rat.metadata.usa_algoritmos)
        ▼
🔍 IA Preventiva → ¿Requiere DPIA? → Evaluar Art. 25 Ley 21.719
        │
        ▼
📝 Formulario DPIA → Específico para algoritmos
    ├─ Tipo algoritmo (ML, reglas, decisión automática)
    ├─ Impacto en derechos fundamentales  
    ├─ Transparencia y explicabilidad
    ├─ Medidas mitigación sesgo
    └─ Supervisión humana

💾 GUARDAR DPIA → INSERT dpia
        │
        ▼
🔄 AUTO-EFECTOS CASCADA:
    ├─ UPDATE mapeo_datos_rat.requiere_dpia = true
    ├─ Crear actividad_dpo "Revisar DPIA algoritmo"
    ├─ ComplianceMetrics.dpiasRequeridas +1
    ├─ Si algoritmo alto riesgo: crear EIPD adicional
    ├─ Notificar DPO + responsable técnico
    └─ Registrar audit_log
```

### 📚 12. MÓDULO GLOSARIO LPDP
**Ruta:** `/glosario`
**Archivo:** `GlosarioLPDP.js`
**Tabla:** Datos estáticos legales (no requiere BD)

```
DIAGRAMA FLUJO GLOSARIO:

👤 Usuario busca término → Búsqueda en definiciones estáticas
        │
        ▼
📚 MOSTRAR DEFINICIÓN → Con referencias legales
        │
        ▼
🔄 CONTEXTO INTELIGENTE → IA conecta con RAT actual:
    ├─ Si está en RATSystem: resaltar términos relevantes al RAT
    ├─ Si está en EIPD: mostrar definiciones específicas EIPD
    └─ Si está en DPA: destacar términos contractuales

📊 REGISTRAR USO → INSERT en company_usage_metrics.features_used
                   └─ Analytics: términos más consultados por empresa
```

### 🔔 13. MÓDULO NOTIFICATION CENTER
**Ruta:** `/notifications`
**Archivo:** `NotificationCenter.js`
**Tabla:** `dpo_notifications`, `system_alerts`

```
DIAGRAMA FLUJO NOTIFICATIONS:

🔔 Cargar notificaciones → SELECT * FROM dpo_notifications WHERE user_id = X
        │
        ▼
📋 CATEGORIZAR NOTIFICACIONES:
    ├─ CRÍTICAS → RATs alto riesgo sin EIPD > 7 días
    ├─ URGENTES → DPAs vencen < 7 días
    ├─ INFORMATIVAS → Nuevos RATs creados
    └─ SISTEMA → system_alerts relevantes

👤 Usuario actúa sobre notificación:
    │
    ├─ MARCAR LEÍDA → UPDATE dpo_notifications.leido = true
    │                ├─ DashboardDPO.notificacionesPendientes -1
    │                └─ Registrar interacción
    │
    ├─ IR A ACCIÓN → Navegar a módulo relevante
    │               ├─ RAT → /rat-edit/:ratId
    │               ├─ EIPD → /eipd-creator/:ratId  
    │               ├─ DPA → /provider-manager
    │               └─ Aprobación → /dpo-approval-queue
    │
    └─ CREAR TAREA → INSERT actividades_dpo
                    ├─ Convertir notificación en tarea formal
                    ├─ Asignar responsable
                    └─ Establecer vencimiento
```

### 📅 14. MÓDULO CALENDAR VIEW
**Ruta:** `/calendar`
**Archivo:** `CalendarView.js`
**Tablas:** `actividades_dpo`, `dpas`, `mapeo_datos_rat`

```
DIAGRAMA FLUJO CALENDAR:

📅 Cargar calendario → Consultar eventos múltiples fuentes:
        │
        ├─ Vencimientos DPA ← dpas.vigencia_fin
        ├─ Fechas límite RAT ← actividades_dpo.fecha_vencimiento
        ├─ Evaluaciones proveedores ← evaluaciones_seguridad.proxima_evaluacion
        ├─ Revisiones periódicas ← mapeo_datos_rat.metadata.proxima_revision
        └─ Alertas sistema ← system_alerts.fecha_limite

👤 Usuario selecciona fecha → Ver eventos del día
        │
        ▼
📋 DETALLE EVENTOS → Para cada evento:
    ├─ RAT vence → Mostrar datos + botón "Completar RAT"
    ├─ DPA vence → Mostrar proveedor + botón "Renovar DPA"  
    ├─ Evaluación → Mostrar proveedor + botón "Iniciar evaluación"
    └─ Tarea DPO → Mostrar contexto + botón "Resolver"

🔧 ACCIONES DESDE CALENDAR:
    ├─ Completar directamente → Ejecutar acción + efectos cascada
    ├─ Postponer → UPDATE fecha_vencimiento + justificación
    ├─ Crear recordatorio → INSERT nueva actividad_dpo
    └─ Escalar → Notificar DPO + cambiar prioridad
```

### 🏢 15. MÓDULO GESTIÓN ASOCIACIONES
**Ruta:** `/gestion-asociaciones`
**Archivo:** `GestionAsociaciones.js`
**Tablas:** `organizaciones`, `mapeo_datos_rat`, `rat_proveedores`

```
DIAGRAMA FLUJO ASOCIACIONES:

🏢 Gestionar relaciones → Entre empresas del tenant
        │
        ▼
📊 VISTA ORGANIZACIONES → organizaciones WHERE tenant_id = X
    ├─ Empresa matriz
    ├─ Filiales/sucursales  
    ├─ Partners comerciales
    └─ Proveedores estratégicos

🔄 CREAR ASOCIACIÓN:
    │
    ├─ Empresa + RAT → UPDATE mapeo_datos_rat.organizacion_id
    │                 ├─ Validar coherencia área_responsable
    │                 ├─ Verificar permisos empresa
    │                 └─ Actualizar dashboards
    │
    ├─ RAT + Proveedor → INSERT rat_proveedores  
    │                   ├─ Verificar DPA vigente
    │                   ├─ Evaluar transferencia internacional
    │                   ├─ Auto-crear actividad_dpo si requerido
    │                   └─ Recalcular riesgo RAT
    │
    └─ Transferir RAT → Cambiar organizacion_id
                       ├─ Validar permisos destino
                       ├─ Crear audit_log transferencia
                       ├─ Notificar ambas organizaciones
                       └─ Mantener historial en metadata
```

### 🔍 16. MÓDULO RAT SEARCH FILTER
**Ruta:** `/rat-search`
**Archivo:** `RATSearchFilter.js`
**Tabla:** `mapeo_datos_rat` + búsqueda avanzada

```
DIAGRAMA FLUJO BÚSQUEDA RAT:

🔍 Usuario busca → Input término/filtros
        │
        ▼
🧠 IA INTELIGENTE → Procesamiento búsqueda:
    ├─ Texto libre → Buscar en nombre_actividad + descripcion + finalidad
    ├─ Filtro área → WHERE area_responsable = X
    ├─ Filtro estado → WHERE estado = X  
    ├─ Filtro riesgo → WHERE requiere_eipd/requiere_dpia = true
    ├─ Rango fechas → WHERE created_at BETWEEN X AND Y
    └─ Filtro proveedor → JOIN rat_proveedores WHERE proveedor_id = X

📊 RESULTADOS INTELIGENTES:
    ├─ Ordenar por relevancia + fecha
    ├─ Resaltar términos encontrados
    ├─ Mostrar contexto (EIPD, proveedores, tareas)
    ├─ Sugerir RATs relacionados
    └─ Estadísticas de búsqueda

🎯 ACCIONES DESDE RESULTADOS:
    ├─ Abrir RAT → /rat-edit/:ratId
    ├─ Comparar RATs → Vista lado a lado
    ├─ Exportar resultados → PDF/Excel
    ├─ Crear RAT similar → Duplicar con modificaciones
    └─ Crear lote operaciones → Múltiples RATs
```

### 📊 17. MÓDULO DIAGNOSTIC CENTER
**Ruta:** `/diagnostic`
**Archivo:** `DiagnosticCenter.js`
**Todas las tablas:** Análisis sistémico

```
DIAGRAMA FLUJO DIAGNÓSTICO:

🔧 Ejecutar diagnóstico → Análisis completo sistema
        │
        ▼
🔍 AUDITORÍAS AUTOMÁTICAS:
    │
    ├─ INTEGRIDAD DATOS:
    │   ├─ Verificar RATs huérfanos (sin organización)
    │   ├─ EIPDs sin RAT asociado  
    │   ├─ Proveedores sin evaluación
    │   ├─ DPAs vencidas no renovadas
    │   └─ Usuarios inactivos con RATs activos
    │
    ├─ CONSISTENCIA CONTADORES:
    │   ├─ Contar mapeo_datos_rat vs dashboards
    │   ├─ Verificar generated_documents vs actividades_dpo
    │   ├─ Validar rat_proveedores vs proveedores
    │   └─ Auditar tenant_usage vs datos reales
    │
    ├─ CUMPLIMIENTO NORMATIVO:
    │   ├─ RATs alto riesgo sin EIPD
    │   ├─ Transferencias sin DPA adequada
    │   ├─ Vencimientos no controlados
    │   └─ Falta supervisión DPO
    │
    └─ PERFORMANCE SISTEMA:
        ├─ Consultas lentas
        ├─ Datos duplicados
        ├─ Índices faltantes
        └─ Cache invalidaciones

📊 REPORTE DIAGNÓSTICO → INSERT audit_reports
        │
        ▼
🔧 AUTO-CORRECCIONES → Para problemas detectados:
    ├─ Datos huérfanos → Asignar por defecto o eliminar
    ├─ Contadores incorrectos → Recalcular desde source
    ├─ Vencimientos → Crear actividades_dpo automáticas
    └─ Inconsistencias → Forzar sincronización
```

### 📋 18. MÓDULO EIPD TEMPLATES
**Ruta:** `/eipd-templates`
**Archivo:** `EIPDTemplates.js`
**Tablas:** `sandbox_professional_templates`, `generated_documents`

```
DIAGRAMA FLUJO EIPD TEMPLATES:

📄 Gestionar plantillas → sandbox_professional_templates
        │
        ▼
📚 TIPOS PLANTILLAS:
    ├─ Por industria (healthcare, finance, tech, etc.)
    ├─ Por nivel riesgo (bajo, medio, alto, crítico)
    ├─ Por tipo dato (sensible, biométrico, menores)
    └─ Por región (Chile, internacional, específicos)

🔧 CREAR NUEVA PLANTILLA:
    │
    ├─ Seleccionar base → Plantilla existente o desde cero
    ├─ Configurar campos → Template_content JSON structure
    ├─ Definir industria → Industry_sector en metadata
    ├─ Establecer complejidad → Complexity_level
    └─ Aprobar template → Approval_date + approved_by

🔄 USAR PLANTILLA EN EIPD:
    │
    ├─ RAT alto riesgo detectado → Auto-seleccionar template matching
    │                             ├─ Por área_responsable → industry match
    │                             ├─ Por categorías_datos → data type match
    │                             └─ Por nivel_riesgo → complexity match
    │
    └─ Generar EIPD → INSERT generated_documents
                     ├─ document_data = template_content + RAT data
                     ├─ Auto-llenar campos desde mapeo_datos_rat
                     ├─ Crear actividad_dpo "Revisar EIPD generada"
                     └─ Usage_count++ en template
```

### 📊 19. MÓDULO IMMUTABLE AUDIT LOG
**Ruta:** `/audit-log`
**Archivo:** `ImmutableAuditLog.js`
**Tablas:** `audit_log`, `audit_logs`

```
DIAGRAMA FLUJO AUDIT LOG:

🔒 Cargar logs inmutables → SELECT * FROM audit_log + audit_logs
        │
        ▼
📊 FILTROS AUDITORIA:
    ├─ Por usuario → user_id, user_email
    ├─ Por tabla → table_name (mapeo_datos_rat, proveedores, etc.)
    ├─ Por acción → action (INSERT, UPDATE, DELETE)  
    ├─ Por fecha → created_at range
    ├─ Por tenant → tenant_id
    └─ Por éxito → success = true/false

🔍 DETALLE LOG ENTRY:
    ├─ old_values vs new_values → Mostrar diff
    ├─ IP address + user_agent → Contexto seguridad
    ├─ Session_id → Agrupar por sesión usuario
    └─ Operation_type → Clasificar tipo operación

🛡️ VERIFICACIÓN INTEGRIDAD:
    ├─ Hash validation → Verificar logs no modificados
    ├─ Sequence validation → Verificar continuidad temporal
    ├─ Cross-reference → Validar contra datos actuales
    └─ Anomaly detection → Patrones sospechosos

🚨 ALERTAS AUDITORIA:
    ├─ Modificaciones masivas → > 50 cambios en 1 hora
    ├─ Eliminaciones sospechosas → DELETEs fuera horario
    ├─ Accesos no autorizados → IPs no reconocidas
    └─ Fallos consecutivos → > 5 errores mismo usuario
```

### 📱 20. MÓDULO SISTEMA PRINCIPAL
**Ruta:** `/sistema-principal`
**Archivo:** `SistemaPrincipal.js`
**Dashboard general:** Punto entrada

```
DIAGRAMA FLUJO SISTEMA PRINCIPAL:

🏠 Landing page → Cargar métricas overview
        │
        ▼
📊 WIDGET RESUMEN:
    ├─ RATs en progreso ← mapeo_datos_rat WHERE estado != 'CERTIFICADO'
    ├─ Acciones requeridas ← COUNT(actividades_dpo WHERE prioridad = 'ALTA')
    ├─ Estado cumplimiento ← % general compliance
    └─ Próximas tareas ← actividades_dpo próximos 7 días

🎯 NAVEGACIÓN INTELIGENTE:
    ├─ "Continuar RAT" → Si hay BORRADOR: ir a /rat-edit/:id
    ├─ "Acción urgente" → Si hay CRÍTICO: ir a acción específica
    ├─ "Revisar pendiente" → Si hay DPO pendiente: ir a /dpo-approval-queue
    └─ "Nuevo RAT" → Ir a /rat-system

🔄 NOTIFICACIONES CONTEXTUALES:
    ├─ Bienvenida personalizada con datos real-time
    ├─ Alertas específicas por rol usuario
    ├─ Sugerencias IA basadas en patrón uso
    └─ Links directos a acciones recomendadas
```

## 🌊 DIAGRAMAS FLUJO CASCADA ENTRE MÓDULOS

### 🔄 EFECTO DOMINÓ: CREAR RAT ALTO RIESGO

```
👤 Usuario crea RAT → RATSystemProfessional
        │
        ▼
🛡️ IA Preventiva intercepta → Evalúa riesgo = ALTO
        │
        ▼
💾 INSERT mapeo_datos_rat → AUTO-EFECTOS INMEDIATOS:
    │
    ├─ 📊 DashboardDPO.ratsActivos++ 
    ├─ 📋 RATListPage.totalRATs++
    ├─ 📈 ComplianceMetrics.totalRATs++  
    ├─ 📊 AdminDashboard.ratsTotal++
    ├─ 📅 CalendarView: nueva fecha revision
    │
    ▼ (PORQUE ES ALTO RIESGO)
📄 AUTO-CREAR EIPD → INSERT generated_documents
    │
    ├─ 📊 DashboardDPO.eipdsPendientes++
    ├─ 📈 ComplianceMetrics.eipdsPendientes++
    ├─ 📋 EIPDCreator: nueva EIPD aparece en lista
    │
    ▼
📋 AUTO-CREAR TAREA DPO → INSERT actividades_dpo
    │
    ├─ 📊 DashboardDPO.tareasPendientes++
    ├─ 📋 DPOApprovalQueue: nueva tarea en cola
    ├─ 📅 CalendarView: fecha límite tarea
    │
    ▼
🔔 AUTO-NOTIFICAR → INSERT dpo_notifications
    │
    ├─ 📔 NotificationCenter: nueva notificación
    ├─ 📊 DashboardDPO: indicador notificaciones
    │
    ▼
📝 REGISTRO AUDITORIA → INSERT audit_log
    │
    ├─ 📋 ImmutableAuditLog: nueva entrada
    ├─ 📊 DiagnosticCenter: nueva transacción
    │
    ▼
🔄 SINCRONIZACIÓN → dataSync.js actualiza caché
    │
    └─ 📊 TODOS LOS DASHBOARDS: refrescan automáticamente
```

### 🔄 EFECTO DOMINÓ: DPO APRUEBA EIPD

```
👤 DPO aprueba EIPD → DPOApprovalQueue
        │
        ▼
💾 UPDATE generated_documents.status = 'APROBADA'
    │
    ├─ 📊 DashboardDPO.eipdsPendientes-- 
    ├─ 📈 ComplianceMetrics.eipdsPendientes--
    ├─ 📈 ComplianceMetrics.eipdAprobadas++
    │
    ▼
🔄 UPDATE RAT relacionado → mapeo_datos_rat.estado = 'LISTO_CERTIFICAR'
    │
    ├─ 📋 RATListPage: cambio estado visual
    ├─ 📅 CalendarView: nueva fecha certificación
    │
    ▼
📋 AUTO-CREAR TAREA CERTIFICACIÓN → INSERT actividades_dpo
    │
    ├─ 📊 DashboardDPO.tareasPendientes++ (nueva tarea)
    ├─ 📋 DPOApprovalQueue: tarea "Certificar RAT"
    │
    ▼
📊 RECALCULAR % CUMPLIMIENTO → ComplianceMetrics algorithm
    │
    ├─ 📈 ComplianceMetrics.compliance++
    ├─ 📊 DashboardDPO.cumplimiento++
    ├─ 📊 AdminDashboard.compliance++
    │
    ▼
🔔 NOTIFICAR STAKEHOLDERS → Multiple notifications:
    │
    ├─ Usuario creador RAT: "EIPD aprobada"
    ├─ Responsable proceso: "RAT listo certificar"  
    ├─ Admin tenant: "Progreso compliance"
    │
    ▼
📝 AUDIT COMPLETO → Multiple audit entries:
    │
    ├─ audit_log: "EIPD_APPROVED"
    ├─ audit_log: "RAT_STATUS_UPDATED"  
    ├─ audit_log: "TASK_CREATED"
    └─ audit_log: "COMPLIANCE_RECALCULATED"
```

### 🔄 EFECTO DOMINÓ: CREAR PROVEEDOR INTERNACIONAL

```
👤 Usuario crea proveedor → ProviderManager
        │
        ▼ 
🔍 IA Preventiva → ¿País internacional? SÍ → ¿País adequado?
        │
        ▼
💾 INSERT proveedores → AUTO-EFECTOS:
    │
    ├─ 📊 AdminDashboard.proveedoresTotal++
    ├─ 📈 ComplianceMetrics.proveedoresTotal++
    │
    ▼ (PORQUE ES INTERNACIONAL)
📄 AUTO-CREAR DPA → INSERT dpas (template)
    │
    ├─ 📊 ComplianceMetrics.dpasRequeridas++
    ├─ 📅 CalendarView: fecha límite firma DPA
    │
    ▼
📋 AUTO-CREAR EVALUACIÓN → INSERT evaluaciones_seguridad
    │
    ├─ 📋 Tarea: "Evaluar seguridad proveedor"
    ├─ 📅 CalendarView: fecha evaluación inicial
    │
    ▼
📋 AUTO-CREAR TAREA DPO → INSERT actividades_dpo
    │
    ├─ 📊 DashboardDPO.tareasPendientes++
    ├─ 📋 DPOApprovalQueue: "Aprobar proveedor internacional"
    │
    ▼
🔔 NOTIFICAR MÚLTIPLE → Stakeholders relevantes:
    │
    ├─ DPO: "Nuevo proveedor internacional requiere aprobación"
    ├─ Admin: "DPA requerida para proveedor X"
    ├─ Usuario: "Proveedor creado, pendiente aprobación"
    │
    ▼
⚠️ BLOQUEAR USO → Proveedor no disponible para RATs hasta aprobación
    │
    └─ 📊 TODOS LOS MÓDULOS: reflejan proveedor "PENDIENTE_APROBACIÓN"
```

## 🎯 MATRIZ COMPLETA EFECTOS RECÍPROCOS

| ACCIÓN INPUT | TABLA PRINCIPAL | EFECTOS CASCADA | MÓDULOS AFECTADOS |
|-------------|----------------|-----------------|-------------------|
| **Crear RAT** | mapeo_datos_rat | +1 todos contadores | DashboardDPO, RATList, ComplianceMetrics, AdminDashboard |
| **RAT alto riesgo** | mapeo_datos_rat | Auto-EIPD + Tarea DPO | EIPDCreator, DPOApprovalQueue, NotificationCenter |
| **Aprobar EIPD** | generated_documents | Estado RAT + % compliance | RATList, ComplianceMetrics, DashboardDPO |
| **Crear proveedor** | proveedores | +1 contadores + evaluación | ProviderManager, AdminDashboard, ComplianceMetrics |
| **Proveedor internacional** | proveedores | Auto-DPA + evaluación | ProviderManager, CalendarView, DPOApprovalQueue |
| **Asignar RAT-Proveedor** | rat_proveedores | Re-evaluar riesgo | RATEdit, ComplianceMetrics, ProviderManager |
| **Aprobar DPA** | dpas | Habilitar proveedor | ProviderManager, RATSystem, ComplianceMetrics |
| **Certificar RAT** | mapeo_datos_rat | +1 certificado TODOS | TodosLosDashboards, ComplianceMetrics |
| **Eliminar RAT** | mapeo_datos_rat | -1 TODOS + cleanup | TodosLosDashboards, cleanup cascada |
| **Crear tarea DPO** | actividades_dpo | +1 tareas pendientes | DashboardDPO, DPOApprovalQueue, CalendarView |
| **Completar tarea DPO** | actividades_dpo | -1 pendientes +% compliance | DashboardDPO, ComplianceMetrics |

## 🧠 LÓGICA IA PREVENTIVA POR MÓDULO

Cada módulo tiene interceptores específicos que validan ANTES de ejecutar:

### 🛡️ RAT System Professional
- ¿RAT duplicado por nombre + área?
- ¿Usuario tiene permisos crear RAT?
- ¿Tenant dentro límites cuota?
- ¿Datos mínimos obligatorios completos?
- ¿Base legal válida para finalidad?

### 🛡️ EIPD Creator  
- ¿RAT existe y es válido?
- ¿RAT realmente requiere EIPD?
- ¿Ya existe EIPD para este RAT?
- ¿Datos RAT suficientes para EIPD?

### 🛡️ Provider Manager
- ¿Proveedor duplicado por nombre?
- ¿País requiere consideraciones especiales?
- ¿Transferencia internacional permitida?
- ¿DPA template disponible para país?

### 🛡️ DPO Approval Queue
- ¿DPO tiene permisos aprobar este tipo?
- ¿Todos los prerequisitos cumplidos?
- ¿Aprobación no causará inconsistencias?
- ¿Documentos asociados completos?

---

**📋 RESULTADO: CADA INPUT tiene su diagrama específico, cada módulo conoce sus efectos en otros módulos, y la IA preventiva valida la integridad ANTES de cada acción.**

**🎯 El sistema es un ORGANISMO VIVO donde cada célula (módulo) se comunica instantáneamente con todas las demás, manteniendo la coherencia del ecosistema completo.**