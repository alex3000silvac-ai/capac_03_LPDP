# 📚 MANUAL COMPLETO DEL CURSO
# MÓDULO DE INVENTARIO Y MAPEO DE DATOS
## Sistema de Capacitación Ley 21.719 - Capítulo 3

---

## 🎯 OBJETIVO FUNDAMENTAL

Este módulo NO es teórico. Es un sistema de **CAPTURA REAL** de datos mientras aprendes. Al finalizar, tendrás:

1. **Tu Registro de Actividades de Tratamiento (RAT)** inicial documentado
2. **Plantillas personalizadas** para completar el inventario
3. **Flujos de datos mapeados** de tu organización
4. **Políticas de retención** definidas
5. **Conexión clara** con los otros módulos del sistema

---

## 📋 ESTRUCTURA DEL CURSO POR TIPO DE CAPTURA

### 🔷 CAPÍTULO 1: CAPTURA DE ACTIVIDADES DE TRATAMIENTO
**Objetivo**: Identificar y documentar TODAS las actividades donde se usan datos personales

#### Lección 1.1: Metodología de Descubrimiento
**NO preguntes**: "¿Qué bases de datos tienen?"
**SÍ pregunta**: "¿Qué HACEN con información de personas?"

**Ejercicio Práctico 1 - Identificación Inicial**:
```
FORMULARIO DE CAPTURA:
1. Área/Departamento: [Dropdown con todas las áreas]
2. Lista 5 actividades principales de tu área:
   □ Actividad 1: ________________
   □ Actividad 2: ________________
   □ Actividad 3: ________________
   □ Actividad 4: ________________
   □ Actividad 5: ________________

3. Para cada actividad, marca si usa información de personas:
   Actividad 1: [ ] Sí [ ] No [ ] No estoy seguro
   Actividad 2: [ ] Sí [ ] No [ ] No estoy seguro
   ...

RESULTADO: Lista inicial de actividades a documentar
```

#### Lección 1.2: Documentación Completa de Actividades

**CASO PRÁCTICO - Proceso de Reclutamiento RRHH**:

```
FORMULARIO RAT - ACTIVIDAD: RECLUTAMIENTO Y SELECCIÓN

1. IDENTIFICACIÓN
   - Código: RRHH-001
   - Nombre: Proceso de Reclutamiento y Selección de Personal
   - Responsable: [Campo autocompletado con jefes de área]
   - Fecha documentación: [Automático]

2. FINALIDAD (¿Para qué?)
   □ Evaluar idoneidad de candidatos
   □ Verificar antecedentes laborales
   □ Contactar para futuras oportunidades
   □ Cumplir normativa laboral
   □ Otra: _______________

3. BASE DE LICITUD (Fundamento legal)
   ○ Consentimiento del candidato
   ○ Medidas precontractuales
   ○ Obligación legal
   ○ Interés legítimo [Requiere justificación]

4. CATEGORÍAS DE TITULARES
   □ Postulantes externos
   □ Empleados actuales (movilidad interna)
   □ Ex-empleados recontratables
   □ Practicantes/Pasantes

5. DATOS RECOLECTADOS [Lista dinámica]
   IDENTIFICACIÓN:
   □ Nombre completo
   □ RUT
   □ Fecha nacimiento
   □ Nacionalidad
   
   CONTACTO:
   □ Email personal
   □ Teléfono móvil
   □ Dirección
   
   LABORALES:
   □ Experiencia previa
   □ Referencias laborales
   □ Pretensiones de renta*
   
   ACADÉMICOS:
   □ Títulos/Certificados
   □ Cursos/Capacitaciones
   
   SENSIBLES (⚠️ Requieren consentimiento explícito):
   □ Antecedentes penales
   □ Exámenes médicos
   □ Situación socioeconómica*
   □ Afiliación sindical previa
   
   * ALERTA: En Chile son datos SENSIBLES

6. FLUJO DE DATOS
   ORIGEN → DESTINO:
   [Portal Web] → [Base RRHH] → [Email Jefes] → [Sistema Evaluación]
   
   TERCEROS INVOLUCRADOS:
   □ Empresa verificación antecedentes: _________
   □ Clínica exámenes preocupacionales: _________
   □ Consultora headhunting: _________

7. PLAZOS DE CONSERVACIÓN
   - CV seleccionados: [Durante relación laboral + 5 años]
   - CV no seleccionados: [6 meses]
   - Resultados exámenes: [Ficha empleado]

8. MEDIDAS DE SEGURIDAD
   □ Acceso restringido por rol
   □ Cifrado en reposo
   □ Logs de auditoría
   □ Backup automático

[GUARDAR ACTIVIDAD] [AGREGAR OTRA]
```

**RESULTADO**: Actividad completamente documentada que alimenta el RAT

---

### 🔷 CAPÍTULO 2: CAPTURA DE CATEGORÍAS DE DATOS

#### Lección 2.1: Clasificación Correcta - La Novedad Chilena

**ALERTA CRÍTICA**: En Chile, los datos socioeconómicos son SENSIBLES

**Ejercicio de Clasificación Interactivo**:
```
CLASIFICADOR DE DATOS

Arrastra cada tipo de dato a su categoría:

DATOS COMUNES                    DATOS SENSIBLES
┌─────────────────┐             ┌─────────────────┐
│                 │             │                 │
│                 │             │                 │
│                 │             │                 │
└─────────────────┘             └─────────────────┘

DATOS PARA CLASIFICAR:
• Nombre y apellidos
• RUT
• Sueldo líquido mensual ⚠️
• Email corporativo
• Huella digital
• Deudas bancarias ⚠️
• Cargo actual
• Afiliación a ISAPRE
• Scoring crediticio ⚠️
• Dirección particular
• Pertenencia a pueblo originario
• Número de cargas familiares

FEEDBACK INMEDIATO:
✓ Correcto: "Sueldo líquido" es SENSIBLE en Chile
✗ Error: "Scoring crediticio" es SENSIBLE (situación socioeconómica)
```

#### Lección 2.2: Captura por Área Funcional

**PLANTILLAS ESPECÍFICAS POR DEPARTAMENTO**:

**A) RECURSOS HUMANOS**
```
INVENTARIO DATOS RRHH

1. PROCESO: ADMINISTRACIÓN DE PERSONAL
   Datos Comunes:
   □ Datos contractuales
   □ Asistencia/Horarios
   □ Evaluaciones desempeño
   
   Datos Sensibles:
   □ Remuneraciones (SENSIBLE)
   □ Licencias médicas (SENSIBLE)
   □ Afiliación sindical (SENSIBLE)
   □ Cargas familiares

2. PROCESO: BIENESTAR
   □ Beneficios utilizados
   □ Préstamos empresa (SENSIBLE)
   □ Situación habitacional (SENSIBLE)
```

**B) MARKETING/VENTAS**
```
INVENTARIO DATOS COMERCIALES

1. PROCESO: GESTIÓN DE CLIENTES
   Datos Comunes:
   □ Razón social/Nombre
   □ RUT empresa/persona
   □ Datos contacto comercial
   
   Datos Sensibles:
   □ Línea de crédito (SENSIBLE)
   □ Comportamiento de pago (SENSIBLE)
   □ Categorización crediticia (SENSIBLE)

2. PROCESO: CAMPAÑAS
   □ Preferencias de compra
   □ Historial navegación web
   □ Segmentación socioeconómica (SENSIBLE)
```

**C) OPERACIONES/PRODUCCIÓN**
```
INVENTARIO DATOS OPERACIONALES

1. PROCESO: CONTROL DE ACCESO
   □ Datos biométricos (SENSIBLE)
   □ Geolocalización vehículos
   □ Cámaras de seguridad

2. PROCESO: SALUD Y SEGURIDAD
   □ Contactos emergencia
   □ Condiciones médicas relevantes (SENSIBLE)
   □ Restricciones laborales (SENSIBLE)
```

---

### 🔷 CAPÍTULO 3: CAPTURA DE FLUJOS DE DATOS

#### Lección 3.1: Mapeo de Flujos Internos

**CONSTRUCTOR VISUAL DE FLUJOS**:
```
EJEMPLO PRÁCTICO: Flujo de Datos de Cliente

[INICIO] Cliente completa formulario web
    ↓
[CAPTURA] Formulario web (WordPress)
    ↓ (API REST)
[ALMACENAMIENTO] Base de datos CRM (Salesforce)
    ↓ (Integración automática)
[PROCESAMIENTO] Sistema ERP (SAP)
    ↓ (Export nocturno)
[ANÁLISIS] Data Warehouse (AWS)
    ↓ (Dashboard)
[USO] Reportes Gerenciales (Power BI)

DATOS EN CADA PUNTO:
• Formulario: Nombre, RUT, email, consulta
• CRM: + historial interacciones, scoring
• ERP: + datos transaccionales, crédito
• DW: + análisis comportamiento, segmentación
• Reportes: Datos agregados y anonimizados
```

**FORMULARIO DE CAPTURA DE FLUJOS**:
```
DOCUMENTAR FLUJO DE DATOS

1. PUNTO DE ENTRADA
   Sistema origen: [___________]
   Tipo: [ ]Manual [ ]Automático [ ]API [ ]Archivo
   Frecuencia: [ ]Tiempo real [ ]Diaria [ ]Semanal

2. SISTEMAS INTERMEDIOS
   Sistema 1: [___________] Datos agregados: [___]
   Sistema 2: [___________] Datos agregados: [___]
   Sistema 3: [___________] Datos agregados: [___]

3. DESTINO FINAL
   Sistema: [___________]
   Propósito: [___________]
   Retención: [___] días/meses/años

4. PUNTOS CRÍTICOS
   □ Transferencia sin cifrar
   □ Almacenamiento sin respaldo
   □ Acceso sin autenticación
   □ Sin logs de auditoría
```

#### Lección 3.2: Mapeo de Terceros

**MATRIZ DE TERCEROS Y ENCARGADOS**:
```
INVENTARIO DE TERCEROS

┌─────────────────┬──────────────┬─────────────┬──────────────┬─────────────┐
│TERCERO          │TIPO          │DATOS        │PAÍS         │GARANTÍAS    │
├─────────────────┼──────────────┼─────────────┼──────────────┼─────────────┤
│Google Workspace │Encargado     │Emails, docs │EEUU ⚠️      │SCC + DPA    │
├─────────────────┼──────────────┼─────────────┼──────────────┼─────────────┤
│Previred         │Encargado     │Nómina       │Chile ✓      │Contrato     │
├─────────────────┼──────────────┼─────────────┼──────────────┼─────────────┤
│AWS              │Sub-encargado │Todo         │EEUU ⚠️      │SCC + SOC2   │
├─────────────────┼──────────────┼─────────────┼──────────────┼─────────────┤
│Equifax          │Cesionario    │Deudas       │Chile ✓      │Ley 21.719   │
└─────────────────┴──────────────┴─────────────┴──────────────┴─────────────┘

ALERTAS AUTOMÁTICAS:
⚠️ Transferencia Internacional - Requiere garantías adicionales
⚠️ Datos sensibles a tercero - Verificar consentimiento explícito
```

---

### 🔷 CAPÍTULO 4: CAPTURA DE POLÍTICAS DE RETENCIÓN

#### Lección 4.1: Definición de Plazos

**CALCULADORA INTELIGENTE DE RETENCIÓN**:
```
POLÍTICA DE RETENCIÓN - GENERADOR

TIPO DE DATO: [Currículums no seleccionados]

1. ANÁLISIS DE NECESIDAD
   ¿Para qué podrías necesitar este dato?
   □ Futuras vacantes similares [6 meses]
   □ Estadísticas de reclutamiento [Anonimizar]
   □ Defensa ante reclamos [1 año]

2. OBLIGACIONES LEGALES
   Buscando en base de datos legal...
   ✓ No hay obligación legal de conservación

3. RECOMENDACIÓN
   Plazo sugerido: 6 meses
   Acción al vencer: Eliminación completa
   
   Justificación: Permite considerar candidatos para 
   vacantes similares en plazo razonable

4. GENERAR POLÍTICA
   [Crear documento formal]
```

**PLANTILLA DE POLÍTICA GENERADA**:
```
POLÍTICA DE RETENCIÓN DE DATOS
Empresa: [Autocompleta]
Fecha: [Automática]

1. CURRÍCULUMS NO SELECCIONADOS
   - Plazo: 6 meses desde recepción
   - Justificación: Posibles vacantes futuras
   - Acción: Eliminación completa
   - Responsable: RRHH
   - Frecuencia revisión: Mensual

2. DATOS DE CLIENTES ACTIVOS
   - Plazo: Duración relación + 5 años
   - Justificación: Obligaciones tributarias
   - Acción: Anonimización parcial
   - Responsable: Finanzas

[Agregar más categorías]
```

---

### 🔷 CAPÍTULO 5: INTEGRACIÓN CON OTROS MÓDULOS

#### Lección 5.1: Conexión con Gestión de Consentimientos

**IDENTIFICADOR DE CONSENTIMIENTOS NECESARIOS**:
```
ANÁLISIS DE CONSENTIMIENTOS REQUERIDOS

Basado en tu inventario, necesitas consentimiento para:

1. MARKETING DIRECTO
   Actividades detectadas:
   - Envío newsletters (MKT-001)
   - Campañas email (MKT-002)
   
   ACCIÓN REQUERIDA:
   → Implementar checkbox granular en formularios
   → Crear campaña de actualización consentimientos

2. DATOS SENSIBLES
   Detectados en:
   - Evaluación crediticia clientes (FIN-001)
   - Exámenes médicos empleados (RRHH-003)
   
   ACCIÓN REQUERIDA:
   → Consentimiento explícito y específico
   → Justificar necesidad

[GENERAR FORMULARIOS DE CONSENTIMIENTO]
```

#### Lección 5.2: Preparación para Derechos ARCOPOL

**MAPA DE UBICACIÓN DE DATOS**:
```
RESPUESTA RÁPIDA A DERECHOS

Cuando un titular pida sus datos, los encontrarás en:

JUAN PÉREZ (RUT: 12.345.678-9)
├── SISTEMAS PRINCIPALES
│   ├── CRM (Salesforce): Datos comerciales
│   ├── ERP (SAP): Transacciones
│   └── RRHH (Workday): Datos laborales
│
├── ARCHIVOS
│   ├── Contratos: /legal/contratos/2024/
│   └── Emails: Exchange Online
│
└── TERCEROS
    ├── Previred: Datos previsionales
    └── Banco Estado: Pago nómina

[EXPORTAR MAPA COMPLETO]
```

#### Lección 5.3: Base para Evaluaciones de Impacto

**PRE-ANÁLISIS DE RIESGOS**:
```
ACTIVIDADES DE ALTO RIESGO DETECTADAS

Basado en tu inventario, estas actividades requieren DPIA:

1. VIDEOVIGILANCIA EMPLEADOS (OPS-002)
   Riesgo: Monitoreo sistemático
   Datos: Imágenes, comportamiento
   
2. SCORING CREDITICIO AUTOMATIZADO (FIN-003)
   Riesgo: Decisiones automatizadas
   Datos: Financieros sensibles
   
3. GEOLOCALIZACIÓN FLOTA (LOG-001)
   Riesgo: Seguimiento sistemático
   Datos: Ubicación tiempo real

[INICIAR EVALUACIÓN DE IMPACTO]
```

---

### 🔷 CAPÍTULO 6: GENERACIÓN DE ENTREGABLES

#### Lección 6.1: Tu RAT Completo

**GENERADOR DE DOCUMENTOS**:
```
DOCUMENTOS DISPONIBLES PARA DESCARGA

1. REGISTRO DE ACTIVIDADES (RAT)
   □ Formato: Excel con macros
   □ Contenido: 15 actividades documentadas
   □ Pestañas: Por departamento
   [DESCARGAR RAT]

2. INFORME EJECUTIVO
   □ Formato: Word profesional
   □ Contenido: Resumen, hallazgos, riesgos
   □ Gráficos: Distribución de datos
   [DESCARGAR INFORME]

3. DIAGRAMA DE FLUJOS
   □ Formato: PDF alta resolución
   □ Contenido: Mapa visual completo
   □ Código colores: Por sensibilidad
   [DESCARGAR DIAGRAMA]

4. POLÍTICAS Y PROCEDIMIENTOS
   □ Formato: Word editable
   □ Contenido: Retención, eliminación
   □ Anexos: Formularios tipo
   [DESCARGAR POLÍTICAS]
```

#### Lección 6.2: Plan de Implementación

**PLAN 90 DÍAS PERSONALIZADO**:
```
TU HOJA DE RUTA - PRÓXIMOS 90 DÍAS

DÍAS 1-30: COMPLETAR INVENTARIO
□ Semana 1: Entrevistar Finanzas y Legal
□ Semana 2: Mapear sistemas legacy
□ Semana 3: Revisar contratos proveedores
□ Semana 4: Validar con jefaturas

DÍAS 31-60: IMPLEMENTAR CONTROLES
□ Semana 5-6: Actualizar consentimientos
□ Semana 7-8: Firmar DPAs con terceros

DÍAS 61-90: AUTOMATIZAR Y AUDITAR
□ Semana 9-10: Implementar retention policy
□ Semana 11-12: Primera auditoría interna

[EXPORTAR A CALENDAR]
```

---

## 📊 MÉTRICAS Y EVALUACIÓN

### Indicadores de Completitud
```
DASHBOARD DE PROGRESO

INVENTARIO GENERAL          [████████░░] 85%
├── Actividades RAT         [██████████] 100% ✓
├── Clasificación datos     [████████░░] 90%
├── Flujos mapeados        [███████░░░] 75%
└── Políticas definidas    [████████░░] 80%

POR DEPARTAMENTO
├── RRHH                   [██████████] 100% ✓
├── Marketing              [████████░░] 85%
├── Finanzas              [███████░░░] 70%
└── Operaciones           [██████░░░░] 60%

PRÓXIMAS ACCIONES
1. Completar flujos de Marketing
2. Entrevistar a Operaciones
3. Revisar políticas con Legal
```

### Certificación
```
CERTIFICADO DE COMPLETACIÓN

Jurídica Digital SPA certifica que:

[NOMBRE USUARIO]
RUT: [XX.XXX.XXX-X]

Ha completado exitosamente el:
MÓDULO DE INVENTARIO Y MAPEO DE DATOS

Logrando:
✓ 15 actividades documentadas (mínimo: 3)
✓ 100% datos clasificados correctamente
✓ 5 flujos de datos mapeados
✓ 3 políticas de retención definidas

Fecha: [DD/MM/AAAA]
Código verificación: [XXXX-XXXX-XXXX]
```

---

## 🛠️ HERRAMIENTAS DE APOYO CONTINUO

### Kit de Mantenimiento
1. **Plantillas actualizables** (Excel/Word)
2. **Checklist de auditoría** trimestral
3. **Alertas de cambios** normativos
4. **Foro de consultas** con expertos
5. **Actualizaciones del módulo**

### Soporte Post-Curso
- Email: soporte@juridicadigital.cl
- Chat: Integrado en plataforma
- Webinars: Mensuales de actualización

---

## ⚡ ACCIONES INMEDIATAS AL TERMINAR

1. **Compartir RAT** con Gerencia/Directorio
2. **Designar responsables** por área
3. **Calendarizar** actualizaciones mensuales
4. **Iniciar** módulo de Consentimientos
5. **Programar** auditoría en 90 días

---

**RECUERDA**: Este inventario es la BASE de todo tu sistema de cumplimiento. Sin él, no puedes:
- Responder derechos ARCOPOL
- Gestionar consentimientos
- Notificar brechas correctamente
- Hacer evaluaciones de impacto
- Demostrar cumplimiento

**¡El inventario NO es un documento, es un SISTEMA VIVO que debe actualizarse constantemente!**