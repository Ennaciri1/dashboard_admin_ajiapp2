import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createSupportedLanguage, getAdminSupportedLanguages, updateSupportedLanguage, SupportedLanguage } from '../api/languages'

export default function LanguageForm(){
  const { id } = useParams()
  const nav = useNavigate()
  const isEdit = Boolean(id)

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { if (isEdit) loadLanguage() }, [id])

  async function loadLanguage(){
    try{
      const res = await getAdminSupportedLanguages()
      const langs: SupportedLanguage[] = res.data || []
      const lang = langs.find(l => l.id === id)
      if (lang){
        setCode(lang.code)
        setName(lang.name)
        setIsActive(lang.isActive)
      }
    }catch(e:any){
      setError(e?.response?.data?.message || e.message)
    }
  }

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    setError(null)
    setLoading(true)
    try{
      if (isEdit && id){
        await updateSupportedLanguage(id, { code, name, isActive })
      } else {
        await createSupportedLanguage({ code, name, isActive })
      }
      nav('/languages')
    }catch(e:any){
      setError(e?.response?.data?.message || e.message || 'Failed to save language')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">{isEdit ? 'Edit Language' : 'Create Language'}</h2>
      </div>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow max-w-xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Code (ISO 639-1)</label>
            <input className="w-full border px-3 py-2 rounded" value={code} onChange={e=>setCode(e.target.value)} placeholder="en" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input className="w-full border px-3 py-2 rounded" value={name} onChange={e=>setName(e.target.value)} placeholder="English" required />
          </div>
          <div className="flex items-center">
            <input id="isActive" type="checkbox" className="mr-2" checked={isActive} onChange={e=>setIsActive(e.target.checked)} />
            <label htmlFor="isActive" className="text-sm">Active</label>
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">{loading? 'Saving...' : 'Save'}</button>
          <button type="button" onClick={()=>nav('/languages')} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
        </div>
      </form>
    </div>
  )
}
