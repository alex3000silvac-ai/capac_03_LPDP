/**
 * TEMA AZUL OSCURO PROFESIONAL
 * Sin fondos blancos - Todo en tonos azules oscuros
 */

export const darkTheme = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#4fc3f7',
      light: '#80d8ff', 
      dark: '#0093c4',
    },
    secondary: {
      main: '#29b6f6',
      light: '#73e8ff',
      dark: '#0086c3',
    },
    background: {
      default: '#1a2332', // Azul oscuro de fondo
      paper: '#0d1117',   // Azul más oscuro para tarjetas
      surface: '#141b26', // Azul intermedio
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0bec5',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    success: {
      main: '#4caf50',
    },
    info: {
      main: '#2196f3',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  components: {
    // Eliminar TODOS los fondos blancos de TODOS los componentes
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#0d1117',
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#0d1117',
          backgroundImage: 'none',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0d1117',
          backgroundImage: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0d1117',
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0d1117',
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: '#4fc3f7',
          color: '#0d1117',
          '&:hover': {
            backgroundColor: '#29b6f6',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            backgroundColor: '#141b26',
            color: '#ffffff',
          },
          '& .MuiInputLabel-root': {
            color: '#b0bec5',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(79, 195, 247, 0.3)',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(79, 195, 247, 0.1)',
          color: '#ffffff',
        },
        standardSuccess: {
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
        },
        standardError: {
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
        },
        standardWarning: {
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
        },
        standardInfo: {
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255, 255, 255, 0.12)',
        },
        head: {
          backgroundColor: '#0d1117',
          color: '#4fc3f7',
          fontWeight: 700,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(79, 195, 247, 0.08)',
          },
        },
      },
    },
  },
};

export default darkTheme;