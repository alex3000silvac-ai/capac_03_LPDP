import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Book,
  CheckCircle,
  Info,
  ArrowForward,
  ExpandMore,
  Quiz,
  Assignment,
  Timeline,
  Gavel,
  Security,
  People,
} from '@mui/icons-material';
import VideoAnimado from '../components/VideoAnimado';
import { getVideoData } from '../data/videosAnimados';

function ConceptosBasicos() {
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState({});
  
  // Obtener datos del video para este módulo
  const videoData = getVideoData('conceptos_basicos');

  const pasos = [
    {
      label: 'Video: Conceptos Fundamentales',
      descripcion: 'Comprende los términos básicos de la LPDP'
    },
    {
      label: 'Profundización Teórica',
      descripcion: 'Definiciones detalladas y ejemplos'
    },
    {
      label: 'Casos Prácticos',
      descripcion: 'Aplicación en situaciones reales'
    },
    {
      label: 'Evaluación de Conocimientos',
      descripcion: 'Confirma tu comprensión'
    }
  ];

  const definicionesDetalladas = [
    {
      termino: "Titular de Datos",
      definicion: "La persona natural a quien se refieren los datos personales",
      detalles: "Es la persona física identificada o identificable cuyos datos están siendo tratados. Tiene derechos específicos sobre sus datos.",
      ejemplos: ["Un empleado de la empresa", "Un cliente que compra productos", "Un proveedor persona natural"],
      derechos: ["Derecho de acceso", "Derecho de rectificación", "Derecho de cancelación", "Derecho de oposición", "Derecho de portabilidad"]
    },
    {
      termino: "Responsable del Tratamiento",
      definicion: "Quien determina los fines y medios del tratamiento de datos personales",
      detalles: "Es la persona natural o jurídica que decide qué datos tratar, para qué y cómo hacerlo. Tiene la responsabilidad principal del cumplimiento.",
      ejemplos: ["La empresa que contrata empleados", "El hospital que atiende pacientes", "La tienda que registra clientes"],
      obligaciones: ["Implementar medidas de seguridad", "Informar a los titulares", "Respetar los derechos", "Mantener el RAT actualizado"]
    },
    {
      termino: "Encargado del Tratamiento",
      definicion: "Quien trata datos personales por cuenta del responsable",
      detalles: "Actúa por instrucciones del responsable y no puede usar los datos para fines propios. Debe garantizar la seguridad.",
      ejemplos: ["Empresa de nómina externa", "Proveedor de servicios en la nube", "Empresa de marketing contratada"],
      requisitos: ["Contrato específico", "Instrucciones claras", "Medidas de seguridad", "Confidencialidad"]
    },
    {
      termino: "Tratamiento",
      definicion: "Cualquier operación realizada sobre datos personales",
      detalles: "Incluye desde la recolección hasta la eliminación de datos. Cada operación debe tener una base legal.",
      ejemplos: ["Recoger datos en un formulario", "Almacenar en una base de datos", "Enviar por email", "Eliminar información"],
      operaciones: ["Recolección", "Registro", "Organización", "Estructuración", "Conservación", "Adaptación", "Consulta", "Utilización", "Comunicación", "Supresión"]
    }
  ];

  const casosCompletos = [
    {
      titulo: "Caso 1: Proceso de Reclutamiento",
      descripcion: "Empresa busca nuevo contador",
      actores: {
        titular: "Juan Pérez (postulante)",
        responsable: "Empresa ABC S.A.",
        encargado: "Consultora de RRHH Externa"
      },
      datos: ["CV", "Carta de presentación", "Referencias laborales", "Exámenes preocupacionales"],
      tratamientos: ["Recepción CV", "Evaluación candidatos", "Verificación referencias", "Almacenamiento temporal"],
      bases_legales: ["Consentimiento del postulante", "Medidas precontractuales"],
      resultado: "Juan no es seleccionado. Sus datos deben eliminarse en 6 meses."
    },
    {
      titulo: "Caso 2: Compra con Tarjeta de Crédito", 
      descripcion: "Cliente compra productos online",
      actores: {
        titular: "María González (cliente)",
        responsable: "Tienda Online SPA",
        encargado: "Procesador de pagos (WebPay)"
      },
      datos: ["Nombre", "RUT", "Dirección", "Datos tarjeta", "Historial compras"],
      tratamientos: ["Registro cliente", "Procesamiento pago", "Envío producto", "Facturación"],
      bases_legales: ["Ejecución del contrato", "Obligación legal (facturación)"],
      resultado: "Datos se conservan 6 años por obligaciones tributarias."
    }
  ];

  const preguntasEvaluacion = [
    {
      pregunta: "¿Quién es el responsable del tratamiento cuando una empresa usa Gmail para sus emails?",
      opciones: [
        "Google (porque proporciona el servicio)",
        "La empresa (porque decide usar el servicio)",
        "Ambos son responsables",
        "Ninguno, no hay tratamiento de datos"
      ],
      correcta: 1,
      explicacion: "La empresa es responsable porque decide tratar los emails de sus empleados usando Gmail. Google sería encargado del tratamiento."
    },
    {
      pregunta: "¿Cuál de estos NO es un derecho de los titulares según la LPDP?",
      opciones: [
        "Derecho de acceso",
        "Derecho de portabilidad", 
        "Derecho de monetización",
        "Derecho de oposición"
      ],
      correcta: 2,
      explicacion: "El derecho de monetización no existe en la LPDP. Los derechos son: acceso, rectificación, cancelación, oposición y portabilidad."
    },
    {
      pregunta: "¿Qué requiere el tratamiento de datos sensibles?",
      opciones: [
        "Solo informar al titular",
        "Consentimiento expreso del titular",
        "Autorización de la empresa",
        "Ningún requisito especial"
      ],
      correcta: 1,
      explicacion: "Los datos sensibles requieren consentimiento expreso del titular, más específico que el consentimiento regular."
    }
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleComplete = () => {
    setCompleted({
      ...completed,
      [activeStep]: true,
    });
    handleNext();
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #4CAF50 0%, #45A049 100%)' }}>
        <CardContent>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
            <Book /> Conceptos Básicos de Protección de Datos
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, color: 'white' }}>
            Fundamentos teóricos y prácticos de la Ley N° 21.719
          </Typography>
          <Alert severity="info" sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.15)', color: 'white' }}>
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              💡 <strong>Tip:</strong> Los conceptos aquí explicados como <strong>Titular, Responsable, 
              Encargado, Tratamiento, Consentimiento</strong> están desarrollados en profundidad en nuestro 
              <strong>Glosario LPDP completo</strong> con ejemplos adicionales y referencias legales específicas.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Stepper del curso */}
      <Stepper activeStep={activeStep} orientation="vertical">
        {pasos.map((paso, index) => (
          <Step key={paso.label} completed={completed[index]}>
            <StepLabel>
              <Typography variant="h6">{paso.label}</Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" paragraph>
                {paso.descripcion}
              </Typography>

              {/* Video de conceptos básicos */}
              {index === 0 && (
                <Box sx={{ mb: 3 }}>
                  <VideoAnimado 
                    frames={videoData.frames}
                    titulo={videoData.titulo}
                    duracionFrame={videoData.configuracion.duracionFrame}
                    autoPlay={videoData.configuracion.autoPlay}
                    loop={videoData.configuracion.loop}
                    gradiente={videoData.configuracion.gradiente}
                  />
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Este video explica los actores principales del sistema de protección de datos. 
                      Duración: {Math.round((videoData.frames.length * videoData.configuracion.duracionFrame) / 1000)} segundos.
                    </Typography>
                  </Alert>
                </Box>
              )}

              {/* Definiciones detalladas */}
              {index === 1 && (
                <Box sx={{ mb: 3 }}>
                  {definicionesDetalladas.map((def, idx) => (
                    <Accordion key={idx} sx={{ mb: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="h6" color="primary">
                          {def.termino}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body1" paragraph sx={{ fontWeight: 600 }}>
                          {def.definicion}
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {def.detalles}
                        </Typography>
                        
                        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                          Ejemplos:
                        </Typography>
                        <List dense>
                          {def.ejemplos.map((ejemplo, i) => (
                            <ListItem key={i}>
                              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                              <ListItemText primary={ejemplo} />
                            </ListItem>
                          ))}
                        </List>

                        {def.derechos && (
                          <>
                            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                              Derechos:
                            </Typography>
                            <List dense>
                              {def.derechos.map((derecho, i) => (
                                <ListItem key={i}>
                                  <ListItemIcon><Gavel color="primary" /></ListItemIcon>
                                  <ListItemText primary={derecho} />
                                </ListItem>
                              ))}
                            </List>
                          </>
                        )}

                        {def.obligaciones && (
                          <>
                            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                              Obligaciones:
                            </Typography>
                            <List dense>
                              {def.obligaciones.map((obligacion, i) => (
                                <ListItem key={i}>
                                  <ListItemIcon><Assignment color="warning" /></ListItemIcon>
                                  <ListItemText primary={obligacion} />
                                </ListItem>
                              ))}
                            </List>
                          </>
                        )}

                        {def.requisitos && (
                          <>
                            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                              Requisitos:
                            </Typography>
                            <List dense>
                              {def.requisitos.map((requisito, i) => (
                                <ListItem key={i}>
                                  <ListItemIcon><Security color="info" /></ListItemIcon>
                                  <ListItemText primary={requisito} />
                                </ListItem>
                              ))}
                            </List>
                          </>
                        )}

                        {def.operaciones && (
                          <>
                            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                              Operaciones de Tratamiento:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {def.operaciones.map((operacion, i) => (
                                <Chip key={i} label={operacion} size="small" />
                              ))}
                            </Box>
                          </>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}

              {/* Casos prácticos */}
              {index === 2 && (
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  {casosCompletos.map((caso, idx) => (
                    <Grid item xs={12} key={idx}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom color="primary">
                            {caso.titulo}
                          </Typography>
                          <Typography variant="body2" paragraph>
                            {caso.descripcion}
                          </Typography>

                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Paper sx={{ p: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Actores Involucrados:
                                </Typography>
                                <List dense>
                                  <ListItem>
                                    <ListItemIcon><People color="primary" /></ListItemIcon>
                                    <ListItemText 
                                      primary="Titular"
                                      secondary={caso.actores.titular}
                                    />
                                  </ListItem>
                                  <ListItem>
                                    <ListItemIcon><Assignment color="secondary" /></ListItemIcon>
                                    <ListItemText 
                                      primary="Responsable"
                                      secondary={caso.actores.responsable}
                                    />
                                  </ListItem>
                                  {caso.actores.encargado && (
                                    <ListItem>
                                      <ListItemIcon><Timeline color="info" /></ListItemIcon>
                                      <ListItemText 
                                        primary="Encargado"
                                        secondary={caso.actores.encargado}
                                      />
                                    </ListItem>
                                  )}
                                </List>
                              </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <Paper sx={{ p: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Datos Tratados:
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                  {caso.datos.map((dato, i) => (
                                    <Chip key={i} label={dato} size="small" color="info" />
                                  ))}
                                </Box>

                                <Typography variant="subtitle2" gutterBottom>
                                  Tratamientos:
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                  {caso.tratamientos.map((tratamiento, i) => (
                                    <Chip key={i} label={tratamiento} size="small" color="secondary" />
                                  ))}
                                </Box>

                                <Typography variant="subtitle2" gutterBottom>
                                  Bases Legales:
                                </Typography>
                                <List dense>
                                  {caso.bases_legales.map((base, i) => (
                                    <ListItem key={i}>
                                      <ListItemIcon><Gavel color="success" /></ListItemIcon>
                                      <ListItemText primary={base} />
                                    </ListItem>
                                  ))}
                                </List>
                              </Paper>
                            </Grid>

                            <Grid item xs={12}>
                              <Alert severity="success">
                                <Typography variant="body2">
                                  <strong>Resultado:</strong> {caso.resultado}
                                </Typography>
                              </Alert>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Evaluación */}
              {index === 3 && (
                <Box sx={{ mb: 3 }}>
                  {preguntasEvaluacion.map((pregunta, idx) => (
                    <Card key={idx} sx={{ mb: 3 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Pregunta {idx + 1}
                        </Typography>
                        <Typography variant="body1" paragraph>
                          {pregunta.pregunta}
                        </Typography>
                        
                        <Grid container spacing={1}>
                          {pregunta.opciones.map((opcion, i) => (
                            <Grid item xs={12} md={6} key={i}>
                              <Paper 
                                sx={{ 
                                  p: 2, 
                                  cursor: 'pointer',
                                  '&:hover': { bgcolor: 'action.hover' }
                                }}
                              >
                                <Typography variant="body2">
                                  {String.fromCharCode(65 + i)}. {opcion}
                                </Typography>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>

                        <Alert severity="info" sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            <strong>Respuesta correcta:</strong> {String.fromCharCode(65 + pregunta.correcta)}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Explicación:</strong> {pregunta.explicacion}
                          </Typography>
                        </Alert>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}

              {/* Botones de navegación */}
              <Box sx={{ mb: 1 }}>
                <Button
                  variant="contained"
                  onClick={index === pasos.length - 1 ? handleComplete : handleNext}
                  sx={{ mt: 1, mr: 1 }}
                >
                  {index === pasos.length - 1 ? 'Finalizar' : 'Continuar'}
                </Button>
                <Button
                  disabled={index === 0}
                  onClick={handleBack}
                  sx={{ mt: 1, mr: 1 }}
                >
                  Anterior
                </Button>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {/* Mensaje final */}
      {activeStep === pasos.length && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              ¡Excelente!
            </Typography>
            <Typography variant="body1" paragraph>
              Has completado el módulo de Conceptos Básicos de Protección de Datos.
              Ahora comprendes los actores principales y sus responsabilidades.
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => window.history.back()}
              startIcon={<ArrowForward />}
            >
              Continuar con el siguiente módulo
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default ConceptosBasicos;