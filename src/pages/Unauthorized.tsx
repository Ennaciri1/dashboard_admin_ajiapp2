import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'

/**
 * Unauthorized Page
 * Displayed when a user tries to access admin panel without ADMIN role
 */
export default function Unauthorized() {
  const navigate = useNavigate()

  const handleLogout = () => {
    // Clear tokens and redirect to login
    localStorage.clear()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {/* Icon d'erreur */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 text-red-600 mb-4">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Accès Refusé</h1>
          <p className="text-gray-600">Vous n'êtes pas autorisé à accéder à cette page</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-strong p-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">Rôle insuffisant</h2>
              <p className="text-gray-600">
                Seuls les <strong className="text-red-600">administrateurs</strong> peuvent accéder au panneau d'administration.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
              <h3 className="text-sm font-semibold text-red-900 mb-2">
                ℹ️ Informations
              </h3>
              <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                <li>Votre compte n'a pas le rôle <strong>ADMIN</strong></li>
                <li>Contactez un administrateur pour obtenir l'accès</li>
                <li>Vous pouvez vous déconnecter et essayer avec un autre compte</li>
              </ul>
            </div>

            <div className="pt-4 space-y-3">
              <Button onClick={handleLogout} variant="danger" fullWidth>
                Se déconnecter
              </Button>
              <Button onClick={() => navigate(-1)} variant="secondary" fullWidth>
                Back
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500">
          © 2025 AjiApp. All droits réservés.
        </p>
      </div>
    </div>
  )
}

