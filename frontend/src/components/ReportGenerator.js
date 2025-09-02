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
    // 🎯 IMPLEMENTAR GENERACIÓN PDF SEGÚN DIAGRAMA ULTRA-DETALLADO
    console.log('🔄 Generando PDF consolidado RATs:', reportData.rats.length);
    
    // Aquí iría la lógica de generación PDF con todas las secciones del diagrama
    // SECCIÓN 1: Portada con datos empresa
    // SECCIÓN 2: Resumen ejecutivo
    // SECCIÓN 3: Detalle cada RAT
    // SECCIÓN 4: Análisis riesgos
    // SECCIÓN 5: Documentos asociados
    // SECCIÓN 6: Recomendaciones compliance
    // SECCIÓN 7: Anexos técnicos
  };

  const generarExcelConsolidado = async (reportData) => {
    // 📊 IMPLEMENTAR GENERACIÓN EXCEL SEGÚN DIAGRAMA
    console.log('🔄 Generando Excel consolidado RATs:', reportData.rats.length);
    
    // HOJA 1: Resumen RATs
    // HOJA 2: Categorías datos
    // HOJA 3: Transferencias internacionales  
    // HOJA 4: Estado compliance
    // HOJA 5: Timeline actividades
    // HOJA 6: Métricas y KPIs
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
                      onClick={() => console.log('Descargando reporte:', reporte.id)}
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
            onClick={() => generarReporteRATConsolidado(selectedRATs, reportConfig.formato)}
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