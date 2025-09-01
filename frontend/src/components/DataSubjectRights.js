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
  Alert,
  Card,
  CardContent,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';
import {
  PersonSearch as PersonSearchIcon,
  Security as SecurityIcon,
  Gavel as GavelIcon,
  DeleteForever as DeleteIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Assignment as AssignmentIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon
} from '@mui/icons-material';

const DataSubjectRights = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [requests, setRequests] = useState([]);
  const [newRequest, setNewRequest] = useState({
    tipo_solicitud: '',
    datos_titular: {
      nombre: '',
      rut: '',
      email: '',
      telefono: '',
      direccion: ''
    },
    detalle_solicitud: '',
    documentos_adjuntos: [],
    urgente: false
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [responseDialog, setResponseDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const tiposSolicitud = [
    { 
      value: 'ACCESO', 
      label: 'Acceso a Datos Personales',
      description: 'Solicitar copia de datos personales tratados',
      plazo_dias: 20,
      icon: <PersonSearchIcon />
    },
    { 
      value: 'RECTIFICACION', 
      label: 'Rectificación de Datos',
      description: 'Modificar datos personales incorrectos o incompletos',
      plazo_dias: 20,
      icon: <EditIcon />
    },
    { 
      value: 'CANCELACION', 
      label: 'Cancelación de Datos',
      description: 'Eliminar datos personales cuando no sean necesarios',
      plazo_dias: 20,
      icon: <DeleteIcon />
    },
    { 
      value: 'OPOSICION', 
      label: 'Oposición al Tratamiento',
      description: 'Oponerse al tratamiento de datos personales',
      plazo_dias: 20,
      icon: <BlockIcon />
    },
    { 
      value: 'LIMITACION', 
      label: 'Limitación del Tratamiento',
      description: 'Restringir el tratamiento de datos personales',
      plazo_dias: 20,
      icon: <SecurityIcon />
    },
    { 
      value: 'PORTABILIDAD', 
      label: 'Portabilidad de Datos',
      description: 'Obtener datos en formato estructurado para transferir',
      plazo_dias: 20,
      icon: <DownloadIcon />
    }
  ];

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      
      // Mock data - en prod conectaría con API
      const mockRequests = [
        {
          id: 1,
          numero_ticket: 'DSR-2024-001',
          tipo_solicitud: 'ACCESO',
          estado: 'PENDIENTE',
          datos_titular: {
            nombre: 'María González Pérez',
            rut: '15.234.567-8',
            email: 'maria.gonzalez@email.cl',
            telefono: '+56912345678'
          },
          detalle_solicitud: 'Solicito acceso a todos mis datos personales almacenados en sus sistemas para verificar exactitud.',
          fecha_solicitud: '2024-01-15T10:30:00Z',
          fecha_limite: '2024-02-04T23:59:59Z',
          asignado_a: 'dpo@empresa.cl',
          dias_restantes: 12,
          urgente: false,
          documentos_verificacion: ['cedula_identidad.pdf'],
          historial_acciones: [
            {
              fecha: '2024-01-15T10:30:00Z',
              accion: 'SOLICITUD_RECIBIDA',
              usuario: 'Sistema Automático',
              detalle: 'Solicitud ingresada vía formulario web'
            },
            {
              fecha: '2024-01-15T10:45:00Z',
              accion: 'VERIFICACION_IDENTIDAD',
              usuario: 'admin@empresa.cl',
              detalle: 'Documentos de identidad verificados exitosamente'
            }
          ]
        },
        {
          id: 2,
          numero_ticket: 'DSR-2024-002',
          tipo_solicitud: 'RECTIFICACION',
          estado: 'EN_PROCESO',
          datos_titular: {
            nombre: 'Carlos Mendoza Silva',
            rut: '18.567.890-1',
            email: 'carlos.mendoza@email.cl',
            telefono: '+56987654321'
          },
          detalle_solicitud: 'Mi dirección en el sistema está incorrecta. La dirección correcta es Av. Nueva Providencia 1234, Santiago.',
          fecha_solicitud: '2024-01-10T14:20:00Z',
          fecha_limite: '2024-01-30T23:59:59Z',
          asignado_a: 'privacy@empresa.cl',
          dias_restantes: 7,
          urgente: true,
          documentos_verificacion: ['cedula_identidad.pdf', 'comprobante_domicilio.pdf'],
          respuesta_enviada: true,
          historial_acciones: [
            {
              fecha: '2024-01-10T14:20:00Z',
              accion: 'SOLICITUD_RECIBIDA',
              usuario: 'Sistema Automático',
              detalle: 'Solicitud ingresada vía email'
            },
            {
              fecha: '2024-01-12T09:00:00Z',
              accion: 'INICIADO_PROCESO',
              usuario: 'privacy@empresa.cl',
              detalle: 'Proceso de rectificación iniciado'
            },
            {
              fecha: '2024-01-14T16:30:00Z',
              accion: 'RECTIFICACION_APLICADA',
              usuario: 'admin@empresa.cl',
              detalle: 'Dirección actualizada en sistemas principales'
            }
          ]
        }
      ];
      
      setRequests(mockRequests);
      
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmitRequest = async () => {
    try {
      setLoading(true);
      
      // Validar datos requeridos
      if (!newRequest.tipo_solicitud || !newRequest.datos_titular.nombre || !newRequest.datos_titular.rut) {
        throw new Error('Faltan campos obligatorios');
      }
      
      // En prod: enviar a API
      const solicitudCompleta = {
        ...newRequest,
        numero_ticket: `DSR-${new Date().getFullYear()}-${String(requests.length + 1).padStart(3, '0')}`,
        estado: 'PENDIENTE',
        fecha_solicitud: new Date().toISOString(),
        fecha_limite: new Date(Date.now() + (20 * 24 * 60 * 60 * 1000)).toISOString(),
        asignado_a: 'dpo@empresa.cl',
        dias_restantes: 20
      };
      
      console.log('Nueva solicitud:', solicitudCompleta);
      
      // Reset form
      setNewRequest({
        tipo_solicitud: '',
        datos_titular: {
          nombre: '',
          rut: '',
          email: '',
          telefono: '',
          direccion: ''
        },
        detalle_solicitud: '',
        documentos_adjuntos: [],
        urgente: false
      });
      
      setActiveStep(0);
      
      // Reload requests
      await loadRequests();
      
    } catch (error) {
      console.error('Error enviando solicitud:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    const colors = {
      'PENDIENTE': '#f57f17',
      'EN_PROCESO': '#1976d2',
      'COMPLETADA': '#2e7d32',
      'RECHAZADA': '#d32f2f',
      'VENCIDA': '#d32f2f'
    };
    return colors[estado] || '#666';
  };

  const getUrgenciaColor = (urgente, diasRestantes) => {
    if (urgente) return '#d32f2f';
    if (diasRestantes < 5) return '#f57f17';
    if (diasRestantes < 10) return '#ff9800';
    return '#2e7d32';
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setDetailsDialog(true);
  };

  const handleSendResponse = (request) => {
    setSelectedRequest(request);
    setResponseDialog(true);
  };

  const steps = [
    {
      label: 'Tipo de Solicitud',
      content: (
        <Box>
          <Typography variant="body1" sx={{ color: '#ccc', mb: 3 }}>
            Seleccione el tipo de derecho que desea ejercer sobre sus datos personales:
          </Typography>
          
          <Grid container spacing={2}>
            {tiposSolicitud.map((tipo) => (
              <Grid item xs={12} md={6} key={tipo.value}>
                <Card 
                  sx={{ 
                    bgcolor: newRequest.tipo_solicitud === tipo.value ? '#0d47a1' : '#2a2a2a',
                    border: newRequest.tipo_solicitud === tipo.value ? '2px solid #4fc3f7' : '1px solid #444',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: '#333',
                      borderColor: '#666'
                    }
                  }}
                  onClick={() => setNewRequest(prev => ({ ...prev, tipo_solicitud: tipo.value }))}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                      {tipo.icon}
                      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                        {tipo.label}
                      </Typography>
                      <Chip 
                        label={`${tipo.plazo_dias} días`}
                        size="small"
                        sx={{ bgcolor: '#4fc3f7', color: '#000' }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#bbb' }}>
                      {tipo.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )
    },
    {
      label: 'Datos del Titular',
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Nombre Completo"
              value={newRequest.datos_titular.nombre}
              onChange={(e) => setNewRequest(prev => ({
                ...prev,
                datos_titular: { ...prev.datos_titular, nombre: e.target.value }
              }))}
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
              label="RUT"
              value={newRequest.datos_titular.rut}
              onChange={(e) => setNewRequest(prev => ({
                ...prev,
                datos_titular: { ...prev.datos_titular, rut: e.target.value }
              }))}
              placeholder="12.345.678-9"
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
              label="Email"
              type="email"
              value={newRequest.datos_titular.email}
              onChange={(e) => setNewRequest(prev => ({
                ...prev,
                datos_titular: { ...prev.datos_titular, email: e.target.value }
              }))}
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
              label="Teléfono"
              value={newRequest.datos_titular.telefono}
              onChange={(e) => setNewRequest(prev => ({
                ...prev,
                datos_titular: { ...prev.datos_titular, telefono: e.target.value }
              }))}
              placeholder="+56912345678"
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
              label="Detalle de la Solicitud"
              value={newRequest.detalle_solicitud}
              onChange={(e) => setNewRequest(prev => ({ ...prev, detalle_solicitud: e.target.value }))}
              placeholder="Describa específicamente qué datos desea acceder, rectificar o eliminar..."
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
            <Alert severity="info" sx={{ bgcolor: '#0d47a1', color: '#fff' }}>
              📋 <strong>Información requerida:</strong> Para procesar su solicitud necesitamos verificar su identidad. 
              Asegúrese de adjuntar copia de su cédula de identidad u otro documento oficial.
            </Alert>
          </Grid>
        </Grid>
      )
    },
    {
      label: 'Revisión y Envío',
      content: (
        <Box>
          <Typography variant="h6" sx={{ color: '#fff', mb: 3 }}>
            📋 Resumen de su Solicitud
          </Typography>
          
          <Paper elevation={1} sx={{ bgcolor: '#2a2a2a', p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: '#bbb' }}>Tipo de Solicitud:</Typography>
                <Typography variant="h6" sx={{ color: '#4fc3f7' }}>
                  {tiposSolicitud.find(t => t.value === newRequest.tipo_solicitud)?.label}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ color: '#bbb' }}>Plazo de Respuesta:</Typography>
                <Typography variant="h6" sx={{ color: '#fff' }}>
                  {tiposSolicitud.find(t => t.value === newRequest.tipo_solicitud)?.plazo_dias} días hábiles
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: '#bbb' }}>Titular:</Typography>
                <Typography variant="body1" sx={{ color: '#fff' }}>
                  {newRequest.datos_titular.nombre} - {newRequest.datos_titular.rut}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: '#bbb' }}>Detalle:</Typography>
                <Typography variant="body1" sx={{ color: '#fff' }}>
                  {newRequest.detalle_solicitud}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <Alert severity="success" sx={{ bgcolor: '#2e7d32', color: '#fff', mb: 3 }}>
            ✅ <strong>Su solicitud será procesada conforme a la Ley 21.719</strong><br/>
            Recibirá confirmación por email y actualizaciones durante el proceso.
          </Alert>
        </Box>
      )
    }
  ];

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center" gap={2}>
          <GavelIcon sx={{ color: '#4fc3f7', fontSize: 32 }} />
          <Box>
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
              Derechos del Titular de Datos
            </Typography>
            <Typography variant="body1" sx={{ color: '#bbb' }}>
              Ejercicio de derechos según Ley 21.719
            </Typography>
          </Box>
        </Box>
        
        <Chip 
          label={`${requests.length} solicitudes activas`}
          sx={{ 
            bgcolor: '#0d47a1',
            color: '#fff',
            fontWeight: 600,
            fontSize: '1rem',
            px: 2
          }}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Formulario nueva solicitud */}
        <Grid item xs={12} lg={6}>
          <Paper elevation={3} sx={{ bgcolor: '#1a1a1a', border: '1px solid #333', p: 3 }}>
            <Typography variant="h6" sx={{ color: '#fff', mb: 3, fontWeight: 600 }}>
              📝 Nueva Solicitud de Derechos
            </Typography>
            
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel sx={{ '& .MuiStepLabel-label': { color: '#bbb' } }}>
                    {step.label}
                  </StepLabel>
                  <StepContent>
                    <Box mb={2}>
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
                      {index === steps.length - 1 ? (
                        <Button
                          variant="contained"
                          onClick={handleSubmitRequest}
                          disabled={loading || !newRequest.tipo_solicitud || !newRequest.datos_titular.nombre}
                          sx={{
                            bgcolor: '#4fc3f7',
                            color: '#000',
                            fontWeight: 600,
                            '&:hover': { bgcolor: '#29b6f6' }
                          }}
                        >
                          Enviar Solicitud
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          disabled={
                            (index === 0 && !newRequest.tipo_solicitud) ||
                            (index === 1 && (!newRequest.datos_titular.nombre || !newRequest.datos_titular.rut))
                          }
                          sx={{
                            bgcolor: '#4fc3f7',
                            color: '#000',
                            fontWeight: 600,
                            '&:hover': { bgcolor: '#29b6f6' }
                          }}
                        >
                          Continuar
                        </Button>
                      )}
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </Grid>

        {/* Lista de solicitudes */}
        <Grid item xs={12} lg={6}>
          <Paper elevation={3} sx={{ bgcolor: '#1a1a1a', border: '1px solid #333', p: 3 }}>
            <Typography variant="h6" sx={{ color: '#fff', mb: 3, fontWeight: 600 }}>
              📋 Solicitudes Recientes
            </Typography>
            
            {loading ? (
              <Box>
                <LinearProgress sx={{ mb: 2 }} />
                <Typography sx={{ color: '#ccc' }}>Cargando solicitudes...</Typography>
              </Box>
            ) : requests.length === 0 ? (
              <Alert severity="info" sx={{ bgcolor: '#0d47a1', color: '#fff' }}>
                📝 No hay solicitudes registradas
              </Alert>
            ) : (
              <Box>
                {requests.map((request) => (
                  <Card 
                    key={request.id} 
                    sx={{ 
                      bgcolor: '#2a2a2a', 
                      border: '1px solid #444',
                      mb: 2,
                      '&:hover': { bgcolor: '#333' }
                    }}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                        <Box>
                          <Typography variant="h6" sx={{ color: '#fff' }}>
                            {request.numero_ticket}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#bbb' }}>
                            {tiposSolicitud.find(t => t.value === request.tipo_solicitud)?.label}
                          </Typography>
                        </Box>
                        
                        <Box display="flex" alignItems="center" gap={1}>
                          {request.urgente && (
                            <Chip 
                              label="URGENTE"
                              size="small"
                              sx={{ bgcolor: '#d32f2f', color: '#fff' }}
                            />
                          )}
                          <Chip 
                            label={request.estado}
                            size="small"
                            sx={{ 
                              bgcolor: getEstadoColor(request.estado),
                              color: '#fff'
                            }}
                          />
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" sx={{ color: '#ccc', mb: 2 }}>
                        👤 {request.datos_titular.nombre}
                      </Typography>
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={1}>
                          <ScheduleIcon sx={{ color: getUrgenciaColor(request.urgente, request.dias_restantes), fontSize: 16 }} />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: getUrgenciaColor(request.urgente, request.dias_restantes),
                              fontWeight: 600
                            }}
                          >
                            {request.dias_restantes} días restantes
                          </Typography>
                        </Box>
                        
                        <Box display="flex" gap={1}>
                          <Button
                            size="small"
                            onClick={() => handleViewDetails(request)}
                            sx={{ color: '#4fc3f7' }}
                          >
                            Ver Detalles
                          </Button>
                          {request.estado === 'PENDIENTE' && (
                            <Button
                              size="small"
                              onClick={() => handleSendResponse(request)}
                              sx={{ color: '#81c784' }}
                            >
                              Responder
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog: Detalles de solicitud */}
      <Dialog 
        open={detailsDialog} 
        onClose={() => setDetailsDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#1a1a1a', color: '#fff', borderBottom: '1px solid #333' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <AssignmentIcon sx={{ color: '#4fc3f7' }} />
            <Typography variant="h6" component="span">
              {selectedRequest?.numero_ticket} - Detalles Completos
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ bgcolor: '#1a1a1a', color: '#fff' }}>
          {selectedRequest && (
            <Box>
              {/* Información general */}
              <Grid container spacing={3} mb={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>Tipo de Solicitud:</Typography>
                  <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600 }}>
                    {tiposSolicitud.find(t => t.value === selectedRequest.tipo_solicitud)?.label}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>Estado:</Typography>
                  <Chip 
                    label={selectedRequest.estado}
                    sx={{ 
                      bgcolor: getEstadoColor(selectedRequest.estado),
                      color: '#fff',
                      fontWeight: 600
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>Fecha Solicitud:</Typography>
                  <Typography variant="body1" sx={{ color: '#fff' }}>
                    {new Date(selectedRequest.fecha_solicitud).toLocaleString('es-CL')}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>Fecha Límite:</Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: selectedRequest.dias_restantes < 5 ? '#f57f17' : '#fff',
                      fontWeight: selectedRequest.dias_restantes < 5 ? 600 : 400
                    }}
                  >
                    {new Date(selectedRequest.fecha_limite).toLocaleString('es-CL')}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ bgcolor: '#444', my: 3 }} />

              {/* Datos del titular */}
              <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
                👤 Datos del Titular
              </Typography>
              
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>Nombre:</Typography>
                  <Typography variant="body1" sx={{ color: '#fff' }}>{selectedRequest.datos_titular.nombre}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>RUT:</Typography>
                  <Typography variant="body1" sx={{ color: '#fff' }}>{selectedRequest.datos_titular.rut}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>Email:</Typography>
                  <Typography variant="body1" sx={{ color: '#fff' }}>{selectedRequest.datos_titular.email}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>Teléfono:</Typography>
                  <Typography variant="body1" sx={{ color: '#fff' }}>{selectedRequest.datos_titular.telefono}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ bgcolor: '#444', my: 3 }} />

              {/* Historial de acciones */}
              <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
                📝 Historial de Acciones
              </Typography>
              
              <Timeline>
                {selectedRequest.historial_acciones?.map((accion, index) => (
                  <TimelineItem key={index}>
                    <TimelineSeparator>
                      <TimelineDot sx={{ bgcolor: '#4fc3f7' }}>
                        <CheckIcon sx={{ fontSize: 16 }} />
                      </TimelineDot>
                      {index < selectedRequest.historial_acciones.length - 1 && (
                        <TimelineConnector sx={{ bgcolor: '#444' }} />
                      )}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 600 }}>
                        {accion.accion.replace(/_/g, ' ')}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#bbb' }}>
                        {accion.detalle}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        {new Date(accion.fecha).toLocaleString('es-CL')} - {accion.usuario}
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ bgcolor: '#1a1a1a', borderTop: '1px solid #333' }}>
          <Button onClick={() => setDetailsDialog(false)} sx={{ color: '#bbb' }}>
            Cerrar
          </Button>
          {selectedRequest?.estado === 'PENDIENTE' && (
            <Button 
              onClick={() => {
                setDetailsDialog(false);
                handleSendResponse(selectedRequest);
              }}
              variant="contained"
              sx={{
                bgcolor: '#4fc3f7',
                color: '#000',
                fontWeight: 600,
                '&:hover': { bgcolor: '#29b6f6' }
              }}
              startIcon={<SendIcon />}
            >
              Responder
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog: Enviar respuesta */}
      <Dialog 
        open={responseDialog} 
        onClose={() => setResponseDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#1a1a1a', color: '#fff', borderBottom: '1px solid #333' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <SendIcon sx={{ color: '#4fc3f7' }} />
            <Typography variant="h6" component="span">
              Responder Solicitud {selectedRequest?.numero_ticket}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ bgcolor: '#1a1a1a', color: '#fff' }}>
          <ResponseForm request={selectedRequest} onSubmit={() => {
            setResponseDialog(false);
            loadRequests();
          }} />
        </DialogContent>
        
        <DialogActions sx={{ bgcolor: '#1a1a1a', borderTop: '1px solid #333' }}>
          <Button onClick={() => setResponseDialog(false)} sx={{ color: '#bbb' }}>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Componente para formulario de respuesta
const ResponseForm = ({ request, onSubmit }) => {
  const [response, setResponse] = useState({
    tipo_respuesta: '',
    mensaje: '',
    datos_adjuntos: null,
    requiere_accion_adicional: false,
    plazo_accion_adicional: ''
  });

  const tiposRespuesta = [
    { value: 'APROBADA', label: 'Solicitud Aprobada', color: '#2e7d32' },
    { value: 'PARCIALMENTE_APROBADA', label: 'Parcialmente Aprobada', color: '#f57f17' },
    { value: 'RECHAZADA', label: 'Solicitud Rechazada', color: '#d32f2f' },
    { value: 'REQUIERE_INFO', label: 'Requiere Información Adicional', color: '#1976d2' }
  ];

  const handleSubmitResponse = async () => {
    try {
      // En prod: enviar respuesta via API
      console.log('Enviando respuesta:', { request_id: request.id, response });
      onSubmit();
    } catch (error) {
      console.error('Error enviando respuesta:', error);
    }
  };

  return (
    <Box>
      <Alert severity="info" sx={{ bgcolor: '#0d47a1', color: '#fff', mb: 3 }}>
        📋 <strong>Solicitud:</strong> {request?.tipo_solicitud || 'N/A'}
        <br/>
        👤 <strong>Titular:</strong> {request?.datos_titular.nombre} ({request?.datos_titular.rut})
      </Alert>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel sx={{ color: '#bbb' }}>Tipo de Respuesta</InputLabel>
        <Select
          value={response.tipo_respuesta}
          onChange={(e) => setResponse(prev => ({ ...prev, tipo_respuesta: e.target.value }))}
          sx={{
            bgcolor: '#2a2a2a',
            color: '#fff',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666' }
          }}
        >
          {tiposRespuesta.map(tipo => (
            <MenuItem key={tipo.value} value={tipo.value}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box 
                  width={12} 
                  height={12} 
                  borderRadius="50%" 
                  bgcolor={tipo.color}
                />
                {tipo.label}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        multiline
        rows={6}
        label="Mensaje de Respuesta"
        value={response.mensaje}
        onChange={(e) => setResponse(prev => ({ ...prev, mensaje: e.target.value }))}
        placeholder="Escriba la respuesta detallada para el titular..."
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            bgcolor: '#2a2a2a',
            '& fieldset': { borderColor: '#444' },
            '&:hover fieldset': { borderColor: '#666' },
            '&.Mui-focused fieldset': { borderColor: '#4fc3f7' }
          },
          '& .MuiInputLabel-root': { color: '#bbb' }
        }}
      />

      <Box display="flex" justifyContent="end">
        <Button
          variant="contained"
          onClick={handleSubmitResponse}
          disabled={!response.tipo_respuesta || !response.mensaje}
          sx={{
            bgcolor: '#4fc3f7',
            color: '#000',
            fontWeight: 600,
            '&:hover': { bgcolor: '#29b6f6' }
          }}
          startIcon={<SendIcon />}
        >
          Enviar Respuesta
        </Button>
      </Box>
    </Box>
  );
};

export default DataSubjectRights;