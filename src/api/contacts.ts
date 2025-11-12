import api from '../lib/http'
import { cachedApiCall, cache, CACHE_DURATIONS, CACHE_KEYS } from '../lib/cache'

/**
 * Multi-language translation map
 * At least ONE supported language is required
 */
export type NameTranslations = Record<string, string>

/**
 * Contact entity
 * Matches API response from GET /api/v1/contacts/admin
 * 
 * Link formats:
 * - Email: mailto:email@example.com
 * - Phone: tel:+1234567890
 * - URL: https://example.com
 */
export type Contact = {
  id: string
  nameTranslations: NameTranslations
  link: string
  icon?: string
  active: boolean
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

export async function getContacts(active?: boolean){
  const params: any = {}
  if (typeof active === 'boolean') params.active = active
  const res = await api.get('/api/v1/contacts', { params })
  return res.data.data || res.data
}

export async function getAdminContacts(active?: boolean){
  return cachedApiCall(
    CACHE_KEYS.contacts(active),
    async () => {
      const params: any = {}
      if (typeof active === 'boolean') params.active = active
      const res = await api.get('/api/v1/contacts/admin', { params })
      return res.data.data || res.data
    },
    CACHE_DURATIONS.CONTACTS
  )
}

/**
 * Create a new contact
 * @param payload.nameTranslations - At least ONE supported language required
 * @param payload.link - Contact link (mailto:, tel:, https://, etc.) - required
 * @param payload.icon - Icon URL (optional)
 * @param payload.active - Active status (optional, defaults to true)
 * 
 * API Rules:
 * - At least one supported language translation is required
 * - Multiple languages can be provided during creation
 */
export async function createContact(payload: { 
  nameTranslations: NameTranslations
  link: string
  icon?: string
  active?: boolean 
}){
  const res = await api.post('/api/v1/contacts', payload)
  cache.invalidateByPrefix('contacts:')
  return res.data.data || res.data
}

/**
 * Update an existing contact
 * @param id - Contact ID
 * @param payload - Partial update payload
 * 
 * API Rules:
 * - All fields are optional
 * - Only provided translations will be updated
 */
export async function updateContact(id: string, payload: { 
  nameTranslations?: NameTranslations
  link?: string
  icon?: string
  active?: boolean 
}){
  const res = await api.put(`/api/v1/contacts/${id}`, payload)
  cache.invalidateByPrefix('contacts:')
  cache.invalidate(CACHE_KEYS.contact(id))
  return res.data.data || res.data
}

export async function deleteContact(id: string){
  const res = await api.delete(`/api/v1/contacts/${id}`)
  cache.invalidateByPrefix('contacts:')
  cache.invalidate(CACHE_KEYS.contact(id))
  return res.data.data || res.data
}
