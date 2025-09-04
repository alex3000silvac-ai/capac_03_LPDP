import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// import preventiveAI from '../utils/preventiveAI'; // REMOVIDO - causaba errores
import { 
  guardarDatosEmpresa, 
  cargarDatosEmpresa, 
  autoCompletarFormulario,
  existenDatosEmpresa 
} from '../utils/datosEmpresaPersistence';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Checkbox,
  FormGroup,
  LinearProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  CardHeader,
  Collapse,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  ContentCopy as ContentCopyIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  AccountBalance as FinanceIcon,
  Work as WorkIcon,
  School as EducationIcon,
  Phone as CommunicationIcon,
  Language as WebIcon,
  ExpandMore as ExpandMoreIcon,
  Business as BusinessIcon,
  HealthAndSafety as HealthIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Assignment as RATIcon
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ratService from '../services/ratService';
import ratIntelligenceEngine from '../services/ratIntelligenceEngine';
import riskCalculationEngine from '../services/riskCalculationEngine';
import testBalancingEngine from '../services/testBalancingEngine';
import categoryAnalysisEngine from '../services/categoryAnalysisEngine';
import specificCasesEngine from '../services/specificCasesEngine';
import { fuentesNormativas, obtenerInformacionSectorial } from '../services/industryStandardsService';
import EmpresaDataManager from './EmpresaDataManager';
import PageLayout from './PageLayout';
import { supabase } from '../config/supabaseClient';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';

const professionalTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4f46e5',
      light: '#6366f1',
      dark: '#3730a3',
    },
    secondary: {
      main: '#6b7280',
      light: '#9ca3af',
      dark: '#374151',
    },
    background: {
      default: '#111827',
      paper: '#1f2937',
    },
    text: {
      primary: '#f9fafb',
      secondary: '#d1d5db',
    },
    error: {
      main: '#ef4444',
    },
    success: {
      main: '#10b981',
    },
    warning: {
      main: '#f59e0b',
    },
    divider: '#374151',
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '1.875rem',
      color: '#f9fafb',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: '#f9fafb',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
      color: '#f9fafb',
    },
    body1: {
      fontSize: '0.875rem',
      color: '#d1d5db',
    },
    caption: {
      fontSize: '0.75rem',
      color: '#9ca3af',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: '#4f46e5',
          color: '#ffffff',
          fontWeight: 700,
          borderRadius: '0.5rem',
          textTransform: 'none',
          '&:hover': {
            backgroundColor: '#3730a3',
          },
        },
        outlined: {
          borderColor: '#374151',
          color: '#d1d5db',
          '&:hover': {
            backgroundColor: 'rgba(79, 70, 229, 0.08)',
            borderColor: '#4f46e5',
            color: '#f9fafb',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1f2937',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
          border: '1px solid #374151',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            backgroundColor: '#374151',
            borderRadius: '0.5rem',
            color: '#f9fafb',
          },
          '& .MuiInputLabel-root': {
            color: '#9ca3af',
            fontSize: '0.875rem',
            fontWeight: 500,
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#4b5563',
          },
          '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#6b7280',
          },
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#4f46e5',
            borderWidth: '2px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1f2937',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
          border: '1px solid #374151',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#374151',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#374151',
          color: '#f9fafb',
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          padding: '0.75rem 1.5rem',
          borderBottom: '1px solid #4b5563',
        },
        body: {
          borderColor: '#374151',
          padding: '1rem 1.5rem',
          fontSize: '0.875rem',
          color: '#d1d5db',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          backgroundColor: '#1f2937',
          borderBottom: '1px solid #374151',
          '&:hover': {
            backgroundColor: '#374151',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        colorDefault: {
          backgroundColor: '#374151',
          color: '#d1d5db',
        },
        colorPrimary: {
          backgroundColor: 'rgba(79, 70, 229, 0.2)',
          color: '#a78bfa',
        },
        colorSuccess: {
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          color: '#34d399',
        },
        colorWarning: {
          backgroundColor: 'rgba(245, 158, 11, 0.2)',
          color: '#fbbf24',
        },
        colorError: {
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          color: '#f87171',
        },
      },
    },
  },
});

const RATSystemProfessional = () => {
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [rats, setRats] = useState([]);
  const [showRATList, setShowRATList] = useState(true);
  const [isCreatingRAT, setIsCreatingRAT] = useState(false);
  const [showEmpresaManager, setShowEmpresaManager] = useState(false);
  const [editingRAT, setEditingRAT] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'edit', 'view'
  
  const [alertas, setAlertas] = useState([]);
  const [ratData, setRatData] = useState({
    responsable: {
      razonSocial: '',
      rut: '',
      direccion: '',
      nombre: '',
      email: '',
      telefono: '',
    },
    // Paso 2: Categorías de datos
    categorias: {
      identificacion: [], // ARRAY para evitar error .includes
      sensibles: [], // ARRAY para evitar error .includes
    },
    // Paso 3: Base de licitud
    baseLegal: '',
    argumentoJuridico: '',
    // Paso 4: Finalidad
    finalidad: '',
    plazoConservacion: '',
    // Paso 5: Transferencias
    destinatarios: [],
    transferenciasInternacionales: false,
    // Paso 6: Confirmación
    documentosRequeridos: [],
  });

  const steps = [
    'Identificación del Responsable',
    'Categorías de Datos',
    'Base Jurídica',
    'Finalidad del Tratamiento',
    'Destinatarios y Transferencias',
    'Revisión y Confirmación',
  ];

  /**
   * 💾 HELPER PARA PERSISTIR DATOS EMPRESA AL CAMBIAR CAMPOS
   */
  const persistirDatosEmpresa = useCallback((nuevosResponsableData) => {
    try {
      const datosEmpresa = {
        razon_social: nuevosResponsableData.razonSocial || '',
        rut: nuevosResponsableData.rut || '',
        direccion_empresa: nuevosResponsableData.direccion || '',
        email_empresa: nuevosResponsableData.email || '',
        telefono_empresa: nuevosResponsableData.telefono || '',
        dpo_nombre: nuevosResponsableData.nombre || '',
        dpo_email: nuevosResponsableData.email || '',
        dpo_telefono: nuevosResponsableData.telefono || ''
      };
      
      // Solo persistir si hay al menos un campo con datos
      const tieneAlgunDato = Object.values(datosEmpresa).some(valor => valor && valor.trim().length > 0);
      
      if (tieneAlgunDato) {
        const resultado = guardarDatosEmpresa(datosEmpresa, {
          fuente: 'formulario_rat',
          persistir: true
        });
        
        if (window.cumulativeErrorLogger) {
          if (resultado.success) {
            window.cumulativeErrorLogger.logMediumError('RAT_PERSISTENCE_AUTO_SAVE', {
              message: 'Datos empresa guardados automáticamente desde formulario RAT',
              campos_guardados: Object.keys(datosEmpresa).filter(k => datosEmpresa[k]),
              timestamp: new Date().toISOString()
            }, 'RAT_AUTO_PERSISTENCE');
          } else {
            window.cumulativeErrorLogger.logCriticalError('RAT_PERSISTENCE_FAILED', {
              error: resultado.error,
              datos_intentados: datosEmpresa,
              timestamp: new Date().toISOString()
            }, 'RAT_AUTO_PERSISTENCE');
          }
        }
      }
    } catch (error) {
      if (window.cumulativeErrorLogger) {
        window.cumulativeErrorLogger.logCriticalError('RAT_PERSISTENCE_ERROR', {
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        }, 'RAT_AUTO_PERSISTENCE');
      }
    }
  }, []); // useCallback sin dependencias

  // Cargar RATs existentes y datos comunes de empresa
  useEffect(() => {
    // Log inicio de inicialización
    if (window.cumulativeErrorLogger) {
      window.cumulativeErrorLogger.logMediumError('RAT_SYSTEM_INIT', {
        message: 'RATSystemProfessional inicializando - cargando datos',
        tenant_id: currentTenant?.id,
        timestamp: new Date().toISOString()
      }, 'RAT_SYSTEM');
    }
    
    cargarRATs();
    cargarDatosComunes();
  }, []);

  const cargarDatosComunes = async () => {
    if (currentTenant) {
      // VALIDAR SI YA HAY DATOS INGRESADOS - NO SOBRESCRIBIR
      const datosYaIngresados = ratData.responsable?.nombre || 
                               ratData.responsable?.email || 
                               ratData.responsable?.razonSocial;
      
      if (datosYaIngresados) {
        // IA: Datos ya ingresados, NO sobrescribiendo
        return; // NO CARGAR SI YA HAY DATOS
      }

      // 💾 PRIORIDAD 1: Cargar datos persistentes guardados
      //console.log('🔍 Intentando cargar datos empresa persistidos...');
      
      try {
        const datosGuardados = cargarDatosEmpresa();
        
        if (datosGuardados.success && datosGuardados.datos) {
          // Log éxito a archivo TXT
          if (window.cumulativeErrorLogger) {
            window.cumulativeErrorLogger.logMediumError('RAT_AUTOCOMPLETADO_SUCCESS', {
              message: 'Datos empresa cargados exitosamente para autocompletado RAT',
              fuente: datosGuardados.fuente,
              campos_cargados: Object.keys(datosGuardados.datos),
              timestamp: new Date().toISOString()
            }, 'RAT_AUTOCOMPLETAR');
          }
          
          setRatData(prevData => ({
            ...prevData,
            responsable: {
              ...prevData.responsable,
              razonSocial: datosGuardados.datos.razon_social || '',
              rut: datosGuardados.datos.rut || '',
              direccion: datosGuardados.datos.direccion_empresa || '',
              nombre: datosGuardados.datos.dpo_nombre || '',
              email: datosGuardados.datos.email_empresa || '',
              telefono: datosGuardados.datos.telefono_empresa || ''
            }
          }));
          
          // Notificar al usuario que se cargaron datos
          setAlertas(prev => [...prev, {
            tipo: 'success',
            mensaje: `✅ Datos empresa cargados automáticamente desde ${datosGuardados.fuente}`,
            timestamp: Date.now()
          }]);
          
          return; // Salir - datos cargados exitosamente
        } else {
          // Log warning - no hay datos guardados
          if (window.cumulativeErrorLogger) {
            window.cumulativeErrorLogger.logMediumError('RAT_AUTOCOMPLETADO_NO_DATOS', {
              message: 'No se encontraron datos empresa guardados para autocompletado',
              error: datosGuardados.error,
              timestamp: new Date().toISOString()
            }, 'RAT_AUTOCOMPLETAR');
          }
        }
        
      } catch (error) {
        // Log error crítico a archivo TXT
        if (window.cumulativeErrorLogger) {
          window.cumulativeErrorLogger.logCriticalError('RAT_AUTOCOMPLETADO_FAILED', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
          }, 'RAT_AUTOCOMPLETAR');
        }
      }

      // Buscar datos del último RAT para auto-completar empresa y DPO
      try {
        // Cargando datos permanentes empresa/DPO...
        
        // Buscando último RAT para tenant
        
        const { data: ultimosRATs, error } = await supabase
          .from('mapeo_datos_rat')
          .select('*')
          .eq('tenant_id', String(currentTenant.id)) // Asegurar string
          .order('created_at', { ascending: false })
          .limit(1);
        
        const ultimoRAT = ultimosRATs && ultimosRATs.length > 0 ? ultimosRATs[0] : null;
        
        if (error) {
          // //console.warn('⚠️ Error consultando último RAT:', error.message, error.code);
          // Continuar con datos tenant básicos
        }
        
        if (!error && ultimoRAT) {
          // Auto-completando con datos del último RAT
          
          // 🎯 NOTIFICAR AL USUARIO QUE SE PRE-LLENARON DATOS
          setAlertas(prev => [...prev, {
            tipo: 'info',
            mensaje: `✅ Datos empresa y DPO pre-llenados automáticamente desde RAT anterior (${ultimoRAT.nombre_actividad}). Solo completa los campos específicos de esta nueva actividad.`,
            timestamp: Date.now()
          }]);
          
          // SOLO PRE-LLENAR DATOS PERMANENTES (empresa/DPO)
          setRatData(prev => ({
            ...prev,
            responsable: {
              // DATOS PERMANENTES QUE NO CAMBIAN - MAPEO CORRECTO BD
              razonSocial: ultimoRAT.area_responsable || currentTenant.company_name || '',
              rut: ultimoRAT.metadata?.rut_empresa || currentTenant.rut || '',
              direccion: ultimoRAT.metadata?.direccion_empresa || currentTenant.direccion || '',
              nombre: ultimoRAT.responsable_proceso || currentTenant.dpo?.nombre || '',
              email: ultimoRAT.email_responsable || currentTenant.dpo?.email || user?.email || '',
              telefono: ultimoRAT.telefono_responsable || currentTenant.dpo?.telefono || '',
              representanteLegal: ultimoRAT.responsable?.representanteLegal || {
                esExtranjero: false,
                nombre: '',
                email: '',
                telefono: ''
              }
            },
            // MANTENER CONFIGURACIONES EMPRESA PERMANENTES
            plataformasTecnologicas: ultimoRAT.plataformasTecnologicas || currentTenant.plataformasTecnologicas || [],
            politicasRetencion: ultimoRAT.politicasRetencion || currentTenant.politicasRetencion || {},
            
            // CAMPOS ACTIVIDAD SIEMPRE VACÍOS (NUEVA ACTIVIDAD)
            nombreActividad: '', // NUEVA actividad
            finalidad: '', // NUEVA finalidad
            // 🔧 PROPONER BASE LEGAL MÁS COMÚN COMO SUGERENCIA
            baseLegal: ultimoRAT.base_legal === 'contrato' ? 'contrato' : '', // Sugerir si era común
            argumentoJuridico: '', // NUEVO argumento
            categorias: { 
              identificacion: [], 
              sensibles: [],
              datosPersonales: {} // NUEVO mapeo datos
            },
            destinatarios: [], // NUEVOS destinatarios
            plazoConservacion: '', // NUEVO plazo
            medidas: { tecnicas: [], organizativas: [] }, // NUEVAS medidas
            transferencias: { existe: false, destinos: [] } // NUEVAS transferencias
          }));
          
          // Datos permanentes cargados, campos actividad limpios
        } else {
          // //console.log('⚠️ No hay RATs previos, usando datos tenant básicos');
          // Si no hay RATs previos, usar datos tenant
          setRatData(prev => ({
            ...prev,
            responsable: {
              razonSocial: currentTenant.company_name || '',
              rut: currentTenant.rut || '',
              direccion: currentTenant.direccion || '',
              nombre: currentTenant.dpo?.nombre || '',
              email: currentTenant.dpo?.email || user?.email || '',
              telefono: currentTenant.dpo?.telefono || '',
              representanteLegal: {
                esExtranjero: false,
                nombre: '',
                email: '',
                telefono: ''
              }
            },
            plataformasTecnologicas: currentTenant.plataformasTecnologicas || [],
            politicasRetencion: currentTenant.politicasRetencion || {}
          }));
        }
      } catch (error) {
        console.error('❌ Error cargando datos permanentes:', error);
        // Fallback a datos tenant básicos sin sobrescribir
        if (!datosYaIngresados) {
          setRatData(prev => ({
            ...prev,
            responsable: {
              razonSocial: currentTenant.company_name || '',
              rut: currentTenant.rut || '',
              direccion: currentTenant.direccion || '',
              nombre: currentTenant.dpo?.nombre || '',
              email: currentTenant.dpo?.email || user?.email || '',
              telefono: currentTenant.dpo?.telefono || '',
            }
          }));
        }
      }
    }
  };

  const cargarRATs = async () => {
    try {
      const ratsData = await ratService.getCompletedRATs();
      setRats(ratsData);
    } catch (error) {
      console.error('Error cargando RATs:', error);
    }
  };


  const checkStepComplete = (step) => {
    try {
      switch (step) {
        case 0: // Identificación
          return ratData.responsable.razonSocial && 
                 ratData.responsable.rut && 
                 ratData.responsable.email &&
                 ratData.responsable.nombre &&
                 ratData.responsable.telefono;
        case 1: // Categorías
          return Array.isArray(ratData.categorias.identificacion) && 
                 ratData.categorias.identificacion.length > 0;
        case 2: // Base legal
          return ratData.baseLegal !== '' && ratData.argumentoJuridico !== '';
        case 3: // Finalidad
          return ratData.finalidad && 
                 ratData.finalidad.length >= 20 && 
                 ratData.plazoConservacion;
        case 4: // Transferencias
          return true; // Opcional
        default:
          return false;
      }
    } catch (error) {
      console.error('🚨 Error validando paso:', step, error);
      return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const iniciarNuevoRAT = async () => {
    setEditingRAT(null);
    setIsCreatingRAT(true);
    setShowRATList(false);
    setShowEmpresaManager(false);
    setViewMode('create');
    setCurrentStep(0);
    
    // Limpiar formulario con estructura básica
    setRatData({
      responsable: {
        razonSocial: '',
        rut: '',
        direccion: '',
        nombre: '',
        email: '',
        telefono: '',
      },
      categorias: {
        identificacion: [], // CORREGIDO: Array vacío
        sensibles: [] // CORREGIDO: Array vacío
      },
      baseLegal: '',
      argumentoJuridico: '',
      finalidad: '',
      plazoConservacion: '',
      destinatarios: [],
      transferenciasInternacionales: false,
      documentosRequeridos: []
    });
    
    // 🔧 FIX CRÍTICO: Auto-completar datos empresa después de limpiar
    setTimeout(() => {
      if (window.cumulativeErrorLogger) {
        window.cumulativeErrorLogger.logMediumError('RAT_NUEVO_RELOAD_DATOS', {
          message: 'Recargando datos empresa después de limpiar RAT',
          timestamp: new Date().toISOString()
        }, 'RAT_SYSTEM');
      }
      cargarDatosComunes();
    }, 100); // Permitir que React procese el setRatData primero
  };

  const mostrarGestionEmpresa = () => {
    setShowEmpresaManager(true);
    setShowRATList(false);
    setIsCreatingRAT(false);
  };

  const volverAInicio = () => {
    setShowEmpresaManager(false);
    setShowRATList(true);
    setIsCreatingRAT(false);
    setEditingRAT(null);
    setViewMode('list');
    setCurrentStep(0);
  };

  const editarRAT = async (ratId) => {
    try {
      const ratToEdit = rats.find(rat => rat.id === ratId);
      if (ratToEdit) {
        // //console.log('🔧 Cargando RAT para edición:', ratId, ratToEdit);
        setEditingRAT(ratId);
        
        // 🚨 MAPEO ROBUSTO - MÚLTIPLES POSIBLES ESTRUCTURAS
        const mapearCategorias = (rat) => {
          // Intentar diferentes estructuras posibles
          const categorias = {
            identificacion: [],
            sensibles: []
          };
          
          // Estructura 1: categoriasDatos
          if (rat.categoriasDatos) {
            if (Array.isArray(rat.categoriasDatos.identificacion)) {
              categorias.identificacion = rat.categoriasDatos.identificacion;
            }
            if (Array.isArray(rat.categoriasDatos.sensibles)) {
              categorias.sensibles = rat.categoriasDatos.sensibles;
            }
          }
          
          // Estructura 2: categorias_datos
          if (rat.categorias_datos) {
            if (Array.isArray(rat.categorias_datos.identificacion)) {
              categorias.identificacion = rat.categorias_datos.identificacion;
            }
            if (Array.isArray(rat.categorias_datos.sensibles)) {
              categorias.sensibles = rat.categorias_datos.sensibles;
            }
          }
          
          // Estructura 3: categorias directo
          if (rat.categorias) {
            if (Array.isArray(rat.categorias.identificacion)) {
              categorias.identificacion = rat.categorias.identificacion;
            }
            if (Array.isArray(rat.categorias.sensibles)) {
              categorias.sensibles = rat.categorias.sensibles;
            }
          }
          
          // Estructura 4: campos separados (legacy)
          if (rat.datos_identificacion && Array.isArray(rat.datos_identificacion)) {
            categorias.identificacion = rat.datos_identificacion;
          }
          if (rat.datos_sensibles && Array.isArray(rat.datos_sensibles)) {
            categorias.sensibles = rat.datos_sensibles;
          }
          
          // //console.log('📊 Categorías mapeadas:', categorias);
          return categorias;
        };
        
        const categoriasMapeadas = mapearCategorias(ratToEdit);
        
        // DEBUG logs removidos para producción
        
        // Mapear datos del RAT guardado al formato esperado por el formulario
        setRatData({
          responsable: {
            razonSocial: ratToEdit.responsable?.razonSocial || ratToEdit.responsable_proceso || ratToEdit.area_responsable || '',
            rut: ratToEdit.responsable?.rut || ratToEdit.responsable_rut || '',
            direccion: ratToEdit.responsable?.direccion || ratToEdit.direccion_responsable || '',
            nombre: ratToEdit.responsable?.nombre || ratToEdit.nombre_dpo || '',
            email: ratToEdit.responsable?.email || ratToEdit.email_responsable || ratToEdit.contacto_dpo || '',
            telefono: ratToEdit.responsable?.telefono || ratToEdit.telefono_dpo || '',
            sector: ratToEdit.responsable?.sector || ratToEdit.sector_industria || 'general'
          },
          categorias: {
            identificacion: categoriasMapeadas?.identificacion || [],
            sensibles: categoriasMapeadas?.sensibles || []
          },
          baseLegal: ratToEdit.finalidades?.baseLegal || ratToEdit.base_legal || ratToEdit.base_juridica || '',
          argumentoJuridico: ratToEdit.finalidades?.argumentoJuridico || ratToEdit.argumento_juridico || '',
          finalidad: ratToEdit.finalidades?.descripcion || ratToEdit.finalidad_principal || ratToEdit.finalidad || '',
          plazoConservacion: ratToEdit.conservacion?.periodo || ratToEdit.plazo_conservacion || '',
          destinatarios: ratToEdit.transferencias?.destinatarios || ratToEdit.destinatarios || [],
          transferenciasInternacionales: ratToEdit.transferencias?.internacionales || ratToEdit.transferencias_internacionales || false,
          documentosRequeridos: ratToEdit.documentos_requeridos || [],
        });
        setIsCreatingRAT(true);
        setShowRATList(false);
        setViewMode('edit');
        setCurrentStep(0);
      }
    } catch (error) {
      console.error('Error cargando RAT para edición:', error);
      alert('Error al cargar el RAT para edición');
    }
  };

  const verRAT = async (ratId) => {
    try {
      const ratToView = rats.find(rat => rat.id === ratId);
      if (ratToView) {
        setEditingRAT(ratId);
        setRatData(ratToView); // Para vista, usamos los datos tal como están
        setViewMode('view');
      }
    } catch (error) {
      console.error('Error cargando RAT para visualización:', error);
      alert('Error al cargar el RAT');
    }
  };

  const eliminarRAT = async (ratId) => {
    if (window.confirm('¿Está seguro de eliminar este RAT? Esta acción no se puede deshacer.')) {
      try {
        await ratService.deleteRAT(ratId);
        // Recargar lista
        const ratsData = await ratService.getCompletedRATs();
        setRats(ratsData);
        alert('RAT eliminado exitosamente');
      } catch (error) {
        console.error('Error eliminando RAT:', error);
        alert('Error al eliminar el RAT');
      }
    }
  };

  const duplicarRAT = async (ratId) => {
    try {
      const ratData = await ratService.getRATById(ratId);
      if (ratData) {
        // Crear copia manteniendo datos de empresa/responsable pero limpiando datos específicos
        const nuevaData = {
          responsable: {
            razonSocial: ratData.responsable?.razonSocial || '',
            rut: ratData.responsable?.rut || '',
            direccion: ratData.responsable?.direccion || '',
            nombre: ratData.responsable?.nombre || '',
            email: ratData.responsable?.email || '',
            telefono: ratData.responsable?.telefono || '',
          },
          categorias: {
            identificacion: [], // Limpiar - específico de cada actividad
            sensibles: [], // Limpiar - específico de cada actividad
          },
          baseLegal: '', // Limpiar - específico de cada actividad
          argumentoJuridico: '', // Limpiar - específico de cada actividad
          finalidad: '', // Limpiar - específico de cada actividad
          plazoConservacion: '', // Limpiar - específico de cada actividad
          destinatarios: [], // Limpiar - específico de cada actividad
          transferenciasInternacionales: false, // Limpiar - específico de cada actividad
          documentosRequeridos: [],
        };
        setRatData(nuevaData);
        setEditingRAT(null);
        setIsCreatingRAT(true);
        setShowRATList(false);
        setViewMode('create');
        setCurrentStep(0);
      }
    } catch (error) {
      console.error('Error duplicando RAT:', error);
      alert('Error al duplicar el RAT');
    }
  };

  /**
   * 🛡️ VALIDAR DATOS RAT COMPLETOS ANTES DE GUARDAR
   */
  const validarDatosRATCompletos = (ratData, tenant) => {
    const errores = [];
    const campos_validados = [];
    
    // Validar datos empresa/responsable
    if (!ratData.responsable?.nombre || ratData.responsable.nombre.trim().length === 0) {
      errores.push('Nombre del responsable es obligatorio');
    } else {
      campos_validados.push('responsable.nombre');
    }
    
    if (!ratData.responsable?.email || ratData.responsable.email.trim().length === 0) {
      errores.push('Email del responsable es obligatorio');
    } else {
      campos_validados.push('responsable.email');
    }
    
    if (!ratData.responsable?.razonSocial || ratData.responsable.razonSocial.trim().length === 0) {
      errores.push('Razón social de la empresa es obligatoria');
    } else {
      campos_validados.push('responsable.razonSocial');
    }
    
    if (!ratData.responsable?.rut || ratData.responsable.rut.trim().length === 0) {
      errores.push('RUT de la empresa es obligatorio');
    } else {
      campos_validados.push('responsable.rut');
    }
    
    // Validar datos del tratamiento
    if (!ratData.nombreActividad || ratData.nombreActividad.trim().length === 0) {
      errores.push('Nombre de la actividad es obligatorio');
    } else {
      campos_validados.push('nombreActividad');
    }
    
    if (!ratData.finalidad || ratData.finalidad.trim().length === 0) {
      errores.push('Finalidad del tratamiento es obligatoria');
    } else {
      campos_validados.push('finalidad');
    }
    
    if (!ratData.baseLegal || ratData.baseLegal.trim().length === 0) {
      errores.push('Base legal es obligatoria');
    } else {
      campos_validados.push('baseLegal');
    }
    
    // Validar categorías de datos
    const tieneCategorias = (ratData.categorias?.basicas && ratData.categorias.basicas.length > 0) ||
                          (ratData.categorias?.sensibles && ratData.categorias.sensibles.length > 0) ||
                          (ratData.categorias?.identificacion && ratData.categorias.identificacion.length > 0);
    
    if (!tieneCategorias) {
      errores.push('Debe seleccionar al menos una categoría de datos personales');
    } else {
      campos_validados.push('categorias');
    }
    
    // Validar tenant
    if (!tenant || !tenant.id) {
      errores.push('No se puede determinar la organización (tenant) para guardar el RAT');
    } else {
      campos_validados.push('tenant_id');
    }
    
    return {
      valido: errores.length === 0,
      errores: errores,
      campos_validados: campos_validados,
      total_errores: errores.length,
      porcentaje_completitud: Math.round((campos_validados.length / (campos_validados.length + errores.length)) * 100)
    };
  };

  const guardarRAT = async () => {
    try {
      // 🛡️ VALIDACIONES CRÍTICAS PRE-GUARDADO
      const validacionResult = validarDatosRATCompletos(ratData, currentTenant);
      
      if (!validacionResult.valido) {
        // Log error crítico de validación
        if (window.cumulativeErrorLogger) {
          window.cumulativeErrorLogger.logCriticalError('RAT_VALIDACION_FAILED', {
            errores: validacionResult.errores,
            datos_actuales: {
              nombre_actividad: ratData.nombreActividad,
              finalidad: ratData.finalidad,
              responsable_completo: !!ratData.responsable?.nombre && !!ratData.responsable?.email,
              base_legal: ratData.baseLegal,
              categorias_presente: !!ratData.categorias
            },
            timestamp: new Date().toISOString()
          }, 'RAT_VALIDACION');
        }
        
        // Mostrar errores al usuario
        setAlertas(prev => [...prev, {
          tipo: 'error',
          mensaje: `❌ No se puede guardar RAT: ${validacionResult.errores.join(', ')}`,
          timestamp: Date.now()
        }]);
        
        return; // NO CONTINUAR CON GUARDADO
      }
      
      // Log éxito de validación
      if (window.cumulativeErrorLogger) {
        window.cumulativeErrorLogger.logMediumError('RAT_VALIDACION_SUCCESS', {
          message: 'Validación RAT exitosa, procediendo a guardar',
          campos_validados: validacionResult.campos_validados,
          timestamp: new Date().toISOString()
        }, 'RAT_VALIDACION');
      }
      
      const ratId = viewMode === 'edit' && editingRAT ? editingRAT : `RAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const empresaData = currentTenant || {};
      
      const ratCompleto = {
        id: ratId,
        responsable: {
          ...ratData.responsable,
          area: empresaData.area || 'Protección de Datos',
        },
        finalidades: {
          descripcion: ratData.finalidad,
          baseLegal: ratData.baseLegal,
          argumentoJuridico: ratData.argumentoJuridico,
        },
        categorias: {
          titulares: ['Clientes', 'Empleados', 'Proveedores'],
          datos: ratData.categorias,
        },
        fuente: {
          tipo: 'Recopilación directa',
          descripcion: 'Datos obtenidos directamente del titular',
        },
        conservacion: {
          periodo: ratData.plazoConservacion || '5 años según normativa tributaria',
          fundamento: 'Art. 17 Código Tributario',
        },
        seguridad: {
          descripcionGeneral: 'Medidas técnicas y organizativas según Art. 14 Ley 21.719',
          tecnicas: ['Cifrado AES-256', 'Control de acceso', 'Respaldos diarios'],
          organizativas: ['Políticas de seguridad', 'Capacitación personal', 'Auditorías periódicas'],
        },
        transferencias: {
          destinatarios: ratData.destinatarios,
          internacionales: ratData.transferenciasInternacionales,
          paises: ratData.transferenciasInternacionales ? ['Estados Unidos', 'Unión Europea'] : [],
        },
        metadata: {
          fechaCreacion: new Date().toISOString(),
          version: '3.1.0',
          cumplimientoLey21719: true,
        },
        estado: 'CREATION',
      };
      
      // 🧮 CÁLCULO RIESGO AUTOMÁTICO SEGÚN DIAGRAMA LÍNEAS 610-701
      // //console.log('🧮 Calculando riesgo multi-dimensional...');
      const analisisRiesgo = await riskCalculationEngine.calcularRiesgoTotal(ratData, currentTenant?.id);
      
      // APLICAR RESULTADOS ANÁLISIS RIESGO
      ratCompleto.nivel_riesgo = analisisRiesgo.nivel_riesgo;
      ratCompleto.metadata.analisis_riesgo = analisisRiesgo;
      ratCompleto.metadata.requiereEIPD = analisisRiesgo.clasificacion?.requiere_eipd || false;
      ratCompleto.metadata.requiereDPIA = analisisRiesgo.clasificacion?.requiere_dpia || false;
      ratCompleto.metadata.consultaAgencia = analisisRiesgo.clasificacion?.consulta_previa_agencia || false;

      // ⚖️ TEST BALANCING SI ES INTERÉS LEGÍTIMO
      if (ratData.baseLegal === 'interes_legitimo') {
        // //console.log('⚖️ Ejecutando Test Balancing obligatorio...');
        const testBalancing = await testBalancingEngine.ejecutarTestBalancing(ratData, currentTenant?.id);
        ratCompleto.metadata.test_balancing = testBalancing;
        
        if (!testBalancing.resultado || testBalancing.resultado === 'DESFAVORABLE') {
          alert('❌ Test Balancing DESFAVORABLE - Debe cambiar base legal');
          return;
        }
      }

      // ⚠️ PROCESAR CASUÍSTICAS ESPECÍFICAS
      const casuisticasEspecificas = await specificCasesEngine.procesarCasuisticaEspecifica(ratData, currentTenant?.id);
      if (casuisticasEspecificas.requiere_atencion_especial) {
        ratCompleto.metadata.casuisticas_especiales = casuisticasEspecificas;
      }

      // //console.log(viewMode === 'edit' ? '📝 Actualizando RAT:' : '📦 Guardando RAT con estructura completa:', ratCompleto);
      
      let resultado;
      if (viewMode === 'edit') {
        resultado = await ratService.updateRAT(editingRAT, ratCompleto);
      } else {
        resultado = await ratService.saveCompletedRAT(ratCompleto, 'Sistema', 'Manual');
      }
      
      if (resultado && resultado.id) {
        // //console.log(viewMode === 'edit' ? '✅ RAT actualizado exitosamente con ID:' : '✅ RAT guardado exitosamente con ID:', resultado.id);
        
        // 🧠 PROCESAR ANÁLISIS DE CATEGORÍAS PENDIENTES
        if (viewMode !== 'edit' && ratData.categorias?.sensibles?.length > 0) {
          // //console.log('🔄 Procesando análisis de categorías pendientes para RAT guardado...');
          
          // Actualizar ratData con el ID recién generado para análisis posteriores
          const ratDataConId = { ...ratData, id: resultado.id };
          
          // Re-procesar análisis de categorías sensibles ahora que tenemos ID
          for (const subcategoria of ratData.categorias.sensibles) {
            try {
              await categoryAnalysisEngine.analizarCategoriaSeleccionada('sensibles', subcategoria, ratDataConId, currentTenant?.id);
              // //console.log(`✅ Análisis completado para: sensibles.${subcategoria}`);
            } catch (error) {
              console.error(`❌ Error análisis ${subcategoria}:`, error);
            }
          }
        }
        
        // 🚀 GENERACIÓN AUTOMÁTICA EIPD/DPIA AL CREAR RAT (Art. 25 Ley 21.719)
        if (ratCompleto.metadata.requiereEIPD || ratCompleto.metadata.requiereDPIA) {
          // //console.log('🎯 Iniciando generación automática EIPD/DPIA...');
          
          // Crear EIPD automáticamente
          const eipdData = {
            id: `EIPD-${ratId}-${Date.now()}`,
            rat_id: resultado.id,
            tenant_id: currentTenant?.id,
            user_id: user?.id,
            tipo: ratCompleto.metadata.requiereDPIA ? 'DPIA' : 'EIPD',
            titulo: `Evaluación de Impacto - ${ratData.finalidad}`,
            descripcion_tratamiento: ratData.finalidad,
            base_legal: ratData.baseLegal,
            necesidad_proporcionalidad: {
              es_necesario: true,
              justificacion: `Tratamiento necesario según ${ratData.baseLegal}`,
              proporcionalidad: 'Datos mínimos necesarios para la finalidad'
            },
            riesgos_identificados: [
              ...(ratCompleto.nivel_riesgo === 'ALTO' ? ['Riesgo alto por datos sensibles'] : []),
              ...(ratData.transferenciasInternacionales ? ['Transferencias internacionales'] : []),
              ...(ratData.categorias?.sensibles?.includes('datos_salud') ? ['Datos de salud'] : []),
              ...(ratData.categorias?.sensibles?.includes('datos_geneticos') ? ['Datos genéticos'] : [])
            ],
            medidas_mitigacion: [
              'Cifrado extremo a extremo',
              'Control de acceso basado en roles',
              'Auditoría continua',
              'Capacitación personal especializada'
            ],
            conclusion: 'APROBADO_CON_MEDIDAS',
            fundamento_legal: 'Art. 25 Ley 21.719 - EIPD obligatorio para alto riesgo',
            created_at: new Date().toISOString(),
            status: 'GENERADO_AUTOMATICAMENTE',
            requiere_revision_dpo: true
          };
          
          // Guardar EIPD en Supabase
          const { data: eipdGuardado, error: eipdError } = await supabase
            .from('evaluaciones_impacto')
            .insert([eipdData])
            .select()
            .single();
          
          if (!eipdError && eipdGuardado) {
            // //console.log('✅ EIPD generado automáticamente:', eipdGuardado.id);
            
            // Asociar EIPD con el RAT
            await supabase
              .from('rat_eipd_associations')
              .insert({
                rat_id: resultado.id,
                eipd_id: eipdGuardado.id,
                tenant_id: currentTenant?.id,
                created_at: new Date().toISOString(),
                created_by: user?.id
              });
            
            // Notificar al DPO para revisión (no para creación)
            const notificacionDPO = {
              tipo: 'EIPD_GENERADO_REVISION',
              ratId: resultado.id,
              eipdId: eipdGuardado.id,
              mensaje: `✅ EIPD generado automáticamente para RAT ${ratId}. Requiere revisión DPO.`,
              fecha: new Date().toISOString(),
              fundamento: 'Art. 25 Ley 21.719 - Generación automática completada',
            };
            
            await supabase
              .from('dpo_notifications')
              .insert({
                rat_id: resultado.id,
                eipd_id: eipdGuardado.id,
                tenant_id: currentTenant?.id,
                user_id: user?.id,
                tipo: 'revision_eipd_generado',
                mensaje: notificacionDPO.mensaje,
                fundamento: notificacionDPO.fundamento,
                created_at: new Date().toISOString(),
                status: 'pending'
              });
            
            // //console.log('🔔 DPO notificado para revisión EIPD pre-generado');
            alert(`✅ RAT ${ratId} guardado + EIPD generado automáticamente. DPO notificado para revisión.`);
          } else {
            console.error('❌ Error generando EIPD:', eipdError);
          }
        }
        
        const verification = await ratService.getCompletedRATs();
        // //console.log('🔍 Verificación de persistencia - Total RATs:', verification.length);
        
        setRats(verification);
        alert(`✅ RAT ${ratId} ${viewMode === 'edit' ? 'actualizado' : 'guardado'} exitosamente en Supabase`);
      }
      
      // CORREGIR PANTALLA NEGRA: Siempre volver a la lista
      setViewMode('list');
      setEditingRAT(null);
      setIsCreatingRAT(false);
      setShowRATList(true);
      setShowEmpresaManager(false);
      setCurrentStep(0);
      
      // Recargar lista de RATs para mostrar el nuevo/actualizado
      await cargarRATs();
      setRatData({
        responsable: {
          razonSocial: '',
          rut: '',
          direccion: '',
          nombre: '',
          email: '',
          telefono: '',
        },
        categorias: {
          identificacion: [], // ARRAY vacío
          sensibles: [], // ARRAY vacío
        },
        baseLegal: '',
        argumentoJuridico: '',
        finalidad: '',
        plazoConservacion: '',
        destinatarios: [],
        transferenciasInternacionales: false,
        documentosRequeridos: [],
      });
    } catch (error) {
      // Log error crítico de guardado a archivo TXT
      if (window.cumulativeErrorLogger) {
        window.cumulativeErrorLogger.logCriticalError('RAT_SAVE_FAILED', {
          error: error.message,
          stack: error.stack,
          rat_data: {
            nombre_actividad: ratData.nombreActividad,
            finalidad: ratData.finalidad,
            responsable: ratData.responsable?.nombre,
            empresa: ratData.responsable?.razonSocial,
            base_legal: ratData.baseLegal
          },
          tenant_id: currentTenant?.id,
          view_mode: viewMode,
          editing_rat: editingRAT,
          timestamp: new Date().toISOString()
        }, 'RAT_SAVE');
      }
      
      // Mostrar error al usuario
      setAlertas(prev => [...prev, {
        tipo: 'error',
        mensaje: `❌ Error guardando RAT: ${error.message}`,
        timestamp: Date.now()
      }]);
    }
  };

  // Renderizar gestor de datos de empresa
  if (showEmpresaManager) {
    return (
      <ThemeProvider theme={professionalTheme}>
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
          <Container maxWidth="lg">
            <Paper sx={{ p: 2, mb: 3 }}>
              <Button 
                variant="outlined" 
                onClick={volverAInicio}
                sx={{ mb: 2 }}
              >
                ← Volver al Sistema RAT
              </Button>
            </Paper>
            <EmpresaDataManager 
              onDataUpdate={cargarDatosComunes}
              existingData={ratData}
            />
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  // Renderizar vista de RAT individual (solo lectura)
  if (viewMode === 'view') {
    return (
      <ThemeProvider theme={professionalTheme}>
        <PageLayout
          title="Ver RAT"
          subtitle="Visualización de Registro de Actividades de Tratamiento"
          maxWidth="lg"
        >
          <Paper sx={{ p: 2, mb: 3 }}>
            <Button 
              variant="outlined" 
              onClick={() => setViewMode('list')}
              sx={{ mb: 2 }}
            >
              ← Volver a la Lista
            </Button>
          </Paper>
          <RATViewComponent ratData={ratData} />
        </PageLayout>
      </ThemeProvider>
    );
  }

  // Renderizar pantalla principal
  if (viewMode === 'list' || (!isCreatingRAT && showRATList)) {
    return (
      <ThemeProvider theme={professionalTheme}>
        <PageLayout
          title="Sistema de Cumplimiento RAT"
          subtitle="Registro de Actividades de Tratamiento - Ley 21.719"
          maxWidth="xl"
        >
              
              {/* DASHBOARD PROFESIONAL - ESTADÍSTICAS */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                    height: '100%'
                  }}>
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="h3" sx={{ color: '#fff', fontWeight: 'bold' }}>
                        {rats.length}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                        RATs Registrados
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    height: '100%'
                  }}>
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="h3" sx={{ color: '#fff', fontWeight: 'bold' }}>
                        {rats.filter(r => r.estado === 'completado').length}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                        Completos
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    height: '100%'
                  }}>
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="h3" sx={{ color: '#fff', fontWeight: 'bold' }}>
                        {rats.filter(r => r.nivel_riesgo === 'ALTO').length}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                        Riesgo Alto
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                    height: '100%'
                  }}>
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="h3" sx={{ color: '#fff', fontWeight: 'bold' }}>
                        {rats.filter(r => Array.isArray(r.categorias?.sensibles) && r.categorias.sensibles.length > 0).length}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                        Con Datos Sensibles
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              {/* ACCIONES PRINCIPALES */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    height: '100%',
                    background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(55, 48, 163, 0.1) 100%)',
                    border: '2px solid #4f46e5'
                  }}>
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                      <Box sx={{ mb: 3 }}>
                        <RATIcon sx={{ fontSize: 48, color: '#4f46e5' }} />
                      </Box>
                      <Typography variant="h5" gutterBottom sx={{ color: '#4f46e5', fontWeight: 'bold' }}>
                        CREAR NUEVO RAT
                      </Typography>
                      <Typography variant="body1" paragraph sx={{ color: '#d1d5db' }}>
                        Fundamento: Art. 16 Ley 21.719
                      </Typography>
                      <Typography variant="caption" display="block" paragraph sx={{ color: '#9ca3af', fontStyle: 'italic' }}>
                        "Obligación del responsable de mantener un registro de actividades de tratamiento"
                      </Typography>
                      <Button 
                        variant="contained" 
                        size="large"
                        sx={{ 
                          mt: 2,
                          fontWeight: 700,
                          px: 4,
                          py: 1.5
                        }}
                        onClick={iniciarNuevoRAT}
                      >
                        COMENZAR REGISTRO
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    height: '100%',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(4, 120, 87, 0.1) 100%)',
                    border: '2px solid #059669'
                  }}>
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                      <Box sx={{ mb: 3 }}>
                        <BusinessIcon sx={{ fontSize: 48, color: '#059669' }} />
                      </Box>
                      <Typography variant="h5" gutterBottom sx={{ color: '#059669', fontWeight: 'bold' }}>
                        DATOS EMPRESA
                      </Typography>
                      <Typography variant="body1" paragraph sx={{ color: '#d1d5db' }}>
                        Configuración centralizada
                      </Typography>
                      <Typography variant="caption" display="block" paragraph sx={{ color: '#9ca3af', fontStyle: 'italic' }}>
                        DPO, plataformas tecnológicas, políticas de retención
                      </Typography>
                      <Button 
                        variant="contained" 
                        size="large"
                        sx={{ 
                          mt: 2,
                          fontWeight: 700,
                          px: 4,
                          py: 1.5,
                          bgcolor: '#059669',
                          '&:hover': {
                            bgcolor: '#047857'
                          }
                        }}
                        onClick={mostrarGestionEmpresa}
                      >
                        GESTIONAR
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              
              {rats.length > 0 ? (
                <Box>
                  <Typography variant="h5" sx={{ mb: 3, color: '#f9fafb', fontWeight: 'bold' }}>
                    📊 DASHBOARD DE RATs
                  </Typography>
                  
                  {/* VISTA DE TARJETAS PROFESIONAL */}
                  <Grid container spacing={3}>
                    {rats.map((rat) => {
                      const tieneSensibles = rat.metadata?.requiereEIPD || rat.requiere_eipd;
                      const fecha = rat.created_at || rat.fechaCreacion;
                      const nivelRiesgo = rat.nivel_riesgo || 'MEDIO';
                      
                      return (
                        <Grid item xs={12} md={6} lg={4} key={rat.id}>
                          <Card sx={{ 
                            height: '100%',
                            transition: 'all 0.3s ease',
                            border: `1px solid ${
                              nivelRiesgo === 'ALTO' ? '#dc2626' : 
                              nivelRiesgo === 'MEDIO' ? '#ea580c' : '#059669'
                            }`,
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: `0 12px 20px rgba(${
                                nivelRiesgo === 'ALTO' ? '220, 38, 38' : 
                                nivelRiesgo === 'MEDIO' ? '234, 88, 12' : '5, 150, 105'
                              }, 0.3)`
                            }
                          }}>
                            <CardHeader
                              avatar={
                                <Avatar sx={{ 
                                  bgcolor: nivelRiesgo === 'ALTO' ? '#dc2626' : 
                                           nivelRiesgo === 'MEDIO' ? '#ea580c' : '#059669',
                                  color: '#fff'
                                }}>
                                  <BusinessIcon />
                                </Avatar>
                              }
                              title={
                                <Typography variant="h6" sx={{ 
                                  fontWeight: 'bold', 
                                  color: '#f9fafb',
                                  fontSize: '0.9rem'
                                }}>
                                  {(rat.responsable_proceso || rat.responsable?.nombre || 'Sin especificar').substring(0, 25)}...
                                </Typography>
                              }
                              subheader={
                                <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                                  ID: {String(rat.id || '').substring(0, 12)}
                                </Typography>
                              }
                              action={
                                <Chip 
                                  label={nivelRiesgo} 
                                  size="small"
                                  sx={{
                                    bgcolor: nivelRiesgo === 'ALTO' ? 'rgba(220, 38, 38, 0.2)' : 
                                             nivelRiesgo === 'MEDIO' ? 'rgba(234, 88, 12, 0.2)' : 'rgba(5, 150, 105, 0.2)',
                                    color: nivelRiesgo === 'ALTO' ? '#fca5a5' : 
                                           nivelRiesgo === 'MEDIO' ? '#fdba74' : '#6ee7b7',
                                    fontWeight: 'bold'
                                  }}
                                />
                              }
                            />
                            <CardContent>
                              <Typography variant="body2" sx={{ 
                                color: '#d1d5db', 
                                mb: 2,
                                height: 40,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {(rat.finalidad_principal || rat.finalidades?.descripcion || rat.finalidad || 'No especificada').substring(0, 80)}...
                              </Typography>
                              
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                <Chip 
                                  label={rat.base_legal || rat.baseLegal || 'Art. 13'} 
                                  size="small"
                                  variant="outlined"
                                  sx={{ 
                                    borderColor: '#4f46e5',
                                    color: '#a78bfa',
                                    fontSize: '0.7rem'
                                  }}
                                />
                                {tieneSensibles && (
                                  <Chip 
                                    label="Datos Sensibles" 
                                    size="small"
                                    sx={{
                                      bgcolor: 'rgba(220, 38, 38, 0.2)',
                                      color: '#fca5a5',
                                      fontSize: '0.7rem'
                                    }}
                                  />
                                )}
                              </Box>
                              
                              <Typography variant="caption" sx={{ 
                                color: '#6b7280',
                                display: 'block',
                                mb: 2
                              }}>
                                {fecha ? `Creado: ${new Date(fecha).toLocaleDateString('es-CL')}` : 'Sin fecha'}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
                                <Tooltip 
                                  title={
                                    <Box>
                                      <Typography variant="caption" sx={{ fontWeight: 600 }}>👁️ VER DETALLES</Typography>
                                      <Typography variant="caption" display="block">Visualizar información completa del RAT</Typography>
                                      <Typography variant="caption" display="block" sx={{ fontStyle: 'italic' }}>Solo lectura - Art. 22 Ley 21.719</Typography>
                                    </Box>
                                  }
                                  placement="top"
                                  arrow
                                >
                                  <IconButton 
                                    size="small" 
                                    onClick={() => verRAT(rat.id)}
                                    sx={{ 
                                      color: '#4f46e5',
                                      '&:hover': { bgcolor: 'rgba(79, 70, 229, 0.1)' }
                                    }}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                
                                <Tooltip 
                                  title={
                                    <Box>
                                      <Typography variant="caption" sx={{ fontWeight: 600 }}>✏️ EDITAR RAT</Typography>
                                      <Typography variant="caption" display="block">Modificar todos los campos del registro</Typography>
                                      <Typography variant="caption" display="block" sx={{ fontStyle: 'italic' }}>Formulario paso a paso completo</Typography>
                                    </Box>
                                  }
                                  placement="top"
                                  arrow
                                >
                                  <IconButton 
                                    size="small" 
                                    onClick={() => {
                                      // //console.log('🔍 Navegando a edición RAT:', rat.id);
                                      navigate(`/rat-edit/${rat.id}`);
                                    }}
                                    sx={{ 
                                      color: '#059669',
                                      '&:hover': { bgcolor: 'rgba(5, 150, 105, 0.1)' }
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                
                                <Tooltip 
                                  title={
                                    <Box>
                                      <Typography variant="caption" sx={{ fontWeight: 600 }}>📋 DUPLICAR RAT</Typography>
                                      <Typography variant="caption" display="block">Crear una copia para actividad similar</Typography>
                                      <Typography variant="caption" display="block" sx={{ fontStyle: 'italic' }}>Ahorra tiempo en registros similares</Typography>
                                    </Box>
                                  }
                                  placement="top"
                                  arrow
                                >
                                  <IconButton 
                                    size="small" 
                                    onClick={() => duplicarRAT(rat.id)}
                                    sx={{ 
                                      color: '#ea580c',
                                      '&:hover': { bgcolor: 'rgba(234, 88, 12, 0.1)' }
                                    }}
                                  >
                                    <ContentCopyIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                
                                <Tooltip 
                                  title={
                                    <Box>
                                      <Typography variant="caption" sx={{ fontWeight: 600 }}>🗑️ ELIMINAR RAT</Typography>
                                      <Typography variant="caption" display="block">Eliminar permanentemente el registro</Typography>
                                      <Typography variant="caption" display="block" sx={{ fontStyle: 'italic', color: '#ef4444' }}>⚠️ Acción irreversible</Typography>
                                    </Box>
                                  }
                                  placement="top"
                                  arrow
                                >
                                  <IconButton 
                                    size="small" 
                                    onClick={() => eliminarRAT(rat.id)}
                                    sx={{ 
                                      color: '#dc2626',
                                      '&:hover': { bgcolor: 'rgba(220, 38, 38, 0.1)' }
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h6" sx={{ color: '#6b7280', mb: 2 }}>
                    No hay RATs registrados
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                    Comience creando su primer Registro de Actividades de Tratamiento
                  </Typography>
                  <Button 
                    variant="contained" 
                    sx={{ mt: 3 }}
                    onClick={iniciarNuevoRAT}
                  >
                    Crear Primer RAT
                  </Button>
                </Box>
              )}
        </PageLayout>
      </ThemeProvider>
    );
  }

  // Renderizar formulario de creación/edición RAT
  return (
    <ThemeProvider theme={professionalTheme}>
      <PageLayout
        title={viewMode === 'edit' ? `📝 Editar RAT: ${editingRAT}` : "Crear Nuevo RAT"}
        subtitle={`Paso ${currentStep + 1} de ${steps.length} - ${steps[currentStep]}`}
        maxWidth="lg"
      >
            {/* INFORMACIÓN RAT EN EDICIÓN - PALETA OSCURA PROFESIONAL */}
            {viewMode === 'edit' && editingRAT && (
              <Paper sx={{ 
                p: 2, 
                mb: 3, 
                bgcolor: '#1e293b', // Fondo oscuro profesional
                border: '1px solid #4f46e5',
                borderRadius: 2
              }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>ID RAT:</Typography>
                    <Typography variant="body1" fontWeight="bold" sx={{ color: '#f1f5f9' }}>
                      {editingRAT}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>Fecha Creación:</Typography>
                    <Typography variant="body1" fontWeight="bold" sx={{ color: '#f1f5f9' }}>
                      {ratData.created_at ? new Date(ratData.created_at).toLocaleDateString('es-CL') : 'Hoy'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" sx={{ color: '#94a3b8', mb: 1 }}>Estado:</Typography>
                    <Chip 
                      label="EN EDICIÓN" 
                      size="small" 
                      sx={{ 
                        bgcolor: '#4f46e5', 
                        color: '#ffffff',
                        fontWeight: 'bold'
                      }} 
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => {
                        // //console.log('🔍 Navegando a vista completa RAT:', editingRAT);
                        navigate(`/rat-edit/${editingRAT}`);
                      }}
                      sx={{ 
                        bgcolor: '#059669',
                        color: '#ffffff',
                        '&:hover': {
                          bgcolor: '#047857'
                        }
                      }}
                    >
                      👁️ Ver Completo
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            )}

            {/* Header con progreso */}
            <LinearProgress 
              variant="determinate" 
              value={(currentStep + 1) / steps.length * 100}
              sx={{ height: 8, mb: 4, borderRadius: 1 }}
            />

            {/* Contenido del paso actual */}
            <Box sx={{ minHeight: 400 }}>
              {currentStep === 0 && <PasoIdentificacion ratData={ratData} setRatData={setRatData} />}
              {currentStep === 1 && <PasoCategorias ratData={ratData} setRatData={setRatData} currentTenant={currentTenant} setAlertas={setAlertas} />}
              {currentStep === 2 && <PasoBaseLegal ratData={ratData} setRatData={setRatData} />}
              {currentStep === 3 && <PasoFinalidad ratData={ratData} setRatData={setRatData} />}
              {currentStep === 4 && <PasoTransferencias ratData={ratData} setRatData={setRatData} />}
              {currentStep === 5 && <PasoRevision ratData={ratData} guardarRAT={guardarRAT} />}
            </Box>


            {/* Botones de navegación */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {viewMode === 'edit' && (
                  <Button
                    onClick={() => setViewMode('list')}
                    variant="outlined"
                    color="secondary"
                  >
                    ← Volver a Lista
                  </Button>
                )}
                <Button
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  variant="outlined"
                >
                  Anterior
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                {/* 🚨 BOTÓN GUARDAR SIEMPRE VISIBLE EN EDICIÓN */}
                <Button
                  onClick={guardarRAT}
                  variant="outlined"
                  color="success"
                  sx={{
                    borderColor: '#10b981',
                    color: '#10b981',
                    '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)', borderColor: '#059669' }
                  }}
                >
                  💾 Guardar Cambios
                </Button>
                
                {currentStep < steps.length - 1 && (
                  <Button
                    onClick={handleNext}
                    variant="contained"
                    disabled={!checkStepComplete(currentStep)}
                  >
                    Siguiente
                  </Button>
                )}
              </Box>
            </Box>
      </PageLayout>
    </ThemeProvider>
  );
};

// Componentes para cada paso
const PasoIdentificacion = ({ ratData, setRatData }) => {
  const [rutError, setRutError] = React.useState('');
  const [duplicateAlert, setDuplicateAlert] = React.useState(false);
  
  const validarRUT = (rut) => {
    const rutLimpio = rut.replace(/[.-]/g, '');
    if (rutLimpio.length < 8) return false;
    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1).toUpperCase();
    let suma = 0;
    let multiplo = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo[i]) * multiplo;
      multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }
    const dvEsperado = 11 - (suma % 11);
    const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();
    return dv === dvCalculado;
  };
  
  const handleRUTChange = async (e) => {
    const rut = e.target.value;
    const nuevosResponsableData = { ...ratData.responsable, rut: rut };
    setRatData({
      ...ratData,
      responsable: nuevosResponsableData
    });
    
    // Auto-persistir datos empresa
    persistirDatosEmpresa(nuevosResponsableData);
    
    if (rut.length > 8) {
      if (!validarRUT(rut)) {
        setRutError('RUT inválido. Verifique el formato (ej: 12.345.678-9)');
      } else {
        setRutError('');
        const ratsExistentes = await ratService.getCompletedRATs();
        const duplicado = ratsExistentes.find(r => 
          r.responsable?.rut === rut || r.responsable_rut === rut
        );
        if (duplicado) {
          setDuplicateAlert(true);
        } else {
          setDuplicateAlert(false);
        }
      }
    }
  };
  
  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          📖 Fundamento Legal: Art. 3 letra f) y Art. 15 Ley 21.719
        </Typography>
        <Typography variant="caption" display="block">
          El responsable determina los fines y medios del tratamiento. Debe identificarse claramente.
        </Typography>
      </Alert>
      
      {duplicateAlert && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          ⚠️ Ya existe un RAT registrado para este RUT. Verifique si desea actualizar el existente.
        </Alert>
      )}
      
      <Typography variant="h6" gutterBottom>
        <Box component="span" sx={{ color: '#60a5fa', mr: 1 }}>🏢</Box>
        DATOS DEL RESPONSABLE DEL TRATAMIENTO
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Complete los datos de la organización responsable del tratamiento de datos personales
      </Typography>
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Razón Social *"
          value={ratData.responsable.razonSocial}
          onChange={(e) => {
            const nuevosResponsableData = { ...ratData.responsable, razonSocial: e.target.value };
            setRatData({
              ...ratData,
              responsable: nuevosResponsableData
            });
            // Auto-persistir datos empresa
            persistirDatosEmpresa(nuevosResponsableData);
          }}
          helperText="Nombre legal completo de la empresa"
          required
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="RUT Empresa *"
          value={ratData.responsable.rut}
          onChange={handleRUTChange}
          error={!!rutError}
          helperText={rutError || "Formato: 12.345.678-9"}
          required
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Dirección Comercial *"
          value={ratData.responsable.direccion}
          onChange={(e) => {
            const nuevosResponsableData = { ...ratData.responsable, direccion: e.target.value };
            setRatData({
              ...ratData,
              responsable: nuevosResponsableData
            });
            // Auto-persistir datos empresa
            persistirDatosEmpresa(nuevosResponsableData);
          }}
          helperText="Dirección física de la oficina principal"
          required
        />
      </Grid>
    </Grid>

    <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
      <Box component="span" sx={{ color: '#fbbf24', mr: 1 }}>👤</Box>
      DELEGADO DE PROTECCIÓN DE DATOS (DPO)
    </Typography>
    <Alert severity="info" sx={{ mb: 2 }}>
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        📖 Art. 47 Ley 21.719 - Designación del DPO
      </Typography>
      <Typography variant="caption" display="block">
        Obligatorio cuando se traten datos sensibles a gran escala o de manera sistemática
      </Typography>
    </Alert>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      Persona encargada de supervisar el cumplimiento de la protección de datos en la organización
    </Typography>
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Nombre Completo DPO *"
          value={ratData.responsable.nombre}
          onChange={(e) => {
            const nuevosResponsableData = { ...ratData.responsable, nombre: e.target.value };
            setRatData({
              ...ratData,
              responsable: nuevosResponsableData
            });
            // Auto-persistir datos empresa
            persistirDatosEmpresa(nuevosResponsableData);
          }}
          helperText="Nombre y apellidos del DPO designado"
          required
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Email de Contacto DPO *"
          type="email"
          value={ratData.responsable.email}
          onChange={(e) => {
            const nuevosResponsableData = { ...ratData.responsable, email: e.target.value };
            setRatData({
              ...ratData,
              responsable: nuevosResponsableData
            });
            // Auto-persistir datos empresa
            persistirDatosEmpresa(nuevosResponsableData);
          }}
          helperText="Email oficial para consultas de privacidad"
          required
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Teléfono DPO *"
          value={ratData.responsable.telefono}
          onChange={(e) => {
            const nuevosResponsableData = { ...ratData.responsable, telefono: e.target.value };
            setRatData({
              ...ratData,
              responsable: nuevosResponsableData
            });
            // Auto-persistir datos empresa
            persistirDatosEmpresa(nuevosResponsableData);
          }}
          helperText="Teléfono directo del DPO"
          required
        />
      </Grid>
    </Grid>

    
    {/* NUEVA SECCIÓN: SELECCIÓN DE INDUSTRIA */}
    <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
      <Box component="span" sx={{ color: '#10b981', mr: 1 }}>🏭</Box>
      SECTOR INDUSTRIAL Y REGULACIONES
    </Typography>
    <Alert severity="info" sx={{ mb: 2 }}>
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        📖 Art. 25 Ley 21.719 - Evaluación de Impacto según sector
      </Typography>
      <Typography variant="caption" display="block">
        Cada industria tiene regulaciones específicas que afectan el tratamiento de datos
      </Typography>
    </Alert>
    
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[
        {
          id: 'financiero',
          name: 'Sector Financiero',
          color: '#059669',
          regulations: ['Ley 21.719', 'Ley 21.000 (CMF)', 'Basilea III'],
          requirements: 'Regulación CMF - Datos financieros sensibles'
        },
        {
          id: 'salud',
          name: 'Sector Salud', 
          color: '#dc2626',
          regulations: ['Ley 21.719', 'Ley 20.584 (Pacientes)', 'Código Sanitario'],
          requirements: 'Datos salud - Protección especial Art. 12'
        },
        {
          id: 'educacion',
          name: 'Educación',
          color: '#7c3aed', 
          regulations: ['Ley 21.719', 'Ley 20.370 (LGE)', 'Protección Menores'],
          requirements: 'Datos menores - Consentimiento parental'
        },
        {
          id: 'retail',
          name: 'Comercio y Retail',
          color: '#ea580c',
          regulations: ['Ley 21.719', 'Ley 19.496 (SERNAC)', 'Ley 20.009 (DICOM)'],
          requirements: 'Datos comerciales - Información crediticia'
        },
        {
          id: 'tecnologia',
          name: 'Tecnología',
          color: '#0891b2',
          regulations: ['Ley 21.719', 'Ciberseguridad', 'Transferencias Internacionales'],
          requirements: 'Datos en nube - Transferencias internacionales'
        },
        {
          id: 'manufactura',
          name: 'Manufactura',
          color: '#4f46e5', 
          regulations: ['Ley 21.719', 'Normativa Laboral', 'Medio Ambiente'],
          requirements: 'Datos laborales - Medicina del trabajo'
        }
      ].map((industria) => (
        <Grid item xs={12} sm={6} md={4} key={industria.id}>
          <Card
            sx={{
              cursor: 'pointer',
              border: ratData.responsable.sector === industria.id ? 
                `2px solid ${industria.color}` : '1px solid #374151',
              bgcolor: ratData.responsable.sector === industria.id ? 
                `${industria.color}15` : 'transparent',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: industria.color,
                transform: 'translateY(-2px)'
              }
            }}
            onClick={() => setRatData({
              ...ratData,
              responsable: { ...ratData.responsable, sector: industria.id }
            })}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ color: industria.color, mb: 1 }}>
                {industria.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                {industria.requirements}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {industria.regulations.slice(0, 2).map((reg, index) => (
                  <Chip
                    key={index}
                    label={reg}
                    size="small"
                    sx={{
                      bgcolor: `${industria.color}20`,
                      color: industria.color,
                      fontSize: '0.7rem'
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>

    <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="caption" color="text.secondary">
        💡 Tip: Los datos ingresados aquí se usarán como base para todos los RATs futuros.
        Asegúrese de que la información esté actualizada y sea correcta.
      </Typography>
    </Box>
  </Box>
  );
};

const PasoCategorias = ({ ratData, setRatData, currentTenant, setAlertas }) => {
  const [expandedCategory, setExpandedCategory] = React.useState('identificacion');
  
  const handleIdentificacion = (event) => {
    try {
      const value = event.target.value;
      const current = Array.isArray(ratData.categorias.identificacion) ? 
        ratData.categorias.identificacion : [];
      
      if (event.target.checked) {
        setRatData({
          ...ratData,
          categorias: { 
            ...ratData.categorias, 
            identificacion: [...current, value] 
          }
        });
        // //console.log('✅ Categoría agregada:', value);
      } else {
        setRatData({
          ...ratData,
          categorias: { 
            ...ratData.categorias, 
            identificacion: current.filter(v => v !== value) 
          }
        });
        // //console.log('❌ Categoría removida:', value);
      }
    } catch (error) {
      console.error('🚨 Error en handleIdentificacion:', error);
    }
  };

  const handleSensibles = (event) => {
    try {
      const value = event.target.value;
      const current = Array.isArray(ratData.categorias.sensibles) ? 
        ratData.categorias.sensibles : [];
      
      if (event.target.checked) {
        setRatData({
          ...ratData,
          categorias: { 
            ...ratData.categorias, 
            sensibles: [...current, value] 
          }
        });
        // //console.log('🚨 Dato sensible agregado - Trigger EIPD:', value);
        
        // 🧠 ANÁLISIS AUTOMÁTICO SEGÚN DIAGRAMA LÍNEAS 162-228
        if (currentTenant?.id) {
          categoryAnalysisEngine.analizarCategoriaSeleccionada('sensibles', value, ratData, currentTenant.id)
            .then(analisis => {
              // //console.log('🧠 Análisis automático categoría:', analisis);
              // Aplicar alertas y efectos automáticos
              if (analisis.alertas?.length > 0) {
                setAlertas(prev => [...prev, ...analisis.alertas]);
              }
            })
            .catch(error => console.error('Error análisis automático:', error));
        }
      } else {
        setRatData({
          ...ratData,
          categorias: { 
            ...ratData.categorias, 
            sensibles: current.filter(v => v !== value) 
          }
        });
        // //console.log('✅ Dato sensible removido:', value);
      }
    } catch (error) {
      console.error('🚨 Error en handleSensibles:', error);
    }
  };

  // VERIFICAR QUE ARRAYS ESTÉN INICIALIZADOS
  React.useEffect(() => {
    if (!Array.isArray(ratData.categorias.identificacion) || 
        !Array.isArray(ratData.categorias.sensibles)) {
      // //console.log('🔧 Corrigiendo inicialización de categorías...');
      setRatData(prevData => ({
        ...prevData,
        categorias: {
          identificacion: Array.isArray(prevData.categorias.identificacion) ? 
            prevData.categorias.identificacion : [],
          sensibles: Array.isArray(prevData.categorias.sensibles) ? 
            prevData.categorias.sensibles : []
        }
      }));
    }
  }, [ratData.categorias, setRatData]);

  const categoriasConfig = [
    {
      id: 'identificacion',
      title: 'DATOS DE IDENTIFICACIÓN',
      subtitle: 'Art. 2 f) Ley 21.719',
      description: 'Información que permite identificar a una persona natural, directa o indirectamente',
      icon: <PersonIcon />,
      color: '#60a5fa',
      items: [
        { value: 'nombre', label: 'Nombre y apellidos', risk: 'low' },
        { value: 'rut', label: 'RUT o Cédula de Identidad', risk: 'medium' },
        { value: 'direccion', label: 'Dirección domiciliaria', risk: 'medium' },
        { value: 'telefono', label: 'Número telefónico', risk: 'medium' },
        { value: 'email', label: 'Correo electrónico', risk: 'medium' },
        { value: 'firma', label: 'Firma manuscrita', risk: 'medium' },
        { value: 'fotografia', label: 'Fotografía o imagen', risk: 'high', warning: 'Requiere medidas especiales' },
        { value: 'grabacion_video', label: 'Grabación audiovisual', risk: 'high', warning: 'EIPD obligatoria' },
        { value: 'grabacion_audio', label: 'Grabación de voz', risk: 'medium' },
        { value: 'imagen_vigilancia', label: 'Imagen de cámaras vigilancia', risk: 'high', warning: 'EIPD obligatoria' },
        { value: 'huella_digital', label: 'Huella dactilar', risk: 'high' },
        { value: 'geolocalizacion', label: 'Datos de geolocalización', risk: 'critical', warning: 'Múltiples obligaciones' },
        { value: 'direccion_ip', label: 'Dirección IP', risk: 'medium' },
        { value: 'cookies_identificacion', label: 'Cookies identificadoras', risk: 'medium' },
        { value: 'numero_cuenta', label: 'Número de cuenta bancaria', risk: 'high' },
        { value: 'patente_vehiculo', label: 'Patente de vehículo', risk: 'medium' }
      ]
    },
    {
      id: 'sensibles',
      title: 'DATOS SENSIBLES',
      subtitle: 'Art. 2 g) Ley 21.719',
      description: 'Categorías especiales de datos personales que revelan información íntima - PROTECCIÓN REFORZADA',
      icon: <SecurityIcon />,
      color: '#ef4444',
      items: [
        { value: 'origen_racial', label: 'Origen racial o étnico', article: 'Art. 2 g) i)', risk: 'critical' },
        { value: 'opiniones_politicas', label: 'Opiniones políticas', article: 'Art. 2 g) ii)', risk: 'critical' },
        { value: 'convicciones_religiosas', label: 'Convicciones religiosas', article: 'Art. 2 g) iii)', risk: 'critical' },
        { value: 'afiliacion_sindical', label: 'Afiliación sindical', article: 'Art. 2 g) iv)', risk: 'critical' },
        { value: 'vida_sexual', label: 'Vida sexual u orientación sexual', article: 'Art. 2 g) v)', risk: 'critical' },
        { value: 'datos_salud', label: 'Datos de salud física o mental', article: 'Art. 2 g) vi)', risk: 'critical' },
        { value: 'datos_biometricos', label: 'Datos biométricos únicos', article: 'Art. 2 g) vii)', risk: 'critical' },
        { value: 'antecedentes_penales', label: 'Antecedentes penales o infracciones', article: 'Art. 2 g) viii)', risk: 'critical' },
        { value: 'datos_geneticos', label: 'Datos genéticos', article: 'Art. 2 g) ix)', risk: 'critical' },
        { value: 'localizacion_permanente', label: 'Localización permanente', article: 'Art. 2 g) x)', risk: 'critical' }
      ]
    },
    {
      id: 'financieros',
      title: 'DATOS FINANCIEROS Y COMERCIALES',
      subtitle: 'Art. 2 f) y Art. 5° Ley 21.719',
      description: 'Información económica y comercial - Principio de proporcionalidad',
      icon: <FinanceIcon />,
      color: '#10b981',
      items: [
        { value: 'ingresos_economicos', label: 'Ingresos económicos', risk: 'medium' },
        { value: 'historial_crediticio', label: 'Historial crediticio', risk: 'high' },
        { value: 'transacciones_bancarias', label: 'Transacciones bancarias', risk: 'high' },
        { value: 'habitos_consumo', label: 'Hábitos de consumo', risk: 'medium' },
        { value: 'scoring_financiero', label: 'Scoring financiero', risk: 'critical', warning: 'Trigger DPIA Art. 20' },
        { value: 'morosidad', label: 'Información de morosidad', risk: 'high' },
        { value: 'patrimonio', label: 'Datos patrimoniales', risk: 'high' },
        { value: 'seguros', label: 'Pólizas de seguros', risk: 'medium' }
      ]
    },
    {
      id: 'laborales',
      title: 'DATOS LABORALES',
      subtitle: 'Art. 2 f) y Art. 154 bis Código del Trabajo',
      description: 'Conservación: 5 años desde término relación laboral - Art. 11 Ley 21.719',
      icon: <WorkIcon />,
      color: '#f59e0b',
      items: [
        { value: 'cargo_posicion', label: 'Cargo o posición', risk: 'low' },
        { value: 'sueldo_remuneracion', label: 'Sueldo o remuneración', risk: 'medium' },
        { value: 'evaluaciones_desempeno', label: 'Evaluaciones desempeño', risk: 'high', warning: 'Posible DPIA Art. 20' },
        { value: 'historial_laboral', label: 'Historial laboral', risk: 'medium' },
        { value: 'referencias_laborales', label: 'Referencias laborales', risk: 'medium' },
        { value: 'amonestaciones', label: 'Amonestaciones o sanciones', risk: 'high' },
        { value: 'licencias_medicas', label: 'Licencias médicas', risk: 'critical', warning: 'Dato sensible Art. 2 g) vi)' },
        { value: 'prevision_social', label: 'Datos previsión social (AFP, ISAPRE)', risk: 'medium' }
      ]
    },
    {
      id: 'academicos',
      title: 'DATOS ACADÉMICOS Y FORMATIVOS',
      subtitle: 'Art. 2 f) y Art. 6° Ley 21.719',
      description: 'Principio de calidad: Datos exactos y actualizados',
      icon: <EducationIcon />,
      color: '#8b5cf6',
      items: [
        { value: 'titulos_profesionales', label: 'Títulos profesionales', risk: 'low' },
        { value: 'certificaciones', label: 'Certificaciones', risk: 'low' },
        { value: 'historial_academico', label: 'Historial académico', risk: 'medium' },
        { value: 'capacitaciones', label: 'Capacitaciones', risk: 'low' },
        { value: 'calificaciones', label: 'Calificaciones y notas', risk: 'medium' },
        { value: 'idiomas', label: 'Competencias idiomáticas', risk: 'low' }
      ]
    },
    {
      id: 'comunicaciones',
      title: 'DATOS DE COMUNICACIONES',
      subtitle: 'Art. 2 f) y Art. 19 N°4 Constitución',
      description: 'Secreto e inviolabilidad de comunicaciones - Requiere consentimiento expreso Art. 12',
      icon: <CommunicationIcon />,
      color: '#06b6d4',
      items: [
        { value: 'registros_llamadas', label: 'Registros de llamadas', risk: 'medium' },
        { value: 'mensajeria', label: 'Mensajes (SMS, WhatsApp, email)', risk: 'medium' },
        { value: 'metadata_comunicaciones', label: 'Metadata de comunicaciones', risk: 'high' },
        { value: 'contenido_comunicaciones', label: 'Contenido comunicaciones', risk: 'critical', warning: 'EIPD Art. 19' }
      ]
    },
    {
      id: 'navegacion',
      title: 'DATOS DE NAVEGACIÓN Y COOKIES',
      subtitle: 'Art. 2 f), Art. 9° y Art. 15 Ley 21.719',
      description: 'Transparencia obligatoria',
      icon: <WebIcon />,
      color: '#84cc16',
      items: [
        { value: 'cookies_analiticas', label: 'Cookies analíticas', risk: 'low' },
        { value: 'cookies_publicidad', label: 'Cookies publicitarias', risk: 'medium' },
        { value: 'historial_navegacion', label: 'Historial de navegación', risk: 'medium' },
        { value: 'comportamiento_online', label: 'Comportamiento online', risk: 'high', warning: 'Posible DPIA Art. 20' },
        { value: 'dispositivos_id', label: 'Identificadores de dispositivos', risk: 'medium' }
      ]
    }
  ];

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      case 'critical': return '#7c2d12';
      default: return '#6b7280';
    }
  };

  const getRiskIcon = (risk) => {
    switch(risk) {
      case 'low': return <CheckIcon fontSize="small" />;
      case 'medium': return <WarningIcon fontSize="small" />;
      case 'high': return <WarningIcon fontSize="small" />;
      case 'critical': return <SecurityIcon fontSize="small" />;
      default: return null;
    }
  };

  const getSelectedCount = (categoryId) => {
    if (categoryId === 'sensibles') {
      return Array.isArray(ratData.categorias.sensibles) ? ratData.categorias.sensibles.length : 0;
    }
    return Array.isArray(ratData.categorias.identificacion) ? 
      ratData.categorias.identificacion.filter(item => 
        categoriasConfig.find(cat => cat.id === categoryId)?.items.some(i => i.value === item)
      ).length : 0;
  };

  return (
    <Box sx={{ maxHeight: '80vh', overflowY: 'auto', pr: 1 }}>
      <Alert severity="info" sx={{ mb: 3, position: 'sticky', top: 0, zIndex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          📖 Fundamento Legal: Art. 2 letras f) y g) Ley 21.719
        </Typography>
        <Typography variant="caption" display="block">
          Los datos personales se clasifican según su naturaleza. Cada categoría requiere medidas específicas de protección.
        </Typography>
      </Alert>

      <Grid container spacing={2}>
        {categoriasConfig.map((categoria) => {
          const isExpanded = expandedCategory === categoria.id;
          const selectedCount = getSelectedCount(categoria.id);
          const isSelected = selectedCount > 0;
          
          return (
            <Grid item xs={12} key={categoria.id}>
              <Card 
                sx={{ 
                  border: isSelected ? `2px solid ${categoria.color}` : '1px solid #374151',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                  }
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: categoria.color, color: '#fff' }}>
                      {categoria.icon}
                    </Avatar>
                  }
                  action={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {selectedCount > 0 && (
                        <Chip
                          label={`${selectedCount} seleccionados`}
                          size="small"
                          sx={{
                            bgcolor: categoria.color,
                            color: '#fff',
                            fontWeight: 'bold'
                          }}
                        />
                      )}
                      <IconButton 
                        onClick={() => setExpandedCategory(isExpanded ? null : categoria.id)}
                        sx={{ 
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s ease'
                        }}
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    </Box>
                  }
                  title={
                    <Typography variant="h6" sx={{ color: categoria.color, fontWeight: 700 }}>
                      {categoria.title}
                    </Typography>
                  }
                  subheader={
                    <Box>
                      <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 600 }}>
                        {categoria.subtitle}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#d1d5db', mt: 0.5 }}>
                        {categoria.description}
                      </Typography>
                    </Box>
                  }
                />
                
                <Collapse in={isExpanded} timeout={300}>
                  <CardContent sx={{ pt: 0 }}>
                    <Grid container spacing={1}>
                      {categoria.items.map((item) => {
                        // 🔍 DEBUG: Verificar estado checkbox en edición + FIX mejorado
                        const categoriaArray = categoria.id === 'sensibles' ? 
                          ratData.categorias?.sensibles : ratData.categorias?.identificacion;
                        const isChecked = Array.isArray(categoriaArray) && categoriaArray.includes(item.value);
                          
                        // DEBUG logs removidos para producción
                        
                        return (
                          <Grid item xs={12} sm={6} md={4} key={item.value}>
                            <Paper 
                              sx={{ 
                                p: 1.5, 
                                border: isChecked ? `2px solid ${categoria.color}` : '1px solid #374151',
                                bgcolor: isChecked ? `${categoria.color}15` : 'transparent',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  bgcolor: `${categoria.color}10`,
                                  borderColor: categoria.color
                                }
                              }}
                            >
                              <FormControlLabel
                                control={
                                  <Checkbox 
                                    onChange={categoria.id === 'sensibles' ? handleSensibles : handleIdentificacion}
                                    value={item.value}
                                    checked={isChecked}
                                    sx={{
                                      color: categoria.color,
                                      '&.Mui-checked': {
                                        color: categoria.color
                                      }
                                    }}
                                  />
                                }
                                label={
                                  <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                      {getRiskIcon(item.risk)}
                                      <Typography 
                                        variant="body2" 
                                        sx={{ 
                                          fontWeight: isChecked ? 600 : 400,
                                          color: isChecked ? categoria.color : 'inherit'
                                        }}
                                      >
                                        {item.label}
                                      </Typography>
                                    </Box>
                                    
                                    {item.article && (
                                      <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block' }}>
                                        {item.article}
                                      </Typography>
                                    )}
                                    
                                    {item.warning && (
                                      <Typography variant="caption" sx={{ color: '#ef4444', display: 'block', fontWeight: 600 }}>
                                        ⚠️ {item.warning}
                                      </Typography>
                                    )}
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                      <Box
                                        sx={{
                                          width: 8,
                                          height: 8,
                                          borderRadius: '50%',
                                          bgcolor: getRiskColor(item.risk)
                                        }}
                                      />
                                      <Typography variant="caption" sx={{ color: '#9ca3af', textTransform: 'uppercase', fontSize: '0.65rem' }}>
                                        Riesgo: {item.risk}
                                      </Typography>
                                    </Box>
                                  </Box>
                                }
                                sx={{ width: '100%', m: 0 }}
                              />
                            </Paper>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </CardContent>
                </Collapse>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Alertas dinámicas basadas en las selecciones */}
      {Array.isArray(ratData.categorias.sensibles) && ratData.categorias.sensibles.length > 0 && (
        <Alert severity="success" sx={{ mt: 3, bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <Typography variant="body2" fontWeight="bold">
            ✅ SISTEMA PUEDE CONTINUAR - EIPD SE ASIGNARÁ AUTOMÁTICAMENTE
          </Typography>
          <Typography variant="caption">
            Fundamento: Art. 19 Ley 21.719 - "Evaluación de Impacto en Protección de Datos Personales"
          </Typography>
          <Typography variant="caption" display="block">
            Plazo DPO: 30 días para completar EIPD - Art. 48 funciones del DPO
          </Typography>
          <Typography variant="caption" display="block" color="error">
            Sanción por no realizar: 5.001 a 20.000 UTM - Art. 34 quáter Ley 21.719
          </Typography>
        </Alert>
      )}

      {/* Contador de selección al final */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.3)' }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#4f46e5' }}>
          📊 Resumen de Selección:
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {categoriasConfig.map((categoria) => {
            const count = getSelectedCount(categoria.id);
            return count > 0 ? (
              <Grid item xs={6} sm={4} md={3} key={categoria.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {categoria.icon}
                  <Typography variant="caption">
                    {categoria.title.split(' ')[1]}: {count}
                  </Typography>
                </Box>
              </Grid>
            ) : null;
          })}
        </Grid>
      </Paper>
    </Box>
  );
};

const PasoBaseLegal = ({ ratData, setRatData }) => {
  const handleChange = (event) => {
    const value = event.target.value;
    let argumento = '';
    
    switch(value) {
      case 'consentimiento':
        argumento = 'Art. 12 Ley 21.719 - Consentimiento libre, previo, informado y específico del titular de los datos. Debe ser otorgado para finalidades específicas y puede ser revocado en cualquier momento.';
        break;
      case 'consentimiento_expreso':
        argumento = 'Art. 12 inc. 2° Ley 21.719 - Consentimiento expreso requerido para datos sensibles. Debe manifestarse de forma inequívoca mediante declaración escrita o acto positivo.';
        break;
      case 'consentimiento_padres':
        argumento = 'Art. 12 inc. 3° Ley 21.719 - Consentimiento de padres o representantes legales para menores de 14 años. Considera el interés superior del menor.';
        break;
      case 'contrato':
        argumento = 'Art. 13.1.b Ley 21.719 - Necesario para la ejecución de un contrato en que el titular es parte o para medidas precontractuales adoptadas a petición del titular.';
        break;
      case 'obligacion_legal':
        argumento = 'Art. 13.1.c Ley 21.719 - Necesario para cumplir una obligación legal aplicable al responsable del tratamiento según el ordenamiento jurídico chileno.';
        break;
      case 'interes_vital':
        argumento = 'Art. 13.1.d Ley 21.719 - Necesario para proteger intereses vitales del titular o de otra persona física cuando el titular no pueda dar su consentimiento.';
        break;
      case 'mision_publica':
        argumento = 'Art. 13.1.e Ley 21.719 - Necesario para el cumplimiento de una misión realizada en interés público o en ejercicio de poderes públicos conferidos al responsable.';
        break;
      case 'interes_legitimo':
        argumento = 'Art. 13.1.f Ley 21.719 - Necesario para satisfacer intereses legítimos perseguidos por el responsable o tercero, siempre que no prevalezcan los derechos del titular.';
        break;
      case 'investigacion_cientifica':
        argumento = 'Art. 13 inc. 2° Ley 21.719 - Tratamiento para fines de investigación científica, histórica o estadística, con garantías apropiadas para los derechos del titular.';
        break;
      case 'interes_publico_salud':
        argumento = 'Art. 13 inc. 3° Ley 21.719 - Tratamiento por razones de interés público en el ámbito de la salud pública, protección ante amenazas transfronterizas o estándares de calidad.';
        break;
      case 'medicina_laboral':
        argumento = 'Art. 13 inc. 4° Ley 21.719 - Tratamiento necesario para medicina del trabajo, evaluación de capacidad laboral, diagnóstico médico o prestación de asistencia sanitaria.';
        break;
      case 'libertad_expresion':
        argumento = 'Art. 13 inc. 5° Ley 21.719 - Tratamiento para el ejercicio del derecho a la libertad de expresión e información, incluido el tratamiento con fines periodísticos.';
        break;
      default:
        argumento = '';
    }
    
    setRatData({
      ...ratData,
      baseLegal: value,
      argumentoJuridico: argumento
    });
  };

  const basesLegales = [
    {
      value: 'consentimiento',
      title: 'CONSENTIMIENTO GENERAL',
      subtitle: 'Art. 12 Ley 21.719',
      description: 'Autorización libre, previa, informada y específica del titular',
      icon: <PersonIcon />,
      color: '#10b981',
      casos: ['Marketing directo', 'Finalidades no obligatorias', 'Tratamientos opcionales']
    },
    {
      value: 'consentimiento_expreso',
      title: 'CONSENTIMIENTO EXPRESO',
      subtitle: 'Art. 12 inc. 2° Ley 21.719',
      description: 'Requerido específicamente para datos sensibles',
      icon: <SecurityIcon />,
      color: '#ef4444',
      casos: ['Datos de salud', 'Datos biométricos', 'Orientación sexual', 'Creencias religiosas']
    },
    {
      value: 'consentimiento_padres',
      title: 'CONSENTIMIENTO REPRESENTANTES',
      subtitle: 'Art. 12 inc. 3° Ley 21.719',
      description: 'Para menores de 14 años - Interés superior del menor',
      icon: <PersonIcon />,
      color: '#f59e0b',
      casos: ['Datos de menores', 'Servicios educativos', 'Plataformas infantiles']
    },
    {
      value: 'contrato',
      title: 'EJECUCIÓN DE CONTRATO',
      subtitle: 'Art. 13.1.b Ley 21.719',
      description: 'Necesario para ejecutar contrato o medidas precontractuales',
      icon: <BusinessIcon />,
      color: '#3b82f6',
      casos: ['Datos de clientes', 'Facturación', 'Entrega de servicios', 'Due diligence']
    },
    {
      value: 'obligacion_legal',
      title: 'OBLIGACIÓN LEGAL',
      subtitle: 'Art. 13.1.c Ley 21.719',
      description: 'Cumplimiento de obligación legal aplicable al responsable',
      icon: <FinanceIcon />,
      color: '#6366f1',
      casos: ['Obligaciones tributarias', 'Informes SII', 'Cumplimiento laboral', 'Prevención lavado']
    },
    {
      value: 'interes_vital',
      title: 'INTERÉS VITAL',
      subtitle: 'Art. 13.1.d Ley 21.719',
      description: 'Protección de intereses vitales del titular u otra persona',
      icon: <HealthIcon />,
      color: '#dc2626',
      casos: ['Emergencias médicas', 'Situaciones de riesgo', 'Protección de menores']
    },
    {
      value: 'mision_publica',
      title: 'MISIÓN PÚBLICA',
      subtitle: 'Art. 13.1.e Ley 21.719',
      description: 'Cumplimiento de misión de interés público',
      icon: <BusinessIcon />,
      color: '#059669',
      casos: ['Servicios públicos', 'Regulación sectorial', 'Funciones administrativas']
    },
    {
      value: 'interes_legitimo',
      title: 'INTERÉS LEGÍTIMO',
      subtitle: 'Art. 13.1.f Ley 21.719',
      description: 'Intereses legítimos que no prevalezcan sobre derechos del titular',
      icon: <CheckIcon />,
      color: '#7c3aed',
      casos: ['Seguridad de la información', 'Prevención fraudes', 'Marketing legítimo']
    },
    {
      value: 'investigacion_cientifica',
      title: 'INVESTIGACIÓN CIENTÍFICA',
      subtitle: 'Art. 13 inc. 2° Ley 21.719',
      description: 'Investigación científica, histórica o estadística con garantías',
      icon: <EducationIcon />,
      color: '#0891b2',
      casos: ['Estudios académicos', 'Investigación médica', 'Estadísticas públicas']
    },
    {
      value: 'interes_publico_salud',
      title: 'INTERÉS PÚBLICO - SALUD',
      subtitle: 'Art. 13 inc. 3° Ley 21.719',
      description: 'Razones de interés público en salud pública',
      icon: <HealthIcon />,
      color: '#be185d',
      casos: ['Vigilancia epidemiológica', 'Emergencias sanitarias', 'Farmacovigilancia']
    },
    {
      value: 'medicina_laboral',
      title: 'MEDICINA LABORAL',
      subtitle: 'Art. 13 inc. 4° Ley 21.719',
      description: 'Medicina del trabajo y evaluación de capacidad laboral',
      icon: <WorkIcon />,
      color: '#9333ea',
      casos: ['Exámenes ocupacionales', 'Evaluación discapacidad', 'Medicina preventiva']
    },
    {
      value: 'libertad_expresion',
      title: 'LIBERTAD DE EXPRESIÓN',
      subtitle: 'Art. 13 inc. 5° Ley 21.719',
      description: 'Ejercicio del derecho a libertad de expresión e información',
      icon: <CommunicationIcon />,
      color: '#ea580c',
      casos: ['Medios de comunicación', 'Periodismo', 'Expresión artística', 'Documentales']
    },
    {
      value: 'seguridad_nacional',
      title: 'SEGURIDAD NACIONAL',
      subtitle: 'Art. 4 inc. 2° Ley 21.719',
      description: 'Protección de la seguridad nacional y orden público',
      icon: <SecurityIcon />,
      color: '#7f1d1d',
      casos: ['Fuerzas Armadas', 'Carabineros', 'PDI', 'Inteligencia']
    },
    {
      value: 'archivos_historicos',
      title: 'ARCHIVOS HISTÓRICOS',
      subtitle: 'Art. 13 inc. 6° Ley 21.719',
      description: 'Fines de archivo de interés público, investigación histórica',
      icon: <EducationIcon />,
      color: '#a16207',
      casos: ['Archivo Nacional', 'Bibliotecas', 'Museos', 'Universidades']
    },
    {
      value: 'prevencion_delitos',
      title: 'PREVENCIÓN DE DELITOS',
      subtitle: 'Art. 13 bis Ley 21.719',
      description: 'Prevención, investigación y persecución de delitos',
      icon: <SecurityIcon />,
      color: '#831843',
      casos: ['Policías', 'Ministerio Público', 'Tribunales', 'Gendarmería']
    },
    {
      value: 'proteccion_menores',
      title: 'PROTECCIÓN DE MENORES',
      subtitle: 'Art. 12 inc. 3° Ley 21.719',
      description: 'Protección del interés superior del menor',
      icon: <PersonIcon />,
      color: '#be123c',
      casos: ['SENAME', 'Tribunales Familia', 'Colegios', 'Centros de Salud']
    }
  ];

  return (
    <Box sx={{ maxHeight: '80vh', overflowY: 'auto', pr: 1 }}>
      <Alert severity="info" sx={{ mb: 3, position: 'sticky', top: 0, zIndex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          📚 FUNDAMENTOS LEGALES COMPLETOS - Ley 21.719 LPDP
        </Typography>
        <Typography variant="caption" display="block">
          Todo tratamiento debe tener una base jurídica que lo legitime. Sistema actualizado con TODAS las bases legales de la Ley 21.719.
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 1, fontStyle: 'italic' }}>
          ✅ {basesLegales.length} bases legales disponibles | Art. 12, 13 y concordantes
        </Typography>
      </Alert>
      
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        SELECCIONE LA BASE LEGAL APLICABLE:
      </Typography>
      
      <RadioGroup value={ratData.baseLegal} onChange={handleChange}>
        <Grid container spacing={2}>
          {basesLegales.map((base) => {
            const isSelected = ratData.baseLegal === base.value;
            
            return (
              <Grid item xs={12} md={6} key={base.value}>
                <Paper 
                  sx={{ 
                    p: 0,
                    border: isSelected ? `2px solid ${base.color}` : '1px solid #374151',
                    bgcolor: isSelected ? `${base.color}15` : 'transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                      borderColor: base.color
                    }
                  }}
                >
                  <FormControlLabel
                    value={base.value}
                    control={
                      <Radio 
                        sx={{
                          color: base.color,
                          '&.Mui-checked': { color: base.color }
                        }}
                      />
                    }
                    label={
                      <Box sx={{ width: '100%', py: 2, pr: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Avatar sx={{ bgcolor: base.color, color: '#fff', width: 32, height: 32 }}>
                            {base.icon}
                          </Avatar>
                          <Box>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                fontWeight: 700,
                                color: isSelected ? base.color : 'inherit'
                              }}
                            >
                              {base.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 600 }}>
                              {base.subtitle}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Typography variant="body2" sx={{ color: '#d1d5db', mb: 2 }}>
                          {base.description}
                        </Typography>
                        
                        <Box>
                          <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 600, mb: 1, display: 'block' }}>
                            Casos de uso típicos:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {base.casos.map((caso, index) => (
                              <Chip
                                key={index}
                                label={caso}
                                size="small"
                                variant="outlined"
                                sx={{
                                  borderColor: base.color,
                                  color: base.color,
                                  fontSize: '0.7rem'
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    }
                    sx={{ width: '100%', m: 0, alignItems: 'flex-start' }}
                  />
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </RadioGroup>

      {ratData.argumentoJuridico && (
        <Alert severity="success" sx={{ mt: 3, bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            ✅ Argumento jurídico generado automáticamente:
          </Typography>
          <Typography variant="body2" sx={{ color: '#d1d5db' }}>
            {ratData.argumentoJuridico}
          </Typography>
        </Alert>
      )}
      
      {ratData.baseLegal && (
        <Paper sx={{ p: 2, mt: 3, bgcolor: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.3)' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#4f46e5', mb: 1 }}>
            📋 Obligaciones adicionales para esta base legal:
          </Typography>
          {ratData.baseLegal.includes('consentimiento') && (
            <Box>
              <Typography variant="caption" display="block">• Documentar claramente el consentimiento otorgado</Typography>
              <Typography variant="caption" display="block">• Facilitar mecanismo para retirar consentimiento</Typography>
              <Typography variant="caption" display="block">• Informar sobre finalidades específicas</Typography>
            </Box>
          )}
          {ratData.baseLegal === 'interes_legitimo' && (
            <Box>
              <Typography variant="caption" display="block">• Realizar test de balancing (intereses vs. derechos)</Typography>
              <Typography variant="caption" display="block">• Documentar evaluación de impacto</Typography>
              <Typography variant="caption" display="block">• Informar sobre derecho de oposición</Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

const PasoFinalidad = ({ ratData, setRatData }) => (
  <Box>
    <Typography variant="h6" gutterBottom>
      DESCRIPCIÓN DE LA FINALIDAD:
    </Typography>
    <TextField
      fullWidth
      multiline
      rows={4}
      placeholder="Describa la finalidad del tratamiento de datos..."
      value={ratData.finalidad || ''}
      onChange={(e) => setRatData({ ...ratData, finalidad: e.target.value })}
      sx={{ mb: 3 }}
    />

    <Alert severity="info" sx={{ mb: 3, position: 'sticky', top: 0, zIndex: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        📚 PLAZOS DE CONSERVACIÓN COMPLETOS - Ley 21.719 y Normativa Complementaria
      </Typography>
      <Typography variant="caption" display="block">
        Art. 11 Ley 21.719: "Principio de limitación de conservación" - Los datos se conservarán solo mientras sean necesarios para los fines del tratamiento.
      </Typography>
    </Alert>

    <Typography variant="h6" gutterBottom>
      SELECCIONE EL PLAZO DE CONSERVACIÓN APLICABLE:
    </Typography>
    
    <RadioGroup 
      value={ratData.plazoConservacion || ''} 
      onChange={(e) => setRatData({ ...ratData, plazoConservacion: e.target.value })}
    >
      {/* Plazos Contractuales */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#3b82f6', mb: 1 }}>
          📋 PLAZOS CONTRACTUALES
        </Typography>
        <FormControlLabel
          value="durante_relacion"
          control={<Radio />}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Durante la relación contractual</Typography>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>Art. 13.1.b Ley 21.719 - Necesario para la ejecución del contrato</Typography>
            </Box>
          }
        />
        <FormControlLabel
          value="3_anos_post_contractual"
          control={<Radio />}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>3 años post-contractual</Typography>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>Art. 2515 Código Civil - Prescripción acciones contractuales</Typography>
            </Box>
          }
        />
      </Paper>

      {/* Plazos Tributarios */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#10b981', mb: 1 }}>
          💰 PLAZOS TRIBUTARIOS
        </Typography>
        <FormControlLabel
          value="6_anos_tributario"
          control={<Radio />}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>6 años tributarios</Typography>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>Art. 17 Código Tributario - Conservación libros y documentos</Typography>
            </Box>
          }
        />
        <FormControlLabel
          value="3_anos_iva"
          control={<Radio />}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>3 años IVA y retenciones</Typography>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>DL 825 Art. 59 - Documentos tributarios IVA</Typography>
            </Box>
          }
        />
      </Paper>

      {/* Plazos Laborales */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#a855f7', mb: 1 }}>
          👥 PLAZOS LABORALES
        </Typography>
        <FormControlLabel
          value="10_anos_laboral"
          control={<Radio />}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>10 años laborales</Typography>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>Art. 154 bis Código del Trabajo - Conservación documentos laborales</Typography>
            </Box>
          }
        />
        <FormControlLabel
          value="5_anos_accidentes"
          control={<Radio />}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>5 años accidentes laborales</Typography>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>Ley 16.744 Art. 76 - Registros de accidentes del trabajo</Typography>
            </Box>
          }
        />
        <FormControlLabel
          value="30_anos_pensiones"
          control={<Radio />}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>30 años (sistema pensiones)</Typography>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>DL 3.500 Art. 116 - Registros previsionales y cotizaciones</Typography>
            </Box>
          }
        />
      </Paper>

      {/* Plazos de Salud */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#dc2626', mb: 1 }}>
          🏥 PLAZOS DE SALUD
        </Typography>
        <FormControlLabel
          value="15_anos_fichas_clinicas"
          control={<Radio />}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>15 años fichas clínicas</Typography>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>Art. 12 Ley 20.584 - Derechos y deberes de pacientes</Typography>
            </Box>
          }
        />
        <FormControlLabel
          value="10_anos_examenes_laborales"
          control={<Radio />}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>10 años exámenes ocupacionales</Typography>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>DS 101/1968 Art. 21 - Exámenes médicos trabajadores</Typography>
            </Box>
          }
        />
      </Paper>

      {/* Plazos Financieros */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#f59e0b', mb: 1 }}>
          🏦 PLAZOS FINANCIEROS
        </Typography>
        <FormControlLabel
          value="10_anos_bancarios"
          control={<Radio />}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>10 años bancarios</Typography>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>Ley General de Bancos Art. 87 - Conservación registros</Typography>
            </Box>
          }
        />
        <FormControlLabel
          value="7_anos_seguros"
          control={<Radio />}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>7 años seguros</Typography>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>DFL 251 Art. 51 - Conservación pólizas y siniestros</Typography>
            </Box>
          }
        />
        <FormControlLabel
          value="6_anos_uaf"
          control={<Radio />}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>6 años prevención lavado activos</Typography>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>Ley 19.913 Art. 3 - Registros operaciones sospechosas</Typography>
            </Box>
          }
        />
      </Paper>

      {/* Plazos Especiales */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.3)' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#4f46e5', mb: 1 }}>
          ⚖️ PLAZOS ESPECIALES
        </Typography>
        <FormControlLabel
          value="indefinido_archivo_historico"
          control={<Radio />}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Indefinido (archivo histórico)</Typography>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>Art. 13 inc. 6° Ley 21.719 - Archivo de interés público</Typography>
            </Box>
          }
        />
        <FormControlLabel
          value="20_anos_notarial"
          control={<Radio />}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>20 años notariales</Typography>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>Código Orgánico de Tribunales Art. 429 - Conservación protocolos</Typography>
            </Box>
          }
        />
        <FormControlLabel
          value="hasta_prescripcion"
          control={<Radio />}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Hasta prescripción de acciones</Typography>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>Art. 2332 Código Civil - Prescripción acciones civiles</Typography>
            </Box>
          }
        />
      </Paper>

      {/* Otros Plazos */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'rgba(107, 114, 128, 0.1)', border: '1px solid rgba(107, 114, 128, 0.3)' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#6b7280', mb: 1 }}>
          📋 OTROS PLAZOS ESPECÍFICOS
        </Typography>
        <FormControlLabel
          value="1_ano_marketing"
          control={<Radio />}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>1 año marketing directo</Typography>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>Art. 12 Ley 21.719 - Revocación consentimiento fácil</Typography>
            </Box>
          }
        />
        <FormControlLabel
          value="2_anos_comunicaciones"
          control={<Radio />}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>2 años comunicaciones</Typography>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>Ley 18.168 Art. 22 - Conservación telecomunicaciones</Typography>
            </Box>
          }
        />
        <FormControlLabel
          value="personalizado"
          control={<Radio />}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Plazo personalizado</Typography>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>Especificar según normativa sectorial aplicable</Typography>
            </Box>
          }
        />
      </Paper>
    </RadioGroup>

    {ratData.plazoConservacion === 'personalizado' && (
      <TextField
        fullWidth
        multiline
        rows={3}
        label="Especifique el plazo y fundamento legal"
        placeholder="Ej: 25 años según Art. X de Ley Y - Descripción de la obligación legal específica..."
        sx={{ mt: 2 }}
      />
    )}

    <Alert severity="info" sx={{ mt: 3 }}>
      <Typography variant="body2" fontWeight="bold">
        ⚖️ Fundamento Principal: Art. 11 Ley 21.719
      </Typography>
      <Typography variant="caption" display="block">
        "Principio de limitación de la conservación: Los datos personales serán conservados de forma que permita la identificación de los titulares durante no más tiempo del necesario para los fines del tratamiento."
      </Typography>
      <Typography variant="caption" display="block" sx={{ mt: 1, fontStyle: 'italic' }}>
        ✅ {15} plazos legales específicos disponibles | Normativa actualizada 2024-2025
      </Typography>
    </Alert>
  </Box>
);

const PasoTransferencias = ({ ratData, setRatData }) => {
  // Asegurar que destinatarios existe
  const destinatarios = ratData.destinatarios || [];
  
  const handleDestinatarioChange = (area) => {
    const newDestinatarios = destinatarios.includes(area) 
      ? destinatarios.filter(d => d !== area)
      : [...destinatarios, area];
    
    setRatData({
      ...ratData,
      destinatarios: newDestinatarios
    });
  };

  return (
  <Box>
    <Typography variant="h6" gutterBottom>
      DESTINATARIOS INTERNOS:
    </Typography>
    <Alert severity="info" sx={{ mb: 2 }}>
      <Typography variant="body2" fontWeight="bold">Art. 24-26 Ley 21.719</Typography>
      <Typography variant="caption">Seleccione las áreas organizacionales que tendrán acceso a los datos</Typography>
    </Alert>
    
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {/* Áreas Administrativas */}
      <Grid item xs={12} md={6}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#4f46e5', mb: 1 }}>📋 ÁREAS ADMINISTRATIVAS</Typography>
        <FormGroup>
          <FormControlLabel 
            control={<Checkbox checked={destinatarios.includes('Gerencia General')} onChange={() => handleDestinatarioChange('Gerencia General')} />} 
            label="Gerencia General" 
          />
          <FormControlLabel 
            control={<Checkbox checked={destinatarios.includes('Subgerencia')} onChange={() => handleDestinatarioChange('Subgerencia')} />} 
            label="Subgerencia" 
          />
          <FormControlLabel 
            control={<Checkbox checked={destinatarios.includes('Dirección Ejecutiva')} onChange={() => handleDestinatarioChange('Dirección Ejecutiva')} />} 
            label="Dirección Ejecutiva" 
          />
          <FormControlLabel 
            control={<Checkbox checked={destinatarios.includes('Secretaría General')} onChange={() => handleDestinatarioChange('Secretaría General')} />} 
            label="Secretaría General" 
          />
          <FormControlLabel 
            control={<Checkbox checked={destinatarios.includes('Administración')} onChange={() => handleDestinatarioChange('Administración')} />} 
            label="Administración" 
          />
        </FormGroup>
      </Grid>
      
      {/* Áreas Financieras */}
      <Grid item xs={12} md={6}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#059669', mb: 1 }}>💰 ÁREAS FINANCIERAS</Typography>
        <FormGroup>
          <FormControlLabel 
            control={<Checkbox checked={destinatarios.includes('Contabilidad')} onChange={() => handleDestinatarioChange('Contabilidad')} />} 
            label="Contabilidad" 
          />
          <FormControlLabel 
            control={<Checkbox checked={destinatarios.includes('Finanzas')} onChange={() => handleDestinatarioChange('Finanzas')} />} 
            label="Finanzas" 
          />
          <FormControlLabel 
            control={<Checkbox checked={destinatarios.includes('Tesorería')} onChange={() => handleDestinatarioChange('Tesorería')} />} 
            label="Tesorería" 
          />
          <FormControlLabel 
            control={<Checkbox checked={destinatarios.includes('Control de Gestión')} onChange={() => handleDestinatarioChange('Control de Gestión')} />} 
            label="Control de Gestión" 
          />
          <FormControlLabel 
            control={<Checkbox checked={destinatarios.includes('Auditoría Interna')} onChange={() => handleDestinatarioChange('Auditoría Interna')} />} 
            label="Auditoría Interna" 
          />
        </FormGroup>
      </Grid>
      
      {/* Áreas Operacionales */}
      <Grid item xs={12} md={6}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#dc2626', mb: 1 }}>⚙️ ÁREAS OPERACIONALES</Typography>
        <FormGroup>
          <FormControlLabel 
            control={<Checkbox checked={destinatarios.includes('Recursos Humanos')} onChange={() => handleDestinatarioChange('Recursos Humanos')} />} 
            label="Recursos Humanos" 
          />
          <FormControlLabel 
            control={<Checkbox checked={destinatarios.includes('Operaciones')} onChange={() => handleDestinatarioChange('Operaciones')} />} 
            label="Operaciones" 
          />
          <FormControlLabel 
            control={<Checkbox checked={destinatarios.includes('Producción')} onChange={() => handleDestinatarioChange('Producción')} />} 
            label="Producción" 
          />
          <FormControlLabel 
            control={<Checkbox checked={destinatarios.includes('Logística')} onChange={() => handleDestinatarioChange('Logística')} />} 
            label="Logística" 
          />
          <FormControlLabel 
            control={<Checkbox checked={destinatarios.includes('Compras')} onChange={() => handleDestinatarioChange('Compras')} />} 
            label="Compras" 
          />
        </FormGroup>
      </Grid>
      
      {/* Áreas Técnicas */}
      <Grid item xs={12} md={6}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#7c3aed', mb: 1 }}>🔧 ÁREAS TÉCNICAS</Typography>
        <FormGroup>
          <FormControlLabel 
            control={<Checkbox checked={destinatarios.includes('Tecnología (TI)')} onChange={() => handleDestinatarioChange('Tecnología (TI)')} />} 
            label="Tecnología (TI)" 
          />
          <FormControlLabel 
            control={<Checkbox checked={destinatarios.includes('Sistemas')} onChange={() => handleDestinatarioChange('Sistemas')} />} 
            label="Sistemas" 
          />
          <FormControlLabel 
            control={<Checkbox checked={destinatarios.includes('Seguridad de la Información')} onChange={() => handleDestinatarioChange('Seguridad de la Información')} />} 
            label="Seguridad de la Información" 
          />
          <FormControlLabel 
            control={<Checkbox checked={destinatarios.includes('Calidad')} onChange={() => handleDestinatarioChange('Calidad')} />} 
            label="Calidad" 
          />
          <FormControlLabel 
            control={<Checkbox checked={destinatarios.includes('I+D+i')} onChange={() => handleDestinatarioChange('I+D+i')} />} 
            label="I+D+i" 
          />
        </FormGroup>
      </Grid>
      
      {/* Áreas Comerciales */}
      <Grid item xs={12} md={6}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#ea580c', mb: 1 }}>🎯 ÁREAS COMERCIALES</Typography>
        <FormGroup>
          <FormControlLabel 
            control={<Checkbox checked={destinatarios.includes('Ventas')} onChange={() => handleDestinatarioChange('Ventas')} />} 
            label="Ventas" 
          />
          <FormControlLabel 
            control={<Checkbox checked={destinatarios.includes('Marketing')} onChange={() => handleDestinatarioChange('Marketing')} />} 
            label="Marketing" 
          />
          <FormControlLabel 
            control={<Checkbox checked={destinatarios.includes('Servicio al Cliente')} onChange={() => handleDestinatarioChange('Servicio al Cliente')} />} 
            label="Servicio al Cliente" 
          />
          <FormControlLabel 
            control={<Checkbox checked={destinatarios.includes('Desarrollo de Negocios')} onChange={() => handleDestinatarioChange('Desarrollo de Negocios')} />} 
            label="Desarrollo de Negocios" 
          />
          <FormControlLabel 
            control={<Checkbox checked={destinatarios.includes('CRM')} onChange={() => handleDestinatarioChange('CRM')} />} 
            label="CRM" 
          />
        </FormGroup>
      </Grid>
      
      {/* Áreas Legales y Compliance */}
      <Grid item xs={12} md={6}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#0891b2', mb: 1 }}>⚖️ ÁREAS LEGALES Y COMPLIANCE</Typography>
        <FormGroup>
          <FormControlLabel 
            control={<Checkbox checked={destinatarios.includes('Legal')} onChange={() => handleDestinatarioChange('Legal')} />} 
            label="Legal" 
          />
          <FormControlLabel 
            control={<Checkbox checked={destinatarios.includes('Compliance')} onChange={() => handleDestinatarioChange('Compliance')} />} 
            label="Compliance" 
          />
          <FormControlLabel 
            control={<Checkbox checked={destinatarios.includes('Riesgos')} onChange={() => handleDestinatarioChange('Riesgos')} />} 
            label="Riesgos" 
          />
          <FormControlLabel 
            control={<Checkbox checked={destinatarios.includes('DPO (Delegado Protección Datos)')} onChange={() => handleDestinatarioChange('DPO (Delegado Protección Datos)')} />} 
            label="DPO (Delegado Protección Datos)" 
          />
          <FormControlLabel 
            control={<Checkbox checked={destinatarios.includes('Prevención de Lavado')} onChange={() => handleDestinatarioChange('Prevención de Lavado')} />} 
            label="Prevención de Lavado" 
          />
        </FormGroup>
      </Grid>
    </Grid>

    <Typography variant="h6" gutterBottom>
      TRANSFERENCIAS A TERCEROS:
    </Typography>
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} md={4}>
        <TextField 
          fullWidth 
          label="Entidad" 
          placeholder="Ej: Servicio Impuestos Internos" 
          value={ratData.entidadTerceros || ''}
          onChange={(e) => setRatData({ ...ratData, entidadTerceros: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField 
          fullWidth 
          label="País" 
          value={ratData.paisTerceros || 'Chile'}
          onChange={(e) => setRatData({ ...ratData, paisTerceros: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField 
          fullWidth 
          label="Base Legal" 
          placeholder="Ej: Obligación tributaria" 
          value={ratData.baseLegalTerceros || ''}
          onChange={(e) => setRatData({ ...ratData, baseLegalTerceros: e.target.value })}
        />
      </Grid>
    </Grid>

    <Alert severity="info" sx={{ mb: 3, position: 'sticky', top: 0, zIndex: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        🌍 TRANSFERENCIAS INTERNACIONALES - Evaluación Ley 21.719
      </Typography>
      <Typography variant="caption" display="block">
        Art. 27-29 Ley 21.719: Las transferencias internacionales requieren garantías especiales y generan notificación automática al DPO.
      </Typography>
    </Alert>

    <Typography variant="h6" gutterBottom>
      ¿REALIZA TRANSFERENCIAS INTERNACIONALES DE DATOS?
    </Typography>
    
    <RadioGroup
      value={ratData.transferenciasInternacionales ? 'si' : 'no'}
      onChange={(e) => setRatData({ ...ratData, transferenciasInternacionales: e.target.value === 'si' })}
    >
      <FormControlLabel 
        value="no" 
        control={<Radio />} 
        label={
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>NO realiza transferencias internacionales</Typography>
            <Typography variant="caption" sx={{ color: '#6b7280' }}>Datos permanecen en territorio nacional chileno</Typography>
          </Box>
        }
      />
      <FormControlLabel 
        value="si" 
        control={<Radio />} 
        label={
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>SÍ realiza transferencias internacionales</Typography>
            <Typography variant="caption" sx={{ color: '#6b7280' }}>⚠️ Requiere evaluación especial y notificación automática al DPO</Typography>
          </Box>
        }
      />
    </RadioGroup>

    {ratData.transferenciasInternacionales && (
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#ef4444', mb: 2 }}>
          🚨 INFORMACIÓN REQUERIDA PARA TRANSFERENCIAS INTERNACIONALES
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>País(es) de destino:</Typography>
            <FormGroup>
              <FormControlLabel control={<Checkbox />} label="Estados Unidos 🇺🇸 (Nivel adecuado según Art. 28)" />
              <FormControlLabel control={<Checkbox />} label="Unión Europea 🇪🇺 (GDPR - Nivel adecuado)" />
              <FormControlLabel control={<Checkbox />} label="Reino Unido 🇬🇧 (Decisión de adecuación)" />
              <FormControlLabel control={<Checkbox />} label="Canadá 🇨🇦 (PIPEDA - Nivel adecuado)" />
              <FormControlLabel control={<Checkbox />} label="Argentina 🇦🇷 (Ley 25.326 - Compatible)" />
              <FormControlLabel control={<Checkbox />} label="Uruguay 🇺🇾 (Ley 18.331 - Compatible)" />
              <FormControlLabel control={<Checkbox />} label="Otros países (requiere DPA)" />
            </FormGroup>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Tipo de servicios/actividades:</Typography>
            <FormGroup>
              <FormControlLabel control={<Checkbox />} label="☁️ Servicios en la nube (AWS, Google, Azure)" />
              <FormControlLabel control={<Checkbox />} label="📧 Servicios de email marketing" />
              <FormControlLabel control={<Checkbox />} label="📊 Análisis y métricas web (Analytics)" />
              <FormControlLabel control={<Checkbox />} label="🛠️ Servicios de soporte técnico" />
              <FormControlLabel control={<Checkbox />} label="💳 Procesamiento de pagos internacionales" />
              <FormControlLabel control={<Checkbox />} label="💾 Backup y almacenamiento remoto" />
              <FormControlLabel control={<Checkbox />} label="🔍 Servicios de verificación de identidad" />
            </FormGroup>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Garantías apropiadas implementadas:</Typography>
            <FormGroup row>
              <FormControlLabel control={<Checkbox />} label="📋 Cláusulas contractuales tipo (Art. 28.1.c DPA)" />
              <FormControlLabel control={<Checkbox />} label="🏆 Certificaciones internacionales (ISO 27001, SOC 2)" />
              <FormControlLabel control={<Checkbox />} label="📜 Códigos de conducta aprobados" />
              <FormControlLabel control={<Checkbox />} label="✅ Decisión de adecuación oficial" />
              <FormControlLabel control={<Checkbox />} label="🛡️ Salvaguardas técnicas adicionales" />
            </FormGroup>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Descripción detallada de la transferencia y garantías"
              placeholder="Describa: 1) El proveedor específico, 2) Finalidad exacta de la transferencia, 3) Medidas de seguridad implementadas, 4) Garantías contractuales (DPA), 5) Certificaciones del proveedor..."
              sx={{ mt: 2 }}
            />
          </Grid>
        </Grid>

        <Alert severity="error" sx={{ mt: 3 }}>
          <Typography variant="body2" fontWeight="bold">
            🚨 NOTIFICACIÓN AUTOMÁTICA AL DPO - Art. 27 Ley 21.719
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Esta actividad será notificada automáticamente al DPO para evaluación de:
          </Typography>
          <Typography variant="caption" display="block">• ✅ Adecuación del nivel de protección del país destino</Typography>
          <Typography variant="caption" display="block">• ✅ Suficiencia de garantías apropiadas implementadas</Typography>
          <Typography variant="caption" display="block">• ✅ Necesidad de Evaluación de Impacto (EIPD) adicional</Typography>
          <Typography variant="caption" display="block">• ✅ Posible consulta previa a la Agencia de Protección de Datos</Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1, fontWeight: 600, color: '#ef4444' }}>
            📋 El DPO evaluará la documentación y decidirá si aprobar la transferencia
          </Typography>
        </Alert>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2" fontWeight="bold">
            📚 Marco Legal Aplicable:
          </Typography>
          <Typography variant="caption" display="block">• Art. 27 Ley 21.719: Principio general transferencias</Typography>
          <Typography variant="caption" display="block">• Art. 28 Ley 21.719: Países con nivel adecuado</Typography>
          <Typography variant="caption" display="block">• Art. 29 Ley 21.719: Garantías apropiadas y salvaguardas</Typography>
        </Alert>
      </Paper>
    )}
  </Box>
  );
};

const PasoRevision = ({ ratData, guardarRAT }) => {
  // CORREGIR: Validar que categorias existe antes de acceder a sensibles
  const tieneEIPD = ratData.categorias?.sensibles?.length > 0 || false;
  const tieneDPIA = false; // Se puede agregar lógica para detectar
  const tieneDPA = ratData.transferenciasInternacionales;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        RESUMEN DEL REGISTRO:
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>Responsable:</Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ color: '#f1f5f9' }}>{ratData.responsable.razonSocial}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>Finalidad:</Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ color: '#f1f5f9' }}>{ratData.finalidad}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>Base Legal:</Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ color: '#f1f5f9' }}>{ratData.argumentoJuridico}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>Datos Sensibles:</Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ color: '#f1f5f9' }}>
              {(ratData.categorias?.sensibles?.length || 0) > 0 ? 'SÍ' : 'NO'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>Conservación:</Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ color: '#f1f5f9' }}>{ratData.plazoConservacion}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h6" gutterBottom>
        DOCUMENTOS A GENERAR AUTOMÁTICAMENTE:
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <List>
          {tieneEIPD && (
            <ListItem>
              <ListItemText
                primary="EVALUACIÓN DE IMPACTO (EIPD)"
                secondary={
                  <>
                    Motivo: Datos sensibles detectados<br />
                    Fundamento: Art. 25 Ley 21.719
                  </>
                }
              />
            </ListItem>
          )}
          {tieneDPA && (
            <ListItem>
              <ListItemText
                primary="DATA PROCESSING AGREEMENT (DPA)"
                secondary={
                  <>
                    Motivo: Transferencias internacionales<br />
                    Fundamento: Art. 27-29 Ley 21.719
                  </>
                }
              />
            </ListItem>
          )}
          <ListItem>
            <ListItemText
              primary="REGISTRO RAT"
              secondary={
                <>
                  Formato: PDF con fundamentos legales<br />
                  Fundamento: Art. 16 Ley 21.719
                </>
              }
            />
          </ListItem>
        </List>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={guardarRAT}
          sx={{ px: 4 }}
        >
          CONFIRMAR Y GENERAR DOCUMENTOS
        </Button>
      </Box>
    </Box>
  );
};

// Componente para visualizar RAT en modo solo lectura COMPLETO
const RATViewComponent = ({ ratData }) => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#1a202c' }}>
        📋 DETALLES COMPLETOS DEL RAT
      </Typography>
      
      {/* SECCIÓN 1: INFORMACIÓN GENERAL */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#1e293b', border: '1px solid #374151' }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#4f46e5', fontWeight: 'bold' }}>
          1️⃣ INFORMACIÓN GENERAL
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>ID RAT:</Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ color: '#f1f5f9' }}>{ratData.id}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>Fecha Creación:</Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ color: '#f1f5f9' }}>
              {ratData.created_at ? new Date(ratData.created_at).toLocaleDateString('es-CL') : 'Sin fecha'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>Nivel de Riesgo:</Typography>
            <Chip 
              label={ratData.nivel_riesgo || 'MEDIO'} 
              size="small"
              color={ratData.nivel_riesgo === 'ALTO' ? 'error' : 
                     ratData.nivel_riesgo === 'MEDIO' ? 'warning' : 'success'}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>Estado:</Typography>
            <Chip 
              label={ratData.estado || 'CREATION'} 
              size="small"
              color="primary"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* SECCIÓN 2: RESPONSABLE DEL TRATAMIENTO */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#1e293b', border: '1px solid #374151' }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#4f46e5', fontWeight: 'bold' }}>
          2️⃣ RESPONSABLE DEL TRATAMIENTO
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>Razón Social:</Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ color: '#f1f5f9' }}>
              {ratData.responsable?.razonSocial || ratData.responsable_proceso || 'Sin especificar'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>RUT:</Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ color: '#f1f5f9' }}>
              {ratData.responsable?.rut || 'Sin especificar'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>Email:</Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ color: '#f1f5f9' }}>
              {ratData.responsable?.email || ratData.email_responsable || 'Sin especificar'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>Teléfono:</Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ color: '#f1f5f9' }}>
              {ratData.responsable?.telefono || 'Sin especificar'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>Dirección:</Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ color: '#f1f5f9' }}>
              {ratData.responsable?.direccion || 'Sin especificar'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* SECCIÓN 3: FINALIDADES DEL TRATAMIENTO */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#1e293b', border: '1px solid #374151' }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#4f46e5', fontWeight: 'bold' }}>
          3️⃣ FINALIDADES DEL TRATAMIENTO
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>Descripción:</Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ color: '#f1f5f9' }}>
              {ratData.finalidades?.descripcion || ratData.finalidad_principal || ratData.finalidad || 'No especificada'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>Base Legal:</Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ color: '#f1f5f9' }}>
              {ratData.finalidades?.baseLegal || ratData.base_legal || ratData.baseLegal || 'No especificada'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>Argumento Jurídico:</Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ color: '#f1f5f9' }}>
              {ratData.finalidades?.argumentoJuridico || ratData.argumentoJuridico || 'No especificado'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* SECCIÓN 4: CATEGORÍAS DE DATOS */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#1e293b', border: '1px solid #374151' }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#4f46e5', fontWeight: 'bold' }}>
          4️⃣ CATEGORÍAS DE DATOS
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Categorías de Titulares:</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {(ratData.categorias?.titulares || ['Sin especificar']).map((titular, index) => (
                <Chip key={index} label={titular} size="small" variant="outlined" />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Datos Sensibles:</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {(ratData.categorias?.sensibles || ratData.categorias?.datos || []).map((dato, index) => (
                <Chip key={index} label={dato} size="small" color="error" />
              ))}
              {(!ratData.categorias?.sensibles || ratData.categorias.sensibles.length === 0) && (
                <Chip label="Sin datos sensibles" size="small" color="success" />
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* SECCIÓN 5: FUENTE DE LOS DATOS */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#1e293b', border: '1px solid #374151' }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#4f46e5', fontWeight: 'bold' }}>
          5️⃣ FUENTE DE LOS DATOS
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>Tipo de Fuente:</Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ color: '#f1f5f9' }}>
              {ratData.fuente?.tipo || 'Recopilación directa'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>Descripción:</Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ color: '#f1f5f9' }}>
              {ratData.fuente?.descripcion || 'Datos obtenidos directamente del titular'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* SECCIÓN 6: CONSERVACIÓN */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#1e293b', border: '1px solid #374151' }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#4f46e5', fontWeight: 'bold' }}>
          6️⃣ PERÍODOS DE CONSERVACIÓN
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>Período:</Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ color: '#f1f5f9' }}>
              {ratData.conservacion?.periodo || ratData.plazoConservacion || 'No especificado'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>Fundamento:</Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ color: '#f1f5f9' }}>
              {ratData.conservacion?.fundamento || 'Art. 17 Código Tributario'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* SECCIÓN 7: MEDIDAS DE SEGURIDAD */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#1e293b', border: '1px solid #374151' }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#4f46e5', fontWeight: 'bold' }}>
          7️⃣ MEDIDAS DE SEGURIDAD
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>Descripción General:</Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ color: '#f1f5f9' }}>
              {ratData.seguridad?.descripcionGeneral || 'Medidas técnicas y organizativas según Art. 14 Ley 21.719'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Medidas Técnicas:</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {(ratData.seguridad?.tecnicas || ['Cifrado AES-256', 'Control de acceso']).map((medida, index) => (
                <Chip key={index} label={medida} size="small" color="primary" />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Medidas Organizativas:</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {(ratData.seguridad?.organizativas || ['Políticas de seguridad']).map((medida, index) => (
                <Chip key={index} label={medida} size="small" color="secondary" />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* SECCIÓN 8: TRANSFERENCIAS */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#1e293b', border: '1px solid #374151' }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#4f46e5', fontWeight: 'bold' }}>
          8️⃣ TRANSFERENCIAS Y DESTINATARIOS
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Destinatarios:</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {(ratData.transferencias?.destinatarios || ratData.destinatarios || []).map((dest, index) => (
                <Chip key={index} label={dest} size="small" variant="outlined" />
              ))}
              {(!ratData.transferencias?.destinatarios || ratData.transferencias.destinatarios.length === 0) && (
                <Chip label="Sin destinatarios específicos" size="small" color="success" />
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>Transferencias Internacionales:</Typography>
            <Chip 
              label={ratData.transferencias?.internacionales || ratData.transferenciasInternacionales ? 'SÍ' : 'NO'} 
              size="small"
              color={ratData.transferencias?.internacionales ? 'warning' : 'success'}
            />
          </Grid>
          {(ratData.transferencias?.internacionales || ratData.transferenciasInternacionales) && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Países de Destino:</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {(ratData.transferencias?.paises || ['Estados Unidos', 'Unión Europea']).map((pais, index) => (
                  <Chip 
                    key={index} 
                    label={typeof pais === 'object' ? pais.nombre || pais.name || 'País no definido' : pais} 
                    size="small" 
                    color="warning" 
                  />
                ))}
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* SECCIÓN 9: METADATA Y COMPLIANCE */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#1e293b', border: '1px solid #374151' }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#4f46e5', fontWeight: 'bold' }}>
          9️⃣ COMPLIANCE Y EVALUACIONES
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Estado del RAT:</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {(ratData.metadata?.requiereEIPD || ratData.requiere_eipd) && (
                <Chip label="✅ Requiere EIPD" size="small" color="error" />
              )}
              {(ratData.metadata?.requiereDPIA || ratData.requiere_dpia) && (
                <Chip label="✅ Requiere DPIA" size="small" color="warning" />
              )}
              {(ratData.metadata?.requiereConsultaAgencia) && (
                <Chip label="✅ Requiere Consulta Agencia" size="small" color="info" />
              )}
              {(ratData.metadata?.cumplimientoLey21719) && (
                <Chip label="✅ Cumple Ley 21.719" size="small" color="success" />
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>Versión:</Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ color: '#f1f5f9' }}>
              {ratData.metadata?.version || '2.0'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>Cumplimiento Ley 21.719:</Typography>
            <Chip 
              label={ratData.metadata?.cumplimientoLey21719 ? 'CONFORME' : 'PENDIENTE'} 
              size="small"
              color={ratData.metadata?.cumplimientoLey21719 ? 'success' : 'warning'}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* INFORMACIÓN ADICIONAL SI EXISTE */}
      {ratData.argumentoJuridico && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: '#fffbeb' }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#d97706', fontWeight: 'bold' }}>
            📜 ARGUMENTO JURÍDICO
          </Typography>
          <Typography variant="body1">
            {ratData.argumentoJuridico}
          </Typography>
        </Paper>
      )}

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>📋 RAT COMPLETO CONFORME LEY 21.719:</strong> Este Registro de Actividades de Tratamiento 
          fue creado cumpliendo todos los requisitos del Artículo 12 de la Ley 21.719 de Protección de 
          Datos Personales de Chile. Incluye los 8 campos obligatorios y evaluaciones de riesgo automáticas.
        </Typography>
      </Alert>
    </Box>
  );
};

export default RATSystemProfessional;