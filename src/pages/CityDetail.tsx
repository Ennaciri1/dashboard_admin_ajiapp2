import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCityById, deleteCity } from '../api/cities'
import { City } from '../types'
import Card, { CardHeader } from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import Loading from '../components/Loading'
import Alert from '../components/Alert'
import { ConfirmModal } from '../components/Modal'

export default function CityDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [city, setCity] = useState<City | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (id) loadCity(id)
  }, [id])

  const loadCity = async (cityId: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCityById(cityId)
      setCity(data)
    } catch (err: any) {
      setError(err.message || 'Error lors du chargement de la ville')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return

    try {
      setDeleting(true)
      await deleteCity(id)
      navigate('/cities')
    } catch (err: any) {
      setError(err.message || 'Error lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <Loading text="Chargement..." />
        </Card>
      </div>
    )
  }

  if (error || !city) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert variant="danger">
          {error || 'City introuvable'}
        </Alert>
        <div className="mt-4">
          <Button onClick={() => navigate('/cities')}>Back to list</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader
          title="Details de la ville"
          action={
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => navigate(`/cities/${id}/edit`)}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                onClick={() => setDeleteModal(true)}
              >
                Delete
              </Button>
            </div>
          }
        />

        <div className="space-y-6">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Status</label>
            {city.active ? (
              <Badge variant="success" dot>
                Active
              </Badge>
            ) : (
              <Badge variant="secondary" dot>
                Inactive
              </Badge>
            )}
          </div>

          {/* Translations */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-3">Traductions</label>
            <div className="space-y-3">
              {Object.entries(city.nameTranslations).map(([lang, value]) => (
                value && (
                  <div key={lang} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Badge variant="primary" size="sm">
                      {lang.toUpperCase()}
                    </Badge>
                    <span className="text-gray-900 flex-1">{value}</span>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Audit info */}
          {city.createdAt && (
            <div className="pt-6 border-t border-gray-200 grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Créé le</label>
                <p className="text-gray-900">{new Date(city.createdAt).toLocaleString('fr-FR')}</p>
                {city.createdBy && (
                  <p className="text-sm text-gray-500 mt-1">Par: {city.createdBy}</p>
                )}
              </div>
              {city.updatedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Modifié le</label>
                  <p className="text-gray-900">{new Date(city.updatedAt).toLocaleString('fr-FR')}</p>
                  {city.updatedBy && (
                    <p className="text-sm text-gray-500 mt-1">Par: {city.updatedBy}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Back button */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <Button variant="secondary" onClick={() => navigate('/cities')}>
            Back to list
          </Button>
        </div>
      </Card>

      <ConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete la ville"
        message={`Are you sure de vouloir supprimer la ville "${city.nameTranslations.en}" ? Cette action est irréversible.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}
