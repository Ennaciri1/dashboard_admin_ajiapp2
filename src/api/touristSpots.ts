import http from '../lib/http'
import { cachedApiCall, cache, CACHE_DURATIONS, CACHE_KEYS } from '../lib/cache'

/**
 * GPS coordinates
 */
export type Location = {
  latitude: number
  longitude: number
}

/**
 * Tourist spot image structure
 * Matches API specification
 */
export type TouristSpotImage = {
  url: string
  altText?: string
  owner?: string
  ownerId?: string
  ownerType?: 'ADMIN' | 'USER' | 'ACTIVITY'
}

/**
 * Tourist Spot entity
 * 
 * Note: API returns different field names for public vs admin endpoints:
 * - images (admin) / imageData (public)
 * - isPaidEntry (admin) / isFreeEntry (public, inverted)
 * - openingTime/closingTime (admin) / openingHours/closingHours (public)
 * - likes (admin) / likesCount (public)
 * 
 * Matches API response from GET /api/v1/tourist-spots/admin
 */
export type TouristSpot = {
  id: string
  nameTranslations: Record<string, string>
  descriptionTranslations: Record<string, string>
  addressTranslations?: Record<string, string>
  location: Location
  // Admin endpoint returns 'images', public returns 'imageData'
  images?: TouristSpotImage[]
  imageData?: TouristSpotImage[]
  cityId?: string
  city?: {
    id: string
    nameTranslations: Record<string, string>
    active: boolean
  }
  cityNameTranslations?: Record<string, string>
  // Admin endpoint returns 'isPaidEntry', public returns 'isFreeEntry' (inverted)
  isPaidEntry?: boolean
  isFreeEntry?: boolean
  // Admin endpoint returns 'openingTime'/'closingTime', public returns 'openingHours'/'closingHours'
  openingTime?: string
  closingTime?: string
  openingHours?: string
  closingHours?: string
  // Admin endpoint returns 'likes', public returns 'likesCount'
  likes?: number
  likesCount?: number
  rating?: number
  ratingCount?: number
  active?: boolean
  // Public endpoint fields
  likedByUser?: boolean
  bookmarkedByUser?: boolean
  isLikedByUser?: boolean
  isBookmarkedByUser?: boolean
  suggestedBy?: string
  // Audit fields (admin endpoint only)
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

export function getTouristSpots(cityId?: string) {
  return http.get<TouristSpot[]>('/api/v1/tourist-spots', { params: { cityId } })
}

export async function getAdminTouristSpots(cityId?: string, active?: boolean) {
  return cachedApiCall(
    CACHE_KEYS.touristSpots(active),
    async () => {
      const res = await http.get<TouristSpot[]>('/api/v1/tourist-spots/admin', { params: { cityId, active } })
      return (res.data as any)?.data || res.data
    },
    CACHE_DURATIONS.TOURIST_SPOTS
  )
}

/**
 * Create a new tourist spot
 * @param data.nameTranslations - At least ONE supported language required
 * @param data.descriptionTranslations - At least ONE supported language required
 * @param data.addressTranslations - Optional, translations for address
 * @param data.location - GPS coordinates (required)
 * @param data.images - Tourist spot images (optional)
 * @param data.cityId - City ID (required)
 * @param data.isPaidEntry - Whether entry requires payment (required)
 * @param data.openingTime - Opening time in HH:mm format (optional)
 * @param data.closingTime - Closing time in HH:mm format (optional)
 * @param data.suggestedBy - Who suggested this spot (optional, defaults to 'AJIAPP')
 * 
 * API Rules:
 * - Tourist spots are created as INACTIVE by default (active: false)
 * - At least one supported language translation is required for name and description
 * - Multiple languages can be provided during creation
 * - Location coordinates must be valid (latitude: -90 to 90, longitude: -180 to 180)
 * - Time format is HH:mm (e.g., "09:00", "18:30")
 */
export async function createTouristSpot(data: {
  nameTranslations: Record<string, string>
  descriptionTranslations: Record<string, string>
  addressTranslations?: Record<string, string>
  location: Location
  images?: TouristSpotImage[]
  cityId: string
  isPaidEntry: boolean
  openingTime?: string
  closingTime?: string
  suggestedBy?: string
}) {
  const res = await http.post<TouristSpot>('/api/v1/tourist-spots', data)
  cache.invalidateByPrefix('tourist-spots:')
  return (res.data as any)?.data || res.data
}

/**
 * Update an existing tourist spot
 * @param id - Tourist spot ID
 * @param data - Partial update payload
 * 
 * API Rules:
 * - All fields are optional
 * - Only provided translations will be updated
 * - To activate (active: true), ALL required translations must be complete:
 *   - name, description, address for all active languages
 * - Images array replaces existing images entirely when provided
 * - Translation keys must be supported languages only
 */
export async function updateTouristSpot(id: string, data: {
  nameTranslations?: Record<string, string>
  descriptionTranslations?: Record<string, string>
  addressTranslations?: Record<string, string>
  location?: Location
  images?: TouristSpotImage[]
  cityId?: string
  isPaidEntry?: boolean
  openingTime?: string
  closingTime?: string
  active?: boolean
  suggestedBy?: string
}) {
  const res = await http.put<TouristSpot>(`/api/v1/tourist-spots/${id}`, data)
  cache.invalidateByPrefix('tourist-spots:')
  cache.invalidate(CACHE_KEYS.touristSpot(id))
  return (res.data as any)?.data || res.data
}

export async function deleteTouristSpot(id: string) {
  const res = await http.delete(`/api/v1/tourist-spots/${id}`)
  cache.invalidateByPrefix('tourist-spots:')
  cache.invalidate(CACHE_KEYS.touristSpot(id))
  return (res.data as any)?.data || res.data
}
