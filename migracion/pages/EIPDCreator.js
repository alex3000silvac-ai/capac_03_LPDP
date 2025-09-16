import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Select,
  MenuItem,
  Alert,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from '@mui/material';
import {
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Assessment as AssessmentIcon,
  Description as DocumentIcon,
  Gavel as LegalIcon,
  Psychology as BrainIcon,
  Group as GroupIcon,
  Business as BusinessIcon,
  Schedule as TimeIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { ratService } from '../services/ratService';
import ratIntelligenceEngine from '../services/ratIntelligenceEngine';
import { useTenant } from '../contexts/TenantContext';

const EIPDCreator = () => {
  const navigate = useNavigate();
  const { ratId } = useParams(); // Si viene desde un RAT específico
  const { currentTenant } = useTenant();
  
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [ratData, setRatData] = useState(null);
  const [eipdData, setEipdData] = useState({
    // Paso 1: Información General
    general: {
      nombre_evaluacion: '',
      descripcion_actividad: '',
      area_responsable: '',
      evaluador: '',
      fecha_evaluacion: new Date().toISOString().split('T')[0],
      relacionado_rat_id: ratId || null
    },
    
    // Paso 2: Criterios de Necesidad (Art. 25 Ley 21.719)
    criterios_necesidad: {
      datos_sensibles: false,
      decisiones_automatizadas: false,
      observacion_sistematica: false,
      nuevas_tecnologias: false,
      datos_menores_masivo: false,
      combinacion_fuentes: false,
      otros_criterios: ''
    },
    
    // Paso 3: Descripción Sistemática
    descripcion_sistematica: {
      finalidades_detalladas: '',
      interes_legitimo_evaluacion: '',
      categorias_datos_detalle: '',
      categorias_titulares_detalle: '',
      destinatarios_detalle: '',
      transferencias_detalle: '',
      plazos_supresion: ''
    },
    
    // Paso 4: Evaluación de Necesidad y Proporcionalidad
    necesidad_proporcionalidad: {
      necesidad_evaluacion: '',
      proporcionalidad_evaluacion: '',
      alternativas_consideradas: '',
      justificacion_final: ''
    },
    
    // Paso 5: Identificación y Evaluación de Riesgos
    evaluacion_riesgos: {
      riesgos_identificados: [],
      probabilidad_impacto: {},
      evaluacion_gravedad: '',
      afectacion_derechos: ''
    },
    
    // Paso 6: Medidas de Mitigación
    medidas_mitigacion: {
      medidas_tecnicas: [],
      medidas_organizativas: [],
      garantias_implementadas: '',
      riesgo_residual: '',
      plan_contingencia: ''
    },
    
    // Paso 7: Conclusiones y Aprobación
    conclusiones: {
      evaluacion_final: '',
      recomendaciones: '',
      consulta_previa_requerida: false,
      justificacion_consulta: '',
      fecha_revision: '',
      aprobado_por: ''
    }
  });

  const steps = [
    'Información General',
    'Criterios de Necesidad',
    'Descripción Sistemática', 
    'Necesidad y Proporcionalidad',
    'Evaluación de Riesgos',
    'Medidas de Mitigación',
    'Conclusiones y Aprobación'
  ];

  useEffect(() => {
    if (ratId) {
      cargarRATParaEIPD();
    }
  }, [ratId]);

  const cargarRATParaEIPD = async () => {
    try {
      setLoading(true);
      const rat = await ratService.getRATById(ratId);
      setRatData(rat);
      
      // Pre-llenar datos desde el RAT
      setEipdData(prev => ({
        ...prev,
        general: {
          ...prev.general,
          nombre_evaluacion: `EIPD - ${rat.nombre_actividad}`,
          descripcion_actividad: rat.finalidad_principal || rat.descripcion,
          area_responsable: rat.area_responsable,
          relacionado_rat_id: ratId
        },
        descripcion_sistematica: {
          ...prev.descripcion_sistematica,
          finalidades_detalladas: rat.finalidad_principal || '',
          categorias_datos_detalle: JSON.stringify(rat.categorias_datos || {}),
          destinatarios_detalle: (rat.destinatarios_internos || []).join(', '),
          transferencias_detalle: (rat.transferencias_internacionales || []).join(', ')
        }
      }));
      
    } catch (error) {
      console.error('Error cargando RAT para EIPD:', error);
    } finally {
      setLoading(false);
    }
  };

  const evaluarNecesidadEIPD = () => {
    const criterios = eipdData.criterios_necesidad;
    return criterios.datos_sensibles || 
           criterios.decisiones_automatizadas || 
           criterios.observacion_sistematica || 
           criterios.nuevas_tecnologias || 
           criterios.datos_menores_masivo || 
           criterios.combinacion_fuentes;
  };

  const calcularNivelRiesgo = () => {
    const riesgos = eipdData.evaluacion_riesgos.riesgos_identificados;
    const altosRiesgos = riesgos.filter(r => r.nivel === 'ALTO').length;
    const mediosRiesgos = riesgos.filter(r => r.nivel === 'MEDIO').length;
    
    if (altosRiesgos > 0) return 'ALTO';
    if (mediosRiesgos > 2) return 'MEDIO';
    return 'BAJO';
  };

  const guardarEIPD = async () => {
    try {
      setLoading(true);
      
      const eipdCompleta = {
        ...eipdData,
        nivel_riesgo_final: calcularNivelRiesgo(),
        requiere_consulta_previa: evaluarNecesidadEIPD() && calcularNivelRiesgo() === 'ALTO',
        fecha_creacion: new Date().toISOString(),
        estado: 'COMPLETADA'
      };

      // Guardar EIPD en Supabase
      const { data: eipdCreated, error } = await ratService.supabase
        .from('evaluaciones_impacto')
        .insert([{
          tenant_id: currentTenant?.id,
          rat_id: ratId,
          nombre_evaluacion: eipdCompleta.general.nombre_evaluacion,
          contenido_eipd: eipdCompleta,
          nivel_riesgo: eipdCompleta.nivel_riesgo_final,
          requiere_consulta_previa: eipdCompleta.requiere_consulta_previa,
          estado: 'COMPLETADA',
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      // Si viene desde un RAT, actualizar el RAT para indicar que tiene EIPD
      if (ratId) {
        await ratService.updateRAT(ratId, {
          tiene_eipd: true,
          eipd_id: eipdCreated[0].id,
          updated_at: new Date().toISOString()
        });
      }

      alert('EIPD creada exitosamente');
      navigate(ratId ? `/rat-edit/${ratId}` : '/compliance-metrics');
      
    } catch (error) {
      console.error('Error guardando EIPD:', error);
      alert('Error al guardar EIPD');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderInformacionGeneral();
      case 1:
        return renderCriteriosNecesidad();
      case 2:
        return renderDescripcionSistematica();
      case 3:
        return renderNecesidadProporcionalidad();
      case 4:
        return renderEvaluacionRiesgos();
      case 5:
        return renderMedidasMitigacion();
      case 6:
        return renderConclusiones();
      default:
        return null;
    }
  };

  const renderInformacionGeneral = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ color: '#f9fafb', mb: 2 }}>
          Información General de la EIPD
        </Typography>
        <Typography variant="body2" sx={{ color: '#9ca3af', mb: 3 }}>
          Art. 25 Ley 21.719 - Evaluación obligatoria para actividades de alto riesgo
        </Typography>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Nombre de la Evaluación"
          value={eipdData.general.nombre_evaluacion}
          onChange={(e) => setEipdData(prev => ({
            ...prev,
            general: { ...prev.general, nombre_evaluacion: e.target.value }
          }))}
          sx={getTextFieldStyles()}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Evaluador Responsable"
          value={eipdData.general.evaluador}
          onChange={(e) => setEipdData(prev => ({
            ...prev,
            general: { ...prev.general, evaluador: e.target.value }
          }))}
          sx={getTextFieldStyles()}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Descripción de la Actividad de Tratamiento"
          value={eipdData.general.descripcion_actividad}
          onChange={(e) => setEipdData(prev => ({
            ...prev,
            general: { ...prev.general, descripcion_actividad: e.target.value }
          }))}
          sx={getTextFieldStyles()}
        />
      </Grid>

      {ratData && (
        <Grid item xs={12}>
          <Alert severity="info" sx={{ bgcolor: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.3)' }}>
            <Typography variant="body2">
              📋 <strong>RAT Relacionado:</strong> {ratData.nombre_actividad} 
              <br />Esta EIPD está siendo creada para el RAT existente.
            </Typography>
          </Alert>
        </Grid>
      )}
    </Grid>
  );

  const renderCriteriosNecesidad = () => (
    <Box>
      <Typography variant="h6" sx={{ color: '#f9fafb', mb: 2 }}>
        Criterios de Necesidad de EIPD
      </Typography>
      <Typography variant="body2" sx={{ color: '#9ca3af', mb: 3 }}>
        Marcar todos los criterios que aplican según Art. 25 Ley 21.719
      </Typography>
      
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={eipdData.criterios_necesidad.datos_sensibles}
              onChange={(e) => setEipdData(prev => ({
                ...prev,
                criterios_necesidad: { ...prev.criterios_necesidad, datos_sensibles: e.target.checked }
              }))}
              sx={{ color: '#ef4444' }}
            />
          }
          label={
            <Box>
              <Typography sx={{ color: '#f9fafb', fontWeight: 'bold' }}>
                Tratamiento de datos sensibles a gran escala
              </Typography>
              <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                Art. 2 g) - Datos que revelan origen étnico, opiniones políticas, salud, etc.
              </Typography>
            </Box>
          }
          sx={{ mb: 2 }}
        />
        
        <FormControlLabel
          control={
            <Checkbox
              checked={eipdData.criterios_necesidad.decisiones_automatizadas}
              onChange={(e) => setEipdData(prev => ({
                ...prev,
                criterios_necesidad: { ...prev.criterios_necesidad, decisiones_automatizadas: e.target.checked }
              }))}
              sx={{ color: '#ef4444' }}
            />
          }
          label={
            <Box>
              <Typography sx={{ color: '#f9fafb', fontWeight: 'bold' }}>
                Decisiones automatizadas con efectos legales significativos
              </Typography>
              <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                Algoritmos, IA, perfilado que afecte derechos o intereses
              </Typography>
            </Box>
          }
          sx={{ mb: 2 }}
        />
        
        <FormControlLabel
          control={
            <Checkbox
              checked={eipdData.criterios_necesidad.observacion_sistematica}
              onChange={(e) => setEipdData(prev => ({
                ...prev,
                criterios_necesidad: { ...prev.criterios_necesidad, observacion_sistematica: e.target.checked }
              }))}
              sx={{ color: '#f59e0b' }}
            />
          }
          label={
            <Box>
              <Typography sx={{ color: '#f9fafb', fontWeight: 'bold' }}>
                Observación sistemática de espacios públicos
              </Typography>
              <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                Videovigilancia, seguimiento GPS, monitoreo comportamiento
              </Typography>
            </Box>
          }
          sx={{ mb: 2 }}
        />
        
        <FormControlLabel
          control={
            <Checkbox
              checked={eipdData.criterios_necesidad.nuevas_tecnologias}
              onChange={(e) => setEipdData(prev => ({
                ...prev,
                criterios_necesidad: { ...prev.criterios_necesidad, nuevas_tecnologias: e.target.checked }
              }))}
              sx={{ color: '#8b5cf6' }}
            />
          }
          label={
            <Box>
              <Typography sx={{ color: '#f9fafb', fontWeight: 'bold' }}>
                Uso de nuevas tecnologías
              </Typography>
              <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                IA, IoT, blockchain, biometría, reconocimiento facial
              </Typography>
            </Box>
          }
          sx={{ mb: 2 }}
        />
        
        <FormControlLabel
          control={
            <Checkbox
              checked={eipdData.criterios_necesidad.datos_menores_masivo}
              onChange={(e) => setEipdData(prev => ({
                ...prev,
                criterios_necesidad: { ...prev.criterios_necesidad, datos_menores_masivo: e.target.checked }
              }))}
              sx={{ color: '#ef4444' }}
            />
          }
          label={
            <Box>
              <Typography sx={{ color: '#f9fafb', fontWeight: 'bold' }}>
                Tratamiento masivo de datos de menores
              </Typography>
              <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                Aplicaciones educativas, juegos, redes sociales para menores
              </Typography>
            </Box>
          }
          sx={{ mb: 2 }}
        />
        
        <FormControlLabel
          control={
            <Checkbox
              checked={eipdData.criterios_necesidad.combinacion_fuentes}
              onChange={(e) => setEipdData(prev => ({
                ...prev,
                criterios_necesidad: { ...prev.criterios_necesidad, combinacion_fuentes: e.target.checked }
              }))}
              sx={{ color: '#f59e0b' }}
            />
          }
          label={
            <Box>
              <Typography sx={{ color: '#f9fafb', fontWeight: 'bold' }}>
                Combinación de múltiples fuentes de datos
              </Typography>
              <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                Cross-referencing, data matching, perfilado complejo
              </Typography>
            </Box>
          }
          sx={{ mb: 3 }}
        />
      </FormGroup>

      {evaluarNecesidadEIPD() && (
        <Alert 
          severity="warning"
          sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
        >
          <Typography variant="body2">
            ⚠️ <strong>EIPD OBLIGATORIA:</strong> Esta actividad cumple criterios que requieren 
            Evaluación de Impacto obligatoria según Art. 25 Ley 21.719.
          </Typography>
        </Alert>
      )}
      
      <TextField
        fullWidth
        multiline
        rows={3}
        label="Otros criterios de riesgo identificados"
        value={eipdData.criterios_necesidad.otros_criterios}
        onChange={(e) => setEipdData(prev => ({
          ...prev,
          criterios_necesidad: { ...prev.criterios_necesidad, otros_criterios: e.target.value }
        }))}
        sx={{ ...getTextFieldStyles(), mt: 3 }}
        placeholder="Describir otros factores de riesgo específicos..."
      />
    </Box>
  );

  const renderDescripcionSistematica = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ color: '#f9fafb', mb: 2 }}>
          Descripción Sistemática del Tratamiento
        </Typography>
        <Typography variant="body2" sx={{ color: '#9ca3af', mb: 3 }}>
          Documentación detallada del tratamiento para evaluación de impacto
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Finalidades específicas y explícitas"
          value={eipdData.descripcion_sistematica.finalidades_detalladas}
          onChange={(e) => setEipdData(prev => ({
            ...prev,
            descripcion_sistematica: { ...prev.descripcion_sistematica, finalidades_detalladas: e.target.value }
          }))}
          sx={getTextFieldStyles()}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Categorías de datos personales"
          value={eipdData.descripcion_sistematica.categorias_datos_detalle}
          onChange={(e) => setEipdData(prev => ({
            ...prev,
            descripcion_sistematica: { ...prev.descripcion_sistematica, categorias_datos_detalle: e.target.value }
          }))}
          sx={getTextFieldStyles()}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Categorías de titulares"
          value={eipdData.descripcion_sistematica.categorias_titulares_detalle}
          onChange={(e) => setEipdData(prev => ({
            ...prev,
            descripcion_sistematica: { ...prev.descripcion_sistematica, categorias_titulares_detalle: e.target.value }
          }))}
          sx={getTextFieldStyles()}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Destinatarios de los datos"
          value={eipdData.descripcion_sistematica.destinatarios_detalle}
          onChange={(e) => setEipdData(prev => ({
            ...prev,
            descripcion_sistematica: { ...prev.descripcion_sistematica, destinatarios_detalle: e.target.value }
          }))}
          sx={getTextFieldStyles()}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Plazos de supresión previstos"
          value={eipdData.descripcion_sistematica.plazos_supresion}
          onChange={(e) => setEipdData(prev => ({
            ...prev,
            descripcion_sistematica: { ...prev.descripcion_sistematica, plazos_supresion: e.target.value }
          }))}
          sx={getTextFieldStyles()}
        />
      </Grid>
    </Grid>
  );

  const renderEvaluacionRiesgos = () => (
    <Box>
      <Typography variant="h6" sx={{ color: '#f9fafb', mb: 2 }}>
        Evaluación de Riesgos para los Derechos y Libertades
      </Typography>
      <Typography variant="body2" sx={{ color: '#9ca3af', mb: 3 }}>
        Identificar y evaluar riesgos específicos para los titulares de datos
      </Typography>

      {/* Matriz de Riesgos */}
      <Card sx={{ bgcolor: '#374151', border: '1px solid #4b5563', mb: 3 }}>
        <CardHeader 
          title="Matriz de Evaluación de Riesgos"
          sx={{ color: '#f9fafb', py: 2 }}
        />
        <CardContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#9ca3af', borderColor: '#4b5563' }}>Factor de Riesgo</TableCell>
                  <TableCell sx={{ color: '#9ca3af', borderColor: '#4b5563' }}>Probabilidad</TableCell>
                  <TableCell sx={{ color: '#9ca3af', borderColor: '#4b5563' }}>Impacto</TableCell>
                  <TableCell sx={{ color: '#9ca3af', borderColor: '#4b5563' }}>Nivel Final</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  'Acceso no autorizado',
                  'Uso indebido datos sensibles',
                  'Pérdida de datos',
                  'Discriminación automatizada',
                  'Violación privacidad',
                  'Daño reputacional',
                  'Impacto económico titular'
                ].map((factor, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ color: '#f9fafb', borderColor: '#4b5563' }}>
                      {factor}
                    </TableCell>
                    <TableCell sx={{ borderColor: '#4b5563' }}>
                      <FormControl size="small">
                        <Select
                          value={eipdData.evaluacion_riesgos.probabilidad_impacto?.[factor]?.probabilidad || ''}
                          onChange={(e) => setEipdData(prev => ({
                            ...prev,
                            evaluacion_riesgos: {
                              ...prev.evaluacion_riesgos,
                              probabilidad_impacto: {
                                ...prev.evaluacion_riesgos.probabilidad_impacto,
                                [factor]: {
                                  ...prev.evaluacion_riesgos.probabilidad_impacto[factor],
                                  probabilidad: e.target.value
                                }
                              }
                            }
                          }))}
                          sx={{ bgcolor: '#1f2937', color: '#f9fafb', minWidth: 100 }}
                        >
                          <MenuItem value="BAJA">Baja</MenuItem>
                          <MenuItem value="MEDIA">Media</MenuItem>
                          <MenuItem value="ALTA">Alta</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell sx={{ borderColor: '#4b5563' }}>
                      <FormControl size="small">
                        <Select
                          value={eipdData.evaluacion_riesgos.probabilidad_impacto?.[factor]?.impacto || ''}
                          onChange={(e) => setEipdData(prev => ({
                            ...prev,
                            evaluacion_riesgos: {
                              ...prev.evaluacion_riesgos,
                              probabilidad_impacto: {
                                ...prev.evaluacion_riesgos.probabilidad_impacto,
                                [factor]: {
                                  ...prev.evaluacion_riesgos.probabilidad_impacto[factor],
                                  impacto: e.target.value
                                }
                              }
                            }
                          }))}
                          sx={{ bgcolor: '#1f2937', color: '#f9fafb', minWidth: 100 }}
                        >
                          <MenuItem value="BAJO">Bajo</MenuItem>
                          <MenuItem value="MEDIO">Medio</MenuItem>
                          <MenuItem value="ALTO">Alto</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell sx={{ borderColor: '#4b5563' }}>
                      {(() => {
                        const prob = eipdData.evaluacion_riesgos.probabilidad_impacto?.[factor]?.probabilidad;
                        const impact = eipdData.evaluacion_riesgos.probabilidad_impacto?.[factor]?.impacto;
                        let nivel = 'BAJO';
                        
                        if ((prob === 'ALTA' && impact === 'ALTO') || 
                            (prob === 'ALTA' && impact === 'MEDIO') ||
                            (prob === 'MEDIA' && impact === 'ALTO')) {
                          nivel = 'ALTO';
                        } else if ((prob === 'MEDIA' && impact === 'MEDIO') ||
                                   (prob === 'BAJA' && impact === 'ALTO') ||
                                   (prob === 'ALTA' && impact === 'BAJO')) {
                          nivel = 'MEDIO';
                        }
                        
                        const colorMap = { 'ALTO': '#ef4444', 'MEDIO': '#f59e0b', 'BAJO': '#10b981' };
                        return (
                          <Chip 
                            label={nivel}
                            size="small"
                            sx={{ bgcolor: colorMap[nivel], color: '#fff', fontWeight: 'bold' }}
                          />
                        );
                      })()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <TextField
        fullWidth
        multiline
        rows={4}
        label="Evaluación general de la gravedad del riesgo"
        value={eipdData.evaluacion_riesgos.evaluacion_gravedad}
        onChange={(e) => setEipdData(prev => ({
          ...prev,
          evaluacion_riesgos: { ...prev.evaluacion_riesgos, evaluacion_gravedad: e.target.value }
        }))}
        sx={getTextFieldStyles()}
        placeholder="Describir el análisis de gravedad del riesgo identificado..."
      />
    </Box>
  );

  const renderNecesidadProporcionalidad = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ color: '#f9fafb', mb: 2 }}>
          Evaluación de Necesidad y Proporcionalidad
        </Typography>
        <Typography variant="body2" sx={{ color: '#9ca3af', mb: 3 }}>
          Justificación de la necesidad del tratamiento y proporcionalidad de los medios
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Evaluación de Necesidad"
          value={eipdData.necesidad_proporcionalidad.necesidad_evaluacion}
          onChange={(e) => setEipdData(prev => ({
            ...prev,
            necesidad_proporcionalidad: { ...prev.necesidad_proporcionalidad, necesidad_evaluacion: e.target.value }
          }))}
          sx={getTextFieldStyles()}
          placeholder="¿Es necesario este tratamiento para cumplir la finalidad declarada?"
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Evaluación de Proporcionalidad"
          value={eipdData.necesidad_proporcionalidad.proporcionalidad_evaluacion}
          onChange={(e) => setEipdData(prev => ({
            ...prev,
            necesidad_proporcionalidad: { ...prev.necesidad_proporcionalidad, proporcionalidad_evaluacion: e.target.value }
          }))}
          sx={getTextFieldStyles()}
          placeholder="¿Son los medios proporcionados a la finalidad perseguida?"
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Alternativas menos invasivas consideradas"
          value={eipdData.necesidad_proporcionalidad.alternativas_consideradas}
          onChange={(e) => setEipdData(prev => ({
            ...prev,
            necesidad_proporcionalidad: { ...prev.necesidad_proporcionalidad, alternativas_consideradas: e.target.value }
          }))}
          sx={getTextFieldStyles()}
          placeholder="¿Se evaluaron alternativas que afecten menos la privacidad?"
        />
      </Grid>
    </Grid>
  );

  const renderMedidasMitigacion = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ color: '#f9fafb', mb: 2 }}>
          Medidas de Mitigación y Garantías
        </Typography>
        <Typography variant="body2" sx={{ color: '#9ca3af', mb: 3 }}>
          Definir medidas técnicas y organizativas para reducir riesgos identificados
        </Typography>
      </Grid>
      
      {/* Medidas Técnicas */}
      <Grid item xs={12} md={6}>
        <Card sx={{ bgcolor: '#374151', border: '1px solid #4b5563' }}>
          <CardHeader 
            title="Medidas Técnicas"
            sx={{ color: '#f9fafb', py: 2 }}
          />
          <CardContent>
            <FormGroup>
              {[
                'Cifrado de datos en reposo',
                'Cifrado de datos en tránsito',
                'Control de acceso basado en roles',
                'Autenticación multifactor',
                'Monitoreo de accesos',
                'Backup cifrado',
                'Anonimización/Pseudonimización',
                'Minimización de datos'
              ].map((medida) => (
                <FormControlLabel
                  key={medida}
                  control={
                    <Checkbox
                      checked={eipdData.medidas_mitigacion.medidas_tecnicas.includes(medida)}
                      onChange={(e) => {
                        const newMedidas = e.target.checked
                          ? [...eipdData.medidas_mitigacion.medidas_tecnicas, medida]
                          : eipdData.medidas_mitigacion.medidas_tecnicas.filter(m => m !== medida);
                        setEipdData(prev => ({
                          ...prev,
                          medidas_mitigacion: { ...prev.medidas_mitigacion, medidas_tecnicas: newMedidas }
                        }));
                      }}
                      sx={{ color: '#4f46e5' }}
                    />
                  }
                  label={<Typography variant="body2" sx={{ color: '#f9fafb' }}>{medida}</Typography>}
                />
              ))}
            </FormGroup>
          </CardContent>
        </Card>
      </Grid>
      
      {/* Medidas Organizativas */}
      <Grid item xs={12} md={6}>
        <Card sx={{ bgcolor: '#374151', border: '1px solid #4b5563' }}>
          <CardHeader 
            title="Medidas Organizativas"
            sx={{ color: '#f9fafb', py: 2 }}
          />
          <CardContent>
            <FormGroup>
              {[
                'Políticas de privacidad',
                'Capacitación del personal',
                'Designación DPO',
                'Procedimientos respuesta incidentes',
                'Auditorías regulares',
                'Contratos DPA con proveedores',
                'Evaluaciones de riesgo periódicas',
                'Registro de actividades'
              ].map((medida) => (
                <FormControlLabel
                  key={medida}
                  control={
                    <Checkbox
                      checked={eipdData.medidas_mitigacion.medidas_organizativas.includes(medida)}
                      onChange={(e) => {
                        const newMedidas = e.target.checked
                          ? [...eipdData.medidas_mitigacion.medidas_organizativas, medida]
                          : eipdData.medidas_mitigacion.medidas_organizativas.filter(m => m !== medida);
                        setEipdData(prev => ({
                          ...prev,
                          medidas_mitigacion: { ...prev.medidas_mitigacion, medidas_organizativas: newMedidas }
                        }));
                      }}
                      sx={{ color: '#4f46e5' }}
                    />
                  }
                  label={<Typography variant="body2" sx={{ color: '#f9fafb' }}>{medida}</Typography>}
                />
              ))}
            </FormGroup>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Descripción del riesgo residual"
          value={eipdData.medidas_mitigacion.riesgo_residual}
          onChange={(e) => setEipdData(prev => ({
            ...prev,
            medidas_mitigacion: { ...prev.medidas_mitigacion, riesgo_residual: e.target.value }
          }))}
          sx={getTextFieldStyles()}
          placeholder="Describir el riesgo que permanece después de implementar las medidas..."
        />
      </Grid>
    </Grid>
  );

  const renderConclusiones = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ color: '#f9fafb', mb: 2 }}>
          Conclusiones y Decisión Final
        </Typography>
      </Grid>
      
      {/* Resumen de la EIPD */}
      <Grid item xs={12}>
        <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
          <CardHeader 
            title="Resumen de la Evaluación"
            sx={{ color: '#f9fafb' }}
          />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" sx={{ 
                    color: calcularNivelRiesgo() === 'ALTO' ? '#ef4444' : 
                           calcularNivelRiesgo() === 'MEDIO' ? '#f59e0b' : '#10b981',
                    fontWeight: 700
                  }}>
                    {calcularNivelRiesgo()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                    Nivel de Riesgo Final
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" sx={{ 
                    color: evaluarNecesidadEIPD() ? '#ef4444' : '#10b981',
                    fontWeight: 700
                  }}>
                    {evaluarNecesidadEIPD() ? 'SÍ' : 'NO'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                    EIPD Obligatoria
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" sx={{ 
                    color: (evaluarNecesidadEIPD() && calcularNivelRiesgo() === 'ALTO') ? '#ef4444' : '#10b981',
                    fontWeight: 700
                  }}>
                    {(evaluarNecesidadEIPD() && calcularNivelRiesgo() === 'ALTO') ? 'SÍ' : 'NO'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                    Consulta Previa APDP
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {(evaluarNecesidadEIPD() && calcularNivelRiesgo() === 'ALTO') && (
              <Alert severity="error" sx={{ mt: 2, bgcolor: 'rgba(239, 68, 68, 0.1)' }}>
                🚨 <strong>CONSULTA PREVIA REQUERIDA:</strong> Esta actividad requiere consulta previa 
                a la Agencia de Protección de Datos Personales antes de iniciar el tratamiento.
              </Alert>
            )}
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Evaluación Final y Recomendaciones"
          value={eipdData.conclusiones.evaluacion_final}
          onChange={(e) => setEipdData(prev => ({
            ...prev,
            conclusiones: { ...prev.conclusiones, evaluacion_final: e.target.value }
          }))}
          sx={getTextFieldStyles()}
          placeholder="Conclusión final sobre la viabilidad del tratamiento y medidas necesarias..."
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Recomendaciones de Implementación"
          value={eipdData.conclusiones.recomendaciones}
          onChange={(e) => setEipdData(prev => ({
            ...prev,
            conclusiones: { ...prev.conclusiones, recomendaciones: e.target.value }
          }))}
          sx={getTextFieldStyles()}
          placeholder="Recomendaciones específicas para la implementación segura..."
        />
      </Grid>
    </Grid>
  );

  const getTextFieldStyles = () => ({
    '& .MuiOutlinedInput-root': {
      bgcolor: '#374151',
      color: '#f9fafb',
      '& fieldset': { borderColor: '#4b5563' },
      '&:hover fieldset': { borderColor: '#6b7280' },
      '&.Mui-focused fieldset': { borderColor: '#4f46e5' },
    },
    '& .MuiInputLabel-root': { color: '#9ca3af' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#4f46e5' }
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#111827', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ 
            color: '#f9fafb', 
            fontWeight: 700, 
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <SecurityIcon sx={{ fontSize: 40, color: '#ef4444' }} />
            Evaluación de Impacto en Protección de Datos (EIPD)
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#9ca3af' }}>
            Art. 25 Ley 21.719 - Evaluación obligatoria para actividades de alto riesgo
          </Typography>
        </Box>

        {/* Stepper */}
        <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151', p: 3, mb: 3 }}>
          <Stepper 
            activeStep={currentStep}
            sx={{ 
              '& .MuiStepLabel-label': { color: '#9ca3af' },
              '& .MuiStepLabel-label.Mui-active': { color: '#ef4444' },
              '& .MuiStepLabel-label.Mui-completed': { color: '#10b981' }
            }}
          >
            {steps.map((label, index) => (
              <Step 
                key={label}
                sx={{ cursor: 'pointer' }}
                onClick={() => setCurrentStep(index)}
              >
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Contenido del paso */}
        <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151', p: 4, mb: 3 }}>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#ef4444' }} />
              <Typography sx={{ color: '#9ca3af', mt: 2 }}>
                Cargando datos para EIPD...
              </Typography>
            </Box>
          ) : (
            renderStepContent(currentStep)
          )}
        </Paper>

        {/* Navegación */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            sx={{ color: '#9ca3af' }}
          >
            Anterior
          </Button>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {/* Botón Guardar Borrador en cualquier paso */}
            <Button
              variant="outlined"
              onClick={async () => {
                try {
                  await guardarEIPD();
                  alert('✅ EIPD guardada como borrador');
                } catch (error) {
                  alert('❌ Error guardando borrador');
                }
              }}
              sx={{ 
                borderColor: '#6b7280',
                color: '#9ca3af',
                '&:hover': { borderColor: '#4b5563' }
              }}
            >
              Guardar Borrador
            </Button>
            
            {/* Botón Ver Lista EIPDs */}
            <Button
              variant="outlined"
              onClick={() => navigate('/eipd-list')}
              sx={{ 
                borderColor: '#4f46e5',
                color: '#60a5fa',
                '&:hover': { borderColor: '#3730a3' }
              }}
            >
              Ver EIPDs Guardadas
            </Button>
            
            {currentStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={guardarEIPD}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} /> : <CheckIcon />}
                sx={{ 
                  bgcolor: '#10b981', 
                  '&:hover': { bgcolor: '#059669' },
                  px: 4
                }}
              >
                {loading ? 'Guardando...' : 'Completar EIPD'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                sx={{ 
                  bgcolor: '#4f46e5',
                  '&:hover': { bgcolor: '#3730a3' }
                }}
              >
                Siguiente
              </Button>
            )}
          </Box>
        </Box>

        {/* Información del RAT vinculado */}
        {ratId && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="info" sx={{ bgcolor: 'rgba(79, 70, 229, 0.1)' }}>
              <Typography variant="body2">
                📋 Esta EIPD está vinculada al RAT #{ratId}
              </Typography>
            </Alert>
          </Box>
        )}
        
        {/* Información Legal */}
        <Box sx={{ mt: 4 }}>
          <Alert 
            severity="info"
            sx={{
              bgcolor: 'rgba(79, 70, 229, 0.1)',
              border: '1px solid rgba(79, 70, 229, 0.3)',
              color: '#f9fafb'
            }}
          >
            <Typography variant="body2">
              ⚖️ <strong>Art. 25 Ley 21.719:</strong> La EIPD es obligatoria cuando el tratamiento 
              pueda entrañar un alto riesgo para los derechos y libertades de las personas naturales.
            </Typography>
          </Alert>
        </Box>
      </Container>
    </Box>
  );
};

export default EIPDCreator;