import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminActivities, ActivityUser } from '../api/activities'
import { getSupportedLanguages, getAdminSupportedLanguages, SupportedLanguage } from '../api/languages'
import { PageHeader, LinkButton } from '../components/UI'
import { TableRow, TableCell } from '../components/Table'
import Badge from '../components/Badge'
import { ActionMenu } from '../components/ActionMenu'
import Loading from '../components/Loading'
import { PlusIcon } from '../assets/icons'

export default function ActivitiesList(){
  const navigate = useNavigate()
  const [activityUsers, setActivityUsers] = useState<ActivityUser[]>([])
  const [languages, setLanguages] = useState<SupportedLanguage[]>([])
  const [selectedLang, setSelectedLang] = useState<string>('en')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [userFilter, setUserFilter] = useState<string>('all') // New: Filter by user/operator
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load(){
    setLoading(true)
    setError(null)
    try{
      const activities = await getAdminActivities()
      setActivityUsers(Array.isArray(activities) ? activities : [])
      
      // Load languages
      const langs = await getAdminSupportedLanguages()
      setLanguages(Array.isArray(langs) ? langs : [])
    }catch(e: any){
      console.error('Load activities failed:', e)
      setError(e?.response?.data?.message || e.message || 'Failed to load activities')
      setActivityUsers([])
    }finally{ setLoading(false) }
  }

  useEffect(()=>{ load() }, [])

  // Filter activities based on search, status, and user
  const filteredActivities = activityUsers.filter(activityUser => {
    // Filter by user/operator
    if (userFilter !== 'all' && activityUser.id !== userFilter) {
      return false
    }
    
    const userName = activityUser.name || ''
    const matchesUserName = userName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const hasMatchingActivity = activityUser.activities?.some(activity => {
      const title = (activity.titleTranslations as any)?.[selectedLang] || activity.titleTranslations?.en || ''
      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || 
                            (statusFilter === 'active' && activity.active) || 
                            (statusFilter === 'inactive' && !activity.active)
      return matchesSearch && matchesStatus
    })
    
    return matchesUserName || hasMatchingActivity
  })
  
  // Count total activities for stats
  const totalActivities = filteredActivities.reduce((sum, user) => sum + user.activities.length, 0)
  const activeActivities = filteredActivities.reduce((sum, user) => {
    return sum + user.activities.filter(a => a.active).length
  }, 0)
  const inactiveActivities = totalActivities - activeActivities

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
              onClick={() => navigate('/activities/create-user')}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors" 
              title="Create un utilisateur Activity"
            >
              <PlusIcon />
              Create un utilisateur Activity
            </button>
          </div>
        }
      />
      
      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center mb-4">
          <div className="flex-1 min-w-[250px]">
            <input
              type="text"
              placeholder="Search par titre d'activité ou nom d'opérateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-[200px]"
            >
              <option value="all">All les opérateurs ({activityUsers.length})</option>
              {activityUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.activities.length})
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All les statuts</option>
              <option value="active">Actives</option>
              <option value="inactive">Inactives</option>
            </select>
          </div>
        </div>
        
        {/* Statistics */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Opérateurs:</span>
            <span className="font-semibold text-gray-900">{filteredActivities.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Activités totales:</span>
            <span className="font-semibold text-gray-900">{totalActivities}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Actives:</span>
            <span className="font-semibold text-green-600">{activeActivities}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Inactives:</span>
            <span className="font-semibold text-red-600">{inactiveActivities}</span>
          </div>
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
            
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
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
                      <Badge variant={activity.active ? 'success' : 'gray'}>
                        {activity.active ? 'Active' : 'Inactive'}
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
            </table>
            </div>
          </div>
        </div>
      ))))}
    </div>
  )
}
