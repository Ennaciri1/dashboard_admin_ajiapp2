import api from './http'
import { cache } from './cache'

/**
 * Helpers génériques pour éliminer la duplication dans les appels API
 * Tous les fichiers API peuvent utiliser ces fonctions
 */

/**
 * Wrapper générique pour les appels POST (Create)
 * Gère automatiquement l'invalidation du cache
 */
export async function apiCreate<T>(
  endpoint: string,
  payload: any,
  cachePrefix: string
): Promise<T> {
  try {
    const res = await api.post(endpoint, payload)
    cache.invalidateByPrefix(cachePrefix)
    return res.data.data || res.data
  } catch (error: any) {
    console.error(`Create error (${endpoint}):`, error.response?.data || error.message)
    throw error
  }
}

/**
 * Wrapper générique pour les appels PUT (Update)
 * Gère automatiquement l'invalidation du cache
 */
export async function apiUpdate<T>(
  endpoint: string,
  payload: any,
  cachePrefix: string
): Promise<T> {
  try {
    const res = await api.put(endpoint, payload)
    cache.invalidateByPrefix(cachePrefix)
    return res.data.data || res.data
  } catch (error: any) {
    console.error(`Update error (${endpoint}):`, error.response?.data || error.message)
    throw error
  }
}

/**
 * Wrapper générique pour les appels DELETE
 * Gère automatiquement l'invalidation du cache
 */
export async function apiDelete(
  endpoint: string,
  cachePrefix: string
): Promise<void> {
  try {
    await api.delete(endpoint)
    cache.invalidateByPrefix(cachePrefix)
  } catch (error: any) {
    console.error(`Delete error (${endpoint}):`, error.response?.data || error.message)
    throw error
  }
}

/**
 * Wrapper générique pour les appels GET
 * Standardise l'extraction des données
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  const res = await api.get(endpoint)
  return res.data.data || res.data
}

/**
 * Construire les query params pour les filtres
 */
export function buildQueryParams(params: Record<string, any>): string {
  const filtered = Object.entries(params).filter(([_, value]) => value !== undefined)
  if (filtered.length === 0) return ''
  
  const queryString = filtered.map(([key, value]) => `${key}=${value}`).join('&')
  return `?${queryString}`
}

