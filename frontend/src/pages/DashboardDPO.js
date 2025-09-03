import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { useTenant } from '../contexts/TenantContext';
import { useDataSync } from '../hooks/useDataSync';
import { Box, Container, Typography, Paper, Grid, Card, CardContent, Chip, Alert, Button } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  AssignmentLate as TaskIcon,
  Shield as ShieldIcon,
  Notifications as NotificationIcon,
  List as QueueIcon,
  Analytics as MetricsIcon
} from '@mui/icons-material';
import PageLayout from '../components/PageLayout';

const DashboardDPO = () => {
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  
  // 🔄 USAR SERVICIO SINCRONIZACIÓN - DATOS CONSISTENTES
  const { data: syncedData, loading: syncLoading, notifyChange } = useDataSync('DashboardDPO');
  const [stats, setStats] = useState([
    {
      titulo: 'RATs Activos',
      valor: '0',
      icono: <DashboardIcon sx={{ fontSize: 32, color: '#60a5fa' }} />,
      cambio: 'Cargando...',
      color: 'primary'
    },
    {
      titulo: 'EIPD Pendientes',
      valor: '0',
      icono: <WarningIcon sx={{ fontSize: 32, color: '#f59e0b' }} />,
      cambio: 'Cargando...',
      color: 'warning'
    },
    {
      titulo: 'Cumplimiento',
      valor: '0%',
      icono: <CheckIcon sx={{ fontSize: 32, color: '#10b981' }} />,
      cambio: 'Calculando...',
      color: 'success'
    },
    {
      titulo: 'Tareas Pendientes',
      valor: '0',
      icono: <TaskIcon sx={{ fontSize: 32, color: '#ef4444' }} />,
      cambio: 'Cargando...',
      color: 'error'
    }
  ]);

  // 🔄 DATOS 100% DESDE SUPABASE - CERO HARDCODING
  useEffect(() => {
    if (!syncedData) return;
    
    console.log('🔄 [DashboardDPO] Actualizando con datos sincronizados:', syncedData);
    
    // Actualizar stats con datos sincronizados (TODO desde Supabase)
    setStats([
      {
        titulo: 'RATs Activos',
        valor: syncedData.ratsActivos?.toString() || 'Cargando...',
        icono: <DashboardIcon sx={{ fontSize: 32, color: '#60a5fa' }} />,
        cambio: syncedData.ratsActivos > 0 ? `${syncedData.ratsActivos} registrados` : 'Sin datos aún',
        color: 'primary'
      },
      {
        titulo: 'EIPD Pendientes', 
        valor: syncedData.eipdsPendientes?.toString() || 'Cargando...',
        icono: <WarningIcon sx={{ fontSize: 32, color: '#f59e0b' }} />,
        cambio: syncedData.eipdsPendientes > 0 ? `${syncedData.eipdsPendientes} requieren atención` : 'Sin pendientes',
        color: 'warning'
      },
      {
        titulo: 'Cumplimiento',
        valor: syncedData.cumplimiento ? `${syncedData.cumplimiento}%` : 'Calculando...',
        icono: <CheckIcon sx={{ fontSize: 32, color: '#10b981' }} />,
        cambio: (syncedData.cumplimiento || 0) >= 80 ? 'Excelente' : 'Calculando...',
        color: 'success'
      },
      {
        titulo: 'Tareas Pendientes',
        valor: syncedData.tareasPendientes?.toString() || 'Cargando...', 
        icono: <TaskIcon sx={{ fontSize: 32, color: '#ef4444' }} />,
        cambio: syncedData.tareasPendientes > 0 ? `${syncedData.tareasPendientes} pendientes` : 'Sin tareas',
        color: 'error'
      }
    ]);
  }, [syncedData]);

  return (
    <PageLayout
      title="Centro de Control DPO"
      subtitle="Monitoreo en tiempo real de cumplimiento Ley 21.719"
      showPaper={false}
    >
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                bgcolor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '0.75rem',
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  borderColor: '#4f46e5',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  {stat.icono}
                  <Chip
                    label={stat.cambio}
                    size="small"
                    color={stat.color}
                    sx={{ fontSize: '0.7rem' }}
                  />
                </Box>
                <Typography variant="h4" sx={{ color: '#f9fafb', fontWeight: 700, mb: 1 }}>
                  {stat.valor}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  {stat.titulo}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper
        sx={{
          mt: 4,
          p: 3,
          bgcolor: '#1f2937',
          border: '1px solid #374151',
          borderRadius: '0.75rem'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <NotificationIcon sx={{ color: '#60a5fa', mr: 2 }} />
          <Typography variant="h5" sx={{ color: '#f9fafb', fontWeight: 600 }}>
            Notificaciones y Alertas
          </Typography>
        </Box>
        
        <Alert severity="info" sx={{ mb: 3, bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            Art. 47 Ley 21.719 - Funciones del DPO
          </Typography>
          <Typography variant="caption" display="block">
            Supervisar el cumplimiento normativo y servir de punto de contacto con la Agencia
          </Typography>
        </Alert>

        <Typography variant="body1" sx={{ color: '#9ca3af', textAlign: 'center', py: 4 }}>
          Sistema de notificaciones conectado con Supabase
        </Typography>
        
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<MetricsIcon />}
            onClick={() => navigate('/compliance-metrics')}
            sx={{
              bgcolor: '#8b5cf6',
              '&:hover': { bgcolor: '#7c3aed' },
              px: 4,
              py: 1.5
            }}
          >
            Métricas Compliance
          </Button>
          
          <Button
            variant="contained"
            size="large"
            startIcon={<ShieldIcon />}
            onClick={() => navigate('/eipd-creator')}
            sx={{
              bgcolor: '#ef4444',
              '&:hover': { bgcolor: '#dc2626' },
              px: 4,
              py: 1.5
            }}
          >
            Crear EIPD/DPIA
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            startIcon={<DashboardIcon />}
            onClick={() => navigate('/rat-list')}
            sx={{
              borderColor: '#4f46e5',
              color: '#4f46e5',
              '&:hover': { bgcolor: 'rgba(79, 70, 229, 0.1)' },
              px: 4,
              py: 1.5
            }}
          >
            Ver Todos los RATs
          </Button>
        </Box>
      </Paper>
    </PageLayout>
  );
};

export default DashboardDPO;