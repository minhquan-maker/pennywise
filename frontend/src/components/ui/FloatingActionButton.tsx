import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FloatingActionButtonProps {
  onClick: () => void
  label?: string
}

export function FloatingActionButton({ onClick, label = 'Add Transaction' }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'fixed bottom-6 right-6 z-40',
        'w-14 h-14 rounded-full',
        'bg-gradient-to-br from-primary-500 to-primary-600',
        'text-white',
        'shadow-lg shadow-primary-500/30',
        'flex items-center justify-center',
        'transition-all duration-200',
        'hover:shadow-xl hover:shadow-primary-500/40 hover:scale-105',
        'active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2',
        'lg:bottom-8 lg:right-8'
      )}
    >
      <Plus className="h-6 w-6" strokeWidth={2.5} />
    </button>
  )
}
