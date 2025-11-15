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

/**
 * Token Expiration Times:
 * - Access token: 15 minutes (900000 ms)
 * - Refresh token: 7 days (604800000 ms)
 * When refresh token expires, user must login again
 */

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
  
  // Handle 401 Unauthorized - Token expired or invalid → Trigger refresh flow
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
      // POST /api/v1/auth/refresh
      // Body: { "refreshToken": "your-refresh-token" }
      // Response includes NEW access token AND NEW refresh token
      const resp = await api.post('/api/v1/auth/refresh', { refreshToken })
      
      // Extract tokens from response (handle different response structures)
      const responseData = resp.data || {}
      const data = responseData.data || responseData
      const newAccessToken = data.accessToken || data.token || data.access_token
      const newRefreshToken = data.refreshToken || data.refresh_token
      
      if (newAccessToken) {
        // Successfully refreshed - Store both new tokens and discard old ones
        setTokens(newAccessToken, newRefreshToken || refreshToken)
        onRefreshed(newAccessToken)
        
        // Retry the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        }
        return api(originalRequest)
      } else {
        // No valid token in response
        throw new Error('Invalid refresh response: no access token received')
      }
    } catch (refreshError: any) {
      // Refresh failed (either 401 or network error)
      clearTokens()
      onRefreshed(null)
      
      // Check if refresh returned 401 (expired refresh token)
      if (refreshError.response && refreshError.response.status === 401) {
        // Refresh token expired, redirect to login
        console.warn('Refresh token expired - redirecting to login')
        window.location.href = '/login'
      }
      
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
  
  // Handle 403 Forbidden - Valid token but insufficient permissions (wrong role)
  if (error.response && error.response.status === 403) {
    console.error('[API][403] Access forbidden - insufficient permissions')
    // You might want to show a specific error message to the user
    // or redirect to an unauthorized page
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
