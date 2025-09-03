/**
 * 📚 COMPONENTE FUNDAMENTOS TÉCNICOS Y LEGALES
 * Muestra fuentes, metodología y respaldo técnico del sistema
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  Gavel as LegalIcon,
  Science as TechnicalIcon,
  School as AcademicIcon,
  Business as IndustryIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  CheckCircle as ValidatedIcon,
  Public as InternationalIcon
} from '@mui/icons-material';
import { 
  fuentesNormativas, 
  clasificacionIndustrial, 
  metodologiaClasificacion,
  obtenerInformacionSectorial,
  generarReporteFundamentos 
} from '../services/industryStandardsService';
import PageLayout from './PageLayout';

const FundamentosTecnicos = () => {
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [reportDialog, setReportDialog] = useState(false);

  const handleDownloadReport = () => {
    const reporte = generarReporteFundamentos();
    const dataStr = JSON.stringify(reporte, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `Fundamentos_Tecnicos_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <PageLayout 
      title="📚 Fundamentos Técnicos y Legales"
      subtitle="Respaldo normativo y metodológico del sistema de compliance"
    >
      {/* Header con información del estudio */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body1" fontWeight="bold">
          🏛️ Sistema desarrollado por Jurídica Digital SpA
        </Typography>
        <Typography variant="body2">
          Estudio jurídico especializado en Derecho Digital y Protección de Datos Personales. 
          Todos los estándares, clasificaciones y metodologías están respaldados por análisis jurídico técnico 
          y normativa vigente nacional e internacional.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Fuentes Normativas Principales */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LegalIcon /> Fuentes Normativas Principales
            </Typography>
            
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandIcon />}>
                <Typography variant="h6">Marco Legal Nacional</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {fuentesNormativas.primarias.map((fuente, index) => (
                    <Grid item xs={12} md={4} key={index}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight="bold" color="primary">
                            {fuente.titulo}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {fuente.organismo} • {fuente.fecha}
                          </Typography>
                          <Typography variant="body2">
                            {fuente.relevancia}
                          </Typography>
                          <Chip 
                            label={fuente.aplicabilidad} 
                            size="small" 
                            sx={{ mt: 1 }}
                            color="success"
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandIcon />}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InternationalIcon /> Referencias Internacionales
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {fuentesNormativas.internacionales.map((fuente, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <ValidatedIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary={fuente.titulo}
                        secondary={`${fuente.organismo} - ${fuente.relevancia}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          </Paper>
        </Grid>

        {/* Metodología de Clasificación */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TechnicalIcon /> Metodología Técnica
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Criterios técnicos para clasificación de riesgo sectorial:
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Factor</TableCell>
                    <TableCell align="center">Peso %</TableCell>
                    <TableCell>Fundamento Legal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {metodologiaClasificacion.criterios_principales.map((criterio, index) => (
                    <TableRow key={index}>
                      <TableCell>{criterio.factor}</TableCell>
                      <TableCell align="center">
                        <Chip label={`${criterio.peso}%`} size="small" color="primary" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {criterio.fundamento}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Matriz de Riesgo */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon /> Matriz de Riesgo Sectorial
            </Typography>
            
            {Object.entries(metodologiaClasificacion.matriz_riesgo).map(([nivel, info]) => (
              <Card key={nivel} sx={{ mb: 2, border: 1, borderColor: 
                nivel === 'EXTREMO' ? '#dc2626' :
                nivel === 'ALTO' ? '#ea580c' :
                nivel === 'MEDIO_ALTO' ? '#d97706' :
                nivel === 'MEDIO' ? '#059669' : '#6b7280'
              }}>
                <CardContent sx={{ py: 1.5 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {nivel.replace('_', '-')}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {info.descripcion}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Ejemplos: {info.ejemplos_sectores.join(', ')}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>

        {/* Clasificación por Industrias */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IndustryIcon /> Clasificación Sectorial Detallada
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Basada en CIIU Rev. 4 Chile + análisis de riesgo específico por sector:
            </Typography>

            <Grid container spacing={2}>
              {Object.entries(clasificacionIndustrial).map(([sector, info]) => (
                <Grid item xs={12} md={6} lg={4} key={sector}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 3 }
                    }}
                    onClick={() => setSelectedIndustry(sector)}
                  >
                    <CardContent>
                      <Typography variant="h6" color="primary" gutterBottom>
                        {sector.toUpperCase()}
                      </Typography>
                      
                      <Typography variant="body2" gutterBottom>
                        {info.denominacion_oficial}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          label={info.nivel_riesgo_inherente} 
                          size="small" 
                          color={
                            info.nivel_riesgo_inherente === 'EXTREMO' ? 'error' :
                            info.nivel_riesgo_inherente === 'ALTO' ? 'warning' :
                            info.nivel_riesgo_inherente === 'MEDIO_ALTO' ? 'warning' : 'success'
                          }
                        />
                        {info.ciiu_codes.map(code => (
                          <Chip key={code} label={code} size="small" variant="outlined" />
                        ))}
                      </Box>
                      
                      <Typography variant="caption" color="text.secondary">
                        Regulador: {info.regulador_sectorial}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Botones de Acción */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadReport}
            >
              Descargar Reporte Completo
            </Button>
            <Button
              variant="outlined"
              startIcon={<AcademicIcon />}
              onClick={() => setReportDialog(true)}
            >
              Ver Fuentes Académicas
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Dialog Detalle Industria */}
      {selectedIndustry && (
        <Dialog 
          open={!!selectedIndustry} 
          onClose={() => setSelectedIndustry(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Fundamentos Técnicos - {selectedIndustry.toUpperCase()}
          </DialogTitle>
          <DialogContent>
            {(() => {
              const info = obtenerInformacionSectorial(selectedIndustry, true);
              return (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Información Oficial
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Denominación:</strong> {info.informacion_basica.denominacion_oficial}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Fuente:</strong> {info.informacion_basica.fuente_clasificacion}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Regulador:</strong> {info.informacion_basica.regulador}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Códigos CIIU:</strong> {info.fundamentos_tecnicos.codigos_ciiu.join(', ')}
                  </Typography>
                  
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                    Fundamento Técnico del Riesgo
                  </Typography>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    {info.fundamentos_tecnicos.base_legal}
                  </Alert>

                  {info.fundamentos_tecnicos.medidas_reforzadas.length > 0 && (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Medidas Específicas Requeridas
                      </Typography>
                      <List dense>
                        {info.fundamentos_tecnicos.medidas_reforzadas.map((medida, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <ValidatedIcon color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={medida} />
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                </Box>
              );
            })()}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedIndustry(null)}>Cerrar</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Dialog Fuentes Académicas */}
      <Dialog 
        open={reportDialog} 
        onClose={() => setReportDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Fuentes Técnicas Adicionales</DialogTitle>
        <DialogContent>
          <List>
            {metodologiaClasificacion.fuentes_tecnicas.map((fuente, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <AcademicIcon />
                </ListItemIcon>
                <ListItemText primary={fuente} />
              </ListItem>
            ))}
          </List>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Contacto técnico:</strong> admin@juridicadigital.cl<br />
              <strong>Elaborado por:</strong> Jurídica Digital SpA - Estudio especializado en Derecho Digital
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default FundamentosTecnicos;