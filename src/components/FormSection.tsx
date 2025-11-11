import React from 'react'

type Props = {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export default function FormSection({ title, description, children, className }: Props) {
  return (
    <section className={`bg-white rounded-lg shadow p-5 border border-gray-100 ${className ?? ''}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}
