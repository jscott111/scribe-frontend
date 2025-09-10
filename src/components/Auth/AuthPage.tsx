import React, { useState } from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import TOTPForgotPasswordForm from './TOTPForgotPasswordForm'

type AuthMode = 'login' | 'register' | 'totp-forgot-password'

const AuthPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login')

  const switchToLogin = () => setAuthMode('login')
  const switchToRegister = () => setAuthMode('register')
  const switchToTOTPForgotPassword = () => setAuthMode('totp-forgot-password')

  return (
    <>
      {authMode === 'login' ? (
        <LoginForm 
          onSwitchToRegister={switchToRegister} 
          onTOTPForgotPassword={switchToTOTPForgotPassword}
        />
      ) : authMode === 'register' ? (
        <RegisterForm onSwitchToLogin={switchToLogin} />
      ) : (
        <TOTPForgotPasswordForm onBackToLogin={switchToLogin} />
      )}
    </>
  )
}

export default AuthPage
