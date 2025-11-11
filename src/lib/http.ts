import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './auth'

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || ''
console.log('🔧 API Base URL:', API_BASE_URL)

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

let isRefreshing = false
let refreshSubscribers: ((token: string | null)=>void)[] = []

function subscribeTokenRefresh(cb: (token: string | null)=>void){
  refreshSubscribers.push(cb)
}

function onRefreshed(token: string | null){
  refreshSubscribers.forEach(cb => cb(token))
  refreshSubscribers = []
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(response => response, async (error: AxiosError) => {
  const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
  
  // Check if this is a 401 error and not already retried
  if (error.response && error.response.status === 401 && !originalRequest._retry){
    // Don't retry refresh endpoint itself to avoid infinite loop
    const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh')
    
    if (isRefreshEndpoint) {
      // Refresh token itself failed (401 from refresh endpoint)
      // This means refresh token is expired, so logout
      clearTokens()
      window.location.href = '/login'
      return Promise.reject(error)
    }
    
    originalRequest._retry = true
    
    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          if (token) {
            if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(api(originalRequest))
          } else {
            // Refresh failed, reject the queued request
            reject(error)
          }
        })
      })
    }

    isRefreshing = true
    try {
      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        console.warn('No refresh token available - redirecting to login')
        clearTokens()
        window.location.href = '/login'
        throw new Error('No refresh token available')
      }
      
      // Try to refresh the access token
      const resp = await api.post('/api/v1/auth/refresh', { refreshToken })
      const data = (resp.data && resp.data.data) || null
      
      if (data && data.accessToken) {
        // Successfully refreshed
        setTokens(data.accessToken, data.refreshToken ?? refreshToken)
        onRefreshed(data.accessToken)
        
        // Retry the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        }
        return api(originalRequest)
      } else {
        // No valid token in response
        throw new Error('Invalid refresh response')
      }
    } catch (refreshError: any) {
      // Refresh failed (either 401 or network error)
      clearTokens()
      onRefreshed(null)
      
      // Check if refresh returned 401 (expired refresh token)
      if (refreshError.response && refreshError.response.status === 401) {
        // Refresh token expired, redirect to login
        window.location.href = '/login'
      }
      
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
  // Log and provide clearer info for server (5xx) errors to aid debugging
  if (error.response && error.response.status >= 500) {
    try {
      console.error('[API][5xx] URL:', error.config?.url, 'Status:', error.response.status, 'Data:', error.response.data)
    } catch (e) {
      console.error('[API][5xx] Error logging failed', e)
    }
  }

  return Promise.reject(error)
})

export default api
