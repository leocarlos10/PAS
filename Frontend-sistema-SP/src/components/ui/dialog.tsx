

import { useEffect, useState } from "react"

type DialogProps = {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export const Dialog = ({ isOpen, onClose, children }: DialogProps) => {
  const [isRendered, setIsRendered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true)
      setIsVisible(false)
      const frame = requestAnimationFrame(() => setIsVisible(true))
      return () => cancelAnimationFrame(frame)
    }

    setIsVisible(false)
    const timeout = setTimeout(() => setIsRendered(false), 200)
    return () => clearTimeout(timeout)
  }, [isOpen])

  if (!isRendered) return null

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Solo cierra si se da click directamente en el overlay, no en el contenido
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-[2px] transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleOverlayClick}
    >
      {/* Contenedor del dialog */}
      <div
        className={`relative max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg border border-border bg-card shadow-lg p-6 transition-all duration-200 ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón para cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded hover:bg-muted transition-colors"
          aria-label="Cerrar dialog"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Contenido del dialog */}
        <div className="pr-8">
          {children}
        </div>
      </div>
    </div>
  )
}
