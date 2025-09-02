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
  Chip,
  Alert,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Gavel as GavelIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  Public as PublicIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';

const RATEditPage = () => {
  const { ratId } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rat, setRat] = useState({
    // Información básica
    nombre_actividad: '',
    descripcion: '',
    finalidad: '',
    categoria: '',
    
    // Responsabilidad
    responsable_proceso: '',
    area_responsable: '',
    contacto_responsable: '',
    
    // Base legal
    base_legal: '',
    interes_legitimo_detalle: '',
    
    // Datos personales
    tipos_datos: [],
    categorias_especiales: [],
    origen_datos: '',
    
    // Destinatarios
    destinatarios_internos: [],
    destinatarios_externos: [],
    transferencias_internacionales: false,
    paises_destino: [],
    garantias_transferencia: '',
    
    // Conservación
    plazo_conservacion: '',
    criterios_conservacion: '',
    
    // Seguridad
    medidas_tecnicas: [],
    medidas_organizativas: [],
    
    // Evaluación
    nivel_riesgo: '',
    requiere_eipd: false,
    eipd_asociada: null,
    
    // Estado
    estado: 'BORRADOR',
    comentarios: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (ratId && ratId !== 'new') {
      loadRAT();
    }
  }, [ratId]);

  const loadRAT = async () => {
    try {
      setLoading(true);
      
      // Mock data - en prod conectaría con API
      const mockRAT = {
        id: parseInt(ratId),
        numero_rat: `RAT-2024-${String(ratId).padStart(3, '0')}`,
        nombre_actividad: 'Gestión de Clientes Bancarios',
        descripcion: 'Sistema integral para la administración de datos de clientes del banco',
        finalidad: 'Administración de cuentas bancarias, evaluación crediticia y cumplimiento normativo',
        categoria: 'financiero',
        responsable_proceso: 'juan.perez@banco.cl',
        area_responsable: 'Operaciones Bancarias',
        contacto_responsable: '+56912345678',
        base_legal: 'ejecucion_contrato',
        tipos_datos: ['identificacion', 'financieros', 'contacto'],
        origen_datos: 'Directamente del titular',
        destinatarios_internos: ['Área Comercial', 'Área Riesgos', 'Área Cumplimiento'],
        destinatarios_externos: ['SBIF', 'CMF'],
        transferencias_internacionales: true,
        paises_destino: ['Estados Unidos', 'España'],
        garantias_transferencia: 'Decisión de adecuación - Estados Unidos Safe Harbor',
        plazo_conservacion: '10 años posterior al cierre de cuenta',
        criterios_conservacion: 'Requerimientos normativos bancarios y tributarios',
        medidas_tecnicas: ['Cifrado AES-256', 'Autenticación multifactor', 'Logs de auditoría'],
        medidas_organizativas: ['Capacitación personal', 'Políticas acceso', 'Contratos confidencialidad'],
        nivel_riesgo: 'ALTO',
        requiere_eipd: true,
        estado: 'EN_REVISION',
        fecha_creacion: '2024-01-10T10:00:00Z',
        fecha_actualizacion: '2024-01-15T14:30:00Z'
      };
      
      setRat(mockRAT);
      
    } catch (error) {
      console.error('Error cargando RAT:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setRat(prev => ({
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

  const handleArrayFieldAdd = (field, value) => {
    if (value && !rat[field].includes(value)) {
      setRat(prev => ({
        ...prev,
        [field]: [...prev[field], value]
      }));
    }
  };

  const handleArrayFieldRemove = (field, value) => {
    setRat(prev => ({
      ...prev,
      [field]: prev[field].filter(item => item !== value)
    }));
  };

  const validateStep = (step) => {
    const errors = {};
    
    switch (step) {
      case 0: // Información básica
        if (!rat.nombre_actividad) errors.nombre_actividad = 'Nombre requerido';
        if (!rat.finalidad) errors.finalidad = 'Finalidad requerida';
        if (!rat.categoria) errors.categoria = 'Categoría requerida';
        break;
        
      case 1: // Responsabilidad
        if (!rat.responsable_proceso) errors.responsable_proceso = 'Responsable requerido';
        if (!rat.area_responsable) errors.area_responsable = 'Área requerida';
        break;
        
      case 2: // Base legal
        if (!rat.base_legal) errors.base_legal = 'Base legal requerida';
        break;
        
      case 3: // Datos personales
        if (rat.tipos_datos.length === 0) errors.tipos_datos = 'Al menos un tipo de dato requerido';
        break;
        
      case 4: // Destinatarios
        if (rat.destinatarios_internos.length === 0) errors.destinatarios_internos = 'Al menos un destinatario interno requerido';
        break;
        
      case 5: // Conservación
        if (!rat.plazo_conservacion) errors.plazo_conservacion = 'Plazo conservación requerido';
        break;
        
      case 6: // Seguridad
        if (rat.medidas_tecnicas.length === 0) errors.medidas_tecnicas = 'Al menos una medida técnica requerida';
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

  const handleSave = async (asDraft = true) => {
    try {
      setSaving(true);
      
      // Validar datos completos si no es borrador
      if (!asDraft) {
        const allStepsValid = Array.from({ length: 7 }, (_, i) => validateStep(i)).every(Boolean);
        if (!allStepsValid) {
          throw new Error('Complete todos los campos requeridos');
        }
      }
      
      const ratData = {
        ...rat,
        estado: asDraft ? 'BORRADOR' : 'EN_REVISION',
        fecha_actualizacion: new Date().toISOString()
      };
      
      // En prod: enviar a API
      console.log('Guardando RAT:', ratData);
      
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate('/rats');
      
    } catch (error) {
      console.error('Error guardando RAT:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box p={3}>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography sx={{ color: '#ccc' }}>Cargando RAT...</Typography>
      </Box>
    );
  }

  const steps = [
    {
      label: 'Información Básica',
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Nombre de la Actividad"
              value={rat.nombre_actividad}
              onChange={(e) => handleFieldChange('nombre_actividad', e.target.value)}
              error={!!validationErrors.nombre_actividad}
              helperText={validationErrors.nombre_actividad}
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
              label="Descripción Detallada"
              value={rat.descripcion}
              onChange={(e) => handleFieldChange('descripcion', e.target.value)}
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
              rows={2}
              label="Finalidad del Tratamiento"
              value={rat.finalidad}
              onChange={(e) => handleFieldChange('finalidad', e.target.value)}
              error={!!validationErrors.finalidad}
              helperText={validationErrors.finalidad}
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
            <FormControl fullWidth required error={!!validationErrors.categoria}>
              <InputLabel sx={{ color: '#bbb' }}>Categoría de Industria</InputLabel>
              <Select
                value={rat.categoria}
                onChange={(e) => handleFieldChange('categoria', e.target.value)}
                sx={{
                  bgcolor: '#2a2a2a',
                  color: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666' }
                }}
              >
                <MenuItem value="financiero">Financiero</MenuItem>
                <MenuItem value="salud">Salud</MenuItem>
                <MenuItem value="educacion">Educación</MenuItem>
                <MenuItem value="retail">Retail</MenuItem>
                <MenuItem value="tecnologia">Tecnología</MenuItem>
                <MenuItem value="servicios">Servicios</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      )
    },
    {
      label: 'Responsabilidad',
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Responsable del Proceso"
              value={rat.responsable_proceso}
              onChange={(e) => handleFieldChange('responsable_proceso', e.target.value)}
              error={!!validationErrors.responsable_proceso}
              helperText={validationErrors.responsable_proceso}
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
            <TextField
              fullWidth
              required
              label="Área Responsable"
              value={rat.area_responsable}
              onChange={(e) => handleFieldChange('area_responsable', e.target.value)}
              error={!!validationErrors.area_responsable}
              helperText={validationErrors.area_responsable}
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
            <TextField
              fullWidth
              label="Contacto del Responsable"
              value={rat.contacto_responsable}
              onChange={(e) => handleFieldChange('contacto_responsable', e.target.value)}
              placeholder="email@empresa.cl"
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
      label: 'Base Legal',
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth required error={!!validationErrors.base_legal}>
              <InputLabel sx={{ color: '#bbb' }}>Base Legal del Tratamiento</InputLabel>
              <Select
                value={rat.base_legal}
                onChange={(e) => handleFieldChange('base_legal', e.target.value)}
                sx={{
                  bgcolor: '#2a2a2a',
                  color: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666' }
                }}
              >
                <MenuItem value="consentimiento_titular">Consentimiento del Titular</MenuItem>
                <MenuItem value="ejecucion_contrato">Ejecución de Contrato</MenuItem>
                <MenuItem value="cumplimiento_obligacion_legal">Cumplimiento Obligación Legal</MenuItem>
                <MenuItem value="proteccion_intereses_vitales">Protección Intereses Vitales</MenuItem>
                <MenuItem value="interes_publico">Interés Público</MenuItem>
                <MenuItem value="interes_legitimo">Interés Legítimo</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {rat.base_legal === 'interes_legitimo' && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                required
                label="Detalle del Interés Legítimo"
                value={rat.interes_legitimo_detalle}
                onChange={(e) => handleFieldChange('interes_legitimo_detalle', e.target.value)}
                placeholder="Describa el interés legítimo y la evaluación de equilibrio..."
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
          )}
        </Grid>
      )
    },
    {
      label: 'Datos Personales',
      content: (
        <Box>
          <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
            🗂️ Tipos de Datos Tratados
          </Typography>
          
          <DataTypesSelector 
            selectedTypes={rat.tipos_datos}
            onTypesChange={(types) => handleFieldChange('tipos_datos', types)}
            error={validationErrors.tipos_datos}
          />

          <Typography variant="h6" sx={{ color: '#fff', mt: 3, mb: 2 }}>
            📍 Origen de los Datos
          </Typography>
          
          <TextField
            fullWidth
            label="Origen de los Datos"
            value={rat.origen_datos}
            onChange={(e) => handleFieldChange('origen_datos', e.target.value)}
            placeholder="Directamente del titular, terceros autorizados, fuentes públicas..."
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
        </Box>
      )
    },
    {
      label: 'Destinatarios',
      content: (
        <Box>
          <RecipientsSection 
            rat={rat}
            onFieldChange={handleFieldChange}
            onArrayAdd={handleArrayFieldAdd}
            onArrayRemove={handleArrayFieldRemove}
            validationErrors={validationErrors}
          />
        </Box>
      )
    },
    {
      label: 'Conservación',
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Plazo de Conservación"
              value={rat.plazo_conservacion}
              onChange={(e) => handleFieldChange('plazo_conservacion', e.target.value)}
              error={!!validationErrors.plazo_conservacion}
              helperText={validationErrors.plazo_conservacion}
              placeholder="ej: 5 años posterior al término del contrato"
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
              label="Criterios de Conservación"
              value={rat.criterios_conservacion}
              onChange={(e) => handleFieldChange('criterios_conservacion', e.target.value)}
              placeholder="Describa los criterios que determinan el plazo de conservación..."
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
      label: 'Medidas de Seguridad',
      content: (
        <SecurityMeasuresSection 
          rat={rat}
          onArrayAdd={handleArrayFieldAdd}
          onArrayRemove={handleArrayFieldRemove}
          validationErrors={validationErrors}
        />
      )
    }
  ];

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
            {ratId === 'new' ? '📝 Nuevo RAT' : `✏️ Editar RAT ${rat.numero_rat}`}
          </Typography>
          <Typography variant="body1" sx={{ color: '#bbb' }}>
            {ratId === 'new' ? 'Crear nuevo Registro de Actividades de Tratamiento' : 'Modificar RAT existente'}
          </Typography>
        </Box>
        
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={() => navigate('/rats')}
            sx={{
              borderColor: '#666',
              color: '#fff',
              '&:hover': { borderColor: '#999', bgcolor: '#333' }
            }}
            startIcon={<CancelIcon />}
          >
            Cancelar
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => handleSave(true)}
            disabled={saving}
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
            onClick={() => handleSave(false)}
            disabled={saving}
            sx={{
              bgcolor: '#4fc3f7',
              color: '#000',
              fontWeight: 600,
              '&:hover': { bgcolor: '#29b6f6' }
            }}
            startIcon={<CheckIcon />}
          >
            Enviar a Revisión
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
                <Box display="flex" gap={1} justifyContent="space-between" alignItems="center">
                  <Box display="flex" gap={1}>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      variant="outlined"
                      sx={{ 
                        color: '#94a3b8',
                        borderColor: '#374151',
                        '&:hover': { 
                          borderColor: '#4fc3f7',
                          bgcolor: 'rgba(79, 195, 247, 0.1)'
                        }
                      }}
                    >
                      ← Anterior
                    </Button>
                    <Button
                      variant="contained"
                      onClick={index === steps.length - 1 ? () => handleSave(false) : handleNext}
                      sx={{
                        bgcolor: '#4fc3f7',
                        color: '#000',
                        fontWeight: 600,
                        '&:hover': { bgcolor: '#29b6f6' }
                      }}
                    >
                      {index === steps.length - 1 ? 'Finalizar' : 'Siguiente →'}
                    </Button>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      Paso {index + 1} de {steps.length}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(index + 1) / steps.length * 100}
                      sx={{
                        width: 100,
                        '& .MuiLinearProgress-bar': {
                          bgcolor: '#4fc3f7'
                        }
                      }}
                    />
                  </Box>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </Box>
  );
};

// Componente selector de tipos de datos
const DataTypesSelector = ({ selectedTypes, onTypesChange, error }) => {
  const tiposDatos = [
    { value: 'identificacion', label: 'Identificación', description: 'RUT, nombre, apellidos' },
    { value: 'contacto', label: 'Contacto', description: 'Email, teléfono, dirección' },
    { value: 'financieros', label: 'Financieros', description: 'Datos bancarios, crediticios' },
    { value: 'laborales', label: 'Laborales', description: 'Cargo, salario, evaluaciones' },
    { value: 'salud', label: 'Salud', description: 'Información médica' },
    { value: 'biometricos', label: 'Biométricos', description: 'Huella dactilar, facial' },
    { value: 'localizacion', label: 'Localización', description: 'GPS, IP, ubicación' },
    { value: 'navegacion', label: 'Navegación', description: 'Cookies, historial web' },
    { value: 'preferencias', label: 'Preferencias', description: 'Configuraciones usuario' },
    { value: 'comportamiento', label: 'Comportamiento', description: 'Patrones de uso' }
  ];

  const toggleTipo = (tipo) => {
    if (selectedTypes.includes(tipo)) {
      onTypesChange(selectedTypes.filter(t => t !== tipo));
    } else {
      onTypesChange([...selectedTypes, tipo]);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2, bgcolor: '#d32f2f', color: '#fff' }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={2}>
        {tiposDatos.map((tipo) => (
          <Grid item xs={12} md={6} key={tipo.value}>
            <Card 
              sx={{ 
                bgcolor: selectedTypes.includes(tipo.value) ? '#0d47a1' : '#2a2a2a',
                border: selectedTypes.includes(tipo.value) ? '2px solid #4fc3f7' : '1px solid #444',
                cursor: 'pointer',
                '&:hover': { bgcolor: '#333' }
              }}
              onClick={() => toggleTipo(tipo.value)}
            >
              <CardContent>
                <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600 }}>
                  {tipo.label}
                </Typography>
                <Typography variant="body2" sx={{ color: '#bbb' }}>
                  {tipo.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Componente destinatarios
const RecipientsSection = ({ rat, onFieldChange, onArrayAdd, onArrayRemove, validationErrors }) => {
  const [newInternal, setNewInternal] = useState('');
  const [newExternal, setNewExternal] = useState('');

  return (
    <Box>
      {/* Destinatarios internos */}
      <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
        🏢 Destinatarios Internos
      </Typography>
      
      <Box display="flex" gap={2} mb={2}>
        <TextField
          fullWidth
          label="Agregar Destinatario Interno"
          value={newInternal}
          onChange={(e) => setNewInternal(e.target.value)}
          placeholder="ej: Área Comercial, Gerencia Finanzas..."
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#2a2a2a',
              '& fieldset': { borderColor: '#444' }
            },
            '& .MuiInputLabel-root': { color: '#bbb' }
          }}
        />
        <Button
          variant="contained"
          onClick={() => {
            onArrayAdd('destinatarios_internos', newInternal);
            setNewInternal('');
          }}
          disabled={!newInternal}
          sx={{ bgcolor: '#4fc3f7', color: '#000' }}
        >
          <AddIcon />
        </Button>
      </Box>

      <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
        {rat.destinatarios_internos.map((destinatario, index) => (
          <Chip
            key={index}
            label={destinatario}
            onDelete={() => onArrayRemove('destinatarios_internos', destinatario)}
            sx={{ bgcolor: '#0d47a1', color: '#fff' }}
          />
        ))}
      </Box>

      {/* Destinatarios externos */}
      <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
        🌐 Destinatarios Externos
      </Typography>
      
      <Box display="flex" gap={2} mb={2}>
        <TextField
          fullWidth
          label="Agregar Destinatario Externo"
          value={newExternal}
          onChange={(e) => setNewExternal(e.target.value)}
          placeholder="ej: SBIF, CMF, Proveedores tecnológicos..."
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#2a2a2a',
              '& fieldset': { borderColor: '#444' }
            },
            '& .MuiInputLabel-root': { color: '#bbb' }
          }}
        />
        <Button
          variant="contained"
          onClick={() => {
            onArrayAdd('destinatarios_externos', newExternal);
            setNewExternal('');
          }}
          disabled={!newExternal}
          sx={{ bgcolor: '#4fc3f7', color: '#000' }}
        >
          <AddIcon />
        </Button>
      </Box>

      <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
        {rat.destinatarios_externos.map((destinatario, index) => (
          <Chip
            key={index}
            label={destinatario}
            onDelete={() => onArrayRemove('destinatarios_externos', destinatario)}
            sx={{ bgcolor: '#f57f17', color: '#fff' }}
          />
        ))}
      </Box>

      {/* Transferencias internacionales */}
      <FormControlLabel
        control={
          <Switch
            checked={rat.transferencias_internacionales}
            onChange={(e) => onFieldChange('transferencias_internacionales', e.target.checked)}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': { color: '#4fc3f7' },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#0d47a1' }
            }}
          />
        }
        label={
          <Typography sx={{ color: '#fff', fontWeight: 600 }}>
            🌍 Incluye Transferencias Internacionales
          </Typography>
        }
      />

      {rat.transferencias_internacionales && (
        <Box mt={2}>
          <InternationalTransfersSection 
            rat={rat}
            onFieldChange={onFieldChange}
            onArrayAdd={onArrayAdd}
            onArrayRemove={onArrayRemove}
          />
        </Box>
      )}
    </Box>
  );
};

// Componente transferencias internacionales
const InternationalTransfersSection = ({ rat, onFieldChange, onArrayAdd, onArrayRemove }) => {
  const [newCountry, setNewCountry] = useState('');

  return (
    <Paper elevation={1} sx={{ bgcolor: '#2a2a2a', p: 3 }}>
      <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
        🌍 Transferencias Internacionales
      </Typography>
      
      <Box display="flex" gap={2} mb={2}>
        <TextField
          fullWidth
          label="País de Destino"
          value={newCountry}
          onChange={(e) => setNewCountry(e.target.value)}
          placeholder="ej: Estados Unidos, España, Reino Unido..."
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#333',
              '& fieldset': { borderColor: '#555' }
            },
            '& .MuiInputLabel-root': { color: '#bbb' }
          }}
        />
        <Button
          variant="contained"
          onClick={() => {
            onArrayAdd('paises_destino', newCountry);
            setNewCountry('');
          }}
          disabled={!newCountry}
          sx={{ bgcolor: '#4fc3f7', color: '#000' }}
        >
          <AddIcon />
        </Button>
      </Box>

      <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
        {rat.paises_destino.map((pais, index) => (
          <Chip
            key={index}
            label={pais}
            onDelete={() => onArrayRemove('paises_destino', pais)}
            sx={{ bgcolor: '#1976d2', color: '#fff' }}
          />
        ))}
      </Box>

      <TextField
        fullWidth
        multiline
        rows={2}
        label="Garantías para la Transferencia"
        value={rat.garantias_transferencia}
        onChange={(e) => onFieldChange('garantias_transferencia', e.target.value)}
        placeholder="Decisión de adecuación, cláusulas contractuales tipo..."
        sx={{
          '& .MuiOutlinedInput-root': {
            bgcolor: '#333',
            '& fieldset': { borderColor: '#555' }
          },
          '& .MuiInputLabel-root': { color: '#bbb' }
        }}
      />
    </Paper>
  );
};

// Componente medidas de seguridad
const SecurityMeasuresSection = ({ rat, onArrayAdd, onArrayRemove, validationErrors }) => {
  const [newTechnical, setNewTechnical] = useState('');
  const [newOrganizational, setNewOrganizational] = useState('');

  const medidasTecnicasComunes = [
    'Cifrado AES-256',
    'Autenticación multifactor',
    'Logs de auditoría',
    'Backup automático',
    'Firewall aplicaciones',
    'Monitoreo en tiempo real',
    'Control acceso basado en roles',
    'Cifrado en tránsito',
    'Cifrado en reposo',
    'Tokenización datos'
  ];

  const medidasOrganizativasComunes = [
    'Capacitación personal',
    'Políticas de acceso',
    'Contratos confidencialidad',
    'Procedimientos respuesta incidentes',
    'Auditorías periódicas',
    'Designación DPO',
    'Evaluaciones impacto',
    'Gestión proveedores',
    'Control acceso físico',
    'Políticas retención'
  ];

  return (
    <Box>
      {/* Medidas técnicas */}
      <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
        🔧 Medidas Técnicas
      </Typography>
      
      {validationErrors.medidas_tecnicas && (
        <Alert severity="error" sx={{ mb: 2, bgcolor: '#d32f2f', color: '#fff' }}>
          {validationErrors.medidas_tecnicas}
        </Alert>
      )}
      
      <Box display="flex" gap={2} mb={2}>
        <FormControl fullWidth>
          <InputLabel sx={{ color: '#bbb' }}>Seleccionar Medida Técnica</InputLabel>
          <Select
            value={newTechnical}
            onChange={(e) => setNewTechnical(e.target.value)}
            sx={{
              bgcolor: '#2a2a2a',
              color: '#fff',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' }
            }}
          >
            {medidasTecnicasComunes.filter(m => !rat.medidas_tecnicas.includes(m)).map(medida => (
              <MenuItem key={medida} value={medida}>
                {medida}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={() => {
            onArrayAdd('medidas_tecnicas', newTechnical);
            setNewTechnical('');
          }}
          disabled={!newTechnical}
          sx={{ bgcolor: '#4fc3f7', color: '#000' }}
        >
          <AddIcon />
        </Button>
      </Box>

      <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
        {rat.medidas_tecnicas.map((medida, index) => (
          <Chip
            key={index}
            label={medida}
            onDelete={() => onArrayRemove('medidas_tecnicas', medida)}
            sx={{ bgcolor: '#2e7d32', color: '#fff' }}
          />
        ))}
      </Box>

      {/* Medidas organizativas */}
      <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
        🏛️ Medidas Organizativas
      </Typography>
      
      <Box display="flex" gap={2} mb={2}>
        <FormControl fullWidth>
          <InputLabel sx={{ color: '#bbb' }}>Seleccionar Medida Organizativa</InputLabel>
          <Select
            value={newOrganizational}
            onChange={(e) => setNewOrganizational(e.target.value)}
            sx={{
              bgcolor: '#2a2a2a',
              color: '#fff',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' }
            }}
          >
            {medidasOrganizativasComunes.filter(m => !rat.medidas_organizativas.includes(m)).map(medida => (
              <MenuItem key={medida} value={medida}>
                {medida}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={() => {
            onArrayAdd('medidas_organizativas', newOrganizational);
            setNewOrganizational('');
          }}
          disabled={!newOrganizational}
          sx={{ bgcolor: '#4fc3f7', color: '#000' }}
        >
          <AddIcon />
        </Button>
      </Box>

      <Box display="flex" flexWrap="wrap" gap={1}>
        {rat.medidas_organizativas.map((medida, index) => (
          <Chip
            key={index}
            label={medida}
            onDelete={() => onArrayRemove('medidas_organizativas', medida)}
            sx={{ bgcolor: '#1976d2', color: '#fff' }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default RATEditPage;