import { useState, useEffect, useCallback } from 'react'

interface UseCachedDataOptions<T> {
  /** Clé de cache unique */
  cacheKey: string
  /** Fonction pour récupérer les données */
  fetchFn: () => Promise<T>
  /** Durée de validité du cache en ms (défaut: 5 minutes) */
  cacheTime?: number
  /** Si true, charge les données automatiquement au montage */
  autoFetch?: boolean
  /** Fonction appelée en cas d'erreur */
  onError?: (error: Error) => void
}

interface UseCachedDataReturn<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  clearCache: () => void
}

/**
 * Hook personnalisé pour gérer les données avec cache
 * Améliore les performances en évitant les appels API répétés
 */
export function useCachedData<T>({
  cacheKey,
  fetchFn,
  cacheTime = 5 * 60 * 1000, // 5 minutes par défaut
  autoFetch = true,
  onError,
}: UseCachedDataOptions<T>): UseCachedDataReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  // Récupérer les données du localStorage comme cache persistant (optionnel)
  const getCachedData = useCallback((): { data: T; timestamp: number } | null => {
    try {
      const cached = localStorage.getItem(cacheKey)
      if (!cached) return null
      
      const parsed = JSON.parse(cached)
      const now = Date.now()
      
      // Vérifier si le cache est expiré
      if (now - parsed.timestamp > cacheTime) {
        localStorage.removeItem(cacheKey)
        return null
      }
      
      return parsed
    } catch {
      return null
    }
  }, [cacheKey, cacheTime])

  // Save dans le cache
  const setCachedData = useCallback((newData: T) => {
    try {
      const cacheEntry = {
        data: newData,
        timestamp: Date.now(),
      }
      localStorage.setItem(cacheKey, JSON.stringify(cacheEntry))
    } catch (error) {
      console.warn('Failed to cache data:', error)
    }
  }, [cacheKey])

  // Fonction pour récupérer les données
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Vérifier d'abord le cache
      const cached = getCachedData()
      if (cached) {
        setData(cached.data)
        setLoading(false)
        return
      }

      // Si pas en cache, récupérer depuis l'API
      const result = await fetchFn()
      setData(result)
      setCachedData(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Une erreur est survenue')
      setError(error)
      if (onError) {
        onError(error)
      }
    } finally {
      setLoading(false)
    }
  }, [fetchFn, getCachedData, setCachedData, onError])

  // Fonction pour forcer le rechargement
  const refetch = useCallback(async () => {
    localStorage.removeItem(cacheKey)
    await fetchData()
  }, [cacheKey, fetchData])

  // Fonction pour vider le cache
  const clearCache = useCallback(() => {
    localStorage.removeItem(cacheKey)
    setData(null)
  }, [cacheKey])

  // Load les données au montage si autoFetch est activé
  useEffect(() => {
    if (autoFetch) {
      fetchData()
    }
  }, [autoFetch, fetchData])

  return {
    data,
    loading,
    error,
    refetch,
    clearCache,
  }
}

