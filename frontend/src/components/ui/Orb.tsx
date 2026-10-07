import { cn } from '@/lib/utils'

/** Decorative flat "coin": a lime disc stamped with the PennyWise mark and a slowly turning milled edge. */
export function Orb({ className, spin = true }: { className?: string; spin?: boolean }) {
  return (
    <div className={cn('relative aspect-square', className)} aria-hidden>
      <svg viewBox="0 0 200 200" className="h-full w-full">
        <circle cx="100" cy="100" r="98" fill="var(--color-primary-500)" />
        <g className={cn(spin && 'animate-orb')} style={{ transformOrigin: '100px 100px' }}>
          <circle cx="100" cy="100" r="86" fill="none" stroke="var(--color-forest)" strokeWidth="3" strokeDasharray="1 9" strokeLinecap="round" />
        </g>
        <circle cx="100" cy="100" r="74" fill="none" stroke="var(--color-forest)" strokeWidth="2.5" />
        <circle cx="100" cy="100" r="36" fill="none" stroke="var(--color-forest)" strokeWidth="15" />
        <circle cx="100" cy="100" r="11" fill="var(--color-forest)" />
      </svg>
    </div>
  )
}

/** Score ring 0–100; used for the financial health score. Status always comes with a text label. */
export function ScoreRing({
  value,
  size = 168,
  stroke = 14,
  label,
  sublabel,
}: {
  value: number
  size?: number
  stroke?: number
  label?: string
  sublabel?: string
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, value))
  const color = pct >= 60 ? 'var(--color-positive)' : pct >= 40 ? 'var(--color-warning-500)' : 'var(--color-danger-500)'
  const chip = pct >= 60 ? 'bg-primary-500 text-forest' : pct >= 40 ? 'bg-warning-500/12 text-warning-600' : 'bg-danger-500/10 text-danger-500'
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-surface-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
          style={{ transition: 'stroke-dashoffset 1.2s var(--ease-out)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="display num text-5xl text-text-primary">{Math.round(pct)}</span>
        {label && <span className={cn('mt-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold', chip)}>{label}</span>}
        {sublabel && <span className="text-[11px] text-text-tertiary">{sublabel}</span>}
      </div>
    </div>
  )
}
