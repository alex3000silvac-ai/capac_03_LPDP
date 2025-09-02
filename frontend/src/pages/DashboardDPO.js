import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { useTenant } from '../contexts/TenantContext';
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
import { Task as TaskIcon } from '@mui/icons-material';
import PageLayout from '../components/PageLayout';

const DashboardDPO = () => {
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
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

  // Cargar datos reales desde Supabase
  useEffect(() => {
    const cargarDatosReales = async () => {
      if (!currentTenant?.id) return;
      
      try {
        // 1. Contar RATs activos reales
        const { count: ratsCount } = await supabase
          .from('mapeo_datos_rat')
          .select('id', { count: 'exact' })
          .eq('tenant_id', currentTenant.id)
          .neq('estado', 'ELIMINADO');
        
        // 2. Contar EIPDs pendientes reales - usando actividades_dpo como base
        const { count: eipdCount } = await supabase
          .from('actividades_dpo')
          .select('id', { count: 'exact' })
          .eq('tenant_id', currentTenant.id)
          .eq('tipo_actividad', 'EIPD')
          .eq('estado', 'pendiente');
        
        // 3. Contar tareas pendientes reales
        const { count: tareasCount } = await supabase
          .from('actividades_dpo')
          .select('id', { count: 'exact' })
          .eq('tenant_id', currentTenant.id)
          .eq('estado', 'pendiente');
        
        // 4. Calcular cumplimiento real
        const { count: ratsCompletos } = await supabase
          .from('mapeo_datos_rat')
          .select('id', { count: 'exact' })
          .eq('tenant_id', currentTenant.id)
          .eq('estado', 'CERTIFICADO');
        
        const cumplimientoPorcentaje = ratsCount > 0 ? Math.round((ratsCompletos / ratsCount) * 100) : 0;
        
        // Actualizar stats con datos reales
        setStats([
          {
            titulo: 'RATs Activos',
            valor: (ratsCount || 0).toString(),
            icono: <DashboardIcon sx={{ fontSize: 32, color: '#60a5fa' }} />,
            cambio: ratsCount > 0 ? `${ratsCount} registrados` : 'Sin RATs aún',
            color: 'primary'
          },
          {
            titulo: 'EIPD Pendientes',
            valor: (eipdCount || 0).toString(),
            icono: <WarningIcon sx={{ fontSize: 32, color: '#f59e0b' }} />,
            cambio: eipdCount > 0 ? 'Requieren atención' : 'Todo al día',
            color: eipdCount > 0 ? 'warning' : 'success'
          },
          {
            titulo: 'Cumplimiento',
            valor: `${cumplimientoPorcentaje}%`,
            icono: <CheckIcon sx={{ fontSize: 32, color: '#10b981' }} />,
            cambio: cumplimientoPorcentaje > 80 ? 'Excelente' : cumplimientoPorcentaje > 50 ? 'Mejorable' : 'Crítico',
            color: cumplimientoPorcentaje > 80 ? 'success' : cumplimientoPorcentaje > 50 ? 'warning' : 'error'
          },
          {
            titulo: 'Tareas Pendientes',
            valor: (tareasCount || 0).toString(),
            icono: <TaskIcon sx={{ fontSize: 32, color: '#ef4444' }} />,
            cambio: tareasCount > 0 ? `${tareasCount} por resolver` : 'Sin tareas pendientes',
            color: tareasCount > 0 ? 'error' : 'success'
          }
        ]);
        
        console.log('📊 DashboardDPO - Datos reales cargados:', {
          ratsActivos: ratsCount,
          eipdPendientes: eipdCount,
          tareasPendientes: tareasCount,
          cumplimiento: cumplimientoPorcentaje
        });
        
      } catch (error) {
        console.error('❌ Error cargando datos DashboardDPO:', error);
        // Mantener valores 0 en caso de error
      }
    };
    
    cargarDatosReales();
  }, [currentTenant]);

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