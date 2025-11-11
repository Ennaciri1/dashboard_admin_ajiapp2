import React, { useEffect, useState } from 'react'
import { getAdminSupportedLanguages, deleteSupportedLanguage, SupportedLanguage } from '../api/languages'
import { PageHeader, LinkButton } from '../components/UI'
import { Table, TableRow, TableCell } from '../components/Table'
import { Badge } from '../components/Badge'
import { ActionMenu } from '../components/ActionMenu'
import { TableSkeleton } from '../components/Loading'
import { PlusIcon } from '../assets/icons'

export default function LanguagesList(){
  const [languages, setLanguages] = useState<SupportedLanguage[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load(){
    setLoading(true)
    try{
      const res = await getAdminSupportedLanguages()
      const responseData: any = res.data
      const languagesData = responseData?.data || responseData || []
      setLanguages(Array.isArray(languagesData) ? languagesData : [])
    }catch(e: any){
      setError(e?.response?.data?.message || e.message)
    }finally{ setLoading(false) }
  }

  useEffect(()=>{ load() }, [])

  async function handleDelete(id: string){
    if (!confirm('Delete this language?')) return
    try{
      await deleteSupportedLanguage(id)
      setLanguages(prev => prev.filter(l => l.id !== id))
    }catch(e:any){ alert(e?.response?.data?.message || e.message) }
  }

  // Filter languages based on search and status
  const filteredLanguages = languages.filter(lang => {
    const matchesSearch = lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lang.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && lang.isActive) || 
                         (statusFilter === 'inactive' && !lang.isActive)
    return matchesSearch && matchesStatus
  })

  return (
    <div className="px-8 py-6">
      <PageHeader 
        title="Supported Languages" 
        icon="🌐"
        actions={
          <LinkButton to="/languages/new" className="flex items-center gap-2">
            <PlusIcon />
            New Language
          </LinkButton>
        }
      />
      
      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[250px]">
          <input
            type="text"
            placeholder="Search languages by name or code..."
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
          Showing {filteredLanguages.length} of {languages.length} languages
        </div>
      </div>
      
      {loading && <TableSkeleton rows={5} columns={4} />}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-slideDown">{error}</div>}
      
      {!loading && !error && (
        <div className="animate-fadeIn">
          <Table>
        <thead>
          <TableRow>
            <TableCell header>Code</TableCell>
            <TableCell header>Name</TableCell>
            <TableCell header>Status</TableCell>
            <TableCell header>Created By</TableCell>
            <TableCell header>Actions</TableCell>
          </TableRow>
        </thead>
        <tbody>
          {filteredLanguages.length === 0 ? (
            <TableRow>
              <TableCell className="text-center text-gray-500 py-8">No languages found</TableCell>
              <TableCell> </TableCell>
              <TableCell> </TableCell>
              <TableCell> </TableCell>
              <TableCell> </TableCell>
            </TableRow>
          ) : (
            filteredLanguages.map(l => (
            <TableRow key={l.id}>
              <TableCell>{l.code}</TableCell>
              <TableCell>{l.name}</TableCell>
              <TableCell>
                <Badge variant={l.isActive ? 'success' : 'gray'}>
                  {l.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">{l.createdBy || '-'}</span>
              </TableCell>
              <TableCell>
                <ActionMenu
                  editLink={`/languages/${l.id}/edit`}
                  onDelete={() => handleDelete(l.id)}
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
