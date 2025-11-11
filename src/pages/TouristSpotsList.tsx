import React, { useEffect, useState } from 'react'
import { getAdminTouristSpots, deleteTouristSpot, TouristSpot } from '../api/touristSpots'
import { getAdminSupportedLanguages, SupportedLanguage } from '../api/languages'
import { getAdminCities, City } from '../api/cities'
import { PageHeader, LinkButton } from '../components/UI'
import { Table, TableRow, TableCell } from '../components/Table'
import { Badge } from '../components/Badge'
import { ActionMenu } from '../components/ActionMenu'
import { TableSkeleton } from '../components/Loading'
import { PlusIcon } from '../assets/icons'

export default function TouristSpotsList(){
  const [spots, setSpots] = useState<TouristSpot[]>([])
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
      const res = await getAdminTouristSpots()
      const responseData: any = res.data
      const spotsData = responseData?.data || responseData || []
      setSpots(Array.isArray(spotsData) ? spotsData : [])
      
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

  function getCityName(cityId: string, cityObj?: any): string {
    // Prefer the city object from API if available
    if (cityObj?.nameTranslations) {
      return (cityObj.nameTranslations as any)?.[selectedLang] || cityObj.nameTranslations?.en || cityId
    }
    // Fallback to looking up in cities array
    const city = cities.find(c => c.id === cityId)
    return (city?.nameTranslations as any)?.[selectedLang] || city?.nameTranslations?.en || cityId
  }

  useEffect(()=>{ load() }, [])

  async function handleDelete(id: string){
    if (!confirm('Delete this tourist spot?')) return
    try{
      await deleteTouristSpot(id)
      setSpots(prev => prev.filter(s => s.id !== id))
    }catch(e:any){
      console.error('Delete tourist spot failed', e)
      alert(e?.response?.data?.message || e.message)
    }
  }

  // Filter tourist spots based on search, city, and status
  const filteredSpots = spots.filter(spot => {
    const name = (spot.nameTranslations as any)?.[selectedLang] || spot.nameTranslations?.en || ''
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCity = cityFilter === 'all' || spot.cityId === cityFilter
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && spot.isActive) || 
                         (statusFilter === 'inactive' && !spot.isActive)
    return matchesSearch && matchesCity && matchesStatus
  })

  return (
    <div className="px-8 py-6">
      <PageHeader 
        title="Tourist Spots" 
        icon="🗺️"
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
            <LinkButton to="/tourist-spots/new" className="flex items-center gap-2">
              <PlusIcon />
              New Tourist Spot
            </LinkButton>
          </div>
        }
      />
      
      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[250px]">
          <input
            type="text"
            placeholder="Search tourist spots..."
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
          Showing {filteredSpots.length} of {spots.length} spots
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
            <TableCell header>Entry Type</TableCell>
            <TableCell header>Rating</TableCell>
            <TableCell header>Status</TableCell>
            <TableCell header>Actions</TableCell>
          </TableRow>
        </thead>
        <tbody>
          {filteredSpots.length === 0 ? (
            <TableRow>
              <TableCell className="text-center text-gray-500 py-8">No tourist spots found</TableCell>
              <TableCell> </TableCell>
              <TableCell> </TableCell>
              <TableCell> </TableCell>
              <TableCell> </TableCell>
              <TableCell> </TableCell>
            </TableRow>
          ) : (
            filteredSpots.map(spot => (
            <TableRow key={spot.id}>
              <TableCell>{(spot.nameTranslations as any)?.[selectedLang] || spot.nameTranslations?.en || '-'}</TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">{getCityName(spot.cityId, spot.city)}</span>
              </TableCell>
              <TableCell>
                <Badge variant={spot.isPaidEntry ? 'warning' : 'success'}>
                  {spot.isPaidEntry ? 'Paid' : 'Free'}
                </Badge>
              </TableCell>
              <TableCell>
                {spot.rating ? `${spot.rating.toFixed(1)} ⭐ (${spot.ratingCount})` : 'No ratings'}
              </TableCell>
              <TableCell>
                <Badge variant={spot.isActive ? 'success' : 'gray'}>
                  {spot.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                <ActionMenu
                  viewLink={`/tourist-spots/${spot.id}/view`}
                  editLink={`/tourist-spots/${spot.id}/edit`}
                  onDelete={() => handleDelete(spot.id)}
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
