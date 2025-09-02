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
			main: '#D2B48C',      // Light tan - much lighter and more readable
			light: '#E6D3B7',
			dark: '#B8946F',
		},
		secondary: {
			main: '#BCAAA4',      // Light gray-brown - subtle and elegant
			light: '#D7CCC8',
			dark: '#A1887F',
		},
		background: {
			default: '#0A1128',   // Dark neutral blue
			paper: '#1A2332',     // Slightly lighter blue-gray
		},
		text: {
			primary: '#F5F5DC',   // Warm off-white - excellent contrast
			secondary: '#D2B48C', // Tan - still readable
		},
		action: {
			active: '#D2B48C',
			selected: '#D2B48C',
			focus: '#D2B48C',
		},
		success: {
			main: '#4CAF50',      // Green for success states
		},
		error: {
			main: '#F44336',      // Red for errors
		},
		warning: {
			main: '#FF9800',      // Orange for warnings
		},
		info: {
			main: '#64B5F6',      // Light blue for info
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
