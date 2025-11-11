import React from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { DashboardIcon, CityIcon, LanguageIcon, ContactIcon, HotelIcon, ActivityIcon, LocationIcon, BadgeIcon } from '../assets/icons'

export default function AdminLayout(){
  const nav = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthContext()
  
  function handleLogout(){
    logout()
    nav('/login')
  }

  const navLinks = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: <DashboardIcon />
    },
    { 
      path: '/cities', 
      label: 'Cities', 
      icon: <CityIcon />
    },
    { 
      path: '/languages', 
      label: 'Languages', 
      icon: <LanguageIcon />
    },
    { 
      path: '/contacts', 
      label: 'Contacts', 
      icon: <ContactIcon />
    },
    { 
      path: '/hotels', 
      label: 'Hotels', 
      icon: <HotelIcon />
    },
    { 
      path: '/activities', 
      label: 'Activities', 
      icon: <ActivityIcon />
    },
    { 
      path: '/tourist-spots', 
      label: 'Tourist Spots', 
      icon: <LocationIcon />
    },
  ]

  const isActive = (path: string) => location.pathname.startsWith(path)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-white border-r border-gray-200 flex flex-col z-40">
        <div className="p-6 border-b border-gray-200 bg-[#97051D]">
          <div className="flex items-center space-x-3">
            <BadgeIcon className="w-8 h-8 text-white" />
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          </div>
        </div>
        
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(link.path)
                  ? 'bg-[#97051D] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{link.icon}</span>
              <span className="font-medium">{link.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          {user && (
            <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
              <div className="font-semibold text-gray-900 truncate">{user.fullName || user.email}</div>
              <div className="text-xs text-gray-500 mt-1">
                {Array.isArray(user.roles) ? user.roles.join(', ') : 'Admin'}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 bg-[#97051D] hover:bg-[#7a0418] text-white font-medium rounded-lg transition-all duration-200"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 min-h-screen">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
