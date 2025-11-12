import React, { useMemo } from 'react'
import { TableColumn } from '../types'

interface TableProps<T = any> {
  columns: TableColumn<T>[]
  data: T[]
  keyExtractor: (item: T) => string
  onRowClick?: (item: T) => void
  emptyMessage?: string
}

export default function Table<T = any>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No donnée disponible',
}: TableProps<T>) {
  // Mémoiser le rendu des headers
  const headerRow = useMemo(() => (
    <tr>
      {columns.map((column) => (
        <th
          key={column.key}
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
        >
          {column.label}
        </th>
      ))}
    </tr>
  ), [columns])

  // Mémoiser le rendu des lignes de données
  const dataRows = useMemo(() => {
    return data.map((row) => (
      <tr
        key={keyExtractor(row)}
        onClick={() => onRowClick?.(row)}
        className={`
          ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
          transition-colors duration-150
        `}
      >
        {columns.map((column) => (
          <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {column.render
              ? column.render((row as any)[column.key], row)
              : (row as any)[column.key]}
          </td>
        ))}
      </tr>
    ))
  }, [data, columns, keyExtractor, onRowClick])

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p className="mt-2 text-sm text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {headerRow}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {dataRows}
        </tbody>
      </table>
    </div>
  )
}

// Legacy components for backward compatibility with old pages
interface TableRowProps {
  children: React.ReactNode
  className?: string
}

export function TableRow({ children, className = '' }: TableRowProps) {
  return <tr className={className}>{children}</tr>
}

interface TableCellProps {
  children?: React.ReactNode
  header?: boolean
  className?: string
}

export function TableCell({ children, header = false, className = '' }: TableCellProps) {
  const baseClass = header 
    ? 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50'
    : 'px-6 py-4 text-sm text-gray-900'

  if (header) {
    return <th className={`${baseClass} ${className}`}>{children}</th>
  }
  return <td className={`${baseClass} ${className}`}>{children}</td>
}
