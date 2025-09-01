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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Badge,
  LinearProgress,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CloudUpload as UploadIcon,
  Description as ContractIcon,
  Security as SecurityIcon,
  Business as BusinessIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  Assignment as AssignmentIcon,
  Gavel as GavelIcon,
  Shield as ShieldIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  Timeline as TimelineIcon,
  Notifications as NotificationIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ProviderManager = () => {
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [providerDialog, setProviderDialog] = useState(false);
  const [dpaDialog, setDpaDialog] = useState(false);
  const [auditDialog, setAuditDialog] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      
      // Mock data - en prod conectaría con API
      const mockProviders = [
        {
          id: 1,
          nombre: 'AWS Amazon Web Services',
          tipo: 'cloud_hosting',
          pais: 'Estados Unidos',
          nivel_adecuacion: false,
          estado: 'ACTIVO',
          nivel_riesgo: 'ALTO',
          fecha_contrato: '2023-06-15',
          fecha_vencimiento: '2024-06-15',
          responsable: 'tech@empresa.cl',
          datos_tratados: ['infraestructura', 'logs', 'backups'],
          finalidad: 'Hosting aplicaciones y almacenamiento datos',
          transferencias_realizadas: 1250,
          ultima_auditoria: '2023-12-01',
          certificaciones: ['SOC 2', 'ISO 27001', 'PCI DSS'],
          contacto_dpo: 'privacy@amazon.com',
          medidas_seguridad: ['Cifrado en tránsito', 'Cifrado en reposo', 'Control acceso'],
          dpa_vigente: {
            estado: 'FIRMADO',
            fecha_firma: '2023-06-15',
            tipo: 'SCC_EU',
            documento_url: '/dpa/aws-dpa-2023.pdf',
            clausulas_adicionales: true
          },
          evaluaciones_cumplimiento: [
            { fecha: '2024-01-15', score: 88, auditor: 'Deloitte' },
            { fecha: '2023-12-01', score: 85, auditor: 'Interno' }
          ],
          incidentes: [
            {
              fecha: '2023-11-20',
              tipo: 'acceso_no_autorizado',
              gravedad: 'MEDIA',
              resuelto: true,
              descripcion: 'Configuración incorrecta S3 bucket'
            }
          ],
          notificaciones_pendientes: 2
        },
        {
          id: 2,
          nombre: 'Microsoft Office 365',
          tipo: 'software_servicio',
          pais: 'Estados Unidos',
          nivel_adecuacion: false,
          estado: 'ACTIVO',
          nivel_riesgo: 'MEDIO',
          fecha_contrato: '2023-01-10',
          fecha_vencimiento: '2024-01-10',
          responsable: 'admin@empresa.cl',
          datos_tratados: ['documentos', 'emails', 'calendario'],
          finalidad: 'Productividad oficina y colaboración',
          transferencias_realizadas: 890,
          ultima_auditoria: '2023-10-15',
          certificaciones: ['SOC 2', 'ISO 27001'],
          contacto_dpo: 'privacy@microsoft.com',
          medidas_seguridad: ['MFA', 'DLP', 'Retention policies'],
          dpa_vigente: {
            estado: 'FIRMADO',
            fecha_firma: '2023-01-10',
            tipo: 'DPA_MICROSOFT',
            documento_url: '/dpa/microsoft-dpa-2023.pdf',
            clausulas_adicionales: false
          },
          evaluaciones_cumplimiento: [
            { fecha: '2023-10-15', score: 92, auditor: 'Interno' }
          ],
          incidentes: [],
          notificaciones_pendientes: 0
        },
        {
          id: 3,
          nombre: 'Mailchimp Marketing Platform',
          tipo: 'marketing',
          pais: 'Estados Unidos',
          nivel_adecuacion: false,
          estado: 'PENDIENTE_REVISION',
          nivel_riesgo: 'ALTO',
          fecha_contrato: '2023-09-01',
          fecha_vencimiento: '2024-09-01',
          responsable: 'marketing@empresa.cl',
          datos_tratados: ['emails', 'preferencias', 'comportamiento'],
          finalidad: 'Email marketing y análisis comportamiento',
          transferencias_realizadas: 340,
          ultima_auditoria: null,
          certificaciones: ['Privacy Shield (caducado)'],
          contacto_dpo: 'privacy@mailchimp.com',
          medidas_seguridad: ['Encriptación', 'Opt-out automático'],
          dpa_vigente: {
            estado: 'VENCIDO',
            fecha_firma: '2022-09-01',
            tipo: 'SCC_EU',
            documento_url: '/dpa/mailchimp-dpa-2022.pdf',
            clausulas_adicionales: false
          },
          evaluaciones_cumplimiento: [],
          incidentes: [
            {
              fecha: '2023-08-15',
              tipo: 'transferencia_no_autorizada',
              gravedad: 'ALTA',
              resuelto: false,
              descripcion: 'DPA vencido - transferencias continúan'
            }
          ],
          notificaciones_pendientes: 5
        }
      ];
      
      setProviders(mockProviders);
      
    } catch (error) {
      console.error('Error cargando proveedores:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTipoColor = (tipo) => {
    const colors = {
      'cloud_hosting': '#1976d2',
      'software_servicio': '#2e7d32',
      'marketing': '#f57f17',
      'analytics': '#9c27b0',
      'crm': '#00acc1',
      'financiero': '#d32f2f'
    };
    return colors[tipo] || '#666';
  };

  const getEstadoColor = (estado) => {
    const colors = {
      'ACTIVO': '#2e7d32',
      'INACTIVO': '#666',
      'PENDIENTE_REVISION': '#f57f17',
      'SUSPENDIDO': '#d32f2f',
      'VENCIDO': '#b71c1c'
    };
    return colors[estado] || '#666';
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

  const getDPAStatusColor = (estado) => {
    const colors = {
      'FIRMADO': '#2e7d32',
      'PENDIENTE': '#f57f17',
      'VENCIDO': '#d32f2f',
      'RECHAZADO': '#b71c1c'
    };
    return colors[estado] || '#666';
  };

  const handleAddProvider = () => {
    setSelectedProvider(null);
    setProviderDialog(true);
  };

  const handleEditProvider = (provider) => {
    setSelectedProvider(provider);
    setProviderDialog(true);
  };

  const handleViewDPA = (provider) => {
    setSelectedProvider(provider);
    setDpaDialog(true);
  };

  const handleAuditProvider = (provider) => {
    setSelectedProvider(provider);
    setAuditDialog(true);
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.tipo.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || provider.estado === filterStatus;
    const matchesRisk = filterRisk === 'all' || provider.nivel_riesgo === filterRisk;
    
    return matchesSearch && matchesStatus && matchesRisk;
  });

  const stats = {
    total: providers.length,
    activos: providers.filter(p => p.estado === 'ACTIVO').length,
    altoRiesgo: providers.filter(p => p.nivel_riesgo === 'ALTO' || p.nivel_riesgo === 'CRITICO').length,
    dpaVencidos: providers.filter(p => p.dpa_vigente.estado === 'VENCIDO').length,
    sinAuditoria: providers.filter(p => !p.ultima_auditoria).length,
    notificaciones: providers.reduce((sum, p) => sum + p.notificaciones_pendientes, 0)
  };

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
            🏢 Gestión de Proveedores
          </Typography>
          <Typography variant="body1" sx={{ color: '#bbb' }}>
            Control DPA y transferencias internacionales según Ley 21.719
          </Typography>
        </Box>
        
        <Box display="flex" gap={2}>
          <Badge badgeContent={stats.notificaciones} color="error">
            <Button
              variant="outlined"
              startIcon={<NotificationIcon />}
              sx={{
                borderColor: '#f57f17',
                color: '#f57f17',
                '&:hover': { borderColor: '#ff9800', bgcolor: '#333' }
              }}
            >
              Alertas
            </Button>
          </Badge>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddProvider}
            sx={{
              bgcolor: '#4fc3f7',
              color: '#000',
              fontWeight: 600,
              '&:hover': { bgcolor: '#29b6f6' }
            }}
          >
            Nuevo Proveedor
          </Button>
        </Box>
      </Box>

      {/* Estadísticas */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={2}>
          <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <BusinessIcon sx={{ color: '#4fc3f7', fontSize: 24 }} />
                <Box>
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>
                    Total Proveedores
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={2}>
          <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <CheckIcon sx={{ color: '#2e7d32', fontSize: 24 }} />
                <Box>
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
                    {stats.activos}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>
                    Activos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={2}>
          <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <WarningIcon sx={{ color: '#d32f2f', fontSize: 24 }} />
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

        <Grid item xs={12} md={2}>
          <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <ContractIcon sx={{ color: '#f57f17', fontSize: 24 }} />
                <Box>
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
                    {stats.dpaVencidos}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>
                    DPA Vencidos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={2}>
          <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <AssignmentIcon sx={{ color: '#9c27b0', fontSize: 24 }} />
                <Box>
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
                    {stats.sinAuditoria}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>
                    Sin Auditoría
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={2}>
          <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <NotificationIcon sx={{ color: '#f57f17', fontSize: 24 }} />
                <Box>
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
                    {stats.notificaciones}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#bbb' }}>
                    Alertas
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controles y filtros */}
      <Paper elevation={1} sx={{ bgcolor: '#1a1a1a', border: '1px solid #333', p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Buscar proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#bbb' }}>Estado</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                sx={{
                  bgcolor: '#2a2a2a',
                  color: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' }
                }}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="ACTIVO">Activos</MenuItem>
                <MenuItem value="PENDIENTE_REVISION">Pendiente Revisión</MenuItem>
                <MenuItem value="SUSPENDIDO">Suspendidos</MenuItem>
                <MenuItem value="VENCIDO">Vencidos</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#bbb' }}>Nivel Riesgo</InputLabel>
              <Select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                sx={{
                  bgcolor: '#2a2a2a',
                  color: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' }
                }}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="BAJO">Bajo</MenuItem>
                <MenuItem value="MEDIO">Medio</MenuItem>
                <MenuItem value="ALTO">Alto</MenuItem>
                <MenuItem value="CRITICO">Crítico</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<DownloadIcon />}
              sx={{
                borderColor: '#4fc3f7',
                color: '#4fc3f7',
                '&:hover': { borderColor: '#29b6f6', bgcolor: '#333' }
              }}
            >
              Exportar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper elevation={1} sx={{ bgcolor: '#1a1a1a', border: '1px solid #333', mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={(e, newValue) => setCurrentTab(newValue)}
          sx={{
            '& .MuiTab-root': { color: '#bbb' },
            '& .Mui-selected': { color: '#4fc3f7' },
            '& .MuiTabs-indicator': { bgcolor: '#4fc3f7' }
          }}
        >
          <Tab label="Vista General" />
          <Tab label="DPA y Contratos" />
          <Tab label="Auditorías" />
          <Tab label="Alertas y Riesgos" />
        </Tabs>
      </Paper>

      {/* Vista General */}
      {currentTab === 0 && (
        <Paper elevation={3} sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
          {loading && <LinearProgress />}
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#2a2a2a' }}>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Proveedor</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Tipo</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>País</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Estado</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Riesgo</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>DPA</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Última Auditoría</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProviders.map((provider) => (
                  <TableRow 
                    key={provider.id}
                    sx={{ 
                      '&:hover': { bgcolor: '#2a2a2a' },
                      borderBottom: '1px solid #333'
                    }}
                  >
                    <TableCell>
                      <Box>
                        <Box display="flex" alignItems="center" gap={2}>
                          <BusinessIcon sx={{ color: '#4fc3f7' }} />
                          <Box>
                            <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600 }}>
                              {provider.nombre}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#bbb' }}>
                              {provider.responsable}
                            </Typography>
                          </Box>
                          {provider.notificaciones_pendientes > 0 && (
                            <Badge badgeContent={provider.notificaciones_pendientes} color="error" />
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Chip 
                        label={provider.tipo.replace('_', ' ')}
                        sx={{ 
                          bgcolor: getTipoColor(provider.tipo),
                          color: '#fff',
                          fontSize: '0.75rem'
                        }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <PublicIcon sx={{ color: provider.nivel_adecuacion ? '#2e7d32' : '#f57f17' }} />
                        <Typography sx={{ color: '#fff' }}>
                          {provider.pais}
                        </Typography>
                        {!provider.nivel_adecuacion && (
                          <Chip 
                            label="Sin Nivel Adec."
                            size="small"
                            sx={{ bgcolor: '#f57f17', color: '#fff', fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Chip 
                        label={provider.estado}
                        sx={{ 
                          bgcolor: getEstadoColor(provider.estado),
                          color: '#fff',
                          fontSize: '0.75rem'
                        }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Chip 
                        label={provider.nivel_riesgo}
                        sx={{ 
                          bgcolor: getRiesgoColor(provider.nivel_riesgo),
                          color: '#fff',
                          fontSize: '0.75rem'
                        }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip 
                          label={provider.dpa_vigente.estado}
                          size="small"
                          sx={{ 
                            bgcolor: getDPAStatusColor(provider.dpa_vigente.estado),
                            color: '#fff',
                            fontSize: '0.7rem'
                          }}
                        />
                        {provider.dpa_vigente.estado === 'VENCIDO' && (
                          <WarningIcon sx={{ color: '#d32f2f', fontSize: 16 }} />
                        )}
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Typography sx={{ color: provider.ultima_auditoria ? '#fff' : '#f57f17' }}>
                        {provider.ultima_auditoria ? 
                          new Date(provider.ultima_auditoria).toLocaleDateString() : 
                          'Sin auditoría'
                        }
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Box display="flex" gap={0.5}>
                        <Tooltip title="Ver detalles">
                          <IconButton 
                            size="small"
                            onClick={() => handleEditProvider(provider)}
                            sx={{ color: '#4fc3f7' }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Gestión DPA">
                          <IconButton 
                            size="small"
                            onClick={() => handleViewDPA(provider)}
                            sx={{ color: '#2e7d32' }}
                          >
                            <ContractIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Auditoría">
                          <IconButton 
                            size="small"
                            onClick={() => handleAuditProvider(provider)}
                            sx={{ color: '#f57f17' }}
                          >
                            <AssignmentIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Editar">
                          <IconButton 
                            size="small"
                            onClick={() => handleEditProvider(provider)}
                            sx={{ color: '#9c27b0' }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {filteredProviders.length === 0 && (
            <Box p={4} textAlign="center">
              <Typography sx={{ color: '#bbb' }}>
                No se encontraron proveedores con los filtros aplicados
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* Vista DPA y Contratos */}
      {currentTab === 1 && (
        <Grid container spacing={3}>
          {filteredProviders.map((provider) => (
            <Grid item xs={12} md={6} lg={4} key={provider.id}>
              <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333', height: '100%' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                      {provider.nombre}
                    </Typography>
                    <Chip 
                      label={provider.dpa_vigente.estado}
                      size="small"
                      sx={{ 
                        bgcolor: getDPAStatusColor(provider.dpa_vigente.estado),
                        color: '#fff'
                      }}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ color: '#bbb' }}>Tipo DPA:</Typography>
                      <Typography sx={{ color: '#fff' }}>{provider.dpa_vigente.tipo}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: '#bbb' }}>Fecha Firma:</Typography>
                      <Typography sx={{ color: '#fff', fontSize: '0.875rem' }}>
                        {new Date(provider.dpa_vigente.fecha_firma).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: '#bbb' }}>Vencimiento:</Typography>
                      <Typography sx={{ 
                        color: new Date(provider.fecha_vencimiento) < new Date() ? '#d32f2f' : '#fff',
                        fontSize: '0.875rem'
                      }}>
                        {new Date(provider.fecha_vencimiento).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ color: '#bbb' }}>Transferencias:</Typography>
                      <Typography sx={{ color: '#4fc3f7', fontWeight: 600 }}>
                        {provider.transferencias_realizadas.toLocaleString()} registros
                      </Typography>
                    </Grid>
                  </Grid>

                  {provider.dpa_vigente.clausulas_adicionales && (
                    <Chip 
                      label="Cláusulas Adicionales"
                      size="small"
                      sx={{ bgcolor: '#1976d2', color: '#fff', mt: 1 }}
                    />
                  )}
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small"
                    onClick={() => handleViewDPA(provider)}
                    sx={{ color: '#4fc3f7' }}
                    startIcon={<ContractIcon />}
                  >
                    Ver DPA
                  </Button>
                  <Button 
                    size="small"
                    sx={{ color: '#2e7d32' }}
                    startIcon={<DownloadIcon />}
                  >
                    Descargar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Vista Auditorías */}
      {currentTab === 2 && (
        <Grid container spacing={3}>
          {filteredProviders.map((provider) => (
            <Grid item xs={12} key={provider.id}>
              <ProviderAuditCard 
                provider={provider} 
                onAudit={() => handleAuditProvider(provider)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Vista Alertas y Riesgos */}
      {currentTab === 3 && (
        <Grid container spacing={3}>
          {filteredProviders.filter(p => 
            p.nivel_riesgo === 'ALTO' || 
            p.nivel_riesgo === 'CRITICO' || 
            p.dpa_vigente.estado === 'VENCIDO' ||
            p.incidentes.length > 0
          ).map((provider) => (
            <Grid item xs={12} key={provider.id}>
              <ProviderRiskCard provider={provider} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog: Gestión DPA */}
      <Dialog 
        open={dpaDialog} 
        onClose={() => setDpaDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#1a1a1a', color: '#fff', borderBottom: '1px solid #333' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <ContractIcon sx={{ color: '#4fc3f7' }} />
            <Typography variant="h6" component="span">
              Gestión DPA - {selectedProvider?.nombre}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ bgcolor: '#1a1a1a', color: '#fff' }}>
          {selectedProvider && <DPAManagementView provider={selectedProvider} />}
        </DialogContent>
        
        <DialogActions sx={{ bgcolor: '#1a1a1a', borderTop: '1px solid #333' }}>
          <Button onClick={() => setDpaDialog(false)} sx={{ color: '#bbb' }}>
            Cerrar
          </Button>
          <Button 
            variant="contained"
            sx={{
              bgcolor: '#4fc3f7',
              color: '#000',
              fontWeight: 600,
              '&:hover': { bgcolor: '#29b6f6' }
            }}
            startIcon={<UploadIcon />}
          >
            Subir Nuevo DPA
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Funciones auxiliares para reutilizar
const getRiesgoColorHelper = (riesgo) => {
  const colors = {
    'BAJO': '#2e7d32',
    'MEDIO': '#f57f17',
    'ALTO': '#d32f2f',
    'CRITICO': '#b71c1c'
  };
  return colors[riesgo] || '#666';
};

// Componente para vista de auditoría de proveedor
const ProviderAuditCard = ({ provider, onAudit }) => {
  const hasRecentAudit = provider.ultima_auditoria && 
    new Date(provider.ultima_auditoria) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

  return (
    <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
          <Box>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
              {provider.nombre}
            </Typography>
            <Typography variant="body2" sx={{ color: '#bbb' }}>
              {provider.tipo.replace('_', ' ')} - {provider.pais}
            </Typography>
          </Box>
          
          <Box display="flex" gap={1}>
            <Chip 
              label={provider.nivel_riesgo}
              sx={{ 
                bgcolor: getRiesgoColorHelper(provider.nivel_riesgo),
                color: '#fff'
              }}
            />
            {!hasRecentAudit && (
              <Chip 
                label="Requiere Auditoría"
                sx={{ bgcolor: '#f57f17', color: '#fff' }}
              />
            )}
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#bbb' }}>Última Auditoría:</Typography>
            <Typography sx={{ color: hasRecentAudit ? '#2e7d32' : '#f57f17' }}>
              {provider.ultima_auditoria ? 
                new Date(provider.ultima_auditoria).toLocaleDateString() : 
                'Nunca auditado'
              }
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#bbb' }}>Score Promedio:</Typography>
            <Typography sx={{ color: '#4fc3f7', fontWeight: 600 }}>
              {provider.evaluaciones_cumplimiento.length > 0 ? 
                Math.round(provider.evaluaciones_cumplimiento.reduce((sum, e) => sum + e.score, 0) / provider.evaluaciones_cumplimiento.length) + '%' :
                'Sin evaluaciones'
              }
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>Certificaciones:</Typography>
            <Box display="flex" flexWrap="wrap" gap={0.5}>
              {provider.certificaciones.map((cert, index) => (
                <Chip 
                  key={index}
                  label={cert}
                  size="small"
                  sx={{ bgcolor: '#2e7d32', color: '#fff', fontSize: '0.7rem' }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
      
      <CardActions>
        <Button 
          size="small"
          onClick={onAudit}
          variant="contained"
          sx={{
            bgcolor: '#f57f17',
            color: '#fff',
            '&:hover': { bgcolor: '#ff9800' }
          }}
          startIcon={<AssignmentIcon />}
        >
          {hasRecentAudit ? 'Nueva Auditoría' : 'Auditar Ahora'}
        </Button>
        
        <Button 
          size="small"
          sx={{ color: '#4fc3f7' }}
          startIcon={<TimelineIcon />}
        >
          Historial
        </Button>
      </CardActions>
    </Card>
  );
};

// Componente para vista de riesgos de proveedor
const ProviderRiskCard = ({ provider }) => {
  const riesgosDetectados = [];
  
  if (provider.dpa_vigente.estado === 'VENCIDO') {
    riesgosDetectados.push({
      tipo: 'DPA_VENCIDO',
      nivel: 'ALTO',
      descripcion: 'DPA vencido - transferencias sin protección legal',
      accion: 'Renovar DPA inmediatamente'
    });
  }
  
  if (!provider.ultima_auditoria) {
    riesgosDetectados.push({
      tipo: 'SIN_AUDITORIA',
      nivel: 'MEDIO',
      descripcion: 'Proveedor nunca ha sido auditado',
      accion: 'Programar auditoría de cumplimiento'
    });
  }
  
  if (provider.incidentes.filter(i => !i.resuelto).length > 0) {
    riesgosDetectados.push({
      tipo: 'INCIDENTES_PENDIENTES',
      nivel: 'ALTO',
      descripcion: `${provider.incidentes.filter(i => !i.resuelto).length} incidentes sin resolver`,
      accion: 'Resolver incidentes pendientes'
    });
  }
  
  if (provider.nivel_riesgo === 'CRITICO') {
    riesgosDetectados.push({
      tipo: 'RIESGO_CRITICO',
      nivel: 'CRITICO',
      descripcion: 'Proveedor clasificado como riesgo crítico',
      accion: 'Revisar continuidad del servicio'
    });
  }

  return (
    <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
          <Box>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
              {provider.nombre}
            </Typography>
            <Typography variant="body2" sx={{ color: '#bbb' }}>
              {riesgosDetectados.length} riesgos detectados
            </Typography>
          </Box>
          
          <Chip 
            label={`Riesgo ${provider.nivel_riesgo}`}
            sx={{ 
              bgcolor: getRiesgoColorHelper(provider.nivel_riesgo),
              color: '#fff'
            }}
          />
        </Box>

        <List dense>
          {riesgosDetectados.map((riesgo, index) => (
            <ListItem key={index} sx={{ px: 0 }}>
              <ListItemIcon>
                <WarningIcon sx={{ color: getRiesgoColorHelper(riesgo.nivel) }} />
              </ListItemIcon>
              <ListItemText
                primary={riesgo.descripcion}
                secondary={
                  <Typography variant="body2" sx={{ color: '#4fc3f7' }}>
                    Acción: {riesgo.accion}
                  </Typography>
                }
                sx={{ color: '#fff' }}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

// Componente para gestión DPA
const DPAManagementView = ({ provider }) => {
  const [activeStep, setActiveStep] = useState(0);

  const dpaSteps = [
    'Información Contractual',
    'Análisis Transferencias',
    'Medidas Protección',
    'Monitoreo Cumplimiento'
  ];

  return (
    <Box>
      <Alert 
        severity={provider.dpa_vigente.estado === 'FIRMADO' ? "success" : "warning"}
        sx={{ 
          mb: 3,
          bgcolor: provider.dpa_vigente.estado === 'FIRMADO' ? '#2e7d32' : '#f57f17',
          color: '#fff'
        }}
      >
        Estado DPA: {provider.dpa_vigente.estado} - {provider.dpa_vigente.tipo}
      </Alert>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {dpaSteps.map((label) => (
          <Step key={label}>
            <StepLabel sx={{ '& .MuiStepLabel-label': { color: '#bbb' } }}>
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
            📄 Información del DPA
          </Typography>
          
          <Box mb={2}>
            <Typography variant="body2" sx={{ color: '#bbb' }}>Documento:</Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <ContractIcon sx={{ color: '#4fc3f7' }} />
              <Typography sx={{ color: '#4fc3f7' }}>
                {provider.dpa_vigente.documento_url}
              </Typography>
            </Box>
          </Box>
          
          <Box mb={2}>
            <Typography variant="body2" sx={{ color: '#bbb' }}>País Destino:</Typography>
            <Typography sx={{ color: '#fff' }}>{provider.pais}</Typography>
          </Box>
          
          <Box mb={2}>
            <Typography variant="body2" sx={{ color: '#bbb' }}>Nivel de Adecuación:</Typography>
            <Chip 
              label={provider.nivel_adecuacion ? 'SÍ' : 'NO'}
              sx={{ 
                bgcolor: provider.nivel_adecuacion ? '#2e7d32' : '#d32f2f',
                color: '#fff'
              }}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
            📊 Estadísticas de Transferencias
          </Typography>
          
          <Box mb={2}>
            <Typography variant="body2" sx={{ color: '#bbb' }}>Total Transferencias:</Typography>
            <Typography variant="h5" sx={{ color: '#4fc3f7', fontWeight: 600 }}>
              {provider.transferencias_realizadas.toLocaleString()}
            </Typography>
          </Box>
          
          <Box mb={2}>
            <Typography variant="body2" sx={{ color: '#bbb' }}>Datos Tratados:</Typography>
            <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
              {provider.datos_tratados.map((dato, index) => (
                <Chip 
                  key={index}
                  label={dato}
                  size="small"
                  sx={{ bgcolor: '#1976d2', color: '#fff' }}
                />
              ))}
            </Box>
          </Box>
          
          <Box>
            <Typography variant="body2" sx={{ color: '#bbb' }}>Finalidad:</Typography>
            <Typography sx={{ color: '#fff' }}>{provider.finalidad}</Typography>
          </Box>
        </Grid>
      </Grid>

      {provider.incidentes.length > 0 && (
        <Box mt={3}>
          <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
            ⚠️ Incidentes Registrados
          </Typography>
          
          {provider.incidentes.map((incidente, index) => (
            <Alert 
              key={index}
              severity="warning"
              sx={{ 
                mb: 1,
                bgcolor: '#f57f17',
                color: '#fff'
              }}
            >
              <Typography variant="subtitle2">
                {new Date(incidente.fecha).toLocaleDateString()} - {incidente.tipo}
              </Typography>
              <Typography variant="body2">
                {incidente.descripcion}
              </Typography>
              <Chip 
                label={incidente.resuelto ? 'Resuelto' : 'Pendiente'}
                size="small"
                sx={{ 
                  bgcolor: incidente.resuelto ? '#2e7d32' : '#d32f2f',
                  color: '#fff',
                  mt: 1
                }}
              />
            </Alert>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ProviderManager;