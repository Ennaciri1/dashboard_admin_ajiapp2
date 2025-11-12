import React, { forwardRef } from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  fullWidth?: boolean
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, fullWidth = true, className = '', rows = 4, ...props }, ref) => {
    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
            {props.required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={`
            block w-full rounded-lg border border-gray-300 bg-white
            px-4 py-2.5 text-gray-900 placeholder-gray-400
            focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            transition-colors duration-200 resize-vertical
            ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}
            ${className}
          `}
          {...props}
        />
        {hint && !error && <p className="mt-1.5 text-sm text-gray-500">{hint}</p>}
        {error && <p className="mt-1.5 text-sm text-danger-600">{error}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export default Textarea

