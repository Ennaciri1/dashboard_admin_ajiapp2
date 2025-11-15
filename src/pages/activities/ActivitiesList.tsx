import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminActivities, ActivityUser } from '../../api/activities'
import { getSupportedLanguages, getAdminSupportedLanguages, SupportedLanguage } from '../../api/languages'
import Card, { CardHeader } from '../../components/Card'
import Button from '../../components/Button'
import Badge from '../../components/Badge'
import Alert from '../../components/Alert'
import Loading from '../../components/Loading'
import EmptyState from '../../components/EmptyState'
import Input from '../../components/Input'
import { ActionMenu } from '../../components/ActionMenu'
import { TableRow, TableCell } from '../../components/Table'
import { PlusIcon } from '../../assets/icons'

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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader
          title="Activities"
          subtitle="Manage activities and activity operators"
          action={
            <div className="flex items-center gap-3">
              <select 
                value={selectedLang} 
                onChange={(e) => setSelectedLang(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
              <Button 
                onClick={() => navigate('/activities/create-user')}
                icon={<PlusIcon />}
              >
                Create Activity User
              </Button>
            </div>
          }
        />
      </Card>

      {/* Filters and Search Card */}
      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="text"
              placeholder="Search by activity title or operator name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All operators ({activityUsers.length})</option>
              {activityUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.activities.length})
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          {/* Statistics */}
          <div className="flex flex-wrap gap-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Operators:</span>
              <span className="text-sm font-semibold text-gray-900">{filteredActivities.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Total activities:</span>
              <span className="text-sm font-semibold text-gray-900">{totalActivities}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Active:</span>
              <span className="text-sm font-semibold text-green-600">{activeActivities}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Inactive:</span>
              <span className="text-sm font-semibold text-red-600">{inactiveActivities}</span>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Error Alert */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {/* Loading State */}
      {loading && (
        <Card>
          <Loading text="Loading activities..." />
        </Card>
      )}
      
      {/* Empty State */}
      {!loading && !error && filteredActivities.length === 0 && (
        <Card>
          <EmptyState
            title="No activities found"
            description="No activities match your search criteria."
          />
        </Card>
      )}
      
      {/* Activities List */}
      {!loading && !error && filteredActivities.length > 0 && (
        <div className="space-y-6">
          {filteredActivities.map(user => (
            <Card key={user.id}>
              <CardHeader
                title={user.name}
                subtitle={(user.descriptionTranslations as any)?.[selectedLang] || user.descriptionTranslations?.en || '-'}
              />
              
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
                        <TableCell>
                          {(activity.titleTranslations as any)?.[selectedLang] || activity.titleTranslations?.en || '-'}
                        </TableCell>
                        <TableCell>${activity.price}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {activity.tags.map((tag, idx) => (
                              <Badge key={idx} variant="secondary" size="sm">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{activity.likesCount || 0}</TableCell>
                        <TableCell>
                          <Badge variant={activity.active ? 'success' : 'secondary'}>
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
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
