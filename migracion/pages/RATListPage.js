import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Tooltip,
  Alert,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  GetApp as ExportIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Assessment as RATIcon,
  CheckCircle as CertifiedIcon,
  Schedule as PendingIcon,
  Error as ErrorIcon,
  PictureAsPdf as PDFIcon,
  TableChart as ExcelIcon,
  Api as APIIcon,
  Business as CostCenterIcon,
  CloudDownload as DownloadIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { ratService } from '../services/ratService';
import { useTenant } from '../contexts/TenantContext';
import { supabase } from '../config/supabaseConfig';

const RATListPage = () => {
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const [rats, setRats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [industryFilter, setIndustryFilter] = useState('TODOS');
  const [stats, setStats] = useState({
    total: 0,
    certificados: 0,
    pendientes: 0,
    borradores: 0
  });
  const [costCenterData, setCostCenterData] = useState({});
  const [apiStats, setApiStats] = useState({ 
    permanentes: 0, 
    no_permanentes: 0,
    total_integraciones: 0
  });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    cargarRATs();
  }, []);

  useEffect(() => {
    if (rats.length > 0) {
      loadCostCenterAndAPIData();
    }
  }, [rats]);

  const cargarRATs = async () => {
    try {
      setLoading(true);
      const tenantId = currentTenant?.id;
      // //console.log('🔍 Cargando RATs para tenant:', tenantId);
      
      // Primero intentar cargar todos los RATs del tenant
      const { data: ratsRaw, error } = await supabase
        .from('mapeo_datos_rat')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error consultando BD:', error);
        throw error;
      }
      
      // //console.log('📊 RATs encontrados en BD:', ratsRaw?.length || 0);
      
      // Formatear los RATs para mostrar
      const formattedRATs = (ratsRaw || []).map(rat => ({
        id: rat.id,
        nombre_actividad: rat.nombre_actividad || 'Sin nombre',
        finalidad: rat.finalidad_principal || rat.descripcion || 'Sin finalidad especificada',
        estado: rat.estado || 'BORRADOR',
        nivel_riesgo: rat.metadata?.riskLevel || 'BAJO',
        industria: rat.metadata?.industria || rat.area_responsable || 'General',
        fecha_actualizacion: rat.updated_at || rat.created_at,
        area_responsable: rat.area_responsable || 'Sin especificar',
        responsable_proceso: rat.responsable_proceso || 'Sin especificar',
        tenant_id: rat.tenant_id
      }));
      
      // //console.log('✅ RATs formateados:', formattedRATs.length);
      setRats(formattedRATs);
      calcularEstadisticas(formattedRATs);
    } catch (error) {
      console.error('Error cargando RATs:', error);
      setRats([]);
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = (ratsData) => {
    const stats = {
      total: ratsData.length,
      certificados: ratsData.filter(r => r.estado === 'CERTIFICADO').length,
      pendientes: ratsData.filter(r => r.estado === 'PENDIENTE_APROBACION').length,
      borradores: ratsData.filter(r => r.estado === 'BORRADOR').length
    };
    setStats(stats);
  };

  const getStatusChip = (estado) => {
    const statusConfig = {
      'CERTIFICADO': { label: 'Certificado', color: 'success', icon: <CertifiedIcon /> },
      'PENDIENTE_APROBACION': { label: 'Pendiente', color: 'warning', icon: <PendingIcon /> },
      'BORRADOR': { label: 'Borrador', color: 'default', icon: <EditIcon /> },
      'ERROR': { label: 'Error', color: 'error', icon: <ErrorIcon /> }
    };
    
    const config = statusConfig[estado] || statusConfig['BORRADOR'];
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        icon={config.icon}
        sx={{ minWidth: 100 }}
      />
    );
  };

  const getRiskChip = (riskLevel) => {
    const riskConfig = {
      'ALTO': { label: 'Alto', color: 'error' },
      'MEDIO': { label: 'Medio', color: 'warning' },
      'BAJO': { label: 'Bajo', color: 'success' }
    };
    
    const config = riskConfig[riskLevel] || riskConfig['BAJO'];
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const filtrarRATs = () => {
    return rats.filter(rat => {
      const matchSearch = rat.nombre_actividad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rat.finalidad?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'TODOS' || rat.estado === statusFilter;
      const matchIndustry = industryFilter === 'TODOS' || rat.industria === industryFilter;
      
      return matchSearch && matchStatus && matchIndustry;
    });
  };

  const ratsFilteredData = filtrarRATs();
  const paginatedRats = ratsFilteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleEditRAT = (ratId) => {
    navigate(`/rat-edit/${ratId}`);
  };

  const handleViewRAT = (ratId) => {
    navigate(`/rat-view/${ratId}`);
  };

  const handleExportRAT = async (ratId) => {
    try {
      await exportRATToPDF(ratId);
    } catch (error) {
      console.error('Error exportando RAT:', error);
    }
  };

  // 📄 FUNCIÓN DE EXPORTACIÓN PDF INDIVIDUAL
  const exportRATToPDF = async (ratId) => {
    try {
      const rat = rats.find(r => r.id === ratId);
      if (!rat) throw new Error('RAT no encontrado');
      
      // //console.log('📄 Exportando RAT a PDF:', ratId);
      
      // Crear contenido PDF
      const pdfContent = `
RAT - REGISTRO DE ACTIVIDADES DE TRATAMIENTO
Ley 21.719 - Protección de Datos Personales Chile

IDENTIFICACIÓN:
- ID RAT: ${rat.id}
- Nombre Actividad: ${rat.nombre_actividad}
- Área Responsable: ${rat.area_responsable}
- Estado: ${rat.estado}
- Riesgo: ${rat.nivel_riesgo}

FINALIDAD:
${rat.finalidad}

FECHA GENERACIÓN: ${new Date().toLocaleString('es-CL')}
      `;
      
      // Crear archivo y descargar
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RAT_${rat.nombre_actividad}_${rat.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // //console.log('✅ RAT exportado exitosamente');
    } catch (error) {
      console.error('❌ Error exportando PDF:', error);
    }
  };

  // 📊 FUNCIÓN DE EXPORTACIÓN EXCEL MASIVA
  const exportAllRATsToExcel = async () => {
    try {
      setExporting(true);
      // //console.log('📊 Exportando todos los RATs a Excel');
      
      const headers = [
        'ID RAT',
        'Nombre Actividad',
        'Área Responsable',
        'Estado',
        'Nivel Riesgo',
        'Finalidad',
        'Fecha Creación',
        'Centro Costos'
      ];
      
      const data = rats.map(rat => [
        rat.id,
        rat.nombre_actividad,
        rat.area_responsable,
        rat.estado,
        rat.nivel_riesgo,
        rat.finalidad,
        new Date(rat.fecha_actualizacion).toLocaleDateString('es-CL'),
        rat.area_responsable // Como centro de costos
      ]);
      
      // Crear contenido Excel real (TSV para mejor compatibilidad)
      const tsvContent = [
        headers.join('\t'),
        ...data.map(row => row.map(cell => `${cell || ''}`).join('\t'))
      ].join('\n');
      
      // BOM para UTF-8 y descargar como Excel
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + tsvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RATs_Export_${new Date().toISOString().slice(0,10)}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // //console.log('✅ Excel exportado exitosamente');
    } catch (error) {
      console.error('❌ Error exportando Excel:', error);
    } finally {
      setExporting(false);
    }
  };

  // 📄 FUNCIÓN PDF CONSOLIDADO MEJORADA
  const generateConsolidatedPDF = async () => {
    try {
      setExporting(true);
      // //console.log('📄 Generando PDF consolidado para', rats.length, 'RATs');
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Reporte RATs Consolidado - ${currentTenant?.company_name || 'Jurídica Digital'}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
              .header { text-align: center; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
              .header h1 { color: #4f46e5; margin: 0; font-size: 24px; }
              .header p { margin: 5px 0; color: #666; }
              .stats { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .stats-grid { display: flex; justify-content: space-around; }
              .stat-item { text-align: center; }
              .stat-number { font-size: 24px; font-weight: bold; color: #4f46e5; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #4f46e5; color: white; font-weight: bold; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              .status-chip { padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; }
              .status-certificado { background: #dcfce7; color: #166534; }
              .status-pendiente { background: #fef3c7; color: #92400e; }
              .status-borrador { background: #fee2e2; color: #991b1b; }
              .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>📋 Reporte Consolidado RATs</h1>
              <p><strong>Empresa:</strong> ${currentTenant?.company_name || 'Jurídica Digital SpA'}</p>
              <p><strong>RUT:</strong> ${currentTenant?.rut || '77.123.456-7'}</p>
              <p><strong>Fecha Generación:</strong> ${new Date().toLocaleDateString('es-CL')}</p>
              <p><strong>Hora:</strong> ${new Date().toLocaleTimeString('es-CL')}</p>
            </div>

            <div class="stats">
              <h3>📊 Resumen Ejecutivo</h3>
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-number">${rats.length}</div>
                  <div>Total RATs</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">${stats.certificados}</div>
                  <div>Certificados</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">${stats.pendientes}</div>
                  <div>Pendientes</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">${stats.borradores}</div>
                  <div>Borradores</div>
                </div>
              </div>
            </div>

            <h3>📋 Detalle de Registros de Actividades de Tratamiento</h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Actividad</th>
                  <th>Área Responsable</th>
                  <th>Estado</th>
                  <th>Nivel Riesgo</th>
                  <th>Finalidad</th>
                  <th>Fecha Actualización</th>
                </tr>
              </thead>
              <tbody>
                ${rats.map(rat => `
                  <tr>
                    <td>${rat.id}</td>
                    <td>${rat.nombre_actividad || 'N/A'}</td>
                    <td>${rat.area_responsable || 'N/A'}</td>
                    <td>
                      <span class="status-chip status-${rat.estado?.toLowerCase() || 'borrador'}">
                        ${rat.estado || 'BORRADOR'}
                      </span>
                    </td>
                    <td>${rat.nivel_riesgo || 'MEDIO'}</td>
                    <td>${rat.finalidad?.substring(0, 50) || 'N/A'}${rat.finalidad?.length > 50 ? '...' : ''}</td>
                    <td>${rat.fecha_actualizacion ? new Date(rat.fecha_actualizacion).toLocaleDateString('es-CL') : 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="footer">
              <p>📋 <strong>Cumplimiento Ley 21.719</strong> - Generado automáticamente por Sistema LPDP</p>
              <p>Este reporte contiene información confidencial - Uso exclusivo interno</p>
            </div>
          </body>
        </html>
      `;
      
      // Crear y descargar archivo HTML/PDF
      // 🔧 GENERAR PDF REAL usando Print to PDF
      const printWindow = window.open('', '_blank');
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Esperar a que cargue y luego ejecutar print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
      
      // También generar backup como HTML
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RATs_Consolidado_${new Date().toISOString().slice(0,10)}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // //console.log('✅ PDF consolidado generado exitosamente');
      alert(`✅ Reporte PDF generado!\n\n📊 Total RATs: ${rats.length}\n🖨️ Se abrirá ventana de impresión para generar PDF\n📄 También se descarga como HTML de respaldo`);
      
    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      alert('Error generando reporte PDF');
    } finally {
      setExporting(false);
    }
  };

  // 🌐 FUNCIÓN INTEGRACIÓN API PARTNERS
  const sendToPartnerAPI = async (ratId, partnerType = 'prelafit') => {
    try {
      // //console.log('🌐 Enviando RAT a Partner API:', partnerType);
      
      const rat = rats.find(r => r.id === ratId);
      if (!rat) throw new Error('RAT no encontrado');
      
      const partnerPayload = {
        rat_id: rat.id,
        fecha_creacion: rat.fecha_actualizacion,
        responsable: {
          area: rat.area_responsable,
          email: rat.responsable_proceso || 'admin@juridicadigital.cl'
        },
        finalidad: rat.finalidad,
        nivel_riesgo: rat.nivel_riesgo,
        estado: rat.estado,
        compliance_status: {
          requiere_eipd: rat.nivel_riesgo === 'ALTO',
          requiere_dpia: false,
          requiere_consulta_previa: rat.nivel_riesgo === 'ALTO'
        },
        metadata: {
          partner: partnerType,
          timestamp: new Date().toISOString(),
          api_version: 'v1'
        }
      };
      
      // Simular envío API (en producción sería POST real)
      // //console.log('📡 Payload enviado a partner:', partnerPayload);
      
      // Registrar integración
      await supabase
        .from('partner_integrations')
        .insert({
          rat_id: ratId,
          partner_type: partnerType,
          payload: partnerPayload,
          status: 'enviado',
          created_at: new Date().toISOString()
        });
      
      alert(`✅ RAT enviado a ${partnerType} exitosamente`);
    } catch (error) {
      console.error('❌ Error enviando a Partner API:', error);
      alert('Error enviando a Partner API');
    }
  };

  // 📈 CARGAR DATOS CENTRO COSTOS Y APIs
  const loadCostCenterAndAPIData = async () => {
    try {
      // Agrupar por centro de costos (área responsable)
      const costCenters = rats.reduce((acc, rat) => {
        const center = rat.area_responsable || 'Sin asignar';
        acc[center] = (acc[center] || 0) + 1;
        return acc;
      }, {});
      
      setCostCenterData(costCenters);
      
      // Simular datos API permanentes/no permanentes
      const { data: integrations } = await supabase
        .from('partner_integrations')
        .select('*')
        .eq('tenant_id', currentTenant?.id);
      
      const permanentes = (integrations || []).filter(i => 
        ['prelafit', 'rsm_chile'].includes(i.partner_type)
      ).length;
      
      const no_permanentes = (integrations || []).filter(i => 
        ['datacompliance', 'amsoft'].includes(i.partner_type)
      ).length;
      
      setApiStats({
        permanentes,
        no_permanentes,
        total_integraciones: (integrations || []).length
      });
      
    } catch (error) {
      console.error('Error cargando datos adicionales:', error);
    }
  };

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
            <RATIcon sx={{ fontSize: 40, color: '#4f46e5' }} />
            Gestión de RATs
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#9ca3af' }}>
            Registro de Actividades de Tratamiento - Art. 16 Ley 21.719
          </Typography>
        </Box>

        {/* Estadísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ color: '#4f46e5', fontWeight: 700 }}>
                  {stats.total}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Total RATs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ color: '#10b981', fontWeight: 700 }}>
                  {stats.certificados}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Certificados
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ color: '#f59e0b', fontWeight: 700 }}>
                  {stats.pendientes}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Pendientes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ color: '#6b7280', fontWeight: 700 }}>
                  {stats.borradores}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Borradores
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 📊 ESTADÍSTICAS CENTRO DE COSTOS Y APIs */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#f9fafb', mb: 2, display: 'flex', alignItems: 'center' }}>
                  <CostCenterIcon sx={{ mr: 1 }} />
                  Centro de Costos
                </Typography>
                {Object.entries(costCenterData).map(([center, count]) => (
                  <Box key={center} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#9ca3af' }}>{center}</Typography>
                    <Typography variant="body2" sx={{ color: '#4f46e5', fontWeight: 600 }}>{count}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#f9fafb', mb: 2, display: 'flex', alignItems: 'center' }}>
                  <APIIcon sx={{ mr: 1 }} />
                  Integración APIs Partners
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#9ca3af' }}>APIs Permanentes</Typography>
                  <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600 }}>{apiStats.permanentes}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#9ca3af' }}>APIs No Permanentes</Typography>
                  <Typography variant="body2" sx={{ color: '#f59e0b', fontWeight: 600 }}>{apiStats.no_permanentes}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#9ca3af' }}>Total Integraciones</Typography>
                  <Typography variant="body2" sx={{ color: '#4f46e5', fontWeight: 600 }}>{apiStats.total_integraciones}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Controles y Filtros */}
        <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151', p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Buscar RATs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#9ca3af' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#374151',
                    color: '#f9fafb',
                    '& fieldset': { borderColor: '#4b5563' },
                    '&:hover fieldset': { borderColor: '#6b7280' },
                    '&.Mui-focused fieldset': { borderColor: '#4f46e5' },
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#9ca3af' }}>Estado</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{
                    bgcolor: '#374151',
                    color: '#f9fafb',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#4b5563' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6b7280' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4f46e5' },
                  }}
                >
                  <MenuItem value="TODOS">Todos los Estados</MenuItem>
                  <MenuItem value="CERTIFICADO">Certificados</MenuItem>
                  <MenuItem value="PENDIENTE_APROBACION">Pendientes</MenuItem>
                  <MenuItem value="BORRADOR">Borradores</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#9ca3af' }}>Industria</InputLabel>
                <Select
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  sx={{
                    bgcolor: '#374151',
                    color: '#f9fafb',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#4b5563' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6b7280' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4f46e5' },
                  }}
                >
                  <MenuItem value="TODOS">Todas las Industrias</MenuItem>
                  {/* Industrias dinámicas desde base de datos */}
                  {Array.from(new Set(rats.map(r => r.industria).filter(Boolean))).map(industria => (
                    <MenuItem key={industria} value={industria}>
                      {industria.charAt(0).toUpperCase() + industria.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/rat-system')}
                sx={{
                  bgcolor: '#4f46e5',
                  '&:hover': { bgcolor: '#4338ca' },
                  py: 1.5,
                  mb: 1
                }}
              >
                Nuevo RAT
              </Button>
              
              {/* 📊 BOTONES EXPORTACIÓN MEJORADOS */}
              <Typography variant="subtitle2" sx={{ color: '#f9fafb', mb: 1, fontWeight: 'bold' }}>
                📤 Exportar Datos:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<ExcelIcon />}
                    onClick={exportAllRATsToExcel}
                    disabled={exporting || rats.length === 0}
                    sx={{
                      bgcolor: '#10b981',
                      '&:hover': { bgcolor: '#059669' },
                      py: 1.5,
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {exporting ? '⏳ Exportando...' : '📊 Exportar Excel'}
                  </Button>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<PDFIcon />}
                    onClick={generateConsolidatedPDF}
                    disabled={rats.length === 0}
                    sx={{
                      bgcolor: '#ef4444',
                      '&:hover': { bgcolor: '#dc2626' },
                      py: 1.5,
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}
                  >
                    📄 Generar PDF
                  </Button>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<ShareIcon />}
                    onClick={() => sendToPartnerAPI(rats[0]?.id, 'prelafit')}
                    disabled={rats.length === 0}
                    sx={{
                      bgcolor: '#f59e0b',
                      '&:hover': { bgcolor: '#d97706' },
                      py: 1.5,
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}
                  >
                    🔗 Enviar API
                  </Button>
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mt: 2, bgcolor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                <Typography variant="caption" sx={{ color: '#f9fafb' }}>
                  <strong>Total RATs disponibles:</strong> {rats.length} | 
                  <strong> Certificados:</strong> {stats.certificados} | 
                  <strong> Pendientes:</strong> {stats.pendientes}
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabla de RATs */}
        <Paper sx={{ bgcolor: '#1f2937', border: '1px solid #374151' }}>
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography sx={{ color: '#9ca3af' }}>Cargando RATs...</Typography>
            </Box>
          ) : ratsFilteredData.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography sx={{ color: '#9ca3af', mb: 2 }}>
                No se encontraron RATs
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/rat-system')}
                sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' } }}
              >
                Crear Primer RAT
              </Button>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>
                        Nombre Actividad
                      </TableCell>
                      <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>
                        Finalidad
                      </TableCell>
                      <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>
                        Estado
                      </TableCell>
                      <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>
                        Riesgo
                      </TableCell>
                      <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>
                        Última Actualización
                      </TableCell>
                      <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>
                        Acciones
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedRats.map((rat) => (
                      <TableRow 
                        key={rat.id}
                        sx={{ 
                          '&:hover': { bgcolor: '#374151' }
                        }}
                      >
                        <TableCell sx={{ color: '#f9fafb', borderColor: '#374151' }}>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {rat.nombre_actividad}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                              ID: {rat.id}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#f9fafb', borderColor: '#374151' }}>
                          <Typography variant="body2" sx={{ 
                            maxWidth: 300,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {rat.finalidad}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderColor: '#374151' }}>
                          {getStatusChip(rat.estado || 'BORRADOR')}
                        </TableCell>
                        <TableCell sx={{ borderColor: '#374151' }}>
                          {getRiskChip(rat.nivel_riesgo || 'BAJO')}
                        </TableCell>
                        <TableCell sx={{ color: '#9ca3af', borderColor: '#374151' }}>
                          {rat.fecha_actualizacion ? 
                            new Date(rat.fecha_actualizacion).toLocaleDateString() : 
                            'No disponible'
                          }
                        </TableCell>
                        <TableCell sx={{ borderColor: '#374151' }}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Ver detalles">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewRAT(rat.id);
                                }}
                                sx={{ color: '#60a5fa' }}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Editar RAT">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditRAT(rat.id);
                                }}
                                sx={{ color: '#fbbf24' }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Exportar PDF">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExportRAT(rat.id, 'pdf');
                                }}
                                sx={{ color: '#34d399' }}
                              >
                                <PDFIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Enviar a Partner API">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  sendToPartnerAPI(rat.id, 'prelafit');
                                }}
                                sx={{ color: '#f59e0b' }}
                              >
                                <APIIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                component="div"
                count={ratsFilteredData.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                sx={{
                  color: '#9ca3af',
                  borderTop: '1px solid #374151',
                  '& .MuiTablePagination-actions button': {
                    color: '#9ca3af'
                  }
                }}
              />
            </>
          )}
        </Paper>

        {/* Información adicional */}
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
              📋 <strong>Art. 16 Ley 21.719:</strong> Todas las organizaciones que empleen 50 o más trabajadores, 
              traten datos sensibles o realicen transferencias internacionales deben mantener un RAT actualizado.
            </Typography>
          </Alert>
        </Box>
      </Container>
    </Box>
  );
};

export default RATListPage;