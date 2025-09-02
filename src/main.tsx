import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import InputApp from './components/Input/InputApp.tsx'
import TranslationApp from './components/Output/TranslationApp.tsx'
import theme from './theme/theme'
import './index.css'

const getAppComponent = () => {
  const port = window.location.port
  
  if (port === '5173') {
    return <InputApp />
  } else {
    return <TranslationApp />
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {getAppComponent()}
    </ThemeProvider>
  </React.StrictMode>,
)
