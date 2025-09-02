import React, { useState } from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

type AuthMode = 'login' | 'register'

const AuthPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login')

  const switchToLogin = () => setAuthMode('login')
  const switchToRegister = () => setAuthMode('register')

  return (
    <>
      {authMode === 'login' ? (
        <LoginForm onSwitchToRegister={switchToRegister} />
      ) : (
        <RegisterForm onSwitchToLogin={switchToLogin} />
      )}
    </>
  )
}

export default AuthPage
