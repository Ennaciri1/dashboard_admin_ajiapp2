import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createContact, updateContact, getAdminContacts } from '../api/contacts'
import { getSupportedLanguages, SupportedLanguage } from '../api/languages'

export default function ContactForm(){
  const { id } = useParams()
  const nav = useNavigate()
  const isEdit = Boolean(id)

  const [languages, setLanguages] = useState<SupportedLanguage[]>([])
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [link, setLink] = useState('')
  const [icon, setIcon] = useState('')
  const [active, setactive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadLanguages()
    if (isEdit) loadContact()
  }, [id])

  async function loadLanguages(){
    try {
      const res = await getSupportedLanguages(true)
      // getSupportedLanguages returns array directly
      const allLangs = Array.isArray(res) ? res : (res.data || [])
      
      // ✅ Filter to only show ACTIVE languages
      const activeLangs = allLangs.filter((lang: SupportedLanguage) => lang.active)
      console.log('✅ Active languages in ContactForm:', activeLangs.map(l => l.code))
      
      setLanguages(activeLangs)
      const initial: Record<string, string> = {}
      activeLangs.forEach((l: SupportedLanguage) => initial[l.code] = '')
      setTranslations(initial)
    } catch (e: any) {
      console.error('Failed to load languages', e)
    }
  }

  async function loadContact(){
    try {
      const res = await getAdminContacts()
      // getAdminContacts returns array directly
      const contacts = Array.isArray(res) ? res : (res.data || [])
      const contact = contacts.find((c: any) => c.id === id)
      if (contact) {
        setTranslations(contact.nameTranslations || {})
        setLink(contact.link || '')
        setIcon(contact.icon || '')
        setactive(contact.active)
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message)
    }
  }

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    setLoading(true)
    setError(null)

    const nameTranslations: any = {}
    Object.keys(translations).forEach(code => {
      if (translations[code]?.trim()) nameTranslations[code] = translations[code].trim()
    })

    // ✅ Vérifier qu'at least one langue active a une traduction
    if (Object.keys(nameTranslations).length === 0) {
      setError('Au moins une traduction du nom is required')
      setLoading(false)
      return
    }

    if (!link?.trim()) {
      setError('Link is required')
      setLoading(false)
      return
    }

    try {
      const payload: any = { 
        nameTranslations, 
        link: link.trim(), 
        icon: icon?.trim() || undefined,  // Envoyer icon seulement si fourni, sinon undefined
        active 
      }
      
      console.log('📤 Submitting contact payload:', JSON.stringify(payload, null, 2))
      
      if (isEdit && id) {
        await updateContact(id, payload)
      } else {
        await createContact(payload)
      }
      nav('/contacts')
    } catch (e: any) {
      console.error('❌ Contact submission error:', e)
      console.error('Response data:', e?.response?.data)
      console.error('Validation errors:', JSON.stringify(e?.response?.data?.data, null, 2))
      
      const errorData = e?.response?.data?.data
      let errorMessage = e?.response?.data?.message || e.message || 'Failed to save contact'
      
      // Si des erreurs de validation spécifiques existent
      if (errorData && typeof errorData === 'object') {
        const validationErrors = Object.entries(errorData)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(', ')
        errorMessage = `${errorMessage} - ${validationErrors}`
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">{isEdit ? 'Edit Contact' : 'Create Contact'}</h2>
      </div>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow max-w-2xl">
        <div className="space-y-4">
          {languages.map(lang => (
            <div key={lang.code}>
              <label className="block text-sm font-medium mb-1">
                Name - {lang.name} ({lang.code}) {lang.code === 'en' && <span className="text-red-600">*</span>}
              </label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded"
                value={translations[lang.code] || ''}
                onChange={e => setTranslations(prev => ({ ...prev, [lang.code]: e.target.value }))}
                required={lang.code === 'en'}
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium mb-1">Link (URL/Email/Phone) <span className="text-red-600">*</span></label>
            <input 
              type="text" 
              className="w-full border px-3 py-2 rounded" 
              value={link} 
              onChange={e=>setLink(e.target.value)} 
              placeholder="https://example.com or email@example.com or +123456789"
              required 
            />
            <p className="text-xs text-gray-500 mt-1">
              Format libre: URL, email, téléphone, ou autre lien
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Icon URL (Optionnel)</label>
            <input 
              type="text" 
              className="w-full border px-3 py-2 rounded" 
              value={icon} 
              onChange={e=>setIcon(e.target.value)} 
              placeholder="https://example.com/icon.png"
            />
            <p className="text-xs text-gray-500 mt-1">Laisser vide si vous n'avez pas d'icône</p>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="active" checked={active} onChange={e => setactive(e.target.checked)} className="mr-2" />
            <label htmlFor="active" className="text-sm">Active</label>
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">{loading ? 'Saving...' : 'Save'}</button>
          <button type="button" onClick={() => nav('/contacts')} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
        </div>
      </form>
    </div>
  )
}
