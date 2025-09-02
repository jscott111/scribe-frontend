import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SessionContextType {
  sessionId: string | null
  generateSessionId: () => string
  setSessionId: (id: string) => void
  clearSessionId: () => void
  forceNewSessionId: () => string
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

interface SessionProviderProps {
  children: ReactNode
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [sessionId, setSessionIdState] = useState<string | null>(null)

  // Load session ID from localStorage on mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem('scribeSessionId')
    if (storedSessionId) {
      // Check if the stored session ID is in the old format (longer than 8 characters)
      if (storedSessionId.length > 8) {
        console.log('🔗 SessionContext - Found old format session ID, clearing:', storedSessionId)
        localStorage.removeItem('scribeSessionId')
        setSessionIdState(null)
      } else {
        setSessionIdState(storedSessionId)
        console.log('🔗 SessionContext - Loaded session from localStorage:', storedSessionId)
      }
    }
  }, [])

  // Store session ID in localStorage when it changes
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('scribeSessionId', sessionId)
    } else {
      localStorage.removeItem('scribeSessionId')
    }
  }, [sessionId])

  const generateSessionId = (): string => {
    const timestamp = Date.now().toString(36).slice(-4) // Last 4 chars of timestamp in base36
    const random = Math.random().toString(36).substr(2, 4) // 4 random chars
    const newSessionId = `${timestamp}${random}`.toUpperCase()
    console.log('🔗 Generated new session ID:', newSessionId)
    setSessionIdState(newSessionId)
    return newSessionId
  }

  const setSessionId = (id: string): void => {
    setSessionIdState(id)
  }

  const clearSessionId = (): void => {
    console.log('🔗 SessionContext - Clearing session ID')
    setSessionIdState(null)
    localStorage.removeItem('scribeSessionId')
  }

  const forceNewSessionId = (): string => {
    console.log('🔗 SessionContext - Forcing new session ID generation')
    localStorage.removeItem('scribeSessionId')
    const newSessionId = generateSessionId()
    return newSessionId
  }

  const value: SessionContextType = {
    sessionId,
    generateSessionId,
    setSessionId,
    clearSessionId,
    forceNewSessionId,
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}

export default SessionContext
