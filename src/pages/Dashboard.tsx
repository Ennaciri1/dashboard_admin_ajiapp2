import React from 'react'
import { useEffect, useState } from 'react'
import { me } from '../api/auth'
import { getAdminCities } from '../api/cities'
import { getAdminSupportedLanguages } from '../api/languages'

export default function Dashboard(){
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({ cities: 0, languages: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData(){
    try {
      const [userRes, citiesRes, langsRes] = await Promise.all([
        me(),
        getAdminCities(),
        getAdminSupportedLanguages()
      ])
      setUser(userRes?.data)
      setStats({
        cities: citiesRes?.data?.length || 0,
        languages: langsRes?.data?.length || 0
      })
    } catch (e) {
      console.error('Failed to load dashboard data', e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      
      {user && (
        <div className="mb-6 p-4 bg-white rounded shadow">
          <h2 className="text-lg font-medium mb-2">Welcome, {user.fullName || user.email}!</h2>
          <div className="text-sm text-gray-600">
            <p>Email: {user.email}</p>
            <p>Roles: {user.roles?.join(', ')}</p>
            <p>Status: <span className={user.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-600'}>{user.status}</span></p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-white rounded shadow">
          <div className="text-3xl font-bold text-blue-600">{stats.cities}</div>
          <div className="text-gray-600 mt-2">Total Cities</div>
        </div>
        
        <div className="p-6 bg-white rounded shadow">
          <div className="text-3xl font-bold text-green-600">{stats.languages}</div>
          <div className="text-gray-600 mt-2">Supported Languages</div>
        </div>
        
        <div className="p-6 bg-white rounded shadow">
          <div className="text-3xl font-bold text-purple-600">🎯</div>
          <div className="text-gray-600 mt-2">Quick Actions</div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
        <h3 className="font-medium text-blue-900 mb-2">Quick Links</h3>
        <div className="flex gap-3">
          <a href="/cities/new" className="text-blue-600 hover:underline">+ Add New City</a>
          <a href="/cities" className="text-blue-600 hover:underline">Manage Cities</a>
          <a href="/languages" className="text-blue-600 hover:underline">Manage Languages</a>
        </div>
      </div>
    </div>
  )
}
