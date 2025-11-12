const ACCESS_KEY = 'aji_access_token'
const REFRESH_KEY = 'aji_refresh_token'
const USER_ROLE_KEY = 'aji_user_role'

export function setTokens(accessToken: string, refreshToken?: string){
  localStorage.setItem(ACCESS_KEY, accessToken)
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
}

export function getAccessToken(){
  return localStorage.getItem(ACCESS_KEY)
}
export function getRefreshToken(){
  return localStorage.getItem(REFRESH_KEY)
}

export function setUserRole(role: string){
  localStorage.setItem(USER_ROLE_KEY, role)
}

export function getUserRole(){
  return localStorage.getItem(USER_ROLE_KEY)
}

export function isAdmin(): boolean {
  const role = getUserRole()
  return role === 'ADMIN'
}

export function clearTokens(){
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_ROLE_KEY)
}
