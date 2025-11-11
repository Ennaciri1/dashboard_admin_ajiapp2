import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getAdminSupportedLanguages, SupportedLanguage } from '../api/languages'

export default function LanguageDetail() {
  const { id } = useParams<{ id: string }>()
  const [language, setLanguage] = useState<SupportedLanguage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadLanguageDetail()
  }, [id])

  async function loadLanguageDetail() {
    setLoading(true)
    setError(null)
    try {
      const langRes = await getAdminSupportedLanguages()
      const responseData: any = langRes.data
      const languages = responseData?.data || responseData || []
      const foundLanguage = languages.find((l: SupportedLanguage) => l.id === id)
      
      if (!foundLanguage) {
        setError('Language not found')
        return
      }
      setLanguage(foundLanguage)
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Failed to load language details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!language) return <div className="p-6">Language not found</div>

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Language Details</h2>
        <div className="flex gap-2">
          <Link to={`/languages/${id}/edit`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Edit
          </Link>
          <Link to="/languages" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
            Back to List
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
            <p className="text-gray-900">{language.id}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <span className={`px-3 py-1 text-sm rounded ${language.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {language.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
            <p className="text-gray-900 font-mono">{language.code}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <p className="text-gray-900">{language.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
            <p className="text-gray-900">{language.createdAt ? new Date(language.createdAt).toLocaleString() : '-'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Updated At</label>
            <p className="text-gray-900">{language.updatedAt ? new Date(language.updatedAt).toLocaleString() : '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
            <p className="text-gray-900">{language.createdBy || '-'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Updated By</label>
            <p className="text-gray-900">{language.updatedBy || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
