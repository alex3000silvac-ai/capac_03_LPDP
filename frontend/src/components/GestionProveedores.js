// 🤝 MÓDULO GESTIÓN DE PROVEEDORES Y DPAs
// Implementación según Plan Estratégico - Fase 2
// Gestión de Encargados de Tratamiento - Ley 21.719

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
  Badge,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Download,
  Upload,
  Business,
  Assignment,
  Warning,
  CheckCircle,
  Schedule,
  Security,
  Gavel,
  CloudUpload,
  Assessment,
  ExpandMore,
  ContentCopy,
  Email,
  Phone,
  Language,
  LocationOn
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const GestionProveedores = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [proveedores, setProveedores] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState('add'); // 'add', 'edit', 'view', 'dpa'
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [newProveedor, setNewProveedor] = useState({
    id: `prov_${Date.now()}`,
    nombre: '',
    razon_social: '',
    rut: '',
    contacto_principal: {
      nombre: '',
      email: '',
      telefono: '',
      cargo: ''
    },
    contacto_dpo: {
      nombre: '',
      email: '',
      telefono: ''
    },
    direccion: {
      calle: '',
      ciudad: '',
      region: '',
      pais: 'Chile'
    },
    categoria_proveedor: 'tecnologia', // 'tecnologia', 'consultoria', 'marketing', 'cloud', 'otros'
    servicios_prestados: [],
    datos_tratados: [],
    ubicacion_datos: 'chile', // 'chile', 'extranjero', 'mixta'
    transferencias_internacionales: false,
    paises_transferencia: [],
    dpa_info: {
      firmado: false,
      fecha_firma: '',
      vigencia_inicio: '',
      vigencia_fin: '',
      version: '1.0',
      clausulas_especiales: [],
      requiere_renovacion: false,
      dias_vencimiento: 0
    },
    evaluacion_seguridad: {
      realizada: false,
      fecha_evaluacion: '',
      puntuacion: 0, // 0-100
      nivel_riesgo: 'bajo', // 'bajo', 'medio', 'alto'
      certificaciones: [],
      observaciones: ''
    },
    estado: 'activo', // 'activo', 'suspendido', 'terminado'
    created_by: user?.id || 'demo_user',
    tenant_id: user?.organizacion_id || 'demo',
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  });

  const [stats, setStats] = useState({
    total_proveedores: 0,
    con_dpa_firmado: 0,
    sin_dpa: 0,
    proximos_vencer: 0,
    evaluaciones_pendientes: 0,
    alto_riesgo: 0
  });

  // Datos de ejemplo para demostración
  useEffect(() => {
    const proveedoresDemo = [
      {
        id: 'prov_001',
        nombre: 'AWS Chile',
        razon_social: 'Amazon Web Services Chile SpA',
        rut: '77.777.777-7',
        categoria_proveedor: 'cloud',
        servicios_prestados: ['Hosting', 'Base de datos', 'Backup'],
        ubicacion_datos: 'extranjero',
        transferencias_internacionales: true,
        paises_transferencia: ['Estados Unidos', 'Irlanda'],
        dpa_info: {
          firmado: true,
          fecha_firma: '2024-01-15',
          vigencia_fin: '2025-01-15',
          version: '2.1',
          requiere_renovacion: false,
          dias_vencimiento: 120
        },
        evaluacion_seguridad: {
          realizada: true,
          fecha_evaluacion: '2024-02-01',
          puntuacion: 95,
          nivel_riesgo: 'bajo',
          certificaciones: ['ISO 27001', 'SOC 2', 'PCI DSS']
        },
        estado: 'activo'
      },
      {
        id: 'prov_002', 
        nombre: 'Mailchimp',
        razon_social: 'The Rocket Science Group LLC',
        rut: 'EXT-001',
        categoria_proveedor: 'marketing',
        servicios_prestados: ['Email Marketing', 'Automatización'],
        ubicacion_datos: 'extranjero',
        transferencias_internacionales: true,
        paises_transferencia: ['Estados Unidos'],
        dpa_info: {
          firmado: false,
          requiere_renovacion: true,
          dias_vencimiento: -30 // Vencido
        },
        evaluacion_seguridad: {
          realizada: false,
          nivel_riesgo: 'medio'
        },
        estado: 'activo'
      },
      {
        id: 'prov_003',
        nombre: 'Defontana',
        razon_social: 'Defontana SpA',
        rut: '88.888.888-8', 
        categoria_proveedor: 'tecnologia',
        servicios_prestados: ['Sistema RRHH', 'Nóminas'],
        ubicacion_datos: 'chile',
        transferencias_internacionales: false,
        dpa_info: {
          firmado: true,
          fecha_firma: '2024-03-01',
          vigencia_fin: '2025-03-01',
          version: '1.0',
          dias_vencimiento: 155
        },
        evaluacion_seguridad: {
          realizada: true,
          puntuacion: 78,
          nivel_riesgo: 'bajo'
        },
        estado: 'activo'
      }
    ];
    
    setProveedores(proveedoresDemo);
    
    // Calcular estadísticas
    const stats = {
      total_proveedores: proveedoresDemo.length,
      con_dpa_firmado: proveedoresDemo.filter(p => p.dpa_info.firmado).length,
      sin_dpa: proveedoresDemo.filter(p => !p.dpa_info.firmado).length,
      proximos_vencer: proveedoresDemo.filter(p => p.dpa_info.dias_vencimiento < 90 && p.dpa_info.dias_vencimiento > 0).length,
      evaluaciones_pendientes: proveedoresDemo.filter(p => !p.evaluacion_seguridad.realizada).length,
      alto_riesgo: proveedoresDemo.filter(p => p.evaluacion_seguridad.nivel_riesgo === 'alto').length
    };
    setStats(stats);
  }, []);

  const handleAddProveedor = () => {
    setDialogType('add');
    setNewProveedor({
      ...newProveedor,
      id: `prov_${Date.now()}`
    });
    setShowDialog(true);
  };

  const handleSaveProveedor = () => {
    if (dialogType === 'add') {
      setProveedores([...proveedores, newProveedor]);
    } else if (dialogType === 'edit') {
      setProveedores(proveedores.map(p => 
        p.id === newProveedor.id ? newProveedor : p
      ));
    }
    setShowDialog(false);
    // Reset form
    setNewProveedor({
      ...newProveedor,
      id: `prov_${Date.now()}`,
      nombre: '',
      razon_social: '',
      rut: ''
    });
  };

  const getRiskColor = (riesgo) => {
    switch (riesgo) {
      case 'alto': return 'error';
      case 'medio': return 'warning'; 
      case 'bajo': return 'success';
      default: return 'default';
    }
  };

  const generateDPATemplate = (proveedor) => {
    return `
ANEXO DE PROTECCIÓN DE DATOS PERSONALES (DPA)
Entre ${user?.organizacion_nombre || 'MI EMPRESA'} y ${proveedor.nombre}

1. OBJETO Y DURACIÓN
El presente anexo regula el tratamiento de datos personales que ${proveedor.nombre} 
realizará por cuenta de ${user?.organizacion_nombre || 'MI EMPRESA'} según Ley 21.719.

2. CATEGORÍAS DE DATOS
- ${proveedor.datos_tratados?.join('\n- ') || 'A definir'}

3. OBLIGACIONES DEL ENCARGADO
- Tratar los datos únicamente según instrucciones documentadas
- Garantizar confidencialidad del personal autorizado
- Implementar medidas técnicas y organizativas apropiadas
- Asistir al responsable en el cumplimiento de obligaciones

4. TRANSFERENCIAS INTERNACIONALES
${proveedor.transferencias_internacionales 
  ? `Se autoriza transferencia a: ${proveedor.paises_transferencia?.join(', ')}`
  : 'No se autorizan transferencias fuera de Chile'
}

5. DURACIÓN
Vigente desde ${new Date().toLocaleDateString('es-CL')} hasta finalización del contrato principal.

Firmado digitalmente el ${new Date().toLocaleDateString('es-CL')}
    `;
  };

  const renderProveedoresTab = () => (
    <Box>
      {/* Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">{stats.total_proveedores}</Typography>
              <Typography variant="body2">Total Proveedores</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">{stats.con_dpa_firmado}</Typography>
              <Typography variant="body2">DPA Firmados</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">{stats.sin_dpa}</Typography>
              <Typography variant="body2">Sin DPA</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">{stats.proximos_vencer}</Typography>
              <Typography variant="body2">Próx. Vencer</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">{stats.evaluaciones_pendientes}</Typography>
              <Typography variant="body2">Eval. Pendientes</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">{stats.alto_riesgo}</Typography>
              <Typography variant="body2">Alto Riesgo</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Botón Agregar */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddProveedor}
        >
          Agregar Proveedor
        </Button>
      </Box>

      {/* Tabla de proveedores */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Proveedor</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Ubicación Datos</TableCell>
              <TableCell>Estado DPA</TableCell>
              <TableCell>Riesgo</TableCell>
              <TableCell>Vencimiento</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {proveedores.map((proveedor) => (
              <TableRow key={proveedor.id}>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {proveedor.nombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {proveedor.rut}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={proveedor.categoria_proveedor} 
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <LocationOn 
                      fontSize="small" 
                      color={proveedor.ubicacion_datos === 'chile' ? 'success' : 'warning'} 
                    />
                    <Typography variant="body2" sx={{ ml: 0.5 }}>
                      {proveedor.ubicacion_datos === 'chile' ? 'Chile' : 
                       proveedor.ubicacion_datos === 'extranjero' ? 'Extranjero' : 'Mixta'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={proveedor.dpa_info.firmado ? 'Firmado' : 'Pendiente'}
                    color={proveedor.dpa_info.firmado ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={proveedor.evaluacion_seguridad.nivel_riesgo?.toUpperCase() || 'NO EVAL.'}
                    color={getRiskColor(proveedor.evaluacion_seguridad.nivel_riesgo)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {proveedor.dpa_info.firmado && proveedor.dpa_info.dias_vencimiento ? (
                    <Box>
                      <Typography 
                        variant="body2"
                        color={proveedor.dpa_info.dias_vencimiento < 90 ? 'error' : 'text.primary'}
                      >
                        {proveedor.dpa_info.dias_vencimiento > 0 
                          ? `${proveedor.dpa_info.dias_vencimiento} días`
                          : 'VENCIDO'
                        }
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">N/A</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <IconButton size="small" title="Ver detalles">
                    <Visibility />
                  </IconButton>
                  <IconButton size="small" title="Editar">
                    <Edit />
                  </IconButton>
                  <IconButton size="small" title="Generar DPA">
                    <Assignment />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderDPATemplatesTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        📄 Plantillas DPA Predefinidas
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🌐 Servicios Cloud (AWS, Azure, GCP)
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Plantilla estándar para proveedores de servicios en la nube con 
                transferencias internacionales y garantías CCT.
              </Typography>
              <Button variant="outlined" startIcon={<Download />}>
                Descargar Plantilla
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📧 Marketing Digital (Mailchimp, HubSpot)
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Plantilla para proveedores de email marketing y automatización 
                con tratamiento de datos de marketing.
              </Typography>
              <Button variant="outlined" startIcon={<Download />}>
                Descargar Plantilla
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                👥 Sistemas RRHH (Defontana, BambooHR)
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Plantilla para sistemas de recursos humanos con datos 
                sensibles de empleados y nóminas.
              </Typography>
              <Button variant="outlined" startIcon={<Download />}>
                Descargar Plantilla
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🏢 Servicios Locales (Chile)
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Plantilla básica para proveedores chilenos sin transferencias 
                internacionales.
              </Typography>
              <Button variant="outlined" startIcon={<Download />}>
                Descargar Plantilla
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          💡 <strong>Consejo Legal:</strong> Todas las plantillas están basadas en la Ley 21.719 
          y mejores prácticas internacionales. Recomendamos revisar con asesoría legal antes de firmar.
        </Typography>
      </Alert>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          🤝 Gestión de Proveedores y DPAs
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestión de Encargados de Tratamiento según Art. 25-26 Ley 21.719
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab 
            label={
              <Badge badgeContent={stats.sin_dpa} color="error">
                Proveedores
              </Badge>
            } 
          />
          <Tab label="Plantillas DPA" />
          <Tab label="Evaluaciones" />
          <Tab label="Reportes" />
        </Tabs>
      </Box>

      {/* Contenido de tabs */}
      {tabValue === 0 && renderProveedoresTab()}
      {tabValue === 1 && renderDPATemplatesTab()}
      {tabValue === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>🔍 Evaluaciones de Seguridad</Typography>
          
          <Grid container spacing={3}>
            {proveedores.map((proveedor) => (
              <Grid item xs={12} md={6} key={proveedor.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {proveedor.nombre}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Evaluación de Seguridad
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={proveedor.evaluacion_seguridad.puntuacion || 0}
                        color={getRiskColor(proveedor.evaluacion_seguridad.nivel_riesgo)}
                        sx={{ height: 8, borderRadius: 4, mt: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {proveedor.evaluacion_seguridad.puntuacion || 0}/100 puntos
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip 
                        label={`Riesgo ${proveedor.evaluacion_seguridad.nivel_riesgo || 'No evaluado'}`}
                        color={getRiskColor(proveedor.evaluacion_seguridad.nivel_riesgo)}
                        size="small"
                      />
                      {proveedor.evaluacion_seguridad.realizada && (
                        <Chip 
                          label="Evaluado"
                          color="success"
                          size="small"
                        />
                      )}
                    </Box>

                    {proveedor.evaluacion_seguridad.certificaciones?.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" fontWeight={600}>
                          Certificaciones:
                        </Typography>
                        {proveedor.evaluacion_seguridad.certificaciones.map((cert, idx) => (
                          <Chip 
                            key={idx}
                            label={cert}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    )}

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Última evaluación: {proveedor.evaluacion_seguridad.fecha_evaluacion || 'No evaluado'}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Assessment />}
                        onClick={() => {
                          alert(`Iniciando evaluación de seguridad para ${proveedor.nombre}\n\nCuestionario incluye:\n- Medidas técnicas\n- Medidas organizativas\n- Certificaciones\n- Políticas de seguridad\n- Gestión de incidentes`);
                        }}
                      >
                        {proveedor.evaluacion_seguridad.realizada ? 'Reevaluar' : 'Evaluar'}
                      </Button>
                      <Button
                        variant="text"
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => {
                          alert(`Detalle evaluación ${proveedor.nombre}:\n\nPuntuación: ${proveedor.evaluacion_seguridad.puntuacion || 0}/100\nNivel de riesgo: ${proveedor.evaluacion_seguridad.nivel_riesgo || 'No evaluado'}\nObservaciones: ${proveedor.evaluacion_seguridad.observaciones || 'Ninguna'}`);
                        }}
                      >
                        Ver Detalles
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Alert severity="warning" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>⚠️ Recomendación Legal:</strong> Realice evaluaciones de seguridad periódicas 
              a todos los encargados de tratamiento. La Ley 21.719 exige que el responsable se 
              asegure de que los encargados implementen medidas técnicas y organizativas apropiadas.
            </Typography>
          </Alert>
        </Box>
      )}
      {tabValue === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>📊 Reportes de Compliance</Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <VerifiedUser sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                  <Typography variant="h4" color="success.main">
                    {stats.con_dpa_firmado}
                  </Typography>
                  <Typography variant="body1">
                    Proveedores con DPA
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stats.total_proveedores > 0 ? Math.round((stats.con_dpa_firmado / stats.total_proveedores) * 100) : 0}% del total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Warning sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                  <Typography variant="h4" color="warning.main">
                    {stats.sin_dpa}
                  </Typography>
                  <Typography variant="body1">
                    Sin DPA Firmado
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Requieren acción inmediata
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Schedule sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
                  <Typography variant="h4" color="error.main">
                    {stats.proximos_vencer}
                  </Typography>
                  <Typography variant="body1">
                    Próximos a Vencer
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Menos de 90 días
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Estado de Cumplimiento por Proveedor
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Proveedor</TableCell>
                        <TableCell>DPA Status</TableCell>
                        <TableCell>Evaluación Seguridad</TableCell>
                        <TableCell>Transferencias Int.</TableCell>
                        <TableCell>Riesgo Global</TableCell>
                        <TableCell>Acciones Requeridas</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {proveedores.map((proveedor) => (
                        <TableRow key={proveedor.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {proveedor.nombre}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={proveedor.dpa_info.firmado ? 'Firmado' : 'Pendiente'}
                              color={proveedor.dpa_info.firmado ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={proveedor.evaluacion_seguridad.realizada ? 'Evaluado' : 'Pendiente'}
                              color={proveedor.evaluacion_seguridad.realizada ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={proveedor.transferencias_internacionales ? 'Sí' : 'No'}
                              color={proveedor.transferencias_internacionales ? 'info' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={proveedor.evaluacion_seguridad.nivel_riesgo?.toUpperCase() || 'N/A'}
                              color={getRiskColor(proveedor.evaluacion_seguridad.nivel_riesgo)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {!proveedor.dpa_info.firmado && (
                                <Chip label="Firmar DPA" color="error" size="small" />
                              )}
                              {!proveedor.evaluacion_seguridad.realizada && (
                                <Chip label="Evaluar" color="warning" size="small" />
                              )}
                              {proveedor.dpa_info.dias_vencimiento < 90 && proveedor.dpa_info.dias_vencimiento > 0 && (
                                <Chip label="Renovar" color="info" size="small" />
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={() => {
                    const reporte = `REPORTE DE CUMPLIMIENTO - PROVEEDORES
===================================

Empresa: ${user?.organizacion_nombre || 'Demo Company'}
Fecha: ${new Date().toLocaleDateString('es-CL')}

RESUMEN EJECUTIVO:
- Total proveedores: ${stats.total_proveedores}
- Con DPA firmado: ${stats.con_dpa_firmado}
- Sin DPA: ${stats.sin_dpa}
- Evaluaciones pendientes: ${stats.evaluaciones_pendientes}
- Alto riesgo: ${stats.alto_riesgo}

DETALLE POR PROVEEDOR:
${proveedores.map(p => `
Proveedor: ${p.nombre}
DPA: ${p.dpa_info.firmado ? 'Firmado' : 'Pendiente'}
Evaluación: ${p.evaluacion_seguridad.realizada ? 'Completa' : 'Pendiente'}
Riesgo: ${p.evaluacion_seguridad.nivel_riesgo || 'No evaluado'}
Transferencias: ${p.transferencias_internacionales ? 'Sí' : 'No'}
`).join('\n')}

ACCIONES RECOMENDADAS:
1. Firmar DPAs pendientes
2. Completar evaluaciones de seguridad
3. Renovar contratos próximos a vencer
4. Revisar proveedores de alto riesgo

Generado automáticamente por Sistema LPDP
                    `;
                    
                    const blob = new Blob([reporte], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `Reporte_Proveedores_${new Date().toISOString().split('T')[0]}.txt`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Exportar Reporte TXT
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<TableChart />}
                  onClick={() => {
                    alert('Funcionalidad de exportación a Excel disponible en versión completa.');
                  }}
                >
                  Exportar Excel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Dialog para agregar/editar proveedor */}
      <Dialog 
        open={showDialog} 
        onClose={() => setShowDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogType === 'add' ? 'Agregar Nuevo Proveedor' : 'Editar Proveedor'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre del Proveedor"
                value={newProveedor.nombre}
                onChange={(e) => setNewProveedor({...newProveedor, nombre: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="RUT"
                value={newProveedor.rut}
                onChange={(e) => setNewProveedor({...newProveedor, rut: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Razón Social"
                value={newProveedor.razon_social}
                onChange={(e) => setNewProveedor({...newProveedor, razon_social: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={newProveedor.categoria_proveedor}
                  onChange={(e) => setNewProveedor({...newProveedor, categoria_proveedor: e.target.value})}
                  label="Categoría"
                >
                  <MenuItem value="tecnologia">Tecnología</MenuItem>
                  <MenuItem value="cloud">Servicios Cloud</MenuItem>
                  <MenuItem value="marketing">Marketing Digital</MenuItem>
                  <MenuItem value="consultoria">Consultoría</MenuItem>
                  <MenuItem value="otros">Otros</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Ubicación de Datos</InputLabel>
                <Select
                  value={newProveedor.ubicacion_datos}
                  onChange={(e) => setNewProveedor({...newProveedor, ubicacion_datos: e.target.value})}
                  label="Ubicación de Datos"
                >
                  <MenuItem value="chile">Solo Chile</MenuItem>
                  <MenuItem value="extranjero">Solo Extranjero</MenuItem>
                  <MenuItem value="mixta">Mixta</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>Cancelar</Button>
          <Button onClick={handleSaveProveedor} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GestionProveedores;