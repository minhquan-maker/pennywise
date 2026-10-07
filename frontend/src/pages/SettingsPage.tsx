import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AlertTriangle, Database, Download, KeyRound, LogOut, Pencil, Plus, Tag, Trash2, User } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuthStore } from '@/stores/auth.store'
import { budgetService, transactionService } from '@/lib/services'
import {
  useCategories,
  useChangePassword,
  useCreateCategory,
  useDeleteAccount,
  useDeleteCategory,
  useExportCSV,
  useUpdateCategory,
  useUpdateProfile,
} from '@/hooks/useQueries'
import { apiError, cn, getPasswordStrength } from '@/lib/utils'
import { CATEGORY_ICONS, ICON_KEYS, resolveCategoryKey } from '@/lib/categoryIcons'
import type { Category, TxType } from '@/types'

// Categorical order validated for colour-vision deficiency on the white surface, then brand greens and neutrals
const PRESET_COLORS = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#9085e9', '#7cc84a', '#e66767', '#8a958c']

type CatForm = { open: boolean; editing: Category | null; name: string; icon: string; color: string; type: TxType }

export function SettingsPage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: categories = [], isLoading: catsLoading } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()
  const deleteAccount = useDeleteAccount()
  const exportCsv = useExportCSV()

  const [name, setName] = useState(user?.name || '')
  const [currency, setCurrency] = useState(user?.currency || 'USD')
  const [pw, setPw] = useState({ current: '', next: '' })
  const [catTab, setCatTab] = useState<TxType>('expense')
  const [catForm, setCatForm] = useState<CatForm>({ open: false, editing: null, name: '', icon: 'utensils', color: PRESET_COLORS[0], type: 'expense' })
  const [confirm, setConfirm] = useState<'clear' | 'delete' | null>(null)
  const [catToDelete, setCatToDelete] = useState<Category | null>(null)

  const clearAll = useMutation({
    mutationFn: async () => {
      await transactionService.clear()
      await budgetService.clear()
    },
    onSuccess: () => {
      qc.invalidateQueries()
      setConfirm(null)
      toast.success('All transactions and budgets cleared')
    },
    onError: (err) => toast.error(apiError(err, 'Failed to clear data')),
  })

  const strength = getPasswordStrength(pw.next)
  const profileDirty = name.trim() !== user?.name || currency !== user?.currency

  const openCat = (cat: Category | null) =>
    setCatForm({
      open: true,
      editing: cat,
      name: cat?.name ?? '',
      icon: cat?.icon ?? 'utensils',
      color: cat?.color ?? PRESET_COLORS[0],
      type: cat?.type ?? catTab,
    })
  const closeCat = () => setCatForm((f) => ({ ...f, open: false }))

  const saveCat = () => {
    const data = { name: catForm.name.trim(), icon: catForm.icon, color: catForm.color }
    if (!data.name) return
    if (catForm.editing) updateCategory.mutate({ id: catForm.editing.id, data }, { onSuccess: closeCat })
    else createCategory.mutate({ ...data, type: catForm.type }, { onSuccess: closeCat })
  }

  const shownCats = categories.filter((c) => c.type === catTab)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader eyebrow="Account" title="Settings" />

      {/* Profile */}
      <Card>
        <CardHeader title="Profile" subtitle={user?.isDemo ? 'Demo account' : user?.email} icon={<User className="h-4 w-4" />} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Display name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
          <Select label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="USD">USD — US Dollar ($)</option>
            <option value="VND">VND — Vietnamese Đồng (₫)</option>
          </Select>
        </div>
        <p className="mt-3 text-xs text-text-tertiary">Changing currency relabels amounts; it doesn't convert existing values.</p>
        <div className="mt-5 flex justify-end">
          <Button disabled={!profileDirty || !name.trim()} isLoading={updateProfile.isPending} onClick={() => updateProfile.mutate({ name: name.trim(), currency })}>
            Save profile
          </Button>
        </div>
      </Card>

      {/* Security */}
      {!user?.isDemo && (
        <Card>
          <CardHeader title="Password" subtitle="Use at least 8 characters" icon={<KeyRound className="h-4 w-4" />} />
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault()
              changePassword.mutate({ current: pw.current, next: pw.next }, { onSuccess: () => setPw({ current: '', next: '' }) })
            }}
          >
            <Input label="Current password" type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} />
            <div>
              <Input label="New password" type="password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} />
              {pw.next && (
                <div className="mt-2 flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} className={cn('h-1 flex-1 rounded-full', i < strength ? (strength >= 3 ? 'bg-positive' : 'bg-warning-500') : 'bg-surface-3')} />
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end sm:col-span-2">
              <Button type="submit" variant="secondary" disabled={!pw.current || pw.next.length < 8} isLoading={changePassword.isPending}>
                Update password
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Categories */}
      <Card>
        <CardHeader
          title="Categories"
          subtitle="Organise spending and income"
          icon={<Tag className="h-4 w-4" />}
          action={
            <Button size="sm" variant="outline" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => openCat(null)}>
              New
            </Button>
          }
        />
        <SegmentedControl
          value={catTab}
          onChange={setCatTab}
          size="sm"
          className="mb-4"
          options={[
            { value: 'expense', label: 'Spending' },
            { value: 'income', label: 'Income' },
          ]}
        />
        {catsLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {shownCats.map((c) => (
              <li key={c.id} className="flex items-center gap-3 rounded-[var(--radius-lg)] bg-surface-2 px-3 py-2.5">
                <CategoryIcon icon={c.icon} color={c.color} size="sm" />
                <span className="flex-1 truncate text-sm text-text-primary">{c.name}</span>
                {c.isDefault && <Badge label="Default" color="var(--color-text-tertiary)" size="sm" />}
                <button
                  onClick={() => openCat(c)}
                  aria-label={`Edit ${c.name}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-3 hover:text-forest"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                {!c.isDefault && (
                  <button
                    onClick={() => setCatToDelete(c)}
                    aria-label={`Delete ${c.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-danger-500/10 hover:text-danger-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Data */}
      <Card>
        <CardHeader title="Your data" subtitle="Export or reset — your account stays" icon={<Database className="h-4 w-4" />} />
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" icon={<Download className="h-4 w-4" />} isLoading={exportCsv.isPending} onClick={() => exportCsv.mutate(undefined)}>
            Export all as CSV
          </Button>
          <Button variant="ghost" className="hover:!bg-danger-500/10 hover:!text-danger-500" icon={<Trash2 className="h-4 w-4" />} onClick={() => setConfirm('clear')}>
            Clear all data
          </Button>
        </div>
      </Card>

      {/* Danger zone */}
      <Card className="border-danger-500/25">
        <CardHeader title="Danger zone" subtitle="Permanently delete your account and everything in it" icon={<AlertTriangle className="h-4 w-4 text-danger-500" />} />
        <div className="flex flex-wrap gap-2">
          <Button variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => setConfirm('delete')}>
            Delete account
          </Button>
          <Button
            variant="ghost"
            icon={<LogOut className="h-4 w-4" />}
            onClick={() => {
              qc.clear()
              logout()
              navigate('/login')
            }}
          >
            Log out
          </Button>
        </div>
      </Card>

      {/* Category editor */}
      <Modal
        isOpen={catForm.open}
        onClose={closeCat}
        title={catForm.editing ? 'Edit category' : 'New category'}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={closeCat}>
              Cancel
            </Button>
            <Button className="flex-1" disabled={!catForm.name.trim()} isLoading={createCategory.isPending || updateCategory.isPending} onClick={saveCat}>
              {catForm.editing ? 'Save' : 'Create'}
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-[var(--radius-lg)] bg-surface-3 p-3">
            <CategoryIcon icon={catForm.icon} color={catForm.color} size="lg" />
            <div>
              <p className="font-semibold text-text-primary">{catForm.name || 'Category name'}</p>
              <p className="text-xs capitalize text-text-tertiary">{catForm.type}</p>
            </div>
          </div>
          {!catForm.editing && (
            <SegmentedControl
              value={catForm.type}
              onChange={(type) => setCatForm((f) => ({ ...f, type }))}
              className="w-full"
              options={[
                { value: 'expense', label: 'Spending' },
                { value: 'income', label: 'Income' },
              ]}
            />
          )}
          <Input label="Name" value={catForm.name} maxLength={30} placeholder="e.g. Coffee, Rent, Side hustle" onChange={(e) => setCatForm((f) => ({ ...f, name: e.target.value }))} />
          <div>
            <p className="mb-2 text-[13px] font-semibold text-text-secondary">Icon</p>
            <div className="grid max-h-56 grid-cols-7 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-9">
              {ICON_KEYS.map((key) => {
                const { icon: Icon, label } = CATEGORY_ICONS[key]
                const active = resolveCategoryKey(catForm.icon) === key
                return (
                  <button
                    key={key}
                    type="button"
                    title={label}
                    aria-label={label}
                    aria-pressed={active}
                    onClick={() => setCatForm((f) => ({ ...f, icon: key }))}
                    className={cn(
                      'flex aspect-square items-center justify-center rounded-[var(--radius-sm)] border transition-all',
                      active ? 'border-forest bg-primary-100 text-forest' : 'border-transparent bg-surface-2 text-text-secondary hover:border-line-strong hover:text-forest'
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[13px] font-semibold text-text-secondary">Colour</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Colour ${color}`}
                  onClick={() => setCatForm((f) => ({ ...f, color }))}
                  className={cn('h-9 w-9 rounded-full transition-transform hover:scale-110', catForm.color === color && 'ring-2 ring-text-primary ring-offset-2 ring-offset-surface')}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!catToDelete}
        onClose={() => setCatToDelete(null)}
        onConfirm={() => catToDelete && deleteCategory.mutate(catToDelete.id, { onSettled: () => setCatToDelete(null) })}
        isLoading={deleteCategory.isPending}
        title={`Delete "${catToDelete?.name}"?`}
        description="Its budgets are removed too. Categories that still have transactions can't be deleted."
        confirmLabel="Delete"
      />
      <ConfirmDialog
        isOpen={confirm === 'clear'}
        onClose={() => setConfirm(null)}
        onConfirm={() => clearAll.mutate()}
        isLoading={clearAll.isPending}
        title="Clear all data?"
        description="Every transaction and budget is deleted. Categories and your account are kept."
        requireText="clear"
        confirmLabel="Clear everything"
      />
      <ConfirmDialog
        isOpen={confirm === 'delete'}
        onClose={() => setConfirm(null)}
        onConfirm={() => deleteAccount.mutate(undefined, { onSuccess: () => navigate('/') })}
        isLoading={deleteAccount.isPending}
        title="Delete your account?"
        description="This permanently removes your account, transactions, budgets and categories."
        requireText={user?.isDemo ? 'delete' : user?.email}
        confirmLabel="Delete forever"
      />
    </div>
  )
}
