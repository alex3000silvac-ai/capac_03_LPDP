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
  Chip
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ratService from '../services/ratService';
import ratIntelligenceEngine from '../services/ratIntelligenceEngine';
import EmpresaDataManager from './EmpresaDataManager';

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
  const [currentStep, setCurrentStep] = useState(0);
  const [rats, setRats] = useState([]);
  const [showRATList, setShowRATList] = useState(true);
  const [isCreatingRAT, setIsCreatingRAT] = useState(false);
  const [showEmpresaManager, setShowEmpresaManager] = useState(false);
  
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
      identificacion: [],
      sensibles: [],
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

  const cargarDatosComunes = () => {
    const datosComunes = localStorage.getItem('empresaDataCommon');
    if (datosComunes) {
      const empresaData = JSON.parse(datosComunes);
      // Pre-llenar datos del responsable con datos de la empresa
      setRatData(prev => ({
        ...prev,
        responsable: {
          razonSocial: empresaData.razonSocial || prev.responsable.razonSocial,
          rut: empresaData.rut || prev.responsable.rut,
          direccion: empresaData.direccion || prev.responsable.direccion,
          nombre: empresaData.dpo?.nombre || prev.responsable.nombre,
          email: empresaData.dpo?.email || prev.responsable.email,
          telefono: empresaData.dpo?.telefono || prev.responsable.telefono,
        },
        plataformasTecnologicas: empresaData.plataformasTecnologicas || [],
        politicasRetencion: empresaData.politicasRetencion || {}
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
    switch (step) {
      case 0: // Identificación
        return ratData.responsable.razonSocial && 
               ratData.responsable.rut && 
               ratData.responsable.email;
      case 1: // Categorías
        return ratData.categorias.identificacion.length > 0;
      case 2: // Base legal
        return ratData.baseLegal !== '';
      case 3: // Finalidad
        return ratData.finalidad && ratData.plazoConservacion;
      case 4: // Transferencias
        return true; // Opcional
      default:
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
    setIsCreatingRAT(true);
    setShowRATList(false);
    setShowEmpresaManager(false);
    setCurrentStep(0);
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
  };

  const guardarRAT = async () => {
    try {
      const ratId = `RAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const empresaData = JSON.parse(localStorage.getItem('empresaDataCommon') || '{}');
      
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
      
      console.log('📦 Guardando RAT con estructura completa:', ratCompleto);
      const resultado = await ratService.saveCompletedRAT(ratCompleto, 'Sistema', 'Manual');
      
      if (resultado && resultado.id) {
        console.log('✅ RAT guardado exitosamente con ID:', resultado.id);
        
        if (ratCompleto.metadata.requiereEIPD) {
          const notificacionDPO = {
            tipo: 'EIPD_REQUERIDO',
            ratId: resultado.id,
            mensaje: `RAT ${ratId} requiere Evaluación de Impacto (datos sensibles detectados)`,
            fecha: new Date().toISOString(),
            fundamento: 'Art. 19 Ley 21.719',
          };
          localStorage.setItem(`notificacion_dpo_${ratId}`, JSON.stringify(notificacionDPO));
          console.log('🔔 Notificación DPO creada:', notificacionDPO);
        }
        
        const verification = await ratService.getCompletedRATs();
        console.log('🔍 Verificación de persistencia - Total RATs:', verification.length);
        
        setRats(verification);
        alert(`✅ RAT ${ratId} guardado exitosamente en Supabase`);
      }
      
      volverAInicio();
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
          identificacion: [],
          sensibles: [],
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

  // Renderizar pantalla principal
  if (!isCreatingRAT && showRATList) {
    return (
      <ThemeProvider theme={professionalTheme}>
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
          <Container maxWidth="lg">
            <Paper sx={{ p: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                SISTEMA DE CUMPLIMIENTO LEY 21.719
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Registro de Actividades de Tratamiento
              </Typography>
              
              <Divider sx={{ my: 3 }} />
              
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
            </Paper>
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  // Renderizar formulario de creación RAT
  return (
    <ThemeProvider theme={professionalTheme}>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Paper sx={{ p: 4 }}>
            {/* Header con progreso */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                PASO {currentStep + 1} DE {steps.length} - {steps[currentStep].toUpperCase()}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(currentStep + 1) / steps.length * 100}
                sx={{ height: 8, mt: 2 }}
              />
            </Box>

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
              <Button
                onClick={handleBack}
                disabled={currentStep === 0}
                variant="outlined"
              >
                Anterior
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
          </Paper>
        </Container>
      </Box>
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
    const value = event.target.value;
    const current = ratData.categorias.identificacion;
    if (event.target.checked) {
      setRatData({
        ...ratData,
        categorias: { ...ratData.categorias, identificacion: [...current, value] }
      });
    } else {
      setRatData({
        ...ratData,
        categorias: { ...ratData.categorias, identificacion: current.filter(v => v !== value) }
      });
    }
  };

  const handleSensibles = (event) => {
    const value = event.target.value;
    const current = ratData.categorias.sensibles;
    if (event.target.checked) {
      setRatData({
        ...ratData,
        categorias: { ...ratData.categorias, sensibles: [...current, value] }
      });
    } else {
      setRatData({
        ...ratData,
        categorias: { ...ratData.categorias, sensibles: current.filter(v => v !== value) }
      });
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        DATOS DE IDENTIFICACIÓN
      </Typography>
      <FormGroup row>
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="nombre" />}
          label="Nombre y apellidos"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="rut" />}
          label="RUT"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="direccion" />}
          label="Dirección"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="telefono" />}
          label="Teléfono"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="email" />}
          label="Email"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleIdentificacion} value="firma" />}
          label="Firma"
        />
      </FormGroup>

      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        DATOS SENSIBLES (Art. 2 letra g Ley 19.628)
      </Typography>
      <FormGroup row>
        <FormControlLabel
          control={<Checkbox onChange={handleSensibles} value="origen_racial" />}
          label="Origen racial o étnico"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleSensibles} value="opiniones_politicas" />}
          label="Opiniones políticas"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleSensibles} value="convicciones_religiosas" />}
          label="Convicciones religiosas"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleSensibles} value="afiliacion_sindical" />}
          label="Afiliación sindical"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleSensibles} value="vida_sexual" />}
          label="Vida sexual"
        />
        <FormControlLabel
          control={<Checkbox onChange={handleSensibles} value="datos_salud" />}
          label="Datos de salud"
        />
      </FormGroup>

      {ratData.categorias.sensibles.length > 0 && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="body2" fontWeight="bold">
            ALERTA LEGAL - Datos sensibles seleccionados
          </Typography>
          <Typography variant="caption">
            Fundamento: Art. 25 Ley 21.719 - "Requiere Evaluación de Impacto (EIPD)"
          </Typography>
          <Typography variant="caption" display="block">
            Se generará automáticamente al finalizar RAT
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

export default RATSystemProfessional;