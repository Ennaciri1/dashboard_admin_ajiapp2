import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllCitiesAdmin } from '../api/cities'
import { getAdminHotels } from '../api/hotels'
import { getAdminContacts } from '../api/contacts'
import Card, { CardHeader } from '../components/Card'
import Badge from '../components/Badge'
import Loading from '../components/Loading'

interface Stats {
  cities: { total: number; active: number }
  hotels: { total: number; active: number }
  contacts: { total: number; active: number }
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    cities: { total: 0, active: 0 },
    hotels: { total: 0, active: 0 },
    contacts: { total: 0, active: 0 },
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      
      const [cities, hotels, contacts] = await Promise.all([
        getAllCitiesAdmin(),
        getAdminHotels(),
        getAdminContacts(),
      ])

      setStats({
        cities: {
          total: cities.length,
          active: cities.filter((c: any) => c.active).length,
        },
        hotels: {
          total: hotels.length,
          active: hotels.filter((h: any) => h.active).length,
        },
        contacts: {
          total: contacts.length,
          active: contacts.filter((c: any) => c.active).length,
        },
      })
    } catch (err) {
      console.error('Error loading stats:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card>
          <Loading text="Loading du tableau de bord..." />
        </Card>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Cities',
      value: stats.cities.total,
      active: stats.cities.active,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      link: '/cities',
      color: 'primary',
    },
    {
      title: 'Hotels',
      value: stats.hotels.total,
      active: stats.hotels.active,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      link: '/hotels',
      color: 'success',
    },
    {
      title: 'Contacts',
      value: stats.contacts.total,
      active: stats.contacts.active,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      link: '/contacts',
      color: 'warning',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to your AjiApp Administration Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Link key={stat.title} to={stat.link}>
            <Card hover padding="md" className="h-full transition-all duration-200">
              <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      <Badge variant="success" size="sm">
                        {stat.active} active
                      </Badge>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl bg-${stat.color}-100 text-${stat.color}-600`}>
                    {stat.icon}
          </div>
        </div>
              <div className="mt-4 flex items-center text-sm text-primary-600 font-medium">
                <span>View all</span>
                <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Card>
          </Link>
        ))}
        </div>
        
      <Card>
        <CardHeader title="Quick Actions" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/cities/new"
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-500 hover:bg-primary-50 transition-all group"
          >
            <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-primary-100 transition-colors">
              <svg className="w-6 h-6 text-gray-600 group-hover:text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">New City</p>
              <p className="text-sm text-gray-500">Add a city</p>
            </div>
          </Link>

          <Link
            to="/hotels/new"
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-500 hover:bg-primary-50 transition-all group"
          >
            <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-primary-100 transition-colors">
              <svg className="w-6 h-6 text-gray-600 group-hover:text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">New Hotel</p>
              <p className="text-sm text-gray-500">Add a hotel</p>
            </div>
          </Link>

          <Link
            to="/contacts/new"
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-500 hover:bg-primary-50 transition-all group"
          >
            <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-primary-100 transition-colors">
              <svg className="w-6 h-6 text-gray-600 group-hover:text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">New Contact</p>
              <p className="text-sm text-gray-500">Add a contact</p>
        </div>
          </Link>

          <Link
            to="/languages/new"
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-500 hover:bg-primary-50 transition-all group"
          >
            <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-primary-100 transition-colors">
              <svg className="w-6 h-6 text-gray-600 group-hover:text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">New Language</p>
              <p className="text-sm text-gray-500">Add a language</p>
            </div>
          </Link>
        </div>
      </Card>

      <Card className="bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary-100 rounded-xl">
            <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">AjiApp Management System</h3>
            <p className="mt-1 text-gray-600">
              Easily manage your cities, hotels, contacts and languages from this modern and intuitive administration interface.
            </p>
      </div>
        </div>
      </Card>
    </div>
  )
}
