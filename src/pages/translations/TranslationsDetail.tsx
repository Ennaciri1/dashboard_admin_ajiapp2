import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAllTranslations, TranslationsData } from '../../api/translations'
import { getSupportedLanguages, SupportedLanguage } from '../../api/languages'
import { TableSkeleton } from '../../components/Loading'
import Alert from '../../components/Alert'
import Button from '../../components/Button'

/**
 * TranslationsDetail - Vue simple en tableau pour une entité
 */
export default function TranslationsDetail() {
  const { entityType, entityId } = useParams<{ entityType: string; entityId: string }>()
  const navigate = useNavigate()
  
  const [translations, setTranslations] = useState<TranslationsData>({})
  const [languages, setLanguages] = useState<SupportedLanguage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!entityType || !entityId) return
    
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
      setError(e?.response?.data?.message || e.message || 'Failed du chargement')
    } finally {
      setLoading(false)
    }
  }, [entityType, entityId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const getEntityTypeLabel = useCallback((type: string) => {
    const labels: Record<string, string> = {
      city: 'City',
      hotel: 'Hotel',
      activity: 'Activity',
      stadium: 'Stade',
      tourist_spot: 'Tourist Spot',
      contact: 'Contact'
    }
    return labels[type] || type
  }, [])

  const entityData = useMemo(() => {
    return entityType && entityId ? translations[entityType]?.[entityId] : null
  }, [translations, entityType, entityId])

  if (loading) return <TableSkeleton />
  if (error) return (
    <div className="px-8 py-6">
      <h2 className="text-2xl font-semibold mb-4">Details des traductions</h2>
      <Alert variant="danger">{error}</Alert>
    </div>
  )

  if (!entityData) {
    return (
      <div className="px-8 py-6">
        <h2 className="text-2xl font-semibold mb-4">Details des traductions</h2>
        <Alert variant="warning">No traduction found pour cette entité.</Alert>
        <Button onClick={() => navigate('/translations')} className="mt-4">
          Back
        </Button>
      </div>
    )
  }

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Translations - {getEntityTypeLabel(entityType || '')}
        </h2>
        <p className="text-gray-600 mt-1">
          ID: <span className="font-mono">{entityId}</span>
        </p>
      </div>

      {/* Actions */}
      <div className="mb-6 flex gap-4">
        <Button onClick={() => navigate(`/translations/edit/${entityType}/${entityId}`)}>
          Edit
        </Button>
        <Button onClick={() => navigate('/translations')} variant="secondary">
          Back
        </Button>
      </div>

      {/* Tableau simple */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Champ
                </th>
                {languages.map(lang => (
                  <th key={lang.code} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {lang.name} ({lang.code})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(entityData).map(([fieldName, langTranslations]) => (
                <tr key={fieldName} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 capitalize">
                      {fieldName}
                    </div>
                  </td>
                  {languages.map(lang => {
                    const text = langTranslations[lang.code] || ''
                    const isEmpty = !text.trim()
                    return (
                      <td key={lang.code} className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {isEmpty ? (
                            <span className="text-gray-400 italic">Vide</span>
                          ) : (
                            <div className="max-w-md">{text}</div>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
