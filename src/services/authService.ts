import { AuthTokens } from '../contexts/AuthContext'

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  message: string
  user: {
    id: number
    email: string
    name: string
    createdAt: string
  }
  tokens: AuthTokens
}

export interface ApiError {
  error: string
  code?: string
  details?: any[]
}

class AuthService {
  private getAuthHeaders(tokens: AuthTokens | null): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (tokens?.accessToken) {
      headers['Authorization'] = `Bearer ${tokens.accessToken}`
    }

    return headers
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const errorData: ApiError = await response.json()
      throw new Error(errorData.error || 'Login failed')
    }

    return response.json()
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const errorData: ApiError = await response.json()
      throw new Error(errorData.error || 'Registration failed')
    }

    return response.json()
  }

  async refreshToken(refreshToken: string): Promise<{ tokens: AuthTokens }> {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      const errorData: ApiError = await response.json()
      throw new Error(errorData.error || 'Token refresh failed')
    }

    return response.json()
  }

  async logout(tokens: AuthTokens | null): Promise<void> {
    if (!tokens) return

    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders(tokens),
      })
    } catch (error) {
      console.error('Logout error:', error)
      // Don't throw - logout should always succeed locally
    }
  }

  async getCurrentUser(tokens: AuthTokens | null): Promise<any> {
    if (!tokens) {
      throw new Error('No authentication tokens available')
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: this.getAuthHeaders(tokens),
    })

    if (!response.ok) {
      const errorData: ApiError = await response.json()
      throw new Error(errorData.error || 'Failed to get user info')
    }

    return response.json()
  }

  async updateProfile(tokens: AuthTokens | null, updates: { name?: string; email?: string }): Promise<any> {
    if (!tokens) {
      throw new Error('No authentication tokens available')
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(tokens),
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      const errorData: ApiError = await response.json()
      throw new Error(errorData.error || 'Profile update failed')
    }

    return response.json()
  }

  // Helper method to make authenticated API calls
  async authenticatedFetch(endpoint: string, options: RequestInit = {}, tokens: AuthTokens | null): Promise<Response> {
    if (!tokens) {
      throw new Error('No authentication tokens available')
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(tokens),
        ...options.headers,
      },
    })

    // If token is expired, try to refresh
    if (response.status === 403) {
      try {
        const refreshed = await this.refreshToken(tokens.refreshToken)
        // Retry the original request with new token
        return fetch(url, {
          ...options,
          headers: {
            ...this.getAuthHeaders({ ...tokens, accessToken: refreshed.tokens.accessToken }),
            ...options.headers,
          },
        })
      } catch (refreshError) {
        // Refresh failed, return original response
        return response
      }
    }

    return response
  }
}

export const authService = new AuthService()
export default authService
