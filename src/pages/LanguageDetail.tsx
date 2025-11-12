import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAdminSupportedLanguages, SupportedLanguage } from '../api/languages'
import { TableSkeleton } from '../components/Loading'
import Alert from '../components/Alert'
import Button from '../components/Button'
import Badge from '../components/Badge'

export default function LanguageDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [language, setLanguage] = useState<SupportedLanguage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadLanguageDetail()
  }, [id])

  async function loadLanguageDetail() {
    setLoading(true)
    setError(null)
    try {
      const langRes = await getAdminSupportedLanguages()
      // getAdminSupportedLanguages returns array directly
      const languages = Array.isArray(langRes) ? langRes : []
      const foundLanguage = languages.find((l: SupportedLanguage) => l.id === id)
      
      if (!foundLanguage) {
        setError('Language non trouvée')
        return
      }
      setLanguage(foundLanguage)
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Failed du chargement de la langue')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <TableSkeleton />
  if (error) return (
    <div className="px-8 py-6">
      <h2 className="text-2xl font-semibold mb-4">Details de la langue</h2>
      <Alert variant="danger">{error}</Alert>
      <Button onClick={() => navigate('/languages')} className="mt-4">
        Back
      </Button>
    </div>
  )
  if (!language) return (
    <div className="px-8 py-6">
      <h2 className="text-2xl font-semibold mb-4">Details de la langue</h2>
      <Alert variant="warning">Language non trouvée</Alert>
      <Button onClick={() => navigate('/languages')} className="mt-4">
        Back
      </Button>
    </div>
  )

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Details de la langue</h2>
        <p className="text-gray-600 mt-1">Informations complètes sur la langue</p>
      </div>

      {/* Actions */}
      <div className="mb-6 flex gap-4">
        <Button onClick={() => navigate(`/languages/${id}/edit`)}>
          Edit
        </Button>
        <Button onClick={() => navigate('/languages')} variant="secondary">
          Back
        </Button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header avec gradient */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              {language.name} ({language.code})
            </h3>
            <Badge variant={language.active ? 'success' : 'secondary'}>
              {language.active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>

        <div className="p-6">
          {/* Informations principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">ID</div>
              <div className="font-mono text-sm text-gray-900">{language.id}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500 mb-1">Code de langue</div>
              <div className="font-mono text-lg font-semibold text-gray-900">
                {language.code.toUpperCase()}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">Name de la langue</div>
              <div className="text-gray-900">{language.name}</div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">Status</div>
              <Badge variant={language.active ? 'success' : 'secondary'} size="md">
                {language.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>

          {/* Métadonnées */}
          <div className="pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Métadonnées</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-500 mb-1">Créé le</div>
                <div className="text-sm text-gray-900">
                  {language.createdAt 
                    ? new Date(language.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : '-'
                  }
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Modifié le</div>
                <div className="text-sm text-gray-900">
                  {language.updatedAt 
                    ? new Date(language.updatedAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : '-'
                  }
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Créé par</div>
                <div className="text-sm text-gray-900">{language.createdBy || '-'}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Modifié par</div>
                <div className="text-sm text-gray-900">{language.updatedBy || '-'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
