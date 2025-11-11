import api from '../lib/http'

export type SupportedLanguage = {
  id: string
  code: string
  name: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

export async function getSupportedLanguages(isActive?: boolean){
  const params: any = {}
  if (typeof isActive === 'boolean') params.isActive = isActive
  const res = await api.get('/api/v1/supported-languages', { params })
  return res.data
}

export async function getAdminSupportedLanguages(isActive?: boolean){
  const params: any = {}
  if (typeof isActive === 'boolean') params.isActive = isActive
  const res = await api.get('/api/v1/supported-languages/admin', { params })
  return res.data
}

export async function createSupportedLanguage(payload: { code: string; name: string; isActive: boolean }){
  const res = await api.post('/api/v1/supported-languages', payload)
  return res.data
}

export async function updateSupportedLanguage(id: string, payload: { code?: string; name?: string; isActive?: boolean }){
  const res = await api.put(`/api/v1/supported-languages/${id}`, payload)
  return res.data
}

export async function deleteSupportedLanguage(id: string){
  const res = await api.delete(`/api/v1/supported-languages/${id}`)
  return res.data
}
