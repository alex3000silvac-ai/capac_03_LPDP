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
import PageLayout from '../components/PageLayout';
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
  Person,
  VerifiedUser,
  MyLocation,
  Remove,
  CheckCircle,
  CloudDownload,
  Block,
  SmartToy,
  Shield,
  Error,
  VisibilityOff,
  Balance,
  Architecture,
  Description,
  TableChart,
  Delete,
  GetApp,
  AccountTree,
  Settings,
  Build,
  People,
  WorkspacePremium,
  Psychology,
  Science,
  Shuffle,
  SettingsSuggest,
  Storage,
} from '@mui/icons-material';

const GlosarioLPDP = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTerm, setExpandedTerm] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Términos del glosario extendido basados en glosario.txt y la Ley 21.719
  const terminos = {
    datos_personales: {
      termino: 'Dato Personal',
      definicion: 'Cualquier información vinculada o referida a una persona natural identificada o identificable. Una persona es "identificable" cuando su identidad puede determinarse, directa o indirectamente, mediante elementos como el nombre, el número de cédula de identidad, o factores propios de su identidad física, fisiológica, genética, psíquica, económica, cultural o social.',
      articulo: 'Art. 2, num. 3, Ley 21.719',
      categoria: 'fundamental',
      icono: <Group />,
      ampliacion: 'Esta definición representa una expansión significativa respecto a la Ley N° 19.628. Al incluir explícitamente identificadores genéticos, biométricos, culturales y sociales, la normativa se adapta a las nuevas formas de recolección de datos en el entorno digital.',
      ejemplos: [
        'Nombre y apellidos',
        'RUT',
        'Dirección física y electrónica',
        'Geolocalización de dispositivo móvil',
        'Identificador de publicidad en línea',
        'Inferencias sobre hábitos de consumo',
        'Datos biométricos',
        'Información genética'
      ],
      importante: true,
      nota_chile: 'En Chile incluye cualquier dato que permita identificar directa o indirectamente a una persona.'
    },
    datos_sensibles: {
      termino: 'Dato Personal Sensible',
      definicion: 'Categoría especial de dato personal cuyo tratamiento puede generar un riesgo significativo para los derechos y libertades del titular, o dar origen a discriminación. La ley enumera taxativamente qué se considera dato sensible, incluyendo información que revele el origen racial o étnico, la afiliación política o sindical, las convicciones ideológicas o religiosas, la situación socioeconómica, la salud, el perfil biológico o genético, los datos biométricos, y la vida u orientación sexual.',
      articulo: 'Art. 11, Ley 21.719',
      categoria: 'fundamental',
      icono: <Lock />,
      ampliacion: 'El tratamiento de datos sensibles está sujeto a un régimen de protección reforzado. La regla general es que solo pueden ser tratados con el consentimiento explícito y por escrito (o medio equivalente) del titular. Las excepciones a esta regla son muy acotadas, como la salvaguarda de la vida del titular o el cumplimiento de una obligación legal.',
      ejemplos: [
        'Origen racial o étnico',
        'Afiliación política o sindical',
        'Convicciones religiosas o ideológicas',
        'Situación socioeconómica (NOVEDAD CHILE)',
        'Información de salud',
        'Datos biométricos (huella, rostro)',
        'Información genética',
        'Orientación sexual o identidad de género'
      ],
      importante: true,
      alerta: 'PROTECCIÓN REFORZADA: Requiere consentimiento explícito',
      nota_chile: 'Chile incluye "situación socioeconómica" como dato sensible, concepto único que no existe en el GDPR europeo.'
    },
    situacion_socioeconomica: {
      termino: 'Situación Socioeconómica',
      definicion: 'DATO SENSIBLE en Chile que revela la capacidad económica, nivel de ingresos, patrimonio, historial crediticio o elegibilidad para beneficios sociales de una persona.',
      articulo: 'Art. 2, lit. g',
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
      termino: 'Titular de los Datos',
      definicion: 'Persona natural a quien se refieren los datos personales que son objeto de tratamiento. La ley se estructura en torno a la protección de sus derechos y al otorgamiento de un control efectivo sobre su información personal.',
      articulo: 'Art. 12, Ley 21.719',
      categoria: 'actores',
      icono: <Person />,
      ampliacion: 'El titular es el protagonista y beneficiario final de la ley. A diferencia del marco anterior, donde su capacidad de acción era limitada, la Ley 21.719 lo empodera con un catálogo de derechos robustos y un mecanismo administrativo (la APDP) para hacerlos valer de forma expedita y gratuita.',
      derechos: [
        'Acceso: confirmar tratamiento y obtener copia',
        'Rectificación: corregir datos inexactos',
        'Supresión: eliminación cuando no sean necesarios',
        'Oposición: limitar usos no deseados',
        'Portabilidad: recibir datos en formato interoperable',
        'Bloqueo: suspensión temporal del tratamiento',
        'Oposición a decisiones automatizadas'
      ],
      nota_chile: 'Los derechos se ejercen gratuitamente ante el responsable y, en caso de negativa, ante la APDP sin necesidad de abogado ni costos judiciales.'
    },
    responsable_datos: {
      termino: 'Responsable de Datos',
      definicion: 'Persona natural o jurídica, pública o privada, que decide sobre el tratamiento de datos personales.',
      articulo: 'Art. 2, lit. n',
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
      articulo: 'Art. 2, lit. h',
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
      definicion: 'Cualquier operación o conjunto de operaciones, automatizadas o no, aplicadas a datos personales. El concepto abarca todo el ciclo de vida del dato, incluyendo su recolección, registro, organización, estructuración, conservación, uso, análisis, comunicación, transferencia, modificación, extracción, consulta, difusión o supresión.',
      articulo: 'Art. 12, Ley 21.719',
      categoria: 'operaciones',
      icono: <Settings />,
      ampliacion: 'La amplitud de esta definición es deliberada y busca evitar lagunas legales. Desde el momento en que una organización recibe un currículum, registra un cliente en una base de datos, envía un correo de marketing, o simplemente almacena información en un servidor, está realizando un "tratamiento de datos".',
      ejemplos: [
        'Recolección de formularios web',
        'Registro en bases de datos',
        'Organización y estructuración',
        'Conservación y almacenamiento',
        'Uso y análisis',
        'Comunicación a terceros',
        'Transferencia nacional/internacional',
        'Supresión y eliminación'
      ]
    },
    consentimiento: {
      termino: 'Consentimiento',
      definicion: 'Manifestación de voluntad libre, específica, informada e inequívoca mediante la cual el titular de los datos acepta el tratamiento de su información personal para uno o varios fines determinados. La ley exige que el responsable del tratamiento sea capaz de probar que obtuvo este consentimiento.',
      articulo: 'Art. 2, Ley 21.719',
      categoria: 'bases_licitud',
      icono: <CheckCircle />,
      ampliacion: 'Este es uno de los cambios más disruptivos para las prácticas empresariales. Se abandonan las cláusulas de consentimiento tácito o ambiguo, a menudo ocultas en extensos términos y condiciones. Ahora, el consentimiento debe ser una acción afirmativa y clara por parte del usuario.',
      requisitos: [
        'Libre: Sin coerción o dependencia de servicios',
        'Específico: Para finalidades concretas y determinadas',
        'Informado: Con conocimiento completo del tratamiento',
        'Inequívoco: Acción afirmativa clara (no omisiones)',
        'Demostrable: Capacidad de probar su obtención',
        'Revocable: Posibilidad de retiro en cualquier momento'
      ],
      nota_chile: 'Existe presunción legal de que el consentimiento NO ha sido otorgado libremente si su obtención se enmarca en un contrato de adhesión donde el tratamiento no es necesario para la ejecución del mismo.'
    },
    fuentes_licitud: {
      termino: 'Fuentes de Licitud (Bases Legales)',
      definicion: 'Bases jurídicas que legitiman el tratamiento de datos personales. Si bien el consentimiento es la regla general, la ley reconoce otras causales que permiten el tratamiento sin necesidad de la autorización del titular. Entre estas se encuentran: la ejecución de un contrato en el que el titular es parte, el cumplimiento de una obligación legal, la protección de los intereses vitales del titular, o la satisfacción de un interés legítimo del responsable o de un tercero.',
      articulo: 'Art. 2, Ley 21.719',
      categoria: 'bases_licitud',
      icono: <Gavel />,
      ampliacion: 'La inclusión de diversas fuentes de licitud otorga flexibilidad a las organizaciones, reconociendo que no todo tratamiento puede depender del consentimiento. Sin embargo, esto también impone una nueva carga: por cada actividad de tratamiento, la organización debe realizar un análisis legal para identificar, justificar y documentar cuál es la base de licitud aplicable.',
      tipos: [
        'Consentimiento del titular',
        'Ejecución de contrato',
        'Cumplimiento de obligación legal',
        'Protección de intereses vitales',
        'Interés legítimo (requiere ponderación)',
        'Ejercicio de función pública'
      ],
      nota_chile: 'La base de "interés legítimo" es la más compleja, ya que requiere un ejercicio de ponderación entre los intereses de la empresa y los derechos del individuo, cuyo resultado debe estar debidamente documentado para poder ser defendido ante la APDP.'
    },
    ambito_territorial: {
      termino: 'Ámbito de Aplicación Territorial',
      definicion: 'La Ley 21.719 posee un alcance extraterritorial. Sus disposiciones se aplican no solo a los responsables o encargados de tratamiento establecidos en Chile, sino también a aquellos que, sin estar en el país, realizan operaciones de tratamiento destinadas a ofrecer bienes o servicios a titulares que se encuentren en Chile, o que monitorean el comportamiento de dichas personas.',
      articulo: 'Art. 3, Ley 21.719',
      categoria: 'fundamental',
      icono: <Public />,
      ampliacion: 'La adopción de un criterio de aplicación extraterritorial, similar al del GDPR, es una decisión estratégica de gran calado. Con esto, la legislación chilena se asegura de que las grandes plataformas tecnológicas y empresas multinacionales que operan en el mercado chileno queden sujetas a sus normas, independientemente de la ubicación de sus sedes o servidores.',
      ejemplos: [
        'Plataformas de redes sociales globales',
        'Servicios de streaming internacional',
        'Comercio electrónico transfronterizo',
        'Servicios de publicidad digital',
        'Aplicaciones móviles con usuarios chilenos'
      ],
      nota_chile: 'Permite que Chile regule a empresas extranjeras que procesen datos de residentes chilenos, creando un entorno jurídico predecible y facilitando el reconocimiento como país con "nivel adecuado" de protección ante la UE.'
    },
    dpo: {
      termino: 'Delegado de Protección de Datos (DPD/DPO)',
      definicion: 'Profesional con conocimientos especializados en la normativa y práctica de protección de datos, cuya función es supervisar internamente el cumplimiento de la ley, asesorar a la organización, y actuar como punto de contacto con la APDP y con los titulares de los datos.',
      articulo: 'Art. 6, Ley 21.719',
      categoria: 'actores',
      icono: <VerifiedUser />,
      ampliacion: 'Aunque su designación no es obligatoria para todas las organizaciones, es un requisito para aquellas que implementen un Modelo de Prevención de Infracciones y es altamente recomendable para las que realizan tratamientos de datos a gran escala o de alto riesgo. La creación de esta figura profesionaliza la gestión de la privacidad dentro de las empresas.',
      obligatorio_cuando: [
        'Organismos públicos (siempre obligatorio)',
        'Organizaciones con Modelo de Prevención de Infracciones',
        'Tratamiento masivo de datos sensibles',
        'Vigilancia sistemática de zonas públicas',
        'Tratamientos de alto riesgo a gran escala'
      ],
      funciones: [
        'Asesorar sobre obligaciones legales',
        'Supervisar políticas internas de protección',
        'Ser punto de contacto con la APDP',
        'Capacitar y sensibilizar al personal',
        'Supervisar evaluaciones de impacto (EIPD)',
        'Atender consultas de titulares de datos'
      ],
      nota_chile: 'El DPO establece un canal de comunicación formal y experto con la autoridad, lo que se espera agilice los procesos de fiscalización y consulta.'
    },
    apdp: {
      termino: 'Agencia de Protección de Datos Personales (APDP)',
      definicion: 'Nuevo organismo público, autónomo, de carácter técnico y descentralizado, con personalidad jurídica y patrimonio propio, creado por la ley para velar por el cumplimiento de la normativa de protección de datos. Se relaciona con el Presidente de la República a través del Ministerio de Economía, Fomento y Turismo.',
      articulo: 'Art. 8 y 10, Ley 21.719',
      categoria: 'institucional',
      icono: <AccountBalance />,
      ampliacion: 'La APDP es la piedra angular del nuevo modelo de protección de datos en Chile. Su existencia y sus facultades transforman la protección de datos de un concepto teórico a una realidad fiscalizable y exigible. La efectividad de la ley dependerá en gran medida de la capacidad técnica, la independencia y los recursos con que cuente la Agencia.',
      estructura: [
        'Consejo Directivo (3 consejeros)',
        'Designación presidencial con acuerdo del Senado',
        'Carácter técnico y especializado',
        'Autonomía administrativa y presupuestaria'
      ],
      facultades: [
        'Potestad normativa: dictar instrucciones generales obligatorias',
        'Potestad fiscalizadora: auditorías e investigaciones',
        'Resolución de reclamos de titulares',
        'Potestad sancionadora: multas y medidas correctivas',
        'Certificación de Modelos de Prevención',
        'Determinación de niveles de protección adecuados'
      ],
      nota_chile: 'Representa el cambio más trascendental: de un sistema reactivo y judicializado a uno proactivo y administrativo especializado.'
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
      icono: <Remove />,
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
      icono: <Shuffle />,
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
    data_discovery_proceso: {
      termino: 'Procedimiento de Mapeo Inicial de Datos (Data Discovery)',
      definicion: 'Proceso sistemático para crear y mantener un inventario exhaustivo de todos los activos de datos personales que la organización trata. Es la piedra angular de todo el sistema de cumplimiento.',
      articulo: 'Art. 31 - RAT',
      categoria: 'cumplimiento',
      icono: <Search />,
      pasos_metodologia: [
        'Conformación del Equipo de Trabajo multidisciplinario',
        'Metodología de Levantamiento centrada en actividades',
        'Documentación de Actividades de Tratamiento completa'
      ],
      equipo_debe_incluir: [
        'DPO (líder del equipo)',
        'Representantes de RRHH',
        'Representantes de Finanzas',
        'Representantes de Marketing',
        'Representantes de Ventas',
        'Representantes de Operaciones',
        'Representantes de TI',
        'Representantes del área Legal'
      ],
      importante: true,
      nota_chile: 'Sin un conocimiento claro de qué datos se tienen, dónde están, por qué se tienen, cómo fluyen y cuándo deben ser eliminados, es imposible cumplir con los demás principios y obligaciones de la Ley N° 21.719.'
    },
    metodologia_levantamiento: {
      termino: 'Metodología de Levantamiento de Datos',
      definicion: 'El proceso no debe centrarse en preguntar "¿qué bases de datos tienen?", sino en "¿qué actividades o procesos realizan que involucren información de personas?". Se deben realizar entrevistas estructuradas y talleres con los dueños de los procesos.',
      articulo: 'Art. 31',
      categoria: 'cumplimiento',
      icono: <Assignment />,
      ejemplo_preguntas_rrhh: [
        '¿Cuál es el proceso completo desde que reciben un currículum hasta que se contrata a una persona?',
        '¿Qué información solicitan?',
        '¿Dónde la guardan?',
        '¿Con quién la comparten (ej. empresa de exámenes preocupacionales)?',
        '¿Por cuánto tiempo la conservan si la persona no es contratada?'
      ],
      importante: true
    },
    documentacion_actividades_tratamiento: {
      termino: 'Documentación de Actividades de Tratamiento',
      definicion: 'Para cada actividad identificada, el equipo debe documentar en el sistema de cumplimiento la información completa que corresponde a los elementos de un RAT.',
      articulo: 'Art. 31',
      categoria: 'cumplimiento',
      icono: <Assignment />,
      elementos_rat: [
        'Nombre de la actividad de tratamiento (ej. "Proceso de Reclutamiento y Selección")',
        'Finalidad(es) del tratamiento (ej. "Evaluar la idoneidad de los candidatos para vacantes laborales")',
        'Base de licitud (ej. "Consentimiento del candidato", "Medidas precontractuales")',
        'Categorías de titulares de datos (ej. "Postulantes a empleos")',
        'Categorías de datos personales tratados (ej. "Datos de identificación, historial académico, experiencia laboral, datos de contacto")',
        'Categorías de destinatarios internos y externos (ej. "Gerentes de área, empresa externa de verificación de antecedentes")',
        'Transferencias internacionales si aplica (País de destino y garantías)',
        'Plazos de conservación y supresión (ej. "Currículums de candidatos no seleccionados se eliminan después de 6 meses")',
        'Descripción de las medidas de seguridad técnicas y organizativas'
      ],
      importante: true
    },
    clasificacion_sensibilidad: {
      termino: 'Clasificación de Datos por Sensibilidad',
      definicion: 'Una vez identificados los datos, es crucial clasificarlos correctamente, ya que la ley impone requisitos más estrictos para ciertas categorías.',
      articulo: 'Art. 2, lit. g',
      categoria: 'fundamental',
      icono: <Lock />,
      tipos_clasificacion: [
        'Datos Personales Comunes: Información de identificación, contacto, datos laborales, etc.',
        'Datos Sensibles (Art. 2, lit. g): origen étnico, afiliación sindical, convicciones religiosas o filosóficas, datos de salud, datos biométricos, vida u orientación sexual',
        'Datos de Niños, Niñas y Adolescentes (NNA): Cualquier dato perteneciente a menores de edad'
      ],
      importante: true,
      alerta: 'NOVEDAD CHILENA: La "situación socioeconómica" es considerada dato sensible',
      nota_chile: 'Datos como el nivel de ingresos, historial crediticio o la elegibilidad para beneficios sociales, comúnmente manejados por RRHH o áreas financieras, deben ser tratados con el máximo nivel de protección.'
    },
    documentacion_flujos_datos: {
      termino: 'Documentación de Flujos de Datos (Data Flows)',
      definicion: 'El inventario no es solo una lista estática, sino un mapa dinámico. El personal debe documentar cómo se mueven los datos.',
      articulo: 'Art. 31',
      categoria: 'operaciones',
      icono: <AccountTree />,
      tipos_flujos: [
        'Flujos Internos: Trazar el recorrido de los datos entre los sistemas internos',
        'Flujos Externos: Documentar todas las transferencias de datos a terceros',
        'Riesgos Específicos del Sector: Prestar especial atención a flujos de tecnologías avanzadas'
      ],
      ejemplo_flujo_interno: 'Cuando un nuevo cliente se registra en la web, sus datos viajan desde el servidor web al CRM, luego al ERP para la facturación, y quizás a un sistema de business intelligence para análisis.',
      importante: true
    },
    riesgos_sector_salmonero: {
      termino: 'Riesgos Específicos del Sector Salmonero',
      definicion: 'En la industria salmonera, se debe prestar especial atención a los flujos de datos provenientes de tecnologías avanzadas que pueden contener datos personales.',
      articulo: 'Aplicación sectorial',
      categoria: 'especial',
      icono: <Science />,
      ejemplos_datos_iot: [
        'Datos generados en tiempo real por sensores de IoT en los centros de cultivo (temperatura del agua, niveles de oxígeno, alimentación automática)',
        'Datos de geolocalización del personal en terreno'
      ],
      cuando_son_personales: 'Aunque estos datos pueden no parecer personales a primera vista, si pueden vincularse a un centro de cultivo específico o a un operario, quedan bajo el ámbito de la ley y sus flujos deben ser mapeados.',
      importante: true,
      nota_chile: 'Relevante para industria salmonera chilena'
    },
    gestion_retencion_eliminacion: {
      termino: 'Gestión de Retención y Eliminación',
      definicion: 'Basándose en el principio de proporcionalidad (limitación del plazo de conservación), el DPO, junto con el área legal y los dueños de los procesos, debe definir políticas de retención para cada categoría de datos.',
      articulo: 'Art. 7',
      categoria: 'cumplimiento',
      icono: <Timer />,
      componentes: [
        'Definición de Políticas: La política debe establecer por cuánto tiempo se conservará un dato y cuál es la justificación',
        'Procedimiento de Eliminación: Se debe definir un procedimiento para la eliminación segura o la anonimización de los datos'
      ],
      ejemplo_politica: 'Las facturas de clientes se conservan por 6 años para cumplir con obligaciones tributarias',
      requisitos_eliminacion: 'Este procedimiento debe ser ejecutado periódicamente por el personal de TI, y su ejecución debe ser verificada y registrada.',
      importante: true
    },
    especificaciones_tecnicas_sistema: {
      termino: 'Especificaciones Técnicas del Sistema (Plataforma de Gobernanza de Datos)',
      definicion: 'El sistema de cumplimiento debe actuar como una plataforma centralizada de gobernanza de datos.',
      articulo: 'Herramienta técnica',
      categoria: 'herramientas',
      icono: <Settings />,
      componentes_principales: [
        'Módulo de Registro de Actividades de Tratamiento (RAT)',
        'Funcionalidad de Mapeo y Visualización de Flujos',
        'Motor de Políticas de Retención'
      ],
      importante: true
    },
    modulo_rat_sistema: {
      termino: 'Módulo de Registro de Actividades de Tratamiento (RAT) - Sistema',
      definicion: 'Componente técnico del sistema que permite documentar y gestionar todas las actividades de tratamiento.',
      articulo: 'Art. 31',
      categoria: 'herramientas',
      icono: <Storage />,
      interfaz_usuario: 'El sistema debe ofrecer una interfaz web intuitiva que permita al personal no técnico (dueños de procesos) documentar fácilmente las actividades de tratamiento, guiándolos a través de los campos requeridos (finalidad, categorías de datos, base legal, etc.).',
      tablas_bd_principales: [
        'processing_activities: Almacena la descripción de cada actividad',
        'data_assets: Cataloga los sistemas y bases de datos donde residen los datos',
        'data_categories: Define las diferentes categorías de datos personales',
        'data_flows: Mapea las transferencias de datos entre data_assets y con terceros'
      ],
      requisito_consultas: 'Estas tablas deben estar interrelacionadas para permitir consultas complejas (ej. "¿Qué actividades tratan datos de salud y en qué sistemas se almacenan?").',
      importante: true
    },
    mapeo_visualizacion_flujos: {
      termino: 'Funcionalidad de Mapeo y Visualización de Flujos',
      definicion: 'Herramientas técnicas para generar diagramas de flujo de datos automáticamente a partir de la información registrada en el inventario.',
      articulo: 'Herramienta técnica',
      categoria: 'herramientas',
      icono: <Visibility />,
      herramientas_visualizacion: 'El sistema debería integrar herramientas de visualización que generen diagramas de flujo de datos automáticamente a partir de la información registrada en el inventario.',
      beneficio: 'Esto permite al DPO y a los auditores comprender rápidamente cómo se mueven los datos a través de la organización y hacia el exterior, identificando posibles riesgos o cuellos de botella.',
      integracion_automatizada: 'Para mantener el inventario actualizado, el sistema podría integrarse con herramientas de descubrimiento de datos (data discovery) que escaneen periódicamente las redes y bases de datos de la organización para identificar nuevos almacenamientos de datos personales que necesiten ser inventariados.',
      importante: true
    },
    motor_politicas_retencion: {
      termino: 'Motor de Políticas de Retención',
      definicion: 'Sistema automatizado para definir y ejecutar políticas de conservación y eliminación de datos.',
      articulo: 'Herramienta técnica',
      categoria: 'herramientas',
      icono: <Build />,
      definicion_reglas: 'El sistema debe permitir al DPO o al administrador definir políticas de retención de forma declarativa',
      ejemplo_regla: 'Para todos los datos en la categoría "Currículums No Seleccionados", aplicar un período de retención de 180 días desde la fecha de creación',
      automatizacion_ejecucion: [
        'Identificar todos los registros de datos que han excedido su período de retención definido',
        'Ejecutar la acción definida: Eliminación Segura o Anonimización',
        'Registro de Auditoría: Cada acción debe ser registrada detalladamente'
      ],
      motor_automatizacion: 'El sistema debe incluir un motor de automatización (ej. un cron job o un worker de Celery) que se ejecute periódicamente',
      importante: true
    },
    eliminacion_segura_sistema: {
      termino: 'Eliminación Segura - Sistema',
      definicion: 'Invocar una API en el sistema de origen para realizar un borrado físico de los datos.',
      articulo: 'Herramienta técnica',
      categoria: 'seguridad',
      icono: <Delete />,
      proceso: 'Proceso automatizado que invoca APIs para eliminar físicamente los datos de los sistemas origen.'
    },
    anonimizacion_sistema: {
      termino: 'Anonimización - Sistema',
      definicion: 'Aplicar un script de anonimización que reemplace los campos de identificación personal con valores no identificables.',
      articulo: 'Herramienta técnica',
      categoria: 'seguridad',
      icono: <VisibilityOff />,
      proceso: 'Scripts automatizados que transforman datos personales en datos anónimos no reversibles.'
    },
    registro_auditoria_sistema: {
      termino: 'Registro de Auditoría - Sistema',
      definicion: 'Cada acción de eliminación o anonimización debe ser registrada de forma detallada en los logs inmutables del sistema de cumplimiento.',
      articulo: 'Art. 9',
      categoria: 'seguridad',
      icono: <Description />,
      debe_registrar: [
        'Qué dato se eliminó',
        'Cuándo se eliminó',
        'En base a qué política se eliminó'
      ],
      caracteristica_logs: 'Los logs deben ser inmutables para garantizar la integridad de la auditoría.',
      importante: true
    },
    plantilla_rat_ejemplo: {
      termino: 'Plantilla de Registro de Actividad de Tratamiento (RAT) - Ejemplo Práctico',
      definicion: 'Ejemplo completo de documentación de una actividad de tratamiento para la industria salmonera.',
      articulo: 'Art. 31',
      categoria: 'cumplimiento',
      icono: <Assignment />,
      ejemplo_completo: {
        'ID de Actividad': 'PROD-001',
        'Nombre de la Actividad': 'Monitoreo de salud y alimentación de biomasa mediante IA',
        'Responsable del Proceso': 'Gerente de Producción',
        'Finalidad(es)': 'Optimizar la alimentación, detectar tempranamente enfermedades, asegurar el bienestar animal, cumplir con normativas sanitarias.',
        'Base de Licitud': 'Interés legítimo (eficiencia productiva y bienestar animal), Cumplimiento de obligación legal (normativa sanitaria).',
        'Categorías de Titulares': 'No aplica directamente a personas naturales.',
        'Categorías de Datos': 'Datos de sensores (O2, temp.), imágenes de video de los peces, datos de alimentación, registros de mortalidad. Nota: Si los datos pueden vincularse a un operario específico, se convierte en dato personal.',
        'Sistemas Implicados': 'Sensores IoT, Software de Acuicultura (ej. Mercatus AS), Plataforma de IA, ERP (SAP).',
        'Destinatarios (Internos/Externos)': 'Equipo de Producción, Veterinarios, SERNAPESCA (reportes agregados).',
        'Transferencias Internacionales': 'Sí, a proveedor de plataforma de IA en EE.UU. (Ver Módulo 6).',
        'Plazo de Conservación': 'Datos brutos: 2 años. Informes agregados: 10 años.',
        'Medidas de Seguridad': 'Cifrado de datos en tránsito y en reposo, control de acceso basado en roles (RBAC) a la plataforma de IA.'
      },
      importante: true,
      nota_chile: 'Ejemplo específico para la industria salmonera chilena que muestra cómo los datos aparentemente no personales pueden convertirse en datos personales si se vinculan a un operario específico.'
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
    },
    
    // TÉRMINOS AGREGADOS DEL GLOSARIO EXTENDIDO LEY 21.719
    titular_datos: {
      termino: 'Titular de los Datos',
      definicion: 'Persona natural a quien se refieren los datos personales que son objeto de tratamiento. Es el protagonista y beneficiario final de la ley, empoderado con un catálogo de derechos robustos.',
      articulo: 'Art. 2, lit. t',
      categoria: 'sujetos',
      icono: <Person />,
      importante: true,
      nota_chile: 'La Ley 21.719 empodera al titular con derechos administrativos expeditos ante la APDP, sin necesidad de recurrir a tribunales.'
    },
    
    responsable_tratamiento: {
      termino: 'Responsable del Tratamiento (Data Controller)',
      definicion: 'Persona natural o jurídica, pública o privada, que, de forma individual o junto con otros, toma las decisiones sobre los fines y los medios del tratamiento de los datos personales.',
      articulo: 'Art. 2, Ley 21.719',
      categoria: 'actores',
      icono: <Business />,
      importante: true,
      ampliacion: 'El responsable es la figura central en términos de obligaciones y rendición de cuentas. Es quien debe garantizar el cumplimiento de todos los principios de la ley, implementar las medidas de seguridad, gestionar las solicitudes de los titulares y responder ante la APDP por cualquier infracción.',
      obligaciones: [
        'Garantizar cumplimiento de principios legales',
        'Implementar medidas de seguridad adecuadas',
        'Gestionar solicitudes de titulares (20 días hábiles)',
        'Mantener Registro de Actividades de Tratamiento',
        'Notificar brechas de seguridad a APDP',
        'Realizar evaluaciones de impacto cuando corresponda',
        'Responder ante la APDP por infracciones'
      ],
      ejemplos: [
        'Empresas que recopilan datos de clientes',
        'Instituciones públicas que procesan datos ciudadanos',
        'Organizaciones sin fines de lucro con donantes',
        'Profesionales independientes con clientes',
        'Plataformas digitales con usuarios chilenos'
      ],
      nota_chile: 'Su responsabilidad es indelegable, incluso si externaliza el procesamiento de los datos a un tercero (encargado del tratamiento).'
    },
    
    encargado_tratamiento: {
      termino: 'Encargado del Tratamiento (Data Processor)',
      definicion: 'Persona natural o jurídica que trata datos personales por cuenta y en nombre del responsable del tratamiento, siguiendo sus instrucciones. La ley formaliza la relación entre el responsable y el encargado, exigiendo la existencia de un contrato o acto jurídico vinculante que regule sus obligaciones.',
      articulo: 'Art. 2, Ley 21.719',
      categoria: 'actores',
      icono: <Engineering />,
      ampliacion: 'Este contrato debe estipular, entre otros aspectos, que el encargado solo actuará según las instrucciones del responsable, implementará medidas de seguridad adecuadas y colaborará en el cumplimiento de las obligaciones legales. Esto convierte la gestión de proveedores y la debida diligencia contractual en un componente crítico de cualquier programa de cumplimiento.',
      obligaciones_contractuales: [
        'Actuar solo según instrucciones del responsable',
        'Implementar medidas de seguridad apropiadas',
        'No subcontratar sin autorización escrita',
        'Asistir al responsable en respuesta a derechos',
        'Notificar brechas de seguridad sin demora',
        'Devolver o eliminar datos al término del contrato',
        'Facilitar auditorías e inspecciones'
      ],
      ejemplos: [
        'Proveedores de servicios cloud (AWS, Google Cloud)',
        'Empresas de marketing digital y CRM',
        'Procesadores de nómina y RRHH externos',
        'Consultoras de análisis de datos',
        'Servicios de atención al cliente tercerizados',
        'Empresas de destrucción segura de documentos'
      ],
      nota_chile: 'La formalización contractual es obligatoria y convierte la gestión de proveedores en un elemento crítico del cumplimiento normativo.'
    },
    
    delegado_proteccion_datos: {
      termino: 'Delegado de Protección de Datos (DPO)',
      definicion: 'Profesional con conocimientos especializados en protección de datos que supervisa el cumplimiento interno, asesora a la organización y actúa como punto de contacto con la APDP.',
      articulo: 'Art. 46',
      categoria: 'compliance',
      icono: <VerifiedUser />,
      importante: true,
      nota_chile: 'Obligatorio para organizaciones con Modelo de Prevención de Infracciones. Altamente recomendable para tratamientos de alto riesgo.'
    },
    
    principio_licitud: {
      termino: 'Principio de Licitud, Lealtad y Transparencia',
      definicion: 'Este principio exige que todo tratamiento de datos sea lícito, es decir, que se fundamente en una de las bases legales establecidas en la ley. Debe ser leal, lo que implica que no puede realizarse de manera engañosa o fraudulenta. Y debe ser transparente, lo que obliga al responsable a informar al titular de manera clara, sencilla y accesible sobre las características del tratamiento.',
      articulo: 'Art. 2, Ley 21.719',
      categoria: 'principios',
      icono: <Gavel />,
      importante: true,
      ampliacion: 'Es el principio fundamental que rige todo el sistema. La licitud requiere identificar y documentar la base legal aplicable. La lealtad prohíbe prácticas engañosas como recopilar datos bajo un pretexto falso. La transparencia obliga a comunicar de forma comprensible todos los aspectos relevantes del tratamiento.',
      componentes: [
        'Licitud: Base legal válida identificada y documentada',
        'Lealtad: Ausencia de engaño o fraude en la recolección',
        'Transparencia: Información clara y accesible al titular'
      ],
      nota_chile: 'Fundamento de todo tratamiento legítimo de datos en Chile. Su violación constituye infracción grave.'
    },
    
    principio_finalidad: {
      termino: 'Principio de Finalidad',
      definicion: 'Los datos personales deben ser recolectados para fines específicos, explícitos y legítimos, informados al titular al momento de la recolección. No pueden ser tratados posteriormente para fines incompatibles con aquellos para los cuales fueron recogidos inicialmente.',
      articulo: 'Art. 2, Ley 21.719',
      categoria: 'principios',
      icono: <MyLocation />,
      ampliacion: 'Este principio obliga a las organizaciones a definir con precisión el "para qué" de cada recolección de datos antes de iniciarla. Cualquier uso posterior debe ser compatible con la finalidad original, o requerirá una nueva base de licitud y comunicación al titular.',
      ejemplos: [
        'Datos de contacto para envío de productos adquiridos',
        'Información médica exclusivamente para tratamiento de salud',
        'Datos laborales para gestión de nómina y relación contractual',
        'Email para newsletter (no para ofertas comerciales sin consentimiento)',
        'RUT para facturación (no para marketing sin autorización)'
      ],
      incompatibles: [
        'Usar datos de compra para publicidad sin consentimiento',
        'Compartir información laboral con terceros sin base legal',
        'Analizar comportamiento para fines no informados'
      ]
    },
    
    principio_minimizacion: {
      termino: 'Principio de Proporcionalidad y Minimización de Datos',
      definicion: 'El tratamiento de datos debe ser adecuado, pertinente y limitado a lo estrictamente necesario para cumplir con la finalidad informada. Esto implica que no se deben recolectar más datos de los necesarios (minimización). Asimismo, los datos deben conservarse solo durante el tiempo indispensable para cumplir dichos fines, tras lo cual deben ser suprimidos o anonimizados.',
      articulo: 'Art. 6, Ley 21.719',
      categoria: 'principios',
      icono: <Remove />,
      importante: true,
      ampliacion: 'Este principio obliga a las organizaciones a cuestionar cada campo de sus formularios y cada dato que almacenan. Debe existir una justificación clara y documentada de por qué cada dato es necesario para la finalidad declarada.',
      aplicacion_practica: [
        'Revisar formularios para eliminar campos innecesarios',
        'Establecer períodos de retención para cada tipo de dato',
        'Implementar procesos automatizados de eliminación',
        'Documentar la justificación de cada dato recolectado',
        'Anonimizar datos históricos para análisis estadísticos'
      ],
      nota_chile: 'Obliga a justificar cada dato solicitado en formularios y procesos. Su violación es infracción grave ante la APDP.'
    },
    
    principio_calidad: {
      termino: 'Principio de Calidad',
      definicion: 'Los datos deben ser exactos, completos y actualizados. El responsable debe adoptar medidas para corregir o suprimir datos inexactos.',
      articulo: 'Art. 15',
      categoria: 'principios',
      icono: <CheckCircle />
    },
    
    principio_seguridad: {
      termino: 'Principio de Seguridad',
      definicion: 'Implementar medidas técnicas y organizativas apropiadas para garantizar un nivel de seguridad adecuado al riesgo del tratamiento.',
      articulo: 'Art. 16',
      categoria: 'principios',
      icono: <Security />,
      importante: true,
      ejemplos: [
        'Cifrado de datos',
        'Control de accesos',
        'Respaldos periódicos',
        'Planes de contingencia'
      ]
    },
    
    principio_confidencialidad: {
      termino: 'Principio de Confidencialidad',
      definicion: 'Obligación de guardar secreto sobre los datos personales. Esta obligación subsiste incluso después de finalizada la relación.',
      articulo: 'Art. 17',
      categoria: 'principios',
      icono: <Lock />
    },
    
    principio_responsabilidad_proactiva: {
      termino: 'Principio de Responsabilidad Proactiva (Accountability)',
      definicion: 'Establece que el responsable del tratamiento no solo debe cumplir con todos los principios y obligaciones de la ley, sino que también debe ser capaz de demostrar dicho cumplimiento ante la APDP y los titulares. Representa un cambio fundamental en la filosofía de la regulación: ya no es suficiente "cumplir", sino que es necesario "demostrar que se cumple".',
      articulo: 'Art. 6, Ley 21.719',
      categoria: 'principios',
      icono: <Assignment />,
      importante: true,
      ampliacion: 'Este principio obliga a las organizaciones a adoptar un enfoque proactivo y documentado de la privacidad. Aunque el texto legal lo define de forma "minimalista", la estructura general de la normativa sugiere que la interpretación se inclinará hacia el concepto amplio de "accountability" del GDPR, implicando un sistema de gobernanza completo.',
      herramientas_demostracion: [
        'Registro de Actividades de Tratamiento (RAT) actualizado',
        'Políticas internas de protección de datos documentadas',
        'Procedimientos de respuesta a derechos de titulares',
        'Evaluaciones de Impacto en Protección de Datos (EIPD)',
        'Contratos con encargados de tratamiento',
        'Registros de capacitación del personal',
        'Auditorías periódicas de cumplimiento',
        'Planes de respuesta a brechas de seguridad'
      ],
      nota_chile: 'Las organizaciones prudentes deberían prepararse para el estándar más exigente de accountability, ya que es el que probablemente prevalecerá en la práctica fiscalizadora de la APDP.'
    },
    
    derecho_portabilidad: {
      termino: 'Derecho de Portabilidad',
      definicion: 'Derecho a recibir los datos personales en formato digital, estructurado y de uso común, y solicitar su transferencia a otro responsable.',
      articulo: 'Art. 19',
      categoria: 'derechos',
      icono: <CloudDownload />,
      nuevo: true,
      nota_chile: 'Nuevo derecho que fomenta la competencia entre proveedores de servicios.'
    },
    
    derecho_bloqueo: {
      termino: 'Derecho de Bloqueo',
      definicion: 'Permite solicitar la suspensión temporal del tratamiento mientras se resuelve una solicitud de rectificación, supresión u oposición.',
      articulo: 'Art. 19',
      categoria: 'derechos',
      icono: <Block />,
      nuevo: true,
      nota_chile: 'Medida cautelar que protege al titular durante el proceso de reclamación.'
    },
    
    derecho_oposicion_decisiones: {
      termino: 'Oposición a Decisiones Automatizadas',
      definicion: 'Derecho a no ser objeto de decisiones basadas únicamente en tratamiento automatizado que produzcan efectos jurídicos significativos.',
      articulo: 'Art. 19',
      categoria: 'derechos',
      icono: <SmartToy />,
      nuevo: true,
      importante: true,
      ejemplos: [
        'Aprobación automática de créditos',
        'Selección algorítmica de personal',
        'Perfilado para seguros'
      ],
      nota_chile: 'Protección contra la "tiranía del algoritmo". Exige posibilidad de revisión humana.'
    },
    
    eipd: {
      termino: 'Evaluación de Impacto en la Protección de Datos (EIPD/DPIA)',
      definicion: 'Análisis preventivo y sistemático de los riesgos que un nuevo proyecto, sistema o tecnología podría generar para la protección de los datos personales. Su realización es obligatoria antes de iniciar tratamientos que, por su naturaleza, alcance o fines, puedan entrañar un alto riesgo para los derechos y libertades de los titulares.',
      articulo: 'Art. 11, Ley 21.719',
      categoria: 'herramientas',
      icono: <Assessment />,
      importante: true,
      ampliacion: 'La EIPD obliga a las organizaciones a incorporar la privacidad desde las etapas iniciales de cualquier proyecto ("privacidad desde el diseño"). No se trata de un simple chequeo, sino de un proceso profundo que debe identificar los riesgos, evaluar su probabilidad e impacto, y proponer medidas concretas para mitigarlos.',
      obligatoria_cuando: [
        'Tratamiento masivo de datos sensibles',
        'Vigilancia sistemática de zonas de acceso público',
        'Uso de nuevas tecnologías (IA, biometría, IoT)',
        'Toma de decisiones automatizadas con efectos legales',
        'Tratamiento de datos de menores a gran escala',
        'Combinación o cruce masivo de bases de datos'
      ],
      debe_contener: [
        'Descripción sistemática del tratamiento proyectado',
        'Evaluación de la necesidad y proporcionalidad',
        'Identificación y análisis de riesgos para los titulares',
        'Medidas previstas para hacer frente a los riesgos',
        'Consulta al DPO si existe',
        'Cronograma de revisión y actualización'
      ],
      nota_chile: 'Es fundamental para demostrar diligencia y responsabilidad proactiva. Su omisión en los casos obligatorios constituye una infracción grave ante la APDP.'
    },
    
    registro_actividades_tratamiento: {
      termino: 'Registro de Actividades de Tratamiento (RAT)',
      definicion: 'Inventario interno y detallado de todas las actividades de tratamiento de datos personales que realiza una organización bajo su responsabilidad. Este registro, que debe mantenerse actualizado y a disposición de la APDP, debe contener información como los fines del tratamiento, las categorías de datos y de titulares, los destinatarios, las transferencias internacionales, los plazos de conservación y una descripción de las medidas de seguridad implementadas.',
      articulo: 'Art. 17, Ley 21.719',
      categoria: 'herramientas',
      icono: <TableChart />,
      importante: true,
      ampliacion: 'El RAT es la columna vertebral de la gobernanza de datos y la principal herramienta para demostrar el cumplimiento. Funciona como un "mapa" de todos los flujos de datos personales de la organización, permitiendo una visión clara y centralizada de sus prácticas. Para la APDP, será el primer documento a solicitar en una fiscalización.',
      elementos_obligatorios: [
        'Nombre y datos de contacto del responsable',
        'Finalidades del tratamiento',
        'Categorías de interesados y de datos personales',
        'Categorías de destinatarios (internos y externos)',
        'Transferencias internacionales de datos',
        'Plazos previstos para la supresión',
        'Descripción general de medidas de seguridad'
      ],
      nota_chile: 'Su elaboración exige un esfuerzo significativo de levantamiento y documentación de procesos en toda la empresa. Es el principal documento que solicitará la APDP en fiscalizaciones.'
    },
    brecha_seguridad: {
      termino: 'Notificación de Brechas de Seguridad',
      definicion: 'Obligación que tiene el responsable del tratamiento de comunicar a la APDP, sin dilación indebida, cualquier vulneración de la seguridad que afecte a los datos personales. Adicionalmente, si la brecha puede generar un alto riesgo para los derechos de los titulares, también deberá ser comunicada a las personas afectadas en un lenguaje claro y sencillo.',
      articulo: 'Art. 11, Ley 21.719',
      categoria: 'seguridad',
      icono: <Warning />,
      importante: true,
      ampliacion: 'Esta obligación impone una cultura de transparencia forzosa frente a los incidentes de seguridad, terminando con la práctica de ocultar o minimizar las brechas. La notificación debe ser oportuna y detallada, describiendo la naturaleza del incidente, los datos comprometidos y las medidas adoptadas.',
      plazos: [
        'A la APDP: 72 horas desde que se tuvo conocimiento',
        'A los titulares: Sin dilación indebida si hay alto riesgo',
        'Documentación interna: Inmediata para evidenciar respuesta'
      ],
      debe_incluir: [
        'Naturaleza de la violación de seguridad',
        'Categorías y número aproximado de interesados afectados',
        'Consecuencias probables de la violación',
        'Medidas adoptadas o propuestas para remediar la violación',
        'Medidas para mitigar los posibles efectos negativos'
      ],
      nota_chile: 'El incumplimiento de esta obligación es infracción grave, incentivando a las empresas a invertir en ciberseguridad y tener planes de respuesta bien definidos.'
    },
    transferencia_internacional: {
      termino: 'Transferencia Internacional de Datos',
      definicion: 'Envío de datos personales fuera del territorio chileno. La ley establece que estas transferencias solo son lícitas si se realizan a países u organizaciones que ofrezcan un nivel de protección de datos "adecuado", según lo determine la APDP. En ausencia de una decisión de adecuación, la transferencia puede realizarse si se ofrecen garantías suficientes.',
      articulo: 'Art. 9, Ley 21.719',
      categoria: 'operaciones',
      icono: <Public />,
      importante: true,
      ampliacion: 'Esta regulación es crucial para las empresas que operan a nivel global o utilizan servicios de proveedores internacionales. Garantiza que la protección de los datos "viaje" con ellos y no se diluya al cruzar las fronteras.',
      mecanismos_permitidos: [
        'Decisión de adecuación emitida por la APDP',
        'Cláusulas contractuales tipo aprobadas',
        'Códigos de conducta con garantías vinculantes',
        'Certificaciones con garantías vinculantes',
        'Normas corporativas vinculantes (BCR)'
      ],
      casos_especiales: [
        'Consentimiento explícito del titular',
        'Cumplimiento de contrato con el titular',
        'Cumplimiento de obligación legal',
        'Protección de intereses vitales',
        'Interés público o ejercicio de autoridad pública'
      ],
      nota_chile: 'Implica mapear flujos de datos internacionales y asegurar que cada transferencia esté amparada por un mecanismo legal válido, a menudo requiriendo renegociación de contratos con proveedores extranjeros.'
    },
    registro_actividades_tratamiento_old: {
      termino: 'Registro de Actividades de Tratamiento (RAT) - Version Original',
      definicion: 'Inventario detallado de todas las actividades de tratamiento de datos que realiza una organización. Debe mantenerse actualizado y disponible para la APDP.',
      articulo: 'Art. 21',
      categoria: 'herramientas',
      icono: <TableChart />,
      importante: true,
      nota_chile: 'Columna vertebral de la gobernanza de datos. Primer documento que solicitará la APDP en fiscalizaciones.'
    },
    
    brecha_seguridad: {
      termino: 'Brecha de Seguridad',
      definicion: 'Vulneración de seguridad que afecta datos personales. Debe notificarse a la APDP sin dilación indebida y, si hay alto riesgo, también a los afectados.',
      articulo: 'Art. 23',
      categoria: 'seguridad',
      icono: <Warning />,
      importante: true,
      ejemplos: [
        'Hackeo de base de datos',
        'Pérdida de dispositivos con información',
        'Acceso no autorizado a sistemas',
        'Envío erróneo de datos a terceros'
      ],
      nota_chile: 'Transparencia obligatoria. El ocultamiento es infracción grave.'
    },
    
    transferencia_internacional: {
      termino: 'Transferencia Internacional',
      definicion: 'Envío de datos personales fuera de Chile. Solo permitida a países con nivel adecuado de protección o con garantías suficientes.',
      articulo: 'Art. 24',
      categoria: 'compliance',
      icono: <Public />,
      importante: true,
      ejemplos: [
        'Uso de servicios cloud internacionales',
        'Compartir datos con filiales extranjeras',
        'Procesamiento offshore'
      ],
      nota_chile: 'Crítico para empresas globales. Requiere mecanismos legales válidos para cada transferencia.'
    },
    
    modelo_prevencion_infracciones: {
      termino: 'Modelo de Prevención de Infracciones (MPI)',
      definicion: 'Sistema voluntario de gestión de cumplimiento que incluye DPO, identificación de riesgos, protocolos y canales de denuncia. Atenúa sanciones si está certificado.',
      articulo: 'Art. 45-46',
      categoria: 'compliance',
      icono: <Shield />,
      importante: true,
      nota_chile: 'Herramienta estratégica de gestión de riesgos. Puede reducir significativamente las multas.'
    },
    
    infraccion_leve: {
      termino: 'Infracción Leve',
      definicion: 'Incumplimientos formales o de información, como no comunicar toda la información requerida a los titulares.',
      articulo: 'Art. 34',
      categoria: 'sanciones',
      icono: <Info />,
      multa: 'Hasta 500 UTM'
    },
    
    infraccion_grave: {
      termino: 'Infracción Grave',
      definicion: 'Violaciones a principios o derechos, como tratar datos sin base legal, no adoptar medidas de seguridad u omitir notificación de brechas.',
      articulo: 'Art. 35',
      categoria: 'sanciones',
      icono: <Warning />,
      importante: true,
      multa: 'Hasta 5.000 UTM o 2% de ingresos anuales'
    },
    
    infraccion_gravisima: {
      termino: 'Infracción Gravísima',
      definicion: 'Conductas dolosas o con desprecio manifiesto por la normativa, como tratamiento fraudulento o desobediencia a la APDP.',
      articulo: 'Art. 36',
      categoria: 'sanciones',
      icono: <Error />,
      importante: true,
      multa: 'Hasta 20.000 UTM o 4% de ingresos anuales'
    },
    
    registro_nacional_cumplimiento: {
      termino: 'Registro Nacional de Cumplimiento',
      definicion: 'Registro público administrado por la APDP donde se inscriben las sanciones firmes. Añade sanción reputacional a la económica.',
      articulo: 'Art. 40',
      categoria: 'sanciones',
      icono: <Visibility />,
      nota_chile: 'La publicidad de infracciones puede generar más daño reputacional que la propia multa.'
    },
    
    fuentes_accesibles_publico: {
      termino: 'Fuentes Accesibles al Público',
      definicion: 'Registros o recopilaciones de datos personales de acceso no restringido o reservado a solicitantes, como guías telefónicas o registros públicos.',
      articulo: 'Art. 2, lit. i',
      categoria: 'conceptos',
      icono: <Public />,
      ejemplos: [
        'Diario Oficial',
        'Registros públicos del Estado',
        'Guías telefónicas publicadas',
        'Listas profesionales públicas'
      ]
    },
    
    datos_anonimizados: {
      termino: 'Datos Anonimizados',
      definicion: 'Información que no puede relacionarse con una persona identificada o identificable. Al anonimizarse, dejan de ser datos personales.',
      articulo: 'Art. 2',
      categoria: 'conceptos',
      icono: <VisibilityOff />,
      nota_chile: 'La anonimización debe ser irreversible para que los datos queden fuera del ámbito de la ley.'
    },
    
    seudonimizacion: {
      termino: 'Seudonimización',
      definicion: 'Tratamiento que impide atribuir datos a un titular sin información adicional mantenida por separado con medidas técnicas.',
      articulo: 'Art. 2',
      categoria: 'seguridad',
      icono: <Fingerprint />,
      nota_chile: 'A diferencia de la anonimización, la seudonimización es reversible y los datos siguen siendo personales.'
    },
    
    interes_legitimo: {
      termino: 'Interés Legítimo',
      definicion: 'Base legal que permite el tratamiento cuando es necesario para intereses legítimos del responsable, siempre que no prevalezcan los derechos del titular.',
      articulo: 'Art. 11',
      categoria: 'conceptos',
      icono: <Balance />,
      importante: true,
      nota_chile: 'Requiere test de ponderación documentado entre intereses empresariales y derechos individuales.'
    },
    
    privacidad_desde_diseno: {
      termino: 'Privacidad desde el Diseño',
      definicion: 'Principio que exige considerar la protección de datos desde las fases iniciales de diseño de productos, servicios o procesos.',
      articulo: 'Implícito en Art. 22',
      categoria: 'principios',
      icono: <Architecture />,
      importante: true,
      nota_chile: 'Se materializa principalmente a través de las EIPD para proyectos nuevos.'
    },
    
    vigencia_ley: {
      termino: 'Vigencia de la Ley 21.719',
      definicion: 'La ley fue publicada el 13 de diciembre de 2024 y entrará en plena vigencia el 1 de diciembre de 2026, con período de transición.',
      articulo: 'Artículos transitorios',
      categoria: 'legal',
      icono: <Timer />,
      importante: true,
      nota_chile: 'Las organizaciones tienen hasta diciembre 2026 para adaptarse completamente.'
    },
    
    clausulas_contractuales_tipo: {
      termino: 'Cláusulas Contractuales Tipo',
      definicion: 'Modelos de contratos aprobados por la APDP que ofrecen garantías suficientes para transferencias internacionales de datos.',
      articulo: 'Art. 24',
      categoria: 'compliance',
      icono: <Description />,
      nota_chile: 'Mecanismo clave para transferencias a países sin decisión de adecuación.'
    },
    
    decision_adecuacion: {
      termino: 'Decisión de Adecuación',
      definicion: 'Determinación de la APDP de que un país u organización internacional ofrece nivel adecuado de protección de datos.',
      articulo: 'Art. 24',
      categoria: 'compliance',
      icono: <VerifiedUser />,
      nota_chile: 'Facilita enormemente las transferencias internacionales al país reconocido.'
    },
    
    habeas_data: {
      termino: 'Habeas Data',
      definicion: 'Garantía constitucional que protege el derecho de acceso y control sobre los datos personales propios en bases de datos.',
      articulo: 'Art. 19 N°4 Constitución',
      categoria: 'derechos',
      icono: <Gavel />,
      importante: true,
      nota_chile: 'Derecho constitucional que la Ley 21.719 operacionaliza y fortalece.'
    }
  };

  // Categorías para filtrado
  const categorias = {
    all: { nombre: 'Todos', icon: <Book /> },
    fundamental: { nombre: 'Fundamentales', icon: <Star />, color: '#f44336' },
    actores: { nombre: 'Actores', icon: <Group />, color: '#64748b' },
    operaciones: { nombre: 'Operaciones', icon: <Settings />, color: '#6c757d' },
    derechos: { nombre: 'Derechos ARCO+', icon: <Security />, color: '#ff9800' },
    principios: { nombre: 'Principios', icon: <Policy />, color: '#9c27b0' },
    cumplimiento: { nombre: 'Cumplimiento', icon: <Assignment />, color: '#495057' },
    seguridad: { nombre: 'Seguridad', icon: <Lock />, color: '#795548' },
    bases_licitud: { nombre: 'Bases Licitud', icon: <Gavel />, color: '#607d8b' },
    herramientas: { nombre: 'Herramientas', icon: <Build />, color: '#64748b' },
    especial: { nombre: 'Protección Especial', icon: <ChildCare />, color: '#ff5722' },
    institucional: { nombre: 'Institucional', icon: <AccountBalance />, color: '#3f51b5' },
    gobernanza: { nombre: 'Gobernanza', icon: <Architecture />, color: '#8bc34a' }
  };

  // Filtrar términos basado en búsqueda y categoría (incluyendo nuevos campos del manual)
  const terminosFiltrados = Object.entries(terminos).filter(([key, termino]) => {
    // Verificar que el término tenga la estructura mínima requerida
    if (!termino || typeof termino !== 'object' || !termino.termino || !termino.definicion) {
      // console.warn('Término inválido encontrado:', key, termino);
      return false;
    }
    const matchSearch = termino.termino.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       termino.definicion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (termino.elementos_rat && termino.elementos_rat.some(elem => 
                         elem.toLowerCase().includes(searchTerm.toLowerCase())
                       )) ||
                       (termino.pasos_metodologia && termino.pasos_metodologia.some(paso => 
                         paso.toLowerCase().includes(searchTerm.toLowerCase())
                       )) ||
                       (termino.ejemplo_preguntas_rrhh && termino.ejemplo_preguntas_rrhh.some(pregunta => 
                         pregunta.toLowerCase().includes(searchTerm.toLowerCase())
                       )) ||
                       (termino.componentes && termino.componentes.some(comp => 
                         comp.toLowerCase().includes(searchTerm.toLowerCase())
                       )) ||
                       (termino.tablas_bd_principales && termino.tablas_bd_principales.some(tabla => 
                         tabla.toLowerCase().includes(searchTerm.toLowerCase())
                       ));
    // Verificar que la categoría exista
    if (!termino.categoria || !categorias[termino.categoria]) {
      // console.warn('Categoría inválida o faltante para término:', key, termino.categoria);
      return false;
    }
    
    // Filtros especiales
    if (selectedCategory === 'criticos') {
      return matchSearch && termino.importante;
    }
    if (selectedCategory === 'novedades_chile') {
      return matchSearch && termino.nota_chile;
    }
    
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
    <PageLayout>
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

      {/* Filtros por Tipo de Término */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
          Filtros Especializados:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip
            label={`Términos Totales (${Object.keys(terminos).length})`}
            icon={<Book />}
            onClick={() => setSelectedCategory('all')}
            color={selectedCategory === 'all' ? 'primary' : 'default'}
            variant={selectedCategory === 'all' ? 'filled' : 'outlined'}
          />
          <Chip
            label={`Términos Críticos (${Object.values(terminos).filter(t => t.importante).length})`}
            icon={<Warning />}
            onClick={() => {
              const criticKeys = Object.entries(terminos)
                .filter(([key, termino]) => termino.importante)
                .map(([key]) => key);
              setSelectedCategory('criticos');
            }}
            color={selectedCategory === 'criticos' ? 'error' : 'default'}
            variant={selectedCategory === 'criticos' ? 'filled' : 'outlined'}
          />
          <Chip
            label={`Novedades Chile (${Object.values(terminos).filter(t => t.nota_chile).length})`}
            icon={<NewReleases />}
            onClick={() => setSelectedCategory('novedades_chile')}
            color={selectedCategory === 'novedades_chile' ? 'secondary' : 'default'}
            variant={selectedCategory === 'novedades_chile' ? 'filled' : 'outlined'}
          />
        </Box>
        
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

                  {/* Nuevos campos del manual */}
                  {termino.pasos_metodologia && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Pasos de la Metodología:
                      </Typography>
                      <List dense>
                        {termino.pasos_metodologia.map((paso, idx) => (
                          <ListItem key={idx}>
                            <ListItemText primary={paso} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {termino.equipo_debe_incluir && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        El Equipo Debe Incluir:
                      </Typography>
                      <List dense>
                        {termino.equipo_debe_incluir.map((miembro, idx) => (
                          <ListItem key={idx}>
                            <ListItemText primary={miembro} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {termino.ejemplo_preguntas_rrhh && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Ejemplo de Preguntas para RRHH:
                      </Typography>
                      <List dense>
                        {termino.ejemplo_preguntas_rrhh.map((pregunta, idx) => (
                          <ListItem key={idx}>
                            <ListItemText primary={pregunta} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {termino.elementos_rat && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Elementos del RAT:
                      </Typography>
                      <List dense>
                        {termino.elementos_rat.map((elemento, idx) => (
                          <ListItem key={idx}>
                            <ListItemText primary={elemento} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {termino.tipos_clasificacion && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Tipos de Clasificación:
                      </Typography>
                      <List dense>
                        {termino.tipos_clasificacion.map((tipo, idx) => (
                          <ListItem key={idx}>
                            <ListItemText primary={tipo} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {termino.tipos_flujos && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Tipos de Flujos:
                      </Typography>
                      <List dense>
                        {termino.tipos_flujos.map((flujo, idx) => (
                          <ListItem key={idx}>
                            <ListItemText primary={flujo} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {termino.ejemplo_flujo_interno && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Ejemplo de Flujo Interno:</strong> {termino.ejemplo_flujo_interno}
                      </Typography>
                    </Alert>
                  )}

                  {termino.ejemplos_datos_iot && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Ejemplos de Datos IoT:
                      </Typography>
                      <List dense>
                        {termino.ejemplos_datos_iot.map((ejemplo, idx) => (
                          <ListItem key={idx}>
                            <ListItemText primary={ejemplo} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {termino.cuando_son_personales && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Cuándo son Datos Personales:</strong> {termino.cuando_son_personales}
                      </Typography>
                    </Alert>
                  )}

                  {termino.componentes && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Componentes:
                      </Typography>
                      <List dense>
                        {termino.componentes.map((comp, idx) => (
                          <ListItem key={idx}>
                            <ListItemText primary={comp} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {termino.componentes_principales && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Componentes Principales:
                      </Typography>
                      <List dense>
                        {termino.componentes_principales.map((comp, idx) => (
                          <ListItem key={idx}>
                            <ListItemText primary={comp} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {termino.interfaz_usuario && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Interfaz de Usuario:</strong> {termino.interfaz_usuario}
                      </Typography>
                    </Alert>
                  )}

                  {termino.tablas_bd_principales && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Tablas Principales de Base de Datos:
                      </Typography>
                      <List dense>
                        {termino.tablas_bd_principales.map((tabla, idx) => (
                          <ListItem key={idx}>
                            <ListItemText primary={tabla} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {termino.requisito_consultas && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Requisito de Consultas:</strong> {termino.requisito_consultas}
                      </Typography>
                    </Alert>
                  )}

                  {termino.herramientas_visualizacion && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Herramientas de Visualización:</strong> {termino.herramientas_visualizacion}
                      </Typography>
                    </Alert>
                  )}

                  {termino.beneficio && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Beneficio:</strong> {termino.beneficio}
                      </Typography>
                    </Alert>
                  )}

                  {termino.integracion_automatizada && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Integración Automatizada:</strong> {termino.integracion_automatizada}
                      </Typography>
                    </Alert>
                  )}

                  {termino.ejemplo_politica && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Ejemplo de Política:</strong> {termino.ejemplo_politica}
                      </Typography>
                    </Alert>
                  )}

                  {termino.requisitos_eliminacion && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Requisitos de Eliminación:</strong> {termino.requisitos_eliminacion}
                      </Typography>
                    </Alert>
                  )}

                  {termino.definicion_reglas && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Definición de Reglas:</strong> {termino.definicion_reglas}
                      </Typography>
                    </Alert>
                  )}

                  {termino.ejemplo_regla && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Ejemplo de Regla:</strong> {termino.ejemplo_regla}
                      </Typography>
                    </Alert>
                  )}

                  {termino.automatizacion_ejecucion && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Automatización de la Ejecución:
                      </Typography>
                      <List dense>
                        {termino.automatizacion_ejecucion.map((item, idx) => (
                          <ListItem key={idx}>
                            <ListItemText primary={item} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {termino.motor_automatizacion && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Motor de Automatización:</strong> {termino.motor_automatizacion}
                      </Typography>
                    </Alert>
                  )}

                  {termino.proceso && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Proceso:</strong> {termino.proceso}
                      </Typography>
                    </Alert>
                  )}

                  {termino.debe_registrar && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Debe Registrar:
                      </Typography>
                      <List dense>
                        {termino.debe_registrar.map((item, idx) => (
                          <ListItem key={idx}>
                            <ListItemText primary={item} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {termino.caracteristica_logs && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Característica de Logs:</strong> {termino.caracteristica_logs}
                      </Typography>
                    </Alert>
                  )}

                  {termino.ejemplo_completo && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Ejemplo Completo (Industria Salmonera):
                      </Typography>
                      <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                        {Object.entries(termino.ejemplo_completo).map(([campo, valor], idx) => (
                          <Box key={idx} sx={{ mb: 1 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {campo}:
                            </Typography>
                            <Typography variant="body2" sx={{ ml: 2, mb: 1 }}>
                              {valor}
                            </Typography>
                          </Box>
                        ))}
                      </Paper>
                    </Box>
                  )}

                  {termino.plazo_respuesta && (
                    <Alert severity="info" icon={<Timer />}>
                      Plazo de respuesta: {termino.plazo_respuesta}
                    </Alert>
                  )}
                </Collapse>

                <Box sx={{ mt: 2 }}>
                  {categorias[termino.categoria] && (
                    <Chip 
                      label={categorias[termino.categoria].nombre}
                      icon={categorias[termino.categoria].icon}
                      size="small"
                      sx={{ 
                        bgcolor: categorias[termino.categoria].color,
                        color: 'white'
                      }}
                    />
                  )}
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
    </PageLayout>
  );
};

// GlosarioLPDP - Sistema LPDP v3.1.0 - All duplicates removed
export default GlosarioLPDP;