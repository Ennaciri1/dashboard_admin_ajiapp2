import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminTouristSpots, deleteTouristSpot, updateTouristSpot } from '../../api/touristSpots'
import { TouristSpot, TableColumn } from '../../types'
import Card, { CardHeader } from '../../components/Card'
import Button from '../../components/Button'
import Table from '../../components/Table'
import Badge from '../../components/Badge'
import Loading from '../../components/Loading'
import EmptyState from '../../components/EmptyState'
import { ConfirmModal } from '../../components/Modal'
import Alert from '../../components/Alert'

export default function TouristSpotsList() {
  const navigate = useNavigate()
  const [spots, setSpots] = useState<TouristSpot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; spot: TouristSpot | null }>({
    isOpen: false,
    spot: null,
  })
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)

  // Filtrage
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [cityFilter, setCityFilter] = useState<string>('all')
  const [entryTypeFilter, setEntryTypeFilter] = useState<'all' | 'paid' | 'free'>('all')
  const [selectedLang, setSelectedLang] = useState<'en' | 'fr' | 'ar'>('en')

  // Sélection multiple
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  useEffect(() => {
    loadSpots()
  }, [])

  const loadSpots = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAdminTouristSpots()
      setSpots(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load tourist spots')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.spot) return

    try {
      setDeleting(true)
      await deleteTouristSpot(deleteModal.spot.id)
      setSpots(spots.filter((s) => s.id !== deleteModal.spot!.id))
      setDeleteModal({ isOpen: false, spot: null })
    } catch (err: any) {
      setError(err.message || 'Failed to delete tourist spot')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleActive = async (spot: TouristSpot) => {
    try {
      setToggling(spot.id)
      // Backend exige nameTranslations et cityId même pour une simple mise à jour de 'active'
      await updateTouristSpot(spot.id, { 
        nameTranslations: spot.nameTranslations,
        cityId: spot.cityId,
        active: !spot.active 
      })
      setSpots(spots.map((s) => (s.id === spot.id ? { ...s, active: !s.active } : s)))
    } catch (err: any) {
      console.error('Toggle tourist spot error:', err)
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update tourist spot status'
      setError(errorMsg)
    } finally {
      setToggling(null)
    }
  }

  // Filtrage
  const filteredSpots = useMemo(() => {
    return spots.filter((spot) => {
      const matchesSearch =
        searchTerm === '' ||
        spot.nameTranslations.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spot.nameTranslations.fr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spot.nameTranslations.ar?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' ||
                         (statusFilter === 'active' && spot.active) || 
                         (statusFilter === 'inactive' && !spot.active)

      const matchesCity = cityFilter === 'all' || spot.cityId === cityFilter

      const matchesEntryType =
        entryTypeFilter === 'all' ||
        (entryTypeFilter === 'paid' && spot.isPaidEntry) ||
        (entryTypeFilter === 'free' && !spot.isPaidEntry)

      return matchesSearch && matchesStatus && matchesCity && matchesEntryType
    })
  }, [spots, searchTerm, statusFilter, cityFilter, entryTypeFilter])

  // Extraction des villes uniques
  const uniqueCities = useMemo(() => {
    const citiesMap = new Map<string, string>()
    spots.forEach((spot) => {
      if (spot.city) {
        citiesMap.set(spot.cityId, spot.city.nameTranslations.en || spot.cityId)
      }
    })
    return Array.from(citiesMap.entries())
  }, [spots])

  // Statistiques
  const activeSpots = spots.filter((s) => s.active).length
  const inactiveSpots = spots.length - activeSpots
  const paidSpots = spots.filter((s) => s.isPaidEntry).length
  const freeSpots = spots.length - paidSpots

  // Sélection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredSpots.map((s) => s.id))
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
          const spot = spots.find((s) => s.id === id)
          if (spot && !spot.active) {
            try {
              // Backend exige nameTranslations et cityId même pour mise à jour de active
              await updateTouristSpot(id, { 
                nameTranslations: spot.nameTranslations,
                cityId: spot.cityId,
                active: true 
              })
              return { id, success: true }
            } catch (err: any) {
              console.error(`Failed to activate tourist spot ${id}:`, err.response?.data?.message || err.message)
              return { id, success: false, error: err.response?.data?.message || err.message }
            }
          }
          return { id, success: true, skipped: true }
        })
      )

      const succeeded = results.filter((r) => r.status === 'fulfilled' && r.value.success && !r.value.skipped)
      const failed = results.filter((r) => r.status === 'fulfilled' && !r.value.success)

      const successIds = succeeded.map((r: any) => r.value.id)
      setSpots(
        spots.map((s) => (successIds.includes(s.id) ? { ...s, active: true } : s))
      )
      setSelectedIds([])

      if (failed.length > 0) {
        setError(`${succeeded.length} tourist spot(s) activated, ${failed.length} failed.`)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to activate tourist spots')
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
              // Backend exige nameTranslations et cityId même pour mise à jour de active
              await updateTouristSpot(id, { 
                nameTranslations: spot.nameTranslations,
                cityId: spot.cityId,
                active: false 
              })
              return { id, success: true }
            } catch (err: any) {
              console.error(`Failed to deactivate tourist spot ${id}:`, err.response?.data?.message || err.message)
              return { id, success: false, error: err.response?.data?.message || err.message }
            }
          }
          return { id, success: true, skipped: true }
        })
      )

      const succeeded = results.filter((r) => r.status === 'fulfilled' && r.value.success && !r.value.skipped)
      const failed = results.filter((r) => r.status === 'fulfilled' && !r.value.success)

      const successIds = succeeded.map((r: any) => r.value.id)
      setSpots(
        spots.map((s) => (successIds.includes(s.id) ? { ...s, active: false } : s))
      )
      setSelectedIds([])

      if (failed.length > 0) {
        setError(`${succeeded.length} tourist spot(s) deactivated, ${failed.length} failed.`)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to deactivate tourist spots')
    } finally {
      setBulkActionLoading(false)
    }
  }

  const columns: TableColumn<TouristSpot>[] = [
    {
      key: 'select',
      label: (
        <input
          type="checkbox"
          checked={selectedIds.length === filteredSpots.length && filteredSpots.length > 0}
          onChange={(e) => handleSelectAll(e.target.checked)}
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
          {spot.addressTranslations && (
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {spot.addressTranslations[selectedLang] || spot.addressTranslations.en || spot.addressTranslations.fr || spot.addressTranslations.ar}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'cityId',
      label: 'City',
      render: (_, spot) => (
        <div className="text-sm text-gray-600">
          {spot.city?.nameTranslations?.en || spot.cityId}
        </div>
      ),
    },
    {
      key: 'isPaidEntry',
      label: 'Entry Type',
      render: (value) =>
        value ? (
          <Badge variant="warning">Paid</Badge>
        ) : (
          <Badge variant="success">Free</Badge>
        ),
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (_, spot) => (
        <div className="flex items-center gap-2">
          {spot.rating ? (
            <>
              <div className="flex items-center text-warning-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="ml-1 font-medium">{spot.rating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-gray-500">({spot.ratingCount || 0})</span>
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
              setDeleteModal({ isOpen: true, spot })
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

      {/* PREMIER CONTAINER : Header + Filtres */}
      <Card>
        <CardHeader
          title="Tourist Spots Management"
          subtitle={`${spots.length} tourist spot(s) total`}
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
      
        {/* Section Filtres */}
        <div className="px-6 pb-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            {/* Filtres */}
            <div className="flex flex-wrap gap-4 items-center mb-4">
        <div className="flex-1 min-w-[250px]">
          <input
            type="text"
            placeholder="Search tourist spots..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#97051D] focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
          />
        </div>
        <div>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-[#97051D] focus:border-transparent text-gray-900 min-w-[150px]"
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
                  value={entryTypeFilter}
                  onChange={(e) => setEntryTypeFilter(e.target.value as 'all' | 'paid' | 'free')}
                  className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-[#97051D] focus:border-transparent text-gray-900 min-w-[150px]"
                >
                  <option value="all">All Types</option>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
          </select>
        </div>
        <div>
          <select
            value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                  className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-[#97051D] focus:border-transparent text-gray-900 min-w-[150px]"
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
                <span className="text-gray-600">Total Spots:</span>
                <span className="font-semibold text-gray-900">{spots.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Active:</span>
                <span className="font-semibold text-green-600">{activeSpots}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Inactive:</span>
                <span className="font-semibold text-red-600">{inactiveSpots}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Free Entry:</span>
                <span className="font-semibold text-blue-600">{freeSpots}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Paid Entry:</span>
                <span className="font-semibold text-orange-600">{paidSpots}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Filtered:</span>
                <span className="font-semibold text-purple-600">{filteredSpots.length}</span>
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
        {filteredSpots.length === 0 ? (
          <EmptyState
            title="No tourist spot found"
            description={
              searchTerm || statusFilter !== 'all' || cityFilter !== 'all' || entryTypeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Start by adding your first tourist spot'
            }
            action={
              searchTerm || statusFilter !== 'all' || cityFilter !== 'all' || entryTypeFilter !== 'all'
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
        onClose={() => setDeleteModal({ isOpen: false, spot: null })}
        onConfirm={handleDelete}
        title="Delete Tourist Spot"
        message={`Are you sure you want to delete "${deleteModal.spot?.nameTranslations.en}"? This action is irreversible.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}
