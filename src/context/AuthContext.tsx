import React, { createContext, useContext, useEffect, useState } from 'react'
import { me, logout as apiLogout } from '../api/auth'
import { getAccessToken, clearTokens } from '../lib/auth'

type User = any

type AuthContextValue = {
  user: User | null
  loading: boolean
  refreshUser: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }){
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    (async () => {
      await refreshUser()
      setLoading(false)
    })()
  }, [])

  async function refreshUser(){
    const token = getAccessToken()
    if (!token){
      setUser(null)
      return
    }
    try{
      const res = await me()
      setUser(res?.data ?? null)
    }catch(e){
      // token might be invalid, clear and stay unauthenticated
      setUser(null)
    }
  }

  function logout(){
    apiLogout()
    clearTokens()
    setUser(null)
    // Navigation is handled by caller
  }

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(){
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
