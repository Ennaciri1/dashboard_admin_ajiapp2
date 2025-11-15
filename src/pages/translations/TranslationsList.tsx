import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllTranslations, TranslationsData } from '../../api/translations'
import { getSupportedLanguages, SupportedLanguage } from '../../api/languages'
import { TableSkeleton } from '../../components/Loading'
import Alert from '../../components/Alert'

export default function TranslationsList() {
  const navigate = useNavigate()
  const [translations, setTranslations] = useState<TranslationsData>({})
  const [languages, setLanguages] = useState<SupportedLanguage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [filterEntityType, setFilterEntityType] = useState<string>('all')
  const [filterLanguage, setFilterLanguage] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'empty' | 'filled'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const [translationsData, langsData] = await Promise.all([
        getAllTranslations(),
        getSupportedLanguages(true)
      ])
      setTranslations(translationsData)
      const langs = Array.isArray(langsData) ? langsData : (langsData.data || [])
      setLanguages(langs)
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Failed to load translations')
    } finally {
      setLoading(false)
    }
  }

  const getEntityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      city: 'City',
      hotel: 'Hotel',
      activity: 'Activity',
      stadium: 'Stadium',
      tourist_spot: 'Tourist Spot',
      contact: 'Contact'
    }
    return labels[type] || type
  }

  const flattenedData = useMemo(() => {
    const rows: Array<{
      entityType: string
      entityId: string
      fieldName: string
      translations: Record<string, string>
    }> = []

    Object.entries(translations).forEach(([entityType, entities]) => {
      Object.entries(entities).forEach(([entityId, fields]) => {
        Object.entries(fields).forEach(([fieldName, langTranslations]) => {
          rows.push({
            entityType,
            entityId,
            fieldName,
            translations: langTranslations
          })
        })
      })
    })

    return rows
  }, [translations])

  const filteredData = useMemo(() => {
    return flattenedData.filter(row => {
      if (filterEntityType !== 'all' && row.entityType !== filterEntityType) {
        return false
      }
      
      if (filterLanguage !== 'all') {
        const hasContent = row.translations[filterLanguage]?.trim()
        if (!hasContent) return false
      }
      
      if (filterStatus !== 'all') {
        const allTranslations = Object.values(row.translations)
        const hasEmpty = allTranslations.some(t => !t.trim())
        const hasFilled = allTranslations.some(t => t.trim())
        
        if (filterStatus === 'empty' && !hasEmpty) return false
        if (filterStatus === 'filled' && !hasFilled) return false
      }
      
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesId = row.entityId.toLowerCase().includes(query)
        const matchesField = row.fieldName.toLowerCase().includes(query)
        const matchesTranslation = Object.values(row.translations).some(
          text => text.toLowerCase().includes(query)
        )
        return matchesId || matchesField || matchesTranslation
      }
      
      return true
    })
  }, [flattenedData, filterEntityType, filterLanguage, filterStatus, searchQuery])

  const entityTypes = useMemo(() => {
    return Array.from(new Set(flattenedData.map(r => r.entityType)))
  }, [flattenedData])

  if (loading) return <TableSkeleton />
  if (error) return (
    <div className="px-8 py-6">
      <h2 className="text-2xl font-semibold mb-4">Translations</h2>
      <Alert variant="danger">{error}</Alert>
    </div>
  )

  return (
    <div className="px-8 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Translations Management</h2>
        <p className="text-gray-600 mt-1">Manage all translations in your application</p>
      </div>

      <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="font-semibold text-gray-900">Advanced Filters</span>
            {(filterEntityType !== 'all' || filterLanguage !== 'all' || filterStatus !== 'all' || searchQuery) && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                Active
              </span>
            )}
          </div>
          <svg 
            className={`w-5 h-5 text-gray-600 transition-transform ${showFilters ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div 
          className={`transition-all duration-300 ease-in-out ${
            showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
          style={{ overflow: showFilters ? 'visible' : 'hidden' }}
        >
          <div className="px-6 pb-6 pt-2 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entity Type
                </label>
                <select
                  value={filterEntityType}
                  onChange={(e) => setFilterEntityType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All ({flattenedData.length})</option>
                  {entityTypes.map(type => {
                    const count = flattenedData.filter(r => r.entityType === type).length
                    return (
                      <option key={type} value={type}>
                        {getEntityTypeLabel(type)} ({count})
                      </option>
                    )
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={filterLanguage}
                  onChange={(e) => setFilterLanguage(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All languages</option>
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} ({lang.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'empty' | 'filled')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All statuses</option>
                  <option value="empty">With empty translations</option>
                  <option value="filled">All filled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ID, field, text..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {(filterEntityType !== 'all' || filterLanguage !== 'all' || filterStatus !== 'all' || searchQuery) && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setFilterEntityType('all')
                    setFilterLanguage('all')
                    setFilterStatus('all')
                    setSearchQuery('')
                  }}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-2xl font-bold text-gray-900">{flattenedData.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Types</div>
          <div className="text-2xl font-bold text-primary-600">{entityTypes.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Languages</div>
          <div className="text-2xl font-bold text-blue-600">{languages.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Filtered</div>
          <div className="text-2xl font-bold text-green-600">{filteredData.length}</div>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No translation found
          </h3>
          <p className="text-gray-600">
            Try adjusting your filters
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entity ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Field
                  </th>
                  {languages.slice(0, 3).map(lang => (
                    <th key={lang.code} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {lang.code.toUpperCase()}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((row, idx) => (
                  <tr key={`${row.entityType}-${row.entityId}-${row.fieldName}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {getEntityTypeLabel(row.entityType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">{row.entityId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 capitalize">
                        {row.fieldName}
                      </div>
                    </td>
                    {languages.slice(0, 3).map(lang => {
                      const text = row.translations[lang.code] || ''
                      const isEmpty = !text.trim()
                      return (
                        <td key={lang.code} className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {isEmpty ? (
                              <span className="text-gray-400 italic">Empty</span>
                            ) : (
                              text
                            )}
                          </div>
                        </td>
                      )
                    })}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/translations/edit/${row.entityType}/${row.entityId}`)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 px-6 py-4">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{filteredData.length}</span> translation(s)
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
