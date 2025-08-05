import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  TextField,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Chat,
  Person,
  Timer,
  CheckCircle,
  Error,
  Lightbulb,
  Send,
  Help,
  Psychology,
  School,
  TipsAndUpdates,
  Refresh,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);

function SimulacionEntrevista() {
  const { area } = useParams();
  const [mensajes, setMensajes] = useState([]);
  const [preguntaActual, setPreguntaActual] = useState('');
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
  const [pistasUsadas, setPistasUsadas] = useState(0);
  const [dialogPista, setDialogPista] = useState(false);
  const [retroalimentacion, setRetroalimentacion] = useState(null);
  const [objetivosCompletados, setObjetivosCompletados] = useState([]);

  // Datos del personaje según área
  const personajes = {
    RRHH: {
      nombre: 'María González',
      cargo: 'Jefa de Recursos Humanos',
      empresa: 'Salmones del Pacífico S.A.',
      avatar: '👩‍💼',
      personalidad: 'Práctica y directa, pero muy ocupada',
      contexto: 'Maneja 450 empleados en 3 centros de cultivo',
      respuestas: {
        saludo: 'Hola, me dijeron que vienes por el tema de protección de datos. Tengo 30 minutos, ¿qué necesitas saber?',
        procesos: 'Bueno, principalmente hacemos reclutamiento y selección, gestión de nómina, capacitaciones obligatorias y evaluación de desempeño.',
        datos: 'Uy, manejamos de todo... CVs, contratos, liquidaciones, certificados médicos para los buzos, evaluaciones...',
        sistemas: 'Mira, te soy honesta, usamos varios sistemas. Un Excel para los CVs, el sistema de remuneraciones que es externo, y carpetas compartidas.',
        terceros: 'Claro, trabajamos con Previred, la Mutual, una empresa de selección para los cargos técnicos, y el laboratorio que hace los exámenes preocupacionales.',
      },
    },
    Produccion: {
      nombre: 'Pedro Martínez',
      cargo: 'Gerente de Producción',
      empresa: 'Salmones del Pacífico S.A.',
      avatar: '👨‍🔧',
      personalidad: 'Técnico, le gustan los detalles y la tecnología',
      contexto: 'Supervisa 3 centros con tecnología IoT avanzada',
      respuestas: {
        saludo: '¡Bienvenido! Me encanta que estemos trabajando en protección de datos. En producción usamos mucha tecnología.',
        procesos: 'Monitoreamos la biomasa 24/7, controlamos la alimentación automática, hacemos trazabilidad sanitaria y reportamos a SERNAPESCA.',
        datos: 'Los sensores registran todo: temperatura, oxígeno, GPS de las jaulas... Ah, y los operarios fichan con biométrico cuando entran al centro.',
        sistemas: 'Tenemos el software AquaManager que es noruego, sensores IoT conectados a la nube, y planillas para los registros manuales.',
        terceros: 'El proveedor del software está en Noruega, los datos van a servidores en AWS, y compartimos reportes con SERNAPESCA y el laboratorio de análisis.',
      },
    },
  };

  const personaje = personajes[area] || personajes.RRHH;

  const objetivos = [
    { id: 1, texto: 'Identificar los procesos principales del área', completado: false },
    { id: 2, texto: 'Descubrir qué tipos de datos personales manejan', completado: false },
    { id: 3, texto: 'Mapear los sistemas donde se almacenan', completado: false },
    { id: 4, texto: 'Identificar con quién comparten información', completado: false },
  ];

  const preguntasSugeridas = [
    { categoria: 'Procesos', pregunta: '¿Cuáles son las principales funciones de tu área?' },
    { categoria: 'Datos', pregunta: '¿Qué información de personas manejan en esos procesos?' },
    { categoria: 'Sistemas', pregunta: '¿Dónde guardan toda esa información?' },
    { categoria: 'Terceros', pregunta: '¿Comparten información con empresas externas?' },
  ];

  const enviarPregunta = () => {
    if (!preguntaActual.trim()) return;

    // Agregar pregunta del usuario
    const nuevoPregunta = {
      tipo: 'usuario',
      contenido: preguntaActual,
      timestamp: new Date(),
    };
    
    setMensajes([...mensajes, nuevoPregunta]);

    // Simular respuesta del personaje
    setTimeout(() => {
      const respuesta = analizarPregunta(preguntaActual);
      const nuevoMensaje = {
        tipo: 'personaje',
        contenido: respuesta.texto,
        timestamp: new Date(),
      };
      
      setMensajes(prev => [...prev, nuevoMensaje]);
      
      // Actualizar objetivos si corresponde
      if (respuesta.objetivo) {
        completarObjetivo(respuesta.objetivo);
      }

      // Mostrar retroalimentación
      if (respuesta.retroalimentacion) {
        setRetroalimentacion(respuesta.retroalimentacion);
        setTimeout(() => setRetroalimentacion(null), 5000);
      }
    }, 1000);

    setPreguntaActual('');
  };

  const analizarPregunta = (pregunta) => {
    const preguntaLower = pregunta.toLowerCase();
    
    // Análisis de calidad de la pregunta
    if (preguntaLower.includes('base de datos') || preguntaLower.includes('sistemas')) {
      return {
        texto: personaje.respuestas.sistemas,
        objetivo: 3,
        retroalimentacion: {
          tipo: 'warning',
          mensaje: 'Obtuviste información, pero recuerda: es mejor preguntar por procesos primero',
        },
      };
    }
    
    if (preguntaLower.includes('funcion') || preguntaLower.includes('proceso') || preguntaLower.includes('actividad')) {
      return {
        texto: personaje.respuestas.procesos,
        objetivo: 1,
        retroalimentacion: {
          tipo: 'success',
          mensaje: '¡Excelente! Empezaste preguntando por los procesos, no por los sistemas',
        },
      };
    }
    
    if (preguntaLower.includes('información') || preguntaLower.includes('datos')) {
      return {
        texto: personaje.respuestas.datos,
        objetivo: 2,
      };
    }
    
    if (preguntaLower.includes('compart') || preguntaLower.includes('tercer') || preguntaLower.includes('extern')) {
      return {
        texto: personaje.respuestas.terceros,
        objetivo: 4,
      };
    }
    
    // Respuesta genérica
    return {
      texto: 'Mmm, no estoy segura de entender tu pregunta. ¿Podrías ser más específico?',
      retroalimentacion: {
        tipo: 'info',
        mensaje: 'Tip: Pregunta por procesos, datos que manejan, o con quién comparten información',
      },
    };
  };

  const completarObjetivo = (objetivoId) => {
    if (!objetivosCompletados.includes(objetivoId)) {
      setObjetivosCompletados([...objetivosCompletados, objetivoId]);
    }
  };

  const mostrarPista = () => {
    setPistasUsadas(pistasUsadas + 1);
    setDialogPista(true);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Panel principal de chat */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header del chat */}
            <CardContent sx={{ pb: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ width: 56, height: 56, fontSize: '2rem', mr: 2 }}>
                    {personaje.avatar}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{personaje.nombre}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {personaje.cargo} • {personaje.empresa}
                    </Typography>
                  </Box>
                </Box>
                <Box textAlign="right">
                  <Chip 
                    icon={<Timer />} 
                    label={`${tiempoTranscurrido} min`}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </CardContent>

            <Divider />

            {/* Área de mensajes */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
              {/* Mensaje inicial */}
              <MotionPaper
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                sx={{ p: 2, mb: 2, bgcolor: 'grey.100' }}
              >
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {personaje.nombre} • hace 1 minuto
                </Typography>
                <Typography>{personaje.respuestas.saludo}</Typography>
              </MotionPaper>

              {/* Mensajes del chat */}
              {mensajes.map((mensaje, idx) => (
                <MotionPaper
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  sx={{
                    p: 2,
                    mb: 2,
                    bgcolor: mensaje.tipo === 'usuario' ? 'primary.light' : 'grey.100',
                    color: mensaje.tipo === 'usuario' ? 'white' : 'text.primary',
                    ml: mensaje.tipo === 'usuario' ? 'auto' : 0,
                    maxWidth: '70%',
                  }}
                >
                  <Typography variant="body2" sx={{ opacity: 0.8 }} gutterBottom>
                    {mensaje.tipo === 'usuario' ? 'Tú' : personaje.nombre}
                  </Typography>
                  <Typography>{mensaje.contenido}</Typography>
                </MotionPaper>
              ))}

              {/* Retroalimentación */}
              {retroalimentacion && (
                <Alert 
                  severity={retroalimentacion.tipo}
                  onClose={() => setRetroalimentacion(null)}
                  sx={{ mb: 2 }}
                >
                  {retroalimentacion.mensaje}
                </Alert>
              )}
            </Box>

            {/* Input de pregunta */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  placeholder="Escribe tu pregunta..."
                  value={preguntaActual}
                  onChange={(e) => setPreguntaActual(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && enviarPregunta()}
                  variant="outlined"
                  size="small"
                />
                <Button
                  variant="contained"
                  onClick={enviarPregunta}
                  disabled={!preguntaActual.trim()}
                >
                  <Send />
                </Button>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Panel lateral */}
        <Grid item xs={12} md={4}>
          {/* Objetivos */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Objetivos de la Entrevista
              </Typography>
              <List>
                {objetivos.map((objetivo) => (
                  <ListItem key={objetivo.id} disablePadding>
                    <ListItemIcon>
                      {objetivosCompletados.includes(objetivo.id) ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Error color="disabled" />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={objetivo.texto}
                      sx={{
                        textDecoration: objetivosCompletados.includes(objetivo.id) 
                          ? 'line-through' 
                          : 'none',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
              <LinearProgress 
                variant="determinate" 
                value={(objetivosCompletados.length / objetivos.length) * 100}
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>

          {/* Preguntas sugeridas */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Psychology sx={{ verticalAlign: 'middle', mr: 1 }} />
                Preguntas Sugeridas
              </Typography>
              <List>
                {preguntasSugeridas.map((sugerencia, idx) => (
                  <ListItem 
                    key={idx}
                    button
                    onClick={() => setPreguntaActual(sugerencia.pregunta)}
                  >
                    <ListItemText
                      primary={sugerencia.pregunta}
                      secondary={sugerencia.categoria}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Ayuda y pistas */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Help sx={{ verticalAlign: 'middle', mr: 1 }} />
                Ayuda
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="body2">
                  Pistas disponibles: {3 - pistasUsadas}/3
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={mostrarPista}
                  disabled={pistasUsadas >= 3}
                  startIcon={<Lightbulb />}
                >
                  Usar Pista
                </Button>
              </Box>
              <Alert severity="info">
                <Typography variant="caption">
                  Recuerda: Pregunta por procesos y actividades, no por sistemas técnicos.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog de pista */}
      <Dialog open={dialogPista} onClose={() => setDialogPista(false)}>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <TipsAndUpdates sx={{ mr: 2, color: 'warning.main' }} />
            Pista #{pistasUsadas}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography paragraph>
            {pistasUsadas === 1 && 
              'Empieza preguntando "¿Cuáles son las principales funciones de tu área?". Esto te dará una visión general de los procesos.'}
            {pistasUsadas === 2 && 
              'Una vez que sepas los procesos, pregunta específicamente qué información de personas necesitan para cada uno.'}
            {pistasUsadas === 3 && 
              'No olvides preguntar con quién comparten información. Los terceros son una parte clave del mapeo de datos.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogPista(false)}>Entendido</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SimulacionEntrevista;