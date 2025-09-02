import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Check as CheckIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Schedule as PendingIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Assignment as RATIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  Comment as CommentIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Gavel as GavelIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const DPOApprovalQueue = () => {
  const navigate = useNavigate();
  const [pendingRATs, setPendingRATs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRAT, setSelectedRAT] = useState(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [rejectionDialog, setRejectionDialog] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [dpoComments, setDpoComments] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    loadPendingRATs();
  }, []);

  const loadPendingRATs = async () => {
    try {
      setLoading(true);
      
      // En producción: cargar RATs reales desde Supabase que requieren aprobación DPO
      // Mock data - en prod conectaría con API
      const mockPendingRATs = [
        {
          id: 1,
          numero_rat: 'RAT-2024-001',
          nombre_actividad: 'Gestión de Clientes Bancarios',
          finalidad: 'Administración de cuentas bancarias y evaluación crediticia',
          estado: 'PENDIENTE_APROBACION',
          nivel_riesgo: 'ALTO',
          requiere_eipd: true,
          responsable: 'juan.perez@banco.cl',
          area_responsable: 'Operaciones Bancarias',
          fecha_envio: '2024-01-15T10:30:00Z',
          dias_pendiente: 3,
          prioridad: 'ALTA',
          base_legal: 'ejecucion_contrato',
          tipos_datos: ['identificacion', 'financieros', 'contacto'],
          transferencias_internacionales: true,
          paises_destino: ['Estados Unidos', 'España'],
          medidas_seguridad: ['Cifrado AES-256', 'Autenticación multifactor', 'Logs auditoría'],
          analisis_ia: {
            riesgo_detectado: 'ALTO',
            alertas: ['Datos financieros sensibles', 'Transferencias internacionales sin DPA'],
            recomendaciones: ['Implementar EIPD', 'Firmar DPA con proveedores'],
            score_compliance: 75
          }
        },
        {
          id: 2,
          numero_rat: 'RAT-2024-002',
          nombre_actividad: 'Sistema de Recursos Humanos',
          finalidad: 'Gestión de personal y nóminas',
          estado: 'PENDIENTE_APROBACION',
          nivel_riesgo: 'MEDIO',
          requiere_eipd: false,
          responsable: 'maria.gonzalez@empresa.cl',
          area_responsable: 'Recursos Humanos',
          fecha_envio: '2024-01-17T14:20:00Z',
          dias_pendiente: 1,
          prioridad: 'NORMAL',
          base_legal: 'cumplimiento_obligacion_legal',
          tipos_datos: ['identificacion', 'laborales', 'contacto'],
          transferencias_internacionales: false,
          medidas_seguridad: ['Control acceso', 'Backup diario', 'Políticas retención'],
          analisis_ia: {
            riesgo_detectado: 'MEDIO',
            alertas: ['Datos laborales sensibles'],
            recomendaciones: ['Mejorar políticas retención'],
            score_compliance: 85
          }
        },
        {
          id: 3,
          numero_rat: 'RAT-2024-003',
          nombre_actividad: 'Marketing Digital y CRM',
          finalidad: 'Gestión campañas marketing y relación clientes',
          estado: 'PENDIENTE_APROBACION',
          nivel_riesgo: 'ALTO',
          requiere_eipd: true,
          responsable: 'carlos.martinez@marketing.cl',
          area_responsable: 'Marketing Digital',
          fecha_envio: '2024-01-10T09:15:00Z',
          dias_pendiente: 8,
          prioridad: 'URGENTE',
          base_legal: 'consentimiento_titular',
          tipos_datos: ['identificacion', 'contacto', 'navegacion', 'preferencias'],
          transferencias_internacionales: true,
          paises_destino: ['Estados Unidos'],
          medidas_seguridad: ['Anonimización', 'Consentimiento granular'],
          analisis_ia: {
            riesgo_detectado: 'ALTO',
            alertas: ['Perfilado automatizado', 'Decisiones automatizadas', 'Próximo a vencer plazo legal'],
            recomendaciones: ['EIPD urgente', 'Revisar base consentimiento', 'Implementar opt-out'],
            score_compliance: 65
          }
        }
      ];
      
      setPendingRATs(mockPendingRATs);
      
    } catch (error) {
      console.error('Error cargando RATs pendientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPrioridadColor = (prioridad) => {
    const colors = {
      'URGENTE': '#d32f2f',
      'ALTA': '#f57c00',
      'NORMAL': '#1976d2',
      'BAJA': '#666'
    };
    return colors[prioridad] || '#666';
  };

  const getRiesgoColor = (riesgo) => {
    const colors = {
      'BAJO': '#2e7d32',
      'MEDIO': '#f57f17',
      'ALTO': '#d32f2f',
      'CRITICO': '#b71c1c'
    };
    return colors[riesgo] || '#666';
  };

  const handleApprove = (rat) => {
    setSelectedRAT(rat);
    setApprovalDialog(true);
  };

  const handleReject = (rat) => {
    setSelectedRAT(rat);
    setRejectionDialog(true);
  };

  const handleViewDetails = (rat) => {
    setSelectedRAT(rat);
    setDetailsDialog(true);
  };

  const confirmApproval = async () => {
    try {
      setLoading(true);
      
      // Validaciones DPO automáticas según Art. 25 Ley 21.719
      const validacionesRequeridas = [];
      
      // 1. RAT alto riesgo requiere EIPD
      if (selectedRAT.nivel_riesgo === 'ALTO') {
        validacionesRequeridas.push({
          tipo: 'EIPD',
          articulo: 'Art. 25 Ley 21.719',
          descripcion: 'Evaluación de Impacto en Protección de Datos requerida para alto riesgo'
        });
      }
      
      // 2. Transferencias internacionales requieren DPA
      if (selectedRAT.transferencias_internacionales) {
        validacionesRequeridas.push({
          tipo: 'DPA',
          articulo: 'Art. 28 Ley 21.719',
          descripcion: 'Data Processing Agreement requerido para transferencias internacionales'
        });
      }
      
      // 3. Datos sensibles múltiples requieren DPIA extendida
      if (selectedRAT.tipos_datos.includes('financieros') && selectedRAT.tipos_datos.includes('salud')) {
        validacionesRequeridas.push({
          tipo: 'DPIA_EXTENDIDA',
          articulo: 'Art. 25 inc. 2° Ley 21.719',
          descripcion: 'Evaluación de Impacto extendida para datos sensibles múltiples'
        });
      }
      
      // 4. Perfilado automatizado requiere consulta previa
      if (selectedRAT.analisis_ia?.alertas?.includes('Perfilado automatizado')) {
        validacionesRequeridas.push({
          tipo: 'CONSULTA_AGENCIA',
          articulo: 'Art. 26 Ley 21.719',
          descripcion: 'Consulta previa a la Agencia de Protección de Datos'
        });
      }
      
      // Generar automáticamente los documentos requeridos
      const documentosGenerados = await generarDocumentosRequeridos(selectedRAT, validacionesRequeridas);
      
      // En prod: llamar API aprobación con documentos generados
      console.log('🔥 Aprobando RAT:', selectedRAT.id);
      console.log('📋 Comentarios DPO:', dpoComments);
      console.log('📄 Documentos generados automáticamente:', documentosGenerados);
      console.log('⚖️ Validaciones aplicadas:', validacionesRequeridas);
      
      // Actualizar estado
      setPendingRATs(prev => prev.filter(r => r.id !== selectedRAT.id));
      
      // Mostrar resumen de documentos generados
      if (validacionesRequeridas.length > 0) {
        alert(`✅ RAT aprobado con ${validacionesRequeridas.length} documento(s) generado(s):\n${validacionesRequeridas.map(v => `• ${v.tipo}: ${v.descripcion}`).join('\n')}`);
      }
      
      setApprovalDialog(false);
      setDpoComments('');
      setSelectedRAT(null);
      
    } catch (error) {
      console.error('Error aprobando RAT:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para generar documentos automáticamente
  const generarDocumentosRequeridos = async (rat, validaciones) => {
    const documentosGenerados = [];
    
    for (const validacion of validaciones) {
      try {
        switch (validacion.tipo) {
          case 'EIPD':
            const eipd = await generarEIPD(rat);
            documentosGenerados.push({
              tipo: 'EIPD',
              id: `EIPD-${rat.numero_rat}`,
              fecha: new Date().toISOString(),
              estado: 'GENERADO_AUTOMATICAMENTE'
            });
            break;
            
          case 'DPA':
            const dpa = await generarDPA(rat);
            documentosGenerados.push({
              tipo: 'DPA',
              id: `DPA-${rat.numero_rat}`,
              fecha: new Date().toISOString(),
              estado: 'PENDIENTE_FIRMA'
            });
            break;
            
          case 'DPIA_EXTENDIDA':
            const dpia = await generarDPIAExtendida(rat);
            documentosGenerados.push({
              tipo: 'DPIA_EXTENDIDA',
              id: `DPIA-${rat.numero_rat}`,
              fecha: new Date().toISOString(),
              estado: 'REQUIERE_REVISION_TECNICA'
            });
            break;
            
          case 'CONSULTA_AGENCIA':
            const consulta = await generarConsultaAgencia(rat);
            documentosGenerados.push({
              tipo: 'CONSULTA_AGENCIA',
              id: `CONSULTA-${rat.numero_rat}`,
              fecha: new Date().toISOString(),
              estado: 'ENVIADO_A_AGENCIA'
            });
            break;
        }
      } catch (error) {
        console.error(`Error generando ${validacion.tipo}:`, error);
      }
    }
    
    return documentosGenerados;
  };

  // Funciones auxiliares para generar documentos específicos
  const generarEIPD = async (rat) => {
    console.log(`📄 Generando EIPD para ${rat.numero_rat}...`);
    // En producción: generar documento EIPD real
    return { generado: true, tipo: 'EIPD' };
  };

  const generarDPA = async (rat) => {
    console.log(`📄 Generando DPA para ${rat.numero_rat}...`);
    // En producción: generar contrato DPA real
    return { generado: true, tipo: 'DPA' };
  };

  const generarDPIAExtendida = async (rat) => {
    console.log(`📄 Generando DPIA Extendida para ${rat.numero_rat}...`);
    // En producción: generar evaluación DPIA extendida
    return { generado: true, tipo: 'DPIA_EXTENDIDA' };
  };

  const generarConsultaAgencia = async (rat) => {
    console.log(`📄 Generando Consulta Agencia para ${rat.numero_rat}...`);
    // En producción: generar consulta previa a la Agencia
    return { generado: true, tipo: 'CONSULTA_AGENCIA' };
  };

  const confirmRejection = async () => {
    try {
      setLoading(true);
      
      if (!dpoComments) {
        throw new Error('Debe proporcionar razón de rechazo');
      }
      
      // En prod: llamar API rechazo
      console.log('Rechazando RAT:', selectedRAT.id, 'Razón:', dpoComments);
      
      // Actualizar estado
      setPendingRATs(prev => prev.filter(r => r.id !== selectedRAT.id));
      
      setRejectionDialog(false);
      setDpoComments('');
      setSelectedRAT(null);
      
    } catch (error) {
      console.error('Error rechazando RAT:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRATs = filterPriority === 'all' 
    ? pendingRATs 
    : pendingRATs.filter(rat => rat.prioridad === filterPriority);

  const stats = {
    total: pendingRATs.length,
    urgentes: pendingRATs.filter(r => r.prioridad === 'URGENTE').length,
    altoRiesgo: pendingRATs.filter(r => r.nivel_riesgo === 'ALTO').length,
    requierenEIPD: pendingRATs.filter(r => r.requiere_eipd).length,
    proximosVencer: pendingRATs.filter(r => r.dias_pendiente > 5).length
  };

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
            🔍 Cola de Aprobación DPO
          </Typography>
          <Typography variant="body1" sx={{ color: '#bbb' }}>
            RATs pendientes de certificación según Ley 21.719
          </Typography>
        </Box>
        
        <Badge badgeContent={stats.urgentes} color="error">
          <Chip 
            label={`${stats.total} pendientes`}
            sx={{ 
              bgcolor: '#0d47a1',
              color: '#fff',
              fontWeight: 600,
              fontSize: '1rem'
            }}
          />
        </Badge>
      </Box>

      {/* Estadísticas */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <PendingIcon sx={{ color: '#4fc3f7', fontSize: 24 }} />
                <Box>
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>
                    Total Pendientes
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <WarningIcon sx={{ color: '#d32f2f', fontSize: 24 }} />
                <Box>
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
                    {stats.urgentes}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>
                    Urgentes
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <SecurityIcon sx={{ color: '#f57f17', fontSize: 24 }} />
                <Box>
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
                    {stats.altoRiesgo}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>
                    Alto Riesgo
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <TimelineIcon sx={{ color: '#81c784', fontSize: 24 }} />
                <Box>
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
                    {stats.proximosVencer}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>
                    Próximos a Vencer
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Box display="flex" gap={2} mb={3}>
        <Button
          variant={filterPriority === 'all' ? 'contained' : 'outlined'}
          onClick={() => setFilterPriority('all')}
          sx={{
            bgcolor: filterPriority === 'all' ? '#4fc3f7' : 'transparent',
            color: filterPriority === 'all' ? '#000' : '#4fc3f7',
            borderColor: '#4fc3f7'
          }}
        >
          Todos ({pendingRATs.length})
        </Button>
        <Button
          variant={filterPriority === 'URGENTE' ? 'contained' : 'outlined'}
          onClick={() => setFilterPriority('URGENTE')}
          sx={{
            bgcolor: filterPriority === 'URGENTE' ? '#d32f2f' : 'transparent',
            color: filterPriority === 'URGENTE' ? '#fff' : '#d32f2f',
            borderColor: '#d32f2f'
          }}
        >
          Urgentes ({stats.urgentes})
        </Button>
        <Button
          variant={filterPriority === 'ALTA' ? 'contained' : 'outlined'}
          onClick={() => setFilterPriority('ALTA')}
          sx={{
            bgcolor: filterPriority === 'ALTA' ? '#f57c00' : 'transparent',
            color: filterPriority === 'ALTA' ? '#fff' : '#f57c00',
            borderColor: '#f57c00'
          }}
        >
          Alta Prioridad
        </Button>
      </Box>

      {/* Tabla RATs pendientes */}
      <Paper elevation={3} sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
        {loading && <LinearProgress />}
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#2a2a2a' }}>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>RAT</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Actividad</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Prioridad</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Riesgo</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Score IA</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Días Pendiente</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRATs.map((rat) => (
                <TableRow 
                  key={rat.id}
                  sx={{ 
                    '&:hover': { bgcolor: '#2a2a2a' },
                    borderBottom: '1px solid #333'
                  }}
                >
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#4fc3f7', fontWeight: 600 }}>
                        {rat.numero_rat}
                      </Typography>
                      <Box display="flex" gap={0.5} mt={0.5}>
                        {rat.requiere_eipd && (
                          <Chip 
                            label="EIPD"
                            size="small"
                            sx={{ bgcolor: '#f57f17', color: '#fff', fontSize: '0.7rem' }}
                          />
                        )}
                        {rat.transferencias_internacionales && (
                          <Chip 
                            label="INTL"
                            size="small"
                            sx={{ bgcolor: '#1976d2', color: '#fff', fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600 }}>
                        {rat.nombre_actividad}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#bbb' }}>
                        {rat.area_responsable} - {rat.responsable}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Chip 
                      label={rat.prioridad}
                      sx={{ 
                        bgcolor: getPrioridadColor(rat.prioridad),
                        color: '#fff',
                        fontWeight: 600
                      }}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Chip 
                      label={rat.nivel_riesgo}
                      sx={{ 
                        bgcolor: getRiesgoColor(rat.nivel_riesgo),
                        color: '#fff',
                        fontWeight: 600
                      }}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                        {rat.analisis_ia.score_compliance}%
                      </Typography>
                      {rat.analisis_ia.score_compliance < 70 && (
                        <WarningIcon sx={{ color: '#f57f17', fontSize: 20 }} />
                      )}
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: rat.dias_pendiente > 5 ? '#d32f2f' : '#ccc',
                        fontWeight: rat.dias_pendiente > 5 ? 600 : 400
                      }}
                    >
                      {rat.dias_pendiente} días
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Ver detalles">
                        <IconButton 
                          size="small"
                          onClick={() => handleViewDetails(rat)}
                          sx={{ color: '#4fc3f7' }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Aprobar">
                        <IconButton 
                          size="small"
                          onClick={() => handleApprove(rat)}
                          sx={{ color: '#2e7d32' }}
                        >
                          <ApproveIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Rechazar">
                        <IconButton 
                          size="small"
                          onClick={() => handleReject(rat)}
                          sx={{ color: '#d32f2f' }}
                        >
                          <RejectIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {filteredRATs.length === 0 && (
          <Box p={4} textAlign="center">
            <Typography sx={{ color: '#bbb' }}>
              No hay RATs pendientes de aprobación
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Dialog: Aprobar RAT */}
      <Dialog 
        open={approvalDialog} 
        onClose={() => setApprovalDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#1a1a1a', color: '#fff', borderBottom: '1px solid #333' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <ApproveIcon sx={{ color: '#2e7d32' }} />
            <Typography variant="h6" component="span">
              Aprobar y Certificar RAT
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ bgcolor: '#1a1a1a', color: '#fff' }}>
          {selectedRAT && (
            <Box>
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 3,
                  bgcolor: '#2e7d32',
                  color: '#fff'
                }}
              >
                ✅ Al aprobar este RAT, certificará que cumple con todos los requisitos de la Ley 21.719
              </Alert>
              
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>RAT:</Typography>
                  <Typography variant="h6" sx={{ color: '#fff' }}>{selectedRAT.numero_rat}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>Actividad:</Typography>
                  <Typography variant="body1" sx={{ color: '#fff' }}>{selectedRAT.nombre_actividad}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>Nivel de Riesgo:</Typography>
                  <Chip 
                    label={selectedRAT.nivel_riesgo}
                    sx={{ 
                      bgcolor: getRiesgoColor(selectedRAT.nivel_riesgo),
                      color: '#fff'
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>Score Compliance:</Typography>
                  <Typography variant="h6" sx={{ color: '#4fc3f7' }}>
                    {selectedRAT.analisis_ia.score_compliance}%
                  </Typography>
                </Grid>
              </Grid>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Comentarios DPO (Opcional)"
                value={dpoComments}
                onChange={(e) => setDpoComments(e.target.value)}
                placeholder="Agregar observaciones o condiciones de aprobación..."
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
          )}
        </DialogContent>
        
        <DialogActions sx={{ bgcolor: '#1a1a1a', borderTop: '1px solid #333' }}>
          <Button 
            onClick={() => setApprovalDialog(false)} 
            sx={{ color: '#bbb' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={confirmApproval}
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: '#2e7d32',
              color: '#fff',
              fontWeight: 600,
              '&:hover': { bgcolor: '#1b5e20' }
            }}
            startIcon={<ApproveIcon />}
          >
            Aprobar y Certificar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Rechazar RAT */}
      <Dialog 
        open={rejectionDialog} 
        onClose={() => setRejectionDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#1a1a1a', color: '#fff', borderBottom: '1px solid #333' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <RejectIcon sx={{ color: '#d32f2f' }} />
            <Typography variant="h6" component="span">
              Rechazar RAT
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ bgcolor: '#1a1a1a', color: '#fff' }}>
          {selectedRAT && (
            <Box>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  bgcolor: '#d32f2f',
                  color: '#fff'
                }}
              >
                ⚠️ Al rechazar este RAT, deberá ser corregido antes de poder ser certificado
              </Alert>
              
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>RAT a rechazar:</Typography>
                  <Typography variant="h6" sx={{ color: '#fff' }}>
                    {selectedRAT.numero_rat} - {selectedRAT.nombre_actividad}
                  </Typography>
                </Grid>
              </Grid>

              {selectedRAT.analisis_ia.alertas.length > 0 && (
                <Box mb={3}>
                  <Typography variant="subtitle1" sx={{ color: '#fff', mb: 1 }}>
                    ⚠️ Alertas Detectadas:
                  </Typography>
                  <List dense>
                    {selectedRAT.analisis_ia.alertas.map((alerta, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <WarningIcon sx={{ color: '#f57f17' }} />
                        </ListItemIcon>
                        <ListItemText primary={alerta} sx={{ color: '#ccc' }} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              <TextField
                fullWidth
                multiline
                rows={4}
                required
                label="Razón del Rechazo"
                value={dpoComments}
                onChange={(e) => setDpoComments(e.target.value)}
                placeholder="Especifique las razones del rechazo y qué debe corregirse..."
                error={!dpoComments}
                helperText={!dpoComments ? "Campo obligatorio" : ""}
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
          )}
        </DialogContent>
        
        <DialogActions sx={{ bgcolor: '#1a1a1a', borderTop: '1px solid #333' }}>
          <Button 
            onClick={() => setRejectionDialog(false)} 
            sx={{ color: '#bbb' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={confirmRejection}
            variant="contained"
            disabled={loading || !dpoComments}
            sx={{
              bgcolor: '#d32f2f',
              color: '#fff',
              fontWeight: 600,
              '&:hover': { bgcolor: '#b71c1c' }
            }}
            startIcon={<RejectIcon />}
          >
            Rechazar RAT
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Ver Detalles */}
      <Dialog 
        open={detailsDialog} 
        onClose={() => setDetailsDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#1a1a1a', color: '#fff', borderBottom: '1px solid #333' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <ViewIcon sx={{ color: '#4fc3f7' }} />
            <Typography variant="h6" component="span">
              Detalles RAT para Aprobación
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ bgcolor: '#1a1a1a', color: '#fff' }}>
          {selectedRAT && <RATDetailsView rat={selectedRAT} />}
        </DialogContent>
        
        <DialogActions sx={{ bgcolor: '#1a1a1a', borderTop: '1px solid #333' }}>
          <Button onClick={() => setDetailsDialog(false)} sx={{ color: '#bbb' }}>
            Cerrar
          </Button>
          <Button 
            onClick={() => {
              setDetailsDialog(false);
              handleApprove(selectedRAT);
            }}
            variant="contained"
            sx={{
              bgcolor: '#2e7d32',
              color: '#fff',
              fontWeight: 600,
              '&:hover': { bgcolor: '#1b5e20' }
            }}
            startIcon={<ApproveIcon />}
          >
            Aprobar
          </Button>
          <Button 
            onClick={() => {
              setDetailsDialog(false);
              handleReject(selectedRAT);
            }}
            variant="contained"
            sx={{
              bgcolor: '#d32f2f',
              color: '#fff',
              fontWeight: 600,
              '&:hover': { bgcolor: '#b71c1c' }
            }}
            startIcon={<RejectIcon />}
          >
            Rechazar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Componente para vista detallada del RAT
const RATDetailsView = ({ rat }) => {
  return (
    <Box>
      {/* Análisis IA */}
      <Alert 
        severity={rat.analisis_ia.score_compliance >= 80 ? "success" : "warning"}
        sx={{ 
          mb: 3,
          bgcolor: rat.analisis_ia.score_compliance >= 80 ? '#2e7d32' : '#f57f17',
          color: '#fff'
        }}
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          🤖 Análisis Inteligencia: {rat.analisis_ia.score_compliance}% Compliance
        </Typography>
        <Typography variant="body2">
          Nivel de Riesgo Detectado: {rat.analisis_ia.riesgo_detectado}
        </Typography>
      </Alert>

      {/* Información General */}
      <Accordion defaultExpanded sx={{ bgcolor: '#2a2a2a', color: '#fff', mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
          <Typography variant="h6">📋 Información General</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#bbb' }}>Número RAT:</Typography>
              <Typography variant="body1" sx={{ color: '#fff', mb: 2 }}>{rat.numero_rat}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#bbb' }}>Estado:</Typography>
              <Typography variant="body1" sx={{ color: '#fff', mb: 2 }}>{rat.estado}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ color: '#bbb' }}>Actividad:</Typography>
              <Typography variant="body1" sx={{ color: '#fff', mb: 2 }}>{rat.nombre_actividad}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ color: '#bbb' }}>Finalidad:</Typography>
              <Typography variant="body1" sx={{ color: '#fff' }}>{rat.finalidad}</Typography>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Base Legal y Datos */}
      <Accordion sx={{ bgcolor: '#2a2a2a', color: '#fff', mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
          <Typography variant="h6">⚖️ Base Legal y Datos</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#bbb' }}>Base Legal:</Typography>
              <Typography variant="body1" sx={{ color: '#fff', mb: 2 }}>
                {rat.base_legal.replace(/_/g, ' ')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#bbb' }}>Tipos de Datos:</Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {rat.tipos_datos.map((tipo, index) => (
                  <Chip 
                    key={index}
                    label={tipo}
                    size="small"
                    sx={{ bgcolor: '#0d47a1', color: '#fff' }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Alertas y Recomendaciones */}
      {rat.analisis_ia.alertas.length > 0 && (
        <Accordion sx={{ bgcolor: '#2a2a2a', color: '#fff', mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
            <Typography variant="h6">⚠️ Alertas y Recomendaciones</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="subtitle2" sx={{ color: '#f57f17', mb: 1 }}>
              Alertas Detectadas:
            </Typography>
            <List dense>
              {rat.analisis_ia.alertas.map((alerta, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <WarningIcon sx={{ color: '#f57f17' }} />
                  </ListItemIcon>
                  <ListItemText primary={alerta} />
                </ListItem>
              ))}
            </List>
            
            <Divider sx={{ bgcolor: '#444', my: 2 }} />
            
            <Typography variant="subtitle2" sx={{ color: '#4fc3f7', mb: 1 }}>
              Recomendaciones:
            </Typography>
            <List dense>
              {rat.analisis_ia.recomendaciones.map((rec, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckIcon sx={{ color: '#4fc3f7' }} />
                  </ListItemIcon>
                  <ListItemText primary={rec} />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Medidas de Seguridad */}
      <Accordion sx={{ bgcolor: '#2a2a2a', color: '#fff' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
          <Typography variant="h6">🔒 Medidas de Seguridad</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {rat.medidas_seguridad.map((medida, index) => (
              <Chip 
                key={index}
                label={medida}
                sx={{ bgcolor: '#2e7d32', color: '#fff' }}
              />
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default DPOApprovalQueue;