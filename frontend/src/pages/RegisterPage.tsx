import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Lock, Mail, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AuthShell } from '@/components/layout/AuthShell'
import { useRegister } from '@/hooks/useQueries'
import { cn, getPasswordStrength } from '@/lib/utils'

const PERKS = ['Unlimited transactions & budgets', 'Forecasts and insights out of the box', 'CSV export — your data stays yours']

export function RegisterPage() {
  const navigate = useNavigate()
  const register = useRegister()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const strength = getPasswordStrength(password)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    register.mutate({ email, password, name }, { onSuccess: () => navigate('/dashboard') })
  }

  return (
    <AuthShell title="Your money journey" accent="starts here" subtitle="Track spending and income, set budgets that adapt, and see next month before it happens.">
      <div className="rounded-[var(--radius-3xl)] border border-line bg-surface/90 p-6 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)] backdrop-blur sm:p-8">
        <h2 className="text-xl font-semibold text-text-primary">Create your account</h2>
        <ul className="mt-3 space-y-1.5">
          {PERKS.map((p) => (
            <li key={p} className="flex items-center gap-2 text-[13px] text-text-secondary">
              <Check className="h-3.5 w-3.5 text-primary-400" /> {p}
            </li>
          ))}
        </ul>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input label="Name" autoComplete="name" leftIcon={<User className="h-4 w-4" />} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
          <Input label="Email" type="email" autoComplete="email" leftIcon={<Mail className="h-4 w-4" />} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          <div>
            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              leftIcon={<Lock className="h-4 w-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              minLength={8}
              required
            />
            {password && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex flex-1 gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} className={cn('h-1 flex-1 rounded-full transition-colors', i < strength ? (strength >= 3 ? 'bg-primary-500' : strength >= 2 ? 'bg-warning-500' : 'bg-danger-500') : 'bg-surface-3')} />
                  ))}
                </div>
                <span className="text-[11px] text-text-tertiary">{password.length < 8 ? 'Too short' : strength >= 3 ? 'Strong' : strength >= 2 ? 'Okay' : 'Weak'}</span>
              </div>
            )}
          </div>
          <Button type="submit" size="lg" className="w-full" isLoading={register.isPending} disabled={password.length < 8}>
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
