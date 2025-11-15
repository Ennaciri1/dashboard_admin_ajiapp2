import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createSupportedLanguage, getAdminSupportedLanguages, updateSupportedLanguage, SupportedLanguage } from '../../api/languages'
import Alert from '../../components/Alert'
import Button from '../../components/Button'

export default function LanguageForm(){
  const { id } = useParams()
  const nav = useNavigate()
  const isEdit = Boolean(id)

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [active, setactive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { 
    if (isEdit) loadLanguage() 
  }, [id, isEdit])

  async function loadLanguage(){
    try{
      // ✅ Load TOUTES les langues (actives ET inactives) pour l'édition
      // Sans passer active=true, on récupère toutes les langues
      const res = await getAdminSupportedLanguages(undefined)
      // getAdminSupportedLanguages returns array directly
      const langs: SupportedLanguage[] = Array.isArray(res) ? res : []
      console.log('📋 All languages loaded:', langs.map(l => `${l.code} (${l.active ? 'active' : 'inactive'})`))
      
      const lang = langs.find(l => l.id === id)
      if (lang){
        console.log('✅ Language found:', lang)
        setCode(lang.code)
        setName(lang.name)
        setactive(lang.active)
      } else {
        setError('Language not found')
      }
    }catch(e:any){
      console.error('❌ Load language error:', e)
      setError(e?.response?.data?.message || e.message || 'Failed to load language')
    }
  }

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    // Validation du code
    if (!code?.trim()) {
      setError('Language code is required')
      setLoading(false)
      return
    }
    
    if (!name?.trim()) {
      setError('Language name is required')
      setLoading(false)
      return
    }
    
    try{
      if (isEdit && id){
        // ✅ Backend requires 'code' field even in edit mode
        // Code value won't be changed backend-side, but must be sent
        console.log('📤 Updating language:', { code, name, active })
        await updateSupportedLanguage(id, { code: code.trim(), name: name.trim(), active })
      } else {
        // ✅ Create mode: vérifier si la langue existe déjà
        const existingLangs = await getAdminSupportedLanguages(undefined)
        const langs: SupportedLanguage[] = Array.isArray(existingLangs) ? existingLangs : []
        
        const languageExists = langs.some(l => l.code.toLowerCase() === code.trim().toLowerCase())
        if (languageExists) {
          setError(`Language with code '${code.trim()}' already exists. Please use a different code.`)
          setLoading(false)
          return
        }
        
        console.log('📤 Creating language:', { code, name, active })
        await createSupportedLanguage({ code: code.trim(), name: name.trim(), active })
      }
      nav('/languages')
    }catch(e:any){
      console.error('❌ Save error:', e)
      console.error('Response:', e?.response?.data)
      
      // Message d'erreur plus clair pour le conflit
      if (e?.response?.status === 409) {
        setError(e?.response?.data?.message || `Language with code '${code}' already exists`)
      } else {
        setError(e?.response?.data?.message || e.message || 'Failed to save language')
      }
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          {isEdit ? 'Edit Language' : 'Create Language'}
        </h2>
        <p className="text-gray-600 mt-1">
          {isEdit ? 'Edit language information' : 'Add a new supported language'}
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <Alert variant="danger">{error}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow max-w-2xl">
        <div className="space-y-6">
          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language Code (ISO 639-1) <span className="text-red-600">*</span>
            </label>
            <input 
              type="text"
              className={`w-full border rounded-lg px-4 py-2 ${
                isEdit 
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300' 
                  : 'border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
              }`}
              value={code} 
              onChange={e=>setCode(e.target.value)} 
              placeholder="en, fr, ar..."
              maxLength={2}
              required 
              disabled={isEdit}
              readOnly={isEdit}
            />
            <p className="text-xs text-gray-500 mt-1">
              {isEdit 
                ? '⚠️ Language code cannot be modified after creation' 
                : '2-letter ISO code (e.g. en, fr, ar)'
              }
            </p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language Name <span className="text-red-600">*</span>
            </label>
            <input 
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
              value={name} 
              onChange={e=>setName(e.target.value)} 
              placeholder="English, Français, العربية..."
              required 
            />
            <p className="text-xs text-gray-500 mt-1">
              Full language name
            </p>
          </div>

          {/* Active status */}
          <div className="flex items-center">
            <input 
              id="active" 
              type="checkbox" 
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" 
              checked={active} 
              onChange={e=>setactive(e.target.checked)} 
            />
            <label htmlFor="active" className="ml-2 text-sm text-gray-700">
              Active language (available for translations)
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
          <Button type="button" onClick={()=>nav('/languages')} variant="secondary">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
