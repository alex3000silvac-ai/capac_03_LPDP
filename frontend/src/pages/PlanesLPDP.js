import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Paper,
  Divider,
  Alert,
} from '@mui/material';
import {
  CheckCircle,
  Star,
  Business,
  Assessment,
  Security,
  Cloud,
  Support,
  Group,
  Api,
  FileDownload,
  Verified,
  TrendingUp,
} from '@mui/icons-material';

const PlanesLPDP = () => {
  const planes = [
    {
      nombre: "RAT STARTER",
      precio: "$199",
      periodo: "USD/mes por empresa",
      color: "success",
      icon: <CheckCircle />,
      descripcion: "Perfecto para empresas 50-200 empleados que inician con LPDP",
      caracteristicas: [
        "Dashboard completo",
        "Módulo Cero Constructor RAT (hasta 5 RATs)",
        "Ruta de Capacitación completa",
        "Exportación CSV/Excel básica",
        "Templates básicos (3 industrias)",
        "Soporte por email",
        "1 usuario administrador"
      ],
      limitaciones: [
        "Máximo 5 RATs",
        "Templates limitados",
        "Sin API",
        "Sin consolidado ejecutivo"
      ],
      ideal: "Empresas que empiezan su cumplimiento LPDP"
    },
    {
      nombre: "RAT BUSINESS", 
      precio: "$499",
      periodo: "USD/mes por empresa",
      color: "primary",
      icon: <Business />,
      descripcion: "Para empresas establecidas que necesitan gestión profesional",
      caracteristicas: [
        "Todo lo del Plan Starter",
        "Módulo Cero Constructor RAT (hasta 25 RATs)",
        "Consolidado RAT básico",
        "Templates extendidos (7 industrias)",
        "Exportación avanzada",
        "Multi-usuario (hasta 3)",
        "Soporte prioritario"
      ],
      limitaciones: [
        "Máximo 25 RATs",
        "Sin integraciones avanzadas",
        "API limitada"
      ],
      ideal: "Empresas en crecimiento con procesos establecidos",
      popular: true
    },
    {
      nombre: "RAT ENTERPRISE",
      precio: "$1,299", 
      periodo: "USD/mes por empresa",
      color: "secondary",
      icon: <Star />,
      descripcion: "Solución completa para grandes organizaciones y estudios jurídicos",
      caracteristicas: [
        "Todo lo de planes anteriores",
        "RATs ilimitados",
        "APIs completas OneTrust/BigID/SOLUTORIA",
        "Motor de políticas de retención automatizado",
        "Conectores SFTP seguros",
        "Base de datos relacional completa",
        "RBAC granular y auditoría inmutable",
        "Integración plataformas GRC",
        "Multi-usuario ilimitado",
        "Branded reports personalizados",
        "Consultoría incluida (4h/mes)",
        "Soporte 24/7"
      ],
      limitaciones: [],
      ideal: "Grandes empresas, estudios jurídicos, consultoras",
      enterprise: true
    }
  ];

  const comparacion = [
    { feature: "RATs incluidos", starter: "5", business: "25", enterprise: "Ilimitado" },
    { feature: "Usuarios", starter: "1", business: "3", enterprise: "Ilimitado" },
    { feature: "Templates industria", starter: "3", business: "7", enterprise: "15+" },
    { feature: "Exportación", starter: "CSV/Excel", business: "Avanzada", enterprise: "Todas las plataformas" },
    { feature: "API", starter: "No", business: "Limitada", enterprise: "Completa" },
    { feature: "Soporte", starter: "Email", business: "Prioritario", enterprise: "24/7 + Consultoría" },
    { feature: "Consolidado RAT", starter: "No", business: "Básico", enterprise: "Completo" },
    { feature: "Integraciones", starter: "No", business: "No", enterprise: "OneTrust/BigID/SOLUTORIA" }
  ];

  const beneficiosGenerales = [
    {
      icono: <Security color="primary" />,
      titulo: "Cumplimiento Ley 21.719",
      descripcion: "100% alineado con la normativa chilena específica"
    },
    {
      icono: <TrendingUp color="primary" />,
      titulo: "Pre-OneTrust",
      descripcion: "Preparación perfecta para grandes plataformas GRC"
    },
    {
      icono: <Assessment color="primary" />,
      titulo: "Metodología Probada",
      descripcion: "Validada por estudios jurídicos líderes en Chile"
    },
    {
      icono: <Support color="primary" />,
      titulo: "Especialización Local",
      descripcion: "Templates y ejemplos específicos del mercado chileno"
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom color="primary">
          Planes Sistema LPDP
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          El único sistema chileno especializado en Ley 21.719
        </Typography>
        
        {/* Mensaje de venta */}
        <Alert severity="info" sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
          <Typography variant="body1" fontWeight={600}>
            💡 "Antes de invertir $50k/año en OneTrust, necesitas mapear tus datos"
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Somos el paso 0: te mapeamos todo en 30 días y te preparamos para cualquier plataforma GRC
          </Typography>
        </Alert>

        {/* Beneficios generales */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {beneficiosGenerales.map((beneficio, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                {beneficio.icono}
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  {beneficio.titulo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {beneficio.descripcion}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Planes */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {planes.map((plan, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                position: 'relative',
                border: plan.popular ? 3 : 1,
                borderColor: plan.popular ? 'primary.main' : 'divider',
                transform: plan.popular ? 'scale(1.05)' : 'none',
                '&:hover': {
                  transform: plan.popular ? 'scale(1.07)' : 'scale(1.02)',
                  boxShadow: 8
                }
              }}
            >
              {plan.popular && (
                <Chip 
                  label="MÁS POPULAR" 
                  color="primary" 
                  sx={{ 
                    position: 'absolute', 
                    top: -10, 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    fontWeight: 600
                  }} 
                />
              )}
              
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  {plan.icon}
                  <Typography variant="h5" fontWeight={600} sx={{ ml: 1 }}>
                    {plan.nombre}
                  </Typography>
                </Box>
                
                <Box mb={3}>
                  <Typography variant="h3" color="primary" fontWeight={600}>
                    {plan.precio}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {plan.periodo}
                  </Typography>
                </Box>

                <Typography variant="body1" sx={{ mb: 3 }}>
                  {plan.descripcion}
                </Typography>

                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  ✅ Incluye:
                </Typography>
                <List dense sx={{ mb: 2 }}>
                  {plan.caracteristicas.map((caracteristica, idx) => (
                    <ListItem key={idx} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircle color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={caracteristica}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  <strong>Ideal para:</strong> {plan.ideal}
                </Typography>

                <Button 
                  variant={plan.popular ? "contained" : "outlined"}
                  color="primary"
                  fullWidth
                  size="large"
                  sx={{ mt: 'auto' }}
                >
                  {plan.enterprise ? "Contactar Ventas" : "Comenzar Ahora"}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabla comparación */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom textAlign="center">
          📊 Comparación Detallada
        </Typography>
        
        <Box sx={{ overflowX: 'auto' }}>
          <Box component="table" sx={{ width: '100%', minWidth: 600 }}>
            <Box component="thead">
              <Box component="tr">
                <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 600 }}>
                  Característica
                </Box>
                <Box component="th" sx={{ p: 2, textAlign: 'center', fontWeight: 600 }}>
                  STARTER
                </Box>
                <Box component="th" sx={{ p: 2, textAlign: 'center', fontWeight: 600, bgcolor: 'primary.50' }}>
                  BUSINESS
                </Box>
                <Box component="th" sx={{ p: 2, textAlign: 'center', fontWeight: 600 }}>
                  ENTERPRISE
                </Box>
              </Box>
            </Box>
            <Box component="tbody">
              {comparacion.map((row, index) => (
                <Box component="tr" key={index}>
                  <Box component="td" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    {row.feature}
                  </Box>
                  <Box component="td" sx={{ p: 2, borderBottom: 1, borderColor: 'divider', textAlign: 'center' }}>
                    {row.starter}
                  </Box>
                  <Box component="td" sx={{ p: 2, borderBottom: 1, borderColor: 'divider', textAlign: 'center', bgcolor: 'primary.50' }}>
                    {row.business}
                  </Box>
                  <Box component="td" sx={{ p: 2, borderBottom: 1, borderColor: 'divider', textAlign: 'center' }}>
                    {row.enterprise}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Call to action final */}
      <Paper sx={{ p: 4, textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h4" gutterBottom>
          ¿Listo para comenzar tu cumplimiento LPDP?
        </Typography>
        <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
          Únete a las empresas que ya confían en nuestro sistema
        </Typography>
        
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Button variant="contained" color="secondary" size="large">
              Iniciar Prueba Gratuita
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" sx={{ color: 'white', borderColor: 'white' }} size="large">
              Agendar Demo
            </Button>
          </Grid>
        </Grid>
        
        <Typography variant="body2" sx={{ mt: 3, opacity: 0.8 }}>
          🛡️ Garantía de satisfacción 30 días • 🔒 Datos seguros en Chile • 📞 Soporte en español
        </Typography>
      </Paper>
    </Container>
  );
};

export default PlanesLPDP;