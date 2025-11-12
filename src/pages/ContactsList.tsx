import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminContacts, deleteContact } from '../api/contacts'
import { Contact, TableColumn } from '../types'
import Card, { CardHeader } from '../components/Card'
import Button from '../components/Button'
import Table from '../components/Table'
import Badge from '../components/Badge'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'
import { ConfirmModal } from '../components/Modal'
import Alert from '../components/Alert'

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
      setError(err.message || 'Error lors du chargement des contacts')
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
      setError(err.message || 'Error lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  const columns: TableColumn<Contact>[] = [
    {
      key: 'nameTranslations',
      label: 'Name',
      render: (_, contact) => (
          <div className="flex items-center gap-3">
          {contact.icon && (
            <img src={contact.icon} alt="" className="w-8 h-8 rounded-lg object-cover" />
          )}
          <div>
            <div className="font-medium text-gray-900">
              {contact.nameTranslations.en || contact.nameTranslations.fr || contact.nameTranslations.ar}
            </div>
            <div className="text-sm text-gray-500 truncate max-w-xs">{contact.link}</div>
          </div>
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
      label: 'Date de création',
      render: (value) => (value ? new Date(value).toLocaleDateString('fr-FR') : '-'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, contact) => (
        <div className="flex items-center gap-2">
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
          <Loading text="Chargement des contacts..." />
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
          title="Gestion des Contacts"
          subtitle={`${contacts.length} contact(s) au total`}
          action={
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
          }
        />

        {contacts.length === 0 ? (
          <EmptyState
            title="None contact"
            description="Commencez par ajouter votre premier contact"
            action={{
              label: 'Add un contact',
              onClick: () => navigate('/contacts/new'),
            }}
          />
          ) : (
          <Table columns={columns} data={contacts} keyExtractor={(contact) => contact.id} />
        )}
      </Card>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, contact: null })}
        onConfirm={handleDelete}
        title="Delete le contact"
        message={`Are you sure de vouloir supprimer le contact "${deleteModal.contact?.nameTranslations.en}" ? Cette action est irréversible.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}
