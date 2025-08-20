import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  Checkbox,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  Chip,
  Fade,
  Slide
} from '@mui/material';
import { 
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  Share as ShareIcon
} from '@mui/icons-material';

const InterfazTrabajo = ({ duration = 90 }) => {
  const [activeSection, setActiveSection] = useState(0);
  const [formData, setFormData] = useState({
    actividad: 'Contratación de Personal',
    datos: ['rut', 'nombre', 'cv'],
    datosSensibles: ['antecedentes', 'examenes'],
    finalidades: ['evaluar', 'cumplir_ley'],
    accesos: ['rrhh', 'gerencia', 'previred'],
    retencion: '5_anos'
  });

  useEffect(() => {
    const sectionDuration = duration * 1000 / 5;
    
    const timer = setInterval(() => {
      setActiveSection(prev => (prev < 4 ? prev + 1 : prev));
    }, sectionDuration);

    return () => clearInterval(timer);
  }, [duration]);

  const handleCheckboxChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  return (
    <Box sx={{ py: 4 }}>
      {/* Título */}
      <Fade in timeout={1000}>
        <Typography variant="h3" align="center" sx={{ mb: 2, fontWeight: 700 }}>
          💼 TU INVENTARIO EN ACCIÓN
        </Typography>
      </Fade>

      <Fade in timeout={1500}>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Así se ve el formulario real que completas para cada proceso
        </Typography>
      </Fade>

      {/* Formulario simulado */}
      <Card elevation={8} sx={{ maxWidth: 1000, mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header del formulario */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 4, 
            pb: 2, 
            borderBottom: 1, 
            borderColor: 'divider' 
          }}>
            <BusinessIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                ACTIVIDAD: Contratación de Personal
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Área: Recursos Humanos | Responsable: Gerente RRHH
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={4}>
            {/* Sección 1: Datos que recopilas */}
            <Grid item xs={12} md={6}>
              <Slide in={activeSection >= 0} direction="right" timeout={1000}>
                <Paper 
                  elevation={activeSection >= 0 ? 4 : 2}
                  sx={{ 
                    p: 3,
                    bgcolor: activeSection >= 0 ? 'info.light' : 'background.paper',
                    transform: activeSection >= 0 ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.5s ease-in-out'
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    [1] DATOS QUE RECOPILAS
                  </Typography>
                  
                  {[
                    { id: 'rut', label: 'RUT', checked: true },
                    { id: 'nombre', label: 'Nombre completo', checked: true },
                    { id: 'cv', label: 'Curriculum vitae', checked: true },
                    { id: 'referencias', label: 'Referencias laborales', checked: false }
                  ].map((item) => (
                    <FormControlLabel
                      key={item.id}
                      control={
                        <Checkbox 
                          checked={item.checked}
                          onChange={(e) => handleCheckboxChange('datos', item.id)}
                        />
                      }
                      label={item.label}
                      sx={{ display: 'block', mb: 1 }}
                    />
                  ))}

                  <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="warning.contrastText" sx={{ fontWeight: 600, mb: 1 }}>
                      ⚠️ DATOS SENSIBLES:
                    </Typography>
                    {[
                      { id: 'antecedentes', label: 'Antecedentes penales', checked: true },
                      { id: 'examenes', label: 'Exámenes médicos', checked: true }
                    ].map((item) => (
                      <FormControlLabel
                        key={item.id}
                        control={
                          <Checkbox 
                            checked={item.checked}
                            color="warning"
                          />
                        }
                        label={item.label}
                        sx={{ display: 'block', mb: 1 }}
                      />
                    ))}
                  </Box>
                </Paper>
              </Slide>
            </Grid>

            {/* Sección 2: Para qué */}
            <Grid item xs={12} md={6}>
              <Slide in={activeSection >= 1} direction="left" timeout={1000}>
                <Paper 
                  elevation={activeSection >= 1 ? 4 : 2}
                  sx={{ 
                    p: 3,
                    bgcolor: activeSection >= 1 ? 'success.light' : 'background.paper',
                    transform: activeSection >= 1 ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.5s ease-in-out'
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    [2] ¿PARA QUÉ?
                  </Typography>
                  
                  {[
                    { id: 'evaluar', label: 'Evaluar candidato', checked: true },
                    { id: 'cumplir_ley', label: 'Cumplir ley laboral', checked: true },
                    { id: 'contrato', label: 'Gestionar contrato', checked: true }
                  ].map((item) => (
                    <FormControlLabel
                      key={item.id}
                      control={
                        <Checkbox 
                          checked={item.checked}
                          color="success"
                        />
                      }
                      label={item.label}
                      sx={{ display: 'block', mb: 1 }}
                    />
                  ))}

                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Base legal"
                      value="Código del Trabajo, Art. 154"
                      variant="outlined"
                      size="small"
                      InputProps={{ readOnly: true }}
                    />
                  </Box>
                </Paper>
              </Slide>
            </Grid>

            {/* Sección 3: Quién accede */}
            <Grid item xs={12} md={6}>
              <Slide in={activeSection >= 2} direction="right" timeout={1000}>
                <Paper 
                  elevation={activeSection >= 2 ? 4 : 2}
                  sx={{ 
                    p: 3,
                    bgcolor: activeSection >= 2 ? 'warning.light' : 'background.paper',
                    transform: activeSection >= 2 ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.5s ease-in-out'
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    [3] ¿QUIÉN ACCEDE?
                  </Typography>
                  
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Internos:
                  </Typography>
                  {['RRHH', 'Gerencia', 'Finanzas'].map((item) => (
                    <Chip 
                      key={item}
                      label={item}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                      color="primary"
                    />
                  ))}

                  <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>
                    Externos:
                  </Typography>
                  {['Previred', 'Mutual'].map((item) => (
                    <Chip 
                      key={item}
                      label={item}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                      color="warning"
                    />
                  ))}
                </Paper>
              </Slide>
            </Grid>

            {/* Sección 4: Cuánto guardas */}
            <Grid item xs={12} md={6}>
              <Slide in={activeSection >= 3} direction="left" timeout={1000}>
                <Paper 
                  elevation={activeSection >= 3 ? 4 : 2}
                  sx={{ 
                    p: 3,
                    bgcolor: activeSection >= 3 ? 'error.light' : 'background.paper',
                    transform: activeSection >= 3 ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.5s ease-in-out'
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    [4] ¿CUÁNTO GUARDAS?
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Durante:</strong> Relación laboral
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Después:</strong> 5 años
                    </Typography>
                    <Typography variant="body2">
                      <strong>Base:</strong> Código del Trabajo
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon color="error" />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Eliminación automática programada
                    </Typography>
                  </Box>
                </Paper>
              </Slide>
            </Grid>

            {/* Sección 5: Medidas de seguridad */}
            <Grid item xs={12}>
              <Slide in={activeSection >= 4} direction="up" timeout={1000}>
                <Paper 
                  elevation={activeSection >= 4 ? 6 : 2}
                  sx={{ 
                    p: 4,
                    bgcolor: activeSection >= 4 ? 'secondary.light' : 'background.paper',
                    transform: activeSection >= 4 ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.5s ease-in-out'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <SecurityIcon sx={{ fontSize: 30, mr: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      [5] MEDIDAS DE SEGURIDAD
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4">🔐</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Base datos encriptada
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4">🔑</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Acceso con clave
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4">💾</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Respaldo diario
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4">📄</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Contrato confidencialidad
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
                      ✅ NIVEL DE RIESGO: CONTROLADO
                    </Typography>
                  </Box>
                </Paper>
              </Slide>
            </Grid>
          </Grid>

          {/* Botón de acción */}
          <Fade in={activeSection >= 4} timeout={1500}>
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Paper 
                elevation={4}
                sx={{ 
                  p: 3,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    transform: 'scale(1.02)'
                  },
                  transition: 'all 0.3s ease-in-out'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  [GUARDAR Y CONTINUAR CON SIGUIENTE PROCESO] →
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                  Tu primer mapeo estará listo en menos de 10 minutos
                </Typography>
              </Paper>
            </Box>
          </Fade>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InterfazTrabajo;