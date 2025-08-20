import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
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
  ListItemButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
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
  LinearProgress,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Rating,
  ToggleButton,
  ToggleButtonGroup,
  Collapse,
  Fade,
  Zoom,
  CardMedia,
} from '@mui/material';
import {
  Science,
  Business,
  People,
  Storage,
  Security,
  CheckCircle,
  Error,
  Info,
  Help,
  Lightbulb,
  PlayArrow,
  Save,
  Assessment,
  Download,
  Upload,
  Edit,
  Delete,
  Visibility,
  DataObject,
  AccountTree,
  Map,
  BusinessCenter,
  GetApp,
  Timeline,
  Analytics,
  School,
  Engineering,
  Restaurant,
  LocalShipping,
  HealthAndSafety,
  AttachMoney,
  Campaign,
  Gavel,
  Warning,
  Timer,
  Public,
  Lock,
  VpnKey,
  Group,
  ChildCare,
  MonetizationOn,
  Description,
  Quiz,
  EmojiEvents,
  TrendingUp,
  VideoLibrary,
  PlayCircle,
  ExpandMore,
  NavigateNext,
  NavigateBefore,
  RestartAlt,
  CheckCircleOutline,
  RadioButtonUnchecked,
  ArrowForward,
  Psychology,
  AutoAwesome,
  WorkspacePremium,
  Insights,
} from '@mui/icons-material';

const PracticaSandboxCompleto = () => {
  // Estados principales
  const [escenarioActivo, setEscenarioActivo] = useState(null);
  const [stepActual, setStepActual] = useState(0);
  const [puntuacion, setPuntuacion] = useState(0);
  const [logros, setLogros] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [videoActual, setVideoActual] = useState(null);
  const [mostrarRetroalimentacion, setMostrarRetroalimentacion] = useState(false);
  const [modoTutorial, setModoTutorial] = useState(true);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
  const [actividadesRAT, setActividadesRAT] = useState([]);
  const [dialogVideo, setDialogVideo] = useState(false);
  const [dialogEvaluacion, setDialogEvaluacion] = useState(false);
  const [nivelDificultad, setNivelDificultad] = useState('principiante');

  // Timer para tracking de tiempo
  useEffect(() => {
    let interval;
    if (escenarioActivo && !mostrarRetroalimentacion) {
      interval = setInterval(() => {
        setTiempoTranscurrido(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [escenarioActivo, mostrarRetroalimentacion]);

  // Escenarios completos con TODOS los puntos del manual línea por línea
  const escenarios = [
    {
      id: 'conformacion_equipo',
      titulo: '🏢 Conformación del Equipo Multidisciplinario',
      nivel: 'Principiante',
      duracion: '15 minutos',
      puntos: 100,
      videoUrl: 'https://example.com/video1', // Placeholder para video real
      descripcion: 'Aprende a conformar el equipo de trabajo para el levantamiento del RAT según la Ley 21.719',
      objetivos: [
        'Identificar roles clave del equipo',
        'Entender responsabilidades del DPO',
        'Definir representantes por área'
      ],
      pasos: [
        {
          id: 'intro',
          titulo: 'Introducción al Equipo Multidisciplinario',
          contenido: `
            <h3>¿Por qué necesitas un equipo multidisciplinario?</h3>
            <p>El DPO debe liderar un equipo con representantes de todas las áreas clave que tratan datos personales:</p>
            <ul>
              <li><strong>RRHH:</strong> Datos de empleados y candidatos</li>
              <li><strong>Finanzas:</strong> Información crediticia y tributaria</li>
              <li><strong>Marketing:</strong> Bases de clientes y campañas</li>
              <li><strong>Ventas:</strong> CRM y procesos comerciales</li>
              <li><strong>Operaciones:</strong> Producción y logística</li>
              <li><strong>TI:</strong> Sistemas y seguridad</li>
              <li><strong>Legal:</strong> Contratos y cumplimiento</li>
            </ul>
          `,
          pregunta: {
            texto: '¿Quién debe liderar el equipo de levantamiento del inventario de datos?',
            opciones: [
              { id: 'a', texto: 'El Gerente General', correcto: false },
              { id: 'b', texto: 'El DPO (Delegado de Protección de Datos)', correcto: true },
              { id: 'c', texto: 'El Jefe de TI', correcto: false },
              { id: 'd', texto: 'El Gerente de RRHH', correcto: false }
            ],
            explicacion: 'El DPO debe liderar el equipo multidisciplinario según las mejores prácticas de la Ley 21.719'
          },
          puntosMax: 20
        },
        {
          id: 'identificar_areas',
          titulo: 'Identificar Áreas Críticas',
          contenido: `
            <h3>Ejercicio: Identifica las áreas de tu empresa</h3>
            <p>Para una empresa salmonera típica, marca todas las áreas que deberían formar parte del equipo:</p>
          `,
          ejercicio: {
            tipo: 'checklist',
            items: [
              { id: 'rrhh', texto: 'Recursos Humanos', requerido: true },
              { id: 'finanzas', texto: 'Finanzas y Contabilidad', requerido: true },
              { id: 'produccion', texto: 'Producción Acuícola', requerido: true },
              { id: 'calidad', texto: 'Control de Calidad', requerido: false },
              { id: 'ventas', texto: 'Ventas y Exportación', requerido: true },
              { id: 'ti', texto: 'Tecnología', requerido: true },
              { id: 'legal', texto: 'Legal y Compliance', requerido: true },
              { id: 'marketing', texto: 'Marketing', requerido: false },
              { id: 'logistica', texto: 'Logística', requerido: true }
            ]
          },
          puntosMax: 30
        },
        {
          id: 'responsabilidades',
          titulo: 'Definir Responsabilidades',
          contenido: `
            <h3>Responsabilidades de cada miembro del equipo</h3>
            <p>Cada representante debe:</p>
            <ol>
              <li>Participar en las sesiones de levantamiento</li>
              <li>Identificar TODAS las actividades de tratamiento de su área</li>
              <li>Proporcionar información detallada y actualizada</li>
              <li>Validar la documentación del RAT</li>
              <li>Mantener actualizado el inventario</li>
            </ol>
          `,
          actividad: {
            tipo: 'asignacion',
            instruccion: 'Asigna el responsable correcto para cada tarea:',
            tareas: [
              { 
                id: 't1', 
                descripcion: 'Documentar procesos de nómina y beneficios',
                area_correcta: 'RRHH'
              },
              { 
                id: 't2', 
                descripcion: 'Mapear sistemas de almacenamiento de datos',
                area_correcta: 'TI'
              },
              { 
                id: 't3', 
                descripcion: 'Identificar obligaciones legales de retención',
                area_correcta: 'Legal'
              },
              { 
                id: 't4', 
                descripcion: 'Documentar evaluaciones crediticias de clientes',
                area_correcta: 'Finanzas'
              }
            ]
          },
          puntosMax: 25
        },
        {
          id: 'evaluacion_final',
          titulo: 'Evaluación del Escenario',
          contenido: `
            <h3>¡Felicitaciones!</h3>
            <p>Has completado el escenario de Conformación del Equipo.</p>
            <p>Puntos obtenidos: <strong>{puntos}/100</strong></p>
          `,
          resumen: true,
          puntosMax: 25
        }
      ]
    },
    {
      id: 'data_discovery',
      titulo: '🔍 Data Discovery - Mapeo Inicial',
      nivel: 'Principiante',
      duracion: '20 minutos',
      puntos: 150,
      videoUrl: 'https://example.com/video2',
      descripcion: 'Aprende la metodología correcta para descubrir y mapear todos los datos personales',
      objetivos: [
        'Aplicar metodología de entrevistas',
        'Identificar actividades vs bases de datos',
        'Documentar hallazgos correctamente'
      ],
      pasos: [
        {
          id: 'metodologia',
          titulo: 'Metodología Correcta',
          contenido: `
            <h3>⚠️ Error Común vs Enfoque Correcto</h3>
            <div style="display: flex; gap: 20px;">
              <div style="flex: 1; background: #ffebee; padding: 15px; border-radius: 8px;">
                <h4 style="color: #c62828;">❌ INCORRECTO</h4>
                <p>"¿Qué bases de datos tienen?"</p>
                <p>Este enfoque técnico omite procesos importantes</p>
              </div>
              <div style="flex: 1; background: #e8f5e9; padding: 15px; border-radius: 8px;">
                <h4 style="color: #2e7d32;">✅ CORRECTO</h4>
                <p>"¿Qué actividades o procesos realizan que involucren información de personas?"</p>
                <p>Este enfoque captura TODO el tratamiento de datos</p>
              </div>
            </div>
          `,
          pregunta: {
            texto: '¿Cuál es la pregunta correcta para iniciar un Data Discovery?',
            opciones: [
              { id: 'a', texto: '¿Cuántas bases de datos SQL tienen?', correcto: false },
              { id: 'b', texto: '¿Qué sistemas informáticos usan?', correcto: false },
              { id: 'c', texto: '¿Qué actividades realizan con información de personas?', correcto: true },
              { id: 'd', texto: '¿Dónde guardan los archivos Excel?', correcto: false }
            ],
            explicacion: 'El enfoque debe ser en actividades y procesos, no en tecnología'
          },
          puntosMax: 30
        },
        {
          id: 'entrevista_rrhh',
          titulo: 'Simulación: Entrevista a RRHH',
          contenido: `
            <h3>📋 Entrevista Estructurada - Departamento de RRHH</h3>
            <p>Estás entrevistando al Gerente de RRHH de una empresa salmonera.</p>
            <p><strong>Contexto:</strong> La empresa tiene 500 empleados y contrata 50 temporales cada temporada.</p>
          `,
          simulacion: {
            tipo: 'entrevista',
            personaje: 'Gerente de RRHH',
            avatar: '👔',
            dialogo: [
              {
                personaje: 'Hola, soy María, Gerente de RRHH. ¿En qué puedo ayudarte?',
                opciones_respuesta: [
                  { 
                    texto: '¿Cuál es el proceso completo desde que reciben un currículum hasta contratar?',
                    correcto: true,
                    siguiente: 'proceso_completo'
                  },
                  { 
                    texto: '¿Tienen una base de datos de empleados?',
                    correcto: false,
                    siguiente: 'pregunta_tecnica'
                  }
                ]
              },
              {
                id: 'proceso_completo',
                personaje: 'Excelente pregunta. Primero recibimos CVs por email y portal web. Los revisamos, hacemos entrevistas, pedimos exámenes médicos preocupacionales, verificamos antecedentes y finalmente contratamos.',
                opciones_respuesta: [
                  {
                    texto: '¿Qué información específica recopilan en cada etapa?',
                    correcto: true,
                    siguiente: 'detalle_info'
                  },
                  {
                    texto: '¿Usan Excel o Access?',
                    correcto: false,
                    siguiente: 'pregunta_tecnica'
                  }
                ]
              },
              {
                id: 'detalle_info',
                personaje: 'En CVs: datos personales, educación, experiencia. En exámenes médicos: salud, aptitud física. En verificación: antecedentes penales, referencias laborales.',
                opciones_respuesta: [
                  {
                    texto: '¿Con quién comparten esta información? ¿Hay terceros involucrados?',
                    correcto: true,
                    siguiente: 'terceros'
                  }
                ]
              },
              {
                id: 'terceros',
                personaje: 'Compartimos con: Clínica San José (exámenes), VerificaChile (antecedentes), Previred (cotizaciones), y el SII para temas tributarios.',
                opciones_respuesta: [
                  {
                    texto: '¿Por cuánto tiempo conservan los datos de candidatos no seleccionados?',
                    correcto: true,
                    siguiente: 'retencion'
                  }
                ]
              },
              {
                id: 'retencion',
                personaje: 'Los CVs de no seleccionados los guardamos 6 meses por si surge otra vacante. ¿Algo más?',
                final: true
              }
            ]
          },
          puntosMax: 40
        },
        {
          id: 'documentar_rat',
          titulo: 'Documentar en el RAT',
          contenido: `
            <h3>📝 Documentación de la Actividad</h3>
            <p>Basándote en la entrevista, completa el registro RAT:</p>
          `,
          formulario: {
            tipo: 'rat_completo',
            campos: [
              {
                id: 'nombre_actividad',
                label: 'Nombre de la Actividad',
                tipo: 'texto',
                respuesta_correcta: 'Proceso de Reclutamiento y Selección',
                pistas: ['Debe describir el proceso completo', 'Incluye reclutamiento Y selección']
              },
              {
                id: 'finalidades',
                label: 'Finalidades del Tratamiento',
                tipo: 'multiple',
                opciones: [
                  'Evaluar idoneidad de candidatos',
                  'Verificar antecedentes',
                  'Cumplir procesos de due diligence',
                  'Enviar publicidad',
                  'Vender datos a terceros'
                ],
                respuestas_correctas: [0, 1, 2]
              },
              {
                id: 'base_licitud',
                label: 'Base de Licitud',
                tipo: 'select',
                opciones: [
                  'Consentimiento del candidato',
                  'Ejecución de contrato',
                  'Obligación legal',
                  'Interés legítimo',
                  'Medidas precontractuales'
                ],
                respuesta_correcta: 4
              },
              {
                id: 'datos_sensibles',
                label: '¿Incluye datos sensibles?',
                tipo: 'boolean',
                respuesta_correcta: true,
                explicacion: 'Sí, incluye datos de salud (exámenes médicos) y situación socioeconómica'
              },
              {
                id: 'terceros',
                label: 'Terceros Involucrados',
                tipo: 'tags',
                respuestas_correctas: ['Clínica San José', 'VerificaChile', 'Previred', 'SII']
              },
              {
                id: 'plazo_retencion',
                label: 'Plazo de Retención (no seleccionados)',
                tipo: 'select',
                opciones: ['3 meses', '6 meses', '1 año', '2 años', 'Indefinido'],
                respuesta_correcta: 1
              }
            ]
          },
          puntosMax: 50
        },
        {
          id: 'evaluacion_discovery',
          titulo: 'Resultado del Data Discovery',
          contenido: `
            <h3>🎯 Evaluación del Data Discovery</h3>
            <p>Has completado exitosamente el proceso de descubrimiento de datos.</p>
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h4>Actividad Documentada:</h4>
              <strong>"Proceso de Reclutamiento y Selección"</strong>
              <ul>
                <li>✅ Finalidades identificadas correctamente</li>
                <li>✅ Base de licitud apropiada</li>
                <li>✅ Datos sensibles detectados</li>
                <li>✅ Terceros mapeados</li>
                <li>✅ Plazos de retención definidos</li>
              </ul>
            </div>
          `,
          resumen: true,
          puntosMax: 30
        }
      ]
    },
    {
      id: 'clasificacion_sensibilidad',
      titulo: '🔐 Clasificación por Sensibilidad',
      nivel: 'Intermedio',
      duracion: '25 minutos',
      puntos: 200,
      videoUrl: 'https://example.com/video3',
      descripcion: 'Domina la clasificación de datos según la Ley 21.719, especialmente la novedad chilena',
      objetivos: [
        'Identificar datos sensibles según ley chilena',
        'Reconocer situación socioeconómica como dato sensible',
        'Clasificar datos de NNA correctamente'
      ],
      pasos: [
        {
          id: 'categorias_datos',
          titulo: 'Categorías de Datos Personales',
          contenido: `
            <h3>📊 Clasificación según Ley 21.719</h3>
            
            <div style="margin: 20px 0;">
              <h4>1. Datos Personales Comunes</h4>
              <ul>
                <li>Información de identificación (nombre, RUT)</li>
                <li>Datos de contacto (email, teléfono)</li>
                <li>Datos laborales (cargo, empresa)</li>
                <li>Datos académicos (títulos, cursos)</li>
              </ul>
            </div>

            <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4>2. Datos Sensibles (Art. 2, lit. g)</h4>
              <ul>
                <li>🏥 <strong>Salud:</strong> Historial médico, licencias, discapacidades</li>
                <li>🔐 <strong>Biométricos:</strong> Huella dactilar, reconocimiento facial</li>
                <li>🏛️ <strong>Ideológicos:</strong> Afiliación sindical, política, religiosa</li>
                <li>🌈 <strong>Vida sexual:</strong> Orientación sexual, identidad de género</li>
                <li>🧬 <strong>Genéticos:</strong> ADN, marcadores genéticos</li>
              </ul>
            </div>

            <div style="background: #ffebee; padding: 15px; border-radius: 8px; border: 2px solid #ef5350;">
              <h4>⚠️ NOVEDAD CHILENA - Situación Socioeconómica</h4>
              <p><strong>En Chile es DATO SENSIBLE (no existe en GDPR europeo):</strong></p>
              <ul>
                <li>💰 Nivel de ingresos</li>
                <li>📊 Score crediticio (DICOM/Equifax)</li>
                <li>🏦 Historial crediticio</li>
                <li>💳 Capacidad de pago</li>
                <li>🏠 Patrimonio</li>
                <li>📈 Elegibilidad para beneficios sociales</li>
              </ul>
            </div>

            <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4>3. Datos de NNA (Niños, Niñas y Adolescentes)</h4>
              <ul>
                <li>👶 Menores de 14 años: Requiere consentimiento de padres/tutores</li>
                <li>🧒 14-18 años: Pueden consentir según madurez</li>
                <li>⚖️ Siempre considerar el interés superior del niño</li>
              </ul>
            </div>
          `,
          quiz: {
            tipo: 'multiple_choice',
            preguntas: [
              {
                texto: '¿Cuál de estos es un dato sensible SOLO en Chile?',
                opciones: [
                  'Datos de salud',
                  'Score crediticio DICOM',
                  'Huella dactilar',
                  'Afiliación política'
                ],
                respuesta_correcta: 1,
                explicacion: 'El score crediticio es parte de la situación socioeconómica, dato sensible exclusivo de Chile'
              },
              {
                texto: 'Una empresa tiene el salario de sus empleados. ¿Cómo se clasifica?',
                opciones: [
                  'Dato personal común',
                  'Dato sensible - situación socioeconómica',
                  'Dato laboral no sensible',
                  'Dato financiero común'
                ],
                respuesta_correcta: 1,
                explicacion: 'El nivel de ingresos es situación socioeconómica, dato sensible en Chile'
              }
            ]
          },
          puntosMax: 40
        },
        {
          id: 'ejercicio_clasificacion',
          titulo: 'Ejercicio Práctico: Clasificar Datos',
          contenido: `
            <h3>🎯 Clasifica estos datos según la Ley 21.719</h3>
            <p>Arrastra cada dato a su categoría correcta:</p>
          `,
          actividad: {
            tipo: 'drag_drop',
            items: [
              { id: 'd1', texto: 'Nombre y RUT', categoria: 'comun' },
              { id: 'd2', texto: 'Email corporativo', categoria: 'comun' },
              { id: 'd3', texto: 'Licencia médica', categoria: 'sensible' },
              { id: 'd4', texto: 'Score DICOM', categoria: 'sensible' },
              { id: 'd5', texto: 'Cargo en la empresa', categoria: 'comun' },
              { id: 'd6', texto: 'Huella para reloj control', categoria: 'sensible' },
              { id: 'd7', texto: 'Nivel de renta', categoria: 'sensible' },
              { id: 'd8', texto: 'Datos hijo (asignación familiar)', categoria: 'nna' },
              { id: 'd9', texto: 'Afiliación sindical', categoria: 'sensible' },
              { id: 'd10', texto: 'Dirección particular', categoria: 'comun' },
              { id: 'd11', texto: 'Evaluación psicológica', categoria: 'sensible' },
              { id: 'd12', texto: 'Patrimonio declarado', categoria: 'sensible' }
            ],
            categorias: [
              { id: 'comun', nombre: 'Datos Comunes', color: '#4caf50' },
              { id: 'sensible', nombre: 'Datos Sensibles', color: '#f44336' },
              { id: 'nna', nombre: 'Datos NNA', color: '#ff9800' }
            ]
          },
          puntosMax: 60
        },
        {
          id: 'caso_real',
          titulo: 'Caso Real: Empresa Salmonera',
          contenido: `
            <h3>🐟 Caso: AquaChile S.A.</h3>
            <p>AquaChile procesa los siguientes datos de sus trabajadores de centro de cultivo:</p>
            <ul>
              <li>Datos básicos (nombre, RUT, dirección)</li>
              <li>Certificados de buceo y navegación</li>
              <li>Exámenes médicos ocupacionales</li>
              <li>Geolocalización en tiempo real (seguridad en altamar)</li>
              <li>Evaluación de capacidad crediticia para préstamos empresa</li>
              <li>Datos de hijos para beneficios escolares</li>
              <li>Registro de accidentes laborales</li>
            </ul>
          `,
          analisis: {
            tipo: 'clasificacion_completa',
            instruccion: 'Clasifica cada dato y justifica si requiere consentimiento explícito:',
            datos: [
              {
                nombre: 'Certificados de buceo',
                clasificacion_correcta: 'comun',
                requiere_consentimiento_explicito: false,
                justificacion: 'Dato laboral común, necesario para el cargo'
              },
              {
                nombre: 'Exámenes médicos ocupacionales',
                clasificacion_correcta: 'sensible',
                requiere_consentimiento_explicito: true,
                justificacion: 'Dato de salud, requiere consentimiento explícito'
              },
              {
                nombre: 'Geolocalización en tiempo real',
                clasificacion_correcta: 'comun',
                requiere_consentimiento_explicito: false,
                justificacion: 'Dato común si es por seguridad laboral justificada'
              },
              {
                nombre: 'Evaluación crediticia para préstamos',
                clasificacion_correcta: 'sensible',
                requiere_consentimiento_explicito: true,
                justificacion: 'Situación socioeconómica, dato sensible en Chile'
              },
              {
                nombre: 'Datos de hijos',
                clasificacion_correcta: 'nna',
                requiere_consentimiento_explicito: true,
                justificacion: 'Datos de menores, requieren consentimiento especial'
              }
            ]
          },
          puntosMax: 50
        },
        {
          id: 'resumen_clasificacion',
          titulo: 'Resumen y Puntos Clave',
          contenido: `
            <h3>✅ Has dominado la clasificación de datos</h3>
            
            <div style="background: #e8f5e9; padding: 20px; border-radius: 8px;">
              <h4>Puntos Clave Aprendidos:</h4>
              <ul>
                <li>✓ La situación socioeconómica es dato sensible SOLO en Chile</li>
                <li>✓ Datos de salud siempre son sensibles</li>
                <li>✓ Datos biométricos requieren máxima protección</li>
                <li>✓ Datos de NNA tienen régimen especial</li>
                <li>✓ El consentimiento debe ser explícito para datos sensibles</li>
              </ul>
            </div>

            <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin-top: 15px;">
              <h4>⚠️ Recuerda siempre:</h4>
              <p>"En caso de duda sobre si un dato es sensible, trátalo como sensible"</p>
            </div>
          `,
          resumen: true,
          puntosMax: 50
        }
      ]
    },
    {
      id: 'flujos_datos',
      titulo: '🔄 Documentación de Flujos de Datos',
      nivel: 'Intermedio',
      duracion: '30 minutos',
      puntos: 250,
      videoUrl: 'https://example.com/video4',
      descripcion: 'Aprende a mapear flujos internos, externos y transferencias internacionales',
      objetivos: [
        'Trazar flujos internos entre sistemas',
        'Identificar transferencias a terceros',
        'Documentar transferencias internacionales',
        'Detectar riesgos en flujos de datos'
      ],
      pasos: [
        {
          id: 'tipos_flujos',
          titulo: 'Tipos de Flujos de Datos',
          contenido: `
            <h3>🔄 El inventario es un mapa dinámico</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
              <div style="background: #e3f2fd; padding: 15px; border-radius: 8px;">
                <h4>📊 Flujos Internos</h4>
                <p>Movimiento entre sistemas de la organización:</p>
                <ul>
                  <li>Web → CRM → ERP</li>
                  <li>RRHH → Nómina → Contabilidad</li>
                  <li>Producción → Calidad → Reportes</li>
                </ul>
              </div>
              
              <div style="background: #fff3e0; padding: 15px; border-radius: 8px;">
                <h4>🤝 Flujos Externos</h4>
                <p>Transferencias a terceros:</p>
                <ul>
                  <li>Encargados (cloud, marketing)</li>
                  <li>Cesionarios (venta de datos)</li>
                  <li>Autoridades (SII, SERNAPESCA)</li>
                </ul>
              </div>
            </div>

            <div style="background: #ffebee; padding: 15px; border-radius: 8px;">
              <h4>🌍 Transferencias Internacionales</h4>
              <p>Requieren garantías especiales:</p>
              <ul>
                <li>País con nivel adecuado de protección</li>
                <li>Cláusulas contractuales tipo</li>
                <li>Consentimiento expreso del titular</li>
              </ul>
            </div>
          `,
          puntosMax: 30
        },
        {
          id: 'mapeo_visual',
          titulo: 'Ejercicio: Mapeo Visual de Flujos',
          contenido: `
            <h3>🗺️ Mapea el flujo de datos de un cliente</h3>
            <p>Sigue el recorrido de los datos desde el registro hasta la facturación:</p>
          `,
          actividad: {
            tipo: 'flujo_interactivo',
            escenario: 'Cliente se registra en web de empresa salmonera',
            pasos_flujo: [
              {
                id: 'f1',
                sistema: 'Formulario Web',
                datos: ['Nombre', 'RUT', 'Email', 'Empresa'],
                siguiente: ['f2']
              },
              {
                id: 'f2',
                sistema: 'CRM Salesforce',
                datos: ['+ Historial compras', '+ Score crediticio'],
                siguiente: ['f3', 'f4']
              },
              {
                id: 'f3',
                sistema: 'ERP SAP',
                datos: ['+ Órdenes', '+ Facturación'],
                siguiente: ['f5']
              },
              {
                id: 'f4',
                sistema: 'DICOM',
                tipo: 'externo',
                datos: ['Verificación crediticia'],
                siguiente: ['f2']
              },
              {
                id: 'f5',
                sistema: 'SII',
                tipo: 'autoridad',
                datos: ['Factura electrónica'],
                siguiente: []
              }
            ],
            preguntas_flujo: [
              {
                texto: '¿Dónde se agrega el score crediticio?',
                respuesta: 'CRM Salesforce'
              },
              {
                texto: '¿Qué sistema externo interviene?',
                respuesta: 'DICOM'
              },
              {
                texto: '¿A qué autoridad se reporta?',
                respuesta: 'SII'
              }
            ]
          },
          puntosMax: 50
        },
        {
          id: 'caso_iot',
          titulo: 'Caso Especial: Datos IoT en Salmoneras',
          contenido: `
            <h3>🐟 Riesgos Específicos del Sector</h3>
            
            <div style="background: #e8f5e9; padding: 15px; border-radius: 8px;">
              <h4>Escenario: Centro de Cultivo Inteligente</h4>
              <p>Tu empresa implementó sensores IoT que monitorean:</p>
              <ul>
                <li>📡 Temperatura del agua en tiempo real</li>
                <li>💨 Niveles de oxígeno</li>
                <li>🍽️ Alimentación automática</li>
                <li>📍 GPS de embarcaciones y buzos</li>
                <li>📹 Cámaras submarinas con IA</li>
              </ul>
            </div>

            <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h4>⚠️ Pregunta Clave:</h4>
              <p><strong>¿Cuándo los datos IoT se convierten en datos personales?</strong></p>
              <p>Respuesta: Cuando pueden vincularse a un operario específico</p>
            </div>
          `,
          caso_practico: {
            tipo: 'analisis_iot',
            situaciones: [
              {
                descripcion: 'Sensor de temperatura registra 15°C a las 14:00',
                es_dato_personal: false,
                justificacion: 'No vinculable a persona'
              },
              {
                descripcion: 'GPS muestra que bote de Juan está en jaula #5',
                es_dato_personal: true,
                justificacion: 'Vinculable a operario específico (Juan)'
              },
              {
                descripcion: 'Sistema registra que Operario #123 alimentó peces',
                es_dato_personal: true,
                justificacion: 'ID vinculable a persona'
              },
              {
                descripcion: 'Cámara detecta mortalidad del 2% en jaula',
                es_dato_personal: false,
                justificacion: 'Dato agregado no personal'
              },
              {
                descripcion: 'App móvil registra que Pedro revisó oxígeno',
                es_dato_personal: true,
                justificacion: 'Actividad vinculada a Pedro'
              }
            ]
          },
          puntosMax: 60
        },
        {
          id: 'documentar_flujos',
          titulo: 'Documentar Flujos en el RAT',
          contenido: `
            <h3>📝 Plantilla de Documentación de Flujos</h3>
          `,
          formulario: {
            tipo: 'documentacion_flujo',
            actividad: 'Monitoreo IoT de Centro de Cultivo',
            campos: [
              {
                seccion: 'Flujos Internos',
                items: [
                  'Sensores → Plataforma IoT',
                  'Plataforma IoT → Sistema Análisis',
                  'Sistema Análisis → Dashboard Gerencial',
                  'Dashboard → Reportes Producción'
                ]
              },
              {
                seccion: 'Flujos Externos',
                items: [
                  'AWS (almacenamiento cloud)',
                  'Microsoft Azure (procesamiento IA)',
                  'SERNAPESCA (reportes obligatorios)',
                  'Cliente (trazabilidad producto)'
                ]
              },
              {
                seccion: 'Transferencias Internacionales',
                items: [
                  {
                    destino: 'Estados Unidos (AWS)',
                    garantia: 'Cláusulas contractuales tipo',
                    datos: 'Métricas de producción'
                  },
                  {
                    destino: 'Irlanda (Microsoft)',
                    garantia: 'Decisión de adecuación UE',
                    datos: 'Imágenes para análisis IA'
                  }
                ]
              }
            ]
          },
          puntosMax: 60
        },
        {
          id: 'evaluacion_flujos',
          titulo: 'Evaluación: Flujos Completos',
          contenido: `
            <h3>🎯 Resumen de Flujos Documentados</h3>
            
            <div style="background: #e8f5e9; padding: 20px; border-radius: 8px;">
              <h4>✅ Flujos Mapeados Correctamente:</h4>
              <ul>
                <li>4 flujos internos identificados</li>
                <li>4 terceros externos documentados</li>
                <li>2 transferencias internacionales con garantías</li>
                <li>Riesgos IoT evaluados</li>
              </ul>
            </div>

            <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin-top: 15px;">
              <h4>📊 Métricas de Cumplimiento:</h4>
              <ul>
                <li>Cobertura de sistemas: 100%</li>
                <li>Terceros sin contrato: 0</li>
                <li>Transferencias sin garantías: 0</li>
                <li>Nivel de riesgo: CONTROLADO</li>
              </ul>
            </div>
          `,
          resumen: true,
          puntosMax: 50
        }
      ]
    },
    {
      id: 'metodologia_levantamiento',
      titulo: '📋 Metodología de Levantamiento de Inventario',
      nivel: 'Principiante',
      duracion: '30 minutos',
      puntos: 180,
      videoUrl: 'https://example.com/video_metodologia',
      descripcion: 'Aprende la metodología correcta para realizar entrevistas estructuradas y talleres con dueños de procesos',
      objetivos: [
        'Dominar técnicas de entrevista estructurada',
        'Aplicar metodología centrada en actividades vs bases de datos',
        'Realizar talleres efectivos con dueños de procesos',
        'Identificar y documentar actividades de tratamiento'
      ],
      pasos: [
        {
          id: 'enfoque_correcto',
          titulo: 'Enfoque Correcto vs Incorrecto',
          contenido: `
            <h3>❌ ERROR COMÚN vs ✅ METODOLOGÍA CORRECTA</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div style="background: #ffebee; padding: 20px; border-radius: 8px; border: 2px solid #f44336;">
                <h4 style="color: #c62828;">❌ ENFOQUE INCORRECTO</h4>
                <p><strong>Pregunta típica:</strong> "¿Qué bases de datos tienen?"</p>
                <h5>Por qué está mal:</h5>
                <ul>
                  <li>Se centra en tecnología, no en procesos</li>
                  <li>Omite actividades manuales</li>
                  <li>No captura el "por qué" de los datos</li>
                  <li>Pierde transferencias informales</li>
                  <li>Ignora el flujo completo de información</li>
                </ul>
              </div>
              <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; border: 2px solid #4caf50;">
                <h4 style="color: #2e7d32;">✅ ENFOQUE CORRECTO</h4>
                <p><strong>Pregunta clave:</strong> "¿Qué actividades o procesos realizan que involucren información de personas?"</p>
                <h5>Por qué funciona:</h5>
                <ul>
                  <li>Se centra en actividades de negocio</li>
                  <li>Captura TODO el tratamiento de datos</li>
                  <li>Incluye procesos manuales y digitales</li>
                  <li>Identifica el propósito real</li>
                  <li>Mapea el flujo completo</li>
                </ul>
              </div>
            </div>
          `,
          pregunta: {
            texto: 'Una empresa te contrata para hacer el inventario de datos. ¿Cuál sería tu primera pregunta?',
            opciones: [
              { id: 'a', texto: '¿Cuántos servidores tienen y qué sistemas operativos usan?', correcto: false },
              { id: 'b', texto: '¿Qué bases de datos manejan y cuántos registros hay?', correcto: false },
              { id: 'c', texto: '¿Qué actividades realizan que involucren información de personas?', correcto: true },
              { id: 'd', texto: '¿Tienen un servidor central o están en la nube?', correcto: false }
            ],
            explicacion: 'El enfoque debe comenzar por entender las actividades de negocio, no la tecnología'
          },
          puntosMax: 30
        },
        {
          id: 'preguntas_estructuradas',
          titulo: 'Técnica de Preguntas Estructuradas',
          contenido: `
            <h3>🎯 Metodología de Entrevista Estructurada</h3>
            <p>Basada en las mejores prácticas del manual, estas son las preguntas que SIEMPRE debes hacer:</p>
            
            <h4>1. PREGUNTAS DE APERTURA (Proceso Completo)</h4>
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 10px 0;">
              <p><strong>Ejemplo para RRHH:</strong></p>
              <p>"¿Cuál es el proceso completo desde que reciben un currículum hasta que se contrata a una persona?"</p>
              <p><em>Permite identificar TODAS las etapas del proceso</em></p>
            </div>
            
            <h4>2. PREGUNTAS DE PROFUNDIZACIÓN (Información Específica)</h4>
            <ul>
              <li>"¿Qué información solicitan en cada etapa?"</li>
              <li>"¿Dónde guardan esta información?"</li>
              <li>"¿En qué formato? (digital, papel, email)"</li>
              <li>"¿Quién puede acceder a esta información?"</li>
            </ul>
            
            <h4>3. PREGUNTAS DE FLUJO (Transferencias)</h4>
            <ul>
              <li>"¿Con quién comparten esta información?"</li>
              <li>"¿Envían datos a empresas externas?"</li>
              <li>"¿Hay sistemas que se conectan automáticamente?"</li>
              <li>"¿Reportan información a autoridades?"</li>
            </ul>
            
            <h4>4. PREGUNTAS DE RETENCIÓN (Tiempo)</h4>
            <ul>
              <li>"¿Por cuánto tiempo conservan estos datos?"</li>
              <li>"¿Qué pasa con la información de personas que no son contratadas?"</li>
              <li>"¿Tienen un procedimiento para eliminar datos antiguos?"</li>
            </ul>
          `,
          ejercicio: {
            tipo: 'simulacion_entrevista',
            contexto: 'Estás entrevistando al Jefe de Finanzas de una empresa salmonera',
            pregunta_inicial: 'Cuénteme sobre el proceso de evaluación crediticia de clientes',
            respuesta_simulada: 'Cuando un cliente quiere comprar a crédito, primero revisamos su RUT en DICOM, pedimos referencias comerciales, evaluamos sus estados financieros y definimos cupo.',
            opciones_seguimiento: [
              {
                texto: '¿Qué información específica obtienen de DICOM?',
                correcto: true,
                puntos: 20,
                feedback: 'Excelente - profundizas en datos específicos'
              },
              {
                texto: '¿Usan Excel o un sistema especial?',
                correcto: false,
                puntos: 5,
                feedback: 'Muy técnico - enfócate en la información, no en la herramienta'
              },
              {
                texto: '¿Cuántos clientes evalúan por mes?',
                correcto: false,
                puntos: 5,
                feedback: 'Dato estadístico - no relevante para el RAT'
              },
              {
                texto: '¿Comparten esta información con alguien más?',
                correcto: true,
                puntos: 20,
                feedback: 'Perfecto - identificas posibles transferencias'
              }
            ]
          },
          puntosMax: 40
        },
        {
          id: 'talleres_departamentales',
          titulo: 'Talleres con Dueños de Procesos',
          contenido: `
            <h3>🏭 Talleres por Departamento</h3>
            <p>Cada departamento requiere preguntas específicas según el manual:</p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div style="background: #e8f5e9; padding: 15px; border-radius: 8px;">
                <h4>👥 RECURSOS HUMANOS</h4>
                <h5>Preguntas clave:</h5>
                <ul>
                  <li>Proceso completo de reclutamiento</li>
                  <li>¿Qué empresa hace exámenes preocupacionales?</li>
                  <li>¿Cómo verifican antecedentes?</li>
                  <li>¿Conservan datos de no contratados?</li>
                  <li>Gestión de nómina y beneficios</li>
                  <li>Datos de familiares para beneficios</li>
                </ul>
              </div>
              
              <div style="background: #fff3e0; padding: 15px; border-radius: 8px;">
                <h4>💰 FINANZAS</h4>
                <h5>Preguntas clave:</h5>
                <ul>
                  <li>Proceso de evaluación crediticia</li>
                  <li>¿Consultan DICOM/Equifax?</li>
                  <li>¿Solicitan estados financieros?</li>
                  <li>¿Comparten con bancos o factoring?</li>
                  <li>Facturación y cobranza</li>
                  <li>Reportes al SII</li>
                </ul>
              </div>
              
              <div style="background: #e3f2fd; padding: 15px; border-radius: 8px;">
                <h4>📈 MARKETING/VENTAS</h4>
                <h5>Preguntas clave:</h5>
                <ul>
                  <li>¿Cómo obtienen leads?</li>
                  <li>¿Compran bases de datos?</li>
                  <li>¿Usan herramientas de analytics?</li>
                  <li>¿Hacen perfilamiento de clientes?</li>
                  <li>¿Envían marketing directo?</li>
                  <li>¿Tienen programa de fidelización?</li>
                </ul>
              </div>
              
              <div style="background: #fce4ec; padding: 15px; border-radius: 8px;">
                <h4>🔧 OPERACIONES/PRODUCCIÓN</h4>
                <h5>Preguntas clave:</h5>
                <ul>
                  <li>¿Usan sensores IoT?</li>
                  <li>¿Tienen datos de geolocalización?</li>
                  <li>¿Hacen trazabilidad de productos?</li>
                  <li>¿Reportan a SERNAPESCA?</li>
                  <li>Control de calidad</li>
                  <li>Datos de trabajadores en terreno</li>
                </ul>
              </div>
            </div>
          `,
          actividad: {
            tipo: 'planificacion_taller',
            instruccion: 'Planifica un taller para el área de TI. Selecciona las preguntas más relevantes:',
            preguntas_disponibles: [
              { texto: '¿Cuántos servidores tienen?', relevante: false },
              { texto: '¿Qué sistemas almacenan datos de personas?', relevante: true },
              { texto: '¿Qué versión de Windows usan?', relevante: false },
              { texto: '¿Cómo controlan el acceso a los datos?', relevante: true },
              { texto: '¿Tienen procedimientos de backup?', relevante: true },
              { texto: '¿Cuál es su presupuesto de TI?', relevante: false },
              { texto: '¿Usan servicios en la nube?', relevante: true },
              { texto: '¿Qué antivirus utilizan?', relevante: false },
              { texto: '¿Tienen logs de acceso a datos personales?', relevante: true },
              { texto: '¿Hacen transferencias internacionales de datos?', relevante: true }
            ]
          },
          puntosMax: 40
        },
        {
          id: 'documentacion_actividades',
          titulo: 'Documentación de Actividades de Tratamiento',
          contenido: `
            <h3>📝 Elementos del RAT según Art. 31</h3>
            <p>Para cada actividad identificada, se debe documentar:</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
              <h4>CAMPOS OBLIGATORIOS DEL RAT:</h4>
              
              <div style="margin: 15px 0; padding: 10px; background: white; border-left: 4px solid #2196f3;">
                <strong>1. Nombre de la actividad de tratamiento</strong>
                <p><em>Ejemplo:</em> "Proceso de Reclutamiento y Selección"</p>
              </div>
              
              <div style="margin: 15px 0; padding: 10px; background: white; border-left: 4px solid #4caf50;">
                <strong>2. Finalidad(es) del tratamiento</strong>
                <p><em>Ejemplo:</em> "Evaluar la idoneidad de los candidatos para vacantes laborales"</p>
              </div>
              
              <div style="margin: 15px 0; padding: 10px; background: white; border-left: 4px solid #ff9800;">
                <strong>3. Base de licitud</strong>
                <p><em>Ejemplo:</em> "Consentimiento del candidato", "Medidas precontractuales"</p>
              </div>
              
              <div style="margin: 15px 0; padding: 10px; background: white; border-left: 4px solid #9c27b0;">
                <strong>4. Categorías de titulares de datos</strong>
                <p><em>Ejemplo:</em> "Postulantes a empleos"</p>
              </div>
              
              <div style="margin: 15px 0; padding: 10px; background: white; border-left: 4px solid #f44336;">
                <strong>5. Categorías de datos personales tratados</strong>
                <p><em>Ejemplo:</em> "Datos de identificación, historial académico, experiencia laboral"</p>
              </div>
              
              <div style="margin: 15px 0; padding: 10px; background: white; border-left: 4px solid #607d8b;">
                <strong>6. Categorías de destinatarios (internos y externos)</strong>
                <p><em>Ejemplo:</em> "Gerentes de área, empresa externa de verificación de antecedentes"</p>
              </div>
              
              <div style="margin: 15px 0; padding: 10px; background: white; border-left: 4px solid #795548;">
                <strong>7. Transferencias internacionales (si aplica)</strong>
                <p><em>Ejemplo:</em> "Estados Unidos - Cláusulas contractuales tipo"</p>
              </div>
              
              <div style="margin: 15px 0; padding: 10px; background: white; border-left: 4px solid #ff5722;">
                <strong>8. Plazos de conservación y supresión</strong>
                <p><em>Ejemplo:</em> "Currículums de candidatos no seleccionados se eliminan después de 6 meses"</p>
              </div>
              
              <div style="margin: 15px 0; padding: 10px; background: white; border-left: 4px solid #009688;">
                <strong>9. Descripción de las medidas de seguridad técnicas y organizativas</strong>
                <p><em>Ejemplo:</em> "Cifrado AES-256, control de acceso RBAC, logs de auditoría"</p>
              </div>
            </div>
          `,
          formulario: {
            tipo: 'rat_completo_practica',
            actividad_ejemplo: 'Proceso de Facturación de Clientes',
            descripcion_proceso: 'El área de finanzas recibe órdenes de venta, verifica datos del cliente, consulta su historial crediticio, genera la factura y la envía por email. También reporta al SII.',
            campos_completar: [
              {
                campo: 'finalidades',
                opciones: [
                  'Facturar ventas realizadas',
                  'Cumplir obligaciones tributarias',
                  'Evaluar riesgo crediticio',
                  'Hacer marketing directo',
                  'Vender datos a terceros'
                ],
                correctas: [0, 1, 2]
              },
              {
                campo: 'base_licitud',
                opciones: [
                  'Consentimiento explícito',
                  'Ejecución de contrato',
                  'Obligación legal',
                  'Interés legítimo',
                  'Interés vital'
                ],
                correcta: 1
              },
              {
                campo: 'datos_tratados',
                opciones: [
                  'Nombre y RUT del cliente',
                  'Dirección de facturación',
                  'Email corporativo',
                  'Score crediticio',
                  'Productos adquiridos',
                  'Forma de pago',
                  'Datos biométricos',
                  'Afiliación política'
                ],
                correctas: [0, 1, 2, 3, 4, 5]
              },
              {
                campo: 'terceros_externos',
                opciones: [
                  'SII (Servicio de Impuestos Internos)',
                  'DICOM/Equifax',
                  'Banco (factoring)',
                  'Proveedor de email',
                  'Empresa de cobranza',
                  'Redes sociales'
                ],
                correctas: [0, 1, 2, 3, 4]
              }
            ]
          },
          puntosMax: 50
        },
        {
          id: 'evaluacion_metodologia',
          titulo: 'Evaluación de la Metodología',
          contenido: `
            <h3>🎯 Caso Integral: Empresa Salmonera</h3>
            <p>Aplica toda la metodología aprendida a este caso real:</p>
            
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px;">
              <h4>🐟 AquaChile - Empresa Salmonera</h4>
              <ul>
                <li><strong>Empleados:</strong> 500 permanentes + 200 temporales</li>
                <li><strong>Centros de cultivo:</strong> 15 con tecnología IoT</li>
                <li><strong>Clientes:</strong> Exportación a 25 países</li>
                <li><strong>Sistemas:</strong> ERP SAP, CRM Salesforce, IoT Platform AWS</li>
              </ul>
            </div>
            
            <p>Tu tarea: Diseñar el plan de entrevistas completo</p>
          `,
          evaluacion_final: {
            tipo: 'plan_entrevistas',
            empresa: 'AquaChile',
            areas_identificar: [
              'Recursos Humanos',
              'Finanzas',
              'Producción Acuícola',
              'Calidad',
              'Ventas/Exportación',
              'TI',
              'Legal'
            ],
            preguntas_clave: {
              'RRHH': [
                'Proceso completo de reclutamiento',
                'Gestión de trabajadores temporales',
                'Exámenes médicos y antecedentes',
                'Nómina y beneficios'
              ],
              'Producción': [
                'Datos de sensores IoT',
                'Geolocalización de trabajadores',
                'Trazabilidad de productos',
                'Reportes a SERNAPESCA'
              ],
              'Ventas': [
                'Evaluación crediticia internacional',
                'Contratos de exportación',
                'Datos de trazabilidad para clientes'
              ]
            }
          },
          puntosMax: 60
        }
      ]
    },
    {
      id: 'especificaciones_tecnicas',
      titulo: '🏗️ Especificaciones Técnicas del Sistema',
      nivel: 'Avanzado',
      duracion: '35 minutos',
      puntos: 300,
      videoUrl: 'https://example.com/video_tecnico',
      descripcion: 'Comprende las especificaciones técnicas para implementar una plataforma de gobernanza de datos',
      objetivos: [
        'Diseñar arquitectura de base de datos para RAT',
        'Implementar funcionalidades de mapeo y visualización',
        'Configurar motor de políticas de retención',
        'Integrar herramientas de descubrimiento automatizado'
      ],
      pasos: [
        {
          id: 'plataforma_gobernanza',
          titulo: 'Plataforma Centralizada de Gobernanza',
          contenido: `
            <h3>🏗️ Sistema de Cumplimiento como Plataforma de Gobernanza</h3>
            
            <div style="background: #e8f5e9; padding: 20px; border-radius: 8px;">
              <h4>Objetivo del Sistema:</h4>
              <p>Actuar como una <strong>plataforma centralizada de gobernanza de datos</strong> que:</p>
              <ul>
                <li>Centralice toda la información del RAT</li>
                <li>Automatice procesos de cumplimiento</li>
                <li>Facilite auditorías y reportes</li>
                <li>Mantenga trazabilidad completa</li>
                <li>Integre con sistemas existentes</li>
              </ul>
            </div>
            
            <h4>Componentes Principales:</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div style="background: #e3f2fd; padding: 15px; border-radius: 8px;">
                <h5>📊 Módulo RAT</h5>
                <p>Registro de Actividades de Tratamiento</p>
              </div>
              <div style="background: #fff3e0; padding: 15px; border-radius: 8px;">
                <h5>🗺️ Mapeo de Flujos</h5>
                <p>Visualización de flujos de datos</p>
              </div>
              <div style="background: #fce4ec; padding: 15px; border-radius: 8px;">
                <h5>⏰ Motor de Retención</h5>
                <p>Automatización de políticas</p>
              </div>
              <div style="background: #f3e5f5; padding: 15px; border-radius: 8px;">
                <h5>🔍 Data Discovery</h5>
                <p>Descubrimiento automatizado</p>
              </div>
            </div>
          `,
          puntosMax: 40
        },
        {
          id: 'interfaz_usuario',
          titulo: 'Interfaz de Usuario para RAT',
          contenido: `
            <h3>🖥️ Interfaz Web Intuitiva</h3>
            
            <div style="background: #fff3e0; padding: 20px; border-radius: 8px;">
              <p><strong>Requisito del Manual:</strong> "El sistema debe ofrecer una interfaz web intuitiva que permita al personal no técnico (dueños de procesos) documentar fácilmente las actividades de tratamiento"</p>
            </div>
            
            <h4>Características de la Interfaz:</h4>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h5>1. Guía Paso a Paso</h5>
              <ul>
                <li>Wizard para creación de actividades</li>
                <li>Campos obligatorios claramente marcados</li>
                <li>Validaciones en tiempo real</li>
                <li>Tooltips explicativos</li>
              </ul>
            </div>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h5>2. Templates Pre-configurados</h5>
              <ul>
                <li>Plantillas por área (RRHH, Finanzas, etc.)</li>
                <li>Actividades típicas pre-cargadas</li>
                <li>Bases de licitud comunes</li>
                <li>Plazos de retención estándar</li>
              </ul>
            </div>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h5>3. Validaciones Inteligentes</h5>
              <ul>
                <li>Detectar datos sensibles automáticamente</li>
                <li>Alertar sobre transferencias internacionales</li>
                <li>Sugerir bases de licitud apropiadas</li>
                <li>Calcular niveles de riesgo</li>
              </ul>
            </div>
          `,
          mockup: {
            tipo: 'wireframe_interactivo',
            pantallas: [
              {
                nombre: 'Dashboard RAT',
                elementos: [
                  'Resumen de actividades por área',
                  'Alertas de cumplimiento',
                  'Próximas fechas de revisión',
                  'Métricas de cobertura'
                ]
              },
              {
                nombre: 'Wizard Nueva Actividad',
                pasos: [
                  'Información básica',
                  'Finalidades y base legal',
                  'Datos tratados',
                  'Sistemas y terceros',
                  'Seguridad y retención'
                ]
              }
            ]
          },
          puntosMax: 50
        },
        {
          id: 'base_datos_inventario',
          titulo: 'Base de Datos del Inventario',
          contenido: `
            <h3>🗄️ Arquitectura de Base de Datos Relacional</h3>
            
            <p>Según el manual, se requiere una base de datos relacional con estas tablas principales:</p>
            
            <div style="background: #263238; color: #aed581; padding: 20px; border-radius: 8px; font-family: monospace;">
              <h4 style="color: #81c784;">TABLA: processing_activities</h4>
              <pre>
id                     INTEGER PRIMARY KEY
nombre_actividad       VARCHAR(255) NOT NULL
area_responsable       VARCHAR(100)
responsable_proceso    VARCHAR(100)
finalidades           TEXT[]
base_licitud          VARCHAR(100)
justificacion_base    TEXT
fecha_creacion        TIMESTAMP
fecha_actualizacion   TIMESTAMP
estado                VARCHAR(50) -- borrador, revision, aprobado
nivel_riesgo          VARCHAR(20) -- bajo, medio, alto, critico
              </pre>
              
              <h4 style="color: #81c784;">TABLA: data_assets</h4>
              <pre>
id                     INTEGER PRIMARY KEY
nombre_sistema         VARCHAR(255)
tipo_sistema          VARCHAR(100) -- bd, erp, crm, archivo
ubicacion             VARCHAR(255)
responsable_tecnico   VARCHAR(100)
medidas_seguridad     TEXT[]
cifrado_reposo        BOOLEAN
cifrado_transito      BOOLEAN
              </pre>
              
              <h4 style="color: #81c784;">TABLA: data_categories</h4>
              <pre>
id                     INTEGER PRIMARY KEY
categoria_nombre       VARCHAR(255)
es_sensible           BOOLEAN
es_nna                BOOLEAN
descripcion           TEXT
ejemplos              TEXT[]
requisitos_especiales TEXT[]
              </pre>
              
              <h4 style="color: #81c784;">TABLA: data_flows</h4>
              <pre>
id                     INTEGER PRIMARY KEY
actividad_id          INTEGER REFERENCES processing_activities(id)
sistema_origen_id     INTEGER REFERENCES data_assets(id)
sistema_destino_id    INTEGER REFERENCES data_assets(id)
tipo_flujo            VARCHAR(50) -- interno, externo, internacional
tercero_nombre        VARCHAR(255)
pais_destino          VARCHAR(100)
garantias_aplicadas   TEXT[]
fecha_mapeo           TIMESTAMP
              </pre>
            </div>
            
            <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin-top: 15px;">
              <h4>Consultas Complejas Requeridas:</h4>
              <p>Las tablas deben estar interrelacionadas para permitir consultas como:</p>
              <ul>
                <li>"¿Qué actividades tratan datos de salud y en qué sistemas se almacenan?"</li>
                <li>"¿Cuáles son todas las transferencias internacionales a Estados Unidos?"</li>
                <li>"¿Qué datos sensibles están almacenados sin cifrado?"</li>
                <li>"¿Qué actividades tienen datos vencidos según políticas de retención?"</li>
              </ul>
            </div>
          `,
          ejercicio_sql: {
            tipo: 'consultas_complejas',
            consultas: [
              {
                pregunta: 'Obtener todas las actividades que tratan datos de salud',
                sql_correcto: `
SELECT pa.nombre_actividad, dc.categoria_nombre 
FROM processing_activities pa
JOIN activity_data_categories adc ON pa.id = adc.actividad_id
JOIN data_categories dc ON adc.categoria_id = dc.id
WHERE dc.categoria_nombre LIKE '%salud%' AND dc.es_sensible = true;
                `,
                puntos: 20
              },
              {
                pregunta: 'Identificar transferencias internacionales sin garantías',
                sql_correcto: `
SELECT pa.nombre_actividad, df.tercero_nombre, df.pais_destino
FROM data_flows df
JOIN processing_activities pa ON df.actividad_id = pa.id
WHERE df.tipo_flujo = 'internacional' 
AND (df.garantias_aplicadas IS NULL OR array_length(df.garantias_aplicadas, 1) = 0);
                `,
                puntos: 25
              }
            ]
          },
          puntosMax: 60
        },
        {
          id: 'visualizacion_flujos',
          titulo: 'Herramientas de Visualización de Flujos',
          contenido: `
            <h3>🗺️ Mapeo y Visualización Automática</h3>
            
            <div style="background: #fff3e0; padding: 20px; border-radius: 8px;">
              <p><strong>Requisito del Manual:</strong> "El sistema debería integrar herramientas de visualización que generen diagramas de flujo de datos automáticamente a partir de la información registrada en el inventario"</p>
            </div>
            
            <h4>Beneficios de la Visualización:</h4>
            <ul>
              <li>El DPO y auditores comprenden rápidamente los flujos</li>
              <li>Identificación de posibles riesgos o cuellos de botella</li>
              <li>Detección de flujos no documentados</li>
              <li>Facilita explicación a la gerencia</li>
              <li>Cumple con requerimientos de transparencia</li>
            </ul>
            
            <h4>Tipos de Diagramas a Generar:</h4>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div style="background: #e3f2fd; padding: 15px; border-radius: 8px;">
                <h5>📊 Diagrama de Sistemas</h5>
                <p>Muestra todos los sistemas y cómo están conectados</p>
                <ul>
                  <li>Nodos: Sistemas/Bases de datos</li>
                  <li>Aristas: Flujos de datos</li>
                  <li>Colores: Tipo de dato (común/sensible)</li>
                </ul>
              </div>
              
              <div style="background: #e8f5e9; padding: 15px; border-radius: 8px;">
                <h5>🌍 Mapa de Transferencias</h5>
                <p>Visualiza transferencias internacionales</p>
                <ul>
                  <li>Mapamundi con conexiones</li>
                  <li>Países con/sin adecuación</li>
                  <li>Garantías aplicadas</li>
                </ul>
              </div>
              
              <div style="background: #fce4ec; padding: 15px; border-radius: 8px;">
                <h5>🏢 Flujo por Departamentos</h5>
                <p>Muestra flujos entre áreas de la empresa</p>
                <ul>
                  <li>Departamentos como nodos</li>
                  <li>Datos compartidos</li>
                  <li>Volumen de información</li>
                </ul>
              </div>
              
              <div style="background: #f3e5f5; padding: 15px; border-radius: 8px;">
                <h5>⏱️ Timeline de Datos</h5>
                <p>Ciclo de vida de los datos</p>
                <ul>
                  <li>Creación → Uso → Archivo → Eliminación</li>
                  <li>Plazos de retención</li>
                  <li>Fechas críticas</li>
                </ul>
              </div>
            </div>
            
            <h4>Tecnologías Recomendadas:</h4>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
              <ul>
                <li><strong>D3.js:</strong> Diagramas interactivos avanzados</li>
                <li><strong>Cytoscape.js:</strong> Grafos de redes complejas</li>
                <li><strong>Vis.js:</strong> Visualización de redes dinámicas</li>
                <li><strong>Leaflet:</strong> Mapas geográficos interactivos</li>
                <li><strong>Graphviz:</strong> Diagramas automáticos de procesos</li>
              </ul>
            </div>
          `,
          demo_visualizacion: {
            tipo: 'prototipo_interactivo',
            escenario: 'AquaChile - Flujo de Datos Cliente',
            nodos: [
              { id: 'web', nombre: 'Portal Web', tipo: 'entrada' },
              { id: 'crm', nombre: 'CRM Salesforce', tipo: 'proceso' },
              { id: 'erp', nombre: 'ERP SAP', tipo: 'proceso' },
              { id: 'dicom', nombre: 'DICOM', tipo: 'externo' },
              { id: 'sii', nombre: 'SII', tipo: 'autoridad' },
              { id: 'aws', nombre: 'AWS', tipo: 'internacional' }
            ],
            conexiones: [
              { desde: 'web', hacia: 'crm', datos: 'Datos cliente', tipo: 'automático' },
              { desde: 'crm', hacia: 'dicom', datos: 'RUT para verificación', tipo: 'API' },
              { desde: 'crm', hacia: 'erp', datos: 'Orden de venta', tipo: 'integración' },
              { desde: 'erp', hacia: 'sii', datos: 'Factura electrónica', tipo: 'obligatorio' },
              { desde: 'crm', hacia: 'aws', datos: 'Backup datos', tipo: 'internacional' }
            ]
          },
          puntosMax: 70
        },
        {
          id: 'data_discovery_automatizado',
          titulo: 'Descubrimiento Automatizado de Datos',
          contenido: `
            <h3>🔍 Integraci\u00f3n y Descubrimiento Automatizado</h3>
            
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px;">
              <p><strong>Requisito del Manual:</strong> "Para mantener el inventario actualizado, el sistema podr\u00eda integrarse con herramientas de descubrimiento de datos (data discovery) que escaneen peri\u00f3dicamente las redes y bases de datos"</p>
            </div>
            
            <h4>Objetivo del Data Discovery Automatizado:</h4>
            <ul>
              <li>Identificar nuevos almacenamientos de datos personales</li>
              <li>Detectar cambios en sistemas existentes</li>
              <li>Alertar sobre datos no inventariados</li>
              <li>Mantener el RAT actualizado sin intervenci\u00f3n manual</li>
            </ul>
            
            <h4>M\u00e9todos de Descubrimiento:</h4>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div style="background: #e8f5e9; padding: 15px; border-radius: 8px;">
                <h5>1. Escaneo de Bases de Datos</h5>
                <ul>
                  <li>An\u00e1lisis de esquemas</li>
                  <li>Detecci\u00f3n de campos personales</li>
                  <li>Identificaci\u00f3n de datos sensibles</li>
                  <li>Conteo de registros</li>
                </ul>
                <p><strong>Herramientas:</strong> Collibra, Informatica, Varonis</p>
              </div>
              
              <div style="background: #fff3e0; padding: 15px; border-radius: 8px;">
                <h5>2. Escaneo de Archivos</h5>
                <ul>
                  <li>B\u00fasqueda en servidores de archivos</li>
                  <li>An\u00e1lisis de contenido (OCR)</li>
                  <li>Detecci\u00f3n de patrones (RUT, emails)</li>
                  <li>Clasificaci\u00f3n autom\u00e1tica</li>
                </ul>
                <p><strong>Herramientas:</strong> Microsoft Purview, Symantec DLP</p>
              </div>
              
              <div style="background: #fce4ec; padding: 15px; border-radius: 8px;">
                <h5>3. Monitoreo de APIs</h5>
                <ul>
                  <li>Intercepci\u00f3n de tr\u00e1fico</li>
                  <li>An\u00e1lisis de payloads JSON/XML</li>
                  <li>Detecci\u00f3n de nuevos endpoints</li>
                  <li>Mapeo de integraciones</li>
                </ul>
                <p><strong>Herramientas:</strong> Postman, Insomnia, custom scripts</p>
              </div>
              
              <div style="background: #f3e5f5; padding: 15px; border-radius: 8px;">
                <h5>4. Logs y Auditor\u00eda</h5>
                <ul>
                  <li>An\u00e1lisis de logs de aplicaciones</li>
                  <li>Eventos de creaci\u00f3n/modificaci\u00f3n</li>
                  <li>Patrones de acceso</li>
                  <li>Alertas de anomal\u00edas</li>
                </ul>
                <p><strong>Herramientas:</strong> Splunk, ELK Stack, Datadog</p>
              </div>
            </div>
            
            <h4>Implementaci\u00f3n T\u00e9cnica:</h4>
            <div style="background: #263238; color: #aed581; padding: 20px; border-radius: 8px; font-family: monospace;">
              <pre>
# Ejemplo: Script de descubrimiento de BD
import psycopg2
import re

def scan_database_schema(connection_string):
    conn = psycopg2.connect(connection_string)
    cursor = conn.cursor()
    
    # Buscar tablas con posibles datos personales
    cursor.execute("""
        SELECT table_name, column_name, data_type 
        FROM information_schema.columns 
        WHERE column_name ILIKE ANY(ARRAY['%email%', '%rut%', '%nombre%', 
                                          '%telefono%', '%direccion%'])
    """)
    
    potential_personal_data = cursor.fetchall()
    
    # Analizar contenido para detectar patrones
    for table, column, dtype in potential_personal_data:
        cursor.execute(f"SELECT DISTINCT {column} FROM {table} LIMIT 100")
        samples = cursor.fetchall()
        
        # Detectar RUTs chilenos
        rut_pattern = r'\d{1,2}\.\d{3}\.\d{3}-[\dkK]'
        if any(re.match(rut_pattern, str(sample[0])) for sample in samples):
            register_finding({
                'type': 'datos_identificacion',
                'sensitivity': 'comun',
                'table': table,
                'column': column,
                'pattern': 'RUT_chileno'
            })
    
    conn.close()

def register_finding(finding):
    # Registrar hallazgo en sistema de cumplimiento
    # Generar alerta para el DPO
    # Sugerir actualizaci\u00f3n del RAT
    pass
              </pre>
            </div>
          `,
          configuracion_discovery: {
            tipo: 'configuracion_herramienta',
            herramientas: [
              {
                nombre: 'Escaneo BD PostgreSQL',
                frecuencia: 'Semanal',
                alcance: 'Todas las bases de datos de producción',
                patrones: ['RUT', 'email', 'teléfono', 'dirección'],
                alertas: ['Nuevas tablas con datos personales', 'Cambios en esquemas']
              },
              {
                nombre: 'Escaneo Archivos Compartidos',
                frecuencia: 'Diario',
                alcance: 'Servidores de archivos Windows/Linux',
                tipos_archivo: ['.pdf', '.xlsx', '.docx', '.txt'],
                alertas: ['Archivos con datos sensibles', 'Archivos sin clasificar']
              }
            ]
          },
          puntosMax: 60
        },
        {
          id: 'motor_retencion_automatizado',
          titulo: 'Motor de Pol\u00edticas de Retenci\u00f3n',
          contenido: `
            <h3>⚙️ Motor de Automatizaci\u00f3n de Pol\u00edticas</h3>
            
            <h4>Definici\u00f3n de Reglas Declarativas</h4>
            <div style="background: #fff3e0; padding: 20px; border-radius: 8px;">
              <p><strong>Requisito del Manual:</strong> "El sistema debe permitir al DPO o al administrador definir pol\u00edticas de retenci\u00f3n de forma declarativa"</p>
              
              <p><em>Ejemplo del manual:</em> "Para todos los datos en la categor\u00eda 'Curr\u00edculums No Seleccionados', aplicar un per\u00edodo de retenci\u00f3n de 180 d\u00edas desde la fecha de creaci\u00f3n"</p>
            </div>
            
            <h4>Configuraci\u00f3n de Pol\u00edticas:</h4>
            <div style="background: #263238; color: #aed581; padding: 20px; border-radius: 8px; font-family: monospace;">
              <pre>
{
  "politica_id": "RRHH_CV_NO_SELECCIONADOS",
  "nombre": "Curr\u00edculums No Seleccionados",
  "descripcion": "CVs de candidatos que no fueron contratados",
  "condiciones": {
    "categoria_datos": "curriculos",
    "subcategoria": "no_seleccionados",
    "area_responsable": "RRHH"
  },
  "retencion": {
    "periodo": 180,
    "unidad": "dias",
    "fecha_referencia": "fecha_creacion"
  },
  "accion_vencimiento": {
    "tipo": "eliminacion_fisica",
    "metodo": "borrado_seguro",
    "confirmacion_requerida": true
  },
  "notificaciones": {
    "aviso_previo": 30,  // d\u00edas antes del vencimiento
    "destinatarios": ["dpo@empresa.cl", "rrhh@empresa.cl"]
  },
  "logs": {
    "auditoria_completa": true,
    "detalles_requeridos": [
      "que_dato_elimino",
      "cuando_elimino", 
      "quien_autorizo",
      "politica_aplicada",
      "metodo_utilizado"
    ]
  }
}
              </pre>
            </div>
            
            <h4>Motor de Ejecuci\u00f3n Automatizada:</h4>
            <p>Seg\u00fan el manual, el sistema debe incluir un motor de automatizaci\u00f3n que se ejecute peri\u00f3dicamente:</p>
            
            <div style="background: #e8f5e9; padding: 15px; border-radius: 8px;">
              <h5>1. Identificar Registros Vencidos</h5>
              <ul>
                <li>Cron job o worker de Celery ejecut\u00e1ndose diariamente</li>
                <li>Query a la BD para encontrar datos que excedieron su per\u00edodo</li>
                <li>Aplicaci\u00f3n de reglas de negocio complejas</li>
              </ul>
            </div>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px;">
              <h5>2. Ejecutar Acci\u00f3n Definida</h5>
              <ul>
                <li><strong>Eliminaci\u00f3n Segura:</strong> Invocar API en sistema origen para borrado f\u00edsico</li>
                <li><strong>Anonimizaci\u00f3n:</strong> Aplicar script que reemplace identificadores personales</li>
                <li><strong>Archivo:</strong> Mover a almacenamiento de largo plazo</li>
              </ul>
            </div>
            
            <div style="background: #fff3e0; padding: 15px; border-radius: 8px;">
              <h5>3. Registro de Auditor\u00eda</h5>
              <ul>
                <li>Cada acci\u00f3n debe registrarse en logs inmutables</li>
                <li>Incluir qu\u00e9 dato se elimin\u00f3, cu\u00e1ndo y en base a qu\u00e9 pol\u00edtica</li>
                <li>Hash criptogr\u00e1fico para garantizar inmutabilidad</li>
                <li>Timestamping para evidencia legal</li>
              </ul>
            </div>
          `,
          implementacion_practica: {
            tipo: 'codigo_motor',
            lenguaje: 'Python',
            codigo: `
# Motor de Pol\u00edticas de Retenci\u00f3n
from datetime import datetime, timedelta
import json
import hashlib
import logging

class MotorRetencion:
    def __init__(self, db_connection, logger):
        self.db = db_connection
        self.logger = logger
        
    def ejecutar_politicas_diarias(self):
        """Ejecuta todas las pol\u00edticas de retenci\u00f3n configuradas"""
        politicas = self.cargar_politicas_activas()
        
        for politica in politicas:
            try:
                registros_vencidos = self.identificar_vencidos(politica)
                
                if registros_vencidos:
                    self.procesar_vencimientos(politica, registros_vencidos)
                    
            except Exception as e:
                self.logger.error(f"Error procesando pol\u00edtica {politica['id']}: {e}")
    
    def identificar_vencidos(self, politica):
        """Identifica registros que han excedido su per\u00edodo de retenci\u00f3n"""
        query = f"""
        SELECT * FROM {politica['tabla']} 
        WHERE {politica['campo_fecha']} < %s 
        AND categoria = %s
        AND estado_retencion != 'procesado'
        """
        
        fecha_limite = datetime.now() - timedelta(days=politica['retencion']['periodo'])
        
        cursor = self.db.cursor()
        cursor.execute(query, (fecha_limite, politica['categoria']))
        return cursor.fetchall()
    
    def procesar_vencimientos(self, politica, registros):
        """Procesa los registros vencidos seg\u00fan la pol\u00edtica"""
        for registro in registros:
            if politica['accion'] == 'eliminacion_fisica':
                self.eliminar_fisicamente(registro, politica)
            elif politica['accion'] == 'anonimizacion':
                self.anonimizar_registro(registro, politica)
            
            # Registrar en logs inmutables
            self.registrar_auditoria(registro, politica)
    
    def eliminar_fisicamente(self, registro, politica):
        """Elimina f\u00edsicamente el registro de la BD"""
        query = f"DELETE FROM {politica['tabla']} WHERE id = %s"
        cursor = self.db.cursor()
        cursor.execute(query, (registro['id'],))
        self.db.commit()
    
    def registrar_auditoria(self, registro, politica):
        """Registra la acci\u00f3n en logs inmutables"""
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'accion': politica['accion'],
            'registro_id': registro['id'],
            'politica_aplicada': politica['id'],
            'hash_registro': hashlib.sha256(str(registro).encode()).hexdigest()
        }
        
        # Insertar en tabla de logs inmutables
        cursor = self.db.cursor()
        cursor.execute(
            "INSERT INTO audit_logs (entry_data, hash_entry) VALUES (%s, %s)",
            (json.dumps(log_entry), hashlib.sha256(json.dumps(log_entry).encode()).hexdigest())
        )
        self.db.commit()
            `,
            ejercicio: {
              texto: 'Configura una pol\u00edtica de retenci\u00f3n para videos de vigilancia (30 d\u00edas)',
              solucion_esperada: {
                categoria: 'videos_vigilancia',
                periodo: 30,
                accion: 'eliminacion_fisica',
                notificacion_previa: 7
              }
            }
          },
          puntosMax: 80
        },
        {
          id: 'caso_biomasa_iot',
          titulo: 'Caso Pr\u00e1ctico: Monitoreo de Biomasa con IA',
          contenido: `
            <h3>🐟 Plantilla RAT para Industria Salmonera</h3>
            
            <p>Implementa el ejemplo completo del manual:</p>
            
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px;">
              <h4>Actividad: Monitoreo de salud y alimentaci\u00f3n de biomasa mediante IA</h4>
              <p><strong>ID de Actividad:</strong> PROD-001</p>
            </div>
            
            <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
              <tr style="background: #f5f5f5;">
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Campo del Registro</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Contenido Ejemplo</th>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Responsable del Proceso</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">Gerente de Producci\u00f3n</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Finalidad(es)</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">
                  \u2022 Optimizar la alimentaci\u00f3n<br/>
                  \u2022 Detectar tempranamente enfermedades<br/>
                  \u2022 Asegurar el bienestar animal<br/>
                  \u2022 Cumplir con normativas sanitarias
                </td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Base de Licitud</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">
                  \u2022 Inter\u00e9s leg\u00edtimo (eficiencia productiva y bienestar animal)<br/>
                  \u2022 Cumplimiento de obligaci\u00f3n legal (normativa sanitaria)
                </td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Categor\u00edas de Titulares</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">
                  No aplica directamente a personas naturales.<br/>
                  <em>Nota: Si los datos pueden vincularse a un operario espec\u00edfico, se convierte en dato personal.</em>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Categor\u00edas de Datos</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">
                  \u2022 Datos de sensores (O2, temperatura)<br/>
                  \u2022 Im\u00e1genes de video de los peces<br/>
                  \u2022 Datos de alimentaci\u00f3n<br/>
                  \u2022 Registros de mortalidad<br/>
                  <strong style="color: red;">IMPORTANTE:</strong> Si se vinculan a operario = dato personal
                </td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Sistemas Implicados</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">
                  \u2022 Sensores IoT<br/>
                  \u2022 Software de Acuicultura (ej. Mercatus AS)<br/>
                  \u2022 Plataforma de IA<br/>
                  \u2022 ERP (SAP)
                </td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Destinatarios</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">
                  <strong>Internos:</strong> Equipo de Producci\u00f3n, Veterinarios<br/>
                  <strong>Externos:</strong> SERNAPESCA (reportes agregados)
                </td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Transferencias Internacionales</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">
                  <strong style="color: red;">S\u00cd:</strong> A proveedor de plataforma de IA en EE.UU.<br/>
                  <em>Ver M\u00f3dulo 6 para garant\u00edas apropiadas</em>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Plazo de Conservaci\u00f3n</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">
                  \u2022 Datos brutos: 2 a\u00f1os<br/>
                  \u2022 Informes agregados: 10 a\u00f1os
                </td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Medidas de Seguridad</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">
                  \u2022 Cifrado de datos en tr\u00e1nsito y en reposo<br/>
                  \u2022 Control de acceso basado en roles (RBAC)<br/>
                  \u2022 Acceso restringido a la plataforma de IA
                </td>
              </tr>
            </table>
          `,
          implementacion_tecnica: {
            tipo: 'configuracion_completa',
            actividad: 'PROD-001',
            configuraciones: [
              {
                seccion: 'Integraci\u00f3n IoT',
                items: [
                  'Configurar APIs para recepci\u00f3n de datos de sensores',
                  'Implementar detecci\u00f3n de datos vinculables a personas',
                  'Establecer pol\u00edticas de retenci\u00f3n diferenciadas',
                  'Configurar alertas de transferencias internacionales'
                ]
              },
              {
                seccion: 'Cumplimiento Legal',
                items: [
                  'Validar base de licitud: inter\u00e9s leg\u00edtimo',
                  'Documentar garant\u00edas para transferencia a EE.UU.',
                  'Establecer procedimiento para reportes a SERNAPESCA',
                  'Configurar logs inmutables para auditor\u00eda'
                ]
              }
            ]
          },
          puntosMax: 70
        }
      ]
    },
    {
      id: 'retencion_eliminacion',
      titulo: '⏱️ Gestión de Retención y Eliminación',
      nivel: 'Avanzado',
      duracion: '25 minutos',
      puntos: 200,
      videoUrl: 'https://example.com/video5',
      descripcion: 'Domina las políticas de retención y procedimientos de eliminación segura',
      objetivos: [
        'Definir políticas de retención legales',
        'Implementar eliminación segura',
        'Configurar automatización',
        'Mantener logs de auditoría'
      ],
      pasos: [
        {
          id: 'principio_proporcionalidad',
          titulo: 'Principio de Limitación del Plazo',
          contenido: `
            <h3>⚖️ Principio de Proporcionalidad</h3>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px;">
              <p><strong>Artículo 7 - Ley 21.719:</strong></p>
              <p>"Los datos deben conservarse únicamente durante el tiempo necesario para los fines del tratamiento"</p>
            </div>

            <h4>📅 Plazos Legales en Chile:</h4>
            <table style="width: 100%; margin: 20px 0;">
              <tr style="background: #f5f5f5;">
                <th>Tipo de Documento</th>
                <th>Plazo Legal</th>
                <th>Base Legal</th>
              </tr>
              <tr>
                <td>Documentos tributarios</td>
                <td>6 años</td>
                <td>Código Tributario</td>
              </tr>
              <tr>
                <td>Documentos laborales</td>
                <td>2 años post-término</td>
                <td>Código del Trabajo</td>
              </tr>
              <tr>
                <td>Documentos previsionales</td>
                <td>30 años</td>
                <td>DL 3.500</td>
              </tr>
              <tr>
                <td>Registros médicos</td>
                <td>15 años</td>
                <td>Ley 20.584</td>
              </tr>
              <tr>
                <td>CVs no seleccionados</td>
                <td>6 meses (recomendado)</td>
                <td>Buena práctica</td>
              </tr>
            </table>
          `,
          quiz: {
            pregunta: '¿Cuánto tiempo debe conservar una empresa las facturas de clientes?',
            opciones: [
              '2 años',
              '5 años',
              '6 años',
              '10 años'
            ],
            respuesta_correcta: 2,
            explicacion: 'Las facturas son documentos tributarios: 6 años según Código Tributario'
          },
          puntosMax: 30
        },
        {
          id: 'definir_politicas',
          titulo: 'Definir Políticas de Retención',
          contenido: `
            <h3>📋 Crear Política de Retención</h3>
            <p>Define políticas para cada categoría de datos de AquaChile:</p>
          `,
          ejercicio: {
            tipo: 'politicas_retencion',
            categorias: [
              {
                nombre: 'Facturas de clientes',
                opciones_plazo: ['1 año', '3 años', '6 años', '10 años'],
                plazo_correcto: '6 años',
                justificacion_correcta: 'Obligación tributaria'
              },
              {
                nombre: 'Contratos laborales terminados',
                opciones_plazo: ['6 meses', '1 año', '2 años', '5 años'],
                plazo_correcto: '2 años',
                justificacion_correcta: 'Código del Trabajo'
              },
              {
                nombre: 'Videos de vigilancia',
                opciones_plazo: ['7 días', '30 días', '60 días', '1 año'],
                plazo_correcto: '30 días',
                justificacion_correcta: 'Seguridad y proporcionalidad'
              },
              {
                nombre: 'Logs de acceso sistemas',
                opciones_plazo: ['3 meses', '6 meses', '1 año', '2 años'],
                plazo_correcto: '1 año',
                justificacion_correcta: 'Auditoría de seguridad'
              },
              {
                nombre: 'Datos IoT de producción',
                opciones_plazo: ['6 meses', '1 año', '2 años', '5 años'],
                plazo_correcto: '2 años',
                justificacion_correcta: 'Trazabilidad y calidad'
              }
            ]
          },
          puntosMax: 50
        },
        {
          id: 'procedimiento_eliminacion',
          titulo: 'Procedimiento de Eliminación Segura',
          contenido: `
            <h3>🗑️ Métodos de Eliminación</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div style="background: #e8f5e9; padding: 15px; border-radius: 8px;">
                <h4>✅ Eliminación Segura</h4>
                <ul>
                  <li>Borrado físico en BD</li>
                  <li>Sobreescritura múltiple</li>
                  <li>Destrucción física de medios</li>
                  <li>Comando: DELETE + VACUUM</li>
                </ul>
              </div>
              
              <div style="background: #fff3e0; padding: 15px; border-radius: 8px;">
                <h4>🔄 Anonimización</h4>
                <ul>
                  <li>Reemplazo de identificadores</li>
                  <li>Generalización de datos</li>
                  <li>Agregación estadística</li>
                  <li>Proceso irreversible</li>
                </ul>
              </div>
            </div>

            <div style="background: #ffebee; padding: 15px; border-radius: 8px; margin-top: 15px;">
              <h4>⚠️ IMPORTANTE: Registro de Auditoría</h4>
              <p>Cada eliminación debe registrar:</p>
              <ul>
                <li>Qué dato se eliminó</li>
                <li>Cuándo se eliminó</li>
                <li>Quién autorizó</li>
                <li>Base legal/política aplicada</li>
                <li>Método utilizado</li>
              </ul>
            </div>
          `,
          simulacion: {
            tipo: 'eliminacion_practica',
            escenario: 'Han pasado 6 meses desde proceso de selección',
            datos_vencidos: [
              {
                tipo: 'CVs no seleccionados',
                cantidad: 45,
                accion_correcta: 'eliminar',
                metodo_correcto: 'Borrado físico'
              },
              {
                tipo: 'Exámenes médicos rechazados',
                cantidad: 12,
                accion_correcta: 'eliminar',
                metodo_correcto: 'Destrucción segura'
              },
              {
                tipo: 'Referencias laborales',
                cantidad: 30,
                accion_correcta: 'eliminar',
                metodo_correcto: 'Borrado físico'
              },
              {
                tipo: 'Estadísticas agregadas proceso',
                cantidad: 1,
                accion_correcta: 'mantener',
                metodo_correcto: 'Ya anonimizado'
              }
            ]
          },
          puntosMax: 60
        },
        {
          id: 'automatizacion',
          titulo: 'Automatización del Proceso',
          contenido: `
            <h3>🤖 Motor de Automatización</h3>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px;">
              <h4>Configuración del Sistema:</h4>
              <pre style="background: #263238; color: #aed581; padding: 15px; border-radius: 4px;">
# Política de Retención Automatizada
{
  "categoria": "CVs_no_seleccionados",
  "periodo_retencion": 180,  # días
  "accion_vencimiento": "eliminar",
  "metodo": "borrado_fisico",
  "notificar": ["dpo@empresa.cl"],
  "log_auditoria": true,
  "ejecucion": "diaria_02:00"
}
              </pre>
            </div>

            <h4>Proceso Automatizado:</h4>
            <ol>
              <li>🔍 Identificar registros vencidos (cron diario)</li>
              <li>✅ Validar política aplicable</li>
              <li>🗑️ Ejecutar eliminación/anonimización</li>
              <li>📝 Generar log inmutable</li>
              <li>📧 Notificar al DPO</li>
            </ol>
          `,
          configuracion: {
            tipo: 'setup_automatizacion',
            instruccion: 'Configura la automatización para estos casos:',
            casos: [
              {
                dato: 'Logs de acceso web',
                configuracion_correcta: {
                  retencion: '90 días',
                  accion: 'comprimir y archivar',
                  frecuencia: 'mensual'
                }
              },
              {
                dato: 'Emails marketing no abiertos',
                configuracion_correcta: {
                  retencion: '365 días',
                  accion: 'eliminar',
                  frecuencia: 'trimestral'
                }
              }
            ]
          },
          puntosMax: 60
        },
        {
          id: 'resumen_retencion',
          titulo: 'Resumen del Módulo',
          contenido: `
            <h3>🎓 Maestría en Retención y Eliminación</h3>
            
            <div style="background: #e8f5e9; padding: 20px; border-radius: 8px;">
              <h4>Competencias Adquiridas:</h4>
              <ul>
                <li>✅ Definir políticas basadas en obligaciones legales</li>
                <li>✅ Implementar eliminación segura</li>
                <li>✅ Configurar automatización</li>
                <li>✅ Mantener logs de auditoría inmutables</li>
                <li>✅ Cumplir principio de proporcionalidad</li>
              </ul>
            </div>

            <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin-top: 15px;">
              <h4>⚡ Próximo Nivel:</h4>
              <p>Continúa con "Evaluación de Impacto (DPIA)" para casos de alto riesgo</p>
            </div>
          `,
          resumen: true,
          puntosMax: 30
        }
      ]
    }
  ];

  // Funciones principales
  const iniciarEscenario = (escenario) => {
    setEscenarioActivo(escenario);
    setStepActual(0);
    setPuntuacion(0);
    setRespuestas({});
    setTiempoTranscurrido(0);
    setMostrarRetroalimentacion(false);
  };

  const siguientePaso = () => {
    if (stepActual < escenarioActivo.pasos.length - 1) {
      setStepActual(stepActual + 1);
    } else {
      finalizarEscenario();
    }
  };

  const pasoAnterior = () => {
    if (stepActual > 0) {
      setStepActual(stepActual - 1);
    }
  };

  const finalizarEscenario = () => {
    setMostrarRetroalimentacion(true);
    
    // Calcular puntuación final
    const puntuacionFinal = calcularPuntuacionTotal();
    
    // Otorgar logros
    const nuevosLogros = evaluarLogros(puntuacionFinal);
    setLogros([...logros, ...nuevosLogros]);
    
    // Guardar progreso (aquí iría la llamada al backend)
    guardarProgreso();
  };

  const calcularPuntuacionTotal = () => {
    // Lógica para calcular puntuación basada en respuestas
    return Object.values(respuestas).reduce((total, respuesta) => {
      return total + (respuesta.correcta ? respuesta.puntos : 0);
    }, 0);
  };

  const evaluarLogros = (puntuacion) => {
    const nuevosLogros = [];
    
    if (puntuacion >= escenarioActivo.puntos * 0.9) {
      nuevosLogros.push({
        id: 'maestria',
        nombre: 'Maestría en ' + escenarioActivo.titulo,
        icono: '🏆',
        descripcion: 'Completaste con excelencia'
      });
    }
    
    if (tiempoTranscurrido < 600) { // Menos de 10 minutos
      nuevosLogros.push({
        id: 'velocidad',
        nombre: 'Rápido y Preciso',
        icono: '⚡',
        descripcion: 'Completaste en tiempo récord'
      });
    }
    
    return nuevosLogros;
  };

  const guardarProgreso = () => {
    // Aquí iría la lógica para guardar en el backend
    console.log('Guardando progreso...', {
      escenario: escenarioActivo.id,
      puntuacion: puntuacion,
      tiempo: tiempoTranscurrido,
      respuestas: respuestas
    });
  };

  const reproducirVideo = (videoUrl) => {
    setVideoActual(videoUrl);
    setDialogVideo(true);
  };

  const formatearTiempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Renderizado del paso actual
  const renderPasoActual = () => {
    if (!escenarioActivo) return null;
    
    const paso = escenarioActivo.pasos[stepActual];
    
    return (
      <Fade in={true} timeout={500}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            {/* Header del paso */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                {paso.titulo}
              </Typography>
              <Chip 
                label={`Paso ${stepActual + 1} de ${escenarioActivo.pasos.length}`}
                color="primary"
                variant="outlined"
              />
            </Box>

            {/* Contenido HTML del paso */}
            {paso.contenido && (
              <Box 
                dangerouslySetInnerHTML={{ __html: paso.contenido }}
                sx={{ mb: 3 }}
              />
            )}

            {/* Pregunta de opción múltiple */}
            {paso.pregunta && (
              <Paper sx={{ p: 3, bgcolor: 'grey.50', mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {paso.pregunta.texto}
                </Typography>
                <FormControl component="fieldset">
                  {paso.pregunta.opciones.map((opcion) => (
                    <FormControlLabel
                      key={opcion.id}
                      control={
                        <Checkbox
                          checked={respuestas[paso.id]?.seleccion === opcion.id}
                          onChange={() => {
                            setRespuestas({
                              ...respuestas,
                              [paso.id]: {
                                seleccion: opcion.id,
                                correcta: opcion.correcto,
                                puntos: opcion.correcto ? paso.puntosMax : 0
                              }
                            });
                          }}
                        />
                      }
                      label={opcion.texto}
                    />
                  ))}
                </FormControl>
                
                {respuestas[paso.id] && mostrarRetroalimentacion && (
                  <Alert 
                    severity={respuestas[paso.id].correcta ? 'success' : 'error'}
                    sx={{ mt: 2 }}
                  >
                    {paso.pregunta.explicacion}
                  </Alert>
                )}
              </Paper>
            )}

            {/* Ejercicio tipo checklist */}
            {paso.ejercicio?.tipo === 'checklist' && (
              <Paper sx={{ p: 3, bgcolor: 'grey.50', mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Selecciona todas las opciones correctas:
                </Typography>
                <FormGroup>
                  {paso.ejercicio.items.map((item) => (
                    <FormControlLabel
                      key={item.id}
                      control={
                        <Checkbox
                          checked={respuestas[paso.id]?.[item.id] || false}
                          onChange={(e) => {
                            setRespuestas({
                              ...respuestas,
                              [paso.id]: {
                                ...respuestas[paso.id],
                                [item.id]: e.target.checked
                              }
                            });
                          }}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {item.texto}
                          {item.requerido && (
                            <Chip label="Requerido" size="small" color="error" />
                          )}
                        </Box>
                      }
                    />
                  ))}
                </FormGroup>
              </Paper>
            )}

            {/* Simulación de entrevista */}
            {paso.simulacion?.tipo === 'entrevista' && (
              <Paper sx={{ p: 3, bgcolor: 'grey.50', mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Avatar sx={{ width: 56, height: 56 }}>
                    {paso.simulacion.avatar}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {paso.simulacion.personaje}
                    </Typography>
                    <Typography variant="body1">
                      {/* Aquí iría el diálogo dinámico */}
                      "Hola, estoy aquí para ayudarte con el proceso de inventario de datos."
                    </Typography>
                  </Box>
                </Box>
                
                {/* Opciones de respuesta */}
                <Stack spacing={1}>
                  <Button variant="outlined" fullWidth sx={{ justifyContent: 'flex-start' }}>
                    Opción de respuesta 1
                  </Button>
                  <Button variant="outlined" fullWidth sx={{ justifyContent: 'flex-start' }}>
                    Opción de respuesta 2
                  </Button>
                </Stack>
              </Paper>
            )}

            {/* Resumen del paso */}
            {paso.resumen && (
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  ¡Excelente trabajo!
                </Typography>
                <Typography>
                  Has completado este escenario con {puntuacion} puntos.
                </Typography>
              </Alert>
            )}
          </CardContent>

          {/* Acciones del paso */}
          <CardActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
            <Button
              startIcon={<NavigateBefore />}
              onClick={pasoAnterior}
              disabled={stepActual === 0}
            >
              Anterior
            </Button>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              {modoTutorial && (
                <Button
                  startIcon={<Lightbulb />}
                  variant="outlined"
                  onClick={() => setMostrarRetroalimentacion(!mostrarRetroalimentacion)}
                >
                  {mostrarRetroalimentacion ? 'Ocultar' : 'Mostrar'} Pistas
                </Button>
              )}
              
              <Button
                endIcon={<NavigateNext />}
                variant="contained"
                onClick={siguientePaso}
              >
                {stepActual === escenarioActivo.pasos.length - 1 ? 'Finalizar' : 'Siguiente'}
              </Button>
            </Box>
          </CardActions>
        </Card>
      </Fade>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" gutterBottom sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Science /> Práctica Sandbox Profesional
              </Typography>
              <Typography variant="body1" sx={{ color: 'white', opacity: 0.9 }}>
                Escenarios reales basados en el Manual de Procedimientos - Ley 21.719
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <Chip 
                  icon={<Timer />}
                  label={`Tiempo: ${formatearTiempo(tiempoTranscurrido)}`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip 
                  icon={<EmojiEvents />}
                  label={`Puntos: ${puntuacion}`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip 
                  icon={<WorkspacePremium />}
                  label={`${logros.length} Logros`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Selector de dificultad */}
      {!escenarioActivo && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Selecciona tu nivel de experiencia:
            </Typography>
            <ToggleButtonGroup
              value={nivelDificultad}
              exclusive
              onChange={(e, val) => val && setNivelDificultad(val)}
              fullWidth
            >
              <ToggleButton value="principiante" color="success">
                <School sx={{ mr: 1 }} />
                Principiante
              </ToggleButton>
              <ToggleButton value="intermedio" color="warning">
                <Psychology sx={{ mr: 1 }} />
                Intermedio
              </ToggleButton>
              <ToggleButton value="avanzado" color="error">
                <AutoAwesome sx={{ mr: 1 }} />
                Avanzado
              </ToggleButton>
            </ToggleButtonGroup>
          </CardContent>
        </Card>
      )}

      {/* Lista de escenarios o escenario activo */}
      {!escenarioActivo ? (
        <Grid container spacing={3}>
          {escenarios
            .filter(e => {
              if (nivelDificultad === 'principiante') return e.nivel === 'Principiante';
              if (nivelDificultad === 'intermedio') return e.nivel === 'Intermedio';
              if (nivelDificultad === 'avanzado') return e.nivel === 'Avanzado';
              return true;
            })
            .map((escenario) => (
            <Grid item xs={12} md={6} key={escenario.id}>
              <Zoom in={true} style={{ transitionDelay: '100ms' }}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h5" gutterBottom>
                        {escenario.titulo}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip 
                          label={escenario.nivel}
                          size="small"
                          color={
                            escenario.nivel === 'Principiante' ? 'success' :
                            escenario.nivel === 'Intermedio' ? 'warning' : 'error'
                          }
                        />
                        <Chip 
                          label={`${escenario.puntos} pts`}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {escenario.descripcion}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Objetivos de aprendizaje:
                      </Typography>
                      <Stack spacing={0.5}>
                        {escenario.objetivos.map((objetivo, idx) => (
                          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircleOutline sx={{ fontSize: 16, color: 'success.main' }} />
                            <Typography variant="body2">
                              {objetivo}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Timer sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {escenario.duracion}
                      </Typography>
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<PlayArrow />}
                      onClick={() => iniciarEscenario(escenario)}
                    >
                      Iniciar Escenario
                    </Button>
                    {escenario.videoUrl && (
                      <IconButton
                        color="primary"
                        onClick={() => reproducirVideo(escenario.videoUrl)}
                      >
                        <VideoLibrary />
                      </IconButton>
                    )}
                  </CardActions>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box>
          {/* Progress bar */}
          <LinearProgress 
            variant="determinate" 
            value={(stepActual / escenarioActivo.pasos.length) * 100}
            sx={{ mb: 3, height: 8, borderRadius: 4 }}
          />
          
          {/* Contenido del paso actual */}
          {renderPasoActual()}
          
          {/* Botón para salir del escenario */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              startIcon={<RestartAlt />}
              onClick={() => {
                if (window.confirm('¿Seguro que quieres salir del escenario?')) {
                  setEscenarioActivo(null);
                  setStepActual(0);
                  setPuntuacion(0);
                  setRespuestas({});
                }
              }}
            >
              Salir del Escenario
            </Button>
          </Box>
        </Box>
      )}

      {/* Dialog para videos */}
      <Dialog 
        open={dialogVideo} 
        onClose={() => setDialogVideo(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Video Tutorial
        </DialogTitle>
        <DialogContent>
          <Box sx={{ position: 'relative', paddingTop: '56.25%', bgcolor: 'black' }}>
            <Typography 
              sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                color: 'white'
              }}
            >
              [Video Player - {videoActual}]
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogVideo(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de evaluación final */}
      <Dialog 
        open={dialogEvaluacion} 
        onClose={() => setDialogEvaluacion(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmojiEvents sx={{ color: 'warning.main' }} />
            Evaluación Completada
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h2" color="primary" gutterBottom>
              {puntuacion}
            </Typography>
            <Typography variant="h6" gutterBottom>
              Puntos Obtenidos
            </Typography>
            <Rating value={puntuacion / 20} readOnly size="large" sx={{ my: 2 }} />
            
            {logros.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Logros Desbloqueados:
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="center">
                  {logros.map((logro) => (
                    <Chip
                      key={logro.id}
                      icon={<EmojiEvents />}
                      label={logro.nombre}
                      color="warning"
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogEvaluacion(false)}>
            Cerrar
          </Button>
          <Button variant="contained" onClick={() => {
            setDialogEvaluacion(false);
            setEscenarioActivo(null);
          }}>
            Continuar Practicando
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PracticaSandboxCompleto;