/**
 * SISTEMA DE ASOCIACIÓN DE DOCUMENTOS
 * Permite asociar, cambiar o crear documentos DPIA/EIPD/DPA para un RAT
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  Tooltip,
  Paper
} from '@mui/material';
import {
  Link as LinkIcon,
  LinkOff as UnlinkIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Assignment as RATIcon,
  Security as EIPDIcon,
  Business as DPAIcon,
  Assessment as DPIAIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  AutoAwesome as AutoIcon,
  Edit as EditIcon,
  Sync as SyncIcon
} from '@mui/icons-material';

const AsociacionDocumentos = ({ ratId = 'RAT-EJEMPLO' }) => {
  const [showAssociationDialog, setShowAssociationDialog] = useState(false);
  const [documentosExistentes, setDocumentosExistentes] = useState([]);
  const [documentosAsociados, setDocumentosAsociados] = useState([]);
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarDocumentosExistentes();
    cargarAsociacionesActuales();
  }, []);

  // Simular carga de documentos existentes en el sistema
  const cargarDocumentosExistentes = () => {
    const docs = [
      {
        id: 'EIPD-2024-001',
        tipo: 'EIPD',
        nombre: 'Evaluación Impacto - Sistema Scoring',
        descripcion: 'EIPD para datos sensibles financieros',
        estado: 'draft',
        progreso: 60,
        fechaCreacion: '2024-08-25',
        responsable: 'Juan Pérez (DPO)',
        compatible: true,
        razon_compatible: 'Misma finalidad: scoring crediticio'
      },
      {
        id: 'EIPD-2024-002',
        tipo: 'EIPD',
        nombre: 'Evaluación Impacto - Sistema Marketing',
        descripcion: 'EIPD para campañas publicitarias',
        estado: 'completed',
        progreso: 100,
        fechaCreacion: '2024-08-20',
        responsable: 'María López (DPO)',
        compatible: false,
        razon_compatible: 'Finalidad diferente: marketing vs scoring'
      },
      {
        id: 'DPIA-2024-001',
        tipo: 'DPIA',
        nombre: 'Auditoría Algoritmos Scoring',
        descripcion: 'DPIA para decisiones automatizadas crediticias',
        estado: 'review',
        progreso: 85,
        fechaCreacion: '2024-08-22',
        responsable: 'Carlos Ruiz (Auditoría)',
        compatible: true,
        razon_compatible: 'Mismo algoritmo: scoring crediticio automático'
      },
      {
        id: 'DPIA-2024-002',
        tipo: 'DPIA',
        nombre: 'Auditoría Algoritmos Fraude',
        descripcion: 'DPIA para detección de fraudes',
        estado: 'draft',
        progreso: 30,
        fechaCreacion: '2024-08-18',
        responsable: 'Ana Torres (Auditoría)',
        compatible: false,
        razon_compatible: 'Algoritmo diferente: fraude vs scoring'
      },
      {
        id: 'DPA-2024-001',
        tipo: 'DPA',
        nombre: 'Contrato Dicom (Equifax Chile)',
        descripcion: 'DPA para datos crediticios nacionales',
        estado: 'signed',
        progreso: 100,
        fechaCreacion: '2024-08-15',
        responsable: 'Legal + DPO',
        compatible: true,
        razon_compatible: 'Mismo proveedor: Equifax para scoring'
      },
      {
        id: 'DPA-2024-003',
        tipo: 'DPA',
        nombre: 'Contrato AWS',
        descripcion: 'DPA para servicios cloud internacionales',
        estado: 'draft',
        progreso: 70,
        fechaCreacion: '2024-08-28',
        responsable: 'TI + Legal',
        compatible: true,
        razon_compatible: 'Mismo proveedor: AWS para infraestructura'
      }
    ];
    setDocumentosExistentes(docs);
  };

  // Simular carga de asociaciones actuales
  const cargarAsociacionesActuales = () => {
    const asociaciones = [
      {
        ratId: 'RAT-EJEMPLO',
        documentoId: 'EIPD-2024-001',
        tipo: 'EIPD',
        estado_asociacion: 'auto_detectada',
        fecha_asociacion: '2024-08-28 09:02',
        confianza: 95,
        puede_cambiar: true
      },
      {
        ratId: 'RAT-EJEMPLO', 
        documentoId: 'DPIA-2024-001',
        tipo: 'DPIA',
        estado_asociacion: 'manual',
        fecha_asociacion: '2024-08-29 14:30',
        confianza: 100,
        puede_cambiar: true
      },
      {
        ratId: 'RAT-EJEMPLO',
        documentoId: 'DPA-2024-001',
        tipo: 'DPA',
        estado_asociacion: 'auto_detectada',
        fecha_asociacion: '2024-08-28 09:02',
        confianza: 90,
        puede_cambiar: true
      }
    ];
    setDocumentosAsociados(asociaciones);
  };

  const abrirDialogoAsociacion = (tipo) => {
    setTipoDocumento(tipo);
    setShowAssociationDialog(true);
  };

  const asociarDocumento = (documento) => {
    const nuevaAsociacion = {
      ratId: ratId,
      documentoId: documento.id,
      tipo: documento.tipo,
      estado_asociacion: 'manual',
      fecha_asociacion: new Date().toISOString(),
      confianza: 100,
      puede_cambiar: true
    };

    // Remover asociación existente del mismo tipo
    const asociacionesFiltradas = documentosAsociados.filter(a => a.tipo !== documento.tipo);
    setDocumentosAsociados([...asociacionesFiltradas, nuevaAsociacion]);
    
    setShowAssociationDialog(false);
    alert(`✅ ${documento.tipo} "${documento.nombre}" asociado correctamente al ${ratId}`);
  };

  const desasociarDocumento = (asociacion) => {
    const confirmacion = window.confirm(
      `¿Desea desasociar el ${asociacion.tipo} del ${ratId}?\n\nEsto NO eliminará el documento, solo quitará la asociación.`
    );
    
    if (confirmacion) {
      const nuevasAsociaciones = documentosAsociados.filter(a => a.documentoId !== asociacion.documentoId);
      setDocumentosAsociados(nuevasAsociaciones);
      alert(`🔗 ${asociacion.tipo} desasociado del ${ratId}`);
    }
  };

  const crearNuevoDocumento = (tipo) => {
    alert(`🆕 Creando nuevo ${tipo}...\n\n1. Se abre el editor del ${tipo}\n2. Se pre-llena con datos del ${ratId}\n3. Se asocia automáticamente al crearse`);
    setShowAssociationDialog(false);
  };

  const getIconByType = (tipo) => {
    switch(tipo) {
      case 'EIPD': return <EIPDIcon />;
      case 'DPA': return <DPAIcon />;
      case 'DPIA': return <DPIAIcon />;
      default: return <RATIcon />;
    }
  };

  const getColorByCompatibility = (compatible) => {
    return compatible ? 'success' : 'warning';
  };

  const documentosFiltrados = documentosExistentes.filter(doc => 
    (!tipoDocumento || doc.tipo === tipoDocumento) &&
    (!busqueda || doc.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
     doc.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const getAsociacionInfo = (tipo) => {
    return documentosAsociados.find(a => a.tipo === tipo);
  };

  const getDocumentoAsociado = (tipo) => {
    const asociacion = getAsociacionInfo(tipo);
    return asociacion ? documentosExistentes.find(d => d.id === asociacion.documentoId) : null;
  };

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            🔗 GESTIÓN DE ASOCIACIONES - {ratId}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Asocia, cambia o crea documentos EIPD/DPIA/DPA para este RAT
          </Typography>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            {/* EIPD */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    <EIPDIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    EIPD
                  </Typography>
                  {getAsociacionInfo('EIPD') && (
                    <Chip 
                      label="ASOCIADA" 
                      color="success" 
                      size="small"
                      icon={<CheckIcon />}
                    />
                  )}
                </Box>

                {getDocumentoAsociado('EIPD') ? (
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {getDocumentoAsociado('EIPD').nombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getDocumentoAsociado('EIPD').descripcion}
                    </Typography>
                    <Box display="flex" gap={1} mt={2}>
                      <Button 
                        size="small" 
                        startIcon={<EditIcon />}
                        onClick={() => abrirDialogoAsociacion('EIPD')}
                      >
                        Cambiar
                      </Button>
                      <Button 
                        size="small" 
                        color="error"
                        startIcon={<UnlinkIcon />}
                        onClick={() => desasociarDocumento(getAsociacionInfo('EIPD'))}
                      >
                        Desasociar
                      </Button>
                    </Box>
                    
                    <Alert severity="info" sx={{ mt: 2, fontSize: '0.75rem' }}>
                      <Typography variant="caption">
                        {getAsociacionInfo('EIPD').estado_asociacion === 'auto_detectada' ? 
                          `🤖 Asociación automática (${getAsociacionInfo('EIPD').confianza}% confianza)` :
                          '👤 Asociación manual'
                        }
                      </Typography>
                    </Alert>
                  </Box>
                ) : (
                  <Box>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      <Typography variant="caption">
                        No hay EIPD asociada a este RAT
                      </Typography>
                    </Alert>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      startIcon={<LinkIcon />}
                      onClick={() => abrirDialogoAsociacion('EIPD')}
                    >
                      Asociar EIPD
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* DPIA */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    <DPIAIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    DPIA
                  </Typography>
                  {getAsociacionInfo('DPIA') && (
                    <Chip 
                      label="ASOCIADA" 
                      color="success" 
                      size="small"
                      icon={<CheckIcon />}
                    />
                  )}
                </Box>

                {getDocumentoAsociado('DPIA') ? (
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {getDocumentoAsociado('DPIA').nombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getDocumentoAsociado('DPIA').descripcion}
                    </Typography>
                    <Box display="flex" gap={1} mt={2}>
                      <Button 
                        size="small" 
                        startIcon={<EditIcon />}
                        onClick={() => abrirDialogoAsociacion('DPIA')}
                      >
                        Cambiar
                      </Button>
                      <Button 
                        size="small" 
                        color="error"
                        startIcon={<UnlinkIcon />}
                        onClick={() => desasociarDocumento(getAsociacionInfo('DPIA'))}
                      >
                        Desasociar
                      </Button>
                    </Box>
                    
                    <Alert severity="info" sx={{ mt: 2, fontSize: '0.75rem' }}>
                      <Typography variant="caption">
                        {getAsociacionInfo('DPIA').estado_asociacion === 'auto_detectada' ? 
                          `🤖 Asociación automática (${getAsociacionInfo('DPIA').confianza}% confianza)` :
                          '👤 Asociación manual'
                        }
                      </Typography>
                    </Alert>
                  </Box>
                ) : (
                  <Box>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      <Typography variant="caption">
                        No hay DPIA asociada a este RAT
                      </Typography>
                    </Alert>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      startIcon={<LinkIcon />}
                      onClick={() => abrirDialogoAsociacion('DPIA')}
                    >
                      Asociar DPIA
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* DPA */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    <DPAIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    DPA
                  </Typography>
                  {getAsociacionInfo('DPA') && (
                    <Chip 
                      label="ASOCIADA" 
                      color="success" 
                      size="small"
                      icon={<CheckIcon />}
                    />
                  )}
                </Box>

                {getDocumentoAsociado('DPA') ? (
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {getDocumentoAsociado('DPA').nombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getDocumentoAsociado('DPA').descripcion}
                    </Typography>
                    <Box display="flex" gap={1} mt={2}>
                      <Button 
                        size="small" 
                        startIcon={<EditIcon />}
                        onClick={() => abrirDialogoAsociacion('DPA')}
                      >
                        Cambiar
                      </Button>
                      <Button 
                        size="small" 
                        color="error"
                        startIcon={<UnlinkIcon />}
                        onClick={() => desasociarDocumento(getAsociacionInfo('DPA'))}
                      >
                        Desasociar
                      </Button>
                    </Box>
                    
                    <Alert severity="info" sx={{ mt: 2, fontSize: '0.75rem' }}>
                      <Typography variant="caption">
                        {getAsociacionInfo('DPA').estado_asociacion === 'auto_detectada' ? 
                          `🤖 Asociación automática (${getAsociacionInfo('DPA').confianza}% confianza)` :
                          '👤 Asociación manual'
                        }
                      </Typography>
                    </Alert>
                  </Box>
                ) : (
                  <Box>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      <Typography variant="caption">
                        No hay DPA asociada a este RAT
                      </Typography>
                    </Alert>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      startIcon={<LinkIcon />}
                      onClick={() => abrirDialogoAsociacion('DPA')}
                    >
                      Asociar DPA
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2" fontWeight={600}>
              💡 CÓMO FUNCIONA LA ASOCIACIÓN:
            </Typography>
            <Typography variant="caption">
              • <strong>Automática:</strong> El sistema detecta documentos compatibles por finalidad, datos y proveedores<br/>
              • <strong>Manual:</strong> Puedes asociar cualquier documento existente o crear uno nuevo<br/>
              • <strong>Flexible:</strong> Cambiar o desasociar documentos en cualquier momento
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Dialog de Asociación */}
      <Dialog open={showAssociationDialog} onClose={() => setShowAssociationDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight={700}>
            {getIconByType(tipoDocumento)} Asociar {tipoDocumento} al {ratId}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {/* Busqueda */}
          <Box display="flex" gap={2} mb={3}>
            <TextField
              fullWidth
              label="Buscar documento"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1 }} />
              }}
            />
            <Button
              variant="contained"
              color="success"
              startIcon={<AddIcon />}
              onClick={() => crearNuevoDocumento(tipoDocumento)}
              sx={{ minWidth: 150 }}
            >
              Crear Nuevo
            </Button>
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              📋 Documentos {tipoDocumento} disponibles en el sistema. Los <strong style={{color: 'green'}}>compatibles</strong> tienen la misma finalidad/proveedor.
            </Typography>
          </Alert>

          <List>
            {documentosFiltrados.filter(doc => doc.tipo === tipoDocumento).map((documento) => (
              <ListItem 
                key={documento.id}
                sx={{ 
                  border: '1px solid',
                  borderColor: documento.compatible ? 'success.main' : 'warning.main',
                  borderRadius: 2,
                  mb: 1,
                  bgcolor: documento.compatible ? 'success.light' : 'warning.light'
                }}
              >
                <ListItemIcon>
                  {getIconByType(documento.tipo)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {documento.nombre}
                      </Typography>
                      <Chip 
                        label={documento.compatible ? 'COMPATIBLE' : 'DIFERENTE FINALIDAD'} 
                        color={getColorByCompatibility(documento.compatible)}
                        size="small"
                      />
                      <Chip 
                        label={`${documento.progreso}%`}
                        color={documento.progreso > 70 ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption">
                        {documento.descripcion}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        📅 {documento.fechaCreacion} • 👤 {documento.responsable} • {documento.estado.toUpperCase()}
                      </Typography>
                      <br />
                      <Typography variant="caption" color={documento.compatible ? 'success.main' : 'warning.main'}>
                        💡 {documento.razon_compatible}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => asociarDocumento(documento)}
                    startIcon={<LinkIcon />}
                  >
                    Asociar
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>

          {documentosFiltrados.filter(doc => doc.tipo === tipoDocumento).length === 0 && (
            <Alert severity="warning">
              <Typography variant="body2">
                No se encontraron documentos {tipoDocumento} en el sistema.
              </Typography>
              <Button
                variant="contained"
                color="success"
                startIcon={<AddIcon />}
                onClick={() => crearNuevoDocumento(tipoDocumento)}
                sx={{ mt: 2 }}
              >
                Crear Nuevo {tipoDocumento}
              </Button>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAssociationDialog(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AsociacionDocumentos;