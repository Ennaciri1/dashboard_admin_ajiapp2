import api from '../lib/http'

export type NameTranslations = { en: string; ar?: string; fr?: string; es?: string }

export type City = {
  id: string
  nameTranslations: NameTranslations
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

export async function getAdminCities(isActive?: boolean){
  const params: any = {}
  if (typeof isActive === 'boolean') params.isActive = isActive
  const res = await api.get('/api/v1/cities/admin', { params })
  return res.data
}

export async function createCity(payload: { nameTranslations: NameTranslations; isActive: boolean }){
  const res = await api.post('/api/v1/cities', payload)
  return res.data
}

export async function updateCity(id: string, payload: { nameTranslations?: Partial<NameTranslations>; isActive?: boolean }){
  const res = await api.put(`/api/v1/cities/${id}`, payload)
  return res.data
}

export async function deleteCity(id: string){
  const res = await api.delete(`/api/v1/cities/${id}`)
  return res.data
}
