import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { hashPassword } from '../utils/passwordHash'
import { CONFIG } from '../config/urls'

interface User {
  id: number
  email: string
  name: string
  userCode?: string
  createdAt: string
  updatedAt?: string
  totpEnabled?: boolean
}

interface AuthTokens {
  accessToken: string
  refreshToken: string
}

interface ConnectionInfo {
  userCode: string
  connectionUrl: string
  qrCodeUrl: string
  shareText: string
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
  generateUserCode: () => Promise<string>
  setUserCode: (userCode: string) => Promise<void>
  clearUserCode: () => Promise<void>
  getConnectionInfo: () => Promise<ConnectionInfo>
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

  const fetchUserData = async (accessToken: string): Promise<User | null> => {
    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        return data.user
      }
      return null
    } catch (error) {
      console.error('Error fetching user data:', error)
      return null
    }
  }

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedTokens = localStorage.getItem('authTokens')
        const storedUser = localStorage.getItem('authUser')
        
        if (storedTokens && storedUser) {
          const parsedTokens = JSON.parse(storedTokens)
          const parsedUser = JSON.parse(storedUser)
          
          try {
            const freshUserData = await fetchUserData(parsedTokens.accessToken)
            
            if (freshUserData) {
              setTokens(parsedTokens)
              setUser(freshUserData)
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
      const response = await fetch(`${CONFIG.BACKEND_URL}/auth/refresh`, {
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
      
      // Fetch fresh user data after token refresh
      const freshUserData = await fetchUserData(data.tokens.accessToken)
      if (freshUserData) {
        setUser(freshUserData)
      }
      
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

  useEffect(() => {
    if (!tokens?.accessToken) return

    const parseJWT = (token: string) => {
      try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        )
        return JSON.parse(jsonPayload)
      } catch (error) {
        console.error('Error parsing JWT:', error)
        return null
      }
    }

    const tokenData = parseJWT(tokens.accessToken)
    if (!tokenData?.exp) return

    const expirationTime = tokenData.exp * 1000
    const currentTime = Date.now()
    const timeUntilExpiry = expirationTime - currentTime

    const twoHoursInMs = 2 * 60 * 60 * 1000
    if (timeUntilExpiry > twoHoursInMs) {
      console.log(`🔄 Token expires in ${Math.round(timeUntilExpiry / 1000 / 60 / 60)} hours - no refresh needed yet`)
      return
    }

    const refreshTime = Math.max(timeUntilExpiry - (30 * 60 * 1000), 60000)

    console.log(`🔄 Token expires in ${Math.round(timeUntilExpiry / 1000 / 60)} minutes, will refresh in ${Math.round(refreshTime / 1000 / 60)} minutes`)

    const refreshTimer = setTimeout(async () => {
      console.log('🔄 Proactively refreshing token...')
      const success = await refreshToken()
      if (!success) {
        console.error('❌ Proactive token refresh failed')
        logout()
      }
    }, refreshTime)

    return () => {
      clearTimeout(refreshTimer)
    }
  }, [tokens?.accessToken])

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/auth/login`, {
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
      const response = await fetch(`${CONFIG.BACKEND_URL}/auth/register`, {
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
      const response = await fetch(`${CONFIG.BACKEND_URL}/auth/refresh`, {
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
      
      // Fetch fresh user data after token refresh
      const freshUserData = await fetchUserData(data.tokens.accessToken)
      if (freshUserData) {
        setUser(freshUserData)
      }
      
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

  const generateUserCode = async (): Promise<string> => {
    if (!tokens) {
      throw new Error('No authentication tokens available')
    }

    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/auth/generate-user-code`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate user code')
      }

      const data = await response.json()
      
      // Update user with new code
      if (user) {
        const updatedUser = { ...user, userCode: data.userCode }
        setUser(updatedUser)
      }

      return data.userCode
    } catch (error) {
      console.error('Generate user code error:', error)
      throw error
    }
  }

  const setUserCode = async (userCode: string): Promise<void> => {
    if (!tokens) {
      throw new Error('No authentication tokens available')
    }

    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/auth/set-user-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`
        },
        body: JSON.stringify({ userCode })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to set user code')
      }

      // Update user with new code
      if (user) {
        const updatedUser = { ...user, userCode }
        setUser(updatedUser)
      }
    } catch (error) {
      console.error('Set user code error:', error)
      throw error
    }
  }

  const clearUserCode = async (): Promise<void> => {
    if (!tokens) {
      throw new Error('No authentication tokens available')
    }

    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/auth/user-code`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to clear user code')
      }

      // Update user to remove code
      if (user) {
        const updatedUser = { ...user, userCode: undefined }
        setUser(updatedUser)
      }
    } catch (error) {
      console.error('Clear user code error:', error)
      throw error
    }
  }

  const getConnectionInfo = async (): Promise<ConnectionInfo> => {
    if (!tokens) {
      throw new Error('No authentication tokens available')
    }

    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/auth/connection-info`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get connection info')
      }

      return await response.json()
    } catch (error) {
      console.error('Get connection info error:', error)
      throw error
    }
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
    generateUserCode,
    setUserCode,
    clearUserCode,
    getConnectionInfo,
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
