import api from '../lib/http'
import { cachedApiCall, cache, CACHE_DURATIONS, CACHE_KEYS } from '../lib/cache'

/**
 * Multi-language translation map
 * At least ONE supported language is required
 */
export type NameTranslations = Record<string, string>

/**
 * Hotel image structure
 * Matches API specification
 */
export type HotelImage = {
  url: string
  owner?: string
  altText?: string
  ownerId?: string
  ownerType?: 'ADMIN' | 'USER' | 'ACTIVITY'
}

/**
 * GPS coordinates
 */
export type Location = {
  latitude: number
  longitude: number
}

/**
 * Hotel entity
 * Matches API response from GET /api/v1/hotels/admin
 */
export type Hotel = {
  id: string
  nameTranslations: NameTranslations
  descriptionTranslations: NameTranslations
  cityId: string
  location: Location
  images?: HotelImage[]
  minPrice?: number
  likesCount?: number
  active: boolean
  rating?: number
  ratingCount?: number
  // User interaction fields (public endpoint only)
  isLikedByUser?: boolean
  isBookmarkedByUser?: boolean
  // Audit fields (admin endpoint only)
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

export async function getHotels(active?: boolean){
  const params: any = {}
  if (typeof active === 'boolean') params.active = active
  const res = await api.get('/api/v1/hotels', { params })
  return res.data.data || res.data
}

export async function getAdminHotels(active?: boolean){
  return cachedApiCall(
    CACHE_KEYS.hotels(active),
    async () => {
      const params: any = {}
      if (typeof active === 'boolean') params.active = active
      const res = await api.get('/api/v1/hotels/admin', { params })
      return res.data.data || res.data
    },
    CACHE_DURATIONS.HOTELS
  )
}

/**
 * Create a new hotel
 * @param payload.nameTranslations - At least ONE supported language required
 * @param payload.descriptionTranslations - At least ONE supported language required
 * @param payload.cityId - City ID (required)
 * @param payload.location - GPS coordinates (required)
 * @param payload.images - Hotel images (at least one required)
 * @param payload.minPrice - Minimum room price (required)
 * 
 * API Rules:
 * - Hotels are created as INACTIVE by default (active: false)
 * - Multiple languages can be provided during creation
 * - At least one image is required
 * - All provided language codes must be valid and supported
 */
export async function createHotel(payload: {
  nameTranslations: NameTranslations
  descriptionTranslations: NameTranslations
  cityId: string
  location: Location
  images?: HotelImage[]
  minPrice?: number
}){
  const res = await api.post('/api/v1/hotels', payload)
  cache.invalidateByPrefix('hotels:')
  return res.data.data || res.data
}

/**
 * Update an existing hotel
 * @param id - Hotel ID
 * @param payload - Partial update payload
 * 
 * API Rules:
 * - All fields are optional
 * - Only provided translations will be updated
 * - To activate (active: true), ALL supported languages must have complete translations
 * - Images array replaces existing images entirely when provided
 */
export async function updateHotel(id: string, payload: {
  nameTranslations?: NameTranslations
  descriptionTranslations?: NameTranslations
  cityId?: string
  location?: Location
  images?: HotelImage[]
  minPrice?: number
  active?: boolean
}){
  const res = await api.put(`/api/v1/hotels/${id}`, payload)
  cache.invalidateByPrefix('hotels:')
  cache.invalidate(CACHE_KEYS.hotel(id))
  return res.data.data || res.data
}

export async function deleteHotel(id: string){
  const res = await api.delete(`/api/v1/hotels/${id}`)
  cache.invalidateByPrefix('hotels:')
  cache.invalidate(CACHE_KEYS.hotel(id))
  return res.data.data || res.data
}
