// API Response Types
export interface ApiResponse<T> {
  code: string
  error: boolean
  message: string
  data: T
  metadata: null | Record<string, any>
}

/**
 * Multi-language translation map
 * At least ONE supported language is required
 * All provided language codes must be valid and supported
 * 
 * Compatible with API v1.0 specification
 */
export type TranslationMap = Record<string, string>

/**
 * City entity
 * Matches API response from GET /api/v1/cities/admin
 * 
 * API Rules:
 * - At least one supported language translation is required
 * - Cities are active by default (active: true)
 */
export interface City {
  id: string
  nameTranslations: TranslationMap
  active: boolean
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

// Language Types
export interface SupportedLanguage {
  id: string
  code: string
  name: string
  active: boolean
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

/**
 * Contact entity
 * Matches API response from GET /api/v1/contacts/admin
 * 
 * Link formats:
 * - Email: mailto:email@example.com
 * - Phone: tel:+1234567890
 * - URL: https://example.com
 */
export interface Contact {
  id: string
  nameTranslations: TranslationMap
  link: string
  icon?: string
  active: boolean
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

// Location Type
export interface Location {
  latitude: number
  longitude: number
}

/**
 * Image data structure
 * Matches API v1.0 specification for images
 */
export interface ImageData {
  url: string
  alt?: string
  altText?: string
  owner?: string
  ownerId?: string
  ownerType?: 'ADMIN' | 'USER' | 'ACTIVITY'
}

/**
 * Hotel entity
 * Matches API response from GET /api/v1/hotels/admin
 * 
 * API Rules:
 * - Hotels are created as INACTIVE by default (active: false)
 * - At least one image is required
 * - At least one supported language translation is required for name and description
 * - To activate, ALL supported languages must have complete translations
 */
export interface Hotel {
  id: string
  nameTranslations: TranslationMap
  descriptionTranslations: TranslationMap
  cityId: string
  location: Location
  images?: ImageData[]
  minPrice?: number
  likesCount?: number
  active: boolean
  // User interaction fields (public endpoint only)
  isLikedByUser?: boolean
  isBookmarkedByUser?: boolean
  // Rating system
  rating?: number
  ratingCount?: number
  // Audit fields (admin endpoint only)
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

// Activity Types
export interface Activity {
  id: string
  titleTranslations: TranslationMap
  descriptionTranslations: TranslationMap
  images: string[]
  price: number
  tags: string[]
  likedByUser: boolean
  likesCount: number
  bookmarkedByUser: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ActivityUser {
  id: string
  name: string
  description: string
  bannerImage: string
  activities: Activity[]
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
 * API Rules:
 * - Tourist spots are created as INACTIVE by default (active: false)
 * - At least one supported language translation is required for name and description
 * - To activate, ALL required translations must be complete (name, description, address)
 * - Time format: HH:mm (e.g., "09:00", "18:30")
 */
export interface TouristSpot {
  id: string
  nameTranslations: TranslationMap
  descriptionTranslations: TranslationMap
  addressTranslations?: TranslationMap
  cityId?: string
  city?: {
    id: string
    nameTranslations: TranslationMap
    active: boolean
  }
  cityNameTranslations?: TranslationMap
  location: Location
  // Admin endpoint returns 'images', public returns 'imageData'
  imageData?: ImageData[]
  images?: ImageData[]
  // Admin endpoint returns 'likes', public returns 'likesCount'
  likes?: number
  likesCount?: number
  // User interaction fields (public endpoint only)
  isLikedByUser?: boolean
  isBookmarkedByUser?: boolean
  // Admin endpoint returns 'isPaidEntry', public returns 'isFreeEntry' (inverted)
  isFreeEntry?: boolean
  isPaidEntry?: boolean
  // Rating system
  rating?: number
  ratingCount?: number
  // Admin endpoint returns 'openingTime'/'closingTime', public returns 'openingHours'/'closingHours'
  openingHours?: string
  closingHours?: string
  openingTime?: string
  closingTime?: string
  suggestedBy?: string
  active?: boolean
  // Audit fields (admin endpoint only)
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

// Auth Types
export interface LoginRequest {
  email: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface User {
  id: string
  email: string
  fullName: string
  profilePicture?: string
  phoneNumber?: string
  roles: string[]
  emailVerified: boolean
  status: string
  createdAt: number
  updatedAt: number
}

// Form Types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'file'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  options?: { value: string; label: string }[]
}

// Table Types
export interface TableColumn<T = any> {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, row: T) => React.ReactNode
}

// UI State Types
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info'

