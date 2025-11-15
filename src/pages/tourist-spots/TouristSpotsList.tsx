import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminTouristSpots, deleteTouristSpot, updateTouristSpot } from '../../api/touristSpots'
import { TouristSpot, TableColumn } from '../../types'
import { 
  Card, CardHeader, Button, Table, Badge, Loading, EmptyState, 
  ConfirmModal, Alert, FilterBar, BulkActionsBar, EntityStats 
} from '../../components'
import { 
  useEntityList, useEntityFilters, useEntitySelection, useConfirmModal 
} from '../../hooks'

export default function TouristSpotsList() {
  const navigate = useNavigate()

  const {
    items: spots,
    setItems: setSpots,
    loading,
    error,
    setError,
    deleting,
    setDeleting,
    toggling,
    setToggling,
    updateItem,
    removeItem,
  } = useEntityList<TouristSpot>(getAdminTouristSpots)

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
  } = useEntitySelection<TouristSpot>()

  const {
    modal: deleteModal,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useConfirmModal<TouristSpot>()

  // Filtres spécifiques
  const [cityFilter, setCityFilter] = React.useState<string>('all')
  const [entryTypeFilter, setEntryTypeFilter] = React.useState<string>('all')

  const handleDelete = async () => {
    if (!deleteModal.item) return

    try {
      setDeleting(true)
      await deleteTouristSpot(deleteModal.item.id)
      removeItem(deleteModal.item.id)
      closeDeleteModal()
    } catch (err: any) {
      setError(err.message || 'Failed to delete tourist spot')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleActive = async (spot: TouristSpot) => {
    try {
      setToggling(spot.id)
      await updateTouristSpot(spot.id, { 
        nameTranslations: spot.nameTranslations,
        cityId: spot.cityId,
        active: !spot.active,
      })
      updateItem(spot.id, { active: !spot.active })
    } catch (err: any) {
      console.error('Toggle tourist spot error:', err)
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update tourist spot status'
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
          const spot = spots.find((s) => s.id === id)
          if (spot && !spot.active) {
            try {
              await updateTouristSpot(id, { 
                nameTranslations: spot.nameTranslations,
                cityId: spot.cityId,
                active: true,
              })
              return { id, success: true }
            } catch (err: any) {
              console.error(`Failed to activate spot ${id}:`, err.response?.data?.message || err.message)
              return { id, success: false, error: err.response?.data?.message || err.message }
            }
          }
          return { id, success: true, skipped: true }
        })
      )

      const succeeded = results.filter((r) => r.status === 'fulfilled' && r.value.success && !r.value.skipped)
      const failed = results.filter((r) => r.status === 'fulfilled' && !r.value.success)

      const successIds = succeeded.map((r: any) => r.value.id)
      setSpots(spots.map((s) => (successIds.includes(s.id) ? { ...s, active: true } : s)))
      setSelectedIds([])

      if (failed.length > 0) {
        setError(`${succeeded.length} spot(s) activated, ${failed.length} failed.`)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to activate spots')
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
          const spot = spots.find((s) => s.id === id)
          if (spot && spot.active) {
            try {
              await updateTouristSpot(id, { 
                nameTranslations: spot.nameTranslations,
                cityId: spot.cityId,
                active: false,
              })
              return { id, success: true }
            } catch (err: any) {
              console.error(`Failed to deactivate spot ${id}:`, err.response?.data?.message || err.message)
              return { id, success: false, error: err.response?.data?.message || err.message }
            }
          }
          return { id, success: true, skipped: true }
        })
      )

      const succeeded = results.filter((r) => r.status === 'fulfilled' && r.value.success && !r.value.skipped)
      const failed = results.filter((r) => r.status === 'fulfilled' && !r.value.success)

      const successIds = succeeded.map((r: any) => r.value.id)
      setSpots(spots.map((s) => (successIds.includes(s.id) ? { ...s, active: false } : s)))
      setSelectedIds([])

      if (failed.length > 0) {
        setError(`${succeeded.length} spot(s) deactivated, ${failed.length} failed.`)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to deactivate spots')
    } finally {
      setBulkActionLoading(false)
    }
  }

  const filteredSpots = useMemo(() => {
    return spots.filter((spot) => {
      const matchesSearch =
        searchTerm === '' ||
        spot.nameTranslations.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spot.nameTranslations.fr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spot.nameTranslations.ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spot.addressTranslations?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spot.addressTranslations?.fr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spot.addressTranslations?.ar?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && spot.active) ||
        (statusFilter === 'inactive' && !spot.active)

      const matchesCity = cityFilter === 'all' || spot.cityId === cityFilter

      const matchesEntryType = entryTypeFilter === 'all' || spot.entryType === entryTypeFilter

      return matchesSearch && matchesStatus && matchesCity && matchesEntryType
    })
  }, [spots, searchTerm, statusFilter, cityFilter, entryTypeFilter])

  const activeSpots = spots.filter((s) => s.active).length
  const inactiveSpots = spots.length - activeSpots
  const uniqueCities = Array.from(new Set(spots.map((s) => s.cityId).filter(Boolean)))
  const uniqueEntryTypes = Array.from(new Set(spots.map((s) => s.entryType).filter(Boolean)))

  const columns: TableColumn<TouristSpot>[] = [
    {
      key: 'select',
      label: (
        <input
          type="checkbox"
          checked={selectedIds.length === filteredSpots.length && filteredSpots.length > 0}
          onChange={(e) => handleSelectAll(e.target.checked, filteredSpots)}
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
      ),
      render: (_, spot) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(spot.id)}
          onChange={(e) => handleSelectOne(spot.id, e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
      ),
    },
    {
      key: 'nameTranslations',
      label: 'Name',
      render: (_, spot) => (
        <div>
          <div className="font-medium text-gray-900">
            {spot.nameTranslations[selectedLang] || spot.nameTranslations.en || spot.nameTranslations.fr || spot.nameTranslations.ar}
          </div>
          {selectedLang === 'en' && (
            <div className="text-sm text-gray-500">
              {spot.nameTranslations.ar && <span className="mr-2">AR: {spot.nameTranslations.ar}</span>}
              {spot.nameTranslations.fr && <span>FR: {spot.nameTranslations.fr}</span>}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'entryType',
      label: 'Entry Type',
      render: (value) => <Badge variant="secondary">{value || 'N/A'}</Badge>,
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
      render: (_, spot) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={spot.active ? 'warning' : 'success'}
            onClick={(e) => {
              e.stopPropagation()
              handleToggleActive(spot)
            }}
            loading={toggling === spot.id}
          >
            {spot.active ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/tourist-spots/${spot.id}/view`)
            }}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/tourist-spots/${spot.id}/edit`)
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation()
              openDeleteModal(spot)
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
          <Loading text="Loading tourist spots..." />
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
          title="Tourist Spots Management"
          subtitle={`${spots.length} spot(s) total`}
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
                onClick={() => navigate('/tourist-spots/new')}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
              New Tourist Spot
              </Button>
          </div>
        }
      />
      
        <div className="px-6 pb-6">
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search tourist spots..."
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
                <select
                  value={entryTypeFilter}
              onChange={(e) => setEntryTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-[#97051D] focus:border-transparent text-gray-900 min-w-[180px]"
                >
              <option value="all">All Entry Types</option>
              {uniqueEntryTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
          </select>
          </FilterBar>

          <div className="mt-4">
            <EntityStats
              total={spots.length}
              active={activeSpots}
              inactive={inactiveSpots}
              filtered={filteredSpots.length}
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
        {filteredSpots.length === 0 ? (
          <EmptyState
            title="No tourist spot found"
            description={searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Start by adding your first tourist spot'}
            action={
              searchTerm || statusFilter !== 'all'
                ? {
                    label: 'Clear Filters',
                    onClick: () => {
                      setSearchTerm('')
                      setStatusFilter('all')
                      setCityFilter('all')
                      setEntryTypeFilter('all')
                    },
                  }
                : {
                    label: 'Add a tourist spot',
                    onClick: () => navigate('/tourist-spots/new'),
                  }
            }
          />
        ) : (
          <Table columns={columns} data={filteredSpots} keyExtractor={(spot) => spot.id} />
        )}
      </Card>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Delete Tourist Spot"
        message={`Are you sure you want to delete "${deleteModal.item?.nameTranslations.en}"? This action is irreversible.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}
