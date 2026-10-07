import { forwardRef, useId, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fieldClass } from './Input'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className, label, error, id, children, ...props }, ref) => {
  const autoId = useId()
  const selectId = id || autoId
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-[13px] font-semibold text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        <select ref={ref} id={selectId} className={cn(fieldClass, 'cursor-pointer appearance-none pr-10', className)} {...props}>
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
      </div>
      {error && <p className="text-xs text-danger-400">{error}</p>}
    </div>
  )
})
Select.displayName = 'Select'
