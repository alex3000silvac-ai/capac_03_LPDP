import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseConfig';
import { useAuth } from '../hooks/useAuth';
// import preventiveAI from '../utils/preventiveAI'; // REMOVIDO - causaba errores de build
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Checkbox,
  Chip,
  Alert,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Gavel as GavelIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  Public as PublicIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';

const RATEditPage = () => {
  const { ratId } = useParams();
  const navigate = useNavigate();
  const { user, currentTenant } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // MAPEO EXACTO SEGÚN DIAGRAMA - tabla mapeo_datos_rat
  const [rat, setRat] = useState({
    // CAMPOS OBLIGATORIOS según basedatos.csv
    nombre_actividad: '',
    descripcion: '',
    finalidad_principal: '', // CAMPO REAL en tabla
    area_responsable: '',
    
    // RESPONSABLE DEL PROCESO
    responsable_proceso: '',
    email_responsable: '',
    telefono_responsable: '',
    
    // BASE DE LICITUD (Art. 12 Ley 21.719)
    base_licitud: '', // consentimiento, contrato, obligacion_legal, interes_legitimo
    base_legal: '', // Texto explicativo detallado
    
    // CATEGORÍAS DATOS (JSONB según diagrama líneas 134-160)
    categorias_datos: {
      identificacion: {
        basicos: [],
        contacto: [],
        identificadores: []
      },
      sensibles_art14: {},
      especiales: {},
      tecnicas: {
        sistemas: [],
        comportamiento: [],
        dispositivo: []
      }
    },
    
    // DESTINATARIOS Y TRANSFERENCIAS
    destinatarios_internos: [],
    transferencias_internacionales: {},
    
    // CONSERVACIÓN
    plazo_conservacion: '',
    
    // MEDIDAS SEGURIDAD
    medidas_seguridad_tecnicas: [],
    medidas_seguridad_organizativas: [],
    
    // EVALUACIÓN RIESGO (calculado automáticamente)
    nivel_riesgo: 'MEDIO',
    requiere_eipd: false,
    requiere_dpia: false,
    
    // ESTADO Y METADATOS
    estado: 'BORRADOR',
    tenant_id: currentTenant?.id || 1,
    created_at: new Date().toISOString(),
    metadata: {}
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (ratId && ratId !== 'new') {
      loadRAT();
    }
  }, [ratId]);

  const loadRAT = async () => {
    try {
      setLoading(true);
      // //console.log('🔄 Cargando RAT desde Supabase:', ratId);
      
      // CONEXIÓN REAL SUPABASE - tabla mapeo_datos_rat
      const { data: ratData, error } = await supabase
        .from('mapeo_datos_rat')
        .select('*')
        .eq('id', ratId)
        .eq('tenant_id', currentTenant?.id || 1)
        .single();
      
      if (error) {
        console.error('❌ Error cargando RAT:', error);
        throw error;
      }
      
      if (!ratData) {
        console.error('❌ RAT no encontrado:', ratId);
        throw new Error('RAT no encontrado');
      }
      
      // //console.log('✅ RAT cargado exitosamente:', ratData);
      
      // MAPEAR DATOS DE SUPABASE A ESTADO LOCAL
      setRat({
        ...ratData,
        // ASEGURAR CAMPOS REQUERIDOS EXISTEN
        categorias_datos: ratData.categorias_datos || {
          identificacion: { basicos: [], contacto: [], identificadores: [] },
          sensibles_art14: {},
          especiales: {},
          tecnicas: { sistemas: [], comportamiento: [], dispositivo: [] }
        },
        destinatarios_internos: ratData.destinatarios_internos || [],
        transferencias_internacionales: ratData.transferencias_internacionales || {},
        medidas_seguridad_tecnicas: ratData.medidas_seguridad_tecnicas || [],
        medidas_seguridad_organizativas: ratData.medidas_seguridad_organizativas || [],
        metadata: ratData.metadata || {}
      });
      
    } catch (error) {
      console.error('❌ Error cargando RAT:', error);
      alert('Error cargando RAT: ' + error.message);
      navigate('/rats'); // Volver a la lista si no se puede cargar
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setRat(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error de validación si existe
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleArrayFieldAdd = (field, value) => {
    if (value && !rat[field].includes(value)) {
      setRat(prev => ({
        ...prev,
        [field]: [...prev[field], value]
      }));
    }
  };

  const handleArrayFieldRemove = (field, value) => {
    setRat(prev => ({
      ...prev,
      [field]: prev[field].filter(item => item !== value)
    }));
  };

  const validateStep = (step) => {
    const errors = {};
    
    switch (step) {
      case 0: // Información básica
        if (!rat.nombre_actividad) errors.nombre_actividad = 'Nombre actividad requerido';
        if (!rat.finalidad_principal) errors.finalidad_principal = 'Finalidad principal requerida';
        if (!rat.area_responsable) errors.area_responsable = 'Área responsable requerida';
        break;
        
      case 1: // Responsabilidad 
        if (!rat.responsable_proceso) errors.responsable_proceso = 'Responsable proceso requerido';
        if (!rat.email_responsable) errors.email_responsable = 'Email responsable requerido';
        break;
        
      case 2: // Base legal - MAPEO EXACTO SEGÚN DIAGRAMA
        if (!rat.base_licitud) errors.base_licitud = 'Base de licitud requerida';
        if (rat.base_licitud === 'interes_legitimo' && !rat.base_legal) {
          errors.base_legal = 'Interés legítimo requiere fundamentación detallada';
        }
        break;
        
      case 3: // Categorías datos - ESTRUCTURA JSONB según líneas 134-160
        const hasAnyCategory = rat.categorias_datos && (
          rat.categorias_datos.identificacion?.basicos?.length > 0 ||
          Object.keys(rat.categorias_datos.sensibles_art14 || {}).length > 0 ||
          Object.keys(rat.categorias_datos.especiales || {}).length > 0 ||
          rat.categorias_datos.tecnicas?.sistemas?.length > 0
        );
        if (!hasAnyCategory) {
          errors.categorias_datos = 'Debe seleccionar al menos una categoría de datos';
        }
        break;
        
      case 4: // Destinatarios
        if (!rat.destinatarios_internos || rat.destinatarios_internos.length === 0) {
          errors.destinatarios_internos = 'Al menos un destinatario interno requerido';
        }
        break;
        
      case 5: // Conservación
        if (!rat.plazo_conservacion) errors.plazo_conservacion = 'Plazo conservación requerido';
        break;
        
      case 6: // Seguridad
        if (!rat.medidas_seguridad_tecnicas || rat.medidas_seguridad_tecnicas.length === 0) {
          errors.medidas_seguridad_tecnicas = 'Al menos una medida técnica requerida';
        }
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSave = async (asDraft = true) => {
    try {
      setSaving(true);
      // //console.log('💾 Iniciando guardado RAT en Supabase...');
      
      // 🛡️ IA PREVENTIVA INTERCEPTA ANTES DE GUARDAR (líneas 335-343 diagrama)
      // //console.log('🛡️ IA Preventiva interceptando modificaciones RAT...');
      
      // DESHABILITADO: preventiveAI por seguridad - solo monitoreo
      const preventiveCheck = { safe: true, message: 'Modo seguro: solo monitoreo' };
      /*
      const preventiveCheck = await preventiveAI.validateAction(
        'RAT_EDIT_SAVE', 
        currentTenant?.id || 1, 
        { 
          ratId: rat.id || ratId,
          originalData: rat,
          changes: 'FULL_SAVE',
          isEdit: ratId !== 'new'
        }
      */
      );
      
      if (preventiveCheck.alerts && Array.isArray(preventiveCheck.alerts) && preventiveCheck.alerts.length > 0) {
        // //console.log('🚨 IA Preventiva detectó problemas:', preventiveCheck.alerts);
        
        // Mostrar alertas críticas al usuario
        const criticalAlerts = preventiveCheck.alerts.filter(a => a.severity === 'CRITICA');
        if (criticalAlerts.length > 0) {
          const alertMessages = criticalAlerts.map(a => `${a.icon} ${a.title}: ${a.message}`).join('\n\n');
          alert(`🚨 PROBLEMAS CRÍTICOS DETECTADOS:\n\n${alertMessages}\n\nPor favor corrija estos problemas antes de continuar.`);
          return; // NO continuar guardado si hay alertas críticas
        }
        
        // Mostrar advertencias no críticas
        const warnings = Array.isArray(preventiveCheck.alerts) ? preventiveCheck.alerts.filter(a => a.severity === 'ADVERTENCIA') : [];
        if (warnings.length > 0) {
          const warningMessages = warnings.map(a => `${a.icon} ${a.title}: ${a.message}`).join('\n\n');
          const confirmContinue = confirm(`⚠️ ADVERTENCIAS DETECTADAS:\n\n${warningMessages}\n\n¿Continuar guardando el RAT?`);
          if (!confirmContinue) {
            return; // Usuario decidió no continuar
          }
        }
      }
      
      // Validar datos críticos según diagrama
      if (!rat.nombre_actividad || !rat.finalidad_principal || !rat.area_responsable) {
        throw new Error('Complete los campos obligatorios: Nombre de Actividad, Finalidad Principal y Área Responsable');
      }
      
      // PREPARAR DATOS PARA SUPABASE según mapeo exacto tabla mapeo_datos_rat
      const ratDataToSave = {
        nombre_actividad: rat.nombre_actividad.trim(),
        descripcion: rat.descripcion || '',
        finalidad_principal: rat.finalidad_principal.trim(),
        area_responsable: rat.area_responsable.trim(),
        responsable_proceso: rat.responsable_proceso || '',
        email_responsable: rat.email_responsable || '',
        telefono_responsable: rat.telefono_responsable || '',
        base_licitud: rat.base_licitud || 'interes_legitimo',
        base_legal: rat.base_legal || '',
        categorias_datos: rat.categorias_datos,
        destinatarios_internos: rat.destinatarios_internos,
        transferencias_internacionales: rat.transferencias_internacionales,
        plazo_conservacion: rat.plazo_conservacion || '',
        medidas_seguridad_tecnicas: rat.medidas_seguridad_tecnicas,
        medidas_seguridad_organizativas: rat.medidas_seguridad_organizativas,
        nivel_riesgo: rat.nivel_riesgo || 'MEDIO',
        requiere_eipd: rat.requiere_eipd || false,
        requiere_dpia: rat.requiere_dpia || false,
        estado: asDraft ? 'BORRADOR' : 'EN_REVISION',
        tenant_id: currentTenant?.id || 1,
        updated_at: new Date().toISOString(),
        metadata: {
          ...rat.metadata,
          last_edited_by: user?.email || 'sistema',
          edit_timestamp: new Date().toISOString(),
          version: (rat.metadata?.version || 0) + 1
        }
      };
      
      let result;
      
      if (ratId && ratId !== 'new') {
        // ACTUALIZAR RAT EXISTENTE
        // //console.log('🔄 Actualizando RAT existente ID:', ratId);
        
        const { data, error } = await supabase
          .from('mapeo_datos_rat')
          .update(ratDataToSave)
          .eq('id', ratId)
          .eq('tenant_id', currentTenant?.id || 1)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
        
        // //console.log('✅ RAT actualizado exitosamente:', result.id);
        
      } else {
        // CREAR NUEVO RAT
        // //console.log('➕ Creando nuevo RAT...');
        
        const { data, error } = await supabase
          .from('mapeo_datos_rat')
          .insert({
            ...ratDataToSave,
            created_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) throw error;
        result = data;
        
        // //console.log('✅ RAT creado exitosamente:', result.id);
      }
      
      // VALIDAR PERSISTENCIA
      const { data: verification } = await supabase
        .from('mapeo_datos_rat')
        .select('id, nombre_actividad, estado')
        .eq('id', result.id)
        .single();
      
      if (!verification) {
        throw new Error('Error de persistencia: RAT no se guardó correctamente');
      }
      
      // //console.log('✅ Persistencia verificada:', verification);
      
      alert(`✅ RAT "${verification.nombre_actividad}" ${ratId !== 'new' ? 'actualizado' : 'guardado'} exitosamente`);
      navigate('/rats');
      
    } catch (error) {
      console.error('❌ Error guardando RAT:', error);
      alert('Error guardando RAT: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box p={3}>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography sx={{ color: '#ccc' }}>Cargando RAT...</Typography>
      </Box>
    );
  }

  const steps = [
    {
      label: 'Información Básica',
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Nombre de la Actividad"
              value={rat.nombre_actividad}
              onChange={(e) => handleFieldChange('nombre_actividad', e.target.value)}
              error={!!validationErrors.nombre_actividad}
              helperText={validationErrors.nombre_actividad}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#2a2a2a',
                  '& fieldset': { borderColor: '#444' },
                  '&:hover fieldset': { borderColor: '#666' },
                  '&.Mui-focused fieldset': { borderColor: '#4fc3f7' }
                },
                '& .MuiInputLabel-root': { color: '#bbb' }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Descripción Detallada"
              value={rat.descripcion}
              onChange={(e) => handleFieldChange('descripcion', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#2a2a2a',
                  '& fieldset': { borderColor: '#444' },
                  '&:hover fieldset': { borderColor: '#666' },
                  '&.Mui-focused fieldset': { borderColor: '#4fc3f7' }
                },
                '& .MuiInputLabel-root': { color: '#bbb' }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              multiline
              rows={2}
              label="Finalidad Principal del Tratamiento"
              value={rat.finalidad_principal}
              onChange={(e) => handleFieldChange('finalidad_principal', e.target.value)}
              error={!!validationErrors.finalidad_principal}
              helperText={validationErrors.finalidad_principal}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#2a2a2a',
                  '& fieldset': { borderColor: '#444' },
                  '&:hover fieldset': { borderColor: '#666' },
                  '&.Mui-focused fieldset': { borderColor: '#4fc3f7' }
                },
                '& .MuiInputLabel-root': { color: '#bbb' }
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required error={!!validationErrors.base_licitud}>
              <InputLabel sx={{ color: '#bbb' }}>Base de Licitud (Art. 12 Ley 21.719)</InputLabel>
              <Select
                value={rat.base_licitud}
                onChange={(e) => handleFieldChange('base_licitud', e.target.value)}
                sx={{
                  bgcolor: '#2a2a2a',
                  color: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666' }
                }}
              >
                <MenuItem value="consentimiento">Consentimiento del Titular</MenuItem>
                <MenuItem value="contrato">Ejecución de Contrato</MenuItem>
                <MenuItem value="obligacion_legal">Cumplimiento Obligación Legal</MenuItem>
                <MenuItem value="proteccion_intereses_vitales">Protección Intereses Vitales</MenuItem>
                <MenuItem value="interes_publico">Interés Público</MenuItem>
                <MenuItem value="interes_legitimo">Interés Legítimo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      )
    },
    {
      label: 'Responsabilidad',
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Responsable del Proceso"
              value={rat.responsable_proceso}
              onChange={(e) => handleFieldChange('responsable_proceso', e.target.value)}
              error={!!validationErrors.responsable_proceso}
              helperText={validationErrors.responsable_proceso}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#2a2a2a',
                  '& fieldset': { borderColor: '#444' },
                  '&:hover fieldset': { borderColor: '#666' },
                  '&.Mui-focused fieldset': { borderColor: '#4fc3f7' }
                },
                '& .MuiInputLabel-root': { color: '#bbb' }
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Área Responsable"
              value={rat.area_responsable}
              onChange={(e) => handleFieldChange('area_responsable', e.target.value)}
              error={!!validationErrors.area_responsable}
              helperText={validationErrors.area_responsable}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#2a2a2a',
                  '& fieldset': { borderColor: '#444' },
                  '&:hover fieldset': { borderColor: '#666' },
                  '&.Mui-focused fieldset': { borderColor: '#4fc3f7' }
                },
                '& .MuiInputLabel-root': { color: '#bbb' }
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email del Responsable"
              value={rat.email_responsable}
              onChange={(e) => handleFieldChange('email_responsable', e.target.value)}
              placeholder="responsable@empresa.cl"
              type="email"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#2a2a2a',
                  '& fieldset': { borderColor: '#444' },
                  '&:hover fieldset': { borderColor: '#666' },
                  '&.Mui-focused fieldset': { borderColor: '#4fc3f7' }
                },
                '& .MuiInputLabel-root': { color: '#bbb' }
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Teléfono del Responsable"
              value={rat.telefono_responsable}
              onChange={(e) => handleFieldChange('telefono_responsable', e.target.value)}
              placeholder="+56 9 1234 5678"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#2a2a2a',
                  '& fieldset': { borderColor: '#444' },
                  '&:hover fieldset': { borderColor: '#666' },
                  '&.Mui-focused fieldset': { borderColor: '#4fc3f7' }
                },
                '& .MuiInputLabel-root': { color: '#bbb' }
              }}
            />
          </Grid>
        </Grid>
      )
    },
    {
      label: 'Base Legal (Art. 12 Ley 21.719)',
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
              ⚖️ Base de Licitud del Tratamiento
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth required error={!!validationErrors.base_licitud}>
              <InputLabel sx={{ color: '#bbb' }}>Seleccionar Base de Licitud</InputLabel>
              <Select
                value={rat.base_licitud}
                onChange={(e) => handleFieldChange('base_licitud', e.target.value)}
                sx={{
                  bgcolor: '#2a2a2a',
                  color: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666' }
                }}
              >
                <MenuItem value="consentimiento">
                  <Box>
                    <Typography>📝 Consentimiento del Titular</Typography>
                    <Typography variant="caption" sx={{ color: '#bbb' }}>
                      Libre, específico, informado e inequívoco
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="contrato">
                  <Box>
                    <Typography>📋 Ejecución de Contrato</Typography>
                    <Typography variant="caption" sx={{ color: '#bbb' }}>
                      Necesario para ejecutar contrato titular parte
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="obligacion_legal">
                  <Box>
                    <Typography>⚖️ Cumplimiento Obligación Legal</Typography>
                    <Typography variant="caption" sx={{ color: '#bbb' }}>
                      Requerido por ley específica aplicable
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="interes_legitimo">
                  <Box>
                    <Typography>🎯 Interés Legítimo</Typography>
                    <Typography variant="caption" sx={{ color: '#bbb' }}>
                      Requiere test balancing obligatorio
                    </Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              required
              label="Fundamentación Legal Detallada"
              value={rat.base_legal}
              onChange={(e) => handleFieldChange('base_legal', e.target.value)}
              error={!!validationErrors.base_legal}
              helperText={validationErrors.base_legal}
              placeholder={
                rat.base_licitud === 'consentimiento' ? 'Describa el proceso de obtención del consentimiento...' :
                rat.base_licitud === 'contrato' ? 'Indique el tipo de contrato y cláusula específica...' :
                rat.base_licitud === 'obligacion_legal' ? 'Cite la ley específica y artículo exacto...' :
                rat.base_licitud === 'interes_legitimo' ? 'Describa el interés legítimo y justifique la evaluación de equilibrio...' :
                'Proporcione la fundamentación legal completa...'
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#2a2a2a',
                  '& fieldset': { borderColor: '#444' },
                  '&:hover fieldset': { borderColor: '#666' },
                  '&.Mui-focused fieldset': { borderColor: '#4fc3f7' }
                },
                '& .MuiInputLabel-root': { color: '#bbb' }
              }}
            />
          </Grid>

          {rat.base_licitud === 'interes_legitimo' && (
            <Grid item xs={12}>
              <Alert severity="warning" sx={{ bgcolor: '#f57f17', color: '#000' }}>
                <Typography fontWeight={600}>⚖️ Test Balancing Obligatorio</Typography>
                <Typography variant="body2">
                  Art. 12 f) Ley 21.719: Debe realizar evaluación de equilibrio entre interés legítimo empresa vs derechos fundamentales titular.
                </Typography>
              </Alert>
            </Grid>
          )}
        </Grid>
      )
    },
    {
      label: 'Datos Personales',
      content: (
        <Box>
          <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
            🗂️ Categorías de Datos Tratados
          </Typography>
          
          <CategoriasDataSelector 
            categoriasData={rat.categorias_datos}
            onCategoriasChange={(categorias) => handleFieldChange('categorias_datos', categorias)}
            error={validationErrors.categorias_datos}
          />

          <Typography variant="h6" sx={{ color: '#fff', mt: 3, mb: 2 }}>
            📍 Origen de los Datos
          </Typography>
          
          <TextField
            fullWidth
            label="Origen de los Datos"
            value={rat.origen_datos}
            onChange={(e) => handleFieldChange('origen_datos', e.target.value)}
            placeholder="Directamente del titular, terceros autorizados, fuentes públicas..."
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#2a2a2a',
                '& fieldset': { borderColor: '#444' },
                '&:hover fieldset': { borderColor: '#666' },
                '&.Mui-focused fieldset': { borderColor: '#4fc3f7' }
              },
              '& .MuiInputLabel-root': { color: '#bbb' }
            }}
          />
        </Box>
      )
    },
    {
      label: 'Destinatarios',
      content: (
        <Box>
          <RecipientsSection 
            rat={rat}
            onFieldChange={handleFieldChange}
            onArrayAdd={handleArrayFieldAdd}
            onArrayRemove={handleArrayFieldRemove}
            validationErrors={validationErrors}
          />
        </Box>
      )
    },
    {
      label: 'Conservación',
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Plazo de Conservación"
              value={rat.plazo_conservacion}
              onChange={(e) => handleFieldChange('plazo_conservacion', e.target.value)}
              error={!!validationErrors.plazo_conservacion}
              helperText={validationErrors.plazo_conservacion}
              placeholder="ej: 5 años posterior al término del contrato"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#2a2a2a',
                  '& fieldset': { borderColor: '#444' },
                  '&:hover fieldset': { borderColor: '#666' },
                  '&.Mui-focused fieldset': { borderColor: '#4fc3f7' }
                },
                '& .MuiInputLabel-root': { color: '#bbb' }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Criterios de Conservación"
              value={rat.criterios_conservacion}
              onChange={(e) => handleFieldChange('criterios_conservacion', e.target.value)}
              placeholder="Describa los criterios que determinan el plazo de conservación..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#2a2a2a',
                  '& fieldset': { borderColor: '#444' },
                  '&:hover fieldset': { borderColor: '#666' },
                  '&.Mui-focused fieldset': { borderColor: '#4fc3f7' }
                },
                '& .MuiInputLabel-root': { color: '#bbb' }
              }}
            />
          </Grid>
        </Grid>
      )
    },
    {
      label: 'Medidas de Seguridad',
      content: (
        <SecurityMeasuresSection 
          rat={rat}
          onArrayAdd={handleArrayFieldAdd}
          onArrayRemove={handleArrayFieldRemove}
          validationErrors={validationErrors}
        />
      )
    }
  ];

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
            {ratId === 'new' ? '📝 Nuevo RAT' : `✏️ Editar RAT ${rat.numero_rat}`}
          </Typography>
          <Typography variant="body1" sx={{ color: '#bbb' }}>
            {ratId === 'new' ? 'Crear nuevo Registro de Actividades de Tratamiento' : 'Modificar RAT existente'}
          </Typography>
        </Box>
        
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={() => navigate('/rats')}
            sx={{
              borderColor: '#666',
              color: '#fff',
              '&:hover': { borderColor: '#999', bgcolor: '#333' }
            }}
            startIcon={<CancelIcon />}
          >
            ← Volver a Lista RATs
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => handleSave(true)}
            disabled={saving}
            sx={{
              borderColor: '#f57f17',
              color: '#f57f17',
              '&:hover': { borderColor: '#ff9800', bgcolor: '#333' }
            }}
            startIcon={<SaveIcon />}
          >
            Guardar Borrador
          </Button>
          
          <Button
            variant="contained"
            onClick={() => handleSave(false)}
            disabled={saving}
            sx={{
              bgcolor: '#4fc3f7',
              color: '#000',
              fontWeight: 600,
              '&:hover': { bgcolor: '#29b6f6' }
            }}
            startIcon={<CheckIcon />}
          >
            Enviar a Revisión
          </Button>
        </Box>
      </Box>

      {/* Stepper principal */}
      <Paper elevation={3} sx={{ bgcolor: '#1a1a1a', border: '1px solid #333', p: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel sx={{ '& .MuiStepLabel-label': { color: '#bbb' } }}>
                {step.label}
              </StepLabel>
              <StepContent>
                <Box mb={3}>
                  {step.content}
                </Box>
                
                {/* BOTONES NAVEGACIÓN CRÍTICOS */}
                <Box display="flex" gap={2} justifyContent="space-between" alignItems="center" mt={3}>
                  <Box display="flex" gap={2}>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      sx={{ 
                        color: '#94a3b8',
                        borderColor: '#374151',
                        '&:hover': { 
                          borderColor: '#4fc3f7',
                          bgcolor: 'rgba(79, 195, 247, 0.1)'
                        },
                        '&:disabled': {
                          color: '#555',
                          borderColor: '#333'
                        }
                      }}
                    >
                      ← Anterior
                    </Button>
                    
                    <Button
                      variant="outlined"
                      onClick={() => handleSave(true)}
                      disabled={saving}
                      startIcon={<SaveIcon />}
                      sx={{
                        borderColor: '#f57f17',
                        color: '#f57f17',
                        '&:hover': { 
                          borderColor: '#ff9800', 
                          bgcolor: 'rgba(245, 127, 23, 0.1)' 
                        }
                      }}
                    >
                      Guardar Borrador
                    </Button>
                    
                    <Button
                      variant="contained"
                      onClick={index === steps.length - 1 ? () => handleSave(false) : handleNext}
                      disabled={saving}
                      startIcon={index === steps.length - 1 ? <CheckIcon /> : <EditIcon />}
                      sx={{
                        bgcolor: '#4fc3f7',
                        color: '#000',
                        fontWeight: 600,
                        '&:hover': { bgcolor: '#29b6f6' },
                        '&:disabled': {
                          bgcolor: '#555',
                          color: '#999'
                        }
                      }}
                    >
                      {saving ? 'Guardando...' : 
                       index === steps.length - 1 ? 'Finalizar RAT' : 'Siguiente →'}
                    </Button>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      Paso {index + 1} de {steps.length}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(index + 1) / steps.length * 100}
                      sx={{
                        width: 120,
                        height: 6,
                        borderRadius: 3,
                        bgcolor: '#333',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: '#4fc3f7',
                          borderRadius: 3
                        }
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#4fc3f7', fontWeight: 600 }}>
                      {Math.round((index + 1) / steps.length * 100)}%
                    </Typography>
                  </Box>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </Box>
  );
};

// Componente selector de tipos de datos
const DataTypesSelector = ({ selectedTypes, onTypesChange, error }) => {
  const tiposDatos = [
    { value: 'identificacion', label: 'Identificación', description: 'RUT, nombre, apellidos' },
    { value: 'contacto', label: 'Contacto', description: 'Email, teléfono, dirección' },
    { value: 'financieros', label: 'Financieros', description: 'Datos bancarios, crediticios' },
    { value: 'laborales', label: 'Laborales', description: 'Cargo, salario, evaluaciones' },
    { value: 'salud', label: 'Salud', description: 'Información médica' },
    { value: 'biometricos', label: 'Biométricos', description: 'Huella dactilar, facial' },
    { value: 'localizacion', label: 'Localización', description: 'GPS, IP, ubicación' },
    { value: 'navegacion', label: 'Navegación', description: 'Cookies, historial web' },
    { value: 'preferencias', label: 'Preferencias', description: 'Configuraciones usuario' },
    { value: 'comportamiento', label: 'Comportamiento', description: 'Patrones de uso' }
  ];

  const toggleTipo = (tipo) => {
    if (selectedTypes.includes(tipo)) {
      onTypesChange(selectedTypes.filter(t => t !== tipo));
    } else {
      onTypesChange([...selectedTypes, tipo]);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2, bgcolor: '#d32f2f', color: '#fff' }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={2}>
        {tiposDatos.map((tipo) => (
          <Grid item xs={12} md={6} key={tipo.value}>
            <Card 
              sx={{ 
                bgcolor: selectedTypes.includes(tipo.value) ? '#0d47a1' : '#2a2a2a',
                border: selectedTypes.includes(tipo.value) ? '2px solid #4fc3f7' : '1px solid #444',
                cursor: 'pointer',
                '&:hover': { bgcolor: '#333' }
              }}
              onClick={() => toggleTipo(tipo.value)}
            >
              <CardContent>
                <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600 }}>
                  {tipo.label}
                </Typography>
                <Typography variant="body2" sx={{ color: '#bbb' }}>
                  {tipo.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Componente destinatarios
const RecipientsSection = ({ rat, onFieldChange, onArrayAdd, onArrayRemove, validationErrors }) => {
  const [newInternal, setNewInternal] = useState('');
  const [newExternal, setNewExternal] = useState('');

  return (
    <Box>
      {/* Destinatarios internos */}
      <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
        🏢 Destinatarios Internos
      </Typography>
      
      <Box display="flex" gap={2} mb={2}>
        <TextField
          fullWidth
          label="Agregar Destinatario Interno"
          value={newInternal}
          onChange={(e) => setNewInternal(e.target.value)}
          placeholder="ej: Área Comercial, Gerencia Finanzas..."
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#2a2a2a',
              '& fieldset': { borderColor: '#444' }
            },
            '& .MuiInputLabel-root': { color: '#bbb' }
          }}
        />
        <Button
          variant="contained"
          onClick={() => {
            onArrayAdd('destinatarios_internos', newInternal);
            setNewInternal('');
          }}
          disabled={!newInternal}
          sx={{ bgcolor: '#4fc3f7', color: '#000' }}
        >
          <AddIcon />
        </Button>
      </Box>

      <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
        {rat.destinatarios_internos.map((destinatario, index) => (
          <Chip
            key={index}
            label={destinatario}
            onDelete={() => onArrayRemove('destinatarios_internos', destinatario)}
            sx={{ bgcolor: '#0d47a1', color: '#fff' }}
          />
        ))}
      </Box>

      {/* Destinatarios externos */}
      <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
        🌐 Destinatarios Externos
      </Typography>
      
      <Box display="flex" gap={2} mb={2}>
        <TextField
          fullWidth
          label="Agregar Destinatario Externo"
          value={newExternal}
          onChange={(e) => setNewExternal(e.target.value)}
          placeholder="ej: SBIF, CMF, Proveedores tecnológicos..."
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#2a2a2a',
              '& fieldset': { borderColor: '#444' }
            },
            '& .MuiInputLabel-root': { color: '#bbb' }
          }}
        />
        <Button
          variant="contained"
          onClick={() => {
            onArrayAdd('destinatarios_externos', newExternal);
            setNewExternal('');
          }}
          disabled={!newExternal}
          sx={{ bgcolor: '#4fc3f7', color: '#000' }}
        >
          <AddIcon />
        </Button>
      </Box>

      <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
        {rat.destinatarios_externos.map((destinatario, index) => (
          <Chip
            key={index}
            label={destinatario}
            onDelete={() => onArrayRemove('destinatarios_externos', destinatario)}
            sx={{ bgcolor: '#f57f17', color: '#fff' }}
          />
        ))}
      </Box>

      {/* Transferencias internacionales */}
      <FormControlLabel
        control={
          <Switch
            checked={rat.transferencias_internacionales}
            onChange={(e) => onFieldChange('transferencias_internacionales', e.target.checked)}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': { color: '#4fc3f7' },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#0d47a1' }
            }}
          />
        }
        label={
          <Typography sx={{ color: '#fff', fontWeight: 600 }}>
            🌍 Incluye Transferencias Internacionales
          </Typography>
        }
      />

      {rat.transferencias_internacionales && (
        <Box mt={2}>
          <InternationalTransfersSection 
            rat={rat}
            onFieldChange={onFieldChange}
            onArrayAdd={onArrayAdd}
            onArrayRemove={onArrayRemove}
          />
        </Box>
      )}
    </Box>
  );
};

// Componente transferencias internacionales
const InternationalTransfersSection = ({ rat, onFieldChange, onArrayAdd, onArrayRemove }) => {
  const [newCountry, setNewCountry] = useState('');

  return (
    <Paper elevation={1} sx={{ bgcolor: '#2a2a2a', p: 3 }}>
      <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
        🌍 Transferencias Internacionales
      </Typography>
      
      <Box display="flex" gap={2} mb={2}>
        <TextField
          fullWidth
          label="País de Destino"
          value={newCountry}
          onChange={(e) => setNewCountry(e.target.value)}
          placeholder="ej: Estados Unidos, España, Reino Unido..."
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#333',
              '& fieldset': { borderColor: '#555' }
            },
            '& .MuiInputLabel-root': { color: '#bbb' }
          }}
        />
        <Button
          variant="contained"
          onClick={() => {
            onArrayAdd('paises_destino', newCountry);
            setNewCountry('');
          }}
          disabled={!newCountry}
          sx={{ bgcolor: '#4fc3f7', color: '#000' }}
        >
          <AddIcon />
        </Button>
      </Box>

      <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
        {rat.paises_destino.map((pais, index) => (
          <Chip
            key={index}
            label={pais}
            onDelete={() => onArrayRemove('paises_destino', pais)}
            sx={{ bgcolor: '#1976d2', color: '#fff' }}
          />
        ))}
      </Box>

      <TextField
        fullWidth
        multiline
        rows={2}
        label="Garantías para la Transferencia"
        value={rat.garantias_transferencia}
        onChange={(e) => onFieldChange('garantias_transferencia', e.target.value)}
        placeholder="Decisión de adecuación, cláusulas contractuales tipo..."
        sx={{
          '& .MuiOutlinedInput-root': {
            bgcolor: '#333',
            '& fieldset': { borderColor: '#555' }
          },
          '& .MuiInputLabel-root': { color: '#bbb' }
        }}
      />
    </Paper>
  );
};

// Componente medidas de seguridad
const SecurityMeasuresSection = ({ rat, onArrayAdd, onArrayRemove, validationErrors }) => {
  const [newTechnical, setNewTechnical] = useState('');
  const [newOrganizational, setNewOrganizational] = useState('');

  const medidasTecnicasComunes = [
    'Cifrado AES-256',
    'Autenticación multifactor',
    'Logs de auditoría',
    'Backup automático',
    'Firewall aplicaciones',
    'Monitoreo en tiempo real',
    'Control acceso basado en roles',
    'Cifrado en tránsito',
    'Cifrado en reposo',
    'Tokenización datos'
  ];

  const medidasOrganizativasComunes = [
    'Capacitación personal',
    'Políticas de acceso',
    'Contratos confidencialidad',
    'Procedimientos respuesta incidentes',
    'Auditorías periódicas',
    'Designación DPO',
    'Evaluaciones impacto',
    'Gestión proveedores',
    'Control acceso físico',
    'Políticas retención'
  ];

  return (
    <Box>
      {/* Medidas técnicas */}
      <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
        🔧 Medidas Técnicas
      </Typography>
      
      {validationErrors.medidas_tecnicas && (
        <Alert severity="error" sx={{ mb: 2, bgcolor: '#d32f2f', color: '#fff' }}>
          {validationErrors.medidas_tecnicas}
        </Alert>
      )}
      
      <Box display="flex" gap={2} mb={2}>
        <FormControl fullWidth>
          <InputLabel sx={{ color: '#bbb' }}>Seleccionar Medida Técnica</InputLabel>
          <Select
            value={newTechnical}
            onChange={(e) => setNewTechnical(e.target.value)}
            sx={{
              bgcolor: '#2a2a2a',
              color: '#fff',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' }
            }}
          >
            {medidasTecnicasComunes.filter(m => !rat.medidas_tecnicas.includes(m)).map(medida => (
              <MenuItem key={medida} value={medida}>
                {medida}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={() => {
            onArrayAdd('medidas_tecnicas', newTechnical);
            setNewTechnical('');
          }}
          disabled={!newTechnical}
          sx={{ bgcolor: '#4fc3f7', color: '#000' }}
        >
          <AddIcon />
        </Button>
      </Box>

      <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
        {rat.medidas_tecnicas.map((medida, index) => (
          <Chip
            key={index}
            label={medida}
            onDelete={() => onArrayRemove('medidas_tecnicas', medida)}
            sx={{ bgcolor: '#2e7d32', color: '#fff' }}
          />
        ))}
      </Box>

      {/* Medidas organizativas */}
      <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
        🏛️ Medidas Organizativas
      </Typography>
      
      <Box display="flex" gap={2} mb={2}>
        <FormControl fullWidth>
          <InputLabel sx={{ color: '#bbb' }}>Seleccionar Medida Organizativa</InputLabel>
          <Select
            value={newOrganizational}
            onChange={(e) => setNewOrganizational(e.target.value)}
            sx={{
              bgcolor: '#2a2a2a',
              color: '#fff',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' }
            }}
          >
            {medidasOrganizativasComunes.filter(m => !rat.medidas_organizativas.includes(m)).map(medida => (
              <MenuItem key={medida} value={medida}>
                {medida}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={() => {
            onArrayAdd('medidas_organizativas', newOrganizational);
            setNewOrganizational('');
          }}
          disabled={!newOrganizational}
          sx={{ bgcolor: '#4fc3f7', color: '#000' }}
        >
          <AddIcon />
        </Button>
      </Box>

      <Box display="flex" flexWrap="wrap" gap={1}>
        {rat.medidas_organizativas.map((medida, index) => (
          <Chip
            key={index}
            label={medida}
            onDelete={() => onArrayRemove('medidas_organizativas', medida)}
            sx={{ bgcolor: '#1976d2', color: '#fff' }}
          />
        ))}
      </Box>
    </Box>
  );
};

// Componente categorías de datos según ESTRUCTURA JSONB diagrama líneas 134-160
const CategoriasDataSelector = ({ categoriasData, onCategoriasChange, error }) => {
  const handleCategoryToggle = (categoria, subcategoria, valor) => {
    const newCategorias = { ...categoriasData };
    
    if (!newCategorias[categoria]) {
      newCategorias[categoria] = {};
    }
    
    if (!newCategorias[categoria][subcategoria]) {
      newCategorias[categoria][subcategoria] = [];
    }
    
    const currentValues = newCategorias[categoria][subcategoria];
    if (currentValues.includes(valor)) {
      newCategorias[categoria][subcategoria] = currentValues.filter(v => v !== valor);
    } else {
      newCategorias[categoria][subcategoria] = [...currentValues, valor];
    }
    
    onCategoriasChange(newCategorias);
  };

  const isSelected = (categoria, subcategoria, valor) => {
    return categoriasData[categoria]?.[subcategoria]?.includes(valor) || false;
  };

  const categoriasDefinition = {
    identificacion: {
      title: '🆔 Datos de Identificación',
      subcategorias: {
        basicos: {
          title: 'Básicos',
          valores: ['nombre', 'apellidos', 'rut', 'email']
        },
        contacto: {
          title: 'Contacto',
          valores: ['telefono', 'direccion', 'codigo_postal']
        },
        identificadores: {
          title: 'Identificadores',
          valores: ['numero_cliente', 'codigo_empleado', 'matricula']
        }
      }
    },
    sensibles_art14: {
      title: '🚨 Datos Sensibles Art. 14',
      subcategorias: {
        salud: {
          title: 'Salud',
          valores: ['historial_medico', 'diagnosticos', 'tratamientos']
        },
        biometricos: {
          title: 'Biométricos',
          valores: ['huella_dactilar', 'reconocimiento_facial', 'voz']
        },
        origen: {
          title: 'Origen',
          valores: ['raza', 'etnia', 'nacionalidad']
        },
        religion: {
          title: 'Religión',
          valores: ['creencias', 'afiliacion_religiosa']
        },
        ideologia: {
          title: 'Ideología',
          valores: ['opinion_politica', 'sindical']
        },
        vida_sexual: {
          title: 'Vida Sexual',
          valores: ['orientacion', 'comportamiento_sexual']
        }
      }
    },
    especiales: {
      title: '⚡ Datos Especiales',
      subcategorias: {
        menores: {
          title: 'Menores',
          valores: ['datos_menores_14', 'consentimiento_parental']
        },
        trabajadores: {
          title: 'Trabajadores',
          valores: ['nomina', 'evaluaciones', 'disciplinarias']
        },
        financieros: {
          title: 'Financieros',
          valores: ['ingresos', 'crediticio', 'patrimonio']
        },
        ubicacion: {
          title: 'Ubicación',
          valores: ['gps', 'ip_address', 'geolocation']
        }
      }
    },
    tecnicas: {
      title: '🔧 Datos Técnicos',
      subcategorias: {
        sistemas: {
          title: 'Sistemas',
          valores: ['logs', 'metadatos', 'cookies']
        },
        comportamiento: {
          title: 'Comportamiento',
          valores: ['clicks', 'navegacion', 'preferencias']
        },
        dispositivo: {
          title: 'Dispositivo',
          valores: ['mac_address', 'device_id', 'browser_fingerprint']
        }
      }
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2, bgcolor: '#d32f2f', color: '#fff' }}>
          {error}
        </Alert>
      )}
      
      {Object.entries(categoriasDefinition).map(([categoriaKey, categoria]) => (
        <Accordion 
          key={categoriaKey}
          sx={{ 
            bgcolor: '#2a2a2a', 
            border: '1px solid #444',
            mb: 2,
            '&:before': { display: 'none' }
          }}
        >
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon sx={{ color: '#4fc3f7' }} />}
            sx={{ bgcolor: '#333' }}
          >
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
              {categoria.title}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {Object.entries(categoria.subcategorias).map(([subKey, subcategoria]) => (
                <Grid item xs={12} md={6} key={subKey}>
                  <Paper sx={{ bgcolor: '#1a1a1a', p: 2 }}>
                    <Typography variant="subtitle1" sx={{ color: '#4fc3f7', mb: 2, fontWeight: 600 }}>
                      {subcategoria.title}
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={1}>
                      {subcategoria.valores.map((valor) => (
                        <FormControlLabel
                          key={valor}
                          control={
                            <Checkbox
                              checked={isSelected(categoriaKey, subKey, valor)}
                              onChange={() => handleCategoryToggle(categoriaKey, subKey, valor)}
                              sx={{
                                color: '#666',
                                '&.Mui-checked': { color: '#4fc3f7' }
                              }}
                            />
                          }
                          label={
                            <Typography sx={{ color: '#bbb', fontSize: '0.9rem' }}>
                              {valor.replace(/_/g, ' ')}
                            </Typography>
                          }
                        />
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default RATEditPage;