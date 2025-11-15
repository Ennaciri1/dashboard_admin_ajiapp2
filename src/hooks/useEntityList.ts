import { useState, useEffect } from 'react'

/**
 * Hook générique pour gérer les listes d'entités (CRUD)
 * Élimine la duplication de code dans toutes les pages List
 */
export function useEntityList<T extends { id: string; active: boolean }>(
  loadFunction: () => Promise<T[]>
) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await loadFunction()
      setItems(data)
    } catch (err: any) {
      setError(err.message || 'Error loading items')
    } finally {
      setLoading(false)
    }
  }

  const updateItem = (id: string, updates: Partial<T>) => {
    setItems(items.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  return {
    items,
    setItems,
    loading,
    setLoading,
    error,
    setError,
    deleting,
    setDeleting,
    toggling,
    setToggling,
    loadItems,
    updateItem,
    removeItem,
  }
}

