import api from '../lib/http'
import { cachedApiCall, cache, CACHE_DURATIONS, CACHE_KEYS } from '../lib/cache'

/**
 * Multi-language translation map
 * At least ONE supported language is required
 * All provided language codes must be valid and supported
 */
export type NameTranslations = Record<string, string>

/**
 * City entity
 * Matches API response from GET /api/v1/cities/admin
 */
export type City = {
  id: string
  nameTranslations: NameTranslations
  active: boolean
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

export async function getAllCitiesAdmin(active?: boolean){
  return cachedApiCall(
    CACHE_KEYS.cities(active),
    async () => {
      const params: any = {}
      if (typeof active === 'boolean') params.active = active
      const res = await api.get('/api/v1/cities/admin', { params })
      return res.data.data || res.data
    },
    CACHE_DURATIONS.CITIES
  )
}

/**
 * Create a new city
 * @param payload.nameTranslations - At least ONE supported language required
 * @param payload.active - Optional, defaults to true on backend
 * 
 * API Rules:
 * - At least one supported language translation is required
 * - All provided language codes must be valid and supported
 * - Multiple languages can be provided during creation
 */
export async function createCity(payload: { 
  nameTranslations: NameTranslations
  active?: boolean 
}){
  try {
    const res = await api.post('/api/v1/cities', payload)
    cache.invalidateByPrefix('cities:')
    return res.data.data || res.data
  } catch (error: any) {
    console.error('Create city error:', error.response?.data || error.message)
    throw error
  }
}

/**
 * Update an existing city
 * @param id - City ID
 * @param payload.nameTranslations - Partial translations (only languages to update)
 * @param payload.active - Active status
 * 
 * API Rules:
 * - Only provide translations you want to update
 * - Other translations remain unchanged
 */
export async function updateCity(id: string, payload: { 
  nameTranslations?: NameTranslations
  active?: boolean 
}){
  const res = await api.put(`/api/v1/cities/${id}`, payload)
  cache.invalidateByPrefix('cities:')
  cache.invalidate(CACHE_KEYS.city(id))
  return res.data.data || res.data
}

export async function deleteCity(id: string){
  const res = await api.delete(`/api/v1/cities/${id}`)
  // Invalider le cache des villes après suppression
  cache.invalidateByPrefix('cities:')
  cache.invalidate(CACHE_KEYS.city(id))
  return res.data.data || res.data
}

export async function getCityById(id: string){
  const res = await api.get(`/api/v1/cities/admin`)
  const cities = res.data.data || res.data
  return cities.find((c: City) => c.id === id)
}

// Alias pour compatibilité avec anciennes pages
export const getAdminCities = getAllCitiesAdmin
