import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  GetApp as ExportIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const RATListPage = () => {
  const navigate = useNavigate();
  const [rats, setRats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRat, setSelectedRat] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [menuRatId, setMenuRatId] = useState(null);

  useEffect(() => {
    loadRats();
  }, []);

  const loadRats = async () => {
    try {
      setLoading(true);
      
      // TODO: Conectar con Supabase API para cargar RATs reales
      // const { data, error } = await supabase
      //   .from('rats')
      //   .select('*')
      //   .eq('tenant_id', currentTenant?.id)
      //   .order('fecha_actualizacion', { ascending: false });
      
      // if (error) throw error;
      // setRats(data || []);
      
      // TEMPORAL: Funcionalidad deshabilitada hasta integración completa
      setRats([]);
      console.warn('RATListPage: Funcionalidad deshabilitada - solo datos de Supabase permitidos');
      
    } catch (error) {
      console.error('Error cargando RATs:', error);
      setRats([]);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    const colors = {
      'BORRADOR': '#f57f17',
      'EN_REVISION': '#1976d2',
      'PENDIENTE_APROBACION': '#f57c00',
      'CERTIFICADO': '#2e7d32',
      'ELIMINADO': '#d32f2f'
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

  const getEstadoIcon = (estado) => {
    const icons = {
      'BORRADOR': <EditIcon />,
      'EN_REVISION': <ScheduleIcon />,
      'PENDIENTE_APROBACION': <WarningIcon />,
      'CERTIFICADO': <CheckIcon />,
      'ELIMINADO': <DeleteIcon />
    };
    return icons[estado] || <ScheduleIcon />;
  };

  const handleEdit = (rat) => {
    navigate(`/rat-edit/${rat.id}`);
  };

  const handleView = (rat) => {
    navigate(`/rat-view/${rat.id}`);
  };

  const handleDelete = (rat) => {
    setSelectedRat(rat);
    setDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      
      // En prod: llamar API delete
      console.log('Eliminando RAT:', selectedRat.id);
      
      // Actualizar lista
      setRats(prev => prev.filter(r => r.id !== selectedRat.id));
      
      setDeleteDialog(false);
      setSelectedRat(null);
      
    } catch (error) {
      console.error('Error eliminando RAT:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActionMenu = (event, ratId) => {
    setActionMenuAnchor(event.currentTarget);
    setMenuRatId(ratId);
  };

  const closeActionMenu = () => {
    setActionMenuAnchor(null);
    setMenuRatId(null);
  };

  const handleExport = async () => {
    try {
      // En prod: generar export
      const exportData = rats.map(rat => ({
        numero_rat: rat.numero_rat,
        nombre_actividad: rat.nombre_actividad,
        estado: rat.estado,
        nivel_riesgo: rat.nivel_riesgo,
        responsable: rat.responsable,
        fecha_actualizacion: rat.fecha_actualizacion
      }));
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rats_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exportando:', error);
    }
  };

  const paginatedRats = rats.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
            📋 Registro de Actividades de Tratamiento (RAT)
          </Typography>
          <Typography variant="body1" sx={{ color: '#bbb' }}>
            Gestión completa de RATs según Ley 21.719
          </Typography>
        </Box>
        
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={handleExport}
            startIcon={<ExportIcon />}
            sx={{
              borderColor: '#4fc3f7',
              color: '#4fc3f7',
              '&:hover': { borderColor: '#29b6f6', bgcolor: '#333' }
            }}
          >
            Exportar
          </Button>
          
          <Button
            variant="contained"
            onClick={() => navigate('/rat-create')}
            startIcon={<AddIcon />}
            sx={{
              bgcolor: '#4fc3f7',
              color: '#000',
              fontWeight: 600,
              '&:hover': { bgcolor: '#29b6f6' }
            }}
          >
            Nuevo RAT
          </Button>
        </Box>
      </Box>

      {/* Estadísticas rápidas */}
      <Box display="flex" gap={3} mb={3}>
        <Chip 
          label={`${rats.length} RATs Total`}
          sx={{ bgcolor: '#0d47a1', color: '#fff', fontWeight: 600 }}
        />
        <Chip 
          label={`${rats.filter(r => r.estado === 'CERTIFICADO').length} Certificados`}
          sx={{ bgcolor: '#2e7d32', color: '#fff', fontWeight: 600 }}
        />
        <Chip 
          label={`${rats.filter(r => r.nivel_riesgo === 'ALTO').length} Alto Riesgo`}
          sx={{ bgcolor: '#d32f2f', color: '#fff', fontWeight: 600 }}
        />
        <Chip 
          label={`${rats.filter(r => r.requiere_eipd).length} Requieren EIPD`}
          sx={{ bgcolor: '#f57f17', color: '#fff', fontWeight: 600 }}
        />
      </Box>

      {/* Tabla RATs */}
      <Paper elevation={3} sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
        {loading && <LinearProgress />}
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#2a2a2a' }}>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>RAT</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Actividad</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Estado</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Riesgo</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Responsable</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Última Actualización</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRats.map((rat) => (
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
                        {rat.area_responsable}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Chip 
                      icon={getEstadoIcon(rat.estado)}
                      label={rat.estado}
                      sx={{ 
                        bgcolor: getEstadoColor(rat.estado),
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
                    <Typography variant="body2" sx={{ color: '#fff' }}>
                      {rat.responsable.split('@')[0]}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#ccc' }}>
                      {new Date(rat.fecha_actualizacion).toLocaleDateString('es-CL')}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Ver detalles">
                        <IconButton 
                          size="small"
                          onClick={() => handleView(rat)}
                          sx={{ color: '#4fc3f7' }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Editar">
                        <IconButton 
                          size="small"
                          onClick={() => handleEdit(rat)}
                          sx={{ color: '#81c784' }}
                          disabled={rat.estado === 'CERTIFICADO'}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Más acciones">
                        <IconButton 
                          size="small"
                          onClick={(e) => handleActionMenu(e, rat.id)}
                          sx={{ color: '#bbb' }}
                        >
                          <MoreIcon />
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
          count={rats.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          sx={{
            color: '#fff',
            borderTop: '1px solid #333',
            '& .MuiTablePagination-selectIcon': { color: '#fff' }
          }}
        />
      </Paper>

      {/* Menu de acciones */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={closeActionMenu}
        PaperProps={{
          sx: { bgcolor: '#2a2a2a', border: '1px solid #444' }
        }}
      >
        <MenuItem onClick={() => {
          const rat = rats.find(r => r.id === menuRatId);
          handleView(rat);
          closeActionMenu();
        }}>
          <ListItemIcon>
            <ViewIcon sx={{ color: '#4fc3f7' }} />
          </ListItemIcon>
          <ListItemText primary="Ver Detalles" sx={{ color: '#fff' }} />
        </MenuItem>
        
        <MenuItem onClick={() => {
          const rat = rats.find(r => r.id === menuRatId);
          handleEdit(rat);
          closeActionMenu();
        }}>
          <ListItemIcon>
            <EditIcon sx={{ color: '#81c784' }} />
          </ListItemIcon>
          <ListItemText primary="Editar" sx={{ color: '#fff' }} />
        </MenuItem>
        
        <MenuItem onClick={() => {
          // Navegar a control versiones
          navigate(`/rat-versions/${menuRatId}`);
          closeActionMenu();
        }}>
          <ListItemIcon>
            <ScheduleIcon sx={{ color: '#ff9800' }} />
          </ListItemIcon>
          <ListItemText primary="Historial Versiones" sx={{ color: '#fff' }} />
        </MenuItem>
        
        <MenuItem onClick={() => {
          const rat = rats.find(r => r.id === menuRatId);
          handleDelete(rat);
          closeActionMenu();
        }}>
          <ListItemIcon>
            <DeleteIcon sx={{ color: '#f44336' }} />
          </ListItemIcon>
          <ListItemText primary="Eliminar" sx={{ color: '#fff' }} />
        </MenuItem>
      </Menu>

      {/* Dialog confirmación eliminación */}
      <Dialog 
        open={deleteDialog} 
        onClose={() => setDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#1a1a1a', color: '#fff', borderBottom: '1px solid #333' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <DeleteIcon sx={{ color: '#f44336' }} />
            <Typography variant="h6" component="span">
              Confirmar Eliminación
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ bgcolor: '#1a1a1a', color: '#fff' }}>
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 3,
              bgcolor: '#f57f17',
              color: '#fff'
            }}
          >
            ⚠️ <strong>Esta acción no se puede deshacer</strong>
          </Alert>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            ¿Está seguro de que desea eliminar el siguiente RAT?
          </Typography>
          
          <Box bgcolor="#333" p={2} borderRadius={1}>
            <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
              {selectedRat?.numero_rat}
            </Typography>
            <Typography variant="body1" sx={{ color: '#fff', mb: 1 }}>
              {selectedRat?.nombre_actividad}
            </Typography>
            <Typography variant="body2" sx={{ color: '#bbb' }}>
              Estado: {selectedRat?.estado} | Responsable: {selectedRat?.responsable}
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ bgcolor: '#1a1a1a', borderTop: '1px solid #333' }}>
          <Button 
            onClick={() => setDeleteDialog(false)} 
            sx={{ color: '#bbb' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={confirmDelete}
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: '#f44336',
              color: '#fff',
              fontWeight: 600,
              '&:hover': { bgcolor: '#d32f2f' }
            }}
          >
            Eliminar RAT
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RATListPage;