import api from '../lib/http'

/**
 * Translation data structure
 * Grouped by: entityType → entityId → fieldName → languageCode → text
 */
export type TranslationsData = Record<
  string, // entityType (city, hotel, activity, etc.)
  Record<
    string, // entityId
    Record<
      string, // fieldName (name, description, address, etc.)
      Record<string, string> // languageCode → translation text
    >
  >
>

/**
 * Get all translations grouped by entity type, entity ID, field name, and language
 * @returns Grouped translations data
 * 
 * API Endpoint: GET /api/v1/translations/grouped
 * Auth: Required (ADMIN)
 * 
 * Response structure:
 * {
 *   "city": {
 *     "cityId123": {
 *       "name": { "en": "Paris", "ar": "باريس", "fr": "Paris" }
 *     }
 *   },
 *   "hotel": {
 *     "hotelId456": {
 *       "name": { "en": "Grand Hotel", "ar": "الفندق الكبير" },
 *       "description": { "en": "A luxury hotel...", "ar": "فندق فاخر..." }
 *     }
 *   }
 * }
 */
export async function getAllTranslations(): Promise<TranslationsData> {
  const res = await api.get('/api/v1/translations/grouped')
  return res.data.data || res.data || {}
}

/**
 * Upsert (create or update) translations for a specific field of an entity
 * @param entityType - Type of entity (city, hotel, activity, stadium, tourist_spot, contact)
 * @param entityId - ID of the entity
 * @param fieldName - Name of the field (name, description, address, title, etc.)
 * @param translations - Map of language codes to translated text
 * 
 * API Endpoint: PUT /api/v1/translations/entity/{entityType}/{entityId}/field/{fieldName}
 * Auth: Required (ADMIN)
 * 
 * Example:
 * upsertFieldTranslations('city', 'cityId123', 'name', {
 *   en: 'Paris',
 *   ar: 'باريس',
 *   fr: 'Paris'
 * })
 */
export async function upsertFieldTranslations(
  entityType: string,
  entityId: string,
  fieldName: string,
  translations: Record<string, string>
): Promise<void> {
  await api.put(
    `/api/v1/translations/entity/${entityType}/${entityId}/field/${fieldName}`,
    { translations }
  )
}

/**
 * Entity types supported by the translations system
 */
export const ENTITY_TYPES = {
  CITY: 'city',
  HOTEL: 'hotel',
  ACTIVITY: 'activity',
  STADIUM: 'stadium',
  TOURIST_SPOT: 'tourist_spot',
  CONTACT: 'contact',
} as const

/**
 * Common field names for translations
 */
export const FIELD_NAMES = {
  NAME: 'name',
  TITLE: 'title',
  DESCRIPTION: 'description',
  ADDRESS: 'address',
} as const

