import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useAuthStore } from '@/stores/auth.store'
import { useLogin } from '@/hooks/useQueries'

export function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const login = useLogin()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data } = await login.mutateAsync({ email, password })
      setAuth(data.token, data.user)
      navigate('/dashboard')
    } catch {
      // error handled in hook
    }
  }

  return (
    <div className="min-h-screen flex bg-[#0A0A0A]">
      {/* LEFT PANEL — Brand (desktop only) */}
      <div className="hidden lg:flex lg:w-2/5 bg-[#0A0A0A] flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary-500/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-primary-500/5 translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-20 left-8 w-32 h-32 rounded-full bg-primary-400/10 blur-2xl" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
            <span className="text-[#0A0A0A] font-bold text-xl">P</span>
          </div>
          <span className="text-white font-semibold text-xl">PennyWise</span>
        </div>

        {/* Headline */}
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
            Take control of your finances
          </h2>
          <p className="text-white/60 text-base leading-relaxed">
            Track every expense, set smart budgets, and get AI-powered insights that help you save more every month.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL — Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md animate-scale-in">
          <Card variant="dark" padding="lg">
            {/* Mobile logo (hidden on desktop) */}
            <div className="flex lg:hidden items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                <span className="text-[#0A0A0A] font-bold text-sm">P</span>
              </div>
              <span className="font-semibold text-lg text-white">PennyWise</span>
            </div>

            <h1 className="text-xl font-bold text-white mb-1">Welcome back</h1>
            <p className="text-sm text-text-secondary mb-6">Sign in to continue to your account</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                variant="filled"
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                variant="filled"
              />
              <Button type="submit" variant="gradient" className="w-full" isLoading={login.isPending}>
                Sign In
              </Button>
            </form>

            <p className="text-center text-sm text-text-secondary mt-6">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-primary-400 hover:text-primary-500 font-medium transition-colors">
                Sign up
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
