import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  login: string
  name: string
  avatar_url: string
}

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  token: string | null
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || 'Iv1.8e55d7dd8f6a9fff'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('github_token')
    const storedUser = localStorage.getItem('github_user')

    if (storedToken) {
      setToken(storedToken)
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
          setIsAuthenticated(true)
        } catch {
          localStorage.removeItem('github_token')
          localStorage.removeItem('github_user')
        }
      }
    }
    setIsLoading(false)
  }, [])

  const generateCodeVerifier = () => {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  const generateCodeChallenge = async (verifier: string) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(verifier)
    const digest = await crypto.subtle.digest('SHA-256', data)
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  const login = async () => {
    const codeVerifier = generateCodeVerifier()
    const codeChallenge = await generateCodeChallenge(codeVerifier)

    localStorage.setItem('code_verifier', codeVerifier)

    // Build redirect URI - use origin + /callback
    const redirectUri = `${window.location.origin}/callback`

    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: redirectUri,
      scope: 'repo user',
      response_type: 'code',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    })

    window.location.href = `https://github.com/login/oauth/authorize?${params}`
  }

  const logout = () => {
    localStorage.removeItem('github_token')
    localStorage.removeItem('github_user')
    localStorage.removeItem('code_verifier')
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user, token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
