/**
 * VISTA DE PROCESO COMPLETO
 * Muestra cómo se cierra el proceso cuando todos los documentos están listos
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  LinearProgress,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Lock as LockIcon,
  Assignment as RATIcon,
  Security as EIPDIcon,
  Business as DPAIcon,
  Assessment as DPIAIcon,
  CloudDone as CompleteIcon,
  Archive as ArchiveIcon,
  Verified as VerifiedIcon,
  Campaign as NotificationIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

const ProcesoCompleto = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [procesoCerrado, setProcesoCerrado] = useState(false);

  // Estados de los documentos - TODOS COMPLETOS
  const [documentos, setDocumentos] = useState([
    {
      id: 'RAT-EJEMPLO-COMPLETO',
      tipo: 'RAT',
      nombre: 'Sistema de Scoring Crediticio',
      progreso: 100,
      estado: 'completed',
      fecha_completado: '2024-08-28',
      responsable: 'Área de Riesgos'
    },
    {
      id: 'EIPD-2024-001',
      tipo: 'EIPD',
      nombre: 'Evaluación de Impacto - Datos Sensibles',
      progreso: 100,
      estado: 'completed',
      fecha_completado: '2024-08-29',
      responsable: 'DPO'
    },
    {
      id: 'DPA-2024-001',
      tipo: 'DPA',
      nombre: 'Contrato con Dicom (Equifax Chile)',
      progreso: 100,
      estado: 'completed',
      fecha_completado: '2024-08-30',
      responsable: 'Legal + DPO'
    },
    {
      id: 'DPA-2024-002',
      tipo: 'DPA',
      nombre: 'Contrato con AWS (Estados Unidos)',
      progreso: 100,
      estado: 'completed',
      fecha_completado: '2024-08-30',
      responsable: 'Legal + DPO'
    },
    {
      id: 'DPIA-2024-001',
      tipo: 'DPIA',
      nombre: 'Auditoría de Algoritmos de Scoring',
      progreso: 100,
      estado: 'completed',
      fecha_completado: '2024-08-31',
      responsable: 'DPO + Auditoría'
    }
  ]);

  const pasosCierre = [
    {
      titulo: 'Verificación Automática',
      descripcion: 'Sistema verifica que todos los documentos están completos',
      completado: true
    },
    {
      titulo: 'Validación Cruzada',
      descripcion: 'Se valida consistencia entre RAT y documentos derivados',
      completado: true
    },
    {
      titulo: 'Aprobación Final DPO',
      descripcion: 'DPO da aprobación final al conjunto completo',
      completado: activeStep >= 2
    },
    {
      titulo: 'Archivo y Certificación',
      descripcion: 'Documentos se archivan y sistema genera certificación',
      completado: activeStep >= 3
    },
    {
      titulo: 'Proceso Cerrado',
      descripcion: 'RAT-EJEMPLO-COMPLETO oficialmente cerrado y compliant',
      completado: procesoCerrado
    }
  ];

  const iniciarCierre = () => {
    setActiveStep(0);
    const interval = setInterval(() => {
      setActiveStep(prev => {
        if (prev >= 4) {
          clearInterval(interval);
          setProcesoCerrado(true);
          setShowCompletionDialog(true);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);
  };

  const getIconByType = (tipo) => {
    switch(tipo) {
      case 'RAT': return <RATIcon color="primary" />;
      case 'EIPD': return <EIPDIcon color="success" />;
      case 'DPA': return <DPAIcon color="info" />;
      case 'DPIA': return <DPIAIcon color="warning" />;
      default: return <CheckIcon />;
    }
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Alert severity="success" sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          ✅ TODOS LOS DOCUMENTOS COMPLETADOS
        </Typography>
        <Typography variant="body1">
          El RAT-EJEMPLO-COMPLETO y todos sus documentos derivados están al 100%. El proceso puede cerrarse oficialmente.
        </Typography>
      </Alert>

      <Grid container spacing={4}>
        {/* Panel de Documentos Completos */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                📋 RESUMEN DE DOCUMENTOS - TODOS COMPLETOS
              </Typography>
              
              <List>
                {documentos.map((doc) => (
                  <ListItem key={doc.id} sx={{ 
                    border: '2px solid',
                    borderColor: '#5f6368',
                    borderRadius: 2,
                    mb: 1,
                    bgcolor: 'success.light',
                    color: 'success.contrastText'
                  }}>
                    <ListItemIcon>
                      {getIconByType(doc.tipo)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {doc.tipo}: {doc.nombre}
                          </Typography>
                          <CheckIcon color="success" />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={100}
                            color="success"
                            sx={{ my: 1, height: 6 }}
                          />
                          <Typography variant="caption">
                            ✅ Completado el {doc.fecha_completado} por {doc.responsable}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2" fontWeight={600}>
                  🔗 ENLACES BIDIRECCIONALES VERIFICADOS
                </Typography>
                <Typography variant="caption">
                  Todos los documentos están sincronizados y enlazados correctamente
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel de Cierre de Proceso */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                🏁 CIERRE OFICIAL DEL PROCESO
              </Typography>
              
              <Stepper activeStep={activeStep} orientation="vertical">
                {pasosCierre.map((paso, index) => (
                  <Step key={index} completed={paso.completado}>
                    <StepLabel
                      StepIconComponent={paso.completado ? CheckIcon : undefined}
                    >
                      <Typography fontWeight={600}>
                        {paso.titulo}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary">
                        {paso.descripcion}
                      </Typography>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>

              {!procesoCerrado && (
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={iniciarCierre}
                    startIcon={<CompleteIcon />}
                    sx={{ 
                      bgcolor: '#5f6368',
                      '&:hover': { bgcolor: 'success.dark' },
                      fontSize: '1.1rem',
                      py: 2
                    }}
                  >
                    INICIAR CIERRE OFICIAL DEL PROCESO
                  </Button>
                </Box>
              )}

              {procesoCerrado && (
                <Alert severity="success" sx={{ mt: 3 }}>
                  <Typography variant="h6" fontWeight={700}>
                    PROCESO OFICIALMENTE CERRADO
                  </Typography>
                  <Typography variant="body2">
                    RAT-EJEMPLO-COMPLETO está completo y certificado según Ley 21.719
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Timeline del Proceso Completo */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            LÍNEA DE TIEMPO COMPLETA DEL PROCESO
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            {[
              { fecha: '28/08/2024 09:00', evento: '📝 RAT Creado', desc: 'Área de Riesgos crea RAT Sistema Scoring', estado: 'completed' },
              { fecha: '28/08/2024 09:01', evento: '🤖 Sistema Detecta Triggers', desc: 'IA identifica necesidad de EIPD, DPIA y DPAs', estado: 'completed' },
              { fecha: '28/08/2024 09:02', evento: 'Notificación a DPO', desc: 'DPO recibe alertas de documentos pendientes', estado: 'completed' },
              { fecha: '29/08/2024 14:30', evento: '✅ EIPD Completada', desc: 'DPO completa Evaluación de Impacto', estado: 'completed' },
              { fecha: '30/08/2024 11:15', evento: '✅ DPAs Firmados', desc: 'Contratos con Dicom y AWS finalizados', estado: 'completed' },
              { fecha: '31/08/2024 16:45', evento: '✅ DPIA Aprobada', desc: 'Auditoría de algoritmos completada', estado: 'completed' },
              { fecha: '01/09/2024 10:00', evento: 'Proceso Cerrado', desc: 'RAT-EJEMPLO-COMPLETO oficialmente completo', estado: procesoCerrado ? 'completed' : 'pending' }
            ].map((item, index) => (
              <Box key={index} sx={{ 
                display: 'flex', 
                mb: 2,
                pl: 2,
                borderLeft: '3px solid',
                borderLeftColor: item.estado === 'completed' ? '#5f6368' : 'grey.400',
                opacity: item.estado === 'completed' ? 1 : 0.6
              }}>
                <Box sx={{ minWidth: 150 }}>
                  <Typography variant="caption" color="text.secondary">
                    {item.fecha}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {item.estado === 'completed' ? '✅' : '⏳'} {item.evento}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Dialog de Proceso Completado */}
      <Dialog open={showCompletionDialog} onClose={() => setShowCompletionDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', bgcolor: '#5f6368', color: 'white' }}>
          <Typography variant="h4" fontWeight={900}>
            PROCESO OFICIALMENTE CERRADO
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>
              RAT-EJEMPLO-COMPLETO: Sistema de Scoring Crediticio
            </Typography>
            <Typography variant="body1">
              Proceso completado exitosamente según Ley 21.719 de Protección de Datos Personales
            </Typography>
          </Alert>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Estado Final:</Typography>
              <Chip label="COMPLETO Y CERTIFICADO" color="success" />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Documentos Generados:</Typography>
              <Typography variant="body1" fontWeight={600}>5 documentos</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Tiempo Total:</Typography>
              <Typography variant="body1" fontWeight={600}>4 días</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Responsable Final:</Typography>
              <Typography variant="body1" fontWeight={600}>DPO</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" fontWeight={700} gutterBottom>
            📄 CERTIFICACIÓN AUTOMÁTICA GENERADA:
          </Typography>
          
          <Box sx={{ 
            p: 3, 
            bgcolor: 'grey.100', 
            border: '2px solid',
            borderColor: '#5f6368',
            borderRadius: 2
          }}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              CERTIFICADO DE CUMPLIMIENTO LPDP<br/>
              Ley 21.719 - Chile<br/>
              <br/>
              RAT ID: RAT-EJEMPLO-COMPLETO<br/>
              Tratamiento: Sistema de Scoring Crediticio Automático<br/>
              Responsable: Banco Santander Chile<br/>
              <br/>
              DOCUMENTOS ASOCIADOS:<br/>
              ✅ EIPD-2024-001 (Completada)<br/>
              ✅ DPA-2024-001 Dicom (Firmado)<br/>
              ✅ DPA-2024-002 AWS (Firmado)<br/>
              ✅ DPIA-2024-001 (Aprobada)<br/>
              <br/>
              ESTADO: COMPLIANT ✅<br/>
              FECHA CERTIFICACIÓN: 01/09/2024<br/>
              VÁLIDO HASTA: 01/09/2025<br/>
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            * Este certificado se archiva automáticamente y está disponible para auditorías SERNAC
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCompletionDialog(false)} variant="outlined">
            Cerrar
          </Button>
          <Button variant="contained" color="success">
            Descargar Certificado
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProcesoCompleto;