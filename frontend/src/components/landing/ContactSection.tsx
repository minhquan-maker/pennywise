import { useState } from 'react'
import { ArrowUpRight, CheckCircle2, GitBranch, Globe, Mail, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useSendContact } from '@/hooks/useQueries'
import { cn } from '@/lib/utils'

const TOPICS = [
  { value: 'general', label: 'General' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'bug', label: 'Bug report' },
  { value: 'partnership', label: 'Partnership' },
] as const

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL as string | undefined

const CHANNELS = [
  ...(CONTACT_EMAIL ? [{ icon: Mail, label: 'Email', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` }] : []),
  { icon: GitBranch, label: 'GitHub', value: 'minhquan-maker/pennywise', href: 'https://github.com/minhquan-maker/pennywise' },
  { icon: Globe, label: 'Author', value: 'minhquannguyen.vercel.app', href: 'https://minhquannguyen.vercel.app' },
]

// Light inputs for the cream section
const field =
  'block w-full rounded-[var(--radius-md)] border border-forest/10 bg-white/80 px-4 text-[15px] text-forest placeholder:text-forest/40 ' +
  'transition-colors focus:border-forest/40 focus:outline-none focus:ring-4 focus:ring-forest/5'

export function ContactSection() {
  const send = useSendContact()
  const [form, setForm] = useState({ name: '', email: '', topic: 'general', message: '', website: '' })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    send.mutate(form, { onSuccess: () => setForm({ name: '', email: '', topic: 'general', message: '', website: '' }) })
  }

  return (
    <section id="contact" className="bg-cream px-5 pb-24 text-forest">
      <div className="mx-auto grid max-w-6xl gap-10 rounded-[var(--radius-3xl)] bg-forest p-6 text-text-primary sm:p-12 lg:grid-cols-[1fr_1.15fr]">
        <div className="flex flex-col justify-between gap-10">
          <div>
            <p className="eyebrow text-primary-400">Contact</p>
            <h2 className="display mt-3 text-5xl sm:text-6xl">
              Let&apos;s <span className="text-primary-500">talk</span>
            </h2>
            <p className="mt-4 max-w-sm text-text-secondary">
              Questions, feedback, a bug, or an idea for the iOS app — send a message and we&apos;ll reply by email.
            </p>
          </div>
          <ul className="space-y-3">
            {CHANNELS.map((c) => (
              <li key={c.label}>
                <a
                  href={c.href}
                  target={c.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-[var(--radius-xl)] border border-line bg-surface/60 p-4 transition-colors hover:border-primary-500/50"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/12 text-primary-400">
                    <c.icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs text-text-tertiary">{c.label}</span>
                    <span className="block truncate text-sm font-semibold">{c.value}</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-text-tertiary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary-400" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[var(--radius-2xl)] bg-cream p-6 text-forest sm:p-8">
          {send.isSuccess ? (
            <div className="flex h-full min-h-[360px] flex-col items-center justify-center text-center">
              <CheckCircle2 className="h-12 w-12 text-primary-700" />
              <p className="display mt-4 text-4xl">Message sent</p>
              <p className="mt-2 max-w-xs text-sm text-forest/60">Thanks for reaching out — we&apos;ll get back to you by email.</p>
              <Button variant="dark" size="sm" className="mt-6" onClick={() => send.reset()}>
                Send another
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4" noValidate={false}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-[13px] font-semibold">
                  Name
                  <input required maxLength={80} value={form.name} onChange={set('name')} placeholder="Your name" className={cn(field, 'mt-1.5 h-12')} />
                </label>
                <label className="block text-[13px] font-semibold">
                  Email
                  <input required type="email" maxLength={120} value={form.email} onChange={set('email')} placeholder="you@example.com" className={cn(field, 'mt-1.5 h-12')} />
                </label>
              </div>
              <fieldset>
                <legend className="text-[13px] font-semibold">Topic</legend>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {TOPICS.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      aria-pressed={form.topic === t.value}
                      onClick={() => setForm((f) => ({ ...f, topic: t.value }))}
                      className={cn(
                        'rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors',
                        form.topic === t.value ? 'bg-forest text-white' : 'bg-forest/6 text-forest/70 hover:bg-forest/10'
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="block text-[13px] font-semibold">
                Message
                <textarea
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={5}
                  value={form.message}
                  onChange={set('message')}
                  placeholder="How can we help?"
                  className={cn(field, 'mt-1.5 resize-none py-3')}
                />
              </label>
              {/* Honeypot — hidden from people, bots fill it */}
              <input type="text" name="website" value={form.website} onChange={set('website')} tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-forest/50">{form.message.length}/2000</span>
                <Button type="submit" variant="dark" icon={<Send className="h-4 w-4" />} isLoading={send.isPending}>
                  Send message
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
