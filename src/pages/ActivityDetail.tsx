import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getAdminActivities, Activity, ActivityUser } from '../api/activities'
import { getSupportedLanguages, SupportedLanguage } from '../api/languages'
import { getImageUrl } from '../lib/imageUtils'

export default function ActivityDetail() {
  const { id } = useParams<{ id: string }>()
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

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!activity) return <div className="p-6">Activity not found</div>

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Activity Details</h2>
        <div className="flex gap-2">
          <Link to="/activities" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
            Back to List
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded p-6 space-y-6">
        {activityUser && (
          <div className="bg-gray-50 p-4 rounded">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Activity User</label>
            <p className="text-lg font-medium">{activityUser.name}</p>
            <p className="text-sm text-gray-600">{activityUser.description}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
            <p className="text-gray-900">{activity.id}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <span className={`px-3 py-1 text-sm rounded ${activity.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {activity.active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <p className="text-gray-900">${activity.price}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Title Translations</label>
          <div className="grid grid-cols-2 gap-4">
            {languages.map(lang => (
              <div key={lang.code} className="border rounded p-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">{lang.name} ({lang.code})</label>
                <p className="text-gray-900">{(activity.titleTranslations as any)?.[lang.code] || '-'}</p>
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
                <p className="text-gray-900 text-sm">{(activity.descriptionTranslations as any)?.[lang.code] || '-'}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <div className="flex flex-wrap gap-1">
              {activity.tags.map((tag, idx) => (
                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Likes</label>
            <p className="text-gray-900">{activity.likesCount || 0}</p>
          </div>
        </div>

        {activity.images && activity.images.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Images</label>
            <div className="grid grid-cols-3 gap-4">
              {activity.images.map((imgUrl, idx) => (
                <div key={idx} className="border rounded overflow-hidden">
                  <img src={getImageUrl(imgUrl)} alt={`Activity image ${idx + 1}`} className="w-full h-48 object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
            <p className="text-gray-900">{activity.createdAt ? new Date(activity.createdAt).toLocaleString() : '-'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Updated At</label>
            <p className="text-gray-900">{activity.updatedAt ? new Date(activity.updatedAt).toLocaleString() : '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
            <p className="text-gray-900">{activity.createdBy || '-'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Updated By</label>
            <p className="text-gray-900">{activity.updatedBy || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
