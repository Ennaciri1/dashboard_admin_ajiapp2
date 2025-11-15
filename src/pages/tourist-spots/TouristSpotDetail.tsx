import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getAdminTouristSpots, TouristSpot } from '../../api/touristSpots'
import { getAdminSupportedLanguages, SupportedLanguage } from '../../api/languages'
import { getAdminCities, City } from '../../api/cities'
import { getImageUrl } from '../../lib/imageUtils'

export default function TouristSpotDetail() {
  const { id } = useParams<{ id: string }>()
  const [spot, setSpot] = useState<TouristSpot | null>(null)
  const [languages, setLanguages] = useState<SupportedLanguage[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSpotDetail()
  }, [id])

  async function loadSpotDetail() {
    setLoading(true)
    setError(null)
    try {
      const spotsRes = await getAdminTouristSpots()
      // getAdminTouristSpots already extracts data, returns array directly
      const spots = Array.isArray(spotsRes) ? spotsRes : []
      const foundSpot = spots.find((s: TouristSpot) => s.id === id)
      
      if (!foundSpot) {
        setError('Tourist spot not found')
        return
      }
      setSpot(foundSpot)

      const langRes = await getAdminSupportedLanguages()
      const langData: any = langRes.data
      const langs = langData?.data || langData || []
      setLanguages(Array.isArray(langs) ? langs : [])

      const citiesRes = await getAdminCities()
      const citiesData: any = citiesRes.data
      const citiesList = citiesData?.data || citiesData || []
      setCities(Array.isArray(citiesList) ? citiesList : [])
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Failed to load tourist spot details')
    } finally {
      setLoading(false)
    }
  }

  function getCityName(cityId: string, cityObj?: any): string {
    // Prefer the city object from API if available
    if (cityObj?.nameTranslations) {
      return cityObj.nameTranslations?.en || cityId
    }
    // Fallback to looking up in cities array
    const city = cities.find(c => c.id === cityId)
    return city?.nameTranslations?.en || cityId
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!spot) return <div className="p-6">Tourist spot not found</div>

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Tourist Spot Details</h2>
        <div className="flex gap-2">
          <Link to={`/tourist-spots/${id}/edit`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Edit
          </Link>
          <Link to="/tourist-spots" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
            Back to List
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
            <p className="text-gray-900">{spot.id}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <span className={`px-3 py-1 text-sm rounded ${spot.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {spot.active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <p className="text-gray-900">{getCityName(spot.cityId, spot.city)}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Name Translations</label>
          <div className="grid grid-cols-2 gap-4">
            {languages.map(lang => (
              <div key={lang.code} className="border rounded p-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">{lang.name} ({lang.code})</label>
                <p className="text-gray-900">{(spot.nameTranslations as any)?.[lang.code] || '-'}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Description Translations</label>
          <div className="grid grid-cols-2 gap-4">
            {languages.map(lang => (
              <div key={lang.code} className="border rounded p-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">{lang.name} ({lang.code})</label>
                <p className="text-gray-900 text-sm">{(spot.descriptionTranslations as any)?.[lang.code] || '-'}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <p className="text-gray-900">
              Lat: {spot.location.latitude}, Lng: {spot.location.longitude}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paid Entry</label>
            <span className={`px-3 py-1 text-sm rounded ${spot.isPaidEntry ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
              {spot.isPaidEntry ? 'Paid' : 'Free'}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <p className="text-gray-900">
              {spot.rating ? `${spot.rating.toFixed(1)} ⭐ (${spot.ratingCount} reviews)` : 'No ratings'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Likes</label>
            <p className="text-gray-900">{spot.likesCount || 0}</p>
          </div>
        </div>

        {spot.images && spot.images.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Images</label>
            <div className="grid grid-cols-3 gap-4">
              {spot.images.map((img, idx) => (
                <div key={idx} className="border rounded overflow-hidden">
                  <img src={getImageUrl(img.url)} alt={`Tourist spot image ${idx + 1}`} className="w-full h-48 object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
            <p className="text-gray-900">{spot.createdAt ? new Date(spot.createdAt).toLocaleString() : '-'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Updated At</label>
            <p className="text-gray-900">{spot.updatedAt ? new Date(spot.updatedAt).toLocaleString() : '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
            <p className="text-gray-900">{spot.createdBy || '-'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Updated By</label>
            <p className="text-gray-900">{spot.updatedBy || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
