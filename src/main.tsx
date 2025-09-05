import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import InputApp from './components/Input/InputApp.tsx'
import TranslationApp from './components/Output/TranslationApp.tsx'
import AuthPage from './components/Auth/AuthPage.tsx'
import ProtectedRoute from './components/Auth/ProtectedRoute.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { SessionProvider } from './contexts/SessionContext'
import theme from './theme/theme'
import './index.css'

const getAppComponent = () => {
  const hostname = window.location.hostname
  const subdomain = hostname.split('.')[0]
  
  if (subdomain === 'speaker') {
    return (
      <ProtectedRoute fallback={<AuthPage />}>
        <InputApp />
      </ProtectedRoute>
    )
  } else if (subdomain === 'listener') {
    return <TranslationApp />
  } else {
    return (<>404 - Not Found</>)
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SessionProvider>
        <AuthProvider>
          {getAppComponent()}
        </AuthProvider>
      </SessionProvider>
    </ThemeProvider>
  </React.StrictMode>
)
