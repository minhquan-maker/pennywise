import { Cpu, Sparkles } from 'lucide-react'
import type { AiSource } from '@/types'

/** Shows whether a result came from the LLM or the on-device finance engine. */
export function SourceTag({ source }: { source?: AiSource }) {
  if (!source) return null
  return source === 'ai' ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary-500/12 px-2 py-0.5 text-[11px] font-semibold text-primary-400">
      <Sparkles className="h-3 w-3" /> AI
    </span>
  ) : (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-surface-3 px-2 py-0.5 text-[11px] font-semibold text-text-secondary"
      title="Calculated by PennyWise's finance engine (no AI key configured)"
    >
      <Cpu className="h-3 w-3" /> Engine
    </span>
  )
}
