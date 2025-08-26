import React, { useState, useEffect } from 'react';
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
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Tabs,
  Tab,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Dashboard,
  Assessment,
  Security,
  Warning,
  CheckCircle,
  Error,
  Schedule,
  Business,
  People,
  Storage,
  Language,
  Download,
  Visibility,
  Edit,
  Delete,
  Search,
  FilterList,
  PictureAsPdf,
  TableChart,
  Timeline,
  AccountTree,
  VerifiedUser,
  Update,
  Policy,
  Gavel,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import supabase, { supabaseWithTenant } from '../config/supabaseClient';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const ConsolidadoRAT = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rats, setRats] = useState([]);
  const [filteredRats, setFilteredRats] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedRAT, setSelectedRAT] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState({
    area: 'all',
    riesgo: 'all',
    estado: 'all',
    busqueda: ''
  });

  // Estadísticas del consolidado
  const [stats, setStats] = useState({
    totalRATs: 0,
    porArea: {},
    porRiesgo: { alto: 0, medio: 0, bajo: 0 },
    datosSensibles: 0,
    transferenciasInternacionales: 0,
    requierenDPIA: 0,
    proximosVencimiento: 0
  });

  useEffect(() => {
    cargarRATs();
  }, [user]);

  useEffect(() => {
    aplicarFiltros();
    calcularEstadisticas();
  }, [rats, filters]);

  const getCurrentTenant = () => {
    return user?.tenant_id || user?.organizacion_id || 'demo';
  };

  const cargarRATs = async () => {
    try {
      setLoading(true);
      const tenantId = getCurrentTenant();
      
      // Obtener todos los RATs del tenant
      const { data, error } = await supabaseWithTenant(tenantId)
        .from('mapeo_datos_rat')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRats(data || []);
    } catch (error) {
      console.error('Error al cargar RATs:', error);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let filtered = [...rats];

    // Filtro por área
    if (filters.area !== 'all') {
      filtered = filtered.filter(rat => rat.area_responsable === filters.area);
    }

    // Filtro por nivel de riesgo
    if (filters.riesgo !== 'all') {
      filtered = filtered.filter(rat => rat.nivel_riesgo === filters.riesgo);
    }

    // Filtro por estado
    if (filters.estado !== 'all') {
      filtered = filtered.filter(rat => rat.estado === filters.estado);
    }

    // Filtro por búsqueda
    if (filters.busqueda) {
      const searchLower = filters.busqueda.toLowerCase();
      filtered = filtered.filter(rat =>
        rat.nombre_actividad?.toLowerCase().includes(searchLower) ||
        rat.responsable_proceso?.toLowerCase().includes(searchLower) ||
        rat.finalidades?.some(f => f.toLowerCase().includes(searchLower))
      );
    }

    setFilteredRats(filtered);
  };

  const calcularEstadisticas = () => {
    const stats = {
      totalRATs: rats.length,
      porArea: {},
      porRiesgo: { alto: 0, medio: 0, bajo: 0 },
      datosSensibles: 0,
      transferenciasInternacionales: 0,
      requierenDPIA: 0,
      proximosVencimiento: 0
    };

    rats.forEach(rat => {
      // Por área
      stats.porArea[rat.area_responsable] = (stats.porArea[rat.area_responsable] || 0) + 1;

      // Por riesgo
      if (rat.nivel_riesgo) {
        stats.porRiesgo[rat.nivel_riesgo]++;
      }

      // Datos sensibles
      if (rat.datos_sensibles?.length > 0) {
        stats.datosSensibles++;
      }

      // Transferencias internacionales
      if (rat.transferencias_internacionales?.existe) {
        stats.transferenciasInternacionales++;
      }

      // Requieren DPIA
      if (rat.requiere_dpia) {
        stats.requierenDPIA++;
      }

      // Próximos a vencimiento (ejemplo: menos de 30 días)
      if (rat.plazo_conservacion) {
        // Aquí se podría calcular basado en la fecha de creación y el plazo
        // Por ahora es un placeholder
      }
    });

    setStats(stats);
  };

  // Función para determinar el color del chip según el nivel de riesgo
  const getRiesgoColor = (nivel) => {
    switch (nivel) {
      case 'alto': return 'error';
      case 'medio': return 'warning';
      case 'bajo': return 'success';
      default: return 'default';
    }
  };

  // Exportar consolidado a Excel
  const exportarConsolidadoExcel = () => {
    const wb = XLSX.utils.book_new();

    // Hoja 1: Resumen Ejecutivo
    const resumenData = [
      ['CONSOLIDADO DE REGISTRO DE ACTIVIDADES DE TRATAMIENTO (RAT)'],
      ['Empresa: ' + (user?.organizacion_nombre || 'Demo Company')],
      ['Fecha de generación: ' + new Date().toLocaleDateString('es-CL')],
      ['Total de RATs: ' + stats.totalRATs],
      [],
      ['RESUMEN POR ÁREA'],
      ...Object.entries(stats.porArea).map(([area, count]) => [area, count]),
      [],
      ['ANÁLISIS DE RIESGOS'],
      ['Riesgo Alto', stats.porRiesgo.alto],
      ['Riesgo Medio', stats.porRiesgo.medio],
      ['Riesgo Bajo', stats.porRiesgo.bajo],
      [],
      ['INDICADORES CRÍTICOS'],
      ['RATs con datos sensibles', stats.datosSensibles],
      ['RATs con transferencias internacionales', stats.transferenciasInternacionales],
      ['RATs que requieren DPIA', stats.requierenDPIA]
    ];

    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
    wsResumen['!cols'] = [{ wch: 40 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

    // Hoja 2: Detalle completo de RATs
    const detalleData = [
      ['ID', 'Nombre Actividad', 'Área', 'Responsable', 'Base Legal', 'Nivel Riesgo', 'Datos Sensibles', 'Transfer. Internacional', 'Requiere DPIA', 'Estado', 'Fecha Creación']
    ];

    rats.forEach(rat => {
      detalleData.push([
        rat.id || 'N/A',
        rat.nombre_actividad || 'Sin nombre',
        rat.area_responsable || 'Sin área',
        rat.responsable_proceso || 'Sin responsable',
        rat.base_licitud || 'Sin especificar',
        rat.nivel_riesgo || 'bajo',
        rat.datos_sensibles?.length > 0 ? 'Sí' : 'No',
        rat.transferencias_internacionales?.existe ? 'Sí' : 'No',
        rat.requiere_dpia ? 'Sí' : 'No',
        rat.estado || 'borrador',
        rat.created_at ? new Date(rat.created_at).toLocaleDateString('es-CL') : 'N/A'
      ]);
    });

    const wsDetalle = XLSX.utils.aoa_to_sheet(detalleData);
    wsDetalle['!cols'] = [
      { wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 20 },
      { wch: 20 }, { wch: 12 }, { wch: 15 }, { wch: 20 },
      { wch: 15 }, { wch: 12 }, { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(wb, wsDetalle, 'Detalle RATs');

    // Hoja 3: Matriz de Cumplimiento
    const matrizData = [
      ['MATRIZ DE CUMPLIMIENTO LPDP'],
      [],
      ['Requisito Legal', 'Cumplimiento', 'Observaciones'],
      ['Registro de Actividades de Tratamiento (RAT)', stats.totalRATs > 0 ? 'Sí' : 'No', `${stats.totalRATs} RATs documentados`],
      ['Identificación de datos sensibles', stats.datosSensibles > 0 ? 'Sí' : 'No', `${stats.datosSensibles} RATs con datos sensibles`],
      ['Evaluación de riesgos', 'Sí', `${stats.porRiesgo.alto} de alto riesgo identificados`],
      ['DPIAs requeridas', stats.requierenDPIA > 0 ? 'Parcial' : 'No', `${stats.requierenDPIA} RATs requieren DPIA`],
      ['Control de transferencias internacionales', stats.transferenciasInternacionales > 0 ? 'Sí' : 'No', `${stats.transferenciasInternacionales} RATs con transferencias`]
    ];

    const wsMatriz = XLSX.utils.aoa_to_sheet(matrizData);
    wsMatriz['!cols'] = [{ wch: 40 }, { wch: 15 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, wsMatriz, 'Matriz Cumplimiento');

    // Guardar archivo
    XLSX.writeFile(wb, `Consolidado_RAT_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Exportar consolidado a PDF
  const exportarConsolidadoPDF = () => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text('Consolidado RAT - Sistema LPDP', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Empresa: ${user?.organizacion_nombre || 'Demo Company'}`, 20, 30);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, 20, 37);
    
    // Resumen ejecutivo
    let yPos = 50;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('RESUMEN EJECUTIVO', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    
    yPos += 10;
    doc.text(`Total de RATs registrados: ${stats.totalRATs}`, 25, yPos);
    yPos += 7;
    doc.text(`RATs con datos sensibles: ${stats.datosSensibles}`, 25, yPos);
    yPos += 7;
    doc.text(`RATs con transferencias internacionales: ${stats.transferenciasInternacionales}`, 25, yPos);
    yPos += 7;
    doc.text(`RATs que requieren DPIA: ${stats.requierenDPIA}`, 25, yPos);

    // Análisis de riesgos
    yPos += 15;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('ANÁLISIS DE RIESGOS', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    
    yPos += 10;
    doc.text(`Alto riesgo: ${stats.porRiesgo.alto} RATs`, 25, yPos);
    yPos += 7;
    doc.text(`Riesgo medio: ${stats.porRiesgo.medio} RATs`, 25, yPos);
    yPos += 7;
    doc.text(`Bajo riesgo: ${stats.porRiesgo.bajo} RATs`, 25, yPos);

    // Tabla de RATs
    doc.addPage();
    doc.setFontSize(14);
    doc.text('DETALLE DE RATS', 20, 20);

    const tableData = rats.map(rat => [
      rat.nombre_actividad?.substring(0, 30) || 'Sin nombre',
      rat.area_responsable || 'N/A',
      rat.nivel_riesgo || 'bajo',
      rat.requiere_dpia ? 'Sí' : 'No'
    ]);

    doc.autoTable({
      head: [['Actividad', 'Área', 'Riesgo', 'DPIA']],
      body: tableData,
      startY: 30,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [66, 66, 144] }
    });

    // Guardar PDF
    doc.save(`Consolidado_RAT_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Componente de tarjeta de estadística
  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          Consolidado de Registro de Actividades de Tratamiento (RAT)
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Visión global de todos los tratamientos de datos personales de la organización según Ley 21.719
        </Typography>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : (
        <>
          {/* Estadísticas generales */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total RATs"
                value={stats.totalRATs}
                icon={<Assessment />}
                color="primary.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Datos Sensibles"
                value={stats.datosSensibles}
                icon={<Security />}
                color="error.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Transfer. Internacional"
                value={stats.transferenciasInternacionales}
                icon={<Language />}
                color="warning.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Requieren DPIA"
                value={stats.requierenDPIA}
                icon={<VerifiedUser />}
                color="info.main"
              />
            </Grid>
          </Grid>

          {/* Tabs de navegación */}
          <Paper sx={{ mb: 3 }}>
            <Tabs value={selectedTab} onChange={(e, v) => setSelectedTab(v)}>
              <Tab label="Vista General" icon={<Dashboard />} />
              <Tab label="Por Área" icon={<Business />} />
              <Tab label="Análisis de Riesgos" icon={<Warning />} />
              <Tab label="Cumplimiento" icon={<Policy />} />
            </Tabs>
          </Paper>

          {/* Filtros */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Área</InputLabel>
                  <Select
                    value={filters.area}
                    onChange={(e) => setFilters({ ...filters, area: e.target.value })}
                    label="Área"
                  >
                    <MenuItem value="all">Todas las áreas</MenuItem>
                    {Object.keys(stats.porArea).map(area => (
                      <MenuItem key={area} value={area}>{area}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Nivel de Riesgo</InputLabel>
                  <Select
                    value={filters.riesgo}
                    onChange={(e) => setFilters({ ...filters, riesgo: e.target.value })}
                    label="Nivel de Riesgo"
                  >
                    <MenuItem value="all">Todos los niveles</MenuItem>
                    <MenuItem value="alto">Alto</MenuItem>
                    <MenuItem value="medio">Medio</MenuItem>
                    <MenuItem value="bajo">Bajo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Buscar"
                  value={filters.busqueda}
                  onChange={(e) => setFilters({ ...filters, busqueda: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Box display="flex" gap={1}>
                  <Tooltip title="Exportar a Excel">
                    <IconButton onClick={exportarConsolidadoExcel} color="primary">
                      <TableChart />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Exportar a PDF">
                    <IconButton onClick={exportarConsolidadoPDF} color="primary">
                      <PictureAsPdf />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Contenido según tab seleccionado */}
          {selectedTab === 0 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Actividad</TableCell>
                    <TableCell>Área</TableCell>
                    <TableCell>Responsable</TableCell>
                    <TableCell>Riesgo</TableCell>
                    <TableCell>Sensible</TableCell>
                    <TableCell>Transfer. Int.</TableCell>
                    <TableCell>DPIA</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRats.map((rat) => (
                    <TableRow key={rat.id}>
                      <TableCell>{rat.id?.substring(0, 8)}...</TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {rat.nombre_actividad}
                        </Typography>
                      </TableCell>
                      <TableCell>{rat.area_responsable}</TableCell>
                      <TableCell>{rat.responsable_proceso}</TableCell>
                      <TableCell>
                        <Chip
                          label={rat.nivel_riesgo}
                          color={getRiesgoColor(rat.nivel_riesgo)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {rat.datos_sensibles?.length > 0 ? (
                          <CheckCircle color="error" />
                        ) : (
                          <Typography color="textSecondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {rat.transferencias_internacionales?.existe ? (
                          <CheckCircle color="warning" />
                        ) : (
                          <Typography color="textSecondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {rat.requiere_dpia ? (
                          <CheckCircle color="info" />
                        ) : (
                          <Typography color="textSecondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={rat.estado || 'borrador'}
                          color={rat.estado === 'aprobado' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Ver detalles">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedRAT(rat);
                              setShowDetails(true);
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {selectedTab === 1 && (
            <Grid container spacing={3}>
              {Object.entries(stats.porArea).map(([area, count]) => (
                <Grid item xs={12} md={4} key={area}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="h6">{area}</Typography>
                          <Typography variant="h3" color="primary">{count}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            RATs registrados
                          </Typography>
                        </Box>
                        <Business sx={{ fontSize: 48, color: 'action.disabled' }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {selectedTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Distribución de Riesgos
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <Error color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Alto Riesgo: ${stats.porRiesgo.alto} RATs`}
                        secondary="Requieren medidas de seguridad reforzadas y posible DPIA"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Warning color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Riesgo Medio: ${stats.porRiesgo.medio} RATs`}
                        secondary="Requieren medidas de seguridad estándar"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Bajo Riesgo: ${stats.porRiesgo.bajo} RATs`}
                        secondary="Medidas de seguridad básicas"
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    {stats.requierenDPIA} RATs requieren Evaluación de Impacto (DPIA)
                  </Typography>
                </Alert>
                <Alert severity="info">
                  <Typography variant="body2">
                    {stats.datosSensibles} RATs procesan datos sensibles según Art. 2 lit. g
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          )}

          {selectedTab === 3 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Matriz de Cumplimiento LPDP
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Requisito</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Observaciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Registro de Actividades de Tratamiento (RAT)</TableCell>
                    <TableCell>
                      <Chip
                        label={stats.totalRATs > 0 ? "Cumple" : "No cumple"}
                        color={stats.totalRATs > 0 ? "success" : "error"}
                      />
                    </TableCell>
                    <TableCell>{stats.totalRATs} RATs documentados</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Identificación de datos sensibles</TableCell>
                    <TableCell>
                      <Chip
                        label={stats.datosSensibles > 0 ? "Identificados" : "Sin identificar"}
                        color={stats.datosSensibles > 0 ? "success" : "warning"}
                      />
                    </TableCell>
                    <TableCell>{stats.datosSensibles} RATs con datos sensibles</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Evaluación de riesgos</TableCell>
                    <TableCell>
                      <Chip label="Completo" color="success" />
                    </TableCell>
                    <TableCell>Todos los RATs tienen nivel de riesgo asignado</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Control de transferencias internacionales</TableCell>
                    <TableCell>
                      <Chip
                        label={stats.transferenciasInternacionales > 0 ? "Documentadas" : "N/A"}
                        color="info"
                      />
                    </TableCell>
                    <TableCell>{stats.transferenciasInternacionales} transferencias identificadas</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>
          )}

          {/* Diálogo de detalles */}
          <Dialog
            open={showDetails}
            onClose={() => setShowDetails(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              Detalles del RAT: {selectedRAT?.nombre_actividad}
            </DialogTitle>
            <DialogContent>
              {selectedRAT && (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Información General</strong>
                    </Typography>
                    <Typography>ID: {selectedRAT.id}</Typography>
                    <Typography>Área: {selectedRAT.area_responsable}</Typography>
                    <Typography>Responsable: {selectedRAT.responsable_proceso}</Typography>
                    <Typography>Base Legal: {selectedRAT.base_licitud}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Finalidades</strong>
                    </Typography>
                    <Typography>{selectedRAT.finalidades?.join(', ')}</Typography>
                  </Grid>
                  {selectedRAT.datos_sensibles?.length > 0 && (
                    <Grid item xs={12}>
                      <Alert severity="warning">
                        Incluye datos sensibles: {selectedRAT.datos_sensibles.join(', ')}
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowDetails(false)}>Cerrar</Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Container>
  );
};

export default ConsolidadoRAT;