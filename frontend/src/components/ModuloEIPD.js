// 📋 MÓDULO EIPD - EVALUACIÓN DE IMPACTO EN PROTECCIÓN DE DATOS
// Implementación según Plan Estratégico - Fase 2
// Cumplimiento Ley 21.719 Chile - Artículo 27

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Divider,
  LinearProgress,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Security,
  Warning,
  CheckCircle,
  Error,
  Assessment,
  Gavel,
  Psychology,
  AutoMode,
  Shield,
  DataObject,
  Timeline,
  FileDownload,
  ExpandMore,
  Lightbulb,
  Report,
  Business
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const ModuloEIPD = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Parámetros de URL del Dashboard DPO
  const ratOrigen = searchParams.get('rat') || '';
  const documentoId = searchParams.get('documento') || '';
  const esNuevo = searchParams.get('nuevo') === 'true';
  const esEdicion = searchParams.get('editar') === 'true';
  const [activeStep, setActiveStep] = useState(0);
  const [eipd, setEipd] = useState({
    // Información básica
    id: `eipd_${Date.now()}`,
    nombre_evaluacion: '',
    responsable_evaluacion: user?.email || '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_limite: '',
    estado: 'en_progreso', // 'en_progreso', 'completada', 'aprobada', 'requiere_revision'
    
    // Vinculación con RAT
    rat_asociado_id: '',
    rat_asociado_nombre: '',
    
    // Paso 1: Identificación de necesidad EIPD
    requiere_eipd: {
      justificacion: '',
      criterios_aplicables: [],
      decision_final: null, // true/false
      fecha_decision: ''
    },
    
    // Paso 2: Descripción del tratamiento
    descripcion_tratamiento: {
      naturaleza: '',
      alcance: '',
      contexto: '',
      finalidades: '',
      categoria_titulares: [],
      categoria_datos: [],
      volumen_datos: '',
      duracion_tratamiento: '',
      ubicacion_geografica: '',
      encargados_involucrados: []
    },
    
    // Paso 3: Evaluación de necesidad y proporcionalidad
    necesidad_proporcionalidad: {
      justificacion_necesidad: '',
      medidas_alternativas: '',
      proporcionalidad_analizada: false,
      conclusion_proporcionalidad: ''
    },
    
    // Paso 4: Análisis de riesgos
    analisis_riesgos: {
      riesgos_identificados: [],
      probabilidad_global: 1, // 1-5 escala
      impacto_global: 1, // 1-5 escala  
      nivel_riesgo_calculado: 'bajo',
      riesgos_residuales: []
    },
    
    // Paso 5: Medidas de mitigación
    medidas_mitigacion: {
      medidas_propuestas: [],
      medidas_implementadas: [],
      cronograma_implementacion: '',
      responsables_implementacion: [],
      recursos_necesarios: '',
      seguimiento_efectividad: ''
    },
    
    // Paso 6: Consulta a interesados
    consulta_interesados: {
      consulta_realizada: false,
      interesados_consultados: [],
      metodo_consulta: '',
      resultados_consulta: '',
      consideraciones_incorporadas: ''
    },
    
    // Paso 7: Conclusiones y decisiones
    conclusiones: {
      riesgo_aceptable: null,
      decision_proceder: null,
      condiciones_aprobacion: [],
      recomendaciones_adicionales: '',
      revision_periodica: true,
      frecuencia_revision: 'anual'
    },
    
    // Metadatos
    created_by: user?.id || 'demo_user',
    tenant_id: user?.organizacion_id || 'demo',
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString(),
    historial_cambios: []
  });

  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');

  // useEffect para pre-llenar datos desde RAT o cargar documento existente
  useEffect(() => {
    if (esNuevo && ratOrigen) {
      // Pre-llenar desde RAT
      console.log('🔗 Pre-llenando EIPD desde RAT:', ratOrigen);
      setEipd(prev => ({
        ...prev,
        nombre_evaluacion: `EIPD para ${ratOrigen}`,
        rat_asociado_id: ratOrigen,
        rat_asociado_nombre: ratOrigen,
        requiere_eipd: {
          ...prev.requiere_eipd,
          justificacion: `EIPD requerida automáticamente para ${ratOrigen} por detección de datos sensibles`,
          decision_final: true
        }
      }));
    } else if (esEdicion && documentoId) {
      // Cargar documento existente
      console.log('✏️ Cargando EIPD existente:', documentoId);
      // Aquí cargarías los datos del documento desde la API
      cargarDocumentoExistente(documentoId);
    }
  }, [ratOrigen, documentoId, esNuevo, esEdicion]);

  const cargarDocumentoExistente = async (docId) => {
    // Simular carga de documento existente
    const documentoSimulado = {
      id: docId,
      nombre_evaluacion: 'EIPD Datos Médicos Generales',
      responsable_evaluacion: 'Dr. Juan Pérez (DPO Salud)',
      rat_asociado_id: 'RAT-SALUD-2024',
      rat_asociado_nombre: 'RAT-SALUD-2024',
      requiere_eipd: {
        justificacion: 'Procesamiento de datos médicos y situación socioeconómica',
        decision_final: true
      }
    };
    
    setEipd(prev => ({ ...prev, ...documentoSimulado }));
    setActiveStep(1); // Ir al paso siguiente si ya está iniciado
  };

  // Criterios para determinar si requiere EIPD (Art. 27 Ley 21.719)
  const criteriosEIPD = [
    {
      id: 'evaluacion_sistematica',
      label: 'Evaluación sistemática y exhaustiva de aspectos personales',
      descripcion: 'Uso de algoritmos o IA para evaluar aspectos personales con efectos jurídicos',
      riesgo: 'alto'
    },
    {
      id: 'tratamiento_masivo',
      label: 'Tratamiento a gran escala de datos personales',
      descripcion: 'Procesamiento de grandes volúmenes de datos (>10,000 personas)',
      riesgo: 'medio'
    },
    {
      id: 'datos_sensibles',
      label: 'Tratamiento de datos sensibles sin consentimiento',
      descripcion: 'Procesamiento de datos de salud, biométricos, etc. sin consentimiento explícito',
      riesgo: 'alto'
    },
    {
      id: 'observacion_sistematica',
      label: 'Observación sistemática de zonas de acceso público',
      descripcion: 'Videovigilancia, tracking de ubicación, monitoreo sistemático',
      riesgo: 'medio'
    },
    {
      id: 'innovacion_tecnologica',
      label: 'Uso de nuevas tecnologías',
      descripción: 'IA, blockchain, IoT, biometría avanzada',
      riesgo: 'alto'
    },
    {
      id: 'impacto_derechos',
      label: 'Probable alto impacto en derechos y libertades',
      descripcion: 'Tratamiento que puede afectar significativamente a los individuos',
      riesgo: 'alto'
    }
  ];

  // Tipos de riesgo para análisis
  const tiposRiesgo = [
    { id: 'acceso_no_autorizado', label: 'Acceso no autorizado', categoria: 'seguridad' },
    { id: 'modificacion_no_deseada', label: 'Modificación no deseada', categoria: 'integridad' },
    { id: 'perdida_datos', label: 'Pérdida de datos', categoria: 'disponibilidad' },
    { id: 'discriminacion', label: 'Discriminación o exclusión', categoria: 'social' },
    { id: 'dano_reputacional', label: 'Daño reputacional', categoria: 'personal' },
    { id: 'perdida_confidencialidad', label: 'Pérdida de confidencialidad', categoria: 'privacidad' },
    { id: 'uso_indebido', label: 'Uso indebido de información', categoria: 'uso' },
    { id: 'imposibilidad_ejercer_derechos', label: 'Imposibilidad de ejercer derechos', categoria: 'legal' }
  ];

  const steps = [
    'Determinar Necesidad',
    'Describir Tratamiento', 
    'Evaluar Necesidad/Proporcionalidad',
    'Analizar Riesgos',
    'Medidas de Mitigación',
    'Consulta Interesados',
    'Conclusiones'
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const calcularNivelRiesgo = () => {
    const { probabilidad_global, impacto_global } = eipd.analisis_riesgos;
    const riesgo = probabilidad_global * impacto_global;
    
    if (riesgo <= 6) return 'bajo';
    if (riesgo <= 15) return 'medio';
    return 'alto';
  };

  const exportarEIPD = () => {
    const fechaActual = new Date().toLocaleDateString('es-CL');
    
    const documentoEIPD = `
EVALUACIÓN DE IMPACTO EN PROTECCIÓN DE DATOS (EIPD)
===================================================
Según Art. 27 de la Ley N° 21.719

INFORMACIÓN GENERAL:
====================
Nombre de la evaluación: ${eipd.nombre_evaluacion}
Responsable: ${eipd.responsable_evaluacion}
Fecha de inicio: ${eipd.fecha_inicio}
Fecha límite: ${eipd.fecha_limite}
Estado: ${eipd.estado}

RAT ASOCIADO:
=============
ID RAT: ${eipd.rat_asociado_id}
Nombre: ${eipd.rat_asociado_nombre}

1. DETERMINACIÓN DE NECESIDAD DE EIPD:
======================================
Justificación: ${eipd.requiere_eipd.justificacion}

Criterios aplicables:
${eipd.requiere_eipd.criterios_aplicables.map(criterio => {
  const criterioInfo = criteriosEIPD.find(c => c.id === criterio);
  return `- ${criterioInfo?.label} (${criterioInfo?.riesgo.toUpperCase()})`;
}).join('\n')}

Decisión final: ${eipd.requiere_eipd.decision_final ? 'SE REQUIERE EIPD' : 'NO SE REQUIERE EIPD'}

2. DESCRIPCIÓN DEL TRATAMIENTO:
===============================
Naturaleza: ${eipd.descripcion_tratamiento.naturaleza}
Alcance: ${eipd.descripcion_tratamiento.alcance}
Contexto: ${eipd.descripcion_tratamiento.contexto}
Volumen de datos: ${eipd.descripcion_tratamiento.volumen_datos}
Duración: ${eipd.descripcion_tratamiento.duracion_tratamiento}

3. EVALUACIÓN DE NECESIDAD Y PROPORCIONALIDAD:
==============================================
Justificación de necesidad: ${eipd.necesidad_proporcionalidad.justificacion_necesidad}
Medidas alternativas: ${eipd.necesidad_proporcionalidad.medidas_alternativas}
Proporcionalidad analizada: ${eipd.necesidad_proporcionalidad.proporcionalidad_analizada ? 'SÍ' : 'NO'}
Conclusión: ${eipd.necesidad_proporcionalidad.conclusion_proporcionalidad}

4. ANÁLISIS DE RIESGOS:
=======================
Probabilidad global: ${eipd.analisis_riesgos.probabilidad_global}/5
Impacto global: ${eipd.analisis_riesgos.impacto_global}/5
Nivel de riesgo calculado: ${calcularNivelRiesgo().toUpperCase()}

Riesgos identificados:
${eipd.analisis_riesgos.riesgos_identificados.map(riesgo => `- ${riesgo}`).join('\n')}

5. MEDIDAS DE MITIGACIÓN:
========================
Medidas propuestas:
${eipd.medidas_mitigacion.medidas_propuestas.map(medida => `- ${medida}`).join('\n')}

Cronograma: ${eipd.medidas_mitigacion.cronograma_implementacion}
Recursos necesarios: ${eipd.medidas_mitigacion.recursos_necesarios}
Seguimiento: ${eipd.medidas_mitigacion.seguimiento_efectividad}

6. CONSULTA A PARTES INTERESADAS:
=================================
Consulta realizada: ${eipd.consulta_interesados.consulta_realizada ? 'SÍ' : 'NO'}

${eipd.consulta_interesados.consulta_realizada ? `
Interesados consultados: ${eipd.consulta_interesados.interesados_consultados.join(', ')}
Método de consulta: ${eipd.consulta_interesados.metodo_consulta}
Resultados: ${eipd.consulta_interesados.resultados_consulta}
Consideraciones incorporadas: ${eipd.consulta_interesados.consideraciones_incorporadas}
` : 'No se realizó consulta a partes interesadas.'}

7. CONCLUSIONES Y DECISIONES:
============================
Riesgo aceptable: ${eipd.conclusiones.riesgo_aceptable ? 'SÍ' : 'NO'}
Decisión de proceder: ${eipd.conclusiones.decision_proceder ? 'SÍ' : 'NO'}

Condiciones de aprobación:
${eipd.conclusiones.condiciones_aprobacion.map(condicion => `- ${condicion}`).join('\n')}

Recomendaciones adicionales: ${eipd.conclusiones.recomendaciones_adicionales}

Revisión periódica: ${eipd.conclusiones.revision_periodica ? 'SÍ' : 'NO'}
Frecuencia: ${eipd.conclusiones.frecuencia_revision}

FIRMA Y APROBACIÓN:
==================
Evaluado por: ${eipd.responsable_evaluacion}
Fecha de evaluación: ${fechaActual}

Este documento ha sido generado automáticamente por el Sistema LPDP.
Cumple con los requerimientos del Art. 27 de la Ley N° 21.719.

    `;

    // Crear y descargar archivo
    const blob = new Blob([documentoEIPD], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EIPD_${eipd.nombre_evaluacion?.replace(/[^a-zA-Z0-9]/g, '_') || 'Evaluacion'}_${fechaActual.replace(/\//g, '-')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    
    // También generar versión JSON
    const jsonData = {
      ...eipd,
      fecha_exportacion: new Date().toISOString(),
      nivel_riesgo_calculado: calcularNivelRiesgo(),
      cumplimiento_ley: "21.719"
    };
    
    const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonLink = document.createElement('a');
    jsonLink.href = jsonUrl;
    jsonLink.download = `EIPD_${eipd.nombre_evaluacion?.replace(/[^a-zA-Z0-9]/g, '_') || 'Evaluacion'}_${fechaActual.replace(/\//g, '-')}.json`;
    
    // Descargar después de un breve delay
    setTimeout(() => {
      jsonLink.click();
      URL.revokeObjectURL(jsonUrl);
    }, 1000);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              🎯 Determinación de Necesidad de EIPD
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Según el Art. 27 de la Ley 21.719, se debe realizar EIPD cuando el tratamiento 
              "probablemente entrañe un alto riesgo para los derechos y libertades de las personas"
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Justificación para evaluar necesidad de EIPD"
                  multiline
                  rows={3}
                  value={eipd.requiere_eipd.justificacion}
                  onChange={(e) => setEipd({
                    ...eipd,
                    requiere_eipd: {
                      ...eipd.requiere_eipd,
                      justificacion: e.target.value
                    }
                  })}
                  helperText="Describa las circunstancias que motivan esta evaluación"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                  Criterios Aplicables (marque los que correspondan):
                </Typography>
                <FormGroup>
                  {criteriosEIPD.map((criterio) => (
                    <FormControlLabel
                      key={criterio.id}
                      control={
                        <Checkbox
                          checked={eipd.requiere_eipd.criterios_aplicables.includes(criterio.id)}
                          onChange={(e) => {
                            const criterios = e.target.checked 
                              ? [...eipd.requiere_eipd.criterios_aplicables, criterio.id]
                              : eipd.requiere_eipd.criterios_aplicables.filter(c => c !== criterio.id);
                            
                            setEipd({
                              ...eipd,
                              requiere_eipd: {
                                ...eipd.requiere_eipd,
                                criterios_aplicables: criterios
                              }
                            });
                          }}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {criterio.label}
                            <Chip 
                              label={criterio.riesgo.toUpperCase()} 
                              color={criterio.riesgo === 'alto' ? 'error' : 'warning'}
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {criterio.descripcion}
                          </Typography>
                        </Box>
                      }
                    />
                  ))}
                </FormGroup>
              </Grid>
              
              <Grid item xs={12}>
                <Alert 
                  severity={eipd.requiere_eipd.criterios_aplicables.length > 0 ? "warning" : "success"}
                  sx={{ mb: 2 }}
                >
                  {eipd.requiere_eipd.criterios_aplicables.length > 0 
                    ? `⚠️ Se recomienda realizar EIPD (${eipd.requiere_eipd.criterios_aplicables.length} criterios aplicables)`
                    : "✅ Probablemente no se requiere EIPD, pero puede proceder voluntariamente"
                  }
                </Alert>
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              📋 Descripción Sistemática del Tratamiento
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Naturaleza del tratamiento"
                  multiline
                  rows={3}
                  value={eipd.descripcion_tratamiento.naturaleza}
                  onChange={(e) => setEipd({
                    ...eipd,
                    descripcion_tratamiento: {
                      ...eipd.descripcion_tratamiento,
                      naturaleza: e.target.value
                    }
                  })}
                  helperText="¿Qué tipo de tratamiento se realizará?"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Alcance del tratamiento"
                  multiline
                  rows={3}
                  value={eipd.descripcion_tratamiento.alcance}
                  onChange={(e) => setEipd({
                    ...eipd,
                    descripcion_tratamiento: {
                      ...eipd.descripcion_tratamiento,
                      alcance: e.target.value
                    }
                  })}
                  helperText="¿Cuál es el alcance y volumen del tratamiento?"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Contexto del tratamiento"
                  multiline
                  rows={2}
                  value={eipd.descripcion_tratamiento.contexto}
                  onChange={(e) => setEipd({
                    ...eipd,
                    descripcion_tratamiento: {
                      ...eipd.descripcion_tratamiento,
                      contexto: e.target.value
                    }
                  })}
                  helperText="Contexto organizacional, técnico y social"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Volumen aproximado de datos"
                  value={eipd.descripcion_tratamiento.volumen_datos}
                  onChange={(e) => setEipd({
                    ...eipd,
                    descripcion_tratamiento: {
                      ...eipd.descripcion_tratamiento,
                      volumen_datos: e.target.value
                    }
                  })}
                  helperText="Ej: 50,000 registros de clientes"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Duración del tratamiento"
                  value={eipd.descripcion_tratamiento.duracion_tratamiento}
                  onChange={(e) => setEipd({
                    ...eipd,
                    descripcion_tratamiento: {
                      ...eipd.descripcion_tratamiento,
                      duracion_tratamiento: e.target.value
                    }
                  })}
                  helperText="Ej: 5 años desde finalización de contrato"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              ⚠️ Identificación y Análisis de Riesgos
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Riesgos Identificados:
                </Typography>
                {tiposRiesgo.map((tipo) => (
                  <Accordion key={tipo.id}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography>
                        {tipo.label} <Chip label={tipo.categoria} size="small" sx={{ ml: 1 }} />
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" gutterBottom>Probabilidad:</Typography>
                          <Rating
                            value={5}
                            max={5}
                            onChange={(event, newValue) => {
                              // Lógica para actualizar probabilidad
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" gutterBottom>Impacto:</Typography>
                          <Rating
                            value={5}
                            max={5}
                            onChange={(event, newValue) => {
                              // Lógica para actualizar impacto
                            }}
                          />
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Grid>
              
              <Grid item xs={12}>
                <Paper sx={{ p: 3, bgcolor: 'warning.50' }}>
                  <Typography variant="h6" gutterBottom>
                    Nivel de Riesgo Calculado: 
                    <Chip 
                      label={calcularNivelRiesgo().toUpperCase()} 
                      color={calcularNivelRiesgo() === 'alto' ? 'error' : calcularNivelRiesgo() === 'medio' ? 'warning' : 'success'}
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(eipd.analisis_riesgos.probabilidad_global * eipd.analisis_riesgos.impacto_global) * 4}
                    color={calcularNivelRiesgo() === 'alto' ? 'error' : 'warning'}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              ⚖️ Evaluación de Necesidad y Proporcionalidad
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Justificación de la necesidad del tratamiento"
                  multiline
                  rows={4}
                  value={eipd.necesidad_proporcionalidad.justificacion_necesidad}
                  onChange={(e) => setEipd({
                    ...eipd,
                    necesidad_proporcionalidad: {
                      ...eipd.necesidad_proporcionalidad,
                      justificacion_necesidad: e.target.value
                    }
                  })}
                  helperText="Explique por qué este tratamiento es necesario para los fines declarados"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Medidas alternativas consideradas"
                  multiline
                  rows={3}
                  value={eipd.necesidad_proporcionalidad.medidas_alternativas}
                  onChange={(e) => setEipd({
                    ...eipd,
                    necesidad_proporcionalidad: {
                      ...eipd.necesidad_proporcionalidad,
                      medidas_alternativas: e.target.value
                    }
                  })}
                  helperText="Describa qué alternativas menos invasivas se consideraron"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={eipd.necesidad_proporcionalidad.proporcionalidad_analizada}
                      onChange={(e) => setEipd({
                        ...eipd,
                        necesidad_proporcionalidad: {
                          ...eipd.necesidad_proporcionalidad,
                          proporcionalidad_analizada: e.target.checked
                        }
                      })}
                    />
                  }
                  label="He analizado la proporcionalidad entre medios y fines"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Conclusión sobre proporcionalidad"
                  multiline
                  rows={3}
                  value={eipd.necesidad_proporcionalidad.conclusion_proporcionalidad}
                  onChange={(e) => setEipd({
                    ...eipd,
                    necesidad_proporcionalidad: {
                      ...eipd.necesidad_proporcionalidad,
                      conclusion_proporcionalidad: e.target.value
                    }
                  })}
                  helperText="Resuma su análisis de proporcionalidad"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              🛡️ Medidas de Mitigación
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Medidas Propuestas para Mitigar Riesgos:
                </Typography>
                <TextField
                  fullWidth
                  label="Medidas técnicas de mitigación"
                  multiline
                  rows={4}
                  value={eipd.medidas_mitigacion.medidas_propuestas.join('\n')}
                  onChange={(e) => setEipd({
                    ...eipd,
                    medidas_mitigacion: {
                      ...eipd.medidas_mitigacion,
                      medidas_propuestas: e.target.value.split('\n').filter(m => m.trim())
                    }
                  })}
                  helperText="Una medida por línea (ej: Cifrado AES-256, Control de acceso basado en roles, etc.)"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Cronograma de implementación"
                  multiline
                  rows={3}
                  value={eipd.medidas_mitigacion.cronograma_implementacion}
                  onChange={(e) => setEipd({
                    ...eipd,
                    medidas_mitigacion: {
                      ...eipd.medidas_mitigacion,
                      cronograma_implementacion: e.target.value
                    }
                  })}
                  helperText="Defina plazos y fases para implementar las medidas"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Recursos necesarios"
                  value={eipd.medidas_mitigacion.recursos_necesarios}
                  onChange={(e) => setEipd({
                    ...eipd,
                    medidas_mitigacion: {
                      ...eipd.medidas_mitigacion,
                      recursos_necesarios: e.target.value
                    }
                  })}
                  helperText="Presupuesto, personal, tecnología requerida"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Plan de seguimiento de efectividad"
                  value={eipd.medidas_mitigacion.seguimiento_efectividad}
                  onChange={(e) => setEipd({
                    ...eipd,
                    medidas_mitigacion: {
                      ...eipd.medidas_mitigacion,
                      seguimiento_efectividad: e.target.value
                    }
                  })}
                  helperText="Cómo se verificará que las medidas son efectivas"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 5:
        return (
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              👥 Consulta a Partes Interesadas
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={eipd.consulta_interesados.consulta_realizada}
                      onChange={(e) => setEipd({
                        ...eipd,
                        consulta_interesados: {
                          ...eipd.consulta_interesados,
                          consulta_realizada: e.target.checked
                        }
                      })}
                    />
                  }
                  label="Se realizó consulta a partes interesadas"
                />
              </Grid>
              
              {eipd.consulta_interesados.consulta_realizada && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Partes interesadas consultadas"
                      value={eipd.consulta_interesados.interesados_consultados.join(', ')}
                      onChange={(e) => setEipd({
                        ...eipd,
                        consulta_interesados: {
                          ...eipd.consulta_interesados,
                          interesados_consultados: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                        }
                      })}
                      helperText="Separar por comas: Sindicatos, Representantes empleados, Asociaciones de consumidores, etc."
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Método de consulta utilizado"
                      value={eipd.consulta_interesados.metodo_consulta}
                      onChange={(e) => setEipd({
                        ...eipd,
                        consulta_interesados: {
                          ...eipd.consulta_interesados,
                          metodo_consulta: e.target.value
                        }
                      })}
                      helperText="Encuestas, reuniones, consulta pública, etc."
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Resultados de la consulta"
                      multiline
                      rows={3}
                      value={eipd.consulta_interesados.resultados_consulta}
                      onChange={(e) => setEipd({
                        ...eipd,
                        consulta_interesados: {
                          ...eipd.consulta_interesados,
                          resultados_consulta: e.target.value
                        }
                      })}
                      helperText="Resumen de opiniones y sugerencias recibidas"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Consideraciones incorporadas al diseño"
                      multiline
                      rows={3}
                      value={eipd.consulta_interesados.consideraciones_incorporadas}
                      onChange={(e) => setEipd({
                        ...eipd,
                        consulta_interesados: {
                          ...eipd.consulta_interesados,
                          consideraciones_incorporadas: e.target.value
                        }
                      })}
                      helperText="Cómo se modificó el tratamiento basado en la consulta"
                    />
                  </Grid>
                </>
              )}
              
              {!eipd.consulta_interesados.consulta_realizada && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>Nota:</strong> La consulta a partes interesadas es recomendable para 
                      tratamientos de alto riesgo, especialmente cuando afectan a grupos vulnerables 
                      o tienen impacto social significativo.
                    </Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Box>
        );

      case 6:
        return (
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              📋 Conclusiones y Decisiones
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Evaluación Final del Riesgo:
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={eipd.conclusiones.riesgo_aceptable === true}
                      onChange={(e) => setEipd({
                        ...eipd,
                        conclusiones: {
                          ...eipd.conclusiones,
                          riesgo_aceptable: e.target.checked ? true : null
                        }
                      })}
                      color="success"
                    />
                  }
                  label="El riesgo residual es aceptable"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Decisión sobre el Tratamiento:
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={eipd.conclusiones.decision_proceder === true}
                      onChange={(e) => setEipd({
                        ...eipd,
                        conclusiones: {
                          ...eipd.conclusiones,
                          decision_proceder: e.target.checked ? true : null
                        }
                      })}
                      color="primary"
                    />
                  }
                  label="Se autoriza proceder con el tratamiento"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Condiciones de aprobación"
                  multiline
                  rows={3}
                  value={eipd.conclusiones.condiciones_aprobacion.join('\n')}
                  onChange={(e) => setEipd({
                    ...eipd,
                    conclusiones: {
                      ...eipd.conclusiones,
                      condiciones_aprobacion: e.target.value.split('\n').filter(c => c.trim())
                    }
                  })}
                  helperText="Una condición por línea. Condiciones que deben cumplirse antes o durante el tratamiento"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Recomendaciones adicionales"
                  multiline
                  rows={3}
                  value={eipd.conclusiones.recomendaciones_adicionales}
                  onChange={(e) => setEipd({
                    ...eipd,
                    conclusiones: {
                      ...eipd.conclusiones,
                      recomendaciones_adicionales: e.target.value
                    }
                  })}
                  helperText="Sugerencias para mejorar la protección de datos"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={eipd.conclusiones.revision_periodica}
                      onChange={(e) => setEipd({
                        ...eipd,
                        conclusiones: {
                          ...eipd.conclusiones,
                          revision_periodica: e.target.checked
                        }
                      })}
                    />
                  }
                  label="Requiere revisión periódica"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Frecuencia de revisión</InputLabel>
                  <Select
                    value={eipd.conclusiones.frecuencia_revision}
                    onChange={(e) => setEipd({
                      ...eipd,
                      conclusiones: {
                        ...eipd.conclusiones,
                        frecuencia_revision: e.target.value
                      }
                    })}
                    label="Frecuencia de revisión"
                    disabled={!eipd.conclusiones.revision_periodica}
                  >
                    <MenuItem value="trimestral">Trimestral</MenuItem>
                    <MenuItem value="semestral">Semestral</MenuItem>
                    <MenuItem value="anual">Anual</MenuItem>
                    <MenuItem value="bianual">Bianual</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return (
          <Box>
            <Alert severity="info">
              <Typography>
                Has completado todos los pasos disponibles de la EIPD.
              </Typography>
            </Alert>
          </Box>
        );
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          📋 Evaluación de Impacto en Protección de Datos (EIPD)
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Cumplimiento Art. 27 Ley 21.719 - Evaluación obligatoria para tratamientos de alto riesgo
        </Typography>
      </Box>

      {/* Info básica */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📋 Información Básica
              </Typography>
              
              <TextField
                fullWidth
                label="Nombre de la evaluación"
                value={eipd.nombre_evaluacion}
                onChange={(e) => setEipd({...eipd, nombre_evaluacion: e.target.value})}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Responsable de evaluación"
                value={eipd.responsable_evaluacion}
                onChange={(e) => setEipd({...eipd, responsable_evaluacion: e.target.value})}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                type="date"
                label="Fecha límite"
                value={eipd.fecha_limite}
                onChange={(e) => setEipd({...eipd, fecha_limite: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel>
                    <Typography variant="h6">{label}</Typography>
                  </StepLabel>
                  <StepContent>
                    {renderStepContent(index)}
                    
                    <Box sx={{ mb: 2, mt: 3 }}>
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        sx={{ mt: 1, mr: 1 }}
                        disabled={index === steps.length - 1}
                      >
                        {index === steps.length - 1 ? 'Finalizar' : 'Continuar'}
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
            
            {activeStep === steps.length && (
              <Paper square elevation={0} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom color="success.main">
                  ✅ EIPD Completada
                </Typography>
                <Typography>
                  La Evaluación de Impacto ha sido completada exitosamente.
                </Typography>
                <Button 
                  onClick={exportarEIPD} 
                  variant="contained" 
                  startIcon={<FileDownload />}
                  sx={{ mt: 2 }}
                >
                  Exportar EIPD
                </Button>
              </Paper>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ModuloEIPD;