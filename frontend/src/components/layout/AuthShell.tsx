import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { Orb } from '@/components/ui/Orb'

/** Split auth layout: big display headline + orb on the left, form card on the right (Tomorro style). */
export function AuthShell({ title, accent, subtitle, children }: { title: string; accent: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="glow-top relative flex min-h-dvh flex-col overflow-hidden">
      <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-10">
        <Logo />
        <Link to="/" className="text-sm text-text-secondary transition-colors hover:text-text-primary">
          ← Back home
        </Link>
      </header>
      <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-5 pb-12 sm:px-10 lg:grid-cols-2">
        <div className="hidden lg:block">
          <Orb className="mb-10 w-40" />
          <h1 className="display text-7xl text-text-primary">
            {title} <span className="text-primary-500">{accent}</span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-text-secondary">{subtitle}</p>
        </div>
        <div className="animate-fade-up mx-auto w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <h1 className="display text-5xl text-text-primary">
              {title} <span className="text-primary-500">{accent}</span>
            </h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
