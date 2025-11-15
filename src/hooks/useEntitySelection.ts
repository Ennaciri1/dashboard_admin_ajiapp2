import { useState } from 'react'

/**
 * Hook générique pour gérer la sélection multiple (checkboxes)
 * Élimine la duplication de code de sélection
 */
export function useEntitySelection<T extends { id: string }>() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  const handleSelectAll = (checked: boolean, items: T[]) => {
    if (checked) {
      setSelectedIds(items.map((item) => item.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id))
    }
  }

  const clearSelection = () => {
    setSelectedIds([])
  }

  return {
    selectedIds,
    setSelectedIds,
    bulkActionLoading,
    setBulkActionLoading,
    handleSelectAll,
    handleSelectOne,
    clearSelection,
  }
}

