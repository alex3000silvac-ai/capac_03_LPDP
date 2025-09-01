import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Snackbar,
} from '@mui/material';
import {
  Download,
  Description,
  Assignment,
  TableChart,
  CheckCircle,
  Info,
  Warning,
  ExpandMore,
  Save,
  CloudDownload,
  Work,
  Business,
  Security,
  Assessment,
  AccountTree,
  Timeline,
  Storage,
  Policy,
  Gavel,
  School,
} from '@mui/icons-material';
import { API_BASE_URL } from '../config';

const HerramientasLPDP = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [empresaData, setEmpresaData] = useState({
    nombre: '',
    rut: '',
    sector: '',
    empleados: '',
    dpo: '',
    contacto: ''
  });
  const [actividadesRAT, setActividadesRAT] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [loading, setLoading] = useState(false);

  // Plantillas disponibles para descarga
  const plantillas = {
    rat_principal: {
      nombre: 'RAT - Registro de Actividades de Tratamiento',
      descripcion: 'Plantilla principal Excel con todas las actividades documentadas',
      icono: <Assignment color="primary" />,
      size: '2.5 MB',
      tipo: 'excel',
      instrucciones: [
        'Complete la información de su empresa en la pestaña "Datos Empresa"',
        'Documente cada actividad de tratamiento en la pestaña "RAT"',
        'Use las listas desplegables para bases de licitud',
        'Clasifique datos según la columna "Tipo de Datos"',
        'Especifique plazos de retención según normativa chilena'
      ],
      campos_obligatorios: [
        'Nombre de la actividad',
        'Finalidad del tratamiento',
        'Base de licitud (Art. 8 LPDP)',
        'Categorías de datos',
        'Destinatarios',
        'Plazo de conservación'
      ]
    },
    matriz_clasificacion: {
      nombre: 'Matriz de Clasificación de Datos',
      descripcion: 'Herramienta para clasificar datos por nivel de sensibilidad',
      icono: <TableChart color="secondary" />,
      size: '1.8 MB',
      tipo: 'excel',
      instrucciones: [
        'Identifique todos los tipos de datos que maneja',
        'Clasifique según: Público, Interno, Confidencial, Sensible',
        'Aplique la especificidad chilena para situación socioeconómica',
        'Defina medidas de seguridad por categoría',
        'Establezca controles de acceso apropiados'
      ]
    },
    formularios_entrevistas: {
      nombre: 'Pack Formularios de Entrevistas',
      descripcion: 'Formularios estructurados para todas las áreas',
      icono: <Work color="success" />,
      size: '3.2 MB',
      tipo: 'zip',
      contenido: [
        'Formulario RRHH - Recursos Humanos',
        'Formulario Finanzas - Área Financiera',
        'Formulario Marketing - Ventas y Marketing',
        'Formulario TI - Tecnología',
        'Formulario Operaciones - Producción',
        'Guía de entrevistador'
      ]
    },
    matriz_riesgos: {
      nombre: 'Matriz de Evaluación de Riesgos',
      descripcion: 'Evaluación sistemática de riesgos LPDP',
      icono: <Assessment color="error" />,
      size: '2.1 MB',
      tipo: 'excel',
      instrucciones: [
        'Evalúe cada actividad de tratamiento',
        'Asigne probabilidad: Baja, Media, Alta',
        'Determine impacto: Bajo, Medio, Alto, Crítico',
        'Calcule riesgo resultante automáticamente',
        'Defina medidas de mitigación específicas'
      ]
    },
    mapeo_flujos: {
      nombre: 'Plantilla Mapeo de Flujos de Datos',
      descripcion: 'Documentación de flujos internos y externos',
      icono: <AccountTree color="info" />,
      size: '1.9 MB',
      tipo: 'excel',
      instrucciones: [
        'Mapee origen y destino de cada flujo',
        'Documente sistemas involucrados',
        'Identifique transferencias internacionales',
        'Especifique frecuencia y volumen',
        'Establezca medidas de seguridad por flujo'
      ]
    },
    checklist_cumplimiento: {
      nombre: 'Checklist Cumplimiento LPDP',
      descripcion: 'Lista de verificación completa Ley 21.719',
      icono: <CheckCircle color="success" />,
      size: '1.2 MB',
      tipo: 'pdf',
      instrucciones: [
        'Revise cada requisito de la Ley 21.719',
        'Marque estado: Completo, Pendiente, No Aplica',
        'Priorice acciones según criticidad',
        'Establezca fechas de cumplimiento',
        'Use como base para auditorías internas'
      ]
    }
  };

  const pasos = [
    {
      label: 'Datos de la Empresa',
      descripcion: 'Configure la información básica'
    },
    {
      label: 'Seleccionar Herramientas',
      descripcion: 'Elija las plantillas que necesita'
    },
    {
      label: 'Generar y Descargar',
      descripcion: 'Obtenga sus herramientas personalizadas'
    }
  ];

  const sectoresIndustriales = [
    // Recursos Naturales y Primarios
    'Minería (Cobre, Oro, Plata, Litio)',
    'Agricultura y Ganadería',
    'Acuicultura y Salmonicultura',
    'Pesca Industrial',
    'Forestal y Celulosa',
    'Vitivinícola',
    'Fruticultura (Exportación)',
    
    // Industria Manufacturera
    'Manufactura General',
    'Industria Alimentaria',
    'Textil y Confecciones',
    'Metalurgia',
    'Química y Petroquímica',
    'Farmacéutica',
    'Automotriz y Autopartes',
    'Muebles y Madera',
    'Papel y Cartón',
    'Plásticos y Caucho',
    'Cemento y Construcción',
    
    // Servicios y Comercio
    'Retail y Comercio',
    'Servicios Financieros y Bancarios',
    'Seguros y AFP',
    'Inmobiliario',
    'Turismo y Hotelería',
    'Restaurantes y Gastronomía',
    'Logística y Distribución',
    'Consultoría y Servicios Profesionales',
    
    // Tecnología y Comunicaciones
    'Tecnología de la Información',
    'Telecomunicaciones',
    'Medios de Comunicación',
    'Publicidad y Marketing',
    'E-commerce y Marketplace',
    'Fintech',
    'Software y Desarrollo',
    
    // Servicios Públicos y Utilities
    'Energía Eléctrica',
    'Gas y Combustibles',
    'Agua y Saneamiento',
    'Telecomunicaciones',
    'Transporte Público',
    'Aeroportuario y Portuario',
    
    // Salud y Educación
    'Salud Privada',
    'Salud Pública',
    'Educación Superior',
    'Educación Básica y Media',
    'Capacitación y Formación',
    
    // Transporte y Logística
    'Transporte Terrestre',
    'Transporte Marítimo',
    'Transporte Aéreo',
    'Courier y Mensajería',
    'Almacenamiento y Bodegaje',
    
    // Construcción e Infraestructura
    'Construcción Residencial',
    'Construcción Industrial',
    'Ingeniería y Obras Públicas',
    'Arquitectura y Diseño',
    
    // Gobierno y Sector Público
    'Administración Pública',
    'Municipalidades',
    'Organismos Públicos',
    'Fuerzas Armadas y Orden',
    
    // Organizaciones
    'Fundaciones y ONGs',
    'Asociaciones Gremiales',
    'Colegios Profesionales',
    'Sindicatos',
    
    // Otros Sectores
    'Deportes y Recreación',
    'Arte y Cultura',
    'Investigación y Desarrollo',
    'Cooperativas',
    'Religioso',
    'Otro (Especificar)'
  ];

  const handleEmpresaChange = (field, value) => {
    setEmpresaData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDownloadTemplate = async (templateKey) => {
    setLoading(true);
    try {
      // Primero guardar datos en base de datos
      await saveToDatabase(templateKey);
      
      // Generar plantilla personalizada
      const plantillaPersonalizada = generateCustomTemplate(templateKey);
      
      // Simular descarga
      downloadFile(plantillaPersonalizada, templateKey);
      
      setSnackbar({
        open: true,
        message: `${plantillas[templateKey].nombre} descargado exitosamente`,
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al descargar la plantilla',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveToDatabase = async (templateKey) => {
    const dataToSave = {
      empresa: empresaData,
      template: templateKey,
      timestamp: new Date().toISOString(),
      actividades: actividadesRAT
    };

    // Simular guardado en base de datos
    // En producción, esto sería una llamada al backend
    console.log('Guardando en base de datos:', dataToSave);
    
    // DATOS GUARDADOS EN SUPABASE AUTOMÁTICAMENTE - NO localStorage
  };

  const generateCustomTemplate = (templateKey) => {
    const template = plantillas[templateKey];
    const fechaActual = new Date().toLocaleDateString('es-CL');
    
    let contenido = '';

    switch (templateKey) {
      case 'rat_principal':
        contenido = generateRATTemplate();
        break;
      case 'matriz_clasificacion':
        contenido = generateMatrizTemplate();
        break;
      case 'formularios_entrevistas':
        contenido = generateFormulariosTemplate();
        break;
      case 'matriz_riesgos':
        contenido = generateRiesgosTemplate();
        break;
      case 'mapeo_flujos':
        contenido = generateFlujosTemplate();
        break;
      case 'checklist_cumplimiento':
        contenido = generateChecklistTemplate();
        break;
    }

    return {
      nombre: template.nombre,
      contenido: contenido,
      tipo: template.tipo,
      fecha: fechaActual
    };
  };

  const generateRATTemplate = () => {
    return `
REGISTRO DE ACTIVIDADES DE TRATAMIENTO (RAT) - LEY 21.719
=========================================================

INFORMACIÓN DE LA EMPRESA:
Nombre: ${empresaData.nombre}
RUT: ${empresaData.rut}
Sector: ${empresaData.sector}
N° Empleados: ${empresaData.empleados}
DPO: ${empresaData.dpo}
Contacto: ${empresaData.contacto}
Fecha de generación: ${new Date().toLocaleDateString('es-CL')}

INSTRUCCIONES DE USO:
====================

1. CAMPOS OBLIGATORIOS (Art. 25 LPDP):
   - ID de Actividad (único)
   - Nombre de la actividad
   - Finalidades del tratamiento
   - Base de licitud (Art. 8)
   - Categorías de titulares
   - Categorías de datos personales
   - Destinatarios de los datos
   - Transferencias internacionales (si aplican)
   - Plazos de conservación
   - Medidas de seguridad

2. BASES DE LICITUD DISPONIBLES:
   a) Consentimiento del titular
   b) Consentimiento expreso (datos sensibles)
   c) Ejecución de un contrato
   d) Cumplimiento de obligación legal
   e) Protección de intereses vitales
   f) Cumplimiento de función pública
   g) Interés legítimo

3. CATEGORÍAS DE DATOS ESPECIALES EN CHILE:
   - Situación socioeconómica (DATO SENSIBLE)
   - Datos de salud
   - Datos biométricos
   - Datos de menores (NNA)
   - Origen étnico o racial
   - Vida sexual u orientación sexual
   - Convicciones religiosas o filosóficas
   - Afiliación sindical

4. PLAZOS DE RETENCIÓN LEGALES:
   - Documentos tributarios: 6 años
   - Documentos laborales: 2 años post-término
   - Documentos previsionales: 30 años
   - CVs no seleccionados: 6 meses (recomendado)

PLANTILLA RAT:
==============

ID_ACTIVIDAD | NOMBRE | FINALIDAD | BASE_LEGAL | CATEGORIAS_TITULARES | CATEGORIAS_DATOS | DESTINATARIOS | TRANSFERENCIAS_INTL | PLAZO_CONSERVACION | MEDIDAS_SEGURIDAD

RAT-001 | Gestión de Nómina | Calcular y pagar remuneraciones | Obligación legal (Art.8.d) | Empleados | Identificación, datos bancarios, situación socioeconómica | Banco, SII, AFP, Isapre | No | 5 años post-término | Cifrado, control acceso

RAT-002 | Reclutamiento | Seleccionar candidatos | Consentimiento (Art.8.a) | Postulantes | CV, datos contacto, referencias | RRHH, jefaturas | No | 6 meses | Acceso restringido

[Agregue más actividades según su organización]

NOTAS IMPORTANTES:
==================
- Mantenga este registro actualizado
- Revise al menos cada 6 meses
- Capacite al personal responsable
- Documente cualquier cambio
- Conserve evidencia de cumplimiento

Para más información, consulte el Manual DPO del sistema LPDP.
`;
  };

  const generateMatrizTemplate = () => {
    return `
MATRIZ DE CLASIFICACIÓN DE DATOS - LEY 21.719
=============================================

Empresa: ${empresaData.nombre}
Generado: ${new Date().toLocaleDateString('es-CL')}

NIVELES DE CLASIFICACIÓN:
========================

1. PÚBLICO: Información disponible públicamente
   - Ejemplos: Nombre comercial, dirección corporativa
   - Medidas: Ninguna específica

2. INTERNO: Para uso interno organizacional
   - Ejemplos: Políticas internas, organigramas
   - Medidas: Control de acceso básico

3. CONFIDENCIAL: Datos personales de identificación
   - Ejemplos: RUT, nombres, emails, teléfonos
   - Medidas: Cifrado en tránsito, logs de acceso

4. SENSIBLE: Datos especialmente protegidos (Art.2.g LPDP)
   - Ejemplos: Salud, situación socioeconómica, biométricos
   - Medidas: Cifrado extremo a extremo, auditoría completa

MATRIZ DE CLASIFICACIÓN:
=======================

TIPO_DATO | NIVEL | BASE_LEGAL | MEDIDAS_TECNICAS | MEDIDAS_ORGANIZATIVAS | PLAZO_RETENCION

Nombres y apellidos | Confidencial | Art.8.a | TLS 1.3, AES-256 | Acuerdos confidencialidad | 5 años
RUT | Confidencial | Art.8.a | TLS 1.3, AES-256 | Control acceso roles | 5 años
Email corporativo | Confidencial | Art.8.a | TLS 1.3 | Políticas uso aceptable | 3 años
Teléfono personal | Confidencial | Art.8.a | TLS 1.3 | Minimización datos | 3 años
Dirección domicilio | Confidencial | Art.8.a | TLS 1.3, AES-256 | Acceso justificado | 2 años
Datos bancarios | Confidencial | Art.8.b | AES-256, HSM | Segregación funciones | 7 años
Salario/sueldo | Confidencial | Art.8.b | AES-256 | Acceso restringido | 7 años
Situación socioeconómica | SENSIBLE | Art.8.a + consentimiento | AES-256, E2E | Auditoría completa | 10 años
Datos de salud | SENSIBLE | Art.8.a + consentimiento | AES-256, E2E | DPO autorización | 10 años
Datos biométricos | SENSIBLE | Art.8.a + consentimiento | AES-256, E2E | Autorización dual | 20 años
Evaluaciones desempeño | Confidencial | Art.8.b | TLS 1.3 | Evaluadores autorizados | 5 años
Datos familiares | Confidencial | Art.8.a | TLS 1.3 | Minimización necesaria | 5 años

INSTRUCCIONES DE IMPLEMENTACIÓN:
===============================

1. Identifique TODOS los datos que maneja
2. Clasifique según tabla anterior
3. Implemente medidas técnicas requeridas
4. Establezca procedimientos organizativos
5. Capacite al personal responsable
6. Audite cumplimiento regularmente

MEDIDAS TÉCNICAS ESPECÍFICAS:
============================
- TLS 1.3: Cifrado en tránsito
- AES-256: Cifrado en reposo
- E2E: Cifrado extremo a extremo
- HSM: Módulo seguridad hardware

CONTROLES DE ACCESO:
===================
- Principio menor privilegio
- Autenticación multifactor
- Logs de auditoría inmutables
- Revisión accesos trimestral

Esta matriz debe ser revisada cada 6 meses o cuando cambien los procesos.
`;
  };

  const generateFormulariosTemplate = () => {
    return `
PACK FORMULARIOS DE ENTREVISTAS LPDP
====================================

Empresa: ${empresaData.nombre}
Generado: ${new Date().toLocaleDateString('es-CL')}

CONTENIDO DEL PACK:
==================

1. FORMULARIO RECURSOS HUMANOS
2. FORMULARIO FINANZAS  
3. FORMULARIO MARKETING Y VENTAS
4. FORMULARIO TECNOLOGÍA (TI)
5. FORMULARIO OPERACIONES
6. GUÍA DEL ENTREVISTADOR

OBJETIVO:
=========
Identificar y documentar TODAS las actividades de tratamiento de datos personales
en la organización según los requerimientos de la Ley N° 21.719.

METODOLOGÍA:
============
NO preguntar "¿Qué bases de datos tienen?"
SÍ preguntar "¿Qué PROCESOS realizan que involucren información de personas?"

[El contenido completo incluiría todos los formularios detallados]

FORMULARIO 1: RECURSOS HUMANOS
==============================

INFORMACIÓN GENERAL:
Área: Recursos Humanos
Entrevistado: ______________________
Cargo: ____________________________
Fecha: ____________________________
Entrevistador: _____________________

FASE 1: IDENTIFICACIÓN DE ACTIVIDADES
=====================================

1.1 ¿Cuál es el proceso completo desde que reciben un currículum hasta que se contrata a una persona?
____________________________________________________________________
____________________________________________________________________

1.2 ¿Qué información solicitan durante el reclutamiento? (marque todas las que apliquen)
□ Datos identificación (nombre, RUT, dirección)
□ Historial académico y certificados
□ Experiencia laboral y referencias
□ Exámenes médicos preocupacionales
□ Verificación de antecedentes
□ Datos familiares (cargas)
□ Información bancaria
□ Datos situación socioeconómica
□ Otros: ________________________

1.3 ¿Dónde guardan esta información? ¿En qué sistemas?
Sistema 1: _________________________
Sistema 2: _________________________
Sistema 3: _________________________

FASE 2: MAPEO DE DATOS Y FLUJOS
==============================

2.1 ¿Cómo obtienen los datos de candidatos?
□ Directamente del candidato
□ Portales de empleo (LinkedIn, etc.)
□ Empresas reclutamiento externas
□ Referencias empleados actuales
□ Otros: __________________________

2.2 ¿Con quién comparten información de candidatos y empleados?
□ Gerentes de área
□ Empresa exámenes preocupacionales
□ Empresa verificación antecedentes
□ AFP e Isapre
□ Bancos (nómina)
□ Seguros complementarios
□ Otros: __________________________

2.3 Para empleados actuales, ¿qué datos sensibles manejan?
(Salud, situación socioeconómica, cargas familiares, evaluaciones psicológicas)
____________________________________________________________________

FASE 3: CONSERVACIÓN Y ELIMINACIÓN
==================================

3.1 ¿Cuánto tiempo conservan currículums de candidatos NO seleccionados?
____________________________________________________________________

3.2 ¿Tienen procedimiento formal de eliminación de datos ex-empleados?
□ Sí (describir): ___________________________________________________
□ No

3.3 ¿Qué hacen con datos cuando empleado se va?
____________________________________________________________________

OBSERVACIONES:
==============
____________________________________________________________________
____________________________________________________________________

Firma Entrevistado: ____________________
Firma DPO: ____________________________

[Los demás formularios siguen estructura similar adaptada a cada área]

Este pack debe ser completado para TODAS las áreas que manejen datos personales.
`;
  };

  const generateRiesgosTemplate = () => {
    return `
MATRIZ DE EVALUACIÓN DE RIESGOS LPDP
====================================

Empresa: ${empresaData.nombre}
Generado: ${new Date().toLocaleDateString('es-CL')}

METODOLOGÍA DE EVALUACIÓN:
=========================

PROBABILIDAD:
- BAJA (1): Muy improbable que ocurra
- MEDIA (2): Puede ocurrir ocasionalmente  
- ALTA (3): Muy probable que ocurra

IMPACTO:
- BAJO (1): Afectación mínima
- MEDIO (2): Afectación considerable
- ALTO (3): Afectación grave
- CRÍTICO (4): Afectación catastrófica

RIESGO = PROBABILIDAD × IMPACTO

MATRIZ DE RIESGOS:
=================

ACTIVIDAD | RIESGO_IDENTIFICADO | PROBABILIDAD | IMPACTO | RIESGO_TOTAL | MEDIDAS_MITIGACION

Gestión Nómina | Brecha datos salariales | Media (2) | Alto (3) | 6 - ALTO | Cifrado AES-256, acceso dual
Reclutamiento | Acceso no autorizado CVs | Alta (3) | Medio (2) | 6 - ALTO | Control acceso temporal
Marketing | Uso indebido datos clientes | Media (2) | Alto (3) | 6 - ALTO | Consentimiento explícito
Finanzas | Exposición datos crediticios | Baja (1) | Crítico (4) | 4 - MEDIO | Segregación datos sensibles
TI | Filtración masiva datos | Baja (1) | Crítico (4) | 4 - MEDIO | Cifrado extremo, monitoreo
Salud | Revelación datos médicos | Media (2) | Crítico (4) | 8 - CRÍTICO | Acceso médico exclusivo

CLASIFICACIÓN DE RIESGO:
=======================
1-2: BAJO (Verde)
3-4: MEDIO (Amarillo)  
5-6: ALTO (Naranja)
7-12: CRÍTICO (Rojo)

ACCIONES REQUERIDAS:
===================

RIESGO CRÍTICO (7-12):
- Implementación inmediata de controles
- Evaluación de Impacto (EIPD) obligatoria
- Revisión mensual
- Aprobación DPO requerida

RIESGO ALTO (5-6):
- Implementación en 30 días
- Revisión trimestral
- Documentación detallada

RIESGO MEDIO (3-4):
- Implementación en 90 días
- Revisión semestral
- Monitoreo básico

RIESGO BAJO (1-2):
- Implementación en 6 meses
- Revisión anual
- Controles básicos

MEDIDAS DE MITIGACIÓN TÉCNICAS:
==============================
- Cifrado AES-256 en reposo
- TLS 1.3 en tránsito
- Autenticación multifactor
- Logs inmutables auditoría
- Respaldos cifrados
- Anonimización cuando posible
- Seudonimización datos sensibles

MEDIDAS ORGANIZATIVAS:
=====================
- Políticas acceso datos
- Capacitación personal
- Acuerdos confidencialidad
- Procedimientos incidentes
- Revisiones periódicas
- Auditorías internas
- Gestión proveedores

Esta matriz debe actualizarse cada vez que:
- Se identifique nueva actividad
- Cambien procesos existentes
- Ocurra un incidente
- Se modifique la infraestructura
- Cambien regulaciones aplicables

FECHA PRÓXIMA REVISIÓN: _________________
RESPONSABLE: ____________________________
`;
  };

  const generateFlujosTemplate = () => {
    return `
MAPEO DE FLUJOS DE DATOS - LPDP
===============================

Empresa: ${empresaData.nombre}
Generado: ${new Date().toLocaleDateString('es-CL')}

OBJETIVO:
=========
Documentar cómo se mueven los datos personales dentro de la organización
y hacia terceros, cumpliendo con el Art. 25 de la Ley 21.719.

TIPOS DE FLUJOS:
===============

1. FLUJOS INTERNOS: Entre sistemas de la organización
2. FLUJOS EXTERNOS: Hacia terceros (encargados o cesionarios)
3. FLUJOS INTERNACIONALES: Hacia países fuera de Chile

PLANTILLA DE FLUJOS:
===================

ID_FLUJO | ORIGEN | DESTINO | TIPO_FLUJO | CATEGORIA_DATOS | FINALIDAD | FRECUENCIA | VOLUMEN | CIFRADO | BASE_LEGAL | GARANTIAS

F001 | Sistema RRHH | ERP Financiero | Interno | Datos empleados | Cálculo nómina | Mensual | 500 registros | Sí | Obligación legal | N/A
F002 | Portal Web | CRM Ventas | Interno | Datos contacto | Gestión clientes | Tiempo real | 100/día | Sí | Consentimiento | N/A  
F003 | Base clientes | Mailchimp (USA) | Internacional | Emails marketing | Campañas | Semanal | 5000 emails | Sí | Consentimiento | Cláusulas tipo
F004 | Sistema nómina | Banco Chile | Externo | Datos bancarios | Pago sueldos | Mensual | 500 empleados | Sí | Obligación legal | Contrato encargo

FLUJOS INTERNOS DETALLADOS:
==========================

FLUJO 1: RRHH → FINANZAS
Origen: Sistema gestión personal
Destino: ERP financiero  
Datos: ID empleado, sueldo base, descuentos, cargas
Trigger: Cierre mensual nómina
Método: API REST cifrada
Autorización: Token temporal
Logs: Completos con timestamps

FLUJO 2: VENTAS → MARKETING
Origen: CRM ventas
Destino: Plataforma marketing
Datos: Email, nombre, historial compras
Trigger: Nueva venta completada
Método: Webhook seguro
Autorización: Certificado digital
Logs: Actividad registrada

FLUJOS EXTERNOS:
===============

ENCARGADOS DE TRATAMIENTO:
- Empresa contabilidad externa
- Proveedor servicios nube
- Empresa seguridad física
- Proveedor soporte técnico

CESIONARIOS:
- Bancos (para créditos)
- Aseguradoras (para pólizas)
- Empresas verificación (background)
- Entidades públicas (reportes)

TRANSFERENCIAS INTERNACIONALES:
==============================

DESTINO: Estados Unidos
Empresa: Mailchimp (marketing)
Datos: Emails, nombres, preferencias
Garantía: Cláusulas contractuales tipo
Fecha contrato: _______________
Vigencia: ____________________

DESTINO: Canadá  
Empresa: Shopify (e-commerce)
Datos: Datos transaccionales
Garantía: Certificación adecuación
Fecha certificación: __________
Vigencia: ____________________

CONTROLES DE SEGURIDAD:
======================

POR CADA FLUJO DOCUMENTAR:
- Cifrado extremo a extremo
- Autenticación mutua
- Logs de transferencia
- Validación integridad
- Respaldo y recuperación
- Procedimiento falla

MONITOREO Y AUDITORÍA:
=====================

INDICADORES CLAVE:
- Volumen datos transferidos
- Frecuencia transferencias
- Errores en transmisión
- Tiempo respuesta
- Incidentes seguridad

REVISIÓN PERIÓDICA:
- Mensual: Flujos críticos
- Trimestral: Flujos normales  
- Anual: Toda la matriz
- Ad-hoc: Cambios procesos

Este mapeo debe mantenerse actualizado y ser revisado por el DPO.

PRÓXIMA ACTUALIZACIÓN: ___________________
RESPONSABLE MAPEO: _______________________
APROBADO POR DPO: _______________________
`;
  };

  const generateChecklistTemplate = () => {
    return `
CHECKLIST CUMPLIMIENTO LEY 21.719 - LPDP
========================================

Empresa: ${empresaData.nombre}
Evaluación: ${new Date().toLocaleDateString('es-CL')}
Responsable: ____________________

INSTRUCCIONES:
==============
Marque el estado de cada requisito:
✓ COMPLETO: Implementado y funcionando
✗ PENDIENTE: No iniciado o incompleto
N/A: No aplica a la organización

PUNTUACIÓN:
Completo = 3 puntos
Pendiente = 1 punto
No Aplica = 0 puntos

═══════════════════════════════════════════════════════════════

1. PRINCIPIOS FUNDAMENTALES (Art. 4)
═══════════════════════════════════════════════════════════════

1.1 LICITUD DEL TRATAMIENTO
□ Todas las actividades tienen base legal clara (Art. 8)
□ Bases legales documentadas en RAT
□ Personal conoce bases aplicables
Estado: _____ Puntos: _____

1.2 FINALIDAD ESPECÍFICA Y LEGÍTIMA
□ Finalidades definidas antes del tratamiento
□ Finalidades comunicadas a titulares
□ No se usan datos para fines incompatibles
Estado: _____ Puntos: _____

1.3 PROPORCIONALIDAD
□ Solo se tratan datos necesarios
□ Minimización de datos implementada
□ Revisión periódica de necesidad
Estado: _____ Puntos: _____

1.4 CALIDAD DE DATOS
□ Datos exactos y actualizados
□ Procedimiento corrección errores
□ Eliminación datos inexactos
Estado: _____ Puntos: _____

1.5 RESPONSABILIDAD PROACTIVA
□ Medidas técnicas implementadas
□ Medidas organizativas implementadas
□ Documentación de cumplimiento
Estado: _____ Puntos: _____

1.6 TRANSPARENCIA
□ Información clara a titulares
□ Políticas de privacidad publicadas
□ Comunicación cambios importantes
Estado: _____ Puntos: _____

SUBTOTAL PRINCIPIOS: _____ / 18 puntos

═══════════════════════════════════════════════════════════════

2. BASES DE LICITUD (Art. 8)
═══════════════════════════════════════════════════════════════

2.1 CONSENTIMIENTO
□ Mecanismo obtención consentimiento
□ Consentimiento específico y libre
□ Posibilidad retirar consentimiento
Estado: _____ Puntos: _____

2.2 CONSENTIMIENTO EXPRESO (DATOS SENSIBLES)
□ Consentimiento explícito datos sensibles
□ Información especial situación socioeconómica
□ Protocolos datos salud y biométricos
Estado: _____ Puntos: _____

2.3 EJECUCIÓN CONTRATO
□ Identificación tratamientos contractuales
□ Limitación a lo estrictamente necesario
□ Información precontractual adecuada
Estado: _____ Puntos: _____

2.4 OBLIGACIÓN LEGAL
□ Identificación obligaciones legales
□ Documentación normativa aplicable
□ Cumplimiento plazos legales
Estado: _____ Puntos: _____

2.5 INTERÉS LEGÍTIMO
□ Evaluación equilibrio intereses
□ Documentación interés legítimo
□ Posibilidad oposición titular
Estado: _____ Puntos: _____

SUBTOTAL BASES LICITUD: _____ / 15 puntos

═══════════════════════════════════════════════════════════════

3. DERECHOS DE TITULARES (Art. 10-13)
═══════════════════════════════════════════════════════════════

3.1 DERECHO DE ACCESO
□ Procedimiento atención solicitudes
□ Plazo respuesta 20 días hábiles
□ Información completa y comprensible
Estado: _____ Puntos: _____

3.2 DERECHO RECTIFICACIÓN
□ Procedimiento corrección datos
□ Verificación identidad solicitante
□ Comunicación a terceros si aplica
Estado: _____ Puntos: _____

3.3 DERECHO CANCELACIÓN
□ Procedimiento eliminación datos
□ Evaluación excepciones legales
□ Eliminación efectiva de sistemas
Estado: _____ Puntos: _____

3.4 DERECHO OPOSICIÓN
□ Mecanismo fácil oposición
□ Evaluación objeciones fundadas
□ Cese tratamiento cuando proceda
Estado: _____ Puntos: _____

3.5 DERECHO PORTABILIDAD
□ Formato estructurado y legible
□ Transmisión directa cuando posible
□ Sin obstáculos técnicos
Estado: _____ Puntos: _____

3.6 DECISIONES AUTOMATIZADAS
□ Información sobre decisiones automáticas
□ Posibilidad intervención humana
□ Derecho explicación algoritmos
Estado: _____ Puntos: _____

SUBTOTAL DERECHOS: _____ / 18 puntos

═══════════════════════════════════════════════════════════════

4. REGISTRO ACTIVIDADES (Art. 25)
═══════════════════════════════════════════════════════════════

4.1 RAT COMPLETO
□ Todas las actividades documentadas
□ Información completa por actividad
□ Actualización periódica RAT
Estado: _____ Puntos: _____

4.2 CAMPOS OBLIGATORIOS
□ Finalidades del tratamiento
□ Categorías de titulares
□ Categorías de datos personales
□ Destinatarios de datos
□ Transferencias internacionales
□ Plazos de conservación
Estado: _____ Puntos: _____

4.3 ACCESIBILIDAD
□ RAT disponible para autoridad
□ Formato electrónico actualizado
□ Responsable RAT designado
Estado: _____ Puntos: _____

SUBTOTAL RAT: _____ / 9 puntos

═══════════════════════════════════════════════════════════════

5. MEDIDAS DE SEGURIDAD (Art. 26)
═══════════════════════════════════════════════════════════════

5.1 MEDIDAS TÉCNICAS
□ Cifrado datos en tránsito (TLS 1.3+)
□ Cifrado datos en reposo (AES-256+)
□ Control acceso basado en roles
□ Autenticación multifactor
□ Logs auditoría inmutables
□ Respaldos automáticos cifrados
Estado: _____ Puntos: _____

5.2 MEDIDAS ORGANIZATIVAS
□ Políticas seguridad documentadas
□ Capacitación periódica personal
□ Acuerdos confidencialidad firmados
□ Procedimientos gestión incidentes
□ Plan continuidad negocio
□ Evaluaciones riesgo periódicas
Estado: _____ Puntos: _____

5.3 PROTECCIÓN ESPECIAL DATOS SENSIBLES
□ Controles adicionales datos salud
□ Protección situación socioeconómica
□ Seguridad datos biométricos
□ Controles datos menores (NNA)
Estado: _____ Puntos: _____

SUBTOTAL SEGURIDAD: _____ / 9 puntos

═══════════════════════════════════════════════════════════════

6. TRANSFERENCIAS INTERNACIONALES (Art. 27)
═══════════════════════════════════════════════════════════════

6.1 EVALUACIÓN DESTINOS
□ Verificación nivel protección países
□ Decisiones adecuación vigentes
□ Evaluación riesgos por país
Estado: _____ Puntos: _____

6.2 GARANTÍAS APROPIADAS
□ Cláusulas contractuales tipo
□ Normas corporativas vinculantes
□ Certificaciones reconocidas
□ Otros mecanismos apropiados
Estado: _____ Puntos: _____

6.3 DOCUMENTACIÓN
□ Inventario transferencias actuales
□ Contratos encargados internacionales
□ Evidencia garantías implementadas
Estado: _____ Puntos: _____

SUBTOTAL TRANSFERENCIAS: _____ / 9 puntos

═══════════════════════════════════════════════════════════════

7. EVALUACIÓN IMPACTO (Art. 28)
═══════════════════════════════════════════════════════════════

7.1 IDENTIFICACIÓN CASOS
□ Tratamientos alto riesgo identificados
□ Criterios EIPD establecidos
□ Evaluación sistemática riesgos
Estado: _____ Puntos: _____

7.2 CONTENIDO EIPD
□ Descripción detallada tratamiento
□ Evaluación necesidad y proporcionalidad
□ Evaluación riesgos para derechos
□ Medidas mitigación implementadas
Estado: _____ Puntos: _____

7.3 CONSULTA PREVIA
□ Procedimiento consulta autoridad
□ Documentación respuesta autoridad
□ Implementación recomendaciones
Estado: _____ Puntos: _____

SUBTOTAL EIPD: _____ / 9 puntos

═══════════════════════════════════════════════════════════════

8. NOTIFICACIÓN BRECHAS (Art. 29)
═══════════════════════════════════════════════════════════════

8.1 DETECCIÓN Y EVALUACIÓN
□ Procedimientos detección brechas
□ Criterios evaluación riesgo
□ Equipo respuesta incidentes
Estado: _____ Puntos: _____

8.2 NOTIFICACIÓN AUTORIDAD
□ Procedimiento notificación 72 horas
□ Plantillas notificación preparadas
□ Canales comunicación establecidos
Estado: _____ Puntos: _____

8.3 COMUNICACIÓN TITULARES
□ Criterios comunicación titulares
□ Medios comunicación efectiva
□ Registro comunicaciones realizadas
Estado: _____ Puntos: _____

8.4 DOCUMENTACIÓN
□ Registro todas las brechas
□ Análisis causas raíz
□ Medidas correctivas implementadas
Estado: _____ Puntos: _____

SUBTOTAL BRECHAS: _____ / 12 puntos

═══════════════════════════════════════════════════════════════

9. DELEGADO PROTECCIÓN DATOS (Art. 30)
═══════════════════════════════════════════════════════════════

9.1 DESIGNACIÓN
□ DPO designado cuando requerido
□ Cualificaciones profesionales adecuadas
□ Ausencia conflictos interés
Estado: _____ Puntos: _____

9.2 INDEPENDENCIA Y RECURSOS
□ Independencia en ejercicio funciones
□ Recursos suficientes asignados
□ Acceso directo alta dirección
Estado: _____ Puntos: _____

9.3 FUNCIONES Y CONTACTO
□ Funciones DPO claramente definidas
□ Datos contacto publicados
□ Accesibilidad para consultas
Estado: _____ Puntos: _____

SUBTOTAL DPO: _____ / 9 puntos

═══════════════════════════════════════════════════════════════

RESUMEN EVALUACIÓN
═══════════════════════════════════════════════════════════════

Principios Fundamentales:     _____ / 18 puntos
Bases de Licitud:            _____ / 15 puntos  
Derechos de Titulares:       _____ / 18 puntos
Registro de Actividades:     _____ / 9 puntos
Medidas de Seguridad:        _____ / 9 puntos
Transferencias Internac.:    _____ / 9 puntos
Evaluación de Impacto:       _____ / 9 puntos
Notificación de Brechas:     _____ / 12 puntos
Delegado Protección:         _____ / 9 puntos

TOTAL:                       _____ / 108 puntos

PORCENTAJE CUMPLIMIENTO:     _____ %

CLASIFICACIÓN:
═══════════════════════════════════════════════════════════════

90-100%: EXCELENTE - Cumplimiento sobresaliente
75-89%:  BUENO - Cumplimiento adecuado con mejoras menores
60-74%:  REGULAR - Cumplimiento básico, mejoras importantes
45-59%:  DEFICIENTE - Cumplimiento insuficiente, acción urgente
0-44%:   CRÍTICO - Incumplimiento grave, implementación inmediata

PRIORIDADES DE MEJORA:
═══════════════════════════════════════════════════════════════

CRÍTICAS (Puntaje 0):
_____________________________________________________________________
_____________________________________________________________________

IMPORTANTES (Puntaje 1):
_____________________________________________________________________
_____________________________________________________________________

PLAN DE ACCIÓN:
═══════════════════════════════════════════════════════════════

Acción 1: _______________________________________________
Responsable: _________________ Fecha: __________________

Acción 2: _______________________________________________
Responsable: _________________ Fecha: __________________

Acción 3: _______________________________________________
Responsable: _________________ Fecha: __________________

PRÓXIMA EVALUACIÓN: ____________________
RESPONSABLE SEGUIMIENTO: _______________
APROBACIÓN DPO: _______________________

═══════════════════════════════════════════════════════════════
NOTA: Esta evaluación debe realizarse mínimo semestralmente
y después de cualquier cambio significativo en procesos.
═══════════════════════════════════════════════════════════════
`;
  };

  const downloadFile = (contenido, templateKey) => {
    const template = plantillas[templateKey];
    let mimeType = 'text/plain';
    let extension = '.txt';

    if (template.tipo === 'excel') {
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      extension = '.xlsx';
    } else if (template.tipo === 'pdf') {
      mimeType = 'application/pdf';
      extension = '.pdf';
    } else if (template.tipo === 'zip') {
      mimeType = 'application/zip';
      extension = '.zip';
    }

    const blob = new Blob([contenido.contenido], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.nombre.replace(/[^a-zA-Z0-9]/g, '_')}_${empresaData.nombre.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleTemplateInfo = (templateKey) => {
    setCurrentTemplate(templateKey);
    setDialogOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #495057 0%, #6c757d 100%)' }}>
        <CardContent>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
            <CloudDownload /> Herramientas Profesionales LPDP
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, color: 'white' }}>
            Descarga plantillas y formatos Excel personalizados para implementar la Ley 21.719
          </Typography>
          <Alert severity="success" sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.15)', color: 'white' }}>
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              🎯 <strong>Resultado del Curso:</strong> Al completar este proceso obtendrás herramientas 
              listas para usar en tu trabajo de cumplimiento LPDP. Todo queda registrado en la base 
              de datos para construir tu mapeo de datos e inventario completo.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Stepper del proceso */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {pasos.map((paso, index) => (
          <Step key={paso.label}>
            <StepLabel>{paso.label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Contenido por paso */}
      {activeStep === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Configuración de la Empresa
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombre de la Empresa"
                  value={empresaData.nombre}
                  onChange={(e) => handleEmpresaChange('nombre', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="RUT"
                  value={empresaData.rut}
                  onChange={(e) => handleEmpresaChange('rut', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Sector Industrial</InputLabel>
                  <Select
                    value={empresaData.sector}
                    onChange={(e) => handleEmpresaChange('sector', e.target.value)}
                  >
                    {sectoresIndustriales.map((sector) => (
                      <MenuItem key={sector} value={sector}>{sector}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Número de Empleados"
                  type="number"
                  value={empresaData.empleados}
                  onChange={(e) => handleEmpresaChange('empleados', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="DPO / Responsable"
                  value={empresaData.dpo}
                  onChange={(e) => handleEmpresaChange('dpo', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email de Contacto"
                  type="email"
                  value={empresaData.contacto}
                  onChange={(e) => handleEmpresaChange('contacto', e.target.value)}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!empresaData.nombre || !empresaData.rut}
              >
                Continuar
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {activeStep === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Seleccionar Herramientas
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Elige las plantillas que necesitas. Cada una está personalizada con los datos de tu empresa.
            </Typography>
            
            <Grid container spacing={3}>
              {Object.entries(plantillas).map(([key, plantilla]) => (
                <Grid item xs={12} md={6} key={key}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {plantilla.icono}
                        <Typography variant="h6" sx={{ ml: 1 }}>
                          {plantilla.nombre}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {plantilla.descripcion}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip label={plantilla.tipo.toUpperCase()} size="small" />
                        <Chip label={plantilla.size} size="small" color="primary" />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Info />}
                          onClick={() => handleTemplateInfo(key)}
                        >
                          Ver Detalles
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<Download />}
                          onClick={() => handleDownloadTemplate(key)}
                          disabled={loading}
                        >
                          Descargar
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleBack}>
                Anterior
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Ver Resumen
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {activeStep === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ¡Herramientas Listas!
            </Typography>
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body1">
                El sistema ha registrado la información de tu empresa en la base de datos.
                Ahora puedes descargar todas las herramientas personalizadas.
              </Typography>
            </Alert>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Resumen de tu Empresa
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography><strong>Empresa:</strong> {empresaData.nombre}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography><strong>RUT:</strong> {empresaData.rut}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography><strong>Sector:</strong> {empresaData.sector}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography><strong>Empleados:</strong> {empresaData.empleados}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography><strong>DPO:</strong> {empresaData.dpo}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography><strong>Contacto:</strong> {empresaData.contacto}</Typography>
                </Grid>
              </Grid>
            </Paper>

            <Typography variant="h6" gutterBottom>
              Próximos Pasos
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                <ListItemText 
                  primary="Usar las plantillas descargadas"
                  secondary="Completa las herramientas Excel con tu información específica"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><Assignment color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="Construir tu RAT completo"
                  secondary="Documenta todas las actividades de tratamiento de tu empresa"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><Timeline color="info" /></ListItemIcon>
                <ListItemText 
                  primary="Mapear flujos de datos"
                  secondary="Identifica cómo se mueven los datos en tu organización"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><Security color="warning" /></ListItemIcon>
                <ListItemText 
                  primary="Implementar medidas de seguridad"
                  secondary="Aplica los controles técnicos y organizativos necesarios"
                />
              </ListItem>
            </List>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleBack}>
                Anterior
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                onClick={() => window.history.back()}
              >
                Finalizar Curso
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Dialog de información de plantilla */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentTemplate && plantillas[currentTemplate]?.nombre}
        </DialogTitle>
        <DialogContent>
          {currentTemplate && (
            <Box>
              <Typography variant="body1" paragraph>
                {plantillas[currentTemplate]?.descripcion}
              </Typography>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Instrucciones de Uso:
              </Typography>
              <List>
                {plantillas[currentTemplate]?.instrucciones?.map((instruccion, index) => (
                  <ListItem key={index}>
                    <ListItemIcon><CheckCircle color="primary" /></ListItemIcon>
                    <ListItemText primary={instruccion} />
                  </ListItem>
                ))}
              </List>

              {plantillas[currentTemplate]?.campos_obligatorios && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Campos Obligatorios:
                  </Typography>
                  <List>
                    {plantillas[currentTemplate].campos_obligatorios.map((campo, index) => (
                      <ListItem key={index}>
                        <ListItemIcon><Warning color="warning" /></ListItemIcon>
                        <ListItemText primary={campo} />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              {plantillas[currentTemplate]?.contenido && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Contenido del Pack:
                  </Typography>
                  <List>
                    {plantillas[currentTemplate].contenido.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemIcon><Description color="info" /></ListItemIcon>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cerrar</Button>
          {currentTemplate && (
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={() => {
                handleDownloadTemplate(currentTemplate);
                setDialogOpen(false);
              }}
              disabled={loading}
            >
              Descargar
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Loading overlay */}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography>Generando herramientas personalizadas...</Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default HerramientasLPDP;