import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllCitiesAdmin, deleteCity } from '../api/cities'
import { City, TableColumn } from '../types'
import Card, { CardHeader } from '../components/Card'
import Button from '../components/Button'
import Table from '../components/Table'
import Badge from '../components/Badge'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'
import { ConfirmModal } from '../components/Modal'
import Alert from '../components/Alert'

export default function CitiesList() {
  const navigate = useNavigate()
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; city: City | null }>({
    isOpen: false,
    city: null,
  })
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadCities()
  }, [])

  const loadCities = async () => {
    try {
    setLoading(true)
      setError(null)
      const data = await getAllCitiesAdmin()
      setCities(data)
    } catch (err: any) {
      setError(err.message || 'Error lors du chargement des villes')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.city) return

    try {
      setDeleting(true)
      await deleteCity(deleteModal.city.id)
      setCities(cities.filter((c) => c.id !== deleteModal.city!.id))
      setDeleteModal({ isOpen: false, city: null })
    } catch (err: any) {
      setError(err.message || 'Error lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  const columns: TableColumn<City>[] = [
    {
      key: 'nameTranslations',
      label: 'Name',
      render: (_, city) => (
        <div>
          <div className="font-medium text-gray-900">{city.nameTranslations.en || city.nameTranslations.fr || city.nameTranslations.ar}</div>
          <div className="text-sm text-gray-500">
            {city.nameTranslations.ar && <span className="mr-2">AR: {city.nameTranslations.ar}</span>}
            {city.nameTranslations.fr && <span>FR: {city.nameTranslations.fr}</span>}
          </div>
        </div>
      ),
    },
    {
      key: 'active',
      label: 'Status',
      render: (value) =>
        value ? (
          <Badge variant="success" dot>
            Active
          </Badge>
        ) : (
          <Badge variant="secondary" dot>
            Inactive
          </Badge>
        ),
    },
    {
      key: 'createdAt',
      label: 'Date de création',
      render: (value) => (value ? new Date(value).toLocaleDateString('fr-FR') : '-'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, city) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/cities/${city.id}/view`)
            }}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/cities/${city.id}/edit`)
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation()
              setDeleteModal({ isOpen: true, city })
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card>
          <Loading text="Chargement des villes..." />
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {error && (
        <Alert variant="danger" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardHeader
          title="Gestion des Villes"
          subtitle={`${cities.length} ville(s) au total`}
          action={
            <Button
              onClick={() => navigate('/cities/new')}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              New City
            </Button>
          }
        />

        {cities.length === 0 ? (
          <EmptyState
            title="No ville"
            description="Commencez par ajouter votre première ville"
            action={{
              label: 'Add une ville',
              onClick: () => navigate('/cities/new'),
            }}
          />
          ) : (
          <Table columns={columns} data={cities} keyExtractor={(city) => city.id} />
        )}
      </Card>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, city: null })}
        onConfirm={handleDelete}
        title="Delete la ville"
        message={`Are you sure de vouloir supprimer la ville "${deleteModal.city?.nameTranslations.en}" ? Cette action est irréversible.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}
