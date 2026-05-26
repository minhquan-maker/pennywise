import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useAuthStore } from '@/stores/auth.store'
import { AppLayout } from '@/components/layout/AppLayout'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { TransactionsPage } from '@/pages/TransactionsPage'
import { BudgetPage } from '@/pages/BudgetPage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { AboutPage } from '@/pages/AboutPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <AppLayout>{children}</AppLayout>
}

function AppRoutes() {
  const token = useAuthStore((s) => s.token)
  const location = useLocation()

  return (
    <div key={location.pathname} className="animate-fade-in">
      <Routes location={location}>
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={token ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
        />
        <Route path="/dashboard"    element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
        <Route path="/budget"       element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} />
        <Route path="/analytics"    element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/settings"     element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/about"       element={<AboutPage />} />
        <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="*"            element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          theme="light"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: 'var(--color-surface-0)',
              border: '1px solid var(--color-surface-border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-sans)',
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
