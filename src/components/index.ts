/**
 * Barrel export pour tous les composants
 * Simplifie les imports : import { Button, Card, Table } from '@/components'
 */

// Core UI Components
export { default as Button } from './Button'
export { default as Input } from './Input'
export { default as Select } from './Select'
export { default as Card, CardHeader } from './Card'
export { default as Table } from './Table'
export { default as Badge } from './Badge'
export { default as Alert } from './Alert'
export { default as Loading } from './Loading'
export { default as EmptyState } from './EmptyState'
export { ConfirmModal } from './Modal'
export { ActionMenu } from './ActionMenu'

// Specialized Components
export { default as MapPicker } from './MapPicker'
export { default as FormSection } from './FormSection'
export { default as FormActionsBar } from './FormActionsBar'
export { default as ErrorBoundary } from './ErrorBoundary'

// New Optimized Components
export { default as FilterBar } from './FilterBar'
export { default as BulkActionsBar } from './BulkActionsBar'
export { default as EntityStats } from './EntityStats'

// UI Components (already grouped)
export * from './UI'

