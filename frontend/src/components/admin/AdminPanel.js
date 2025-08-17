import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Chip,
  Alert,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
  History as HistoryIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

// Importar componentes de administración
import AdminDashboard from './AdminDashboard';
import TenantManagement from './TenantManagement';
import UserManagement from './UserManagement';
import SystemAudit from './SystemAudit';
import SystemReports from './SystemReports';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
}

function AdminPanel() {
  const [tabValue, setTabValue] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [systemStatus, setSystemStatus] = useState('healthy');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getSystemStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'info';
    }
  };

  const getSystemStatusText = (status) => {
    switch (status) {
      case 'healthy': return 'Sistema Saludable';
      case 'warning': return 'Advertencias';
      case 'critical': return 'Crítico';
      default: return 'Desconocido';
    }
  };

  const tabs = [
    {
      label: 'Dashboard',
      icon: <DashboardIcon />,
      component: <AdminDashboard />,
      badge: 0
    },
    {
      label: 'Empresas',
      icon: <BusinessIcon />,
      component: <TenantManagement />,
      badge: 0
    },
    {
      label: 'Usuarios',
      icon: <PeopleIcon />,
      component: <UserManagement />,
      badge: 0
    },
    {
      label: 'Auditoría',
      icon: <HistoryIcon />,
      component: <SystemAudit />,
      badge: notifications.filter(n => n.type === 'audit').length
    },
    {
      label: 'Reportes',
      icon: <AssessmentIcon />,
      component: <SystemReports />,
      badge: 0
    },
    {
      label: 'Seguridad',
      icon: <SecurityIcon />,
      component: <div>Panel de Seguridad (En desarrollo)</div>,
      badge: notifications.filter(n => n.type === 'security').length
    }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header de administración */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Panel de Administración - Sistema LPDP
          </Typography>
          
          {/* Estado del sistema */}
          <Chip
            icon={<NotificationsIcon />}
            label={getSystemStatusText(systemStatus)}
            color={getSystemStatusColor(systemStatus)}
            variant="outlined"
            sx={{ mr: 2 }}
          />
          
          {/* Notificaciones */}
          <IconButton color="inherit">
            <Badge badgeContent={notifications.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          {/* Configuración */}
          <IconButton color="inherit">
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Tabs de navegación */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="admin tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  {tab.icon}
                  {tab.label}
                  {tab.badge > 0 && (
                    <Chip
                      label={tab.badge}
                      size="small"
                      color="error"
                      sx={{ minWidth: 20, height: 20 }}
                    />
                  )}
                </Box>
              }
              {...a11yProps(index)}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Contenido de las tabs */}
      {tabs.map((tab, index) => (
        <TabPanel key={index} value={tabValue} index={index}>
          {tab.component}
        </TabPanel>
      ))}

      {/* Alertas del sistema */}
      {systemStatus !== 'healthy' && (
        <Alert 
          severity={systemStatus === 'critical' ? 'error' : 'warning'}
          sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}
        >
          {systemStatus === 'critical' 
            ? 'El sistema presenta problemas críticos que requieren atención inmediata'
            : 'El sistema presenta algunas advertencias'
          }
        </Alert>
      )}
    </Box>
  );
}

export default AdminPanel;
