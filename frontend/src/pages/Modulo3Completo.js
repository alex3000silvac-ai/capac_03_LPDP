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
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  Alert,
  AlertTitle,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Stack,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  Badge,
  LinearProgress,
  Rating,
  ToggleButton,
  ToggleButtonGroup,
  Collapse,
  Container,
  FormHelperText,
  InputAdornment,
  Breadcrumbs,
  Link,
  Avatar,
  AvatarGroup,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Drawer,
  AppBar,
  Toolbar,
  Switch,
  Slider,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/material';
import {
  ExpandMore,
  CheckCircle,
  Warning,
  Error,
  Info,
  Assignment,
  Business,
  People,
  Storage,
  Security,
  Delete,
  Timer,
  CloudUpload,
  Public,
  Lock,
  VpnKey,
  MonetizationOn,
  LocalHospital,
  Fingerprint,
  ChildCare,
  Group,
  AccountTree,
  DataUsage,
  Assessment,
  Download,
  Upload,
  Save,
  Print,
  Share,
  Edit,
  Add,
  Remove,
  Search,
  FilterList,
  Help,
  School,
  WorkspacePremium,
  TrendingUp,
  Visibility,
  VisibilityOff,
  NavigateNext,
  NavigateBefore,
  PlayArrow,
  Pause,
  Stop,
  Refresh,
  Settings,
  Description,
  FolderOpen,
  InsertDriveFile,
  Code,
  IntegrationInstructions,
  Psychology,
  QuestionAnswer,
  LiveHelp,
  SupportAgent,
  AutoAwesome,
  Lightbulb,
  TaskAlt,
  RadioButtonUnchecked,
  CircleOutlined,
  CheckCircleOutline,
  Cancel,
  DoNotDisturbOn,
  ReportProblem,
  WarningAmber,
  NewReleases,
  NotificationImportant,
  PriorityHigh,
  Flag,
  Bookmark,
  BookmarkBorder,
  Star,
  StarBorder,
  Favorite,
  FavoriteBorder,
  ThumbUp,
  ThumbDown,
  Comment,
  Forum,
  QuestionMark,
  HelpOutline,
  InfoOutlined,
  ErrorOutline,
  WarningOutlined,
  CheckCircleOutlined,
  RadioButtonChecked,
  CheckBox,
  CheckBoxOutlineBlank,
  IndeterminateCheckBox,
  ToggleOn,
  ToggleOff,
  DoneAll,
  DoneOutline,
  Done,
  Clear,
  Close,
  CloseFullscreen,
  OpenInFull,
  OpenInNew,
  OpenWith,
  ZoomIn,
  ZoomOut,
  ZoomOutMap,
  Fullscreen,
  FullscreenExit,
  AspectRatio,
  ViewModule,
  ViewList,
  ViewHeadline,
  ViewDay,
  ViewWeek,
  ViewAgenda,
  ViewColumn,
  ViewCarousel,
  ViewComfy,
  ViewCompact,
  ViewKanban,
  ViewQuilt,
  ViewStream,
  ViewArray,
  Apps,
  GridOn,
  GridView,
  Window,
  WebAsset,
  Web,
  DashboardCustomize,
  Dashboard,
  BarChart,
  ShowChart,
  LineAxis,
  MultilineChart,
  BubbleChart,
  PieChart,
  DonutLarge,
  DonutSmall,
  Analytics,
  QueryStats,
  DataThresholding,
  DataSaverOn,
  DataSaverOff,
  Dataset,
  DataObject,
  DataArray,
  Schema,
  Hub,
  Webhook,
  Api,
  Terminal,
  DeveloperMode,
  DeveloperBoard,
  BugReport,
  PestControl,
  Engineering,
  Science,
  Biotech,
  HealthAndSafety,
  MedicalServices,
  Vaccines,
  Coronavirus,
  Masks,
  Sanitizer,
  CleanHands,
  Sick,
  PersonSearch,
  GroupWork,
  Groups,
  Diversity1,
  Diversity2,
  Diversity3,
  GroupAdd,
  GroupRemove,
  GroupOff,
  ManageAccounts,
  AdminPanelSettings,
  SupervisorAccount,
  Badge as BadgeIcon,
  VerifiedUser,
  Shield,
  GppGood,
  GppBad,
  GppMaybe,
  PrivacyTip,
  LockOpen,
  LockClock,
  LockReset,
  LockPerson,
  Password,
  Pattern,
  Pin,
  Key,
  VpnLock,
  EnhancedEncryption,
  NoEncryption,
  RemoveRedEye,
  SecurityUpdate,
  SecurityUpdateGood,
  SecurityUpdateWarning,
  SystemSecurityUpdate,
  SystemSecurityUpdateGood,
  SystemSecurityUpdateWarning,
  Policy,
  Rule,
  FactCheck,
  Checklist,
  PlaylistAddCheck,
  PlaylistAddCheckCircle,
  TaskAlt as TaskAltIcon,
  Task,
  AssignmentTurnedIn,
  AssignmentLate,
  AssignmentReturned,
  AssignmentReturn,
  AssignmentInd,
  AssignmentIndOutlined,
  Work,
  WorkHistory,
  WorkOff,
  WorkOutline,
  PendingActions,
  Schedule,
  Update,
  Pending,
  HourglassEmpty,
  HourglassFull,
  HourglassTop,
  HourglassBottom,
  HourglassDisabled,
  MoreTime,
  AccessTime,
  AccessTimeFilled,
  AccessAlarm,
  AccessAlarms,
  AlarmOn,
  AlarmOff,
  AlarmAdd,
  Alarm,
  WatchLater,
  DateRange,
  EditCalendar,
  EventNote,
  EventAvailable,
  EventBusy,
  EventRepeat,
  Event,
  Today,
  CalendarMonth,
  CalendarToday,
  CalendarViewDay,
  CalendarViewWeek,
  CalendarViewMonth,
} from '@mui/icons-material';

// Importar todas las fases y procedimientos del manual
const FASES_DATA_DISCOVERY = {
  fase1: {
    titulo: "FASE 1: Conformación del Equipo de Trabajo",
    descripcion: "El DPO debe liderar un equipo multidisciplinario para el levantamiento inicial del inventario",
    participantes: [
      { area: "DPO", rol: "Líder del proyecto", responsabilidad: "Coordinar el levantamiento completo del inventario" },
      { area: "RRHH", rol: "Representante de procesos", responsabilidad: "Documentar todos los tratamientos de datos de empleados y candidatos" },
      { area: "Finanzas", rol: "Representante de procesos", responsabilidad: "Identificar tratamientos de datos financieros y crediticios" },
      { area: "Marketing", rol: "Representante de procesos", responsabilidad: "Mapear datos de clientes y campañas" },
      { area: "Ventas", rol: "Representante de procesos", responsabilidad: "Documentar procesos comerciales con datos" },
      { area: "Operaciones", rol: "Representante de procesos", responsabilidad: "Identificar datos operativos y de producción" },
      { area: "TI", rol: "Soporte técnico", responsabilidad: "Proveer información sobre sistemas y seguridad" },
      { area: "Legal", rol: "Asesor legal", responsabilidad: "Validar bases de licitud y cumplimiento normativo" }
    ],
    entregables: [
      "Acta de constitución del equipo",
      "Cronograma de trabajo",
      "Matriz de responsabilidades RACI"
    ]
  },
  fase2: {
    titulo: "FASE 2: Metodología de Levantamiento",
    descripcion: "El proceso NO debe centrarse en preguntar '¿qué bases de datos tienen?', sino en '¿qué actividades o procesos realizan que involucren información de personas?'",
    metodologia: {
      enfoque_correcto: "Preguntar por ACTIVIDADES y PROCESOS, no por sistemas",
      tecnicas: [
        "Entrevistas estructuradas con dueños de procesos",
        "Talleres de mapeo por departamento",
        "Observación de procesos en terreno",
        "Revisión de documentación existente"
      ],
      preguntas_clave: {
        rrhh: [
          "¿Cuál es el proceso completo desde que reciben un currículum hasta que se contrata a una persona?",
          "¿Qué información solicitan?",
          "¿Dónde la guardan?",
          "¿Con quién la comparten (ej. empresa de exámenes preocupacionales)?",
          "¿Por cuánto tiempo la conservan si la persona no es contratada?"
        ],
        finanzas: [
          "¿Cómo evalúan la capacidad crediticia de un cliente?",
          "¿Qué información financiera solicitan?",
          "¿Con qué centrales de riesgo se conectan?",
          "¿Cómo manejan los datos de situación socioeconómica?"
        ],
        marketing: [
          "¿Qué información recopilan de los clientes?",
          "¿Cómo segmentan sus bases de datos?",
          "¿Qué herramientas de analytics utilizan?",
          "¿Realizan transferencias internacionales (Google, Facebook)?"
        ],
        operaciones: [
          "¿Qué datos generan los sensores IoT?",
          "¿Pueden vincularse estos datos a personas específicas?",
          "¿Cómo monitorean al personal en terreno?",
          "¿Qué información comparten con SERNAPESCA?"
        ]
      }
    }
  },
  fase3: {
    titulo: "FASE 3: Documentación de Actividades de Tratamiento",
    descripcion: "Para cada actividad identificada, el equipo debe documentar la información completa del RAT",
    campos_rat: [
      {
        campo: "Nombre de la actividad de tratamiento",
        ejemplo: "Proceso de Reclutamiento y Selección",
        obligatorio: true
      },
      {
        campo: "Finalidad(es) del tratamiento",
        ejemplo: "Evaluar la idoneidad de los candidatos para vacantes laborales",
        obligatorio: true
      },
      {
        campo: "Base de licitud",
        ejemplo: "Consentimiento del candidato, Medidas precontractuales",
        obligatorio: true,
        opciones: [
          "Consentimiento",
          "Ejecución de contrato",
          "Obligación legal",
          "Interés vital",
          "Interés público",
          "Interés legítimo"
        ]
      },
      {
        campo: "Categorías de titulares de datos",
        ejemplo: "Postulantes a empleos",
        obligatorio: true
      },
      {
        campo: "Categorías de datos personales tratados",
        ejemplo: "Datos de identificación, historial académico, experiencia laboral, datos de contacto",
        obligatorio: true
      },
      {
        campo: "Categorías de destinatarios (internos y externos)",
        ejemplo: "Gerentes de área, empresa externa de verificación de antecedentes",
        obligatorio: true
      },
      {
        campo: "Transferencias internacionales",
        ejemplo: "País de destino y garantías implementadas",
        obligatorio: false
      },
      {
        campo: "Plazos de conservación y supresión",
        ejemplo: "Currículums de candidatos no seleccionados se eliminan después de 6 meses",
        obligatorio: true
      },
      {
        campo: "Descripción de las medidas de seguridad",
        ejemplo: "Cifrado, control de acceso, logs de auditoría",
        obligatorio: true
      }
    ]
  }
};

const CLASIFICACION_DATOS_SENSIBILIDAD = {
  datos_comunes: {
    titulo: "Datos Personales Comunes",
    descripcion: "Información de identificación, contacto, datos laborales, etc.",
    color: "success",
    icon: <Person />,
    ejemplos: [
      "Nombre y apellidos",
      "RUT/Cédula de identidad",
      "Dirección postal",
      "Email corporativo",
      "Teléfono de contacto",
      "Fecha de nacimiento",
      "Estado civil",
      "Nacionalidad",
      "Historial académico",
      "Experiencia laboral"
    ],
    requisitos: "Medidas de seguridad apropiadas según nivel de riesgo"
  },
  datos_sensibles: {
    titulo: "Datos Sensibles (Art. 2, lit. g)",
    descripcion: "Requieren el MÁXIMO nivel de protección según Ley 21.719",
    color: "error",
    icon: <Lock />,
    categorias: {
      situacion_socioeconomica: {
        titulo: "SITUACIÓN SOCIOECONÓMICA",
        alerta: "NOVEDAD CRUCIAL DE LA LEY CHILENA",
        descripcion: "A diferencia de Europa, en Chile la situación socioeconómica ES dato sensible",
        ejemplos: [
          "Nivel de ingresos",
          "Historial crediticio",
          "Score crediticio",
          "Capacidad de pago",
          "Elegibilidad para beneficios sociales",
          "Información patrimonial",
          "Deudas y morosidades",
          "Evaluación socioeconómica para sueldo"
        ],
        areas_afectadas: ["RRHH", "Finanzas", "Créditos", "Beneficios"],
        medidas_especiales: "Requiere consentimiento explícito o interés legítimo muy justificado"
      },
      salud: {
        titulo: "DATOS DE SALUD",
        ejemplos: [
          "Licencias médicas",
          "Exámenes preocupacionales",
          "Discapacidades",
          "Enfermedades crónicas",
          "Tratamientos médicos",
          "Información de ISAPRE/FONASA"
        ]
      },
      biometricos: {
        titulo: "DATOS BIOMÉTRICOS",
        ejemplos: [
          "Huellas dactilares",
          "Reconocimiento facial",
          "Iris scanning",
          "Voz para identificación",
          "Patrones de venas"
        ]
      },
      otros: {
        titulo: "OTROS DATOS SENSIBLES",
        categorias: [
          { tipo: "Origen étnico", ejemplos: ["Pueblo originario", "Raza"] },
          { tipo: "Afiliación sindical", ejemplos: ["Membresía sindical", "Cuotas"] },
          { tipo: "Convicciones religiosas", ejemplos: ["Creencias", "Prácticas"] },
          { tipo: "Vida sexual", ejemplos: ["Orientación sexual", "Identidad de género"] }
        ]
      }
    }
  },
  datos_nna: {
    titulo: "Datos de Niños, Niñas y Adolescentes (NNA)",
    descripcion: "Cualquier dato de menores de 18 años",
    color: "warning",
    icon: <ChildCare />,
    requisitos: [
      "Consentimiento de padres o tutores",
      "Consideración del interés superior del niño",
      "Prohibición de perfilado comercial",
      "Limitaciones en transferencias internacionales",
      "Derecho de rectificación facilitado"
    ],
    ejemplos_contexto_laboral: [
      "Datos de hijos para cargas familiares",
      "Información para asignación familiar",
      "Datos médicos de hijos para seguros",
      "Información escolar para beneficios educativos",
      "Estudiantes en práctica menores de 18 años"
    ]
  }
};

const FLUJOS_DATOS_DOCUMENTACION = {
  flujos_internos: {
    titulo: "Flujos Internos",
    descripcion: "Trazar el recorrido de los datos entre los sistemas internos",
    ejemplo_detallado: {
      proceso: "Registro de nuevo cliente",
      flujo: [
        { paso: 1, sistema: "Servidor Web", accion: "Cliente completa formulario", datos: "Datos personales básicos" },
        { paso: 2, sistema: "Base de datos web", accion: "Almacenamiento temporal", datos: "Todos los campos del formulario" },
        { paso: 3, sistema: "CRM", accion: "Sincronización via API", datos: "Datos de contacto y preferencias" },
        { paso: 4, sistema: "ERP", accion: "Creación de cuenta cliente", datos: "Datos comerciales y fiscales" },
        { paso: 5, sistema: "Business Intelligence", accion: "Análisis y segmentación", datos: "Datos agregados para reportes" },
        { paso: 6, sistema: "Dashboard Gerencial", accion: "Visualización KPIs", datos: "Métricas agregadas" }
      ],
      controles_requeridos: [
        "Validación de datos en cada transferencia",
        "Logs de auditoría en cada sistema",
        "Cifrado en tránsito entre sistemas",
        "Control de integridad de datos"
      ]
    }
  },
  flujos_externos: {
    titulo: "Flujos Externos",
    descripcion: "Documentar TODAS las transferencias de datos a terceros",
    tipos_terceros: {
      encargados: {
        definicion: "Procesan datos en nombre y por cuenta del responsable",
        ejemplos: [
          "Proveedor de cloud (AWS, Azure, Google Cloud)",
          "Agencia de marketing digital",
          "Empresa de nómina externa",
          "Call center tercerizado",
          "Consultora de RRHH"
        ],
        requisito_legal: "Contrato de encargo según Art. 23 Ley 21.719"
      },
      cesionarios: {
        definicion: "Reciben datos para sus propios fines",
        ejemplos: [
          "DICOM",
          "Equifax",
          "SII",
          "Previred",
          "SERNAPESCA",
          "AFP",
          "ISAPRE/FONASA",
          "Compañías de seguros"
        ],
        requisito_legal: "Base legal específica e información al titular"
      }
    }
  },
  riesgos_sector_especifico: {
    titulo: "Riesgos Específicos del Sector (Ejemplo: Industria Salmonera)",
    descripcion: "Atención especial a flujos de datos de tecnologías avanzadas",
    casos_especiales: {
      iot_sensores: {
        titulo: "Datos IoT de Centros de Cultivo",
        datos_generados: [
          "Temperatura del agua",
          "Niveles de oxígeno",
          "Alimentación automática",
          "Mortalidad",
          "Comportamiento de biomasa"
        ],
        vinculacion_personal: "Si pueden vincularse a un operario específico = DATO PERSONAL",
        flujo_tipico: "Sensores → Cloud (¿internacional?) → Analytics → Reportes por responsable"
      },
      geolocalizacion: {
        titulo: "Geolocalización de Personal en Terreno",
        datos_generados: [
          "Ubicación GPS en tiempo real",
          "Rutas de desplazamiento",
          "Tiempo en cada ubicación",
          "Velocidad de vehículos"
        ],
        restricciones_legales: [
          "Solo durante horario laboral",
          "Notificación previa obligatoria",
          "No monitoreo en descansos",
          "Acceso restringido a supervisores"
        ]
      }
    }
  }
};

const POLITICAS_RETENCION_ELIMINACION = {
  principio_base: "Principio de proporcionalidad - Limitación del plazo de conservación",
  proceso_definicion: {
    paso1: {
      titulo: "Definición de Políticas con área Legal",
      responsables: ["DPO", "Área Legal", "Dueños de procesos"],
      criterios: [
        "Finalidad original del tratamiento",
        "Obligaciones legales de conservación",
        "Necesidades operativas justificadas",
        "Derechos del titular",
        "Análisis riesgo-beneficio de conservación"
      ]
    },
    paso2: {
      titulo: "Establecimiento de plazos específicos",
      ejemplos_chile: [
        { tipo: "Facturas y documentos tributarios", plazo: "6 años", base_legal: "Código Tributario" },
        { tipo: "Documentos laborales", plazo: "2 años post-término", base_legal: "Código del Trabajo Art. 416" },
        { tipo: "Documentos previsionales", plazo: "30 años", base_legal: "DL 3.500" },
        { tipo: "Currículums no seleccionados", plazo: "6 meses", base_legal: "Práctica recomendada" },
        { tipo: "Datos de marketing directo", plazo: "Hasta revocación consentimiento", base_legal: "Consentimiento" },
        { tipo: "Logs de seguridad", plazo: "1 año", base_legal: "Interés legítimo" },
        { tipo: "Backups", plazo: "Según política de datos primarios", base_legal: "Mismo que dato original" }
      ]
    },
    paso3: {
      titulo: "Procedimiento de Eliminación Segura",
      metodos: {
        eliminacion_fisica: {
          descripcion: "Borrado irreversible de los datos",
          tecnicas: [
            "DELETE con VACUUM en bases de datos",
            "Sobrescritura múltiple (DoD 5220.22-M)",
            "Destrucción física de medios",
            "Formateo seguro de discos"
          ]
        },
        anonimizacion: {
          descripcion: "Transformación irreversible",
          tecnicas: [
            "Generalización de datos",
            "Supresión de identificadores",
            "Perturbación estadística",
            "Pseudonimización irreversible"
          ]
        }
      },
      verificacion: "Auditoría periódica de que los datos no son recuperables",
      registro: "Log inmutable de cada eliminación: qué, cuándo, quién, por qué"
    }
  }
};

const ESPECIFICACIONES_TECNICAS_SISTEMA = {
  plataforma_gobernanza: {
    titulo: "Plataforma Centralizada de Gobernanza de Datos",
    componentes: {
      modulo_rat: {
        nombre: "Módulo de Registro de Actividades de Tratamiento",
        caracteristicas: [
          "Interfaz web intuitiva para personal no técnico",
          "Formularios guiados con validaciones",
          "Workflows de aprobación",
          "Versionado de cambios",
          "Exportación a formatos estándar"
        ],
        base_datos: {
          tablas_principales: [
            {
              nombre: "processing_activities",
              descripcion: "Almacena descripción de cada actividad",
              campos_clave: ["id", "nombre", "finalidad", "base_licitud", "fecha_creacion", "estado"]
            },
            {
              nombre: "data_assets",
              descripcion: "Cataloga sistemas y bases de datos",
              campos_clave: ["id", "nombre_sistema", "tipo", "ubicacion", "responsable", "criticidad"]
            },
            {
              nombre: "data_categories",
              descripcion: "Define categorías de datos personales",
              campos_clave: ["id", "categoria", "sensibilidad", "ejemplos", "medidas_proteccion"]
            },
            {
              nombre: "data_flows",
              descripcion: "Mapea transferencias entre sistemas y terceros",
              campos_clave: ["id", "origen", "destino", "tipo_datos", "frecuencia", "base_legal"]
            }
          ],
          consultas_complejas: [
            "¿Qué actividades tratan datos de salud y en qué sistemas se almacenan?",
            "¿Qué terceros reciben datos sensibles?",
            "¿Qué datos tienen plazo de retención vencido?",
            "¿Qué transferencias internacionales no tienen garantías documentadas?"
          ]
        }
      },
      visualizacion_flujos: {
        nombre: "Herramientas de Visualización y Mapeo",
        funcionalidades: [
          "Generación automática de diagramas de flujo",
          "Mapas de calor de riesgos",
          "Dashboard de cumplimiento en tiempo real",
          "Alertas de incumplimientos",
          "Reportes ejecutivos automáticos"
        ],
        integraciones: [
          "APIs para conexión con sistemas existentes",
          "Conectores para bases de datos",
          "Webhooks para notificaciones",
          "Exportación a herramientas de BI"
        ]
      },
      motor_retencion: {
        nombre: "Motor de Políticas de Retención",
        funcionalidades: [
          "Definición declarativa de reglas",
          "Ejecución automática periódica",
          "Gestión de excepciones",
          "Auditoría completa",
          "Notificaciones previas a eliminación"
        ],
        reglas_ejemplo: [
          {
            categoria: "Currículums No Seleccionados",
            condicion: "fecha_creacion < NOW() - INTERVAL '180 days'",
            accion: "eliminar",
            notificar: "dpo@empresa.cl"
          },
          {
            categoria: "Logs de Acceso",
            condicion: "fecha_creacion < NOW() - INTERVAL '1 year'",
            accion: "anonimizar",
            notificar: "seguridad@empresa.cl"
          }
        ]
      },
      descubrimiento_automatico: {
        nombre: "Herramientas de Data Discovery",
        funcionalidades: [
          "Escaneo periódico de redes",
          "Identificación de nuevas bases de datos",
          "Detección de datos personales mediante patterns",
          "Clasificación automática por sensibilidad",
          "Alertas de datos no inventariados"
        ]
      }
    }
  }
};

// TABLA EJEMPLO DEL MANUAL - Monitoreo de Salud de Biomasa
const EJEMPLO_RAT_BIOMASA = {
  id_actividad: "PROD-001",
  nombre_actividad: "Monitoreo de salud y alimentación de biomasa mediante IA",
  responsable_proceso: "Gerente de Producción",
  finalidades: [
    "Optimizar la alimentación",
    "Detectar tempranamente enfermedades",
    "Asegurar el bienestar animal",
    "Cumplir con normativas sanitarias"
  ],
  base_licitud: "Interés legítimo (eficiencia productiva y bienestar animal), Cumplimiento de obligación legal (normativa sanitaria)",
  categorias_titulares: "No aplica directamente a personas naturales",
  categorias_datos: "Datos de sensores (O2, temp.), imágenes de video de los peces, datos de alimentación, registros de mortalidad. Nota: Si los datos pueden vincularse a un operario específico, se convierte en dato personal",
  sistemas_implicados: ["Sensores IoT", "Software de Acuicultura (ej. Mercatus AS)", "Plataforma de IA", "ERP (SAP)"],
  destinatarios_internos_externos: ["Equipo de Producción", "Veterinarios", "SERNAPESCA (reportes agregados)"],
  transferencias_internacionales: "Sí, a proveedor de plataforma de IA en EE.UU. (Ver Módulo 6)",
  plazo_conservacion: "Datos brutos: 2 años. Informes agregados: 10 años",
  medidas_seguridad: "Cifrado de datos en tránsito y en reposo, control de acceso basado en roles (RBAC) a la plataforma de IA"
};

const Modulo3Completo = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [activePhase, setActivePhase] = useState(0);
  const [selectedArea, setSelectedArea] = useState('');
  const [entrevistaDialog, setEntrevistaDialog] = useState(false);
  const [ratFormDialog, setRatFormDialog] = useState(false);
  const [dataFlowDialog, setDataFlowDialog] = useState(false);
  const [sensitiveDataAlert, setSensitiveDataAlert] = useState(true);
  const [currentRAT, setCurrentRAT] = useState({});
  const [dataDiscoveryProgress, setDataDiscoveryProgress] = useState(0);
  const [teamMembers, setTeamMembers] = useState([]);
  const [activitiesDocumented, setActivitiesDocumented] = useState([]);
  const [dataFlows, setDataFlows] = useState([]);
  const [retentionPolicies, setRetentionPolicies] = useState([]);

  // Estado para el formulario RAT
  const [ratForm, setRatForm] = useState({
    id_actividad: '',
    nombre_actividad: '',
    responsable_proceso: '',
    finalidades: [],
    base_licitud: '',
    categorias_titulares: '',
    categorias_datos: [],
    sistemas_implicados: [],
    destinatarios_internos: [],
    destinatarios_externos: [],
    transferencias_internacionales: '',
    plazo_conservacion: '',
    medidas_seguridad: []
  });

  const handleNextPhase = () => {
    setActivePhase((prev) => prev + 1);
    setDataDiscoveryProgress((prev) => Math.min(prev + 25, 100));
  };

  const handlePreviousPhase = () => {
    setActivePhase((prev) => Math.max(prev - 1, 0));
  };

  const handleStartInterview = (area) => {
    setSelectedArea(area);
    setEntrevistaDialog(true);
  };

  const handleSaveRAT = () => {
    setActivitiesDocumented([...activitiesDocumented, ratForm]);
    setRatFormDialog(false);
    alert('Actividad de tratamiento documentada exitosamente');
  };

  const handleExportRAT = () => {
    alert('Exportando RAT completo a Excel...');
  };

  const handleGenerateDataFlow = () => {
    setDataFlowDialog(true);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* HEADER PRINCIPAL DEL MÓDULO */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mb: 3, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
              CAPÍTULO 3: MÓDULO DE INVENTARIO Y MAPEO DE DATOS
            </Typography>
            <Typography variant="h6" gutterBottom>
              Registro de Actividades de Tratamiento (RAT) - Ley N° 21.719
            </Typography>
            <Alert severity="warning" sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.9)' }}>
              <AlertTitle sx={{ fontWeight: 'bold' }}>PIEDRA ANGULAR DEL CUMPLIMIENTO</AlertTitle>
              Sin un conocimiento claro de qué datos se tienen, dónde están, por qué se tienen, 
              cómo fluyen y cuándo deben ser eliminados, es IMPOSIBLE cumplir con los demás 
              principios y obligaciones de la Ley N° 21.719.
            </Alert>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Progreso del Módulo</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={dataDiscoveryProgress} 
                  sx={{ height: 10, borderRadius: 5, mb: 2 }}
                />
                <Stack spacing={1}>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    startIcon={<Download />}
                    onClick={handleExportRAT}
                    sx={{ bgcolor: 'white', color: 'primary.main' }}
                  >
                    Descargar Plantilla RAT
                  </Button>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    startIcon={<Help />}
                    sx={{ borderColor: 'white', color: 'white' }}
                  >
                    Manual Completo
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* TABS PRINCIPALES */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="3.1 PROCEDIMIENTOS PARA EL PERSONAL" icon={<People />} />
          <Tab label="3.2 ESPECIFICACIONES TÉCNICAS DEL SISTEMA" icon={<Engineering />} />
          <Tab label="CLASIFICACIÓN DE DATOS" icon={<Security />} />
          <Tab label="FLUJOS DE DATOS" icon={<AccountTree />} />
          <Tab label="POLÍTICAS DE RETENCIÓN" icon={<Timer />} />
          <Tab label="EJEMPLOS PRÁCTICOS" icon={<Science />} />
          <Tab label="GLOSARIO" icon={<MenuBook />} />
        </Tabs>
      </Paper>

      {/* TAB 1: PROCEDIMIENTOS PARA EL PERSONAL */}
      {activeTab === 0 && (
        <Box>
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            3.1 Procedimientos para el Personal (Creación y Mantenimiento del Inventario)
          </Typography>

          {/* STEPPER DE FASES */}
          <Stepper activeStep={activePhase} orientation="vertical">
            {/* FASE 1: CONFORMACIÓN DEL EQUIPO */}
            <Step>
              <StepLabel>
                <Typography variant="h6">{FASES_DATA_DISCOVERY.fase1.titulo}</Typography>
              </StepLabel>
              <StepContent>
                <Typography paragraph>{FASES_DATA_DISCOVERY.fase1.descripcion}</Typography>
                
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Equipo Multidisciplinario Requerido:
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Área</TableCell>
                            <TableCell>Rol</TableCell>
                            <TableCell>Responsabilidad</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {FASES_DATA_DISCOVERY.fase1.participantes.map((p, idx) => (
                            <TableRow key={idx}>
                              <TableCell>
                                <Chip label={p.area} color="primary" />
                              </TableCell>
                              <TableCell>{p.rol}</TableCell>
                              <TableCell>{p.responsabilidad}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>

                <Alert severity="info" sx={{ mb: 2 }}>
                  <AlertTitle>Entregables de esta fase:</AlertTitle>
                  <List dense>
                    {FASES_DATA_DISCOVERY.fase1.entregables.map((e, idx) => (
                      <ListItem key={idx}>
                        <ListItemIcon><CheckCircle /></ListItemIcon>
                        <ListItemText primary={e} />
                      </ListItem>
                    ))}
                  </List>
                </Alert>

                <Box sx={{ mb: 2 }}>
                  <Button 
                    variant="contained" 
                    onClick={handleNextPhase}
                    endIcon={<NavigateNext />}
                  >
                    Continuar a Fase 2
                  </Button>
                </Box>
              </StepContent>
            </Step>

            {/* FASE 2: METODOLOGÍA DE LEVANTAMIENTO */}
            <Step>
              <StepLabel>
                <Typography variant="h6">{FASES_DATA_DISCOVERY.fase2.titulo}</Typography>
              </StepLabel>
              <StepContent>
                <Alert severity="error" sx={{ mb: 2 }}>
                  <AlertTitle>⚠️ ENFOQUE CRÍTICO</AlertTitle>
                  {FASES_DATA_DISCOVERY.fase2.descripcion}
                </Alert>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          ✅ Enfoque CORRECTO:
                        </Typography>
                        <Typography paragraph>
                          {FASES_DATA_DISCOVERY.fase2.metodologia.enfoque_correcto}
                        </Typography>
                        <Typography variant="subtitle2" gutterBottom>
                          Técnicas a utilizar:
                        </Typography>
                        <List dense>
                          {FASES_DATA_DISCOVERY.fase2.metodologia.tecnicas.map((t, idx) => (
                            <ListItem key={idx}>
                              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                              <ListItemText primary={t} />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          📋 Preguntas Clave por Área:
                        </Typography>
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography>Preguntas para RRHH</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <List dense>
                              {FASES_DATA_DISCOVERY.fase2.metodologia.preguntas_clave.rrhh.map((p, idx) => (
                                <ListItem key={idx}>
                                  <ListItemText primary={`${idx + 1}. ${p}`} />
                                </ListItem>
                              ))}
                            </List>
                            <Button 
                              variant="outlined" 
                              fullWidth 
                              onClick={() => handleStartInterview('RRHH')}
                              startIcon={<Assignment />}
                            >
                              Iniciar Entrevista RRHH
                            </Button>
                          </AccordionDetails>
                        </Accordion>

                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography>Preguntas para Finanzas</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <List dense>
                              {FASES_DATA_DISCOVERY.fase2.metodologia.preguntas_clave.finanzas.map((p, idx) => (
                                <ListItem key={idx}>
                                  <ListItemText primary={`${idx + 1}. ${p}`} />
                                </ListItem>
                              ))}
                            </List>
                            <Button 
                              variant="outlined" 
                              fullWidth 
                              onClick={() => handleStartInterview('Finanzas')}
                              startIcon={<Assignment />}
                            >
                              Iniciar Entrevista Finanzas
                            </Button>
                          </AccordionDetails>
                        </Accordion>

                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography>Preguntas para Marketing</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <List dense>
                              {FASES_DATA_DISCOVERY.fase2.metodologia.preguntas_clave.marketing.map((p, idx) => (
                                <ListItem key={idx}>
                                  <ListItemText primary={`${idx + 1}. ${p}`} />
                                </ListItem>
                              ))}
                            </List>
                            <Button 
                              variant="outlined" 
                              fullWidth 
                              onClick={() => handleStartInterview('Marketing')}
                              startIcon={<Assignment />}
                            >
                              Iniciar Entrevista Marketing
                            </Button>
                          </AccordionDetails>
                        </Accordion>

                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography>Preguntas para Operaciones</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <List dense>
                              {FASES_DATA_DISCOVERY.fase2.metodologia.preguntas_clave.operaciones.map((p, idx) => (
                                <ListItem key={idx}>
                                  <ListItemText primary={`${idx + 1}. ${p}`} />
                                </ListItem>
                              ))}
                            </List>
                            <Button 
                              variant="outlined" 
                              fullWidth 
                              onClick={() => handleStartInterview('Operaciones')}
                              startIcon={<Assignment />}
                            >
                              Iniciar Entrevista Operaciones
                            </Button>
                          </AccordionDetails>
                        </Accordion>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Box sx={{ mb: 2, mt: 2 }}>
                  <Button onClick={handlePreviousPhase} sx={{ mr: 1 }}>
                    Atrás
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={handleNextPhase}
                    endIcon={<NavigateNext />}
                  >
                    Continuar a Fase 3
                  </Button>
                </Box>
              </StepContent>
            </Step>

            {/* FASE 3: DOCUMENTACIÓN DE ACTIVIDADES */}
            <Step>
              <StepLabel>
                <Typography variant="h6">{FASES_DATA_DISCOVERY.fase3.titulo}</Typography>
              </StepLabel>
              <StepContent>
                <Typography paragraph>{FASES_DATA_DISCOVERY.fase3.descripcion}</Typography>

                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Campos obligatorios del RAT según Ley 21.719:
                    </Typography>
                    <Grid container spacing={2}>
                      {FASES_DATA_DISCOVERY.fase3.campos_rat.map((campo, idx) => (
                        <Grid item xs={12} md={6} key={idx}>
                          <Paper variant="outlined" sx={{ p: 2 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              {campo.obligatorio ? (
                                <CheckCircle color="error" />
                              ) : (
                                <Info color="info" />
                              )}
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                {campo.campo}
                              </Typography>
                            </Stack>
                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                              Ejemplo: {campo.ejemplo}
                            </Typography>
                            {campo.opciones && (
                              <Box sx={{ mt: 1 }}>
                                {campo.opciones.map((op, i) => (
                                  <Chip key={i} label={op} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                                ))}
                              </Box>
                            )}
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>

                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => setRatFormDialog(true)}
                  startIcon={<Add />}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  DOCUMENTAR NUEVA ACTIVIDAD DE TRATAMIENTO
                </Button>

                <Box sx={{ mb: 2 }}>
                  <Button onClick={handlePreviousPhase} sx={{ mr: 1 }}>
                    Atrás
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={() => alert('Procedimiento de Data Discovery completado!')}
                    endIcon={<CheckCircle />}
                  >
                    Finalizar Data Discovery
                  </Button>
                </Box>
              </StepContent>
            </Step>
          </Stepper>

          {/* SECCIÓN DE CLASIFICACIÓN DE DATOS POR SENSIBILIDAD */}
          <Paper sx={{ p: 3, mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Clasificación de Datos por Sensibilidad
            </Typography>
            
            {/* ALERTA CRÍTICA - SITUACIÓN SOCIOECONÓMICA */}
            {sensitiveDataAlert && (
              <Alert 
                severity="error" 
                sx={{ mb: 3 }}
                onClose={() => setSensitiveDataAlert(false)}
              >
                <AlertTitle sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                  ⚠️ NOVEDAD CRUCIAL DE LA LEY CHILENA
                </AlertTitle>
                <Typography paragraph>
                  La "situación socioeconómica" es considerada <strong>DATO SENSIBLE</strong> en Chile.
                  Esto significa que datos como el nivel de ingresos, historial crediticio o la 
                  elegibilidad para beneficios sociales, comúnmente manejados por RRHH o áreas 
                  financieras, deben ser tratados con el <strong>MÁXIMO NIVEL DE PROTECCIÓN</strong>.
                </Typography>
                <Typography>
                  Esto es una diferencia fundamental con el GDPR europeo donde estos datos NO son sensibles.
                </Typography>
              </Alert>
            )}

            <Grid container spacing={3}>
              {/* Datos Comunes */}
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', borderTop: '4px solid', borderColor: 'success.main' }}>
                  <CardContent>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        <Person />
                      </Avatar>
                      <Typography variant="h6">
                        {CLASIFICACION_DATOS_SENSIBILIDAD.datos_comunes.titulo}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" paragraph>
                      {CLASIFICACION_DATOS_SENSIBILIDAD.datos_comunes.descripcion}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Ejemplos:
                    </Typography>
                    <List dense>
                      {CLASIFICACION_DATOS_SENSIBILIDAD.datos_comunes.ejemplos.slice(0, 5).map((e, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            <CheckCircle fontSize="small" color="success" />
                          </ListItemIcon>
                          <ListItemText primary={e} />
                        </ListItem>
                      ))}
                    </List>
                    <Alert severity="success" sx={{ mt: 2 }}>
                      {CLASIFICACION_DATOS_SENSIBILIDAD.datos_comunes.requisitos}
                    </Alert>
                  </CardContent>
                </Card>
              </Grid>

              {/* Datos Sensibles */}
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', borderTop: '4px solid', borderColor: 'error.main' }}>
                  <CardContent>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'error.main' }}>
                        <Lock />
                      </Avatar>
                      <Typography variant="h6">
                        {CLASIFICACION_DATOS_SENSIBILIDAD.datos_sensibles.titulo}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" paragraph>
                      {CLASIFICACION_DATOS_SENSIBILIDAD.datos_sensibles.descripcion}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    
                    {/* Situación Socioeconómica */}
                    <Alert severity="error" sx={{ mb: 2 }}>
                      <AlertTitle>
                        {CLASIFICACION_DATOS_SENSIBILIDAD.datos_sensibles.categorias.situacion_socioeconomica.titulo}
                      </AlertTitle>
                      <List dense>
                        {CLASIFICACION_DATOS_SENSIBILIDAD.datos_sensibles.categorias.situacion_socioeconomica.ejemplos.slice(0, 4).map((e, idx) => (
                          <ListItem key={idx}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <MonetizationOn fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={e} />
                          </ListItem>
                        ))}
                      </List>
                    </Alert>

                    {/* Otros datos sensibles */}
                    <Typography variant="subtitle2" gutterBottom>
                      Otras categorías sensibles:
                    </Typography>
                    <Stack spacing={1}>
                      <Chip label="Datos de Salud" icon={<LocalHospital />} color="error" />
                      <Chip label="Datos Biométricos" icon={<Fingerprint />} color="error" />
                      <Chip label="Afiliación Sindical" icon={<Group />} color="error" />
                      <Chip label="Origen Étnico" color="error" />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Datos NNA */}
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', borderTop: '4px solid', borderColor: 'warning.main' }}>
                  <CardContent>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'warning.main' }}>
                        <ChildCare />
                      </Avatar>
                      <Typography variant="h6">
                        {CLASIFICACION_DATOS_SENSIBILIDAD.datos_nna.titulo}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" paragraph>
                      {CLASIFICACION_DATOS_SENSIBILIDAD.datos_nna.descripcion}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Requisitos especiales:
                    </Typography>
                    <List dense>
                      {CLASIFICACION_DATOS_SENSIBILIDAD.datos_nna.requisitos.map((r, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            <Warning fontSize="small" color="warning" />
                          </ListItemIcon>
                          <ListItemText primary={r} />
                        </ListItem>
                      ))}
                    </List>
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      Ejemplos en contexto laboral: Datos de hijos para cargas familiares, 
                      estudiantes en práctica menores de 18 años
                    </Alert>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      )}

      {/* TAB 2: ESPECIFICACIONES TÉCNICAS DEL SISTEMA */}
      {activeTab === 1 && (
        <Box>
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            3.2 Especificaciones Técnicas del Sistema
          </Typography>
          <Typography variant="h6" gutterBottom>
            Plataforma Centralizada de Gobernanza de Datos
          </Typography>

          <Grid container spacing={3}>
            {/* Módulo RAT */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Módulo de Registro de Actividades de Tratamiento (RAT)
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Interfaz de Usuario:
                  </Typography>
                  <List dense>
                    {ESPECIFICACIONES_TECNICAS_SISTEMA.plataforma_gobernanza.componentes.modulo_rat.caracteristicas.map((c, idx) => (
                      <ListItem key={idx}>
                        <ListItemIcon><CheckCircle color="primary" /></ListItemIcon>
                        <ListItemText primary={c} />
                      </ListItem>
                    ))}
                  </List>

                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Base de Datos del Inventario:
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Tabla</TableCell>
                          <TableCell>Descripción</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {ESPECIFICACIONES_TECNICAS_SISTEMA.plataforma_gobernanza.componentes.modulo_rat.base_datos.tablas_principales.map((t, idx) => (
                          <TableRow key={idx}>
                            <TableCell>
                              <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                {t.nombre}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption">
                                {t.descripcion}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Alert severity="info" sx={{ mt: 2 }}>
                    <AlertTitle>Consultas complejas soportadas:</AlertTitle>
                    <List dense>
                      {ESPECIFICACIONES_TECNICAS_SISTEMA.plataforma_gobernanza.componentes.modulo_rat.base_datos.consultas_complejas.slice(0, 2).map((c, idx) => (
                        <ListItem key={idx}>
                          <ListItemText primary={c} />
                        </ListItem>
                      ))}
                    </List>
                  </Alert>
                </CardContent>
              </Card>
            </Grid>

            {/* Visualización y Motor de Retención */}
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                {/* Herramientas de Visualización */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Funcionalidad de Mapeo y Visualización de Flujos
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <List dense>
                      {ESPECIFICACIONES_TECNICAS_SISTEMA.plataforma_gobernanza.componentes.visualizacion_flujos.funcionalidades.map((f, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon><Assessment color="secondary" /></ListItemIcon>
                          <ListItemText primary={f} />
                        </ListItem>
                      ))}
                    </List>
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      sx={{ mt: 2 }}
                      onClick={handleGenerateDataFlow}
                    >
                      Generar Diagrama de Flujos
                    </Button>
                  </CardContent>
                </Card>

                {/* Motor de Políticas de Retención */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Motor de Políticas de Retención
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Definición de Reglas (ejemplos):
                    </Typography>
                    {ESPECIFICACIONES_TECNICAS_SISTEMA.plataforma_gobernanza.componentes.motor_retencion.reglas_ejemplo.map((r, idx) => (
                      <Alert key={idx} severity="warning" sx={{ mb: 1 }}>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                          PARA: {r.categoria}<br />
                          SI: {r.condicion}<br />
                          ENTONCES: {r.accion}<br />
                          NOTIFICAR: {r.notificar}
                        </Typography>
                      </Alert>
                    ))}
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                      Automatización de la Ejecución:
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="1. Identificar registros vencidos"
                          secondary="Escaneo periódico según políticas definidas"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="2. Ejecutar acción definida"
                          secondary="Eliminación segura o anonimización"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="3. Registro de Auditoría"
                          secondary="Log inmutable de cada acción ejecutada"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* TAB 3: CLASIFICACIÓN DE DATOS */}
      {activeTab === 2 && (
        <Box>
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            Clasificación de Datos por Sensibilidad
          </Typography>
          {/* Contenido ya mostrado en Tab 1, se puede expandir aquí */}
        </Box>
      )}

      {/* TAB 4: FLUJOS DE DATOS */}
      {activeTab === 3 && (
        <Box>
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            Documentación de Flujos de Datos (Data Flows)
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            <AlertTitle>El inventario no es solo una lista estática, sino un mapa dinámico</AlertTitle>
            El personal debe documentar cómo se mueven los datos dentro y fuera de la organización.
          </Alert>

          <Grid container spacing={3}>
            {/* Flujos Internos */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {FLUJOS_DATOS_DOCUMENTACION.flujos_internos.titulo}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {FLUJOS_DATOS_DOCUMENTACION.flujos_internos.descripcion}
                  </Typography>
                  
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <AlertTitle>Ejemplo: {FLUJOS_DATOS_DOCUMENTACION.flujos_internos.ejemplo_detallado.proceso}</AlertTitle>
                  </Alert>

                  <Stepper orientation="vertical">
                    {FLUJOS_DATOS_DOCUMENTACION.flujos_internos.ejemplo_detallado.flujo.map((paso, idx) => (
                      <Step key={idx} active={true}>
                        <StepLabel>
                          <Typography variant="subtitle2">{paso.sistema}</Typography>
                        </StepLabel>
                        <StepContent>
                          <Typography variant="body2">{paso.accion}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            Datos: {paso.datos}
                          </Typography>
                        </StepContent>
                      </Step>
                    ))}
                  </Stepper>

                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Controles requeridos:
                  </Typography>
                  <List dense>
                    {FLUJOS_DATOS_DOCUMENTACION.flujos_internos.ejemplo_detallado.controles_requeridos.map((c, idx) => (
                      <ListItem key={idx}>
                        <ListItemIcon><Security fontSize="small" /></ListItemIcon>
                        <ListItemText primary={c} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Flujos Externos */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {FLUJOS_DATOS_DOCUMENTACION.flujos_externos.titulo}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {FLUJOS_DATOS_DOCUMENTACION.flujos_externos.descripcion}
                  </Typography>

                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography>Encargados del Tratamiento</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" paragraph>
                        {FLUJOS_DATOS_DOCUMENTACION.flujos_externos.tipos_terceros.encargados.definicion}
                      </Typography>
                      <List dense>
                        {FLUJOS_DATOS_DOCUMENTACION.flujos_externos.tipos_terceros.encargados.ejemplos.map((e, idx) => (
                          <ListItem key={idx}>
                            <ListItemIcon><Business fontSize="small" /></ListItemIcon>
                            <ListItemText primary={e} />
                          </ListItem>
                        ))}
                      </List>
                      <Alert severity="warning">
                        Requisito legal: {FLUJOS_DATOS_DOCUMENTACION.flujos_externos.tipos_terceros.encargados.requisito_legal}
                      </Alert>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography>Cesionarios</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" paragraph>
                        {FLUJOS_DATOS_DOCUMENTACION.flujos_externos.tipos_terceros.cesionarios.definicion}
                      </Typography>
                      <List dense>
                        {FLUJOS_DATOS_DOCUMENTACION.flujos_externos.tipos_terceros.cesionarios.ejemplos.map((e, idx) => (
                          <ListItem key={idx}>
                            <ListItemIcon><Business fontSize="small" /></ListItemIcon>
                            <ListItemText primary={e} />
                          </ListItem>
                        ))}
                      </List>
                      <Alert severity="warning">
                        Requisito legal: {FLUJOS_DATOS_DOCUMENTACION.flujos_externos.tipos_terceros.cesionarios.requisito_legal}
                      </Alert>
                    </AccordionDetails>
                  </Accordion>
                </CardContent>
              </Card>
            </Grid>

            {/* Riesgos Específicos del Sector */}
            <Grid item xs={12}>
              <Card sx={{ borderLeft: '4px solid', borderColor: 'warning.main' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {FLUJOS_DATOS_DOCUMENTACION.riesgos_sector_especifico.titulo}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {FLUJOS_DATOS_DOCUMENTACION.riesgos_sector_especifico.descripcion}
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Alert severity="info">
                        <AlertTitle>{FLUJOS_DATOS_DOCUMENTACION.riesgos_sector_especifico.casos_especiales.iot_sensores.titulo}</AlertTitle>
                        <Typography variant="body2" paragraph>
                          Datos generados:
                        </Typography>
                        <List dense>
                          {FLUJOS_DATOS_DOCUMENTACION.riesgos_sector_especifico.casos_especiales.iot_sensores.datos_generados.map((d, idx) => (
                            <ListItem key={idx}>
                              <ListItemText primary={d} />
                            </ListItem>
                          ))}
                        </List>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="caption" color="error">
                          ⚠️ {FLUJOS_DATOS_DOCUMENTACION.riesgos_sector_especifico.casos_especiales.iot_sensores.vinculacion_personal}
                        </Typography>
                      </Alert>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Alert severity="warning">
                        <AlertTitle>{FLUJOS_DATOS_DOCUMENTACION.riesgos_sector_especifico.casos_especiales.geolocalizacion.titulo}</AlertTitle>
                        <Typography variant="body2" paragraph>
                          Restricciones legales:
                        </Typography>
                        <List dense>
                          {FLUJOS_DATOS_DOCUMENTACION.riesgos_sector_especifico.casos_especiales.geolocalizacion.restricciones_legales.map((r, idx) => (
                            <ListItem key={idx}>
                              <ListItemIcon><Error fontSize="small" /></ListItemIcon>
                              <ListItemText primary={r} />
                            </ListItem>
                          ))}
                        </List>
                      </Alert>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* TAB 5: POLÍTICAS DE RETENCIÓN */}
      {activeTab === 4 && (
        <Box>
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            Gestión de Retención y Eliminación
          </Typography>

          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>{POLITICAS_RETENCION_ELIMINACION.principio_base}</AlertTitle>
            El DPO, junto con el área legal y los dueños de los procesos, debe definir políticas 
            de retención para cada categoría de datos.
          </Alert>

          <Stepper orientation="vertical">
            {/* Paso 1: Definición de Políticas */}
            <Step active={true}>
              <StepLabel>
                <Typography variant="h6">
                  {POLITICAS_RETENCION_ELIMINACION.proceso_definicion.paso1.titulo}
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" paragraph>
                  Responsables: {POLITICAS_RETENCION_ELIMINACION.proceso_definicion.paso1.responsables.join(', ')}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Criterios a considerar:
                </Typography>
                <List>
                  {POLITICAS_RETENCION_ELIMINACION.proceso_definicion.paso1.criterios.map((c, idx) => (
                    <ListItem key={idx}>
                      <ListItemIcon><CheckCircle /></ListItemIcon>
                      <ListItemText primary={c} />
                    </ListItem>
                  ))}
                </List>
              </StepContent>
            </Step>

            {/* Paso 2: Establecimiento de Plazos */}
            <Step active={true}>
              <StepLabel>
                <Typography variant="h6">
                  {POLITICAS_RETENCION_ELIMINACION.proceso_definicion.paso2.titulo}
                </Typography>
              </StepLabel>
              <StepContent>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tipo de Documento</TableCell>
                        <TableCell>Plazo</TableCell>
                        <TableCell>Base Legal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {POLITICAS_RETENCION_ELIMINACION.proceso_definicion.paso2.ejemplos_chile.map((e, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{e.tipo}</TableCell>
                          <TableCell>
                            <Chip label={e.plazo} color="primary" />
                          </TableCell>
                          <TableCell>{e.base_legal}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </StepContent>
            </Step>

            {/* Paso 3: Procedimiento de Eliminación */}
            <Step active={true}>
              <StepLabel>
                <Typography variant="h6">
                  {POLITICAS_RETENCION_ELIMINACION.proceso_definicion.paso3.titulo}
                </Typography>
              </StepLabel>
              <StepContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Eliminación Física
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {POLITICAS_RETENCION_ELIMINACION.proceso_definicion.paso3.metodos.eliminacion_fisica.descripcion}
                        </Typography>
                        <List dense>
                          {POLITICAS_RETENCION_ELIMINACION.proceso_definicion.paso3.metodos.eliminacion_fisica.tecnicas.map((t, idx) => (
                            <ListItem key={idx}>
                              <ListItemIcon><Delete fontSize="small" /></ListItemIcon>
                              <ListItemText primary={t} />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Anonimización
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {POLITICAS_RETENCION_ELIMINACION.proceso_definicion.paso3.metodos.anonimizacion.descripcion}
                        </Typography>
                        <List dense>
                          {POLITICAS_RETENCION_ELIMINACION.proceso_definicion.paso3.metodos.anonimizacion.tecnicas.map((t, idx) => (
                            <ListItem key={idx}>
                              <ListItemIcon><Lock fontSize="small" /></ListItemIcon>
                              <ListItemText primary={t} />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <AlertTitle>Verificación y Registro</AlertTitle>
                  <Typography variant="body2">
                    • {POLITICAS_RETENCION_ELIMINACION.proceso_definicion.paso3.verificacion}<br />
                    • {POLITICAS_RETENCION_ELIMINACION.proceso_definicion.paso3.registro}
                  </Typography>
                </Alert>
              </StepContent>
            </Step>
          </Stepper>
        </Box>
      )}

      {/* TAB 6: EJEMPLOS PRÁCTICOS */}
      {activeTab === 5 && (
        <Box>
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            Tabla 3.1: Ejemplo de Registro de Actividad de Tratamiento (RAT)
          </Typography>
          <Typography variant="h6" gutterBottom>
            Actividad: Monitoreo de Salud de Biomasa
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                    Campo del Registro
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                    Ejemplo de Contenido
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>ID de Actividad</TableCell>
                  <TableCell>{EJEMPLO_RAT_BIOMASA.id_actividad}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Nombre de la Actividad</TableCell>
                  <TableCell>{EJEMPLO_RAT_BIOMASA.nombre_actividad}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Responsable del Proceso</TableCell>
                  <TableCell>{EJEMPLO_RAT_BIOMASA.responsable_proceso}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Finalidad(es)</TableCell>
                  <TableCell>
                    <List dense>
                      {EJEMPLO_RAT_BIOMASA.finalidades.map((f, idx) => (
                        <ListItem key={idx}>
                          <ListItemText primary={f} />
                        </ListItem>
                      ))}
                    </List>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Base de Licitud</TableCell>
                  <TableCell>{EJEMPLO_RAT_BIOMASA.base_licitud}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Categorías de Titulares</TableCell>
                  <TableCell>{EJEMPLO_RAT_BIOMASA.categorias_titulares}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Categorías de Datos</TableCell>
                  <TableCell>
                    <Alert severity="warning">
                      {EJEMPLO_RAT_BIOMASA.categorias_datos}
                    </Alert>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Sistemas Implicados</TableCell>
                  <TableCell>
                    {EJEMPLO_RAT_BIOMASA.sistemas_implicados.map((s, idx) => (
                      <Chip key={idx} label={s} sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Destinatarios (Internos/Externos)</TableCell>
                  <TableCell>
                    {EJEMPLO_RAT_BIOMASA.destinatarios_internos_externos.join(', ')}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Transferencias Internacionales</TableCell>
                  <TableCell>
                    <Alert severity="error">
                      {EJEMPLO_RAT_BIOMASA.transferencias_internacionales}
                    </Alert>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Plazo de Conservación</TableCell>
                  <TableCell>{EJEMPLO_RAT_BIOMASA.plazo_conservacion}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Medidas de Seguridad</TableCell>
                  <TableCell>{EJEMPLO_RAT_BIOMASA.medidas_seguridad}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Button 
            variant="contained" 
            size="large"
            fullWidth
            sx={{ mt: 3 }}
            startIcon={<Download />}
            onClick={handleExportRAT}
          >
            Descargar esta plantilla en Excel
          </Button>
        </Box>
      )}

      {/* DIALOGS */}
      {/* Dialog de Entrevista */}
      <Dialog open={entrevistaDialog} onClose={() => setEntrevistaDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Entrevista Estructurada - Área: {selectedArea}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Utilice estas preguntas guía para identificar todas las actividades de tratamiento del área.
          </Typography>
          {selectedArea && FASES_DATA_DISCOVERY.fase2.metodologia.preguntas_clave[selectedArea.toLowerCase()] && (
            <List>
              {FASES_DATA_DISCOVERY.fase2.metodologia.preguntas_clave[selectedArea.toLowerCase()].map((p, idx) => (
                <ListItem key={idx}>
                  <ListItemText 
                    primary={`Pregunta ${idx + 1}:`}
                    secondary={p}
                  />
                  <TextField 
                    multiline 
                    rows={2}
                    fullWidth
                    placeholder="Respuesta..."
                    sx={{ ml: 2 }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEntrevistaDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={() => {
            setEntrevistaDialog(false);
            setRatFormDialog(true);
          }}>
            Documentar Actividad Identificada
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Formulario RAT */}
      <Dialog open={ratFormDialog} onClose={() => setRatFormDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Documentar Nueva Actividad de Tratamiento (RAT)
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {FASES_DATA_DISCOVERY.fase3.campos_rat.map((campo, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                <TextField
                  fullWidth
                  label={campo.campo}
                  required={campo.obligatorio}
                  helperText={`Ejemplo: ${campo.ejemplo}`}
                  multiline={idx > 3}
                  rows={idx > 3 ? 3 : 1}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRatFormDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveRAT}>
            Guardar Actividad
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Flujos de Datos */}
      <Dialog open={dataFlowDialog} onClose={() => setDataFlowDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Visualización de Flujos de Datos
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Diagrama de flujo generado automáticamente basado en las actividades documentadas
          </Alert>
          <Box sx={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'grey.100' }}>
            <Typography variant="h6" color="textSecondary">
              [Aquí se mostraría el diagrama de flujo interactivo]
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDataFlowDialog(false)}>Cerrar</Button>
          <Button variant="contained" startIcon={<Download />}>
            Exportar Diagrama
          </Button>
        </DialogActions>
      </Dialog>

      {/* Speed Dial para acciones rápidas */}
      <SpeedDial
        ariaLabel="Acciones rápidas"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<Add />}
          tooltipTitle="Nueva Actividad RAT"
          onClick={() => setRatFormDialog(true)}
        />
        <SpeedDialAction
          icon={<Download />}
          tooltipTitle="Descargar Plantillas"
          onClick={handleExportRAT}
        />
        <SpeedDialAction
          icon={<Assessment />}
          tooltipTitle="Ver Dashboard"
        />
        <SpeedDialAction
          icon={<Help />}
          tooltipTitle="Ayuda"
        />
      </SpeedDial>
    </Container>
  );
};

export default Modulo3Completo;