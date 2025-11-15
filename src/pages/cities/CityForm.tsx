import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createCity, updateCity, getCityById } from '../../api/cities'
import { getSupportedLanguages } from '../../api/languages'
import { SupportedLanguage, TranslationMap } from '../../types'
import Card, { CardHeader } from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Loading from '../../components/Loading'
import Alert from '../../components/Alert'

export default function CityForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [languages, setLanguages] = useState<SupportedLanguage[]>([])
  const [formData, setFormData] = useState<{
    nameTranslations: TranslationMap
    active: boolean
  }>({
    nameTranslations: {},
    active: true,
  })

  useEffect(() => {
    loadLanguages()
    if (isEdit && id) {
      loadCity(id)
    }
  }, [id, isEdit])

  const loadLanguages = async () => {
    try {
      const data = await getSupportedLanguages(true)
      const activeLangs = data.filter((lang: SupportedLanguage) => lang.active)
      setLanguages(activeLangs)
    } catch (err) {
      setError('Failed to load languages')
    }
  }

  const loadCity = async (cityId: string) => {
    try {
      setLoading(true)
      const data = await getCityById(cityId)
      setFormData({
        nameTranslations: data.nameTranslations,
        active: data.active,
      })
    } catch (err: any) {
      setError(err.message || 'Failed to load city')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const hasTranslation = Object.values(formData.nameTranslations).some(val => val?.trim())
    if (!hasTranslation) {
      setError('At least one translation is required')
      return
    }

    try {
      setSaving(true)
      setError(null)

      if (isEdit && id) {
        await updateCity(id, formData)
      } else {
        await createCity(formData)
      }

      navigate('/cities')
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save city')
    } finally {
      setSaving(false)
    }
  }

  const handleTranslationChange = (lang: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      nameTranslations: {
        ...prev.nameTranslations,
        [lang]: value,
      },
    }))
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <Loading text="Loading..." />
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {error && (
        <Alert variant="danger" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardHeader
          title={isEdit ? 'Edit City' : 'New City'}
          subtitle={isEdit ? 'Update city information' : 'Add a new city to the system'}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Name Translations</h3>
            
            {!isEdit && (
              <Alert variant="info">
                At least one translation is required. You can add more languages later.
              </Alert>
            )}
            
            {languages.map((lang) => (
              <Input
                key={lang.code}
                label={`Name (${lang.name})`}
                placeholder={`Enter name in ${lang.name}`}
                value={formData.nameTranslations[lang.code] || ''}
                onChange={(e) => handleTranslationChange(lang.code, e.target.value)}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-700">
              Active
            </label>
          </div>

          <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
            <Button type="submit" loading={saving}>
              {isEdit ? 'Save' : 'Create'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/cities')}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
