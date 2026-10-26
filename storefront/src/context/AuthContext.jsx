import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { TOKEN_KEY, setOnUnauthorized } from '../api/client'
import { login as loginRequest, registerCustomer } from '../api/auth'

const USER_KEY = 'manoharam_user'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))

  const persistSession = useCallback((nextToken, nextUser) => {
    localStorage.setItem(TOKEN_KEY, nextToken)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    setToken(nextToken)
    setUser(nextUser)
  }, [])

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  // If any API call comes back 401 (missing/invalid/expired JWT), drop the
  // session so the UI falls back to the logged-out state and re-prompts login.
  useEffect(() => {
    setOnUnauthorized(() => clearSession())
  }, [clearSession])

  const login = useCallback(
    async (email, password) => {
      const data = await loginRequest({ email, password })
      if (data.success) {
        persistSession(data.token, data.user)
      }
      return data
    },
    [persistSession]
  )

  const register = useCallback(async (payload) => {
    // register.php does not return a token — by design the user must log in
    // afterwards. We surface that clearly to the calling UI.
    return registerCustomer(payload)
  }, [])

  const logout = useCallback(() => {
    clearSession()
  }, [clearSession])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === 'ADMIN',
      login,
      register,
      logout,
    }),
    [user, token, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
