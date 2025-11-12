/**
 * Simple in-memory cache utility pour optimiser les appels API
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresIn: number
}

class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map()

  /**
   * Récupérer une entrée du cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    const now = Date.now()
    const isExpired = now - entry.timestamp > entry.expiresIn
    
    if (isExpired) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }

  /**
   * Ajouter une entrée au cache
   */
  set<T>(key: string, data: T, expiresInMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn: expiresInMs,
    })
  }

  /**
   * Invalider une entrée spécifique
   */
  invalidate(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Invalider toutes les entrées qui commencent par un préfixe
   */
  invalidateByPrefix(prefix: string): void {
    const keysToDelete: string[] = []
    
    this.cache.forEach((_, key) => {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key)
      }
    })
    
    keysToDelete.forEach(key => this.cache.delete(key))
  }

  /**
   * Vider tout le cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Obtenir la taille du cache
   */
  size(): number {
    return this.cache.size
  }
}

// Instance singleton
export const cache = new CacheManager()

/**
 * Fonction helper pour wrapper les appels API avec cache
 */
export async function cachedApiCall<T>(
  key: string,
  apiCall: () => Promise<T>,
  expiresInMs: number = 5 * 60 * 1000 // 5 minutes par défaut
): Promise<T> {
  // Vérifier le cache
  const cached = cache.get<T>(key)
  if (cached !== null) {
    console.log(`✅ Cache HIT: ${key}`)
    return cached
  }

  // Appel API si pas en cache
  console.log(`❌ Cache MISS: ${key}`)
  const data = await apiCall()
  
  // Stocker en cache
  cache.set(key, data, expiresInMs)
  
  return data
}

/**
 * Configuration des durées de cache par type de données
 */
export const CACHE_DURATIONS = {
  // Données qui changent rarement
  LANGUAGES: 30 * 60 * 1000,      // 30 minutes
  CITIES: 15 * 60 * 1000,          // 15 minutes
  
  // Données qui changent modérément
  HOTELS: 5 * 60 * 1000,           // 5 minutes
  CONTACTS: 5 * 60 * 1000,         // 5 minutes
  TOURIST_SPOTS: 5 * 60 * 1000,    // 5 minutes
  ACTIVITIES: 5 * 60 * 1000,       // 5 minutes
  
  // Données en temps réel
  DASHBOARD_STATS: 2 * 60 * 1000,  // 2 minutes
}

/**
 * Clés de cache standardisées
 */
export const CACHE_KEYS = {
  languages: (active?: boolean) => `languages:${active ?? 'all'}`,
  cities: (active?: boolean) => `cities:${active ?? 'all'}`,
  city: (id: string) => `city:${id}`,
  hotels: (active?: boolean) => `hotels:${active ?? 'all'}`,
  hotel: (id: string) => `hotel:${id}`,
  contacts: (active?: boolean) => `contacts:${active ?? 'all'}`,
  contact: (id: string) => `contact:${id}`,
  touristSpots: (active?: boolean) => `tourist-spots:${active ?? 'all'}`,
  touristSpot: (id: string) => `tourist-spot:${id}`,
  activities: () => `activities:all`,
  activity: (id: string) => `activity:${id}`,
  dashboardStats: () => `dashboard:stats`,
}

