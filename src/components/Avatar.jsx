import { useEffect } from 'react'
import { IconX } from './Icons'

export function Avatar({ emoji, color, size = 40, ring = false }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size * 0.5,
        boxShadow: ring ? `0 0 0 2px var(--c-surface), 0 0 0 4px ${color}` : 'none',
      }}
    >
      {emoji}
    </span>
  )
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(50,65,76,0.35)] p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className={`card w-full ${maxWidth} animate-fade-up max-h-[90vh] overflow-y-auto rounded-b-none sm:rounded-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 className="font-display text-lg font-semibold text-main">{title}</h3>
          <button className="btn-icon" onClick={onClose} aria-label="關閉">
            <IconX />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
