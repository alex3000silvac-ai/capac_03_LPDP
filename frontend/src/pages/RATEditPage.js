import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Checkbox,
  FormGroup,
  LinearProgress,
  Grid,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Chip,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Publish as PublishIcon
} from '@mui/icons-material';
import { ratService } from '../services/ratService';
import ratIntelligenceEngine from '../services/ratIntelligenceEngine';

const RATEditPage = () => {
  const { ratId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  
  const [originalRATData, setOriginalRATData] = useState(null);
  const [ratData, setRatData] = useState({
    responsable: {
      razonSocial: '',
      rut: '',
      direccion: '',
      nombre: '',
      email: '',
      telefono: ''
    },
    categoriasDatos: [],
    baseJuridica: '',
    finalidad: '',
    destinatarios: [],
    transferenciasInternacionales: [],
    plazosRetencion: '',
    medidasSeguridad: [],
    estado: 'BORRADOR',
    fechaCreacion: '',
    fechaActualizacion: '',
    version: 1
  });

  const steps = [
    'Identificación del Responsable',
    'Categorías de Datos',
    'Base Jurídica', 
    'Finalidad del Tratamiento',
    'Destinatarios y Transferencias',
    'Revisión y Confirmación'
  ];

  useEffect(() => {
    cargarRATParaEdicion();
  }, [ratId]);

  const cargarRATParaEdicion = async () => {
    try {
      setLoading(true);
      const ratExistente = await ratService.getRATById(ratId);
      
      if (!ratExistente) {
        navigate('/rat-list');
        return;
      }

      // Mapear datos de base de datos a estructura del formulario
      const ratMapeado = {
        id: ratExistente.id,
        responsable: {
          razonSocial: ratExistente.area_responsable || '',
          rut: ratExistente.metadata?.rut_empresa || '',
          direccion: ratExistente.metadata?.direccion_empresa || '',
          nombre: ratExistente.responsable_proceso || '',
          email: ratExistente.email_responsable || '',
          telefono: ratExistente.telefono_responsable || ''
        },
        categoriasDatos: ratExistente.categorias_datos ? 
          (ratExistente.categorias_datos.datosPersonales ? 
            Object.keys(ratExistente.categorias_datos.datosPersonales).filter(key => ratExistente.categorias_datos.datosPersonales[key]) 
            : Object.keys(ratExistente.categorias_datos).filter(key => ratExistente.categorias_datos[key])
          ) : [],
        baseJuridica: ratExistente.base_legal || '',
        finalidad: ratExistente.finalidad_principal || ratExistente.descripcion || '',
        destinatarios: ratExistente.destinatarios_internos || [],
        transferenciasInternacionales: ratExistente.transferencias_internacionales || [],
        plazosRetencion: ratExistente.periodo_retencion || '',
        medidasSeguridad: ratExistente.medidas_seguridad || [],
        estado: ratExistente.estado || 'BORRADOR',
        fechaCreacion: ratExistente.created_at,
        fechaActualizacion: ratExistente.updated_at,
        version: ratExistente.version || 1,
        nombreActividad: ratExistente.nombre_actividad
      };

      setRatData(ratMapeado);
      setOriginalRATData({ ...ratMapeado });
      
      // Ejecutar análisis automático del RAT cargado
      const analysis = await ratIntelligenceEngine.evaluateRATActivity(ratMapeado);
      setAnalysisResults(analysis);
      
    } catch (error) {
      console.error('Error cargando RAT:', error);
      navigate('/rat-list');
    } finally {
      setLoading(false);
    }
  };

  const guardarCambios = async () => {
    try {
      setSaving(true);
      
      // Verificar si hay cambios
      if (JSON.stringify(ratData) === JSON.stringify(originalRATData)) {
        alert('No hay cambios para guardar');
        return;
      }

      // Ejecutar re-análisis antes de guardar
      const analysis = await ratIntelligenceEngine.analyzeRAT(ratData);
      setAnalysisResults(analysis);

      // Mapear datos del formulario a estructura de base de datos
      const updatedRAT = {
        nombre_actividad: ratData.nombreActividad || `RAT ${ratId}`,
        area_responsable: ratData.responsable.razonSocial,
        responsable_proceso: ratData.responsable.nombre,
        email_responsable: ratData.responsable.email,
        telefono_responsable: ratData.responsable.telefono,
        finalidad_principal: ratData.finalidad,
        descripcion: ratData.finalidad,
        base_legal: ratData.baseJuridica,
        categorias_datos: { 
          datosPersonales: ratData.categoriasDatos.reduce((acc, cat) => ({ ...acc, [cat]: true }), {})
        },
        destinatarios_internos: ratData.destinatarios,
        transferencias_internacionales: ratData.transferenciasInternacionales,
        periodo_retencion: ratData.plazosRetencion,
        medidas_seguridad: ratData.medidasSeguridad,
        estado: ratData.estado,
        version: (ratData.version || 1) + 1,
        updated_at: new Date().toISOString(),
        analysis_results: analysis,
        metadata: {
          rut_empresa: ratData.responsable?.rut || '',
          direccion_empresa: ratData.responsable?.direccion || '',
          version: (ratData.version || 1) + 1,
          updated_at: new Date().toISOString()
        }
      };

      await ratService.updateRAT(ratId, updatedRAT);
      
      // Actualizar tanto ratData como originalRATData con los datos guardados
      const newRATData = { ...ratData, version: (ratData.version || 1) + 1, fechaActualizacion: new Date().toISOString() };
      setRatData(newRATData);
      setOriginalRATData({ ...newRATData });
      setEditMode(false);
      
      alert('RAT actualizado exitosamente');
      
    } catch (error) {
      console.error('Error guardando RAT:', error);
      alert('Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  const duplicarRAT = async () => {
    try {
      const duplicatedRAT = {
        nombre_actividad: `Copia de ${ratData.nombreActividad || 'RAT'}`,
        area_responsable: ratData.responsable.razonSocial,
        responsable_proceso: ratData.responsable.nombre,
        email_responsable: ratData.responsable.email,
        telefono_responsable: ratData.responsable.telefono,
        finalidad_principal: ratData.finalidad,
        descripcion: ratData.finalidad,
        base_legal: ratData.baseJuridica,
        categorias_datos: { 
          datosPersonales: ratData.categoriasDatos.reduce((acc, cat) => ({ ...acc, [cat]: true }), {})
        },
        destinatarios_internos: ratData.destinatarios,
        transferencias_internacionales: ratData.transferenciasInternacionales,
        periodo_retencion: ratData.plazosRetencion,
        medidas_seguridad: ratData.medidasSeguridad,
        estado: 'BORRADOR',
        version: 1,
        created_at: new Date().toISOString(),
        metadata: {
          rut_empresa: ratData.responsable?.rut || '',
          direccion_empresa: ratData.responsable?.direccion || '',
          version: 1,
          created_at: new Date().toISOString(),
          es_duplicado: true,
          rat_original_id: ratId
        },
        updated_at: new Date().toISOString()
      };

      const newRATId = await ratService.createRAT(duplicatedRAT);
      navigate(`/rat-edit/${newRATId}`);
      
    } catch (error) {
      console.error('Error duplicando RAT:', error);
      alert('Error al duplicar RAT');
    }
  };

  const eliminarRAT = async () => {
    try {
      await ratService.deleteRAT(ratId);
      setShowDeleteDialog(false);
      navigate('/rat-list');
    } catch (error) {
      console.error('Error eliminando RAT:', error);
      alert('Error al eliminar RAT');
    }
  };

  const certificarRAT = async () => {
    try {
      if (analysisResults?.riskLevel === 'ALTO') {
        alert('RATs de alto riesgo requieren EIPD antes de certificar');
        return;
      }

      const certifiedRAT = {
        ...ratData,
        estado: 'CERTIFICADO',
        fechaCertificacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString()
      };

      await ratService.updateRAT(ratId, certifiedRAT);
      setRatData(certifiedRAT);
      alert('RAT certificado exitosamente');
      
    } catch (error) {
      console.error('Error certificando RAT:', error);
      alert('Error al certificar RAT');
    }
  };

  const getStatusChip = (estado) => {
    const statusConfig = {
      'BORRADOR': { label: 'Borrador', color: 'default', icon: <EditIcon /> },
      'PENDIENTE_APROBACION': { label: 'Pendiente', color: 'warning', icon: <WarningIcon /> },
      'CERTIFICADO': { label: 'Certificado', color: 'success', icon: <CheckIcon /> }
    };
    
    const config = statusConfig[estado] || statusConfig['BORRADOR'];
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        icon={config.icon}
        sx={{ minWidth: 120 }}
      />
    );
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderResponsableStep();
      case 1:
        return renderCategoriasDatosStep();
      case 2:
        return renderBaseJuridicaStep();
      case 3:
        return renderFinalidadStep();
      case 4:
        return renderDestinatariosStep();
      case 5:
        return renderConfirmacionStep();
      default:
        return null;
    }
  };

  const renderResponsableStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ color: '#f9fafb', mb: 2 }}>
          Datos del Responsable del Tratamiento
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Razón Social"
          value={ratData.responsable?.razonSocial || ''}
          onChange={(e) => setRatData(prev => ({
            ...prev,
            responsable: { ...prev.responsable, razonSocial: e.target.value }
          }))}
          disabled={!editMode}
          sx={getTextFieldStyles()}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="RUT"
          value={ratData.responsable?.rut || ''}
          onChange={(e) => setRatData(prev => ({
            ...prev,
            responsable: { ...prev.responsable, rut: e.target.value }
          }))}
          disabled={!editMode}
          sx={getTextFieldStyles()}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Dirección"
          value={ratData.responsable?.direccion || ''}
          onChange={(e) => setRatData(prev => ({
            ...prev,
            responsable: { ...prev.responsable, direccion: e.target.value }
          }))}
          disabled={!editMode}
          sx={getTextFieldStyles()}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Nombre Contacto"
          value={ratData.responsable?.nombre || ''}
          onChange={(e) => setRatData(prev => ({
            ...prev,
            responsable: { ...prev.responsable, nombre: e.target.value }
          }))}
          disabled={!editMode}
          sx={getTextFieldStyles()}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={ratData.responsable?.email || ''}
          onChange={(e) => setRatData(prev => ({
            ...prev,
            responsable: { ...prev.responsable, email: e.target.value }
          }))}
          disabled={!editMode}
          sx={getTextFieldStyles()}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Teléfono"
          value={ratData.responsable?.telefono || ''}
          onChange={(e) => setRatData(prev => ({
            ...prev,
            responsable: { ...prev.responsable, telefono: e.target.value }
          }))}
          disabled={!editMode}
          sx={getTextFieldStyles()}
        />
      </Grid>
    </Grid>
  );

  const renderCategoriasDatosStep = () => (
    <Box>
      <Typography variant="h6" sx={{ color: '#f9fafb', mb: 3 }}>
        Categorías de Datos Personales
      </Typography>
      
      <FormGroup>
        {[
          { value: 'identificacion', label: 'Datos de Identificación (Nombre, RUT, Documento)' },
          { value: 'contacto', label: 'Datos de Contacto (Email, Teléfono, Dirección)' },
          { value: 'laboral', label: 'Datos Laborales (Cargo, Departamento, Salario)' },
          { value: 'financiero', label: 'Datos Financieros (Cuentas Bancarias, Ingresos)' },
          { value: 'salud', label: 'Datos de Salud (Información Médica, Licencias)' },
          { value: 'biometricos', label: 'Datos Biométricos (Huella, Facial, Iris)' },
          { value: 'geneticos', label: 'Datos Genéticos (ADN, Información Hereditaria)' },
          { value: 'geolocalizacion', label: 'Datos de Geolocalización' },
          { value: 'judicial', label: 'Datos Judiciales (Antecedentes, Procesos)' },
          { value: 'socieconomicos', label: 'Datos Socioeconómicos (Situación Económica)' }
        ].map((categoria) => (
          <FormControlLabel
            key={categoria.value}
            control={
              <Checkbox
                checked={ratData.categoriasDatos?.includes(categoria.value) || false}
                onChange={(e) => {
                  const newCategorias = e.target.checked
                    ? [...(ratData.categoriasDatos || []), categoria.value]
                    : (ratData.categoriasDatos || []).filter(c => c !== categoria.value);
                  setRatData(prev => ({ ...prev, categoriasDatos: newCategorias }));
                }}
                disabled={!editMode}
                sx={{ color: '#4f46e5' }}
              />
            }
            label={categoria.label}
            sx={{ 
              color: '#f9fafb',
              mb: 1,
              opacity: editMode ? 1 : 0.7
            }}
          />
        ))}
      </FormGroup>
    </Box>
  );

  const renderBaseJuridicaStep = () => (
    <Box>
      <Typography variant="h6" sx={{ color: '#f9fafb', mb: 3 }}>
        Base Jurídica del Tratamiento
      </Typography>
      
      <FormControl disabled={!editMode}>
        <RadioGroup
          value={ratData.baseJuridica || ''}
          onChange={(e) => setRatData(prev => ({ ...prev, baseJuridica: e.target.value }))}
        >
          {[
            { value: 'consentimiento', label: 'Consentimiento expreso del titular' },
            { value: 'contrato', label: 'Ejecución de contrato' },
            { value: 'obligacion_legal', label: 'Cumplimiento obligación legal' },
            { value: 'interes_vital', label: 'Protección interés vital' },
            { value: 'interes_publico', label: 'Misión de interés público' },
            { value: 'interes_legitimo', label: 'Interés legítimo responsable' }
          ].map((base) => (
            <FormControlLabel
              key={base.value}
              value={base.value}
              control={<Radio sx={{ color: '#4f46e5' }} />}
              label={base.label}
              sx={{ 
                color: '#f9fafb',
                mb: 1,
                opacity: editMode ? 1 : 0.7
              }}
            />
          ))}
        </RadioGroup>
      </FormControl>
    </Box>
  );

  const renderFinalidadStep = () => (
    <Box>
      <Typography variant="h6" sx={{ color: '#f9fafb', mb: 3 }}>
        Finalidad del Tratamiento
      </Typography>
      
      <TextField
        fullWidth
        multiline
        rows={6}
        label="Descripción detallada de la finalidad"
        value={ratData.finalidad || ''}
        onChange={(e) => setRatData(prev => ({ ...prev, finalidad: e.target.value }))}
        disabled={!editMode}
        placeholder="Describir de manera específica y explícita la finalidad del tratamiento de datos personales..."
        sx={getTextFieldStyles()}
      />
      
      {analysisResults?.finalidadSugerida && (
        <Alert 
          severity="info" 
          sx={{ mt: 2, bgcolor: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.3)' }}
        >
          <Typography variant="body2">
            <strong>Sugerencia IA:</strong> {analysisResults.finalidadSugerida}
          </Typography>
        </Alert>
      )}
    </Box>
  );

  const renderDestinatariosStep = () => (
    <Box>
      <Typography variant="h6" sx={{ color: '#f9fafb', mb: 3 }}>
        Destinatarios y Transferencias
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Destinatarios internos y externos"
            value={ratData.destinatarios?.join(', ') || ''}
            onChange={(e) => setRatData(prev => ({ 
              ...prev, 
              destinatarios: e.target.value.split(',').map(d => d.trim()).filter(d => d) 
            }))}
            disabled={!editMode}
            placeholder="Departamentos internos, proveedores, terceros..."
            sx={getTextFieldStyles()}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Transferencias Internacionales"
            value={ratData.transferenciasInternacionales?.join(', ') || ''}
            onChange={(e) => setRatData(prev => ({ 
              ...prev, 
              transferenciasInternacionales: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
            }))}
            disabled={!editMode}
            placeholder="Países de destino y garantías apropiadas..."
            sx={getTextFieldStyles()}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Plazos de Retención"
            value={ratData.plazosRetencion || ''}
            onChange={(e) => setRatData(prev => ({ ...prev, plazosRetencion: e.target.value }))}
            disabled={!editMode}
            placeholder="Períodos de conservación por categoría de datos..."
            sx={getTextFieldStyles()}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderConfirmacionStep = () => (
    <Box>
      <Typography variant="h6" sx={{ color: '#f9fafb', mb: 3 }}>
        Revisión y Confirmación
      </Typography>
      
      {/* Análisis de Inteligencia */}
      {analysisResults && (
        <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', mb: 3 }}>
          <CardHeader 
            title="Análisis de Inteligencia Legal"
            sx={{ color: '#f9fafb' }}
          />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ 
                    color: analysisResults.riskLevel === 'ALTO' ? '#ef4444' : 
                           analysisResults.riskLevel === 'MEDIO' ? '#f59e0b' : '#10b981'
                  }}>
                    {analysisResults.riskLevel}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                    Nivel de Riesgo
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: '#4f46e5' }}>
                    {analysisResults.complianceScore}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                    Score Compliance
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: '#f59e0b' }}>
                    {analysisResults.documentosRequeridos?.length || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                    Docs. Requeridos
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {analysisResults.alertas?.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ color: '#f59e0b', mb: 1 }}>
                  Alertas de Compliance:
                </Typography>
                {analysisResults.alertas.map((alerta, index) => (
                  <Alert 
                    key={index}
                    severity="warning" 
                    sx={{ mb: 1, bgcolor: 'rgba(245, 158, 11, 0.1)' }}
                  >
                    {alerta}
                  </Alert>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resumen de Cambios */}
      <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
        <CardHeader 
          title="Resumen de la Actividad"
          sx={{ color: '#f9fafb' }}
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#9ca3af', mb: 1 }}>
                Responsable:
              </Typography>
              <Typography variant="body1" sx={{ color: '#f9fafb' }}>
                {ratData.responsable?.razonSocial}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#9ca3af', mb: 1 }}>
                Estado:
              </Typography>
              {getStatusChip(ratData.estado)}
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ color: '#9ca3af', mb: 1 }}>
                Finalidad:
              </Typography>
              <Typography variant="body1" sx={{ color: '#f9fafb' }}>
                {ratData.finalidad}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ color: '#9ca3af', mb: 1 }}>
                Categorías de Datos:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {ratData.categoriasDatos?.map((categoria) => (
                  <Chip 
                    key={categoria}
                    label={categoria}
                    size="small"
                    sx={{ bgcolor: '#374151', color: '#f9fafb' }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );

  const getTextFieldStyles = () => ({
    '& .MuiOutlinedInput-root': {
      bgcolor: editMode ? '#374151' : '#1f2937',
      color: '#f9fafb',
      '& fieldset': { borderColor: '#4b5563' },
      '&:hover fieldset': { borderColor: editMode ? '#6b7280' : '#4b5563' },
      '&.Mui-focused fieldset': { borderColor: '#4f46e5' },
    },
    '& .MuiInputLabel-root': { color: '#9ca3af' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#4f46e5' }
  });

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#4f46e5' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#111827', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header con Breadcrumb */}
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link 
              color="inherit" 
              onClick={() => navigate('/rat-list')}
              sx={{ color: '#9ca3af', cursor: 'pointer', '&:hover': { color: '#f9fafb' } }}
            >
              Lista RATs
            </Link>
            <Typography sx={{ color: '#f9fafb' }}>
              Editar RAT
            </Typography>
          </Breadcrumbs>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" sx={{ color: '#f9fafb', fontWeight: 700 }}>
              Editar RAT #{ratId}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              {getStatusChip(ratData.estado)}
              <Typography variant="body2" sx={{ color: '#9ca3af', alignSelf: 'center' }}>
                Versión {ratData.version || 1}
              </Typography>
            </Box>
          </Box>

          {/* Barra de acciones */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant={editMode ? "contained" : "outlined"}
              startIcon={<EditIcon />}
              onClick={() => setEditMode(!editMode)}
              sx={{
                bgcolor: editMode ? '#10b981' : 'transparent',
                borderColor: '#4f46e5',
                color: editMode ? '#fff' : '#4f46e5',
                '&:hover': { 
                  bgcolor: editMode ? '#059669' : 'rgba(79, 70, 229, 0.1)' 
                }
              }}
            >
              {editMode ? 'Modo Edición' : 'Habilitar Edición'}
            </Button>

            {editMode && (
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                onClick={guardarCambios}
                disabled={saving}
                sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' } }}
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            )}

            <Button
              variant="outlined"
              startIcon={<CopyIcon />}
              onClick={duplicarRAT}
              sx={{ borderColor: '#6b7280', color: '#9ca3af' }}
            >
              Duplicar
            </Button>

            {analysisResults?.riskLevel === 'ALTO' && (
              <Button
                variant="contained"
                startIcon={<WarningIcon />}
                onClick={() => navigate(`/eipd-creator/${ratId}`)}
                sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}
              >
                Crear EIPD Requerida
              </Button>
            )}

            {ratData.estado === 'PENDIENTE_APROBACION' && (
              <Button
                variant="contained"
                startIcon={<PublishIcon />}
                onClick={certificarRAT}
                sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
              >
                Certificar RAT
              </Button>
            )}

            <Button
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={() => setShowDeleteDialog(true)}
              sx={{ borderColor: '#ef4444', color: '#ef4444' }}
            >
              Eliminar
            </Button>
          </Box>
        </Box>

        {/* Información de cambios */}
        {editMode && originalRATData && (
          <Alert 
            severity="info"
            sx={{ mb: 3, bgcolor: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.3)' }}
          >
            Modo edición activado. Los cambios se guardarán al hacer clic en "Guardar Cambios".
          </Alert>
        )}

        {/* Stepper de navegación */}
        <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151', p: 3, mb: 3 }}>
          <Stepper 
            activeStep={currentStep} 
            sx={{ 
              '& .MuiStepLabel-label': { color: '#9ca3af' },
              '& .MuiStepLabel-label.Mui-active': { color: '#4f46e5' },
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

        {/* Contenido del paso actual */}
        <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151', p: 4, mb: 3 }}>
          {renderStepContent(currentStep)}
        </Paper>

        {/* Navegación entre pasos */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, mb: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            sx={{ 
              borderColor: '#6b7280', 
              color: currentStep === 0 ? '#4b5563' : '#9ca3af',
              '&:hover': { 
                borderColor: '#9ca3af',
                bgcolor: 'rgba(156, 163, 175, 0.1)' 
              }
            }}
          >
            ← Anterior
          </Button>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Paso {currentStep + 1} de {steps.length}
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
            disabled={currentStep === steps.length - 1}
            sx={{ 
              borderColor: '#4f46e5', 
              color: currentStep === steps.length - 1 ? '#4b5563' : '#4f46e5',
              '&:hover': { 
                borderColor: '#6366f1',
                bgcolor: 'rgba(79, 70, 229, 0.1)' 
              }
            }}
          >
            Siguiente →
          </Button>
        </Box>

        {/* Metadatos del RAT */}
        <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151', p: 3, mt: 4 }}>
          <Typography variant="h6" sx={{ color: '#f9fafb', mb: 2 }}>
            Información del Sistema
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                Fecha Creación: {ratData.fechaCreacion ? new Date(ratData.fechaCreacion).toLocaleDateString() : 'No disponible'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                Última Actualización: {ratData.fechaActualizacion ? new Date(ratData.fechaActualizacion).toLocaleDateString() : 'No disponible'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Dialog Confirmación Eliminar */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        PaperProps={{
          sx: { bgcolor: '#1f2937', border: '1px solid #374151' }
        }}
      >
        <DialogTitle sx={{ color: '#f9fafb' }}>
          Confirmar Eliminación
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#9ca3af' }}>
            ¿Estás seguro de que deseas eliminar este RAT? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowDeleteDialog(false)}
            sx={{ color: '#9ca3af' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={eliminarRAT}
            sx={{ color: '#ef4444' }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RATEditPage;