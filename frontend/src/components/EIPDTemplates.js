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
  CardHeader,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge
} from '@mui/material';
import {
  Shield as EIPDIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as CopyIcon,
  GetApp as UseTemplateIcon,
  Warning as RiskIcon,
  CheckCircle as ValidIcon,
  Business as IndustryIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
  Psychology as ProcessIcon,
  ExpandMore as ExpandIcon,
  Star as RecommendedIcon,
  Schedule as TimeIcon,
  Group as CollaborateIcon,
  Description as DocumentIcon
} from '@mui/icons-material';
import { ratService } from '../services/ratService';
import { supabase } from '../config/supabaseConfig';
import { useTenant } from '../contexts/TenantContext';

const EIPDTemplates = () => {
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateDialog, setTemplateDialog] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [filterIndustry, setFilterIndustry] = useState('TODAS');
  const [filterRisk, setFilterRisk] = useState('TODOS');
  
  const [stats, setStats] = useState({
    totalTemplates: 0,
    recomendados: 0,
    altoRiesgo: 0,
    porIndustria: 0
  });

  const [newTemplate, setNewTemplate] = useState({
    nombre: '',
    descripcion: '',
    industria: '',
    nivel_riesgo: 'MEDIO',
    criterios_aplicacion: [],
    estructura: {
      descripcion_tratamiento: '',
      necesidad_proporcionalidad: '',
      riesgos_identificados: [],
      medidas_mitigacion: [],
      evaluacion_final: ''
    },
    tiempo_estimado: '60',
    recomendado: false
  });

  // Templates dinámicos desde Supabase - TODO: Implementar carga desde Supabase
  const staticTemplates = [
    {
      id: 'healthcare-patient-records',
      nombre: 'Registros Médicos Electrónicos',
      descripcion: 'EIPD para sistemas de historia clínica y datos de salud',
      industria: 'salud',
      nivel_riesgo: 'ALTO',
      criterios_aplicacion: [
        'Datos especialmente sensibles (salud)',
        'Datos biométricos',
        'Decisiones automáticas diagnóstico',
        'Interconexión sistemas salud'
      ],
      tiempo_estimado: '180',
      recomendado: true,
      created_at: '2024-01-20',
      usos: 8,
      estructura: {
        descripcion_tratamiento: 'Gestión integral historia clínica electrónica, diagnósticos, tratamientos y evolución pacientes',
        necesidad_proporcionalidad: 'Esencial para prestación servicios salud y cumplimiento Código Sanitario',
        riesgos_identificados: [
          'Exposición datos salud sensibles',
          'Riesgo discriminación seguros',
          'Interconexión no autorizada',
          'Decisiones clínicas automatizadas'
        ],
        medidas_mitigacion: [
          'Cifrado extremo a extremo',
          'Autenticación biométrica',
          'Trazabilidad completa accesos',
          'Segregación datos por especialidad',
          'Auditoría médica regular'
        ],
        evaluacion_final: 'Riesgo ALTO controlado mediante protocolos médicos y tecnológicos específicos'
      }
    },
    {
      id: 'education-student-data',
      nombre: 'Datos Estudiantes y Menores',
      descripcion: 'EIPD para instituciones educativas con datos de menores',
      industria: 'educacion',
      nivel_riesgo: 'ALTO',
      criterios_aplicacion: [
        'Datos de menores de edad',
        'Datos biométricos (acceso)',
        'Monitoreo comportamiento online',
        'Evaluaciones académicas'
      ],
      tiempo_estimado: '90',
      recomendado: true,
      created_at: '2024-02-01',
      usos: 12,
      estructura: {
        descripcion_tratamiento: 'Gestión integral datos académicos, disciplinarios y administrativos de estudiantes menores de edad',
        necesidad_proporcionalidad: 'Necesario para prestación servicios educativos y cumplimiento LGE',
        riesgos_identificados: [
          'Datos menores sin consentimiento válido',
          'Perfilado académico automatizado',
          'Monitoreo excesivo actividades',
          'Transferencias no autorizadas'
        ],
        medidas_mitigacion: [
          'Consentimiento parental verificado',
          'Minimización datos recolectados',
          'Segregación por nivel educativo',
          'Supervisión adulta accesos',
          'Políticas retención específicas'
        ],
        evaluacion_final: 'Riesgo ALTO para menores mitigado mediante protecciones específicas legales'
      }
    },
    {
      id: 'retail-customer-marketing',
      nombre: 'Marketing y Perfilado Clientes',
      descripcion: 'EIPD para campañas marketing y análisis comportamental',
      industria: 'retail',
      nivel_riesgo: 'MEDIO',
      criterios_aplicacion: [
        'Perfilado automatizado',
        'Decisiones marketing automáticas',
        'Tracking comportamiento online',
        'Datos de navegación'
      ],
      tiempo_estimado: '45',
      recomendado: false,
      created_at: '2024-02-10',
      usos: 22,
      estructura: {
        descripcion_tratamiento: 'Análisis comportamiento clientes para personalización ofertas y campañas publicitarias dirigidas',
        necesidad_proporcionalidad: 'Basado en interés legítimo comercial, proporcional al beneficio mutuo',
        riesgos_identificados: [
          'Perfilado invasivo personalidad',
          'Decisiones discriminatorias',
          'Seguimiento excesivo online',
          'Inferencias datos sensibles'
        ],
        medidas_mitigacion: [
          'Consentimiento explícito tracking',
          'Derecho objeción fácil',
          'Anonimización datos analytics',
          'Límites temporales perfilado',
          'Transparencia algoritmos'
        ],
        evaluacion_final: 'Riesgo MEDIO aceptable con controles transparencia y derechos'
      }
    },
    {
      id: 'tech-employee-monitoring',
      nombre: 'Monitoreo Empleados Tecnología',
      descripcion: 'EIPD para sistemas monitoreo actividad laboral',
      industria: 'tecnologia',
      nivel_riesgo: 'MEDIO',
      criterios_aplicacion: [
        'Monitoreo sistemático empleados',
        'Datos biométricos acceso',
        'Análisis productividad',
        'Geolocalización dispositivos'
      ],
      tiempo_estimado: '75',
      recomendado: true,
      created_at: '2024-01-25',
      usos: 18,
      estructura: {
        descripcion_tratamiento: 'Monitoreo actividad laboral, productividad y seguridad en entorno tecnológico',
        necesidad_proporcionalidad: 'Necesario para seguridad informática y gestión recursos humanos',
        riesgos_identificados: [
          'Vigilancia excesiva empleados',
          'Inferencias estado salud',
          'Discriminación por productividad',
          'Violación intimidad laboral'
        ],
        medidas_mitigacion: [
          'Política transparente monitoreo',
          'Límites horarios supervisión',
          'Datos agregados no individuales',
          'Derecho desconexión digital',
          'Comité ética laboral'
        ],
        evaluacion_final: 'Riesgo MEDIO controlado mediante políticas laborales equilibradas'
      }
    },
    {
      id: 'generic-low-risk',
      nombre: 'Plantilla Genérica Bajo Riesgo',
      descripcion: 'EIPD estándar para tratamientos rutinarios sin datos sensibles',
      industria: 'general',
      nivel_riesgo: 'BAJO',
      criterios_aplicacion: [
        'Datos identificativos básicos',
        'Finalidades administrativas',
        'Sin decisiones automatizadas',
        'Proveedores nacionales'
      ],
      tiempo_estimado: '30',
      recomendado: true,
      created_at: '2024-03-01',
      usos: 45,
      estructura: {
        descripcion_tratamiento: 'Tratamiento rutinario datos personales para finalidades administrativas estándar',
        necesidad_proporcionalidad: 'Necesario para operación normal empresa, proporcional al objetivo',
        riesgos_identificados: [
          'Exposición accidental datos',
          'Retención excesiva',
          'Acceso no autorizado',
          'Falta transparencia'
        ],
        medidas_mitigacion: [
          'Controles acceso básicos',
          'Políticas retención claras',
          'Procedimientos transparencia',
          'Capacitación personal',
          'Revisiones periódicas'
        ],
        evaluacion_final: 'Riesgo BAJO con controles estándar apropiados'
      }
    }
  ];

  // Industrias dinámicas desde base de datos
  const [industries, setIndustries] = useState([]);
  
  const cargarIndustrias = async () => {
    try {
      const { data, error } = await supabase
        .from('categories') // Usar tabla categories vigente
        .select('*')
        .order('name');
      
      if (error) throw error;
      setIndustries(data || []);
    } catch (error) {
      console.error('Error cargando industrias:', error);
    }
  };

  useEffect(() => {
    cargarTemplates();
    cargarIndustrias();
  }, []);

  const cargarTemplates = async () => {
    try {
      setLoading(true);
      const tenantId = currentTenant?.id;
      
      const { data, error } = await supabase
        .from('sandbox_professional_templates') // Usar tabla templates vigente
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const templatesData = data || [];
      
      setTemplates(templatesData);
      calcularEstadisticas(templatesData);
      
    } catch (error) {
      console.error('Error cargando templates EIPD:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = (templatesData) => {
    const stats = {
      totalTemplates: templatesData.length,
      recomendados: templatesData.filter(t => t.recomendado).length,
      altoRiesgo: templatesData.filter(t => t.nivel_riesgo === 'ALTO').length,
      porIndustria: templatesData.reduce((acc, t) => {
        acc[t.industria] = (acc[t.industria] || 0) + 1;
        return acc;
      }, {})
    };
    setStats(stats);
  };

  const usarTemplate = (template) => {
    // Navegar al creador EIPD con template preseleccionado
    navigate('/eipd-creator', {
      state: {
        templateId: template.id,
        templateData: template.estructura
      }
    });
  };

  const duplicarTemplate = async (template) => {
    try {
      const nuevoTemplate = {
        ...template,
        id: undefined,
        nombre: `${template.nombre} (Copia)`,
        created_at: new Date().toISOString(),
        usos: 0
      };

      const tenantId = currentTenant?.id;

      const { data, error } = await supabase
        .from('sandbox_professional_templates') // Usar tabla templates vigente
        .insert([{
          ...nuevoTemplate,
          tenant_id: tenantId
        }])
        .select();

      if (error) throw error;

      await cargarTemplates();
      alert('Template duplicado exitosamente');
      
    } catch (error) {
      console.error('Error duplicando template:', error);
      alert('Error al duplicar template');
    }
  };

  const filtrarTemplates = () => {
    return templates.filter(template => {
      const matchIndustry = filterIndustry === 'TODAS' || template.industria === filterIndustry;
      const matchRisk = filterRisk === 'TODOS' || template.nivel_riesgo === filterRisk;
      
      return matchIndustry && matchRisk;
    });
  };

  const getRiskChip = (nivel) => {
    const riskConfig = {
      'ALTO': { label: 'Alto', color: 'error' },
      'MEDIO': { label: 'Medio', color: 'warning' },
      'BAJO': { label: 'Bajo', color: 'success' }
    };
    
    const config = riskConfig[nivel] || riskConfig['MEDIO'];
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getIndustryInfo = (industryId) => {
    return industries.find(i => i.id === industryId) || { name: 'General', icon: '🏢' };
  };

  const renderTemplateCards = () => (
    <Grid container spacing={3}>
      {filtrarTemplates().map((template) => {
        const industry = getIndustryInfo(template.industria);
        
        return (
          <Grid item xs={12} md={6} lg={4} key={template.id}>
            <Card 
              sx={{ 
                bgcolor: '#1f2937',
                border: '1px solid #374151',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  borderColor: '#4f46e5',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
                }
              }}
            >
              <CardHeader
                avatar={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '1.5rem' }}>{industry.icon}</Typography>
                    {template.recomendado && (
                      <RecommendedIcon sx={{ color: '#fbbf24', fontSize: 20 }} />
                    )}
                  </Box>
                }
                title={
                  <Typography variant="h6" sx={{ color: '#f9fafb', fontSize: '1rem' }}>
                    {template.nombre}
                  </Typography>
                }
                subheader={
                  <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {getRiskChip(template.nivel_riesgo)}
                    <Chip 
                      label={industry.name}
                      size="small"
                      sx={{ bgcolor: '#374151', color: '#9ca3af' }}
                    />
                  </Box>
                }
                sx={{ pb: 1 }}
              />
              
              <CardContent sx={{ flexGrow: 1, pt: 0 }}>
                <Typography variant="body2" sx={{ color: '#9ca3af', mb: 2 }}>
                  {template.descripcion}
                </Typography>
                
                <Divider sx={{ bgcolor: '#374151', mb: 2 }} />
                
                <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 'bold' }}>
                  Criterios de Aplicación:
                </Typography>
                <List dense sx={{ mb: 2 }}>
                  {template.criterios_aplicacion?.slice(0, 3).map((criterio, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <ValidIcon sx={{ fontSize: 16, color: '#10b981' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={criterio}
                        primaryTypographyProps={{ 
                          variant: 'caption', 
                          sx: { color: '#d1d5db' } 
                        }}
                      />
                    </ListItem>
                  ))}
                  {template.criterios_aplicacion?.length > 3 && (
                    <Typography variant="caption" sx={{ color: '#6b7280', ml: 3 }}>
                      +{template.criterios_aplicacion.length - 3} más...
                    </Typography>
                  )}
                </List>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                    ⏱️ {template.tiempo_estimado} min
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                    📊 {template.usos || 0} usos
                  </Typography>
                </Box>
                
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      size="small"
                      startIcon={<UseTemplateIcon />}
                      onClick={() => usarTemplate(template)}
                      sx={{ 
                        bgcolor: '#4f46e5', 
                        color: '#fff',
                        '&:hover': { bgcolor: '#4338ca' }
                      }}
                    >
                      Usar
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      onClick={() => {
                        setSelectedTemplate(template);
                        setPreviewDialog(true);
                      }}
                      sx={{ 
                        color: '#60a5fa', 
                        borderColor: '#60a5fa',
                        '&:hover': { 
                          borderColor: '#60a5fa', 
                          bgcolor: 'rgba(96, 165, 250, 0.1)' 
                        }
                      }}
                    >
                      Ver
                    </Button>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
                  <Tooltip title="Duplicar template">
                    <IconButton
                      size="small"
                      onClick={() => duplicarTemplate(template)}
                      sx={{ color: '#8b5cf6' }}
                    >
                      <CopyIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Editar template">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setNewTemplate(template);
                        setTemplateDialog(true);
                      }}
                      sx={{ color: '#fbbf24' }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );

  const renderPreviewDialog = () => (
    <Dialog
      open={previewDialog}
      onClose={() => setPreviewDialog(false)}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { bgcolor: '#1f2937', border: '1px solid #374151' } }}
    >
      <DialogTitle sx={{ color: '#f9fafb' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <EIPDIcon sx={{ color: '#34d399' }} />
          Vista Previa Template - {selectedTemplate?.nombre}
        </Box>
      </DialogTitle>
      
      {selectedTemplate && (
        <DialogContent>
          <Grid container spacing={3}>
            {/* Información Template */}
            <Grid item xs={12}>
              <Alert severity="info" sx={{ bgcolor: 'rgba(79, 70, 229, 0.1)' }}>
                <Typography variant="body2">
                  📋 <strong>Industria:</strong> {getIndustryInfo(selectedTemplate.industria).name} | 
                  <strong> Riesgo:</strong> {selectedTemplate.nivel_riesgo} | 
                  <strong> Tiempo:</strong> {selectedTemplate.tiempo_estimado} min
                </Typography>
              </Alert>
            </Grid>
            
            {/* Estructura EIPD */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#f9fafb', mb: 2 }}>
                Estructura de la EIPD:
              </Typography>
              
              <Accordion sx={{ bgcolor: '#374151', mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandIcon sx={{ color: '#9ca3af' }} />}>
                  <Typography sx={{ color: '#f9fafb' }}>1. Descripción del Tratamiento</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ color: '#d1d5db' }}>
                    {selectedTemplate.estructura?.descripcion_tratamiento}
                  </Typography>
                </AccordionDetails>
              </Accordion>
              
              <Accordion sx={{ bgcolor: '#374151', mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandIcon sx={{ color: '#9ca3af' }} />}>
                  <Typography sx={{ color: '#f9fafb' }}>2. Necesidad y Proporcionalidad</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ color: '#d1d5db' }}>
                    {selectedTemplate.estructura?.necesidad_proporcionalidad}
                  </Typography>
                </AccordionDetails>
              </Accordion>
              
              <Accordion sx={{ bgcolor: '#374151', mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandIcon sx={{ color: '#9ca3af' }} />}>
                  <Typography sx={{ color: '#f9fafb' }}>3. Riesgos Identificados</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {selectedTemplate.estructura?.riesgos_identificados?.map((riesgo, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <RiskIcon sx={{ fontSize: 16, color: '#ef4444' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={riesgo}
                          primaryTypographyProps={{ 
                            variant: 'body2', 
                            sx: { color: '#d1d5db' } 
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
              
              <Accordion sx={{ bgcolor: '#374151', mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandIcon sx={{ color: '#9ca3af' }} />}>
                  <Typography sx={{ color: '#f9fafb' }}>4. Medidas de Mitigación</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {selectedTemplate.estructura?.medidas_mitigacion?.map((medida, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <SecurityIcon sx={{ fontSize: 16, color: '#10b981' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={medida}
                          primaryTypographyProps={{ 
                            variant: 'body2', 
                            sx: { color: '#d1d5db' } 
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
              
              <Alert severity="success" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)' }}>
                <Typography variant="body2">
                  <strong>Evaluación Final:</strong> {selectedTemplate.estructura?.evaluacion_final}
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
      )}
      
      <DialogActions>
        <Button onClick={() => setPreviewDialog(false)} sx={{ color: '#9ca3af' }}>
          Cerrar
        </Button>
        
        {selectedTemplate && (
          <Button
            onClick={() => {
              usarTemplate(selectedTemplate);
              setPreviewDialog(false);
            }}
            variant="contained"
            startIcon={<UseTemplateIcon />}
            sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' } }}
          >
            Usar Template
          </Button>
        )}
      </DialogActions>
    </Dialog>
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
            <EIPDIcon sx={{ fontSize: 40, color: '#34d399' }} />
            Biblioteca Templates EIPD
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#9ca3af' }}>
            Plantillas de Evaluación de Impacto especializadas por industria y riesgo
          </Typography>
        </Box>

        {/* Dashboard Estadísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
              <CardContent sx={{ py: 3 }}>
                <Typography variant="h3" sx={{ color: '#34d399', fontWeight: 700 }}>
                  {stats.totalTemplates}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Templates Total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
              <CardContent sx={{ py: 3 }}>
                <Typography variant="h3" sx={{ color: '#fbbf24', fontWeight: 700 }}>
                  {stats.recomendados}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Recomendados
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
              <CardContent sx={{ py: 3 }}>
                <Typography variant="h3" sx={{ color: '#ef4444', fontWeight: 700 }}>
                  {stats.altoRiesgo}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Alto Riesgo
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151', textAlign: 'center' }}>
              <CardContent sx={{ py: 3 }}>
                <Typography variant="h3" sx={{ color: '#8b5cf6', fontWeight: 700 }}>
                  {Object.keys(stats.porIndustria).length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Industrias
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Controles */}
        <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151', p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel sx={{ color: '#9ca3af' }}>Filtrar por Industria</InputLabel>
              <Select
                value={filterIndustry}
                onChange={(e) => setFilterIndustry(e.target.value)}
                sx={{ bgcolor: '#374151', color: '#f9fafb' }}
              >
                <MenuItem value="TODAS">Todas las Industrias</MenuItem>
                {industries.map((industry) => (
                  <MenuItem key={industry.id} value={industry.id}>
                    {industry.icon} {industry.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel sx={{ color: '#9ca3af' }}>Nivel de Riesgo</InputLabel>
              <Select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                sx={{ bgcolor: '#374151', color: '#f9fafb' }}
              >
                <MenuItem value="TODOS">Todos</MenuItem>
                <MenuItem value="ALTO">Alto Riesgo</MenuItem>
                <MenuItem value="MEDIO">Medio Riesgo</MenuItem>
                <MenuItem value="BAJO">Bajo Riesgo</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setNewTemplate({
                  nombre: '', descripcion: '', industria: '', nivel_riesgo: 'MEDIO',
                  criterios_aplicacion: [], tiempo_estimado: '60', recomendado: false,
                  estructura: {
                    descripcion_tratamiento: '', necesidad_proporcionalidad: '',
                    riesgos_identificados: [], medidas_mitigacion: [], evaluacion_final: ''
                  }
                });
                setTemplateDialog(true);
              }}
              sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
            >
              Nuevo Template
            </Button>
          </Box>
        </Paper>

        {/* Templates Cards */}
        {renderTemplateCards()}

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
              📚 <strong>Biblioteca Templates EIPD:</strong> Plantillas especializadas por industria 
              que aceleran la creación de Evaluaciones de Impacto. Incluye criterios predefinidos, 
              riesgos comunes y medidas de mitigación según Art. 25 Ley 21.719.
            </Typography>
          </Alert>
        </Box>
      </Container>

      {/* Dialogs */}
      {renderPreviewDialog()}
    </Box>
  );
};

export default EIPDTemplates;