import React, { createContext, useContext, useState } from 'react'
import type { User } from '../api/client'

type AuthContextType = {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  setUser: (u: User | null) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => {
    try {
      const s = typeof window !== 'undefined' ? localStorage.getItem('user') : null
      return s ? JSON.parse(s) : null
    } catch { return null }
  })
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== 'undefined' ? localStorage.getItem('token') : null
  )

  const setUser = (u: User | null) => {
    setUserState(u)
    if (u) localStorage.setItem('user', JSON.stringify(u))
    else localStorage.removeItem('user')
  }

  const login = (t: string, u: User) => {
    setToken(t)
    setUser(u)
    localStorage.setItem('token', t)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
