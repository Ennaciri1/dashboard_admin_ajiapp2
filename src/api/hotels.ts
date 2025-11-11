import api from '../lib/http'

export type NameTranslations = { en: string; ar?: string; fr?: string; es?: string }

export type HotelImage = {
  url: string
  owner: string
  altText?: string
}

export type Location = {
  latitude: number
  longitude: number
}

export type Hotel = {
  id: string
  nameTranslations: NameTranslations
  descriptionTranslations: NameTranslations
  cityId: string
  location: Location
  images?: HotelImage[]
  minPrice?: number
  likesCount?: number
  isActive: boolean
  rating?: number
  ratingCount?: number
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

export async function getHotels(isActive?: boolean){
  const params: any = {}
  if (typeof isActive === 'boolean') params.isActive = isActive
  const res = await api.get('/api/v1/hotels', { params })
  return res.data
}

export async function getAdminHotels(isActive?: boolean){
  const params: any = {}
  if (typeof isActive === 'boolean') params.isActive = isActive
  const res = await api.get('/api/v1/hotels/admin', { params })
  return res.data
}

export async function createHotel(payload: {
  nameTranslations: NameTranslations
  descriptionTranslations: NameTranslations
  cityId: string
  location: Location
  images?: HotelImage[]
  minPrice?: number
}){
  const res = await api.post('/api/v1/hotels', payload)
  return res.data
}

export async function updateHotel(id: string, payload: {
  nameTranslations?: Partial<NameTranslations>
  descriptionTranslations?: Partial<NameTranslations>
  cityId?: string
  location?: Location
  images?: HotelImage[]
  minPrice?: number
  isActive?: boolean
}){
  const res = await api.put(`/api/v1/hotels/${id}`, payload)
  return res.data
}

export async function deleteHotel(id: string){
  const res = await api.delete(`/api/v1/hotels/${id}`)
  return res.data
}
