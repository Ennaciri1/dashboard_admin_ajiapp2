import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getAdminCities, City } from '../api/cities'
import { getAdminSupportedLanguages, SupportedLanguage } from '../api/languages'

export default function CityDetail() {
  const { id } = useParams<{ id: string }>()
  const [city, setCity] = useState<City | null>(null)
  const [languages, setLanguages] = useState<SupportedLanguage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCityDetail()
  }, [id])

  async function loadCityDetail() {
    setLoading(true)
    setError(null)
    try {
      // Fetch all cities and find the specific one
      const citiesRes = await getAdminCities()
      const responseData: any = citiesRes.data
      const cities = responseData?.data || responseData || []
      const foundCity = cities.find((c: City) => c.id === id)
      
      if (!foundCity) {
        setError('City not found')
        return
      }
      setCity(foundCity)

      // Load languages
      const langRes = await getAdminSupportedLanguages()
      const langData: any = langRes.data
      const langs = langData?.data || langData || []
      setLanguages(Array.isArray(langs) ? langs : [])
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Failed to load city details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!city) return <div className="p-6">City not found</div>

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">City Details</h2>
        <div className="flex gap-2">
          <Link to={`/cities/${id}/edit`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Edit
          </Link>
          <Link to="/cities" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
            Back to List
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
            <p className="text-gray-900">{city.id}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <span className={`px-3 py-1 text-sm rounded ${city.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {city.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Name Translations</label>
          <div className="grid grid-cols-2 gap-4">
            {languages.map(lang => (
              <div key={lang.code} className="border rounded p-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">{lang.name} ({lang.code})</label>
                <p className="text-gray-900">{(city.nameTranslations as any)?.[lang.code] || '-'}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
            <p className="text-gray-900">{city.createdAt ? new Date(city.createdAt).toLocaleString() : '-'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Updated At</label>
            <p className="text-gray-900">{city.updatedAt ? new Date(city.updatedAt).toLocaleString() : '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
            <p className="text-gray-900">{city.createdBy || '-'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Updated By</label>
            <p className="text-gray-900">{city.updatedBy || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
