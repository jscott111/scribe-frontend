import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import InputApp from './components/Input/InputApp.tsx'
import TranslationApp from './components/Output/TranslationApp.tsx'
import AuthPage from './components/Auth/AuthPage.tsx'
import ResetPasswordPage from './components/Auth/ResetPasswordPage.tsx'
import ProtectedRoute from './components/Auth/ProtectedRoute.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { SessionProvider } from './contexts/SessionContext'
import theme from './theme/theme'
import './index.css'

const App = () => {
  const hostname = window.location.hostname
  const subdomain = hostname.split('.')[0]
  
  // Check if there's a reset token in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const hasResetToken = urlParams.get('token') !== null;
  
  if (subdomain === 'speaker') {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={
            <ProtectedRoute fallback={<AuthPage />}>
              <InputApp />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    )
  } else if (subdomain === 'listener') {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<TranslationApp />} />
        </Routes>
      </BrowserRouter>
    )
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
          <App />
        </AuthProvider>
      </SessionProvider>
    </ThemeProvider>
  </React.StrictMode>
)
