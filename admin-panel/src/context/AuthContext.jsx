import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { TOKEN_KEY, setOnUnauthorized } from '../api/client'
import { login as loginRequest } from '../api/auth'

const USER_KEY = 'manoharam_admin_user'

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

  useEffect(() => {
    setOnUnauthorized(() => clearSession())
  }, [clearSession])

  const login = useCallback(
    async (email, password) => {
      const data = await loginRequest({ email, password })

      if (data.success) {
        // The backend has one shared login.php for both customers and
        // admins — there's no separate admin login route. We enforce the
        // ADMIN-only rule here on the frontend after a successful login.
        if (data.user.role !== 'ADMIN') {
          return {
            success: false,
            message: 'This account does not have admin access.',
          }
        }
        persistSession(data.token, data.user)
      }

      return data
    },
    [persistSession]
  )

  const logout = useCallback(() => {
    clearSession()
  }, [clearSession])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
    }),
    [user, token, login, logout]
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
