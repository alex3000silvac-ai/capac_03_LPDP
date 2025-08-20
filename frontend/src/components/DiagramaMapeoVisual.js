import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Chip,
  Card,
  CardContent
} from '@mui/material';

const DiagramaMapeoVisual = ({ formData, procesosEjemplo, datosComunes, datosSensibles }) => {
  const procesoSeleccionado = procesosEjemplo.find(p => p.id === formData.proceso);
  
  const datosSeleccionadosComunes = formData.datosComunes.map(id => 
    datosComunes.find(d => d.id === id)?.label
  ).filter(Boolean);
  
  const datosSeleccionadosSensibles = formData.datosSensibles.map(id => 
    datosSensibles.find(d => d.id === id)?.label
  ).filter(Boolean);

  return (
    <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50', minHeight: 500 }}>
      <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
        🗺️ Diagrama Visual del Mapeo: {procesoSeleccionado?.nombre}
      </Typography>
      
      {/* Diagrama de Flujo Visual Horizontal */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        mb: 4,
        minHeight: 200
      }}>
        {/* 1. Origen - Persona Titular */}
        <Paper 
          elevation={6}
          sx={{ 
            p: 2, 
            bgcolor: 'success.light',
            borderRadius: '15px',
            minWidth: 140,
            textAlign: 'center',
            flex: '1 1 auto',
            maxWidth: 160
          }}
        >
          <Typography variant="h3" sx={{ fontSize: 40 }}>👤</Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Persona Titular
          </Typography>
          <Typography variant="caption" display="block">
            Proporciona datos
          </Typography>
          
          {/* Mostrar tipos de datos */}
          <Box sx={{ mt: 1 }}>
            {datosSeleccionadosComunes.length > 0 && (
              <Chip 
                size="small" 
                label={`${datosSeleccionadosComunes.length} Comunes`} 
                color="success" 
                sx={{ fontSize: '0.7rem', mb: 0.5, display: 'block' }}
              />
            )}
            {datosSeleccionadosSensibles.length > 0 && (
              <Chip 
                size="small" 
                label={`${datosSeleccionadosSensibles.length} Sensibles`} 
                color="error" 
                sx={{ fontSize: '0.7rem', mb: 0.5, display: 'block' }}
              />
            )}
          </Box>
        </Paper>

        {/* Flecha 1 */}
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 60 }}>
          <Box sx={{ flexGrow: 1, height: 3, bgcolor: 'primary.main', borderRadius: 1 }} />
          <Typography variant="h5" sx={{ mx: 1, color: 'primary.main' }}>→</Typography>
        </Box>

        {/* 2. Proceso Central */}
        <Paper 
          elevation={8}
          sx={{ 
            p: 2, 
            bgcolor: 'primary.main',
            color: 'white',
            borderRadius: '15px',
            minWidth: 160,
            textAlign: 'center',
            flex: '1 1 auto',
            maxWidth: 180
          }}
        >
          <Typography variant="h3" sx={{ fontSize: 40 }}>
            {procesoSeleccionado?.icono}
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {procesoSeleccionado?.area}
          </Typography>
          <Typography variant="caption" display="block">
            {procesoSeleccionado?.nombre}
          </Typography>
          
          {/* Finalidades */}
          <Box sx={{ mt: 1 }}>
            <Chip 
              size="small" 
              label={`${formData.finalidades.length} Finalidades`} 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontSize: '0.7rem'
              }}
            />
          </Box>
        </Paper>

        {/* Flecha 2 */}
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 60 }}>
          <Box sx={{ flexGrow: 1, height: 3, bgcolor: 'warning.main', borderRadius: 1 }} />
          <Typography variant="h5" sx={{ mx: 1, color: 'warning.main' }}>→</Typography>
        </Box>

        {/* 3. Destinatarios */}
        <Paper 
          elevation={6}
          sx={{ 
            p: 2, 
            bgcolor: 'warning.light',
            borderRadius: '15px',
            minWidth: 140,
            textAlign: 'center',
            flex: '1 1 auto',
            maxWidth: 160
          }}
        >
          <Typography variant="h3" sx={{ fontSize: 40 }}>🏢</Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Destinatarios
          </Typography>
          <Typography variant="caption" display="block">
            Acceden a datos
          </Typography>
          
          <Box sx={{ mt: 1 }}>
            {formData.destinatarios.internos.length > 0 && (
              <Chip 
                size="small" 
                label={`${formData.destinatarios.internos.length} Internos`} 
                color="info" 
                sx={{ fontSize: '0.7rem', mb: 0.5, display: 'block' }}
              />
            )}
            {formData.destinatarios.externos.length > 0 && (
              <Chip 
                size="small" 
                label={`${formData.destinatarios.externos.length} Externos`} 
                color="warning" 
                sx={{ fontSize: '0.7rem', mb: 0.5, display: 'block' }}
              />
            )}
          </Box>
        </Paper>

        {/* Flecha 3 */}
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 60 }}>
          <Box sx={{ flexGrow: 1, height: 3, bgcolor: 'error.main', borderRadius: 1 }} />
          <Typography variant="h5" sx={{ mx: 1, color: 'error.main' }}>→</Typography>
        </Box>

        {/* 4. Retención/Eliminación */}
        <Paper 
          elevation={6}
          sx={{ 
            p: 2, 
            bgcolor: 'error.light',
            borderRadius: '15px',
            minWidth: 140,
            textAlign: 'center',
            flex: '1 1 auto',
            maxWidth: 160
          }}
        >
          <Typography variant="h3" sx={{ fontSize: 40 }}>🗑️</Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Retención
          </Typography>
          <Typography variant="caption" display="block">
            Eliminación segura
          </Typography>
          
          <Box sx={{ mt: 1 }}>
            <Chip 
              size="small" 
              label={formData.retencion.despues || 'Definido'} 
              color="error" 
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          </Box>
        </Paper>
      </Box>

      {/* Panel de Detalles y Clasificación */}
      <Grid container spacing={3}>
        {/* Datos Comunes */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" sx={{ color: 'success.main', mb: 2, display: 'flex', alignItems: 'center' }}>
                📋 Datos Comunes ({datosSeleccionadosComunes.length})
              </Typography>
              
              {datosSeleccionadosComunes.length > 0 ? (
                <Box>
                  {datosSeleccionadosComunes.map((dato, index) => (
                    <Chip 
                      key={index}
                      size="small" 
                      label={dato} 
                      color="success" 
                      variant="outlined"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                  <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                    • Consentimiento simple<br/>
                    • Protección básica<br/>
                    • Riesgo bajo
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No se seleccionaron datos comunes
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Datos Sensibles */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" sx={{ color: 'error.main', mb: 2, display: 'flex', alignItems: 'center' }}>
                ⚠️ Datos Sensibles ({datosSeleccionadosSensibles.length})
              </Typography>
              
              {datosSeleccionadosSensibles.length > 0 ? (
                <Box>
                  {datosSeleccionadosSensibles.map((dato, index) => (
                    <Chip 
                      key={index}
                      size="small" 
                      label={dato} 
                      color="error" 
                      variant="outlined"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                  <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                    • Consentimiento expreso<br/>
                    • Máxima protección<br/>
                    • Multas hasta 5.000 UTM
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No se seleccionaron datos sensibles
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Interrelaciones */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: 'grey.100' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              🔗 Interrelaciones del Proceso
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  🎯 Finalidades:
                </Typography>
                {formData.finalidades.slice(0, 3).map((finalidad, idx) => (
                  <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
                    • {finalidad}
                  </Typography>
                ))}
                {formData.finalidades.length > 3 && (
                  <Typography variant="caption" color="text.secondary">
                    +{formData.finalidades.length - 3} más...
                  </Typography>
                )}
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  👥 Destinatarios Internos:
                </Typography>
                {formData.destinatarios.internos.slice(0, 4).map((interno, idx) => (
                  <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
                    • {interno}
                  </Typography>
                ))}
                
                {formData.destinatarios.externos.length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
                      🏛️ Destinatarios Externos:
                    </Typography>
                    {formData.destinatarios.externos.slice(0, 3).map((externo, idx) => (
                      <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
                        • {externo}
                      </Typography>
                    ))}
                  </>
                )}
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  ⏱️ Retención:
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  • Durante: {formData.retencion.durante || 'No definido'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  • Después: {formData.retencion.despues || 'No definido'}
                </Typography>
                {formData.retencion.justificacion && (
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    • Justificación: {formData.retencion.justificacion}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Leyenda */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="subtitle2" gutterBottom>🗂️ Leyenda del Mapeo:</Typography>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: 'success.main', borderRadius: '50%' }} />
              <Typography variant="caption">Datos Comunes</Typography>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: 'error.main', borderRadius: '50%' }} />
              <Typography variant="caption">Datos Sensibles</Typography>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 2, bgcolor: 'primary.main' }} />
              <Typography variant="caption">Flujo de Datos</Typography>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6">🏢</Typography>
              <Typography variant="caption">Proceso Central</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default DiagramaMapeoVisual;