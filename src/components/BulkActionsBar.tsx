import React from 'react'
import Button from './Button'

interface BulkActionsBarProps {
  selectedCount: number
  onActivateAll: () => void
  onDeactivateAll: () => void
  onClearSelection: () => void
  loading?: boolean
}

/**
 * Composant réutilisable pour les actions en masse
 * Élimine la duplication de code pour les bulk actions UI
 */
export default function BulkActionsBar({
  selectedCount,
  onActivateAll,
  onDeactivateAll,
  onClearSelection,
  loading = false,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <p className="text-blue-700 font-medium">
          {selectedCount} item(s) selected
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="success"
            onClick={onActivateAll}
            loading={loading}
          >
            Activate All
          </Button>
          <Button
            size="sm"
            variant="warning"
            onClick={onDeactivateAll}
            loading={loading}
          >
            Deactivate All
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearSelection}
          >
            Clear Selection
          </Button>
        </div>
      </div>
    </div>
  )
}

