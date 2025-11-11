import React from 'react'
import { Link } from 'react-router-dom'

interface PageHeaderProps {
  title: string
  icon?: string
  actions?: React.ReactNode
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, icon, actions }) => {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {icon && <span className="text-3xl">{icon}</span>}
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      </div>
      {actions && <div className="flex items-center space-x-3">{actions}</div>}
    </div>
  )
}

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger'
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
}

export function Button({ variant = 'primary', children, onClick, type = 'button', disabled = false, className = '' }: ButtonProps) {
  const variants = {
    primary: 'bg-[#97051D] hover:bg-[#7a0418] text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-700',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

interface LinkButtonProps {
  to: string
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'view' | 'edit'
  children: React.ReactNode
  className?: string
}

export function LinkButton({ to, variant = 'primary', children, className = '' }: LinkButtonProps) {
  const variants = {
    primary: 'bg-[#97051D] hover:bg-[#7a0418] text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-700',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    view: 'bg-[#97051D] hover:bg-[#7a0418] text-white',
    edit: 'bg-gray-500 hover:bg-gray-600 text-white',
  }

  return (
    <Link
      to={to}
      className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-150 active:scale-95 ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  )
}
