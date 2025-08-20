import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider,
  IconButton,
  Collapse,
  Button,
  Badge,
} from '@mui/material';
import {
  Search,
  Book,
  Gavel,
  Warning,
  Info,
  ExpandMore,
  ExpandLess,
  Star,
  NewReleases,
  LocalLibrary,
  Security,
  Policy,
  Business,
  Group,
  LocationOn,
  AttachMoney,
  ChildCare,
  Fingerprint,
  Lock,
  Public,
  Timer,
  Assignment,
  AccountBalance,
  ContentCopy,
  Engineering,
  Assessment,
  Visibility,
  Edit,
  Delete,
  Block,
  Description,
  GetApp,
  AccountTree,
  CheckCircle,
  Balance,
  VisibilityOff,
  VerifiedUser,
  CloudDownload,
  Settings,
  Build,
  Architecture,
  People,
  ShuffleOn,
  Minimize,
  SettingsSuggest,
  Storage,
} from '@mui/icons-material';

const GlosarioLPDP = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTerm, setExpandedTerm] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Términos del glosario basados en el manual y la Ley 21.719
  const terminos = {
    datos_personales: {
      termino: 'Datos Personales',
      definicion: 'Cualquier información relativa a una persona natural identificada o identificable.',
      articulo: 'Art. 2, lit. f)',
      categoria: 'fundamental',
      icono: <Group />,
      ejemplos: [
        'Nombre y apellidos',
        'RUT',
        'Dirección',
        'Email',
        'Teléfono',
        'Fotografía'
      ],
      importante: true,
      nota_chile: 'En Chile incluye cualquier dato que permita identificar directa o indirectamente a una persona.'
    },
    datos_sensibles: {
      termino: 'Datos Sensibles',
      definicion: 'Datos personales que revelan origen étnico o racial, convicciones religiosas, filosóficas o morales, afiliación sindical, información referente a la salud o vida sexual, datos genéticos, datos biométricos, o datos relativos a la orientación sexual o identidad de género.',
      articulo: 'Art. 2, lit. g)',
      categoria: 'fundamental',
      icono: <Lock />,
      ejemplos: [
        'Historial médico',
        'Huella dactilar',
        'Afiliación política',
        'Creencias religiosas',
        'Orientación sexual'
      ],
      importante: true,
      alerta: 'NOVEDAD CHILENA: La "situación socioeconómica" es considerada dato sensible',
      nota_chile: 'A diferencia de Europa, en Chile la situación socioeconómica (ingresos, score crediticio, patrimonio) es dato sensible.'
    },
    situacion_socioeconomica: {
      termino: 'Situación Socioeconómica',
      definicion: 'DATO SENSIBLE en Chile que revela la capacidad económica, nivel de ingresos, patrimonio, historial crediticio o elegibilidad para beneficios sociales de una persona.',
      articulo: 'Art. 2, lit. g)',
      categoria: 'fundamental',
      icono: <AttachMoney />,
      ejemplos: [
        'Nivel de ingresos',
        'Score crediticio DICOM',
        'Historial de deudas',
        'Patrimonio declarado',
        'Beneficios sociales recibidos',
        'Clasificación socioeconómica'
      ],
      importante: true,
      alerta: 'EXCLUSIVO DE CHILE: No existe en GDPR europeo',
      nota_chile: 'Esta es una innovación crucial de la ley chilena. Datos comúnmente manejados por RRHH o áreas financieras ahora requieren máxima protección.'
    },
    titular_datos: {
      termino: 'Titular de Datos',
      definicion: 'Persona natural a quien se refieren los datos personales.',
      articulo: 'Art. 2, lit. o)',
      categoria: 'actores',
      icono: <Person />,
      ejemplos: [
        'Empleados',
        'Clientes',
        'Proveedores personas naturales',
        'Postulantes a empleo',
        'Usuarios de servicios'
      ]
    },
    responsable_datos: {
      termino: 'Responsable de Datos',
      definicion: 'Persona natural o jurídica, pública o privada, que decide sobre el tratamiento de datos personales.',
      articulo: 'Art. 2, lit. n)',
      categoria: 'actores',
      icono: <Business />,
      ejemplos: [
        'La empresa empleadora',
        'El banco que evalúa créditos',
        'La clínica que atiende pacientes',
        'El retail que gestiona clientes'
      ],
      nota_chile: 'Es quien determina los fines y medios del tratamiento.'
    },
    encargado_datos: {
      termino: 'Encargado de Datos',
      definicion: 'Persona natural o jurídica que trata datos personales por cuenta del responsable del tratamiento.',
      articulo: 'Art. 2, lit. h)',
      categoria: 'actores',
      icono: <Engineering />,
      ejemplos: [
        'Empresa de nómina externa',
        'Proveedor de cloud (AWS, Azure)',
        'Agencia de marketing',
        'Empresa de selección de personal'
      ],
      nota_chile: 'Actúa bajo instrucciones del responsable mediante contrato.'
    },
    tratamiento: {
      termino: 'Tratamiento de Datos',
      definicion: 'Cualquier operación o conjunto de operaciones realizadas sobre datos personales, sea por medios automatizados o no.',
      articulo: 'Art. 2, lit. p)',
      categoria: 'operaciones',
      icono: <Settings />,
      ejemplos: [
        'Recolección',
        'Registro',
        'Almacenamiento',
        'Modificación',
        'Consulta',
        'Comunicación',
        'Transferencia',
        'Eliminación'
      ]
    },
    consentimiento: {
      termino: 'Consentimiento',
      definicion: 'Manifestación de voluntad libre, informada, específica e inequívoca mediante la cual el titular autoriza el tratamiento de sus datos.',
      articulo: 'Art. 12',
      categoria: 'bases_licitud',
      icono: <CheckCircle />,
      requisitos: [
        'Libre: Sin coerción',
        'Informado: Con conocimiento de finalidades',
        'Específico: Para fines determinados',
        'Inequívoco: Acción afirmativa clara'
      ],
      nota_chile: 'Para datos sensibles debe ser EXPRESO y por escrito o medio equivalente.'
    },
    dpo: {
      termino: 'Delegado de Protección de Datos (DPO)',
      definicion: 'Persona designada por el responsable para supervisar el cumplimiento de la normativa de protección de datos.',
      articulo: 'Art. 23',
      categoria: 'gobernanza',
      icono: <Security />,
      obligatorio_cuando: [
        'Organismos públicos (siempre)',
        'Tratamiento a gran escala de datos sensibles',
        'Observación sistemática a gran escala'
      ],
      funciones: [
        'Asesorar en cumplimiento',
        'Supervisar políticas',
        'Ser punto de contacto con autoridad',
        'Capacitar al personal'
      ]
    },
    rat: {
      termino: 'Registro de Actividades de Tratamiento (RAT)',
      definicion: 'Documento que describe todas las actividades de tratamiento de datos que realiza una organización.',
      articulo: 'Art. 31',
      categoria: 'cumplimiento',
      icono: <Assignment />,
      debe_contener: [
        'Finalidades del tratamiento',
        'Categorías de datos',
        'Categorías de titulares',
        'Destinatarios',
        'Transferencias internacionales',
        'Plazos de conservación',
        'Medidas de seguridad'
      ],
      importante: true,
      nota_chile: 'Es la piedra angular del sistema de cumplimiento.'
    },
    evaluacion_impacto: {
      termino: 'Evaluación de Impacto (PIA/DPIA)',
      definicion: 'Análisis previo de los riesgos que un tratamiento puede representar para los derechos y libertades de las personas.',
      articulo: 'Art. 24',
      categoria: 'cumplimiento',
      icono: <Assessment />,
      obligatoria_cuando: [
        'Uso de nuevas tecnologías',
        'Tratamiento a gran escala de datos sensibles',
        'Observación sistemática de zonas públicas',
        'Alto riesgo para derechos'
      ],
      debe_incluir: [
        'Descripción del tratamiento',
        'Evaluación de necesidad',
        'Análisis de riesgos',
        'Medidas de mitigación'
      ]
    },
    transferencia_internacional: {
      termino: 'Transferencia Internacional',
      definicion: 'Comunicación de datos personales a un destinatario ubicado en un país extranjero.',
      articulo: 'Arts. 18-19',
      categoria: 'operaciones',
      icono: <Public />,
      permitida_cuando: [
        'País con nivel adecuado de protección',
        'Garantías apropiadas (cláusulas tipo)',
        'Consentimiento expreso',
        'Ejecución de contrato',
        'Razones de interés público'
      ],
      alerta: 'Requiere análisis especial para países sin adecuación'
    },
    datos_nna: {
      termino: 'Datos de Niños, Niñas y Adolescentes (NNA)',
      definicion: 'Datos personales de menores de 18 años que requieren protección especial.',
      articulo: 'Art. 13',
      categoria: 'especial',
      icono: <ChildCare />,
      requisitos: [
        'Consentimiento de padres/tutores para menores de 14',
        'Considerar interés superior del niño',
        'Lenguaje apropiado a su edad',
        'Medidas reforzadas de seguridad'
      ],
      importante: true,
      nota_chile: 'Entre 14-18 años pueden consentir según madurez.'
    },
    derecho_acceso: {
      termino: 'Derecho de Acceso',
      definicion: 'Derecho del titular a obtener confirmación sobre si se están tratando sus datos y acceder a ellos.',
      articulo: 'Art. 14',
      categoria: 'derechos',
      icono: <Visibility />,
      incluye: [
        'Copia de los datos',
        'Finalidades del tratamiento',
        'Categorías de datos',
        'Destinatarios',
        'Plazo de conservación',
        'Origen de los datos'
      ],
      plazo_respuesta: '20 días hábiles'
    },
    derecho_rectificacion: {
      termino: 'Derecho de Rectificación',
      definicion: 'Derecho a corregir datos personales inexactos o incompletos.',
      articulo: 'Art. 14',
      categoria: 'derechos',
      icono: <Edit />,
      aplica_cuando: [
        'Datos incorrectos',
        'Datos desactualizados',
        'Datos incompletos'
      ],
      plazo_respuesta: '20 días hábiles'
    },
    derecho_cancelacion: {
      termino: 'Derecho de Cancelación/Supresión',
      definicion: 'Derecho a eliminar los datos cuando ya no son necesarios o el tratamiento es ilícito.',
      articulo: 'Art. 14',
      categoria: 'derechos',
      icono: <Delete />,
      procede_cuando: [
        'Datos ya no necesarios',
        'Retiro del consentimiento',
        'Oposición al tratamiento',
        'Tratamiento ilícito',
        'Obligación legal de supresión'
      ],
      excepciones: [
        'Libertad de expresión',
        'Cumplimiento legal',
        'Salud pública',
        'Archivo en interés público',
        'Defensa de reclamaciones'
      ]
    },
    derecho_oposicion: {
      termino: 'Derecho de Oposición',
      definicion: 'Derecho a oponerse al tratamiento de datos en determinadas circunstancias.',
      articulo: 'Art. 14',
      categoria: 'derechos',
      icono: <Block />,
      aplica_para: [
        'Marketing directo (siempre)',
        'Interés legítimo',
        'Fines estadísticos',
        'Investigación'
      ]
    },
    derecho_portabilidad: {
      termino: 'Derecho de Portabilidad',
      definicion: 'Derecho a recibir los datos en formato estructurado y transferirlos a otro responsable.',
      articulo: 'Art. 16 ter',
      categoria: 'derechos',
      icono: <CloudDownload />,
      requisitos: [
        'Tratamiento automatizado',
        'Base: consentimiento o contrato',
        'Formato interoperable',
        'Transferencia directa si es posible'
      ],
      nota_chile: 'Nuevo derecho introducido en la ley chilena.'
    },
    brecha_seguridad: {
      termino: 'Brecha de Seguridad',
      definicion: 'Incidente que ocasiona destrucción, pérdida, alteración o comunicación no autorizada de datos.',
      articulo: 'Art. 19 bis',
      categoria: 'seguridad',
      icono: <Warning />,
      obligaciones: [
        'Notificar a autoridad sin dilación',
        'Notificar a afectados si hay alto riesgo',
        'Documentar el incidente',
        'Implementar medidas correctivas'
      ],
      plazo_notificacion: 'Sin dilación indebida',
      importante: true
    },
    privacy_by_design: {
      termino: 'Privacidad desde el Diseño',
      definicion: 'Principio que requiere incorporar la protección de datos desde la concepción de productos y servicios.',
      articulo: 'Art. 8',
      categoria: 'principios',
      icono: <Architecture />,
      elementos: [
        'Proactivo, no reactivo',
        'Privacidad por defecto',
        'Funcionalidad total',
        'Seguridad de extremo a extremo',
        'Transparencia',
        'Respeto por privacidad del usuario',
        'Privacidad embebida en diseño'
      ]
    },
    privacy_by_default: {
      termino: 'Privacidad por Defecto',
      definicion: 'Configuración que garantiza que solo se traten los datos necesarios para cada finalidad específica.',
      articulo: 'Art. 8',
      categoria: 'principios',
      icono: <SettingsSuggest />,
      implica: [
        'Mínimos datos por defecto',
        'Acceso limitado',
        'Retención mínima',
        'No compartir sin acción del usuario'
      ]
    },
    minimizacion: {
      termino: 'Minimización de Datos',
      definicion: 'Principio que exige que los datos sean adecuados, pertinentes y limitados a lo necesario.',
      articulo: 'Art. 7',
      categoria: 'principios',
      icono: <Minimize />,
      aplicacion: [
        'Recolectar solo lo necesario',
        'Eliminar lo superfluo',
        'Anonimizar cuando sea posible',
        'Seudonimizar para reducir riesgos'
      ]
    },
    agpd: {
      termino: 'Agencia de Protección de Datos Personales',
      definicion: 'Autoridad de control independiente encargada de supervisar el cumplimiento de la ley.',
      articulo: 'Arts. 32-38',
      categoria: 'institucional',
      icono: <AccountBalance />,
      funciones: [
        'Fiscalizar cumplimiento',
        'Resolver reclamaciones',
        'Dictar instrucciones',
        'Aplicar sanciones',
        'Promover buenas prácticas',
        'Cooperación internacional'
      ],
      importante: true,
      nota_chile: 'Nueva institución creada por la Ley 21.719.'
    },
    clausulas_contractuales: {
      termino: 'Cláusulas Contractuales Tipo',
      definicion: 'Contratos modelo aprobados que garantizan protección en transferencias internacionales.',
      articulo: 'Art. 18',
      categoria: 'herramientas',
      icono: <Description />,
      uso: [
        'Transferencias a países sin adecuación',
        'Relación responsable-encargado',
        'Garantías apropiadas'
      ]
    },
    bases_licitud: {
      termino: 'Bases de Licitud',
      definicion: 'Fundamentos legales que permiten el tratamiento de datos personales.',
      articulo: 'Arts. 12-13',
      categoria: 'bases_licitud',
      icono: <Gavel />,
      tipos: [
        'Consentimiento del titular',
        'Ejecución de contrato',
        'Obligación legal',
        'Interés vital',
        'Interés público',
        'Interés legítimo'
      ],
      nota_chile: 'Sin base de licitud, el tratamiento es ilegal.'
    },
    interes_legitimo: {
      termino: 'Interés Legítimo',
      definicion: 'Base de licitud cuando el tratamiento es necesario para intereses legítimos del responsable.',
      articulo: 'Art. 12',
      categoria: 'bases_licitud',
      icono: <Balance />,
      requiere: [
        'Identificar interés legítimo',
        'Evaluar necesidad',
        'Balancear con derechos del titular',
        'Documentar análisis (LIA)'
      ],
      ejemplos: [
        'Seguridad de red',
        'Prevención de fraude',
        'Marketing a clientes existentes'
      ]
    },
    seudonimizacion: {
      termino: 'Seudonimización',
      definicion: 'Tratamiento que impide atribuir datos a un titular sin información adicional.',
      articulo: 'Art. 2',
      categoria: 'seguridad',
      icono: <ShuffleOn />,
      caracteristicas: [
        'Datos separados de identidad',
        'Clave guardada aparte',
        'Reversible con clave',
        'Reduce riesgos'
      ]
    },
    anonimizacion: {
      termino: 'Anonimización',
      definicion: 'Proceso irreversible que impide identificar al titular de los datos.',
      articulo: 'No regulado',
      categoria: 'seguridad',
      icono: <VisibilityOff />,
      caracteristicas: [
        'Irreversible',
        'No sujeto a la ley',
        'Permite análisis estadísticos',
        'Elimina riesgos de privacidad'
      ]
    },
    accountability: {
      termino: 'Responsabilidad Proactiva (Accountability)',
      definicion: 'Obligación de demostrar cumplimiento activo de la normativa.',
      articulo: 'Art. 9',
      categoria: 'principios',
      icono: <VerifiedUser />,
      implica: [
        'Documentar medidas',
        'Mantener registros',
        'Auditorías periódicas',
        'Mejora continua',
        'Demostrar cumplimiento'
      ],
      importante: true
    },
    licitud_tratamiento: {
      termino: 'Licitud del Tratamiento',
      definicion: 'Principio que exige que todo tratamiento de datos debe tener una base legal válida.',
      articulo: 'Art. 6',
      categoria: 'principios',
      icono: <Gavel />,
      requisitos: [
        'Identificar base de licitud aplicable',
        'Documentar justificación legal',
        'Informar al titular sobre la base',
        'Mantener registro de bases utilizadas'
      ],
      nota_chile: 'Sin base de licitud válida, el tratamiento es ilegal y sujeto a sanciones.'
    },
    finalidad: {
      termino: 'Limitación de Finalidad',
      definicion: 'Los datos solo pueden ser tratados para fines determinados, explícitos y legítimos.',
      articulo: 'Art. 6',
      categoria: 'principios',
      icono: <Assignment />,
      caracteristicas: [
        'Fines claros desde la recolección',
        'No usar para fines incompatibles',
        'Informar cambios de finalidad',
        'Obtener nuevo consentimiento si cambia'
      ],
      importante: true
    },
    exactitud: {
      termino: 'Exactitud de los Datos',
      definicion: 'Obligación de mantener los datos personales exactos y actualizados.',
      articulo: 'Art. 7',
      categoria: 'principios',
      icono: <CheckCircle />,
      implica: [
        'Verificar exactitud periódicamente',
        'Corregir datos inexactos',
        'Eliminar datos obsoletos',
        'Permitir actualización por titular'
      ]
    },
    limitacion_almacenamiento: {
      termino: 'Limitación del Plazo de Conservación',
      definicion: 'Los datos deben conservarse únicamente durante el tiempo necesario para los fines del tratamiento.',
      articulo: 'Art. 7',
      categoria: 'principios',
      icono: <Timer />,
      requiere: [
        'Definir plazos de retención',
        'Justificar plazos establecidos',
        'Revisar periódicamente',
        'Eliminar cuando no sean necesarios'
      ],
      excepciones: [
        'Obligaciones legales de conservación',
        'Archivo en interés público',
        'Fines estadísticos o científicos',
        'Defensa de reclamaciones'
      ]
    },
    seguridad_datos: {
      termino: 'Seguridad de los Datos',
      definicion: 'Obligación de implementar medidas técnicas y organizativas apropiadas para proteger los datos.',
      articulo: 'Arts. 20-21',
      categoria: 'seguridad',
      icono: <Security />,
      medidas: [
        'Cifrado de datos',
        'Control de acceso',
        'Respaldo y recuperación',
        'Monitoreo de actividades',
        'Capacitación del personal',
        'Evaluación periódica'
      ],
      importante: true
    },
    notificacion_brechas: {
      termino: 'Notificación de Brechas',
      definicion: 'Obligación de notificar violaciones de seguridad a la autoridad y afectados.',
      articulo: 'Art. 19 bis',
      categoria: 'seguridad',
      icono: <Warning />,
      plazos: [
        'A la autoridad: Sin dilación indebida',
        'A los afectados: Si hay alto riesgo',
        'Documentar: Siempre, aunque no se notifique'
      ],
      debe_incluir: [
        'Naturaleza de la brecha',
        'Categorías de datos afectados',
        'Número aproximado de afectados',
        'Consecuencias probables',
        'Medidas adoptadas'
      ],
      importante: true
    },
    codigo_conducta: {
      termino: 'Código de Conducta',
      definicion: 'Conjunto de normas voluntarias para demostrar cumplimiento en sectores específicos.',
      articulo: 'Art. 25',
      categoria: 'herramientas',
      icono: <Policy />,
      caracteristicas: [
        'Específico por sector',
        'Aprobado por autoridad',
        'Vinculante para adherentes',
        'Supervisado por organismo'
      ]
    },
    certificacion: {
      termino: 'Certificación',
      definicion: 'Mecanismo voluntario para demostrar cumplimiento mediante evaluación de terceros.',
      articulo: 'Art. 26',
      categoria: 'herramientas',
      icono: <WorkspacePremium />,
      beneficios: [
        'Demuestra cumplimiento',
        'Genera confianza',
        'Facilita transferencias',
        'Diferenciación competitiva'
      ]
    },
    sanciones: {
      termino: 'Régimen Sancionatorio',
      definicion: 'Sistema de multas y sanciones por incumplimiento de la ley.',
      articulo: 'Arts. 39-45',
      categoria: 'institucional',
      icono: <Gavel />,
      niveles: [
        'Leves: hasta 500 UTM',
        'Graves: 501 a 5,000 UTM',
        'Gravísimas: 5,001 a 10,000 UTM'
      ],
      agravantes: [
        'Reincidencia',
        'Datos sensibles',
        'Afectar menores',
        'Beneficio económico',
        'No cooperar con autoridad'
      ],
      importante: true,
      nota_chile: 'Multas pueden llegar hasta aproximadamente $650 millones de pesos chilenos.'
    },
    transparencia: {
      termino: 'Transparencia',
      definicion: 'Obligación de informar de manera clara y accesible sobre el tratamiento de datos.',
      articulo: 'Art. 10',
      categoria: 'principios',
      icono: <Visibility />,
      debe_informar: [
        'Identidad del responsable',
        'Finalidades del tratamiento',
        'Base de licitud',
        'Destinatarios de los datos',
        'Derechos del titular',
        'Forma de ejercer derechos'
      ],
      importante: true
    },
    profilamiento: {
      termino: 'Elaboración de Perfiles (Profiling)',
      definicion: 'Tratamiento automatizado para evaluar aspectos personales y predecir comportamiento.',
      articulo: 'Art. 16 bis',
      categoria: 'operaciones',
      icono: <Psychology />,
      requiere: [
        'Informar al titular',
        'Explicar lógica aplicada',
        'Permitir intervención humana',
        'Derecho a oponerse'
      ],
      ejemplos: [
        'Scoring crediticio',
        'Evaluación laboral automatizada',
        'Segmentación de marketing',
        'Análisis de riesgo'
      ]
    },
    decision_automatizada: {
      termino: 'Decisiones Automatizadas',
      definicion: 'Decisiones basadas únicamente en tratamiento automatizado con efectos jurídicos.',
      articulo: 'Art. 16 bis',
      categoria: 'operaciones',
      icono: <Science />,
      prohibida_salvo: [
        'Necesaria para contrato',
        'Autorizada por ley',
        'Consentimiento explícito'
      ],
      derechos_titular: [
        'Obtener intervención humana',
        'Expresar punto de vista',
        'Impugnar la decisión',
        'Conocer lógica aplicada'
      ]
    },
    corresponsables: {
      termino: 'Corresponsables del Tratamiento',
      definicion: 'Dos o más responsables que determinan conjuntamente fines y medios del tratamiento.',
      articulo: 'Art. 2',
      categoria: 'actores',
      icono: <Group />,
      requiere: [
        'Acuerdo de corresponsabilidad',
        'Definir responsabilidades',
        'Punto de contacto para titulares',
        'Transparencia sobre roles'
      ]
    },
    medidas_correctivas: {
      termino: 'Medidas Correctivas',
      definicion: 'Acciones ordenadas por la autoridad para subsanar incumplimientos.',
      articulo: 'Art. 38',
      categoria: 'institucional',
      icono: <Build />,
      tipos: [
        'Advertencias',
        'Orden de cumplimiento',
        'Limitación del tratamiento',
        'Suspensión de flujos',
        'Eliminación de datos'
      ]
    },
    data_discovery: {
      termino: 'Descubrimiento de Datos (Data Discovery)',
      definicion: 'Proceso sistemático de identificación y catalogación de todos los datos personales que maneja una organización.',
      articulo: 'Art. 31',
      categoria: 'cumplimiento',
      icono: <Search />,
      metodologia: [
        'Entrevistas estructuradas por proceso',
        'Mapeo de sistemas y bases de datos',
        'Identificación de flujos de datos',
        'Documentación exhaustiva'
      ],
      nota_chile: 'Fundamental para crear el Registro de Actividades de Tratamiento (RAT).'
    },
    equipo_multidisciplinario: {
      termino: 'Equipo Multidisciplinario de Protección de Datos',
      definicion: 'Grupo de trabajo conformado por representantes de todas las áreas clave que tratan datos personales.',
      articulo: 'Mejores prácticas',
      categoria: 'gobernanza',
      icono: <Group />,
      debe_incluir: [
        'DPO (líder del equipo)',
        'Recursos Humanos',
        'Finanzas',
        'Marketing y Ventas',
        'Operaciones',
        'Tecnología de Información',
        'Legal'
      ]
    },
    mapeo_datos: {
      termino: 'Mapeo de Datos',
      definicion: 'Proceso de trazar y documentar cómo fluyen los datos personales dentro y fuera de la organización.',
      articulo: 'Art. 31',
      categoria: 'cumplimiento',
      icono: <AccountTree />,
      tipos_flujos: [
        'Flujos Internos: Entre sistemas de la organización',
        'Flujos Externos: Hacia terceros y encargados',
        'Transferencias Internacionales: Hacia otros países'
      ],
      importante: true
    },
    flujos_internos: {
      termino: 'Flujos Internos de Datos',
      definicion: 'Movimiento de datos personales entre sistemas y departamentos dentro de la misma organización.',
      articulo: 'Art. 31',
      categoria: 'operaciones',
      icono: <AccountTree />,
      ejemplos: [
        'Web → CRM → ERP',
        'RRHH → Nómina → Contabilidad',
        'Ventas → Facturación → Cobranza',
        'Marketing → Analytics → BI'
      ]
    },
    flujos_externos: {
      termino: 'Flujos Externos de Datos',
      definicion: 'Transferencia de datos personales hacia terceros fuera de la organización.',
      articulo: 'Arts. 18-19',
      categoria: 'operaciones',
      icono: <Public />,
      requiere_documentar: [
        'Identidad del tercero receptor',
        'Propósito de la transferencia',
        'Base legal que la ampara',
        'Medidas de seguridad aplicadas'
      ]
    },
    plataforma_gobernanza: {
      termino: 'Plataforma de Gobernanza de Datos',
      definicion: 'Sistema centralizado para gestionar el cumplimiento de protección de datos.',
      articulo: 'Herramienta técnica',
      categoria: 'herramientas',
      icono: <Settings />,
      componentes: [
        'Módulo RAT',
        'Gestión de consentimientos',
        'Portal de derechos ARCO+',
        'Gestión de brechas',
        'Motor de políticas de retención',
        'Auditoría y reportes'
      ]
    },
    politicas_retencion: {
      termino: 'Políticas de Retención de Datos',
      definicion: 'Reglas que establecen por cuánto tiempo se conservará cada categoría de datos y su justificación.',
      articulo: 'Art. 7',
      categoria: 'cumplimiento',
      icono: <Timer />,
      debe_especificar: [
        'Categoría de datos',
        'Período de retención',
        'Justificación legal o de negocio',
        'Acción al vencimiento (eliminar/anonimizar)'
      ],
      ejemplo: 'Facturas: 6 años por obligaciones tributarias'
    },
    eliminacion_segura: {
      termino: 'Eliminación Segura de Datos',
      definicion: 'Proceso de borrado definitivo e irrecuperable de datos personales cuando ya no son necesarios.',
      articulo: 'Art. 14',
      categoria: 'seguridad',
      icono: <Delete />,
      metodos: [
        'Borrado físico en bases de datos',
        'Sobreescritura múltiple en discos',
        'Destrucción física de medios',
        'Anonimización irreversible'
      ],
      debe_registrarse: true
    },
    datos_iot: {
      termino: 'Datos de IoT (Internet de las Cosas)',
      definicion: 'Información generada por sensores y dispositivos conectados que puede vincularse a personas.',
      articulo: 'Aplicación sectorial',
      categoria: 'especial',
      icono: <Science />,
      ejemplos_chile: [
        'Sensores en centros de cultivo salmonero',
        'Datos de geolocalización de personal',
        'Temperatura y oxígeno en tiempo real',
        'Alimentación automatizada con trazabilidad'
      ],
      alerta: 'Si los datos pueden vincularse a un operario específico, son datos personales'
    },
    cesionario: {
      termino: 'Cesionario de Datos',
      definicion: 'Tercero que recibe datos personales y los trata para sus propios fines.',
      articulo: 'Art. 2',
      categoria: 'actores',
      icono: <Business />,
      diferencia_encargado: [
        'Cesionario: Define sus propios fines',
        'Encargado: Trata por cuenta del responsable'
      ],
      requiere: 'Base de licitud propia para el tratamiento'
    },
    data_assets: {
      termino: 'Activos de Datos (Data Assets)',
      definicion: 'Sistemas, bases de datos y repositorios donde residen los datos personales.',
      articulo: 'Inventario técnico',
      categoria: 'herramientas',
      icono: <Storage />,
      ejemplos: [
        'Bases de datos SQL',
        'Sistemas CRM/ERP',
        'Archivos en cloud',
        'Servidores de correo',
        'Sistemas de backup'
      ]
    },
    processing_activities: {
      termino: 'Actividades de Tratamiento',
      definicion: 'Conjunto de operaciones realizadas sobre datos personales para un fin específico.',
      articulo: 'Art. 31',
      categoria: 'operaciones',
      icono: <Assignment />,
      ejemplos: [
        'Proceso de reclutamiento y selección',
        'Gestión de nómina',
        'Marketing directo',
        'Análisis de comportamiento de clientes',
        'Gestión de proveedores'
      ],
      debe_documentarse: 'En el RAT con todos sus detalles'
    },
    motor_automatizacion: {
      termino: 'Motor de Automatización',
      definicion: 'Sistema automatizado para ejecutar políticas de retención y eliminación de datos.',
      articulo: 'Herramienta técnica',
      categoria: 'herramientas',
      icono: <Build />,
      funciones: [
        'Identificar datos vencidos',
        'Ejecutar eliminación programada',
        'Aplicar anonimización automática',
        'Generar logs de auditoría',
        'Notificar acciones completadas'
      ]
    },
    logs_inmutables: {
      termino: 'Logs Inmutables de Auditoría',
      definicion: 'Registros inalterables de todas las operaciones realizadas sobre datos personales.',
      articulo: 'Art. 9',
      categoria: 'seguridad',
      icono: <Description />,
      debe_registrar: [
        'Qué dato se procesó',
        'Quién realizó la acción',
        'Cuándo ocurrió',
        'Desde dónde (IP/ubicación)',
        'Razón o justificación'
      ],
      caracteristica_clave: 'No pueden ser modificados después de su creación'
    },
    rbac: {
      termino: 'Control de Acceso Basado en Roles (RBAC)',
      definicion: 'Sistema de seguridad que restringe el acceso a datos según el rol del usuario.',
      articulo: 'Art. 20',
      categoria: 'seguridad',
      icono: <Security />,
      principios: [
        'Mínimo privilegio necesario',
        'Segregación de funciones',
        'Revisión periódica de permisos',
        'Auditoría de accesos'
      ]
    },
    cifrado_transito_reposo: {
      termino: 'Cifrado en Tránsito y en Reposo',
      definicion: 'Protección criptográfica de datos durante su transmisión y almacenamiento.',
      articulo: 'Art. 20',
      categoria: 'seguridad',
      icono: <Lock />,
      tipos: [
        'En tránsito: TLS/SSL para comunicaciones',
        'En reposo: AES-256 para almacenamiento',
        'Gestión segura de llaves',
        'Cifrado de backups'
      ],
      importante: true
    },
    biomasa: {
      termino: 'Datos de Biomasa',
      definicion: 'Información relacionada con el cultivo y producción acuícola que puede contener datos personales.',
      articulo: 'Aplicación sectorial',
      categoria: 'especial',
      icono: <Science />,
      cuando_es_personal: [
        'Si se vincula a un operario específico',
        'Si contiene datos de trabajadores',
        'Si incluye geolocalización de personal',
        'Si registra decisiones de empleados'
      ],
      nota_chile: 'Relevante para industria salmonera chilena'
    },
    sernapesca: {
      termino: 'Reportes a SERNAPESCA',
      definicion: 'Obligación de reportar información al Servicio Nacional de Pesca que puede incluir datos personales.',
      articulo: 'Obligación legal sectorial',
      categoria: 'cumplimiento',
      icono: <AccountBalance />,
      consideraciones: [
        'Base de licitud: Obligación legal',
        'Minimización: Solo datos necesarios',
        'Seguridad en la transmisión',
        'Registro de envíos'
      ]
    },
    medidas_precontractuales: {
      termino: 'Medidas Precontractuales',
      definicion: 'Base de licitud para tratar datos necesarios antes de celebrar un contrato.',
      articulo: 'Art. 12',
      categoria: 'bases_licitud',
      icono: <Description />,
      aplica_cuando: [
        'Evaluación de candidatos a empleo',
        'Cotizaciones a clientes potenciales',
        'Due diligence de proveedores',
        'Evaluación crediticia previa'
      ],
      requisito: 'A solicitud del interesado'
    }
  };

  // Categorías para filtrado
  const categorias = {
    all: { nombre: 'Todos', icon: <Book /> },
    fundamental: { nombre: 'Fundamentales', icon: <Star />, color: '#f44336' },
    actores: { nombre: 'Actores', icon: <Group />, color: '#2196f3' },
    operaciones: { nombre: 'Operaciones', icon: <Settings />, color: '#4caf50' },
    derechos: { nombre: 'Derechos ARCO+', icon: <Security />, color: '#ff9800' },
    principios: { nombre: 'Principios', icon: <Policy />, color: '#9c27b0' },
    cumplimiento: { nombre: 'Cumplimiento', icon: <Assignment />, color: '#00bcd4' },
    seguridad: { nombre: 'Seguridad', icon: <Lock />, color: '#795548' },
    bases_licitud: { nombre: 'Bases Licitud', icon: <Gavel />, color: '#607d8b' },
    herramientas: { nombre: 'Herramientas', icon: <Build />, color: '#e91e63' },
    especial: { nombre: 'Protección Especial', icon: <ChildCare />, color: '#ff5722' },
    institucional: { nombre: 'Institucional', icon: <AccountBalance />, color: '#3f51b5' }
  };

  // Filtrar términos basado en búsqueda y categoría
  const terminosFiltrados = Object.entries(terminos).filter(([key, termino]) => {
    const matchSearch = termino.termino.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       termino.definicion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'all' || termino.categoria === selectedCategory;
    return matchSearch && matchCategory;
  });

  const handleExpandTerm = (key) => {
    setExpandedTerm(expandedTerm === key ? null : key);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
            <LocalLibrary /> Glosario LPDP - Ley 21.719
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, color: 'white' }}>
            Términos esenciales de la Ley de Protección de Datos Personales de Chile
          </Typography>
        </CardContent>
      </Card>

      {/* Alert sobre términos chilenos */}
      <Alert severity="warning" icon={<NewReleases />} sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          ⚠️ TÉRMINOS ÚNICOS DE CHILE:
        </Typography>
        La ley chilena introduce conceptos que no existen en otras legislaciones como el GDPR europeo:
        <ul style={{ marginTop: '8px', marginBottom: 0 }}>
          <li><strong>Situación Socioeconómica como dato sensible:</strong> Ingresos, score crediticio, patrimonio</li>
          <li><strong>Agencia de Protección de Datos Personales:</strong> Nueva autoridad de control</li>
          <li><strong>Plazos específicos:</strong> 20 días hábiles para responder derechos</li>
        </ul>
      </Alert>

      {/* Búsqueda y filtros */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            placeholder="Buscar término..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {Object.entries(categorias).slice(0, 4).map(([key, cat]) => (
              <Chip
                key={key}
                label={cat.nombre}
                icon={cat.icon}
                onClick={() => setSelectedCategory(key)}
                color={selectedCategory === key ? 'primary' : 'default'}
                variant={selectedCategory === key ? 'filled' : 'outlined'}
              />
            ))}
          </Box>
        </Grid>
      </Grid>

      {/* Categorías */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
          Filtrar por categoría:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {Object.entries(categorias).map(([key, cat]) => (
            <Chip
              key={key}
              label={cat.nombre}
              icon={cat.icon}
              onClick={() => setSelectedCategory(key)}
              sx={{
                bgcolor: selectedCategory === key ? cat.color : 'transparent',
                color: selectedCategory === key ? 'white' : 'text.primary',
                borderColor: cat.color,
                '&:hover': {
                  bgcolor: cat.color,
                  color: 'white'
                }
              }}
              variant="outlined"
            />
          ))}
        </Box>
      </Paper>

      {/* Estadísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4">{Object.keys(terminos).length}</Typography>
              <Typography variant="caption" color="text.secondary">
                Términos totales
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="error.main">
                {Object.values(terminos).filter(t => t.importante).length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Términos críticos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="warning.main">
                {Object.values(terminos).filter(t => t.nota_chile).length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Específicos de Chile
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="success.main">
                {terminosFiltrados.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Resultados filtrados
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Lista de términos */}
      <Grid container spacing={3}>
        {terminosFiltrados.map(([key, termino]) => (
          <Grid item xs={12} key={key}>
            <Card 
              sx={{ 
                borderLeft: termino.importante ? '4px solid' : 'none',
                borderColor: termino.importante ? 'error.main' : 'transparent'
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {termino.icono}
                    <Typography variant="h6" fontWeight={600}>
                      {termino.termino}
                    </Typography>
                    {termino.importante && (
                      <Badge badgeContent="CRÍTICO" color="error" />
                    )}
                    {termino.nota_chile && (
                      <Chip label="Chile" size="small" color="warning" />
                    )}
                  </Box>
                  <Box>
                    <Chip 
                      label={termino.articulo} 
                      size="small" 
                      variant="outlined"
                      icon={<Gavel />}
                    />
                    <IconButton 
                      size="small"
                      onClick={() => copyToClipboard(termino.definicion)}
                      sx={{ ml: 1 }}
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={() => handleExpandTerm(key)}
                      size="small"
                    >
                      {expandedTerm === key ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="body1" paragraph>
                  {termino.definicion}
                </Typography>

                {termino.alerta && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    {termino.alerta}
                  </Alert>
                )}

                {termino.nota_chile && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Nota Chile:</strong> {termino.nota_chile}
                    </Typography>
                  </Alert>
                )}

                <Collapse in={expandedTerm === key}>
                  <Divider sx={{ my: 2 }} />
                  
                  {termino.ejemplos && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Ejemplos:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {termino.ejemplos.map((ejemplo, idx) => (
                          <Chip key={idx} label={ejemplo} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {termino.requisitos && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Requisitos:
                      </Typography>
                      <List dense>
                        {termino.requisitos.map((req, idx) => (
                          <ListItem key={idx}>
                            <ListItemText primary={req} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {termino.funciones && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Funciones:
                      </Typography>
                      <List dense>
                        {termino.funciones.map((func, idx) => (
                          <ListItem key={idx}>
                            <ListItemText primary={func} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {termino.debe_contener && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Debe contener:
                      </Typography>
                      <List dense>
                        {termino.debe_contener.map((item, idx) => (
                          <ListItem key={idx}>
                            <ListItemText primary={item} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {termino.obligatorio_cuando && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Obligatorio cuando:
                      </Typography>
                      <List dense>
                        {termino.obligatorio_cuando.map((caso, idx) => (
                          <ListItem key={idx}>
                            <ListItemText primary={caso} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {termino.plazo_respuesta && (
                    <Alert severity="info" icon={<Timer />}>
                      Plazo de respuesta: {termino.plazo_respuesta}
                    </Alert>
                  )}
                </Collapse>

                <Box sx={{ mt: 2 }}>
                  <Chip 
                    label={categorias[termino.categoria].nombre}
                    icon={categorias[termino.categoria].icon}
                    size="small"
                    sx={{ 
                      bgcolor: categorias[termino.categoria].color,
                      color: 'white'
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Footer con información adicional */}
      <Card sx={{ mt: 4, bgcolor: 'grey.900' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📚 Referencias Legales
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" fontWeight={600}>
                Ley 21.719 - Protección de Datos Personales
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Publicada: 12 de junio de 2024
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vigencia: 12 de diciembre de 2024
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" fontWeight={600}>
                Plazos Clave:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="20 días hábiles"
                    secondary="Respuesta a derechos ARCO+"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Sin dilación indebida"
                    secondary="Notificación de brechas"
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

// Alias para íconos
const Person = People;

export default GlosarioLPDP;