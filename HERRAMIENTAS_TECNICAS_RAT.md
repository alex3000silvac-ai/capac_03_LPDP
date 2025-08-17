# 🛠️ KIT DE HERRAMIENTAS TÉCNICAS - RAT
## **INVENTARIO Y MAPEO DE DATOS PERSONALES - LEY 21.719**

---

## 📋 **ÍNDICE DE HERRAMIENTAS**

1. **[Checklist de Obligaciones RAT](#1-checklist-obligaciones-rat)**
2. **[Matriz de Clasificación de Datos Sensibles Chile](#2-matriz-clasificación-datos-sensibles)**
3. **[Kit de Cuestionarios por Departamento](#3-kit-cuestionarios-departamento)**
4. **[Plantilla RAT Master](#4-plantilla-rat-master)**
5. **[Guías de Entrevista Estructurada](#5-guías-entrevista-estructurada)**
6. **[Formularios de Mapeo de Flujos](#6-formularios-mapeo-flujos)**
7. **[Matriz de Evaluación de Riesgos](#7-matriz-evaluación-riesgos)**
8. **[Plantillas de Políticas de Retención](#8-plantillas-políticas-retención)**
9. **[Dashboard de Monitoreo RAT](#9-dashboard-monitoreo-rat)**
10. **[Scripts de Automatización](#10-scripts-automatización)**

---

## 📊 **1. CHECKLIST DE OBLIGACIONES RAT**
### **Control de Cumplimiento Ley 21.719**

```
CHECKLIST CUMPLIMIENTO RAT - LEY 21.719
=======================================

EMPRESA: _________________________ 
DPO: _____________________________ 
FECHA REVISIÓN: ___________________

OBLIGACIONES LEGALES BÁSICAS:
□ RAT actualizado (Art. 25 Ley 21.719)
□ Designación formal de DPO
□ Políticas de privacidad publicadas
□ Procedimientos de derechos ARCOPOL
□ Registro de brechas de seguridad

ELEMENTOS MÍNIMOS RAT:
□ Finalidades específicas y explícitas
□ Categorías de titulares de datos
□ Categorías de datos personales
□ Destinatarios internos y externos
□ Transferencias internacionales documentadas
□ Plazos de conservación definidos
□ Medidas de seguridad implementadas

ESPECIFICIDADES CHILE:
□ Situación socioeconómica clasificada como dato sensible
□ Bases de licitud específicas documentadas
□ Consentimiento granular implementado
□ Procedimientos de revocación simple

VALIDACIONES TÉCNICAS:
□ Sistemas de inventario automatizado
□ Integraciones mapeadas y documentadas
□ Flujos de datos trazados
□ Puntos de control de seguridad identificados

DOCUMENTACIÓN PROBATORIA:
□ Actas de entrevistas con responsables
□ Evidencia de capacitación del personal
□ Registros de auditorías internas
□ Respaldos de configuraciones de sistemas

SEGUIMIENTO Y MONITOREO:
□ Procedimientos de actualización trimestral
□ KPIs de calidad del RAT definidos
□ Alertas automáticas configuradas
□ Plan de mejora continua implementado

PREPARACIÓN PARA AUDITORÍAS:
□ Documentación organizada y accesible
□ Responsables identificados y capacitados
□ Evidencias de cumplimiento centralizadas
□ Procedimientos de respuesta a requerimientos

ESTADO GENERAL: 
□ COMPLETO (90-100% items)
□ EN PROGRESO (70-89% items)  
□ INICIAL (50-69% items)
□ CRÍTICO (<50% items)

ACCIONES PRIORITARIAS:
1. _________________________________
2. _________________________________
3. _________________________________

PRÓXIMA REVISIÓN: _______________
```

---

## 🔍 **2. MATRIZ DE CLASIFICACIÓN DE DATOS SENSIBLES**
### **Especificaciones Ley 21.719 Chile**

```
MATRIZ CLASIFICACIÓN DATOS PERSONALES - LEY 21.719
==================================================

DATOS PERSONALES COMUNES:
┌─────────────────────────────────────────────────────────────┐
│ CATEGORÍA          │ EJEMPLOS                │ NIVEL RIESGO │
├─────────────────────────────────────────────────────────────┤
│ Identificación     │ RUT, nombre, apellido   │ MEDIO        │
│ Contacto           │ Email, teléfono         │ BAJO         │
│ Laborales          │ Cargo, empresa          │ BAJO         │
│ Académicos         │ Títulos, certificados  │ BAJO         │
│ Demográficos       │ Edad, género            │ MEDIO        │
└─────────────────────────────────────────────────────────────┘

DATOS PERSONALES SENSIBLES (Art. 2 lit. g):
┌─────────────────────────────────────────────────────────────┐
│ CATEGORÍA              │ EJEMPLOS ESPECÍFICOS    │ NIVEL    │
├─────────────────────────────────────────────────────────────┤
│ Origen étnico/racial   │ Pueblo originario       │ ALTO     │
│ Afiliación política    │ Militancia partidaria   │ ALTO     │
│ Afiliación sindical    │ Membresía sindicatos    │ ALTO     │
│ Afiliación gremial     │ Colegios profesionales  │ ALTO     │
│ Situación socioeconómica│ Ingresos, patrimonio   │ ALTO     │
│ Convicciones ideológicas│ Filosofía de vida      │ ALTO     │
│ Creencias religiosas   │ Confesión, prácticas    │ ALTO     │
│ Datos de salud         │ Diagnósticos, tratamientos│ MUY ALTO│
│ Perfil biológico       │ Genética, ADN           │ MUY ALTO │
│ Datos biométricos      │ Huella, iris, facial    │ MUY ALTO │
│ Vida sexual            │ Orientación, prácticas  │ MUY ALTO │
│ Orientación sexual     │ Heterosexual, LGBTI+    │ MUY ALTO │
│ Identidad de género    │ Trans, no binario       │ MUY ALTO │
└─────────────────────────────────────────────────────────────┘

DATOS DE NIÑOS, NIÑAS Y ADOLESCENTES (NNA):
┌─────────────────────────────────────────────────────────────┐
│ CRITERIO               │ CONSIDERACIONES         │ ACCIÓN   │
├─────────────────────────────────────────────────────────────┤
│ Menor de 14 años       │ Representación legal    │ PROHIBIR │
│ 14-18 años             │ Consentimiento especial │ RESTRINGIR│
│ Datos familiares       │ Afecta interés del niño │ EVALUAR  │
└─────────────────────────────────────────────────────────────┘

HERRAMIENTAS DE EVALUACIÓN AUTOMÁTICA:
=============================================

CLASIFICADOR AUTOMÁTICO DE CAMPOS:
- Input: Nombre de campo de base de datos
- Output: Clasificación automática + nivel de riesgo

Ejemplos:
• "sueldo_bruto" → SENSIBLE (situación socioeconómica) - ALTO
• "email_personal" → COMÚN (contacto) - BAJO  
• "certificado_buceo" → COMÚN (académico) + SENSIBLE (salud indirecta) - MEDIO
• "afiliacion_sindicato" → SENSIBLE (sindical) - ALTO

ALGORITMO DE EVALUACIÓN:
IF campo contains ["sueldo", "ingreso", "patrimonio", "deuda"] 
   THEN clasificar = SENSIBLE_SOCIOECONOMICO
IF campo contains ["salud", "medicina", "diagnostico", "enfermedad"]
   THEN clasificar = SENSIBLE_SALUD  
IF campo contains ["sindical", "sindicato", "gremio"]
   THEN clasificar = SENSIBLE_SINDICAL
```

---

## 📝 **3. KIT DE CUESTIONARIOS POR DEPARTAMENTO**

### **3.1 Cuestionario RRHH**

```
ENTREVISTA ESTRUCTURADA - RECURSOS HUMANOS
==========================================

ENTREVISTADO: _________________________
CARGO: ________________________________
FECHA: ________________________________
DURACIÓN: _____________________________

SECCIÓN A: PROCESO DE RECLUTAMIENTO
----------------------------------
1. ¿Cuál es el flujo completo desde que reciben un CV hasta la contratación?

2. ¿Qué datos específicos solicitan que no estén en un CV estándar?
   □ Datos socioeconómicos (ingresos anteriores, situación crediticia)
   □ Datos de salud (exámenes médicos, psicotécnicos)
   □ Referencias laborales (contacto con ex empleadores)
   □ Otros: ________________________________

3. ¿Utilizan servicios externos en el proceso?
   □ Empresas de verificación de antecedentes
   □ Servicios de exámenes médicos
   □ Plataformas de reclutamiento online
   □ Otros: ________________________________

4. ¿Cómo manejan los CVs de candidatos no seleccionados?
   Tiempo de retención: ___________________
   Método de eliminación: _________________

SECCIÓN B: GESTIÓN DE EMPLEADOS ACTIVOS
---------------------------------------
5. ¿Qué datos recolectan durante la relación laboral?
   □ Evaluaciones de desempeño
   □ Capacitaciones realizadas
   □ Datos familiares (cargas, emergencias)
   □ Datos de salud (licencias médicas)
   □ Monitoreo de ubicación (GPS vehículos)
   □ Otros: ________________________________

6. ¿Comparten datos de empleados con terceros?
   □ Seguros (salud, vida, accidentes)
   □ Administradoras de fondos de pensiones
   □ DIRECTEMAR (personal embarcado)
   □ Otros: ________________________________

SECCIÓN C: SISTEMAS Y TECNOLOGÍA
--------------------------------
7. ¿Qué sistemas utilizan para gestionar datos de personal?
   Sistema RRHH: ________________________
   Integraciones: _______________________
   Accesos externos: ____________________

8. ¿Tienen procedimientos para derechos de trabajadores?
   □ Acceso a datos personales
   □ Rectificación de información
   □ Supresión (ex empleados)
   □ Oposición a tratamientos específicos

SECCIÓN D: CASOS ESPECÍFICOS SECTOR
-----------------------------------
9. [SALMONICULTURA] ¿Qué datos adicionales manejan para:
   - Personal embarcado: ___________________
   - Trabajadores en centros de cultivo: ___
   - Personal con certificaciones especiales: __

10. ¿Cómo validan certificaciones sectoriales?
    Organismo verificador: __________________
    Datos compartidos: _____________________

IDENTIFICACIÓN DE RIESGOS:
_____________________________________________
_____________________________________________

RECOMENDACIONES INMEDIATAS:
_____________________________________________
_____________________________________________
```

### **3.2 Cuestionario OPERACIONES/TI**

```
ENTREVISTA ESTRUCTURADA - OPERACIONES/TI
========================================

ENTREVISTADO: _________________________
ÁREA: ________________________________
FECHA: ________________________________

SECCIÓN A: INFRAESTRUCTURA DE DATOS
----------------------------------
1. ¿Qué sistemas almacenan datos de personas?
   Sistema 1: ____________________________
   Tipo de datos: _______________________
   
   Sistema 2: ____________________________
   Tipo de datos: _______________________
   
   [Continuar según necesidad]

2. ¿Hay integraciones automáticas entre sistemas?
   Origen → Destino → Frecuencia → Datos transferidos
   _____ → _______ → __________ → ________________
   _____ → _______ → __________ → ________________

3. ¿Utilizan servicios en la nube?
   □ AWS/Azure/Google Cloud
   □ SaaS (Salesforce, Office 365)
   □ Aplicaciones especializadas
   Ubicación servidores: ___________________

SECCIÓN B: FLUJOS DE DATOS ESPECÍFICOS
-------------------------------------
4. [SECTOR ESPECÍFICO] Describa el flujo de datos en:
   - Monitoreo IoT: _______________________
   - Análisis predictivo: _________________
   - Integraciones con organismos: _________

5. ¿Qué datos se generan automáticamente?
   □ Logs de acceso y actividad
   □ Datos de geolocalización
   □ Métricas de performance
   □ Análisis de comportamiento

SECCIÓN C: SEGURIDAD Y ACCESOS
------------------------------
6. ¿Cómo controlan el acceso a datos personales?
   Método de autenticación: _______________
   Roles definidos: ______________________
   Logs de acceso: _______________________

7. ¿Tienen procedimientos de respaldo y recuperación?
   Frecuencia backups: ___________________
   Ubicación backups: ____________________
   Tiempo de retención: __________________

SECCIÓN D: AUTOMATIZACIÓN Y IA
------------------------------
8. ¿Utilizan algoritmos o IA que procesen datos personales?
   Propósito: ____________________________
   Tipo de decisiones: ___________________
   Datos de entrada: _____________________
   Intervención humana: __________________

9. ¿Hay decisiones completamente automatizadas?
   Ejemplos: _____________________________
   Impacto en personas: __________________
   Posibilidad de apelación: _____________

MAPEO TÉCNICO RESULTANTE:
_____________________________________________
_____________________________________________
```

### **3.3 Cuestionario MARKETING/VENTAS**

```
ENTREVISTA ESTRUCTURADA - MARKETING/VENTAS
==========================================

SECCIÓN A: CAPTACIÓN DE CLIENTES
-------------------------------
1. ¿Cómo obtienen datos de clientes potenciales?
   □ Formularios web
   □ Eventos y ferias
   □ Redes sociales
   □ Compra de bases de datos
   □ Referencias

2. ¿Qué información solicitan en formularios?
   Datos obligatorios: ____________________
   Datos opcionales: _____________________
   Consentimientos específicos: ___________

3. ¿Cómo gestionan el consentimiento para marketing?
   □ Opt-in previo
   □ Checkboxes granulares
   □ Confirmación por email
   □ Renovación periódica

SECCIÓN B: ANÁLISIS Y PERSONALIZACIÓN
------------------------------------
4. ¿Analizan el comportamiento de clientes?
   □ Navegación web
   □ Historial de compras
   □ Preferencias declaradas
   □ Análisis predictivo

5. ¿Utilizan herramientas de tracking?
   □ Google Analytics
   □ Facebook Pixel
   □ Cookies de terceros
   □ Herramientas propias

6. ¿Crean perfiles de cliente automáticamente?
   Criterios de segmentación: _____________
   Decisiones automatizadas: ______________
   Posibilidad de opt-out: _______________

SECCIÓN C: COMUNICACIONES
------------------------
7. ¿Cómo gestionan las comunicaciones comerciales?
   Canales utilizados: ___________________
   Frecuencia de envío: __________________
   Proceso de baja: ______________________

8. ¿Comparten datos con partners comerciales?
   Partners: _____________________________
   Datos compartidos: ____________________
   Base legal: ___________________________

IDENTIFICACIÓN DE ACTIVIDADES RAT:
_____________________________________________
```

---

## 🗂️ **4. PLANTILLA RAT MASTER**
### **Registro de Actividades de Tratamiento Completo**

```
REGISTRO DE ACTIVIDADES DE TRATAMIENTO (RAT)
============================================

INFORMACIÓN GENERAL:
Empresa: ______________________________
DPO Responsable: _____________________
Fecha de creación: ___________________
Última actualización: ________________
Versión: _____________________________

ACTIVIDAD ID: _________________________

┌─────────────────────────────────────────────────────────────┐
│                    IDENTIFICACIÓN                           │
├─────────────────────────────────────────────────────────────┤
│ Nombre de la actividad:                                     │
│ _____________________________________________               │
│                                                             │
│ Descripción detallada:                                      │
│ _____________________________________________               │
│ _____________________________________________               │
│                                                             │
│ Responsable del proceso:                                    │
│ Nombre: ____________________________________               │
│ Cargo: _____________________________________               │
│ Email: _____________________________________               │
│ Teléfono: __________________________________               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      FINALIDADES                           │
├─────────────────────────────────────────────────────────────┤
│ Finalidad principal:                                        │
│ _____________________________________________               │
│                                                             │
│ Finalidades secundarias:                                    │
│ 1. _________________________________________               │
│ 2. _________________________________________               │
│ 3. _________________________________________               │
│                                                             │
│ ¿Las finalidades son compatibles entre sí?                 │
│ □ Sí □ No                                                  │
│ Justificación: ______________________________              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    BASE DE LICITUD                         │
├─────────────────────────────────────────────────────────────┤
│ Base legal principal (Art. 10 Ley 21.719):                 │
│ □ a) Consentimiento del titular                            │
│ □ b) Ejecución de contrato                                 │
│ □ c) Cumplimiento de obligación legal                      │
│ □ d) Protección de intereses vitales                       │
│ □ e) Ejercicio de funciones públicas                       │
│ □ f) Interés legítimo del responsable                      │
│                                                             │
│ Detalle/Justificación:                                      │
│ _____________________________________________               │
│ _____________________________________________               │
│                                                             │
│ Para datos sensibles (base adicional requerida):           │
│ □ Consentimiento explícito                                 │
│ □ Cumplimiento obligaciones laborales                      │
│ □ Protección intereses vitales                             │
│ □ Ejercicio/defensa derechos legales                       │
│ □ Razones de interés público                               │
│ □ Fines médicos/salud pública                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  CATEGORÍAS DE TITULARES                   │
├─────────────────────────────────────────────────────────────┤
│ □ Clientes actuales                                        │
│ □ Clientes potenciales                                     │
│ □ Ex clientes                                              │
│ □ Empleados                                                │
│ □ Ex empleados                                             │
│ □ Candidatos a empleo                                      │
│ □ Proveedores (personas naturales)                        │
│ □ Contactos de empresas                                    │
│ □ Beneficiarios de programas                               │
│ □ Visitantes del sitio web                                │
│ □ Menores de edad                                          │
│ □ Otras: ____________________________________             │
│                                                             │
│ Cantidad aproximada de titulares: ____________             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                CATEGORÍAS DE DATOS PERSONALES              │
├─────────────────────────────────────────────────────────────┤
│ DATOS PERSONALES COMUNES:                                  │
│ □ Datos de identificación (nombre, RUT, etc.)             │
│ □ Datos de contacto (email, teléfono, dirección)          │
│ □ Datos laborales (cargo, empresa, salario)               │
│ □ Datos académicos (títulos, certificaciones)             │
│ □ Datos financieros (ingresos, cuentas bancarias)         │
│ □ Datos de navegación web                                  │
│ □ Datos de geolocalización                                 │
│ □ Datos de comportamiento/preferencias                     │
│ □ Otros: ____________________________________             │
│                                                             │
│ DATOS PERSONALES SENSIBLES:                                │
│ □ Origen étnico o racial                                   │
│ □ Afiliación política                                      │
│ □ Afiliación sindical/gremial                             │
│ □ Situación socioeconómica                                 │
│ □ Convicciones ideológicas/filosóficas                     │
│ □ Creencias religiosas                                     │
│ □ Datos de salud                                           │
│ □ Perfil biológico/genético                               │
│ □ Datos biométricos                                        │
│ □ Vida sexual/orientación sexual                           │
│ □ Identidad de género                                      │
│                                                             │
│ DATOS DE MENORES DE EDAD:                                  │
│ □ Datos de NNA (especificar edades): ____________         │
│ □ Consentimiento de padres/tutores obtenido               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    ORIGEN DE LOS DATOS                     │
├─────────────────────────────────────────────────────────────┤
│ □ Directamente del titular                                 │
│ □ Fuentes públicamente accesibles                         │
│ □ Terceros (especificar): _________________               │
│ □ Generados automáticamente por sistemas                   │
│ □ Inferidos mediante análisis                              │
│ □ Otros: ____________________________________             │
│                                                             │
│ Método de recolección:                                      │
│ □ Formularios web                                          │
│ □ Formularios físicos                                      │
│ □ Llamadas telefónicas                                     │
│ □ Email                                                    │
│ □ Presencial                                               │
│ □ Automático (sensores, cookies, etc.)                    │
│ □ Transferencia de terceros                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  SISTEMAS INVOLUCRADOS                     │
├─────────────────────────────────────────────────────────────┤
│ Sistema 1: ____________________________________           │
│ Función: ______________________________________           │
│ Ubicación: ____________________________________           │
│                                                             │
│ Sistema 2: ____________________________________           │
│ Función: ______________________________________           │
│ Ubicación: ____________________________________           │
│                                                             │
│ Sistema 3: ____________________________________           │
│ Función: ______________________________________           │
│ Ubicación: ____________________________________           │
│                                                             │
│ Integraciones automáticas:                                  │
│ _______________________________________________           │
│ _______________________________________________           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      DESTINATARIOS                         │
├─────────────────────────────────────────────────────────────┤
│ DESTINATARIOS INTERNOS:                                     │
│ □ Departamento RRHH                                        │
│ □ Departamento Legal                                       │
│ □ Departamento TI                                          │
│ □ Departamento Marketing                                   │
│ □ Departamento Finanzas                                    │
│ □ Gerencia/Directorio                                      │
│ □ Otros: ____________________________________             │
│                                                             │
│ DESTINATARIOS EXTERNOS:                                     │
│ Empresa/Organismo: ____________________________           │
│ Relación: □ Encargado □ Cesionario                        │
│ Datos compartidos: _____________________________           │
│ Finalidad: ____________________________________           │
│ Base legal: ___________________________________           │
│                                                             │
│ Empresa/Organismo: ____________________________           │
│ Relación: □ Encargado □ Cesionario                        │
│ Datos compartidos: _____________________________           │
│ Finalidad: ____________________________________           │
│ Base legal: ___________________________________           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│               TRANSFERENCIAS INTERNACIONALES               │
├─────────────────────────────────────────────────────────────┤
│ ¿Se realizan transferencias fuera de Chile?                │
│ □ No                                                       │
│ □ Sí (completar detalles):                                │
│                                                             │
│ País de destino: _______________________________          │
│ Organismo/empresa: _____________________________          │
│ Datos transferidos: ____________________________          │
│ Finalidad: ____________________________________          │
│ Frecuencia: ___________________________________          │
│                                                             │
│ Garantías de protección:                                    │
│ □ Decisión de adecuación                                   │
│ □ Cláusulas contractuales tipo                             │
│ □ Normas corporativas vinculantes                          │
│ □ Códigos de conducta                                      │
│ □ Certificaciones                                          │
│ □ Otras: ____________________________________             │
│                                                             │
│ Documentación de garantías disponible:                     │
│ □ Sí □ No                                                 │
│ Ubicación: ____________________________________           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 PLAZOS DE CONSERVACIÓN                     │
├─────────────────────────────────────────────────────────────┤
│ Criterios para determinar plazos:                          │
│ □ Obligaciones legales                                     │
│ □ Duración de la relación contractual                      │
│ □ Necesidades del negocio                                  │
│ □ Consentimiento del titular                               │
│ □ Otros: ____________________________________             │
│                                                             │
│ Plazos específicos:                                         │
│                                                             │
│ Datos activos: ________________________________           │
│ Justificación: ________________________________           │
│                                                             │
│ Datos archivados: _____________________________           │
│ Justificación: ________________________________           │
│                                                             │
│ Criterios de eliminación:                                   │
│ _______________________________________________           │
│ _______________________________________________           │
│                                                             │
│ Procedimiento de eliminación:                               │
│ □ Eliminación física                                       │
│ □ Anonimización                                            │
│ □ Pseudonimización                                         │
│ □ Archivo con acceso restringido                           │
│                                                             │
│ Responsable de la eliminación:                              │
│ _______________________________________________           │
│                                                             │
│ Frecuencia de revisión: ________________________           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  MEDIDAS DE SEGURIDAD                      │
├─────────────────────────────────────────────────────────────┤
│ MEDIDAS TÉCNICAS:                                           │
│ □ Cifrado de datos en reposo                              │
│ □ Cifrado de datos en tránsito                            │
│ □ Control de acceso basado en roles                       │
│ □ Autenticación multifactor                               │
│ □ Logs de auditoría                                       │
│ □ Respaldos seguros                                       │
│ □ Firewall y seguridad de red                             │
│ □ Antivirus y antimalware                                 │
│ □ Otras: ____________________________________             │
│                                                             │
│ MEDIDAS ORGANIZATIVAS:                                      │
│ □ Políticas de seguridad documentadas                     │
│ □ Capacitación del personal                               │
│ □ Acuerdos de confidencialidad                            │
│ □ Control de acceso físico                                │
│ □ Procedimientos de respuesta a incidentes                │
│ □ Auditorías periódicas                                   │
│ □ Gestión de terceros                                     │
│ □ Otras: ____________________________________             │
│                                                             │
│ Evaluación de riesgos realizada:                           │
│ □ Sí □ No                                                 │
│ Fecha: ________________________________________           │
│ Próxima evaluación: ____________________________           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    DERECHOS ARCOPOL                        │
├─────────────────────────────────────────────────────────────┤
│ Procedimientos implementados para:                          │
│                                                             │
│ □ ACCESO - Consulta de datos personales                   │
│   Responsable: ________________________________           │
│   Plazo de respuesta: __________________________           │
│                                                             │
│ □ RECTIFICACIÓN - Corrección de datos                     │
│   Responsable: ________________________________           │
│   Plazo de respuesta: __________________________           │
│                                                             │
│ □ CANCELACIÓN/SUPRESIÓN - Eliminación de datos            │
│   Responsable: ________________________________           │
│   Excepciones aplicables: ______________________           │
│                                                             │
│ □ OPOSICIÓN - Oposición al tratamiento                    │
│   Responsable: ________________________________           │
│   Criterios de evaluación: ______________________           │
│                                                             │
│ □ PORTABILIDAD - Transferencia de datos                   │
│   Responsable: ________________________________           │
│   Formato de entrega: ___________________________           │
│                                                             │
│ □ LIMITACIÓN - Bloqueo temporal                           │
│   Responsable: ________________________________           │
│   Criterios aplicables: _________________________           │
│                                                             │
│ Canales de solicitud habilitados:                          │
│ □ Email: ____________________________________             │
│ □ Formulario web                                           │
│ □ Presencial                                               │
│ □ Teléfono                                                 │
│ □ Otros: ____________________________________             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     INFORMACIÓN ADICIONAL                  │
├─────────────────────────────────────────────────────────────┤
│ Observaciones específicas:                                  │
│ _______________________________________________           │
│ _______________________________________________           │
│ _______________________________________________           │
│                                                             │
│ Riesgos identificados:                                      │
│ 1. ___________________________________________             │
│ 2. ___________________________________________             │
│ 3. ___________________________________________             │
│                                                             │
│ Medidas de mitigación:                                      │
│ 1. ___________________________________________             │
│ 2. ___________________________________________             │
│ 3. ___________________________________________             │
│                                                             │
│ Próximas acciones:                                          │
│ □ Actualizar políticas                                     │
│ □ Capacitar personal                                       │
│ □ Implementar medidas técnicas                             │
│ □ Revisar contratos con terceros                           │
│ □ Otras: ____________________________________             │
│                                                             │
│ Fecha de próxima revisión: ______________________           │
│ Responsable de la revisión: _____________________           │
└─────────────────────────────────────────────────────────────┘

FIRMAS Y APROBACIONES:
=====================

Elaborado por:
Nombre: ______________________________________
Cargo: _______________________________________
Fecha: _______________________________________
Firma: _______________________________________

Revisado por (DPO):
Nombre: ______________________________________
Fecha: _______________________________________
Firma: _______________________________________

Aprobado por:
Nombre: ______________________________________
Cargo: _______________________________________
Fecha: _______________________________________
Firma: _______________________________________

---
CONTROL DE VERSIONES:
v1.0 - Creación inicial - [FECHA]
v1.1 - [DESCRIPCIÓN CAMBIOS] - [FECHA]
v1.2 - [DESCRIPCIÓN CAMBIOS] - [FECHA]
```

---

**CONTINUARÁ...**

*Este es el primer conjunto de herramientas. El kit completo incluye las 17 herramientas técnicas mencionadas en el plan de capacitación.*

---

**© 2024 Jurídica Digital SPA - Kit de Herramientas Profesionales RAT**