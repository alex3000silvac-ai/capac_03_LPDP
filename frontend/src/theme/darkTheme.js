export const darkTheme = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#4f46e5',
      light: '#6366f1',
      dark: '#3730a3',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6b7280',
      light: '#9ca3af',
      dark: '#4b5563',
      contrastText: '#ffffff',
    },
    background: {
      default: '#111827',
      paper: '#1f2937',
      surface: '#374151',
      elevated: '#1f2937',
    },
    text: {
      primary: '#f9fafb',
      secondary: '#d1d5db',
      disabled: '#9ca3af',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
      bg: 'rgba(239, 68, 68, 0.2)',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
      bg: 'rgba(245, 158, 11, 0.2)',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
      bg: 'rgba(16, 185, 129, 0.2)',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
      bg: 'rgba(59, 130, 246, 0.2)',
    },
    divider: '#374151',
    border: {
      main: '#374151',
      light: '#4b5563',
      dark: '#1f2937',
    },
    hover: {
      background: 'rgba(79, 70, 229, 0.08)',
      border: '#4f46e5',
    },
    action: {
      hover: 'rgba(79, 70, 229, 0.08)',
      selected: 'rgba(79, 70, 229, 0.12)',
      disabled: '#6b7280',
      disabledBackground: '#374151',
    },
    icons: {
      blue: '#60a5fa',
      yellow: '#fbbf24',
      teal: '#2dd4bf',
      purple: '#a78bfa',
      red: '#f87171',
      green: '#34d399',
      gray: '#9ca3af',
    }
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    h1: {
      color: '#f9fafb',
      fontWeight: 700,
    },
    h2: {
      color: '#f9fafb',
      fontWeight: 700,
    },
    h3: {
      color: '#f9fafb',
      fontWeight: 600,
    },
    h4: {
      color: '#f9fafb',
      fontWeight: 600,
    },
    h5: {
      color: '#f9fafb',
      fontWeight: 600,
    },
    h6: {
      color: '#f9fafb',
      fontWeight: 600,
    },
    body1: {
      color: '#d1d5db',
    },
    body2: {
      color: '#9ca3af',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#111827',
          color: '#d1d5db',
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#4b5563',
            borderRadius: '10px',
            border: '2px solid #1f2937',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#6b7280',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1f2937',
          backgroundImage: 'none',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
          border: '1px solid #374151',
          color: '#d1d5db',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1f2937',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
          border: '1px solid #374151',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            borderColor: '#4f46e5',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '0.5rem',
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          backgroundColor: '#4f46e5',
          color: '#ffffff',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#3730a3',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
          '&.Mui-disabled': {
            backgroundColor: '#374151',
            color: '#6b7280',
          },
        },
        outlined: {
          borderColor: '#374151',
          color: '#d1d5db',
          '&:hover': {
            backgroundColor: 'rgba(79, 70, 229, 0.08)',
            borderColor: '#4f46e5',
            color: '#f9fafb',
          },
        },
        text: {
          color: '#d1d5db',
          '&:hover': {
            backgroundColor: 'rgba(79, 70, 229, 0.08)',
            color: '#f9fafb',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            backgroundColor: '#374151',
            borderRadius: '0.5rem',
            color: '#f9fafb',
          },
          '& .MuiInputBase-input': {
            color: '#f9fafb',
            '&::placeholder': {
              color: '#6b7280',
              opacity: 1,
            },
          },
          '& .MuiInputLabel-root': {
            color: '#9ca3af',
            fontSize: '0.875rem',
            fontWeight: 500,
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#4b5563',
          },
          '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#6b7280',
          },
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#4f46e5',
            borderWidth: '2px',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#4f46e5',
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundColor: '#1f2937',
          borderRadius: '0.5rem',
          border: '1px solid #374151',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#374151',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#374151',
          color: '#f9fafb',
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          padding: '0.75rem 1.5rem',
          borderBottom: '1px solid #4b5563',
        },
        body: {
          borderColor: '#374151',
          padding: '1rem 1.5rem',
          fontSize: '0.875rem',
          color: '#d1d5db',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          backgroundColor: '#1f2937',
          borderBottom: '1px solid #374151',
          '&:hover': {
            backgroundColor: '#374151',
          },
          '&:last-child td': {
            borderBottom: 'none',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1f2937',
          color: '#f9fafb',
          borderBottom: '1px solid #374151',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.75rem',
          borderRadius: '0.375rem',
        },
        filled: {
          backgroundColor: '#374151',
          color: '#d1d5db',
          '&.MuiChip-colorPrimary': {
            backgroundColor: 'rgba(79, 70, 229, 0.2)',
            color: '#a78bfa',
          },
          '&.MuiChip-colorSuccess': {
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            color: '#34d399',
          },
          '&.MuiChip-colorError': {
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            color: '#f87171',
          },
          '&.MuiChip-colorWarning': {
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            color: '#fbbf24',
          },
          '&.MuiChip-colorInfo': {
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            color: '#60a5fa',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
        },
        standardSuccess: {
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          color: '#34d399',
          '& .MuiAlert-icon': {
            color: '#34d399',
          },
        },
        standardError: {
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          color: '#f87171',
          '& .MuiAlert-icon': {
            color: '#f87171',
          },
        },
        standardWarning: {
          backgroundColor: 'rgba(245, 158, 11, 0.2)',
          color: '#fbbf24',
          '& .MuiAlert-icon': {
            color: '#fbbf24',
          },
        },
        standardInfo: {
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          color: '#60a5fa',
          '& .MuiAlert-icon': {
            color: '#60a5fa',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1f2937',
          backgroundImage: 'none',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: '#f9fafb',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          color: '#d1d5db',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          backgroundColor: '#374151',
          color: '#f9fafb',
        },
        icon: {
          color: '#9ca3af',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: '#d1d5db',
          '&:hover': {
            backgroundColor: '#374151',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(79, 70, 229, 0.2)',
            '&:hover': {
              backgroundColor: 'rgba(79, 70, 229, 0.3)',
            },
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#374151',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#9ca3af',
          '&:hover': {
            backgroundColor: 'rgba(79, 70, 229, 0.08)',
            color: '#d1d5db',
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: '#4f46e5',
            '& + .MuiSwitch-track': {
              backgroundColor: '#4f46e5',
            },
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#6b7280',
          '&.Mui-checked': {
            color: '#4f46e5',
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: '#6b7280',
          '&.Mui-checked': {
            color: '#4f46e5',
          },
        },
      },
    },
  },
};

export default darkTheme;