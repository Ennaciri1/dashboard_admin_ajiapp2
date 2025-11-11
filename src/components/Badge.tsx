import React from 'react'

interface BadgeProps {
  variant: 'success' | 'danger' | 'warning' | 'info' | 'gray'
  children: React.ReactNode
}

export function Badge({ variant, children }: BadgeProps) {
  const variants = {
    success: 'bg-green-100 text-green-800 border-green-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    gray: 'bg-slate-100 text-slate-800 border-slate-200',
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150 ${variants[variant]}`}>
      {children}
    </span>
  )
}
