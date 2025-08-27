import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  IconButton,
  Tooltip,
  Badge,
  Avatar,
  Divider,
  Stack,
  Switch,
  RadioGroup,
  Radio,
  Autocomplete,
  Snackbar,
} from '@mui/material';
import {
  Science,
  Business,
  People,
  AttachMoney,
  Campaign,
  Engineering,
  Gavel,
  Storage,
  Security,
  CheckCircle,
  Warning,
  Error,
  Info,
  Help,
  PlayArrow,
  Save,
  Assessment,
  Download,
  Upload,
  Edit,
  Delete,
  Add,
  Remove,
  Visibility,
  ExpandMore,
  AccountTree,
  Map as MapIcon,
  Timeline as TimelineIcon,
  LocationOn,
  Public,
  Timer,
  Assignment,
  Build,
  LocalShipping,
  HealthAndSafety,
  School,
  MonetizationOn,
  Lock,
  VpnKey,
  Group,
  ChildCare,
  Fingerprint,
  CloudUpload,
  CloudDownload,
  Share,
  CompareArrows,
  SyncAlt,
  DataUsage,
  QueryStats,
  AutoGraph,
  NetworkCheck,
  Hub,
  Lan,
  Router,
  Cable,
  Sensors,
  Memory,
  DeviceHub,
  FilterAlt,
  Search,
  Print,
  Email,
  Phone,
  Place,
  CreditCard,
  AccountBalance,
  Receipt,
  Description,
  FolderOpen,
  WorkspacePremium,
  VerifiedUser,
  AdminPanelSettings,
  ManageAccounts,
  Policy,
  Biotech,
  MedicalServices,
  Psychology,
  Diversity3,
  EmojiPeople,
  FamilyRestroom,
  Elderly,
  AccessibleForward,
  Wc,
  Male,
  Female,
  Transgender,
  SentimentSatisfiedAlt,
  MoodBad,
  LocalHospital,
  Vaccines,
  Medication,
  MonitorHeart,
  Bloodtype,
  PersonalInjury,
  Sick,
  AirlineSeatFlat,
  DirectionsCar,
  DirectionsBoat,
  LocalShipping as Truck,
  Agriculture,
  WaterDrop,
  Thermostat,
  WbSunny,
  Cloud,
  Storm,
  AcUnit,
  Waves,
  Terrain,
  Landscape,
  Park,
  Forest,
  Grass,
  Eco,
  EnergySavingsLeaf,
  SolarPower,
  WindPower,
  ElectricBolt,
  PowerSettingsNew,
  BatteryChargingFull,
  EvStation,
  OilBarrel,
  LocalGasStation,
  Factory,
  Warehouse,
  HomeWork,
  Apartment,
  Villa,
  Cabin,
  Cottage,
  House,
  Store,
  Storefront,
  ShoppingCart,
  ShoppingBag,
  LocalMall,
  LocalOffer,
  Loyalty,
  CardGiftcard,
  Redeem,
  Stars,
  Grade,
  StarBorder,
  StarHalf,
  Favorite,
  FavoriteBorder,
  ThumbUp,
  ThumbDown,
  Comment,
  Forum,
  QuestionAnswer,
  Feedback,
  RateReview,
  Reviews,
  Verified,
  NewReleases,
  Announcement,
  Campaign as Megaphone,
  RecordVoiceOver,
  VoiceChat,
  Mic,
  MicOff,
  Headset,
  Headphones,
  Speaker,
  VolumeUp,
  QrCode,
  QrCodeScanner,
  Nfc,
  Bluetooth,
  Wifi,
  SignalCellularAlt,
  NetworkWifi,
  Router as WifiRouter,
  Dns,
  VpnLock,
  LockOpen,
  LockClock,
  LockReset,
  Password,
  Pin,
  Pattern,
  Face,
  FaceRetouchingNatural,
  TagFaces,
  SentimentDissatisfied,
  SentimentNeutral,
  SentimentSatisfied,
  SentimentVeryDissatisfied,
  SentimentVerySatisfied,
  InsertEmoticon,
  EmojiEmotions,
  Mood,
  Book,
} from '@mui/icons-material';


function SandboxCompleto() {
  // Estado principal del sistema RAT
  const [activeStep, setActiveStep] = useState(0);
  const [empresa, setEmpresa] = useState({
    nombre: '',
    rut: '',
    sector: '',
    tamano: '',
    empleados: 0,
    ubicaciones: [],
    dpo: {
      designado: false,
      nombre: '',
      email: '',
      telefono: ''
    }
  });

  // Definición completa de áreas según el manual
  const areasNegocio = {
    rrhh: {
      nombre: 'Recursos Humanos',
      icon: <People />,
      color: '#ffffff',
      procesos: [
        'Reclutamiento y Selección',
        'Gestión de Nómina',
        'Evaluaciones de Desempeño',
        'Capacitación y Desarrollo',
        'Gestión de Beneficios',
        'Control de Asistencia',
        'Prevención de Riesgos',
        'Desvinculaciones'
      ]
    },
    finanzas: {
      nombre: 'Finanzas y Contabilidad',
      icon: <AttachMoney />,
      color: '#FF9800',
      procesos: [
        'Evaluación Crediticia',
        'Gestión de Cobranza',
        'Facturación',
        'Pago a Proveedores',
        'Análisis Financiero',
        'Auditoría Interna',
        'Reportes Tributarios',
        'Gestión de Activos'
      ]
    },
    marketing: {
      nombre: 'Marketing y Ventas',
      icon: <Campaign />,
      color: '#2196F3',
      procesos: [
        'Gestión de Clientes (CRM)',
        'Campañas de Marketing',
        'Programa de Fidelización',
        'Análisis de Mercado',
        'Gestión de Redes Sociales',
        'Email Marketing',
        'Telemarketing',
        'Eventos y Promociones'
      ]
    },
    operaciones: {
      nombre: 'Operaciones y Producción',
      icon: <Engineering />,
      color: '#9C27B0',
      procesos: [
        'Monitoreo IoT de Centros',
        'Control de Calidad',
        'Gestión de Inventario',
        'Logística y Distribución',
        'Mantenimiento Predictivo',
        'Gestión de Proveedores',
        'Planificación de Producción',
        'Gestión de Residuos'
      ]
    },
    ti: {
      nombre: 'Tecnología de la Información',
      icon: <Memory />,
      color: '#00BCD4',
      procesos: [
        'Administración de Usuarios',
        'Gestión de Accesos',
        'Monitoreo de Seguridad',
        'Backup y Recuperación',
        'Desarrollo de Software',
        'Soporte Técnico',
        'Gestión de Infraestructura',
        'Análisis de Logs'
      ]
    },
    legal: {
      nombre: 'Legal y Cumplimiento',
      icon: <Gavel />,
      color: '#795548',
      procesos: [
        'Gestión de Contratos',
        'Litigios y Disputas',
        'Propiedad Intelectual',
        'Cumplimiento Regulatorio',
        'Due Diligence',
        'Gestión de Poderes',
        'Investigaciones Internas',
        'Relaciones Gubernamentales'
      ]
    },
    salud: {
      nombre: 'Salud y Seguridad',
      icon: <HealthAndSafety />,
      color: '#E91E63',
      procesos: [
        'Exámenes Médicos',
        'Gestión de Licencias',
        'Programas de Bienestar',
        'Investigación de Accidentes',
        'Vigilancia Epidemiológica',
        'Gestión de EPP',
        'Capacitación en Seguridad',
        'Auditorías de Seguridad'
      ]
    },
    investigacion: {
      nombre: 'I+D+i',
      icon: <Biotech />,
      color: '#673AB7',
      procesos: [
        'Proyectos de Investigación',
        'Ensayos y Pruebas',
        'Análisis de Datos',
        'Colaboraciones Externas',
        'Gestión de Patentes',
        'Publicaciones Científicas',
        'Transferencia Tecnológica',
        'Innovación Abierta'
      ]
    }
  };

  // Estado para el RAT completo
  const [actividades, setActividades] = useState([]);
  const [actividadActual, setActividadActual] = useState({
    id: '',
    nombre: '',
    area: '',
    proceso: '',
    responsable: '',
    
    // Elementos del RAT según manual
    finalidades: [],
    baseLicitud: '',
    justificacionBase: '',
    
    // Categorías de titulares
    titulares: {
      empleados: false,
      clientes: false,
      proveedores: false,
      postulantes: false,
      menores: false,
      otros: ''
    },
    
    // Categorías de datos
    categoriasDatos: {
      identificacion: false,
      contacto: false,
      laborales: false,
      academicos: false,
      financieros: false,
      salud: false,
      biometricos: false,
      socioeconomicos: false, // DATO SENSIBLE EN CHILE
      geneticos: false,
      sexuales: false,
      sindicales: false,
      religiosos: false,
      politicos: false,
      etnicos: false,
      iot: false,
      geolocalizacion: false,
      navegacion: false,
      otros: ''
    },
    
    // Datos sensibles identificados
    datosSensibles: [],
    datosNNA: false,
    
    // Sistemas y almacenamiento
    sistemas: [],
    ubicacionFisica: [],
    ubicacionDigital: [],
    
    // Flujo de datos (Data Flow)
    flujosInternos: [],
    destinatariosInternos: [],
    
    // Terceros
    encargados: [],
    cesionarios: [],
    
    // Transferencias internacionales
    transferenciasInternacionales: {
      existe: false,
      paises: [],
      mecanismo: '', // clausulas tipo, BCR, adecuacion
      garantias: ''
    },
    
    // Retención y eliminación
    plazoConservacion: '',
    criterioEliminacion: '',
    procedimientoEliminacion: '',
    
    // Seguridad
    medidasTecnicas: [],
    medidasOrganizativas: [],
    cifrado: false,
    seudonimizacion: false,
    anonimizacion: false,
    controlAcceso: '',
    respaldos: '',
    
    // Riesgos
    riesgosIdentificados: [],
    nivelRiesgo: '', // bajo, medio, alto, critico
    medidasMitigacion: [],
    requierePIA: false,
    
    // Derechos ARCO+
    procedimientoDerechos: '',
    plazosRespuesta: '20 días hábiles',
    
    // Metadatos
    fechaCreacion: new Date(),
    fechaActualizacion: new Date(),
    version: '1.0',
    estado: 'borrador', // borrador, revision, aprobado
    aprobadoPor: '',
    proximaRevision: ''
  });

  // Estados para flujos de datos y mapeo
  const [flujoDatos, setFlujoDatos] = useState({
    origen: '',
    destino: '',
    tipoFlujo: '', // interno, tercero, internacional
    frecuencia: '', // tiempo real, diario, semanal, mensual
    volumen: '', // registros
    metodoTransferencia: '', // API, SFTP, email, manual
    cifrado: false,
    anonimizado: false
  });

  const [mapaFlujos, setMapaFlujos] = useState([]);
  
  // Estado para trazabilidad
  const [trazabilidad, setTrazabilidad] = useState({
    datoSeleccionado: '',
    recorrido: []
  });

  // Estados para diálogos
  const [dialogRAT, setDialogRAT] = useState(false);
  const [dialogFlujo, setDialogFlujo] = useState(false);
  const [dialogTrazabilidad, setDialogTrazabilidad] = useState(false);
  const [dialogMatrizRiesgos, setDialogMatrizRiesgos] = useState(false);
  const [dialogPIA, setDialogPIA] = useState(false);
  
  // Estados para validación y progreso
  const [errores, setErrores] = useState([]);
  const [advertencias, setAdvertencias] = useState([]);
  const [progresoRAT, setProgresoRAT] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Pasos del proceso según manual Capítulo 3
  const pasos = [
    {
      label: 'Configuración de Empresa',
      descripcion: 'Datos básicos de la organización'
    },
    {
      label: 'Data Discovery',
      descripcion: 'Identificación de actividades de tratamiento'
    },
    {
      label: 'Clasificación de Datos',
      descripcion: 'Categorización por sensibilidad'
    },
    {
      label: 'Mapeo de Flujos',
      descripcion: 'Documentación de flujos de datos'
    },
    {
      label: 'Gestión de Retención',
      descripcion: 'Políticas de conservación y eliminación'
    },
    {
      label: 'Análisis de Riesgos',
      descripcion: 'Evaluación de impacto y riesgos'
    },
    {
      label: 'Medidas de Seguridad',
      descripcion: 'Controles técnicos y organizativos'
    },
    {
      label: 'Generación RAT',
      descripcion: 'Registro final de actividades'
    }
  ];

  // Funciones auxiliares
  const calcularProgresoActividad = (actividad) => {
    let campos = 0;
    let completados = 0;
    
    // Verificar campos obligatorios
    const camposObligatorios = [
      'nombre', 'area', 'proceso', 'responsable',
      'baseLicitud', 'plazoConservacion'
    ];
    
    camposObligatorios.forEach(campo => {
      campos++;
      if (actividad[campo] && actividad[campo] !== '') completados++;
    });
    
    // Arrays obligatorios
    const arraysObligatorios = [
      'finalidades', 'sistemas', 'medidasTecnicas'
    ];
    
    arraysObligatorios.forEach(campo => {
      campos++;
      if (actividad[campo] && actividad[campo].length > 0) completados++;
    });
    
    return Math.round((completados / campos) * 100);
  };

  const validarActividad = () => {
    const nuevosErrores = [];
    const nuevasAdvertencias = [];
    
    // Validaciones obligatorias
    if (!actividadActual.nombre) {
      nuevosErrores.push('El nombre de la actividad es obligatorio');
    }
    
    if (!actividadActual.baseLicitud) {
      nuevosErrores.push('Debe especificar la base de licitud');
    }
    
    if (actividadActual.finalidades.length === 0) {
      nuevosErrores.push('Debe especificar al menos una finalidad');
    }
    
    // Validaciones de datos sensibles
    const tieneDatosSensibles = 
      actividadActual.categoriasDatos.salud ||
      actividadActual.categoriasDatos.biometricos ||
      actividadActual.categoriasDatos.socioeconomicos ||
      actividadActual.categoriasDatos.geneticos ||
      actividadActual.categoriasDatos.sexuales ||
      actividadActual.categoriasDatos.sindicales ||
      actividadActual.categoriasDatos.religiosos ||
      actividadActual.categoriasDatos.politicos ||
      actividadActual.categoriasDatos.etnicos;
    
    if (tieneDatosSensibles && actividadActual.baseLicitud !== 'consentimiento_expreso') {
      nuevasAdvertencias.push('Datos sensibles requieren consentimiento expreso');
    }
    
    if (actividadActual.datosNNA && !actividadActual.consentimientoParental) {
      nuevosErrores.push('Datos de menores requieren consentimiento parental');
    }
    
    // Validación de transferencias internacionales
    if (actividadActual.transferenciasInternacionales.existe) {
      if (actividadActual.transferenciasInternacionales.paises.length === 0) {
        nuevosErrores.push('Debe especificar los países de destino');
      }
      if (!actividadActual.transferenciasInternacionales.mecanismo) {
        nuevosErrores.push('Debe especificar el mecanismo de transferencia');
      }
    }
    
    // Validación de riesgos altos
    if (actividadActual.nivelRiesgo === 'alto' || actividadActual.nivelRiesgo === 'critico') {
      if (!actividadActual.requierePIA) {
        nuevasAdvertencias.push('Riesgo alto/crítico requiere Evaluación de Impacto (PIA)');
      }
    }
    
    setErrores(nuevosErrores);
    setAdvertencias(nuevasAdvertencias);
    
    return nuevosErrores.length === 0;
  };

  const guardarActividad = () => {
    if (!validarActividad()) {
      setSnackbar({
        open: true,
        message: 'Por favor corrija los errores antes de guardar',
        severity: 'error'
      });
      return;
    }
    
    const nuevaActividad = {
      ...actividadActual,
      id: actividadActual.id || `ACT-${Date.now()}`,
      fechaActualizacion: new Date(),
      progreso: calcularProgresoActividad(actividadActual)
    };
    
    if (actividadActual.id) {
      // Actualizar existente
      setActividades(prev => 
        prev.map(act => act.id === actividadActual.id ? nuevaActividad : act)
      );
    } else {
      // Agregar nueva
      setActividades(prev => [...prev, nuevaActividad]);
    }
    
    setSnackbar({
      open: true,
      message: 'Actividad guardada exitosamente',
      severity: 'success'
    });
    
    setDialogRAT(false);
    resetFormulario();
  };

  const resetFormulario = () => {
    setActividadActual({
      id: '',
      nombre: '',
      area: '',
      proceso: '',
      responsable: '',
      finalidades: [],
      baseLicitud: '',
      justificacionBase: '',
      titulares: {
        empleados: false,
        clientes: false,
        proveedores: false,
        postulantes: false,
        menores: false,
        otros: ''
      },
      categoriasDatos: {
        identificacion: false,
        contacto: false,
        laborales: false,
        academicos: false,
        financieros: false,
        salud: false,
        biometricos: false,
        socioeconomicos: false,
        geneticos: false,
        sexuales: false,
        sindicales: false,
        religiosos: false,
        politicos: false,
        etnicos: false,
        iot: false,
        geolocalizacion: false,
        navegacion: false,
        otros: ''
      },
      datosSensibles: [],
      datosNNA: false,
      sistemas: [],
      ubicacionFisica: [],
      ubicacionDigital: [],
      flujosInternos: [],
      destinatariosInternos: [],
      encargados: [],
      cesionarios: [],
      transferenciasInternacionales: {
        existe: false,
        paises: [],
        mecanismo: '',
        garantias: ''
      },
      plazoConservacion: '',
      criterioEliminacion: '',
      procedimientoEliminacion: '',
      medidasTecnicas: [],
      medidasOrganizativas: [],
      cifrado: false,
      seudonimizacion: false,
      anonimizacion: false,
      controlAcceso: '',
      respaldos: '',
      riesgosIdentificados: [],
      nivelRiesgo: '',
      medidasMitigacion: [],
      requierePIA: false,
      procedimientoDerechos: '',
      plazosRespuesta: '20 días hábiles',
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
      version: '1.0',
      estado: 'borrador',
      aprobadoPor: '',
      proximaRevision: ''
    });
  };

  // Función para agregar flujo de datos
  const agregarFlujoDatos = () => {
    const nuevoFlujo = {
      ...flujoDatos,
      id: `FLUJO-${Date.now()}`,
      timestamp: new Date()
    };
    
    setMapaFlujos(prev => [...prev, nuevoFlujo]);
    
    // Actualizar trazabilidad
    if (flujoDatos.origen && flujoDatos.destino) {
      actualizarTrazabilidad(flujoDatos.origen, flujoDatos.destino);
    }
    
    setFlujoDatos({
      origen: '',
      destino: '',
      tipoFlujo: '',
      frecuencia: '',
      volumen: '',
      metodoTransferencia: '',
      cifrado: false,
      anonimizado: false
    });
    
    setSnackbar({
      open: true,
      message: 'Flujo de datos agregado',
      severity: 'success'
    });
  };

  // Función para actualizar trazabilidad
  const actualizarTrazabilidad = (origen, destino) => {
    setTrazabilidad(prev => ({
      ...prev,
      recorrido: [...prev.recorrido, { desde: origen, hasta: destino, fecha: new Date() }]
    }));
  };

  // Función para generar el RAT completo
  const generarRAT = () => {
    const ratCompleto = {
      empresa: empresa,
      fechaGeneracion: new Date(),
      version: '1.0',
      actividades: actividades,
      mapaFlujos: mapaFlujos,
      resumen: {
        totalActividades: actividades.length,
        actividadesConDatosSensibles: actividades.filter(a => 
          a.datosSensibles && a.datosSensibles.length > 0
        ).length,
        transferenciasInternacionales: actividades.filter(a => 
          a.transferenciasInternacionales.existe
        ).length,
        actividadesAltoRiesgo: actividades.filter(a => 
          a.nivelRiesgo === 'alto' || a.nivelRiesgo === 'critico'
        ).length,
        requierenPIA: actividades.filter(a => a.requierePIA).length
      },
      cumplimiento: {
        dpoDesignado: empresa.dpo.designado,
        ratCompleto: actividades.length > 0,
        medidasSeguridad: actividades.every(a => 
          a.medidasTecnicas.length > 0 && a.medidasOrganizativas.length > 0
        ),
        plazosDefinidos: actividades.every(a => a.plazoConservacion !== ''),
        riesgosEvaluados: actividades.every(a => a.nivelRiesgo !== '')
      }
    };
    
    // Simular descarga del RAT
    const blob = new Blob([JSON.stringify(ratCompleto, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RAT_${empresa.nombre}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSnackbar({
      open: true,
      message: 'RAT generado exitosamente',
      severity: 'success'
    });
  };

  // Componente de visualización de flujos
  const VisualizadorFlujos = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        <DeviceHub sx={{ mr: 1 }} />
        Mapa de Flujos de Datos
      </Typography>
      
      {mapaFlujos.length === 0 ? (
        <Alert severity="info">
          No hay flujos de datos documentados. Agregue flujos desde las actividades.
        </Alert>
      ) : (
        <Box>
          {mapaFlujos.map((flujo, index) => (
            <Card key={flujo.id} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Origen
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {flujo.origen}
                    </Typography>
                  </Grid>
                  <Grid item xs={1} sx={{ textAlign: 'center' }}>
                    <CompareArrows color="primary" />
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Destino
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {flujo.destino}
                    </Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Stack direction="row" spacing={1}>
                      <Chip 
                        label={flujo.tipoFlujo} 
                        size="small"
                        color={flujo.tipoFlujo === 'internacional' ? 'error' : 'default'}
                      />
                      <Chip 
                        label={flujo.frecuencia} 
                        size="small"
                      />
                      {flujo.cifrado && (
                        <Chip 
                          label="Cifrado" 
                          icon={<Lock />} 
                          size="small" 
                          color="success"
                        />
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
      
      <Button
        variant="outlined"
        startIcon={<Add />}
        onClick={() => setDialogFlujo(true)}
        sx={{ mt: 2 }}
      >
        Agregar Flujo
      </Button>
    </Paper>
  );

  // Componente de trazabilidad
  const Trazabilidad = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        <TimelineIcon sx={{ mr: 1 }} />
        Trazabilidad de Datos
      </Typography>
      
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Seleccionar tipo de dato a rastrear</InputLabel>
        <Select
          value={trazabilidad.datoSeleccionado}
          onChange={(e) => setTrazabilidad({...trazabilidad, datoSeleccionado: e.target.value})}
        >
          <MenuItem value="rut">RUT</MenuItem>
          <MenuItem value="email">Email</MenuItem>
          <MenuItem value="telefono">Teléfono</MenuItem>
          <MenuItem value="direccion">Dirección</MenuItem>
          <MenuItem value="salud">Datos de Salud</MenuItem>
          <MenuItem value="biometrico">Datos Biométricos</MenuItem>
          <MenuItem value="financiero">Datos Financieros</MenuItem>
          <MenuItem value="socioeconomico">Situación Socioeconómica</MenuItem>
        </Select>
      </FormControl>
      
      {trazabilidad.datoSeleccionado && (
        <Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            Rastreando: <strong>{trazabilidad.datoSeleccionado}</strong>
          </Alert>
          
          <Typography variant="subtitle2" gutterBottom>
            Recorrido del dato:
          </Typography>
          
          <List>
            {actividades
              .filter(act => {
                // Filtrar actividades que usen este tipo de dato
                switch(trazabilidad.datoSeleccionado) {
                  case 'rut':
                  case 'email':
                  case 'telefono':
                    return act.categoriasDatos.identificacion || act.categoriasDatos.contacto;
                  case 'direccion':
                    return act.categoriasDatos.contacto;
                  case 'salud':
                    return act.categoriasDatos.salud;
                  case 'biometrico':
                    return act.categoriasDatos.biometricos;
                  case 'financiero':
                    return act.categoriasDatos.financieros;
                  case 'socioeconomico':
                    return act.categoriasDatos.socioeconomicos;
                  default:
                    return false;
                }
              })
              .map((act, index) => (
                <ListItem key={act.id}>
                  <ListItemIcon>
                    <Badge badgeContent={index + 1} color="primary">
                      <FolderOpen />
                    </Badge>
                  </ListItemIcon>
                  <ListItemText
                    primary={act.nombre}
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          Área: {act.area} | Responsable: {act.responsable}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Sistemas: {act.sistemas.join(', ')}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Retención: {act.plazoConservacion}
                        </Typography>
                        {act.encargados.length > 0 && (
                          <Typography variant="caption" display="block" color="warning.main">
                            Compartido con: {act.encargados.join(', ')}
                          </Typography>
                        )}
                        {act.transferenciasInternacionales.existe && (
                          <Typography variant="caption" display="block" color="error.main">
                            Transferencia internacional: {act.transferenciasInternacionales.paises.join(', ')}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
          </List>
          
          {trazabilidad.recorrido.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Flujos registrados:
              </Typography>
              {trazabilidad.recorrido.map((paso, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Chip label={paso.desde} size="small" />
                  <SyncAlt sx={{ mx: 1 }} />
                  <Chip label={paso.hasta} size="small" />
                  <Typography variant="caption" sx={{ ml: 2 }}>
                    {new Date(paso.fecha).toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );

  // Matriz de riesgos
  const MatrizRiesgos = () => {
    const riesgos = [
      { 
        nivel: 'critico', 
        descripcion: 'Brecha de datos sensibles',
        probabilidad: 'media',
        impacto: 'muy alto',
        color: '#d32f2f'
      },
      { 
        nivel: 'alto', 
        descripcion: 'Acceso no autorizado',
        probabilidad: 'alta',
        impacto: 'alto',
        color: '#f57c00'
      },
      { 
        nivel: 'medio', 
        descripcion: 'Retención excesiva',
        probabilidad: 'alta',
        impacto: 'medio',
        color: '#fbc02d'
      },
      { 
        nivel: 'bajo', 
        descripcion: 'Errores en datos',
        probabilidad: 'media',
        impacto: 'bajo',
        color: '#689f38'
      }
    ];
    
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          <Assessment sx={{ mr: 1 }} />
          Matriz de Riesgos
        </Typography>
        
        <Grid container spacing={2}>
          {riesgos.map((riesgo, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ borderLeft: `4px solid ${riesgo.color}` }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ color: riesgo.color }}>
                    Riesgo {riesgo.nivel.toUpperCase()}
                  </Typography>
                  <Typography variant="body1">
                    {riesgo.descripcion}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      label={`Probabilidad: ${riesgo.probabilidad}`} 
                      size="small" 
                      sx={{ mr: 1 }}
                    />
                    <Chip 
                      label={`Impacto: ${riesgo.impacto}`} 
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Alert severity="warning" sx={{ mt: 2 }}>
          Actividades con riesgo alto o crítico requieren Evaluación de Impacto (PIA)
        </Alert>
      </Paper>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
            <Science /> Sandbox Completo - Sistema RAT Profesional
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, color: 'white' }}>
            Simulación completa del Registro de Actividades de Tratamiento según Ley 21.719
          </Typography>
          <Alert severity="info" sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.15)', color: 'white' }}>
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              💡 <strong>Tip:</strong> Conceptos técnicos como <strong>RAT, Data Discovery, Actividad de Tratamiento, 
              Bases de Licitud, Encargado de Tratamiento</strong> y toda la terminología especializada del sandbox 
              están detallados en nuestro <strong>Glosario LPDP completo</strong> con definiciones profesionales 
              y ejemplos específicos para la realidad chilena.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Alert del manual */}
      <Alert severity="info" icon={<Book />} sx={{ mb: 3 }}>
        <AlertTitle>Siguiendo el Manual Capítulo 3</AlertTitle>
        Este sandbox implementa todos los procedimientos del manual:
        <ul style={{ marginTop: 8, marginBottom: 0 }}>
          <li>Data Discovery por procesos, no por bases de datos</li>
          <li>Clasificación con situación socioeconómica como dato sensible (Chile)</li>
          <li>Documentación completa de flujos de datos</li>
          <li>Trazabilidad de extremo a extremo</li>
          <li>Gestión de retención y eliminación</li>
          <li>Análisis de riesgos y PIA cuando aplique</li>
        </ul>
      </Alert>

      {/* Stepper principal */}
      <Stepper activeStep={activeStep} orientation="vertical">
        {pasos.map((paso, index) => (
          <Step key={paso.label}>
            <StepLabel>{paso.label}</StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" paragraph>
                {paso.descripcion}
              </Typography>
              
              {/* Contenido específico por paso */}
              {index === 0 && (
                // Configuración de empresa
                <Paper sx={{ p: 3, mb: 2 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Nombre de la Empresa"
                        value={empresa.nombre}
                        onChange={(e) => setEmpresa({...empresa, nombre: e.target.value})}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="RUT"
                        value={empresa.rut}
                        onChange={(e) => setEmpresa({...empresa, rut: e.target.value})}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Sector</InputLabel>
                        <Select
                          value={empresa.sector}
                          onChange={(e) => setEmpresa({...empresa, sector: e.target.value})}
                        >
                          <MenuItem value="acuicultura">Acuicultura/Salmonicultura</MenuItem>
                          <MenuItem value="manufactura">Manufactura</MenuItem>
                          <MenuItem value="servicios">Servicios</MenuItem>
                          <MenuItem value="retail">Retail</MenuItem>
                          <MenuItem value="salud">Salud</MenuItem>
                          <MenuItem value="educacion">Educación</MenuItem>
                          <MenuItem value="tecnologia">Tecnología</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Tamaño</InputLabel>
                        <Select
                          value={empresa.tamano}
                          onChange={(e) => setEmpresa({...empresa, tamano: e.target.value})}
                        >
                          <MenuItem value="micro">Microempresa (1-9)</MenuItem>
                          <MenuItem value="pequena">Pequeña (10-49)</MenuItem>
                          <MenuItem value="mediana">Mediana (50-199)</MenuItem>
                          <MenuItem value="grande">Grande (200+)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={empresa.dpo.designado}
                            onChange={(e) => setEmpresa({
                              ...empresa, 
                              dpo: {...empresa.dpo, designado: e.target.checked}
                            })}
                          />
                        }
                        label="¿DPO Designado?"
                      />
                    </Grid>
                    {empresa.dpo.designado && (
                      <>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Nombre del DPO"
                            value={empresa.dpo.nombre}
                            onChange={(e) => setEmpresa({
                              ...empresa,
                              dpo: {...empresa.dpo, nombre: e.target.value}
                            })}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Email del DPO"
                            value={empresa.dpo.email}
                            onChange={(e) => setEmpresa({
                              ...empresa,
                              dpo: {...empresa.dpo, email: e.target.value}
                            })}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Teléfono del DPO"
                            value={empresa.dpo.telefono}
                            onChange={(e) => setEmpresa({
                              ...empresa,
                              dpo: {...empresa.dpo, telefono: e.target.value}
                            })}
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Paper>
              )}

              {index === 1 && (
                // Data Discovery
                <Paper sx={{ p: 3, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Descubrimiento de Actividades de Tratamiento
                  </Typography>
                  
                  <Alert severity="info" sx={{ mb: 2 }}>
                    💡 Pregunta clave: "¿Qué PROCESOS realizan que involucren información de personas?"
                    NO preguntar por bases de datos.
                    <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                      📚 <strong>Tip:</strong> La metodología de <strong>Data Discovery, Mapeo de Procesos, 
                      Identificación de Titulares</strong> y las técnicas específicas de entrevistas estructuradas 
                      están explicadas paso a paso en nuestro <strong>Glosario LPDP</strong> con guías prácticas 
                      para implementación en empresas chilenas.
                    </Typography>
                  </Alert>
                  
                  <Grid container spacing={3}>
                    {Object.entries(areasNegocio).map(([key, area]) => (
                      <Grid item xs={12} md={6} key={key}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {area.icon} {area.nombre}
                            </Typography>
                            <List dense>
                              {area.procesos.map((proceso, idx) => (
                                <ListItem key={idx}>
                                  <ListItemIcon>
                                    <CheckCircle fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText primary={proceso} />
                                  <IconButton 
                                    size="small"
                                    onClick={() => {
                                      setActividadActual({
                                        ...actividadActual,
                                        area: area.nombre,
                                        proceso: proceso,
                                        nombre: `${proceso} - ${area.nombre}`
                                      });
                                      setDialogRAT(true);
                                    }}
                                  >
                                    <Add />
                                  </IconButton>
                                </ListItem>
                              ))}
                            </List>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                  
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Actividades identificadas: {actividades.length}
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => setDialogRAT(true)}
                    >
                      Agregar Actividad Manual
                    </Button>
                  </Box>
                </Paper>
              )}

              {index === 2 && (
                // Clasificación de datos
                <Paper sx={{ p: 3, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Clasificación de Datos por Sensibilidad
                  </Typography>
                  
                  <Alert severity="error" sx={{ mb: 2 }}>
                    ⚠️ NOVEDAD CHILENA: La "situación socioeconómica" es DATO SENSIBLE
                    <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                      📖 <strong>Tip:</strong> Las diferencias clave entre Chile y Europa en <strong>Datos Sensibles, 
                      Situación Socioeconómica, Consentimiento Expreso, Datos de NNA</strong> están desarrolladas 
                      comparativamente en nuestro <strong>Glosario LPDP</strong> con análisis jurisprudencial 
                      y casos prácticos chilenos específicos.
                    </Typography>
                  </Alert>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            Datos Comunes
                          </Typography>
                          <List dense>
                            <ListItem>
                              <ListItemIcon><Person /></ListItemIcon>
                              <ListItemText primary="Identificación" secondary="Nombre, RUT, email" />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon><Phone /></ListItemIcon>
                              <ListItemText primary="Contacto" secondary="Teléfono, dirección" />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon><Work /></ListItemIcon>
                              <ListItemText primary="Laborales" secondary="Cargo, área, antigüedad" />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon><School /></ListItemIcon>
                              <ListItemText primary="Académicos" secondary="Títulos, certificaciones" />
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Card sx={{ borderLeft: '4px solid', borderColor: 'error.main' }}>
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight={600} gutterBottom color="error">
                            Datos Sensibles (Requieren Consentimiento Expreso)
                          </Typography>
                          <List dense>
                            <ListItem>
                              <ListItemIcon><MonetizationOn color="error" /></ListItemIcon>
                              <ListItemText 
                                primary="Situación Socioeconómica" 
                                secondary="Score crediticio, ingresos, deudas (CHILE)"
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon><LocalHospital color="error" /></ListItemIcon>
                              <ListItemText primary="Salud" secondary="Licencias, exámenes, discapacidades" />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon><Fingerprint color="error" /></ListItemIcon>
                              <ListItemText primary="Biométricos" secondary="Huella, facial, iris" />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon><ChildCare color="error" /></ListItemIcon>
                              <ListItemText primary="Menores (NNA)" secondary="Requiere consentimiento parental" />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon><Diversity3 color="error" /></ListItemIcon>
                              <ListItemText primary="Origen étnico/racial" />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon><Favorite color="error" /></ListItemIcon>
                              <ListItemText primary="Vida/orientación sexual" />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon><Groups color="error" /></ListItemIcon>
                              <ListItemText primary="Afiliación sindical/política" />
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                  
                  {actividades.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Resumen de clasificación:
                      </Typography>
                      <Stack direction="row" spacing={2}>
                        <Chip 
                          label={`${actividades.filter(a => a.datosSensibles.length > 0).length} con datos sensibles`}
                          color="error"
                        />
                        <Chip 
                          label={`${actividades.filter(a => a.datosNNA).length} con datos de menores`}
                          color="warning"
                        />
                        <Chip 
                          label={`${actividades.filter(a => a.categoriasDatos.socioeconomicos).length} con datos socioeconómicos`}
                          color="error"
                        />
                      </Stack>
                    </Box>
                  )}
                </Paper>
              )}

              {index === 3 && (
                // Mapeo de flujos
                <Box>
                  <VisualizadorFlujos />
                  <Box sx={{ mt: 3 }}>
                    <Trazabilidad />
                  </Box>
                </Box>
              )}

              {index === 4 && (
                // Gestión de retención
                <Paper sx={{ p: 3, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    <Timer sx={{ mr: 1 }} />
                    Políticas de Retención y Eliminación
                  </Typography>
                  
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Principio de limitación del plazo: Solo conservar mientras sea necesario
                    <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                      ⏱️ <strong>Tip:</strong> Los conceptos de <strong>Plazo de Conservación, Supresión de Datos, 
                      Principio de Limitación, Criterios de Eliminación</strong> y las obligaciones específicas 
                      del Código Tributario y Código del Trabajo están explicados en detalle en nuestro 
                      <strong>Glosario LPDP</strong> con tablas de referencia práctica.
                    </Typography>
                  </Alert>
                  
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Tipo de Dato</TableCell>
                          <TableCell>Plazo Legal Chile</TableCell>
                          <TableCell>Fundamento</TableCell>
                          <TableCell>Procedimiento Eliminación</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Documentos tributarios</TableCell>
                          <TableCell>6 años</TableCell>
                          <TableCell>Código Tributario</TableCell>
                          <TableCell>Eliminación segura post-auditoría</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Documentos laborales</TableCell>
                          <TableCell>2 años post-término</TableCell>
                          <TableCell>Código del Trabajo</TableCell>
                          <TableCell>Destrucción certificada</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Documentos previsionales</TableCell>
                          <TableCell>30 años</TableCell>
                          <TableCell>DL 3.500</TableCell>
                          <TableCell>Archivo histórico</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>CVs no seleccionados</TableCell>
                          <TableCell>6 meses</TableCell>
                          <TableCell>Buena práctica</TableCell>
                          <TableCell>Eliminación automática</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Datos marketing</TableCell>
                          <TableCell>Mientras consentimiento activo</TableCell>
                          <TableCell>Consentimiento</TableCell>
                          <TableCell>Eliminación tras opt-out</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Logs de seguridad</TableCell>
                          <TableCell>1 año</TableCell>
                          <TableCell>Seguridad</TableCell>
                          <TableCell>Rotación automática</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Datos IoT</TableCell>
                          <TableCell>2 años detalle, 10 años agregado</TableCell>
                          <TableCell>Operacional/Histórico</TableCell>
                          <TableCell>Agregación y archivo</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {actividades.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Estado de políticas de retención:
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(actividades.filter(a => a.plazoConservacion !== '').length / actividades.length) * 100}
                      />
                      <Typography variant="caption">
                        {actividades.filter(a => a.plazoConservacion !== '').length} de {actividades.length} actividades con plazos definidos
                      </Typography>
                    </Box>
                  )}
                </Paper>
              )}

              {index === 5 && (
                // Análisis de riesgos
                <MatrizRiesgos />
              )}

              {index === 6 && (
                // Medidas de seguridad
                <Paper sx={{ p: 3, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    <Security sx={{ mr: 1 }} />
                    Medidas de Seguridad
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            Medidas Técnicas
                          </Typography>
                          <FormGroup>
                            <FormControlLabel control={<Checkbox />} label="Cifrado en tránsito (TLS/SSL)" />
                            <FormControlLabel control={<Checkbox />} label="Cifrado en reposo (AES-256)" />
                            <FormControlLabel control={<Checkbox />} label="Control de acceso (RBAC)" />
                            <FormControlLabel control={<Checkbox />} label="Autenticación multifactor" />
                            <FormControlLabel control={<Checkbox />} label="Logs de auditoría" />
                            <FormControlLabel control={<Checkbox />} label="Respaldos automatizados" />
                            <FormControlLabel control={<Checkbox />} label="Seudonimización" />
                            <FormControlLabel control={<Checkbox />} label="Anonimización (cuando aplique)" />
                            <FormControlLabel control={<Checkbox />} label="Firewall/IDS/IPS" />
                            <FormControlLabel control={<Checkbox />} label="Antivirus/Antimalware" />
                            <FormControlLabel control={<Checkbox />} label="Segmentación de red" />
                            <FormControlLabel control={<Checkbox />} label="VPN para acceso remoto" />
                          </FormGroup>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            Medidas Organizativas
                          </Typography>
                          <FormGroup>
                            <FormControlLabel control={<Checkbox />} label="Políticas de seguridad documentadas" />
                            <FormControlLabel control={<Checkbox />} label="Capacitación periódica del personal" />
                            <FormControlLabel control={<Checkbox />} label="Acuerdos de confidencialidad" />
                            <FormControlLabel control={<Checkbox />} label="Procedimiento de gestión de incidentes" />
                            <FormControlLabel control={<Checkbox />} label="Plan de continuidad del negocio" />
                            <FormControlLabel control={<Checkbox />} label="Evaluaciones de riesgo periódicas" />
                            <FormControlLabel control={<Checkbox />} label="Auditorías de seguridad" />
                            <FormControlLabel control={<Checkbox />} label="Control de acceso físico" />
                            <FormControlLabel control={<Checkbox />} label="Destrucción segura de medios" />
                            <FormControlLabel control={<Checkbox />} label="Gestión de proveedores" />
                            <FormControlLabel control={<Checkbox />} label="Principio de menor privilegio" />
                            <FormControlLabel control={<Checkbox />} label="Segregación de funciones" />
                          </FormGroup>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {index === 7 && (
                // Generación del RAT
                <Paper sx={{ p: 3, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    <Assignment sx={{ mr: 1 }} />
                    Registro de Actividades de Tratamiento (RAT)
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Resumen del RAT
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}>
                        <Card>
                          <CardContent>
                            <Typography variant="h4">{actividades.length}</Typography>
                            <Typography variant="caption">Actividades totales</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Card>
                          <CardContent>
                            <Typography variant="h4" color="error">
                              {actividades.filter(a => a.datosSensibles.length > 0).length}
                            </Typography>
                            <Typography variant="caption">Con datos sensibles</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Card>
                          <CardContent>
                            <Typography variant="h4" color="warning.main">
                              {actividades.filter(a => a.transferenciasInternacionales.existe).length}
                            </Typography>
                            <Typography variant="caption">Transferencias internacionales</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Card>
                          <CardContent>
                            <Typography variant="h4" color="success.main">
                              {mapaFlujos.length}
                            </Typography>
                            <Typography variant="caption">Flujos mapeados</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<Download />}
                      onClick={generarRAT}
                      disabled={actividades.length === 0}
                    >
                      Generar RAT Completo
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Print />}
                      disabled={actividades.length === 0}
                    >
                      Vista Previa
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Email />}
                      disabled={actividades.length === 0}
                    >
                      Enviar a DPO
                    </Button>
                  </Stack>
                  
                  {actividades.length === 0 && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      Debe documentar al menos una actividad de tratamiento
                    </Alert>
                  )}
                </Paper>
              )}
              
              {/* Botones de navegación */}
              <Box sx={{ mt: 2 }}>
                <Button
                  disabled={index === 0}
                  onClick={() => setActiveStep(index - 1)}
                  sx={{ mr: 1 }}
                >
                  Anterior
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setActiveStep(index + 1)}
                  disabled={index === pasos.length - 1}
                >
                  {index === pasos.length - 1 ? 'Finalizar' : 'Siguiente'}
                </Button>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {/* Lista de actividades documentadas */}
      {actividades.length > 0 && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Actividades Documentadas ({actividades.length})
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Área</TableCell>
                  <TableCell>Datos Sensibles</TableCell>
                  <TableCell>Riesgo</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Progreso</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {actividades.map((actividad) => (
                  <TableRow key={actividad.id}>
                    <TableCell>{actividad.id}</TableCell>
                    <TableCell>{actividad.nombre}</TableCell>
                    <TableCell>{actividad.area}</TableCell>
                    <TableCell>
                      {actividad.datosSensibles.length > 0 ? (
                        <Chip label="Sí" color="error" size="small" />
                      ) : (
                        <Chip label="No" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={actividad.nivelRiesgo || 'No evaluado'} 
                        size="small"
                        color={
                          actividad.nivelRiesgo === 'critico' ? 'error' :
                          actividad.nivelRiesgo === 'alto' ? 'warning' :
                          actividad.nivelRiesgo === 'medio' ? 'info' :
                          'default'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={actividad.estado} 
                        size="small"
                        color={actividad.estado === 'aprobado' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <LinearProgress 
                        variant="determinate" 
                        value={actividad.progreso || 0}
                        sx={{ width: 60 }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small"
                        onClick={() => {
                          setActividadActual(actividad);
                          setDialogRAT(true);
                        }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        size="small"
                        onClick={() => {
                          setActividades(prev => prev.filter(a => a.id !== actividad.id));
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Dialog para agregar/editar actividad RAT */}
      <Dialog open={dialogRAT} onClose={() => setDialogRAT(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {actividadActual.id ? 'Editar' : 'Nueva'} Actividad de Tratamiento
        </DialogTitle>
        <DialogContent>
          <Tabs value={0}>
            <Tab label="Información Básica" />
            <Tab label="Datos y Titulares" />
            <Tab label="Flujos y Terceros" />
            <Tab label="Seguridad y Riesgos" />
            <Tab label="Retención" />
          </Tabs>
          
          <Box sx={{ mt: 3 }}>
            {/* Tab 1: Información Básica */}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre de la Actividad"
                  value={actividadActual.nombre}
                  onChange={(e) => setActividadActual({...actividadActual, nombre: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Área de Negocio</InputLabel>
                  <Select
                    value={actividadActual.area}
                    onChange={(e) => setActividadActual({...actividadActual, area: e.target.value})}
                  >
                    {Object.entries(areasNegocio).map(([key, area]) => (
                      <MenuItem key={key} value={area.nombre}>{area.nombre}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Responsable del Proceso"
                  value={actividadActual.responsable}
                  onChange={(e) => setActividadActual({...actividadActual, responsable: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={[
                    'Prestación de servicios',
                    'Cumplimiento legal',
                    'Gestión de personal',
                    'Marketing y ventas',
                    'Seguridad',
                    'Análisis y mejora',
                    'Investigación'
                  ]}
                  value={actividadActual.finalidades}
                  onChange={(e, value) => setActividadActual({...actividadActual, finalidades: value})}
                  renderInput={(params) => (
                    <TextField {...params} label="Finalidades del Tratamiento" />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Base de Licitud</InputLabel>
                  <Select
                    value={actividadActual.baseLicitud}
                    onChange={(e) => setActividadActual({...actividadActual, baseLicitud: e.target.value})}
                  >
                    <MenuItem value="consentimiento">Consentimiento</MenuItem>
                    <MenuItem value="consentimiento_expreso">Consentimiento Expreso (datos sensibles)</MenuItem>
                    <MenuItem value="contrato">Ejecución de contrato</MenuItem>
                    <MenuItem value="obligacion_legal">Obligación legal</MenuItem>
                    <MenuItem value="interes_vital">Interés vital</MenuItem>
                    <MenuItem value="interes_publico">Interés público</MenuItem>
                    <MenuItem value="interes_legitimo">Interés legítimo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
          
          {/* Mostrar errores y advertencias */}
          {errores.length > 0 && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errores.map((error, idx) => (
                <div key={idx}>• {error}</div>
              ))}
            </Alert>
          )}
          
          {advertencias.length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {advertencias.map((advertencia, idx) => (
                <div key={idx}>• {advertencia}</div>
              ))}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogRAT(false)}>Cancelar</Button>
          <Button variant="contained" onClick={guardarActividad}>
            Guardar Actividad
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para agregar flujo de datos */}
      <Dialog open={dialogFlujo} onClose={() => setDialogFlujo(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Flujo de Datos</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Origen"
                value={flujoDatos.origen}
                onChange={(e) => setFlujoDatos({...flujoDatos, origen: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Destino"
                value={flujoDatos.destino}
                onChange={(e) => setFlujoDatos({...flujoDatos, destino: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Flujo</InputLabel>
                <Select
                  value={flujoDatos.tipoFlujo}
                  onChange={(e) => setFlujoDatos({...flujoDatos, tipoFlujo: e.target.value})}
                >
                  <MenuItem value="interno">Interno</MenuItem>
                  <MenuItem value="tercero">Tercero Nacional</MenuItem>
                  <MenuItem value="internacional">Internacional</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Frecuencia</InputLabel>
                <Select
                  value={flujoDatos.frecuencia}
                  onChange={(e) => setFlujoDatos({...flujoDatos, frecuencia: e.target.value})}
                >
                  <MenuItem value="tiempo_real">Tiempo Real</MenuItem>
                  <MenuItem value="diario">Diario</MenuItem>
                  <MenuItem value="semanal">Semanal</MenuItem>
                  <MenuItem value="mensual">Mensual</MenuItem>
                  <MenuItem value="eventual">Eventual</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={flujoDatos.cifrado}
                    onChange={(e) => setFlujoDatos({...flujoDatos, cifrado: e.target.checked})}
                  />
                }
                label="Transferencia cifrada"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogFlujo(false)}>Cancelar</Button>
          <Button variant="contained" onClick={agregarFlujoDatos}>
            Agregar Flujo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <Alert 
          onClose={() => setSnackbar({...snackbar, open: false})} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// Íconos adicionales necesarios
const Person = People;
const Work = Engineering;
const Groups = Group;

export default SandboxCompleto;