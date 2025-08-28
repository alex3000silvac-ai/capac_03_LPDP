/**
 * SISTEMA DE CONSULTA PREVIA A LA AGENCIA NACIONAL
 * Para EIPD de alto riesgo según Ley 21.719
 */

import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Grid,
  Divider
} from '@mui/material';
import {
  Gavel as AgenciaIcon,
  Security as EIPDIcon,
  Warning as RiskIcon,
  Send as SendIcon,
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  Description as DocumentIcon,
  Assignment as FormIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';

const ConsultaPreviaAgencia = ({ eipd_id = 'EIPD-2024-001', rat_id = 'RAT-EJEMPLO' }) => {
  const [searchParams] = useSearchParams();
  
  // Parámetros de URL del Dashboard DPO
  const ratOrigen = searchParams.get('rat') || rat_id;
  const documentoId = searchParams.get('documento') || '';
  const esNuevo = searchParams.get('nuevo') === 'true';
  const [activeStep, setActiveStep] = useState(0);
  const [consultaData, setConsultaData] = useState({
    motivo_consulta: '',
    nivel_riesgo: '',
    medidas_aplicadas: '',
    documentacion_adjunta: [],
    contacto_responsable: ''
  });
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [consultaEnviada, setConsultaEnviada] = useState(false);

  // Evaluar si requiere consulta previa
  const [requiereConsulta] = useState({
    required: true,
    risk_level: 'ALTO',
    reasons: [
      'Tratamiento masivo de datos sensibles (situación socioeconómica)',
      'Decisiones automatizadas con efectos legales significativos',
      'Transferencias internacionales (AWS Estados Unidos)',
      'Perfilado automatizado para scoring crediticio'
    ],
    recommendation: 'Se recomienda CONSULTA PREVIA obligatoria según Art. 26 Ley 21.719'
  });

  const pasos = [
    {
      titulo: 'Evaluación de Riesgo',
      descripcion: 'Sistema evalúa si la EIPD requiere consulta previa',
      completado: true
    },
    {
      titulo: 'Preparación Documentación',
      descripcion: 'Completar formulario y adjuntar documentos requeridos',
      completado: activeStep >= 1
    },
    {
      titulo: 'Envío a Agencia Nacional',
      descripcion: 'Transmisión oficial del expediente de consulta',
      completado: activeStep >= 2
    },
    {
      titulo: 'Respuesta Agencia',
      descripcion: 'Recepción de recomendaciones y resolución',
      completado: consultaEnviada
    }
  ];

  const handleInputChange = (field, value) => {
    setConsultaData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const enviarConsulta = () => {
    setShowSubmitDialog(true);
  };

  const confirmarEnvio = async () => {
    // Simular envío a la API
    console.log('Enviando consulta previa:', {
      eipd_id,
      rat_id,
      consulta_data: consultaData,
      timestamp: new Date().toISOString()
    });

    setActiveStep(3);
    setConsultaEnviada(true);
    setShowSubmitDialog(false);
    
    // Simular respuesta de la Agencia después de 3 segundos
    setTimeout(() => {
      alert(`✅ CONSULTA ENVIADA EXITOSAMENTE\n\nNúmero de expediente: CP-2024-001\nEstado: En revisión\nTiempo estimado respuesta: 15 días hábiles\n\nLa Agencia Nacional contactará al responsable designado.`);
    }, 1000);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 4, bgcolor: 'warning.main', color: 'white' }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            🏛️ CONSULTA PREVIA - AGENCIA NACIONAL DE PROTECCIÓN DE DATOS
          </Typography>
          <Typography variant="h6">
            Ley 21.719 Art. 26 - Tratamientos de Alto Riesgo
          </Typography>
        </CardContent>
      </Card>

      {/* Evaluación de Necesidad */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            📊 EVALUACIÓN AUTOMÁTICA DE RIESGO
          </Typography>
          
          <Alert severity={requiereConsulta.required ? "error" : "success"} sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600}>
              {requiereConsulta.required ? 
                "⚠️ CONSULTA PREVIA REQUERIDA" : 
                "✅ No requiere consulta previa"
              }
            </Typography>
            <Typography variant="body2">
              Nivel de Riesgo: <strong>{requiereConsulta.risk_level}</strong>
            </Typography>
          </Alert>

          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            🔍 Razones para Consulta Previa:
          </Typography>
          <List>
            {requiereConsulta.reasons.map((reason, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <RiskIcon color="warning" />
                </ListItemIcon>
                <ListItemText primary={reason} />
              </ListItem>
            ))}
          </List>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              💡 <strong>Recomendación del Sistema:</strong> {requiereConsulta.recommendation}
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Stepper de Proceso */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            📋 PROCESO DE CONSULTA PREVIA
          </Typography>
          
          <Stepper activeStep={activeStep} orientation="vertical">
            {pasos.map((paso, index) => (
              <Step key={index} completed={paso.completado}>
                <StepLabel>
                  <Typography fontWeight={600}>
                    {paso.titulo}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary">
                    {paso.descripcion}
                  </Typography>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Formulario de Consulta */}
      {requiereConsulta.required && !consultaEnviada && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              📝 FORMULARIO DE CONSULTA PREVIA
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Motivo de la Consulta"
                  multiline
                  rows={3}
                  value={consultaData.motivo_consulta}
                  onChange={(e) => handleInputChange('motivo_consulta', e.target.value)}
                  placeholder="Describa las razones por las cuales solicita la consulta previa..."
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Nivel de Riesgo Evaluado</InputLabel>
                  <Select
                    value={consultaData.nivel_riesgo}
                    onChange={(e) => handleInputChange('nivel_riesgo', e.target.value)}
                  >
                    <MenuItem value="ALTO">ALTO - Requiere consulta obligatoria</MenuItem>
                    <MenuItem value="MEDIO-ALTO">MEDIO-ALTO - Consulta recomendada</MenuItem>
                    <MenuItem value="MEDIO">MEDIO - Consulta opcional</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Responsable del Contacto"
                  value={consultaData.contacto_responsable}
                  onChange={(e) => handleInputChange('contacto_responsable', e.target.value)}
                  placeholder="Nombre y cargo del responsable"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Medidas de Protección Aplicadas"
                  multiline
                  rows={4}
                  value={consultaData.medidas_aplicadas}
                  onChange={(e) => handleInputChange('medidas_aplicadas', e.target.value)}
                  placeholder="Detalle las medidas técnicas y organizativas implementadas para mitigar el riesgo..."
                />
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    📎 DOCUMENTACIÓN REQUERIDA PARA ADJUNTAR:
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><DocumentIcon /></ListItemIcon>
                      <ListItemText 
                        primary="EIPD Completa (EIPD-2024-001)"
                        secondary="Evaluación de impacto en protección de datos"
                      />
                      <Chip label="Incluido automáticamente" color="success" size="small" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><DocumentIcon /></ListItemIcon>
                      <ListItemText 
                        primary="RAT Origen (RAT-EJEMPLO)"
                        secondary="Registro de actividades de tratamiento"
                      />
                      <Chip label="Incluido automáticamente" color="success" size="small" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><DocumentIcon /></ListItemIcon>
                      <ListItemText 
                        primary="Medidas Técnicas Implementadas"
                        secondary="Documentación de seguridad y protección"
                      />
                      <Button size="small" startIcon={<UploadIcon />}>
                        Adjuntar
                      </Button>
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={enviarConsulta}
                startIcon={<SendIcon />}
                disabled={!consultaData.motivo_consulta || !consultaData.nivel_riesgo}
                sx={{ 
                  bgcolor: 'warning.main',
                  '&:hover': { bgcolor: 'warning.dark' },
                  fontSize: '1.1rem',
                  px: 4,
                  py: 2
                }}
              >
                ENVIAR CONSULTA PREVIA A LA AGENCIA
              </Button>
            </Box>

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                ⚖️ <strong>Marco Legal:</strong> Consulta previa según Ley 21.719, Artículo 26. La Agencia Nacional emitirá recomendaciones dentro de 15 días hábiles. El incumplimiento puede resultar en sanciones de hasta 20.000 UTM.
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Estado de Consulta Enviada */}
      {consultaEnviada && (
        <Card sx={{ bgcolor: 'success.light' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              ✅ CONSULTA PREVIA ENVIADA EXITOSAMENTE
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Número de Expediente:</Typography>
                <Typography variant="body1" fontWeight={600}>CP-2024-001</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Estado:</Typography>
                <Chip label="EN REVISIÓN" color="warning" />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Fecha de Envío:</Typography>
                <Typography variant="body1">{new Date().toLocaleDateString('es-CL')}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Tiempo Estimado:</Typography>
                <Typography variant="body1" fontWeight={600}>15 días hábiles</Typography>
              </Grid>
            </Grid>

            <Alert severity="success" sx={{ mt: 3 }}>
              <Typography variant="body2">
                🏛️ La Agencia Nacional de Protección de Datos Personales ha recibido su consulta previa. Recibirá notificación por email cuando haya una respuesta oficial.
              </Typography>
            </Alert>

            <Box sx={{ mt: 3 }}>
              <Button variant="outlined" startIcon={<DocumentIcon />}>
                Descargar Comprobante de Envío
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Confirmación */}
      <Dialog open={showSubmitDialog} onClose={() => setShowSubmitDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight={700}>
            🏛️ CONFIRMAR ENVÍO A AGENCIA NACIONAL
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={600}>
              ⚠️ IMPORTANTE: Esta consulta se enviará oficialmente a la Agencia Nacional de Protección de Datos Personales
            </Typography>
          </Alert>
          
          <Typography variant="body2" gutterBottom>
            Una vez enviada la consulta:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
              <ListItemText primary="Se generará un expediente oficial" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
              <ListItemText primary="La Agencia tendrá 15 días hábiles para responder" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
              <ListItemText primary="No podrá proceder con el tratamiento hasta recibir respuesta" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSubmitDialog(false)}>
            Cancelar
          </Button>
          <Button variant="contained" color="warning" onClick={confirmarEnvio}>
            CONFIRMAR ENVÍO OFICIAL
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConsultaPreviaAgencia;