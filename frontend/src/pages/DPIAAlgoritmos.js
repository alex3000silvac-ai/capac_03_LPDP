/**
 * PÁGINA DPIA - EVALUACIÓN DE IMPACTO DE ALGORITMOS
 * Maneja la creación y edición de DPIA para decisiones automatizadas
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  LinearProgress,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Assessment as DPIAIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  AutoAwesome as AIIcon,
  Security as SecurityIcon,
  Save as SaveIcon,
  Send as SendIcon
} from '@mui/icons-material';

const DPIAAlgoritmos = () => {
  const [searchParams] = useSearchParams();
  const ratId = searchParams.get('rat');
  const documentoId = searchParams.get('documento');
  const esNuevo = searchParams.get('nuevo') === 'true';
  
  const [dpiaData, setDpiaData] = useState({
    nombre: '',
    descripcion: '',
    algoritmo_evaluado: '',
    tipo_algoritmo: '',
    impacto_derechos: '',
    medidas_proteccion: '',
    nivel_transparencia: '',
    explicabilidad: '',
    rat_origen: ratId || '',
    progreso: 0
  });
  
  const [activeStep, setActiveStep] = useState(0);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (esNuevo && ratId) {
      // Pre-llenar datos desde RAT
      preLlenarDesdeRAT();
    } else if (documentoId) {
      // Cargar DPIA existente
      cargarDPIA();
    }
  }, [ratId, documentoId, esNuevo]);

  const preLlenarDesdeRAT = () => {
    // Simular carga de datos del RAT
    setDpiaData(prev => ({
      ...prev,
      nombre: `DPIA - Algoritmos RAT ${ratId}`,
      descripcion: 'Evaluación de impacto para decisiones automatizadas',
      rat_origen: ratId,
      algoritmo_evaluado: 'Sistema de IA para procesamiento automático',
      tipo_algoritmo: 'machine_learning'
    }));
  };

  const cargarDPIA = () => {
    // Simular carga de DPIA existente
    setDpiaData(prev => ({
      ...prev,
      nombre: 'DPIA Algoritmos IA Salud',
      descripcion: 'Evaluación de algoritmos de diagnóstico médico',
      algoritmo_evaluado: 'Sistema IA diagnóstico médico automatizado',
      tipo_algoritmo: 'deep_learning',
      progreso: 40
    }));
    
    // Calcular paso activo basado en progreso
    setActiveStep(Math.floor((40 / 100) * 4));
  };

  const pasos = [
    'Información Básica',
    'Descripción del Algoritmo', 
    'Evaluación de Impacto',
    'Medidas de Protección',
    'Revisión Final'
  ];

  const handleInputChange = (field, value) => {
    setDpiaData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Calcular progreso automáticamente
    calcularProgreso();
  };

  const calcularProgreso = () => {
    const campos = ['nombre', 'descripcion', 'algoritmo_evaluado', 'tipo_algoritmo', 'impacto_derechos', 'medidas_proteccion'];
    const completados = campos.filter(campo => dpiaData[campo] && dpiaData[campo] !== '').length;
    const nuevoProgreso = Math.round((completados / campos.length) * 100);
    
    setDpiaData(prev => ({
      ...prev,
      progreso: nuevoProgreso
    }));
  };

  const guardarDPIA = async () => {
    setGuardando(true);
    
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert(`✅ DPIA guardada exitosamente!\n\n` +
            `📄 ${dpiaData.nombre}\n` +
            `📊 Progreso: ${dpiaData.progreso}%\n` +
            `🔗 Asociada a: ${dpiaData.rat_origen}\n\n` +
            `🔔 El DPO recibirá notificación de actualización.`);
      
      // Regresar al dashboard
      setTimeout(() => {
        window.location.href = '/dashboard-dpo';
      }, 2000);
      
    } catch (error) {
      alert('❌ Error al guardar DPIA');
    } finally {
      setGuardando(false);
    }
  };

  const enviarParaRevision = () => {
    if (dpiaData.progreso < 100) {
      alert('⚠️ La DPIA debe estar 100% completa antes de enviar para revisión.');
      return;
    }
    
    alert(`📋 DPIA enviada para revisión legal\n\n` +
          `El equipo legal revisará el documento y te notificará cuando esté aprobado.`);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 4, bgcolor: 'warning.main', color: 'white' }}>
        <CardContent>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            🤖 DPIA - EVALUACIÓN IMPACTO ALGORITMOS
          </Typography>
          <Typography variant="h6">
            {esNuevo ? 'Creando nueva DPIA' : 'Editando DPIA existente'} • Ley 21.719 Art. 13
          </Typography>
          {ratId && (
            <Chip 
              label={`Asociada a: ${ratId}`} 
              sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.2)' }}
            />
          )}
        </CardContent>
      </Card>

      {/* Barra de Progreso */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={600}>
              📊 Progreso de Completitud
            </Typography>
            <Chip 
              label={`${dpiaData.progreso}%`} 
              color={dpiaData.progreso === 100 ? 'success' : dpiaData.progreso >= 50 ? 'warning' : 'primary'}
            />
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={dpiaData.progreso} 
            sx={{ height: 10, borderRadius: 5 }}
          />
        </CardContent>
      </Card>

      {/* Stepper */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {pasos.map((label, index) => (
              <Step key={label} completed={activeStep > index}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Formulario Principal */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                📝 INFORMACIÓN DEL ALGORITMO
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nombre de la DPIA"
                    value={dpiaData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descripción del Propósito"
                    multiline
                    rows={3}
                    value={dpiaData.descripcion}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Algoritmo/Sistema Evaluado"
                    value={dpiaData.algoritmo_evaluado}
                    onChange={(e) => handleInputChange('algoritmo_evaluado', e.target.value)}
                    placeholder="Ej: Sistema de diagnóstico médico automatizado"
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Tipo de Algoritmo</InputLabel>
                    <Select
                      value={dpiaData.tipo_algoritmo}
                      onChange={(e) => handleInputChange('tipo_algoritmo', e.target.value)}
                    >
                      <MenuItem value="machine_learning">Machine Learning</MenuItem>
                      <MenuItem value="deep_learning">Deep Learning / IA</MenuItem>
                      <MenuItem value="reglas_logicas">Reglas Lógicas</MenuItem>
                      <MenuItem value="estadistico">Modelo Estadístico</MenuItem>
                      <MenuItem value="heuristico">Algoritmo Heurístico</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Nivel de Transparencia</InputLabel>
                    <Select
                      value={dpiaData.nivel_transparencia}
                      onChange={(e) => handleInputChange('nivel_transparencia', e.target.value)}
                    >
                      <MenuItem value="alto">Alto - Totalmente explicable</MenuItem>
                      <MenuItem value="medio">Medio - Parcialmente explicable</MenuItem>
                      <MenuItem value="bajo">Bajo - Caja negra</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Impacto en Derechos de los Titulares"
                    multiline
                    rows={4}
                    value={dpiaData.impacto_derechos}
                    onChange={(e) => handleInputChange('impacto_derechos', e.target.value)}
                    placeholder="Describa cómo el algoritmo puede afectar los derechos de las personas..."
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Medidas de Protección Implementadas"
                    multiline
                    rows={4}
                    value={dpiaData.medidas_proteccion}
                    onChange={(e) => handleInputChange('medidas_proteccion', e.target.value)}
                    placeholder="Describa las medidas técnicas y organizativas para mitigar riesgos..."
                    required
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel Lateral */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                📋 REQUISITOS LEY 21.719
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color={dpiaData.algoritmo_evaluado ? 'success' : 'disabled'} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Descripción del algoritmo"
                    secondary="Art. 13.1 - Identificar sistema"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color={dpiaData.impacto_derechos ? 'success' : 'disabled'} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Evaluación de impacto"
                    secondary="Art. 13.2 - Impacto en derechos"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color={dpiaData.medidas_proteccion ? 'success' : 'disabled'} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Medidas de mitigación"
                    secondary="Art. 13.3 - Protección datos"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                🎯 PRÓXIMOS PASOS
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Una vez completada al 100%:
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon><SecurityIcon /></ListItemIcon>
                  <ListItemText primary="Revisión equipo legal" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><SendIcon /></ListItemIcon>
                  <ListItemText primary="Aprobación DPO" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckIcon /></ListItemIcon>
                  <ListItemText primary="Implementación algoritmo" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Botones de Acción */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Button
              variant="outlined"
              onClick={() => window.location.href = '/dashboard-dpo'}
            >
              ← Volver al Dashboard
            </Button>
            
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={guardarDPIA}
                disabled={guardando}
                color="primary"
              >
                {guardando ? 'Guardando...' : 'Guardar DPIA'}
              </Button>
              
              {dpiaData.progreso === 100 && (
                <Button
                  variant="contained"
                  startIcon={<SendIcon />}
                  onClick={enviarParaRevision}
                  color="success"
                >
                  Enviar para Revisión
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {dpiaData.progreso === 100 && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="h6">✅ DPIA COMPLETA</Typography>
          <Typography variant="body2">
            El documento está listo para revisión. Una vez aprobado, el algoritmo podrá implementarse.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default DPIAAlgoritmos;