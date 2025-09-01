import React, { useState, useEffect } from 'react';
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
  IconButton
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  ContentCopy as ContentCopyIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ratService from '../services/ratService';
import ratIntelligenceEngine from '../services/ratIntelligenceEngine';
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
  const { currentTenant } = useTenant();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [rats, setRats] = useState([]);
  const [showRATList, setShowRATList] = useState(true);
  const [isCreatingRAT, setIsCreatingRAT] = useState(false);
  const [showEmpresaManager, setShowEmpresaManager] = useState(false);
  const [editingRAT, setEditingRAT] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'edit', 'view'
  
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

  // Cargar RATs existentes y datos comunes de empresa
  useEffect(() => {
    cargarRATs();
    cargarDatosComunes();
  }, []);

  const cargarDatosComunes = async () => {
    if (currentTenant) {
      // Pre-llenar datos del responsable con datos del tenant actual desde Supabase
      setRatData(prev => ({
        ...prev,
        responsable: {
          razonSocial: currentTenant.company_name || prev.responsable.razonSocial,
          rut: currentTenant.rut || prev.responsable.rut,
          direccion: currentTenant.direccion || prev.responsable.direccion,
          nombre: currentTenant.dpo?.nombre || prev.responsable.nombre,
          email: currentTenant.dpo?.email || user?.email || prev.responsable.email,
          telefono: currentTenant.dpo?.telefono || prev.responsable.telefono,
        },
        plataformasTecnologicas: currentTenant.plataformasTecnologicas || [],
        politicasRetencion: currentTenant.politicasRetencion || {}
      }));
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

  const iniciarNuevoRAT = () => {
    setEditingRAT(null);
    setIsCreatingRAT(true);
    setShowRATList(false);
    setShowEmpresaManager(false);
    setViewMode('create');
    setCurrentStep(0);
    // Limpiar formulario
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
        setEditingRAT(ratId);
        // Mapear datos del RAT guardado al formato esperado por el formulario
        setRatData({
          responsable: {
            razonSocial: ratToEdit.responsable?.razonSocial || ratToEdit.responsable_proceso || '',
            rut: ratToEdit.responsable?.rut || ratToEdit.responsable_rut || '',
            direccion: ratToEdit.responsable?.direccion || '',
            nombre: ratToEdit.responsable?.nombre || '',
            email: ratToEdit.responsable?.email || ratToEdit.email_responsable || '',
            telefono: ratToEdit.responsable?.telefono || '',
          },
          categorias: {
            identificacion: ratToEdit.categorias?.identificacion || [], // ARRAY
            sensibles: ratToEdit.categorias?.sensibles || ratToEdit.categorias?.datos?.sensibles || [], // ARRAY
          },
          baseLegal: ratToEdit.finalidades?.baseLegal || ratToEdit.base_legal || '',
          argumentoJuridico: ratToEdit.finalidades?.argumentoJuridico || '',
          finalidad: ratToEdit.finalidades?.descripcion || ratToEdit.finalidad_principal || ratToEdit.finalidad || '',
          plazoConservacion: ratToEdit.conservacion?.periodo || '',
          destinatarios: ratToEdit.transferencias?.destinatarios || [],
          transferenciasInternacionales: ratToEdit.transferencias?.internacionales || false,
          documentosRequeridos: [],
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
        // Limpiar datos específicos y crear copia
        const nuevaData = {
          ...ratData,
          responsable: {
            ...ratData.responsable,
            nombre: ratData.responsable.nombre + ' (Copia)',
          }
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

  const guardarRAT = async () => {
    try {
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
          version: '2.0',
          cumplimientoLey21719: true,
          requiereEIPD: ratData.categorias.sensibles.length > 0,
          requiereDPIA: ratData.categorias.sensibles.length > 2,
          requiereConsultaAgencia: ratData.categorias.sensibles.includes('datos_salud'),
        },
        estado: 'CREATION',
        nivel_riesgo: ratData.categorias.sensibles.length > 0 ? 'ALTO' : 'MEDIO',
      };
      
      console.log(viewMode === 'edit' ? '📝 Actualizando RAT:' : '📦 Guardando RAT con estructura completa:', ratCompleto);
      
      let resultado;
      if (viewMode === 'edit') {
        resultado = await ratService.updateRAT(editingRAT, ratCompleto);
      } else {
        resultado = await ratService.saveCompletedRAT(ratCompleto, 'Sistema', 'Manual');
      }
      
      if (resultado && resultado.id) {
        console.log(viewMode === 'edit' ? '✅ RAT actualizado exitosamente con ID:' : '✅ RAT guardado exitosamente con ID:', resultado.id);
        
        if (ratCompleto.metadata.requiereEIPD) {
          const notificacionDPO = {
            tipo: 'EIPD_REQUERIDO',
            ratId: resultado.id,
            mensaje: `RAT ${ratId} requiere Evaluación de Impacto (datos sensibles detectados)`,
            fecha: new Date().toISOString(),
            fundamento: 'Art. 19 Ley 21.719',
          };
          await supabase
            .from('dpo_notifications')
            .insert({
              rat_id: ratId,
              tenant_id: currentTenant?.id,
              user_id: user?.id,
              tipo: 'evaluacion_impacto',
              mensaje: notificacionDPO.mensaje,
              fundamento: notificacionDPO.fundamento,
              created_at: new Date().toISOString(),
              status: 'pending'
            });
          console.log('🔔 Notificación DPO creada:', notificacionDPO);
        }
        
        const verification = await ratService.getCompletedRATs();
        console.log('🔍 Verificación de persistencia - Total RATs:', verification.length);
        
        setRats(verification);
        alert(`✅ RAT ${ratId} ${viewMode === 'edit' ? 'actualizado' : 'guardado'} exitosamente en Supabase`);
      }
      
      if (viewMode === 'edit') {
        setViewMode('list');
        setEditingRAT(null);
      } else {
        volverAInicio();
      }
      setCurrentStep(0);
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
      console.error('Error guardando RAT:', error);
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
              
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Tarjeta principal - Crear RAT */}
                <Grid item xs={12} md={8}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ textAlign: 'center', py: 5 }}>
                      <Typography variant="h5" gutterBottom>
                        INICIAR REGISTRO DE TRATAMIENTO
                      </Typography>
                      <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', my: 2, mx: 'auto', width: '50%' }} />
                      <Typography variant="body1" paragraph>
                        Fundamento: Art. 16 Ley 21.719
                      </Typography>
                      <Typography variant="caption" display="block" paragraph>
                        "Obligación del responsable de mantener un registro de actividades de tratamiento"
                      </Typography>
                      <Button 
                        variant="contained" 
                        size="large"
                        sx={{ 
                          mt: 2,
                          fontWeight: 700
                        }}
                        onClick={iniciarNuevoRAT}
                      >
                        COMENZAR REGISTRO
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Tarjeta secundaria - Gestión de empresa */}
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ textAlign: 'center', py: 5 }}>
                      <Typography variant="h6" gutterBottom>
                        DATOS COMUNES
                      </Typography>
                      <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', my: 2, mx: 'auto', width: '70%' }} />
                      <Typography variant="body2" paragraph>
                        Simplifica la creación de RATs
                      </Typography>
                      <Typography variant="caption" display="block" paragraph>
                        DPO, plataformas, políticas de retención
                      </Typography>
                      <Button 
                        variant="contained" 
                        size="medium"
                        sx={{ 
                          mt: 2,
                          fontWeight: 700
                        }}
                        onClick={mostrarGestionEmpresa}
                      >
                        GESTIONAR
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1">
                  Registros Existentes: {rats.length}
                </Typography>
                <Typography variant="body1">
                  Pendientes: {rats.filter(r => r.estado !== 'completado').length} | 
                  Completos: {rats.filter(r => r.estado === 'completado').length}
                </Typography>
              </Box>
              
              {rats.length > 0 && (
                <Box>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      📦 RATs guardados en Supabase: {rats.length} registros
                    </Typography>
                  </Alert>
                  <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>ID RAT</TableCell>
                          <TableCell>RESPONSABLE</TableCell>
                          <TableCell>FINALIDAD</TableCell>
                          <TableCell>BASE LEGAL</TableCell>
                          <TableCell>DATOS SENSIBLES</TableCell>
                          <TableCell>RIESGO</TableCell>
                          <TableCell>ACCIONES REQUERIDAS</TableCell>
                          <TableCell>FECHA</TableCell>
                          <TableCell>ACCIONES</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rats.map((rat) => {
                          const tieneSensibles = rat.metadata?.requiereEIPD || rat.requiere_eipd;
                          const fecha = rat.created_at || rat.fechaCreacion;
                          return (
                            <TableRow key={rat.id} hover>
                              <TableCell>
                                <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                  {rat.id?.substring(0, 12)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {rat.responsable_proceso || rat.responsable?.nombre || 'Sin especificar'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {rat.email_responsable || rat.responsable?.email || ''}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ maxWidth: 200 }}>
                                  {rat.finalidad_principal || rat.finalidades?.descripcion || rat.finalidad || 'No especificada'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={rat.base_legal || rat.baseLegal || 'Art. 13 L21.719'} 
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                />
                              </TableCell>
                              <TableCell align="center">
                                {tieneSensibles ? (
                                  <Chip label="SÍ" size="small" color="error" />
                                ) : (
                                  <Chip label="NO" size="small" color="success" />
                                )}
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={rat.nivel_riesgo || 'MEDIO'} 
                                  size="small"
                                  color={rat.nivel_riesgo === 'ALTO' ? 'error' : 
                                         rat.nivel_riesgo === 'MEDIO' ? 'warning' : 'success'}
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                  {(rat.metadata?.requiereEIPD || rat.requiere_eipd) && (
                                    <Chip label="EIPD" size="small" color="error" />
                                  )}
                                  {(rat.metadata?.requiereDPIA || rat.requiere_dpia) && (
                                    <Chip label="DPIA" size="small" color="warning" />
                                  )}
                                  {(rat.metadata?.requiereConsultaAgencia) && (
                                    <Chip label="CONSULTA" size="small" color="info" />
                                  )}
                                  {!tieneSensibles && (
                                    <Chip label="COMPLETO" size="small" color="success" />
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="caption">
                                  {fecha ? new Date(fecha).toLocaleDateString('es-CL') : 'Sin fecha'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => verRAT(rat.id)}
                                    title="Ver RAT"
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton 
                                    size="small" 
                                    color="secondary"
                                    onClick={() => editarRAT(rat.id)}
                                    title="Editar RAT"
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton 
                                    size="small" 
                                    color="info"
                                    onClick={() => duplicarRAT(rat.id)}
                                    title="Duplicar RAT"
                                  >
                                    <ContentCopyIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => eliminarRAT(rat.id)}
                                    title="Eliminar RAT"
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    * Todos los registros están almacenados en Supabase con respaldo automático
                  </Typography>
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
        title={viewMode === 'edit' ? "Editar RAT" : "Crear Nuevo RAT"}
        subtitle={`Paso ${currentStep + 1} de ${steps.length} - ${steps[currentStep]}`}
        maxWidth="lg"
      >
            {/* Header con progreso */}
            <LinearProgress 
              variant="determinate" 
              value={(currentStep + 1) / steps.length * 100}
              sx={{ height: 8, mb: 4, borderRadius: 1 }}
            />

            {/* Contenido del paso actual */}
            <Box sx={{ minHeight: 400 }}>
              {currentStep === 0 && <PasoIdentificacion ratData={ratData} setRatData={setRatData} />}
              {currentStep === 1 && <PasoCategorias ratData={ratData} setRatData={setRatData} />}
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
    setRatData({
      ...ratData,
      responsable: { ...ratData.responsable, rut: rut }
    });
    
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
          onChange={(e) => setRatData({
            ...ratData,
            responsable: { ...ratData.responsable, razonSocial: e.target.value }
          })}
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
          onChange={(e) => setRatData({
            ...ratData,
            responsable: { ...ratData.responsable, direccion: e.target.value }
          })}
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
          onChange={(e) => setRatData({
            ...ratData,
            responsable: { ...ratData.responsable, nombre: e.target.value }
          })}
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
          onChange={(e) => setRatData({
            ...ratData,
            responsable: { ...ratData.responsable, email: e.target.value }
          })}
          helperText="Email oficial para consultas de privacidad"
          required
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Teléfono DPO *"
          value={ratData.responsable.telefono}
          onChange={(e) => setRatData({
            ...ratData,
            responsable: { ...ratData.responsable, telefono: e.target.value }
          })}
          helperText="Teléfono directo del DPO"
          required
        />
      </Grid>
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

const PasoCategorias = ({ ratData, setRatData }) => {
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
        console.log('✅ Categoría agregada:', value);
      } else {
        setRatData({
          ...ratData,
          categorias: { 
            ...ratData.categorias, 
            identificacion: current.filter(v => v !== value) 
          }
        });
        console.log('❌ Categoría removida:', value);
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
        console.log('🚨 Dato sensible agregado - Trigger EIPD:', value);
      } else {
        setRatData({
          ...ratData,
          categorias: { 
            ...ratData.categorias, 
            sensibles: current.filter(v => v !== value) 
          }
        });
        console.log('✅ Dato sensible removido:', value);
      }
    } catch (error) {
      console.error('🚨 Error en handleSensibles:', error);
    }
  };

  // VERIFICAR QUE ARRAYS ESTÉN INICIALIZADOS
  React.useEffect(() => {
    if (!Array.isArray(ratData.categorias.identificacion) || 
        !Array.isArray(ratData.categorias.sensibles)) {
      console.log('🔧 Corrigiendo inicialización de categorías...');
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

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          📖 Fundamento Legal: Art. 2 letras f) y g) Ley 21.719
        </Typography>
        <Typography variant="caption" display="block">
          Los datos personales se clasifican según su naturaleza. Cada categoría requiere medidas específicas de protección.
          El responsable debe identificar correctamente qué datos trata para aplicar las salvaguardas apropiadas.
        </Typography>
      </Alert>
      
      <Typography variant="h6" gutterBottom>
        📋 DATOS DE IDENTIFICACIÓN - Art. 2 f) Ley 21.719
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        "Información que permite identificar a una persona natural, directa o indirectamente"
      </Typography>
      <FormGroup row>
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="nombre" />}
          label="Nombre y apellidos"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="rut" />}
          label="RUT o Cédula de Identidad"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="direccion" />}
          label="Dirección domiciliaria"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="telefono" />}
          label="Número telefónico"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="email" />}
          label="Correo electrónico"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="firma" />}
          label="Firma manuscrita"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="fotografia" />}
          label="Fotografía o imagen"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="grabacion_video" />}
          label="Grabación audiovisual"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="grabacion_audio" />}
          label="Grabación de voz"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="imagen_vigilancia" />}
          label="Imagen de cámaras vigilancia"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="huella_digital" />}
          label="Huella dactilar"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="geolocalizacion" />}
          label="Datos de geolocalización"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="direccion_ip" />}
          label="Dirección IP"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="cookies_identificacion" />}
          label="Cookies identificadoras"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="numero_cuenta" />}
          label="Número de cuenta bancaria"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="patente_vehiculo" />}
          label="Patente de vehículo"
        />
      </FormGroup>

      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        🚨 DATOS SENSIBLES - Art. 2 letra g) Ley 21.719
      </Typography>
      <Typography variant="body2" color="error.main" sx={{ mb: 2, fontWeight: 600 }}>
        "Categorías especiales de datos personales que revelan información íntima" - PROTECCIÓN REFORZADA OBLIGATORIA
      </Typography>
      <FormGroup row>
        <FormControlLabel
          control={<Checkbox onChange={handleSensibles} value="origen_racial" />}
          label="Origen racial o étnico - Art. 2 g) i)"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleSensibles} value="opiniones_politicas" />}
          label="Opiniones políticas - Art. 2 g) ii)"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleSensibles} value="convicciones_religiosas" />}
          label="Convicciones religiosas - Art. 2 g) iii)"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleSensibles} value="afiliacion_sindical" />}
          label="Afiliación sindical - Art. 2 g) iv)"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleSensibles} value="vida_sexual" />}
          label="Vida sexual u orientación sexual - Art. 2 g) v)"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleSensibles} value="datos_salud" />}
          label="Datos de salud física o mental - Art. 2 g) vi)"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleSensibles} value="datos_biometricos" />}
          label="Datos biométricos únicos - Art. 2 g) vii)"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleSensibles} value="antecedentes_penales" />}
          label="Antecedentes penales o infracciones - Art. 2 g) viii)"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleSensibles} value="datos_geneticos" />}
          label="Datos genéticos - Art. 2 g) ix)"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleSensibles} value="localizacion_permanente" />}
          label="Localización permanente - Art. 2 g) x)"
        />
      </FormGroup>

      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        📊 DATOS FINANCIEROS Y COMERCIALES - Art. 2 f) Ley 21.719
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Información económica y comercial - Principio de proporcionalidad Art. 5° Ley 21.719
      </Typography>
      <FormGroup row>
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="ingresos_economicos" />}
          label="Ingresos económicos"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="historial_crediticio" />}
          label="Historial crediticio - Art. 2 f)"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="transacciones_bancarias" />}
          label="Transacciones bancarias"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="habitos_consumo" />}
          label="Hábitos de consumo"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="scoring_financiero" />}
          label="Scoring financiero → Trigger DPIA Art. 20"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="morosidad" />}
          label="Información de morosidad"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="patrimonio" />}
          label="Datos patrimoniales"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="seguros" />}
          label="Pólizas de seguros"
        />
      </FormGroup>

      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        💼 DATOS LABORALES - Art. 2 f) y Art. 154 bis Código del Trabajo
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Conservación: 5 años desde término relación laboral - Art. 11 Ley 21.719
      </Typography>
      <FormGroup row>
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="cargo_posicion" />}
          label="Cargo o posición"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="sueldo_remuneracion" />}
          label="Sueldo o remuneración"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="evaluaciones_desempeno" />}
          label="Evaluaciones desempeño → Posible DPIA Art. 20"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="historial_laboral" />}
          label="Historial laboral"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="referencias_laborales" />}
          label="Referencias laborales"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="amonestaciones" />}
          label="Amonestaciones o sanciones"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="licencias_medicas" />}
          label="Licencias médicas → Dato sensible Art. 2 g) vi)"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="prevision_social" />}
          label="Datos previsión social (AFP, ISAPRE)"
        />
      </FormGroup>

      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        🎓 DATOS ACADÉMICOS Y FORMATIVOS - Art. 2 f) Ley 21.719
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Principio de calidad: Datos exactos y actualizados - Art. 6° Ley 21.719
      </Typography>
      <FormGroup row>
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="titulos_profesionales" />}
          label="Títulos profesionales"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="certificaciones" />}
          label="Certificaciones"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="historial_academico" />}
          label="Historial académico"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="capacitaciones" />}
          label="Capacitaciones"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="calificaciones" />}
          label="Calificaciones y notas"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="idiomas" />}
          label="Competencias idiomáticas"
        />
      </FormGroup>

      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        📡 DATOS DE COMUNICACIONES - Art. 2 f) y Art. 19 N°4 Constitución
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Secreto e inviolabilidad de comunicaciones - Requiere consentimiento expreso Art. 12
      </Typography>
      <FormGroup row>
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="registros_llamadas" />}
          label="Registros de llamadas"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="mensajeria" />}
          label="Mensajes (SMS, WhatsApp, email)"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="metadata_comunicaciones" />}
          label="Metadata de comunicaciones"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="contenido_comunicaciones" />}
          label="Contenido comunicaciones → EIPD Art. 19"
        />
      </FormGroup>

      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        🌐 DATOS DE NAVEGACIÓN Y COOKIES - Art. 2 f) Ley 21.719
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Transparencia obligatoria - Art. 9° y Art. 15 Ley 21.719
      </Typography>
      <FormGroup row>
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="cookies_analiticas" />}
          label="Cookies analíticas"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="cookies_publicidad" />}
          label="Cookies publicitarias"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="historial_navegacion" />}
          label="Historial de navegación"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="comportamiento_online" />}
          label="Comportamiento online → Posible DPIA Art. 20"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="dispositivos_id" />}
          label="Identificadores de dispositivos"
        />
      </FormGroup>

      {ratData.categorias.sensibles.length > 0 && (
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

      {(Array.isArray(ratData.categorias.identificacion) && 
        (ratData.categorias.identificacion.includes('fotografia') || 
         ratData.categorias.identificacion.includes('grabacion_video') ||
         ratData.categorias.identificacion.includes('imagen_vigilancia'))) && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2" fontWeight="bold">
            ⚠️ IMÁGENES/VIDEOS DETECTADOS - Requiere medidas especiales
          </Typography>
          <Typography variant="caption">
            Base legal: Art. 2 f) dato personal + Art. 12 consentimiento expreso Ley 21.719
          </Typography>
          <Typography variant="caption" display="block">
            Videovigilancia: Art. 19 EIPD obligatoria para observación sistemática zonas públicas
          </Typography>
          <Typography variant="caption" display="block">
            Obligación: Señalización visible + Política de retención Art. 11 Ley 21.719
          </Typography>
        </Alert>
      )}

      {(Array.isArray(ratData.categorias.identificacion) && 
        ratData.categorias.identificacion.includes('geolocalizacion')) && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="body2" fontWeight="bold">
            🚨 GEOLOCALIZACIÓN DETECTADA - Múltiples obligaciones legales
          </Typography>
          <Typography variant="caption">
            1. EIPD obligatoria: Art. 19 Ley 21.719 - Observación sistemática
          </Typography>
          <Typography variant="caption" display="block">
            2. Si es permanente: Dato sensible Art. 2 g) x) - Protección reforzada
          </Typography>
          <Typography variant="caption" display="block">
            3. Consentimiento granular requerido - Art. 12 Ley 21.719
          </Typography>
          <Typography variant="caption" display="block" color="error">
            4. Sanción: Hasta 20.000 UTM por tratamiento ilegal - Art. 34 quáter
          </Typography>
        </Alert>
      )}

      {(Array.isArray(ratData.categorias.identificacion) && 
        (ratData.categorias.identificacion.includes('scoring_financiero') ||
         ratData.categorias.identificacion.includes('comportamiento_online'))) && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2" fontWeight="bold">
            🤖 ALGORITMOS/SCORING DETECTADO - DPIA automática
          </Typography>
          <Typography variant="caption">
            Art. 20 Ley 21.719: Evaluación previa de algoritmos obligatoria
          </Typography>
          <Typography variant="caption" display="block">
            Art. 28: Derecho a no ser objeto de decisiones automatizadas
          </Typography>
          <Typography variant="caption" display="block">
            Obligación: Documentar lógica aplicada y permitir intervención humana
          </Typography>
        </Alert>
      )}

      {(Array.isArray(ratData.categorias.identificacion) && 
        ratData.categorias.identificacion.includes('licencias_medicas')) && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="body2" fontWeight="bold">
            🏥 DATOS DE SALUD EN CONTEXTO LABORAL
          </Typography>
          <Typography variant="caption">
            Doble protección: Art. 2 g) vi) dato sensible + Art. 154 bis Código Trabajo
          </Typography>
          <Typography variant="caption" display="block">
            EIPD obligatoria + Medidas seguridad reforzadas Art. 14 Ley 21.719
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

const PasoBaseLegal = ({ ratData, setRatData }) => {
  const handleChange = (event) => {
    const value = event.target.value;
    let argumento = '';
    
    switch(value) {
      case 'consentimiento':
        argumento = 'Art. 12 Ley 21.719 - Consentimiento libre, previo, informado y específico del titular de los datos';
        break;
      case 'contrato':
        argumento = 'Art. 13.1.b Ley 21.719 - Necesario para la ejecución de un contrato en que el titular es parte';
        break;
      case 'obligacion_legal':
        argumento = 'Art. 13.1.c Ley 21.719 - Necesario para cumplir una obligación legal del responsable';
        break;
      case 'interes_vital':
        argumento = 'Art. 13.1.d Ley 21.719 - Necesario para proteger intereses vitales del titular';
        break;
      case 'mision_publica':
        argumento = 'Art. 13.1.e Ley 21.719 - Cumplimiento de misión realizada en interés público';
        break;
      case 'interes_legitimo':
        argumento = 'Art. 13.1.f Ley 21.719 - Interés legítimo del responsable o tercero';
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

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          Fundamento Legal: Art. 9 y Art. 13 Ley 21.719
        </Typography>
        <Typography variant="caption" display="block">
          El tratamiento debe tener una base jurídica que lo legitime según la normativa vigente
        </Typography>
      </Alert>
      <Typography variant="h6" gutterBottom>
        SELECCIONE LA BASE LEGAL APLICABLE:
      </Typography>
      
      <RadioGroup value={ratData.baseLegal} onChange={handleChange}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <FormControlLabel
            value="consentimiento"
            control={<Radio />}
            label={
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  CONSENTIMIENTO
                </Typography>
                <Typography variant="caption">
                  Art. 4 Ley 19.628
                </Typography>
                <Typography variant="caption" display="block">
                  "Autorización expresa del titular"
                </Typography>
              </Box>
            }
          />
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <FormControlLabel
            value="contrato"
            control={<Radio />}
            label={
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  EJECUCIÓN DE CONTRATO
                </Typography>
                <Typography variant="caption">
                  Art. 9 literal b) Ley 21.719
                </Typography>
                <Typography variant="caption" display="block">
                  "Necesario para la ejecución de un contrato"
                </Typography>
              </Box>
            }
          />
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <FormControlLabel
            value="obligacion_legal"
            control={<Radio />}
            label={
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  OBLIGACIÓN LEGAL
                </Typography>
                <Typography variant="caption">
                  Art. 9 literal c) Ley 21.719
                </Typography>
                <Typography variant="caption" display="block">
                  "Cumplimiento de obligación legal"
                </Typography>
              </Box>
            }
          />
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <FormControlLabel
            value="interes_legitimo"
            control={<Radio />}
            label={
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  INTERÉS LEGÍTIMO
                </Typography>
                <Typography variant="caption">
                  Art. 9 literal f) Ley 21.719
                </Typography>
                <Typography variant="caption" display="block">
                  "Interés legítimo del responsable"
                </Typography>
              </Box>
            }
          />
        </Paper>
      </RadioGroup>

      {ratData.argumentoJuridico && (
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            Argumento jurídico generado automáticamente:
          </Typography>
          <Typography variant="caption">
            {ratData.argumentoJuridico}
          </Typography>
        </Alert>
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
      value={ratData.finalidad}
      onChange={(e) => setRatData({ ...ratData, finalidad: e.target.value })}
      sx={{ mb: 3 }}
    />

    <Typography variant="h6" gutterBottom>
      PLAZO DE CONSERVACIÓN:
    </Typography>
    <RadioGroup 
      value={ratData.plazoConservacion} 
      onChange={(e) => setRatData({ ...ratData, plazoConservacion: e.target.value })}
    >
      <FormControlLabel
        value="relacion_contractual"
        control={<Radio />}
        label="Durante la relación contractual"
      />
      <FormControlLabel
        value="5_anos"
        control={<Radio />}
        label="5 años (obligación tributaria)"
      />
      <FormControlLabel
        value="10_anos"
        control={<Radio />}
        label="10 años (obligación laboral)"
      />
    </RadioGroup>

    <Alert severity="info" sx={{ mt: 3 }}>
      <Typography variant="body2" fontWeight="bold">
        Fundamento: Art. 11 Ley 21.719
      </Typography>
      <Typography variant="caption">
        "Principio de limitación de conservación"
      </Typography>
      <Typography variant="caption" display="block">
        Código del Trabajo Art. 154 bis
      </Typography>
    </Alert>
  </Box>
);

const PasoTransferencias = ({ ratData, setRatData }) => (
  <Box>
    <Typography variant="h6" gutterBottom>
      DESTINATARIOS INTERNOS:
    </Typography>
    <FormGroup row sx={{ mb: 3 }}>
      <FormControlLabel control={<Checkbox />} label="Departamento Contabilidad" />
      <FormControlLabel control={<Checkbox />} label="Recursos Humanos" />
      <FormControlLabel control={<Checkbox />} label="Gerencia" />
      <FormControlLabel control={<Checkbox />} label="Auditoría Interna" />
    </FormGroup>

    <Typography variant="h6" gutterBottom>
      TRANSFERENCIAS A TERCEROS:
    </Typography>
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} md={4}>
        <TextField fullWidth label="Entidad" placeholder="Ej: Servicio Impuestos Internos" />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField fullWidth label="País" defaultValue="Chile" />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField fullWidth label="Base Legal" placeholder="Ej: Obligación tributaria" />
      </Grid>
    </Grid>

    <Typography variant="h6" gutterBottom>
      TRANSFERENCIAS INTERNACIONALES:
    </Typography>
    <RadioGroup
      value={ratData.transferenciasInternacionales ? 'si' : 'no'}
      onChange={(e) => setRatData({ ...ratData, transferenciasInternacionales: e.target.value === 'si' })}
    >
      <FormControlLabel value="no" control={<Radio />} label="NO realiza transferencias internacionales" />
      <FormControlLabel value="si" control={<Radio />} label="SÍ realiza transferencias (especificar)" />
    </RadioGroup>

    {ratData.transferenciasInternacionales && (
      <Alert severity="warning" sx={{ mt: 3 }}>
        <Typography variant="body2" fontWeight="bold">
          Art. 27-29 Ley 21.719
        </Typography>
        <Typography variant="caption">
          Transferencias internacionales requieren:
        </Typography>
        <Typography variant="caption" display="block">
          - Nivel adecuado de protección
        </Typography>
        <Typography variant="caption" display="block">
          - Garantías apropiadas (DPA)
        </Typography>
      </Alert>
    )}
  </Box>
);

const PasoRevision = ({ ratData, guardarRAT }) => {
  const tieneEIPD = ratData.categorias.sensibles.length > 0;
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
            <Typography variant="body2" color="text.secondary">Responsable:</Typography>
            <Typography variant="body1" fontWeight="bold">{ratData.responsable.razonSocial}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Finalidad:</Typography>
            <Typography variant="body1" fontWeight="bold">{ratData.finalidad}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Base Legal:</Typography>
            <Typography variant="body1" fontWeight="bold">{ratData.argumentoJuridico}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Datos Sensibles:</Typography>
            <Typography variant="body1" fontWeight="bold">
              {ratData.categorias.sensibles.length > 0 ? 'SÍ' : 'NO'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Conservación:</Typography>
            <Typography variant="body1" fontWeight="bold">{ratData.plazoConservacion}</Typography>
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

// Componente para visualizar RAT en modo solo lectura
const RATViewComponent = ({ ratData }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        DETALLES DEL RAT
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">ID RAT:</Typography>
            <Typography variant="body1" fontWeight="bold">{ratData.id}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Fecha Creación:</Typography>
            <Typography variant="body1" fontWeight="bold">
              {ratData.created_at ? new Date(ratData.created_at).toLocaleDateString('es-CL') : 'Sin fecha'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Responsable:</Typography>
            <Typography variant="body1" fontWeight="bold">
              {ratData.responsable_proceso || ratData.responsable?.razonSocial || 'Sin especificar'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Email Responsable:</Typography>
            <Typography variant="body1" fontWeight="bold">
              {ratData.email_responsable || ratData.responsable?.email || 'Sin especificar'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">Finalidad:</Typography>
            <Typography variant="body1" fontWeight="bold">
              {ratData.finalidad_principal || ratData.finalidad || 'No especificada'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Base Legal:</Typography>
            <Typography variant="body1" fontWeight="bold">
              {ratData.base_legal || ratData.baseLegal || 'No especificada'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">Nivel de Riesgo:</Typography>
            <Chip 
              label={ratData.nivel_riesgo || 'MEDIO'} 
              size="small"
              color={ratData.nivel_riesgo === 'ALTO' ? 'error' : 
                     ratData.nivel_riesgo === 'MEDIO' ? 'warning' : 'success'}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">Estado del RAT:</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              {(ratData.metadata?.requiereEIPD || ratData.requiere_eipd) && (
                <Chip label="Requiere EIPD" size="small" color="error" />
              )}
              {(ratData.metadata?.requiereDPIA || ratData.requiere_dpia) && (
                <Chip label="Requiere DPIA" size="small" color="warning" />
              )}
              {(ratData.metadata?.requiereConsultaAgencia) && (
                <Chip label="Requiere Consulta" size="small" color="info" />
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Alert severity="info">
        <Typography variant="body2">
          Este RAT fue creado siguiendo los requisitos de la Ley 21.719 de Protección de Datos Personales de Chile.
        </Typography>
      </Alert>
    </Box>
  );
};

export default RATSystemProfessional;