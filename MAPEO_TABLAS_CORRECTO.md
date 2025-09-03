# 🔧 MAPEO TABLAS REAL vs CÓDIGO

## ❌ PROBLEMA IDENTIFICADO
El código busca tablas que NO EXISTEN en la BD real.

## 📋 CORRECCIONES NECESARIAS

### 1. **`generated_documents` → `actividades_dpo`**
```javascript
// ❌ ANTES (no existe)
.from('generated_documents')
.select('id, status, title')

// ✅ AHORA (existe en BD)
.from('actividades_dpo') 
.select('id, estado, tipo_actividad')  // 'estado' no 'status'
```

### 2. **`evaluaciones_impacto` → `actividades_dpo` (filtrado)**
```javascript
// ❌ ANTES (no existe)
.from('evaluaciones_impacto')
.select('id, status, titulo')
.eq('tipo', 'EIPD')

// ✅ AHORA (existe en BD)
.from('actividades_dpo')
.select('id, estado, descripcion')
.eq('tipo_actividad', 'EIPD')
```

### 3. **`mapeo_datos_rat` → Necesita crearse o usar `activities`**
```javascript
// ❌ ANTES (no existe)
.from('mapeo_datos_rat')

// ✅ OPCIÓN A: Crear tabla missing
CREATE TABLE mapeo_datos_rat (...)

// ✅ OPCIÓN B: Usar activities existente
.from('activities')
.eq('action', 'RAT_MAPPING')
```

## 🚨 COLUMNAS CRÍTICAS DIFERENTES

| Código Busca | BD Real Tiene | Tipo |
|-------------|---------------|------|
| `status` | `estado` | VARCHAR |
| `title` | `descripcion` | TEXT |  
| `document_type` | `tipo_actividad` | VARCHAR |
| `rat_id` | `rat_id` | ✅ Igual |
| `tenant_id` | `tenant_id` | ✅ Igual |

## 🔧 ACCIÓN INMEDIATA
Corregir **TODOS** los archivos para usar:
- `actividades_dpo` en lugar de `generated_documents`
- `estado` en lugar de `status`  
- `descripcion` en lugar de `title`
- `tipo_actividad` en lugar de `document_type`