import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getAdminHotels, Hotel } from '../api/hotels'
import { getSupportedLanguages, SupportedLanguage } from '../api/languages'
import { getAllCitiesAdmin } from '../api/cities'
import { City } from '../types'
import { getImageUrl } from '../lib/imageUtils'

export default function HotelDetail() {
  const { id } = useParams<{ id: string }>()
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [languages, setLanguages] = useState<SupportedLanguage[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadHotelDetail()
  }, [id])

  async function loadHotelDetail() {
    setLoading(true)
    setError(null)
    try {
      const hotelsRes = await getAdminHotels()
      // getAdminHotels already extracts data, returns array directly
      const hotels = Array.isArray(hotelsRes) ? hotelsRes : []
      const foundHotel = hotels.find((h: Hotel) => h.id === id)
      
      if (!foundHotel) {
        setError('Hotel not found')
        return
      }
      setHotel(foundHotel)

      const langRes = await getSupportedLanguages(true)
      const langs = Array.isArray(langRes) ? langRes : (langRes.data || [])
      setLanguages(langs)

      const citiesRes = await getAllCitiesAdmin()
      const citiesList = Array.isArray(citiesRes) ? citiesRes : (citiesRes.data || [])
      setCities(citiesList)
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Failed to load hotel details')
    } finally {
      setLoading(false)
    }
  }

  function getCityName(cityId: string): string {
    const city = cities.find(c => c.id === cityId)
    return city?.nameTranslations?.en || cityId
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!hotel) return <div className="p-6">Hotel not found</div>

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Hotel Details</h2>
        <div className="flex gap-2">
          <Link to={`/hotels/${id}/edit`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Edit
          </Link>
          <Link to="/hotels" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
            Back to List
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
            <p className="text-gray-900">{hotel.id}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <span className={`px-3 py-1 text-sm rounded ${hotel.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {hotel.active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <p className="text-gray-900">{getCityName(hotel.cityId)}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Name Translations</label>
          <div className="grid grid-cols-2 gap-4">
            {languages.map(lang => (
              <div key={lang.code} className="border rounded p-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">{lang.name} ({lang.code})</label>
                <p className="text-gray-900">{(hotel.nameTranslations as any)?.[lang.code] || '-'}</p>
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
                <p className="text-gray-900 text-sm">{(hotel.descriptionTranslations as any)?.[lang.code] || '-'}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <p className="text-gray-900">
              Lat: {hotel.location.latitude}, Lng: {hotel.location.longitude}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
            <p className="text-gray-900">${hotel.minPrice || 0}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <p className="text-gray-900">
              {hotel.rating ? `${hotel.rating.toFixed(1)} ⭐ (${hotel.ratingCount} reviews)` : 'No ratings'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Likes</label>
            <p className="text-gray-900">{hotel.likesCount || 0}</p>
          </div>
        </div>

        {hotel.images && hotel.images.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Images</label>
            <div className="grid grid-cols-3 gap-4">
              {hotel.images.map((img, idx) => (
                <div key={idx} className="border rounded overflow-hidden">
                  <img src={getImageUrl(img.url)} alt={img.alt || `Hotel image ${idx + 1}`} className="w-full h-48 object-cover" />
                  {img.alt && <p className="p-2 text-xs text-gray-600">{img.alt}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
            <p className="text-gray-900">{hotel.createdAt ? new Date(hotel.createdAt).toLocaleString() : '-'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Updated At</label>
            <p className="text-gray-900">{hotel.updatedAt ? new Date(hotel.updatedAt).toLocaleString() : '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
            <p className="text-gray-900">{hotel.createdBy || '-'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Updated By</label>
            <p className="text-gray-900">{hotel.updatedBy || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
