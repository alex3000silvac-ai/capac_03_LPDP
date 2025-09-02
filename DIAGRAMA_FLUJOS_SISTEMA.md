# 🔄 DIAGRAMA DE FLUJOS SISTEMA LPDP

## 📋 FLUJO 1: CREACIÓN RAT COMPLETA

```
┌─────────────────┐
│ INICIO CREAR RAT│
└─────────┬───────┘
          │
          ▼
┌─────────────────┐     NO     ┌──────────────────┐
│ ¿Datos empresa  │ ────────── │ Cargar datos     │
│ ya ingresados?  │            │ permanentes      │
└─────────┬───────┘            │ (último RAT)     │
          │ SÍ                 └─────────┬────────┘
          ▼                              │
┌─────────────────┐◄───────────────────────┘
│ PASO 1/6:       │
│ Responsable     │ ✅ DATOS PERMANENTES PRESERVADOS
│ - Empresa       │ ✅ NO VOLVER A PEDIR
│ - DPO           │ ✅ Auto-completado último RAT
│ - Representante │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ PASO 2/6:       │
│ Finalidades     │ 🆕 NUEVA ACTIVIDAD
│ - Descripción   │ 🆕 NUEVA finalidad  
│ - Base legal    │ 🆕 NUEVO argumento jurídico
│ - Argumento     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ PASO 3/6:       │
│ Categorías      │ 🆕 NUEVAS categorías datos
│ - Datos perso.  │ 🆕 NUEVOS tipos
│ - Datos sensib. │ 🆕 NUEVA selección
│ - Titulares     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ PASO 4/6:       │
│ Conservación    │ 🆕 NUEVO período
│ - Período       │ 🆕 NUEVO criterio
│ - Criterio      │ 🆕 NUEVA justificación
│ - Justificación │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ PASO 5/6:       │
│ Transferencias  │ 🆕 NUEVAS transferencias
│ - Internaciona. │ 🆕 NUEVOS países
│ - Países        │ 🆕 NUEVAS garantías
│ - Garantías     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ PASO 6/6:       │
│ Medidas Segur.  │ 🆕 NUEVAS medidas técnicas
│ - Técnicas      │ 🆕 NUEVAS medidas organiz.
│ - Organizativas │ 🆕 NUEVA descripción
│ - Descripción   │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ GUARDAR RAT     │
│ ↓               │
│ Mapeo_datos_rat │ ✅ PERSISTENCIA SUPABASE
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ GENERAR EIPD    │ ✅ AUTOMÁTICO AL CREAR RAT
│ AUTOMÁTICA      │ ✅ NO al aprobar DPO
│ (si requiere)   │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ ASIGNAR TAREA   │ ✅ DPO recibe notificación
│ DPO             │ ✅ Cola aprobación automática
│ (automática)    │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ FIN - RAT       │ ✅ RAT creado con ID único
│ CREADO          │ ✅ Visible en lista RATs
└─────────────────┘
```

## 📝 FLUJO 2: EDICIÓN RAT EXISTENTE

```
┌─────────────────┐
│ ABRIR EDICIÓN   │
│ RAT (ID: XXX)   │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ CARGAR RAT      │ ✅ Mostrar ID en título
│ POR ID          │ ✅ Panel información visible
│                 │ ✅ Estado: EN EDICIÓN
└─────────┬───────┘
          │
          ▼
┌─────────────────┐     ┌──────────────────┐
│ MODO EDICIÓN    │ ◄── │ Botón            │
│ Stepper 6 pasos │     │ "Ver Completo"   │ ✅ AGREGADO
│ ← Anterior      │     └──────────────────┘
│ Siguiente →     │ ✅ NAVEGACIÓN AGREGADA
│ Progreso: X/6   │ ✅ INDICADOR PROGRESO
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ GUARDAR CAMBIOS │ ✅ Actualización BD
│ ↓               │ ✅ Timestamp updated
│ Update RAT      │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ VOLVER A LISTA  │ ✅ Navegación correcta
│ RATs            │ ✅ Estado actualizado
└─────────────────┘
```

## 🎨 FLUJO 3: VALIDACIÓN PALETA COLORES

```
┌─────────────────┐
│ COMPONENTE UI   │
│ Se renderiza    │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐     NO     ┌──────────────────┐
│ ¿bgcolor claro  │ ────────── │ Renderizar       │
│ + texto claro?  │            │ normalmente      │
└─────────┬───────┘            └──────────────────┘
          │ SÍ
          ▼
┌─────────────────┐
│ ❌ IA DETECTA:  │ 🛡️ PREVENCIÓN AUTOMÁTICA
│ Combinación     │ 🛡️ Regla activa
│ ilegible        │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 🔧 AUTO-FIX:    │ 
│ bgcolor:"#1e293b"│ ✅ Fondo oscuro
│ color:"#f1f5f9"  │ ✅ Texto claro
│ secondary:"#94a3"│ ✅ Secondary legible
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ ✅ UI LEGIBLE   │ ✅ Contraste adecuado
│ Tema consistente│ ✅ Paleta respetada
└─────────────────┘
```

## 🗂️ FLUJO 4: PERSISTENCIA DATOS

```
┌─────────────────┐
│ OPERACIÓN BD    │
│ (create/update) │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐     NO     ┌──────────────────┐
│ ¿Tabla existe?  │ ────────── │ ❌ ERROR:        │
│ mapeo_datos_rat │            │ Tabla no existe  │
└─────────┬───────┘            └──────────────────┘
          │ SÍ
          ▼
┌─────────────────┐     NO     ┌──────────────────┐
│ ¿RLS activo?    │ ────────── │ ❌ ERROR:        │
│ Seguridad OK    │            │ Sin permisos     │
└─────────┬───────┘            └──────────────────┘
          │ SÍ
          ▼
┌─────────────────┐
│ VALIDAR DATOS   │ ✅ 8 campos Art.12
│ Art.12 Ley      │ ✅ Estructura válida
│ 21.719          │ ✅ Tipos correctos
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ EJECUTAR        │ ✅ INSERT/UPDATE exitoso
│ OPERACIÓN       │ ✅ ID generado/preservado
│ SUPABASE        │ ✅ Timestamp actualizado
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ VALIDAR RESULT  │ ✅ Dato persiste en BD
│ IA verifica     │ ✅ Consulta posterior OK
│ persistencia    │ ✅ Integridad mantenida
└─────────────────┘
```

## 🔄 FLUJO 5: WORKFLOW DPO

```
┌─────────────────┐
│ RAT GUARDADO    │
│ ID: XXX         │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐     NO     ┌──────────────────┐
│ ¿Requiere EIPD? │ ────────── │ Notificar DPO    │
│ Riesgo > medio  │            │ RAT listo        │
└─────────┬───────┘            └──────────────────┘
          │ SÍ
          ▼
┌─────────────────┐
│ GENERAR EIPD    │ ✅ AUTOMÁTICO
│ AUTOMÁTICA      │ ✅ Plantilla adecuada
│ Timing: CREAR   │ ✅ NOT en aprobación DPO
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ CREAR TAREA DPO │ ✅ Auto-asignación
│ Tabla:          │ ✅ Prioridad: alta/media/baja
│ actividades_dpo │ ✅ Estado: pendiente
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ DPO RECIBE      │ ✅ Cola aprobación
│ NOTIFICACIÓN    │ ✅ Email automático
│                 │ ✅ Dashboard actualizado
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ DPO REVISA      │ ⚙️ Proceso manual DPO
│ Y APRUEBA       │ ⚙️ Comentarios/cambios
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ RAT APROBADO    │ ✅ Estado: APROBADO
│ Sistema listo   │ ✅ Compliance OK
└─────────────────┘
```

## 🔍 FLUJO 6: VALIDACIÓN IA INTELIGENTE

```
┌─────────────────┐
│ ACCIÓN USUARIO  │
│ (cualquier)     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ IA INTERCEPTA   │ 🤖 Monitoreo 30seg
│ validateBefore  │ 🤖 Reglas prevención
│ Action()        │ 🤖 Patrones aprendidos
└─────────┬───────┘
          │
          ▼
┌─────────────────┐     SÍ     ┌──────────────────┐
│ ¿Detecta error  │ ────────── │ 🚫 BLOQUEAR      │
│ potencial?      │            │ Mostrar razón    │
└─────────┬───────┘            │ Sugerir solución │
          │ NO                 └──────────────────┘
          ▼
┌─────────────────┐
│ ✅ PERMITIR     │ ✅ Acción ejecutada
│ ACCIÓN          │ ✅ Validación post-acción
│                 │ ✅ Log resultado
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ APRENDER        │ 🧠 Guardar patrón
│ Resultado →     │ 🧠 Ajustar confianza
│ Patrones IA     │ 🧠 Mejorar prevención
└─────────────────┘
```

## 🏗️ FLUJO 7: DATOS PERMANENTES vs ACTIVIDAD

```
DATOS PERMANENTES (NO CAMBIAR):
┌─────────────────┐
│ 🏢 EMPRESA      │ ← Preservar siempre
│ - Razón social  │ ← NO volver a pedir
│ - RUT           │ ← Auto-completar
│ - Dirección     │ ← Desde último RAT
│ - Teléfono      │
└─────────────────┘
          │
┌─────────────────┐
│ 👤 DPO          │ ← Preservar siempre  
│ - Nombre        │ ← NO volver a pedir
│ - Email         │ ← Auto-completar
│ - Teléfono      │ ← Desde último RAT
└─────────────────┘

DATOS ACTIVIDAD (SIEMPRE NUEVOS):
┌─────────────────┐
│ 📋 ACTIVIDAD    │ ← Siempre en blanco
│ - Nombre        │ ← NUEVA actividad
│ - Finalidad     │ ← NUEVA finalidad
│ - Base legal    │ ← NUEVA selección
└─────────────────┘
          │
┌─────────────────┐
│ 📊 CATEGORÍAS   │ ← Siempre en blanco
│ - Tipos datos   │ ← NUEVA selección
│ - Datos sensib. │ ← NUEVA evaluación
│ - Titulares     │ ← NUEVOS titulares
└─────────────────┘
```

## ⚠️ FLUJO 8: IDENTIFICACIÓN PROBLEMAS

```
PROBLEMA DETECTADO:
┌─────────────────┐
│ Usuario reporta │
│ "datos permanen │
│ te se vuelven   │
│ a pedir"        │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 🔍 IA ANALIZA:  │
│ cargarDatos     │ ← Función problemática
│ Comunes()       │ ← useEffect se ejecuta
│                 │ ← Sin validación previa
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ ✅ SOLUCIÓN:    │
│ Agregar check   │ ← if (datosYaIngresados)
│ datosYaIngresd  │ ← return; // NO CARGAR
│                 │ ← Prevenir sobrescritura
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 🧠 IA APRENDE:  │ ✅ Patrón guardado
│ Nuevo patrón    │ ✅ Regla prevención
│ "DATA_OVERRIDE" │ ✅ Confianza: 1.0
└─────────────────┘
```

## 📊 FLUJO 9: VALIDACIÓN PERSISTENCIA

```
┌─────────────────┐
│ ANTES OPERACIÓN │
│ Validar tabla   │ ← validateTableExists()
│ mapeo_datos_rat │ ← Error 42P01 prevention
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ DURANTE OPER.   │ ← INSERT/UPDATE data
│ Ejecutar query  │ ← RLS verificado
│ + Log operación │ ← Audit trail
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ DESPUÉS OPER.   │ ← SELECT para verificar
│ Validar result  │ ← Dato existe en BD
│ + IA confirma   │ ← Integridad OK
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ ✅ PERSISTENCIA │ ✅ Datos confirmados
│ CONFIRMADA      │ ✅ IA valida éxito
│                 │ ✅ Usuario informado
└─────────────────┘
```

## 🎯 PUNTOS CRÍTICOS IDENTIFICADOS:

### ❌ PROBLEMA 1: Datos permanentes se vuelven a pedir
**Causa:** `cargarDatosComunes()` se ejecuta sin validar datos existentes  
**Solución:** ✅ Agregado check `datosYaIngresados` antes de cargar  
**IA Regla:** `PRESERVE_USER_INPUT_DATA`

### ❌ PROBLEMA 2: EIPD timing incorrecto
**Causa:** EIPD se generaba en aprobación DPO, no en creación RAT  
**Solución:** ✅ `timing: 'RAT_CREATION_TIME'` configurado  
**IA Regla:** `EIPD_GENERATE_ON_RAT_CREATE`

### ❌ PROBLEMA 3: UI ilegible paleta colores
**Causa:** `bgcolor: '#f8fafc'` + `color: 'text.secondary'` = blanco+blanco  
**Solución:** ✅ `bgcolor: '#1e293b'` + `color: '#f1f5f9'`  
**IA Regla:** `NEVER_WHITE_BACKGROUND_WHITE_TEXT`

### ❌ PROBLEMA 4: Falta navegación formularios
**Causa:** Stepper sin botones Anterior/Siguiente  
**Solución:** ✅ Botones + indicador progreso agregados  
**IA Regla:** `REQUIRE_NAVIGATION_BUTTONS_IN_FORMS`

---

**Estado IA:** 🤖 **INTELIGENCIA MEJORADA ACTIVA**  
**Reglas prevención:** 8 activas  
**Patrones aprendizaje:** 12 registrados  
**Auto-fix:** ✅ Habilitado  
**Monitoreo:** ⏱️ Cada 30 segundos