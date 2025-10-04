import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface UserCodeContextType {
  userCode: string | null
  setUserCode: (code: string) => void
  clearUserCode: () => void
}

const UserCodeContext = createContext<UserCodeContextType | undefined>(undefined)

interface UserCodeProviderProps {
  children: ReactNode
}

export const UserCodeProvider: React.FC<UserCodeProviderProps> = ({ children }) => {
  const [userCode, setUserCodeState] = useState<string | null>(null)

  // Load user code from localStorage on mount
  useEffect(() => {
    const storedUserCode = localStorage.getItem('scribeUserCode')
    if (storedUserCode) {
      // Validate user code format (3-8 alphanumeric characters)
      if (/^[A-Z0-9]{3,8}$/.test(storedUserCode)) {
        setUserCodeState(storedUserCode)
        console.log('🔗 UserCodeContext - Loaded user code from localStorage:', storedUserCode)
      } else {
        console.log('🔗 UserCodeContext - Invalid user code format, clearing:', storedUserCode)
        localStorage.removeItem('scribeUserCode')
        setUserCodeState(null)
      }
    }
  }, [])

  // Store user code in localStorage when it changes
  useEffect(() => {
    if (userCode) {
      localStorage.setItem('scribeUserCode', userCode)
    } else {
      localStorage.removeItem('scribeUserCode')
    }
  }, [userCode])

  const setUserCode = (code: string): void => {
    // Validate user code format
    if (!/^[A-Z0-9]{3,8}$/.test(code)) {
      console.error('🔗 UserCodeContext - Invalid user code format:', code)
      return
    }
    console.log('🔗 UserCodeContext - Setting user code:', code)
    setUserCodeState(code)
  }

  const clearUserCode = (): void => {
    console.log('🔗 UserCodeContext - Clearing user code')
    setUserCodeState(null)
    localStorage.removeItem('scribeUserCode')
  }

  const value: UserCodeContextType = {
    userCode,
    setUserCode,
    clearUserCode,
  }

  return <UserCodeContext.Provider value={value}>{children}</UserCodeContext.Provider>
}

export const useUserCode = (): UserCodeContextType => {
  const context = useContext(UserCodeContext)
  if (context === undefined) {
    throw new Error('useUserCode must be used within a UserCodeProvider')
  }
  return context
}

export const SessionProvider = UserCodeProvider
export const useSession = useUserCode
export default UserCodeContext
