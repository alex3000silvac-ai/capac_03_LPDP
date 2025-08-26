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

function ModuloCapacitacion() {
  const { moduloId } = useParams();
  const navigate = useNavigate();
  const [leccionActual, setLeccionActual] = useState(0);
  const [respuestasQuiz, setRespuestasQuiz] = useState({});
  const [resultadosQuiz, setResultadosQuiz] = useState({});
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
            'Dato personal: Cualquier información que identifique o haga identificable a una persona (Art. 2 lit. a Ley 21.719)',
            'Privacidad: Derecho fundamental protegido por la Constitución Art. 19 N°4',
            'Autodeterminación informativa: Derecho a controlar qué se hace con tus datos',
            'Principio de responsabilidad proactiva: Las empresas deben demostrar cumplimiento',
            'Datos sensibles especiales en Chile: Situación socioeconómica (Art. 2 lit. g)',
          ],
          marco_legal: {
            ley_principal: 'Ley N° 21.719 que modifica la Ley N° 19.628',
            articulos_clave: [
              'Art. 4: Principios del tratamiento de datos',
              'Art. 8: Bases de licitud del tratamiento',
              'Art. 25: Registro de Actividades de Tratamiento (RAT)',
              'Art. 27: Evaluación de Impacto (EIPD)',
              'Art. 29: Notificación de brechas'
            ],
            agencia_reguladora: 'Agencia de Protección de Datos Personales (en proceso de creación)',
            sanciones_maximas: 'Hasta 20,000 UTM para infracciones gravísimas'
          },
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
        titulo: 'Evaluación Profesional: Análisis Jurídico LPDP',
        tipo: 'quiz',
        duracion: '15 min',
        contenido: {
          instrucciones: 'Evaluación de nivel profesional para DPOs, abogados e ingenieros. Analiza cada caso aplicando los principios de la Ley 21.719.',
          preguntas: [
            {
              id: 'q1',
              pregunta: 'Una empresa chilena utiliza una plataforma de IA estadounidense para analizar patrones de consumo de sus clientes, incluyendo datos de geolocalización y historial de compras. ¿Cuál es la principal consideración legal bajo la Ley 21.719?',
              opciones: [
                'Solo necesita informar en su política de privacidad que usa IA',
                'Debe realizar una evaluación de impacto (EIPD) y establecer garantías específicas para la transferencia internacional',
                'Es suficiente con obtener consentimiento genérico para el tratamiento de datos',
                'No aplica la ley chilena porque el procesamiento ocurre en EE.UU.',
              ],
              respuesta_correcta: 1,
              explicacion: 'Art. 5 y 25: Transferencias internacionales requieren garantías específicas. El uso de IA para perfilamiento constituye tratamiento automatizado que requiere EIPD según Art. 28.',
              nivel: 'profesional',
              area_derecho: 'Transferencias internacionales y decisiones automatizadas',
            },
            {
              id: 'q2', 
              pregunta: 'Un hospital implementa un sistema IoT para monitorear signos vitales de pacientes en tiempo real. Los datos se almacenan en servidores locales pero se envían alertas automáticas a médicos externos por WhatsApp Business. ¿Cuál es el marco legal aplicable?',
              opciones: [
                'Solo se requiere consentimiento del paciente para el tratamiento médico',
                'WhatsApp Business está fuera del alcance de la LPDP por ser una plataforma externa',
                'Se requiere: base legal específica (Art. 8), medidas de seguridad reforzadas (Art. 26), y contrato de encargo con WhatsApp/Meta',
                'Es suficiente con el secreto médico tradicional, la LPDP no aplica a datos de salud',
              ],
              respuesta_correcta: 2,
              explicacion: 'Datos de salud son especialmente protegidos. Requiere base legal específica, medidas técnicas apropiadas, y formalización del encargo de tratamiento con terceros procesadores.',
              nivel: 'profesional', 
              area_derecho: 'Datos sensibles de salud y encargos de tratamiento',
            },
            {
              id: 'q3',
              pregunta: 'Una fintech chilena evalúa solicitudes de crédito usando algoritmos que consideran historial crediticio, datos de redes sociales, y patrones de gasto. Un cliente solicita explicación sobre el rechazo automático de su crédito. ¿Qué derechos específicos aplican según la Ley 21.719?',
              opciones: [
                'Solo el derecho de acceso a sus datos personales',
                'Derecho a no ser objeto de decisiones automatizadas (Art. 13) + derecho a explicación + revisión humana del algoritmo',
                'La fintech puede negarse porque son secretos comerciales',
                'Solo aplica si el cliente puede demostrar discriminación',
              ],
              respuesta_correcta: 1,
              explicacion: 'Art. 13: Derecho específico a no ser objeto de decisiones automatizadas que produzcan efectos jurídicos. Incluye derecho a explicación de la lógica aplicada y revisión humana.',
              nivel: 'profesional',
              area_derecho: 'Decisiones automatizadas y perfilamiento',
            },
            {
              id: 'q4',
              pregunta: 'Una empresa salmonera implementa sensores IoT que rastrean ubicación de trabajadores por seguridad. Los datos se procesan con IA para optimizar rutas y detectar zonas de riesgo. ¿Cuál es el análisis de proporcionalidad requerido?',
              opciones: [
                'Es válido automáticamente por ser tema de seguridad laboral',
                'Debe aplicar test de proporcionalidad: finalidad legítima + necesidad + minimización + medidas menos intrusivas',
                'Solo requiere informar a los trabajadores en el contrato laboral',
                'La geolocalización de trabajadores está prohibida en Chile',
              ],
              respuesta_correcta: 1,
              explicacion: 'Art. 4 (principio de proporcionalidad): Debe evaluarse si existen medios menos intrusivos para la seguridad laboral. Geolocalización continua requiere justificación específica y límites temporales.',
              nivel: 'profesional',
              area_derecho: 'Proporcionalidad en contexto laboral e IoT',
            },
          ],
        },
      },
    ],
  };

  const leccion = modulo.lecciones[leccionActual];

  const handleQuizSubmit = (preguntaId) => {
    setResultadosQuiz(prev => ({
      ...prev,
      [preguntaId]: true
    }));
  };

  const handleRespuestaChange = (preguntaId, respuesta) => {
    setRespuestasQuiz(prev => ({
      ...prev,
      [preguntaId]: respuesta
    }));
  };

  const handleSiguienteLeccion = () => {
    if (leccionActual < modulo.lecciones.length - 1) {
      setLeccionActual(leccionActual + 1);
      setResultadosQuiz({});
      setRespuestasQuiz({});
    } else {
      setModuloCompletado(true);
    }
  };

  const canContinue = () => {
    if (leccion.tipo !== 'quiz') return true;
    
    // Para quiz, verificar que todas las preguntas hayan sido respondidas y mostradas
    const todasRespondidas = leccion.contenido.preguntas.every(p => 
      respuestasQuiz[p.id] !== undefined && resultadosQuiz[p.id]
    );
    return todasRespondidas;
  };

  return (
    <Box>
      
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

      {/* Información del Instructor y Alcance */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
          👨‍⚖️ Instructor: Abogado Especialista en Protección de Datos
        </Typography>
        <Typography variant="body2" fontWeight={600} color="info.dark">
          📖 Este curso cubre únicamente el Capítulo 3: Inventario y Mapeo de Datos del programa completo de LPDP
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
          💡 <strong>Tip:</strong> Todos los conceptos jurídicos y técnicos utilizados en este módulo 
          (<strong>DPO, Bases de Licitud, EIPD, Transferencia Internacional, Autodeterminación Informativa</strong>) 
          están detallados en nuestro <strong>Glosario LPDP completo</strong> con más de 75 términos 
          especializados y referencias normativas chilenas.
        </Typography>
      </Alert>

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
                    <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                      🎓 <strong>Tip profesional:</strong> Los términos técnicos avanzados en estos casos 
                      (<strong>EIPD, Perfilamiento, Decisiones Automatizadas, Proporcionalidad, 
                      Encargo de Tratamiento</strong>) están definidos con precisión jurídica en nuestro 
                      <strong>Glosario LPDP</strong> junto con casos prácticos y análisis comparativo 
                      con normativas internacionales.
                    </Typography>
                  </Alert>

                  {leccion.contenido.preguntas.map((pregunta, idx) => (
                    <Paper key={pregunta.id} sx={{ p: 3, mb: 3, border: pregunta.nivel === 'profesional' ? '2px solid' : '1px solid', borderColor: pregunta.nivel === 'profesional' ? 'primary.main' : 'divider' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                          Caso {idx + 1}: {pregunta.pregunta}
                        </Typography>
                        {pregunta.nivel === 'profesional' && (
                          <Chip 
                            label="NIVEL PROFESIONAL" 
                            color="primary" 
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        )}
                      </Box>
                      
                      {pregunta.area_derecho && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                          <Typography variant="caption">
                            <strong>Área de Derecho:</strong> {pregunta.area_derecho}
                          </Typography>
                        </Alert>
                      )}
                      
                      <FormControl component="fieldset" fullWidth>
                        <RadioGroup
                          value={respuestasQuiz[pregunta.id] || ''}
                          onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)}
                        >
                          {pregunta.opciones.map((opcion, opIdx) => (
                            <FormControlLabel
                              key={opIdx}
                              value={opIdx.toString()}
                              control={<Radio />}
                              label={opcion}
                              disabled={resultadosQuiz[pregunta.id]}
                              sx={{ mb: 1, alignItems: 'flex-start' }}
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>

                      {!resultadosQuiz[pregunta.id] && respuestasQuiz[pregunta.id] !== undefined && (
                        <Button
                          variant="contained"
                          onClick={() => handleQuizSubmit(pregunta.id)}
                          sx={{ mt: 2 }}
                        >
                          Verificar Respuesta {idx + 1}
                        </Button>
                      )}

                      {resultadosQuiz[pregunta.id] && (
                        <Alert 
                          severity={parseInt(respuestasQuiz[pregunta.id]) === pregunta.respuesta_correcta ? 'success' : 'error'}
                          sx={{ mt: 2 }}
                        >
                          <Typography variant="body2">
                            <strong>
                              {parseInt(respuestasQuiz[pregunta.id]) === pregunta.respuesta_correcta 
                                ? '✅ ¡Correcto! ' 
                                : '❌ Incorrecto. '}
                            </strong>
                            {pregunta.explicacion}
                          </Typography>
                        </Alert>
                      )}
                    </Paper>
                  ))}
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
                  disabled={!canContinue()}
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
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    📖 <strong>Tip:</strong> Estos conceptos clave como <strong>Dato Personal, 
                    Privacidad, Autodeterminación Informativa</strong> y otros términos fundamentales 
                    están desarrollados en profundidad en nuestro <strong>Glosario LPDP</strong> 
                    con ejemplos prácticos y jurisprudencia chilena.
                  </Typography>
                </Alert>
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