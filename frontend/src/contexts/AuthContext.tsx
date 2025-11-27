import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  user: string | null
  login: (username: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is already logged in (from sessionStorage)
    const savedAuth = sessionStorage.getItem('pd-smartdoc-auth')
    if (savedAuth) {
      const authData = JSON.parse(savedAuth)
      setIsAuthenticated(true)
      setUser(authData.user)
    }
  }, [])

  const login = (username: string, password: string): boolean => {
    // Hardcoded credentials for PoC
    if (username === 'stellantis' && password === 'stellantis_pass') {
      setIsAuthenticated(true)
      setUser(username)
      // Store in sessionStorage
      sessionStorage.setItem('pd-smartdoc-auth', JSON.stringify({ user: username }))
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
    sessionStorage.removeItem('pd-smartdoc-auth')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

