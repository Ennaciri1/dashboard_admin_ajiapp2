import React from 'react'

type Props = {
  children?: React.ReactNode
  align?: 'left' | 'right' | 'between'
  className?: string
}

export default function FormActionsBar({ children, align='right', className }: Props){
  const justify = align === 'right' ? 'justify-end' : align === 'left' ? 'justify-start' : 'justify-between'
  return (
    <div className={`sticky bottom-0 bg-white/90 backdrop-blur border-t border-gray-200 mt-8 py-4 px-6 flex ${justify} gap-3 shadow-sm ${className ?? ''}`}>
      {children}
    </div>
  )
}
