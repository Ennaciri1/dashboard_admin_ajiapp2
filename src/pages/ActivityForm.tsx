import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createActivity, updateActivity, getOwnerActivities } from '../api/activities'
import { getSupportedLanguages, SupportedLanguage } from '../api/languages'

export default function ActivityForm(){
  const { id } = useParams()
  const nav = useNavigate()
  const isEdit = Boolean(id)

  const [languages, setLanguages] = useState<SupportedLanguage[]>([])
  const [titleTranslations, setTitleTranslations] = useState<Record<string, string>>({})
  const [descTranslations, setDescTranslations] = useState<Record<string, string>>({})
  const [price, setPrice] = useState('')
  const [tags, setTags] = useState('')
  const [images, setImages] = useState('')
  const [isActive, setIsActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      await loadLanguages()
      if (isEdit) await loadActivity()
    }
    init()
  }, [id])

  async function loadLanguages(){
    try {
      const res = await getSupportedLanguages(true)
      const langs = res.data || []
      setLanguages(langs)
      const initial: Record<string, string> = {}
      langs.forEach((l: SupportedLanguage) => initial[l.code] = '')
      setTitleTranslations(initial)
      setDescTranslations({...initial})
    } catch (e: any) {
      console.error('Failed to load languages', e)
    }
  }

  async function loadActivity(){
    try {
      const res = await getOwnerActivities()
      const activities = res.data || []
      const activity = activities.find((a: any) => a.id === id)
      if (activity) {
        // Merge with existing translations to ensure all language codes have values
        setTitleTranslations(prev => ({ ...prev, ...(activity.titleTranslations || {}) }))
        setDescTranslations(prev => ({ ...prev, ...(activity.descriptionTranslations || {}) }))
        setPrice(activity.price?.toString() || '')
        setTags(activity.tags?.join(', ') || '')
        setImages(activity.images?.join(', ') || '')
        setIsActive(activity.isActive)
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message)
    }
  }

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    setLoading(true)
    setError(null)

    const title: any = {}
    Object.keys(titleTranslations).forEach(code => {
      if (titleTranslations[code]?.trim()) title[code] = titleTranslations[code].trim()
    })

    const desc: any = {}
    Object.keys(descTranslations).forEach(code => {
      if (descTranslations[code]?.trim()) desc[code] = descTranslations[code].trim()
    })

    if (!title.en || !desc.en) {
      setError('English translations for title and description are required')
      setLoading(false)
      return
    }

    try {
      const payload: any = {
        titleTranslations: title,
        descriptionTranslations: desc,
        price: parseFloat(price)
      }
      if (tags) payload.tags = tags.split(',').map(t => t.trim()).filter(Boolean)
      if (images) payload.images = images.split(',').map(i => i.trim()).filter(Boolean)
      if (isEdit) payload.isActive = isActive
      
      if (isEdit && id) {
        await updateActivity(id, payload)
      } else {
        await createActivity(payload)
      }
      nav('/activities')
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Failed to save activity')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">{isEdit ? 'Edit Activity' : 'Create Activity'}</h2>
      </div>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow max-w-2xl">
        <div className="space-y-4">
          <div className="font-semibold text-lg border-b pb-2">Title Translations</div>
          {languages.map(lang => (
            <div key={`title-${lang.code}`}>
              <label className="block text-sm font-medium mb-1">
                Title - {lang.name} ({lang.code}) {lang.code === 'en' && <span className="text-red-600">*</span>}
              </label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded"
                value={titleTranslations[lang.code] || ''}
                onChange={e => setTitleTranslations(prev => ({ ...prev, [lang.code]: e.target.value }))}
                required={lang.code === 'en'}
              />
            </div>
          ))}
          
          <div className="font-semibold text-lg border-b pb-2 mt-6">Description Translations</div>
          {languages.map(lang => (
            <div key={`desc-${lang.code}`}>
              <label className="block text-sm font-medium mb-1">
                Description - {lang.name} ({lang.code}) {lang.code === 'en' && <span className="text-red-600">*</span>}
              </label>
              <textarea
                className="w-full border px-3 py-2 rounded"
                rows={3}
                value={descTranslations[lang.code] || ''}
                onChange={e => setDescTranslations(prev => ({ ...prev, [lang.code]: e.target.value }))}
                required={lang.code === 'en'}
              />
            </div>
          ))}

          <div className="font-semibold text-lg border-b pb-2 mt-6">Activity Details</div>
          <div>
            <label className="block text-sm font-medium mb-1">Price ($) <span className="text-red-600">*</span></label>
            <input type="number" step="0.01" className="w-full border px-3 py-2 rounded" value={price} onChange={e=>setPrice(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
            <input type="text" className="w-full border px-3 py-2 rounded" value={tags} onChange={e=>setTags(e.target.value)} placeholder="adventure, outdoor, desert" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Images (comma-separated URLs)</label>
            <textarea className="w-full border px-3 py-2 rounded" rows={2} value={images} onChange={e=>setImages(e.target.value)} placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg" />
          </div>
          {isEdit && (
            <div className="flex items-center">
              <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="mr-2" />
              <label htmlFor="isActive" className="text-sm">Active</label>
            </div>
          )}
        </div>
        <div className="mt-6 flex gap-2">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">{loading ? 'Saving...' : 'Save'}</button>
          <button type="button" onClick={() => nav('/activities')} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
        </div>
      </form>
    </div>
  )
}
