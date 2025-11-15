import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminHotels, deleteHotel, updateHotel } from '../../api/hotels'
import { Hotel, TableColumn } from '../../types'
import Card, { CardHeader } from '../../components/Card'
import Button from '../../components/Button'
import Table from '../../components/Table'
import Badge from '../../components/Badge'
import Loading from '../../components/Loading'
import EmptyState from '../../components/EmptyState'
import { ConfirmModal } from '../../components/Modal'
import Alert from '../../components/Alert'

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
  const [toggling, setToggling] = useState<string | null>(null)

  // Filtrage
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [cityFilter, setCityFilter] = useState<string>('all')
  const [selectedLang, setSelectedLang] = useState<'en' | 'fr' | 'ar'>('en')

  // Sélection multiple
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

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
      setError(err.message || 'Error loading hotels')
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
      setError(err.message || 'Failed to delete hotel')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleActive = async (hotel: Hotel) => {
    try {
      setToggling(hotel.id)
      // Backend exige nameTranslations et cityId même pour une simple mise à jour de 'active'
      await updateHotel(hotel.id, { 
        nameTranslations: hotel.nameTranslations,
        cityId: hotel.cityId,
        active: !hotel.active 
      })
      setHotels(hotels.map((h) => (h.id === hotel.id ? { ...h, active: !h.active } : h)))
    } catch (err: any) {
      console.error('Toggle active error:', err)
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update hotel status'
      setError(errorMsg)
    } finally {
      setToggling(null)
    }
  }

  // Filtrage
  const filteredHotels = useMemo(() => {
    return hotels.filter((hotel) => {
      const matchesSearch =
        searchTerm === '' ||
        hotel.nameTranslations.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.nameTranslations.fr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.nameTranslations.ar?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && hotel.active) ||
        (statusFilter === 'inactive' && !hotel.active)

      const matchesCity = cityFilter === 'all' || hotel.cityId === cityFilter

      return matchesSearch && matchesStatus && matchesCity
    })
  }, [hotels, searchTerm, statusFilter, cityFilter])

  // Extraction des villes uniques
  const uniqueCities = useMemo(() => {
    const citiesMap = new Map<string, string>()
    hotels.forEach((hotel) => {
      if (hotel.city) {
        citiesMap.set(hotel.cityId, hotel.city.nameTranslations.en || hotel.cityId)
      }
    })
    return Array.from(citiesMap.entries())
  }, [hotels])

  // Statistiques
  const activeHotels = hotels.filter((h) => h.active).length
  const inactiveHotels = hotels.length - activeHotels

  // Sélection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredHotels.map((h) => h.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id))
    }
  }

  const handleBulkActivate = async () => {
    if (selectedIds.length === 0) return

    try {
      setBulkActionLoading(true)
      const results = await Promise.allSettled(
        selectedIds.map(async (id) => {
          const hotel = hotels.find((h) => h.id === id)
          if (hotel && !hotel.active) {
            try {
              // Backend exige nameTranslations et cityId même pour mise à jour de active
              await updateHotel(id, { 
                nameTranslations: hotel.nameTranslations,
                cityId: hotel.cityId,
                active: true 
              })
              return { id, success: true }
            } catch (err: any) {
              console.error(`Failed to activate hotel ${id}:`, err.response?.data?.message || err.message)
              return { id, success: false, error: err.response?.data?.message || err.message }
            }
          }
          return { id, success: true, skipped: true }
        })
      )

      // Compter les succès et échecs
      const succeeded = results.filter((r) => r.status === 'fulfilled' && r.value.success && !r.value.skipped)
      const failed = results.filter((r) => r.status === 'fulfilled' && !r.value.success)
      const skipped = results.filter((r) => r.status === 'fulfilled' && r.value.skipped)

      // Mettre à jour uniquement les hôtels qui ont réussi
      const successIds = succeeded.map((r: any) => r.value.id)
      setHotels(
        hotels.map((h) => (successIds.includes(h.id) ? { ...h, active: true } : h))
      )
      setSelectedIds([])

      // Afficher un message de résumé
      if (failed.length > 0) {
        setError(`${succeeded.length} hotel(s) activated, ${failed.length} failed. Check that hotels have all required translations and images.`)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to activate hotels')
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleBulkDeactivate = async () => {
    if (selectedIds.length === 0) return

    try {
      setBulkActionLoading(true)
      const results = await Promise.allSettled(
        selectedIds.map(async (id) => {
          const hotel = hotels.find((h) => h.id === id)
          if (hotel && hotel.active) {
            try {
              // Backend exige nameTranslations et cityId même pour mise à jour de active
              await updateHotel(id, { 
                nameTranslations: hotel.nameTranslations,
                cityId: hotel.cityId,
                active: false 
              })
              return { id, success: true }
            } catch (err: any) {
              console.error(`Failed to deactivate hotel ${id}:`, err.response?.data?.message || err.message)
              return { id, success: false, error: err.response?.data?.message || err.message }
            }
          }
          return { id, success: true, skipped: true }
        })
      )

      // Compter les succès et échecs
      const succeeded = results.filter((r) => r.status === 'fulfilled' && r.value.success && !r.value.skipped)
      const failed = results.filter((r) => r.status === 'fulfilled' && !r.value.success)

      // Mettre à jour uniquement les hôtels qui ont réussi
      const successIds = succeeded.map((r: any) => r.value.id)
      setHotels(
        hotels.map((h) => (successIds.includes(h.id) ? { ...h, active: false } : h))
      )
      setSelectedIds([])

      // Afficher un message de résumé
      if (failed.length > 0) {
        setError(`${succeeded.length} hotel(s) deactivated, ${failed.length} failed.`)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to deactivate hotels')
    } finally {
      setBulkActionLoading(false)
    }
  }

  const columns: TableColumn<Hotel>[] = [
    {
      key: 'select',
      label: (
        <input
          type="checkbox"
          checked={selectedIds.length === filteredHotels.length && filteredHotels.length > 0}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
      ),
      render: (_, hotel) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(hotel.id)}
          onChange={(e) => handleSelectOne(hotel.id, e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
      ),
    },
    {
      key: 'nameTranslations',
      label: 'Name',
      render: (_, hotel) => (
        <div>
          <div className="font-medium text-gray-900">
            {hotel.nameTranslations[selectedLang] || hotel.nameTranslations.en || hotel.nameTranslations.fr || hotel.nameTranslations.ar}
          </div>
          {hotel.priceInfo && (
            <div className="text-sm text-gray-500">
              From {hotel.priceInfo.amount} {hotel.priceInfo.currency}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'cityId',
      label: 'City',
      render: (_, hotel) => (
        <div className="text-sm text-gray-600">
          {hotel.city?.nameTranslations?.en || hotel.cityId}
        </div>
      ),
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (_, hotel) => (
        <div className="flex items-center gap-2">
          {hotel.rating ? (
            <>
              <div className="flex items-center text-warning-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="ml-1 font-medium">{hotel.rating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-gray-500">({hotel.ratingCount || 0})</span>
            </>
          ) : (
            <span className="text-sm text-gray-500">No ratings</span>
          )}
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
            variant={hotel.active ? 'warning' : 'success'}
            onClick={(e) => {
              e.stopPropagation()
              handleToggleActive(hotel)
            }}
            loading={toggling === hotel.id}
          >
            {hotel.active ? 'Deactivate' : 'Activate'}
          </Button>
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
          <Loading text="Loading hotels..." />
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

      {/* PREMIER CONTAINER : Header + Filtres */}
      <Card>
        <CardHeader
          title="Hotels Management"
          subtitle={`${hotels.length} hotel(s) total`}
          action={
            <div className="flex items-center gap-3">
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value as 'en' | 'fr' | 'ar')}
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-[#97051D] focus:border-transparent text-gray-900"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="ar">العربية</option>
              </select>
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
            </div>
          }
        />

        {/* Section Filtres */}
        <div className="px-6 pb-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            {/* Filtres */}
            <div className="flex flex-wrap gap-4 items-center mb-4">
              <div className="flex-1 min-w-[250px]">
                <input
                  type="text"
                  placeholder="Search hotels..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#97051D] focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                />
              </div>
              <div>
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-[#97051D] focus:border-transparent text-gray-900 min-w-[180px]"
                >
                  <option value="all">All Cities ({uniqueCities.length})</option>
                  {uniqueCities.map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                  className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-[#97051D] focus:border-transparent text-gray-900 min-w-[180px]"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Statistiques */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Total Hotels:</span>
                <span className="font-semibold text-gray-900">{hotels.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Active:</span>
                <span className="font-semibold text-green-600">{activeHotels}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Inactive:</span>
                <span className="font-semibold text-red-600">{inactiveHotels}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Filtered:</span>
                <span className="font-semibold text-blue-600">{filteredHotels.length}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions en masse */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm font-medium text-blue-900">
            {selectedIds.length} selected
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="success"
              onClick={handleBulkActivate}
              loading={bulkActionLoading}
            >
              Activate All
            </Button>
            <Button
              size="sm"
              variant="warning"
              onClick={handleBulkDeactivate}
              loading={bulkActionLoading}
            >
              Deactivate All
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedIds([])}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* DEUXIÈME CONTAINER : Table seule */}
      <Card>
        {filteredHotels.length === 0 ? (
          <EmptyState
            title="No hotel found"
            description={
              searchTerm || statusFilter !== 'all' || cityFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Start by adding your first hotel'
            }
            action={
              searchTerm || statusFilter !== 'all' || cityFilter !== 'all'
                ? {
                    label: 'Clear Filters',
                    onClick: () => {
                      setSearchTerm('')
                      setStatusFilter('all')
                      setCityFilter('all')
                    },
                  }
                : {
                    label: 'Add a hotel',
                    onClick: () => navigate('/hotels/new'),
                  }
            }
          />
        ) : (
          <Table columns={columns} data={filteredHotels} keyExtractor={(hotel) => hotel.id} />
        )}
      </Card>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, hotel: null })}
        onConfirm={handleDelete}
        title="Delete Hotel"
        message={`Are you sure you want to delete "${deleteModal.hotel?.nameTranslations.en}"? This action is irreversible.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}
