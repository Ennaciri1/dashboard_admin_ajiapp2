import React from 'react'

interface EntityStatsProps {
  total: number
  active: number
  inactive: number
  filtered?: number
}

/**
 * Composant réutilisable pour afficher les statistiques des entités
 * Élimine la duplication de code pour les stats
 */
export default function EntityStats({ total, active, inactive, filtered }: EntityStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">Total</p>
        <p className="text-2xl font-bold text-gray-900">{total}</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <p className="text-sm text-green-600">Active</p>
        <p className="text-2xl font-bold text-green-700">{active}</p>
      </div>
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <p className="text-sm text-red-600">Inactive</p>
        <p className="text-2xl font-bold text-red-700">{inactive}</p>
      </div>
      {filtered !== undefined && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600">Filtered</p>
          <p className="text-2xl font-bold text-blue-700">{filtered}</p>
        </div>
      )}
    </div>
  )
}

