import React, { useEffect, useState } from 'react'
import { getAdminCities, deleteCity, City } from '../api/cities'
import { getAdminSupportedLanguages, SupportedLanguage } from '../api/languages'
import { Table, TableRow, TableCell } from '../components/Table'
import { Badge } from '../components/Badge'
import { PageHeader, LinkButton } from '../components/UI'
import { ActionMenu } from '../components/ActionMenu'
import { TableSkeleton } from '../components/Loading'
import { PlusIcon } from '../assets/icons'

export default function CitiesList() {
  const [cities, setCities] = useState<City[]>([])
  const [languages, setLanguages] = useState<SupportedLanguage[]>([])
  const [selectedLang, setSelectedLang] = useState<string>('en')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load(){
    setLoading(true)
    try{
      const res = await getAdminCities()
      const responseData: any = res.data
      const citiesData = responseData?.data || responseData || []
      setCities(Array.isArray(citiesData) ? citiesData : [])
      
      // Load languages
      const langRes = await getAdminSupportedLanguages()
      const langData: any = langRes.data
      const langs = langData?.data || langData || []
      setLanguages(Array.isArray(langs) ? langs : [])
    }catch(e: any){
      setError(e?.response?.data?.message || e.message)
    }finally{ setLoading(false) }
  }

  useEffect(()=>{ load() }, [])

  async function handleDelete(id: string){
    if (!confirm('Delete this city?')) return
    try{
      await deleteCity(id)
      setCities(prev => prev.filter(c => c.id !== id))
    }catch(e:any){ alert(e?.response?.data?.message || e.message) }
  }

  // Filter cities based on search and status
  const filteredCities = cities.filter(city => {
    const name = (city.nameTranslations as any)?.[selectedLang] || city.nameTranslations?.en || ''
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && city.isActive) || 
                         (statusFilter === 'inactive' && !city.isActive)
    return matchesSearch && matchesStatus
  })

  return (
    <div className="px-8 py-6">
      <PageHeader 
        title="Cities" 
        icon="🏙️"
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
            <LinkButton to="/cities/new" className="flex items-center gap-2">
              <PlusIcon />
              New City
            </LinkButton>
          </div>
        }
      />
      
      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[250px]">
          <input
            type="text"
            placeholder="Search cities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#97051D] focus:border-transparent"
          />
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
          Showing {filteredCities.length} of {cities.length} cities
        </div>
      </div>
      
      {loading && <TableSkeleton rows={5} columns={3} />}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-slideDown">{error}</div>}
      
      {!loading && !error && (
        <div className="animate-fadeIn">
          <Table>
        <thead>
          <TableRow>
            <TableCell header>Name</TableCell>
            <TableCell header>Status</TableCell>
            <TableCell header>Actions</TableCell>
          </TableRow>
        </thead>
        <tbody>
          {filteredCities.length === 0 ? (
            <TableRow>
              <TableCell className="text-center text-gray-500 py-8">
                No cities found
              </TableCell>
              <TableCell> </TableCell>
              <TableCell> </TableCell>
            </TableRow>
          ) : (
            filteredCities.map(c => (
            <TableRow key={c.id}>
              <TableCell>{(c.nameTranslations as any)?.[selectedLang] || c.nameTranslations?.en || '-'}</TableCell>
              <TableCell>
                <Badge variant={c.isActive ? 'success' : 'gray'}>
                  {c.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                <ActionMenu
                  viewLink={`/cities/${c.id}/view`}
                  editLink={`/cities/${c.id}/edit`}
                  onDelete={() => handleDelete(c.id)}
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
