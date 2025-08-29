/**
 * SISTEMA PROFESIONAL DE REGISTRO DE ACTIVIDADES DE TRATAMIENTO
 * Interfaz jurídica formal para cumplimiento Ley 21.719
 * Sin elementos informales - Solo fundamentos legales
 */

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

// Tema profesional con colores oscuros clásicos
const professionalTheme = createTheme({
  palette: {
    primary: {
      main: '#2C3E50', // Azul oscuro profesional
    },
    secondary: {
      main: '#34495E', // Gris azulado
    },
    background: {
      default: '#ECF0F1', // Gris claro
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C3E50',
      secondary: '#5D6D7E',
    },
    error: {
      main: '#E74C3C', // Rojo formal
    },
    success: {
      main: '#27AE60', // Verde formal
    },
    warning: {
      main: '#F39C12', // Amarillo formal
    },
  },
  typography: {
    fontFamily: '"Georgia", "Times New Roman", serif',
    h4: {
      fontWeight: 700,
      fontSize: '1.75rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    body1: {
      fontSize: '14px',
    },
    caption: {
      fontSize: '12px',
      fontStyle: 'italic',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'uppercase',
          fontWeight: 600,
          borderRadius: 0,
          padding: '10px 24px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

const RATSystemProfessional = () => {
  // Estados del sistema
  const [currentStep, setCurrentStep] = useState(0);
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState(null);
  const [rats, setRats] = useState([]);
  const [showRATList, setShowRATList] = useState(true);
  const [isCreatingRAT, setIsCreatingRAT] = useState(false);
  
  // Datos del RAT en construcción
  const [ratData, setRatData] = useState({
    // Paso 1: Identificación
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

  // Cargar RATs existentes
  useEffect(() => {
    cargarRATs();
  }, []);

  const cargarRATs = async () => {
    try {
      const ratsData = await ratService.getCompletedRATs();
      setRats(ratsData);
    } catch (error) {
      console.error('Error cargando RATs:', error);
    }
  };

  // Auto-avance cuando se completan campos requeridos
  useEffect(() => {
    if (isCreatingRAT && checkStepComplete(currentStep)) {
      const timer = setTimeout(() => {
        handleNext();
      }, 3000);
      setAutoAdvanceTimer(timer);
      
      return () => {
        if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
      };
    }
  }, [ratData, currentStep, isCreatingRAT]);

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
    setCurrentStep(0);
  };

  const guardarRAT = async () => {
    try {
      // Preparar datos para guardar
      const ratCompleto = {
        ...ratData,
        fechaCreacion: new Date().toISOString(),
        estado: 'completado',
      };
      
      // Guardar en base de datos
      await ratService.saveCompletedRAT(ratCompleto, 'General', 'Manual');
      
      // Recargar lista
      await cargarRATs();
      
      // Volver a vista principal
      setIsCreatingRAT(false);
      setShowRATList(true);
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
              
              <Card sx={{ mb: 4, bgcolor: 'primary.main', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center', py: 5 }}>
                  <Typography variant="h5" gutterBottom>
                    INICIAR REGISTRO DE TRATAMIENTO
                  </Typography>
                  <Divider sx={{ bgcolor: 'white', my: 2, mx: 'auto', width: '50%' }} />
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
                      bgcolor: 'white',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'grey.100',
                      }
                    }}
                    onClick={iniciarNuevoRAT}
                  >
                    COMENZAR REGISTRO
                  </Button>
                </CardContent>
              </Card>
              
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
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'primary.main' }}>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ACTIVIDAD</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>BASE LEGAL</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>RIESGO</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ESTADO</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rats.slice(0, 5).map((rat) => (
                        <TableRow key={rat.id}>
                          <TableCell>{rat.id?.substring(0, 8)}</TableCell>
                          <TableCell>{rat.nombre_actividad || rat.finalidad}</TableCell>
                          <TableCell>{rat.baseLegal || 'Art. 9 L21719'}</TableCell>
                          <TableCell>
                            <Chip 
                              label={rat.nivel_riesgo || 'MEDIO'} 
                              size="small"
                              sx={{ 
                                bgcolor: rat.nivel_riesgo === 'ALTO' ? 'error.main' : 
                                        rat.nivel_riesgo === 'MEDIO' ? 'warning.main' : 'success.main',
                                color: 'white'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {rat.requiere_eipd && (
                              <Chip label="EIPD" size="small" sx={{ mr: 0.5 }} />
                            )}
                            {rat.requiere_dpia && (
                              <Chip label="DPIA" size="small" sx={{ mr: 0.5 }} />
                            )}
                            {!rat.requiere_eipd && !rat.requiere_dpia && (
                              <Chip label="COMPLETO" size="small" color="success" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
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

            {/* Auto-avance indicator */}
            {checkStepComplete(currentStep) && currentStep < 5 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                [Campos completados: auto-avance en 3 segundos...]
              </Typography>
            )}

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
const PasoIdentificacion = ({ ratData, setRatData }) => (
  <Box>
    <Typography variant="h6" gutterBottom>
      RESPONSABLE DEL TRATAMIENTO
    </Typography>
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Razón Social"
          value={ratData.responsable.razonSocial}
          onChange={(e) => setRatData({
            ...ratData,
            responsable: { ...ratData.responsable, razonSocial: e.target.value }
          })}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="RUT"
          value={ratData.responsable.rut}
          onChange={(e) => setRatData({
            ...ratData,
            responsable: { ...ratData.responsable, rut: e.target.value }
          })}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Dirección"
          value={ratData.responsable.direccion}
          onChange={(e) => setRatData({
            ...ratData,
            responsable: { ...ratData.responsable, direccion: e.target.value }
          })}
        />
      </Grid>
    </Grid>

    <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
      ENCARGADO DE PROTECCIÓN DE DATOS
    </Typography>
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Nombre"
          value={ratData.responsable.nombre}
          onChange={(e) => setRatData({
            ...ratData,
            responsable: { ...ratData.responsable, nombre: e.target.value }
          })}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={ratData.responsable.email}
          onChange={(e) => setRatData({
            ...ratData,
            responsable: { ...ratData.responsable, email: e.target.value }
          })}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Teléfono"
          value={ratData.responsable.telefono}
          onChange={(e) => setRatData({
            ...ratData,
            responsable: { ...ratData.responsable, telefono: e.target.value }
          })}
        />
      </Grid>
    </Grid>

    <Alert severity="info" sx={{ mt: 3 }}>
      <Typography variant="body2" fontWeight="bold">
        Base Legal: Art. 19 Ley 21.719
      </Typography>
      <Typography variant="caption">
        "El responsable debe designar un encargado de protección de datos cuando corresponda"
      </Typography>
    </Alert>
  </Box>
);

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
        argumento = 'Art. 4 Ley 19.628 - Autorización expresa del titular';
        break;
      case 'contrato':
        argumento = 'Art. 9 literal b) Ley 21.719 - Necesario para la ejecución de un contrato';
        break;
      case 'obligacion_legal':
        argumento = 'Art. 9 literal c) Ley 21.719 - Cumplimiento de obligación legal';
        break;
      case 'interes_legitimo':
        argumento = 'Art. 9 literal f) Ley 21.719 - Interés legítimo del responsable';
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
      
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
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