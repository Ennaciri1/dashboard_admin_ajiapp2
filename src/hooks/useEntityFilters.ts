import { useState } from 'react'

/**
 * Hook générique pour gérer les filtres (search, status, etc.)
 * Élimine la duplication de code de filtrage
 */
export function useEntityFilters() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [selectedLang, setSelectedLang] = useState<'en' | 'fr' | 'ar'>('en')

  const resetFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setSelectedLang('en')
  }

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedLang,
    setSelectedLang,
    resetFilters,
  }
}

