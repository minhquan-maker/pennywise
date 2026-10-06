import { useState, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Input } from './Input'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: ReactNode
  confirmLabel?: string
  /** If set, the user must type this exact text to enable the confirm button. */
  requireText?: string
  isLoading?: boolean
  tone?: 'danger' | 'primary'
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  requireText,
  isLoading,
  tone = 'danger',
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState('')
  const close = () => {
    setTyped('')
    onClose()
  }
  const blocked = requireText !== undefined && typed.trim() !== requireText

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      size="sm"
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={close}>
            Cancel
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            className="flex-1"
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={blocked}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center pt-4 text-center">
        <span className={tone === 'danger' ? 'mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger-500/12 text-danger-400' : 'mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-500/12 text-primary-400'}>
          <AlertTriangle className="h-6 w-6" />
        </span>
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <div className="mt-2 text-sm leading-relaxed text-text-secondary">{description}</div>
        {requireText !== undefined && (
          <div className="mt-5 w-full text-left">
            <Input
              label={`Type "${requireText}" to confirm`}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={requireText}
              autoComplete="off"
            />
          </div>
        )}
      </div>
    </Modal>
  )
}
