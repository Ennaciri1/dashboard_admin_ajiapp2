import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createCity, updateCity, getCityById } from '../api/cities'
import { getSupportedLanguages } from '../api/languages'
import { City, SupportedLanguage, TranslationMap } from '../types'
import Card, { CardHeader } from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Loading from '../components/Loading'
import Alert from '../components/Alert'

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
    nameTranslations: { en: '' },
    active: true, // Changé à true par défaut
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
      // ✅ Filter to only show ACTIVE languages
      const activeLangs = data.filter((lang: SupportedLanguage) => lang.active)
      console.log('✅ Active languages in CityForm:', activeLangs.map(l => l.code))
      setLanguages(activeLangs)
    } catch (err: any) {
      setError('Error lors du chargement des langues')
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
      setError(err.message || 'Error lors du chargement de la ville')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // ✅ Vérifier qu'at least one langue active a une traduction
    const hasTranslation = Object.values(formData.nameTranslations).some(val => val?.trim())
    if (!hasTranslation) {
      setError('Au moins une traduction du nom is required')
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
      const errorMessage = err.response?.data?.message || err.message || 'Error lors de l\'enregistrement'
      console.error('Form submission error:', err.response?.data || err)
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleTranslationChange = (lang: string, value: string) => {
    setFormData({
      ...formData,
      nameTranslations: {
        ...formData.nameTranslations,
        [lang]: value,
      },
    })
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <Loading text="Chargement..." />
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
          title={isEdit ? 'Edit la ville' : 'New City'}
          subtitle={isEdit ? 'Modifiez les informations de la ville' : 'Ajoutez une nouvelle ville au système'}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Translations */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Traductions du nom</h3>
            
            {!isEdit && (
              <Alert variant="info">
                ℹ️ <strong>Lors de la création</strong>, seule la traduction anglaise is required. 
                Les autres langues sont optionnelles mais peuvent être ajoutées maintenant ou plus tard.
              </Alert>
            )}
            
            {languages.map((lang) => (
              <Input
                key={lang.code}
                label={`Name (${lang.name})`}
                placeholder={`Entrez le nom en ${lang.name.toLowerCase()}`}
                value={formData.nameTranslations[lang.code] || ''}
                onChange={(e) => handleTranslationChange(lang.code, e.target.value)}
                required={lang.code === 'en'}
              />
            ))}
          </div>

          {/* Active status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-700">
              City active
            </label>
          </div>

          {/* Actions */}
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
