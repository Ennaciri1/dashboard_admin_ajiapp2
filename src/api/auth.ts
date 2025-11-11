import api from '../lib/http'
import { setTokens, clearTokens } from '../lib/auth'

type LoginPayload = { email: string; password: string }

function extractTokens(raw: any){
  const body = raw ?? {}
  const d = body.data ?? body
  const accessToken = d?.accessToken ?? d?.token ?? d?.access_token ?? body?.accessToken ?? null
  const refreshToken = d?.refreshToken ?? d?.refresh_token ?? body?.refreshToken ?? null
  return { accessToken, refreshToken }
}

export async function login(payload: LoginPayload){
  const res = await api.post('/api/v1/auth/login', payload)
  const { accessToken, refreshToken } = extractTokens(res.data)
  
  console.log('Login response tokens:', { 
    hasAccessToken: !!accessToken, 
    hasRefreshToken: !!refreshToken,
    responseStructure: Object.keys(res.data || {})
  })
  
  if (accessToken) {
    setTokens(accessToken, refreshToken ?? undefined)
  } else {
    // Surface a consistent error for the UI if tokens are missing
    throw new Error('Login succeeded but no access token was returned by the server.')
  }
  return res.data
}

export async function refresh(refreshToken: string){
  const res = await api.post('/api/v1/auth/refresh', { refreshToken })
  const { accessToken, refreshToken: newRefresh } = extractTokens(res.data)
  if (accessToken) setTokens(accessToken, newRefresh ?? undefined)
  return { accessToken, refreshToken: newRefresh }
}

export async function me(){
  const res = await api.get('/api/v1/auth/me')
  return res.data
}

export function logout(){
  clearTokens()
}
