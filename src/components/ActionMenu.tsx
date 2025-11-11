import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { EditIcon } from '../assets/icons'

interface ActionMenuProps {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  viewLink?: string
  editLink?: string
  deleteDisabled?: boolean
}

export function ActionMenu({ onView, onEdit, onDelete, viewLink, editLink, deleteDisabled }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      
      // Calculate position
      if (spaceBelow < 180) {
        // Open upward
        setMenuPosition({
          top: rect.top - 180, // Approximate menu height
          right: window.innerWidth - rect.right
        })
      } else {
        // Open downward
        setMenuPosition({
          top: rect.bottom + 4,
          right: window.innerWidth - rect.right
        })
      }
    }
    setIsOpen(!isOpen)
  }

  return (
    <>
      <div className="relative inline-block">
        <button
          ref={buttonRef}
          onClick={handleToggle}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all inline-flex items-center justify-center"
          title="Actions"
        >
          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>
      </div>

      {isOpen && menuPosition && (
        <div 
          ref={dropdownRef}
          className="fixed w-40 bg-white rounded-lg border border-gray-200 shadow-lg z-[100] animate-scaleIn"
          style={{ top: `${menuPosition.top}px`, right: `${menuPosition.right}px` }}
        >
          {viewLink && (
            <Link
              to={viewLink}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
              onClick={() => setIsOpen(false)}
            >
              👁️ View
            </Link>
          )}
          {onView && (
            <button
              onClick={() => {
                onView()
                setIsOpen(false)
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
            >
              👁️ View
            </button>
          )}
          {editLink && (
            <Link
              to={editLink}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <EditIcon className="w-4 h-4" />
              Edit
            </Link>
          )}
          {onEdit && (
            <button
              onClick={() => {
                onEdit()
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <EditIcon className="w-4 h-4" />
              Edit
            </button>
          )}

          {onDelete && !deleteDisabled && (
            <button
              onClick={() => {
                onDelete()
                setIsOpen(false)
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 last:rounded-b-lg border-t border-gray-100"
            >
              🗑️ Delete
            </button>
          )}
        </div>
      )}
    </>
  )
}
