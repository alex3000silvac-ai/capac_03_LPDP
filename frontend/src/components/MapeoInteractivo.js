import React, { useState, useEffect } from 'react';
import supabase, { supabaseWithTenant } from '../config/supabaseClient';
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
} from '@mui/material';
import {
  Business,
  AccountTree,
  Storage,
  Security,
  Schedule,
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
  Refresh,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabaseClient';
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
  const [existingRATs, setExistingRATs] = useState([]);
  const [showRATList, setShowRATList] = useState(false);
  const [loadingRATs, setLoadingRATs] = useState(false);
  
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
    
    // FASE 4: Plazos y Seguridad
    plazo_conservacion: '',
    criterio_eliminacion: '',
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
    
    // Metadata
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString(),
    version: '1.0',
    estado: 'borrador',
    tenant_id: user?.organizacion_id || 'demo',
    created_by: user?.id || 'demo_user'
  });

  // Templates predefinidos por industria
  const templates = {
    salmonera: {
      nombre: 'Industria Salmonera',
      icon: '🐟',
      data: {
        nombre_actividad: 'Monitoreo de Salud de Biomasa',
        area_responsable: 'Producción',
        finalidades: ['Optimización productiva', 'Cumplimiento sanitario', 'Bienestar animal'],
        base_licitud: 'interes_legitimo',
        categorias_titulares: ['Operarios', 'Veterinarios', 'Inspectores'],
        sistemas_almacenamiento: ['Sensores IoT', 'Software Acuicultura', 'ERP'],
        medidas_seguridad: {
          cifrado: true,
          control_acceso: true,
          logs_auditoria: true
        }
      }
    },
    retail: {
      nombre: 'Comercio Retail',
      icon: '🛍️',
      data: {
        nombre_actividad: 'Programa de Fidelización de Clientes',
        area_responsable: 'Marketing',
        finalidades: ['Marketing directo', 'Análisis de preferencias', 'Ofertas personalizadas'],
        base_licitud: 'consentimiento',
        categorias_titulares: ['Clientes', 'Prospectos'],
        sistemas_almacenamiento: ['CRM', 'Data Warehouse', 'App Móvil'],
        datos_sensibles: [],
        medidas_seguridad: {
          cifrado: true,
          seudonimizacion: true,
          control_acceso: true
        }
      }
    },
    salud: {
      nombre: 'Sector Salud',
      icon: '🏥',
      data: {
        nombre_actividad: 'Gestión de Historias Clínicas',
        area_responsable: 'Dirección Médica',
        finalidades: ['Atención médica', 'Continuidad asistencial', 'Investigación'],
        base_licitud: 'obligacion_legal',
        categorias_titulares: ['Pacientes', 'Beneficiarios'],
        datos_sensibles: ['Datos de salud', 'Datos genéticos'],
        sistemas_almacenamiento: ['Sistema HIS', 'PACS', 'Laboratorio'],
        medidas_seguridad: {
          cifrado: true,
          seudonimizacion: true,
          control_acceso: true,
          logs_auditoria: true,
          segregacion: true
        },
        requiere_dpia: true
      }
    },
    educacion: {
      nombre: 'Instituciones Educativas',
      icon: '🎓',
      data: {
        nombre_actividad: 'Gestión Académica de Estudiantes',
        area_responsable: 'Registro Académico',
        finalidades: ['Gestión educativa', 'Evaluación académica', 'Certificación'],
        base_licitud: 'contrato',
        categorias_titulares: ['Estudiantes', 'Apoderados', 'Docentes'],
        menores_edad: true,
        sistemas_almacenamiento: ['Sistema Académico', 'Plataforma LMS', 'Portal Web'],
        medidas_seguridad: {
          control_acceso: true,
          logs_auditoria: true,
          backup: true
        }
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

  // Aplicar template seleccionado
  const applyTemplate = (templateKey) => {
    const template = templates[templateKey];
    if (template) {
      setRatData(prev => ({
        ...prev,
        ...template.data,
        fecha_actualizacion: new Date().toISOString()
      }));
      setSelectedTemplate(templateKey);
      setSavedMessage(`Template "${template.nombre}" aplicado exitosamente`);
    }
  };

  // Validación por fase
  const validatePhase = (phase) => {
    const errors = [];
    
    switch(phase) {
      case 0: // Identificación
        if (!ratData.nombre_actividad) errors.push('El nombre de la actividad es obligatorio');
        if (!ratData.area_responsable) errors.push('El área responsable es obligatoria');
        if (ratData.finalidades.length === 0) errors.push('Debe especificar al menos una finalidad');
        if (!ratData.base_licitud) errors.push('La base de licitud es obligatoria');
        break;
      
      case 1: // Categorías
        if (ratData.categorias_titulares.length === 0) errors.push('Debe identificar las categorías de titulares');
        const hasCategoria = Object.values(ratData.categorias_datos).some(v => v === true || (typeof v === 'string' && v.length > 0));
        if (!hasCategoria) errors.push('Debe seleccionar al menos una categoría de datos');
        break;
      
      case 2: // Flujos
        if (ratData.sistemas_almacenamiento.length === 0) errors.push('Debe identificar los sistemas de almacenamiento');
        if (ratData.transferencias_internacionales.existe && ratData.transferencias_internacionales.paises.length === 0) {
          errors.push('Debe especificar los países de destino para las transferencias internacionales');
        }
        break;
      
      case 3: // Seguridad
        if (!ratData.plazo_conservacion) errors.push('El plazo de conservación es obligatorio');
        const hasSeguridad = Object.values(ratData.medidas_seguridad).some(v => v === true || (Array.isArray(v) && v.length > 0));
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

  // Guardar RAT directamente en Supabase con tenant obligatorio
  const saveRAT = async () => {
    setLoading(true);
    try {
      // Verificar tenant obligatorio
      const tenantId = user?.tenant_id || user?.organizacion_id;
      if (!tenantId || tenantId === 'demo') {
        throw new Error('Tenant ID es obligatorio. No se permite modo demo para grabación en producción.');
      }

      // Preparar datos con tenant obligatorio
      const dataToSave = {
        ...ratData,
        tenant_id: tenantId,
        user_id: user?.id || user?.email,
        created_by: user?.email || user?.username,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'active',
        metadata: {
          empresa: empresaInfo?.nombre || user?.organizacion_nombre,
          sector: empresaInfo?.sector,
          version: '3.0.0',
          ley: 'LPDP-21719'
        }
      };

      console.log('Guardando en Supabase con tenant:', tenantId, dataToSave);

      // Usar el helper con tenant para garantizar aislamiento
      const supabaseTenant = supabaseWithTenant(tenantId);
      
      let result;
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

      if (result.error) {
        throw result.error;
      }

      // Actualizar estado local con la respuesta
      setRatData(prev => ({ 
        ...prev, 
        id: result.data.id,
        ...result.data
      }));
      
      setSavedMessage(`✅ RAT ${ratData.id ? 'actualizado' : 'guardado'} exitosamente en Supabase (Tenant: ${tenantId})`);
      setShowVisualization(true);
      
      console.log('RAT guardado exitosamente en Supabase:', result.data);
      
      // Registrar actividad en log de auditoría
      await supabaseTenant
        .from('audit_log')
        .insert({
          tenant_id: tenantId,
          user_id: user?.id,
          action: ratData.id ? 'UPDATE_RAT' : 'CREATE_RAT',
          resource_type: 'mapeo_datos_rat',
          resource_id: result.data.id,
          metadata: { nombre_actividad: ratData.nombre_actividad },
          timestamp: new Date().toISOString()
        });
      
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
  const loadExistingRATs = async () => {
    setLoadingRATs(true);
    try {
      // Verificar tenant obligatorio
      const tenantId = user?.tenant_id || user?.organizacion_id;
      if (!tenantId || tenantId === 'demo') {
        throw new Error('Tenant ID es obligatorio para cargar datos.');
      }

      console.log('Cargando RATs de Supabase para tenant:', tenantId);

      // Usar helper con tenant para garantizar aislamiento
      const supabaseTenant = supabaseWithTenant(tenantId);
      
      const { data, error } = await supabaseTenant
        .from('mapeo_datos_rat')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setExistingRATs(data || []);
      console.log(`Cargados ${data?.length || 0} RATs del tenant ${tenantId}`);
      
    } catch (error) {
      console.error('Error cargando RATs de Supabase:', error);
      setSavedMessage(`❌ Error al cargar RATs: ${error.message}`);
    } finally {
      setLoadingRATs(false);
    }
  };

  // Cargar un RAT específico para edición desde Supabase
  const loadRATForEdit = async (ratId) => {
    setLoading(true);
    try {
      // Verificar tenant obligatorio
      const tenantId = user?.tenant_id || user?.organizacion_id;
      if (!tenantId || tenantId === 'demo') {
        throw new Error('Tenant ID es obligatorio para editar datos.');
      }

      console.log('Cargando RAT para edición desde Supabase:', ratId);

      // Usar helper con tenant
      const supabaseTenant = supabaseWithTenant(tenantId);
      
      const { data, error } = await supabaseTenant
        .from('mapeo_datos_rat')
        .select('*')
        .eq('id', ratId)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('RAT no encontrado');
      }
      
      // Cargar los datos en el estado
      setRatData(data);
      setActiveStep(0);
      setShowRATList(false);
      setSavedMessage(`✅ RAT "${data.nombre_actividad}" cargado para edición desde Supabase`);
      
      console.log('RAT cargado para edición:', data);
      
      // Registrar en auditoría
      await supabaseTenant
        .from('audit_log')
        .insert({
          tenant_id: tenantId,
          user_id: user?.id,
          action: 'VIEW_RAT',
          resource_type: 'mapeo_datos_rat',
          resource_id: ratId,
          metadata: { nombre_actividad: data.nombre_actividad },
          timestamp: new Date().toISOString()
        });
      
    } catch (error) {
      console.error('Error cargando RAT de Supabase:', error);
      setSavedMessage(`❌ Error al cargar RAT: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo RAT
  const createNewRAT = () => {
    setRatData({
      // FASE 1: Identificación
      nombre_actividad: '',
      area_responsable: '',
      responsable_tratamiento: '',
      dpo_contacto: '',
      
      // FASE 2: Base jurídica
      base_licitud: '',
      base_licitud_detalle: '',
      
      // FASE 3: Categorías de datos
      categorias_datos: {
        identificacion: [],
        contacto: [],
        demograficos: [],
        economicos: [],
        educacion: [],
        salud: [],
        sensibles: []
      },
      
      // FASE 4: Finalidad y destinatarios
      finalidad: '',
      finalidad_detallada: '',
      origen_datos: [],
      destinatarios: [],
      destinatarios_internos: [],
      destinatarios_externos: [],
      
      transferencias_internacionales: {
        existe: false,
        paises: [],
        garantias: '',
        empresa_receptora: ''
      },
      
      // FASE 5: Seguridad y conservación
      tiempo_conservacion: '',
      criterios_supresion: '',
      medidas_seguridad: {
        tecnicas: [],
        organizativas: []
      },
      nivel_riesgo: 'medio',
      evaluacion_riesgos: '',
      medidas_mitigacion: [],
      derechos_ejercidos: [],
      procedimiento_derechos: '',
      
      // Metadata
      version: '1.0',
      estado: 'borrador',
      observaciones: ''
    });
    
    setActiveStep(0);
    setShowRATList(false);
    setSavedMessage('');
    setShowVisualization(false);
  };

  // Efecto para cargar RATs al abrir
  useEffect(() => {
    if (showRATList) {
      loadExistingRATs();
    }
  }, [showRATList]);

  // Exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text('Registro de Actividades de Tratamiento (RAT)', 20, 20);
    
    // Información de la empresa
    doc.setFontSize(12);
    doc.text(`Empresa: ${empresaInfo?.nombre || 'Demo Company'}`, 20, 35);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, 20, 42);
    doc.text(`Versión: ${ratData.version}`, 20, 49);
    
    // Línea divisoria
    doc.line(20, 55, 190, 55);
    
    // Sección 1: Identificación
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('1. IDENTIFICACIÓN DE LA ACTIVIDAD', 20, 65);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    
    let yPos = 75;
    doc.text(`Nombre: ${ratData.nombre_actividad}`, 25, yPos);
    yPos += 7;
    doc.text(`Área Responsable: ${ratData.area_responsable}`, 25, yPos);
    yPos += 7;
    doc.text(`Responsable: ${ratData.responsable_proceso}`, 25, yPos);
    yPos += 7;
    doc.text(`Base de Licitud: ${ratData.base_licitud}`, 25, yPos);
    yPos += 7;
    doc.text(`Finalidades: ${ratData.finalidades.join(', ')}`, 25, yPos);
    
    // Sección 2: Categorías de Datos
    yPos += 15;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('2. CATEGORÍAS DE DATOS', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    
    yPos += 10;
    doc.text(`Categorías de Titulares: ${ratData.categorias_titulares.join(', ')}`, 25, yPos);
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
    doc.text(`Sistemas: ${ratData.sistemas_almacenamiento.join(', ')}`, 25, yPos);
    
    if (ratData.destinatarios_internos.length > 0) {
      yPos += 7;
      doc.text(`Destinatarios Internos: ${ratData.destinatarios_internos.join(', ')}`, 25, yPos);
    }
    
    if (ratData.terceros_encargados.length > 0) {
      yPos += 7;
      doc.text(`Encargados: ${ratData.terceros_encargados.join(', ')}`, 25, yPos);
    }
    
    if (ratData.transferencias_internacionales.existe) {
      yPos += 7;
      doc.text(`Transferencias Internacionales: ${ratData.transferencias_internacionales.paises.join(', ')}`, 25, yPos);
      yPos += 7;
      doc.text(`Garantías: ${ratData.transferencias_internacionales.garantias}`, 25, yPos);
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
    if (ratData.medidas_seguridad.cifrado) medidasActivas.push('Cifrado');
    if (ratData.medidas_seguridad.seudonimizacion) medidasActivas.push('Seudonimización');
    if (ratData.medidas_seguridad.control_acceso) medidasActivas.push('Control de Acceso');
    if (ratData.medidas_seguridad.logs_auditoria) medidasActivas.push('Logs de Auditoría');
    if (ratData.medidas_seguridad.backup) medidasActivas.push('Backup');
    if (ratData.medidas_seguridad.segregacion) medidasActivas.push('Segregación de Datos');
    
    medidasActivas.forEach(medida => {
      doc.text(`• ${medida}`, 30, yPos);
      yPos += 6;
    });
    
    // Firma y validación
    yPos += 15;
    doc.line(20, yPos, 190, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.text('Este documento ha sido generado automáticamente por el Sistema LPDP', 20, yPos);
    yPos += 5;
    doc.text('Cumple con los requisitos de la Ley 21.719 de Protección de Datos Personales de Chile', 20, yPos);
    
    // Guardar el PDF
    doc.save(`RAT_${ratData.nombre_actividad.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    setSavedMessage('📄 PDF exportado exitosamente');
  };

  // Exportar a Excel
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Hoja 1: Información General
    const wsData = [
      ['REGISTRO DE ACTIVIDADES DE TRATAMIENTO (RAT)'],
      [],
      ['Campo', 'Valor'],
      ['Nombre de la Actividad', ratData.nombre_actividad],
      ['Área Responsable', ratData.area_responsable],
      ['Responsable del Proceso', ratData.responsable_proceso],
      ['Email', ratData.email_responsable],
      ['Base de Licitud', ratData.base_licitud],
      ['Justificación', ratData.justificacion_base],
      ['Finalidades', ratData.finalidades.join(', ')],
      [],
      ['CATEGORÍAS DE DATOS'],
      ['Titulares', ratData.categorias_titulares.join(', ')],
      ['Datos Sensibles', ratData.datos_sensibles.join(', ')],
      ['Incluye Menores', ratData.menores_edad ? 'Sí' : 'No'],
      ['Volumen de Registros', ratData.volumen_registros],
      [],
      ['FLUJOS Y DESTINATARIOS'],
      ['Sistemas', ratData.sistemas_almacenamiento.join(', ')],
      ['Destinatarios Internos', ratData.destinatarios_internos.join(', ')],
      ['Terceros Encargados', ratData.terceros_encargados.join(', ')],
      ['Terceros Cesionarios', ratData.terceros_cesionarios.join(', ')],
      [],
      ['TRANSFERENCIAS INTERNACIONALES'],
      ['Existe Transferencia', ratData.transferencias_internacionales.existe ? 'Sí' : 'No'],
      ['Países', ratData.transferencias_internacionales.paises.join(', ')],
      ['Garantías', ratData.transferencias_internacionales.garantias],
      [],
      ['SEGURIDAD Y PLAZOS'],
      ['Plazo de Conservación', ratData.plazo_conservacion],
      ['Criterio de Eliminación', ratData.criterio_eliminacion],
      ['Nivel de Riesgo', ratData.nivel_riesgo],
      ['Requiere DPIA', ratData.requiere_dpia ? 'Sí' : 'No'],
      [],
      ['INFORMACIÓN DEL REGISTRO'],
      ['Fecha de Creación', new Date(ratData.fecha_creacion).toLocaleDateString('es-CL')],
      ['Última Actualización', new Date(ratData.fecha_actualizacion).toLocaleDateString('es-CL')],
      ['Versión', ratData.version],
      ['Estado', ratData.estado]
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
    
    Object.entries(ratData.categorias_datos).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        wsData2.push([key, value ? 'Sí' : 'No', '']);
      } else if (typeof value === 'string' && value) {
        wsData2.push([key, 'Sí', value]);
      }
    });
    
    const ws2 = XLSX.utils.aoa_to_sheet(wsData2);
    ws2['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, ws2, 'Categorías');
    
    // Hoja 3: Medidas de Seguridad
    const wsData3 = [
      ['MEDIDAS DE SEGURIDAD'],
      [],
      ['Medida', 'Implementada'],
      ['Cifrado', ratData.medidas_seguridad.cifrado ? 'Sí' : 'No'],
      ['Seudonimización', ratData.medidas_seguridad.seudonimizacion ? 'Sí' : 'No'],
      ['Control de Acceso', ratData.medidas_seguridad.control_acceso ? 'Sí' : 'No'],
      ['Logs de Auditoría', ratData.medidas_seguridad.logs_auditoria ? 'Sí' : 'No'],
      ['Backup', ratData.medidas_seguridad.backup ? 'Sí' : 'No'],
      ['Segregación', ratData.medidas_seguridad.segregacion ? 'Sí' : 'No'],
      [],
      ['MEDIDAS TÉCNICAS ADICIONALES'],
      ...ratData.medidas_seguridad.tecnicas.map(m => [m, 'Sí']),
      [],
      ['MEDIDAS ORGANIZATIVAS'],
      ...ratData.medidas_seguridad.organizativas.map(m => [m, 'Sí'])
    ];
    
    const ws3 = XLSX.utils.aoa_to_sheet(wsData3);
    ws3['!cols'] = [{ wch: 30 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws3, 'Seguridad');
    
    // Guardar el archivo
    XLSX.writeFile(wb, `RAT_${ratData.nombre_actividad.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
    setSavedMessage('📊 Excel exportado exitosamente');
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
                label="Email del Responsable"
                type="email"
                value={ratData.email_responsable}
                onChange={(e) => setRatData({...ratData, email_responsable: e.target.value})}
                helperText="Correo electrónico para notificaciones"
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
                        checked={ratData.finalidades.includes(finalidad)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRatData({...ratData, finalidades: [...ratData.finalidades, finalidad]});
                          } else {
                            setRatData({...ratData, finalidades: ratData.finalidades.filter(f => f !== finalidad)});
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
                      <Typography variant="caption">Proteger intereses vitales del titular</Typography>
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
                value={ratData.categorias_titulares}
                onChange={(e, newValue) => setRatData({...ratData, categorias_titulares: newValue})}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
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
                              if (e.target.checked && !ratData.datos_sensibles.includes('Salud')) {
                                setRatData(prev => ({
                                  ...prev,
                                  datos_sensibles: [...prev.datos_sensibles, 'Salud']
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
                              if (e.target.checked && !ratData.datos_sensibles.includes('Biométricos')) {
                                setRatData(prev => ({
                                  ...prev,
                                  datos_sensibles: [...prev.datos_sensibles, 'Biométricos']
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
                              if (e.target.checked && !ratData.datos_sensibles.includes('Genéticos')) {
                                setRatData(prev => ({
                                  ...prev,
                                  datos_sensibles: [...prev.datos_sensibles, 'Genéticos']
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
                              if (e.target.checked && !ratData.datos_sensibles.includes('Socioeconómicos')) {
                                setRatData(prev => ({
                                  ...prev,
                                  datos_sensibles: [...prev.datos_sensibles, 'Socioeconómicos']
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
                  value={ratData.datos_sensibles.filter(d => !['Salud', 'Biométricos', 'Genéticos', 'Socioeconómicos'].includes(d))}
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

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Volumen estimado de registros"
                value={ratData.volumen_registros}
                onChange={(e) => setRatData({...ratData, volumen_registros: e.target.value})}
                helperText="Ej: 1000-5000 registros, >10000 registros"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Frecuencia de actualización</InputLabel>
                <Select
                  value={ratData.frecuencia_actualizacion}
                  onChange={(e) => setRatData({...ratData, frecuencia_actualizacion: e.target.value})}
                  label="Frecuencia de actualización"
                >
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
                value={ratData.sistemas_almacenamiento}
                onChange={(e, newValue) => setRatData({...ratData, sistemas_almacenamiento: newValue})}
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
                value={ratData.destinatarios_internos}
                onChange={(e, newValue) => setRatData({...ratData, destinatarios_internos: newValue})}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
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
                value={ratData.terceros_encargados}
                onChange={(e, newValue) => setRatData({...ratData, terceros_encargados: newValue})}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
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
                  'Entidades bancarias',
                  'Compañías de seguro',
                  'Organismos públicos',
                  'SERNAPESCA',
                  'SII',
                  'Dirección del Trabajo',
                  'Previred',
                  'Mutual de Seguridad',
                  'Universidades',
                  'Centros de investigación'
                ]}
                value={ratData.terceros_cesionarios}
                onChange={(e, newValue) => setRatData({...ratData, terceros_cesionarios: newValue})}
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
                        value={ratData.transferencias_internacionales.paises}
                        onChange={(e, newValue) => setRatData({
                          ...ratData,
                          transferencias_internacionales: {
                            ...ratData.transferencias_internacionales,
                            paises: newValue
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
              <TextField
                fullWidth
                required
                label="Plazo de Conservación"
                value={ratData.plazo_conservacion}
                onChange={(e) => setRatData({...ratData, plazo_conservacion: e.target.value})}
                helperText="Ej: 5 años desde el término del contrato, 6 años por obligación tributaria"
                InputProps={{
                  startAdornment: <Timer sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Criterio de Eliminación"
                value={ratData.criterio_eliminacion}
                onChange={(e) => setRatData({...ratData, criterio_eliminacion: e.target.value})}
                helperText="¿Cómo se eliminarán o anonimizarán los datos?"
              />
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
                  value={ratData.medidas_seguridad.tecnicas}
                  onChange={(e, newValue) => setRatData({
                    ...ratData,
                    medidas_seguridad: {...ratData.medidas_seguridad, tecnicas: newValue}
                  })}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
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
                value={ratData.medidas_seguridad.organizativas}
                onChange={(e, newValue) => setRatData({
                  ...ratData,
                  medidas_seguridad: {...ratData.medidas_seguridad, organizativas: newValue}
                })}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
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
                  value={ratData.riesgos_identificados}
                  onChange={(e, newValue) => setRatData({...ratData, riesgos_identificados: newValue})}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
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
                      onChange={(e) => setRatData({...ratData, requiere_dpia: e.target.checked})}
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
                        <TableCell>{ratData.categorias_titulares.join(', ')}</TableCell>
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
                              label={`Sí - ${ratData.transferencias_internacionales.paises.join(', ')}`} 
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
                  ✅ Validación de Cumplimiento Ley 21.719
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      {ratData.base_licitud ? <CheckCircle color="success" /> : <Error color="error" />}
                    </ListItemIcon>
                    <ListItemText 
                      primary="Base de licitud definida (Art. 12)"
                      secondary={ratData.base_licitud ? `Configurado: ${ratData.base_licitud}` : 'Pendiente'}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      {ratData.finalidades.length > 0 ? <CheckCircle color="success" /> : <Error color="error" />}
                    </ListItemIcon>
                    <ListItemText 
                      primary="Finalidades especificadas (Art. 4)"
                      secondary={ratData.finalidades.length > 0 ? `${ratData.finalidades.length} finalidades definidas` : 'Pendiente'}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      {ratData.plazo_conservacion ? <CheckCircle color="success" /> : <Error color="error" />}
                    </ListItemIcon>
                    <ListItemText 
                      primary="Plazo de conservación establecido (Art. 4)"
                      secondary={ratData.plazo_conservacion || 'Pendiente'}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      {Object.values(ratData.medidas_seguridad).some(v => v === true || (Array.isArray(v) && v.length > 0)) ? 
                        <CheckCircle color="success" /> : <Warning color="warning" />}
                    </ListItemIcon>
                    <ListItemText 
                      primary="Medidas de seguridad implementadas (Art. 26)"
                      secondary="Técnicas y organizativas documentadas"
                    />
                  </ListItem>
                  
                  {ratData.transferencias_internacionales.existe && (
                    <ListItem>
                      <ListItemIcon>
                        {ratData.transferencias_internacionales.garantias ? 
                          <CheckCircle color="success" /> : <Error color="error" />}
                      </ListItemIcon>
                      <ListItemText 
                        primary="Garantías para transferencias internacionales (Art. 27)"
                        secondary={ratData.transferencias_internacionales.garantias || 'Pendiente'}
                      />
                    </ListItem>
                  )}
                  
                  {(ratData.datos_sensibles.length > 0 || ratData.menores_edad) && (
                    <ListItem>
                      <ListItemIcon>
                        <Warning color="warning" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Tratamiento de categorías especiales"
                        secondary="Requiere medidas reforzadas y posible DPIA"
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
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h4" color="white" fontWeight={600}>
              🏗️ Constructor RAT Profesional
            </Typography>
            <Typography variant="subtitle1" color="white" sx={{ opacity: 0.9 }}>
              Sistema de Mapeo de Datos - Ley 21.719 Chile
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
            <Typography variant="h5">
              <FolderOpen sx={{ mr: 1, verticalAlign: 'middle' }} />
              RATs Guardados
            </Typography>
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
              {existingRATs.map((rat) => (
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
                      <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                          {rat.nombre_actividad || 'RAT sin nombre'}
                        </Typography>
                        <Chip 
                          label={rat.estado || 'borrador'} 
                          size="small"
                          color={
                            rat.estado === 'aprobado' ? 'success' :
                            rat.estado === 'revisión' ? 'warning' :
                            'default'
                          }
                        />
                      </Box>
                      
                      <Typography color="text.secondary" gutterBottom>
                        <Business sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: 16 }} />
                        {rat.area_responsable || 'Área no especificada'}
                      </Typography>
                      
                      <Typography color="text.secondary" gutterBottom>
                        <Gavel sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: 16 }} />
                        Base: {rat.base_licitud || 'No especificada'}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Actualizado: {new Date(rat.updated_at).toLocaleDateString('es-CL')} • v{rat.version}
                      </Typography>
                      
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
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
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