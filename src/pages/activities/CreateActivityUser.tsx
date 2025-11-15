import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import Input from '../../components/Input'
import Card, { CardHeader } from '../../components/Card'
import { createActivityUser } from '../../api/auth'

/**
 * CreateActivityUser Component
 * Allows ADMIN to create a new Activity User account
 * According to API: POST /api/v1/auth/users/activity
 */
export default function CreateActivityUser() {
  const navigate = useNavigate()
  
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Field-specific errors
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string
    email?: string
    phoneNumber?: string
    password?: string
    confirmPassword?: string
  }>({})

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setFieldErrors({})

    // Validation
    const errors: typeof fieldErrors = {}
    let hasErrors = false

    if (!fullName.trim()) {
      errors.fullName = 'Full name is required'
      hasErrors = true
    }

    if (!email.trim()) {
      errors.email = 'Email is required'
      hasErrors = true
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Email is not valid'
      hasErrors = true
    }

    if (!phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required'
      hasErrors = true
    } else {
      // Basic phone number validation (accepts international formats)
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/
      if (!phoneRegex.test(phoneNumber.trim())) {
        errors.phoneNumber = 'Phone number is not valid'
        hasErrors = true
      }
    }

    if (!password.trim()) {
      errors.password = 'Password is required'
      hasErrors = true
    } else if (password.length < 6) {
      errors.password = 'Password must contain at least 6 characters'
      hasErrors = true
    }

    if (!confirmPassword.trim()) {
      errors.confirmPassword = 'Password confirmation is required'
      hasErrors = true
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
      hasErrors = true
    }

    if (hasErrors) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)

    try {
      console.log('📤 Creating activity user:', { 
        fullName: fullName.trim(), 
        email: email.trim(), 
        phoneNumber: phoneNumber.trim() 
      })
      
      const data = await createActivityUser({
        fullName,
        email,
        phoneNumber,
        password
      })

      console.log('✅ Activity user created:', data)
      
      setSuccess(`Account created successfully for ${fullName}! Redirecting...`)
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/activities')
      }, 2000)

    } catch (e: any) {
      console.error('❌ Create activity user error:', e)
      console.error('Error response:', e?.response?.data)
      
      const errorMessage = e?.response?.data?.message || e.message || 'Failed to create user'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Success Message */}
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Info Alert */}
      <Alert variant="info">
        <strong>ℹ️ Information:</strong> ACTIVITY users can create and manage their own activities. 
        They do not have access to administration features.
      </Alert>

      {/* Form Card */}
      <Card>
        <CardHeader
          title="Create Activity User"
          subtitle="Register a new activity operator account"
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Full Name */}
            <Input
              label="Full Name"
              type="text"
              name="fullName"
              autoComplete="name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value)
                if (fieldErrors.fullName) {
                  setFieldErrors(prev => ({ ...prev, fullName: undefined }))
                }
              }}
              placeholder="ex: Ahmed Ben Ali"
              hint="Full name of the activity operator"
              error={fieldErrors.fullName}
              required
            />

            {/* Email */}
            <Input
              label="Email"
              type="email"
              name="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (fieldErrors.email) {
                  setFieldErrors(prev => ({ ...prev, email: undefined }))
                }
              }}
              placeholder="ex: operator@example.com"
              hint="Email address for login"
              error={fieldErrors.email}
              required
            />

            {/* Phone Number */}
            <Input
              label="Phone Number"
              type="tel"
              name="phoneNumber"
              inputMode="tel"
              autoComplete="tel"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value)
                if (fieldErrors.phoneNumber) {
                  setFieldErrors(prev => ({ ...prev, phoneNumber: undefined }))
                }
              }}
              placeholder="ex: +212 6XX XXX XXX"
              hint="Phone number of the activity operator"
              error={fieldErrors.phoneNumber}
              required
            />

            {/* Password */}
            <Input
              label="Password"
              type="password"
              name="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (fieldErrors.password) {
                  setFieldErrors(prev => ({ ...prev, password: undefined }))
                }
                // Clear confirm password error if passwords now match
                if (fieldErrors.confirmPassword && e.target.value === confirmPassword) {
                  setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }))
                }
              }}
              placeholder="Minimum 6 characters"
              hint="Minimum 6 characters"
              error={fieldErrors.password}
              required
              minLength={6}
            />

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (fieldErrors.confirmPassword) {
                  setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }))
                }
              }}
              placeholder="Re-enter the password"
              hint="Must match the password above"
              error={fieldErrors.confirmPassword}
              required
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
            <Button type="submit" loading={loading}>
              Create Account
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
      </Card>

      {/* Info Box */}
      <Card>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">
            📋 Important Information
          </h3>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>The account will be created with the <strong>ACTIVITY</strong> role</li>
            <li>The user will be able to create and manage their own activities</li>
            <li>The user must complete their profile (title, description, banner)</li>
            <li>Login credentials will be available immediately</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}

