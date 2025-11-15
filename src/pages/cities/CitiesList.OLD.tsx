import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllCitiesAdmin, deleteCity, updateCity } from '../../api/cities'
import { City, TableColumn } from '../../types'
import Card, { CardHeader } from '../../components/Card'
import Button from '../../components/Button'
import Table from '../../components/Table'
import Badge from '../../components/Badge'
import Loading from '../../components/Loading'
import EmptyState from '../../components/EmptyState'
import { ConfirmModal } from '../../components/Modal'
import Alert from '../../components/Alert'

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
  const [toggling, setToggling] = useState<string | null>(null)

  // Filtrage
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [selectedLang, setSelectedLang] = useState<'en' | 'fr' | 'ar'>('en')

  // Sélection multiple
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

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
      setError(err.message || 'Error loading cities')
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
      setError(err.message || 'Failed to delete city')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleActive = async (city: City) => {
    try {
      setToggling(city.id)
      // Backend exige nameTranslations même pour une simple mise à jour de 'active'
      await updateCity(city.id, { 
        nameTranslations: city.nameTranslations,
        active: !city.active 
      })
      setCities(cities.map((c) => (c.id === city.id ? { ...c, active: !c.active } : c)))
    } catch (err: any) {
      console.error('Toggle city error:', err)
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update city status'
      setError(errorMsg)
    } finally {
      setToggling(null)
    }
  }

  // Filtrage
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

  // Statistiques
  const activeCities = cities.filter((c) => c.active).length
  const inactiveCities = cities.length - activeCities

  // Sélection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredCities.map((c) => c.id))
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
          const city = cities.find((c) => c.id === id)
          if (city && !city.active) {
            try {
              // Backend exige nameTranslations même pour mise à jour de active
              await updateCity(id, { 
                nameTranslations: city.nameTranslations,
                active: true 
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
      setCities(
        cities.map((c) => (successIds.includes(c.id) ? { ...c, active: true } : c))
      )
      setSelectedIds([])

      if (failed.length > 0) {
        setError(`${succeeded.length} city(ies) activated, ${failed.length} failed. Check that cities have all required translations.`)
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
              // Backend exige nameTranslations même pour mise à jour de active
              await updateCity(id, { 
                nameTranslations: city.nameTranslations,
                active: false 
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
      setCities(
        cities.map((c) => (successIds.includes(c.id) ? { ...c, active: false } : c))
      )
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

  const columns: TableColumn<City>[] = [
    {
      key: 'select',
      label: (
        <input
          type="checkbox"
          checked={selectedIds.length === filteredCities.length && filteredCities.length > 0}
          onChange={(e) => handleSelectAll(e.target.checked)}
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

      {/* PREMIER CONTAINER : Header + Filtres */}
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

        {/* Section Filtres */}
        <div className="px-6 pb-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            {/* Filtres */}
            <div className="flex flex-wrap gap-4 items-center mb-4">
              <div className="flex-1 min-w-[250px]">
                <input
                  type="text"
                  placeholder="Search cities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#97051D] focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                />
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
                <span className="text-gray-600">Total Cities:</span>
                <span className="font-semibold text-gray-900">{cities.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Active:</span>
                <span className="font-semibold text-green-600">{activeCities}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Inactive:</span>
                <span className="font-semibold text-red-600">{inactiveCities}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Filtered:</span>
                <span className="font-semibold text-blue-600">{filteredCities.length}</span>
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
        onClose={() => setDeleteModal({ isOpen: false, city: null })}
        onConfirm={handleDelete}
        title="Delete City"
        message={`Are you sure you want to delete "${deleteModal.city?.nameTranslations.en}"? This action is irreversible.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}
