import React from 'react'

interface FilterBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  statusFilter?: 'all' | 'active' | 'inactive'
  onStatusChange?: (value: 'all' | 'active' | 'inactive') => void
  showLanguageSelector?: boolean
  selectedLang?: 'en' | 'fr' | 'ar'
  onLangChange?: (value: 'en' | 'fr' | 'ar') => void
  children?: React.ReactNode
}

/**
 * Composant réutilisable pour la barre de filtres
 * Élimine la duplication de code de filtrage UI
 */
export default function FilterBar({
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Search...',
  statusFilter,
  onStatusChange,
  showLanguageSelector = false,
  selectedLang = 'en',
  onLangChange,
  children,
}: FilterBarProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <input
          type="text"
          placeholder={searchPlaceholder}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#97051D] focus:border-transparent"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        {/* Status Filter */}
        {statusFilter !== undefined && onStatusChange && (
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as 'all' | 'active' | 'inactive')}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-[#97051D] focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        )}

        {/* Language Selector */}
        {showLanguageSelector && onLangChange && (
          <select
            value={selectedLang}
            onChange={(e) => onLangChange(e.target.value as 'en' | 'fr' | 'ar')}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-[#97051D] focus:border-transparent"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
          </select>
        )}

        {/* Additional Filters (passed as children) */}
        {children}
      </div>
    </div>
  )
}

