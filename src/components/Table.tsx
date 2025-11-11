import React from 'react'

interface TableProps {
  children: React.ReactNode
}

export function Table({ children }: TableProps) {
  return (
    <div className="overflow-x-auto overflow-y-visible bg-white rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">{children}</table>
    </div>
  )
}

interface TableRowProps {
  children: React.ReactNode
  className?: string
}

export function TableRow({ children, className = '' }: TableRowProps) {
  return (
    <tr className={`hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-0 ${className}`}>
      {children}
    </tr>
  )
}

interface TableCellProps {
  children: React.ReactNode
  header?: boolean
  className?: string
}

export function TableCell({ children, header = false, className = '' }: TableCellProps) {
  const Tag = header ? 'th' : 'td'
  const baseStyles = header
    ? 'px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50'
    : 'px-6 py-4 text-sm text-gray-900'

  return <Tag className={`${baseStyles} ${className}`}>{children}</Tag>
}
