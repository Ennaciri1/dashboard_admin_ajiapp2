import http from '../lib/http'

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
  isActive: boolean
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

export type ActivityUser = {
  id: string
  name: string
  description: string
  bannerImage?: string
  activities: Activity[]
}

export function getActivities() {
  return http.get<ActivityUser[]>('/api/v1/activities')
}

export function getAdminActivities() {
  return http.get<ActivityUser[]>('/api/v1/activities/admin')
}

export function getOwnerActivities() {
  return http.get<Activity[]>('/api/v1/activities/owner')
}

export function createActivity(data: {
  titleTranslations: Record<string, string>
  descriptionTranslations: Record<string, string>
  images?: string[]
  price: number
  tags?: string[]
}) {
  return http.post<Activity>('/api/v1/activities', data)
}

export function updateActivity(id: string, data: {
  titleTranslations?: Record<string, string>
  descriptionTranslations?: Record<string, string>
  images?: string[]
  price?: number
  tags?: string[]
  isActive?: boolean
}) {
  return http.put<Activity>(`/api/v1/activities/${id}`, data)
}

export function deleteActivity(id: string) {
  return http.delete(`/api/v1/activities/${id}`)
}
