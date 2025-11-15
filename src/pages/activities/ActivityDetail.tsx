import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAdminActivities, Activity, ActivityUser } from '../../api/activities'
import { getSupportedLanguages, SupportedLanguage } from '../../api/languages'
import { getImageUrl } from '../../lib/imageUtils'
import Card, { CardHeader } from '../../components/Card'
import Button from '../../components/Button'
import Badge from '../../components/Badge'
import Alert from '../../components/Alert'
import Loading from '../../components/Loading'

export default function ActivityDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activity, setActivity] = useState<Activity | null>(null)
  const [activityUser, setActivityUser] = useState<ActivityUser | null>(null)
  const [languages, setLanguages] = useState<SupportedLanguage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadActivityDetail()
  }, [id])

  async function loadActivityDetail() {
    setLoading(true)
    setError(null)
    try {
      const activitiesRes = await getAdminActivities()
      // getAdminActivities already extracts data, returns array directly
      const activityUsers = Array.isArray(activitiesRes) ? activitiesRes : []
      
      let foundActivity: Activity | null = null
      let foundUser: ActivityUser | null = null
      
      for (const user of activityUsers) {
        const act = user.activities.find((a: Activity) => a.id === id)
        if (act) {
          foundActivity = act
          foundUser = user
          break
        }
      }
      
      if (!foundActivity) {
        setError('Activity not found')
        return
      }
      setActivity(foundActivity)
      setActivityUser(foundUser)

      const langRes = await getSupportedLanguages(true)
      const langs = Array.isArray(langRes) ? langRes : (langRes.data || [])
      setLanguages(langs)
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Failed to load activity details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <Loading text="Loading..." />
        </Card>
      </div>
    )
  }

  if (error || !activity) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Alert variant="danger" onClose={() => setError(null)}>
          {error || 'Activity not found'}
        </Alert>
        <Card>
          <div className="flex justify-center">
            <Button onClick={() => navigate('/activities')} variant="secondary">
              Back to list
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Activity User Card */}
      {activityUser && (
        <Card>
          <CardHeader
            title="Activity Operator"
            subtitle={activityUser.name}
          />
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <div className="grid grid-cols-2 gap-4">
                {languages.map(lang => (
                  <div key={lang.code} className="border border-gray-200 rounded-lg p-3">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      {lang.name} ({lang.code})
                    </label>
                    <p className="text-sm text-gray-900">
                      {(activityUser.descriptionTranslations as any)?.[lang.code] || '-'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Activity Details Card */}
      <Card>
        <CardHeader
          title="Activity Details"
          action={
            <Button onClick={() => navigate('/activities')} variant="secondary">
              Back to list
            </Button>
          }
        />

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
              <p className="text-gray-900 text-sm">{activity.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Badge variant={activity.active ? 'success' : 'secondary'}>
                {activity.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <p className="text-gray-900 font-semibold">${activity.price}</p>
            </div>
          </div>

          {/* Title Translations */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Title Translations</label>
            <div className="grid grid-cols-2 gap-4">
              {languages.map(lang => (
                <div key={lang.code} className="border border-gray-200 rounded-lg p-3">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    {lang.name} ({lang.code})
                  </label>
                  <p className="text-gray-900">{(activity.titleTranslations as any)?.[lang.code] || '-'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Description Translations */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Description Translations</label>
            <div className="grid grid-cols-2 gap-4">
              {languages.map(lang => (
                <div key={lang.code} className="border border-gray-200 rounded-lg p-3">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    {lang.name} ({lang.code})
                  </label>
                  <p className="text-gray-900 text-sm">{(activity.descriptionTranslations as any)?.[lang.code] || '-'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tags and Likes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {activity.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Likes</label>
              <p className="text-gray-900 font-semibold">{activity.likesCount || 0}</p>
            </div>
          </div>

          {/* Images */}
          {activity.images && activity.images.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Images</label>
              <div className="grid grid-cols-3 gap-4">
                {activity.images.map((imgUrl, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                    <img 
                      src={getImageUrl(imgUrl)} 
                      alt={`Activity image ${idx + 1}`} 
                      className="w-full h-48 object-cover" 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit Info */}
          <div className="pt-6 border-t border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Audit Information</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Created at</label>
                <p className="text-sm text-gray-900">
                  {activity.createdAt ? new Date(activity.createdAt).toLocaleString('en-US') : '-'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Updated at</label>
                <p className="text-sm text-gray-900">
                  {activity.updatedAt ? new Date(activity.updatedAt).toLocaleString('en-US') : '-'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Created by</label>
                <p className="text-sm text-gray-900">{activity.createdBy || '-'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Updated by</label>
                <p className="text-sm text-gray-900">{activity.updatedBy || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
