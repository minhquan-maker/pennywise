import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Receipt,
  Target,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Home,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard',     label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/transactions',  label: 'Transactions', icon: Receipt },
  { to: '/budget',        label: 'Budget',        icon: Target },
  { to: '/analytics',     label: 'Analytics',     icon: TrendingUp },
  { to: '/settings',      label: 'Settings',      icon: Settings },
  { to: '/about',         label: 'About us',      icon: Home },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true'
  })

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed))
  }, [collapsed])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const closeSidebar = () => setSidebarOpen(false)

  const sidebarWidth = collapsed ? 'w-16' : 'w-64'
  const labelHidden = collapsed ? 'lg:hidden' : ''

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40',
          'bg-[#0A0A0A] flex flex-col',
          'border-r border-[#262626]',
          'transform transition-all duration-200 ease-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          sidebarWidth
        )}
      >
        {/* Logo header */}
        <div className={cn(
          'relative overflow-hidden',
          !collapsed && 'px-5 py-5',
          collapsed && 'px-3 py-5 flex justify-center'
        )}>
          <div className="absolute inset-0 bg-[#0A0A0A] rounded-br-xl" />
          <div className="relative flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#BFFF00] flex items-center justify-center shadow-sm">
              <span className="text-[#0A0A0A] font-bold text-base">P</span>
            </div>
            {!collapsed && (
              <span className="font-semibold text-white text-lg tracking-tight">PennyWise</span>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeSidebar}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-neutral-800 text-primary-400'
                    : 'text-text-secondary hover:bg-neutral-800 hover:text-white',
                  collapsed && 'justify-center'
                )
              }
            >
              <Icon className={cn('h-5 w-5 flex-shrink-0')} />
              <span className={cn(collapsed && labelHidden)}>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="hidden lg:flex items-center justify-center mx-3 mb-2 h-8 rounded-lg text-text-tertiary hover:text-text-secondary hover:bg-neutral-800 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        {/* User */}
        <div className="border-t border-[#262626] px-3 py-4">
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
            <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-[#0A0A0A] font-semibold text-sm flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-text-tertiary truncate">{user?.email}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full mt-2 rounded-lg px-3 py-2 text-xs text-text-tertiary hover:bg-neutral-800 hover:text-text-secondary transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-[#0A0A0A] border-b border-[#262626]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-text-secondary hover:text-text-primary"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary-500 flex items-center justify-center">
              <span className="text-[#0A0A0A] font-bold text-xs">P</span>
            </div>
            <span className="font-semibold text-white">PennyWise</span>
          </div>
        </div>

        <main className="flex-1 overflow-auto bg-[#0A0A0A]">
          <div className="max-w-5xl mx-auto p-5 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
