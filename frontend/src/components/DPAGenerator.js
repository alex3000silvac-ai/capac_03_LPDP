import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Gavel as ContractIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Visibility as PreviewIcon,
  Security as SecurityIcon,
  Language as InternationalIcon,
  Business as BusinessIcon,
  Assignment as TemplateIcon,
  CheckCircle as ValidIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as CopyIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon,
  Group as CollaborateIcon
} from '@mui/icons-material';
import { ratService } from '../services/ratService';
import { supabase } from '../config/supabaseClient';

const DPAGenerator = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [generatedDPAs, setGeneratedDPAs] = useState([]);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  const [dpaData, setDpaData] = useState({
    // Datos del Responsable (nuestra empresa)
    responsable: {
      razon_social: '',
      rut: '',
      domicilio: '',
      representante_legal: '',
      dpo_nombre: '',
      dpo_email: ''
    },
    
    // Datos del Encargado (proveedor)
    encargado: {
      proveedor_id: '',
      razon_social: '',
      rut: '',
      domicilio: '',
      pais: '',
      representante_legal: '',
      contacto_dpo: ''
    },
    
    // Objeto del tratamiento
    tratamiento: {
      finalidades: [],
      categorias_datos: [],
      categorias_interesados: [],
      duracion_conservacion: '',
      medidas_seguridad: [],
      transferencias_adicionales: false,
      paises_transferencia: []
    },
    
    // Aspectos contractuales
    contractual: {
      template_id: '',
      fecha_vigencia: '',
      duracion_contrato: '12',
      moneda: 'CLP',
      clausulas_especiales: [],
      garantias_internacionales: '',
      mecanismo_revision: 'ANUAL',
      jurisdiccion: 'Chile',
      ley_aplicable: 'Ley 21.719'
    },
    
    // Obligaciones específicas
    obligaciones: {
      confidencialidad: true,
      no_cesion: true,
      devolucion_datos: true,
      cooperacion_autoridad: true,
      notificacion_incidentes: true,
      auditoria_derecho: true,
      formacion_personal: true,
      documentacion_tratamiento: true
    }
  });

  const dpaTemplates = [
    {
      id: 'standard-national',
      nombre: 'DPA Estándar Nacional',
      descripcion: 'Para proveedores nacionales con datos no sensibles',
      tipo: 'NACIONAL',
      nivel_riesgo: 'BAJO',
      clausulas_incluidas: [
        'Confidencialidad estándar',
        'Propósito limitado',
        'Devolución datos',
        'Cooperación fiscalización'
      ]
    },
    {
      id: 'international-scc',
      nombre: 'DPA Internacional con SCC',
      descripcion: 'Para transferencias internacionales con Standard Contractual Clauses',
      tipo: 'INTERNACIONAL',
      nivel_riesgo: 'MEDIO',
      clausulas_incluidas: [
        'Standard Contractual Clauses EU',
        'Garantías adicionales transferencia',
        'Notificación autoridades',
        'Derechos interesados'
      ]
    },
    {
      id: 'high-risk-sensitive',
      nombre: 'DPA Alto Riesgo - Datos Sensibles',
      descripcion: 'Para datos de salud, biométricos o categorías especiales',
      tipo: 'ALTO_RIESGO',
      nivel_riesgo: 'ALTO',
      clausulas_incluidas: [
        'Protección datos sensibles',
        'Medidas seguridad reforzadas',
        'Auditoría obligatoria',
        'Certificaciones requeridas',
        'Notificación inmediata incidentes'
      ]
    },
    {
      id: 'cloud-saas',
      nombre: 'DPA Cloud/SaaS Internacional',
      descripcion: 'Para servicios cloud internacionales (AWS, Azure, Google)',
      tipo: 'CLOUD',
      nivel_riesgo: 'MEDIO',
      clausulas_incluidas: [
        'Data residency controls',
        'Encryption in transit/rest',
        'Subprocessor management',
        'Service level agreements',
        'Business continuity'
      ]
    }
  ];

  const finalidadesComunes = [
    'Gestión de recursos humanos',
    'Administración de nómina',
    'Soporte técnico al cliente',
    'Marketing y comunicaciones',
    'Análisis y métricas',
    'Backup y archivado',
    'Seguridad y monitoreo',
    'Contabilidad y facturación'
  ];

  const categoriasPersonales = [
    'Datos identificativos',
    'Datos de contacto',
    'Datos profesionales',
    'Datos financieros',
    'Datos de navegación',
    'Datos biométricos',
    'Datos de salud',
    'Datos de menores'
  ];

  const categoriasInteresados = [
    'Empleados',
    'Clientes',
    'Prospectos',
    'Proveedores',
    'Contratistas',
    'Visitantes',
    'Usuarios web',
    'Menores de edad'
  ];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const tenantId = await ratService.getCurrentTenantId();
      
      await Promise.all([
        cargarProveedores(tenantId),
        cargarDPAsGenerados(tenantId)
      ]);
      
    } catch (error) {
      console.error('Error cargando datos DPA:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarProveedores = async (tenantId) => {
    try {
      const { data, error } = await supabase
        .from('proveedores')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('estado', 'ACTIVO');

      if (error) throw error;

      // Simular si no hay datos
      const providersData = data?.length > 0 ? data : [
        {
          id: 1,
          nombre: 'AWS Amazon Web Services',
          rut: '97.123.456-7',
          tipo_proveedor: 'INTERNACIONAL',
          pais_origen: 'Estados Unidos',
          nivel_riesgo: 'MEDIO'
        },
        {
          id: 2,
          nombre: 'Microsoft Chile',
          rut: '96.789.123-4',
          tipo_proveedor: 'NACIONAL',
          pais_origen: 'Chile',
          nivel_riesgo: 'BAJO'
        }
      ];

      setProviders(providersData);
      
    } catch (error) {
      console.error('Error cargando proveedores:', error);
    }
  };

  const cargarDPAsGenerados = async (tenantId) => {
    // Simular DPAs generados
    const dpasData = [
      {
        id: 1,
        proveedor_nombre: 'AWS Amazon Web Services',
        template_usado: 'international-scc',
        estado: 'VIGENTE',
        fecha_generacion: '2024-01-15',
        fecha_vencimiento: '2025-01-15',
        nivel_riesgo: 'MEDIO'
      },
      {
        id: 2,
        proveedor_nombre: 'Microsoft Chile',
        template_usado: 'standard-national',
        estado: 'BORRADOR',
        fecha_generacion: '2024-09-01',
        fecha_vencimiento: '2025-09-01',
        nivel_riesgo: 'BAJO'
      }
    ];
    
    setGeneratedDPAs(dpasData);
  };

  const generarDPA = async () => {
    try {
      setLoading(true);
      
      // Validar datos mínimos
      if (!dpaData.encargado.proveedor_id || !dpaData.contractual.template_id) {
        alert('Debe seleccionar proveedor y template');
        return;
      }

      const tenantId = await ratService.getCurrentTenantId();
      
      const { data, error } = await supabase
        .from('dpa_contracts')
        .insert([{
          tenant_id: tenantId,
          proveedor_id: dpaData.encargado.proveedor_id,
          template_id: dpaData.contractual.template_id,
          datos_responsable: dpaData.responsable,
          datos_encargado: dpaData.encargado,
          datos_tratamiento: dpaData.tratamiento,
          aspectos_contractuales: dpaData.contractual,
          obligaciones: dpaData.obligaciones,
          estado: 'BORRADOR',
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      alert('DPA generado exitosamente');
      setActiveStep(0);
      setDpaData(prev => ({
        ...prev,
        encargado: { ...prev.encargado, proveedor_id: '' },
        contractual: { ...prev.contractual, template_id: '' }
      }));
      
      await cargarDPAsGenerados(tenantId);
      
    } catch (error) {
      console.error('Error generando DPA:', error);
      alert('Error al generar DPA');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      label: 'Selección Proveedor',
      description: 'Seleccionar encargado del tratamiento'
    },
    {
      label: 'Template DPA',
      description: 'Elegir plantilla según tipo de relación'
    },
    {
      label: 'Datos Tratamiento',
      description: 'Especificar objeto del tratamiento'
    },
    {
      label: 'Aspectos Contractuales',
      description: 'Configurar términos legales'
    },
    {
      label: 'Obligaciones',
      description: 'Definir obligaciones específicas'
    },
    {
      label: 'Generación',
      description: 'Generar y descargar DPA'
    }
  ];

  const renderStepProviderSelection = () => (
    <Box>
      <Typography variant="h6" sx={{ color: '#f9fafb', mb: 3 }}>
        Seleccione el Encargado del Tratamiento
      </Typography>
      
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel sx={{ color: '#9ca3af' }}>Proveedor / Encargado</InputLabel>
        <Select
          value={dpaData.encargado.proveedor_id}
          onChange={(e) => {
            const provider = providers.find(p => p.id === e.target.value);
            setDpaData(prev => ({
              ...prev,
              encargado: {
                ...prev.encargado,
                proveedor_id: e.target.value,
                razon_social: provider?.nombre || '',
                rut: provider?.rut || '',
                pais: provider?.pais_origen || ''
              }
            }));
          }}
          sx={{ bgcolor: '#374151', color: '#f9fafb' }}
        >
          {providers.map((provider) => (
            <MenuItem key={provider.id} value={provider.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <BusinessIcon />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2">{provider.nombre}</Typography>
                  <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                    {provider.pais_origen} • {provider.tipo_proveedor}
                  </Typography>
                </Box>
                <Chip 
                  label={provider.nivel_riesgo}
                  color={provider.nivel_riesgo === 'ALTO' ? 'error' : provider.nivel_riesgo === 'MEDIO' ? 'warning' : 'success'}
                  size="small"
                />
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {dpaData.encargado.proveedor_id && (
        <Alert severity="info" sx={{ bgcolor: 'rgba(79, 70, 229, 0.1)' }}>
          <Typography variant="body2">
            📋 Proveedor seleccionado: <strong>{dpaData.encargado.razon_social}</strong> ({dpaData.encargado.pais})
          </Typography>
        </Alert>
      )}
    </Box>
  );

  const renderStepTemplateSelection = () => (
    <Box>
      <Typography variant="h6" sx={{ color: '#f9fafb', mb: 3 }}>
        Seleccione la Plantilla DPA Apropiada
      </Typography>
      
      <Grid container spacing={3}>
        {dpaTemplates.map((template) => (
          <Grid item xs={12} md={6} key={template.id}>
            <Card 
              sx={{ 
                bgcolor: dpaData.contractual.template_id === template.id ? '#4f46e5' : '#1f2937',
                border: `1px solid ${dpaData.contractual.template_id === template.id ? '#4f46e5' : '#374151'}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#4f46e5',
                  transform: 'translateY(-2px)'
                }
              }}
              onClick={() => setDpaData(prev => ({
                ...prev,
                contractual: { ...prev.contractual, template_id: template.id }
              }))}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#f9fafb' }}>
                    {template.nombre}
                  </Typography>
                  <Chip 
                    label={template.nivel_riesgo}
                    color={template.nivel_riesgo === 'ALTO' ? 'error' : template.nivel_riesgo === 'MEDIO' ? 'warning' : 'success'}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" sx={{ color: '#9ca3af', mb: 2 }}>
                  {template.descripcion}
                </Typography>
                
                <Divider sx={{ bgcolor: '#374151', mb: 2 }} />
                
                <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 'bold' }}>
                  Cláusulas Incluidas:
                </Typography>
                <List dense>
                  {template.clausulas_incluidas.map((clausula, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <ValidIcon sx={{ fontSize: 16, color: '#10b981' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={clausula}
                        primaryTypographyProps={{ 
                          variant: 'caption', 
                          sx: { color: '#d1d5db' } 
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderStepTreatmentData = () => (
    <Box>
      <Typography variant="h6" sx={{ color: '#f9fafb', mb: 3 }}>
        Especificar Objeto del Tratamiento
      </Typography>
      
      <Grid container spacing={3}>
        {/* Finalidades */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ color: '#f9fafb', mb: 2 }}>
            Finalidades del Tratamiento
          </Typography>
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#9ca3af' }}>Seleccionar Finalidades</InputLabel>
            <Select
              multiple
              value={dpaData.tratamiento.finalidades}
              onChange={(e) => setDpaData(prev => ({
                ...prev,
                tratamiento: { ...prev.tratamiento, finalidades: e.target.value }
              }))}
              sx={{ bgcolor: '#374151', color: '#f9fafb' }}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {finalidadesComunes.map((finalidad) => (
                <MenuItem key={finalidad} value={finalidad}>
                  {finalidad}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Categorías de Datos */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ color: '#f9fafb', mb: 2 }}>
            Categorías de Datos Personales
          </Typography>
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#9ca3af' }}>Seleccionar Categorías</InputLabel>
            <Select
              multiple
              value={dpaData.tratamiento.categorias_datos}
              onChange={(e) => setDpaData(prev => ({
                ...prev,
                tratamiento: { ...prev.tratamiento, categorias_datos: e.target.value }
              }))}
              sx={{ bgcolor: '#374151', color: '#f9fafb' }}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {categoriasPersonales.map((categoria) => (
                <MenuItem key={categoria} value={categoria}>
                  {categoria}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Duración Conservación */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Duración Conservación"
            value={dpaData.tratamiento.duracion_conservacion}
            onChange={(e) => setDpaData(prev => ({
              ...prev,
              tratamiento: { ...prev.tratamiento, duracion_conservacion: e.target.value }
            }))}
            placeholder="ej: 5 años desde término contrato"
            sx={{
              '& .MuiOutlinedInput-root': { bgcolor: '#374151', color: '#f9fafb' },
              '& .MuiInputLabel-root': { color: '#9ca3af' }
            }}
          />
        </Grid>

        {/* Transferencias Adicionales */}
        <Grid item xs={12} md={8}>
          <FormControlLabel
            control={
              <Checkbox
                checked={dpaData.tratamiento.transferencias_adicionales}
                onChange={(e) => setDpaData(prev => ({
                  ...prev,
                  tratamiento: { ...prev.tratamiento, transferencias_adicionales: e.target.checked }
                }))}
                sx={{ color: '#4f46e5' }}
              />
            }
            label="El encargado realizará transferencias a terceros países"
            sx={{ color: '#f9fafb' }}
          />
          
          {dpaData.tratamiento.transferencias_adicionales && (
            <TextField
              fullWidth
              label="Países de Transferencia"
              value={dpaData.tratamiento.paises_transferencia.join(', ')}
              onChange={(e) => setDpaData(prev => ({
                ...prev,
                tratamiento: { ...prev.tratamiento, paises_transferencia: e.target.value.split(',').map(p => p.trim()) }
              }))}
              placeholder="ej: Estados Unidos, Reino Unido"
              sx={{
                mt: 2,
                '& .MuiOutlinedInput-root': { bgcolor: '#374151', color: '#f9fafb' },
                '& .MuiInputLabel-root': { color: '#9ca3af' }
              }}
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );

  const renderStepContractual = () => (
    <Box>
      <Typography variant="h6" sx={{ color: '#f9fafb', mb: 3 }}>
        Aspectos Contractuales y Legales
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            type="date"
            label="Fecha de Vigencia"
            value={dpaData.contractual.fecha_vigencia}
            onChange={(e) => setDpaData(prev => ({
              ...prev,
              contractual: { ...prev.contractual, fecha_vigencia: e.target.value }
            }))}
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiOutlinedInput-root': { bgcolor: '#374151', color: '#f9fafb' },
              '& .MuiInputLabel-root': { color: '#9ca3af' }
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#9ca3af' }}>Duración Contrato</InputLabel>
            <Select
              value={dpaData.contractual.duracion_contrato}
              onChange={(e) => setDpaData(prev => ({
                ...prev,
                contractual: { ...prev.contractual, duracion_contrato: e.target.value }
              }))}
              sx={{ bgcolor: '#374151', color: '#f9fafb' }}
            >
              <MenuItem value="6">6 meses</MenuItem>
              <MenuItem value="12">1 año</MenuItem>
              <MenuItem value="24">2 años</MenuItem>
              <MenuItem value="36">3 años</MenuItem>
              <MenuItem value="indefinido">Indefinido</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#9ca3af' }}>Jurisdicción</InputLabel>
            <Select
              value={dpaData.contractual.jurisdiccion}
              onChange={(e) => setDpaData(prev => ({
                ...prev,
                contractual: { ...prev.contractual, jurisdiccion: e.target.value }
              }))}
              sx={{ bgcolor: '#374151', color: '#f9fafb' }}
            >
              <MenuItem value="Chile">Chile</MenuItem>
              <MenuItem value="Estados Unidos">Estados Unidos</MenuItem>
              <MenuItem value="Unión Europea">Unión Europea</MenuItem>
              <MenuItem value="Arbitraje Internacional">Arbitraje Internacional</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        {/* Garantías para transferencias internacionales */}
        {dpaData.encargado.pais !== 'Chile' && (
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ color: '#f9fafb', mb: 2 }}>
              Garantías para Transferencias Internacionales
            </Typography>
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#9ca3af' }}>Mecanismo de Garantía</InputLabel>
              <Select
                value={dpaData.contractual.garantias_internacionales}
                onChange={(e) => setDpaData(prev => ({
                  ...prev,
                  contractual: { ...prev.contractual, garantias_internacionales: e.target.value }
                }))}
                sx={{ bgcolor: '#374151', color: '#f9fafb' }}
              >
                <MenuItem value="SCC">Standard Contractual Clauses (SCC)</MenuItem>
                <MenuItem value="BCR">Binding Corporate Rules (BCR)</MenuItem>
                <MenuItem value="ADEQUACY">Decisión de Adecuación</MenuItem>
                <MenuItem value="CERTIFICATION">Certificación Aprobada</MenuItem>
                <MenuItem value="COC">Código de Conducta</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}
      </Grid>
    </Box>
  );

  const renderStepObligations = () => (
    <Box>
      <Typography variant="h6" sx={{ color: '#f9fafb', mb: 3 }}>
        Obligaciones del Encargado
      </Typography>
      
      <Grid container spacing={3}>
        {Object.entries(dpaData.obligaciones).map(([key, value]) => {
          const obligationLabels = {
            confidencialidad: 'Mantener confidencialidad de los datos',
            no_cesion: 'No ceder datos a terceros sin autorización',
            devolucion_datos: 'Devolver/eliminar datos al término',
            cooperacion_autoridad: 'Cooperar con autoridades competentes',
            notificacion_incidentes: 'Notificar incidentes de seguridad',
            auditoria_derecho: 'Permitir auditorías y controles',
            formacion_personal: 'Formar personal en protección datos',
            documentacion_tratamiento: 'Documentar todas las actividades'
          };

          return (
            <Grid item xs={12} md={6} key={key}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={value}
                    onChange={(e) => setDpaData(prev => ({
                      ...prev,
                      obligaciones: { ...prev.obligaciones, [key]: e.target.checked }
                    }))}
                    sx={{ color: '#4f46e5' }}
                  />
                }
                label={obligationLabels[key]}
                sx={{ color: '#f9fafb' }}
              />
            </Grid>
          );
        })}
      </Grid>

      <Alert severity="warning" sx={{ mt: 3, bgcolor: 'rgba(245, 158, 11, 0.1)' }}>
        <Typography variant="body2">
          ⚖️ <strong>Art. 25 Ley 21.719:</strong> Estas obligaciones son mínimas legales. 
          Pueden agregarse obligaciones adicionales según el nivel de riesgo del tratamiento.
        </Typography>
      </Alert>
    </Box>
  );

  const renderStepGeneration = () => (
    <Box>
      <Typography variant="h6" sx={{ color: '#f9fafb', mb: 3 }}>
        Generar Contrato DPA
      </Typography>
      
      <Alert severity="success" sx={{ mb: 3, bgcolor: 'rgba(16, 185, 129, 0.1)' }}>
        <Typography variant="body2">
          ✅ <strong>Listo para generar:</strong> Se creará un DPA personalizado con todas las 
          cláusulas necesarias según la normativa chilena y buenas prácticas internacionales.
        </Typography>
      </Alert>

      {/* Resumen de configuración */}
      <Paper sx={{ bgcolor: '#374151', p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ color: '#f9fafb', mb: 2 }}>
          Resumen del DPA a Generar:
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              <strong>Encargado:</strong> {dpaData.encargado.razon_social}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              <strong>Template:</strong> {dpaTemplates.find(t => t.id === dpaData.contractual.template_id)?.nombre}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              <strong>Finalidades:</strong> {dpaData.tratamiento.finalidades.length} seleccionadas
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              <strong>Obligaciones:</strong> {Object.values(dpaData.obligaciones).filter(Boolean).length}/8 habilitadas
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Botones de Generación */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<PreviewIcon />}
            onClick={() => setPreviewDialog(true)}
            sx={{ 
              color: '#60a5fa', 
              borderColor: '#60a5fa',
              '&:hover': { borderColor: '#60a5fa', bgcolor: 'rgba(96, 165, 250, 0.1)' }
            }}
          >
            Vista Previa
          </Button>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => alert('Generando DPA en formato Word...')}
            sx={{ 
              color: '#34d399', 
              borderColor: '#34d399',
              '&:hover': { borderColor: '#34d399', bgcolor: 'rgba(52, 211, 153, 0.1)' }
            }}
          >
            Generar Word
          </Button>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<ContractIcon />}
            onClick={generarDPA}
            disabled={loading}
            sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' } }}
          >
            Finalizar DPA
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  const renderGeneratedDPAs = () => (
    <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151', p: 3, mt: 4 }}>
      <Typography variant="h6" sx={{ color: '#f9fafb', mb: 3 }}>
        DPAs Generados
      </Typography>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Proveedor</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Template</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Estado</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Vigencia</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {generatedDPAs.map((dpa) => (
              <TableRow key={dpa.id}>
                <TableCell sx={{ color: '#f9fafb', borderColor: '#374151' }}>
                  {dpa.proveedor_nombre}
                </TableCell>
                <TableCell sx={{ color: '#f9fafb', borderColor: '#374151' }}>
                  {dpaTemplates.find(t => t.id === dpa.template_usado)?.nombre}
                </TableCell>
                <TableCell sx={{ borderColor: '#374151' }}>
                  <Chip 
                    label={dpa.estado}
                    color={dpa.estado === 'VIGENTE' ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell sx={{ color: '#f9fafb', borderColor: '#374151' }}>
                  {new Date(dpa.fecha_vencimiento).toLocaleDateString()}
                </TableCell>
                <TableCell sx={{ borderColor: '#374151' }}>
                  <IconButton size="small" sx={{ color: '#60a5fa' }}>
                    <DownloadIcon />
                  </IconButton>
                  <IconButton size="small" sx={{ color: '#fbbf24' }}>
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

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
            <ContractIcon sx={{ fontSize: 40, color: '#fbbf24' }} />
            Generador de Contratos DPA
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#9ca3af' }}>
            Art. 25 Ley 21.719 - Generación automática Data Processing Agreements
          </Typography>
        </Box>

        {/* Stepper Principal */}
        <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151', p: 3, mb: 4 }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel sx={{ '& .MuiStepLabel-label': { color: '#f9fafb' } }}>
                  {step.label}
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" sx={{ color: '#9ca3af', mb: 3 }}>
                    {step.description}
                  </Typography>
                  
                  {index === 0 && renderStepProviderSelection()}
                  {index === 1 && renderStepTemplateSelection()}
                  {index === 2 && renderStepTreatmentData()}
                  {index === 3 && renderStepContractual()}
                  {index === 4 && renderStepObligations()}
                  {index === 5 && renderStepGeneration()}
                  
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      disabled={activeStep === 0}
                      onClick={() => setActiveStep(activeStep - 1)}
                      sx={{ color: '#9ca3af' }}
                    >
                      Anterior
                    </Button>
                    
                    {activeStep < steps.length - 1 ? (
                      <Button
                        variant="contained"
                        onClick={() => setActiveStep(activeStep + 1)}
                        disabled={
                          (index === 0 && !dpaData.encargado.proveedor_id) ||
                          (index === 1 && !dpaData.contractual.template_id)
                        }
                        sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' } }}
                      >
                        Siguiente
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={generarDPA}
                        disabled={loading}
                        sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
                      >
                        Generar DPA
                      </Button>
                    )}
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* DPAs Generados */}
        {renderGeneratedDPAs()}

        {/* Alert Información */}
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
              📜 <strong>Generador DPA Automático:</strong> Crea contratos personalizados según 
              nivel de riesgo, tipo de proveedor y normativa aplicable. Incluye cláusulas 
              específicas para transferencias internacionales según Art. 26-30 Ley 21.719.
            </Typography>
          </Alert>
        </Box>
      </Container>
    </Box>
  );
};

export default DPAGenerator;