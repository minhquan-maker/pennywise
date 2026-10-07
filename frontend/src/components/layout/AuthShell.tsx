import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { Orb } from '@/components/ui/Orb'

/** Split auth layout: a forest panel with the block-letter headline on the left, the form on white to the right. */
export function AuthShell({ title, accent, subtitle, children }: { title: string; accent: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className="flex items-center justify-between px-5 py-5 sm:px-10">
        <Logo />
        <Link to="/" className="text-sm font-semibold text-forest underline-offset-4 hover:underline">
          ← Back home
        </Link>
      </header>
      <div className="mx-auto grid w-full max-w-6xl flex-1 items-stretch gap-10 px-5 pb-10 sm:px-10 lg:grid-cols-2">
        <div className="relative hidden flex-col justify-between overflow-hidden rounded-[var(--radius-3xl)] bg-forest p-10 lg:flex">
          <Orb className="w-32" />
          <div>
            <h1 className="display text-[64px] text-white xl:text-[76px]">
              {title} <span className="text-primary-500">{accent}</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-white/75">{subtitle}</p>
          </div>
          <Orb className="pointer-events-none absolute -right-24 -top-24 w-72 opacity-15" spin={false} />
        </div>
        <div className="animate-fade-up mx-auto flex w-full max-w-md flex-col justify-center">
          <div className="mb-8 text-center lg:hidden">
            <h1 className="display text-[44px] text-text-primary">
              {title} <span className="mark">{accent}</span>
            </h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
