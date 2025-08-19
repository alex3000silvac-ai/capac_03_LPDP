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