import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AdminDashboard from '../AdminDashboard';

const darkTheme = createTheme({
  palette: {
    mode: 'dark'
  }
});

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider theme={darkTheme}>
      {children}
    </ThemeProvider>
  </BrowserRouter>
);

describe('AdminDashboard', () => {
  test('renders admin dashboard', () => {
    render(
      <TestWrapper>
        <AdminDashboard />
      </TestWrapper>
    );
    
    expect(screen.getByText(/Panel Administrativo Multi-tenant/i)).toBeInTheDocument();
    expect(screen.getByText(/Gestión holdings, usuarios y configuración/i)).toBeInTheDocument();
  });

  test('shows metrics cards', () => {
    render(
      <TestWrapper>
        <AdminDashboard />
      </TestWrapper>
    );
    
    expect(screen.getByText(/Holdings Activas/i)).toBeInTheDocument();
    expect(screen.getByText(/Usuarios Sistema/i)).toBeInTheDocument();
    expect(screen.getByText(/Compliance Promedio/i)).toBeInTheDocument();
  });

  test('displays navigation tabs', () => {
    render(
      <TestWrapper>
        <AdminDashboard />
      </TestWrapper>
    );
    
    expect(screen.getByText(/Holdings/i)).toBeInTheDocument();
    expect(screen.getByText(/Usuarios/i)).toBeInTheDocument();
    expect(screen.getByText(/Métricas/i)).toBeInTheDocument();
    expect(screen.getByText(/Alertas/i)).toBeInTheDocument();
    expect(screen.getByText(/Configuración/i)).toBeInTheDocument();
  });
});