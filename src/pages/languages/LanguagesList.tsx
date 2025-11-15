import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSupportedLanguages, deleteSupportedLanguage, updateSupportedLanguage } from '../../api/languages'
import { SupportedLanguage, TableColumn } from '../../types'
import { 
  Card, CardHeader, Button, Table, Badge, Loading, EmptyState, 
  ConfirmModal, Alert, FilterBar, BulkActionsBar, EntityStats 
} from '../../components'
import { 
  useEntityList, useEntityFilters, useEntitySelection, useConfirmModal 
} from '../../hooks'

export default function LanguagesList() {
  const navigate = useNavigate()

  const {
    items: languages,
    setItems: setLanguages,
    loading,
    error,
    setError,
    deleting,
    setDeleting,
    toggling,
    setToggling,
    updateItem,
    removeItem,
  } = useEntityList<SupportedLanguage>(() => getSupportedLanguages(undefined))

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
  } = useEntityFilters()

  const {
    selectedIds,
    setSelectedIds,
    bulkActionLoading,
    setBulkActionLoading,
    handleSelectAll,
    handleSelectOne,
  } = useEntitySelection<SupportedLanguage>()

  const {
    modal: deleteModal,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useConfirmModal<SupportedLanguage>()

  const handleDelete = async () => {
    if (!deleteModal.item) return

    try {
      setDeleting(true)
      await deleteSupportedLanguage(deleteModal.item.id)
      removeItem(deleteModal.item.id)
      closeDeleteModal()
    } catch (err: any) {
      setError(err.message || 'Failed to delete language')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleActive = async (language: SupportedLanguage) => {
    try {
      setToggling(language.id)
      await updateSupportedLanguage(language.id, { 
        code: language.code, 
        name: language.name,
        active: !language.active,
      })
      updateItem(language.id, { active: !language.active })
    } catch (err: any) {
      console.error('Toggle language error:', err)
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update language status'
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
          const language = languages.find((l) => l.id === id)
          if (language && !language.active) {
            try {
              await updateSupportedLanguage(id, { 
                code: language.code, 
                name: language.name, 
                active: true,
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
      setLanguages(languages.map((l) => (successIds.includes(l.id) ? { ...l, active: true } : l)))
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
              await updateSupportedLanguage(id, { 
                code: language.code, 
                name: language.name, 
                active: false,
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
      setLanguages(languages.map((l) => (successIds.includes(l.id) ? { ...l, active: false } : l)))
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

  const filteredLanguages = useMemo(() => {
    return languages.filter((language) => {
      const matchesSearch =
        searchTerm === '' ||
        language.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        language.name?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && language.active) ||
        (statusFilter === 'inactive' && !language.active)

      return matchesSearch && matchesStatus
    })
  }, [languages, searchTerm, statusFilter])

  const activeLanguages = languages.filter((l) => l.active).length
  const inactiveLanguages = languages.length - activeLanguages

  const columns: TableColumn<SupportedLanguage>[] = [
    {
      key: 'select',
      label: (
        <input
          type="checkbox"
          checked={selectedIds.length === filteredLanguages.length && filteredLanguages.length > 0}
          onChange={(e) => handleSelectAll(e.target.checked, filteredLanguages)}
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
      key: 'code',
      label: 'Code',
      render: (value) => <Badge variant="primary">{value}</Badge>,
    },
    {
      key: 'name',
      label: 'Name',
      render: (value) => <span className="font-medium text-gray-900">{value}</span>,
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
              openDeleteModal(language)
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

      <Card>
        <CardHeader
          title="Supported Languages"
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

        <div className="px-6 pb-6">
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search languages..."
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />

          <div className="mt-4">
            <EntityStats
              total={languages.length}
              active={activeLanguages}
              inactive={inactiveLanguages}
              filtered={filteredLanguages.length}
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
        {filteredLanguages.length === 0 ? (
          <EmptyState
            title="No language found"
            description={searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Start by adding your first language'}
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
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Delete Language"
        message={`Are you sure you want to delete "${deleteModal.item?.name}" (${deleteModal.item?.code})? This action is irreversible.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}
