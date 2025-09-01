import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Badge,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
  Schedule as PendingIcon,
  Assessment as RATIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  Notifications as NotificationIcon,
  FilterList as FilterIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { ratService } from '../services/ratService';
import ratIntelligenceEngine from '../services/ratIntelligenceEngine';
import { supabase } from '../config/supabaseClient';

const DPOApprovalQueue = () => {
  const navigate = useNavigate();
  const [pendingRATs, setPendingRATs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRAT, setSelectedRAT] = useState(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [comments, setComments] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [filterPriority, setFilterPriority] = useState('TODOS');
  const [filterRisk, setFilterRisk] = useState('TODOS');
  const [stats, setStats] = useState({
    total: 0,
    urgentes: 0,
    altoRiesgo: 0,
    proximos_vencimiento: 0
  });

  useEffect(() => {
    cargarRATsPendientes();
  }, []);

  const cargarRATsPendientes = async () => {
    try {
      setLoading(true);
      const tenantId = await ratService.getCurrentTenantId();
      
      // Obtener RATs en estado PENDIENTE_APROBACION
      const { data: pendingData, error } = await supabase
        .from('mapeo_datos_rat')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('estado', 'PENDIENTE_APROBACION')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enriquecer con análisis de riesgo y prioridad
      const enrichedRATs = await Promise.all(
        pendingData.map(async (rat) => {
          try {
            const analysis = await ratIntelligenceEngine.analyzeRAT(rat);
            const daysSinceCreation = Math.floor(
              (new Date() - new Date(rat.created_at)) / (1000 * 60 * 60 * 24)
            );
            
            return {
              ...rat,
              analysis,
              daysSinceCreation,
              priority: calculatePriority(rat, analysis, daysSinceCreation),
              requiresEIPD: analysis.riskLevel === 'ALTO' || analysis.requiresEIPD
            };
          } catch (error) {
            console.error('Error analizando RAT:', rat.id, error);
            return {
              ...rat,
              analysis: { riskLevel: 'MEDIO', complianceScore: 50 },
              daysSinceCreation: 0,
              priority: 'NORMAL',
              requiresEIPD: false
            };
          }
        })
      );

      setPendingRATs(enrichedRATs);
      calcularEstadisticas(enrichedRATs);
      
    } catch (error) {
      console.error('Error cargando RATs pendientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePriority = (rat, analysis, daysSinceCreation) => {
    // Prioridad basada en riesgo, tiempo y tipo de datos
    if (analysis.riskLevel === 'ALTO' || daysSinceCreation > 10) return 'URGENTE';
    if (analysis.riskLevel === 'MEDIO' || daysSinceCreation > 5) return 'ALTA';
    return 'NORMAL';
  };

  const calcularEstadisticas = (ratsData) => {
    const stats = {
      total: ratsData.length,
      urgentes: ratsData.filter(r => r.priority === 'URGENTE').length,
      altoRiesgo: ratsData.filter(r => r.analysis?.riskLevel === 'ALTO').length,
      proximos_vencimiento: ratsData.filter(r => r.daysSinceCreation > 7).length
    };
    setStats(stats);
  };

  const aprobarRAT = async () => {
    try {
      setProcessingAction(true);
      
      const approvedRAT = {
        estado: 'CERTIFICADO',
        fecha_certificacion: new Date().toISOString(),
        comentarios_dpo: comments,
        updated_at: new Date().toISOString()
      };

      await ratService.updateRAT(selectedRAT.id, approvedRAT);
      
      // Actualizar lista
      await cargarRATsPendientes();
      
      setApprovalDialog(false);
      setSelectedRAT(null);
      setComments('');
      
    } catch (error) {
      console.error('Error aprobando RAT:', error);
      alert('Error al aprobar RAT');
    } finally {
      setProcessingAction(false);
    }
  };

  const rechazarRAT = async () => {
    try {
      setProcessingAction(true);
      
      const rejectedRAT = {
        estado: 'BORRADOR',
        comentarios_rechazo: comments,
        fecha_rechazo: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await ratService.updateRAT(selectedRAT.id, rejectedRAT);
      
      // Actualizar lista
      await cargarRATsPendientes();
      
      setRejectDialog(false);
      setSelectedRAT(null);
      setComments('');
      
    } catch (error) {
      console.error('Error rechazando RAT:', error);
      alert('Error al rechazar RAT');
    } finally {
      setProcessingAction(false);
    }
  };

  const getPriorityChip = (priority) => {
    const priorityConfig = {
      'URGENTE': { label: 'Urgente', color: 'error', bgColor: '#fee2e2' },
      'ALTA': { label: 'Alta', color: 'warning', bgColor: '#fef3c7' },
      'NORMAL': { label: 'Normal', color: 'default', bgColor: '#f3f4f6' }
    };
    
    const config = priorityConfig[priority] || priorityConfig['NORMAL'];
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        sx={{ minWidth: 80, fontWeight: 'bold' }}
      />
    );
  };

  const getRiskChip = (riskLevel) => {
    const riskConfig = {
      'ALTO': { label: 'Alto', color: 'error' },
      'MEDIO': { label: 'Medio', color: 'warning' },
      'BAJO': { label: 'Bajo', color: 'success' }
    };
    
    const config = riskConfig[riskLevel] || riskConfig['BAJO'];
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getTimeChip = (days) => {
    if (days > 10) return <Chip label={`${days} días`} color="error" size="small" />;
    if (days > 5) return <Chip label={`${days} días`} color="warning" size="small" />;
    return <Chip label={`${days} días`} color="default" size="small" />;
  };

  const filtrarRATs = () => {
    return pendingRATs.filter(rat => {
      const matchPriority = filterPriority === 'TODOS' || rat.priority === filterPriority;
      const matchRisk = filterRisk === 'TODOS' || rat.analysis?.riskLevel === filterRisk;
      return matchPriority && matchRisk;
    });
  };

  const ratsFiltered = filtrarRATs();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#111827', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ 
            color: '#f9fafb', 
            fontWeight: 700, 
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <NotificationIcon sx={{ fontSize: 40, color: '#f59e0b' }} />
            Cola de Aprobación DPO
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#9ca3af' }}>
            RATs pendientes de certificación - Art. 47 Ley 21.719
          </Typography>
        </Box>

        {/* Estadísticas Dashboard */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Badge badgeContent={stats.total} color="warning" sx={{ mb: 2 }}>
                  <PendingIcon sx={{ fontSize: 40, color: '#f59e0b' }} />
                </Badge>
                <Typography variant="h4" sx={{ color: '#f59e0b', fontWeight: 700 }}>
                  {stats.total}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Total Pendientes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <WarningIcon sx={{ fontSize: 40, color: '#ef4444', mb: 2 }} />
                <Typography variant="h4" sx={{ color: '#ef4444', fontWeight: 700 }}>
                  {stats.urgentes}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Urgentes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <SecurityIcon sx={{ fontSize: 40, color: '#ef4444', mb: 2 }} />
                <Typography variant="h4" sx={{ color: '#ef4444', fontWeight: 700 }}>
                  {stats.altoRiesgo}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Alto Riesgo
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="h4" sx={{ color: '#6b7280', fontWeight: 700, mb: 1 }}>
                  {stats.proximos_vencimiento}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Próximos a Vencer
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  (+7 días)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filtros */}
        <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151', p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ color: '#f9fafb', display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterIcon /> Filtros de Cola DPO
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#9ca3af' }}>Prioridad</InputLabel>
                <Select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  sx={{
                    bgcolor: '#374151',
                    color: '#f9fafb',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#4b5563' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6b7280' }
                  }}
                >
                  <MenuItem value="TODOS">Todas las Prioridades</MenuItem>
                  <MenuItem value="URGENTE">Urgentes</MenuItem>
                  <MenuItem value="ALTA">Alta Prioridad</MenuItem>
                  <MenuItem value="NORMAL">Normal</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#9ca3af' }}>Nivel Riesgo</InputLabel>
                <Select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                  sx={{
                    bgcolor: '#374151',
                    color: '#f9fafb',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#4b5563' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6b7280' }
                  }}
                >
                  <MenuItem value="TODOS">Todos los Riesgos</MenuItem>
                  <MenuItem value="ALTO">Alto Riesgo</MenuItem>
                  <MenuItem value="MEDIO">Medio Riesgo</MenuItem>
                  <MenuItem value="BAJO">Bajo Riesgo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Alertas importantes */}
        {stats.urgentes > 0 && (
          <Alert 
            severity="warning"
            sx={{ mb: 3, bgcolor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
          >
            <Typography variant="body2">
              🚨 <strong>{stats.urgentes} RATs urgentes</strong> requieren atención inmediata del DPO. 
              Algunos superan los plazos recomendados de revisión.
            </Typography>
          </Alert>
        )}

        {/* Tabla de RATs Pendientes */}
        <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
          {loading ? (
            <Box sx={{ p: 4 }}>
              <LinearProgress sx={{ bgcolor: '#374151', '& .MuiLinearProgress-bar': { bgcolor: '#4f46e5' } }} />
              <Typography sx={{ color: '#9ca3af', textAlign: 'center', mt: 2 }}>
                Cargando cola de aprobación...
              </Typography>
            </Box>
          ) : ratsFiltered.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <CheckIcon sx={{ fontSize: 60, color: '#10b981', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#f9fafb', mb: 1 }}>
                ¡Cola de aprobación vacía!
              </Typography>
              <Typography sx={{ color: '#9ca3af' }}>
                No hay RATs pendientes de certificación DPO en este momento.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#9ca3af', borderColor: '#374151', fontWeight: 'bold' }}>
                      Prioridad
                    </TableCell>
                    <TableCell sx={{ color: '#9ca3af', borderColor: '#374151', fontWeight: 'bold' }}>
                      Actividad
                    </TableCell>
                    <TableCell sx={{ color: '#9ca3af', borderColor: '#374151', fontWeight: 'bold' }}>
                      Departamento
                    </TableCell>
                    <TableCell sx={{ color: '#9ca3af', borderColor: '#374151', fontWeight: 'bold' }}>
                      Riesgo
                    </TableCell>
                    <TableCell sx={{ color: '#9ca3af', borderColor: '#374151', fontWeight: 'bold' }}>
                      Tiempo Pendiente
                    </TableCell>
                    <TableCell sx={{ color: '#9ca3af', borderColor: '#374151', fontWeight: 'bold' }}>
                      Acciones DPO
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ratsFiltered.map((rat) => (
                    <TableRow 
                      key={rat.id}
                      sx={{ 
                        '&:hover': { bgcolor: '#374151' },
                        borderLeft: rat.priority === 'URGENTE' ? '4px solid #ef4444' : 
                                  rat.priority === 'ALTA' ? '4px solid #f59e0b' : 'none'
                      }}
                    >
                      <TableCell sx={{ borderColor: '#374151' }}>
                        {getPriorityChip(rat.priority)}
                        {rat.requiresEIPD && (
                          <Tooltip title="Requiere EIPD obligatoria">
                            <Chip 
                              label="EIPD" 
                              size="small" 
                              color="error" 
                              sx={{ ml: 1, fontSize: '0.7rem' }}
                            />
                          </Tooltip>
                        )}
                      </TableCell>
                      
                      <TableCell sx={{ color: '#f9fafb', borderColor: '#374151' }}>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {rat.nombre_actividad}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                            {rat.finalidad_principal?.substring(0, 60)}...
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell sx={{ color: '#f9fafb', borderColor: '#374151' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BusinessIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
                          <Typography variant="body2">
                            {rat.area_responsable}
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block' }}>
                          {rat.responsable_proceso}
                        </Typography>
                      </TableCell>
                      
                      <TableCell sx={{ borderColor: '#374151' }}>
                        {getRiskChip(rat.analysis?.riskLevel || 'BAJO')}
                        <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mt: 0.5 }}>
                          Score: {rat.analysis?.complianceScore || 0}%
                        </Typography>
                      </TableCell>
                      
                      <TableCell sx={{ borderColor: '#374151' }}>
                        {getTimeChip(rat.daysSinceCreation)}
                        <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mt: 0.5 }}>
                          Desde: {new Date(rat.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      
                      <TableCell sx={{ borderColor: '#374151' }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Ver detalles RAT">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/rat-edit/${rat.id}`)}
                              sx={{ color: '#60a5fa' }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Aprobar y Certificar">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedRAT(rat);
                                setApprovalDialog(true);
                              }}
                              sx={{ color: '#10b981' }}
                            >
                              <ApproveIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Rechazar y Devolver">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedRAT(rat);
                                setRejectDialog(true);
                              }}
                              sx={{ color: '#ef4444' }}
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
          )}
        </Paper>

        {/* Información DPO */}
        <Box sx={{ mt: 4 }}>
          <Alert 
            severity="info"
            sx={{
              bgcolor: 'rgba(79, 70, 229, 0.1)',
              border: '1px solid rgba(79, 70, 229, 0.3)',
              color: '#f9fafb'
            }}
          >
            <Typography variant="body2">
              📋 <strong>Responsabilidades DPO:</strong> Revisar y certificar RATs según Art. 47 Ley 21.719. 
              RATs de alto riesgo requieren EIPD antes de la certificación.
            </Typography>
          </Alert>
        </Box>
      </Container>

      {/* Dialog Aprobación */}
      <Dialog
        open={approvalDialog}
        onClose={() => setApprovalDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { bgcolor: '#1f2937', border: '1px solid #374151' }
        }}
      >
        <DialogTitle sx={{ color: '#f9fafb', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ApproveIcon sx={{ color: '#10b981' }} />
          Certificar RAT
        </DialogTitle>
        <DialogContent>
          {selectedRAT && (
            <Box>
              <Typography variant="h6" sx={{ color: '#f9fafb', mb: 2 }}>
                {selectedRAT.nombre_actividad}
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                    Departamento: {selectedRAT.area_responsable}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                    Riesgo: {selectedRAT.analysis?.riskLevel || 'No evaluado'}
                  </Typography>
                </Grid>
              </Grid>

              {selectedRAT.requiresEIPD && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  ⚠️ Este RAT requiere una Evaluación de Impacto (EIPD) antes de la certificación.
                </Alert>
              )}
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Comentarios de Certificación (Opcional)"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Comentarios del DPO sobre la certificación..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#374151',
                    color: '#f9fafb',
                    '& fieldset': { borderColor: '#4b5563' }
                  },
                  '& .MuiInputLabel-root': { color: '#9ca3af' }
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setApprovalDialog(false)}
            sx={{ color: '#9ca3af' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={aprobarRAT}
            disabled={processingAction || (selectedRAT?.requiresEIPD)}
            startIcon={processingAction ? <PendingIcon /> : <ApproveIcon />}
            sx={{ 
              bgcolor: '#10b981', 
              color: '#fff',
              '&:hover': { bgcolor: '#059669' },
              '&:disabled': { bgcolor: '#374151', color: '#6b7280' }
            }}
          >
            {processingAction ? 'Certificando...' : 'Certificar RAT'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Rechazo */}
      <Dialog
        open={rejectDialog}
        onClose={() => setRejectDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { bgcolor: '#1f2937', border: '1px solid #374151' }
        }}
      >
        <DialogTitle sx={{ color: '#f9fafb', display: 'flex', alignItems: 'center', gap: 1 }}>
          <RejectIcon sx={{ color: '#ef4444' }} />
          Rechazar RAT
        </DialogTitle>
        <DialogContent>
          {selectedRAT && (
            <Box>
              <Typography variant="h6" sx={{ color: '#f9fafb', mb: 2 }}>
                {selectedRAT.nombre_actividad}
              </Typography>
              
              <Alert severity="warning" sx={{ mb: 3 }}>
                El RAT será devuelto al departamento responsable como BORRADOR para correcciones.
              </Alert>
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Motivos del Rechazo (Requerido)"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Especificar claramente los motivos del rechazo y las correcciones necesarias..."
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#374151',
                    color: '#f9fafb',
                    '& fieldset': { borderColor: '#4b5563' }
                  },
                  '& .MuiInputLabel-root': { color: '#9ca3af' }
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setRejectDialog(false)}
            sx={{ color: '#9ca3af' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={rechazarRAT}
            disabled={processingAction || !comments.trim()}
            startIcon={processingAction ? <PendingIcon /> : <RejectIcon />}
            sx={{ 
              bgcolor: '#ef4444', 
              color: '#fff',
              '&:hover': { bgcolor: '#dc2626' },
              '&:disabled': { bgcolor: '#374151', color: '#6b7280' }
            }}
          >
            {processingAction ? 'Rechazando...' : 'Rechazar RAT'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DPOApprovalQueue;