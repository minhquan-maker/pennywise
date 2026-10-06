import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = { sm: 'sm:max-w-sm', md: 'sm:max-w-md', lg: 'sm:max-w-lg', xl: 'sm:max-w-2xl' }

/** Bottom sheet on phones, centered dialog from `sm` up. Esc / backdrop close; focus is restored on close. */
export function Modal({ isOpen, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Focus the first field, else the panel
    requestAnimationFrame(() => {
      const first = panelRef.current?.querySelector<HTMLElement>('[data-autofocus], input:not([type=hidden]), textarea')
      ;(first ?? panelRef.current)?.focus({ preventScroll: true })
    })
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      previouslyFocused?.focus?.({ preventScroll: true })
    }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby={title ? titleId : undefined}>
      <div className="animate-fade-in fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[92dvh] w-full flex-col overflow-hidden border border-line-strong/70 bg-surface outline-none',
          'animate-sheet-in rounded-t-[var(--radius-3xl)] sm:animate-scale-in sm:rounded-[var(--radius-3xl)]',
          'shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]',
          sizeClasses[size]
        )}
      >
        <div className="mx-auto mt-2.5 h-1 w-10 flex-shrink-0 rounded-full bg-line-strong sm:hidden" />
        {title && (
          <div className="flex flex-shrink-0 items-start justify-between gap-4 px-6 pb-2 pt-4 sm:pt-6">
            <div>
              <h2 id={titleId} className="text-lg font-semibold text-text-primary">
                {title}
              </h2>
              {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="-mr-2 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-text-tertiary transition-colors hover:bg-surface-3 hover:text-text-primary"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {footer && (
          <div className="flex-shrink-0 border-t border-line px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</div>
        )}
      </div>
    </div>,
    document.body
  )
}
