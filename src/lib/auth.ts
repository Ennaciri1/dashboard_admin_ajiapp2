const ACCESS_KEY = 'aji_access_token'
const REFRESH_KEY = 'aji_refresh_token'

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

export function clearTokens(){
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}
