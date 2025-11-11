import api from '../lib/http'

export type NameTranslations = { en: string; ar?: string; fr?: string; es?: string }

export type Contact = {
  id: string
  nameTranslations: NameTranslations
  link: string
  icon?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

export async function getContacts(isActive?: boolean){
  const params: any = {}
  if (typeof isActive === 'boolean') params.isActive = isActive
  const res = await api.get('/api/v1/contacts', { params })
  return res.data
}

export async function getAdminContacts(isActive?: boolean){
  const params: any = {}
  if (typeof isActive === 'boolean') params.isActive = isActive
  const res = await api.get('/api/v1/contacts/admin', { params })
  return res.data
}

export async function createContact(payload: { nameTranslations: NameTranslations; link: string; icon?: string; isActive?: boolean }){
  const res = await api.post('/api/v1/contacts', payload)
  return res.data
}

export async function updateContact(id: string, payload: { nameTranslations?: Partial<NameTranslations>; link?: string; icon?: string; isActive?: boolean }){
  const res = await api.put(`/api/v1/contacts/${id}`, payload)
  return res.data
}

export async function deleteContact(id: string){
  const res = await api.delete(`/api/v1/contacts/${id}`)
  return res.data
}
