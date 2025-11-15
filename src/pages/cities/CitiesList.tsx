import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllCitiesAdmin, deleteCity, updateCity } from '../../api/cities'
import { City, TableColumn } from '../../types'
import { 
  Card, CardHeader, Button, Table, Badge, Loading, EmptyState, 
  ConfirmModal, Alert, FilterBar, BulkActionsBar, EntityStats 
} from '../../components'
import { 
  useEntityList, useEntityFilters, useEntitySelection, useConfirmModal 
} from '../../hooks'

export default function CitiesList() {
  const navigate = useNavigate()

  const {
    items: cities,
    setItems: setCities,
    loading,
    error,
    setError,
    deleting,
    setDeleting,
    toggling,
    setToggling,
    updateItem,
    removeItem,
  } = useEntityList<City>(getAllCitiesAdmin)

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
  } = useEntitySelection<City>()

  const {
    modal: deleteModal,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useConfirmModal<City>()

  const handleDelete = async () => {
    if (!deleteModal.item) return

    try {
      setDeleting(true)
      await deleteCity(deleteModal.item.id)
      removeItem(deleteModal.item.id)
      closeDeleteModal()
    } catch (err: any) {
      setError(err.message || 'Failed to delete city')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleActive = async (city: City) => {
    try {
      setToggling(city.id)
      await updateCity(city.id, {
        nameTranslations: city.nameTranslations,
        active: !city.active,
      })
      updateItem(city.id, { active: !city.active })
    } catch (err: any) {
      console.error('Toggle city error:', err)
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update city status'
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
          const city = cities.find((c) => c.id === id)
          if (city && !city.active) {
            try {
              await updateCity(id, {
                nameTranslations: city.nameTranslations,
                active: true,
              })
              return { id, success: true }
            } catch (err: any) {
              console.error(`Failed to activate city ${id}:`, err.response?.data?.message || err.message)
              return { id, success: false, error: err.response?.data?.message || err.message }
            }
          }
          return { id, success: true, skipped: true }
        })
      )

      const succeeded = results.filter((r) => r.status === 'fulfilled' && r.value.success && !r.value.skipped)
      const failed = results.filter((r) => r.status === 'fulfilled' && !r.value.success)

      const successIds = succeeded.map((r: any) => r.value.id)
      setCities(cities.map((c) => (successIds.includes(c.id) ? { ...c, active: true } : c)))
      setSelectedIds([])

      if (failed.length > 0) {
        setError(`${succeeded.length} city(ies) activated, ${failed.length} failed.`)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to activate cities')
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
          const city = cities.find((c) => c.id === id)
          if (city && city.active) {
            try {
              await updateCity(id, {
                nameTranslations: city.nameTranslations,
                active: false,
              })
              return { id, success: true }
            } catch (err: any) {
              console.error(`Failed to deactivate city ${id}:`, err.response?.data?.message || err.message)
              return { id, success: false, error: err.response?.data?.message || err.message }
            }
          }
          return { id, success: true, skipped: true }
        })
      )

      const succeeded = results.filter((r) => r.status === 'fulfilled' && r.value.success && !r.value.skipped)
      const failed = results.filter((r) => r.status === 'fulfilled' && !r.value.success)

      const successIds = succeeded.map((r: any) => r.value.id)
      setCities(cities.map((c) => (successIds.includes(c.id) ? { ...c, active: false } : c)))
      setSelectedIds([])

      if (failed.length > 0) {
        setError(`${succeeded.length} city(ies) deactivated, ${failed.length} failed.`)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to deactivate cities')
    } finally {
      setBulkActionLoading(false)
    }
  }

  const filteredCities = useMemo(() => {
    return cities.filter((city) => {
      const matchesSearch =
        searchTerm === '' ||
        city.nameTranslations.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.nameTranslations.fr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.nameTranslations.ar?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && city.active) ||
        (statusFilter === 'inactive' && !city.active)

      return matchesSearch && matchesStatus
    })
  }, [cities, searchTerm, statusFilter])

  const activeCities = cities.filter((c) => c.active).length
  const inactiveCities = cities.length - activeCities

  const columns: TableColumn<City>[] = [
    {
      key: 'select',
      label: (
        <input
          type="checkbox"
          checked={selectedIds.length === filteredCities.length && filteredCities.length > 0}
          onChange={(e) => handleSelectAll(e.target.checked, filteredCities)}
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
      ),
      render: (_, city) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(city.id)}
          onChange={(e) => handleSelectOne(city.id, e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
      ),
    },
    {
      key: 'nameTranslations',
      label: 'Name',
      render: (_, city) => (
        <div>
          <div className="font-medium text-gray-900">
            {city.nameTranslations[selectedLang] || city.nameTranslations.en || city.nameTranslations.fr || city.nameTranslations.ar}
          </div>
          {selectedLang === 'en' && (
            <div className="text-sm text-gray-500">
              {city.nameTranslations.ar && <span className="mr-2">AR: {city.nameTranslations.ar}</span>}
              {city.nameTranslations.fr && <span>FR: {city.nameTranslations.fr}</span>}
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
      render: (_, city) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={city.active ? 'warning' : 'success'}
            onClick={(e) => {
              e.stopPropagation()
              handleToggleActive(city)
            }}
            loading={toggling === city.id}
          >
            {city.active ? 'Deactivate' : 'Activate'}
          </Button>
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
              openDeleteModal(city)
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
          <Loading text="Loading cities..." />
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
          title="Cities Management"
          subtitle={`${cities.length} city(ies) total`}
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
                onClick={() => navigate('/cities/new')}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                New City
              </Button>
            </div>
          }
        />

        <div className="px-6 pb-6">
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search cities..."
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />

          <div className="mt-4">
            <EntityStats
              total={cities.length}
              active={activeCities}
              inactive={inactiveCities}
              filtered={filteredCities.length}
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
        {filteredCities.length === 0 ? (
          <EmptyState
            title="No city found"
            description={searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Start by adding your first city'}
            action={
              searchTerm || statusFilter !== 'all'
                ? {
                    label: 'Clear Filters',
                    onClick: () => {
                      setSearchTerm('')
                      setStatusFilter('all')
                    },
                  }
                : {
                    label: 'Add a city',
                    onClick: () => navigate('/cities/new'),
                  }
            }
          />
        ) : (
          <Table columns={columns} data={filteredCities} keyExtractor={(city) => city.id} />
        )}
      </Card>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Delete City"
        message={`Are you sure you want to delete "${deleteModal.item?.nameTranslations.en}"? This action is irreversible.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}
