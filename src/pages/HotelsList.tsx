import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminHotels, deleteHotel } from '../api/hotels'
import { Hotel, TableColumn } from '../types'
import Card, { CardHeader } from '../components/Card'
import Button from '../components/Button'
import Table from '../components/Table'
import Badge from '../components/Badge'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'
import { ConfirmModal } from '../components/Modal'
import Alert from '../components/Alert'

export default function HotelsList() {
  const navigate = useNavigate()
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; hotel: Hotel | null }>({
    isOpen: false,
    hotel: null,
  })
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadHotels()
  }, [])

  const loadHotels = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAdminHotels()
      setHotels(data)
    } catch (err: any) {
      setError(err.message || 'Error lors du chargement des hôtels')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.hotel) return

    try {
      setDeleting(true)
      await deleteHotel(deleteModal.hotel.id)
      setHotels(hotels.filter((h) => h.id !== deleteModal.hotel!.id))
      setDeleteModal({ isOpen: false, hotel: null })
    } catch (err: any) {
      setError(err.message || 'Error lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  const columns: TableColumn<Hotel>[] = [
    {
      key: 'nameTranslations',
      label: 'Name',
      render: (_, hotel) => (
          <div className="flex items-center gap-3">
          <div>
            <div className="font-medium text-gray-900">
              {hotel.nameTranslations.en || hotel.nameTranslations.fr || hotel.nameTranslations.ar}
            </div>
            <div className="text-sm text-gray-500">
              {hotel.minPrice && <span>À partir de {hotel.minPrice} MAD</span>}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (_, hotel) => (
        <div className="flex items-center gap-2">
          <div className="flex items-center text-warning-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="ml-1 font-medium">{hotel.rating?.toFixed(1) || '0.0'}</span>
          </div>
          <span className="text-sm text-gray-500">({hotel.ratingCount || 0})</span>
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
      key: 'actions',
      label: 'Actions',
      render: (_, hotel) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/hotels/${hotel.id}/view`)
            }}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/hotels/${hotel.id}/edit`)
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation()
              setDeleteModal({ isOpen: true, hotel })
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
          <Loading text="Chargement des hôtels..." />
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
          title="Gestion des Hôtels"
          subtitle={`${hotels.length} hôtel(s) au total`}
          action={
            <Button
              onClick={() => navigate('/hotels/new')}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              New Hotel
            </Button>
          }
        />

        {hotels.length === 0 ? (
          <EmptyState
            title="None hôtel"
            description="Commencez par ajouter votre premier hôtel"
            action={{
              label: 'Add un hôtel',
              onClick: () => navigate('/hotels/new'),
            }}
          />
        ) : (
          <Table columns={columns} data={hotels} keyExtractor={(hotel) => hotel.id} />
        )}
      </Card>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, hotel: null })}
        onConfirm={handleDelete}
        title="Delete l'hôtel"
        message={`Are you sure de vouloir supprimer l'hôtel "${deleteModal.hotel?.nameTranslations.en}" ? Cette action est irréversible.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}
