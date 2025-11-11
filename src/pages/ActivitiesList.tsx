import React, { useEffect, useState } from 'react'
import { getAdminActivities, ActivityUser } from '../api/activities'
import { getAdminSupportedLanguages, SupportedLanguage } from '../api/languages'
import { PageHeader, LinkButton } from '../components/UI'
import { Table, TableRow, TableCell } from '../components/Table'
import { Badge } from '../components/Badge'
import { ActionMenu } from '../components/ActionMenu'
import { Loading } from '../components/Loading'
import { PlusIcon } from '../assets/icons'

export default function ActivitiesList(){
  const [activityUsers, setActivityUsers] = useState<ActivityUser[]>([])
  const [languages, setLanguages] = useState<SupportedLanguage[]>([])
  const [selectedLang, setSelectedLang] = useState<string>('en')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load(){
    setLoading(true)
    setError(null)
    try{
      const res = await getAdminActivities()
      const responseData: any = res.data
      const activities = responseData?.data || responseData || []
      setActivityUsers(Array.isArray(activities) ? activities : [])
      
      // Load languages
      const langRes = await getAdminSupportedLanguages()
      const langData: any = langRes.data
      const langs = langData?.data || langData || []
      setLanguages(Array.isArray(langs) ? langs : [])
    }catch(e: any){
      console.error('Load activities failed:', e)
      setError(e?.response?.data?.message || e.message || 'Failed to load activities')
      setActivityUsers([])
    }finally{ setLoading(false) }
  }

  useEffect(()=>{ load() }, [])

  // Filter activities based on search and status
  const filteredActivities = activityUsers.filter(activityUser => {
    const userName = activityUser.name || ''
    const hasMatchingActivity = activityUser.activities?.some(activity => {
      const title = (activity.titleTranslations as any)?.[selectedLang] || activity.titleTranslations?.en || ''
      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && activity.isActive) || 
                           (statusFilter === 'inactive' && !activity.isActive)
      return matchesSearch && matchesStatus
    })
    return userName.toLowerCase().includes(searchTerm.toLowerCase()) || hasMatchingActivity
  })

  return (
    <div className="px-8 py-6">
      <PageHeader 
        title="Activities" 
        icon="🎯"
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
            <button 
              disabled 
              className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg opacity-50 cursor-not-allowed" 
              title="Admin cannot create activities"
            >
              <PlusIcon />
              New Activity
            </button>
          </div>
        }
      />
      
      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[250px]">
          <input
            type="text"
            placeholder="Search activities by title or owner..."
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
          Showing {filteredActivities.length} of {activityUsers.length} owners
        </div>
      </div>
      
      {loading && <Loading text="Loading activities..." />}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-slideDown">{error}</div>}
      
      {!loading && !error && (
        filteredActivities.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
            No activities found
          </div>
        ) : (
          filteredActivities.map(user => (
        <div key={user.id} className="mb-6 animate-fadeIn">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{user.description}</p>
            </div>
            
            <Table>
              <thead>
                <TableRow>
                  <TableCell header>Title</TableCell>
                  <TableCell header>Price</TableCell>
                  <TableCell header>Tags</TableCell>
                  <TableCell header>Likes</TableCell>
                  <TableCell header>Status</TableCell>
                  <TableCell header>Actions</TableCell>
                </TableRow>
              </thead>
              <tbody>
                {user.activities.map(activity => (
                  <TableRow key={activity.id}>
                    <TableCell>{(activity.titleTranslations as any)?.[selectedLang] || activity.titleTranslations?.en || '-'}</TableCell>
                    <TableCell>${activity.price}</TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{activity.tags.join(', ')}</span>
                    </TableCell>
                    <TableCell>{activity.likesCount}</TableCell>
                    <TableCell>
                      <Badge variant={activity.isActive ? 'success' : 'gray'}>
                        {activity.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ActionMenu
                        viewLink={`/activities/${activity.id}/view`}
                        deleteDisabled={true}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      ))))}
    </div>
  )
}
