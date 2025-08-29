import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle,
  Avatar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Tooltip,
  Switch,
  RadioGroup,
  Radio,
  Autocomplete,
  Snackbar,
  Badge,
  Stack
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  NavigateBefore,
  NavigateNext,
  School,
  Security,
  Assessment,
  BusinessCenter,
  Timeline,
  People,
  AttachMoney,
  Engineering,
  LocalShipping,
  Gavel,
  Computer,
  Construction,
  Lightbulb,
  RocketLaunch,
  DataObject,
  Science,
  Business,
  Campaign,
  Storage,
  CheckCircle,
  Warning,
  Error,
  Info,
  Help,
  Save,
  Schedule,
  Download,
  Upload,
  Edit,
  Delete,
  Add,
  Remove,
  Visibility,
  ExpandMore,
  AccountTree,
  Map as MapIcon,
  LocationOn,
  Public,
  Timer,
  Assignment,
  Build,
  HealthAndSafety,
  MonetizationOn,
  Lock,
  VpnKey,
  Group,
  ChildCare,
  Fingerprint,
  CloudUpload,
  Verified,
  Policy,
  TrendingUp,
  Analytics,
  FileCopy,
  GetApp
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import { COLORS, rgba } from '../theme/colors';
import { INDUSTRY_TEMPLATES } from '../data/industryTemplates';
import { downloadExcelTemplate, exportRATToExcel } from '../utils/excelTemplates';
import jsPDF from 'jspdf';
import { ratService } from '../services/ratService';

const RATProduccion = () => {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  
  // Función para obtener estado inicial del RAT
  const getInitialRatData = () => ({
    responsable: {
      nombre: '',
      email: '',
      telefono: '',
      representanteLegal: {
        esExtranjero: false,
        nombre: '',
        email: '',
        telefono: ''
      }
    },
    finalidades: {
      descripcion: '',
      baseLegal: '',
      esConsentimiento: false,
      derechoRetiro: ''
    },
    categorias: {
      titulares: [],
      datosPersonales: {
        identificacion: false,
        contacto: false,
        laborales: false,
        academicos: false,
        financieros: false,
        socieconomicos: false,
        salud: false,
        biometricos: false,
        geneticos: false,
        ideologia: false,
        menores: false,
        otros: []
      }
    },
    transferencias: {
      existe: false,
      destinos: [],
      garantias: ''
    },
    fuente: {
      tipo: '',
      descripcion: '',
      esFuentePublica: false
    },
    conservacion: {
      periodo: '',
      criterio: '',
      justificacion: ''
    },
    seguridad: {
      tecnicas: [],
      organizativas: [],
      descripcionGeneral: ''
    },
    automatizadas: {
      existe: false,
      logica: '',
      consecuencias: '',
      fuentesDatos: []
    }
  });
  
  // Estados principales
  const [activeStep, setActiveStep] = useState(0);
  const [editingProcess, setEditingProcess] = useState(null);
  const [processEditData, setProcessEditData] = useState({});
  const [ratData, setRatData] = useState(() => {
    const initialData = getInitialRatData();
    // Personalizar con datos del tenant si están disponibles
    initialData.responsable.nombre = currentTenant?.company_name || '';
    initialData.responsable.email = currentTenant?.contact_email || '';
    return initialData;
  });
  
  // Estados de UI
  const [isNarrating, setIsNarrating] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [currentHelp, setCurrentHelp] = useState('');
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [industryTemplate, setIndustryTemplate] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados para generación completa de RAT por industria
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedProcess, setSelectedProcess] = useState('');
  const [allProcesses, setAllProcesses] = useState([]);
  const [currentProcessIndex, setCurrentProcessIndex] = useState(0);
  const [completedProcesses, setCompletedProcesses] = useState(new Set());
  const [showIndustryWizard, setShowIndustryWizard] = useState(false);
  const [industryProgress, setIndustryProgress] = useState({ total: 0, completed: 0, percentage: 0 });
  const [showProgressManager, setShowProgressManager] = useState(false);
  
  const utteranceRef = useRef(null);

  // Templates por industria (heredados del SandboxCompleto)
  const industryTemplates = {
    retail: {
      nombre: 'Retail y E-commerce',
      icono: '🛍️',
      descripcion: 'Para tiendas, e-commerce y retail tradicional',
      finalidades: [
        'Gestión de clientes y ventas',
        'Procesamiento de pagos',
        'Marketing y comunicaciones',
        'Programa de fidelización'
      ],
      datosComunes: ['identificacion', 'contacto', 'financieros'],
      medidasSeguridad: [
        'Cifrado de datos de pago',
        'Sistemas POS seguros',
        'Protección de bases de datos de clientes'
      ]
    },
    salud: {
      nombre: 'Sector Salud',
      icono: '🏥',
      descripcion: 'Clínicas, hospitales y centros médicos',
      finalidades: [
        'Atención médica',
        'Historia clínica',
        'Facturación de servicios',
        'Seguimiento de tratamientos'
      ],
      datosComunes: ['identificacion', 'contacto', 'salud', 'sensibles'],
      medidasSeguridad: [
        'Cifrado de historias clínicas',
        'Control de acceso por roles médicos',
        'Respaldo seguro de información médica',
        'Anonimización para estadísticas'
      ]
    },
    educacion: {
      nombre: 'Educación',
      icono: '🎓',
      descripcion: 'Colegios, universidades e institutos',
      finalidades: [
        'Gestión académica',
        'Registro de estudiantes',
        'Comunicación con apoderados',
        'Evaluación y notas'
      ],
      datosComunes: ['identificacion', 'contacto', 'academicos', 'menores'],
      medidasSeguridad: [
        'Protección especial de datos de menores',
        'Sistema de notas seguro',
        'Control de acceso para profesores'
      ]
    },
    manufactura: {
      nombre: 'Manufactura',
      icono: '🏭',
      descripcion: 'Industrias manufactureras y producción',
      finalidades: [
        'Gestión de recursos humanos',
        'Control de calidad',
        'Seguridad industrial',
        'Relación con proveedores'
      ],
      datosComunes: ['identificacion', 'contacto', 'laborales'],
      medidasSeguridad: [
        'Sistema de control de acceso industrial',
        'Monitoreo de seguridad',
        'Gestión de incidentes'
      ]
    },
    mineria: {
      nombre: 'Minería',
      icono: '⛏️',
      descripcion: 'Minería del cobre, oro, litio y otros minerales',
      finalidades: [
        'Gestión de trabajadores',
        'Seguridad en faenas',
        'Control ambiental',
        'Relación con comunidades'
      ],
      datosComunes: ['identificacion', 'contacto', 'laborales', 'salud'],
      medidasSeguridad: [
        'Sistemas de seguridad en faenas remotas',
        'Monitoreo de salud ocupacional',
        'Comunicaciones seguras en terreno'
      ]
    },
    construccion: {
      nombre: 'Construcción',
      icono: '🏗️',
      descripcion: 'Empresas constructoras e inmobiliarias',
      finalidades: [
        'Gestión de proyectos',
        'Seguridad en obras',
        'Relación con clientes',
        'Certificaciones técnicas'
      ],
      datosComunes: ['identificacion', 'contacto', 'laborales'],
      medidasSeguridad: [
        'Control de acceso en obras',
        'Documentación técnica segura',
        'Sistema de certificaciones'
      ]
    }
  };

  // Steps del wizard didáctico
  const steps = [
    {
      label: 'Identificación del Responsable',
      description: 'Datos de la empresa y representante legal',
      icon: <Business />,
      help: 'Identifica quién es el responsable del tratamiento de datos y, si es una empresa extranjera, su representante en Chile.'
    },
    {
      label: 'Finalidades del Tratamiento',
      description: 'Para qué se usan los datos y base legal',
      icon: <Gavel />,
      help: 'Define claramente para qué fines específicos y legítimos tratarás los datos personales.'
    },
    {
      label: 'Categorías de Datos',
      description: 'Tipos de personas y datos que se procesan',
      icon: <People />,
      help: 'Especifica qué categorías de personas y qué tipos de datos personales tratará tu organización.'
    },
    {
      label: 'Transferencias Internacionales',
      description: 'Envío de datos fuera de Chile',
      icon: <Public />,
      help: 'Si envías datos a otros países, documenta el destino y las garantías de protección.'
    },
    {
      label: 'Fuente de los Datos',
      description: 'De dónde provienen los datos',
      icon: <Storage />,
      help: 'Indica cómo obtuviste los datos: directamente de la persona, de terceros o fuentes públicas.'
    },
    {
      label: 'Períodos de Conservación',
      description: 'Cuánto tiempo guardarás los datos',
      icon: <Timer />,
      help: 'Define por cuánto tiempo conservarás los datos y cuándo los eliminarás de forma segura.'
    },
    {
      label: 'Medidas de Seguridad',
      description: 'Cómo proteges los datos',
      icon: <Security />,
      help: 'Describe las medidas técnicas y organizativas que implementas para proteger los datos.'
    },
    {
      label: 'Decisiones Automatizadas',
      description: 'Uso de algoritmos o IA',
      icon: <Computer />,
      help: 'Si usas sistemas automatizados para tomar decisiones, explica cómo funcionan y sus consecuencias.'
    }
  ];

  // Bases legales según Ley 21.719 con fundamentos jurídicos
  const basesLegales = [
    { 
      value: 'consentimiento', 
      label: 'Consentimiento del titular',
      fundamento: 'Art. 4 letra a) Ley 21.719',
      descripcion: 'El titular ha otorgado su consentimiento libre, específico, informado e inequívoco'
    },
    { 
      value: 'contrato', 
      label: 'Ejecución de un contrato',
      fundamento: 'Art. 4 letra b) Ley 21.719',
      descripcion: 'Necesario para la ejecución de un contrato del que el titular es parte'
    },
    { 
      value: 'obligacion_legal', 
      label: 'Obligación legal',
      fundamento: 'Art. 4 letra c) Ley 21.719',
      descripcion: 'Necesario para el cumplimiento de una obligación legal aplicable al responsable'
    },
    { 
      value: 'interes_vital', 
      label: 'Interés vital del titular',
      fundamento: 'Art. 4 letra d) Ley 21.719',
      descripcion: 'Necesario para proteger los intereses vitales del titular o de otra persona'
    },
    { 
      value: 'tarea_publica', 
      label: 'Tarea de interés público',
      fundamento: 'Art. 4 letra e) Ley 21.719',
      descripcion: 'Necesario para el desempeño de una tarea de interés público o ejercicio de la autoridad pública'
    },
    { 
      value: 'interes_legitimo', 
      label: 'Interés legítimo',
      fundamento: 'Art. 4 letra f) Ley 21.719',
      descripcion: 'Necesario para la satisfacción de intereses legítimos del responsable, siempre que no prevalezcan los derechos del titular'
    }
  ];

  // Categorías de titulares predefinidas
  const categoriasTitulares = [
    'Empleados',
    'Candidatos a empleo',
    'Clientes',
    'Proveedores',
    'Estudiantes',
    'Pacientes',
    'Usuarios web',
    'Suscriptores',
    'Contactos comerciales',
    'Menores de edad'
  ];

  // Medidas de seguridad técnicas
  const medidasTecnicas = [
    'Cifrado de datos',
    'Control de acceso',
    'Firewalls',
    'Antivirus',
    'Respaldos seguros',
    'Monitoreo de seguridad',
    'Autenticación multifactor',
    'Red privada virtual (VPN)'
  ];

  // Medidas de seguridad organizativas
  const medidasOrganizativas = [
    'Políticas de seguridad',
    'Capacitación del personal',
    'Contratos de confidencialidad',
    'Procedimientos de incidentes',
    'Auditorías internas',
    'Designación de responsables',
    'Control de acceso físico',
    'Destrucción segura de documentos'
  ];

  useEffect(() => {
    // Cargar procesos de industria seleccionada
    if (selectedIndustry && INDUSTRY_TEMPLATES[selectedIndustry]) {
      const industry = INDUSTRY_TEMPLATES[selectedIndustry];
      const allProcessesList = Object.entries(industry.procesos).map(([key, proceso]) => ({
        key,
        ...proceso,
        isActive: ratService.isProcessActive(selectedIndustry, key),
        isCompleted: ratService.isProcessCompleted(selectedIndustry, key)
      }));
      
      // CAMBIO IMPORTANTE: Mostrar TODOS los procesos (activos e inactivos)
      // Los inactivos se mostrarán con estilo diferente
      setAllProcesses(allProcessesList);
      setCurrentProcessIndex(0);
      
      // Actualizar progreso
      const progress = ratService.getIndustryProgress(selectedIndustry, allProcessesList.length);
      setIndustryProgress(progress);
      
      // Marcar completados
      const completed = new Set(Object.keys(progress.completedProcesses));
      setCompletedProcesses(completed);
    }
  }, [selectedIndustry]);

  useEffect(() => {
    // Aplicar datos del proceso actual
    if (selectedProcess && allProcesses.length > 0) {
      const process = allProcesses.find(p => p.key === selectedProcess);
      if (process) {
        setRatData(prev => ({
          ...prev,
          finalidades: {
            ...prev.finalidades,
            descripcion: process.finalidad,
            baseLegal: process.baseLegal
          },
          categorias: {
            ...prev.categorias,
            titulares: process.categoriasTitulares || [],
            datosPersonales: mapDataCategories(process.categoriasDatos || [])
          },
          fuente: {
            ...prev.fuente,
            descripcion: process.fuenteDatos || '',
            esFuentePublica: process.esFuentePublica || false
          },
          conservacion: {
            ...prev.conservacion,
            periodo: process.conservacion || ''
          },
          seguridad: {
            ...prev.seguridad,
            tecnicas: process.medidasTecnicas || [],
            organizativas: process.medidasOrganizativas || []
          },
          transferencias: {
            ...prev.transferencias,
            existe: process.transferenciasInternacionales || false,
            destinos: process.paisesDestino || []
          },
          automatizadas: {
            ...prev.automatizadas,
            existe: process.decisionesAutomatizadas || false,
            logica: process.logicaDecision || '',
            consecuencias: process.consecuenciasDecision || ''
          }
        }));
      }
    }
  }, [selectedProcess]);

  useEffect(() => {
    // Calcular progreso
    const totalSteps = steps.length;
    const currentProgress = ((activeStep + 1) / totalSteps) * 100;
    setProgress(currentProgress);
  }, [activeStep]);

  // Función para narrar ayuda
  const narrateHelp = (text) => {
    if ('speechSynthesis' in window) {
      // Detener narración anterior si existe
      if (utteranceRef.current) {
        speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onstart = () => setIsNarrating(true);
      utterance.onend = () => setIsNarrating(false);
      utterance.onerror = () => setIsNarrating(false);

      utteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    }
  };

  // Función para mostrar ayuda
  const showStepHelp = (stepIndex) => {
    const help = steps[stepIndex].help;
    setCurrentHelp(help);
    setShowHelp(true);
    narrateHelp(help);
  };

  // Mapear categorías de datos a estructura booleana
  const mapDataCategories = (categories) => {
    const mapped = {
      identificacion: false,
      contacto: false,
      laborales: false,
      academicos: false,
      financieros: false,
      socieconomicos: false,
      salud: false,
      biometricos: false,
      geneticos: false,
      ideologia: false,
      menores: false,
      otros: []
    };
    
    if (categories) {
      categories.forEach(cat => {
        if (mapped.hasOwnProperty(cat)) {
          mapped[cat] = true;
        } else {
          mapped.otros.push(cat);
        }
      });
    }
    
    return mapped;
  };

  // Función para cargar siguiente proceso de la industria
  const loadNextIndustryProcess = () => {
    if (currentProcessIndex < allProcesses.length - 1) {
      setCompletedProcesses(prev => new Set([...prev, selectedProcess]));
      setCurrentProcessIndex(prev => prev + 1);
      setSelectedProcess(allProcesses[currentProcessIndex + 1].key);
      setActiveStep(0); // Reiniciar wizard
    } else {
      // Todos los procesos completados
      setSnackbar({
        open: true,
        message: '¡Todos los procesos de la industria han sido completados! RAT completo generado.',
        severity: 'success'
      });
    }
  };

  // Función para descargar plantilla Excel
  const downloadExcelForIndustry = () => {
    if (selectedIndustry) {
      downloadExcelTemplate(selectedIndustry, currentTenant?.company_name);
      setSnackbar({
        open: true,
        message: 'Plantilla Excel descargada exitosamente',
        severity: 'success'
      });
    }
  };

  // Validar paso actual
  const validateCurrentStep = () => {
    const newErrors = {};
    
    switch (activeStep) {
      case 0: // Identificación del Responsable
        if (!ratData.responsable.nombre.trim()) {
          newErrors.responsableNombre = 'Nombre del responsable es obligatorio';
        }
        
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!ratData.responsable.email.trim()) {
          newErrors.responsableEmail = 'Email es obligatorio';
        } else if (!emailRegex.test(ratData.responsable.email)) {
          newErrors.responsableEmail = 'Email debe tener formato válido';
        }
        
        // Validar teléfono
        const phoneRegex = /^[+]?[0-9\s\-\(\)]{8,15}$/;
        if (!ratData.responsable.telefono.trim()) {
          newErrors.responsableTelefono = 'Teléfono es obligatorio';
        } else if (!phoneRegex.test(ratData.responsable.telefono)) {
          newErrors.responsableTelefono = 'Teléfono debe tener formato válido (8-15 dígitos)';
        }
        break;
      case 1: // Finalidades
        if (!ratData.finalidades.descripcion.trim()) {
          newErrors.finalidadesDescripcion = 'Descripción de finalidades es obligatoria';
        }
        if (!ratData.finalidades.baseLegal) {
          newErrors.baseLegal = 'Base legal es obligatoria';
        }
        break;
      case 2: // Categorías
        if (ratData.categorias.titulares.length === 0) {
          newErrors.titulares = 'Debe seleccionar al menos una categoría de titulares';
        }
        const datosSeleccionados = Object.values(ratData.categorias.datosPersonales).some(v => v === true);
        if (!datosSeleccionados && ratData.categorias.datosPersonales.otros.length === 0) {
          newErrors.datosPersonales = 'Debe seleccionar al menos una categoría de datos';
        }
        break;
      case 4: // Fuente
        if (!ratData.fuente.tipo) {
          newErrors.fuenteTipo = 'Tipo de fuente es obligatorio';
        }
        break;
      case 5: // Conservación
        if (!ratData.conservacion.periodo.trim()) {
          newErrors.conservacionPeriodo = 'Período de conservación es obligatorio';
        }
        break;
      case 6: // Seguridad
        if (!ratData.seguridad.descripcionGeneral.trim()) {
          newErrors.seguridadDescripcion = 'Descripción de medidas de seguridad es obligatoria';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Guardar trabajo en progreso
  const saveWorkInProgress = () => {
    if (selectedIndustry && selectedProcess) {
      const workData = {
        ...ratData,
        currentStep: activeStep,
        lastSaved: new Date().toISOString()
      };
      
      ratService.saveWorkInProgress(selectedIndustry, selectedProcess, workData);
      
      setSnackbar({
        open: true,
        message: '💾 Trabajo guardado automáticamente',
        severity: 'info'
      });
    }
  };

  // Avanzar al siguiente paso
  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      // Guardar progreso automáticamente
      setTimeout(saveWorkInProgress, 500);
    }
  };

  // Retroceder al paso anterior
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Exportar RAT - VERSIÓN PRODUCCIÓN con guardado en Supabase
  const exportRAT = async () => {
    try {
      setLoading(true);
      
      const ratComplete = {
        ...ratData,
        metadata: {
          empresa: currentTenant?.company_name,
          usuario: user?.email,
          fechaCreacion: new Date().toISOString(),
          version: '1.0'
        }
      };

      // Marcar proceso como completado y CERTIFICADO en el servicio
      if (selectedIndustry && selectedProcess) {
        // Guardar en el servicio de procesos completados
        ratService.markProcessCompleted(selectedIndustry, selectedProcess, ratComplete);
        
        // CRÍTICO: Cambiar estado a CERTIFICADO (ya no se puede eliminar)
        ratService.setRATState(selectedIndustry, selectedProcess, ratService.RAT_STATES.CERTIFIED);
        
        // ⭐ GUARDADO CRÍTICO EN SUPABASE ⭐
        console.log('🚀 Iniciando guardado en Supabase...');
        const industryName = INDUSTRY_TEMPLATES[selectedIndustry]?.nombre || 'General';
        const processName = INDUSTRY_TEMPLATES[selectedIndustry]?.procesos[selectedProcess]?.nombre || selectedProcess;
        
        try {
          const supabaseResult = await ratService.saveCompletedRAT(ratComplete, industryName, processName);
          console.log('✅ RAT guardado exitosamente en Supabase:', supabaseResult);
          
          // Guardar el ID del RAT recién creado
          const savedRatId = supabaseResult?.id || `rat_${Date.now()}`;
          
          // Mostrar notificación con opciones
          setSnackbar({
            open: true,
            message: '✅ RAT guardado exitosamente en base de datos',
            severity: 'success',
            ratId: savedRatId,
            showActions: true
          });
          
          // Opción de redirección automática después de 3 segundos
          setTimeout(() => {
            if (window.confirm('¿Desea ver el RAT que acaba de guardar?')) {
              window.location.href = `/consolidado-rat?highlight=${savedRatId}`;
            }
          }, 2000);
          
        } catch (supabaseError) {
          console.error('❌ Error guardando en Supabase:', supabaseError);
          setSnackbar({
            open: true,
            message: `⚠️ RAT guardado localmente (Error BD: ${supabaseError.message})`,
            severity: 'warning'
          });
        }
        
        // Actualizar progreso de industria
        const updatedProgress = ratService.getIndustryProgress(
          selectedIndustry, 
          Object.keys(INDUSTRY_TEMPLATES[selectedIndustry]?.procesos || {}).length
        );
        setIndustryProgress(updatedProgress);
      }

      // Proceder con la exportación del archivo
      switch (exportFormat) {
        case 'json':
          downloadJSON(ratComplete);
          break;
        case 'pdf':
          generatePDF(ratComplete);
          break;
        case 'excel':
          generateExcel(ratComplete);
          break;
      }
    } catch (error) {
      console.error('❌ Error crítico en exportRAT:', error);
      setSnackbar({
        open: true,
        message: `❌ Error exportando RAT: ${error.message}`,
        severity: 'error'
      });
      return; // Salir si hay error
    } finally {
      setLoading(false);
    }

    setSnackbar({
      open: true,
      message: `✅ RAT exportado y guardado como completado en formato ${exportFormat.toUpperCase()}`,
      severity: 'success'
    });
    
    // Actualizar el estado para reflejar que el proceso fue completado
    setSelectedProcess(null);
    setActiveStep(0);
    setRatData(getInitialRatData());
  };

  // NUEVO: Función para manejar transiciones de estado RAT
  const handleStateTransition = async (processKey, newState) => {
    const stateLabels = {
      [ratService.RAT_STATES.CREATION]: 'Creación 📝',
      [ratService.RAT_STATES.MANAGEMENT]: 'Gestión ⚙️', 
      [ratService.RAT_STATES.CERTIFIED]: 'Certificado 🏆'
    };

    const currentState = ratService.getRATState(selectedIndustry, processKey);
    const processName = INDUSTRY_TEMPLATES[selectedIndustry]?.procesos[processKey]?.nombre || processKey;

    // Validar transición válida
    if (newState === ratService.RAT_STATES.CERTIFIED && currentState !== ratService.RAT_STATES.MANAGEMENT) {
      setSnackbar({
        open: true,
        message: '⚠️ Solo se puede certificar un proceso que esté en estado de Gestión',
        severity: 'warning'
      });
      return;
    }

    // Confirmar acción crítica
    let confirmMessage = '';
    if (newState === ratService.RAT_STATES.CERTIFIED) {
      confirmMessage = `⚠️ ACCIÓN CRÍTICA\n\n¿Confirmas certificar el proceso "${processName}"?\n\n🔒 Una vez certificado:\n• Solo el DPO podrá eliminarlo\n• No se puede revertir a estado anterior\n• Queda registrado en auditoría`;
    } else {
      confirmMessage = `¿Confirmas cambiar el estado del proceso "${processName}" de ${stateLabels[currentState]} a ${stateLabels[newState]}?`;
    }

    if (window.confirm(confirmMessage)) {
      try {
        ratService.setRATState(selectedIndustry, processKey, newState);
        
        setSnackbar({
          open: true,
          message: `✅ Estado cambiado: "${processName}" ahora está en ${stateLabels[newState]}`,
          severity: 'success'
        });

        // Forzar re-renderizado actualizando el progreso
        const updatedProgress = ratService.getIndustryProgress(
          selectedIndustry, 
          Object.keys(INDUSTRY_TEMPLATES[selectedIndustry]?.procesos || {}).length
        );
        setIndustryProgress(updatedProgress);

      } catch (error) {
        setSnackbar({
          open: true,
          message: `❌ Error al cambiar estado: ${error.message}`,
          severity: 'error'
        });
      }
    }
  };

  const downloadJSON = (data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RAT_${currentTenant?.company_name}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generatePDF = (data) => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    let yPosition = 20;
    
    // Configurar fuente
    pdf.setFont('helvetica', 'normal');
    
    // Título
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('REGISTRO DE ACTIVIDADES DE TRATAMIENTO (RAT)', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
    
    pdf.setFontSize(12);
    pdf.text('Ley 21.719 - Protección de Datos Personales Chile', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;
    
    // Información general
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(`Empresa: ${data.responsable.nombre}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Fecha de Generación: ${new Date().toLocaleDateString('es-CL')}`, 20, yPosition);
    yPosition += 15;
    
    // Función auxiliar para agregar sección
    const addSection = (title, content) => {
      if (yPosition > 250) { // Nueva página si es necesario
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text(title, 20, yPosition);
      yPosition += 10;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      
      // Dividir contenido en líneas
      const lines = pdf.splitTextToSize(content, pageWidth - 40);
      lines.forEach(line => {
        if (yPosition > 280) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(line, 20, yPosition);
        yPosition += 6;
      });
      yPosition += 8;
    };
    
    // 1. Responsable del Tratamiento
    let responsableContent = `Nombre: ${data.responsable.nombre}\nEmail: ${data.responsable.email}\nTeléfono: ${data.responsable.telefono}`;
    if (data.responsable.representanteLegal.esExtranjero) {
      responsableContent += `\n\nRepresentante Legal en Chile:\n- Nombre: ${data.responsable.representanteLegal.nombre}\n- Email: ${data.responsable.representanteLegal.email}\n- Teléfono: ${data.responsable.representanteLegal.telefono}`;
    }
    addSection('1. RESPONSABLE DEL TRATAMIENTO', responsableContent);
    
    // 2. Finalidades
    let finalidadesContent = `Descripción: ${data.finalidades.descripcion}\nBase Legal: ${data.finalidades.baseLegal}`;
    if (data.finalidades.esConsentimiento) {
      finalidadesContent += `\nRetiro de Consentimiento: ${data.finalidades.derechoRetiro}`;
    }
    addSection('2. FINALIDADES DEL TRATAMIENTO', finalidadesContent);
    
    // 3. Categorías
    const categoriasContent = `Titulares: ${data.categorias.titulares.join(', ') || 'No especificado'}\n\nTipos de Datos Personales:\n${Object.entries(data.categorias.datosPersonales)
      .filter(([key, value]) => value === true)
      .map(([key]) => `- ${key.charAt(0).toUpperCase() + key.slice(1)}`)
      .join('\n') || 'No especificado'}`;
    addSection('3. CATEGORÍAS DE TITULARES Y DATOS', categoriasContent);
    
    // 4. Transferencias Internacionales
    const transferenciasContent = data.transferencias.existe 
      ? `Sí existen transferencias internacionales\nPaíses Destino: ${data.transferencias.destinos.join(', ')}\nGarantías: ${data.transferencias.garantias}`
      : 'No existen transferencias internacionales';
    addSection('4. TRANSFERENCIAS INTERNACIONALES', transferenciasContent);
    
    // 5. Fuente de los Datos
    const fuenteContent = `Tipo: ${data.fuente.tipo}\nDescripción: ${data.fuente.descripcion}\nFuente Pública: ${data.fuente.esFuentePublica ? 'Sí' : 'No'}`;
    addSection('5. FUENTE DE LOS DATOS', fuenteContent);
    
    // 6. Conservación
    const conservacionContent = `Período: ${data.conservacion.periodo}\nCriterio: ${data.conservacion.criterio}\nJustificación: ${data.conservacion.justificacion}`;
    addSection('6. PERÍODOS DE CONSERVACIÓN', conservacionContent);
    
    // 7. Seguridad
    const seguridadContent = `Medidas Técnicas: ${data.seguridad.tecnicas.join(', ') || 'No especificado'}\nMedidas Organizativas: ${data.seguridad.organizativas.join(', ') || 'No especificado'}\n\nDescripción General: ${data.seguridad.descripcionGeneral}`;
    addSection('7. MEDIDAS DE SEGURIDAD', seguridadContent);
    
    // 8. Decisiones Automatizadas
    const automatizadasContent = data.automatizadas.existe
      ? `Sí existen decisiones automatizadas\nLógica: ${data.automatizadas.logica}\nConsecuencias: ${data.automatizadas.consecuencias}`
      : 'No existen decisiones automatizadas';
    addSection('8. DECISIONES AUTOMATIZADAS', automatizadasContent);
    
    // Pie de página
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.text(`RAT generado con Sistema LPDP - Página ${i} de ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
      pdf.text(`Cumple Ley 21.719 Chile`, pageWidth - 20, 290, { align: 'right' });
    }
    
    // Descargar
    pdf.save(`RAT_${currentTenant?.company_name}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateExcel = (data) => {
    // Usar la nueva función para exportar a Excel XLSX
    const industryName = selectedIndustry ? INDUSTRY_TEMPLATES[selectedIndustry]?.nombre : 'General';
    exportRATToExcel(data, currentTenant?.company_name || 'Empresa', industryName);
  };

  // Renderizar contenido del paso actual
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <AlertTitle>🇨🇱 Artículo 12 Ley 21.719 - Campo Obligatorio</AlertTitle>
              <Typography variant="body2">
                <strong>Particularidad Chile:</strong> Si eres empresa extranjera, <strong>DEBES</strong> designar 
                un representante legal en Chile. Esto es único de la ley chilena vs RGPD.
              </Typography>
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombre del Responsable"
                  value={ratData.responsable.nombre}
                  onChange={(e) => setRatData(prev => ({
                    ...prev,
                    responsable: { ...prev.responsable, nombre: e.target.value }
                  }))}
                  error={!!errors.responsableNombre}
                  helperText={errors.responsableNombre}
                  placeholder="Ejemplo: Mi Empresa SpA"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Corporativo"
                  type="email"
                  value={ratData.responsable.email}
                  onChange={(e) => setRatData(prev => ({
                    ...prev,
                    responsable: { ...prev.responsable, email: e.target.value }
                  }))}
                  error={!!errors.responsableEmail}
                  helperText={errors.responsableEmail || 'Email principal del responsable de datos'}
                  placeholder="contacto@miempresa.cl"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Teléfono Corporativo"
                  type="tel"
                  value={ratData.responsable.telefono}
                  onChange={(e) => setRatData(prev => ({
                    ...prev,
                    responsable: { ...prev.responsable, telefono: e.target.value }
                  }))}
                  error={!!errors.responsableTelefono}
                  helperText={errors.responsableTelefono || 'Teléfono del responsable (ej: +56912345678)'}
                  placeholder="+56912345678"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={ratData.responsable.representanteLegal.esExtranjero}
                      onChange={(e) => setRatData(prev => ({
                        ...prev,
                        responsable: {
                          ...prev.responsable,
                          representanteLegal: {
                            ...prev.responsable.representanteLegal,
                            esExtranjero: e.target.checked
                          }
                        }
                      }))}
                    />
                  }
                  label="La empresa es extranjera (requiere representante legal en Chile)"
                />
              </Grid>
              
              {ratData.responsable.representanteLegal.esExtranjero && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nombre Representante Legal"
                      value={ratData.responsable.representanteLegal.nombre}
                      onChange={(e) => setRatData(prev => ({
                        ...prev,
                        responsable: {
                          ...prev.responsable,
                          representanteLegal: {
                            ...prev.responsable.representanteLegal,
                            nombre: e.target.value
                          }
                        }
                      }))}
                      placeholder="Juan Pérez Abogados"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email Representante Legal"
                      type="email"
                      value={ratData.responsable.representanteLegal.email}
                      onChange={(e) => setRatData(prev => ({
                        ...prev,
                        responsable: {
                          ...prev.responsable,
                          representanteLegal: {
                            ...prev.responsable.representanteLegal,
                            email: e.target.value
                          }
                        }
                      }))}
                      placeholder="representante@abogados.cl"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Teléfono Representante Legal"
                      type="tel"
                      value={ratData.responsable.representanteLegal.telefono}
                      onChange={(e) => setRatData(prev => ({
                        ...prev,
                        responsable: {
                          ...prev.responsable,
                          representanteLegal: {
                            ...prev.responsable.representanteLegal,
                            telefono: e.target.value
                          }
                        }
                      }))}
                      placeholder="+56912345678"
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        );
      
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <AlertTitle>Finalidades del Tratamiento</AlertTitle>
              Define para qué fines específicos y legítimos tratarás los datos personales.
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Descripción de las Finalidades"
                  value={ratData.finalidades.descripcion}
                  onChange={(e) => setRatData(prev => ({
                    ...prev,
                    finalidades: { ...prev.finalidades, descripcion: e.target.value }
                  }))}
                  error={!!errors.finalidadesDescripcion}
                  helperText={errors.finalidadesDescripcion || 'Ejemplo: Gestión de recursos humanos, procesamiento de nóminas, comunicación con empleados'}
                  placeholder="Describe claramente para qué usarás los datos..."
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.baseLegal}>
                  <InputLabel>Base Legal del Tratamiento</InputLabel>
                  <Select
                    value={ratData.finalidades.baseLegal}
                    onChange={(e) => setRatData(prev => ({
                      ...prev,
                      finalidades: { 
                        ...prev.finalidades, 
                        baseLegal: e.target.value,
                        esConsentimiento: e.target.value === 'consentimiento'
                      }
                    }))}
                    label="Base Legal del Tratamiento"
                  >
                    {basesLegales.map((base) => (
                      <MenuItem key={base.value} value={base.value}>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {base.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {base.fundamento} - {base.descripcion}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {ratData.finalidades.baseLegal && (
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <AlertTitle>Base Legal Seleccionada</AlertTitle>
                    <Typography variant="body2" fontWeight={600}>
                      {basesLegales.find(b => b.value === ratData.finalidades.baseLegal)?.fundamento}
                    </Typography>
                    <Typography variant="body2">
                      {basesLegales.find(b => b.value === ratData.finalidades.baseLegal)?.descripcion}
                    </Typography>
                  </Alert>
                </Grid>
              )}
              
              {ratData.finalidades.esConsentimiento && (
                <Grid item xs={12}>
                  <Alert severity="warning">
                    <AlertTitle>Tratamiento basado en Consentimiento</AlertTitle>
                    Debes informar sobre el derecho a retirar el consentimiento en cualquier momento.
                  </Alert>
                  
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Información sobre Retiro de Consentimiento"
                    value={ratData.finalidades.derechoRetiro}
                    onChange={(e) => setRatData(prev => ({
                      ...prev,
                      finalidades: { ...prev.finalidades, derechoRetiro: e.target.value }
                    }))}
                    placeholder="El titular puede retirar su consentimiento en cualquier momento enviando un email a..."
                    sx={{ mt: 2 }}
                  />
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Alert severity="success" sx={{ mb: 2 }}>
                  <AlertTitle>💼 GENERACIÓN COMPLETA DE RAT POR INDUSTRIA</AlertTitle>
                  Te ofrecemos un RAT completo con TODOS los procesos típicos de tu industria. 
                  ¡El trabajo ya está hecho! Solo necesitas revisar y personalizar.
                </Alert>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Selecciona tu Industria</InputLabel>
                      <Select
                        value={selectedIndustry}
                        onChange={(e) => {
                          setSelectedIndustry(e.target.value);
                          setShowIndustryWizard(true);
                        }}
                        label="Selecciona tu Industria"
                      >
                        <MenuItem value="">Seleccionar industria...</MenuItem>
                        {Object.entries(INDUSTRY_TEMPLATES).map(([key, template]) => (
                          <MenuItem key={key} value={key}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <template.icono sx={{ fontSize: 20 }} />
                              {template.nombre}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<GetApp />}
                      onClick={downloadExcelForIndustry}
                      disabled={!selectedIndustry}
                      sx={{ height: 56 }}
                    >
                      Descargar Plantilla Excel
                    </Button>
                  </Grid>
                </Grid>
                
                {selectedIndustry && INDUSTRY_TEMPLATES[selectedIndustry] && (
                  <Box sx={{ mt: 2 }}>
                    {/* Header con progreso y gestión */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Box>
                        <Typography variant="subtitle1" gutterBottom>
                          📋 {INDUSTRY_TEMPLATES[selectedIndustry].nombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Progreso: {industryProgress.completed}/{allProcesses.filter(p => ratService.isProcessActive(selectedIndustry, p.key)).length} procesos activos completados ({industryProgress.percentage}%)
                          {allProcesses.filter(p => !ratService.isProcessActive(selectedIndustry, p.key)).length > 0 && (
                            <span style={{ marginLeft: 8, color: 'rgba(0,0,0,0.5)' }}>
                              • {allProcesses.filter(p => !ratService.isProcessActive(selectedIndustry, p.key)).length} desactivados
                            </span>
                          )}
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => setShowProgressManager(true)}
                        sx={{ ml: 2 }}
                      >
                        Gestionar Procesos
                      </Button>
                    </Box>
                    
                    {/* Barra de progreso */}
                    <LinearProgress
                      variant="determinate"
                      value={industryProgress.percentage}
                      sx={{ 
                        mb: 2, 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: 'rgba(0, 188, 212, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: COLORS.primary.main
                        }
                      }}
                    />
                    
                    {/* Lista de procesos activos */}
                    <Box display="flex" flexDirection="column" gap={1}>
                      {allProcesses.map((proceso) => {
                        const isCompleted = completedProcesses.has(proceso.key);
                        const hasWorkInProgress = ratService.getWorkInProgress(selectedIndustry, proceso.key);
                        // CRÍTICO: Obtener el estado activo actual del servicio (no del array que puede estar desactualizado)
                        const isCurrentlyActive = ratService.isProcessActive(selectedIndustry, proceso.key);
                        // NUEVO: Obtener estado RAT del proceso
                        const ratState = ratService.getRATState(selectedIndustry, proceso.key);
                        
                        // Definir colores y labels según estado RAT
                        const stateInfo = {
                          [ratService.RAT_STATES.CREATION]: { 
                            icon: '📝', 
                            label: 'Creación', 
                            color: '#2196f3',
                            bgColor: 'rgba(33, 150, 243, 0.1)'
                          },
                          [ratService.RAT_STATES.MANAGEMENT]: { 
                            icon: '⚙️', 
                            label: 'Gestión', 
                            color: '#ff9800',
                            bgColor: 'rgba(255, 152, 0, 0.1)'
                          },
                          [ratService.RAT_STATES.CERTIFIED]: { 
                            icon: '🏆', 
                            label: 'Certificado', 
                            color: '#4caf50',
                            bgColor: 'rgba(76, 175, 80, 0.1)'
                          }
                        };
                        
                        const currentStateInfo = stateInfo[ratState] || stateInfo[ratService.RAT_STATES.CREATION];
                        
                        return (
                        <Box key={proceso.key} display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={proceso.nombre}
                            variant={isCompleted ? "filled" : "outlined"}
                            color={
                              !isCurrentlyActive ? "default" :
                              isCompleted ? "success" : 
                              hasWorkInProgress ? "warning" : 
                              "default"
                            }
                            icon={
                              !isCurrentlyActive ? null :
                              isCompleted ? <CheckCircle /> : 
                              hasWorkInProgress ? <Schedule /> : 
                              null
                            }
                            onClick={() => {
                              // Solo permitir selección si el proceso está activo
                              if (isCurrentlyActive) {
                                setSelectedProcess(proceso.key);
                              } else {
                                setSnackbar({
                                  open: true,
                                  message: `⚠️ El proceso "${proceso.nombre}" está desactivado. Actívalo en "Gestionar Procesos" para trabajar con él.`,
                                  severity: 'warning'
                                });
                              }
                            }}
                            size="small"
                            sx={{ 
                              flex: 1,
                              opacity: isCurrentlyActive ? 1 : 0.4,
                              textDecoration: isCurrentlyActive ? 'none' : 'line-through',
                              cursor: isCurrentlyActive ? 'pointer' : 'not-allowed',
                              '& .MuiChip-label': {
                                fontWeight: isCompleted ? 600 : 400,
                                color: isCurrentlyActive ? 'inherit' : 'text.disabled'
                              },
                              backgroundColor: isCurrentlyActive ? 'inherit' : 'rgba(0,0,0,0.05)',
                              '&:hover': {
                                backgroundColor: isCurrentlyActive ? 'inherit' : 'rgba(0,0,0,0.05)'
                              }
                            }}
                          />
                          
                          {/* Status badge */}
                          {isCompleted && (
                            <Chip 
                              label="Completado" 
                              size="small" 
                              color="success" 
                              variant="outlined"
                            />
                          )}
                          {hasWorkInProgress && !isCompleted && (
                            <Chip 
                              label="En Progreso" 
                              size="small" 
                              color="warning" 
                              variant="outlined"
                            />
                          )}
                          
                          {/* NUEVO: Chip de Estado RAT (Creación/Gestión/Certificado) */}
                          <Tooltip title={`Estado RAT: ${currentStateInfo.label}`}>
                            <Chip 
                              label={`${currentStateInfo.icon} ${currentStateInfo.label}`}
                              size="small" 
                              variant="filled"
                              sx={{
                                backgroundColor: currentStateInfo.bgColor,
                                color: currentStateInfo.color,
                                fontWeight: 600,
                                border: `1px solid ${currentStateInfo.color}`,
                                '& .MuiChip-label': {
                                  fontSize: '0.7rem'
                                }
                              }}
                            />
                          </Tooltip>
                          
                          {/* Indicador de estado activo/inactivo */}
                          <Tooltip title={`Proceso ${isCurrentlyActive ? 'ACTIVO' : 'INACTIVO'}`}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: isCurrentlyActive ? '#4caf50' : '#f44336',
                                mr: 1,
                                border: '2px solid #fff',
                                boxShadow: '0 0 4px rgba(0,0,0,0.3)'
                              }}
                            />
                          </Tooltip>
                          
                          <Tooltip title={`Editar datos del proceso ${isCurrentlyActive ? '(ACTIVO)' : '(INACTIVO)'}`}>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditingProcess(proceso.key);
                                setProcessEditData({
                                  ...proceso,
                                  key: proceso.key
                                });
                              }}
                              sx={{ 
                                color: isCurrentlyActive ? 'primary.main' : 'text.disabled',
                                opacity: isCurrentlyActive ? 1 : 0.5
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={`Ver detalles del proceso ${isCurrentlyActive ? '(ACTIVO)' : '(INACTIVO)'}`}>
                            <IconButton
                              size="small"
                              onClick={() => {
                                const activeStatus = isCurrentlyActive ? '✅ ACTIVO' : '🚫 INACTIVO';
                                setSnackbar({
                                  open: true,
                                  message: `${activeStatus}\n\nProceso: ${proceso.nombre}\nBase Legal: ${proceso.baseLegal}\nConservación: ${proceso.conservacion}`,
                                  severity: isCurrentlyActive ? 'info' : 'warning'
                                });
                              }}
                              sx={{ 
                                color: isCurrentlyActive ? 'info.main' : 'text.disabled',
                                opacity: isCurrentlyActive ? 1 : 0.5
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          {/* NUEVO: Botones de transición de estado RAT */}
                          {isCurrentlyActive && (
                            <Box sx={{ ml: 1, display: 'flex', gap: 0.5 }}>
                              {/* Botón para pasar a Gestión */}
                              {ratState === ratService.RAT_STATES.CREATION && (
                                <Tooltip title="Mover a Estado de Gestión">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleStateTransition(proceso.key, ratService.RAT_STATES.MANAGEMENT)}
                                    sx={{ 
                                      color: '#ff9800',
                                      bgcolor: 'rgba(255, 152, 0, 0.1)',
                                      '&:hover': { bgcolor: 'rgba(255, 152, 0, 0.2)' }
                                    }}
                                  >
                                    <Build fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              
                              {/* Botón para certificar (solo desde Gestión) */}
                              {ratState === ratService.RAT_STATES.MANAGEMENT && (
                                <Tooltip title="Certificar Proceso (No se podrá eliminar)">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleStateTransition(proceso.key, ratService.RAT_STATES.CERTIFIED)}
                                    sx={{ 
                                      color: '#4caf50',
                                      bgcolor: 'rgba(76, 175, 80, 0.1)',
                                      '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.2)' }
                                    }}
                                  >
                                    <CheckCircle fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              
                              {/* Indicador de proceso certificado */}
                              {ratState === ratService.RAT_STATES.CERTIFIED && (
                                <Tooltip title="Proceso Certificado - Solo DPO puede eliminar">
                                  <IconButton
                                    size="small"
                                    disabled
                                    sx={{ 
                                      color: '#4caf50',
                                      opacity: 0.8
                                    }}
                                  >
                                    <Lock fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          )}
                        </Box>
                        );
                      })}
                    </Box>
                    
                    <Stack spacing={2} sx={{ mt: 2 }}>
                      <Alert severity="info">
                        <Typography variant="body2">
                          <strong>¿Cómo funciona?</strong><br/>
                          1. Seleccionamos tu industria<br/>
                          2. Te mostramos TODOS los procesos típicos de tu sector<br/>
                          3. Puedes editar cualquier proceso con el botón ✏️<br/>
                          4. Vas paso a paso completando cada proceso<br/>
                          5. Obtienes un RAT completo y legal ¡En minutos!
                        </Typography>
                      </Alert>
                      
                      <Alert severity="warning">
                        <Typography variant="body2">
                          <strong>💡 NUEVO: Funciones de Edición</strong><br/>
                          • Haz clic en ✏️ para editar cualquier proceso de la industria<br/>
                          • Haz clic en 👁️ para ver los detalles de un proceso<br/>
                          • Personaliza los datos según tu empresa específica
                        </Typography>
                      </Alert>
                      
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="contained"
                          color="secondary"
                          startIcon={<Add />}
                          onClick={() => {
                            setEditingProcess('nuevo');
                            setProcessEditData({
                              key: 'nuevo',
                              nombre: '',
                              finalidad: '',
                              baseLegal: 'consentimiento',
                              categoriasTitulares: [],
                              categoriasDatos: [],
                              fuenteDatos: '',
                              conservacion: '',
                              medidasTecnicas: [],
                              medidasOrganizativas: [],
                              transferenciasInternacionales: false,
                              paisesDestino: [],
                              decisionesAutomatizadas: false,
                              logicaDecision: '',
                              consecuenciasDecision: ''
                            });
                          }}
                          size="small"
                        >
                          Crear Proceso Personalizado
                        </Button>
                      </Box>
                    </Stack>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>
        );
        
      // Continúo con los otros casos...
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Alert severity="warning" sx={{ mb: 3 }}>
              <AlertTitle>🚨 PARTICULARIDAD CHILE: Datos Socioeconómicos</AlertTitle>
              <Typography variant="body2">
                <strong>EXCLUSIVO de Chile:</strong> La "situación socioeconómica" es considerada 
                <strong>dato sensible</strong> (Art. 2 lit. g). Esto incluye: ingresos, nivel socioeconómico, 
                elegibilidad para beneficios sociales. ¡Cuidado especial!
              </Typography>
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Categorías de Titulares de Datos
                </Typography>
                <Autocomplete
                  multiple
                  options={categoriasTitulares}
                  value={ratData.categorias.titulares}
                  onChange={(e, value) => setRatData(prev => ({
                    ...prev,
                    categorias: { ...prev.categorias, titulares: value }
                  }))}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Selecciona categorías"
                      error={!!errors.titulares}
                      helperText={errors.titulares}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        key={option}
                        label={option}
                        {...getTagProps({ index })}
                        size="small"
                      />
                    ))
                  }
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Categorías de Datos Personales
                </Typography>
                <FormGroup>
                  {Object.entries({
                    identificacion: { 
                      label: 'Datos de Identificación', 
                      fundamento: 'Art. 2 letra c) Ley 21.719',
                      ejemplos: 'RUT, nombre, apellidos, documento de identidad',
                      sensible: false
                    },
                    contacto: { 
                      label: 'Datos de Contacto', 
                      fundamento: 'Art. 2 letra c) Ley 21.719',
                      ejemplos: 'Email, teléfono, dirección postal',
                      sensible: false
                    },
                    laborales: { 
                      label: 'Datos Laborales', 
                      fundamento: 'Art. 2 letra c) Ley 21.719 + Código del Trabajo',
                      ejemplos: 'Cargo, sueldo, evaluaciones, historial laboral',
                      sensible: false
                    },
                    academicos: { 
                      label: 'Datos Académicos', 
                      fundamento: 'Art. 2 letra c) Ley 21.719',
                      ejemplos: 'Títulos, notas, certificados, historial académico',
                      sensible: false
                    },
                    financieros: { 
                      label: 'Datos Financieros', 
                      fundamento: 'Art. 2 letra c) Ley 21.719',
                      ejemplos: 'Ingresos, deudas, historial crediticio, cuentas bancarias',
                      sensible: false
                    },
                    socieconomicos: { 
                      label: '🚨 Datos Socioeconómicos (SENSIBLE Chile)', 
                      fundamento: 'Art. 2 letra g) Ley 21.719 - EXCLUSIVO DE CHILE',
                      ejemplos: 'Nivel socioeconómico, beneficios sociales, situación patrimonial',
                      sensible: true
                    },
                    salud: { 
                      label: 'Datos de Salud (SENSIBLE)', 
                      fundamento: 'Art. 2 letra g) Ley 21.719',
                      ejemplos: 'Historia clínica, exámenes médicos, tratamientos',
                      sensible: true
                    },
                    biometricos: { 
                      label: 'Datos Biométricos (SENSIBLE)', 
                      fundamento: 'Art. 2 letra g) Ley 21.719',
                      ejemplos: 'Huella dactilar, reconocimiento facial, iris, ADN',
                      sensible: true
                    },
                    geneticos: { 
                      label: 'Datos Genéticos (SENSIBLE)', 
                      fundamento: 'Art. 2 letra g) Ley 21.719',
                      ejemplos: 'Información genética heredada o adquirida',
                      sensible: true
                    },
                    ideologia: { 
                      label: 'Ideología y Creencias (SENSIBLE)', 
                      fundamento: 'Art. 2 letra g) Ley 21.719',
                      ejemplos: 'Religión, filosofía, moral, afiliación política o sindical',
                      sensible: true
                    },
                    menores: { 
                      label: 'Datos de Menores (PROTECCIÓN ESPECIAL)', 
                      fundamento: 'Art. 13 Ley 21.719',
                      ejemplos: 'Cualquier dato de persona menor de 18 años',
                      sensible: true
                    }
                  }).map(([key, data]) => (
                    <Box key={key} sx={{ mb: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={ratData.categorias.datosPersonales[key] || false}
                            onChange={(e) => setRatData(prev => ({
                              ...prev,
                              categorias: {
                                ...prev.categorias,
                                datosPersonales: {
                                  ...prev.categorias.datosPersonales,
                                  [key]: e.target.checked
                                }
                              }
                            }))}
                            color={data.sensible ? "error" : "primary"}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {data.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {data.fundamento}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontStyle: 'italic' }}>
                              Ejemplos: {data.ejemplos}
                            </Typography>
                          </Box>
                        }
                      />
                    </Box>
                  ))}
                </FormGroup>
                {errors.datosPersonales && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {errors.datosPersonales}
                  </Alert>
                )}
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <AlertTitle>Transferencias Internacionales - Ley 21.719</AlertTitle>
              <Typography variant="body2">
                Chile requiere "nivel adecuado de protección" o "garantías apropiadas". 
                Diferente al RGPD en detalles específicos.
              </Typography>
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={ratData.transferencias.existe}
                      onChange={(e) => setRatData(prev => ({
                        ...prev,
                        transferencias: { ...prev.transferencias, existe: e.target.checked }
                      }))}
                    />
                  }
                  label="¿Realiza transferencias internacionales de datos?"
                />
              </Grid>
              
              {ratData.transferencias.existe && (
                <>
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      multiple
                      options={['Estados Unidos', 'España', 'Argentina', 'Perú', 'Brasil', 'Reino Unido', 'Francia', 'Alemania', 'Singapur', 'Otro']}
                      value={ratData.transferencias.destinos}
                      onChange={(e, value) => setRatData(prev => ({
                        ...prev,
                        transferencias: { ...prev.transferencias, destinos: value }
                      }))}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Países de destino"
                          placeholder="Selecciona países..."
                        />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            key={option}
                            label={option}
                            {...getTagProps({ index })}
                            size="small"
                          />
                        ))
                      }
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Tipo de Garantía</InputLabel>
                      <Select
                        value={ratData.transferencias.garantias}
                        onChange={(e) => setRatData(prev => ({
                          ...prev,
                          transferencias: { ...prev.transferencias, garantias: e.target.value }
                        }))}
                        label="Tipo de Garantía"
                      >
                        <MenuItem value="clausulas_contractuales">Cláusulas Contractuales Tipo</MenuItem>
                        <MenuItem value="normas_corporativas">Normas Corporativas Vinculantes</MenuItem>
                        <MenuItem value="decision_adecuacion">Decisión de Adecuación</MenuItem>
                        <MenuItem value="certificacion">Certificación</MenuItem>
                        <MenuItem value="codigo_conducta">Código de Conducta</MenuItem>
                        <MenuItem value="otro">Otro</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        );
        
      case 4:
        return (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <AlertTitle>Fuente de los Datos</AlertTitle>
              Especifica cómo y de dónde obtienes los datos personales.
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Fuente</InputLabel>
                  <Select
                    value={ratData.fuente.tipo}
                    onChange={(e) => setRatData(prev => ({
                      ...prev,
                      fuente: { ...prev.fuente, tipo: e.target.value }
                    }))}
                    label="Tipo de Fuente"
                  >
                    <MenuItem value="directo">Directamente del titular</MenuItem>
                    <MenuItem value="tercero">De terceros</MenuItem>
                    <MenuItem value="publico">Fuentes públicas</MenuItem>
                    <MenuItem value="mixto">Mixto</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={ratData.fuente.esFuentePublica}
                      onChange={(e) => setRatData(prev => ({
                        ...prev,
                        fuente: { ...prev.fuente, esFuentePublica: e.target.checked }
                      }))}
                    />
                  }
                  label="Proviene de fuentes de acceso público"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Descripción de la Fuente"
                  value={ratData.fuente.descripcion}
                  onChange={(e) => setRatData(prev => ({
                    ...prev,
                    fuente: { ...prev.fuente, descripcion: e.target.value }
                  }))}
                  placeholder="Ej: Formularios web, contratos firmados, registro público del SII..."
                />
              </Grid>
            </Grid>
          </Box>
        );
        
      case 5:
        return (
          <Box sx={{ mt: 2 }}>
            <Alert severity="warning" sx={{ mb: 3 }}>
              <AlertTitle>Períodos de Conservación - Principio de Proporcionalidad</AlertTitle>
              Los datos NO pueden conservarse indefinidamente. Debe existir un plazo concreto o criterio objetivo.
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Período de Conservación"
                  value={ratData.conservacion.periodo}
                  onChange={(e) => setRatData(prev => ({
                    ...prev,
                    conservacion: { ...prev.conservacion, periodo: e.target.value }
                  }))}
                  placeholder="Ej: 6 años desde última transacción, Durante la relación contractual + 5 años"
                  helperText="NUNCA usar 'indefinido' - debe ser un plazo concreto"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Criterio de Conservación"
                  value={ratData.conservacion.criterio}
                  onChange={(e) => setRatData(prev => ({
                    ...prev,
                    conservacion: { ...prev.conservacion, criterio: e.target.value }
                  }))}
                  placeholder="Ej: Código Tributario requiere 6 años, Código del Trabajo 30 años"
                />
              </Grid>
            </Grid>
          </Box>
        );
        
      case 6:
        return (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <AlertTitle>Medidas de Seguridad Técnicas y Organizativas</AlertTitle>
              Describe las medidas implementadas para proteger los datos (descripción general, no detalles técnicos).
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Medidas Técnicas</Typography>
                <FormGroup>
                  {medidasTecnicas.map((medida) => (
                    <FormControlLabel
                      key={medida}
                      control={
                        <Checkbox
                          checked={ratData.seguridad.tecnicas.includes(medida)}
                          onChange={(e) => {
                            const newTecnicas = e.target.checked 
                              ? [...ratData.seguridad.tecnicas, medida]
                              : ratData.seguridad.tecnicas.filter(t => t !== medida);
                            setRatData(prev => ({
                              ...prev,
                              seguridad: { ...prev.seguridad, tecnicas: newTecnicas }
                            }));
                          }}
                        />
                      }
                      label={medida}
                    />
                  ))}
                </FormGroup>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Medidas Organizativas</Typography>
                <FormGroup>
                  {medidasOrganizativas.map((medida) => (
                    <FormControlLabel
                      key={medida}
                      control={
                        <Checkbox
                          checked={ratData.seguridad.organizativas.includes(medida)}
                          onChange={(e) => {
                            const newOrganizativas = e.target.checked 
                              ? [...ratData.seguridad.organizativas, medida]
                              : ratData.seguridad.organizativas.filter(o => o !== medida);
                            setRatData(prev => ({
                              ...prev,
                              seguridad: { ...prev.seguridad, organizativas: newOrganizativas }
                            }));
                          }}
                        />
                      }
                      label={medida}
                    />
                  ))}
                </FormGroup>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Descripción General de Medidas"
                  value={ratData.seguridad.descripcionGeneral}
                  onChange={(e) => setRatData(prev => ({
                    ...prev,
                    seguridad: { ...prev.seguridad, descripcionGeneral: e.target.value }
                  }))}
                  placeholder="Ej: Cifrado de datos, control de acceso, formación al personal..."
                />
              </Grid>
            </Grid>
          </Box>
        );
        
      case 7:
        return (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <AlertTitle>Decisiones Automatizadas e IA</AlertTitle>
              ¿Usas algoritmos, IA o sistemas automatizados para tomar decisiones que afecten a las personas?
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={ratData.automatizadas.existe}
                      onChange={(e) => setRatData(prev => ({
                        ...prev,
                        automatizadas: { ...prev.automatizadas, existe: e.target.checked }
                      }))}
                    />
                  }
                  label="¿Existen decisiones automatizadas?"
                />
              </Grid>
              
              {ratData.automatizadas.existe && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Lógica Utilizada"
                      value={ratData.automatizadas.logica}
                      onChange={(e) => setRatData(prev => ({
                        ...prev,
                        automatizadas: { ...prev.automatizadas, logica: e.target.value }
                      }))}
                      placeholder="Ej: Algoritmo de scoring basado en historial crediticio y ingresos"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Consecuencias para el Titular"
                      value={ratData.automatizadas.consecuencias}
                      onChange={(e) => setRatData(prev => ({
                        ...prev,
                        automatizadas: { ...prev.automatizadas, consecuencias: e.target.value }
                      }))}
                      placeholder="Ej: Aprobación o rechazo automático de crédito"
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        );
      
      default:
        return (
          <Box sx={{ mt: 2 }}>
            <Alert severity="success">
              ¡RAT Completado! Todos los campos obligatorios de la Ley 21.719 han sido documentados.
            </Alert>
          </Box>
        );
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 4, background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)` }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: COLORS.background.paper, color: COLORS.primary.main, width: 56, height: 56 }}>
              <Assignment />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.primary.contrastText }}>
                RAT PRODUCCIÓN
              </Typography>
              <Typography variant="subtitle1" sx={{ color: COLORS.primary.contrastText, opacity: 0.9 }}>
                Registro de Actividades de Tratamiento - Ley 21.719 Chile
              </Typography>
            </Box>
          </Box>
          
          <Box display="flex" alignItems="center" gap={2}>
            <Chip
              icon={<Verified />}
              label="Cumple Ley 21.719"
              sx={{
                bgcolor: rgba(COLORS.background.paper, 0.2),
                color: COLORS.primary.contrastText,
                fontWeight: 600
              }}
            />
            <Badge badgeContent={`${Math.round(progress)}%`} color="secondary">
              <IconButton
                sx={{ color: COLORS.primary.contrastText }}
                onClick={() => setShowPreview(true)}
              >
                <Visibility />
              </IconButton>
            </Badge>
          </Box>
        </Box>
        
        {/* Progress Bar */}
        <Box sx={{ mt: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: rgba(COLORS.background.paper, 0.3),
              '& .MuiLinearProgress-bar': {
                backgroundColor: COLORS.background.paper
              }
            }}
          />
          <Typography variant="body2" sx={{ mt: 1, color: COLORS.primary.contrastText }}>
            Progreso: {Math.round(progress)}% - Paso {activeStep + 1} de {steps.length}
          </Typography>
        </Box>
      </Paper>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                icon={
                  <Avatar
                    sx={{
                      bgcolor: index <= activeStep ? COLORS.primary.main : COLORS.background.surface,
                      color: index <= activeStep ? COLORS.primary.contrastText : COLORS.text.secondary,
                      width: 40,
                      height: 40
                    }}
                  >
                    {step.icon}
                  </Avatar>
                }
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {step.label}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {step.description}
                  </Typography>
                </Box>
              </StepLabel>
              <StepContent>
                <Box sx={{ pl: 2, pr: 2 }}>
                  {/* Botón de Ayuda */}
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                      startIcon={<Help />}
                      onClick={() => showStepHelp(index)}
                      variant="outlined"
                      size="small"
                    >
                      Ayuda de este paso
                    </Button>
                    
                    {isNarrating && (
                      <Chip
                        icon={<PlayArrow />}
                        label="Narrando..."
                        color="primary"
                        size="small"
                      />
                    )}
                  </Box>
                  
                  {/* Contenido del paso */}
                  {renderStepContent(index)}
                  
                  {/* Navegación */}
                  <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
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
                      <Box display="flex" gap={2}>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={() => setShowPreview(true)}
                          endIcon={<CheckCircle />}
                        >
                          Finalizar RAT
                        </Button>
                        
                        {selectedIndustry && currentProcessIndex < allProcesses.length - 1 && (
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={loadNextIndustryProcess}
                            endIcon={<NavigateNext />}
                          >
                            Siguiente Proceso ({currentProcessIndex + 2}/{allProcesses.length})
                          </Button>
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Preview Dialog */}
      <Dialog 
        open={showPreview} 
        onClose={() => setShowPreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Assignment />
            Vista Previa del RAT
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 3 }}>
            <AlertTitle>RAT Completado</AlertTitle>
            Tu Registro de Actividades de Tratamiento cumple con los requisitos de la Ley 21.719.
          </Alert>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Opciones de Exportación
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Formato de Exportación</InputLabel>
              <Select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                label="Formato de Exportación"
              >
                <MenuItem value="excel">Excel XLSX (Recomendado) 📊</MenuItem>
                <MenuItem value="pdf">PDF (Documento) 📄</MenuItem>
                <MenuItem value="json">JSON (Datos Técnicos) 💻</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          {/* Resumen */}
          <Typography variant="h6" gutterBottom>
            Resumen del RAT
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Business /></ListItemIcon>
              <ListItemText
                primary="Responsable"
                secondary={ratData.responsable.nombre}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Gavel /></ListItemIcon>
              <ListItemText
                primary="Finalidad Principal"
                secondary={ratData.finalidades.descripcion || 'No especificado'}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><People /></ListItemIcon>
              <ListItemText
                primary="Categorías de Titulares"
                secondary={ratData.categorias.titulares.join(', ') || 'No especificado'}
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>
            Cerrar
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={exportRAT}
          >
            Exportar RAT
          </Button>
        </DialogActions>
      </Dialog>

      {/* Help Dialog */}
      <Dialog open={showHelp} onClose={() => setShowHelp(false)}>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Help />
            Ayuda del Paso
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>{currentHelp}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHelp(false)}>
            Cerrar
          </Button>
          <Button
            variant="contained"
            startIcon={isNarrating ? <Pause /> : <PlayArrow />}
            onClick={() => {
              if (isNarrating) {
                speechSynthesis.cancel();
                setIsNarrating(false);
              } else {
                narrateHelp(currentHelp);
              }
            }}
          >
            {isNarrating ? 'Pausar' : 'Escuchar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Process Manager Dialog */}
      <Dialog
        open={showProgressManager}
        onClose={() => {
          setShowProgressManager(false);
          // CRÍTICO: Forzar re-renderizado cuando se cierra el diálogo
          if (selectedIndustry) {
            const allProcessesList = Object.entries(INDUSTRY_TEMPLATES[selectedIndustry].procesos).map(([procKey, proc]) => ({
              key: procKey,
              ...proc,
              isActive: ratService.isProcessActive(selectedIndustry, procKey),
              isCompleted: ratService.isProcessCompleted(selectedIndustry, procKey)
            }));
            // Mostrar TODOS los procesos, no solo los activos
            setAllProcesses(allProcessesList);
            
            // Actualizar progreso
            const progress = ratService.getIndustryProgress(selectedIndustry, allProcessesList.length);
            setIndustryProgress(progress);
          }
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Edit />
            Gestionar Procesos - {selectedIndustry ? INDUSTRY_TEMPLATES[selectedIndustry]?.nombre : ''}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedIndustry && (
            <Box sx={{ pt: 2 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>🔧 Personaliza tu RAT:</strong> Activa/desactiva los procesos que necesitas para tu empresa.
                  <br/>
                  <strong>📋 Lista Principal:</strong> Solo muestra procesos ACTIVOS
                  <br/>
                  <strong>⚙️ Este Gestor:</strong> Muestra TODOS los procesos para que puedas activar/desactivar
                </Typography>
              </Alert>
              
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>💡 Diferencia Important:</strong>
                  <br/>• Procesos <strong>ACTIVOS</strong> 🟢 aparecen en tu lista de trabajo
                  <br/>• Procesos <strong>INACTIVOS</strong> 🔴 están ocultos (pero aquí los puedes reactivar)
                </Typography>
              </Alert>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  📊 Resumen de Procesos:
                </Typography>
                <Box sx={{ textAlign: 'right' }}>
                  {(() => {
                    // CRÍTICO: Calcular correctamente activos/inactivos en tiempo real
                    const allProcessKeys = Object.keys(INDUSTRY_TEMPLATES[selectedIndustry].procesos);
                    const activeCount = allProcessKeys.filter(key => ratService.isProcessActive(selectedIndustry, key)).length;
                    const inactiveCount = allProcessKeys.length - activeCount;
                    
                    return (
                      <>
                        <Typography variant="body2" color="success.main">
                          🟢 Activos: {activeCount} (aparecen en lista principal)
                        </Typography>
                        <Typography variant="body2" color="error.main">
                          🔴 Inactivos: {inactiveCount} (ocultos en lista principal)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          📋 Total Disponibles: {allProcessKeys.length} procesos de {INDUSTRY_TEMPLATES[selectedIndustry].nombre}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        {(() => {
                          // NUEVO: Estadísticas de estados RAT
                          const stateStats = {
                            [ratService.RAT_STATES.CREATION]: 0,
                            [ratService.RAT_STATES.MANAGEMENT]: 0,
                            [ratService.RAT_STATES.CERTIFIED]: 0
                          };
                          
                          allProcessKeys.forEach(key => {
                            const state = ratService.getRATState(selectedIndustry, key);
                            stateStats[state]++;
                          });

                          return (
                            <>
                              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary', display: 'block', mt: 0.5 }}>
                                Estados RAT:
                              </Typography>
                              <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#2196f3' }}>
                                📝 Creación: {stateStats[ratService.RAT_STATES.CREATION]}
                              </Typography>
                              <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#ff9800' }}>
                                ⚙️ Gestión: {stateStats[ratService.RAT_STATES.MANAGEMENT]}
                              </Typography>
                              <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#4caf50' }}>
                                🏆 Certificado: {stateStats[ratService.RAT_STATES.CERTIFIED]} (protegidos)
                              </Typography>
                            </>
                          );
                        })()}
                      </>
                    );
                  })()}
                </Box>
              </Box>
              
              <Typography variant="body1" gutterBottom>
                Progreso de Procesos Activos: <strong>{industryProgress.completed}/{industryProgress.total}</strong> completados ({industryProgress.percentage}%)
                {industryProgress.total === 0 && (
                  <Typography component="span" color="warning.main" sx={{ ml: 2 }}>
                    ⚠️ No hay procesos activos - activa al menos uno para comenzar
                  </Typography>
                )}
              </Typography>
              
              <LinearProgress
                variant="determinate"
                value={industryProgress.percentage}
                sx={{ mb: 3, height: 8, borderRadius: 4 }}
              />
              
              {Object.entries(INDUSTRY_TEMPLATES[selectedIndustry].procesos || {}).map(([key, proceso]) => {
                const isActive = ratService.isProcessActive(selectedIndustry, key);
                const isCompleted = ratService.isProcessCompleted(selectedIndustry, key);
                const hasWorkInProgress = !!ratService.getWorkInProgress(selectedIndustry, key);
                
                return (
                  <Box key={key} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box display="flex" alignItems="center" gap={2}>
                        <Switch
                          checked={isActive}
                          onChange={(e) => {
                            ratService.toggleProcessActive(selectedIndustry, key, e.target.checked);
                            // Refrescar progreso
                            const progress = ratService.getIndustryProgress(
                              selectedIndustry, 
                              Object.keys(INDUSTRY_TEMPLATES[selectedIndustry].procesos).length
                            );
                            setIndustryProgress(progress);
                            
                            // CRÍTICO PARA PRESENTACIÓN: Actualizar inmediatamente la lista
                            // Pequeño delay para asegurar que el estado del servicio se actualice primero
                            setTimeout(() => {
                              const allProcessesList = Object.entries(INDUSTRY_TEMPLATES[selectedIndustry].procesos).map(([procKey, proc]) => ({
                                key: procKey,
                                ...proc,
                                isActive: ratService.isProcessActive(selectedIndustry, procKey),
                                isCompleted: ratService.isProcessCompleted(selectedIndustry, procKey)
                              }));
                              
                              // Mostrar TODOS los procesos, activos e inactivos
                              setAllProcesses(allProcessesList);
                              
                              // También resetear el índice si es necesario
                              const activeCount = allProcessesList.filter(p => p.isActive).length;
                              if (activeCount > 0 && currentProcessIndex >= activeCount) {
                                setCurrentProcessIndex(0);
                              }
                            }, 50);
                            
                            setSnackbar({
                              open: true,
                              message: `Proceso "${proceso.nombre}" ${e.target.checked ? 'activado' : 'desactivado'}`,
                              severity: 'success'
                            });
                          }}
                          color="primary"
                        />
                        <Box>
                          <Typography variant="body1" fontWeight={isCompleted ? 600 : 400}>
                            {proceso.nombre}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Base Legal: {proceso.baseLegal} • Conservación: {proceso.conservacion}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box display="flex" gap={1}>
                        {isCompleted && (
                          <Chip 
                            label="✅ Completado" 
                            size="small" 
                            color="success"
                          />
                        )}
                        {hasWorkInProgress && !isCompleted && (
                          <Chip 
                            label="⏳ En Progreso" 
                            size="small" 
                            color="warning"
                          />
                        )}
                        {!isActive && (
                          <Chip 
                            label="🚫 Desactivado" 
                            size="small" 
                            color="default"
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
              
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Nota:</strong> Si desactivas un proceso que ya tiene trabajo en progreso, 
                  no se perderá la información, pero no aparecerá en tu lista activa.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowProgressManager(false)}
            variant="contained"
          >
            Guardar Configuración
          </Button>
        </DialogActions>
      </Dialog>

      {/* Process Edit Dialog */}
      <Dialog 
        open={!!editingProcess} 
        onClose={() => setEditingProcess(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Edit />
            {processEditData.key === 'nuevo' ? 'Crear Nuevo Proceso' : `Editar: ${processEditData.nombre}`}
          </Box>
        </DialogTitle>
        <DialogContent>
          {processEditData && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nombre del Proceso"
                    value={processEditData.nombre || ''}
                    onChange={(e) => setProcessEditData(prev => ({...prev, nombre: e.target.value}))}
                    placeholder="Ej: Gestión de Empleados"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Finalidad del Tratamiento"
                    value={processEditData.finalidad || ''}
                    onChange={(e) => setProcessEditData(prev => ({...prev, finalidad: e.target.value}))}
                    placeholder="Describe para qué se usarán los datos en este proceso..."
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Base Legal</InputLabel>
                    <Select
                      value={processEditData.baseLegal || 'consentimiento'}
                      onChange={(e) => setProcessEditData(prev => ({...prev, baseLegal: e.target.value}))}
                      label="Base Legal"
                    >
                      {basesLegales.map((base) => (
                        <MenuItem key={base.value} value={base.value}>
                          {base.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Período de Conservación"
                    value={processEditData.conservacion || ''}
                    onChange={(e) => setProcessEditData(prev => ({...prev, conservacion: e.target.value}))}
                    placeholder="Ej: 6 años desde fin del contrato"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    multiple
                    options={categoriasTitulares}
                    value={processEditData.categoriasTitulares || []}
                    onChange={(e, value) => setProcessEditData(prev => ({...prev, categoriasTitulares: value}))}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Categorías de Titulares"
                        placeholder="Selecciona categorías..."
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          key={option}
                          label={option}
                          {...getTagProps({ index })}
                          size="small"
                        />
                      ))
                    }
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    multiple
                    options={['identificacion', 'contacto', 'laborales', 'academicos', 'financieros', 'socieconomicos', 'salud', 'biometricos', 'geneticos', 'ideologia']}
                    value={processEditData.categoriasDatos || []}
                    onChange={(e, value) => setProcessEditData(prev => ({...prev, categoriasDatos: value}))}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Categorías de Datos"
                        placeholder="Selecciona tipos de datos..."
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          key={option}
                          label={option}
                          {...getTagProps({ index })}
                          size="small"
                        />
                      ))
                    }
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Fuente de los Datos"
                    value={processEditData.fuenteDatos || ''}
                    onChange={(e) => setProcessEditData(prev => ({...prev, fuenteDatos: e.target.value}))}
                    placeholder="Ej: Formularios web, contratos, terceros autorizados..."
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    multiple
                    options={medidasTecnicas}
                    value={processEditData.medidasTecnicas || []}
                    onChange={(e, value) => setProcessEditData(prev => ({...prev, medidasTecnicas: value}))}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Medidas Técnicas"
                        placeholder="Selecciona medidas..."
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    multiple
                    options={medidasOrganizativas}
                    value={processEditData.medidasOrganizativas || []}
                    onChange={(e, value) => setProcessEditData(prev => ({...prev, medidasOrganizativas: value}))}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Medidas Organizativas"
                        placeholder="Selecciona medidas..."
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Box display="flex" gap={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={processEditData.transferenciasInternacionales || false}
                          onChange={(e) => setProcessEditData(prev => ({...prev, transferenciasInternacionales: e.target.checked}))}
                        />
                      }
                      label="¿Transferencias Internacionales?"
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={processEditData.decisionesAutomatizadas || false}
                          onChange={(e) => setProcessEditData(prev => ({...prev, decisionesAutomatizadas: e.target.checked}))}
                        />
                      }
                      label="¿Decisiones Automatizadas?"
                    />
                  </Box>
                </Grid>
                
                {processEditData.transferenciasInternacionales && (
                  <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      options={['Estados Unidos', 'España', 'Argentina', 'Perú', 'Brasil', 'Reino Unido', 'Francia', 'Alemania', 'Singapur', 'Otro']}
                      value={processEditData.paisesDestino || []}
                      onChange={(e, value) => setProcessEditData(prev => ({...prev, paisesDestino: value}))}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Países de Destino"
                          placeholder="Selecciona países..."
                        />
                      )}
                    />
                  </Grid>
                )}
                
                {processEditData.decisionesAutomatizadas && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Lógica de Decisión"
                        value={processEditData.logicaDecision || ''}
                        onChange={(e) => setProcessEditData(prev => ({...prev, logicaDecision: e.target.value}))}
                        placeholder="Describe el algoritmo o lógica utilizada..."
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Consecuencias para el Titular"
                        value={processEditData.consecuenciasDecision || ''}
                        onChange={(e) => setProcessEditData(prev => ({...prev, consecuenciasDecision: e.target.value}))}
                        placeholder="Qué efectos tiene esta decisión automática..."
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingProcess(null)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              // Actualizar o crear proceso
              if (processEditData.key === 'nuevo') {
                // Generar nuevo ID
                const newKey = `custom_${Date.now()}`;
                const updatedTemplate = {
                  ...INDUSTRY_TEMPLATES[selectedIndustry],
                  procesos: {
                    ...INDUSTRY_TEMPLATES[selectedIndustry].procesos,
                    [newKey]: {
                      ...processEditData,
                      key: newKey
                    }
                  }
                };
                
                // Actualizar template localmente (nota: en producción esto se guardaria en backend)
                INDUSTRY_TEMPLATES[selectedIndustry] = updatedTemplate;
                
                // Marcar el nuevo proceso como activo por defecto
                ratService.toggleProcessActive(selectedIndustry, newKey, true);
                
                // Actualizar el progreso con el nuevo total de procesos
                const newTotalProcesses = Object.keys(updatedTemplate.procesos).length;
                const updatedProgress = ratService.getIndustryProgress(selectedIndustry, newTotalProcesses);
                setIndustryProgress(updatedProgress);
                
                // IMPORTANTE: Actualizar la lista de procesos activos para mostrar el nuevo proceso
                const allProcessesList = Object.entries(updatedTemplate.procesos).map(([procKey, proc]) => ({
                  key: procKey,
                  ...proc,
                  isActive: ratService.isProcessActive(selectedIndustry, procKey),
                  isCompleted: ratService.isProcessCompleted(selectedIndustry, procKey)
                }));
                
                // Mostrar TODOS los procesos en la lista principal
                setAllProcesses(allProcessesList);
                
                setSnackbar({
                  open: true,
                  message: `✅ Proceso "${processEditData.nombre}" creado exitosamente y agregado a la lista`,
                  severity: 'success'
                });
              } else {
                // Actualizar proceso existente
                INDUSTRY_TEMPLATES[selectedIndustry].procesos[processEditData.key] = processEditData;
                
                // Recalcular progreso por si cambió algo
                const totalProcesses = Object.keys(INDUSTRY_TEMPLATES[selectedIndustry].procesos).length;
                const updatedProgress = ratService.getIndustryProgress(selectedIndustry, totalProcesses);
                setIndustryProgress(updatedProgress);
                
                // Actualizar la lista de procesos por si cambiaron los datos
                const allProcessesList = Object.entries(INDUSTRY_TEMPLATES[selectedIndustry].procesos).map(([procKey, proc]) => ({
                  key: procKey,
                  ...proc,
                  isActive: ratService.isProcessActive(selectedIndustry, procKey),
                  isCompleted: ratService.isProcessCompleted(selectedIndustry, procKey)
                }));
                
                // Mostrar TODOS los procesos en la lista principal
                setAllProcesses(allProcessesList);
                
                setSnackbar({
                  open: true,
                  message: `✅ Proceso "${processEditData.nombre}" actualizado exitosamente`,
                  severity: 'success'
                });
              }
              
              setEditingProcess(null);
              setProcessEditData({});
            }}
            startIcon={<Save />}
          >
            {processEditData.key === 'nuevo' ? 'Crear Proceso' : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar mejorado con acciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.showActions ? 15000 : 6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ minWidth: 400 }}
          action={
            snackbar.showActions && snackbar.ratId ? (
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button 
                  color="inherit" 
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    window.location.href = `/consolidado-rat?highlight=${snackbar.ratId}`;
                  }}
                  startIcon={<Visibility />}
                >
                  Ver RAT
                </Button>
                <Button 
                  color="inherit" 
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    window.location.href = `/evaluacion-impacto?rat=${snackbar.ratId}`;
                  }}
                  startIcon={<Assessment />}
                >
                  Crear EIPD
                </Button>
              </Box>
            ) : null
          }
        >
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">
              {snackbar.message}
            </Typography>
            {snackbar.showActions && (
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                📋 RAT guardado con ID: {snackbar.ratId}
              </Typography>
            )}
          </Box>
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RATProduccion;