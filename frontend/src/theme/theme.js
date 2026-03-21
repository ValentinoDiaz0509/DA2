import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1565C0',
      light: '#1976D2',
      dark: '#0D47A1',
      contrastText: '#fff',
    },
    secondary: {
      main: '#F57C00',
      light: '#FF9800',
      dark: '#E65100',
      contrastText: '#fff',
    },
    success: {
      main: '#4CAF50',
      light: '#66BB6A',
      dark: '#2E7D32',
      contrastText: '#fff',
    },
    warning: {
      main: '#FF9800',
      light: '#FFB74D',
      dark: '#E65100',
      contrastText: '#fff',
    },
    error: {
      main: '#F44336',
      light: '#EF5350',
      dark: '#C62828',
      contrastText: '#fff',
    },
    info: {
      main: '#2196F3',
      light: '#64B5F6',
      dark: '#1565C0',
      contrastText: '#fff',
    },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A237E',
      secondary: '#424242',
      disabled: '#9E9E9E',
    },
    divider: '#E0E0E0',
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#1A237E',
      letterSpacing: '-0.5px',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#1A237E',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#1A237E',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#1A237E',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#1A237E',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#1A237E',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      color: '#424242',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
      color: '#666666',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.95rem',
      letterSpacing: '0.3px',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 500,
      color: '#757575',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 2px 4px rgba(0, 0, 0, 0.08)',
    '0 4px 8px rgba(0, 0, 0, 0.1)',
    '0 8px 16px rgba(0, 0, 0, 0.12)',
    '0 12px 24px rgba(0, 0, 0, 0.15)',
    '0 16px 32px rgba(0, 0, 0, 0.18)',
    ...Array(19).fill('0 16px 32px rgba(0, 0, 0, 0.18)'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '0.95rem',
          fontWeight: 600,
          textTransform: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        containedPrimary: {
          backgroundColor: '#1565C0',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#0D47A1',
          },
        },
        containedError: {
          backgroundColor: '#F44336',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#C62828',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid #E0E0E0',
          '&:hover': {
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F5F7FA',
          '& th': {
            backgroundColor: '#F5F7FA',
            fontWeight: 700,
            color: '#1A237E',
            fontSize: '0.875rem',
            letterSpacing: '0.3px',
            textTransform: 'uppercase',
            borderBottom: '2px solid #E0E0E0',
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          '& tr': {
            borderBottom: '1px solid #E0E0E0',
            transition: 'background-color 0.2s ease',
            '&:hover': {
              backgroundColor: '#F9F9F9',
            },
          },
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          animation: 'pulse 2s infinite',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontSize: '0.95rem',
          fontWeight: 500,
        },
        standardError: {
          backgroundColor: '#FFEBEE',
          color: '#B71C1C',
          border: '1px solid #F44336',
        },
        standardWarning: {
          backgroundColor: '#FFF3E0',
          color: '#E65100',
          border: '1px solid #FF9800',
        },
        standardSuccess: {
          backgroundColor: '#E8F5E9',
          color: '#1B5E20',
          border: '1px solid #4CAF50',
        },
      },
    },
  },
});

// Estilos globales
export const globalStyles = `
  @keyframes pulse {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.1);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes slideInFromTop {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* Scrollbar personalizada */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #F5F7FA;
  }

  ::-webkit-scrollbar-thumb {
    background: #B0BEC5;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #78909C;
  }

  * {
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;
