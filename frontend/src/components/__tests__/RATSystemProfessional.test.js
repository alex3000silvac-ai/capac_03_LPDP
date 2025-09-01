import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import RATSystemProfessional from '../RATSystemProfessional';

// Mock dependencies
jest.mock('../../services/ratService', () => ({
  createRAT: jest.fn().mockResolvedValue({ id: 1, numero_rat: 'RAT-2024-001' }),
  analyzeRAT: jest.fn().mockResolvedValue({
    nivel_riesgo: 'MEDIO',
    requiere_eipd: false,
    score_compliance: 85
  })
}));

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

describe('RATSystemProfessional', () => {
  test('renders RAT creation form', () => {
    render(
      <TestWrapper>
        <RATSystemProfessional />
      </TestWrapper>
    );
    
    expect(screen.getByText(/Registro de Actividades de Tratamiento/i)).toBeInTheDocument();
    expect(screen.getByText(/Sistema Profesional RAT/i)).toBeInTheDocument();
  });

  test('shows stepper navigation', () => {
    render(
      <TestWrapper>
        <RATSystemProfessional />
      </TestWrapper>
    );
    
    expect(screen.getByText(/Información General/i)).toBeInTheDocument();
    expect(screen.getByText(/Finalidad y Base Legal/i)).toBeInTheDocument();
  });

  test('allows form input', async () => {
    render(
      <TestWrapper>
        <RATSystemProfessional />
      </TestWrapper>
    );
    
    const nombreInput = screen.getByLabelText(/Nombre de la Actividad/i);
    fireEvent.change(nombreInput, { target: { value: 'Test Activity' } });
    
    await waitFor(() => {
      expect(nombreInput.value).toBe('Test Activity');
    });
  });

  test('validates required fields', async () => {
    render(
      <TestWrapper>
        <RATSystemProfessional />
      </TestWrapper>
    );
    
    const continueButton = screen.getByText(/Continuar/i);
    fireEvent.click(continueButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Nombre requerido/i)).toBeInTheDocument();
    });
  });
});