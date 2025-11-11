import React from 'react'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export function Loading({ size = 'md', text }: LoadingProps) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className={`${sizes[size]} relative`}>
        <div className="absolute inset-0 rounded-full border-3 border-gray-200"></div>
        <div className="absolute inset-0 rounded-full border-3 border-[#97051D] border-t-transparent animate-spin"></div>
      </div>
      {text && <p className="mt-3 text-sm text-gray-600 animate-pulse">{text}</p>}
    </div>
  )
}

export function LoadingOverlay({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-[200] animate-fadeIn">
      <div className="bg-white rounded-lg p-6 shadow-xl animate-scaleIn">
        <Loading text={text} />
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="divide-y divide-gray-200">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 flex space-x-4">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded flex-1 animate-pulse"></div>
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4 flex space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div 
                key={colIndex} 
                className="h-4 bg-gray-100 rounded flex-1 animate-pulse"
                style={{ animationDelay: `${(rowIndex * columns + colIndex) * 0.05}s` }}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
