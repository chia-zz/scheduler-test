import { useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  // Esc to close
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Lock the page behind the modal so the background can't scroll or jump.
  // Uses position:fixed to freeze scroll position, and pads for the missing
  // scrollbar so desktop layout doesn't shift sideways when it opens.
  useEffect(() => {
    if (!open) return
    const body = document.body
    const scrollY = window.scrollY
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      paddingRight: body.style.paddingRight,
    }
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`
    return () => {
      Object.assign(body.style, prev)
      window.scrollTo(0, scrollY)
    }
  }, [open])

  if (!open) return null
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(50,65,76,0.35)] p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className={`card w-full ${maxWidth} animate-fade-up flex max-h-[92vh] flex-col rounded-b-none sm:rounded-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-line sm:hidden" />
        <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4">
          <h3 className="font-display text-lg font-semibold text-main">{title}</h3>
          <button className="btn-icon" onClick={onClose} aria-label="關閉">
            <IconX />
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
