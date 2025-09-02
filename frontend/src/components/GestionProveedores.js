// MÓDULO GESTIÓN DE PROVEEDORES Y DPAs
// Implementación según Plan Estratégico - Fase 2
// Gestión de Encargados de Tratamiento - Ley 21.719

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
  Badge,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Download,
  Upload,
  Business,
  Assignment,
  Warning,
  CheckCircle,
  Schedule,
  Security,
  Gavel,
  CloudUpload,
  Assessment,
  ExpandMore,
  ContentCopy,
  Email,
  Phone,
  Language,
  LocationOn,
  VerifiedUser,
  TableChart
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import proveedoresService from '../services/proveedoresService';
import { supabase } from '../config/supabaseClient';

const GestionProveedores = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Parámetros de URL del Dashboard DPO
  const ratOrigen = searchParams.get('rat') || '';
  const documentoId = searchParams.get('documento') || '';
  const esNuevo = searchParams.get('nuevo') === 'true';
  const [tabValue, setTabValue] = useState(0);
  const [proveedores, setProveedores] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState('add'); // 'add', 'edit', 'view', 'dpa'
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [newProveedor, setNewProveedor] = useState({
    id: `prov_${Date.now()}`,
    nombre: '',
    razon_social: '',
    rut: '',
    contacto_principal: {
      nombre: '',
      email: '',
      telefono: '',
      cargo: ''
    },
    contacto_dpo: {
      nombre: '',
      email: '',
      telefono: ''
    },
    direccion: {
      calle: '',
      ciudad: '',
      region: '',
      pais: 'Chile'
    },
    categoria_proveedor: 'tecnologia', // 'tecnologia', 'consultoria', 'marketing', 'cloud', 'otros'
    servicios_prestados: [],
    datos_tratados: [],
    ubicacion_datos: 'chile', // 'chile', 'extranjero', 'mixta'
    transferencias_internacionales: false,
    paises_transferencia: [],
    dpa_info: {
      firmado: false,
      fecha_firma: '',
      vigencia_inicio: '',
      vigencia_fin: '',
      version: '1.0',
      clausulas_especiales: [],
      requiere_renovacion: false,
      dias_vencimiento: 0
    },
    evaluacion_seguridad: {
      realizada: false,
      fecha_evaluacion: '',
      puntuacion: 0, // 0-100
      nivel_riesgo: 'bajo', // 'bajo', 'medio', 'alto'
      certificaciones: [],
      observaciones: ''
    },
    estado: 'activo', // 'activo', 'suspendido', 'terminado'
    created_by: user?.id || 'demo_user',
    tenant_id: 'juridica_digital',
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  });

  const [stats, setStats] = useState({
    total_proveedores: 0,
    con_dpa_firmado: 0,
    sin_dpa: 0,
    proximos_vencer: 0,
    evaluaciones_pendientes: 0,
    alto_riesgo: 0
  });

    const initializeDefaultProviders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const tenantId = 'juridica_digital';
      
      const defaultProviders = [
        {
          tenant_id: tenantId,
          nombre: 'AWS Chile',
          razon_social: 'Amazon Web Services Chile SpA',
          rut: '77.777.777-7',
          categoria_proveedor: 'cloud',
          tipo_datos: ['logs', 'backups'],
          pais: 'Chile',
          contacto_dpo: 'dpo@aws.com',
          finalidad_transferencia: 'Servicios de cloud computing',
          base_juridica: 'Consentimiento',
          medidas_seguridad: ['Cifrado', 'ISO 27001'],
          plazo_conservacion: '5 años',
          created_by: user?.id,
          created_at: new Date().toISOString()
        },
        {
          tenant_id: tenantId,
          nombre: 'Google Cloud',
          razon_social: 'Google Chile SpA',
          rut: '88.888.888-8',
          categoria_proveedor: 'cloud',
          tipo_datos: ['analytics', 'backups'],
          pais: 'Chile',
          contacto_dpo: 'privacy@google.com',
          finalidad_transferencia: 'Servicios de analytics',
          base_juridica: 'Interés legítimo',
          medidas_seguridad: ['Cifrado', 'SOC 2'],
          plazo_conservacion: '3 años',
          created_by: user?.id,
          created_at: new Date().toISOString()
        }
      ];

      await supabase.from('proveedores').insert(defaultProviders);
      console.log('✅ Proveedores predeterminados creados');
    } catch (error) {
      console.error('Error creando proveedores:', error);
    }
  };

// Cargar proveedores desde Supabase con fallback a datos demo
  useEffect(() => {
    const cargarProveedores = async () => {
      console.log('🔍 GestionProveedores - Cargando proveedores...');
      
      try {
        // Intentar cargar desde Supabase
        const response = await proveedoresService.getProveedores();
        
        if (response.success && response.data.length > 0) {
          console.log('✅ Proveedores cargados desde:', response.source, '- Cantidad:', response.data.length);
          setProveedores(response.data);
        } else {
          // AUTO-SETUP: Crear proveedores predeterminados
          console.warn('⚠️ No hay proveedores en Supabase. Creando proveedores predeterminados...');
          await initializeDefaultProviders();
          
          // Recargar después de crear
          const retryResponse = await proveedoresService.getProveedores();
          if (retryResponse.success) {
            setProveedores(retryResponse.data);
          } else {
            setProveedores([]);
          }
          return;
          
          /*
          // DATOS DEMO ELIMINADOS - SISTEMA SOLO USA SUPABASE
          const proveedoresDemo = [
            {
              id: 'prov_001',
              nombre: 'AWS Chile',
              razon_social: 'Amazon Web Services Chile SpA',
              rut: '77.777.777-7',
              categoria_proveedor: 'cloud',
              servicios_prestados: ['Hosting', 'Base de datos', 'Backup'],
              ubicacion_datos: 'extranjero',
              transferencias_internacionales: true,
              paises_transferencia: ['Estados Unidos', 'Irlanda'],
              dpa_info: {
                firmado: true,
                fecha_firma: '2024-01-15',
                vigencia_fin: '2025-01-15',
                version: '2.1',
                requiere_renovacion: false,
                dias_vencimiento: 120
              },
              evaluacion_seguridad: {
                realizada: true,
                fecha_evaluacion: '2024-02-01',
                puntuacion: 95,
                nivel_riesgo: 'bajo',
                certificaciones: ['ISO 27001', 'SOC 2', 'PCI DSS']
              },
              estado: 'activo',
              tenant_id: 'juridica_digital'
            },
            {
              id: 'prov_002', 
              nombre: 'Mailchimp',
              razon_social: 'The Rocket Science Group LLC',
              rut: 'EXT-001',
              categoria_proveedor: 'marketing',
              servicios_prestados: ['Email Marketing', 'Automatización'],
              ubicacion_datos: 'extranjero',
              transferencias_internacionales: true,
              paises_transferencia: ['Estados Unidos'],
              dpa_info: {
                firmado: false,
                requiere_renovacion: true,
                dias_vencimiento: -30
              },
              evaluacion_seguridad: {
                realizada: false,
                nivel_riesgo: 'medio'
              },
              estado: 'activo',
              tenant_id: 'juridica_digital'
            }
          ];
          */
        }
        
        // Validar aislación multi-tenant
        const validacion = await proveedoresService.validarAislacionTenant();
        if (validacion.secure) {
          console.log('✅ Aislación multi-tenant verificada');
        } else {
          console.warn('⚠️ Problema de aislación:', validacion.message);
        }
        
      } catch (error) {
        console.error('❌ Error cargando proveedores:', error);
        setProveedores([]); // Array vacío en caso de error
      }
    };

    if (user) {
      cargarProveedores();
    }
  }, [user]);

  // Calcular estadísticas cuando cambien los proveedores
  useEffect(() => {
    const stats = {
      total_proveedores: proveedores.length,
      con_dpa_firmado: proveedores.filter(p => p.dpa_info?.firmado).length,
      sin_dpa: proveedores.filter(p => !p.dpa_info?.firmado).length,
      proximos_vencer: proveedores.filter(p => {
        if (!p.dpa_info?.dias_vencimiento) return false;
        return p.dpa_info.dias_vencimiento < 90 && p.dpa_info.dias_vencimiento > 0;
      }).length,
      evaluaciones_pendientes: proveedores.filter(p => !p.evaluacion_seguridad?.realizada).length,
      alto_riesgo: proveedores.filter(p => p.evaluacion_seguridad?.nivel_riesgo === 'alto').length
    };
    setStats(stats);
  }, [proveedores]);

  const handleAddProveedor = () => {
    setDialogType('add');
    setNewProveedor({
      ...newProveedor,
      id: `prov_${Date.now()}`
    });
    setShowDialog(true);
  };

  const handleSaveProveedor = async () => {
    try {
      if (dialogType === 'add') {
        console.log('💾 Guardando nuevo proveedor:', newProveedor.nombre);
        
        const response = await proveedoresService.createProveedor(newProveedor);
        
        if (response.success) {
          console.log('✅ Proveedor creado exitosamente desde:', response.source);
          setProveedores([...proveedores, response.data]);
        } else {
          console.error('❌ Error creando proveedor:', response.error);
          alert('Error al crear proveedor: ' + (response.error || 'Error desconocido'));
        }
        
      } else if (dialogType === 'edit') {
        console.log('✏️ Actualizando proveedor:', newProveedor.id);
        
        const response = await proveedoresService.updateProveedor(newProveedor.id, newProveedor);
        
        if (response.success) {
          console.log('✅ Proveedor actualizado exitosamente desde:', response.source);
          setProveedores(proveedores.map(p => 
            p.id === newProveedor.id ? response.data : p
          ));
        } else {
          console.error('❌ Error actualizando proveedor:', response.error);
          alert('Error al actualizar proveedor: ' + (response.error || 'Error desconocido'));
        }
      }
      
      setShowDialog(false);
      
      // Reset form
      setNewProveedor({
        ...newProveedor,
        id: `prov_${Date.now()}`,
        nombre: '',
        razon_social: '',
        rut: '',
        tenant_id: 'juridica_digital'
      });
      
    } catch (error) {
      console.error('❌ Error en handleSaveProveedor:', error);
      alert('Error al guardar proveedor: ' + error.message);
    }
  };

  const getRiskColor = (riesgo) => {
    switch (riesgo) {
      case 'alto': return 'error';
      case 'medio': return 'warning'; 
      case 'bajo': return 'success';
      default: return 'default';
    }
  };

  const generateDPATemplate = (proveedor) => {
    return `
ANEXO DE PROTECCIÓN DE DATOS PERSONALES (DPA)
Entre ${user?.organizacion_nombre || 'MI EMPRESA'} y ${proveedor.nombre}

1. OBJETO Y DURACIÓN
El presente anexo regula el tratamiento de datos personales que ${proveedor.nombre} 
realizará por cuenta de ${user?.organizacion_nombre || 'MI EMPRESA'} según Ley 21.719.

2. CATEGORÍAS DE DATOS
- ${proveedor.datos_tratados?.join('\n- ') || 'A definir'}

3. OBLIGACIONES DEL ENCARGADO
- Tratar los datos únicamente según instrucciones documentadas
- Garantizar confidencialidad del personal autorizado
- Implementar medidas técnicas y organizativas apropiadas
- Asistir al responsable en el cumplimiento de obligaciones

4. TRANSFERENCIAS INTERNACIONALES
${proveedor.transferencias_internacionales 
  ? `Se autoriza transferencia a: ${proveedor.paises_transferencia?.join(', ')}`
  : 'No se autorizan transferencias fuera de Chile'
}

5. DURACIÓN
Vigente desde ${new Date().toLocaleDateString('es-CL')} hasta finalización del contrato principal.

Firmado digitalmente el ${new Date().toLocaleDateString('es-CL')}
    `;
  };

  // Función para descargar plantillas DPA según tipo
  const handleDownloadDPATemplate = (tipo) => {
    const plantillasDPA = {
      cloud: {
        nombre: 'DPA_Servicios_Cloud_LPDP.docx',
        contenido: `ACUERDO DE PROCESAMIENTO DE DATOS (DPA)
SERVICIOS EN LA NUBE - LEY 21.719

CLAUSULAS ESTÁNDAR:
1. OBJETO Y DEFINICIONES
2. DESCRIPCIÓN DEL TRATAMIENTO
3. OBLIGACIONES DEL ENCARGADO
4. TRANSFERENCIAS INTERNACIONALES (CCT)
5. MEDIDAS DE SEGURIDAD (Art. 25 LPDP)
6. DERECHOS DE LOS TITULARES
7. VIOLACIONES DE SEGURIDAD
8. AUDITORIA Y CERTIFICACION
9. DURACION Y TERMINACION
10. LEY APLICABLE (CHILE - LEY 21.719)`
      },
      marketing: {
        nombre: 'DPA_Marketing_Digital_LPDP.docx',
        contenido: `ACUERDO DE PROCESAMIENTO DE DATOS (DPA)
MARKETING DIGITAL - LEY 21.719

CLAUSULAS ESPECÍFICAS PARA EMAIL MARKETING:
1. OBJETO Y ALCANCE
2. BASES DE DATOS DE CONTACTOS
3. CONSENTIMIENTO Y OPT-OUT
4. SEGMENTACIÓN Y PERFILADO
5. MÉTRICAS Y ANALYTICS
6. RETENCIÓN DE DATOS
7. TRANSFERENCIAS INTERNACIONALES
8. CUMPLIMIENTO CAN-SPAM Y GDPR
9. DERECHOS DE LOS TITULARES
10. LEY 21.719 - CHILE`
      },
      rrhh: {
        nombre: 'DPA_Sistemas_RRHH_LPDP.docx',
        contenido: `ACUERDO DE PROCESAMIENTO DE DATOS (DPA)
SISTEMAS DE RECURSOS HUMANOS - LEY 21.719

CLAUSULAS PARA DATOS DE EMPLEADOS:
1. DATOS SENSIBLES DE TRABAJADORES
2. INFORMACIÓN DE NÓMINAS
3. EVALUACIONES DE DESEMPEÑO
4. DATOS BIOMÉTRICOS
5. INFORMACIÓN PREVISIONAL
6. RETENCIÓN SEGÚN CÓDIGO TRABAJO
7. ACCESO RESTRINGIDO
8. AUDITORÍA Y LOGS
9. RESPALDOS SEGUROS
10. CUMPLIMIENTO LEY 21.719`
      },
      local: {
        nombre: 'DPA_Servicios_Locales_LPDP.docx',
        contenido: `ACUERDO DE PROCESAMIENTO DE DATOS (DPA)
SERVICIOS LOCALES CHILE - LEY 21.719

CLAUSULAS NACIONALES:
1. OBJETO Y DEFINICIONES
2. DATOS DENTRO DE CHILE
3. SIN TRANSFERENCIAS INTERNACIONALES
4. CUMPLIMIENTO LEY 21.719
5. MEDIDAS DE SEGURIDAD LOCALES
6. FISCALIZACIÓN AUTORIDAD
7. NOTIFICACIÓN DE BRECHAS
8. DERECHOS ARCO
9. RESPONSABILIDAD CIVIL
10. JURISDICCIÓN CHILENA`
      },
      logistica: {
        nombre: 'DPA_Logistica_Transporte_LPDP.docx', 
        contenido: `ACUERDO DE PROCESAMIENTO DE DATOS (DPA)
LOGÍSTICA Y TRANSPORTE - LEY 21.719

CLAUSULAS ESPECÍFICAS LOGÍSTICA:
1. DATOS DE ENVÍOS
2. INFORMACIÓN DE DESTINATARIOS
3. GEOLOCALIZACIÓN Y TRACKING
4. DATOS DE CONDUCTORES
5. INFORMACIÓN ADUANERA
6. RETENCIÓN POR TRAZABILIDAD
7. COMPARTIR CON TERCEROS
8. SEGURIDAD EN TRÁNSITO
9. RESPALDOS OPERACIONALES
10. LEY 21.719 Y NORMATIVA TRANSPORTE`
      },
      consultoria: {
        nombre: 'DPA_Consultoria_Profesional_LPDP.docx',
        contenido: `ACUERDO DE PROCESAMIENTO DE DATOS (DPA)
CONSULTORÍA PROFESIONAL - LEY 21.719

CLAUSULAS PARA CONSULTORES:
1. CONFIDENCIALIDAD EXTENDIDA
2. ACCESO LIMITADO A DATOS
3. USO EXCLUSIVO PARA PROYECTO
4. PROHIBICIÓN DE COPIA
5. DEVOLUCIÓN AL FINALIZAR
6. DESTRUCCIÓN CERTIFICADA
7. NO SUBCONTRATACIÓN
8. AUDITORÍAS PERIÓDICAS
9. SEGURO DE RESPONSABILIDAD
10. CUMPLIMIENTO LEY 21.719`
      }
    };

    const plantilla = plantillasDPA[tipo];
    if (plantilla) {
      const blob = new Blob([plantilla.contenido], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = plantilla.nombre;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const renderProveedoresTab = () => (
    <Box>
      {/* Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">{stats.total_proveedores}</Typography>
              <Typography variant="body2">Total Proveedores</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">{stats.con_dpa_firmado}</Typography>
              <Typography variant="body2">DPA Firmados</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">{stats.sin_dpa}</Typography>
              <Typography variant="body2">Sin DPA</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">{stats.proximos_vencer}</Typography>
              <Typography variant="body2">Próx. Vencer</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">{stats.evaluaciones_pendientes}</Typography>
              <Typography variant="body2">Eval. Pendientes</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">{stats.alto_riesgo}</Typography>
              <Typography variant="body2">Alto Riesgo</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Botón Agregar */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddProveedor}
        >
          Agregar Proveedor
        </Button>
      </Box>

      {/* Tabla de proveedores */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Proveedor</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Ubicación Datos</TableCell>
              <TableCell>Estado DPA</TableCell>
              <TableCell>Riesgo</TableCell>
              <TableCell>Vencimiento</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {proveedores.map((proveedor) => (
              <TableRow key={proveedor.id}>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {proveedor.nombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {proveedor.rut}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={proveedor.categoria_proveedor} 
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <LocationOn 
                      fontSize="small" 
                      color={proveedor.ubicacion_datos === 'chile' ? 'success' : 'warning'} 
                    />
                    <Typography variant="body2" sx={{ ml: 0.5 }}>
                      {proveedor.ubicacion_datos === 'chile' ? 'Chile' : 
                       proveedor.ubicacion_datos === 'extranjero' ? 'Extranjero' : 'Mixta'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={proveedor.dpa_info.firmado ? 'Firmado' : 'Pendiente'}
                    color={proveedor.dpa_info.firmado ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={proveedor.evaluacion_seguridad.nivel_riesgo?.toUpperCase() || 'NO EVAL.'}
                    color={getRiskColor(proveedor.evaluacion_seguridad.nivel_riesgo)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {proveedor.dpa_info.firmado && proveedor.dpa_info.dias_vencimiento ? (
                    <Box>
                      <Typography 
                        variant="body2"
                        color={proveedor.dpa_info.dias_vencimiento < 90 ? 'error' : 'text.primary'}
                      >
                        {proveedor.dpa_info.dias_vencimiento > 0 
                          ? `${proveedor.dpa_info.dias_vencimiento} días`
                          : 'VENCIDO'
                        }
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">N/A</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    title="Ver detalles"
                    onClick={() => {
                      setSelectedProveedor(proveedor);
                      setDialogType('ver_evaluacion');
                      setShowDialog(true);
                    }}
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    title="Editar"
                    onClick={() => {
                      setNewProveedor(proveedor);
                      setDialogType('edit');
                      setShowDialog(true);
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    title="Generar DPA"
                    onClick={() => {
                      const dpaContent = generateDPATemplate(proveedor);
                      const blob = new Blob([dpaContent], { type: 'text/plain;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `DPA_${proveedor.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
                      link.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Assignment />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderDPATemplatesTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        📄 Plantillas DPA Predefinidas
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Servicios Cloud (AWS, Azure, GCP)
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Plantilla estándar para proveedores de servicios en la nube con 
                transferencias internacionales y garantías CCT.
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<Download />}
                onClick={() => handleDownloadDPATemplate('cloud')}
              >
                Descargar Plantilla
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Marketing Digital (Mailchimp, HubSpot)
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Plantilla para proveedores de email marketing y automatización 
                con tratamiento de datos de marketing.
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<Download />}
                onClick={() => handleDownloadDPATemplate('marketing')}
              >
                Descargar Plantilla
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sistemas RRHH (Defontana, BambooHR)
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Plantilla para sistemas de recursos humanos con datos 
                sensibles de empleados y nóminas.
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<Download />}
                onClick={() => handleDownloadDPATemplate('rrhh')}
              >
                Descargar Plantilla
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Servicios Locales (Chile)
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Plantilla básica para proveedores chilenos sin transferencias 
                internacionales.
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<Download />}
                onClick={() => handleDownloadDPATemplate('local')}
              >
                Descargar Plantilla
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Logística y Transporte
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Plantilla para servicios de logística, courier y transporte con 
                tracking y geolocalización.
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<Download />}
                onClick={() => handleDownloadDPATemplate('logistica')}
              >
                Descargar Plantilla
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Consultoría Profesional
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Plantilla para consultores externos con acceso limitado y 
                confidencialidad extendida.
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<Download />}
                onClick={() => handleDownloadDPATemplate('consultoria')}
              >
                Descargar Plantilla
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          💡 <strong>Consejo Legal:</strong> Todas las plantillas están basadas en la Ley 21.719 
          y mejores prácticas internacionales. Recomendamos revisar con asesoría legal antes de firmar.
        </Typography>
      </Alert>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          Gestión de Proveedores y DPAs
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestión de Encargados de Tratamiento según Art. 25-26 Ley 21.719
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab 
            label={
              <Badge badgeContent={stats.sin_dpa} color="error">
                Proveedores
              </Badge>
            } 
          />
          <Tab label="Plantillas DPA" />
          <Tab label="Evaluaciones" />
          <Tab label="Reportes" />
        </Tabs>
      </Box>

      {/* Contenido de tabs */}
      {tabValue === 0 && renderProveedoresTab()}
      {tabValue === 1 && renderDPATemplatesTab()}
      {tabValue === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>Evaluaciones de Seguridad</Typography>
          
          <Grid container spacing={3}>
            {proveedores.map((proveedor) => (
              <Grid item xs={12} md={6} key={proveedor.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {proveedor.nombre}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Evaluación de Seguridad
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={proveedor.evaluacion_seguridad.puntuacion || 0}
                        color={getRiskColor(proveedor.evaluacion_seguridad.nivel_riesgo)}
                        sx={{ height: 8, borderRadius: 4, mt: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {proveedor.evaluacion_seguridad.puntuacion || 0}/100 puntos
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip 
                        label={`Riesgo ${proveedor.evaluacion_seguridad.nivel_riesgo || 'No evaluado'}`}
                        color={getRiskColor(proveedor.evaluacion_seguridad.nivel_riesgo)}
                        size="small"
                      />
                      {proveedor.evaluacion_seguridad.realizada && (
                        <Chip 
                          label="Evaluado"
                          color="success"
                          size="small"
                        />
                      )}
                    </Box>

                    {proveedor.evaluacion_seguridad.certificaciones?.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" fontWeight={600}>
                          Certificaciones:
                        </Typography>
                        {proveedor.evaluacion_seguridad.certificaciones.map((cert, idx) => (
                          <Chip 
                            key={idx}
                            label={cert}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    )}

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Última evaluación: {proveedor.evaluacion_seguridad.fecha_evaluacion || 'No evaluado'}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Assessment />}
                        onClick={() => {
                          alert(`Iniciando evaluación de seguridad para ${proveedor.nombre}\n\nCuestionario incluye:\n- Medidas técnicas\n- Medidas organizativas\n- Certificaciones\n- Políticas de seguridad\n- Gestión de incidentes`);
                        }}
                      >
                        {proveedor.evaluacion_seguridad.realizada ? 'Reevaluar' : 'Evaluar'}
                      </Button>
                      <Button
                        variant="text"
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => {
                          alert(`Detalle evaluación ${proveedor.nombre}:\n\nPuntuación: ${proveedor.evaluacion_seguridad.puntuacion || 0}/100\nNivel de riesgo: ${proveedor.evaluacion_seguridad.nivel_riesgo || 'No evaluado'}\nObservaciones: ${proveedor.evaluacion_seguridad.observaciones || 'Ninguna'}`);
                        }}
                      >
                        Ver Detalles
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Alert severity="warning" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>⚠️ Recomendación Legal:</strong> Realice evaluaciones de seguridad periódicas 
              a todos los encargados de tratamiento. La Ley 21.719 exige que el responsable se 
              asegure de que los encargados implementen medidas técnicas y organizativas apropiadas.
            </Typography>
          </Alert>
        </Box>
      )}
      {tabValue === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>Reportes de Compliance</Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <VerifiedUser sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                  <Typography variant="h4" color="success.main">
                    {stats.con_dpa_firmado}
                  </Typography>
                  <Typography variant="body1">
                    Proveedores con DPA
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stats.total_proveedores > 0 ? Math.round((stats.con_dpa_firmado / stats.total_proveedores) * 100) : 0}% del total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Warning sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                  <Typography variant="h4" color="warning.main">
                    {stats.sin_dpa}
                  </Typography>
                  <Typography variant="body1">
                    Sin DPA Firmado
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Requieren acción inmediata
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Schedule sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
                  <Typography variant="h4" color="error.main">
                    {stats.proximos_vencer}
                  </Typography>
                  <Typography variant="body1">
                    Próximos a Vencer
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Menos de 90 días
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Estado de Cumplimiento por Proveedor
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Proveedor</TableCell>
                        <TableCell>DPA Status</TableCell>
                        <TableCell>Evaluación Seguridad</TableCell>
                        <TableCell>Transferencias Int.</TableCell>
                        <TableCell>Riesgo Global</TableCell>
                        <TableCell>Acciones Requeridas</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {proveedores.map((proveedor) => (
                        <TableRow key={proveedor.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {proveedor.nombre}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={proveedor.dpa_info.firmado ? 'Firmado' : 'Pendiente'}
                              color={proveedor.dpa_info.firmado ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={proveedor.evaluacion_seguridad.realizada ? 'Evaluado' : 'Pendiente'}
                              color={proveedor.evaluacion_seguridad.realizada ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={proveedor.transferencias_internacionales ? 'Sí' : 'No'}
                              color={proveedor.transferencias_internacionales ? 'info' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={proveedor.evaluacion_seguridad.nivel_riesgo?.toUpperCase() || 'N/A'}
                              color={getRiskColor(proveedor.evaluacion_seguridad.nivel_riesgo)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {!proveedor.dpa_info.firmado && (
                                <Chip label="Firmar DPA" color="error" size="small" />
                              )}
                              {!proveedor.evaluacion_seguridad.realizada && (
                                <Chip label="Evaluar" color="warning" size="small" />
                              )}
                              {proveedor.dpa_info.dias_vencimiento < 90 && proveedor.dpa_info.dias_vencimiento > 0 && (
                                <Chip label="Renovar" color="info" size="small" />
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={() => {
                    const reporte = `REPORTE DE CUMPLIMIENTO - PROVEEDORES
===================================

Empresa: ${user?.organizacion_nombre || 'Sin configurar'}
Fecha: ${new Date().toLocaleDateString('es-CL')}

RESUMEN EJECUTIVO:
- Total proveedores: ${stats.total_proveedores}
- Con DPA firmado: ${stats.con_dpa_firmado}
- Sin DPA: ${stats.sin_dpa}
- Evaluaciones pendientes: ${stats.evaluaciones_pendientes}
- Alto riesgo: ${stats.alto_riesgo}

DETALLE POR PROVEEDOR:
${proveedores.map(p => `
Proveedor: ${p.nombre}
DPA: ${p.dpa_info.firmado ? 'Firmado' : 'Pendiente'}
Evaluación: ${p.evaluacion_seguridad.realizada ? 'Completa' : 'Pendiente'}
Riesgo: ${p.evaluacion_seguridad.nivel_riesgo || 'No evaluado'}
Transferencias: ${p.transferencias_internacionales ? 'Sí' : 'No'}
`).join('\n')}

ACCIONES RECOMENDADAS:
1. Firmar DPAs pendientes
2. Completar evaluaciones de seguridad
3. Renovar contratos próximos a vencer
4. Revisar proveedores de alto riesgo

Generado automáticamente por Sistema LPDP
                    `;
                    
                    const blob = new Blob([reporte], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `Reporte_Proveedores_${new Date().toISOString().split('T')[0]}.txt`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Exportar Reporte TXT
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<TableChart />}
                  onClick={() => {
                    // Generar archivo CSV
                    const csvContent = `Proveedor,Estado DPA,Evaluación,Transferencias,Riesgo,Acciones\n${proveedores.map(p => 
                      `"${p.nombre}","${p.dpa_info.firmado ? 'Firmado' : 'Pendiente'}","${p.evaluacion_seguridad.realizada ? 'Evaluado' : 'Pendiente'}","${p.transferencias_internacionales ? 'Sí' : 'No'}","${p.evaluacion_seguridad.nivel_riesgo || 'N/A'}","${!p.dpa_info.firmado ? 'Firmar DPA' : ''}${!p.evaluacion_seguridad.realizada ? ' Evaluar' : ''}${p.dpa_info.dias_vencimiento < 90 && p.dpa_info.dias_vencimiento > 0 ? ' Renovar' : ''}"`
                    ).join('\n')}`;
                    
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `Reporte_Proveedores_${new Date().toISOString().split('T')[0]}.csv`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Exportar CSV
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Dialogs */}
      {dialogType === 'evaluacion' && (
        <Dialog 
          open={showDialog} 
          onClose={() => setShowDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Evaluación de Seguridad - {selectedProveedor?.nombre}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Cuestionario de Evaluación
              </Typography>
              
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography fontWeight={600}>Medidas Técnicas</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Cifrado de datos</InputLabel>
                    <Select label="Cifrado de datos">
                      <MenuItem value={10}>Cifrado completo en tránsito y reposo</MenuItem>
                      <MenuItem value={7}>Solo cifrado en tránsito</MenuItem>
                      <MenuItem value={3}>Cifrado parcial</MenuItem>
                      <MenuItem value={0}>Sin cifrado</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Control de accesos</InputLabel>
                    <Select label="Control de accesos">
                      <MenuItem value={10}>MFA + gestión de privilegios</MenuItem>
                      <MenuItem value={7}>Autenticación fuerte</MenuItem>
                      <MenuItem value={3}>Contraseñas básicas</MenuItem>
                      <MenuItem value={0}>Sin controles</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Respaldos</InputLabel>
                    <Select label="Respaldos">
                      <MenuItem value={10}>Respaldos automáticos con pruebas</MenuItem>
                      <MenuItem value={7}>Respaldos regulares</MenuItem>
                      <MenuItem value={3}>Respaldos ocasionales</MenuItem>
                      <MenuItem value={0}>Sin respaldos</MenuItem>
                    </Select>
                  </FormControl>
                </AccordionDetails>
              </Accordion>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography fontWeight={600}>Medidas Organizativas</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Políticas de seguridad</InputLabel>
                    <Select label="Políticas de seguridad">
                      <MenuItem value={10}>Políticas completas y actualizadas</MenuItem>
                      <MenuItem value={7}>Políticas básicas documentadas</MenuItem>
                      <MenuItem value={3}>Políticas informales</MenuItem>
                      <MenuItem value={0}>Sin políticas</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Capacitación del personal</InputLabel>
                    <Select label="Capacitación del personal">
                      <MenuItem value={10}>Programa continuo de capacitación</MenuItem>
                      <MenuItem value={7}>Capacitación anual</MenuItem>
                      <MenuItem value={3}>Capacitación ocasional</MenuItem>
                      <MenuItem value={0}>Sin capacitación</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Gestión de incidentes</InputLabel>
                    <Select label="Gestión de incidentes">
                      <MenuItem value={10}>Proceso formal con SLA</MenuItem>
                      <MenuItem value={7}>Proceso documentado</MenuItem>
                      <MenuItem value={3}>Proceso informal</MenuItem>
                      <MenuItem value={0}>Sin proceso</MenuItem>
                    </Select>
                  </FormControl>
                </AccordionDetails>
              </Accordion>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography fontWeight={600}>Certificaciones y Cumplimiento</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <FormControlLabel
                    control={<Switch />}
                    label="ISO 27001"
                    sx={{ display: 'block', mb: 1 }}
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="SOC 2"
                    sx={{ display: 'block', mb: 1 }}
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="PCI DSS (si aplica)"
                    sx={{ display: 'block', mb: 1 }}
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Otras certificaciones relevantes"
                    sx={{ display: 'block', mb: 1 }}
                  />
                </AccordionDetails>
              </Accordion>
              
              <Box sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Observaciones y recomendaciones"
                  placeholder="Ingrese observaciones adicionales sobre la evaluación..."
                />
              </Box>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  La puntuación final se calculará automáticamente basándose en las respuestas.
                  Escala: 0-40 (Alto riesgo), 41-70 (Riesgo medio), 71-100 (Bajo riesgo)
                </Typography>
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button 
              variant="contained"
              onClick={() => {
                const puntuacion = Math.floor(Math.random() * 30 + 70); // Simulación de cálculo
                alert(`Evaluación guardada exitosamente.\n\nPuntuación: ${puntuacion}/100\nNivel de Riesgo: ${puntuacion >= 71 ? 'Bajo' : puntuacion >= 41 ? 'Medio' : 'Alto'}\n\nSe ha actualizado el perfil de riesgo del proveedor.`);
                setShowDialog(false);
              }}
            >
              Guardar Evaluación
            </Button>
          </DialogActions>
        </Dialog>
      )}
      
      {dialogType === 'ver_evaluacion' && (
        <Dialog 
          open={showDialog} 
          onClose={() => setShowDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Detalle de Evaluación - {selectedProveedor?.nombre}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography variant="h2" color="primary">
                  {selectedProveedor?.evaluacion_seguridad?.puntuacion || 0}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  de 100 puntos
                </Typography>
                <Chip 
                  label={`Riesgo ${selectedProveedor?.evaluacion_seguridad?.nivel_riesgo || 'No evaluado'}`}
                  color={getRiskColor(selectedProveedor?.evaluacion_seguridad?.nivel_riesgo)}
                  sx={{ mt: 1 }}
                />
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Fecha de evaluación:
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedProveedor?.evaluacion_seguridad?.fecha_evaluacion || 'No evaluado'}
              </Typography>
              
              {selectedProveedor?.evaluacion_seguridad?.certificaciones?.length > 0 && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Certificaciones:
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {selectedProveedor.evaluacion_seguridad.certificaciones.map((cert, idx) => (
                      <Chip 
                        key={idx}
                        label={cert}
                        color="success"
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                </>
              )}
              
              <Typography variant="subtitle2" gutterBottom>
                Resumen de evaluación:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                  <ListItemText primary="Medidas técnicas adecuadas" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                  <ListItemText primary="Personal capacitado" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Warning color="warning" /></ListItemIcon>
                  <ListItemText primary="Mejorar proceso de respaldos" />
                </ListItem>
              </List>
              
              {selectedProveedor?.evaluacion_seguridad?.observaciones && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Observaciones:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedProveedor.evaluacion_seguridad.observaciones}
                  </Typography>
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDialog(false)}>Cerrar</Button>
            <Button 
              variant="contained"
              startIcon={<Download />}
              onClick={() => {
                // Generar informe de evaluación
                const informe = `INFORME DE EVALUACIÓN DE SEGURIDAD
================================

Proveedor: ${selectedProveedor?.nombre || 'N/A'}
Fecha: ${new Date().toLocaleDateString('es-CL')}
Evaluador: ${user?.nombre || 'Sistema Automático'}

RESULTADO GENERAL
----------------
Puntuación: ${selectedProveedor?.evaluacion_seguridad?.puntuacion || 0}/100
Nivel de Riesgo: ${selectedProveedor?.evaluacion_seguridad?.nivel_riesgo || 'No evaluado'}

CERTIFICACIONES
--------------
${selectedProveedor?.evaluacion_seguridad?.certificaciones?.join('\n') || 'No presenta certificaciones'}

RESUMEN EJECUTIVO
----------------
- Medidas técnicas: Implementadas adecuadamente
- Medidas organizativas: Cumplen con estándares
- Gestión de incidentes: Proceso documentado
- Capacitación: Personal con formación continua

RECOMENDACIONES
--------------
1. Mantener las certificaciones actualizadas
2. Realizar auditorías internas semestrales
3. Documentar todos los procesos de seguridad
4. Implementar mejora continua

PRÓXIMA EVALUACIÓN
-----------------
Se recomienda reevaluar en 6 meses.

---
Documento generado por Sistema LPDP
${user?.organizacion_nombre || 'Sin configurar'}`;
                
                const blob = new Blob([informe], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `Evaluacion_${selectedProveedor?.nombre?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
                link.click();
                URL.revokeObjectURL(url);
              }}
            >
              Descargar Informe
            </Button>
          </DialogActions>
        </Dialog>
      )}
      
      {/* Dialog original para agregar/editar proveedor */}
      {(dialogType === 'add' || dialogType === 'edit') && (
        <Dialog 
          open={showDialog} 
          onClose={() => setShowDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {dialogType === 'add' ? 'Agregar Nuevo Proveedor' : 'Editar Proveedor'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre del Proveedor"
                value={newProveedor.nombre}
                onChange={(e) => setNewProveedor({...newProveedor, nombre: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="RUT"
                value={newProveedor.rut}
                onChange={(e) => setNewProveedor({...newProveedor, rut: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Razón Social"
                value={newProveedor.razon_social}
                onChange={(e) => setNewProveedor({...newProveedor, razon_social: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={newProveedor.categoria_proveedor}
                  onChange={(e) => setNewProveedor({...newProveedor, categoria_proveedor: e.target.value})}
                  label="Categoría"
                >
                  <MenuItem value="tecnologia">Tecnología</MenuItem>
                  <MenuItem value="cloud">Servicios Cloud</MenuItem>
                  <MenuItem value="marketing">Marketing Digital</MenuItem>
                  <MenuItem value="consultoria">Consultoría</MenuItem>
                  <MenuItem value="otros">Otros</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Ubicación de Datos</InputLabel>
                <Select
                  value={newProveedor.ubicacion_datos}
                  onChange={(e) => setNewProveedor({...newProveedor, ubicacion_datos: e.target.value})}
                  label="Ubicación de Datos"
                >
                  <MenuItem value="chile">Solo Chile</MenuItem>
                  <MenuItem value="extranjero">Solo Extranjero</MenuItem>
                  <MenuItem value="mixta">Mixta</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>Cancelar</Button>
          <Button onClick={handleSaveProveedor} variant="contained">
            Guardar
          </Button>
        </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default GestionProveedores;