import React, { useState, useEffect } from 'react';
import { inventarioService } from '../services/api';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  Alert,
  IconButton,
  Collapse,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Tooltip,
  Badge,
  Avatar,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Inventory,
  ExpandMore,
  Business,
  People,
  AttachMoney,
  Campaign,
  Engineering,
  Gavel,
  Download,
  CheckCircle,
  Warning,
  Info,
  Assignment,
  Storage,
  Security,
  Timeline,
  CloudUpload,
  Group,
  MonetizationOn,
  LocalOffer,
  Build,
  Policy,
  Description,
  FolderOpen,
  Assessment,
  AccountTree,
  DataUsage,
  Lock,
  VpnKey,
  Public,
  LocationOn,
  Timer,
  Delete,
  Edit,
  Add,
  Search,
  FilterList,
  Print,
  Share,
  SaveAlt,
  PlayArrow,
  Help,
  School,
  WorkspacePremium,
  TrendingUp,
  Visibility,
} from '@mui/icons-material';

const Modulo3Inventario = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedArea, setSelectedArea] = useState('all');
  const [expandedActividad, setExpandedActividad] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedActividad, setSelectedActividad] = useState(null);
  const [actividadesBackend, setActividadesBackend] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSensible, setFilterSensible] = useState('all');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Cargar datos del backend al inicializar
    const cargarDatos = async () => {
      try {
        const actividades = await inventarioService.getActividades();
        setActividadesBackend(actividades);
      } catch (error) {
        setError('Error cargando actividades del servidor');
      }
    };
    
    cargarDatos();
  }, []);

  // Datos de las áreas de negocio con actividades completas según el manual
  const areasNegocio = {
    rrhh: {
      nombre: 'Recursos Humanos',
      icon: <People />,
      color: '#4CAF50',
      actividades: [
        {
          id: 'RRHH-001',
          nombre: 'Proceso de Reclutamiento y Selección',
          descripcion: 'Desde recepción de currículum hasta comunicación de decisión',
          finalidades: [
            'Evaluar idoneidad de candidatos para vacantes laborales',
            'Verificar antecedentes laborales y académicos',
            'Cumplir procesos de due diligence'
          ],
          baseLicitud: 'Medidas precontractuales y consentimiento del candidato',
          datosTratados: [
            { tipo: 'Datos identificación', sensible: false, descripcion: 'Nombre, RUT, email, teléfono' },
            { tipo: 'Historial académico', sensible: false, descripcion: 'Títulos, certificaciones, cursos' },
            { tipo: 'Referencias laborales', sensible: false, descripcion: 'Contactos de empleadores anteriores' },
            { tipo: 'Exámenes preocupacionales', sensible: true, descripcion: 'DATO SENSIBLE - Salud' },
            { tipo: 'Situación socioeconómica', sensible: true, descripcion: 'DATO SENSIBLE - Evaluación salarial' }
          ],
          sistemas: ['Portal Web RRHH', 'ATS (Applicant Tracking System)', 'Base datos candidatos'],
          terceros: ['Empresa verificación antecedentes', 'Centro médico exámenes', 'Consultora psicotécnica'],
          plazoRetencion: 'NO seleccionados: 6 meses. Seleccionados: relación laboral + 2 años',
          riesgo: 'Alto',
          estado: 'Documentado'
        },
        {
          id: 'RRHH-002',
          nombre: 'Gestión de Nómina y Beneficios',
          descripcion: 'Procesamiento mensual de remuneraciones y beneficios',
          finalidades: [
            'Cumplir obligaciones laborales de pago',
            'Calcular impuestos y cotizaciones',
            'Administrar beneficios adicionales'
          ],
          baseLicitud: 'Cumplimiento obligación legal (Código del Trabajo)',
          datosTratados: [
            { tipo: 'Datos personales empleados', sensible: false, descripcion: 'Información básica' },
            { tipo: 'Información bancaria', sensible: false, descripcion: 'Cuentas para depósitos' },
            { tipo: 'Datos hijos', sensible: true, descripcion: 'DATOS NNA - Asignación familiar' },
            { tipo: 'Licencias médicas', sensible: true, descripcion: 'DATO SENSIBLE - Salud' },
            { tipo: 'Nivel salarial', sensible: true, descripcion: 'DATO SENSIBLE - Situación socioeconómica' }
          ],
          sistemas: ['Sistema Nómina', 'ERP', 'Portal Empleado', 'Previred'],
          terceros: ['AFP', 'ISAPRE/FONASA', 'SII', 'Previred', 'Bancos'],
          plazoRetencion: 'Durante relación laboral + 6 años tributarios',
          riesgo: 'Crítico',
          estado: 'Documentado'
        }
      ]
    },
    finanzas: {
      nombre: 'Finanzas y Contabilidad',
      icon: <AttachMoney />,
      color: '#FF9800',
      actividades: [
        {
          id: 'FIN-001',
          nombre: 'Evaluación Crediticia de Clientes',
          descripcion: 'Análisis de capacidad de pago para ventas a crédito',
          finalidades: [
            'Evaluar riesgo crediticio',
            'Definir cupos y condiciones de venta',
            'Cumplir políticas internas de riesgo'
          ],
          baseLicitud: 'Interés legítimo (evaluación riesgo comercial)',
          datosTratados: [
            { tipo: 'Datos identificación cliente', sensible: false, descripcion: 'RUT, razón social' },
            { tipo: 'Score crediticio', sensible: true, descripcion: 'DATO SENSIBLE - Situación socioeconómica' },
            { tipo: 'Información patrimonial', sensible: true, descripcion: 'DATO SENSIBLE - Situación socioeconómica' },
            { tipo: 'Reportes DICOM/Equifax', sensible: true, descripcion: 'DATO SENSIBLE - Historial crediticio' }
          ],
          sistemas: ['ERP', 'Sistema Cobranza', 'Portal DICOM', 'CRM'],
          terceros: ['DICOM', 'Equifax', 'Siisa', 'Centrales de riesgo'],
          plazoRetencion: '5 años desde última transacción comercial',
          riesgo: 'Alto',
          estado: 'Pendiente revisión'
        }
      ]
    },
    marketing: {
      nombre: 'Marketing y Ventas',
      icon: <Campaign />,
      color: '#2196F3',
      actividades: [
        {
          id: 'MKT-001',
          nombre: 'Programa de Fidelización de Clientes',
          descripcion: 'Gestión de programa de puntos y beneficios',
          finalidades: [
            'Fidelizar clientes existentes',
            'Analizar patrones de compra',
            'Personalizar ofertas comerciales'
          ],
          baseLicitud: 'Consentimiento para marketing directo',
          datosTratados: [
            { tipo: 'Datos personales básicos', sensible: false, descripcion: 'Nombre, email, teléfono' },
            { tipo: 'Historial de compras', sensible: false, descripcion: 'Productos, fechas, montos' },
            { tipo: 'Preferencias', sensible: false, descripcion: 'Categorías de interés' },
            { tipo: 'Comportamiento digital', sensible: false, descripcion: 'Cookies, navegación' }
          ],
          sistemas: ['CRM', 'Plataforma Fidelización', 'Email Marketing', 'Analytics'],
          terceros: ['Agencia marketing digital', 'Proveedor email marketing'],
          transferenciasInternacionales: {
            google: 'Estados Unidos - Google Analytics',
            facebook: 'Estados Unidos - Meta Ads'
          },
          plazoRetencion: 'Mientras cuenta activa + 2 años inactividad',
          riesgo: 'Medio',
          estado: 'Documentado'
        }
      ]
    },
    operaciones: {
      nombre: 'Operaciones y Producción',
      icon: <Engineering />,
      color: '#9C27B0',
      actividades: [
        {
          id: 'OPS-001',
          nombre: 'Monitoreo IoT de Centros de Cultivo',
          descripcion: 'Monitoreo en tiempo real via sensores IoT',
          finalidades: [
            'Optimizar condiciones de cultivo',
            'Detectar tempranamente problemas sanitarios',
            'Cumplir normativas de bienestar animal',
            'Generar reportes para SERNAPESCA'
          ],
          baseLicitud: 'Interés legítimo y cumplimiento obligación legal',
          datosTratados: [
            { tipo: 'Datos sensores', sensible: false, descripcion: 'Temperatura, oxígeno, pH' },
            { tipo: 'Registros alimentación', sensible: false, descripcion: 'Horarios, cantidades' },
            { tipo: 'Imágenes/video biomasa', sensible: false, descripcion: 'Monitoreo visual' },
            { tipo: 'Geolocalización personal', sensible: true, descripcion: 'POTENCIALMENTE PERSONAL si identificable' },
            { tipo: 'Registros operarios', sensible: false, descripcion: 'DATO PERSONAL si identificable' }
          ],
          sistemas: ['Sensores IoT', 'Plataforma IA', 'ERP', 'Sistema SERNAPESCA'],
          terceros: ['Proveedor plataforma IA', 'SERNAPESCA'],
          transferenciasInternacionales: {
            aws: 'Estados Unidos - AWS Cloud'
          },
          plazoRetencion: 'Datos brutos: 2 años. Informes agregados: 10 años',
          riesgo: 'Medio',
          estado: 'En proceso'
        },
        {
          id: 'OPS-002',
          nombre: 'Geolocalización de Personal en Terreno',
          descripcion: 'Tracking GPS de vehículos y personal móvil',
          finalidades: [
            'Seguridad personal en terreno riesgoso',
            'Optimización de rutas y combustible',
            'Respuesta rápida a emergencias'
          ],
          baseLicitud: 'Interés legítimo balanceado con derechos del trabajador',
          datosTratados: [
            { tipo: 'Coordenadas GPS', sensible: true, descripcion: 'Ubicación en tiempo real' },
            { tipo: 'Rutas y velocidades', sensible: false, descripcion: 'Desplazamientos' },
            { tipo: 'Tiempo permanencia', sensible: false, descripcion: 'Por ubicación' }
          ],
          limitaciones: [
            'Solo durante horario laboral',
            'No monitoreo en descansos',
            'Notificación previa explícita'
          ],
          sistemas: ['GPS Vehículos', 'Apps móviles', 'Sistema Central'],
          plazoRetencion: '90 días detallado, 2 años agregado',
          riesgo: 'Alto',
          estado: 'Requiere validación legal'
        }
      ]
    },
    ti: {
      nombre: 'Tecnología de la Información',
      icon: <Build />,
      color: '#00BCD4',
      actividades: [
        {
          id: 'TI-001',
          nombre: 'Administración de Cuentas de Usuario',
          descripcion: 'Gestión de accesos y permisos en sistemas',
          finalidades: [
            'Controlar acceso a sistemas corporativos',
            'Mantener seguridad de la información',
            'Auditar actividad de usuarios'
          ],
          baseLicitud: 'Interés legítimo (seguridad informática)',
          datosTratados: [
            { tipo: 'Credenciales de acceso', sensible: false, descripcion: 'Usuario, contraseña hash' },
            { tipo: 'Logs de actividad', sensible: false, descripcion: 'Accesos, cambios, errores' },
            { tipo: 'Dirección IP', sensible: false, descripcion: 'Ubicación de conexión' }
          ],
          sistemas: ['Active Directory', 'SIEM', 'Sistemas aplicativos'],
          plazoRetencion: 'Logs: 1 año. Cuentas: eliminación post-desvinculación',
          riesgo: 'Medio',
          estado: 'Documentado'
        }
      ]
    },
    legal: {
      nombre: 'Legal y Cumplimiento',
      icon: <Gavel />,
      color: '#795548',
      actividades: [
        {
          id: 'LEG-001',
          nombre: 'Gestión de Litigios y Procesos Judiciales',
          descripcion: 'Administración de información para procedimientos legales',
          finalidades: [
            'Ejercer defensa legal de la empresa',
            'Cumplir requerimientos judiciales',
            'Gestionar contratos y disputas'
          ],
          baseLicitud: 'Interés legítimo (defensa de derechos legales)',
          datosTratados: [
            { tipo: 'Información contrapartes', sensible: false, descripcion: 'Datos de litigantes' },
            { tipo: 'Documentos probatorios', sensible: false, descripcion: 'Evidencia legal' },
            { tipo: 'Correspondencia legal', sensible: false, descripcion: 'Comunicaciones' }
          ],
          sistemas: ['Sistema gestión legal', 'Repositorio documentos'],
          terceros: ['Estudios jurídicos', 'Peritos', 'Tribunales'],
          plazoRetencion: 'Durante proceso + 5 años post-resolución',
          riesgo: 'Alto',
          estado: 'Documentado'
        }
      ]
    }
  };

  // Estadísticas generales del inventario de datos
  const estadisticas = {
    totalActividades: 10,
    documentadas: 6,
    pendientes: 2,
    enProceso: 2,
    datosSensibles: 15,
    transferenciasInternacionales: 3,
    tercerosInvolucrados: 25,
    sistemasIntegrados: 30
  };

  const handleExpandActividad = (actividadId) => {
    setExpandedActividad(expandedActividad === actividadId ? null : actividadId);
  };

  const handleOpenDetalle = (actividad) => {
    setSelectedActividad(actividad);
    setDialogOpen(true);
  };

  const handleDescargarRAT = () => {
    // Crear datos de ejemplo para la plantilla RAT según la Ley 21.719
    const plantillaRAT = `
REGISTRO DE ACTIVIDADES DE TRATAMIENTO (RAT) - LEY 21.719
========================================================

Organización: [Su empresa]
Fecha: ${new Date().toLocaleDateString('es-CL')}
Responsable: [Nombre DPO]

CAMPOS REQUERIDOS POR LEY:
-------------------------
1. ID Actividad: [Código único]
2. Nombre de la Actividad: [Descripción clara]
3. Finalidades del Tratamiento: [Por qué se tratan los datos]
4. Base de Licitud: [Consentimiento/Contrato/Obligación legal/etc.]
5. Categorías de Titulares: [Empleados/Clientes/Proveedores/etc.]
6. Categorías de Datos:
   - Datos Comunes: [Identificación, contacto, etc.]
   - Datos Sensibles: [Salud, situación socioeconómica, biométricos, etc.]
   - Datos NNA: [Menores de edad]
7. Sistemas y Bases de Datos: [Dónde se almacenan]
8. Destinatarios:
   - Internos: [Departamentos]
   - Externos: [Terceros, encargados]
9. Transferencias Internacionales: [País, garantías]
10. Plazos de Conservación: [Tiempo y justificación]
11. Medidas de Seguridad: [Técnicas y organizativas]
12. Evaluación de Riesgo: [Crítico/Alto/Medio/Bajo]

NOTAS IMPORTANTES:
- La situación socioeconómica es dato sensible en Chile
- Datos de menores requieren consentimiento parental
- Documentar todos los flujos de datos
`;
    
    // Crear y descargar archivo de plantilla RAT
    const blob = new Blob([plantillaRAT], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Plantilla_RAT_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const getEstadoChip = (estado) => {
    const config = {
      'Documentado': { color: 'success', icon: <CheckCircle /> },
      'En proceso': { color: 'warning', icon: <Info /> },
      'Pendiente revisión': { color: 'error', icon: <Warning /> },
      'Requiere validación legal': { color: 'error', icon: <Gavel /> }
    };
    return config[estado] || { color: 'default', icon: null };
  };

  const getRiesgoColor = (riesgo) => {
    const colors = {
      'Crítico': '#d32f2f',
      'Alto': '#f57c00',
      'Medio': '#fbc02d',
      'Bajo': '#689f38'
    };
    return colors[riesgo] || '#757575';
  };

  const handleAnalisisRiesgo = (actividad) => {
    setSelectedActividad({
      ...actividad,
      modalType: 'analisis_riesgo'
    });
    setDialogOpen(true);
  };

  const handleVerFlujos = (actividad) => {
    setSelectedActividad({
      ...actividad,
      modalType: 'flujos_datos'
    });
    setDialogOpen(true);
  };

  const handleVerMatrizRiesgos = () => {
    setSelectedActividad({
      modalType: 'matriz_riesgos',
      nombre: 'Matriz de Riesgos Global'
    });
    setDialogOpen(true);
  };

  const handleImprimir = (actividad) => {
    setSelectedActividad({
      ...actividad,
      modalType: 'imprimir'
    });
    setDialogOpen(true);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header con estadísticas */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Inventory /> Módulo 3: Inventario y Mapeo de Datos
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Registro de Actividades de Tratamiento (RAT) según Ley 21.719
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.8 }}>
                La piedra angular de todo el sistema de cumplimiento
              </Typography>
              <Alert severity="info" sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.15)', color: 'white' }}>
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                  💡 <strong>Tip:</strong> Los términos técnicos como <strong>RAT, Data Discovery, Bases de Licitud, 
                  Datos Sensibles, Transferencias Internacionales</strong> y otros conceptos especializados están 
                  detallados en nuestro <strong>Glosario LPDP completo</strong> con más de 75 definiciones 
                  profesionales y ejemplos prácticos específicos de Chile.
                </Typography>
              </Alert>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={handleDescargarRAT}
                  fullWidth
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                >
                  Descargar Plantilla RAT
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Assessment />}
                  onClick={handleVerMatrizRiesgos}
                  fullWidth
                  sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}
                >
                  Ver Matriz de Riesgos
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tarjetas de estadísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="caption">
                Total Actividades
              </Typography>
              <Typography variant="h4">
                {estadisticas.totalActividades}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(estadisticas.documentadas / estadisticas.totalActividades) * 100} 
                sx={{ mt: 1 }}
              />
              <Typography variant="caption" color="success.main">
                {estadisticas.documentadas} documentadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="caption">
                Datos Sensibles
              </Typography>
              <Typography variant="h4" color="error.main">
                {estadisticas.datosSensibles}
              </Typography>
              <Chip 
                size="small" 
                label="Requieren protección especial" 
                color="error" 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="caption">
                Transferencias Internacionales
              </Typography>
              <Typography variant="h4" color="warning.main">
                {estadisticas.transferenciasInternacionales}
              </Typography>
              <Chip 
                size="small" 
                label="Requieren garantías" 
                color="warning" 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="caption">
                Terceros Involucrados
              </Typography>
              <Typography variant="h4">
                {estadisticas.tercerosInvolucrados}
              </Typography>
              <Chip 
                size="small" 
                label="Encargados y cesionarios" 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros y búsqueda */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar actividad de tratamiento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Área de negocio</InputLabel>
                <Select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  label="Área de negocio"
                >
                  <MenuItem value="all">Todas las áreas</MenuItem>
                  {Object.entries(areasNegocio).map(([key, area]) => (
                    <MenuItem key={key} value={key}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {area.icon} {area.nombre}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Datos sensibles</InputLabel>
                <Select
                  value={filterSensible}
                  onChange={(e) => setFilterSensible(e.target.value)}
                  label="Datos sensibles"
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="con">Con datos sensibles</MenuItem>
                  <MenuItem value="sin">Sin datos sensibles</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                fullWidth
              >
                Más filtros
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs de áreas de negocio */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => {
            setActiveTab(newValue);
            // Cambiar el área seleccionada según el tab
            if (newValue === 0) {
              setSelectedArea('all');
            } else {
              const areaKeys = Object.keys(areasNegocio);
              setSelectedArea(areaKeys[newValue - 1]);
            }
          }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Vista General" icon={<Assessment />} iconPosition="start" />
          {Object.entries(areasNegocio).map(([key, area]) => (
            <Tab 
              key={key} 
              label={area.nombre} 
              icon={area.icon} 
              iconPosition="start"
              sx={{ color: area.color }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Contenido principal - Lista de actividades */}
      <Grid container spacing={3}>
        {Object.entries(areasNegocio).map(([areaKey, area]) => (
          selectedArea === 'all' || selectedArea === areaKey ? (
            <Grid item xs={12} key={areaKey}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: area.color }}>
                {area.icon} {area.nombre}
              </Typography>
              {area.actividades.map((actividad) => (
                <Accordion 
                  key={actividad.id}
                  expanded={expandedActividad === actividad.id}
                  onChange={() => handleExpandActividad(actividad.id)}
                  sx={{ mb: 2 }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {actividad.nombre}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {actividad.id} | {actividad.descripcion}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          <Chip 
                            size="small" 
                            label={actividad.estado}
                            color={getEstadoChip(actividad.estado).color}
                            icon={getEstadoChip(actividad.estado).icon}
                          />
                          <Chip 
                            size="small" 
                            label={`Riesgo: ${actividad.riesgo}`}
                            sx={{ bgcolor: getRiesgoColor(actividad.riesgo), color: 'white' }}
                          />
                          {actividad.datosTratados.filter(d => d.sensible).length > 0 && (
                            <Chip 
                              size="small" 
                              label={`${actividad.datosTratados.filter(d => d.sensible).length} datos sensibles`}
                              color="error"
                              variant="outlined"
                            />
                          )}
                          {actividad.transferenciasInternacionales && (
                            <Chip 
                              size="small" 
                              label="Transferencia internacional"
                              color="warning"
                              variant="outlined"
                              icon={<Public />}
                            />
                          )}
                        </Stack>
                      </Grid>
                    </Grid>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                          Finalidades del tratamiento:
                        </Typography>
                        <List dense>
                          {actividad.finalidades.map((finalidad, idx) => (
                            <ListItem key={idx}>
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                <CheckCircle fontSize="small" color="primary" />
                              </ListItemIcon>
                              <ListItemText primary={finalidad} />
                            </ListItem>
                          ))}
                        </List>

                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
                          Base de licitud:
                        </Typography>
                        <Alert severity="info" sx={{ mb: 2 }}>
                          {actividad.baseLicitud}
                        </Alert>

                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                          Plazo de retención:
                        </Typography>
                        <Alert severity="warning">
                          <Timer sx={{ fontSize: 16, mr: 1 }} />
                          {actividad.plazoRetencion}
                        </Alert>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                          Categorías de datos tratados:
                        </Typography>
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Tipo de dato</TableCell>
                                <TableCell>Sensibilidad</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {actividad.datosTratados.map((dato, idx) => (
                                <TableRow key={idx}>
                                  <TableCell>
                                    <Typography variant="body2">{dato.tipo}</Typography>
                                    <Typography variant="caption" color="textSecondary">
                                      {dato.descripcion}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    {dato.sensible ? (
                                      <Chip size="small" label="SENSIBLE" color="error" />
                                    ) : (
                                      <Chip size="small" label="Común" variant="outlined" />
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>

                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
                          Sistemas involucrados:
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {actividad.sistemas.map((sistema, idx) => (
                            <Chip
                              key={idx}
                              label={sistema}
                              size="small"
                              icon={<Storage />}
                              variant="outlined"
                            />
                          ))}
                        </Stack>

                        {actividad.terceros && (
                          <>
                            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
                              Terceros involucrados:
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                              {actividad.terceros.map((tercero, idx) => (
                                <Chip
                                  key={idx}
                                  label={tercero}
                                  size="small"
                                  icon={<Business />}
                                  color="secondary"
                                  variant="outlined"
                                />
                              ))}
                            </Stack>
                          </>
                        )}
                      </Grid>

                      <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Stack direction="row" spacing={2}>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<Edit />}
                            onClick={() => handleOpenDetalle(actividad)}
                          >
                            Editar RAT
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Assessment />}
                            onClick={() => handleAnalisisRiesgo(actividad)}
                          >
                            Análisis de Riesgo
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AccountTree />}
                            onClick={() => handleVerFlujos(actividad)}
                          >
                            Ver Flujos de Datos
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Print />}
                            onClick={() => handleImprimir(actividad)}
                          >
                            Imprimir
                          </Button>
                        </Stack>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Grid>
          ) : null
        ))}
      </Grid>

      {/* Sección de clasificación de datos sensibles */}
      <Card sx={{ mt: 4, borderLeft: '4px solid', borderColor: 'error.main' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="error" /> Clasificación de Datos Sensibles según Ley 21.719
          </Typography>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              ⚠️ NOVEDAD CRUCIAL DE LA LEY CHILENA:
            </Typography>
            La "situación socioeconómica" es considerada DATO SENSIBLE en Chile, a diferencia de Europa.
            Esto incluye: nivel de ingresos, historial crediticio, score crediticio, evaluaciones de capacidad de pago.
            <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
              📚 <strong>Tip:</strong> Conceptos como <strong>Dato Sensible, Situación Socioeconómica, 
              Consentimiento Explícito, Encargado de Tratamiento</strong> y las diferencias con la normativa 
              europea están explicados en detalle en nuestro <strong>Glosario LPDP</strong> con casos prácticos chilenos.
            </Typography>
          </Alert>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Datos Sensibles - Requieren consentimiento explícito:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><MonetizationOn color="error" /></ListItemIcon>
                    <ListItemText 
                      primary="Situación Socioeconómica" 
                      secondary="Score crediticio, ingresos, patrimonio, deudas"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Lock color="error" /></ListItemIcon>
                    <ListItemText 
                      primary="Datos de Salud" 
                      secondary="Licencias médicas, exámenes, discapacidades"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><VpnKey color="error" /></ListItemIcon>
                    <ListItemText 
                      primary="Datos Biométricos" 
                      secondary="Huellas dactilares, reconocimiento facial"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Group color="error" /></ListItemIcon>
                    <ListItemText 
                      primary="Datos NNA" 
                      secondary="Menores de 18 años - Requiere consentimiento parental"
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Plazos legales de retención en Chile:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Documentos tributarios"
                      secondary="6 años (Código Tributario)"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Documentos laborales"
                      secondary="2 años post-término (Código del Trabajo)"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Documentos previsionales"
                      secondary="30 años (DL 3.500)"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Currículums no seleccionados"
                      secondary="6 meses (práctica recomendada)"
                    />
                  </ListItem>
                </List>
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    📋 <strong>Tip:</strong> Términos como <strong>Plazo de Conservación, Supresión de Datos, 
                    Principio de Limitación</strong> y las obligaciones específicas del Código Tributario y 
                    Código del Trabajo están desarrollados en nuestro <strong>Glosario LPDP</strong> con 
                    ejemplos prácticos para empresas chilenas.
                  </Typography>
                </Alert>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Dialog de detalle/edición */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Typography variant="h6">
            Editar Registro de Actividad de Tratamiento
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedActividad && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nombre de la Actividad"
                    defaultValue={selectedActividad.nombre}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descripción"
                    defaultValue={selectedActividad.descripcion}
                    multiline
                    rows={2}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Base de Licitud"
                    defaultValue={selectedActividad.baseLicitud}
                    multiline
                    rows={2}
                    variant="outlined"
                    helperText="Ej: Consentimiento, Contrato, Obligación legal, Interés legítimo"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Plazo de Retención"
                    defaultValue={selectedActividad.plazoRetencion}
                    multiline
                    rows={2}
                    variant="outlined"
                    helperText="Especifique tiempo y justificación"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Finalidades del Tratamiento:
                  </Typography>
                  {selectedActividad.finalidades.map((finalidad, idx) => (
                    <TextField
                      key={idx}
                      fullWidth
                      defaultValue={finalidad}
                      variant="outlined"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  ))}
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Add />}
                    sx={{ mt: 1 }}
                  >
                    Agregar Finalidad
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Alert severity="warning">
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Recordatorio Legal:
                    </Typography>
                    • La situación socioeconómica es dato sensible en Chile
                    • Datos de menores requieren consentimiento parental
                    • Transferencias internacionales requieren garantías apropiadas
                    <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                      💡 <strong>Tip:</strong> Para definiciones detalladas de <strong>Consentimiento Parental, 
                      Garantías Apropiadas, Cesionario, Responsable del Tratamiento</strong> y otros términos 
                      legales específicos, consulta nuestro <strong>Glosario LPDP</strong> con referencias 
                      normativas chilenas completas.
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={() => setDialogOpen(false)}
          >
            Guardar cambios
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Modulo3Inventario;