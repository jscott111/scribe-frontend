import { createTheme, ThemeOptions } from '@mui/material/styles'

const typographyStyles = {
  appTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    color: 'primary.main',
    marginBottom: 2,
  },
  sectionHeader: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: 'text.primary',
    marginBottom: 1.5,
  },
  subsectionHeader: {
    fontSize: '1.25rem',
    fontWeight: '500',
    color: 'text.secondary',
    marginBottom: 1,
  },
  bodyText: {
    fontSize: '1rem',
    lineHeight: 1.6,
    color: 'text.primary',
  },
  captionText: {
    fontSize: '0.875rem',
    color: 'text.secondary',
    fontStyle: 'italic',
  },
  buttonText: {
    fontSize: '1rem',
    fontWeight: '500',
    textTransform: 'none' as const,
  },
  statusText: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: 'success.main',
  },
  errorText: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: 'error.main',
  },
}

const themeOptions: ThemeOptions = {
  palette: {
		mode: 'dark',
		primary: {
			main: '#9BB5D1',      // Light blue-gray - matches logo accent color
			light: '#B8CCE4',
			dark: '#7A9BC0',
		},
		secondary: {
			main: '#A8B8C8',      // Medium blue-gray - subtle and elegant
			light: '#C4D0DB',
			dark: '#8FA0B0',
		},
		background: {
			default: '#2C3E50',   // Dark blue-gray - matches logo background
			paper: '#34495E',     // Slightly lighter blue-gray
		},
		text: {
			primary: '#ECF0F1',   // Light gray - excellent contrast on dark background
			secondary: '#ECF0F1', // Light blue-gray - matches primary
		},
		action: {
			active: '#9BB5D1',
			selected: '#9BB5D1',
			focus: '#9BB5D1',
		},
		success: {
			main: '#27AE60',      // Green for success states
		},
		error: {
			main: '#E74C3C',      // Red for errors
		},
		warning: {
			main: '#F39C12',      // Orange for warnings
		},
		info: {
			main: '#3498DB',      // Blue for info
		},
	},
  
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    
    h1: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 'bold',
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: '600',
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: '600',
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: '500',
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: '500',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontSize: '1rem',
      fontWeight: '500',
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    },
  },
  
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        },
      },
    },
    
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: '500',
        },
      },
    },
  },
}

const theme = createTheme(themeOptions)

export { theme, typographyStyles }
export default theme
