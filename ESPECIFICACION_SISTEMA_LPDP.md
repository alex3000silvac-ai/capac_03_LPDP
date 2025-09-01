# 📋 ESPECIFICACIÓN TÉCNICA COMPLETA - SISTEMA LPDP LEY 21.719

## 🤖 INSTRUCCIONES PARA EL AGENTE IA
Este documento define TODOS los requisitos que el sistema debe cumplir según la Ley 21.719.
El Agente IA debe validar CADA campo y NUNCA bloquear el flujo del usuario.

## 🎯 CAMPOS OBLIGATORIOS RAT (Registro de Actividades de Tratamiento)

### **PASO 1: RESPONSABLE DEL TRATAMIENTO - Art. 3 f) y Art. 47 Ley 21.719**
- `responsable.razonSocial` - Razón social completa (OBLIGATORIO)
- `responsable.rut` - RUT formato XX.XXX.XXX-X (OBLIGATORIO)
- `responsable.direccion` - Dirección completa con comuna y región (OBLIGATORIO)
- `responsable.nombre` - Nombre completo del DPO - Art. 47 (OBLIGATORIO)
- `responsable.email` - Email del DPO (@empresa.cl) (OBLIGATORIO)
- `responsable.telefono` - Teléfono formato +56 9 XXXX XXXX (OBLIGATORIO)

### **PASO 2: CATEGORÍAS DE DATOS - Art. 2 f) y g) Ley 21.719**

#### **Datos de Identificación (Art. 2 f)**
- Nombre y apellidos
- RUT o Cédula de Identidad  
- Dirección domiciliaria
- Número telefónico
- Correo electrónico
- Firma manuscrita
- **Fotografía o imagen** → Requiere consentimiento expreso (Art. 4° y 5°)
- **Grabación audiovisual** → Requiere información previa (Art. 4° y 5°)
- **Grabación de voz**
- **Imagen de cámaras vigilancia** → Requiere señalización visible
- Huella dactilar
- **Geolocalización** → Trigger DPIA automático (Art. 19)
- Dirección IP
- Cookies identificadoras
- Número de cuenta bancaria
- Patente de vehículo

#### **Datos Sensibles (Art. 2 g) - PROTECCIÓN REFORZADA**
- Origen racial o étnico - Art. 2 g) i)
- Opiniones políticas - Art. 2 g) ii)
- Convicciones religiosas - Art. 2 g) iii)
- Afiliación sindical - Art. 2 g) iv)
- Vida sexual u orientación sexual - Art. 2 g) v)
- **Datos de salud** - Art. 2 g) vi) → Trigger EIPD automático
- **Datos biométricos únicos** - Art. 2 g) vii) → Trigger EIPD automático
- Antecedentes penales - Art. 2 g) viii)
- **Datos genéticos** - Art. 2 g) ix) → Trigger EIPD automático
- **Localización permanente** - Art. 2 g) x) → Trigger DPIA automático

#### **Datos Financieros y Comerciales**
- Ingresos económicos
- Historial crediticio
- Transacciones bancarias
- Hábitos de consumo
- **Scoring financiero** → Trigger PIA automático (Art. 20)

#### **Datos Laborales**
- Cargo o posición
- Sueldo o remuneración
- **Evaluaciones de desempeño** → Posible trigger PIA si es automatizado
- Historial laboral
- Referencias laborales

#### **Datos Académicos**
- Títulos profesionales
- Certificaciones
- Historial académico
- Capacitaciones

### **PASO 3: BASE LEGAL - Art. 9 y 13 Ley 21.719**
- **Consentimiento** - Art. 12 Ley 21.719
- **Ejecución de contrato** - Art. 13.1.b Ley 21.719
- **Obligación legal** - Art. 13.1.c Ley 21.719
- **Interés vital** - Art. 13.1.d Ley 21.719
- **Misión pública** - Art. 13.1.e Ley 21.719
- **Interés legítimo** - Art. 13.1.f Ley 21.719

### **PASO 4: FINALIDAD Y CONSERVACIÓN - Art. 11 Ley 21.719**
- `finalidad` - Descripción específica (20-500 caracteres)
- `plazoConservacion` - Período específico:
  - Durante relación contractual
  - 5 años (obligación tributaria)
  - 10 años (obligación laboral)
  - Indefinido con revisión periódica

### **PASO 5: TRANSFERENCIAS - Art. 27-29 Ley 21.719**
- Destinatarios internos (departamentos)
- Transferencias a terceros nacionales
- **Transferencias internacionales** → Requiere DPA (Data Processing Agreement)

### **PASO 6: MEDIDAS DE SEGURIDAD - Art. 14 Ley 21.719**
- **Técnicas**: Cifrado AES-256, Control acceso, Respaldos
- **Organizativas**: Políticas, Capacitación, Auditorías

---

## 🚨 TRIGGERS AUTOMÁTICOS - EL AGENTE IA DEBE DETECTAR Y ACTUAR

### **EIPD (Evaluación de Impacto) OBLIGATORIA** - Art. 19 Ley 21.719
**ACCIÓN IA**: Generar EIPD automáticamente, NO BLOQUEAR flujo
- ✅ Datos de salud detectados
- ✅ Datos biométricos únicos
- ✅ Datos genéticos
- ✅ Vigilancia sistemática (cámaras, tracking)
- ✅ Evaluación o puntuación de personas
- ✅ Tratamiento a gran escala datos sensibles
- ✅ Combinación de datasets múltiples
- ✅ Nuevas tecnologías con riesgo

### **DPIA (Evaluación Algoritmos) REQUERIDA** - Art. 20 Ley 21.719  
**ACCIÓN IA**: Generar DPIA automáticamente, asignar a DPO
- ✅ Decisiones automatizadas
- ✅ Algoritmos de scoring
- ✅ Inteligencia Artificial
- ✅ Machine Learning
- ✅ Perfilado automático
- ✅ Predicción de comportamiento
- ✅ Evaluación automática de personas

### **PIA (Evaluación General) NECESARIA** - Art. 21 Ley 21.719
**ACCIÓN IA**: Generar PIA, notificar equipo técnico
- ✅ Transferencias internacionales
- ✅ Cloud computing (AWS, Azure, Google Cloud)
- ✅ Big Data analytics
- ✅ IoT devices
- ✅ Blockchain
- ✅ Tecnologías emergentes

### **CONSULTA PREVIA AGENCIA** - Art. 22 Ley 21.719
**ACCIÓN IA**: Alertar inmediatamente a DPO y dirección
- 🔴 Alto riesgo residual sin mitigación
- 🔴 Países sin nivel adecuación protección
- 🔴 Tecnologías sin precedentes legales
- 🔴 Imposibilidad de cumplir medidas seguridad

---

## 🎛️ VALIDACIONES QUE EL AGENTE IA DEBE VERIFICAR

### **VALIDACIONES CRÍTICAS**
1. **NUNCA BLOQUEAR EL FLUJO RAT**
   - Si detecta EIPD requerida → Continuar y generar automáticamente
   - Si falta campo → Marcar error pero permitir navegación
   - Si hay datos sensibles → Alertar pero NO deshabilitar botones

2. **VALIDACIONES DE CAMPOS**
   ```javascript
   // El Agente IA debe verificar estas validaciones
   responsable.razonSocial: minLength(3) // Art. 3 f)
   responsable.rut: validateRUT() // Formato chileno
   responsable.email: validateEmail() // Art. 47
   responsable.telefono: match(/^\+56 9 \d{4} \d{4}$/)
   categorias.identificacion: minItems(1) // Art. 2 f)
   baseLegal: required() // Art. 9 y 13
   finalidad: minLength(20), maxLength(500) // Art. 11
   plazoConservacion: required() // Art. 11
   ```

3. **VALIDACIONES ESPECIALES POR TIPO DE DATO**
   - **Fotografías/Imágenes**: Verificar consentimiento expreso
   - **Grabaciones**: Verificar información previa a titulares
   - **Geolocalización**: Activar DPIA automática
   - **Biométricos**: Activar protección reforzada
   - **Scoring**: Activar PIA automática

4. **PERSISTENCIA OBLIGATORIA**
   - TODO a Supabase
   - NUNCA usar localStorage
   - Validar que cada operación se guarde correctamente

---

## 🔄 FLUJO OPERATIVO DEL AGENTE IA

### **CICLO DE SUPERVISIÓN (Cada 60 segundos)**

#### **1. ESCANEO**
- Leer esta especificación .md
- Escanear todos los formularios HTML activos
- Verificar estado actual del RAT en creación
- Detectar qué paso está el usuario (1-6)

#### **2. DETECCIÓN**
- ✅ Campos obligatorios presentes
- ✅ Validaciones correctas por artículo
- ✅ Triggers EIPD/DPIA/PIA detectados
- ⚠️ Elementos bloqueantes (botones deshabilitados)
- ⚠️ Datos sin argumentos legales
- 🔴 Uso de localStorage detectado

#### **3. CORRECCIÓN AUTOMÁTICA**
- **Prioridad 1**: Desbloquear botones si están mal deshabilitados
- **Prioridad 2**: Agregar campos HTML faltantes
- **Prioridad 3**: Insertar validaciones JavaScript
- **Prioridad 4**: Agregar argumentos legales por artículo
- **Prioridad 5**: Generar documentos (EIPD/DPIA/PIA)
- **Prioridad 6**: Migrar localStorage a Supabase

#### **4. NOTIFICACIÓN**
- Si detecta datos sensibles → Notificar DPO con plazo 30 días
- Si detecta algoritmos → Notificar equipo técnico
- Si detecta alto riesgo → Notificar dirección
- Si score < 85% → Log para supervisión

#### **5. REPORTE**
```javascript
{
  timestamp: ISO8601,
  compliance_score: 85-100,
  issues_detected: [],
  corrections_applied: [],
  documents_generated: [],
  dpo_notified: boolean,
  rat_can_continue: true // SIEMPRE true
}
```

---

## 🤖 REGLAS DE OPERACIÓN DEL AGENTE IA

### **MANDAMIENTOS DEL AGENTE**

1. **NUNCA BLOQUEARÁS EL FLUJO RAT**
   - Usuario siempre puede continuar
   - Botones siempre habilitados
   - Navegación nunca impedida

2. **SIEMPRE PERSISTIRÁS EN SUPABASE**
   - Cero localStorage
   - Todo a base de datos
   - Validar cada escritura

3. **GENERARÁS DOCUMENTOS AUTOMÁTICAMENTE**
   - EIPD cuando detectes datos sensibles
   - DPIA cuando detectes algoritmos
   - PIA cuando detectes nuevas tecnologías

4. **INCLUIRÁS ARTÍCULO LEGAL EN TODO**
   - Cada campo con su artículo
   - Cada validación con fundamento
   - Cada alerta con base legal

5. **SUPERVISARÁS 24/7 SIN DESCANSO**
   - Validación cada 60 segundos
   - Corrección inmediata
   - Notificación instantánea

### **CÓDIGO DE CONDUCTA IA**

```javascript
// CONFIGURACIÓN MAESTRO DEL AGENTE
const AGENT_RULES = {
  // Regla #1: NUNCA bloquear
  block_user_flow: false,
  disable_buttons_on_error: false,
  prevent_navigation: false,
  
  // Regla #2: SIEMPRE persistir
  use_localstorage: false,
  use_supabase: true,
  validate_persistence: true,
  
  // Regla #3: AUTO generar documentos
  auto_generate_eipd: true,
  auto_generate_dpia: true,
  auto_generate_pia: true,
  
  // Regla #4: Compliance total
  require_legal_article: true,
  validate_against_law_21719: true,
  minimum_compliance_score: 85,
  
  // Regla #5: Supervisión continua
  validation_interval_ms: 60000,
  auto_correction_enabled: true,
  dpo_notification_enabled: true
};
```

### **PRIORIDADES DE ACCIÓN**

1. **CRÍTICO** (Acción inmediata)
   - Botón bloqueado incorrectamente
   - localStorage detectado
   - Flujo RAT interrumpido

2. **ALTO** (En 5 segundos)
   - Datos sensibles sin EIPD
   - Algoritmos sin DPIA
   - Campos sin validación

3. **MEDIO** (En 30 segundos)
   - Argumentos legales faltantes
   - Documentación incompleta
   - Score bajo de compliance

4. **BAJO** (En próxima validación)
   - Optimizaciones UX
   - Mensajes de ayuda
   - Logs de auditoría