import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  RadioGroup,
  Radio,
  Chip,
  Alert,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Save as SaveIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
  Gavel as GavelIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Info as InfoIcon,
  Timeline as TimelineIcon,
  Shield as ShieldIcon,
  Report as ReportIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const EIPDCreator = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [eipd, setEipd] = useState({
    // Información básica
    nombre_proyecto: '',
    descripcion_proyecto: '',
    rat_asociado: null,
    responsable_eipd: '',
    fecha_evaluacion: new Date().toISOString().split('T')[0],
    
    // Criterios necesidad EIPD (Art. 25 Ley 21.719)
    requiere_eipd: false,
    criterios_aplicados: [],
    justificacion_necesidad: '',
    
    // Descripción tratamiento
    naturaleza_tratamiento: '',
    alcance_tratamiento: '',
    contexto_tratamiento: '',
    finalidades_tratamiento: '',
    
    // Evaluación necesidad y proporcionalidad
    necesidad_evaluada: false,
    proporcionalidad_evaluada: false,
    justificacion_necesidad_prop: '',
    
    // Identificación riesgos
    riesgos_identificados: [],
    matriz_riesgos: [],
    
    // Medidas mitigación
    medidas_tecnicas: [],
    medidas_organizativas: [],
    medidas_legales: [],
    
    // Evaluación riesgo residual
    nivel_riesgo_inicial: '',
    nivel_riesgo_residual: '',
    riesgo_aceptable: false,
    
    // Consulta previa APDP
    requiere_consulta_previa: false,
    justificacion_consulta: '',
    
    // Resultado final
    estado_eipd: 'BORRADOR',
    conclusiones: '',
    recomendaciones: []
  });
  const [ratsList, setRatsList] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    loadRATsList();
  }, []);

  const loadRATsList = async () => {
    try {
      // Mock data - en prod conectaría con API
      const mockRATs = [
        { id: 1, numero_rat: 'RAT-2024-001', nombre: 'Gestión Clientes Bancarios', nivel_riesgo: 'ALTO' },
        { id: 2, numero_rat: 'RAT-2024-002', nombre: 'Recursos Humanos', nivel_riesgo: 'MEDIO' },
        { id: 3, numero_rat: 'RAT-2024-003', nombre: 'Marketing Digital', nivel_riesgo: 'ALTO' }
      ];
      setRatsList(mockRATs);
    } catch (error) {
      console.error('Error cargando RATs:', error);
    }
  };

  const criteriosEIPD = [
    {
      id: 'evaluacion_sistematica',
      label: 'Evaluación sistemática y exhaustiva de aspectos personales',
      descripcion: 'Incluyendo perfilado y predicciones'
    },
    {
      id: 'decision_automatizada',
      label: 'Decisiones automatizadas con efectos jurídicos significativos',
      descripcion: 'Decisiones que producen efectos jurídicos o afectan significativamente'
    },
    {
      id: 'observacion_sistematica',
      label: 'Observación sistemática a gran escala',
      descripcion: 'Videovigilancia, monitoreo de áreas públicas'
    },
    {
      id: 'datos_sensibles',
      label: 'Tratamiento a gran escala de datos especialmente sensibles',
      descripcion: 'Datos de salud, biométricos, origen racial, opiniones políticas'
    },
    {
      id: 'combinacion_datos',
      label: 'Combinación o cruce de conjuntos de datos',
      descripcion: 'Datos procesados con finalidades diferentes o por responsables distintos'
    },
    {
      id: 'personas_vulnerables',
      label: 'Tratamiento datos de personas vulnerables',
      descripcion: 'Menores de edad, adultos mayores, pacientes, empleados'
    },
    {
      id: 'nuevas_tecnologias',
      label: 'Uso innovador o aplicación de nuevas tecnologías',
      descripcion: 'IA, Machine Learning, IoT, tecnologías emergentes'
    },
    {
      id: 'transferencia_internacional',
      label: 'Transferencias internacionales a países sin nivel adecuado',
      descripcion: 'Transferencias fuera de Chile sin garantías apropiadas'
    },
    {
      id: 'impedimento_derechos',
      label: 'Puede impedir ejercicio de derechos o uso de servicios',
      descripcion: 'El tratamiento puede limitar derechos fundamentales'
    }
  ];

  const handleFieldChange = (field, value) => {
    setEipd(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error de validación si existe
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCriterioToggle = (criterioId) => {
    const currentCriterios = eipd.criterios_aplicados;
    const newCriterios = currentCriterios.includes(criterioId)
      ? currentCriterios.filter(c => c !== criterioId)
      : [...currentCriterios, criterioId];
    
    handleFieldChange('criterios_aplicados', newCriterios);
    
    // Auto-determinar si requiere EIPD (2 o más criterios)
    handleFieldChange('requiere_eipd', newCriterios.length >= 2);
  };

  const addRiesgo = () => {
    const newRiesgo = {
      id: Date.now(),
      descripcion: '',
      probabilidad: 3,
      impacto: 3,
      nivel: 'MEDIO',
      categoria: ''
    };
    
    handleFieldChange('riesgos_identificados', [...eipd.riesgos_identificados, newRiesgo]);
  };

  const updateRiesgo = (riesgoId, field, value) => {
    const updatedRiesgos = eipd.riesgos_identificados.map(r => {
      if (r.id === riesgoId) {
        const updated = { ...r, [field]: value };
        // Calcular nivel de riesgo
        if (field === 'probabilidad' || field === 'impacto') {
          const score = updated.probabilidad * updated.impacto;
          if (score <= 4) updated.nivel = 'BAJO';
          else if (score <= 9) updated.nivel = 'MEDIO';
          else if (score <= 16) updated.nivel = 'ALTO';
          else updated.nivel = 'CRITICO';
        }
        return updated;
      }
      return r;
    });
    
    handleFieldChange('riesgos_identificados', updatedRiesgos);
  };

  const removeRiesgo = (riesgoId) => {
    handleFieldChange(
      'riesgos_identificados',
      eipd.riesgos_identificados.filter(r => r.id !== riesgoId)
    );
  };

  const calcularRiesgoResidual = () => {
    if (eipd.riesgos_identificados.length === 0) return 'BAJO';
    
    const totalMedidas = eipd.medidas_tecnicas.length + 
                        eipd.medidas_organizativas.length + 
                        eipd.medidas_legales.length;
    
    const riesgosAltos = eipd.riesgos_identificados.filter(r => 
      r.nivel === 'ALTO' || r.nivel === 'CRITICO'
    ).length;
    
    if (riesgosAltos > 3 && totalMedidas < 10) return 'ALTO';
    if (riesgosAltos > 1 && totalMedidas < 5) return 'MEDIO';
    return 'BAJO';
  };

  const determinarConsultaPrevia = () => {
    // Consulta previa si riesgo residual alto y no se puede mitigar más
    const riesgoResidual = calcularRiesgoResidual();
    return riesgoResidual === 'ALTO' && eipd.medidas_tecnicas.length > 5;
  };

  const validateStep = (step) => {
    const errors = {};
    
    switch (step) {
      case 0: // Información básica
        if (!eipd.nombre_proyecto) errors.nombre_proyecto = 'Nombre requerido';
        if (!eipd.rat_asociado) errors.rat_asociado = 'Debe asociar un RAT';
        break;
        
      case 1: // Criterios necesidad
        if (eipd.criterios_aplicados.length === 0) {
          errors.criterios = 'Debe evaluar al menos un criterio';
        }
        break;
        
      case 2: // Descripción tratamiento
        if (!eipd.naturaleza_tratamiento) errors.naturaleza = 'Requerido';
        if (!eipd.alcance_tratamiento) errors.alcance = 'Requerido';
        break;
        
      case 3: // Evaluación necesidad
        if (!eipd.justificacion_necesidad_prop) {
          errors.justificacion = 'Debe justificar necesidad y proporcionalidad';
        }
        break;
        
      case 4: // Identificación riesgos
        if (eipd.riesgos_identificados.length === 0) {
          errors.riesgos = 'Debe identificar al menos un riesgo';
        }
        break;
        
      case 5: // Medidas mitigación
        if (eipd.medidas_tecnicas.length === 0 && eipd.medidas_organizativas.length === 0) {
          errors.medidas = 'Debe definir medidas de mitigación';
        }
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSave = async (asFinal = false) => {
    try {
      setLoading(true);
      
      // Calcular riesgo residual
      const riesgoResidual = calcularRiesgoResidual();
      const consultaPrevia = determinarConsultaPrevia();
      
      const eipdData = {
        ...eipd,
        nivel_riesgo_residual: riesgoResidual,
        requiere_consulta_previa: consultaPrevia,
        estado_eipd: asFinal ? 'COMPLETADA' : 'BORRADOR',
        fecha_actualizacion: new Date().toISOString()
      };
      
      // En prod: enviar a API
      console.log('Guardando EIPD:', eipdData);
      
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (asFinal) {
        navigate('/eipds');
      }
      
    } catch (error) {
      console.error('Error guardando EIPD:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiesgoColor = (nivel) => {
    const colors = {
      'BAJO': '#2e7d32',
      'MEDIO': '#f57f17',
      'ALTO': '#d32f2f',
      'CRITICO': '#b71c1c'
    };
    return colors[nivel] || '#666';
  };

  const steps = [
    {
      label: 'Información Básica',
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Nombre del Proyecto/Actividad"
              value={eipd.nombre_proyecto}
              onChange={(e) => handleFieldChange('nombre_proyecto', e.target.value)}
              error={!!validationErrors.nombre_proyecto}
              helperText={validationErrors.nombre_proyecto}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#2a2a2a',
                  '& fieldset': { borderColor: '#444' },
                  '&:hover fieldset': { borderColor: '#666' },
                  '&.Mui-focused fieldset': { borderColor: '#4fc3f7' }
                },
                '& .MuiInputLabel-root': { color: '#bbb' }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Descripción del Proyecto"
              value={eipd.descripcion_proyecto}
              onChange={(e) => handleFieldChange('descripcion_proyecto', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#2a2a2a',
                  '& fieldset': { borderColor: '#444' },
                  '&:hover fieldset': { borderColor: '#666' },
                  '&.Mui-focused fieldset': { borderColor: '#4fc3f7' }
                },
                '& .MuiInputLabel-root': { color: '#bbb' }
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required error={!!validationErrors.rat_asociado}>
              <InputLabel sx={{ color: '#bbb' }}>RAT Asociado</InputLabel>
              <Select
                value={eipd.rat_asociado || ''}
                onChange={(e) => handleFieldChange('rat_asociado', e.target.value)}
                sx={{
                  bgcolor: '#2a2a2a',
                  color: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666' }
                }}
              >
                {ratsList.map(rat => (
                  <MenuItem key={rat.id} value={rat.id}>
                    <Box>
                      <Typography>{rat.numero_rat} - {rat.nombre}</Typography>
                      <Chip 
                        label={rat.nivel_riesgo}
                        size="small"
                        sx={{ 
                          bgcolor: getRiesgoColor(rat.nivel_riesgo),
                          color: '#fff',
                          ml: 1
                        }}
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Responsable EIPD"
              value={eipd.responsable_eipd}
              onChange={(e) => handleFieldChange('responsable_eipd', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#2a2a2a',
                  '& fieldset': { borderColor: '#444' },
                  '&:hover fieldset': { borderColor: '#666' },
                  '&.Mui-focused fieldset': { borderColor: '#4fc3f7' }
                },
                '& .MuiInputLabel-root': { color: '#bbb' }
              }}
            />
          </Grid>
        </Grid>
      )
    },
    {
      label: 'Criterios de Necesidad EIPD',
      content: (
        <Box>
          <Alert severity="info" sx={{ mb: 3, bgcolor: '#0d47a1', color: '#fff' }}>
            📋 Según el Art. 25 de la Ley 21.719, se requiere EIPD cuando se cumplen 2 o más criterios
          </Alert>
          
          {validationErrors.criterios && (
            <Alert severity="error" sx={{ mb: 2, bgcolor: '#d32f2f', color: '#fff' }}>
              {validationErrors.criterios}
            </Alert>
          )}
          
          <Grid container spacing={2}>
            {criteriosEIPD.map((criterio) => (
              <Grid item xs={12} key={criterio.id}>
                <Card 
                  sx={{ 
                    bgcolor: eipd.criterios_aplicados.includes(criterio.id) ? '#0d47a1' : '#2a2a2a',
                    border: eipd.criterios_aplicados.includes(criterio.id) ? '2px solid #4fc3f7' : '1px solid #444',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#333' }
                  }}
                  onClick={() => handleCriterioToggle(criterio.id)}
                >
                  <CardContent>
                    <Box display="flex" alignItems="start" gap={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={eipd.criterios_aplicados.includes(criterio.id)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': { color: '#4fc3f7' },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#0d47a1' }
                            }}
                          />
                        }
                        label=""
                      />
                      <Box flex={1}>
                        <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600 }}>
                          {criterio.label}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#bbb', mt: 0.5 }}>
                          {criterio.descripcion}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Box mt={3} p={2} bgcolor="#333" borderRadius={1}>
            <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
              Resultado: {eipd.criterios_aplicados.length} criterios aplicables
            </Typography>
            <Chip 
              label={eipd.requiere_eipd ? 'EIPD REQUERIDA' : 'EIPD NO REQUERIDA'}
              sx={{ 
                bgcolor: eipd.requiere_eipd ? '#d32f2f' : '#2e7d32',
                color: '#fff',
                fontWeight: 600
              }}
            />
          </Box>
        </Box>
      )
    },
    {
      label: 'Descripción del Tratamiento',
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              multiline
              rows={3}
              label="Naturaleza del Tratamiento"
              value={eipd.naturaleza_tratamiento}
              onChange={(e) => handleFieldChange('naturaleza_tratamiento', e.target.value)}
              placeholder="Describa cómo se recopilan, usan y eliminan los datos..."
              error={!!validationErrors.naturaleza}
              helperText={validationErrors.naturaleza}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#2a2a2a',
                  '& fieldset': { borderColor: '#444' },
                  '&:hover fieldset': { borderColor: '#666' },
                  '&.Mui-focused fieldset': { borderColor: '#4fc3f7' }
                },
                '& .MuiInputLabel-root': { color: '#bbb' }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              multiline
              rows={3}
              label="Alcance del Tratamiento"
              value={eipd.alcance_tratamiento}
              onChange={(e) => handleFieldChange('alcance_tratamiento', e.target.value)}
              placeholder="Volumen de datos, número de titulares afectados, duración..."
              error={!!validationErrors.alcance}
              helperText={validationErrors.alcance}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#2a2a2a',
                  '& fieldset': { borderColor: '#444' },
                  '&:hover fieldset': { borderColor: '#666' },
                  '&.Mui-focused fieldset': { borderColor: '#4fc3f7' }
                },
                '& .MuiInputLabel-root': { color: '#bbb' }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Contexto del Tratamiento"
              value={eipd.contexto_tratamiento}
              onChange={(e) => handleFieldChange('contexto_tratamiento', e.target.value)}
              placeholder="Relación con titulares, control sobre datos, expectativas..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#2a2a2a',
                  '& fieldset': { borderColor: '#444' },
                  '&:hover fieldset': { borderColor: '#666' },
                  '&.Mui-focused fieldset': { borderColor: '#4fc3f7' }
                },
                '& .MuiInputLabel-root': { color: '#bbb' }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Finalidades del Tratamiento"
              value={eipd.finalidades_tratamiento}
              onChange={(e) => handleFieldChange('finalidades_tratamiento', e.target.value)}
              placeholder="Objetivos y beneficios esperados del tratamiento..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#2a2a2a',
                  '& fieldset': { borderColor: '#444' },
                  '&:hover fieldset': { borderColor: '#666' },
                  '&.Mui-focused fieldset': { borderColor: '#4fc3f7' }
                },
                '& .MuiInputLabel-root': { color: '#bbb' }
              }}
            />
          </Grid>
        </Grid>
      )
    },
    {
      label: 'Evaluación Necesidad y Proporcionalidad',
      content: (
        <Box>
          <Alert severity="info" sx={{ mb: 3, bgcolor: '#0d47a1', color: '#fff' }}>
            ⚖️ Evalúe si el tratamiento es necesario y proporcional respecto a la finalidad
          </Alert>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={eipd.necesidad_evaluada}
                    onChange={(e) => handleFieldChange('necesidad_evaluada', e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#4fc3f7' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#0d47a1' }
                    }}
                  />
                }
                label={
                  <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                    ✅ El tratamiento es NECESARIO para la finalidad
                  </Typography>
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={eipd.proporcionalidad_evaluada}
                    onChange={(e) => handleFieldChange('proporcionalidad_evaluada', e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#4fc3f7' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#0d47a1' }
                    }}
                  />
                }
                label={
                  <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                    ⚖️ El tratamiento es PROPORCIONAL al objetivo
                  </Typography>
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                multiline
                rows={4}
                label="Justificación de Necesidad y Proporcionalidad"
                value={eipd.justificacion_necesidad_prop}
                onChange={(e) => handleFieldChange('justificacion_necesidad_prop', e.target.value)}
                placeholder="Explique por qué el tratamiento es necesario y proporcional..."
                error={!!validationErrors.justificacion}
                helperText={validationErrors.justificacion}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#2a2a2a',
                    '& fieldset': { borderColor: '#444' },
                    '&:hover fieldset': { borderColor: '#666' },
                    '&.Mui-focused fieldset': { borderColor: '#4fc3f7' }
                  },
                  '& .MuiInputLabel-root': { color: '#bbb' }
                }}
              />
            </Grid>
          </Grid>

          {eipd.necesidad_evaluada && eipd.proporcionalidad_evaluada && (
            <Alert severity="success" sx={{ mt: 3, bgcolor: '#2e7d32', color: '#fff' }}>
              ✅ Tratamiento evaluado como NECESARIO y PROPORCIONAL
            </Alert>
          )}
        </Box>
      )
    },
    {
      label: 'Identificación de Riesgos',
      content: (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" sx={{ color: '#fff' }}>
              ⚠️ Riesgos Identificados
            </Typography>
            <Button
              variant="contained"
              onClick={addRiesgo}
              startIcon={<AddIcon />}
              sx={{
                bgcolor: '#4fc3f7',
                color: '#000',
                fontWeight: 600,
                '&:hover': { bgcolor: '#29b6f6' }
              }}
            >
              Agregar Riesgo
            </Button>
          </Box>

          {validationErrors.riesgos && (
            <Alert severity="error" sx={{ mb: 2, bgcolor: '#d32f2f', color: '#fff' }}>
              {validationErrors.riesgos}
            </Alert>
          )}

          {eipd.riesgos_identificados.map((riesgo) => (
            <RiesgoCard 
              key={riesgo.id}
              riesgo={riesgo}
              onUpdate={updateRiesgo}
              onRemove={removeRiesgo}
            />
          ))}

          {eipd.riesgos_identificados.length === 0 && (
            <Paper elevation={1} sx={{ bgcolor: '#2a2a2a', p: 3, textAlign: 'center' }}>
              <Typography sx={{ color: '#bbb' }}>
                No hay riesgos identificados. Haga clic en "Agregar Riesgo" para comenzar.
              </Typography>
            </Paper>
          )}

          {eipd.riesgos_identificados.length > 0 && (
            <Box mt={3} p={2} bgcolor="#333" borderRadius={1}>
              <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
                📊 Resumen de Riesgos
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>Críticos:</Typography>
                  <Typography variant="h6" sx={{ color: '#b71c1c' }}>
                    {eipd.riesgos_identificados.filter(r => r.nivel === 'CRITICO').length}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>Altos:</Typography>
                  <Typography variant="h6" sx={{ color: '#d32f2f' }}>
                    {eipd.riesgos_identificados.filter(r => r.nivel === 'ALTO').length}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>Medios:</Typography>
                  <Typography variant="h6" sx={{ color: '#f57f17' }}>
                    {eipd.riesgos_identificados.filter(r => r.nivel === 'MEDIO').length}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>Bajos:</Typography>
                  <Typography variant="h6" sx={{ color: '#2e7d32' }}>
                    {eipd.riesgos_identificados.filter(r => r.nivel === 'BAJO').length}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      )
    },
    {
      label: 'Medidas de Mitigación',
      content: (
        <MedidasMitigacion 
          eipd={eipd}
          onFieldChange={handleFieldChange}
          validationErrors={validationErrors}
        />
      )
    },
    {
      label: 'Evaluación Final',
      content: (
        <Box>
          <Alert severity="info" sx={{ mb: 3, bgcolor: '#0d47a1', color: '#fff' }}>
            📊 Evaluación del riesgo residual después de aplicar medidas de mitigación
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ bgcolor: '#2a2a2a', p: 3 }}>
                <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
                  🎯 Nivel de Riesgo Inicial
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <SecurityIcon sx={{ color: '#d32f2f', fontSize: 32 }} />
                  <Chip 
                    label={eipd.riesgos_identificados.length > 3 ? 'ALTO' : 'MEDIO'}
                    sx={{ 
                      bgcolor: getRiesgoColor(eipd.riesgos_identificados.length > 3 ? 'ALTO' : 'MEDIO'),
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}
                  />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ bgcolor: '#2a2a2a', p: 3 }}>
                <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
                  🛡️ Nivel de Riesgo Residual
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <ShieldIcon sx={{ color: '#2e7d32', fontSize: 32 }} />
                  <Chip 
                    label={calcularRiesgoResidual()}
                    sx={{ 
                      bgcolor: getRiesgoColor(calcularRiesgoResidual()),
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}
                  />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={eipd.riesgo_aceptable}
                    onChange={(e) => handleFieldChange('riesgo_aceptable', e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#4fc3f7' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#0d47a1' }
                    }}
                  />
                }
                label={
                  <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                    ✅ El riesgo residual es ACEPTABLE para la organización
                  </Typography>
                }
              />
            </Grid>

            {determinarConsultaPrevia() && (
              <Grid item xs={12}>
                <Alert severity="warning" sx={{ bgcolor: '#f57f17', color: '#fff' }}>
                  ⚠️ <strong>Consulta Previa APDP Requerida</strong>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    El nivel de riesgo residual sigue siendo alto. Se requiere consulta previa con la Agencia de Protección de Datos Personales.
                  </Typography>
                </Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Conclusiones de la EIPD"
                value={eipd.conclusiones}
                onChange={(e) => handleFieldChange('conclusiones', e.target.value)}
                placeholder="Resuma las conclusiones principales de la evaluación..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#2a2a2a',
                    '& fieldset': { borderColor: '#444' },
                    '&:hover fieldset': { borderColor: '#666' },
                    '&.Mui-focused fieldset': { borderColor: '#4fc3f7' }
                  },
                  '& .MuiInputLabel-root': { color: '#bbb' }
                }}
              />
            </Grid>
          </Grid>
        </Box>
      )
    }
  ];

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
            📋 Evaluación de Impacto (EIPD/DPIA)
          </Typography>
          <Typography variant="body1" sx={{ color: '#bbb' }}>
            Evaluación sistemática según Art. 25 Ley 21.719
          </Typography>
        </Box>
        
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={() => navigate('/eipds')}
            sx={{
              borderColor: '#666',
              color: '#fff',
              '&:hover': { borderColor: '#999', bgcolor: '#333' }
            }}
          >
            Cancelar
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => handleSave(false)}
            disabled={loading}
            sx={{
              borderColor: '#f57f17',
              color: '#f57f17',
              '&:hover': { borderColor: '#ff9800', bgcolor: '#333' }
            }}
            startIcon={<SaveIcon />}
          >
            Guardar Borrador
          </Button>
          
          <Button
            variant="contained"
            onClick={() => handleSave(true)}
            disabled={loading}
            sx={{
              bgcolor: '#4fc3f7',
              color: '#000',
              fontWeight: 600,
              '&:hover': { bgcolor: '#29b6f6' }
            }}
            startIcon={<CheckIcon />}
          >
            Completar EIPD
          </Button>
        </Box>
      </Box>

      {/* Stepper principal */}
      <Paper elevation={3} sx={{ bgcolor: '#1a1a1a', border: '1px solid #333', p: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel sx={{ '& .MuiStepLabel-label': { color: '#bbb' } }}>
                {step.label}
              </StepLabel>
              <StepContent>
                <Box mb={3}>
                  {step.content}
                </Box>
                <Box display="flex" gap={1}>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ color: '#bbb' }}
                  >
                    Atrás
                  </Button>
                  <Button
                    variant="contained"
                    onClick={index === steps.length - 1 ? () => handleSave(true) : handleNext}
                    sx={{
                      bgcolor: '#4fc3f7',
                      color: '#000',
                      fontWeight: 600,
                      '&:hover': { bgcolor: '#29b6f6' }
                    }}
                  >
                    {index === steps.length - 1 ? 'Finalizar EIPD' : 'Continuar'}
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </Box>
  );
};

// Componente para tarjeta de riesgo
const RiesgoCard = ({ riesgo, onUpdate, onRemove }) => {
  const [expanded, setExpanded] = useState(false);

  const categorias = [
    'Confidencialidad',
    'Integridad',
    'Disponibilidad',
    'Derechos Titulares',
    'Legal/Regulatorio',
    'Reputacional'
  ];

  return (
    <Accordion 
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      sx={{ 
        bgcolor: '#2a2a2a', 
        color: '#fff',
        mb: 2,
        '&:before': { display: 'none' }
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
        <Box display="flex" alignItems="center" gap={2} width="100%">
          <WarningIcon sx={{ color: getRiesgoColor(riesgo.nivel) }} />
          <Typography sx={{ flex: 1 }}>
            {riesgo.descripcion || 'Nuevo Riesgo'}
          </Typography>
          <Chip 
            label={riesgo.nivel}
            sx={{ 
              bgcolor: getRiesgoColor(riesgo.nivel),
              color: '#fff'
            }}
          />
          <IconButton 
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(riesgo.id);
            }}
            sx={{ color: '#f44336' }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </AccordionSummary>
      
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descripción del Riesgo"
              value={riesgo.descripcion}
              onChange={(e) => onUpdate(riesgo.id, 'descripcion', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#333',
                  '& fieldset': { borderColor: '#555' }
                },
                '& .MuiInputLabel-root': { color: '#bbb' }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#bbb' }}>Categoría</InputLabel>
              <Select
                value={riesgo.categoria}
                onChange={(e) => onUpdate(riesgo.id, 'categoria', e.target.value)}
                sx={{
                  bgcolor: '#333',
                  color: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' }
                }}
              >
                {categorias.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
              Probabilidad: {riesgo.probabilidad}
            </Typography>
            <Slider
              value={riesgo.probabilidad}
              onChange={(e, value) => onUpdate(riesgo.id, 'probabilidad', value)}
              min={1}
              max={5}
              marks
              sx={{ color: '#4fc3f7' }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
              Impacto: {riesgo.impacto}
            </Typography>
            <Slider
              value={riesgo.impacto}
              onChange={(e, value) => onUpdate(riesgo.id, 'impacto', value)}
              min={1}
              max={5}
              marks
              sx={{ color: '#4fc3f7' }}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

// Componente para medidas de mitigación
const MedidasMitigacion = ({ eipd, onFieldChange, validationErrors }) => {
  const [newMedidaTecnica, setNewMedidaTecnica] = useState('');
  const [newMedidaOrg, setNewMedidaOrg] = useState('');
  const [newMedidaLegal, setNewMedidaLegal] = useState('');

  const medidasTecnicasSugeridas = [
    'Cifrado AES-256',
    'Autenticación multifactor',
    'Control acceso basado en roles',
    'Logs de auditoría inmutables',
    'Anonimización/Seudonimización',
    'Backup automático cifrado',
    'Firewall aplicaciones web',
    'Monitoreo en tiempo real',
    'DLP (Data Loss Prevention)',
    'Tokenización datos sensibles'
  ];

  const medidasOrgSugeridas = [
    'Capacitación personal',
    'Políticas de privacidad',
    'Procedimientos respuesta incidentes',
    'Auditorías periódicas',
    'Segregación de funciones',
    'Contratos confidencialidad',
    'Revisión periódica accesos',
    'Gestión proveedores',
    'Plan continuidad negocio',
    'Certificación ISO 27001'
  ];

  const medidasLegalesSugeridas = [
    'Consentimiento granular',
    'Avisos privacidad claros',
    'DPA con proveedores',
    'Cláusulas contractuales tipo',
    'Procedimiento derechos ARCO',
    'Registro actividades tratamiento',
    'Nombramiento DPO',
    'Evaluaciones impacto periódicas',
    'Notificación brechas 72h',
    'Cumplimiento Ley 21.719'
  ];

  const addMedida = (tipo, medida) => {
    if (!medida) return;
    
    const field = `medidas_${tipo}`;
    const currentMedidas = eipd[field];
    
    if (!currentMedidas.includes(medida)) {
      onFieldChange(field, [...currentMedidas, medida]);
    }
    
    // Limpiar campo
    if (tipo === 'tecnicas') setNewMedidaTecnica('');
    else if (tipo === 'organizativas') setNewMedidaOrg('');
    else if (tipo === 'legales') setNewMedidaLegal('');
  };

  const removeMedida = (tipo, medida) => {
    const field = `medidas_${tipo}`;
    onFieldChange(field, eipd[field].filter(m => m !== medida));
  };

  return (
    <Box>
      {validationErrors.medidas && (
        <Alert severity="error" sx={{ mb: 3, bgcolor: '#d32f2f', color: '#fff' }}>
          {validationErrors.medidas}
        </Alert>
      )}
      
      {/* Medidas Técnicas */}
      <Accordion defaultExpanded sx={{ bgcolor: '#2a2a2a', color: '#fff', mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
          <Typography variant="h6">🔧 Medidas Técnicas</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box display="flex" gap={2} mb={2}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#bbb' }}>Seleccionar Medida Técnica</InputLabel>
              <Select
                value={newMedidaTecnica}
                onChange={(e) => setNewMedidaTecnica(e.target.value)}
                sx={{
                  bgcolor: '#333',
                  color: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' }
                }}
              >
                {medidasTecnicasSugeridas.filter(m => !eipd.medidas_tecnicas.includes(m)).map(medida => (
                  <MenuItem key={medida} value={medida}>
                    {medida}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={() => addMedida('tecnicas', newMedidaTecnica)}
              disabled={!newMedidaTecnica}
              sx={{ bgcolor: '#4fc3f7', color: '#000' }}
            >
              <AddIcon />
            </Button>
          </Box>

          <Box display="flex" flexWrap="wrap" gap={1}>
            {eipd.medidas_tecnicas.map((medida, index) => (
              <Chip
                key={index}
                label={medida}
                onDelete={() => removeMedida('tecnicas', medida)}
                sx={{ bgcolor: '#2e7d32', color: '#fff' }}
              />
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Medidas Organizativas */}
      <Accordion sx={{ bgcolor: '#2a2a2a', color: '#fff', mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
          <Typography variant="h6">🏛️ Medidas Organizativas</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box display="flex" gap={2} mb={2}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#bbb' }}>Seleccionar Medida Organizativa</InputLabel>
              <Select
                value={newMedidaOrg}
                onChange={(e) => setNewMedidaOrg(e.target.value)}
                sx={{
                  bgcolor: '#333',
                  color: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' }
                }}
              >
                {medidasOrgSugeridas.filter(m => !eipd.medidas_organizativas.includes(m)).map(medida => (
                  <MenuItem key={medida} value={medida}>
                    {medida}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={() => addMedida('organizativas', newMedidaOrg)}
              disabled={!newMedidaOrg}
              sx={{ bgcolor: '#4fc3f7', color: '#000' }}
            >
              <AddIcon />
            </Button>
          </Box>

          <Box display="flex" flexWrap="wrap" gap={1}>
            {eipd.medidas_organizativas.map((medida, index) => (
              <Chip
                key={index}
                label={medida}
                onDelete={() => removeMedida('organizativas', medida)}
                sx={{ bgcolor: '#1976d2', color: '#fff' }}
              />
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Medidas Legales */}
      <Accordion sx={{ bgcolor: '#2a2a2a', color: '#fff' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
          <Typography variant="h6">⚖️ Medidas Legales</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box display="flex" gap={2} mb={2}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#bbb' }}>Seleccionar Medida Legal</InputLabel>
              <Select
                value={newMedidaLegal}
                onChange={(e) => setNewMedidaLegal(e.target.value)}
                sx={{
                  bgcolor: '#333',
                  color: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' }
                }}
              >
                {medidasLegalesSugeridas.filter(m => !eipd.medidas_legales.includes(m)).map(medida => (
                  <MenuItem key={medida} value={medida}>
                    {medida}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={() => addMedida('legales', newMedidaLegal)}
              disabled={!newMedidaLegal}
              sx={{ bgcolor: '#4fc3f7', color: '#000' }}
            >
              <AddIcon />
            </Button>
          </Box>

          <Box display="flex" flexWrap="wrap" gap={1}>
            {eipd.medidas_legales.map((medida, index) => (
              <Chip
                key={index}
                label={medida}
                onDelete={() => removeMedida('legales', medida)}
                sx={{ bgcolor: '#f57f17', color: '#fff' }}
              />
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Resumen de medidas */}
      <Box mt={3} p={2} bgcolor="#333" borderRadius={1}>
        <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
          📊 Resumen de Medidas
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" sx={{ color: '#bbb' }}>Técnicas:</Typography>
            <Typography variant="h6" sx={{ color: '#2e7d32' }}>
              {eipd.medidas_tecnicas.length} medidas
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" sx={{ color: '#bbb' }}>Organizativas:</Typography>
            <Typography variant="h6" sx={{ color: '#1976d2' }}>
              {eipd.medidas_organizativas.length} medidas
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" sx={{ color: '#bbb' }}>Legales:</Typography>
            <Typography variant="h6" sx={{ color: '#f57f17' }}>
              {eipd.medidas_legales.length} medidas
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

// Helper function
const getRiesgoColor = (nivel) => {
  const colors = {
    'BAJO': '#2e7d32',
    'MEDIO': '#f57f17',
    'ALTO': '#d32f2f',
    'CRITICO': '#b71c1c'
  };
  return colors[nivel] || '#666';
};

export default EIPDCreator;