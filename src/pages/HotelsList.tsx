import React, { useEffect, useState } from 'react'
import { getAdminHotels, deleteHotel, Hotel } from '../api/hotels'
import { getAdminSupportedLanguages, SupportedLanguage } from '../api/languages'
import { getAdminCities, City } from '../api/cities'
import { PageHeader, LinkButton } from '../components/UI'
import { Table, TableRow, TableCell } from '../components/Table'
import { Badge } from '../components/Badge'
import { ActionMenu } from '../components/ActionMenu'
import { TableSkeleton } from '../components/Loading'
import { PlusIcon } from '../assets/icons'

export default function HotelsList(){
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [languages, setLanguages] = useState<SupportedLanguage[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [selectedLang, setSelectedLang] = useState<string>('en')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [cityFilter, setCityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load(){
    setLoading(true)
    try{
      const res = await getAdminHotels()
      const responseData: any = res.data
      const hotelsData = responseData?.data || responseData || []
      setHotels(Array.isArray(hotelsData) ? hotelsData : [])
      
      // Load languages
      const langRes = await getAdminSupportedLanguages()
      const langData: any = langRes.data
      const langs = langData?.data || langData || []
      setLanguages(Array.isArray(langs) ? langs : [])
      
      // Load cities
      const citiesRes = await getAdminCities()
      const citiesData: any = citiesRes.data
      const citiesList = citiesData?.data || citiesData || []
      setCities(Array.isArray(citiesList) ? citiesList : [])
    }catch(e: any){
      setError(e?.response?.data?.message || e.message)
    }finally{ setLoading(false) }
  }

  function getCityName(cityId: string): string {
    const city = cities.find(c => c.id === cityId)
    return (city?.nameTranslations as any)?.[selectedLang] || city?.nameTranslations?.en || cityId
  }

  useEffect(()=>{ load() }, [])

  async function handleDelete(id: string){
    if (!confirm('Delete this hotel?')) return
    try{
      await deleteHotel(id)
      setHotels(prev => prev.filter(h => h.id !== id))
    }catch(e:any){ alert(e?.response?.data?.message || e.message) }
  }

  // Filter hotels based on search, city, and status
  const filteredHotels = hotels.filter(hotel => {
    const name = (hotel.nameTranslations as any)?.[selectedLang] || hotel.nameTranslations?.en || ''
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCity = cityFilter === 'all' || hotel.cityId === cityFilter
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && hotel.isActive) || 
                         (statusFilter === 'inactive' && !hotel.isActive)
    return matchesSearch && matchesCity && matchesStatus
  })

  return (
    <div className="px-8 py-6">
      <PageHeader 
        title="Hotels" 
        icon="🏨"
        actions={
          <div className="flex items-center gap-3">
            <select 
              value={selectedLang} 
              onChange={(e) => setSelectedLang(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-[#97051D] focus:border-transparent"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
            <LinkButton to="/hotels/new" className="flex items-center gap-2">
              <PlusIcon />
              New Hotel
            </LinkButton>
          </div>
        }
      />
      
      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[250px]">
          <input
            type="text"
            placeholder="Search hotels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#97051D] focus:border-transparent"
          />
        </div>
        <div>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-[#97051D] focus:border-transparent"
          >
            <option value="all">All Cities</option>
            {cities.map(city => (
              <option key={city.id} value={city.id}>
                {(city.nameTranslations as any)?.[selectedLang] || city.nameTranslations?.en}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-[#97051D] focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="text-sm text-gray-600">
          Showing {filteredHotels.length} of {hotels.length} hotels
        </div>
      </div>
      
      {loading && <TableSkeleton rows={5} columns={5} />}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-slideDown">{error}</div>}
      
      {!loading && !error && (
        <div className="animate-fadeIn">
          <Table>
        <thead>
          <TableRow>
            <TableCell header>Name</TableCell>
            <TableCell header>City</TableCell>
            <TableCell header>Min Price</TableCell>
            <TableCell header>Rating</TableCell>
            <TableCell header>Status</TableCell>
            <TableCell header>Actions</TableCell>
          </TableRow>
        </thead>
        <tbody>
          {filteredHotels.length === 0 ? (
            <TableRow>
              <TableCell className="text-center text-gray-500 py-8">No hotels found</TableCell>
              <TableCell> </TableCell>
              <TableCell> </TableCell>
              <TableCell> </TableCell>
              <TableCell> </TableCell>
              <TableCell> </TableCell>
            </TableRow>
          ) : (
            filteredHotels.map(h => (
            <TableRow key={h.id}>
              <TableCell>{(h.nameTranslations as any)?.[selectedLang] || h.nameTranslations?.en || '-'}</TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">{getCityName(h.cityId)}</span>
              </TableCell>
              <TableCell>${h.minPrice || 0}</TableCell>
              <TableCell>
                {h.rating ? `${h.rating.toFixed(1)} ⭐ (${h.ratingCount})` : 'No ratings'}
              </TableCell>
              <TableCell>
                <Badge variant={h.isActive ? 'success' : 'gray'}>
                  {h.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                <ActionMenu
                  viewLink={`/hotels/${h.id}/view`}
                  editLink={`/hotels/${h.id}/edit`}
                  onDelete={() => handleDelete(h.id)}
                />
              </TableCell>
            </TableRow>
          )))}
        </tbody>
      </Table>
        </div>
      )}
    </div>
  )
}
