import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Container,
  Card,
  CardContent,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';

// ICONOS PROFESIONALES MÁS USADOS
import {
  Assessment,
  Dashboard,
  Security,
  Gavel,
  Business,
  AccountBalance,
  Description,
  Folder,
  Assignment,
  CheckCircle,
  Warning,
  Error,
  Info,
  Settings,
  Person,
  Group,
  Timeline,
  TrendingUp,
  BarChart,
  PieChart,
  Storage,
  CloudUpload,
  CloudDownload,
  Lock,
  LockOpen,
  VerifiedUser,
  Policy,
  Article,
  DocumentScanner,
  Task,
  AssignmentTurnedIn,
  Rule,
  Checklist,
  DataUsage,
  Analytics,
  Insights,
  ManageAccounts,
  AdminPanelSettings,
  SupervisorAccount,
  Badge,
  Shield,
  GppGood,
  PrivacyTip,
  Copyright,
  Balance
} from '@mui/icons-material';

const PaletaColores = () => {
  // PALETAS DE COLORES AZUL MARINO PROFESIONALES
  const paletas = [
    {
      nombre: 'AZUL MARINO CLÁSICO',
      colores: {
        fondo: '#001f3f',      // Navy Blue oscuro
        fondoSecundario: '#003366', // Azul marino medio
        tarjetas: '#004080',   // Azul marino para cards
        texto: '#ffffff',       // Texto blanco
        textoSecundario: '#b8d4e3', // Azul claro para texto secundario
        acento: '#4db8ff',     // Azul brillante para acentos
        borde: '#0066cc'       // Azul para bordes
      }
    },
    {
      nombre: 'AZUL MARINO CORPORATIVO',
      colores: {
        fondo: '#0a1929',      // Azul marino muy oscuro
        fondoSecundario: '#132f4c', // Azul marino secundario
        tarjetas: '#1e3a5f',   // Azul para tarjetas
        texto: '#ffffff',       
        textoSecundario: '#94a3b8',
        acento: '#3ea6ff',     
        borde: '#2196f3'       
      }
    },
    {
      nombre: 'AZUL MARINO EJECUTIVO',
      colores: {
        fondo: '#0d1b2a',      // Azul marino profundo
        fondoSecundario: '#1b263b', 
        tarjetas: '#2c3e50',   // Azul grisáceo
        texto: '#ffffff',       
        textoSecundario: '#cbd5e1',
        acento: '#60a5fa',     
        borde: '#3b82f6'       
      }
    },
    {
      nombre: 'AZUL MARINO INSTITUCIONAL',
      colores: {
        fondo: '#002147',      // Oxford Blue
        fondoSecundario: '#003366',
        tarjetas: '#004d99',   
        texto: '#ffffff',       
        textoSecundario: '#a0c4e7',
        acento: '#5eb3f6',     
        borde: '#0066cc'       
      }
    },
    {
      nombre: 'AZUL MARINO LEGAL',
      colores: {
        fondo: '#0c1e3d',      // Azul marino legal
        fondoSecundario: '#1a2f4e',
        tarjetas: '#243b5a',   
        texto: '#ffffff',       
        textoSecundario: '#9db5d1',
        acento: '#4a90e2',     
        borde: '#2e5c8a'       
      }
    }
  ];

  // ICONOS PROFESIONALES ORGANIZADOS POR CATEGORÍA
  const iconosProfesionales = [
    {
      categoria: 'DOCUMENTOS Y REGISTROS',
      iconos: [
        { nombre: 'Assessment', icono: <Assessment />, uso: 'Reportes y evaluaciones' },
        { nombre: 'Description', icono: <Description />, uso: 'Documentos' },
        { nombre: 'Folder', icono: <Folder />, uso: 'Carpetas' },
        { nombre: 'Assignment', icono: <Assignment />, uso: 'Tareas' },
        { nombre: 'Article', icono: <Article />, uso: 'Artículos' },
        { nombre: 'DocumentScanner', icono: <DocumentScanner />, uso: 'Escaneo documentos' },
        { nombre: 'Task', icono: <Task />, uso: 'Tareas completadas' },
        { nombre: 'Checklist', icono: <Checklist />, uso: 'Lista de verificación' }
      ]
    },
    {
      categoria: 'SEGURIDAD Y CUMPLIMIENTO',
      iconos: [
        { nombre: 'Security', icono: <Security />, uso: 'Seguridad' },
        { nombre: 'Lock', icono: <Lock />, uso: 'Bloqueado' },
        { nombre: 'LockOpen', icono: <LockOpen />, uso: 'Desbloqueado' },
        { nombre: 'VerifiedUser', icono: <VerifiedUser />, uso: 'Usuario verificado' },
        { nombre: 'Policy', icono: <Policy />, uso: 'Políticas' },
        { nombre: 'Shield', icono: <Shield />, uso: 'Protección' },
        { nombre: 'GppGood', icono: <GppGood />, uso: 'Privacidad OK' },
        { nombre: 'PrivacyTip', icono: <PrivacyTip />, uso: 'Tip privacidad' }
      ]
    },
    {
      categoria: 'LEGAL Y NORMATIVO',
      iconos: [
        { nombre: 'Gavel', icono: <Gavel />, uso: 'Legal/Judicial' },
        { nombre: 'Balance', icono: <Balance />, uso: 'Balance/Justicia' },
        { nombre: 'AccountBalance', icono: <AccountBalance />, uso: 'Institución' },
        { nombre: 'Rule', icono: <Rule />, uso: 'Reglas' },
        { nombre: 'Copyright', icono: <Copyright />, uso: 'Derechos de autor' },
        { nombre: 'Business', icono: <Business />, uso: 'Empresa' }
      ]
    },
    {
      categoria: 'USUARIOS Y ADMINISTRACIÓN',
      iconos: [
        { nombre: 'Person', icono: <Person />, uso: 'Usuario individual' },
        { nombre: 'Group', icono: <Group />, uso: 'Grupo usuarios' },
        { nombre: 'ManageAccounts', icono: <ManageAccounts />, uso: 'Gestión cuentas' },
        { nombre: 'AdminPanelSettings', icono: <AdminPanelSettings />, uso: 'Panel admin' },
        { nombre: 'SupervisorAccount', icono: <SupervisorAccount />, uso: 'Supervisor' },
        { nombre: 'Badge', icono: <Badge />, uso: 'Identificación' }
      ]
    },
    {
      categoria: 'ANÁLISIS Y MÉTRICAS',
      iconos: [
        { nombre: 'Dashboard', icono: <Dashboard />, uso: 'Panel de control' },
        { nombre: 'Timeline', icono: <Timeline />, uso: 'Línea de tiempo' },
        { nombre: 'TrendingUp', icono: <TrendingUp />, uso: 'Tendencia alcista' },
        { nombre: 'BarChart', icono: <BarChart />, uso: 'Gráfico barras' },
        { nombre: 'PieChart', icono: <PieChart />, uso: 'Gráfico circular' },
        { nombre: 'DataUsage', icono: <DataUsage />, uso: 'Uso de datos' },
        { nombre: 'Analytics', icono: <Analytics />, uso: 'Analíticas' },
        { nombre: 'Insights', icono: <Insights />, uso: 'Insights' }
      ]
    },
    {
      categoria: 'ESTADOS Y ALERTAS',
      iconos: [
        { nombre: 'CheckCircle', icono: <CheckCircle />, uso: 'Completado' },
        { nombre: 'Warning', icono: <Warning />, uso: 'Advertencia' },
        { nombre: 'Error', icono: <Error />, uso: 'Error' },
        { nombre: 'Info', icono: <Info />, uso: 'Información' },
        { nombre: 'Settings', icono: <Settings />, uso: 'Configuración' },
        { nombre: 'AssignmentTurnedIn', icono: <AssignmentTurnedIn />, uso: 'Tarea completada' }
      ]
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom sx={{ mb: 4, fontWeight: 700 }}>
        PALETA DE COLORES E ICONOS PROFESIONALES
      </Typography>

      {/* SECCIÓN PALETAS DE COLORES */}
      <Typography variant="h4" gutterBottom sx={{ mt: 4, mb: 3 }}>
        PALETAS DE COLORES AZUL MARINO
      </Typography>
      
      <Grid container spacing={3}>
        {paletas.map((paleta, index) => (
          <Grid item xs={12} key={index}>
            <Paper sx={{ p: 3, backgroundColor: paleta.colores.fondo }}>
              <Typography variant="h6" sx={{ color: paleta.colores.texto, mb: 2 }}>
                {paleta.nombre}
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(paleta.colores).map(([nombre, color]) => (
                  <Grid item xs={12} sm={6} md={3} lg={1.7} key={nombre}>
                    <Box
                      sx={{
                        backgroundColor: color,
                        height: 80,
                        border: '1px solid rgba(255,255,255,0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 1
                      }}
                    >
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: nombre.includes('texto') ? '#000' : '#fff',
                          fontWeight: 600,
                          textAlign: 'center'
                        }}
                      >
                        {nombre}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: nombre.includes('texto') ? '#000' : '#fff',
                          fontSize: '10px'
                        }}
                      >
                        {color}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 6 }} />

      {/* SECCIÓN ICONOS PROFESIONALES */}
      <Typography variant="h4" gutterBottom sx={{ mt: 4, mb: 3 }}>
        ICONOS PROFESIONALES MÁS USADOS
      </Typography>

      <Grid container spacing={3}>
        {iconosProfesionales.map((categoria) => (
          <Grid item xs={12} md={6} lg={4} key={categoria.categoria}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  {categoria.categoria}
                </Typography>
                <List dense>
                  {categoria.iconos.map((item) => (
                    <ListItem key={item.nombre}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {item.icono}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.nombre}
                        secondary={item.uso}
                        primaryTypographyProps={{ fontSize: '14px', fontWeight: 500 }}
                        secondaryTypographyProps={{ fontSize: '12px' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 6, p: 3, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          INSTRUCCIONES PARA ELEGIR:
        </Typography>
        <Typography variant="body1">
          1. Elige una de las paletas de colores azul marino mostradas arriba
        </Typography>
        <Typography variant="body1">
          2. Indica qué iconos prefieres para cada sección del sistema
        </Typography>
        <Typography variant="body1">
          3. Especifica si necesitas algún ajuste en los colores seleccionados
        </Typography>
      </Box>
    </Container>
  );
};

export default PaletaColores;