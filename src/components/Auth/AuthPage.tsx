import React, { useState } from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import TOTPForgotPasswordForm from './TOTPForgotPasswordForm'
import EmailForgotPasswordForm from './EmailForgotPasswordForm'

type AuthMode = 'login' | 'register' | 'totp-forgot-password' | 'email-forgot-password'

const AuthPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login')

  const switchToLogin = () => setAuthMode('login')
  const switchToRegister = () => setAuthMode('register')
  const switchToTOTPForgotPassword = () => setAuthMode('totp-forgot-password')
  const switchToEmailForgotPassword = () => setAuthMode('email-forgot-password')

  return (
    <>
      {authMode === 'login' ? (
        <LoginForm 
          onSwitchToRegister={switchToRegister} 
          onTOTPForgotPassword={switchToTOTPForgotPassword}
          onEmailForgotPassword={switchToEmailForgotPassword}
        />
      ) : authMode === 'register' ? (
        <RegisterForm onSwitchToLogin={switchToLogin} />
      ) : authMode === 'totp-forgot-password' ? (
        <TOTPForgotPasswordForm onBackToLogin={switchToLogin} />
      ) : (
        <EmailForgotPasswordForm 
          open={true} 
          onClose={switchToLogin} 
          onSuccess={switchToLogin} 
        />
      )}
    </>
  )
}

export default AuthPage
