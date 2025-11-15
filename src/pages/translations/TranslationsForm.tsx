import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getAllTranslations, upsertFieldTranslations, TranslationsData } from '../../api/translations'
import { getSupportedLanguages, SupportedLanguage } from '../../api/languages'
import { PageHeader } from '../../components/UI'
import Alert from '../../components/Alert'
import Button from '../../components/Button'

export default function TranslationsForm() {
  const { entityType, entityId } = useParams<{ entityType: string; entityId: string }>()
  const navigate = useNavigate()
  
  const [translations, setTranslations] = useState<TranslationsData>({})
  const [languages, setLanguages] = useState<SupportedLanguage[]>([])
  const [localTranslations, setLocalTranslations] = useState<Record<string, Record<string, string>>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadData()
  }, [entityType, entityId])

  async function loadData() {
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
      
      // Initialize local state with existing translations
      if (translationsData[entityType]?.[entityId]) {
        setLocalTranslations(translationsData[entityType][entityId])
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!entityType || !entityId) return
    
    setSaving(true)
    setError(null)
    setSuccess(false)
    
    try {
      // Save each field
      for (const [fieldName, langTranslations] of Object.entries(localTranslations)) {
        await upsertFieldTranslations(entityType, entityId, fieldName, langTranslations)
      }
      setSuccess(true)
      setTimeout(() => navigate('/translations'), 1500)
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Failed to save translations')
    } finally {
      setSaving(false)
    }
  }

  const getEntityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      city: 'City',
      hotel: 'Hotel',
      activity: 'Activity',
      stadium: 'Stade',
      tourist_spot: 'Tourist Spot',
      contact: 'Contact'
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <div className="px-8 py-6">
        <PageHeader title="Loading..." icon="🌐" />
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading des traductions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-8 py-6">
      <PageHeader 
        title={`Edit les traductions - ${getEntityTypeLabel(entityType || '')} `}
        icon="🌐"
      />

      {error && <Alert type="error" message={error} className="mb-4" />}
      {success && <Alert type="success" message="Translations enregistrées avec succès !" className="mb-4" />}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <div className="text-sm text-gray-500">Type d'entité</div>
          <div className="font-medium text-gray-900">{getEntityTypeLabel(entityType || '')}</div>
        </div>
        
        <div className="mb-6">
          <div className="text-sm text-gray-500">ID de l'entité</div>
          <div className="font-medium text-gray-900 font-mono text-sm">{entityId}</div>
        </div>

        <div className="space-y-6">
          {Object.entries(localTranslations).map(([fieldName, langTranslations]) => (
            <div key={fieldName} className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">{fieldName}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {languages.map(lang => (
                  <div key={lang.code}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {lang.name} ({lang.code.toUpperCase()})
                    </label>
                    <textarea
                      value={langTranslations[lang.code] || ''}
                      onChange={(e) => {
                        setLocalTranslations(prev => ({
                          ...prev,
                          [fieldName]: {
                            ...prev[fieldName],
                            [lang.code]: e.target.value
                          }
                        }))
                      }}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder={`Translation en ${lang.name}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-4">
          <Button
            onClick={handleSave}
            loading={saving}
            disabled={saving}
          >
            {saving ? 'Enregistrement...' : 'Save'}
          </Button>
          <Button
            onClick={() => navigate('/translations')}
            variant="secondary"
            disabled={saving}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

