import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  LinearProgress,
  Button,
  Stack,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  Collapse,
  Fade,
  Zoom,
  Slide,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Replay,
  SkipNext,
  SkipPrevious,
  VolumeUp,
  Fullscreen,
  CheckCircle,
  RadioButtonUnchecked,
  Info,
  Warning,
  School,
  Group,
  Assignment,
  Search,
  Lock,
  Timer,
  AccountTree,
  ArrowForward,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const VideoEducativo = ({ videoId, onComplete }) => {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [showTranscript, setShowTranscript] = useState(false);

  // Contenido de los videos según el ID
  const videosContent = {
    conformacion_equipo: {
      titulo: 'Conformación del Equipo Multidisciplinario',
      duracion: 300, // 5 minutos en segundos
      slides: [
        {
          tiempo: 0,
          titulo: 'Introducción',
          contenido: (
            <Box>
              <Typography variant="h4" gutterBottom>
                Conformación del Equipo Multidisciplinario
              </Typography>
              <Typography variant="body1" paragraph>
                Según la Ley 21.719, el DPO debe liderar un equipo con representantes 
                de todas las áreas que tratan datos personales.
              </Typography>
              <Alert severity="info">
                Este es el primer paso crítico para crear un RAT completo y efectivo.
              </Alert>
            </Box>
          ),
          audio: "Bienvenidos al módulo de conformación del equipo multidisciplinario...",
          duracion: 30
        },
        {
          tiempo: 30,
          titulo: 'Roles Clave',
          contenido: (
            <Box>
              <Typography variant="h5" gutterBottom>
                Miembros Esenciales del Equipo
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><Group color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="DPO - Líder del Equipo"
                    secondary="Coordina y supervisa todo el proceso de inventario"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Group color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="RRHH"
                    secondary="Datos de empleados, nómina, beneficios"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Group color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Finanzas"
                    secondary="Datos crediticios, tributarios, facturación"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Group color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="TI"
                    secondary="Sistemas, bases de datos, seguridad"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Group color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Legal"
                    secondary="Contratos, obligaciones, cumplimiento"
                  />
                </ListItem>
              </List>
            </Box>
          ),
          audio: "El equipo debe incluir representantes de todas las áreas clave...",
          duracion: 60
        },
        {
          tiempo: 90,
          titulo: 'Responsabilidades',
          contenido: (
            <Box>
              <Typography variant="h5" gutterBottom>
                Responsabilidades de Cada Miembro
              </Typography>
              <Stepper orientation="vertical" activeStep={-1}>
                <Step expanded>
                  <StepLabel>Participar en sesiones de levantamiento</StepLabel>
                  <StepContent>
                    <Typography variant="body2">
                      Asistir a todas las reuniones y talleres programados
                    </Typography>
                  </StepContent>
                </Step>
                <Step expanded>
                  <StepLabel>Identificar actividades de tratamiento</StepLabel>
                  <StepContent>
                    <Typography variant="body2">
                      Documentar TODOS los procesos que involucren datos personales
                    </Typography>
                  </StepContent>
                </Step>
                <Step expanded>
                  <StepLabel>Proporcionar información detallada</StepLabel>
                  <StepContent>
                    <Typography variant="body2">
                      Entregar documentación completa y actualizada
                    </Typography>
                  </StepContent>
                </Step>
                <Step expanded>
                  <StepLabel>Validar documentación</StepLabel>
                  <StepContent>
                    <Typography variant="body2">
                      Revisar y aprobar el RAT de su área
                    </Typography>
                  </StepContent>
                </Step>
                <Step expanded>
                  <StepLabel>Mantener actualizado</StepLabel>
                  <StepContent>
                    <Typography variant="body2">
                      Informar cambios y nuevas actividades
                    </Typography>
                  </StepContent>
                </Step>
              </Stepper>
            </Box>
          ),
          audio: "Cada miembro del equipo tiene responsabilidades específicas...",
          duracion: 90
        },
        {
          tiempo: 180,
          titulo: 'Ejemplo Práctico',
          contenido: (
            <Box>
              <Typography variant="h5" gutterBottom>
                Caso: Empresa Salmonera AquaChile
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'white', mb: 2 }}>
                <Typography variant="h6">Equipo Conformado:</Typography>
              </Paper>
              <Stack spacing={2}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    DPO: María González
                  </Typography>
                  <Typography variant="body2">
                    Lidera el proceso y coordina con todas las áreas
                  </Typography>
                </Paper>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    RRHH: Juan Pérez
                  </Typography>
                  <Typography variant="body2">
                    Gestión de 500 empleados fijos y 200 temporales
                  </Typography>
                </Paper>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Producción: Ana Silva
                  </Typography>
                  <Typography variant="body2">
                    Datos de IoT, trazabilidad, calidad
                  </Typography>
                </Paper>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    TI: Carlos Rojas
                  </Typography>
                  <Typography variant="body2">
                    15 sistemas, 5 bases de datos, cloud AWS
                  </Typography>
                </Paper>
              </Stack>
            </Box>
          ),
          audio: "Veamos un ejemplo práctico de una empresa salmonera...",
          duracion: 90
        },
        {
          tiempo: 270,
          titulo: 'Resumen',
          contenido: (
            <Box>
              <Typography variant="h5" gutterBottom>
                Puntos Clave para Recordar
              </Typography>
              <Stack spacing={2}>
                <Alert severity="success">
                  <strong>El DPO debe liderar el equipo</strong> - No puede ser delegado
                </Alert>
                <Alert severity="warning">
                  <strong>Incluir TODAS las áreas</strong> - Omitir áreas = RAT incompleto
                </Alert>
                <Alert severity="info">
                  <strong>Documentar responsabilidades</strong> - Cada miembro debe conocer su rol
                </Alert>
                <Alert severity="error">
                  <strong>Sin equipo = Sin cumplimiento</strong> - Es imposible hacer un RAT solo
                </Alert>
              </Stack>
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  ¡Felicitaciones! Has completado este módulo
                </Typography>
              </Box>
            </Box>
          ),
          audio: "Para resumir, recuerda estos puntos clave...",
          duracion: 30
        }
      ]
    },
    data_discovery: {
      titulo: 'Data Discovery - Mapeo Inicial',
      duracion: 360,
      slides: [
        {
          tiempo: 0,
          titulo: 'Metodología Correcta',
          contenido: (
            <Box>
              <Typography variant="h4" gutterBottom>
                Data Discovery: El Enfoque Correcto
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Paper sx={{ flex: 1, p: 2, bgcolor: 'error.light', color: 'white' }}>
                  <Typography variant="h6">❌ INCORRECTO</Typography>
                  <Typography variant="body1">
                    "¿Qué bases de datos tienen?"
                  </Typography>
                  <Typography variant="caption">
                    Enfoque técnico que omite procesos
                  </Typography>
                </Paper>
                <Paper sx={{ flex: 1, p: 2, bgcolor: 'success.light', color: 'white' }}>
                  <Typography variant="h6">✅ CORRECTO</Typography>
                  <Typography variant="body1">
                    "¿Qué actividades realizan con datos de personas?"
                  </Typography>
                  <Typography variant="caption">
                    Enfoque en procesos de negocio
                  </Typography>
                </Paper>
              </Box>
            </Box>
          ),
          duracion: 60
        },
        {
          tiempo: 60,
          titulo: 'Proceso de Entrevistas',
          contenido: (
            <Box>
              <Typography variant="h5" gutterBottom>
                Técnica de Entrevista Estructurada
              </Typography>
              <Stepper orientation="vertical" activeStep={2}>
                <Step>
                  <StepLabel>Preparación</StepLabel>
                  <StepContent>
                    <Typography>Revisar organigrama y procesos del área</Typography>
                  </StepContent>
                </Step>
                <Step>
                  <StepLabel>Introducción</StepLabel>
                  <StepContent>
                    <Typography>Explicar objetivo y confidencialidad</Typography>
                  </StepContent>
                </Step>
                <Step>
                  <StepLabel>Preguntas Abiertas</StepLabel>
                  <StepContent>
                    <Typography>"Cuénteme sobre su proceso completo..."</Typography>
                  </StepContent>
                </Step>
                <Step>
                  <StepLabel>Profundización</StepLabel>
                  <StepContent>
                    <Typography>"¿Qué información específica recopilan?"</Typography>
                  </StepContent>
                </Step>
                <Step>
                  <StepLabel>Validación</StepLabel>
                  <StepContent>
                    <Typography>Confirmar entendimiento y completitud</Typography>
                  </StepContent>
                </Step>
              </Stepper>
            </Box>
          ),
          duracion: 90
        },
        {
          tiempo: 150,
          titulo: 'Ejemplo: Entrevista RRHH',
          contenido: (
            <Box>
              <Typography variant="h5" gutterBottom>
                Simulación de Entrevista Real
              </Typography>
              <Paper sx={{ p: 3, bgcolor: 'grey.100' }}>
                <Box sx={{ mb: 2 }}>
                  <Chip label="DPO" color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1" component="span">
                    "¿Cuál es el proceso completo desde que reciben un CV hasta contratar?"
                  </Typography>
                </Box>
                <Box sx={{ mb: 2, ml: 4 }}>
                  <Chip label="RRHH" color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="body1" component="span">
                    "Recibimos CVs por email y portal web, los revisamos, hacemos entrevistas, 
                    pedimos exámenes médicos, verificamos antecedentes y contratamos."
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Chip label="DPO" color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1" component="span">
                    "¿Con quién comparten esta información?"
                  </Typography>
                </Box>
                <Box sx={{ ml: 4 }}>
                  <Chip label="RRHH" color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="body1" component="span">
                    "Con la Clínica San José para exámenes, VerificaChile para antecedentes, 
                    Previred para cotizaciones."
                  </Typography>
                </Box>
              </Paper>
              <Alert severity="success" sx={{ mt: 2 }}>
                <strong>Hallazgo:</strong> Identificamos 3 terceros que requieren contratos de encargo
              </Alert>
            </Box>
          ),
          duracion: 120
        },
        {
          tiempo: 270,
          titulo: 'Documentación RAT',
          contenido: (
            <Box>
              <Typography variant="h5" gutterBottom>
                Documentar en el RAT - Campos Obligatorios
              </Typography>
              <Paper sx={{ p: 2 }}>
                <List>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Nombre de Actividad"
                      secondary="Proceso de Reclutamiento y Selección"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Finalidades"
                      secondary="Evaluar idoneidad de candidatos"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Base de Licitud"
                      secondary="Medidas precontractuales"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Datos Sensibles"
                      secondary="Salud (exámenes), Situación socioeconómica"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Terceros"
                      secondary="Clínica, VerificaChile, Previred"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Retención"
                      secondary="No seleccionados: 6 meses"
                    />
                  </ListItem>
                </List>
              </Paper>
            </Box>
          ),
          duracion: 90
        }
      ]
    },
    clasificacion_sensibilidad: {
      titulo: 'Clasificación por Sensibilidad',
      duracion: 420,
      slides: [
        {
          tiempo: 0,
          titulo: 'Categorías según Ley 21.719',
          contenido: (
            <Box>
              <Typography variant="h4" gutterBottom>
                Clasificación de Datos Personales
              </Typography>
              <Stack spacing={2}>
                <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'white' }}>
                  <Typography variant="h6">Datos Comunes</Typography>
                  <Typography>Nombre, RUT, email, teléfono, dirección</Typography>
                </Paper>
                <Paper sx={{ p: 2, bgcolor: 'warning.light', color: 'white' }}>
                  <Typography variant="h6">Datos Sensibles</Typography>
                  <Typography>Salud, biométricos, ideológicos, vida sexual</Typography>
                </Paper>
                <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'white' }}>
                  <Typography variant="h6">⚠️ NOVEDAD CHILENA</Typography>
                  <Typography>SITUACIÓN SOCIOECONÓMICA es dato sensible</Typography>
                </Paper>
                <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'white' }}>
                  <Typography variant="h6">Datos NNA</Typography>
                  <Typography>Menores de edad - Régimen especial</Typography>
                </Paper>
              </Stack>
            </Box>
          ),
          duracion: 60
        },
        {
          tiempo: 60,
          titulo: 'Situación Socioeconómica',
          contenido: (
            <Box>
              <Typography variant="h4" gutterBottom color="error">
                ⚠️ EXCLUSIVO DE CHILE
              </Typography>
              <Alert severity="error" sx={{ mb: 2 }}>
                <strong>La situación socioeconómica es DATO SENSIBLE en Chile</strong>
                <br />
                Esto NO existe en GDPR europeo
              </Alert>
              <Typography variant="h6" gutterBottom>
                ¿Qué incluye?
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><Warning color="error" /></ListItemIcon>
                  <ListItemText 
                    primary="Nivel de ingresos / Salario"
                    secondary="Cualquier dato sobre remuneraciones"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Warning color="error" /></ListItemIcon>
                  <ListItemText 
                    primary="Score crediticio DICOM"
                    secondary="Evaluaciones de capacidad de pago"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Warning color="error" /></ListItemIcon>
                  <ListItemText 
                    primary="Historial crediticio"
                    secondary="Deudas, morosidad, comportamiento de pago"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Warning color="error" /></ListItemIcon>
                  <ListItemText 
                    primary="Patrimonio"
                    secondary="Bienes, propiedades, inversiones"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Warning color="error" /></ListItemIcon>
                  <ListItemText 
                    primary="Beneficios sociales"
                    secondary="Subsidios, bonos, ayudas estatales"
                  />
                </ListItem>
              </List>
            </Box>
          ),
          duracion: 120
        },
        {
          tiempo: 180,
          titulo: 'Ejemplos Prácticos',
          contenido: (
            <Box>
              <Typography variant="h5" gutterBottom>
                Clasifica estos datos correctamente:
              </Typography>
              <Stack spacing={2}>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>"Juan Pérez, RUT 12.345.678-9"</Typography>
                    <Chip label="COMÚN" color="success" />
                  </Box>
                </Paper>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>"Salario: $1.500.000"</Typography>
                    <Chip label="SENSIBLE" color="error" />
                  </Box>
                </Paper>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>"Score DICOM: 650 puntos"</Typography>
                    <Chip label="SENSIBLE" color="error" />
                  </Box>
                </Paper>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>"Licencia médica por COVID"</Typography>
                    <Chip label="SENSIBLE" color="error" />
                  </Box>
                </Paper>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>"Hijo menor: Pedro, 10 años"</Typography>
                    <Chip label="NNA" color="warning" />
                  </Box>
                </Paper>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>"Email: juan@empresa.cl"</Typography>
                    <Chip label="COMÚN" color="success" />
                  </Box>
                </Paper>
              </Stack>
            </Box>
          ),
          duracion: 120
        },
        {
          tiempo: 300,
          titulo: 'Implicancias Legales',
          contenido: (
            <Box>
              <Typography variant="h5" gutterBottom>
                Requisitos según tipo de dato
              </Typography>
              <Stack spacing={3}>
                <Paper sx={{ p: 3, border: '2px solid', borderColor: 'success.main' }}>
                  <Typography variant="h6" color="success.main">
                    Datos Comunes
                  </Typography>
                  <List>
                    <ListItem>• Consentimiento o base de licitud</ListItem>
                    <ListItem>• Información al titular</ListItem>
                    <ListItem>• Medidas de seguridad básicas</ListItem>
                  </List>
                </Paper>
                <Paper sx={{ p: 3, border: '2px solid', borderColor: 'error.main' }}>
                  <Typography variant="h6" color="error.main">
                    Datos Sensibles
                  </Typography>
                  <List>
                    <ListItem>• Consentimiento EXPLÍCITO y por escrito</ListItem>
                    <ListItem>• Justificación de necesidad</ListItem>
                    <ListItem>• Medidas de seguridad reforzadas</ListItem>
                    <ListItem>• Evaluación de impacto (DPIA)</ListItem>
                    <ListItem>• Cifrado obligatorio</ListItem>
                  </List>
                </Paper>
                <Paper sx={{ p: 3, border: '2px solid', borderColor: 'warning.main' }}>
                  <Typography variant="h6" color="warning.main">
                    Datos NNA
                  </Typography>
                  <List>
                    <ListItem>• Consentimiento de padres/tutores</ListItem>
                    <ListItem>• Interés superior del niño</ListItem>
                    <ListItem>• Lenguaje apropiado</ListItem>
                    <ListItem>• Restricciones especiales</ListItem>
                  </List>
                </Paper>
              </Stack>
            </Box>
          ),
          duracion: 120
        }
      ]
    },
    flujos_datos: {
      titulo: 'Documentación de Flujos de Datos',
      duracion: 480,
      slides: [
        {
          tiempo: 0,
          titulo: 'Tipos de Flujos',
          contenido: (
            <Box>
              <Typography variant="h4" gutterBottom>
                Mapeo de Flujos de Datos
              </Typography>
              <Typography variant="body1" paragraph>
                El inventario no es una lista estática, es un mapa dinámico de cómo 
                se mueven los datos en tu organización.
              </Typography>
              <Stack spacing={2}>
                <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
                  <Typography variant="h6">📊 Flujos Internos</Typography>
                  <Typography>Entre sistemas y departamentos de la empresa</Typography>
                </Paper>
                <Paper sx={{ p: 2, bgcolor: 'secondary.light', color: 'white' }}>
                  <Typography variant="h6">🤝 Flujos Externos</Typography>
                  <Typography>Hacia terceros, encargados y autoridades</Typography>
                </Paper>
                <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'white' }}>
                  <Typography variant="h6">🌍 Transferencias Internacionales</Typography>
                  <Typography>Datos que salen del país - Requieren garantías</Typography>
                </Paper>
              </Stack>
            </Box>
          ),
          duracion: 60
        },
        {
          tiempo: 60,
          titulo: 'Ejemplo: Flujo de Cliente',
          contenido: (
            <Box>
              <Typography variant="h5" gutterBottom>
                Flujo de datos de un cliente nuevo
              </Typography>
              <Box sx={{ position: 'relative', minHeight: 400 }}>
                {/* Simulación visual del flujo */}
                <Paper sx={{ position: 'absolute', top: 0, left: 0, p: 2, width: 180 }}>
                  <Typography variant="subtitle2">1. Web Form</Typography>
                  <Typography variant="caption">Nombre, RUT, Email</Typography>
                </Paper>
                <ArrowForward sx={{ position: 'absolute', top: 20, left: 200 }} />
                
                <Paper sx={{ position: 'absolute', top: 0, left: 250, p: 2, width: 180 }}>
                  <Typography variant="subtitle2">2. CRM</Typography>
                  <Typography variant="caption">+ Historial</Typography>
                </Paper>
                <ArrowForward sx={{ position: 'absolute', top: 20, left: 450 }} />
                
                <Paper sx={{ position: 'absolute', top: 0, left: 500, p: 2, width: 180 }}>
                  <Typography variant="subtitle2">3. ERP</Typography>
                  <Typography variant="caption">+ Facturación</Typography>
                </Paper>
                
                {/* Flujo externo */}
                <Paper sx={{ position: 'absolute', top: 150, left: 250, p: 2, width: 180, bgcolor: 'warning.light' }}>
                  <Typography variant="subtitle2">DICOM</Typography>
                  <Typography variant="caption">Verificación crediticia</Typography>
                </Paper>
                
                {/* Flujo a autoridad */}
                <Paper sx={{ position: 'absolute', top: 150, left: 500, p: 2, width: 180, bgcolor: 'info.light' }}>
                  <Typography variant="subtitle2">SII</Typography>
                  <Typography variant="caption">Factura electrónica</Typography>
                </Paper>
                
                {/* Flujo internacional */}
                <Paper sx={{ position: 'absolute', top: 300, left: 250, p: 2, width: 430, bgcolor: 'error.light', color: 'white' }}>
                  <Typography variant="subtitle2">AWS (Estados Unidos)</Typography>
                  <Typography variant="caption">Almacenamiento en cloud - Requiere cláusulas contractuales</Typography>
                </Paper>
              </Box>
            </Box>
          ),
          duracion: 120
        },
        {
          tiempo: 180,
          titulo: 'IoT en Salmoneras',
          contenido: (
            <Box>
              <Typography variant="h5" gutterBottom>
                Caso Especial: Datos IoT
              </Typography>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <strong>Pregunta clave:</strong> ¿Cuándo los datos IoT son personales?
              </Alert>
              <Typography variant="body1" paragraph>
                Respuesta: Cuando pueden vincularse a una persona específica
              </Typography>
              
              <Stack spacing={2}>
                <Paper sx={{ p: 2, bgcolor: 'success.light' }}>
                  <Typography variant="subtitle1">✅ NO es dato personal:</Typography>
                  <Typography variant="body2">
                    "Sensor #5: Temperatura 15°C a las 14:00"
                  </Typography>
                </Paper>
                <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'white' }}>
                  <Typography variant="subtitle1">❌ SÍ es dato personal:</Typography>
                  <Typography variant="body2">
                    "Operario Juan revisó jaula #5 a las 14:00 (GPS)"
                  </Typography>
                </Paper>
                <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'white' }}>
                  <Typography variant="subtitle1">❌ SÍ es dato personal:</Typography>
                  <Typography variant="body2">
                    "Usuario jperez alimentó peces con 50kg (sistema)"
                  </Typography>
                </Paper>
              </Stack>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                Si el dato IoT puede vincularse a un trabajador, debe incluirse en el RAT
              </Alert>
            </Box>
          ),
          duracion: 120
        },
        {
          tiempo: 300,
          titulo: 'Documentar Flujos',
          contenido: (
            <Box>
              <Typography variant="h5" gutterBottom>
                Plantilla de Documentación
              </Typography>
              <Paper sx={{ p: 3, bgcolor: 'grey.100' }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Actividad: Monitoreo IoT Centro de Cultivo
                </Typography>
                
                <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 600 }}>
                  Flujos Internos:
                </Typography>
                <List dense>
                  <ListItem>• Sensores → Plataforma IoT</ListItem>
                  <ListItem>• Plataforma IoT → Sistema Análisis</ListItem>
                  <ListItem>• Sistema Análisis → Dashboard</ListItem>
                  <ListItem>• Dashboard → Reportes Gerencia</ListItem>
                </List>
                
                <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 600 }}>
                  Flujos Externos:
                </Typography>
                <List dense>
                  <ListItem>• AWS (almacenamiento cloud)</ListItem>
                  <ListItem>• Microsoft Azure (procesamiento IA)</ListItem>
                  <ListItem>• SERNAPESCA (reportes obligatorios)</ListItem>
                </List>
                
                <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 600 }}>
                  Transferencias Internacionales:
                </Typography>
                <List dense>
                  <ListItem>
                    • Estados Unidos (AWS) - Cláusulas contractuales tipo
                  </ListItem>
                  <ListItem>
                    • Irlanda (Microsoft) - Decisión de adecuación UE
                  </ListItem>
                </List>
              </Paper>
            </Box>
          ),
          duracion: 180
        }
      ]
    },
    retencion_eliminacion: {
      titulo: 'Gestión de Retención y Eliminación',
      duracion: 300,
      slides: [
        {
          tiempo: 0,
          titulo: 'Principio de Proporcionalidad',
          contenido: (
            <Box>
              <Typography variant="h4" gutterBottom>
                Limitación del Plazo de Conservación
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>Artículo 7 - Ley 21.719:</strong><br />
                "Los datos deben conservarse únicamente durante el tiempo necesario para los fines del tratamiento"
              </Alert>
              <Typography variant="h6" gutterBottom>
                Plazos Legales en Chile:
              </Typography>
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
                    <TableRow>
                      <TableCell>Documentos tributarios</TableCell>
                      <TableCell>6 años</TableCell>
                      <TableCell>Código Tributario</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Documentos laborales</TableCell>
                      <TableCell>2 años post-término</TableCell>
                      <TableCell>Código del Trabajo</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Documentos previsionales</TableCell>
                      <TableCell>30 años</TableCell>
                      <TableCell>DL 3.500</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>CVs no seleccionados</TableCell>
                      <TableCell>6 meses</TableCell>
                      <TableCell>Buena práctica</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ),
          duracion: 90
        },
        {
          tiempo: 90,
          titulo: 'Procedimiento de Eliminación',
          contenido: (
            <Box>
              <Typography variant="h5" gutterBottom>
                Métodos de Eliminación Segura
              </Typography>
              <Stack spacing={2}>
                <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'white' }}>
                  <Typography variant="h6">🗑️ Eliminación Física</Typography>
                  <List dense>
                    <ListItem>• Borrado físico en base de datos</ListItem>
                    <ListItem>• Sobreescritura múltiple (7 pasadas)</ListItem>
                    <ListItem>• Destrucción física de medios</ListItem>
                    <ListItem>• Comando: DELETE + VACUUM</ListItem>
                  </List>
                </Paper>
                <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'white' }}>
                  <Typography variant="h6">🔄 Anonimización</Typography>
                  <List dense>
                    <ListItem>• Reemplazo de identificadores</ListItem>
                    <ListItem>• Generalización de datos</ListItem>
                    <ListItem>• Agregación estadística</ListItem>
                    <ListItem>• Proceso IRREVERSIBLE</ListItem>
                  </List>
                </Paper>
              </Stack>
              <Alert severity="error" sx={{ mt: 2 }}>
                <strong>IMPORTANTE:</strong> Cada eliminación debe registrarse en logs inmutables
              </Alert>
            </Box>
          ),
          duracion: 90
        },
        {
          tiempo: 180,
          titulo: 'Automatización',
          contenido: (
            <Box>
              <Typography variant="h5" gutterBottom>
                Motor de Automatización
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#263238' }}>
                <pre style={{ color: '#aed581', margin: 0 }}>
{`{
  "politica": {
    "categoria": "CVs_no_seleccionados",
    "periodo_retencion": 180,  // días
    "accion_vencimiento": "eliminar",
    "metodo": "borrado_fisico",
    "notificar": ["dpo@empresa.cl"],
    "log_auditoria": true,
    "ejecucion": "diaria_02:00"
  }
}`}
                </pre>
              </Paper>
              <Typography variant="h6" sx={{ mt: 2 }}>
                Proceso Automatizado:
              </Typography>
              <Stepper orientation="vertical" activeStep={-1}>
                <Step expanded>
                  <StepLabel>Identificar registros vencidos</StepLabel>
                </Step>
                <Step expanded>
                  <StepLabel>Validar política aplicable</StepLabel>
                </Step>
                <Step expanded>
                  <StepLabel>Ejecutar eliminación/anonimización</StepLabel>
                </Step>
                <Step expanded>
                  <StepLabel>Generar log inmutable</StepLabel>
                </Step>
                <Step expanded>
                  <StepLabel>Notificar al DPO</StepLabel>
                </Step>
              </Stepper>
            </Box>
          ),
          duracion: 120
        }
      ]
    }
  };

  // Efectos para simular reproducción
  useEffect(() => {
    let interval;
    if (playing && currentSlide < videosContent[videoId]?.slides.length) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          const currentContent = videosContent[videoId];
          const currentSlideData = currentContent.slides[currentSlide];
          
          // Avanzar al siguiente slide si se alcanza el tiempo
          if (newTime >= currentSlideData.tiempo + currentSlideData.duracion) {
            if (currentSlide < currentContent.slides.length - 1) {
              setCurrentSlide(currentSlide + 1);
            } else {
              setPlaying(false);
              if (onComplete) onComplete();
            }
          }
          
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [playing, currentTime, currentSlide, videoId]);

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setCurrentSlide(0);
    setPlaying(false);
  };

  const handleNextSlide = () => {
    if (currentSlide < videosContent[videoId]?.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
      const nextSlideTime = videosContent[videoId].slides[currentSlide + 1].tiempo;
      setCurrentTime(nextSlideTime);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      const prevSlideTime = videosContent[videoId].slides[currentSlide - 1].tiempo;
      setCurrentTime(prevSlideTime);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!videosContent[videoId]) {
    return (
      <Alert severity="error">
        Video no encontrado: {videoId}
      </Alert>
    );
  }

  const videoContent = videosContent[videoId];
  const currentSlideData = videoContent.slides[currentSlide];

  return (
    <Card sx={{ height: '100%' }}>
      {/* Área de video */}
      <Box sx={{ position: 'relative', bgcolor: 'black', aspectRatio: '16/9' }}>
        <Box sx={{ position: 'absolute', inset: 0, p: 4, bgcolor: 'white', overflow: 'auto' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              {currentSlideData?.contenido}
            </motion.div>
          </AnimatePresence>
        </Box>
        
        {/* Overlay con título */}
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          p: 2, 
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)' 
        }}>
          <Typography variant="h6" sx={{ color: 'white' }}>
            {videoContent.titulo}
          </Typography>
          <Typography variant="caption" sx={{ color: 'white', opacity: 0.8 }}>
            {currentSlideData?.titulo}
          </Typography>
        </Box>
      </Box>

      {/* Controles de video */}
      <Box sx={{ p: 2 }}>
        {/* Barra de progreso */}
        <LinearProgress 
          variant="determinate" 
          value={(currentTime / videoContent.duracion) * 100}
          sx={{ mb: 2, height: 6, borderRadius: 3 }}
        />
        
        {/* Controles */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={handleRestart}>
              <Replay />
            </IconButton>
            <IconButton onClick={handlePrevSlide} disabled={currentSlide === 0}>
              <SkipPrevious />
            </IconButton>
            <IconButton onClick={handlePlayPause} color="primary" sx={{ mx: 1 }}>
              {playing ? <Pause /> : <PlayArrow />}
            </IconButton>
            <IconButton onClick={handleNextSlide} disabled={currentSlide === videoContent.slides.length - 1}>
              <SkipNext />
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">
              {formatTime(currentTime)} / {formatTime(videoContent.duracion)}
            </Typography>
            <IconButton size="small">
              <VolumeUp />
            </IconButton>
            <IconButton size="small">
              <Fullscreen />
            </IconButton>
          </Box>
        </Box>

        {/* Indicadores de slides */}
        <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'center' }}>
          {videoContent.slides.map((slide, index) => (
            <Box
              key={index}
              sx={{
                width: 40,
                height: 4,
                bgcolor: index === currentSlide ? 'primary.main' : 'grey.300',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onClick={() => {
                setCurrentSlide(index);
                setCurrentTime(slide.tiempo);
              }}
            />
          ))}
        </Box>

        {/* Transcripción */}
        <Box sx={{ mt: 2 }}>
          <Button 
            size="small" 
            onClick={() => setShowTranscript(!showTranscript)}
            startIcon={<Info />}
          >
            {showTranscript ? 'Ocultar' : 'Mostrar'} Transcripción
          </Button>
          <Collapse in={showTranscript}>
            <Paper sx={{ p: 2, mt: 1, bgcolor: 'grey.50', maxHeight: 200, overflow: 'auto' }}>
              <Typography variant="body2">
                {currentSlideData?.audio || 'Transcripción no disponible'}
              </Typography>
            </Paper>
          </Collapse>
        </Box>
      </Box>
    </Card>
  );
};

export default VideoEducativo;