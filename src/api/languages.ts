import api from '../lib/http'
import { cachedApiCall, cache, CACHE_DURATIONS, CACHE_KEYS } from '../lib/cache'

export type SupportedLanguage = {
  id: string
  code: string
  name: string
  active: boolean
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

export async function getSupportedLanguages(active?: boolean){
  return cachedApiCall(
    CACHE_KEYS.languages(active),
    async () => {
  const params: any = {}
  if (typeof active === 'boolean') params.active = active
  const res = await api.get('/api/v1/supported-languages', { params })
      return res.data.data || res.data
    },
    CACHE_DURATIONS.LANGUAGES
  )
}

export async function getAdminSupportedLanguages(active?: boolean){
  return cachedApiCall(
    CACHE_KEYS.languages(active),
    async () => {
  const params: any = {}
  if (typeof active === 'boolean') params.active = active
  const res = await api.get('/api/v1/supported-languages/admin', { params })
      return res.data.data || res.data
    },
    CACHE_DURATIONS.LANGUAGES
  )
}

export async function createSupportedLanguage(payload: { code: string; name: string; active: boolean }){
  const res = await api.post('/api/v1/supported-languages', payload)
  cache.invalidateByPrefix('languages:')
  return res.data.data || res.data
}

export async function updateSupportedLanguage(id: string, payload: { code?: string; name?: string; active?: boolean }){
  const res = await api.put(`/api/v1/supported-languages/${id}`, payload)
  cache.invalidateByPrefix('languages:')
  return res.data.data || res.data
}

export async function deleteSupportedLanguage(id: string){
  const res = await api.delete(`/api/v1/supported-languages/${id}`)
  cache.invalidateByPrefix('languages:')
  return res.data.data || res.data
}
