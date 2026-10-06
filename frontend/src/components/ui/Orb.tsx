import { cn } from '@/lib/utils'

/** Decorative glowing ring (Tomorro "Oro" style). */
export function Orb({ className, spin = true }: { className?: string; spin?: boolean }) {
  return (
    <div className={cn('relative isolate aspect-square', className)} aria-hidden>
      <div className={cn('orb absolute inset-0', spin && 'animate-orb')} />
    </div>
  )
}

/** Score ring 0–100 with a glow; used for the financial health score. */
export function ScoreRing({
  value,
  size = 168,
  stroke = 12,
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
  const color = pct >= 60 ? '#5cf03a' : pct >= 40 ? '#ffc24b' : '#ff6b5b'
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="absolute inset-[12%] rounded-full blur-2xl"
        style={{ background: `radial-gradient(circle, ${color}55, transparent 70%)` }}
      />
      <svg width={size} height={size} className="relative -rotate-90">
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
          style={{ transition: 'stroke-dashoffset 1.2s var(--ease-out)', filter: `drop-shadow(0 0 8px ${color}88)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="display text-5xl text-text-primary">{Math.round(pct)}</span>
        {label && <span className="mt-1 text-xs font-semibold" style={{ color }}>{label}</span>}
        {sublabel && <span className="text-[11px] text-text-tertiary">{sublabel}</span>}
      </div>
    </div>
  )
}
