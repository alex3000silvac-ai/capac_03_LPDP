import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Páginas
import Dashboard from './pages/Dashboard';
import ModuloCapacitacion from './pages/ModuloCapacitacion';
import SimulacionEntrevista from './pages/SimulacionEntrevista';
import PracticaSandbox from './pages/PracticaSandbox';
import MiProgreso from './pages/MiProgreso';

// Componentes
import Layout from './components/Layout';

// Tema personalizado
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    secondary: {
      main: '#00bcd4',
      light: '#4dd0e1',
      dark: '#00838f',
    },
    success: {
      main: '#66bb6a',
      light: '#81c784',
      dark: '#4caf50',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 16px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  // Deploy trigger - force rebuild
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/modulo/:moduloId" element={<ModuloCapacitacion />} />
            <Route path="/simulacion/:area" element={<SimulacionEntrevista />} />
            <Route path="/sandbox" element={<PracticaSandbox />} />
            <Route path="/mi-progreso" element={<MiProgreso />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;