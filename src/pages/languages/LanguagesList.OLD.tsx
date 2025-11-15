import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSupportedLanguages, deleteSupportedLanguage, updateSupportedLanguage } from '../../api/languages'
import { SupportedLanguage, TableColumn } from '../../types'
import Card, { CardHeader } from '../../components/Card'
import Button from '../../components/Button'
import Table from '../../components/Table'
import Badge from '../../components/Badge'
import Loading from '../../components/Loading'
import EmptyState from '../../components/EmptyState'
import { ConfirmModal } from '../../components/Modal'
import Alert from '../../components/Alert'

export default function LanguagesList() {
  const navigate = useNavigate()
  const [languages, setLanguages] = useState<SupportedLanguage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; language: SupportedLanguage | null }>({
    isOpen: false,
    language: null,
  })
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)

  // Filtrage
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Sélection multiple
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  useEffect(() => {
    loadLanguages()
  }, [])

  const loadLanguages = async () => {
    try {
      setLoading(true)
      setError(null)
      // Charger TOUTES les langues (actives ET inactives) pour l'admin
      const data = await getSupportedLanguages(undefined)
      setLanguages(data)
    } catch (err: any) {
      setError(err.message || 'Error loading languages')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.language) return

    try {
      setDeleting(true)
      await deleteSupportedLanguage(deleteModal.language.id)
      setLanguages(languages.filter((l) => l.id !== deleteModal.language!.id))
      setDeleteModal({ isOpen: false, language: null })
    } catch (err: any) {
      setError(err.message || 'Failed to delete language')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleActive = async (language: SupportedLanguage) => {
    try {
      setToggling(language.id)
      // Backend exige le champ 'code' même pour une simple mise à jour de 'active'
      await updateSupportedLanguage(language.id, { 
        code: language.code, 
        name: language.name,
        active: !language.active 
      })
      setLanguages(languages.map((l) => (l.id === language.id ? { ...l, active: !l.active } : l)))
    } catch (err: any) {
      console.error('Toggle language error:', err)
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update language status'
      setError(errorMsg)
    } finally {
      setToggling(null)
    }
  }

  // Filtrage
  const filteredLanguages = useMemo(() => {
    return languages.filter((language) => {
      const matchesSearch =
        searchTerm === '' ||
        language.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        language.code?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && language.active) ||
        (statusFilter === 'inactive' && !language.active)

      return matchesSearch && matchesStatus
    })
  }, [languages, searchTerm, statusFilter])

  // Statistiques
  const activeLanguages = languages.filter((l) => l.active).length
  const inactiveLanguages = languages.length - activeLanguages

  // Sélection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredLanguages.map((l) => l.id))
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
          const language = languages.find((l) => l.id === id)
          if (language && !language.active) {
            try {
              // Backend exige code et name même pour mise à jour de active
              await updateSupportedLanguage(id, { 
                code: language.code, 
                name: language.name, 
                active: true 
              })
              return { id, success: true }
            } catch (err: any) {
              console.error(`Failed to activate language ${id}:`, err.response?.data?.message || err.message)
              return { id, success: false, error: err.response?.data?.message || err.message }
            }
          }
          return { id, success: true, skipped: true }
        })
      )

      const succeeded = results.filter((r) => r.status === 'fulfilled' && r.value.success && !r.value.skipped)
      const failed = results.filter((r) => r.status === 'fulfilled' && !r.value.success)

      const successIds = succeeded.map((r: any) => r.value.id)
      setLanguages(
        languages.map((l) => (successIds.includes(l.id) ? { ...l, active: true } : l))
      )
      setSelectedIds([])

      if (failed.length > 0) {
        setError(`${succeeded.length} language(s) activated, ${failed.length} failed.`)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to activate languages')
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
          const language = languages.find((l) => l.id === id)
          if (language && language.active) {
            try {
              // Backend exige code et name même pour mise à jour de active
              await updateSupportedLanguage(id, { 
                code: language.code, 
                name: language.name, 
                active: false 
              })
              return { id, success: true }
            } catch (err: any) {
              console.error(`Failed to deactivate language ${id}:`, err.response?.data?.message || err.message)
              return { id, success: false, error: err.response?.data?.message || err.message }
            }
          }
          return { id, success: true, skipped: true }
        })
      )

      const succeeded = results.filter((r) => r.status === 'fulfilled' && r.value.success && !r.value.skipped)
      const failed = results.filter((r) => r.status === 'fulfilled' && !r.value.success)

      const successIds = succeeded.map((r: any) => r.value.id)
      setLanguages(
        languages.map((l) => (successIds.includes(l.id) ? { ...l, active: false } : l))
      )
      setSelectedIds([])

      if (failed.length > 0) {
        setError(`${succeeded.length} language(s) deactivated, ${failed.length} failed.`)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to deactivate languages')
    } finally {
      setBulkActionLoading(false)
    }
  }

  const columns: TableColumn<SupportedLanguage>[] = [
    {
      key: 'select',
      label: (
        <input
          type="checkbox"
          checked={selectedIds.length === filteredLanguages.length && filteredLanguages.length > 0}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
      ),
      render: (_, language) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(language.id)}
          onChange={(e) => handleSelectOne(language.id, e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
      ),
    },
    {
      key: 'name',
      label: 'Language',
      render: (_, language) => (
        <div>
          <div className="font-medium text-gray-900">{language.name}</div>
          <div className="text-sm text-gray-500">{language.code}</div>
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
      key: 'createdBy',
      label: 'Created By',
      render: (value) => (
        <div className="text-sm text-gray-600">{value || '-'}</div>
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
      render: (_, language) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={language.active ? 'warning' : 'success'}
            onClick={(e) => {
              e.stopPropagation()
              handleToggleActive(language)
            }}
            loading={toggling === language.id}
          >
            {language.active ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/languages/${language.id}/edit`)
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation()
              setDeleteModal({ isOpen: true, language })
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
          <Loading text="Loading languages..." />
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
          title="Languages Management"
          subtitle={`${languages.length} language(s) total`}
          action={
            <Button
              onClick={() => navigate('/languages/new')}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              New Language
            </Button>
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
                  placeholder="Search by name or code..."
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
                <span className="text-gray-600">Total Languages:</span>
                <span className="font-semibold text-gray-900">{languages.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Active:</span>
                <span className="font-semibold text-green-600">{activeLanguages}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Inactive:</span>
                <span className="font-semibold text-red-600">{inactiveLanguages}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Filtered:</span>
                <span className="font-semibold text-blue-600">{filteredLanguages.length}</span>
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
        {filteredLanguages.length === 0 ? (
          <EmptyState
            title="No language found"
            description={
              searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Start by adding your first language'
            }
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
                    label: 'Add a language',
                    onClick: () => navigate('/languages/new'),
                  }
            }
          />
        ) : (
          <Table columns={columns} data={filteredLanguages} keyExtractor={(language) => language.id} />
        )}
      </Card>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, language: null })}
        onConfirm={handleDelete}
        title="Delete Language"
        message={`Are you sure you want to delete "${deleteModal.language?.name}"? This action is irreversible.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}
