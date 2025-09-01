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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  History as HistoryIcon,
  Compare as CompareIcon,
  Restore as RestoreIcon,
  Visibility as ViewIcon,
  GetApp as DownloadIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Edit as EditIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';

const RATVersionControl = ({ ratId, onVersionRestore, onClose }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersions, setSelectedVersions] = useState([]);
  const [compareDialog, setCompareDialog] = useState(false);
  const [restoreDialog, setRestoreDialog] = useState(false);
  const [versionDetails, setVersionDetails] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);

  useEffect(() => {
    loadVersionHistory();
  }, [ratId]);

  const loadVersionHistory = async () => {
    try {
      setLoading(true);
      
      // Simular carga de versiones (en prod conectaría con API)
      const mockVersions = [
        {
          id: 1,
          version_number: 1,
          created_at: '2024-01-15T10:30:00Z',
          updated_by: 'juan.perez@empresa.cl',
          change_summary: 'Creación inicial del RAT',
          status: 'BORRADOR',
          changes_count: 0,
          is_current: false,
          data_snapshot: {
            nombre_actividad: 'Gestión de Clientes v1',
            finalidad: 'Gestión inicial de datos de clientes',
            tipos_datos: ['identificacion', 'contacto'],
            medidas_seguridad: ['Cifrado básico']
          }
        },
        {
          id: 2,
          version_number: 2,
          created_at: '2024-01-16T14:20:00Z',
          updated_by: 'maria.gonzalez@empresa.cl',
          change_summary: 'Agregados datos financieros y medidas de seguridad reforzadas',
          status: 'EN_REVISION',
          changes_count: 3,
          is_current: false,
          data_snapshot: {
            nombre_actividad: 'Gestión de Clientes v2',
            finalidad: 'Gestión completa de datos de clientes incluyendo perfil financiero',
            tipos_datos: ['identificacion', 'contacto', 'financieros'],
            medidas_seguridad: ['Cifrado AES-256', 'Autenticación multifactor', 'Logs de auditoría']
          }
        },
        {
          id: 3,
          version_number: 3,
          created_at: '2024-01-18T09:15:00Z',
          updated_by: 'dpo@empresa.cl',
          change_summary: 'Certificación DPO - Ajustes finales de compliance',
          status: 'CERTIFICADO',
          changes_count: 2,
          is_current: true,
          data_snapshot: {
            nombre_actividad: 'Gestión Integral de Clientes',
            finalidad: 'Gestión completa de datos de clientes para servicios financieros cumpliendo Ley 21.719',
            tipos_datos: ['identificacion', 'contacto', 'financieros'],
            medidas_seguridad: ['Cifrado AES-256', 'Autenticación multifactor', 'Logs de auditoría', 'Respaldo automático']
          }
        }
      ];
      
      setVersions(mockVersions);
      
    } catch (error) {
      console.error('Error cargando historial versiones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVersionSelect = (versionId) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId);
      } else {
        return prev.length < 2 ? [...prev, versionId] : [prev[1], versionId];
      }
    });
  };

  const handleCompareVersions = () => {
    if (selectedVersions.length === 2) {
      setCompareDialog(true);
    }
  };

  const compareVersions = (version1, version2) => {
    const changes = [];
    const data1 = version1.data_snapshot;
    const data2 = version2.data_snapshot;
    
    const allKeys = new Set([...Object.keys(data1), ...Object.keys(data2)]);
    
    allKeys.forEach(key => {
      const val1 = data1[key];
      const val2 = data2[key];
      
      if (JSON.stringify(val1) !== JSON.stringify(val2)) {
        changes.push({
          field: key,
          version1_value: val1,
          version2_value: val2,
          type: !val1 ? 'ADDED' : !val2 ? 'REMOVED' : 'MODIFIED'
        });
      }
    });
    
    return changes;
  };

  const handleViewDetails = (version) => {
    setVersionDetails(version);
    setDetailsDialog(true);
  };

  const handleRestoreVersion = (version) => {
    setVersionDetails(version);
    setRestoreDialog(true);
  };

  const confirmRestore = () => {
    if (versionDetails && onVersionRestore) {
      onVersionRestore(versionDetails);
    }
    setRestoreDialog(false);
    setVersionDetails(null);
  };

  const exportVersionHistory = () => {
    const exportData = {
      rat_id: ratId,
      export_timestamp: new Date().toISOString(),
      total_versions: versions.length,
      versions: versions.map(v => ({
        version: v.version_number,
        date: v.created_at,
        author: v.updated_by,
        summary: v.change_summary,
        status: v.status
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rat_${ratId}_version_history.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    const colors = {
      'BORRADOR': '#f57f17',
      'EN_REVISION': '#1976d2',
      'PENDIENTE_APROBACION': '#f57c00',
      'CERTIFICADO': '#2e7d32',
      'ELIMINADO': '#d32f2f'
    };
    return colors[status] || '#666';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'BORRADOR': <EditIcon />,
      'EN_REVISION': <HistoryIcon />,
      'PENDIENTE_APROBACION': <ScheduleIcon />,
      'CERTIFICADO': <CheckIcon />,
      'ELIMINADO': <CloseIcon />
    };
    return icons[status] || <HistoryIcon />;
  };

  const calculateChangesFromPrevious = (currentVersion, previousVersion) => {
    if (!previousVersion) return [];
    
    const changes = [];
    const current = currentVersion.data_snapshot;
    const previous = previousVersion.data_snapshot;
    
    // Comparar campos principales
    Object.keys(current).forEach(key => {
      if (JSON.stringify(current[key]) !== JSON.stringify(previous[key])) {
        changes.push({
          field: key,
          type: previous[key] ? 'MODIFIED' : 'ADDED',
          old_value: previous[key],
          new_value: current[key]
        });
      }
    });
    
    return changes;
  };

  if (loading) {
    return (
      <Box p={3}>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography sx={{ color: '#ccc' }}>Cargando historial de versiones...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <HistoryIcon sx={{ color: '#4fc3f7', fontSize: 28 }} />
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 600 }}>
            Control de Versiones RAT #{ratId}
          </Typography>
          <Chip 
            label={`${versions.length} versiones`}
            sx={{ 
              bgcolor: '#0d47a1',
              color: '#fff',
              fontWeight: 600
            }}
          />
        </Box>
        
        <Box display="flex" gap={1}>
          <Tooltip title="Exportar historial">
            <IconButton 
              onClick={exportVersionHistory}
              sx={{ color: '#4fc3f7' }}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Comparar versiones">
            <Button
              variant="outlined"
              disabled={selectedVersions.length !== 2}
              onClick={handleCompareVersions}
              startIcon={<CompareIcon />}
              sx={{
                borderColor: selectedVersions.length === 2 ? '#4fc3f7' : '#666',
                color: selectedVersions.length === 2 ? '#4fc3f7' : '#666'
              }}
            >
              Comparar
            </Button>
          </Tooltip>
          
          <IconButton onClick={onClose} sx={{ color: '#999' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Timeline de versiones */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
            <Timeline position="right">
              {versions.map((version, index) => {
                const previousVersion = index < versions.length - 1 ? versions[index + 1] : null;
                const changes = calculateChangesFromPrevious(version, previousVersion);
                
                return (
                  <TimelineItem key={version.id}>
                    <TimelineOppositeContent sx={{ color: '#bbb', fontSize: '0.875rem' }}>
                      {new Date(version.created_at).toLocaleDateString('es-CL', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TimelineOppositeContent>
                    
                    <TimelineSeparator>
                      <TimelineDot 
                        sx={{ 
                          bgcolor: getStatusColor(version.status),
                          border: version.is_current ? '3px solid #4fc3f7' : 'none'
                        }}
                      >
                        {getStatusIcon(version.status)}
                      </TimelineDot>
                      {index < versions.length - 1 && <TimelineConnector sx={{ bgcolor: '#444' }} />}
                    </TimelineSeparator>
                    
                    <TimelineContent>
                      <Card 
                        sx={{ 
                          bgcolor: '#2a2a2a',
                          border: selectedVersions.includes(version.id) ? '2px solid #4fc3f7' : '1px solid #444',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: '#333',
                            borderColor: '#666'
                          }
                        }}
                        onClick={() => handleVersionSelect(version.id)}
                      >
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                            <Box>
                              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                                Versión {version.version_number}
                                {version.is_current && (
                                  <Chip 
                                    label="ACTUAL" 
                                    size="small" 
                                    sx={{ ml: 1, bgcolor: '#2e7d32', color: '#fff' }}
                                  />
                                )}
                              </Typography>
                              
                              <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
                                👤 {version.updated_by}
                              </Typography>
                            </Box>
                            
                            <Chip 
                              label={version.status}
                              size="small"
                              sx={{ 
                                bgcolor: getStatusColor(version.status),
                                color: '#fff',
                                fontWeight: 600
                              }}
                            />
                          </Box>
                          
                          <Typography variant="body1" sx={{ color: '#fff', mb: 2 }}>
                            {version.change_summary}
                          </Typography>
                          
                          {changes.length > 0 && (
                            <Box mb={2}>
                              <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
                                📝 Cambios ({changes.length}):
                              </Typography>
                              <Box display="flex" flexWrap="wrap" gap={0.5}>
                                {changes.slice(0, 3).map((change, idx) => (
                                  <Chip 
                                    key={idx}
                                    label={change.field}
                                    size="small"
                                    sx={{ 
                                      bgcolor: change.type === 'ADDED' ? '#2e7d32' : '#f57f17',
                                      color: '#fff'
                                    }}
                                  />
                                ))}
                                {changes.length > 3 && (
                                  <Chip 
                                    label={`+${changes.length - 3} más`}
                                    size="small"
                                    sx={{ bgcolor: '#666', color: '#fff' }}
                                  />
                                )}
                              </Box>
                            </Box>
                          )}
                          
                          <Box display="flex" gap={1}>
                            <Button
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(version);
                              }}
                              startIcon={<ViewIcon />}
                              sx={{ color: '#4fc3f7' }}
                            >
                              Ver Detalles
                            </Button>
                            
                            {!version.is_current && (
                              <Button
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRestoreVersion(version);
                                }}
                                startIcon={<RestoreIcon />}
                                sx={{ color: '#ff9800' }}
                              >
                                Restaurar
                              </Button>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </TimelineContent>
                  </TimelineItem>
                );
              })}
            </Timeline>
          </Paper>
        </Grid>
        
        {/* Panel lateral con estadísticas */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ bgcolor: '#1a1a1a', border: '1px solid #333', p: 3 }}>
            <Typography variant="h6" sx={{ color: '#fff', mb: 3, fontWeight: 600 }}>
              📊 Estadísticas de Versiones
            </Typography>
            
            <Box mb={3}>
              <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
                Total Versiones:
              </Typography>
              <Typography variant="h4" sx={{ color: '#4fc3f7', fontWeight: 700 }}>
                {versions.length}
              </Typography>
            </Box>

            <Divider sx={{ bgcolor: '#444', my: 2 }} />
            
            <Box mb={2}>
              <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
                Estados por Versión:
              </Typography>
              {['BORRADOR', 'EN_REVISION', 'CERTIFICADO'].map(status => {
                const count = versions.filter(v => v.status === status).length;
                return count > 0 ? (
                  <Box key={status} display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="body2" sx={{ color: '#ccc' }}>
                      {status}:
                    </Typography>
                    <Chip 
                      label={count}
                      size="small"
                      sx={{ 
                        bgcolor: getStatusColor(status),
                        color: '#fff',
                        minWidth: '32px'
                      }}
                    />
                  </Box>
                ) : null;
              })}
            </Box>

            <Divider sx={{ bgcolor: '#444', my: 2 }} />
            
            <Box mb={2}>
              <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
                Actividad Reciente:
              </Typography>
              
              {versions.slice(0, 3).map(version => (
                <Box key={version.id} mb={1}>
                  <Typography variant="body2" sx={{ color: '#fff' }}>
                    v{version.version_number} 
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#bbb' }}>
                    {new Date(version.created_at).toLocaleDateString('es-CL')} - {version.updated_by.split('@')[0]}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ bgcolor: '#444', my: 2 }} />
            
            <Alert 
              severity="info" 
              sx={{ 
                bgcolor: '#0d47a1', 
                color: '#fff',
                '& .MuiAlert-icon': { color: '#4fc3f7' }
              }}
            >
              💡 Selecciona 2 versiones para compararlas
            </Alert>
            
            {selectedVersions.length === 2 && (
              <Button
                fullWidth
                variant="contained"
                onClick={handleCompareVersions}
                startIcon={<CompareIcon />}
                sx={{
                  mt: 2,
                  bgcolor: '#4fc3f7',
                  color: '#000',
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#29b6f6' }
                }}
              >
                Comparar Seleccionadas
              </Button>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog: Comparación de versiones */}
      <Dialog 
        open={compareDialog} 
        onClose={() => setCompareDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#1a1a1a', color: '#fff', borderBottom: '1px solid #333' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <CompareIcon sx={{ color: '#4fc3f7' }} />
            <Typography variant="h6" component="span">
              Comparación de Versiones
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ bgcolor: '#1a1a1a', color: '#fff' }}>
          {selectedVersions.length === 2 && (
            <VersionComparison 
              version1={versions.find(v => v.id === selectedVersions[0])}
              version2={versions.find(v => v.id === selectedVersions[1])}
            />
          )}
        </DialogContent>
        
        <DialogActions sx={{ bgcolor: '#1a1a1a', borderTop: '1px solid #333' }}>
          <Button onClick={() => setCompareDialog(false)} sx={{ color: '#bbb' }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Detalles de versión */}
      <Dialog 
        open={detailsDialog} 
        onClose={() => setDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#1a1a1a', color: '#fff', borderBottom: '1px solid #333' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <ViewIcon sx={{ color: '#4fc3f7' }} />
            <Typography variant="h6" component="span">
              Detalles Versión {versionDetails?.version_number}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ bgcolor: '#1a1a1a', color: '#fff' }}>
          {versionDetails && (
            <VersionDetails version={versionDetails} />
          )}
        </DialogContent>
        
        <DialogActions sx={{ bgcolor: '#1a1a1a', borderTop: '1px solid #333' }}>
          <Button onClick={() => setDetailsDialog(false)} sx={{ color: '#bbb' }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Confirmar restauración */}
      <Dialog 
        open={restoreDialog} 
        onClose={() => setRestoreDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#1a1a1a', color: '#fff', borderBottom: '1px solid #333' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <RestoreIcon sx={{ color: '#ff9800' }} />
            <Typography variant="h6" component="span">
              Confirmar Restauración
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
            ⚠️ Esta acción creará una nueva versión basada en la versión {versionDetails?.version_number}
          </Alert>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            ¿Estás seguro de que deseas restaurar la siguiente versión?
          </Typography>
          
          <Box bgcolor="#333" p={2} borderRadius={1}>
            <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
              Versión {versionDetails?.version_number}
            </Typography>
            <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
              📅 {versionDetails?.created_at && new Date(versionDetails.created_at).toLocaleString('es-CL')}
            </Typography>
            <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
              👤 {versionDetails?.updated_by}
            </Typography>
            <Typography variant="body1" sx={{ color: '#fff' }}>
              {versionDetails?.change_summary}
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ bgcolor: '#1a1a1a', borderTop: '1px solid #333' }}>
          <Button 
            onClick={() => setRestoreDialog(false)} 
            sx={{ color: '#bbb' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={confirmRestore}
            variant="contained"
            sx={{
              bgcolor: '#ff9800',
              color: '#000',
              fontWeight: 600,
              '&:hover': { bgcolor: '#f57c00' }
            }}
            startIcon={<RestoreIcon />}
          >
            Restaurar Versión
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Componente para comparar versiones
const VersionComparison = ({ version1, version2 }) => {
  const getDifferences = () => {
    const changes = [];
    const data1 = version1.data_snapshot;
    const data2 = version2.data_snapshot;
    
    const allKeys = new Set([...Object.keys(data1), ...Object.keys(data2)]);
    
    allKeys.forEach(key => {
      const val1 = data1[key];
      const val2 = data2[key];
      
      if (JSON.stringify(val1) !== JSON.stringify(val2)) {
        changes.push({
          field: key,
          version1_value: val1,
          version2_value: val2,
          type: !val1 ? 'ADDED_IN_V2' : !val2 ? 'REMOVED_IN_V2' : 'MODIFIED'
        });
      }
    });
    
    return changes;
  };

  const differences = getDifferences();

  return (
    <Box>
      <Grid container spacing={3} mb={3}>
        <Grid item xs={6}>
          <Typography variant="h6" sx={{ color: '#4fc3f7', textAlign: 'center' }}>
            Versión {version1.version_number}
          </Typography>
          <Typography variant="body2" sx={{ color: '#bbb', textAlign: 'center' }}>
            {new Date(version1.created_at).toLocaleString('es-CL')}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="h6" sx={{ color: '#81c784', textAlign: 'center' }}>
            Versión {version2.version_number}
          </Typography>
          <Typography variant="body2" sx={{ color: '#bbb', textAlign: 'center' }}>
            {new Date(version2.created_at).toLocaleString('es-CL')}
          </Typography>
        </Grid>
      </Grid>

      {differences.length === 0 ? (
        <Alert severity="info" sx={{ bgcolor: '#0d47a1', color: '#fff' }}>
          ℹ️ No se encontraron diferencias entre estas versiones
        </Alert>
      ) : (
        <Box>
          <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
            📝 Diferencias Encontradas ({differences.length})
          </Typography>
          
          {differences.map((diff, index) => (
            <Accordion 
              key={index}
              sx={{ 
                bgcolor: '#2a2a2a',
                color: '#fff',
                mb: 1,
                '&:before': { display: 'none' }
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
                <Box display="flex" alignItems="center" gap={2} width="100%">
                  <Typography sx={{ fontWeight: 600 }}>
                    {diff.field}
                  </Typography>
                  <Chip 
                    label={diff.type}
                    size="small"
                    sx={{
                      bgcolor: diff.type === 'ADDED_IN_V2' ? '#2e7d32' : 
                               diff.type === 'REMOVED_IN_V2' ? '#d32f2f' : '#f57f17',
                      color: '#fff'
                    }}
                  />
                </Box>
              </AccordionSummary>
              
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" sx={{ color: '#4fc3f7', mb: 1 }}>
                      Versión {version1.version_number}:
                    </Typography>
                    <Box bgcolor="#333" p={2} borderRadius={1}>
                      <Typography variant="body2" sx={{ color: '#fff', fontFamily: 'monospace' }}>
                        {JSON.stringify(diff.version1_value, null, 2) || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" sx={{ color: '#81c784', mb: 1 }}>
                      Versión {version2.version_number}:
                    </Typography>
                    <Box bgcolor="#333" p={2} borderRadius={1}>
                      <Typography variant="body2" sx={{ color: '#fff', fontFamily: 'monospace' }}>
                        {JSON.stringify(diff.version2_value, null, 2) || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Box>
  );
};

// Componente para detalles de versión
const VersionDetails = ({ version }) => {
  return (
    <Box>
      {/* Metadatos */}
      <Paper elevation={1} sx={{ bgcolor: '#2a2a2a', p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
          📋 Información de Versión
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: '#bbb' }}>Número de Versión:</Typography>
            <Typography variant="h6" sx={{ color: '#4fc3f7' }}>{version.version_number}</Typography>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: '#bbb' }}>Estado:</Typography>
            <Chip 
              label={version.status}
              sx={{ 
                bgcolor: getStatusColor(version.status),
                color: '#fff',
                fontWeight: 600
              }}
            />
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: '#bbb' }}>Creado por:</Typography>
            <Typography variant="body1" sx={{ color: '#fff' }}>{version.updated_by}</Typography>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: '#bbb' }}>Fecha:</Typography>
            <Typography variant="body1" sx={{ color: '#fff' }}>
              {new Date(version.created_at).toLocaleString('es-CL')}
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="body2" sx={{ color: '#bbb' }}>Resumen de Cambios:</Typography>
            <Typography variant="body1" sx={{ color: '#fff' }}>{version.change_summary}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Datos completos */}
      <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
        📄 Snapshot de Datos
      </Typography>
      
      <Accordion sx={{ bgcolor: '#2a2a2a', color: '#fff' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
          <Typography>Ver Datos Completos de la Versión</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box bgcolor="#333" p={2} borderRadius={1}>
            <pre style={{ color: '#fff', fontSize: '12px', margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(version.data_snapshot, null, 2)}
            </pre>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default RATVersionControl;