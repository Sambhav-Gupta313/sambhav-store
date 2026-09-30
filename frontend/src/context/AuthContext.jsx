import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authApi, getAccessTokenExpiry, refreshAccessToken, setAccessToken, setAuthFailureHandler } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)

  const signOutLocal = () => {
    setAccessToken(null)
    setUser(null)
  }

  useEffect(() => {
    setAuthFailureHandler(signOutLocal)
    let cancelled = false

    refreshAccessToken()
      .then((token) => {
        if (!cancelled) {
          const exp = getAccessTokenExpiry(token)
          const email = token ? (() => {
            try {
              const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
              return payload.sub || null
            } catch { return null }
          })() : null
          setUser(email ? { email, exp } : { email: null, exp })
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setInitializing(false) })

    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!user?.exp) return undefined
    const delay = Math.max(5000, user.exp - Date.now() - 60_000)
    const timer = window.setTimeout(async () => {
      try {
        const token = await refreshAccessToken()
        const exp = getAccessTokenExpiry(token)
        setUser((current) => current ? { ...current, exp } : current)
      } catch {
        signOutLocal()
      }
    }, delay)
    return () => window.clearTimeout(timer)
  }, [user?.exp])

  const value = useMemo(() => ({
    user,
    initializing,
    isAuthenticated: Boolean(user),
    async login(email, password) {
      const response = await authApi.login({ userEmail: email, userPass: password })
      const token = response.data
      setUser({ email, exp: getAccessTokenExpiry(token) })
      return response
    },
    async register(email, password) {
      return authApi.register({ userEmail: email, userPass: password })
    },
    async logout() {
      try { await authApi.logout() } finally { signOutLocal() }
    },
  }), [user, initializing])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
