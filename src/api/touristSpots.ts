import http from '../lib/http'

export type Location = {
  latitude: number
  longitude: number
}

export type TouristSpotImage = {
  url: string
  altText: string
  owner: string
}

export type TouristSpot = {
  id: string
  nameTranslations: Record<string, string>
  descriptionTranslations: Record<string, string>
  addressTranslations: Record<string, string>
  location: Location
  // Admin endpoint returns 'images', public returns 'imageData'
  images?: TouristSpotImage[]
  imageData?: TouristSpotImage[]
  cityId: string
  city?: {
    id: string
    nameTranslations: Record<string, string>
    isActive: boolean
  }
  // Admin endpoint returns 'isPaidEntry', public returns 'freeEntry'
  isPaidEntry?: boolean
  freeEntry?: boolean
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
  isActive?: boolean
  // Public endpoint fields
  likedByUser?: boolean
  bookmarkedByUser?: boolean
  isLikedByUser?: boolean
  isBookmarkedByUser?: boolean
  suggestedBy?: string
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

export function getTouristSpots(cityId?: string) {
  return http.get<TouristSpot[]>('/api/v1/tourist-spots', { params: { cityId } })
}

export function getAdminTouristSpots(cityId?: string, isActive?: boolean) {
  return http.get<TouristSpot[]>('/api/v1/tourist-spots/admin', { params: { cityId, isActive } })
}

export function createTouristSpot(data: {
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
  return http.post<TouristSpot>('/api/v1/tourist-spots', data)
}

export function updateTouristSpot(id: string, data: {
  nameTranslations?: Record<string, string>
  descriptionTranslations?: Record<string, string>
  addressTranslations?: Record<string, string>
  location?: Location
  images?: TouristSpotImage[]
  cityId?: string
  isPaidEntry?: boolean
  openingTime?: string
  closingTime?: string
  isActive?: boolean
  suggestedBy?: string
}) {
  return http.put<TouristSpot>(`/api/v1/tourist-spots/${id}`, data)
}

export function deleteTouristSpot(id: string) {
  return http.delete(`/api/v1/tourist-spots/${id}`)
}
