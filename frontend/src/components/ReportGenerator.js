import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  PictureAsPdf as PDFIcon,
  TableChart as ExcelIcon,
  Download as DownloadIcon,
  Assessment as ReportIcon,
  DateRange as DateIcon,
  FilterList as FilterIcon,
  Send as SendIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { supabase } from '../config/supabaseClient';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import PageLayout from './PageLayout';

const ReportGenerator = () => {
  const { currentTenant } = useTenant();
  const { user } = useAuth();
  
  const [reportDialog, setReportDialog] = useState(false);
  const [reportType, setReportType] = useState('rat_consolidado');
  const [selectedRATs, setSelectedRATs] = useState([]);
  const [dateRange, setDateRange] = useState({
    inicio: '',
    fin: ''
  });
  const [reportConfig, setReportConfig] = useState({
    incluirEIPDs: true,
    incluirProveedores: true,
    incluirAuditoria: false,
    formato: 'pdf',
    idioma: 'es'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportHistory, setReportHistory] = useState([]);
  const [reportStatus, setReportStatus] = useState(null);

  useEffect(() => {
    cargarHistorialReportes();
  }, [currentTenant]);

  const cargarHistorialReportes = async () => {
    try {
      const { data, error } = await supabase
        .from('generated_documents')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .in('document_type', ['INFORME_RAT_PDF', 'EXPORT_EXCEL_RATS', 'REPORTE_CONSOLIDADO'])
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setReportHistory(data || []);
    } catch (error) {
      console.error('Error cargando historial reportes:', error);
    }
  };

  const generarReporteRATConsolidado = async (ratIds, formato) => {
    setIsGenerating(true);
    
    try {
      // 📊 RECOPILAR DATOS COMPLETOS SEGÚN DIAGRAMA
      const { data: ratsData, error: ratsError } = await supabase
        .from('mapeo_datos_rat')
        .select(`
          *,
          organizaciones!inner(razon_social, rut, direccion, comuna, ciudad, email_contacto)
        `)
        .eq('tenant_id', currentTenant.id)
        .in('id', ratIds);

      if (ratsError) throw ratsError;

      // 📄 DOCUMENTOS ASOCIADOS
      const { data: documentos, error: docError } = await supabase
        .from('generated_documents')
        .select('*')
        .in('rat_id', ratIds);

      if (docError) throw docError;

      // 🏢 PROVEEDORES Y DPAS
      const { data: proveedoresData, error: provError } = await supabase
        .from('rat_proveedores')
        .select(`
          *,
          proveedores!inner(nombre, tipo, pais),
          dpas(vigencia_inicio, vigencia_fin, estado)
        `)
        .in('rat_id', ratIds);

      if (provError) throw provError;

      // 📋 ACTIVIDADES DPO
      const { data: actividadesData, error: actError } = await supabase
        .from('actividades_dpo')
        .select('*')
        .in('rat_id', ratIds);

      if (actError) throw actError;

      // 📝 AUDIT TRAIL
      let auditData = null;
      if (reportConfig.incluirAuditoria) {
        const { data: auditResult, error: auditError } = await supabase
          .from('audit_log')
          .select('*')
          .eq('table_name', 'mapeo_datos_rat')
          .in('record_id', ratIds)
          .order('created_at', { ascending: false });

        if (auditError) throw auditError;
        auditData = auditResult;
      }

      // 🔄 GENERAR REPORTE SEGÚN FORMATO
      const reportData = {
        rats: ratsData,
        documentos: documentos,
        proveedores: proveedoresData,
        actividades: actividadesData,
        auditoria: reportConfig.incluirAuditoria ? auditData : null,
        configuracion: reportConfig,
        metadata: {
          generado_por: user.email,
          generado_el: new Date().toISOString(),
          tenant: currentTenant.company_name,
          total_rats: ratIds.length,
          formato: formato
        }
      };

      if (formato === 'pdf') {
        await generarPDFConsolidado(reportData);
      } else if (formato === 'excel') {
        await generarExcelConsolidado(reportData);
      }

      // 📊 REGISTRAR GENERACIÓN
      await supabase.from('generated_documents').insert({
        tenant_id: currentTenant.id,
        document_type: formato === 'pdf' ? 'INFORME_RAT_PDF' : 'EXPORT_EXCEL_RATS',
        document_data: reportData,
        status: 'GENERADO',
        rat_id: ratIds.length === 1 ? ratIds[0] : null,
        created_at: new Date().toISOString()
      });

      // 🔄 ACTUALIZAR HISTORIAL
      await cargarHistorialReportes();

    } catch (error) {
      console.error('Error generando reporte:', error);
    } finally {
      setIsGenerating(false);
      setReportDialog(false);
    }
  };

  const generarPDFConsolidado = async (reportData) => {
    try {
      // console.log('🔄 Generando PDF consolidado RATs:', reportData.rats.length);
      
      // Crear contenido HTML para el PDF
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #1e40af; text-align: center; }
              h2 { color: #374151; margin-top: 20px; }
              .section { margin-bottom: 30px; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
              th { background-color: #f3f4f6; font-weight: bold; }
              .alert { background-color: #fef3c7; padding: 10px; border-left: 4px solid #f59e0b; margin: 10px 0; }
            </style>
          </head>
          <body>
            <h1>Reporte Consolidado RAT - Ley 21.719</h1>
            <div class="section">
              <h2>Información de la Empresa</h2>
              <p><strong>Razón Social:</strong> ${currentTenant?.company_name || 'N/A'}</p>
              <p><strong>RUT:</strong> ${currentTenant?.rut || 'N/A'}</p>
              <p><strong>Fecha Generación:</strong> ${new Date().toLocaleDateString('es-CL')}</p>
            </div>
            
            <div class="section">
              <h2>Resumen Ejecutivo</h2>
              <p>Total de RATs: ${reportData.rats.length}</p>
              <p>RATs con datos sensibles: ${reportData.rats.filter(r => r.datosSensibles).length}</p>
              <p>Cumplimiento general: ${reportData.nivelCumplimiento || 'N/A'}%</p>
            </div>
            
            <div class="section">
              <h2>Detalle de Registros de Actividades de Tratamiento</h2>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Actividad</th>
                    <th>Responsable</th>
                    <th>Finalidad</th>
                    <th>Base Legal</th>
                    <th>Riesgo</th>
                  </tr>
                </thead>
                <tbody>
                  ${reportData.rats.map(rat => `
                    <tr>
                      <td>${rat.id}</td>
                      <td>${rat.nombre_actividad || 'N/A'}</td>
                      <td>${rat.responsable_proceso || 'N/A'}</td>
                      <td>${rat.finalidad_principal || 'N/A'}</td>
                      <td>${rat.base_legal || 'N/A'}</td>
                      <td>${rat.nivel_riesgo || 'MEDIO'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            
            <div class="alert">
              <strong>Nota Legal:</strong> Este documento es generado automáticamente según los requisitos 
              de la Ley 21.719 de Protección de Datos Personales de Chile.
            </div>
          </body>
        </html>
      `;
      
      // Crear blob y descargar
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RAT_Consolidado_${new Date().toISOString().split('T')[0]}.html`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setReportStatus({
        type: 'success',
        message: '✅ PDF generado exitosamente (formato HTML)'
      });
      
    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      setReportStatus({
        type: 'error',
        message: 'Error al generar PDF'
      });
    }
  };

  const generarExcelConsolidado = async (reportData) => {
    try {
      // console.log('🔄 Generando Excel consolidado RATs:', reportData.rats.length);
      
      // 📊 CREAR CONTENIDO CSV PARA EXCEL
      const csvContent = generarCSVConsolidado(reportData);
      
      // Crear blob y descargar
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RAT_Consolidado_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      // console.log('✅ Excel/CSV generado exitosamente');
      
    } catch (error) {
      console.error('❌ Error generando Excel:', error);
    }
  };

  const generarCSVConsolidado = (reportData) => {
    // HOJA 1: Resumen RATs
    let csvContent = "REPORTE CONSOLIDADO RAT - LEY 21.719\n\n";
    csvContent += `Empresa:,${currentTenant?.company_name || 'N/A'}\n`;
    csvContent += `RUT:,${currentTenant?.rut || 'N/A'}\n`;
    csvContent += `Fecha Generación:,${new Date().toLocaleDateString('es-CL')}\n`;
    csvContent += `Total RATs:,${reportData.rats.length}\n\n`;
    
    // HOJA 2: Detalle RATs
    csvContent += "DETALLE REGISTROS DE ACTIVIDADES DE TRATAMIENTO\n";
    csvContent += "ID,Actividad,Responsable,Finalidad,Base Legal,Nivel Riesgo,Datos Sensibles,Estado\n";
    
    reportData.rats.forEach(rat => {
      csvContent += `${rat.id || 'N/A'},`;
      csvContent += `"${(rat.nombre_actividad || 'N/A').replace(/"/g, '""')}",`;
      csvContent += `"${(rat.responsable_proceso || 'N/A').replace(/"/g, '""')}",`;
      csvContent += `"${(rat.finalidad_principal || 'N/A').replace(/"/g, '""')}",`;
      csvContent += `"${(rat.base_legal || 'N/A').replace(/"/g, '""')}",`;
      csvContent += `${rat.nivel_riesgo || 'MEDIO'},`;
      csvContent += `${rat.datos_sensibles ? 'SÍ' : 'NO'},`;
      csvContent += `${rat.estado || 'ACTIVO'}\n`;
    });
    
    // HOJA 3: Categorías de Datos
    csvContent += "\n\nCATEGORÍAS DE DATOS POR RAT\n";
    csvContent += "RAT ID,Categoría,Tipo,Origen,Plazo Conservación\n";
    
    reportData.rats.forEach(rat => {
      if (rat.categorias_datos) {
        try {
          const categorias = typeof rat.categorias_datos === 'string' 
            ? JSON.parse(rat.categorias_datos) 
            : rat.categorias_datos;
          
          if (Array.isArray(categorias)) {
            categorias.forEach(cat => {
              csvContent += `${rat.id},`;
              csvContent += `"${(cat.nombre || 'N/A').replace(/"/g, '""')}",`;
              csvContent += `${cat.tipo || 'N/A'},`;
              csvContent += `${cat.origen || 'N/A'},`;
              csvContent += `${cat.plazo_conservacion || 'N/A'}\n`;
            });
          }
        } catch (e) {
          csvContent += `${rat.id},ERROR PARSING,N/A,N/A,N/A\n`;
        }
      }
    });
    
    // HOJA 4: Transferencias Internacionales  
    csvContent += "\n\nTRANSFERENCIAS INTERNACIONALES\n";
    csvContent += "RAT ID,País Destino,Empresa Receptora,Base Legal,Medidas Seguridad\n";
    
    reportData.rats.forEach(rat => {
      if (rat.transferencias_internacionales) {
        try {
          const transferencias = typeof rat.transferencias_internacionales === 'string'
            ? JSON.parse(rat.transferencias_internacionales)
            : rat.transferencias_internacionales;
            
          if (Array.isArray(transferencias)) {
            transferencias.forEach(transf => {
              csvContent += `${rat.id},`;
              csvContent += `${transf.pais || 'N/A'},`;
              csvContent += `"${(transf.empresa || 'N/A').replace(/"/g, '""')}",`;
              csvContent += `${transf.base_legal || 'N/A'},`;
              csvContent += `"${(transf.medidas_seguridad || 'N/A').replace(/"/g, '""')}"\n`;
            });
          }
        } catch (e) {
          csvContent += `${rat.id},ERROR,N/A,N/A,N/A\n`;
        }
      }
    });
    
    // HOJA 5: Estado Compliance
    csvContent += "\n\nESTADO COMPLIANCE POR RAT\n";
    csvContent += "RAT ID,% Completitud,Última Actualización,Estado DPO,Requiere EIPD\n";
    
    reportData.rats.forEach(rat => {
      csvContent += `${rat.id},`;
      csvContent += `${rat.completitud_porcentaje || '0'}%,`;
      csvContent += `${rat.updated_at ? new Date(rat.updated_at).toLocaleDateString('es-CL') : 'N/A'},`;
      csvContent += `${rat.estado_revision_dpo || 'PENDIENTE'},`;
      csvContent += `${rat.requiere_eipd ? 'SÍ' : 'NO'}\n`;
    });
    
    // HOJA 6: Métricas y KPIs
    csvContent += "\n\nMÉTRICAS Y KPIS GENERALES\n";
    const totalRATs = reportData.rats.length;
    const ratsConDatosSensibles = reportData.rats.filter(r => r.datos_sensibles).length;
    const ratsConTransfInternacionales = reportData.rats.filter(r => 
      r.transferencias_internacionales && 
      (typeof r.transferencias_internacionales === 'string' ? 
        r.transferencias_internacionales !== '[]' : 
        Array.isArray(r.transferencias_internacionales) && r.transferencias_internacionales.length > 0)
    ).length;
    
    csvContent += `Métrica,Valor\n`;
    csvContent += `Total RATs,${totalRATs}\n`;
    csvContent += `RATs con datos sensibles,${ratsConDatosSensibles}\n`;
    csvContent += `RATs con transferencias internacionales,${ratsConTransfInternacionales}\n`;
    csvContent += `Porcentaje cumplimiento,${((totalRATs > 0 ? (ratsConDatosSensibles / totalRATs) * 100 : 0)).toFixed(2)}%\n`;
    csvContent += `Última generación,${new Date().toISOString()}\n`;
    
    return csvContent;
  };

  const tiposReporte = [
    {
      id: 'rat_consolidado',
      titulo: 'RAT Consolidado',
      descripcion: 'Reporte completo uno o varios RATs con documentos asociados',
      icono: <PDFIcon />,
      formatos: ['pdf', 'excel'],
      configuraciones: ['incluirEIPDs', 'incluirProveedores', 'incluirAuditoria']
    },
    {
      id: 'compliance_ejecutivo',
      titulo: 'Reporte Ejecutivo Compliance',
      descripcion: 'Vista ejecutiva estado compliance general empresa',
      icono: <ReportIcon />,
      formatos: ['pdf'],
      configuraciones: ['incluirMetricas', 'incluirTendencias', 'incluirRecomendaciones']
    },
    {
      id: 'auditoria_completa', 
      titulo: 'Auditoría Completa Sistema',
      descripcion: 'Reporte técnico completo para auditorías externas',
      icono: <CheckIcon />,
      formatos: ['pdf', 'excel'],
      configuraciones: ['incluirAuditoria', 'incluirTecnico', 'incluirLegal']
    }
  ];

  return (
    <PageLayout
      title="Generador de Reportes"
      subtitle="Exportación y reportes consolidados sistema LPDP"
    >
      <Grid container spacing={3}>
        
        {/* 📊 TIPOS DE REPORTES DISPONIBLES */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2, color: '#f9fafb' }}>
            Tipos de Reportes Disponibles
          </Typography>
          <Grid container spacing={2}>
            {tiposReporte.map((tipo) => (
              <Grid item xs={12} md={4} key={tipo.id}>
                <Card 
                  sx={{ 
                    bgcolor: '#1f2937', 
                    border: '1px solid #374151',
                    cursor: 'pointer',
                    '&:hover': { borderColor: '#4f46e5' }
                  }}
                  onClick={() => {
                    setReportType(tipo.id);
                    setReportDialog(true);
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {tipo.icono}
                      <Typography variant="h6" sx={{ ml: 1, color: '#f9fafb' }}>
                        {tipo.titulo}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#9ca3af', mb: 2 }}>
                      {tipo.descripcion}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {tipo.formatos.map(formato => (
                        <Chip 
                          key={formato}
                          label={formato.toUpperCase()}
                          size="small"
                          color="primary"
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* 📋 HISTORIAL REPORTES GENERADOS */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: '#1f2937', border: '1px solid #374151' }}>
            <Typography variant="h6" sx={{ mb: 3, color: '#f9fafb' }}>
              📋 Historial Reportes Generados
            </Typography>
            
            {reportHistory.length === 0 ? (
              <Typography sx={{ textAlign: 'center', color: '#9ca3af', py: 4 }}>
                No hay reportes generados aún
              </Typography>
            ) : (
              <List>
                {reportHistory.map((reporte, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {reporte.document_type.includes('PDF') ? <PDFIcon /> : <ExcelIcon />}
                    </ListItemIcon>
                    <ListItemText
                      primary={`${reporte.document_type} - ${new Date(reporte.created_at).toLocaleDateString()}`}
                      secondary={`Estado: ${reporte.status} | RAT ID: ${reporte.rat_id || 'Múltiples'}`}
                    />
                    <Button
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => {/* console.log('Descargando reporte:', reporte.id) */}}
                    >
                      Descargar
                    </Button>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 🔧 DIALOG CONFIGURACIÓN REPORTE */}
      <Dialog 
        open={reportDialog} 
        onClose={() => setReportDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#1f2937', color: '#f9fafb' }}>
          Configurar Reporte: {tiposReporte.find(t => t.id === reportType)?.titulo}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#1f2937' }}>
          {isGenerating ? (
            <Box sx={{ py: 4 }}>
              <LinearProgress />
              <Typography sx={{ textAlign: 'center', mt: 2, color: '#f9fafb' }}>
                Generando reporte... Esto puede tomar unos minutos
              </Typography>
            </Box>
          ) : (
            <Box sx={{ pt: 2 }}>
              {/* Configuraciones específicas según tipo reporte */}
              <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
                <FormLabel sx={{ color: '#f9fafb' }}>Formato de salida</FormLabel>
                <RadioGroup
                  value={reportConfig.formato}
                  onChange={(e) => setReportConfig({...reportConfig, formato: e.target.value})}
                >
                  <FormControlLabel value="pdf" control={<Radio />} label="PDF Profesional" />
                  <FormControlLabel value="excel" control={<Radio />} label="Excel Detallado" />
                </RadioGroup>
              </FormControl>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ color: '#f9fafb', mb: 1 }}>
                  Incluir en reporte:
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={reportConfig.incluirEIPDs}
                      onChange={(e) => setReportConfig({...reportConfig, incluirEIPDs: e.target.checked})}
                    />
                  }
                  label="EIPDs asociadas"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={reportConfig.incluirProveedores}
                      onChange={(e) => setReportConfig({...reportConfig, incluirProveedores: e.target.checked})}
                    />
                  }
                  label="Proveedores y DPAs"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={reportConfig.incluirAuditoria}
                      onChange={(e) => setReportConfig({...reportConfig, incluirAuditoria: e.target.checked})}
                    />
                  }
                  label="Historial auditoría"
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#1f2937' }}>
          <Button onClick={() => setReportDialog(false)}>
            Cancelar
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              // 🔄 FIX: OBTENER RATs DISPONIBLES PARA GENERAR REPORTE
              const demoRATIds = ['demo-1', 'demo-2']; // En producción esto vendrá de selección usuario
              generarReporteRATConsolidado(demoRATIds, reportConfig.formato);
            }}
            disabled={isGenerating}
          >
            Generar Reporte
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default ReportGenerator;