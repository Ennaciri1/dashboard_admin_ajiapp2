import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createHotel, updateHotel, getAdminHotels, HotelImage } from '../../api/hotels'
import { getSupportedLanguages, SupportedLanguage } from '../../api/languages'
import { getAdminCities, City } from '../../api/cities'
import { uploadImage, deleteImage } from '../../api/images'
import { EditIcon, PlusIcon } from '../../assets/icons'
import { getImageUrl } from '../../lib/utils'
import FormSection from '../../components/FormSection'
import FormActionsBar from '../../components/FormActionsBar'
import MapPicker from '../../components/MapPicker'

export default function HotelForm(){
  const { id } = useParams()
  const nav = useNavigate()
  const isEdit = Boolean(id)

  const [languages, setLanguages] = useState<SupportedLanguage[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [nameTranslations, setNameTranslations] = useState<Record<string, string>>({})
  const [descTranslations, setDescTranslations] = useState<Record<string, string>>({})
  const [cityId, setCityId] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [images, setImages] = useState<HotelImage[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [active, setactive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      await loadLanguages()
      loadCities()
      if (isEdit) await loadHotel()
    }
    init()
  }, [id])

  async function loadLanguages(){
    try {
      const res = await getSupportedLanguages(true)
      const allLangs = Array.isArray(res) ? res : (res.data || [])
      const activeLangs = allLangs.filter((lang: SupportedLanguage) => lang.active)
      
      setLanguages(activeLangs)
      
      const initial: Record<string, string> = {}
      activeLangs.forEach((l: SupportedLanguage) => initial[l.code] = '')
      setNameTranslations(initial)
      setDescTranslations({...initial})
    } catch (e) {
      console.error('Failed to load languages', e)
    }
  }

  async function loadCities(){
    try {
      const res = await getAdminCities()
      const citiesArr = Array.isArray(res) ? res : (res.data || [])
      setCities(citiesArr)
    } catch (e) {
      console.error('Failed to load cities', e)
    }
  }

  async function loadHotel(){
    try {
      const res = await getAdminHotels()
      const hotels = Array.isArray(res) ? res : (res.data || [])
      const hotel = hotels.find((h: any) => h.id === id)
      if (hotel) {
        setNameTranslations(prev => ({ ...prev, ...(hotel.nameTranslations || {}) }))
        setDescTranslations(prev => ({ ...prev, ...(hotel.descriptionTranslations || {}) }))
        const resolvedCityId = hotel.cityId ?? hotel.city?.id
        setCityId(resolvedCityId ? String(resolvedCityId) : '')
        setLatitude(hotel.location?.latitude?.toString() || '')
        setLongitude(hotel.location?.longitude?.toString() || '')
        setMinPrice(hotel.minPrice?.toString() || '')
        setImages((hotel.images || []).map((img: any) => ({ 
          ...img, 
          owner: img?.owner ?? '', 
          altText: img?.altText ?? '' 
        })))
        setactive(hotel.active)
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload jpg, png, gif, webp, or bmp image.')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setUploadingImage(true)
    setError(null)

    try {
      const res = await uploadImage(file, 'hotels')
      const imageUrl = res.data.imageUrl
      setImages(prev => [...prev, { url: imageUrl, owner: '' }])
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to upload image')
    } finally {
      setUploadingImage(false)
      e.target.value = '' // Reset input
    }
  }

  async function handleRemoveImage(index: number) {
    const confirmed = window.confirm('Are you sure you want to remove this image?')
    if (!confirmed) return

    const imageToRemove = images[index]
    try {
      await deleteImage(imageToRemove.url)
      setImages(prev => prev.filter((_, i) => i !== index))
    } catch (e: any) {
      console.error('Failed to delete image:', e)
      // Still remove from UI even if delete fails
      setImages(prev => prev.filter((_, i) => i !== index))
    }
  }

  function handleUpdateImageOwner(index: number, owner: string) {
    setImages(prev => prev.map((img, i) => i === index ? { ...img, owner } : img))
  }

  function handleUpdateImageAlt(index: number, altText: string) {
    setImages(prev => prev.map((img, i) => i === index ? { ...img, altText } : img))
  }

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    setLoading(true)
    setError(null)

    const name: any = {}
    Object.keys(nameTranslations).forEach(code => {
      if (nameTranslations[code]?.trim()) name[code] = nameTranslations[code].trim()
    })

    const desc: any = {}
    Object.keys(descTranslations).forEach(code => {
      if (descTranslations[code]?.trim()) desc[code] = descTranslations[code].trim()
    })

    if (Object.keys(name).length === 0) {
      setError('At least one name translation is required')
      setLoading(false)
      return
    }

    if (Object.keys(desc).length === 0) {
      setError('At least one description translation is required')
      setLoading(false)
      return
    }

    if (!cityId) {
      setError('City is required')
      setLoading(false)
      return
    }

    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    if (isNaN(lat) || isNaN(lng)) {
      setError('Valid latitude and longitude are required')
      setLoading(false)
      return
    }

    if (images.some(img => !img.owner?.trim())) {
      setError('Please provide the owner/source for every uploaded image')
      setLoading(false)
      return
    }

    try {
      const payload: any = {
        nameTranslations: name,
        descriptionTranslations: desc,
        cityId,
        location: { latitude: lat, longitude: lng }
      }

      if (minPrice) payload.minPrice = parseFloat(minPrice)
      if (images.length > 0) {
        payload.images = images.map(img => ({
          ...img,
          owner: img.owner?.trim() || ''
        }))
      }
      if (isEdit) payload.active = active
      
      if (isEdit && id) {
        await updateHotel(id, payload)
      } else {
        await createHotel(payload)
      }
      nav('/hotels')
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Failed to save hotel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center gap-3">
        {isEdit ? <EditIcon className="w-8 h-8 text-[#97051D]" /> : <PlusIcon className="w-8 h-8 text-[#97051D]" />}
        <h2 className="text-2xl font-semibold">{isEdit ? 'Edit Hotel' : 'Create Hotel'}</h2>
      </div>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {languages.length === 0 ? (
        <div className="p-4 text-gray-600">Loading form...</div>
      ) : (
      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="space-y-6">
          {!isEdit && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    At least one translation is required. Other languages can be added later.
                  </p>
                </div>
              </div>
            </div>
          )}

          <FormSection title="Name Translations" description="Provide the hotel name in available languages. English is required.">
            {languages.map(lang => (
              <div key={`name-${lang.code}`}>
                <label className="block text-sm font-medium mb-1">
                  Name - {lang.name} ({lang.code}) {lang.code === 'en' && <span className="text-red-600">*</span>}
                </label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#97051D]/20"
                  value={nameTranslations[lang.code] || ''}
                  onChange={e => setNameTranslations(prev => ({ ...prev, [lang.code]: e.target.value }))}
                  required={lang.code === 'en'}
                />
              </div>
            ))}
          </FormSection>

          <FormSection title="Description Translations" description="Short description. English is required; others are optional.">
            {languages.map(lang => (
              <div key={`desc-${lang.code}`}>
                <label className="block text-sm font-medium mb-1">
                  Description - {lang.name} ({lang.code}) {lang.code === 'en' && <span className="text-red-600">*</span>}
                </label>
                <textarea
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#97051D]/20"
                  rows={3}
                  value={descTranslations[lang.code] || ''}
                  onChange={e => setDescTranslations(prev => ({ ...prev, [lang.code]: e.target.value }))}
                  required={lang.code === 'en'}
                />
              </div>
            ))}
          </FormSection>

          <FormSection title="Hotel Details" description="City, coordinates, and optional minimum price.">
            <div>
              <label className="block text-sm font-medium mb-1">City <span className="text-red-600">*</span></label>
              <select className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#97051D]/20" value={cityId ?? ''} onChange={e=>setCityId(e.target.value)} required>
                <option value="">Select a city</option>
                {cities.map(c => <option key={c.id} value={String(c.id)}>{c.nameTranslations.en}</option>)}
              </select>
            </div>

                {/* Carte interactive avec recherche intégrée */}
                <div>
                  <label className="block text-sm font-medium mb-2">Emplacement sur la carte</label>
                  <MapPicker
                    latitude={parseFloat(latitude) || 33.9716}
                    longitude={parseFloat(longitude) || -6.8498}
                    onLocationChange={(lat, lng) => {
                      setLatitude(lat.toString())
                      setLongitude(lng.toString())
                    }}
                  />
                </div>

            {/* Affichage des coordonnées */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Latitude <span className="text-red-600">*</span></label>
                <input 
                  type="number" 
                  step="any" 
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary-500/20 bg-gray-50" 
                  value={latitude} 
                  onChange={e => setLatitude(e.target.value)} 
                  required 
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Longitude <span className="text-red-600">*</span></label>
                <input 
                  type="number" 
                  step="any" 
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary-500/20 bg-gray-50" 
                  value={longitude} 
                  onChange={e => setLongitude(e.target.value)} 
                  required 
                  readOnly
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Minimum Price (USD)</label>
              <input type="number" step="0.01" className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#97051D]/20" value={minPrice} onChange={e=>setMinPrice(e.target.value)} />
              <p className="text-xs text-gray-500 mt-1">Leave blank if unknown.</p>
            </div>
            {isEdit && (
              <div className="flex items-center">
                <input type="checkbox" id="active" checked={active} onChange={e => setactive(e.target.checked)} className="mr-2" />
                <label htmlFor="active" className="text-sm">Active (requires all translations to be complete)</label>
              </div>
            )}
          </FormSection>

          <FormSection title="Images" description="Upload images, then set owner/source and optional alt text for accessibility.">
            <div>
              <label className="block text-sm font-medium mb-2">
                Upload Hotel Images
              </label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#97051D] file:text-white hover:file:bg-[#7a0417] file:cursor-pointer disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 mt-1">Max size: 5MB. Formats: JPG, PNG, GIF, WEBP, BMP</p>
              {uploadingImage && <p className="text-sm text-blue-600 mt-2">Uploading...</p>}
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-gray-50">
                    <img src={getImageUrl(img.url)} alt={img.altText || img.owner || 'image'} className="w-full h-40 object-cover rounded" />
                    <div className="mt-2 space-y-2">
                      <div>
                        <label className="block text-xs font-medium mb-1">Owner</label>
                        <input
                          type="text"
                          value={img.owner ?? ''}
                          onChange={(e) => handleUpdateImageOwner(index, e.target.value)}
                          className="w-full border px-2 py-1 rounded text-sm"
                          required
                          placeholder="Image owner/source"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </FormSection>
        </div>

        <FormActionsBar>
          <div className="flex gap-2">
            <button type="button" onClick={() => nav('/hotels')} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded">Cancel</button>
            <button type="submit" disabled={loading} className="bg-[#97051D] hover:bg-[#7a0417] text-white px-4 py-2 rounded disabled:opacity-50">{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </FormActionsBar>
      </form>
      )}
    </div>
  )
}
