import http from '../lib/http'
import { cachedApiCall, cache, CACHE_DURATIONS, CACHE_KEYS } from '../lib/cache'

export type ActivityImage = {
  url: string
  altText?: string
}

export type Activity = {
  id: string
  titleTranslations: Record<string, string>
  descriptionTranslations: Record<string, string>
  images: string[]
  price: number
  tags: string[]
  likesCount: number
  active: boolean
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

export type ActivityUser = {
  id: string
  name: string
  descriptionTranslations: Record<string, string>
  bannerImage?: string
  activities: Activity[]
}

export function getActivities() {
  return http.get<ActivityUser[]>('/api/v1/activities')
}

export async function getAdminActivities() {
  return cachedApiCall(
    CACHE_KEYS.activities(),
    async () => {
      const res = await http.get<ActivityUser[]>('/api/v1/activities/admin')
      return (res.data as any)?.data || res.data
    },
    CACHE_DURATIONS.ACTIVITIES
  )
}

export function getOwnerActivities() {
  return http.get<Activity[]>('/api/v1/activities/owner')
}

export async function createActivity(data: {
  titleTranslations: Record<string, string>
  descriptionTranslations: Record<string, string>
  images?: string[]
  price: number
  tags?: string[]
}) {
  const res = await http.post<Activity>('/api/v1/activities', data)
  cache.invalidateByPrefix('activities:')
  return (res.data as any)?.data || res.data
}

export async function updateActivity(id: string, data: {
  titleTranslations?: Record<string, string>
  descriptionTranslations?: Record<string, string>
  images?: string[]
  price?: number
  tags?: string[]
  active?: boolean
}) {
  const res = await http.put<Activity>(`/api/v1/activities/${id}`, data)
  cache.invalidateByPrefix('activities:')
  cache.invalidate(CACHE_KEYS.activity(id))
  return (res.data as any)?.data || res.data
}

export async function deleteActivity(id: string) {
  const res = await http.delete(`/api/v1/activities/${id}`)
  cache.invalidateByPrefix('activities:')
  cache.invalidate(CACHE_KEYS.activity(id))
  return (res.data as any)?.data || res.data
}
