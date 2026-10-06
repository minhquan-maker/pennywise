import { useEffect, type ReactNode } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { LayoutGrid, ReceiptText, Target, LineChart, Settings, LogOut, Plus, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { TransactionModal } from '@/components/ui/TransactionModal'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutGrid },
  { to: '/transactions', label: 'Transactions', icon: ReceiptText },
  { to: '/budget', label: 'Budgets', icon: Target },
  { to: '/analytics', label: 'Analytics', icon: LineChart },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function Avatar({ name, className }: { name?: string; className?: string }) {
  return (
    <span
      className={cn(
        'flex flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-300 to-primary-700 font-bold text-forest',
        className
      )}
    >
      {name?.charAt(0).toUpperCase() ?? 'U'}
    </span>
  )
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuthStore()
  const { txnModal, openAdd, closeTxn } = useUiStore()
  const navigate = useNavigate()
  const location = useLocation()
  const qc = useQueryClient()

  const handleLogout = () => {
    qc.clear()
    logout()
    navigate('/login')
  }

  // "N" opens the add sheet from anywhere (ignored while typing)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el.closest('input, textarea, select, [contenteditable=true]') || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        openAdd()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openAdd])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  return (
    <div className="flex min-h-dvh bg-bg">
      {/* ─── Desktop sidebar ─── */}
      <aside className="sticky top-0 hidden h-dvh w-64 flex-shrink-0 flex-col border-r border-line bg-[linear-gradient(180deg,#0c1a10_0%,var(--color-bg)_60%)] px-4 py-6 lg:flex">
        <Logo to="/dashboard" className="px-2" />

        <Button className="mt-8 w-full" icon={<Plus className="h-4 w-4" strokeWidth={2.5} />} onClick={() => openAdd()}>
          New transaction
        </Button>
        <p className="mt-2 text-center text-[11px] text-text-tertiary">
          or press <kbd className="rounded border border-line-strong px-1 font-sans">N</kbd>
        </p>

        <nav className="mt-6 flex-1 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive ? 'bg-surface-3 text-text-primary' : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('h-[18px] w-[18px]', isActive && 'text-primary-400')} />
                  {label}
                  {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-500 shadow-[0_0_8px_#5cf03a]" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="rounded-[var(--radius-xl)] border border-line bg-surface p-3">
          <div className="flex items-center gap-3">
            <Avatar name={user?.name} className="h-9 w-9 text-sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text-primary">{user?.name}</p>
              <p className="truncate text-xs text-text-tertiary">{user?.isDemo ? 'Demo account' : user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              aria-label="Log out"
              className="flex h-8 w-8 items-center justify-center rounded-full text-text-tertiary transition-colors hover:bg-surface-3 hover:text-text-primary"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-bg/80 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl lg:hidden">
          <Logo to="/dashboard" />
          <Link to="/settings" aria-label="Settings">
            <Avatar name={user?.name} className="h-9 w-9 text-sm" />
          </Link>
        </header>

        {user?.isDemo && (
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-primary-500/20 bg-primary-500/8 px-4 py-2 text-center text-xs text-primary-200">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="sm:hidden">Demo data · expires in 24h</span>
            <span className="hidden sm:inline">You're exploring a demo with sample data — it expires after 24h.</span>
            <button
              onClick={() => {
                handleLogout()
                navigate('/register')
              }}
              className="font-semibold text-primary-400 underline-offset-2 hover:underline"
            >
              Create account →
            </button>
          </div>
        )}

        <main className="flex-1 pb-28 lg:pb-12">
          <div key={location.pathname} className="animate-fade-up mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
            {children}
          </div>
        </main>
      </div>

      {/* ─── Mobile tab bar ─── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 items-center px-2">
          {navItems.slice(0, 2).map((item) => (
            <TabLink key={item.to} {...item} />
          ))}
          <div className="flex justify-center">
            <button
              onClick={() => openAdd()}
              aria-label="Add transaction"
              className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-forest shadow-[0_10px_30px_-6px_rgba(92,240,58,0.7)] transition-transform active:scale-90"
            >
              <Plus className="h-6 w-6" strokeWidth={2.75} />
            </button>
          </div>
          {navItems.slice(2, 4).map((item) => (
            <TabLink key={item.to} {...item} />
          ))}
        </div>
      </nav>

      <TransactionModal isOpen={txnModal.open} onClose={closeTxn} initialData={txnModal.edit} defaultType={txnModal.type} />
    </div>
  )
}

function TabLink({ to, label, icon: Icon }: (typeof navItems)[number]) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors',
          isActive ? 'text-primary-400' : 'text-text-tertiary'
        )
      }
    >
      <Icon className="h-[22px] w-[22px]" />
      {label}
    </NavLink>
  )
}
