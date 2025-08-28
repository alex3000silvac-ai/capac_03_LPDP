/**
 * GENERADOR DE PLANTILLAS EXCEL PARA MAPEO DE DATOS
 * Sistema RAT PRODUCCIÓN - Ley 21.719 Chile
 * 
 * Particularidades específicas de la ley chilena vs RGPD:
 * 1. DATOS SOCIOECONÓMICOS como categoría sensible especial
 * 2. Representante legal obligatorio para empresas extranjeras
 * 3. 8 campos específicos del RAT según artículo 12
 * 4. Transferencias requieren "nivel adecuado" o "garantías"
 */

import { INDUSTRY_TEMPLATES } from '../data/industryTemplates';
import * as XLSX from 'xlsx';

// Estructura Excel para mapeo completo de datos
const EXCEL_STRUCTURE = {
  // Hoja 1: Información General de la Empresa
  empresa_info: {
    name: 'Información Empresa',
    headers: [
      'Campo',
      'Valor',
      'Observaciones',
      'Obligatorio Ley 21.719'
    ],
    data: [
      ['Razón Social', '', 'Nombre completo de la empresa', 'SÍ'],
      ['RUT', '', 'RUT de la empresa sin puntos ni guión', 'SÍ'],
      ['Dirección', '', 'Dirección completa', 'SÍ'],
      ['Email de Contacto', '', 'Email principal DPO/Responsable', 'SÍ'],
      ['Teléfono', '', 'Teléfono de contacto', 'SÍ'],
      ['Industria', '', 'Sector económico principal', 'NO'],
      ['¿Es Empresa Extranjera?', '', 'SÍ/NO - Si es SÍ, requiere representante legal en Chile', 'SÍ'],
      ['Representante Legal en Chile', '', 'Solo si es empresa extranjera', 'CONDICIONAL'],
      ['Contacto Representante Legal', '', 'Email y teléfono del representante', 'CONDICIONAL'],
      ['Número de Empleados', '', 'Total de trabajadores', 'NO'],
      ['Fecha de Implementación', '', 'Cuándo comenzará a cumplir la ley', 'NO']
    ]
  },

  // Hoja 2: Inventario de Actividades de Tratamiento
  inventario_actividades: {
    name: 'Inventario Actividades',
    headers: [
      'ID Actividad',
      'Nombre de la Actividad',
      'Departamento/Área Responsable',
      'Descripción Detallada',
      'Finalidad del Tratamiento',
      'Base Legal (Art. 4 Ley 21.719)',
      '¿Basado en Consentimiento?',
      'Información Retiro Consentimiento',
      'Estado',
      'Prioridad',
      'Observaciones'
    ],
    validation: {
      'Base Legal (Art. 4 Ley 21.719)': [
        'Consentimiento del titular',
        'Ejecución de un contrato',
        'Obligación legal',
        'Interés vital del titular', 
        'Tarea de interés público',
        'Interés legítimo'
      ],
      'Estado': ['Por inventariar', 'En proceso', 'Completado', 'Pendiente revisión'],
      'Prioridad': ['Alta', 'Media', 'Baja']
    }
  },

  // Hoja 3: Categorías de Titulares (Quiénes)
  categorias_titulares: {
    name: 'Categorías Titulares',
    headers: [
      'ID Actividad',
      'Categoría de Titular',
      'Descripción',
      'Cantidad Aproximada',
      '¿Incluye Menores de Edad?',
      'Observaciones Especiales'
    ],
    data_examples: [
      ['ACT-001', 'Empleados', 'Personal de planta y contrata', '150', 'NO', ''],
      ['ACT-001', 'Candidatos a empleo', 'Postulantes a vacantes', 'Variable', 'Posible', 'Datos por 6 meses si no es contratado'],
      ['ACT-002', 'Clientes', 'Personas que compran nuestros productos', '5000', 'SÍ', 'Algunos menores con autorización de padres'],
      ['ACT-003', 'Proveedores', 'Empresas que nos proveen servicios', '100', 'NO', 'Solo personas de contacto'],
      ['ACT-004', 'Usuarios web', 'Visitantes del sitio web', 'Variable', 'Posible', 'Cookies y análisis web']
    ]
  },

  // Hoja 4: Categorías de Datos (Qué datos)
  categorias_datos: {
    name: 'Categorías Datos',
    headers: [
      'ID Actividad',
      'Categoría de Datos',
      'Tipos Específicos',
      '¿Es Dato Sensible?',
      'Justificación si es Sensible',
      'Sistema donde se Almacena',
      'Formato (Digital/Papel)',
      'Observaciones'
    ],
    data_examples: [
      ['ACT-001', 'Datos de Identificación', 'RUT, Nombre, Apellidos, Fecha Nacimiento', 'NO', '', 'Sistema RRHH', 'Digital', ''],
      ['ACT-001', 'Datos de Contacto', 'Email, Teléfono, Dirección', 'NO', '', 'Sistema RRHH', 'Digital', ''],
      ['ACT-001', 'Datos Laborales', 'Cargo, Sueldo, Evaluaciones', 'NO', '', 'Sistema RRHH', 'Digital', ''],
      ['ACT-001', 'Datos de Salud', 'Exámenes preocupacionales, Licencias médicas', 'SÍ', 'Art. 2 lit. g - salud', 'Sistema RRHH', 'Digital', 'Acceso restringido'],
      ['ACT-001', 'Datos Socioeconómicos', 'Nivel de ingresos, Cargas familiares', 'SÍ', 'PARTICULARIDAD CHILE: Art. 2 lit. g', 'Sistema RRHH', 'Digital', 'SENSIBLE según ley chilena'],
      ['ACT-002', 'Datos Financieros', 'Tarjetas de crédito, Historial pagos', 'NO', '', 'Sistema POS', 'Digital', 'Cifrados'],
      ['ACT-003', 'Datos Biométricos', 'Huella dactilar, Reconocimiento facial', 'SÍ', 'Art. 2 lit. g - biométricos', 'Sistema Acceso', 'Digital', 'Control de acceso']
    ],
    validation: {
      '¿Es Dato Sensible?': ['SÍ', 'NO'],
      'Formato (Digital/Papel)': ['Digital', 'Papel', 'Ambos']
    }
  },

  // Hoja 5: Fuentes de Datos
  fuentes_datos: {
    name: 'Fuentes de Datos',
    headers: [
      'ID Actividad',
      'Fuente de los Datos',
      'Descripción de la Fuente',
      '¿Es Fuente Pública?',
      'Método de Recolección',
      'Frecuencia de Actualización',
      'Observaciones'
    ],
    data_examples: [
      ['ACT-001', 'Directamente del titular', 'Postulante llena formulario de empleo', 'NO', 'Formulario físico/digital', 'Una vez', ''],
      ['ACT-001', 'Mutual de seguridad', 'Exámenes ocupacionales', 'NO', 'Informe médico', 'Anual', 'Tercero autorizado'],
      ['ACT-002', 'Directamente del titular', 'Cliente proporciona datos en compra', 'NO', 'Formulario web/tienda', 'Cada compra', ''],
      ['ACT-003', 'Registro de proveedores SII', 'Consulta automática RUT', 'SÍ', 'API SII', 'Mensual', 'Verificación tributaria'],
      ['ACT-004', 'Google Analytics', 'Datos de navegación web', 'NO', 'Cookies y tracking', 'Continua', 'Tercero - Google']
    ],
    validation: {
      '¿Es Fuente Pública?': ['SÍ', 'NO']
    }
  },

  // Hoja 6: Transferencias Internacionales
  transferencias_internacionales: {
    name: 'Transferencias Internacionales',
    headers: [
      'ID Actividad',
      'País de Destino',
      'Receptor de los Datos',
      'Finalidad de la Transferencia',
      '¿País con Nivel Adecuado?',
      'Garantías Implementadas',
      'Tipo de Garantía',
      'Fecha Implementación',
      'Observaciones'
    ],
    data_examples: [
      ['ACT-004', 'Estados Unidos', 'Google LLC', 'Análisis web y marketing', 'NO', 'Cláusulas Contractuales Tipo', 'CCT', '2024-01-01', 'Google Ads y Analytics'],
      ['ACT-002', 'Estados Unidos', 'Mailchimp', 'Marketing por email', 'NO', 'Cláusulas Contractuales Tipo', 'CCT', '2024-01-01', 'Newsletter y campañas'],
      ['ACT-005', 'España', 'Servidor Cloud AWS', 'Almacenamiento en la nube', 'SÍ', 'Decisión de adecuación UE', 'Decisión adecuación', '2024-01-01', 'Dentro de UE'],
      ['ACT-006', 'Singapur', 'Proveedor SaaS', 'Sistema de gestión', 'NO', 'Normas Corporativas Vinculantes', 'NCV', '2024-01-01', 'Multinacional certificada']
    ],
    validation: {
      '¿País con Nivel Adecuado?': ['SÍ', 'NO', 'No determinado'],
      'Tipo de Garantía': [
        'Cláusulas Contractuales Tipo',
        'Normas Corporativas Vinculantes',
        'Decisión de adecuación',
        'Certificación',
        'Código de conducta',
        'Otro'
      ]
    }
  },

  // Hoja 7: Períodos de Conservación
  periodos_conservacion: {
    name: 'Períodos Conservación',
    headers: [
      'ID Actividad',
      'Categoría de Datos',
      'Período de Conservación',
      'Criterio de Conservación',
      'Base Legal para Conservación',
      'Método de Eliminación',
      'Responsable de Eliminación',
      '¿Eliminación Automática?',
      'Observaciones'
    ],
    data_examples: [
      ['ACT-001', 'Datos empleados activos', 'Durante relación laboral + 30 años', 'Código del Trabajo Art. 3', 'Obligación legal', 'Borrado seguro', 'Jefe RRHH', 'NO', 'Conservación obligatoria'],
      ['ACT-001', 'CV candidatos no seleccionados', '6 meses desde postulación', 'Política interna', 'No aplica', 'Borrado seguro', 'Jefe RRHH', 'SÍ', 'Sistema automático'],
      ['ACT-002', 'Facturas clientes', '6 años', 'Código Tributario', 'Obligación legal', 'Archivo físico/digital', 'Contador', 'NO', 'SII requiere'],
      ['ACT-003', 'Datos marketing con consentimiento', 'Hasta retiro de consentimiento', 'Duración del consentimiento', 'Consentimiento', 'Borrado completo', 'Jefe Marketing', 'SÍ', 'Sistema de opt-out'],
      ['ACT-004', 'Videos de vigilancia', '30 días', 'Política de seguridad', 'Interés legítimo', 'Sobrescritura automática', 'Jefe Seguridad', 'SÍ', 'Sistema CCTV automático']
    ],
    validation: {
      '¿Eliminación Automática?': ['SÍ', 'NO']
    }
  },

  // Hoja 8: Medidas de Seguridad
  medidas_seguridad: {
    name: 'Medidas Seguridad',
    headers: [
      'ID Actividad',
      'Tipo de Medida',
      'Descripción de la Medida',
      'Estado de Implementación',
      'Responsable',
      'Fecha Implementación',
      'Revisión Siguiente',
      'Observaciones'
    ],
    data_examples: [
      ['ACT-001', 'Técnica', 'Cifrado de base de datos RRHH', 'Implementado', 'Jefe TI', '2023-12-01', '2024-12-01', 'AES-256'],
      ['ACT-001', 'Técnica', 'Control de acceso por roles', 'Implementado', 'Jefe TI', '2023-12-01', '2024-06-01', 'Active Directory'],
      ['ACT-001', 'Organizativa', 'Capacitación en protección de datos', 'En proceso', 'Jefe RRHH', '2024-01-15', '2024-07-15', 'Anual para todo el personal'],
      ['ACT-001', 'Organizativa', 'Contratos de confidencialidad', 'Implementado', 'Jefe RRHH', '2023-11-01', '2024-11-01', 'Todos los empleados'],
      ['ACT-002', 'Técnica', 'Tokenización de tarjetas de crédito', 'Implementado', 'Jefe TI', '2023-10-01', '2024-10-01', 'PCI DSS compliant'],
      ['ACT-003', 'Técnica', 'Firewalls perimetrales', 'Implementado', 'Jefe TI', '2023-09-01', '2024-03-01', 'Configuración restrictiva'],
      ['ACT-004', 'Organizativa', 'Política de escritorios limpios', 'Implementado', 'Todos los jefes', '2024-01-01', '2024-06-01', 'Clean desk policy']
    ],
    validation: {
      'Tipo de Medida': ['Técnica', 'Organizativa'],
      'Estado de Implementación': ['No implementado', 'En proceso', 'Implementado', 'Requiere actualización']
    }
  },

  // Hoja 9: Decisiones Automatizadas
  decisiones_automatizadas: {
    name: 'Decisiones Automatizadas',
    headers: [
      'ID Actividad',
      'Nombre del Sistema',
      'Descripción de la Decisión',
      'Lógica Utilizada',
      'Fuentes de Datos',
      'Consecuencias para el Titular',
      'Intervención Humana',
      'Derecho a Explicación',
      'Observaciones'
    ],
    data_examples: [
      ['ACT-006', 'Sistema Scoring Crediticio', 'Aprobación automática de créditos', 'Algoritmo basado en ingresos, historial crediticio, scoring DICOM', 'DICOM, Declaración renta, Ingresos', 'Aprobación/rechazo del crédito', 'SÍ - Revisión manual casos límite', 'SÍ - Cliente puede solicitar explicación', 'Regulado por SBIF'],
      ['ACT-007', 'Sistema Control Acceso', 'Autorización entrada edificio', 'Reconocimiento biométrico facial', 'Base datos empleados, Cámaras', 'Autorización/denegación acceso', 'SÍ - Guard puede autorizar manualmente', 'NO - Proceso técnico simple', 'Solo para seguridad física'],
      ['ACT-008', 'Sistema Recomendaciones', 'Ofertas personalizadas e-commerce', 'Machine learning basado en historial compras', 'Historial compras, Navegación web', 'Recomendaciones de productos', 'NO - Completamente automatizado', 'NO - Solo para marketing', 'No afecta decisiones importantes'],
      ['ACT-009', 'Sistema Evaluación Desempeño', 'Cálculo automático bonos', 'Algoritmo basado en KPIs y metas', 'Sistema ventas, Asistencia, Evaluaciones', 'Monto de bono variable', 'SÍ - RRHH revisa y puede ajustar', 'SÍ - Empleado puede solicitar revisión', 'Parte del proceso de RRHH']
    ],
    validation: {
      'Intervención Humana': ['SÍ', 'NO'],
      'Derecho a Explicación': ['SÍ', 'NO']
    }
  },

  // Hoja 10: Plan de Implementación
  plan_implementacion: {
    name: 'Plan Implementación',
    headers: [
      'Tarea',
      'Descripción',
      'Responsable',
      'Fecha Inicio',
      'Fecha Límite',
      'Estado',
      'Prioridad',
      '% Avance',
      'Observaciones'
    ],
    data_examples: [
      ['Designar DPO', 'Designar Delegado de Protección de Datos', 'Gerencia General', '2024-01-01', '2024-01-31', 'Completado', 'Alta', '100%', 'Juan Pérez designado'],
      ['Inventario completo RAT', 'Completar inventario de todas las actividades', 'DPO', '2024-01-15', '2024-03-15', 'En proceso', 'Alta', '60%', 'Faltan 3 departamentos'],
      ['Actualizar políticas privacidad', 'Adaptar políticas a nueva ley', 'Legal + DPO', '2024-02-01', '2024-04-01', 'Pendiente', 'Alta', '0%', 'Esperando template legal'],
      ['Capacitación personal', 'Capacitar a todos los empleados', 'RRHH + DPO', '2024-02-15', '2024-05-31', 'Pendiente', 'Media', '0%', 'Definir modalidad'],
      ['Implementar medidas técnicas', 'Cifrado, control acceso, etc.', 'TI + DPO', '2024-03-01', '2024-06-30', 'Pendiente', 'Alta', '0%', 'Requiere presupuesto'],
      ['Contratos con proveedores', 'Actualizar contratos DPA', 'Legal + Compras', '2024-04-01', '2024-07-31', 'Pendiente', 'Media', '0%', '15 proveedores críticos'],
      ['Procedimiento derechos ARCOP', 'Implementar proceso derechos', 'DPO + TI', '2024-04-15', '2024-08-15', 'Pendiente', 'Media', '0%', 'Portal web y procedimientos']
    ],
    validation: {
      'Estado': ['Pendiente', 'En proceso', 'Completado', 'Pausado'],
      'Prioridad': ['Alta', 'Media', 'Baja']
    }
  }
};

// Función para generar plantilla Excel específica por industria
export const generateIndustryExcelTemplate = (industryKey) => {
  const industry = INDUSTRY_TEMPLATES[industryKey];
  if (!industry) return null;

  // Clonar estructura base
  const template = JSON.parse(JSON.stringify(EXCEL_STRUCTURE));
  
  // Personalizar para la industria específica
  template.empresa_info.data[5][1] = industry.nombre; // Pre-llenar industria
  
  // Agregar actividades comunes + específicas de la industria
  const activitiesData = [];
  let activityId = 1;
  
  Object.entries(industry.procesos).forEach(([key, proceso]) => {
    activitiesData.push([
      `ACT-${activityId.toString().padStart(3, '0')}`,
      proceso.nombre,
      getResponsibleDepartment(key),
      proceso.finalidad,
      proceso.finalidad,
      mapBaseLegal(proceso.baseLegal),
      proceso.baseLegal === 'consentimiento' ? 'SÍ' : 'NO',
      proceso.baseLegal === 'consentimiento' ? 'El titular puede retirar su consentimiento enviando email a dpo@empresa.cl' : 'N/A',
      'Por inventariar',
      'Alta',
      ''
    ]);
    activityId++;
  });
  
  template.inventario_actividades.data = activitiesData;
  
  return template;
};

// Mapeo de bases legales a texto en español
const mapBaseLegal = (baseLegal) => {
  const mapping = {
    'consentimiento': 'Consentimiento del titular',
    'contrato': 'Ejecución de un contrato',
    'obligacion_legal': 'Obligación legal',
    'interes_vital': 'Interés vital del titular',
    'tarea_publica': 'Tarea de interés público',
    'interes_legitimo': 'Interés legítimo'
  };
  return mapping[baseLegal] || 'No especificada';
};

// Determinar departamento responsable según el tipo de proceso
const getResponsibleDepartment = (processKey) => {
  const departments = {
    'gestion_rrhh': 'Recursos Humanos',
    'gestion_clientes': 'Ventas/Comercial',
    'gestion_proveedores': 'Compras/Abastecimiento',
    'marketing_comunicaciones': 'Marketing',
    'seguridad_instalaciones': 'Seguridad/Operaciones',
    'atencion_medica': 'Medicina/Clínica',
    'gestion_citas_agenda': 'Administración Médica',
    'facturacion_seguros': 'Administración/Finanzas',
    'investigacion_clinica': 'Investigación',
    'gestion_academica': 'Académico/Registro',
    'admision_matriculas': 'Admisión',
    'biblioteca_recursos': 'Biblioteca',
    'bienestar_estudiantil': 'Bienestar Estudiantil',
    'produccion_calidad': 'Producción/Calidad',
    'seguridad_ocupacional': 'Prevención de Riesgos',
    'mantenimiento_equipos': 'Mantenimiento',
    'evaluacion_crediticia': 'Riesgo/Crédito',
    'prevencion_lavado': 'Cumplimiento/Compliance',
    'gestion_inversiones': 'Inversiones',
    'gestion_proyectos': 'Proyectos/Ingeniería',
    'ventas_inmobiliarias': 'Ventas Inmobiliarias',
    'administracion_edificios': 'Administración'
  };
  return departments[processKey] || 'Por definir';
};

// Función para convertir estructura a formato CSV/Excel exportable
export const convertToExcelData = (template) => {
  const sheets = {};
  
  Object.entries(template).forEach(([sheetKey, sheetData]) => {
    sheets[sheetData.name] = {
      headers: sheetData.headers,
      data: sheetData.data || sheetData.data_examples || [],
      validation: sheetData.validation || {}
    };
  });
  
  return sheets;
};

// Generar archivo Excel XLSX profesional
export const downloadExcelTemplate = (industryKey, companyName = 'Empresa') => {
  const template = generateIndustryExcelTemplate(industryKey);
  const industry = INDUSTRY_TEMPLATES[industryKey];
  
  if (!template) return;
  
  // Crear un nuevo libro de trabajo Excel
  const workbook = XLSX.utils.book_new();
  
  // Agregar hoja de portada
  const portadaData = [
    [`PLANTILLA MAPEO DE DATOS - ${industry.nombre.toUpperCase()}`],
    [''],
    [`Empresa: ${companyName}`],
    [`Fecha: ${new Date().toLocaleDateString('es-CL')}`],
    [`Ley 21.719 Chile - Protección de Datos Personales`],
    [''],
    ['INSTRUCCIONES:'],
    ['1. Cada hoja representa un área específica del RAT'],
    ['2. Complete las celdas en blanco con la información de su empresa'],
    ['3. Los campos marcados como "Obligatorio Ley 21.719" = SÍ son requeridos'],
    ['4. Las celdas con fondo amarillo requieren atención especial'],
    ['5. Consulte la Ley 21.719 para más detalles legales'],
    [''],
    ['SOPORTE TÉCNICO: juridicadigital@empresa.cl'],
    ['VERSIÓN: 1.0 - RAT PRODUCCIÓN'],
    [''],
    ['HOJAS INCLUIDAS:'],
    ...Object.entries(template).map(([key, sheet]) => [`• ${sheet.name}`])
  ];
  
  const portadaWS = XLSX.utils.aoa_to_sheet(portadaData);
  
  // Aplicar estilos a la portada (título en negrita)
  if (!portadaWS['!merges']) portadaWS['!merges'] = [];
  portadaWS['!merges'].push({ s: { c: 0, r: 0 }, e: { c: 3, r: 0 } });
  
  // Configurar ancho de columnas
  portadaWS['!cols'] = [{ width: 50 }];
  
  XLSX.utils.book_append_sheet(workbook, portadaWS, 'PORTADA');
  
  // Agregar cada hoja del template
  Object.entries(template).forEach(([key, sheet]) => {
    const sheetData = [];
    
    // Título de la sección
    sheetData.push([`${sheet.name.toUpperCase()} - ${industry.nombre}`]);
    sheetData.push([]);
    
    // Headers
    sheetData.push(sheet.headers);
    
    // Datos
    const dataToUse = sheet.data || sheet.data_examples || [];
    dataToUse.forEach(row => {
      sheetData.push(row);
    });
    
    // Si hay validaciones, agregar una sección de ayuda
    if (sheet.validation && Object.keys(sheet.validation).length > 0) {
      sheetData.push([]);
      sheetData.push(['=== OPCIONES VÁLIDAS ===']);
      Object.entries(sheet.validation).forEach(([field, options]) => {
        sheetData.push([`${field}:`, ...options]);
      });
    }
    
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    
    // Configurar estilos y ancho de columnas
    const colWidths = sheet.headers.map((header, idx) => {
      if (header.includes('Descripción') || header.includes('Observaciones')) return { width: 40 };
      if (header.includes('Email') || header.includes('Teléfono')) return { width: 25 };
      if (header.includes('Fecha')) return { width: 15 };
      return { width: 20 };
    });
    worksheet['!cols'] = colWidths;
    
    // Agregar la hoja al libro
    const sheetName = sheet.name.length > 31 ? sheet.name.substring(0, 31) : sheet.name;
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });
  
  // Generar archivo XLSX
  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
    bookSST: false
  });
  
  // Descargar archivo
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `Plantilla_RAT_${industry.nombre.replace(/\s/g, '_')}_${companyName}_${new Date().toISOString().split('T')[0]}.xlsx`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Función adicional para exportar RAT completado como Excel
export const exportRATToExcel = (ratData, companyName = 'Empresa', industryName = 'General') => {
  const workbook = XLSX.utils.book_new();
  
  // Hoja 1: Resumen Ejecutivo RAT
  const resumenData = [
    ['REGISTRO DE ACTIVIDADES DE TRATAMIENTO (RAT)'],
    ['Ley 21.719 - Protección de Datos Personales Chile'],
    [''],
    ['INFORMACIÓN GENERAL'],
    ['Empresa:', ratData.responsable.nombre || companyName],
    ['Email:', ratData.responsable.email || ''],
    ['Teléfono:', ratData.responsable.telefono || ''],
    ['Industria:', industryName],
    ['Fecha Generación:', new Date().toLocaleDateString('es-CL')],
    [''],
    ['1. RESPONSABLE DEL TRATAMIENTO'],
    ['Nombre:', ratData.responsable.nombre || ''],
    ['Email Corporativo:', ratData.responsable.email || ''],
    ['Teléfono Corporativo:', ratData.responsable.telefono || ''],
    ['Es Empresa Extranjera:', ratData.responsable.representanteLegal.esExtranjero ? 'SÍ' : 'NO'],
    ...(ratData.responsable.representanteLegal.esExtranjero ? [
      ['Representante Legal:', ratData.responsable.representanteLegal.nombre || ''],
      ['Email Representante:', ratData.responsable.representanteLegal.email || ''],
      ['Teléfono Representante:', ratData.responsable.representanteLegal.telefono || '']
    ] : []),
    [''],
    ['2. FINALIDADES DEL TRATAMIENTO'],
    ['Descripción:', ratData.finalidades.descripcion || ''],
    ['Base Legal:', ratData.finalidades.baseLegal || ''],
    ['Basado en Consentimiento:', ratData.finalidades.esConsentimiento ? 'SÍ' : 'NO'],
    ...(ratData.finalidades.esConsentimiento ? [['Info Retiro Consentimiento:', ratData.finalidades.derechoRetiro || '']] : []),
    [''],
    ['3. CATEGORÍAS DE DATOS Y TITULARES'],
    ['Titulares:', ratData.categorias.titulares.join(', ') || 'No especificado'],
    ['Datos de Identificación:', ratData.categorias.datosPersonales.identificacion ? 'SÍ' : 'NO'],
    ['Datos de Contacto:', ratData.categorias.datosPersonales.contacto ? 'SÍ' : 'NO'],
    ['Datos Laborales:', ratData.categorias.datosPersonales.laborales ? 'SÍ' : 'NO'],
    ['Datos Académicos:', ratData.categorias.datosPersonales.academicos ? 'SÍ' : 'NO'],
    ['Datos Financieros:', ratData.categorias.datosPersonales.financieros ? 'SÍ' : 'NO'],
    ['Datos Socioeconómicos (SENSIBLE):', ratData.categorias.datosPersonales.socieconomicos ? 'SÍ' : 'NO'],
    ['Datos de Salud (SENSIBLE):', ratData.categorias.datosPersonales.salud ? 'SÍ' : 'NO'],
    ['Datos Biométricos (SENSIBLE):', ratData.categorias.datosPersonales.biometricos ? 'SÍ' : 'NO'],
    ['Datos Genéticos (SENSIBLE):', ratData.categorias.datosPersonales.geneticos ? 'SÍ' : 'NO'],
    ['Ideología/Creencias (SENSIBLE):', ratData.categorias.datosPersonales.ideologia ? 'SÍ' : 'NO'],
    ['Datos de Menores:', ratData.categorias.datosPersonales.menores ? 'SÍ' : 'NO'],
    [''],
    ['4. TRANSFERENCIAS INTERNACIONALES'],
    ['Existen Transferencias:', ratData.transferencias.existe ? 'SÍ' : 'NO'],
    ...(ratData.transferencias.existe ? [
      ['Países Destino:', ratData.transferencias.destinos.join(', ') || ''],
      ['Tipo de Garantías:', ratData.transferencias.garantias || '']
    ] : []),
    [''],
    ['5. FUENTE DE LOS DATOS'],
    ['Tipo de Fuente:', ratData.fuente.tipo || ''],
    ['Descripción:', ratData.fuente.descripcion || ''],
    ['Es Fuente Pública:', ratData.fuente.esFuentePublica ? 'SÍ' : 'NO'],
    [''],
    ['6. PERÍODOS DE CONSERVACIÓN'],
    ['Período:', ratData.conservacion.periodo || ''],
    ['Criterio:', ratData.conservacion.criterio || ''],
    ['Justificación:', ratData.conservacion.justificacion || ''],
    [''],
    ['7. MEDIDAS DE SEGURIDAD'],
    ['Medidas Técnicas:', ratData.seguridad.tecnicas.join(', ') || ''],
    ['Medidas Organizativas:', ratData.seguridad.organizativas.join(', ') || ''],
    ['Descripción General:', ratData.seguridad.descripcionGeneral || ''],
    [''],
    ['8. DECISIONES AUTOMATIZADAS'],
    ['Existen Decisiones Automatizadas:', ratData.automatizadas.existe ? 'SÍ' : 'NO'],
    ...(ratData.automatizadas.existe ? [
      ['Lógica Utilizada:', ratData.automatizadas.logica || ''],
      ['Consecuencias:', ratData.automatizadas.consecuencias || ''],
      ['Fuentes de Datos:', ratData.automatizadas.fuentesDatos.join(', ') || '']
    ] : [])
  ];
  
  const resumenWS = XLSX.utils.aoa_to_sheet(resumenData);
  resumenWS['!cols'] = [{ width: 30 }, { width: 50 }];
  XLSX.utils.book_append_sheet(workbook, resumenWS, 'RAT COMPLETO');
  
  // Generar archivo
  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  });
  
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `RAT_Completo_${companyName.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default {
  EXCEL_STRUCTURE,
  generateIndustryExcelTemplate,
  convertToExcelData,
  downloadExcelTemplate,
  exportRATToExcel
};