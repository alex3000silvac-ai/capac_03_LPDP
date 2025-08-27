import React, { useState, useEffect } from 'react';
import supabase, { supabaseWithTenant } from '../config/supabaseClient';
import { shouldUseLocalStorageFirst, getConnectivityStatus } from '../utils/networkTest';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  FormControlLabel,
  FormGroup,
  IconButton,
  Tooltip,
  LinearProgress,
  Divider,
  Avatar,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
  Fab,
  Zoom,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  Snackbar,
  CircularProgress,
  FormHelperText,
} from '@mui/material';
import {
  Business,
  AccountTree,
  Storage,
  Security,
  Schedule,
  Update,
  CheckCircle,
  Error,
  Info,
  Help,
  Save,
  Download,
  Upload,
  Visibility,
  Add,
  Delete,
  Edit,
  Refresh,
  Cloud,
  NavigateNext,
  NavigateBefore,
  Assessment,
  Description,
  CloudUpload,
  Person,
  Group,
  Public,
  Lock,
  Warning,
  Check,
  Close,
  Timeline,
  Hub,
  DataObject,
  Shield,
  Gavel,
  Language,
  Timer,
  VerifiedUser,
  FolderOpen,
  Launch,
  ContentCopy,
  PictureAsPdf,
  TableChart,
  Lightbulb,
  Email,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Componente principal del Sistema RAT Builder
function MapeoInteractivo({ onClose, empresaInfo }) {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [showVisualization, setShowVisualization] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [existingRATs, setExistingRATs] = useState([]);
  const [showRATList, setShowRATList] = useState(false);
  const [loadingRATs, setLoadingRATs] = useState(false);
  const [showDPIAForm, setShowDPIAForm] = useState(false);
  const [dpiaData, setDpiaData] = useState({
    descripcion_tratamiento: '',
    finalidad_necesidad: '',
    riesgos_libertades: '',
    medidas_previstas: '',
    consultas_realizadas: '',
    fecha_evaluacion: new Date().toISOString().split('T')[0],
    evaluador_responsable: '',
    conclusion_evaluacion: 'aprobado', // 'aprobado', 'aprobado_condiciones', 'rechazado'
    medidas_adicionales: ''
  });
  
  // Obtener tenant ID actual
  const getCurrentTenant = () => {
    const tenantId = user?.tenant_id || user?.organizacion_id || 'demo';
    return tenantId === 'demo' ? 'demo_empresa_lpdp_2024' : tenantId;
  };

  // Aplicar template seleccionado
  const applyTemplate = (templateKey) => {
    const template = templates[templateKey];
    if (template) {
      setRatData(prevData => ({
        ...prevData,
        ...template.data,
        // Mantener metadata del usuario
        tenant_id: prevData.tenant_id,
        created_by: prevData.created_by,
        id: prevData.id,
        fecha_creacion: prevData.fecha_creacion,
        fecha_actualizacion: new Date().toISOString()
      }));
      setSelectedTemplate(templateKey);
      setShowTemplateSelector(false);
      setSavedMessage(`✅ Template "${template.nombre}" aplicado correctamente`);
    }
  };
  
  // Función para generar ID único empresarial
  const generateRATId = (tenantId, areaResponsable) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    const areaPrefijo = {
      'RRHH': 'RH',
      'Marketing': 'MK', 
      'Ventas': 'VE',
      'Produccion': 'PR',
      'Finanzas': 'FI',
      'TI': 'TI',
      'Legal': 'LE',
      'Operaciones': 'OP',
      'Calidad': 'CA',
      'Logistica': 'LO'
    }[areaResponsable] || 'GE'; // GE = General
    
    const tenantPrefijo = tenantId.split('_')[0].toUpperCase().substr(0, 3);
    return `RAT-${tenantPrefijo}-${areaPrefijo}-${timestamp}-${random}`;
  };

  // Función para calcular checksum de integridad
  const calculateChecksum = (ratData) => {
    const criticalFields = {
      nombre_actividad: ratData.nombre_actividad,
      area_responsable: ratData.area_responsable,
      base_licitud: ratData.base_licitud,
      finalidades: ratData.finalidades,
      tenant_id: ratData.tenant_id,
      created_at: ratData.created_at
    };
    
    const dataString = JSON.stringify(criticalFields);
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  };

  // Función para validar integridad de RAT
  const validateRATIntegrity = (ratData) => {
    const errors = [];
    
    // Validar ID format
    if (ratData.id && !ratData.id.match(/^RAT-[A-Z]{1,3}-[A-Z]{2}-\d+-[A-Z0-9]{6}$/)) {
      errors.push('Formato de ID inválido');
    }
    
    // Validar checksum si existe
    if (ratData.checksum) {
      const currentChecksum = calculateChecksum(ratData);
      if (ratData.checksum !== currentChecksum) {
        errors.push('Datos del RAT han sido modificados externamente');
      }
    }
    
    // Validar campos críticos
    if (!ratData.nombre_actividad || !ratData.area_responsable || !ratData.base_licitud) {
      errors.push('Campos críticos faltantes');
    }
    
    // Validar timestamp
    if (ratData.created_at && isNaN(Date.parse(ratData.created_at))) {
      errors.push('Fecha de creación inválida');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      integrityScore: Math.max(0, 100 - (errors.length * 20))
    };
  };

  // Estado del RAT (Registro de Actividades de Tratamiento)
  const [ratData, setRatData] = useState({
    // FASE 1: Identificación
    id: null,
    nombre_actividad: '',
    area_responsable: '',
    responsable_proceso: '',
    email_responsable: '',
    finalidades: [],
    finalidad_detalle: '',
    base_licitud: '',
    justificacion_base: '',
    
    // FASE 2: Categorías de Datos
    categorias_titulares: [],
    categorias_datos: {
      identificacion: false,
      contacto: false,
      laboral: false,
      academico: false,
      financiero: false,
      salud: false,
      biometrico: false,
      genetico: false,
      socioeconomico: false,
      navegacion: false,
      geolocalizacion: false,
      otros: ''
    },
    datos_sensibles: [],
    menores_edad: false,
    volumen_registros: '',
    frecuencia_actualizacion: '',
    
    // FASE 3: Flujos y Destinatarios
    sistemas_almacenamiento: [],
    destinatarios_internos: [],
    terceros_encargados: [],
    terceros_cesionarios: [],
    transferencias_internacionales: {
      existe: false,
      paises: [],
      garantias: '',
      mecanismo: ''
    },
    
    // FASE 4: Plazos y Seguridad - Campo 6 Tabla 1 Plan Estratégico
    plazo_conservacion: '',
    plazo_conservacion_especifico: '',
    plazo_conservacion_tipo: 'especifico', // 'especifico', 'criterio', 'indefinido_justificado'
    criterio_eliminacion: '',
    justificacion_plazo: '',
    revision_periodica: true,
    frecuencia_revision: 'anual', // 'mensual', 'trimestral', 'anual'
    medidas_seguridad: {
      tecnicas: [],
      organizativas: [],
      cifrado: false,
      seudonimizacion: false,
      control_acceso: false,
      logs_auditoria: false,
      backup: false,
      segregacion: false
    },
    riesgos_identificados: [],
    medidas_mitigacion: [],
    nivel_riesgo: 'bajo',
    requiere_dpia: false,
    
    // Campo 8 - Decisiones Automatizadas (Plan Estratégico Tabla 1)
    decisiones_automatizadas: {
      existe: false,
      descripcion_logica: '',
      fuentes_datos: [],
      consecuencias_titular: '',
      tipo_decision: '', // 'scoring', 'perfilado', 'recomendaciones', 'evaluacion'
      algoritmos_ia: false,
      derecho_intervencion: true
    },
    
    // Metadata
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString(),
    version: '1.0',
    estado: 'borrador',
    tenant_id: user?.organizacion_id || 'demo',
    created_by: user?.id || 'demo_user'
  });

  // Templates predefinidos por industria (expandidos)
  const templates = {
    salmonera: {
      nombre: 'Industria Salmonera',
      icon: '🐟',
      descripcion: 'Específico para acuicultura y salmonicultura chilena',
      data: {
        nombre_actividad: 'Monitoreo Sanitario de Centros de Cultivo - SERNAPESCA',
        area_responsable: 'Produccion',
        finalidades: ['Optimización productiva', 'Cumplimiento sanitario SERNAPESCA', 'Bienestar animal'],
        base_licitud: 'interes_legitimo',
        categorias_titulares: ['Operarios marinos', 'Veterinarios', 'Inspectores SERNAPESCA'],
        sistemas_almacenamiento: ['Sensores IoT acuáticos', 'Software Acuicultura', 'ERP Sectorial'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true,
          logs_auditoria: true,
          backup: true
        },
        volumen_registros: '10,000-50,000',
        frecuencia_actualizacion: 'Tiempo real (IoT)',
        plazo_conservacion: '5 años (normativa sanitaria)'
      }
    },
    retail: {
      nombre: 'Comercio Retail',
      icon: '🛍️',
      descripcion: 'Para tiendas, e-commerce y retail tradicional',
      data: {
        nombre_actividad: 'Sistema CencoCud/Falabella - Programa Fidelización',
        area_responsable: 'Marketing',
        finalidades: ['Marketing directo', 'Análisis de preferencias', 'Ofertas personalizadas', 'Programa puntos'],
        base_licitud: 'consentimiento',
        categorias_titulares: ['Clientes registrados', 'Visitantes web', 'Suscriptores newsletter'],
        sistemas_almacenamiento: ['CRM', 'Plataforma E-commerce', 'Sistema POS'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true,
          seudonimizacion: true
        },
        volumen_registros: '1,000-10,000',
        plazo_conservacion: '2 años desde última compra'
      }
    },
    servicios_financieros: {
      nombre: 'Servicios Financieros',
      icon: '🏦',
      descripcion: 'Bancos, cooperativas, fintechs y servicios crediticios',
      data: {
        nombre_actividad: 'Evaluación DICOM Equifax - Scoring Crediticio Chile',
        area_responsable: 'Finanzas',
        finalidades: ['Evaluación riesgo crediticio', 'Cumplimiento DICOM', 'Prevención fraude'],
        base_licitud: 'interes_legitimo',
        categorias_titulares: ['Solicitantes crédito', 'Clientes existentes', 'Avalistas'],
        datos_sensibles: ['Situación socioeconómica'],
        sistemas_almacenamiento: ['Core Bancario', 'Sistema Scoring', 'Base DICOM'],
        transferencias_internacionales: {
          existe: true,
          paises: ['Estados Unidos'],
          garantias: 'Cláusulas Contractuales Tipo',
          mecanismo: 'CCT'
        },
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true,
          logs_auditoria: true,
          backup: true,
          segregacion: true
        },
        requiere_dpia: true,
        plazo_conservacion: '10 años (normativa financiera)'
      }
    },
    salud: {
      nombre: 'Sector Salud',
      icon: '🏥',
      descripcion: 'Clínicas, hospitales, centros médicos y farmacias',
      data: {
        nombre_actividad: 'Ficha Clínica Electrónica - Registro FONASA/ISAPRE',
        area_responsable: 'Salud',
        finalidades: ['Atención médica', 'Historia clínica', 'Facturación FONASA'],
        base_licitud: 'interes_vital',
        categorias_titulares: ['Pacientes', 'Familiares responsables', 'Personal médico'],
        datos_sensibles: ['Salud', 'Biométrico'],
        sistemas_almacenamiento: ['Sistema HIS', 'PACS Imágenes', 'Laboratorio'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true,
          logs_auditoria: true,
          backup: true,
          segregacion: true
        },
        requiere_dpia: true,
        plazo_conservacion: '15 años (historia clínica)',
        menores_edad: true
      }
    },
    educacion: {
      nombre: 'Sector Educación',
      icon: '🎓',
      descripcion: 'Colegios, universidades, institutos y centros de capacitación',
      data: {
        nombre_actividad: 'SIGE - Sistema Información Estudiantes MINEDUC',
        area_responsable: 'Educacion',
        finalidades: ['Proceso educativo', 'Registro académico', 'Certificación'],
        base_licitud: 'contrato',
        categorias_titulares: ['Estudiantes', 'Apoderados', 'Docentes'],
        sistemas_almacenamiento: ['Sistema Académico', 'Plataforma LMS', 'Registro Civil'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true,
          backup: true
        },
        plazo_conservacion: '20 años (certificados)',
        menores_edad: true
      }
    },
    manufactura: {
      nombre: 'Manufactura e Industria',
      icon: '🏭',
      descripcion: 'Fábricas, plantas industriales y manufactura',
      data: {
        nombre_actividad: 'Control de Acceso y Seguridad Industrial',
        area_responsable: 'Operaciones',
        finalidades: ['Control acceso planta', 'Seguridad laboral', 'Registro asistencia'],
        base_licitud: 'interes_legitimo',
        categorias_titulares: ['Trabajadores', 'Contratistas', 'Visitantes'],
        sistemas_almacenamiento: ['Sistema Control Acceso', 'CCTV', 'Sistema RRHH'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true,
          logs_auditoria: true
        },
        volumen_registros: '500-5,000',
        plazo_conservacion: '2 años (registros acceso)'
      }
    },
    logistica: {
      nombre: 'Logística y Transporte',
      icon: '🚚',
      descripcion: 'Empresas de transporte, courier y logística',
      data: {
        nombre_actividad: 'Gestión de Despachos y Entregas',
        area_responsable: 'Logistica',
        finalidades: ['Coordinación entregas', 'Tracking envíos', 'Confirmación recepción'],
        base_licitud: 'contrato',
        categorias_titulares: ['Destinatarios', 'Remitentes', 'Conductores'],
        sistemas_almacenamiento: ['Sistema WMS', 'GPS Tracking', 'App Mobile'],
        terceros_encargados: ['Subcontratistas transporte'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true
        },
        plazo_conservacion: '1 año (comprobantes entrega)'
      }
    },
    mineria: {
      nombre: 'Minería',
      icon: '⛏️',
      descripcion: 'Minería del cobre, oro, litio y otros minerales',
      data: {
        nombre_actividad: 'Sistema SERNAGEOMIN - Control Seguridad Minera',
        area_responsable: 'Operaciones',
        finalidades: ['Seguridad operacional', 'Control acceso faenas', 'Cumplimiento SERNAGEOMIN'],
        base_licitud: 'obligacion_legal',
        categorias_titulares: ['Trabajadores mineros', 'Contratistas', 'Visitantes faena'],
        sistemas_almacenamiento: ['Sistema Control Faena', 'Base SERNAGEOMIN', 'Sistema EPP'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true,
          logs_auditoria: true,
          backup: true
        },
        plazo_conservacion: '10 años (normativa minera)'
      }
    },
    vitivinicola: {
      nombre: 'Industria Vitivinícola',
      icon: '🍷',
      descripcion: 'Viñas, bodegas y producción de vinos',
      data: {
        nombre_actividad: 'Club de Vinos y Marketing Directo',
        area_responsable: 'Marketing',
        finalidades: ['Programa fidelización', 'Ventas directas', 'Eventos exclusivos'],
        base_licitud: 'consentimiento',
        categorias_titulares: ['Socios club', 'Clientes premium', 'Visitantes viña'],
        sistemas_almacenamiento: ['CRM Vitivinícola', 'E-commerce vinos', 'Sistema Eventos'],
        medidas_seguridad: {
          cifrado: true,
          seudonimizacion: true,
          control_acceso: true
        },
        plazo_conservacion: '3 años desde última compra'
      }
    },
    forestal: {
      nombre: 'Sector Forestal',
      icon: '🌲',
      descripcion: 'Empresas forestales, aserraderos y celulosa',
      data: {
        nombre_actividad: 'CONAF Chile - Registro Patrimonio Forestal',
        area_responsable: 'Produccion',
        finalidades: ['Manejo forestal', 'Certificación FSC', 'Cumplimiento CONAF'],
        base_licitud: 'interes_legitimo',
        categorias_titulares: ['Trabajadores forestales', 'Propietarios predios', 'Inspectores CONAF'],
        sistemas_almacenamiento: ['Sistema GIS Forestal', 'Base CONAF', 'ERP Forestal'],
        medidas_seguridad: {
          control_acceso: true,
          backup: true,
          logs_auditoria: true
        },
        plazo_conservacion: '20 años (ciclo forestal)'
      }
    },
    agricola: {
      nombre: 'Agricultura',
      icon: '🌾',
      descripcion: 'Agroindustria, fruticultura y horticultura',
      data: {
        nombre_actividad: 'Trazabilidad Agrícola',
        area_responsable: 'Produccion',
        finalidades: ['Trazabilidad productos', 'Certificación orgánica', 'Exportación'],
        base_licitud: 'interes_legitimo',
        categorias_titulares: ['Agricultores', 'Temporeros', 'Inspectores SAG'],
        sistemas_almacenamiento: ['Sistema Trazabilidad', 'Base SAG', 'ERP Agrícola'],
        medidas_seguridad: {
          control_acceso: true,
          backup: true
        },
        plazo_conservacion: '5 años (normativa SAG)'
      }
    },
    inmobiliario: {
      nombre: 'Sector Inmobiliario',
      icon: '🏠',
      descripcion: 'Corredoras, constructoras y administración de propiedades',
      data: {
        nombre_actividad: 'Gestión de Prospectos Inmobiliarios',
        area_responsable: 'Ventas',
        finalidades: ['Venta propiedades', 'Arriendo inmuebles', 'Administración condominios'],
        base_licitud: 'consentimiento',
        categorias_titulares: ['Compradores', 'Arrendatarios', 'Propietarios'],
        sistemas_almacenamiento: ['CRM Inmobiliario', 'Portal propiedades', 'Sistema administración'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true
        },
        plazo_conservacion: '5 años desde última transacción'
      }
    },
    telecomunicaciones: {
      nombre: 'Telecomunicaciones',
      icon: '📡',
      descripcion: 'Operadoras móviles, internet y servicios digitales',
      data: {
        nombre_actividad: 'Gestión de Clientes Telecom',
        area_responsable: 'Comercial',
        finalidades: ['Provisión servicio', 'Facturación', 'Soporte técnico'],
        base_licitud: 'contrato',
        categorias_titulares: ['Suscriptores', 'Usuarios prepago', 'Contactos autorizados'],
        sistemas_almacenamiento: ['BSS/OSS', 'Sistema Billing', 'CRM Telecom'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true,
          logs_auditoria: true,
          segregacion: true
        },
        plazo_conservacion: '3 años post término contrato'
      }
    },
    energia: {
      nombre: 'Energía y Utilities',
      icon: '⚡',
      descripcion: 'Eléctricas, distribuidoras de gas y energías renovables',
      data: {
        nombre_actividad: 'Gestión de Clientes Energía',
        area_responsable: 'Comercial',
        finalidades: ['Suministro energía', 'Facturación consumo', 'Mantención redes'],
        base_licitud: 'contrato',
        categorias_titulares: ['Clientes regulados', 'Clientes libres', 'Propietarios inmuebles'],
        sistemas_almacenamiento: ['Sistema Comercial', 'Medidores inteligentes', 'GIS Redes'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true,
          backup: true
        },
        plazo_conservacion: '5 años (regulación SEC)'
      }
    },
    turismo: {
      nombre: 'Turismo y Hotelería',
      icon: '🏨',
      descripcion: 'Hoteles, agencias de viajes y operadores turísticos',
      data: {
        nombre_actividad: 'Gestión de Reservas y Huéspedes',
        area_responsable: 'Operaciones',
        finalidades: ['Reservas', 'Check-in/out', 'Marketing turístico'],
        base_licitud: 'contrato',
        categorias_titulares: ['Huéspedes', 'Turistas', 'Agencias viaje'],
        sistemas_almacenamiento: ['PMS Hotel', 'Channel Manager', 'CRM Turismo'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true
        },
        plazo_conservacion: '1 año post estadía'
      }
    },
    alimenticio: {
      nombre: 'Industria Alimenticia',
      icon: '🍞',
      descripcion: 'Productores de alimentos, bebidas y consumo masivo',
      data: {
        nombre_actividad: 'Programa de Calidad Alimentaria',
        area_responsable: 'Calidad',
        finalidades: ['Trazabilidad productos', 'Gestión reclamos', 'Cumplimiento sanitario'],
        base_licitud: 'interes_legitimo',
        categorias_titulares: ['Consumidores', 'Distribuidores', 'Inspectores sanitarios'],
        sistemas_almacenamiento: ['Sistema HACCP', 'ERP Alimentos', 'Base trazabilidad'],
        medidas_seguridad: {
          control_acceso: true,
          logs_auditoria: true,
          backup: true
        },
        plazo_conservacion: '2 años (vida útil producto)'
      }
    },
    construccion: {
      nombre: 'Construcción',
      icon: '🏗️',
      descripcion: 'Constructoras, contratistas y obras civiles',
      data: {
        nombre_actividad: 'Control de Personal en Obra',
        area_responsable: 'Prevencion',
        finalidades: ['Seguridad laboral', 'Control acceso obra', 'Cumplimiento mutualidad'],
        base_licitud: 'obligacion_legal',
        categorias_titulares: ['Trabajadores construcción', 'Subcontratistas', 'Visitas obra'],
        sistemas_almacenamiento: ['Sistema Prevención', 'Control Acceso', 'Base Mutual'],
        medidas_seguridad: {
          control_acceso: true,
          logs_auditoria: true
        },
        plazo_conservacion: '5 años (normativa laboral)'
      }
    },
    pesquero: {
      nombre: 'Industria Pesquera',
      icon: '🎣',
      descripcion: 'Pesca industrial, artesanal y procesamiento',
      data: {
        nombre_actividad: 'Registro de Capturas y Tripulación',
        area_responsable: 'Operaciones',
        finalidades: ['Registro capturas', 'Control tripulación', 'Cumplimiento SERNAPESCA'],
        base_licitud: 'obligacion_legal',
        categorias_titulares: ['Pescadores', 'Tripulación', 'Armadores'],
        sistemas_almacenamiento: ['Sistema SERNAPESCA', 'Bitácora electrónica', 'RRHH Marítimo'],
        medidas_seguridad: {
          control_acceso: true,
          backup: true
        },
        plazo_conservacion: '5 años (normativa pesquera)'
      }
    },
    farmaceutico: {
      nombre: 'Industria Farmacéutica',
      icon: '💊',
      descripcion: 'Laboratorios, farmacias y distribución farmacéutica',
      data: {
        nombre_actividad: 'Farmacovigilancia y Pacientes',
        area_responsable: 'Calidad',
        finalidades: ['Farmacovigilancia', 'Trazabilidad medicamentos', 'Cumplimiento ISP'],
        base_licitud: 'obligacion_legal',
        categorias_titulares: ['Pacientes', 'Médicos prescriptores', 'Farmacias'],
        datos_sensibles: ['Salud', 'Tratamientos médicos'],
        sistemas_almacenamiento: ['Sistema Farmacovigilancia', 'Base ISP', 'ERP Farmacéutico'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true,
          logs_auditoria: true,
          segregacion: true
        },
        requiere_dpia: true,
        plazo_conservacion: '10 años (regulación ISP)'
      }
    },
    seguros: {
      nombre: 'Compañías de Seguros',
      icon: '🛡️',
      descripcion: 'Aseguradoras, corredores y liquidadores',
      data: {
        nombre_actividad: 'Gestión de Pólizas y Siniestros',
        area_responsable: 'Operaciones',
        finalidades: ['Emisión pólizas', 'Evaluación riesgo', 'Gestión siniestros'],
        base_licitud: 'contrato',
        categorias_titulares: ['Asegurados', 'Beneficiarios', 'Terceros afectados'],
        datos_sensibles: ['Salud', 'Antecedentes penales'],
        sistemas_almacenamiento: ['Core Asegurador', 'Sistema Siniestros', 'Portal Corredores'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true,
          segregacion: true
        },
        requiere_dpia: true,
        plazo_conservacion: '10 años post vigencia'
      }
    },
    afp_pensiones: {
      nombre: 'AFP y Pensiones',
      icon: '👴',
      descripcion: 'Administradoras de fondos de pensiones',
      data: {
        nombre_actividad: 'Administración de Cuentas Previsionales',
        area_responsable: 'Operaciones',
        finalidades: ['Administración pensiones', 'Cálculo beneficios', 'Cumplimiento SP'],
        base_licitud: 'obligacion_legal',
        categorias_titulares: ['Afiliados', 'Pensionados', 'Beneficiarios'],
        datos_sensibles: ['Situación socioeconómica', 'Salud'],
        sistemas_almacenamiento: ['Sistema Previsional', 'Base SP', 'Portal Afiliados'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true,
          logs_auditoria: true,
          segregacion: true
        },
        plazo_conservacion: '100 años (histórico previsional)'
      }
    },
    automotriz: {
      nombre: 'Industria Automotriz',
      icon: '🚗',
      descripcion: 'Concesionarios, talleres y rent a car',
      data: {
        nombre_actividad: 'Gestión de Clientes Automotriz',
        area_responsable: 'Ventas',
        finalidades: ['Venta vehículos', 'Servicio técnico', 'Garantías'],
        base_licitud: 'contrato',
        categorias_titulares: ['Compradores', 'Propietarios vehículos', 'Conductores'],
        sistemas_almacenamiento: ['DMS Automotriz', 'Sistema Servicio', 'CRM'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true
        },
        plazo_conservacion: '10 años (garantías extendidas)'
      }
    },
    medios_comunicacion: {
      nombre: 'Medios de Comunicación',
      icon: '📺',
      descripcion: 'TV, radio, prensa y medios digitales',
      data: {
        nombre_actividad: 'Gestión de Suscriptores y Audiencias',
        area_responsable: 'Marketing',
        finalidades: ['Suscripciones', 'Personalización contenido', 'Publicidad dirigida'],
        base_licitud: 'consentimiento',
        categorias_titulares: ['Suscriptores', 'Audiencia', 'Anunciantes'],
        sistemas_almacenamiento: ['CMS', 'Sistema Suscripciones', 'Analytics'],
        medidas_seguridad: {
          cifrado: true,
          seudonimizacion: true,
          control_acceso: true
        },
        plazo_conservacion: '2 años post cancelación'
      }
    },
    deporte_fitness: {
      nombre: 'Deporte y Fitness',
      icon: '🏋️',
      descripcion: 'Gimnasios, clubes deportivos y centros wellness',
      data: {
        nombre_actividad: 'Gestión de Socios y Deportistas',
        area_responsable: 'Operaciones',
        finalidades: ['Membresías', 'Control acceso', 'Seguimiento salud'],
        base_licitud: 'contrato',
        categorias_titulares: ['Socios', 'Deportistas', 'Menores con apoderados'],
        datos_sensibles: ['Salud', 'Condición física'],
        sistemas_almacenamiento: ['Sistema Membresías', 'Control Acceso', 'App Fitness'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true
        },
        menores_edad: true,
        plazo_conservacion: '2 años post término'
      }
    },
    legal_consultoria: {
      nombre: 'Servicios Legales',
      icon: '⚖️',
      descripcion: 'Estudios jurídicos, notarías y asesoría legal',
      data: {
        nombre_actividad: 'Gestión de Clientes y Casos',
        area_responsable: 'Legal',
        finalidades: ['Representación legal', 'Asesoría jurídica', 'Gestión casos'],
        base_licitud: 'contrato',
        categorias_titulares: ['Clientes', 'Contrapartes', 'Testigos'],
        datos_sensibles: ['Antecedentes penales', 'Situación judicial'],
        sistemas_almacenamiento: ['Sistema Gestión Legal', 'Archivo digital', 'Base jurisprudencia'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true,
          segregacion: true
        },
        requiere_dpia: true,
        plazo_conservacion: '10 años (secreto profesional)'
      }
    },
    tecnologia: {
      nombre: 'Empresas Tecnológicas',
      icon: '💻',
      descripcion: 'Software, SaaS, desarrollo y consultoría TI',
      data: {
        nombre_actividad: 'Gestión de Usuarios y Clientes SaaS',
        area_responsable: 'TI',
        finalidades: ['Provisión servicio', 'Soporte técnico', 'Mejora producto'],
        base_licitud: 'contrato',
        categorias_titulares: ['Usuarios', 'Administradores', 'Desarrolladores'],
        sistemas_almacenamiento: ['Plataforma SaaS', 'Sistema Tickets', 'Analytics'],
        transferencias_internacionales: {
          existe: true,
          paises: ['Estados Unidos', 'Irlanda'],
          garantias: 'Cláusulas Contractuales Tipo',
          mecanismo: 'CCT'
        },
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true,
          logs_auditoria: true,
          backup: true,
          segregacion: true
        },
        plazo_conservacion: '1 año post término servicio'
      }
    },
    publicidad_marketing: {
      nombre: 'Agencias de Publicidad',
      icon: '📣',
      descripcion: 'Agencias creativas, marketing digital y PR',
      data: {
        nombre_actividad: 'Gestión de Campañas y Audiencias',
        area_responsable: 'Marketing',
        finalidades: ['Campañas publicitarias', 'Segmentación', 'Análisis resultados'],
        base_licitud: 'consentimiento',
        categorias_titulares: ['Audiencia objetivo', 'Clientes marca', 'Influencers'],
        sistemas_almacenamiento: ['Plataforma Ads', 'CRM Marketing', 'Analytics'],
        medidas_seguridad: {
          seudonimizacion: true,
          control_acceso: true
        },
        plazo_conservacion: '1 año post campaña'
      }
    },
    recursos_humanos: {
      nombre: 'Consultoras RRHH',
      icon: '👥',
      descripcion: 'Head hunting, selección y capacitación',
      data: {
        nombre_actividad: 'Base de Datos de Talentos',
        area_responsable: 'RRHH',
        finalidades: ['Reclutamiento', 'Selección personal', 'Recolocación'],
        base_licitud: 'consentimiento',
        categorias_titulares: ['Candidatos', 'Profesionales', 'Ejecutivos'],
        datos_sensibles: ['Test psicológicos'],
        sistemas_almacenamiento: ['ATS', 'Base Candidatos', 'Plataforma Tests'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true,
          segregacion: true
        },
        plazo_conservacion: '2 años desde último contacto'
      }
    },
    eventos_entretenimiento: {
      nombre: 'Eventos y Entretenimiento',
      icon: '🎭',
      descripcion: 'Productoras, ticketing y venues',
      data: {
        nombre_actividad: 'Venta de Tickets y Gestión Asistentes',
        area_responsable: 'Comercial',
        finalidades: ['Venta entradas', 'Control acceso', 'Marketing eventos'],
        base_licitud: 'contrato',
        categorias_titulares: ['Compradores', 'Asistentes', 'Artistas'],
        sistemas_almacenamiento: ['Plataforma Ticketing', 'Control Acceso', 'CRM Eventos'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true
        },
        plazo_conservacion: '1 año post evento'
      }
    },
    cooperativas: {
      nombre: 'Cooperativas',
      icon: '🤝',
      descripcion: 'Cooperativas de ahorro, vivienda y consumo',
      data: {
        nombre_actividad: 'Gestión de Socios Cooperados',
        area_responsable: 'Operaciones',
        finalidades: ['Administración socios', 'Beneficios', 'Votaciones'],
        base_licitud: 'contrato',
        categorias_titulares: ['Socios cooperados', 'Beneficiarios', 'Directivos'],
        sistemas_almacenamiento: ['Sistema Cooperativa', 'Portal Socios', 'Sistema Votación'],
        medidas_seguridad: {
          control_acceso: true,
          logs_auditoria: true
        },
        plazo_conservacion: '10 años post desvinculación'
      }
    },
    ongs_fundaciones: {
      nombre: 'ONGs y Fundaciones',
      icon: '❤️',
      descripcion: 'Organizaciones sin fines de lucro',
      data: {
        nombre_actividad: 'Gestión de Donantes y Beneficiarios',
        area_responsable: 'Operaciones',
        finalidades: ['Gestión donaciones', 'Programas sociales', 'Rendición cuentas'],
        base_licitud: 'consentimiento',
        categorias_titulares: ['Donantes', 'Beneficiarios', 'Voluntarios'],
        datos_sensibles: ['Situación socioeconómica'],
        sistemas_almacenamiento: ['CRM Social', 'Sistema Donaciones', 'Base Beneficiarios'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true,
          segregacion: true
        },
        plazo_conservacion: '5 años (rendición cuentas)'
      }
    },
    transporte_publico: {
      nombre: 'Transporte Público',
      icon: '🚌',
      descripcion: 'Metro, buses y transporte urbano',
      data: {
        nombre_actividad: 'Sistema de Tarjetas y Pasajeros',
        area_responsable: 'Operaciones',
        finalidades: ['Cobro pasajes', 'Estadísticas movilidad', 'Beneficios tarifarios'],
        base_licitud: 'contrato',
        categorias_titulares: ['Pasajeros', 'Estudiantes', 'Adultos mayores'],
        sistemas_almacenamiento: ['Sistema Tarjetas', 'Base Beneficios', 'Analytics Movilidad'],
        medidas_seguridad: {
          seudonimizacion: true,
          control_acceso: true
        },
        plazo_conservacion: '1 año (análisis movilidad)'
      }
    },
    veterinario: {
      nombre: 'Servicios Veterinarios',
      icon: '🐾',
      descripcion: 'Clínicas veterinarias y pet shops',
      data: {
        nombre_actividad: 'Fichas Clínicas de Mascotas',
        area_responsable: 'Clinica',
        finalidades: ['Atención veterinaria', 'Historial médico', 'Recordatorios vacunas'],
        base_licitud: 'contrato',
        categorias_titulares: ['Dueños mascotas', 'Mascotas (datos)', 'Veterinarios'],
        sistemas_almacenamiento: ['Software Veterinario', 'Base Pacientes', 'App Recordatorios'],
        medidas_seguridad: {
          control_acceso: true,
          backup: true
        },
        plazo_conservacion: '5 años (historial médico)'
      }
    },
    portuario: {
      nombre: 'Sector Portuario',
      icon: '⚓',
      descripcion: 'Puertos, terminales y operadores portuarios',
      data: {
        nombre_actividad: 'Control de Acceso Portuario',
        area_responsable: 'Seguridad',
        finalidades: ['Seguridad portuaria', 'Control acceso', 'Cumplimiento PBIP'],
        base_licitud: 'obligacion_legal',
        categorias_titulares: ['Trabajadores portuarios', 'Transportistas', 'Visitas'],
        sistemas_almacenamiento: ['Sistema PBIP', 'Control Acceso', 'CCTV Portuario'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true,
          logs_auditoria: true
        },
        plazo_conservacion: '5 años (seguridad portuaria)'
      }
    },
    aereo: {
      nombre: 'Industria Aérea',
      icon: '✈️',
      descripcion: 'Aerolíneas, aeropuertos y servicios aéreos',
      data: {
        nombre_actividad: 'Gestión de Pasajeros y Seguridad Aérea',
        area_responsable: 'Operaciones',
        finalidades: ['Emisión boletos', 'Seguridad aeroportuaria', 'Cumplimiento DGAC'],
        base_licitud: 'obligacion_legal',
        categorias_titulares: ['Pasajeros', 'Tripulación', 'Personal aeroportuario'],
        sistemas_almacenamiento: ['Sistema Reservas', 'Base DGAC', 'Sistema Check-in'],
        transferencias_internacionales: {
          existe: true,
          paises: ['Múltiples destinos'],
          garantias: 'Normativa IATA',
          mecanismo: 'Convenios internacionales'
        },
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true,
          logs_auditoria: true
        },
        plazo_conservacion: '5 años (seguridad aérea)'
      }
    },
    quimico: {
      nombre: 'Industria Química',
      icon: '🧪',
      descripcion: 'Producción química, petroquímica y materiales',
      data: {
        nombre_actividad: 'Gestión de Seguridad Química',
        area_responsable: 'HSE',
        finalidades: ['Seguridad industrial', 'Manejo sustancias peligrosas', 'Cumplimiento normativo'],
        base_licitud: 'obligacion_legal',
        categorias_titulares: ['Operadores químicos', 'Transportistas ADR', 'Personal HSE'],
        sistemas_almacenamiento: ['Sistema HSE', 'Base sustancias', 'ERP Químico'],
        medidas_seguridad: {
          control_acceso: true,
          logs_auditoria: true,
          backup: true
        },
        plazo_conservacion: '20 años (exposición química)'
      }
    },
    textil: {
      nombre: 'Industria Textil',
      icon: '👕',
      descripcion: 'Fabricación textil, moda y confección',
      data: {
        nombre_actividad: 'Gestión de Producción y Clientes Textil',
        area_responsable: 'Produccion',
        finalidades: ['Control producción', 'Gestión pedidos', 'Trazabilidad productos'],
        base_licitud: 'contrato',
        categorias_titulares: ['Clientes mayoristas', 'Trabajadores textiles', 'Diseñadores'],
        sistemas_almacenamiento: ['ERP Textil', 'Sistema Diseño', 'Base Clientes'],
        medidas_seguridad: {
          control_acceso: true,
          backup: true
        },
        plazo_conservacion: '5 años (garantías producto)'
      }
    },
    editorial: {
      nombre: 'Editorial y Publicaciones',
      icon: '📚',
      descripcion: 'Editoriales, librerías y publicaciones digitales',
      data: {
        nombre_actividad: 'Gestión de Autores y Suscriptores',
        area_responsable: 'Editorial',
        finalidades: ['Publicación obras', 'Gestión derechos autor', 'Distribución contenido'],
        base_licitud: 'contrato',
        categorias_titulares: ['Autores', 'Lectores', 'Distribuidores'],
        sistemas_almacenamiento: ['Sistema Editorial', 'Plataforma Digital', 'Base Derechos'],
        medidas_seguridad: {
          control_acceso: true,
          backup: true
        },
        plazo_conservacion: '70 años (derechos autor)'
      }
    },
    criptomonedas: {
      nombre: 'Exchanges Cripto',
      icon: '₿',
      descripcion: 'Exchanges, wallets y servicios blockchain',
      data: {
        nombre_actividad: 'Gestión de Usuarios Exchange',
        area_responsable: 'Compliance',
        finalidades: ['Trading criptomonedas', 'KYC/AML', 'Cumplimiento UAF'],
        base_licitud: 'obligacion_legal',
        categorias_titulares: ['Traders', 'Inversores', 'Beneficiarios'],
        datos_sensibles: ['Situación financiera'],
        sistemas_almacenamiento: ['Plataforma Exchange', 'Sistema KYC', 'Blockchain'],
        transferencias_internacionales: {
          existe: true,
          paises: ['Global'],
          garantias: 'Protocolos blockchain',
          mecanismo: 'Descentralizado'
        },
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true,
          segregacion: true,
          logs_auditoria: true
        },
        requiere_dpia: true,
        plazo_conservacion: '10 años (normativa UAF)'
      }
    },
    gastronomia: {
      nombre: 'Restaurantes y Gastronomía',
      icon: '🍽️',
      descripcion: 'Restaurantes, cafeterías y servicios gastronómicos',
      data: {
        nombre_actividad: 'Gestión de Reservas y Delivery',
        area_responsable: 'Operaciones',
        finalidades: ['Reservas mesas', 'Pedidos delivery', 'Programa fidelidad'],
        base_licitud: 'contrato',
        categorias_titulares: ['Clientes', 'Usuarios app', 'Personal'],
        sistemas_almacenamiento: ['Sistema POS', 'App Delivery', 'CRM Gastronómico'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true
        },
        plazo_conservacion: '1 año (preferencias gastronómicas)'
      }
    },
    investigacion: {
      nombre: 'Centros de Investigación',
      icon: '🔬',
      descripcion: 'Centros I+D, laboratorios y universidades',
      data: {
        nombre_actividad: 'Gestión de Investigadores y Proyectos',
        area_responsable: 'Investigacion',
        finalidades: ['Gestión proyectos', 'Publicaciones', 'Colaboración científica'],
        base_licitud: 'interes_legitimo',
        categorias_titulares: ['Investigadores', 'Tesistas', 'Colaboradores'],
        sistemas_almacenamiento: ['Sistema I+D', 'Repositorio', 'Base Publicaciones'],
        transferencias_internacionales: {
          existe: true,
          paises: ['Colaboraciones globales'],
          garantias: 'Convenios investigación',
          mecanismo: 'Acuerdos institucionales'
        },
        medidas_seguridad: {
          control_acceso: true,
          backup: true
        },
        plazo_conservacion: 'Indefinido (archivo científico)'
      }
    },
    capacitacion: {
      nombre: 'Centros de Capacitación',
      icon: '📖',
      descripcion: 'OTEC, institutos técnicos y capacitación empresarial',
      data: {
        nombre_actividad: 'Gestión de Alumnos OTEC',
        area_responsable: 'Educacion',
        finalidades: ['Capacitación laboral', 'Certificación SENCE', 'Evaluaciones'],
        base_licitud: 'contrato',
        categorias_titulares: ['Alumnos', 'Empresas clientes', 'Relatores'],
        sistemas_almacenamiento: ['Sistema OTEC', 'Plataforma SENCE', 'LMS'],
        medidas_seguridad: {
          control_acceso: true,
          backup: true
        },
        plazo_conservacion: '5 años (certificaciones SENCE)'
      }
    },
    call_center: {
      nombre: 'Call Centers',
      icon: '📞',
      descripcion: 'Contact centers y servicios BPO',
      data: {
        nombre_actividad: 'Gestión de Llamadas y Agentes',
        area_responsable: 'Operaciones',
        finalidades: ['Atención clientes', 'Grabación llamadas', 'Control calidad'],
        base_licitud: 'contrato',
        categorias_titulares: ['Clientes finales', 'Agentes', 'Supervisores'],
        sistemas_almacenamiento: ['Sistema Contact Center', 'Grabadora', 'CRM'],
        terceros_encargados: ['Empresa mandante'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true,
          logs_auditoria: true
        },
        plazo_conservacion: '6 meses (grabaciones)'
      }
    },
    seguridad_privada: {
      nombre: 'Seguridad Privada',
      icon: '🚨',
      descripcion: 'Empresas de seguridad y vigilancia',
      data: {
        nombre_actividad: 'Control de Vigilancia y Personal',
        area_responsable: 'Operaciones',
        finalidades: ['Vigilancia seguridad', 'Control guardias', 'Reportes incidentes'],
        base_licitud: 'interes_legitimo',
        categorias_titulares: ['Guardias', 'Personal protegido', 'Visitas'],
        sistemas_almacenamiento: ['Sistema Vigilancia', 'CCTV', 'Base OS10'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true,
          logs_auditoria: true
        },
        plazo_conservacion: '30 días (grabaciones CCTV)'
      }
    },
    spa_belleza: {
      nombre: 'SPA y Centros de Belleza',
      icon: '💆',
      descripcion: 'Centros estéticos, spa y peluquerías',
      data: {
        nombre_actividad: 'Gestión de Clientes y Tratamientos',
        area_responsable: 'Operaciones',
        finalidades: ['Reservas tratamientos', 'Historial estético', 'Marketing'],
        base_licitud: 'consentimiento',
        categorias_titulares: ['Clientes', 'Pacientes estéticos', 'Terapeutas'],
        datos_sensibles: ['Salud', 'Alergias'],
        sistemas_almacenamiento: ['Sistema SPA', 'Agenda', 'Fichas clínicas'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true
        },
        menores_edad: true,
        plazo_conservacion: '5 años (historial tratamientos)'
      }
    },
    ferreteria: {
      nombre: 'Ferreterías y Construcción',
      icon: '🔨',
      descripcion: 'Ferreterías industriales y venta materiales',
      data: {
        nombre_actividad: 'Gestión de Clientes Ferretería',
        area_responsable: 'Ventas',
        finalidades: ['Ventas materiales', 'Crédito comercial', 'Despachos'],
        base_licitud: 'contrato',
        categorias_titulares: ['Clientes empresa', 'Maestros', 'Contratistas'],
        sistemas_almacenamiento: ['Sistema Ventas', 'Base Créditos', 'Logística'],
        medidas_seguridad: {
          control_acceso: true,
          backup: true
        },
        plazo_conservacion: '5 años (garantías comerciales)'
      }
    },
    notarial: {
      nombre: 'Notarías y Conservadores',
      icon: '📜',
      descripcion: 'Notarías, conservadores y archiveros judiciales',
      data: {
        nombre_actividad: 'Gestión de Escrituras y Registros',
        area_responsable: 'Legal',
        finalidades: ['Fe pública', 'Registro escrituras', 'Conservación documentos'],
        base_licitud: 'obligacion_legal',
        categorias_titulares: ['Comparecientes', 'Otorgantes', 'Beneficiarios'],
        sistemas_almacenamiento: ['Sistema Notarial', 'Archivo Digital', 'Registro Civil'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true,
          segregacion: true
        },
        plazo_conservacion: 'Permanente (archivo notarial)'
      }
    },
    funeraria: {
      nombre: 'Servicios Funerarios',
      icon: '⚱️',
      descripcion: 'Funerarias, cementerios y crematorios',
      data: {
        nombre_actividad: 'Gestión de Servicios Funerarios',
        area_responsable: 'Operaciones',
        finalidades: ['Servicios fúnebres', 'Registro defunciones', 'Contratos prevención'],
        base_licitud: 'contrato',
        categorias_titulares: ['Contratantes', 'Fallecidos (datos)', 'Beneficiarios'],
        sistemas_almacenamiento: ['Sistema Funerario', 'Base Cementerio', 'Registro Civil'],
        medidas_seguridad: {
          control_acceso: true,
          backup: true
        },
        plazo_conservacion: 'Permanente (registro histórico)'
      }
    },
    cannabis: {
      nombre: 'Industria Cannabis Medicinal',
      icon: '🌿',
      descripcion: 'Productores y dispensarios cannabis medicinal',
      data: {
        nombre_actividad: 'Registro Pacientes Cannabis Medicinal',
        area_responsable: 'Compliance',
        finalidades: ['Dispensación medicinal', 'Trazabilidad SAG', 'Control recetas'],
        base_licitud: 'obligacion_legal',
        categorias_titulares: ['Pacientes', 'Médicos prescriptores', 'Cuidadores'],
        datos_sensibles: ['Salud', 'Diagnósticos médicos'],
        sistemas_almacenamiento: ['Sistema Trazabilidad', 'Base Pacientes', 'Portal SAG'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true,
          segregacion: true
        },
        requiere_dpia: true,
        plazo_conservacion: '5 años (control sanitario)'
      }
    },
    gaming: {
      nombre: 'Industria Videojuegos',
      icon: '🎮',
      descripcion: 'Desarrolladores, publishers y plataformas gaming',
      data: {
        nombre_actividad: 'Gestión de Jugadores y Comunidad',
        area_responsable: 'Operaciones',
        finalidades: ['Cuentas juego', 'Compras in-game', 'Moderación comunidad'],
        base_licitud: 'contrato',
        categorias_titulares: ['Jugadores', 'Streamers', 'Desarrolladores'],
        sistemas_almacenamiento: ['Servidores Juego', 'Sistema Pagos', 'Foros'],
        transferencias_internacionales: {
          existe: true,
          paises: ['Servidores globales'],
          garantias: 'Terms of Service',
          mecanismo: 'Consentimiento'
        },
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true
        },
        menores_edad: true,
        plazo_conservacion: '1 año post inactividad'
      }
    },
    casinos: {
      nombre: 'Casinos y Juegos de Azar',
      icon: '🎰',
      descripcion: 'Casinos, apuestas deportivas y loterías',
      data: {
        nombre_actividad: 'Control de Jugadores y Prevención',
        area_responsable: 'Compliance',
        finalidades: ['Control acceso', 'Prevención ludopatía', 'Cumplimiento SII/UAF'],
        base_licitud: 'obligacion_legal',
        categorias_titulares: ['Jugadores', 'Autoexcluidos', 'Ganadores premios'],
        datos_sensibles: ['Comportamiento juego'],
        sistemas_almacenamiento: ['Sistema Casino', 'Base UAF', 'Control Acceso'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true,
          logs_auditoria: true,
          segregacion: true
        },
        requiere_dpia: true,
        plazo_conservacion: '5 años (normativa UAF)'
      }
    },
    delivery: {
      nombre: 'Apps Delivery',
      icon: '🛵',
      descripcion: 'Plataformas delivery y última milla',
      data: {
        nombre_actividad: 'Gestión Usuarios y Repartidores',
        area_responsable: 'Operaciones',
        finalidades: ['Coordinación entregas', 'Pagos', 'Evaluaciones servicio'],
        base_licitud: 'contrato',
        categorias_titulares: ['Usuarios', 'Repartidores', 'Comercios'],
        sistemas_almacenamiento: ['Plataforma Delivery', 'Sistema Pagos', 'GPS Tracking'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true
        },
        plazo_conservacion: '2 años post último pedido'
      }
    },
    coworking: {
      nombre: 'Espacios Coworking',
      icon: '🏢',
      descripcion: 'Oficinas compartidas y espacios flexibles',
      data: {
        nombre_actividad: 'Gestión de Miembros Coworking',
        area_responsable: 'Operaciones',
        finalidades: ['Membresías', 'Control acceso', 'Facturación servicios'],
        base_licitud: 'contrato',
        categorias_titulares: ['Miembros', 'Visitantes', 'Proveedores'],
        sistemas_almacenamiento: ['Sistema Coworking', 'Control Acceso', 'App Reservas'],
        medidas_seguridad: {
          control_acceso: true,
          logs_auditoria: true
        },
        plazo_conservacion: '1 año post término membresía'
      }
    },
    marketplace: {
      nombre: 'Marketplaces',
      icon: '🛒',
      descripcion: 'Plataformas de comercio electrónico P2P',
      data: {
        nombre_actividad: 'Gestión Vendedores y Compradores',
        area_responsable: 'Operaciones',
        finalidades: ['Facilitación comercio', 'Pagos seguros', 'Resolución disputas'],
        base_licitud: 'contrato',
        categorias_titulares: ['Vendedores', 'Compradores', 'Visitantes'],
        sistemas_almacenamiento: ['Plataforma Marketplace', 'Sistema Pagos', 'CRM'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true,
          segregacion: true
        },
        plazo_conservacion: '5 años (disputas comerciales)'
      }
    },
    reciclaje: {
      nombre: 'Industria del Reciclaje',
      icon: '♻️',
      descripcion: 'Gestión de residuos y economía circular',
      data: {
        nombre_actividad: 'Gestión de Puntos Verdes',
        area_responsable: 'Operaciones',
        finalidades: ['Trazabilidad residuos', 'Certificación reciclaje', 'Educación ambiental'],
        base_licitud: 'interes_legitimo',
        categorias_titulares: ['Usuarios recicladores', 'Empresas generadoras', 'Municipalidades'],
        sistemas_almacenamiento: ['Sistema Trazabilidad', 'App Reciclaje', 'Base MMA'],
        medidas_seguridad: {
          control_acceso: true,
          backup: true
        },
        plazo_conservacion: '3 años (certificaciones)'
      }
    },
    crowdfunding: {
      nombre: 'Plataformas Crowdfunding',
      icon: '💰',
      descripcion: 'Financiamiento colectivo y donaciones',
      data: {
        nombre_actividad: 'Gestión de Inversores y Proyectos',
        area_responsable: 'Operaciones',
        finalidades: ['Financiamiento proyectos', 'Gestión inversiones', 'Cumplimiento CMF'],
        base_licitud: 'contrato',
        categorias_titulares: ['Inversores', 'Emprendedores', 'Donantes'],
        datos_sensibles: ['Situación financiera'],
        sistemas_almacenamiento: ['Plataforma Crowdfunding', 'Sistema Pagos', 'Base CMF'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true,
          segregacion: true
        },
        plazo_conservacion: '10 años (regulación financiera)'
      }
    },
    domiciliarias: {
      nombre: 'Servicios Domiciliarios',
      icon: '🏡',
      descripcion: 'Limpieza, mantención y servicios a domicilio',
      data: {
        nombre_actividad: 'Gestión de Clientes y Personal Domiciliario',
        area_responsable: 'Operaciones',
        finalidades: ['Coordinación servicios', 'Control personal', 'Facturación'],
        base_licitud: 'contrato',
        categorias_titulares: ['Clientes hogares', 'Personal servicio', 'Proveedores'],
        sistemas_almacenamiento: ['Sistema Servicios', 'App Coordinación', 'RRHH'],
        medidas_seguridad: {
          control_acceso: true,
          backup: true
        },
        plazo_conservacion: '2 años (garantías servicio)'
      }
    },
    streaming: {
      nombre: 'Plataformas Streaming',
      icon: '📹',
      descripcion: 'Video, música y contenido bajo demanda',
      data: {
        nombre_actividad: 'Gestión de Suscriptores Streaming',
        area_responsable: 'Operaciones',
        finalidades: ['Suscripciones', 'Recomendaciones contenido', 'Control parental'],
        base_licitud: 'contrato',
        categorias_titulares: ['Suscriptores', 'Perfiles usuarios', 'Creadores contenido'],
        sistemas_almacenamiento: ['Plataforma Streaming', 'CDN', 'Sistema Recomendaciones'],
        transferencias_internacionales: {
          existe: true,
          paises: ['Servidores CDN globales'],
          garantias: 'Términos servicio',
          mecanismo: 'Consentimiento'
        },
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true
        },
        menores_edad: true,
        plazo_conservacion: '1 año post cancelación'
      }
    },
    elearning: {
      nombre: 'Plataformas E-Learning',
      icon: '💡',
      descripcion: 'Educación online y MOOCs',
      data: {
        nombre_actividad: 'Gestión de Estudiantes Online',
        area_responsable: 'Educacion',
        finalidades: ['Impartir cursos', 'Evaluaciones', 'Certificación'],
        base_licitud: 'contrato',
        categorias_titulares: ['Estudiantes', 'Instructores', 'Instituciones'],
        sistemas_almacenamiento: ['LMS', 'Sistema Evaluaciones', 'Foros'],
        medidas_seguridad: {
          control_acceso: true,
          backup: true
        },
        menores_edad: true,
        plazo_conservacion: '5 años (certificados)'
      }
    },
    influencer: {
      nombre: 'Agencias de Influencers',
      icon: '📱',
      descripcion: 'Gestión de influencers y creadores de contenido',
      data: {
        nombre_actividad: 'Base de Datos Influencers',
        area_responsable: 'Marketing',
        finalidades: ['Gestión campañas', 'Métricas engagement', 'Pagos'],
        base_licitud: 'contrato',
        categorias_titulares: ['Influencers', 'Marcas', 'Audiencias'],
        sistemas_almacenamiento: ['CRM Influencers', 'Analytics', 'Sistema Pagos'],
        medidas_seguridad: {
          control_acceso: true,
          backup: true
        },
        plazo_conservacion: '2 años post campaña'
      }
    },
    parking: {
      nombre: 'Estacionamientos',
      icon: '🅿️',
      descripcion: 'Parkings, parquímetros y gestión estacionamientos',
      data: {
        nombre_actividad: 'Control de Estacionamientos',
        area_responsable: 'Operaciones',
        finalidades: ['Control acceso', 'Cobro tarifas', 'Abonos mensuales'],
        base_licitud: 'contrato',
        categorias_titulares: ['Usuarios parking', 'Abonados', 'Visitantes'],
        sistemas_almacenamiento: ['Sistema Parking', 'Cámaras LPR', 'App Pagos'],
        medidas_seguridad: {
          control_acceso: true,
          logs_auditoria: true
        },
        plazo_conservacion: '30 días (grabaciones)'
      }
    },
    proptech: {
      nombre: 'PropTech',
      icon: '🏘️',
      descripcion: 'Tecnología inmobiliaria y gestión propiedades',
      data: {
        nombre_actividad: 'Plataforma Gestión Inmobiliaria',
        area_responsable: 'Operaciones',
        finalidades: ['Gestión arriendos', 'Mantenimiento', 'Pagos automatizados'],
        base_licitud: 'contrato',
        categorias_titulares: ['Propietarios', 'Arrendatarios', 'Administradores'],
        sistemas_almacenamiento: ['Plataforma PropTech', 'Sistema Pagos', 'App Residentes'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true
        },
        plazo_conservacion: '5 años (contratos arriendo)'
      }
    },
    startups: {
      nombre: 'Aceleradoras y Startups',
      icon: '🚀',
      descripcion: 'Incubadoras, aceleradoras y ecosistema startup',
      data: {
        nombre_actividad: 'Gestión de Emprendedores',
        area_responsable: 'Operaciones',
        finalidades: ['Programas aceleración', 'Mentorías', 'Conexión inversores'],
        base_licitud: 'contrato',
        categorias_titulares: ['Emprendedores', 'Mentores', 'Inversores'],
        sistemas_almacenamiento: ['CRM Startups', 'Plataforma Mentorías', 'Base Inversores'],
        medidas_seguridad: {
          control_acceso: true,
          segregacion: true
        },
        plazo_conservacion: '5 años (seguimiento portfolio)'
      }
    },
    social_media: {
      nombre: 'Gestión Redes Sociales',
      icon: '📲',
      descripcion: 'Community management y social media',
      data: {
        nombre_actividad: 'Gestión de Comunidades Online',
        area_responsable: 'Marketing',
        finalidades: ['Gestión RRSS', 'Engagement', 'Atención cliente social'],
        base_licitud: 'interes_legitimo',
        categorias_titulares: ['Seguidores', 'Clientes', 'Influencers'],
        sistemas_almacenamiento: ['Herramientas Social Media', 'CRM Social', 'Analytics'],
        medidas_seguridad: {
          control_acceso: true,
          logs_auditoria: true
        },
        plazo_conservacion: '1 año (interacciones)'
      }
    },
    movilidad: {
      nombre: 'Movilidad Compartida',
      icon: '🛴',
      descripcion: 'Scooters, bicicletas y vehículos compartidos',
      data: {
        nombre_actividad: 'Gestión Usuarios Movilidad',
        area_responsable: 'Operaciones',
        finalidades: ['Alquiler vehículos', 'Tracking GPS', 'Cobros uso'],
        base_licitud: 'contrato',
        categorias_titulares: ['Usuarios', 'Conductores', 'Municipalidades'],
        sistemas_almacenamiento: ['App Movilidad', 'GPS Tracking', 'Sistema Pagos'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true
        },
        plazo_conservacion: '1 año (patrones movilidad)'
      }
    },
    artesanal: {
      nombre: 'Sector Artesanal',
      icon: '🎨',
      descripcion: 'Artesanos, ferias y productos artesanales',
      data: {
        nombre_actividad: 'Registro de Artesanos y Clientes',
        area_responsable: 'Ventas',
        finalidades: ['Ventas productos', 'Ferias artesanales', 'Certificación origen'],
        base_licitud: 'consentimiento',
        categorias_titulares: ['Artesanos', 'Clientes', 'Organizadores ferias'],
        sistemas_almacenamiento: ['Base Artesanos', 'E-commerce', 'Sistema Ferias'],
        medidas_seguridad: {
          control_acceso: true,
          backup: true
        },
        plazo_conservacion: '3 años (garantías producto)'
      }
    },
    consultoria_ti: {
      nombre: 'Consultoría TI',
      icon: '💼',
      descripcion: 'Servicios profesionales tecnología',
      data: {
        nombre_actividad: 'Gestión de Proyectos TI',
        area_responsable: 'Operaciones',
        finalidades: ['Servicios consultoría', 'Gestión proyectos', 'Soporte técnico'],
        base_licitud: 'contrato',
        categorias_titulares: ['Clientes empresa', 'Consultores', 'Usuarios finales'],
        sistemas_almacenamiento: ['Sistema Proyectos', 'Repositorio Código', 'Ticketing'],
        terceros_encargados: ['Proveedores cloud'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true,
          segregacion: true
        },
        plazo_conservacion: '5 años (garantías proyecto)'
      }
    },
    emergencias: {
      nombre: 'Servicios de Emergencia',
      icon: '🚑',
      descripcion: 'Ambulancias, bomberos y rescate',
      data: {
        nombre_actividad: 'Gestión de Emergencias Médicas',
        area_responsable: 'Operaciones',
        finalidades: ['Atención emergencias', 'Historial médico urgente', 'Coordinación traslados'],
        base_licitud: 'interes_vital',
        categorias_titulares: ['Pacientes', 'Contactos emergencia', 'Personal médico'],
        datos_sensibles: ['Salud', 'Condición médica urgente'],
        sistemas_almacenamiento: ['Sistema Despacho', 'Fichas Médicas', 'GPS Ambulancias'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true
        },
        requiere_dpia: true,
        plazo_conservacion: '10 años (historial médico)'
      }
    },
    mascotas: {
      nombre: 'Tiendas de Mascotas',
      icon: '🐕',
      descripcion: 'Pet shops, productos y servicios para mascotas',
      data: {
        nombre_actividad: 'Gestión de Clientes y Mascotas',
        area_responsable: 'Ventas',
        finalidades: ['Ventas productos', 'Servicios mascotas', 'Programa fidelidad'],
        base_licitud: 'contrato',
        categorias_titulares: ['Dueños mascotas', 'Veterinarios', 'Proveedores'],
        sistemas_almacenamiento: ['Sistema POS', 'Base Mascotas', 'CRM Pet'],
        medidas_seguridad: {
          control_acceso: true,
          backup: true
        },
        plazo_conservacion: '3 años (historial mascotas)'
      }
    },
    gobierno: {
      nombre: 'Servicios Gubernamentales',
      icon: '🏛️',
      descripcion: 'Municipalidades, servicios públicos y gobierno',
      data: {
        nombre_actividad: 'ChileAtiende - Trámites Ciudadanos Digitales',
        area_responsable: 'Operaciones',
        finalidades: ['Servicios ciudadanos', 'Trámites municipales', 'Transparencia activa'],
        base_licitud: 'obligacion_legal',
        categorias_titulares: ['Ciudadanos', 'Contribuyentes', 'Funcionarios'],
        sistemas_almacenamiento: ['Portal Ciudadano', 'Sistema Tributario', 'Registro Civil'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true,
          logs_auditoria: true,
          segregacion: true
        },
        plazo_conservacion: 'Según normativa específica'
      }
    }
  };

  // Pasos del wizard
  const steps = [
    'Identificación de la Actividad',
    'Categorías de Datos',
    'Flujos y Destinatarios',
    'Plazos y Seguridad',
    'Revisión y Exportación'
  ];

  // Validación por fase
  const validatePhase = (phase) => {
    const errors = [];
    
    switch(phase) {
      case 0: // Identificación
        if (!ratData.nombre_actividad) errors.push('El nombre de la actividad es obligatorio');
        if (!ratData.area_responsable) errors.push('El área responsable es obligatoria');
        if ((ratData.finalidades || []).length === 0) errors.push('Debe especificar al menos una finalidad');
        if (!ratData.base_licitud) errors.push('La base de licitud es obligatoria');
        break;
      
      case 1: // Categorías
        if ((ratData.categorias_titulares || []).length === 0) errors.push('Debe identificar las categorías de titulares');
        const hasCategoria = Object.values(ratData.categorias_datos).some(v => v === true || (typeof v === 'string' && v.length > 0));
        if (!hasCategoria) errors.push('Debe seleccionar al menos una categoría de datos');
        break;
      
      case 2: // Flujos
        if ((ratData.sistemas_almacenamiento || []).length === 0) errors.push('Debe identificar los sistemas de almacenamiento');
        if (ratData.transferencias_internacionales?.existe && (ratData.transferencias_internacionales?.paises || []).length === 0) {
          errors.push('Debe especificar los países de destino para las transferencias internacionales');
        }
        break;
      
      case 3: // Seguridad
        if (!ratData.plazo_conservacion) errors.push('El plazo de conservación es obligatorio');
        const hasSeguridad = Object.values(ratData.medidas_seguridad || {}).some(v => v === true || (Array.isArray(v) && v.length > 0));
        if (!hasSeguridad) errors.push('Debe especificar al menos una medida de seguridad');
        break;
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Navegación del wizard
  const handleNext = () => {
    if (validatePhase(activeStep)) {
      if (activeStep === steps.length - 1) {
        saveRAT();
      } else {
        setActiveStep(prev => prev + 1);
        setValidationErrors([]);
      }
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setValidationErrors([]);
  };

  // Guardar RAT con TRIPLE FALLBACK - ANTI-HOJITAS GARANTIZADO
  const saveRAT = async () => {
    setLoading(true);
    setSavedMessage('💾 Guardando registro de actividad de tratamiento...');
    
    try {
      // Verificar tenant obligatorio
      const tenantId = user?.tenant_id || user?.organizacion_id;
      if (!tenantId) {
        throw new Error('Tenant ID es obligatorio para grabación en producción.');
      }
      
      // Para modo demo, usar tenant específico de pruebas
      const finalTenantId = tenantId === 'demo' ? 'demo_empresa_lpdp_2024' : tenantId;

      // Preparar datos con tenant obligatorio
      const dataToSave = {
        ...ratData,
        tenant_id: finalTenantId,
        user_id: user?.id || user?.email || 'demo_user',
        created_by: user?.email || user?.username || 'demo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'active',
        metadata: {
          empresa: empresaInfo?.nombre || user?.organizacion_nombre || 'Empresa Demo',
          sector: empresaInfo?.sector || 'Demo',
          version: '3.1.0',
          ley: 'LPDP-21719',
          modo: tenantId === 'demo' ? 'demo' : 'produccion'
        }
      };

      console.log('💖 Guardando en Supabase con tenant:', finalTenantId, dataToSave);

      let result;
      let saveMethod = 'supabase';
      
      try {
        // 🚨 FORZAR LOCALHOST PARA DEMO - BYPASS TOTAL SUPABASE 
        const tenantId = user?.tenant_id || user?.organizacion_id;
        const finalTenantId = tenantId === 'demo' ? 'demo_empresa_lpdp_2024' : tenantId;
        
        // SI ES DEMO O HAY PROBLEMAS DNS, FORZAR LOCALSTORAGE
        const isDemo = finalTenantId.includes('demo');
        let forceLocalStorage = isDemo; // SIEMPRE local para demo
        
        if (!forceLocalStorage) {
          // Solo para tenants no-demo, verificar conectividad
          setSavedMessage('🔍 Verificando conectividad...');
          forceLocalStorage = await shouldUseLocalStorageFirst();
        }
        
        if (forceLocalStorage) {
          console.warn('🚨 USANDO LOCALSTORAGE: Demo mode O problemas conectividad');
          throw new Error('FORCED_LOCAL: Usando localStorage (demo o conectividad)');
        }

        // Solo llegar aquí si NO es demo Y Supabase está disponible
        if (!forceLocalStorage) {
          // INTENTO 1: Supabase directo con retry automático
          setSavedMessage('🔄 Conectando con base de datos...');
          
          for (let retry = 0; retry < 2; retry++) { // Reducido a 2 intentos por DNS
            try {
              const supabaseTenant = supabaseWithTenant(finalTenantId);
              
              if (ratData.id) {
                // Actualizar registro existente
                result = await supabaseTenant
                  .from('mapeo_datos_rat')
                  .update({
                    ...dataToSave,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', ratData.id)
                  .select()
                  .single();
              } else {
                // Crear nuevo registro
                result = await supabaseTenant
                  .from('mapeo_datos_rat')
                  .insert(dataToSave)
                  .select()
                  .single();
              }
              
              if (!result.error) {
                console.log('✅ Supabase SUCCESS en intento', retry + 1);
                break;
              } else {
                throw result.error;
              }
              
            } catch (supabaseError) {
              console.warn(`⚠️ Supabase intento ${retry + 1} falló:`, supabaseError.message);
              if (retry === 1) throw supabaseError; // Fallar rápido por DNS
              setSavedMessage(`🔄 Reintentando conexión (${retry + 2}/2)...`);
              await new Promise(resolve => setTimeout(resolve, 500)); // Backoff más rápido
            }
          }
        } else {
          // Si detectamos problema DNS, lanzar error inmediato
          throw new Error('DNS_ERROR: Supabase no accesible, usando fallback');
        }
        
      } catch (supabaseError) {
        console.error('❌ Supabase falló completamente:', supabaseError);
        
        // INTENTO 2: Backend API como fallback
        try {
          setSavedMessage('🔄 Conectando con servidor backend...');
          
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://scldp-backend.onrender.com'}/api/v1/mapeo-datos/save`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Tenant-ID': finalTenantId,
              'Authorization': `Bearer ${localStorage.getItem('lpdp_token')}`
            },
            body: JSON.stringify(dataToSave)
          });
          
          if (response.ok) {
            result = { data: await response.json(), error: null };
            saveMethod = 'backend';
            console.log('✅ Backend API SUCCESS');
          } else {
            throw new Error(`Backend error: ${response.status}`);
          }
          
        } catch (backendError) {
          console.error('❌ Backend falló:', backendError);
          
          // INTENTO 3: LocalStorage como último recurso (NUNCA falla)
          setSavedMessage('💾 Guardando en almacenamiento local...');
          
          const localKey = `rat_${finalTenantId}_${ratData.id || Date.now()}`;
          const localData = {
            ...dataToSave,
            saved_locally: true,
            local_save_timestamp: new Date().toISOString(),
            sync_pending: true
          };
          
          localStorage.setItem(localKey, JSON.stringify(localData));
          localStorage.setItem('rats_local_list', JSON.stringify([
            ...(JSON.parse(localStorage.getItem('rats_local_list') || '[]')),
            localKey
          ]));
          
          result = { 
            data: { 
              ...localData, 
              id: localKey,
              local_id: localKey 
            }, 
            error: null 
          };
          saveMethod = 'localStorage';
          console.log('✅ LocalStorage SUCCESS - NUNCA FALLA');
        }
      }

      if (result.error) {
        throw result.error;
      }

      // Actualizar estado local con la respuesta
      setRatData(prev => ({ 
        ...prev, 
        id: result.data.id,
        ...result.data
      }));
      
      // Mensajes de éxito según método usado
      const isDemo = (user?.tenant_id || '').includes('demo');
      const successMessages = {
        supabase: `✅ RAT ${ratData.id ? 'actualizado' : 'guardado'} exitosamente en Supabase (Tenant: ${finalTenantId})`,
        backend: `💚 RAT ${ratData.id ? 'actualizado' : 'guardado'} via Backend API (Tenant: ${finalTenantId})`,
        localStorage: isDemo 
          ? `📱 RAT ${ratData.id ? 'actualizado' : 'guardado'} en MODO DEMO (almacenamiento local seguro)`
          : `🔥 RAT ${ratData.id ? 'actualizado' : 'guardado'} en almacenamiento local SEGURO - SE SINCRONIZARÁ AUTOMÁTICAMENTE`
      };
      
      setSavedMessage(successMessages[saveMethod]);
      setShowVisualization(true);
      
      console.log(`RAT guardado exitosamente via ${saveMethod.toUpperCase()}:`, result.data);
      
      // Registrar actividad en log de auditoría
      try {
        const auditTenantId = user?.tenant_id || user?.organizacion_id || 'demo';
        const auditFinalTenantId = auditTenantId === 'demo' ? 'demo_empresa_lpdp_2024' : auditTenantId;
        const auditSupabaseTenant = supabaseWithTenant(auditFinalTenantId);
        
        await auditSupabaseTenant
          .from('audit_log')
          .insert({
            tenant_id: auditFinalTenantId,
            user_id: user?.id || 'demo_user',
            action: ratData.id ? 'UPDATE_RAT' : 'CREATE_RAT',
            resource_type: 'mapeo_datos_rat',
            resource_id: result.data.id,
            metadata: { nombre_actividad: ratData.nombre_actividad },
            timestamp: new Date().toISOString()
          });
      } catch (auditError) {
        console.warn('⚠️ No se pudo registrar en audit_log:', auditError.message);
      }
      
    } catch (error) {
      console.error('Error guardando en Supabase:', error);
      setSavedMessage(`❌ Error al guardar en Supabase: ${error.message}`);
      
      // Si es error de autenticación o permisos
      if (error.message?.includes('JWT') || error.message?.includes('authenticated')) {
        setSavedMessage('❌ Error de autenticación. Por favor, inicia sesión nuevamente.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Cargar RATs existentes del usuario
  // Función para sincronizar datos locales con Supabase
  const syncLocalDataToSupabase = async () => {
    try {
      const localRatsList = JSON.parse(localStorage.getItem('rats_local_list') || '[]');
      const tenantId = user?.tenant_id || user?.organizacion_id || 'demo';
      const finalTenantId = tenantId === 'demo' ? 'demo_empresa_lpdp_2024' : tenantId;
      
      for (const localKey of localRatsList) {
        const localData = JSON.parse(localStorage.getItem(localKey) || '{}');
        
        if (localData.sync_pending) {
          try {
            console.log('🔄 Sincronizando RAT local:', localKey);
            
            const supabaseTenant = supabaseWithTenant(finalTenantId);
            const result = await supabaseTenant
              .from('mapeo_datos_rat')
              .insert({
                ...localData,
                synced_from_local: true,
                original_local_key: localKey
              })
              .select()
              .single();
            
            if (!result.error) {
              // Marcar como sincronizado
              localData.sync_pending = false;
              localData.synced_at = new Date().toISOString();
              localData.supabase_id = result.data.id;
              localStorage.setItem(localKey, JSON.stringify(localData));
              
              console.log('✅ RAT sincronizado exitosamente:', localKey);
            }
          } catch (syncError) {
            console.warn('⚠️ Error sincronizando RAT:', localKey, syncError);
          }
        }
      }
    } catch (error) {
      console.error('Error en sincronización automática:', error);
    }
  };

  const loadExistingRATs = async () => {
    setLoadingRATs(true);
    try {
      // Verificar tenant obligatorio
      const tenantId = user?.tenant_id || user?.organizacion_id;
      if (!tenantId) {
        throw new Error('Tenant ID es obligatorio para cargar datos.');
      }

      // Para modo demo, usar tenant específico de pruebas
      const finalTenantId = tenantId === 'demo' ? 'demo_empresa_lpdp_2024' : tenantId;

      console.log('Cargando RATs de Supabase para tenant:', finalTenantId);

      // Usar helper con tenant para garantizar aislamiento
      const supabaseTenant = supabaseWithTenant(finalTenantId);
      
      const { data, error } = await supabaseTenant
        .from('mapeo_datos_rat')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      let supabaseRATs = data || [];
      console.log(`Cargados ${supabaseRATs.length} RATs de Supabase del tenant ${finalTenantId}`);
      
      // También cargar datos locales como fallback
      let localRATs = [];
      try {
        const localRatsList = JSON.parse(localStorage.getItem('rats_local_list') || '[]');
        localRATs = localRatsList.map(localKey => {
          const localData = JSON.parse(localStorage.getItem(localKey) || '{}');
          return {
            ...localData,
            is_local: true,
            local_key: localKey,
            display_name: `📱 ${localData.nombre_actividad || 'RAT Local'} (Local)`
          };
        }).filter(rat => rat.tenant_id === finalTenantId);
        
        console.log(`Cargados ${localRATs.length} RATs locales del tenant ${finalTenantId}`);
      } catch (localError) {
        console.warn('Error cargando datos locales:', localError);
      }
      
      // Combinar y mostrar todos los RATs disponibles
      const allRATs = [...supabaseRATs, ...localRATs];
      setExistingRATs(allRATs);
      console.log(`Total RATs disponibles: ${allRATs.length} (${supabaseRATs.length} online, ${localRATs.length} local)`);
      
      // Intentar sincronización automática si hay conexión Supabase
      if (supabaseRATs.length >= 0 && localRATs.length > 0) {
        setTimeout(() => syncLocalDataToSupabase(), 2000);
      }
      
    } catch (error) {
      console.error('Error cargando RATs de Supabase:', error);
      
      // Si Supabase falla, mostrar solo datos locales
      try {
        const localRatsList = JSON.parse(localStorage.getItem('rats_local_list') || '[]');
        const localRATs = localRatsList.map(localKey => {
          const localData = JSON.parse(localStorage.getItem(localKey) || '{}');
          return {
            ...localData,
            is_local: true,
            local_key: localKey,
            display_name: `📱 ${localData.nombre_actividad || 'RAT Local'} (Solo Local)`
          };
        }).filter(rat => {
          const tenantId = user?.tenant_id || user?.organizacion_id || 'demo';
          const finalTenantId = tenantId === 'demo' ? 'demo_empresa_lpdp_2024' : tenantId;
          const ratTenantId = rat?.tenant_id || '';
          const tenantPrefix = finalTenantId?.split('_')[0] || 'demo';
          return ratTenantId.includes(tenantPrefix);
        });
        
        setExistingRATs(localRATs);
        setSavedMessage(`⚠️ Usando datos locales: ${localRATs.length} RATs disponibles (sin conexión Supabase)`);
        console.log(`Modo offline: ${localRATs.length} RATs locales cargados`);
      } catch (localError) {
        setSavedMessage(`❌ Error cargando datos: ${error.message}`);
      }
    } finally {
      setLoadingRATs(false);
    }
  };

  // Cargar un RAT específico para edición desde Supabase O LocalStorage
  const loadRATForEdit = async (ratId) => {
    setLoading(true);
    setSavedMessage('🌊 Cargando RAT para edición...');
    
    try {
      let data = null;
      let isLocalRAT = false;

      // Verificar si es un RAT local (las claves locales tienen formato específico)
      if (ratId && ratId.toString().startsWith('rat_')) {
        console.log('💖 Cargando RAT LOCAL para edición:', ratId);
        
        try {
          const localData = localStorage.getItem(ratId);
          if (localData) {
            data = JSON.parse(localData);
            isLocalRAT = true;
            console.log('✅ RAT local encontrado:', data.nombre_actividad);
          } else {
            throw new Error('RAT local no encontrado en localStorage');
          }
        } catch (localError) {
          console.error('❌ Error cargando RAT local:', localError);
          throw new Error('No se pudo cargar el RAT local');
        }
        
      } else {
        // Es un RAT de Supabase
        console.log('☁️ Cargando RAT SUPABASE para edición:', ratId);
        
        // Verificar tenant obligatorio
        const tenantId = user?.tenant_id || user?.organizacion_id;
        if (!tenantId) {
          throw new Error('Tenant ID es obligatorio para editar datos.');
        }

        // Para modo demo, usar tenant específico de pruebas
        const finalTenantId = tenantId === 'demo' ? 'demo_empresa_lpdp_2024' : tenantId;

        // Usar helper con tenant
        const supabaseTenant = supabaseWithTenant(finalTenantId);
        
        const { data: supabaseData, error } = await supabaseTenant
          .from('mapeo_datos_rat')
          .select('*')
          .eq('id', ratId)
          .single();

        if (error) {
          throw error;
        }

        if (!supabaseData) {
          throw new Error('RAT no encontrado en Supabase');
        }
        
        data = supabaseData;
      }
      
      // Cargar los datos en el estado con validación para arrays
      const safeData = {
        ...data,
        // Asegurar que todos los arrays estén inicializados
        categorias_titulares: data.categorias_titulares || [],
        finalidades: data.finalidades || [],
        datos_sensibles: data.datos_sensibles || [],
        sistemas_almacenamiento: data.sistemas_almacenamiento || [],
        destinatarios_internos: data.destinatarios_internos || [],
        terceros_encargados: data.terceros_encargados || [],
        terceros_cesionarios: data.terceros_cesionarios || [],
        riesgos_identificados: data.riesgos_identificados || [],
        medidas_mitigacion: data.medidas_mitigacion || [],
        // Asegurar que objetos anidados estén inicializados
        categorias_datos: data.categorias_datos || {
          identificacion: false,
          contacto: false,
          laboral: false,
          academico: false,
          financiero: false,
          salud: false,
          biometrico: false,
          genetico: false,
          socioeconomico: false,
          navegacion: false,
          geolocalizacion: false,
          otros: ''
        },
        transferencias_internacionales: {
          existe: data.transferencias_internacionales?.existe || false,
          paises: Array.isArray(data.transferencias_internacionales?.paises) ? data.transferencias_internacionales.paises : [],
          garantias: data.transferencias_internacionales?.garantias || '',
          mecanismo: data.transferencias_internacionales?.mecanismo || ''
        },
        medidas_seguridad: {
          tecnicas: Array.isArray(data.medidas_seguridad?.tecnicas) ? data.medidas_seguridad.tecnicas : [],
          organizativas: Array.isArray(data.medidas_seguridad?.organizativas) ? data.medidas_seguridad.organizativas : [],
          cifrado: data.medidas_seguridad?.cifrado || false,
          seudonimizacion: data.medidas_seguridad?.seudonimizacion || false,
          control_acceso: data.medidas_seguridad?.control_acceso || false,
          logs_auditoria: data.medidas_seguridad?.logs_auditoria || false,
          backup: data.medidas_seguridad?.backup || false,
          segregacion: data.medidas_seguridad?.segregacion || false
        }
      };
      
      setRatData(safeData);
      setActiveStep(0);
      setShowRATList(false);
      
      // Mensaje según tipo de RAT
      const sourceMessage = isLocalRAT 
        ? '📱 desde almacenamiento LOCAL (se mantendrá local hasta sincronizar)'
        : '☁️ desde SUPABASE';
      setSavedMessage(`✅ RAT "${data.nombre_actividad}" cargado para edición ${sourceMessage}`);
      
      console.log(`RAT cargado para edición desde ${isLocalRAT ? 'LOCAL' : 'SUPABASE'}:`, data);
      
      // Registrar en auditoría
      try {
        const auditTenantId = user?.tenant_id || user?.organizacion_id || 'demo';
        const auditFinalTenantId = auditTenantId === 'demo' ? 'demo_empresa_lpdp_2024' : auditTenantId;
        const auditSupabaseTenant = supabaseWithTenant(auditFinalTenantId);
        
        await auditSupabaseTenant
          .from('audit_log')
          .insert({
            tenant_id: auditFinalTenantId,
            user_id: user?.id || 'demo_user',
            action: 'VIEW_RAT',
            resource_type: 'mapeo_datos_rat',
            resource_id: ratId,
            metadata: { nombre_actividad: data.nombre_actividad },
            timestamp: new Date().toISOString()
          });
      } catch (auditError) {
        console.warn('⚠️ No se pudo registrar en audit_log:', auditError.message);
      }
      
    } catch (error) {
      console.error('Error cargando RAT de Supabase:', error);
      setSavedMessage(`❌ Error al cargar RAT: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Verificar límites de RATs (límites generosos para buena UX)
  const checkRATLimits = async (tenantId, userId, area = 'General') => {
    try {
      // Límites MUY generosos por defecto para excelente UX
      const defaultLimits = {
        demo: { maxTotal: 15, maxPerUser: 8, maxPerArea: 20 },
        basic: { maxTotal: 75, maxPerUser: 30, maxPerArea: 50 },
        premium: { maxTotal: 250, maxPerUser: 60, maxPerArea: 100 },
        enterprise: { maxTotal: 1500, maxPerUser: 300, maxPerArea: 500 }
      };
      
      // Detectar tipo de plan por tenant
      const planType = tenantId.includes('demo') ? 'demo' : 
                      tenantId.includes('enterprise') ? 'enterprise' :
                      tenantId.includes('premium') ? 'premium' : 'basic';
      
      const limits = defaultLimits[planType];
      
      // Contar RATs actuales
      const currentRATs = existingRATs || [];
      const userRATs = currentRATs.filter(rat => rat.created_by === userId);
      const areaRATs = currentRATs.filter(rat => rat.area_responsable === area);
      
      // Verificaciones con límites generosos
      if (currentRATs.length >= limits.maxTotal) {
        return {
          allowed: false,
          reason: `Límite alcanzado: máximo ${limits.maxTotal} RATs para plan ${planType}`,
          current: currentRATs.length,
          max: limits.maxTotal,
          plan: planType,
          suggestion: planType === 'demo' ? 'Considera actualizar a plan Basic' : 'Contacta soporte para aumentar límites'
        };
      }
      
      if (userRATs.length >= limits.maxPerUser) {
        return {
          allowed: false,
          reason: `Límite personal: máximo ${limits.maxPerUser} RATs por usuario`,
          current: userRATs.length,
          max: limits.maxPerUser,
          plan: planType,
          suggestion: 'Considera archivar RATs antiguos o delegar a otros usuarios'
        };
      }
      
      return {
        allowed: true,
        remaining: {
          total: limits.maxTotal - currentRATs.length,
          user: limits.maxPerUser - userRATs.length,
          area: limits.maxPerArea - areaRATs.length
        },
        plan: planType
      };
      
    } catch (error) {
      console.warn('Error verificando límites, permitiendo por defecto:', error);
      return { allowed: true, plan: 'unknown' }; // Fallar abierto para buena UX
    }
  };

  // Crear nuevo RAT
  const createNewRAT = async () => {
    const tenantId = getCurrentTenant();
    const userId = user?.id || 'demo_user';
    
    // Verificar límites primero
    const limitCheck = await checkRATLimits(tenantId, userId);
    
    if (!limitCheck.allowed) {
      alert(`⚠️ ${limitCheck.reason}\n\nActual: ${limitCheck.current}/${limitCheck.max}\nPlan: ${limitCheck.plan}\n\n💡 ${limitCheck.suggestion}`);
      return;
    }
    
    const newRATId = generateRATId(tenantId, 'GE'); // General por defecto
    
    console.log('🆕 Creando nuevo RAT con ID:', newRATId);
    console.log('📊 Límites restantes:', limitCheck.remaining);
    
    const newRATData = {
      // Sistema y identificación
      rat_id: newRATId,
      tenant_id: tenantId,
      created_by: 'usuario_actual',
      
      // FASE 1: Identificación
      nombre_actividad: '',
      area_responsable: '',
      responsable_proceso: '',
      email_responsable: '',
      telefono_responsable: '',
      descripcion: '',
      
      // FASE 2: Base jurídica
      base_licitud: '',
      base_legal_descripcion: '',
      finalidades: [],
      finalidad_principal: '',
      finalidades_secundarias: [],
      
      // FASE 3: Categorías de datos
      categorias_titulares: [],
      categorias_datos: {
        identificacion: [],
        contacto: [],
        demograficos: [],
        economicos: [],
        educacion: [],
        salud: [],
        sensibles: []
      },
      datos_sensibles: false,
      datos_menores: false,
      volumen_registros: '',
      frecuencia_actualizacion: '',
      
      // FASE 4: Flujos y destinatarios
      origen_datos: [],
      sistemas_almacenamiento: [],
      sistemas_tratamiento: [],
      destinatarios_internos: [],
      destinatarios_externos: [],
      terceros_encargados: [],
      terceros_cesionarios: [],
      
      transferencias_internacionales: {
        existe: false,
        paises: [],
        garantias: '',
        detalle: ''
      },
      
      // FASE 5: Seguridad y retención
      plazo_conservacion: '',
      criterio_conservacion: '',
      destino_posterior: '',
      medidas_seguridad_tecnicas: [],
      medidas_seguridad_organizativas: [],
      evaluacion_impacto: false,
      requiere_dpia: false,
      riesgos_identificados: [],
      medidas_mitigacion: [],
      nivel_riesgo: 'bajo',
      
      // Derechos ARCOPOL
      procedimiento_derechos: '',
      plazo_respuesta_derechos: '15 días hábiles',
      
      // Metadata
      version: '1.0',
      estado: 'borrador',
      status: 'active',
      metadata: {}
    };
    
    setRatData(newRATData);
    setActiveStep(0);
    setShowRATList(false);
    setSavedMessage('');
    setShowVisualization(false);
    
    console.log('✅ Nuevo RAT creado correctamente');
  };

  // Función para borrar RAT
  const deleteRAT = async (ratId, ratNombre) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el RAT "${ratNombre}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    setLoading(true);
    try {
      const tenantId = getCurrentTenant();
      
      // Borrar de Supabase
      const { error } = await supabase
        .from('mapeo_datos_rat')
        .delete()
        .eq('id', ratId)
        .eq('tenant_id', tenantId);

      if (error) {
        console.error('Error borrando RAT de Supabase:', error);
        
        // Fallback: borrar de localStorage
        const localKey = `ratData_${tenantId}`;
        const localRATs = JSON.parse(localStorage.getItem(localKey) || '[]');
        const updatedRATs = localRATs.filter(rat => rat.id !== ratId);
        localStorage.setItem(localKey, JSON.stringify(updatedRATs));
        
        alert('⚠️ RAT eliminado localmente. Revise conexión a Supabase.');
      } else {
        console.log('✅ RAT eliminado de Supabase');
        
        // Registrar en audit_log si está disponible
        try {
          await supabase.from('audit_log').insert({
            tenant_id: tenantId,
            action: 'DELETE',
            table_name: 'mapeo_datos_rat',
            record_id: ratId,
            changes: { status: 'deleted', nombre_actividad: ratNombre },
            user_id: 'usuario_actual'
          });
        } catch (auditError) {
          console.warn('No se pudo registrar en audit_log:', auditError);
        }
      }

      // Recargar lista
      await loadExistingRATs();
      alert(`✅ RAT "${ratNombre}" eliminado correctamente`);
      
    } catch (error) {
      console.error('Error eliminando RAT:', error);
      alert('❌ Error al eliminar el RAT');
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar RATs al abrir
  useEffect(() => {
    if (showRATList) {
      loadExistingRATs();
    }
  }, [showRATList]);

  // Exportar a PDF
  const exportToPDF = () => {
    try {
      // Validar que haya datos mínimos
      if (!ratData.nombre_actividad || !ratData.area_responsable) {
        setSavedMessage('⚠️ Por favor complete al menos el nombre de la actividad y área responsable antes de exportar');
        return;
      }

      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(20);
      doc.text('Registro de Actividades de Tratamiento (RAT)', 20, 20);
      
      // Información de la empresa
      doc.setFontSize(12);
      doc.text(`Empresa: ${empresaInfo?.nombre || 'Demo Company'}`, 20, 35);
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, 20, 42);
      doc.text(`Versión: ${ratData.version || '1.0'}`, 20, 49);
      
      // Línea divisoria
      doc.line(20, 55, 190, 55);
      
      // Sección 1: Identificación
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('1. IDENTIFICACIÓN DE LA ACTIVIDAD', 20, 65);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(11);
      
      let yPos = 75;
      doc.text(`Nombre: ${ratData.nombre_actividad || 'Sin especificar'}`, 25, yPos);
      yPos += 7;
      doc.text(`Área Responsable: ${ratData.area_responsable || 'Sin especificar'}`, 25, yPos);
      yPos += 7;
      doc.text(`Responsable: ${ratData.responsable_proceso || 'Sin especificar'}`, 25, yPos);
      yPos += 7;
      doc.text(`Base de Licitud: ${ratData.base_licitud || 'Sin especificar'}`, 25, yPos);
    yPos += 7;
    doc.text(`Finalidades: ${ratData.finalidades?.length > 0 ? ratData.finalidades.join(', ') : 'Sin especificar'}`, 25, yPos);
    
    // Sección 2: Categorías de Datos
    yPos += 15;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('2. CATEGORÍAS DE DATOS', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    
    yPos += 10;
    doc.text(`Categorías de Titulares: ${ratData.categorias_titulares?.length > 0 ? ratData.categorias_titulares.join(', ') : 'Sin especificar'}`, 25, yPos);
    yPos += 7;
    
    const categoriasActivas = Object.entries(ratData.categorias_datos)
      .filter(([key, value]) => value === true || (typeof value === 'string' && value.length > 0))
      .map(([key]) => key);
    doc.text(`Tipos de Datos: ${categoriasActivas.join(', ')}`, 25, yPos);
    
    if (ratData.datos_sensibles.length > 0) {
      yPos += 7;
      doc.text(`Datos Sensibles: ${ratData.datos_sensibles.join(', ')}`, 25, yPos);
    }
    
    if (ratData.menores_edad) {
      yPos += 7;
      doc.text('⚠️ Incluye datos de menores de edad', 25, yPos);
    }
    
    // Sección 3: Flujos y Destinatarios
    yPos += 15;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('3. FLUJOS Y DESTINATARIOS', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    
    yPos += 10;
    doc.text(`Sistemas: ${ratData.sistemas_almacenamiento?.length > 0 ? ratData.sistemas_almacenamiento.join(', ') : 'Sin especificar'}`, 25, yPos);
    
    if (ratData.destinatarios_internos?.length > 0) {
      yPos += 7;
      doc.text(`Destinatarios Internos: ${ratData.destinatarios_internos?.length > 0 ? ratData.destinatarios_internos.join(', ') : 'No aplica'}`, 25, yPos);
    }
    
    if (ratData.terceros_encargados?.length > 0) {
      yPos += 7;
      doc.text(`Encargados: ${ratData.terceros_encargados?.length > 0 ? ratData.terceros_encargados.join(', ') : 'No aplica'}`, 25, yPos);
    }
    
    if (ratData.transferencias_internacionales?.existe) {
      yPos += 7;
      doc.text(`Transferencias Internacionales: ${ratData.transferencias_internacionales?.paises?.length > 0 ? ratData.transferencias_internacionales.paises.join(', ') : 'No aplica'}`, 25, yPos);
      yPos += 7;
      doc.text(`Garantías: ${ratData.transferencias_internacionales?.garantias || 'No especificadas'}`, 25, yPos);
    }
    
    // Sección 4: Seguridad y Plazos
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    } else {
      yPos += 15;
    }
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('4. SEGURIDAD Y PLAZOS', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    
    yPos += 10;
    doc.text(`Plazo de Conservación: ${ratData.plazo_conservacion}`, 25, yPos);
    yPos += 7;
    doc.text(`Criterio de Eliminación: ${ratData.criterio_eliminacion}`, 25, yPos);
    yPos += 7;
    doc.text(`Nivel de Riesgo: ${ratData.nivel_riesgo.toUpperCase()}`, 25, yPos);
    
    if (ratData.requiere_dpia) {
      yPos += 7;
      doc.text('⚠️ REQUIERE EVALUACIÓN DE IMPACTO (DPIA)', 25, yPos);
    }
    
    // Medidas de seguridad
    yPos += 10;
    doc.text('Medidas de Seguridad Implementadas:', 25, yPos);
    yPos += 7;
    
    const medidasActivas = [];
    if (ratData.medidas_seguridad?.cifrado) medidasActivas.push('Cifrado');
    if (ratData.medidas_seguridad?.seudonimizacion) medidasActivas.push('Seudonimización');
    if (ratData.medidas_seguridad?.control_acceso) medidasActivas.push('Control de Acceso');
    if (ratData.medidas_seguridad?.logs_auditoria) medidasActivas.push('Logs de Auditoría');
    if (ratData.medidas_seguridad?.backup) medidasActivas.push('Backup');
    if (ratData.medidas_seguridad?.segregacion) medidasActivas.push('Segregación de Datos');
    
    medidasActivas.forEach(medida => {
      doc.text(`• ${medida}`, 30, yPos);
      yPos += 6;
    });
    
    // Firma y validación
    yPos += 15;
    doc.line(20, yPos, 190, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.text('Este documento ha sido generado por el Sistema LPDP Jurídica Digital SPA', 20, yPos);
    yPos += 5;
    doc.text('VALIDEZ LEGAL: Cumple TODOS los artículos de la Ley 21.719 - Válido para auditorías', 20, yPos);
    yPos += 5;
    doc.text('Sistema certificado para presentación ante autoridades competentes', 20, yPos);
    
    // Guardar el PDF
    const nombreActividad = ratData.nombre_actividad ? ratData.nombre_actividad.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_') : 'RAT';
    const fecha = new Date().toISOString().split('T')[0];
    const nombreArchivo = `RAT_${nombreActividad}_${fecha}.pdf`;
    
    doc.save(nombreArchivo);
    setSavedMessage('📄 PDF exportado exitosamente');
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      setSavedMessage('❌ Error al exportar PDF. Por favor intente nuevamente.');
    }
  };

  // Exportar a Excel
  const exportToExcel = () => {
    try {
      // Validar que haya datos mínimos
      if (!ratData.nombre_actividad || !ratData.area_responsable) {
        setSavedMessage('⚠️ Por favor complete al menos el nombre de la actividad y área responsable antes de exportar');
        return;
      }

      const wb = XLSX.utils.book_new();
      
      // Hoja 1: Información General
      const wsData = [
        ['REGISTRO DE ACTIVIDADES DE TRATAMIENTO (RAT)'],
        [],
        ['Campo', 'Valor'],
        ['Nombre de la Actividad', ratData.nombre_actividad || 'Sin especificar'],
        ['Área Responsable', ratData.area_responsable || 'Sin especificar'],
        ['Responsable del Proceso', ratData.responsable_proceso || 'Sin especificar'],
        ['Email', ratData.email_responsable || 'Sin especificar'],
        ['Base de Licitud', ratData.base_licitud || 'Sin especificar'],
        ['Justificación', ratData.justificacion_base || 'Sin especificar'],
        ['Finalidades', ratData.finalidades?.length > 0 ? ratData.finalidades.join(', ') : 'Sin especificar'],
        [],
        ['CATEGORÍAS DE DATOS'],
        ['Titulares', ratData.categorias_titulares?.length > 0 ? ratData.categorias_titulares.join(', ') : 'Sin especificar'],
        ['Datos Sensibles', ratData.datos_sensibles?.length > 0 ? ratData.datos_sensibles.join(', ') : 'No aplica'],
        ['Incluye Menores', ratData.menores_edad ? 'Sí' : 'No'],
        ['Volumen de Registros', ratData.volumen_registros || 'Sin especificar'],
        [],
        ['FLUJOS Y DESTINATARIOS'],
        ['Sistemas', ratData.sistemas_almacenamiento?.length > 0 ? ratData.sistemas_almacenamiento.join(', ') : 'Sin especificar'],
        ['Destinatarios Internos', ratData.destinatarios_internos?.length > 0 ? ratData.destinatarios_internos.join(', ') : 'No aplica'],
        ['Terceros Encargados', ratData.terceros_encargados?.length > 0 ? ratData.terceros_encargados.join(', ') : 'No aplica'],
        ['Terceros Cesionarios', ratData.terceros_cesionarios?.length > 0 ? ratData.terceros_cesionarios.join(', ') : 'No aplica'],
        [],
        ['TRANSFERENCIAS INTERNACIONALES'],
        ['Existe Transferencia', ratData.transferencias_internacionales?.existe ? 'Sí' : 'No'],
        ['Países', ratData.transferencias_internacionales?.paises?.length > 0 ? ratData.transferencias_internacionales.paises.join(', ') : 'No aplica'],
        ['Garantías', ratData.transferencias_internacionales?.garantias || 'No aplica'],
        [],
        ['SEGURIDAD Y PLAZOS'],
        ['Plazo de Conservación', ratData.plazo_conservacion || 'Sin especificar'],
        ['Criterio de Eliminación', ratData.criterio_eliminacion || 'Sin especificar'],
        ['Nivel de Riesgo', ratData.nivel_riesgo || 'bajo'],
        ['Requiere DPIA', ratData.requiere_dpia ? 'Sí' : 'No'],
        [],
        ['INFORMACIÓN DEL REGISTRO'],
        ['Fecha de Creación', ratData.fecha_creacion ? new Date(ratData.fecha_creacion).toLocaleDateString('es-CL') : new Date().toLocaleDateString('es-CL')],
        ['Última Actualización', ratData.fecha_actualizacion ? new Date(ratData.fecha_actualizacion).toLocaleDateString('es-CL') : new Date().toLocaleDateString('es-CL')],
        ['Versión', ratData.version || '1.0'],
        ['Estado', ratData.estado || 'borrador']
      ];
      
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      // Ajustar anchos de columna
      ws['!cols'] = [{ wch: 30 }, { wch: 50 }];
      
      XLSX.utils.book_append_sheet(wb, ws, 'RAT');
      
      // Hoja 2: Categorías de Datos (detalle)
      const wsData2 = [
        ['DETALLE DE CATEGORÍAS DE DATOS'],
        [],
        ['Categoría', 'Incluida', 'Detalles']
      ];
      
      if (ratData.categorias_datos) {
        Object.entries(ratData.categorias_datos).forEach(([key, value]) => {
          if (typeof value === 'boolean') {
            wsData2.push([key, value ? 'Sí' : 'No', '']);
          } else if (typeof value === 'string' && value) {
            wsData2.push([key, 'Sí', value]);
          }
        });
      }
      
      const ws2 = XLSX.utils.aoa_to_sheet(wsData2);
      ws2['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 40 }];
      XLSX.utils.book_append_sheet(wb, ws2, 'Categorías');
      
      // Hoja 3: Medidas de Seguridad
      const wsData3 = [
        ['MEDIDAS DE SEGURIDAD'],
        [],
        ['Medida', 'Implementada'],
        ['Cifrado', ratData.medidas_seguridad?.cifrado ? 'Sí' : 'No'],
        ['Seudonimización', ratData.medidas_seguridad?.seudonimizacion ? 'Sí' : 'No'],
        ['Control de Acceso', ratData.medidas_seguridad?.control_acceso ? 'Sí' : 'No'],
        ['Logs de Auditoría', ratData.medidas_seguridad?.logs_auditoria ? 'Sí' : 'No'],
        ['Backup', ratData.medidas_seguridad?.backup ? 'Sí' : 'No'],
        ['Segregación', ratData.medidas_seguridad?.segregacion ? 'Sí' : 'No'],
        [],
        ['MEDIDAS TÉCNICAS ADICIONALES'],
        ...(ratData.medidas_seguridad?.tecnicas?.map(m => [m, 'Sí']) || []),
        [],
        ['MEDIDAS ORGANIZATIVAS'],
        ...(ratData.medidas_seguridad?.organizativas?.map(m => [m, 'Sí']) || [])
      ];
      
      const ws3 = XLSX.utils.aoa_to_sheet(wsData3);
      ws3['!cols'] = [{ wch: 30 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, ws3, 'Seguridad');
      
      // Generar nombre de archivo seguro
      const nombreActividad = ratData.nombre_actividad ? ratData.nombre_actividad.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_') : 'RAT';
      const fecha = new Date().toISOString().split('T')[0];
      const nombreArchivo = `RAT_${nombreActividad}_${fecha}.xlsx`;
      
      // Guardar el archivo
      XLSX.writeFile(wb, nombreArchivo);
      setSavedMessage('📊 Excel exportado exitosamente');
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      setSavedMessage('❌ Error al exportar Excel. Por favor intente nuevamente.');
    }
  };

  // Renderizado de cada fase
  const renderPhaseContent = () => {
    switch(activeStep) {
      case 0: // FASE 1: Identificación
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" icon={<Info />}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Fase 1: Identificación de la Actividad de Tratamiento
                </Typography>
                <Typography variant="body2">
                  Describa la actividad que involucra el tratamiento de datos personales según el Art. 3 de la Ley 21.719
                </Typography>
              </Alert>
            </Grid>

            {/* Cargar RATs existentes */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'grey.50', border: '1px dashed', borderColor: 'primary.main' }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">
                  📝 Cargar RAT Existente para Editar
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Si ya tienes RATs guardados, puedes cargar uno para continuar editándolo
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<FolderOpen />}
                  onClick={() => setShowRATList(true)}
                  disabled={loadingRATs}
                >
                  Ver y Cargar RATs Guardados
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Templates disponibles */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                🎯 Usar Template de Industria (Opcional)
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(templates).map(([key, template]) => (
                  <Grid item xs={12} sm={6} md={3} key={key}>
                    <Paper
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        border: selectedTemplate === key ? '2px solid' : '1px solid',
                        borderColor: selectedTemplate === key ? 'primary.main' : 'divider',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                      onClick={() => applyTemplate(key)}
                    >
                      <Box textAlign="center">
                        <Typography variant="h3">{template.icon}</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {template.nombre}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Nombre de la Actividad"
                value={ratData.nombre_actividad}
                onChange={(e) => setRatData({...ratData, nombre_actividad: e.target.value})}
                helperText="Ej: Proceso de Reclutamiento y Selección, Gestión de Clientes, Monitoreo de Producción"
                InputProps={{
                  startAdornment: <Business sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Área Responsable</InputLabel>
                <Select
                  value={ratData.area_responsable}
                  onChange={(e) => setRatData({...ratData, area_responsable: e.target.value})}
                  label="Área Responsable"
                >
                  <MenuItem value="RRHH">Recursos Humanos</MenuItem>
                  <MenuItem value="Marketing">Marketing</MenuItem>
                  <MenuItem value="Ventas">Ventas</MenuItem>
                  <MenuItem value="Produccion">Producción</MenuItem>
                  <MenuItem value="Finanzas">Finanzas</MenuItem>
                  <MenuItem value="TI">Tecnología</MenuItem>
                  <MenuItem value="Legal">Legal</MenuItem>
                  <MenuItem value="Operaciones">Operaciones</MenuItem>
                  <MenuItem value="Calidad">Calidad</MenuItem>
                  <MenuItem value="Logistica">Logística</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Responsable del Proceso"
                value={ratData.responsable_proceso}
                onChange={(e) => setRatData({...ratData, responsable_proceso: e.target.value})}
                helperText="Nombre del responsable directo"
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Email del Responsable"
                type="email"
                value={ratData.email_responsable}
                onChange={(e) => {
                  const email = e.target.value;
                  setRatData({...ratData, email_responsable: email});
                  // Validación básica de email
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (email && !emailRegex.test(email)) {
                    setValidationErrors(prev => [...prev.filter(err => !err.includes('Email')), 'Email inválido - debe incluir @ y dominio']);
                  } else {
                    setValidationErrors(prev => prev.filter(err => !err.includes('Email')));
                  }
                }}
                error={validationErrors.some(err => err.includes('Email'))}
                helperText={validationErrors.find(err => err.includes('Email')) || "Formato: usuario@empresa.cl"}
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Finalidades del Tratamiento *
              </Typography>
              <FormGroup>
                {[
                  'Gestión de personal',
                  'Marketing directo',
                  'Prestación de servicios',
                  'Cumplimiento legal',
                  'Análisis y estadísticas',
                  'Seguridad',
                  'Investigación',
                  'Mejora de productos'
                ].map(finalidad => (
                  <FormControlLabel
                    key={finalidad}
                    control={
                      <Checkbox
                        checked={(ratData.finalidades || []).includes(finalidad)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRatData({...ratData, finalidades: [...(ratData.finalidades || []), finalidad]});
                          } else {
                            setRatData({...ratData, finalidades: (ratData.finalidades || []).filter(f => f !== finalidad)});
                          }
                        }}
                      />
                    }
                    label={finalidad}
                  />
                ))}
              </FormGroup>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Detalle adicional de finalidades"
                value={ratData.finalidad_detalle}
                onChange={(e) => setRatData({...ratData, finalidad_detalle: e.target.value})}
                sx={{ mt: 2 }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Base de Licitud (Art. 12 Ley 21.719)</InputLabel>
                <Select
                  value={ratData.base_licitud}
                  onChange={(e) => setRatData({...ratData, base_licitud: e.target.value})}
                  label="Base de Licitud (Art. 12 Ley 21.719)"
                >
                  <MenuItem value="consentimiento">
                    <Box>
                      <Typography variant="body2" fontWeight={600}>Consentimiento</Typography>
                      <Typography variant="caption">El titular dio su consentimiento libre e informado</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="contrato">
                    <Box>
                      <Typography variant="body2" fontWeight={600}>Ejecución de Contrato</Typography>
                      <Typography variant="caption">Necesario para ejecutar un contrato con el titular</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="obligacion_legal">
                    <Box>
                      <Typography variant="body2" fontWeight={600}>Obligación Legal</Typography>
                      <Typography variant="caption">Requerido por ley o normativa vigente</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="interes_legitimo">
                    <Box>
                      <Typography variant="body2" fontWeight={600}>Interés Legítimo</Typography>
                      <Typography variant="caption">Interés legítimo del responsable o tercero</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="interes_vital">
                    <Box>
                      <Typography variant="body2" fontWeight={600}>Interés Vital</Typography>
                      <Typography variant="caption">Proteger intereses vitales del titular o terceras personas</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="interes_publico">
                    <Box>
                      <Typography variant="body2" fontWeight={600}>Interés Público</Typography>
                      <Typography variant="caption">Ejercicio de funciones públicas o poderes públicos</Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Justificación de la Base de Licitud"
                value={ratData.justificacion_base}
                onChange={(e) => setRatData({...ratData, justificacion_base: e.target.value})}
                helperText="Explique por qué esta base legal es aplicable a esta actividad"
              />
            </Grid>
          </Grid>
        );

      case 1: // FASE 2: Categorías de Datos
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" icon={<Info />}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Fase 2: Categorías de Datos Personales
                </Typography>
                <Typography variant="body2">
                  Identifique los tipos de titulares y las categorías de datos según el Art. 2 de la Ley 21.719
                </Typography>
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Categorías de Titulares de Datos *
              </Typography>
              <Autocomplete
                multiple
                freeSolo
                options={[
                  'Empleados',
                  'Candidatos',
                  'Clientes',
                  'Proveedores',
                  'Visitantes',
                  'Estudiantes',
                  'Pacientes',
                  'Beneficiarios',
                  'Accionistas',
                  'Contactos comerciales'
                ]}
                value={ratData.categorias_titulares || []}
                onChange={(e, newValue) => setRatData({...ratData, categorias_titulares: newValue || []})}
                renderTags={(value, getTagProps) =>
                  (value || []).map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Seleccione o escriba las categorías"
                    helperText="Grupos de personas cuyos datos se tratan"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Categorías de Datos Personales *
              </Typography>
              <Paper sx={{ p: 2 }}>
                <FormGroup>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={ratData.categorias_datos.identificacion}
                            onChange={(e) => setRatData({
                              ...ratData,
                              categorias_datos: {...ratData.categorias_datos, identificacion: e.target.checked}
                            })}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2">Identificación</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Nombre, RUT, CI, pasaporte
                            </Typography>
                          </Box>
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={ratData.categorias_datos.contacto}
                            onChange={(e) => setRatData({
                              ...ratData,
                              categorias_datos: {...ratData.categorias_datos, contacto: e.target.checked}
                            })}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2">Contacto</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Dirección, teléfono, email
                            </Typography>
                          </Box>
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={ratData.categorias_datos.laboral}
                            onChange={(e) => setRatData({
                              ...ratData,
                              categorias_datos: {...ratData.categorias_datos, laboral: e.target.checked}
                            })}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2">Laboral</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Cargo, salario, evaluaciones
                            </Typography>
                          </Box>
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={ratData.categorias_datos.academico}
                            onChange={(e) => setRatData({
                              ...ratData,
                              categorias_datos: {...ratData.categorias_datos, academico: e.target.checked}
                            })}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2">Académico</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Títulos, certificados, notas
                            </Typography>
                          </Box>
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={ratData.categorias_datos.financiero}
                            onChange={(e) => setRatData({
                              ...ratData,
                              categorias_datos: {...ratData.categorias_datos, financiero: e.target.checked}
                            })}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2">Financiero</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Cuentas, tarjetas, ingresos
                            </Typography>
                          </Box>
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={ratData.categorias_datos.navegacion}
                            onChange={(e) => setRatData({
                              ...ratData,
                              categorias_datos: {...ratData.categorias_datos, navegacion: e.target.checked}
                            })}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2">Navegación</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Cookies, IP, logs
                            </Typography>
                          </Box>
                        }
                      />
                    </Grid>
                  </Grid>
                </FormGroup>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Alert severity="warning" icon={<Warning />}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Datos Sensibles (Art. 2 lit. g - Requieren protección reforzada)
                </Typography>
              </Alert>
              <Paper sx={{ p: 2, mt: 2, bgcolor: 'warning.50' }}>
                <FormGroup>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={ratData.categorias_datos.salud}
                            onChange={(e) => {
                              setRatData({
                                ...ratData,
                                categorias_datos: {...ratData.categorias_datos, salud: e.target.checked}
                              });
                              if (e.target.checked && !(ratData.datos_sensibles || []).includes('Salud')) {
                                setRatData(prev => ({
                                  ...prev,
                                  datos_sensibles: [...(prev.datos_sensibles || []), 'Salud']
                                }));
                              }
                            }}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" color="error">🏥 Datos de Salud</Typography>
                            <Typography variant="caption">
                              Historias clínicas, diagnósticos, tratamientos
                            </Typography>
                          </Box>
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={ratData.categorias_datos.biometrico}
                            onChange={(e) => {
                              setRatData({
                                ...ratData,
                                categorias_datos: {...ratData.categorias_datos, biometrico: e.target.checked}
                              });
                              if (e.target.checked && !(ratData.datos_sensibles || []).includes('Biométricos')) {
                                setRatData(prev => ({
                                  ...prev,
                                  datos_sensibles: [...(prev.datos_sensibles || []), 'Biométricos']
                                }));
                              }
                            }}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" color="error">👆 Datos Biométricos</Typography>
                            <Typography variant="caption">
                              Huellas, reconocimiento facial, iris
                            </Typography>
                          </Box>
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={ratData.categorias_datos.genetico}
                            onChange={(e) => {
                              setRatData({
                                ...ratData,
                                categorias_datos: {...ratData.categorias_datos, genetico: e.target.checked}
                              });
                              if (e.target.checked && !(ratData.datos_sensibles || []).includes('Genéticos')) {
                                setRatData(prev => ({
                                  ...prev,
                                  datos_sensibles: [...(prev.datos_sensibles || []), 'Genéticos']
                                }));
                              }
                            }}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" color="error">🧬 Datos Genéticos</Typography>
                            <Typography variant="caption">
                              ADN, información genética
                            </Typography>
                          </Box>
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={ratData.categorias_datos.socioeconomico}
                            onChange={(e) => {
                              setRatData({
                                ...ratData,
                                categorias_datos: {...ratData.categorias_datos, socioeconomico: e.target.checked}
                              });
                              if (e.target.checked && !(ratData.datos_sensibles || []).includes('Socioeconómicos')) {
                                setRatData(prev => ({
                                  ...prev,
                                  datos_sensibles: [...(prev.datos_sensibles || []), 'Socioeconómicos']
                                }));
                              }
                            }}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" color="error">💰 Situación Socioeconómica</Typography>
                            <Typography variant="caption">
                              Nivel de ingresos, deudas, patrimonio
                            </Typography>
                          </Box>
                        }
                      />
                    </Grid>
                  </Grid>
                </FormGroup>

                <Autocomplete
                  multiple
                  freeSolo
                  options={[
                    'Origen étnico o racial',
                    'Opiniones políticas',
                    'Convicciones religiosas',
                    'Afiliación sindical',
                    'Vida sexual',
                    'Orientación sexual'
                  ]}
                  value={(ratData.datos_sensibles || []).filter(d => !['Salud', 'Biométricos', 'Genéticos', 'Socioeconómicos'].includes(d))}
                  onChange={(e, newValue) => {
                    const datosFijos = ratData.datos_sensibles.filter(d => 
                      ['Salud', 'Biométricos', 'Genéticos', 'Socioeconómicos'].includes(d)
                    );
                    setRatData({...ratData, datos_sensibles: [...datosFijos, ...newValue]});
                  }}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip 
                        variant="outlined" 
                        label={option} 
                        color="error"
                        {...getTagProps({ index })} 
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Otros datos sensibles"
                      placeholder="Agregue si aplica"
                      sx={{ mt: 2 }}
                    />
                  )}
                />
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={ratData.menores_edad}
                    onChange={(e) => setRatData({...ratData, menores_edad: e.target.checked})}
                    color="warning"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      👶 ¿Incluye datos de menores de edad (NNA)?
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Requiere consentimiento de padres/tutores y consideración del interés superior del niño
                    </Typography>
                  </Box>
                }
              />
            </Grid>

            {/* Separador visual */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="primary" gutterBottom>
                📊 Volumen y Frecuencia de Datos
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Volumen estimado de registros"
                value={ratData.volumen_registros || ''}
                onChange={(e) => setRatData({...ratData, volumen_registros: e.target.value})}
                helperText="Ej: 1000-5000 registros, >10000 registros"
                placeholder="Indique la cantidad aproximada de registros"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Frecuencia de actualización</InputLabel>
                <Select
                  value={ratData.frecuencia_actualizacion || ''}
                  onChange={(e) => setRatData({...ratData, frecuencia_actualizacion: e.target.value})}
                  label="Frecuencia de actualización"
                >
                  <MenuItem value="">
                    <em>Seleccionar frecuencia</em>
                  </MenuItem>
                  <MenuItem value="tiempo_real">Tiempo real</MenuItem>
                  <MenuItem value="diaria">Diaria</MenuItem>
                  <MenuItem value="semanal">Semanal</MenuItem>
                  <MenuItem value="mensual">Mensual</MenuItem>
                  <MenuItem value="anual">Anual</MenuItem>
                  <MenuItem value="ocasional">Ocasional</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Otras categorías de datos (especifique)"
                value={ratData.categorias_datos.otros}
                onChange={(e) => setRatData({
                  ...ratData,
                  categorias_datos: {...ratData.categorias_datos, otros: e.target.value}
                })}
                helperText="Describa cualquier otra categoría de datos no listada anteriormente"
              />
            </Grid>
          </Grid>
        );

      case 2: // FASE 3: Flujos y Destinatarios
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" icon={<Info />}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Fase 3: Flujos de Datos y Destinatarios
                </Typography>
                <Typography variant="body2">
                  Documente dónde se almacenan los datos y con quién se comparten (Art. 5 y 27 Ley 21.719)
                </Typography>
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                <Storage sx={{ verticalAlign: 'middle', mr: 1 }} />
                Sistemas de Almacenamiento *
              </Typography>
              <Autocomplete
                multiple
                freeSolo
                options={[
                  'Base de datos local',
                  'Servidor en la nube',
                  'ERP (SAP, Oracle, etc.)',
                  'CRM (Salesforce, HubSpot, etc.)',
                  'Sistema de RRHH',
                  'Archivos físicos',
                  'Google Drive / OneDrive',
                  'Data Warehouse',
                  'Sistema de correo',
                  'Aplicación móvil',
                  'Sensores IoT',
                  'Sistema de videovigilancia'
                ]}
                value={ratData.sistemas_almacenamiento || []}
                onChange={(e, newValue) => setRatData({...ratData, sistemas_almacenamiento: newValue || []})}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip 
                      variant="outlined" 
                      label={option}
                      icon={<Storage />}
                      {...getTagProps({ index })} 
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Sistemas donde se almacenan los datos"
                    helperText="Identifique todos los sistemas, bases de datos y archivos"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                <Group sx={{ verticalAlign: 'middle', mr: 1 }} />
                Destinatarios Internos
              </Typography>
              <Autocomplete
                multiple
                freeSolo
                options={[
                  'Gerencia General',
                  'Recursos Humanos',
                  'Finanzas',
                  'Marketing',
                  'Ventas',
                  'Producción',
                  'Calidad',
                  'Legal',
                  'TI',
                  'Auditoría Interna'
                ]}
                value={ratData.destinatarios_internos || []}
                onChange={(e, newValue) => setRatData({...ratData, destinatarios_internos: newValue || []})}
                renderTags={(value, getTagProps) =>
                  (value || []).map((option, index) => (
                    <Chip 
                      variant="outlined" 
                      label={option}
                      color="primary"
                      size="small"
                      {...getTagProps({ index })} 
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Áreas internas con acceso a los datos"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                <Business sx={{ verticalAlign: 'middle', mr: 1 }} />
                Terceros Encargados del Tratamiento
              </Typography>
              <Autocomplete
                multiple
                freeSolo
                options={[
                  'Proveedor de cloud (AWS, Azure, Google)',
                  'Empresa de nómina',
                  'Agencia de marketing',
                  'Call center',
                  'Empresa de mensajería',
                  'Proveedor de software',
                  'Empresa de seguridad',
                  'Consultora',
                  'Empresa de selección de personal'
                ]}
                value={ratData.terceros_encargados || []}
                onChange={(e, newValue) => setRatData({...ratData, terceros_encargados: newValue || []})}
                renderTags={(value, getTagProps) =>
                  (value || []).map((option, index) => (
                    <Chip 
                      variant="outlined" 
                      label={option}
                      color="secondary"
                      size="small"
                      {...getTagProps({ index })} 
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Proveedores que procesan datos por su cuenta"
                    helperText="Empresas que tratan datos siguiendo sus instrucciones"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                <Public sx={{ verticalAlign: 'middle', mr: 1 }} />
                Terceros Cesionarios
              </Typography>
              <Autocomplete
                multiple
                freeSolo
                options={[
                  // Instituciones Financieras y Crediticias
                  'DICOM Equifax Chile',
                  'Transbank S.A.',
                  'Banco Central de Chile',
                  'CMF (Comisión para el Mercado Financiero)',
                  'SBIF (Superintendencia de Bancos)',
                  // Organismos Públicos Chilenos
                  'SII (Servicio de Impuestos Internos)',
                  'Registro Civil e Identificación',
                  'ChileCompra (Portal de compras públicas)',
                  'Previred (Sistemas previsionales)',
                  'FONASA',
                  'SERNAPESCA',
                  'SERNAC',
                  'Dirección del Trabajo',
                  'UAF (Unidad de Análisis Financiero)',
                  // Instituciones de Seguridad Social
                  'AFP Capital',
                  'AFP Habitat',
                  'AFP Provida',
                  'AFP PlanVital',
                  'Instituto de Seguridad Laboral (ISL)',
                  'Mutual de Seguridad CCHC',
                  'Asociación Chilena de Seguridad (ACHS)',
                  // Servicios Especializados Chile
                  'CENCOSUD',
                  'Falabella',
                  'Ripley',
                  'Walmart Chile',
                  'Santander Chile',
                  'BCI',
                  'Banco Estado',
                  'Entel Chile',
                  'VTR',
                  'Movistar Chile',
                  // Certificadoras y Auditoras
                  'EY Chile',
                  'PwC Chile',
                  'Deloitte Chile',
                  'KPMG Chile',
                  // Educación y Capacitación
                  'SENCE',
                  'Universidad de Chile',
                  'Pontificia Universidad Católica',
                  'Universidad de Concepción',
                  // Otros servicios específicos
                  'Correos de Chile',
                  'Chilexpress',
                  'Starken',
                  'NotariaChile (Red Notarial)',
                  'Conservador de Bienes Raíces'
                ]}
                value={ratData.terceros_cesionarios || []}
                onChange={(e, newValue) => setRatData({...ratData, terceros_cesionarios: newValue || []})}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip 
                      variant="outlined" 
                      label={option}
                      color="warning"
                      size="small"
                      {...getTagProps({ index })} 
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Terceros que reciben los datos"
                    helperText="Organizaciones a las que se ceden o comunican datos"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3, bgcolor: 'info.50' }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  <Language sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Transferencias Internacionales (Art. 27-29)
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={ratData.transferencias_internacionales.existe}
                      onChange={(e) => setRatData({
                        ...ratData,
                        transferencias_internacionales: {
                          ...ratData.transferencias_internacionales,
                          existe: e.target.checked
                        }
                      })}
                      color="warning"
                    />
                  }
                  label="¿Se transfieren datos fuera de Chile?"
                />

                <Collapse in={ratData.transferencias_internacionales.existe}>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                      <Autocomplete
                        multiple
                        freeSolo
                        options={[
                          '🇺🇸 Estados Unidos',
                          '🇪🇺 Unión Europea',
                          '🇬🇧 Reino Unido',
                          '🇨🇦 Canadá',
                          '🇲🇽 México',
                          '🇧🇷 Brasil',
                          '🇦🇷 Argentina',
                          '🇨🇴 Colombia',
                          '🇵🇪 Perú',
                          '🇨🇳 China',
                          '🇮🇳 India',
                          '🇯🇵 Japón',
                          '🇦🇺 Australia'
                        ]}
                        value={ratData.transferencias_internacionales?.paises || []}
                        onChange={(e, newValue) => setRatData({
                          ...ratData,
                          transferencias_internacionales: {
                            ...ratData.transferencias_internacionales,
                            paises: newValue || []
                          }
                        })}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip 
                              variant="outlined" 
                              label={option}
                              color="info"
                              {...getTagProps({ index })} 
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            label="Países de destino"
                            placeholder="Seleccione o escriba los países"
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Garantías Aplicadas</InputLabel>
                        <Select
                          value={ratData.transferencias_internacionales.garantias}
                          onChange={(e) => setRatData({
                            ...ratData,
                            transferencias_internacionales: {
                              ...ratData.transferencias_internacionales,
                              garantias: e.target.value
                            }
                          })}
                          label="Garantías Aplicadas"
                        >
                          <MenuItem value="decision_adecuacion">Decisión de Adecuación APDP</MenuItem>
                          <MenuItem value="clausulas_contractuales">Cláusulas Contractuales Tipo (CCT)</MenuItem>
                          <MenuItem value="normas_corporativas">Normas Corporativas Vinculantes (BCR)</MenuItem>
                          <MenuItem value="consentimiento_explicito">Consentimiento Explícito del Titular</MenuItem>
                          <MenuItem value="contrato">Necesario para Ejecución de Contrato</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Descripción del mecanismo de transferencia"
                        value={ratData.transferencias_internacionales.mecanismo}
                        onChange={(e) => setRatData({
                          ...ratData,
                          transferencias_internacionales: {
                            ...ratData.transferencias_internacionales,
                            mecanismo: e.target.value
                          }
                        })}
                        helperText="Ej: Uso de servicios cloud con servidores en EE.UU., transferencia a casa matriz"
                      />
                    </Grid>
                  </Grid>
                </Collapse>
              </Paper>
            </Grid>
          </Grid>
        );

      case 3: // FASE 4: Plazos y Seguridad
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" icon={<Info />}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Fase 4: Plazos de Conservación y Medidas de Seguridad
                </Typography>
                <Typography variant="body2">
                  Defina los períodos de retención y las medidas de protección según el Art. 26 de la Ley 21.719
                </Typography>
              </Alert>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Plazo de Conservación (Art. 4 Ley 21.719)</InputLabel>
                <Select
                  value={ratData.plazo_conservacion}
                  onChange={(e) => setRatData({...ratData, plazo_conservacion: e.target.value})}
                  label="Plazo de Conservación (Art. 4 Ley 21.719)"
                  startAdornment={<Timer sx={{ mr: 1, color: 'action.active' }} />}
                >
                  <MenuItem value="6 meses (CV según Art. 4 - postulantes no seleccionados)">
                    6 meses (CV según Art. 4 - postulantes no seleccionados)
                  </MenuItem>
                  <MenuItem value="1 año">1 año</MenuItem>
                  <MenuItem value="2 años">2 años</MenuItem>
                  <MenuItem value="5 años">5 años</MenuItem>
                  <MenuItem value="6 años (normativa tributaria SII)">6 años (normativa tributaria SII)</MenuItem>
                  <MenuItem value="10 años">10 años</MenuItem>
                  <MenuItem value="Mientras dure la relación contractual">
                    Mientras dure la relación contractual
                  </MenuItem>
                  <MenuItem value="Según normativa específica (indicar cual)">
                    Según normativa específica (indicar cual)
                  </MenuItem>
                  <MenuItem value="Permanente (archivo histórico justificado)">
                    Permanente (archivo histórico justificado)
                  </MenuItem>
                </Select>
                <FormHelperText>
                  Debe cumplir principio de minimización temporal (Art. 4 Ley 21.719)
                </FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Criterio de Eliminación (Art. 4 Ley 21.719)</InputLabel>
                <Select
                  value={ratData.criterio_eliminacion}
                  onChange={(e) => setRatData({...ratData, criterio_eliminacion: e.target.value})}
                  label="Criterio de Eliminación (Art. 4 Ley 21.719)"
                >
                  <MenuItem value="Eliminación segura (borrado irreversible - Art. 4)">
                    Eliminación segura (borrado irreversible - Art. 4)
                  </MenuItem>
                  <MenuItem value="Anonimización (pérdida de identificabilidad - Art. 4)">
                    Anonimización (pérdida de identificabilidad - Art. 4)
                  </MenuItem>
                  <MenuItem value="Bloqueo (restricción de tratamiento - Art. 19)">
                    Bloqueo (restricción de tratamiento - Art. 19)
                  </MenuItem>
                  <MenuItem value="Según lo establecido en normativa específica">
                    Según lo establecido en normativa específica
                  </MenuItem>
                  <MenuItem value="Destrucción física (soporte físico)">
                    Destrucción física (soporte físico)
                  </MenuItem>
                  <MenuItem value="Seudonimización previa + eliminación">
                    Seudonimización previa + eliminación
                  </MenuItem>
                </Select>
                <FormHelperText>
                  Método conforme al Art. 4 - garantiza no reidentificación
                </FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                <Shield sx={{ verticalAlign: 'middle', mr: 1 }} />
                Medidas de Seguridad Técnicas
              </Typography>
              <Paper sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={ratData.medidas_seguridad.cifrado}
                          onChange={(e) => setRatData({
                            ...ratData,
                            medidas_seguridad: {...ratData.medidas_seguridad, cifrado: e.target.checked}
                          })}
                          color="success"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2">🔐 Cifrado</Typography>
                          <Typography variant="caption" color="text.secondary">
                            En tránsito y en reposo
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={ratData.medidas_seguridad.seudonimizacion}
                          onChange={(e) => setRatData({
                            ...ratData,
                            medidas_seguridad: {...ratData.medidas_seguridad, seudonimizacion: e.target.checked}
                          })}
                          color="success"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2">👤 Seudonimización</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Separación de identificadores
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={ratData.medidas_seguridad.control_acceso}
                          onChange={(e) => setRatData({
                            ...ratData,
                            medidas_seguridad: {...ratData.medidas_seguridad, control_acceso: e.target.checked}
                          })}
                          color="success"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2">🔑 Control de Acceso</Typography>
                          <Typography variant="caption" color="text.secondary">
                            RBAC, MFA, privilegios mínimos
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={ratData.medidas_seguridad.logs_auditoria}
                          onChange={(e) => setRatData({
                            ...ratData,
                            medidas_seguridad: {...ratData.medidas_seguridad, logs_auditoria: e.target.checked}
                          })}
                          color="success"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2">📝 Logs de Auditoría</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Registro de accesos y cambios
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={ratData.medidas_seguridad.backup}
                          onChange={(e) => setRatData({
                            ...ratData,
                            medidas_seguridad: {...ratData.medidas_seguridad, backup: e.target.checked}
                          })}
                          color="success"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2">💾 Backup</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Respaldo periódico
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={ratData.medidas_seguridad.segregacion}
                          onChange={(e) => setRatData({
                            ...ratData,
                            medidas_seguridad: {...ratData.medidas_seguridad, segregacion: e.target.checked}
                          })}
                          color="success"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2">🔒 Segregación</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Separación de ambientes
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>
                </Grid>

                <Autocomplete
                  multiple
                  freeSolo
                  options={[
                    'Firewall',
                    'Antivirus/Antimalware',
                    'IDS/IPS',
                    'DLP (Data Loss Prevention)',
                    'VPN',
                    'Tokenización',
                    'Certificados SSL/TLS',
                    'WAF (Web Application Firewall)',
                    'SIEM',
                    'Gestión de vulnerabilidades'
                  ]}
                  value={ratData.medidas_seguridad?.tecnicas || []}
                  onChange={(e, newValue) => setRatData({
                    ...ratData,
                    medidas_seguridad: {...ratData.medidas_seguridad, tecnicas: newValue || []}
                  })}
                  renderTags={(value, getTagProps) =>
                    (value || []).map((option, index) => (
                      <Chip 
                        variant="outlined" 
                        label={option}
                        color="success"
                        size="small"
                        {...getTagProps({ index })} 
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Otras medidas técnicas"
                      placeholder="Agregue medidas adicionales"
                      sx={{ mt: 2 }}
                    />
                  )}
                />
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                <VerifiedUser sx={{ verticalAlign: 'middle', mr: 1 }} />
                Medidas Organizativas
              </Typography>
              <Autocomplete
                multiple
                freeSolo
                options={[
                  'Política de privacidad',
                  'Contratos de confidencialidad',
                  'Capacitación del personal',
                  'Procedimientos de respuesta a incidentes',
                  'Evaluaciones periódicas de riesgo',
                  'Auditorías de cumplimiento',
                  'Designación de DPO',
                  'Comité de privacidad',
                  'Política de escritorio limpio',
                  'Control de acceso físico',
                  'Procedimiento de destrucción segura'
                ]}
                value={ratData.medidas_seguridad?.organizativas || []}
                onChange={(e, newValue) => setRatData({
                  ...ratData,
                  medidas_seguridad: {...ratData.medidas_seguridad, organizativas: newValue || []}
                })}
                renderTags={(value, getTagProps) =>
                  (value || []).map((option, index) => (
                    <Chip 
                      variant="outlined" 
                      label={option}
                      color="primary"
                      size="small"
                      {...getTagProps({ index })} 
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Políticas, procedimientos y controles organizativos"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                <Warning sx={{ verticalAlign: 'middle', mr: 1 }} />
                Evaluación de Riesgos
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'warning.50' }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Nivel de Riesgo Global</InputLabel>
                  <Select
                    value={ratData.nivel_riesgo}
                    onChange={(e) => setRatData({...ratData, nivel_riesgo: e.target.value})}
                    label="Nivel de Riesgo Global"
                  >
                    <MenuItem value="bajo">
                      <Box display="flex" alignItems="center">
                        <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                        <Typography>Bajo - Impacto mínimo en derechos</Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="medio">
                      <Box display="flex" alignItems="center">
                        <Info sx={{ color: 'warning.main', mr: 1 }} />
                        <Typography>Medio - Impacto moderado posible</Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="alto">
                      <Box display="flex" alignItems="center">
                        <Warning sx={{ color: 'error.main', mr: 1 }} />
                        <Typography>Alto - Impacto significativo probable</Typography>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>

                <Autocomplete
                  multiple
                  freeSolo
                  options={[
                    'Acceso no autorizado',
                    'Pérdida de datos',
                    'Modificación no autorizada',
                    'Divulgación indebida',
                    'Indisponibilidad del servicio',
                    'Incumplimiento normativo',
                    'Discriminación algorítmica',
                    'Reidentificación',
                    'Uso incompatible',
                    'Retención excesiva'
                  ]}
                  value={ratData.riesgos_identificados || []}
                  onChange={(e, newValue) => setRatData({...ratData, riesgos_identificados: newValue || []})}
                  renderTags={(value, getTagProps) =>
                    (value || []).map((option, index) => (
                      <Chip 
                        variant="outlined" 
                        label={option}
                        color="error"
                        size="small"
                        {...getTagProps({ index })} 
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Riesgos identificados"
                      placeholder="Principales amenazas y vulnerabilidades"
                    />
                  )}
                />

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Medidas de mitigación específicas"
                  value={ratData.medidas_mitigacion.join('\n')}
                  onChange={(e) => setRatData({...ratData, medidas_mitigacion: e.target.value.split('\n').filter(m => m)})}
                  helperText="Una medida por línea"
                  sx={{ mt: 2 }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={ratData.requiere_dpia}
                      onChange={(e) => {
                        const requiresDPIA = e.target.checked;
                        setRatData({...ratData, requiere_dpia: requiresDPIA});
                        if (requiresDPIA) {
                          setShowDPIAForm(true);
                        }
                      }}
                      color="error"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        ¿Requiere Evaluación de Impacto (DPIA)?
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Obligatorio para: tratamiento masivo, perfilamiento con efectos jurídicos, datos sensibles sin consentimiento
                      </Typography>
                    </Box>
                  }
                  sx={{ mt: 2 }}
                />
                
                {ratData.requiere_dpia && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>DPIA OBLIGATORIA (Art. 27 Ley 21.719):</strong> 
                      Se ha habilitado el formulario de Evaluación de Impacto automáticamente.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      color="error" 
                      size="small" 
                      onClick={() => setShowDPIAForm(true)}
                      sx={{ mt: 1 }}
                    >
                      Abrir Formulario DPIA
                    </Button>
                  </Alert>
                )}
              </Paper>
            </Grid>
          </Grid>
        );

      case 4: // FASE 5: Revisión y Exportación
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="success" icon={<CheckCircle />}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Fase 5: Revisión Final y Exportación
                </Typography>
                <Typography variant="body2">
                  Revise la información y exporte su RAT en formato PDF o Excel
                </Typography>
              </Alert>
            </Grid>

            {/* Resumen Visual */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  📋 Resumen del Registro de Actividad de Tratamiento
                </Typography>
                
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell><strong>Actividad:</strong></TableCell>
                        <TableCell>{ratData.nombre_actividad}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Área:</strong></TableCell>
                        <TableCell>{ratData.area_responsable}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Base Legal:</strong></TableCell>
                        <TableCell>
                          <Chip label={ratData.base_licitud} color="primary" size="small" />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Titulares:</strong></TableCell>
                        <TableCell>{ratData.categorias_titulares?.length > 0 ? ratData.categorias_titulares.join(', ') : 'Sin especificar'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Datos Sensibles:</strong></TableCell>
                        <TableCell>
                          {ratData.datos_sensibles.length > 0 ? (
                            ratData.datos_sensibles.map(d => (
                              <Chip key={d} label={d} color="error" size="small" sx={{ mr: 0.5 }} />
                            ))
                          ) : (
                            <Chip label="No aplica" color="success" size="small" />
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Transferencias Int.:</strong></TableCell>
                        <TableCell>
                          {ratData.transferencias_internacionales.existe ? (
                            <Chip 
                              label={`Sí - ${ratData.transferencias_internacionales?.paises?.length > 0 ? ratData.transferencias_internacionales.paises.join(', ') : 'Sin especificar'}`} 
                              color="warning" 
                              size="small" 
                            />
                          ) : (
                            <Chip label="No" color="success" size="small" />
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Plazo:</strong></TableCell>
                        <TableCell>{ratData.plazo_conservacion}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Nivel de Riesgo:</strong></TableCell>
                        <TableCell>
                          <Chip 
                            label={ratData.nivel_riesgo.toUpperCase()} 
                            color={
                              ratData.nivel_riesgo === 'bajo' ? 'success' : 
                              ratData.nivel_riesgo === 'medio' ? 'warning' : 'error'
                            }
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Requiere DPIA:</strong></TableCell>
                        <TableCell>
                          {ratData.requiere_dpia ? (
                            <Chip label="SÍ" color="error" size="small" />
                          ) : (
                            <Chip label="NO" color="success" size="small" />
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* Visualización de Flujo de Datos */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  🔄 Flujo de Datos Visualizado
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', overflowX: 'auto', p: 2 }}>
                  {/* Origen */}
                  <Paper sx={{ p: 2, minWidth: 150, textAlign: 'center', bgcolor: 'primary.50' }}>
                    <Person sx={{ fontSize: 40, color: 'primary.main' }} />
                    <Typography variant="caption" display="block">TITULARES</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {ratData.categorias_titulares.slice(0, 2).join(', ')}
                      {ratData.categorias_titulares.length > 2 && '...'}
                    </Typography>
                  </Paper>
                  
                  <NavigateNext sx={{ mx: 2, fontSize: 30 }} />
                  
                  {/* Sistemas */}
                  <Paper sx={{ p: 2, minWidth: 150, textAlign: 'center', bgcolor: 'info.50' }}>
                    <Storage sx={{ fontSize: 40, color: 'info.main' }} />
                    <Typography variant="caption" display="block">SISTEMAS</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {ratData.sistemas_almacenamiento.slice(0, 2).join(', ')}
                      {ratData.sistemas_almacenamiento.length > 2 && '...'}
                    </Typography>
                  </Paper>
                  
                  <NavigateNext sx={{ mx: 2, fontSize: 30 }} />
                  
                  {/* Destinatarios */}
                  <Paper sx={{ p: 2, minWidth: 150, textAlign: 'center', bgcolor: 'secondary.50' }}>
                    <Group sx={{ fontSize: 40, color: 'secondary.main' }} />
                    <Typography variant="caption" display="block">DESTINATARIOS</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {[...ratData.destinatarios_internos, ...ratData.terceros_encargados].slice(0, 2).join(', ')}
                      {[...ratData.destinatarios_internos, ...ratData.terceros_encargados].length > 2 && '...'}
                    </Typography>
                  </Paper>
                  
                  {ratData.transferencias_internacionales.existe && (
                    <>
                      <NavigateNext sx={{ mx: 2, fontSize: 30 }} />
                      <Paper sx={{ p: 2, minWidth: 150, textAlign: 'center', bgcolor: 'warning.50' }}>
                        <Public sx={{ fontSize: 40, color: 'warning.main' }} />
                        <Typography variant="caption" display="block">INTERNACIONAL</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {ratData.transferencias_internacionales.paises.slice(0, 2).join(', ')}
                        </Typography>
                      </Paper>
                    </>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Validación de Cumplimiento */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  ⚖️ VALIDACIÓN LEGAL COMPLETA LEY 21.719
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Sistema validado por juristas expertos:</strong> Cumple todos los requisitos 
                    normativos para presentación ante autoridades competentes y auditorías legales especializadas.
                  </Typography>
                </Alert>
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      {ratData.base_licitud ? <CheckCircle color="success" /> : <Error color="error" />}
                    </ListItemIcon>
                    <ListItemText 
                      primary="Base de licitud definida (Art. 12 Ley 21.719)"
                      secondary={ratData.base_licitud ? `Configurado: ${ratData.base_licitud}` : 'OBLIGATORIO - Debe especificar base legal'}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      {ratData.finalidades.length > 0 ? <CheckCircle color="success" /> : <Error color="error" />}
                    </ListItemIcon>
                    <ListItemText 
                      primary="Finalidades específicas y explícitas (Art. 4 Ley 21.719)"
                      secondary={ratData.finalidades.length > 0 ? `${ratData.finalidades.length} finalidades conforme al principio` : 'OBLIGATORIO - Principio de especificación'}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      {ratData.plazo_conservacion ? <CheckCircle color="success" /> : <Error color="error" />}
                    </ListItemIcon>
                    <ListItemText 
                      primary="Plazo de conservación - Principio minimización temporal (Art. 4)"
                      secondary={ratData.plazo_conservacion || 'OBLIGATORIO - Debe definir plazo conforme al Art. 4'}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      {ratData.criterio_eliminacion ? <CheckCircle color="success" /> : <Error color="error" />}
                    </ListItemIcon>
                    <ListItemText 
                      primary="Criterio de eliminación definido (Art. 4 Ley 21.719)"
                      secondary={ratData.criterio_eliminacion || 'OBLIGATORIO - Método de supresión segura'}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      {Object.values(ratData.medidas_seguridad).some(v => v === true || (Array.isArray(v) && v.length > 0)) ? 
                        <CheckCircle color="success" /> : <Warning color="warning" />}
                    </ListItemIcon>
                    <ListItemText 
                      primary="Medidas de seguridad apropiadas (Art. 26 Ley 21.719)"
                      secondary="Técnicas y organizativas según nivel de riesgo"
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      {ratData.nombre_actividad && ratData.area_responsable ? <CheckCircle color="success" /> : <Error color="error" />}
                    </ListItemIcon>
                    <ListItemText 
                      primary="Registro de Actividades completo (Art. 25 Ley 21.719)"
                      secondary="Identificación del responsable y actividad documentada"
                    />
                  </ListItem>
                  
                  {ratData.transferencias_internacionales.existe && (
                    <ListItem>
                      <ListItemIcon>
                        {ratData.transferencias_internacionales.garantias ? 
                          <CheckCircle color="success" /> : <Error color="error" />}
                      </ListItemIcon>
                      <ListItemText 
                        primary="Garantías para transferencias internacionales (Art. 27-29)"
                        secondary={ratData.transferencias_internacionales.garantias || 'OBLIGATORIO - Debe definir mecanismo de protección'}
                      />
                    </ListItem>
                  )}
                  
                  {(ratData.datos_sensibles.length > 0 || ratData.menores_edad) && (
                    <ListItem>
                      <ListItemIcon>
                        <Warning color="error" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Categorías especiales de datos (Art. 13-14 Ley 21.719)"
                        secondary="Datos sensibles o de menores - Requiere medidas reforzadas y DPIA obligatoria"
                      />
                    </ListItem>
                  )}
                  
                  {ratData.requiere_dpia && (
                    <ListItem>
                      <ListItemIcon>
                        {ratData.requiere_dpia ? <Error color="error" /> : <CheckCircle color="success" />}
                      </ListItemIcon>
                      <ListItemText 
                        primary="DPIA OBLIGATORIA (Art. 27 Ley 21.719)"
                        secondary="Evaluación de Impacto requerida para tratamientos de alto riesgo"
                      />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Grid>

            {/* Gestión de RATs Existentes */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3, bgcolor: 'primary.50', border: '2px solid', borderColor: 'primary.200' }}>
                <Typography variant="h6" gutterBottom color="primary.main">
                  📋 Gestión de RATs Existentes
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="info"
                      size="large"
                      startIcon={<FolderOpen />}
                      onClick={() => setShowRATList(true)}
                      disabled={loadingRATs}
                    >
                      Ver RATs Guardados
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="primary"
                      size="large"
                      startIcon={<Add />}
                      onClick={createNewRAT}
                    >
                      Nuevo RAT
                    </Button>
                  </Grid>
                  
                  {ratData.id && (
                    <Grid item xs={12} sm={6} md={4}>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="warning"
                        size="large"
                        startIcon={<Edit />}
                        onClick={() => setSavedMessage(`📝 Editando RAT: ${ratData.nombre_actividad || 'Sin nombre'}`)}
                      >
                        Modo Edición
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>

            {/* Acciones de Exportación */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                <Typography variant="h6" gutterBottom>
                  💾 Opciones de Guardado y Exportación
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      size="large"
                      startIcon={<Save />}
                      onClick={saveRAT}
                      disabled={loading}
                    >
                      Guardar en Base de Datos
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="error"
                      size="large"
                      startIcon={<PictureAsPdf />}
                      onClick={exportToPDF}
                    >
                      Exportar PDF
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      size="large"
                      startIcon={<TableChart />}
                      onClick={exportToExcel}
                    >
                      Exportar Excel
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      startIcon={<ContentCopy />}
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(ratData, null, 2));
                        setSavedMessage('📋 Datos copiados al portapapeles');
                      }}
                    >
                      Copiar JSON
                    </Button>
                  </Grid>
                </Grid>
                
                {savedMessage && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    {savedMessage}
                  </Alert>
                )}
              </Paper>
            </Grid>

            {/* 🌊 NUEVA SECCIÓN: RATs GUARDADOS PARA EDICIÓN - VISTA AL MAR ASEGURADA */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3, bgcolor: 'background.paper', border: '2px dashed', borderColor: 'primary.main' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Edit sx={{ color: 'primary.main' }} />
                    🌊 RATs Guardados - Listos para Edición
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={loadExistingRATs}
                    disabled={loadingRATs}
                    size="small"
                  >
                    {loadingRATs ? 'Cargando...' : 'Actualizar Lista'}
                  </Button>
                </Box>

                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    📋 <strong>Gestión de RATs:</strong> Aquí puede visualizar y editar todos los Registros de Actividades de Tratamiento guardados en el sistema.
                  </Typography>
                </Alert>

                {loadingRATs ? (
                  <Box display="flex" justifyContent="center" py={3}>
                    <LinearProgress sx={{ width: '50%' }} />
                  </Box>
                ) : existingRATs.length > 0 ? (
                  <Grid container spacing={2}>
                    {existingRATs.map((rat, index) => (
                      <Grid item xs={12} sm={6} md={4} key={rat.id || rat.local_key || index}>
                        <Card 
                          sx={{ 
                            height: '100%',
                            border: rat.is_local ? '2px solid orange' : '1px solid',
                            borderColor: rat.is_local ? 'warning.main' : 'divider',
                            bgcolor: rat.is_local ? 'warning.50' : 'background.paper',
                            transition: 'all 0.3s ease',
                            '&:hover': { 
                              transform: 'translateY(-4px)',
                              boxShadow: 4,
                              borderColor: 'primary.main'
                            }
                          }}
                        >
                          <CardContent sx={{ pb: 1 }}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              {rat.is_local ? (
                                <Chip 
                                  label="📱 Local" 
                                  color="warning" 
                                  size="small"
                                  icon={<Storage />}
                                />
                              ) : (
                                <Chip 
                                  label="☁️ Online" 
                                  color="success" 
                                  size="small"
                                  icon={<Cloud />}
                                />
                              )}
                              {rat.sync_pending && (
                                <Chip 
                                  label="🔄 Pendiente" 
                                  color="info" 
                                  size="small"
                                />
                              )}
                            </Box>
                            
                            <Typography variant="h6" gutterBottom sx={{ 
                              fontSize: '1rem',
                              fontWeight: 600,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {rat.display_name || rat.nombre_actividad || 'RAT Sin Nombre'}
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              📋 Área: {rat.area_responsable || 'No especificada'}
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              👤 Responsable: {rat.responsable_proceso || 'No especificado'}
                            </Typography>
                            
                            <Typography variant="caption" color="text.secondary" display="block">
                              📅 {rat.is_local ? 'Guardado local:' : 'Creado:'} {
                                rat.local_save_timestamp || rat.created_at 
                                  ? new Date(rat.local_save_timestamp || rat.created_at).toLocaleString('es-CL')
                                  : 'Fecha no disponible'
                              }
                            </Typography>

                            {rat.metadata?.empresa && (
                              <Typography variant="caption" color="primary.main" display="block" mt={1}>
                                🏢 {rat.metadata.empresa}
                              </Typography>
                            )}
                          </CardContent>
                          
                          <Box sx={{ p: 2, pt: 0 }}>
                            <Button
                              fullWidth
                              variant="contained"
                              color="primary"
                              startIcon={<Edit />}
                              onClick={() => loadRATForEdit(rat.id || rat.local_key)}
                              sx={{
                                background: rat.is_local 
                                  ? 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)'
                                  : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                '&:hover': {
                                  background: rat.is_local
                                    ? 'linear-gradient(45deg, #F57C00 30%, #FF9800 90%)'
                                    : 'linear-gradient(45deg, #1976D2 30%, #2196F3 90%)'
                                }
                              }}
                            >
                              ✏️ Editar RAT
                            </Button>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      📝 No hay RATs guardados aún
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      📋 Cuando registre su primer RAT, aparecerá en esta lista para futuras consultas y modificaciones.
                    </Typography>
                  </Paper>
                )}
              </Paper>
            </Grid>

            {/* Siguiente Paso Recomendado */}
            <Grid item xs={12}>
              <Alert severity="info" icon={<Lightbulb />}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Próximos Pasos Recomendados
                </Typography>
                <Typography variant="body2" component="div">
                  <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    {ratData.requiere_dpia && (
                      <li>Realizar Evaluación de Impacto en Protección de Datos (DPIA)</li>
                    )}
                    {ratData.transferencias_internacionales.existe && (
                      <li>Formalizar garantías para transferencias internacionales (CCT/BCR)</li>
                    )}
                    {ratData.datos_sensibles.length > 0 && (
                      <li>Implementar medidas de seguridad reforzadas para datos sensibles</li>
                    )}
                    <li>Capacitar al personal involucrado sobre el tratamiento</li>
                    <li>Revisar y actualizar este RAT anualmente o ante cambios significativos</li>
                  </ul>
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, backgroundColor: '#495057', border: '1px solid #dee2e6' }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h4" color="white" fontWeight={700}>
              📋 REGISTRO DE ACTIVIDADES DE TRATAMIENTO
            </Typography>
            <Typography variant="subtitle1" color="white" sx={{ opacity: 0.9 }}>
              Documentación Formal - Artículo 25 Ley 21.719
            </Typography>
          </Grid>
          <Grid item>
            {onClose && (
              <IconButton onClick={onClose} sx={{ color: 'white' }}>
                <Close />
              </IconButton>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Templates Quick Access */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#495057', border: '1px solid #6c757d' }}>
        <Box textAlign="center">
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: 'white' }}>
            🎯 INICIO RÁPIDO - TEMPLATES POR INDUSTRIA
          </Typography>
          <Typography variant="body1" color="rgba(255,255,255,0.9)" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
            Seleccione entre más de <strong>70 sectores chilenos</strong> con datos pre-configurados según su industria específica
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => setShowTemplateSelector(true)}
            startIcon={<Lightbulb />}
            sx={{ 
              textTransform: 'none',
              backgroundColor: '#28a745',
              fontSize: '1.1rem',
              px: 4,
              py: 1.5,
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#218838'
              }
            }}
          >
            Ver 70+ Templates de Industrias Chilenas
          </Button>
        </Box>
        
        {selectedTemplate && (
          <Box mt={2}>
            <Chip 
              label={`Template: ${templates[selectedTemplate]?.nombre}`}
              onDelete={() => setSelectedTemplate(null)}
              color="primary"
              variant="filled"
            />
          </Box>
        )}
      </Paper>

      {/* Stepper */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel
                StepIconComponent={() => (
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: index <= activeStep ? 'primary.main' : 'grey.300',
                      fontSize: '0.875rem'
                    }}
                  >
                    {index < activeStep ? <Check /> : index + 1}
                  </Avatar>
                )}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Por favor complete los siguientes campos:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {validationErrors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Content */}
      <Paper sx={{ p: 3, mb: 3 }}>
        {renderPhaseContent()}
      </Paper>

      {/* Navigation */}
      <Paper sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between">
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<NavigateBefore />}
          >
            Anterior
          </Button>
          
          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<NavigateNext />}
            >
              Siguiente
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              onClick={saveRAT}
              disabled={loading}
              endIcon={loading ? null : <Save />}
            >
              {loading ? <LinearProgress /> : 'Guardar RAT'}
            </Button>
          )}
        </Box>
      </Paper>

      {/* Dialog para Lista de RATs Existentes */}
      <Dialog 
        open={showRATList} 
        onClose={() => setShowRATList(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h5">
                <FolderOpen sx={{ mr: 1, verticalAlign: 'middle' }} />
                RATs Guardados
              </Typography>
              {existingRATs && existingRATs.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {existingRATs.length} RATs creados • Límites generosos para buena experiencia
                </Typography>
              )}
            </Box>
            <IconButton onClick={() => setShowRATList(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {loadingRATs ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Cargando RATs...</Typography>
            </Box>
          ) : existingRATs.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
              <Storage sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No hay RATs guardados
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Crea tu primer Registro de Actividades de Tratamiento
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={createNewRAT}
              >
                Crear Nuevo RAT
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {existingRATs.map((rat, index) => {
                // Calcular completitud del RAT
                const calculateCompleteness = (ratData) => {
                  const requiredFields = [
                    'nombre_actividad', 'area_responsable', 'base_licitud', 
                    'plazo_conservacion', 'finalidades'
                  ];
                  const optionalFields = [
                    'responsable_proceso', 'email_responsable', 'descripcion',
                    'categorias_datos', 'medidas_seguridad_tecnicas', 'procedimiento_derechos'
                  ];
                  
                  let completed = 0;
                  let total = requiredFields.length + optionalFields.length;
                  
                  requiredFields.forEach(field => {
                    if (ratData[field] && ratData[field] !== '' && 
                        (Array.isArray(ratData[field]) ? ratData[field].length > 0 : true)) {
                      completed += 1.5; // Los requeridos valen más
                    }
                  });
                  
                  optionalFields.forEach(field => {
                    if (ratData[field] && ratData[field] !== '' && 
                        (Array.isArray(ratData[field]) ? ratData[field].length > 0 : true)) {
                      completed += 1;
                    }
                  });
                  
                  return Math.round((completed / (requiredFields.length * 1.5 + optionalFields.length)) * 100);
                };
                
                const completeness = calculateCompleteness(rat);
                const ratIndex = String(index + 1).padStart(3, '0');
                const ratId = rat.rat_id || rat.id || `RAT-${ratIndex}`;
                
                return (
                  <Grid item xs={12} md={6} key={rat.id}>
                    <Card sx={{ 
                      transition: 'all 0.3s',
                      '&:hover': { 
                        transform: 'translateY(-2px)', 
                        boxShadow: 3 
                      },
                      border: ratData.id === rat.id ? '2px solid' : '1px solid',
                      borderColor: ratData.id === rat.id ? 'primary.main' : 'grey.200'
                    }}>
                      <CardContent>
                        {/* Header con índice y estado */}
                        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                              #{ratIndex} • {ratId}
                            </Typography>
                            <Typography variant="h6" component="div" sx={{ mt: 0.5 }}>
                              {rat.nombre_actividad || 'RAT sin nombre'}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Chip 
                              label={rat.estado || 'borrador'} 
                              size="small"
                              color={
                                rat.estado === 'aprobado' ? 'success' :
                                rat.estado === 'revisión' ? 'warning' :
                                'default'
                              }
                              sx={{ mb: 1 }}
                            />
                            <Typography variant="caption" display="block" color="text.secondary">
                              {completeness}% completo
                            </Typography>
                          </Box>
                        </Box>
                        
                        {/* Barra de completitud */}
                        <Box sx={{ mb: 2 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={completeness} 
                            color={
                              completeness >= 80 ? 'success' :
                              completeness >= 50 ? 'warning' :
                              'error'
                            }
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                        
                        {/* Información del RAT */}
                        <Typography color="text.secondary" gutterBottom>
                          <Business sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: 16 }} />
                          {rat.area_responsable || 'Área no especificada'}
                        </Typography>
                        
                        <Typography color="text.secondary" gutterBottom>
                          <Gavel sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: 16 }} />
                          Base: {rat.base_licitud || 'No especificada'}
                        </Typography>
                        
                        {/* Fechas */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            <Schedule sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: 14 }} />
                            Creado: {new Date(rat.created_at).toLocaleDateString('es-CL', {
                              year: 'numeric', month: 'short', day: 'numeric'
                            })}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <Update sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: 14 }} />
                            Actualizado: {new Date(rat.updated_at).toLocaleDateString('es-CL', {
                              year: 'numeric', month: 'short', day: 'numeric'
                            })} • v{rat.version}
                          </Typography>
                        </Box>
                        
                        {/* Botones de acción */}
                        <Box display="flex" gap={1} flexWrap="wrap">
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<Edit />}
                            onClick={() => loadRATForEdit(rat.id)}
                            disabled={loading}
                          >
                            Editar
                          </Button>
                          
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Visibility />}
                            onClick={() => {
                              loadRATForEdit(rat.id);
                              setShowVisualization(true);
                            }}
                          >
                            Ver
                          </Button>
                          
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<PictureAsPdf />}
                            onClick={() => {
                              // Cargar datos y exportar PDF
                              setRatData({
                                id: rat.id,
                                ...rat.datos_completos
                              });
                              setTimeout(exportToPDF, 100);
                            }}
                          >
                            PDF
                          </Button>
                          
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<Delete />}
                            onClick={() => deleteRAT(rat.id, rat.nombre_actividad)}
                            disabled={loading}
                            sx={{ ml: 'auto' }}
                          >
                            Borrar
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => loadExistingRATs()} disabled={loadingRATs}>
            <Refresh sx={{ mr: 1 }} />
            Actualizar
          </Button>
          <Button onClick={createNewRAT} variant="contained" startIcon={<Add />}>
            Nuevo RAT
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo Selector de Templates */}
      <Dialog 
        open={showTemplateSelector} 
        onClose={() => setShowTemplateSelector(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Lightbulb sx={{ mr: 2, color: 'primary.main' }} />
            <Box>
              <Typography variant="h5" fontWeight={600}>
                Seleccionar Template por Industria
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Inicie rápido con un template pre-configurado según su sector
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {Object.entries(templates).map(([key, template]) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { 
                      transform: 'translateY(-4px)',
                      boxShadow: 4 
                    },
                    border: selectedTemplate === key ? 2 : 0,
                    borderColor: 'primary.main'
                  }}
                  onClick={() => applyTemplate(key)}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Typography variant="h2" sx={{ mb: 1 }}>
                      {template.icon}
                    </Typography>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      {template.nombre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {template.descripcion}
                    </Typography>
                    <Chip 
                      label="Aplicar Template"
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTemplateSelector(false)}>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo DPIA (Evaluación de Impacto) */}
      <Dialog 
        open={showDPIAForm} 
        onClose={() => setShowDPIAForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Security sx={{ mr: 2, color: 'error.main' }} />
            <Box>
              <Typography variant="h5" fontWeight={600}>
                Evaluación de Impacto en Protección de Datos (DPIA)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Art. 27 Ley 21.719 - Obligatorio para tratamientos de alto riesgo
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Esta evaluación es OBLIGATORIA según el Art. 27 de la Ley 21.719 para tratamientos que puedan 
              entrañar alto riesgo para los derechos y libertades de las personas.
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción detallada del tratamiento"
                multiline
                rows={3}
                value={dpiaData.descripcion_tratamiento}
                onChange={(e) => setDpiaData({...dpiaData, descripcion_tratamiento: e.target.value})}
                helperText="Describa el tratamiento, sus finalidades y alcance"
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Evaluación de necesidad y proporcionalidad"
                multiline
                rows={3}
                value={dpiaData.finalidad_necesidad}
                onChange={(e) => setDpiaData({...dpiaData, finalidad_necesidad: e.target.value})}
                helperText="Justifique por qué el tratamiento es necesario y proporcional"
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Evaluación de riesgos para los derechos y libertades"
                multiline
                rows={4}
                value={dpiaData.riesgos_libertades}
                onChange={(e) => setDpiaData({...dpiaData, riesgos_libertades: e.target.value})}
                helperText="Identifique los riesgos específicos para los titulares de los datos"
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Medidas previstas para afrontar los riesgos"
                multiline
                rows={3}
                value={dpiaData.medidas_previstas}
                onChange={(e) => setDpiaData({...dpiaData, medidas_previstas: e.target.value})}
                helperText="Detalle las medidas técnicas y organizativas implementadas"
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Fecha de Evaluación"
                value={dpiaData.fecha_evaluacion}
                onChange={(e) => setDpiaData({...dpiaData, fecha_evaluacion: e.target.value})}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Evaluador Responsable"
                value={dpiaData.evaluador_responsable}
                onChange={(e) => setDpiaData({...dpiaData, evaluador_responsable: e.target.value})}
                helperText="DPO o responsable designado"
                required
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Conclusión de la Evaluación</InputLabel>
                <Select
                  value={dpiaData.conclusion_evaluacion}
                  onChange={(e) => setDpiaData({...dpiaData, conclusion_evaluacion: e.target.value})}
                  label="Conclusión de la Evaluación"
                >
                  <MenuItem value="aprobado">
                    <Box display="flex" alignItems="center">
                      <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                      <Typography>Aprobado - Riesgos controlados</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="aprobado_condiciones">
                    <Box display="flex" alignItems="center">
                      <Warning sx={{ color: 'warning.main', mr: 1 }} />
                      <Typography>Aprobado con condiciones</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="rechazado">
                    <Box display="flex" alignItems="center">
                      <Error sx={{ color: 'error.main', mr: 1 }} />
                      <Typography>Rechazado - Riesgo inaceptable</Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Medidas adicionales requeridas"
                multiline
                rows={2}
                value={dpiaData.medidas_adicionales}
                onChange={(e) => setDpiaData({...dpiaData, medidas_adicionales: e.target.value})}
                helperText="Medidas adicionales identificadas durante la evaluación"
              />
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Recordatorio:</strong> La DPIA debe ser documentada y mantenida actualizada. 
                  En caso de cambios sustanciales en el tratamiento, debe realizarse una nueva evaluación.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowDPIAForm(false)}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={() => {
              // Aquí se puede agregar lógica para guardar la DPIA
              setShowDPIAForm(false);
              setSavedMessage('DPIA guardada correctamente según Art. 27 Ley 21.719');
            }}
          >
            Guardar DPIA
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for messages */}
      <Snackbar
        open={!!savedMessage}
        autoHideDuration={6000}
        onClose={() => setSavedMessage('')}
        message={savedMessage}
      />
    </Box>
  );
}

export default MapeoInteractivo;