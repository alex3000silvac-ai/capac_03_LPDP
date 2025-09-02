# 🔬 DIAGRAMA ULTRA-DETALLADO ECOSISTEMA LPDP COMPLETO
## 🧬 PASO A PASO - TODAS LAS CASUÍSTICAS - EXPLICACIONES TÉCNICAS

> **GLOSARIO TÉCNICO:**
> - **RAT**: Registro de Actividades de Tratamiento (Art. 22 Ley 21.719)
> - **EIPD**: Evaluación de Impacto en Protección de Datos (Art. 25 Ley 21.719)
> - **DPIA**: Data Protection Impact Assessment (para algoritmos)
> - **DPA**: Data Processing Agreement (acuerdos procesamiento con terceros)
> - **Tenant**: Empresa cliente multi-inquilino (aislamiento datos)
> - **Cascada**: Efectos automáticos en múltiples módulos del sistema

---

## 🎯 MÓDULO 1: RAT SYSTEM PROFESSIONAL - CREACIÓN RAT COMPLETA

### 📋 ENTRADA Y VALIDACIONES INICIALES

```
🚪 USUARIO ACCEDE: /rat-system
├─ Archivo: RATSystemProfessional.js
├─ Estado inicial: viewMode = 'create', currentStep = 0
└─ Trigger: setIsCreatingRAT(true)

🛡️ IA PREVENTIVA - INTERCEPTOR TOTAL:
├─ Validación autenticación:
│   ├─ useAuth().user → Debe existir en tabla 'users'
│   ├─ user.is_active = true
│   └─ user.tenant_id coincide con currentTenant.id
│
├─ Validación permisos:
│   ├─ user.permissions incluye 'rat.create' O user.is_superuser = true
│   └─ Si falla → Redirect '/unauthorized'
│
├─ Validación límites tenant:
│   ├─ SELECT current_rats_total FROM tenant_usage WHERE tenant_id = X
│   ├─ SELECT max_rats_total FROM tenant_limits WHERE tenant_id = X  
│   ├─ Si current >= max → ERROR "Cuota RATs agotada"
│   └─ Si quedan < 5 → WARNING "Acercándose al límite"
│
├─ Validación empresa configurada:
│   ├─ SELECT * FROM organizaciones WHERE tenant_id = X
│   ├─ Si no existe → AUTO-REDIRECT a configuración empresa
│   └─ Si existe → Cargar datos para auto-completar
│
└─ Validación sesión activa:
    ├─ SELECT * FROM user_sessions WHERE user_id = X AND is_active = true
    ├─ UPDATE last_activity = NOW()
    └─ Si sesión expirada → Solicitar re-autenticación
```

### 📊 PASO 1: IDENTIFICACIÓN RESPONSABLE

**MAPEO EXACTO campos → basedatos.csv:**

```
CAMPOS FORMULARIO                    TABLA DESTINO                    VALIDACIÓN TÉCNICA
─────────────────────────────────────────────────────────────────────────────────────
ratData.responsable.razonSocial  →  organizaciones.razon_social     ✅ VARCHAR(255)
ratData.responsable.rut          →  organizaciones.rut              ✅ VARCHAR(20)
ratData.responsable.direccion    →  organizaciones.direccion        ✅ VARCHAR(500)
ratData.responsable.comuna       →  organizaciones.comuna           ✅ VARCHAR(100)  
ratData.responsable.ciudad       →  organizaciones.ciudad           ✅ VARCHAR(100)
ratData.responsable.email        →  organizaciones.email_contacto   ✅ VARCHAR(255)

ratData.responsable.nombre       →  mapeo_datos_rat.responsable_proceso    ✅ VARCHAR(255)
ratData.responsable.emailDPO     →  mapeo_datos_rat.email_responsable      ✅ VARCHAR(255)
ratData.responsable.telefono     →  mapeo_datos_rat.telefono_responsable   ✅ VARCHAR(50)
ratData.area                     →  mapeo_datos_rat.area_responsable       ✅ VARCHAR(255)

🔄 FLUJO AUTO-COMPLETADO:
1. cargarDatosComunes() ejecuta:
   ├─ SELECT * FROM organizaciones WHERE tenant_id = currentTenant.id ORDER BY created_at DESC LIMIT 1
   ├─ SELECT * FROM mapeo_datos_rat WHERE tenant_id = X ORDER BY created_at DESC LIMIT 1  
   ├─ Si organizacion existe → auto-llenar campos empresa
   ├─ Si último RAT existe → auto-llenar responsable_proceso, email_responsable
   └─ Mantener campos específicos del nuevo RAT vacíos

🛡️ VALIDACIONES TIEMPO REAL:

🔍 Validación RUT (Técnica):
├─ Regex: /^[0-9]+-[0-9Kk]$/
├─ Algoritmo dígito verificador chileno:
│   ├─ Separar número base y dígito verificador
│   ├─ Calcular: suma = Σ(digito × factor) donde factor = [2,3,4,5,6,7,2,3,4...]
│   ├─ resto = suma % 11
│   ├─ dv_calculado = 11 - resto
│   ├─ Si dv_calculado = 11 → dv = 0
│   ├─ Si dv_calculado = 10 → dv = K
│   └─ Comparar dv_calculado con dv_ingresado
├─ SELECT COUNT(*) FROM organizaciones WHERE rut = X AND tenant_id != currentTenant.id
└─ Si duplicado → ERROR "RUT ya registrado en sistema"

🔍 Validación Email:
├─ Regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
├─ DNS check del dominio (opcional)
├─ Verificar no está en lista SPAM conocidos
└─ SELECT COUNT(*) FROM organizaciones WHERE email_contacto = X

🔍 Validación Teléfono Chileno:
├─ Regex móvil: /^(\+56)?[0-9]{8,9}$/
├─ Regex fijo: /^(\+56)?[0-9]{7,8}$/
├─ Auto-formatear: +56 9 XXXX XXXX
└─ Validar código área si es fijo

CASUÍSTICAS CRÍTICAS:

🔄 SI empresa NUEVA (no existe en organizaciones):
    ├─ Mostrar mensaje: "Creando nueva empresa en sistema"
    ├─ Validar todos campos empresa obligatorios
    ├─ Verificar licencias.max_usuarios no excedida
    ├─ Preparar INSERT organizaciones
    └─ Crear tenant_configs por defecto

🔄 SI empresa EXISTENTE:
    ├─ Cargar organizaciones.* → auto-llenar formulario
    ├─ Validar user.empresa_id = organizacion.id (coherencia)
    ├─ Permitir modificar solo campos RAT, no empresa
    └─ Mostrar mensaje: "Usando empresa registrada: {razon_social}"

🔄 SI datos INCOHERENTES:
    ├─ Email personal en empresa corporativa → WARNING
    ├─ Teléfono extranjero en empresa chilena → WARNING  
    ├─ RUT formato incorrecto → ERROR inmediato
    └─ Campos obligatorios vacíos → Deshabilitar "Siguiente"
```

### 📊 PASO 2: CATEGORÍAS DE DATOS

**MAPEO:** `mapeo_datos_rat.categorias_datos` (JSONB)

```
🧠 IA CATEGORIZADOR INTELIGENTE:

ESTRUCTURA JSONB COMPLETA:
{
  "identificacion": {
    "basicos": ["nombre", "apellidos", "rut", "email"],
    "contacto": ["telefono", "direccion", "codigo_postal"],
    "identificadores": ["numero_cliente", "codigo_empleado", "matricula"]
  },
  "sensibles_art14": {
    "salud": ["historial_medico", "diagnosticos", "tratamientos"],
    "biometricos": ["huella_dactilar", "reconocimiento_facial", "voz"],
    "origen": ["raza", "etnia", "nacionalidad"],
    "religion": ["creencias", "afiliacion_religiosa"],
    "ideologia": ["opinion_politica", "sindical"],
    "vida_sexual": ["orientacion", "comportamiento_sexual"]
  },
  "especiales": {
    "menores": ["datos_menores_14", "consentimiento_parental"],
    "trabajadores": ["nomina", "evaluaciones", "disciplinarias"],
    "financieros": ["ingresos", "crediticio", "patrimonio"],
    "ubicacion": ["gps", "ip_address", "geolocation"]
  },
  "tecnicas": {
    "sistemas": ["logs", "metadatos", "cookies"],
    "comportamiento": ["clicks", "navegacion", "preferencias"],
    "dispositivo": ["mac_address", "device_id", "browser_fingerprint"]
  }
}

🔄 ANÁLISIS AUTOMÁTICO POR SELECCIÓN:

SI selecciona "datos_salud":
├─ AUTO-EVALUAR: ¿Es profesional de salud autorizado?
│   ├─ Buscar en metadata si empresa.giro incluye "salud"
│   ├─ Verificar registro profesional si aplicable
│   └─ Si NO autorizado → ERROR crítico
├─ OBLIGATORIO: base_licitud debe ser específica:
│   ├─ "consentimiento" → Requerir proceso informed consent
│   ├─ "interes_vital" → Solo emergencias médicas
│   ├─ "obligacion_legal" → Citar ley específica sanitaria
│   └─ NO permitir "interes_legitimo" para datos salud
├─ AUTO-MARCAR: requiere_eipd = true (OBLIGATORIO Art. 25)
├─ AUTO-CREAR: evaluacion especial "DATOS_SENSIBLES_SALUD"
├─ REQUERIR: medidas seguridad reforzadas
└─ PLAZO MÁXIMO: Según finalidad específica

SI selecciona "biometricos":
├─ AUTO-EVALUAR: ¿Realmente necesarios?
│   ├─ Finalidad debe justificar uso biométrico
│   ├─ Verificar si hay alternativas menos invasivas
│   └─ Requerir documentación técnica específica
├─ OBLIGATORIO: 
│   ├─ base_licitud = "consentimiento" (único válido)
│   ├─ requiere_eipd = true
│   ├─ requiere_dpia = true (decisiones automáticas)
│   └─ Consulta previa Agencia si > 1000 titulares
├─ MEDIDAS TÉCNICAS OBLIGATORIAS:
│   ├─ Encriptación específica biométrica
│   ├─ Almacenamiento separado del resto datos
│   ├─ Hash irreversible + template matching
│   └─ Eliminación segura garantizada
└─ PLAZO MÁXIMO: Estrictamente necesario, revisión anual

SI selecciona "menores_14":
├─ OBLIGATORIO: Consentimiento parental específico
│   ├─ Verificación identidad padre/madre/tutor
│   ├─ Proceso doble verificación  
│   ├─ Derecho revocación facilitado
│   └─ Información adaptada a menores
├─ RESTRICCIONES AUTOMÁTICAS:
│   ├─ NO permitir "interes_legitimo"
│   ├─ NO permitir transferencias internacionales sin garantías específicas
│   ├─ NO permitir perfilado/marketing directo
│   └─ PLAZO MÁXIMO: Hasta mayoría edad + derecho eliminación
├─ AUTO-CREAR: Documentos específicos menores
│   ├─ Formulario consentimiento parental
│   ├─ Información privacy-friendly
│   └─ Procedimiento revocación simplificado
└─ SUPERVISIÓN REFORZADA: Revisión cada 6 meses

SI selecciona "geolocation":
├─ EVALUAR PRECISIÓN:
│   ├─ GPS exacto → ALTO riesgo, requiere_eipd = true
│   ├─ Ciudad/región → MEDIO riesgo
│   ├─ País → BAJO riesgo
│   └─ IP approximate → MÍNIMO riesgo
├─ VALIDAR FINALIDAD:
│   ├─ Seguridad → Justificado, tiempo limitado
│   ├─ Marketing geográfico → Requiere opt-in específico
│   ├─ Análisis estadístico → Anonimización obligatoria
│   └─ Tracking comportamiento → Alto riesgo, EIPD obligatoria
├─ TRANSFERENCIAS ESPECIALES:
│   ├─ Si GPS exacto + transferencia → Autorización Agencia posible
│   ├─ Verificar leyes localización país destino
│   └─ DPA con cláusulas específicas geolocalización
└─ DERECHOS REFORZADOS: Oposición + portabilidad facilitados
```

### 🎯 PASO 3: BASE JURÍDICA (TÉCNICO LEGAL)

```
⚖️ MAPEO BASE LEGAL → mapeo_datos_rat.base_licitud + base_legal

🔄 ANÁLISIS JURÍDICO AUTOMÁTICO:

SI base_licitud = "consentimiento":
├─ VALIDAR ELEMENTOS Art. 12 Ley 21.719:
│   ├─ ¿Libre? → Sin coerción, alternativas disponibles
│   ├─ ¿Específico? → Finalidad concreta, no genérica
│   ├─ ¿Informado? → Información clara y comprensible
│   ├─ ¿Inequívoco? → Acción afirmativa clara
│   └─ ¿Revocable? → Proceso retiro implementado
│
├─ REQUERIR EN base_legal (TEXT):
│   ├─ "Consentimiento obtenido mediante [DESCRIBIR MÉTODO]"
│   ├─ "Información proporcionada incluye: [LISTAR ELEMENTOS]"
│   ├─ "Proceso revocación: [DESCRIBIR PROCEDIMIENTO]"
│   └─ "Almacenamiento evidencia consentimiento: [UBICACIÓN]"
│
├─ AUTO-GENERAR DOCUMENTOS:
│   ├─ Template formulario consentimiento
│   ├─ Aviso privacidad específico
│   ├─ Procedimiento revocación
│   └─ Registro evidencias consentimiento
│
└─ CASUÍSTICA ESPECIAL - Menores:
    ├─ Si categorias_datos incluye "menores" → Consentimiento parental obligatorio
    ├─ Verificación identidad padre/madre/tutor legal
    ├─ Información adaptada comprensión menor
    └─ Derecho eliminación al alcanzar mayoría edad

SI base_licitud = "contrato":
├─ VALIDAR NECESIDAD CONTRACTUAL:
│   ├─ Finalidad debe ser necesaria para ejecutar contrato
│   ├─ No puede ser elemento accesorio del contrato
│   └─ Debe existir contrato válido previo/simultáneo
│
├─ REQUERIR EN base_legal:
│   ├─ "Contrato tipo: [LABORAL/COMERCIAL/SERVICIOS]"
│   ├─ "Cláusula específica: [NÚMERO ARTÍCULO]"
│   ├─ "Necesidad contractual: [JUSTIFICAR NECESIDAD]"
│   └─ "Duración tratamiento: [VIGENCIA CONTRATO + RECLAMOS]"
│
├─ VALIDAR COHERENCIA:
│   ├─ Si contrato laboral → Solo datos necesarios para relación laboral
│   ├─ Si contrato comercial → Solo datos necesarios para prestación
│   ├─ Si contrato servicios → Solo datos del servicio específico
│   └─ NO permitir datos excesivos "por si acaso"
│
└─ AUTO-CALCULAR PLAZO:
    ├─ Durante vigencia contrato
    ├─ + Tiempo reclamos (5 años Código Civil)
    ├─ + Tiempo auditorías si aplicable
    └─ Eliminación automática post-vencimiento

SI base_licitud = "obligacion_legal":
├─ VALIDAR OBLIGACIÓN REAL:
│   ├─ Citar LEY ESPECÍFICA + ARTÍCULO EXACTO
│   ├─ Verificar obligación se aplica a esta empresa
│   ├─ Confirmar datos solicitados son los mínimos necesarios
│   └─ Validar autoridad competente requiere estos datos
│
├─ LEYES FRECUENTES CHILE:
│   ├─ Código Tributario → "Art. 59: Obligación llevar contabilidad"
│   ├─ Código del Trabajo → "Art. 154 bis: Registro asistencia"
│   ├─ Ley Bancos → "Art. 154: Conocimiento clientes"
│   ├─ DL 3.500 (AFP) → "Art. 42: Datos previsionales"
│   └─ Ley 20.000 (Drogas) → "Art. 2: Registro trabajadores sensibles"
│
├─ AUTO-CALCULAR PLAZO LEGAL:
│   ├─ Buscar en base conocimiento: ley → plazo específico
│   ├─ Si no encontrado → Solicitar investigación legal
│   ├─ Crear recordatorios vencimiento automáticos
│   └─ Verificar cambios legislativos periódicos
│
└─ DOCUMENTACIÓN AUTOMÁTICA:
    ├─ Generar fundamentación legal específica
    ├─ Template compliance para auditorías
    └─ Recordatorios verificación normativa anual

SI base_licitud = "interes_legitimo":
├─ OBLIGATORIO TEST BALANCING (Art. 12 f) Ley 21.719):
│   
│ 1️⃣ INTERÉS LEGÍTIMO DE LA EMPRESA:
│   ├─ Describir interés específico y concreto
│   ├─ Demostrar es real y actual (no hipotético)
│   ├─ Validar es legítimo (legal, ético, justificado)
│   └─ Explicar por qué es importante para empresa
│
│ 2️⃣ NECESIDAD DEL TRATAMIENTO:
│   ├─ Demostrar datos son necesarios para interés
│   ├─ Verificar no hay medios menos invasivos
│   ├─ Confirmar proporcionalidad datos vs interés
│   └─ Justificar no se puede lograr sin estos datos
│
│ 3️⃣ IMPACTO EN DERECHOS FUNDAMENTALES:
│   ├─ Evaluar expectativas razonables titular
│   ├─ Considerar relación empresa-titular
│   ├─ Analizar intrusión en vida privada
│   ├─ Verificar impacto en derechos fundamentales
│   └─ Considerar categorías especiales titulares
│
│ ⚖️ BALANZA FINAL:
│   ├─ Peso interés empresa vs Impacto titular
│   ├─ Si balanza FAVORABLE empresa → Permitir continuar
│   ├─ Si balanza EQUILIBRADA → Requiere medidas adicionales
│   ├─ Si balanza DESFAVORABLE → ERROR, cambiar base legal
│   └─ OBLIGATORIO: requiere_eipd = true (siempre para interés legítimo)
│
├─ DOCUMENTAR RESULTADO:
│   ├─ base_legal = "Test balancing realizado [FECHA]"
│   ├─ + "Interés legítimo: [DESCRIPCIÓN ESPECÍFICA]"
│   ├─ + "Evaluación impacto: [RESULTADO BALANZA]"
│   ├─ + "Medidas mitigación: [MEDIDAS IMPLEMENTADAS]"
│   └─ + "Revisión programada: [FECHA PRÓXIMA EVALUACIÓN]"
│
└─ AUTO-EFECTOS OBLIGATORIOS:
    ├─ requiere_eipd = true (SIEMPRE)
    ├─ Derecho oposición OBLIGATORIO implementar
    ├─ Información transparente sobre test realizado
    ├─ Revisión balancing cada 12 meses
    └─ Monitoreo impacto real en titulares
```

### 🎯 PASO 4: FINALIDAD DEL TRATAMIENTO

**MAPEO:** `mapeo_datos_rat.finalidad_principal` + `descripcion`

```
🧠 ANALIZADOR FINALIDAD IA:

🔄 CATEGORIZACIÓN AUTOMÁTICA AVANZADA:

TIPO: "gestion_empleados"
├─ Subcategorías detectadas:
│   ├─ "nomina" → Base: contrato, Riesgo: bajo, Plazo: 5 años post-contrato
│   ├─ "evaluacion_desempeño" → Base: contrato, Riesgo: medio, Revisión anual
│   ├─ "disciplinaria" → Base: contrato, Riesgo: alto, Debido proceso
│   ├─ "salud_ocupacional" → Base: obligacion_legal, Datos sensibles
│   └─ "bienestar" → Base: consentimiento, Opt-in obligatorio
├─ Validaciones automáticas:
│   ├─ Solo datos necesarios para gestión laboral específica
│   ├─ Respetar convenios colectivos aplicables
│   ├─ Derechos laborales específicos protegidos
│   └─ Procedimientos disciplinarios conforme Código Trabajo
└─ AUTO-EFECTOS:
    ├─ Crear template políticas RRHH
    ├─ Configurar alertas cumplimiento laboral
    └─ Integrar con evaluaciones proveedores RRHH

TIPO: "marketing_directo"
├─ Subcategorías:
│   ├─ "email_marketing" → Opt-in específico, Lista Robinson
│   ├─ "llamadas_comerciales" → Horarios, No llamar registry
│   ├─ "publicidad_dirigida" → Perfilado limitado, transparencia
│   ├─ "analisis_comportamiento" → ALTO riesgo, EIPD obligatoria
│   └─ "cross_selling" → Base contractual si cliente existente
├─ Validaciones jurídicas:
│   ├─ Base legal debe ser consentimiento O interés legítimo
│   ├─ Si consentimiento → Proceso opt-in claro
│   ├─ Si interés legítimo → Test balancing obligatorio
│   ├─ Derecho oposición SIEMPRE disponible
│   └─ Información transparente sobre perfilado
├─ OBLIGATORIO implementar:
│   ├─ Proceso opt-out fácil (1 click)
│   ├─ Lista supresión respetada
│   ├─ Segmentación responsable (no discriminatoria)
│   └─ Métricas efectividad vs intrusión
└─ AUTO-EFECTOS:
    ├─ Crear actividad_dpo "Validar legalidad marketing"
    ├─ Configurar revisión efectividad semestral
    ├─ Integrar con herramientas email marketing
    └─ Monitoreo quejas/oposiciones

TIPO: "decisiones_automatizadas"
├─ ⚠️ CATEGORÍA ESPECIAL Art. 24 Ley 21.719:
│   ├─ Prohibidas en principio
│   ├─ Excepciones muy limitadas
│   ├─ Requiere autorización expresa titular
│   └─ Supervisión humana OBLIGATORIA
├─ VALIDACIONES ESTRICTAS:
│   ├─ ¿Decision tiene efectos jurídicos significativos?
│   ├─ ¿Afecta significativamente al titular?
│   ├─ ¿Existe supervisión humana real (no cosmética)?
│   ├─ ¿Titular puede solicitar revisión humana?
│   └─ ¿Hay transparencia sobre lógica aplicada?
├─ DOCUMENTACIÓN TÉCNICA OBLIGATORIA:
│   ├─ Algoritmo utilizado (descripción no-técnica)
│   ├─ Factores considerados en decisión
│   ├─ Proceso supervisión humana implementado
│   ├─ Procedimiento impugnación/revisión
│   └─ Medidas contra sesgos y discriminación
├─ AUTO-MARCAR OBLIGATORIO:
│   ├─ requiere_eipd = true
│   ├─ requiere_dpia = true  
│   ├─ base_licitud debe incluir "autorización expresa" adicional
│   └─ Consulta previa Agencia si impacto alto
└─ AUTO-CREAR DOCUMENTOS:
    ├─ EIPD específica para decisiones automáticas
    ├─ DPIA algoritmos
    ├─ Procedimiento supervisión humana
    └─ Template información Art. 24 para titulares
```

### 🌍 PASO 5: TRANSFERENCIAS INTERNACIONALES (TÉCNICO AVANZADO)

```
🌍 ANALIZADOR TRANSFERENCIAS IA:

PARA CADA DESTINATARIO:
├─ Identificar si es interno/externo
├─ Si externo → Verificar en tabla 'proveedores'
├─ Analizar ubicación geográfica
└─ Evaluar nivel adequación país

🔄 MATRIZ ADEQUACIÓN PAÍSES:

PAÍSES ADEQUADOS (Decisión UE aplicable Chile):
├─ Unión Europea (27 países) → DPA simplificado
├─ Reino Unido → Post-Brexit adequacy decision  
├─ Suiza → Adequacy decision válida
├─ Canadá → PIPEDA adequacy
├─ Japón → Mutual adequacy agreement
├─ Corea del Sur → K-ISMS adequacy
└─ Argentina → Nivel adequado reconocido

PAÍSES CON MARCOS ESPECÍFICOS:
├─ Estados Unidos:
│   ├─ Si empresa certificada Privacy Shield 2.0 → Adequado
│   ├─ Si sector específico (salud/finance) → Verificar certificaciones
│   ├─ Si empresa Fortune 500 → Evaluar políticas corporativas
│   └─ GENERAL → Requiere cláusulas contractuales tipo + DPA reforzado
│
├─ Brasil:
│   ├─ LGPD compatible con LPDP → Marco similar
│   ├─ DPA con cláusulas LGPD específicas
│   └─ Supervisión ANPD equivalente
│
└─ México:
    ├─ LFPDPPP aplicable → Marco existente
    ├─ INAI como autoridad supervisora
    └─ DPA adaptado a legislación mexicana

PAÍSES NO ADEQUADOS (Requieren garantías especiales):
├─ China → Restricciones severas + cláusulas específicas
├─ Rusia → PDPL + localización datos obligatoria
├─ India → PDPB + almacenamiento local requerido
├─ Singapur → PDPA + notificación autoridad local
└─ Otros → Evaluación caso a caso + DPA reforzado

🔄 PARA CADA TRANSFERENCIA:

PASO 1 - Identificar proveedor:
├─ SELECT proveedores.* WHERE id = proveedor_id
├─ Validar proveedores.pais
├─ Verificar proveedores.tipo (procesador/encargado/destinatario)
└─ Evaluar proveedores.evaluacion_seguridad.nivel_riesgo

PASO 2 - Verificar DPA existente:
├─ SELECT dpas.* WHERE proveedor_id = X AND vigencia_fin > NOW()
├─ Si existe y vigente → Validar cláusulas cubren esta transferencia
├─ Si existe pero vence < 90 días → Alerta renovación
├─ Si NO existe → OBLIGATORIO crear DPA antes continuar
└─ Si país no adequado → Verificar cláusulas adicionales

PASO 3 - Evaluación seguridad actualizada:
├─ SELECT evaluaciones_seguridad.* WHERE proveedor_id = X ORDER BY fecha_evaluacion DESC LIMIT 1
├─ Si última evaluación > 12 meses → Marcar "REQUIERE_NUEVA_EVALUACION"
├─ Si puntuación < 70 → ERROR "Proveedor no cumple estándares mínimos"
├─ Si nunca evaluado → OBLIGATORIO evaluar antes transferir
└─ Si país alto riesgo → Evaluación cada 6 meses

PASO 4 - Crear estructura transferencia:
INSERT rat_proveedores:
{
  tenant_id: currentTenant.id,
  rat_id: nuevo_rat.id,
  proveedor_id: proveedor.id,
  tipo_relacion: [
    "PROCESADOR" → Procesa por cuenta empresa,
    "ENCARGADO" → Acceso limitado tareas específicas,
    "DESTINATARIO" → Recibe datos para sus propios fines,
    "CORRESPONSABLE" → Toma decisiones conjunto
  ],
  descripcion_servicio: finalidad_específica_transferencia,
  fecha_inicio: NOW(),
  fecha_fin: fecha_calculada_segun_plazo_conservacion,
  estado: [
    "ACTIVA" → DPA vigente + evaluación ok,
    "PENDIENTE_DPA" → Falta acuerdo,
    "PENDIENTE_EVALUACION" → Falta eval seguridad,
    "SUSPENDIDA" → Problemas detectados
  ]
}

PASO 5 - Actualizar metadata RAT:
UPDATE mapeo_datos_rat.transferencias_internacionales = {
  "tiene_transferencias": true,
  "total_proveedores": count_proveedores,
  "paises_destino": [lista_paises_unicos],
  "nivel_riesgo_transferencias": [
    "BAJO" → Solo países adequados + DPA vigentes,
    "MEDIO" → EEUU con Privacy Shield + DPA,
    "ALTO" → Países no adequados + garantías,
    "CRITICO" → China/Rusia + medidas excepcionales
  ],
  "requiere_autorizacion_agencia": boolean,
  "dpas_requeridas": [lista_dpas_pendientes],
  "evaluaciones_pendientes": [lista_evaluaciones_necesarias],
  "proxima_revision": fecha_revision_transferencias
}
```

### ⏱️ PASO 6: PLAZO CONSERVACIÓN (TÉCNICO JURÍDICO)

```
⏰ CALCULADORA PLAZOS INTELIGENTE:

🔄 ALGORITMO CÁLCULO SEGÚN MÚLTIPLES FACTORES:

FACTOR 1 - Base legal + Ley específica:
├─ obligacion_legal + Código Tributario → 6 años desde ejercicio
├─ obligacion_legal + Código Trabajo → 5 años post-contrato
├─ obligacion_legal + Ley Bancos → 5 años + supervisión bancaria
├─ contrato + comercial → Durante contrato + 5 años reclamos
├─ contrato + laboral → Durante relación + 5 años + convenio colectivo
├─ consentimiento + marketing → Hasta revocación O 24 meses inactividad
├─ consentimiento + salud → Hasta revocación O fin tratamiento médico
└─ interes_legitimo → Solo tiempo estrictamente necesario

FACTOR 2 - Categoría datos sensibles:
├─ Datos básicos → Plazo estándar según base legal
├─ Datos sensibles → Plazo MÁS RESTRICTIVO aplicable
├─ Datos biométricos → Plazo MÍNIMO necesario + justificación anual
├─ Datos menores → Hasta mayoría edad + derecho eliminación
├─ Datos salud → Según tipo: tratamiento/investigación/seguros
└─ Datos genéticos → Plazo MÍNIMO + consentimiento específico renovable

FACTOR 3 - Finalidad específica:
├─ Cumplimiento fiscal → Según ley tributaria específica
├─ Defensa legal → Hasta prescripción acciones (5-10 años)
├─ Investigación → Hasta conclusión + publicación + archivo
├─ Marketing → Máximo 24 meses sin interacción
├─ Seguridad → Mientras persista amenaza específica
└─ Archivo histórico → Solo si base legal lo permite + anonimización

🧮 CÁLCULO AUTOMÁTICO FINAL:
plazo_final = MIN(
  plazo_base_legal,
  plazo_categoria_datos, 
  plazo_finalidad_especifica,
  plazo_maximo_razonable
)

AUTO-EFECTOS PLAZO:
├─ Crear en actividades_dpo:
│   ├─ "REVISION_PLAZO" → 6 meses antes vencimiento
│   ├─ "AVISO_ELIMINACION" → 30 días antes
│   ├─ "ELIMINAR_DATOS" → En fecha exacta
│   └─ "AUDIT_ELIMINACION" → 7 días post-eliminación
│
├─ Configurar recordatorios CalendarView:
│   ├─ Evento "Revisar necesidad conservación" → 50% del plazo
│   ├─ Evento "Preparar eliminación" → 90% del plazo  
│   ├─ Evento "ELIMINAR DATOS" → 100% del plazo
│   └─ Evento "Verificar eliminación" → 107% del plazo
│
└─ UPDATE mapeo_datos_rat.metadata:
    ├─ "fecha_limite_conservacion": fecha_calculada
    ├─ "criterio_eliminacion": descripcion_cuando_eliminar
    ├─ "proceso_eliminacion": procedimiento_tecnico
    └─ "responsable_eliminacion": quien_ejecuta_eliminacion
```

### 🛡️ EVALUACIÓN RIESGO COMPLETA (TÉCNICO ALGORÍTMICO)

```
🧮 ALGORITMO RIESGO MULTI-DIMENSIONAL:

VARIABLE ENTRADA:                    PESO    CÁLCULO
─────────────────────────────────────────────────────────
CATEGORÍAS DATOS:
├─ datos_basicos                     1x      count(basicos) × 1
├─ datos_contacto                    1x      count(contacto) × 1  
├─ datos_financieros                 3x      count(financieros) × 3
├─ datos_sensibles_art14             5x      count(sensibles) × 5
├─ datos_biometricos                 8x      count(biometricos) × 8
├─ datos_geneticos                   10x     count(geneticos) × 10
└─ datos_menores_14                  7x      count(menores) × 7

FINALIDAD TRATAMIENTO:
├─ cumplimiento_legal                0x      0 puntos (riesgo mínimo)
├─ gestion_contractual               1x      1 punto
├─ marketing_basico                  2x      2 puntos
├─ marketing_dirigido                4x      4 puntos  
├─ analisis_comportamiento           6x      6 puntos
├─ perfilado_avanzado               8x      8 puntos
├─ decisiones_automatizadas         10x     10 puntos
└─ investigacion_comportamiento     9x      9 puntos

TRANSFERENCIAS INTERNACIONALES:
├─ solo_chile                        0x      0 puntos
├─ union_europea                     1x      1 punto por país
├─ paises_adequados                  2x      2 puntos por país
├─ eeuu_privacy_shield              3x      3 puntos
├─ eeuu_sin_shield                  5x      5 puntos
├─ paises_marco_similar             4x      4 puntos (Brasil, México)
└─ paises_sin_marco                 8x      8 puntos por país

VOLUMEN PROCESAMIENTO:
├─ menos_100_titulares               0x      0 puntos
├─ 100_1000_titulares               1x      1 punto
├─ 1000_10000_titulares             2x      2 puntos
├─ 10000_100000_titulares           4x      4 puntos
├─ 100000_1000000_titulares         6x      6 puntos  
└─ mas_1000000_titulares            8x      8 puntos

TECNOLOGÍA UTILIZADA:
├─ almacenamiento_simple             0x      0 puntos
├─ bases_datos_relacionales          1x      1 punto
├─ analisis_manual                   1x      1 punto
├─ automatizacion_basica             2x      2 puntos
├─ inteligencia_artificial           6x      6 puntos
├─ machine_learning                  7x      7 puntos
├─ deep_learning                     8x      8 puntos
└─ algoritmos_decisionales           10x     10 puntos

🧮 FÓRMULA FINAL:
riesgo_total = (categorias × peso) + (finalidad × peso) + (transferencias × peso) + (volumen × peso) + (tecnologia × peso)

📊 CLASIFICACIÓN RIESGO:
├─ 0-5 puntos   → RIESGO MÍNIMO
│   ├─ requiere_eipd = false
│   ├─ requiere_dpia = false
│   ├─ proceso_simplificado = true
│   ├─ aprobacion_automatica = true
│   └─ revision_anual = true
│
├─ 6-12 puntos  → RIESGO BAJO  
│   ├─ requiere_eipd = false
│   ├─ revision_dpo_recomendada = true
│   ├─ monitoreo_semestral = true
│   └─ documentacion_basica = true
│
├─ 13-20 puntos → RIESGO MEDIO
│   ├─ requiere_eipd = false (pero recomendada)
│   ├─ revision_dpo_obligatoria = true
│   ├─ monitoreo_trimestral = true
│   ├─ documentacion_reforzada = true
│   └─ medidas_adicionales_recomendadas = true
│
├─ 21-30 puntos → RIESGO ALTO
│   ├─ requiere_eipd = true (OBLIGATORIO)
│   ├─ revision_dpo_previa = true
│   ├─ monitoreo_mensual = true
│   ├─ medidas_mitigacion_obligatorias = true
│   ├─ consulta_agencia_recomendada = true
│   └─ documentacion_exhaustiva = true
│
└─ 31+ puntos   → RIESGO CRÍTICO
    ├─ requiere_eipd = true
    ├─ requiere_dpia = true
    ├─ consulta_previa_agencia = true (OBLIGATORIO)
    ├─ aprobacion_dpo_previa = true
    ├─ medidas_excepcionales = true
    ├─ monitoreo_continuo = true
    ├─ revision_semanal = true
    └─ posible_prohibicion = true

AUTO-EFECTOS POR NIVEL RIESGO:

SI RIESGO ALTO (21-30 puntos):
├─ INSERT generated_documents:
│   ├─ document_type = "EIPD"
│   ├─ status = "BORRADOR"
│   ├─ document_data = template_segun_riesgo + datos_rat
│   └─ rat_id = nuevo_rat.id
│
├─ INSERT actividades_dpo:
│   ├─ tipo_actividad = "REVISAR_EIPD_ALTO_RIESGO"
│   ├─ prioridad = "ALTA"
│   ├─ fecha_vencimiento = NOW() + 15 días
│   ├─ descripcion = "RAT alto riesgo requiere EIPD obligatoria"
│   └─ asignado_a = DPO_principal_tenant
│
├─ INSERT dpo_notifications:
│   ├─ notification_type = "EIPD_REQUERIDA_ALTO_RIESGO"
│   ├─ priority = "ALTA"
│   ├─ message = "Nuevo RAT clasificado ALTO RIESGO - EIPD obligatoria"
│   └─ due_date = NOW() + 15 días
│
└─ UPDATE mapeo_datos_rat.status = "REQUIERE_EIPD"

SI RIESGO CRÍTICO (31+ puntos):
├─ Todo lo anterior +
├─ INSERT dpia (si usa algoritmos):
│   ├─ title = "DPIA para " + nombre_actividad
│   ├─ risk_level = "CRITICO"
│   ├─ status = "REQUIERE_ELABORACION"
│   └─ description = generacion_automatica_contexto
│
├─ INSERT actividades_dpo:
│   ├─ tipo_actividad = "CONSULTA_PREVIA_AGENCIA"
│   ├─ prioridad = "CRITICA"
│   ├─ fecha_vencimiento = NOW() + 30 días
│   ├─ descripcion = "Tratamiento riesgo crítico - Consulta Agencia obligatoria"
│   └─ metadata = {fundamento_legal: "Art. 26 Ley 21.719"}
│
├─ INSERT system_alerts:
│   ├─ alert_type = "RIESGO_CRITICO_DETECTADO"
│   ├─ severity = "CRITICAL"
│   ├─ title = "RAT RIESGO CRÍTICO - Intervención inmediata requerida"
│   └─ description = detalles_riesgo_especifico
│
└─ UPDATE mapeo_datos_rat.status = "REQUIERE_AUTORIZACION_PREVIA"
```

## 📊 MÓDULO REPORTES Y EXPORTACIÓN

### 📄 SUBMÓDULO: GENERADOR REPORTES PDF

```
🎯 REPORTE RAT CONSOLIDADO:

TRIGGER: Usuario solicita "Exportar RAT" desde RATListPage
├─ Botón "Generar PDF" en cada RAT
├─ Acción masiva "Exportar seleccionados"  
└─ API call: /api/v1/reports/rat-pdf/:ratId

🔄 PROCESO GENERACIÓN:

PASO 1 - Recopilar datos completos:
├─ SELECT mapeo_datos_rat.* WHERE id = ratId
├─ SELECT organizaciones.* WHERE id = rat.organizacion_id
├─ SELECT generated_documents.* WHERE rat_id = ratId
├─ SELECT actividades_dpo.* WHERE rat_id = ratId  
├─ SELECT rat_proveedores.* JOIN proveedores WHERE rat_id = ratId
├─ SELECT dpas.* WHERE proveedor_id IN (proveedores_rat)
├─ SELECT evaluaciones_seguridad.* WHERE proveedor_id IN (proveedores_rat)
└─ SELECT audit_log.* WHERE table_name = 'mapeo_datos_rat' AND record_id = ratId

PASO 2 - Generar PDF estructurado:
├─ PORTADA:
│   ├─ Logo empresa + Jurídica Digital
│   ├─ "REGISTRO ACTIVIDADES TRATAMIENTO"
│   ├─ "Conforme Art. 22 Ley 21.719"
│   ├─ Empresa: organizaciones.razon_social
│   ├─ RUT: organizaciones.rut
│   ├─ Fecha generación: NOW()
│   └─ Código único documento: hash_integridad
│
├─ SECCIÓN 1 - IDENTIFICACIÓN RESPONSABLE:
│   ├─ Responsable tratamiento: organizaciones.razon_social
│   ├─ Dirección: organizaciones.direccion + comuna + ciudad
│   ├─ Contacto empresa: organizaciones.email_contacto
│   ├─ Responsable proceso: mapeo_datos_rat.responsable_proceso
│   ├─ Email responsable: mapeo_datos_rat.email_responsable
│   ├─ Teléfono: mapeo_datos_rat.telefono_responsable
│   └─ Área organizacional: mapeo_datos_rat.area_responsable
│
├─ SECCIÓN 2 - DESCRIPCIÓN TRATAMIENTO:
│   ├─ Nombre actividad: mapeo_datos_rat.nombre_actividad
│   ├─ Finalidad principal: mapeo_datos_rat.finalidad_principal
│   ├─ Descripción detallada: mapeo_datos_rat.descripcion
│   ├─ Base de licitud: mapeo_datos_rat.base_licitud
│   ├─ Fundamento legal: mapeo_datos_rat.base_legal
│   └─ Categorías datos: formatear_categorias_jsonb_a_lista
│
├─ SECCIÓN 3 - DESTINATARIOS Y TRANSFERENCIAS:
│   ├─ Destinatarios internos: mapeo_datos_rat.destinatarios_internos
│   ├─ Transferencias internacionales: mapeo_datos_rat.transferencias_internacionales
│   ├─ Para cada proveedor:
│   │   ├─ Nombre: proveedores.nombre
│   │   ├─ País: proveedores.pais
│   │   ├─ DPA vigente: dpas.vigencia_fin
│   │   ├─ Última evaluación: evaluaciones_seguridad.fecha_evaluacion
│   │   └─ Nivel riesgo: evaluaciones_seguridad.nivel_riesgo
│   └─ Tabla resumen transferencias por país
│
├─ SECCIÓN 4 - CONSERVACIÓN Y ELIMINACIÓN:
│   ├─ Plazo conservación: mapeo_datos_rat.plazo_conservacion
│   ├─ Criterios eliminación: metadata.criterio_eliminacion
│   ├─ Proceso eliminación: metadata.proceso_eliminacion
│   ├─ Responsable eliminación: metadata.responsable_eliminacion
│   └─ Próxima revisión: metadata.proxima_revision
│
├─ SECCIÓN 5 - MEDIDAS SEGURIDAD:
│   ├─ Técnicas: mapeo_datos_rat.medidas_seguridad_tecnicas
│   ├─ Organizativas: mapeo_datos_rat.medidas_seguridad_organizativas
│   ├─ Evaluación riesgo: metadata.nivel_riesgo
│   ├─ Factores considerados: metadata.factores_riesgo
│   └─ Medidas mitigación implementadas: metadata.medidas_mitigacion
│
├─ SECCIÓN 6 - DOCUMENTOS ASOCIADOS:
│   ├─ EIPD generada: generated_documents WHERE document_type = 'EIPD'
│   ├─ DPIA algoritmos: generated_documents WHERE document_type = 'DPIA'
│   ├─ DPAs proveedores: dpas WHERE proveedor_id IN (...)
│   ├─ Evaluaciones seguridad: evaluaciones_seguridad WHERE...
│   └─ Enlaces descarga documentos complementarios
│
├─ SECCIÓN 7 - HISTORIAL MODIFICACIONES:
│   ├─ Tabla audit_log filtrada por record_id = ratId
│   ├─ Mostrar fecha, usuario, cambios realizados
│   ├─ Destacar cambios críticos (base legal, categorías)
│   └─ Verificación integridad con hash
│
└─ PIE DOCUMENTO:
    ├─ Firma digital empresa
    ├─ Hash integridad documento: SHA-256
    ├─ Timestamp generación con zona horaria
    ├─ Versión sistema + compliance
    ├─ "Documento generado por Sistema Jurídica Digital"
    └─ "Conforme Ley 21.719 Protección Datos Personales Chile"

PASO 3 - Almacenar y entregar:
├─ INSERT generated_documents:
│   ├─ document_type = "INFORME_RAT_PDF"
│   ├─ document_data = metadata_pdf + ruta_archivo
│   ├─ status = "GENERADO"
│   └─ rat_id = ratId
├─ Subir archivo a storage: /documents/rats/{tenant_id}/{rat_id}/{timestamp}_rat_completo.pdf
├─ Registrar en audit_log: "DOCUMENTO_GENERADO"
└─ Responder con URL descarga temporal (24 horas)
```

### 📊 SUBMÓDULO: EXPORTACIÓN EXCEL MASIVA

```
📈 EXPORTAR MÚLTIPLES RATS A EXCEL:

TRIGGER: Usuario selecciona RATs en RATListPage → "Exportar Excel"

🔄 PROCESO GENERACIÓN EXCEL:

HOJA 1 - "RESUMEN_RATS":
├─ Una fila por RAT con campos principales:
│   ├─ ID, Nombre actividad, Área responsable
│   ├─ Estado, Fecha creación, Última modificación  
│   ├─ Base legal, Finalidad principal
│   ├─ Nivel riesgo, Requiere EIPD/DPIA
│   ├─ Total proveedores, Transferencias internacionales
│   └─ % Completitud, Próxima acción requerida
└─ Filtros Excel automáticos + formato tablas

HOJA 2 - "CATEGORIAS_DATOS":  
├─ RAT_ID | CATEGORIA | SUBCATEGORIA | ES_SENSIBLE | VOLUMEN_ESTIMADO
├─ Expandir mapeo_datos_rat.categorias_datos JSONB
├─ Una fila por cada categoría/subcategoría
├─ Marcar datos sensibles Art. 14
└─ Calcular totales por tipo dato

HOJA 3 - "TRANSFERENCIAS":
├─ RAT_ID | PROVEEDOR | PAIS | TIPO_RELACION | DPA_VIGENTE | EVALUACION
├─ JOIN rat_proveedores + proveedores + dpas + evaluaciones_seguridad
├─ Destacar transferencias vencidas/problemáticas
├─ Calcular transferencias por país
└─ Alertas DPAs próximos vencimiento

HOJA 4 - "CUMPLIMIENTO":
├─ RAT_ID | EIPD_REQUERIDA | EIPD_COMPLETADA | DPIA_REQUERIDA | DPIA_COMPLETADA
├─ Estado tareas DPO asociadas
├─ Fechas límite vs fechas completadas
├─ % Cumplimiento individual por RAT
└─ Identificar RATs con problemas compliance

HOJA 5 - "TIMELINE":
├─ RAT_ID | FECHA | ACCION | USUARIO | DETALLE
├─ Cronología completa desde audit_log
├─ Eventos importantes resaltados
├─ Duración promedio por fase
└─ Identificar cuellos botella proceso

🎨 FORMATO EXCEL PROFESIONAL:
├─ Colores según nivel riesgo
├─ Iconos para estados (✅❌⚠️)  
├─ Gráficos automáticos resumen
├─ Formato condicional alertas
└─ Macro VBA para actualizaciones (opcional)
```

## 🔌 MÓDULO API PARTNERS INTEGRATION

**Archivo:** `APIPartnersIntegration.js` (NUEVO - Solo visible Admin)
**Ruta:** `/admin/api-partners` 
**Tablas:** Todas + `api_partners`, `partner_tokens`, `webhook_configs`

```
🔌 DASHBOARD API PARTNERS:

SECCIÓN 1 - PARTNERS REGISTRADOS:
├─ Lista partners activos con métricas:
│   ├─ Nombre partner (Prelafit, RSM Chile, etc.)
│   ├─ Tipo integración (Full/Limited/ReadOnly)
│   ├─ RATs consumidos (último mes)
│   ├─ Documentos generados (último mes)
│   ├─ Última sincronización
│   ├─ Estado conexión (🟢 Activo / 🔴 Error / ⚠️ Warning)
│   └─ API calls (hoje/semana/mes)
└─ Botón "Agregar Nuevo Partner"

SECCIÓN 2 - CONFIGURACIÓN API KEYS:
├─ Generar nuevas API Keys con scopes específicos:
│   ├─ rats:read → Acceso RATs completados
│   ├─ documents:download → Descargar PDFs/documentos  
│   ├─ analysis:submit → Enviar datos para análisis IA
│   ├─ webhooks:configure → Configurar notificaciones
│   └─ reports:generate → Generar reportes personalizados
├─ Renovación automática keys (cada 90 días)
├─ Revocación inmediata si compromiso
└─ Logs detallados uso por API key

SECCIÓN 3 - WEBHOOKS CONFIGURADOS:
├─ Para cada partner mostrar:
│   ├─ URL webhook configurada
│   ├─ Eventos suscritos (rat_completed, document_generated, etc.)
│   ├─ Últimos deliveries (✅ exitosos / ❌ fallidos)
│   ├─ Retry policy (3 intentos, backoff exponencial)
│   └─ Signature verification (HMAC-SHA256)
├─ Test webhook → Enviar evento prueba
├─ Ver payload logs → Historial envíos
└─ Configurar rate limiting por partner

SECCIÓN 4 - MÉTRICAS CONSUMO:
├─ Dashboard tiempo real:
│   ├─ API calls por minuto/hora/día
│   ├─ Endpoints más utilizados
│   ├─ Partners más activos
│   ├─ Errores por tipo (401, 429, 500)
│   ├─ Latencia promedio respuestas
│   └─ Volumen datos transferidos
├─ Alertas automáticas:
│   ├─ Uso excesivo → Posible abuso
│   ├─ Errores elevados → Problemas integración
│   ├─ Latencia alta → Problemas performance
│   └─ Partner inactivo → Seguimiento comercial
└─ Reportes ejecutivos mensuales

🔄 FLUJO REGISTRO NUEVO PARTNER:

PASO 1 - Información básica:
├─ company_name, contact_email, contact_person
├─ integration_type: ["FULL", "LIMITED", "READONLY", "CUSTOM"]
├─ business_model: ["CONSULTORIA", "SOFTWARE", "AUDITORIA", "LEGAL"]
├─ expected_volume: estimación RATs/mes
└─ contract_duration: duración acuerdo

PASO 2 - Configuración técnica:
├─ Generar API key única + secret
├─ Configurar scopes permitidos
├─ Establecer rate limits según tier
├─ Configurar webhook URLs
└─ Definir formato respuestas (JSON/XML)

PASO 3 - Testing integración:
├─ Endpoint test conectividad
├─ Webhook test delivery
├─ Sample data RATs demo
├─ Validación autenticación
└─ Performance testing básico

PASO 4 - Activación:
├─ INSERT en tabla api_partners
├─ Generar documentación específica partner
├─ Enviar credenciales por canal seguro
├─ Programar follow-up técnico
└─ Activar monitoreo automático
```

### 📊 MÓDULO SINCRONIZACIÓN BIDIRECCIONAL

```
🔄 PARTNER → SISTEMA LPDP:

Partner envía datos cliente para análisis:
POST /api/v1/partners/analyze-client

PAYLOAD EJEMPLO:
{
  "partner_id": "prelafit_compliance",
  "client_data": {
    "empresa": {
      "razon_social": "TechStart Innovación SPA",
      "rut": "76.555.444-3", 
      "industria": "tecnologia",
      "tamaño": "mediana",
      "ubicacion": "Santiago, Chile"
    },
    "tratamiento_propuesto": {
      "actividad": "Análisis comportamiento usuarios app móvil",
      "finalidad": "Mejora experiencia usuario y personalización",
      "categorias_datos": ["navegacion", "ubicacion_aproximada", "preferencias", "dispositivo"],
      "volumen_titulares": 50000,
      "almacenamiento": "AWS Chile",
      "duracion_estimada": "24 meses",
      "decisiones_automatizadas": true,
      "transferencias_internacionales": true,
      "destinos_transferencia": ["Estados Unidos - AWS", "Irlanda - Analytics"]
    }
  }
}

🧠 IA ANÁLISIS AUTOMÁTICO RESPONDE:
{
  "analysis_id": "uuid-analisis",
  "timestamp": "2025-09-02T15:30:00Z",
  "risk_assessment": {
    "nivel_riesgo": "ALTO",
    "puntuacion_detallada": {
      "categorias_datos": 6,      // ubicacion + comportamiento
      "finalidad": 8,             // decisiones automatizadas + perfilado
      "transferencias": 5,        // EEUU + Irlanda
      "volumen": 4,               // 50K usuarios
      "tecnologia": 7,            // decisiones automáticas
      "total": 30                 // = RIESGO ALTO
    }
  },
  "documentos_obligatorios": [
    {
      "tipo": "EIPD",
      "fundamento": "Art. 25 Ley 21.719 - Tratamiento riesgo alto datos comportamiento",
      "plazo_dias": 15,
      "urgencia": "alta",
      "template_disponible": true,
      "costo_generacion": "$150.000 CLP"
    },
    {
      "tipo": "DPIA_ALGORITMOS", 
      "fundamento": "Art. 24 Ley 21.719 - Decisiones automatizadas",
      "plazo_dias": 10,
      "urgencia": "critica",
      "requiere_supervision_humana": true,
      "costo_generacion": "$200.000 CLP"
    }
  ],
  "alertas_criticas": [
    {
      "tipo": "TRANSFERENCIA_EEUU",
      "descripcion": "Transferencia a EEUU requiere DPA específico con cláusulas Privacy Shield 2.0",
      "accion_requerida": "Configurar DPA antes inicio tratamiento",
      "fundamento_legal": "Art. 23 Ley 21.719"
    },
    {
      "tipo": "DECISIONES_AUTOMATIZADAS",
      "descripcion": "Personalización automática constituye decisión automatizada",
      "accion_requerida": "Implementar supervisión humana + derecho revisión",
      "fundamento_legal": "Art. 24 Ley 21.719"
    }
  ],
  "recomendaciones_implementacion": [
    "Implementar consent banner específico para tracking comportamiento",
    "Configurar opt-out fácil para personalización automática", 
    "Establecer DPA con AWS que cubra almacenamiento Chile + procesamiento internacional",
    "Crear procedimiento supervisión humana para decisiones automáticas",
    "Implementar derecho portabilidad datos para usuarios app"
  ],
  "estimacion_costos": {
    "documentos_compliance": "$350.000 CLP",
    "implementacion_tecnica": "$800.000 CLP", 
    "consultoria_legal": "$500.000 CLP",
    "total_proyecto": "$1.650.000 CLP",
    "timeline_estimado": "45 días"
  },
  "next_steps": [
    "1. Partner crea RAT en sistema usando datos analizados",
    "2. Sistema auto-genera EIPD + DPIA templates",
    "3. DPO cliente revisa y aprueba documentos",
    "4. Partner recibe documentos finalizados vía webhook",
    "5. Integración automática en sistema partner"
  ]
}

🔄 SISTEMA LPDP → PARTNER:

Webhook automático cuando RAT completado:
POST {partner_webhook_url}/rat-completed

{
  "event": "rat_completed",
  "timestamp": "2025-09-02T16:00:00Z",
  "signature": "sha256=hash_hmac_verificacion",
  "data": {
    "rat_id": "12345",
    "empresa": {
      "razon_social": "TechStart Innovación SPA",
      "rut": "76.555.444-3",
      "contacto_dpo": "dpo@techstart.cl"
    },
    "proceso_completado": {
      "fecha_inicio": "2025-08-15T10:00:00Z",
      "fecha_finalizacion": "2025-09-02T16:00:00Z", 
      "duracion_dias": 18,
      "etapas_completadas": [
        "RAT_CREADO", "EIPD_GENERADA", "DPO_APROBADO", 
        "DPAS_FIRMADAS", "DOCUMENTOS_FINALIZADOS"
      ]
    },
    "documentos_listos": [
      {
        "tipo": "RAT_PDF_COMPLETO",
        "url": "/api/v1/documents/download/rat-12345.pdf",
        "hash_integridad": "sha256:abcdef...",
        "valido_hasta": "2025-09-09T16:00:00Z"
      },
      {
        "tipo": "EIPD_APROBADA", 
        "url": "/api/v1/documents/download/eipd-12345.pdf",
        "aprobada_por": "María González - DPO",
        "fecha_aprobacion": "2025-09-01T14:30:00Z"
      },
      {
        "tipo": "DPAS_PROVEEDORES",
        "cantidad": 2,
        "proveedores": ["AWS Chile", "Google Analytics"],
        "urls": ["/api/v1/documents/download/dpa-aws.pdf", "/api/v1/documents/download/dpa-google.pdf"]
      }
    ],
    "compliance_final": {
      "nivel_cumplimiento": "COMPLETO",
      "score_compliance": 95,
      "observaciones": [],
      "certificado_listo": true,
      "valido_auditoria": true
    },
    "integracion_partner": {
      "datos_exportables": true,
      "formato_disponible": ["JSON", "PDF", "XML"],
      "api_endpoints_activos": [
        "/api/v1/rats/12345",
        "/api/v1/documents/rat/12345", 
        "/api/v1/compliance/status/12345"
      ]
    }
  }
}
```

## 🔄 CASUÍSTICAS ULTRA-ESPECÍFICAS

### ⚠️ CASUÍSTICA 1: RAT CON DATOS GENÉTICOS

```
🧬 ESCENARIO: Laboratorio clínico - Análisis genético preventivo

DATOS ENTRADA:
├─ empresa.giro = "laboratorio_clinico"
├─ categorias_datos.sensibles = ["geneticos", "salud", "biometricos"]
├─ finalidad = "análisis_genetico_preventivo_cancer"
├─ base_licitud = "consentimiento"
├─ volumen = 5000 pacientes/año

🛡️ IA PREVENTIVA DETECTA → RIESGO CRÍTICO AUTOMÁTICO:

VALIDACIONES ESPECÍFICAS:
├─ ¿Laboratorio autorizado análisis genético? 
│   ├─ Verificar registro ISP (Instituto Salud Pública)
│   ├─ Certificación técnica vigente
│   └─ Personal calificado certificado
├─ ¿Consentimiento específico genético?
│   ├─ Información sobre herencia familiar
│   ├─ Posibles discriminaciones seguros/empleo
│   ├─ Derecho no saber resultados
│   └─ Asesoramiento genético disponible
├─ ¿Medidas seguridad extremas?
│   ├─ Encriptación específica datos genéticos  
│   ├─ Acceso restringido personal autorizado
│   ├─ Auditorías seguridad mensuales
│   └─ Plan contingencia brechas seguridad

AUTO-EFECTOS OBLIGATORIOS:
├─ requiere_eipd = true
├─ requiere_dpia = true (si análisis automatizado)
├─ consulta_previa_agencia = true  
├─ consentimiento_especifico_genetico = true
├─ revision_etica_obligatoria = true
├─ medidas_seguridad_extremas = true
├─ auditoria_trimestral = true
└─ registro_autoridad_sanitaria = true

DOCUMENTOS AUTO-GENERADOS:
├─ EIPD específica análisis genético
├─ Formulario consentimiento genético específico
├─ Protocolo seguridad datos genéticos
├─ Procedimiento asesoramiento genético
├─ Plan gestión resultados inesperados
└─ Protocolo comunicación familiares (herencia)
```

### ⚠️ CASUÍSTICA 2: RAT DECISIONES AUTOMÁTICAS FINANCIERAS

```
💰 ESCENARIO: Banco - Sistema scoring crediticio automático

DATOS ENTRADA:
├─ empresa.giro = "institucion_financiera"
├─ categorias_datos = ["financieros", "crediticios", "laborales", "comportamiento_pago"]
├─ finalidad = "evaluacion_crediticia_automatizada"
├─ base_licitud = "contrato" + "interes_legitimo"
├─ volumen = 100000 evaluaciones/mes
├─ tecnologia = "machine_learning_scoring"

🛡️ IA PREVENTIVA → ANÁLISIS SECTORIAL FINANCIERO:

VALIDACIONES SUPERVISIÓN FINANCIERA:
├─ ¿Autorización CMF (Comisión Mercado Financiero)?
├─ ¿Cumple Normas Generales CMF sobre scoring?
├─ ¿Modelo estadístico validado por Risk Management?
├─ ¿Factores scoring no discriminatorios?
└─ ¿Supervisión humana real implementada?

OBLIGATORIO Art. 24 Ley 21.719:
├─ Decisión automatizada con efectos jurídicos → PROHIBIDA en principio
├─ Excepción: "necesaria para contrato" SI:
│   ├─ Contrato crédito requiere evaluación riesgo
│   ├─ Decisión basada en factores objetivos
│   ├─ Supervisión humana en decisiones límite
│   ├─ Derecho impugnación humana SIEMPRE disponible
│   └─ Transparencia sobre factores considerados

AUTO-EFECTOS REGULATORIOS:
├─ requiere_dpia = true (OBLIGATORIO para algoritmos financieros)
├─ requiere_eipd = true  
├─ supervision_humana_obligatoria = true
├─ transparencia_algoritmo = true
├─ derecho_revision_humana = true
├─ registro_cmf_requerido = true
├─ auditoria_modelo_anual = true
└─ stress_testing_algoritmo = true

DOCUMENTOS FINANCIEROS ESPECÍFICOS:
├─ DPIA algoritmos scoring (template financiero)
├─ Procedimiento supervisión humana scoring
├─ Información Art. 24 para clientes (transparencia algoritmo)
├─ Protocolo impugnación decisiones automatizadas
├─ Plan auditoria interna modelo riesgo
├─ Reporte CMF cumplimiento normativo
└─ Métricas fairness y no discriminación
```

### ⚠️ CASUÍSTICA 3: RAT INVESTIGACIÓN ACADÉMICA

```
🎓 ESCENARIO: Universidad - Investigación comportamiento digital estudiantes

DATOS ENTRADA:
├─ empresa.giro = "educacion_superior"
├─ categorias_datos = ["academicos", "comportamiento", "ubicacion", "dispositivo"]
├─ finalidad = "investigacion_patrones_aprendizaje_digital"
├─ base_licitud = "consentimiento" + "funcion_publica"
├─ volumen = 15000 estudiantes
├─ duracion_proyecto = "36 meses"

🔍 IA PREVENTIVA → ANÁLISIS INVESTIGACIÓN ACADÉMICA:

VALIDACIONES ÉTICAS:
├─ ¿Aprobación Comité Ética universidad?
├─ ¿Consentimiento informado específico investigación?
├─ ¿Beneficio académico justifica recolección?
├─ ¿Medidas anonimización post-investigación?
└─ ¿Derecho retiro participación sin penalización?

MARCO LEGAL INVESTIGACIÓN:
├─ Base legal dual:
│   ├─ consentimiento → Para participación voluntaria
│   ├─ funcion_publica → Para obligaciones educativas básicas
│   └─ Separar claramente qué datos van a cada finalidad
├─ Derechos estudiantiles específicos:
│   ├─ Participación voluntaria sin impacto académico
│   ├─ Retiro investigación sin consecuencias
│   ├─ Información resultados si desean
│   └─ Anonimización garantizada en publicaciones

AUTO-EFECTOS ACADÉMICOS:
├─ requiere_eipd = true (investigación comportamiento = alto riesgo)
├─ consentimiento_investigacion_especifico = true
├─ plan_anonimizacion_obligatorio = true
├─ comite_etica_aprobacion_requerida = true
├─ revision_semestral_continuidad = true
├─ publicacion_resultados_anonimos = true
└─ archivo_datos_post_investigacion = según política universidad

DOCUMENTOS ACADÉMICOS:
├─ Formulario consentimiento investigación específico
├─ EIPD investigación académica (template específico)
├─ Protocolo anonimización datos
├─ Plan publicación resultados
├─ Procedimiento retiro participación
└─ Política archivo datos post-investigación
```

### 🔄 INTEGRACIÓN TOTAL MODULES - EFECTOS CASCADA COMPLETOS

```
🌊 TSUNAMI EFECTOS: Cuando se completa CUALQUIER acción

📊 dataSync.js - SINCRONIZADOR MAESTRO:
├─ Detecta cambio en cualquier tabla
├─ Identifica módulos afectados
├─ Actualiza cache todos los módulos
├─ Notifica cambios vía WebSocket
└─ Valida consistencia entre módulos

useDataSync('ModuleName') en cada componente:
├─ Suscripción automática cambios
├─ Re-render automático cuando datos cambian
├─ Loading states manejados automáticamente
└─ Error handling centralizado

EJEMPLO CASCADA COMPLETA - "DPO Aprueba EIPD":

ACCIÓN: DPO marca EIPD como aprobada en DPOApprovalQueue
│
├─ UPDATE generated_documents.status = 'APROBADA'
├─ UPDATE actividades_dpo.estado = 'completada'  
├─ UPDATE mapeo_datos_rat.estado = 'LISTO_CERTIFICAR'
│
▼ EFECTOS INMEDIATOS EN TODOS LOS MÓDULOS:
│
├─ 📊 DashboardDPO:
│   ├─ eipdsPendientes-- (consulta real-time)
│   ├─ tareasPendientes-- (actividades_dpo count)
│   ├─ cumplimiento++ (recálculo automático)
│   └─ Notificación "EIPD aprobada" (toast verde)
│
├─ 📋 RATListPage:
│   ├─ Estado RAT cambia visualmente "LISTO_CERTIFICAR"
│   ├─ Badge verde + icono check
│   ├─ Habilita botón "Generar Certificado"
│   └─ Actualiza % completitud individual RAT
│
├─ 📈 ComplianceMetrics:
│   ├─ eipdsPendientes-- en gráfico
│   ├─ eipdAprobadas++ en contador
│   ├─ % cumplimiento recalculado formula compleja
│   ├─ Gráfico timeline nueva entrada "EIPD_APROBADA"
│   └─ Proyección compliance actualizada
│
├─ 📊 AdminDashboard:
│   ├─ Métrica tenant "Compliance score" actualizada
│   ├─ Gráfico actividad DPO nueva entrada
│   ├─ Alert positiva "Progreso compliance tenant X"
│   └─ Estadística "EIPDs completadas hoy"++
│
├─ 🔔 NotificationCenter:
│   ├─ Notificación usuario creador RAT: "Su RAT está listo certificar"
│   ├─ Notificación responsable proceso: "EIPD aprobada - siguiente paso certificación"
│   ├─ Notificación admin tenant: "Progreso compliance positivo"
│   └─ Todas marcadas con timestamp y links acción
│
├─ 📅 CalendarView:
│   ├─ Evento "EIPD pendiente" se marca completado
│   ├─ Nuevo evento "Certificar RAT" creado en +7 días
│   ├─ Color evento cambia verde (completado)
│   └─ Actualiza vista mensual con progreso
│
├─ 📋 EIPDCreator:
│   ├─ EIPD ya no aparece en lista "pendientes"
│   ├─ Aparece en lista "aprobadas" 
│   ├─ Status visual "APROBADA" + fecha aprobación
│   └─ Habilita "Ver versión final" (read-only)
│
├─ 🔍 ImmutableAuditLog:
│   ├─ Nueva entrada: "EIPD_APPROVED"
│   ├─ Hash integridad calculado
│   ├─ Cross-reference generated_documents
│   └─ Trazabilidad completa acción DPO
│
├─ 🛡️ DiagnosticCenter:
│   ├─ Métrica "Transacciones exitosas"++
│   ├─ Tiempo resolución EIPD registrado
│   ├─ Efficiency score DPO actualizado  
│   └─ Health score sistema mantiene 100%
│
└─ 🔌 API Partners:
    ├─ Webhook enviado a partners suscritos
    ├─ Endpoint /api/v1/rats/12345 actualizado
    ├─ Documento disponible para descarga partners
    └─ Métricas API usage actualizadas
```

---

## 🎯 VALIDACIÓN FINAL IMPLEMENTACIÓN

**✅ FUNCIONALIDADES VERIFICADAS EXISTENTES:**
- ✅ Auto-completado datos empresa desde tabla organizaciones
- ✅ Sincronización datos entre módulos (dataSync.js)
- ✅ Preventive AI Controller activo
- ✅ Multi-tenant isolation implementado
- ✅ Audit log inmutable funcionando

**❌ FUNCIONALIDADES PENDIENTES IMPLEMENTAR:**
- ❌ Algoritmo cálculo riesgo automático
- ❌ Auto-generación EIPD cuando riesgo alto
- ❌ Auto-creación actividades_dpo
- ❌ Validación RUT chileno
- ❌ Test balancing interés legítimo
- ❌ Generación reportes PDF
- ❌ API Partners dashboard
- ❌ Webhook sistema partners

**🔧 TABLAS FALTANTES basedatos.csv:**
- ❌ inventario_rats
- ❌ system_alerts  
- ❌ api_partners
- ❌ partner_tokens
- ❌ webhook_configs

---

**📋 RESUMEN TÉCNICO:**
El diagrama muestra el sistema como debe funcionar COMPLETO. Cada input genera efectos en cascada verificables, cada campo mapea a tabla específica basedatos.csv, y cada casuística tiene su flujo detallado. La implementación actual está ~70% completa, faltando automatizaciones críticas y tablas específicas.