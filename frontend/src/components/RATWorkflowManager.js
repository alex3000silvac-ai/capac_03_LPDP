import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Avatar,
  Badge,
  Tooltip,
  LinearProgress
} from '@mui/material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot, TimelineOppositeContent } from '@mui/lab';
import {
  Assignment as WorkflowIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Schedule as PendingIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Person as AssignIcon,
  Comment as CommentIcon,
  History as HistoryIcon,
  Notifications as NotifyIcon,
  Group as CollaborateIcon,
  Sync as SyncIcon,
  Warning as ConflictIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  LockOpen as LockOpenIcon,
  Send as SubmitIcon,
  Undo as RevertIcon,
  ContentCopy as DuplicateIcon,
  Delete as DeleteIcon,
  Star as PriorityIcon,
  AccessTime as TimeIcon,
  Business as DepartmentIcon
} from '@mui/icons-material';
import { ratService } from '../services/ratService';
import { supabase } from '../config/supabaseClient';

const RATWorkflowManager = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rats, setRats] = useState([]);
  const [workflowItems, setWorkflowItems] = useState([]);
  const [selectedRAT, setSelectedRAT] = useState(null);
  const [workflowDialog, setWorkflowDialog] = useState(false);
  const [assignDialog, setAssignDialog] = useState(false);
  const [commentDialog, setCommentDialog] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  
  const [stats, setStats] = useState({
    borradores: 0,
    enRevision: 0,
    pendientesAprobacion: 0,
    certificados: 0,
    rechazados: 0,
    conflictos: 0
  });

  const [newComment, setNewComment] = useState({
    comentario: '',
    tipo: 'GENERAL',
    prioridad: 'NORMAL'
  });

  const [assignData, setAssignData] = useState({
    usuario_id: '',
    rol: 'REVISOR',
    fecha_limite: '',
    comentario: ''
  });

  // Estados workflow RAT según especificación
  const workflowStates = {
    'BORRADOR': {
      label: 'Borrador',
      color: 'default',
      icon: <EditIcon />,
      description: 'RAT en edición por el autor',
      actions: ['ENVIAR_REVISION', 'DUPLICAR', 'ELIMINAR']
    },
    'EN_REVISION': {
      label: 'En Revisión',
      color: 'info',
      icon: <PendingIcon />,
      description: 'RAT asignado para revisión departamental',
      actions: ['APROBAR_DEPARTAMENTAL', 'RECHAZAR', 'SOLICITAR_CAMBIOS', 'REASIGNAR']
    },
    'PENDIENTE_APROBACION': {
      label: 'Pendiente Aprobación DPO',
      color: 'warning',
      icon: <NotifyIcon />,
      description: 'RAT aprobado por departamento, pendiente DPO',
      actions: ['CERTIFICAR', 'RECHAZAR', 'SOLICITAR_REVISION']
    },
    'CERTIFICADO': {
      label: 'Certificado',
      color: 'success',
      icon: <ApprovedIcon />,
      description: 'RAT certificado y vigente',
      actions: ['INICIAR_REVISION', 'ARCHIVAR', 'DUPLICAR']
    },
    'RECHAZADO': {
      label: 'Rechazado',
      color: 'error',
      icon: <RejectedIcon />,
      description: 'RAT rechazado, requiere corrección',
      actions: ['EDITAR', 'REASIGNAR', 'ARCHIVAR']
    },
    'CONFLICTO': {
      label: 'Conflicto',
      color: 'error',
      icon: <ConflictIcon />,
      description: 'RAT con conflictos de edición concurrente',
      actions: ['RESOLVER_CONFLICTO', 'REVERTIR', 'FUSIONAR']
    }
  };

  const priorities = {
    'URGENTE': { label: 'Urgente', color: 'error' },
    'ALTA': { label: 'Alta', color: 'warning' },
    'NORMAL': { label: 'Normal', color: 'default' },
    'BAJA': { label: 'Baja', color: 'success' }
  };

  useEffect(() => {
    cargarDatosWorkflow();
  }, []);

  const cargarDatosWorkflow = async () => {
    try {
      setLoading(true);
      const tenantId = await ratService.getCurrentTenantId();
      
      await Promise.all([
        cargarRATs(tenantId),
        cargarUsuarios(tenantId),
        cargarItemsWorkflow(tenantId)
      ]);
      
    } catch (error) {
      console.error('Error cargando datos workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarRATs = async (tenantId) => {
    try {
      const { data, error } = await supabase
        .from('rats')
        .select(`
          *,
          created_by:usuarios!rats_created_by_fkey(first_name, last_name, email),
          assigned_to:usuarios!rats_assigned_to_fkey(first_name, last_name, email)
        `)
        .eq('tenant_id', tenantId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Simular datos si no existen
      const ratsData = data?.length > 0 ? data : [
        {
          id: 1,
          area_responsable: 'Recursos Humanos',
          finalidad_principal: 'Gestión de nómina y contratos',
          estado_workflow: 'EN_REVISION',
          prioridad: 'ALTA',
          fecha_limite: '2024-10-15',
          created_by: { first_name: 'Ana', last_name: 'López', email: 'ana.lopez@empresa.cl' },
          assigned_to: { first_name: 'Carlos', last_name: 'Rodríguez', email: 'carlos.rodriguez@empresa.cl' },
          created_at: '2024-09-01',
          updated_at: '2024-09-05',
          version: 2,
          is_locked: false,
          lock_user_id: null
        },
        {
          id: 2,
          area_responsable: 'Marketing',
          finalidad_principal: 'Campañas publicitarias digitales',
          estado_workflow: 'PENDIENTE_APROBACION',
          prioridad: 'NORMAL',
          fecha_limite: '2024-10-20',
          created_by: { first_name: 'María', last_name: 'González', email: 'maria.gonzalez@empresa.cl' },
          assigned_to: { first_name: 'Pedro', last_name: 'Martínez', email: 'pedro.martinez@empresa.cl' },
          created_at: '2024-08-25',
          updated_at: '2024-09-03',
          version: 1,
          is_locked: true,
          lock_user_id: 'user-003'
        },
        {
          id: 3,
          area_responsable: 'Ventas',
          finalidad_principal: 'Gestión clientes y oportunidades',
          estado_workflow: 'BORRADOR',
          prioridad: 'URGENTE',
          fecha_limite: '2024-10-10',
          created_by: { first_name: 'Luis', last_name: 'Hernández', email: 'luis.hernandez@empresa.cl' },
          assigned_to: null,
          created_at: '2024-09-08',
          updated_at: '2024-09-08',
          version: 1,
          is_locked: false,
          lock_user_id: null
        }
      ];

      setRats(ratsData);
      calcularEstadisticas(ratsData);
      
    } catch (error) {
      console.error('Error cargando RATs:', error);
    }
  };

  const cargarUsuarios = async (tenantId) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true);

      if (error) throw error;

      // Simular usuarios si no existen
      const usersData = data?.length > 0 ? data : [
        {
          id: 'user-001',
          first_name: 'Pedro',
          last_name: 'Martínez',
          email: 'pedro.martinez@empresa.cl',
          role: 'DPO',
          departamento: 'Compliance'
        },
        {
          id: 'user-002',
          first_name: 'Ana',
          last_name: 'López',
          email: 'ana.lopez@empresa.cl',
          role: 'REVIEWER',
          departamento: 'Recursos Humanos'
        },
        {
          id: 'user-003',
          first_name: 'Carlos',
          last_name: 'Rodríguez',
          email: 'carlos.rodriguez@empresa.cl',
          role: 'COMPLIANCE_OFFICER',
          departamento: 'Legal'
        }
      ];

      setUsuarios(usersData);
      
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  const cargarItemsWorkflow = async (tenantId) => {
    // Simular items de workflow activos
    const workflowData = [
      {
        id: 1,
        rat_id: 1,
        tipo: 'REVISION_PENDIENTE',
        usuario_asignado: 'user-002',
        fecha_asignacion: '2024-09-05',
        fecha_limite: '2024-10-15',
        prioridad: 'ALTA',
        comentario: 'Revisar completitud datos empleados'
      },
      {
        id: 2,
        rat_id: 2,
        tipo: 'APROBACION_DPO',
        usuario_asignado: 'user-001',
        fecha_asignacion: '2024-09-03',
        fecha_limite: '2024-10-20',
        prioridad: 'NORMAL',
        comentario: 'RAT marketing listo para certificación'
      },
      {
        id: 3,
        rat_id: 3,
        tipo: 'BORRADOR_URGENTE',
        usuario_asignado: null,
        fecha_asignacion: '2024-09-08',
        fecha_limite: '2024-10-10',
        prioridad: 'URGENTE',
        comentario: 'RAT ventas requiere completar urgentemente'
      }
    ];

    setWorkflowItems(workflowData);
  };

  const calcularEstadisticas = (ratsData) => {
    const stats = {
      borradores: ratsData.filter(r => r.estado_workflow === 'BORRADOR').length,
      enRevision: ratsData.filter(r => r.estado_workflow === 'EN_REVISION').length,
      pendientesAprobacion: ratsData.filter(r => r.estado_workflow === 'PENDIENTE_APROBACION').length,
      certificados: ratsData.filter(r => r.estado_workflow === 'CERTIFICADO').length,
      rechazados: ratsData.filter(r => r.estado_workflow === 'RECHAZADO').length,
      conflictos: ratsData.filter(r => r.estado_workflow === 'CONFLICTO').length
    };
    setStats(stats);
  };

  const cambiarEstadoRAT = async (ratId, nuevoEstado, comentario = '') => {
    try {
      const { data, error } = await supabase
        .from('rats')
        .update({
          estado_workflow: nuevoEstado,
          updated_at: new Date().toISOString(),
          version: supabase.sql`version + 1`
        })
        .eq('id', ratId)
        .select();

      if (error) throw error;

      // Registrar en historial workflow
      await registrarHistorialWorkflow(ratId, nuevoEstado, comentario);
      
      await cargarDatosWorkflow();
      
    } catch (error) {
      console.error('Error cambiando estado RAT:', error);
      alert('Error al cambiar estado del RAT');
    }
  };

  const registrarHistorialWorkflow = async (ratId, accion, comentario) => {
    try {
      const { error } = await supabase
        .from('workflow_history')
        .insert([{
          rat_id: ratId,
          accion,
          comentario,
          usuario_id: 'current_user_id', // Obtener del contexto auth
          timestamp: new Date().toISOString()
        }]);

      if (error) throw error;
      
    } catch (error) {
      console.error('Error registrando historial:', error);
    }
  };

  const asignarRAT = async () => {
    try {
      const { error } = await supabase
        .from('rats')
        .update({
          assigned_to: assignData.usuario_id,
          fecha_limite: assignData.fecha_limite,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedRAT.id);

      if (error) throw error;

      await registrarHistorialWorkflow(
        selectedRAT.id, 
        'ASIGNADO', 
        `Asignado a ${usuarios.find(u => u.id === assignData.usuario_id)?.first_name} ${usuarios.find(u => u.id === assignData.usuario_id)?.last_name}: ${assignData.comentario}`
      );

      setAssignDialog(false);
      setAssignData({ usuario_id: '', rol: 'REVISOR', fecha_limite: '', comentario: '' });
      await cargarDatosWorkflow();
      
    } catch (error) {
      console.error('Error asignando RAT:', error);
      alert('Error al asignar RAT');
    }
  };

  const bloquearRAT = async (ratId, bloquear = true) => {
    try {
      const { error } = await supabase
        .from('rats')
        .update({
          is_locked: bloquear,
          lock_user_id: bloquear ? 'current_user_id' : null,
          lock_timestamp: bloquear ? new Date().toISOString() : null
        })
        .eq('id', ratId);

      if (error) throw error;

      await cargarDatosWorkflow();
      
    } catch (error) {
      console.error('Error bloqueando RAT:', error);
    }
  };

  const getStateChip = (estado) => {
    const stateConfig = workflowStates[estado] || workflowStates['BORRADOR'];
    return (
      <Chip 
        label={stateConfig.label}
        color={stateConfig.color}
        size="small"
        icon={stateConfig.icon}
      />
    );
  };

  const getPriorityChip = (prioridad) => {
    const priorityConfig = priorities[prioridad] || priorities['NORMAL'];
    return (
      <Chip 
        label={priorityConfig.label}
        color={priorityConfig.color}
        size="small"
      />
    );
  };

  const renderWorkflowStats = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={2}>
        <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
          <CardContent sx={{ py: 3 }}>
            <Typography variant="h3" sx={{ color: '#6b7280', fontWeight: 700 }}>
              {stats.borradores}
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Borradores
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={2}>
        <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
          <CardContent sx={{ py: 3 }}>
            <Typography variant="h3" sx={{ color: '#60a5fa', fontWeight: 700 }}>
              {stats.enRevision}
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              En Revisión
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={2}>
        <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
          <CardContent sx={{ py: 3 }}>
            <Badge badgeContent={stats.pendientesAprobacion} color="warning">
              <Typography variant="h3" sx={{ color: '#f59e0b', fontWeight: 700 }}>
                {stats.pendientesAprobacion}
              </Typography>
            </Badge>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Pend. Aprobación
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={2}>
        <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
          <CardContent sx={{ py: 3 }}>
            <Typography variant="h3" sx={{ color: '#10b981', fontWeight: 700 }}>
              {stats.certificados}
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Certificados
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={2}>
        <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
          <CardContent sx={{ py: 3 }}>
            <Typography variant="h3" sx={{ color: '#ef4444', fontWeight: 700 }}>
              {stats.rechazados}
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Rechazados
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={2}>
        <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
          <CardContent sx={{ py: 3 }}>
            <Badge badgeContent={stats.conflictos} color="error">
              <Typography variant="h3" sx={{ color: '#8b5cf6', fontWeight: 700 }}>
                {stats.conflictos}
              </Typography>
            </Badge>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Conflictos
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderWorkflowTable = () => (
    <TableContainer component={Paper} sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>RAT</TableCell>
            <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Estado</TableCell>
            <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Prioridad</TableCell>
            <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Asignado a</TableCell>
            <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Fecha Límite</TableCell>
            <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Bloqueo</TableCell>
            <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rats.map((rat) => {
            const diasRestantes = Math.floor((new Date(rat.fecha_limite) - new Date()) / (1000 * 60 * 60 * 24));
            
            return (
              <TableRow key={rat.id} sx={{ '&:hover': { bgcolor: '#374151' } }}>
                <TableCell sx={{ color: '#f9fafb', borderColor: '#374151' }}>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {rat.area_responsable}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                      {rat.finalidad_principal}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        v{rat.version}
                      </Typography>
                      {rat.is_locked && (
                        <Tooltip title="RAT bloqueado para edición">
                          <LockIcon sx={{ fontSize: 14, color: '#ef4444' }} />
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                
                <TableCell sx={{ borderColor: '#374151' }}>
                  {getStateChip(rat.estado_workflow)}
                </TableCell>
                
                <TableCell sx={{ borderColor: '#374151' }}>
                  {getPriorityChip(rat.prioridad)}
                </TableCell>
                
                <TableCell sx={{ color: '#f9fafb', borderColor: '#374151' }}>
                  {rat.assigned_to ? (
                    <Box>
                      <Typography variant="body2">
                        {rat.assigned_to.first_name} {rat.assigned_to.last_name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                        {rat.assigned_to.email}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: '#9ca3af', fontStyle: 'italic' }}>
                      Sin asignar
                    </Typography>
                  )}
                </TableCell>
                
                <TableCell sx={{ borderColor: '#374151' }}>
                  <Chip 
                    label={`${diasRestantes} días`}
                    color={diasRestantes <= 3 ? 'error' : diasRestantes <= 7 ? 'warning' : 'success'}
                    size="small"
                    icon={<TimeIcon />}
                  />
                </TableCell>
                
                <TableCell sx={{ borderColor: '#374151' }}>
                  {rat.is_locked ? (
                    <Tooltip title="Desbloquear RAT">
                      <IconButton
                        size="small"
                        onClick={() => bloquearRAT(rat.id, false)}
                        sx={{ color: '#ef4444' }}
                      >
                        <LockIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Bloquear RAT">
                      <IconButton
                        size="small"
                        onClick={() => bloquearRAT(rat.id, true)}
                        sx={{ color: '#10b981' }}
                      >
                        <LockOpenIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
                
                <TableCell sx={{ borderColor: '#374151' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Ver detalles">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/rat-edit/${rat.id}`)}
                        sx={{ color: '#60a5fa' }}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Gestionar workflow">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedRAT(rat);
                          setWorkflowDialog(true);
                        }}
                        sx={{ color: '#8b5cf6' }}
                      >
                        <WorkflowIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Asignar usuario">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedRAT(rat);
                          setAssignDialog(true);
                        }}
                        sx={{ color: '#fbbf24' }}
                      >
                        <AssignIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Comentarios">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedRAT(rat);
                          setCommentDialog(true);
                        }}
                        sx={{ color: '#34d399' }}
                      >
                        <CommentIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderWorkflowDialog = () => (
    <Dialog
      open={workflowDialog}
      onClose={() => setWorkflowDialog(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { bgcolor: '#1f2937', border: '1px solid #374151' } }}
    >
      <DialogTitle sx={{ color: '#f9fafb' }}>
        Gestión de Workflow - {selectedRAT?.area_responsable}
      </DialogTitle>
      <DialogContent>
        {selectedRAT && (
          <Box sx={{ mt: 2 }}>
            {/* Estado Actual */}
            <Alert 
              severity="info" 
              sx={{ mb: 3, bgcolor: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.3)' }}
            >
              <Typography variant="body2">
                <strong>Estado Actual:</strong> {workflowStates[selectedRAT.estado_workflow]?.description}
              </Typography>
            </Alert>

            {/* Acciones Disponibles */}
            <Typography variant="h6" sx={{ color: '#f9fafb', mb: 2 }}>
              Acciones Disponibles:
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {workflowStates[selectedRAT.estado_workflow]?.actions.map((action) => {
                const actionConfig = {
                  'ENVIAR_REVISION': { label: 'Enviar a Revisión', color: '#60a5fa', targetState: 'EN_REVISION' },
                  'APROBAR_DEPARTAMENTAL': { label: 'Aprobar (Dpto)', color: '#10b981', targetState: 'PENDIENTE_APROBACION' },
                  'CERTIFICAR': { label: 'Certificar', color: '#059669', targetState: 'CERTIFICADO' },
                  'RECHAZAR': { label: 'Rechazar', color: '#ef4444', targetState: 'RECHAZADO' },
                  'SOLICITAR_CAMBIOS': { label: 'Solicitar Cambios', color: '#f59e0b', targetState: 'BORRADOR' },
                  'DUPLICAR': { label: 'Duplicar RAT', color: '#8b5cf6', targetState: null },
                  'ELIMINAR': { label: 'Eliminar', color: '#dc2626', targetState: null }
                };

                const config = actionConfig[action];
                if (!config) return null;

                return (
                  <Grid item xs={12} md={6} key={action}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => {
                        if (config.targetState) {
                          cambiarEstadoRAT(selectedRAT.id, config.targetState, `Acción: ${config.label}`);
                          setWorkflowDialog(false);
                        } else {
                          // Acciones especiales como duplicar/eliminar
                          alert(`Ejecutando: ${config.label}`);
                        }
                      }}
                      sx={{
                        color: config.color,
                        borderColor: config.color,
                        '&:hover': {
                          borderColor: config.color,
                          bgcolor: `${config.color}15`
                        }
                      }}
                    >
                      {config.label}
                    </Button>
                  </Grid>
                );
              })}
            </Grid>

            {/* Timeline del RAT */}
            <Typography variant="h6" sx={{ color: '#f9fafb', mb: 2 }}>
              Historial de Estados:
            </Typography>
            
            <Timeline position="left">
              <TimelineItem>
                <TimelineOppositeContent sx={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                  {new Date(selectedRAT.created_at).toLocaleDateString()}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color="primary">
                    <EditIcon />
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="body2" sx={{ color: '#f9fafb' }}>
                    RAT creado por {selectedRAT.created_by?.first_name} {selectedRAT.created_by?.last_name}
                  </Typography>
                </TimelineContent>
              </TimelineItem>
              
              <TimelineItem>
                <TimelineOppositeContent sx={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                  {new Date(selectedRAT.updated_at).toLocaleDateString()}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color="warning">
                    {workflowStates[selectedRAT.estado_workflow]?.icon}
                  </TimelineDot>
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="body2" sx={{ color: '#f9fafb' }}>
                    Estado actual: {workflowStates[selectedRAT.estado_workflow]?.label}
                  </Typography>
                  {selectedRAT.assigned_to && (
                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                      Asignado a: {selectedRAT.assigned_to.first_name} {selectedRAT.assigned_to.last_name}
                    </Typography>
                  )}
                </TimelineContent>
              </TimelineItem>
            </Timeline>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setWorkflowDialog(false)} sx={{ color: '#9ca3af' }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderAssignDialog = () => (
    <Dialog
      open={assignDialog}
      onClose={() => setAssignDialog(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { bgcolor: '#1f2937', border: '1px solid #374151' } }}
    >
      <DialogTitle sx={{ color: '#f9fafb' }}>
        Asignar RAT - {selectedRAT?.area_responsable}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#9ca3af' }}>Usuario a Asignar</InputLabel>
              <Select
                value={assignData.usuario_id}
                onChange={(e) => setAssignData(prev => ({ ...prev, usuario_id: e.target.value }))}
                sx={{ bgcolor: '#374151', color: '#f9fafb' }}
              >
                {usuarios.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#4f46e5' }}>
                        {user.first_name[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">
                          {user.first_name} {user.last_name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                          {user.departamento} - {user.role}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#9ca3af' }}>Rol en Workflow</InputLabel>
              <Select
                value={assignData.rol}
                onChange={(e) => setAssignData(prev => ({ ...prev, rol: e.target.value }))}
                sx={{ bgcolor: '#374151', color: '#f9fafb' }}
              >
                <MenuItem value="REVISOR">Revisor</MenuItem>
                <MenuItem value="APROBADOR">Aprobador</MenuItem>
                <MenuItem value="COLABORADOR">Colaborador</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Fecha Límite"
              value={assignData.fecha_limite}
              onChange={(e) => setAssignData(prev => ({ ...prev, fecha_limite: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': { bgcolor: '#374151', color: '#f9fafb' },
                '& .MuiInputLabel-root': { color: '#9ca3af' }
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Comentario de Asignación"
              value={assignData.comentario}
              onChange={(e) => setAssignData(prev => ({ ...prev, comentario: e.target.value }))}
              sx={{
                '& .MuiOutlinedInput-root': { bgcolor: '#374151', color: '#f9fafb' },
                '& .MuiInputLabel-root': { color: '#9ca3af' }
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setAssignDialog(false)} sx={{ color: '#9ca3af' }}>
          Cancelar
        </Button>
        <Button 
          onClick={asignarRAT}
          disabled={!assignData.usuario_id}
          sx={{ bgcolor: '#4f46e5', color: '#fff' }}
        >
          Asignar RAT
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderPendingActions = () => (
    <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151', p: 3, mt: 4 }}>
      <Typography variant="h6" sx={{ color: '#f9fafb', mb: 3 }}>
        🚨 Acciones Pendientes Urgentes
      </Typography>
      
      <List>
        {workflowItems.map((item) => {
          const rat = rats.find(r => r.id === item.rat_id);
          const usuario = usuarios.find(u => u.id === item.usuario_asignado);
          
          return (
            <ListItem key={item.id} sx={{ bgcolor: '#374151', mb: 1, borderRadius: 1 }}>
              <ListItemIcon>
                <PriorityIcon sx={{ color: priorities[item.prioridad]?.color === 'error' ? '#ef4444' : '#fbbf24' }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" sx={{ color: '#f9fafb' }}>
                    {rat?.area_responsable} - {item.tipo.replace('_', ' ')}
                  </Typography>
                }
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                      {item.comentario}
                    </Typography>
                    {usuario && (
                      <Typography variant="caption" sx={{ color: '#60a5fa', display: 'block' }}>
                        Asignado: {usuario.first_name} {usuario.last_name}
                      </Typography>
                    )}
                    <Typography variant="caption" sx={{ color: '#f59e0b' }}>
                      Vence: {new Date(item.fecha_limite).toLocaleDateString()}
                    </Typography>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  size="small"
                  onClick={() => navigate(`/rat-edit/${item.rat_id}`)}
                  sx={{ color: '#60a5fa' }}
                >
                  <ViewIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );

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
            <WorkflowIcon sx={{ fontSize: 40, color: '#8b5cf6' }} />
            Gestión de Workflow RATs
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#9ca3af' }}>
            Control de estados, asignaciones y colaboración en RATs
          </Typography>
        </Box>

        {/* Dashboard Estadísticas */}
        {renderWorkflowStats()}

        {/* Tabla Principal */}
        <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151', mb: 4 }}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#f9fafb' }}>
                Estados y Asignaciones RATs
              </Typography>
              <Button
                variant="contained"
                startIcon={<SyncIcon />}
                onClick={cargarDatosWorkflow}
                sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' } }}
              >
                Actualizar
              </Button>
            </Box>
            
            {renderWorkflowTable()}
          </Box>
        </Paper>

        {/* Acciones Pendientes */}
        {renderPendingActions()}

        {/* Alert Información */}
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
              🔄 <strong>Workflow Colaborativo:</strong> Los RATs siguen el flujo: 
              BORRADOR → EN_REVISION → PENDIENTE_APROBACION → CERTIFICADO. 
              Sistema de bloqueo evita conflictos de edición concurrente.
            </Typography>
          </Alert>
        </Box>
      </Container>

      {/* Dialogs */}
      {renderWorkflowDialog()}
      {renderAssignDialog()}
    </Box>
  );
};

export default RATWorkflowManager;