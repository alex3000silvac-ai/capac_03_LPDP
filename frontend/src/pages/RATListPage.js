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
  TablePagination,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Tooltip,
  Alert,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  GetApp as ExportIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Assessment as RATIcon,
  CheckCircle as CertifiedIcon,
  Schedule as PendingIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { ratService } from '../services/ratService';
import { useTenant } from '../contexts/TenantContext';

const RATListPage = () => {
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const [rats, setRats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [industryFilter, setIndustryFilter] = useState('TODOS');
  const [stats, setStats] = useState({
    total: 0,
    certificados: 0,
    pendientes: 0,
    borradores: 0
  });

  useEffect(() => {
    cargarRATs();
  }, []);

  const cargarRATs = async () => {
    try {
      setLoading(true);
      const tenantId = currentTenant?.id;
      const ratsData = await ratService.getCompletedRATs(tenantId);
      
      setRats(ratsData || []);
      calcularEstadisticas(ratsData || []);
    } catch (error) {
      console.error('Error cargando RATs:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = (ratsData) => {
    const stats = {
      total: ratsData.length,
      certificados: ratsData.filter(r => r.estado === 'CERTIFICADO').length,
      pendientes: ratsData.filter(r => r.estado === 'PENDIENTE_APROBACION').length,
      borradores: ratsData.filter(r => r.estado === 'BORRADOR').length
    };
    setStats(stats);
  };

  const getStatusChip = (estado) => {
    const statusConfig = {
      'CERTIFICADO': { label: 'Certificado', color: 'success', icon: <CertifiedIcon /> },
      'PENDIENTE_APROBACION': { label: 'Pendiente', color: 'warning', icon: <PendingIcon /> },
      'BORRADOR': { label: 'Borrador', color: 'default', icon: <EditIcon /> },
      'ERROR': { label: 'Error', color: 'error', icon: <ErrorIcon /> }
    };
    
    const config = statusConfig[estado] || statusConfig['BORRADOR'];
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        icon={config.icon}
        sx={{ minWidth: 100 }}
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

  const filtrarRATs = () => {
    return rats.filter(rat => {
      const matchSearch = rat.nombre_actividad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rat.finalidad?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'TODOS' || rat.estado === statusFilter;
      const matchIndustry = industryFilter === 'TODOS' || rat.industria === industryFilter;
      
      return matchSearch && matchStatus && matchIndustry;
    });
  };

  const ratsFilteredData = filtrarRATs();
  const paginatedRats = ratsFilteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleEditRAT = (ratId) => {
    navigate(`/rat-edit/${ratId}`);
  };

  const handleViewRAT = (ratId) => {
    navigate(`/rat-view/${ratId}`);
  };

  const handleExportRAT = async (ratId) => {
    try {
      await ratService.exportRATToPDF(ratId);
    } catch (error) {
      console.error('Error exportando RAT:', error);
    }
  };

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
            <RATIcon sx={{ fontSize: 40, color: '#4f46e5' }} />
            Gestión de RATs
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#9ca3af' }}>
            Registro de Actividades de Tratamiento - Art. 16 Ley 21.719
          </Typography>
        </Box>

        {/* Estadísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ color: '#4f46e5', fontWeight: 700 }}>
                  {stats.total}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Total RATs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ color: '#10b981', fontWeight: 700 }}>
                  {stats.certificados}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Certificados
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ color: '#f59e0b', fontWeight: 700 }}>
                  {stats.pendientes}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Pendientes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ color: '#6b7280', fontWeight: 700 }}>
                  {stats.borradores}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Borradores
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Controles y Filtros */}
        <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151', p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Buscar RATs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#9ca3af' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#374151',
                    color: '#f9fafb',
                    '& fieldset': { borderColor: '#4b5563' },
                    '&:hover fieldset': { borderColor: '#6b7280' },
                    '&.Mui-focused fieldset': { borderColor: '#4f46e5' },
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#9ca3af' }}>Estado</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{
                    bgcolor: '#374151',
                    color: '#f9fafb',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#4b5563' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6b7280' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4f46e5' },
                  }}
                >
                  <MenuItem value="TODOS">Todos los Estados</MenuItem>
                  <MenuItem value="CERTIFICADO">Certificados</MenuItem>
                  <MenuItem value="PENDIENTE_APROBACION">Pendientes</MenuItem>
                  <MenuItem value="BORRADOR">Borradores</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#9ca3af' }}>Industria</InputLabel>
                <Select
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  sx={{
                    bgcolor: '#374151',
                    color: '#f9fafb',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#4b5563' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6b7280' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4f46e5' },
                  }}
                >
                  <MenuItem value="TODOS">Todas las Industrias</MenuItem>
                  {/* Industrias dinámicas desde base de datos */}
                  {Array.from(new Set(rats.map(r => r.industria).filter(Boolean))).map(industria => (
                    <MenuItem key={industria} value={industria}>
                      {industria.charAt(0).toUpperCase() + industria.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/rat-system')}
                sx={{
                  bgcolor: '#4f46e5',
                  '&:hover': { bgcolor: '#4338ca' },
                  py: 1.5
                }}
              >
                Nuevo RAT
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabla de RATs */}
        <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography sx={{ color: '#9ca3af' }}>Cargando RATs...</Typography>
            </Box>
          ) : ratsFilteredData.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography sx={{ color: '#9ca3af', mb: 2 }}>
                No se encontraron RATs
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/rat-system')}
                sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' } }}
              >
                Crear Primer RAT
              </Button>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>
                        Nombre Actividad
                      </TableCell>
                      <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>
                        Finalidad
                      </TableCell>
                      <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>
                        Estado
                      </TableCell>
                      <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>
                        Riesgo
                      </TableCell>
                      <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>
                        Última Actualización
                      </TableCell>
                      <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>
                        Acciones
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedRats.map((rat) => (
                      <TableRow 
                        key={rat.id}
                        sx={{ 
                          '&:hover': { bgcolor: '#374151' }
                        }}
                      >
                        <TableCell sx={{ color: '#f9fafb', borderColor: '#374151' }}>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {rat.nombre_actividad}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                              ID: {rat.id}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#f9fafb', borderColor: '#374151' }}>
                          <Typography variant="body2" sx={{ 
                            maxWidth: 300,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {rat.finalidad}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderColor: '#374151' }}>
                          {getStatusChip(rat.estado || 'BORRADOR')}
                        </TableCell>
                        <TableCell sx={{ borderColor: '#374151' }}>
                          {getRiskChip(rat.nivel_riesgo || 'BAJO')}
                        </TableCell>
                        <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>
                          {rat.fecha_actualizacion ? 
                            new Date(rat.fecha_actualizacion).toLocaleDateString() : 
                            'No disponible'
                          }
                        </TableCell>
                        <TableCell sx={{ borderColor: '#374151' }}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Ver detalles">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewRAT(rat.id);
                                }}
                                sx={{ color: '#60a5fa' }}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Editar RAT">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditRAT(rat.id);
                                }}
                                sx={{ color: '#fbbf24' }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Exportar PDF">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExportRAT(rat.id);
                                }}
                                sx={{ color: '#34d399' }}
                              >
                                <ExportIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                component="div"
                count={ratsFilteredData.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                sx={{
                  color: '#9ca3af',
                  borderTop: '1px solid #374151',
                  '& .MuiTablePagination-actions button': {
                    color: '#9ca3af'
                  }
                }}
              />
            </>
          )}
        </Paper>

        {/* Información adicional */}
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
              📋 <strong>Art. 16 Ley 21.719:</strong> Todas las organizaciones que empleen 50 o más trabajadores, 
              traten datos sensibles o realicen transferencias internacionales deben mantener un RAT actualizado.
            </Typography>
          </Alert>
        </Box>
      </Container>
    </Box>
  );
};

export default RATListPage;