import api from '../lib/http'
import { setTokens, clearTokens } from '../lib/auth'

type LoginPayload = { email: string; password: string }

/**
 * Extract tokens from API response
 * Handles different response structures from the backend
 * 
 * Login Response Structure:
 * - token (access token) - expires in 15 minutes
 * - refreshToken - expires in 7 days
 * - userId, email, roles, and other user data
 */
function extractTokens(raw: any){
  const body = raw ?? {}
  const d = body.data ?? body
  // Try multiple possible field names for access token
  const accessToken = d?.accessToken ?? d?.token ?? d?.access_token ?? body?.accessToken ?? body?.token ?? null
  // Try multiple possible field names for refresh token
  const refreshToken = d?.refreshToken ?? d?.refresh_token ?? body?.refreshToken ?? null
  return { accessToken, refreshToken }
}

/**
 * Login to the API
 * POST /api/v1/auth/login
 * 
 * Response includes:
 * - token (access token) - expires in 15 minutes
 * - refreshToken - expires in 7 days
 * - userId, email, roles, and other user data
 * 
 * @param payload - Login credentials (email and password)
 * @returns Login response with user data
 */
export async function login(payload: LoginPayload){
  try {
    const res = await api.post('/api/v1/auth/login', payload)
    const { accessToken, refreshToken } = extractTokens(res.data)
    
    console.log('Login response tokens:', { 
      hasAccessToken: !!accessToken, 
      hasRefreshToken: !!refreshToken,
      responseStructure: Object.keys(res.data || {})
    })
    
    if (accessToken) {
      // Store both tokens - access token (15 min) and refresh token (7 days)
      setTokens(accessToken, refreshToken ?? undefined)
    } else {
      // Surface a consistent error for the UI if tokens are missing
      throw new Error('Login succeeded but no access token was returned by the server.')
    }
    return res.data
  } catch (error: any) {
    // Log the full error for debugging
    console.error('Login API error:', error)
    console.error('Error response data:', error?.response?.data)
    
    // Re-throw the error so it can be handled by the caller
    // The error will include the backend response
    throw error
  }
}

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 * 
 * Body: { "refreshToken": "your-refresh-token" }
 * 
 * Response includes NEW access token AND NEW refresh token.
 * Store both and discard the old ones.
 * 
 * @param refreshToken - The current refresh token
 * @returns New access token and refresh token
 */
export async function refresh(refreshToken: string){
  const res = await api.post('/api/v1/auth/refresh', { refreshToken })
  const { accessToken, refreshToken: newRefresh } = extractTokens(res.data)
  
  if (accessToken) {
    // Store both new tokens - discard old ones
    // If new refresh token is provided, use it; otherwise keep the old one
    setTokens(accessToken, newRefresh ?? refreshToken)
  }
  
  return { accessToken, refreshToken: newRefresh }
}

/**
 * Get current user information
 * GET /api/v1/auth/me
 * 
 * Protected endpoint - requires valid access token
 * Authorization: Bearer {your-access-token}
 * 
 * @returns Current user data including userId, email, roles, etc.
 */
export async function me(){
  const res = await api.get('/api/v1/auth/me')
  return res.data
}

export function logout(){
  clearTokens()
}

/**
 * Change user password
 * POST /api/v1/auth/change-password
 * 
 * Protected endpoint - requires valid access token
 * Authorization: Bearer {your-access-token}
 * 
 * @param oldPassword - Current password
 * @param newPassword - New password
 * @returns Success response
 */
export async function changePassword(oldPassword: string, newPassword: string) {
  const res = await api.post('/api/v1/auth/change-password', {
    oldPassword,
    newPassword
  })
  return res.data
}

/**
 * Create Activity User (Admin only)
 * POST /api/v1/auth/users/activity
 * 
 * Protected endpoint - requires ADMIN role
 * Authorization: Bearer {your-access-token}
 * 
 * Creates a new activity operator account with ACTIVITY role.
 * Response returns tokens like register endpoint.
 * 
 * @param payload - Activity user creation data
 * @param payload.fullName - Full name of the activity operator
 * @param payload.email - Email address for login
 * @param payload.phoneNumber - Phone number of the operator
 * @param payload.password - Password for the account (minimum 6 characters)
 * @returns Response with user data and tokens
 */
export async function createActivityUser(payload: {
  fullName: string
  email: string
  phoneNumber: string
  password: string
}) {
  try {
    const res = await api.post('/api/v1/auth/users/activity', {
      fullName: payload.fullName.trim(),
      email: payload.email.trim(),
      phoneNumber: payload.phoneNumber.trim(),
      password: payload.password
    })
    
    // Extract data from response (handle different response structures)
    return res.data?.data || res.data
  } catch (error: any) {
    console.error('Create activity user API error:', error)
    console.error('Error response data:', error?.response?.data)
    
    // Re-throw the error so it can be handled by the caller
    throw error
  }
}
