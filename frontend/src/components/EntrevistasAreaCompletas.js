import React, { useState } from 'react';
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
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Alert,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  People,
  AttachMoney,
  Campaign,
  Engineering,
  Business,
  ExpandMore,
  CheckCircle,
  Assignment,
  Save,
  Download,
  PlayArrow,
} from '@mui/icons-material';

const EntrevistasAreaCompletas = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [areaSeleccionada, setAreaSeleccionada] = useState('rrhh');
  const [respuestas, setRespuestas] = useState({});
  const [progreso, setProgreso] = useState(0);

  const areasEntrevista = {
    rrhh: {
      nombre: 'Recursos Humanos',
      icon: <People />,
      color: '#2E7D32',
      descripcion: 'Gestión del capital humano y relaciones laborales',
      preguntasEstructuradas: [
        {
          fase: 'Identificación de Actividades',
          preguntas: [
            {
              id: 'rrhh_1',
              tipo: 'texto_largo',
              pregunta: '¿Cuál es el proceso completo desde que reciben un currículum hasta que se contrata a una persona?',
              objetivo: 'Mapear el flujo completo del proceso de reclutamiento',
              ayuda: 'Describa paso a paso: recepción CV, evaluación, entrevistas, exámenes, contratación'
            },
            {
              id: 'rrhh_2',
              tipo: 'multiple_checkbox',
              pregunta: '¿Qué información solicitan durante el proceso de reclutamiento?',
              opciones: [
                'Datos de identificación (nombre, RUT, dirección)',
                'Historial académico y certificados',
                'Experiencia laboral y referencias',
                'Exámenes médicos preocupacionales',
                'Verificación de antecedentes',
                'Datos familiares (para cargas)',
                'Información bancaria',
                'Otros (especificar)'
              ]
            },
            {
              id: 'rrhh_3',
              tipo: 'texto',
              pregunta: '¿Dónde guardan esta información? ¿En qué sistemas?',
              objetivo: 'Identificar sistemas de almacenamiento'
            }
          ]
        },
        {
          fase: 'Mapeo de Datos y Flujos',
          preguntas: [
            {
              id: 'rrhh_4',
              tipo: 'multiple_radio',
              pregunta: '¿Cómo obtienen los datos de los candidatos?',
              opciones: [
                'Directamente del candidato (formularios, entrevistas)',
                'Portales de empleo (LinkedIn, Trabajando.com)',
                'Empresas de reclutamiento externas',
                'Referencias de empleados actuales',
                'Múltiples fuentes'
              ]
            },
            {
              id: 'rrhh_5',
              tipo: 'multiple_checkbox',
              pregunta: '¿Con quién comparten la información de candidatos y empleados?',
              opciones: [
                'Gerentes de área (para evaluación)',
                'Empresa de exámenes preocupacionales',
                'Empresa de verificación de antecedentes',
                'AFP e Isapre',
                'Bancos (para nómina)',
                'Seguros complementarios',
                'Asesoría legal externa',
                'Otros (especificar)'
              ]
            },
            {
              id: 'rrhh_6',
              tipo: 'texto_largo',
              pregunta: 'Para empleados actuales, ¿qué datos sensibles manejan?',
              ayuda: 'Considere: datos de salud, situación socioeconómica, cargas familiares, evaluaciones psicológicas'
            }
          ]
        },
        {
          fase: 'Conservación y Eliminación',
          preguntas: [
            {
              id: 'rrhh_7',
              tipo: 'texto',
              pregunta: '¿Cuánto tiempo conservan los currículums de candidatos NO seleccionados?',
              objetivo: 'Determinar políticas de retención'
            },
            {
              id: 'rrhh_8',
              tipo: 'si_no',
              pregunta: '¿Tienen un procedimiento formal de eliminación de datos de ex-empleados?',
              seguimiento: {
                si: '¿Cuál es el procedimiento y cada cuánto se ejecuta?',
                no: '¿Qué hacen con los datos cuando un empleado se va?'
              }
            }
          ]
        }
      ]
    },
    finanzas: {
      nombre: 'Finanzas y Contabilidad',
      icon: <AttachMoney />,
      color: '#1565C0',
      descripcion: 'Gestión financiera, facturación y control económico',
      preguntasEstructuradas: [
        {
          fase: 'Identificación de Actividades Financieras',
          preguntas: [
            {
              id: 'finanzas_1',
              tipo: 'texto_largo',
              pregunta: '¿Cuál es el proceso para evaluar y aprobar un crédito o financiamiento a clientes?',
              objetivo: 'Mapear proceso de evaluación crediticia',
              ayuda: 'Incluya: solicitud, evaluación, scoring, aprobación, seguimiento'
            },
            {
              id: 'finanzas_2',
              tipo: 'multiple_checkbox',
              pregunta: '¿Qué datos utilizan para evaluar la solvencia de clientes?',
              opciones: [
                'Ingresos declarados',
                'Patrimonio y bienes',
                'Historial crediticio (DICOM, etc.)',
                'Información bancaria',
                'Declaraciones de impuestos',
                'Avales y garantías',
                'Comportamiento de pago histórico',
                'Scoring crediticio automatizado',
                'Otros (especificar)'
              ]
            }
          ]
        },
        {
          fase: 'Datos Sensibles Financieros',
          preguntas: [
            {
              id: 'finanzas_3',
              tipo: 'texto_largo',
              pregunta: 'En Chile, la "situación socioeconómica" es dato sensible según Ley 21.719. ¿Qué datos de este tipo manejan?',
              ayuda: 'Ejemplos: nivel de ingresos, capacidad de pago, scoring crediticio, elegibilidad para beneficios'
            },
            {
              id: 'finanzas_4',
              tipo: 'multiple_checkbox',
              pregunta: '¿A qué entidades externas reportan información financiera de clientes?',
              opciones: [
                'SII (Servicio de Impuestos Internos)',
                'CMF (Comisión para el Mercado Financiero)',
                'SBIF/Bancos',
                'Centrales de riesgo (DICOM, Equifax)',
                'Auditores externos',
                'Aseguradoras',
                'Otros (especificar)'
              ]
            }
          ]
        },
        {
          fase: 'Sistemas y Conservación',
          preguntas: [
            {
              id: 'finanzas_5',
              tipo: 'texto',
              pregunta: '¿Qué sistemas utilizan para procesar datos financieros?',
              ayuda: 'ERP, software contable, sistemas de scoring, etc.'
            },
            {
              id: 'finanzas_6',
              tipo: 'texto',
              pregunta: '¿Cuánto tiempo conservan registros financieros por obligaciones tributarias?',
              objetivo: 'Verificar cumplimiento de plazos legales'
            }
          ]
        }
      ]
    },
    marketing: {
      nombre: 'Marketing y Ventas',
      icon: <Campaign />,
      color: '#E65100',
      descripcion: 'Promoción, ventas y relación con clientes',
      preguntasEstructuradas: [
        {
          fase: 'Captación y Perfilamiento',
          preguntas: [
            {
              id: 'marketing_1',
              tipo: 'texto_largo',
              pregunta: '¿Cómo captan datos de potenciales clientes para campañas de marketing?',
              ayuda: 'Landing pages, redes sociales, eventos, compra de bases de datos, etc.'
            },
            {
              id: 'marketing_2',
              tipo: 'multiple_checkbox',
              pregunta: '¿Qué datos recopilan para personalizar ofertas?',
              opciones: [
                'Datos demográficos (edad, género, ubicación)',
                'Preferencias de productos',
                'Historial de compras',
                'Comportamiento web (cookies, navegación)',
                'Interacciones en redes sociales',
                'Poder adquisitivo estimado',
                'Scores de propensión a compra',
                'Otros (especificar)'
              ]
            }
          ]
        },
        {
          fase: 'Decisiones Automatizadas',
          preguntas: [
            {
              id: 'marketing_3',
              tipo: 'si_no',
              pregunta: '¿Utilizan algoritmos o IA para tomar decisiones automáticas sobre clientes?',
              seguimiento: {
                si: '¿Qué tipo de decisiones? (segmentación, precios, ofertas, etc.)',
                no: '¿Todas las decisiones de marketing son tomadas por humanos?'
              }
            },
            {
              id: 'marketing_4',
              tipo: 'texto_largo',
              pregunta: 'Si usan perfilamiento automatizado, ¿pueden los clientes solicitar explicación de las decisiones?',
              ayuda: 'La Ley 21.719 otorga derecho a no ser objeto de decisiones automatizadas'
            }
          ]
        }
      ]
    },
    operaciones: {
      nombre: 'Operaciones y Producción',
      icon: <Engineering />,
      color: '#4A148C',
      descripcion: 'Procesos productivos y operacionales',
      preguntasEstructuradas: [
        {
          fase: 'Datos de Producción',
          preguntas: [
            {
              id: 'operaciones_1',
              tipo: 'texto_largo',
              pregunta: '¿Utilizan sensores IoT o sistemas de monitoreo que capturen datos que puedan vincularse a personas?',
              ayuda: 'Ej: geolocalización de trabajadores, cámaras con reconocimiento, sistemas de acceso'
            },
            {
              id: 'operaciones_2',
              tipo: 'multiple_checkbox',
              pregunta: 'En sistemas de monitoreo, ¿qué datos de trabajadores se registran?',
              opciones: [
                'Ubicación GPS en tiempo real',
                'Horarios de entrada/salida',
                'Acceso a zonas restringidas',
                'Productividad individual',
                'Imágenes de videovigilancia',
                'Datos biométricos (huella, facial)',
                'Temperatura corporal',
                'Otros (especificar)'
              ]
            }
          ]
        },
        {
          fase: 'Transferencias Tecnológicas',
          preguntas: [
            {
              id: 'operaciones_3',
              tipo: 'si_no',
              pregunta: '¿Envían datos operacionales a plataformas en la nube fuera de Chile?',
              seguimiento: {
                si: '¿A qué países? ¿Qué garantías de protección tienen?',
                no: '¿Todos los datos permanecen en servidores nacionales?'
              }
            }
          ]
        }
      ]
    },
    ti: {
      nombre: 'Tecnologías de Información',
      icon: <Business />,
      color: '#37474F',
      descripción: 'Infraestructura y sistemas de información',
      preguntasEstructuradas: [
        {
          fase: 'Infraestructura de Datos',
          preguntas: [
            {
              id: 'ti_1',
              tipo: 'texto_largo',
              pregunta: '¿Qué sistemas y bases de datos contienen información personal?',
              ayuda: 'ERP, CRM, RRHH, financiero, web, etc.'
            },
            {
              id: 'ti_2',
              tipo: 'multiple_checkbox',
              pregunta: '¿Qué medidas de seguridad técnica tienen implementadas?',
              opciones: [
                'Cifrado de datos en tránsito (TLS/SSL)',
                'Cifrado de datos en reposo',
                'Control de acceso basado en roles',
                'Autenticación multifactor',
                'Logs de auditoría',
                'Respaldos automáticos',
                'Detección de intrusiones',
                'Anonimización/pseudonimización',
                'Otros (especificar)'
              ]
            }
          ]
        },
        {
          fase: 'Gestión de Brechas',
          preguntas: [
            {
              id: 'ti_3',
              tipo: 'si_no',
              pregunta: '¿Tienen procedimientos para detectar y responder a brechas de seguridad?',
              seguimiento: {
                si: '¿Cuál es el tiempo de respuesta objetivo?',
                no: '¿Cómo se enterarían si hay una filtración de datos?'
              }
            }
          ]
        }
      ]
    }
  };

  const handleRespuesta = (preguntaId, valor) => {
    setRespuestas(prev => ({
      ...prev,
      [preguntaId]: valor
    }));

    const totalPreguntas = areasEntrevista[areaSeleccionada].preguntasEstructuradas
      .reduce((total, fase) => total + fase.preguntas.length, 0);
    const respondidas = Object.keys(respuestas).length + 1;
    setProgreso((respondidas / totalPreguntas) * 100);
  };

  const generarInforme = () => {
    const area = areasEntrevista[areaSeleccionada];
    let informe = `
INFORME DE ENTREVISTA - ${area.nombre.toUpperCase()}
================================================================

Fecha: ${new Date().toLocaleDateString('es-CL')}
Área entrevistada: ${area.nombre}
Entrevistador: [DPO/Responsable]
Entrevistado: [Completar]

OBJETIVO:
Identificar y documentar actividades de tratamiento de datos personales
según los requerimientos de la Ley N° 21.719

`;

    area.preguntasEstructuradas.forEach((fase, faseIndex) => {
      informe += `\n${faseIndex + 1}. ${fase.fase.toUpperCase()}\n`;
      informe += '='.repeat(fase.fase.length + 4) + '\n\n';

      fase.preguntas.forEach((pregunta, pregIndex) => {
        const respuesta = respuestas[pregunta.id] || '[NO RESPONDIDA]';
        informe += `${faseIndex + 1}.${pregIndex + 1} ${pregunta.pregunta}\n`;
        if (pregunta.tipo === 'multiple_checkbox' && Array.isArray(respuesta)) {
          informe += `Respuesta:\n${respuesta.map(r => `  ✓ ${r}`).join('\n')}\n\n`;
        } else {
          informe += `Respuesta: ${respuesta}\n\n`;
        }
      });
    });

    informe += `
PRÓXIMOS PASOS:
===============
1. Validar respuestas con el entrevistado
2. Documentar actividades identificadas en el RAT
3. Verificar bases legales para cada tratamiento
4. Establecer medidas de seguridad apropiadas

OBSERVACIONES:
==============
[Completar con observaciones adicionales]

Firma Entrevistado: ____________________
Firma DPO: ____________________
`;

    const blob = new Blob([informe], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Entrevista_${area.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const renderPregunta = (pregunta) => {
    const valor = respuestas[pregunta.id] || '';

    switch (pregunta.tipo) {
      case 'texto':
        return (
          <TextField
            fullWidth
            multiline
            rows={2}
            value={valor}
            onChange={(e) => handleRespuesta(pregunta.id, e.target.value)}
            placeholder="Escriba su respuesta..."
          />
        );

      case 'texto_largo':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            value={valor}
            onChange={(e) => handleRespuesta(pregunta.id, e.target.value)}
            placeholder="Describa detalladamente..."
          />
        );

      case 'multiple_radio':
        return (
          <FormControl component="fieldset">
            <RadioGroup
              value={valor}
              onChange={(e) => handleRespuesta(pregunta.id, e.target.value)}
            >
              {pregunta.opciones.map((opcion, index) => (
                <FormControlLabel
                  key={index}
                  value={opcion}
                  control={<Radio />}
                  label={opcion}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );

      case 'multiple_checkbox':
        return (
          <FormGroup>
            {pregunta.opciones.map((opcion, index) => (
              <FormControlLabel
                key={index}
                control={
                  <Checkbox
                    checked={(valor || []).includes(opcion)}
                    onChange={(e) => {
                      const currentValues = valor || [];
                      if (e.target.checked) {
                        handleRespuesta(pregunta.id, [...currentValues, opcion]);
                      } else {
                        handleRespuesta(pregunta.id, currentValues.filter(v => v !== opcion));
                      }
                    }}
                  />
                }
                label={opcion}
              />
            ))}
          </FormGroup>
        );

      case 'si_no':
        return (
          <Box>
            <FormControl component="fieldset">
              <RadioGroup
                value={valor.respuesta || ''}
                onChange={(e) => handleRespuesta(pregunta.id, { ...valor, respuesta: e.target.value })}
                row
              >
                <FormControlLabel value="si" control={<Radio />} label="Sí" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
            {valor.respuesta && pregunta.seguimiento && (
              <TextField
                fullWidth
                multiline
                rows={2}
                sx={{ mt: 2 }}
                label={pregunta.seguimiento[valor.respuesta]}
                value={valor.seguimiento || ''}
                onChange={(e) => handleRespuesta(pregunta.id, { ...valor, seguimiento: e.target.value })}
              />
            )}
          </Box>
        );

      default:
        return <Typography color="error">Tipo de pregunta no reconocido</Typography>;
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Entrevistas Estructuradas por Área
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Según metodología del Manual de Procedimientos - Capítulo 3
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {Object.entries(areasEntrevista).map(([key, area]) => (
          <Grid item xs={12} md={4} key={key}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                border: areaSeleccionada === key ? 2 : 1,
                borderColor: areaSeleccionada === key ? area.color : 'divider',
                '&:hover': { boxShadow: 4 }
              }}
              onClick={() => {
                setAreaSeleccionada(key);
                setActiveStep(0);
                setRespuestas({});
                setProgreso(0);
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ color: area.color, mr: 2 }}>
                    {area.icon}
                  </Box>
                  <Typography variant="h6">{area.nombre}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {area.descripcion}
                </Typography>
                <Chip 
                  label={`${area.preguntasEstructuradas.reduce((total, fase) => total + fase.preguntas.length, 0)} preguntas`}
                  size="small" 
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {areaSeleccionada && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">
                Entrevista: {areasEntrevista[areaSeleccionada].nombre}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<Save />}
                  onClick={generarInforme}
                  disabled={Object.keys(respuestas).length === 0}
                >
                  Generar Informe
                </Button>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Progreso de la entrevista
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={progreso} 
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                {Math.round(progreso)}% completado
              </Typography>
            </Box>

            <Stepper activeStep={activeStep} orientation="vertical">
              {areasEntrevista[areaSeleccionada].preguntasEstructuradas.map((fase, index) => (
                <Step key={index}>
                  <StepLabel>
                    <Typography variant="h6">{fase.fase}</Typography>
                  </StepLabel>
                  <StepContent>
                    {fase.preguntas.map((pregunta, pregIndex) => (
                      <Accordion key={pregunta.id} sx={{ mb: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Typography sx={{ flexGrow: 1 }}>
                              {pregIndex + 1}. {pregunta.pregunta}
                            </Typography>
                            {respuestas[pregunta.id] && (
                              <CheckCircle color="success" sx={{ ml: 2 }} />
                            )}
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          {pregunta.objetivo && (
                            <Alert severity="info" sx={{ mb: 2 }}>
                              <strong>Objetivo:</strong> {pregunta.objetivo}
                            </Alert>
                          )}
                          {pregunta.ayuda && (
                            <Alert severity="info" sx={{ mb: 2 }}>
                              <strong>Ayuda:</strong> {pregunta.ayuda}
                            </Alert>
                          )}
                          {renderPregunta(pregunta)}
                        </AccordionDetails>
                      </Accordion>
                    ))}
                    <Box sx={{ mb: 1, mt: 2 }}>
                      <Button
                        variant="contained"
                        onClick={() => setActiveStep(activeStep + 1)}
                        sx={{ mt: 1, mr: 1 }}
                        disabled={index === areasEntrevista[areaSeleccionada].preguntasEstructuradas.length - 1}
                      >
                        Siguiente Fase
                      </Button>
                      <Button
                        disabled={index === 0}
                        onClick={() => setActiveStep(activeStep - 1)}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Anterior
                      </Button>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default EntrevistasAreaCompletas;