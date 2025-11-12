import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getAdminContacts, Contact } from '../api/contacts'
import { getSupportedLanguages, SupportedLanguage } from '../api/languages'

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>()
  const [contact, setContact] = useState<Contact | null>(null)
  const [languages, setLanguages] = useState<SupportedLanguage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadContactDetail()
  }, [id])

  async function loadContactDetail() {
    setLoading(true)
    setError(null)
    try {
      const contactsRes = await getAdminContacts()
      const responseData: any = contactsRes.data
      const contacts = responseData?.data || responseData || []
      const foundContact = contacts.find((c: Contact) => c.id === id)
      
      if (!foundContact) {
        setError('Contact not found')
        return
      }
      setContact(foundContact)

      const langRes = await getSupportedLanguages(true)
      const langs = Array.isArray(langRes) ? langRes : (langRes.data || [])
      setLanguages(langs)
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Failed to load contact details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!contact) return <div className="p-6">Contact not found</div>

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Contact Details</h2>
        <div className="flex gap-2">
          <Link to={`/contacts/${id}/edit`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Edit
          </Link>
          <Link to="/contacts" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
            Back to List
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
            <p className="text-gray-900">{contact.id}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <span className={`px-3 py-1 text-sm rounded ${contact.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {contact.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Name Translations</label>
          <div className="grid grid-cols-2 gap-4">
            {languages.map(lang => (
              <div key={lang.code} className="border rounded p-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">{lang.name} ({lang.code})</label>
                <p className="text-gray-900">{(contact.nameTranslations as any)?.[lang.code] || '-'}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
          <a href={contact.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
            {contact.link}
          </a>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
            <p className="text-gray-900">{contact.createdAt ? new Date(contact.createdAt).toLocaleString() : '-'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Updated At</label>
            <p className="text-gray-900">{contact.updatedAt ? new Date(contact.updatedAt).toLocaleString() : '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
            <p className="text-gray-900">{contact.createdBy || '-'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Updated By</label>
            <p className="text-gray-900">{contact.updatedBy || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
