// 🎨 PALETA DE COLORES CENTRALIZADA - SIN HARDCODEO
// Todos los colores del sistema en un solo lugar

export const COLORS = {
  // Paleta Principal
  primary: {
    main: '#00bcd4',      // Cyan principal
    light: '#33d9f0',     // Cyan claro
    dark: '#00838f',      // Cyan oscuro
    contrastText: '#000000'
  },

  // Paleta Secundaria  
  secondary: {
    main: '#ff9800',      // Naranja
    light: '#ffb74d',
    dark: '#f57c00',
    contrastText: '#000000'
  },

  // Fondos
  background: {
    default: '#0a0a0a',   // Fondo principal muy oscuro
    paper: '#1a1a1a',     // Fondo componentes
    surface: '#2a2a2a',   // Superficie elementos
    elevated: '#3a3a3a'   // Elementos elevados
  },

  // Textos
  text: {
    primary: '#ffffff',   // Texto principal
    secondary: '#b0b0b0', // Texto secundario
    disabled: '#666666'   // Texto deshabilitado
  },

  // Bordes y divisores
  divider: '#333333',
  border: {
    light: '#444444',
    medium: '#555555',
    strong: '#666666'
  },

  // Estados semánticos
  semantic: {
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c'
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d', 
      dark: '#f57c00'
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f'
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2'
    }
  }
};

// Utilidades para crear variaciones
export const withOpacity = (color, opacity) => `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;

export const rgba = (color, opacity) => {
  // Convierte hex a rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Colores frecuentemente usados con variaciones de opacidad
export const COMMON_COLORS = {
  primaryWithOpacity: {
    10: rgba(COLORS.primary.main, 0.1),
    20: rgba(COLORS.primary.main, 0.2),
    30: rgba(COLORS.primary.main, 0.3),
    40: rgba(COLORS.primary.main, 0.4)
  },
  backgroundWithOpacity: {
    50: rgba(COLORS.background.paper, 0.5),
    80: rgba(COLORS.background.default, 0.8),
    90: rgba(COLORS.background.default, 0.9)
  }
};

export default COLORS;