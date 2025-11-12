import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Alert from '../components/Alert'
import api from '../lib/http'

/**
 * CreateActivityUser Component
 * Allows ADMIN to create a new Activity User account
 * According to API: POST /api/v1/auth/users/activity
 */
export default function CreateActivityUser() {
  const navigate = useNavigate()
  
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validation
    if (!fullName.trim()) {
      setError('Le nom complet is required')
      return
    }

    if (!email.trim()) {
      setError('L\'email is required')
      return
    }

    if (!password.trim()) {
      setError('Le mot de passe is required')
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)

    try {
      console.log('📤 Creating activity user:', { fullName: fullName.trim(), email: email.trim() })
      
      const response = await api.post('/api/v1/auth/users/activity', {
        fullName: fullName.trim(),
        email: email.trim(),
        password: password
      })

      console.log('✅ Activity user created:', response.data)
      
      // Extract data from response
      const data = response.data?.data || response.data
      
      setSuccess(`Compte créé avec succès pour ${fullName}! Redirection...`)
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/activities')
      }, 2000)

    } catch (e: any) {
      console.error('❌ Create activity user error:', e)
      console.error('Error response:', e?.response?.data)
      
      const errorMessage = e?.response?.data?.message || e.message || 'Failed de la création de l\'utilisateur'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Create un utilisateur Activity
        </h2>
        <p className="text-gray-600 mt-1">
          Enregistrez un nouveau compte opérateur d'activités
        </p>
      </div>

      {/* Info Alert */}
      <div className="mb-6">
        <Alert variant="info">
          <strong>ℹ️ Information:</strong> Les utilisateurs ACTIVITY peuvent créer et gérer leurs propres activités. 
          Ils n'ont pas accès aux fonctionnalités d'administration.
        </Alert>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6">
          <Alert variant="success">{success}</Alert>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6">
          <Alert variant="danger">{error}</Alert>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow max-w-2xl">
        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name complet <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="ex: Ahmed Ben Ali"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Name complet de l'opérateur d'activités
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="ex: operator@example.com"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Address email pour la connexion
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe <span className="text-red-600">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Minimum 6 caractères"
              minLength={6}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum 6 caractères
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe <span className="text-red-600">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Retapez le mot de passe"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Doit correspondre au mot de passe ci-dessus
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Création en cours...' : 'Create le compte'}
          </Button>
          <Button 
            type="button" 
            onClick={() => navigate('/activities')} 
            variant="secondary"
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-6 max-w-2xl">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            📋 Informations importantes
          </h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Le compte sera créé avec le rôle <strong>ACTIVITY</strong></li>
            <li>L'utilisateur pourra créer et gérer ses propres activités</li>
            <li>L'utilisateur devra compléter son profil (titre, description, bannière)</li>
            <li>Les identifiants de connexion seront disponibles immédiatement</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

