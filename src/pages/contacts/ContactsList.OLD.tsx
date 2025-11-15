import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminContacts, deleteContact, updateContact } from '../../api/contacts'
import { Contact, TableColumn } from '../../types'
import Card, { CardHeader } from '../../components/Card'
import Button from '../../components/Button'
import Table from '../../components/Table'
import Badge from '../../components/Badge'
import Loading from '../../components/Loading'
import EmptyState from '../../components/EmptyState'
import { ConfirmModal } from '../../components/Modal'
import Alert from '../../components/Alert'

export default function ContactsList() {
  const navigate = useNavigate()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; contact: Contact | null }>({
    isOpen: false,
    contact: null,
  })
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)

  // Filtrage
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedLang, setSelectedLang] = useState<'en' | 'fr' | 'ar'>('en')

  // Sélection multiple
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAdminContacts()
      setContacts(data)
    } catch (err: any) {
      setError(err.message || 'Error loading contacts')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.contact) return

    try {
      setDeleting(true)
      await deleteContact(deleteModal.contact.id)
      setContacts(contacts.filter((c) => c.id !== deleteModal.contact!.id))
      setDeleteModal({ isOpen: false, contact: null })
    } catch (err: any) {
      setError(err.message || 'Failed to delete contact')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleActive = async (contact: Contact) => {
    try {
      setToggling(contact.id)
      // Backend exige nameTranslations et link même pour une simple mise à jour de 'active'
      await updateContact(contact.id, { 
        nameTranslations: contact.nameTranslations,
        link: contact.link,
        icon: contact.icon,
        active: !contact.active 
      })
      setContacts(contacts.map((c) => (c.id === contact.id ? { ...c, active: !c.active } : c)))
    } catch (err: any) {
      console.error('Toggle contact error:', err)
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update contact status'
      setError(errorMsg)
    } finally {
      setToggling(null)
    }
  }

  // Filtrage
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesSearch =
        searchTerm === '' ||
        contact.nameTranslations.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.nameTranslations.fr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.nameTranslations.ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && contact.active) ||
        (statusFilter === 'inactive' && !contact.active)

      const matchesType = typeFilter === 'all' || contact.contactType === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [contacts, searchTerm, statusFilter, typeFilter])

  // Extraction des types uniques
  const uniqueTypes = useMemo(() => {
    const types = new Set(contacts.map((c) => c.contactType).filter(Boolean))
    return Array.from(types)
  }, [contacts])

  // Statistiques
  const activeContacts = contacts.filter((c) => c.active).length
  const inactiveContacts = contacts.length - activeContacts

  // Sélection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredContacts.map((c) => c.id))
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
          const contact = contacts.find((c) => c.id === id)
          if (contact && !contact.active) {
            try {
              // Backend exige nameTranslations et link même pour mise à jour de active
              await updateContact(id, { 
                nameTranslations: contact.nameTranslations,
                link: contact.link,
                icon: contact.icon,
                active: true 
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
      setContacts(
        contacts.map((c) => (successIds.includes(c.id) ? { ...c, active: true } : c))
      )
      setSelectedIds([])

      if (failed.length > 0) {
        setError(`${succeeded.length} contact(s) activated, ${failed.length} failed. Check that contacts have all required translations.`)
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
              // Backend exige nameTranslations et link même pour mise à jour de active
              await updateContact(id, { 
                nameTranslations: contact.nameTranslations,
                link: contact.link,
                icon: contact.icon,
                active: false 
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
      setContacts(
        contacts.map((c) => (successIds.includes(c.id) ? { ...c, active: false } : c))
      )
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

  const columns: TableColumn<Contact>[] = [
    {
      key: 'select',
      label: (
        <input
          type="checkbox"
          checked={selectedIds.length === filteredContacts.length && filteredContacts.length > 0}
          onChange={(e) => handleSelectAll(e.target.checked)}
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
          <div className="text-sm text-gray-500">{contact.email}</div>
        </div>
      ),
    },
    {
      key: 'phoneNumber',
      label: 'Phone',
      render: (value) => <div className="text-sm text-gray-600">{value || '-'}</div>,
    },
    {
      key: 'contactType',
      label: 'Type',
      render: (value) => (
        <Badge variant="info">{value}</Badge>
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
              setDeleteModal({ isOpen: true, contact })
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

      {/* PREMIER CONTAINER : Header + Filtres */}
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

        {/* Section Filtres */}
        <div className="px-6 pb-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            {/* Filtres */}
            <div className="flex flex-wrap gap-4 items-center mb-4">
              <div className="flex-1 min-w-[250px]">
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#97051D] focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                />
              </div>
              <div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-[#97051D] focus:border-transparent text-gray-900 min-w-[180px]"
                >
                  <option value="all">All Types ({uniqueTypes.length})</option>
                  {uniqueTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
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
                <span className="text-gray-600">Total Contacts:</span>
                <span className="font-semibold text-gray-900">{contacts.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Active:</span>
                <span className="font-semibold text-green-600">{activeContacts}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Inactive:</span>
                <span className="font-semibold text-red-600">{inactiveContacts}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Filtered:</span>
                <span className="font-semibold text-blue-600">{filteredContacts.length}</span>
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
        {filteredContacts.length === 0 ? (
          <EmptyState
            title="No contact found"
            description={
              searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Start by adding your first contact'
            }
            action={
              searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
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
        onClose={() => setDeleteModal({ isOpen: false, contact: null })}
        onConfirm={handleDelete}
        title="Delete Contact"
        message={`Are you sure you want to delete "${deleteModal.contact?.nameTranslations.en}"? This action is irreversible.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}
