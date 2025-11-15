import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminContacts, deleteContact, updateContact } from '../../api/contacts'
import { Contact, TableColumn } from '../../types'
import { 
  Card, CardHeader, Button, Table, Badge, Loading, EmptyState, 
  ConfirmModal, Alert, FilterBar, BulkActionsBar, EntityStats 
} from '../../components'
import { 
  useEntityList, useEntityFilters, useEntitySelection, useConfirmModal 
} from '../../hooks'

export default function ContactsList() {
  const navigate = useNavigate()

  const {
    items: contacts,
    setItems: setContacts,
    loading,
    error,
    setError,
    deleting,
    setDeleting,
    toggling,
    setToggling,
    updateItem,
    removeItem,
  } = useEntityList<Contact>(getAdminContacts)

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
  } = useEntitySelection<Contact>()

  const {
    modal: deleteModal,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useConfirmModal<Contact>()

  // Filtre spécifique: typeFilter
  const [typeFilter, setTypeFilter] = React.useState<string>('all')

  const handleDelete = async () => {
    if (!deleteModal.item) return

    try {
      setDeleting(true)
      await deleteContact(deleteModal.item.id)
      removeItem(deleteModal.item.id)
      closeDeleteModal()
    } catch (err: any) {
      setError(err.message || 'Failed to delete contact')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleActive = async (contact: Contact) => {
    try {
      setToggling(contact.id)
      await updateContact(contact.id, { 
        nameTranslations: contact.nameTranslations,
        link: contact.link,
        icon: contact.icon || '',  // Chaîne vide si null/undefined
        active: !contact.active,
      })
      updateItem(contact.id, { active: !contact.active })
    } catch (err: any) {
      console.error('Toggle contact error:', err)
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update contact status'
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
          const contact = contacts.find((c) => c.id === id)
          if (contact && !contact.active) {
            try {
              await updateContact(id, { 
                nameTranslations: contact.nameTranslations,
                link: contact.link,
                icon: contact.icon || '',  // Chaîne vide si null/undefined
                active: true,
              })
              return { id, success: true }
            } catch (err: any) {
              console.error(`Failed to activate contact ${id}:`, err.response?.data?.message || err.message)
              return { id, success: false, error: err.response?.data?.message || err.message }
            }
          }
          return { id, success: true, skipped: true }
        })
      )

      const succeeded = results.filter((r) => r.status === 'fulfilled' && r.value.success && !r.value.skipped)
      const failed = results.filter((r) => r.status === 'fulfilled' && !r.value.success)

      const successIds = succeeded.map((r: any) => r.value.id)
      setContacts(contacts.map((c) => (successIds.includes(c.id) ? { ...c, active: true } : c)))
      setSelectedIds([])

      if (failed.length > 0) {
        setError(`${succeeded.length} contact(s) activated, ${failed.length} failed.`)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to activate contacts')
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
          const contact = contacts.find((c) => c.id === id)
          if (contact && contact.active) {
            try {
              await updateContact(id, { 
                nameTranslations: contact.nameTranslations,
                link: contact.link,
                icon: contact.icon || '',  // Chaîne vide si null/undefined
                active: false,
              })
              return { id, success: true }
            } catch (err: any) {
              console.error(`Failed to deactivate contact ${id}:`, err.response?.data?.message || err.message)
              return { id, success: false, error: err.response?.data?.message || err.message }
            }
          }
          return { id, success: true, skipped: true }
        })
      )

      const succeeded = results.filter((r) => r.status === 'fulfilled' && r.value.success && !r.value.skipped)
      const failed = results.filter((r) => r.status === 'fulfilled' && !r.value.success)

      const successIds = succeeded.map((r: any) => r.value.id)
      setContacts(contacts.map((c) => (successIds.includes(c.id) ? { ...c, active: false } : c)))
      setSelectedIds([])

      if (failed.length > 0) {
        setError(`${succeeded.length} contact(s) deactivated, ${failed.length} failed.`)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to deactivate contacts')
    } finally {
      setBulkActionLoading(false)
    }
  }

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesSearch =
        searchTerm === '' ||
        contact.nameTranslations.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.nameTranslations.fr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.nameTranslations.ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.link?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && contact.active) ||
        (statusFilter === 'inactive' && !contact.active)

      const matchesType = typeFilter === 'all' || contact.contactType === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [contacts, searchTerm, statusFilter, typeFilter])

  const activeContacts = contacts.filter((c) => c.active).length
  const inactiveContacts = contacts.length - activeContacts
  const uniqueTypes = Array.from(new Set(contacts.map((c) => c.contactType).filter(Boolean)))

  const columns: TableColumn<Contact>[] = [
    {
      key: 'select',
      label: (
        <input
          type="checkbox"
          checked={selectedIds.length === filteredContacts.length && filteredContacts.length > 0}
          onChange={(e) => handleSelectAll(e.target.checked, filteredContacts)}
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
      ),
      render: (_, contact) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(contact.id)}
          onChange={(e) => handleSelectOne(contact.id, e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
      ),
    },
    {
      key: 'nameTranslations',
      label: 'Name',
      render: (_, contact) => (
        <div>
          <div className="font-medium text-gray-900">
            {contact.nameTranslations[selectedLang] || contact.nameTranslations.en || contact.nameTranslations.fr || contact.nameTranslations.ar}
          </div>
          {selectedLang === 'en' && (
            <div className="text-sm text-gray-500">
              {contact.nameTranslations.ar && <span className="mr-2">AR: {contact.nameTranslations.ar}</span>}
              {contact.nameTranslations.fr && <span>FR: {contact.nameTranslations.fr}</span>}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'link',
      label: 'Link',
      render: (value) => (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 hover:text-primary-700 underline"
          onClick={(e) => e.stopPropagation()}
        >
          {value}
        </a>
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
      render: (_, contact) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={contact.active ? 'warning' : 'success'}
            onClick={(e) => {
              e.stopPropagation()
              handleToggleActive(contact)
            }}
            loading={toggling === contact.id}
          >
            {contact.active ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/contacts/${contact.id}/view`)
            }}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/contacts/${contact.id}/edit`)
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation()
              openDeleteModal(contact)
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
          <Loading text="Loading contacts..." />
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
          title="Contacts Management"
          subtitle={`${contacts.length} contact(s) total`}
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
                onClick={() => navigate('/contacts/new')}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                New Contact
              </Button>
            </div>
          }
        />

        <div className="px-6 pb-6">
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search contacts..."
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          >
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-[#97051D] focus:border-transparent text-gray-900 min-w-[180px]"
                >
              <option value="all">All Types</option>
                  {uniqueTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
          </FilterBar>

          <div className="mt-4">
            <EntityStats
              total={contacts.length}
              active={activeContacts}
              inactive={inactiveContacts}
              filtered={filteredContacts.length}
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
        {filteredContacts.length === 0 ? (
          <EmptyState
            title="No contact found"
            description={searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Start by adding your first contact'}
            action={
              searchTerm || statusFilter !== 'all'
                ? {
                    label: 'Clear Filters',
                    onClick: () => {
                      setSearchTerm('')
                      setStatusFilter('all')
                      setTypeFilter('all')
                    },
                  }
                : {
                    label: 'Add a contact',
                    onClick: () => navigate('/contacts/new'),
                  }
            }
          />
        ) : (
          <Table columns={columns} data={filteredContacts} keyExtractor={(contact) => contact.id} />
        )}
      </Card>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Delete Contact"
        message={`Are you sure you want to delete "${deleteModal.item?.nameTranslations.en}"? This action is irreversible.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}
