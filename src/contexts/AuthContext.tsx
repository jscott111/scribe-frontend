import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { hashPassword } from '../utils/passwordHash'

interface User {
  id: number
  email: string
  name: string
  createdAt: string
  updatedAt?: string
}

interface AuthTokens {
  accessToken: string
  refreshToken: string
}

interface AuthContextType {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<boolean>
  updateTokens: (newTokens: AuthTokens) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [tokens, setTokens] = useState<AuthTokens | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user && !!tokens

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedTokens = localStorage.getItem('authTokens')
        const storedUser = localStorage.getItem('authUser')
        
        if (storedTokens && storedUser) {
          const parsedTokens = JSON.parse(storedTokens)
          const parsedUser = JSON.parse(storedUser)
          
          try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'https://api.scribe-ai.ca'}/auth/me`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${parsedTokens.accessToken}`
              }
            })
            
            if (response.ok) {
              setTokens(parsedTokens)
              setUser(parsedUser)
            } else {
              console.log('Token validation failed, attempting refresh...')
              const refreshSuccess = await refreshTokenWithTokens(parsedTokens)
              if (!refreshSuccess) {
                localStorage.removeItem('authTokens')
                localStorage.removeItem('authUser')
              }
            }
          } catch (error) {
            console.error('Error validating token:', error)
            localStorage.removeItem('authTokens')
            localStorage.removeItem('authUser')
          }
        }
      } catch (error) {
        console.error('Error loading stored auth:', error)
        localStorage.removeItem('authTokens')
        localStorage.removeItem('authUser')
      } finally {
        setIsLoading(false)
      }
    }

    loadStoredAuth()
  }, [])

  const refreshTokenWithTokens = async (tokens: AuthTokens): Promise<boolean> => {
    if (!tokens?.refreshToken) {
      return false
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'https://api.scribe-ai.ca'}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data = await response.json()
      setTokens(data.tokens)
      return true
    } catch (error) {
      console.error('Token refresh error:', error)
      return false
    }
  }

  useEffect(() => {
    if (tokens && user) {
      localStorage.setItem('authTokens', JSON.stringify(tokens))
      localStorage.setItem('authUser', JSON.stringify(user))
    } else {
      localStorage.removeItem('authTokens')
      localStorage.removeItem('authUser')
    }
  }, [tokens, user])

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'https://api.scribe-ai.ca'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Login failed')
      }

      const data = await response.json()
      setUser(data.user)
      setTokens(data.tokens)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (email: string, password: string, name: string): Promise<void> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'https://api.scribe-ai.ca'}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Registration failed')
      }

      const data = await response.json()
      setUser(data.user)
      setTokens(data.tokens)
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const logout = (): void => {
    setUser(null)
    setTokens(null)
    localStorage.removeItem('authTokens')
    localStorage.removeItem('authUser')
  }

  const refreshToken = async (): Promise<boolean> => {
    if (!tokens?.refreshToken) {
      return false
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'https://api.scribe-ai.ca'}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data = await response.json()
      setTokens(data.tokens)
      return true
    } catch (error) {
      console.error('Token refresh error:', error)
      logout()
      return false
    }
  }

  const updateTokens = (newTokens: AuthTokens): void => {
    setTokens(newTokens)
    localStorage.setItem('authTokens', JSON.stringify(newTokens))
  }

  const value: AuthContextType = {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    updateTokens,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
