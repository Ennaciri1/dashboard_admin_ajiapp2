import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminHotels, deleteHotel, updateHotel } from '../../api/hotels'
import { Hotel, TableColumn } from '../../types'
import { 
  Card, CardHeader, Button, Table, Badge, Loading, EmptyState, 
  ConfirmModal, Alert, FilterBar, BulkActionsBar, EntityStats 
} from '../../components'
import { 
  useEntityList, useEntityFilters, useEntitySelection, useConfirmModal 
} from '../../hooks'

export default function HotelsList() {
  const navigate = useNavigate()

  const {
    items: hotels,
    setItems: setHotels,
    loading,
    error,
    setError,
    deleting,
    setDeleting,
    toggling,
    setToggling,
    updateItem,
    removeItem,
  } = useEntityList<Hotel>(getAdminHotels)

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedLang,
    setSelectedLang,
  } = useEntityFilters()

  const {
    selectedIds,
    setSelectedIds,
    bulkActionLoading,
    setBulkActionLoading,
    handleSelectAll,
    handleSelectOne,
  } = useEntitySelection<Hotel>()

  const {
    modal: deleteModal,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useConfirmModal<Hotel>()

  // Filtre spécifique: cityFilter
  const [cityFilter, setCityFilter] = React.useState<string>('all')

  const handleDelete = async () => {
    if (!deleteModal.item) return

    try {
      setDeleting(true)
      await deleteHotel(deleteModal.item.id)
      removeItem(deleteModal.item.id)
      closeDeleteModal()
    } catch (err: any) {
      setError(err.message || 'Failed to delete hotel')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleActive = async (hotel: Hotel) => {
    try {
      setToggling(hotel.id)
      await updateHotel(hotel.id, {
        nameTranslations: hotel.nameTranslations,
        cityId: hotel.cityId,
        active: !hotel.active,
      })
      updateItem(hotel.id, { active: !hotel.active })
    } catch (err: any) {
      console.error('Toggle hotel error:', err)
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update hotel status'
      setError(errorMsg)
    } finally {
      setToggling(null)
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
              await updateHotel(id, {
                nameTranslations: hotel.nameTranslations,
                cityId: hotel.cityId,
                active: true,
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

      const succeeded = results.filter((r) => r.status === 'fulfilled' && r.value.success && !r.value.skipped)
      const failed = results.filter((r) => r.status === 'fulfilled' && !r.value.success)

      const successIds = succeeded.map((r: any) => r.value.id)
      setHotels(hotels.map((h) => (successIds.includes(h.id) ? { ...h, active: true } : h)))
      setSelectedIds([])

      if (failed.length > 0) {
        setError(`${succeeded.length} hotel(s) activated, ${failed.length} failed.`)
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
              await updateHotel(id, {
                nameTranslations: hotel.nameTranslations,
                cityId: hotel.cityId,
                active: false,
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

      const succeeded = results.filter((r) => r.status === 'fulfilled' && r.value.success && !r.value.skipped)
      const failed = results.filter((r) => r.status === 'fulfilled' && !r.value.success)

      const successIds = succeeded.map((r: any) => r.value.id)
      setHotels(hotels.map((h) => (successIds.includes(h.id) ? { ...h, active: false } : h)))
      setSelectedIds([])

      if (failed.length > 0) {
        setError(`${succeeded.length} hotel(s) deactivated, ${failed.length} failed.`)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to deactivate hotels')
    } finally {
      setBulkActionLoading(false)
    }
  }

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

  const activeHotels = hotels.filter((h) => h.active).length
  const inactiveHotels = hotels.length - activeHotels
  const uniqueCities = Array.from(new Set(hotels.map((h) => h.cityId).filter(Boolean)))

  const columns: TableColumn<Hotel>[] = [
    {
      key: 'select',
      label: (
        <input
          type="checkbox"
          checked={selectedIds.length === filteredHotels.length && filteredHotels.length > 0}
          onChange={(e) => handleSelectAll(e.target.checked, filteredHotels)}
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
          {selectedLang === 'en' && (
            <div className="text-sm text-gray-500">
              {hotel.nameTranslations.ar && <span className="mr-2">AR: {hotel.nameTranslations.ar}</span>}
              {hotel.nameTranslations.fr && <span>FR: {hotel.nameTranslations.fr}</span>}
            </div>
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
      key: 'createdAt',
      label: 'Created At',
      render: (value) => (value ? new Date(value).toLocaleDateString('en-US') : '-'),
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
              openDeleteModal(hotel)
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

        <div className="px-6 pb-6">
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search hotels..."
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          >
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-[#97051D] focus:border-transparent text-gray-900 min-w-[180px]"
            >
              <option value="all">All Cities</option>
              {uniqueCities.map((cityId) => (
                <option key={cityId} value={cityId}>
                  {cityId}
                </option>
              ))}
            </select>
          </FilterBar>

          <div className="mt-4">
            <EntityStats
              total={hotels.length}
              active={activeHotels}
              inactive={inactiveHotels}
              filtered={filteredHotels.length}
            />
          </div>
        </div>
      </Card>

      <BulkActionsBar
        selectedCount={selectedIds.length}
        onActivateAll={handleBulkActivate}
        onDeactivateAll={handleBulkDeactivate}
        onClearSelection={() => setSelectedIds([])}
        loading={bulkActionLoading}
      />

      <Card>
        {filteredHotels.length === 0 ? (
          <EmptyState
            title="No hotel found"
            description={searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Start by adding your first hotel'}
            action={
              searchTerm || statusFilter !== 'all'
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
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Delete Hotel"
        message={`Are you sure you want to delete "${deleteModal.item?.nameTranslations.en}"? This action is irreversible.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}
