import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AuthShell } from '@/components/layout/AuthShell'
import { useDemoLogin, useLogin } from '@/hooks/useQueries'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useLogin()
  const demo = useDemoLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login.mutate({ email, password }, { onSuccess: () => navigate('/dashboard') })
  }

  return (
    <AuthShell title="Welcome" accent="back" subtitle="Your budgets, forecasts and insights are right where you left them.">
      <div className="rounded-[var(--radius-3xl)] border border-line bg-surface/90 p-6 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)] backdrop-blur sm:p-8">
        <h2 className="text-xl font-semibold text-text-primary">Sign in</h2>
        <p className="mt-1 text-sm text-text-secondary">Continue to your PennyWise account.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input label="Email" type="email" autoComplete="email" leftIcon={<Mail className="h-4 w-4" />} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            leftIcon={<Lock className="h-4 w-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <Button type="submit" size="lg" className="w-full" isLoading={login.isPending}>
            Sign in
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-text-tertiary">
          <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
        </div>
        <Button variant="outline" size="lg" className="w-full" icon={<Sparkles className="h-4 w-4" />} isLoading={demo.isPending} onClick={() => demo.mutate(undefined, { onSuccess: () => navigate('/dashboard') })}>
          Explore the live demo
        </Button>

        <p className="mt-6 text-center text-sm text-text-secondary">
          New here?{' '}
          <Link to="/register" className="font-semibold text-primary-400 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
