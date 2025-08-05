import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  PlayCircle,
  CheckCircle,
  ExpandMore,
  Lightbulb,
  Quiz,
  VideoLibrary,
  MenuBook,
  NavigateNext,
  NavigateBefore,
  EmojiEvents,
} from '@mui/icons-material';
import Confetti from 'react-confetti';

function ModuloCapacitacion() {
  const { moduloId } = useParams();
  const navigate = useNavigate();
  const [leccionActual, setLeccionActual] = useState(0);
  const [respuestaQuiz, setRespuestaQuiz] = useState('');
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [moduloCompletado, setModuloCompletado] = useState(false);

  // Contenido del módulo (ejemplo para MOD-001)
  const modulo = {
    id: 'MOD-001',
    titulo: 'Introducción a la Protección de Datos',
    descripcion: 'Fundamentos legales y conceptos básicos de la Ley N° 21.719',
    lecciones: [
      {
        id: 1,
        titulo: '¿Por qué proteger los datos personales?',
        tipo: 'teoria',
        duracion: '15 min',
        contenido: {
          introduccion: 'En la era digital, los datos personales se han convertido en uno de los activos más valiosos. Cada día, generamos y compartimos información que puede revelar aspectos íntimos de nuestra vida.',
          secciones: [
            {
              titulo: 'El valor de los datos',
              contenido: 'Los datos personales tienen valor económico y social. Las empresas los usan para personalizar servicios, pero también pueden ser mal utilizados.',
              ejemplo: '📱 Caso real: Una app de salud vendió datos de usuarios a aseguradoras, que luego negaron cobertura basándose en esa información.',
            },
            {
              titulo: 'Riesgos del mal manejo',
              contenido: 'Las filtraciones de datos pueden causar desde molestias menores hasta graves daños económicos y psicológicos.',
              ejemplo: '🚨 En 2023, una empresa chilena filtró datos de 5 millones de clientes, incluyendo RUT y datos financieros.',
            },
          ],
          conceptos_clave: [
            'Dato personal: Cualquier información que identifique o haga identificable a una persona',
            'Privacidad: Derecho fundamental protegido por la Constitución',
            'Autodeterminación informativa: Tu derecho a controlar qué se hace con tus datos',
          ],
        },
      },
      {
        id: 2,
        titulo: 'La Ley 21.719: Un cambio de paradigma',
        tipo: 'video',
        duracion: '10 min',
        contenido: {
          video_descripcion: 'Video explicativo sobre los principales cambios que trae la nueva ley',
          puntos_clave: [
            'Cambio de opt-out a opt-in: Ahora se necesita consentimiento previo',
            'Nuevos derechos: Portabilidad, supresión, oposición',
            'Sanciones: Hasta 5000 UTM para empresas grandes',
            'Obligación de tener un DPO en ciertos casos',
          ],
          transcripcion_resumen: 'La Ley 21.719 moderniza completamente el marco de protección de datos en Chile, alineándolo con estándares internacionales como el GDPR europeo.',
        },
      },
      {
        id: 3,
        titulo: 'Quiz: Conceptos Fundamentales',
        tipo: 'quiz',
        duracion: '5 min',
        contenido: {
          instrucciones: 'Responde las siguientes preguntas para evaluar tu comprensión',
          preguntas: [
            {
              id: 'q1',
              pregunta: '¿Qué es un dato personal según la Ley 21.719?',
              opciones: [
                'Solo el RUT y el nombre de una persona',
                'Cualquier información que identifique o haga identificable a una persona natural',
                'Únicamente información sensible como datos de salud',
                'Información que esté disponible públicamente en internet',
              ],
              respuesta_correcta: 1,
              explicacion: 'La ley define dato personal de forma amplia: incluye cualquier información que permita identificar a una persona, directa o indirectamente.',
            },
            {
              id: 'q2',
              pregunta: '¿Cuál es el cambio más importante en el consentimiento?',
              opciones: [
                'Ya no se necesita consentimiento',
                'El consentimiento puede ser tácito',
                'Se pasa de opt-out a opt-in (consentimiento previo y expreso)',
                'Solo se necesita para datos sensibles',
              ],
              respuesta_correcta: 2,
              explicacion: 'Ahora debes obtener consentimiento ANTES de recopilar datos, no puedes asumir que la persona está de acuerdo.',
            },
          ],
        },
      },
    ],
  };

  const leccion = modulo.lecciones[leccionActual];

  const handleQuizSubmit = () => {
    setMostrarResultado(true);
    // En un quiz real, aquí validarías las respuestas
  };

  const handleSiguienteLeccion = () => {
    if (leccionActual < modulo.lecciones.length - 1) {
      setLeccionActual(leccionActual + 1);
      setMostrarResultado(false);
      setRespuestaQuiz('');
    } else {
      setModuloCompletado(true);
    }
  };

  return (
    <Box>
      {moduloCompletado && <Confetti />}
      
      {/* Header del módulo */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs>
            <Typography variant="h4" fontWeight={600}>
              {modulo.titulo}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {modulo.descripcion}
            </Typography>
          </Grid>
          <Grid item>
            <Box textAlign="center">
              <Typography variant="h6" color="primary">
                {leccionActual + 1} / {modulo.lecciones.length}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(leccionActual + 1) / modulo.lecciones.length * 100}
                sx={{ width: 100, mt: 1 }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Navegación de lecciones */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={leccionActual} orientation="horizontal">
            {modulo.lecciones.map((lec, index) => (
              <Step key={lec.id}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: index <= leccionActual ? 'primary.main' : 'grey.300',
                        color: 'white',
                      }}
                    >
                      {lec.tipo === 'teoria' && <MenuBook />}
                      {lec.tipo === 'video' && <VideoLibrary />}
                      {lec.tipo === 'quiz' && <Quiz />}
                    </Box>
                  )}
                >
                  <Typography variant="body2">{lec.titulo}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {lec.duracion}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Contenido de la lección */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              {/* Contenido según tipo de lección */}
              {leccion.tipo === 'teoria' && (
                <Box>
                  <Typography variant="h5" gutterBottom fontWeight={600}>
                    {leccion.titulo}
                  </Typography>
                  
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                      {leccion.contenido.introduccion}
                    </Typography>
                  </Alert>

                  {leccion.contenido.secciones.map((seccion, idx) => (
                    <Accordion key={idx} defaultExpanded={idx === 0}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="h6">{seccion.titulo}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography paragraph>
                          {seccion.contenido}
                        </Typography>
                        {seccion.ejemplo && (
                          <Paper sx={{ p: 2, bgcolor: 'warning.light', bgcolor: 'warning.50' }}>
                            <Typography variant="body2">
                              <strong>Ejemplo:</strong> {seccion.ejemplo}
                            </Typography>
                          </Paper>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}

              {leccion.tipo === 'video' && (
                <Box>
                  <Typography variant="h5" gutterBottom fontWeight={600}>
                    {leccion.titulo}
                  </Typography>
                  
                  <Paper 
                    sx={{ 
                      height: 400, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      bgcolor: 'grey.100',
                      mb: 3,
                    }}
                  >
                    <Box textAlign="center">
                      <VideoLibrary sx={{ fontSize: 80, color: 'grey.400' }} />
                      <Typography variant="h6" color="text.secondary">
                        Simulación de Video
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        En producción aquí se mostraría el video educativo
                      </Typography>
                    </Box>
                  </Paper>

                  <Typography variant="h6" gutterBottom>
                    Puntos clave del video:
                  </Typography>
                  <List>
                    {leccion.contenido.puntos_clave.map((punto, idx) => (
                      <ListItem key={idx}>
                        <CheckCircle sx={{ mr: 2, color: 'success.main' }} />
                        <ListItemText primary={punto} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {leccion.tipo === 'quiz' && (
                <Box>
                  <Typography variant="h5" gutterBottom fontWeight={600}>
                    {leccion.titulo}
                  </Typography>
                  
                  <Alert severity="info" sx={{ mb: 3 }}>
                    {leccion.contenido.instrucciones}
                  </Alert>

                  {leccion.contenido.preguntas.map((pregunta, idx) => (
                    <Paper key={pregunta.id} sx={{ p: 3, mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Pregunta {idx + 1}: {pregunta.pregunta}
                      </Typography>
                      
                      <FormControl component="fieldset">
                        <RadioGroup
                          value={respuestaQuiz}
                          onChange={(e) => setRespuestaQuiz(e.target.value)}
                        >
                          {pregunta.opciones.map((opcion, opIdx) => (
                            <FormControlLabel
                              key={opIdx}
                              value={opIdx.toString()}
                              control={<Radio />}
                              label={opcion}
                              disabled={mostrarResultado}
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>

                      {mostrarResultado && (
                        <Alert 
                          severity={parseInt(respuestaQuiz) === pregunta.respuesta_correcta ? 'success' : 'error'}
                          sx={{ mt: 2 }}
                        >
                          <Typography variant="body2">
                            {parseInt(respuestaQuiz) === pregunta.respuesta_correcta 
                              ? '¡Correcto! ' 
                              : 'Incorrecto. '}
                            {pregunta.explicacion}
                          </Typography>
                        </Alert>
                      )}
                    </Paper>
                  ))}

                  {!mostrarResultado && (
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleQuizSubmit}
                      disabled={!respuestaQuiz}
                    >
                      Verificar Respuesta
                    </Button>
                  )}
                </Box>
              )}

              {/* Botones de navegación */}
              <Box display="flex" justifyContent="space-between" mt={4}>
                <Button
                  startIcon={<NavigateBefore />}
                  disabled={leccionActual === 0}
                  onClick={() => setLeccionActual(leccionActual - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="contained"
                  endIcon={<NavigateNext />}
                  onClick={handleSiguienteLeccion}
                  disabled={leccion.tipo === 'quiz' && !mostrarResultado}
                >
                  {leccionActual === modulo.lecciones.length - 1 ? 'Completar Módulo' : 'Siguiente'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel lateral */}
        <Grid item xs={12} md={4}>
          {leccion.tipo === 'teoria' && leccion.contenido.conceptos_clave && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Lightbulb sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Conceptos Clave
                </Typography>
                <List>
                  {leccion.contenido.conceptos_clave.map((concepto, idx) => (
                    <ListItem key={idx} disablePadding sx={{ mb: 2 }}>
                      <ListItemText 
                        primary={concepto.split(':')[0]}
                        secondary={concepto.split(':')[1]}
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tu Progreso
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Lecciones completadas
                </Typography>
                <Typography variant="h4" color="primary">
                  {leccionActual} / {modulo.lecciones.length}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(leccionActual / modulo.lecciones.length) * 100}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog de módulo completado */}
      <Dialog open={moduloCompletado} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box textAlign="center">
            <EmojiEvents sx={{ fontSize: 60, color: 'warning.main' }} />
            <Typography variant="h4" sx={{ mt: 2 }}>
              ¡Módulo Completado!
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box textAlign="center">
            <Typography variant="body1" paragraph>
              Has completado exitosamente el módulo "{modulo.titulo}".
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'white' }}>
              <Typography variant="h6">
                +50 puntos de experiencia
              </Typography>
              <Typography variant="body2">
                Logro desbloqueado: Fundamentos Sólidos
              </Typography>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            onClick={() => navigate('/dashboard')}
          >
            Volver al Dashboard
          </Button>
          <Button variant="outlined">
            Siguiente Módulo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ModuloCapacitacion;