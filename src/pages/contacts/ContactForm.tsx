import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createContact, updateContact, getAdminContacts } from '../../api/contacts'
import { getSupportedLanguages, SupportedLanguage } from '../../api/languages'
import Card, { CardHeader } from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Alert from '../../components/Alert'
import Loading from '../../components/Loading'

export default function ContactForm(){
  const { id } = useParams()
  const nav = useNavigate()
  const isEdit = Boolean(id)

  const [languages, setLanguages] = useState<SupportedLanguage[]>([])
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [link, setLink] = useState('')
  const [icon, setIcon] = useState('')
  const [active, setActive] = useState(true)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Field-specific errors
  const [fieldErrors, setFieldErrors] = useState<{
    link?: string
    translations?: string
  }>({})

  useEffect(() => {
    loadLanguages()
    if (isEdit) loadContact()
  }, [id])

  async function loadLanguages(){
    try {
      const data = await getSupportedLanguages(true)
      const allLangs = Array.isArray(data) ? data : []
      const activeLangs = allLangs.filter((lang: SupportedLanguage) => lang.active)
      
      setLanguages(activeLangs)
      const initial: Record<string, string> = {}
      activeLangs.forEach((l: SupportedLanguage) => initial[l.code] = '')
      setTranslations(initial)
    } catch (e) {
      console.error('Failed to load languages', e)
      setError('Failed to load languages')
    }
  }

  async function loadContact(){
    try {
      setLoading(true)
      const data = await getAdminContacts()
      const contacts = Array.isArray(data) ? data : []
      const contact = contacts.find((c: any) => c.id === id)
      if (contact) {
        setTranslations(contact.nameTranslations || {})
        setLink(contact.link || '')
        setIcon(contact.icon || '')
        setActive(contact.active)
      } else {
        setError('Contact not found')
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Failed to load contact')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    setSaving(true)
    setError(null)
    setFieldErrors({})

    const nameTranslations: any = {}
    Object.keys(translations).forEach(code => {
      if (translations[code]?.trim()) nameTranslations[code] = translations[code].trim()
    })

    const errors: typeof fieldErrors = {}
    let hasErrors = false

    if (Object.keys(nameTranslations).length === 0) {
      errors.translations = 'At least one translation is required'
      hasErrors = true
    }

    if (!link?.trim()) {
      errors.link = 'Link is required'
      hasErrors = true
    }

    if (hasErrors) {
      setFieldErrors(errors)
      setSaving(false)
      return
    }

    try {
      const payload: any = { 
        nameTranslations, 
        link: link.trim(),
        icon: icon?.trim() || '',
        active 
      }
      
      if (isEdit && id) {
        await updateContact(id, payload)
      } else {
        await createContact(payload)
      }
      nav('/contacts')
    } catch (e: any) {
      const errorData = e?.response?.data?.data
      let errorMessage = e?.response?.data?.message || e.message || 'Failed to save contact'
      
      if (errorData && typeof errorData === 'object') {
        const validationErrors = Object.entries(errorData)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(', ')
        errorMessage = `${errorMessage} - ${validationErrors}`
      }
      
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
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
          title={isEdit ? 'Edit Contact' : 'Create Contact'}
          subtitle={isEdit ? 'Update contact information' : 'Add a new contact to the system'}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Name Translations</h3>
            
            {!isEdit && (
              <Alert variant="info">
                At least one translation is required. You can add more languages later.
              </Alert>
            )}
            
            {fieldErrors.translations && (
              <Alert variant="danger">
                {fieldErrors.translations}
              </Alert>
            )}
            
            {languages.map(lang => (
              <Input
                key={lang.code}
                label={`Name (${lang.name})`}
                placeholder={`Enter name in ${lang.name}`}
                value={translations[lang.code] || ''}
                onChange={e => setTranslations(prev => ({ ...prev, [lang.code]: e.target.value }))}
                required={lang.code === 'en'}
              />
            ))}
          </div>

          <Input
            label="Link (URL/Email/Phone)"
            type="text"
            value={link}
            onChange={e => {
              setLink(e.target.value)
              if (fieldErrors.link) {
                setFieldErrors(prev => ({ ...prev, link: undefined }))
              }
            }}
            placeholder="https://example.com or email@example.com or +123456789"
            hint="URL, email, phone, or any link format"
            error={fieldErrors.link}
            required
          />

          <Input
            label="Icon URL (Optional)"
            type="text"
            value={icon}
            onChange={e => setIcon(e.target.value)}
            placeholder="https://example.com/icon.png"
            hint="Leave empty if no icon"
          />

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={active}
              onChange={e => setActive(e.target.checked)}
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
              onClick={() => nav('/contacts')}
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
