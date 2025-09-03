# 🚨 DIAGNÓSTICO COMPLETO TABLAS FALTANTES

## 📊 TABLAS QUE EXISTEN EN BD vs CÓDIGO

### ✅ TABLAS QUE SÍ EXISTEN
| Tabla BD | Tiene rat_id | Tiene tenant_id | Tipo tenant_id |
|----------|--------------|----------------|----------------|
| `actividades_dpo` | ✅ INTEGER | ✅ VARCHAR | VARCHAR |
| `activities` | ❌ | ✅ UUID | UUID |
| `active_agents` | ❌ | ❌ | - |
| `arcopol` | ❌ | ✅ UUID | UUID |
| `audit_log` | ❌ | ❌ | - |

### ❌ TABLAS QUE NO EXISTEN (código las busca)
| Tabla Código Busca | Archivos que la Usan | Prioridad |
|-------------------|---------------------|-----------|
| `mapeo_datos_rat` | 16 archivos | 🔴 CRÍTICA |
| `organizaciones` | 8 archivos | 🔴 CRÍTICA |
| `usuarios` | 5 archivos | 🟡 ALTA |
| `inventario_rats` | 4 archivos | 🟡 ALTA |
| `proveedores` | 3 archivos | 🟠 MEDIA |
| `documentos_dpa` | 2 archivos | 🟠 MEDIA |
| `system_alerts` | 2 archivos | 🟠 MEDIA |
| `evaluaciones_impacto` | 3 archivos | 🟠 MEDIA |
| `dpo_notifications` | 2 archivos | 🟢 BAJA |
| `rat_audit_trail` | 1 archivo | 🟢 BAJA |

## 🔍 PROBLEMAS DETECTADOS

### 1. **INCONSISTENCIA TIPOS `tenant_id`**
- `activities.tenant_id` = UUID
- `actividades_dpo.tenant_id` = VARCHAR
- `arcopol.tenant_id` = UUID
- **CÓDIGO ASUME**: VARCHAR siempre

### 2. **TABLA PRINCIPAL FALTA**
`mapeo_datos_rat` NO EXISTE pero es usada por:
- RATService.js (guardado RATs)
- CategoryAnalysisEngine.js (análisis)
- AdminDashboard.js (métricas)
- RATEditPage.js (edición)
- + 12 archivos más

### 3. **COLUMNAS CRÍTICAS**
| Código Busca | BD Real Tiene | Estado |
|-------------|---------------|---------|
| `status` | `estado` | ⚠️ Mixto |
| `title` | `descripcion` | ❌ Diferente |
| `rat_id` | `rat_id` (solo en actividades_dpo) | ⚠️ Parcial |

## 🎯 MAPEO TABLAS EXISTENTES

### **Para RATs principales:**
❌ `mapeo_datos_rat` → **DEBE CREARSE** (tabla crítica principal)

### **Para documentos/EIPDs:**
✅ `generated_documents` → `actividades_dpo` 
- `document_type` → `tipo_actividad`
- `status` → `estado` 
- `title` → `descripcion`

### **Para métricas:**
❌ `organizaciones` → **DEBE CREARSE**
❌ `usuarios` → **DEBE CREARSE**

### **Para inventario:**
❌ `inventario_rats` → **DEBE CREARSE**

## 🚨 PLAN DE ACCIÓN URGENTE

### **OPCIÓN 1: CREAR TABLAS FALTANTES (RECOMENDADO)**
```sql
-- Ejecutar script que cree TODAS las tablas faltantes
-- Mantiene la lógica de negocio intacta
```

### **OPCIÓN 2: ADAPTAR TODO EL CÓDIGO**
```javascript
// Cambiar 16 archivos para usar tablas existentes
// Alto riesgo de romper lógica de negocio
```

## 📋 SCRIPT NECESARIO

### **TABLAS CRÍTICAS A CREAR:**
1. `mapeo_datos_rat` - **URGENTE** (tabla principal RATs)
2. `organizaciones` - **URGENTE** (datos empresa)
3. `usuarios` - **URGENTE** (gestión usuarios)
4. `inventario_rats` - Alta (inventario)
5. `proveedores` - Media (DPAs)
6. `documentos_dpa` - Media (contratos)
7. `system_alerts` - Media (alertas)

### **UNIFICACIÓN `tenant_id`:**
- Decidir: ¿UUID o VARCHAR?
- Aplicar consistentemente en todas las tablas
- Actualizar código según decisión

## 🔧 CORRECCIÓN INMEDIATA

**El error `column "rat_id" does not exist` viene porque:**
1. Código busca `rat_id` en tabla que NO EXISTE (`mapeo_datos_rat`)
2. O busca `rat_id` en tabla que no la tiene (`activities`)

**SOLUCIÓN:**
1. Crear tabla `mapeo_datos_rat` CON `rat_id`
2. O mapear `rat_id` a `id` en tablas existentes donde tenga sentido