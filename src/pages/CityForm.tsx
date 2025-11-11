import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createCity, updateCity, getAdminCities, NameTranslations } from '../api/cities'
import { getSupportedLanguages, SupportedLanguage } from '../api/languages'
import { EditIcon, PlusIcon } from '../assets/icons'

export default function CityForm(){
  const { id } = useParams()
  const nav = useNavigate()
  const isEdit = Boolean(id)

  const [languages, setLanguages] = useState<SupportedLanguage[]>([])
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      await loadLanguages()
      if (isEdit) await loadCity()
    }
    init()
  }, [id])

  async function loadLanguages(){
    try {
      const res = await getSupportedLanguages(true)
      const langs = res.data || []
      setLanguages(langs)
      // Initialize translations object
      const initial: Record<string, string> = {}
      langs.forEach((l: SupportedLanguage) => initial[l.code] = '')
      setTranslations(initial)
    } catch (e: any) {
      console.error('Failed to load languages', e)
    }
  }

  async function loadCity(){
    try {
      const res = await getAdminCities()
      const cities = res.data || []
      const city = cities.find((c: any) => c.id === id)
      if (city) {
        // Merge with existing translations to ensure all language codes have values
        setTranslations(prev => ({ ...prev, ...(city.nameTranslations || {}) }))
        setIsActive(city.isActive)
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message)
    }
  }

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Build payload with only non-empty translations
    const nameTranslations: any = {}
    Object.keys(translations).forEach(code => {
      if (translations[code]?.trim()) nameTranslations[code] = translations[code].trim()
    })

    if (!nameTranslations.en) {
      setError('English translation is required')
      setLoading(false)
      return
    }

    try {
      if (isEdit && id) {
        await updateCity(id, { nameTranslations, isActive })
      } else {
        await createCity({ nameTranslations, isActive })
      }
      nav('/cities')
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Failed to save city')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-8 py-6">
      <div className="mb-8 flex items-center gap-3">
        {isEdit ? (
          <EditIcon className="w-8 h-8 text-[#97051D]" />
        ) : (
          <PlusIcon className="w-8 h-8 text-[#97051D]" />
        )}
        <h2 className="text-3xl font-bold text-gray-900">{isEdit ? 'Edit City' : 'Create City'}</h2>
      </div>
      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-8 rounded-lg max-w-3xl">
        <div className="space-y-6">
          {languages.map(lang => (
            <div key={lang.code}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {lang.name} ({lang.code}) {lang.code === 'en' && <span className="text-red-600">*</span>}
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#97051D] focus:border-transparent transition-all"
                value={translations[lang.code] || ''}
                onChange={e => setTranslations(prev => ({ ...prev, [lang.code]: e.target.value }))}
                required={lang.code === 'en'}
              />
            </div>
          ))}
          <div className="flex items-center pt-4">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              className="w-4 h-4 text-[#97051D] border-gray-300 rounded focus:ring-[#97051D]"
            />
            <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">Active</label>
          </div>
        </div>
        <div className="mt-8 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#97051D] hover:bg-[#7a0418] text-white px-6 py-3 rounded-lg disabled:opacity-50 font-medium transition-all"
          >
            {loading ? 'Saving...' : 'Save City'}
          </button>
          <button
            type="button"
            onClick={() => nav('/cities')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
