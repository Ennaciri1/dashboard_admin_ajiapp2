import { useState } from 'react'

/**
 * Hook générique pour gérer les modales de confirmation
 * Élimine la duplication de code pour les delete modals
 */
export function useConfirmModal<T>() {
  const [modal, setModal] = useState<{ isOpen: boolean; item: T | null }>({
    isOpen: false,
    item: null,
  })

  const openModal = (item: T) => {
    setModal({ isOpen: true, item })
  }

  const closeModal = () => {
    setModal({ isOpen: false, item: null })
  }

  return {
    modal,
    openModal,
    closeModal,
  }
}

