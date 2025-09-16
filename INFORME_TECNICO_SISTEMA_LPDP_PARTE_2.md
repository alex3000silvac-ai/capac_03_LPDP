# INFORME TÉCNICO COMPLETO - SISTEMA LPDP
## PARTE 2 DE 3: AUTENTICACIÓN, BACKEND Y REPORTES

---

# 4. SISTEMA DE AUTENTICACIÓN Y SEGURIDAD

## 4.1 Arquitectura de Autenticación

### Flujo de Autenticación Completo
```
1. Usuario ingresa credenciales → Login.js
2. Validación frontend → AuthContext
3. Llamada a Supabase Auth → supabaseConfig.js
4. Validación de credenciales → Supabase Backend
5. Generación de JWT → Supabase Auth
6. Obtención de datos de usuario → tabla usuarios
7. Establecimiento de sesión → AuthContext
8. Carga de tenant → TenantContext
9. Activación de RLS → Políticas de base de datos
10. Acceso autorizado → Aplicación
```

## 4.2 Configuración de Supabase

### supabaseConfig.js - Configuración Principal
```javascript
const supabaseUrl = 'https://vkyhsnlivgwgrhdbvynm.supabase.co';
const supabaseAnonKey = atob('ZXlKaGJHY2lPaUpJVXpJMU5pSXNJb...'); // Clave codificada

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { 
    autoRefreshToken: true, 
    persistSession: true 
  }
});
```

### Funciones de Autenticación

#### signIn(email, password)
**Propósito**: Autenticación de usuario
**Proceso**:
1. Llama a `supabase.auth.signInWithPassword()`
2. Si es exitoso, obtiene datos del usuario desde tabla `usuarios`
3. Incluye datos de la organización mediante JOIN
4. Retorna objeto completo del usuario

```javascript
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ 
    email, password 
  });
  
  if (error) return { success: false, error: error.message };
  
  const { data: userData } = await supabase
    .from('usuarios')
    .select('*, organizaciones(*)')
    .eq('id', data.user.id)
    .single();
    
  return { 
    success: true, 
    user: { ...data.user, ...userData }, 
    session: data.session 
  };
};
```

#### signUp(email, password, userData)
**Propósito**: Registro de nuevo usuario
**Proceso**:
1. Crea usuario en Supabase Auth
2. Crea registro en tabla `usuarios`
3. Asigna `tenant_id` (puede ser heredado o nuevo)
4. Establece rol por defecto como 'admin'

#### getCurrentUser()
**Propósito**: Obtener usuario autenticado actual
**Características**:
- Obtiene usuario de sesión activa
- Enriquece con datos de tabla `usuarios`
- Incluye datos de organización
- Retorna `null` si no hay sesión

## 4.3 Contexto de Autenticación

### AuthContext.js - Gestión de Estado
```javascript
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuchar cambios de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const userData = await getCurrentUser();
          setUser(userData);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => authListener?.subscription.unsubscribe();
  }, []);
};
```

### Estado de Usuario
```javascript
{
  // Datos de Supabase Auth
  id: "uuid",
  email: "usuario@empresa.cl",
  email_confirmed_at: "timestamp",
  
  // Datos de tabla usuarios
  tenant_id: "uuid",
  nombre: "Juan",
  apellidos: "Pérez",
  rol: "admin",
  cargo: "DPO",
  
  // Datos de organización
  organizaciones: {
    razon_social: "Empresa SA",
    rut_empresa: "12345678-9"
  }
}
```

## 4.4 Row Level Security (RLS)

### Políticas por Tabla

#### Organizaciones
```sql
CREATE POLICY "tenant_isolation_organizaciones" ON organizaciones
FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM usuarios WHERE id = auth.uid())
);
```

#### Usuarios
```sql
CREATE POLICY "tenant_isolation_usuarios" ON usuarios
FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM usuarios WHERE id = auth.uid()) OR
    id = auth.uid()
);
```

#### RATs
```sql
CREATE POLICY "tenant_isolation_rats" ON rats
FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM usuarios WHERE id = auth.uid())
);
```

### Función de Seguridad
```sql
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT tenant_id FROM usuarios WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 4.5 Manejo de Sesiones

### Persistencia de Sesión
- **Local Storage**: JWT token almacenado automáticamente
- **Auto-refresh**: Renovación automática de tokens
- **Expiración**: Manejo de tokens expirados
- **Logout**: Limpieza completa de sesión

### Rutas Protegidas
```javascript
if (!user) {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
```

---

# 5. MÓDULO BACKEND - APIs Y SERVICIOS

## 5.1 APIs del Sistema

### authAPI.js
**Propósito**: Gestión de autenticación y usuarios

**Endpoints Simulados**:
- `login(credentials)` - Autenticación
- `logout()` - Cierre de sesión  
- `refreshToken()` - Renovación de token
- `getUserProfile(id)` - Perfil de usuario
- `updateUserProfile(id, data)` - Actualización de perfil

### complianceAPI.js
**Propósito**: Gestión de cumplimiento normativo

**Funcionalidades**:
```javascript
export const complianceAPI = {
  // Obtener métricas de cumplimiento
  async getComplianceMetrics(tenantId) {
    const { data, error } = await supabase
      .from('rats')
      .select('estado, created_at')
      .eq('tenant_id', tenantId);
    
    return this.calculateMetrics(data);
  },
  
  // Verificar estado de cumplimiento
  async checkComplianceStatus(ratId) {
    // Lógica de verificación
  },
  
  // Generar alertas de cumplimiento
  async generateComplianceAlerts(tenantId) {
    // Lógica de alertas
  }
};
```

### dataAPI.js
**Propósito**: API principal de datos

**Métodos Principales**:
- `fetchData(table, filters)` - Obtener datos con filtros
- `createRecord(table, data)` - Crear registro
- `updateRecord(table, id, data)` - Actualizar registro
- `deleteRecord(table, id)` - Eliminar registro
- `bulkOperation(operations)` - Operaciones en lote

### documentsAPI.js
**Propósito**: Gestión de documentos generados

**Funcionalidades**:
- Almacenar documentos PDF generados
- Gestionar plantillas de documentos
- Control de versiones de documentos
- Metadatos de documentos

## 5.2 Servicios de Negocio

### ratIntelligenceEngine.js (25,734 líneas)
**Propósito**: Motor de inteligencia para RAT

**Funcionalidades Principales**:

#### 1. Análisis Automático de Datos
```javascript
const analyzeDataCategories = (inputData) => {
  // Analiza texto ingresado para sugerir categorías
  const suggestions = {
    datosIdentificativos: detectIdentifyingData(inputData),
    datosSensibles: detectSensitiveData(inputData),
    finalidades: suggestPurposes(inputData)
  };
  
  return suggestions;
};
```

#### 2. Sugerencias Inteligentes
- **Base Legal**: Sugiere base legal según tipo de tratamiento
- **Medidas de Seguridad**: Propone medidas según categoría de datos
- **Plazos de Conservación**: Sugiere plazos según industria
- **Transferencias**: Detecta necesidad de transferencias internacionales

#### 3. Validaciones Automáticas
```javascript
const validateRAT = (ratData) => {
  const validations = {
    completeness: checkCompleteness(ratData),
    consistency: checkConsistency(ratData),
    compliance: checkCompliance(ratData),
    risks: assessRisks(ratData)
  };
  
  return validations;
};
```

### riskCalculationEngine.js (18,809 líneas)
**Propósito**: Motor de cálculo de riesgos

**Algoritmo de Riesgo**:
```javascript
const calculateRisk = (dataCategories, purposes, transfersAbroad) => {
  let baseRisk = 1;
  
  // Factor por categoría de datos
  if (dataCategories.includes('sensibles')) baseRisk += 3;
  if (dataCategories.includes('biometricos')) baseRisk += 4;
  
  // Factor por finalidad
  if (purposes.includes('perfilado')) baseRisk += 2;
  if (purposes.includes('automatizacion')) baseRisk += 2;
  
  // Factor por transferencias
  if (transfersAbroad) baseRisk += 2;
  
  return Math.min(baseRisk, 5); // Máximo 5
};
```

### categoryAnalysisEngine.js (14,061 líneas)
**Propósito**: Análisis de categorías de datos

**Funcionalidades**:
- Clasificación automática de datos personales
- Detección de datos sensibles
- Sugerencias de categorías por industria
- Mapeo con estándares internacionales

### industryStandardsService.js (13,650 líneas)
**Propósito**: Estándares por industria

**Configuración por Sector**:
```javascript
const industryConfigs = {
  financiero: {
    requiredDataCategories: ['identificativos', 'financieros'],
    mandatoryPurposes: ['verificacion_identidad', 'evaluacion_crediticia'],
    retentionPeriods: {
      default: '10 años',
      contractual: '5 años después del término del contrato'
    },
    securityMeasures: ['cifrado', 'control_acceso', 'auditoria']
  },
  
  salud: {
    requiredDataCategories: ['identificativos', 'salud'],
    mandatoryPurposes: ['atencion_medica', 'historial_clinico'],
    retentionPeriods: {
      default: '15 años',
      emergency: 'Permanente'
    },
    securityMeasures: ['cifrado_avanzado', 'acceso_restringido', 'backup_seguro']
  }
};
```

### proveedoresService.js (14,711 líneas)
**Propósito**: Gestión completa de proveedores

**Funcionalidades Avanzadas**:

#### 1. Evaluación de Riesgos de Proveedores
```javascript
const evaluateProviderRisk = (provider) => {
  const riskFactors = {
    dataAccess: assessDataAccess(provider.categoria_datos),
    geography: assessGeographicRisk(provider.pais),
    certifications: assessCertifications(provider.certificaciones),
    contractual: assessContractualSafeguards(provider.tiene_dpa)
  };
  
  return calculateOverallRisk(riskFactors);
};
```

#### 2. Gestión de DPA (Data Processing Agreement)
- Generación automática de DPA
- Seguimiento de vencimientos
- Alertas de renovación
- Validación de cláusulas obligatorias

#### 3. Monitoreo Continuo
- Verificación periódica de certificaciones
- Alertas de cambios en proveedores
- Auditorías programadas
- Reportes de cumplimiento

## 5.3 Motor de Sincronización

### dataSync.js (8,265 líneas)
**Propósito**: Sincronización de datos entre módulos

**Tipos de Sincronización**:

#### 1. Sincronización en Tiempo Real
```javascript
const realTimeSync = () => {
  supabase
    .channel('public:rats')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'rats' },
      (payload) => {
        updateLocalCache(payload);
        notifyComponents(payload);
      }
    )
    .subscribe();
};
```

#### 2. Sincronización Batch
- Procesamiento nocturno de datos
- Consolidación de métricas
- Limpieza de datos obsoletos
- Generación de reportes programados

#### 3. Sincronización con Partners
```javascript
const syncWithPartners = async (partnerData) => {
  try {
    const result = await partnerSyncEngine.processData(partnerData);
    await updateLocalDatabase(result);
    await generateSyncReport(result);
  } catch (error) {
    await handleSyncError(error);
  }
};
```

---

# 6. GENERACIÓN DE REPORTES (EXCEL, PDF, JSON)

## 6.1 ReportGenerator.js - Análisis Detallado

### Arquitectura del Generador
```javascript
const ReportGenerator = () => {
  const [reportType, setReportType] = useState('rat_consolidado');
  const [reportConfig, setReportConfig] = useState({
    incluirEIPDs: true,
    incluirProveedores: true,
    incluirAuditoria: false,
    formato: 'pdf',
    idioma: 'es'
  });
};
```

### Tipos de Reportes Disponibles

#### 1. RAT Consolidado
**Contenido**:
- Lista completa de RAT
- Estado de cada RAT
- Responsables asignados
- Fechas de creación y actualización
- Nivel de riesgo calculado

**Formato PDF**:
```javascript
const generateRATConsolidatedPDF = async (ratsData) => {
  const pdf = new jsPDF();
  
  // Header corporativo
  pdf.setFontSize(16);
  pdf.text('REGISTRO DE ACTIVIDADES DE TRATAMIENTO', 20, 20);
  pdf.text('INFORME CONSOLIDADO', 20, 30);
  
  // Tabla con autoTable
  pdf.autoTable({
    head: [['Código RAT', 'Actividad', 'Responsable', 'Estado', 'Riesgo']],
    body: ratsData.map(rat => [
      rat.codigo_rat,
      rat.nombre_actividad,
      rat.responsable_tratamiento,
      rat.estado,
      calculateRiskLevel(rat)
    ]),
    startY: 50,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [51, 122, 183] }
  });
  
  return pdf.output('blob');
};
```

**Formato Excel**:
```javascript
const generateRATConsolidatedExcel = async (ratsData) => {
  const workbook = XLSX.utils.book_new();
  
  // Hoja principal con RATs
  const ratSheet = XLSX.utils.json_to_sheet(ratsData.map(rat => ({
    'Código RAT': rat.codigo_rat,
    'Nombre Actividad': rat.nombre_actividad,
    'Responsable': rat.responsable_tratamiento,
    'Estado': rat.estado,
    'Fecha Creación': formatDate(rat.created_at),
    'Nivel Riesgo': calculateRiskLevel(rat)
  })));
  
  XLSX.utils.book_append_sheet(workbook, ratSheet, 'RATs');
  
  // Hoja de métricas
  const metricsSheet = XLSX.utils.json_to_sheet([
    { Métrica: 'Total RATs', Valor: ratsData.length },
    { Métrica: 'RATs Aprobados', Valor: ratsData.filter(r => r.estado === 'aprobado').length },
    { Métrica: 'RATs en Borrador', Valor: ratsData.filter(r => r.estado === 'borrador').length }
  ]);
  
  XLSX.utils.book_append_sheet(workbook, metricsSheet, 'Métricas');
  
  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
};
```

#### 2. EIPD Detallado
**Contenido**:
- Evaluaciones de impacto realizadas
- Riesgos identificados por EIPD
- Medidas de mitigación implementadas
- Estado de consultas a autoridad

#### 3. Reporte de Proveedores
**Contenido**:
- Lista de proveedores activos
- Estado de DPA por proveedor
- Vencimientos próximos
- Niveles de riesgo asignados
- Certificaciones vigentes

#### 4. Métricas de Cumplimiento
**Contenido**:
- Porcentaje de RATs completados
- Tiempo promedio de aprobación
- EIPDs pendientes
- Alertas de cumplimiento
- Tendencias mensuales

#### 5. Reporte de Auditoría
**Contenido**:
- Log de actividades por usuario
- Cambios realizados en RATs
- Accesos al sistema
- Exportaciones realizadas
- Alertas de seguridad

## 6.2 Plantillas de Documentos

### Plantilla PDF Corporativa
```javascript
const corporateTemplate = {
  header: {
    logo: 'data:image/png;base64,...',
    title: 'Sistema LPDP',
    subtitle: 'Ley de Protección de Datos Personales'
  },
  
  footer: {
    pageNumbers: true,
    generatedDate: true,
    confidentialityNotice: 'Documento Confidencial - Uso Interno'
  },
  
  styles: {
    primaryColor: '#343a40',
    secondaryColor: '#6c757d',
    accentColor: '#007bff',
    fontFamily: 'Helvetica',
    fontSize: 10
  }
};
```

### Generación Dinámica de Contenido
```javascript
const generateDynamicContent = (reportType, data, config) => {
  const contentGenerators = {
    rat_consolidado: generateRATContent,
    eipd_detallado: generateEIPDContent,
    proveedores: generateProvidersContent,
    cumplimiento: generateComplianceContent,
    auditoria: generateAuditContent
  };
  
  return contentGenerators[reportType](data, config);
};
```

## 6.3 Exportación JSON

### Estructura de Exportación
```javascript
const generateJSONExport = async (exportType, filters) => {
  const exportData = {
    metadata: {
      generated_at: new Date().toISOString(),
      generated_by: currentUser.email,
      export_type: exportType,
      tenant_id: currentTenant.id,
      filters: filters,
      version: '1.0'
    },
    
    data: await fetchExportData(exportType, filters),
    
    summary: {
      total_records: 0,
      date_range: calculateDateRange(filters),
      included_tables: getIncludedTables(exportType)
    }
  };
  
  // Calcular resumen
  exportData.summary.total_records = calculateTotalRecords(exportData.data);
  
  return JSON.stringify(exportData, null, 2);
};
```

### Formatos de Exportación JSON

#### Exportación Completa de RAT
```json
{
  "metadata": {
    "generated_at": "2024-09-12T21:00:00Z",
    "generated_by": "admin@empresa.cl",
    "export_type": "rat_complete",
    "tenant_id": "uuid-tenant",
    "version": "1.0"
  },
  "data": {
    "rats": [
      {
        "id": "uuid-rat",
        "codigo_rat": "RAT-001",
        "nombre_actividad": "Gestión de Clientes",
        "categorias_datos": [
          {
            "categoria": "Datos Identificativos",
            "tipos": ["nombre", "rut", "email"],
            "es_sensible": false
          }
        ],
        "finalidades": [
          {
            "finalidad": "Gestión comercial",
            "base_legal": "Consentimiento"
          }
        ]
      }
    ],
    "eipds": [...],
    "proveedores": [...]
  },
  "summary": {
    "total_records": 150,
    "date_range": "2024-01-01 to 2024-09-12",
    "included_tables": ["rats", "eipds", "proveedores"]
  }
}
```

## 6.4 Sistema de Plantillas

### Motor de Plantillas
```javascript
const templateEngine = {
  // Procesar plantilla con datos
  processTemplate(template, data) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
  },
  
  // Aplicar formato condicional
  applyConditionalFormatting(content, conditions) {
    conditions.forEach(condition => {
      if (condition.test(content)) {
        content = condition.apply(content);
      }
    });
    return content;
  },
  
  // Generar tabla dinámica
  generateDynamicTable(headers, rows, styles) {
    // Lógica de generación de tabla
  }
};
```

### Personalización por Organización
```javascript
const getOrganizationTemplate = async (tenantId) => {
  const { data } = await supabase
    .from('organization_templates')
    .select('template_config')
    .eq('tenant_id', tenantId)
    .single();
    
  return data?.template_config || defaultTemplate;
};
```

---

**FIN DE LA PARTE 2**

**Continúa en**: INFORME_TECNICO_SISTEMA_LPDP_PARTE_3.md