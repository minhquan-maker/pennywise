import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { User, Download, AlertTriangle, Trash2, Eraser, Tag, Plus } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth.store'
import { authService, clearService } from '@/lib/services'
import { useCategories, useCreateCategory, useDeleteCategory } from '@/hooks/useQueries'
import { cn } from '@/lib/utils'

const PRESET_ICONS = ['🍔', '🚌', '🛍️', '🎬', '📄', '💊', '💰', '🏠', '✈️', '📱', '🎮', '☕', '🛒', '🏋️', '📚', '🎁']
const PRESET_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#06b6d4']

export function SettingsPage() {
  const { user, updateUser, logout } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: categories = [], isLoading: categoriesLoading } = useCategories()
  const createCategory = useCreateCategory()
  const deleteCategory = useDeleteCategory()

  const [name, setName] = useState(user?.name || '')
  const [currency, setCurrency] = useState(user?.currency || 'USD')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [clearOpen, setClearOpen] = useState(false)
  const [clearConfirm, setClearConfirm] = useState('')
  const [catModalOpen, setCatModalOpen] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatIcon, setNewCatIcon] = useState(PRESET_ICONS[0])
  const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0])

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

  const handleExportCSV = async () => {
    try {
      const blob = await clearService.exportCSV()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pennywise-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
      toast.success('CSV downloaded')
    } catch {
      toast.error('Failed to export CSV')
    }
  }

  const handleDeleteAccount = () => {
    if (confirmText !== user?.email) return
    deleteMe.mutate()
  }

  const handleCreateCategory = () => {
    if (!newCatName.trim()) {
      toast.error('Category name is required')
      return
    }
    createCategory.mutate(
      { name: newCatName.trim(), icon: newCatIcon, color: newCatColor },
      {
        onSuccess: () => {
          setCatModalOpen(false)
          setNewCatName('')
          setNewCatIcon(PRESET_ICONS[0])
          setNewCatColor(PRESET_COLORS[0])
        },
      }
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-stagger">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Settings</h1>
        <p className="text-base text-text-secondary mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile section */}
      <Card variant="dark" padding="lg">
        <Card.Header>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary-400" />
            <h2 className="text-lg font-bold text-white">Profile</h2>
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
          <Button onClick={handleSave} isLoading={updateMe.isPending} variant="gradient">
            Save Changes
          </Button>
        </div>
      </Card>

      {/* Categories section */}
      <Card variant="dark" padding="lg">
        <Card.Header>
          <div className="flex items-center justify-between w-full gap-3">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary-400" />
              <h2 className="text-lg font-bold text-white">Categories</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => setCatModalOpen(true)}
            >
              Add
            </Button>
          </div>
        </Card.Header>
        <p className="text-sm text-text-secondary mb-4">
          Organize your transactions with custom categories.
        </p>
        {categoriesLoading ? (
          <div className="text-sm text-text-tertiary">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 text-text-tertiary text-sm">
            No categories yet. Add one to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-[#262626] bg-neutral-800"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${cat.color}26` }}
                  >
                    <span className="text-sm">{cat.icon}</span>
                  </span>
                  <span className="text-sm text-white truncate">{cat.name}</span>
                  {cat.isDefault && (
                    <Badge label="Default" color="#737373" variant="soft" size="sm" />
                  )}
                </div>
                {!cat.isDefault && (
                  <Button
                    size="sm"
                    variant="ghost"
                    iconOnly
                    icon={<Trash2 className="h-3.5 w-3.5" />}
                    onClick={() => {
                      if (confirm(`Delete category "${cat.name}"?`)) {
                        deleteCategory.mutate(cat.id)
                      }
                    }}
                    className="!w-8 !h-8 !p-0 !text-text-tertiary hover:!text-danger-500 hover:!bg-neutral-700"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Data Export section */}
      <Card variant="dark" padding="md">
        <Card.Header>
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-primary-400" />
            <h2 className="text-base font-bold text-white">Export Data</h2>
          </div>
        </Card.Header>
        <p className="text-sm text-text-secondary mb-3">Download your transaction history</p>
        <Button variant="outline" onClick={handleExportCSV} icon={<Download className="h-4 w-4" />}>
          Export as CSV
        </Button>
      </Card>

      {/* Clear All Data section */}
      <Card variant="dark" padding="lg">
        <Card.Header>
          <div className="flex items-center gap-2">
            <Eraser className="h-4 w-4 text-warning-500" />
            <h2 className="text-base font-bold text-white">Clear All Data</h2>
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
        variant="dark"
        padding="lg"
        className="border-danger-700"
      >
        <Card.Header>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-danger-500" />
            <h2 className="text-base font-bold text-white">Danger Zone</h2>
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

      {/* New Category Modal */}
      <Modal
        isOpen={catModalOpen}
        onClose={() => {
          setCatModalOpen(false)
          setNewCatName('')
          setNewCatIcon(PRESET_ICONS[0])
          setNewCatColor(PRESET_COLORS[0])
        }}
        title="Add Category"
        size="md"
        footer={
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setCatModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={handleCreateCategory}
              isLoading={createCategory.isPending}
              disabled={!newCatName.trim()}
              className="flex-1"
            >
              Create
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-text-secondary">Category Name</label>
            <Input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Coffee, Gym, Travel"
              variant="filled"
              maxLength={30}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-text-secondary">Icon</label>
            <div className="grid grid-cols-8 gap-1.5">
              {PRESET_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setNewCatIcon(icon)}
                  className={cn(
                    'w-full aspect-square rounded-lg flex items-center justify-center text-lg transition-all',
                    newCatIcon === icon
                      ? 'bg-primary-500/20 border-2 border-primary-500'
                      : 'bg-neutral-800 border-2 border-transparent hover:border-neutral-600'
                  )}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-text-secondary">Color</label>
            <div className="grid grid-cols-5 gap-1.5">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewCatColor(color)}
                  className={cn(
                    'w-full aspect-square rounded-lg transition-all',
                    newCatColor === color
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-neutral-900'
                      : 'hover:scale-110'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-800 border border-[#262626]">
            <span
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${newCatColor}26` }}
            >
              <span className="text-lg">{newCatIcon}</span>
            </span>
            <div>
              <span className="text-sm font-semibold text-white">
                {newCatName || 'Category Name'}
              </span>
              <p className="text-xs text-text-tertiary">Preview</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
