import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { User, Download, AlertTriangle, Trash2, Eraser } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth.store'
import { authService, clearService } from '@/lib/services'

export function SettingsPage() {
  const { user, updateUser, logout } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [name, setName] = useState(user?.name || '')
  const [currency, setCurrency] = useState(user?.currency || 'USD')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [clearOpen, setClearOpen] = useState(false)
  const [clearConfirm, setClearConfirm] = useState('')

  const updateMe = useMutation({
    mutationFn: (data: { name?: string; currency?: string }) => authService.updateMe(data),
    onSuccess: (data) => {
      updateUser(data.data!.user)
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Settings saved')
    },
    onError: () => toast.error('Failed to save settings'),
  })

  const deleteMe = useMutation({
    mutationFn: () => authService.deleteMe(),
    onSuccess: () => {
      logout()
      navigate('/register')
    },
    onError: () => toast.error('Failed to delete account'),
  })

  const clearAllData = useMutation({
    mutationFn: async () => {
      await clearService.clearAllTransactions()
      await clearService.clearAllBudgets()
    },
    onSuccess: () => {
      qc.invalidateQueries()
      setClearOpen(false)
      setClearConfirm('')
      toast.success('All data cleared successfully')
    },
    onError: () => toast.error('Failed to clear data'),
  })

  const handleSave = () => {
    updateMe.mutate({ name, currency })
  }

  const handleExportCSV = () => {
    window.open('/api/export/csv', '_blank')
  }

  const handleDeleteAccount = () => {
    if (confirmText !== user?.email) return
    deleteMe.mutate()
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-stagger">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-extrabold text-text-primary">Settings</h1>
        <p className="text-base text-text-secondary mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile section */}
      <Card variant="bordered" padding="lg">
        <Card.Header>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary-500" />
            <h2 className="text-lg font-bold text-text-primary">Profile</h2>
          </div>
        </Card.Header>
        <div className="space-y-4">
          <Input
            label="Display Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            variant="filled"
            placeholder="Your name"
          />
          <p className="text-sm text-text-secondary">{user?.email || ''}</p>
          <Select
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            variant="filled"
          >
            <option value="USD">USD ($)</option>
            <option value="VND">VND (₫)</option>
          </Select>
          <Button onClick={handleSave} isLoading={updateMe.isPending} variant="primary">
            Save Changes
          </Button>
        </div>
      </Card>

      {/* Data Export section */}
      <Card variant="bordered" padding="md">
        <Card.Header>
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-primary-500" />
            <h2 className="text-base font-bold text-text-primary">Export Data</h2>
          </div>
        </Card.Header>
        <p className="text-sm text-text-secondary mb-3">Download your transaction history</p>
        <Button variant="outline" onClick={handleExportCSV} icon={<Download className="h-4 w-4" />}>
          Export as CSV
        </Button>
      </Card>

      {/* Clear All Data section */}
      <Card variant="bordered" padding="lg">
        <Card.Header>
          <div className="flex items-center gap-2">
            <Eraser className="h-4 w-4 text-warning-500" />
            <h2 className="text-base font-bold text-text-primary">Clear All Data</h2>
          </div>
        </Card.Header>
        <p className="text-sm text-text-secondary mb-4">
          Remove all transactions and budgets. Your account stays active — you can start fresh.
        </p>
        <Button variant="outline" onClick={() => setClearOpen(true)} icon={<Eraser className="h-4 w-4" />}>
          Clear All Data
        </Button>
      </Card>

      {/* Danger Zone section */}
      <Card
        variant="bordered"
        padding="lg"
        className="border-danger-200"
      >
        <Card.Header>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-danger-500" />
            <h2 className="text-base font-bold text-text-primary">Danger Zone</h2>
            <Badge variant="solid" color="#dc2626" label="Danger Zone" size="sm" />
          </div>
        </Card.Header>
        <p className="text-sm text-text-secondary mb-4">
          Permanently delete your account and all data. This action cannot be undone.
        </p>
        <Button variant="danger" onClick={() => setDeleteOpen(true)} icon={<Trash2 className="h-4 w-4" />}>
          Delete Account
        </Button>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteOpen}
        onClose={() => { setDeleteOpen(false); setConfirmText('') }}
        title={
          <span className="flex items-center gap-2 text-danger-600">
            <AlertTriangle className="h-4 w-4" />
            Delete Account
          </span>
        }
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            This will permanently delete your account and all transactions, budgets, and categories.
            <strong> This action cannot be undone.</strong>
          </p>
          <p className="text-sm text-text-secondary">
            Type <strong>{user?.email}</strong> to confirm:
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={user?.email}
            variant="filled"
          />
          <Button
            variant="danger"
            onClick={handleDeleteAccount}
            isLoading={deleteMe.isPending}
            className="w-full"
            icon={<Trash2 className="h-4 w-4" />}
            disabled={confirmText !== user?.email}
          >
            Delete My Account
          </Button>
        </div>
      </Modal>

      {/* Clear All Data Modal */}
      <Modal
        isOpen={clearOpen}
        onClose={() => { setClearOpen(false); setClearConfirm('') }}
        title={
          <span className="flex items-center gap-2 text-warning-600">
            <Eraser className="h-4 w-4" />
            Clear All Data
          </span>
        }
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            This will permanently delete all your transactions and budgets.
            <strong> Your account will not be affected.</strong>
            <br />
            This action cannot be undone.
          </p>
          <p className="text-sm text-text-secondary">
            Type <strong>clear</strong> to confirm:
          </p>
          <Input
            value={clearConfirm}
            onChange={(e) => setClearConfirm(e.target.value)}
            placeholder="clear"
            variant="filled"
          />
          <Button
            variant="danger"
            onClick={() => clearAllData.mutate()}
            isLoading={clearAllData.isPending}
            className="w-full"
            disabled={clearConfirm !== 'clear'}
          >
            Clear All Data
          </Button>
        </div>
      </Modal>
    </div>
  )
}
