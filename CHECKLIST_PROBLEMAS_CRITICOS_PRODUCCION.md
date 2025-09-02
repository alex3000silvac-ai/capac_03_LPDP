# 🚨 CHECKLIST PROBLEMAS CRÍTICOS PRODUCCIÓN - NO SUBIR HASTA RESOLVER

**Fecha:** 2025-09-02  
**Estado:** 🔴 CRÍTICO - NO DEPLOYAR  
**URLs Afectadas:** https://scldp-frontend.onrender.com

---

## ❌ PROBLEMA 1: ERROR getCurrentTenantId not a function

| Campo | Detalle |
|-------|---------|
| **URLs afectadas** | `/notifications`, `/compliance-metrics`, `/dpo-approval` |
| **Error** | `TypeError: Kn.getCurrentTenantId is not a function` |
| **Causa** | Función no exportada correctamente en ratService |
| **Archivos afectados** | 9+ archivos usando `ratService.getCurrentTenantId()` |
| **Prioridad** | 🔴 CRÍTICA |
| **Estado** | ❌ Pendiente |

**Archivos que requieren corrección:**
- [ ] `/components/ComplianceMetrics.js` - Error línea 71
- [ ] `/components/CalendarView.js` 
- [ ] `/components/ImmutableAuditLog.js`
- [ ] `/components/EIPDTemplates.js` (2 ocurrencias)
- [ ] `/components/NotificationCenter.js` - Error línea 154
- [ ] `/pages/DPOApprovalQueue.js`
- [ ] `/pages/EIPDCreator.js`
- [ ] `/pages/ProviderManager.js`
- [ ] `/pages/RATListPage.js`

**Solución requerida:**
```javascript
// AGREGAR import:
import { useTenant } from '../contexts/TenantContext';

// AGREGAR hook:
const { currentTenant } = useTenant();

// REEMPLAZAR:
const tenantId = await ratService.getCurrentTenantId(); // ❌ ERROR
const tenantId = currentTenant?.id; // ✅ CORRECTO
```

---

## ❌ PROBLEMA 2: DATOS ESTÁTICOS HARDCODEADOS

| Campo | Detalle |
|-------|---------|
| **URLs afectadas** | `/dpo-approval`, `/admin-dashboard`, `/dashboard-dpo`, `/rat-list` |
| **Error** | Datos estáticos no vienen de Supabase |
| **Causa** | Arrays hardcodeados en lugar de consultas BD |
| **Prioridad** | 🔴 CRÍTICA |
| **Estado** | ❌ Pendiente |

**Módulos con datos estáticos a eliminar:**
- [ ] **DPOApprovalQueue.js** - Cola aprobación con datos fake
- [ ] **AdminDashboard.js** - Dashboard con métricas fake
- [ ] **ComplianceMetrics.js** - Métricas con datos fake
- [ ] **RATListPage.js** - Lista RATs con datos fake

**ORDEN GENERAL:** ELIMINAR TODO DATO ESTÁTICO - SOLO ORIGEN SUPABASE

---

## ❌ PROBLEMA 3: ERRORES GLOSARIO CATEGORÍAS

| Campo | Detalle |
|-------|---------|
| **URL afectada** | `/glosario` |
| **Error** | `Categoría inválida o faltante para término` |
| **Cantidad errores** | 12+ términos con categorías erróneas |
| **Prioridad** | 🟡 MEDIA |
| **Estado** | ❌ Pendiente |

**Términos con categorías incorrectas:**
- [ ] `titular_datos` → Categoría: `sujetos` (no existe)
- [ ] `transferencia_internacional` → Categoría: `compliance` 
- [ ] `interes_legitimo` → Categoría: `conceptos`
- [ ] `delegado_proteccion_datos` → Categoría: `compliance`
- [ ] `modelo_prevencion_infracciones` → Categoría: `compliance`
- [ ] `infraccion_leve` → Categoría: `sanciones`
- [ ] `infraccion_grave` → Categoría: `sanciones`
- [ ] `infraccion_gravisima` → Categoría: `sanciones`
- [ ] `registro_nacional_cumplimiento` → Categoría: `sanciones`
- [ ] `fuentes_accesibles_publico` → Categoría: `conceptos`
- [ ] `datos_anonimizados` → Categoría: `conceptos`
- [ ] `vigencia_ley` → Categoría: `legal`
- [ ] `clausulas_contractuales_tipo` → Categoría: `compliance`
- [ ] `decision_adecuacion` → Categoría: `compliance`

---

## ❌ PROBLEMA 4: FORMATO EDICIÓN RAT INCONSISTENTE

| Campo | Detalle |
|-------|---------|
| **Descripción** | Formato edición diferente al formato creación |
| **Requisito** | Mismo formato crear/editar/borrar |
| **Prioridad** | 🟡 MEDIA |
| **Estado** | ❌ Pendiente |

---

## ❌ PROBLEMA 5: FLUJOS CAMBIO ESTADO RAT FALTANTES

| Campo | Detalle |
|-------|---------|
| **Descripción** | No está claro cuándo/cómo RATs cambian de estado |
| **Estados RAT** | BORRADOR → EN_REVISION → APROBADO → ACTIVO |
| **Flujo faltante** | Transiciones de estado no documentadas/implementadas |
| **Prioridad** | 🟡 MEDIA |
| **Estado** | ❌ Pendiente |

---

## ❌ PROBLEMA 6: BASE DATOS NO VACÍA PARA PRUEBAS

| Campo | Detalle |
|-------|---------|
| **Descripción** | BD tiene datos fake que interfieren con pruebas |
| **Requisito** | BD completamente vacía para testing |
| **Afecta** | Todas las pruebas de funcionalidad |
| **Prioridad** | 🟡 MEDIA |
| **Estado** | ❌ Pendiente |

---

## ❌ PROBLEMA 7: IA NO DETECTA DATOS ESTÁTICOS

| Campo | Detalle |
|-------|---------|
| **Descripción** | IA debería detectar/prevenir datos hardcodeados |
| **Requisito** | IA scan código y detectar arrays estáticos |
| **Mejora IA** | Agregar regla `DETECT_STATIC_DATA_ARRAYS` |
| **Prioridad** | 🔴 ALTA |
| **Estado** | ❌ Pendiente |

---

## ❌ PROBLEMA 8: TABLAS SUPABASE FALTANTES

| Campo | Detalle |
|-------|---------|
| **Tabla faltante** | `error_logs` - 404 Not Found |
| **Error BD** | `ia_agent_reports` - 409 Conflict |
| **Afecta** | Reportes IA y logging errores |
| **Prioridad** | 🟡 MEDIA |
| **Estado** | ❌ Pendiente |

---

## 🎯 PLAN DE CORRECCIÓN URGENTE

### FASE 1: ERRORES CRÍTICOS (BLOQUEAN SISTEMA) 🔴
1. [ ] **Corregir getCurrentTenantId** en 9 archivos 
2. [ ] **Eliminar datos estáticos** DPOApprovalQueue
3. [ ] **Eliminar datos estáticos** AdminDashboard  
4. [ ] **Eliminar datos estáticos** ComplianceMetrics
5. [ ] **Eliminar datos estáticos** RATListPage

### FASE 2: ERRORES MEDIOS (FUNCIONALIDAD) 🟡
6. [ ] **Corregir categorías** Glosario (14 términos)
7. [ ] **Documentar flujos** cambio estado RAT
8. [ ] **Vaciar BD** para pruebas limpias
9. [ ] **Crear tablas faltantes** error_logs, ia_agent_reports

### FASE 3: MEJORAS IA (PREVENCIÓN) 🔵
10. [ ] **Mejorar IA** detectar datos estáticos
11. [ ] **Agregar reglas** prevención hardcoding
12. [ ] **Validación empírica** post-corrección

---

## ⚠️ RESTRICCIÓN DEPLOYMENT

**🚫 NO SUBIR A RENDER HASTA:**
- ✅ FASE 1 completada (errores críticos)
- ✅ Tests básicos funcionando
- ✅ BD consultable sin errores 404/409

**✅ AUTORIZADO SUBIR CUANDO:**
- 0 errores getCurrentTenantId
- 0 datos estáticos hardcodeados  
- Consultas Supabase 100% operativas

---

**Responsable:** Claude AI Assistant  
**Fecha límite:** 2025-09-02 - URGENTE  
**Estado checklist:** 0/12 completado (0%)  
**Bloqueo deploy:** 🔴 ACTIVO